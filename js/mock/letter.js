export function drawLetter(ctx, letter, index, scene, time) {
  if (!letter.active || letter.collected) return;
  const bob = Math.sin(time * scene.letterBobSpeed + index) * scene.letterBobAmount;
  ctx.save();
  ctx.translate(letter.x + letter.width / 2, letter.y + letter.height / 2 + bob);
  ctx.scale(letter.width * letter.scale / 24, letter.height * letter.scale / 24);
  ctx.fillStyle = scene.letterColor;
  ctx.fillRect(-12, -12, 24, 24 - scene.letterBottomInset);
  ctx.strokeStyle = scene.letterLine;
  ctx.lineWidth = scene.letterLineWidth;
  ctx.beginPath();
  scene.letterFold.forEach(([x, y], point) => {
    if (point === 0) ctx.moveTo(x - 12, y - 12);
    else ctx.lineTo(x - 12, y - 12);
  });
  ctx.stroke();
  ctx.restore();
}
