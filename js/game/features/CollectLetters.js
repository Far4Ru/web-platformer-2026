import { Letter } from '../../entities/Letter.js';

export class CollectLetters {
  constructor(bounds) {
    this.items = bounds.map((item) => new Letter(item));
  }

  get count() {
    return this.items.filter((letter) => letter.collected).length;
  }

  reset() {
    this.items.forEach((letter) => letter.reset());
  }

  collect(player) {
    let changed = false;
    for (const letter of this.items) {
      if (letter.tryCollect(player)) changed = true;
    }
    return changed;
  }
}
