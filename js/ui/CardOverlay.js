import { drawCard, drawChest, drawRarityBanner } from '../mock/cards.js';

export class CardOverlay {
  constructor(ui, settings, world) {
    this.ui = ui;
    this.settings = settings;
    this.world = world;
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

  render(ctx, chests, game, time) {
    if (!chests.active) return;
    const palette = this.ui.cards.colors;
    ctx.save();
    ctx.fillStyle = palette.veil;
    ctx.fillRect(0, 0, this.world.width, this.world.height);
    ctx.textAlign = 'center';
    ctx.fillStyle = palette.text;
    ctx.font = `32px ${this.ui.font}`;
    if (chests.phase === 'opening') {
      ctx.fillText(this.settings.uiText.opening, this.world.width / 2, 190);
      drawChest(ctx, { x: 453, y: 230, width: 54, height: 54 },
        chests.timer * 12, this.settings.chestArt);
      ctx.font = `22px ${this.ui.font}`;
      ctx.fillText(this.settings.uiText.openingHint, this.world.width / 2, 345);
    } else if (chests.phase === 'transform') {
      ctx.fillText(this.settings.uiText.transform, this.world.width / 2, 240);
      drawChest(ctx, { x: 453, y: 267, width: 54, height: 54 },
        chests.timer * 12, this.settings.chestArt, true);
      ctx.fillStyle = this.settings.rarityColors.hell;
      ctx.fillText('!', this.world.width / 2, 300);
    } else if (chests.phase === 'reward') {
      const card = chests.rewardCard;
      drawRarityBanner(ctx, card, this.settings.rarityColors[card.rarity],
        this.settings.rarityLabels[card.rarity], this.settings.uiText.reward,
        palette, this.ui.font, this.world, time);
    } else if (chests.phase === 'hellCard') {
      ctx.fillText(this.settings.uiText.hell, this.world.width / 2, 80);
      const card = { ...chests.hellCard, rarity: 'hell' };
      drawCard(ctx, card, { x: 364, y: 130, width: 232, height: 252 },
        this.settings.rarityColors.hell, this.ui.font, palette, this.settings.rarityLabels.hell,
        '', true, chests.holdProgress / this.settings.confirmHoldSeconds, time);
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
        time));
      if (chests.rerolls > 0) {
        const button = this.ui.cards.reroll;
        ctx.fillStyle = palette.reroll;
        ctx.fillRect(button.x, button.y, button.width, button.height);
        ctx.fillStyle = palette.text;
        ctx.font = `19px ${this.ui.font}`;
        ctx.fillText(`${this.settings.uiText.reroll} (${chests.rerolls})`,
          this.world.width / 2, button.y + 30);
      }
      ctx.fillStyle = palette.description;
      ctx.font = `17px ${this.ui.font}`;
      ctx.fillText(this.settings.uiText.chooseHint, this.world.width / 2, 490);
    }
    ctx.restore();
  }
}
