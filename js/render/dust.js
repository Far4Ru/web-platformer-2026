import { drawAtlasCell } from './sprites.js';

export function drawDust(ctx, particles, life, image) {
  ctx.save();
  for (const particle of particles) {
    ctx.globalAlpha = particle.life / life;
    drawAtlasCell(ctx, image, 0, 2, particle.x - particle.size,
      particle.y - particle.size, particle.size * 3, particle.size * 3);
  }
  ctx.restore();
}
