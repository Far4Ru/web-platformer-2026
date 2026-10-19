function contains(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width &&
    point.y >= rect.y && point.y <= rect.y + rect.height;
}

export class Controls {
  constructor(ui, texts) {
    this.ui = ui;
    this.texts = texts;
    this.showTouch = matchMedia('(pointer: coarse)').matches;
  }

  hit(point, state) {
    if (contains(this.ui.icons.restart, point)) return 'restart';
    if (['playing', 'paused'].includes(state) && contains(this.ui.icons.pause, point)) return 'pause';
    if (state === 'playing' && this.showTouch) {
      for (const [action, rect] of Object.entries(this.ui.touch)) {
        if (contains(rect, point)) return action;
      }
    }
    return null;
  }

  render(ctx, state) {
    this.drawIcon(ctx, this.ui.icons.pause, 'pause', state === 'paused', !['playing', 'paused'].includes(state));
    this.drawIcon(ctx, this.ui.icons.restart, 'restart');
    if (state === 'playing' && this.showTouch) {
      for (const [action, rect] of Object.entries(this.ui.touch)) {
        this.drawTouch(ctx, rect, this.texts.touchLabels[action]);
      }
    }
  }

  drawIcon(ctx, rect, icon, resumed = false, disabled = false) {
    const { x, y, width, height } = rect;
    ctx.save();
    if (disabled) ctx.globalAlpha = 0.45;
    ctx.fillStyle = this.ui.colors.panel;
    ctx.strokeStyle = this.ui.colors.panelBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(x, y, width, height, 10);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.ui.colors.text;
    const cx = x + width / 2;
    const cy = y + height / 2;
    if (icon === 'pause' && !resumed) {
      ctx.fillRect(cx - 10, cy - 12, 6, 24);
      ctx.fillRect(cx + 4, cy - 12, 6, 24);
    } else if (icon === 'pause') {
      ctx.beginPath();
      ctx.moveTo(cx - 7, cy - 13);
      ctx.lineTo(cx + 12, cy);
      ctx.lineTo(cx - 7, cy + 13);
      ctx.fill();
    } else {
      ctx.strokeStyle = this.ui.colors.text;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, 13, -0.7, 4.4);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 14);
      ctx.lineTo(cx + 17, cy - 14);
      ctx.lineTo(cx + 15, cy - 7);
      ctx.fill();
    }
    ctx.restore();
  }

  drawTouch(ctx, rect, label) {
    ctx.save();
    ctx.fillStyle = this.ui.colors.touch;
    ctx.strokeStyle = this.ui.colors.panelBorder;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 14);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = this.ui.colors.text;
    ctx.font = `43px ${this.ui.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2);
    ctx.restore();
  }
}
