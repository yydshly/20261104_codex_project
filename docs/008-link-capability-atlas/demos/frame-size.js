if (window.parent !== window) {
  let previousHeight;
  const reportHeight = () => {
    const height = Math.ceil(document.body.getBoundingClientRect().height);
    if (height && height !== previousHeight) {
      previousHeight = height;
      window.parent.postMessage({ type: 'atlas-demo-height', height }, '*');
    }
  };
  new ResizeObserver(reportHeight).observe(document.body);
  window.addEventListener('load', reportHeight);
}
