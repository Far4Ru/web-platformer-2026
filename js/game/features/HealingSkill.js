export class HealingSkill {
  constructor(settings) {
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.level = 0;
    this.cooldown = 0;
    this.beamTime = 0;
  }

  activate(health) {
    health.heal(this.settings.healAmount + this.level - 1);
    this.cooldown = this.settings.interval / (1 + (this.level - 1) * 0.25);
    this.beamTime = this.settings.beamDuration;
  }

  update(dt, player, health) {
    this.beamTime = Math.max(0, this.beamTime - dt);

    if (this.level === 0) return;

    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown === 0 && health.value < health.settings.max) this.activate(health);
  }
}
