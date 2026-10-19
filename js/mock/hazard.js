export function drawHazard(ctx, hazard, scene) {
  if (hazard.kind === 'rising') {
    ctx.fillStyle = scene.hazardSlotColor;
    ctx.fillRect(hazard.x, hazard.baseY - 3, hazard.width, 4);
    if (hazard.height <= 0) return;
  }

  ctx.fillStyle = hazard.kind === 'rising' ? scene.risingHazardColor
    : hazard.kind === 'hanging' ? scene.hangingHazardColor : scene.hazardColor;
  const baseY = hazard.kind === 'hanging' ? hazard.y : hazard.y + hazard.height;
  const tipY = hazard.kind === 'hanging' ? hazard.y + hazard.height : hazard.y;
  for (let x = hazard.x; x < hazard.x + hazard.width; x += scene.hazardToothWidth) {
    const toothWidth = Math.min(scene.hazardToothWidth, hazard.x + hazard.width - x);
    ctx.beginPath();
    ctx.moveTo(x, baseY);
    ctx.lineTo(x + toothWidth / 2, tipY);
    ctx.lineTo(x + toothWidth, baseY);
    ctx.fill();
  }
}
