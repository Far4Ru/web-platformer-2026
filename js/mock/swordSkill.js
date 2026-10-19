export function drawSwordAttack(ctx, player, skill) {
  if (skill.attackTime <= 0) return;
  const { art, attackDuration } = skill.settings;
  const range = skill.settings.range * (skill.level === 1 ? 0.6 : 1);
  const originX = skill.direction > 0 ? player.x + player.width : player.x;
  ctx.save();
  ctx.translate(originX, player.y + player.height / 2);
  ctx.scale(skill.direction, 1);
  ctx.globalAlpha = skill.attackTime / attackDuration;
  ctx.fillStyle = art.slash;
  ctx.fillRect(0, -15, range, 30);
  ctx.fillStyle = art.blade;
  ctx.beginPath();
  ctx.moveTo(10, -5);
  ctx.lineTo(range - 12, -10);
  ctx.lineTo(range, 0);
  ctx.lineTo(range - 12, 10);
  ctx.lineTo(10, 5);
  ctx.fill();
  ctx.fillStyle = art.handle;
  ctx.fillRect(0, -9, 8, 18);
  ctx.restore();
}
