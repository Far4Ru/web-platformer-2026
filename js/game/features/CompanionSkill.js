import { SkillPickup } from '../../entities/SkillPickup.js';

export class CompanionSkill {
  constructor(settings) {
    this.settings = settings;
    this.pickup = new SkillPickup(settings.pickup);
    this.reset();
  }

  reset() {
    this.pickup.reset();
    this.history = [];
    this.companion = null;
    this.cooldown = 0;
  }

  update(dt, player) {
    if (!this.pickup.collected && !this.pickup.tryCollect(player)) return;
    this.history.push({ x: player.x, y: player.y, facing: player.facing, grounded: player.grounded, dt });
    let delay = 0;
    for (let index = this.history.length - 1; index >= 0; index--) {
      delay += this.history[index].dt;
      if (delay >= this.settings.delay) {
        const pose = this.history[index];
        this.companion = {
          x: pose.x - pose.facing * this.settings.distance,
          y: pose.y, width: player.width, height: player.height,
          facing: pose.facing, grounded: pose.grounded,
        };
        this.history.splice(0, index);
        return;
      }
    }
    this.companion = {
      x: player.x - player.facing * this.settings.distance,
      y: player.y, width: player.width, height: player.height,
      facing: player.facing, grounded: player.grounded,
    };
  }
}
