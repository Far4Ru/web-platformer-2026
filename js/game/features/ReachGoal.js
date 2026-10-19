import { Goal } from '../../entities/Goal.js';

export class ReachGoal {
  constructor(bounds) {
    this.goal = new Goal(bounds);
    this.openFraction = bounds.openFraction;
    this.requiresBoss = !!bounds.requiresBoss;
  }

  progress(collectLetters) {
    return collectLetters.count / collectLetters.items.length;
  }

  isReady(collectLetters, bossDefeated = true) {
    return this.progress(collectLetters) >= this.openFraction
      && (!this.requiresBoss || bossDefeated);
  }

  reachedBy(player, collectLetters, bossDefeated = true) {
    return this.isReady(collectLetters, bossDefeated) && this.goal.hits(player);
  }
}
