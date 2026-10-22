import { SkillPickup } from '../../entities/SkillPickup.js';

export class Chests {
  constructor(bounds, settings, random = Math.random) {
    this.items = bounds.map((entry) => new SkillPickup(entry));
    this.settings = settings;
    this.random = random;
    this.rerolls = 0;
    this.blessed = false;
    this.hellUsed = false;
    this.hellCard = null;
    this.rewardCard = null;
    this.rewardOffers = [];
    this.rewardIndex = 0;
    this.rewardLevel = 0;
    this.offers = [];
    this.selectedIndex = 0;
    this.phase = null;
    this.timer = 0;
    this.holdSource = null;
    this.holdProgress = 0;
    this.rerollHeld = false;
    this.rerollProgress = 0;
  }

  get active() { return this.phase !== null; }

  pickWeighted(cards) {
    if (!cards.length) return null;
    const rarities = [...new Set(cards.map((card) => card.rarity))];
    const total = rarities.reduce((sum, rarity) =>
      sum + Math.max(0, this.settings.rarityWeights[rarity] ?? 0), 0);
    let roll = this.random() * total;
    const rarity = total > 0 ? rarities.find((entry) =>
      (roll -= Math.max(0, this.settings.rarityWeights[entry] ?? 0)) < 0)
      ?? rarities.at(-1) : rarities[0];
    const tier = cards.filter((card) => card.rarity === rarity);
    return tier[Math.floor(this.random() * tier.length)];
  }

  drawOffers(game) {
    const eligible = this.settings.entries.filter((card) => {
      if (card.kind === 'fake') return false;
      if (card.kind === 'skill' && game[`${card.id}Skill`].level >= 3) return false;
      if (card.id === 'damage' && game.cardBonuses.damage >= 1) return false;
      if (card.id === 'speed' && game.cardBonuses.speed >= 2) return false;
      if (card.id === 'blessing' && (this.blessed || this.hellUsed)) return false;
      if (card.id === 'noBoss' && game.enemies.bossDefeated) return false;
      return true;
    });
    const offers = [];
    while (offers.length < this.settings.choiceCount && eligible.length) {
      const card = this.pickWeighted(eligible);
      offers.push(card);
      eligible.splice(eligible.indexOf(card), 1);
    }
    const attacks = ['sword', 'fireball', 'ice', 'bow'];
    if (attacks.every((kind) => game[`${kind}Skill`].level === 0)
      && !offers.some((card) => attacks.includes(card.id))) {
      const candidates = this.settings.entries.filter((card) => attacks.includes(card.id));
      offers[offers.length - 1] = this.pickWeighted(candidates);
    }
    if (!offers.some((card) => card.kind === 'skill')) {
      const unowned = this.settings.entries.filter((card) => card.kind === 'skill'
        && game[`${card.id}Skill`].level === 0);
      if (unowned.length) offers[offers.length - 1] = this.pickWeighted(unowned);
    }
    const fakePool = [...this.settings.entries.filter((card) => card.kind === 'fake'),
      ...(this.settings.fakeVariants ?? [])];
    if (fakePool.length && offers.length && this.random() < this.settings.fakeChestChance) {
      const replaceable = offers.map((card, index) => card.kind === 'skill' ? -1 : index)
        .filter((index) => index >= 0);
      const slots = replaceable.length ? replaceable : offers.map((_, index) => index);
      const slot = slots[Math.floor(this.random() * slots.length)];
      offers[slot] = fakePool[Math.floor(this.random() * fakePool.length)];
    }
    this.offers = offers;
    this.selectedIndex = 0;
    this.cancelHold();
  }

  moveSelection(direction) {
    if (this.phase !== 'choice' || !this.offers.length) return;
    this.selectedIndex = (this.selectedIndex + direction + this.offers.length) % this.offers.length;
    this.cancelHold();
  }

  select(index) {
    if (this.phase !== 'choice' || !this.offers[index]) return false;
    if (this.selectedIndex !== index) this.cancelHold();
    this.selectedIndex = index;
    return true;
  }

  startHold(source) {
    if (this.phase !== 'choice' && this.phase !== 'hellCard') return false;
    if (this.holdSource && this.holdSource !== source) return false;
    this.holdSource = source;
    return true;
  }

  cancelHold(source) {
    if (!source || source === 'key:ArrowDown') {
      this.rerollHeld = false;
      this.rerollProgress = 0;
    }
    if (source && this.holdSource !== source) return;
    this.holdSource = null;
    this.holdProgress = 0;
  }

  update(dt, player, game) {
    if (this.phase === 'transform' || this.phase === 'opening') {
      this.timer -= dt;
      if (this.timer <= 0) {
        const transformed = this.phase === 'transform';
        this.phase = transformed ? 'hellCard' : 'choice';
        if (transformed) game.sounds?.play('hellCard');
      }
      return;
    }
    if (this.phase === 'reward') {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.phase = null;
        this.rewardCard = null;
        this.rewardOffers = [];
        game.engine.resetTime();
      }
      return;
    }
    if (this.active) {
      if (this.rerollHeld && this.phase === 'choice') {
        this.rerollProgress += dt;
        if (this.rerollProgress >= this.settings.confirmHoldSeconds) this.reroll(game);
      }
      if (this.holdSource) {
        this.holdProgress += dt;
        if (this.holdProgress >= this.settings.confirmHoldSeconds)
          this.choose(this.selectedIndex, game);
      }
      return;
    }
    const chest = this.items.find((item) => item.tryCollect(player));
    if (!chest) return;
    game.sounds?.play('chest');
    game.effects?.emit(chest.x + chest.width / 2, chest.y + chest.height / 2, 'coin');
    if (!this.hellUsed && !this.blessed && this.random() < this.settings.hellChance) {
      this.hellUsed = true;
      this.hellCard = this.settings.hellEntries[
        Math.floor(this.random() * this.settings.hellEntries.length)];
      this.phase = 'transform';
      this.timer = this.settings.transformDuration;
    } else {
      this.drawOffers(game);
      this.phase = 'opening';
      this.timer = this.settings.openingDuration;
    }
    game.input.clear();
  }

  reroll(game) {
    if (this.phase !== 'choice' || this.rerolls < 1) return false;
    this.rerolls--;
    this.cancelHold();
    this.drawOffers(game);
    game.sounds?.play('cardReroll');
    return true;
  }

  startRerollHold() {
    if (this.phase !== 'choice' || this.rerolls < 1) return;
    this.rerollHeld = true;
  }

  choose(index, game) {
    if (this.phase === 'hellCard') {
      this.rewardCard = { ...this.hellCard, rarity: 'hell' };
      this.rewardOffers = [this.rewardCard];
      this.rewardIndex = 0;
      this.rewardLevel = 0;
      if (game.hell.activate(this.hellCard.id, game))
        game.dialogue?.onHellMode(this.hellCard.id);
      game.sounds?.play('card');
      this.phase = 'reward';
      this.timer = this.settings.rewardBannerDuration;
      this.hellCard = null;
      this.cancelHold();
      game.input.suppressUntilRelease?.(['Space', 'KeyW', 'ArrowUp']);
      game.input.clear();
      return true;
    }
    if (this.phase !== 'choice' || !this.offers[index]) return false;
    const card = this.offers[index];
    this.rewardOffers = [...this.offers];
    this.rewardIndex = index;
    this.apply(card, game);
    this.rewardLevel = card.kind === 'skill' ? game[`${card.id}Skill`].level : 0;
    game.sounds?.play(card.kind === 'fake' ? 'fakeCard' : 'card');
    this.rewardCard = card;
    this.offers = [];
    this.phase = 'reward';
    this.timer = this.settings.rewardBannerDuration;
    this.cancelHold();
    game.input.suppressUntilRelease?.(['Space', 'KeyW', 'ArrowUp']);
    game.input.clear();
    return true;
  }

  apply(card, game) {
    if (card.kind === 'skill') {
      const skill = game[`${card.id}Skill`];
      const previousLevel = skill.level;
      skill.level = Math.min(3, previousLevel + 1);
      if (card.id === 'companion' && game.companionSkill.health <= 0)
        game.companionSkill.health = 2;
      if (skill.level > previousLevel) game.dialogue?.onPlayerSkill(card.id, skill.level);
      return;
    }
    if (card.id === 'health') game.playerHealth.increaseMax(1);
    else if (card.id === 'damage') game.cardBonuses.damage = Math.min(1,
      game.cardBonuses.damage + 1);
    else if (card.id === 'speed') game.cardBonuses.speed = Math.min(2,
      game.cardBonuses.speed * 1.5);
    else if (card.id === 'simplify' || card.id === 'complicate') {
      game.enemies.changeDifficulty(card.id === 'simplify' ? -1 : 1,
        card.id === 'simplify' ? 1 : 0);
    } else if (card.id === 'reroll') this.rerolls++;
    else if (card.id === 'noBoss') {
      const index = game.enemies.items.findIndex((enemy) => enemy.boss && enemy.alive);
      if (index >= 0) {
        game.enemies.items[index].health = 0;
        game.enemies.items[index].dropped = true;
        game.defeatedEnemies?.add(index);
        game.collectCoins.discardDrops(index);
      }
      game.collectCoins.grant(15);
      game.bestScore?.save(game.collectCoins.count);
    } else if (card.id === 'blessing') this.blessed = true;
    game.dialogue?.onCardUpgrade(card.id);
  }
}
