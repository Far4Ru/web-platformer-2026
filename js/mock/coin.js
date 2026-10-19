export function drawCoin(ctx, coin, index, scene, time) {
  if (!coin.active || coin.collected) return;
  const bob = Math.sin(time * scene.coinBobSpeed + index) * scene.coinBobAmount;
  const radius = Math.min(coin.width, coin.height) * coin.scale / 2;
  ctx.save();
  ctx.translate(coin.x + coin.width / 2, coin.y + coin.height / 2 + bob);
  ctx.fillStyle = scene.coinColor;
  ctx.strokeStyle = scene.coinEdge;
  ctx.lineWidth = Math.max(1, radius / 5);
  ctx.beginPath();
  ctx.arc(0, 0, radius - 1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.strokeStyle = scene.coinMark;
  ctx.lineWidth = Math.max(1, radius / 7);
  ctx.beginPath();
  ctx.arc(0, 0, radius * 0.53, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
