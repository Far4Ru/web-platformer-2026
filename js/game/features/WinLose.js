export class WinLose {
  constructor() {
    this.state = null;
  }

  reset() {
    this.state = null;
  }

  checkLoss(player, health, levelBottom) {
    if (this.state || (player.y <= levelBottom && !health.depleted)) return false;
    this.state = 'lost';
    return true;
  }

  checkWin(player, reachGoal, collectCoins) {
    if (this.state || !reachGoal.reachedBy(player, collectCoins)) return false;
    this.state = 'won';
    return true;
  }
}
