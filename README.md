# 小小宇航员 · Little Astronaut

[中文说明](#中文说明) · [English guide](#english-guide)

一个适合幼儿与家长一起探索的中英文天文网页：认识太阳系、发射小火箭、听自然女声讲解。可在电脑上运行，通过同一局域网让 iPad 访问。

A bilingual astronomy playground for young children and their grown-ups: meet the Solar System, launch a little rocket and listen to natural female narration. Run it on a computer and open it on an iPad on the same local network.

## 中文说明

### 网页内容和操作

- **首页**：两个大入口「了解太阳系」和「火箭发射」。页面适配平板横竖屏及小屏幕。
- **了解太阳系**：太阳及八颗行星绕太阳运行的卡通示意。点击画面中的星球或下方的大按钮，显示名字、介绍、小知识与卡通头像；可找到地球、暂停公转、听讲解。
- **火箭发射**：倒计时后播放点火升空、缓慢转弯、分级加速、飞船分离、进入地球轨道五个步骤。可以暂停、继续、重播、跳到下一步，也可以点击步骤单独查看。点击准备好的火箭本体也能发射。
- **语言**：右上角选「中文 / English」。按钮、行星说明、画布文字、家长科学说明和配音一起切换，并保留当前星球、场景与发射步骤。浏览器记住上次选择的语言和声音。
- **声音**：选「温柔老师」或「活泼姐姐」，点「开启老师配音」自动朗读；即使自动配音关闭，也可以点「听一听」单独播放。每个步骤给完整讲解留出时间；暂停火箭同时暂停声音。快速点击新星球会停止上一段配音。
- **iPad**：首次播放需要点按页面来解锁音频。可以通过 Safari 分享菜单「添加到主屏幕」。

### 科学内容的边界

太阳是恒星，八颗行星顺序正确，内侧行星通常公转更快。画面不按实际大小、距离或公转周期缩放，不展示自转。火箭大小、飞行轨迹、发射耗时和分离时序也是教学示意。

地球表面附近的理论第一宇宙速度约 **7.9 km/s**，忽略空气阻力；这并不表示真实飞船能在稠密大气里维持这样的轨道。动画采用约 **200 km** 高的圆轨道示例，对应速度约 **7.8 km/s**，公式为 `v = √(GM/r)`。核心解释是先穿过大气，再转弯并获得足够的切向速度；入轨后引力仍存在，飞船持续自由落体。详细说明可以展开网页「给爸爸妈妈的科学小纸条」。

参考：[NASA 太阳系行星](https://science.nasa.gov/solar-system/planets/)；[NASA JPL 轨道速度说明](https://www.jpl.nasa.gov/blog/2013/2/a-hard-days-flight-dawn-achieves-orbital-velocity)。

### 配音原理、API 和 token

当前配音使用 Python 库 **[edge-tts](https://github.com/rany2/edge-tts)**（锁定版本 `7.3.1`）。库通过 WebSocket 请求 Microsoft Edge 在线朗读服务，服务把文本合成为语音并返回 MP3。它是对 Edge 服务协议的封装，**不是使用个人 Azure Speech API Key 的官方 SDK 调用**。

流程：`项目讲解文本 → 在线语音合成 → 本地 MP3 → 局域网 HTTP → 浏览器 Web Audio 播放`。

- 生成这些配音没有输入用户的个人 API Key，也没有使用大语言模型 API 的 token 额度。
- 库会自动处理服务协议使用的客户端标识和校验参数，例如 `TRUSTED_CLIENT_TOKEN` 和 `Sec-MS-GEC`；不要把它们与个人密钥或大模型 token 数混淆。项目源码不复制这些值。
- 配音由 AI 合成，不是真人录音，也没有采集孩子或老师的声音。年龄感和亲切程度是所选合成声音及语速带来的风格。
- **日常使用不调用在线 TTS**：80 段 MP3 已随项目保存，电脑和 iPad 播放同一套音频；只需要访问电脑的局域网服务。
- **只有重新生成或修改配音时**才需要联网。Edge 的在线协议可能变动；已有 MP3 的播放不受生成服务暂时不可用影响。

| 风格 | 中文声音 | 英文声音（英式英语） |
| --- | --- | --- |
| 温柔老师 / Gentle teacher | `zh-CN-XiaoxiaoNeural`，语速 -10% | `en-GB-SoniaNeural`，语速 -10% |
| 活泼姐姐 / Cheerful friend | `zh-CN-XiaoyiNeural`，语速 -8% | `en-GB-LibbyNeural`，语速 -8% |

全部声音保留自然音高。每种语言包含 20 段讲解、每段两种声音。

### 下载、安装和前台运行

运行网页只需要 **Python 3.10+**；不需要安装 Node、TTS 模型或 API Key。使用 Git 克隆，或从 GitHub 下载 ZIP 并解压。

```sh
git clone https://github.com/davidtoby/little-astronaut.git
cd little-astronaut
python3 server.py
```

在运行电脑打开 `http://127.0.0.1:8787`。iPad 连接同一个 Wi-Fi，在 Safari 打开 `http://<电脑的局域网IP>:8787`。默认服务监听 `0.0.0.0:8787`，只开放允许的 `public/` 网页资源，不提供项目文档、日志或目录列表。

前台运行时按 **Ctrl+C** 停止。自定义端口或仅允许本机访问：

```sh
python3 server.py --port 8888
python3 server.py --bind 127.0.0.1 --port 8888
```

如果后台服务已占用 8787，请先停止后台服务，再启动同端口的前台服务。

### macOS 后台启动、自启动和停止

双击「启动天文乐园.command」即可启动后台服务并显示当前局域网网址。关闭终端后仍运行，登录 Mac 时自动启动。也可以在项目目录使用：

```sh
python3 manage.py install       # 安装用户级 LaunchAgent 并立即启动
python3 manage.py start         # 启动或重启，同样会生成自启动配置
python3 manage.py status        # 查看服务是否加载，以及本机和局域网网址
python3 manage.py stop          # 停止当前后台服务
python3 manage.py uninstall     # 停止服务并移除登录自启动配置
```

双击「停止天文乐园.command」等同于 `manage.py stop`。停止会保留配置，下次登录 Mac 时仍可能自动启动；彻底取消自启动请用 `uninstall`。`start --port 8888` 可设置后台端口。

LaunchAgent 由脚本根据当前 Python、用户和项目路径生成，存放于 `~/Library/LaunchAgents/com.tobylab.astro-playground.plist`。日志在项目 `logs/server.log` 和 `logs/server-error.log`。每个用户只管理一份此标签的服务；从另一份项目副本启动，会更新服务指向的新目录。后台管理需要已登录的 macOS 桌面会话；其他系统使用前台 `server.py`。

电脑需要保持开机、联网且未睡眠。路由器重新分配 IP 后，运行 `manage.py status` 查看新网址。若 iPad 打不开，检查是否在同一 Wi-Fi、是否使用访客网络隔离，以及防火墙是否允许 Python 传入连接。没有配置互联网端口转发。

### 开发、更新配音和验证

这是无需构建的 HTML/CSS/JavaScript 项目。修改 `public/` 后刷新浏览器即可看到变化。翻译源文件是 `public/translations.json`，更新后运行：

```sh
python3 scripts/build_i18n.py
```

配音文本源文件是 `public/narration-content.json`。修改对应的 `zh` / `en` 字段后，安装可选的配音生成工具（另需系统能运行 `ffprobe`，它随 FFmpeg 安装）：

```sh
python3 -m venv .venv-voice
source .venv-voice/bin/activate
python -m pip install -r requirements-voice.txt
python scripts/generate_narration.py --language en
# --language zh：只更新中文；--language all：两种语言；--force：强制重新生成
```

生成器复用文字相同的已有音频，仅在完整生成成功后更新索引。需要更换声音时，修改生成器的 `VOICES` 配置并加 `--force`。

开发测试另外需要 Node.js/npm（版本须满足 jsdom 的 engines 要求；用户安装的 Node 26 已验证）：

```sh
npm ci
npm test
npm run check
python3 -m unittest discover -s tests -p '*_test.py'
```

自动测试覆盖语言切换、首屏恢复、场景与步骤文本、配音完整性、快速点击竞争、暂停继续、加载失败和服务器资源边界。DOM 与音频测试使用模拟环境，不等同于实体 iPad 测试；发布或改动交互后，应在实际浏览器/iPad 检查布局、声音与完整发射。

### 项目文件与后续 Agent

| 路径 | 用途 |
| --- | --- |
| `public/index.html` / `style.css` | 页面结构、中文静态原文、触控和响应式布局 |
| `public/app.js` | 行星与火箭动画、交互状态、画布文字和配音同步 |
| `public/translations.json` / `i18n-data.js` / `i18n.js` | 英文翻译源、生成的浏览器数据和运行时语言切换 |
| `public/narration-content.json` | 20 段讲解的稳定标识、中文索引键和中英文口播文本 |
| `public/narration-player.js` | Web Audio 播放器、声音选择、取消过时播放、暂停继续 |
| `public/audio/` | 80 个 MP3、`manifest.json` 元数据和浏览器索引 `narration.js` |
| `server.py` / `manage.py` | 跨平台前台静态服务、macOS 后台生命周期管理 |
| `scripts/` / `tests/` | 翻译编译、可选配音生成、自动检查 |
| `AGENTS.md` | 给后续 Agent 的编辑与验证约定 |

后续编辑请保持中文配音索引键稳定、确保两种语言都能阅读和播放、保留科学说明和大按钮。不要把在线密钥或实时 TTS 接入浏览器。虚拟环境、日志、临时诊断文件和用户本机配置均不应提交到 Git。

---

## English guide

### Content and controls

**Home** offers two large choices: **Explore the Solar System** and **Launch a Rocket**. The layout supports tablets in portrait or landscape and smaller screens.

**Solar System:** tap the Sun or one of the eight planets in the animation or use the large planet buttons. Each friend has a name, cartoon portrait, short story and fact. Find Earth, pause the planets or tap **Listen**.

**Rocket:** tap the launch button, or the ready rocket itself, to start a countdown followed by five steps: lift-off, gentle turn, staging and acceleration, separation, and orbit. Pause, continue, replay or skip a step. The five step buttons also allow individual exploration. A step has time for its full narration; pausing the flight pauses its audio.

Use the **中文 / English** selector to change the interface, planet stories, canvas labels, grown-up science notes and narration together. The current scene, planet and flight step are preserved. Language and narrator preferences are stored in the browser.

Choose **Gentle teacher** or **Cheerful friend** and turn on narration. **Listen** works even when automatic narration is off. Tapping a new planet cancels the previous story. On an iPad, first tap the page to unlock audio playback. Safari’s **Add to Home Screen** provides a convenient shortcut.

### Scientific scope

The Sun is a star. Planet order and faster inner orbits are preserved, but sizes, distances and periods are deliberately compressed. Planetary spin is not shown. Rocket paths, sizes, timing and staging are teaching illustrations, rather than a mission simulation.

The near-surface **first cosmic velocity is about 7.9 km/s**, ignoring air resistance. A real spacecraft cannot sustain that ideal orbit within dense atmosphere. The animation instead uses a circular orbit about **200 km** high, requiring about **7.8 km/s**, with `v = √(GM/r)`. The rocket first climbs through the atmosphere, turns and gains tangential speed. Gravity continues to act in orbit; the spacecraft remains in free fall. An ideal orbit does not require a continuously firing engine. Expand **A science note for grown-ups** for more detail. References: [NASA planets](https://science.nasa.gov/solar-system/planets/) and [NASA JPL orbital velocity](https://www.jpl.nasa.gov/blog/2013/2/a-hard-days-flight-dawn-achieves-orbital-velocity).

### How narration works: API and tokens

The optional generator uses **[edge-tts](https://github.com/rany2/edge-tts) 7.3.1**, a Python wrapper around Microsoft Edge’s online read-aloud service. It sends text over WebSocket and receives synthetic speech as MP3. It is not an official Azure Speech SDK integration using a personal Azure API key.

`Story text → online speech synthesis → saved MP3 → local-network HTTP → browser Web Audio playback`.

No personal API key was entered to generate these clips, and generation does not use an LLM API token allowance. The library handles protocol client identifiers and validation parameters, such as `TRUSTED_CLIENT_TOKEN` and `Sec-MS-GEC`; those are different from a personal API key or a count of LLM tokens. This repository does not copy their values.

These are AI-generated voices, not recordings of a person; no child or teacher voice was collected. The voice identity and slightly slower delivery create the intended teaching style. Chinese uses Xiaoxiao (-10%) and Xiaoyi (-8%); British English uses Sonia (-10%) and Libby (-8%), all at natural pitch.

There are **80 committed MP3 files**: 20 stories in two languages and two voices per language. Normal playback needs only the local computer’s server, with no live TTS call. Internet access, edge-tts and FFmpeg/ffprobe are needed only to regenerate narration. The upstream online protocol can change; existing audio remains playable if synthesis becomes unavailable.

### Download, install and run

The site requires **Python 3.10+**. Node, speech models and API keys are not required to run it. Clone the public repository or download and extract its ZIP:

```sh
git clone https://github.com/davidtoby/little-astronaut.git
cd little-astronaut
python3 server.py
```

On the computer, open `http://127.0.0.1:8787`. Connect the iPad to the same Wi-Fi and open `http://<computer-LAN-IP>:8787` in Safari. The default listener is `0.0.0.0:8787`. Only permitted assets in `public/` are served; project documents, logs and directory listings are unavailable.

Press **Ctrl+C** to stop the foreground server. To change the port, use `python3 server.py --port 8888`. To permit only local access, add `--bind 127.0.0.1`. Stop an existing background instance before starting a foreground server on the same port.

### macOS background start, stop and auto-start

Double-click `启动天文乐园.command` to start the managed background server and display its current LAN URL. It keeps running when the terminal closes and starts at login. Alternatively:

```sh
python3 manage.py install        # Create a user LaunchAgent and start immediately
python3 manage.py start          # Start/restart and create auto-start configuration
python3 manage.py status         # Show whether the service is loaded and its URLs
python3 manage.py stop           # Stop the current background service
python3 manage.py uninstall      # Stop it and remove login auto-start
```

Double-click `停止天文乐园.command` to stop. **Stop keeps the configuration**, so it can start again at the next login; use **uninstall** to disable auto-start. `python3 manage.py start --port 8888` sets a custom background port.

The manager generates `~/Library/LaunchAgents/com.tobylab.astro-playground.plist` using the current Python executable and checkout path. Logs are written to `logs/server.log` and `logs/server-error.log`. One managed instance exists per user; starting from another checkout repoints this service to that checkout. Management requires a logged-in macOS desktop session. On other systems, use the foreground Python server.

Keep the computer on, connected and awake. Router-assigned IPs can change; run `manage.py status` to see the current address. If the iPad cannot connect, check the shared Wi-Fi, guest-network isolation and whether the firewall allows incoming Python connections. No internet port forwarding is configured.

### Development and optional audio regeneration

This is a buildless HTML/CSS/JavaScript application. Edit `public/` files and reload the browser. Edit the English dictionary in `public/translations.json`, then compile its synchronous browser asset:

```sh
python3 scripts/build_i18n.py
```

Narration source is `public/narration-content.json`. Edit a story’s `zh` or `en` field, then install optional generation dependencies. `ffprobe` from FFmpeg must be available on PATH:

```sh
python3 -m venv .venv-voice
source .venv-voice/bin/activate
python -m pip install -r requirements-voice.txt
python scripts/generate_narration.py --language en
```

Use `--language zh` for Chinese, `--language all` for both, and `--force` to regenerate every selected clip. Unchanged text reuses existing audio. Indexes update only after all requested generation succeeds. To change the voice identity, edit `VOICES` in the generator and regenerate with `--force`.

For tests, install Node.js/npm compatible with jsdom’s `engines` requirement (Node 26 was verified here):

```sh
npm ci
npm test
npm run check
python3 -m unittest discover -s tests -p '*_test.py'
```

Tests cover language switching and restoration, translated scenes and steps, audio coverage, stale-playback races, pause/resume, failed loads and static-server resource boundaries. DOM and audio contexts are mocked, so these checks do not replace real browser or iPad layout/audio testing.

### Architecture and future agents

- `public/index.html` and `style.css`: static Chinese source, layout and touch controls.
- `public/app.js`: Canvas animation, interaction state, dynamic labels and narration timing.
- `translations.json`, `i18n-data.js`, `i18n.js`: translation source, compiled dictionary and runtime switching.
- `narration-content.json`: 20 stable IDs, canonical Chinese lookup keys and bilingual spoken text.
- `narration-player.js` and `audio/`: local playback, voice selection, cancellation, pausing, MP3 files and indexes.
- `server.py` and `manage.py`: portable static server and macOS lifecycle management.
- `scripts/`, `tests/`, `AGENTS.md`: generators, verification and agent editing conventions.

Read `AGENTS.md` before editing. Preserve canonical narration keys, bilingual reading/audio coverage, scientific qualifications and child-friendly controls. Do not add browser credentials or live speech synthesis. Keep environments, logs, temporary diagnostics and generated user-specific LaunchAgent configuration out of Git.
