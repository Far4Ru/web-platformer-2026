import { Counter } from './Counter.js';

export class HUD {
  constructor(ui, texts, worldWidth, images) {
    this.ui = ui;
    this.texts = texts;
    this.worldWidth = worldWidth;
    this.score = new Counter(ui.counters.score, 'coin', ui, images);
    this.best = new Counter(ui.counters.best, 'trophy', ui, images);
  }

  render(ctx, collected, best) {
    this.score.render(ctx, collected);
    this.best.render(ctx, best);
  }
}
