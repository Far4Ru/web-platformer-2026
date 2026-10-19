export class DustParticles {
  constructor(settings) {
    this.settings = settings;
    this.particles = [];
  }

  reset() {
    this.particles = [];
  }

  emit(player, direction) {
    const { count, life, size, speed, speedStep, lift, liftStep, colors } = this.settings;
    const x = player.x + (direction > 0 ? 4 : player.width - 4);
    const y = player.y + player.height - size;
    for (let index = 0; index < count; index++) {
      this.particles.push({
        x,
        y,
        vx: -direction * (speed + index * speedStep),
        vy: -(lift + (index % 3) * liftStep),
        size,
        color: colors[index % colors.length],
        life,
      });
    }
  }

  update(dt) {
    const { gravity } = this.settings;
    for (const particle of this.particles) {
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.vy += gravity * dt;
      particle.life -= dt;
    }
    this.particles = this.particles.filter((particle) => particle.life > 0);
  }
}
