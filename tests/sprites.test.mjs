import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import test from 'node:test';
import { loadImages } from '../js/engine/images.js';
import { drawAtlasCell, drawGridCell, drawSheetFrame } from '../js/render/sprites.js';

const settings = JSON.parse(readFileSync(new URL('../assets/json/game.json', import.meta.url)));
const animationNames = ['explorer', 'explorerActions', 'golem', 'guardian', 'boss',
  'coinAnimation', 'chestAnimation'];

function pngSize(path) {
  const file = readFileSync(new URL(`../${path}`, import.meta.url));
  assert.equal(file.subarray(0, 8).toString('hex'), '89504e470d0a1a0a');
  return { width: file.readUInt32BE(16), height: file.readUInt32BE(20) };
}

test('static objects are separate PNGs; animations are PNG sheets with JSON atlases', () => {
  const staticPaths = ['objects', 'effects', 'pickups']
    .flatMap((group) => settings.images[group].flat(Infinity));
  assert.equal(staticPaths.length, 22);
  assert.equal(new Set(staticPaths).size, staticPaths.length);
  for (const path of staticPaths) {
    assert(path.startsWith('assets/sprites/'));
    assert(statSync(new URL(`../${path}`, import.meta.url)).size > 100);
    pngSize(path);
  }
  for (const name of animationNames) {
    const { base, clips, order } = settings.images[name];
    assert(base.startsWith('assets/animations/'));
    const clipLengths = {};
    for (const clip of clips) {
      const size = pngSize(`${base}/${clip}.png`);
      const data = JSON.parse(readFileSync(new URL(`../${base}/${clip}.json`, import.meta.url)));
      assert(data.frames.length >= 1);
      assert.deepEqual(data.animations[clip], data.frames.map((_, index) => index));
      clipLengths[clip] = data.frames.length;
      for (const frame of data.frames) {
        assert(frame.x >= 0 && frame.y >= 0);
        assert(frame.x + frame.w <= size.width);
        assert(frame.y + frame.h <= size.height);
      }
    }
    for (const [clip, index] of order)
      assert(clips.includes(clip) && index >= 0 && index < clipLengths[clip]);
  }
});

test('sprite helpers use static images and animation atlas coordinates', () => {
  const calls = [];
  const ctx = { drawImage(...args) { calls.push(args); } };
  const grid = [[{ id: 'coin' }, { id: 'chest' }], [{ id: 'spike' }]];
  drawAtlasCell(ctx, grid, 1, 0, 10, 20, 30, 40);
  drawGridCell(ctx, grid, 0, 1, 2, 2, 10, 20, 30, 40);
  drawSheetFrame(ctx, { image: { id: 'sheet', height: 724 },
    frames: [{ x: 0, y: 70, w: 362, h: 535 },
      { x: 362, y: 70, w: 362, h: 535 }] }, 1, 2, 10, 20, 30, 40);
  assert.deepEqual(calls.map(([image]) => image.id), ['chest', 'spike', 'sheet']);
  assert.deepEqual(calls[2].slice(1), [362, 70, 362, 535, 10, 20, 30, 40]);
});

test('image loader retains animation metadata and static grid order', async () => {
  const OriginalImage = globalThis.Image;
  const originalFetch = globalThis.fetch;
  globalThis.Image = class {
    set src(value) { this.path = value; queueMicrotask(() => this.onload()); }
  };
  globalThis.fetch = async () => ({ ok: true, json: async () => ({
    frames: [{ x: 0, y: 0, w: 10, h: 10 }], animations: { idle: [0] },
  }) });
  try {
    const result = await loadImages({ animation: { base: 'hero', clips: ['idle'],
      order: [['idle', 0]] },
      grid: [['one.png', 'two.png']] });
    assert.equal(result.animation.frames[0].image.path, 'hero/idle.png');
    assert.deepEqual(result.animation.animations.idle, [0]);
    assert.deepEqual(result.grid[0].map((image) => image.path), ['one.png', 'two.png']);
  } finally {
    globalThis.Image = OriginalImage;
    globalThis.fetch = originalFetch;
  }
});
