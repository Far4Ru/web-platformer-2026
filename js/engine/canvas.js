export function getCanvas(selector) {
  const canvas = document.querySelector(selector);
  if (!canvas) throw new Error(`Canvas not found: ${selector}`);
  return canvas;
}

export function configureCanvas(canvas, settings) {
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const mobile = window.matchMedia?.('(pointer: coarse)').matches ?? false;
    const ratio = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 2);
    const width = Math.max(1, Math.round(rect.width * ratio));
    const height = Math.max(1, Math.round(rect.height * ratio));
    if (canvas.width !== width) canvas.width = width;
    if (canvas.height !== height) canvas.height = height;
  };
  resize();
  window.addEventListener('resize', resize);
}
