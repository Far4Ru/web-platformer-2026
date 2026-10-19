import { Hazard } from './Hazard.js';

export class HangingSpikes extends Hazard {
  constructor(settings, platform) {
    super({
      x: platform.x + settings.offsetX,
      y: platform.y + platform.height,
      width: settings.width,
      height: settings.height,
    });
    this.kind = 'hanging';
  }
}
