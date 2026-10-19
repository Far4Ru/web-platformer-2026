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
    this.direction = this.settings.direction;
    this.health = this.settings.maxHealth;
    this.dropped = false;
    this.hurtTime = 0;
    this.ability = Math.random() < (this.settings.abilityChance ?? this.abilities.chance)
      ? (Math.random() < 0.5 ? 'shoot' : 'spikes') : null;
    this.abilityTimer = this.settings.abilityInterval ?? this.abilities.interval;
    this.frozenFor = 0;
  }

  get alive() {
    return this.health > 0;
  }

  update(dt) {
    if (!this.alive) return;
    this.frozenFor = Math.max(0, this.frozenFor - dt);
    if (this.frozenFor > 0) return;
    if (this.hurtTime > 0) {
      this.hurtTime = Math.max(0, this.hurtTime - dt);
      return;
    }
    this.x += this.direction * this.settings.speed * dt;
    if (this.x <= this.left) {
      this.x = this.left;
      this.direction = 1;
    } else if (this.x >= this.right) {
      this.x = this.right;
      this.direction = -1;
    }
  }

  hits(player) {
    return this.alive && this.hurtTime === 0 && overlaps(this, player);
  }

  takeDamage(amount, stunDuration) {
    if (!this.alive) return;
    this.health = Math.max(0, this.health - amount);
    this.hurtTime = this.alive ? stunDuration : 0;
  }

  freeze(duration) {
    if (this.alive) this.frozenFor = Math.max(this.frozenFor, duration);
  }

  predictX(time) {
    if (this.frozenFor > 0 || this.hurtTime > 0) return this.x;
    const span = this.right - this.left;
    if (span <= 0) return this.x;
    const distance = this.x - this.left + this.direction * this.settings.speed * time;
    const wrapped = ((distance % (2 * span)) + 2 * span) % (2 * span);
    return this.left + (wrapped <= span ? wrapped : 2 * span - wrapped);
  }
}
