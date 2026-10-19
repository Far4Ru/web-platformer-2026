export function drawSwordPickup(ctx, pickup, art, time) {
  if (pickup.collected) return;
  const x = pickup.x + pickup.width / 2;
  const y = pickup.y + pickup.height / 2 + Math.sin(time * art.bobSpeed) * art.bobAmount;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = art.halo;
  ctx.beginPath();
  ctx.arc(x, y, pickup.width / 2 + 5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = art.body;
  ctx.beginPath();
  ctx.arc(x, y, pickup.width / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = art.blade;
  ctx.fillRect(x - 2, y - 9, 4, 14);
  ctx.fillStyle = art.handle;
  ctx.fillRect(x - 7, y + 4, 14, 3);
  ctx.fillRect(x - 2, y + 7, 4, 6);
  ctx.restore();
}

export function drawSwordAttack(ctx, player, skill) {
  if (skill.attackTime <= 0) return;
  const { art, range, attackDuration } = skill.settings;
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
