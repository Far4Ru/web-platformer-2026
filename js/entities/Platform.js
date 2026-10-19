import { Entity } from './Entity.js';

export class Platform extends Entity {
  constructor(bounds) {
    super(bounds);
    this.fake = Boolean(bounds.fake);
  }
}
