/* Original local mechanism study. Canvas color + height fields; no external runtime. */
(() => {
  'use strict';
  const W=1000,H=630;
  const palette={ink:'#383c31',olive:'#797d53',red:'#a1503e',gold:'#af9562',blue:'#77888a',pale:'#c5c4ac',paper:'#f6f0e2'};
  const positions={pond:[[355,430],[495,475],[623,498],[755,421],[830,503],[439,552]],field:[[343,405],[473,417],[596,432],[303,487],[433,506],[564,520]],garden:[[335,422],[465,404],[585,429],[317,513],[474,514],[616,516]]};
  function seeded(seed){return()=>{seed=(Math.imul(1664525,seed)+1013904223)>>>0;return seed/4294967296;};}
  class PaperRelief {
    constructor(canvas){
      this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});
      this.ink=document.createElement('canvas');this.height=document.createElement('canvas');this.blur=document.createElement('canvas');this.base=document.createElement('canvas');
      for(const c of [this.ink,this.height,this.blur,this.base]){c.width=W;c.height=H;}
      this.ic=this.ink.getContext('2d',{willReadFrequently:true});this.hc=this.height.getContext('2d');this.bc=this.base.getContext('2d',{willReadFrequently:true});this.blurCtx=this.blur.getContext('2d',{willReadFrequently:true});
      this.params={relief:55,grain:45,light:315,view:'final'};this.scene='pond';this.completed=new Set();this.count=0;this.paused=matchMedia('(prefers-reduced-motion: reduce)').matches;this.visible=true;this.time=0;this.last=0;this.lastPaint=0;this.ripples=[];this.renderStats={frames:0,shadeMs:0};
      const random=seeded(20261115);this.noise=new Float32Array(W*H);this.coarse=new Float32Array(W*H);
      const gridW=253,gridH=160,grid=Float32Array.from({length:gridW*gridH},()=>random());
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){
        const at=y*W+x,gx=Math.floor(x/4),gy=Math.floor(y/4),u=(x%4)/4,v=(y%4)/4;
        this.noise[at]=random()-.5;
        this.coarse[at]=((grid[gy*gridW+gx]*(1-u)+grid[gy*gridW+gx+1]*u)*(1-v)+(grid[(gy+1)*gridW+gx]*(1-u)+grid[(gy+1)*gridW+gx+1]*u)*v)-.5;
      }
      this.compose();
      this.frame=this.frame.bind(this);requestAnimationFrame(this.frame);
      document.addEventListener('visibilitychange',()=>{this.last=0;this.visible=!document.hidden;});
      if('IntersectionObserver' in window)new IntersectionObserver(entries=>{this.inView=entries[0].isIntersecting;this.last=0;},{rootMargin:'100px'}).observe(canvas);
    }
    path(d,fill=null,stroke=palette.ink,width=1.5,height=.5){
      const p=new Path2D(d);const level=Math.round(height*235);
      for(const [ctx,isHeight] of [[this.ic,false],[this.hc,true]]){
        ctx.lineWidth=width;ctx.lineJoin='round';ctx.lineCap='round';
        if(fill){ctx.fillStyle=isHeight?`rgb(${level},${level},${level})`:fill;ctx.fill(p);}
        if(stroke){ctx.strokeStyle=isHeight?`rgb(${level},${level},${level})`:stroke;ctx.stroke(p);}
      }
    }
    ellipse(x,y,rx,ry,fill,stroke=palette.ink,width=1,height=.4,rotation=0){
      const p=new Path2D();p.ellipse(x,y,rx,ry,rotation,0,Math.PI*2);this.path(p,fill,stroke,width,height);
    }
    group(x,y,scale,rotate,fn){for(const c of[this.ic,this.hc]){c.save();c.translate(x,y);c.scale(scale,scale);c.rotate(rotate);}fn();for(const c of[this.ic,this.hc])c.restore();}
    leaf(x,y,size,angle,color=palette.olive){this.group(x,y,size,angle,()=>{this.path('M0 0 Q-15 -28 0 -47 Q17 -23 0 0Z',color,null,1,.45);this.path('M0 -3 Q-3 -20 0 -40',null,palette.paper,1.1,.66);});}
    grasses(x,y,scale=1,green=true){this.group(x,y,scale,0,()=>{const col=green?palette.olive:palette.gold;for(let i=0;i<7;i++){const xx=(i-3)*4,top=-22-Math.sin(i*2)*11;this.path(`M0 4 Q${xx*.5} ${top*.4} ${xx} ${top}`,null,col,1.5,.35);if(green&&i%2===0)this.path(`M${xx*.7} ${top*.7}q-12 -6 -12 -15q10 3 12 15`,col,null,1,.35);}});}
    lotus(x,y,scale=1,color=palette.red){this.group(x,y,scale,0,()=>{for(let i=0;i<9;i++){const a=i*Math.PI*2/9;this.group(0,0,1,a,()=>this.path('M0 2 Q-13 -9 0 -28 Q14 -9 0 2Z',color,palette.paper,1,.68));}this.ellipse(0,0,7,5,palette.gold,palette.paper,.8,.75);for(let i=-3;i<=3;i+=3)this.ellipse(i,-1,.7,.7,palette.ink,null,1,.85);});}
    pad(x,y,r,angle=0){this.group(x,y,1,angle,()=>{this.path(`M0 0 L${r*.85} ${-r*.45} A${r} ${r*.58} 0 1 0 ${r*.95} ${r*.28}Z`,palette.olive,null,1,.3);for(let i=0;i<5;i++){const a=1.1+i*.86;this.path(`M0 0 L${Math.cos(a)*r*.8} ${Math.sin(a)*r*.4}`,null,'#ddd6bd',.8,.45);}});}
    tree(x,y,scale=1){
      this.group(x,y,scale,0,()=>{
        this.path('M-7 0 Q-8 -69 4 -159 Q4 -190 -17 -215 L-12 -220 Q14 -198 12 -164 Q24 -193 50 -207 L51 -203 Q21 -179 13 -144 Q6 -88 7 0Z',palette.ink,null,1,.4);
        for(const branch of['M7 -103Q-19 -156 -52 -163','M9 -145Q-14 -184 -41 -193','M5 -72Q36 -120 65 -122','M-1 -137Q-45 -140 -74 -124','M12 -162Q43 -170 71 -157'])this.path(branch,null,palette.ink,2.5,.48);
        const random=seeded(79);for(let i=0;i<98;i++){const a=random()*Math.PI*2,r=Math.sqrt(random()),xx=Math.cos(a)*r*92,yy=-170+Math.sin(a)*r*69;this.leaf(xx,yy,.2+random()*.18,(random()-.5)*4,palette.olive);}
        for(let i=0;i<15;i++)this.path(`M${-40+i*6} ${4+Math.sin(i)*3}q-5 -9 -2 -15`,null,palette.olive,1,.3);
      });
    }
    bird(x,y,s=1){this.group(x,y,s,0,()=>this.path('M-7 -2 Q-4 -4 0 1 Q3 -3 7 -2',null,palette.ink,.9,.2));}
    mountains(){
      this.path('M80 277Q135 263 174 223Q195 201 231 241Q257 267 286 236Q322 198 353 235Q390 274 444 258Q468 250 484 268',null,palette.pale,1.2,.1);
      this.path('M102 281Q135 264 164 255M183 249L205 226L224 244M286 255Q319 227 343 249M367 264L385 255L402 266',null,palette.pale,.8,.1);
      for(let i=0;i<5;i++)this.bird(534+i*22,180-Math.sin(i)*8,.9);
    }
    boat(x,y,scale=1){this.group(x,y,scale,0,()=>{
      this.path('M-112 5Q-20 35 113 -4Q67 47 -65 39Q-92 32 -112 5Z',palette.ink,palette.ink,1.4,.48);
      this.path('M-112 5Q-11 -15 113 -4Q7 32 -112 5Z',palette.gold,palette.ink,1.2,.55);
      for(let i=-80;i<83;i+=14)this.path(`M${i} 4l7 14`,null,palette.paper,2.5,.72);
      this.path('M-102 10Q-14 34 102 1',null,palette.red,5,.73);
      this.path('M-91 9Q-12 29 94 2',null,palette.paper,1.3,.86);
      this.path('M-22 -5 L-19 -47 L-2 -62 L17 -52 L28 -15 L10 -7 L3 -33 L-2 -12Z',palette.red,palette.ink,1,.63);
      this.ellipse(0,-65,8,12,palette.gold,palette.ink,1,.6);
      this.path('M-25 -67L8 -99L31 -63Z',palette.gold,palette.ink,1.6,.8);
      this.path('M-21 -67L24 -64M-9 -72L9 -93L13 -74M-3 -69L7 -83',null,palette.paper,1.6,.92);
      this.path('M13 -48Q30 -43 48 -25L69 -43',null,palette.ink,6,.68);
      this.path('M17 -49Q31 -44 50 -28',null,palette.gold,3,.76);
      this.path('M-16 -43L-35 -16L-17 2',null,palette.ink,7,.68);
      this.path('M-4 -12L-16 6M9 -12L26 5',null,palette.ink,6,.63);
      this.path('M68 -80L79 60',null,palette.ink,3,.55);
      this.path('M75 34L91 66L86 71L76 45Z',palette.ink,null,1,.55);
      const n=this.scene==='pond'?this.count:0;for(let i=0;i<n;i++)this.lotus(-62+(i%3)*15,8-Math.floor(i/3)*11,.28);
      this.path('M-94 48Q-19 60 70 48M-48 59Q-2 65 34 60',null,palette.blue,1,.2);
    });}
    hut(x,y,s=1){this.group(x,y,s,0,()=>{this.path('M-46 0L-46 -42L26 -42L26 0Z','#c8bb96',palette.ink,1,.4);this.path('M-61 -41L-13 -75L43 -39Z',palette.gold,palette.ink,1.2,.55);for(let i=0;i<8;i++)this.path(`M${-48+i*10} -40L${-13+i*4} ${-67+i*4}`,null,palette.paper,1,.7);this.path('M-14 0V-28H3V0',palette.ink,null,1,.3);this.path('M13 -24H23V-13H13Z',palette.paper,palette.ink,1,.4);this.path('M-61 1L49 1',null,palette.olive,1.8,.2);});}
    farmer(x,y,s=1){this.group(x,y,s,0,()=>{
      this.path('M-7 -39L-13 -11L-20 19M4 -39L11 -13L9 19',null,palette.ink,8,.6);
      this.path('M-12 -81L5 -84L17 -44L-12 -37L-24 -61Z',palette.red,palette.ink,1,.65);
      this.path('M-13 -69L-37 -48L-55 -33M9 -68L27 -40L15 -19',null,palette.ink,5.5,.7);
      this.ellipse(-6,-91,8,11,palette.gold,palette.ink,1,.6);this.path('M-31 -89L-9 -119L17 -91Z',palette.gold,palette.ink,1.5,.7);
      this.path('M-26 -90L9 -93M-14 -94L-9 -111',null,palette.paper,1.4,.9);
      this.path('M-75 10L38 -101',null,palette.ink,2.6,.5);this.path('M-78 6L-86 10L-89 19L-76 18Z',palette.ink,null,1,.5);
    });}
    seal(){for(const [ctx,high] of [[this.ic,false],[this.hc,true]]){ctx.save();ctx.strokeStyle=high?'rgb(90,90,90)':palette.red;ctx.fillStyle=ctx.strokeStyle;ctx.lineWidth=1;ctx.strokeRect(872,104,24,29);ctx.font='19px SimSun,serif';ctx.fillText('生',874,126);ctx.restore();}}
    compose(){
      const started=performance.now();this.ic.fillStyle=palette.paper;this.ic.fillRect(0,0,W,H);this.hc.fillStyle='black';this.hc.fillRect(0,0,W,H);
      this.mountains();this.seal();
      if(this.scene==='pond')this.drawPond();else if(this.scene==='field')this.drawField();else this.drawGarden();
      this.blurCtx.clearRect(0,0,W,H);this.blurCtx.filter='blur(1.15px)';this.blurCtx.drawImage(this.height,0,0);this.blurCtx.filter='none';
      this.colors=this.ic.getImageData(0,0,W,H).data;this.heights=this.blurCtx.getImageData(0,0,W,H).data;
      this.renderStats.composeMs=Math.round((performance.now()-started)*10)/10;this.shade();
    }
    drawPond(){
      this.path('M85 425Q160 362 259 369Q322 370 349 326Q391 264 481 282',null,palette.olive,2,.25);
      this.path('M91 438Q176 383 275 389Q330 385 365 339',null,palette.gold,1,.25);
      this.tree(213,367,.85);this.hut(398,287,.52);
      this.path('M671 287Q766 308 874 270M696 298Q778 320 889 280',null,palette.pale,1.6,.2);
      for(let i=0;i<15;i++)this.grasses(115+i*11,416+Math.sin(i*.4)*15,.4+i%3*.08);
      for(let i=0;i<7;i++)this.grasses(784+i*17,290-Math.sin(i)*5,.5);
      this.ellipse(720,192,25,25,palette.red,null,1,.22);
      for(let i=0;i<3;i++)this.path(`M${702+i*4} ${225+i*7}h${36-i*10}`,null,palette.red,1,.25);
      this.boat(581,366,.94);
      for(let i=0;i<16;i++){const x=324+(i*73)%540,y=397+Math.floor(i/6)*66+Math.sin(i)*18;this.path(`M${x} ${y}q17 -3 34 0m-24 5h21`,null,palette.blue,.8,.16);}
      positions.pond.forEach(([x,y],i)=>{this.pad(x+12,y+14,26+(i%2)*8,i*.9);if(!this.completed.has(i)){this.path(`M${x} ${y+8}q5 -8 -2 -19`,null,palette.olive,2,.43);this.lotus(x-2,y-18,.64+i%2*.13);}});
      this.grasses(160,522,.8);this.grasses(181,532,.65);this.grasses(202,523,.6);this.grasses(149,529,.5);
    }
    drawField(){
      this.tree(206,342,.82);this.hut(389,291,.55);this.ellipse(770,183,25,25,palette.gold,null,1,.25);
      const lines=['M102 352Q398 316 870 349','M92 381Q467 346 911 390','M87 431Q416 385 899 447','M88 493Q425 450 884 513','M105 552Q440 516 855 568'];
      for(const d of lines)this.path(d,null,palette.olive,1.8,.28);
      for(let i=0;i<16;i++){const x=102+i*44;this.grasses(x,355+Math.sin(i*.8)*5,.33);}
      for(let i=0;i<27;i++){const x=95+i*29;this.path(`M${x} ${555+Math.sin(i*.5)*12}l-5 10m9 -9l-3 8`,null,palette.gold,.8,.3);}
      this.farmer(765,453,1.08);
      positions.field.forEach(([x,y],i)=>{
        this.path(`M${x-34} ${y+7}q30 -9 62 0m-52 5h42`,null,palette.gold,1,.26);
        if(this.completed.has(i)){for(let j=-1;j<=1;j++)this.grasses(x+j*14,y+5-Math.abs(j)*3,.76,true);}else this.ellipse(x,y+5,4,1.5,palette.gold,null,1,.2);
      });
      this.path('M653 483l13 38h43l10 -38z',palette.gold,palette.ink,1,.5);
      this.path('M651 483Q685 470 721 483Q687 495 651 483Z',palette.olive,palette.ink,1,.6);
      for(let i=0;i<5;i++)this.path(`M${662+i*10} 488l3 28`,null,palette.paper,1,.7);
    }
    drawGarden(){
      this.tree(207,352,.8);this.ellipse(741,168,22,22,palette.gold,null,1,.2);
      this.path('M103 370Q393 341 886 376M90 554Q440 565 881 545',null,palette.olive,1.7,.3);
      this.path('M735 398V260Q783 183 832 260V398M746 395V264Q784 204 821 264V395',null,palette.gold,4,.42);
      for(let i=0;i<7;i++)this.path(`M737 ${268+i*17}H831`,null,palette.gold,1,.45);
      for(let i=0;i<4;i++)this.path(`M${752+i*20} 249V386`,null,palette.gold,1,.45);
      for(let i=0;i<12;i++)this.leaf(739+i%3*10,365-i*10,.24+i%2*.08,-.9+(i%3)*.9);
      for(let i=0;i<6;i++)this.lotus(831-i%2*5,309-i*13,.2,palette.red);
      for(let i=0;i<5;i++)this.grasses(160+i*18,418+i%2*12,.5);
      positions.garden.forEach(([x,y],i)=>{
        this.ellipse(x,y+17,35,7,palette.pale,null,1,.2);
        if(this.completed.has(i)){
          this.path(`M${x} ${y+14}q-6 -26 0 -${61+i%2*12}`,null,palette.olive,2.6,.46);
          this.leaf(x,y-3,.65,-.8);this.leaf(x,y-17,.55,.9);
          this.lotus(x,y-45-i%2*12,.7,i%2?palette.gold:palette.red);
        }else{this.path(`M${x-5} ${y+7}q5 -8 10 0l-5 7Z`,palette.gold,null,1,.4);}
      });
      this.path('M680 474l9 37h50l11 -37z',palette.gold,palette.ink,1,.5);this.ellipse(715,474,35,6,palette.pale,palette.ink,1,.6);
      this.path('M699 473Q704 438 717 425M714 469Q731 436 728 417',null,palette.olive,2,.5);this.leaf(711,453,.43,-.7);this.leaf(727,439,.5,.7);
      this.path('M813 442q31 5 28 30l-36 8q-14 -28 8 -38m28 7q19 -14 20 1q0 14 -19 15',null,palette.ink,2,.5);
      this.path('M809 469l-26 11l-9 -9l12 -6l25 -6',palette.blue,palette.ink,1,.5);
      for(let i=0;i<9;i++)this.path(`M${246+i*69} 565h18`,null,palette.gold,.9,.3);
    }
    shade(){
      const start=performance.now(),params=this.params,out=this.bc.createImageData(W,H),dst=out.data,c=this.colors,h=this.heights;
      const angle=params.light*Math.PI/180,lx=Math.cos(angle)*.82,ly=Math.sin(angle)*.82,lz=.72,depth=params.relief/100*7,grain=params.grain/100;
      const view=params.view;
      for(let y=0;y<H;y++)for(let x=0;x<W;x++){
        const q=y*W+x,i=q*4,li=(y*W+Math.max(0,x-1))*4,ri=(y*W+Math.min(W-1,x+1))*4,ti=(Math.max(0,y-1)*W+x)*4,bi=(Math.min(H-1,y+1)*W+x)*4;
        const dx=(h[ri]-h[li])/255,dy=(h[bi]-h[ti])/255;
        let nx=-dx*depth,ny=-dy*depth,nz=1;const length=Math.hypot(nx,ny,nz);nx/=length;ny/=length;nz/=length;
        const fiber=(this.noise[q]*.56+this.coarse[q]*1.5)*grain;
        if(view==='height'){
          const hh=30+h[i]*.86+fiber*22;dst[i]=dst[i+1]=dst[i+2]=hh;
        }else if(view==='normal'){
          dst[i]=(nx*.5+.5)*255;dst[i+1]=(ny*.5+.5)*255;dst[i+2]=(nz*.5+.5)*255;
        }else if(view==='ink'){
          dst[i]=c[i];dst[i+1]=c[i+1];dst[i+2]=c[i+2];
        }else{
          const diffuse=Math.max(0,nx*lx+ny*ly+nz*lz),lighting=.68+diffuse*.44;
          const rough=1+fiber*.1,inkWear=c[i]<180?1+Math.max(0,this.noise[q]-.12)*grain*.65:1;
          dst[i]=c[i]*lighting*rough*inkWear;dst[i+1]=c[i+1]*lighting*rough*inkWear;dst[i+2]=c[i+2]*lighting*rough*inkWear;
        }
        dst[i+3]=255;
      }
      this.bc.putImageData(out,0,0);this.renderStats.shadeMs=Math.round((performance.now()-start)*10)/10;this.paint();
    }
    paint(){
      const c=this.ctx;c.drawImage(this.base,0,0);if(this.params.view!=='final')return;
      c.save();c.lineWidth=.85;
      if(this.scene==='pond'){
        c.strokeStyle='rgba(83,101,95,.26)';for(let i=0;i<7;i++){
          const x=327+i*77,y=365+(i%3)*57,phase=this.time*.75+i;
          c.beginPath();c.ellipse(x,y,13+Math.sin(phase)*5,2.8,0,0,Math.PI*1.75);c.stroke();
        }
      }
      this.ripples=this.ripples.filter(r=>this.time-r.start<1.6);
      for(const r of this.ripples){const t=(this.time-r.start)/1.6;c.strokeStyle=`rgba(124,91,61,${(1-t)*.55})`;c.beginPath();c.ellipse(r.x,r.y,7+t*40,2+t*11,0,0,Math.PI*2);c.stroke();}
      c.restore();this.renderStats.frames++;
    }
    frame(now){
      if(this.last){const dt=Math.min(.1,(now-this.last)/1000);if(!this.paused&&this.visible&&this.inView!==false)this.time+=dt;}
      this.last=now;if(!this.paused&&this.visible&&this.inView!==false&&now-this.lastPaint>40){this.paint();this.lastPaint=now;}requestAnimationFrame(this.frame);
    }
    setParams(next){Object.assign(this.params,next);this.shade();}
    setScene(scene,completed=new Set()){this.scene=scene;this.completed=new Set(completed);this.count=this.completed.size;this.ripples=[];this.compose();}
    setCompleted(completed,index){const p=positions[this.scene][index];this.completed=new Set(completed);this.count=this.completed.size;this.ripples.push({x:p[0],y:p[1],start:this.time});this.compose();}
    hit(x,y){return positions[this.scene].findIndex(([px,py],i)=>!this.completed.has(i)&&Math.hypot(x-px,y-(this.scene==='pond'?py-16:py))<55);}
    getPositions(){return positions[this.scene];}
    snapshot(){this.paint();return this.canvas.toDataURL('image/png');}
  }
  window.PaperRelief=PaperRelief;
})();
