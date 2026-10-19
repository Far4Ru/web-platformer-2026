export class PlayerHealth {
  constructor(settings) {
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.value = this.settings.max;
    this.displayValue = this.value;
    this.invulnerableFor = 0;
  }

  update(dt) {
    this.invulnerableFor = Math.max(0, this.invulnerableFor - dt);
    this.displayValue = Math.max(this.value, this.displayValue - dt / this.settings.drainTime);
  }

  takeDamage() {
    if (this.invulnerableFor > 0 || this.value === 0) return false;
    this.value -= 1;
    this.invulnerableFor = this.settings.invulnerability;
    return true;
  }

  get draining() {
    return this.displayValue > this.value;
  }

  get depleted() {
    return this.value === 0 && !this.draining;
  }
}
