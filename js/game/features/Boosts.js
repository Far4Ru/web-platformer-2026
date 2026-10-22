import { SkillPickup } from '../../entities/SkillPickup.js';

export class Boosts {
  constructor(settings, bounds) {
    this.settings = settings;
    const entries = bounds ? Object.entries(bounds)
      : Object.entries(settings.items).map(([kind, item]) => [kind, item.pickup]);
    this.pickupKinds = Object.fromEntries(entries.map(([key]) =>
      [key, key.startsWith('heal') ? 'heal' : key]));
    this.pickups = Object.fromEntries(entries.map(([key, pickup]) =>
      [key, new SkillPickup(pickup)]));
    this.reset();
  }

  kindFor(key) { return this.pickupKinds[key]; }

  reset() {
    for (const pickup of Object.values(this.pickups)) pickup.reset();
    this.remaining = { speed: 0, damage: 0 };
  }

  update(dt, player, health) {
    for (const kind of Object.keys(this.remaining)) {
      this.remaining[kind] = Math.max(0, this.remaining[kind] - dt);
    }
    for (const [key, pickup] of Object.entries(this.pickups)) {
      const kind = this.kindFor(key);
      if (kind === 'heal' && health.value >= health.settings.max) continue;
      if (!pickup.tryCollect(player)) continue;
      const item = this.settings.items[kind];
      if (kind === 'heal') health.heal(item.amount);
      else this.remaining[kind] = item.duration;
    }
  }

  get speedMultiplier() {
    return this.remaining.speed > 0 ? this.settings.items.speed.multiplier : 1;
  }

  get damageMultiplier() {
    return this.remaining.damage > 0 ? this.settings.items.damage.multiplier : 1;
  }
}
