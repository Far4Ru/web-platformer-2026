import { drawNineSlice } from './uiImage.js';

export function drawIcon(ctx, rect, icon, colors, resumed = false, disabled = false, images) {
  const { x, y, width, height } = rect;
  ctx.save();
  if (disabled) ctx.globalAlpha = 0.45;
  ctx.drawImage(images.roundButton, x, y, width, height);
  ctx.fillStyle = '#342619';
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
  } else if (icon === 'sound') {
    ctx.beginPath();
    ctx.moveTo(cx - 13, cy - 6);
    ctx.lineTo(cx - 7, cy - 6);
    ctx.lineTo(cx + 1, cy - 12);
    ctx.lineTo(cx + 1, cy + 12);
    ctx.lineTo(cx - 7, cy + 6);
    ctx.lineTo(cx - 13, cy + 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#342619';
    ctx.lineWidth = 3;
    ctx.beginPath();
    if (resumed) {
      ctx.moveTo(cx + 7, cy - 8);
      ctx.lineTo(cx + 16, cy + 8);
      ctx.moveTo(cx + 16, cy - 8);
      ctx.lineTo(cx + 7, cy + 8);
    } else {
      ctx.arc(cx + 2, cy, 12, -0.8, 0.8);
    }
    ctx.stroke();
  } else {
    ctx.strokeStyle = '#342619';
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

export function drawTouchButton(ctx, rect, label, ui, images, action) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  drawNineSlice(ctx, images.button, rect.x, rect.y, rect.width, rect.height, 9);
  const image = images[action === 'jump' ? 'keyUp' : action === 'left' ? 'keyLeft' : 'keyRight'];
  ctx.drawImage(image, rect.x + rect.width / 2 - 28, rect.y + rect.height / 2 - 28, 56, 56);
  ctx.restore();
}
