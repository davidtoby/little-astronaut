import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Solar } from './solar.jsx';
import { Rocket } from './rocket.jsx';
import { Icon, PlanetBody, RocketPicture, Astronaut } from './illustrations.jsx';
import { LanguageProvider, useLanguage } from './i18n.jsx';
import { useNarration } from './speech.jsx';
import { VOICE_TEXT } from './voice-text.js';

function App() {
  const { lang, setLanguage, t } = useLanguage();
  const [mode, setMode] = useState(() => {
    try { return localStorage.getItem('little-astronaut-mode') === 'rocket' ? 'rocket' : 'solar'; }
    catch { return 'solar'; }
  });
  const [audio, setAudio] = useState(true);
  const { speak, stopSpeech, notice, setNotice } = useNarration(lang, t);
  const switchMode = next => {
    stopSpeech(); setMode(next);
    try { localStorage.setItem('little-astronaut-mode', next); } catch {}
  };
  const switchLanguage = next => {
    stopSpeech(); setNotice(''); setLanguage(next);
  };
  const toggleAudio = () => {
    stopSpeech(); setAudio(!audio);
    if (!audio) speak(VOICE_TEXT[lang].enabled);
  };
  return <div className="app-shell" data-language={lang}>
    <header className="site-header">
      <button className="brand" onClick={() => switchMode('solar')} aria-label={t('homeLabel')}><span className="brand-illustration"><svg viewBox="-70 -70 140 140" aria-hidden="true"><PlanetBody id="saturn" color="#d5bde8"/></svg></span><span><strong>{t('brand')}</strong><small>{t('subtitle')}</small></span></button>
      <div className="header-actions"><span className="age-badge">{t('age')}</span><div className="language-toggle" role="group" aria-label={t('languageLabel')}><button lang="zh-CN" data-testid="language-zh" className={lang === 'zh' ? 'active' : ''} aria-pressed={lang === 'zh'} onClick={() => switchLanguage('zh')}>中文</button><button lang="en" data-testid="language-en" className={lang === 'en' ? 'active' : ''} aria-pressed={lang === 'en'} onClick={() => switchLanguage('en')}>English</button></div><button className={`sound-toggle ${audio ? 'enabled' : ''}`} onClick={toggleAudio} aria-pressed={audio}><Icon name={audio ? 'sound' : 'muted'}/><span>{t(audio ? 'soundOn' : 'soundOff')}</span></button></div>
    </header>
    <main>
      <section className="welcome"><div><div className="welcome-label"><span></span>{t('welcomeHint')}</div><h1>{t('headlineFirst')}<span>{t('headlineSecond')}</span></h1><p>{t('welcomeText')}</p></div><div className="welcome-mascot"><div className="mascot-speech">{t('helloAstronaut')}</div><Astronaut/><span className="orbit-doodle"></span></div></section>
      <nav className="mission-picker" aria-label={t('missionsLabel')}>
        <button className={`mission-card solar-mission ${mode === 'solar' ? 'chosen' : ''}`} onClick={() => switchMode('solar')} aria-pressed={mode === 'solar'}><div className="mission-art"><svg viewBox="0 0 170 112" aria-hidden="true"><ellipse cx="84" cy="59" rx="74" ry="27" fill="none" stroke="#c8bedf" strokeWidth="1.5" transform="rotate(-15 84 59)"/><g transform="translate(65 61) scale(.66)"><PlanetBody id="sun"/></g><g transform="translate(130 38) scale(.4)"><PlanetBody id="earth" color="#86c7e2"/></g></svg></div><div className="mission-copy"><span>{t('solarTagline')}</span><h2>{t('solarTitle')}</h2><p>{t('solarSubtitle')}</p></div><span className="mission-arrow"><Icon name={mode === 'solar' ? 'check' : 'arrow'}/></span></button>
        <button className={`mission-card rocket-mission ${mode === 'rocket' ? 'chosen' : ''}`} onClick={() => switchMode('rocket')} aria-pressed={mode === 'rocket'}><div className="mission-art rocket-art"><RocketPicture/></div><div className="mission-copy"><span>{t('rocketTagline')}</span><h2>{t('rocketTitle')}</h2><p>{t('rocketSubtitle')}</p></div><span className="mission-arrow"><Icon name={mode === 'rocket' ? 'check' : 'arrow'}/></span></button>
      </nav>
      <div className="voice-note"><div><Icon name="sound" size={19}/><span><strong>{t('teacherVoice')}</strong><small>{t('aiVoiceNote')}</small></span></div><button className="voice-preview" data-testid="voice-preview" onClick={() => speak(VOICE_TEXT[lang].preview)}><Icon name="play" size={17}/>{t('voicePreview')}</button></div>
      {notice && <div className="audio-notice" role="status"><Icon name="info"/><span>{notice}</span><button aria-label={t('dismissVoiceNotice')} onClick={() => setNotice('')}><Icon name="close"/></button></div>}
      <section className="mission-content" key={mode} aria-label={t(mode === 'solar' ? 'solarMissionLabel' : 'rocketMissionLabel')}>{mode === 'solar' ? <Solar audio={audio} speak={speak} stopSpeech={stopSpeech}/> : <Rocket audio={audio} speak={speak} stopSpeech={stopSpeech}/>}</section>
      <div className="family-note"><Icon name="heart" size={18}/><span>{t('familyNote')}</span></div>
    </main>
    <footer><span>{t('footer')}</span><span>{t('sources')}<a href="https://science.nasa.gov/solar-system/planets/" target="_blank" rel="noopener noreferrer">{t('nasaSolar')}</a><span className="footer-dot">·</span><a href="https://www1.grc.nasa.gov/beginners-guide-to-aeronautics/flight-to-orbit/" target="_blank" rel="noopener noreferrer">{t('nasaOrbit')}</a></span></footer>
  </div>;
}
createRoot(document.getElementById('root')).render(<LanguageProvider><App/></LanguageProvider>);
