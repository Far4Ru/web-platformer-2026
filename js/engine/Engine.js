import { getCanvas, configureCanvas } from './canvas.js';
import { showLoadError } from './error.js';
import { GameLoop } from './GameLoop.js';
import { loadGameData } from './loadGameData.js';
import { Renderer } from './Renderer.js';
import { applyTexts } from './texts.js';

export class Engine {
  constructor(selector) {
    this.canvas = getCanvas(selector);
    this.ctx = this.canvas.getContext('2d');
  }

  async load() {
    const { settings, texts } = await loadGameData();
    configureCanvas(this.canvas, settings);
    applyTexts(texts, this.canvas);
    this.settings = settings;
    this.texts = texts;
    this.renderer = new Renderer(this.ctx, this.canvas);
  }

  start({ update, scene }) {
    if (!this.gameLoop) {
      this.gameLoop = new GameLoop(
        update,
        (time) => this.renderer.render(scene, time),
        this.settings.maxFrameStep,
      );
    }
    this.gameLoop.start();
  }

  resetTime() {
    this.gameLoop?.resetTime();
  }

  showError(error) {
    showLoadError(this.canvas, error);
  }
}
