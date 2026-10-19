export class Renderer {
  constructor(ctx, canvas) {
    this.ctx = ctx;
    this.canvas = canvas;
  }

  render(scene, time) {
    scene.render(this.ctx, this.canvas, time);
  }
}
