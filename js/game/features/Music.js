export class Music {
  constructor(settings) {
    this.settings = settings;
    this.audio = null;
    this.muted = false;
    this.active = false;
  }

  play() {
    this.active = true;
    if (!this.audio) {
      this.audio = new Audio(this.settings.src);
      this.audio.loop = true;
      this.audio.volume = this.settings.volume;
    }
    if (!this.muted) this.audio.play().catch(() => {});
  }

  pause() {
    this.active = false;
    this.audio?.pause();
  }

  toggle() {
    this.muted = !this.muted;
    if (this.audio) this.audio.muted = this.muted;
    if (this.active && !this.muted) this.play();
  }
}
