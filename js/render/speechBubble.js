const HEIGHT = 48;
const CAP_WIDTH = 24;
const CONTENT_PADDING = 16;
const ICON_GAP = 10;
const OUTER_MARGIN = 16;

/** Draw text or key icons in the same expandable, four-texture bubble. */
export function drawSpeechBubble(ctx, images, {
  anchorX, anchorY, text = '', visibleCharacters = text.length, icons = [], alpha = 1,
  left = -Infinity, right = Infinity, top = -Infinity,
}) {
  if (alpha <= 0) return;
  ctx.save();
  ctx.font = '16px Alice, Georgia, serif';
  const { speechLeft, speechMiddle, speechRight, speechConnector } = images;
  const contentWidth = icons.length ? icons.length * 32 + (icons.length - 1) * ICON_GAP
    : Math.ceil(ctx.measureText(text).width);
  const width = Math.max(96, contentWidth + CONTENT_PADDING * 2);
  const x = Math.round(Math.max(left + OUTER_MARGIN,
    Math.min(anchorX - width / 2, right - width - OUTER_MARGIN)));
  const y = Math.round(Math.max(top + OUTER_MARGIN, anchorY - 94));

  ctx.globalAlpha *= alpha;
  // Let the center sit behind the caps so fractional camera movement cannot show a seam.
  ctx.drawImage(speechMiddle, x + CAP_WIDTH - 2, y,
    width - CAP_WIDTH * 2 + 4, HEIGHT);
  ctx.drawImage(speechLeft, x, y, CAP_WIDTH, HEIGHT);
  ctx.drawImage(speechRight, x + width - CAP_WIDTH, y, CAP_WIDTH, HEIGHT);
  // The two circles connect the panel to the speaking character.
  const connectorX = Math.max(x + 26, Math.min(anchorX + 8, x + width - 26));
  ctx.drawImage(speechConnector, connectorX - 9, y + HEIGHT + 3, 18, 18);
  ctx.drawImage(speechConnector, anchorX - 9, y + HEIGHT + 25, 8, 8);

  if (icons.length) {
    const start = x + (width - contentWidth) / 2;
    icons.forEach((icon, index) => ctx.drawImage(icon,
      start + index * (32 + ICON_GAP), y + 8, 32, 32));
  } else {
    ctx.fillStyle = '#44301e';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(text.slice(0, visibleCharacters), x + CONTENT_PADDING,
      y + HEIGHT / 2 + 1);
  }
  ctx.restore();
}
