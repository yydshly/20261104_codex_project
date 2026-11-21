export const BEACON = Object.freeze({ x: 0, z: -4.7 });
export const TUNING = Object.freeze({ speed: 4.8, acceleration: 30, braking: 38, attackRange: 2.1, attackCooldown: 0.38, attackDuration: 0.23, attackArc: 1.95, damage: 1, dashSpeed: 15, dashDuration: 0.16, dashCooldown: 1.05, hitPause: 0.045, invulnerability: 1.2, maxHealth: 6, step: 1 / 120, pulseRange: 4.6, pulseDamage: 2, energyPerHit: 22 });
export const UPGRADES = Object.freeze({
  edge: { id: 'edge', name: '余烬刀锋', glyph: '✧', description: '每次挥击伤害 +1，破甲更快。', detail: '适合贴近敌人，抓住硬直反击。' },
  heart: { id: 'heart', name: '潮汐护符', glyph: '♡', description: '生命上限 +2，进入下一关时回满。', detail: '多一次容错，从容观察新的攻击。' },
  wind: { id: 'wind', name: '顺风靴', glyph: '≈', description: '冲刺冷却缩短 25%，移动速度 +8%。', detail: '适合穿越弹道，快速接近远程敌人。' },
});
export const CHAPTERS = Object.freeze([
  { id: 'harbor', name: '暮港', subtitle: '夺回第一束光', story: '归港的船在浓雾里停了下来。先修复码头的信标，为他们留一条路。', lesson: '机械蟹出现红圈时，向侧面冲刺，再靠近挥击。', duration: 100, cores: 3, sea: '#2c7683', sky: '#367481', ground: '#bac1a0', accent: '#e7be7b', obstacles: [{ x: -6.1, z: -3.8, r: 1.2 }, { x: 6.1, z: -3.8, r: 1.2 }], enemies: [{ type: 'crab', x: -4.2, z: 0.5, hp: 3 }, { type: 'crab', x: 4.2, z: -0.6, hp: 3 }, { type: 'crab', x: 0.8, z: -2.6, hp: 3 }] },
  { id: 'reef', name: '雾礁', subtitle: '穿过交错的潮线', story: '第二座信标被巡逻炮台锁住。石柱之间留下的空隙，是你穿越火线的机会。', lesson: '炮台的瞄准线会锁定方向。绕开弹道，贴近挥击。', duration: 120, cores: 4, sea: '#416e87', sky: '#607d96', ground: '#9eaeb1', accent: '#9bdacb', obstacles: [{ x: -3.3, z: -1.7, r: 0.75 }, { x: 3.3, z: 1.5, r: 0.75 }], enemies: [{ type: 'cannon', x: -4.8, z: -2.5, hp: 4 }, { type: 'cannon', x: 4.6, z: -2.4, hp: 4 }, { type: 'crab', x: -3.8, z: 2, hp: 4 }, { type: 'crab', x: 3.8, z: 2.6, hp: 4 }] },
  { id: 'storm', name: '风暴灯塔', subtitle: '让最后一艘船回家', story: '守潮巨蟹盘踞在主灯塔前。它的甲壳已经裂开，抓住每次突进后的停顿。', lesson: '首领半血后会连续突进。等它停下，再反击。', duration: 150, cores: 1, sea: '#214c63', sky: '#29495c', ground: '#7f9c9d', accent: '#ffce8e', obstacles: [{ x: -6.5, z: -2.5, r: 0.7 }, { x: 6.5, z: -2.5, r: 0.7 }], enemies: [{ type: 'boss', x: 0, z: -0.8, hp: 30 }] },
]);
