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
    const symbols = [];
    controls.render({
      save() {}, restore() {}, drawImage(image) { drawn.push(image); },
      beginPath() {}, arc() {}, fill() {}, stroke() {}, moveTo() {}, lineTo() {},
      closePath() {}, rotate() {}, scale() {},
      translate(x, y) { symbols.push([x, y]); },
      createRadialGradient() { return { addColorStop() {} }; },
    }, 'playing');
    assert.deepEqual(drawn.slice(-3), [
      images.controlLeft, images.controlRight, images.controlUp,
    ]);
    for (const [index, action] of ['left', 'right', 'jump'].entries()) {
      const rect = controls.touchVisuals[action];
      assert.deepEqual(symbols[index], [rect.x + rect.width / 2,
        rect.y + rect.height / 2]);
    }
  } finally {
    globalThis.matchMedia = previousMatchMedia;
  }
});

test('portrait touch lanes cover every button and the surrounding space without overlap', () => {
  const previousMatchMedia = globalThis.matchMedia;
  globalThis.matchMedia = () => ({ matches: true });
  try {
    const icons = Object.fromEntries(['pause', 'sound', 'restart'].map((name) =>
      [name, { x: -100, y: -100, width: 1, height: 1 }]));
    const controls = new Controls({ icons, colors: {} }, {}, {});
    for (const width of [500, 760]) {
      const viewport = { left: 230, right: 230 + width, top: 0, bottom: 1000 };
      controls.layout(viewport);
      const areas = Object.values(controls.touchAreas);
      assert.equal(areas[0].x, viewport.left);
      assert.equal(areas[2].x + areas[2].width, viewport.right);
      for (let i = 0; i < areas.length - 1; i++)
        assert.equal(areas[i].x + areas[i].width, areas[i + 1].x);
      for (const [action, visual] of Object.entries(controls.touchVisuals)) {
        const area = controls.touchAreas[action];
        assert(area.width > visual.width && area.height > visual.height * 2);
        assert(area.x <= visual.x && area.x + area.width >= visual.x + visual.width);
        assert(area.y <= visual.y && area.y + area.height >= visual.y + visual.height);
        for (const x of [visual.x, visual.x + visual.width / 2, visual.x + visual.width - 1])
          for (const y of [visual.y, visual.y + visual.height / 2,
            visual.y + visual.height - 1])
            assert.equal(controls.hit({ x, y }, 'playing'), action);
        assert.equal(controls.hit({ x: area.x + 1, y: area.y + 1 }, 'playing'), action);
      }
      for (let i = 0; i < areas.length - 1; i++)
        assert.equal(controls.hit({ x: areas[i].x + areas[i].width,
          y: viewport.bottom - 1 }, 'playing'),
        Object.keys(controls.touchAreas)[i + 1]);
      assert.equal(controls.hit({ x: viewport.left + 30,
        y: viewport.bottom - 301 }, 'playing'), null);
    }
  } finally {
    globalThis.matchMedia = previousMatchMedia;
  }
});
