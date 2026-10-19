export function drawCounterPanel(ctx, rect, colors) {
  ctx.fillStyle = colors.panel;
  ctx.strokeStyle = colors.panelBorder;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 10);
  ctx.fill();
  ctx.stroke();
}
