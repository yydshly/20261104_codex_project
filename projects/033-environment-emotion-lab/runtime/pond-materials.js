import * as THREE from './vendor/three.module.js';

/** Verified Poly Haven CC0 scans, vendored locally. See assets/materials/sources.json. */
export function createPondMaterials() {
  const textures=new Set(), cache=new Map(), errors=[],pending=[];
  let disposed=false;
  const loader=typeof document==='undefined'?null:new THREE.TextureLoader();
  function texture(asset,channel,repeat,rotation=0) {
    if(!loader)return null;
    const key=[asset,channel,...repeat,rotation].join(':');
    if(cache.has(key))return cache.get(key);
    let finish;pending.push(new Promise(resolve=>{finish=resolve;}));
    const map=loader.load(new URL(`./assets/materials/${asset}-${channel}.jpg`,import.meta.url).href,
      loaded=>{if(disposed)loaded.dispose();finish();},undefined,error=>{
        const message=`PBR texture failed: ${asset}/${channel}`;errors.push(message);console.warn(message,error);
        finish();if(disposed)return;
        const fallback=document.createElement('canvas');fallback.width=fallback.height=1;
        const context=fallback.getContext('2d');context.fillStyle=channel==='normal'?'rgb(128,128,255)':'white';context.fillRect(0,0,1,1);
        map.image=fallback;map.needsUpdate=true;
      });
    map.colorSpace=channel==='color'?THREE.SRGBColorSpace:THREE.NoColorSpace;
    map.wrapS=map.wrapT=THREE.RepeatWrapping;
    map.repeat.set(...repeat);map.rotation=rotation;map.anisotropy=8;
    textures.add(map);cache.set(key,map);return map;
  }
  function maps(asset,repeat=[1,1],rotation=0,normalStrength=.45) {
    return {map:texture(asset,'color',repeat,rotation),normalMap:texture(asset,'normal',repeat,rotation),roughnessMap:texture(asset,'roughness',repeat,rotation),normalScale:new THREE.Vector2(normalStrength,normalStrength)};
  }
  return {maps,errors,get ready(){return Promise.all(pending).then(()=>{if(errors.length)throw new Error(errors.join('; '));});},dispose(){disposed=true;textures.forEach(t=>t.dispose());textures.clear();cache.clear();}};
}
