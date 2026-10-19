export function drawSkillIcon(ctx, kind, rect, colors, ready) {
  const { x, y, width, height } = rect;
  ctx.save();
  ctx.fillStyle = colors.border;
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = colors.panel;
  ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  ctx.fillStyle = colors[kind];
  if (kind === 'healing') {
    ctx.fillRect(x + 20, y + 9, 8, 30);
    ctx.fillRect(x + 9, y + 20, 30, 8);
  } else if (kind === 'sword') {
    ctx.fillRect(x + 23, y + 7, 4, 25);
    ctx.fillRect(x + 15, y + 29, 20, 4);
    ctx.fillRect(x + 23, y + 33, 4, 8);
  } else {
    ctx.font = 'bold 28px Alice, serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText({ companion: '●', fireball: 'F', ice: 'I', bow: '➶' }[kind],
      x + width / 2, y + height / 2);
  }
  if (!ready) {
    ctx.fillStyle = colors.cooldown;
    ctx.fillRect(x + 2, y + 2, width - 4, height - 4);
  }
  ctx.restore();
}
