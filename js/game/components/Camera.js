export class Camera {
  constructor(viewWidth, viewHeight, level) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.level = level;
    this.x = 0;
    this.y = 0;
  }

  follow(player) {
    const targetX = player.x + player.width / 2 - this.viewWidth / 2;
    const targetY = player.y + player.height / 2 - this.viewHeight / 2;
    this.x = Math.max(0, Math.min(this.level.width - this.viewWidth, targetX));
    this.y = Math.max(this.level.top, Math.min(this.level.bottom - this.viewHeight, targetY));
  }
}
