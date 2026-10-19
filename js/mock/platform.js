export function drawPlatform(ctx, platform, scene) {
  if (platform.fake) {
    ctx.save();
    ctx.globalAlpha = scene.fakePlatformOpacity;
  }
  ctx.fillStyle = scene.platformShadow;
  ctx.fillRect(platform.x + scene.platformShadowOffset.x, platform.y + scene.platformShadowOffset.y, platform.width, platform.height);
  ctx.fillStyle = scene.platformTop;
  ctx.fillRect(platform.x, platform.y, platform.width, scene.platformTopHeight);
  ctx.fillStyle = scene.platformFace;
  ctx.fillRect(platform.x, platform.y + scene.platformTopHeight, platform.width, platform.height - scene.platformTopHeight);
  if (platform.fake) {
    ctx.globalAlpha = 1;
    ctx.strokeStyle = scene.fakePlatformCrack;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(platform.x + platform.width * 0.34, platform.y + 2);
    ctx.lineTo(platform.x + platform.width * 0.42, platform.y + 12);
    ctx.lineTo(platform.x + platform.width * 0.37, platform.y + platform.height - 2);
    ctx.moveTo(platform.x + platform.width * 0.68, platform.y + 3);
    ctx.lineTo(platform.x + platform.width * 0.61, platform.y + 13);
    ctx.stroke();
    ctx.restore();
  }
}
