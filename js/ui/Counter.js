import { drawCounterPanel } from '../render/counter.js';

export class Counter {
  constructor(rect, label, ui, images) {
    this.rect = rect;
    this.label = label;
    this.ui = ui;
    this.images = images;
  }

  render(ctx, value) {
    const { x, y } = this.rect;
    const { colors, font } = this.ui;
    ctx.save();
    drawCounterPanel(ctx, this.rect, colors, this.images);
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    const icon = this.label === 'coin' ? this.images.objects[0][0] : this.images.iconTrophy;
    ctx.drawImage(icon, x + 8, y + 8, 40, 40);
    ctx.fillStyle = colors.gold;
    ctx.font = `bold 24px ${font}`;
    ctx.fillText(String(value), x + 55, y + 29, this.rect.width - 62);
    ctx.restore();
  }
}
