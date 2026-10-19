function visiblePieces(platform) {
  if (platform.holeFor <= 0) return [platform];
  const rightX = platform.holeX + platform.holeWidth;
  return [
    { ...platform, width: platform.holeX - platform.x },
    { ...platform, x: rightX, width: platform.x + platform.width - rightX },
  ];
}

export function drawEarth(ctx, platforms, images, scene, camera, canvas) {
  const bottom = camera.y + canvas.height;
  ctx.save();
  ctx.beginPath();
  for (const platform of platforms) {
    for (const piece of visiblePieces(platform)) {
      if (piece.width <= 0 || piece.y >= bottom) continue;
      ctx.rect(piece.x, piece.y, piece.width, bottom - piece.y);
    }
  }
  ctx.clip();
  ctx.globalAlpha = scene.earthOpacity;
  const tile = scene.earthTileSize;
  const firstX = Math.floor(camera.x / tile) * tile;
  const firstY = Math.floor(camera.y / tile) * tile;
  for (let y = firstY; y < bottom; y += tile)
    for (let x = firstX; x < camera.x + canvas.width; x += tile)
      ctx.drawImage(images.earth, x, y, tile, tile);
  ctx.restore();
}

export function drawPlatform(ctx, platform, scene, images) {
  const pieces = platform.fake ? [platform] : visiblePieces(platform);
  for (const piece of pieces) {
    if (piece.width <= 0) continue;
    ctx.save();
    ctx.beginPath();
    ctx.rect(piece.x, piece.y - 8, piece.width, Math.max(piece.height, 42) + 8);
    ctx.clip();
    const surface = platform.surface === 'ice' ? 1 : platform.surface === 'swamp' ? 2 : 0;
    const cellWidth = images.objects.width / 3;
    const cellHeight = images.objects.height / 3;
    for (let x = piece.x; x < piece.x + piece.width; x += 72) {
      ctx.drawImage(images.objects, surface * cellWidth + 45, cellHeight + 60,
        cellWidth - 90, 95, x, piece.y - 8, 73, 15);
      ctx.drawImage(images.objects, surface * cellWidth + 45, cellHeight + 105,
        cellWidth - 90, 190, x, piece.y + 7, 73, 42);
    }
    ctx.restore();
  }
  if (platform.fake) {
    ctx.fillStyle = scene.fakePlatformCrack;
    ctx.fillRect(platform.x + platform.width - 14, platform.y + 12, 3, 3);
  }
}
