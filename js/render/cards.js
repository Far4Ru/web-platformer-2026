import { drawAtlasCell, drawGridCell } from './sprites.js';
import { drawNineSlice } from './uiImage.js';

export function drawChest(ctx, chest, time, art, hell = false, image) {
  if (chest.collected) return;
  ctx.save();
  if (hell) ctx.filter = 'hue-rotate(280deg) saturate(1.4)';
  const frame = time < 0 ? Math.min(3, Math.floor(-time * 9)) : 0;
  const groundOffset = time < 0 ? 0 : 18;
  drawGridCell(ctx, image, frame, 1, 4, 3,
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
  const skillCells = { sword: [1, 0], fireball: [0, 0], ice: [2, 0], bow: [0, 1],
    healing: [2, 1], companion: [1, 1] };
  if (card.id === 'health') drawGridCell(ctx, images.pickups, 0, 2, 4, 3, iconX, iconY, 62, 54);
  else if (card.id === 'speed') drawGridCell(ctx, images.pickups, 1, 2, 4, 3, iconX, iconY, 62, 54);
  else if (card.id === 'damage') drawGridCell(ctx, images.pickups, 2, 2, 4, 3, iconX, iconY, 62, 54);
  else drawAtlasCell(ctx, images.effects, ...(skillCells[card.id] ?? [1, 2]),
    iconX, iconY, 62, 54);
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

export function drawHellEffects(ctx, hell, platforms, art, image) {
  if (!hell.kind) return;
  for (const arrow of hell.arrows) {
    ctx.save();
    ctx.translate(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
    ctx.rotate(Math.PI / 2);
    drawAtlasCell(ctx, image, 0, 1, -arrow.height * 1.5, -arrow.width * 1.5,
      arrow.height * 3, arrow.width * 3);
    ctx.restore();
  }
  for (const platform of platforms) {
    if (platform.spikeFor <= 0) continue;
    for (let x = platform.x; x < platform.x + platform.width; x += 28)
      drawAtlasCell(ctx, image, 2, 2, x - 3, platform.y - 20, 34, 25);
  }
}

export function drawHellWall(ctx, hell, camera, canvas, art, shakeX = 0, image) {
  if (hell.kind !== 'wall') return;
  const edgeX = hell.wallX - camera.x + shakeX;
  ctx.save();
  ctx.fillStyle = art.behindWall;
  ctx.fillRect(0, 0, Math.max(0, Math.min(canvas.width, edgeX)), canvas.height);
  if (image) {
    for (let y = 0; y < canvas.height; y += 48)
      drawAtlasCell(ctx, image, 2, 2, edgeX - 14, y - 3, 52, 54);
  } else {
    ctx.fillStyle = art.wall;
    ctx.fillRect(edgeX, 0, 24, canvas.height);
  }
  ctx.restore();
}
