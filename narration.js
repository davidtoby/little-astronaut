import { PLANETS, SUN, PHASES } from './data.js';
import { PLANETS_EN, SUN_EN, PHASES_EN } from './data-en.js';
import { VOICE_TEXT } from './voice-text.js';

export const VOICE_CONFIG = {
  zh: { voice: 'zh-CN-XiaoxiaoNeural', rate: '-5%', pitch: '+0Hz' },
  en: { voice: 'en-US-JennyNeural', rate: '-5%', pitch: '+0Hz' },
};
export function narrationEntries() {
  const entries = [];
  for (const lang of ['zh', 'en']) {
    const add = (id, text) => entries.push({ id, lang, text, file: `${lang}/${id}.mp3`, ...VOICE_CONFIG[lang] });
    const planets = lang === 'zh' ? PLANETS : PLANETS.map(p => ({ ...p, ...PLANETS_EN[p.id] }));
    const sun = lang === 'zh' ? SUN : { ...SUN, ...SUN_EN };
    const phases = lang === 'zh' ? PHASES : PHASES.map((p, i) => ({ ...p, ...PHASES_EN[i] }));
    for (const planet of [...planets, sun]) add(`planet-${planet.id}`, planet.text);
    for (const planet of planets) {
      add(`quiz-${planet.id}`, planet.quiz);
      add(`found-${planet.id}`, VOICE_TEXT[lang].found(planet.name));
    }
    phases.forEach((phase, i) => {
      add(`phase-${i}-short`, phase.line);
      add(`phase-${i}-full`, phase.text);
    });
    add('preview', VOICE_TEXT[lang].preview);
    add('sound-enabled', VOICE_TEXT[lang].enabled);
    add('quiz-retry', VOICE_TEXT[lang].retry);
  }
  return entries;
}
