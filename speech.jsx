import { useCallback, useEffect, useRef, useState } from 'react';
import manifest from './audio/manifest.json';

const recordings = new Map(manifest.entries.map(entry => [`${entry.lang}:${entry.text}`, entry]));

// One HTMLAudioElement stays unlocked across clips on iPad Safari. The website
// never sends text to a speech service or silently substitutes robotic voices.
export function useNarration(lang, t) {
  const [notice, setNotice] = useState('');
  const player = useRef(null);
  const epoch = useRef(0);
  const lastRequest = useRef(null);
  const stopSpeech = useCallback(() => {
    epoch.current++;
    lastRequest.current = null;
    if (!player.current) return;
    player.current.onended = null;
    player.current.onerror = null;
    player.current.pause();
    try { player.current.currentTime = 0; } catch {}
  }, []);
  useEffect(() => {
    const audio = new Audio();
    audio.preload = 'none'; audio.volume = .9;
    player.current = audio;
    const hide = () => { if (document.hidden) stopSpeech(); };
    document.addEventListener('visibilitychange', hide);
    return () => {
      stopSpeech(); audio.removeAttribute('src'); audio.load();
      document.removeEventListener('visibilitychange', hide);
    };
  }, [stopSpeech]);
  const speak = useCallback(input => {
    const texts = Array.isArray(input) ? input : [input];
    const key = JSON.stringify([lang, texts]);
    // Launch click and the phase observer can request the same opening cue.
    if (lastRequest.current?.key === key && Date.now() - lastRequest.current.at < 500 && player.current && !player.current.paused) return;
    stopSpeech();
    const clips = texts.map(text => recordings.get(`${lang}:${text}`));
    if (clips.some(clip => !clip) || !player.current) { setNotice(t('audioUnavailable')); return; }
    setNotice('');
    const token = epoch.current;
    lastRequest.current = { key, at: Date.now() };
    let index = 0;
    const playNext = () => {
      if (token !== epoch.current || index >= clips.length) return;
      const audio = player.current;
      const clip = clips[index++];
      const reportError = () => {
        if (token === epoch.current) { audio.onended = null; setNotice(t('audioUnavailable')); }
      };
      audio.src = new URL(`./audio/${clip.file}`, document.baseURI).href;
      audio.onended = playNext;
      audio.onerror = reportError;
      const promise = audio.play();
      if (promise?.catch) promise.catch(error => {
        if (error.name !== 'AbortError') reportError();
      });
    };
    playNext();
  }, [lang, t, stopSpeech]);
  return { speak, stopSpeech, notice, setNotice };
}
