import { SkillPickup } from '../../entities/SkillPickup.js';

export class HealingSkill {
  constructor(settings) {
    this.settings = settings;
    this.pickup = new SkillPickup(settings.pickup);
    this.reset();
  }

  reset() {
    this.pickup.reset();
    this.cooldown = 0;
    this.beamTime = 0;
  }

  activate(health) {
    health.heal(this.settings.healAmount);
    this.cooldown = this.settings.interval;
    this.beamTime = this.settings.beamDuration;
  }

  update(dt, player, health) {
    this.beamTime = Math.max(0, this.beamTime - dt);

    if (!this.pickup.collected) {
      if (this.pickup.tryCollect(player)) this.activate(health);
      return;
    }

    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown === 0 && health.value < health.settings.max) this.activate(health);
  }
}
