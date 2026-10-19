import { Projectile } from '../../entities/Projectile.js';
import { ProjectileSkill } from './ProjectileSkill.js';

export class BowSkill extends ProjectileSkill {
  createShot(player, enemies) {
    const originX = player.x + player.width / 2;
    const originY = player.y + player.height / 2;
    const target = enemies.items.filter((enemy) => enemy.alive &&
      Math.abs(enemy.x - originX) <= this.settings.range)
      .reduce((best, enemy) => !best || Math.abs(enemy.x - originX) < Math.abs(best.x - originX)
        ? enemy : best, null);
    if (!target) return null;

    // Scan possible flight times and predict the enemy's reflected patrol position.
    // Pick the arc whose launch speed is nearest the configured bow speed.
    let trajectory = null;
    for (let time = this.settings.minFlightTime; time <= this.settings.maxFlightTime;
      time += this.settings.flightTimeStep) {
      const aimX = target.predictX(time) + target.width / 2;
      const aimY = target.y + target.height / 2;
      const vx = (aimX - originX) / time;
      const vy = (aimY - originY - this.settings.gravity * time * time / 2) / time;
      const speed = Math.hypot(vx, vy);
      const error = Math.abs(speed - this.settings.speed);
      if (!trajectory || error < trajectory.error) trajectory = { vx, vy, error };
    }
    if (!trajectory || trajectory.error > this.settings.speedTolerance) return null;
    const { projectile } = this.settings;
    const shot = new Projectile({
      x: originX - projectile.width / 2, y: originY - projectile.height / 2,
      width: projectile.width, height: projectile.height,
      vx: trajectory.vx, vy: trajectory.vy, gravity: this.settings.gravity,
      life: projectile.life, kind: 'arrow', damage: this.settings.damage,
      stun: this.settings.stunDuration,
    });
    shot.hitChance = [0, 0.15, 0.4, 1][this.level] ?? 1;
    return shot;
  }
}
