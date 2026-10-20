import { drawAtlasCell, drawGridCell, drawSheetFrame } from './sprites.js';
import { drawNineSlice } from './uiImage.js';

export function drawChest(ctx, chest, time, art, hell = false, image) {
  if (chest.collected) return;
  ctx.save();
  if (hell) ctx.filter = 'hue-rotate(280deg) saturate(1.4)';
  const frame = time < 0 ? Math.min(3, Math.floor(-time * 9)) : 0;
  const groundOffset = time < 0 ? 0 : 18;
  drawSheetFrame(ctx, image, frame, 4,
    chest.x - chest.width * 0.15, chest.y + groundOffset - chest.height * 0.12,
    chest.width * 1.3, chest.height * 1.2);
  ctx.restore();
}

export function drawCard(ctx, card, rect, color, font, palette, rarityLabel,
  levelLabel = '', selected = false, holdFraction = 0, time = 0, images) {
  ctx.save();
  if (holdFraction > 0) {
    const centerX = rect.x + rect.width / 2;
    const centerY = rect.y + rect.height / 2;
    const shake = holdFraction * 4;
    ctx.translate(centerX + Math.sin(time * 55) * shake,
      centerY + Math.cos(time * 61) * shake);
    ctx.scale(1 + holdFraction * 0.16, 1 + holdFraction * 0.16);
    ctx.translate(-centerX, -centerY);
  }
  drawNineSlice(ctx, images.panel, rect.x, rect.y, rect.width, rect.height);
  if (selected) drawNineSlice(ctx, images.panelBorder,
    rect.x - 3, rect.y - 3, rect.width + 6, rect.height + 6);
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.font = `17px ${font}`;
  ctx.fillText(rarityLabel, rect.x + rect.width / 2, rect.y + 34);
  ctx.fillStyle = '#342619';
  ctx.font = `23px ${font}`;
  ctx.fillText(card.title, rect.x + rect.width / 2, rect.y + 83, rect.width - 14);
  if (levelLabel) {
    ctx.fillStyle = color;
    ctx.font = `18px ${font}`;
    ctx.fillText(levelLabel, rect.x + rect.width / 2, rect.y + 181);
  }
  const iconX = rect.x + rect.width / 2 - 31;
  const iconY = rect.y + 117;
  drawCardIcon(ctx, card.id, iconX, iconY, color, font, images);
  ctx.fillStyle = '#4d3c2e';
  ctx.font = `17px ${font}`;
  let y = rect.y + 191;
  let line = '';
  for (const word of card.description.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > rect.width - 24) {
      ctx.fillText(line, rect.x + rect.width / 2, y);
      y += 22;
      line = word;
    } else line = next;
  }
  if (line) ctx.fillText(line, rect.x + rect.width / 2, y);
  if (holdFraction > 0) {
    ctx.fillStyle = palette.progressTrack;
    ctx.fillRect(rect.x + 16, rect.y + rect.height - 20, rect.width - 32, 7);
    ctx.fillStyle = color;
    ctx.fillRect(rect.x + 16, rect.y + rect.height - 20,
      (rect.width - 32) * holdFraction, 7);
  }
  ctx.restore();
}

export function drawCardIcon(ctx, id, x, y, color, font, images) {
  const pickups = { health: 0, speed: 1, damage: 2 };
  const skills = { sword: [0, 0], fireball: [1, 0], ice: [2, 0],
    bow: [0, 1], healing: [2, 1] };
  if (id in pickups) {
    drawGridCell(ctx, images.pickups, pickups[id], 2, 4, 3, x, y, 62, 54);
  } else if (id in skills) {
    drawAtlasCell(ctx, images.effects, ...skills[id], x, y, 62, 54);
  } else if (id === 'companion') {
    const frame = images.golem.frames[0];
    ctx.drawImage(frame.image ?? images.golem.image, frame.x, frame.y, frame.w, frame.h,
      x + 5, y, 52, 54);
  } else {
    const symbols = {
      simplify: '−', complicate: '+', reroll: '↻', noBoss: '✕',
      blessing: '✦', fakeFlight: '↑', fakeLight: '»',
      wall: '▥', arrows: '↓', holes: '○', freeze: '❄',
      enemies: '♜', spikes: '▲',
    };
    ctx.save();
    ctx.fillStyle = color;
    ctx.font = `bold 51px ${font}`;
    ctx.textAlign = 'center';
    ctx.fillText(symbols[id] ?? '?', x + 31, y + 46);
    ctx.restore();
  }
}

export function drawRarityBanner(ctx, card, color, rarityLabel, title,
  palette, font, world, time, images) {
  const x = (world.width - 680) / 2;
  const y = 175;
  ctx.save();
  ctx.translate(world.width / 2, y + 95);
  const pulse = 1 + Math.sin(time * 7) * 0.012;
  ctx.scale(pulse, pulse);
  ctx.translate(-world.width / 2, -(y + 95));
  drawNineSlice(ctx, images.panel, x, y, 680, 190);
  ctx.fillStyle = color;
  ctx.fillRect(x + 18, y + 17, 644, 6);
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.font = `20px ${font}`;
  ctx.fillText(`${title} · ${rarityLabel}`, world.width / 2, y + 62);
  ctx.fillStyle = '#342619';
  ctx.font = `34px ${font}`;
  ctx.fillText(card.title, world.width / 2, y + 115, 620);
  ctx.fillStyle = '#4d3c2e';
  ctx.font = `18px ${font}`;
  ctx.fillText(card.description, world.width / 2, y + 154, 620);
  ctx.restore();
}

export function drawHellEffects(ctx, hell, platforms, art, image, spikes) {
  if (!hell.kind) return;
  for (const arrow of hell.arrows) {
    ctx.save();
    ctx.translate(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
    ctx.rotate(Math.PI / 2);
    const sprite = image[1][0];
    const width = Math.min(arrow.height * 1.6,
      arrow.width * 1.6 * sprite.width / sprite.height);
    const height = width * sprite.height / sprite.width;
    ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
    ctx.restore();
  }
  for (const platform of platforms) {
    if (platform.spikeFor <= 0) continue;
    const sprite = spikes[platform.surface === 'ice' ? 1
      : platform.surface === 'swamp' ? 2 : 0];
    for (let x = platform.x; x < platform.x + platform.width; x += 28)
      ctx.drawImage(sprite, x - 3, platform.y - 20, 34, 25);
  }
}

export function drawHellWall(ctx, hell, camera, canvas, art, shakeX = 0, image,
  viewport = { left: 0, top: 0, right: canvas.width, bottom: canvas.height }) {
  if (hell.kind !== 'wall') return;
  const edgeX = hell.wallX - camera.x + shakeX;
  ctx.save();
  ctx.fillStyle = art.behindWall;
  ctx.fillRect(viewport.left, viewport.top,
    Math.max(0, Math.min(viewport.right, edgeX) - viewport.left),
    viewport.bottom - viewport.top);
  if (image) {
    for (let y = viewport.top; y < viewport.bottom; y += 48)
      drawAtlasCell(ctx, image, 2, 2, edgeX - 14, y - 3, 52, 54);
  } else {
    ctx.fillStyle = art.wall;
    ctx.fillRect(edgeX, viewport.top, 24, viewport.bottom - viewport.top);
  }
  ctx.restore();
}
