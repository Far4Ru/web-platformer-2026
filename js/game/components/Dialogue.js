const TYPE_SPEED = 16;
const HOLD_TIME = 0.8;
const FADE_TIME = 0.28;

function nearby(player, object, horizontal, vertical) {
  return Math.abs(object.x + object.width / 2 - (player.x + player.width / 2)) < horizontal
    && Math.abs(object.y + object.height / 2 - (player.y + player.height / 2)) < vertical;
}

export class Dialogue {
  constructor(texts) {
    this.texts = texts;
    this.restartCount = 0;
    this.reset();
  }

  reset(replay = false) {
    const restartLines = this.texts.restart ?? [];
    const opening = replay && restartLines.length
      ? restartLines[this.restartCount++ % restartLines.length] : this.texts.opening;
    this.current = this.makeLine(opening);
    this.seen = new Set();
    this.seenEnemies = new Set();
    this.seenChests = new Set();
    this.seenPlatforms = new Set();
    this.counts = {};
    this.cooldowns = {};
    this.coinSeen = false;
  }

  makeLine(text) {
    return { text, elapsed: 0,
      duration: text.length / TYPE_SPEED + HOLD_TIME + FADE_TIME };
  }

  say(key, { once = false, cooldown = 0, phrases = this.texts[key] } = {}) {
    if ((once && this.seen.has(key)) || (this.cooldowns[key] ?? 0) > 0) return false;
    if (!phrases) return false;
    const variants = Array.isArray(phrases) ? phrases : [phrases];
    const count = this.counts[key] ?? 0;
    const text = variants[count % variants.length];
    this.counts[key] = count + 1;
    this.seen.add(key);
    this.cooldowns[key] = cooldown;
    this.current = this.makeLine(text);
    return true;
  }

  update(dt, player, { coins = [], hazards = [], enemies = [], chests = [],
    goal = null, surface = null } = {}) {
    for (const key of Object.keys(this.cooldowns))
      this.cooldowns[key] = Math.max(0, this.cooldowns[key] - dt);
    if (this.current) {
      this.current.elapsed += dt;
      if (this.current.elapsed >= this.current.duration) this.current = null;
    }

    if (surface === 'ice') this.say('ice', { once: true });
    if (surface === 'swamp') this.say('swamp', { once: true });
    if (goal && nearby(player, goal, 180, 150)) this.say('portal', { once: true });
    for (const chest of chests) {
      if (chest.collected || this.seenChests.has(chest) || !nearby(player, chest, 210, 120)) continue;
      if (this.say('chest', { cooldown: 7 })) this.seenChests.add(chest);
      break;
    }

    if (!this.coinSeen && coins.some((coin) => !coin.collected && coin.active !== false
      && nearby(player, coin, 190, 110)))
      this.coinSeen = this.say('firstCoin', { once: true });

    for (const enemy of enemies) {
      if (!enemy.alive || this.seenEnemies.has(enemy) || !nearby(player, enemy, 215, 135)) continue;
      let spoken;
      if (enemy.boss) spoken = this.say('boss', { once: true });
      else if (!this.seen.has('firstEnemy')) spoken = this.say('firstEnemy', { once: true });
      else spoken = this.say('enemyAgain', { cooldown: 12 });
      if (spoken) this.seenEnemies.add(enemy);
      break;
    }
    if (!this.seen.has('firstSpikes') && hazards.some((hazard) =>
      hazard.height > 2 && nearby(player, hazard, 180, 115)))
      this.say('firstSpikes', { once: true });
  }

  onEnemyDefeated() {
    this.say('enemyDefeated', { cooldown: 8 });
  }

  onBossDefeated() {
    this.say('bossDefeated', { once: true });
  }

  onCoinsCollected() {
    this.say('coinPickup', { cooldown: 12 });
  }

  onDamage(source, lowHealth) {
    this.say(source === 'spikes' ? 'hurtSpikes' : 'hurtEnemy', { cooldown: 9 });
    if (lowHealth) this.say('lowHealth', { once: true });
  }

  onBoost(kind) {
    this.say(`boost${kind[0].toUpperCase()}${kind.slice(1)}`, { once: true });
  }

  onHealing() {
    this.say('healing', { cooldown: 25 });
  }

  onPlatformBroken(platform) {
    if (this.seenPlatforms.has(platform)) return;
    if (this.say('fakePlatform', { cooldown: 8 })) this.seenPlatforms.add(platform);
  }

  onCoinProgress(progress) {
    if (progress >= 0.4) this.say('coinsForty', { once: true });
    if (progress >= 0.6) this.say('coinsSixty', { once: true });
    if (progress >= 0.8) this.say('coinsEighty', { once: true });
  }

  onPortalReady() {
    this.say('portalReady', { once: true });
  }

  onPlayerSkill(id, level) {
    const kind = level === 1 ? 'new' : 'upgrade';
    this.say(`playerSkill:${id}:${kind}`, {
      phrases: this.texts.playerSkills?.[id]?.[kind],
    });
  }

  onCardUpgrade(id) {
    this.say(`cardUpgrade:${id}`, { phrases: this.texts.cardUpgrades?.[id] });
  }

  onHellMode(kind) {
    this.say(`hellMode:${kind}`, {
      phrases: this.texts.hellModes?.[kind], once: true,
    });
  }

  onEnemySkill(skill, enemy, player) {
    if (!nearby(player, enemy, 260, 160)) return;
    this.say(`enemySkill:${skill}`, {
      phrases: this.texts.enemySkills?.[skill], once: true,
    });
  }

  onSpellHit(kind) {
    this.say(`spellHit:${kind}`, {
      phrases: this.texts.spellHits?.[kind], cooldown: 5,
    });
  }

  get text() {
    return this.current?.text ?? '';
  }

  get visibleCharacters() {
    return Math.min(this.text.length, Math.floor((this.current?.elapsed ?? 0) * TYPE_SPEED));
  }

  get alpha() {
    if (!this.current) return 0;
    return Math.max(0, Math.min(1,
      (this.current.duration - this.current.elapsed) / FADE_TIME));
  }
}
