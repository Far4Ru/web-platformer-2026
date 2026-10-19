import { Enemy } from '../../entities/Enemy.js';
import { Projectile } from '../../entities/Projectile.js';
import { overlaps } from '../../engine/collision.js';
import { TriggeredSpikes } from '../../entities/TriggeredSpikes.js';

export class Enemies {
  constructor(settings, platforms, abilities) {
    this.abilities = abilities;
    this.projectiles = [];
    this.spikes = [];
    this.items = settings.map((entry) => {
      const platform = platforms[entry.platformIndex];
      if (!platform) throw new Error(`Enemy platform not found: ${entry.platformIndex}`);
      return new Enemy(entry, platform, abilities);
    });
  }

  reset() {
    this.items.forEach((enemy) => enemy.reset());
    this.projectiles = [];
    this.spikes = [];
  }

  update(dt, player) {
    this.items.forEach((enemy) => {
      enemy.update(dt);
      if (!enemy.alive || enemy.frozenFor > 0 || enemy.hurtTime > 0 || !enemy.ability) return;
      enemy.abilityTimer -= dt;
      if (enemy.abilityTimer > 0) return;
      enemy.abilityTimer = enemy.settings.abilityInterval ?? this.abilities.interval;
      if (enemy.ability === 'shoot') {
        const direction = Math.sign(player.x - enemy.x) || enemy.direction;
        const { shot } = this.abilities;
        this.projectiles.push(new Projectile({
          x: enemy.x + enemy.width / 2, y: enemy.y + enemy.height / 2,
          width: shot.size, height: shot.size, vx: direction * shot.speed,
          vy: 0, life: shot.life, kind: 'enemy',
        }));
      } else {
        const { spikes } = this.abilities;
        const x = Math.max(enemy.platform.x, Math.min(enemy.platform.x + enemy.platform.width - spikes.width,
          enemy.x + enemy.direction * spikes.offset));
        this.spikes.push(new TriggeredSpikes(x, enemy.platform.y, spikes));
      }
    });
    this.projectiles.forEach((shot) => shot.update(dt));
    this.projectiles = this.projectiles.filter((shot) => shot.life > 0);
    this.spikes.forEach((spike) => spike.update(dt));
    this.spikes = this.spikes.filter((spike) => spike.life > 0);
  }

  hits(player) {
    const shotIndex = this.projectiles.findIndex((shot) => overlaps(shot, player));
    if (shotIndex !== -1) {
      this.projectiles.splice(shotIndex, 1);
      return true;
    }
    return this.spikes.some((spike) => spike.hits(player)) ||
      this.items.some((enemy) => enemy.hits(player));
  }
}
