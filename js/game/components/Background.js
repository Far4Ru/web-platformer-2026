import { drawBackground } from '../../render/background.js';

export class Background {
  constructor(images, settings) {
    this.images = images;
    this.settings = settings;
  }

  render(ctx, canvas, time, camera, levelWidth, viewport) {
    const width = viewport.right - viewport.left;
    const height = viewport.bottom - viewport.top;
    ctx.save();
    ctx.translate(viewport.left, viewport.top);
    drawBackground(ctx, { width, height }, this.images, this.settings, camera.x, levelWidth, time);
    ctx.restore();
  }
}
