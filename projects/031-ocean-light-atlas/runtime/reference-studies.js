import { ADDITIONAL_SOURCE, ADDITIONAL_REFERENCES } from './additional-references.js';

const $ = id => document.getElementById(id);
const text = (tag, value, className) => { const element=document.createElement(tag);element.textContent=value;if(className)element.className=className;return element; };

export function mountReferenceStudies({effects,selectEffect,download}) {
  const section=$('additional-references');if(!section)return;
  const known=new Map(effects.map(effect=>[effect.id,effect]));
  let selected=ADDITIONAL_REFERENCES[0],relatedId=selected.relatedIds[0],group='全部';
  const cards=new Map();
  function showFull(which){
    const item=which==='new'?selected:known.get(relatedId);
    $('study-dialog-image').src=which==='new'?item.image:item.reference;
    $('study-dialog-image').alt=which==='new'?`补充参考 ${item.number}：${item.title}`:`基础参考 ${item.number}：${item.name}`;
    $('study-dialog-title').textContent=which==='new'?`补充 ${item.number} · ${item.title}`:`基础 ${item.number} · ${item.name}`;
    $('study-dialog-source').href=item.source;
    $('study-dialog-note').textContent=which==='new'?'按完整比例查看。发布账号为 @naturehealyou，原作者、拍摄与处理过程尚未核实。':'PEBIT 原帖参考，保留基础效果的原始编号。';
    $('study-reference-dialog').showModal();
  }
  function render(){
    const base=known.get(relatedId);
    $('study-number').textContent=`补充 ${selected.number} / 20`;
    $('study-title').textContent=selected.title;
    $('study-status').textContent=selected.status;
    $('study-observed').textContent=selected.observed;
    $('study-contribution').textContent=selected.contribution;
    $('study-goal').textContent=selected.goal;
    $('study-route').textContent=selected.route;
    $('study-first-trial').textContent=selected.firstTrial;
    $('study-criteria').replaceChildren(...selected.criteria.map(criterion=>text('li',criterion)));
    $('study-new-image').src=selected.image;$('study-new-image').alt=`新增视觉参考 ${selected.number}：${selected.title}`;
    $('study-new-caption').textContent=`补充 ${selected.number} · @naturehealyou 发布`;
    $('study-source-link').href=selected.source;
    $('study-base-image').src=base.reference;$('study-base-image').alt=`相关基础效果 ${base.number}：${base.name}`;
    $('study-base-caption').textContent=`基础 ${base.number} · ${base.name}`;
    $('study-base-goal').textContent=base.goal;
    $('study-compare-select').replaceChildren(...selected.relatedIds.map(id=>{
      const effect=known.get(id),option=document.createElement('option');option.value=id;option.textContent=`${effect.number} ${effect.name}`;return option;
    }));$('study-compare-select').value=relatedId;
    $('study-use-effect').textContent=`进入 ${base.number}「${base.name}」制作区 ↗`;
    for(const[id,card]of cards)card.setAttribute('aria-pressed',String(id===selected.id));
    section.dataset.reference=selected.id;section.dataset.relatedEffect=relatedId;
  }
  function select(item){
    selected=item;relatedId=item.relatedIds[0];render();
    const url=new URL(location.href);url.searchParams.set('ref',item.id);history.replaceState(null,'',url);
  }
  for(const item of ADDITIONAL_REFERENCES){
    const button=document.createElement('button');button.type='button';button.className='study-card';button.dataset.reference=item.id;button.setAttribute('aria-label',`补充参考 ${item.number}：${item.title}`);
    const image=document.createElement('img');image.src=item.image;image.alt='';image.loading='lazy';image.width=160;image.height=240;
    button.append(image,text('span',item.number,'study-card-number'),text('strong',item.title));button.addEventListener('click',()=>select(item));cards.set(item.id,button);$('study-gallery').append(button);
  }
  for(const label of ['全部',...new Set(ADDITIONAL_REFERENCES.map(item=>item.group))]){
    const button=text('button',label);button.type='button';button.setAttribute('aria-pressed',String(label===group));
    button.addEventListener('click',()=>{
      group=label;let count=0;
      for(const item of ADDITIONAL_REFERENCES){const visible=group==='全部'||group===item.group;cards.get(item.id).hidden=!visible;if(visible)count++;}
      [...$('study-filters').children].forEach(child=>child.setAttribute('aria-pressed',String(child===button)));
      $('study-visible-count').textContent=`${count} / 20 张补充参考`;
    });$('study-filters').append(button);
  }
  $('study-compare-select').addEventListener('change',event=>{relatedId=event.target.value;render();});
  $('study-use-effect').addEventListener('click',()=>selectEffect(relatedId,true));
  $('study-enlarge-new').addEventListener('click',()=>showFull('new'));
  $('study-enlarge-base').addEventListener('click',()=>showFull('base'));
  $('study-dialog-close').addEventListener('click',()=>$('study-reference-dialog').close());
  $('study-download').addEventListener('click',()=>download(new Blob([JSON.stringify({source:ADDITIONAL_SOURCE,role:'补充视觉参考与制作建议，未制作对应成图',references:ADDITIONAL_REFERENCES},null,2)],{type:'application/json;charset=utf-8'}),'ocean-additional-references-20.json'));
  const query=new URLSearchParams(location.search).get('ref'),initial=ADDITIONAL_REFERENCES.find(item=>item.id===query);
  if(initial){selected=initial;relatedId=initial.relatedIds[0];}
  render();section.dataset.ready='true';
}
