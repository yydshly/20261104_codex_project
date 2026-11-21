const firstCity = { name: '北京', latitude: 39.9042, longitude: 116.4074 };
const storageKey = 'spatial-desk-weather-city';

export function bindWeather(onUpdate) {
  const form = document.querySelector('#weather-search');
  const input = document.querySelector('#weather-query');
  const matches = document.querySelector('#weather-matches');
  const searchStatus = document.querySelector('#weather-search-status');
  const status = document.querySelector('#weather-status');
  let city = savedCity();
  let candidates = [];
  let searchId = 0;
  let weatherId = 0;
  let latest;

  function show(data) {
    onUpdate(data);
    status.textContent = data.temperature == null
      ? `${data.city} · ${data.label}`
      : [data.city, `${data.temperature}°`, data.label,
        data.humidity == null ? '' : `室外湿度 ${data.humidity}%`,
        data.stale ? '上次更新' : ''].filter(Boolean).join(' · ');
  }

  async function refresh() {
    const id = ++weatherId;
    const { name, latitude, longitude } = city;
    if (!latest) show({ city: name, label: '正在获取天气' });
    const params = new URLSearchParams({
      latitude, longitude, timezone: 'auto', forecast_days: '1',
      current: 'temperature_2m,weather_code,relative_humidity_2m',
      daily: 'temperature_2m_max,temperature_2m_min,precipitation_probability_max',
    });

    try {
      const { current, daily } = await readJson('https://api.open-meteo.com/v1/forecast?' + params);
      if (id !== weatherId) return;
      if (!Number.isFinite(current?.temperature_2m)) throw new Error('Missing temperature');
      latest = {
        city: name, label: condition(current.weather_code), temperature: rounded(current.temperature_2m),
        humidity: rounded(current.relative_humidity_2m),
        low: rounded(daily?.temperature_2m_min?.[0]), high: rounded(daily?.temperature_2m_max?.[0]),
        rain: rounded(daily?.precipitation_probability_max?.[0]),
      };
      show(latest);
    } catch {
      if (id !== weatherId) return;
      show(latest ? { ...latest, stale: true } : { city: name, label: '暂时无法更新' });
    }
  }

  function choose(place) {
    city = { name: place.name, latitude: place.latitude, longitude: place.longitude };
    try { localStorage.setItem(storageKey, JSON.stringify(city)); } catch { /* optional persistence */ }
    matches.hidden = true;
    input.value = '';
    searchStatus.textContent = '';
    latest = undefined;
    void refresh();
  }

  form.addEventListener('submit', async event => {
    event.preventDefault();
    const query = input.value.trim();
    if (query.length < 2) {
      searchStatus.textContent = '请输入至少两个字符。';
      return;
    }
    const id = ++searchId;
    matches.hidden = true;
    searchStatus.textContent = '正在搜索城市…';
    try {
      const params = new URLSearchParams({ name: query, language: 'zh', count: '6' });
      const { results } = await readJson('https://geocoding-api.open-meteo.com/v1/search?' + params);
      if (id !== searchId) return;
      candidates = (results ?? []).filter(validCity);
      if (!candidates.length) {
        searchStatus.textContent = '没有找到城市，可以试试拼音。';
        return;
      }
      if (candidates.length === 1) {
        choose(candidates[0]);
        return;
      }
      matches.replaceChildren(new Option('选择匹配的城市', ''), ...candidates.map((place, index) =>
        new Option([...new Set([place.name, place.admin1, place.country].filter(Boolean))].join(' · '), String(index))));
      matches.hidden = false;
      searchStatus.textContent = '';
    } catch {
      if (id === searchId) searchStatus.textContent = '暂时无法搜索城市，请稍后再试。';
    }
  });

  matches.addEventListener('change', () => {
    if (matches.value !== '') choose(candidates[Number(matches.value)]);
  });
  void refresh();
  setInterval(refresh, 15 * 60 * 1000);
}

async function readJson(url) {
  const response = await fetch(url, { signal: AbortSignal.timeout(9000) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return response.json();
}

function validCity(place) {
  return typeof place?.name === 'string' && Number.isFinite(place.latitude) && Number.isFinite(place.longitude);
}

function savedCity() {
  try {
    const place = JSON.parse(localStorage.getItem(storageKey));
    if (validCity(place)) return place;
  } catch { /* default city */ }
  return firstCity;
}

function rounded(value) {
  return Number.isFinite(value) ? Math.round(value) : null;
}

function condition(code) {
  if (code === 0) return '晴';
  if (code === 1 || code === 2) return '多云';
  if (code === 3) return '阴';
  if (code === 45 || code === 48) return '雾';
  if (code >= 51 && code <= 57) return '毛毛雨';
  if (code >= 61 && code <= 67) return '雨';
  if (code >= 71 && code <= 77) return '雪';
  if (code >= 80 && code <= 82) return '阵雨';
  if (code === 85 || code === 86) return '阵雪';
  if (code >= 95) return '雷雨';
  return '天气未分类';
}
