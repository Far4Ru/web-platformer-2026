import { drawAtlasCell } from './sprites.js';

const clamp = (value) => Math.max(0, Math.min(1, value));

export function drawGoal(ctx, goal, progress, ready, scene, image, time = 0,
  phase = 'charging', phaseTime = 0, notice = '') {
  const art = scene.goalPortal;
  const centerX = goal.x + goal.width / 2;
  const centerY = goal.y + goal.portalOffsetY;
  const pedestalY = goal.y + goal.height - art.pedestalHeight;
  const charge = clamp(progress);
  const entering = phase === 'entering' ? clamp(phaseTime / 0.75) : 0;
  const portalImage = image[2][1];
  const portalHeight = art.portalHeight ?? 110;
  const portalWidth = portalHeight * portalImage.width / portalImage.height;

  ctx.save();
  drawAtlasCell(ctx, image, 2, 2, centerX - 46, pedestalY - 16, 92, 42);
  drawAtlasCell(ctx, image, 1, 2, centerX - portalWidth / 2,
    centerY - portalHeight / 2, portalWidth, portalHeight);

  // The gauge occupies the stone band, leaving the arch visible on both sides.
  ctx.lineWidth = art.ringWidth + 4;
  ctx.strokeStyle = art.track;
  ctx.beginPath();
  ctx.arc(centerX, centerY, art.ringRadius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = art.ringWidth;
  ctx.strokeStyle = ready ? art.readyRing : art.progressRing;
  ctx.beginPath();
  ctx.arc(centerX, centerY, art.ringRadius, -Math.PI / 2,
    -Math.PI / 2 + Math.PI * 2 * charge);
  ctx.stroke();
  for (const marker of art.markers) {
    const angle = -Math.PI / 2 + Math.PI * 2 * marker.fraction;
    ctx.fillStyle = charge >= marker.fraction ? art[marker.color] : art.markerEmpty;
    ctx.beginPath();
    ctx.arc(centerX + Math.cos(angle) * art.ringRadius,
      centerY + Math.sin(angle) * art.ringRadius, art.markerRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  if (ready) {
    ctx.strokeStyle = `rgba(191, 255, 227, ${0.35 + Math.sin(time * 5) * 0.1})`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, art.ringRadius - 7, 0, Math.PI * 2);
    ctx.stroke();
  }
  if (entering > 0) {
    ctx.strokeStyle = `rgba(231, 255, 239, ${entering * 0.85})`;
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(centerX, centerY, art.ringRadius - 12, 0, Math.PI * 2);
    ctx.stroke();
  }

  if (notice) {
    ctx.fillStyle = '#ffe1b4';
    ctx.shadowColor = '#102b2a';
    ctx.shadowBlur = 6;
    ctx.font = `bold 13px ${art.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    notice.split('\n').forEach((line, index) => {
      ctx.fillText(line, centerX, centerY - 94 + index * 18);
    });
  }
  ctx.restore();
}
