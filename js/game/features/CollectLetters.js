import { Letter } from '../../entities/Letter.js';
import { DroppedLetter } from '../../entities/DroppedLetter.js';

export class CollectLetters {
  constructor(bounds, enemySettings, dropSettings, magnet) {
    this.magnet = magnet;
    this.drops = enemySettings.flatMap((enemy, sourceIndex) =>
      Array.from({ length: enemy.maxHealth }, (_, index) =>
        new DroppedLetter(sourceIndex, index, enemy.maxHealth, dropSettings)));
    this.items = [...bounds.map((item) => new Letter(item)), ...this.drops];
  }

  get count() {
    return this.items.filter((letter) => letter.collected).length;
  }

  reset() {
    this.items.forEach((letter) => letter.reset());
  }

  releaseDrops(enemies) {
    enemies.forEach((enemy, sourceIndex) => {
      if (enemy.alive || enemy.dropped) return;
      enemy.dropped = true;
      for (const letter of this.drops) {
        if (letter.sourceIndex === sourceIndex) letter.release(enemy);
      }
    });
  }

  update(dt, player) {
    let changed = false;
    for (const letter of this.items) {
      if (letter.update(dt, player, this.magnet)) changed = true;
    }
    return changed;
  }
}
