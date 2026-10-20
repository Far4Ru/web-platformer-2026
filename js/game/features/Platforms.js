import { Platform } from '../../entities/Platform.js';
import { moveAndCollide } from '../../engine/collision.js';

export class Platforms {
  constructor(bounds) {
    this.items = bounds.map((item) => new Platform(item));
    this.solidItems = this.items.filter((platform) => !platform.fake);
  }

  update(dt) {
    for (const platform of this.items)
      platform.breakFor = Math.max(0, platform.breakFor - dt);
  }

  touchFake(body, previous) {
    const fall = body.y - previous.y;
    if (fall <= 0) return;
    for (const platform of this.items) {
      if (!platform.fake || platform.broken) continue;
      const previousBottom = previous.y + body.height;
      const currentBottom = body.y + body.height;
      if (previousBottom > platform.y || currentBottom < platform.y) continue;
      const fraction = (platform.y - previousBottom) / fall;
      const crossingX = previous.x + (body.x - previous.x) * fraction;
      if (crossingX < platform.x + platform.width
        && crossingX + body.width > platform.x) platform.break();
    }
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
