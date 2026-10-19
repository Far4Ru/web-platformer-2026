import { drawPlatform } from '../../mock/platform.js';
import { drawHazard } from '../../mock/hazard.js';
import { drawLetter } from '../../mock/letter.js';
import { drawGoal } from '../../mock/goal.js';
import { drawPlayer } from '../../mock/player.js';
import { drawHealthBar } from '../../mock/health.js';

export class GameScene {
  constructor(game, art) {
    this.game = game;
    this.art = art;
  }

  render(ctx, canvas, time) {
    const { game, art } = this;
    const platforms = game.platforms.items;
    const letters = game.collectLetters.items;
    const hazards = game.hazards.items;
    const goal = game.reachGoal.goal;
    const { player, state, overlay, hud, controls } = game;

    game.background.render(ctx, canvas, time);
    ctx.save();
    ctx.translate(-game.camera.x, -game.camera.y);
    for (const platform of platforms) drawPlatform(ctx, platform, art);
    for (const hazard of hazards) drawHazard(ctx, hazard, art);
    letters.forEach((letter, index) => drawLetter(ctx, letter, index, art, time));
    drawGoal(ctx, goal, game.reachGoal.isReady(game.collectLetters), art);
    drawPlayer(ctx, player);
    drawHealthBar(ctx, player, game.playerHealth);
    ctx.restore();

    if (state !== 'playing') overlay.render(ctx, state);
    hud.render(ctx, game.collectLetters.count, letters.length, game.bestScore.value);
    controls.render(ctx, state);
  }
}
