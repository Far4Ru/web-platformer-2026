import assert from 'node:assert/strict';
import test from 'node:test';
import { ReachGoal } from '../js/game/features/ReachGoal.js';
import { drawGoal } from '../js/render/goal.js';

test('the gate opens only after the coin threshold and boss, then animates entry', () => {
  const gate = new ReachGoal({ x: 100, y: 100, width: 80, height: 96,
    portalOffsetY: 38, portalRadius: 27, openFraction: 0.8, requiresBoss: true });
  const player = { x: 120, y: 115, width: 32, height: 40 };
  const coins = { count: 79, total: 100 };

  assert.equal(gate.update(2, player, coins, true), false);
  assert.equal(gate.phase, 'charging');
  coins.count = 80;
  assert.equal(gate.update(2, player, coins, false), false);
  assert.equal(gate.phase, 'charging');
  assert.equal(gate.update(0.4, player, coins, true), false);
  assert.equal(gate.phase, 'opening');
  assert.equal(gate.update(0.5, player, coins, true), false);
  assert.equal(gate.phase, 'entering');
  assert.equal(gate.update(0.7, player, coins, true), false);
  assert.equal(gate.update(0.05, player, coins, true), true);
});

test('leaving the threshold resets an opening gate', () => {
  const gate = new ReachGoal({ x: 0, y: 0, width: 80, height: 96,
    portalOffsetY: 38, portalRadius: 27, openFraction: 0.8 });
  const player = { x: 500, y: 500, width: 32, height: 40 };
  const coins = { count: 8, total: 10 };
  gate.update(0.4, player, coins);
  coins.count = 7;
  assert.equal(gate.update(0.1, player, coins), false);
  assert.equal(gate.phase, 'charging');
  assert.equal(gate.phaseTime, 0);
  assert.equal(gate.progress({ count: 0, total: 0 }), 0);
});

test('portal art covers the ring but leaves its center and notice unboxed', () => {
  const operations = [];
  const ctx = {
    save() {}, restore() {}, beginPath() {},
    arc() { operations.push('arc'); },
    stroke() { operations.push('stroke'); },
    fill() { operations.push('fill'); },
    drawImage(image) { operations.push(image); },
    fillText(text) { operations.push(text); },
    fillRect() { throw new Error('Portal center must stay transparent'); },
    strokeRect() { throw new Error('Notice must have no frame'); },
  };
  const image = [[], [], [null, 'portal', 'pedestal']];
  const scene = { goalPortal: {
    pedestalHeight: 18, ringWidth: 3, track: '#333', progressRing: '#ff0',
    readyRing: '#0ff', ringRadius: 16, markers: [], font: 'serif',
  } };
  drawGoal(ctx, { x: 0, y: 0, width: 80, height: 96, portalOffsetY: 40 },
    0.5, false, scene, image, 0, 'charging', 0,
    'Вижу недостойного!\nТебе не хватает 7 монет');
  assert(operations.lastIndexOf('stroke') < operations.indexOf('portal'));
  assert(operations.includes('Вижу недостойного!'));
  assert(operations.includes('Тебе не хватает 7 монет'));
  assert(!operations.some((operation) => typeof operation === 'string' && operation.includes('%')));
});
