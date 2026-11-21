(() => {
  const dialog = document.getElementById('overview-dialog');
  const opener = document.getElementById('open-overview');
  const closer = document.getElementById('close-overview');
  opener.addEventListener('click', (event) => {
    if (typeof dialog.showModal !== 'function') return;
    event.preventDefault();
    dialog.showModal();
    closer.focus();
  });
  closer.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    if (event.target !== dialog) return;
    const r = dialog.getBoundingClientRect();
    if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close();
  });
  dialog.addEventListener('close', () => opener.focus());

  const history = [...document.querySelectorAll('.timeline details')];
  const toggle = document.getElementById('toggle-history');
  function updateToggle() {
    const open = history.every((d) => d.open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '收起全部讨论记录' : '展开全部讨论记录';
  }
  toggle.addEventListener('click', () => {
    const next = !history.every((d) => d.open);
    history.forEach((d) => { d.open = next; });
    updateToggle();
  });
  history.forEach((d) => d.addEventListener('toggle', updateToggle));
  document.getElementById('export-data').addEventListener('click', () => {
    const a = document.createElement('a');
    a.href = 'research-data.json';
    a.download = 'projection-play-research-20261121.json';
    document.body.append(a);
    a.click();
    a.remove();
    document.getElementById('status').textContent = '已请求下载完整研究记录。';
  });
})();
