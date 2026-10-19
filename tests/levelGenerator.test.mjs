import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateLevel } from '../js/game/LevelGenerator.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));
const template = settings.level;
const rules = template.generation;

function sharedIndex(index, junctions) {
  const junction = junctions.find((entry) => index > entry.startIndex && index < entry.endIndex);
  if (!junction) return index;
  return index - junction.startIndex <= rules.junctionSpan / 2
    ? junction.startIndex : junction.endIndex;
}

function assertJumpPath(path, seed) {
  for (let index = 1; index < path.length; index++) {
    const from = path[index - 1];
    const to = path[index];
    const rise = from.y - to.y;
    const discriminant = settings.player.jumpSpeed ** 2 - 2 * settings.player.gravity * rise;
    assert(discriminant >= 0, `seed ${seed}: jump is too high`);
    const airtime = (settings.player.jumpSpeed + Math.sqrt(discriminant)) / settings.player.gravity;
    const reachableGap = settings.player.moveSpeed * airtime + settings.player.width;
    assert(to.x - from.x - from.width < reachableGap - 20,
      `seed ${seed}: route gap is too wide`);
  }
}

test('a seed reproduces the same map and different seeds change it', () => {
  assert.deepEqual(generateLevel(template, 12345), generateLevel(template, 12345));
  assert.notDeepEqual(generateLevel(template, 12345).platforms,
    generateLevel(template, 54321).platforms);
});

test('seeds change the overall route and the branch layout', () => {
  const levels = Array.from({ length: 48 }, (_, seed) => generateLevel(template, seed));
  assert.equal(new Set(levels.map((level) => level.layout.profileIndex)).size,
    rules.heightProfiles.length);
  assert(new Set(levels.map((level) => level.layout.junctions
    .map((junction) => junction.startIndex).join(','))).size >= 12);
  assert.equal(new Set(levels.flatMap((level) => level.layout.junctions
    .map((junction) => junction.pattern))).size, 3);
  const middleHeights = levels.map((level) => level.platforms[18].y);
  assert(Math.max(...middleHeights) - Math.min(...middleHeights) >= 500);
  assert(new Set(levels.map((level) => level.layout.junctions.length)).size > 1);
});

test('generated routes and required objects obey movement limits', () => {
  for (let seed = 0; seed < 500; seed++) {
    const level = generateLevel(template, seed);
    const route = level.platforms.slice(0, rules.mainPlatforms);
    const junctions = level.layout.junctions;
    const rewardJunctions = junctions.filter((junction) => junction.pattern !== 'fork');
    assert.equal(rewardJunctions.length, 2);
    assert.equal(level.letters.length, route.length - 1 + junctions.length
      + rewardJunctions.length * rules.backtrackRewardOffsets.length
      + rules.bossRoute.steps);
    assert.equal(level.enemies.length, rules.enemyZones.length + 1);
    assert.equal(level.hazard.length, rules.hazardZones.length);
    assert.equal(level.risingSpikes.length, rules.risingZones.length);
    assert.equal(level.hangingSpikes.length, rules.hangingZones.length);
    const totalLetters = level.letters.length + level.enemies.reduce((total, enemy) =>
      total + enemy.maxHealth, 0);
    const onePathLetters = route.length - 1 - junctions.length + rules.bossRoute.steps;
    const reachableAfterSword = onePathLetters + level.enemies
      .filter((enemy) => enemy.platformIndex > rules.skillIndices.sword)
      .reduce((total, enemy) => total + enemy.maxHealth, 0);
    assert(reachableAfterSword >= Math.ceil(totalLetters * level.goal.openFraction));

    for (let index = 1; index < route.length; index++) {
      const previous = route[index - 1];
      const current = route[index];
      const gap = current.x - previous.x - previous.width;
      assert(gap >= 0 && gap <= rules.maxGap,
        `seed ${seed}: gap after platform ${index - 1}`);
      assert(Math.abs(current.y - previous.y) <= rules.maxStepY,
        `seed ${seed}: height after platform ${index - 1}`);
    }

    for (const [kind, pickup] of Object.entries(level.skillPickups)) {
      const platform = route[sharedIndex(rules.skillIndices[kind], junctions)];
      assert(pickup.x >= platform.x && pickup.x + pickup.width <= platform.x + platform.width);
      assert(pickup.y + pickup.height < platform.y);
    }
    for (const enemy of level.enemies) {
      const platform = level.platforms[enemy.platformIndex];
      assert(enemy.x >= platform.x && enemy.x + enemy.width <= platform.x + platform.width);
      if (!enemy.boss) assert.equal(sharedIndex(enemy.platformIndex, junctions), enemy.platformIndex);
      assert(!Object.values(level.skillPickups).some((pickup) =>
        pickup.x >= platform.x && pickup.x < platform.x + platform.width));
    }
    assert.equal(new Set(level.enemies.map((enemy) => enemy.platformIndex)).size,
      level.enemies.length);
    for (const junction of junctions) {
      const start = route[junction.startIndex];
      const end = route[junction.endIndex];
      const upper = junction.upperPlatformIndices.map((index) => level.platforms[index]);
      const lower = junction.lowerPlatformIndices.map((index) => level.platforms[index]);
      assert.equal(upper.length, 3);
      assert.equal(lower.length, 3);
      assertJumpPath([start, ...upper, end], seed);
      assertJumpPath([start, ...lower, end], seed);
      const lowerEntryGap = lower[0].x - start.x - start.width;
      const walkOffReach = settings.player.width + settings.player.moveSpeed
        * Math.sqrt(2 * (lower[0].y - start.y) / settings.player.gravity);
      assert(lowerEntryGap < walkOffReach - 5,
        `seed ${seed}: lower route cannot be entered without jumping upward`);
      for (const platform of upper) assert(platform.y < start.y - 55);
      for (const platform of lower) assert(platform.y > start.y + 55);
      assert(lower[2].x + lower[2].width - upper[2].x - upper[2].width >= 32,
        `seed ${seed}: lower route is blocked by upper route`);
      assert(end.x > lower[2].x + lower[2].width,
        `seed ${seed}: lower route overlaps its exit`);
      const [step, highStep, endpoint] = junction.backtrackPlatformIndices
        .map((index) => level.platforms[index]);
      assert(upper[2].x > step.x && step.x > highStep.x && highStep.x > endpoint.x);
      assert.equal(endpoint.fake, junction.pattern === 'fork');
      if (!endpoint.fake) {
        assert.equal(level.letters.filter((letter) =>
          letter.x >= endpoint.x && letter.x + letter.width <= endpoint.x + endpoint.width
          && letter.y + letter.height < endpoint.y).length,
        rules.backtrackRewardOffsets.length);
      }
    }
    assert.equal(level.platforms.length, rules.mainPlatforms + junctions.length * 6
      + rules.bossRoute.steps + 1);
    assert.equal(level.layout.bossRoute.length, rules.bossRoute.steps + 1);
    const bossEntry = level.platforms[level.layout.bossRoute[0]];
    assert.equal(bossEntry.x, route.at(-1).x);
    assert(bossEntry.y < route.at(-1).y - settings.player.height);
    const arena = level.platforms[level.layout.arenaIndex];
    const boss = level.enemies.at(-1);
    assert.equal(boss.platformIndex, level.layout.arenaIndex);
    assert.equal(boss.maxHealth, 15);
    assert.equal(boss.boss, true);
    assert.equal(arena.width, rules.bossRoute.arenaWidth);
    assert.equal(level.goal.requiresBoss, true);
    assert.equal(level.goal.y + level.goal.height, arena.y);
    assert(level.goal.x >= arena.x && level.goal.x + level.goal.width <= arena.x + arena.width);
  }
});

test('manual level remains available when generation is disabled', () => {
  const manual = { ...template, generation: { ...template.generation, enabled: false } };
  assert.equal(generateLevel(manual), manual);
});
