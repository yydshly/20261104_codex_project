export const arenaSpecies = [
  {
    id: 'knight', name: '霜刃卫士', english: 'CRYO KNIGHT', type: '双足 · 冷铸装甲', accent: '#89dcff',
    description: '以双足站稳重心，挥动一把长过手臂的冷铸剑。斩击前会先把肩甲与躯干转向一侧。',
    ability: '霜弧斩', abilityText: '踏步蓄力，重剑划出一道冷光。',
    height: 2.44, health: 112, power: 23, speed: 2.2, reach: 1.83, cooldown: 1.32, duration: 0.8, contact: 0.57, guard: 0.22,
    kind: 'slash',
    glyph: '<path d="m6 28 4-8 2-6 5-3 2-8h10l2 8 5 3 2 6 4 8-5 7h-7l-2 10h-8l-2-10h-7zM20 14h8l-1 5h-6z" fill-rule="evenodd"/>',
  },
  {
    id: 'beast', name: '熔脊兽', english: 'MAGMA BEAST', type: '四足 · 火山岩甲', accent: '#ffb36b',
    description: '四肢撑起沉重的火山岩甲。奔袭时躯干随脚步起伏，熔光从脊背与关节间渗出。',
    ability: '岩颚突咬', abilityText: '伏低前肩，向前冲咬并扬起火屑。',
    height: 1.77, health: 124, power: 28, speed: 2.55, reach: 1.88, cooldown: 1.54, duration: 0.87, contact: 0.62, guard: 0.1,
    kind: 'bite',
    glyph: '<path d="m3 25 7-7 3-8 4 6 5-2 5-7 3 9 7 1 6 7 3 3-3 6-7 1-3-4-4 2-1 7h-6l-1-8-7 2-3 6H6l1-9-4-2zm31-2 4 4 2-3z" fill-rule="evenodd"/>',
  },
  {
    id: 'crawler', name: '六足猎机', english: 'HEX CRAWLER', type: '六足 · 模块化合金', accent: '#8cf5b6',
    description: '六条机械腿分成两组交替支撑，转弯时机身依旧平稳。前端的钳爪独立开合。',
    ability: '猎针夹击', abilityText: '六足压低重心，前钳快速刺出。',
    height: 1.37, health: 100, power: 17, speed: 2.87, reach: 2.05, cooldown: 0.79, duration: 0.59, contact: 0.55, guard: 0.18,
    kind: 'slash',
    glyph: '<path d="m14 18 4-7h12l4 7 8-4 4 6-2 2-3-4-7 4v4l9 3 4 8-3 2-4-7-7-2-2 4 5 6-2 6-3-1 1-5-5-5h-6l-5 5 1 5-3 1-2-6 5-6-2-4-7 2-4 7-3-2 4-8 9-3v-4l-7-4-3 4-2-2 4-6zm7 2-3 6h12l-3-6z" fill-rule="evenodd"/>',
  },
  {
    id: 'wraith', name: '虚浮水母', english: 'VOID WRAITH', type: '浮游 · 半透明软体', accent: '#dab4ff',
    description: '半透明的外壳包住发光核心。它靠收缩冠膜改变姿态，八条触须随身形摆动。',
    ability: '虚相脉冲', abilityText: '收拢触须，从浮游核心释放中距离冲击。',
    height: 2.41, health: 93, power: 20, speed: 1.96, reach: 2.75, cooldown: 1.12, duration: 0.77, contact: 0.59, guard: 0.16,
    kind: 'pulse',
    glyph: '<path d="M2 23c1-9 10-17 22-17s21 8 22 17c-3 3-7 4-12 5 1 5 1 11-3 17l-3-2c3-6 3-10 2-15h-3c0 5-1 11-5 15l-3-2c3-5 4-9 4-13h-4c0 5-3 10-8 13l-2-3c4-4 6-7 6-11-6 0-10-2-13-4zm16-4 6 5 6-5-6-6z" fill-rule="evenodd"/>',
  },
];

export const rescueHeroes = [
  {
    id: 'gravity', name: '引力锚', className: '念力', color: '#ffcd7d', description: '悬停车身，缓慢托举下放。',
    glyph: '<ellipse cx="16" cy="17" rx="12" ry="5"/><ellipse cx="16" cy="17" rx="5" ry="12" transform="rotate(40 16 17)"/><circle cx="16" cy="17" r="2"/>',
    height: 2.15,
  },
  {
    id: 'ice', name: '凝霜', className: '冰霜', color: '#9ae6ff', description: '造出冰轨，将车引向街面。',
    glyph: '<path d="M16 2v28M4 9l24 14M4 23 28 9M11 5l5 4 5-4m-10 22 5-4 5 4M4 14l6-2-1-6m14 20-1-6 6-2M4 18l6 2-1 6m14-20-1 6 6 2"/>',
    height: 2.18,
  },
  {
    id: 'portal', name: '折径', className: '空间', color: '#f4a6ff', description: '开启两道门，转移坠落中的车厢。',
    glyph: '<ellipse cx="9" cy="16" rx="5" ry="11"/><ellipse cx="23" cy="16" rx="5" ry="11"/><path d="M10 16h12m-4-4 4 4-4 4"/>',
    height: 2.11,
  },
  {
    id: 'web', name: '牵星', className: '蛛丝', color: '#ff9c8d', description: '多点锚定，绷紧蛛丝拉住车厢。',
    glyph: '<path d="M16 2v28M2 16h28M6 6l20 20M26 6 6 26M16 6l7 3 3 7-3 7-7 3-7-3-3-7 3-7zm0 5 3.5 1.5L21 16l-1.5 3.5L16 21l-3.5-1.5L11 16l1.5-3.5z"/>',
    height: 2.12,
  },
  {
    id: 'speed', name: '疾弧', className: '极速', color: '#e6ff80', description: '在慢动作中逐个转移乘客。',
    glyph: '<path d="m19 2-12 15h8l-2 13 12-16h-8zM3 10h7M2 23h8m13-16h6m-6 16h7"/>',
    height: 2.14,
  },
  {
    id: 'giant', name: '砾擎', className: '巨化', color: '#ffb17b', description: '双手接住缆车，把车厢搬离车道。',
    glyph: '<path d="M16 3 29 10v12l-13 7L3 22V10zm0 0v11m13-4-13 8L3 10m13 8v11M8 13v7m16-7v7"/><path d="M12 12v-3m8 3v-3"/>',
    height: 2.16,
  },
  {
    id: 'mirror', name: '映阵', className: '分身', color: '#8bf7dd', description: '三道分身分头接人，同时撤离。',
    glyph: '<path d="m16 3 6 5v8l-6 5-6-5V8zm-7 7-6 3v8l5 4 5-4m10-11 6 3v8l-5 4-5-4m-5 2 2 5 2-5"/>',
    height: 2.12,
  },
  {
    id: 'wind', name: '回岚', className: '风场', color: '#a9ceff', description: '用风减速，让车厢滑翔改道。',
    glyph: '<path d="M3 12h16c5 0 5-7 1-7-2 0-3 1-3 3M3 17h23c4 0 4 6 0 6-2 0-3-1-3-3M7 22h10c4 0 4 6 0 6-2 0-3-1-3-2"/>',
    height: 2.08,
  },
  {
    id: 'shield', name: '界棱', className: '光盾', color: '#ffbc82', description: '展开光盾接车，落地后隔开街面。',
    glyph: '<path d="m16 2 12 7v13l-12 8L4 22V9zm0 6 7 4v8l-7 5-7-5v-8zm0 2v12m-5-9 10 6m0-6-10 6"/>',
    height: 2.08,
  },
  {
    id: 'rewind', name: '时缝', className: '回溯', color: '#ffe0b1', description: '倒转事故，接回断索。',
    glyph: '<path d="M5 12a11 11 0 1 1 1 11M5 5v7h7m4-4v9l-5 3m5-16v2m10 10h2m-12 10v2"/>',
    height: 2.17,
  },
  {
    id: 'grove', name: '根珀', className: '生长', color: '#bbeb8a', description: '催生藤架，弯曲卸力并放下车厢。',
    glyph: '<path d="M16 29V12m0 10C8 22 4 16 4 9c7 0 12 5 12 11m0-2C16 9 21 5 28 4c0 8-4 13-12 15M8 28l8-5 8 5"/>',
    height: 2.22,
  },
];

export const orbitHeroIds = ['magnet', 'web', 'grove', 'portal', 'rewind'];

const magnet = {
  id: 'magnet', name: '磁极', type: '磁力', accent: '#79fbe4',
  description: '展开磁环，牵引并转动金属重物，在轨道上让失控卫星偏离空间站。',
  glyph: '<path d="M7 5v13a9 9 0 0 0 18 0V5h-5v13a4 4 0 0 1-8 0V5zM7 11h5m8 0h5M15 6h2m-1-1v2"/>',
  height: 2.2,
};

export const heroCatalog = [
  ...rescueHeroes.map(hero => ({
    ...hero, type: hero.className, accent: hero.color, glyphViewBox: '0 0 32 32', glyphFill: 'none',
    group: 'powered', rescue: true,
  })),
  ...arenaSpecies.map(hero => ({
    ...hero, glyphViewBox: '0 0 48 48', glyphFill: 'currentColor', group: 'species', rescue: false,
  })),
  { ...magnet, glyphViewBox: '0 0 32 32', glyphFill: 'none', group: 'powered', rescue: false },
];

const selectionKey = 'species-arena:hero';
const heroIds = new Set(heroCatalog.map(hero => hero.id));

export function readHeroSelection() {
  const requested = new URLSearchParams(window.location.search).get('hero');
  if (heroIds.has(requested)) return requested;
  try {
    const saved = window.localStorage.getItem(selectionKey);
    return heroIds.has(saved) ? saved : null;
  } catch {
    return null;
  }
}

export function setHeroSelection(id) {
  if (!heroIds.has(id)) return;
  try {
    window.localStorage.setItem(selectionKey, id);
  } catch {
    // The URL still carries the selection when storage is disabled.
  }
  const url = new URL(window.location.href);
  if (url.searchParams.get('hero') === id) return;
  url.searchParams.set('hero', id);
  window.history.replaceState(window.history.state, '', url);
}

export function heroSceneUrl(page, id) {
  const destination = page === 'index.html' ? './' : `./${page}`;
  return heroIds.has(id) ? `${destination}?hero=${encodeURIComponent(id)}` : destination;
}
