import { drawSheetFrame } from './sprites.js';

export function drawCoin(ctx, coin, index, scene, time, image) {
  if (!coin.active || coin.collected) return;
  const bob = Math.sin(time * scene.coinBobSpeed + index) * scene.coinBobAmount;
  const size = Math.min(coin.width, coin.height) * coin.scale * 1.35;
  ctx.save();
  ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2 + bob);
  const glow = size * (0.64 + Math.sin(time * 5 + index) * 0.06);
  const gradient = ctx.createRadialGradient(0, 0, size * 0.15, 0, 0, glow);
  gradient.addColorStop(0, 'rgba(255, 241, 128, 0.34)');
  gradient.addColorStop(1, 'rgba(255, 207, 72, 0)');
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(0, 0, glow, 0, Math.PI * 2);
  ctx.fill();
  drawSheetFrame(ctx, image, Math.floor(time * 8 + index) % 4, 4,
    -size / 2, -size / 2, size, size);
  ctx.restore();
}
