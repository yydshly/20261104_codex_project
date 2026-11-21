function createStoryScene(canvas) {
  const T = window.THREE;
  if (!T) throw new Error('Three.js runtime is unavailable.');
  const renderer = new T.WebGLRenderer({canvas, antialias:true, powerPreference:'high-performance'});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.7));
  renderer.outputColorSpace = T.SRGBColorSpace;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;

  const scene = new T.Scene();
  scene.background = new T.Color(0x4b5871);
  scene.fog = new T.FogExp2(0x596480,.029);
  const camera = new T.PerspectiveCamera(39,1,.07,110);
  const ambient = new T.HemisphereLight(0xc9e2fc,0x726053,1.75);
  const sun = new T.DirectionalLight(0xffc18f,2.35);
  sun.position.set(-8,10,6);
  sun.castShadow=true;
  sun.shadow.mapSize.set(1024,1024);
  Object.assign(sun.shadow.camera,{left:-13,right:13,top:12,bottom:-12,near:.5,far:35});
  sun.shadow.normalBias=.035;
  const fill = new T.DirectionalLight(0x9bbcf7,.95);
  fill.position.set(6,4,-5);
  scene.add(ambient,sun,fill);

  // Small, shared geometries and the city palette keep the close sets lightweight.
  const cube = new T.BoxGeometry(1,1,1);
  const sphere = new T.SphereGeometry(1,20,13);
  const cylinder = new T.CylinderGeometry(1,1,1,20);
  const cone = new T.CylinderGeometry(.22,.39,.59,18,1,true);
  const torso = new T.CylinderGeometry(.24,.17,.48,16);
  const wheel = new T.CylinderGeometry(1,1,1,24);
  const eye = new T.SphereGeometry(1,9,6);
  const material = (color, options={}) => new T.MeshStandardMaterial({color,roughness:.75,...options});
  const emit = (color, strength=.9) => material(color,{emissive:color,emissiveIntensity:strength});
  const colors = {
    road:material(0x29353e), curb:material(0x8f9595), grout:material(0x54666d),
    stone:material(0xa3a7a0), dark:material(0x23323b), steel:material(0x465965,{metalness:.27}),
    concrete:material(0xb5ac9f), brick:material(0x976d5d), plaster:material(0xd4c6ad),
    glass:material(0x3d6878,{roughness:.22,metalness:.39}), window:emit(0xe9a66b,1.28),
    windowCool:emit(0x76929b,.47), lamp:emit(0xffcc88,2.25), cream:material(0xdde0d0),
    leaf:material(0x4e6f54), leafLight:material(0x71916a), wood:material(0x956650),
    darkWood:material(0x584033), blueTile:material(0x39545d), paper:material(0xe4dcc2),
    phone:material(0x25323b,{roughness:.3,metalness:.25}), screen:emit(0xa2e0df,1.05),
    rubber:material(0x24252a), ivory:material(0xe2dbca), trim:material(0xb6c3c3,{metalness:.16}),
    shuttle:material(0x437c76,{metalness:.15,roughness:.42}), red:emit(0xed694f,1.1),
  };

  function mesh(parent, geometry, surface, x, y, z, sx=1, sy=1, sz=1, shadows=false) {
    const item = new T.Mesh(geometry,surface);
    item.position.set(x,y,z);
    item.scale.set(sx,sy,sz);
    item.castShadow=shadows;
    item.receiveShadow=true;
    parent.add(item);
    return item;
  }
  const box = (parent,surface,x,y,z,w,h,d,shadows=false) =>
    mesh(parent,cube,surface,x,y,z,w,h,d,shadows);
  const ball = (parent,surface,x,y,z,w,h,d,shadows=false) =>
    mesh(parent,sphere,surface,x,y,z,w,h,d,shadows);

  function group(parent,x=0,y=0,z=0) {
    const item=new T.Group();
    item.position.set(x,y,z);
    parent.add(item);
    return item;
  }

  function makeTexture(width,height,paint) {
    const image=document.createElement('canvas');
    image.width=width;
    image.height=height;
    paint(image.getContext('2d'),width,height);
    const texture=new T.CanvasTexture(image);
    texture.colorSpace=T.SRGBColorSpace;
    return texture;
  }

  const haloTexture=makeTexture(64,64,(ctx) => {
    const glow=ctx.createRadialGradient(32,32,0,32,32,32);
    glow.addColorStop(0,'rgba(255,245,225,1)');
    glow.addColorStop(.25,'rgba(255,221,170,.4)');
    glow.addColorStop(1,'rgba(255,207,130,0)');
    ctx.fillStyle=glow;
    ctx.fillRect(0,0,64,64);
  });

  function glow(parent,x,y,z,size,opacity=.6,tint=0xffce8f) {
    const sprite=new T.Sprite(new T.SpriteMaterial({map:haloTexture,color:tint,opacity,
      transparent:true,depthWrite:false,blending:T.AdditiveBlending}));
    sprite.position.set(x,y,z);
    sprite.scale.set(size,size,1);
    parent.add(sprite);
    return sprite;
  }

  function sign(parent,label,x,y,z,w,h,background='#263c46',foreground='#ffe9cb') {
    const map=makeTexture(512,128,(ctx) => {
      ctx.fillStyle=background;
      ctx.fillRect(0,0,512,128);
      ctx.strokeStyle='#e1b481';
      ctx.lineWidth=3;
      ctx.strokeRect(6,6,500,116);
      ctx.fillStyle=foreground;
      ctx.font='700 57px "Microsoft YaHei","Noto Sans CJK SC",sans-serif';
      ctx.textAlign='center';
      ctx.textBaseline='middle';
      ctx.fillText(label,256,66,475);
    });
    const item=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map,toneMapped:false}));
    item.position.set(x,y,z);
    parent.add(item);
    return item;
  }

  function plant(parent,x,z,scale=1,y=0) {
    const p=group(parent,x,y,z);
    p.scale.setScalar(scale);
    mesh(p,cylinder,colors.darkWood,0,.14,0,.24,.28,.24,true);
    for (let i=0;i<7;i++) {
      const theta=i*2.399;
      const leaf=ball(p,i%2 ? colors.leaf : colors.leafLight,
        Math.cos(theta)*.15,.4+(i%3)*.14,Math.sin(theta)*.15,.105,.25,.075);
      leaf.rotation.z=.53*Math.cos(theta);
      leaf.rotation.x=.53*Math.sin(theta);
    }
    return p;
  }

  function tree(parent,x,z,scale=1) {
    const root=group(parent,x,0,z);
    root.scale.setScalar(scale);
    mesh(root,cylinder,colors.darkWood,0,1.3,0,.09,2.6,.09,true);
    ball(root,colors.leaf,0,2.63,0,.9,1.16,.77,true);
    ball(root,colors.leafLight,.43,2.52,.13,.67,.77,.59,true);
    ball(root,colors.leaf,-.42,2.35,-.16,.68,.8,.6,true);
  }

  function cityBackdrop(parent,baseZ) {
    const surfaces=[material(0x677d89),material(0x6d7a85),material(0x716f7a),material(0x596b79)];
    for (let i=0;i<14;i++) {
      const x=(i-6.5)*4.3;
      const h=5+(i*29%13)*.77;
      const z=baseZ-(i*13%8)*.6;
      box(parent,surfaces[i%4],x,h/2,z,3.2+(i%3)*.45,h,2.8);
      for (let row=1;row<h-1;row+=1.05) {
        for (const col of [-.9,0,.9]) {
          if ((i*7+row*10+col*20)%6>1) box(parent,colors.windowCool,x+col,row,z+1.415,.45,.33,.027);
        }
      }
    }
  }

  function streetBase(parent,local) {
    box(parent,colors.road,0,-.13,4.75,34,.24,5.2);
    box(parent,colors.grout,0,-.07,-1.1,34,.13,6.45);
    box(parent,colors.curb,0,.03,2.14,34,.16,.19);
    for (let x=-16;x<=16;x+=.72) {
      for (let row=0;row<4;row++) {
        box(parent,row%2 ? colors.stone : colors.curb,x+(row%2)*.36,.015,-.17+row*.63,.692,.037,.60);
      }
    }
    for (let x=-14;x<16;x+=3) box(parent,colors.paper,x,.003,5.15,1.4,.011,.045);
    for (let i=0;i<6;i++) box(parent,colors.ivory,-4.55+i*.44,.009,3.6,.25,.014,2.15);
    cityBackdrop(parent,-16);
    for (const x of [-10.1,10.3]) {
      const h=x<0 ? 6.4 : 5.6;
      box(parent,colors.brick,x,h/2,-3.2,5.2,h,3.5,true);
      for (const row of [1.5,3,4.5]) {
        for (const dx of [-1.5,0,1.5]) {
          box(parent,colors.steel,x+dx,row,-1.42,.82,1.12,.06);
          box(parent,(row+dx)%2<1 ? colors.window : colors.windowCool,x+dx,row,-1.38,.68,.94,.03);
        }
      }
    }
    tree(parent,-6.9,1.64,.86);
    tree(parent,7.35,1.63,1);
    for (const x of [-5.4,5.98]) {
      mesh(parent,cylinder,colors.steel,x,1.57,1.68,.065,3.14,.065,true);
      box(parent,colors.steel,x,3.15,1.9,.115,.12,.48);
      box(parent,colors.lamp,x,3.055,2.08,.25,.10,.19);
      glow(parent,x,3.06,2.17,1.45,.43);
    }
    if (local) {
      box(parent,colors.blueTile,4.04,.032,2.95,4.8,.055,1.44);
      for (const x of [1.87,6.21]) box(parent,colors.paper,x,.065,2.98,.035,.014,1.33);
    }
  }

  function frontage(parent,isCare) {
    const facade=isCare ? colors.plaster : colors.concrete;
    const base=isCare ? colors.blueTile : colors.steel;
    box(parent,facade,0,5.3,-3.4,13.3,4.5,4.1,true);
    box(parent,facade,0,3.12,-1.43,13.3,1.48,.29,true);
    box(parent,base,0,.21,-1.45,13.3,.43,.28);
    box(parent,facade,-3.82,1.46,-1.46,5.25,2.72,.27,true);
    box(parent,facade,3.82,1.46,-1.46,5.25,2.72,.27,true);
    box(parent,colors.window,0,1.35,-2.14,2.5,2.42,.05);
    box(parent,colors.dark,0,1.38,-1.34,2.6,.11,.21);
    box(parent,colors.dark,0,2.59,-1.34,2.63,.11,.24);
    for (const x of [-1.3,1.3]) box(parent,colors.dark,x,1.39,-1.34,.11,2.47,.22);
    for (const x of [-4.86,-2.76,2.76,4.86]) {
      box(parent,base,x,1.57,-1.289,1.79,1.61,.06);
      box(parent,colors.window,x,1.57,-1.237,1.58,1.39,.08);
      box(parent,base,x,1.57,-1.188,.058,1.42,.038);
      box(parent,base,x,1.57,-1.188,1.59,.055,.038);
      box(parent,base,x,.77,-1.18,1.87,.095,.23);
    }
    for (const x of [-5.15,-3.44,-1.72,0,1.72,3.44,5.15]) {
      for (const y of [4.21,5.7,7.01]) {
        box(parent,base,x,y,-1.30,1.36,1.04,.07);
        box(parent,(Math.round(x+y)%4) ? colors.glass : colors.window,x,y,-1.25,1.18,.87,.04);
        box(parent,base,x,y,-1.212,.045,.88,.04);
      }
    }
    box(parent,base,0,2.75,-.99,5.05,.16,1.16,true);
    box(parent,colors.lamp,0,2.665,-.74,3.96,.035,.17);
    glow(parent,0,2.57,-.6,2.3,.25);
    const doorwayLight=new T.PointLight(0xffb872,6.5,5.4,2);
    doorwayLight.position.set(0,2.35,-.34);
    parent.add(doorwayLight);
    sign(parent,isCare?'社区照护站':'街区维修站',0,3.24,-1.266,4.0,.67,
      isCare?'#355d5a':'#31414c');
    plant(parent,-1.71,-.94,.94);
    plant(parent,1.71,-.94,.94);

    return [-1,1].map((side) => {
      const door=group(parent,side*.61,0,-1.13);
      box(door,base,0,1.385,0,1.15,2.28,.084,true);
      box(door,colors.glass,0,1.49,.052,.96,1.83,.038);
      box(door,colors.trim,-side*.36,1.26,.09,.065,.31,.064);
      return door;
    });
  }

  function makePerson(parent,kind) {
    const elderly=kind==='father';
    const care=kind==='carer';
    const coat=material(care?0x547d78:elderly?0x657384:0xba7752);
    const trousers=material(care?0x46565c:elderly?0x534b47:0x37404b);
    const skin=material(elderly?0xc49272:0xd49b7b);
    const hair=material(elderly?0x929194:0x332e32);
    const shoes=material(0x282b31);
    const root=group(parent);
    const body=group(root);
    const stature=elderly?.96:1;
    body.scale.setScalar(stature);
    mesh(body,torso,coat,0,1.175,0,1,1,1,true);
    ball(body,coat,0,1.37,0,.242,.125,.15,true);
    ball(body,trousers,0,.95,0,.175,.12,.127,true);
    mesh(body,cylinder,skin,0,1.465,0,.075,.16,.075,true);
    const head=group(body,0,1.53,0);
    ball(head,skin,0,.110,0,.134,.172,.126,true);
    ball(head,hair,0,.197,-.024,.142,.105,.124,true);
    ball(head,hair,0,.105,-.064,.137,.134,.088,true);
    for (const side of [-1,1]) {
      ball(head,skin,side*.137,.091,0,.026,.041,.026);
      mesh(head,eye,colors.dark,side*.05,.123,.116,.012,.013,.009);
    }
    ball(head,skin,0,.086,.126,.026,.028,.034);
    if (kind==='cheng') {
      ball(head,hair,0,.108,-.134,.080,.087,.066);
      const strap=box(body,colors.darkWood,.074,1.22,.122,.055,.55,.028,true);
      strap.rotation.z=.43;
    }
    if (care) {
      box(body,colors.cream,.10,1.35,.151,.077,.105,.023);
      box(body,colors.blueTile,.10,1.37,.165,.045,.017,.008);
    }

    const arms=[];
    const legs=[];
    for (const side of [-1,1]) {
      const arm=group(body,side*.237,1.38,0);
      const forearm=group(arm,0,-.245,0);
      ball(arm,coat,0,-.132,0,.075,.188,.074,true);
      ball(forearm,coat,0,-.082,0,.058,.132,.058,true);
      ball(forearm,skin,0,-.23,0,.047,.062,.05,true);
      arms.push({arm,forearm});

      const leg=group(body,side*.098,.91,0);
      const shin=group(leg,0,-.411,0);
      ball(leg,trousers,0,-.19,0,.090,.25,.086,true);
      ball(shin,trousers,0,-.177,0,.071,.23,.071,true);
      const foot=group(shin,0,-.417,.045);
      ball(foot,shoes,0,0,0,.082,.064,.154,true);
      legs.push({leg,shin,foot});
    }

    const phone=group(arms[1].forearm,0,-.244,.063);
    box(phone,colors.phone,0,0,0,.103,.173,.033,true);
    box(phone,colors.screen,0,.006,.020,.085,.147,.008);
    const bag=group(body,.235,.91,-.085);
    box(bag,colors.darkWood,0,-.04,0,.265,.28,.15,true);
    box(bag,colors.wood,0,.058,.072,.25,.085,.032);
    const cane=group(body,.3,.43,.12);
    mesh(cane,cylinder,colors.darkWood,0,-.04,0,.022,.79,.022,true);
    box(cane,colors.darkWood,.049,.35,0,.138,.043,.05,true);
    cane.visible=elderly;
    bag.visible=kind==='cheng';
    phone.visible=false;
    return {root,body,head,arms,legs,phone,bag,cane,kind};
  }

  function posePerson(person,x,z,angle,{stride=0,walking=0,seated=false,phone=0,gesture=0,nod=0,bag=true}={}) {
    const {root,body,arms,legs}=person;
    root.position.set(x,0,z);
    root.rotation.y=angle;
    body.position.y=seated?-.43:Math.abs(Math.sin(stride))*.037*walking;
    body.rotation.x=seated?.06:.045*walking;
    person.head.rotation.x=nod*.32;
    for (let i=0;i<2;i++) {
      const side=i===0?-1:1;
      const step=Math.sin(stride)*side*walking;
      legs[i].leg.rotation.x=seated?-1.46:step*.49;
      legs[i].shin.rotation.x=seated?1.46:Math.max(0,-step)*.42;
      arms[i].arm.rotation.x=seated?-.25:-step*.34;
      arms[i].arm.rotation.z=side*(seated?.075:.055);
      arms[i].forearm.rotation.x=seated?-.82:-.07;
    }
    arms[1].arm.rotation.x-=phone*.83+gesture*.47;
    arms[1].forearm.rotation.x-=phone*1.47+gesture*.35;
    person.phone.visible=phone>.18;
    person.bag.visible=bag&&person.kind==='cheng';
    person.cane.visible=person.kind==='father'&&!seated;
    if (person.cane.visible) person.cane.rotation.x=Math.sin(stride)*walking*.23;
  }

  function phoneToEar(person,amount) {
    person.arms[1].arm.rotation.x=-1.88*amount;
    person.arms[1].forearm.rotation.x=-1.72*amount;
  }

  function supportPad(person,tap=0) {
    person.arms[0].arm.rotation.x=-.92;
    person.arms[0].arm.rotation.z=.18;
    person.arms[0].forearm.rotation.x=-1.01;
    person.arms[1].arm.rotation.x=-1.43+tap*.17;
    person.arms[1].arm.rotation.z=-.35;
    person.arms[1].forearm.rotation.x=-.36-tap*.22;
  }

  function bench(parent,x,z) {
    for (const side of [-1,1]) {
      box(parent,colors.steel,x+side*.76,.245,z,.105,.47,.42,true);
      box(parent,colors.steel,x+side*.76,.61,z-.185,.085,.60,.08,true);
    }
    box(parent,colors.wood,x,.49,z,1.8,.105,.5,true);
    box(parent,colors.wood,x,.78,z-.213,1.8,.265,.09,true);
  }

  function shuttle(parent) {
    const root=group(parent);
    box(root,colors.shuttle,0,.66,0,3.65,.73,1.43,true);
    box(root,colors.ivory,-.12,1.42,0,3.23,.82,1.40,true);
    box(root,colors.trim,-.18,1.855,0,3.27,.13,1.48,true);
    box(root,colors.glass,1.515,1.45,0,.105,.49,1.16);
    box(root,colors.glass,-1.764,1.45,0,.085,.45,1.15);
    for (const side of [-1,1]) {
      for (const x of [-1.23,-.43,.96]) {
        box(root,colors.steel,x,1.443,side*.706,.65,.55,.055);
        box(root,colors.windowCool,x,1.45,side*.744,.52,.42,.022);
      }
      box(root,colors.dark,.24,1.178,side*.722,.71,1.05,.055);
      box(root,colors.window,.265,1.24,side*.752,.135,.32,.032);
      box(root,colors.trim,-.024,1.28,side*.755,.033,.68,.036);
      box(root,colors.trim,.24,.565,side*.775,.73,.11,.13);
      for (const x of [-1.14,1.15]) {
        const tire=mesh(root,wheel,colors.rubber,x,.348,side*.72,.334,.18,.334,true);
        tire.rotation.x=Math.PI/2;
        const hub=mesh(root,wheel,colors.trim,x,.348,side*.821,.155,.034,.155);
        hub.rotation.x=Math.PI/2;
      }
    }
    for (const z of [-.49,.49]) {
      box(root,colors.lamp,1.84,.668,z,.071,.18,.245);
      box(root,colors.red,-1.85,.668,z,.071,.18,.145);
      glow(root,1.88,.678,z,.72,.32);
    }
    sign(root,'社区接驳',-.96,.887,.725,1.26,.278,'#2a6562','#e6f4df');
    const passengers=[-.43,-1.23].map((x,index) => {
      const seated=group(root,x,1.42,.767);
      const coat=material(index?0x657384:0xba7752);
      const hair=material(index?0x929194:0x332e32);
      ball(seated,coat,0,-.095,0,.132,.086,.023);
      ball(seated,material(0xc69679),0,.023,.004,.065,.081,.027);
      ball(seated,hair,0,.074,.007,.066,.044,.028);
      return seated;
    });
    const doors=[];
    for (const side of [-1,1]) {
      for (const slide of [-1,1]) {
        const door=group(root,.24+slide*.165,0,side*.776);
        box(door,colors.ivory,0,1.185,0,.328,1.03,.067);
        box(door,colors.glass,0,1.448,side*.039,.245,.42,.020);
        doors.push({door,slide});
      }
    }
    return {root,doors,passengers};
  }

  const work=group(scene);
  streetBase(work,false);
  const workDoors=frontage(work,false);
  const worker=makePerson(work,'cheng');
  const bike=group(work,-3.06,.02,.81);
  for (const x of [-.46,.46]) {
    const rim=mesh(bike,new T.TorusGeometry(.29,.024,8,22),colors.steel,x,.31,0);
    rim.castShadow=true;
  }
  const bikeFrame=box(bike,colors.shuttle,0,.49,0,.93,.071,.073,true);
  bikeFrame.rotation.z=.19;
  const bikePost=box(bike,colors.steel,-.41,.57,0,.052,.55,.054,true);
  bikePost.rotation.z=-.15;
  box(bike,colors.dark,-.39,.83,0,.22,.073,.34,true);
  box(bike,colors.dark,.34,.65,0,.29,.068,.15,true);

  const care=group(scene);
  streetBase(care,true);
  const careDoors=frontage(care,true);
  bench(care,-1.98,.33);
  const stop=group(care,4.5,0,1.55);
  mesh(stop,cylinder,colors.steel,0,1.06,0,.047,2.12,.047,true);
  box(stop,colors.dark,0,2.06,0,.58,.49,.10,true);
  sign(stop,'接驳点',0,2.06,.061,.55,.355,'#2b5559');
  const cheng=makePerson(care,'cheng');
  const father=makePerson(care,'father');
  const carer=makePerson(care,'carer');
  const coach=shuttle(care);
  const clipboard=group(carer.body,-.025,1.185,.327);
  clipboard.rotation.set(-.34,0,-.09);
  box(clipboard,colors.wood,0,0,0,.43,.52,.058,true);
  box(clipboard,colors.paper,0,-.014,.035,.37,.431,.024);
  box(clipboard,colors.steel,0,.211,.052,.16,.065,.021);
  const handwriting=[];
  for (let i=0;i<4;i++) {
    const row=box(clipboard,colors.darkWood,-.055,.109-i*.069,.051,.187-i%2*.033,.013,.009);
    handwriting.push(row);
  }
  const pencil=group(carer.arms[1].forearm,.007,-.248,.057);
  pencil.rotation.z=-.43;
  mesh(pencil,cylinder,material(0xd7a35a),0,-.025,0,.013,.142,.013);
  mesh(pencil,cylinder,colors.darkWood,0,-.105,0,.009,.035,.009);

  const tablet=group(carer.body,-.035,1.20,.365);
  tablet.rotation.set(-.31,.02,.03);
  box(tablet,colors.phone,0,0,0,.63,.365,.061,true);
  box(tablet,emit(0x8ec8ce,.6),0,0,.039,.566,.302,.015);
  for (let i=0;i<3;i++) {
    box(tablet,colors.blueTile,-.076,.081-i*.060,.051,.32-i%2*.09,.016,.009);
  }
  const tabletStatus=box(tablet,emit(0xdda05f,.94),.169,-.089,.057,.156,.065,.018);
  const pendingColor=new T.Color(0xf4ab67);
  const confirmedColor=new T.Color(0x77d5a4);

  const consentTexture=makeTexture(128,128,(ctx) => {
    ctx.fillStyle='#213c38';
    ctx.strokeStyle='#bde7b4';
    ctx.lineWidth=8;
    ctx.beginPath();
    ctx.arc(64,64,51,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.lineCap='round';
    ctx.lineJoin='round';
    ctx.moveTo(40,66);
    ctx.lineTo(56,82);
    ctx.lineTo(89,47);
    ctx.stroke();
  });
  function consentMark(person,x,y) {
    const mark=new T.Sprite(new T.SpriteMaterial({map:consentTexture,depthWrite:false,
      toneMapped:false,transparent:true}));
    mark.position.set(x,y,.29);
    mark.scale.set(.40,.40,1);
    person.root.add(mark);
    return mark;
  }
  const fatherConsent=consentMark(father,.39,1.39);
  const carerConsent=consentMark(carer,.35,1.89);

  const home=group(scene);
  cityBackdrop(home,-10);
  box(home,colors.darkWood,0,-.13,.2,11.2,.25,9.6,true);
  const planks=[material(0x956750),material(0xa57156),material(0x9d7058),material(0xab765b)];
  for (let x=-5.35;x<5.5;x+=.34) {
    box(home,planks[Math.abs(Math.round(x*21))%4],x,.008,.22,.328,.034,9.5);
  }
  box(home,colors.plaster,-3.77,2.15,-3.65,3.67,4.3,.18,true);
  box(home,colors.plaster,3.77,2.15,-3.65,3.67,4.3,.18,true);
  box(home,colors.plaster,0,.62,-3.65,4,1.25,.18,true);
  box(home,colors.plaster,0,3.67,-3.65,4,1.28,.18,true);
  for (const x of [-1.94,0,1.94]) box(home,colors.darkWood,x,2.16,-3.59,.105,1.98,.16);
  for (const y of [1.26,2.13,3.11]) box(home,colors.darkWood,0,y,-3.59,4.02,.092,.16);
  box(home,colors.wood,0,1.21,-3.41,4.25,.102,.44,true);
  box(home,colors.plaster,-5.55,2.15,-.7,.18,4.3,5.99,true);
  const curtain=material(0xb38b77,{side:T.DoubleSide});
  for (const side of [-1,1]) {
    for (let i=0;i<4;i++) {
      ball(home,curtain,side*(1.72+i*.11),2.1,-3.41-(i%2)*.055,.084,1.15,.099);
    }
  }
  box(home,colors.wood,-3.58,.53,-3.12,2.05,1.06,.7,true);
  box(home,colors.darkWood,-3.58,1.09,-3.12,2.15,.10,.77,true);
  for (const x of [-4.08,-3.08]) box(home,colors.trim,x,.62,-2.737,.28,.035,.036);
  plant(home,-4.14,-3.04,.68,1.15);
  const kettle=ball(home,colors.steel,-3.29,1.31,-3.08,.21,.18,.21,true);
  kettle.rotation.z=-.1;
  mesh(home,cylinder,colors.steel,-3.06,1.38,-3.08,.047,.23,.047).rotation.z=-1.06;
  plant(home,4.6,-2.87,1.36);

  const table=group(home,.49,0,.2);
  box(table,colors.wood,0,.93,0,2.52,.128,1.62,true);
  box(table,colors.darkWood,0,.80,0,2.37,.19,1.45,true);
  for (const x of [-1.055,1.055]) for (const z of [-.64,.64]) {
    box(table,colors.darkWood,x,.403,z,.123,.79,.125,true);
  }
  const tableMat=material(0x9e6758);
  box(table,tableMat,0,1.001,0,2.24,.015,.42);
  for (const x of [-.76,.76]) {
    const bowl=group(table,x,1.044,.10);
    mesh(bowl,cone,colors.ivory,0,.073,0,.63,.29,.63,true);
    mesh(bowl,cylinder,colors.darkWood,0,.125,0,.125,.015,.125);
    for (const [dx,dz] of [[-.044,.021],[.017,.047],[.042,-.016]]) {
      ball(bowl,colors.cream,dx,.14,dz,.043,.017,.032);
    }
    for (const z of [-.29,-.25]) box(table,colors.darkWood,x,1.016,z,.32,.019,.017);
  }
  ball(table,colors.paper,0,1.054,.044,.258,.065,.22,true);
  for (const [x,z] of [[-.093,.015],[.082,.029],[.012,.115]]) {
    ball(table,colors.leafLight,x,1.124,z,.072,.032,.051,true);
  }

  function chair(x,z,angle) {
    const root=group(home,x,0,z);
    root.rotation.y=angle;
    box(root,colors.wood,0,.456,0,.56,.095,.58,true);
    for (const lx of [-.22,.22]) {
      for (const lz of [-.22,.22]) box(root,colors.darkWood,lx,.233,lz,.055,.44,.058,true);
      box(root,colors.wood,lx,.736,-.248,.065,.58,.071,true);
    }
    box(root,colors.wood,0,.91,-.244,.49,.177,.067,true);
  }
  chair(-1.17,.28,Math.PI/2);
  chair(2.15,.28,-Math.PI/2);
  const dinnerCheng=makePerson(home,'cheng');
  const dinnerFather=makePerson(home,'father');
  const pendant=group(home,.49,0,.2);
  mesh(pendant,cylinder,colors.dark,0,3.53,0,.024,1.14,.024,true);
  mesh(pendant,cone,colors.darkWood,0,2.94,0,1.02,.45,1.02,true);
  ball(pendant,colors.lamp,0,2.816,0,.286,.055,.286);
  glow(pendant,0,2.813,.04,2.15,.53);
  const tableLight=new T.PointLight(0xffc98a,14,7,2);
  tableLight.position.set(.48,2.73,.16);
  home.add(tableLight);
  const steam=[];
  for (const x of [-.27,1.25]) {
    for (let i=0;i<4;i++) {
      const wisp=glow(home,x,1.28+i*.1,.33,.3,.15,0xe5e0d5);
      wisp.material.blending=T.NormalBlending;
      steam.push({wisp,x,offset:i/4});
    }
  }

  const poses=[
    {x:.27,y:1.51,z:.14,heading:.20,tilt:.137,distance:6.7},
    {x:-.70,y:1.43,z:.13,heading:-.25,tilt:.151,distance:6.25},
    {x:.86,y:1.26,z:1.21,heading:.36,tilt:.180,distance:7.75},
    {x:.46,y:1.29,z:.09,heading:.08,tilt:.225,distance:5.55},
  ];
  const boardingPose={x:1.54,y:1.39,z:1.92,heading:1.20,tilt:.208,distance:8.12};
  const eyeTarget=new T.Vector3();
  let width=0;
  let height=0;
  let heading=0;
  let tilt=0;
  let scale=1;
  let lastKey='';
  let previousBeat=-1;
  const ramp=(value,start,end) => T.MathUtils.smoothstep(value,start,end);

  function resize() {
    const bounds=canvas.getBoundingClientRect();
    const w=Math.max(1,Math.round(bounds.width));
    const h=Math.max(1,Math.round(bounds.height));
    if (w!==width||h!==height) {
      width=w;
      height=h;
      renderer.setSize(width,height,false);
    }
  }

  function moveDoors(doors,amount) {
    doors.forEach((door,index) => {
      const side=index===0?-1:1;
      door.position.x=side*(.61+.61*amount);
    });
  }

  function setCamera(beat,progress,modern) {
    const shot=beat===2&&modern?boardingPose:poses[beat];
    const aspect=width/height;
    const narrow=Math.max(1,Math.min(1.34,1.27/aspect));
    const turn=shot.heading+heading;
    const lift=T.MathUtils.clamp(shot.tilt+tilt,.025,.7);
    const distance=shot.distance*narrow*scale*(1-.047*progress);
    const flat=distance*Math.cos(lift);
    const centerX=shot.x+(beat===0?.42*progress:0);
    const centerY=shot.y+.06*progress;
    camera.aspect=aspect;
    camera.position.set(centerX+flat*Math.sin(turn),centerY+distance*Math.sin(lift),shot.z+flat*Math.cos(turn));
    camera.lookAt(eyeTarget.set(centerX,centerY,shot.z));
    camera.updateProjectionMatrix();
  }

  function draw({year=2031,beat=0,progress=0,running=false,reducedMotion=false}={}) {
    beat=Math.max(0,Math.min(3,Math.round(Number(beat)||0)));
    progress=T.MathUtils.clamp(Number(progress)||0,0,1);
    const modern=Number(year)>=2036;
    const present=Number(year)<2031;
    if (beat!==previousBeat) {
      previousBeat=beat;
      resetCamera();
    }
    resize();
    const tick=reducedMotion ? 0 : progress;
    const key=[year,beat,Math.round(progress*320),running,reducedMotion,width,height,heading,tilt,scale].join('|');
    if (key===lastKey) return false;
    lastKey=key;
    const moment=reducedMotion && progress>0 ? 1 : progress;
    work.visible=beat===0;
    care.visible=beat===1||beat===2;
    home.visible=beat===3;
    sun.intensity=beat===3?.71:1.15;
    ambient.intensity=beat===3?1.04:1.27;
    clipboard.visible=beat===1&&present&&moment>=.42;
    pencil.visible=clipboard.visible;
    tablet.visible=beat===1&&!present&&!modern;
    fatherConsent.visible=beat===1&&modern&&moment>=.40;
    carerConsent.visible=beat===1&&modern&&moment>=.74;
    if (beat===0) {
      const walking=ramp(moment,.03,.62);
      const steps=Math.sin(walking*Math.PI);
      moveDoors(workDoors,.3+.7*ramp(moment,0,.25)-.93*ramp(moment,.6,.99));
      const phone=ramp(moment,.45,.75);
      posePerson(worker,.41+walking*1.26,-.67+walking*1.68,.30+walking*.25,
        {stride:walking*19,walking:steps,phone,nod:!present?phone*.38:0});
      if (present) phoneToEar(worker,phone);
      else if (phone>.58) {
        worker.arms[0].arm.rotation.x=-phone*.81;
        worker.arms[0].forearm.rotation.x=-phone*(.92+.19*Math.sin(tick*24));
      }
    } else if (beat===1) {
      cheng.root.visible=false;
      coach.root.visible=false;
      father.root.visible=true;
      carer.root.visible=true;
      moveDoors(careDoors,.66);
      const fatherNod=modern?Math.sin(Math.PI*ramp(moment,.21,.55)):0;
      posePerson(father,-1.86,.35,.45,
        {seated:true,gesture:.17+.30*fatherNod,nod:fatherNod});
      if (present) {
        const phone=clipboard.visible?0:.3+.67*ramp(moment,.08,.34);
        posePerson(carer,.32,.54,-.14,{phone});
        if (clipboard.visible) {
          supportPad(carer,.65+.33*Math.sin(moment*49));
          carer.head.rotation.x=.26;
          handwriting.forEach((row,index) => {
            row.scale.x=(.187-index%2*.033)*ramp(moment,.45+index*.104,.59+index*.104);
          });
        } else phoneToEar(carer,phone);
      } else if (!modern) {
        const tap=Math.sin(Math.PI*ramp(moment,.47,.73));
        posePerson(carer,.38,.56,-.12,{nod:.65+.20*tap});
        supportPad(carer,tap);
        tabletStatus.material.color.copy(pendingColor).lerp(confirmedColor,ramp(moment,.60,.76));
        tabletStatus.material.emissive.copy(tabletStatus.material.color);
      } else {
        const workerNod=Math.sin(Math.PI*ramp(moment,.54,.86));
        posePerson(carer,.34,.54,-.34,{phone:.34+.48*ramp(moment,.42,.73),nod:workerNod});
      }
    } else if (beat===2) {
      cheng.root.visible=true;
      coach.root.visible=modern;
      carer.root.visible=true;
      moveDoors(careDoors,.38);
      const arrives=ramp(moment,.015,.62);
      const boards=ramp(moment,.55,.96);
      if (modern) {
        const firstBoard=ramp(moment,.52,.90);
        const lastBoard=ramp(moment,.61,.98);
        coach.root.position.set(7.35-arrives*4.26,0,3.02);
        coach.doors.forEach(({door,slide}) => door.position.x=.24+slide*(.165+.36*ramp(moment,.52,.83)));
        posePerson(cheng,.82+firstBoard*2.38,1.05+firstBoard*1.32,.93,
          {stride:firstBoard*16,walking:Math.sin(firstBoard*Math.PI)});
        posePerson(father,.05+lastBoard*3.07,.78+lastBoard*1.59,.91,
          {stride:lastBoard*13,walking:Math.sin(lastBoard*Math.PI)*.8});
        cheng.root.visible=firstBoard<.96;
        father.root.visible=lastBoard<.96;
        coach.passengers[0].visible=!cheng.root.visible;
        coach.passengers[1].visible=!father.root.visible;
        posePerson(carer,-1.36,.56,.62,{gesture:.18+.35*ramp(moment,.67,.9)});
      } else {
        father.root.visible=true;
        posePerson(cheng,3.7-arrives*3.38-boards*.83,1.33+boards*.4,-1.21,
          {stride:arrives*29+boards*7,walking:Math.max(.8*Math.sin(arrives*Math.PI),.7*Math.sin(boards*Math.PI)),
            phone:present?.48*(1-arrives):0});
        posePerson(father,-1.27+arrives*.69-boards*.83,.71+boards*.75,-.02-boards*.75,
          {stride:boards*8,walking:.62*Math.sin(boards*Math.PI)});
        posePerson(carer,-2.09,.42,.49,{gesture:.13+.32*ramp(moment,.68,.96)});
      }
    } else {
      posePerson(dinnerCheng,-1.12,.27,1.37,{seated:true,gesture:.18+.33*Math.sin(tick*6.28)**2,bag:false});
      posePerson(dinnerFather,2.10,.26,-1.36,{seated:true,gesture:.13+.42*ramp(moment,.2,.81)});
      for (const {wisp,x,offset} of steam) {
        const phase=(tick*1.6+offset)%1;
        wisp.position.set(x+Math.sin(phase*7+offset*3)*.055,1.19+phase*.51,.34);
        wisp.scale.setScalar(.16+phase*.20);
        wisp.material.opacity=.22*Math.sin(Math.PI*phase);
      }
    }
    setCamera(beat,tick,modern);
    renderer.render(scene,camera);
    return true;
  }

  function orbit(dx,dy) {
    heading=T.MathUtils.clamp(heading-dx*.0065,-.85,.85);
    tilt=T.MathUtils.clamp(tilt+dy*.0045,-.10,.47);
  }

  function zoom(delta) {
    scale=T.MathUtils.clamp(scale*Math.exp(delta*.0013),.70,1.72);
  }

  function resetCamera() {
    heading=0;
    tilt=0;
    scale=1;
    lastKey='';
  }

  const pointers=new Map();
  canvas.addEventListener('pointerdown',(event) => {
    if (event.button!==0&&event.pointerType!=='touch') return;
    pointers.set(event.pointerId,{x:event.clientX,y:event.clientY});
    canvas.setPointerCapture(event.pointerId);
  });
  canvas.addEventListener('pointermove',(event) => {
    const previous=pointers.get(event.pointerId);
    if (!previous) return;
    const other=[...pointers].find(([id]) => id!==event.pointerId)?.[1];
    if (other) {
      const before=Math.hypot(previous.x-other.x,previous.y-other.y);
      const after=Math.hypot(event.clientX-other.x,event.clientY-other.y);
      zoom((before-after)*3);
    } else {
      orbit(event.clientX-previous.x,event.clientY-previous.y);
    }
    previous.x=event.clientX;
    previous.y=event.clientY;
  });
  canvas.addEventListener('pointerup',(event) => pointers.delete(event.pointerId));
  canvas.addEventListener('pointercancel',(event) => pointers.delete(event.pointerId));
  canvas.addEventListener('lostpointercapture',(event) => pointers.delete(event.pointerId));
  canvas.addEventListener('wheel',(event) => {
    event.preventDefault();
    zoom(event.deltaY*(event.deltaMode===1?15:1));
  },{passive:false});

  return {draw,orbit,zoom,resetCamera};
}
