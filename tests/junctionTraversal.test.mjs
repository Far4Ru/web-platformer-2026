import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { moveAndCollide } from '../js/engine/collision.js';
import { generateLevel } from '../js/game/LevelGenerator.js';
import { levelForStage } from '../js/game/LevelStages.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));
const player = settings.player;
const dt = 1 / 120;

function canReach(from, to, platforms, jump) {
  const direction = to.x + to.width / 2 < from.x + from.width / 2 ? -1 : 1;
  for (const brake of [false, true]) for (const inset of [0, 12, 24, 40, 56, 72, 90, 110, 130, 150]) {
    const body = {
      x: direction > 0
        ? Math.max(from.x, from.x + from.width - player.width - inset)
        : Math.min(from.x + from.width - player.width, from.x + inset),
      y: from.y - player.height,
      width: player.width, height: player.height,
      vx: direction * player.moveSpeed, vy: jump ? -player.jumpSpeed : 0,
      grounded: false,
    };
    for (let frame = 0; frame < 180; frame++) {
      const reachedTargetX = direction > 0
        ? body.x + body.width >= to.x + 8
        : body.x <= to.x + to.width - 8;
      const targetSpeed = brake && reachedTargetX ? 0 : direction * player.moveSpeed;
      const acceleration = targetSpeed === 0 ? player.deceleration : player.acceleration;
      body.vx += Math.sign(targetSpeed - body.vx)
        * Math.min(Math.abs(targetSpeed - body.vx), acceleration * dt);
      body.vy = Math.min(player.maxFallSpeed, body.vy + player.gravity * dt);
      moveAndCollide(body, platforms, dt);
      if (body.grounded && Math.abs(body.y + body.height - to.y) < 0.1
        && body.x + body.width > to.x && body.x < to.x + to.width) return true;
      if (body.y > to.y + 300
        || direction > 0 && body.x > to.x + to.width + 100
        || direction < 0 && body.x + body.width < to.x - 100) break;
    }
  }
  return false;
}

test('both roads and backward objectives are reachable with solid ceilings', () => {
  for (let seed = 0; seed < 500; seed++) {
    const level = generateLevel(settings.level, seed);
    const solid = level.platforms.filter((platform) => !platform.fake);
    for (const junction of level.layout.junctions) {
      const start = level.platforms[junction.startIndex];
      const end = level.platforms[junction.endIndex];
      const upper = junction.upperPlatformIndices.map((index) => level.platforms[index]);
      const lower = junction.lowerPlatformIndices.map((index) => level.platforms[index]);
      for (const [road, name] of [[upper, 'upper'], [lower, 'lower']]) {
        const path = [start, ...road, end];
        for (let index = 1; index < path.length; index++) {
          assert(canReach(path[index - 1], path[index], solid, true)
            || canReach(path[index - 1], path[index], solid, false),
            `seed ${seed}: ${name} road at ${junction.startIndex}, hop ${index}`);
        }
      }
      const [step, highStep, endpoint] = junction.backtrackPlatformIndices
        .map((index) => level.platforms[index]);
      if (endpoint.fake) {
        const solidEndpoint = { ...endpoint, fake: false };
        assert(canReach(highStep, solidEndpoint, [...solid, solidEndpoint], true),
          `seed ${seed}: fake endpoint at ${junction.startIndex} cannot be approached`);
      }
      assert(canReach(end, upper[2], solid, true),
        `seed ${seed}: cannot turn back from the junction exit at ${junction.startIndex}`);
      const retreat = [upper[2], step, highStep, endpoint];
      const lastSolid = endpoint.fake ? retreat.length - 2 : retreat.length - 1;
      for (let index = 1; index <= lastSolid; index++) {
        assert(canReach(retreat[index - 1], retreat[index], solid, true),
          `seed ${seed}: backward route at ${junction.startIndex}, hop ${index}`);
      }
      for (let index = lastSolid; index > 0; index--) {
        assert(canReach(retreat[index], retreat[index - 1], solid, true)
          || canReach(retreat[index], retreat[index - 1], solid, false),
        `seed ${seed}: return route at ${junction.startIndex}, hop ${index}`);
      }
    }
    const bossPath = [level.platforms[settings.level.generation.mainPlatforms - 1],
      ...level.layout.bossRoute.map((index) => level.platforms[index])];
    const mainEnd = level.platforms[settings.level.generation.mainPlatforms - 1];
    assert(canReach(level.platforms[settings.level.generation.mainPlatforms - 2], mainEnd,
      solid, false)
      || canReach(level.platforms[settings.level.generation.mainPlatforms - 2], mainEnd,
        solid, true),
    `seed ${seed}: lower route of final fork is blocked`);
    for (let index = 1; index < bossPath.length; index++) {
      assert(canReach(bossPath[index - 1], bossPath[index], solid, true),
        `seed ${seed}: boss route hop ${index}`);
    }
    const finishPath = [bossPath.at(-1),
      ...level.layout.finishRoute.map((index) => level.platforms[index])];
    for (let index = 1; index < finishPath.length; index++) {
      assert(canReach(finishPath[index - 1], finishPath[index], solid, true)
        || canReach(finishPath[index - 1], finishPath[index], solid, false),
      `seed ${seed}: finish route hop ${index}`);
    }
    if (seed < 60) {
      const fullPath = [...bossPath, ...finishPath.slice(1)];
      for (let index = fullPath.length - 1; index > 0; index--)
        assert(canReach(fullPath[index], fullPath[index - 1], solid, true),
          `seed ${seed}: return from finish, hop ${index}`);
    }
  }
});

test('final stage connects the boss arena and portal in both directions', () => {
  const template = levelForStage(settings.level, 2);
  for (let seed = 0; seed < 100; seed++) {
    const level = generateLevel(template, seed);
    const solid = level.platforms.filter((platform) => !platform.fake);
    const path = [template.generation.mainPlatforms - 1,
      ...level.layout.bossRoute, ...level.layout.finishRoute]
      .map((index) => level.platforms[index]);
    for (let index = 1; index < path.length; index++) {
      assert(canReach(path[index - 1], path[index], solid, true),
        `seed ${seed}: cannot approach portal at hop ${index}`);
      assert(canReach(path[index], path[index - 1], solid, true),
        `seed ${seed}: cannot return from portal at hop ${index}`);
    }
  }
});
