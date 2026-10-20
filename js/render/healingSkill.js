export function drawHealingBeam(ctx, player, camera, skill, image, sequence) {
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
  const frame = sequence?.frames[Math.min(3,
    Math.floor((1 - skill.beamTime / beamDuration) * 4))];
  ctx.shadowColor = '#ffd369';
  ctx.shadowBlur = 12;
  if (frame) ctx.drawImage(frame.image ?? sequence.image,
    frame.x, frame.y, frame.w, frame.h, 0, 0, length, art.beamWidth);
  else ctx.drawImage(image[1][2], 0, 0, image[1][2].width, image[1][2].height,
    0, 0, length, art.beamWidth);
  ctx.restore();
}
