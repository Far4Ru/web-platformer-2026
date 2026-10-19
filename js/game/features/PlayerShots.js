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

  update(dt, enemies) {
    for (const shot of this.items) {
      shot.update(dt);
      const enemy = enemies.items.find((target) => target.alive && overlaps(shot, target));
      if (enemy) {
        enemy.takeDamage(shot.damage, shot.stun);
        if (shot.freeze) enemy.freeze(shot.freeze);
        shot.life = 0;
      }
    }
    this.items = this.items.filter((shot) => shot.life > 0);
  }
}
