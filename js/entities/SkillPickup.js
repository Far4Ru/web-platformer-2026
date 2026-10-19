import { overlaps } from '../engine/collision.js';
import { Entity } from './Entity.js';

export class SkillPickup extends Entity {
  constructor(bounds) {
    super(bounds);
    this.collected = false;
  }

  reset() {
    this.collected = false;
  }

  tryCollect(player) {
    if (this.collected || !overlaps(this, player)) return false;
    this.collected = true;
    return true;
  }
}
