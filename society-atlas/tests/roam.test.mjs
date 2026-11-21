import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const files=['data','ai-data','ai-reading','journey-data','ai-expansion','computing-data','education-data','llm-articles','llm-foundations','agent-articles','agent-foundations','rag-articles','rag-foundations','context-articles','context-foundations','journey-catalog','roam-data','roam','navigation-data','navigation','llm-data','llm','agent-data','agent','rag-data','rag','context-data','context','assistant-case','assistant-eval-data','assistant-eval','assistant-ops-data','assistant-ops','assistant-project','industry-data','explore','journey'];
function loadSite({stored={},failWrites=false}={}) {
  const writes=[],handlers={},status={textContent:''};
  const sandbox={
    window:{}, URLSearchParams,
    document:{addEventListener(type,handler){(handlers[type] ||= []).push(handler);},getElementById(){return status;}},
    FormData:class {constructor(form){this.values=form.values;}get(key){return this.values[key] ?? null;}},
    localStorage:{getItem(key){return stored[key] ?? null;},setItem(key,value){if(failWrites)throw new Error('Storage unavailable');writes.push({key,value});stored[key]=value;}}
  };
  for(const name of files)vm.runInNewContext(fs.readFileSync(new URL(`../dist/${name}.js`,import.meta.url),'utf8'),sandbox);
  return {...sandbox.window,writes,handlers,status};
}
const site=loadSite(), {ROAM:roam,ROAM_DATA:data,JOURNEY:journey}=site;
const stepIds=['overview','generation','sources','evidence','return'];

test('漫游有独立起点和四个有效站点，未知路径不能伪装成有效返回入口',()=>{
  assert.equal(journey.route('#roam/ai-errors').kind,'roam');
  assert.equal(roam.resolve(journey.route('#roam/ai-errors')).step.id,'overview');
  for(const id of stepIds){
    assert.equal(roam.hasStep(id),true,id);
    const hash=`#roam/ai-errors/${id}`,r=journey.route(hash);
    assert.equal(r.view,'journey',hash);
    assert.equal(r.kind,'roam',hash);
    assert.equal(roam.resolve(r).step.id,id,hash);
    assert.equal(journey.safeBack(hash,'#home'),hash);
  }
  for(const id of [undefined,'','unknown','constructor','toString','__proto__'])assert.equal(roam.hasStep(id),false,String(id));
  for(const hash of ['#roam','#roam/unknown','#roam/ai-errors/unknown','#roam/ai-errors/constructor','#roam/ai-errors/generation/extra']){
    assert.equal(journey.route(hash).kind,'missing',hash);
    assert.equal(journey.safeBack(hash,'#home'),'#home',hash);
  }
});

test('同一虚构案例贯穿生成、来源、判断和回看，深入阅读及来源都有实际目标',()=>{
  assert.deepEqual(Array.from(data.steps,s=>s.id),stepIds.slice(1));
  assert.deepEqual(Array.from(data.steps,s=>s.domain),['ai','information','education','ai']);
  assert.match(data.case.note,/虚构/);
  assert.match(data.case.answer,/18:00/);
  assert.match(data.answer.text,/16:00/);
  assert.match(data.answer.boundary,/原因|哪一环/);
  for(const step of data.steps){
    assert.ok(site.JOURNEY_CATALOG.domains[step.domain],step.id);
    assert.ok(step.sections.length>=2,step.id);
    assert.ok(step.visual.steps.length>=3,step.id);
    assert.ok(step.bridge.title && step.bridge.text && step.takeaway,step.id);
    assert.equal(journey.route(step.deepDive.href).kind,'article',step.deepDive.href);
    assert.ok(step.sources.length>0,step.id);
    for(const source of step.sources){
      assert.ok(source.title,step.id);
      assert.equal(new URL(source.url).protocol,'https:',source.url);
    }
  }
  const current=data.materials.find(m=>m.id==='current');
  assert.equal(current.supports.applies,true);
  assert.equal(current.supports.time,'16:00');
  for(const id of ['old','snippet']){
    const m=data.materials.find(x=>x.id===id);
    assert.equal(m.supports.applies,false,id);
    assert.ok(m.issuer && m.date && m.scope && m.excerpt && m.limit,id);
  }
});

test('图解选择随前后站和路线目录传递，任一站刷新都能从URL恢复',()=>{
  const back='#search?q='+encodeURIComponent('AI 为什么会答错');
  let r=journey.route('#roam/ai-errors/generation?material=current&evidence=judgment&answer=cited&back='+encodeURIComponent(back));
  for(const step of ['sources','evidence','return','evidence','sources','generation','overview']){
    const hash=roam.link(step,r.q);
    r=journey.route(hash);
    const state=roam.resolve(r);
    assert.equal(state.step.id,step);
    assert.equal(state.material.id,'current');
    assert.equal(state.evidence.id,'judgment');
    assert.equal(state.answerView,'cited');
    assert.equal(r.q.get('back'),back);
    const fresh=loadSite();
    const restored=fresh.ROAM.resolve(fresh.JOURNEY.route(hash));
    assert.equal(restored.step.id,step);
    assert.equal(restored.material.id,'current');
    assert.equal(restored.evidence.id,'judgment');
    assert.equal(restored.answerView,'cited');
  }
});

test('无效图解选择采用默认状态，未知参数和外部返回地址不会传播',()=>{
  const r=journey.route('#roam/ai-errors/sources?material=constructor&evidence=unknown&answer=unknown&score=100&mastered=true&back='+encodeURIComponent('https://example.com/'));
  const state=roam.resolve(r);
  assert.equal(state.material.id,'old');
  assert.equal(state.evidence.id,'observation');
  assert.equal(state.answerView,'plain');
  const target=journey.route(roam.link('evidence',r));
  assert.equal(target.q.has('score'),false);
  assert.equal(target.q.has('mastered'),false);
  assert.equal(target.q.has('back'),false);
  assert.ok(Array.from(target.q.keys()).every(key=>['material','evidence','answer','back'].includes(key)));
  assert.equal(roam.resolve(target).material.id,'old');
});

test('展开文章或领域历史后返回时仍是原站点及原图解选择',()=>{
  for(const step of data.steps){
    const hash=`#roam/ai-errors/${step.id}?material=snippet&evidence=explanation&answer=cited`;
    for(const destination of [step.deepDive.href,`#domain/${step.domain}/history`]){
      const sideTrip=journey.route(journey.withBack(destination,hash));
      assert.notEqual(sideTrip.kind,'missing',destination);
      const back=journey.safeBack(sideTrip.q.get('back'),'#home');
      assert.equal(back,hash);
      const restored=roam.resolve(journey.route(back));
      assert.equal(restored.step.id,step.id);
      assert.equal(restored.material.id,'snippet');
      assert.equal(restored.evidence.id,'explanation');
      assert.equal(restored.answerView,'cited');
    }
  }
});

test('每站生成的站内导航可解析，浏览或切换路线不会写入掌握记录',()=>{
  const isolated=loadSite();
  for(const step of stepIds){
    const r=isolated.JOURNEY.route(`#roam/ai-errors/${step}?material=current&evidence=judgment&answer=cited`);
    const html=isolated.ROAM.render(r)+isolated.ROAM.rail(r);
    const internalLinks=Array.from(html.matchAll(/href="(#[^"]+)"/g),m=>m[1].replaceAll('&amp;','&'));
    assert.ok(internalLinks.length>=4,step);
    for(const href of internalLinks){
      const destination=isolated.JOURNEY.route(href);
      assert.ok(destination,href);
      assert.notEqual(destination.kind,'missing',href);
    }
  }
  assert.deepEqual(isolated.writes,[]);
  for(const hash of ['#topic/source-validity','#area/system','#guide/0','#records','#questions'])assert.equal(isolated.JOURNEY.route(hash),null,hash);
});

test('理解记录仅在主动保存后写入独立存储，刷新可恢复且不覆盖旧AI记录',()=>{
  const oldRecord='{"existing":"private record remains unchanged"}';
  const stored={'ai-atlas.v1':oldRecord};
  const isolated=loadSite({stored});
  const event={target:{id:'roam-note-form',values:{explanation:'先查版本，再对照普通周日的条件。',question:'怎样知道模型实际读到了什么？'}},preventDefault(){}};
  for(const handler of isolated.handlers.submit)handler(event);
  assert.deepEqual(isolated.writes.map(x=>x.key),['jianquan.roam.ai-errors.v1']);
  assert.equal(stored['ai-atlas.v1'],oldRecord);
  const saved=JSON.parse(stored['jianquan.roam.ai-errors.v1']);
  assert.equal(saved.explanation,event.target.values.explanation);
  assert.equal(saved.question,event.target.values.question);
  assert.ok(saved.updatedAt);
  assert.equal(Object.hasOwn(saved,'mastered'),false);
  const fresh=loadSite({stored});
  const html=fresh.ROAM.render(fresh.JOURNEY.route('#roam/ai-errors/return'));
  assert.ok(html.includes(saved.explanation));
  assert.ok(html.includes(saved.question));
  assert.deepEqual(fresh.writes,[]);
});

test('空理解记录不写入，存储失败显示反馈并在当前页面保留输入',()=>{
  const empty=loadSite();
  for(const handler of empty.handlers.submit)handler({target:{id:'roam-note-form',values:{explanation:'  ',question:''}},preventDefault(){}});
  assert.deepEqual(empty.writes,[]);
  assert.ok(empty.status.textContent.length>0);
  const failed=loadSite({failWrites:true});
  const values={explanation:'<我的解释>仍需核对日期。',question:'还缺哪份原始记录？'};
  for(const handler of failed.handlers.submit)handler({target:{id:'roam-note-form',values},preventDefault(){}});
  assert.deepEqual(failed.writes,[]);
  assert.match(failed.status.textContent,/未能|失败/);
  const html=failed.ROAM.render(failed.JOURNEY.route('#roam/ai-errors/return'));
  assert.ok(html.includes('&lt;我的解释&gt;仍需核对日期。'));
  assert.ok(html.includes(values.question));
});
