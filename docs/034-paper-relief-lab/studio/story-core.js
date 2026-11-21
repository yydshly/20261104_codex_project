/* Shared content contract and reader: also used by standalone exports. */
(function(root){
  'use strict';
  const THEMES={paper:{background:'#f6f3ea',ink:'#30382e',accent:'#934b3b',muted:'#747a6b'},editorial:{background:'#f2f5f5',ink:'#19343d',accent:'#176e73',muted:'#617980'}};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const escape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const safeLink=value=>!value||/^https?:\/\/[^\s<>"']+$/i.test(value);
  function text(value,label,max=4000){if(typeof value!=='string'||value.length>max)throw new Error(label+'格式不正确或过长');return value;}
  function validate(story,{embedded=false}={}){
    if(!story||story.version!==1)throw new Error('请选择 version: 1 的故事配置');
    if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(story.id))throw new Error('故事 ID 只能使用英文小写、数字、横线');
    if(!text(story.title,'标题',80).trim())throw new Error('故事标题不能为空');
    for(const key of ['subtitle','ending','audience','note','label','category','credit'])text(story[key]??'',key,2000);
    if(!THEMES[story.theme])throw new Error('不支持这个视觉主题');
    if(!Array.isArray(story.beats)||story.beats.length<1||story.beats.length>12)throw new Error('故事需要 1–12 幕');
    const ids=new Set();
    for(const beat of story.beats){
      if(!/^[a-z0-9][a-z0-9_-]{0,79}$/.test(beat.id)||ids.has(beat.id))throw new Error('分幕 ID 无效或重复');ids.add(beat.id);
      for(const key of ['title','narration','dialogue','caption','alt','purpose'])text(beat[key]??'',key,key==='title'?120:6000);
      if(!beat.title.trim())throw new Error('每幕需要一个标题');
      const image=beat.visual;if(!image||typeof image.src!=='string')throw new Error('分幕缺少图稿');
      if(image.src.length>15000000)throw new Error('单张图稿过大，请先压缩');
      const data=/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(image.src);
      const local=!/[:\\]/.test(image.src)&&!image.src.startsWith('//')&&!/[<>"'\u0000-\u001f]/.test(image.src)&&image.src.length<500;
      if(!data&&(!local||embedded))throw new Error('图稿需为本地路径或内嵌 PNG / JPEG / WebP；导入配置需内嵌图片');
      if(!Number.isFinite(image.width)||!Number.isFinite(image.height)||image.width<1||image.height<1||image.width>12000||image.height>12000)throw new Error('图稿尺寸无效');
      if(beat.action){text(beat.action.label,'入口标题',100);text(beat.action.href,'入口地址',1000);if(!safeLink(beat.action.href))throw new Error('入口仅支持 http / https 链接');}
    }
    if(!ids.has(story.coverBeat))throw new Error('封面对应的分幕不存在');
    return story;
  }
  function css(story){const t=THEMES[story.theme];return `:root{color-scheme:light;--bg:${t.background};--ink:${t.ink};--accent:${t.accent};--muted:${t.muted}}*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.95 "Microsoft YaHei","Segoe UI",sans-serif}header,main,footer{width:min(1120px,calc(100% - 64px));margin:auto}header{padding:26px 0;border-bottom:1px solid #89948640;font-size:12px;display:flex;justify-content:space-between;gap:20px}a{color:inherit;text-underline-offset:5px}a:hover{color:var(--accent)}a:focus-visible{outline:2px solid var(--accent);outline-offset:5px}.opening{padding:64px 0 50px;max-width:820px}.eyebrow{font-size:11px;letter-spacing:2px;color:var(--muted)}h1{font:normal clamp(36px,5.6vw,64px)/1.4 "Noto Serif SC","SimSun",serif;margin:22px 0}.subtitle{font:20px/1.95 "SimSun",serif;white-space:pre-wrap}.note,figcaption{font-size:12px;color:var(--muted)}.chapter{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(230px,.75fr);gap:40px;align-items:center;padding:36px 0;border-top:1px solid #89948640}figure{margin:0;min-width:0}.story-still{display:block;width:100%;height:auto}.number{font:italic 28px "SimSun",serif;color:var(--accent)}h2{font:normal 29px/1.5 "SimSun",serif;margin:12px 0 24px}p{overflow-wrap:anywhere}.dialogue{font:23px/1.85 "SimSun",serif;color:var(--accent);white-space:pre-wrap}.narration{white-space:pre-wrap}.action{display:inline-block;padding:8px 15px;border:1px solid var(--accent);font-size:13px;margin-top:12px;text-decoration:none}.ending{padding:40px 0 65px;font:25px/1.9 "SimSun",serif;white-space:pre-wrap}footer{border-top:1px solid #89948640;padding:20px 0 35px;color:var(--muted);font-size:11px}@media(max-width:720px){header,main,footer{width:calc(100% - 36px)}.opening{padding:36px 0}.chapter{display:block;padding:26px 0}.chapter article{padding-top:20px}h2{margin:8px 0 15px}.subtitle{font-size:18px}.ending{font-size:22px;padding:25px 0 40px}}@media print{header{display:none}.chapter{break-inside:avoid}a{text-decoration:none}}`;}
  function markup(story,{studioLink=false,fragment=false}={}){
    validate(story);const e=escape;
    const body=`<header><span>${e(story.label||'一个静态故事')}</span>${studioLink?'<a href="studio.html">返回制作台 ↗</a>':'<span>静态阅读 · '+story.beats.length+' 幕</span>'}</header><main><section class="opening"><span class="eyebrow">${e(story.category||'STORY')}</span><h1>${e(story.title)}</h1><p class="subtitle">${e(story.subtitle)}</p>${story.note?`<p class="note">${e(story.note)}</p>`:''}</section>${story.beats.map((b,i)=>`<section class="chapter" id="beat-${e(b.id)}" aria-labelledby="heading-${e(b.id)}"><figure><img class="story-still" data-shot="${i+1}" src="${e(b.visual.src)}" width="${b.visual.width}" height="${b.visual.height}" alt="${e(b.alt)}"><figcaption>${e(b.caption)}</figcaption></figure><article><span class="number">${String(i+1).padStart(2,'0')}</span><h2 id="heading-${e(b.id)}">${e(b.title)}</h2>${b.narration?`<p class="narration">${e(b.narration)}</p>`:''}${b.dialogue?`<p class="dialogue">${e(b.dialogue)}</p>`:''}${b.action?.href?`<a class="action" href="${e(b.action.href)}" target="_blank" rel="noopener noreferrer">${e(b.action.label||'继续了解')} ↗</a>`:''}</article></section>`).join('')}<section class="ending">${e(story.ending)}</section></main><footer>${e(story.credit||'原创内容 · 静态阅读')}</footer>`;
    return fragment?body:`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${e(story.title)}</title><style>${css(story)}</style></head><body>${body}</body></html>`;
  }
  root.StoryCore={THEMES,clone,escape,validate,markup,css};
})(typeof window!=='undefined'?window:globalThis);
