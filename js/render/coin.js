import { drawGridCell } from './sprites.js';

export function drawCoin(ctx, coin, index, scene, time, image) {
  if (!coin.active || coin.collected) return;
  const bob = Math.sin(time * scene.coinBobSpeed + index) * scene.coinBobAmount;
  const size = Math.min(coin.width, coin.height) * coin.scale * 1.35;
  ctx.save();
  ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2 + bob);
  drawGridCell(ctx, image, Math.floor(time * 8 + index) % 4, 0, 4, 3,
    -size / 2, -size / 2, size, size);
  ctx.restore();
}
