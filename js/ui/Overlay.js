import { drawOverlayButton, drawOverlayFrame } from '../render/overlay.js';

export class Overlay {
  constructor(ui, texts, world, images) {
    this.ui = ui;
    this.texts = texts;
    this.world = world;
    this.images = images;
  }

  hitPrimary(point) {
    const rect = this.ui.overlay.button;
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
      point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  render(ctx, state) {
    const copy = this.texts.overlays[state];
    if (!copy) return;
    const { panel, button } = this.ui.overlay;
    const { colors, font } = this.ui;
    ctx.save();
    drawOverlayFrame(ctx, this.world, panel, colors, this.images);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = colors.accent;
    ctx.font = `17px ${font}`;
    ctx.fillText(copy.kicker, this.world.width / 2, panel.y + 48);
    ctx.fillStyle = '#342619';
    ctx.font = `36px ${font}`;
    ctx.fillText(copy.title, this.world.width / 2, panel.y + 95);
    ctx.fillStyle = '#4d3c2e';
    ctx.font = `20px ${font}`;
    this.drawWrapped(ctx, copy.description, this.world.width / 2, panel.y + 142, panel.width - 72);
    drawOverlayButton(ctx, button, colors.button, this.images);
    ctx.fillStyle = colors.buttonText;
    ctx.font = `23px ${font}`;
    ctx.fillText(copy.button, button.x + button.width / 2, button.y + button.height / 2 + 1);
    ctx.restore();
  }

  drawWrapped(ctx, text, x, y, maxWidth) {
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        ctx.fillText(line, x, y);
        y += 26;
        line = word;
      } else {
        line = next;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }
}
