export class PlayerMovement {
  constructor(player, input, platforms, worldWidth) {
    this.player = player;
    this.input = input;
    this.platforms = platforms;
    this.worldWidth = worldWidth;
  }

  update(dt) {
    const { player, input } = this;
    const { settings } = player;
    player.vx = input.horizontal * settings.moveSpeed;
    if (input.consumeJump() && player.grounded) {
      player.vy = -settings.jumpSpeed;
      player.grounded = false;
    }
    player.vy = Math.min(player.vy + settings.gravity * dt, settings.maxFallSpeed);
    this.platforms.move(player, dt);
    player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
  }
}
