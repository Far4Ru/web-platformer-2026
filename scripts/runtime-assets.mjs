import { readFile } from 'node:fs/promises';

const game = JSON.parse(await readFile(new URL('../assets/json/game.json', import.meta.url)));
export const runtimeAssets = new Set([
  'assets/json/game.json', 'assets/json/texts.json',
  'assets/fonts/Alice-Regular.ttf',
  'assets/images/splash-art.jpg', 'assets/images/splash-art-portrait.jpg',
  'assets/ui/favicon-explorer.png', 'assets/sprites/objects/jade-portal.png',
  game.music.src,
  ...Object.values(game.music.tracks ?? {}).map((track) =>
    typeof track === 'string' ? track : track.src),
  ...Object.values(game.sounds).map((sound) => sound.src),
].filter(Boolean));

function addImages(value) {
  if (typeof value === 'string') runtimeAssets.add(value);
  else if (Array.isArray(value)) value.forEach(addImages);
  else if (value?.base && value.clips) {
    for (const clip of value.clips) {
      runtimeAssets.add(`${value.base}/${clip}.png`);
      runtimeAssets.add(`${value.base}/${clip}.json`);
    }
  } else if (value?.sheet && value.atlas) {
    runtimeAssets.add(value.sheet);
    runtimeAssets.add(value.atlas);
  } else if (value && typeof value === 'object') Object.values(value).forEach(addImages);
}
addImages(game.images);
export const imageKeys = Object.keys(game.images);
