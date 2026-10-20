import assert from 'node:assert/strict';
import test from 'node:test';
import { configureCanvas } from '../js/engine/canvas.js';

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
