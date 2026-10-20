import { Game } from './game/Game.js';
import { Engine } from './engine/Engine.js';
import { enterMobileFullscreen } from './engine/fullscreen.js';

window.Engine = new Engine('#game');

try {
  await window.Engine.load();
  window.Engine.loadingScreen.setReady();
  let begun = false;
  const begin = (event) => {
    if (begun) return;
    begun = true;
    event?.preventDefault();
    event?.stopImmediatePropagation();
    window.removeEventListener('keydown', continueOnKey, true);
    window.Engine.canvas.removeEventListener('pointerdown', begin, true);
    window.Engine.loadingScreen.stop();
    window.Game = new Game(window.Engine);
    window.Game.start();
    window.Game.restart();
    enterMobileFullscreen();
  };
  const continueOnKey = (event) => {
    if (event.repeat || event.key === 'Process' || event.key === 'Unidentified') return;
    begin(event);
  };
  window.addEventListener('keydown', continueOnKey, true);
  window.Engine.canvas.addEventListener('pointerdown', begin, true);
} catch (error) {
  window.Engine.showError(error);
}
