// Adapted from lark-apps creative-design/starter-components/animations.jsx.
// Keep its Stage/context/interpolation model; use responsive SVG, touch-sized
// controls, throttled persistence, and pause-on-background for a child's app.
import React, { useEffect, useRef, useState, useContext } from 'react';

export const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export const Easing = {
  linear: t => t,
  easeInOutCubic: t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2,
};
export function interpolate(input, output, ease = Easing.linear) {
  return t => {
    if (t <= input[0]) return output[0];
    for (let i = 0; i < input.length - 1; i++) {
      if (t <= input[i + 1]) {
        const p = ease((t - input[i]) / (input[i + 1] - input[i]));
        return output[i] + (output[i + 1] - output[i]) * p;
      }
    }
    return output[output.length - 1];
  };
}
const TimelineContext = React.createContext(null);
export const useTimeline = () => useContext(TimelineContext);
export const useTime = () => useTimeline().time;
export function Sprite({ start = 0, end = Infinity, children }) {
  const time = useTime();
  return time >= start && time < end ? children : null;
}
export function Stage({ duration, persistKey, children, controls, onPause }) {
  const [time, setTime] = useState(() => {
    try { return clamp(Number(localStorage.getItem(persistKey)) || 0, 0, duration); }
    catch { return 0; }
  });
  const [playing, setPlaying] = useState(false);
  const currentTime = useRef(time);
  currentTime.current = time;
  useEffect(() => {
    const save = () => {
      try { localStorage.setItem(persistKey, String(currentTime.current)); } catch {}
    };
    const timer = setInterval(save, 750);
    window.addEventListener('pagehide', save);
    return () => { clearInterval(timer); save(); window.removeEventListener('pagehide', save); };
  }, [persistKey]);
  useEffect(() => {
    if (!playing) {
      try { localStorage.setItem(persistKey, String(currentTime.current)); } catch {}
      return;
    }
    let raf, previous;
    const step = stamp => {
      const dt = previous == null ? 0 : Math.min((stamp - previous) / 1000, .1);
      previous = stamp;
      const next = Math.min(currentTime.current + dt, duration);
      currentTime.current = next;
      setTime(next);
      if (next >= duration) setPlaying(false);
      else raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [playing, duration]);
  useEffect(() => {
    const hide = () => { if (document.hidden) { onPause?.(); setPlaying(false); } };
    const key = e => {
      if (e.target.closest('button, input, textarea, summary, a, [role="button"]')) return;
      if (e.code === 'Space') { e.preventDefault(); if (playing) onPause?.(); setPlaying(p => !p); }
      if (e.code === 'ArrowRight') { onPause?.(); setTime(t => clamp(t + 2, 0, duration)); }
      if (e.code === 'ArrowLeft') { onPause?.(); setTime(t => clamp(t - 2, 0, duration)); }
    };
    document.addEventListener('visibilitychange', hide);
    window.addEventListener('keydown', key);
    return () => { document.removeEventListener('visibilitychange', hide); window.removeEventListener('keydown', key); };
  }, [duration, onPause, playing]);
  return <TimelineContext.Provider value={{ time, duration, playing, setTime, setPlaying }}>
    <div className="timeline-stage">{children}</div>
    {controls}
  </TimelineContext.Provider>;
}
