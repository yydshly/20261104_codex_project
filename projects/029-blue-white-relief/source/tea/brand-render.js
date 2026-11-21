(() => {
  'use strict';
  const api = window.BrandTemplate;
  const resolve = value => (window.BRAND_ASSETS && window.BRAND_ASSETS[value]) || value;
  let current;
  function render(value) {
    const config = api.normalize(value);
    const errors = api.validate(config);
    if (errors.length) throw new Error(errors.join('\n'));
    current = config;
    window.BRAND_CONFIG = config;
    const text = value => String(value ?? '').replaceAll('{{品牌}}', config.brand.name).replaceAll('{{系列}}', config.campaign.name);
    document.title = `${config.brand.name} ${config.brand.latin}｜${config.copy.heroTop}${config.copy.heroBottom}`;
    document.querySelector('meta[name="description"]').content = `${config.brand.name} · ${config.campaign.name}。${config.copy.heroLead.replace(/\n/g, '')}`;
    document.querySelector('meta[name="theme-color"]').content = config.theme.paper;
    const variables = { paper: '--paper', light: '--paper-light', ink: '--ink', accent: '--blue', deep: '--deep' };
    Object.entries(variables).forEach(([key, css]) => document.documentElement.style.setProperty(css, config.theme[key]));
    document.querySelectorAll('[data-bind]').forEach(node => { node.textContent = text(api.get(config, node.dataset.bind)); });
    const derived = {
      brandFull: `${config.brand.name} ${config.brand.latin}`,
      heroEyebrow: `${config.brand.name} · ${config.campaign.season}`,
      heroEdition: `${config.campaign.name}　/　${config.campaign.subtitle}　/　${config.campaign.edition}`,
      collectionLabel: `本季新作 · ${config.campaign.name}`,
      closingLabel: `${config.brand.latin} / ${config.campaign.name}`,
      filmLabel: `${config.brand.latin} / MOVING STILLNESS`
    };
    document.querySelectorAll('[data-derived]').forEach(node => { node.textContent = derived[node.dataset.derived] || ''; });
    document.querySelector('.brand').setAttribute('aria-label', `${config.brand.name}，回到页面顶部`);
    document.querySelectorAll('[data-image-role]').forEach(image => { image.src = resolve(config.media[image.dataset.imageRole]); });
    const movies = [['hero-film', 'teapotImage', 'teapotVideo'], ['landscape-film', 'landscapeImage', 'landscapeVideo']];
    movies.forEach(([id, poster, movie]) => {
      const video = document.getElementById(id);
      video.poster = resolve(config.media[poster]);
      if (video.dataset.mediaValue !== config.media[movie]) {
        video.dataset.mediaValue = config.media[movie];
        video.src = resolve(config.media[movie]);
        video.load();
      }
    });
    const download = document.getElementById('brand-download');
    download.href = resolve(config.media.teapotImage);
    const mime = download.href.match(/^data:image\/(\w+)/)?.[1] || 'webp';
    download.download = `${api.filename(config.brand.name)}-${api.filename(config.campaign.name)}-茶器主视觉.${mime === 'jpeg' ? 'jpg' : mime}`;
    const link = document.getElementById('brand-action');
    link.hidden = !config.link.url.trim();
    if (config.link.url.trim()) { link.href = config.link.url.trim(); link.textContent = `${config.link.label} ↗`; }
    else link.removeAttribute('href');
    const productLink = document.querySelector('.product-action');
    productLink.hidden = !config.link.url.trim();
    if (config.link.url.trim()) { productLink.href = config.link.url.trim(); productLink.textContent = `${config.link.label} ↗`; }
    else productLink.removeAttribute('href');
    const product = document.getElementById('product-section');
    product.hidden = !config.product.enabled;
    if (config.product.enabled) document.getElementById('product-image').src = resolve(config.product.image);
    document.querySelectorAll('[data-optional]').forEach(node => { node.hidden = !api.get(config, node.dataset.optional).trim(); });
    document.dispatchEvent(new CustomEvent('brand:updated'));
  }
  const initial = JSON.parse(document.getElementById('brand-config').textContent) || window.BRAND_DEFAULTS;
  render(initial);
  window.addEventListener('message', event => {
    if (window.parent === window || event.source !== window.parent || event.data?.channel !== 'brand-template' || event.data.type !== 'apply') return;
    try {
      render(event.data.config);
      window.parent.postMessage({ channel: 'brand-template', type: 'applied', name: current.brand.name }, '*');
    } catch (error) {
      window.parent.postMessage({ channel: 'brand-template', type: 'error', message: error.message }, '*');
    }
  });
  if (window.parent !== window) window.parent.postMessage({ channel: 'brand-template', type: 'ready' }, '*');
})();
