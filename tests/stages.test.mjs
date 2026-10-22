import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { generateLevel } from '../js/game/LevelGenerator.js';
import { estimateCombatPower, levelForStage, stageCount } from '../js/game/LevelStages.js';
import { Game } from '../js/game/Game.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));

test('stages grow gradually, carry distinct rewards, and reserve the boss for the finale', () => {
  assert.equal(stageCount, 3);
  const expected = [18, 24, 32];
  for (let stage = 0; stage < stageCount; stage++) {
    const template = levelForStage(settings.level, stage);
    const rules = template.generation;
    assert.equal(rules.mainPlatforms, expected[stage]);
    assert.equal(template.environment, ['forest', 'swamp', 'temple'][stage]);
    assert.equal(rules.appearance, ['moss', 'ruins', 'temple'][stage]);
    assert.deepEqual(Object.keys(rules.surfaceZones),
      [[], ['swamp'], ['ice']][stage]);
    assert.equal(rules.junctionCount[0], stage + 1);
    assert.equal(rules.chestIndices.length, [3, 4, 6][stage]);
    assert.equal(rules.bossRoute.enabled, stage === 2);
    assert.deepEqual(rules.enemy.health,
      [[3, 3, 4], [4, 4, 5, 5, 6], [4, 5, 5, 6, 6, 5, 6]][stage]);
    assert.equal(rules.enemy.abilityChances[0], [0, 0.35, 0.45][stage]);
    assert.equal(template.goal.openFraction, stage === 0 ? 0.65 : 0.7);
    assert.equal(rules.healZones.length, stage + 2);
    assert.equal('damage' in rules.boostZones, stage === 2);
  }
});

test('stage routes remain traversable over many seeds and have usable exits', () => {
  for (let stage = 0; stage < stageCount; stage++) {
    const template = levelForStage(settings.level, stage);
    const rules = template.generation;
    for (let seed = 0; seed < 300; seed++) {
      const level = generateLevel(template, seed);
      assert(level.platforms.every((platform) => platform.appearance ===
        (['ice', 'swamp'].includes(platform.surface) ? platform.surface : rules.appearance)));
      const route = level.platforms.slice(0, rules.mainPlatforms);
      for (let index = 1; index < route.length; index++) {
        const from = route[index - 1];
        const to = route[index];
        const rise = from.y - to.y;
        const discriminant = settings.player.jumpSpeed ** 2 - 2 * settings.player.gravity * rise;
        assert(discriminant >= 0, `stage ${stage}, seed ${seed}: excessive rise`);
        const airtime = (settings.player.jumpSpeed + Math.sqrt(discriminant))
          / settings.player.gravity;
        assert(to.x - from.x - from.width < settings.player.moveSpeed * airtime
          + settings.player.width - 10, `stage ${stage}, seed ${seed}: excessive gap`);
      }
      assert.equal(level.chestPickups.length, rules.chestIndices.length);
      assert.equal(level.layout.junctions.length, stage + 1);
      assert.equal(level.enemies.filter((enemy) => enemy.boss).length, stage === 2 ? 1 : 0);
      assert.equal(level.goal.requiresBoss, undefined);
      assert.equal(Object.keys(level.boostPickups).filter((key) => key.startsWith('heal')).length,
        stage + 2);
      assert(level.goal.x >= level.platforms[level.layout.finishIndex].x);
      const drops = level.enemies.map((enemy) => enemy.maxHealth + (enemy.boss ? 5 : 1));
      const required = Math.ceil((level.coins.length + drops.reduce((a, b) => a + b, 0))
        * level.goal.openFraction);
      const bossDrop = stage === 2 ? drops.at(-1) : 0;
      const regularDrops = drops.slice(0, stage === 2 ? -1 : undefined)
        .sort((a, b) => b - a);
      assert(level.coins.length + bossDrop + regularDrops[0] + regularDrops[1] >= required,
        `stage ${stage}, seed ${seed}: portal needs too many enemy drops`);
      if (stage === 2) assert(level.coins.length + regularDrops.reduce((a, b) => a + b, 0)
        >= required, `stage ${stage}, seed ${seed}: boss coins are required`);
      const exitPath = [rules.mainPlatforms - 1, ...level.layout.bossRoute,
        ...level.layout.finishRoute]
        .filter((index) => index !== null).map((index) => level.platforms[index]);
      for (let index = 1; index < exitPath.length; index++) {
        const from = exitPath[index - 1];
        const to = exitPath[index];
        const gap = to.x - from.x - from.width;
        const riseBack = to.y - from.y;
        assert(gap >= 0 && gap <= Math.max(rules.finishRoute.gap,
          rules.bossRoute.gap, rules.bossRoute.arenaGap),
          `stage ${stage}, seed ${seed}: disconnected finish`);
        assert(Math.abs(riseBack) <= settings.player.jumpSpeed ** 2
          / (2 * settings.player.gravity) - 10,
        `stage ${stage}, seed ${seed}: cannot return from finish`);
      }
    }
  }
});

test('weaker builds get bounded relief without making strong builds harder', () => {
  assert.equal(estimateCombatPower({ sword: 1, bow: 2, companion: 2 }, 1), 5);
  assert.equal(estimateCombatPower({ healing: 3 }, 2), 0);
  for (const stage of [1, 2]) {
    const weak = levelForStage(settings.level, stage, 0).generation;
    const normal = levelForStage(settings.level, stage, 10).generation;
    assert(weak.enemy.health.every((health, index) =>
      health === Math.max(1, normal.enemy.health[index] - 1)));
    assert.deepEqual(normal.enemy.health, levelForStage(settings.level, stage, 100).generation.enemy.health);
    assert.equal(weak.bossRoute.bossHealth, 8);
    assert.equal(normal.bossRoute.bossHealth, 16);
  }
});

test('advancing an expedition retains the earned build and restores one health', () => {
  const game = Object.create(Game.prototype);
  const kinds = ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow'];
  game.stageIndex = 0;
  game.stageCount = 3;
  game.settings = { storageKey: 'stage-test-score' };
  game.phase = 'stage';
  game.winLose = { state: null, reset() { this.state = null; } };
  game.player = { reset() {} };
  game.playerHealth = { settings: { max: 5 }, value: 2, displayValue: 2 };
  game.cardBonuses = { damage: 1, speed: 1.5 };
  game.chests = { rerolls: 2, blessed: true, hellUsed: true };
  for (const kind of kinds) game[`${kind}Skill`] = { level: kind === 'sword' ? 3 : 1 };
  game.buildLevel = () => {
    game.cardBonuses = { damage: 0, speed: 1 };
    game.chests = { rerolls: 0, blessed: false, hellUsed: false };
    for (const kind of kinds) game[`${kind}Skill`] = { level: 0 };
  };
  game.captureCheckpoint = () => {};
  game.hud = { reset() {} };
  game.dialogue = { reset() {} };
  game.input = { clear() {} };
  game.music = { play() {} };
  game.engine = { resetTime() {} };
  game.advanceStage();
  assert.equal(game.stageIndex, 1);
  assert.equal(game.phase, 'playing');
  assert.equal(game.swordSkill.level, 3);
  assert.equal(game.iceSkill.level, 1);
  assert.deepEqual(game.cardBonuses, { damage: 1, speed: 1.5 });
  assert.equal(game.bestScore.storageKey, 'stage-test-score:stage:2');
  assert.deepEqual(game.chests, { rerolls: 2, blessed: true, hellUsed: true });
  assert.equal(game.playerHealth.value, 3);
});

test('retry restores the same stage seed and its starting build', () => {
  const game = Object.create(Game.prototype);
  game.stageIndex = 2;
  game.level = { seed: 7654 };
  game.player = { reset() {} };
  game.playerHealth = { settings: { max: 5 }, value: 2, displayValue: 2 };
  game.cardBonuses = { damage: 1, speed: 1.5 };
  game.chests = { rerolls: 1, blessed: false, hellUsed: true };
  for (const kind of ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow'])
    game[`${kind}Skill`] = { level: kind === 'sword' ? 2 : 0 };
  game.captureCheckpoint(2);
  let generated;
  game.buildLevel = (power, seed) => {
    generated = { power, seed };
    game.cardBonuses = { damage: 0, speed: 1 };
    game.chests = { rerolls: 0, blessed: false, hellUsed: false };
    game.swordSkill = { level: 0 };
  };
  game.playerHealth.value = 0;
  game.swordSkill.level = 3;
  game.restoreCheckpoint();
  assert.deepEqual(generated, { power: 2, seed: 7654 });
  assert.equal(game.stageIndex, 2);
  assert.equal(game.playerHealth.value, 2);
  assert.equal(game.swordSkill.level, 2);
  assert.deepEqual(game.cardBonuses, { damage: 1, speed: 1.5 });
});
