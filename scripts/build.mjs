import { access, copyFile, mkdir, readdir, unlink } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { runtimeAssets } from './runtime-assets.mjs';

const root = path.resolve(import.meta.dirname, '..');
const dist = path.resolve(root, 'dist');
if (dist !== path.join(root, 'dist') || !dist.startsWith(root + path.sep))
  throw new Error('Refusing to clean a directory outside the project');
await mkdir(dist, { recursive: true });

const toolRoot = path.join(tmpdir(), 'web-platformer-esbuild-0.28.2');
const executable = path.join(toolRoot, 'node_modules/esbuild/bin/esbuild');
const installed = await access(executable).then(() => true, () => false);
if (!installed) {
  const npmCli = path.join(path.dirname(process.execPath),
    'node_modules/npm/bin/npm-cli.js');
  const install = (offline) => {
    const args = [
      'install', '--prefix', toolRoot, '--no-save', '--no-package-lock',
      ...(offline ? ['--offline'] : []), 'esbuild@0.28.2',
    ];
    return spawnSync(process.platform === 'win32' ? process.execPath : 'npm',
      process.platform === 'win32' ? [npmCli, ...args] : args,
      { cwd: root, stdio: 'inherit' });
  };
  let result = install(true);
  if (result.status !== 0 && !result.error) result = install(false);
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error('Could not install esbuild');
}
const bundler = spawnSync(process.execPath, [executable, path.join(root, 'js/main.js'),
  '--bundle', '--tree-shaking=true', '--minify', '--format=esm',
  '--platform=browser', '--target=es2022',
  '--outfile=dist/js/main.js',
  '--metafile=dist/metafile.json',
], { cwd: root, stdio: 'inherit' });
if (bundler.error) throw bundler.error;
if (bundler.status !== 0) throw new Error('esbuild failed');

const copied = [
  'index.html', 'manifest.webmanifest', 'styles/style.css',
  'assets/fonts/LICENSE.txt', 'assets/fonts/COPYRIGHT.txt',
  'assets/sounds/LICENSE.md', 'assets/music/LICENSE.md', 'assets/ui/LICENSE.md',
  ...runtimeAssets,
];
for (const name of copied) {
  const target = path.join(dist, name);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, name), target);
}
const keep = new Set([...copied, 'js/main.js', 'metafile.json']);
async function prune(directory = '') {
  for (const entry of await readdir(path.join(dist, directory), { withFileTypes: true })) {
    const name = path.posix.join(directory, entry.name);
    if (entry.isDirectory()) await prune(name);
    else if (!keep.has(name)) await unlink(path.join(dist, name));
  }
}
await prune();
console.log(`Built dist with ${runtimeAssets.size} runtime assets and tree shaking.`);
