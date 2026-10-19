export function drawHintPanel(ctx, width, hintY, color) {
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.8;
  ctx.fillRect(0, hintY - 22, width, 34);
  ctx.globalAlpha = 1;
}
