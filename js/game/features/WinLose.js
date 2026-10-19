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

  checkWin(player, reachGoal, collectCoins, bossDefeated = true) {
    if (this.state || !reachGoal.reachedBy(player, collectCoins, bossDefeated)) return false;
    this.state = 'won';
    return true;
  }
}
