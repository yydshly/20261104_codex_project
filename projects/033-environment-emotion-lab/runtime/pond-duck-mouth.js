import * as THREE from './vendor/three.module.js';

export const DUCK_QUACK_SECONDS=.59;
// Thirty-millisecond RMS bins from the actual local duck-quack.wav, normalized.
const QUACK_ENVELOPE=[.007,.010,.026,.171,.566,.717,.916,.976,1,.956,.995,.367,.347,.013,.009,.007,.012,.056,.028,.013];
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const smooth=(a,b,v)=>{const t=clamp((v-a)/(b-a),0,1);return t*t*(3-2*t);};
export const billSeam=x=>.294-(x-.30)*.40;
export function quackGapeAt(age){
 if(!Number.isFinite(age)||age<0||age>=DUCK_QUACK_SECONDS+.09)return 0;
 if(age>DUCK_QUACK_SECONDS)return .32*.18*(1-smooth(DUCK_QUACK_SECONDS,DUCK_QUACK_SECONDS+.09,age));
 const index=clamp(age/DUCK_QUACK_SECONDS*QUACK_ENVELOPE.length-.5,0,QUACK_ENVELOPE.length-1),i=Math.floor(index),fraction=index-i;
 const rms=QUACK_ENVELOPE[i]*(1-fraction)+QUACK_ENVELOPE[Math.min(i+1,QUACK_ENVELOPE.length-1)]*fraction;
 return .32*smooth(0,.055,age)*(.18+.82*Math.pow(rms,.55));
}

/** Clip only the authored lower bill. UVs/normals are interpolated at the seam. */
export function splitDuckBill(source){
 const positions=source.attributes.position,normals=source.attributes.normal,uv=source.attributes.uv,index=source.index;
 const planes=[v=>v.p[0]-.300,v=>v.p[1]-.235,v=>v.p[2]+.081,v=>.024-v.p[2],v=>billSeam(v.p[0])-v.p[1]];
 const body=[],jaw=[];
 function read(i){return{p:[positions.getX(i),positions.getY(i),positions.getZ(i)],n:normals?[normals.getX(i),normals.getY(i),normals.getZ(i)]:[0,1,0],uv:uv?[uv.getX(i),uv.getY(i)]:[0,0]};}
 function mix(a,b,t){const lerp=(x,y)=>x.map((v,i)=>v+(y[i]-v)*t);return{p:lerp(a.p,b.p),n:lerp(a.n,b.n),uv:lerp(a.uv,b.uv)};}
 function partition(poly,plane){const inside=[],outside=[];
  for(let i=0;i<poly.length;i++){const a=poly[i],b=poly[(i+1)%poly.length],da=plane(a),db=plane(b),ia=da>=0,ib=db>=0;(ia?inside:outside).push(a);if(ia!==ib){const edge=mix(a,b,da/(da-db));inside.push(edge);outside.push(edge);}}
  return[inside,outside];
 }
 function triangulate(poly,list){for(let i=1;i+1<poly.length;i++)list.push(poly[0],poly[i],poly[i+1]);}
 const count=index?index.count:positions.count;
 for(let i=0;i<count;i+=3){let poly=[0,1,2].map(k=>read(index?index.getX(i+k):i+k));
  for(const plane of planes){if(poly.length<3)break;const [inside,outside]=partition(poly,plane);triangulate(outside,body);poly=inside;}
  if(poly.length>=3)triangulate(poly,jaw);
 }
 function geometry(vertices,mouthWeight){const p=[],n=[],u=[],w=[];for(const v of vertices){p.push(...v.p);const normal=new THREE.Vector3(...v.n).normalize();n.push(...normal.toArray());u.push(...v.uv);w.push(smooth(.16,.265,v.p[1])*smooth(.055,.125,v.p[0]),mouthWeight);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(n,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(u,2));g.setAttribute('pondDuckWeights',new THREE.Float32BufferAttribute(w,2));g.setIndex(Array.from({length:vertices.length},(_,i)=>i));g.computeBoundingBox();g.computeBoundingSphere();return g;
 }
 if(jaw.length<30)throw Error('Mallard asset has no separable lower bill.');
 return{body:geometry(body,0),jaw:geometry(jaw,1),sourceTriangles:count/3};
}

export function createMouthLining(mouthWeight){
 const xs=[.300,.312,.333,.353,.373],widths=[.022,.029,.024,.016,.003],p=[],index=[],w=[];
 xs.forEach((x,i)=>{for(const side of [-1,1]){const y=billSeam(x);p.push(x,y,-.028+widths[i]*side);w.push(smooth(.16,.265,y)*smooth(.055,.125,x),mouthWeight);}if(i){const a=(i-1)*2;index.push(a,a+1,a+2,a+1,a+3,a+2);}});
 const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setAttribute('pondDuckWeights',new THREE.Float32BufferAttribute(w,2));g.setIndex(index);g.computeVertexNormals();g.computeBoundingBox();g.computeBoundingSphere();return g;
}
