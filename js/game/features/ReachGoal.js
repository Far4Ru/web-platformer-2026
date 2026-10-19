import { Goal } from '../../entities/Goal.js';

export class ReachGoal {
  constructor(bounds) {
    this.goal = new Goal(bounds);
  }

  isReady(collectLetters) {
    return collectLetters.count === collectLetters.items.length;
  }

  reachedBy(player, collectLetters) {
    return this.isReady(collectLetters) && this.goal.hits(player);
  }
}
