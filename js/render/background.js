import { windPulse } from './platform.js';

function layerSource(canvas, image, progress, speed) {
  const aspect = canvas.width / canvas.height;
  const width = Math.min(image.width, image.height * aspect);
  const height = Math.min(image.height, image.width / aspect);
  return {
    x: (image.width - width) * progress * speed,
    y: (image.height - height) / 2,
    width, height,
  };
}

function paintLayer(ctx, canvas, image, progress, speed) {
  const source = layerSource(canvas, image, progress, speed);
  ctx.drawImage(image, source.x, source.y, source.width, source.height,
    0, 0, canvas.width, canvas.height);
}

function paintVines(ctx, canvas, images, progress, speed, time, cameraX) {
  const source = layerSource(canvas, images.foliage, progress, speed);
  const frameWidth = images.vineWind.width / 4;
  // Each vine begins at the top edge where the foreground foliage is rooted.
  const vines = [
    { x: 0.22, width: 53, height: 0.38 },
    { x: 0.32, width: 51, height: 0.34 },
    { x: 0.47, width: 58, height: 0.42 },
    { x: 0.55, width: 53, height: 0.36 },
    { x: 0.78, width: 58, height: 0.39 },
    { x: 0.90, width: 54, height: 0.41 },
  ];
  for (const [index, vine] of vines.entries()) {
    const sourceX = images.foliage.width * vine.x;
    const x = (sourceX - source.x) / source.width * canvas.width;
    if (x < -vine.width || x > canvas.width + vine.width) continue;
    const gust = windPulse(time, cameraX + x + index * 43);
    const sway = Math.sin(time * 1.3 + index * 1.4) * (0.04 + gust * 0.12);
    const frame = sway < -0.09 ? 3 : sway < -0.025 ? 0
      : sway < 0.025 ? 1 : 2;
    ctx.drawImage(images.vineWind, frame * frameWidth, 0,
      frameWidth, images.vineWind.height,
      x - vine.width / 2, -3,
      vine.width, vine.height * canvas.height);
  }
}

export function drawBackground(ctx, canvas, images, settings,
  cameraX = 0, levelWidth = canvas.width, time = 0, theme = null) {
  const progress = Math.max(0, Math.min(1,
    cameraX / Math.max(1, levelWidth - canvas.width)));
  const active = theme ?? settings.themes?.forest
    ?? { image: 'jungle', speed: 0.35, foregroundOpacity: 1, vines: true };
  paintLayer(ctx, canvas, images[active.image], progress, active.speed);
  const opacity = active.foregroundOpacity;
  if (opacity > 0) {
    ctx.save();
    ctx.globalAlpha = opacity;
    paintLayer(ctx, canvas, images.foliage, progress, settings.foregroundSpeed);
    if (active.vines)
      paintVines(ctx, canvas, images, progress, settings.foregroundSpeed, time, cameraX);
    ctx.restore();
  }
}
