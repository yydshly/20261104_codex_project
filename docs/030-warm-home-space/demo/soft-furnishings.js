import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import {wrinkleCloth} from './upholstery.js';
import {linenWeave} from './surface-finishes.js';

function smoothSeams(geometry){
  geometry.computeVertexNormals();
  const p=geometry.attributes.position,n=geometry.attributes.normal,groups=new Map();
  for(let i=0;i<p.count;i++){
    const key=[p.getX(i),p.getY(i),p.getZ(i)].map(v=>Math.round(v*50000)).join(',');
    if(!groups.has(key))groups.set(key,[]);groups.get(key).push(i);
  }
  const sum=new THREE.Vector3();
  for(const ids of groups.values()){
    sum.set(0,0,0);for(const i of ids)sum.add(new THREE.Vector3(n.getX(i),n.getY(i),n.getZ(i)));sum.normalize();for(const i of ids)n.setXYZ(i,sum.x,sum.y,sum.z);
  }
  geometry.computeBoundingBox();return geometry;
}

function loosePillow(w,h,d){
  const size=64,vertices=[],uvs=[],indices=[];
  for(const sign of [1,-1])for(let j=0;j<=size;j++)for(let i=0;i<=size;i++){
    const u=i/size*2-1,v=j/size*2-1,inside=Math.max(0,(1-u*u)*(1-v*v));
    let z=.012+d*.48*Math.pow(inside,.56);
    for(const side of [-1,1])for(const end of [-1,1]){
      const crease=u-side*.83-side*(v-end*.75)*end*.8;
      z-=.009*Math.exp(-crease*crease/.003)*Math.exp(-Math.pow((v-end*.73)/.24,2))*Math.pow(inside,.25);
    }
    const x=w*.5*u*(1-.075*Math.pow(v,8))+.004*Math.sin(v*3.1)*inside;
    const y=h*.5*v*(1-.075*Math.pow(u,8))-.010*inside*(.7+v*.2);
    vertices.push(x,y,sign*z);uvs.push(i/size,j/size);
  }
  const count=(size+1)**2;
  for(let side=0;side<2;side++)for(let j=0;j<size;j++)for(let i=0;i<size;i++){
    const a=side*count+j*(size+1)+i,b=a+1,c=a+size+1,d=c+1;
    if(side===0)indices.push(a,b,d,a,d,c);else indices.push(a,d,b,a,c,d);
  }
  const edge=[];
  for(let i=0;i<=size;i++)edge.push(i);
  for(let j=1;j<=size;j++)edge.push(j*(size+1)+size);
  for(let i=size-1;i>=0;i--)edge.push(size*(size+1)+i);
  for(let j=size-1;j>0;j--)edge.push(j*(size+1));
  for(let i=0;i<edge.length;i++){const a=edge[i],b=edge[(i+1)%edge.length];indices.push(a,a+count,b+count,a,b+count,b);}
  const geometry=new THREE.BufferGeometry();geometry.setAttribute('position',new THREE.Float32BufferAttribute(vertices,3));geometry.setAttribute('uv',new THREE.Float32BufferAttribute(uvs,2));geometry.setIndex(indices);geometry.computeVertexNormals();return geometry;
}

function fabricVolume(w,h,d,r,material,position,parent,kind='base'){
  const geo=kind==='pillow'?loosePillow(w,h,d):new RoundedBoxGeometry(w,h,d,12,r),p=geo.attributes.position,n=geo.attributes.normal;
  for(let i=0;i<p.count;i++){
    let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const u=x/(w*.5),v=y/(h*.5),t=z/(d*.5),front=Math.max(0,n.getZ(i));
    if(kind==='seat'){
      if(n.getY(i)>.2){
        y-=.027*Math.exp(-Math.pow(u/.76,4)-Math.pow(t/.78,4));
        y+=Math.sin(x*42+z*9)*.003*Math.exp(-Math.pow((t-.78)/.19,2));
      }
      z+=front*.004*Math.sin(x*49+y*16)*Math.exp(-Math.pow((v-.48)/.55,2));
    }
    if(kind==='back'){
      const puff=(kind==='pillow'?.047:.027)*Math.max(0,1-u*u)*Math.max(0,1-v*v);
      z+=front*puff;
      for(const side of [-1,1])for(const end of [-1,1]){
        const corner=(u-side*.76)-side*(v-end*.66)*end*.58;
        const crease=Math.exp(-corner*corner/.003)*Math.exp(-Math.pow((v-end*.64)/.22,2));
        z-=front*(kind==='pillow'?.014:.007)*crease;
        z+=front*.004*Math.exp(-Math.pow((corner-.065)/.065,2))*Math.exp(-Math.pow((v-end*.64)/.23,2));
      }
      z+=front*.0014*Math.sin(x*51+y*27)*Math.pow(Math.abs(v),5);
    }
    if(kind==='arm'){
      y+=Math.sin(z*15)*.004*Math.max(0,n.getY(i));
      z+=Math.sin(x*42+y*33)*.002*Math.max(0,n.getZ(i));
    }
    p.setXYZ(i,x,y,z);
  }
  smoothSeams(geo);
  if(kind==='back'||kind==='pillow')wrinkleCloth(geo,kind,position[0]*2.1);
  const object=new THREE.Mesh(geo,material);object.name=kind;object.position.set(...position);object.castShadow=true;object.receiveShadow=true;parent.add(object);return object;
}

function stitch(points,parent,material,r=.0015){
  const curve=new THREE.CatmullRomCurve3(points,false),g=new THREE.TubeGeometry(curve,Math.max(36,points.length*3),r,5,false),m=new THREE.Mesh(g,material);m.castShadow=false;m.receiveShadow=true;parent.add(m);return m;
}
function rim(x,y,z,w,d,parent,mat){
  const pts=[];
  for(let i=0;i<=72;i++){
    const a=i/72*Math.PI*2,c=Math.cos(a),s=Math.sin(a);
    pts.push(new THREE.Vector3(x+Math.sign(c)*Math.pow(Math.abs(c),.35)*w*.5,y,z+Math.sign(s)*Math.pow(Math.abs(s),.35)*d*.5));
  }
  return stitch(pts,parent,mat,.0018);
}

export function buildReferenceSofa(scene,materials){
  const sofa=new THREE.Group();sofa.name='reference-linen-sofa';sofa.position.set(-2.08,0,-.6);sofa.rotation.y=Math.PI/2;scene.add(sofa);
  const body=materials.linen.clone();body.color.set('#bdb19e');body.sheen=.48;body.roughness=.94;body.normalScale.set(.16,.16);
  const upholstery=materials.cushion.clone();upholstery.color.set('#d1c4af');upholstery.sheen=.6;upholstery.roughness=.93;upholstery.normalScale.set(.20,.20);
  const seam=new THREE.MeshStandardMaterial({color:'#b7a78f',roughness:1});
  for(const x of [-1.21,1.21])for(const z of [-.31,.31]){
    const leg=new THREE.Mesh(new THREE.CylinderGeometry(.027,.021,.135,14),materials.darkwood);leg.position.set(x,.0675,z);leg.castShadow=true;sofa.add(leg);
  }
  fabricVolume(2.92,.29,.94,.115,body,[0,.273,0],sofa);
  fabricVolume(2.90,.58,.22,.10,body,[0,.66,-.36],sofa,'back');
  for(const x of [-1.38,1.38])fabricVolume(.27,.47,.99,.105,body,[x,.50,.025],sofa,'arm');
  for(const x of [-.89,0,.89]){
    fabricVolume(.850,.207,.76,.090,upholstery,[x,.486,.105],sofa,'seat');
    const b=fabricVolume(.875,.58,.235,.086,upholstery,[x,.778,-.283],sofa,'back');b.name='back-cushion';b.rotation.x=-.14;
    rim(x,.495,.105,.848,.752,sofa,seam);
    const backPipe=[];
    for(let i=0;i<=80;i++){const a=i/80*Math.PI*2,c=Math.cos(a),s=Math.sin(a);backPipe.push(new THREE.Vector3(Math.sign(c)*Math.pow(Math.abs(c),.33)*.420,Math.sign(s)*Math.pow(Math.abs(s),.33)*.270,.079));}
    stitch(backPipe,b,seam,.0015);
  }
  const pillowSpecs=[[-1.0,.792,-.04,.14,upholstery],[.90,.803,-.035,-.19,materials.sage],[.42,.76,-.045,.14,upholstery]];
  for(const [x,y,z,angle,mat]of pillowSpecs){
    const pillow=fabricVolume(.50,.49,.19,.082,mat,[x,y,z],sofa,'pillow');pillow.rotation.set(-.18,.07,angle);pillow.scale.set(x<0?1.02:.94,x>.6?1.08:.96,1);
    const piping=[];
    for(let side=0;side<4;side++)for(let i=0;i<32;i++){
      const t=i/32*2-1,u=side===0?t:side===1?1:side===2?-t:-1,v=side===0?-1:side===1?t:side===2?1:-t;
      piping.push(new THREE.Vector3(.251*u*(1-.075*Math.pow(v,8)),.246*v*(1-.075*Math.pow(u,8)),0));
    }
    piping.push(piping[0].clone());
    stitch(piping,pillow,seam,.0013);
  }
  stitch([new THREE.Vector3(-1.29,.315,.464),new THREE.Vector3(0,.312,.469),new THREE.Vector3(1.29,.315,.464)],sofa,seam);
  const path=new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.30,.75,-.36),new THREE.Vector3(-1.30,.75,-.12),new THREE.Vector3(-1.30,.745,.19),new THREE.Vector3(-1.30,.66,.42),new THREE.Vector3(-1.30,.40,.54),new THREE.Vector3(-1.30,.115,.56)
  ]);
  const throwGeometry=new THREE.PlaneGeometry(.58,1.38,46,110),p=throwGeometry.attributes.position;
  for(let i=0;i<p.count;i++){
    const u=p.getX(i),v=(p.getY(i)+.69)/1.38,c=path.getPoint(v);
    const fold=Math.sin(u*35+Math.sin(v*4)*.5)*(.010+.006*v)+Math.sin(u*17-v*4)*.008;
    const crossDrop=(Math.max(0,-u-.13)*1.45+Math.max(0,u-.09)*1.10)*Math.pow(1-v,.8);
    p.setXYZ(i,c.x+u,c.y+Math.sin(u*14+v*3)*.008-crossDrop,c.z+fold);
  }
  throwGeometry.computeVertexNormals();const throwMaterial=materials.throw.clone();throwMaterial.side=THREE.DoubleSide;throwMaterial.color.set('#c7bba7');throwMaterial.normalScale.set(.40,.40);
  const blanket=new THREE.Mesh(throwGeometry,throwMaterial);blanket.name='throw';blanket.castShadow=true;blanket.receiveShadow=true;sofa.add(blanket);
  for(const edge of [0,46]){const hem=[];for(let row=0;row<=110;row++){const index=row*47+edge;hem.push(new THREE.Vector3(p.getX(index),p.getY(index)+.001,p.getZ(index)+.001));}stitch(hem,sofa,seam,.0012).name='throw';}
  for(let i=0;i<24;i++){
    const x=-1.59+i*.58/23;
    stitch([new THREE.Vector3(x,.12,.56),new THREE.Vector3(x+.002,.077+(i%3)*.004,.56)],sofa,seam,.0014).name='throw';
  }
  return sofa;
}

function curtainPoint(u,v,width,height,seed,sheer=false){
  const spread=.90+.18*v,phase=u*(6+seed*.08)*Math.PI*2+.08*Math.sin(v*Math.PI)*Math.sin(u*5+seed);
  const sway=.010*Math.sin(v*3.3+seed)*Math.sin(Math.PI*v);
  const x=u*width*spread+sway;
  const amp=.030+.011*v;
  const z=(Math.sin(phase)*amp+Math.sin(phase*2)*.004+Math.sin(u*83+v*9)*.001)*(sheer?.45:1);
  const pooling=Math.max(0,(v-.93)/.07);
  const y=height*.5-v*height+pooling*Math.sin(u*18+seed)*.006;
  return new THREE.Vector3(x,y,z);
}
export function buildReferenceCurtains(scene,materials){
  const root=new THREE.Group();root.name='layered-linen-curtains';scene.add(root);
  const weave=linenWeave(),daylight={value:1};root.userData.daylight=daylight;
  const densityData=new Uint8Array(256*256*4);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){const i=(y*256+x)*4,v=(x%4===0||y%4===0)?245:96;densityData[i]=densityData[i+1]=densityData[i+2]=v;densityData[i+3]=255;}
  const alpha=new THREE.DataTexture(densityData,256,256);alpha.wrapS=alpha.wrapT=THREE.RepeatWrapping;alpha.generateMipmaps=true;alpha.minFilter=THREE.LinearMipmapLinearFilter;alpha.magFilter=THREE.LinearFilter;alpha.anisotropy=8;alpha.needsUpdate=true;
  function panel(x,width,z,sheer,seed){
    const height=2.58,geo=new THREE.PlaneGeometry(width,height,126,104),p=geo.attributes.position;
    for(let i=0;i<p.count;i++){
      const u=p.getX(i)/width,v=(height*.5-p.getY(i))/height,point=curtainPoint(u,v,width,height,seed,sheer);p.setXYZ(i,point.x,point.y,point.z);
    }
    geo.computeVertexNormals();
    const uv=geo.attributes.uv;for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*width/.10,uv.getY(i)*height/.10);
    const mat=new THREE.MeshPhysicalMaterial({color:sheer?'#f1ebdf':'#d7cbb8',map:weave.map,bumpMap:weave.bump,bumpScale:sheer?.0003:.00065,roughness:.96,side:THREE.DoubleSide,sheen:sheer?.65:.72,sheenColor:new THREE.Color('#f2e6d0'),sheenRoughness:1,transparent:sheer,opacity:sheer?.58:1,depthWrite:!sheer,alphaMap:sheer?alpha:null});
    mat.forceSinglePass=true;
    mat.customProgramCacheKey=()=>`linen-thin-sheet-${sheer}`;
    mat.onBeforeCompile=shader=>{
      shader.uniforms.curtainDaylight=daylight;
      shader.fragmentShader='uniform float curtainDaylight;\n'+shader.fragmentShader;
      shader.fragmentShader=shader.fragmentShader.replace('vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;',`vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
        vec3 windowDirection=normalize((viewMatrix*vec4(0.,0.,-1.,0.)).xyz);
        float backScatter=pow(max(0.,dot(-normal,windowDirection)),.65);
        outgoingLight+=diffuseColor.rgb*vec3(${sheer?'.065,.058,.048':'.12,.105,.080'})*curtainDaylight*backScatter;`);
      if(sheer)shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
        float clothAngle=max(.65,abs(dot(normal,normalize(vViewPosition))));
        diffuseColor.a=1.-pow(1.-min(diffuseColor.a,.95),1./clothAngle);`);
    };
    const g=new THREE.Group();g.position.set(x,1.30,z);root.add(g);
    const cloth=new THREE.Mesh(geo,mat);cloth.castShadow=false;cloth.receiveShadow=false;g.add(cloth);
    const edgeMat=new THREE.MeshStandardMaterial({color:sheer?'#e7dfcf':'#bdae95',transparent:sheer,opacity:sheer?.35:1,roughness:1});
    for(const u of [-.499,.499]){
      const pts=[];for(let i=0;i<=45;i++)pts.push(curtainPoint(u,i/45,width,height,seed,sheer));stitch(pts,g,edgeMat,sheer?.0009:.0013);
    }
    const hem=[];for(let i=0;i<=100;i++)hem.push(curtainPoint(i/100-.5,.989,width,height,seed,sheer));stitch(hem,g,edgeMat,.0014);
    return g;
  }
  panel(-2.19,.87,-3.34,false,1);panel(2.19,.87,-3.34,false,3);
  panel(-1.53,.92,-3.44,true,2);panel(1.53,.92,-3.44,true,4);
  const pelmet=new THREE.Mesh(new THREE.BoxGeometry(5.45,.12,.20),materials.ceiling);pelmet.position.set(0,2.65,-3.27);pelmet.castShadow=true;pelmet.receiveShadow=true;root.add(pelmet);
  return root;
}
