import * as THREE from 'three';

function gaussian(x){return Math.exp(-x*x);}
function ridge(d,w){return gaussian(d/w)-.42*gaussian((d-w*1.9)/(w*1.35))-.42*gaussian((d+w*1.9)/(w*1.35));}

// Short folds radiate from sewn edges. Width and height are in metres, so a
// small scatter cushion does not acquire the same giant folds as a seat.
export function clothOffset(x,y,z,n,w,h,d,kind,seed=0){
  const u=x/(w*.5),v=y/(h*.5),t=z/(d*.5);
  let offset=0;
  if(kind==='seat'){
    const edge=Math.max(0,1-u*u);
    if(n.y>.1){
      offset-=.010*Math.exp(-Math.pow(u/.75,4)-Math.pow(t/.78,4))*n.y;
      for(const [i,at]of [-.36,-.12,.23,.39].entries()){
        const curve=at*w+(z-d*.36)*(.2+Math.sin(i+seed)*.24);
        offset+=ridge(x-curve,.011)*.006*gaussian((t-.72)/.36)*edge*n.y;
      }
    }
    if(n.z>.2){
      for(const [i,at]of [-.36,-.12,.23,.39].entries()){
        const curve=at*w+y*(.3+Math.sin(i+seed)*.15);
        offset+=ridge(x-curve,.009)*.007*gaussian((v-.22)/.72)*edge*n.z;
      }
    }
  }else if(kind==='back'||kind==='pillow'){
    const face=Math.max(0,n.z),envelope=Math.max(0,1-u*u);
    for(const [i,at]of [-.32,-.11,.28,.39].entries()){
      const curve=at*w+(y+h*.38)*(.12+Math.sin(i*2+seed)*.20)+Math.sin(v*2.1+i)*.006;
      offset+=ridge(x-curve,.010)*(kind==='back'?.008:.0065)*gaussian((v+.60)/.44)*envelope*face;
    }
    for(const side of [-1,1]){
      const diagonal=x-side*w*.37-side*(y-h*.22)*.52;
      offset+=ridge(diagonal,.009)*.0045*gaussian((v-.51)/.30)*face;
    }
    if(kind==='back')offset+=ridge(x+.22*y-w*.16,.025)*.004*gaussian((v+.15)/.60)*envelope*face;
  }
  return offset;
}

export function smoothClothNormals(geometry){
  geometry.computeVertexNormals();
  const p=geometry.attributes.position,n=geometry.attributes.normal,groups=new Map();
  for(let i=0;i<p.count;i++){
    const key=`${Math.round(p.getX(i)*50000)},${Math.round(p.getY(i)*50000)},${Math.round(p.getZ(i)*50000)}`;
    let sum=groups.get(key);if(!sum){sum=[0,0,0];groups.set(key,sum);}sum[0]+=n.getX(i);sum[1]+=n.getY(i);sum[2]+=n.getZ(i);
  }
  const normal=new THREE.Vector3();
  for(let i=0;i<p.count;i++){
    const sum=groups.get(`${Math.round(p.getX(i)*50000)},${Math.round(p.getY(i)*50000)},${Math.round(p.getZ(i)*50000)}`);
    normal.set(...sum).normalize();n.setXYZ(i,normal.x,normal.y,normal.z);
  }
  geometry.computeBoundingBox();geometry.computeBoundingSphere();return geometry;
}

export function wrinkleCloth(geometry,kind,seed=0){
  geometry.computeBoundingBox();const box=geometry.boundingBox,size=box.getSize(new THREE.Vector3()),center=box.getCenter(new THREE.Vector3());
  const p=geometry.attributes.position,n=geometry.attributes.normal;
  for(let i=0;i<p.count;i++){
    const normal={x:n.getX(i),y:n.getY(i),z:n.getZ(i)};
    const delta=clothOffset(p.getX(i)-center.x,p.getY(i)-center.y,p.getZ(i)-center.z,normal,size.x,size.y,size.z,kind,seed);
    p.setXYZ(i,p.getX(i)+normal.x*delta,p.getY(i)+normal.y*delta,p.getZ(i)+normal.z*delta);
  }
  return smoothClothNormals(geometry);
}

// Refine the flat seat faces before displacement; moving only their original
// corner vertices would make folds into large faceted dents.
export function refineSeat(source,maxEdge=.035){
  const positions=[],normals=[],uvs=[],p=source.attributes.position,n=source.attributes.normal,uv=source.attributes.uv;
  const vertex=i=>[p.getX(i),p.getY(i),p.getZ(i),n.getX(i),n.getY(i),n.getZ(i),uv.getX(i),uv.getY(i)];
  const mid=(a,b)=>a.map((v,i)=>(v+b[i])*.5);
  const length=(a,b)=>(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;
  function emit(a,b,c,level){
    const ab=length(a,b),bc=length(b,c),ca=length(c,a);
    if(level<9&&Math.max(ab,bc,ca)>maxEdge*maxEdge){
      if(ab>=bc&&ab>=ca){const m=mid(a,b);emit(a,m,c,level+1);emit(m,b,c,level+1);}
      else if(bc>=ca){const m=mid(b,c);emit(a,b,m,level+1);emit(a,m,c,level+1);}
      else{const m=mid(c,a);emit(a,b,m,level+1);emit(m,b,c,level+1);}return;
    }
    for(const v of [a,b,c]){positions.push(...v.slice(0,3));const l=Math.hypot(...v.slice(3,6));normals.push(v[3]/l,v[4]/l,v[5]/l);uvs.push(v[6],v[7]);}
  }
  const index=source.index;
  for(let i=0;i<(index?index.count:p.count);i+=3)emit(vertex(index?index.getX(i):i),vertex(index?index.getX(i+1):i+1),vertex(index?index.getX(i+2):i+2),0);
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geometry.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));return geometry;
}
