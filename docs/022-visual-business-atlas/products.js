(() => {
  'use strict';
  const base = 'assets/carrier-products/';
  const products = {
    avatar: { title:'头像 · 让人认出我', image:'avatar-preview.webp', preview:'avatar-1024.png', pack:'avatar-pack.zip', specs:'1024 / 512 px · 方形 PNG', use:'账号、聊天列表与个人主页', value:'用稳定的面孔与神态建立身份识别。', judgment:'重新画近景与招呼姿态，减少物件和文字，让脸在小尺寸里仍然清楚。', check:'缩成 32 px 后，还能认出黑耳、眼神和项圈吗？' },
    wallpaper: { title:'壁纸 · 让环境陪着我', image:'wallpaper-desktop-1920x1080.jpg', preview:'wallpaper-phone-1080x2400.jpg', pack:'wallpaper-pack.zip', specs:'手机 1080×2400 / 桌面 1920×1080 · JPG', use:'手机锁屏与电脑桌面', value:'把喜欢的角色融入每天反复看到的环境。', judgment:'分别绘制睡猫与伸展姿态。手机上部、桌面左侧留白，画面不烧录时钟或图标。', check:'设为自己的壁纸后，时钟、通知和图标是否清楚？' },
    comic: { title:'漫画 · 把经历讲给你', image:'comic-preview.webp', preview:'comic-scroll.png', pack:'comic-pack.zip', specs:'四格整页 + 手机长条 + 4 张独立分镜 · PNG', use:'阅读、转发与保存一个共同故事', value:'让人理解一段有起因、行动与结果的日常。', judgment:'新画四个连续动作：等饭、推碗、按手、一起休息；用文案和镜头顺序建立因果。', check:'按顺序读完后，能否说出猫和人发生了什么变化？' }
  };
  const download = (file,label,primary=false) => `<a class="button ${primary?'primary':'secondary'}" href="${base+file}" download>${label} ↓</a>`;
  const imageButton = (id,file,alt,className='') => `<button type="button" class="product-art-button ${className}" data-product-view="${id}" aria-label="放大查看${products[id].title.split(' · ')[0]}成品"><img src="${base+file}" alt="${alt}" loading="lazy"></button>`;
  let wallpaperMode='phone', wallpaperOverlay=true;
  function scene(id) {
    if(id==='avatar') return `<div class="product-avatar-scene"><div class="carrier-scene-bar">头像实际使用 <small>独立新画面 · 可下载 PNG</small></div><div class="product-avatar-large">${imageButton(id,'avatar-1024.png','新绘制的傲娇白猫近景头像，抬爪招呼')}</div><strong>今天也有点傲娇</strong><small>@whitecat · 同一头像的不同显示尺寸</small><div class="product-avatar-sizes">${[32,64,96].map(n=>`<figure><img src="${base}avatar-512.png" alt="${n}px 头像" width="${n}" height="${n}"><figcaption>${n} px</figcaption></figure>`).join('')}</div><p>上传方形原图，由使用的平台裁成圆形。虚拟出镜模型仍需另行制作。</p></div>`;
    if(id==='wallpaper') return `<div class="product-wallpaper-scene"><div class="carrier-scene-bar">壁纸使用预览 <small>下载文件不含界面文字</small></div><div class="product-mode-controls"><button type="button" data-wallpaper-mode="phone" aria-pressed="${wallpaperMode==='phone'}">手机锁屏</button><button type="button" data-wallpaper-mode="desktop" aria-pressed="${wallpaperMode==='desktop'}">电脑桌面</button><button type="button" id="wallpaper-overlay" aria-pressed="${wallpaperOverlay}">界面参照${wallpaperOverlay?'开':'关'}</button></div><div class="product-device-wrap"><div class="product-device ${wallpaperMode} ${wallpaperOverlay?'with-overlay':''}"><img src="${base}${wallpaperMode==='phone'?'wallpaper-phone-1080x2400.jpg':'wallpaper-desktop-1920x1080.jpg'}" alt="${wallpaperMode==='phone'?'手机壁纸：窗台上安静睡着的白猫，上方留白':'桌面壁纸：窗边伸展的白猫，左侧留白'}"><div class="product-device-ui" aria-hidden="true">${wallpaperMode==='phone'?'<small>11月12日 星期四</small><strong>19:00</strong><span>给自己留一点休息的时间</span>':'<i>文件</i><i>照片</i><i>工作</i><div>桌面图标留白区</div>'}</div></div></div><p>时钟与图标仅作本页参照。下载后请在自己的设备上检查裁切与显示。</p><button type="button" class="product-inline-button" data-product-view="wallpaper" data-product-file="${wallpaperMode==='phone'?'wallpaper-phone-1080x2400.jpg':'wallpaper-desktop-1920x1080.jpg'}">放大查看当前原图 ↗</button></div>`;
    if(id==='comic') return `<div class="product-comic-scene"><div class="carrier-scene-bar">四格漫画成品 <small>四个新分镜 · 阅读顺序 01 → 04</small></div>${imageButton(id,'comic-preview.webp','四格漫画《休息一下，也算正事》，包含等饭、推碗、按住手和一起休息四个不同场景')}<button type="button" class="product-inline-button" data-product-view="comic">展开手机长条，逐格阅读 ↗</button><details><summary>阅读剧情文字</summary><ol><li>19:00，饭点到了。你还在忙。</li><li>空碗推过来，提醒先到位。</li><li>它按住你的手：该休息啦。</li><li>猫吃上饭，你也歇一会儿。</li></ol></details></div>`;
    return '';
  }
  function actions(id) {
    if(id==='avatar') return download('avatar-1024.png','1024 px 头像',true)+download('avatar-512.png','512 px 头像')+download('avatar-pack.zip','头像包');
    if(id==='wallpaper') return download('wallpaper-phone-1080x2400.jpg','手机壁纸',true)+download('wallpaper-desktop-1920x1080.jpg','桌面壁纸')+download('wallpaper-pack.zip','两张壁纸包');
    if(id==='comic') return download('comic-page.png','四格整页',true)+download('comic-scroll.png','手机长条')+download('comic-pack.zip','漫画全套');
    return '';
  }
  const target=document.querySelector('#carrier-products-showcase');
  target.innerHTML=`<div class="product-showcase-heading"><div><p class="micro-label">THREE FINISHED PRODUCTS / READY TO USE</p><h3>同一角色，分别为三种用途重新创作。</h3></div>${download('all-products.zip','下载三类成品')}</div><div class="product-gallery">${Object.entries(products).map(([id,p])=>`<article class="product-card"><div class="product-cover ${id}">${imageButton(id,p.image,`${p.title}的实际下载文件预览`)}${id==='wallpaper'?`<img class="product-phone-thumb" src="${base}wallpaper-phone-1080x2400.jpg" alt="独立手机壁纸预览" loading="lazy">`:''}</div><div class="product-card-copy"><span>可下载成品 / ${p.specs}</span><h4>${p.title}</h4><p>${p.value}</p><small>${p.use}</small><div>${download(p.pack,'下载成品包',true)}<button type="button" class="product-inline-button" data-product-go="${id}">看使用效果与设计取舍 ↗</button></div></div></article>`).join('')}</div><div class="product-comparison-wrap"><table class="product-comparison"><caption>三种载体，人的判断分别落在哪里？</caption><thead><tr><th scope="col">载体</th><th scope="col">人的设计判断</th><th scope="col">用什么检验价值</th></tr></thead><tbody>${Object.entries(products).map(([id,p])=>`<tr><th scope="row">${p.title.split(' · ')[0]}</th><td>${p.judgment}</td><td>${p.check}</td></tr>`).join('')}</tbody></table></div><p class="product-origin-note">本轮按用途独立生成四幅插画：头像、手机壁纸、桌面壁纸、四格故事图。下载包包含成品和使用说明；均为原创虚构角色样品，暂无真实客户反馈。静态壁纸、屏幕阅读漫画已完成；动态屏保与印刷绘本需另行制作。</p>`;
  const viewer=document.createElement('dialog'); viewer.id='product-viewer';viewer.className='product-viewer';viewer.setAttribute('aria-labelledby','product-viewer-title');document.body.appendChild(viewer);
  let opener=null;
  document.addEventListener('click',event=>{
    const view=event.target.closest('[data-product-view]');
    if(view){
      const p=products[view.dataset.productView];if(!p)return;const file=view.dataset.productFile||p.preview;
      opener=view;viewer.innerHTML=`<div class="product-viewer-top"><h3 id="product-viewer-title">${p.title}</h3><button type="button" id="product-viewer-close" aria-label="关闭成品预览">×</button></div><div class="product-viewer-tools">${download(file,'下载当前原图',true)}<span>${p.specs}</span></div><div class="product-viewer-body"><img src="${base+file}" alt="${p.title}完整成品"></div>`;viewer.showModal();
    }
    if(event.target.closest('#product-viewer-close')) viewer.close();
    const go=event.target.closest('[data-product-go]');
    if(go){window.CarrierAtlas.open(go.dataset.productGo);document.querySelector('#carrier-panel').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});document.querySelector('#carrier-panel').focus({preventScroll:true});}
    const mode=event.target.closest('[data-wallpaper-mode]'),overlay=event.target.closest('#wallpaper-overlay');
    if(mode||overlay){if(mode)wallpaperMode=mode.dataset.wallpaperMode;else wallpaperOverlay=!wallpaperOverlay;document.querySelector('#carrier-panel .carrier-scene').innerHTML=scene('wallpaper');document.querySelector(mode?`#carrier-panel [data-wallpaper-mode="${wallpaperMode}"]`:'#wallpaper-overlay').focus({preventScroll:true});}
  });
  viewer.addEventListener('close',()=>opener?.focus({preventScroll:true}));
  window.CarrierProducts={has:id=>Boolean(products[id]),scene,actions};
})();
