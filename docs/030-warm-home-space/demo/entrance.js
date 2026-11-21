import * as THREE from 'three';
import {doorShape,doorBlocks,inDoorSweep} from './door-motion.js';

export function buildEntrance(scene,materials,helpers){
  const {box,cyl,rod}=helpers;
  const floor=box(1.78,.14,2.58,[.85,-.07,4.82],materials.floor);floor.name='foyer-floor';
  const uv=floor.geometry.attributes.uv;
  for(let i=0;i<uv.count;i++)uv.setXY(i,uv.getX(i)*1.78/5.6,uv.getY(i)*2.58/8.9);
  for(const x of [-.04,1.74])box(.14,2.8,2.50,[x,1.4,4.85],materials.wall);
  box(1.92,.16,2.50,[.85,2.86,4.85],materials.ceiling);
  // Actual opening, separate jambs and lintel; no wall behind the leaf.
  for(const x of [.01,1.69])box(.30,2.80,.19,[x,1.4,6.04],materials.wall);
  box(1.40,.39,.19,[.85,2.605,6.04],materials.wall);
  for(const x of [.14,1.56])box(.075,2.37,.18,[x,1.185,5.965],materials.wood,scene,.008);
  box(1.49,.075,.18,[.85,2.375,5.965],materials.wood,scene,.008);
  for(const x of [.045,1.655])box(.025,.11,2.22,[x,.055,4.85],materials.trim);
  const darkOak=materials.wood.clone();darkOak.color.set('#a6967d');
  const pivot=new THREE.Group();pivot.name='operable-front-door';pivot.position.set(doorShape.hingeX,0,doorShape.z);scene.add(pivot);
  box(doorShape.width,2.30,.065,[-doorShape.width/2,1.16,0],darkOak,pivot,.009);
  for(const side of [-1,1]){
    const z=side*.038;
    for(const x of [-doorShape.width+.095,-.095])box(.012,2.08,.005,[x,1.16,z],materials.darkwood,pivot,.002);
    box(1.12,.010,.005,[-.67,.47,z],materials.darkwood,pivot,.002);
    box(.046,.215,.014,[-1.17,1.02,z+side*.008],materials.brass,pivot,.008);
    rod([-1.17,1.02,z+side*.045],[-.99,1.02,z+side*.045],.012,materials.brass,pivot);
    const eye=cyl(.012,.012,.010,[-.67,1.65,z+side*.004],materials.brass,pivot,24);eye.rotation.x=Math.PI/2;
  }
  for(const y of [.25,1.16,2.06])cyl(.018,.018,.11,[.012,y,0],materials.brass,pivot,20);
  const interactive=[];pivot.traverse(o=>{if(o.isMesh)interactive.push(o);});
  box(1.39,.012,.20,[.85,.006,5.96],materials.brass,scene,.003);
  // Closed interior room boundary.
  for(const x of [-.955,-.105])box(.055,2.37,.08,[x,1.185,3.68],materials.wood,scene,.005);
  box(.90,.065,.08,[-.53,2.375,3.68],materials.wood,scene,.005);
  box(.78,2.29,.050,[-.53,1.155,3.66],darkOak,scene,.009);
  box(.045,.19,.016,[-.78,1.01,3.625],materials.brass,scene,.006);
  rod([-.78,1.01,3.59],[-.64,1.01,3.59],.011,materials.brass);
  // Cabinet is clear of the complete door swing.
  box(.25,.82,.62,[1.54,.41,4.18],materials.wood,scene,.013);
  for(const z of [4.02,4.34])box(.018,.74,.295,[1.402,.41,z],materials.wall,scene,.009);
  box(.32,.37,.88,[.16,.185,5.12],materials.wood,scene,.015);
  box(.34,.07,.90,[.16,.405,5.12],materials.cushion,scene,.025);
  box(.08,.20,.75,[.065,1.60,5.10],materials.wood,scene,.014);
  for(const z of [4.85,5.10,5.35])rod([.09,1.60,z],[.20,1.60,z],.016,materials.darkwood);
  const mat=materials.rug.clone();mat.color.set('#a9977b');box(.80,.014,.52,[.84,.008,5.55],mat,scene,.02);
  const light=new THREE.SpotLight('#ffe6bd',2.3,4,.9,.8,2);light.position.set(.86,2.67,4.95);light.target.position.set(.85,.1,4.90);scene.add(light,light.target);
  const lampMat=new THREE.MeshStandardMaterial({color:'#fff2dc',emissive:'#ffdfac',emissiveIntensity:.55});
  cyl(.095,.095,.018,[.86,2.765,4.95],lampMat);
  // Bounded exterior landing for the beginning of the walk.
  const stone=new THREE.MeshStandardMaterial({color:'#aaa89e',roughness:.88});
  const landing=box(1.78,.14,2.65,[.85,-.07,7.36],stone);landing.name='outside-landing';
  for(const x of [-.04,1.74])box(.14,2.80,2.75,[x,1.4,7.38],materials.wall);
  box(1.92,.16,2.77,[.85,2.86,7.38],materials.ceiling);
  box(1.92,2.80,.14,[.85,1.4,8.76],materials.wall);
  for(const z of [6.62,7.24,7.86,8.48])box(1.62,.001,.003,[.85,.001,z],materials.trim);
  for(const x of [.045,1.655])box(.025,.11,2.55,[x,.055,7.40],materials.trim);
  cyl(.095,.095,.018,[.86,2.765,7.28],lampMat);
  const landingLight=new THREE.PointLight('#fff0da',3.5,5,2);landingLight.position.set(.85,2.55,7.3);scene.add(landingLight);
  box(.07,.14,.028,[1.65,1.26,6.155],materials.dark,scene,.014);
  const bell=cyl(.019,.019,.008,[1.65,1.27,6.173],materials.brass,scene,24);bell.rotation.x=Math.PI/2;
  let angle=0,target=0,obstructed=false;
  return {floor,landing,interactive,
    colliders:[{x1:1.39,z1:3.86,x2:1.70,z2:4.50},{x1:-.02,z1:4.67,x2:.33,z2:5.57}],
    get angle(){return angle;},get open(){return target>0;},get moving(){return Math.abs(target-angle)>.004;},
    get obstructed(){return obstructed;},
    blocks:(x,z,r)=>doorBlocks(x,z,angle,r),
    setOpen(open,player){if(player&&inDoorSweep(player.x,player.z))return false;target=open?doorShape.maxAngle:0;return true;},
    update(dt,player){
      const next=THREE.MathUtils.damp(angle,target,5.5,dt);
      obstructed=Math.abs(next-angle)>.0001&&player&&doorBlocks(player.x,player.z,next);
      if(!obstructed){angle=next;if(Math.abs(angle-target)<.001)angle=target;pivot.rotation.y=-angle;}
    },
    reset(){angle=target=0;obstructed=false;pivot.rotation.y=0;},
    restore(state){angle=THREE.MathUtils.clamp(state.angle,0,doorShape.maxAngle);target=state.open?doorShape.maxAngle:0;obstructed=false;pivot.rotation.y=-angle;},
  };
}
