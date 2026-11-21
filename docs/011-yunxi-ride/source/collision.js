function createImmortalCollision() {
  // Individual probes keep the tires, body and high bill distinct at cliffs and eaves.
  const rider = [
    { offset:-1.52, radius:.32, bottom:.04, top:1.32 },
    { offset:-1.99, radius:.24, bottom:.28, top:1.06 },
    { offset:1.53, radius:.32, bottom:.04, top:1.34 },
    { offset:2.02, radius:.25, bottom:.27, top:1.07 },
    { offset:-.43, radius:.44, bottom:.58, top:2.69 },
    { offset:.52, radius:.38, bottom:1.34, top:2.45 },
    { offset:.12, radius:.29, bottom:2.63, top:3.61 },
    { offset:.91, radius:.28, bottom:3.01, top:3.49 },
    { offset:1.47, radius:.17, bottom:3.16, top:3.45 }
  ];
  const bodyRadius=2.43, margin=.004;
  const lerp=(a,b,t)=>a+(b-a)*t;
  let colliders=[], previousCells=[];

  function setCells(cells) {
    const next=Array.from(cells);
    if(next.length===previousCells.length&&next.every((cell,i)=>cell===previousCells[i]))return;
    previousCells=next;
    colliders=next.flatMap(cell=>cell.colliders||[]);
  }

  function nearby(x,z,toX,toZ,padding) {
    const left=Math.min(x,toX)-padding,right=Math.max(x,toX)+padding;
    const near=Math.min(z,toZ)-padding,far=Math.max(z,toZ)+padding;
    return colliders.filter(item=>item.x+item.rx>=left&&item.x-item.rx<=right&&
      item.z+item.rz>=near&&item.z-item.rz<=far);
  }

  function ellipseContact(x,z,shape,radius) {
    const rx=shape.rx+radius,rz=shape.rz+radius;
    const dx=x-shape.x,dz=z-shape.z;
    const value=Math.hypot(dx/rx,dz/rz);
    if(value>=1)return;
    const normalX=dx/(rx*rx),normalZ=dz/(rz*rz);
    const magnitude=Math.hypot(normalX,normalZ);
    return {
      depth:(1-value)*Math.min(rx,rz),
      nx:magnitude?normalX/magnitude:1,
      nz:magnitude?normalZ/magnitude:0
    };
  }

  function boxContact(x,z,shape,radius) {
    const dx=x-shape.x,dz=z-shape.z;
    const ex=Math.abs(dx)-shape.rx,ez=Math.abs(dz)-shape.rz;
    const ox=Math.max(ex,0)*Math.sign(dx),oz=Math.max(ez,0)*Math.sign(dz);
    const separation=Math.hypot(ox,oz);
    if(separation>=radius)return;
    if(separation>0)return { depth:radius-separation, nx:ox/separation, nz:oz/separation };
    if(ex>ez)return { depth:radius-ex, nx:Math.sign(dx)||1, nz:0 };
    return { depth:radius-ez, nx:0, nz:Math.sign(dz)||1 };
  }

  function rockContact(x,z,rock,radius,bottom,top) {
    const {sections}=rock;
    let result;
    function at(a,b,height) {
      const t=Math.max(0,Math.min(1,(height-a.y)/(b.y-a.y)));
      const shape={x:lerp(a.x,b.x,t),z:lerp(a.z,b.z,t),rx:lerp(a.rx,b.rx,t),rz:lerp(a.rz,b.rz,t)};
      const contact=ellipseContact(x,z,shape,radius);
      if(contact&&(!result||contact.depth>result.depth))result=contact;
    }
    for(let i=1;i<sections.length;i++){
      const a=sections[i-1],b=sections[i];
      const low=Math.max(bottom,a.y),high=Math.min(top,b.y);
      if(low>high)continue;
      at(a,b,low);
      at(a,b,high);
      if(high-low>.30)at(a,b,(low+high)*.5);
    }
    return result;
  }

  function blockingContact(pose,items) {
    const c=Math.cos(pose.heading),s=Math.sin(pose.heading);
    const pitch=Math.sin(pose.pitch||0);
    let result;
    for(const item of items){
      if(pose.y>item.yMax+1||pose.y+4<item.yMin||
        Math.abs(pose.x-item.x)>item.rx+bodyRadius||Math.abs(pose.z-item.z)>item.rz+bodyRadius)continue;
      for(const probe of rider){
        const y=pose.y+probe.offset*pitch;
        const bottom=y+probe.bottom,top=y+probe.top;
        if(bottom>=item.yMax-margin||top<=item.yMin+margin)continue;
        const x=pose.x+c*probe.offset,z=pose.z+s*probe.offset;
        if(Math.abs(x-item.x)>item.rx+probe.radius||Math.abs(z-item.z)>item.rz+probe.radius)continue;
        const hit=item.type==="rock"?rockContact(x,z,item,probe.radius,bottom,top):
          item.type==="box"?boxContact(x,z,item,probe.radius):ellipseContact(x,z,item,probe.radius);
        if(hit&&(!result||hit.depth>result.depth))result={...hit,item};
      }
    }
    return result;
  }

  function containsSurface(x,z,item) {
    if(Math.abs(x-item.x)>item.rx||Math.abs(z-item.z)>item.rz)return false;
    if(item.outline){
      let inside=false;
      for(let i=0,j=item.outline.length-1;i<item.outline.length;j=i++){
        const [ax,az]=item.outline[i],[bx,bz]=item.outline[j];
        if((az>z)!==(bz>z)&&x<(bx-ax)*(z-az)/(bz-az)+ax)inside=!inside;
      }
      return inside;
    }
    return item.type==="box"||Math.hypot((x-item.x)/item.rx,(z-item.z)/item.rz)<1;
  }

  function supportAt(x,z,maxY,items,minY=-Infinity) {
    let surface;
    for(const item of items){
      if(!item.surface||item.yMax>maxY||item.yMax<minY||item.yMax<=(surface??-Infinity))continue;
      if(containsSurface(x,z,item))surface=item.yMax;
    }
    return surface;
  }

  function surfaceHeight(x,z,maxY) {
    return supportAt(x,z,maxY??Infinity,colliders);
  }

  function interpolated(from,to,t) {
    return {
      x:lerp(from.x,to.x,t),y:lerp(from.y,to.y,t),z:lerp(from.z,to.z,t),
      heading:lerp(from.heading,to.heading,t),pitch:lerp(from.pitch,to.pitch,t)
    };
  }

  function safeApproach(from,to,items) {
    let lo=0,hi=1;
    for(let i=0;i<6;i++){
      const t=(lo+hi)*.5;
      if(blockingContact(interpolated(from,to,t),items))hi=t;
      else lo=t;
    }
    return interpolated(from,to,lo);
  }

  function resolve(before,next) {
    const start={ x:before.x,y:before.y,z:before.z,
      heading:before.heading??next.heading??0,pitch:before.pitch??next.pitch??0 };
    const turn=(next.heading??start.heading)-start.heading;
    const endHeading=start.heading+Math.atan2(Math.sin(turn),Math.cos(turn));
    const endPitch=next.pitch??start.pitch;
    const items=nearby(start.x,start.z,next.x,next.z,bodyRadius);
    if(!items.length)return {x:next.x,y:next.y,z:next.z,heading:next.heading,hit:false,nx:0,nz:0};
    const dx=next.x-start.x,dy=next.y-start.y,dz=next.z-start.z;
    const travel=Math.max(Math.hypot(dx,dz),Math.abs(dy),Math.abs(endHeading-start.heading)*1.95);
    const steps=Math.min(120,Math.max(1,Math.ceil(travel/.19)));
    let pose=start, impact, floor, ceiling=false, verticalImpact;
    for(let i=1;i<=steps;i++){
      const horizontal={x:pose.x+dx/steps,y:pose.y,z:pose.z+dz/steps,
        heading:lerp(start.heading,endHeading,i/steps),pitch:lerp(start.pitch,endPitch,i/steps)};
      const moved=horizontal.x!==pose.x||horizontal.z!==pose.z||
        horizontal.heading!==pose.heading||horizontal.pitch!==pose.pitch;
      const hit=moved&&blockingContact(horizontal,items);
      if(!hit){
        pose=horizontal;
      }else{
        const initial=blockingContact(pose,items);
        if(initial&&initial.item===hit.item&&hit.depth<initial.depth-1e-5){
          // The rider may back out of an initial overlap at a newly streamed object.
          pose=horizontal;
        }else{
          impact=hit;
          const safe=initial?pose:safeApproach(pose,horizontal,items);
          const restX=horizontal.x-safe.x,restZ=horizontal.z-safe.z;
          const inward=Math.min(0,restX*hit.nx+restZ*hit.nz);
          const slide={...safe,x:safe.x+restX-inward*hit.nx,z:safe.z+restZ-inward*hit.nz};
          pose=blockingContact(slide,items)?safe:slide;
        }
      }

      if(!dy)continue;
      const vertical={...pose,y:pose.y+dy/steps};
      const support=dy<0?supportAt(pose.x,pose.z,pose.y+margin,items,vertical.y):undefined;
      if(support!==undefined){
        vertical.y=support;
        if(!blockingContact(vertical,items)){
          pose=vertical;
          floor=support;
          continue;
        }
      }
      const hitY=blockingContact(vertical,items);
      const initialY=hitY&&blockingContact(pose,items);
      if(!hitY||(initialY&&initialY.item===hitY.item&&hitY.depth<initialY.depth-1e-5)){
        pose=vertical;
        continue;
      }
      if(!initialY)pose=safeApproach(pose,vertical,items);
      verticalImpact=hitY;
      ceiling=ceiling||dy>0;
    }
    if(!impact&&!verticalImpact&&floor===undefined)
      return {x:next.x,y:next.y,z:next.z,heading:next.heading,hit:false,nx:0,nz:0};
    return {x:pose.x,y:pose.y,z:pose.z,heading:Math.atan2(Math.sin(pose.heading),Math.cos(pose.heading)),
      hit:Boolean(impact||verticalImpact),nx:impact?.nx??0,nz:impact?.nz??0,
      kind:(impact||verticalImpact)?.item.kind,floor,ceiling};
  }

  function obstruction(x,y,z,heading,distance) {
    if(distance<=0)return 0;
    const c=Math.cos(heading),s=Math.sin(heading),steps=Math.ceil(distance/.48);
    const items=nearby(x,z,x+c*distance,z+s*distance,bodyRadius);
    if(!items.length)return 0;
    const pose={x,y,z,heading,pitch:0};
    let overlap=blockingContact(pose,items);
    if(overlap&&c*overlap.nx+s*overlap.nz<=.06)return 1;
    for(let i=1;i<=steps;i++){
      const t=i/steps,advance=distance*t;
      pose.x=x+c*advance;
      pose.z=z+s*advance;
      const hit=blockingContact(pose,items);
      if(hit&&(!overlap||hit.item!==overlap.item||hit.depth>=overlap.depth))return 1-.88*t;
      overlap=hit;
    }
    return 0;
  }
  return {setCells,resolve,obstruction,surfaceHeight};
}
