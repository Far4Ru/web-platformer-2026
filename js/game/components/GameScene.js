import { drawPlatform } from '../../mock/platform.js';
import { drawHazard } from '../../mock/hazard.js';
import { drawEnemy, drawEnemyHealthBar } from '../../mock/enemy.js';
import { drawCoin } from '../../mock/coin.js';
import { drawGoal } from '../../mock/goal.js';
import { drawPlayer } from '../../mock/player.js';
import { drawHealthBar } from '../../mock/health.js';
import { drawHealingBeam } from '../../mock/healingSkill.js';
import { drawSwordAttack } from '../../mock/swordSkill.js';
import { drawDust } from '../../mock/dust.js';
import { drawBoostPickup } from '../../mock/boosts.js';
import { drawChest, drawHellEffects, drawHellWall } from '../../mock/cards.js';
import { drawCompanion, drawAbilityShot,
  drawEnemyAbility, drawEnemyShot, drawEnemySpikes } from '../../mock/abilities.js';

export class GameScene {
  constructor(game, art) {
    this.game = game;
    this.art = art;
  }

  render(ctx, canvas, time) {
    const { game, art } = this;
    const platforms = game.platforms.items;
    const coins = game.collectCoins.items;
    const hazards = game.hazards.items;
    const goal = game.reachGoal.goal;
    const { player, state, overlay, hud, controls } = game;

    game.background.render(ctx, canvas, time);
    ctx.save();
    const shake = game.hell.kind ? game.settings.cards.hell.shake : 0;
    const shakeX = Math.sin(time * 37) * shake;
    ctx.translate(-game.camera.x + shakeX,
      -game.camera.y + Math.cos(time * 43) * shake);
    for (const platform of platforms) drawPlatform(ctx, platform, art);
    drawHellEffects(ctx, game.hell, platforms, art.hell);
    for (const hazard of hazards) drawHazard(ctx, hazard, art);
    for (const spikes of game.enemies.spikes) drawEnemySpikes(ctx, spikes, art.abilities);
    for (const shot of game.enemies.projectiles) drawEnemyShot(ctx, shot, art.abilities);
    for (const enemy of game.enemies.items) {
      if (enemy.alive) {
        drawEnemy(ctx, enemy, art.enemyColors);
        drawEnemyHealthBar(ctx, enemy, art.enemyHealth);
        drawEnemyAbility(ctx, enemy, art.abilities);
      }
    }
    coins.forEach((coin, index) => drawCoin(ctx, coin, index, art, time));
    for (const chest of game.chests.items) drawChest(ctx, chest, time, game.settings.cards.chestArt);
    for (const [kind, pickup] of Object.entries(game.boosts.pickups)) {
      drawBoostPickup(ctx, pickup, kind, art.boosts, time);
    }
    drawGoal(ctx, goal, game.reachGoal.progress(game.collectCoins),
      game.reachGoal.isReady(game.collectCoins, game.enemies.bossDefeated), art);
    drawDust(ctx, game.dust.particles, game.dust.settings.life);
    drawHealingBeam(ctx, player, game.camera, game.healingSkill);
    drawCompanion(ctx, game.companionSkill, player, art.abilities);
    drawPlayer(ctx, player);
    drawSwordAttack(ctx, player, game.swordSkill);
    for (const shot of game.playerShots.items) drawAbilityShot(ctx, shot, art.abilities);
    drawHealthBar(ctx, player, game.playerHealth);
    ctx.restore();
    drawHellWall(ctx, game.hell, game.camera, canvas, art.hell, shakeX);

    if (state !== 'playing') overlay.render(ctx, state);
    hud.render(ctx, game.collectCoins.count, game.bestScore.value);
    game.skillBar.render(ctx, game);
    game.boostBar.render(ctx, game.boosts);
    controls.render(ctx, state, game.music.muted);
    game.cardOverlay.render(ctx, game.chests, game, time);
  }
}
