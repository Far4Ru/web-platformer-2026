export class BurstParticles {
  constructor(settings) {
    this.settings = settings;
    this.items = [];
  }

  emit(x, y, kind, count = this.settings.count) {
    for (let index = 0; index < count; index++) {
      const angle = Math.PI * 2 * index / count + Math.random() * 0.45;
      const speed = this.settings.speed * (0.6 + Math.random() * 0.7);
      this.items.push({ x, y, kind, vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - this.settings.lift,
        life: this.settings.life, size: this.settings.size });
    }
  }

  update(dt) {
    for (const item of this.items) {
      item.x += item.vx * dt;
      item.y += item.vy * dt;
      item.vy += this.settings.gravity * dt;
      item.life -= dt;
    }
    this.items = this.items.filter((item) => item.life > 0);
  }
}
