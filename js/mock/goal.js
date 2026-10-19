export function drawGoal(ctx, goal, progress, ready, scene) {
  const art = scene.goalPortal;
  const centerX = goal.x + goal.width / 2;
  const centerY = goal.y + goal.portalOffsetY;
  const pedestalY = goal.y + goal.height - art.pedestalHeight;
  const start = -Math.PI / 2;

  ctx.save();
  ctx.fillStyle = art.stem;
  ctx.fillRect(centerX - art.stemWidth / 2, centerY + goal.portalRadius,
    art.stemWidth, pedestalY - centerY - goal.portalRadius);
  ctx.fillStyle = art.pedestalBase;
  ctx.fillRect(centerX - art.pedestalWidth / 2, pedestalY,
    art.pedestalWidth, art.pedestalHeight);
  ctx.fillStyle = art.pedestalTop;
  ctx.fillRect(centerX - art.pedestalWidth / 2, pedestalY,
    art.pedestalWidth, art.pedestalTopHeight);

  ctx.fillStyle = ready ? art.open : art.closed;
  ctx.beginPath();
  ctx.arc(centerX, centerY, goal.portalRadius, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = art.core;
  ctx.beginPath();
  ctx.arc(centerX, centerY, art.coreRadius, 0, Math.PI * 2);
  ctx.fill();

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
