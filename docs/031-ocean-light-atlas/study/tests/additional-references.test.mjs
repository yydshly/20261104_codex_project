import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {EFFECTS,makeRecipe} from '../effects.js';
import {ADDITIONAL_SOURCE,ADDITIONAL_REFERENCES,referencesForEffect} from '../additional-references.js';

test('the additional source preserves twenty distinct references and the original twenty/eighty', async()=>{
  assert.equal(EFFECTS.length,20);assert.equal(EFFECTS.flatMap(effect=>effect.extensions).length,80);
  assert.equal(ADDITIONAL_REFERENCES.length,20);assert.equal(new Set(ADDITIONAL_REFERENCES.map(item=>item.id)).size,20);
  assert.match(ADDITIONAL_SOURCE.creatorStatus,/未核实/);
  const known=new Set(EFFECTS.map(effect=>effect.id));
  const base=new URL('../assets/reference/naturehealyou-2121228035932188844/',import.meta.url);
  const manifest=JSON.parse(await readFile(new URL('manifest.json',base),'utf8'));
  for(const[itemIndex,item]of ADDITIONAL_REFERENCES.entries()){
    assert.equal(item.number,String(itemIndex+1).padStart(2,'0'));
    for(const field of ['observed','contribution','goal','route','firstTrial'])assert(item[field]?.trim(),`${item.id}.${field}`);
    assert.equal(item.criteria.length,3);assert(item.criteria.every(value=>value.trim()));
    assert(item.relatedIds.length>0);assert(item.relatedIds.every(id=>known.has(id)));
    assert.match(item.status,/待验证/);
    const asset=manifest.items[itemIndex],bytes=await readFile(new URL(asset.file,base));
    assert.equal(createHash('sha256').update(bytes).digest('hex'),asset.sha256);
  }
});

test('recipes carry only related supplemental references without replacing their primary source',()=>{
  for(const effect of EFFECTS){
    const recipe=makeRecipe(effect,effect.controls);
    assert.equal(recipe.reference,effect.source);
    assert.deepEqual(recipe.additionalReferences.map(item=>item.id),referencesForEffect(effect.id).map(item=>item.id));
    assert.equal(recipe.extensions.length,4);
  }
});
