export function drawDust(ctx, particles, life) {
  ctx.save();
  for (const particle of particles) {
    ctx.globalAlpha = particle.life / life;
    ctx.fillStyle = particle.color;
    ctx.fillRect(particle.x, particle.y, particle.size, particle.size);
  }
  ctx.restore();
}
