import assert from 'node:assert/strict';
import test from 'node:test';
import { Controls } from '../js/ui/Controls.js';

test('touch jump renders the loaded up-arrow image', () => {
  const previousMatchMedia = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: true });
  try {
    const images = Object.fromEntries([
      'controlPause', 'controlSound', 'controlRestart',
      'controlLeft', 'controlRight', 'controlUp',
    ].map((name) => [name, { name }]));
    const rect = { x: 0, y: 0, width: 50, height: 50 };
    const controls = new Controls({
      icons: { pause: rect, sound: rect, restart: rect }, colors: {},
    }, {}, images);
    const drawn = [];
    controls.render({
      save() {}, restore() {}, drawImage(image) { drawn.push(image); },
    }, 'playing');
    assert.deepEqual(drawn.slice(-3), [
      images.controlLeft, images.controlRight, images.controlUp,
    ]);
  } finally {
    globalThis.matchMedia = previousMatchMedia;
  }
});
