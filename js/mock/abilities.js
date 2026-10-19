export function drawAbilityPickup(ctx, pickup, art, kind, time) {
  if (pickup.collected) return;
  const x = pickup.x + pickup.width / 2;
  const y = pickup.y + pickup.height / 2 + Math.sin(time * 3) * 3;
  ctx.save();
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = art.halo;
  ctx.beginPath();
  ctx.arc(x, y, 19, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.fillStyle = art[kind];
  ctx.beginPath();
  ctx.arc(x, y, 14, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = art.mark;
  if (kind === 'companion') {
    ctx.fillRect(x - 7, y - 4, 5, 5);
    ctx.fillRect(x + 2, y - 4, 5, 5);
    ctx.fillRect(x - 3, y + 4, 6, 3);
  } else if (kind === 'bow') {
    ctx.beginPath();
    ctx.arc(x - 3, y, 8, -Math.PI / 2, Math.PI / 2);
    ctx.strokeStyle = art.mark;
    ctx.lineWidth = 3;
    ctx.stroke();
    ctx.fillRect(x - 5, y - 1, 14, 2);
  } else {
    ctx.beginPath();
    ctx.moveTo(x, y - 9);
    ctx.lineTo(x + 8, y + 2);
    ctx.lineTo(x, y + 9);
    ctx.lineTo(x - 8, y + 2);
    ctx.fill();
  }
  ctx.restore();
}

export function drawCompanion(ctx, companion, player, art) {
  if (!companion) return;
  ctx.save();
  ctx.globalAlpha = 0.8;
  for (const part of player.settings.sprite) {
    ctx.fillStyle = part.color === 'coat' ? art.companion : player.settings.colors[part.color];
    ctx.fillRect(companion.x + part.x, companion.y + part.y, part.width, part.height);
  }
  ctx.restore();
}

export function drawAbilityShot(ctx, shot, art) {
  ctx.fillStyle = art[shot.kind];
  if (shot.kind === 'arrow') {
    ctx.save();
    ctx.translate(shot.x + shot.width / 2, shot.y + shot.height / 2);
    ctx.rotate(Math.atan2(shot.vy, shot.vx));
    ctx.fillRect(-7, -2, 12, 4);
    ctx.beginPath();
    ctx.moveTo(8, 0);
    ctx.lineTo(3, -4);
    ctx.lineTo(3, 4);
    ctx.fill();
    ctx.restore();
  } else {
    ctx.beginPath();
    ctx.arc(shot.x + shot.width / 2, shot.y + shot.height / 2,
      shot.width / 2, 0, Math.PI * 2);
    ctx.fill();
  }
}

export function drawEnemyAbility(ctx, enemy, art) {
  const width = enemy.skills.length * 10 - 2;
  enemy.skills.forEach((skill, index) => {
    ctx.fillStyle = art[skill];
    ctx.fillRect(enemy.x + enemy.width / 2 - width / 2 + index * 10,
      enemy.y - (enemy.boss ? 24 : 19), 8, 5);
  });
}

export function drawEnemyShot(ctx, shot, art) {
  ctx.fillStyle = shot.kind === 'boss' ? art.bossShot : art.shoot;
  ctx.beginPath();
  ctx.arc(shot.x + shot.width / 2, shot.y + shot.height / 2,
    shot.width / 2, 0, Math.PI * 2);
  ctx.fill();
}

export function drawEnemySpikes(ctx, spikes, art) {
  ctx.fillStyle = art.spikeSlot;
  ctx.fillRect(spikes.x, spikes.baseY - 3, spikes.width, 4);
  if (spikes.height <= 0) return;
  ctx.fillStyle = spikes.boss ? art.bossSpikes : art.spikes;
  for (let x = spikes.x; x < spikes.x + spikes.width; x += 7) {
    const width = Math.min(7, spikes.x + spikes.width - x);
    ctx.beginPath();
    ctx.moveTo(x, spikes.y + spikes.height);
    ctx.lineTo(x + width / 2, spikes.y);
    ctx.lineTo(x + width, spikes.y + spikes.height);
    ctx.fill();
  }
}
