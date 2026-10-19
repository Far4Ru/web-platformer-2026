export function drawHealingPickup(ctx, pickup, art, time) {
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
  ctx.fillStyle = art.cross;
  ctx.fillRect(x - 2, y - 8, 4, 16);
  ctx.fillRect(x - 8, y - 2, 16, 4);
  ctx.restore();
}

export function drawHealingBeam(ctx, player, camera, skill) {
  if (skill.beamTime <= 0) return;
  const { art, beamDuration } = skill.settings;
  const x = player.x + player.width / 2;
  const top = camera.y;
  const bottom = player.y + player.height / 2;
  ctx.save();
  ctx.globalAlpha = skill.beamTime / beamDuration;
  ctx.fillStyle = art.beamOuter;
  ctx.beginPath();
  ctx.moveTo(x - art.beamWidth / 2, top);
  ctx.lineTo(x + art.beamWidth / 2, top);
  ctx.lineTo(x + art.beamWidth / 4, bottom);
  ctx.lineTo(x - art.beamWidth / 4, bottom);
  ctx.fill();
  ctx.fillStyle = art.beamCore;
  ctx.fillRect(x - art.beamCoreWidth / 2, top, art.beamCoreWidth, bottom - top);
  ctx.restore();
}
