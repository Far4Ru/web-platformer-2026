export function drawPlayer(ctx, player) {
  for (const part of player.settings.sprite) {
    ctx.fillStyle = player.settings.colors[part.color];
    ctx.fillRect(player.x + part.x, player.y + part.y, part.width, part.height);
  }
  if (player.frozenFor > 0) {
    ctx.fillStyle = player.settings.colors.frozenOverlay;
    ctx.fillRect(player.x - 3, player.y - 3, player.width + 6, player.height + 6);
  }
}
