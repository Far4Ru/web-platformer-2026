export function drawMovementHint(ctx, player, idleTime, images, time) {
  if (idleTime < 5) return;
  const icons = [images.keyLeft, images.keyRight, images.keyUp];
  const center = player.x + player.width / 2;
  const y = player.y - 78 + Math.sin(time * 3) * 2;
  ctx.save();
  ctx.globalAlpha = Math.min(1, (idleTime - 5) * 2);
  icons.forEach((icon, index) => ctx.drawImage(icon,
    center - 52 + index * 36, y, 32, 32));
  ctx.restore();
}
