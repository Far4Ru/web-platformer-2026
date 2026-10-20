import { drawAtlasCell } from './sprites.js';

export function drawSwordAttack(ctx, player, skill, image, sequence) {
  if (skill.attackTime <= 0) return;
  const { art, attackDuration } = skill.settings;
  const range = skill.settings.range * (skill.level === 1 ? 0.6 : 1);
  const originX = skill.direction > 0 ? player.x + player.width : player.x;
  ctx.save();
  ctx.translate(originX, player.y + player.height / 2);
  ctx.scale(skill.direction, 1);
  ctx.globalAlpha = skill.attackTime / attackDuration;
  ctx.shadowColor = '#ffe0a4';
  ctx.shadowBlur = 8;
  const frame = sequence?.frames[Math.min(3,
    Math.floor((1 - skill.attackTime / attackDuration) * 4))];
  if (frame) ctx.drawImage(frame.image ?? sequence.image,
    frame.x, frame.y, frame.w, frame.h, 0, -32, range, 64);
  else drawAtlasCell(ctx, image, 0, 0, 0, -32, range, 64);
  ctx.restore();
}
