import { drawSheetFrame } from './sprites.js';

export function drawEnemy(ctx, enemy, art, time = 0, images) {
  const { x, y, width, height, direction } = enemy;
  const frame = enemy.hurtTime > 0 ? 3 : enemy.dashFor > 0 ? 2
    : enemy.frozenFor > 0 ? 0 : Math.floor(time * 7 + x * 0.02) % 2;
  ctx.save();
  if (direction < 0) {
    ctx.translate(x + width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(x + width / 2), 0);
  }
  if (enemy.boss) drawSheetFrame(ctx, images.boss, frame, 4,
    x - 16, y - 27, width + 32, height + 30, 0, 660);
  else drawSheetFrame(ctx, images.guardian, frame, 4,
    x - 7, y - 11, width + 14, height + 14, 70, 620);
  ctx.restore();
  if (enemy.frozenFor > 0) {
    ctx.fillStyle = 'rgba(169, 221, 255, 0.35)';
    ctx.fillRect(x, y, width, height);
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
