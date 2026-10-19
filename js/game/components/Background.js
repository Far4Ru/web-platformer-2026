import { drawBackground } from '../../render/background.js';

export class Background {
  constructor(images, settings) {
    this.images = images;
    this.settings = settings;
  }

  render(ctx, canvas, time, camera, levelWidth) {
    drawBackground(ctx, canvas, this.images, this.settings, camera.x, levelWidth);
  }
}
