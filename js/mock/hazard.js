export function drawHazard(ctx, hazard, scene) {
  ctx.fillStyle = scene.hazardColor;
  for (let x = hazard.x; x < hazard.x + hazard.width; x += scene.hazardToothWidth) {
    ctx.beginPath();
    ctx.moveTo(x, hazard.y + hazard.height);
    ctx.lineTo(x + scene.hazardToothWidth / 2, hazard.y);
    ctx.lineTo(x + scene.hazardToothWidth, hazard.y + hazard.height);
    ctx.fill();
  }
}
