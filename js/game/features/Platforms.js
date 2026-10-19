import { Platform } from '../../entities/Platform.js';
import { moveAndCollide } from '../../engine/collision.js';

export class Platforms {
  constructor(bounds) {
    this.items = bounds.map((item) => new Platform(item));
  }

  move(body, dt) {
    moveAndCollide(body, this.items, dt);
  }
}
