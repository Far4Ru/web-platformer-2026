import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { Dialogue } from '../js/game/components/Dialogue.js';
import { Chests } from '../js/game/features/Chests.js';
import { PlayerShots } from '../js/game/features/PlayerShots.js';

const { speech } = JSON.parse(readFileSync(new URL('../assets/json/texts.json', import.meta.url)));
const player = { x: 0, y: 0, width: 32, height: 40 };
const object = (x = 90) => ({ x, y: 10, width: 20, height: 20 });

test('restart uses a new opening line and cycles through all variants', () => {
  const dialogue = new Dialogue(speech);
  assert.equal(dialogue.text, 'Куда я попала?');
  for (const line of speech.restart) {
    dialogue.reset(true);
    assert.equal(dialogue.text, line);
    assert.equal(dialogue.visibleCharacters, 0);
    dialogue.update(0.5, player);
    assert.equal(dialogue.visibleCharacters, 8);
  }
  dialogue.reset(true);
  assert.equal(dialogue.text, speech.restart[0]);
  dialogue.reset();
  assert.equal(dialogue.text, 'Куда я попала?');
});

test('new events immediately replace and retype the current line', () => {
  const dialogue = new Dialogue(speech);
  dialogue.update(0.25, player);
  assert.equal(dialogue.visibleCharacters, 4);

  const coin = { ...object(), active: true, collected: false };
  dialogue.update(0.1, player, { coins: [coin] });
  assert.equal(dialogue.text, 'Сокровища!');
  assert.equal(dialogue.visibleCharacters, 0);
  dialogue.update(0.5, player);
  assert.equal(dialogue.visibleCharacters, 8);

  dialogue.update(0.1, player, { hazards: [object(110)] });
  assert.equal(dialogue.text, 'Ой, ой! Опасность!');
  assert.equal(dialogue.visibleCharacters, 0);
  dialogue.onCoinsCollected();
  assert.equal(dialogue.text, 'Оп! Монетка!');
  assert.equal(dialogue.visibleCharacters, 0);

  dialogue.reset(true);
  assert.equal(dialogue.coinSeen, false);
  assert.equal(dialogue.visibleCharacters, 0);
});

test('repeated events rotate phrases and respect cooldowns without a queue', () => {
  const dialogue = new Dialogue(speech);
  dialogue.onCoinsCollected();
  assert.equal(dialogue.text, 'Оп! Монетка!');
  dialogue.onEnemyDefeated();
  assert.equal(dialogue.text, 'Ха-ха!');
  dialogue.onEnemyDefeated();
  assert.equal(dialogue.text, 'Ха-ха!');
  dialogue.update(12, player);
  dialogue.onEnemyDefeated();
  assert.equal(dialogue.text, 'Враг повержен!');
  dialogue.onCoinsCollected();
  assert.equal(dialogue.text, 'Ещё одна!');
});

test('a completed line quickly fades after its text has finished typing', () => {
  const dialogue = new Dialogue(speech);
  dialogue.onCoinsCollected();
  const duration = dialogue.current.duration;
  dialogue.update(duration - 0.14, player);
  assert.equal(dialogue.visibleCharacters, dialogue.text.length);
  assert(dialogue.alpha > 0.45 && dialogue.alpha < 0.55);
  dialogue.update(0.14, player);
  assert.equal(dialogue.text, '');
  assert.equal(dialogue.alpha, 0);
});

test('nearby hazards outrank ambient sightings in the same frame', () => {
  const dialogue = new Dialogue(speech);
  const enemy = { ...object(), alive: true, boss: false };
  const chest = { ...object(), collected: false };
  dialogue.update(0.1, player, {
    hazards: [object()], enemies: [enemy], chests: [chest], surface: 'ice',
  });
  assert.equal(dialogue.text, 'Ой, ой! Опасность!');
  dialogue.update(0.1, player, {
    hazards: [object()], enemies: [enemy], chests: [chest], surface: 'ice',
  });
  assert.equal(dialogue.text, 'Ой, ой! Опасность!');
  assert.equal(dialogue.visibleCharacters, 1);
});

test('cards announce a new skill, its upgrade, and the chosen hell effect', () => {
  const dialogue = new Dialogue(speech);
  const chests = new Chests([], {});
  const run = {
    fireballSkill: { level: 0 }, dialogue,
    hell: { activate() { return true; } },
    input: { clear() {}, suppressUntilRelease() {} },
  };
  const card = { kind: 'skill', id: 'fireball' };
  chests.apply(card, run);
  assert.equal(dialogue.text, 'Огненные шары!');
  chests.apply(card, run);
  assert.equal(dialogue.text, 'Огня стало больше!');

  chests.phase = 'hellCard';
  chests.hellCard = { id: 'arrows' };
  chests.choose(0, run);
  assert.equal(dialogue.text, 'С неба падают стрелы!');
});

test('enemy skills are announced on use nearby; spell lines require a real hit', () => {
  const dialogue = new Dialogue(speech);
  dialogue.onEnemySkill('shoot', { ...object(), alive: true }, player);
  assert.equal(dialogue.text, 'Он стреляет!');
  dialogue.onEnemySkill('dash', { ...object(500), alive: true }, player);
  assert.equal(dialogue.text, 'Он стреляет!');

  const shots = new PlayerShots();
  const enemy = { ...object(), alive: true, shielded: false,
    takeDamage() { return !this.shielded; } };
  const hit = { ...object(), kind: 'fireball', life: 1, damage: 1,
    update() {} };
  const hits = [];
  shots.add(hit);
  shots.update(0.01, { items: [enemy] }, 1, [], (kind) => hits.push(kind));
  assert.deepEqual(hits, ['fireball']);
  dialogue.onSpellHit(hits[0]);
  assert.equal(dialogue.text, 'Огонь попал в цель!');

  enemy.shielded = true;
  shots.add({ ...hit, life: 1 });
  shots.update(0.01, { items: [enemy] }, 1, [], (kind) => hits.push(kind));
  assert.deepEqual(hits, ['fireball']);
});
