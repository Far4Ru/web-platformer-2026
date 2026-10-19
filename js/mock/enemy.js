export function drawEnemy(ctx, enemy, art) {
  const { x, y, width, height, direction } = enemy;
  ctx.fillStyle = art.outline;
  ctx.fillRect(x, y + 3, width, height - 3);
  ctx.fillStyle = enemy.frozenFor > 0 ? art.frozen : enemy.hurtTime > 0 ? art.hurt
    : enemy.boss ? art.boss : art.body;
  ctx.fillRect(x + 3, y, width - 6, height - 4);
  ctx.fillStyle = enemy.boss ? art.bossHighlight : art.highlight;
  ctx.fillRect(x + 6, y + 3, width - 12, 3);
  ctx.fillStyle = art.eye;
  ctx.fillRect(x + 7, y + 9, 5, 6);
  ctx.fillRect(x + width - 12, y + 9, 5, 6);
  ctx.fillStyle = art.pupil;
  const look = direction > 0 ? 2 : 0;
  ctx.fillRect(x + 7 + look, y + 11, 2, 3);
  ctx.fillRect(x + width - 12 + look, y + 11, 2, 3);
  if (enemy.boss) {
    ctx.fillStyle = art.outline;
    ctx.fillRect(x + 10, y - 12, 10, 15);
    ctx.fillRect(x + width - 20, y - 12, 10, 15);
    ctx.fillStyle = art.bossHighlight;
    ctx.fillRect(x + width / 2 - 10, y + 23, 20, 5);
  }
  if (enemy.dashFor > 0) {
    ctx.strokeStyle = art.bossHighlight;
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 3, y - 3, width + 6, height + 6);
  }
  if (enemy.shieldFor > 0) {
    ctx.strokeStyle = art.shield;
    ctx.lineWidth = 3;
    ctx.strokeRect(x - 5, y - 5, width + 10, height + 10);
  }
}

export function drawEnemyHealthBar(ctx, enemy, art) {
  const { segmentWidth, segmentGap, height, offsetY } = art;
  const totalWidth = enemy.maxHealth * segmentWidth + (enemy.maxHealth - 1) * segmentGap;
  const x = enemy.x + (enemy.width - totalWidth) / 2;
  const y = enemy.y - offsetY;
  for (let index = 0; index < enemy.maxHealth; index++) {
    const segmentX = x + index * (segmentWidth + segmentGap);
    ctx.fillStyle = art.border;
    ctx.fillRect(segmentX - 1, y - 1, segmentWidth + 2, height + 2);
    ctx.fillStyle = index < enemy.health ? art.full : art.empty;
    ctx.fillRect(segmentX, y, segmentWidth, height);
  }
}
