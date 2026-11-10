export const PLANETS = [
  { id: 'mercury', name: '水星', color: '#b4bbc9', accent: '#e8e9f0', size: 17, orbit: 82, period: 88, start: 2.7, tag: '离太阳最近', line: '我住在太阳旁边！', text: '我是水星，小小的一颗。我离太阳最近，绕太阳跑一圈特别快。', fact: '水星是八大行星中最小的一颗，公转一圈约需 88 个地球日。', quiz: '找一找：哪颗星球离太阳最近？' },
  { id: 'venus', name: '金星', color: '#efc080', accent: '#fff0d9', size: 24, orbit: 122, period: 225, start: 5.5, tag: '热热的星球', line: '我的云朵厚厚的！', text: '我是金星。我穿着厚厚的云朵外套，是太阳系里最热的行星。只能远远看看我哦！', fact: '金星的浓厚大气产生强烈温室效应，因此比更靠近太阳的水星还热。', quiz: '找一找：谁穿着厚厚的云朵外套？' },
  { id: 'earth', name: '地球', color: '#72c8ef', accent: '#e3f4fd', size: 27, orbit: 165, period: 365.25, start: .65, tag: '我们的家', line: '你好呀，小小地球人！', text: '我是地球，蓝蓝的是大海，绿绿的是陆地。你、爸爸妈妈，还有小动物，都住在我这里！我绕太阳转一圈，就是一年。', fact: '地球自转带来白天与黑夜，公转一圈约需一年。月球是地球的天然卫星。', quiz: '找一找：我们的家是哪颗星球？' },
  { id: 'mars', name: '火星', color: '#ec967f', accent: '#fff0e9', size: 22, orbit: 206, period: 687, start: 3.8, tag: '红红的邻居', line: '我有一张红红的脸！', text: '我是火星，地球的邻居。我身上有红红的尘土。小小探测车正在我这里探险呢！', fact: '火星的红色主要来自地表含氧化铁的矿物，并不是星球在燃烧。', quiz: '找一找：谁是红红的邻居？' },
  { id: 'jupiter', name: '木星', color: '#dbb5a0', accent: '#f9ece4', size: 43, orbit: 257, period: 4333, start: 5.45, tag: '最大的行星', line: '我是大个子！', text: '我是木星，是八颗行星里最大的一颗。我穿着条纹衣服，还有一个大大的红色风暴。', fact: '木星是气态巨行星。大红斑是一个巨大风暴，不是固体表面的斑点。', quiz: '找一找：哪颗行星个头最大？' },
  { id: 'saturn', name: '土星', color: '#e8cd99', accent: '#fff3da', size: 34, orbit: 307, period: 10759, start: 2.5, tag: '戴着漂亮光环', line: '看看我的呼啦圈！', text: '我是土星。我有漂亮的环，看起来像呼啦圈！这个环是许许多多小冰块和碎石组成的。', fact: '土星环主要由冰颗粒和岩石碎屑组成，不是一个完整的固体圆环。其他巨行星也有较暗的环。', quiz: '找一找：谁戴着漂亮的大光环？' },
  { id: 'uranus', name: '天王星', color: '#9cdbdf', accent: '#e8f9f7', size: 27, orbit: 355, period: 30687, start: 4.25, tag: '歪着身子转', line: '我的身体歪歪的！', text: '我是天王星，淡淡的蓝绿色。我转动时，身体歪得厉害，就像躺着滚动一样。', fact: '天王星的自转轴倾角约为 98°。画面中的公转方向不表示它的自转方向。', quiz: '找一找：哪颗星球歪着身子转？' },
  { id: 'neptune', name: '海王星', color: '#849de6', accent: '#edf0ff', size: 26, orbit: 400, period: 60190, start: .5, tag: '远远的蓝色星球', line: '我在很远很远的地方！', text: '我是海王星，深蓝深蓝的。我是八颗行星中离太阳最远的一颗，那里很冷，风也很大。', fact: '海王星公转一圈约需 165 个地球年。冥王星归类为矮行星，不属于八大行星。', quiz: '找一找：谁离太阳最远？' },
];
export const SUN = { id: 'sun', name: '太阳', color: '#ffda80', accent: '#fff4d7', tag: '发光的恒星', line: '我把阳光送给你！', text: '我是太阳，会自己发光、发热。我是一颗恒星，不是行星。八颗行星都绕着我转！', fact: '太阳位于太阳系中心附近，是一颗恒星。动画里的大小、距离和公转快慢经过调整，不能用来测量。' };
export const PHASES = [
  { start: 0, title: '准备出发', short: '准备', line: '小火箭准备好啦！', text: '我们要从地球出发。点一下发射按钮，一起去太空吧！' },
  { start: .3, title: '一起倒数', short: '倒数', line: '三、二、一，出发！', text: '检查完毕！我们一起倒数：三，二，一！' },
  { start: 4, title: '点火，向上飞', short: '起飞', line: '呼——火箭升起来啦！', text: '火箭向下喷出气体，把自己向上推。我们飞过云朵，越飞越高！' },
  { start: 10, title: '转个弯，向前飞', short: '转弯', line: '不只向上，也要向前！', text: '火箭慢慢转弯，一边升高，一边向前加速。要绕着地球飞，可不能只往上冲哦！' },
  { start: 16, title: '变轻一点，继续加速', short: '分离', line: '谢谢你，火箭小帮手！', text: '用完的下面一级火箭分开了，保护飞船的外壳也打开了。上面的火箭继续向前加速。' },
  { start: 23, title: '到达环绕速度', short: '入轨', line: '横着飞得够快，就能绕圈啦！', text: '飞船横着飞得够快了！发动机可以关掉，地球的引力让飞船的路一直弯弯的。' },
  { start: 29, title: '你好，太空！', short: '环绕', line: '我们正在绕着地球飞！', text: '飞船一直向前飞，地球一直拉着它，飞船就绕着地球转圈圈。太空里也有地球引力哦！' },
];
export const DURATION = 53;
export function phaseAt(time) {
  let index = 0;
  PHASES.forEach((p, i) => { if (time >= p.start) index = i; });
  return index;
}
// NASA circular-orbit formula: v = sqrt(mu / (R + h)).
export const EARTH_RADIUS_KM = 6371;
export const EARTH_MU = 398600.4418;
export const circularSpeed = altitudeKm => Math.sqrt(EARTH_MU / (EARTH_RADIUS_KM + altitudeKm));
