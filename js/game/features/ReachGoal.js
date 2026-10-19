import { Goal } from '../../entities/Goal.js';

export class ReachGoal {
  constructor(bounds) {
    this.goal = new Goal(bounds);
    this.openFraction = bounds.openFraction;
  }

  progress(collectLetters) {
    return collectLetters.count / collectLetters.items.length;
  }

  isReady(collectLetters) {
    return this.progress(collectLetters) >= this.openFraction;
  }

  reachedBy(player, collectLetters) {
    return this.isReady(collectLetters) && this.goal.hits(player);
  }
}
