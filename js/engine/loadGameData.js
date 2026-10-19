import { loadFont, loadJson } from './load.js';
import { loadTexts } from './texts.js';

export async function loadGameData() {
  const [settings, texts] = await Promise.all([
    loadJson('game.json'),
    loadTexts(),
    loadFont(),
  ]);
  return { settings, texts };
}
