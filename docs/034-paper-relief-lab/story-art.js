/* Four authored static story plates. The shared landscape is our creek design.
   Gestures, gaze, leaf ownership and basket contact are drawn for each event. */
(() => {
  'use strict';
  const Base=window.PaperRelief;
  const K={ink:'#1b2528',blue:'#244f76',shade:'#18354d',paper:'#f7f2e6',skin:'#d3b58b',shadow:'#b38b67',red:'#c52940',coat:'#d4a13c',coatShade:'#b5802c',hair:'#202d2e'};
  // Scene-specific pigment choices. Other research scenes keep their palette.
  const landscapeInk=new Map([
    ['#242b28','#202b2b'],['#656b58','#59634d'],['#92977b','#b69b4b'],
    ['#ab8749','#d7982d'],['#a33e30','#c52940'],['#b0b09a','#bfc3a0'],
    ['#9c9d7c','#c0af7c'],['#eeeae0','#f7f2e6'],['#8c703e','#a67826']
  ]);
  class StoryPlate extends Base {
    fill(d,color,...args){super.fill(d,landscapeInk.get(color)||color,...args);}
    line(d,color,...args){super.line(d,landscapeInk.get(color)||color,...args);}
    setShot(shot){this.shot=Math.max(1,Math.min(4,Number(shot)||1));this.completed=new Set();this.count=0;this.effect=null;this.compose();}
    getStoryCamera(){return this.shot===4?{scale:1.3,x:-235,y:-114}:{scale:1,x:0,y:0};}
    drawRawScene(){
      const camera=this.getStoryCamera();
      if(camera.scale===1){super.drawRawScene();return;}
      this.ic.fillStyle='#f7f4ed';this.ic.fillRect(0,0,1000,630);
      this.hc.fillStyle='#000';this.hc.fillRect(0,0,1000,630);
      this.group(camera.x,camera.y,camera.scale,0,()=>this.creek());
    }
    picker(...args){if(!this._backgroundOnly)super.picker(...args);}
    creekBasket(...args){if(!this._backgroundOnly)super.creekBasket(...args);}
    getPositions(){return this._backgroundOnly?[]:super.getPositions();}
    mirror(direction,draw){for(const c of [this.ic,this.hc]){c.save();c.scale(direction,1);}draw();for(const c of [this.ic,this.hc])c.restore();}
    face(x,y,s,direction,tilt,older=false){this.group(x,y,s,tilt,()=>this.mirror(direction,()=>{
      this.fill('M-8 6L3 9L5 21Q-2 24 -11 18Z',K.shadow,.27);
      this.fill('M-11 -12C-10 -22 2 -25 9 -18Q14 -13 12 -5L15 -1Q18 2 13 3L12 8Q10 15 3 14Q-5 13 -10 7Q-15 -2 -11 -12Z',K.skin,.3);
      this.fill('M-10 -5Q-8 5 -1 9L4 14Q-5 13 -10 7Q-13 1 -10 -5Z','#c19c77',.27);
      this.fill('M-11 -10Q-12 -24 2 -25Q14 -24 13 -13L9 -10Q0 -16 -7 -5L-8 3L-12 1Z',K.hair,.3);
      if(older){
        this.fill('M-15 -15C-16 -23 -8 -28 0 -27Q11 -27 15 -18L16 -15Q3 -18 -10 -11Z',K.hair,.3);
        this.cut('M-11 -19Q0 -24 10 -19',.75);
        this.line('M-7 -9L-8 -3M-5 -10L-6 -4',K.paper,.7,.08);
        this.line('M4 5L7 7M2 8L5 10M5 -7L10 -6',K.shadow,.65,.2);
      }else{
        this.fill('M-12 -13Q-19 -4 -14 12L-8 13L-7 -5Z',K.hair,.3);
        this.ellipse(-14,8,5,6,K.hair,null,1,.28);
        this.line('M-15 7Q-13 4 -11 8',K.paper,.6,.08);
      }
      this.ellipse(-7,2,2.7,4,K.shadow,null,1,.26);
      this.line('M-8 0Q-4 -2 -6 4M4 -6Q8 -7 11 -5M5 -3Q8 -4 10 -2',K.ink,.6,.22);
      this.ellipse(8,-2,.65,.7,K.ink,null,1,.25);
      this.line((this.shot||1)>=3?'M12 7Q9 10 5 8':'M12 8Q9 9 6 8',K.ink,.55,.22);
      this.line('M10 3L12 4M2 4L4 5',K.shadow,.55,.2);
      this.line('M-3 12L1 14',K.shadow,.65,.2);
    }));}
    hand(x,y,s=1,angle=0,grip=false){this.group(x,y,s,angle,()=>{
      const shape=grip==='pinch'?'M-4 -5Q1 -7 5 -4L12 -2Q14 -1 12 1L6 1L4 4Q8 4 9 7Q9 10 6 8L2 7Q-2 7 -3 3L-5 0Z':grip==='support'?'M-5 -3Q0 -5 5 -2L13 -3Q16 -2 13 0L7 4Q1 6 -4 2Z':grip?'M-4 -5Q0 -7 5 -4Q12 -2 11 3L9 7Q7 9 5 6L4 3Q3 7 0 5L-2 1L-5 1Z':'M-4 -5Q1 -7 5 -3L9 2Q12 6 11 8L8 5L8 11Q6 13 5 8L4 5L4 12Q2 14 1 9L0 5L-1 9Q-3 9 -3 4L-5 0Z';
      this.fill(shape,K.skin,.3);
      this.line(grip==='support'?'M0 1L8 0':grip==='pinch'?'M1 -1L6 0M2 5L5 6':grip?'M1 -2Q6 -1 7 3M0 1L2 4':'M1 0L5 4M5 1L8 5',K.shadow,.55,.2);
    });}
    shoes(pose){
      this.fill('M-25 -4Q-15 -8 -9 -2L-5 2L-6 5Q-18 8 -31 5L-32 2Z',K.ink,.3);
      this.fill(pose===4?'M9 -4L20 -5Q25 0 31 2L31 5Q18 8 6 5L5 2Z':'M8 -4Q15 -7 20 -3L23 2L22 5Q10 8 -1 4L-1 1Z',K.ink,.3);
      this.cut('M-28 3Q-19 5 -10 2M10 3Q20 5 27 3',.85);
    }
    father(x,y,s,pose){this.group(x,y,s,0,()=>{
      if(pose===2){this.fatherBending();return;}
      const offering=pose===4;
      this.fill('M-18 -70Q-5 -75 10 -66L14 -42Q13 -28 17 -5L6 -3L-1 -35L-5 -51L-11 -30L-12 -3L-25 -2Q-24 -20 -22 -34Z',K.ink,.3);
      this.cut('M-13 -55Q-18 -42 -17 -30M3 -43L7 -20M-18 -13L-19 -6',.95);this.shoes(pose);
      this.pivot(-6,-68,offering?.045:pose===3?-.03:-.025,()=>{
      // The far arm sits behind the torso. Waiting keeps the hands relaxed.
      if(!offering){
        this.fill('M5 -132Q17 -130 20 -112L23 -91Q24 -78 12 -63L7 -69L14 -94L8 -114Z',K.shade,.3);
        this.hand(12,-67,.83,.4,true);
      }
      this.fill('M-18 -140Q-8 -145 3 -139Q12 -134 13 -124L12 -94L10 -67Q-5 -61 -23 -69L-25 -96Q-30 -121 -23 -134Z',K.blue,.3);
      this.fill('M-24 -125Q-20 -102 -12 -90L-9 -67L-23 -70L-25 -96Z',K.shade,.3);
      this.cut('M-18 -129Q-11 -119 -10 -111M-20 -105Q-14 -91 -12 -77M-19 -71Q-4 -67 7 -72M3 -119L6 -103',1);
      this.line('M-14 -110L-9 -103M-15 -102L-8 -91M-10 -88L-5 -80',K.paper,.55,.08);
      this.line('M-18 -74Q-6 -69 6 -73M2 -129Q7 -119 7 -111M-23 -115L-22 -108',K.paper,.6,.08);
      this.face(-5,-155,.94,offering?1:-1,pose===3?.37:offering?.2:.04,true);
      this.fill('M-17 -139Q-5 -133 4 -140L7 -134Q-6 -129 -20 -134Z',K.red,.3);
      this.fill('M-14 -132Q-18 -120 -17 -111L-11 -114L-8 -131Z',K.red,.3);
      this.cut('M-15 -136Q-6 -133 2 -136M-13 -127L-15 -117',.65);
      if(pose===1){
        this.fill('M-22 -130Q-32 -128 -32 -111L-31 -86L-27 -65L-19 -66L-21 -90L-18 -109Z',K.blue,.3);
        this.cut('M-27 -121L-28 -108M-27 -97L-25 -77',.9);this.hand(-24,-64,.85,.1);
      }else if(pose===3){
        this.fill('M-23 -130Q-34 -128 -38 -115L-42 -109L-51 -123L-58 -119Q-50 -99 -43 -97Q-36 -96 -29 -107L-20 -118Z',K.blue,.3);
        this.cut('M-29 -122L-35 -112M-43 -104L-51 -116',.9);this.hand(-54,-123,.82,-2.8);
      }
      });
    });}
    fatherBending(){
      // Bent knees support the torso. The forearm and gaze converge on the leaf.
      this.fill('M-24 -54Q-38 -47 -42 -28L-42 -6L-30 -4L-27 -24L-8 -32L7 -19L20 -2L31 -6L20 -33Q6 -53 -8 -56Z',K.ink,.3);
      this.fill('M-43 -6L-31 -5L-26 1Q-35 7 -51 4L-52 1Z',K.ink,.3);
      this.fill('M18 -5L29 -8L37 0L36 4Q24 6 14 2Z',K.ink,.3);
      this.cut('M-36 -31Q-31 -42 -20 -45M-28 -26L-34 -18M6 -30L18 -13M-46 1L-32 0M20 1L32 1',.95);
      this.fill('M-35 -98Q-46 -89 -48 -72L-47 -50L-38 -29L-29 -34L-35 -53L-34 -75L-28 -88Z',K.shade,.3);
      this.cut('M-42 -83L-43 -67M-43 -48L-37 -35',.85);
      this.hand(-34,-31,.9,-.15,true);
      this.fill('M-31 -110Q-17 -111 -6 -102L10 -81L9 -62L-8 -49Q-21 -47 -34 -57L-42 -81Q-44 -100 -31 -110Z',K.blue,.3);
      this.fill('M-39 -91Q-35 -73 -23 -63L-20 -52L-34 -58L-41 -78Z',K.shade,.3);
      this.cut('M-31 -99Q-23 -94 -19 -84M-32 -77Q-26 -65 -18 -60M-24 -55Q-10 -52 4 -64',1);
      this.face(-7,-120,.94,1,.4,true);
      this.fill('M-22 -111Q-11 -103 1 -109L4 -102Q-9 -97 -24 -105Z',K.red,.3);
      this.fill('M-17 -102L-21 -87L-15 -89L-11 -102Z',K.red,.3);
      this.fill('M-2 -99Q7 -97 14 -83L27 -64L48 -45L43 -38Q23 -48 14 -59L0 -76Q-9 -90 -2 -99Z',K.blue,.3);
      this.cut('M3 -91L11 -77M21 -62Q32 -49 42 -46M43 -44L40 -40',1);
      this.hand(47,-42,.9,.45,'pinch');
      this.creekLeaf(56,-27,.38,.12,K.red,0);
    }
    daughter(x,y,s,offering=false){this.group(x,y,s,0,()=>{
      this.fill('M-12 -72L8 -73L14 -37L20 -4L9 -1L0 -36L-5 -50L-12 -29L-17 -1L-29 -2L-24 -37Z',K.ink,.3);
      this.fill('M-29 -4L-17 -3L-10 2L-11 5Q-22 8 -34 4L-35 1Z',K.ink,.3);
      this.fill('M9 -4L19 -5Q24 0 31 2L31 5Q20 8 7 5L5 1Z',K.ink,.3);
      this.cut('M-31 2L-18 2M11 3L26 3M-17 -48L-21 -29M5 -38L10 -20',.9);
      // A small travel bag makes her arrival legible without an extra caption.
      this.fill('M13 -111L33 -104L38 -70L17 -68Z','#465b57',.25,K.ink,.8);
      this.line('M20 -107Q20 -124 29 -118L31 -104',K.ink,1.8,.25);
      this.fill('M-15 -141Q-5 -146 5 -140Q15 -136 16 -126L19 -104L21 -66Q1 -58 -22 -67L-17 -103Q-25 -127 -15 -141Z',K.coat,.3,K.ink,.7);
      this.fill('M11 -133Q13 -104 7 -65L21 -68L19 -105Z',K.coatShade,.3);
      this.cut('M-10 -132L-3 -111L7 -135M-4 -108L-5 -71M-17 -71Q-2 -66 14 -72M-13 -84L-6 -82',1);
      this.line('M5 -105L9 -78M11 -92L14 -77',K.paper,.6,.08);
      this.face(-5,-156,.94,offering?-1:1,offering?-.25:.3,false);
      this.line('M-16 -72Q-1 -68 14 -74M-12 -116L-14 -101M10 -118L13 -104',K.paper,.7,.08);
      for(const y of [-105,-94,-83])this.ellipse(-3,y,.85,.85,'#8e682a',null,1,.2);
      this.fill('M-16 -140Q-3 -134 6 -140L9 -133Q-2 -126 -18 -133Z','#a23941',.3);
      if(!offering){
        this.fill('M7 -132Q15 -134 23 -120L32 -112L44 -133L51 -129Q44 -105 35 -99Q28 -97 19 -104L5 -116Z',K.coat,.3,K.ink,.65);
        this.cut('M13 -125L23 -112M34 -107L45 -125',.9);
        this.hand(47,-133,.82,-.5,'pinch');this.creekLeaf(53,-142,.44,.1,K.red,0);
        this.fill('M-19 -130Q-29 -126 -29 -110L-31 -88L-25 -77L-18 -80L-21 -92L-17 -111Z',K.coat,.3,K.ink,.65);
        this.hand(-25,-78,.8,.1);
      }else{
        this.fill('M12 -129Q23 -124 25 -104L20 -82L12 -79L15 -105L5 -117Z',K.coatShade,.3);
        this.hand(13,-81,.8,.15);
      }
    });}
    offeringContact(){
      // World-space contact anchors are shared by the handle, grip and leaf.
      this.fill('M716 303Q727 304 732 324L745 349L767 363L763 372Q739 364 731 353L716 331Q706 312 716 303Z',K.blue,.3);
      this.cut('M719 313Q724 330 735 347M741 353L759 365',1.05);
      this.hand(767,365,.94,.3,true);
      this.fill('M697 310Q687 321 702 351L720 388L755 422L762 416L735 381L721 346L711 318Z',K.shade,.3);
      this.cut('M702 326L711 345M722 381L749 413',.9);this.hand(759,421,.9,0,'support');
      this.fill('M830 304Q821 307 815 328L805 352L789 376L796 382Q816 364 824 350L837 326Q841 310 830 304Z',K.coat,.3,K.ink,.7);
      this.cut('M829 316L818 344M809 359L797 375',.95);
      this.hand(790,379,.9,.8,'pinch');this.creekLeaf(784,392,.37,-.3,K.red,0);
    }
    creek(){
      this.ic.fillStyle='#f7f4ed';this.ic.fillRect(0,0,1000,630);
      // Distant bank is quiet; the foreground toe gives the stream a near edge.
      this.fill('M92 331Q163 299 224 307Q283 286 359 316L389 329Q265 316 193 329L92 340Z','#e3e4d2',.09);
      this.line('M102 327Q169 304 222 312M250 309Q290 303 324 315','#c8cdb5',.65,.1);
      this.fill('M80 581Q151 539 205 548L232 565Q177 566 117 594Z','#d9ddbc',.12);
      this.line('M91 585Q149 551 209 559','#a2ad83',.85,.14);
      this._backgroundOnly=true;
      try{super.creek();}finally{this._backgroundOnly=false;}
      this.fill('M305 339Q442 224 610 278Q689 301 747 352L740 356Q689 306 609 284Q445 231 310 345Z','#d8c9a0',.23);
      this.line('M308 339Q443 227 610 280Q685 302 743 352','#eee5ce',.95,.12);
      this.fill('M786 426Q837 415 889 425L905 439Q866 446 841 451Q806 456 777 444Z','#b0b09a',.16);
      this.line('M789 448Q839 460 900 441', '#656b58',.95,.18);
      this.line('M111 443Q170 419 239 424M704 451Q745 460 780 449','#7b8464',1,.17);
      this.line('M121 441L135 436M147 434L163 431M184 428L201 428M218 427L229 427M800 452L815 454M833 454L850 451M868 448L883 445',K.paper,.85,.08);
      this.line('M145 408l5 -3m19 3l5 -2m49 -8l5 -1M850 422l6 -2m18 9l4 -1','#8b9771',.75,.15);
      this.fill('M118 566Q125 559 134 564L140 570L126 573Z','#a5ae8a',.17);
      this.cut('M122 566L132 565',.8);
      const shot=this.shot||1;
      // Old foreground hotspots do not appear: one leaf carries the event.
      if(shot===1){this.groundContact(747,444,31);this.groundContact(817,449,25);this.father(752,439,1.08,1);this.creekBasket(817,421,.88,0);}
      if(shot===2){this.groundContact(735,446,47);this.groundContact(820,449,25);this.father(746,443,1.08,2);this.creekBasket(820,421,.88,0);}
      if(shot===3){
        this.groundContact(556,291,26);this.daughter(561,286,.91,false);
        this.line('M532 290Q562 289 591 299','#a99a69',1.3,.22);
        this.groundContact(747,444,31);this.father(752,439,1.08,3);
        this.creekBasket(817,421,.88,0);this.creekLeaf(811,418,.25,-.2,K.red,0);
      }
      if(shot===4){
        this.groundContact(710,446,31);this.groundContact(836,447,33);
        this.father(714,440,1.08,4);this.daughter(843,441,1.08,true);
        this.creekBasket(774,396,.87,0);this.creekLeaf(769,394,.24,-.3,K.red,0);
        this.offeringContact();
      }
    }
    groundContact(x,y,width){
      this.ellipse(x,y,width,2.2,'#a3ad89',null,1,.12);
      this.line(`M${x-width*.7} ${y+3}q${width*.4} 2 ${width*.8} 0`,'#8e9b75',.65,.12);
    }
  }
  window.PaperRelief=StoryPlate;
})();
