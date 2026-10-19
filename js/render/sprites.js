export function drawSheetFrame(ctx, image, frame, frames, x, y, width, height,
  top = 0, bottom = image.height) {
  const frameWidth = image.width / frames;
  ctx.drawImage(image, frame * frameWidth, top, frameWidth, bottom - top,
    x, y, width, height);
}

export function drawAtlasCell(ctx, image, column, row, x, y, width, height) {
  ctx.drawImage(image, column * image.width / 3, row * image.height / 3,
    image.width / 3, image.height / 3, x, y, width, height);
}

export function drawGridCell(ctx, image, column, row, columns, rows, x, y, width, height) {
  const cellWidth = image.width / columns;
  const cellHeight = image.height / rows;
  ctx.drawImage(image, column * cellWidth, row * cellHeight,
    cellWidth, cellHeight, x, y, width, height);
}
