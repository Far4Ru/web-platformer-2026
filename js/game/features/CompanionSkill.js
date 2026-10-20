import { overlaps } from '../../engine/collision.js';
import { BowSkill } from './BowSkill.js';
import { FireballSkill } from './FireballSkill.js';
import { IceSkill } from './IceSkill.js';

export class CompanionSkill {
  constructor(settings) {
    this.settings = settings;
    this.reset();
  }

  reset() {
    this.level = 0;
    this.history = [];
    this.routeLength = 0;
    this.routeProgress = 0;
    this.companion = null;
    this.cooldown = 0;
    this.health = 2;
    this.hurtFor = 0;
    this.skillLevel = 0;
    this.skillKind = null;
  }

  update(dt, player, enemies, shots, game) {
    if (this.level === 0 || this.health <= 0) return;
    if (this.level !== this.skillLevel) {
      if (this.level >= 2) {
        const kinds = ['sword', 'fireball', 'ice', 'bow'];
        this.skillKind = kinds[Math.floor(Math.random() * kinds.length)];
      }
      this.skillLevel = this.level;
    }
    const platforms = game.platforms?.solidItems ?? [];
    const supported = (x, y) => platforms.some((platform) =>
      Math.abs(platform.y - (y + player.height)) < 4
      && x >= platform.x && x + player.width <= platform.x + platform.width
      && !(platform.holeFor > 0 && x < platform.holeX + platform.holeWidth
        && x + player.width > platform.holeX));
    if (!this.history.length) {
      const behind = player.x - player.facing * this.settings.distance;
      const ahead = player.x + player.facing * this.settings.distance;
      const startX = supported(behind, player.y) ? behind
        : supported(ahead, player.y) ? ahead
          : player.groundPlatform ? Math.max(player.groundPlatform.x,
            Math.min(player.groundPlatform.x + player.groundPlatform.width - player.width, behind))
            : behind;
      this.history.push({ x: startX, y: player.y, facing: player.facing,
        grounded: player.grounded, length: 0 });
    }
    const last = this.history[this.history.length - 1];
    const step = Math.hypot(player.x - last.x, player.y - last.y);
    if (step > 0.01) {
      this.routeLength += step;
      this.history.push({ x: player.x, y: player.y, facing: player.facing,
        grounded: player.grounded, length: this.routeLength });
    }
    // Distance is measured along the route, so turns and jumps stay in the trail.
    const target = Math.max(0, this.routeLength - this.settings.distance);
    this.routeProgress = Math.min(target, this.routeProgress + 700 * dt);
    while (this.history.length > 2 && this.history[1].length < this.routeProgress)
      this.history.shift();
    let next = this.history.findIndex((point) => point.length >= this.routeProgress);
    if (next < 0) next = this.history.length - 1;
    const end = this.history[next];
    const start = this.history[Math.max(0, next - 1)];
    const fraction = end.length === start.length ? 0
      : (this.routeProgress - start.length) / (end.length - start.length);
    const x = start.x + (end.x - start.x) * fraction;
    const y = start.y + (end.y - start.y) * fraction;
    const previous = this.companion;
    this.companion = { x, y, width: player.width, height: player.height,
      facing: end.facing, grounded: supported(x, y),
      moving: !!previous && Math.hypot(x - previous.x, y - previous.y) > 0.5 };
    this.hurtFor = Math.max(0, this.hurtFor - dt);
    const shotIndex = enemies.projectiles?.findIndex((shot) => overlaps(shot, this.companion)) ?? -1;
    const hit = enemies.items.some((enemy) => enemy.alive && overlaps(enemy, this.companion))
      || enemies.spikes?.some((spike) => spike.hits(this.companion)) || shotIndex >= 0;
    if (this.hurtFor === 0 && hit) {
      if (shotIndex >= 0) enemies.projectiles.splice(shotIndex, 1);
      this.health--;
      this.hurtFor = 1;
      if (this.health <= 0) { this.companion = null; return; }
    }
    if (this.level < 2) return;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown > 0) return;
    const level = this.level - 1;
    const proxy = { settings: game.settings[`${this.skillKind}Skill`], level };
    if (this.skillKind === 'sword') {
      for (const enemy of enemies.items) {
        if (enemy.alive && Math.abs(enemy.x - this.companion.x) < (level === 1 ? 55 : 90)
          && Math.abs(enemy.y - this.companion.y) < 45) enemy.takeDamage(1, 0.3);
      }
    } else {
      const skill = { bow: BowSkill, fireball: FireballSkill, ice: IceSkill }[this.skillKind];
      proxy.createShot = skill.prototype.createShot;
      const created = skill.prototype.createShots?.call(proxy, this.companion, enemies)
        ?? skill.prototype.createShot.call(proxy, this.companion, enemies);
      for (const shot of Array.isArray(created) ? created : created ? [created] : []) shots.add(shot);
    }
    this.cooldown = 5;
  }
}
