import { drawNineSlice } from './uiImage.js';

export function drawOverlayFrame(ctx, world, panel, colors, images) {
  ctx.fillStyle = colors.veil;
  ctx.fillRect(0, 0, world.width, world.height);
  drawNineSlice(ctx, images.panel, panel.x, panel.y, panel.width, panel.height);
}

export function drawOverlayButton(ctx, button, color, images) {
  drawNineSlice(ctx, images.button, button.x, button.y, button.width, button.height, 9);
}
