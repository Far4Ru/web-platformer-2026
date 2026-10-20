import { Player } from '../entities/Player.js';
import { Input } from '../engine/input.js';
import { HUD } from '../ui/HUD.js';
import { Overlay } from '../ui/Overlay.js';
import { Controls } from '../ui/Controls.js';
import { SkillBar } from '../ui/SkillBar.js';
import { BoostBar } from '../ui/BoostBar.js';
import { CardOverlay } from '../ui/CardOverlay.js';
import { Background } from './components/Background.js';
import { GameScene } from './components/GameScene.js';
import { Dialogue } from './components/Dialogue.js';
import { Camera } from './components/Camera.js';
import { DustParticles } from './components/DustParticles.js';
import { BestScore } from './features/BestScore.js';
import { Platforms } from './features/Platforms.js';
import { GrassMotion } from './features/GrassMotion.js';
import { CollectCoins } from './features/CollectCoins.js';
import { Music } from './features/Music.js';
import { SoundEffects } from './features/SoundEffects.js';
import { BurstParticles } from './components/BurstParticles.js';
import { Hazards } from './features/Hazards.js';
import { Enemies } from './features/Enemies.js';
import { ReachGoal } from './features/ReachGoal.js';
import { PlayerMovement } from './features/PlayerMovement.js';
import { PlayerHealth } from './features/PlayerHealth.js';
import { Boosts } from './features/Boosts.js';
import { HealingSkill } from './features/HealingSkill.js';
import { SwordSkill } from './features/SwordSkill.js';
import { CompanionSkill } from './features/CompanionSkill.js';
import { FireballSkill } from './features/FireballSkill.js';
import { IceSkill } from './features/IceSkill.js';
import { BowSkill } from './features/BowSkill.js';
import { PlayerShots } from './features/PlayerShots.js';
import { WinLose } from './features/WinLose.js';
import { Chests } from './features/Chests.js';
import { HellMode } from './features/HellMode.js';
import { generateLevel } from './LevelGenerator.js';
import { enterMobileFullscreen } from '../engine/fullscreen.js';

export class Game {
  constructor(engine) {
    this.engine = engine;
    this.canvas = engine.canvas;
    this.settings = engine.settings;
    const { canvas, settings, texts } = engine;
    this.input = new Input(settings.controls.keys);
    this.music = new Music(settings.music);
    this.sounds = new SoundEffects(settings.sounds);
    this.player = new Player(settings.player);
    this.playerHealth = new PlayerHealth(settings.health);
    this.buildLevel();
    this.background = new Background(engine.images, settings.scene.background);
    this.hud = new HUD(settings.ui, texts, settings.world.width, engine.images);
    this.overlay = new Overlay(settings.ui, texts, settings.world, engine.images);
    this.controls = new Controls(settings.ui, texts, engine.images);
    this.skillBar = new SkillBar(settings.ui, settings.world.width);
    this.boostBar = new BoostBar(settings.ui, settings.world.width);
    this.cardOverlay = new CardOverlay(settings.ui, settings.cards, settings.world, engine.images);
    this.dialogue = new Dialogue(texts.speech);
    this.phase = 'ready';
    this.idleTime = 0;
    this.landingTime = 0;
    this.hasStarted = false;
    this.bestScore = new BestScore(settings.storageKey);
    this.runBestBefore = this.bestScore.value;
    this.resultTime = 0;
    this.newRecord = false;
    this.lossReason = null;
    this.lastHitKind = null;
    this.winLose = new WinLose();
    this.scene = new GameScene(this, settings.scene);
    this.bindControls();
  }

  buildLevel() {
    const { settings, canvas } = this;
    this.level = generateLevel(settings.level);
    this.platforms = new Platforms(this.level.platforms);
    this.grassMotion = new GrassMotion();
    this.collectCoins = new CollectCoins(
      this.level.coins, this.level.enemies, settings.coinDrops, settings.coinMagnet);
    this.hazards = new Hazards(this.level, this.platforms.items);
    this.enemies = new Enemies(this.level.enemies, this.platforms.items,
      settings.enemyAbilities, settings.bossAbilities);
    this.reachGoal = new ReachGoal(this.level.goal);
    const skillSettings = (kind) => settings[`${kind}Skill`];
    this.healingSkill = new HealingSkill(skillSettings('healing'));
    this.swordSkill = new SwordSkill(skillSettings('sword'));
    this.companionSkill = new CompanionSkill(skillSettings('companion'));
    this.fireballSkill = new FireballSkill(skillSettings('fireball'));
    this.iceSkill = new IceSkill(skillSettings('ice'));
    this.bowSkill = new BowSkill(skillSettings('bow'));
    this.boosts = new Boosts(settings.boosts, this.level.boostPickups);
    this.chests = new Chests(this.level.chestPickups ?? [], settings.cards);
    this.hell = new HellMode(settings.cards.hell);
    this.cardBonuses = { damage: 0, speed: 1 };
    this.effects = new BurstParticles(settings.particles);
    this.defeatedEnemies = new Set();
    this.playerShots = new PlayerShots();
    this.playerMovement = new PlayerMovement(this.player, this.input, this.platforms, this.level.width);
    this.dust = new DustParticles(settings.player.dust);
    this.camera = new Camera(settings.world.width, settings.world.height, this.level);
    this.camera.follow(this.player);
  }

  get state() {
    return this.winLose.state ?? this.phase;
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      enterMobileFullscreen();
      if (event.pointerType === 'touch') this.controls.showTouch = true;
      const point = this.engine.renderer.toWorld(event.clientX, event.clientY);
      if (this.chests.active) {
        const hit = this.cardOverlay.hit(point, this.chests);
        if (hit?.kind === 'reroll') this.chests.reroll(this);
        else if (hit?.kind === 'choose') {
          this.chests.select(hit.index);
          this.chests.startHold(`pointer:${event.pointerId}`);
          this.canvas.setPointerCapture(event.pointerId);
        }
        return;
      }
      const action = this.controls.hit(point, this.state);
      if (action === 'restart') this.restart();
      else if (action === 'sound') this.toggleSound();
      else if (action === 'pause') {
        if (this.state === 'playing') this.pause();
        else this.resume();
      } else if (this.state !== 'playing' && this.overlay.hitPrimary(point)) {
        if (this.state === 'paused') this.resume();
        else this.restart();
      } else if (['left', 'right', 'jump'].includes(action)) {
        this.canvas.setPointerCapture(event.pointerId);
        this.input.pressPointer(event.pointerId, action);
      }
    });
    const release = (event) => {
      this.input.releasePointer(event.pointerId);
      this.chests.cancelHold(`pointer:${event.pointerId}`);
    };
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);
    this.canvas.addEventListener('lostpointercapture', release);
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyM' && !event.repeat) this.toggleSound();
      if (this.chests.active) {
        if (this.chests.phase === 'choice' && event.code === 'ArrowLeft')
          this.chests.moveSelection(-1);
        else if (this.chests.phase === 'choice' && event.code === 'ArrowRight')
          this.chests.moveSelection(1);
        else if (!event.repeat && ['KeyW', 'ArrowUp', 'Space'].includes(event.code))
          this.chests.startHold(`key:${event.code}`);
        else if (this.chests.phase === 'choice' && /^Digit[1-3]$/.test(event.code))
          this.chests.select(Number(event.code.at(-1)) - 1);
        else if (this.chests.phase === 'choice' && event.code === 'ArrowDown') this.chests.startRerollHold();
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'KeyW', 'Space',
          'ArrowDown', 'Digit1', 'Digit2', 'Digit3'].includes(event.code)) event.preventDefault();
        return;
      }
      if ((event.code === 'Escape' || event.code === this.settings.controls.pauseKey)
        && !event.repeat) {
        event.preventDefault();
        if (this.state === 'playing') this.pause();
        else if (this.state === 'paused') this.resume();
      } else if (event.code === 'Enter' && !event.repeat && this.state !== 'playing') {
        event.preventDefault();
        if (this.state === 'paused') this.resume();
        else this.restart();
      }
    });
    window.addEventListener('keyup', (event) => this.chests.cancelHold(`key:${event.code}`));
    window.addEventListener('blur', () => this.chests.cancelHold());
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.chests.cancelHold();
      if (document.hidden && this.state === 'playing') this.pause();
    });
  }

  start() {
    this.engine.start({
      update: (dt) => {
        if (this.chests.active) this.chests.update(dt, this.player, this);
        else if (this.state === 'playing') this.update(dt);
        else if (this.state === 'won') this.resultTime += dt;
      },
      scene: this.scene,
    });
  }

  toggleSound() {
    this.music.toggle();
    this.sounds.muted = this.music.muted;
    if (!this.music.muted) this.sounds.unlock();
  }

  restart() {
    this.runBestBefore = this.bestScore.value;
    this.resultTime = 0;
    this.newRecord = false;
    this.lossReason = null;
    this.lastHitKind = null;
    this.player.reset();
    this.hud.reset();
    this.idleTime = 0;
    this.landingTime = 0;
    this.dialogue.reset(this.hasStarted);
    this.playerHealth.reset();
    if (this.hasStarted) this.buildLevel();
    this.hasStarted = true;
    this.winLose.reset();
    this.input.clear();
    this.phase = 'playing';
    this.music.play();
    this.sounds.unlock();
    this.engine.resetTime();
  }

  pause() {
    this.phase = 'paused';
    this.music.pause();
    this.input.clear();
    this.player.vx = 0;
    this.playerMovement.reset();
  }

  resume() {
    this.phase = 'playing';
    this.music.play();
    this.input.clear();
    this.engine.resetTime();
  }

  endAttempt() {
    this.input.clear();
    this.bestScore.save(this.collectCoins.count);
    this.music.pause();
  }

  update(dt) {
    this.hud.update(dt, this.collectCoins.count);
    if (this.reachGoal.phase === 'entering') {
      if (this.reachGoal.update(dt, this.player, this.collectCoins,
        this.enemies.bossDefeated)) this.finishWin();
      return;
    }
    const enemySkillUses = [];
    const spellHits = [];
    this.hell.update(dt, this);
    this.platforms.update(dt);
    this.dust.update(dt);
    this.effects.update(dt);
    this.hazards.update(dt);
    this.enemies.update(dt, this.player, (enemy, skill) =>
      enemySkillUses.push({ enemy, skill }));
    this.playerHealth.update(dt);
    if (this.playerHealth.value > 0) {
      const uncollectedBoosts = Object.entries(this.boosts.pickups)
        .filter(([, pickup]) => !pickup.collected).map(([kind]) => kind);
      this.boosts.update(dt, this.player, this.playerHealth);
      for (const kind of uncollectedBoosts) {
        if (this.boosts.pickups[kind].collected) this.dialogue.onBoost(kind);
      }
      const wasGrounded = this.player.grounded;
      if (this.playerMovement.update(dt, this.boosts.speedMultiplier * this.cardBonuses.speed))
        this.dust.emit(this.player, this.player.facing);
      for (const platform of this.platforms.items) {
        if (platform.fake && platform.broken) this.dialogue.onPlatformBroken(platform);
      }
      this.grassMotion.update(dt, this.player, this.platforms.items);
      this.landingTime = !wasGrounded && this.player.grounded
        ? 0.16 : Math.max(0, this.landingTime - dt);
      this.idleTime = this.player.grounded && Math.abs(this.player.vx) < 6
        ? this.idleTime + dt : 0;
      if (this.playerMovement.jumped) {
        this.sounds.play('jump');
        this.effects.emit(this.player.x + this.player.width / 2,
          this.player.y + this.player.height, 'dust', 5);
      }
      this.camera.follow(this.player);
      this.dialogue.update(dt, this.player, {
        coins: this.collectCoins.items,
        hazards: this.hazards.items,
        enemies: this.enemies.items,
        chests: this.chests.items,
        goal: this.reachGoal.goal,
        surface: this.player.grounded ? this.player.groundPlatform?.surface : null,
      });
      for (const { enemy, skill } of enemySkillUses)
        this.dialogue.onEnemySkill(skill, enemy, this.player);
      this.companionSkill.update(dt, this.player, this.enemies, this.playerShots, this);
      const previousSwordTime = this.swordSkill.attackTime;
      this.swordSkill.update(dt, this.player, this.enemies,
        this.boosts.damageMultiplier * (1 + this.cardBonuses.damage));
      if (this.swordSkill.attackTime > previousSwordTime) this.sounds.play('sword');
      this.fireballSkill.update(dt, this.player, this.enemies, this.playerShots);
      this.iceSkill.update(dt, this.player, this.enemies, this.playerShots);
      this.bowSkill.update(dt, this.player, this.enemies, this.playerShots);
      this.playerShots.update(dt, this.enemies,
        this.boosts.damageMultiplier * (1 + this.cardBonuses.damage), this.platforms.items,
        (kind) => spellHits.push(kind));
      const hazardHit = this.hazards.hits(this.player);
      const enemyHit = this.enemies.hits(this.player);
      const hellHit = this.hell.hits(this.player);
      if ((hazardHit || enemyHit || hellHit)
        && this.playerHealth.takeDamage()) {
        this.lastHitKind = hazardHit ? 'spikes' : enemyHit ? 'enemy' : 'wall';
        this.dialogue.onDamage(hazardHit ? 'spikes' : 'enemy',
          this.playerHealth.value <= 1);
        this.sounds.play('hurt');
        this.effects.emit(this.player.x + this.player.width / 2,
          this.player.y + this.player.height / 2, 'hit');
      }
    }
    const healthBeforeHealing = this.playerHealth.value;
    this.healingSkill.update(dt, this.player, this.playerHealth);
    if (this.playerHealth.value > healthBeforeHealing) this.dialogue.onHealing();
    this.collectCoins.releaseDrops(this.enemies.items, this.enemies.coinBonus ?? 0);
    this.enemies.items.forEach((enemy, index) => {
      if (enemy.alive || this.defeatedEnemies.has(index)) return;
      this.defeatedEnemies.add(index);
      if (enemy.boss) this.dialogue.onBossDefeated();
      else this.dialogue.onEnemyDefeated();
      this.sounds.play('enemy');
      this.effects.emit(enemy.x + enemy.width / 2,
        enemy.y + enemy.height / 2, 'hit', enemy.boss ? 16 : 8);
    });
    if (this.winLose.checkLoss(this.player, this.playerHealth, this.level.bottom)) {
      this.lossReason = this.player.y > this.level.bottom
        ? 'fall' : this.lastHitKind ?? 'enemy';
      return this.endAttempt();
    }
    if (this.playerHealth.value === 0) return;
    if (this.collectCoins.update(dt, this.player)) {
      this.hud.collect(this.collectCoins.lastCollected, this.camera);
      this.dialogue.onCoinsCollected();
      this.dialogue.onCoinProgress(this.reachGoal.progress(this.collectCoins));
      this.bestScore.save(this.collectCoins.count);
      this.sounds.play('coin');
      for (const coin of this.collectCoins.lastCollected) this.effects.emit(
        coin.x + coin.width / 2, coin.y + coin.height / 2, 'coin', 4);
    }
    if (this.reachGoal.isReady(this.collectCoins, this.enemies.bossDefeated))
      this.dialogue.onPortalReady();
    if (spellHits.length) this.dialogue.onSpellHit(spellHits[0]);
    this.chests.update(dt, this.player, this);
    if (this.chests.active) return;
    if (this.reachGoal.update(dt, this.player, this.collectCoins,
      this.enemies.bossDefeated)) this.finishWin();
  }

  finishWin() {
    if (!this.winLose.checkWin(this.player, this.reachGoal, this.collectCoins,
      this.enemies.bossDefeated)) return;
    this.sounds.play('win');
    this.newRecord = this.collectCoins.count > this.runBestBefore;
    this.endAttempt();
  }
}
