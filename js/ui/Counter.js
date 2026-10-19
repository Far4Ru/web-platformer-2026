export class Counter {
  constructor(rect, label, ui) {
    this.rect = rect;
    this.label = label;
    this.ui = ui;
  }

  render(ctx, value) {
    const { x, y, width, height } = this.rect;
    const { colors, font } = this.ui;
    ctx.save();
    ctx.fillStyle = colors.panel;
    ctx.strokeStyle = colors.panelBorder;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();
    ctx.stroke();
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
