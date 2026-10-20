import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { overlaps } from '../js/engine/collision.js';
import { Renderer } from '../js/engine/Renderer.js';
import { BowSkill } from '../js/game/features/BowSkill.js';
import { HellMode } from '../js/game/features/HellMode.js';
import { Platforms } from '../js/game/features/Platforms.js';
import { CompanionSkill } from '../js/game/features/CompanionSkill.js';
import { drawCompanion, drawAbilityShot } from '../js/render/abilities.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));

test('a missed arrow passes close to its target without intersecting it', () => {
  const bow = new BowSkill(settings.bowSkill, () => 0.99);
  bow.level = 1;
  const player = { x: 0, y: 0, width: 32, height: 40 };
  const enemy = { x: 90, y: 0, width: 30, height: 26, alive: true,
    predictX() { return this.x; } };
  const shot = bow.createShot(player, { items: [enemy] });
  assert(shot);
  let nearest = Infinity;
  for (let i = 0; i < 200 && shot.life > 0; i++) {
    shot.update(0.005);
    assert.equal(overlaps(shot, enemy), false);
    nearest = Math.min(nearest, Math.hypot(
      shot.x + shot.width / 2 - enemy.x - enemy.width / 2,
      shot.y + shot.height / 2 - enemy.y - enemy.height / 2));
  }
  assert(nearest < 100);
});

test('arrow rain spawns individual arrows in view away from the player', () => {
  const hell = new HellMode(settings.cards.hell, () => 0.5);
  const game = {
    player: { x: 100, y: 300, width: 32 },
    camera: { x: 0, y: 0 },
    settings: { world: { width: 960, height: 540 } },
    platforms: { items: [] },
  };
  hell.activate('arrows', game);
  hell.update(0.01, game);
  assert.equal(hell.arrows.length, 1);
  assert(Math.abs(hell.arrows[0].x - 116) >= 44);
  assert(hell.arrows[0].x >= 0 && hell.arrows[0].x <= 960);
  for (let i = 0; i < 120; i++) {
    hell.update(0.05, game);
    assert(hell.arrows.length <= 5);
  }
});

test('full-screen renderer keeps 960 by 540 game coordinates centered', () => {
  const canvas = { width: 2000, height: 600,
    getBoundingClientRect: () => ({ left: 0, top: 0, width: 2000, height: 600 }) };
  const ctx = { setTransform() {}, clearRect() {} };
  const renderer = new Renderer(ctx, canvas, { width: 960, height: 540 });
  let viewport;
  renderer.render({ render(_ctx, _world, _time, visible) { viewport = visible; } }, 0);
  assert(viewport.left < 0 && viewport.right > 960);
  assert.deepEqual(renderer.toWorld(1000, 300), { x: 480, y: 270 });
  canvas.width = 600;
  canvas.height = 1200;
  canvas.getBoundingClientRect = () => ({ left: 0, top: 0, width: 600, height: 1200 });
  renderer.render({ render(_ctx, _world, _time, visible) { viewport = visible; } }, 0);
  assert(viewport.top < 0 && viewport.bottom > 540);
  assert.deepEqual(renderer.toWorld(300, 600), { x: 480, y: 270 });
});

test('fake platform breaks on the first swept contact and finishes its animation', () => {
  const platforms = new Platforms([{ x: 30, y: 100, width: 60, height: 20, fake: true }]);
  const player = { x: 40, y: 110, width: 20, height: 20 };
  platforms.touchFake(player, { x: 40, y: 60 });
  assert.equal(platforms.items[0].broken, true);
  assert.equal(platforms.items[0].breakFor, 0.45);
  platforms.update(0.2);
  assert(platforms.items[0].breakFor > 0);
  platforms.update(0.3);
  assert.equal(platforms.items[0].breakFor, 0);
});

test('fake platform ignores side and underside contacts', () => {
  const platforms = new Platforms([{ x: 30, y: 100, width: 60, height: 20, fake: true }]);
  const player = { x: 40, y: 105, width: 20, height: 20 };
  platforms.touchFake(player, { x: 0, y: 105 });
  assert.equal(platforms.items[0].broken, false);
  player.y = 90;
  platforms.touchFake(player, { x: 40, y: 130 });
  assert.equal(platforms.items[0].broken, false);
  player.x = 75;
  player.y = 110;
  platforms.touchFake(player, { x: -60, y: 60 });
  assert.equal(platforms.items[0].broken, false);
  player.x = 40;
  platforms.touchFake(player, { x: 40, y: 60 });
  assert.equal(platforms.items[0].broken, true);
});

test('companion uses idle frame and moves to supported ground near the player', () => {
  const platforms = new Platforms([{ x: 100, y: 100, width: 130, height: 24 }]);
  const player = { x: 112, y: 60, width: 30, height: 40, facing: 1,
    grounded: true, groundPlatform: platforms.items[0] };
  const skill = new CompanionSkill({ delay: 0.32, distance: 28 });
  skill.level = 1;
  skill.update(0.1, player, { items: [], projectiles: [], spikes: [] },
    { add() {} }, { platforms });
  assert(skill.companion.x >= 100);
  assert.equal(skill.companion.grounded, true);
  assert.equal(skill.companion.moving, false);
  const frames = [];
  const ctx = { save() {}, restore() {}, translate() {}, scale() {},
    fillRect() {}, drawImage(...args) { frames.push(args); } };
  const image = { frames: [
    { image: 'idle', x: 0, y: 0, w: 10, h: 10 },
    { image: 'walk', x: 0, y: 0, w: 10, h: 10 },
  ] };
  drawCompanion(ctx, skill, player, { companionHealthEmpty: '#000',
    companionHealthFull: '#fff' }, 1, image);
  assert.equal(frames[0][0], 'idle');
});

test('companion walks the recorded route through a turn without jumping', () => {
  const platforms = new Platforms([{ x: 0, y: 100, width: 500, height: 24 }]);
  const player = { x: 100, y: 60, width: 30, height: 40, facing: 1,
    grounded: true, groundPlatform: platforms.items[0] };
  const skill = new CompanionSkill({ delay: 0.32, distance: 28 });
  skill.level = 1;
  const enemies = { items: [], projectiles: [], spikes: [] };
  const shots = { add() {} };
  const path = [[100, 60], [180, 60], [180, 20], [130, 20]];
  const positions = [];
  for (const [x, y] of path) {
    player.x = x; player.y = y;
    for (let i = 0; i < 10; i++) {
      skill.update(0.016, player, enemies, shots, { platforms });
      positions.push({ x: skill.companion.x, y: skill.companion.y });
    }
  }
  assert(positions.some((point) => point.x >= 170 && point.y === 60));
  assert(positions.some((point) => point.x === 180 && point.y < 60));
  assert(positions.every((point, index) => index === 0 ||
    Math.hypot(point.x - positions[index - 1].x, point.y - positions[index - 1].y) <= 700 * 0.016 + 0.01));
});

test('projectile image keeps its native aspect ratio without changing hitbox', () => {
  const shot = { kind: 'ice', x: 10, y: 20, width: 10, height: 25, vx: 1, vy: 0 };
  const sprite = { width: 512, height: 341 };
  const ctx = { save() {}, restore() {}, translate() {}, scale() {},
    drawImage(...args) { this.draw = args; } };
  drawAbilityShot(ctx, shot, {}, [[null, null, sprite]]);
  assert(Math.abs(ctx.draw[3] / ctx.draw[4] - 512 / 341) < 0.001);
  assert.deepEqual([shot.width, shot.height], [10, 25]);
});
