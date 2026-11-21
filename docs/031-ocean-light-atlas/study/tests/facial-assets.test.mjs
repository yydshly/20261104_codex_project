import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
const folder=new URL('../glasshouse/assets/personal-guide/',import.meta.url);
test('facial delivery keeps own identity and contains actual blink and speech morph targets',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest-facial.json',folder),'utf8')),bytes=await readFile(new URL(manifest.file,folder));
 assert.equal(createHash('sha256').update(bytes).digest('hex'),manifest.sha256);assert.match(manifest.facial.identity,/Own 0597/);assert.match(manifest.facial.identity,/no Microsoft/);
 const length=bytes.readUInt32LE(12),gltf=JSON.parse(bytes.subarray(20,20+length));assert.equal(gltf.meshes.length,1);assert.equal(gltf.skins[0].joints.length,80);
 const names=gltf.meshes[0].extras.targetNames;assert.equal(names.length,21);for(const name of ['eyeBlinkLeft','eyeBlinkRight','eyeLookLeft','eyeLookRight','jawOpen','viseme_PP','viseme_aa','viseme_O','viseme_U'])assert(names.includes(name));
 for(const p of gltf.meshes[0].primitives)assert.equal(p.targets.length,21);
 assert(gltf.materials.some(m=>m.name==='Original head albedo'));assert(gltf.materials.some(m=>m.name==='Fine bronze spectacles'));assert(!gltf.materials.some(m=>/m024_head|m024_opacity|Continuous adult facial skin/.test(m.name)));
 const original=await readFile(new URL('../user-model-0597/0597b54ff20068bcd556b1e005aed56d.glb',folder));assert.equal(createHash('sha256').update(original).digest('hex'),'bde0c12688b20e7bf197fea13122186a16f9bb0c15484eee28e0a66fd63b709e');
});
test('Chinese sample timing matches the real WAV and only uses available mouth shapes',async()=>{
 const manifest=JSON.parse(await readFile(new URL('manifest-facial.json',folder),'utf8')),data=JSON.parse(await readFile(new URL(manifest.facial.speech,folder),'utf8')),wav=await readFile(new URL('speech/'+data.audio,folder));
 assert.equal(createHash('sha256').update(wav).digest('hex'),data.sha256);assert.equal(wav.toString('ascii',0,4),'RIFF');assert.equal(wav.toString('ascii',8,12),'WAVE');
 let format,audioBytes;for(let at=12;at+8<=wav.length;){const name=wav.toString('ascii',at,at+4),size=wav.readUInt32LE(at+4);if(name==='fmt ')format={channels:wav.readUInt16LE(at+10),sampleRate:wav.readUInt32LE(at+12),bits:wav.readUInt16LE(at+22)};if(name==='data')audioBytes=size;at+=8+size+(size%2);}
 assert.equal(format.sampleRate,data.sampleRate);assert.equal(format.channels,data.channels);assert.equal(format.bits,data.bits);assert(Math.abs(audioBytes/(format.sampleRate*format.channels*format.bits/8)-data.duration)<.0001);
 assert(data.duration>5&&data.duration<20);assert(data.visemeCues.length>30);let previous=-1;for(const cue of data.visemeCues){assert(cue.time>=previous);assert(cue.end>cue.time);assert(cue.end<=data.duration);assert(manifest.facial.shapes.includes(cue.shape));previous=cue.time;}
 assert.equal(data.nativeVisemeEvents,0);assert.match(data.timingMethod,/approximate/);assert(data.envelope.some(v=>v<.004));assert(data.envelope.some(v=>v>.1));
});
