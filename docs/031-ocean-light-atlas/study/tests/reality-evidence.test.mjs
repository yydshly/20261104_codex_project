import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { EFFECTS,makeRecipe } from '../effects.js';
import { REAL_SEA_SOURCES } from '../reality-video-sources.js';
import { REALITY_COMPARISONS, REALITY_PRINCIPLES } from '../reality-comparisons.js';

test('all twenty effects retain evidence, three distinct judgments and explicit limitations',()=>{
  assert.equal(REALITY_COMPARISONS.length,20);
  const sourceIds=new Set(REAL_SEA_SOURCES.map(source=>source.id));
  const principleIds=new Set(REALITY_PRINCIPLES.map(source=>source.id));
  for(const [index,effect] of EFFECTS.entries()){
    const study=REALITY_COMPARISONS[index];
    assert.equal(study.effectId,effect.id); assert.equal(study.number,effect.number);
    assert(study.sourceIds.length>0); assert(study.sourceIds.every(id=>sourceIds.has(id)));
    assert(study.principleIds.every(id=>principleIds.has(id)));
    for(const type of ['natural','camera','artistic']){
      assert(study[type].status.trim());assert(study[type].explanation.trim());
    }
    assert(study.observe && study.transfer && study.limits);
    assert.equal(study.acceptance.length,3);
    assert(study.implemented.length && study.remaining.length);
    assert.match(study.revisionStatus,/尚待|待/);
  }
  for(const id of ['round-bokeh','star-glitter','pink-dusk']){
    assert.match(REALITY_COMPARISONS.find(study=>study.effectId===id).limits,/未|不能|缺|不等/);
  }
});

test('local sea videos match institution download records and retain attribution and usage terms',async()=>{
  const records=JSON.parse(await readFile(new URL('../assets/reality/local-video-verification.json',import.meta.url),'utf8'));
  const locals=REAL_SEA_SOURCES.filter(source=>source.localFile);
  assert.equal(locals.length,5);assert.equal(REAL_SEA_SOURCES.length,8);
  for(const source of REAL_SEA_SOURCES){
    assert.match(source.sourceUrl,/^https:\/\/(etc\.usf\.edu|www\.nps\.gov)\//);
    for(const key of ['creator','publisher','location','capturedAt','license','provenance','processing','limitations'])assert(source[key]?.trim(),`${source.id}.${key}`);
    assert.equal(source.medium,'sea');
    assert(source.review?.method);
    if(!source.localFile) continue;
    assert.match(source.localFile,/^assets\/reality\/[a-z-]+\.mp4$/);
    assert.match(source.license,/非商业/); assert.match(source.license,/署名/);
    const record=records.find(record=>record.id===source.id);assert(record);
    const bytes=await readFile(new URL(`../${source.localFile}`,import.meta.url));
    assert.equal(bytes.length,record.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'),record.sha256);
    assert.equal(record.sourceUrl,source.sourceUrl);
    assert(record.duration>14 && record.duration<16);
  }
});

test('recipe exports distinguish current calibration from retained artistic goals and exclude video bytes',()=>{
  for(const effect of EFFECTS){
    const natural=makeRecipe(effect,effect.controls);
    const artistic=makeRecipe(effect,effect.controls,{realismProfile:'reference',lensEffects:true});
    assert.equal(natural.renderProfile,'calibrated');assert.equal(natural.lensEffects,false);
    assert.deepEqual(natural.acceptance,natural.realityComparison.acceptance);
    assert.deepEqual(artistic.acceptance,effect.criteria);
    assert.equal(artistic.lensEffects,true);
    assert(natural.realSeaSources.every(source=>!Object.hasOwn(source,'localFile')));
    assert.match(natural.provenance,/不属于本项目可商用或再分发/);
    assert.equal(natural.extensions.length,4);
  }
});
