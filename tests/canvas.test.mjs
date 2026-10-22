import assert from 'node:assert/strict';
import test from 'node:test';
import { configureCanvas } from '../js/engine/canvas.js';
import { Camera } from '../js/game/components/Camera.js';
import { CardOverlay } from '../js/ui/CardOverlay.js';
import { Overlay } from '../js/ui/Overlay.js';

test('mobile canvas caps backing resolution while preserving its aspect ratio', () => {
  const previousWindow = globalThis.window;
  globalThis.window = {
    devicePixelRatio: 3,
    matchMedia: () => ({ matches: true }),
    addEventListener() {},
  };
  try {
    const canvas = {
      width: 0, height: 0,
      getBoundingClientRect: () => ({ width: 390, height: 844 }),
    };
    configureCanvas(canvas);
    assert.equal(canvas.width, 585);
    assert.equal(canvas.height, 1266);
  } finally {
    globalThis.window = previousWindow;
  }
});

test('portrait camera keeps the first platform visible and follows within the level', () => {
  const camera = new Camera(960, 540, { width: 5000, top: -500, bottom: 1000 });
  const viewport = { left: 230, right: 730, top: 0, bottom: 1000 };
  const player = { x: 78, y: 420, width: 32, height: 40 };
  camera.setViewport(viewport, player);
  assert.equal(camera.x + viewport.left, 0);
  player.x = 1200;
  camera.follow(player);
  assert.equal(player.x + player.width / 2 - camera.x, 480);
});

test('portrait cards stack within the visible area and keep matching hit boxes', () => {
  const cards = new CardOverlay({ cards: { x: 104, y: 130, width: 232,
    height: 252, gap: 28, reroll: { x: 370, y: 410, width: 220, height: 48 } } },
  {}, { width: 960, height: 540 }, {});
  const viewport = { left: 230, right: 730, top: 0, bottom: 900 };
  cards.layout(viewport);
  const offers = [0, 1, 2].map((index) => cards.rect(index));
  assert(offers.every((rect) => rect.x >= viewport.left
    && rect.x + rect.width <= viewport.right));
  assert(offers[0].y < offers[1].y && offers[1].y < offers[2].y);
  assert(cards.rerollRect().y + cards.rerollRect().height <= viewport.bottom);
  assert.deepEqual(cards.hit({ x: 480, y: offers[2].y + 80 },
    { phase: 'choice', rerolls: 0, offers: [1, 2, 3] }), { kind: 'choose', index: 2 });
});

test('portrait result banner and its button share the visible center', () => {
  const overlay = new Overlay({ font: 'serif', colors: { veil: '#000', button: '#fff' },
    overlay: { panel: { x: 250, y: 130, width: 460, height: 280 },
      button: { x: 350, y: 410, width: 260, height: 54 } } },
  {}, { width: 960, height: 540 },
  { templePlaque: { width: 2172, height: 724 }, mayaButton: {} });
  const translations = [];
  const ctx = { save() {}, restore() {}, drawImage() {}, fillRect() {}, fillText() {},
    translate(x, y) { translations.push([x, y]); },
    measureText(text) { return { width: text.length * 10 }; } };
  overlay.render(ctx, 'stage', { left: 230, right: 730, top: 0, bottom: 1080 },
    0, { stageIndex: 0, stageCount: 3, level: { name: 'Лесные тропы' } });
  assert.equal(overlay.verticalOffset, 270);
  assert.deepEqual(translations[0], [0, 270]);
  assert.equal(overlay.hitPrimary({ x: 480, y: 707 }), true);
  assert.equal(overlay.hitPrimary({ x: 480, y: 437 }), false);
});
