import { Entity } from './Entity.js';

export class Platform extends Entity {
  constructor(bounds) {
    super(bounds);
    this.fake = Boolean(bounds.fake);
    this.surface = bounds.surface ?? 'normal';
    this.holeFor = 0;
    this.spikeFor = 0;
    this.broken = false;
    this.breakFor = 0;
  }

  break() {
    if (!this.fake || this.broken) return;
    this.broken = true;
    this.breakFor = 0.45;
  }
}
