import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { BowSkill } from '../js/game/features/BowSkill.js';
import { CompanionSkill } from '../js/game/features/CompanionSkill.js';
import { FireballSkill } from '../js/game/features/FireballSkill.js';
import { IceSkill } from '../js/game/features/IceSkill.js';
import { SwordSkill } from '../js/game/features/SwordSkill.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));
const player = { x: 0, y: 0, width: 32, height: 40, facing: 1, grounded: true };
const enemy = { x: 90, y: 0, width: 30, height: 26, alive: true,
  predictX() { return this.x; }, takeDamage(amount) { this.damage = amount; } };
const enemies = { items: [enemy], projectiles: [], spikes: [] };

test('bow accuracy, sword reach and double strike follow the three card levels', () => {
  const bow = new BowSkill(settings.bowSkill);
  for (const [level, chance] of [[1, 0.15], [2, 0.4], [3, 1]]) {
    bow.level = level;
    assert.equal(bow.createShot(player, enemies).hitChance, chance);
  }
  const sword = new SwordSkill(settings.swordSkill);
  sword.level = 1;
  sword.activate(player, enemies);
  assert.equal(enemy.damage, undefined);
  sword.level = 2;
  sword.activate(player, enemies);
  assert.equal(enemy.damage, 1);
  sword.level = 3;
  sword.activate(player, enemies);
  assert(sword.secondStrike > 0);
  sword.update(0.25, player, enemies);
  assert.equal(sword.secondStrike <= 0, true);
});

test('fire and ice gain volleys, orbit shots, rolling ice and longer freeze', () => {
  const fire = new FireballSkill(settings.fireballSkill);
  fire.level = 2;
  const volley = fire.createShots(player, enemies);
  assert.equal(volley.length, 3);
  assert(volley[1].delay > 0);
  fire.level = 3;
  const ring = fire.createShots(player, enemies);
  assert.equal(ring.length, 6);
  assert.equal(ring[5].orbit.remaining, 6);
  const ice = new IceSkill(settings.iceSkill);
  ice.level = 1;
  const shard = ice.createShots(player, enemies);
  assert.equal(shard.freeze, 5);
  assert(shard.height > shard.width);
  ice.level = 2;
  const ball = ice.createShots(player, enemies);
  assert.equal(ball.freeze, 10);
  assert.equal(ball.rolling, true);
  ice.level = 3;
  const iceRing = ice.createShots(player, enemies);
  assert.equal(iceRing.length, 6);
  assert(iceRing.every((shot) => shot.orbit));
});

test('companion has health and gets a skill at levels two and three', () => {
  const companion = new CompanionSkill(settings.companionSkill);
  const shots = { items: [], add(shot) { this.items.push(shot); } };
  const game = { settings };
  companion.level = 1;
  companion.update(0.1, player, { items: [], projectiles: [], spikes: [] }, shots, game);
  assert.equal(companion.health, 2);
  assert(companion.companion);
  assert.equal(companion.skillKind, null);
  companion.level = 2;
  companion.update(0.1, player, { items: [], projectiles: [], spikes: [] }, shots, game);
  assert(['sword', 'fireball', 'ice', 'bow'].includes(companion.skillKind));
  companion.level = 3;
  companion.update(0.1, player, { items: [], projectiles: [], spikes: [] }, shots, game);
  assert.equal(companion.skillLevel, 3);
});
