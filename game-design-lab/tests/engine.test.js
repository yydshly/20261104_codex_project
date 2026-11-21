import test from 'node:test';
import assert from 'node:assert/strict';
import { makeBrief,briefMarkdown } from '../engine.js';
test('design workbench connects the selected references to actual prototype tasks',()=>{
  const brief=makeBrief({title:'林间旅馆',primary:'valley',secondary:'dungeon',intent:'放松经营'});
  assert.match(brief.tension,/永久损失/);assert.match(brief.pace,/失误可恢复/);assert.match(brief.tasks[2],/补给/);
  assert.match(briefMarkdown(brief),/# 林间旅馆/);assert.match(briefMarkdown(brief),/体验节奏/);
});
test('workbench invalid choices have safe defaults and same-game choices avoid fake combinations',()=>{
  const invalid=makeBrief({primary:'missing',secondary:'missing',intent:'missing'});assert.equal(invalid.primary,'杀戮尖塔 1');assert.equal(invalid.intent,'策略推演');
  const single=makeBrief({primary:'factory',secondary:'factory'});assert.equal(single.secondary,'暂不叠加');assert.match(single.tension,/同一款/);
});
