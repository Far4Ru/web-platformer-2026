import { Entity } from './Entity.js';

export class Projectile extends Entity {
  constructor({ x, y, width, height, vx, vy, gravity = 0, life, kind, damage = 1, freeze = 0, stun = 0 }) {
    super({ x, y, width, height });
    Object.assign(this, { vx, vy, gravity, life, kind, damage, freeze, stun });
  }

  update(dt) {
    if (this.delay > 0) {
      this.delay = Math.max(0, this.delay - dt);
      if (this.anchor) {
        this.x = this.anchor.x + this.anchor.width / 2 - this.width / 2;
        this.y = this.anchor.y + this.anchor.height / 2 - this.height / 2;
      }
      return;
    }
    if (this.orbit) {
      const orbit = this.orbit;
      orbit.angle += orbit.speed * dt;
      orbit.remaining -= dt;
      this.x = orbit.anchor.x + orbit.anchor.width / 2 + Math.cos(orbit.angle) * orbit.radius - this.width / 2;
      this.y = orbit.anchor.y + orbit.anchor.height / 2 + Math.sin(orbit.angle) * orbit.radius - this.height / 2;
      if (orbit.remaining <= 0) {
        this.vx = orbit.anchor.facing * Math.max(220, Math.abs(this.vx));
        this.vy = Math.sin(orbit.angle) * 90;
        this.orbit = null;
      }
      return;
    }
    this.x += this.vx * dt;
    this.y += this.vy * dt + this.gravity * dt * dt / 2;
    this.vy += this.gravity * dt;
    this.life -= dt;
  }
}
