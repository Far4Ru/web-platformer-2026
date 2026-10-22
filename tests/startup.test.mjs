import assert from 'node:assert/strict';
import test from 'node:test';
import { countImageResources } from '../js/engine/images.js';
import { Music } from '../js/game/features/Music.js';
import { drawOverlayFrame } from '../js/render/overlay.js';
import { containRect, drawLoadingScreen } from '../js/engine/LoadingScreen.js';

test('preload progress counts images and animation atlases', () => {
  assert.equal(countImageResources([
    'background.png', ['icon.png'],
    { base: 'animations/player', clips: ['idle', 'run'] },
    { sheet: 'chest.png', atlas: 'chest.json' },
  ]), 8);
});

test('engine loading screen contains art and fades its edges into black bars', () => {
  const fills = [];
  const draws = [];
  const gradients = [];
  const labels = [];
  const ctx = {
    setTransform() {}, fillText(...args) { labels.push(args); },
    fillRect(...args) { fills.push(args); },
    drawImage(...args) { draws.push(args); },
    createLinearGradient(...args) {
      const stops = [];
      gradients.push({ args, stops });
      return { addColorStop(...stop) { stops.push(stop); } };
    },
  };
  const canvas = { width: 1600, height: 900,
    getBoundingClientRect: () => ({ width: 1600 }) };
  const art = { width: 941, height: 1672 };
  const rect = containRect(canvas.width, canvas.height, art.width, art.height);
  assert(rect.width < canvas.width);
  assert.equal(rect.height, canvas.height);
  drawLoadingScreen(ctx, canvas, art, 0.5, false);
  assert.deepEqual(fills[0], [0, 0, 1600, 900]);
  assert.deepEqual(draws[0].slice(1), [rect.x, rect.y, rect.width, rect.height]);
  assert.equal(gradients.length, 4);
  assert(gradients.every((gradient) => gradient.stops[0][1] === '#000'
    || gradient.stops[1][1] === '#000'));
  assert(labels[0][0].includes('50%'));
  assert.equal(labels[0][1], rect.x + rect.width / 2);
  assert(labels[0][2] > rect.y + rect.height * 0.85);
  assert(labels[0][2] < rect.y + rect.height);
  const bar = fills.at(-2);
  assert(bar[0] >= rect.x && bar[0] + bar[2] <= rect.x + rect.width);
  assert(bar[1] > labels[0][2] && bar[1] + bar[3] < rect.y + rect.height);
  drawLoadingScreen(ctx, canvas, art, 1, true);
  assert(labels.at(-1)[0].startsWith('Нажмите'));
  assert.equal(labels.at(-1)[2], labels[0][2]);
});

test('music is not requested before the game starts', () => {
  const originalAudio = globalThis.Audio;
  let created = 0;
  globalThis.Audio = class {
    constructor() { created++; }
    play() { return Promise.resolve(); }
    pause() {}
  };
  try {
    const music = new Music({ src: 'music.mp3', volume: 0.4 });
    assert.equal(created, 0);
    music.play();
    assert.equal(created, 1);
    music.pause();
    music.play();
    assert.equal(created, 1);
  } finally {
    globalThis.Audio = originalAudio;
  }
});

test('music switches between stage and event tracks and reuses loaded audio', () => {
  const originalAudio = globalThis.Audio;
  const created = [];
  globalThis.Audio = class {
    constructor(src) { this.src = src; created.push(this); }
    play() { return Promise.resolve(); }
    pause() {}
  };
  try {
    const music = new Music({ volume: 0.25, tracks: {
      forest: { src: 'forest.mp3', volume: 0.2 },
      boss: { src: 'boss.mp3', volume: 0.3 },
    } });
    music.play('forest');
    music.play('boss');
    music.play('forest');
    assert.deepEqual(created.map((audio) => audio.src), ['forest.mp3', 'boss.mp3']);
    assert.equal(music.audio, created[0]);
    assert.equal(music.audio.volume, 0.2);
    assert.equal(music.audio.currentTime, 0);
  } finally {
    globalThis.Audio = originalAudio;
  }
});

test('the opening stage can preload before the first play gesture', () => {
  const originalAudio = globalThis.Audio;
  const created = [];
  globalThis.Audio = class {
    constructor(src) { this.src = src; this.loads = 0; created.push(this); }
    load() { this.loads++; }
    play() { return Promise.resolve(); }
    pause() {}
  };
  try {
    const music = new Music({ preload: 'forest', tracks: {
      forest: { src: 'forest.mp3', volume: 0.42 },
    } });
    assert.equal(created.length, 1);
    assert.equal(created[0].loads, 1);
    music.play('forest');
    assert.equal(created.length, 1);
    assert.equal(music.audio, created[0]);
  } finally {
    globalThis.Audio = originalAudio;
  }
});

test('overlay veil covers the entire visible viewport', () => {
  const fills = [];
  const ctx = {
    fillRect: (...args) => fills.push(args),
    drawImage() {},
  };
  drawOverlayFrame(ctx, { width: 960, height: 540 },
    { x: 250, y: 130, width: 460, height: 280 },
    { veil: '#000' }, { panel: { width: 20, height: 20 } },
    { left: -200, top: -100, right: 1160, bottom: 900 });
  assert.deepEqual(fills[0], [-200, -100, 1360, 1000]);
});
