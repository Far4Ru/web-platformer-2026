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
import { drawSpeechBubble } from '../../render/speechBubble.js';

export function visibleGroundPlatforms(platforms, left, right) {
  return platforms.filter((platform) =>
    platform.x + platform.width >= left - 90 && platform.x <= right + 90);
}

export function goalNotice(reachGoal, coins) {
  const needed = Math.max(0,
    Math.ceil(coins.total * reachGoal.openFraction) - coins.count);
  if (needed > 0) return `Вижу недостойного!\nТебе не хватает ${needed} монет`;
  if (reachGoal.phase === 'charging' || reachGoal.phase === 'opening')
    return 'Портал открывается...';
  return reachGoal.phase === 'entering' ? '' : 'Портал открыт — войди в арку';
}

export class GameScene {
  constructor(game, art) {
    this.game = game;
    this.art = art;
  }

  render(ctx, canvas, time, viewport = { left: 0, top: 0,
    right: canvas.width, bottom: canvas.height }) {
    const { game, art } = this;
    const platforms = game.platforms.items;
    const coins = game.collectCoins.items;
    const hazards = game.hazards.items;
    const goal = game.reachGoal.goal;
    const { player, state, overlay, hud, controls } = game;
    game.camera.setViewport(viewport, player);
    const portrait = viewport.right - viewport.left < canvas.width * 0.8;

    game.background.render(ctx, canvas, time, game.camera, game.level.width,
      viewport, game.level.environment);
    const { counters, icons } = game.settings.ui;
    counters.score.x = viewport.left + 20;
    counters.best.x = viewport.left + 20;
    icons.sound.x = viewport.right - 192;
    icons.pause.x = viewport.right - 130;
    icons.restart.x = viewport.right - 68;
    counters.score.y = viewport.top + 18;
    counters.best.y = viewport.top + 78;
    for (const rect of Object.values(icons)) rect.y = viewport.top + 18;
    controls.layout(viewport);
    ctx.save();
    const shake = game.hell.kind ? game.settings.cards.hell.shake : 0;
    const shakeX = Math.sin(time * 37) * shake;
    ctx.translate(-game.camera.x + shakeX,
      -game.camera.y + Math.cos(time * 43) * shake);
    const visibleLeft = game.camera.x + viewport.left;
    const visibleRight = game.camera.x + viewport.right;
    const visibleTop = game.camera.y + viewport.top;
    const visibleBottom = game.camera.y + viewport.bottom;
    const inView = (item, margin = 80) => item.x + item.width >= visibleLeft - margin
      && item.x <= visibleRight + margin
      && item.y + item.height >= visibleTop - margin
      && item.y <= visibleBottom + margin;
    const groundPlatforms = visibleGroundPlatforms(platforms, visibleLeft, visibleRight);
    drawEarth(ctx, groundPlatforms, game.engine.images, art, game.camera, viewport);
    for (const platform of groundPlatforms)
      drawPlatform(ctx, platform, art, game.engine.images, time, player, game.grassMotion);
    drawHellEffects(ctx, game.hell, platforms, art.hell,
      game.engine.images.effects, game.engine.images.spikeVariants,
      game.engine.images.arrowAnimation, time);
    for (const hazard of hazards) if (inView(hazard))
      drawHazard(ctx, hazard, art, game.engine.images.spikeVariants);
    for (const spikes of game.enemies.spikes) if (inView(spikes)) drawEnemySpikes(ctx, spikes,
      art.abilities, game.engine.images.spikeVariants);
    for (const shot of game.enemies.projectiles) if (inView(shot)) drawEnemyShot(ctx, shot,
      art.abilities, game.engine.images.effects,
      game.engine.images.enemyShotAnimation, time);
    for (const enemy of game.enemies.items) {
      if (enemy.alive && inView(enemy)) {
        drawEnemy(ctx, enemy, art.enemyColors, time, game.engine.images);
        drawEnemyHealthBar(ctx, enemy, art.enemyHealth);
        drawEnemyAbility(ctx, enemy, art.abilities);
      }
    }
    coins.forEach((coin, index) => {
      if (inView(coin)) drawCoin(ctx, coin, index, art, time,
        game.engine.images.coinAnimation);
    });
    for (const chest of game.chests.items) if (inView(chest)) drawChest(ctx, chest, time,
      game.settings.cards.chestArt, false, game.engine.images.chestAnimation);
    for (const [kind, pickup] of Object.entries(game.boosts.pickups)) {
      if (inView(pickup)) drawBoostPickup(ctx, pickup, game.boosts.kindFor(kind),
        art.boosts, time, game.engine.images.pickups);
    }
    const goalProgress = game.reachGoal.progress(game.collectCoins);
    const goalReady = game.reachGoal.isReady(game.collectCoins);
    const goalNear = Math.abs(player.x + player.width / 2 - (goal.x + goal.width / 2)) < 185
      && Math.abs(player.y + player.height / 2 - (goal.y + goal.portalOffsetY)) < 135;
    const notice = state === 'playing' && goalNear
      ? goalNotice(game.reachGoal, game.collectCoins) : '';
    drawGoal(ctx, goal, goalProgress, goalReady, art,
      game.engine.images.objects, time, game.reachGoal.phase,
      game.reachGoal.phaseTime, notice);
    drawDust(ctx, game.dust.particles, game.dust.settings.life, game.engine.images.effects);
    drawHealingBeam(ctx, player, game.camera, game.healingSkill,
      game.engine.images.effects, game.engine.images.healingAnimation);
    drawCompanion(ctx, game.companionSkill, player, art.abilities, time, game.engine.images.golem);
    const entering = game.reachGoal.phase === 'entering'
      ? Math.min(1, game.reachGoal.phaseTime / game.reachGoal.enterDuration) : 0;
    ctx.save();
    if (entering) {
      const playerCenterX = player.x + player.width / 2;
      const playerCenterY = player.y + player.height / 2;
      ctx.translate((goal.x + goal.width / 2 - playerCenterX) * entering,
        (goal.y + goal.portalOffsetY - playerCenterY) * entering);
      ctx.translate(playerCenterX, playerCenterY);
      ctx.scale(1 - entering * 0.8, 1 - entering * 0.8);
      ctx.translate(-playerCenterX, -playerCenterY);
      ctx.globalAlpha = 1 - entering;
    }
    drawPlayer(ctx, player, time, game.engine.images.explorer,
      game.engine.images.explorerActions, {
        attacking: game.swordSkill.attackTime > 0,
        landing: game.landingTime > 0,
        won: state === 'won',
      });
    ctx.restore();
    if (state === 'playing') {
      const bubbleBounds = {
        left: visibleLeft,
        right: visibleRight,
        top: game.camera.y + viewport.top,
      };
      if (game.dialogue.text) drawSpeechBubble(ctx, game.engine.images, {
        anchorX: player.x + player.width / 2,
        anchorY: player.y,
        text: game.dialogue.text,
        visibleCharacters: game.dialogue.visibleCharacters,
        alpha: game.dialogue.alpha,
        ...bubbleBounds,
      });
      else drawMovementHint(ctx, player, game.idleTime, game.engine.images, time, bubbleBounds);
    }
    drawSwordAttack(ctx, player, game.swordSkill, game.engine.images.effects,
      game.engine.images.swordAnimation);
    for (const shot of game.playerShots.items) if (inView(shot)) drawAbilityShot(ctx, shot,
      art.abilities, game.engine.images.effects, {
        fireball: game.engine.images.fireballAnimation,
        ice: game.engine.images.iceAnimation,
        arrow: game.engine.images.arrowAnimation,
      }, time);
    drawHealthBar(ctx, player, game.playerHealth);
    drawParticles(ctx, game.effects.items, game.effects.settings, game.engine.images.effects);
    ctx.restore();
    drawHellWall(ctx, game.hell, game.camera, canvas, art.hell,
      shakeX, game.engine.images.effects, viewport);

    if (state !== 'playing') overlay.render(ctx, state, viewport, time, game);
    hud.render(ctx, game.collectCoins.count, game.bestScore.value, time);
    ctx.save();
    ctx.font = `16px ${game.settings.ui.font}`;
    ctx.textAlign = 'left';
    ctx.fillStyle = '#fff0c7';
    ctx.shadowColor = '#17251b';
    ctx.shadowBlur = 4;
    ctx.fillText(`${game.stageIndex + 1}/${game.stageCount} · ${game.level.name}`,
      counters.score.x, viewport.top + 139);
    ctx.restore();
    if (state === 'playing') {
      game.skillBar.render(ctx, game, portrait ? viewport.top + 165 : null);
      game.boostBar.render(ctx, game.boosts, game.engine.images.effects,
        portrait ? viewport.top + 220 : null);
    }
    controls.render(ctx, state, game.music.muted);
    game.cardOverlay.render(ctx, game.chests, game, time, viewport);
  }
}
