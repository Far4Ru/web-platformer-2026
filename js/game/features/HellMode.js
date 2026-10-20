import { overlaps } from '../../engine/collision.js';
import { Projectile } from '../../entities/Projectile.js';

export class HellMode {
  constructor(settings, random = Math.random) {
    this.settings = settings;
    this.random = random;
    this.kind = null;
    this.elapsed = 0;
    this.timer = 0;
    this.wallX = 0;
    this.arrows = [];
  }

  activate(kind, game) {
    if (this.kind) return false;
    this.kind = kind;
    this.elapsed = 0;
    this.timer = 0;
    this.wallX = 0;
    if (kind === 'enemies') {
      game.enemies.addSkills(1);
      this.shield(game);
    }
    return true;
  }

  shield(game) {
    for (const enemy of game.enemies.items) {
      if (enemy.alive) enemy.shieldFor = this.settings.shieldDuration;
    }
  }

  choosePlatform(game) {
    const choices = game.platforms.items.filter((item) => !item.fake
      && item.x > game.player.x - 200 && item.x < game.player.x + 900
      && item !== game.player.groundPlatform && item.width >= this.settings.holeWidth + 50);
    return choices[Math.floor(this.random() * choices.length)];
  }

  update(dt, game) {
    if (!this.kind) return;
    this.elapsed += dt;
    this.timer -= dt;
    for (const platform of game.platforms.items) {
      platform.holeFor = Math.max(0, (platform.holeFor ?? 0) - dt);
      platform.spikeFor = Math.max(0, (platform.spikeFor ?? 0) - dt);
    }
    if (this.kind === 'wall') this.wallX = Math.min(game.level.width, this.wallX + this.settings.wallSpeed * dt);
    if (this.kind === 'arrows') {
      if (this.timer <= 0) {
        this.timer = this.settings.arrowInterval * (0.55 + this.random() * 0.9);
        if (this.arrows.length < 5 && this.random() < 0.8) {
          const margin = this.settings.arrowSize * 3;
          const viewWidth = game.settings.world.width;
          const range = Math.max(1, viewWidth - margin * 2);
          let x = game.camera.x + margin + this.random() * range;
          const center = game.player.x + game.player.width / 2;
          if (Math.abs(x - center) < 44) x = center + (x < center ? -60 : 60);
          x = Math.max(game.camera.x + margin,
            Math.min(game.camera.x + viewWidth - margin, x));
          this.arrows.push(new Projectile({ x,
            y: game.camera.y - 20, width: this.settings.arrowSize,
            height: this.settings.arrowSize * 2, vx: 0, vy: this.settings.arrowSpeed,
            life: 2, kind: 'hellArrow' }));
        }
      }
      for (const arrow of this.arrows) arrow.update(dt);
      this.arrows = this.arrows.filter((arrow) => arrow.life > 0
        && arrow.y < game.camera.y + game.settings.world.height + 40);
    }
    if (this.kind === 'holes' && this.timer <= 0) {
      this.timer = this.settings.holeInterval;
      const platform = this.choosePlatform(game);
      if (platform) {
        platform.holeX = platform.x + (platform.width - this.settings.holeWidth) * this.random();
        platform.holeWidth = this.settings.holeWidth;
        platform.holeFor = this.settings.holeDuration;
      }
    }
    if (this.kind === 'freeze') {
      game.player.frozenFor = Math.max(0, (game.player.frozenFor ?? 0) - dt);
      if (this.timer <= 0) {
        this.timer = this.settings.freezeInterval;
        game.player.frozenFor = this.settings.freezeDuration;
      }
    }
    if (this.kind === 'enemies' && this.timer <= 0) {
      this.timer = this.settings.shieldInterval;
      this.shield(game);
    }
    if (this.kind === 'spikes' && this.timer <= 0) {
      this.timer = this.settings.spikeInterval;
      const platform = this.choosePlatform(game);
      if (platform) platform.spikeFor = this.settings.spikeDuration;
    }
  }

  hits(player) {
    if (this.kind === 'wall' && player.x < this.wallX + 24) return true;
    if (this.kind === 'arrows' && this.arrows.some((arrow) => overlaps(arrow, player))) return true;
    return this.kind === 'spikes' && player.grounded && player.groundPlatform?.spikeFor > 0;
  }
}
