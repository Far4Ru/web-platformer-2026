import { moveAndCollide } from './collision.js';

export class Player {
  constructor() { this.reset(); }

  reset() {
    this.x = 78;
    this.y = 420;
    this.width = 32;
    this.height = 40;
    this.vx = 0;
    this.vy = 0;
    this.grounded = true;
  }

  update(dt, input, platforms, worldWidth) {
    this.vx = input.horizontal * 245;
    if (input.consumeJump() && this.grounded) {
      this.vy = -620;
      this.grounded = false;
    }
    this.vy = Math.min(this.vy + 1450 * dt, 900);
    moveAndCollide(this, platforms, dt);
    this.x = Math.max(0, Math.min(worldWidth - this.width, this.x));
  }

  render(ctx) {
    ctx.fillStyle = '#10334b';
    ctx.fillRect(this.x + 2, this.y + 3, 28, 37);
    ctx.fillStyle = '#ffe6ac';
    ctx.fillRect(this.x + 5, this.y, 22, 19);
    ctx.fillStyle = '#f47872';
    ctx.fillRect(this.x + 2, this.y + 18, 28, 19);
    ctx.fillStyle = '#fff';
    ctx.fillRect(this.x + 19, this.y + 7, 4, 4);
    ctx.fillStyle = '#274456';
    ctx.fillRect(this.x + 2, this.y + 36, 11, 4);
    ctx.fillRect(this.x + 20, this.y + 36, 11, 4);
  }
}
