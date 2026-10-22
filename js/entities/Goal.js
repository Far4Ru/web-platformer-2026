import { Entity } from './Entity.js';

export class Goal extends Entity {
  constructor(bounds) {
    super(bounds);
    this.portalRadius = bounds.portalRadius;
    this.portalOffsetY = bounds.portalOffsetY;
    this.openFraction = bounds.openFraction;
  }

  hits(player) {
    const centerX = this.x + this.width / 2;
    const centerY = this.y + this.portalOffsetY;
    const nearestX = Math.max(player.x, Math.min(centerX, player.x + player.width));
    const nearestY = Math.max(player.y, Math.min(centerY, player.y + player.height));
    return Math.hypot(nearestX - centerX, nearestY - centerY) <= this.portalRadius;
  }
}
