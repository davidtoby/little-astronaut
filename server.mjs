import http from 'node:http';
import { readFile, stat, mkdir, writeFile } from 'node:fs/promises';
import { readFileSync, unlinkSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const project = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(project, 'dist');
const runtime = path.join(project, '.runtime');
const recordFile = path.join(runtime, 'server.json');
const port = Number(process.env.PORT || 8088);
const host = process.env.HOST || '0.0.0.0';
const instanceId = randomUUID();
const startedAt = new Date().toISOString();
if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error('PORT must be 1024–65535 / 端口必须在 1024–65535 之间。');
const assets = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/styles.css', ['styles.css', 'text/css; charset=utf-8']],
  ['/favicon.svg', ['favicon.svg', 'image/svg+xml']],
  ['/audio/manifest.json', ['audio/manifest.json', 'application/json; charset=utf-8']],
]);
await stat(path.join(root, 'index.html')).catch(() => { throw new Error('Build first: npm run build / 请先构建网页。'); });
const manifest = JSON.parse(await readFile(path.join(root, 'audio/manifest.json'), 'utf8'));
for (const entry of manifest.entries) {
  if (!/^(zh|en)\/[a-z0-9-]+\.mp3$/.test(entry.file)) throw new Error('Invalid audio manifest path');
  assets.set(`/audio/${entry.file}`, [`audio/${entry.file}`, 'audio/mpeg']);
}
const isPrivate = ip => {
  const parts = ip.split('.').map(Number);
  return parts.length === 4 && (parts[0] === 127 || parts[0] === 10 || (parts[0] === 192 && parts[1] === 168) || (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31));
};
const localIPs = Object.values(os.networkInterfaces()).flat().filter(n => n && n.family === 'IPv4').map(n => n.address);
const hosts = new Set(['localhost', ...localIPs]);
const server = http.createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; media-src 'self'; connect-src 'none'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
  const reply = (status, body) => { res.writeHead(status, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end(body); };
  if (!isPrivate(req.socket.remoteAddress || '')) return reply(403, 'LAN access only / 仅支持本机或局域网访问。');
  let url, requestHost;
  try { requestHost = new URL(`http://${req.headers.host}`).hostname; url = new URL(req.url, `http://${req.headers.host}`); }
  catch { return reply(400, 'Invalid request / 无效请求。'); }
  if (!hosts.has(requestHost) || !hosts.has(url.hostname)) return reply(403, 'Use the local IP / 请使用本机局域网 IP。');
  if (!['GET', 'HEAD'].includes(req.method)) { res.setHeader('Allow', 'GET, HEAD'); return reply(405, 'Read-only service / 只支持读取网页。'); }
  if (url.pathname === '/health') {
    if (!req.socket.remoteAddress.startsWith('127.')) return reply(403, 'Local status check only');
    const body = JSON.stringify({ app: 'little-astronaut', pid: process.pid, instanceId, startedAt });
    res.writeHead(200, { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) });
    return res.end(req.method === 'HEAD' ? undefined : body);
  }
  const asset = assets.get(url.pathname);
  if (!asset) return reply(404, 'Not found / 没有这个页面。');
  try {
    const buffer = await readFile(path.join(root, asset[0]));
    const isAudio = asset[1] === 'audio/mpeg';
    const headers = { 'Content-Type': asset[1], 'Content-Length': buffer.length };
    if (isAudio) headers['Accept-Ranges'] = 'bytes';
    // Safari probes MP3s with byte ranges; serve valid single ranges exactly.
    if (isAudio && req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const size = buffer.length;
      let start, end;
      if (match && (match[1] || match[2])) {
        start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
        end = match[1] && match[2] ? Math.min(Number(match[2]), size - 1) : size - 1;
      }
      if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start < 0 || start >= size || end < start) {
        res.setHeader('Content-Range', `bytes */${size}`);
        return reply(416, 'Invalid byte range');
      }
      headers['Content-Range'] = `bytes ${start}-${end}/${size}`;
      headers['Content-Length'] = end - start + 1;
      res.writeHead(206, headers);
      return res.end(req.method === 'HEAD' ? undefined : buffer.subarray(start, end + 1));
    }
    res.writeHead(200, headers);
    res.end(req.method === 'HEAD' ? undefined : buffer);
  } catch { reply(500, 'Read failed; rebuild the app / 文件读取失败，请重新构建。'); }
});
server.on('error', err => {
  console.error(err.code === 'EADDRINUSE' ? `Port ${port} is busy / 端口已占用。npm run status; npm run stop; 或设置 PORT=8089。` : err.message);
  process.exitCode = 1;
});
process.on('exit', () => {
  try {
    if (JSON.parse(readFileSync(recordFile, 'utf8')).instanceId === instanceId) unlinkSync(recordFile);
  } catch {}
});
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => {
  server.close(() => process.exit(0));
  server.closeAllConnections?.();
});
server.listen(port, host, async () => {
  try {
    await mkdir(runtime, { recursive: true });
    await writeFile(recordFile, JSON.stringify({ pid: process.pid, port, project, instanceId, startedAt }, null, 2), { mode: 0o600 });
  } catch (error) {
    console.error('Cannot save project runtime record:', error.message);
    server.close(); process.exitCode = 1; return;
  }
  console.log('\n小小宇航员 / Little Astronaut is ready!');
  console.log(`Local / 本机：http://localhost:${port}/`);
  if (host !== '127.0.0.1') localIPs.filter(ip => !ip.startsWith('127.') && isPrivate(ip)).forEach(ip => console.log(`LAN / 局域网：http://${ip}:${port}/`));
  console.log('Stop / 停止：Control+C，或在项目目录运行 npm run stop。\n');
});
