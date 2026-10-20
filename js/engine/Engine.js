import { getCanvas, configureCanvas } from './canvas.js';
import { showLoadError } from './error.js';
import { GameLoop } from './GameLoop.js';
import { loadGameData } from './loadGameData.js';
import { loadImages } from './images.js';
import { Renderer } from './Renderer.js';
import { applyTexts } from './texts.js';
import { LoadingScreen } from './LoadingScreen.js';

export class Engine {
  constructor(selector) {
    this.canvas = getCanvas(selector);
    this.ctx = this.canvas.getContext('2d');
    configureCanvas(this.canvas);
    this.loadingScreen = new LoadingScreen(this.canvas, this.ctx);
  }

  async load(onProgress = () => {}) {
    await this.loadingScreen.load();
    const progress = (value) => {
      this.loadingScreen.setProgress(value);
      onProgress(value);
    };
    progress(0);
    const { settings, texts } = await loadGameData();
    progress(0.1);
    applyTexts(texts, this.canvas);
    this.settings = settings;
    this.texts = texts;
    this.images = await loadImages(settings.images, (done, total) =>
      progress(0.1 + 0.9 * done / total));
    this.renderer = new Renderer(this.ctx, this.canvas, settings.world);
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
    this.loadingScreen.stop();
    showLoadError(this.canvas, error);
  }
}
