import { drawNineSlice } from './uiImage.js';

export function drawOverlayFrame(ctx, world, panel, colors, images, viewport = {
  left: 0, top: 0, right: world.width, bottom: world.height,
}) {
  ctx.fillStyle = colors.veil;
  ctx.fillRect(viewport.left, viewport.top,
    viewport.right - viewport.left, viewport.bottom - viewport.top);
  drawNineSlice(ctx, images.panel, panel.x, panel.y, panel.width, panel.height);
}

export function drawOverlayButton(ctx, button, color, images) {
  drawNineSlice(ctx, images.button, button.x, button.y, button.width, button.height, 9);
}
