import { drawOverlayButton, drawOverlayFrame } from '../render/overlay.js';
import { drawSheetFrame } from '../render/sprites.js';

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
      point.y >= rect.y && point.y <= rect.y + rect.height;
  }

  render(ctx, state, viewport, time = 0, game = null) {
    const copy = this.texts.overlays[state];
    if (!copy) return;
    const { panel, button } = this.ui.overlay;
    const { colors, font } = this.ui;
    ctx.save();
    drawOverlayFrame(ctx, this.world, panel, colors, this.images, viewport,
      state === 'won' || state === 'lost');
    if (state === 'won' || state === 'lost') {
      const isWin = state === 'won';
      const falling = game?.lossReason === 'fall';
      if (isWin) {
        const hero = this.images.victoryHero[Math.floor(time * 1.8) % 3];
        ctx.save();
        ctx.filter = 'brightness(1.12) saturate(1.2)';
        ctx.shadowColor = '#ffc949';
        ctx.shadowBlur = 22;
        ctx.drawImage(hero, 0, 0, hero.width, hero.height * 0.77,
          277, 137 + Math.sin(time * 7) * 3, 215, 230);
        ctx.restore();
        drawVictoryParticles(ctx, this.images, time, 590, 285);
      } else {
        const source = falling ? this.images.explorerActions : this.images.explorer;
        const frame = falling ? 2 : Math.floor(time * 8) % 4 === 3
          ? 4 : 1 + Math.floor(time * 9) % 2;
        const travel = falling ? Math.min(19, time % 1.2 * 16)
          : Math.sin(time * 5) * 14;
        drawSheetFrame(ctx, source, frame, 6,
          300 + travel, 152 + Math.sin(time * 15) * 2 + (falling ? travel : 0),
          155, 190);
      }
      if (!isWin && !falling) {
        const obstacle = game?.lossReason === 'spikes'
          ? this.images.spikeVariants[0] : game?.lossReason === 'wall'
            ? this.images.effects[2][2] : this.images.guardian;
        if (game?.lossReason === 'enemy') drawSheetFrame(ctx, obstacle,
          Math.floor(time * 5) % 3, 3, 455, 235, 65, 80);
        else ctx.drawImage(obstacle, 455, 260, 66, 50);
      }
      const titleImage = this.images[isWin ? 'victoryTitle' : 'defeatTitle'];
      const titleWidth = isWin ? 280 : 300;
      const pulse = isWin ? 1 + Math.sin(time * 5) * 0.06 : 1;
      ctx.save();
      ctx.translate(600, 209);
      ctx.scale(pulse, pulse);
      ctx.shadowColor = isWin ? '#ffd44c' : '#a25c32';
      ctx.shadowBlur = isWin ? 18 : 8;
      ctx.drawImage(titleImage, -titleWidth / 2, -28, titleWidth, 56);
      ctx.restore();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const count = isWin ? Math.min(game?.collectCoins.count ?? 0,
        Math.floor((game?.resultTime ?? 0) * 38)) : game?.collectCoins.count ?? 0;
      drawSheetFrame(ctx, this.images.coinAnimation, Math.floor(time * 9) % 4, 4,
        520, 264, 43, 43);
      ctx.font = `bold 46px ${font}`;
      ctx.fillStyle = '#fff2a5';
      ctx.strokeStyle = '#4a2a0d';
      ctx.lineWidth = 5;
      ctx.shadowColor = '#e6a525';
      ctx.shadowBlur = isWin ? 15 : 0;
      ctx.strokeText(String(count), 610, 287, 160);
      ctx.fillText(String(count), 610, 287, 160);
      ctx.shadowBlur = 0;
      if (isWin && game?.newRecord) {
        ctx.drawImage(this.images.recordBadge,
          508, 323, 184, 39);
      }
      drawOverlayButton(ctx, button, colors.button, this.images);
      ctx.fillStyle = '#ffe9ad';
      ctx.font = `23px ${font}`;
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
  for (let index = 0; index < 14; index++) {
    const phase = (time * 0.52 + index / 14) % 1;
    const angle = -2.55 + index * 0.17;
    const distance = phase * (70 + index % 4 * 13);
    const x = originX + Math.cos(angle) * distance;
    const y = originY + Math.sin(angle) * distance + phase * phase * 42;
    const size = 14 + index % 3 * 4;
    ctx.save();
    ctx.globalAlpha = Math.min(1, phase * 5, (1 - phase) * 3);
    ctx.shadowColor = '#ffdc58';
    ctx.shadowBlur = 12;
    drawSheetFrame(ctx, images.coinAnimation,
      (Math.floor(time * 12) + index) % 4, 4,
      x - size / 2, y - size / 2, size, size);
    ctx.drawImage(images.effects[2][1], x - size * 0.65,
      y - size * 0.65, size * 1.3, size * 1.3);
    ctx.restore();
  }
}
