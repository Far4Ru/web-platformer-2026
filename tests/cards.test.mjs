import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Chests } from '../js/game/features/Chests.js';
import { HellMode } from '../js/game/features/HellMode.js';
import { PlayerHealth } from '../js/game/features/PlayerHealth.js';
import { PlayerMovement } from '../js/game/features/PlayerMovement.js';
import { Platforms } from '../js/game/features/Platforms.js';
import { drawCard, drawHellWall, drawRarityBanner } from '../js/render/cards.js';
import { CardOverlay, cardAtLevel } from '../js/ui/CardOverlay.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url), 'utf8'));
const chestBounds = [
  { x: 0, y: 0, width: 34, height: 34 },
  { x: 100, y: 0, width: 34, height: 34 },
];

test('card reward keeps the chosen offer for its center animation and shows only its level effect', () => {
  const chests = new Chests(chestBounds, settings.cards, () => 0.5);
  const run = game();
  const bow = settings.cards.entries.find((card) => card.id === 'bow');
  chests.offers = [settings.cards.entries[0], bow, settings.cards.entries[1]];
  chests.phase = 'choice';
  assert.equal(cardAtLevel(bow, 1).description, 'Точность стрел: 65%');
  assert.equal(cardAtLevel(bow, 2).description, 'Точность стрел: 85%');
  assert.equal(cardAtLevel(bow, 3).description, 'Точность стрел: 100%');
  assert(chests.choose(1, run));
  assert.equal(chests.rewardIndex, 1);
  assert.equal(chests.rewardOffers.length, 3);
  assert.equal(chests.rewardCard.id, 'bow');
  assert.equal(chests.rewardLevel, 1);
});

test('reward rays appear after the selected card reaches the center', () => {
  const rays = { width: 600, height: 600 };
  const draws = [];
  const ctx = {
    save() {}, restore() {}, translate() {}, scale() {}, fillRect() {},
    fillText() {}, measureText(text) { return { width: text.length * 7 }; },
    drawImage(image) { draws.push(image); },
  };
  const card = settings.cards.entries[0];
  const overlay = new CardOverlay(settings.ui, settings.cards, settings.world,
    { cardCommon: { width: 457, height: 507 }, cardRewardRays: rays });
  const reward = { active: true, phase: 'reward', rewardCard: card,
    rewardOffers: [card], rewardIndex: 0, rewardLevel: 0, timer: 1.5 };
  overlay.render(ctx, reward, game(), 0);
  assert(!draws.includes(rays));
  reward.timer = 1;
  overlay.render(ctx, reward, game(), 1);
  assert(draws.includes(rays));
});

function game() {
  const boss = { alive: true, boss: true, health: 15 };
  return {
    input: { clear() {} }, engine: { resetTime() {} },
    playerHealth: new PlayerHealth(settings.health),
    cardBonuses: { damage: 0, speed: 1 },
    collectCoins: { count: 0, grant(amount) { this.count += amount; }, discardDrops() {} },
    enemies: { items: [boss], bossDefeated: false, changeDifficulty() {} },
    hell: { activate(kind) { this.kind = kind; } },
    ...Object.fromEntries(['healing', 'sword', 'companion', 'fireball', 'ice', 'bow']
      .map((kind) => [`${kind}Skill`, { level: 0 }])),
  };
}

test('chest pauses for a choice; upgrades, rerolls and fake cards behave as advertised', () => {
  const run = game();
  const chests = new Chests(chestBounds, { ...settings.cards, hellChance: 0 }, () => 0);
  chests.update(0, { x: 0, y: 0, width: 34, height: 34 }, run);
  assert.equal(chests.phase, 'opening');
  chests.update(settings.cards.openingDuration, null, run);
  assert.equal(chests.phase, 'choice');
  assert.equal(chests.offers.length, 3);
  chests.moveSelection(-1);
  assert.equal(chests.selectedIndex, 2);
  chests.moveSelection(1);
  assert.equal(chests.selectedIndex, 0);
  chests.apply(settings.cards.entries.find((card) => card.id === 'reroll'), run);
  assert.equal(chests.rerolls, 1);
  assert(chests.reroll(run));
  assert.equal(chests.rerolls, 0);
  assert.equal(chests.selectedIndex, 0);
  const health = settings.cards.entries.find((card) => card.id === 'health');
  chests.apply(health, run);
  assert.equal(run.playerHealth.settings.max, settings.health.max + 1);
  const sword = settings.cards.entries.find((card) => card.id === 'sword');
  for (let index = 0; index < 5; index++) chests.apply(sword, run);
  assert.equal(run.swordSkill.level, 3);
  chests.drawOffers(run);
  assert(!chests.offers.some((card) => card.id === 'sword'));
  const before = { ...run.cardBonuses };
  chests.apply(settings.cards.entries.find((card) => card.kind === 'fake'), run);
  assert.deepEqual(run.cardBonuses, before);
  chests.apply(settings.cards.entries.find((card) => card.id === 'noBoss'), run);
  assert.equal(run.enemies.items[0].health, 0);
  assert.equal(run.collectCoins.count, 15);
  assert.equal(run.enemies.items[0].dropped, true);
});

test('only one chest can turn infernal; blessing prevents a future transformation', () => {
  const run = game();
  const chests = new Chests(chestBounds, { ...settings.cards, hellChance: 1,
    transformDuration: 1 }, () => 0);
  const player = { x: 0, y: 0, width: 34, height: 34 };
  chests.update(0, player, run);
  assert.equal(chests.phase, 'transform');
  chests.update(1, player, run);
  assert.equal(chests.phase, 'hellCard');
  chests.choose(0, run);
  assert.equal(run.hell.kind, 'wall');
  assert.equal(chests.phase, 'reward');
  assert.equal(chests.rewardCard.rarity, 'hell');
  chests.update(settings.cards.rewardBannerDuration, null, run);
  player.x = 100;
  chests.update(0, player, run);
  assert.equal(chests.phase, 'opening');
  chests.update(settings.cards.openingDuration, null, run);
  assert.equal(chests.phase, 'choice');

  const blessed = new Chests(chestBounds, { ...settings.cards, hellChance: 1 }, () => 0);
  blessed.apply(settings.cards.entries.find((card) => card.id === 'blessing'), run);
  blessed.update(0, { x: 0, y: 0, width: 34, height: 34 }, run);
  blessed.update(settings.cards.openingDuration, null, run);
  assert.equal(blessed.phase, 'choice');
});

test('new skills remain available and speed bonuses stop at twice base speed', () => {
  const run = game();
  const cards = { ...settings.cards, rarityWeights: Object.fromEntries(
    Object.keys(settings.cards.rarityWeights).map((rarity) => [rarity, 0])) };
  const chests = new Chests(chestBounds, cards, () => 0);
  chests.drawOffers(run);
  assert(chests.offers.some((card) => card.kind === 'skill'));
  const speed = settings.cards.entries.find((card) => card.id === 'speed');
  chests.apply(speed, run);
  chests.apply(speed, run);
  chests.apply(speed, run);
  assert.equal(run.cardBonuses.speed, 2);
  const damage = settings.cards.entries.find((card) => card.id === 'damage');
  chests.apply(damage, run);
  chests.apply(damage, run);
  assert.equal(run.cardBonuses.damage, 1);
  chests.drawOffers(run);
  assert(!chests.offers.some((card) => card.id === 'speed'));
  assert(!chests.offers.some((card) => card.id === 'damage'));
});

test('rarity weights describe tiers rather than multiplying by cards in each tier', () => {
  let seed = 12345;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0)
    / 4294967296);
  const run = game();
  for (const kind of ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow'])
    run[`${kind}Skill`].level = 3;
  const chests = new Chests(chestBounds, settings.cards, random);
  const counts = { common: 0, rare: 0, epic: 0, legendary: 0 };
  const realCards = settings.cards.entries.filter((card) => card.kind !== 'fake');
  for (let index = 0; index < 10000; index++) {
    counts[chests.pickWeighted(realCards).rarity]++;
  }
  for (const [rarity, weight] of Object.entries(settings.cards.rarityWeights))
    assert(Math.abs(counts[rarity] / 100 - weight) < 2,
      `${rarity}: got ${counts[rarity] / 100}% instead of ${weight}%`);
});

test('fake cards appear in about half of all chests without adding offer slots', () => {
  let seed = 98765;
  const random = () => ((seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0)
    / 4294967296);
  const chests = new Chests(chestBounds, settings.cards, random);
  const found = new Set();
  for (const skillLevel of [0, 1, 3]) {
    const run = game();
    for (const kind of ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow'])
      run[`${kind}Skill`].level = skillLevel;
    let fakeChests = 0;
    for (let index = 0; index < 10000; index++) {
      chests.drawOffers(run);
      assert.equal(chests.offers.length, settings.cards.choiceCount);
      const fakes = chests.offers.filter((card) => card.kind === 'fake');
      assert(fakes.length <= 1);
      if (fakes.length) {
        fakeChests++;
        found.add(fakes[0].id);
      }
    }
    const normalChestChance = fakeChests / 10000;
    assert(normalChestChance > 0.50 && normalChestChance < 0.56,
      `fake chance at skill level ${skillLevel}: ${normalChestChance}`);
  }
  assert.deepEqual(found, new Set([
    ...settings.cards.entries.filter((card) => card.kind === 'fake'),
    ...settings.cards.fakeVariants,
  ].map((card) => card.id)));
});

test('new fake superpowers do not change the run', () => {
  const run = game();
  const chests = new Chests(chestBounds, settings.cards);
  const before = {
    health: run.playerHealth.value,
    maxHealth: run.playerHealth.settings.max,
    bonuses: { ...run.cardBonuses },
    coins: run.collectCoins.count,
    enemyHealth: run.enemies.items[0].health,
    skills: ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow']
      .map((kind) => run[`${kind}Skill`].level),
  };
  for (const card of settings.cards.fakeVariants) chests.apply(card, run);
  assert.deepEqual({
    health: run.playerHealth.value,
    maxHealth: run.playerHealth.settings.max,
    bonuses: { ...run.cardBonuses },
    coins: run.collectCoins.count,
    enemyHealth: run.enemies.items[0].health,
    skills: ['healing', 'sword', 'companion', 'fireball', 'ice', 'bow']
      .map((kind) => run[`${kind}Skill`].level),
  }, before);
});

test('each new fake superpower has its own loaded card illustration', () => {
  const draws = [];
  const images = {
    cardCommon: { width: 457, height: 507 },
    cardArt: settings.images.cardArt.map((path) => ({ path, width: 768, height: 256 })),
  };
  const ctx = {
    save() {}, restore() {},
    drawImage(image) { draws.push(image.path); },
    fillText() {}, measureText(text) { return { width: text.length * 7 }; },
  };
  for (const card of settings.cards.fakeVariants) {
    const path = `assets/ui/card-art-${card.id}.png`;
    assert(readFileSync(new URL(`../${path}`, import.meta.url)).length > 1000);
    draws.length = 0;
    drawCard(ctx, card, { x: 0, y: 0, width: 232, height: 252 },
      '#fff', 'serif', {}, 'ОБЫЧНАЯ', '', false, 0, 0, images);
    assert(draws.includes(path), `missing card artwork: ${card.id}`);
  }
});

test('card confirmation requires 0.5 uninterrupted seconds of holding', () => {
  const run = game();
  const chests = new Chests(chestBounds, { ...settings.cards, hellChance: 0 }, () => 0);
  chests.update(0, { x: 0, y: 0, width: 34, height: 34 }, run);
  chests.update(settings.cards.openingDuration, null, run);
  assert(chests.startHold('key:Space'));
  chests.update(0.4, null, run);
  assert.equal(chests.phase, 'choice');
  assert.equal(chests.holdProgress, 0.4);
  chests.cancelHold('key:Space');
  assert.equal(chests.holdProgress, 0);
  chests.startHold('key:KeyW');
  chests.update(0.2, null, run);
  chests.moveSelection(1);
  assert.equal(chests.holdProgress, 0);
  chests.startHold('key:ArrowUp');
  chests.update(0.5, null, run);
  assert.equal(chests.phase, 'reward');
  assert(settings.cards.rarityColors[chests.rewardCard.rarity]);
  chests.update(settings.cards.rewardBannerDuration, null, run);
  assert.equal(chests.phase, null);
});

test('down-arrow reroll requires 0.5 seconds and cancels on release', () => {
  const run = game();
  const chests = new Chests(chestBounds, { ...settings.cards, hellChance: 0 }, () => 0);
  chests.update(0, { x: 0, y: 0, width: 34, height: 34 }, run);
  chests.update(settings.cards.openingDuration, null, run);
  chests.rerolls = 1;
  chests.startRerollHold();
  chests.update(0.4, null, run);
  assert.equal(chests.rerolls, 1);
  chests.cancelHold('key:ArrowDown');
  chests.startRerollHold();
  chests.update(0.5, null, run);
  assert.equal(chests.rerolls, 0);
  assert.equal(chests.rerollProgress, 0);
});

test('reward banner uses the color and label of each rarity', () => {
  const labels = [];
  const ctx = {
    save() {}, restore() {}, translate() {}, scale() {}, beginPath() {},
    roundRect() {}, fill() {}, stroke() {}, drawImage() {},
    fillRect() {}, fillText(text) { labels.push([text, this.fillStyle]); },
  };
  for (const rarity of ['common', 'rare', 'epic', 'legendary', 'hell']) {
    drawRarityBanner(ctx, { title: 'Карта', description: 'Награда' },
      settings.cards.rarityColors[rarity], settings.cards.rarityLabels[rarity],
      settings.cards.uiText.reward, settings.ui.cards.colors, settings.ui.font,
      settings.world, 0, { panel: { width: 64, height: 64 } });
  }
  assert.deepEqual(labels.filter(([text]) => text.includes('·')).map(([, color]) => color),
    ['common', 'rare', 'epic', 'legendary', 'hell']
      .map((rarity) => settings.cards.rarityColors[rarity]));
});

test('held card grows while its confirmation progress is shown', () => {
  const scales = [];
  const fills = [];
  const ctx = {
    save() {}, restore() {}, translate() {}, beginPath() {}, roundRect() {},
    fill() {}, stroke() {}, strokeRect() {}, fillText() {}, drawImage() {},
    measureText(text) { return { width: text.length * 8 }; },
    scale(x, y) { scales.push([x, y]); },
    fillRect(...args) { fills.push(args); },
  };
  drawCard(ctx, settings.cards.entries[0],
    { x: 100, y: 100, width: 232, height: 252 }, '#fff', 'Alice, serif',
    settings.ui.cards.colors, 'ОБЫЧНАЯ', '', true, 0.5, 1,
    { panel: { width: 64, height: 64 }, panelDark: { width: 64, height: 64 },
      vineWind: { width: 64, height: 64 }, panelBorder: { width: 64, height: 64 },
      pickups: [[], [], [{ width: 362, height: 362 }]],
      effects: [[{ width: 512, height: 341 }]] });
  assert(scales[0][0] > 1);
  assert(fills.some((rect) => rect[2] === 100));
});

test('hell freeze still lets gravity act; ice slides and swamp slows', () => {
  const player = { x: 0, y: 0, width: 32, height: 40, vx: 100, vy: 0,
    grounded: true, groundPlatform: { surface: 'ice' }, frozenFor: 0,
    facing: 1, settings: settings.player };
  let horizontal = 0;
  const movement = new PlayerMovement(player,
    { get horizontal() { return horizontal; }, consumeJump: () => false },
    { move(body, dt) { body.y += body.vy * dt; } }, 1000);
  movement.update(0.1);
  assert(player.vx > 0);
  player.groundPlatform.surface = 'swamp';
  horizontal = 1;
  movement.update(1);
  assert.equal(player.vx, settings.player.moveSpeed * 0.55);
  const hell = new HellMode(settings.cards.hell, () => 0);
  const run = { player, level: { width: 1000 }, platforms: { items: [] },
    enemies: { items: [] }, camera: { y: 0 }, canvas: { height: 540 } };
  hell.activate('freeze', run);
  hell.update(0.1, run);
  assert(player.frozenFor > 0);
  const oldY = player.y;
  movement.update(0.1);
  assert.equal(player.vx, 0);
  assert(player.y > oldY);
});

test('infernal holes remove collision and shielded enemies reject damage', () => {
  const platforms = new Platforms([{ x: 0, y: 100, width: 200, height: 24 }]);
  const player = { x: 20, y: 40, width: 32, height: 40, groundPlatform: null };
  const run = { player, platforms, enemies: { items: [] }, level: { width: 500 },
    camera: { y: 0 }, canvas: { height: 540 } };
  const hell = new HellMode(settings.cards.hell, () => 0);
  hell.activate('holes', run);
  hell.update(0.1, run);
  assert(platforms.items[0].holeFor > 0);
  assert.equal(platforms.items[0].holeX, 0);
  const falling = { x: 5, y: 40, width: 32, height: 40, vx: 0, vy: 300 };
  platforms.move(falling, 0.1);
  assert.equal(falling.grounded, false);

  const enemy = { alive: true, shieldFor: 0 };
  const shieldRun = { ...run, enemies: { items: [enemy], addSkills(count) { this.added = count; } } };
  const shield = new HellMode(settings.cards.hell);
  shield.activate('enemies', shieldRun);
  assert.equal(shieldRun.enemies.added, 1);
  assert.equal(enemy.shieldFor, 5);
});

test('infernal wall paints the whole area behind it black', () => {
  const rectangles = [];
  const ctx = { save() {}, restore() {}, fillRect(...args) {
    rectangles.push({ color: this.fillStyle, args });
  } };
  const art = settings.scene.hell;
  drawHellWall(ctx, { kind: 'wall', wallX: 300 }, { x: 100 },
    { width: 960, height: 540 }, art);
  assert.deepEqual(rectangles, [
    { color: art.behindWall, args: [0, 0, 200, 540] },
    { color: art.wall, args: [200, 0, 24, 540] },
  ]);
});
