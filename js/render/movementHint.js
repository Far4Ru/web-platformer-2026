import { drawSpeechBubble } from './speechBubble.js';

export function drawMovementHint(ctx, player, idleTime, images, time, bounds) {
  if (idleTime < 5) return;
  const icons = [images.speechKeyLeft, images.speechKeyRight, images.speechKeyUp];
  const center = player.x + player.width / 2;
  drawSpeechBubble(ctx, images, {
    anchorX: center,
    anchorY: player.y + Math.sin(time * 3) * 2,
    icons,
    alpha: Math.min(1, (idleTime - 5) * 2),
    ...bounds,
  });
}
