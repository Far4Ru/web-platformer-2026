import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { imageKeys, runtimeAssets } from './runtime-assets.mjs';

const root = path.resolve(import.meta.dirname, '..');

async function files(directory) {
  const entries = await readdir(path.join(root, directory), { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const name = path.posix.join(directory, entry.name);
    return entry.isDirectory() ? files(name) : [name];
  }));
  return nested.flat();
}

const assetPaths = await files('assets');
const generated = assetPaths.filter((name) => !runtimeAssets.has(name)
  && !name.includes('/spritesheets/source/')
  && !/\.(md|txt)$/.test(name));
const buildTexts = (await Promise.all((await files('scripts')).map((name) =>
  readFile(path.join(root, name), 'utf8')))).join('\n');
const generatedIconInputs = new Set(['pause', 'play', 'sound', 'sound-off',
  'restart', 'trophy'].map((name) => `assets/ui/icon-${name}.png`));
const candidates = generated.map((name) => ({
  path: name,
  bytes: 0,
  buildReference: buildTexts.includes(path.basename(name))
    || generatedIconInputs.has(name),
}));
for (const candidate of candidates)
  candidate.bytes = (await stat(path.join(root, candidate.path))).size;
for (const candidate of candidates.sort((a, b) => b.bytes - a.bytes))
  console.log(`${candidate.buildReference ? 'BUILD' : 'UNUSED'}\t${candidate.bytes}\t${candidate.path}`);
console.log(`Runtime assets: ${runtimeAssets.size}; other files: ${candidates.length}; `
  + `possible savings: ${candidates.filter((entry) => !entry.buildReference)
    .reduce((sum, entry) => sum + entry.bytes, 0)} bytes`);

const jsText = (await Promise.all((await files('js')).map((name) =>
  readFile(path.join(root, name), 'utf8')))).join('\n');
const unusedKeys = imageKeys.filter((key) =>
  !jsText.includes(`.${key}`) && !jsText.includes(`'${key}'`)
  && !jsText.includes(`"${key}"`));
console.log(`Image keys without direct JS reference: ${unusedKeys.join(', ')}`);
