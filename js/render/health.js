export function drawHealthBar(ctx, player, health) {
  const { bar, colors } = health.settings;
  const x = player.x + (player.width - bar.width) / 2;
  const y = player.y - bar.offsetY;
  ctx.fillStyle = colors.border;
  ctx.fillRect(x - 1, y - 1, bar.width + 2, bar.height + 2);
  ctx.fillStyle = colors.empty;
  ctx.fillRect(x, y, bar.width, bar.height);
  ctx.fillStyle = health.draining ? colors.damage : colors.full;
  ctx.fillRect(x, y, bar.width * health.displayValue / health.settings.max, bar.height);
}
