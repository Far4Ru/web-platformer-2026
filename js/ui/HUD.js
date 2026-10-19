import { Counter } from './Counter.js';

export class HUD {
  constructor(ui, texts, worldWidth, images) {
    this.ui = ui;
    this.texts = texts;
    this.worldWidth = worldWidth;
    this.score = new Counter(ui.counters.score, texts.scoreLabel, ui, images);
    this.best = new Counter(ui.counters.best, texts.bestLabel, ui, images);
  }

  render(ctx, collected, best) {
    this.score.render(ctx, collected);
    this.best.render(ctx, best);
  }
}
