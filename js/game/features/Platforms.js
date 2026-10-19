import { Platform } from '../../entities/Platform.js';
import { moveAndCollide } from '../../engine/collision.js';

export class Platforms {
  constructor(bounds) {
    this.items = bounds.map((item) => new Platform(item));
    this.solidItems = this.items.filter((platform) => !platform.fake);
  }

  move(body, dt) {
    const solids = this.solidItems.flatMap((platform) => {
      if (!platform.holeFor) return [platform];
      const left = platform.holeX - platform.x;
      const right = platform.x + platform.width - platform.holeX - platform.holeWidth;
      return [
        { ...platform, width: left, source: platform },
        { ...platform, x: platform.holeX + platform.holeWidth, width: right, source: platform },
      ].filter((part) => part.width > 0);
    });
    moveAndCollide(body, solids, dt);
    if (body.groundPlatform?.source) body.groundPlatform = body.groundPlatform.source;
  }
}
