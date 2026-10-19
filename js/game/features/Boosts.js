import { SkillPickup } from '../../entities/SkillPickup.js';

export class Boosts {
  constructor(settings, bounds) {
    this.settings = settings;
    this.pickups = Object.fromEntries(Object.entries(settings.items).map(([kind, item]) =>
      [kind, new SkillPickup(bounds?.[kind] ?? item.pickup)]));
    this.reset();
  }

  reset() {
    for (const pickup of Object.values(this.pickups)) pickup.reset();
    this.remaining = { speed: 0, damage: 0 };
  }

  update(dt, player, health) {
    for (const kind of Object.keys(this.remaining)) {
      this.remaining[kind] = Math.max(0, this.remaining[kind] - dt);
    }
    for (const [kind, pickup] of Object.entries(this.pickups)) {
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
