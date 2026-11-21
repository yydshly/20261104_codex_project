import * as THREE from './vendor/three.module.js';
import { GLTFLoader } from './vendor/addons/loaders/GLTFLoader.js';
import { createPondMaterials } from './pond-materials.js';

// The trees, ferns, shrubs and bank rocks are authored/scanned CC0 assets, not generated stand-ins.
export function createEnvironment3D() {
  const group=new THREE.Group();group.name='Woodland pond — authored assets v5';
  const pbr=createPondMaterials(),geometries=new Set(),materials=new Set(),textures=new Set(),batches=new Map();
  const uniforms={time:{value:0},wind:{value:.5},daylight:{value:1},skylight:{value:.85}};
  let disposed=false,seed=418731;
  const random=()=>{seed=(1664525*seed+1013904223)>>>0;return seed/4294967296;};
  const range=(a,b)=>a+random()*(b-a);
  const geom=g=>{geometries.add(g);return g;};
  const material=p=>{const m=new THREE.MeshStandardMaterial(p);materials.add(m);return m;};
  const matrix=new THREE.Matrix4(),position=new THREE.Vector3(),scale=new THREE.Vector3(),rotation=new THREE.Euler(),quaternion=new THREE.Quaternion(),up=new THREE.Vector3(0,1,0);
  const box=geom(new THREE.BoxGeometry(1,1,1)),cylinder=geom(new THREE.CylinderGeometry(.78,1,1,9)),roundCylinder=geom(new THREE.CylinderGeometry(1,1,1,12)),sphere=geom(new THREE.SphereGeometry(1,12,8)),rockGeometry=geom(new THREE.IcosahedronGeometry(1,2));
  const wood=material({color:'#c7b194',roughness:.88,...pbr.maps('wood_planks_grey',[.28,1.2],0,.38)});
  const darkWood=material({color:'#897769',roughness:.94,...pbr.maps('wood_planks_grey',[.3,1.2],0,.42)});
  const paleWood=material({color:'#ddcbb1',roughness:.84,...pbr.maps('wood_planks_grey',[.28,1.2],0,.38)});
  const deckWood=material({color:'#c9bda6',roughness:.87,...pbr.maps('wood_planks_grey',[.22,1.5],Math.PI/2,.48)});
  const stone=material({color:'#d6d5ca',roughness:.95,...pbr.maps('mossy_rock',[.65,.65],0,.6)});
  const slate=material({color:'#7b8580',roughness:.84,...pbr.maps('mossy_rock',[.7,.9],0,.22)});
  const metal=material({color:'#383d35',roughness:.5,metalness:.55});
  const windowGlow=material({color:'#75532e',emissive:'#ffb760',emissiveIntensity:.6,roughness:.65});
  const glass=material({color:'#c8d1cb',metalness:.05,roughness:.16,transparent:true,opacity:.2,depthWrite:false});
  function instance(geometry,mat,p,s,r=[0,0,0],color=null) {
    const key=geometry.uuid+':'+mat.uuid;if(!batches.has(key))batches.set(key,{geometry,material:mat,items:[]});
    position.fromArray(p);scale.fromArray(s);rotation.set(...r);quaternion.setFromEuler(rotation);matrix.compose(position,quaternion,scale);
    batches.get(key).items.push({matrix:matrix.clone(),color});
  }
  function beam(a,b,radius,mat=wood,taper=true,color=null) {
    const av=new THREE.Vector3(...a),bv=new THREE.Vector3(...b),delta=bv.clone().sub(av),length=delta.length();quaternion.setFromUnitVectors(up,delta.normalize());matrix.compose(av.add(bv).multiplyScalar(.5),quaternion,new THREE.Vector3(radius,length,radius));
    const geometry=taper?cylinder:roundCylinder,key=geometry.uuid+':'+mat.uuid;if(!batches.has(key))batches.set(key,{geometry,material:mat,items:[]});batches.get(key).items.push({matrix:matrix.clone(),color});
  }
  function mesh(geometry,mat,p,s=[1,1,1],r=[0,0,0]) {const o=new THREE.Mesh(geometry,mat);o.position.fromArray(p);o.scale.fromArray(s);o.rotation.set(...r);o.castShadow=o.receiveShadow=true;group.add(o);return o;}
  function groundHeight(x,z) {
    const back=THREE.MathUtils.smoothstep(-z,7.7,19),side=THREE.MathUtils.smoothstep(Math.abs(x),9,20);
    return .20+back*(1.15+.38*Math.sin(x*.24)+.25*Math.cos(z*.3))+side*(.7+.23*Math.sin(z*.28));
  }
  // Mud tongues overlap the elliptical water mesh, so the visible shoreline is irregular.
  const groundPositions=[],groundUV=[],groundColors=[],groundIndices=[],rings=[0,.045,.13,.30,.6,1,1.55,2.2,3.1,4.4],segments=192;
  for(let j=0;j<rings.length;j++)for(let i=0;i<=segments;i++) {
    const a=i/segments*Math.PI*2,shore=.959-.025*Math.sin(a*3+.6)-.017*Math.sin(a*7-.4),r=shore+rings[j],x=Math.cos(a)*5.5*r,z=Math.sin(a)*3.8*r;
    const y=j===0?.068:j===1?.115:groundHeight(x,z)+(j>2?.06*Math.sin(x*.9)*Math.cos(z*.7):0);
    groundPositions.push(x,y,z);groundUV.push(x/3.6,z/3.6);
    const tone=j===0?.30:j===1?.48:j===2?.77:1;groundColors.push(tone,tone,tone);
  }
  for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;groundIndices.push(a,a+1,b,a+1,b+1,b);}
  const ground=geom(new THREE.BufferGeometry());ground.setAttribute('position',new THREE.Float32BufferAttribute(groundPositions,3));ground.setAttribute('uv',new THREE.Float32BufferAttribute(groundUV,2));ground.setAttribute('color',new THREE.Float32BufferAttribute(groundColors,3));ground.setIndex(groundIndices);ground.computeVertexNormals();
  mesh(ground,material({color:'#ffffff',vertexColors:true,roughness:.92,...pbr.maps('mud_forest',[1.565,1.565],0,.55)}),[0,0,0]).name='Scanned damp woodland soil and irregular wet bank';
  // Cottage: stone footing, board walls, gables, individually overlapping roof rows.
  const hx = 6.4, hz = -8.3;
  const house = (g, m, p, s, r, c) => instance(g, m, [p[0] + hx, p[1], p[2] + hz], s, r, c);
  house(box, stone, [0, .36, 0], [3.7, .55, 2.9]);
  for(let row=0;row<2;row++)for(let n=0;n<9;n++)house(rockGeometry,stone,[-1.65+n*.41+(row%2)*.08,.25+row*.22,1.43],[.25,.14,.15],[0,range(-.3,.3),range(-.1,.1)],new THREE.Color('#d1c9b2'));
  house(box, wood, [0, 1.55, 0], [3.4, 2.05, 2.65]);
  for (let x = -1.6; x <= 1.61; x += .2) {
    house(box, paleWood, [x, 1.55, 1.335], [.185, 1.94, .035], [0,0,0], new THREE.Color().setHSL(.085,.12,range(.72,.95)));
  }
  for (const side of [-1, 1]) for (let z = -1.2; z < 1.3; z += .2) {
    house(box, wood, [side * 1.718, 1.55, z], [.035, 1.94, .185], [0,0,0], new THREE.Color().setHSL(.085,.12,range(.72,.95)));
  }
  for (const x of [-1.74, 1.74]) for (const z of [-1.37, 1.37]) house(box, darkWood, [x, 1.55, z], [.17, 2.2, .17]);
  for (const z of [-1.38, 1.38]) house(box, darkWood, [0, .67, z], [3.65, .17, .16]);
  const gableGeometry = geom(new THREE.BufferGeometry());
  gableGeometry.setAttribute('position', new THREE.Float32BufferAttribute([-1.7,0,0, 1.7,0,0, 0,1.3,0],3));
  gableGeometry.setAttribute('uv', new THREE.Float32BufferAttribute([0,0,1,0,.5,1],2));
  gableGeometry.setIndex([0,1,2]); gableGeometry.computeVertexNormals();
  mesh(gableGeometry, wood, [hx, 2.57, hz + 1.34]);
  mesh(gableGeometry, wood, [hx, 2.57, hz - 1.34], [1,1,1], [0,Math.PI,0]);
  const slope = Math.atan2(1.3, 2.02);
  const tileShape=new THREE.Shape();tileShape.moveTo(-.48,-.49);tileShape.lineTo(.46,-.49);tileShape.lineTo(.5,.28);tileShape.lineTo(.39,.49);tileShape.lineTo(-.43,.48);tileShape.lineTo(-.51,.28);tileShape.closePath();
  const tileGeometry=geom(new THREE.ExtrudeGeometry(tileShape,{depth:.055,bevelEnabled:true,bevelThickness:.009,bevelSize:.016,bevelSegments:1,steps:1,curveSegments:1}));
  tileGeometry.center();tileGeometry.rotateX(Math.PI/2);
  for (const side of [-1, 1]) {
    house(box, slate, [side * 1.0, 3.18, 0], [2.43, .13, 3.4], [0,0,-side*slope]);
    for (let row = 0; row < 8; row++) for (let tile = 0; tile < 12; tile++) {
      const x = side * (.12 + row * .27), y = 3.91 - Math.abs(x) * Math.tan(slope), z = -1.59 + tile * .285 + (row % 2 ? .045 : 0);
      house(tileGeometry, slate, [x, y+range(-.009,.009), z], [.34,1,.31], [0,range(-.015,.015),-side*slope], new THREE.Color().setHSL(.37,.05,range(.62,.88)));
    }
    beam([hx,3.94,hz+1.76], [hx+side*2.15,2.56,hz+1.76], .075, darkWood, false);
    beam([hx,3.94,hz-1.76], [hx+side*2.15,2.56,hz-1.76], .075, darkWood, false);
  }
  house(box, darkWood, [0, 3.94, 0], [.18, .17, 3.55]);
  house(box, stone, [.95, 3.45, -.6], [.53, 2.1, .62]);
  house(box, darkWood, [.95, 4.53, -.6], [.7, .16, .79]);
  for (let y = 2.7; y < 4.5; y += .23) house(box, stone, [.95,y,-.6], [.56,.025,.65], [0,0,0], new THREE.Color('#596158'));
  // Front door with arch-like top and individual panels.
  house(box, darkWood, [-.42, 1.48, 1.37], [.88, 1.75, .13]);
  for (let n = 0; n < 5; n++) house(box, wood, [-.75 + n*.165,1.47,1.455], [.14,1.63,.05]);
  house(sphere, metal, [-.12,1.45,1.51], [.055,.055,.055]);
  house(box, darkWood, [-.42,2.4,1.4], [1.08,.15,.24]);
  // Glazing appears recessed under chunky frames and crossbars.
  for (const wx of [-1.22, .99]) {
    house(box, darkWood, [wx,1.71,1.38], [.7,.96,.12]);
    house(box, windowGlow, [wx,1.71,1.455], [.54,.77,.025]);
    // An inner timber silhouette and reflective glazing give each warm pane depth.
    house(box, darkWood, [wx+.1,1.58,1.474], [.035,.45,.012]);
    house(box, glass, [wx,1.71,1.49], [.54,.77,.009]);
    house(box, paleWood, [wx,1.71,1.48], [.055,.83,.05]);
    house(box, paleWood, [wx,1.71,1.48], [.59,.055,.05]);
    house(box, paleWood, [wx,1.23,1.46], [.82,.09,.25]);
  }
  house(box, darkWood, [1.75,1.72,0], [.1,1.1,1.12]);
  house(box, windowGlow, [1.81,1.72,0], [.025,.91,.93]);
  house(box, glass, [1.834,1.72,0], [.009,.91,.93]);
  house(box, paleWood, [1.84,1.72,0], [.05,.06,1]);
  house(box, paleWood, [1.84,1.72,0], [.05,.97,.06]);
  house(box, darkWood, [0,3.1,1.38], [.55,.63,.1]);
  house(box, windowGlow, [0,3.1,1.44], [.4,.48,.025]);
  house(box, paleWood, [0,3.1,1.47], [.04,.52,.03]);
  // Porch, steps, and a usable timber landing extending over the pond.
  // Porch boards run along Z; dock boards run along X and use the rotated maps.
  for (let n=0;n<19;n++) house(box,paleWood,[-1.86+n*.207,.46,1.91],[.19,.13,1.2]);
  house(box,wood,[-.4,.29,2.64],[1.4,.22,.45]);
  house(box,wood,[-.4,.17,2.95],[1.65,.13,.4]);
  for (const x of [-1.8,1.8]) {
    house(box,darkWood,[x,1.62,2.35],[.13,2.25,.13]);
    beam([hx+x,.5,hz+2.35],[hx+x,2.75,hz+2.35],.065,wood,false);
  }
  house(box,slate,[0,2.87,1.98],[4.05,.12,1.55],[.12,0,0]);
  house(box,darkWood,[0,2.69,2.76],[4.13,.15,.13]);
  // A warm hanging porch lantern, modelled with a shade, glass and frame.
  house(box,windowGlow,[.58,2.2,1.7],[.16,.28,.16]);
  house(box,metal,[.58,2.39,1.7],[.27,.09,.27]);
  house(box,metal,[.58,2.02,1.7],[.22,.05,.22]);
  for(const dx of [-.09,.09]) for(const dz of [-.09,.09]) house(box,metal,[.58+dx,2.2,1.7+dz],[.025,.32,.025]);
  const porchLight = new THREE.PointLight('#ffbd6b', 2.8, 6, 2); porchLight.position.set(hx+.58,2.1,hz+1.85); group.add(porchLight);
  const sideLight = new THREE.PointLight('#ffd08c', .7, 3.5, 2); sideLight.position.set(hx+1.95,1.65,hz); group.add(sideLight);


  for(const batch of batches.values()) {
    const o=new THREE.InstancedMesh(batch.geometry,batch.material,batch.items.length);
    batch.items.forEach((item,i)=>{o.setMatrixAt(i,item.matrix);if(item.color)o.setColorAt(i,item.color);});
    o.instanceMatrix.needsUpdate=true;if(o.instanceColor)o.instanceColor.needsUpdate=true;o.castShadow=o.receiveShadow=true;o.name='Distant cottage detail';group.add(o);
  }
  const materialByName=new Map(),stats={version:5,loaded:false,treeNear:0,treeFar:0,fern:0,shrub:0,rock:0};
  function addWind(mat,kind) {
    const strength=kind==='tree'?.055:.07;
    const modify=shader=>{
      shader.uniforms.uPondAssetTime=uniforms.time;shader.uniforms.uPondAssetWind=uniforms.wind;
      shader.vertexShader='uniform float uPondAssetTime;\nuniform float uPondAssetWind;\n'+shader.vertexShader;
      shader.vertexShader=shader.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
        #ifdef USE_INSTANCING
        vec3 origin=instanceMatrix[3].xyz;
        float phase=origin.x*.71+origin.z*.43;
        float tip=clamp(position.y*${kind==='tree'?'.25':'2.5'},0.,1.);
        float breeze=sin(uPondAssetTime*.81+phase)*.6+sin(uPondAssetTime*1.36+phase*1.7)*.25;
        float flutter=sin(uPondAssetTime*3.8+position.x*6.3+position.z*5.1)*.18;
        transformed.x+=(breeze+flutter)*tip*uPondAssetWind*${strength};
        transformed.z+=cos(uPondAssetTime*.72+phase)*tip*uPondAssetWind*${strength*.4};
        #endif`);
      if(shader.fragmentShader.includes('#include <lights_fragment_end>')) {
        shader.uniforms.uLeafDaylight=uniforms.daylight;shader.uniforms.uLeafSkylight=uniforms.skylight;
        shader.fragmentShader='uniform float uLeafDaylight;\nuniform float uLeafSkylight;\n'+shader.fragmentShader;
        shader.fragmentShader=shader.fragmentShader.replace('#include <shadowmap_pars_fragment>','#include <shadowmap_pars_fragment>\n#include <shadowmask_pars_fragment>');
        // Thin leaf transmission is directional and receives sky light through its back surface.
        // It contributes to reflected light before AO/tone mapping, never to emissive radiance.
        shader.fragmentShader=shader.fragmentShader.replace('#include <lights_fragment_end>',`#include <lights_fragment_end>
          vec3 leafSunView=normalize(mat3(viewMatrix)*normalize(vec3(-7.,10.,4.)));
          vec3 leafSkyView=normalize(mat3(viewMatrix)*vec3(0.,1.,0.));
          float leafBackSun=pow(max(0.,dot(-normal,leafSunView)),1.15);
          float leafForward=pow(max(0.,dot(-normalize(vViewPosition),leafSunView)),3.);
          float leafSkyTransmission=clamp(dot(-normal,leafSkyView)*.5+.5,0.,1.);
          float leafLightVisibility=mix(.25,1.,getShadowMask());
          reflectedLight.directDiffuse+=diffuseColor.rgb*vec3(1.,.97,.86)*uLeafDaylight*leafBackSun*(.72+leafForward*.3)*leafLightVisibility;
          reflectedLight.indirectDiffuse+=diffuseColor.rgb*uLeafSkylight*(.08+.28*leafSkyTransmission);
        `);
      }
    };
    mat.onBeforeCompile=modify;mat.customProgramCacheKey=()=> 'pond-scan-wind-translucency-v2-'+kind;
    const depth=new THREE.MeshDepthMaterial({depthPacking:THREE.RGBADepthPacking,map:mat.map,alphaMap:mat.alphaMap,alphaTest:mat.alphaTest,side:THREE.DoubleSide});
    depth.onBeforeCompile=modify;depth.customProgramCacheKey=()=> 'pond-scan-wind-depth-'+kind;materials.add(depth);mat.userData.windDepth=depth;
  }
  function prepareMaterial(mat,kind,far=false) {
    if(far&&materialByName.has(mat.name))return materialByName.get(mat.name);
    if(materialByName.has(mat.name))return materialByName.get(mat.name);
    materials.add(mat);materialByName.set(mat.name,mat);mat.envMapIntensity=.9;
    if(mat.map)mat.map.colorSpace=THREE.SRGBColorSpace;
    for(const value of Object.values(mat))if(value?.isTexture){textures.add(value);value.anisotropy=8;}
    const foliage=/leaves|fern|shrub/i.test(mat.name);
    if(foliage){mat.transparent=false;mat.depthWrite=true;mat.alphaTest=.42;mat.alphaToCoverage=true;mat.side=THREE.DoubleSide;addWind(mat,kind);}
    mat.needsUpdate=true;return mat;
  }
  function prepareAsset(gltf,kind,far=false,referenceBounds=null) {
    gltf.scene.updateMatrixWorld(true);const wholeBounds=referenceBounds||new THREE.Box3().setFromObject(gltf.scene,true),center=wholeBounds.getCenter(new THREE.Vector3()),height=wholeBounds.max.y-wholeBounds.min.y,parts=[];
    gltf.scene.traverse(o=>{if(!o.isMesh)return;
      const bounds=kind==='tree'?wholeBounds:new THREE.Box3().setFromObject(o,true),pivot=bounds.getCenter(new THREE.Vector3());
      const geometry=geom(o.geometry.clone().applyMatrix4(o.matrixWorld));geometry.translate(-pivot.x,-bounds.min.y,-pivot.z);geometry.computeBoundingBox();geometry.computeBoundingSphere();
      const mat=prepareMaterial(o.material,kind,far);parts.push({geometry,material:mat,name:o.name,height:bounds.max.y-bounds.min.y,extent:Math.max(bounds.max.x-bounds.min.x,bounds.max.z-bounds.min.z)});
    });
    return {parts,bounds:wholeBounds,height,center};
  }
  function assetBatch(part,placements,label,castShadow=true) {
    if(!placements.length)return;const o=new THREE.InstancedMesh(part.geometry,part.material,placements.length);o.name=label;
    const dummy=new THREE.Object3D();placements.forEach((p,i)=>{dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(p.tilt||0,p.rotation||0,p.roll||0);dummy.scale.set(p.s*(p.wide||1),p.s*(p.tall||1),p.s);dummy.updateMatrix();o.setMatrixAt(i,dummy.matrix);});
    o.castShadow=castShadow;o.receiveShadow=true;if(part.material.userData.windDepth)o.customDepthMaterial=part.material.userData.windDepth;
    o.instanceMatrix.needsUpdate=true;o.computeBoundingSphere();group.add(o);
  }
  function placeTrees(asset,layout,far) {
    // The scan includes a small pale capture skirt at its root; bury that skirt into the soil.
    const placements=layout.map(([x,z,h,rotation])=>({x,z,y:groundHeight(x,z)-h*.065,s:h/asset.height,rotation}));
    asset.parts.forEach(part=>assetBatch(part,placements,far?'Distant authored tree / shared material':'Near authored tree',!far));stats[far?'treeFar':'treeNear']+=placements.length;
  }
  function scatterPlants(asset,kind,count) {
    const groups=asset.parts.map(()=>[]);
    for(let i=0;i<count;i++) {
      const a=range(0,Math.PI*2),radial=kind==='fern'?range(1.04,1.39):range(1.28,1.9),x=Math.cos(a)*5.5*radial,z=Math.sin(a)*3.8*radial;
      if(x>2.7&&x<8&&z<-5)continue;
      if(z>2.8&&x>-.8&&x<3.2&&random()<.8)continue;
      const index=i%asset.parts.length,part=asset.parts[index],desired=kind==='fern'?range(.33,.68):range(.30,.85),s=desired/Math.max(.1,part.height);
      groups[index].push({x,z,y:groundHeight(x,z)-.035,s,rotation:range(0,Math.PI*2),wide:range(.85,1.2)});stats[kind]++;
    }
    groups.forEach((placements,i)=>assetBatch(asset.parts[i],placements,kind==='fern'?'Scanned serrated fern fronds':'Authored woodland undergrowth'));
  }
  function understoryFerns(asset) {
    const groups=asset.parts.map(()=>[]);
    const beds=[[-5.6,-1.8],[-5.7,-4.0],[-4.1,-5.5],[-2.1,-4.7],[.2,-5.0],[2.6,-5.5],[5.8,-6.3],[-7,-7],[-4,-9],[-.5,-10],[3.1,-10],[-9,-11],[6,-13],[9,-10],[-7.2,2.8],[5.7,3.4],[-5.5,-12],[0,-13.3],[5.6,-14.2]];
    beds.forEach(([cx,cz],bed)=>{for(let n=0;n<15;n++) {
      const x=cx+range(-1.35,1.35),z=cz+range(-1.25,1.25);if(x*x/30.25+z*z/14.44<1.09)continue;
      if(x>4.6&&x<8.1&&z>-9.9&&z<-7)continue;
      const index=(bed+n)%asset.parts.length,part=asset.parts[index];
      groups[index].push({x,z,y:groundHeight(x,z)-.025,s:range(.42,.75)/part.height,rotation:range(0,6.28)});stats.fern++;
    }});
    groups.forEach((p,i)=>assetBatch(asset.parts[i],p,'Scanned fern patches on the woodland slope',false));
  }
  function understoryShrubs(asset) {
    const groups=asset.parts.map(()=>[]),clusters=[[-6.4,-5.6],[-3.9,-7.1],[-.6,-6.6],[2.2,-7.4],[6.8,-11.2],[-9,-8.8],[0,-12.2],[9.1,-9.4],[-10,-2.8]];
    clusters.forEach(([cx,cz],k)=>{for(let n=0;n<(k%3===0?4:3);n++) {
      const x=cx+range(-1.1,1.1),z=cz+range(-.8,.8),index=(k+n)%asset.parts.length,part=asset.parts[index];
      groups[index].push({x,z,y:groundHeight(x,z)-.06,s:range(1.0,1.7)/part.height,rotation:range(0,6.28),wide:range(.92,1.06)});stats.shrub++;
    }});
    groups.forEach((p,i)=>assetBatch(asset.parts[i],p,'Authored broadleaf shrubs at natural scale',false));
  }
  function youngWoodland(treeA,treeB) {
    const layouts=[[],[]],clumps=[[-5.5,-6.3],[-2.5,-6.8],[.4,-7.1],[3.1,-7.6],[7.7,-11.6],[-8.3,-11.2]];
    clumps.forEach(([x,z],i)=>layouts[i%2].push([x+range(-.7,.7),z+range(-.8,.8),range(2.7,4.0),range(0,6.28)]));
    placeTrees(treeA,layouts[0],true);placeTrees(treeB,layouts[1],true);
  }
  function placeRocks(asset) {
    // Deliberate small groups and empty mud banks; never an evenly spaced necklace.
    const locations=[[-5.0,-.06,-.9,.62],[-5.3,.02,-1.6,.43],[-4.65,-.09,.9,.70],[-4.2,-.10,1.95,.42],[-4.8,.13,2.6,.8],[-3.45,-.08,2.97,.48],[-2.7,-.05,3.35,.34],[-1.25,-.11,3.54,.42],[2.3,-.04,3.25,.47],[2.9,.08,3.8,.64],[4.7,-.10,1.75,.35],[4.95,-.12,-.1,.55],[4.5,-.07,-2.2,.42],[-2.85,.1,-3.25,.57],[-3.5,.12,-3.9,.78],[.2,-.10,-3.55,.36],[-6.3,.19,.7,.67],[5.6,.19,4.6,.72]];
    const groups=asset.parts.map(()=>[]);locations.forEach(([x,y,z,h],i)=>{const index=i%asset.parts.length,part=asset.parts[index];groups[index].push({x,y,z,s:h/part.height,rotation:range(0,6.28),wide:range(.9,1.3)});stats.rock++;});
    groups.forEach((placements,i)=>assetBatch(asset.parts[i],placements,'Scanned mossy shoreline rocks'));
  }
  const loader=new GLTFLoader(),decodedModels=new Set(),releasedModels=new WeakSet(),closedImages=new Set();
  let loadFailed=false;
  function releaseTexture(texture) {
    texture.dispose();const image=texture.image;
    if(image&&typeof image.close==='function'&&!closedImages.has(image)){image.close();closedImages.add(image);}
  }
  function releaseDecoded(gltf) {
    if(releasedModels.has(gltf))return;releasedModels.add(gltf);
    const modelMaterials=new Set(),modelTextures=new Set();
    gltf.scene.traverse(o=>{if(o.isMesh){o.geometry.dispose();for(const mat of Array.isArray(o.material)?o.material:[o.material])modelMaterials.add(mat);}});
    modelMaterials.forEach(mat=>{for(const value of Object.values(mat))if(value?.isTexture)modelTextures.add(value);mat.dispose();});
    modelTextures.forEach(releaseTexture);
  }
  const assetNames=['island_tree_01','island_tree_02','island_tree_01-far','island_tree_02-far','fern_02','rock_moss_set_01','shrub_03','shrub_02','island_tree_01-canopy','island_tree_02-canopy'];
  const ready=Promise.all([pbr.ready,...assetNames.map(name=>loader.loadAsync(new URL('https://raw.githubusercontent.com/yydshly/20261104_codex_project/main/projects/033-environment-emotion-lab/runtime/assets/models/environment-v5/runtime/'+name+'.glb?v=complete-canopy-4',import.meta.url).href).then(gltf=>{if(disposed||loadFailed)releaseDecoded(gltf);else decodedModels.add(gltf);return gltf;}).catch(error=>{throw new Error('池塘真实模型载入失败：'+name,{cause:error});}))]).then(([_,...gltfs])=>{
    if(disposed)return stats;
    const treeA=prepareAsset(gltfs[0],'tree'),treeB=prepareAsset(gltfs[1],'tree');
    const farA=prepareAsset(gltfs[2],'tree',true,treeA.bounds),farB=prepareAsset(gltfs[3],'tree',true,treeB.bounds);
    const canopyA=prepareAsset(gltfs[8],'tree',true,treeA.bounds),canopyB=prepareAsset(gltfs[9],'tree',true,treeB.bounds);
    // Replace the damaged global-decimation leaf layers. Every authored source leaf is retained.
    treeA.parts=treeA.parts.filter(p=>!/leaves/.test(p.material.name)).concat(canopyA.parts);
    treeB.parts=treeB.parts.filter(p=>!/leaves/.test(p.material.name)).concat(canopyB.parts);
    farA.parts=farA.parts.filter(p=>!/leaves/.test(p.material.name)).concat(canopyA.parts);
    farB.parts=farB.parts.filter(p=>!/leaves/.test(p.material.name)).concat(canopyB.parts);
    stats.sourceLeafComponents=44168+29781;stats.canopyMode='all-source-leaves-retained';
    placeTrees(treeA,[[-6.8,-1.8,7.2,-.9],[-2.1,-7.4,8.4,.65]],false);
    placeTrees(treeB,[[7.6,-5.6,8.0,2.3]],false);
    // Bring the rear crown line down behind the understory, closing the view under tall bare trunks.
    placeTrees(farA,[[-10.5,-10.5,9.1,.5],[8,-12.8,6.2,2.1],[-6.4,-12.8,5.9,2.8],[.7,-12.3,5.5,-.8],[11.8,-22.8,10.7,1.4],[-14.7,-17.6,10.2,2.4]],true);
    placeTrees(farB,[[-2.3,-11.6,5.2,-1.2],[-11.4,2.5,7.5,1.3],[-11.3,-23.7,9.2,-.5],[-2.8,-25.5,10.2,2.8],[4.2,-13.5,5.8,.3],[15.7,-17.4,9.2,-2.1]],true);
    // Keep the near leaf geometry on midground saplings: aggressive leaf decimation made them bare.
    const saplingA={...farA,parts:farA.parts.map(p=>/leaves/.test(p.material.name)?treeA.parts.find(n=>n.material.name===p.material.name):p)};
    const saplingB={...farB,parts:farB.parts.map(p=>/leaves/.test(p.material.name)?treeB.parts.find(n=>n.material.name===p.material.name):p)};
    youngWoodland(saplingA,saplingB);
    const fern=prepareAsset(gltfs[4],'fern');scatterPlants(fern,'fern',92);understoryFerns(fern);
    placeRocks(prepareAsset(gltfs[5],'rock'));
    scatterPlants(prepareAsset(gltfs[6],'shrub'),'shrub',43);
    understoryShrubs(prepareAsset(gltfs[7],'shrub'));
    stats.meshes=0;stats.triangles=0;group.traverse(o=>{if(o.isMesh){stats.meshes++;const n=o.isInstancedMesh?o.count:1;stats.triangles+=(o.geometry.index?o.geometry.index.count:o.geometry.attributes.position.count)/3*n;}});
    decodedModels.clear();stats.loaded=true;group.userData.assetStats=stats;return stats;
  }).catch(error=>{loadFailed=true;decodedModels.forEach(releaseDecoded);decodedModels.clear();throw error;});
  return {
    group,ready,stats,
    update(time,{wind=.5,night=0}={}) {
      uniforms.time.value=time;uniforms.wind.value=Math.max(0,Math.min(2,wind));const n=Math.max(0,Math.min(1,night));
      uniforms.daylight.value=1-n;uniforms.skylight.value=.85*(1-n)+.025*n;
      windowGlow.emissiveIntensity=.35+n*1.2;porchLight.intensity=.5+n*2.1;sideLight.intensity=.15+n*.65;
    },
    dispose() {
      if(disposed)return;disposed=true;decodedModels.forEach(releaseDecoded);decodedModels.clear();
      group.traverse(o=>{if(o.isInstancedMesh)o.dispose();});geometries.forEach(g=>g.dispose());materials.forEach(m=>m.dispose());textures.forEach(releaseTexture);pbr.dispose();group.removeFromParent();
    },
  };
}
