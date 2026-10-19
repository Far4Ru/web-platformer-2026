import { drawErrorBackground } from '../mock/loadError.js';

export function showLoadError(canvas, error) {
  console.error(error);

  const ctx = canvas.getContext('2d');
  drawErrorBackground(ctx, canvas);
  ctx.fillStyle = '#edf5ff';
  ctx.font = '28px Alice, serif';
  ctx.textAlign = 'center';
  ctx.fillText('Не удалось загрузить игру', canvas.width / 2, canvas.height / 2 - 12);
  ctx.font = '18px Alice, serif';
  ctx.fillText('Проверьте JSON-файлы, шрифт и локальный сервер.', canvas.width / 2, canvas.height / 2 + 24);
}
