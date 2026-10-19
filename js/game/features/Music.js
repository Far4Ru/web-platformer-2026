export class Music {
  constructor(settings) {
    this.audio = new Audio(settings.src);
    this.audio.loop = true;
    this.audio.volume = settings.volume;
    this.muted = false;
    this.active = false;
  }

  play() {
    this.active = true;
    if (!this.muted) this.audio.play().catch(() => {});
  }

  pause() {
    this.active = false;
    this.audio.pause();
  }

  toggle() {
    this.muted = !this.muted;
    this.audio.muted = this.muted;
    if (this.active && !this.muted) this.audio.play().catch(() => {});
  }
}
