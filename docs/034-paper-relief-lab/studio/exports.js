(function(root){
  'use strict';
  const Core=root.StoryCore,encode=new TextEncoder();
  const image=src=>new Promise((resolve,reject)=>{const i=new Image();i.onload=()=>resolve(i);i.onerror=()=>reject(new Error('图稿读取失败，请重新选择图片'));i.src=src;});
  const blob=canvas=>new Promise((resolve,reject)=>canvas.toBlob(b=>b?resolve(b):reject(new Error('图片导出失败')),'image/png'));
  async function normaliseImage(src){const i=await image(src),scale=Math.min(1,2400/Math.max(i.naturalWidth,i.naturalHeight)),c=document.createElement('canvas');c.width=Math.round(i.naturalWidth*scale);c.height=Math.round(i.naturalHeight*scale);const x=c.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);x.drawImage(i,0,0,c.width,c.height);return{src:c.toDataURL('image/png'),width:c.width,height:c.height,mime:'image/png'};}
  async function hydrate(story,url){const s=Core.clone(story);for(const b of s.beats){if(!b.visual.src.startsWith('data:'))b.visual={...b.visual,...await normaliseImage(new URL(b.visual.src,url).href)};}return Core.validate(s,{embedded:true});}
  function lines(ctx,text,width){const out=[];for(const paragraph of String(text||'').split('\n')){if(!paragraph){out.push('');continue;}let line='';for(const c of Array.from(paragraph)){if(line&&ctx.measureText(line+c).width>width){const chars=Array.from(line);if(/[，。！？、：；）】》”’%.,:;!?)]/.test(c)||/[（【《“‘(]$/.test(line)){const carry=chars.pop();out.push(chars.join(''));line=carry+c;}else{out.push(line);line=c;}}else line+=c;}out.push(line);}return out;}
  function setFont(ctx,size,serif=false){ctx.font=`${size}px ${serif? '"SimSun",serif':'"Microsoft YaHei","Segoe UI",sans-serif'}`;ctx.textBaseline='top';}
  function write(ctx,text,x,y,width,size,color,serif=false,lineHeight=size*1.7){setFont(ctx,size,serif);ctx.fillStyle=color;const wrapped=lines(ctx,text,width);for(const line of wrapped){ctx.fillText(line,x,y);y+=lineHeight;}return y;}
  async function cover(story){
    Core.validate(story,{embedded:true});await document.fonts.ready;
    const t=Core.THEMES[story.theme],c=document.createElement('canvas');c.width=1600;c.height=900;const x=c.getContext('2d');x.fillStyle=t.background;x.fillRect(0,0,1600,900);
    const b=story.beats.find(b=>b.id===story.coverBeat),im=await image(b.visual.src),box={x:660,y:90,w:860,h:650};const scale=Math.min(box.w/im.width,box.h/im.height);x.drawImage(im,box.x+(box.w-im.width*scale)/2,box.y+(box.h-im.height*scale)/2,im.width*scale,im.height*scale);
    write(x,story.category||'STORY',80,100,530,20,t.accent);
    let size=64;for(;size>32;size-=2){setFont(x,size,true);const titleLines=lines(x,story.title,520);if(titleLines.length*size*1.5<395&&(titleLines.length===1||Array.from(titleLines.at(-1)).length>=3))break;}
    let y=write(x,story.title,80,180,520,size,t.ink,true,size*1.5)+25;setFont(x,25,true);let sub=lines(x,story.subtitle,520);if(sub.length>3)sub=[...sub.slice(0,2),sub[2].slice(0,-1)+'…'];y=write(x,sub.join('\n'),80,y,520,25,t.muted,true,43);
    x.fillStyle=t.accent;x.fillRect(80,790,55,3);write(x,`${story.beats.length} 幕 · ${story.label||'一个故事'}`,80,820,1400,20,t.muted);
    return{blob:await blob(c),width:c.width,height:c.height};
  }
  async function longImage(story){
    Core.validate(story,{embedded:true});await document.fonts.ready;const t=Core.THEMES[story.theme],width=1200,pad=70,content=width-pad*2;
    const measure=document.createElement('canvas').getContext('2d');const heightOf=(txt,size,serif=false,lh=size*1.7)=>{setFont(measure,size,serif);return lines(measure,txt,content).length*lh;};
    let height=70+heightOf(story.title,56,true,80)+30+heightOf(story.subtitle,27,true,46)+35+(story.note?heightOf(story.note,20,false,32)+24:0);
    const plans=[];
    for(const b of story.beats){const im=await image(b.visual.src),ih=Math.min(1300,content*im.height/im.width);const h=150.5+ih+heightOf(b.title,37,true,56)+20+(b.narration?heightOf(b.narration,25,false,43)+20:0)+(b.dialogue?heightOf(b.dialogue,30,true,49)+20:0)+(b.caption?heightOf(b.caption,20,false,33)+18:0)+(b.action?.href?heightOf((b.action.label||'继续了解')+' · '+b.action.href,19,false,30)+16:0);plans.push({b,im,ih,h});height+=h;}
    height+=heightOf(story.ending,35,true,60)+80;height=Math.ceil(height);
    if(height>30000||height*width>34000000)throw new Error('这份长图过长，请缩短文字或减少分幕后导出；网页包仍可导出');
    const c=document.createElement('canvas');c.width=width;c.height=height;const x=c.getContext('2d');x.fillStyle=t.background;x.fillRect(0,0,width,height);
    let y=70;y=write(x,story.title,pad,y,content,56,t.ink,true,80)+30;y=write(x,story.subtitle,pad,y,content,27,t.muted,true,46)+35;if(story.note)y=write(x,story.note,pad,y,content,20,t.muted,false,32)+24;
    for(let i=0;i<plans.length;i++){const {b,im,ih}=plans[i];x.fillStyle=t.accent;x.fillRect(pad,y,content,1);y+=30;y=write(x,String(i+1).padStart(2,'0'),pad,y,content,25,t.accent)+18;const iw=ih*im.width/im.height;x.drawImage(im,pad+(content-iw)/2,y,iw,ih);y+=ih+35;y=write(x,b.title,pad,y,content,37,t.ink,true,56)+20;if(b.narration)y=write(x,b.narration,pad,y,content,25,t.ink,false,43)+20;if(b.dialogue)y=write(x,b.dialogue,pad,y,content,30,t.accent,true,49)+20;if(b.caption)y=write(x,b.caption,pad,y,content,20,t.muted,false,33)+18;if(b.action?.href)y=write(x,(b.action.label||'继续了解')+' · '+b.action.href,pad,y,content,19,t.muted,false,30)+16;y+=25;}
    y=write(x,story.ending,pad,y+10,content,35,t.ink,true,60);if(y+40>height)throw new Error('长图排版超出画布，请减少内容后重试');
    return{blob:await blob(c),width,height,contentBottom:Math.ceil(y)};
  }
  const crcTable=Uint32Array.from({length:256},(_,n)=>{let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;return c>>>0;});
  function crc32(bytes){let c=0xffffffff;for(const b of bytes)c=crcTable[(c^b)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
  function zip(files){
    const chunks=[],centers=[];let offset=0,centralSize=0;
    for(const [name,body] of files){const n=encode.encode(name),data=typeof body==='string'?encode.encode(body):body,crc=crc32(data),h=new Uint8Array(30+n.length),v=new DataView(h.buffer);v.setUint32(0,0x04034b50,true);v.setUint16(4,20,true);v.setUint16(6,0x800,true);v.setUint16(12,33,true);v.setUint32(14,crc,true);v.setUint32(18,data.length,true);v.setUint32(22,data.length,true);v.setUint16(26,n.length,true);h.set(n,30);chunks.push(h,data);
      const ch=new Uint8Array(46+n.length),cv=new DataView(ch.buffer);cv.setUint32(0,0x02014b50,true);cv.setUint16(4,20,true);cv.setUint16(6,20,true);cv.setUint16(8,0x800,true);cv.setUint16(14,33,true);cv.setUint32(16,crc,true);cv.setUint32(20,data.length,true);cv.setUint32(24,data.length,true);cv.setUint16(28,n.length,true);cv.setUint32(42,offset,true);ch.set(n,46);centers.push(ch);centralSize+=ch.length;offset+=h.length+data.length;
    }
    const end=new Uint8Array(22),e=new DataView(end.buffer);e.setUint32(0,0x06054b50,true);e.setUint16(8,files.length,true);e.setUint16(10,files.length,true);e.setUint32(12,centralSize,true);e.setUint32(16,offset,true);return new Blob([...chunks,...centers,end],{type:'application/zip'});
  }
  function webPackage(story){Core.validate(story,{embedded:true});return zip([['index.html',Core.markup(story)],['story.json',JSON.stringify(story,null,2)],['README.txt','解压后直接打开 index.html。图片已内嵌，无需联网或安装依赖。\n将 story.json 导入故事制作台可继续编辑。\n故事中的外部产品入口需要对应服务可访问。\n']]);}
  root.StoryExports={normaliseImage,hydrate,cover,longImage,webPackage,zip,crc32};
})(typeof window!=='undefined'?window:globalThis);
