# 小小宇航员 / Little Astronaut

**宝宝的中英文宇宙乐园 · A bilingual space playground for curious little minds**

[中文说明](#中文说明) · [English guide](#english-guide)

**本实现位于 `feat/bilingual-narration` 分支。仓库已有的 `main` 是另一个实现，未被覆盖。**

**This implementation is on `feat/bilingual-narration`. The repository’s existing `main` contains a different implementation and has been preserved.**

---

## 中文说明

### 这个项目是什么

这是一个适合 **3 岁左右宝宝和家长一起玩**的卡通天文网页。宝宝可以点行星、听故事、发射火箭。按钮适合手指点按，电脑、iPad 横竖屏和手机均有响应式布局。

没有登录、广告、用户跟踪或在线后端。中文和英文可以在页面顶部切换，**界面、行星介绍、家长知识、小游戏提示和配音一起切换**。语言会保存在当前浏览器中，刷新后保留。切换语言不会重置当前选中的行星、小游戏题目或火箭进度。

### 网页内容和玩法

**了解太阳系**

- 点击动画中的太阳或八大行星，也可点击下面固定位置的大按钮。
- 行星会介绍名字、特点和一小段故事；独立的朗读按钮可再次播放介绍。
- 可以暂停/继续公转，切换较快/较慢的演示速度。
- 「找星球」小游戏支持鼓励、再试一次和新题目。
- 展开家长知识，阅读更准确的科学说明。

**火箭发射**

- 发射过程为：倒数 → 点火起飞 → 转弯向前飞 → 分级/外壳分离 → 加速入轨 → 关机后绕地球飞。
- 可以暂停、继续、回到起点、重播，拖动飞行进度，直接点某个步骤。
- 自动讲解使用短句，不遮住动画；「听这一段」会暂停飞行，再播放该步骤的完整解释。
- 火箭位置保存在当前浏览器的 `localStorage` 中。刷新或切回任务后停在上次位置，**不会自动发射**。
- 绕地球时，绿色箭头表示向前运动，桃色箭头表示地球引力。

**声音与语言**

- 顶部「中文 / English」切换界面和配音语言。
- 「讲解开启 / 关闭」控制点行星、游戏反馈和火箭阶段的自动配音；手动朗读和试听按钮仍可使用。
- 「试听老师配音」播放当前语言的示例。声音是 AI 合成女性配音，不是真人录音，也不模仿任何真实老师。
- 中文使用 `zh-CN-XiaoxiaoNeural`，英文使用 `en-US-JennyNeural`。语速为 `-5%`、音调为原始音调，避免通过尖细变调制造卡通声。
- `audio/` 中包含 84 段经过音频格式、时长和 SHA-256 校验的 MP3；网页运行时只从本地加载它们，**不发送文字到任何在线 TTS 服务，也不调用浏览器机器朗读作为隐藏替代**。
- 浏览器要求首先点按按钮才能发声。检查设备音量；缺少音频或播放失败时，网页会提示，文字和动画仍可使用。

### 安装与启动

需要 **Node.js 18 或更新版本**；推荐近期 Node.js LTS。启动已经构建好的网页，不需要 Python、API Key 或 `npm install`。

```sh
git clone --branch feat/bilingual-narration https://github.com/davidtoby/little-astronaut.git
cd little-astronaut
npm start
```

也可以直接执行：

```sh
node server.mjs
```

电脑本机打开：**http://localhost:8088/**。

macOS 用户可以双击项目中的 **`启动宇宙乐园.command`**，或英文同等文件 **`Start Space Playground.command`**。保持终端和电脑运行。脚本不联网、不安装依赖、不修改防火墙。

### 在另一台 iPad 上访问

1. 电脑和 iPad 连接同一个局域网，建议同一 Wi-Fi，不使用隔离的访客网络。
2. 启动服务后，在电脑终端找到 `LAN / 局域网` 一行的网址。
3. 在 iPad Safari 输入完整的 `http://<电脑局域网IP>:8088/`，推荐横屏。
4. 可在 Safari「分享 → 添加到主屏幕」，方便宝宝下次进入；这并不会把服务搬到 iPad，电脑仍需要运行。
5. IP 会随网络变化；以启动时打印的地址为准。

打不开时，检查同一 Wi-Fi、`http://` 地址和端口、访客网络设备隔离、电脑是否休眠，以及 macOS 防火墙是否允许 Node.js 的传入连接。程序不会自行更改防火墙或路由器，也不会开公网隧道。

### 停止、查看状态、重新启动

在运行服务的终端按 **Control+C**。若服务在后台运行，可在项目目录执行：

```sh
npm run status
npm run stop
# 等原服务停止后，再重新启动：
npm start
```

等同的直接命令：

```sh
node manage.mjs status
node manage.mjs stop
```

`.runtime/server.json` 保存本项目的进程记录。停止工具先通过仅本机可读的 `/health` 验证项目名称、PID 和实例标识，**不会按端口杀掉不相关的进程**。关闭服务或电脑休眠后，iPad 将无法访问。

端口被占用时，先查看状态、停止本项目的旧服务，或指定新端口：

```sh
PORT=8089 npm start
HOST=127.0.0.1 npm start  # 仅允许本机访问，不开放局域网
```

Windows PowerShell 设置端口：`$env:PORT=8089; npm start`。

### 修改代码、构建、测试

仓库包含可以直接运行的 `dist/`。只有修改源代码或运行测试时才需要安装 Node.js 开发依赖：

```sh
npm install
npm run build
npm test
```

浏览器测试需要 Playwright Chromium / WebKit；若缺少它们，显式安装：

```sh
npx playwright install chromium webkit
```

默认浏览器检查通过本地文件运行，不开放服务端口。服务已经运行时，进一步验证 HTTP、音频范围请求和文件访问限制：

```sh
TEST_URL=http://localhost:8088 npm test
```

如本机已有合适的构建/测试依赖，可以通过 `NODE_PATH` 和 `PLAYWRIGHT_MODULE_PATH` 显式指定目录，不需要把机器路径写进源码。测试不会自动下载浏览器。

修改文字后必须同步重新生成对应配音；构建会拒绝漏配音、过期文字或损坏音频，不能悄悄交付错语言/旧讲解。

### 可选：重新生成配音

**这一步会把项目讲解文字发送到 Microsoft Edge 在线语音服务。运行前应获得项目所有者同意。** 正常启动网页不需要这一步。没有发送孩子姓名、照片、声音或其他个人信息。

需要 Python 3.10+、[uv](https://docs.astral.sh/uv/) 和带 `ffprobe` 的 FFmpeg。工具只放在项目的隔离环境中：

```sh
uv venv .tts-venv
uv pip install --python .tts-venv/bin/python --only-binary :all: -r requirements-tts.txt
npm run audio:generate -- --confirm-send-text
npm run build
```

Windows 可通过 `TTS_PYTHON` 指定 `.tts-venv/Scripts/python.exe`；脚本也会按平台选择路径。仅生成试听：

```sh
npm run audio:generate -- --confirm-send-text --only-preview
```

生成器最多同时处理两个片段，缓存与文字/声音参数匹配的已有音频，校验收到的文件后才放入公开资源目录。生成期间或失败后，**不要部署尚未通过构建校验的文件**。

`edge-tts` 是 Microsoft Edge 在线语音的**非官方客户端**，不是有 SLA 的 Azure Speech 接入。生成时需要联网，服务可能变更或拒绝请求；运行中的网页不受此影响，因为 MP3 已随项目保存。若要商业分发，请自行确认语音服务的条款；公开仓库不代表第三方服务授予任何额外权利。

### 科学准确性与儿童体验

- 太阳是恒星，不是行星。八大行星按与太阳距离排列；动画的大小、距离和公转周期经过视觉压缩，不能用来测量。
- 金星的高温与温室效应有关；火星不是在燃烧；土星环是许多颗粒，不是完整的固体圈。
- 火箭故事是多级火箭的一种简化流程，分级/抛整流罩时机因任务而异，不是工程仿真。
- 地球表面附近、忽略空气阻力时，第一宇宙速度约 **7.9 km/s**；200 km 高度的理想圆轨道约 **7.79 km/s**。数值通过 `v = sqrt(mu / (R + h))` 计算。
- 入轨需要高度及合适的水平速度，进入轨道后地球引力仍然存在；理想轨道不需要持续点火。
- 不要为了“更可爱”而删除科学说明，或把示意速度标为真实速度。陪伴与好奇心比记住数字重要。

### 项目文件

| 文件 / 目录 | 用途 |
|---|---|
| `app.jsx` | 页面、任务、语言、声音开关和配音试听 |
| `i18n.jsx` | 全部界面翻译、语言上下文、持久化 |
| `data.js` / `data-en.js` | 科学数据和中英文天文故事 |
| `solar.jsx` / `rocket.jsx` | 太阳系、小游戏、火箭动画和控制 |
| `animations.jsx` / `illustrations.jsx` | 时间轴及原创卡通图形组件 |
| `speech.jsx` | 本地音频队列、取消、错误提示、iPad 播放 |
| `voice-text.js` / `narration.js` | 配音公共文本、声音参数和完整片段清单 |
| `audio/` | 中英文源 MP3 与校验清单 |
| `scripts/` | 仅构建期的配音生成工具 |
| `build.mjs` / `dist/` | 本地打包工具及可直接运行的静态文件 |
| `server.mjs` / `manage.mjs` | 只读局域网服务和安全的状态/停止工具 |
| `tests/` | 浏览器、双语、音频、响应式和服务器检查 |
| `AGENTS.md` | 给后续维护者和 Agent 的简短导航 |

`.tts-venv/`、`.runtime/`、环境变量文件、日志、测试截图和 `node_modules/` 均不会提交。服务器只提供明确允许的页面/音频文件，不暴露源码、项目文档、运行记录或电脑其他目录。音频支持 Safari 需要的 HTTP 字节范围读取。

---

## English guide

### What this project does

**Little Astronaut** is a cartoon astronomy playground for children around age three to explore with a parent or caregiver. It uses large tap targets and responsive layouts for desktop, iPad landscape/portrait, and phones.

There are no accounts, ads, analytics, or online application backend. The **Chinese / English** switch changes the interface, planet stories, parent explanations, game feedback, and narration together. The selected language persists in the browser. Switching languages preserves the selected planet, current quiz, and rocket position.

### Content and controls

**Solar system:** tap the Sun or any of the eight planets, or use the fixed planet buttons. Listen to a short story, pause/resume orbital motion, change display speed, play Find a Planet, and expand parent facts.

**Rocket launch:** count down, lift off, turn and accelerate forward, separate rocket stages and the protective cover, enter orbit, then coast around Earth with the engine off. Pause/resume, restart, replay, drag the progress slider, or choose an individual step. Automatic narration uses short cues. **Listen to this part pauses the animation and plays the complete explanation.** Progress is stored in browser `localStorage`; returning or refreshing does not automatically launch the rocket.

Green arrows show forward motion. Peach arrows show Earth’s gravity.

**Language and audio:** use the buttons in the header. Sound on/off controls automatic narration; manual Listen and voice-preview buttons still work when automatic sound is off. The preview is an AI-generated female voice, not a recording or impersonation of a real teacher.

- Chinese voice: `zh-CN-XiaoxiaoNeural`.
- English voice: `en-US-JennyNeural`.
- Rate: `-5%`; pitch remains unchanged for a natural, rather than squeaky, sound.
- The project includes **84 validated MP3 clips**. Runtime playback uses local files, does not send text to a TTS API, and does not secretly substitute browser robotic speech.
- Tap a button before the first playback, as required by browsers. Check device volume if needed. Missing clips or playback failures produce a visible notice; text and animations remain usable.

### Install and start

Use **Node.js 18+**, preferably a recent LTS release. The committed `dist/` is ready to run: no Python, API key, or npm dependency installation is required just to serve it.

```sh
git clone --branch feat/bilingual-narration https://github.com/davidtoby/little-astronaut.git
cd little-astronaut
npm start
# Equivalent:
node server.mjs
```

Open **http://localhost:8088/** on the computer. On macOS, double-click `Start Space Playground.command` or the equivalent Chinese launcher. Leave the terminal and computer running.

To use an iPad, connect both devices to the same LAN/Wi-Fi and open the printed `LAN` URL in Safari: `http://<computer-LAN-IP>:8088/`. Landscape is recommended; portrait also works. Safari’s Add to Home Screen provides a shortcut, not an independent iPad server.

If it does not connect, check the URL’s `http://` scheme, port, Wi-Fi, guest-network device isolation, computer sleep, and firewall permission for Node.js incoming connections. The application never modifies firewall/router settings or creates a public tunnel. LAN addresses may change; use the current startup output.

### Stop, status, and restart

Press **Control+C** in the server terminal. For a background instance, run these from the project directory:

```sh
npm run status
npm run stop
# After the previous server stops:
npm start
```

The management tool verifies the app, PID, and unique instance ID through a **loopback-only** health endpoint before sending a stop signal. It never blindly kills an unrelated port listener. Once the server stops or the computer sleeps, the iPad cannot access it.

```sh
PORT=8089 npm start       # Select another port
HOST=127.0.0.1 npm start  # Loopback only; no LAN access
```

PowerShell port selection: `$env:PORT=8089; npm start`.

### Development and tests

To change source code, install the development dependencies and rebuild:

```sh
npm install
npm run build
npm test
```

If the browser binaries are not already installed, explicitly run `npx playwright install chromium webkit`. Tests do not download browsers automatically.

By default, browser tests open the local built file without starting a server. With a server already running, test HTTP access, audio byte ranges, and file restrictions:

```sh
TEST_URL=http://localhost:8088 npm test
```

Existing tool directories can be supplied with `NODE_PATH` and `PLAYWRIGHT_MODULE_PATH`; do not commit machine-specific paths. Text changes require matching regenerated narration. The build rejects missing, stale, or corrupted audio instead of shipping mismatched stories.

### Optional narration regeneration

**This sends the public lesson text to Microsoft Edge online speech synthesis. Obtain project-owner consent first.** Normal website operation does not need it. No child names, images, recordings, or other personal data are required or sent.

Install Python 3.10+, uv, and FFmpeg with `ffprobe`, then use a project-only environment:

```sh
uv venv .tts-venv
uv pip install --python .tts-venv/bin/python --only-binary :all: -r requirements-tts.txt
npm run audio:generate -- --confirm-send-text
npm run build
```

Use `--only-preview` to generate only the two sample clips. `TTS_PYTHON` can override the interpreter path, including Windows `.tts-venv/Scripts/python.exe`. Generation uses two concurrent requests at most, reuses matching validated recordings, and receives each media file in a fresh temporary directory before validation. Do not deploy partial output that fails the build checks.

`edge-tts` is an **unofficial client**, not an Azure Speech service with an SLA. Generation requires internet access and may break if the service changes. Playback remains local once the files exist. Check applicable service terms before commercial redistribution; publishing the repository does not grant extra rights in third-party services.

### Scientific and maintenance notes

The Sun is a star. The eight planets are shown in distance order, but sizes, distances, and orbital periods are adjusted for visibility. The launch is an illustrative multistage story, not an engineering simulation. Separation timing varies by mission.

First cosmic velocity near Earth’s surface is approximately **7.9 km/s**, ignoring atmosphere; a circular orbit 200 km above Earth requires approximately **7.79 km/s**. These are computed using `v = sqrt(mu / (R + h))`. Height alone is not enough: horizontal velocity matters, gravity remains present in orbit, and an ideal orbit does not require continuous engine thrust.

Read the file table above for the source layout and `AGENTS.md` for a maintenance checklist. `audio/` contains source narration and its integrity manifest; `dist/` contains the runnable page and copies of those clips. Build-only environments, runtime records, secrets/environment files, logs, screenshots, and dependencies are excluded from git. The read-only server only exposes allowlisted page/audio assets and supports Safari MP3 byte-range requests.

## References / 参考资料

- [NASA: the eight planets / 八大行星](https://science.nasa.gov/solar-system/planets/)
- [NASA Glenn: flight to orbit / 圆轨道速度与入轨](https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/flight-to-orbit/)
- [Microsoft Speech voices / 语音目录](https://learn.microsoft.com/en-us/azure/ai-services/speech-service/language-support?tabs=tts)
- [edge-tts project and usage / 生成工具](https://github.com/rany2/edge-tts)

A public source repository is not itself a public website deployment. This project is designed for local/LAN hosting; GitHub Pages or other internet hosting would be a separate deployment decision.
