/* Original tea-shed illustration. Ink, shallow relief and state share paper coordinates. */
(function(root){
  'use strict';
  const clamp=v=>Math.max(0,Math.min(1,v));
  const ease=v=>{v=clamp(v);return v*v*v*(v*(v*6-15)+10);};
  const mix=(a,b,u)=>a+(b-a)*u;
  const C={ink:'#293a35',deep:'#1d2b28',paper:'#f4f0e3',sage:'#657664',olive:'#939b7c',pale:'#c5c9b1',gold:'#be9a53',bark:'#806549',clay:'#aa694b',clayLight:'#c18a60',clayShade:'#7f4e3d',red:'#a24836'};
  function sample(time,fedAt=null){
    const age=fedAt===null?-1:Math.max(0,time-fedAt),feed=age<0?0:ease(age/1.85);
    const fire=age<0?.1:mix(.1,.92,ease((age-1.45)/2.35));
    const heat=age<0?0:ease((age-2.15)/9.6),steam=clamp((heat-.68)/.32);
    const stage=age<0?0:age<3.8?1:heat<.32?2:heat<.995?3:4;
    return{time,age,feed,fire,heat,steam,stage,fed:fedAt!==null,logs:fedAt===null?3:2,boiling:heat>=.995};
  }
  class Model{
    constructor(){this.reset();}
    reset(){this.time=0;this.fedAt=null;this.paused=false;}
    add(){if(this.fedAt!==null)return false;this.fedAt=this.time;this.paused=false;return true;}
    advance(dt){if(!this.paused)this.time+=Math.max(0,Math.min(.1,dt));return this.snapshot();}
    snapshot(){return sample(this.time,this.fedAt);}
    finish(){if(this.fedAt!==null)this.time=this.fedAt+12;}
  }
  const Base=root.PaperRelief||class{};
  class TeaScene extends Base{
    // The page owns a single clock; the inherited research animation stays off.
    frame(){}
    constructor(canvas){
      super(canvas);this.paused=true;this.visible=false;
      Object.assign(this.params,{relief:24,grain:60,light:315});
      this.cache=new Map();this.patch=document.createElement('canvas');
      for(const count of [3,2]){
        this.drawStill(count);const ink=this.ic.getImageData(0,0,1000,630),height=this.hc.getImageData(0,0,1000,630);
        this.blurHeight();const base=document.createElement('canvas');base.width=1000;base.height=630;
        this.surface.render(ink.data,this.blurCtx.getImageData(0,0,1000,630).data,this.params,base.getContext('2d'));
        this.cache.set(count,{ink,height,base});
      }
      this.render(sample(0));
    }
    drawRawScene(){this.drawStill(3);this.drawDynamics(sample(0));}
    blurHeight(){this.blurCtx.clearRect(0,0,1000,630);this.blurCtx.filter='blur(.6px)';this.blurCtx.drawImage(this.height,0,0);this.blurCtx.filter='none';}
    clip(path,draw,rule='nonzero'){for(const c of [this.ic,this.hc]){c.save();c.clip(path,rule);}draw();for(const c of [this.ic,this.hc])c.restore();}
    drawStill(count){
      this.ic.fillStyle='#f7f4e9';this.ic.fillRect(0,0,1000,630);this.hc.fillStyle='#000';this.hc.fillRect(0,0,1000,630);
      this.landscape();this.floor();this.pavilion();this.table();this.stove();this.kettle();this.woodPile(count);this.foreground();
    }
    landscape(){
      this.fill('M100 326Q142 298 178 304Q224 270 266 294Q307 272 356 306L372 338L114 354Z','#d7dac8',.06);
      this.fill('M104 349Q172 329 225 336Q300 310 347 333Q395 315 421 339L409 373L106 382Z','#c4cbb2',.08);
      this.line('M110 331Q145 304 181 309M225 302Q248 292 265 299M294 307Q325 293 350 313',C.olive,.65,.08);
      this.line('M116 374Q187 357 263 366Q324 359 382 368',C.olive,.8,.12);
      this.fill('M119 403Q179 380 254 393L302 415L240 441Q177 428 117 443Z','#c0c6a9',.09);
      this.line('M122 432Q167 420 212 432M167 443Q209 437 246 447',C.olive,.6,.1);
      this.fill('M687 293Q747 282 819 311L866 338L860 350Q775 316 690 321Z','#d8dbc6',.06);
      this.line('M700 310Q775 300 857 336',C.olive,.55,.08);
      for(const [x,y,s] of [[140,402,.9],[164,404,.68],[117,412,.65]])this.fern(x,y,s);
      this.line('M754 472q26 -3 46 2m-34 5l20 -1M166 461q26 -3 43 1',C.pale,.8,.08);
    }
    fern(x,y,s){this.group(x,y,s,-.1,()=>{
      for(const [dx,dy] of [[-30,-53],[-14,-79],[3,-90],[22,-73],[35,-45]]){
        this.line(`M0 3Q${dx*.6} ${dy*.35} ${dx} ${dy}`,C.sage,1.15,.2);
        for(let i=1;i<5;i++){const u=i/5,px=dx*u,py=dy*u;this.fill(`M${px} ${py}q-14 -3 -17 -13q13 0 17 13m0 0q9 -10 17 -10q-1 10 -17 10Z`,i%2?C.sage:C.olive,.18);}
      }
    });}
    pavilion(){
      // A light bamboo awning, seen obliquely; its open right edge leaves room for steam.
      this.group(0,-35,1,0,()=>{
      this.fill('M180 205L373 118L650 169L445 244Z','#cfbf8a',.17,C.olive,.75);
      this.fill('M180 205L445 244L650 169L648 180L446 256L177 216Z','#536453',.23);
      this.fill('M185 207L446 244L445 249L182 213Z','#8d9470',.2);
      for(let i=0;i<29;i++){
        const u=i/28,a=[mix(188,371,u),mix(202,120,u)],b=[mix(446,644,u),mix(240,170,u)];
        this.line(`M${a}Q${mix(a[0],b[0],.5)} ${mix(a[1],b[1],.5)+2} ${b}`,i%3?'#9b946b':'#f0e5c2',i%3?.75:1.1,.14);
      }
      this.line('M214 196L474 231M258 175L520 213M305 154L566 195',C.bark,1.2,.2);
      this.line('M183 207L446 246L646 174M375 119L648 168',C.ink,1.65,.24);
      this.cut('M187 208L441 242M451 245L629 179',.85);
      });
      this.fill('M229 189L238 190L240 434L229 440Z',C.bark,.22,C.ink,.65);
      this.fill('M233 192L237 193L237 432L234 434Z','#b7a47b',.23);
      this.line('M230 274L238 273M230 337L239 336M230 400L238 398',C.ink,.75,.2);
      this.cut('M232 238L232 261M233 282L233 322M233 349L234 390',.65);
      this.fill('M616 159L622 157L625 348L618 350Z',C.bark,.18);
      this.line('M619 211L620 269M620 277L621 329',C.paper,.6,.08);
      this.line('M238 378L420 343M239 388L419 353',C.bark,1.7,.2);
      this.line('M237 381L418 346',C.paper,.75,.08);
      // A small tea tag and a tied, recently folded rain cloth.
      this.line('M266 184L268 217',C.bark,.7,.15);
      this.fill('M258 214L280 216L277 253L256 250Z',C.red,.2);
      for(const [ctx,height] of [[this.ic,false],[this.hc,true]]){ctx.save();ctx.fillStyle=height?'rgb(20,20,20)':C.paper;ctx.font='19px KaiTi,SimSun,serif';ctx.textAlign='center';ctx.fillText('茶',267,239);ctx.restore();}
      this.line('M396 202l1 10',C.ink,.6,.15);
      this.fill('M383 209L404 211L410 267Q398 264 387 271L380 214Z','#afb7a3',.14);
      this.cut('M386 215L391 262M394 215L402 258',.85);
      this.line('M384 265q10 -5 23 -1',C.sage,.6,.1);
    }
    table(){
      this.fill('M684 366L696 369L690 444L683 445Z',C.bark,.18,C.ink,.6);
      this.fill('M801 364L811 362L810 428L803 432Z',C.bark,.17,C.ink,.6);
      this.fill('M667 341L826 358L798 387L640 365Z','#987c54',.22,C.ink,.8);
      this.fill('M640 365L798 387L798 396L639 374Z','#665c43',.22);
      this.fill('M798 387L826 358L826 367L798 396Z','#747453',.2);
      this.line('M647 363L796 383L820 359M669 343L810 359M662 354L808 370',C.paper,.8,.08);
      this.line('M681 357L748 366M755 369L782 372M674 360L707 364',C.bark,.6,.13);
      this.ellipse(738,367,36,10,C.sage,null,1,.16,-.05);
      this.ellipse(738,365,33,8,C.gold,C.ink,.7,.18,-.05);
      this.ellipse(738,365,29,6,'#c9b278',null,1,.15);
      this.group(739,350,1,0,()=>{
        this.fill('M-17 -4L-13 13Q0 20 13 12L17 -4Z',C.paper,.22,C.ink,.8);
        this.fill('M10 -3L15 -3L12 12L7 14Z','#c1c6b0',.2);
        this.ellipse(0,-4,17,6,C.sage,C.ink,.7,.2);this.ellipse(0,-4,13,3.5,'#c5c6a8',null,1,.18);
        this.line('M-10 2Q-5 5 0 3M-11 8q7 4 14 1',C.sage,.6,.15);
      });
      this.fill('M779 351L805 351L798 376L774 372Z','#d6cbb0',.1);
      this.line('M782 356L798 359M780 362L795 365M778 367L790 370',C.bark,.55,.1);
      this.line('M767 337L800 345M766 339L798 347',C.bark,1,.18);
    }
    floor(){
      this.fill('M254 403L345 382L349 383L457 358L589 378L595 377L693 394L778 442L669 479L663 478L524 526L420 502L415 503L266 465Z','#d8d5bf',.09);
      this.fill('M266 465L524 526L778 442L777 449L525 535L265 474Z','#aab09b',.12);
      this.line('M271 465L525 524L765 443',C.paper,1.4,.05);
      this.line('M317 390L561 478L559 514M388 376L636 457M466 373L697 435M287 435L530 392M364 489L677 405',C.olive,.8,.1);
      this.line('M317 392L399 422M409 426L498 459M578 469L630 451M401 496L436 503M605 414L651 399',C.paper,.7,.06);
      this.line('M355 412l-10 -3l-1 -5M401 473l9 5l-1 7M699 432l6 7l-5 2M630 484l-7 1M477 508l9 2',C.sage,.55,.1);
      this.line('M345 410l-13 -2M407 483l-4 4M700 443l-9 2M574 500l-11 4',C.paper,.55,.05);
      this.fill('M292 444Q320 437 349 444Q363 450 345 454Q315 459 289 451Z','#c0c7b5',.06);
      this.line('M295 450Q320 456 346 450M655 456q20 -9 45 -10',C.paper,.75,.05);
      this.ellipse(551,464,96,22,'#a6aa8f',null,1,.08,-.07);
      this.line('M451 476Q529 493 624 468',C.sage,.75,.12);
    }
    stove(){
      this.fill('M452 359C453 407 461 444 483 461Q550 490 613 463Q640 444 649 359Z',C.clay,.23,C.ink,1.2);
      this.fill('M592 374L646 360Q642 426 612 459Q594 471 560 474L580 451Z',C.clayShade,.22);
      this.fill('M460 376Q464 429 488 450L500 456Q481 409 482 381Z',C.clayLight,.23);
      this.ellipse(550,359,99,30,C.clayLight,C.ink,1.2,.22);
      this.ellipse(550,357,85,22,C.deep,C.ink,.8,.2);
      this.ellipse(550,356,76,17,'#5b5a43',null,1,.16);
      this.line('M454 364Q544 401 645 365M461 378Q482 388 501 390M600 386L635 375',C.paper,.85,.08);
      this.line('M464 401L469 419M473 428L479 440M611 419L620 394M604 438L601 448',C.paper,.65,.08);
      this.line('M477 443Q493 460 514 464M584 469Q601 465 610 454',C.ink,.7,.16);
      this.line('M475 395l1 4M482 410l2 3M492 437l2 3M601 400l-1 4M600 448l-3 3M490 457l8 2',C.clayShade,.6,.15);
      this.fill('M507 452L507 422C507 383 592 381 594 420L594 452Q552 469 507 452Z',C.clayShade,.21,C.ink,.8);
      this.fill('M514 448L514 422C514 390 586 391 587 422L587 448Q551 459 514 448Z',C.deep,.18);
      this.line('M511 450L511 422Q512 398 532 395M555 393Q583 397 590 419',C.clayLight,1.1,.22);
      this.fill('M520 461L582 463L579 469L523 468Z',C.deep,.17);
      this.line('M530 463L530 466M543 464L543 467M557 465L557 468M571 464L571 467',C.clayLight,1,.2);
      // Three iron rests keep the kettle clear of the earthen rim.
      this.fill('M474 349L492 342L500 354L482 362Z',C.ink,.25);
      this.fill('M595 346L611 350L606 363L591 357Z',C.ink,.25);
      this.fill('M537 371L544 355L553 355L558 371Z',C.ink,.23);
      this.cut('M477 350L486 348M598 349L607 352M542 367L545 357',.65);
    }
    kettle(){this.group(548,301,1,0,()=>{
      // The iron bow is behind the body; the wrapped grip follows its arch.
      this.line('M-55 -15C-78 -132 84 -133 61 -10',C.deep,11,.27);
      this.line('M-58 -18C-76 -127 79 -128 62 -16','#788477',1.2,.14);
      this.line('M-31 -92Q3 -111 35 -92',C.gold,13,.26);
      for(let i=0;i<14;i++){
        const u=i/13,x=mix(-31,35,u),y=-92-38*u*(1-u);
        this.line(`M${x-1.7} ${y-5.3}l${mix(-2.4,3.2,u)} 10.6`,i%3?C.bark:C.paper,.85,.16);
      }
      this.line('M-28 -95Q2 -109 31 -95',C.paper,.8,.08);
      this.fill('M56 -12C82 -10 87 -29 98 -43L114 -51L119 -43Q108 -37 107 -18Q104 9 67 21Z','#3a4c45',.26,C.deep,1);
      this.fill('M77 6Q101 -5 101 -24Q105 -37 116 -45L119 -43Q108 -34 107 -18Q105 9 67 21Z','#526258',.24);
      this.line('M71 4Q91 -5 94 -25Q99 -40 110 -45',C.paper,.8,.08);
      this.line('M81 12Q103 2 104 -19',C.deep,.7,.22);
      this.ellipse(114,-47,8,4.4,C.deep,C.ink,.8,.25,-.38);
      this.line('M108 -49q7 -5 13 -1',C.paper,.65,.08);
      this.fill('M-56 -27Q-77 -12 -72 15Q-68 47 -35 57Q4 66 45 53Q70 42 73 13Q75 -9 56 -27Z','#334740',.28,C.deep,1.2);
      this.fill('M19 -27Q49 -21 55 10Q58 39 35 55Q65 47 72 17Q78 -8 56 -27Z','#223830',.27);
      this.fill('M-56 -24Q-72 -6 -65 19Q-61 41 -40 48L-47 24Q-54 -4 -35 -25Z','#536259',.26);
      this.line('M-62 -10Q-67 10 -56 30M-51 39q7 7 18 10',C.paper,.85,.08);
      this.line('M-59 -6Q-63 10 -56 23M-50 35l4 5',C.paper,.55,.08);
      this.line('M-60 19Q-8 38 62 20M-52 34Q0 52 53 36M-37 49Q6 60 36 49','#657369',.65,.16);
      this.line('M-42 25L-38 30M-22 32L-18 36M8 37L12 40M34 32L39 34M-31 44L-27 47M20 48L26 47',C.paper,.5,.08);
      for(let row=0;row<6;row++)for(let col=0;col<10;col++){
        const x=-42+col*9+(row%2?4:0),y=-12+row*10;
        if(x*x/2704+(y-10)**2/2500>.95)continue;
        this.line(`M${x} ${y}q1.2 -1 2.1 -.3`,(row*7+col)%4?'#66766a':'#1c322b',.55,.19);
      }
      this.ellipse(0,-26,58,12,C.deep,C.ink,.9,.24);
      this.ellipse(0,-28,49,7,'#768273',null,1,.16);
      this.ellipse(0,-28,45,5,'#87917b',null,1,.12);
      this.line('M-53 -23Q0 -6 55 -24',C.paper,.85,.08);
      for(const [x,y] of [[-57,-12],[64,-11]]){this.ellipse(x,y,6,8,C.deep,C.ink,.6,.26);this.ellipse(x,y,2,3,C.gold,null,1,.22);}
    });}
    lid(state){const jiggle=state.boiling?Math.sin(state.time*15)*.45:0;this.group(548,269+jiggle,1,state.boiling?Math.sin(state.time*13)*.005:0,()=>{
      this.fill('M-49 4Q-39 -12 -4 -13Q28 -14 48 3L52 8Q0 23 -52 8Z','#405349',.26,C.deep,.8);
      this.fill('M15 -11Q39 -8 48 3L52 8L37 10Q33 -1 15 -11Z','#2a3c33',.25);
      this.line('M-47 7Q0 20 49 7M-34 -2Q-10 -13 18 -6',C.paper,.8,.08);
      this.fill('M-8 -14L-7 -23Q0 -29 7 -22L8 -14Z',C.deep,.28,C.ink,.6);
      this.ellipse(0,-23,7,3.2,C.ink,null,1,.27);this.line('M-4 -24q4 -2 7 0',C.paper,.65,.08);
      this.ellipse(24,1,1.4,.9,C.deep,null,1,.15);
    });}
    log(x,y,angle=0,scale=1){this.group(x,y,scale,angle,()=>{
      this.fill('M-32 -8Q-3 -12 33 -8L36 7Q2 12 -32 9Z',C.bark,.22,C.ink,.7);
      this.fill('M-30 2Q0 8 35 2L36 7Q0 13 -31 9Z','#65523f',.2);
      this.line('M-27 -6L-3 -6L7 -8M13 -6L28 -5M-22 -1L-5 0M-1 1L23 0M-12 6L11 6',C.paper,.65,.08);
      this.line('M-20 -3L-4 -1M4 -4L17 -3M17 4L31 2',C.deep,.6,.15);
      this.ellipse(-32,0,7.3,9.1,'#c5ac79',C.ink,.7,.2);
      this.ellipse(-32,0,4.8,6.4,null,C.bark,.65,.15);this.ellipse(-32,-.2,2.3,3.3,null,C.bark,.55,.15);
      this.line('M-32 -8L-31 -3M-37 3L-33 2M-31 3L-30 8',C.bark,.55,.15);
    });}
    woodPile(count){
      this.line('M284 480Q330 492 389 480',C.sage,.75,.1);
      this.log(320,475,-.21);this.log(355,477,.12,.98);
      if(count===3)this.log(346,459,-.15);
      this.line('M290 465l-18 -6M297 480l-17 -1M367 487l19 0M375 467l10 -3',C.bark,1,.15);
      this.line('M298 460l-8 -7M381 478l8 1',C.paper,.6,.08);
    }
    foreground(){
      this.line('M251 480l10 3M276 485l16 4M637 475l15 -3M650 478l12 -3M457 522l-12 0',C.olive,.65,.1);
      this.fill('M778 475Q785 447 812 438Q799 458 785 471Q804 452 830 459Q816 476 786 480Z',C.sage,.17);
      this.cut('M783 474L807 445M789 476L821 463',.8);
      this.fill('M824 482Q834 465 851 467Q844 482 829 487Z',C.olive,.16);this.cut('M829 483L846 470',.65);
      this.line('M724 502q22 -4 44 0M167 476q17 -1 27 3',C.pale,.7,.08);
    }
    fire(state){this.group(550,432,1,0,()=>{
      const opening=new Path2D('M-36 16L-36 -10C-36 -42 36 -41 37 -10L37 16Q0 27 -36 16Z');
      this.clip(opening,()=>{
        this.fill('M-36 23L-36 -17Q0 -36 37 -17L37 23Z','#382f25',.16);
        if(state.fed&&state.age>=1.85)this.log(2,8,-.06,.65);
        for(let i=0;i<5;i++){
          const x=-25+i*12.5,h=2+state.fire**1.25*(26+7*Math.sin(state.time*3+i*1.7)),tip=x+Math.sin(state.time*2.8+i)*4,w=[6,9,10,8,6][i];
          this.fill(`M${x-w} 17Q${x-w*.7} ${17-h*.4} ${tip} ${17-h}Q${x+w*.8} ${17-h*.3} ${x+w} 16Z`,i%2?'#bc6537':'#d28b3b',.12);
          this.fill(`M${x-3} 18Q${x-5} ${17-h*.3} ${x+1} ${17-h*.56}Q${x+1} ${17-h*.15} ${x+4} 18Z`,'#e0b65a',.1);
        }
        this.fill('M-38 15L-12 11L19 18L37 11L38 26L-36 26Z','#443c2b',.2);
        this.line('M-30 15L-9 16M-2 19L13 21M20 17L29 15','#c36036',1.6,.12);
        this.line('M-27 17L-17 17M0 20L6 21M24 17L27 16',C.paper,.6,.08);
      });
    });}
    feeding(state){if(!state.fed||state.age>=1.85)return;
      const u=state.feed,x=(1-u)**2*346+2*(1-u)*u*517+u*u*552,y=(1-u)**2*459+2*(1-u)*u*510+u*u*440;
      const mask=new Path2D('M0 0H1000V630H0ZM452 359C453 407 461 444 483 461Q550 490 613 463Q640 444 649 359ZM514 448L514 422C514 390 586 391 587 422L587 448Q551 459 514 448Z');
      this.clip(mask,()=>this.log(x,y,mix(-.15,-.06,u),mix(1,.65,u)),'evenodd');
    }
    steam(state){if(state.steam<=0)return;
      const origin=[663,253];
      for(let i=0;i<3;i++){
        const life=(state.time*.145+i*.34)%1,envelope=Math.sin(Math.PI*life)**1.2*state.steam;
        const length=48+77*life,points=[];
        for(let j=0;j<=16;j++){const u=j/16,drift=9*Math.sin(u*5.4-state.time*.8+i*.8)*u;points.push([origin[0]+u*(13+9*i)+drift,origin[1]-u*length]);}
        const path=points.map((q,j)=>(j?'L':'M')+q.join(' ')).join(' ');
        const left=[],right=[];
        for(let j=0;j<points.length;j++){const u=j/(points.length-1),w=(.55+4*Math.sin(Math.PI*u))*envelope;left.push([points[j][0]-w,points[j][1]]);right.push([points[j][0]+w,points[j][1]]);}
        this.fill(left.map((q,j)=>(j?'L':'M')+q.join(' ')).join(' ')+right.reverse().map(q=>'L'+q.join(' ')).join(' ')+'Z',`rgba(160,177,151,${.24*envelope})`,.022);
        this.line(path,`rgba(131,154,130,${.48*envelope})`,.7,.025);
        if(i===1)this.line(points.slice(0,9).map((q,j)=>(j?'L':'M')+(q[0]-2)+' '+q[1]).join(' '),`rgba(249,247,234,${.7*envelope})`,1.5,.015);
      }
      if(state.boiling)this.line(`M572 265q${Math.sin(state.time)*2} -8 2 -12`,'rgba(172,183,159,.32)',.65,.025);
    }
    drip(state){for(const start of [1.8,7.4]){const u=(state.time-start)/.75;if(u<0||u>1)continue;const y=176+u*u*205;this.fill(`M180 ${y-3}q-2 3 0 4q2 -1 0 -4Z`,'rgba(127,150,127,.55)',.04);}}
    drawDynamics(state){this.fire(state);this.lid(state);this.feeding(state);this.steam(state);this.drip(state);}
    render(state){
      if(!this.cache)return;const start=performance.now(),cached=this.cache.get(state.logs);
      this.ic.putImageData(cached.ink,0,0);this.hc.putImageData(cached.height,0,0);this.drawDynamics(state);this.blurHeight();
      const ink=this.ic.getImageData(0,0,1000,630).data,height=this.blurCtx.getImageData(0,0,1000,630).data;
      this.ctx.drawImage(cached.base,0,0);
      const regions=[{x:468,y:235,w:147,h:61},{x:500,y:384,w:99,h:82}];
      if((state.time>1.8&&state.time<2.55)||(state.time>7.4&&state.time<8.15))regions.push({x:173,y:169,w:15,h:220});
      if(state.steam>0)regions.push({x:633,y:115,w:103,h:153});
      if(state.fed&&state.age<1.85)regions.push({x:278,y:426,w:316,h:86});
      for(const r of regions){this.patch.width=r.w;this.patch.height=r.h;this.surface.render(ink,height,this.params,this.patch.getContext('2d'),r);this.ctx.drawImage(this.patch,r.x,r.y);}
      this.state=state;this.renderMs=performance.now()-start;
    }
    snapshot(){return this.canvas.toDataURL('image/png');}
  }
  root.TeaWorld={Model,sample,TeaScene};
})(typeof window!=='undefined'?window:globalThis);
