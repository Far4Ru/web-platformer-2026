import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Chests } from '../js/game/features/Chests.js';
import { HellMode } from '../js/game/features/HellMode.js';
import { PlayerHealth } from '../js/game/features/PlayerHealth.js';
import { PlayerMovement } from '../js/game/features/PlayerMovement.js';
import { Platforms } from '../js/game/features/Platforms.js';
import { drawCard, drawCardIcon, drawHellWall, drawRarityBanner } from '../js/render/cards.js';
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
  assert.equal(cardAtLevel(bow, 1).description, 'Точность стрел: 15%');
  assert.equal(cardAtLevel(bow, 2).description, 'Точность стрел: 40%');
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

test('card icons use the image that belongs to their effect', () => {
  const draws = [];
  const ctx = {
    drawImage(image) { draws.push(image); },
    save() {}, restore() {}, fillText() {},
  };
  const effects = Array.from({ length: 3 }, (_, row) =>
    Array.from({ length: 3 }, (_, column) => `effect-${row}-${column}`));
  const pickups = [[], [], ['health', 'speed', 'damage']];
  const golem = { frames: [{ image: 'golem', x: 0, y: 0, w: 10, h: 10 }] };
  const images = { effects, pickups, golem };
  for (const id of ['health', 'speed', 'damage', 'sword', 'fireball',
    'ice', 'bow', 'healing', 'companion']) drawCardIcon(ctx, id, 0, 0, '#fff', 'serif', images);
  assert.deepEqual(draws, [
    'health', 'speed', 'damage', 'effect-0-0', 'effect-0-1',
    'effect-0-2', 'effect-1-0', 'effect-1-2', 'golem',
  ]);
  for (const card of [...settings.cards.entries, ...settings.cards.hellEntries])
    assert.doesNotThrow(() => drawCardIcon(ctx, card.id, 0, 0, '#fff', 'serif', images));
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
