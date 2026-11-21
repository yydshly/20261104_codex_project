(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const scenes = {
    lake: { image:'assets/generated/willow-lake.png', alt:'暮色里低垂的柳枝、安静的湖面和一只小小的白天鹅', overline:'01 / SOMEWHERE, BY THE WATER', title:['有些时刻，','适合什么都不做。'], line:'风经过柳树。你可以再坐一会儿。', focus:'56% 50%', sound:'wind' },
    rain: { image:'assets/generated/comfort.png', alt:'山间小屋的窗外下着雨，暖灯照着空椅、热饮与一本手记', overline:'02 / A WINDOW IN THE RAIN', title:['世界留在窗外。','这一刻，留给自己。'], line:'雨还没有停。你也不必急着走。', focus:'46% 50%', sound:'rain' },
    afternoon: { image:'assets/generated/afternoon-window.png', alt:'风吹起柔软的亚麻窗帘，一把空椅停在午后的光里', overline:'03 / THE AFTERNOON STAYS', title:['风过午后。','时间也轻了一点。'], line:'有一把空着的椅子，在光里等你。', focus:'52% 50%', sound:'wind' }
  };
  const sceneIds = Object.keys(scenes);
  let current = 'lake', front = 'a', requestId = 0, pureView = false, headerFrame = 0;
  let audioContext, source, soundFilter, soundGain, soundOn = false;
  const research = $('research');

  async function selectScene(id) {
    if (!scenes[id] || id === current) return;
    const pendingRequest = ++requestId;
    const scene = scenes[id], next = front === 'a' ? 'b' : 'a';
    const nextImage = $(`gallery-image-${next}`);
    nextImage.src = scene.image;
    nextImage.style.objectPosition = scene.focus;
    try { await nextImage.decode(); } catch { $('gallery-status').textContent = '这幅图像还未准备好，请稍后再试。'; return; }
    if (pendingRequest !== requestId) return;
    const previousImage = $(`gallery-image-${front}`);
    previousImage.classList.remove('is-visible'); previousImage.alt = ''; previousImage.setAttribute('aria-hidden','true');
    nextImage.alt = scene.alt; nextImage.removeAttribute('aria-hidden'); nextImage.classList.add('is-visible');
    front = next; current = id;
    $('gallery').dataset.scene=id;
    $('gallery-overline').textContent = scene.overline;
    $('gallery-title').replaceChildren(...scene.title.flatMap((line, index) => index === 0 ? [document.createTextNode(line)] : [document.createElement('br'), document.createTextNode(line)]));
    $('gallery-line').textContent = scene.line;
    if (!reducedMotion) $('gallery-copy').animate([{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'translateY(0)'}],{duration:1150,easing:'ease-out'});
    document.querySelectorAll('[data-gallery-scene]').forEach(button => {
      const active = button.dataset.galleryScene === id;
      button.classList.toggle('is-current',active); button.setAttribute('aria-pressed',String(active));
    });
    $('take-art').href = scene.image; $('take-art').download = `quiet-place-${id}.png`;
    $('gallery-status').textContent = `正在观看${id === 'lake' ? '湖边' : id === 'rain' ? '窗边' : '午后'}。`;
    tuneSound();
  }
  function viewOnly(active) {
    pureView = active;
    $('gallery').classList.toggle('view-only', active);
    document.body.classList.toggle('viewing-only',active);
    $('view-only').setAttribute('aria-pressed',String(active));
    $('view-only').textContent = active ? '返回文字' : '只看画面';
    $('gallery-copy').inert = active;
    document.querySelector('.gallery-bottom').inert = active;
    document.querySelector('.gallery-header nav').inert = active;
    document.querySelector('.gallery-brand').inert = active;
    $('ambient-toggle').inert = active;
    if (active) window.scrollTo({top:0,behavior:reducedMotion ? 'instant':'smooth'});
  }
  function openResearch(target='research') {
    if (pureView) viewOnly(false);
    research.open = true;
    requestAnimationFrame(() => {
      const element = $(target) || research;
      element.scrollIntoView({behavior:reducedMotion ? 'instant':'smooth',block:'start'});
    });
  }
  function tuneSound() {
    if (!audioContext || !soundFilter || !soundGain) return;
    const rain = scenes[current].sound === 'rain';
    const time = audioContext.currentTime;
    soundFilter.frequency.setTargetAtTime(rain ? 1300 : 420,time,.8);
    soundFilter.Q.setTargetAtTime(rain ? .3 : .15,time,.8);
    soundGain.gain.setTargetAtTime(soundOn ? (rain ? .07 : .045) : 0,time,.5);
  }
  async function toggleSound() {
    const button = $('ambient-toggle');
    try {
      if (!audioContext) {
        const Constructor = window.AudioContext || window.webkitAudioContext;
        if (!Constructor) { button.textContent = '声音暂不可用'; return; }
        audioContext = new Constructor();
        const buffer = audioContext.createBuffer(1,audioContext.sampleRate * 4,audioContext.sampleRate);
        const samples = buffer.getChannelData(0);
        let last = 0;
        for (let index=0;index<samples.length;index++) { last = (last + (Math.random()*2-1)*.025)/1.025; samples[index]=last*4; }
        source=audioContext.createBufferSource(); source.buffer=buffer; source.loop=true;
        soundFilter=audioContext.createBiquadFilter(); soundFilter.type='lowpass';
        soundGain=audioContext.createGain(); soundGain.gain.value=0;
        source.connect(soundFilter).connect(soundGain).connect(audioContext.destination); source.start();
      }
      await audioContext.resume();
      soundOn=!soundOn; tuneSound();
      button.setAttribute('aria-pressed',String(soundOn)); button.textContent=soundOn ? '声音已开' : '声音关闭';
    } catch { button.textContent='声音暂不可用'; }
  }
  function updateHeader() {
    headerFrame=0;
    const heroBottom=$('gallery').getBoundingClientRect().bottom;
    const rainBounds=document.querySelector('.rain-passage').getBoundingClientRect();
    const overRain=rainBounds.top<45 && rainBounds.bottom>82;
    $('gallery-header').classList.toggle('on-paper',heroBottom<82 && !overRain);
  }
  document.addEventListener('click',event=>{
    const button=event.target.closest('button'); if (!button) return;
    if (button.dataset.galleryScene) selectScene(button.dataset.galleryScene);
    if (button.hasAttribute('data-open-research')) openResearch();
    if (button.dataset.revisit) { selectScene(button.dataset.revisit); window.scrollTo({top:0,behavior:reducedMotion?'instant':'smooth'}); }
  });
  $('view-only').addEventListener('click',()=>viewOnly(!pureView));
  $('ambient-toggle').addEventListener('click',toggleSound);
  $('gallery').addEventListener('keydown',event=>{
    if (event.target !== $('gallery')) return;
    if (event.key==='ArrowRight' || event.key==='ArrowLeft') {
      event.preventDefault(); const direction=event.key==='ArrowRight'?1:-1;
      selectScene(sceneIds[(sceneIds.indexOf(current)+direction+sceneIds.length)%sceneIds.length]);
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape' && pureView)viewOnly(false);});
  document.addEventListener('visibilitychange',()=>{
    if (!audioContext || !soundOn) return;
    if(document.hidden)audioContext.suspend().catch(()=>{});
    else audioContext.resume().catch(()=>{});
  });
  window.addEventListener('scroll',()=>{if(!headerFrame)headerFrame=requestAnimationFrame(updateHeader);},{passive:true});
  const researchIds=new Set(['product','cases','lab','value','create','library','sources']);
  function followResearchHash(){
    const id=location.hash.slice(1);
    if(researchIds.has(id) && !research.open)openResearch(id);
  }
  window.addEventListener('hashchange',followResearchHash);
  research.addEventListener('toggle',()=>{
    const action=research.querySelector('.research-action');
    action.textContent=research.open?'收起观察与创作工作台':'展开观察与创作工作台';
  });
  if(reducedMotion)document.querySelectorAll('.gallery-image').forEach(image=>image.classList.add('is-static'));
  updateHeader();followResearchHash();
})();
