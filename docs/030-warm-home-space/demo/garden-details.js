import * as THREE from 'three';
import {GROUND_Y} from './courtyard-layout.js';
import {BEDS,BOLLARDS} from './garden-layout.js';
import {addWind} from './canopy-vegetation.js';

function attributes(positions,normals,uvs,wind,indices){
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new THREE.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geo.setAttribute('canopyWind',new THREE.Float32BufferAttribute(wind,4));geo.setIndex(indices);return geo;
}
function grassGeometry(){
  const positions=[],normals=[],uvs=[],wind=[],indices=[];
  for(let blade=0;blade<20;blade++){
    const angle=blade*2.39996,length=.55+.45*(.5+.5*Math.sin(blade*3.71)),rootX=Math.cos(angle)*.16,rootZ=Math.sin(angle)*.16,first=positions.length/3;
    for(let segment=0;segment<=5;segment++)for(const side of [-1,1]){
      const t=segment/5,width=.016*(1-t)+.0008,bend=t*t*.25;
      const x=rootX+Math.cos(angle)*bend+Math.sin(angle)*width*side,z=rootZ+Math.sin(angle)*bend-Math.cos(angle)*width*side,y=t*length;
      positions.push(x,y,z);normals.push(Math.sin(angle)*.35,.75,-Math.cos(angle)*.35);uvs.push((side+1)/2,t);wind.push(x,y,z,t*t);
      if(segment<5&&side===-1){const a=first+segment*2;indices.push(a,a+1,a+2,a+1,a+3,a+2);}
    }
  }
  return attributes(positions,normals,uvs,wind,indices);
}
function flowerGeometry(){
  const parts=Array.from({length:2},()=>({positions:[],normals:[],uvs:[],wind:[],indices:[]}));
  function piece(geometry,matrix,part){
    const {positions,normals,uvs,wind,indices}=parts[part];
    const g=geometry.clone().applyMatrix4(matrix),p=g.attributes.position,n=g.attributes.normal,u=g.attributes.uv,offset=positions.length/3;
    for(let i=0;i<p.count;i++){positions.push(p.getX(i),p.getY(i),p.getZ(i));normals.push(n.getX(i),n.getY(i),n.getZ(i));uvs.push(u?.getX(i)??0,u?.getY(i)??0);wind.push(p.getX(i),p.getY(i),p.getZ(i),p.getY(i)**2);}
    for(const index of g.index.array)indices.push(index+offset);
    g.dispose();
  }
  const bud=new THREE.SphereGeometry(1,5,3),stem=new THREE.CylinderGeometry(.004,.006,1,4),transform=new THREE.Matrix4();
  for(let i=0;i<9;i++){
    const a=i*2.4,x=Math.cos(a)*.16,z=Math.sin(a)*.16,h=.55+(i%4)*.12;
    for(let j=0;j<7;j++){const y=h+j*.024,r=.024*(1-j*.08);transform.compose(new THREE.Vector3(x,y,z),new THREE.Quaternion(),new THREE.Vector3(r,.029,r));piece(bud,transform,0);}
    transform.compose(new THREE.Vector3(x,h/2,z),new THREE.Quaternion(),new THREE.Vector3(1,h,1));piece(stem,transform,1);
  }
  bud.dispose();stem.dispose();return parts.map(p=>attributes(p.positions,p.normals,p.uvs,p.wind,p.indices));
}
function plantInstances(world,geo,material,specs,clock,strength){
  const mesh=new THREE.InstancedMesh(geo,material,specs.length);
  specs.forEach((p,i)=>mesh.setMatrixAt(i,new THREE.Matrix4().compose(new THREE.Vector3(p.x,GROUND_Y+.03,p.z),new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0,1,0),p.angle),new THREE.Vector3(p.height,p.height,p.height))));
  mesh.castShadow=true;mesh.receiveShadow=true;addWind(mesh,clock,strength);world.add(mesh);return mesh;
}

export function buildGardenDetails(world,planting,clock,daylight){
  const soil=new THREE.MeshStandardMaterial({color:'#554a36',roughness:1}),stone=new THREE.MeshStandardMaterial({color:'#b6b2a2',roughness:.95});
  for(const bed of BEDS){
    const base=new THREE.Mesh(new THREE.CircleGeometry(1,64),soil);base.rotation.x=-Math.PI/2;base.scale.set(bed.rx,bed.rz,1);base.position.set(bed.x,GROUND_Y+.016,bed.z);base.receiveShadow=true;world.add(base);
    const points=Array.from({length:64},(_,i)=>new THREE.Vector3(bed.x+Math.cos(i/64*Math.PI*2)*bed.rx,GROUND_Y+.025,bed.z+Math.sin(i/64*Math.PI*2)*bed.rz));
    const edge=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(points,true),128,.045,6,true),stone);edge.receiveShadow=true;edge.castShadow=true;world.add(edge);
  }
  const grass=new THREE.MeshPhysicalMaterial({color:'#748652',roughness:.89,side:THREE.DoubleSide,sheen:.15,sheenColor:new THREE.Color('#a7b782'),specularIntensity:.2});
  plantInstances(world,grassGeometry(),grass,planting.grasses,clock,.035).name='ornamental-grasses';
  const [flowers,stems]=flowerGeometry();
  plantInstances(world,stems,new THREE.MeshStandardMaterial({color:'#69734c',roughness:.9}),planting.flowers,clock,.025).name='perennial-stems';
  for(const type of [0,1]){
    const mat=new THREE.MeshStandardMaterial({color:type?'#c4b8a9':'#8e7a9c',roughness:.87});
    plantInstances(world,flowers,mat,planting.flowers.filter(p=>p.type===type),clock,.025).name='perennial-flowers-'+type;
  }
  const metal=new THREE.MeshStandardMaterial({color:'#4e534a',metalness:.55,roughness:.45}),glow=new THREE.MeshStandardMaterial({color:'#e1d7ba',emissive:'#ffd28b',emissiveIntensity:.08,roughness:.6});
  const lights=[];
  BOLLARDS.forEach((p,index)=>{
    const post=new THREE.Mesh(new THREE.CylinderGeometry(.065,.08,.58,12),metal);post.position.set(p.x,GROUND_Y+.29,p.z);post.castShadow=true;world.add(post);
    const band=new THREE.Mesh(new THREE.CylinderGeometry(.075,.075,.08,12),glow);band.position.set(p.x,GROUND_Y+.61,p.z);world.add(band);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.09,.075,.04,12),metal);cap.position.set(p.x,GROUND_Y+.67,p.z);world.add(cap);
    if(index<3){const light=new THREE.PointLight('#ffd08f',0,4.2,2);light.position.set(p.x,GROUND_Y+.65,p.z);world.add(light);lights.push(light);}
  });
  return {counts:{beds:BEDS.length,grasses:planting.grasses.length,flowers:planting.flowers.length,bollards:BOLLARDS.length},setEvening(night){glow.emissiveIntensity=night?1.1:.08;lights.forEach(l=>l.intensity=night?2.2:0);}};
}
