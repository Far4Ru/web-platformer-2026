import { drawCounterPanel } from '../mock/counter.js';

export class Counter {
  constructor(rect, label, ui) {
    this.rect = rect;
    this.label = label;
    this.ui = ui;
  }

  render(ctx, value) {
    const { x, y } = this.rect;
    const { colors, font } = this.ui;
    ctx.save();
    drawCounterPanel(ctx, this.rect, colors);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.muted;
    ctx.font = `14px ${font}`;
    ctx.fillText(this.label, x + 13, y + 17);
    ctx.fillStyle = colors.gold;
    ctx.font = `23px ${font}`;
    ctx.fillText(String(value), x + 13, y + 40);
    ctx.restore();
  }
}
