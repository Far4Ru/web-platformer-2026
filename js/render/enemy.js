import { drawSheetFrame } from './sprites.js';

const LOOKS = [
  { sprite: 'guardian', filter: 'none', accent: '#a4ca66', pace: 6 },
  { sprite: 'golem', filter: 'brightness(0.78) saturate(1.15)', accent: '#d5aa61', pace: 4.5 },
  { sprite: 'guardian', filter: 'hue-rotate(48deg) saturate(1.25)', accent: '#67c7a0', pace: 7.5 },
  { sprite: 'golem', filter: 'hue-rotate(285deg) saturate(1.3)', accent: '#d58e91', pace: 5.5 },
];

const SKILL_LOOKS = {
  dash: { sprite: 'guardian', filter: 'hue-rotate(295deg) saturate(1.55)', accent: '#ffae64', pace: 11 },
  jump: { sprite: 'golem', filter: 'hue-rotate(45deg) saturate(1.4)', accent: '#a5e99a', pace: 8 },
  shoot: { sprite: 'golem', filter: 'hue-rotate(165deg) saturate(1.5)', accent: '#a6a1ff', pace: 5 },
  spikes: { sprite: 'guardian', filter: 'grayscale(0.65) contrast(1.25)', accent: '#e0bd82', pace: 4 },
};

export function enemyLook(enemy) {
  const skill = ['shoot', 'spikes', 'dash', 'jump'].find((kind) => enemy.skills?.includes(kind));
  return { ...(skill ? SKILL_LOOKS[skill] : LOOKS[(enemy.visualVariant ?? 0) % LOOKS.length]),
    skill };
}

function drawAura(ctx, enemy, look, time) {
  const centerX = enemy.x + enemy.width / 2;
  const centerY = enemy.y + enemy.height / 2;
  if (enemy.dashFor > 0) {
    ctx.fillStyle = look.accent;
    ctx.globalAlpha = 0.45;
    for (let index = 1; index <= 3; index++) {
      const trailX = enemy.x - enemy.direction * (index * 10 + 4);
      ctx.fillRect(trailX, enemy.y + 7 + index * 6, 10 - index * 2, 2);
    }
    ctx.globalAlpha = 1;
  }
  if (look.skill === 'shoot' || enemy.castKind === 'shoot' && enemy.castFor > 0) {
    ctx.strokeStyle = look.accent;
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.55 + Math.sin(time * 5 + (enemy.animationPhase ?? 0)) * 0.18;
    ctx.beginPath();
    ctx.arc(centerX, centerY, enemy.width * 0.72, -0.8, 1.1);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (look.skill === 'spikes') {
    ctx.fillStyle = '#665f54';
    for (const offset of [-13, 0, 13]) {
      ctx.beginPath();
      ctx.moveTo(centerX + offset - 5, enemy.y - 9);
      ctx.lineTo(centerX + offset, enemy.y - 23);
      ctx.lineTo(centerX + offset + 5, enemy.y - 9);
      ctx.closePath();
      ctx.fill();
    }
  }
}

export function drawEnemy(ctx, enemy, art, time = 0, images) {
  const { x, y, width, height, direction } = enemy;
  const frame = enemy.hurtTime > 0 ? 3 : enemy.dashFor > 0 ? 2
    : enemy.castFor > 0 || !enemy.boss && enemy.jumpVelocity !== 0 ? 3
      : enemy.frozenFor > 0 ? 0
        : Math.floor(time * (enemy.boss ? 7 : enemyLook(enemy).pace)
          + (enemy.animationPhase ?? 0)) % 2 + (enemy.boss ? 0 : 1);
  ctx.save();
  if (enemy.boss) {
    if (direction < 0) {
      ctx.translate(x + width / 2, 0);
      ctx.scale(-1, 1);
      ctx.translate(-(x + width / 2), 0);
    }
    drawSheetFrame(ctx, images.boss, frame, 4,
      x - 16, y - 27, width + 32, height + 30);
  } else {
    const look = enemyLook(enemy);
    drawAura(ctx, enemy, look, time);
    const bounce = enemy.frozenFor > 0 ? 0 : enemy.jumpVelocity !== 0 ? -3
      : Math.sin(time * look.pace + (enemy.animationPhase ?? 0)) * 1.2;
    const visualWidth = width + (look.skill === 'spikes' ? 25 : 22);
    const visualHeight = height + (look.skill === 'jump' ? 25 : 20);
    const centerX = x + width / 2;
    const footY = y + height;
    ctx.translate(centerX, footY + bounce);
    if (direction < 0) ctx.scale(-1, 1);
    if (enemy.dashFor > 0) ctx.transform(1, 0, -0.13, 1, 0, 0);
    if (enemy.hurtTime > 0) ctx.rotate(Math.sin(time * 38) * 0.08);
    ctx.filter = look.filter;
    drawSheetFrame(ctx, images[look.sprite], frame, 4,
      -visualWidth / 2, -visualHeight, visualWidth, visualHeight);
    ctx.filter = 'none';
    if (enemy.castFor > 0 && enemy.castKind === 'shoot') {
      ctx.fillStyle = look.accent;
      ctx.globalAlpha = 0.7 * Math.min(1, enemy.castFor * 4);
      ctx.beginPath();
      ctx.arc(visualWidth * 0.42, -visualHeight * 0.5, 5 + Math.sin(time * 25) * 2,
        0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }
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
  const y = enemy.y - offsetY - (enemy.boss ? 0 : 17);
  ctx.save();
  ctx.strokeStyle = art.border;
  ctx.lineWidth = 0.6;
  for (let index = 0; index < enemy.maxHealth; index++) {
    const segmentX = x + index * (segmentWidth + segmentGap);
    ctx.fillStyle = index < enemy.health ? art.full : art.empty;
    ctx.fillRect(segmentX, y, segmentWidth, height);
    ctx.strokeRect(segmentX + 0.3, y + 0.3, segmentWidth - 0.6, height - 0.6);
  }
  ctx.restore();
}
