import { Hazard } from '../../entities/Hazard.js';
import { RisingSpikes } from '../../entities/RisingSpikes.js';
import { HangingSpikes } from '../../entities/HangingSpikes.js';

export class Hazards {
  constructor(level, platforms) {
    this.rising = level.risingSpikes.map((settings) =>
      new RisingSpikes(settings, platforms[settings.platformIndex]));
    this.items = [
      ...level.hazard.map((bounds) => new Hazard(bounds)),
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
