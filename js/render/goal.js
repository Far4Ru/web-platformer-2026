import { drawAtlasCell } from './sprites.js';

export function drawGoal(ctx, goal, progress, ready, scene, image, time = 0) {
  const art = scene.goalPortal;
  const centerX = goal.x + goal.width / 2;
  const centerY = goal.y + goal.portalOffsetY;
  const pedestalY = goal.y + goal.height - art.pedestalHeight;
  const start = -Math.PI / 2;

  ctx.save();
  drawAtlasCell(ctx, image, 2, 2, centerX - 46, pedestalY - 16, 92, 42);
  ctx.save();
  ctx.globalAlpha = ready ? 1 : 0.6;
  const pulse = 1 + Math.sin(time * 4) * 0.035;
  drawAtlasCell(ctx, image, 1, 2, centerX - 48 * pulse,
    centerY - 50 * pulse, 96 * pulse, 100 * pulse);
  ctx.restore();

  ctx.lineWidth = art.ringWidth;
  ctx.strokeStyle = art.track;
  ctx.beginPath();
  ctx.arc(centerX, centerY, art.ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = ready ? art.readyRing : art.progressRing;
  ctx.beginPath();
  ctx.arc(centerX, centerY, art.ringRadius, start, start + Math.PI * 2 * progress);
  ctx.stroke();

  for (const marker of art.markers) {
    const angle = start + Math.PI * 2 * marker.fraction;
    const x = centerX + Math.cos(angle) * art.ringRadius;
    const y = centerY + Math.sin(angle) * art.ringRadius;
    ctx.fillStyle = progress >= marker.fraction ? art[marker.color] : art.markerEmpty;
    ctx.beginPath();
    ctx.arc(x, y, art.markerRadius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = art.text;
  ctx.font = `12px ${art.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(`${Math.round(progress * 100)}%`, centerX, centerY);
  ctx.restore();
}
