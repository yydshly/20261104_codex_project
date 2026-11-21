import {passages} from './reading-content.js';
import {createReadingWorld} from './reading-world.js';
import {createReadingAudio} from './reading-audio.js';
const el=id=>document.getElementById(id),canvas=el('readingCanvas');

let automaticCallsAudible=false;
let page=0;function paintPage(){const p=passages[page];el('passageTitle').textContent=p.title;el('passageText').textContent=p.text;el('pageNumber').textContent=`0${page+1} / 03`;}
function openPassage(value,stopVoice=true){if(!value&&stopVoice)audio.stopNarration();el('passage').hidden=!value;el('readButton').setAttribute('aria-pressed',String(value));paintPage();}
const audio=createReadingAudio(s=>{automaticCallsAudible=Boolean(s.enabled&&s.ready&&s.volume>0&&!s.narrating&&!s.narrationLoading);el('soundButton').setAttribute('aria-pressed',String(s.enabled));el('soundButton').textContent=s.enabled?'♫ 声音已开启':'♫ 开启声音';canvas.dataset.sound=String(s.enabled);canvas.dataset.audioReady=String(s.ready);canvas.dataset.audioSource=s.ambience;canvas.dataset.narrationProvider=s.provider;canvas.dataset.narrating=String(s.narrating);canvas.dataset.narrationPage=String(s.narrationPage);canvas.dataset.narrationLoading=String(s.narrationLoading);el('narrationButton').textContent=s.narrationLoading?'正在准备…':s.narrating?'停止朗读':'听这一页';el('narrationButton').setAttribute('aria-pressed',String(s.narrating||s.narrationLoading));},{connected:true});
let navigation={seated:true,zone:'room',guided:false,doorOpen:false},focused='',bookHidControls=false;
const places={room:'灯下 · 阅读角',porch:'门廊 · 雨声渐近',garden:'庭院 · 林间小径',pond:'池边 · 看一会儿水'};
const focusLabels={seat:'坐回椅子',rest:'靠坐歇一会儿',holdBook:'拿起书阅读',tea:'喝一口茶',lamp:'调一调灯',book:'翻开这一页',door:'开 / 关房门',art:'看看墙上的画',call:'轻声唤鸭子'};
function paintNavigation(s){navigation={...navigation,...s};const n=navigation;document.body.classList.toggle('is-seated',n.seated);document.body.classList.toggle('is-outside',n.zone!=='room');document.body.classList.toggle('is-walking',n.guided||n.walking);
 el('seatButton').textContent=n.seated?'起身走走':n.zone==='room'?'坐下读书':'回房坐下';el('seatButton').setAttribute('aria-pressed',String(n.seated));el('walkButton').textContent=n.guided?'停下步行':n.zone==='pond'?'沿小径回房间':'沿小径去池边';el('placeName').textContent=places[n.zone]||places.garden;
 el('readButton').disabled=n.zone!=='room'&&!n.holdingBook;el('readButton').textContent=n.holdingBook?'阅读书页':'拿书阅读';el('walkHelp').textContent=n.holdingBook?'B 放回书 · E 翻页 · N 朗读 · C 喝茶 · V 切换视角':'拖动环顾 · WASD / 方向键行走 · V 切换视角 · E 交互 · Esc 收起书页';el('lampButton').disabled=n.zone!=='room';
 const atTerrace=Math.hypot((n.position?.x??0)+6,(n.position?.z??0)-6.7)<3.4&&n.zone!=='room';el('terraceActions').hidden=!(atTerrace||n.zone==='room');el('terraceButton').textContent=n.seatedPlace==='terrace'?'从躺椅起身':'去茶桌歇歇';el('terraceButton').setAttribute('aria-pressed',String(n.seatedPlace==='terrace'));if(n.seatedPlace==='terrace')el('placeName').textContent='茶桌旁 · 一起歇一会儿';
 el('seatButton').disabled=el('terraceButton').disabled=Boolean(n.transitioning);el('holdBookButton').textContent=n.holdingBook?'把书放回':'拿起书';el('holdBookButton').setAttribute('aria-pressed',String(Boolean(n.holdingBook)));el('holdBookButton').disabled=!n.seated||n.transitioning;el('teaButton').hidden=n.zone==='room';el('teaButton').disabled=n.seatedPlace!=='terrace'||n.transitioning;
}
const world=createReadingWorld(canvas,{
 randomCallsAllowed:()=>automaticCallsAudible,
 onReady(){el('loading').classList.add('done');document.body.classList.add('is-ready');el('seatButton').disabled=el('walkButton').disabled=el('terraceButton').disabled=false;},
 onError(error){el('loading').textContent='场景有一项素材未能载入，请刷新再试。';el('roomStatus').textContent='场景未能完整载入。';console.error('Reading world loading failed',error);},
 onPosition(s){audio.setPosition(s);if(s.bookPhase==='table'&&bookHidControls&&!s.holdingBook){bookHidControls=false;el('sceneControls').classList.remove('is-collapsed');el('controlsButton').setAttribute('aria-expanded','true');el('controlsButton').textContent='收起操作';}paintNavigation({position:s.listener,holdingBook:s.holdingBook??s.bookHeld,bookBusy:s.bookBusy,bookPhase:s.bookPhase});},
 onPondEvent(event){if(event.type==='quack')canvas.dataset.lastSoundPlayed=String(audio.play('duck',event));if(event.type==='arrive')el('roomStatus').textContent='它游近了一点，安静看一会儿。';},
 onAction(s){
  if(s.kind==='focus'){focused=s.focused;el('interactButton').hidden=!focused;el('interactButton').textContent=(focused==='seat'&&s.seated?'起身走走':focusLabels[focused]||'与物件交互')+' · E';return;}
  paintNavigation(s);
  if(s.kind==='navigation'){if(s.transitioning)el('roomStatus').textContent=s.postureDirection==='stand'?'慢慢起身，想走就走。':'坐下来，让自己舒服一点。';else if(s.guided)el('roomStatus').textContent=s.destination==='terrace'?'沿小径去茶桌，靠坐着歇一会儿。':s.destination==='pond'?'沿小径走到池边。按方向键可以随时接手。':'沿小径回房间，书和灯都还在。';else el('roomStatus').textContent=s.seatedPlace==='terrace'?'靠坐下来，喝茶，听一会儿水。':s.seated?'坐下了，读一会儿。':'慢慢走，想停就停。';}
  if(s.kind==='zone')el('roomStatus').textContent={room:'回到灯下，书还在这里。',porch:'经过门口，雨声渐渐清楚。',garden:'沿着小径走，树叶和雨都在身边。',pond:'到池边了，可以点水面，也可以轻声唤它。'}[s.zone];
  if(s.kind==='holdBook'&&s.holdingBook&&!el('sceneControls').classList.contains('is-collapsed')){bookHidControls=true;el('sceneControls').classList.add('is-collapsed');el('controlsButton').setAttribute('aria-expanded','false');el('controlsButton').textContent='展开操作';}
  if(s.kind==='holdBook'&&!s.holdingBook&&s.bookPhase==='table'&&bookHidControls){bookHidControls=false;el('sceneControls').classList.remove('is-collapsed');el('controlsButton').setAttribute('aria-expanded','true');el('controlsButton').textContent='收起操作';}
  if(s.kind==='holdBook')el('roomStatus').textContent=s.holdingBook?'把书拿在手里，慢慢读；点书可以翻页。':'把书放回桌上，歇歇眼睛。';
  if(s.kind==='put-before-stand')el('roomStatus').textContent='先把书轻轻放回，再起身。';
  if(s.kind==='sit-first')el('roomStatus').textContent='先坐稳再拿书；喝茶请在户外摇椅上靠坐。';
  if(s.kind==='too-far')el('roomStatus').textContent='再走近一点，就可以与它交互。';
  if(s.kind==='book'){const continueReading=audio.getState().narrating||audio.getState().narrationLoading;page=s.page;if(continueReading)audio.narrate(page).catch(()=>{el('roomStatus').textContent='这一页暂时无法朗读，请再试一次。';});if(!s.holdingBook)openPassage(true);canvas.dataset.lastSoundPlayed=String(audio.play('page'));el('roomStatus').textContent='翻到这里，就慢慢读。';}
  if(s.kind==='lamp'){el('lampButton').textContent=['灯光 · 休息','灯光 · 微暖','灯光 · 温暖'][s.lampLevel];canvas.dataset.lastSoundPlayed=String(audio.play('switch'));el('roomStatus').textContent=['灯暗了一点，房间仍陪着你。','留一点柔和的光。','灯是暖的，时间是你的。'][s.lampLevel];}
  if(s.kind==='rain'){el('rainButton').setAttribute('aria-pressed',String(s.raining));el('rainButton').textContent=s.raining?'细雨 · 轻柔':'细雨 · 停歇';audio.setOptions({rain:s.raining});el('roomStatus').textContent=s.raining?'屋外下着同一场雨。':'雨停了，叶子和水面仍在微动。';}
  if(s.kind==='randomCalls'){el('randomDuckButton').setAttribute('aria-pressed',String(s.randomDuckCalls));el('randomDuckButton').textContent=s.randomDuckCalls?'随机鸭叫 · 开':'随机鸭叫 · 关';el('roomStatus').textContent=s.randomDuckCalls?(audio.getState().enabled?'它会隔一会儿自己叫一声，朗读时会暂缓。':'随机鸭叫已开启；开启声音后，它会偶尔自己叫一声。'):'随机鸭叫已关闭，仍然可以手动呼唤它。';}
  if(s.kind==='camera'){document.body.classList.toggle('is-third-person',s.viewMode==='third');el('viewLabel').textContent=(s.viewMode==='third'?'第三人称':'第一人称')+' · V 切换';el('cameraButton').textContent=s.viewMode==='third'?'视角 · 第三人称':'视角 · 第一人称';el('cameraButton').setAttribute('aria-pressed',String(s.viewMode==='third'));el('roomStatus').textContent=s.viewMode==='third'?'从身后看自己，拖动环顾，方向键控制人物。':'回到自己的视线，位置和动作继续保持。';}
  if(s.kind==='call')el('roomStatus').textContent='轻轻唤它，等一小会儿。';
  if(s.kind==='tea')el('roomStatus').textContent='喝一口温茶，慢慢放回桌上。';
  if(s.kind==='art')el('roomStatus').textContent='墙上是莫奈的《韦特伊》（1901），一处光影柔和的河边风景。';
 }
});
el('seatButton').onclick=el('chairHint').onclick=()=>{openPassage(false,false);world.action('seat');};
el('walkButton').onclick=()=>{openPassage(false,false);world.action(navigation.guided?'stop':navigation.zone==='pond'?'room':'pond');};
el('randomDuckButton').onclick=()=>world.action('randomCalls');
el('terraceButton').onclick=()=>{openPassage(false,false);world.action('rest');};
el('controlsButton').onclick=()=>{const panel=el('sceneControls'),collapsed=panel.classList.toggle('is-collapsed');el('controlsButton').setAttribute('aria-expanded',String(!collapsed));el('controlsButton').textContent=collapsed?'展开操作':'收起操作';};
el('holdBookButton').onclick=()=>{openPassage(false,false);world.action('holdBook');};el('teaButton').onclick=()=>world.action('tea');el('cameraButton').onclick=()=>world.action('camera');
el('interactButton').onclick=()=>world.action(focused);
el('lampButton').onclick=el('lampHint').onclick=()=>world.action('lamp');el('rainButton').onclick=()=>world.action('rain');el('bookHint').onclick=()=>world.action(navigation.holdingBook?'book':'holdBook');el('nextPassage').onclick=()=>world.action('book');el('readButton').onclick=()=>{if(!navigation.holdingBook){openPassage(false,false);world.action('holdBook');}else openPassage(el('passage').hidden);};el('closePassage').onclick=()=>openPassage(false);el('resetButton').onclick=()=>{openPassage(false,false);world.action('room');};
el('soundButton').onclick=async()=>{const b=el('soundButton');b.disabled=true;try{await audio.setEnabled(!audio.getState().enabled);el('roomStatus').textContent=audio.getState().enabled?'声音已开启；走到门口、池边，听一听距离的变化。':'声音已收起，留一会儿安静。';}catch(e){el('roomStatus').textContent='声音暂时无法开启，请稍后再试。';console.warn(e);}finally{b.disabled=false;}};
el('narrationButton').onclick=async()=>{if(audio.getState().narrating||audio.getState().narrationLoading){audio.stopNarration();return;}try{world.action('voiceSource');await audio.narrate(page);}catch(e){el('roomStatus').textContent='这一页暂时无法朗读，请再试一次。';console.warn('Reading narration unavailable',e);}};
el('readingVolume').oninput=e=>audio.setOptions({volume:Number(e.target.value)/100});el('aboutButton').onclick=()=>el('about').showModal();el('closeAbout').onclick=()=>el('about').close();
for(const button of document.querySelectorAll('[data-walk]')){button.addEventListener('pointerdown',e=>{e.preventDefault();openPassage(false,false);button.setPointerCapture(e.pointerId);world.setTouch(...button.dataset.walk.split(',').map(Number));});for(const event of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(event,()=>world.setTouch(0,0));}
document.addEventListener('keydown',e=>{if(e.key==='Escape')openPassage(false);if(['b','c','n'].includes(e.key.toLowerCase())&&!e.repeat&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();if(e.key.toLowerCase()==='b'){openPassage(false,false);world.action('holdBook');}if(e.key.toLowerCase()==='c')world.action('tea');if(e.key.toLowerCase()==='n')el('narrationButton').click();}if(e.key.toLowerCase()==='v'&&!e.repeat&&!/INPUT|TEXTAREA|SELECT/.test(e.target.tagName)&&!document.querySelector('dialog[open]')){e.preventDefault();world.action('camera');}});
window.addEventListener('pagehide',event=>{if(!event.persisted){world.dispose();audio.dispose();}});paintPage();paintNavigation(navigation);

if(new URLSearchParams(location.search).get('qa')==='1')import('./reading-qa.js').then(({startReadingQA})=>startReadingQA(canvas,audio));
if(new URLSearchParams(location.search).get('qa')==='walk')import('./reading-review.js').then(({startReadingReview})=>startReadingReview({canvas,world,audio}));
if(new URLSearchParams(location.search).get('qa')==='acceptance')globalThis.__readingAcceptance={world,audio};
