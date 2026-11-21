import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const output = path.join(root, 'assets', 'diagrams');
fs.mkdirSync(output, { recursive: true });
const esc = value => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const txt = (x, y, value, size = 30, fill = '#bec7ce', family = 'sans', weight = 400) => `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}" font-family="${family === 'serif' ? "'Noto Serif SC','Songti SC',SimSun,serif" : "'Microsoft YaHei','Noto Sans SC',sans-serif"}" font-weight="${weight}">${esc(value)}</text>`;
const line = (x1, y1, x2, y2, color = '#35434f') => `<path d="M${x1} ${y1}H${x2}" transform="translate(0 ${y2-y1})" stroke="${color}" fill="none"/>`;
const embedded = (file, x, y, width, height) => {
  const mime = file.endsWith('.webp') ? 'image/webp' : 'image/png';
  return `<image x="${x}" y="${y}" width="${width}" height="${height}" preserveAspectRatio="xMidYMid meet" href="data:${mime};base64,${fs.readFileSync(path.join(root, file)).toString('base64')}"/>`;
};

const columns = [
  {
    x: 92, label: '原帖参照 · 已获明确正向反馈', title: '相遇的瞬间',
    file: 'assets/references/pinned-dolphin-sun.webp',
    observation: '弧线呼应，让动势悬停。',
    feeling: '艺术解读：轻盈、奔赴、短暂相遇。',
    value: '先设计关系，再决定主体与机位。'
  },
  {
    x: 846, label: '原帖参照 · 已获明确正向反馈', title: '留白中的诗意',
    file: 'assets/references/pinned-whale-moon.webp',
    observation: '没有接触，却让人联想到承托。',
    feeling: '艺术解读：静默、敬畏、柔和的联系。',
    value: '让观者参与联想，留下回看的理由。'
  },
  {
    x: 1600, label: '本项目 AI 试作 · 待评', title: '摄影语言的承载',
    file: 'assets/generated/egret-departing-reflection-v1.png',
    observation: '翼、落水与倒影，连接离开的瞬间。',
    feeling: '可见水滴与材质；情绪尚未获确认。',
    value: '技法支持表达，效果仍须看图检验。'
  }
];
const parts = [
  '<svg xmlns="http://www.w3.org/2000/svg" width="2400" height="1700" viewBox="0 0 2400 1700" role="img" aria-labelledby="title desc">',
  '<title id="title">艺术与情绪：我们的理解与价值</title>',
  '<desc id="desc">两张原帖参照与一张待评生成试作，连接情绪意图、画面关系、摄影语言、反馈及可探索的产品方向。</desc>',
  '<rect width="2400" height="1700" fill="#101923"/>',
  txt(92, 72, '留一会儿  /  艺术与情绪 · 创作价值图', 26, '#d4ba8f'),
  txt(92, 175, '先被打动，再理解为什么。', 78, '#f0eae1', 'serif'),
  txt(94, 238, '入口从艺术与情绪出发：先看画面，再提炼关系、技法与可复用价值。', 32),
  txt(2308, 74, '2026.11.21', 24, '#96a4b0').replace('x="2308"', 'x="2308" text-anchor="end"'),
  line(92, 280, 2308, 280)
];
for (const c of columns) {
  parts.push(
    txt(c.x, 330, c.label, 24, '#a8b5bf'),
    txt(c.x, 387, c.title, 42, '#eee8df', 'serif'),
    `<rect x="${c.x}" y="416" width="708" height="488" fill="#0b131c"/>`,
    embedded(c.file, c.x, 416, 708, 488),
    txt(c.x, 965, c.observation, 32, '#eee8df'),
    txt(c.x, 1012, c.feeling, 27),
    txt(c.x, 1072, '可迁移的价值', 24, '#d4ba8f'),
    txt(c.x, 1116, c.value, 30, '#d8dce0')
  );
}
parts.push(line(92, 1170, 2308, 1170));
const steps = [
  ['艺术意图', '希望唤起什么感受'],
  ['画面关系', '谁与什么发生联系'],
  ['摄影语言', '光色、材质、瞬间'],
  ['真实反馈', '去掉文案还成立吗'],
  ['产品转译', '做成自己的作品与体验']
];
steps.forEach(([title, detail], i) => {
  const x = 92 + i * 452;
  parts.push(txt(x, 1231, title, 34, '#d4ba8f'), txt(x, 1278, detail, 26));
});
parts.push(line(92, 1324, 2308, 1324));
parts.push(txt(92, 1390, '对我们的价值', 38, '#eee8df', 'serif'));
const values = [
  ['形成审美判断', '沉淀参考库与选片依据', '把“有感觉”落实到可讨论的画面。'],
  ['推动原创创作', '提炼关系、简报与系列规则', '借风格和技术，重新设计题材与构图。'],
  ['探索体验产品', '情绪图像展、壁纸、短片方向', '先验证观看感受，再验证持续使用价值。']
];
values.forEach(([title, outputText, detail], i) => {
  const x = 92 + i * 754;
  parts.push(txt(x, 1452, title, 32, '#d4ba8f'), txt(x, 1497, outputText, 29, '#eee8df'), txt(x, 1540, detail, 26));
});
parts.push(line(92, 1582, 2308, 1582));
parts.push(txt(92, 1628, '参照来源：@cozyycabin 置顶双图；原作者与实拍、合成或 AI 制作方式未核实。', 23, '#9eabb6'));
parts.push(txt(92, 1670, '情绪名称与方法为本项目解读；白鹭为待评试作。产品为探索方向，未证明情绪命中或商业成效。', 23, '#9eabb6'));
parts.push('</svg>');
fs.writeFileSync(path.join(output, 'art-emotion-value-map.svg'), parts.join('\n'));
console.log('Created assets/diagrams/art-emotion-value-map.svg · 2400 × 1700');
