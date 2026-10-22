export class Camera {
  constructor(viewWidth, viewHeight, level) {
    this.viewWidth = viewWidth;
    this.viewHeight = viewHeight;
    this.level = level;
    this.x = 0;
    this.y = 0;
    this.viewport = null;
  }

  setViewport(viewport, player) {
    this.viewport = viewport;
    this.follow(player);
  }

  follow(player) {
    const view = this.viewport;
    const portrait = view && view.right - view.left < this.viewWidth;
    const targetX = player.x + player.width / 2
      - (portrait ? (view.left + view.right) / 2 : this.viewWidth / 2);
    const targetY = player.y + player.height / 2
      - (portrait ? (view.top + view.bottom) / 2 : this.viewHeight / 2);
    this.x = portrait
      ? Math.max(-view.left, Math.min(this.level.width - view.right, targetX))
      : Math.max(0, Math.min(this.level.width - this.viewWidth, targetX));
    const top = portrait
      ? this.level.top - Math.max(0, view.bottom - view.top - this.viewHeight)
      : this.level.top;
    this.y = Math.max(top, Math.min(this.level.bottom - this.viewHeight, targetY));
  }
}
