import { Projectile } from '../../entities/Projectile.js';
import { ProjectileSkill } from './ProjectileSkill.js';

export class IceSkill extends ProjectileSkill {
  createShot(player, enemies) {
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    const nearby = enemies.items.filter((enemy) => enemy.alive &&
      Math.hypot(enemy.x - centerX, enemy.y - centerY) < this.settings.range);
    const target = nearby.reduce((best, enemy) =>
      !best || Math.abs(enemy.x - centerX) < Math.abs(best.x - centerX) ? enemy : best, null);
    const direction = target ? Math.sign(target.x - centerX) || player.facing : player.facing;
    const { projectile } = this.settings;
    return new Projectile({
      x: centerX - projectile.size / 2, y: centerY - projectile.size / 2,
      width: projectile.size, height: projectile.size,
      vx: direction * this.settings.speed, vy: -this.settings.lift,
      gravity: this.settings.gravity, life: projectile.life, kind: 'ice',
      damage: this.settings.damage, freeze: this.settings.freezeDuration,
      stun: this.settings.stunDuration,
    });
  }
}
