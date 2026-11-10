import React, { useEffect, useRef, useState } from 'react';
import { DURATION, phaseAt, circularSpeed } from './data.js';
import { useLanguage } from './i18n.jsx';
import { Stage, Sprite, useTimeline, interpolate, Easing } from './animations.jsx';
import { PlanetBody, RocketBody, Astronaut, Stars, Icon } from './illustrations.jsx';

const cameraY = interpolate([0, 5, 20], [620, 620, 286], Easing.easeInOutCubic);
const cameraScale = interpolate([0, 5, 20], [1.5, 1.5, .75], Easing.easeInOutCubic);
const radiusAt = interpolate([0, 4, 10, 23], [233, 233, 267, 300], Easing.easeInOutCubic);
const turnAt = interpolate([0, 8, 23], [-Math.PI / 2, -Math.PI / 2, -.15]);
const tiltAt = interpolate([0, 8, 23], [0, 0, 90]);

function RocketScene({ onPhase, audio, speak, playbackRef }) {
  const { phases, lang, t } = useLanguage();
  const { time, playing, setPlaying } = useTimeline();
  useEffect(() => {
    playbackRef.current = { pause: () => setPlaying(false) };
    return () => { playbackRef.current = null; };
  }, [playbackRef, setPlaying]);
  const phase = phaseAt(time);
  const firstRender = useRef(true);
  useEffect(() => { onPhase(phase); }, [phase, onPhase]);
  useEffect(() => {
    // Narrate only after a real user starts/resumes the launch; never on load.
    if (firstRender.current) { firstRender.current = false; return; }
    if (playing && audio) speak(phases[phase].line);
  }, [phase, playing, audio, speak, phases]);
  const theta = time < 23 ? turnAt(time) : -.15 + (time - 23) * Math.PI * 2 / 24;
  const radius = radiusAt(time);
  const x = Math.cos(theta) * radius, y = Math.sin(theta) * radius;
  const rotation = theta * 180 / Math.PI + 90 + tiltAt(time);
  const separated = time >= 16;
  const orbiting = time >= 23;
  const rocketSize = time < 29 ? 1 : .85;
  return <svg className="rocket-scene" viewBox="0 0 900 570" aria-label={t('rocketMapLabel', { phase: phases[phase].title })}>
    <defs>
      <radialGradient id="atmosphere"><stop offset=".75" stopColor="#7abbeb" stopOpacity="0"/><stop offset=".91" stopColor="#7abbeb" stopOpacity=".1"/><stop offset="1" stopColor="#7abbeb" stopOpacity=".36"/></radialGradient>
      <marker id="gravity-arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6" fill="none" stroke="#eab69c" strokeWidth="1.4"/></marker>
      <marker id="velocity-arrow" markerWidth="8" markerHeight="8" refX="5" refY="3" orient="auto"><path d="M0 0 6 3 0 6" fill="none" stroke="#b6dbaa" strokeWidth="1.4"/></marker>
    </defs>
    <Stars count={75}/>
    <g transform={`translate(450 ${cameraY(time)}) scale(${cameraScale(time)})`}>
      <circle r="200" fill="url(#atmosphere)"/>
      {time >= 10 && <circle r="300" fill="none" stroke="#d8cbf3" strokeWidth="2" strokeDasharray="7 8" opacity={Math.min((time - 10) / 10, .65)}/>}
      <g transform="scale(4)"><PlanetBody id="earth" color="#79c1e6"/></g>
      <Sprite start={0} end={11}>
        <g opacity={1 - Math.max(0, time - 7) / 4}>
          <path d="M-34-180h68" stroke="#7688b0" strokeWidth="7" strokeLinecap="round"/>
          <path d="M-42-180v-93h15v93m-15-75h15m-15 20h15m-15 20h15m-15 20h15" fill="none" stroke="#9eacd0" strokeWidth="4"/>
          <g fill="#d3e0ed" opacity=".7"><ellipse cx="-128" cy="-157" rx="30" ry="10"/><ellipse cx="112" cy="-175" rx="36" ry="12"/></g>
        </g>
      </Sprite>
      {time >= 4 && time < 10 && <g transform="translate(0 -182)" fill="#e9e6f1" opacity={Math.max(0, 1 - (time - 4) / 6)}>{[-1, 1].map(sign => <g key={sign} transform={`translate(${sign * (20 + (time - 4) * 18)} 0)`}><ellipse rx="30" ry="13"/><ellipse cx={sign * 24} cy="3" rx="22" ry="10"/></g>)}</g>}
      <Sprite start={16} end={21}>
        <g transform={`translate(${x} ${y}) rotate(${rotation})`} opacity={Math.max(0, 1 - (time - 16) / 5)}>
          <g transform={`translate(${-12 * (time - 16)} ${28 + (time - 16) * 20}) rotate(${(time - 16) * 13})`}><rect x="-16" width="32" height="35" rx="6" fill="#ddd9f0"/><path d="M-16 12-28 23v20l17-8M16 12l12 11v20l-17-8" fill="#a89dd4"/></g>
          {[-1, 1].map(sign => <path key={sign} d={sign < 0 ? 'M0-62Q-24-45-24-20H0Z' : 'M0-62Q24-45 24-20H0Z'} fill="#eee5d8" transform={`translate(${sign * ((time - 16) * 20 + 6)} ${-(time - 16) * 7}) rotate(${sign * (time - 16) * 15})`}/>)}
        </g>
      </Sprite>
      {orbiting && <g transform={`translate(${x} ${y})`}>
        <path d={`M${-Math.cos(theta) * 30} ${-Math.sin(theta) * 30}l${-Math.cos(theta) * 55} ${-Math.sin(theta) * 55}`} stroke="#eab69c" strokeWidth="3" markerEnd="url(#gravity-arrow)"/>
        <path d={`M${-Math.sin(theta) * 39} ${Math.cos(theta) * 39}l${-Math.sin(theta) * 64} ${Math.cos(theta) * 64}`} stroke="#b6dbaa" strokeWidth="3" markerEnd="url(#velocity-arrow)"/>
      </g>}
      <g data-testid="flying-rocket" data-orbiting={orbiting} transform={`translate(${x} ${y}) rotate(${rotation}) scale(${rocketSize})`}>
        {time >= 29 && <g fill="#a2b9e1" stroke="#6579a6" strokeWidth="2"><rect x="-62" y="-5" width="37" height="23" rx="3"/><rect x="25" y="-5" width="37" height="23" rx="3"/><path d="M-24 6h-10m58 0h10M-50-4v21m12-21v21m12-10h-35M37-4v21m12-21v21m-23-10h35"/></g>}
        <RocketBody flame={time >= 4 && time < 23} upperOnly={separated} cabin={time >= 16} time={time}/>
      </g>
    </g>
    <Sprite start={.3} end={4}><g className="countdown" transform="translate(650 200)"><circle r="55" fill="#eee6ff" fillOpacity=".1" stroke="#d0bcec" strokeWidth="2"/><text textAnchor="middle" y="20" fill="#faf3ff" fontSize="66" fontWeight="700">{Math.max(1, 3 - Math.floor((time - .3) / 1.2))}</text></g></Sprite>
    {orbiting && <g transform="translate(26 505)"><circle cy="0" r="5" fill="#b6dbaa"/><text x="14" y="6" className="legend-text">{t('forwardMotion')}</text><circle cx={lang === 'en' ? 200 : 126} r="5" fill="#eab69c"/><text x={lang === 'en' ? 214 : 140} y="6" className="legend-text">{t('earthGravity')}</text></g>}
    <text x="874" y="548" textAnchor="end" className="scene-note">{t('sceneNote')}</text>
  </svg>;
}
function LaunchControls({ audio, speak, stopSpeech }) {
  const { phases, t } = useLanguage();
  const { time, duration, playing, setPlaying, setTime } = useTimeline();
  const initial = time === 0;
  const completed = time >= duration;
  const launch = () => {
    // iPad Safari requires the first audio play directly in a user gesture.
    if (playing) stopSpeech();
    if (!playing && audio) speak(phases[initial || completed ? 1 : phaseAt(time)].line);
    if (initial || completed) setTime(.31);
    setPlaying(p => completed || initial || !p);
  };
  return <div className="launch-controls">
    <div className="launch-buttons"><button className="launch-button" data-testid="launch-toggle" onClick={launch}><Icon name={playing ? 'pause' : 'play'}/>{t(playing ? 'pause' : initial ? 'launch' : completed ? 'flyAgain' : 'resumeFlight')}</button><button className="dark-button" data-testid="launch-reset" aria-label={t('rocketResetLabel')} onClick={() => { stopSpeech(); setTime(0); setPlaying(false); }}><Icon name="replay"/>{t('fromStart')}</button></div>
    <div className="timeline-input"><label htmlFor="launch-progress">{t('progress')}</label><input id="launch-progress" aria-label={t('progress')} type="range" min="0" max={duration} step=".1" value={time} onChange={e => { stopSpeech(); setTime(Number(e.target.value)); }}/><span>{Math.round(time)} / {duration} {t('seconds')}</span></div>
    <div className="phase-steps" aria-label={t('stepsLabel')}>{phases.slice(1).map((p, i) => <button key={p.start} data-phase={i + 1} className={phaseAt(time) === i + 1 ? 'current' : time > p.start ? 'done' : ''} aria-label={t('watchPhase', { phase: p.title })} aria-current={phaseAt(time) === i + 1 ? 'step' : undefined} onClick={() => { stopSpeech(); setTime(p.start); setPlaying(false); }}><span>{i + 1}</span>{p.short}</button>)}</div>
  </div>;
}
export function Rocket({ audio, speak, stopSpeech }) {
  const { phases, t } = useLanguage();
  const [phase, setPhase] = useState(0);
  const playbackRef = useRef(null);
  useEffect(() => () => stopSpeech(), [stopSpeech]);
  const listenToPart = () => {
    stopSpeech(); playbackRef.current?.pause(); speak(phases[phase].text);
  };
  return <>
    <div className="section-heading"><div><span className="eyebrow">{t('rocketEyebrow')}</span><h2>{t('rocketHeading')}</h2><p>{t('rocketInstruction')}</p></div><span className="explored"><Icon name="heart" size={18}/>{t('watchTogether')}</span></div>
    <div className="explore-grid rocket-grid">
      <section className="space-panel" aria-label={t('rocketPanelLabel')}><div className="space-heading"><span><i className="status-dot peach"></i>{phases[phase].title}</span><span className="mini-note">{t('astronautMission')}</span></div>
        <Stage duration={DURATION} persistKey="little-astronaut-flight-v1" onPause={stopSpeech} controls={<LaunchControls audio={audio} speak={speak} stopSpeech={stopSpeech}/>}><RocketScene onPhase={setPhase} audio={audio} speak={speak} playbackRef={playbackRef}/></Stage>
      </section>
      <aside className="friend-card rocket-story" aria-label={t('rocketStoryLabel')}><span className="friend-kicker">{t('flightDiary')}</span><Astronaut className="story-astronaut"/><span className="planet-tag">{phase === 0 ? phases[0].title : t('stepCount', { step: phase })}</span><h3>{phases[phase].title}</h3><p className="friend-line">{phases[phase].line}</p><p className="friend-description" aria-live="polite">{phases[phase].text}</p><button className="primary-button listen-button" data-testid="listen-phase" onClick={listenToPart}><Icon name="sound"/>{t('listenPhase')}</button><p className="gentle-tip">{t('gentleTip')}</p></aside>
    </div>
    <details className="parent-guide"><summary><span><Icon name="info"/>{t('parentGuideTitle')}</span><span className="open-label">{t('expand')}</span></summary><div className="parent-content"><div><h3>{t('speedHeading')}</h3><p>{t('nearSpeedBefore')}<strong>{circularSpeed(0).toFixed(1)} {t('speedUnit')}</strong>{t('nearSpeedAfter')}</p><p>{t('altitudeSpeedBefore')}<strong>{circularSpeed(200).toFixed(2)} {t('speedUnit')}</strong>{t('altitudeSpeedAfter')}</p></div><div><h3>{t('gravityHeading')}</h3><p>{t('gravityExplanation')}</p><p>{t('missionCaveat')}</p><p className="formula">{t('formulaLabel')}v = √[GM / (R + h)]</p></div></div></details>
  </>;
}
