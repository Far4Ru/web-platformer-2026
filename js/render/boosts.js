import { drawAtlasCell, drawGridCell } from './sprites.js';

export function drawBoostSymbol(ctx, kind, x, y, color, size, image) {
  const cell = kind === 'heal' ? [2, 1] : kind === 'speed' ? [0, 1] : [1, 0];
  drawAtlasCell(ctx, image, ...cell, x - size / 2, y - size / 2, size, size);
}

export function drawBoostPickup(ctx, pickup, kind, art, time, image) {
  if (pickup.collected) return;
  const x = pickup.x + pickup.width / 2;
  const y = pickup.y + pickup.height / 2 + Math.sin(time * 3) * 3;
  const column = kind === 'heal' ? 0 : kind === 'speed' ? 1 : 2;
  drawGridCell(ctx, image, column, 2, 4, 3, x - 23, y - 23, 46, 46);
}
