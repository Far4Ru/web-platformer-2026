import { drawBoostSymbol } from '../render/boosts.js';

export class BoostBar {
  constructor(ui, canvasWidth) {
    this.ui = ui;
    this.canvasWidth = canvasWidth;
  }

  render(ctx, boosts, image, yOverride = null) {
    const active = Object.entries(boosts.remaining).filter(([, time]) => time > 0);
    if (!active.length) return;
    const { size, gap, colors } = this.ui.boosts;
    const y = yOverride ?? this.ui.boosts.y;
    const startX = (this.canvasWidth - active.length * size - (active.length - 1) * gap) / 2;
    active.forEach(([kind, time], index) => {
      const x = startX + index * (size + gap);
      ctx.save();
      ctx.fillStyle = colors.border;
      ctx.fillRect(x, y, size, size);
      ctx.fillStyle = colors.panel;
      ctx.fillRect(x + 2, y + 2, size - 4, size - 4);
      drawBoostSymbol(ctx, kind, x + size / 2, y + size / 2 - 3,
        colors[kind], size * 0.65, image);
      ctx.fillStyle = colors.text;
      ctx.font = `12px ${this.ui.font}`;
      ctx.textAlign = 'right';
      ctx.textBaseline = 'bottom';
      ctx.fillText(`${Math.ceil(time)}`, x + size - 3, y + size - 2);
      ctx.restore();
    });
  }
}
