export class BestScore {
  constructor(storageKey, maximum) {
    this.storageKey = storageKey;
    this.maximum = maximum;
    this.value = this.read();
  }

  read() {
    try {
      return Math.max(0, Number(localStorage.getItem(this.storageKey)) || 0);
    } catch {
      return 0;
    }
  }

  save(count) {
    const next = Math.min(this.maximum, Math.max(0, count));
    if (next <= this.value) return;
    this.value = next;
    try {
      localStorage.setItem(this.storageKey, String(this.value));
    } catch { /* Storage may be disabled. */ }
  }
}
