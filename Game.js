import { Player } from './Player.js';
import { Input } from './input.js';
import { overlaps } from './collision.js';

const BEST_KEY = 'star-mail-best';
const PLATFORMS = [
  { x: 45, y: 460, width: 255, height: 24 },
  { x: 240, y: 380, width: 160, height: 24 },
  { x: 410, y: 300, width: 160, height: 24 },
  { x: 580, y: 220, width: 160, height: 24 },
  { x: 750, y: 140, width: 175, height: 24 },
];
const LETTERS = [
  { x: 268, y: 343, width: 24, height: 24 },
  { x: 443, y: 263, width: 24, height: 24 },
  { x: 613, y: 183, width: 24, height: 24 },
];
const HAZARD = { x: 343, y: 360, width: 32, height: 20 };
const GOAL = { x: 845, y: 86, width: 34, height: 54 };

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.input = new Input();
    this.player = new Player();
    this.state = 'ready';
    this.collected = new Set();
    this.best = this.readBest();
    this.lastTime = null;
    this.bindUI();
    this.updateUI();
    requestAnimationFrame((time) => this.frame(time));
  }

  readBest() {
    try { return Math.min(3, Math.max(0, Number(localStorage.getItem(BEST_KEY)) || 0)); }
    catch { return 0; }
  }

  saveBest() {
    if (this.collected.size <= this.best) return;
    this.best = this.collected.size;
    try { localStorage.setItem(BEST_KEY, String(this.best)); } catch { /* Storage may be disabled. */ }
  }

  bindUI() {
    document.querySelector('#primary-button').addEventListener('click', () => {
      if (this.state === 'paused') this.resume();
      else this.start();
    });
    document.querySelector('#pause-button').addEventListener('click', () => {
      if (this.state === 'playing') this.pause();
      else if (this.state === 'paused') this.resume();
    });
    document.querySelector('#restart-button').addEventListener('click', () => this.start());
    window.addEventListener('keydown', (event) => {
      if (event.code === 'KeyP' && !event.repeat) {
        if (this.state === 'playing') this.pause();
        else if (this.state === 'paused') this.resume();
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
    this.updateUI();
  }

  pause() {
    this.state = 'paused';
    this.input.clear();
    this.updateUI();
  }

  resume() {
    this.state = 'playing';
    this.input.clear();
    this.lastTime = null;
    this.updateUI();
  }

  finish(won) {
    this.state = won ? 'won' : 'lost';
    this.input.clear();
    this.saveBest();
    this.updateUI();
  }

  updateUI() {
    document.querySelector('#score').textContent = `${this.collected.size} / ${LETTERS.length}`;
    document.querySelector('#best').textContent = this.best;
    const overlay = document.querySelector('#overlay');
    overlay.hidden = this.state === 'playing';
    const copy = {
      ready: ['Готов к отправке?', 'Доставь звёздную почту', 'Поднимайся по платформам, собери три письма и избегай шипов.', 'Начать игру'],
      paused: ['Перерыв', 'Игра на паузе', 'Твой прогресс сохранён до продолжения игры.', 'Продолжить'],
      won: ['Доставка выполнена', 'Победа!', 'Все письма доставлены к маяку.', 'Играть снова'],
      lost: ['Попробуй ещё раз', 'Доставка прервана', 'Берегись шипов и не упади с платформ.', 'Заново'],
    }[this.state];
    if (copy) {
      document.querySelector('#overlay-kicker').textContent = copy[0];
      document.querySelector('#overlay-title').textContent = copy[1];
      document.querySelector('#overlay-text').textContent = copy[2];
      document.querySelector('#primary-button').textContent = copy[3];
    }
    const pause = document.querySelector('#pause-button');
    pause.disabled = !['playing', 'paused'].includes(this.state);
    pause.textContent = this.state === 'paused' ? 'Продолжить' : 'Пауза';
  }

  update(dt) {
    this.player.update(dt, this.input, PLATFORMS, this.canvas.width);
    if (this.player.y > this.canvas.height || overlaps(this.player, HAZARD)) return this.finish(false);
    LETTERS.forEach((letter, index) => {
      if (!this.collected.has(index) && overlaps(this.player, letter)) {
        this.collected.add(index);
        this.saveBest();
        this.updateUI();
      }
    });
    if (this.collected.size === LETTERS.length && overlaps(this.player, GOAL)) this.finish(true);
  }

  frame(time) {
    const dt = this.lastTime === null ? 0 : Math.min((time - this.lastTime) / 1000, 1 / 30);
    this.lastTime = time;
    if (this.state === 'playing') this.update(dt);
    this.render(time / 1000);
    requestAnimationFrame((nextTime) => this.frame(nextTime));
  }

  render(time) {
    const ctx = this.ctx;
    const sky = ctx.createLinearGradient(0, 0, 0, 540);
    sky.addColorStop(0, '#12304f');
    sky.addColorStop(1, '#357a88');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, 960, 540);

    // Stable star positions avoid random flicker between frames.
    for (let i = 0; i < 46; i++) {
      const x = (i * 173 + 51) % 960;
      const y = (i * 97 + 33) % 390;
      ctx.globalAlpha = .35 + .25 * Math.sin(time * 2 + i);
      ctx.fillStyle = '#e3f9ff';
      ctx.fillRect(x, y, i % 7 === 0 ? 3 : 2, i % 7 === 0 ? 3 : 2);
    }
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#18475f';
    ctx.beginPath(); ctx.moveTo(0, 540); ctx.lineTo(0, 405); ctx.lineTo(160, 450); ctx.lineTo(305, 355); ctx.lineTo(480, 440); ctx.lineTo(700, 355); ctx.lineTo(960, 450); ctx.lineTo(960, 540); ctx.fill();

    for (const p of PLATFORMS) {
      ctx.fillStyle = '#183b53'; ctx.fillRect(p.x + 3, p.y + 7, p.width, p.height);
      ctx.fillStyle = '#73d8c9'; ctx.fillRect(p.x, p.y, p.width, 8);
      ctx.fillStyle = '#376d78'; ctx.fillRect(p.x, p.y + 8, p.width, p.height - 8);
    }
    ctx.fillStyle = '#f4777b';
    for (let x = HAZARD.x; x < HAZARD.x + HAZARD.width; x += 8) {
      ctx.beginPath(); ctx.moveTo(x, HAZARD.y + HAZARD.height); ctx.lineTo(x + 4, HAZARD.y); ctx.lineTo(x + 8, HAZARD.y + HAZARD.height); ctx.fill();
    }
    LETTERS.forEach((letter, index) => {
      if (this.collected.has(index)) return;
      const bob = Math.sin(time * 3 + index) * 3;
      ctx.fillStyle = '#ffe8a0'; ctx.fillRect(letter.x, letter.y + bob, letter.width, letter.height - 5);
      ctx.strokeStyle = '#ad793e'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(letter.x + 1, letter.y + bob + 1); ctx.lineTo(letter.x + 12, letter.y + bob + 11); ctx.lineTo(letter.x + 23, letter.y + bob + 1); ctx.stroke();
    });
    ctx.fillStyle = '#ffe7a4'; ctx.fillRect(GOAL.x + 6, GOAL.y + 10, 22, 44);
    ctx.fillStyle = '#fff3c5'; ctx.fillRect(GOAL.x + 2, GOAL.y, 30, 12);
    ctx.fillStyle = this.collected.size === LETTERS.length ? '#6ef0d6' : '#e8a47e';
    ctx.fillRect(GOAL.x + 11, GOAL.y + 19, 12, 13);
    this.player.render(ctx);
  }
}
