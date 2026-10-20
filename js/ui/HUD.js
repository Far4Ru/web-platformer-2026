import { Counter } from './Counter.js';
import { drawSheetFrame } from '../render/sprites.js';

export class HUD {
  constructor(ui, texts, worldWidth, images) {
    this.ui = ui;
    this.texts = texts;
    this.worldWidth = worldWidth;
    this.score = new Counter(ui.counters.score, 'coin', ui, images);
    this.best = new Counter(ui.counters.best, 'trophy', ui, images);
    this.images = images;
    this.reset();
  }

  reset() {
    this.displayed = 0;
    this.flights = [];
    this.pulse = 0;
    this.tick = 0;
    this.coinSpin = 0;
  }

  collect(coins, camera) {
    if (coins.length) this.coinSpin = 0.48;
    for (const coin of coins) this.flights.push({
      x: coin.x + coin.width / 2 - camera.x,
      y: coin.y + coin.height / 2 - camera.y,
      age: 0,
      duration: 0.85 + this.flights.length * 0.06,
    });
  }

  update(dt, total) {
    this.coinSpin = Math.max(0, this.coinSpin - dt);
    this.pulse = Math.max(0, this.pulse - dt * 4);
    this.tick += dt;
    for (const flight of this.flights) flight.age += dt;
    const arrived = this.flights.filter((flight) => flight.age >= flight.duration).length;
    this.flights = this.flights.filter((flight) => flight.age < flight.duration);
    if (arrived) {
      this.displayed = Math.min(total, this.displayed + arrived);
      this.pulse = 1;
    }
    if (this.displayed < total - this.flights.length && this.tick >= 0.055) {
      this.displayed++;
      this.tick = 0;
      this.pulse = 1;
    }
    if (this.displayed > total) this.displayed = total;
  }

  render(ctx, collected, best, time = 0) {
    const coinFrame = this.coinSpin > 0
      ? Math.min(3, Math.floor((1 - this.coinSpin / 0.48) * 4)) : 0;
    this.score.render(ctx, this.displayed, time, this.pulse, coinFrame);
    this.best.render(ctx, best, time);
    const target = this.ui.counters.score;
    for (const flight of this.flights) {
      const t = Math.min(1, flight.age / flight.duration);
      ctx.save();
      for (let i = 12; i >= 1; i--) {
        const p = t - i * 0.025;
        if (p < 0) continue;
        const curve = p * p * (3 - 2 * p);
        const x = flight.x + (target.x + 28 - flight.x) * curve;
        const y = flight.y + (target.y + 28 - flight.y) * curve
          - Math.sin(p * Math.PI) * 80;
        const size = 9 + (12 - i) * 0.8;
        ctx.globalAlpha = 0.38 + (12 - i) * 0.045;
        ctx.shadowColor = '#ffe58c';
        ctx.shadowBlur = 16;
        ctx.drawImage(this.images.effects[2][1],
          x - size / 2, y - size / 2, size, size);
      }
      const curve = t * t * (3 - 2 * t);
      const x = flight.x + (target.x + 28 - flight.x) * curve;
      const y = flight.y + (target.y + 28 - flight.y) * curve
        - Math.sin(t * Math.PI) * 80;
      ctx.globalAlpha = 1;
      ctx.shadowColor = '#ffdf78';
      ctx.shadowBlur = 18;
      drawSheetFrame(ctx, this.images.coinAnimation, Math.min(3, Math.floor(t * 4)), 4,
        x - 13, y - 13, 26, 26);
      ctx.restore();
    }
  }
}
