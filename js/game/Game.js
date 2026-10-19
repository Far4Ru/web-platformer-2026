import { Player } from '../entities/Player.js';
import { Input } from '../engine/input.js';
import { HUD } from '../ui/HUD.js';
import { Overlay } from '../ui/Overlay.js';
import { Controls } from '../ui/Controls.js';
import { SkillBar } from '../ui/SkillBar.js';
import { Background } from './components/Background.js';
import { GameScene } from './components/GameScene.js';
import { Camera } from './components/Camera.js';
import { DustParticles } from './components/DustParticles.js';
import { BestScore } from './features/BestScore.js';
import { Platforms } from './features/Platforms.js';
import { CollectLetters } from './features/CollectLetters.js';
import { Hazards } from './features/Hazards.js';
import { Enemies } from './features/Enemies.js';
import { ReachGoal } from './features/ReachGoal.js';
import { PlayerMovement } from './features/PlayerMovement.js';
import { PlayerHealth } from './features/PlayerHealth.js';
import { HealingSkill } from './features/HealingSkill.js';
import { SwordSkill } from './features/SwordSkill.js';
import { CompanionSkill } from './features/CompanionSkill.js';
import { FireballSkill } from './features/FireballSkill.js';
import { IceSkill } from './features/IceSkill.js';
import { BowSkill } from './features/BowSkill.js';
import { PlayerShots } from './features/PlayerShots.js';
import { WinLose } from './features/WinLose.js';
import { generateLevel } from './LevelGenerator.js';

export class Game {
  constructor(engine) {
    this.engine = engine;
    this.canvas = engine.canvas;
    this.settings = engine.settings;
    const { canvas, settings, texts } = engine;
    this.input = new Input(settings.controls.keys);
    this.player = new Player(settings.player);
    this.playerHealth = new PlayerHealth(settings.health);
    this.buildLevel();
    this.background = new Background(settings.scene);
    this.hud = new HUD(settings.ui, texts, canvas.width);
    this.overlay = new Overlay(settings.ui, texts, settings.world);
    this.controls = new Controls(settings.ui, texts);
    this.skillBar = new SkillBar(settings.ui, canvas.width);
    this.phase = 'ready';
    this.hasStarted = false;
    this.bestScore = new BestScore(settings.storageKey, this.collectLetters.items.length);
    this.winLose = new WinLose();
    this.scene = new GameScene(this, settings.scene);
    this.bindControls();
  }

  buildLevel() {
    const { settings, canvas } = this;
    this.level = generateLevel(settings.level);
    this.platforms = new Platforms(this.level.platforms);
    this.collectLetters = new CollectLetters(
      this.level.letters, this.level.enemies, settings.letterDrops, settings.letterMagnet);
    this.hazards = new Hazards(this.level, this.platforms.items);
    this.enemies = new Enemies(this.level.enemies, this.platforms.items, settings.enemyAbilities);
    this.reachGoal = new ReachGoal(this.level.goal);
    const skillSettings = (kind) => ({ ...settings[`${kind}Skill`],
      pickup: this.level.skillPickups?.[kind] ?? settings[`${kind}Skill`].pickup });
    this.healingSkill = new HealingSkill(skillSettings('healing'));
    this.swordSkill = new SwordSkill(skillSettings('sword'));
    this.companionSkill = new CompanionSkill(skillSettings('companion'));
    this.fireballSkill = new FireballSkill(skillSettings('fireball'));
    this.iceSkill = new IceSkill(skillSettings('ice'));
    this.bowSkill = new BowSkill(skillSettings('bow'));
    this.playerShots = new PlayerShots();
    this.playerMovement = new PlayerMovement(this.player, this.input, this.platforms, this.level.width);
    this.dust = new DustParticles(settings.player.dust);
    this.camera = new Camera(canvas.width, canvas.height, this.level);
    this.camera.follow(this.player);
  }

  get state() {
    return this.winLose.state ?? this.phase;
  }

  bindControls() {
    this.canvas.addEventListener('pointerdown', (event) => {
      event.preventDefault();
      if (event.pointerType === 'touch') this.controls.showTouch = true;
      const rect = this.canvas.getBoundingClientRect();
      const point = {
        x: (event.clientX - rect.left) * this.canvas.width / rect.width,
        y: (event.clientY - rect.top) * this.canvas.height / rect.height,
      };
      const action = this.controls.hit(point, this.state);
      if (action === 'restart') this.restart();
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
    const release = (event) => this.input.releasePointer(event.pointerId);
    this.canvas.addEventListener('pointerup', release);
    this.canvas.addEventListener('pointercancel', release);
    this.canvas.addEventListener('lostpointercapture', release);
    window.addEventListener('keydown', (event) => {
      if (event.code === this.settings.controls.pauseKey && !event.repeat) {
        if (this.state === 'playing') this.pause();
        else if (this.state === 'paused') this.resume();
      } else if (event.code === 'Enter' && !event.repeat && this.state !== 'playing') {
        event.preventDefault();
        if (this.state === 'paused') this.resume();
        else this.restart();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause();
    });
  }

  start() {
    this.engine.start({
      update: (dt) => {
        if (this.state === 'playing') this.update(dt);
      },
      scene: this.scene,
    });
  }

  restart() {
    this.player.reset();
    this.playerHealth.reset();
    if (this.hasStarted) this.buildLevel();
    this.hasStarted = true;
    this.bestScore.maximum = this.collectLetters.items.length;
    this.winLose.reset();
    this.input.clear();
    this.phase = 'playing';
    this.engine.resetTime();
  }

  pause() {
    this.phase = 'paused';
    this.input.clear();
    this.player.vx = 0;
    this.playerMovement.reset();
  }

  resume() {
    this.phase = 'playing';
    this.input.clear();
    this.engine.resetTime();
  }

  endAttempt() {
    this.input.clear();
    this.bestScore.save(this.collectLetters.count);
  }

  update(dt) {
    this.dust.update(dt);
    this.hazards.update(dt);
    this.enemies.update(dt, this.player);
    this.playerHealth.update(dt);
    if (this.playerHealth.value > 0) {
      if (this.playerMovement.update(dt)) this.dust.emit(this.player, this.player.facing);
      this.camera.follow(this.player);
      this.companionSkill.update(dt, this.player);
      this.swordSkill.update(dt, this.player, this.enemies);
      this.fireballSkill.update(dt, this.player, this.enemies, this.playerShots);
      this.iceSkill.update(dt, this.player, this.enemies, this.playerShots);
      this.bowSkill.update(dt, this.player, this.enemies, this.playerShots);
      this.playerShots.update(dt, this.enemies);
      const hazardHit = this.hazards.hits(this.player);
      const enemyHit = this.enemies.hits(this.player);
      if (hazardHit || enemyHit) this.playerHealth.takeDamage();
    }
    this.healingSkill.update(dt, this.player, this.playerHealth);
    this.collectLetters.releaseDrops(this.enemies.items);
    if (this.winLose.checkLoss(this.player, this.playerHealth, this.level.bottom)) return this.endAttempt();
    if (this.playerHealth.value === 0) return;
    if (this.collectLetters.update(dt, this.player)) this.bestScore.save(this.collectLetters.count);
    if (this.winLose.checkWin(this.player, this.reachGoal, this.collectLetters)) this.endAttempt();
  }
}
