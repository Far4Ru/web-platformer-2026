import { drawSheetFrame } from '../render/sprites.js';

export class Counter {
  constructor(rect, label, ui, images) {
    this.rect = rect;
    this.label = label;
    this.ui = ui;
    this.images = images;
  }

  render(ctx, value, time = 0, pulse = 0, coinFrame = 0) {
    const { x, y, width, height } = this.rect;
    ctx.save();
    ctx.textBaseline = 'middle';
    if (this.label === 'coin') {
      const frameWidth = Math.min(width,
        height * this.images.coinCounter.width / this.images.coinCounter.height);
      ctx.drawImage(this.images.coinCounter, x, y, frameWidth, height);
      drawSheetFrame(ctx, this.images.coinAnimation, coinFrame, 4,
        x + 13, y + 10, 34, 34);
      ctx.translate(x + frameWidth * 0.7, y + height / 2 + 1);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#34230f';
      ctx.strokeStyle = '#ffe9ab';
      ctx.lineWidth = 2;
      ctx.font = `bold 25px ${this.ui.font}`;
      ctx.scale(1 + pulse * 0.2, 1 + pulse * 0.2);
      ctx.strokeText(String(value), 0, 0, frameWidth - 68);
      ctx.fillText(String(value), 0, 0, frameWidth - 68);
    } else {
      ctx.drawImage(this.images.ancientTrophy ?? this.images.iconTrophy,
        x + 3, y + (height - 34) / 2, 34, 34);
      ctx.translate(x + 60, y + height / 2 + 1);
      ctx.textAlign = 'center';
      ctx.fillStyle = '#fff0c6';
      ctx.strokeStyle = '#241811';
      ctx.lineWidth = 2.5;
      ctx.font = `bold 22px ${this.ui.font}`;
      ctx.strokeText(String(value), 0, 0, width - 72);
      ctx.fillText(String(value), 0, 0, width - 72);
    }
    ctx.restore();
  }
}
