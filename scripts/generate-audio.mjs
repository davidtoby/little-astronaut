import { spawn } from 'node:child_process';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { narrationEntries } from '../narration.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
if (!process.argv.includes('--confirm-send-text')) {
  console.error('This sends narration text to Microsoft Edge online speech synthesis. Run with --confirm-send-text only after consent. / 确认允许发送讲解文字后，才可加此参数。');
  process.exit(1);
}
let entries = narrationEntries();
if (process.argv.includes('--only-preview')) entries = entries.filter(e => e.id === 'preview');
await mkdir(path.join(root, '.runtime'), { recursive: true });
const input = path.join(root, '.runtime/narration-input.json');
await writeFile(input, JSON.stringify(entries, null, 2));
const python = process.env.TTS_PYTHON || path.join(root, '.tts-venv', process.platform === 'win32' ? 'Scripts/python.exe' : 'bin/python');
const child = spawn(python, ['-I', path.join(root, 'scripts/generate_audio.py'), '--input', input, '--output', path.join(root, 'audio')], { cwd: root, stdio: 'inherit' });
child.on('error', e => { console.error(`Cannot start speech generator: ${e.message}. Install the project-only .tts-venv first.`); process.exitCode = 1; });
child.on('exit', code => { process.exitCode = code ?? 1; });
