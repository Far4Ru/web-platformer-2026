function randomSource(seed) {
  let state = seed >>> 0;
  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ value >>> 15, value | 1);
    value ^= value + Math.imul(value ^ value >>> 7, value | 61);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function between(random, min, max) {
  return min + Math.floor(random() * (max - min + 1));
}

function shuffled(random, items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index--) {
    const other = between(random, 0, index);
    [result[index], result[other]] = [result[other], result[index]];
  }
  return result;
}

function pickFromZones(random, zones, excluded = new Set(), project = (index) => index) {
  return zones.map(([first, last]) => {
    let radius = 0;
    let candidates = [];
    while (!candidates.length) {
      candidates = Array.from({ length: last - first + 1 + radius * 2 },
        (_, index) => first - radius + index)
        .filter((index) => index > 0 && index < zones.at(-1)[1] + 2
          && !excluded.has(project(index)));
      radius++;
    }
    const choice = candidates[between(random, 0, candidates.length - 1)];
    const result = project(choice);
    excluded.add(result);
    return result;
  });
}

function routeHeight(index, anchors) {
  const next = anchors.findIndex((anchor) => anchor.index >= index);
  if (next <= 0) return anchors[0].y;
  const left = anchors[next - 1];
  const right = anchors[next];
  const fraction = (index - left.index) / (right.index - left.index);
  return left.y + (right.y - left.y) * fraction;
}

export function generateLevel(template, requestedSeed) {
  const rules = template.generation;
  if (!rules?.enabled) return template;
  const seed = (requestedSeed ?? rules.seed ?? Math.floor(Math.random() * 4294967296)) >>> 0;
  const random = randomSource(seed);
  const profileIndex = between(random, 0, rules.heightProfiles.length - 1);
  const anchors = rules.heightProfiles[profileIndex].map((anchor) => ({
    index: anchor.index, y: between(random, ...anchor.range),
  }));
  const junctionCount = between(random, ...rules.junctionCount);
  const starts = shuffled(random, rules.junctionZones)
    .slice(0, junctionCount)
    .map((zone) => between(random, ...zone))
    .sort((left, right) => left - right);
  const patterns = shuffled(random, rules.junctionPatterns.slice(0, junctionCount));
  const junctions = starts.map((startIndex, order) => ({
    startIndex, endIndex: startIndex + rules.junctionSpan,
    pattern: patterns[order],
    rise: between(random, ...rules.upperRise),
    drop: between(random, ...rules.lowerDrop),
  }));
  const junctionAt = (index) => junctions.find((junction) =>
    index > junction.startIndex && index <= junction.endIndex);
  const sharedIndex = (index) => {
    const junction = junctionAt(index);
    if (!junction || index === junction.endIndex) return index;
    return index - junction.startIndex <= rules.junctionSpan / 2
      ? junction.startIndex : junction.endIndex;
  };
  const route = [{ ...rules.startPlatform }];

  for (let index = 1; index < rules.mainPlatforms; index++) {
    const previous = route[index - 1];
    const junction = junctionAt(index);
    const gapRange = index === 1 ? rules.firstGap
      : junction ? index === junction.endIndex ? rules.junctionExitGap : rules.junctionGap
        : rules.gap;
    const x = previous.x + previous.width + between(random, ...gapRange);
    const startY = junction && route[junction.startIndex].y;
    const target = junction
      ? index === junction.endIndex
        ? startY + between(random, -rules.junctionJitter, rules.junctionJitter)
        : startY - junction.rise
          - (junction.pattern === 'ridge' && index === junction.startIndex + 3
            ? rules.ridgePeak : 0)
          + between(random, -rules.junctionJitter, rules.junctionJitter)
      : index === rules.mainPlatforms - 1
        ? previous.y + between(random, ...rules.finishRoute.entryDrop)
        : routeHeight(index, anchors) + between(random, -rules.heightJitter, rules.heightJitter);
    const y = Math.max(rules.minY, Math.min(rules.maxY,
      Math.max(previous.y - rules.maxStepY, Math.min(previous.y + rules.maxStepY, Math.round(target)))));
    const widthRange = junction || junctions.some((entry) => entry.startIndex === index)
      ? rules.junctionPlatformWidth : rules.platformWidth;
    route.push({ x, y, width: between(random, ...widthRange), height: rules.platformHeight });
  }

  const platforms = [...route];
  const coinPlatforms = route.slice(1).filter((_, offset) => !junctions.some((junction) =>
    offset + 1 > junction.startIndex && offset + 1 < junction.endIndex));
  const objectiveCoins = [];
  for (const junction of junctions) {
    const upper = route.slice(junction.startIndex + 1, junction.endIndex);
    const baseY = route[junction.startIndex].y;
    const lower = upper.map((source, offset) => {
      const dip = junction.pattern === 'canyon' && offset === 1 ? rules.canyonDepth : 0;
      const platform = {
        x: source.x + rules.lowerOffsets[offset],
        y: baseY + junction.drop + dip
          + between(random, -rules.junctionJitter, rules.junctionJitter),
        width: rules.lowerPlatformWidth, height: rules.platformHeight,
      };
      platforms.push(platform);
      return platform;
    });
    junction.upperPlatformIndices = upper.map((_, offset) => junction.startIndex + 1 + offset);
    junction.lowerPlatformIndices = lower.map((platform) => platforms.indexOf(platform));
    coinPlatforms.push(upper[0], upper.at(-1), lower[0], lower.at(-1));

    const backtrack = [
      { x: upper[1].x + (upper[1].width - rules.backtrackWidth) / 2,
        y: upper[1].y - rules.backtrackRise,
        width: rules.backtrackWidth, height: rules.platformHeight },
      { x: upper[0].x + (upper[0].width - rules.backtrackWidth) / 2,
        y: upper[0].y - rules.backtrackHighRise,
        width: rules.backtrackWidth, height: rules.platformHeight },
    ];
    const endpoint = {
      x: upper[0].x - rules.backtrackEndpointOffsetX,
      y: backtrack[1].y - rules.backtrackEndpointRise,
      width: rules.backtrackWidth, height: rules.platformHeight,
      fake: junction.pattern === 'fork',
    };
    junction.backtrackPlatformIndices = [platforms.length, platforms.length + 1, platforms.length + 2];
    platforms.push(...backtrack, endpoint);
    if (!endpoint.fake) {
      for (const offsetX of rules.backtrackRewardOffsets) {
        objectiveCoins.push({ x: endpoint.x + offsetX, y: endpoint.y - rules.coinLift,
          width: rules.coinSize, height: rules.coinSize });
      }
    }
  }

  const coins = coinPlatforms.map((platform) => ({
    x: platform.x + Math.min(rules.coinOffsetX, (platform.width - rules.coinSize) / 2),
    y: platform.y - rules.coinLift,
    width: rules.coinSize,
    height: rules.coinSize,
  })).concat(objectiveCoins);

  const bossRoute = [];
  const bossRules = rules.bossRoute;
  let previousBossPlatform = route.at(-2);
  for (let step = 0; step < bossRules.steps; step++) {
    const platform = {
      x: step === 0 ? route.at(-1).x
        : previousBossPlatform.x + previousBossPlatform.width + bossRules.gap,
      y: previousBossPlatform.y - (step === 0 ? bossRules.firstRise : bossRules.rise),
      width: bossRules.stepWidth, height: rules.platformHeight,
    };
    bossRoute.push(platforms.length);
    platforms.push(platform);
    coins.push({ x: platform.x + rules.coinOffsetX, y: platform.y - rules.coinLift,
      width: rules.coinSize, height: rules.coinSize });
    previousBossPlatform = platform;
  }
  const arena = {
    x: previousBossPlatform.x + previousBossPlatform.width + bossRules.arenaGap,
    y: previousBossPlatform.y - bossRules.arenaRise,
    width: bossRules.arenaWidth, height: rules.platformHeight,
  };
  const arenaIndex = platforms.length;
  bossRoute.push(arenaIndex);
  platforms.push(arena);

  const finishRules = rules.finishRoute;
  const finishRoute = [];
  let previousFinishPlatform = route.at(-1);
  for (let step = 0; step < finishRules.steps; step++) {
    const platform = {
      x: previousFinishPlatform.x + previousFinishPlatform.width + finishRules.gap,
      y: route.at(-1).y,
      width: finishRules.stepWidth, height: rules.platformHeight,
    };
    finishRoute.push(platforms.length);
    platforms.push(platform);
    coins.push({ x: platform.x + rules.coinOffsetX, y: platform.y - rules.coinLift,
      width: rules.coinSize, height: rules.coinSize });
    previousFinishPlatform = platform;
  }
  const finish = {
    x: Math.max(arena.x + arena.width + finishRules.arenaExitGap,
      previousFinishPlatform.x + previousFinishPlatform.width + finishRules.gap),
    y: route.at(-1).y,
    width: finishRules.platformWidth, height: rules.platformHeight,
  };
  const finishIndex = platforms.length;
  finishRoute.push(finishIndex);
  platforms.push(finish);

  const chestIndices = [...new Set(rules.chestIndices.map(sharedIndex))];
  const chestPlatforms = new Set(chestIndices);
  const enemyIndices = pickFromZones(random, rules.enemyZones, new Set(chestPlatforms), sharedIndex);
  const hazardIndices = pickFromZones(random, rules.hazardZones, new Set(chestPlatforms));
  const risingIndices = pickFromZones(random, rules.risingZones, new Set(chestPlatforms));
  const hangingIndices = pickFromZones(random, rules.hangingZones);
  const occupied = new Set([...chestPlatforms, ...enemyIndices, ...hazardIndices,
    ...risingIndices, ...hangingIndices]);
  const boostChosen = new Set();
  const boostIndices = Object.fromEntries(Object.entries(rules.boostZones).map(([kind, zone]) => {
    const available = Array.from({ length: rules.mainPlatforms - 2 }, (_, offset) =>
      offset + 1).filter((index) => sharedIndex(index) === index && !occupied.has(index));
    const preferred = available.filter((index) => index >= zone[0] && index <= zone[1]);
    const fallback = available.length ? available : Array.from(
      { length: rules.mainPlatforms - 2 }, (_, offset) => offset + 1)
      .filter((index) => sharedIndex(index) === index && !chestPlatforms.has(index)
        && !enemyIndices.includes(index) && !boostChosen.has(index));
    const candidates = preferred.length ? preferred : fallback.sort((left, right) =>
      Math.abs(left - (zone[0] + zone[1]) / 2) - Math.abs(right - (zone[0] + zone[1]) / 2)).slice(0, 1);
    const index = candidates[between(random, 0, candidates.length - 1)];
    occupied.add(index);
    boostChosen.add(index);
    return [kind, index];
  }));

  const enemies = enemyIndices.map((platformIndex, index) => {
    const platform = route[platformIndex];
    return {
      platformIndex,
      x: platform.x + platform.width - rules.enemy.width - rules.enemy.edgeInset,
      width: rules.enemy.width,
      height: rules.enemy.height,
      speed: between(random, ...rules.enemy.speed),
      direction: random() < 0.5 ? -1 : 1,
      visualVariant: index % 4,
      animationPhase: random() * Math.PI * 2,
      maxHealth: rules.enemy.health[index],
      abilityInterval: between(random, ...rules.enemy.abilityIntervalTenths) / 10,
    };
  });
  enemies.push({
    platformIndex: arenaIndex,
    x: arena.x + bossRules.bossOffsetX,
    width: bossRules.bossWidth, height: bossRules.bossHeight,
    speed: bossRules.bossSpeed, direction: -1,
    maxHealth: bossRules.bossHealth, boss: true,
  });

  const hazard = hazardIndices.map((index) => {
    const platform = route[index];
    return { x: platform.x + platform.width - rules.hazard.width - rules.hazard.edgeInset,
      y: platform.y - rules.hazard.height, width: rules.hazard.width,
      height: rules.hazard.height, surface: platform.surface };
  });
  const risingSpikes = risingIndices.map((platformIndex, index) => {
    const platform = route[platformIndex];
    const period = rules.rising.periods[index % rules.rising.periods.length];
    return {
      platformIndex, offsetX: platform.width - rules.rising.width - rules.rising.edgeInset,
      width: rules.rising.width, maxHeight: rules.rising.height, period,
      activeDuration: rules.rising.activeDuration,
      riseTime: rules.rising.riseTime, fallTime: rules.rising.fallTime,
      phase: random() * period,
    };
  });
  const hangingSpikes = hangingIndices.map((platformIndex) => {
    const platform = route[platformIndex];
    return { platformIndex, offsetX: platform.width - rules.hanging.width - rules.hanging.edgeInset,
      width: rules.hanging.width, height: rules.hanging.height };
  });

  const chestPickups = chestIndices.map((index) => {
    const platform = route[index];
    const size = rules.chestSize ?? rules.pickup.size;
    return { x: platform.x + platform.width - size - rules.pickup.edgeInset,
      y: platform.y - rules.pickup.lift, width: size, height: size };
  });
  for (const [surface, zones] of Object.entries(rules.surfaceZones)) {
    for (const zone of zones) {
      const index = between(random, ...zone);
      route[sharedIndex(index)].surface = surface;
    }
  }
  const boostPickups = Object.fromEntries(Object.entries(boostIndices).map(([kind, index]) => {
    const platform = route[index];
    return [kind, { x: platform.x + platform.width - rules.pickup.size - rules.pickup.edgeInset,
      y: platform.y - rules.pickup.lift, width: rules.pickup.size, height: rules.pickup.size }];
  }));
  const goal = { ...template.goal,
    x: finish.x + finish.width - template.goal.width - finishRules.goalInset,
    y: finish.y - template.goal.height, requiresBoss: true };

  return {
    ...template, seed, platforms, coins, enemies, hazard, risingSpikes, hangingSpikes,
    layout: { profileIndex, junctions, bossRoute, arenaIndex, finishRoute, finishIndex },
    chestPickups, boostPickups, goal,
    width: finish.x + finish.width + rules.endPadding,
    top: Math.min(...platforms.map((platform) => platform.y)) - rules.topPadding,
    bottom: Math.max(...platforms.map((platform) => platform.y)) + rules.bottomPadding,
  };
}
