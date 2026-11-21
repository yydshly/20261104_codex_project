(() => {
  'use strict';
  const $=id=>document.getElementById(id);
  const renderer=new window.PaperRelief($('relief-canvas'));
  const scenes={
    pond:{number:'001',name:'溪桥拾秋',kicker:'风落下一片秋，轻轻收进篮子。',unit:'片已拾',action:'拾起一片秋叶 ↗',instruction:'静态画稿：点一片秋叶，查看收进藤篮后的画面。',initial:'溪水慢慢流，桥下有六片秋叶。',pending:'秋叶正顺着风轻轻收拢，手腕停一停，再放进篮中。',response:'一片秋叶收进篮中，水面又恢复安静。',complete:'六片秋叶都收好了。把这一个小小的秋天带回家。'},
    field:{number:'002',name:'田间晚风',kicker:'暮色里的麦穗，和田垄上的新绿。',unit:'处已栽',action:'栽下一簇新苗 ↗',instruction:'点一处空田，看新苗慢慢长起来。',initial:'晚风过麦田，六处田垄等着新苗。',pending:'农人轻轻落下农具，新苗正慢慢舒展。',response:'一簇新苗慢慢舒展，田里留下一点生长。',complete:'六处田垄都有了新绿。田间的晚风还在继续。'},
    garden:{number:'003',name:'雨后花园',kicker:'给一点水，等一朵花。',unit:'丛已照料',action:'照料一丛花 ↗',instruction:'点一株幼苗，看花枝在纸上舒展。',initial:'雨刚停，花园里有六株等待照料的幼苗。',pending:'水壶微倾，先长叶，再等花开。',response:'花枝舒展开来，篱笆旁多了一点颜色。',complete:'六丛花都开好了。这是一座由你照料的小花园。'}
  };
  const steps=[
    {label:'SCENE GRAPH',title:'先让物体可以被单独操作',copy:'桥、人物、秋叶和篮子分别绘制。秋叶有自己的位置和状态，拾取后通过一段缓慢的弧线进入篮子。背景与大部分物体保留在原位。',code:'scene = { items: [...], completed: Set(), effect: gather | grow }',proof:'验证：拾一片秋叶，观察它的路径、篮子与数量同步变化。',view:'ink'},
    {label:'COLOR + HEIGHT',title:'让纸和墨共用同一个表面',copy:'图形提供有限彩墨；数万条固定种子的短纤维组成纸面高度。纤维也参与边缘扰动和墨色缺损，让纸、线条与色块呈现连续的触感。',code:'surface = fibers + pores; print = pigment × coverage(surface)',proof:'验证：在“合成”和“墨色”间切换，看同一形体怎样获得纸墨表面。',view:'height'},
    {label:'NORMAL + LIGHT',title:'把光照留给纸的微小起伏',copy:'纸纤维与浅压印共同参与法线计算，漫反射形成细小明暗。图形边缘只保留克制的起伏。切换“初版浮雕”，可以在同一构图中比较两种表面处理。',code:'normal = gradient(paper × grain + shallow_press × depth)',proof:'验证：比较“纸墨版画”和“初版浮雕”，观察纤维、色块与边缘。',view:'normal'},
    {label:'INPUT → STATE → FRAME',title:'让一次动作，留下一个缓慢的回应',copy:'拾叶先接应、短暂停顿，再收进篮中；栽苗时上身与农具一起轻动，花枝按茎、叶、花瓣的次序舒展。计数记下真实状态，局部姿态帧解释变化。纸面纹理保持静止，动作结束后重新安静。',code:'input → state → local poses → gentle transition → rest',proof:'验证：照料一丛花，再暂停微动，操作仍然有效且状态清楚。',view:'final'}
  ];
  const extensions=[
    {label:'MATERIAL AS LANGUAGE',title:'用材质，建立人与内容的关系。',copy:'纸和有限墨色容易让人联想到手作、出版与被珍惜的记录。这是艺术方向假设，需要用实际画面和受众反馈确认。它更适合阅读、纪念、文化展示；高频操作台仍需先保证信息密度和识别速度。',test:'用同一份内容分别做中性平面版和纸面版，让使用者描述感受，并完成同一项查找任务。',action:'去展台比较材质 ↗',scene:'pond',view:'ink'},
    {label:'ANIMATION AS EXPLANATION',title:'用户做了什么，应该在画里留下因果。',copy:'一次输入带来一个明确变化，再以缓慢的局部动作解释结果。纸面与大部分构图安静保留，观看者可以跟随秋叶的路径，找到篮子里新增加的那一片。',test:'拾取秋叶后，让使用者指出秋叶的去向与数量变化；再暂停动画，检查操作是否依然清楚。',action:'去溪桥拾一片秋叶 ↗',scene:'pond',view:'final'},
    {label:'DATA AS LANDSCAPE',title:'让数据，在景观中留下形状。',copy:'当目标是回顾、纪念或感知累积，可以把一条记录映射成一株植物，把分类映射成不同位置。精确数值仍提供文字；相似外观不能掩盖真实差异，记录缺失也不能画成已经完成。',test:'在雨后花园照料三丛，比较数字与花朵是否一一对应，再用脱敏示例讨论怎样迁移到复盘。',action:'进入雨后花园 ↗',scene:'garden',view:'final'},
    {label:'SMALL WORLDS AS PRODUCTS',title:'一次性效果，可以扩展为主题内容与模板。',copy:'文化展项、节气贺卡、阅读里程碑都可共用渲染层与交互规则。真正的产品成本在原创图形、内容更新、低端设备适配和无障碍体验。当前样本尚不能证明付费意愿或稳定商业回报。',test:'先做一个面向明确场景的最小模板，观察使用者能否独立完成操作与导出，再决定是否增加题材。',action:'体验一次并导出画面 ↗',scene:'field',view:'final'}
  ];
  let current='pond',extensionIndex=0;const counts={pond:0,field:0,garden:0},completed={pond:new Set(),field:new Set(),garden:new Set()};let toastTimer,sliderFrame;
  function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,3600);}
  function pressed(selector,match){document.querySelectorAll(selector).forEach(button=>button.setAttribute('aria-pressed',String(match(button))));}
  function modeLabel(){$('render-mode').textContent={final:renderer.params.material==='relief'?'初版浮雕 · 对照':'纸墨版画 · 当前',ink:'墨色 / Albedo',height:'表面高度 / Height',normal:'表面法线 / Normal'}[renderer.params.view];}
  function setView(view){renderer.setParams({view});pressed('[data-view]',b=>b.dataset.view===view);modeLabel();updateScene();}
  function updateScene(){
    const s=scenes[current];$('canvas-number').textContent=s.number;$('scene-kicker').textContent=s.kicker;$('scene-title').textContent=s.name;$('scene-instruction').textContent=s.instruction;
    $('progress-number').textContent=counts[current];$('progress-label').textContent=`/ 6 ${s.unit}`;$('action').textContent=counts[current]>=6?'已完成，重置可再玩':s.action;$('action').disabled=counts[current]>=6;
    $('scene-status').textContent=renderer.effect&&!renderer.paused?s.pending:counts[current]>=6?s.complete:counts[current]>0?s.response:s.initial;
    $('relief-canvas').setAttribute('aria-label',`${s.name}，${counts[current]}/6 ${s.unit}。${s.instruction}也可使用下方按钮。`);
  }
  function setScene(scene){if(!scenes[scene])return;current=scene;pressed('[data-scene]',b=>b.dataset.scene===scene);renderer.setScene(scene,completed[scene]);updateScene();updatePause();}
  function act(index){
    if(counts[current]>=6)return;
    const chosen=Number.isInteger(index)?index:renderer.getPositions().findIndex((_,i)=>!completed[current].has(i));
    if(chosen<0||chosen>=6||completed[current].has(chosen))return;
    completed[current].add(chosen);counts[current]=completed[current].size;renderer.setCompleted(completed[current],chosen);updateScene();
  }
  $('action').addEventListener('click',()=>act());
  $('relief-canvas').addEventListener('paper-motion-end',event=>{if(event.detail.scene===current)updateScene();});
  $('relief-canvas').addEventListener('click',event=>{const rect=event.currentTarget.getBoundingClientRect();const x=(event.clientX-rect.left)/rect.width*1000,y=(event.clientY-rect.top)/rect.height*630;const i=renderer.hit(x,y);if(i>=0)act(i);});
  document.querySelectorAll('[data-scene]').forEach(b=>b.addEventListener('click',()=>setScene(b.dataset.scene)));
  document.querySelectorAll('[data-view]').forEach(b=>b.addEventListener('click',()=>setView(b.dataset.view)));
  document.querySelectorAll('[data-material]').forEach(b=>b.addEventListener('click',()=>{renderer.setParams({material:b.dataset.material,view:'final'});pressed('[data-material]',node=>node===b);pressed('[data-view]',node=>node.dataset.view==='final');$('material-note').textContent=b.dataset.material==='woodcut'?'细纤维、墨色缺损与浅压印，共同形成纸墨触感。':'初版的较强边缘明暗。构图与状态保持一致，供比较表面处理。';modeLabel();updateScene();}));
  for(const key of ['relief','grain','light']){$(key).value=renderer.params[key];$(key+'-value').value=renderer.params[key]+(key==='light'?'°':'');}
  for(const key of ['relief','grain','light'])$(key).addEventListener('input',()=>{
    $(key+'-value').value=$(key).value+(key==='light'?'°':'');
    cancelAnimationFrame(sliderFrame);sliderFrame=requestAnimationFrame(()=>{renderer.setParams({relief:Number($('relief').value),grain:Number($('grain').value),light:Number($('light').value)});updateScene();});
  });
  function updatePause(){const still=current==='pond';$('pause').disabled=still;$('pause').setAttribute('aria-pressed',String(renderer.paused));$('pause').textContent=still?'静态画稿 · 重绘版':renderer.paused?'播放微动 ▷':'暂停微动 Ⅱ';}
  $('pause').addEventListener('click',()=>{renderer.paused=!renderer.paused;renderer.paint();updatePause();});updatePause();
  const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');motionPreference.addEventListener('change',event=>{renderer.paused=event.matches;renderer.paint();updatePause();});
  $('reset').addEventListener('click',()=>{completed[current].clear();counts[current]=0;renderer.setScene(current,completed[current]);updateScene();toast('当前场景已重置，其他场景的本次进度保留。');});
  function download(href,name){const a=document.createElement('a');a.href=href;a.download=name;document.body.append(a);a.click();a.remove();}
  $('export').addEventListener('click',()=>{const href=renderer.snapshot(),name=`paper-relief-${current}-${renderer.params.view}.png`;$('export-image').src=href;$('export-image-download').href=href;$('export-image-download').download=name;$('export-preview').hidden=false;download(href,name);toast('画面已生成（1000 × 630 PNG），可在下方预览和保存。');});
  $('close-export').addEventListener('click',()=>$('export-preview').hidden=true);
  let latestRecipeURL;
  $('export-recipe').addEventListener('click',()=>{
    const record={project:'paper-relief-lab',implementation:'original-paper-creek-static-v4',source:'https://x.com/ann_nnng/status/2120156122133004665',reference_role:'style and atmosphere only; original subjects, compositions and interactions',exported_at:new Date().toISOString(),scene:current,scene_title:scenes[current].name,counts:{...counts},completed:Object.fromEntries(Object.entries(completed).map(([name,ids])=>[name,[...ids]])),positions:renderer.getPositions().map(p=>[...p]),parameters:{...renderer.params},paused:renderer.paused,canvas:{width:1000,height:630},data_scope:'example states only; no real notes or external data',persistence:'this tab memory only; refresh resets',note:'All shapes and textures are drawn by our code. No original video frames or reference pixels are used by the renderer.'};
    if(latestRecipeURL)URL.revokeObjectURL(latestRecipeURL);const content=JSON.stringify(record,null,2);latestRecipeURL=URL.createObjectURL(new Blob([content],{type:'application/json'}));$('recipe-download').href=latestRecipeURL;$('recipe-download').download=`paper-relief-${current}-recipe.json`;$('recipe-text').textContent=content;$('recipe-preview').hidden=false;download(latestRecipeURL,`paper-relief-${current}-recipe.json`);toast('参数已生成，可在下方查看内容和保存。');
  });
  document.querySelectorAll('.reference-scene').forEach(b=>b.addEventListener('click',async()=>{
    const v=$('reference-video');v.currentTime=Number(b.dataset.time);v.scrollIntoView({behavior:motionPreference.matches?'instant':'smooth',block:'center'});
    try{await v.play();}catch{toast('时间点已选好，点击原片的播放按钮即可观看。');}
  }));
  $('reference-video').addEventListener('error',()=>toast('原作视频暂时无法播放，可通过“查看原帖”观看。'));
  document.querySelectorAll('[data-step]').forEach(b=>b.addEventListener('click',()=>{
    const i=Number(b.dataset.step),s=steps[i];pressed('[data-step]',node=>node===b);$('step-number').textContent=String(i+1).padStart(2,'0');$('step-label').textContent=s.label;$('step-title').textContent=s.title;$('step-copy').textContent=s.copy;$('step-code').textContent=s.code;$('step-proof').textContent=s.proof;setView(s.view);
  }));
  document.querySelectorAll('[data-extension]').forEach(b=>b.addEventListener('click',()=>{
    extensionIndex=Number(b.dataset.extension);const e=extensions[extensionIndex];pressed('[data-extension]',node=>node===b);for(const key of ['label','title','copy','test'])$('extension-'+key).textContent=e[key];$('extension-try').textContent=e.action;
  }));
  $('extension-try').addEventListener('click',()=>{const e=extensions[extensionIndex];setScene(e.scene);setView(e.view);$('experience').scrollIntoView({behavior:motionPreference.matches?'instant':'smooth'});});
  updateScene();
  modeLabel();
  // Read-only inspection surface for local verification and future module extraction.
  window.paperStudy={renderer,getState:()=>({scene:current,counts:{...counts},params:{...renderer.params},paused:renderer.paused,stats:{...renderer.renderStats}})};
})();
