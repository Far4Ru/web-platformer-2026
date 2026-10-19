import { Game } from './game/Game.js';

const canvas = document.querySelector('#game');

async function loadJson(filename) {
  const response = await fetch(new URL(`../assets/json/${filename}`, import.meta.url));
  if (!response.ok) throw new Error(`Cannot load ${filename}: ${response.status}`);
  return response.json();
}

async function loadFont() {
  const url = new URL('../assets/fonts/Alice-Regular.ttf', import.meta.url);
  const font = new FontFace('Alice', `url("${url.href}")`);
  document.fonts.add(await font.load());
}

function showError(message) {
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#102940';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#edf5ff';
  ctx.font = '28px Alice, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Не удалось загрузить игру', canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = '18px Alice, serif';
  ctx.fillText(message, canvas.width / 2, canvas.height / 2 + 24);
}

try {
  const [settings, texts] = await Promise.all([loadJson('game.json'), loadJson('texts.json'), loadFont()]);
  canvas.width = settings.world.width;
  canvas.height = settings.world.height;
  canvas.style.aspectRatio = `${canvas.width} / ${canvas.height}`;
  document.title = texts.pageTitle;
  canvas.setAttribute('aria-label', texts.canvasLabel);
  new Game(canvas, settings, texts);
} catch (error) {
  console.error(error);
  showError('Проверьте JSON-файлы, шрифт и локальный сервер.');
}
