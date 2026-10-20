import assert from 'node:assert/strict';
import test from 'node:test';
import { HUD } from '../js/ui/HUD.js';

const ui = {
  counters: {
    score: { x: 20, y: 18, width: 172, height: 56 },
    best: { x: 20, y: 78, width: 132, height: 36 },
  },
};

test('collected coins reach the counter before its number rises', () => {
  const hud = new HUD(ui, {}, 960, {});
  assert.equal(hud.coinSpin, 0);
  hud.collect([{ x: 300, y: 200, width: 24, height: 24 }], { x: 100, y: 30 });
  assert(hud.coinSpin > 0);
  assert.equal(hud.flights[0].x, 212);
  hud.update(0.2, 1);
  assert.equal(hud.displayed, 0);
  hud.update(0.65, 1);
  assert.equal(hud.displayed, 1);
  assert.equal(hud.flights.length, 0);
  assert(hud.pulse > 0);
  hud.update(0.48, 1);
  assert.equal(hud.coinSpin, 0);
});

test('bonus coins increment without a flight and reset for a new attempt', () => {
  const hud = new HUD(ui, {}, 960, {});
  hud.update(0.06, 3);
  assert.equal(hud.displayed, 1);
  hud.update(0.06, 3);
  assert.equal(hud.displayed, 2);
  hud.reset();
  assert.equal(hud.displayed, 0);
  assert.equal(hud.pulse, 0);
});
