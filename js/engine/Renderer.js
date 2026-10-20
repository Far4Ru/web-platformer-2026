export class Renderer {
  constructor(ctx, canvas, world) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.world = world;
  }

  render(scene, time) {
    const { ctx, canvas, world } = this;
    const scale = Math.min(canvas.width / world.width, canvas.height / world.height);
    const offsetX = (canvas.width - world.width * scale) / 2;
    const offsetY = (canvas.height - world.height * scale) / 2;
    const viewport = {
      left: -offsetX / scale, top: -offsetY / scale,
      right: (canvas.width - offsetX) / scale,
      bottom: (canvas.height - offsetY) / scale,
    };
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    scene.render(ctx, world, time, viewport);
  }

  toWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const scale = Math.min(this.canvas.width / this.world.width,
      this.canvas.height / this.world.height);
    return {
      x: ((clientX - rect.left) * this.canvas.width / rect.width
        - (this.canvas.width - this.world.width * scale) / 2) / scale,
      y: ((clientY - rect.top) * this.canvas.height / rect.height
        - (this.canvas.height - this.world.height * scale) / 2) / scale,
    };
  }
}
