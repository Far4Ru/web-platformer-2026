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
