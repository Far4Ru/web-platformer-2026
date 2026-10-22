import { drawOverlayButton, drawOverlayFrame, drawTempleFrame } from '../render/overlay.js';
import { drawSheetFrame } from '../render/sprites.js';

// The sheet keeps the torso locked between frames. This extra trajectory makes
// the feet leave the ground instead of merely changing pose in place.
const VICTORY_JUMP_Y = [0, 0, 0, 0, -5, -14, -27, -41,
  -53, -60, -61, -55, -43, -27, -10];
// A short jump is followed by a readable pause on the ground. The complete
// loop lasts 1.86 seconds, while takeoff through landing takes about a second.
const VICTORY_FRAME_DURATIONS = [
  0.65, 0.15, 0.09, 0.08, 0.07, 0.07, 0.07, 0.08,
  0.1, 0.1, 0.08, 0.07, 0.07, 0.08, 0.1,
];
const VICTORY_CYCLE_DURATION = VICTORY_FRAME_DURATIONS
  .reduce((total, duration) => total + duration, 0);

function victoryFrameAt(time) {
  let cycleTime = time % VICTORY_CYCLE_DURATION;
  for (let index = 0; index < VICTORY_FRAME_DURATIONS.length; index++) {
    const duration = VICTORY_FRAME_DURATIONS[index];
    if (cycleTime < duration) return { index, progress: cycleTime / duration };
    cycleTime -= duration;
  }
  return { index: 0, progress: 0 };
}

export class Overlay {
  constructor(ui, texts, world, images) {
    this.ui = ui;
    this.texts = texts;
    this.world = world;
    this.images = images;
  }

  hitPrimary(point) {
    const rect = this.ui.overlay.button;
    return point.x >= rect.x && point.x <= rect.x + rect.width &&
      point.y - (this.verticalOffset ?? 0) >= rect.y
      && point.y - (this.verticalOffset ?? 0) <= rect.y + rect.height;
  }

  render(ctx, state, viewport, time = 0, game = null) {
    this.verticalOffset = viewport.right - viewport.left < this.world.width
      ? (viewport.bottom - viewport.top - this.world.height) / 2 : 0;
    const copy = state === 'stage' ? {
      kicker: `ЭТАП ${game.stageIndex + 1} ИЗ ${game.stageCount} ПРОЙДЕН`,
      title: game.level.name,
      description: 'Способности сохраняются. Впереди новый маршрут и новые испытания.',
      button: 'Следующий этап',
    } : this.texts.overlays[state];
    if (!copy) return;
    const { panel, button } = this.ui.overlay;
    const { colors, font } = this.ui;
    ctx.save();
    ctx.translate(0, this.verticalOffset);
    const frameViewport = { ...viewport,
      top: viewport.top - this.verticalOffset,
      bottom: viewport.bottom - this.verticalOffset };
    drawOverlayFrame(ctx, this.world, panel, colors, this.images, frameViewport,
      state === 'won' || state === 'lost');
    if (state === 'won' || state === 'lost') {
      const isWin = state === 'won';
      if (isWin) {
        const victoryTime = game?.resultTime ?? 0;
        // One coherent sixteen-frame sheet avoids differences in scale, face,
        // camera angle and torso placement between adjacent poses.
        const frame = victoryFrameAt(victoryTime);
        const frameIndex = frame.index % this.images.victoryHero.length;
        const nextIndex = (frameIndex + 1) % this.images.victoryHero.length;
        const jumpY = VICTORY_JUMP_Y[frameIndex]
          + (VICTORY_JUMP_Y[nextIndex] - VICTORY_JUMP_Y[frameIndex]) * frame.progress;
        const entrance = Math.min(1, victoryTime / 0.75);
        const easedEntrance = 1 - (1 - entrance) ** 3;
        const drawHero = (hero, alpha) => {
          ctx.save();
          ctx.globalAlpha = alpha * easedEntrance;
          ctx.translate(358, 260 + jumpY + (1 - easedEntrance) * 56);
          const scale = 0.84 + easedEntrance * 0.16;
          ctx.scale(scale, scale);
          ctx.drawImage(hero, 0, 0, hero.width, hero.height,
            -115, -120.5, 230, 241);
          ctx.restore();
        };
        ctx.save();
        ctx.filter = 'brightness(1.12) saturate(1.2)';
        ctx.shadowColor = '#ffc949';
        ctx.shadowBlur = 22;
        drawHero(this.images.victoryHero[frameIndex], 1);
        ctx.restore();
      } else {
        const sceneIndex = { fall: 0, spikes: 1, enemy: 2, wall: 3 }[game?.lossReason] ?? 2;
        const scene = this.images.defeatScenes[sceneIndex];
        const drift = Math.sin(time * 0.8) * 9;
        ctx.save();
        ctx.beginPath();
        ctx.rect(210, 125, 540, 255);
        ctx.clip();
        ctx.drawImage(scene, 18 + drift, 5, scene.width - 36, scene.height - 10,
          210, 125, 540, 255);
        ctx.restore();
        drawTempleFrame(ctx, this.images.templePlaqueOpen, {
          x: panel.x - 130, y: 25, width: panel.width + 260, height: 445,
        });
      }
      const titleImage = this.images[isWin ? 'victoryTitle' : 'defeatTitle'];
      const titleWidth = isWin ? 280 : 335;
      const titleHeight = isWin ? 56 : 86;
      const titleX = isWin ? 600 : 480;
      const titleY = isWin ? 209 : 190;
      const titleEntrance = isWin ? Math.min(1, (game?.resultTime ?? 0) / 0.6) : 1;
      const pulse = isWin ? (0.78 + titleEntrance * 0.22)
        * (1 + Math.sin(time * 5) * 0.045) : 1;
      ctx.save();
      ctx.translate(titleX, titleY);
      ctx.scale(pulse, pulse);
      ctx.globalAlpha = titleEntrance;
      ctx.shadowColor = isWin ? '#ffd44c' : '#a25c32';
      ctx.shadowBlur = isWin ? 18 : 8;
      ctx.drawImage(titleImage, -titleWidth / 2, -titleHeight / 2,
        titleWidth, titleHeight);
      ctx.restore();
      ctx.textBaseline = 'middle';
      const count = isWin ? Math.min(game?.collectCoins.count ?? 0,
        Math.floor((game?.resultTime ?? 0) * 38)) : game?.collectCoins.count ?? 0;
      ctx.font = `bold 46px ${font}`;
      const coinSize = 43;
      const countWidth = ctx.measureText(String(count)).width;
      const centerX = isWin ? 600 : 480;
      const centerY = isWin ? 287 : 304;
      const groupX = centerX - (coinSize + 9 + countWidth) / 2;
      if (isWin) drawVictoryParticles(ctx, this.images, game?.resultTime ?? 0,
        groupX + coinSize + 9 + countWidth / 2, centerY);
      drawSheetFrame(ctx, this.images.coinAnimation, Math.floor(time * 9) % 4, 4,
        groupX, centerY - coinSize / 2, coinSize, coinSize);
      ctx.textAlign = 'left';
      ctx.fillStyle = '#fff2a5';
      ctx.strokeStyle = '#4a2a0d';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#e6a525';
      ctx.shadowBlur = isWin ? 15 : 0;
      ctx.strokeText(String(count), groupX + coinSize + 9, centerY);
      ctx.fillText(String(count), groupX + coinSize + 9, centerY);
      ctx.shadowBlur = 0;
      if (isWin && game?.newRecord) {
        ctx.drawImage(this.images.recordBadge,
          508, 323, 184, 39);
      }
      drawOverlayButton(ctx, button, colors.button, this.images);
      ctx.fillStyle = '#ffe9ad';
      ctx.font = `23px ${font}`;
      ctx.textAlign = 'center';
      ctx.fillText(copy.button, button.x + button.width / 2, button.y + button.height / 2 + 1);
      ctx.restore();
      return;
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffe2a0';
    ctx.shadowColor = '#120f0b';
    ctx.shadowBlur = 5;
    ctx.font = `17px ${font}`;
    ctx.fillText(copy.kicker, this.world.width / 2, panel.y + 66);
    ctx.fillStyle = '#fff0c7';
    ctx.font = `36px ${font}`;
    ctx.fillText(copy.title, this.world.width / 2, panel.y + 102);
    ctx.fillStyle = '#f4e2bd';
    ctx.font = `20px ${font}`;
    this.drawWrapped(ctx, copy.description, this.world.width / 2, panel.y + 142, panel.width - 72);
    ctx.shadowBlur = 0;
    drawOverlayButton(ctx, button, colors.button, this.images);
    ctx.fillStyle = '#ffe9ad';
    ctx.font = `23px ${font}`;
    ctx.fillText(copy.button, button.x + button.width / 2, button.y + button.height / 2 + 1);
    ctx.restore();
  }

  drawWrapped(ctx, text, x, y, maxWidth) {
    let line = '';
    for (const word of text.split(' ')) {
      const next = line ? `${line} ${word}` : word;
      if (line && ctx.measureText(next).width > maxWidth) {
        ctx.fillText(line, x, y);
        y += 26;
        line = word;
      } else {
        line = next;
      }
    }
    if (line) ctx.fillText(line, x, y);
  }
}

function drawVictoryParticles(ctx, images, time, originX, originY) {
  const count = 32;
  for (let index = 0; index < count; index++) {
    const offset = (index * 0.61803398875) % 1;
    const phase = (time * 0.72 + offset) % 1;
    const age = phase * 1.5;
    const spread = (index / (count - 1) - 0.5) * 2.18;
    const angle = -Math.PI / 2 + spread;
    const speed = 205 + (index * 47) % 145;
    const nozzleX = Math.sin(index * 8.7) * 24;
    const x = originX + nozzleX + Math.cos(angle) * speed * age;
    const y = originY + Math.sin(angle) * speed * age + 210 * age * age;
    const size = 15 + index % 4 * 3;
    ctx.save();
    ctx.globalAlpha = Math.min(1, phase * 8, (1 - phase) * 5);
    ctx.shadowColor = '#ffdc58';
    ctx.shadowBlur = 12;
    drawSheetFrame(ctx, images.coinAnimation,
      (Math.floor(time * 14) + index) % 4, 4,
      x - size / 2, y - size / 2, size, size);
    if (index % 3 === 0) ctx.drawImage(images.effects[2][1], x - size * 0.72,
      y - size * 0.72, size * 1.44, size * 1.44);
    ctx.restore();
  }
}
