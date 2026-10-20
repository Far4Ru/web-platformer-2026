import { drawNineSlice } from './uiImage.js';

export function drawOverlayFrame(ctx, world, panel, colors, images, viewport = {
  left: 0, top: 0, right: world.width, bottom: world.height,
}, result = false) {
  ctx.fillStyle = colors.veil;
  ctx.fillRect(viewport.left, viewport.top,
    viewport.right - viewport.left, viewport.bottom - viewport.top);
  const frame = result
    ? { x: panel.x - 130, y: 25, width: panel.width + 260, height: 445 }
    : { x: panel.x - 130, y: panel.y - 80,
      width: panel.width + 260, height: panel.height + 90 };
  if (images.templePlaque) drawTempleFrame(ctx, images.templePlaque, frame);
  else drawNineSlice(ctx, images.panelDark, frame.x, frame.y,
    frame.width, frame.height);
}

export function drawTempleFrame(ctx, image, { x, y, width, height }) {
  const scaleX = image.width / 2172;
  const scaleY = image.height / 724;
  const side = Math.min(155, width * 0.22);
  const center = Math.min(180, width * 0.27);
  const shoulder = Math.max(0, (width - side * 2 - center) / 2);
  const top = Math.min(104, height * 0.28);
  const bottom = Math.min(94, height * 0.25);
  const sourceRows = [[0, 248], [248, 244], [492, 232]];
  const destRows = [[y, top], [y + top, height - top - bottom],
    [y + height - bottom, bottom]];
  sourceRows.forEach(([sy, sh], row) => {
    const [dy, dh] = destRows[row];
    const slice = (sx, sw, dx, dw) => ctx.drawImage(image,
      sx * scaleX, sy * scaleY, sw * scaleX, sh * scaleY,
      dx, dy, dw, dh);
    slice(0, 620, x, side);
    tileShoulder(ctx, image, 620 * scaleX, 200 * scaleX,
      sy * scaleY, sh * scaleY, x + side, dy, shoulder, dh);
    slice(820, 532, x + side + shoulder, center);
    tileShoulder(ctx, image, 1352 * scaleX, 200 * scaleX,
      sy * scaleY, sh * scaleY,
      x + side + shoulder + center, dy, shoulder, dh);
    slice(1552, 620, x + width - side, side);
  });
}

function tileShoulder(ctx, image, sx, sw, sy, sh, x, y, width, height) {
  const tileWidth = 58;
  for (let offset = 0; offset < width; offset += tileWidth) {
    const segment = Math.min(tileWidth, width - offset);
    ctx.drawImage(image, sx, sy, sw * segment / tileWidth,
      sh, x + offset, y, segment, height);
  }
}

export function drawOverlayButton(ctx, button, color, images) {
  if (images.mayaButton) ctx.drawImage(images.mayaButton,
    button.x, button.y, button.width, button.height);
  else drawNineSlice(ctx, images.button, button.x, button.y, button.width, button.height, 9);
}
