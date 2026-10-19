import { Entity } from './Entity.js';

export class Projectile extends Entity {
  constructor({ x, y, width, height, vx, vy, gravity = 0, life, kind, damage = 1, freeze = 0, stun = 0 }) {
    super({ x, y, width, height });
    Object.assign(this, { vx, vy, gravity, life, kind, damage, freeze, stun });
  }

  update(dt) {
    this.x += this.vx * dt;
    this.y += this.vy * dt + this.gravity * dt * dt / 2;
    this.vy += this.gravity * dt;
    this.life -= dt;
  }
}
