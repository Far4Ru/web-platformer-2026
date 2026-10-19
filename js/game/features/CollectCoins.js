import { Coin } from '../../entities/Coin.js';
import { DroppedCoin } from '../../entities/DroppedCoin.js';

export class CollectCoins {
  constructor(bounds, enemySettings, dropSettings, magnet) {
    this.magnet = magnet;
    this.drops = enemySettings.flatMap((enemy, sourceIndex) => {
      const count = enemy.maxHealth + (enemy.boss ? 5 : 1);
      return Array.from({ length: count }, (_, index) =>
        new DroppedCoin(sourceIndex, index, count, dropSettings));
    });
    this.items = [...bounds.map((item) => new Coin(item)), ...this.drops];
    this.bonus = 0;
    this.dropSettings = dropSettings;
  }

  get count() {
    return this.bonus + this.items.filter((coin) => coin.collected).length;
  }

  get total() {
    return this.items.length;
  }

  grant(amount) {
    this.bonus += amount;
  }

  discardDrops(sourceIndex) {
    const discarded = this.drops.filter((coin) => coin.sourceIndex === sourceIndex);
    this.drops = this.drops.filter((coin) => coin.sourceIndex !== sourceIndex);
    this.items = this.items.filter((coin) => !discarded.includes(coin));
  }

  reset() {
    this.items.forEach((coin) => coin.reset());
    this.bonus = 0;
  }

  releaseDrops(enemies, extraCoins = 0) {
    enemies.forEach((enemy, sourceIndex) => {
      if (enemy.alive || enemy.dropped) return;
      enemy.dropped = true;
      const drops = this.drops.filter((coin) => coin.sourceIndex === sourceIndex);
      for (let index = 0; index < extraCoins; index++) {
        const coin = new DroppedCoin(sourceIndex, drops.length + index,
          drops.length + extraCoins, this.dropSettings);
        this.drops.push(coin);
        this.items.push(coin);
        drops.push(coin);
      }
      for (const coin of drops) coin.release(enemy);
    });
  }

  update(dt, player) {
    let changed = false;
    for (const coin of this.items) {
      if (coin.update(dt, player, this.magnet)) changed = true;
    }
    return changed;
  }
}
