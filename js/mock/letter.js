export function drawLetter(ctx, letter, index, scene, time) {
  if (letter.collected) return;
  const bob = Math.sin(time * scene.letterBobSpeed + index) * scene.letterBobAmount;
  ctx.fillStyle = scene.letterColor;
  ctx.fillRect(letter.x, letter.y + bob, letter.width, letter.height - scene.letterBottomInset);
  ctx.strokeStyle = scene.letterLine;
  ctx.lineWidth = scene.letterLineWidth;
  ctx.beginPath();
  scene.letterFold.forEach(([x, y], point) => {
    if (point === 0) ctx.moveTo(letter.x + x, letter.y + bob + y);
    else ctx.lineTo(letter.x + x, letter.y + bob + y);
  });
  ctx.stroke();
}
