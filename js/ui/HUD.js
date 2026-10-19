import { Counter } from './Counter.js';

export class HUD {
  constructor(ui, texts, worldWidth) {
    this.ui = ui;
    this.texts = texts;
    this.worldWidth = worldWidth;
    this.score = new Counter(ui.counters.score, texts.scoreLabel, ui);
    this.best = new Counter(ui.counters.best, texts.bestLabel, ui);
  }

  render(ctx, collected, total, best) {
    this.score.render(ctx, `${collected} / ${total}`);
    this.best.render(ctx, best);
    ctx.save();
    ctx.fillStyle = this.ui.colors.panel;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, this.ui.hintY - 22, this.worldWidth, 34);
    ctx.globalAlpha = 1;
    ctx.fillStyle = this.ui.colors.text;
    ctx.font = `18px ${this.ui.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.texts.keyboardHint, this.worldWidth / 2, this.ui.hintY);
    ctx.restore();
  }
}
