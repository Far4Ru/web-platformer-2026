export function drawChest(ctx, chest, time, art, hell = false) {
  if (chest.collected) return;
  const bob = Math.sin(time * 3 + chest.x) * 2;
  ctx.save();
  ctx.translate(chest.x, chest.y + bob);
  ctx.fillStyle = hell ? art.hellBody : art.body;
  ctx.fillRect(0, 10, chest.width, chest.height - 10);
  ctx.fillStyle = hell ? art.hellTrim : art.trim;
  ctx.fillRect(0, 7, chest.width, 6);
  ctx.fillRect(4, 3, chest.width - 8, 5);
  ctx.fillRect(chest.width / 2 - 3, 13, 6, 9);
  ctx.restore();
}

export function drawCard(ctx, card, rect, color, font, palette, rarityLabel,
  levelLabel = '', selected = false, holdFraction = 0, time = 0) {
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
  ctx.fillStyle = palette.panel;
  ctx.strokeStyle = color;
  ctx.lineWidth = selected ? 7 : 4;
  ctx.beginPath();
  ctx.roundRect(rect.x, rect.y, rect.width, rect.height, 12);
  ctx.fill();
  ctx.stroke();
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.font = `17px ${font}`;
  ctx.fillText(rarityLabel, rect.x + rect.width / 2, rect.y + 34);
  ctx.fillStyle = palette.text;
  ctx.font = `23px ${font}`;
  ctx.fillText(card.title, rect.x + rect.width / 2, rect.y + 83, rect.width - 14);
  if (levelLabel) {
    ctx.fillStyle = color;
    ctx.font = `18px ${font}`;
    ctx.fillText(levelLabel, rect.x + rect.width / 2, rect.y + 116);
  }
  ctx.fillStyle = palette.description;
  ctx.font = `17px ${font}`;
  let y = rect.y + 151;
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
  palette, font, world, time) {
  const x = (world.width - 680) / 2;
  const y = 175;
  ctx.save();
  ctx.translate(world.width / 2, y + 95);
  const pulse = 1 + Math.sin(time * 7) * 0.012;
  ctx.scale(pulse, pulse);
  ctx.translate(-world.width / 2, -(y + 95));
  ctx.fillStyle = palette.panel;
  ctx.strokeStyle = color;
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.roundRect(x, y, 680, 190, 16);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.fillRect(x + 18, y + 17, 644, 6);
  ctx.textAlign = 'center';
  ctx.fillStyle = color;
  ctx.font = `20px ${font}`;
  ctx.fillText(`${title} · ${rarityLabel}`, world.width / 2, y + 62);
  ctx.fillStyle = palette.text;
  ctx.font = `34px ${font}`;
  ctx.fillText(card.title, world.width / 2, y + 115, 620);
  ctx.fillStyle = palette.description;
  ctx.font = `18px ${font}`;
  ctx.fillText(card.description, world.width / 2, y + 154, 620);
  ctx.restore();
}

export function drawHellEffects(ctx, hell, platforms, art) {
  if (!hell.kind) return;
  ctx.fillStyle = art.arrow;
  for (const arrow of hell.arrows) {
    ctx.beginPath();
    ctx.moveTo(arrow.x, arrow.y);
    ctx.lineTo(arrow.x + arrow.width, arrow.y);
    ctx.lineTo(arrow.x + arrow.width / 2, arrow.y + arrow.height);
    ctx.fill();
  }
  for (const platform of platforms) {
    if (platform.spikeFor <= 0) continue;
    ctx.fillStyle = art.spike;
    for (let x = platform.x; x < platform.x + platform.width; x += 12) {
      ctx.beginPath();
      ctx.moveTo(x, platform.y);
      ctx.lineTo(x + 6, platform.y - 15);
      ctx.lineTo(x + 12, platform.y);
      ctx.fill();
    }
  }
}

export function drawHellWall(ctx, hell, camera, canvas, art, shakeX = 0) {
  if (hell.kind !== 'wall') return;
  const edgeX = hell.wallX - camera.x + shakeX;
  ctx.save();
  ctx.fillStyle = art.behindWall;
  ctx.fillRect(0, 0, Math.max(0, Math.min(canvas.width, edgeX)), canvas.height);
  ctx.fillStyle = art.wall;
  ctx.fillRect(edgeX, 0, 24, canvas.height);
  ctx.restore();
}
