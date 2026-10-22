function visiblePieces(platform) {
  if (platform.holeFor <= 0) return [platform];
  const rightX = platform.holeX + platform.holeWidth;
  return [
    { ...platform, width: platform.holeX - platform.x },
    { ...platform, x: rightX, width: platform.x + platform.width - rightX },
  ];
}

export function windPulse(time, x) {
  const phase = ((time * 370 - x) % 1550 + 1550) % 1550;
  const distance = Math.abs(phase - 775) / 245;
  return distance >= 1 ? 0 : (1 + Math.cos(Math.PI * distance)) / 2;
}

export function drawEarth(ctx, platforms, images, scene, camera, viewport) {
  const bottom = camera.y + viewport.bottom;
  const left = camera.x + viewport.left;
  const right = camera.x + viewport.right;
  for (const platform of platforms) {
    if (platform.fake || platform.broken) continue;
    for (const piece of visiblePieces(platform)) {
      const earthY = piece.y + piece.height;
      if (piece.width <= 0 || earthY >= bottom) continue;
      ctx.save();
      ctx.beginPath();
      ctx.rect(piece.x, earthY, piece.width, bottom - earthY);
      ctx.clip();
      ctx.globalAlpha = scene.earthOpacity;
      const surface = materialIndex(platform);
      const tile = surface === 0 ? scene.earthTileSize : 256;
      const firstX = Math.floor(Math.max(left, piece.x) / tile) * tile;
      const firstY = Math.floor(Math.max(camera.y + viewport.top, earthY) / tile) * tile;
      const image = surface === 1 ? images.iceEarth
        : surface === 2 ? images.swampEarth
          : surface === 3 ? images.ruinsEarth
          : surface === 4 ? images.templeEarth : images.earth;
      for (let y = firstY; y < bottom; y += tile) {
        for (let x = firstX; x < Math.min(right, piece.x + piece.width); x += tile) {
          ctx.drawImage(image, x, y, tile, tile);
        }
      }
      ctx.restore();
    }
  }
}

function materialIndex(platform) {
  if (platform.surface === 'ice') return 1;
  if (platform.surface === 'swamp') return 2;
  return platform.appearance === 'ruins' ? 3
    : platform.appearance === 'temple' ? 4 : 0;
}

function drawSheetCell(ctx, image, cell, columns, x, y, width, height,
  sourceTop = 0, sourceHeight = image.height) {
  const frameWidth = image.width / columns;
  ctx.drawImage(image, frameWidth * cell, sourceTop, frameWidth, sourceHeight,
    x, y, width, height);
}

function grassFrame(time, x, reaction, coveredByStillPlayer) {
  if (reaction > 0) {
    const age = 0.36 - reaction;
    return age < 0.11 ? 1 : age < 0.22 ? 2 : age < 0.32 ? 3 : 0;
  }
  if (coveredByStillPlayer) return 0;
  const gust = windPulse(time, x);
  if (gust > 0.75) return 2;
  if (gust > 0.25) return windPulse(time - 0.03, x) > gust ? 3 : 1;
  return 0;
}

function variation(seed) {
  const value = Math.sin(seed * 127.1 + 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function tuftsInPiece(piece, surface) {
  if (surface === 1 || surface >= 3) return [];
  const tufts = [];
  for (let slot = Math.floor(piece.x / 78);
    slot <= Math.ceil((piece.x + piece.width) / 78); slot++) {
    const seed = slot * 31 + surface * 47;
    if (variation(seed) < (surface === 2 ? 0.53 : 0.40)) continue;
    const x = slot * 78 + 12 + variation(seed + 1) * 39;
    if (x < piece.x + 14 || x > piece.x + piece.width - 14) continue;
    tufts.push({
      key: `${piece.y}:${surface}:${slot}`, x,
      width: 38 + variation(seed + 2) * 18,
      height: (surface === 2 ? 23 : 27) + variation(seed + 3) * 8,
    });
  }
  return tufts;
}

export function grassTufts(platform) {
  const surface = materialIndex(platform);
  return visiblePieces(platform).flatMap((piece) => tuftsInPiece(piece, surface));
}

export function drawPlatform(ctx, platform, scene, images, time = 0,
  player = null, grassMotion = null) {
  if (platform.broken) {
    if (platform.breakFor <= 0) return;
    const progress = 1 - platform.breakFor / 0.45;
    const image = images.platformBases[materialIndex(platform)];
    ctx.save();
    ctx.globalAlpha *= 1 - progress;
    for (let shard = 0; shard < 4; shard++) {
      const width = platform.width / 4;
      const x = platform.x + shard * width;
      ctx.save();
      ctx.translate(x + width / 2, platform.y + platform.height / 2);
      ctx.translate((shard - 1.5) * progress * 8, progress * progress * 42);
      ctx.rotate((shard - 1.5) * progress * 0.18);
      ctx.drawImage(image, image.width * shard / 4, 0, image.width / 4, image.height,
        -width / 2, -platform.height / 2, width, platform.height);
      ctx.restore();
    }
    ctx.restore();
    return;
  }
  const pieces = platform.fake ? [platform] : visiblePieces(platform);
  const surface = materialIndex(platform);
  for (const piece of pieces) {
    if (piece.width <= 0) continue;
    const blockHeight = piece.height;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(piece.x, piece.y, piece.width, blockHeight, 5);
    ctx.clip();
    if (surface) {
      const image = images.platformBases[surface];
      const tileWidth = 96;
      for (let x = Math.floor(piece.x / tileWidth) * tileWidth;
        x < piece.x + piece.width; x += tileWidth) {
        ctx.save();
        if (Math.floor(x / tileWidth) % 2 !== 0) {
          ctx.translate(2 * x + tileWidth, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(image, x, piece.y, tileWidth, blockHeight);
        ctx.restore();
      }
    } else ctx.drawImage(images.platformBases[surface],
      piece.x, piece.y, piece.width, blockHeight);

    // Sparse image decals provide wear without baking it into the block texture.
    for (let slot = Math.floor(piece.x / 103); slot <= Math.ceil((piece.x + piece.width) / 103);
      slot++) {
      const seed = slot * 7 + surface * 31;
      if (variation(seed) < 0.48) continue;
      const x = slot * 103 + 23 + variation(seed + 1) * 35;
      if (x < piece.x + 12 || x > piece.x + piece.width - 12) continue;
      if (surface !== 4) {
        const cell = surface === 1 ? (variation(seed + 2) < 0.5 ? 3 : 4)
          : surface === 2 || surface === 3 ? (variation(seed + 2) < 0.5 ? 5 : 2)
            : variation(seed + 2) < 0.5 ? 0 : 2;
        drawSheetCell(ctx, images.surfaceDetails, cell, 6,
          x - 13, piece.y + 5, 26, Math.min(16, blockHeight - 6),
          images.surfaceDetails.height * 0.18, images.surfaceDetails.height * 0.62);
      }
    }
    ctx.restore();

    if (surface === 0 || surface === 2) {
      ctx.save();
      ctx.beginPath();
      ctx.rect(piece.x, piece.y - 38, piece.width, 48);
      ctx.clip();
      for (const tuft of tuftsInPiece(piece, surface)) {
        const coveredByStillPlayer = player && Math.abs(player.vx) < 25
          && player.x + player.width > tuft.x - tuft.width / 2
          && player.x < tuft.x + tuft.width / 2
          && Math.abs(player.y + player.height - piece.y) < 16;
        const reaction = grassMotion?.remaining(tuft.key) ?? 0;
        const frame = grassFrame(time, tuft.x, reaction, coveredByStillPlayer);
        ctx.save();
        if (reaction > 0 && grassMotion.direction(tuft.key) < 0) {
          ctx.translate(tuft.x * 2, 0);
          ctx.scale(-1, 1);
        }
        drawSheetCell(ctx, images.grassWind, frame, 4,
          tuft.x - tuft.width / 2, piece.y - tuft.height + 8,
          tuft.width, tuft.height,
          images.grassWind.height * 0.25, images.grassWind.height * 0.5);
        ctx.restore();
      }
      ctx.restore();
    }
  }
  if (platform.fake) drawSheetCell(ctx, images.surfaceDetails, 0, 6,
    platform.x + platform.width - 26, platform.y + 8, 18, 17);
}
