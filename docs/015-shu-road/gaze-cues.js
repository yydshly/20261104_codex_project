window.createShuRoadGazeCues = function createShuRoadGazeCues({
  view, cascade, birdLedge, qinlingPeak, apeAnchor, rapidsAnchor, pineAnchor,
  qingniRockAnchor, qingniSocketAnchor, qingniTimberAnchor, gateWoodAnchor, gatePassAnchor, scenicActors,
  legendAnchor,forestCliffAnchor,cuckooAnchor,impactAnchor,taibaiAnchor,emeiAnchor
}) {
  const at = (index, progress) => view(index, progress).target;
  const scenes = [
    {
      features: {
        bird: {label:'鸟道 · 岩沿示意', target:birdLedge,fov:49},
        peaks: {label:'太白高峰 · 山形示意', target:taibaiAnchor},
        emei:{label:'峨眉巅 · 诗意遥接',target:emeiAnchor,fov:57},
        founders:{label:'蚕丛、鱼凫 · 想象人物',target:legendAnchor,fov:56}
      },
      poem: ['peaks','peaks',null,null,'bird'],
      description: ['peaks','peaks','bird','bird'],
      beats:{poem:[[0,'peaks'],[7.25,'founders'],[11.55,'peaks'],[17.35,'bird'],[20.55,'emei']],description:[[0,'peaks'],[5.35,'bird'],[10.8,'emei']]}
    },
    {
      features: {
        gap: {label:'开山豁口', target:[-119,20,56]},
        ladder: {label:'天梯与石栈', target:[-111.8,-.67,80.42],fov:58},
        workers: {label:'开路者 · 传说演绎',target:scenicActors.workers,fov:52}
      },
      poem: ['gap','ladder'],
      description: ['gap','gap','ladder','workers'],
      beats:{poem:[[0,'gap'],[2.60,'ladder']],description:[[0,'gap'],[6.0,'ladder'],[10.7,'workers']]}
    },
    {
      features: {
        dragons: {label:'六龙 · 神话演绎', target:[108,42,14]},
        river: {label:'回川白浪', target:rapidsAnchor,fov:58},
        crane: {label:'黄鹤飞过的峡谷', target:scenicActors.crane,fov:45},
        ape: {label:'攀岩的猿', target:scenicActors.ape,fov:38}
      },
      poem: ['dragons','river','crane','ape'],
      description: ['dragons','river','crane','ape'],
      beats:{poem:[[0,'dragons'],[2.70,'river'],[5.38,'crane'],[8.45,'ape']],
        description:[[0,'dragons'],[4.65,'river'],[9.0,'crane'],[10.25,'ape']]}
    },
    {
      features: {
        road: {label:'遗存参照 · 石碥道', evidence:'material', target:qingniRockAnchor},
        damp: {label:'唐文献 · 崖险泥泞', evidence:'document', target:qingniRockAnchor},
        sockets: {label:'栈孔示意 · 孔形孔位为推测', evidence:'hypothesis', target:qingniSocketAnchor,fov:49},
        timber: {label:'推测复原 · 短木栈', evidence:'hypothesis', target:qingniTimberAnchor},
        stars: {label:'参、井星宿 · 示意', direction:view.starDirection},
        rest:{label:'抚膺坐叹 · 旅人视角',target:eye=>eye.map((v,i)=>v+[1.8,-1.25,2.9][i]),fov:62}
      },
      poem: ['road','stars',null],
      description: ['damp','road','sockets','timber'],
      beats:{poem:[[0,'road'],[5.4,'stars'],[9.55,'rest']],
        description:[[0,'damp'],[5.75,'road'],[11.25,'sockets'],[17.65,'timber']]}
    },
    {
      features: {
        trees: {label:'古木', target:[-91,10,-3]},
        birds: {label:'古木间的成对鸟影',target:scenicActors.forestBird,fov:47},
        cliff:{label:'不可攀的巉岩',target:forestCliffAnchor,fov:59},
        cuckoo:{label:'子规 · 枝头鸟影',target:cuckooAnchor,fov:43},
        moon: {label:'空山夜月', direction:[-.30,.36,-.89]},
        valley: {label:'林外山谷', target:at(4,1)}
      },
      poem: [null,'valley','trees','moon',null],
      description: ['trees','birds','moon','valley'],
      beats:{poem:[[0,'valley'],[2.65,'cliff'],[5.25,'birds'],[10.4,'cuckoo'],[12.45,'moon'],[14.5,'valley']],
        description:[[0,'trees'],[2.05,'birds'],[4.5,'cuckoo'],[6.1,'moon'],[7.7,'valley']]}
    },
    {
      features: {
        waterfall: {label:'飞瀑与深壑', target:cascade(.43,.5),fov:59},
        pine: {label:'倒挂枯松', target:pineAnchor,fov:58},
        peaks: {label:'连峰绝壁', target:[17,48,-9],fov:64},
        impact:{label:'砯崖转石 · 崖间激流',target:impactAnchor,fov:55}
      },
      poem: ['pine','waterfall',null,null],
      description: ['peaks','pine','waterfall'],
      beats:{poem:[[0,'peaks'],[2.7,'pine'],[5.55,'waterfall'],[8.35,'impact']],
        description:[[0,'peaks'],[1.80,'pine'],[3.85,'waterfall'],[6.3,'impact']]}
    },
    {
      features: {
        gate: {label:'唐文献 · 界山为门', evidence:'document', target:gatePassAnchor},
        guard:{label:'一夫当关 · 人物为诗意演绎',evidence:'hypothesis',target:[129.25,-4.0,-89.7],fov:50},
        terrain: {label:'大剑山隘口 · 地形示意', evidence:'document', target:gatePassAnchor},
        timber: {label:'推测复原 · 矮墙木门', evidence:'hypothesis', target:gateWoodAnchor,fov:50}
      },
      poem: ['gate','gate'],
      description: ['gate','terrain','timber','timber'],
      beats:{poem:[[0,'gate'],[2.6,'guard']],description:[[0,'gate'],[6.1,'terrain'],[12.45,'timber']]}
    },
    {
      features: {
        trail: {label:'林间窄路', target:at(7,.72)},
        wolves: {label:'狼豺 · 人事警戒', target:scenicActors.wolf,fov:49},
        tiger: {label:'虎影 · 诗意演绎',target:scenicActors.tiger,fov:58},
        snake: {label:'贴地的蛇影',target:scenicActors.snake,fov:54},
        pack:{label:'弃置行囊 · 人事警戒示意',target:[158.8,-4.48,-52.9],fov:53}
      },
      poem: ['wolves','tiger','trail'],
      description: ['trail','tiger','wolves','trail'],
      beats:{poem:[[0,'wolves'],[5.45,'tiger'],[7.60,'snake'],[9.45,'pack']],
        description:[[0,'trail'],[3.0,'tiger'],[4.5,'snake'],[6.35,'wolves'],[10.45,'trail']]}
    },
    {
      features: {
        city: {label:'锦城城门与灯火', target:[205.5,-.15,111.2],fov:55},
        west: {label:'回望入蜀的山路', target:[60,11,136]}
      },
      poem: ['city','city','west'],
      description: ['city','city','city','west'],
      beats:{poem:[[0,'city'],[8.4,'west']],description:[[0,'city'],[9.6,'west']]}
    }
  ];

  return function resolveFeature(index, phase, line, eye, sourceTime, motionTime=0) {
    const scene = scenes[index];
    if (!scene) return null;
    const beat=Number.isFinite(sourceTime)?scene.beats[phase]?.findLast(([time])=>time<=sourceTime):null;
    const id = line < 0 ? Object.keys(scene.features)[0] : beat?.[1] || scene[phase]?.[line];
    const feature = scene.features[id];
    if (!feature) return null;
    const target = feature.direction
      ? eye.map((coordinate, axis)=>coordinate+feature.direction[axis]*100)
      : typeof feature.target==='function'?feature.target(id==='rest'?eye:motionTime):feature.target;
    return {id:index+'/'+id,label:feature.label,target,evidence:feature.evidence,fov:feature.fov || 61};
  };
};
