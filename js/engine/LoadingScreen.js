const ART = {
  landscape: new URL('../../assets/images/splash-art.png', import.meta.url).href,
  portrait: new URL('../../assets/images/splash-art-portrait.png', import.meta.url).href,
};

export function containRect(width, height, imageWidth, imageHeight) {
  const scale = Math.min(width / imageWidth, height / imageHeight);
  const drawWidth = imageWidth * scale;
  const drawHeight = imageHeight * scale;
  return { x: (width - drawWidth) / 2, y: (height - drawHeight) / 2,
    width: drawWidth, height: drawHeight };
}

function shadeEdge(ctx, x, y, width, height, horizontal, reverse) {
  const gradient = horizontal
    ? ctx.createLinearGradient(x, y, x + width, y)
    : ctx.createLinearGradient(x, y, x, y + height);
  gradient.addColorStop(0, reverse ? '#0000' : '#000');
  gradient.addColorStop(1, reverse ? '#000' : '#0000');
  ctx.fillStyle = gradient;
  ctx.fillRect(x, y, width, height);
}

export function drawLoadingScreen(ctx, canvas, image, progress, ready, iosHint = false) {
  const { width, height } = canvas;
  const dpr = width / Math.max(1, canvas.getBoundingClientRect().width);
  const rect = image ? containRect(width, height, image.width, image.height)
    : { x: 0, y: 0, width, height };
  const portrait = image ? image.height > image.width : height > width;
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, width, height);
  if (image) {
    ctx.drawImage(image, rect.x, rect.y, rect.width, rect.height);
    const edgeX = rect.width * 0.065;
    const edgeY = rect.height * 0.09;
    shadeEdge(ctx, rect.x, rect.y, edgeX, rect.height, true, false);
    shadeEdge(ctx, rect.x + rect.width - edgeX, rect.y,
      edgeX, rect.height, true, true);
    shadeEdge(ctx, rect.x, rect.y, rect.width, edgeY, false, false);
    shadeEdge(ctx, rect.x, rect.y + rect.height - edgeY,
      rect.width, edgeY, false, true);
  }

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  const fontSize = Math.max(15 * dpr,
    Math.min(24 * dpr, rect.height * (portrait ? 0.028 : 0.033)));
  ctx.font = `${Math.round(fontSize)}px Alice, Georgia, serif`;
  ctx.fillStyle = '#fff3ca';
  ctx.shadowColor = '#000';
  ctx.shadowBlur = 8 * dpr;
  const centerX = rect.x + rect.width / 2;
  const labelY = rect.y + rect.height * (portrait ? 0.91 : 0.865);
  if (ready) {
    ctx.fillText(portrait ? 'Нажмите, чтобы продолжить'
      : 'Нажмите любую клавишу, чтобы продолжить',
    centerX, labelY, rect.width * 0.82);
  } else ctx.fillText(`Загрузка игры ${Math.round(progress * 100)}%`,
    centerX, labelY, rect.width * 0.82);
  ctx.shadowBlur = 0;
  if (!ready) {
    const barWidth = Math.min(340 * dpr, rect.width * 0.72);
    const barHeight = Math.max(8 * dpr, rect.height * 0.016);
    const barX = centerX - barWidth / 2;
    const barY = rect.y + rect.height * (portrait ? 0.945 : 0.91);
    ctx.fillStyle = '#182e29';
    ctx.fillRect(barX, barY, barWidth, barHeight);
    ctx.fillStyle = '#e5bb64';
    ctx.fillRect(barX, barY, barWidth * progress, barHeight);
  }
  if (iosHint) {
    ctx.font = `${Math.round(Math.max(11 * dpr, fontSize * 0.65))}px Alice, Georgia, serif`;
    ctx.fillStyle = '#fff3ca';
    ctx.fillText('На iPhone: «Поделиться» → «На экран Домой»',
      centerX, rect.y + rect.height * 0.975, rect.width * 0.85);
  }
}

export class LoadingScreen {
  constructor(canvas, ctx) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.images = {};
    this.progress = 0;
    this.ready = false;
    this.iosHint = /iPhone|iPod/.test(navigator.userAgent) && !navigator.standalone;
    this.resize = () => this.render();
    window.addEventListener('resize', this.resize);
    this.render();
  }

  async load() {
    await Promise.all(Object.entries(ART).map(([kind, src]) => new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { this.images[kind] = image; this.render(); resolve(); };
      image.onerror = () => reject(new Error(`Не удалось загрузить заставку: ${src}`));
      image.src = src;
    })));
  }

  setProgress(progress) { this.progress = progress; this.render(); }
  setReady() { this.ready = true; this.render(); }

  render() {
    const kind = this.canvas.width < this.canvas.height ? 'portrait' : 'landscape';
    drawLoadingScreen(this.ctx, this.canvas, this.images[kind],
      this.progress, this.ready, this.iosHint);
  }

  stop() { window.removeEventListener('resize', this.resize); }
}
