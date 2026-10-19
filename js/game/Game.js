import { Player } from './Player.js';
import { Input } from '../engine/input.js';
import { overlaps } from '../engine/collision.js';
import { HUD } from '../ui/HUD.js';
import { Overlay } from '../ui/Overlay.js';
import { Controls } from '../ui/Controls.js';

export class Game {
  constructor(canvas, settings, texts) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.settings = settings;
    this.texts = texts;
    this.level = settings.level;
    this.input = new Input(settings.controls.keys);
    this.player = new Player(settings.player);
    this.hud = new HUD(settings.ui, texts, canvas.width);
    this.overlay = new Overlay(settings.ui, texts, settings.world);
    this.controls = new Controls(settings.ui, texts);
    this.state = 'ready';
    this.collected = new Set();
    this.best = this.readBest();
    this.lastTime = null;
    this.bindControls();
    requestAnimationFrame((time) => this.frame(time));
  }

  readBest() {
    try { return Math.min(this.level.letters.length, Math.max(0, Number(localStorage.getItem(this.settings.storageKey)) || 0)); }
    catch { return 0; }
  }

  saveBest() {
    if (this.collected.size <= this.best) return;
    this.best = this.collected.size;
    try { localStorage.setItem(this.settings.storageKey, String(this.best)); } catch { /* Storage may be disabled. */ }
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
      if (action === 'restart') this.start();
      else if (action === 'pause') {
        if (this.state === 'playing') this.pause();
        else this.resume();
      } else if (this.state !== 'playing' && this.overlay.hitPrimary(point)) {
        if (this.state === 'paused') this.resume();
        else this.start();
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
        else this.start();
      }
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.state === 'playing') this.pause();
    });
  }

  start() {
    this.player.reset();
    this.collected.clear();
    this.input.clear();
    this.state = 'playing';
    this.lastTime = null;
  }

  pause() {
    this.state = 'paused';
    this.input.clear();
  }

  resume() {
    this.state = 'playing';
    this.input.clear();
    this.lastTime = null;
  }

  finish(won) {
    this.state = won ? 'won' : 'lost';
    this.input.clear();
    this.saveBest();
  }

  update(dt) {
    this.player.update(dt, this.input, this.level.platforms, this.canvas.width);
    if (this.player.y > this.canvas.height || overlaps(this.player, this.level.hazard)) return this.finish(false);
    this.level.letters.forEach((letter, index) => {
      if (!this.collected.has(index) && overlaps(this.player, letter)) {
        this.collected.add(index);
        this.saveBest();
      }
    });
    if (this.collected.size === this.level.letters.length && overlaps(this.player, this.level.goal)) this.finish(true);
  }

  frame(time) {
    const dt = this.lastTime === null ? 0 : Math.min((time - this.lastTime) / 1000, this.settings.maxFrameStep);
    this.lastTime = time;
    if (this.state === 'playing') this.update(dt);
    this.render(time / 1000);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  render(time) {
    const ctx = this.ctx;
    const scene = this.settings.scene;
    const { hazard, goal, platforms, letters } = this.level;
    const sky = ctx.createLinearGradient(0, 0, 0, this.canvas.height);
    sky.addColorStop(0, scene.skyTop);
    sky.addColorStop(1, scene.skyBottom);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Stable star positions avoid random flicker between frames.
    for (let i = 0; i < scene.starCount; i++) {
      const x = (i * scene.starXMultiplier + scene.starXOffset) % this.canvas.width;
      const y = (i * scene.starYMultiplier + scene.starYOffset) % scene.starHeight;
      ctx.globalAlpha = scene.starOpacityBase + scene.starOpacityAmplitude * Math.sin(time * scene.starTwinkleSpeed + i);
      ctx.fillStyle = scene.starColor;
      const size = i % scene.largeStarEvery === 0 ? scene.largeStarSize : scene.starSize;
      ctx.fillRect(x, y, size, size);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = scene.hillColor;
    ctx.beginPath();
    scene.hillPoints.forEach(([x, y], index) => {
      if (index === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.fill();

    for (const p of platforms) {
      ctx.fillStyle = scene.platformShadow;
      ctx.fillRect(p.x + scene.platformShadowOffset.x, p.y + scene.platformShadowOffset.y, p.width, p.height);
      ctx.fillStyle = scene.platformTop;
      ctx.fillRect(p.x, p.y, p.width, scene.platformTopHeight);
      ctx.fillStyle = scene.platformFace;
      ctx.fillRect(p.x, p.y + scene.platformTopHeight, p.width, p.height - scene.platformTopHeight);
    }
    ctx.fillStyle = scene.hazardColor;
    for (let x = hazard.x; x < hazard.x + hazard.width; x += scene.hazardToothWidth) {
      ctx.beginPath();
      ctx.moveTo(x, hazard.y + hazard.height);
      ctx.lineTo(x + scene.hazardToothWidth / 2, hazard.y);
      ctx.lineTo(x + scene.hazardToothWidth, hazard.y + hazard.height);
      ctx.fill();
    }
    letters.forEach((letter, index) => {
      if (this.collected.has(index)) return;
      const bob = Math.sin(time * scene.letterBobSpeed + index) * scene.letterBobAmount;
      ctx.fillStyle = scene.letterColor;
      ctx.fillRect(letter.x, letter.y + bob, letter.width, letter.height - scene.letterBottomInset);
      ctx.strokeStyle = scene.letterLine;
      ctx.lineWidth = scene.letterLineWidth;
      ctx.beginPath();
      scene.letterFold.forEach(([x, y], point) => {
        if (point === 0) ctx.moveTo(letter.x + x, letter.y + bob + y);
        else ctx.lineTo(letter.x + x, letter.y + bob + y);
      });
      ctx.stroke();
    });
    for (const part of scene.goalParts) {
      ctx.fillStyle = part.color === 'goalLight'
        ? (this.collected.size === letters.length ? scene.goalReady : scene.goalLocked)
        : scene[part.color];
      ctx.fillRect(goal.x + part.x, goal.y + part.y, part.width, part.height);
    }
    this.player.render(ctx);
    if (this.state !== 'playing') this.overlay.render(ctx, this.state);
    this.hud.render(ctx, this.collected.size, letters.length, this.best);
    this.controls.render(ctx, this.state);
  }
}
