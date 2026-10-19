export function getCanvas(selector) {
  const canvas = document.querySelector(selector);
  if (!canvas) throw new Error(`Canvas not found: ${selector}`);
  return canvas;
}

export function configureCanvas(canvas, settings) {
  canvas.width = settings.world.width;
  canvas.height = settings.world.height;
  canvas.style.aspectRatio = `${canvas.width} / ${canvas.height}`;
}
