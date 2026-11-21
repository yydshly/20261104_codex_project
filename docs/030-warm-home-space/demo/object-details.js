import * as THREE from 'three';
import {buildScreenReflection} from './screen-reflection.js';

let ceramicMaps;
function stonewareMaps(){
  if(ceramicMaps)return ceramicMaps;
  const color=document.createElement('canvas'),height=document.createElement('canvas');color.width=color.height=height.width=height.height=512;
  const c=color.getContext('2d'),h=height.getContext('2d'),pixels=c.createImageData(512,512),relief=h.createImageData(512,512);
  let seed=413;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  for(let y=0;y<512;y++)for(let x=0;x<512;x++){
    const i=(y*512+x)*4,n=random(),ring=Math.sin(y*.56+Math.sin(y*.07)*.5)*1.6,spot=n>.992?-34:0;
    const v=238+ring+(n-.5)*10+spot;
    pixels.data.set([v,v-2,v-5,255],i);const b=128+(n-.5)*34+ring*1.5;relief.data.set([b,b,b,255],i);
  }
  c.putImageData(pixels,0,0);h.putImageData(relief,0,0);
  const map=new THREE.CanvasTexture(color);map.colorSpace=THREE.SRGBColorSpace;const bump=new THREE.CanvasTexture(height);
  map.anisotropy=bump.anisotropy=8;ceramicMaps={map,bump};return ceramicMaps;
}

export function buildCeramicVase(parent,position,height=.375,radius=.17){
  const {map,bump}=stonewareMaps();
  const glaze=new THREE.MeshPhysicalMaterial({color:'#ad7955',map,roughness:.59,bumpMap:bump,bumpScale:.00065,clearcoat:.18,clearcoatRoughness:.42});
  // The continuous outer wall curls over a rounded lip, then returns down the
  // inside to a closed base. The mouth is genuinely hollow from above.
  const profile=[[0,0],[.48,0],[.56,.025],[.72,.07],[.93,.23],[1,.37],[.96,.49],[.81,.60],[.55,.70],[.39,.79],[.37,.91],[.43,.965],[.43,.992],[.40,1],[.35,.99],[.35,.965],[.33,.93],[.33,.80],[.49,.69],[.75,.58],[.90,.47],[.94,.37],[.88,.24],[.65,.10],[.45,.07],[0,.07]];
  const curve=new THREE.CatmullRomCurve3(profile.map(([r,y])=>new THREE.Vector3(r*radius,y*height,0)),false,'centripetal');
  const points=curve.getPoints(190).map(p=>new THREE.Vector2(Math.max(0,p.x),Math.max(0,p.y)));
  const vase=new THREE.Mesh(new THREE.LatheGeometry(points,128),glaze);vase.position.set(...position);vase.castShadow=true;vase.receiveShadow=true;vase.name='hollow-glazed-stoneware';parent.add(vase);
  return vase;
}

export function buildTelevision(scene,materials,helpers,loader){
  const {box,cyl}=helpers,root=new THREE.Group();root.name='thin-glass-television';root.position.set(2.71,1.36,-.65);root.rotation.y=-Math.PI/2;scene.add(root);
  const graphite=new THREE.MeshStandardMaterial({color:'#111315',roughness:.39,metalness:.55});
  box(1.774,1.010,.025,[0,0,0],graphite,root,.010);
  box(1.17,.57,.035,[0,-.13,-.023],graphite,root,.015);
  box(.35,.24,.075,[0,-.07,-.065],graphite,root,.008);
  const glass=new THREE.MeshPhysicalMaterial({color:'#010203',roughness:.145,metalness:.05,clearcoat:1,clearcoatRoughness:.16,envMapIntensity:.48});
  let panel=box(1.739,.974,.006,[0,.003,.017],glass,root,.003);
  // A lower chin, tiny sensor and standby LED replace painted reflection bars.
  box(1.744,.013,.009,[0,-.493,.017],graphite,root,.003);
  const ledMat=new THREE.MeshBasicMaterial({color:'#9b352c'}),led=cyl(.0019,.0019,.002,[.73,-.492,.024],ledMat,root,12);led.rotation.x=Math.PI/2;
  const image=loader.load('assets/v2/courtyard.png');image.colorSpace=THREE.SRGBColorSpace;image.flipY=false;
  const picture=new THREE.MeshBasicMaterial({map:image,color:'#c6c6c6',toneMapped:false});
  let powered=false,reflection;
  const interactive=[panel];
  return {root,interactive,
    installModel(model){
      for(const child of root.children)child.visible=false;
      root.position.x=2.68;model.scale.set(2.44,2.44,.55);model.position.set(0,-.2807*2.44,.025);
      model.traverse(o=>{if(o.isMesh){o.castShadow=true;o.receiveShadow=true;if(o.name==='Feet')o.visible=false;
        if(o.name==='Screen'){panel=o;o.material=powered?picture:glass;}
        if(o.name==='Status lamp window')o.material=ledMat;
      }});
      root.add(model);interactive.splice(0,interactive.length,panel);
      reflection=buildScreenReflection(root);reflection.visible=!powered;
    },
    toggle(){powered=!powered;panel.material=powered?picture:glass;if(reflection)reflection.visible=!powered;ledMat.color.set(powered?'#353c3c':'#9b352c');return powered;},
  };
}
