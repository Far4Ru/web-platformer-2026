import { grassTufts } from '../../render/platform.js';

const RESPONSE_SECONDS = 0.36;

export class GrassMotion {
  constructor() {
    this.reactions = new Map();
  }

  remaining(key) {
    return this.reactions.get(key)?.remaining ?? 0;
  }

  direction(key) {
    return this.reactions.get(key)?.direction ?? 1;
  }

  update(dt, player, platforms) {
    for (const [key, reaction] of this.reactions) {
      const next = reaction.remaining - dt;
      if (next > 0) reaction.remaining = next;
      else this.reactions.delete(key);
    }
    if (!player.grounded || Math.abs(player.vx) < 35) return;
    const feet = player.y + player.height;
    for (const platform of platforms) {
      if (Math.abs(feet - platform.y) > 12
        || player.x + player.width < platform.x
        || player.x > platform.x + platform.width) continue;
      for (const tuft of grassTufts(platform)) {
        if (player.x + player.width > tuft.x - tuft.width / 2
          && player.x < tuft.x + tuft.width / 2) {
          this.reactions.set(tuft.key, {
            remaining: RESPONSE_SECONDS,
            direction: Math.sign(player.vx),
          });
        }
      }
    }
  }
}
