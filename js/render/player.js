import { drawSheetFrame } from './sprites.js';

export function drawPlayer(ctx, player, time = 0, image, actions, animation = {}) {
  const running = player.grounded && Math.abs(player.vx) > 20;
  const frame = player.frozenFor > 0 ? 4 : !player.grounded ? 3
    : running ? 1 + Math.floor(time * 10) % 2 : 0;
  const actionFrame = animation.won ? 5 : animation.attacking ? 4
    : !player.grounded ? player.vy < 0 ? 1 : 2
      : animation.landing ? 3 : null;
  ctx.save();
  if (player.facing < 0) {
    ctx.translate(player.x + player.width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(player.x + player.width / 2), 0);
  }
  if (actionFrame === null || player.frozenFor > 0)
    drawSheetFrame(ctx, image, frame, 6, player.x - 10, player.y - 16, 52, 58, 70, 605);
  else drawSheetFrame(ctx, actions, actionFrame, 6,
    player.x - 10, player.y - 16, 52, 58, 70, 605);
  ctx.restore();
  if (player.frozenFor > 0) {
    ctx.fillStyle = player.settings.colors.frozenOverlay;
    ctx.fillRect(player.x - 3, player.y - 3, player.width + 6, player.height + 6);
  }
}
