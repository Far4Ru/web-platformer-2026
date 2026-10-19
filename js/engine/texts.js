import { loadJson } from './load.js';

export function loadTexts() {
  return loadJson('texts.json');
}

export function applyTexts(texts, canvas) {
  document.title = texts.pageTitle;
  canvas.setAttribute('aria-label', texts.canvasLabel);
}
