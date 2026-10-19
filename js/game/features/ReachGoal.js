import { Goal } from '../../entities/Goal.js';

export class ReachGoal {
  constructor(bounds) {
    this.goal = new Goal(bounds);
    this.openFraction = bounds.openFraction;
    this.requiresBoss = !!bounds.requiresBoss;
  }

  progress(collectCoins) {
    return Math.min(1, collectCoins.count / collectCoins.total);
  }

  isReady(collectCoins, bossDefeated = true) {
    return this.progress(collectCoins) >= this.openFraction
      && (!this.requiresBoss || bossDefeated);
  }

  reachedBy(player, collectCoins, bossDefeated = true) {
    return this.isReady(collectCoins, bossDefeated) && this.goal.hits(player);
  }
}
