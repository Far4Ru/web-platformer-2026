import { drawEarth, drawPlatform } from '../../render/platform.js';
import { drawHazard } from '../../render/hazard.js';
import { drawEnemy, drawEnemyHealthBar } from '../../render/enemy.js';
import { drawCoin } from '../../render/coin.js';
import { drawGoal } from '../../render/goal.js';
import { drawPlayer } from '../../render/player.js';
import { drawHealthBar } from '../../render/health.js';
import { drawHealingBeam } from '../../render/healingSkill.js';
import { drawSwordAttack } from '../../render/swordSkill.js';
import { drawDust } from '../../render/dust.js';
import { drawParticles } from '../../render/particles.js';
import { drawBoostPickup } from '../../render/boosts.js';
import { drawChest, drawHellEffects, drawHellWall } from '../../render/cards.js';
import { drawCompanion, drawAbilityShot,
  drawEnemyAbility, drawEnemyShot, drawEnemySpikes } from '../../render/abilities.js';
import { drawMovementHint } from '../../render/movementHint.js';

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

    game.background.render(ctx, canvas, time, game.camera, game.level.width);
    ctx.save();
    const shake = game.hell.kind ? game.settings.cards.hell.shake : 0;
    const shakeX = Math.sin(time * 37) * shake;
    ctx.translate(-game.camera.x + shakeX,
      -game.camera.y + Math.cos(time * 43) * shake);
    const visiblePlatforms = platforms.filter((platform) =>
      platform.x + platform.width >= game.camera.x - 90
      && platform.x <= game.camera.x + canvas.width + 90);
    drawEarth(ctx, visiblePlatforms, game.engine.images, art, game.camera, canvas);
    for (const platform of visiblePlatforms) drawPlatform(ctx, platform, art, game.engine.images);
    drawHellEffects(ctx, game.hell, platforms, art.hell, game.engine.images.effects);
    for (const hazard of hazards) drawHazard(ctx, hazard, art, game.engine.images.objects);
    for (const spikes of game.enemies.spikes) drawEnemySpikes(ctx, spikes,
      art.abilities, game.engine.images.effects);
    for (const shot of game.enemies.projectiles) drawEnemyShot(ctx, shot,
      art.abilities, game.engine.images.effects);
    for (const enemy of game.enemies.items) {
      if (enemy.alive) {
        drawEnemy(ctx, enemy, art.enemyColors, time, game.engine.images);
        drawEnemyHealthBar(ctx, enemy, art.enemyHealth);
        drawEnemyAbility(ctx, enemy, art.abilities);
      }
    }
    coins.forEach((coin, index) => drawCoin(ctx, coin, index, art, time,
      game.engine.images.pickups));
    for (const chest of game.chests.items) drawChest(ctx, chest, time,
      game.settings.cards.chestArt, false, game.engine.images.pickups);
    for (const [kind, pickup] of Object.entries(game.boosts.pickups)) {
      drawBoostPickup(ctx, pickup, kind, art.boosts, time, game.engine.images.pickups);
    }
    drawGoal(ctx, goal, game.reachGoal.progress(game.collectCoins),
      game.reachGoal.isReady(game.collectCoins, game.enemies.bossDefeated), art,
      game.engine.images.objects, time);
    drawDust(ctx, game.dust.particles, game.dust.settings.life, game.engine.images.effects);
    drawHealingBeam(ctx, player, game.camera, game.healingSkill, game.engine.images.effects);
    drawCompanion(ctx, game.companionSkill, player, art.abilities, time, game.engine.images.golem);
    drawPlayer(ctx, player, time, game.engine.images.explorer,
      game.engine.images.explorerActions, {
        attacking: game.swordSkill.attackTime > 0,
        landing: game.landingTime > 0,
        won: state === 'won',
      });
    drawMovementHint(ctx, player, game.idleTime, game.engine.images, time);
    drawSwordAttack(ctx, player, game.swordSkill, game.engine.images.effects);
    for (const shot of game.playerShots.items) drawAbilityShot(ctx, shot,
      art.abilities, game.engine.images.effects);
    drawHealthBar(ctx, player, game.playerHealth);
    drawParticles(ctx, game.effects.items, game.effects.settings, game.engine.images.effects);
    ctx.restore();
    drawHellWall(ctx, game.hell, game.camera, canvas, art.hell,
      shakeX, game.engine.images.effects);

    if (state !== 'playing') overlay.render(ctx, state);
    hud.render(ctx, game.collectCoins.count, game.bestScore.value);
    game.skillBar.render(ctx, game);
    game.boostBar.render(ctx, game.boosts, game.engine.images.effects);
    controls.render(ctx, state, game.music.muted);
    game.cardOverlay.render(ctx, game.chests, game, time);
  }
}
