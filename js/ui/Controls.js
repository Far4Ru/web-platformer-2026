import { drawIcon } from '../render/controls.js';

function contains(rect, point) {
  return point.x >= rect.x && point.x < rect.x + rect.width &&
    point.y >= rect.y && point.y < rect.y + rect.height;
}

function drawMovementSymbol(ctx, rect, action) {
  const centerX = rect.x + rect.width / 2;
  const centerY = rect.y + rect.height / 2;
  const unit = rect.width / 112;
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, 27 * unit, 0, Math.PI * 2);
  const face = ctx.createRadialGradient(centerX, centerY - 7 * unit, 2 * unit,
    centerX, centerY, 27 * unit);
  face.addColorStop(0, '#514034');
  face.addColorStop(1, '#211b1a');
  ctx.fillStyle = face;
  ctx.fill();
  ctx.translate(centerX, centerY);
  ctx.rotate(action === 'left' ? Math.PI : action === 'jump' ? -Math.PI / 2 : 0);
  ctx.scale(unit, unit);
  ctx.beginPath();
  ctx.moveTo(-18, -6);
  ctx.lineTo(2, -6);
  ctx.lineTo(2, -15);
  ctx.lineTo(19, 0);
  ctx.lineTo(2, 15);
  ctx.lineTo(2, 6);
  ctx.lineTo(-18, 6);
  ctx.closePath();
  ctx.fillStyle = '#ffdfa0';
  ctx.strokeStyle = '#76512d';
  ctx.lineWidth = 2;
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

export class Controls {
  constructor(ui, texts, images) {
    this.ui = ui;
    this.texts = texts;
    this.images = images;
    this.showTouch = matchMedia('(pointer: coarse)').matches;
    this.touchVisuals = {
      left: { x: 28, y: 372, width: 112, height: 112 },
      right: { x: 184, y: 372, width: 112, height: 112 },
      jump: { x: 820, y: 372, width: 112, height: 112 },
    };
    this.touchAreas = {
      left: { x: 7, y: 320, width: 154, height: 220 },
      right: { x: 163, y: 320, width: 154, height: 220 },
      jump: { x: 799, y: 320, width: 154, height: 220 },
    };
  }

  layout(viewport) {
    const { left, right, top, bottom } = viewport;
    Object.assign(this.touchVisuals.left, { x: left + 28, y: bottom - 168 });
    Object.assign(this.touchVisuals.right, { x: left + 184, y: bottom - 168 });
    Object.assign(this.touchVisuals.jump, { x: right - 140, y: bottom - 168 });
    if (bottom - top > (right - left) * 1.05) {
      const leftEdge = (this.touchVisuals.left.x + this.touchVisuals.left.width
        + this.touchVisuals.right.x) / 2;
      const rightEdge = (this.touchVisuals.right.x + this.touchVisuals.right.width
        + this.touchVisuals.jump.x) / 2;
      const y = bottom - 300;
      Object.assign(this.touchAreas.left, { x: left, y, width: leftEdge - left, height: 300 });
      Object.assign(this.touchAreas.right, { x: leftEdge, y,
        width: rightEdge - leftEdge, height: 300 });
      Object.assign(this.touchAreas.jump, { x: rightEdge, y,
        width: right - rightEdge, height: 300 });
    } else {
      Object.assign(this.touchAreas.left, { x: left + 7, y: bottom - 220,
        width: 154, height: 220 });
      Object.assign(this.touchAreas.right, { x: left + 163, y: bottom - 220,
        width: 154, height: 220 });
      Object.assign(this.touchAreas.jump, { x: right - 161, y: bottom - 220,
        width: 154, height: 220 });
    }
  }

  hit(point, state) {
    if (contains(this.ui.icons.restart, point)) return 'restart';
    if (contains(this.ui.icons.sound, point)) return 'sound';
    if (['playing', 'paused'].includes(state) && contains(this.ui.icons.pause, point)) return 'pause';
    if (state === 'playing' && this.showTouch) {
      for (const [action, rect] of Object.entries(this.touchAreas)) {
        if (contains(rect, point)) return action;
      }
    }
    return null;
  }

  render(ctx, state, muted = false) {
    drawIcon(ctx, this.ui.icons.pause, 'pause', this.ui.colors, state === 'paused', !['playing', 'paused'].includes(state), this.images);
    drawIcon(ctx, this.ui.icons.sound, 'sound', this.ui.colors, muted, false, this.images);
    drawIcon(ctx, this.ui.icons.restart, 'restart', this.ui.colors, false, false, this.images);
    if (state === 'playing' && this.showTouch) {
      ctx.save();
      const touchImages = {
        left: this.images.controlLeft,
        right: this.images.controlRight,
        jump: this.images.controlUp,
      };
      for (const [action, rect] of Object.entries(this.touchVisuals)) {
        ctx.globalAlpha = 0.85;
        ctx.drawImage(touchImages[action], rect.x, rect.y, rect.width, rect.height);
        drawMovementSymbol(ctx, rect, action);
      }
      ctx.restore();
    }
  }
}
