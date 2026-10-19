import { drawNineSlice } from './uiImage.js';

export function drawCounterPanel(ctx, rect, colors, images) {
  drawNineSlice(ctx, images.panelDark, rect.x, rect.y, rect.width, rect.height);
}
