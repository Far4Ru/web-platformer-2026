import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Boosts } from '../js/game/features/Boosts.js';
import { PlayerHealth } from '../js/game/features/PlayerHealth.js';
import { PlayerMovement } from '../js/game/features/PlayerMovement.js';
import { PlayerShots } from '../js/game/features/PlayerShots.js';
import { SwordSkill } from '../js/game/features/SwordSkill.js';
import { generateLevel } from '../js/game/LevelGenerator.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));
const bounds = {
  heal: { x: 0, y: 0, width: 28, height: 28 },
  speed: { x: 100, y: 0, width: 28, height: 28 },
  damage: { x: 200, y: 0, width: 28, height: 28 },
};

test('boost pickups activate once, expire, and reset for a new run', () => {
  const boosts = new Boosts(settings.boosts, bounds);
  const health = new PlayerHealth(settings.health);
  const player = { x: 0, y: 0, width: 28, height: 28 };
  health.takeDamage();
  boosts.update(0, player, health);
  assert.equal(health.value, settings.health.max);
  health.invulnerableFor = 0;
  health.takeDamage();
  boosts.update(0, player, health);
  assert.equal(health.value, settings.health.max - 1);

  player.x = 100;
  boosts.update(0, player, health);
  assert.equal(boosts.speedMultiplier, settings.boosts.items.speed.multiplier);
  boosts.update(settings.boosts.items.speed.duration, player, health);
  assert.equal(boosts.speedMultiplier, 1);
  player.x = 200;
  boosts.update(0, player, health);
  assert.equal(boosts.damageMultiplier, 2);
  boosts.update(settings.boosts.items.damage.duration, player, health);
  assert.equal(boosts.damageMultiplier, 1);

  boosts.reset();
  assert(Object.values(boosts.pickups).every((pickup) => !pickup.collected));
  assert.equal(boosts.speedMultiplier, 1);
  assert.equal(boosts.damageMultiplier, 1);
});

test('distributed healing bubbles wait until health is missing', () => {
  const boosts = new Boosts(settings.boosts, {
    heal: bounds.heal,
    heal2: { x: 100, y: 0, width: 28, height: 28 },
  });
  const health = new PlayerHealth(settings.health);
  const player = { x: 0, y: 0, width: 28, height: 28 };
  boosts.update(0, player, health);
  assert.equal(boosts.pickups.heal.collected, false);
  health.takeDamage();
  boosts.update(0, player, health);
  assert.equal(boosts.pickups.heal.collected, true);
  player.x = 100;
  health.invulnerableFor = 0;
  health.takeDamage();
  boosts.update(0, player, health);
  assert.equal(boosts.pickups.heal2.collected, true);
  assert.equal(health.value, settings.health.max);
  assert.equal(boosts.kindFor('heal2'), 'heal');
  assert.equal('damage' in boosts.pickups, false);
});

test('speed boost changes movement and damage boost affects sword and projectiles', () => {
  const player = {
    x: 0, y: 0, width: 32, height: 40, vx: 0, vy: 0, facing: 1, grounded: true,
    settings: settings.player,
  };
  const movement = new PlayerMovement(player,
    { horizontal: 1, consumeJump: () => false }, { move: () => {} }, 1000);
  movement.update(1, settings.boosts.items.speed.multiplier);
  assert.equal(player.vx, settings.player.moveSpeed * settings.boosts.items.speed.multiplier);
  movement.update(1, 1);
  assert.equal(player.vx, settings.player.moveSpeed);

  const enemy = {
    x: 45, y: 0, width: 30, height: 26, alive: true,
    takeDamage(amount) { this.damage = amount; },
  };
  const sword = new SwordSkill({ ...settings.swordSkill,
    pickup: { x: 0, y: 0, width: 28, height: 28 } });
  sword.activate(player, { items: [enemy] }, 2);
  assert.equal(enemy.damage, settings.swordSkill.damage * 2);

  const shots = new PlayerShots();
  shots.add({ x: 45, y: 0, width: 10, height: 10, damage: 1, stun: 0,
    life: 1, update() {} });
  shots.update(0, { items: [enemy] }, 2);
  assert.equal(enemy.damage, 2);
});

test('generated boosts occupy distinct safe platforms', () => {
  for (let seed = 0; seed < 500; seed++) {
    const level = generateLevel(settings.level, seed);
    assert.deepEqual(Object.keys(level.boostPickups), Object.keys(settings.boosts.items));
    const boostPlatforms = Object.values(level.boostPickups).map((pickup) => {
      const index = level.platforms.slice(0, settings.level.generation.mainPlatforms)
        .findIndex((platform) => pickup.x >= platform.x &&
          pickup.x + pickup.width <= platform.x + platform.width &&
          pickup.y + pickup.height < platform.y && pickup.y >= platform.y - 60);
      assert(index >= 0, `seed ${seed}: boost is off platform`);
      assert(!level.enemies.some((enemy) => enemy.platformIndex === index));
      assert(!level.chestPickups.some((chest) => chest.x === pickup.x));
      return index;
    });
    assert.equal(new Set(boostPlatforms).size, boostPlatforms.length);
  }
});
