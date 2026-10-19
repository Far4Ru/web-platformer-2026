export class ProjectileSkill {
  constructor(settings) {
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.level = 0;
    this.cooldown = 0;
  }

  update(dt, player, enemies, shots) {
    if (this.level === 0) return;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown > 0) return;
    const created = this.createShots?.(player, enemies) ?? this.createShot(player, enemies);
    if (created) {
      for (const shot of Array.isArray(created) ? created : [created]) shots.add(shot);
      this.cooldown = this.settings.interval;
    }
  }
}
