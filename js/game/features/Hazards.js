import { Hazard } from '../../entities/Hazard.js';

export class Hazards {
  constructor(bounds) {
    const entries = Array.isArray(bounds) ? bounds : [bounds];
    this.items = entries.map((item) => new Hazard(item));
  }

  hits(player) {
    return this.items.some((hazard) => hazard.hits(player));
  }
}
