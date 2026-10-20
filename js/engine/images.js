export function countImageResources(src) {
  if (Array.isArray(src)) return src.reduce((total, item) => total + countImageResources(item), 0);
  if (src && typeof src === 'object' && src.base && src.clips)
    return src.clips.length * 2;
  if (src && typeof src === 'object' && src.sheet && src.atlas) return 2;
  return typeof src === 'string' ? 1 : 0;
}

export async function loadImages(paths, onProgress = () => {}) {
  let completed = 0;
  const total = countImageResources(Object.values(paths));
  const loaded = () => onProgress(++completed, total);
  async function loadOne(src) {
    if (Array.isArray(src)) return Promise.all(src.map(loadOne));
    if (src && typeof src === 'object' && src.base && src.clips) {
      const entries = await Promise.all(src.clips.map(async (name) =>
        [name, await loadOne({ sheet: `${src.base}/${name}.png`,
          atlas: `${src.base}/${name}.json` })]));
      const clips = Object.fromEntries(entries);
      return {
        frames: src.order.map(([name, index]) => ({
          ...clips[name].frames[index], image: clips[name].image,
        })),
        animations: Object.fromEntries(src.clips.map((name) =>
          [name, clips[name].animations[name]])),
      };
    }
    if (src && typeof src === 'object' && src.sheet && src.atlas) {
      const [image, response] = await Promise.all([
        loadOne(src.sheet), fetch(src.atlas),
      ]);
      if (!response.ok) throw new Error(`Не удалось загрузить атлас: ${src.atlas}`);
      const atlas = await response.json();
      loaded();
      return { image, frames: atlas.frames, animations: atlas.animations };
    }
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => { loaded(); resolve(image); };
      image.onerror = () => reject(new Error(`Не удалось загрузить изображение: ${src}`));
      image.src = src;
    });
  }
  const entries = await Promise.all(Object.entries(paths).map(async ([name, src]) =>
    [name, await loadOne(src)]));
  return Object.fromEntries(entries);
}
