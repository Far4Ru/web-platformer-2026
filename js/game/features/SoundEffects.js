export class SoundEffects {
  constructor(settings) {
    this.muted = false;
    this.settings = settings;
    this.lastPlayed = new Map();
    this.sounds = Object.fromEntries(Object.entries(settings).map(([name, config]) => {
      const audio = new Audio(config.src);
      audio.preload = 'auto';
      audio.volume = config.volume ?? 1;
      return [name, audio];
    }));
  }

  unlock() {}

  play(name) {
    if (this.muted || !this.sounds[name]) return;
    const now = typeof performance === 'undefined' ? Date.now() : performance.now();
    const minInterval = (this.settings[name].minInterval ?? 0) * 1000;
    if (now - (this.lastPlayed.get(name) ?? -Infinity) < minInterval) return;
    this.lastPlayed.set(name, now);
    const sound = this.sounds[name].cloneNode();
    sound.volume = this.sounds[name].volume;
    sound.play().catch(() => {});
  }
}
