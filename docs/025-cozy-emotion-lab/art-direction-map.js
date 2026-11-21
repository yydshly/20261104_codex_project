(() => {
  'use strict';
  const button = document.getElementById('download-map');
  const status = document.getElementById('map-status');
  button.addEventListener('click', async () => {
    button.disabled = true;
    status.textContent = '正在准备完整图片…';
    try {
      const image = new Image();
      image.src = 'assets/diagrams/art-emotion-value-map.svg';
      await image.decode();
      await document.fonts.ready;
      const canvas = document.createElement('canvas');
      canvas.width = 2400;
      canvas.height = 1700;
      const context = canvas.getContext('2d');
      if (!context) throw new Error('Canvas unavailable');
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('PNG unavailable');
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'art-emotion-value-map.png';
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 2000);
      status.textContent = '已导出 2400 × 1700 PNG。原帖引用与试作状态随图保留。';
    } catch {
      status.textContent = 'PNG暂未导出，可先查看总览图，刷新后重试。';
    } finally { button.disabled = false; }
  });
})();
