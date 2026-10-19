import assert from 'node:assert/strict';
import test from 'node:test';
import { moveAndCollide } from '../js/engine/collision.js';

const platform = { x: 100, y: 200, width: 120, height: 24 };

test('a player hits the underside of a platform', () => {
  const player = { x: 120, y: 245, width: 32, height: 40, vx: 0, vy: -620, grounded: false };
  moveAndCollide(player, [platform], 0.12);
  assert.equal(player.y, platform.y + platform.height);
  assert.equal(player.vy, 0);
  assert.equal(player.grounded, false);
});

test('a falling player lands on the first platform crossed', () => {
  const player = { x: 120, y: 145, width: 32, height: 40, vx: 0, vy: 500, grounded: false };
  moveAndCollide(player, [platform, { ...platform, y: 260 }], 0.2);
  assert.equal(player.y, platform.y - player.height);
  assert.equal(player.vy, 0);
  assert.equal(player.grounded, true);
});
