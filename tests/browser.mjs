import assert from 'node:assert/strict';
import { get as httpGet } from 'node:http';
import { createRequire } from 'node:module';
import { existsSync } from 'node:fs';
import { mkdir, readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { narrationEntries } from '../narration.js';
import { PLANETS_EN, PHASES_EN } from '../data-en.js';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { PLANETS, PHASES, circularSpeed } from '../data.js';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
let playwright;
try { playwright = require('playwright'); }
catch {
  if (!process.env.PLAYWRIGHT_MODULE_PATH) throw new Error('Install Playwright or explicitly set PLAYWRIGHT_MODULE_PATH to its package directory.');
  playwright = require(process.env.PLAYWRIGHT_MODULE_PATH);
}
const base = process.env.TEST_URL || pathToFileURL(path.join(root, 'dist/index.html')).href;
const output = path.join(root, 'tests/screenshots');
await mkdir(output, { recursive: true });
assert(Math.abs(circularSpeed(0) - 7.91) < .01);
assert(Math.abs(circularSpeed(200) - 7.79) < .01);
assert.equal(PLANETS.length, 8);
console.log('PASS: 八大行星数据与第一宇宙速度计算');
const audioManifest = JSON.parse(await readFile(path.join(root, 'audio/manifest.json'), 'utf8'));
assert.equal(audioManifest.entries.length, narrationEntries().length);
for (const expected of narrationEntries()) {
  const entry = audioManifest.entries.find(e => e.lang === expected.lang && e.id === expected.id);
  assert(entry && entry.text === expected.text && entry.voice === expected.voice);
  const bytes = await readFile(path.join(root, 'audio', entry.file));
  assert.equal(createHash('sha256').update(bytes).digest('hex'), entry.audioHash);
  assert(entry.duration > 0 && entry.bytes === bytes.length);
}
console.log(`PASS: ${audioManifest.entries.length} 段双语女声文本、音频哈希和时长`);

const errors = [];
const externalRequests = [];
const browser = await playwright.chromium.launch({ headless: true });
async function waitForAudio(page) {
  const deadline = Date.now() + 10000;
  while (Date.now() < deadline) {
    if (await page.evaluate(() => window.testPlayers[0]?.readyState >= 2 && !window.testPlayers[0].paused)) return;
    await page.waitForTimeout(75);
  }
  throw new Error('The real local MP3 did not load and start playback.');
}
async function contextFor(viewport, touch = false, engine = browser) {
  const context = await engine.newContext({ viewport, hasTouch: touch, deviceScaleFactor: 1 });
  await context.addInitScript(entries => {
    window.testNarration = [];
    window.testPlayers = [];
    const NativeAudio = window.Audio;
    // Use real MP3 loading/decoding, but mute test playback on this computer.
    window.Audio = function(source) {
      const audio = source === undefined ? new NativeAudio() : new NativeAudio(source);
      audio.muted = true;
      const play = audio.play.bind(audio);
      audio.play = function() {
        const entry = entries.find(e => new URL(audio.src).pathname.endsWith(`/audio/${e.file}`));
        window.testNarration.push({ file: audio.src, lang: entry?.lang, text: entry?.text });
        return play();
      };
      window.testPlayers.push(audio);
      return audio;
    };
  }, audioManifest.entries);
  const page = await context.newPage();
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('request', req => { if (/^https?:/.test(req.url()) && !req.url().startsWith(process.env.TEST_URL || 'file:')) externalRequests.push(req.url()); });
  await page.goto(base);
  await page.locator('.solar-map').waitFor();
  return { context, page };
}
try {
  const { context, page } = await contextFor({ width: 1440, height: 1080 });
  await page.locator('.sound-toggle').click();
  assert.equal(await page.locator('.sound-toggle').getAttribute('aria-pressed'), 'false');
  for (const planet of PLANETS) {
    await page.getByRole('button', { name: `选择${planet.name}`, exact: true }).click();
    assert.equal(await page.locator('.friend-card h3').innerText(), planet.name);
    assert.equal(await page.locator('.planet-tile.selected').count(), 1);
    assert.equal(await page.locator('.planet-tile.selected').innerText(), planet.name);
  }
  assert.match(await page.locator('.explored').innerText(), /8 \/ 8/);
  await page.getByRole('button', { name: '认识太阳', exact: true }).click();
  assert.match(await page.locator('.friend-description').innerText(), /恒星，不是行星/);
  await page.getByRole('button', { name: '选择地球', exact: true }).click();
  await page.getByRole('button', { name: '听我说话', exact: true }).click();
  assert.equal(await page.evaluate(() => window.testNarration.at(-1).lang), 'zh');
  await waitForAudio(page);
  assert.match(await page.evaluate(() => window.testNarration.at(-1).text), /爸爸妈妈/);
  await page.getByRole('button', { name: '停一下', exact: true }).click();
  const planet = page.getByRole('button', { name: '认识地球', exact: true });
  const position = await planet.getAttribute('transform');
  await page.waitForTimeout(180);
  assert.equal(await planet.getAttribute('transform'), position);
  await page.getByRole('button', { name: '继续转圈', exact: true }).click();
  await page.waitForTimeout(180);
  assert.notEqual(await planet.getAttribute('transform'), position);
  await page.getByRole('button', { name: '快一点', exact: true }).click();
  assert.equal(await page.getByRole('button', { name: /慢一点/ }).getAttribute('aria-pressed'), 'true');
  await page.getByRole('button', { name: '开始找一找', exact: false }).click();
  const question = await page.locator('.discovery-strip h3').innerText();
  const target = PLANETS.find(p => p.quiz === question);
  assert(target);
  const wrong = PLANETS.find(p => p.id !== target.id);
  await page.getByRole('button', { name: `选择${wrong.name}`, exact: true }).click();
  assert.match(await page.locator('.discovery-strip [role="status"]').innerText(), /再找找/);
  await page.getByRole('button', { name: `选择${target.name}`, exact: true }).click();
  assert.match(await page.locator('.discovery-strip [role="status"]').innerText(), /找对啦/);
  await page.getByRole('button', { name: '选择地球', exact: true }).click();
  await page.getByRole('button', { name: '停一下', exact: true }).click();
  await page.screenshot({ path: path.join(output, 'desktop-solar.png'), fullPage: true, animations: 'disabled' });
  console.log('PASS: 全部星球选择、太阳恒星说明、真实中文 MP3 播放、暂停/速度、找星球');

  await page.locator('.rocket-mission').click();
  await page.locator('.rocket-scene').waitFor();
  await page.getByRole('button', { name: '火箭回到起点', exact: true }).click();
  await page.getByRole('button', { name: '发射小火箭', exact: true }).click();
  await page.getByRole('button', { name: '停一下', exact: true }).waitFor();
  await page.waitForTimeout(180);
  assert(Number(await page.locator('#launch-progress').inputValue()) > .31);
  await page.getByRole('button', { name: '停一下', exact: true }).click();
  const pausedTime = await page.locator('#launch-progress').inputValue();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#launch-progress').inputValue(), pausedTime);
  for (const phase of PHASES.slice(1)) {
    await page.getByRole('button', { name: `观看${phase.title}`, exact: true }).click();
    await page.locator('.rocket-story h3').getByText(phase.title, { exact: true }).waitFor();
    assert.match(await page.locator('.friend-description').innerText(), new RegExp(phase.text.slice(0, 6)));
    assert.equal(await page.locator('#launch-progress').inputValue(), String(phase.start));
    assert.equal(await page.locator('.phase-steps button.current').count(), 1);
    assert.match(await page.locator('.phase-steps button.current').innerText(), new RegExp(phase.short));
    if (phase.start === 16) await page.screenshot({ path: path.join(output, 'desktop-rocket-separation.png'), fullPage: true, animations: 'disabled' });
  }
  assert.equal(await page.locator('[data-testid="flying-rocket"]').getAttribute('data-orbiting'), 'true');
  assert.equal(await page.locator('.rocket-scene text').getByText('向前飞', { exact: true }).count(), 1);
  await page.locator('.parent-guide summary').click();
  assert.match(await page.locator('.parent-content').innerText(), /7\.9 公里\/秒/);
  assert.match(await page.locator('.parent-content').innerText(), /7\.79 公里\/秒/);
  await page.locator('#launch-progress').focus();
  await page.locator('#launch-progress').press('End');
  await page.getByRole('button', { name: '再飞一次', exact: true }).waitFor();
  await page.getByRole('button', { name: '再飞一次', exact: true }).click();
  await page.getByRole('button', { name: '停一下', exact: true }).waitFor();
  await page.getByRole('button', { name: '停一下', exact: true }).click();
  await page.getByRole('button', { name: '观看转个弯，向前飞', exact: true }).click();
  await page.locator('.solar-mission').click();
  await page.locator('.rocket-mission').click();
  assert.equal(await page.locator('#launch-progress').inputValue(), '10');
  await page.reload();
  await page.locator('.rocket-scene').waitFor();
  assert.equal(await page.locator('#launch-progress').inputValue(), '10');
  assert.equal(await page.getByRole('button', { name: '继续飞', exact: true }).count(), 1);
  console.log('PASS: 发射、暂停、六个阶段、关机环绕、科学说明、重播与位置恢复');
  await page.getByTestId('language-en').click();
  assert.equal(await page.locator('#launch-progress').inputValue(), '10');
  assert.equal(await page.locator('.rocket-story h3').innerText(), PHASES_EN[3].title);
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  await page.getByTestId('listen-phase').click();
  await waitForAudio(page);
  assert.match(await page.evaluate(() => window.testPlayers[0].src), /\/audio\/en\/phase-3-full\.mp3$/);
  await page.getByTestId('launch-toggle').click();
  await page.getByTestId('listen-phase').click();
  const fullStoryTime = await page.locator('#launch-progress').inputValue();
  await page.waitForTimeout(150);
  assert.equal(await page.locator('#launch-progress').inputValue(), fullStoryTime, '完整讲解应暂停飞行');
  assert.equal(await page.getByTestId('launch-toggle').innerText(), 'Keep flying');
  await page.getByTestId('launch-reset').click();
  await page.locator('body').click({ position: { x: 2, y: 2 } });
  await page.keyboard.press('Space');
  await page.waitForTimeout(120);
  assert.equal(await page.getByTestId('launch-toggle').innerText(), 'Pause');
  await page.keyboard.press('Space');
  assert.equal(await page.evaluate(() => window.testPlayers[0].paused), true);
  const keyboardTime = await page.locator('#launch-progress').inputValue();
  await page.keyboard.press('ArrowRight');
  assert(Math.abs(Number(await page.locator('#launch-progress').inputValue()) - Number(keyboardTime) - 2) < .1);
  await page.getByTestId('language-zh').click();
  assert.equal(await page.evaluate(() => window.testPlayers[0].paused), true, '切语言应取消旧配音');
  await page.locator('.solar-mission').click();
  await page.locator('.planet-tile[data-planet="saturn"]').click();
  await page.getByTestId('quiz-start').click();
  const chineseQuestion = await page.locator('.discovery-strip h3').innerText();
  const questionId = PLANETS.find(p => p.quiz === chineseQuestion).id;
  await page.getByTestId('language-en').click();
  assert.equal(await page.locator('.friend-card h3').innerText(), 'Saturn');
  assert.equal(await page.locator('.discovery-strip h3').innerText(), PLANETS_EN[questionId].quiz);
  for (const p of PLANETS) {
    await page.locator(`.planet-tile[data-planet="${p.id}"]`).click();
    assert.equal(await page.locator('.friend-card h3').innerText(), PLANETS_EN[p.id].name);
  }
  await page.getByTestId('listen-planet').click();
  await waitForAudio(page);
  assert.match(await page.evaluate(() => window.testPlayers[0].src), /\/audio\/en\/planet-neptune\.mp3$/);
  await page.getByTestId('voice-preview').click();
  await waitForAudio(page);
  assert.match(await page.evaluate(() => window.testPlayers[0].src), /\/audio\/en\/preview\.mp3$/);
  await page.screenshot({ path: path.join(output, 'desktop-en-solar.png'), fullPage: true, animations: 'disabled' });
  await page.reload();
  await page.locator('.solar-map').waitFor();
  assert.equal(await page.locator('html').getAttribute('lang'), 'en');
  assert.match(await page.title(), /Little Astronaut/);
  console.log('PASS: 英文全行星、语言/题目/进度保留、真实英文配音、试听和完整讲解暂停');
  await context.close();

  for (const [name, viewport] of [
    ['ipad-landscape', { width: 1024, height: 768 }],
    ['ipad-portrait', { width: 768, height: 1024 }],
    ['phone', { width: 390, height: 844 }],
  ]) {
    const { context, page } = await contextFor(viewport, true);
    await page.getByRole('button', { name: '选择土星', exact: true }).tap();
    assert.equal(await page.locator('.friend-card h3').innerText(), '土星');
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1);
    assert.equal(overflow, false, `${name} 页面不应横向溢出`);
    for (const box of await page.locator('.planet-tile').evaluateAll(items => items.map(el => ({ w: el.getBoundingClientRect().width, h: el.getBoundingClientRect().height })))) {
      assert(box.w >= 44 && box.h >= 44, '星球按钮应至少 44 × 44');
    }
    await page.screenshot({ path: path.join(output, `${name}-solar.png`), fullPage: true, animations: 'disabled' });
    await page.locator('.rocket-mission').tap();
    await page.getByRole('button', { name: '火箭回到起点', exact: true }).tap();
    await page.getByRole('button', { name: '发射小火箭', exact: true }).tap();
    await page.getByRole('button', { name: '停一下', exact: true }).tap();
    await page.getByRole('button', { name: '观看你好，太空！', exact: true }).tap();
    assert.equal(await page.locator('[data-testid="flying-rocket"]').getAttribute('data-orbiting'), 'true');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: path.join(output, `${name}-rocket.png`), fullPage: true, animations: 'disabled' });
    await page.getByTestId('language-en').tap();
    assert.equal(await page.locator('#launch-progress').inputValue(), '29');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    assert.equal(/[㐀-鿿]/.test(await page.locator('.mission-content').innerText()), false, '英文任务中不应残留中文');
    await page.screenshot({ path: path.join(output, `${name}-en-rocket.png`), fullPage: true, animations: 'disabled' });
    await page.locator('.solar-mission').tap();
    await page.locator('.planet-tile[data-planet="saturn"]').tap();
    assert.equal(await page.locator('.friend-card h3').innerText(), 'Saturn');
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false);
    await page.screenshot({ path: path.join(output, `${name}-en-solar.png`), fullPage: true, animations: 'disabled' });
    console.log(`PASS: ${name} 中英触屏点按、响应式、44px 按钮和环绕画面`);
    await context.close();
  }
  assert.deepEqual(errors, [], '浏览器不应出现 JavaScript/控制台错误');
  assert.deepEqual(externalRequests, [], '网页不应依赖外部请求');
  console.log('PASS: 无控制台错误、无外部运行时请求');
} finally { await browser.close(); }

// WebKit is a compatibility check, not a claim of physical-iPad testing.
if (existsSync(playwright.webkit.executablePath())) {
  const webkit = await playwright.webkit.launch({ headless: true });
  try {
    const { context, page } = await contextFor({ width: 1024, height: 768 }, true, webkit);
    await page.getByRole('button', { name: '选择地球', exact: true }).tap();
    assert.equal(await page.locator('.friend-card h3').innerText(), '地球');
    await page.locator('.rocket-mission').tap();
    await page.getByRole('button', { name: '火箭回到起点', exact: true }).tap();
    await page.getByRole('button', { name: '发射小火箭', exact: true }).tap();
    await page.getByRole('button', { name: '停一下', exact: true }).tap();
    await page.getByTestId('language-en').tap();
    await page.getByTestId('voice-preview').tap();
    await waitForAudio(page);
    assert.match(await page.evaluate(() => window.testPlayers[0].src), /\/audio\/en\/preview\.mp3$/);
    await page.screenshot({ path: path.join(output, 'webkit-ipad-rocket.png'), fullPage: true, animations: 'disabled' });
    await context.close();
    console.log('PASS: WebKit 平板触屏兼容性（非实体 iPad）');
  } finally { await webkit.close(); }
} else console.log('SKIP: 没有安装 WebKit 浏览器。');
assert.deepEqual(errors, [], 'WebKit 不应有运行错误');
if (process.env.TEST_URL) {
  const origin = new URL(base).origin;
  for (const resource of ['/server.mjs', '/package.json', '/README.md', '/app.jsx', '/%2e%2e/server.mjs', '/node_modules/react/index.js']) {
    assert.equal((await fetch(origin + resource)).status, 404, '不得提供源码或其他目录');
  }
  assert.equal((await fetch(origin, { method: 'POST' })).status, 405);
  // Node's fetch normalizes Host; use node:http to send the exact test header.
  const wrongHostStatus = await new Promise((resolve, reject) => {
    const request = httpGet(origin, { headers: { Host: 'unrelated.example' } }, response => {
      response.resume(); resolve(response.statusCode);
    });
    request.on('error', reject);
  });
  assert.equal(wrongHostStatus, 403);
  const response = await fetch(origin + '/app.js');
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-security-policy'), /connect-src 'none'/);
  assert.equal(response.headers.get('x-content-type-options'), 'nosniff');
  const audioURL = origin + '/audio/en/preview.mp3';
  const range = await fetch(audioURL, { headers: { Range: 'bytes=0-1' } });
  assert.equal(range.status, 206);
  assert.equal((await range.arrayBuffer()).byteLength, 2);
  assert.match(range.headers.get('content-range'), /^bytes 0-1\//);
  const suffix = await fetch(audioURL, { headers: { Range: 'bytes=-10' } });
  assert.equal(suffix.status, 206);
  assert.equal((await suffix.arrayBuffer()).byteLength, 10);
  assert.equal((await fetch(audioURL, { headers: { Range: 'bytes=99999999-' } })).status, 416);
  assert.equal((await fetch(origin + '/.runtime/server.json')).status, 404);
  assert.equal((await fetch(origin + '/.tts-venv/pyvenv.cfg')).status, 404);
  console.log('PASS: HTTP 文件限制、只读服务、非本机 Host 拒绝、Safari MP3 范围请求');
}
console.log(`\n浏览器检查完成，截图保存在 ${output}`);
console.log(process.env.TEST_URL ? '通过已启动的网页地址完成检查。' : '通过本地文件检查；未启动服务，未验证 LAN 或 HTTP 服务。');
