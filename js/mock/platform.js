export function drawPlatform(ctx, platform, scene) {
  ctx.fillStyle = scene.platformShadow;
  ctx.fillRect(platform.x + scene.platformShadowOffset.x, platform.y + scene.platformShadowOffset.y, platform.width, platform.height);
  ctx.fillStyle = scene.platformTop;
  ctx.fillRect(platform.x, platform.y, platform.width, scene.platformTopHeight);
  ctx.fillStyle = scene.platformFace;
  ctx.fillRect(platform.x, platform.y + scene.platformTopHeight, platform.width, platform.height - scene.platformTopHeight);
}
