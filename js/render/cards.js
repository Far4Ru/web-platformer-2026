import { drawAtlasCell, drawSheetFrame } from './sprites.js';
import { drawNineSlice } from './uiImage.js';

export function drawChest(ctx, chest, time, art, hell = false, image) {
  if (chest.collected) return;
  ctx.save();
  if (hell) ctx.filter = 'hue-rotate(280deg) saturate(1.4)';
  const frame = time < 0 ? Math.min(3, Math.floor(-time * 9)) : 0;
  const breathe = time < 0 ? 0 : Math.sin(time * 3 + chest.x * 0.02) * 0.6;
  const width = chest.width * 1.34;
  const height = width * 315 / 362;
  drawSheetFrame(ctx, image, frame, 4,
    chest.x + (chest.width - width) / 2, chest.y + chest.height - height + breathe,
    width, height);
  ctx.restore();
}

const CARD_ART_IDS = ['health', 'damage', 'speed', 'healing', 'bow', 'sword',
  'fireball', 'ice', 'companion', 'simplify', 'complicate', 'reroll', 'noBoss',
  'blessing', 'fakeFlight', 'fakeLight', 'fakeInvulnerability', 'fakeTeleport',
  'fakeMindReading', 'fakePastPrediction', 'fakeUnderwaterBreathing',
  'fakeInvisibility', 'wall', 'arrows', 'holes', 'freeze',
  'enemies', 'spikes'];

function drawCardArtwork(ctx, card, rect, images) {
  const artwork = images.cardArt?.[CARD_ART_IDS.indexOf(card.id)];
  if (!artwork) return;
  const x = rect.x + 28;
  const y = rect.y + 42;
  const width = rect.width - 56;
  const height = 72;
  const cropWidth = Math.min(artwork.width, artwork.height * width / height);
  const cropHeight = Math.min(artwork.height, artwork.width * height / width);
  ctx.drawImage(artwork, (artwork.width - cropWidth) / 2,
    (artwork.height - cropHeight) / 2, cropWidth, cropHeight,
    x, y, width, height);
}

function cardDescriptionLines(ctx, description, maxWidth) {
  const lines = [];
  let line = '';
  for (const word of description.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(next).width > maxWidth) {
      lines.push(line);
      line = word;
    } else line = next;
  }
  if (line) lines.push(line);
  return lines;
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
  drawCardArtwork(ctx, card, rect, images);
  const rarity = card.rarity?.charAt(0).toUpperCase() + card.rarity?.slice(1);
  const template = images[`card${rarity}`] ?? images.cardCommon;
  if (template) ctx.drawImage(template, rect.x, rect.y, rect.width, rect.height);
  else drawNineSlice(ctx, images.panelDark, rect.x, rect.y, rect.width, rect.height);
  if (selected && template) {
    ctx.shadowColor = color;
    ctx.shadowBlur = 14;
    ctx.drawImage(template, rect.x, rect.y, rect.width, rect.height);
    ctx.shadowBlur = 0;
  }
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.font = `bold 12px ${font}`;
  ctx.fillText(rarityLabel, rect.x + rect.width / 2, rect.y + 122,
    rect.width - 68);
  ctx.fillStyle = '#f4ddb2';
  ctx.font = `bold 16px ${font}`;
  ctx.fillText(levelLabel || card.title, rect.x + rect.width / 2,
    rect.y + 145, rect.width - 56);
  if (levelLabel) {
    ctx.font = `bold 14px ${font}`;
    ctx.fillText(card.title, rect.x + rect.width / 2,
      rect.y + 161, rect.width - 56);
  }
  ctx.fillStyle = '#ead8b7';
  ctx.font = `${levelLabel ? 13 : 12}px ${font}`;
  const lines = cardDescriptionLines(ctx, card.description, rect.width - 62);
  const visibleLines = lines.slice(0, levelLabel ? 2 : 3);
  const firstLineY = rect.y + 184 - (visibleLines.length - 1) * 7.5;
  visibleLines.forEach((line, index) =>
    ctx.fillText(line, rect.x + rect.width / 2,
      firstLineY + index * 15,
      rect.width - 62));
  ctx.fillStyle = '#3c2916';
  ctx.font = `bold 12px ${font}`;
  const typeLabels = {
    skill: 'СПОСОБНОСТЬ', upgrade: 'УСИЛЕНИЕ',
    world: 'МИР', utility: 'АРТЕФАКТ', fake: 'СПОСОБНОСТЬ'
  };
  const typeLabel = card.rarity === 'hell' ? 'ПРОКЛЯТИЕ'
    : typeLabels[card.kind] ?? 'АРТЕФАКТ';
  ctx.fillText(typeLabel, rect.x + rect.width / 2,
    rect.y + rect.height - 34, rect.width - 70);
  if (holdFraction > 0) {
    ctx.fillStyle = palette.progressTrack;
    ctx.fillRect(rect.x + 16, rect.y + rect.height - 5, rect.width - 32, 4);
    ctx.fillStyle = color;
    ctx.fillRect(rect.x + 16, rect.y + rect.height - 5,
      (rect.width - 32) * holdFraction, 4);
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

export function drawHellEffects(ctx, hell, platforms, art, image, spikes,
  arrowAnimation, time = 0) {
  if (!hell.kind) return;
  for (const arrow of hell.arrows) {
    ctx.save();
    ctx.translate(arrow.x + arrow.width / 2, arrow.y + arrow.height / 2);
    ctx.rotate(Math.PI / 2);
    const frame = arrowAnimation?.frames[Math.floor(time * 11 + arrow.y * 0.02) % 4];
    const sprite = frame ? frame.image ?? arrowAnimation.image : image[1][0];
    const ratio = frame ? frame.w / frame.h : sprite.width / sprite.height;
    const width = Math.min(arrow.height * 1.6, arrow.width * 1.6 * ratio);
    const height = width / ratio;
    ctx.shadowColor = '#ffdea0';
    ctx.shadowBlur = 7;
    if (frame) ctx.drawImage(sprite, frame.x, frame.y, frame.w, frame.h,
      -width / 2, -height / 2, width, height);
    else ctx.drawImage(sprite, -width / 2, -height / 2, width, height);
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
