import { Enemy } from '../../entities/Enemy.js';
import { Projectile } from '../../entities/Projectile.js';
import { overlaps } from '../../engine/collision.js';
import { TriggeredSpikes } from '../../entities/TriggeredSpikes.js';

export class Enemies {
  constructor(settings, platforms, abilities, bossAbilities = abilities) {
    this.projectiles = [];
    this.spikes = [];
    this.items = settings.map((entry) => {
      const platform = platforms[entry.platformIndex];
      if (!platform) throw new Error(`Enemy platform not found: ${entry.platformIndex}`);
      return new Enemy(entry, platform, entry.boss ? bossAbilities : abilities);
    });
  }

  reset() {
    this.items.forEach((enemy) => enemy.reset());
    this.projectiles = [];
    this.spikes = [];
  }

  get bossDefeated() {
    return this.items.every((enemy) => !enemy.boss || !enemy.alive);
  }

  addSkills(count) {
    for (const enemy of this.items) if (enemy.alive) {
      for (let index = 0; index < count; index++) enemy.addSkill();
    }
  }

  changeDifficulty(skillDelta, extraCoins) {
    this.coinBonus = (this.coinBonus ?? 0) + extraCoins;
    for (const enemy of this.items) {
      if (!enemy.alive) continue;
      enemy.maxHealth = Math.max(1, enemy.maxHealth - 1);
      enemy.health = Math.min(enemy.health, enemy.maxHealth);
      if (skillDelta > 0) enemy.addSkill();
      else enemy.removeSkill();
    }
  }

  update(dt, player) {
    this.items.forEach((enemy) => {
      enemy.update(dt);
      if (!enemy.alive || enemy.frozenFor > 0 || enemy.hurtTime > 0) return;
      for (const skill of enemy.skills) {
        enemy.abilityTimers[skill] -= dt;
        if (enemy.abilityTimers[skill] > 0) continue;
        enemy.abilityTimers[skill] = enemy.settings.abilityInterval ?? enemy.abilities.interval;
        this.activate(enemy, skill, player);
      }
    });
    this.projectiles.forEach((shot) => shot.update(dt));
    this.projectiles = this.projectiles.filter((shot) => shot.life > 0);
    this.spikes.forEach((spike) => spike.update(dt));
    this.spikes = this.spikes.filter((spike) => spike.life > 0);
  }

  activate(enemy, skill, player) {
    if (skill === 'dash') return enemy.dashToward(player);
    if (skill === 'jump') return enemy.jump();
    if (skill === 'shoot') {
      const { shot } = enemy.abilities;
      const direction = Math.sign(player.x - enemy.x) || enemy.direction;
      const count = shot.count ?? 1;
      for (let index = 0; index < count; index++) {
        const angle = (index - (count - 1) / 2) * (shot.spread ?? 0);
        this.projectiles.push(new Projectile({
          x: enemy.x + enemy.width / 2 - shot.size / 2,
          y: enemy.y + enemy.height / 2 - shot.size / 2,
          width: shot.size, height: shot.size,
          vx: direction * Math.cos(angle) * shot.speed,
          vy: Math.sin(angle) * shot.speed,
          life: shot.life, kind: enemy.boss ? 'boss' : 'enemy',
        }));
      }
      return;
    }
    if (skill === 'spikes') {
      const { spikes } = enemy.abilities;
      for (let index = 0; index < (spikes.count ?? 1); index++) {
        const x = Math.max(enemy.platform.x, Math.min(enemy.platform.x + enemy.platform.width - spikes.width,
          enemy.x + enemy.direction * (spikes.offset + index * (spikes.spacing ?? 0))));
        const spike = new TriggeredSpikes(x, enemy.platform.y, spikes);
        spike.boss = enemy.boss;
        spike.surface = enemy.platform.surface;
        this.spikes.push(spike);
      }
    }
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
