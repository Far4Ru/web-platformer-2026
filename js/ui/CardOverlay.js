import { drawCard, drawChest } from '../render/cards.js';

const SKILL_EFFECTS = {
  healing: ['Лечит 1 HP каждые 15 с', 'Лечит 2 HP каждые 12 с',
    'Лечит 3 HP каждые 10 с'],
  bow: ['Точность стрел: 15%', 'Точность стрел: 40%',
    'Точность стрел: 100%'],
  sword: ['Короткий удар мечом', 'Удар мечом дальше',
    'Два удара подряд'],
  fireball: ['Один огненный шар', 'Три огненных шара',
    'Шесть шаров вращаются вокруг'],
  ice: ['Ледяной осколок', 'Катящийся ледяной шар',
    'Ледяные осколки вокруг'],
  companion: ['Компаньон следует за героем', 'Компаньон применяет умение I',
    'Компаньон применяет умение II'],
};

export function cardAtLevel(card, level) {
  return card.kind === 'skill' && SKILL_EFFECTS[card.id]
    ? {
      ...card, description: SKILL_EFFECTS[card.id][Math.max(0,
        Math.min(2, level - 1))]
    } : card;
}

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
      const elapsed = this.settings.rewardBannerDuration - chests.timer;
      const vanish = Math.max(0, 1 - elapsed / 0.28);
      if (vanish > 0) chests.rewardOffers.forEach((offer, index) => {
        if (index === chests.rewardIndex) return;
        ctx.save();
        ctx.globalAlpha = vanish;
        const level = offer.kind === 'skill' ? game[`${offer.id}Skill`].level + 1 : 0;
        drawCard(ctx, cardAtLevel(offer, level), this.rect(index),
          this.settings.rarityColors[offer.rarity], this.ui.font, palette,
          this.settings.rarityLabels[offer.rarity],
          level ? `${this.settings.uiText.level} ${level}` : '',
          false, 0, time, this.images);
        ctx.restore();
      });
      const progress = Math.max(0, Math.min(1, elapsed / 0.72));
      const eased = progress * progress * (3 - 2 * progress);
      const source = card.rarity === 'hell'
        ? { x: 364, y: 130, width: 232, height: 252 }
        : this.rect(chests.rewardIndex);
      const target = { x: 330, y: 106, width: 300, height: 326 };
      const rect = Object.fromEntries(Object.keys(target).map((key) =>
        [key, source[key] + (target[key] - source[key]) * eased]));
      const rayReveal = Math.max(0, Math.min(1, (elapsed - 0.72) / 0.35));
      if (rayReveal > 0) {
        ctx.save();
        ctx.globalAlpha = rayReveal * 0.94;
        ctx.drawImage(this.images.cardRewardRays, 205, 0, 550, 550);
        ctx.restore();
      }
      const level = chests.rewardLevel;
      ctx.save();
      ctx.translate(rect.x, rect.y);
      ctx.scale(rect.width / 232, rect.height / 252);
      drawCard(ctx, cardAtLevel(card, level),
        { x: 0, y: 0, width: 232, height: 252 },
        this.settings.rarityColors[card.rarity], this.ui.font, palette,
        this.settings.rarityLabels[card.rarity],
        level ? `${this.settings.uiText.level} ${level}` : '',
        true, 0, time, this.images);
      ctx.restore();
    } else if (chests.phase === 'hellCard') {
      ctx.fillText(this.settings.uiText.hell, this.world.width / 2, 80);
      const card = { ...chests.hellCard, rarity: 'hell' };
      drawCard(ctx, card, { x: 364, y: 130, width: 232, height: 252 },
        this.settings.rarityColors.hell, this.ui.font, palette, this.settings.rarityLabels.hell,
        '', true, chests.holdProgress / this.settings.confirmHoldSeconds, time, this.images);
      ctx.font = `18px ${this.ui.font}`;
      ctx.fillStyle = palette.text;
      ctx.drawImage(this.images.speechKeyUp, 370, 405, 31, 31);
      ctx.fillText('Подтвердить', 570, 426);
    } else {
      ctx.fillText(this.settings.uiText.choose, this.world.width / 2, 82);
      chests.offers.forEach((card, index) => {
        const level = card.kind === 'skill' ? game[`${card.id}Skill`].level + 1 : 0;
        drawCard(ctx, cardAtLevel(card, level), this.rect(index),
          this.settings.rarityColors[card.rarity], this.ui.font, palette,
          this.settings.rarityLabels[card.rarity],
          level ? `${this.settings.uiText.level} ${level}` : '',
          index === chests.selectedIndex,
          index === chests.selectedIndex ? chests.holdProgress / this.settings.confirmHoldSeconds : 0,
          time, this.images);
      });
      if (chests.rerolls > 0) {
        const button = this.ui.cards.reroll;
        ctx.drawImage(this.images.mayaButton, button.x, button.y, button.width, button.height);
        ctx.fillStyle = '#ffe9ad';
        ctx.font = `19px ${this.ui.font}`;
        ctx.drawImage(this.images.speechKeyDown,
          button.x + 16, button.y + 8, 30, 30);
        ctx.fillText(`Сменить карты (${chests.rerolls})`,
          this.world.width / 2 + 13, button.y + 30);
        if (chests.rerollProgress > 0) {
          ctx.fillStyle = this.settings.rarityColors.rare;
          ctx.fillRect(button.x + 12, button.y + button.height - 8,
            (button.width - 24) * Math.min(1, chests.rerollProgress / this.settings.confirmHoldSeconds), 4);
        }
      }
      this.drawChoiceHints(ctx, palette);
    }
    ctx.restore();
  }

  drawChoiceHints(ctx, palette) {
    const y = 472;
    const hints = [
      { icon: this.images.speechKeyLeft, x: 250 },
      { icon: this.images.speechKeyRight, x: 281 },
      { icon: this.images.speechKeyUp, x: 430 },
      { icon: this.images.speechKeyDown, x: 642 },
    ];
    hints.forEach(({ icon, x }) => ctx.drawImage(icon, x, y, 29, 29));
    ctx.fillStyle = palette.description;
    ctx.font = `16px ${this.ui.font}`;
    ctx.fillText('Выбор', 354, y + 20);
    ctx.fillText('Подтвердить', 550, y + 20);
    ctx.fillText('Перебросить', 748, y + 20);
  }
}
