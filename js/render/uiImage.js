export function drawNineSlice(ctx, image, x, y, width, height, edge = 16) {
  if (!image) return;
  const sourceWidth = image.width;
  const sourceHeight = image.height;
  const targetEdge = Math.min(edge, width / 2, height / 2);
  const xs = [0, edge, sourceWidth - edge];
  const ys = [0, edge, sourceHeight - edge];
  const sw = [edge, sourceWidth - edge * 2, edge];
  const sh = [edge, sourceHeight - edge * 2, edge];
  const dx = [x, x + targetEdge, x + width - targetEdge];
  const dy = [y, y + targetEdge, y + height - targetEdge];
  const dw = [targetEdge, width - targetEdge * 2, targetEdge];
  const dh = [targetEdge, height - targetEdge * 2, targetEdge];
  for (let row = 0; row < 3; row++)
    for (let col = 0; col < 3; col++)
      ctx.drawImage(image, xs[col], ys[row], sw[col], sh[row],
        dx[col], dy[row], dw[col], dh[row]);
}
