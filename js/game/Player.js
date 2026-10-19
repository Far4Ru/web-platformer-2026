import { moveAndCollide } from '../engine/collision.js';

export class Player {
  constructor(settings) {
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.x = this.settings.spawn.x;
    this.y = this.settings.spawn.y;
    this.width = this.settings.width;
    this.height = this.settings.height;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
  }

  update(dt, input, platforms, worldWidth) {
    this.vx = input.horizontal * this.settings.moveSpeed;
    if (input.consumeJump() && this.grounded) {
      this.vy = -this.settings.jumpSpeed;
      this.grounded = false;
    }
    this.vy = Math.min(this.vy + this.settings.gravity * dt, this.settings.maxFallSpeed);
    moveAndCollide(this, platforms, dt);
    this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));
  }

  render(ctx) {
    for (const part of this.settings.sprite) {
      ctx.fillStyle = this.settings.colors[part.color];
      ctx.fillRect(this.x + part.x, this.y + part.y, part.width, part.height);
    }
  }
}
