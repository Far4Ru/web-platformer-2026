import { drawAtlasCell } from './sprites.js';

export function drawHealingBeam(ctx, player, camera, skill, image) {
  if (skill.beamTime <= 0) return;
  const { art, beamDuration } = skill.settings;
  const x = player.x + player.width / 2;
  const top = camera.y;
  const bottom = player.y + player.height / 2;
  ctx.save();
  ctx.globalAlpha = skill.beamTime / beamDuration;
  drawAtlasCell(ctx, image, 2, 1, x - art.beamWidth / 2, top,
    art.beamWidth, Math.max(1, bottom - top));
  ctx.restore();
}
