// Shared by the UI and offline audio-generation scripts; keep text identical.
export const VOICE_TEXT = {
  zh: {
    preview: '你好呀，小小宇航员！我是陪你探索宇宙的小伙伴。我们一起认识星球，坐上小火箭，好不好呀？',
    enabled: '讲解打开啦！我们一起慢慢听，慢慢看。',
    retry: '再找找看，点下面的星球也可以哦。',
    found: name => `找对啦！你找到${name}啦！`,
  },
  en: {
    preview: 'Hello, little astronaut! I am here to explore space with you. Shall we meet the planets and take a little rocket ride together?',
    enabled: 'Sound is on! Let us listen and explore together.',
    retry: 'Try again! You can tap the planet buttons below, too.',
    found: name => `You found ${name}! Well done!`,
  },
};
