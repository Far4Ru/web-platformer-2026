import { Hazard } from '../../entities/Hazard.js';
import { RisingSpikes } from '../../entities/RisingSpikes.js';
import { HangingSpikes } from '../../entities/HangingSpikes.js';

export class Hazards {
  constructor(level, platforms) {
    this.rising = level.risingSpikes.map((settings) =>
      new RisingSpikes(settings, platforms[settings.platformIndex]));
    this.items = [
      ...level.hazard.map((bounds) => {
        const hazard = new Hazard(bounds);
        hazard.surface = bounds.surface ?? platforms.find((platform) =>
          Math.abs(platform.y - (bounds.y + bounds.height)) < 3
          && bounds.x < platform.x + platform.width
          && bounds.x + bounds.width > platform.x)?.surface ?? 'normal';
        return hazard;
      }),
      ...this.rising,
      ...level.hangingSpikes.map((settings) =>
        new HangingSpikes(settings, platforms[settings.platformIndex])),
    ];
  }

  reset() {
    this.rising.forEach((spikes) => spikes.reset());
  }

  update(dt) {
    this.rising.forEach((spikes) => spikes.update(dt));
  }

  hits(player) {
    return this.items.some((hazard) => hazard.hits(player));
  }
}
