import { drawSheetFrame, drawAtlasCell } from './sprites.js';

export function drawCompanion(ctx, skill, player, art, time = 0, image) {
  const companion = skill.companion;
  if (!companion) return;
  ctx.save();
  const frame = !companion.grounded ? 3 : companion.moving
    ? 1 + Math.floor(time * 7) % 2 : 0;
  if (companion.facing < 0) {
    ctx.translate(companion.x + companion.width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(companion.x + companion.width / 2), 0);
  }
  drawSheetFrame(ctx, image, frame, 4, companion.x - 9, companion.y - 13,
    50, 54, 70, 620);
  if (companion.facing < 0) {
    ctx.translate(companion.x + companion.width / 2, 0);
    ctx.scale(-1, 1);
    ctx.translate(-(companion.x + companion.width / 2), 0);
  }
  ctx.fillStyle = art.companionHealthEmpty;
  ctx.fillRect(companion.x, companion.y - 12, companion.width, 4);
  ctx.fillStyle = art.companionHealthFull;
  ctx.fillRect(companion.x, companion.y - 12, companion.width * skill.health / 2, 4);
  ctx.restore();
}

export function drawAbilityShot(ctx, shot, art, image) {
  const cell = shot.kind === 'arrow' ? [0, 1] : shot.kind === 'ice' ? [2, 0] : [1, 0];
  ctx.save();
  ctx.translate(shot.x + shot.width / 2, shot.y + shot.height / 2);
  if (shot.kind === 'arrow') ctx.rotate(Math.atan2(shot.vy, shot.vx));
  else if (shot.vx < 0) ctx.scale(-1, 1);
  drawShotSprite(ctx, image[cell[1]][cell[0]], shot, 2.2);
  ctx.restore();
}

export function drawEnemyAbility(ctx, enemy, art) {
  const width = enemy.skills.length * 10 - 2;
  enemy.skills.forEach((skill, index) => {
    ctx.fillStyle = art[skill];
    ctx.fillRect(enemy.x + enemy.width / 2 - width / 2 + index * 10,
      enemy.y - (enemy.boss ? 24 : 19), 8, 5);
  });
}

export function drawEnemyShot(ctx, shot, art, image) {
  ctx.save();
  ctx.translate(shot.x + shot.width / 2, shot.y + shot.height / 2);
  if (shot.vx < 0) ctx.scale(-1, 1);
  drawShotSprite(ctx, image[1][1], shot, 2.2);
  ctx.restore();
}

function drawShotSprite(ctx, image, shot, scale) {
  const ratio = image.width / image.height;
  const maxWidth = shot.width * scale;
  const maxHeight = shot.height * scale;
  const width = Math.min(maxWidth, maxHeight * ratio);
  const height = width / ratio;
  ctx.drawImage(image, -width / 2, -height / 2, width, height);
}

export function drawEnemySpikes(ctx, spikes, art, image) {
  ctx.fillStyle = art.spikeSlot;
  ctx.fillRect(spikes.x, spikes.baseY - 3, spikes.width, 4);
  if (spikes.height <= 0) return;
  const sprite = image[spikes.surface === 'ice' ? 1 : spikes.surface === 'swamp' ? 2 : 0];
  ctx.drawImage(sprite, spikes.x - 4, spikes.y - 8,
    spikes.width + 8, spikes.height + 12);
}
