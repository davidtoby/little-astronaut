'use strict';
// Pre-generated audio is served by this Mac. No cloud synthesis runs on the iPad.
const narrationPlayer = (() => {
  const manifest = window.ASTRO_NARRATION;
  const cache = new Map();
  let context, source, media, epoch = 0, busyText = null;
  let style = manifest.defaultVoice;
  let paused = false;
  function unlock() {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      if (!context) context = new AudioContextClass();
      if (context.state !== 'running') context.resume().catch(() => {});
    }
  }
  function stop() {
    epoch++;
    paused = false;
    busyText = null;
    if (source) { try { source.stop(); } catch (_) {} source = null; }
    if (media) { media.pause(); media.currentTime = 0; }
    document.getElementById('sound').removeAttribute('data-playing');
  }
  function getClip(text) { return manifest.clips[text]?.[astroI18n.language === 'en' ? 'en-' + style : style]; }
  function load(clip) {
    if (cache.has(clip.src)) return cache.get(clip.src);
    const promise = (async () => {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 10000);
      try {
        const response = await fetch(clip.src, { signal: controller.signal });
        if (!response.ok) throw new Error('Audio unavailable');
        return await context.decodeAudioData(await response.arrayBuffer());
      } finally { clearTimeout(timer); }
    })();
    cache.set(clip.src, promise);
    promise.catch(() => cache.delete(clip.src));
    return promise;
  }
  async function play(text) {
    stop();
    const clip = getClip(text);
    if (!clip) { toast('这段讲解暂时没有配音，可以一起读画面里的中文哦。'); return; }
    const ticket = epoch;
    busyText = text;
    const finish = () => {
      if (ticket !== epoch) return;
      busyText = null;
      source = null;
      document.getElementById('sound').removeAttribute('data-playing');
    };
    try {
      if (context) {
        const buffer = await load(clip);
        if (ticket !== epoch) return;
        // The context is unlocked by the child's first tap; subsequent narration
        // can start automatically as the rocket moves between stages on iOS.
        if (!paused && context.state !== 'running') await context.resume();
        if (ticket !== epoch) return;
        source = context.createBufferSource();
        source.buffer = buffer;
        source.connect(context.destination);
        source.onended = finish;
        source.start();
      } else {
        if (!media) media = new Audio();
        media.src = clip.src;
        media.onended = finish;
        media.onerror = () => { finish(); toast('配音暂时没有加载好，请点“听一听”再试一次。'); };
        await media.play();
        if (ticket !== epoch) return;
      }
      document.getElementById('sound').dataset.playing = style;
    } catch (_) {
      if (ticket !== epoch) return;
      finish();
      toast('点一下“听一听”，老师就开始讲解啦。');
    }
  }
  function pause() {
    paused = true;
    if (context) context.suspend().catch(() => {});
    if (media) media.pause();
  }
  function resume() {
    paused = false;
    if (context) context.resume().catch(() => {});
    if (media && busyText) media.play().catch(() => {});
  }
  function setVoice(value) {
    if (!manifest.voices[value]) return;
    stop();
    style = value;
    try { localStorage.setItem('astro-narrator', value); } catch (_) {}
  }
  try {
    const saved = localStorage.getItem('astro-narrator');
    if (manifest.voices[saved]) style = saved;
  } catch (_) {}
  window.addEventListener('pagehide', stop);
  return { unlock, stop, play, pause, resume, setVoice,
    get voice() { return style; },
    get name() { return t(manifest.voices[style].name); },
    isBusyFor(text) { return busyText === text; },
    duration(text) { return getClip(text)?.duration || 0; },
    longestDuration(text) { return Math.max(0, ...Object.entries(manifest.clips[text] || {}).filter(([name]) => (astroI18n.language === 'en') === name.startsWith('en-')).map(([, c]) => c.duration)); }
  };
})();
