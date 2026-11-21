import test from 'node:test';
import assert from 'node:assert/strict';
import {prewarmSceneShaders} from './shader-warmup.js';

test('shader warmup restores the render target and cutout settings even when compilation fails',async()=>{
  const material={alphaTest:.42,alphaToCoverage:true},original={name:'original'},temporary={name:'postprocess'};
  let current=original,face=3,mip=1,calls=0;
  const renderer={getRenderTarget:()=>current,getActiveCubeFace:()=>face,getActiveMipmapLevel:()=>mip,getContext:()=>({isContextLost:()=>false}),setRenderTarget(t,f=0,m=0){current=t;face=f;mip=m;},async compileAsync(){assert.equal(current,temporary);calls++;if(calls===2)throw Error('GPU compile failed');}};
  const scene={traverse:fn=>fn({material})};
  await assert.rejects(prewarmSceneShaders(renderer,[scene],{},temporary),/GPU compile failed/);
  assert.equal(current,original);assert.equal(face,3);assert.equal(mip,1);assert.equal(material.alphaToCoverage,true);
});
