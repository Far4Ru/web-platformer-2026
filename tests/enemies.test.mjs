import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Enemies } from '../js/game/features/Enemies.js';
import { ReachGoal } from '../js/game/features/ReachGoal.js';
import { generateLevel } from '../js/game/LevelGenerator.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));

test('ordinary enemies can dash toward the player and jump above their platform', () => {
  const platform = { x: 0, y: 200, width: 300, height: 24 };
  const enemies = new Enemies([{
    platformIndex: 0, x: 60, width: 30, height: 26,
    speed: 50, direction: -1, maxHealth: 2,
  }], [platform], settings.enemyAbilities, settings.bossAbilities);
  const enemy = enemies.items[0];
  enemy.skills = [];
  enemies.activate(enemy, 'dash', { x: 220 });
  assert.equal(enemy.direction, 1);
  enemies.update(0.1, { x: 220 });
  assert(enemy.x > 60 + enemy.settings.speed * 0.1);
  enemies.activate(enemy, 'jump', { x: 220 });
  enemies.update(0.1, { x: 220 });
  assert(enemy.y < platform.y - enemy.height);
  for (let frame = 0; frame < 120; frame++) enemies.update(1 / 60, { x: 220 });
  assert.equal(enemy.y, platform.y - enemy.height);
});

test('boss has 15 HP, multiple random skills, amplified attacks, and gates the portal', () => {
  const level = generateLevel(settings.level, 123);
  const enemies = new Enemies(level.enemies, level.platforms,
    settings.enemyAbilities, settings.bossAbilities);
  const boss = enemies.items.find((enemy) => enemy.boss);
  assert.equal(boss.health, 15);
  assert.equal(boss.skills.length, settings.bossAbilities.count);
  assert.equal(new Set(boss.skills).size, boss.skills.length);
  assert(boss.skills.every((skill) => settings.bossAbilities.kinds.includes(skill)));

  const player = { x: boss.x - 80, y: boss.y, width: 32, height: 40 };
  enemies.activate(boss, 'shoot', player);
  assert.equal(enemies.projectiles.length, settings.bossAbilities.shot.count);
  assert(enemies.projectiles.every((shot) => shot.width > settings.enemyAbilities.shot.size));
  enemies.activate(boss, 'spikes', player);
  assert.equal(enemies.spikes.length, settings.bossAbilities.spikes.count);
  assert(enemies.spikes.every((spike) => spike.maxHeight > settings.enemyAbilities.spikes.height));

  const goal = new ReachGoal(level.goal);
  const letters = { count: 80, items: Array(80) };
  const portalPlayer = { x: level.goal.x, y: level.goal.y,
    width: level.goal.width, height: level.goal.height };
  assert.equal(enemies.bossDefeated, false);
  assert.equal(goal.reachedBy(portalPlayer, letters, enemies.bossDefeated), false);
  boss.takeDamage(14, 0);
  assert.equal(boss.health, 1);
  boss.takeDamage(1, 0);
  assert.equal(enemies.bossDefeated, true);
  assert.equal(goal.reachedBy(portalPlayer, letters, enemies.bossDefeated), true);
});
