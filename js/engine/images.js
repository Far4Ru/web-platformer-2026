export async function loadImages(paths) {
  const entries = await Promise.all(Object.entries(paths).map(([name, src]) =>
    new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve([name, image]);
      image.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));
      image.src = src;
    })));
  return Object.fromEntries(entries);
}
