(() => {
  'use strict';
  const copy = value => JSON.parse(JSON.stringify(value));
  const knownAssets = new Set(['assets/teapot.webp', 'assets/landscape.webp', 'assets/teapot-motion.mp4', 'assets/landscape-motion.mp4']);
  const get = (object, path) => path.split('.').reduce((value, key) => value == null ? undefined : value[key], object);
  const put = (object, path, value) => {
    const keys = path.split('.');
    let target = object;
    keys.slice(0, -1).forEach(key => { target = target[key]; });
    target[keys.at(-1)] = value;
  };
  function normalize(value) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('请选择本模板导出的配置文件。');
    if (value.schemaVersion !== undefined && value.schemaVersion !== 1) throw new Error('这份配置的版本不受支持。');
    function merge(base, input) {
      return Object.fromEntries(Object.entries(base).map(([key, fallback]) => {
        const candidate = input && Object.hasOwn(input, key) ? input[key] : undefined;
        if (fallback && typeof fallback === 'object' && !Array.isArray(fallback)) return [key, merge(fallback, candidate)];
        if (candidate === undefined) return [key, fallback];
        if (typeof candidate !== typeof fallback) throw new Error(`配置字段 ${key} 的类型不正确。`);
        return [key, candidate];
      }));
    }
    return merge(window.BRAND_DEFAULTS, value);
  }
  function validMedia(value, video = false, optional = false) {
    if (!value && optional) return true;
    if (knownAssets.has(value)) return video ? /\.mp4$/.test(value) : /\.webp$/.test(value);
    return (video ? /^data:video\/(mp4|webm|ogg);base64,[A-Za-z0-9+/=\r\n]+$/ : /^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=\r\n]+$/).test(value);
  }
  function validate(config) {
    const errors = [];
    if (!config.brand.name.trim()) errors.push('请填写品牌名称。');
    if (config.brand.name.length > 12) errors.push('品牌名称请控制在12字内。');
    if (!config.campaign.name.trim()) errors.push('请填写系列名称。');
    Object.entries(config.theme).forEach(([key, value]) => { if (!/^#[0-9a-f]{6}$/i.test(value)) errors.push(`配色 ${key} 需要六位颜色值。`); });
    Object.entries(config.media).forEach(([key, value]) => { if (!validMedia(value, key.endsWith('Video'))) errors.push('素材必须是模板自带素材或本地导入的图片、视频。'); });
    if (config.link.url.trim()) {
      try {
        const url = new URL(config.link.url);
        if (!['http:', 'https:'].includes(url.protocol) || url.username || url.password) throw new Error();
      } catch { errors.push('商品或咨询链接请填写完整的 http:// 或 https:// 地址。'); }
      if (!config.link.label.trim()) errors.push('设置链接后，请填写按钮文字。');
    }
    if (!validMedia(config.product.image, false, true)) errors.push('商品图片需要从本地导入。');
    if (config.product.enabled && (!config.product.name.trim() || !config.product.image)) errors.push('启用商品区前，请填写商品名称并导入商品图片。');
    return [...new Set(errors)];
  }
  const safeJSON = value => JSON.stringify(value).replace(/</g, '\\u003c').replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
  function compile(template, config) {
    const normalized = normalize(config);
    const errors = validate(normalized);
    if (errors.length) throw new Error(errors.join('\n'));
    return template.replace(/(<script id="brand-config" type="application\/json">)[\s\S]*?(<\/script>)/, (_, opening, closing) => opening + safeJSON(normalized) + closing);
  }
  const filename = value => (value || '品牌').replace(/[\\/:*?"<>|\u0000-\u001f]/g, '').trim().slice(0, 50) || '品牌';
  window.BrandTemplate = { copy, get, put, normalize, validate, validMedia, safeJSON, compile, filename };
})();
