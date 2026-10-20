import { drawCard, drawChest, drawRarityBanner } from '../render/cards.js';
import { drawNineSlice } from '../render/uiImage.js';

export class CardOverlay {
  constructor(ui, settings, world, images) {
    this.ui = ui;
    this.settings = settings;
    this.world = world;
    this.images = images;
  }

  rect(index) {
    const { x, y, width, height, gap } = this.ui.cards;
    return { x: x + index * (width + gap), y, width, height };
  }

  hit(point, chests) {
    if (chests.phase === 'hellCard') return { kind: 'choose', index: 0 };
    if (chests.phase !== 'choice') return null;
    const button = this.ui.cards.reroll;
    if (chests.rerolls > 0 && point.x >= button.x && point.x <= button.x + button.width
      && point.y >= button.y && point.y <= button.y + button.height) return { kind: 'reroll' };
    const index = chests.offers.findIndex((_, i) => {
      const rect = this.rect(i);
      return point.x >= rect.x && point.x <= rect.x + rect.width
        && point.y >= rect.y && point.y <= rect.y + rect.height;
    });
    return index < 0 ? null : { kind: 'choose', index };
  }

  render(ctx, chests, game, time, viewport = {
    left: 0, top: 0, right: this.world.width, bottom: this.world.height,
  }) {
    if (!chests.active) return;
    const palette = this.ui.cards.colors;
    ctx.save();
    ctx.fillStyle = palette.veil;
    ctx.fillRect(viewport.left, viewport.top,
      viewport.right - viewport.left, viewport.bottom - viewport.top);
    ctx.textAlign = 'center';
    ctx.fillStyle = palette.text;
    ctx.font = `32px ${this.ui.font}`;
    if (chests.phase === 'opening') {
      ctx.fillText(this.settings.uiText.opening, this.world.width / 2, 190);
      drawChest(ctx, { x: 453, y: 230, width: 54, height: 54 },
        -0.001 - Math.max(0, this.settings.openingDuration - chests.timer), this.settings.chestArt, false, this.images.chestAnimation);
      ctx.font = `22px ${this.ui.font}`;
      ctx.fillText(this.settings.uiText.openingHint, this.world.width / 2, 345);
    } else if (chests.phase === 'transform') {
      ctx.fillText(this.settings.uiText.transform, this.world.width / 2, 240);
      drawChest(ctx, { x: 453, y: 267, width: 54, height: 54 },
        -0.001 - Math.max(0, this.settings.transformDuration - chests.timer), this.settings.chestArt, true, this.images.chestAnimation);
      ctx.fillStyle = this.settings.rarityColors.hell;
      ctx.fillText('!', this.world.width / 2, 300);
    } else if (chests.phase === 'reward') {
      const card = chests.rewardCard;
      drawRarityBanner(ctx, card, this.settings.rarityColors[card.rarity],
        this.settings.rarityLabels[card.rarity], this.settings.uiText.reward,
        palette, this.ui.font, this.world, time, this.images);
    } else if (chests.phase === 'hellCard') {
      ctx.fillText(this.settings.uiText.hell, this.world.width / 2, 80);
      const card = { ...chests.hellCard, rarity: 'hell' };
      drawCard(ctx, card, { x: 364, y: 130, width: 232, height: 252 },
        this.settings.rarityColors.hell, this.ui.font, palette, this.settings.rarityLabels.hell,
        '', true, chests.holdProgress / this.settings.confirmHoldSeconds, time, this.images);
      ctx.font = `18px ${this.ui.font}`;
      ctx.fillStyle = palette.text;
      ctx.fillText(this.settings.uiText.accept, this.world.width / 2, 430);
    } else {
      ctx.fillText(this.settings.uiText.choose, this.world.width / 2, 82);
      chests.offers.forEach((card, index) => drawCard(ctx, card, this.rect(index),
        this.settings.rarityColors[card.rarity], this.ui.font, palette,
        this.settings.rarityLabels[card.rarity],
        card.kind === 'skill' ? `${this.settings.uiText.level} ${game[`${card.id}Skill`].level + 1}` : '',
        index === chests.selectedIndex,
        index === chests.selectedIndex ? chests.holdProgress / this.settings.confirmHoldSeconds : 0,
        time, this.images));
      if (chests.rerolls > 0) {
        const button = this.ui.cards.reroll;
        drawNineSlice(ctx, this.images.button, button.x, button.y, button.width, button.height, 9);
        ctx.fillStyle = '#342619';
        ctx.font = `19px ${this.ui.font}`;
        ctx.fillText(`${this.settings.uiText.reroll} (${chests.rerolls})`,
          this.world.width / 2, button.y + 30);
        if (chests.rerollProgress > 0) {
          ctx.fillStyle = this.settings.rarityColors.rare;
          ctx.fillRect(button.x + 12, button.y + button.height - 8,
            (button.width - 24) * Math.min(1, chests.rerollProgress / this.settings.confirmHoldSeconds), 4);
        }
      }
      ctx.fillStyle = palette.description;
      ctx.font = `17px ${this.ui.font}`;
      ctx.fillText(this.settings.uiText.chooseHint, this.world.width / 2, 490);
    }
    ctx.restore();
  }
}
