import assert from 'node:assert/strict';
import test from 'node:test';
import { drawEarth, drawPlatform, grassTufts, windPulse } from '../js/render/platform.js';
import { drawBackground } from '../js/render/background.js';
import { visibleGroundPlatforms } from '../js/game/components/GameScene.js';
import { GrassMotion } from '../js/game/features/GrassMotion.js';

const images = {
  earth: { width: 72 },
  swampEarth: { width: 1024, height: 1024 },
  iceEarth: { width: 1254, height: 1254 },
  platformBases: [{ width: 2172, height: 724 },
    { width: 1904, height: 826 }, { width: 2172, height: 724 }],
  grassWind: { width: 2172, height: 724 },
  surfaceDetails: { width: 2172, height: 724 },
};

function context() {
  const draws = [];
  const rects = [];
  const rounded = [];
  const transforms = [];
  const ctx = {
    draws, rects, rounded, transforms, save() {}, restore() {}, beginPath() {},
    translate(...args) { transforms.push(['translate', ...args]); },
    scale(...args) { transforms.push(['scale', ...args]); },
    rect(...args) { rects.push(args); }, clip() {},
    roundRect(...args) { rounded.push(args); },
    drawImage(...args) { draws.push(args); },
    fillRect() { throw new Error('Platform textures must come from images'); },
  };
  return ctx;
}

test('earth follows platform material and holes remain clipped', () => {
  const ctx = context();
  const platform = { x: 20, y: 100, width: 120, height: 24, surface: 'ice',
    holeFor: 1, holeX: 60, holeWidth: 20 };
  drawEarth(ctx, [platform], images, { earthOpacity: 1, earthTileSize: 72 },
    { x: 0, y: 0 }, { left: 0, right: 160, top: 0, bottom: 300 });
  assert(ctx.draws.length > 0);
  assert(ctx.draws.every(([image]) => image === images.iceEarth));
  assert.deepEqual(ctx.rects, [[20, 124, 40, 176], [80, 124, 60, 176]]);
  const swamp = context();
  drawEarth(swamp, [{ ...platform, surface: 'swamp', holeFor: 0 }], images,
    { earthOpacity: 1, earthTileSize: 72 }, { x: 0, y: 0 },
    { left: 0, right: 160, top: 0, bottom: 300 });
  assert(swamp.draws.every(([image]) => image === images.swampEarth));
  assert(swamp.draws.every((draw) => draw[3] === 256 && draw[4] === 256));
  const normal = context();
  drawEarth(normal, [{ ...platform, surface: 'normal', holeFor: 0 }], images,
    { earthOpacity: 1, earthTileSize: 72 }, { x: 0, y: 0 },
    { left: 0, right: 160, top: 0, bottom: 300 });
  assert(normal.draws.every(([image]) => image === images.earth));
});

test('platform texture matches hitbox and grass reacts to passage, then rests', () => {
  const platform = { x: 0, y: 100, width: 300, height: 24,
    surface: 'normal', fake: false, holeFor: 0 };
  const tuft = grassTufts(platform)[0];
  assert(tuft);
  const windyTime = (775 + tuft.x) / 370;
  const calm = context();
  drawPlatform(calm, platform, {}, images, windyTime);
  const firstGrass = calm.draws.find(([image]) => image === images.grassWind);
  assert(firstGrass);
  const player = { x: tuft.x - 10, y: 60, width: 20, height: 40,
    vx: 0, grounded: true };
  const motion = new GrassMotion();
  motion.update(0.05, player, [platform]);
  assert.equal(motion.remaining(tuft.key), 0);
  const standing = context();
  drawPlatform(standing, platform, {}, images, windyTime, player, motion);
  player.vx = 120;
  motion.update(0.05, player, [platform]);
  assert(motion.remaining(tuft.key) > 0);
  const brushed = context();
  drawPlatform(brushed, platform, {}, images, windyTime, player, motion);
  player.vx = 0;
  motion.update(0.37, player, [platform]);
  const settled = context();
  drawPlatform(settled, platform, {}, images, windyTime, player, motion);
  const grass = (ctx) => ctx.draws.filter(([image]) => image === images.grassWind)
    .map((draw) => draw[1]);
  assert(grass(calm).length <= 4);
  assert.notDeepEqual(grass(standing), grass(calm));
  assert.notDeepEqual(grass(brushed), grass(standing));
  assert.deepEqual(grass(settled), grass(standing));
  player.vx = -120;
  motion.update(0.05, player, [platform]);
  const brushedLeft = context();
  drawPlatform(brushedLeft, platform, {}, images, windyTime, player, motion);
  assert.equal(motion.direction(tuft.key), -1);
  assert(brushedLeft.transforms.some(([kind, x]) => kind === 'scale' && x === -1));
  assert(calm.draws.some(([image]) => image === images.surfaceDetails));
  assert.deepEqual(calm.draws.find(([image]) => image === images.platformBases[0]).slice(1),
    [0, 100, 300, 24]);
  assert.deepEqual(calm.rounded, [[0, 100, 300, 24, 5]]);
  assert(windPulse(windyTime, tuft.x) > 0.99);
});

test('ice and swamp repeat smaller mirrored texture pieces across platforms', () => {
  for (const surface of ['ice', 'swamp']) {
    const ctx = context();
    drawPlatform(ctx, { x: 0, y: 100, width: 300, height: 24,
      surface, fake: false, holeFor: 0 }, {}, images);
    const image = images.platformBases[surface === 'ice' ? 1 : 2];
    const tiles = ctx.draws.filter(([drawn]) => drawn === image);
    assert.equal(tiles.length, 4);
    assert(tiles.every((draw) => draw[3] === 96 && draw[4] === 24));
    assert(ctx.transforms.some(([kind, x]) => kind === 'scale' && x === -1));
  }
});

test('wide viewport keeps the first platform at its own bounds', () => {
  const first = { x: 45, y: 460, width: 255, height: 24 };
  assert.deepEqual(visibleGroundPlatforms([first], -600, 1400), [first]);
  assert.equal(first.x, 45);
  assert.equal(first.width, 255);
});

test('foreground vines switch sprite sheet frames without deforming the background', () => {
  const ctx = context();
  ctx.globalAlpha = 1;
  const background = {
    jungle: { width: 2172, height: 724 },
    temple: { width: 2172, height: 724 },
    foliage: { width: 2172, height: 724 },
    vineWind: { width: 2172, height: 724 },
  };
  const settings = { forestSpeed: 0.35, templeSpeed: 0.65,
    foregroundSpeed: 1, foregroundOpacity: 1,
    transitionStart: 0.42, transitionLength: 0.4 };
  drawBackground(ctx, { width: 960, height: 540 }, background, settings, 0, 8000, 0);
  assert.equal(ctx.draws.filter(([image]) => image === background.foliage).length, 1);
  assert(ctx.draws.filter(([image]) => image === background.vineWind).length >= 4);
  assert(ctx.draws.every(([image]) => Object.values(background).includes(image)));
});
