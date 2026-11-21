const M=[407,306],E=[{hour:0,label:"最初发现火情"},{hour:8,label:"火线越过南侧山脊"},{hour:18,label:"无人机定位东北侧热点"},{hour:27,label:"西南侧建立隔离带"},{hour:36,label:"隔离带趋于稳定"}],w=[[408,305,0],[449,295,4],[458,258,7],[482,283,9],[514,240,13],[535,252,16],[557,209,18],[592,215,20],[616,179,24],[650,203,27],[672,170,30],[676,214,34]];function k(e,s){const l=Math.sin(s*.016+e*.009+Math.sin(e*.008)*1.25),a=Math.sin(s*.012-e*.017+Math.sin(s*.013)),n=Math.sin(e*.051+s*.049)*Math.cos(e*.034-s*.059),i=Math.cos(e*.098-s*.08)*Math.sin(e*.13+s*.093);return .52+.22*l+.16*a+.06*n+.024*i}function C(e){const s=e.createImageData(960,500);for(let a=0;a<500;a++)for(let n=0;n<960;n++){const i=k(n,a),t=(i-k(n-2,a-2))*390,r=i*21%1<.045?12:0,d=(a*960+n)*4;s.data[d]=22+i*80+t+r,s.data[d+1]=39+i*80+t+r,s.data[d+2]=41+i*68+t+r,s.data[d+3]=255}e.putImageData(s,0,0);const l=new Path2D("M -12 392 C 79 431 111 319 207 355 S 273 399 348 365 S 424 381 470 414 S 582 369 650 395 S 811 457 985 343");e.lineCap="round",e.strokeStyle="#1d353e",e.lineWidth=9,e.stroke(l),e.strokeStyle="#63878a",e.lineWidth=2,e.stroke(l),e.beginPath();for(let a=0;a<960;a+=80)e.moveTo(a,0),e.lineTo(a,500);for(let a=0;a<500;a+=80)e.moveTo(0,a),e.lineTo(960,a);e.strokeStyle="#c8d8cb21",e.lineWidth=1,e.stroke(),e.fillStyle="#d1ded1bb",e.font="600 13px system-ui",e.fillText("NORTH RIDGE",162,155),e.fillText("CLEARWATER CREEK",85,416),e.fillText("EAST SUMMIT",733,136),e.fillText("▲  1,840 M",750,156),e.fillText("▲ N",894,44),e.fillStyle="#e2e9dbd9",e.font="11px system-ui",e.fillRect(797,452,102,2),e.fillRect(797,448,2,10),e.fillRect(897,448,2,10),e.fillText("2 KM",833,475)}function W(e,s,l){const a=(10+s*4.1)*l,n=M[0]+s*4.6,i=M[1]-s*2.6;e.beginPath();for(let t=0;t<=140;t++){const r=t/140*Math.PI*2,d=1+.18*Math.sin(r*5+1)+.1*Math.cos(r*9)+.06*Math.sin(r*17),v=Math.cos(r)*a*d*1.33,u=Math.sin(r)*a*d*.64,p=n+v*.84+u*.54,m=i-v*.54+u*.84;t===0?e.moveTo(p,m):e.lineTo(p,m)}e.closePath()}function I(e,s,l,a,n){e.drawImage(s,0,0);for(const i of[1,.83,.62,.37])W(e,l,i),e.fillStyle=i===1?"#e0472092":"#f76f241f",e.strokeStyle=i===1?"#ff8847":"#ffae604f",e.lineWidth=i===1?2:1,e.fill(),e.stroke();if(n){const i=427+l*6.6,t=213-l*2.7+Math.cos(l*.31)*22;e.setLineDash([5,6]),e.strokeStyle="#86e0f1b9",e.lineWidth=1.4,e.beginPath(),e.moveTo(369,242),e.quadraticCurveTo(i-43,t-32,i,t),e.stroke(),e.setLineDash([]),e.fillStyle="#95e4ef",e.beginPath(),e.moveTo(i,t-8),e.lineTo(i+7,t+6),e.lineTo(i,t+3),e.lineTo(i-7,t+6),e.fill(),e.font="600 12px system-ui",e.fillText("DRONE 07",i+12,t-8),l>=27&&(e.strokeStyle="#95e4ef",e.lineWidth=2,e.setLineDash([5,5]),e.beginPath(),e.moveTo(305,357),e.quadraticCurveTo(395,382,476,350),e.stroke(),e.setLineDash([]),e.fillText("CONTAINMENT LINE",311,395))}if(a)for(const[i,t,r]of w){if(l<r)continue;const d=l-r<8;e.beginPath(),e.arc(i,t,d?9:6,0,Math.PI*2),e.strokeStyle=d?"#ffd58d":"#ffab586d",e.lineWidth=1.2,e.stroke(),e.beginPath(),e.arc(i,t,d?3.2:2.1,0,Math.PI*2),e.fillStyle=d?"#ffe0a3":"#ffa35f",e.fill()}}function R(e){e.innerHTML=`
    <section class="wildfire-demo" aria-label="山火推演">
      <header class="wf-heading">
        <div><p class="wf-eyebrow">FIRETRACE / INCIDENT REPLAY</p><h3>山火蔓延回放</h3></div>
        <span class="wf-badge">模拟数据</span>
      </header>
      <div class="wf-map">
        <canvas width="960" height="500" aria-label="合成山地地形，橙色区域标示火线，光点标示热点"></canvas>
        <div class="wf-map-label"><span></span> RIDGEVIEW · 事件 07</div>
      </div>
      <div class="wf-readouts">
        <div><span>过火面积</span><strong data-area></strong></div>
        <div><span>活跃热点</span><strong data-hotspots></strong></div>
        <div><span>当前事件</span><strong data-event></strong></div>
      </div>
      <div class="wf-controls">
        <button type="button" class="wf-play" aria-pressed="false">▶ 播放</button>
        <div class="wf-timeline">
          <label for="wf-time">事件时间轴 <output id="wf-clock" for="wf-time" aria-live="off"></output></label>
          <input id="wf-time" type="range" min="0" max="36" step="0.1" value="18">
        </div>
      </div>
      <div class="wf-layers">
        <span>地图图层</span>
        <label><input type="checkbox" data-layer="hotspots" checked> 热点</label>
        <label><input type="checkbox" data-layer="teams" checked> 无人机与隔离带</label>
      </div>
    </section>
  `;const l=e.querySelector("canvas").getContext("2d");if(!l)return;const a=document.createElement("canvas");a.width=960,a.height=500,C(a.getContext("2d"));const n=e.querySelector("#wf-time"),i=e.querySelector("#wf-clock"),t=e.querySelector(".wf-play"),r=e.querySelector("[data-area]"),d=e.querySelector("[data-hotspots]"),v=e.querySelector("[data-event]"),u=e.querySelector('[data-layer="hotspots"]'),p=e.querySelector('[data-layer="teams"]'),m=new AbortController,g={signal:m.signal};let o=Number(n.value),h=null,b;function c(){I(l,a,o,u.checked,p.checked);const f=Math.round(o*60);i.value=`T+${String(Math.floor(f/60)).padStart(2,"0")}:${String(f%60).padStart(2,"0")}`,n.setAttribute("aria-valuetext",`${Math.floor(f/60)} 小时 ${f%60} 分`),n.value=o,r.textContent=`${(.06+o**1.72*.078).toFixed(1)} km²`,d.textContent=w.filter(([,,T])=>T<=o&&o-T<8).length,v.textContent=E.findLast(T=>o>=T.hour).label}function y(){h!==null&&cancelAnimationFrame(h),h=null,b=void 0,t.textContent="▶ 播放",t.setAttribute("aria-pressed","false")}function S(f){b!==void 0&&(o=Math.min(36,o+Math.min(f-b,50)*.003)),b=f,c(),o>=36?y():h=requestAnimationFrame(S)}return t.addEventListener("click",()=>{if(h!==null){y();return}o>=36&&(o=0),t.textContent="Ⅱ 暂停",t.setAttribute("aria-pressed","true"),h=requestAnimationFrame(S)},g),n.addEventListener("input",()=>{y(),o=Number(n.value),c()},g),u.addEventListener("change",c,g),p.addEventListener("change",c,g),c(),()=>{y(),m.abort()}}export{R as mountWildfire};
