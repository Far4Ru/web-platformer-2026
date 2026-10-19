export class SoundEffects {
  constructor(settings) {
    this.muted = false;
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
    const sound = this.sounds[name].cloneNode();
    sound.volume = this.sounds[name].volume;
    sound.play().catch(() => {});
  }
}
