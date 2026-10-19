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
    const surface = player.grounded ? player.groundPlatform?.surface : 'normal';
    const terrainSpeed = surface === 'swamp' ? 0.55 : 1;
    const terrainAcceleration = surface === 'ice' ? 0.45 : 1;
    const terrainDeceleration = surface === 'ice' ? 0.12 : 1;
    const frozen = player.frozenFor > 0;
    if (frozen) player.vx = 0;
    const targetSpeed = (frozen ? 0 : horizontal) * settings.moveSpeed * speedMultiplier * terrainSpeed;
    const change = (horizontal && !frozen ? settings.acceleration * speedMultiplier * terrainAcceleration
      : settings.deceleration * terrainDeceleration) * dt;
    player.vx += Math.sign(targetSpeed - player.vx) * Math.min(Math.abs(targetSpeed - player.vx), change);
    if (horizontal) player.facing = horizontal;
    if (input.consumeJump() && player.grounded && !frozen) {
      player.vy = -settings.jumpSpeed;
      player.grounded = false;
    }
    const startedOnGround = horizontal !== 0 && !frozen && horizontal !== this.lastInput && player.grounded;
    this.lastInput = horizontal;
    player.vy = Math.min(player.vy + settings.gravity * dt, settings.maxFallSpeed);
    this.platforms.move(player, dt);
    player.x = Math.max(0, Math.min(this.worldWidth - player.width, player.x));
    return startedOnGround;
  }
}
