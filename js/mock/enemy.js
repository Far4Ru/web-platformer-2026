export function drawEnemy(ctx, enemy, art) {
  const { x, y, width, height, direction } = enemy;
  ctx.fillStyle = art.outline;
  ctx.fillRect(x, y + 3, width, height - 3);
  ctx.fillStyle = enemy.frozenFor > 0 ? art.frozen : enemy.hurtTime > 0 ? art.hurt : art.body;
  ctx.fillRect(x + 3, y, width - 6, height - 4);
  ctx.fillStyle = art.highlight;
  ctx.fillRect(x + 6, y + 3, width - 12, 3);
  ctx.fillStyle = art.eye;
  ctx.fillRect(x + 7, y + 9, 5, 6);
  ctx.fillRect(x + width - 12, y + 9, 5, 6);
  ctx.fillStyle = art.pupil;
  const look = direction > 0 ? 2 : 0;
  ctx.fillRect(x + 7 + look, y + 11, 2, 3);
  ctx.fillRect(x + width - 12 + look, y + 11, 2, 3);
}

export function drawEnemyHealthBar(ctx, enemy, art) {
  const { segmentWidth, segmentGap, height, offsetY } = art;
  const totalWidth = enemy.settings.maxHealth * segmentWidth + (enemy.settings.maxHealth - 1) * segmentGap;
  const x = enemy.x + (enemy.width - totalWidth) / 2;
  const y = enemy.y - offsetY;
  for (let index = 0; index < enemy.settings.maxHealth; index++) {
    const segmentX = x + index * (segmentWidth + segmentGap);
    ctx.fillStyle = art.border;
    ctx.fillRect(segmentX - 1, y - 1, segmentWidth + 2, height + 2);
    ctx.fillStyle = index < enemy.health ? art.full : art.empty;
    ctx.fillRect(segmentX, y, segmentWidth, height);
  }
}
