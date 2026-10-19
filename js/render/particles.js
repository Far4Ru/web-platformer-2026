import { drawAtlasCell } from './sprites.js';

export function drawParticles(ctx, particles, settings, image) {
  ctx.save();
  for (const particle of particles) {
    ctx.globalAlpha = Math.max(0, particle.life / settings.life);
    const cell = particle.kind === 'coin' ? [1, 2]
      : particle.kind === 'hit' ? [2, 2] : [0, 2];
    const size = particle.size * (1 + (1 - particle.life / settings.life) * 0.5);
    drawAtlasCell(ctx, image, ...cell, particle.x - size / 2,
      particle.y - size / 2, size, size);
  }
  ctx.restore();
}
