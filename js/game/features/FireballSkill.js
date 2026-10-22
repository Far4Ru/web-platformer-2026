import { Projectile } from '../../entities/Projectile.js';
import { ProjectileSkill } from './ProjectileSkill.js';

export class FireballSkill extends ProjectileSkill {
  createShots(player, enemies) {
    const first = this.createShot(player, enemies);
    if (!first) return null;
    const count = this.level === 1 ? 1 : this.level === 2 ? 3 : 6;
    return Array.from({ length: count }, (_, index) => {
      const shot = index === 0 ? first : this.createShot(player, enemies);
      if (this.level === 2) {
        shot.delay = index * 0.18;
        shot.anchor = player;
      } else if (this.level === 3) {
        shot.orbit = { anchor: player, angle: index * Math.PI * 2 / count,
          radius: 43, remaining: index + 1, speed: 2.5 };
      }
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
    if (!target) return null;
    const direction = Math.sign(target.x - centerX) || player.facing;
    const { projectile } = this.settings;
    return new Projectile({
      x: centerX - projectile.size / 2, y: centerY - projectile.size / 2,
      width: projectile.size, height: projectile.size,
      vx: direction * this.settings.speed, vy: 0, life: projectile.life,
      kind: 'fireball', damage: this.settings.damage, stun: this.settings.stunDuration,
    });
  }
}
