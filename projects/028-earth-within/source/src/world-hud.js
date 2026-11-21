import { MathUtils, Vector3 } from 'three';
import { groundSurfaceHeight, riverCurrentAt, riverWidth, riverZ } from './world-terrain.js';

const bearings = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
const mediumNames = { walk: '徒步', wade: '涉水', swim: '水面游泳', dive: '水下' };

function bindHold(button, setHeld, canvas) {
  let pointer = null;
  const release = () => {
    pointer = null;
    setHeld(false);
  };
  button.addEventListener('pointerdown', (event) => {
    if (pointer !== null || event.button !== 0) return;
    event.preventDefault();
    pointer = event.pointerId;
    button.setPointerCapture(pointer);
    setHeld(true);
  });
  button.addEventListener('lostpointercapture', release);
  button.addEventListener('keydown', (event) => {
    if (event.code !== 'Space' && event.code !== 'Enter') return;
    event.preventDefault();
    setHeld(true);
  });
  button.addEventListener('keyup', release);
  button.addEventListener('blur', release);
  button.addEventListener('pointerup', () => canvas.focus({ preventScroll: true }));
}

export function createWalkHud(walker, canvas, stops, renderPlace) {
  const hud = document.getElementById('walk-hud');
  const altitude = document.getElementById('walk-altitude');
  const bearing = document.getElementById('walk-bearing');
  const mode = document.getElementById('walk-mode');
  const pad = document.getElementById('move-pad');
  const swimControls = document.getElementById('swim-controls');
  const swimHint = document.getElementById('swim-hint');
  const landControls = document.getElementById('land-controls');
  const landHint = document.getElementById('land-hint');
  const waterAction = document.getElementById('water-action');
  const waterNote = document.getElementById('water-action-note');
  const direction = new Vector3();
  const current = new Vector3();
  let lastMedium = '';
  let lastPlace = '';
  let padPointer = null;

  function steer(event) {
    const bounds = pad.getBoundingClientRect();
    const travel = bounds.width * .32;
    const dx = (event.clientX - bounds.left - bounds.width / 2) / travel;
    const dy = (event.clientY - bounds.top - bounds.height / 2) / travel;
    const norm = Math.max(1, Math.hypot(dx, dy));
    pad.style.setProperty('--stick-x', `${dx / norm * travel}px`);
    pad.style.setProperty('--stick-y', `${dy / norm * travel}px`);
    walker.setTouch(dx / norm, -dy / norm);
  }

  function releasePad() {
    padPointer = null;
    pad.style.removeProperty('--stick-x');
    pad.style.removeProperty('--stick-y');
    walker.setTouch(0, 0);
  }

  pad.addEventListener('pointerdown', (event) => {
    if (padPointer !== null || event.button !== 0) return;
    event.preventDefault();
    padPointer = event.pointerId;
    pad.setPointerCapture(padPointer);
    steer(event);
  });
  pad.addEventListener('pointermove', (event) => {
    if (event.pointerId === padPointer) steer(event);
  });
  pad.addEventListener('lostpointercapture', releasePad);
  bindHold(document.getElementById('swim-up'), (held) => walker.setVertical(held ? 1 : 0), canvas);
  bindHold(document.getElementById('swim-down'), (held) => walker.setVertical(held ? -1 : 0), canvas);
  bindHold(document.getElementById('land-crouch'), walker.setCrouch, canvas);
  bindHold(document.getElementById('land-sprint'), walker.setSprint, canvas);
  document.getElementById('land-jump').addEventListener('click', () => {
    walker.jump();
    canvas.focus({ preventScroll: true });
  });
  waterAction.addEventListener('click', () => {
    walker.waterAction(); canvas.focus({ preventScroll: true });
  });

  const details = [
    ['cabin', 10, '雪原', '走到门廊边，可以看到窗里的暖光和屋外留下的雪痕。'],
    ['bee', 9.6, '草甸特写', '走到花丛边，看蜜蜂飞向树下露出的六角蜂房。'],
    ['ant', 8.5, '土层特写', '从露出的土层正面看，工蚁经过窄隧道，下方巢室里聚着浅色幼虫。'],
    ['ranch', 13, '平原牧场', '沿围栏看牛羊在草地上吃草和走动。'],
    ['tropics', 15, '热带森林', '顺着林下的小路向前，经过棕榈、蕨类和垂下来的根。'],
    ['wetland', 9, '河口湿地', '从岸上看鸟在芦苇旁活动，等它们把头探向水面。'],
    ['dunes', 11, '海岸沙丘', '越过沙坡就能看到岸线，脚边有风留下的细纹和矮草。'],
    ['tide', 6.8, '海岸特写', '靠近岩石边缘看向水里，留意海星和贴着池沿移动的蟹。'],
    ['river', 9.5, '河岸木屋', '屋檐下有燕巢。想游泳，可以从木屋下游的草坡走进河里，朝河心走到水变深。'],
  ];

  function describe(x, z, medium) {
    if (medium === 'low') return ['river', '低顶避让', '从桥底挪向开阔处', '水已变浅，头顶空间还不足以站起。沿开阔处慢慢移动，离开低顶后会恢复站姿。'];
    const tidalReach = x > 45 && x < 82 && Math.abs(z - riverZ(x)) < riverWidth(x) + Math.max(0, x - 60) * .45;
    if (tidalReach && (medium === 'swim' || medium === 'dive')) {
      riverCurrentAt(x, z, groundSurfaceHeight(x, z), walker.depth, current);
      const inland = current.x < -.08, slack = Math.abs(current.x) < .08;
      return ['wetland', medium === 'dive' ? '河口水下' : '潮汐河口',
        slack ? '河口水流正在换向' : inland ? '海水推进河口' : '河水流向海里',
        slack ? '涨退潮交替时，水流会先减缓再换向。可以看漂叶和鱼群，或用右上角按钮比较两种流向。'
          : `松开方向键，会随水漂向${inland ? '河内' : '海里'}；逆着水游会慢一些。右上角可以切换涨退潮，水位会连续变化。`];
    }
    if (medium === 'dive') {
      if (x < 55) return [x < -43 ? 'gorge' : 'river', '水下探索', '河水底下', '留意顶着水流摆尾的小鱼。按空格或「上浮」回到水面，朝浅处游就能上岸。'];
      const id = x >= 86 ? 'reef-deep' : x >= 75 ? 'kelp' : 'dive';
      const { name, description } = stops.get(id);
      return [id, '水下探索', name, description];
    }
    if (medium === 'swim') {
      if (x < 55) return [x < -43 ? 'gorge' : 'river', '游泳', '河道水面', '松开方向键会随水漂向下游，逆流游会慢一些。顺着漂叶能看出流向，按 C 可以下潜。'];
      return ['ocean', '海面', '游向浅海', '游过浪线后按下潜键，也可以朝岸边游回浅滩。'];
    }
    for (const [id, radius, region, description] of details) {
      const { target, name } = stops.get(id);
      if (Math.hypot(x - target[0], z - target[2]) < radius) return [id, region, name, description];
    }
    if (x < -88) return ['snow', '徒步 · 上游', '雪线步道', '沿浅色小径和路标下行，融雪河从岩坡间流向峡谷。'];
    if (x < -44) return ['gorge', '徒步 · 山谷', '沿峡谷下行', '小径在河道右岸转弯。顺着河水流动的方向，能走到下游木屋。'];
    if (x < 45) return ['meadow', '徒步 · 草甸', '沿河走向海岸', '留意步道旁的木牌。蜂巢在开花的草甸里，露出的蚁道就在下游。'];
    return ['ocean', '徒步 · 海岸', '潮池与入水口', '从礁石潮池往沙滩走，水深到腰部会进入游泳。往海里游几步就能下潜。'];
  }

  return {
    setVisible(visible) {
      hud.hidden = !visible;
      lastPlace = '';
      lastMedium = '';
      releasePad();
      walker.setVertical(0);
      walker.setCrouch(false);
      walker.setSprint(false);
    },
    update(camera) {
      const { x, z } = camera.position;
      const medium = walker.medium;
      const movementMode = walker.lowClearance ? 'low' : medium;
      const wet = !walker.lowClearance && (medium === 'swim' || medium === 'dive');
      waterAction.hidden = !walker.nearWater || walker.lowClearance;
      const actionLabel = medium === 'dive' ? 'F 拨水' : wet || medium === 'wade' ? 'F 戏水' : 'F 跃水';
      if (waterAction.textContent !== actionLabel) waterAction.textContent = actionLabel;
      waterAction.disabled = walker.airborne;
      waterAction.title = medium === 'walk' ? '面向较深的水面跃入水中' : medium === 'dive' ? '挥动手臂，拨开水和气泡' : '拍水或踢起浅水';
      const note = walker.actionNote;
      waterNote.hidden = !note;
      if (waterNote.textContent !== note) waterNote.textContent = note;
      if (lastMedium !== movementMode) {
        lastMedium = movementMode;
        hud.dataset.medium = movementMode;
        swimControls.hidden = !wet;
        swimHint.hidden = !wet;
        landControls.hidden = medium !== 'walk';
        landHint.hidden = medium !== 'walk';
      }
      const label = walker.lowClearance ? '低姿挪动' : walker.diving ? '跃水' : walker.airborne ? '腾空' : walker.playPhase >= 0 ? '戏水' : walker.crouch > .1 ? '下蹲' : walker.sprinting ? '冲刺' : mediumNames[medium];
      if (mode.textContent !== label) mode.textContent = label;
      const level = medium === 'dive' ? `深度 ${walker.depth.toFixed(1)} m`
        : medium === 'wade' || medium === 'swim' ? `水深 ${walker.waterDepth.toFixed(1)} m`
          : `海拔 ${Math.max(0, groundSurfaceHeight(x, z)).toFixed(0)} m`;
      if (altitude.textContent !== level) altitude.textContent = level;
      camera.getWorldDirection(direction);
      const index = Math.round(MathUtils.radToDeg(Math.atan2(direction.x, -direction.z)) / 45);
      const heading = bearings[(index + 8) % 8];
      if (bearing.textContent !== heading) bearing.textContent = heading;
      const [id, region, name, description] = describe(x, z, movementMode);
      const key = `${movementMode}/${id}/${name}`;
      if (key !== lastPlace) {
        lastPlace = key;
        renderPlace(id, { region, name, description });
      }
    },
  };
}
