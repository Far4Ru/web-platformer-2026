import { drawAtlasCell, drawSheetFrame } from './sprites.js';

export function drawSkillIcon(ctx, kind, rect, colors, ready, images, level = 1) {
  const { x, y, width, height } = rect;
  ctx.save();
  const metals = ['#94774a', '#bfc8b4', '#e5bc65'];
  const tier = Math.min(3, Math.max(1, level)) - 1;
  if (images.skillSlots) ctx.drawImage(images.skillSlots[tier], x, y, width, height);
  else {
    ctx.fillStyle = metals[tier];
    ctx.fillRect(x, y, width, height);
    ctx.fillStyle = '#233a34';
    ctx.fillRect(x + 4, y + 4, width - 8, height - 8);
  }
  if (kind === 'companion') drawSheetFrame(ctx, images.golem, 0, 4,
    x + 8, y + 4, width - 16, height - 10, 70, 620);
  else {
    const cell = { healing: [2, 1], sword: [0, 0], fireball: [1, 0],
      ice: [2, 0], bow: [0, 1] }[kind];
    drawAtlasCell(ctx, images.effects, ...cell, x + 4, y + 4, width - 8, height - 8);
  }
  ctx.fillStyle = metals[tier];
  ctx.fillRect(x + width - 20, y + height - 17, 17, 14);
  ctx.fillStyle = '#1e2b28';
  ctx.font = 'bold 12px Georgia';
  ctx.textAlign = 'center';
  ctx.fillText(['I', 'II', 'III'][Math.min(3, Math.max(1, level)) - 1],
    x + width - 11.5, y + height - 5);
  if (!ready) {
    ctx.fillStyle = colors.cooldown;
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  }
  ctx.restore();
}
