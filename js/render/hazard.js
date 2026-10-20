export function drawHazard(ctx, hazard, scene, images) {
  if (hazard.kind === 'rising') {
    ctx.fillStyle = scene.hazardSlotColor;
    ctx.fillRect(hazard.x, hazard.baseY - 3, hazard.width, 4);
    if (hazard.height <= 0) return;
  }

  ctx.save();
  if (hazard.kind === 'hanging') {
    ctx.translate(0, hazard.y * 2 + hazard.height);
    ctx.scale(1, -1);
  }
  const image = images[hazard.surface === 'ice' ? 1 : hazard.surface === 'swamp' ? 2 : 0];
  for (let x = hazard.x; x < hazard.x + hazard.width; x += 32) {
    ctx.drawImage(image, x - 3, hazard.y - 8,
      Math.min(38, hazard.x + hazard.width - x + 6), hazard.height + 13);
  }
  ctx.restore();
}
