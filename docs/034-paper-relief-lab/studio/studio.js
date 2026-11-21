(() => {
  'use strict';
  const $=id=>document.getElementById(id),C=StoryCore,X=StoryExports,clone=C.clone;
  let story,original,selected=0,catalog=[],db,saveTimer,previewTimer,revision=0,saveChain=Promise.resolve(),busy=false,messageTimer,exportURLs=[],lastExports={},lastOutline=[],lastOutlineID='',lastSelection=-1;
  const beat=()=>story.beats[selected];
  function notify(message,error=false){$('message').textContent=message;$('message').hidden=false;$('message').classList.toggle('error',error);clearTimeout(messageTimer);messageTimer=setTimeout(()=>$('message').hidden=true,5500);}
  function openDB(){return new Promise((resolve,reject)=>{const r=indexedDB.open('paper-story-desk.v1',1);r.onupgradeneeded=()=>r.result.createObjectStore('drafts',{keyPath:'id'});r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});}
  function stored(id){return new Promise((resolve,reject)=>{if(!db){resolve(null);return;}const r=db.transaction('drafts').objectStore('drafts').get(id);r.onsuccess=()=>resolve(r.result?.story||null);r.onerror=()=>reject(r.error);});}
  function persist(s){return new Promise((resolve,reject)=>{if(!db){reject(new Error('浏览器未允许本地保存，请导出配置保留修改'));return;}const t=db.transaction('drafts','readwrite');t.objectStore('drafts').put({id:s.id,story:s,savedAt:new Date().toISOString()});t.oncomplete=()=>resolve();t.onerror=()=>reject(t.error);t.onabort=()=>reject(t.error||new Error('草稿保存被中止'));});}
  function saveNow(){clearTimeout(saveTimer);const copy=clone(story),rev=revision;$('save-status').textContent='正在保存…';saveChain=saveChain.catch(()=>{}).then(()=>persist(copy));return saveChain.then(()=>{if(story.id===copy.id&&revision===rev)$('save-status').textContent='已保存到本机浏览器';},e=>{$('save-status').textContent='保存失败，请导出配置备份';notify(e.message,true);throw e;});}
  function changed(){revision++;$('save-status').textContent='有修改 · 正在安排保存';clearTimeout(saveTimer);saveTimer=setTimeout(()=>saveNow().catch(()=>{}),450);clearTimeout(previewTimer);previewTimer=setTimeout(renderPreview,200);renderList();}
  function renderList(){
    if(lastOutlineID===story.id&&lastSelection===selected&&lastOutline.length===story.beats.length&&story.beats.every((b,i)=>lastOutline[i].id===b.id&&lastOutline[i].title===b.title&&lastOutline[i].visual===b.visual)){$('cover-beat').value=story.coverBeat;return;}
    lastOutlineID=story.id;lastSelection=selected;lastOutline=story.beats.map(b=>({id:b.id,title:b.title,visual:b.visual}));
    $('beat-list').innerHTML=story.beats.map((b,i)=>`<button type="button" class="beat-button" data-index="${i}" aria-current="${i===selected}"><img src="${C.escape(b.visual.src)}" alt=""><span><small>第 ${i+1} 幕</small><strong>${C.escape(b.title||'未命名分幕')}</strong></span></button>`).join('');$('beat-count').textContent=story.beats.length+' 幕';
    $('cover-beat').innerHTML=story.beats.map((b,i)=>`<option value="${C.escape(b.id)}">${i+1} · ${C.escape(b.title)}</option>`).join('');$('cover-beat').value=story.coverBeat;
  }
  function fillEditor(){
    const b=beat();$('editing-number').textContent=`第 ${selected+1} 幕 / ${story.beats.length}`;$('editing-title').textContent=b.title||'未命名分幕';
    document.querySelectorAll('[data-beat]').forEach(el=>el.value=b[el.dataset.beat]||'');document.querySelectorAll('[data-story]').forEach(el=>el.value=story[el.dataset.story]||'');
    $('action-label').value=b.action?.label||'';$('action-href').value=b.action?.href||'';$('art-preview').src=b.visual.src;$('image-info').textContent=`${b.visual.width} × ${b.visual.height}`;
    $('move-up').disabled=selected===0;$('move-down').disabled=selected===story.beats.length-1;$('remove-beat').disabled=story.beats.length<=1;$('add-beat').disabled=story.beats.length>=12;
  }
  function previewCopy(value){const copy=C.clone(value);if(!copy.title.trim())copy.title='未命名故事';for(const b of copy.beats){if(!b.title.trim())b.title='未命名分幕';if(b.action&&!/^https?:\/\/[^\s<>"']+$/i.test(b.action.href))b.action.href='';}return copy;}
  function validateDraft(value){C.validate(previewCopy(value),{embedded:true});return value;}
  function renderPreview(){try{$('preview').srcdoc=C.markup(C.validate(previewCopy(story),{embedded:true}));}catch(e){notify(e.message,true);}}
  $('preview').addEventListener('load',()=>{try{const target=$('preview').contentDocument.getElementById('beat-'+beat().id);$('preview').contentWindow.scrollTo({top:target?.offsetTop||0,behavior:'instant'});}catch{}});
  function renderAll(){renderList();fillEditor();renderPreview();}
  function controls(enabled){for(const id of ['project','save','export-config','restore-beat','export-web','export-cover','export-long'])$(id).disabled=!enabled;$('workspace').setAttribute('aria-busy',String(!enabled));}
  async function source(id){const entry=catalog.find(item=>item.id===id);if(!entry)throw new Error('没有这份示例故事');const url=new URL('stories/'+entry.file,location.href),r=await fetch(url);if(!r.ok)throw new Error('无法读取故事配置');return X.hydrate(C.validate(await r.json()),url);}
  async function switchStory(id,{save=true}={}){
    if(busy)return;busy=true;controls(false);$('loading').hidden=false;
    try{if(story&&save)await saveNow();const base=id.startsWith('import-')?await stored(id):await source(id),draft=await stored(id);original=base;story=draft?validateDraft(draft):clone(base);selected=0;revision=0;$('project').value=id;renderAll();$('save-status').textContent=draft?'已恢复本机草稿':'示例已载入 · 修改后自动保存';}
    catch(e){notify(e.message,true);if(story)$('project').value=story.id;}
    finally{busy=false;$('loading').hidden=true;controls(!!story);if(story)fillEditor();}
  }
  document.addEventListener('keydown',e=>{const control=e.target.closest('label.file-button');if(control&&(e.key==='Enter'||e.key===' ')){e.preventDefault();control.querySelector('input[type=file]')?.click();}});
  $('project').addEventListener('change',e=>switchStory(e.target.value));
  $('beat-list').addEventListener('click',e=>{const b=e.target.closest('[data-index]');if(!b||busy)return;selected=Number(b.dataset.index);renderAll();});
  $('beat-form').addEventListener('submit',e=>e.preventDefault());
  $('beat-form').addEventListener('input',e=>{if(!story)return;const key=e.target.dataset.beat;if(key){beat()[key]=e.target.value;$('editing-title').textContent=beat().title||'未命名分幕';changed();}else if(e.target.id==='action-label'||e.target.id==='action-href'){beat().action={label:$('action-label').value,href:$('action-href').value};changed();}});
  $('story-form').addEventListener('input',e=>{if(!story||!e.target.dataset.story)return;story[e.target.dataset.story]=e.target.value;changed();});
  $('save').addEventListener('click',()=>saveNow().catch(()=>{}));
  $('restore-beat').addEventListener('click',()=>{const base=original.beats.find(b=>b.id===beat().id);if(!base){notify('这是新增的一幕，没有原始图稿可恢复');return;}story.beats[selected]=clone(base);changed();renderAll();notify('此幕已恢复为载入时的内容，其他幕保留。');});
  $('add-beat').addEventListener('click',()=>{if(story.beats.length>=12)return;const b=clone(beat());b.id='beat-'+Date.now().toString(36);b.title='新的一幕';b.narration='';b.dialogue='';b.caption='';b.purpose='';delete b.action;story.beats.splice(selected+1,0,b);selected++;changed();renderAll();});
  $('remove-beat').addEventListener('click',()=>{if(story.beats.length<=1)return;const removed=story.beats.splice(selected,1)[0];selected=Math.min(selected,story.beats.length-1);if(story.coverBeat===removed.id)story.coverBeat=beat().id;changed();renderAll();});
  for(const [id,delta] of [['move-up',-1],['move-down',1]])$(id).addEventListener('click',()=>{const target=selected+delta;if(target<0||target>=story.beats.length)return;[story.beats[selected],story.beats[target]]=[story.beats[target],story.beats[selected]];selected=target;changed();renderAll();});
  $('image-file').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f)return;const id=story.id,bid=beat().id;let url;
    try{if(!/^image\/(png|jpeg|webp)$/.test(f.type)||f.size>10*1024*1024)throw new Error('请选择不超过 10 MB 的 PNG、JPEG 或 WebP');url=URL.createObjectURL(f);const visual=await X.normaliseImage(url);if(visual.src.length>15000000)throw new Error('转换后的图稿过大，请压缩图片后重试');if(story.id!==id||beat().id!==bid)throw new Error('已经切换分幕，请在目标幕重新选择图稿');beat().visual={...visual,name:f.name};changed();fillEditor();renderPreview();notify('仅替换了当前幕图稿。');}catch(error){notify(error.message,true);}finally{if(url)URL.revokeObjectURL(url);e.target.value='';}
  });
  $('import-config').addEventListener('change',async e=>{
    const f=e.target.files[0];if(!f||busy)return;busy=true;controls(false);
    try{if(f.size>65*1024*1024)throw new Error('配置文件过大');const imported=C.validate(JSON.parse(await f.text()),{embedded:true});if(story)await saveNow();const s=clone(imported);s.id='import-'+Date.now().toString(36);story=s;original=clone(s);selected=0;revision=0;const option=document.createElement('option');option.value=s.id;option.textContent=s.title+' · 导入副本';$('project').append(option);$('project').value=s.id;renderAll();await saveNow();notify('配置已作为独立副本导入，原故事未覆盖。');}catch(error){notify('未导入：'+error.message,true);}finally{e.target.value='';busy=false;controls(!!story);if(story)fillEditor();}
  });
  // Imported projects are persisted and restored alongside the built-in examples.
  async function restoreImported(){if(!db)return;const rows=await new Promise((resolve,reject)=>{const r=db.transaction('drafts').objectStore('drafts').getAll();r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(r.error);});for(const row of rows){if(row.id.startsWith('import-')){const o=document.createElement('option');o.value=row.id;o.textContent=row.story.title+' · 导入副本';$('project').append(o);}}}
  for(const mode of ['desktop','mobile'])$('preview-'+mode).addEventListener('click',()=>{$('preview-stage').classList.toggle('mobile',mode==='mobile');for(const m of ['desktop','mobile'])$('preview-'+m).setAttribute('aria-pressed',String(m===mode));});
  $('open-preview').addEventListener('click',()=>{try{$('full-preview').srcdoc=C.markup(C.validate(story,{embedded:true}));$('reader-dialog').showModal();}catch(e){notify(e.message,true);}});$('close-reader').addEventListener('click',()=>$('reader-dialog').close());
  function releaseExports(){for(const url of exportURLs)URL.revokeObjectURL(url);exportURLs=[];}
  function fileURL(blob){const url=URL.createObjectURL(blob);exportURLs.push(url);return url;}
  function triggerDownload(url,name){const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();}
  function present({kind,blob,name,width,height,contentBottom,html}){
    releaseExports();const url=fileURL(blob);lastExports={kind,blob,name,width,height,contentBottom,html};$('download').href=url;$('download').download=name;$('export-title').textContent={web:'网页包已生成',cover:'封面已生成',long:'长图已生成',config:'配置已生成'}[kind];$('export-description').textContent=width?`${width} × ${height} PNG · 当前修改已包含在画面里`:'图片已内嵌。保存后可独立保留当前故事与图稿。';$('export-image').hidden=!width;if(width)$('export-image').src=url;else $('export-image').removeAttribute('src');$('download-html').hidden=!html;if(html){$('download-html').href=fileURL(new Blob([html],{type:'text/html;charset=utf-8'}));$('download-html').download=story.id+'.html';}$('export-dialog').showModal();triggerDownload(url,name);
  }
  async function exportCurrent(kind){if(busy)return;busy=true;for(const id of ['export-web','export-cover','export-long','export-config'])$(id).disabled=true;
    try{const snapshot=C.clone(C.validate(story,{embedded:true}));if(kind==='web'){const html=C.markup(snapshot);present({kind,blob:X.webPackage(snapshot),name:snapshot.id+'-web.zip',html});}else if(kind==='config')present({kind,blob:new Blob([JSON.stringify(snapshot,null,2)],{type:'application/json'}),name:snapshot.id+'-story.json'});else{const result=await(kind==='cover'?X.cover(snapshot):X.longImage(snapshot));present({kind,...result,name:snapshot.id+'-'+kind+'.png'});}}catch(e){notify(e.message,true);}finally{busy=false;for(const id of ['export-web','export-cover','export-long','export-config'])$(id).disabled=false;}}
  for(const kind of ['web','cover','long','config'])$('export-'+kind).addEventListener('click',()=>exportCurrent(kind));$('close-export').addEventListener('click',()=>$('export-dialog').close());
  window.storyDesk={getState:()=>story?clone(story):null,getLastExport:()=>lastExports,whenSaved:()=>saveChain};
  (async()=>{try{try{db=await openDB();}catch(e){notify('本地存储不可用，仍可编辑并导出配置。',true);}const response=await fetch('stories/catalog.json');if(!response.ok)throw new Error('故事目录读取失败');catalog=await response.json();$('project').innerHTML=catalog.map(s=>`<option value="${C.escape(s.id)}">${C.escape(s.title)}</option>`).join('');await restoreImported();await switchStory(catalog[0].id,{save:false});}catch(e){$('loading').hidden=true;$('save-status').textContent='载入失败';notify(e.message+'；请通过本机预览服务器打开制作台。',true);}})();
})();
