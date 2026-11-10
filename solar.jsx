import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from './i18n.jsx';
import { PlanetBody, PlanetPicture, Stars, Icon } from './illustrations.jsx';

function SolarMap({ selected, onSelect, paused, fast }) {
  const { planets, sun, t } = useLanguage();
  const refs = useRef([]);
  const angle = useRef(planets.map(p => p.start));
  useEffect(() => {
    let raf, previous;
    const draw = stamp => {
      const dt = previous == null || document.hidden ? 0 : Math.min((stamp - previous) / 1000, .06);
      previous = stamp;
      planets.forEach((p, i) => {
        // Compress orbital periods for visibility; this is not a scale model.
        if (!paused && !document.hidden) angle.current[i] += dt * .19 * Math.pow(88 / p.period, .32) * (fast ? 2 : 1);
        const x = 450 + Math.cos(angle.current[i]) * p.orbit;
        const y = 278 + Math.sin(angle.current[i]) * p.orbit * .57;
        refs.current[i]?.setAttribute('transform', `translate(${x} ${y})`);
      });
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [paused, fast, planets]);
  const keySelect = (e, p) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(p); } };
  return <svg className="solar-map" viewBox="0 0 900 570" aria-label={t('solarMapLabel')}>
    <Stars/>
    <g fill="none">{[...planets].reverse().map(p => <ellipse key={p.id} cx="450" cy="278" rx={p.orbit} ry={p.orbit * .57} stroke={selected.id === p.id ? '#c0b0ed' : '#747099'} strokeOpacity={selected.id === p.id ? '.7' : '.26'} strokeWidth={selected.id === p.id ? '1.8' : '1'}/>)}</g>
    <g className="planet-click" role="button" tabIndex="0" data-planet="sun" aria-label={t('recognize', { name: sun.name })} onClick={() => onSelect(sun)} onKeyDown={e => keySelect(e, sun)} transform="translate(450 278)">
      <circle r="64" fill="#ffda80" opacity=".05"/><circle r="51" fill="#ffda80" opacity=".07"/>
      <g transform="scale(.83)"><PlanetBody id="sun"/></g><text y="68" className="map-label">{sun.name}</text>
    </g>
    {planets.map((p, i) => <g key={p.id} ref={el => { refs.current[i] = el; }} transform={`translate(${450 + Math.cos(p.start) * p.orbit} ${278 + Math.sin(p.start) * p.orbit * .57})`} className="planet-click" role="button" tabIndex="0" data-planet={p.id} aria-label={t('recognize', { name: p.name })} aria-pressed={selected.id === p.id} onClick={() => onSelect(p)} onKeyDown={e => keySelect(e, p)}>
      <circle r={Math.max(p.size + 12, 35)} fill="transparent"/>
      {selected.id === p.id && <circle r={p.size + 9} stroke="#e8e1ff" strokeWidth="1.7" strokeDasharray="3 5" fill="none"/>}
      <g transform={`scale(${p.size / 45})`}><PlanetBody id={p.id} color={p.color}/></g>
      <text y={p.size + 26} className={`map-label ${selected.id === p.id ? 'active' : ''}`}>{p.name}</text>
    </g>)}
  </svg>;
}
export function Solar({ audio, speak, stopSpeech }) {
  const { planets, sun, t } = useLanguage();
  const [selectedId, setSelectedId] = useState('earth');
  const [paused, setPaused] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  const [fast, setFast] = useState(false);
  const [visited, setVisited] = useState(new Set());
  const [challengeId, setChallengeId] = useState(null);
  const [reward, setReward] = useState(null);
  const selected = selectedId === 'sun' ? sun : planets.find(p => p.id === selectedId);
  const challenge = planets.find(p => p.id === challengeId);
  const onSelect = p => {
    setSelectedId(p.id);
    if (p.id !== 'sun') setVisited(prev => new Set([...prev, p.id]));
    if (challenge) {
      if (challenge.id === p.id) {
        setReward({ type: 'correct', id: p.id }); setChallengeId(null);
        if (audio) speak([t('quizCorrect', { name: p.name }), p.text]);
      } else {
        setReward({ type: 'retry' });
        if (audio) speak([t('quizRetry'), challenge.quiz]);
      }
    } else {
      setReward(null);
      if (audio) speak(p.text);
    }
  };
  const findPlanet = () => {
    const candidates = planets.filter(p => p.id !== selectedId);
    const p = candidates[Math.floor(Math.random() * candidates.length)];
    setChallengeId(p.id); setReward(null);
    if (audio) speak(p.quiz);
  };
  const rewardText = reward?.type === 'correct' ? t('quizCorrect', { name: planets.find(p => p.id === reward.id).name }) : reward?.type === 'retry' ? t('quizRetry') : '';
  useEffect(() => () => stopSpeech(), [stopSpeech]);
  return <>
    <div className="section-heading"><div><span className="eyebrow">{t('solarEyebrow')}</span><h2>{t('solarHeading')}</h2><p>{t('solarInstruction')}</p></div><span className="explored"><Icon name="star" size={18}/>{t('visitedCount', { count: visited.size })}</span></div>
    <div className="explore-grid">
      <section className="space-panel" aria-label={t('solarPanelLabel')}>
        <div className="space-heading"><span><i className="status-dot"></i>{t('ourSolarSystem')}</span><span className="mini-note">{t('tapPlanet')}</span></div>
        <SolarMap selected={selected} onSelect={onSelect} paused={paused} fast={fast}/>
        <div className="space-controls">
          <button className="dark-button" data-testid="solar-pause" onClick={() => setPaused(p => !p)} aria-pressed={paused}><Icon name={paused ? 'play' : 'pause'}/>{t(paused ? 'resumeOrbit' : 'pause')}</button>
          <button className={`dark-button ${fast ? 'is-on' : ''}`} data-testid="solar-speed" onClick={() => setFast(p => !p)} aria-pressed={fast}>{t(fast ? 'slower' : 'faster')}<Icon name="arrow" size={18}/></button>
          <span className="scale-note">{t('scaleNote')}</span>
        </div>
      </section>
      <aside className="friend-card" style={{ '--planet-accent': selected.accent }} aria-label={t('friendLabel')}>
        <span className="friend-kicker">{t('friendLetter')}</span>
        <PlanetPicture planet={selected} className="big-planet"/>
        <span className="planet-tag">{selected.tag}</span>
        <h3>{selected.name}</h3><p className="friend-line">{selected.line}</p>
        <p className="friend-description">{selected.text}</p>
        <button className="primary-button listen-button" data-testid="listen-planet" onClick={() => speak(selected.text)}><Icon name="sound"/>{t('listenPlanet')}</button>
        <details className="small-science"><summary><Icon name="info" size={17}/>{t('parentFact')}</summary><p>{selected.fact}</p></details>
      </aside>
    </div>
    <div className="planet-shelf" aria-label={t('shelfLabel')}>{planets.map(p => <button key={p.id} data-planet={p.id} className={`planet-tile ${selected.id === p.id ? 'selected' : ''}`} onClick={() => onSelect(p)} aria-pressed={selected.id === p.id} aria-label={t('choosePlanet', { name: p.name })}><PlanetPicture planet={p}/><span>{p.name}</span>{visited.has(p.id) && <span className="visited-mark"><Icon name="check" size={12}/></span>}</button>)}</div>
    <div className="discovery-strip"><div className="discovery-symbol"><Icon name="star" size={28}/></div><div><h3>{challenge ? challenge.quiz : t('quizHeading')}</h3><p role="status">{rewardText || t(challenge ? 'quizInstruction' : 'quizWelcome')}</p></div><button className="secondary-button" data-testid="quiz-start" onClick={findPlanet}>{t(challenge ? 'nextQuiz' : 'startQuiz')}<Icon name="arrow"/></button></div>
  </>;
}
