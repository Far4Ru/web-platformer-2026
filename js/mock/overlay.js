export function drawOverlayFrame(ctx, world, panel, colors) {
  ctx.fillStyle = colors.veil;
  ctx.fillRect(0, 0, world.width, world.height);
  ctx.fillStyle = colors.panel;
  ctx.strokeStyle = colors.panelBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(panel.x, panel.y, panel.width, panel.height, 18);
  ctx.fill();
  ctx.stroke();
}

export function drawOverlayButton(ctx, button, color) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(button.x, button.y, button.width, button.height, 10);
  ctx.fill();
}
