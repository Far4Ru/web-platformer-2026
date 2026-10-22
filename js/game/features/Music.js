export class Music {
  constructor(settings) {
    this.settings = settings;
    this.audio = null;
    this.currentName = null;
    this.cache = new Map();
    this.muted = false;
    this.active = false;
    if (settings.preload) this.preload(settings.preload);
  }

  config(name) {
    return name && this.settings.tracks?.[name]
      ? this.settings.tracks[name]
      : { src: this.settings.src, volume: this.settings.volume, loop: true };
  }

  preload(name) {
    const config = this.config(name);
    if (!config?.src || this.cache.has(name)) return this.cache.get(name) ?? null;
    const audio = new Audio(config.src);
    audio.preload = 'auto';
    audio.load?.();
    this.cache.set(name, audio);
    return audio;
  }

  play(name = null) {
    this.active = true;
    const nextName = name ?? this.currentName ?? 'default';
    const config = this.config(nextName);
    if (!config?.src) return;
    if (nextName !== this.currentName || !this.audio) {
      this.audio?.pause();
      this.preload(nextName);
      this.currentName = nextName;
      this.audio = this.cache.get(nextName);
      this.audio.currentTime = 0;
    }
    this.audio.loop = config.loop ?? true;
    this.audio.volume = config.volume ?? this.settings.volume ?? 0.4;
    this.audio.muted = this.muted;
    if (!this.muted) this.audio.play().catch(() => {});
  }

  pause() {
    this.active = false;
    this.audio?.pause();
  }

  toggle() {
    this.muted = !this.muted;
    for (const audio of this.cache.values()) audio.muted = this.muted;
    if (this.active && !this.muted) this.play();
  }
}
