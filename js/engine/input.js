export class Input {
  constructor(keyActions) {
    this.keyActions = keyActions;
    this.keyboard = new Set();
    this.pointers = new Map();
    this.jumpQueued = false;
    window.addEventListener('keydown', (event) => {
      const action = this.keyActions[event.code];
      if (!action) return;
      event.preventDefault();
      if (action === 'jump' && !this.keyboard.has(event.code)) this.jumpQueued = true;
      this.keyboard.add(event.code);
    });
    window.addEventListener('keyup', (event) => {
      if (this.keyActions[event.code]) this.keyboard.delete(event.code);
    });
    window.addEventListener('blur', () => this.clear());
  }

  pressPointer(id, action) {
    if (action === 'jump' && ![...this.pointers.values()].includes('jump')) this.jumpQueued = true;
    this.pointers.set(id, action);
  }

  releasePointer(id) { this.pointers.delete(id); }

  get horizontal() {
    const actions = [...this.keyboard].map((key) => this.keyActions[key]).concat([...this.pointers.values()]);
    return Number(actions.includes('right')) - Number(actions.includes('left'));
  }

  consumeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  clear() {
    this.keyboard.clear();
    this.pointers.clear();
    this.jumpQueued = false;
  }
}
