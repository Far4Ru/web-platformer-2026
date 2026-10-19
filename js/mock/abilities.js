export function drawCompanion(ctx, skill, player, art) {
  const companion = skill.companion;
  if (!companion) return;
  ctx.save();
  ctx.globalAlpha = 0.8;
  for (const part of player.settings.sprite) {
    ctx.fillStyle = part.color === 'coat' ? art.companion : player.settings.colors[part.color];
    ctx.fillRect(companion.x + part.x, companion.y + part.y, part.width, part.height);
  }
  ctx.fillStyle = art.companionHealthEmpty;
  ctx.fillRect(companion.x, companion.y - 12, companion.width, 4);
  ctx.fillStyle = art.companionHealthFull;
  ctx.fillRect(companion.x, companion.y - 12, companion.width * skill.health / 2, 4);
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
  } else if (shot.kind === 'ice' && shot.height > shot.width * 1.5) {
    ctx.beginPath();
    ctx.moveTo(shot.x + shot.width / 2, shot.y);
    ctx.lineTo(shot.x + shot.width, shot.y + shot.height / 2);
    ctx.lineTo(shot.x + shot.width / 2, shot.y + shot.height);
    ctx.lineTo(shot.x, shot.y + shot.height / 2);
    ctx.fill();
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
