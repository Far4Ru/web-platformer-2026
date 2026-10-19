import { drawAtlasCell, drawSheetFrame } from './sprites.js';

export function drawSkillIcon(ctx, kind, rect, colors, ready, images) {
  const { x, y, width, height } = rect;
  ctx.save();
  ctx.fillStyle = colors.border;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = colors.panel;
  ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  if (kind === 'companion') drawSheetFrame(ctx, images.golem, 0, 4,
    x + 8, y + 4, width - 16, height - 10, 70, 620);
  else {
    const cell = { healing: [2, 1], sword: [0, 0], fireball: [1, 0],
      ice: [2, 0], bow: [0, 1] }[kind];
    drawAtlasCell(ctx, images.effects, ...cell, x + 4, y + 4, width - 8, height - 8);
  }
  if (!ready) {
    ctx.fillStyle = colors.cooldown;
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  }
  ctx.restore();
}
