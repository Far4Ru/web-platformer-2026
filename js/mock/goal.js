export function drawGoal(ctx, goal, ready, scene) {
  for (const part of scene.goalParts) {
    ctx.fillStyle = part.color === 'goalLight'
      ? (ready ? scene.goalReady : scene.goalLocked)
      : scene[part.color];
    ctx.fillRect(goal.x + part.x, goal.y + part.y, part.width, part.height);
  }
}
