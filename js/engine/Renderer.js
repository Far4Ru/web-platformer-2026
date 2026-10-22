export class Renderer {
  constructor(ctx, canvas, world) {
    this.ctx = ctx;
    this.canvas = canvas;
    this.world = world;
  }

  layout() {
    const { canvas, world } = this;
    const portrait = canvas.height > canvas.width * 1.05;
    const visibleWidth = portrait
      ? Math.max(500, Math.min(760, 940 * canvas.width / canvas.height))
      : world.width;
    const scale = portrait ? canvas.width / visibleWidth
      : Math.min(canvas.width / world.width, canvas.height / world.height);
    const offsetX = (canvas.width - world.width * scale) / 2;
    const offsetY = portrait ? 0 : (canvas.height - world.height * scale) / 2;
    return { scale, offsetX, offsetY, viewport: {
      left: -offsetX / scale, top: -offsetY / scale,
      right: (canvas.width - offsetX) / scale,
      bottom: (canvas.height - offsetY) / scale,
    } };
  }

  render(scene, time) {
    const { ctx, canvas, world } = this;
    const { scale, offsetX, offsetY, viewport } = this.layout();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.setTransform(scale, 0, 0, scale, offsetX, offsetY);
    scene.render(ctx, world, time, viewport);
  }

  toWorld(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    const { scale, offsetX, offsetY } = this.layout();
    return {
      x: ((clientX - rect.left) * this.canvas.width / rect.width
        - offsetX) / scale,
      y: ((clientY - rect.top) * this.canvas.height / rect.height
        - offsetY) / scale,
    };
  }
}
