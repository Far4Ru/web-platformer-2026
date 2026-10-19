export function drawBoostSymbol(ctx, kind, x, y, color, size) {
  ctx.save();
  ctx.fillStyle = color;
  if (kind === 'heal') {
    ctx.fillRect(x - size * 0.12, y - size * 0.36, size * 0.24, size * 0.72);
    ctx.fillRect(x - size * 0.36, y - size * 0.12, size * 0.72, size * 0.24);
  } else if (kind === 'speed') {
    for (const offset of [-size * 0.16, size * 0.16]) {
      ctx.beginPath();
      ctx.moveTo(x + offset - size * 0.16, y - size * 0.28);
      ctx.lineTo(x + offset + size * 0.12, y);
      ctx.lineTo(x + offset - size * 0.16, y + size * 0.28);
      ctx.lineWidth = size * 0.12;
      ctx.strokeStyle = color;
      ctx.stroke();
    }
  } else {
    ctx.font = `bold ${size * 0.72}px Alice, serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('×2', x, y);
  }
  ctx.restore();
}

export function drawBoostPickup(ctx, pickup, kind, art, time) {
  if (pickup.collected) return;
  const x = pickup.x + pickup.width / 2;
  const y = pickup.y + pickup.height / 2 + Math.sin(time * 3) * 3;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = art.halo;
  ctx.beginPath();
  ctx.arc(x, y, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = art[kind];
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  drawBoostSymbol(ctx, kind, x, y, art.mark, 24);
  ctx.restore();
}
