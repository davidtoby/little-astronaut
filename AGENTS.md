# Maintenance handoff / 维护导航

Read [README.md](README.md) first. It contains complete Chinese and English guides to the content, controls, installation, startup, shutdown, voice generation, tests, privacy, and scientific caveats.

请先阅读 [README.md](README.md)：其中有完整的中英文项目介绍、操作、安装、启动、停止、配音生成、测试、安全边界及科学说明。

## Architecture / 架构

- React + JSX, bundled by local esbuild. `dist/` is committed so `npm start` needs only Node.js 18+.
- 全部界面文案在 `i18n.jsx`；中文天文故事在 `data.js`，英文故事在 `data-en.js`。
- `speech.jsx` plays local MP3s. `voice-text.js` and `narration.js` are the canonical spoken-text/voice inventory; `audio/manifest.json` stores hashes and durations.
- Language changes must preserve selected IDs, quiz state, paused/running state, and timeline time. Avoid using translated display strings as state identifiers or React keys.
- 动画属于教学示意，不按大小、距离、时间比例；第一宇宙速度及轨道公式在 `data.js` 中计算，不要硬编“假实时遥测”。

## Working on this project / 修改与验证

```sh
npm install
npm run build
npm test
# With the server already running:
TEST_URL=http://localhost:8088 npm test
npm run status
npm run stop
```

- Read the actual source before editing. Keep files small and use stable translation keys.
- Keep Chinese/English text, accessible labels, game feedback, and spoken clips in sync.
- 文字或声音参数变化后，需要在所有者同意发送文字后重新生成配音。构建拒绝过期或损坏配音；不要绕过这一检查。
- Do not automatically invoke online speech generation. It sends lesson text to Microsoft Edge using an unofficial client; ask for consent. No child/user personal data is needed.
- Do not add API keys, browser online TTS requests, telemetry, ads, remote fonts, or hidden robotic-voice fallbacks.
- Audio playback should remain cancelable; changing language or task cancels old audio. Manual full-phase narration pauses the flight.
- Use the same HTMLAudioElement for consecutive clips to preserve iPad's user-gesture unlock. The server must support MP3 byte ranges.
- Test both languages, both missions, touch targets, desktop/iPad/phone layouts, keyboard controls, audio coverage and hashes, persistence, and HTTP allowlists. Browser emulation is not a physical-iPad audio audition.

## Safety and publication / 安全与发布

- Only allowlisted built assets are served; `/health` is loopback-only. Never expose source, `.runtime/`, `.tts-venv/`, environment files, or the parent directory.
- `manage.mjs` verifies the app's instance ID and PID before stopping. Never replace it with broad `pkill` or a kill-all-port command.
- `.runtime/`, `.tts-venv/`, `node_modules/`, environment files, logs, and test screenshots stay out of git.
- 公开 GitHub 源码仓库不等于公开网站部署。不要自动启用 GitHub Pages、云端托管、隧道或更改防火墙。
- No real teacher's identity or recording is cloned. The included narration is clearly described as AI-generated female voices.
- Preserve the distinctions: Sun vs. planets; greenhouse heating vs. burning; particle rings; horizontal orbital speed; gravity remains in orbit; engines need not burn continuously in an ideal orbit.
