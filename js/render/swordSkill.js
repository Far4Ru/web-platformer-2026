import { drawAtlasCell } from './sprites.js';

export function drawSwordAttack(ctx, player, skill, image) {
  if (skill.attackTime <= 0) return;
  const { art, attackDuration } = skill.settings;
  const range = skill.settings.range * (skill.level === 1 ? 0.6 : 1);
  const originX = skill.direction > 0 ? player.x + player.width : player.x;
  ctx.save();
  ctx.translate(originX, player.y + player.height / 2);
  ctx.scale(skill.direction, 1);
  ctx.globalAlpha = skill.attackTime / attackDuration;
  drawAtlasCell(ctx, image, 0, 0, 0, -32, range, 64);
  ctx.restore();
}
