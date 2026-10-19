import { drawBackground } from '../../mock/background.js';

export class Background {
  constructor(scene) {
    this.scene = scene;
  }

  render(ctx, canvas, time) {
    drawBackground(ctx, canvas, this.scene, time);
  }
}
