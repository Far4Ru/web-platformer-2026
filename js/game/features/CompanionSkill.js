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
    this.history.push({ x: player.x, y: player.y, facing: player.facing, grounded: player.grounded, dt });
    let delay = 0;
    let pose = null;
    for (let index = this.history.length - 1; index >= 0; index--) {
      delay += this.history[index].dt;
      if (delay >= this.settings.delay) {
        pose = this.history[index];
        this.history.splice(0, index);
        break;
      }
    }
    pose ??= player;
    this.companion = {
      x: pose.x - pose.facing * this.settings.distance,
      y: pose.y, width: player.width, height: player.height,
      facing: pose.facing, grounded: pose.grounded,
    };
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
