import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PLANETS, SUN, PHASES } from './data.js';
import { PLANETS_EN, SUN_EN, PHASES_EN } from './data-en.js';

// Stable keys keep language changes independent of animation and selection state.
const pairs = {
  title: ['小小宇航员 · 宝宝的宇宙乐园', 'Little Astronaut · A Space Playground'],
  brand: ['小小宇航员', 'Little Astronaut'],
  subtitle: ['宝宝的宇宙乐园', 'A space playground'],
  homeLabel: ['小小宇航员，回到太阳系', 'Little Astronaut, return to the solar system'],
  age: ['3 岁＋ · 亲子共玩', 'Ages 3+ · Explore together'],
  soundOn: ['讲解开启', 'Sound on'], soundOff: ['讲解关闭', 'Sound off'],
  languageLabel: ['选择界面和讲解语言', 'Choose the page and narration language'],
  welcomeHint: ['每一颗好奇心，都值得去探索', 'Every curious mind deserves an adventure'],
  headlineFirst: ['小手点一点，', 'Little hands, '], headlineSecond: ['宇宙近一点。', 'big discoveries.'],
  welcomeText: ['认识星球朋友，坐上小火箭。今天，想去哪里探险？', 'Meet the planets. Hop on a rocket. Where shall we explore today?'],
  helloAstronaut: ['你好，小小宇航员！', 'Hello, little astronaut!'],
  missionsLabel: ['选择探索任务', 'Choose an adventure'],
  solarTagline: ['和星球交朋友', 'Make friends with the planets'],
  solarTitle: ['了解太阳系', 'Solar system'],
  solarSubtitle: ['点一点，认识八大行星', 'Tap to meet all eight planets'],
  rocketTagline: ['做一次小小宇航员', 'Be a little astronaut'],
  rocketTitle: ['火箭发射', 'Rocket launch'],
  rocketSubtitle: ['倒数出发，绕着地球飞', 'Count down and fly around Earth'],
  solarMissionLabel: ['太阳系任务', 'Solar system adventure'],
  rocketMissionLabel: ['火箭任务', 'Rocket adventure'],
  familyNote: ['陪宝宝慢慢看，听一句，点一下。不急着记住名字，好奇就很棒。', 'Take your time together: listen, tap, and wonder. Being curious matters more than remembering names.'],
  footer: ['为小小的好奇心而做 · 本地运行，无广告、无追踪', 'Made for curious little minds · Runs locally, no ads or tracking'],
  sources: ['家长知识参考：', 'Parent resources: '], nasaSolar: ['NASA 太阳系', 'NASA solar system'], nasaOrbit: ['轨道原理', 'How orbits work'],
  dismissVoiceNotice: ['关闭语音提示', 'Dismiss audio notice'],
  audioUnavailable: ['声音暂时没有播放。请检查音量，或再次点一下朗读按钮。动画和文字仍可使用。', 'The audio did not play. Check the volume and tap Listen again. The animation and text still work.'],
  systemVoiceFallback: ['这段配音未找到，暂用设备朗读。声音可能与老师配音不同。', 'This voice clip is missing, so a device voice is being used. It may sound different from the teacher-style narration.'],
  noDeviceVoice: ['没有找到对应语言的声音。可以下载设备的中文/英文声音包；文字和动画仍可使用。', 'No matching device voice was found. You can download a Chinese or English voice; text and animation still work.'],
  teacherVoice: ['亲切女声配音', 'Warm female narration'],
  voicePreview: ['试听老师配音', 'Try the teacher voice'],
  aiVoiceNote: ['AI 合成女声 · 本地音频播放', 'AI-generated female voice · Local audio'],
  solarEyebrow: ['第一站 · 太阳系', 'Adventure one · Solar system'],
  solarHeading: ['和星球朋友打个招呼', 'Say hello to your planet friends'],
  solarInstruction: ['点一点星球，听听它的小秘密。', 'Tap a planet to hear its little story.'],
  visitedCount: ['认识了 {count} / 8 位朋友', 'Met {count} / 8 planet friends'],
  solarPanelLabel: ['太阳系探索', 'Explore the solar system'],
  ourSolarSystem: ['我们的太阳系', 'Our solar system'],
  tapPlanet: ['点按任意星球', 'Tap any planet'],
  solarMapLabel: ['太阳系动画，八颗行星绕着太阳转。可以点按行星。', 'Solar system animation: eight planets orbit the Sun. Tap a planet to meet it.'],
  recognize: ['认识{name}', 'Meet {name}'], choosePlanet: ['选择{name}', 'Choose {name}'],
  pause: ['停一下', 'Pause'], resumeOrbit: ['继续转圈', 'Keep orbiting'],
  slower: ['慢一点', 'Slower'], faster: ['快一点', 'Faster'],
  scaleNote: ['大小、距离、快慢为卡通示意', 'Cartoon sizes, distances and speeds'],
  friendLabel: ['星球介绍', 'About this space friend'], friendLetter: ['星球朋友来信', 'A note from your space friend'],
  listenPlanet: ['听我说话', 'Listen to me'], parentFact: ['给爸爸妈妈的小知识', 'A little fact for parents'],
  shelfLabel: ['按距离太阳从近到远选择行星', 'Choose a planet, ordered nearest to farthest from the Sun'],
  quizHeading: ['来玩「找星球」吧！', 'Let’s play Find a Planet!'],
  quizInstruction: ['点一点星球，看看能不能找到它。', 'Tap a planet. Can you find our friend?'],
  quizWelcome: ['和爸爸妈妈一起，找找哪颗是我们的家。', 'Find our home planet with your family.'],
  quizRetry: ['再找找看，点下面的星球也可以哦。', 'Try again! You can tap the planet buttons below, too.'],
  quizCorrect: ['找对啦！你找到{name}啦！', 'You found {name}! Well done!'],
  quizWrongSpeech: ['这是{name}。我们再找一找{target}吧。', 'This is {name}. Let’s look for {target} again.'],
  nextQuiz: ['换一个', 'Another one'], startQuiz: ['开始找一找', 'Let’s find a planet'],
  rocketEyebrow: ['第二站 · 火箭发射', 'Adventure two · Rocket launch'],
  rocketHeading: ['准备好了吗？一起飞向太空！', 'Ready? Let’s fly to space together!'],
  rocketInstruction: ['按下发射按钮，和小火箭一起出发。', 'Tap Launch and go on a little space adventure.'],
  watchTogether: ['和爸爸妈妈一起看', 'Watch with your family'],
  rocketPanelLabel: ['火箭发射动画', 'Rocket launch animation'],
  rocketMapLabel: ['火箭动画：{phase}', 'Rocket animation: {phase}'],
  astronautMission: ['小小宇航员任务', 'Little astronaut mission'],
  rocketStoryLabel: ['发射过程讲解', 'Rocket launch story'],
  flightDiary: ['小宇航员的飞行日记', 'A little astronaut’s flight diary'],
  stepCount: ['第 {step} 步 / 共 6 步', 'Step {step} of 6'],
  listenPhase: ['听这一段', 'Listen to this part'],
  gentleTip: ['可以停一下，也可以点步骤，慢慢看。', 'Pause or tap a step. Take your time.'],
  launch: ['发射小火箭', 'Launch rocket'], flyAgain: ['再飞一次', 'Fly again'], resumeFlight: ['继续飞', 'Keep flying'],
  rocketResetLabel: ['火箭回到起点', 'Return the rocket to the start'], fromStart: ['从头看', 'Start over'],
  progress: ['飞行进度', 'Flight progress'], seconds: ['秒', 'sec'],
  stepsLabel: ['选择发射步骤', 'Choose a launch step'], watchPhase: ['观看{phase}', 'Watch {phase}'],
  forwardMotion: ['向前飞', 'Forward motion'], earthGravity: ['地球引力', 'Earth’s gravity'],
  sceneNote: ['卡通示意 · 时间、距离不按真实比例', 'Cartoon illustration · Time and distance are not to scale'],
  parentGuideTitle: ['给爸爸妈妈：什么是第一宇宙速度？', 'For parents: what is first cosmic velocity?'],
  expand: ['展开看看', 'Read more'],
  speedHeading: ['飞得高，还要横着飞得快', 'Height is not enough: sideways speed matters'],
  nearSpeedBefore: ['地球表面附近，忽略空气阻力时，圆轨道速度约为 ', 'Near Earth’s surface, ignoring air resistance, circular orbital speed is about '],
  nearSpeedAfter: ['，通常称为第一宇宙速度。现实中的飞船不能贴着地面绕圈，需要先升到稀薄大气层外，再获得足够的水平速度。', ', often called first cosmic velocity. A real spacecraft cannot orbit just above the ground: it must rise out of the dense atmosphere and gain enough horizontal speed.'],
  altitudeSpeedBefore: ['例如高度约 200 公里的理想圆轨道，速度约为 ', 'For example, an ideal circular orbit at an altitude of about 200 km needs about '],
  altitudeSpeedAfter: ['。实际入轨速度与轨道高度有关，不是所有轨道都固定为 7.9 公里/秒。', '. The required speed depends on orbital altitude; it is not always exactly 7.9 km/s.'],
  speedUnit: ['公里/秒', 'km/s'],
  gravityHeading: ['进入轨道，引力仍然存在', 'Gravity is still there in orbit'],
  gravityExplanation: ['飞船向前运动，地球引力不断改变它的运动方向；可以理解为它一直在“下落”，但总是绕过地球。在理想轨道上，不需要发动机一直点火。', 'A spacecraft moves forward while Earth’s gravity continually changes its direction. Think of it as always falling, but always missing Earth. In an ideal orbit, the engine does not need to keep firing.'],
  missionCaveat: ['本页演示多级火箭的一种简化流程。分级、抛整流罩的具体时机因任务而异；形状、轨迹、速度变化与时间都不是工程仿真。', 'This is one simplified story of a multistage launch. Stage and fairing separation timing varies by mission. Shapes, trajectories, speed changes and timing are not an engineering simulation.'],
  formulaLabel: ['家长公式：', 'For parents: '],
};
export const messages = Object.fromEntries(['zh', 'en'].map((lang, index) => [lang, Object.fromEntries(Object.entries(pairs).map(([key, values]) => [key, values[index]]))]));
export function translate(lang, key, values = {}) {
  const message = messages[lang]?.[key];
  if (message == null) throw new Error(`Missing translation: ${lang}/${key}`);
  return message.replace(/\{(\w+)\}/g, (_, name) => String(values[name] ?? `{${name}}`));
}
export const localizedData = {
  zh: { planets: PLANETS, sun: SUN, phases: PHASES },
  en: { planets: PLANETS.map(p => ({ ...p, ...PLANETS_EN[p.id] })), sun: { ...SUN, ...SUN_EN }, phases: PHASES.map((p, i) => ({ ...p, ...PHASES_EN[i] })) },
};
const LanguageContext = createContext(null);
export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try { return localStorage.getItem('little-astronaut-language') === 'en' ? 'en' : 'zh'; }
    catch { return 'zh'; }
  });
  const setLanguage = useCallback(next => { if (['zh', 'en'].includes(next)) setLang(next); }, []);
  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    document.title = translate(lang, 'title');
    try { localStorage.setItem('little-astronaut-language', lang); } catch {}
  }, [lang]);
  const t = useCallback((key, values) => translate(lang, key, values), [lang]);
  const value = useMemo(() => ({ lang, setLanguage, t, ...localizedData[lang] }), [lang, setLanguage, t]);
  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}
export const useLanguage = () => useContext(LanguageContext);
