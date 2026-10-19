function paintLayer(ctx, canvas, image, progress, speed) {
  const sourceWidth = Math.min(image.width, image.height * canvas.width / canvas.height);
  const sourceX = (image.width - sourceWidth) * progress * speed;
  ctx.drawImage(image, sourceX, 0, sourceWidth, image.height,
    0, 0, canvas.width, canvas.height);
}

export function drawBackground(ctx, canvas, images, settings,
  cameraX = 0, levelWidth = canvas.width) {
  const progress = Math.max(0, Math.min(1,
    cameraX / Math.max(1, levelWidth - canvas.width)));
  paintLayer(ctx, canvas, images.jungle, progress, settings.forestSpeed);
  const templeOpacity = Math.max(0, Math.min(1,
    (progress - settings.transitionStart) / settings.transitionLength));
  if (templeOpacity > 0) {
    ctx.save();
    ctx.globalAlpha = templeOpacity;
    paintLayer(ctx, canvas, images.temple, progress, settings.templeSpeed);
    ctx.restore();
  }
  ctx.save();
  ctx.globalAlpha = settings.foregroundOpacity;
  paintLayer(ctx, canvas, images.foliage, progress, settings.foregroundSpeed);
  ctx.restore();
}
