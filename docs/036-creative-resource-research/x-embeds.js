(() => {
  'use strict';
  let ready;
  function widgets() {
    if (window.twttr?.widgets) return Promise.resolve(window.twttr);
    if (ready) return ready;
    ready = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://platform.twitter.com/widgets.js';
      script.async = true;
      script.id = 'x-official-widgets';
      script.onload = () => window.twttr?.ready(() => resolve(window.twttr));
      script.onerror = () => reject(new Error('X 官方嵌入组件未能加载'));
      document.head.append(script);
    }).catch(error => { ready = null; document.getElementById('x-official-widgets')?.remove(); throw error; });
    return ready;
  }
  async function mount(host) {
    if (!host.isConnected || host.dataset.state === 'loading' || host.dataset.state === 'ready') return;
    const status = host.querySelector('.x-embed-status');
    const target = host.querySelector('.x-embed-target');
    host.dataset.state = 'loading';
    status.textContent = '正在载入 X 官方原帖播放器…';
    try {
      const api = await widgets();
      if (!host.isConnected) return;
      const rendered = await api.widgets.createTweet(host.dataset.postId, target, {
        conversation: 'none', dnt: true, lang: 'zh-cn', theme: 'light', align: 'center', width: 550, mediaMaxWidth: 560
      });
      if (!host.isConnected) return;
      if (!rendered) throw new Error('X 尚未返回该原帖的嵌入内容');
      host.dataset.state = 'ready';
      status.textContent = 'X 官方原帖播放器';
    } catch (error) {
      if (!host.isConnected) return;
      host.dataset.state = 'error';
      status.textContent = error.message + '。可重试，或打开原帖查看。';
      const retry = document.createElement('button');
      retry.type = 'button'; retry.textContent = '重试载入';
      retry.onclick = () => { retry.remove(); mount(host); };
      status.append(' ', retry);
    }
  }
  window.renderXEmbeds = root => root.querySelectorAll('.x-official-embed').forEach(mount);
})();
