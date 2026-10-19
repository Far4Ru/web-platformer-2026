export function drawIcon(ctx, rect, icon, colors, resumed = false, disabled = false) {
  const { x, y, width, height } = rect;
  ctx.save();
  if (disabled) ctx.globalAlpha = 0.45;
  ctx.fillStyle = colors.panel;
  ctx.strokeStyle = colors.panelBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x, y, width, height, 10);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = colors.text;
  const cx = x + width / 2;
  const cy = y + height / 2;
  if (icon === 'pause' && !resumed) {
    ctx.fillRect(cx - 10, cy - 12, 6, 24);
    ctx.fillRect(cx + 4, cy - 12, 6, 24);
  } else if (icon === 'pause') {
    ctx.beginPath();
    ctx.moveTo(cx - 7, cy - 13);
    ctx.lineTo(cx + 12, cy);
    ctx.lineTo(cx - 7, cy + 13);
    ctx.fill();
  } else {
    ctx.strokeStyle = colors.text;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(cx, cy, 13, -0.7, 4.4);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + 10, cy - 14);
    ctx.lineTo(cx + 17, cy - 14);
    ctx.lineTo(cx + 15, cy - 7);
    ctx.fill();
  }
  ctx.restore();
}

export function drawTouchButton(ctx, rect, label, ui) {
  ctx.save();
  ctx.fillStyle = ui.colors.touch;
  ctx.strokeStyle = ui.colors.panelBorder;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 14);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = ui.colors.text;
  ctx.font = `43px ${ui.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, rect.x + rect.width / 2, rect.y + rect.height / 2);
  ctx.restore();
}
