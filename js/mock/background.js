export function drawBackground(ctx, canvas, scene, time) {
  const sky = ctx.createLinearGradient(0, 0, 0, canvas.height);
  sky.addColorStop(0, scene.skyTop);
  sky.addColorStop(1, scene.skyBottom);
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Stable star positions avoid random flicker between frames.
  for (let i = 0; i < scene.starCount; i++) {
    const x = (i * scene.starXMultiplier + scene.starXOffset) % canvas.width;
    const y = (i * scene.starYMultiplier + scene.starYOffset) % scene.starHeight;
    ctx.globalAlpha = scene.starOpacityBase + scene.starOpacityAmplitude * Math.sin(time * scene.starTwinkleSpeed + i);
    ctx.fillStyle = scene.starColor;
    const size = i % scene.largeStarEvery === 0 ? scene.largeStarSize : scene.starSize;
    ctx.fillRect(x, y, size, size);
  }
  ctx.globalAlpha = 1;
  ctx.fillStyle = scene.hillColor;
  ctx.beginPath();
  scene.hillPoints.forEach(([x, y], index) => {
    if (index === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  });
  ctx.fill();
}
