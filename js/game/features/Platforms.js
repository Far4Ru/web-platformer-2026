import { Platform } from '../../entities/Platform.js';
import { moveAndCollide } from '../../engine/collision.js';

export class Platforms {
  constructor(bounds) {
    this.items = bounds.map((item) => new Platform(item));
    this.solidItems = this.items.filter((platform) => !platform.fake);
  }

  move(body, dt) {
    moveAndCollide(body, this.solidItems, dt);
  }
}
