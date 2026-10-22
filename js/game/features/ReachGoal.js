import { Goal } from '../../entities/Goal.js';

export class ReachGoal {
  constructor(bounds) {
    this.goal = new Goal(bounds);
    this.openFraction = bounds.openFraction;
    this.phase = 'charging';
    this.phaseTime = 0;
    this.openDuration = 0.9;
    this.enterDuration = 0.75;
  }

  progress(collectCoins) {
    return collectCoins.total > 0
      ? Math.max(0, Math.min(1, collectCoins.count / collectCoins.total)) : 0;
  }

  isReady(collectCoins) {
    return this.progress(collectCoins) >= this.openFraction;
  }

  reachedBy(player, collectCoins) {
    return this.isReady(collectCoins) && this.goal.hits(player);
  }

  update(dt, player, collectCoins) {
    if (!this.isReady(collectCoins)) {
      this.phase = 'charging';
      this.phaseTime = 0;
      return false;
    }
    if (this.phase === 'charging') {
      this.phase = 'opening';
      this.phaseTime = 0;
    }
    if (this.phase === 'opening') {
      this.phaseTime += dt;
      if (this.phaseTime < this.openDuration) return false;
      this.phase = 'open';
      this.phaseTime = 0;
    }
    if (this.phase === 'open' && this.goal.hits(player)) {
      this.phase = 'entering';
      this.phaseTime = 0;
      return false;
    }
    if (this.phase === 'entering') {
      this.phaseTime += dt;
      return this.phaseTime >= this.enterDuration;
    }
    return false;
  }
}
