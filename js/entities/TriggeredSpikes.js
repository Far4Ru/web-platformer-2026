import { Hazard } from './Hazard.js';

export class TriggeredSpikes extends Hazard {
  constructor(x, platformY, settings) {
    super({ x, y: platformY, width: settings.width, height: 0 });
    this.baseY = platformY;
    this.settings = settings;
    this.maxHeight = settings.height;
    this.duration = settings.duration;
    this.elapsed = 0;
    this.life = this.duration;
  }

  update(dt) {
    this.elapsed += dt;
    this.life = Math.max(0, this.duration - this.elapsed);
    const rise = Math.min(1, this.elapsed / this.settings.riseTime);
    const fall = Math.min(1, this.life / this.settings.fallTime);
    this.height = this.maxHeight * Math.min(rise, fall);
    this.y = this.baseY - this.height;
  }

  hits(player) {
    return this.height > 0 && super.hits(player);
  }
}
