import { overlaps } from '../../engine/collision.js';

export class PlayerShots {
  constructor() {
    this.reset();
  }

  reset() {
    this.items = [];
  }

  add(shot) {
    this.items.push(shot);
  }

  update(dt, enemies, damageMultiplier = 1, platforms = [], onHit = () => {}) {
    for (const shot of this.items) {
      shot.update(dt);
      if (shot.delay > 0 || shot.orbit) continue;
      if (shot.rolling) {
        const landing = platforms.find((platform) => !platform.fake
          && shot.x + shot.width > platform.x && shot.x < platform.x + platform.width
          && shot.vy >= 0 && shot.y + shot.height >= platform.y
          && shot.y + shot.height - shot.vy * dt <= platform.y + 6);
        if (landing) {
          shot.y = landing.y - shot.height;
          shot.vy = 0;
        }
      }
      const enemy = enemies.items.find((target) => target.alive
        && target !== shot.missedTarget && overlaps(shot, target));
      if (enemy) {
        const damaged = enemy.takeDamage(shot.damage * damageMultiplier, shot.stun);
        if (shot.freeze && damaged !== false) enemy.freeze(shot.freeze);
        if (damaged !== false) onHit(shot.kind, enemy);
        shot.life = 0;
      }
    }
    this.items = this.items.filter((shot) => shot.life > 0);
  }
}
