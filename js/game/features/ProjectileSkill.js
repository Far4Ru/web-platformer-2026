import { SkillPickup } from '../../entities/SkillPickup.js';

export class ProjectileSkill {
  constructor(settings) {
    this.settings = settings;
    this.pickup = new SkillPickup(settings.pickup);
    this.reset();
  }

  reset() {
    this.pickup.reset();
    this.cooldown = 0;
  }

  update(dt, player, enemies, shots) {
    if (!this.pickup.collected && !this.pickup.tryCollect(player)) return;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown > 0) return;
    const shot = this.createShot(player, enemies);
    if (shot) {
      shots.add(shot);
      this.cooldown = this.settings.interval;
    }
  }
}
