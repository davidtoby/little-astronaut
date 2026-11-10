import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdir, copyFile, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { narrationEntries } from './narration.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(import.meta.url);
// A local dependency directory can be supplied explicitly; no machine-specific
// paths or automatic network installs are embedded in this public project.
const candidates = [path.join(root, 'node_modules'), ...(process.env.NODE_PATH || '').split(path.delimiter).filter(Boolean)];
const modules = candidates.find(p => existsSync(path.join(p, 'esbuild/package.json')) && existsSync(path.join(p, 'react-dom/package.json')));
if (!modules) throw new Error('Install dependencies first: npm install / 请先安装构建依赖。');
const manifest = JSON.parse(await readFile(path.join(root, 'audio/manifest.json'), 'utf8'));
const recorded = new Map(manifest.entries.map(entry => [`${entry.lang}:${entry.id}`, entry]));
for (const entry of narrationEntries()) {
  const clip = recorded.get(`${entry.lang}:${entry.id}`);
  const hash = createHash('sha256').update([entry.voice, entry.rate, entry.pitch, entry.text].join('|')).digest('hex');
  if (!clip || clip.sourceHash !== hash || clip.text !== entry.text || clip.file !== entry.file) throw new Error(`Missing/stale audio: ${entry.lang}/${entry.id}. Regenerate only after consenting to send narration text.`);
  const bytes = await readFile(path.join(root, 'audio', clip.file));
  if (createHash('sha256').update(bytes).digest('hex') !== clip.audioHash) throw new Error(`Corrupt audio: ${clip.file}`);
}
const { build } = require(path.join(modules, 'esbuild'));
await mkdir(path.join(root, 'dist'), { recursive: true });
await build({
  entryPoints: [path.join(root, 'app.jsx')], outfile: path.join(root, 'dist/app.js'),
  bundle: true, minify: true, sourcemap: false,
  target: ['safari15', 'chrome100'], jsx: 'automatic', nodePaths: [modules],
  define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'info',
});
for (const file of ['index.html', 'styles.css', 'favicon.svg']) await copyFile(path.join(root, file), path.join(root, 'dist', file));
for (const entry of manifest.entries) {
  if (!/^(zh|en)\/[a-z0-9-]+\.mp3$/.test(entry.file)) throw new Error('Invalid audio asset path');
  const target = path.join(root, 'dist/audio', entry.file);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(path.join(root, 'audio', entry.file), target);
}
await copyFile(path.join(root, 'audio/manifest.json'), path.join(root, 'dist/audio/manifest.json'));
console.log(`Built bilingual app with ${manifest.entries.length} verified local voice clips. / 双语网页和本地配音构建完成。`);
