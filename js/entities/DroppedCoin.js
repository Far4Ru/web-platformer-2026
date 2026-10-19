import { Coin } from './Coin.js';

export class DroppedCoin extends Coin {
  constructor(sourceIndex, index, count, settings) {
    super({ x: 0, y: 0, width: settings.size, height: settings.size });
    this.sourceIndex = sourceIndex;
    this.index = index;
    this.count = count;
    this.settings = settings;
    this.reset();
  }

  reset() {
    super.reset();
    this.active = false;
    this.settled = false;
    this.platform = null;
    this.vx = 0;
    this.vy = 0;
  }

  release(enemy) {
    this.active = true;
    this.x = enemy.x + enemy.width / 2 - this.width / 2;
    this.y = enemy.y + enemy.height / 2 - this.height / 2;
    this.platform = enemy.platform;
    this.vx = (this.index - (this.count - 1) / 2) * this.settings.scatterSpeed;
    this.vy = -this.settings.popSpeed;
  }

  update(dt, player, magnet) {
    if (!this.active || this.collected) return false;
    if (!this.attracted && !this.settled) {
      this.x += this.vx * dt;
      this.y += this.vy * dt + this.settings.gravity * dt * dt / 2;
      this.vy += this.settings.gravity * dt;
      if (this.y + this.height >= this.platform.y) {
        this.x = Math.max(this.platform.x,
          Math.min(this.platform.x + this.platform.width - this.width, this.x));
        this.y = this.platform.y - this.height;
        this.settled = true;
      }
    }
    return super.update(dt, player, magnet);
  }
}
