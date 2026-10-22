const STAGES = [
  { name: 'Лесные тропы', environment: 'forest', appearance: 'moss',
    platforms: 18, junctions: 1, chests: [3, 7, 13], surfaceKinds: [],
    enemyHealth: [3, 3, 4], abilityChances: [0, 0.25, 0.35],
    abilityIntervalTenths: [44, 52], expectedPower: 0,
    extraHealZones: [[10, 13]],
    enemies: 3, hazards: 2, rising: 2, hanging: 1, boss: false, goal: 0.65 },
  { name: 'Затопленные руины', environment: 'swamp', appearance: 'ruins',
    platforms: 24, junctions: 2, chests: [3, 7, 12, 18], surfaceKinds: ['swamp'],
    enemyHealth: [4, 4, 5, 5, 6], abilityChances: [0.35, 0.4, 0.45, 0.5, 0.55],
    abilityIntervalTenths: [35, 43], expectedPower: 2,
    extraHealZones: [[10, 13], [18, 21]],
    enemies: 5, hazards: 3, rising: 3, hanging: 2, boss: false, goal: 0.7 },
  { name: 'Сердце храма', environment: 'temple', appearance: 'temple',
    platforms: 32, junctions: 3, chests: [3, 7, 12, 18, 24, 29], surfaceKinds: ['ice'],
    enemyHealth: [4, 5, 5, 6, 6, 5, 6],
    abilityChances: [0.45, 0.5, 0.55, 0.6, 0.65, 0.7, 0.75],
    abilityIntervalTenths: [28, 36], expectedPower: 3,
    extraHealZones: [[10, 13], [18, 21], [26, 29]],
    enemies: 7, hazards: 4, rising: 4, hanging: 3, boss: true, goal: 0.7 },
];

export const stageCount = STAGES.length;

export function estimateCombatPower(levels, damageBonus = 0) {
  const attacks = ['sword', 'fireball', 'ice', 'bow'];
  const attackLevels = attacks.reduce((total, kind) => total + (levels[kind] ?? 0), 0);
  return attackLevels + (levels.companion >= 2 ? levels.companion - 1 : 0)
    + (attackLevels > 0 ? damageBonus : 0);
}

export function levelForStage(template, stageIndex, combatPower = null) {
  const stage = STAGES[stageIndex];
  if (!stage) throw new RangeError(`Unknown stage ${stageIndex}`);
  const base = template.generation;
  const last = stage.platforms - 1;
  const needsHelp = combatPower !== null && combatPower < stage.expectedPower;
  const zone = ([first, end]) => [Math.min(first, last - 2), Math.min(end, last - 2)];
  const rules = {
    ...base,
    mainPlatforms: stage.platforms,
    appearance: stage.appearance,
    heightProfiles: base.heightProfiles.map((profile) => [
      profile[0],
      { index: Math.floor(last / 2), range: profile[1].range },
      { index: last, range: profile[2].range },
    ]),
    junctionZones: base.junctionZones.slice(0, stage.junctions),
    junctionCount: [stage.junctions, stage.junctions],
    junctionPatterns: ['fork', 'ridge', 'canyon'].slice(0, stage.junctions),
    chestIndices: stage.chests,
    enemyZones: base.enemyZones.slice(0, stage.enemies).map(zone),
    hazardZones: base.hazardZones.slice(0, stage.hazards).map(zone),
    risingZones: base.risingZones.slice(0, stage.rising).map(zone),
    hangingZones: base.hangingZones.slice(0, stage.hanging).map(zone),
    enemy: { ...base.enemy,
      health: stage.enemyHealth.map((health) => Math.max(1, health - Number(needsHelp))),
      abilityChances: stage.abilityChances,
      abilityIntervalTenths: stage.abilityIntervalTenths },
    surfaceZones: Object.fromEntries(Object.entries(base.surfaceZones)
      .filter(([surface]) => stage.surfaceKinds.includes(surface))
      .map(([surface, zones]) =>
        [surface, zones.filter(([first]) => first < last - 1).map(zone)])),
    boostZones: Object.fromEntries(Object.entries(base.boostZones)
      .filter(([kind]) => kind !== 'heal' && (stage.boss || kind !== 'damage'))
      .map(([kind, range]) => [kind, zone(range)])),
    healZones: [zone(base.boostZones.heal), ...stage.extraHealZones.map(zone)],
    bossRoute: { ...base.bossRoute, enabled: stage.boss,
      bossHealth: needsHelp ? 8 : 16 },
    finishRoute: { ...base.finishRoute, steps: stage.boss ? 3 : 2 },
  };
  return { ...template, name: stage.name, environment: stage.environment,
    goal: { ...template.goal, openFraction: stage.goal }, generation: rules };
}
