import { Counter } from './Counter.js';
import { drawHintPanel } from '../mock/hud.js';

export class HUD {
  constructor(ui, texts, worldWidth) {
    this.ui = ui;
    this.texts = texts;
    this.worldWidth = worldWidth;
    this.score = new Counter(ui.counters.score, texts.scoreLabel, ui);
    this.best = new Counter(ui.counters.best, texts.bestLabel, ui);
  }

  render(ctx, collected, best) {
    this.score.render(ctx, collected);
    this.best.render(ctx, best);
    ctx.save();
    drawHintPanel(ctx, this.worldWidth, this.ui.hintY, this.ui.colors.panel);
    ctx.fillStyle = this.ui.colors.text;
    ctx.font = `18px ${this.ui.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(this.texts.keyboardHint, this.worldWidth / 2, this.ui.hintY);
    ctx.restore();
  }
}
