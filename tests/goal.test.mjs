import assert from 'node:assert/strict';
import test from 'node:test';
import { ReachGoal } from '../js/game/features/ReachGoal.js';
import { goalNotice } from '../js/game/components/GameScene.js';
import { Game } from '../js/game/Game.js';
import { WinLose } from '../js/game/features/WinLose.js';
import { drawGoal } from '../js/render/goal.js';

test('the gate opens after the coin threshold, then animates entry', () => {
  const gate = new ReachGoal({ x: 100, y: 100, width: 80, height: 96,
    portalOffsetY: 38, portalRadius: 27, openFraction: 0.8 });
  const player = { x: 120, y: 115, width: 32, height: 40 };
  const coins = { count: 79, total: 100 };

  assert.equal(gate.update(2, player, coins), false);
  assert.equal(gate.phase, 'charging');
  coins.count = 80;
  assert.equal(gate.update(0.4, player, coins), false);
  assert.equal(gate.phase, 'opening');
  assert.equal(gate.update(0.5, player, coins), false);
  assert.equal(gate.phase, 'entering');
  assert.equal(gate.update(0.7, player, coins), false);
  assert.equal(gate.update(0.05, player, coins), true);
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

test('portal notice explains every remaining condition and successful entry', () => {
  const gate = new ReachGoal({ x: 100, y: 100, width: 80, height: 96,
    portalOffsetY: 38, portalRadius: 40, openFraction: 0.7 });
  const coins = { count: 6, total: 10 };
  assert.match(goalNotice(gate, coins), /1 монет/);
  coins.count = 7;
  assert.match(goalNotice(gate, coins), /открывается/);
  gate.phase = 'open';
  assert.match(goalNotice(gate, coins), /войди в арку/);
  gate.phase = 'entering';
  assert.equal(goalNotice(gate, coins), '');
  // The feet can reach the visible opening while the body is below its center.
  assert.equal(gate.goal.hits({ x: 75, y: 156, width: 32, height: 40 }), true);
});

test('completed final portal entry sets the victory state', () => {
  const gate = new ReachGoal({ x: 100, y: 100, width: 80, height: 96,
    portalOffsetY: 38, portalRadius: 40, openFraction: 0.7 });
  const player = { x: 120, y: 156, width: 32, height: 40 };
  const coins = { count: 7, total: 10 };
  const game = { stageIndex: 2, stageCount: 3, player, reachGoal: gate,
    collectCoins: coins, winLose: new WinLose(),
    sounds: { play() {} }, runBestBefore: 0, endAttempt() { this.ended = true; } };
  assert.equal(gate.update(0.9, player, coins), false);
  assert.equal(gate.phase, 'entering');
  if (gate.update(0.75, player, coins)) Game.prototype.finishWin.call(game);
  assert.equal(game.winLose.state, 'won');
  assert.equal(game.ended, true);
});

test('portal keeps its proportions and frames the gauge on both sides', () => {
  const operations = [];
  const arcs = [];
  const portal = { width: 1437, height: 1095 };
  let portalDraw;
  const ctx = {
    save() {}, restore() {}, beginPath() {},
    arc(_x, _y, radius) { arcs.push(radius); operations.push('arc'); },
    stroke() { operations.push('stroke'); },
    fill() { operations.push('fill'); },
    drawImage(image, x, y, width, height) {
      operations.push(image === portal ? 'portal' : image);
      if (image === portal) portalDraw = { x, y, width, height };
    },
    fillText(text) { operations.push(text); },
    fillRect() { throw new Error('Portal center must stay transparent'); },
    strokeRect() { throw new Error('Notice must have no frame'); },
  };
  const image = [[], [], [null, portal, 'pedestal']];
  const scene = { goalPortal: {
    pedestalHeight: 18, portalHeight: 110, ringWidth: 4,
    track: '#333', progressRing: '#ff0', readyRing: '#0ff',
    ringRadius: 38, markers: [], font: 'serif',
  } };
  drawGoal(ctx, { x: 0, y: 0, width: 80, height: 96, portalOffsetY: 40 },
    0.5, false, scene, image, 0, 'charging', 0,
    'Вижу недостойного!\nТебе не хватает 7 монет');
  assert(operations.indexOf('portal') < operations.indexOf('stroke'));
  assert.equal(portalDraw.height, 110);
  assert(Math.abs(portalDraw.width / portalDraw.height - portal.width / portal.height) < 1e-10);
  assert(arcs.includes(38));
  assert(operations.includes('Вижу недостойного!'));
  assert(operations.includes('Тебе не хватает 7 монет'));
  assert(!operations.some((operation) => typeof operation === 'string' && operation.includes('%')));
});
