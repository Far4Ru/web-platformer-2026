import { drawIcon, drawTouchButton } from '../render/controls.js';

function contains(rect, point) {
  return point.x >= rect.x && point.x <= rect.x + rect.width &&
    point.y >= rect.y && point.y <= rect.y + rect.height;
}

export class Controls {
  constructor(ui, texts, images) {
    this.ui = ui;
    this.texts = texts;
    this.images = images;
    this.showTouch = matchMedia('(pointer: coarse)').matches;
  }

  hit(point, state) {
    if (contains(this.ui.icons.restart, point)) return 'restart';
    if (contains(this.ui.icons.sound, point)) return 'sound';
    if (['playing', 'paused'].includes(state) && contains(this.ui.icons.pause, point)) return 'pause';
    if (state === 'playing' && this.showTouch) {
      for (const [action, rect] of Object.entries(this.ui.touch)) {
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
      for (const [action, rect] of Object.entries(this.ui.touch)) {
        drawTouchButton(ctx, rect, this.texts.touchLabels[action], this.ui, this.images, action);
      }
    }
  }
}
