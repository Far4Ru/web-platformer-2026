import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { CollectCoins } from '../js/game/features/CollectCoins.js';
import { ReachGoal } from '../js/game/features/ReachGoal.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));

test('platform and enemy coins share the portal count, with card bonuses in the same balance', () => {
  const coins = new CollectCoins([{ x: 0, y: 0, width: 24, height: 24 }],
    [{ maxHealth: 2, boss: false }, { maxHealth: 15, boss: true }],
    settings.coinDrops, settings.coinMagnet);
  assert.equal(coins.total, 1 + 3 + 20);
  const player = { x: 0, y: 0, width: 24, height: 24 };
  coins.update(1, player);
  assert.equal(coins.count, 1);
  const enemy = { alive: false, dropped: false, x: 20, y: 0, width: 24, height: 24,
    platform: { x: 0, y: 40, width: 100 } };
  coins.releaseDrops([enemy, { alive: true }], 1);
  assert.equal(coins.total, 25);
  assert.equal(coins.drops.filter((coin) => coin.active).length, 4);
  coins.grant(15);
  assert.equal(coins.count, 16);
  const goal = new ReachGoal({ x: 0, y: 0, width: 30, height: 30, openFraction: 0.8 });
  assert.equal(goal.isReady(coins), false);
  coins.discardDrops(1);
  assert.equal(coins.total, 5);
  assert.equal(goal.isReady(coins), true);
});
