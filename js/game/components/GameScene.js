import { drawPlatform } from '../../mock/platform.js';
import { drawHazard } from '../../mock/hazard.js';
import { drawEnemy, drawEnemyHealthBar } from '../../mock/enemy.js';
import { drawLetter } from '../../mock/letter.js';
import { drawGoal } from '../../mock/goal.js';
import { drawPlayer } from '../../mock/player.js';
import { drawHealthBar } from '../../mock/health.js';
import { drawHealingBeam, drawHealingPickup } from '../../mock/healingSkill.js';
import { drawSwordAttack, drawSwordPickup } from '../../mock/swordSkill.js';
import { drawDust } from '../../mock/dust.js';
import { drawBoostPickup } from '../../mock/boosts.js';
import { drawAbilityPickup, drawCompanion, drawAbilityShot,
  drawEnemyAbility, drawEnemyShot, drawEnemySpikes } from '../../mock/abilities.js';

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
    for (const spikes of game.enemies.spikes) drawEnemySpikes(ctx, spikes, art.abilities);
    for (const shot of game.enemies.projectiles) drawEnemyShot(ctx, shot, art.abilities);
    for (const enemy of game.enemies.items) {
      if (enemy.alive) {
        drawEnemy(ctx, enemy, art.enemyColors);
        drawEnemyHealthBar(ctx, enemy, art.enemyHealth);
        drawEnemyAbility(ctx, enemy, art.abilities);
      }
    }
    letters.forEach((letter, index) => drawLetter(ctx, letter, index, art, time));
    drawHealingPickup(ctx, game.healingSkill.pickup, game.healingSkill.settings.art, time);
    drawSwordPickup(ctx, game.swordSkill.pickup, game.swordSkill.settings.art, time);
    for (const kind of ['companion', 'fireball', 'ice', 'bow']) {
      drawAbilityPickup(ctx, game[`${kind}Skill`].pickup, art.abilities, kind, time);
    }
    for (const [kind, pickup] of Object.entries(game.boosts.pickups)) {
      drawBoostPickup(ctx, pickup, kind, art.boosts, time);
    }
    drawGoal(ctx, goal, game.reachGoal.progress(game.collectLetters),
      game.reachGoal.isReady(game.collectLetters, game.enemies.bossDefeated), art);
    drawDust(ctx, game.dust.particles, game.dust.settings.life);
    drawHealingBeam(ctx, player, game.camera, game.healingSkill);
    drawCompanion(ctx, game.companionSkill.companion, player, art.abilities);
    drawPlayer(ctx, player);
    drawSwordAttack(ctx, player, game.swordSkill);
    for (const shot of game.playerShots.items) drawAbilityShot(ctx, shot, art.abilities);
    drawHealthBar(ctx, player, game.playerHealth);
    ctx.restore();

    if (state !== 'playing') overlay.render(ctx, state);
    hud.render(ctx, game.collectLetters.count, letters.length, game.bestScore.value);
    game.skillBar.render(ctx, game);
    game.boostBar.render(ctx, game.boosts);
    controls.render(ctx, state);
  }
}
