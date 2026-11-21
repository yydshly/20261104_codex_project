/* Our own paper-and-ink rendering and three original scenes.
   Reference media are never sampled by this renderer. All fibers, ink and shapes are procedural. */
(() => {
  'use strict';
  const W=1000,H=630;
  const C={paper:'#eeeae0',ink:'#30332b',olive:'#74764e',red:'#aa4939',gold:'#b29455',blue:'#52666a',faint:'#a7a78c',white:'#f0ede4'};
  const P={pond:[[319,449],[433,505],[561,461],[667,529],[777,474],[815,550]],field:[[352,418],[470,426],[589,441],[308,491],[447,505],[580,520]],garden:[[326,442],[443,429],[563,448],[302,530],[445,528],[598,535]]};
  const rng=seed=>()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};
  const mix=(a,b,t)=>a+(b-a)*t;
  const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};
  const eased=x=>{x=Math.max(0,Math.min(1,x));return x*x*x*(x*(x*6-15)+10);};
  const strokeCache=new Map();
  const measurePath=document.createElementNS('http://www.w3.org/2000/svg','path');
  function carvedStroke(d,width){
    const key=width+'|'+d;if(strokeCache.has(key))return strokeCache.get(key);
    measurePath.setAttribute('d',d);const length=measurePath.getTotalLength(),pieces=[],step=2.2;
    let run=[];
    for(let distance=0;distance<=length+step;distance+=step){
      const p=measurePath.getPointAtLength(Math.min(distance,length));
      if(run.length&&Math.hypot(p.x-run.at(-1).x,p.y-run.at(-1).y)>step*2.6){if(run.length>1)pieces.push(run);run=[];}
      run.push({x:p.x,y:p.y});
    }
    if(run.length>1)pieces.push(run);const path=new Path2D();
    for(const points of pieces){
      const edges=[[],[]];
      for(let i=0;i<points.length;i++){
        const before=points[Math.max(0,i-1)],after=points[Math.min(points.length-1,i+1)],dx=after.x-before.x,dy=after.y-before.y,len=Math.hypot(dx,dy)||1,t=i/(points.length-1);
        const taper=.32+.68*Math.pow(Math.sin(Math.PI*t),.2),radius=width*.5*taper*(.94+.09*Math.sin(t*17+1.1));
        const drift=Math.sin(t*11.3)*Math.sin(t*Math.PI)*Math.min(.18,width*.09);
        edges[0].push([points[i].x-dy/len*(radius+drift),points[i].y+dx/len*(radius+drift)]);
        edges[1].push([points[i].x+dy/len*(radius-drift),points[i].y-dx/len*(radius-drift)]);
      }
      path.moveTo(...edges[0][0]);for(const p of edges[0].slice(1))path.lineTo(...p);for(const p of edges[1].reverse())path.lineTo(...p);path.closePath();
    }
    if(strokeCache.size>3600)strokeCache.clear();strokeCache.set(key,path);return path;
  }
  function noiseGrid(random,step){
    const cols=Math.ceil(W/step)+3,rows=Math.ceil(H/step)+3,grid=Float32Array.from({length:cols*rows},random);
    return (x,y)=>{const px=x/step,py=y/step,xx=Math.floor(px),yy=Math.floor(py),u=smooth(px-xx),v=smooth(py-yy);return mix(mix(grid[yy*cols+xx],grid[yy*cols+xx+1],u),mix(grid[(yy+1)*cols+xx],grid[(yy+1)*cols+xx+1],u),v);};
  }
  class PaperSurface {
    constructor(){
      const random=rng(68409),fine=noiseGrid(random,3),broad=noiseGrid(random,13),warp=noiseGrid(random,7);
      this.fine=new Float32Array(W*H);this.warpX=new Float32Array(W*H);this.warpY=new Float32Array(W*H);this.edge=new Float32Array(W*H);
      const canvas=document.createElement('canvas');canvas.width=W;canvas.height=H;const ctx=canvas.getContext('2d',{willReadFrequently:true});const raw=ctx.createImageData(W,H);
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){
        const q=y*W+x,k=q*4,n=random()-.5;this.fine[q]=n;
        const fibers=(fine(x,y)-.5)*26+(broad(x,y)-.5)*11+n*11;
        raw.data[k]=raw.data[k+1]=raw.data[k+2]=128+fibers;raw.data[k+3]=255;
        this.warpX[q]=(warp(x,y)-.5)*2.7;this.warpY[q]=(broad(x,y)-.5)*2.3;
        const torn=(broad(x,y)-.5)*12+(fine(x,y)-.5)*4;
        const distance=Math.min(x-24,W-25-x,y-22,H-23-y)+torn;
        this.edge[q]=smooth(distance/8);
      }
      ctx.putImageData(raw,0,0);ctx.lineCap='round';
      // Short, crossing strands. They stay fixed to the paper while the scene responds.
      for(let i=0;i<54000;i++){
        const x=random()*W,y=random()*H,length=1+Math.pow(random(),1.6)*7.5,a=-.65+(random()-.5)*2.6;
        ctx.strokeStyle=i%2?`rgba(246,246,246,${.10+random()*.20})`:`rgba(17,17,17,${.055+random()*.13})`;
        ctx.lineWidth=.25+random()*.7;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x+Math.cos(a)*length,y+Math.sin(a)*length);ctx.stroke();
      }
      const data=ctx.getImageData(0,0,W,H).data;this.h=new Float32Array(W*H);
      for(let i=0;i<this.h.length;i++)this.h[i]=data[i*4]/255;
    }
    render(colors,heights,params,ctx,region=null){
      const bounds=region||{x:0,y:0,w:W,h:H},image=ctx.createImageData(bounds.w,bounds.h),out=image.data,grain=params.grain/100,depth=params.relief/100,paperColor=[238,235,227];
      const a=params.light*Math.PI/180,lx=Math.cos(a)*.7,ly=Math.sin(a)*.7,lz=.72;
      const shade=params.view==='final',view=params.view;
      for(let y=bounds.y;y<bounds.y+bounds.h;y++)for(let x=bounds.x;x<bounds.x+bounds.w;x++){
        const q=y*W+x,k=q*4,dest=((y-bounds.y)*bounds.w+x-bounds.x)*4,l=y*W+Math.max(0,x-1),r=y*W+Math.min(W-1,x+1),t=Math.max(0,y-1)*W+x,b=Math.min(H-1,y+1)*W+x;
        const sampleX=Math.max(0,Math.min(W-1,x+this.warpX[q]*grain)),sampleY=Math.max(0,Math.min(H-1,y+this.warpY[q]*grain));
        const sx=Math.floor(sampleX),sy=Math.floor(sampleY),u=sampleX-sx,v=sampleY-sy,sample=(sy*W+sx)*4,sampleRight=(sy*W+Math.min(W-1,sx+1))*4,sampleBottom=(Math.min(H-1,sy+1)*W+sx)*4,sampleDiagonal=(Math.min(H-1,sy+1)*W+Math.min(W-1,sx+1))*4;
        const dx=(heights[r*4]-heights[l*4])/255,dy=(heights[b*4]-heights[t*4])/255;
        const fx=(this.h[r]-this.h[l])*grain,fy=(this.h[b]-this.h[t])*grain;
        let nx=-dx*depth*.58-fx*3.55,ny=-dy*depth*.58-fy*3.55,nz=1;
        const len=Math.sqrt(nx*nx+ny*ny+1);nx/=len;ny/=len;nz/=len;
        if(view==='height'){
          const value=108+this.h[q]*55*grain+heights[k]*.3;out[dest]=out[dest+1]=out[dest+2]=value;
        }else if(view==='normal'){
          out[dest]=(nx*.5+.5)*255;out[dest+1]=(ny*.5+.5)*255;out[dest+2]=(nz*.5+.5)*255;
        }else if(!shade){
          out[dest]=colors[k];out[dest+1]=colors[k+1];out[dest+2]=colors[k+2];
        }else{
          const light=.755+.345*Math.max(0,nx*lx+ny*ly+nz*lz);
          const wear=grain*(Math.max(0,this.fine[q]-.24)*.72+Math.max(0,this.h[q]-.58)*1.45);
          const material=(1+this.fine[q]*grain*.038)*light,edge=this.edge[q];
          for(let channel=0;channel<3;channel++){
            const paper=paperColor[channel],pigment=mix(mix(colors[sample+channel],colors[sampleRight+channel],u),mix(colors[sampleBottom+channel],colors[sampleDiagonal+channel],u),v);
            const printed=mix(pigment,paper,wear);
            out[dest+channel]=mix(252,printed*material,edge);
          }
        }
        out[dest+3]=255;
      }
      ctx.putImageData(image,0,0);
    }
  }

  const Base=window.PaperRelief;
  class WoodcutWorld extends Base {
    compose(){
      if(!this.surface){this.surface=new PaperSurface();Object.assign(this.params,{relief:28,grain:68,material:'woodcut'});}
      const started=performance.now();this.drawRawScene();
      this.blurCtx.clearRect(0,0,W,H);this.blurCtx.filter='blur(.65px)';this.blurCtx.drawImage(this.height,0,0);this.blurCtx.filter='none';
      this.colors=this.ic.getImageData(0,0,W,H).data;this.heights=this.blurCtx.getImageData(0,0,W,H).data;
      this.renderStats.composeMs=Math.round((performance.now()-started)*10)/10;this.shade();
    }
    drawRawScene(){this.ic.fillStyle=C.paper;this.ic.fillRect(0,0,W,H);this.hc.fillStyle='#000';this.hc.fillRect(0,0,W,H);if(this.scene==='pond')this.creek();else if(this.scene==='field')this.wheatField();else this.flowerGarden();}
    shade(){
      if(this.params.material==='relief')return super.shade();
      const start=performance.now();this.surface.render(this.colors,this.heights,this.params,this.bc);this.renderStats.shadeMs=Math.round((performance.now()-start)*10)/10;this.paint();
    }
    line(d,color=C.ink,width=1.5,h=.4){if(typeof d==='string'&&width>=.85){this.path(carvedStroke(d,width),color,null,1,h);}else this.path(d,null,color,width,h);}
    fill(d,color=C.ink,h=.45,stroke=null,width=1){this.path(d,color,stroke,width,h);}
    cut(d,width=1.4){this.line(d,C.paper,width,.08);}
    pivot(x,y,angle,draw){for(const c of [this.ic,this.hc]){c.save();c.translate(x,y);c.rotate(angle);c.translate(-x,-y);}draw();for(const c of [this.ic,this.hc])c.restore();}
    actionPulse(){const phase=this._motionPhase||0;return Math.pow(Math.sin(Math.PI*phase),2);}
    sleeve(a,b,c,r1,r2,r3,color){
      const normal=(p,q)=>{const dx=q[0]-p[0],dy=q[1]-p[1],length=Math.hypot(dx,dy)||1;return[-dy/length,dx/length];};
      const n1=normal(a,b),n3=normal(b,c),mid=[n1[0]+n3[0],n1[1]+n3[1]],len=Math.hypot(...mid)||1,n2=[mid[0]/len,mid[1]/len];
      const point=(p,n,r,side)=>[p[0]+n[0]*r*side,p[1]+n[1]*r*side];
      const a1=point(a,n1,r1,1),a2=point(a,n1,r1,-1),b1=point(b,n2,r2,1),b2=point(b,n2,r2,-1),c1=point(c,n3,r3,1),c2=point(c,n3,r3,-1);
      this.fill(`M${a1}Q${b1} ${c1}Q${c} ${c2}Q${b2} ${a2}Q${a} ${a1}Z`,color,.31);
    }
    twig(x,y,s=1,angle=0,col=C.olive){this.group(x,y,s,angle,()=>{this.fill('M0 3Q-12 -18 -6 -41Q2 -34 2 -20Q13 -45 24 -46Q20 -20 5 -9L5 3Z',col,.25);this.cut('M0 0Q-3 -16 -4 -31M2 -10L20 -38',.9);});}
    stalk(x,y,s=1,angle=0){this.group(x,y,s,angle,()=>{
      this.line('M0 7Q-7 -20 4 -65',C.olive,1.6,.25);
      for(let i=0;i<5;i++){const yy=-27-i*7;this.fill(`M${i*.5} ${yy}q-15 -1 -18 -14q14 2 18 14m1 1q14 -3 17 -16q-14 4 -17 16`,C.gold,.3);this.line(`M-14 ${yy-11}l-8 -9M16 ${yy-12}l8 -10`,C.gold,.7,.22);}
      this.fill('M-2 -12Q-25 -26 -24 -38Q-5 -32 -2 -12Z',C.olive,.28);this.cut('M-3 -14L-20 -33',.75);
    });}
    leaf(x,y,s=1,angle=0,color=C.olive){this.group(x,y,s,angle,()=>{
      this.fill('M0 1Q-4 -6 -3 -13Q-24 -11 -31 -30L-22 -30L-27 -42L-14 -35L-14 -47L-3 -37L3 -53L9 -38L20 -45L18 -32L33 -35L24 -24L33 -22Q17 -7 3 -12L4 4Z',color,.3);
      this.line('M1 1L2 -39M1 -15L-19 -33M3 -14L24 -27M0 -22L-9 -35',C.paper,1.05,.48);
      this.line('M1 0Q3 10 -1 17',C.ink,.85,.25);
    });}
    blossom(x,y,s=1,color=C.red){this.group(x,y,s,0,()=>{
      for(let i=0;i<7;i++)this.group(0,0,.94+Math.sin(i*2.1)*.07,i*.91+Math.sin(i*1.7)*.055,()=>{this.fill('M0 3C-12 -3 -22 -18 -14 -26C-9 -31 -2 -24 2 -16C9 -29 19 -27 18 -17C16 -9 8 -2 0 3Z',color,.33);this.cut('M1 -1Q-5 -11 -10 -18M4 -4Q8 -11 10 -16',.68);});
      this.ellipse(0,0,6,5,C.gold,null,1,.38);for(let i=0;i<8;i++){const a=i*.78;this.ellipse(Math.cos(a)*3,Math.sin(a)*3,.8,.8,C.ink,null,1,.45);}
    });}
    reed(x,y,s=1,col=C.olive,growth=1){this.group(x,y,s,0,()=>{for(const c of [this.ic,this.hc])c.scale(1,.22+.78*growth);
      this.fill('M0 0Q-17 -13 -22 -43Q-9 -33 -3 -12Q-10 -50 1 -62Q7 -34 3 -9Q12 -45 27 -45Q16 -15 5 0Z',col,.25);
      this.cut('M-2 -4Q-12 -18 -17 -34M1 -6L1 -47M3 -5L20 -36',.9);
    });}
    treeCrown(x,y,s=1,autumn=false){this.group(x,y,s,0,()=>{
      this.fill('M-10 12Q-3 -25 -5 -69Q-18 -119 -3 -177L2 -172Q-6 -119 6 -99Q14 -137 44 -160L46 -155Q20 -126 14 -91Q10 -46 15 12Z',C.ink,.3);
      this.line('M3 -52Q-19 -97 -54 -119M7 -88Q-22 -131 -39 -167M-1 -124Q18 -163 10 -202M10 -104Q44 -127 77 -119M0 -143Q-34 -148 -74 -136',C.ink,3,.32);
      this.cut('M-5 6Q5 -35 2 -75M2 -91Q-6 -132 -2 -160',1.2);
      const random=rng(714);for(let i=0;i<122;i++){
        const a=random()*6.283,r=Math.sqrt(random()),xx=Math.cos(a)*r*111,yy=-165+Math.sin(a)*r*65;
        const color=autumn?(i%4===0?C.red:i%3===0?C.gold:C.olive):i%5===0?C.gold:C.olive;
        this.group(xx,yy,.19+random()*.16,(random()-.5)*3.7,()=>{this.fill('M0 1Q-15 -4 -14 -17Q-5 -22 0 -31Q15 -22 18 -8Q11 3 0 1Z',color,.28);this.cut('M0 -1L1 -24M0 -9L-8 -15',.9);});
      }
      for(let i=0;i<10;i++)this.line(`M${-37+i*8} ${13+Math.sin(i)*3}q4 -5 9 -3`,C.olive,1,.2);
    });}
    distantBirds(x=690,y=162){for(let i=0;i<4;i++)this.line(`M${x+i*21} ${y+Math.sin(i*1.4)*7}q4 -4 8 1q4 -4 8 -2`,C.faint,.8,.1);}
    basket(x,y,s=1,n=0){this.group(x,y,s,0,()=>{
      this.fill('M-34 -1Q-30 23 -21 30Q1 40 27 28L34 -1Z',C.gold,.25,C.ink,1.2);
      this.ellipse(0,-2,35,10,C.ink,C.ink,1,.32);this.ellipse(0,-4,31,7,C.gold,null,1,.38);
      for(let i=-24;i<=24;i+=6)this.cut(`M${i} 4Q${i+5} 17 ${i*.75} 29`,1);
      this.line('M-29 13Q0 26 30 12M-25 23Q1 33 27 22',C.ink,.85,.4);
      this.line('M-26 -5Q-22 -40 0 -38Q25 -37 29 -5',C.ink,2.5,.35);this.cut('M-24 -6Q-17 -35 1 -35Q21 -35 26 -7',.9);
      const picked=[...this.completed];for(let i=0;i<n;i++){const id=picked[i]??i;this.leaf(-20+(i%3)*17,-4-Math.floor(i/3)*9,.27,-.9+i*.5,id%2?C.gold:C.red);}
    });}
    picker(x,y,s=1){this.group(x,y,s,0,()=>{
      const pulse=this.actionPulse(),skin='#ad9672';
      // Hips, two bent knees and two grounded feet establish a relaxed crouch.
      this.fill('M-29 -28C-13 -35 1 -26 8 -14C17 -8 18 3 22 15L12 22C3 11 -1 2 -8 -3L-22 -10C-29 -2 -36 4 -43 9L-45 20L-56 18C-58 9 -54 -3 -46 -11Z',C.ink,.3);
      this.fill('M-51 13Q-43 12 -38 18L-42 24Q-54 28 -64 25L-65 22Z',C.ink,.28);
      this.fill('M13 14Q20 12 24 18L31 24Q22 29 9 26L7 23Z',C.ink,.28);
      this.cut('M-42 -3Q-32 -6 -25 -15M-4 -8Q5 -1 9 10M-57 22Q-51 24 -44 21M13 24L25 24',.92);
      this.sleeve([-38,-63],[-51,-42],[-35,-19],8,7,3.5,C.blue);
      this.fill('M-38 -24Q-31 -25 -26 -19L-24 -11Q-27 -9 -29 -15L-34 -13L-40 -16Z',skin,.3);
      this.pivot(-24,-25,pulse*.019,()=>{
        this.fill('M-29 -79C-18 -84 -6 -78 -1 -66C5 -58 1 -45 -6 -35L-13 -24Q-29 -20 -41 -31C-49 -40 -49 -57 -44 -67Q-39 -75 -29 -79Z',C.blue,.32);
        this.cut('M-42 -52Q-34 -46 -29 -33M-36 -31Q-25 -27 -15 -31M-24 -69Q-13 -67 -7 -58M-43 -58L-36 -54',1.03);
        this.line('M-29 -77Q-21 -71 -13 -74',C.ink,.65,.3);
        this.group(-16,-92,1,.16+pulse*.045,()=>{
          this.fill('M-5 -10Q3 -13 8 -6L9 -1L12 3L8 5Q9 12 3 14L-3 11L-6 5Z',skin,.3);
          this.fill('M-6 7L2 10L2 19L-10 18Z',skin,.3);
          this.fill('M-10 -6Q-8 -16 3 -15Q14 -14 13 -6L8 -3Q2 -6 -6 -1L-8 5L-11 1Z',C.ink,.32);
          this.line('M4 1L7 2M7 8L4 8',C.ink,.58,.25);
          this.line('M-9 -6Q0 -10 9 -7',C.paper,.6,.08);
          this.ellipse(-6,3,2.1,3.2,skin,null,1,.3);
        });
        this.fill('M-28 -77Q-18 -72 -9 -74L-10 -67Q-23 -66 -31 -71Z',C.red,.32);
        this.fill('M-24 -69Q-28 -59 -30 -51L-24 -50L-17 -67Z',C.red,.32);
        const elbow=[12+pulse*2,-50+pulse*2],wrist=[36+pulse*3,-34+pulse*7];
        this.sleeve([-8,-66],elbow,wrist,9,7,3.8,C.blue);
        this.cut(`M-6 -65Q3 -57 ${elbow[0]-4} ${elbow[1]+4}M${elbow[0]-2} ${elbow[1]+3}L${wrist[0]-7} ${wrist[1]+2}`,1.05);
        this.group(wrist[0],wrist[1],1,.25+pulse*.15,()=>{
          this.fill('M0 -4Q7 -5 11 1L15 7Q15 10 12 8L8 4L11 11Q10 14 7 10L4 5Q0 7 -3 3Z',skin,.31);
          this.line('M5 2L9 7M2 3L5 8',C.ink,.5,.22);
        });
      });
    });}
    creek(){
      // Own composition: an arched footbridge and an autumn gathering by a stream.
      this.line('M104 343Q188 310 275 304Q322 286 347 288M746 342Q812 328 887 345',C.faint,1.1,.15);
      this.fill('M111 389Q173 344 269 349Q355 346 408 374Q299 383 246 421Q173 421 111 442Z',C.faint,.14);
      for(let i=0;i<13;i++)this.reed(137+i*12,401-Math.sin(i*.4)*14,.35+i%3*.09);
      this.treeCrown(247,358,1.05,true);
      this.group(0,0,1,0,()=>{
        this.fill('M315 344Q444 238 611 291Q688 309 736 355L708 384Q635 300 522 310Q424 306 347 374Z',C.olive,.26,C.ink,1.1);
        this.fill('M347 374Q432 309 521 310Q625 302 708 384L688 389Q606 325 524 330Q424 326 364 383Z',C.ink,.31);
        this.line('M305 339Q442 224 610 278Q689 301 747 352',C.ink,3,.3);
        this.cut('M320 341Q449 239 606 289Q681 311 732 357',2.3);
        for(let i=0;i<15;i++){
          const t=i/14,x=330+t*392,y=345-Math.sin(t*Math.PI)*70;
          this.line(`M${x} ${y}l${-4+Math.cos(t*5)*4} 20`,C.ink,1.1,.34);
          this.cut(`M${x+3} ${y+2}l0 13`,.8);
        }
        for(let i=0;i<6;i++)this.line(`M${351+i*59} ${351-Math.sin(i/5*Math.PI)*48}l10 -25`,C.ink,2.6,.3);
        this.line('M341 321Q450 229 608 275Q676 294 721 326',C.ink,1.8,.34);
        this.line('M343 325Q450 235 607 281Q671 300 721 331',C.gold,1.1,.34);
      });
      this.fill('M695 389Q776 359 888 391L883 426Q821 414 789 432Q746 448 704 448L680 442L695 423Z',C.faint,.16);
      this.line('M680 447Q731 458 789 435Q835 419 891 431M111 452Q191 414 253 433',C.olive,1.15,.2);
      this.picker(754,409,1.16);this.basket(819,421,.98,this.count);
      this.distantBirds(675,168);
      for(let i=0;i<20;i++){
        const x=220+(i*79)%650,y=431+Math.floor(i/7)*57+Math.sin(i*2)*12;
        this.line(`M${x} ${y}q12 -3 30 0m-18 5h20`,C.blue,.75,.18);
      }
      P.pond.forEach(([x,y],i)=>{if(!this.completed.has(i))this.leaf(x,y,.7+(i%3)*.08,-1.2+i*.73,i%2?C.gold:C.red);});
      this.reed(164,544,.85);this.reed(190,552,.6);this.reed(856,563,.7);
      this.line('M108 551q14 -9 25 -3m-16 8q12 -5 20 -2',C.olive,1,.2);
    }
    farmer(x,y,s=1){this.group(x,y,s,0,()=>{
      const skin='#ad9672',pulse=this.actionPulse();
      this.fill('M-31 -22Q-9 -29 2 -16Q9 -7 8 10L5 37L-7 41Q-12 23 -11 10L-17 -4Q-27 -3 -33 9L-42 32L-55 29Q-54 10 -45 -5Z',C.ink,.3);
      this.fill('M-53 26Q-44 24 -40 31L-43 39Q-54 45 -66 42L-66 38Z',C.ink,.3);
      this.fill('M-7 35Q2 32 7 39L14 44Q4 49 -12 46L-15 42Z',C.ink,.3);
      this.cut('M-39 3Q-34 -5 -25 -9M-9 8Q-5 20 -7 31M-59 39L-46 36M-8 44L8 44',.9);
      this.pivot(-22,-15,-pulse*.043,()=>{
        this.sleeve([-47,-51],[-56,-24],[-36,2],9,6.5,3.8,C.red);
        this.fill('M-42 -70Q-27 -75 -15 -61C-4 -52 1 -33 -3 -22Q-17 -10 -34 -16C-38 -29 -53 -32 -57 -46Q-59 -59 -49 -65Z',C.red,.32);
        this.cut('M-51 -47Q-42 -39 -39 -26M-31 -19Q-17 -17 -7 -25M-35 -60Q-24 -58 -16 -47',1.1);
        this.group(-32,-75,1,.16+pulse*.04,()=>{
          this.fill('M-6 -8Q1 -12 8 -5L9 0L13 4L8 6Q7 13 1 14L-6 10Z',skin,.3);
          this.fill('M-5 9L3 12L2 19L-10 17Z',skin,.3);
          this.line('M4 1L7 2M6 8L3 9',C.ink,.55,.25);
        });
        this.fill('M-63 -78Q-53 -90 -34 -106Q-17 -93 0 -77Q-23 -67 -49 -72Z',C.gold,.3,C.ink,.9);
        this.cut('M-56 -78Q-29 -72 -7 -77M-50 -82Q-42 -91 -34 -101M-39 -79L-34 -99M-27 -78L-33 -99M-15 -78L-31 -97',.95);
        this.line('M-58 -75Q-27 -68 -2 -76',C.ink,.9,.24);
        this.sleeve([-17,-58],[3,-43],[18,-36],9,6,3.9,C.red);
        this.cut('M-14 -56Q-3 -50 2 -40M-2 -40L12 -34',1.02);
        // Both hands lie on this handle; the torso, arms and tool move as one small stroke.
        this.line('M-89 39L50 -58',C.ink,2.5,.25);this.line('M-84 35L46 -55',C.gold,.7,.29);
        this.fill('M-90 34Q-99 36 -104 46L-104 51Q-94 52 -86 45L-82 39Z',C.ink,.28);
        this.group(18,-36,1,-.6,()=>{this.fill('M-4 -3Q2 -7 6 -3L9 2L5 5L1 3L-3 5L-6 1Z',skin,.33);this.line('M0 -1L4 2M-3 1L1 4',C.ink,.5,.26);});
        this.group(-36,2,1,-.65,()=>{this.fill('M-4 -4Q3 -6 7 -1L9 4L5 7L1 3L-3 4L-6 0Z',skin,.33);this.line('M0 -1L5 3M-3 1L1 5',C.ink,.5,.26);});
      });
    });}
    wheatField(){
      this.treeCrown(217,324,.84,false);this.distantBirds(577,176);
      this.ellipse(791,190,23,23,C.red,null,1,.18);
      this.line('M87 342Q281 309 467 335Q680 358 894 327',C.faint,1,.15);
      const rows=['M96 367Q388 330 867 371','M97 418Q415 369 887 425','M99 482Q414 431 879 497','M118 550Q449 505 865 565'];
      rows.forEach((d,i)=>{this.line(d,C.olive,1.4,.2);if(i>0)this.line(d.replaceAll(/\d+/g,n=>String(Number(n)+2)),C.gold,.6,.15);});
      for(let i=0;i<40;i++){
        const x=101+i*19.4,y=354+Math.sin(i*.15)*10;
        this.stalk(x,y,.35+i%3*.03,-.15+Math.sin(i*.6)*.14);
      }
      this.farmer(745,464,1.25);this.basket(840,466,.73,0);
      P.field.forEach(([x,y],i)=>{
        this.line(`M${x-31} ${y+7}q28 -6 59 0m-43 5h24`,C.gold,.8,.15);
        if(this.completed.has(i)){const g=this._growingIndex===i?this._growthValue:1;if(g>.008){for(let k=0;k<5;k++)this.reed(x+(k-2)*10,y+4-Math.abs(k-2)*2,.7+(k%2)*.13,C.olive,eased((g-k*.06)/.76));}else this.fill(`M${x-4} ${y+6}q3 -5 8 -1q-2 5 -8 1Z`,C.gold,.24);}
        else{this.fill(`M${x-4} ${y+6}q3 -5 8 -1q-2 5 -8 1Z`,C.gold,.24);}
      });
      for(let i=0;i<26;i++)this.stalk(136+i*28,558+Math.sin(i*.4)*10,.48+(i%3)*.07,-.4+Math.sin(i)*.2);
      this.line('M87 566q10 -7 21 -2M887 530l8 -10m-4 16l13 -6',C.olive,1,.15);
    }
    gardenPlant(x,y,i=0,s=1){this.group(x,y,s,0,()=>{
      const g=this._growingIndex===i?this._growthValue:1,stem=eased(Math.min(1,g/.58)),leaves=eased((g-.2)/.5),petals=eased((g-.48)/.52);
      if(g<.45){this.twig(0,8,.36*(1-g*1.5),-.1);this.twig(8,10,.26*(1-g*1.5),.5);}
      this.line(`M0 12Q${-10*stem} ${12-31*stem} ${2*stem} ${12-76*stem}`,C.olive,1.65,.25);
      if(leaves>.003){
        this.group(-3,-12,leaves,-.2*(1-leaves),()=>{this.fill('M0 0Q-34 4 -35 -22Q-11 -29 0 0Z',C.olive,.3);this.cut('M-3 -1Q-16 -13 -28 -18M-14 -10L-15 -19',.85);});
        this.group(-1,-29,leaves,.25*(1-leaves),()=>{this.fill('M0 0Q28 -23 34 1Q24 21 0 0Z',C.olive,.3);this.cut('M4 1Q14 -2 27 0',.8);});
      }
      if(petals>.003)this.blossom(2,12-78*stem,(.62+(i%2)*.12)*petals,i%3===1?C.gold:C.red);
      if(i%2===0&&g>.35){const branch=eased((g-.35)/.65);this.line(`M0 -32Q${-27*branch} ${-32-22*branch} ${-21*branch} ${-32-42*branch}`,C.olive,1.1,.25);if(petals>.1)this.blossom(-20,-76,.3*petals,C.red);}
    });}
    wateringCan(x,y,s=1){this.group(x,y,s,-.15-this.actionPulse()*.055,()=>{
      this.fill('M-23 -19Q1 -28 28 -17L29 18Q5 32 -23 17Z',C.blue,.3,C.ink,1.2);
      this.ellipse(2,-19,25,6,C.ink,null,1,.34);this.line('M26 -12Q60 -33 57 3Q54 18 29 16',C.ink,3,.32);this.line('M29 -9Q52 -24 51 1Q49 10 30 10',C.paper,1.7,.45);
      this.fill('M-20 3L-63 -9L-72 -2L-65 4L-23 20Z',C.blue,.3,C.ink,1.2);this.fill('M-74 -7L-83 7L-73 12L-65 -2Z',C.gold,.3,C.ink,.8);
      this.line('M-14 -22Q-12 -49 11 -45L20 -24',C.ink,2.7,.3);this.cut('M-10 -21Q-7 -40 9 -41',1.1);
      this.cut('M-17 13Q4 23 23 12M-15 -12L-15 3M-57 -5L-26 4',1.2);
    });}
    flowerGarden(){
      this.treeCrown(210,330,.87,false);this.distantBirds(551,161);
      this.line('M111 356Q360 340 580 358Q727 371 888 345',C.faint,1,.15);
      // A low wooden gate and climbing flowers, designed for this garden.
      for(let i=0;i<7;i++){
        const x=698+i*22,y=271+Math.sin(i*.7)*6;
        this.fill(`M${x} 398L${x-2} ${y}l6 -10l6 11L${x+9} 399Z`,C.gold,.25,C.ink,.7);
        this.cut(`M${x+3} 390L${x+2} ${y+11}`,1);
      }
      this.line('M689 310L850 313M692 357L852 359',C.ink,3.5,.25);
      this.line('M698 309L842 354M701 355L842 311',C.gold,3.5,.25);
      this.line('M687 401Q692 354 719 339Q744 304 731 273',C.olive,2,.25);
      for(let i=0;i<12;i++)this.twig(688+i%3*14,393-i*11,.24+i%2*.07,-.9+i%4*.6);
      this.blossom(721,326,.37,C.red);this.blossom(741,283,.3,C.red);this.blossom(697,368,.26,C.gold);
      this.line('M184 548Q458 574 700 548M193 554Q444 580 705 554',C.olive,1.1,.2);
      P.garden.forEach(([x,y],i)=>{
        this.line(`M${x-29} ${y+10}q25 -8 56 -1`,C.gold,.9,.18);
        if(this.completed.has(i))this.gardenPlant(x,y,i,.93+i%2*.06);
        else {this.twig(x,y+8,.36,-.1);this.twig(x+8,y+10,.26,.5);}
      });
      this.wateringCan(800,493,1.02);
      this.basket(709,455,.53,0);this.line('M694 451l-16 -31m20 28l-5 -36m10 33l8 -25',C.olive,1.4,.25);
      for(let i=0;i<7;i++)this.reed(132+i*13,431+Math.sin(i)*5,.4);
    }
    getPositions(){return P[this.scene];}
    hit(x,y){return P[this.scene].findIndex(([px,py],i)=>!this.completed.has(i)&&Math.hypot(x-px,y-(this.scene==='pond'?py-8:py))<48);}
    setScene(scene,completed=new Set()){this.effect=null;super.setScene(scene,completed);}
    buildMotionFrames(index){
      const started=performance.now(),keys=[0,.12,.28,.44,.6,.76,.9,1],plant=P[this.scene][index];
      const boxes=this.scene==='pond'?[{x:672,y:275,w:190,h:190}]:this.scene==='field'?[{x:600,y:314,w:275,h:238},{x:plant[0]-56,y:plant[1]-120,w:112,h:147}]:[{x:702,y:414,w:183,h:130},{x:plant[0]-56,y:plant[1]-122,w:112,h:149}];
      const patches=boxes.map(box=>({box,frames:[]}));
      try{
        for(const phase of keys){
          this._motionPhase=phase;this._growingIndex=this.scene==='pond'?-1:index;this._growthValue=eased((phase-.08)/.84);
          this.drawRawScene();this.blurCtx.clearRect(0,0,W,H);this.blurCtx.filter='blur(.65px)';this.blurCtx.drawImage(this.height,0,0);this.blurCtx.filter='none';
          const colors=this.ic.getImageData(0,0,W,H).data,heights=this.blurCtx.getImageData(0,0,W,H).data;
          for(const patch of patches){const frame=document.createElement('canvas');frame.width=patch.box.w;frame.height=patch.box.h;this.surface.render(colors,heights,this.params,frame.getContext('2d'),patch.box);patch.frames.push(frame);}
        }
      }finally{this._motionPhase=0;this._growingIndex=-1;this._growthValue=1;}
      this.renderStats.motionBuildMs=Math.round((performance.now()-started)*10)/10;return{keys,patches};
    }
    setCompleted(completed,index){
      const old=document.createElement('canvas');old.width=W;old.height=H;old.getContext('2d').drawImage(this.base,0,0);
      this.effect=null;this.completed=new Set(completed);this.count=this.completed.size;this.compose();
      if(this.paused||this.params.view!=='final'||this.params.material!=='woodcut')return;
      const [x,y]=P[this.scene][index],isLeaf=this.scene==='pond';
      const box=isLeaf?{x:x-36,y:y-51,w:73,h:80}:{x:x-56,y:y-120,w:112,h:144};
      let sprite=null;
      if(isLeaf){
        const before=old.getContext('2d').getImageData(box.x,box.y,box.w,box.h),after=this.bc.getImageData(box.x,box.y,box.w,box.h),pixels=before.data;
        for(let i=0;i<pixels.length;i+=4){const difference=Math.max(Math.abs(pixels[i]-after.data[i]),Math.abs(pixels[i+1]-after.data[i+1]),Math.abs(pixels[i+2]-after.data[i+2]));pixels[i+3]=difference>6?Math.min(255,difference*20):0;}
        sprite=document.createElement('canvas');sprite.width=box.w;sprite.height=box.h;sprite.getContext('2d').putImageData(before,0,0);
      }
      const frames=this.buildMotionFrames(index);
      this.effect={old,sprite,box,index,start:this.time,duration:isLeaf?2.35:this.scene==='field'?2.1:2.55,kind:isLeaf?'gather':'grow',x,y,...frames};
      this.ripples.push({x,y,start:this.time});this.paint();
    }
    paint(){
      if(!this.base||!this.ctx)return;const c=this.ctx;c.drawImage(this.base,0,0);if(this.params.view!=='final')return;
      c.save();
      const effect=this.effect;
      if(effect){
        const age=this.paused?1:(this.time-effect.start)/effect.duration;
        if(age>=1){this.effect=null;this.canvas.dispatchEvent(new CustomEvent('paper-motion-end',{detail:{scene:this.scene,index:effect.index}}));}
        else{
          let j=0;while(j<effect.keys.length-2&&age>effect.keys[j+1])j++;const blend=smooth((age-effect.keys[j])/(effect.keys[j+1]-effect.keys[j]));
          for(const patch of effect.patches){c.drawImage(patch.frames[j],patch.box.x,patch.box.y);c.globalAlpha=blend;c.drawImage(patch.frames[j+1],patch.box.x,patch.box.y);c.globalAlpha=1;}
          if(effect.kind==='gather'){
            const basketFade=eased((age-.91)/.09);c.drawImage(effect.old,779,394,84,65,779,394,84,65);
            if(basketFade>0){c.globalAlpha=basketFade;c.drawImage(this.base,779,394,84,65,779,394,84,65);c.globalAlpha=1;}
            const drift=eased((age-.1)/.53),drop=eased((age-.76)/.24),slot=this.count-1,tx=819+(-20+slot%3*17)*.98,ty=421+(-4-Math.floor(slot/3)*9)*.98;
            const handX=808,handY=398,px=age<.76?mix(effect.x,handX,drift):mix(handX,tx,drop),py=age<.76?mix(effect.y,handY,drift)-Math.sin(drift*Math.PI)*38:mix(handY,ty,drop);
            const sourceScale=.7+(effect.index%3)*.08,finalScale=.27*.98/sourceScale,s=age<.76?mix(1,.5,drift):mix(.5,finalScale,drop);
            const turn=(-.9+slot*.5)-(-1.2+effect.index*.73),angle=Math.sin(drift*Math.PI)*.22+turn*drop;
            c.save();c.translate(px,py);c.rotate(angle);c.scale(s,s);c.globalAlpha=1-basketFade;c.drawImage(effect.sprite,-36,-51);c.restore();
          }
        }
      }
      if(this.scene==='pond'){
        c.lineWidth=.8;
        for(let i=0;i<4;i++){
          const x=298+i*123,y=437+(i%3)*39,phase=this.time*.25+i*1.7;
          c.strokeStyle=`rgba(67,84,83,${.10+Math.sin(phase)*.025})`;c.beginPath();c.ellipse(x+Math.sin(phase)*.8,y,13+Math.sin(phase)*1.4,1.6,0,0,Math.PI*1.5);c.stroke();
        }
      }else if(this.scene==='garden'&&this.count>0){
        const first=[...this.completed][0]??0,[rootX,rootY]=P.garden[first],cycle=(this.time%14)/14,flight=cycle<.55?0:Math.sin((cycle-.55)/.45*Math.PI);
        const x=rootX+2+flight*22,y=rootY-68-flight*17,wing=flight>.02?2.2+Math.sin(this.time*14)*1.6:.8+Math.sin(this.time*.7)*.15;
        c.strokeStyle='rgba(76,78,56,.5)';c.lineWidth=.9;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-wing-3,y-7,x-1,y-1);c.moveTo(x,y);c.quadraticCurveTo(x+wing+3,y-7,x+1,y-1);c.stroke();
      }
      this.ripples=this.ripples.filter(r=>this.time-r.start<2.8);
      if(this.scene==='pond')for(const r of this.ripples){const t=(this.time-r.start)/2.8;c.strokeStyle=`rgba(80,91,78,${(1-t)*(1-t)*.23})`;c.lineWidth=.65;for(let ring=0;ring<2;ring++){c.beginPath();c.ellipse(r.x,r.y+5,7+t*25+ring*6,1.8+t*6+ring*1.1,0,.25+ring*.8,Math.PI*1.5+ring*.3);c.stroke();}}
      c.restore();this.renderStats.frames++;
    }
    setParams(next){this.effect=null;super.setParams(next);}
    snapshot(){const held=this.effect;this.effect=null;const result=super.snapshot();this.effect=held;this.paint();return result;}
  }
  window.PaperRelief=WoodcutWorld;
})();
