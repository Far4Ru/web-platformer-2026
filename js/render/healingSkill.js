export function drawHealingBeam(ctx, player, camera, skill, image) {
  if (skill.beamTime <= 0) return;
  const { art, beamDuration } = skill.settings;
  const x = player.x + player.width / 2;
  const top = camera.y;
  const bottom = player.y + player.height / 2;
  ctx.save();
  ctx.globalAlpha = skill.beamTime / beamDuration;
  const length = Math.max(1, bottom - top);
  ctx.translate(x + art.beamWidth / 2, top);
  ctx.rotate(Math.PI / 2);
  ctx.drawImage(image[1][2], 0, 0, image[1][2].width, image[1][2].height,
    0, 0, length, art.beamWidth);
  ctx.restore();
}
