import test from 'node:test';
import assert from 'node:assert/strict';
import { EFFECTS, makeRecipe } from '../effects.js';
import { EXTENSION_AXES, expansionPrompt, expansionText } from '../extension-plans.js';
import { buildExpansionBundle } from '../extension-view.js';

test('all 20 effects retain four complete expansion directions', () => {
  assert.equal(EFFECTS.length, 20);
  const knownEffects = new Set(EFFECTS.map(effect => effect.id));
  const expectedAxes = EXTENSION_AXES.map(axis => axis.id);
  const plans = EFFECTS.flatMap(effect => effect.extensions);
  assert.equal(plans.length, 80);
  assert.equal(new Set(plans.map(plan => plan.id)).size, 80);
  assert.equal(new Set(plans.map(plan => plan.title)).size, 80);
  assert.equal(new Set(plans.map(plan => plan.target)).size, 80);
  for (const effect of EFFECTS) {
    assert.deepEqual(effect.extensions.map(plan => plan.axis), expectedAxes, effect.id);
    for (const plan of effect.extensions) {
      for (const key of ['title', 'target', 'shot', 'deliverable', 'avoid', 'status']) assert.equal(typeof plan[key], 'string', `${plan.id}.${key}`);
      assert.notEqual(plan.target, effect.goal, `${plan.id} needs a new outcome`);
      assert.equal(plan.steps.length, 3, plan.id);
      assert.equal(plan.criteria.length, 3, plan.id);
      assert(plan.steps.every(step => step.trim()));
      assert(plan.criteria.every(criterion => criterion.trim()));
      assert.match(plan.status, /待制作/);
      for (const id of plan.partners || []) {
        assert(knownEffects.has(id), `${plan.id} references unknown ${id}`);
        assert.notEqual(id, effect.id);
      }
    }
  }
});

test('40 motion briefs include three continuous planned stages', () => {
  const plans = EFFECTS.flatMap(effect => effect.extensions);
  const motion = plans.filter(plan => ['motion', 'combine'].includes(plan.axis));
  assert.equal(motion.length, 40);
  for (const plan of motion) assert.equal(plan.beats.length, 3, plan.id);
  for (const plan of plans.filter(plan => ['detail', 'transfer'].includes(plan.axis))) assert.equal(plan.beats, undefined, plan.id);
});

test('copy and export retain each concrete target, route and acceptance criteria', () => {
  for (const effect of EFFECTS) {
    const recipe = makeRecipe(effect, effect.controls);
    assert.equal(recipe.extensions.length, 4);
    for (const plan of recipe.extensions) assert(plan.prompt.includes(plan.target));
    for (const plan of effect.extensions) {
      const prompt = expansionPrompt(effect, plan), text = expansionText(effect, plan);
      assert(prompt.includes(plan.target)); assert(prompt.includes(plan.shot));
      assert(text.includes(effect.source)); assert(text.includes(plan.title));
      for (const step of plan.steps) assert(text.includes(step));
      for (const criterion of plan.criteria) assert(prompt.includes(criterion));
      if (plan.beats) for (const beat of plan.beats) assert(prompt.includes(beat));
    }
  }
  const bundle = JSON.parse(JSON.stringify(buildExpansionBundle(EFFECTS)));
  assert.equal(bundle.effectCount, 20); assert.equal(bundle.planCount, 80);
  assert.equal(bundle.effects.flatMap(effect => effect.plans).length, 80);
  assert.match(bundle.status, /尚未生成/);
});
