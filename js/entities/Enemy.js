import { overlaps } from '../engine/collision.js';
import { Entity } from './Entity.js';

export class Enemy extends Entity {
  constructor(settings, platform, abilities) {
    super({
      x: settings.x,
      y: platform.y - settings.height,
      width: settings.width,
      height: settings.height,
    });
    this.platform = platform;
    this.settings = settings;
    this.abilities = abilities;
    this.left = platform.x;
    this.right = platform.x + platform.width - this.width;
    this.reset();
  }

  reset() {
    this.x = this.settings.x;
    this.y = this.platform.y - this.height;
    this.direction = this.settings.direction;
    this.health = this.settings.maxHealth;
    this.dropped = false;
    this.hurtTime = 0;
    this.boss = !!this.settings.boss;
    const pool = [...this.abilities.kinds];
    if (this.boss) {
      this.skills = [];
      const skillCount = Math.min(this.abilities.count, pool.length);
      while (this.skills.length < skillCount) {
        this.skills.push(pool.splice(Math.floor(Math.random() * pool.length), 1)[0]);
      }
    } else {
      this.skills = Math.random() < (this.settings.abilityChance ?? this.abilities.chance)
        ? [pool[Math.floor(Math.random() * pool.length)]] : [];
    }
    const interval = this.settings.abilityInterval ?? this.abilities.interval;
    this.abilityTimers = Object.fromEntries(this.skills.map((skill) =>
      [skill, interval * (0.5 + Math.random() * 0.5)]));
    this.frozenFor = 0;
    this.jumpVelocity = 0;
    this.dashFor = 0;
  }

  get alive() {
    return this.health > 0;
  }

  update(dt) {
    if (!this.alive) return;
    this.frozenFor = Math.max(0, this.frozenFor - dt);
    if (this.frozenFor > 0) return;
    if (this.jumpVelocity !== 0 || this.y < this.platform.y - this.height) {
      this.y += this.jumpVelocity * dt + this.abilities.jump.gravity * dt * dt / 2;
      this.jumpVelocity += this.abilities.jump.gravity * dt;
      if (this.y >= this.platform.y - this.height) {
        this.y = this.platform.y - this.height;
        this.jumpVelocity = 0;
      }
    }
    if (this.hurtTime > 0) {
      this.hurtTime = Math.max(0, this.hurtTime - dt);
      return;
    }
    this.x += this.direction * this.settings.speed
      * (this.dashFor > 0 ? this.abilities.dash.speedMultiplier : 1) * dt;
    this.dashFor = Math.max(0, this.dashFor - dt);
    if (this.x <= this.left) {
      this.x = this.left;
      this.direction = 1;
    } else if (this.x >= this.right) {
      this.x = this.right;
      this.direction = -1;
    }
  }

  dashToward(player) {
    this.direction = Math.sign(player.x - this.x) || this.direction;
    this.dashFor = this.abilities.dash.duration;
  }

  jump() {
    if (this.y === this.platform.y - this.height) {
      this.jumpVelocity = -this.abilities.jump.speed;
    }
  }

  hits(player) {
    return this.alive && this.hurtTime === 0 && overlaps(this, player);
  }

  takeDamage(amount, stunDuration) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.hurtTime = this.alive ? stunDuration * (this.abilities.stunMultiplier ?? 1) : 0;
  }

  freeze(duration) {
    if (this.alive) this.frozenFor = Math.max(this.frozenFor, duration);
  }

  predictX(time) {
    if (this.frozenFor > 0 || this.hurtTime > 0) return this.x;
    const span = this.right - this.left;
    if (span <= 0) return this.x;
    const distance = this.x - this.left + this.direction * this.settings.speed
      * (this.dashFor > 0 ? this.abilities.dash.speedMultiplier : 1) * time;
    const wrapped = ((distance % (2 * span)) + 2 * span) % (2 * span);
    return this.left + (wrapped <= span ? wrapped : 2 * span - wrapped);
  }
}
