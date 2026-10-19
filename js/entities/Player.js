import { Entity } from './Entity.js';

export class Player extends Entity {
  constructor(settings) {
    super({ ...settings.spawn, width: settings.width, height: settings.height });
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.x = this.settings.spawn.x;
    this.y = this.settings.spawn.y;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
    this.facing = 1;
  }
}
