export function drawSheetFrame(ctx, image, frame, frames, x, y, width, height,
  top = 0, bottom = 0) {
  const bounds = image.frames[frame];
  ctx.drawImage(bounds.image ?? image.image, bounds.x, bounds.y, bounds.w, bounds.h,
    x, y, width, height);
}

export function drawAtlasCell(ctx, image, column, row, x, y, width, height) {
  ctx.drawImage(image[row][column], x, y, width, height);
}

export function drawGridCell(ctx, image, column, row, columns, rows, x, y, width, height) {
  ctx.drawImage(image[row][column], x, y, width, height);
}
