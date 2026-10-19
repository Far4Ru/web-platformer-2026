export class PlayerMovement {
  constructor(player, input, platforms, worldWidth) {
    this.player = player;
    this.input = input;
    this.platforms = platforms;
    this.worldWidth = worldWidth;
    this.lastInput = 0;
  }

  reset() {
    this.lastInput = 0;
  }

  update(dt, speedMultiplier = 1) {
    const { player, input } = this;
    const { settings } = player;
    const horizontal = input.horizontal;
    const targetSpeed = horizontal * settings.moveSpeed * speedMultiplier;
    const change = (horizontal ? settings.acceleration * speedMultiplier : settings.deceleration) * dt;
    player.vx += Math.sign(targetSpeed - player.vx) * Math.min(Math.abs(targetSpeed - player.vx), change);
    if (horizontal) player.facing = horizontal;
    if (input.consumeJump() && player.grounded) {
      player.vy = -settings.jumpSpeed;
      player.grounded = false;
    }
    const startedOnGround = horizontal !== 0 && horizontal !== this.lastInput && player.grounded;
    this.lastInput = horizontal;
    player.vy = Math.min(player.vy + settings.gravity * dt, settings.maxFallSpeed);
    this.platforms.move(player, dt);
    player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
    return startedOnGround;
  }
}
