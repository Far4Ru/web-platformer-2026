import { Hazard } from './Hazard.js';

export class RisingSpikes extends Hazard {
  constructor(settings, platform) {
    super({
      x: platform.x + settings.offsetX,
      y: platform.y,
      width: settings.width,
      height: 0,
    });
    this.kind = 'rising';
    this.baseY = platform.y;
    this.maxHeight = settings.maxHeight;
    this.period = settings.period;
    this.activeDuration = settings.activeDuration;
    this.riseTime = settings.riseTime;
    this.fallTime = settings.fallTime;
    this.phase = settings.phase;
    this.reset();
  }

  reset() {
    this.elapsed = 0;
    this.updateHeight();
  }

  update(dt) {
    this.elapsed += dt;
    this.updateHeight();
  }

  updateHeight() {
    const time = (this.elapsed + this.phase) % this.period;
    let fraction = 0;
    if (time < this.riseTime) fraction = time / this.riseTime;
    else if (time < this.activeDuration - this.fallTime) fraction = 1;
    else if (time < this.activeDuration) {
      fraction = (this.activeDuration - time) / this.fallTime;
    }
    this.height = this.maxHeight * fraction;
    this.y = this.baseY - this.height;
  }

  hits(player) {
    return this.height > 0 && super.hits(player);
  }
}
