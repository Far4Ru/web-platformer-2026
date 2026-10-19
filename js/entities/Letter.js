import { Entity } from './Entity.js';

export class Letter extends Entity {
  constructor(bounds) {
    super(bounds);
    this.spawn = { x: bounds.x, y: bounds.y };
    this.active = true;
    this.reset();
  }

  reset() {
    this.x = this.spawn.x;
    this.y = this.spawn.y;
    this.collected = false;
    this.attracted = false;
    this.scale = 1;
  }

  update(dt, player, magnet) {
    if (!this.active || this.collected) return false;
    const targetX = player.x + player.width / 2;
    const targetY = player.y + player.height / 2;
    let dx = targetX - (this.x + this.width / 2);
    let dy = targetY - (this.y + this.height / 2);
    let distance = Math.hypot(dx, dy);
    if (distance <= magnet.radius) this.attracted = true;
    if (!this.attracted) return false;

    const step = Math.min(distance, magnet.speed * dt);
    if (distance > 0) {
      this.x += dx / distance * step;
      this.y += dy / distance * step;
    }
    this.scale = Math.max(magnet.minScale, this.scale - magnet.shrinkSpeed * dt);
    dx = targetX - (this.x + this.width / 2);
    dy = targetY - (this.y + this.height / 2);
    distance = Math.hypot(dx, dy);
    if (distance > magnet.collectRadius) return false;
    this.collected = true;
    return true;
  }
}
