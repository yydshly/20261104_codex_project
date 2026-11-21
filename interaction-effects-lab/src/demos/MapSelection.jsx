import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Map as MapLibreMap, setWorkerUrl } from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url';
import coastline from './mapCoastline.json';
import quakes from './mapQuakes.json';
import { furnitureChairs, furnitureFinishes } from '../furniture.js';
import './MapSelection.css';

// Use Vite's emitted worker URL in both the dev server and the production build.
setWorkerUrl(workerUrl);

const SHOWROOMS = [
  { id: 'hayes', name: 'Hayes Valley 展厅', area: '旧金山 · Hayes Valley', coordinates: [-122.424, 37.777], samples: { siena: ['clay', 'olive'], alba: ['olive'], cove: ['oat'] } },
  { id: 'marina', name: 'Marina 展厅', area: '旧金山 · Marina', coordinates: [-122.438, 37.801], samples: { lune: ['ivory'], arco: ['slate'] } },
  { id: 'mission', name: 'Mission 展厅', area: '旧金山 · Mission', coordinates: [-122.417, 37.757], samples: { siena: ['ivory'], nola: ['clay'], alba: ['oat'] } },
  { id: 'sunset', name: 'Sunset 展厅', area: '旧金山 · Sunset', coordinates: [-122.477, 37.762], samples: { siena: ['olive'], cove: ['clay'] } },
  { id: 'berkeley', name: 'Berkeley 展厅', area: '东湾 · Berkeley', coordinates: [-122.272, 37.869], samples: { siena: ['clay'], nola: ['rose'], arco: ['ivory'] } },
  { id: 'oakland', name: 'Uptown 展厅', area: '东湾 · Oakland', coordinates: [-122.269, 37.813], samples: { alba: ['olive', 'slate'], nola: ['slate'] } },
  { id: 'alameda', name: 'Alameda 展厅', area: '东湾 · Alameda', coordinates: [-122.243, 37.765], samples: { siena: ['olive'], cove: ['oat', 'olive'] } },
  { id: 'sausalito', name: 'Sausalito 展厅', area: '北湾 · Sausalito', coordinates: [-122.484, 37.858], samples: { siena: ['ivory'], lune: ['ivory', 'oat'] } },
  { id: 'mill-valley', name: 'Mill Valley 展厅', area: '北湾 · Mill Valley', coordinates: [-122.545, 37.907], samples: { arco: ['slate'], lune: ['rose'] } },
];

const filters = [['all', '全部展厅'], ['chair', '可试坐当前款'], ['exact', '同款同面料']];

function showroomMatch(point, chairId, finishId) {
  const finishes = point.samples[chairId];
  if (!finishes) return 'none';
  return finishes.includes(finishId) ? 'exact' : 'chair';
}

const matchLabels = { exact: '同款同面料', chair: '同款其他面料', none: '暂无该款' };

const SCENES = {
  original: {
    points: quakes, bounds: [[-125.1, 34.3], [-117.4, 41.8]],
    center: [-121.4, 38], clusterMaxZoom: 10, water: '#101f2b', land: '#1d3441', shore: '#426271',
    clusters: ['#82d9ed', '#efcd76', '#efa783'], pin: '#f3c595', text: '#102431', label: '#a8c6cc',
    labels: [['PACIFIC OCEAN', -124.8, 36.7], ['CALIFORNIA', -119.7, 37.1], ['NEVADA', -117.7, 39.7]],
  },
  product: {
    points: SHOWROOMS, bounds: [[-122.57, 37.727], [-122.221, 37.926]],
    center: [-122.39, 37.82], clusterMaxZoom: 13, water: '#dae5e4', land: '#f1eee4', shore: '#aabcb7',
    clusters: ['#346655', '#284f42', '#284f42'], pin: '#32624d', text: '#ffffff', label: '#536963',
    labels: [['SAN FRANCISCO', -122.453, 37.737], ['OAKLAND', -122.226, 37.804], ['SAN FRANCISCO BAY', -122.34, 37.813], ['PACIFIC OCEAN', -122.566, 37.766]],
  },
};

const pointCollection = (points) => ({
  type: 'FeatureCollection',
  features: points.map(({ id, coordinates }) => ({
    type: 'Feature', properties: { key: id }, geometry: { type: 'Point', coordinates },
  })),
});

function createStyle(scene) {
  const [small, medium, large] = scene.clusters;
  return {
    version: 8,
    sources: {
      coast: { type: 'geojson', data: coastline, attribution: '底图 © Natural Earth（公有领域）', maxzoom: 14 },
      labels: {
        type: 'geojson', data: {
          type: 'FeatureCollection',
          features: scene.labels.map(([label, lng, lat]) => ({
            type: 'Feature', properties: { label }, geometry: { type: 'Point', coordinates: [lng, lat] },
          })),
        },
      },
      locations: {
        type: 'geojson', data: pointCollection(scene.points), cluster: true,
        clusterRadius: 42, clusterMaxZoom: scene.clusterMaxZoom, maxzoom: scene.clusterMaxZoom + 1,
      },
    },
    layers: [
      { id: 'water', type: 'background', paint: { 'background-color': scene.water } },
      { id: 'land', source: 'coast', type: 'fill', paint: { 'fill-color': scene.land } },
      { id: 'shore', source: 'coast', type: 'line', paint: { 'line-color': scene.shore, 'line-width': 1 } },
      {
        id: 'labels', source: 'labels', type: 'symbol',
        layout: { 'text-field': ['get', 'label'], 'text-font': ['Arial'], 'text-size': 10, 'text-letter-spacing': .18, 'text-padding': 8 },
        paint: { 'text-color': scene.label, 'text-opacity': .86 },
      },
      {
        id: 'clusters', source: 'locations', type: 'circle', filter: ['has', 'point_count'],
        paint: {
          'circle-color': ['step', ['get', 'point_count'], small, 12, medium, 40, large],
          'circle-radius': ['step', ['get', 'point_count'], 18, 12, 22, 40, 27],
          'circle-stroke-color': scene.water, 'circle-stroke-width': 2,
        },
      },
      {
        id: 'counts', source: 'locations', type: 'symbol', filter: ['has', 'point_count'],
        layout: { 'text-field': ['get', 'point_count_abbreviated'], 'text-font': ['Arial Bold'], 'text-size': 13, 'text-allow-overlap': true },
        paint: { 'text-color': scene.text },
      },
      {
        id: 'points', source: 'locations', type: 'circle', filter: ['!', ['has', 'point_count']],
        paint: { 'circle-radius': 7, 'circle-color': scene.pin, 'circle-stroke-color': scene.water, 'circle-stroke-width': 2 },
      },
      {
        id: 'active-point', source: 'locations', type: 'circle', filter: ['==', ['get', 'key'], ''],
        paint: { 'circle-radius': 13, 'circle-color': scene.pin, 'circle-opacity': .35, 'circle-stroke-color': scene.pin, 'circle-stroke-width': 2 },
      },
    ],
  };
}

function fitScene(map, scene) {
  map.fitBounds(scene.bounds, { padding: 38, animate: false });
}

const quakeTime = new Intl.DateTimeFormat('zh-CN', { timeZone: 'UTC', dateStyle: 'medium', timeStyle: 'short' });

export default function MapSelection({ mode, furniture }) {
  const product = mode === 'product';
  const scene = SCENES[mode];
  const chair = furniture?.chair ?? furnitureChairs[0];
  const finish = furniture?.finish ?? furnitureFinishes[0];
  const host = useRef(null);
  const mapRef = useRef(null);
  const actionRevision = useRef(0);
  const visiblePoints = useRef(scene.points);
  const replacingPoints = useRef(false);
  const [ready, setReady] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [activeId, setActiveId] = useState(null);
  const [filter, setFilter] = useState('all');
  const locations = useMemo(() => {
    if (!product || filter === 'all') return scene.points;
    return scene.points.filter((point) => {
      const match = showroomMatch(point, chair.id, finish.id);
      return filter === 'exact' ? match === 'exact' : match !== 'none';
    });
  }, [chair.id, filter, finish.id, product, scene]);
  const active = locations.find((point) => point.id === activeId);
  const activeFinishes = product && active?.samples[chair.id];

  useEffect(() => {
    let map;
    try {
      map = new MapLibreMap({
        container: host.current, style: createStyle(scene), center: scene.center, zoom: product ? 9 : 5,
        attributionControl: false, renderWorldCopies: false, dragRotate: false, pitchWithRotate: false,
        scrollZoom: false, minZoom: product ? 7 : 4, maxZoom: product ? 17 : 14,
      });
    } catch {
      setUnavailable(true);
      return;
    }

    mapRef.current = map;
    const canvas = map.getCanvas();
    canvas.setAttribute('aria-label', '可交互地图。方向键平移，加号与减号缩放，也可使用点位列表。');
    map.touchZoomRotate.disableRotation();
    let alive = true;
    const interactiveLayers = ['points', 'clusters'];

    function renderedPoint(event) {
      return map.queryRenderedFeatures(event.point, { layers: interactiveLayers })[0];
    }

    function onMove(event) {
      canvas.style.cursor = renderedPoint(event) ? 'pointer' : '';
    }

    async function onClick(event) {
      if (replacingPoints.current) return;
      const feature = renderedPoint(event);
      if (!feature) return;
      const revision = ++actionRevision.current;
      if (!feature.properties.cluster) {
        const id = feature.properties.key;
        if (!product || visiblePoints.current.some((point) => point.id === id)) {
          setActiveId(id);
        }
        return;
      }
      const source = map.getSource('locations');
      try {
        const zoom = await source.getClusterExpansionZoom(feature.properties.cluster_id);
        if (alive && revision === actionRevision.current) {
          map.easeTo({ center: feature.geometry.coordinates, zoom });
        }
      } catch {
        // A filter may replace the cluster while its expansion zoom is being calculated.
      }
    }

    map.once('load', () => {
      fitScene(map, scene);
      map.on('mousemove', onMove);
      map.on('click', onClick);
      setReady(true);
    });

    const resize = new ResizeObserver(() => map.resize());
    resize.observe(host.current);

    return () => {
      alive = false;
      resize.disconnect();
      mapRef.current = null;
      map.remove();
    };
  }, [product, scene]);

  useLayoutEffect(() => {
    visiblePoints.current = locations;
    const map = mapRef.current;
    if (!ready || !product || !map) return;
    actionRevision.current += 1;
    replacingPoints.current = true;
    const dataReady = () => { replacingPoints.current = false; };
    map.once('idle', dataReady);
    map.getSource('locations').setData(pointCollection(locations));
    return () => map.off('idle', dataReady);
  }, [locations, product, ready]);

  useEffect(() => {
    if (!ready) return;
    mapRef.current?.setFilter('active-point', ['==', ['get', 'key'], active?.id ?? '']);
  }, [active, ready]);

  function selectFromList(id) {
    actionRevision.current += 1;
    setActiveId(id || null);
    const point = scene.points.find((candidate) => candidate.id === id);
    const map = mapRef.current;
    if (point && ready && map) {
      map.easeTo({ center: point.coordinates, zoom: Math.max(map.getZoom(), scene.clusterMaxZoom + 1) });
    }
  }

  function changeFilter(next) {
    if (next === filter) return;
    if (next !== 'all' && active) {
      const match = showroomMatch(active, chair.id, finish.id);
      if (match === 'none' || (next === 'exact' && match !== 'exact')) setActiveId(null);
    }
    setFilter(next);
    if (ready && mapRef.current) fitScene(mapRef.current, scene);
  }

  function changeView(action) {
    actionRevision.current += 1;
    if (mapRef.current) action(mapRef.current);
  }

  return (
    <section className={`map-selection${product ? ' map-selection--product' : ''}`}
      aria-label={product ? `${chair.name} 展厅地图` : '地震点位聚合'}
      data-chair={product ? chair.id : undefined} data-finish={product ? finish.id : undefined}>
      <div className="map-selection__visual">
        <div className="map-selection__canvas" ref={host} />
        {unavailable && <p className="map-selection__fallback" role="status">当前设备无法渲染地图，可继续在列表里查看点位。</p>}
        <div className="map-selection__tag">
          <span aria-hidden="true" />
          {product ? 'BAY AREA / 展厅示例' : 'PACIFIC COAST / 历史样本'}
        </div>
        <div className="map-selection__controls" role="group" aria-label="地图视图">
          <button type="button" aria-label="放大地图" disabled={!ready} onClick={() => changeView((map) => map.zoomIn())}>+</button>
          <button type="button" aria-label="缩小地图" disabled={!ready} onClick={() => changeView((map) => map.zoomOut())}>−</button>
          <button type="button" aria-label="回到地图全览" disabled={!ready} onClick={() => changeView((map) => fitScene(map, scene))}>⌂</button>
        </div>
        <p className="map-selection__credit">{product ? '模拟展厅' : '地震数据来自 USGS'} · 底图 Natural Earth</p>
      </div>

      <div className="map-selection__panel">
        <p className="map-selection__kicker">{product ? 'FORMA LIVING / SHOWROOMS' : 'MAPLIBRE / POINT CLUSTERS'}</p>
        <h3>{product ? '找一家展厅试坐' : '太平洋沿岸地震'}</h3>
        {product ? (
          <>
            <p className="map-selection__configuration">
              <span className="map-selection__swatch" style={{ backgroundColor: finish.color }} aria-hidden="true" />
              <strong>{chair.name}</strong><span>·</span><span>{finish.name}</span>
            </p>
            <div className="map-selection__filters" role="group" aria-label="筛选展厅">
              {filters.map(([id, label]) => (
                <button key={id} type="button" aria-pressed={filter === id} onClick={() => changeFilter(id)}>{label}</button>
              ))}
            </div>
          </>
        ) : (
          <>
            <p className="map-selection__instructions">点击带数字的圆展开聚合，再点一个位置查看详情。</p>
            <label className="map-selection__select">
              <span>{quakes.length} 条历史地震记录</span>
              <select value={activeId ?? ''} onChange={(event) => selectFromList(event.target.value)}>
                <option value="">选择一条记录</option>
                {quakes.map((point) => (
                  <option key={point.id} value={point.id}>M {point.magnitude.toFixed(2)} · {quakeTime.format(point.time)}</option>
                ))}
              </select>
            </label>
          </>
        )}

        {product && (
          <div className="map-selection__results">
            <p className="map-selection__count" aria-live="polite">{locations.length} 家示例展厅</p>
            {locations.length ? (
              <ul className="map-selection__list" aria-label="展厅列表">
                {locations.map((point) => {
                  const match = showroomMatch(point, chair.id, finish.id);
                  return (
                    <li key={point.id}>
                      <button type="button" aria-pressed={active?.id === point.id} onClick={() => selectFromList(point.id)}>
                        <strong>{point.name}</strong><span data-match={match}>{matchLabels[match]}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="map-selection__empty">暂无同款同面料样椅。可选「可试坐当前款」查看其他面料。</p>
            )}
          </div>
        )}

        <div className="map-selection__detail" aria-live="polite">
          {active && product ? (
            <>
              <strong>{active.name}</strong>
              <span>{active.area} · {matchLabels[showroomMatch(active, chair.id, finish.id)]}</span>
              {activeFinishes && (
                <span>样椅面料 · {furnitureFinishes.filter((sample) => activeFinishes.includes(sample.id)).map((sample) => sample.name).join('、')}</span>
              )}
            </>
          ) : active ? (
            <>
              <strong>M {active.magnitude.toFixed(2)}　震源深度 {active.depth.toFixed(1)} km</strong>
              <span>{active.coordinates[1].toFixed(3)}° N · {Math.abs(active.coordinates[0]).toFixed(3)}° W</span>
              <span>{quakeTime.format(active.time)} UTC</span>
            </>
          ) : (
            <span>{product ? '从地图或列表选择展厅，查看样椅。' : '选择一个地震点，查看震级、震源深度和记录时间。'}</span>
          )}
        </div>
      </div>
    </section>
  );
}
