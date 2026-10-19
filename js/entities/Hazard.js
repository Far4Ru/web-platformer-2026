import { overlaps } from '../engine/collision.js';
import { Entity } from './Entity.js';

export class Hazard extends Entity {
  hits(player) {
    return overlaps(this, player);
  }
}
