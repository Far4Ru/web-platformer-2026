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

  update(dt, player, enemies, shots, game, onEvent = () => {}) {
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
      Math.abs(platform.y - (y + player.height)) < 0.01
      && x + player.width / 2 >= platform.x
      && x + player.width / 2 <= platform.x + platform.width
      && !(platform.holeFor > 0 && x + player.width / 2 >= platform.holeX
        && x + player.width / 2 <= platform.holeX + platform.holeWidth));
    if (!this.history.length) {
      const behind = player.x - player.facing * this.settings.distance;
      const ahead = player.x + player.facing * this.settings.distance;
      const startX = supported(ahead, player.y) && Math.random() < 0.35 ? ahead
        : supported(behind, player.y) ? behind
          : supported(ahead, player.y) ? ahead
          : player.groundPlatform ? Math.max(player.groundPlatform.x,
            Math.min(player.groundPlatform.x + player.groundPlatform.width - player.width, behind))
            : behind;
      this.history.push({ x: startX, y: player.y, facing: player.facing,
        grounded: player.grounded, length: 0 });
    }
    const last = this.history[this.history.length - 1];
    const step = Math.hypot(player.x - last.x, player.y - last.y);
    if (step > 0.01 || player.grounded !== last.grounded) {
      this.routeLength += Math.max(step, 0.01);
      this.history.push({ x: player.x, y: player.y, facing: player.facing,
        grounded: player.grounded, length: this.routeLength });
    }
    // Distance is measured along the route, so turns and jumps stay in the trail.
    const playerPlatform = player.groundPlatform;
    const roomBehind = playerPlatform && player.facing > 0
      ? player.x - playerPlatform.x
      : playerPlatform ? playerPlatform.x + playerPlatform.width - player.x - player.width : 0;
    const safeGap = Math.max(18, Math.min(62, roomBehind - 12));
    const desiredGap = player.grounded ? safeGap : this.settings.distance;
    let target = Math.max(0, this.routeLength - desiredGap);
    if (player.grounded && ((this.companion && !this.companion.grounded)
      || this.history.some((point) => point.length >= this.routeProgress
        && !point.grounded))) {
      const landing = this.history.find((point) => point.length > this.routeProgress
        && point.grounded && supported(point.x, point.y));
      if (landing) target = Math.max(target, landing.length);
    }
    const speed = 520 + 150 * Math.sin(this.routeLength * 0.018) +
      Math.max(0, target - this.routeProgress - 70) * 3;
    // A turn can increase the desired gap. Never rewind along the recorded path.
    this.routeProgress = Math.max(this.routeProgress, Math.min(target, this.routeProgress +
      Math.min(700, Math.max(330, speed)) * dt));
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
    const previous = this.companion && { ...this.companion };
    const nextCompanion = { x, y, width: player.width, height: player.height,
      facing: end.facing, grounded: supported(x, y),
      moving: !!previous && Math.hypot(x - previous.x, y - previous.y) > 0.5 };
    if (this.companion) Object.assign(this.companion, nextCompanion);
    else this.companion = nextCompanion;
    this.hurtFor = Math.max(0, this.hurtFor - dt);
    const shotIndex = enemies.projectiles?.findIndex((shot) => overlaps(shot, this.companion)) ?? -1;
    const hit = enemies.items.some((enemy) => enemy.alive && overlaps(enemy, this.companion))
      || enemies.spikes?.some((spike) => spike.hits(this.companion)) || shotIndex >= 0;
    if (this.hurtFor === 0 && hit) {
      if (shotIndex >= 0) enemies.projectiles.splice(shotIndex, 1);
      this.health--;
      this.hurtFor = 1;
      onEvent(this.health <= 0 ? 'down' : 'hurt');
      if (this.health <= 0) { this.companion = null; return; }
    }
    if (this.level < 2) return;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.cooldown > 0) return;
    const level = this.level - 1;
    let attacked = false;
    if (this.skillKind === 'sword') {
      for (const enemy of enemies.items) {
        if (enemy.alive && Math.abs(enemy.x - this.companion.x) < (level === 1 ? 55 : 90)
          && Math.abs(enemy.y - this.companion.y) < 45) {
          enemy.takeDamage(1, 0.3);
          attacked = true;
        }
      }
    } else {
      const Skill = { bow: BowSkill, fireball: FireballSkill, ice: IceSkill }[this.skillKind];
      const borrowed = new Skill(game.settings[`${this.skillKind}Skill`]);
      borrowed.level = level;
      const created = borrowed.createShots?.(this.companion, enemies)
        ?? borrowed.createShot(this.companion, enemies);
      for (const shot of Array.isArray(created) ? created : created ? [created] : []) {
        shots.add(shot);
        attacked = true;
      }
    }
    if (attacked) onEvent('attack');
    this.cooldown = 5;
  }
}
