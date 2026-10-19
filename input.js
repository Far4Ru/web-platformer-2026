const KEY_ACTIONS = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', Space: 'jump', KeyW: 'jump', ArrowUp: 'jump' };

export class Input {
  constructor() {
    this.keyboard = new Set();
    this.pointers = new Map();
    this.jumpQueued = false;
    window.addEventListener('keydown', (event) => {
      const action = KEY_ACTIONS[event.code];
      if (!action) return;
      event.preventDefault();
      if (action === 'jump' && !this.keyboard.has(event.code)) this.jumpQueued = true;
      this.keyboard.add(event.code);
    });
    window.addEventListener('keyup', (event) => {
      if (KEY_ACTIONS[event.code]) this.keyboard.delete(event.code);
    });
    window.addEventListener('blur', () => this.clear());

    for (const button of document.querySelectorAll('[data-control]')) {
      button.addEventListener('pointerdown', (event) => {
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        const action = button.dataset.control;
        if (action === 'jump' && ![...this.pointers.values()].includes('jump')) this.jumpQueued = true;
        this.pointers.set(event.pointerId, action);
      });
      const release = (event) => this.pointers.delete(event.pointerId);
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
    }
  }

  get horizontal() {
    const actions = [...this.keyboard].map((key) => KEY_ACTIONS[key]).concat([...this.pointers.values()]);
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
