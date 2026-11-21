/* Creek static plate, drawn specifically for our original composition.
   Shape design is separate from paper shading. No reference pixels are sampled. */
(() => {
  'use strict';
  const Base=window.PaperRelief;
  const ink='#242b28',soft='#656b58',sage='#92977b',paper='#eeeae0',blue='#425b60',red='#a33e30',gold='#ab8749';
  class CreekPlate extends Base {
    picker(x,y,s=1){this.group(x,y,s,0,()=>{
      // Back leg bears weight; the near knee opens a clear wedge of paper.
      this.fill('M-31 -27C-39 -20 -48 -7 -49 2L-54 18L-43 21C-38 11 -37 5 -31 2L-17 -5L-5 -17Z',ink,.3);
      this.fill('M-17 -24C-7 -25 1 -19 7 -10L20 5Q24 14 24 24L14 26L6 10L-12 1L-27 -9Z','#303b37',.3);
      this.fill('M-54 17Q-49 15 -43 20L-39 23Q-47 29 -63 27L-64 24Z',ink,.3);
      this.fill('M14 23L24 21Q28 25 35 28L35 31Q24 33 11 30L10 28Z',ink,.3);
      this.cut('M-59 24Q-50 25 -44 22M15 28Q24 30 31 29',.85);
      this.cut('M-40 -9Q-36 -15 -30 -18M-44 6L-47 17M-17 -12Q-5 -7 2 1M11 9L18 22',.9);
      this.line('M-34 -5L-31 -9M-28 -8L-24 -11M-10 -4L-5 -1',soft,.6,.2);
      // Far sleeve and resting hand disappear behind the near thigh.
      this.fill('M-38 -65Q-52 -58 -55 -43L-48 -27L-35 -16L-29 -22L-41 -37Q-43 -45 -34 -51Z','#344a4c',.3);
      this.cut('M-47 -54Q-50 -44 -46 -38M-45 -31L-38 -26',.9);
      this.fill('M-36 -24L-28 -21Q-25 -19 -22 -13L-23 -10L-28 -15L-27 -9L-30 -8L-34 -15L-39 -18Z','#b4a080',.3);
      this.line('M-33 -18L-29 -12',ink,.55,.2);
      // Shirt: a sloping shoulder, compressed waist and a hanging curved hem.
      this.fill('M-30 -78Q-20 -81 -10 -73L-1 -64Q4 -53 0 -42L-5 -28Q-16 -21 -34 -27L-42 -32C-41 -41 -49 -49 -44 -62Q-41 -72 -30 -78Z',blue,.3);
      this.fill('M-42 -61Q-40 -47 -31 -41L-24 -29L-37 -30Q-43 -40 -45 -49Z','#344c50',.3);
      this.cut('M-37 -67Q-31 -63 -28 -55M-37 -49Q-28 -42 -23 -32M-31 -28Q-20 -25 -8 -31M-17 -66Q-9 -62 -6 -52',1.05);
      this.line('M-35 -66Q-31 -61 -29 -57M-34 -47L-27 -37M-29 -47L-22 -36M-24 -46L-18 -38M-15 -60L-10 -54',paper,.52,.08);
      this.line('M-39 -32Q-26 -24 -9 -30',ink,.8,.2);
      // Neck and face are a continuous profile looking towards the basket.
      this.fill('M-22 -85L-11 -89L-10 -78L-4 -74Q-12 -68 -24 -75L-27 -78Z','#b4a080',.3);
      this.fill('M-26 -103Q-21 -112 -12 -109Q-3 -106 -3 -99L-1 -93L3 -89Q3 -87 -1 -86L-2 -80Q-5 -76 -10 -78L-21 -84Q-28 -91 -26 -103Z','#c0ac8c',.3);
      this.fill('M-26 -102Q-23 -114 -13 -113Q0 -112 2 -104L-1 -100Q-10 -104 -19 -98L-20 -91L-24 -92Z',ink,.3);
      this.fill('M-22 -112Q-11 -118 -1 -108L3 -103Q0 -101 -3 -102Q-14 -107 -26 -101L-29 -104Z','#35413b',.3);
      this.line('M-25 -106Q-16 -112 -6 -106',paper,.75,.08);
      this.ellipse(-20,-94,2.4,3.7,'#b4a080',null,1,.3);
      this.line('M-21 -95Q-18 -97 -19 -92M-8 -96L-4 -95M-7 -93L-5 -93M-1 -84L-5 -84M-9 -80L-14 -83',ink,.55,.2);
      this.line('M-17 -87L-14 -85M-15 -89L-12 -87',gold,.55,.2);
      // Scarf provides one small, concentrated red accent.
      this.fill('M-24 -79Q-16 -73 -7 -77L-5 -72Q-17 -67 -28 -74Z',red,.3);
      this.fill('M-20 -71Q-25 -59 -24 -52L-18 -55L-16 -69Z',red,.3);
      this.cut('M-24 -75Q-16 -72 -9 -74M-20 -66L-22 -57',.65);
      // Near arm: shoulder to elbow to wrist, with a visible cuff and loose fingers.
      this.fill('M-9 -69Q-3 -70 3 -61L15 -48L32 -36L29 -29Q14 -33 5 -40L-9 -51Q-15 -62 -9 -69Z',blue,.3);
      this.fill('M5 -47Q16 -39 30 -34L29 -29Q14 -33 5 -40L-7 -50Z','#344c50',.3);
      this.cut('M-7 -64Q-4 -55 5 -49M7 -46L12 -43M14 -41Q20 -36 27 -35M28 -35L25 -30',1);
      this.fill('M31 -36L36 -32L33 -26L28 -29Z',paper,.15);
      this.fill('M36 -33Q41 -33 44 -29L47 -23L47 -18Q45 -17 44 -21L42 -25L43 -17Q41 -15 40 -20L39 -24L39 -17Q37 -15 36 -20L35 -24Q31 -27 33 -30Z','#c0ac8c',.3);
      this.line('M37 -28L40 -26M40 -28L43 -25M35 -26L37 -22',ink,.5,.2);
    });}
    creekTree(){this.group(247,358,1.05,0,()=>{
      this.fill('M-9 12C-4 -27 -3 -61 -6 -92L-21 -134L-18 -139L-4 -110L-9 -166L-5 -173L1 -125L9 -160L13 -160L7 -109Q18 -131 40 -144L43 -141Q19 -119 11 -92L8 -42L12 12Z',ink,.28);
      this.line('M1 -66Q-8 -111 -42 -129M-3 -101Q-29 -139 -52 -148M1 -117Q20 -151 25 -182M7 -96Q32 -119 68 -114M-4 -135Q-32 -158 -68 -155',ink,2.2,.25);
      this.line('M-39 -129L-56 -126M-41 -137L-39 -156M20 -154L43 -166M47 -116L61 -137M-53 -155L-61 -170',ink,1.1,.2);
      this.cut('M-3 7Q4 -41 2 -79M-1 -91L-7 -120M5 -101Q15 -124 28 -135',1.1);
      this.line('M-6 -20L-5 -42M-4 -58L-6 -74M5 -28L4 -52',sage,.6,.15);
      const clusters=[[-58,-158,15],[-32,-180,14],[0,-190,13],[30,-177,14],[59,-149,14],[66,-119,12],[34,-122,10],[-26,-139,12],[-68,-128,9]];
      let seed=917;const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      for(const [cx,cy,n] of clusters)for(let i=0;i<n;i++){
        const a=random()*Math.PI*2,r=Math.sqrt(random()),px=cx+Math.cos(a)*r*24,py=cy+Math.sin(a)*r*19,scale=.23+random()*.18;
        this.group(px,py,scale,random()*4-2,()=>{
          const color=[soft,sage,gold,red][Math.floor(random()*4)];
          this.fill(i%3?'M0 4Q-15 -7 -9 -25Q5 -28 12 -16Q16 -3 0 4Z':'M0 3L-12 -6L-10 -18L-4 -16L0 -29L6 -20L14 -19L11 -6Z',color,.25);
          if(i%2)this.cut('M0 0L1 -20M0 -9L-6 -14',.9);
        });
      }
      this.line('M-22 14Q-8 10 3 13M8 14L23 13M-32 19L-15 17',soft,1,.2);
    });}
    creekLeaf(x,y,s,angle,color,variant=0){this.group(x,y,s,angle,()=>{
      const shapes=[
        'M0 4Q-3 -4 -4 -10Q-15 -8 -28 -22L-21 -24L-29 -36Q-20 -35 -14 -30L-14 -43L-6 -37Q-3 -47 1 -54Q7 -45 7 -37L17 -43L16 -32L29 -36L24 -25L34 -23Q22 -10 8 -10L4 4Z',
        'M0 5Q-9 -4 -8 -12Q-22 -10 -21 -20Q-35 -24 -26 -32Q-29 -42 -17 -40Q-20 -52 -9 -48Q-5 -61 2 -64Q10 -57 8 -48Q22 -51 18 -40Q31 -38 23 -29Q31 -20 18 -16Q19 -7 8 -9L4 5Z',
        'M0 4Q-2 -4 -4 -9L-17 -8L-14 -16Q-27 -18 -33 -27L-24 -30L-26 -42L-14 -36L-10 -47L-3 -40L3 -57L9 -42L20 -47L19 -34L32 -35L25 -23L33 -19Q19 -8 7 -9L4 4Z'
      ];
      this.fill(shapes[variant%3],color,.27);
      this.line('M2 3Q0 -20 2 -44M1 -14Q-10 -19 -19 -29M2 -20Q14 -23 22 -31M1 -29L-8 -39',paper,1,.08);
      this.line('M-6 -20L-12 -21M-11 -24L-13 -29M10 -24L17 -24M12 -26L15 -32M1 -36L6 -41',paper,.55,.08);
      this.line('M2 0Q4 10 -2 17',soft,.9,.18);
    });}
    creekBasket(x,y,s,n){this.group(x,y,s,0,()=>{
      this.fill('M-34 -2Q-29 28 -21 31Q2 39 27 28L34 -2Z',gold,.25,ink,1.3);
      this.fill('M16 4L32 0L26 27Q17 33 6 34L12 21Z','#8c703e',.25);
      this.ellipse(0,-3,34,9,ink,null,1,.28);this.ellipse(0,-4,29,5,'#766744',null,1,.28);
      for(let i=0;i<10;i++){const a=-27+i*5.9;this.line(`M${a} 3Q${a*.94} 18 ${a*.77} 29`,paper,.8,.08);}
      this.line('M-31 7Q0 20 31 7M-28 15Q0 28 29 14M-25 23Q0 34 27 22',ink,.85,.2);
      this.line('M-25 -7C-23 -49 22 -48 27 -7',ink,3,.25);this.line('M-24 -8C-22 -44 19 -44 25 -8',gold,1,.2);
      this.line('M-34 -3Q-2 11 34 -3M-33 0Q0 14 33 0',paper,.9,.08);
      const ids=[...this.completed];for(let i=0;i<n;i++)this.creekLeaf(-20+i%3*17,-4-Math.floor(i/3)*9,.27,-.9+i*.5,ids[i]%2?gold:red,ids[i]);
    });}
    creek(){
      this.line('M104 343Q188 310 275 304Q322 286 347 288M746 342Q812 328 887 345',sage,.8,.15);
      this.fill('M111 389Q173 344 269 349Q355 346 408 374Q299 383 246 421Q173 421 111 442Z','#b0b09a',.14);
      this.line('M112 439Q176 411 243 420Q281 394 326 384M115 448Q179 421 229 428',soft,1,.2);
      for(const [px,py,a] of [[140,397,-.4],[163,391,.2],[189,389,-.1],[213,397,.3],[259,389,-.2],[286,381,.4]])this.twig(px,py,.4,a,soft);
      this.creekTree();
      // Bridge stays at the same arch and span; broken masonry replaces the black band.
      this.fill('M315 344Q444 238 611 291Q688 309 736 355L708 384Q635 300 522 310Q424 306 347 374Z','#9c9d7c',.26,soft,.8);
      this.fill('M347 374Q432 309 521 310Q625 302 708 384L695 388Q610 322 523 325Q425 322 360 382Z',soft,.28);
      this.line('M305 339Q442 224 610 278Q689 301 747 352',ink,1.6,.25);
      this.line('M310 345Q445 231 609 284Q689 306 740 356',paper,2.5,.08);
      this.line('M319 348Q448 240 607 291Q681 312 731 358',gold,1,.2);
      this.line('M349 373Q433 308 522 311Q624 304 708 383',ink,1.8,.25);
      this.line('M362 379Q430 322 486 324M509 324Q549 321 580 328M600 334Q654 350 692 383',paper,.85,.08);
      const joints=[[333,341,347,360],[366,318,378,339],[401,299,411,321],[440,285,446,310],[480,279,482,303],[522,279,520,302],[563,284,558,307],[605,295,595,317],[643,310,631,329],[678,329,665,347],[710,349,695,365]];
      for(const [a,b,c,d] of joints){this.line(`M${a} ${b}L${c} ${d}`,soft,.9,.2);this.line(`M${a+2} ${b}L${c+2} ${d-2}`,paper,.7,.08);}
      this.line('M358 343L375 335M390 320L408 314M425 305L441 301M463 294L481 293M505 292L523 293M543 295L560 298M583 304L601 310M621 320L639 328M658 341L675 352',paper,1,.08);
      // Small irregular marks explain stone surfaces instead of filling the entire arch.
      this.line('M369 328l4 -2m13 -7l3 -2m25 -16l4 -1m38 -10l5 -1m41 -3l4 1m36 0l5 1m31 7l4 1m37 15l4 2m31 20l4 3',ink,.6,.2);
      this.fill('M695 389Q776 359 888 391L883 426Q821 414 789 432Q746 448 704 448L680 442L695 423Z','#b0b09a',.16);
      this.line('M680 447Q731 458 789 435Q835 419 891 431',soft,1.1,.2);
      this.line('M692 451L716 453M731 454L752 451M806 432L831 429M848 429L867 431',paper,1.2,.08);
      this.picker(754,409,1.16);this.creekBasket(819,421,.98,this.count);
      this.distantBirds(675,168);
      this.line('M282 438q14 -2 28 0m-20 5h14M382 424q11 -2 23 0M473 431l15 -1M604 435q13 -2 25 0M718 465l13 0M262 481l22 -1M364 519q12 -2 28 0M502 493l18 1M595 548q15 -2 28 0M817 488l25 -1M773 531l18 0',soft,.8,.15);
      this.line('M291 442h12M391 429l9 0M613 440h14M266 486h10M377 523h14M605 552h14M829 492h10',sage,.6,.12);
      this.getPositions().forEach(([px,py],i)=>{if(!this.completed.has(i))this.creekLeaf(px,py,.7+(i%3)*.08,-1.2+i*.73,i%2?gold:red,i);});
      this.twig(164,544,.82,-.1,soft);this.twig(190,552,.6,.4,sage);this.twig(856,563,.7,.1,soft);
      this.line('M108 551q14 -9 25 -3m-16 8q12 -5 20 -2',sage,.8,.15);
    }
    setCompleted(completed,index){
      if(this.scene!=='pond')return super.setCompleted(completed,index);
      this.effect=null;this.completed=new Set(completed);this.count=this.completed.size;this.compose();
    }
    paint(){if(this.scene==='pond'&&this.base&&this.ctx){this.ctx.drawImage(this.base,0,0);return;}super.paint();}
  }
  window.PaperRelief=CreekPlate;
})();
