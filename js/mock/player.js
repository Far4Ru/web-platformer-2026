export function drawPlayer(ctx, player) {
  for (const part of player.settings.sprite) {
    ctx.fillStyle = player.settings.colors[part.color];
    ctx.fillRect(player.x + part.x, player.y + part.y, part.width, part.height);
  }
}
