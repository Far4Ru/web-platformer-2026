export function getCanvas(selector) {
  const canvas = document.querySelector(selector);
  if (!canvas) throw new Error(`Canvas not found: ${selector}`);
  return canvas;
}

export function configureCanvas(canvas, settings) {
  const resize = () => {
    const rect = canvas.getBoundingClientRect();
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(rect.width * ratio));
    canvas.height = Math.max(1, Math.round(rect.height * ratio));
  };
  resize();
  window.addEventListener('resize', resize);
}
