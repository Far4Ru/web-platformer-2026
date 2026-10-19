export class SwordSkill {
  constructor(settings) {
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.level = 0;
    this.cooldown = 0;
    this.attackTime = 0;
    this.direction = 1;
    this.secondStrike = 0;
  }

  activate(player, enemies, damageMultiplier = 1) {
    const { verticalRange } = this.settings;
    const range = this.settings.range * (this.level === 1 ? 0.6 : 1);
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const nearby = enemies.items.filter((enemy) => {
      if (!enemy.alive) return false;
      const verticalGap = Math.max(0, enemy.y - (player.y + player.height), player.y - (enemy.y + enemy.height));
      const horizontalGap = Math.max(0, enemy.x - (player.x + player.width), player.x - (enemy.x + enemy.width));
      return verticalGap <= verticalRange && horizontalGap <= range;
    });
    const closest = nearby.reduce((best, enemy) => {
      const distance = Math.hypot(enemy.x + enemy.width / 2 - centerX, enemy.y + enemy.height / 2 - centerY);
      return !best || distance < best.distance ? { enemy, distance } : best;
    }, null);

    this.direction = closest
      ? Math.sign(closest.enemy.x + closest.enemy.width / 2 - centerX) || player.facing
      : player.facing;
    for (const enemy of nearby) {
      const side = Math.sign(enemy.x + enemy.width / 2 - centerX) || this.direction;
      if (side === this.direction) enemy.takeDamage(this.settings.damage * damageMultiplier, this.settings.stunDuration);
    }
    this.cooldown = this.settings.interval;
    this.attackTime = this.settings.attackDuration;
    if (this.level === 3 && !this.performingSecondStrike) this.secondStrike = 0.22;
  }

  update(dt, player, enemies, damageMultiplier = 1) {
    this.attackTime = Math.max(0, this.attackTime - dt);
    if (this.level === 0) return;
    if (this.secondStrike > 0) {
      this.secondStrike -= dt;
      if (this.secondStrike <= 0) {
        this.performingSecondStrike = true;
        this.activate(player, enemies, damageMultiplier);
        this.performingSecondStrike = false;
      }
    }
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown === 0) this.activate(player, enemies, damageMultiplier);
  }
}
