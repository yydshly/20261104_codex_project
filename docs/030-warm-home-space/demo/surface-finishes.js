import * as THREE from 'three';

export function mapOakGeometry(source,position=[0,0,0]){
  const geometry=source.clone();geometry.computeBoundingBox();
  const p=geometry.attributes.position,n=geometry.attributes.normal,uv=geometry.attributes.uv;
  const size=geometry.boundingBox.getSize(new THREE.Vector3());
  const round=source.type==='CylinderGeometry'||source.type==='LatheGeometry';
  const radius=Math.max(size.x,size.z)*.5;
  const seed=position[0]*1.73+position[1]*2.31+position[2]*.93;
  const offsetU=Math.sin(seed*4.17)*.37,offsetV=Math.cos(seed*2.91)*.43;
  for(let i=0;i<p.count;i++){
    const x=p.getX(i),y=p.getY(i),z=p.getZ(i);let across,along;
    if(Math.abs(n.getY(i))>.65){across=z;along=x;}
    else if(round){across=Math.atan2(x,z)*radius;along=y;}
    else if(Math.abs(n.getX(i))>Math.abs(n.getZ(i))){
      if(size.y>=size.z){across=z;along=y;}else{across=y;along=z;}
    }else if(size.x>=size.y){across=y;along=x;}
    else{across=x;along=y;}
    // Grain is long along the board, with a continuous cylindrical side map.
    uv.setXY(i,across*.95+offsetU,along*.45+offsetV);
  }
  return geometry;
}

export function tabletopGeometry(radius,height){
  const bevel=Math.min(.009,height*.20),half=height*.5,points=[new THREE.Vector2(0,-half)];
  for(let i=0;i<=6;i++){const a=-Math.PI*.5+i/6*Math.PI*.5;points.push(new THREE.Vector2(radius-bevel+Math.cos(a)*bevel,-half+bevel+Math.sin(a)*bevel));}
  for(let i=0;i<=6;i++){const a=i/6*Math.PI*.5;points.push(new THREE.Vector2(radius-bevel+Math.cos(a)*bevel,half-bevel+Math.sin(a)*bevel));}
  points.push(new THREE.Vector2(0,half));return new THREE.LatheGeometry(points,96);
}

export function linenWeave(){
  const size=256,color=new Uint8Array(size*size*4),height=new Uint8Array(size*size*4);
  let seed=2247;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};
  const slub=Array.from({length:64},()=>rand()>.87?1.35:1);
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){
    const i=(y*size+x)*4,warp=Math.sin(x*Math.PI/2)*slub[Math.floor(x/4)],weft=Math.cos(y*Math.PI/2);
    const weave=(warp+weft)*8+(rand()-.5)*8;
    const v=238+weave*.23;
    color.set([v,v-1,v-3,255],i);const b=128+weave*2;height.set([b,b,b,255],i);
  }
  const map=new THREE.DataTexture(color,size,size),bump=new THREE.DataTexture(height,size,size);
  for(const texture of [map,bump]){texture.wrapS=texture.wrapT=THREE.RepeatWrapping;texture.generateMipmaps=true;texture.minFilter=THREE.LinearMipmapLinearFilter;texture.magFilter=THREE.LinearFilter;texture.anisotropy=8;texture.needsUpdate=true;}
  map.colorSpace=THREE.SRGBColorSpace;return{map,bump};
}

export function buildWoolRug(scene,loader,maxAnisotropy=8){
  const root=new THREE.Group();root.name='woven-wool-rug';scene.add(root);
  const tex=(suffix,color=false)=>{
    const t=loader.load('assets/v7/Carpet014/Carpet014_2K-JPG_'+suffix+'.jpg');
    t.wrapS=t.wrapT=THREE.RepeatWrapping;t.repeat.set(3.46/.60,3.51/.60);t.anisotropy=maxAnisotropy;
    if(color)t.colorSpace=THREE.SRGBColorSpace;return t;
  };
  const pile=new THREE.MeshPhysicalMaterial({color:'#d3c6ac',map:tex('Color',true),normalMap:tex('NormalGL'),normalScale:new THREE.Vector2(.65,.65),roughnessMap:tex('Roughness'),roughness:.98,displacementMap:tex('Displacement'),displacementScale:.004,displacementBias:0,sheen:.85,sheenRoughness:1,sheenColor:new THREE.Color('#f4e9d6'),specularIntensity:.25});
  const surface=new THREE.Mesh(new THREE.PlaneGeometry(3.46,3.51,256,256),pile);surface.rotation.x=-Math.PI/2;surface.position.set(-.05,.027,-.55);surface.receiveShadow=true;surface.castShadow=false;root.add(surface);
  const wool=linenWeave(),yarn=new THREE.MeshPhysicalMaterial({color:'#d3c6ac',roughness:1,sheen:.8,sheenRoughness:1,sheenColor:new THREE.Color('#efe4d0'),bumpMap:wool.bump,bumpScale:.0014});
  const corners=[[-1.78,-2.315],[1.68,-2.315],[1.68,1.215],[-1.78,1.215]],edgePoints=[];
  for(let side=0;side<4;side++){
    const a=corners[side],b=corners[(side+1)%4];
    for(let i=0;i<100;i++){const t=i/100;edgePoints.push(new THREE.Vector3(a[0]+(b[0]-a[0])*t,.029,a[1]+(b[1]-a[1])*t));}
  }
  const binding=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edgePoints,true),400,.0055,5,true),yarn);binding.receiveShadow=true;root.add(binding);
  document.querySelector('#scene').dataset.rug=JSON.stringify({type:'woven-pbr',source:'ambientCG Carpet014',top:.035});
  return root;
}
