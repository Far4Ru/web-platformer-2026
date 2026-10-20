export function drawIcon(ctx, rect, icon, colors, resumed = false, disabled = false, images) {
  const { x, y, width, height } = rect;
  ctx.save();
  if (disabled) ctx.globalAlpha = 0.45;
  const image = icon === 'pause' ? images[resumed ? 'iconPlay' : 'iconPause']
    : icon === 'sound' ? images[resumed ? 'iconSoundOff' : 'iconSound']
      : images.iconRestart;
  ctx.drawImage(image, x, y, width, height);
  ctx.restore();
}
