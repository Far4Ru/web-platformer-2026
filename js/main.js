import { Game } from './game/Game.js';
import { Engine } from './engine/Engine.js';

window.Engine = new Engine('#game');

try {
  await window.Engine.load();
  window.Game = new Game(window.Engine);
  window.Game.start();
} catch (error) {
  window.Engine.showError(error);
}
