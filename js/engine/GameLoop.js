export class GameLoop {
  constructor(update, render, maxFrameStep) {
    this.update = update;
    this.render = render;
    this.maxFrameStep = maxFrameStep;
    this.lastTime = null;
    this.running = false;
  }

  start() {
    if (this.running) return;
    this.running = true;
    requestAnimationFrame((time) => this.frame(time));
  }

  resetTime() {
    this.lastTime = null;
  }

  frame(time) {
    const dt = this.lastTime === null ? 0 : Math.min((time - this.lastTime) / 1000, this.maxFrameStep);
    this.lastTime = time;
    this.update(dt);
    this.render(time / 1000);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }
}
