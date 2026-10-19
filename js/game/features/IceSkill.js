import { Projectile } from '../../entities/Projectile.js';
import { ProjectileSkill } from './ProjectileSkill.js';

export class IceSkill extends ProjectileSkill {
  createShots(player, enemies) {
    if (this.level < 3) return this.createShot(player, enemies);
    return Array.from({ length: 6 }, (_, index) => {
      const shot = this.createShot(player, enemies);
      shot.width = 12;
      shot.height = 24;
      shot.freeze = 10;
      shot.orbit = { anchor: player, angle: index * Math.PI / 3,
        radius: 46, remaining: index + 1, speed: -2.3 };
      return shot;
    });
  }

  createShot(player, enemies) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const nearby = enemies.items.filter((enemy) => enemy.alive &&
      Math.hypot(enemy.x - centerX, enemy.y - centerY) < this.settings.range);
    const target = nearby.reduce((best, enemy) =>
      !best || Math.abs(enemy.x - centerX) < Math.abs(best.x - centerX) ? enemy : best, null);
    const direction = target ? Math.sign(target.x - centerX) || player.facing : player.facing;
    const { projectile } = this.settings;
    const shot = new Projectile({
      x: centerX - projectile.size / 2, y: centerY - projectile.size / 2,
      width: this.level === 1 ? 10 : projectile.size,
      height: this.level === 1 ? 25 : projectile.size,
      vx: direction * this.settings.speed, vy: -this.settings.lift,
      gravity: this.settings.gravity, life: projectile.life, kind: 'ice',
      damage: this.settings.damage, freeze: this.level >= 2 ? 10 : 5,
      stun: this.settings.stunDuration,
    });
    shot.rolling = this.level === 2;
    return shot;
  }
}
