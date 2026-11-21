import{s as A,c as w}from"./index-BgWMffQg.js";const L=[{system:"left",name:"LM",diameter:7,color:"#ffab80",points:[[-5,-68,18],[-13,-56,25],[-20,-45,30],[-21,-34,32]]},{system:"left",name:"LAD",diameter:6,color:"#ff9773",points:[[-21,-34,32],[-21,-12,43],[-13,8,49],[-19,29,54],[-13,49,51],[-6,76,43]]},{system:"left",name:"LCx",diameter:6,color:"#ffb18a",points:[[-21,-34,32],[-44,-38,23],[-63,-32,6],[-75,-16,-17],[-64,0,-40],[-42,8,-49],[-29,20,-47]]},{system:"left",diameter:3.3,color:"#f98470",points:[[-20,-11,43],[-34,-2,45],[-46,16,46],[-55,28,42],[-58,46,36]]},{system:"left",diameter:2.8,color:"#ffa47b",points:[[-13,8,49],[3,14,42],[13,26,32],[17,44,18]]},{system:"left",diameter:2.4,color:"#ff9f76",points:[[-18,30,54],[-32,36,56],[-40,49,51],[-41,59,45]]},{system:"left",diameter:3.5,color:"#ff996e",points:[[-61,-32,7],[-68,-10,11],[-71,9,6],[-64,32,-1],[-58,48,-11]]},{system:"left",diameter:2.4,color:"#ffbc92",points:[[-68,-2,8],[-80,9,7],[-84,24,1],[-81,39,-8]]},{system:"left",diameter:2.2,color:"#ffa17b",points:[[-65,0,-38],[-53,17,-47],[-56,36,-50],[-45,48,-51]]},{system:"right",name:"RCA",diameter:7,color:"#74e5e4",points:[[12,-67,13],[24,-53,19],[47,-41,20],[67,-23,13],[73,-1,-7],[58,23,-27],[41,33,-41],[19,34,-49]]},{system:"right",name:"PDA",diameter:4.8,color:"#6ed2db",points:[[19,34,-49],[11,43,-49],[7,57,-43],[-3,75,-35]]},{system:"right",diameter:3.5,color:"#91dfe1",points:[[67,-23,13],[73,-7,26],[68,16,33],[60,31,38],[53,51,37]]},{system:"right",diameter:2.9,color:"#70c5cf",points:[[51,-39,18],[46,-20,30],[37,-2,32],[32,12,29]]},{system:"right",diameter:3.1,color:"#78dce6",points:[[57,24,-27],[56,37,-37],[42,53,-39],[33,63,-31]]},{system:"right",diameter:2.2,color:"#78dce6",points:[[41,33,-41],[33,44,-53],[23,51,-52]]}],m=[{name:"正位",yaw:0,pitch:0},{name:"RAO 30°",yaw:-30,pitch:0},{name:"LAO 45° / CRA 20°",yaw:45,pitch:20},{name:"LAO 45° / CAU 25°",yaw:45,pitch:-25}],C=L.map(e=>({...e,points:A(e.points)}));function k(e,d,p){return e?`${e<0?d:p} ${Math.abs(e)}°`:"0°"}function x(e,d,p,l){const r=C.filter(t=>p==="both"||t.system===p).map(t=>({...t,projected:t.points.map(d),depth:d(t.points[Math.floor(t.points.length/2)])[2]})).sort((t,n)=>t.depth-n.depth),g=r.map(({projected:t,depth:n,diameter:s,color:f})=>{const i=t.map(([c,a],o)=>`${o===0?"M":"L"}${c.toFixed(1)} ${a.toFixed(1)}`).join(" ");return l?`<path d="${i}" fill="none" stroke="#5a5654" stroke-width="${s+1.7}" opacity=".22"/>
        <path d="${i}" fill="none" stroke="#231f22" stroke-width="${s*.66}" opacity=".88"/>`:`<path d="${i}" fill="none" stroke="${f}" stroke-width="${s+3}" opacity=".17"/>
      <path d="${i}" fill="none" stroke="${f}" stroke-width="${s}" opacity="${Math.min(.99,.78+n/330)}"/>
      <path d="${i}" fill="none" stroke="#fff" stroke-width="${s*.23}" opacity=".25"/>`}),h=l?[]:r.filter(t=>t.name).map(t=>{const[n,s]=t.projected[Math.floor(t.projected.length*.7)];return`<text x="${(n+(t.name==="LCx"?-10:11)).toFixed(1)}" y="${(s-8).toFixed(1)}" text-anchor="${t.name==="LCx"?"end":"start"}">${t.name}</text>`});e.innerHTML=[...g,...h].join("")}function V(e){e.innerHTML=`
    <section class="angio-demo" aria-label="冠状动脉投影教学演示">
      <header class="angio-heading">
        <div><p class="angio-eyebrow">ANGIOVIEW / PROJECTION LAB</p><h3>冠状动脉投影</h3></div>
        <span class="angio-badge">教学示意</span>
      </header>
      <div class="angio-views">
        <figure class="angio-figure">
          <figcaption><span>01</span> 三维血管示意</figcaption>
          <svg class="angio-model" viewBox="0 0 280 246" role="img" aria-label="彩色冠状动脉分支三维示意">
            <defs>
              <pattern id="angio-model-grid" width="22" height="22" patternUnits="userSpaceOnUse"><path d="M 22 0 H 0 V 22" fill="none" stroke="#89d6de" stroke-opacity=".14" stroke-width="1"/></pattern>
              <radialGradient id="angio-model-vignette"><stop stop-color="#234052"/><stop offset="1" stop-color="#101c2a"/></radialGradient>
            </defs>
            <rect width="280" height="246" fill="url(#angio-model-vignette)"/>
            <rect width="280" height="246" fill="url(#angio-model-grid)"/>
            <g fill="none" stroke="#89d6de" stroke-width=".8" stroke-opacity=".28">
              <path d="M22 53 V23 H52 M228 23 H258 V53 M258 193 V223 H228 M52 223 H22 V193"/>
              <ellipse cx="140" cy="123" rx="110" ry="79" stroke-dasharray="3 5" transform="rotate(-27 140 123)"/>
            </g>
            <g class="angio-axis" font-family="monospace" font-size="10" fill="#b4d9df"><text x="30" y="40">+Y</text><text x="233" y="213">3D</text></g>
            <g data-model-vessels stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </figure>
        <figure class="angio-figure">
          <figcaption><span>02</span> 二维造影模拟</figcaption>
          <svg class="angio-projection" viewBox="0 0 280 246" role="img" aria-label="根据同一拍摄角度计算的冠状动脉二维投影">
            <defs>
              <radialGradient id="angio-film"><stop stop-color="#e1e2dc"/><stop offset=".72" stop-color="#b6b5b0"/><stop offset="1" stop-color="#6e7071"/></radialGradient>
              <pattern id="angio-film-lines" width="5" height="5" patternUnits="userSpaceOnUse"><path d="M0 .5 H5" stroke="#fff" stroke-opacity=".19"/></pattern>
            </defs>
            <rect width="280" height="246" fill="url(#angio-film)"/>
            <path d="M129 -4 Q136 115 115 248 M153 -4 Q156 111 140 247" fill="none" stroke="#5c585c" stroke-width="11" opacity=".1"/>
            <path d="M-10 62 Q110 15 290 61 M-10 94 Q108 42 290 97 M-10 130 Q108 74 290 134 M-10 165 Q108 110 290 172 M-10 203 Q108 147 290 210" fill="none" stroke="#f4f4ec" stroke-width="6" opacity=".19"/>
            <rect width="280" height="246" fill="url(#angio-film-lines)"/>
            <path d="M22 53 V23 H52 M228 23 H258 V53 M258 193 V223 H228 M52 223 H22 V193" fill="none" stroke="#3e3b3e" stroke-opacity=".65"/>
            <g data-projection-vessels stroke-linecap="round" stroke-linejoin="round"/>
            <text data-film-label x="31" y="208" fill="#343239" font-family="monospace" font-size="10" font-weight="700"></text>
          </svg>
        </figure>
      </div>
      <div class="angio-controls">
        <div class="angio-ranges">
          <div>
            <label for="angio-yaw">左右斜位 <output for="angio-yaw" data-yaw-value aria-live="off"></output></label>
            <input id="angio-yaw" type="range" min="-75" max="75" value="25">
          </div>
          <div>
            <label for="angio-pitch">头尾倾角 <output for="angio-pitch" data-pitch-value aria-live="off"></output></label>
            <input id="angio-pitch" type="range" min="-40" max="40" value="12">
          </div>
        </div>
        <div class="angio-presets" role="group" aria-label="角度预设">
          ${m.map(({name:a},o)=>`<button type="button" data-pose="${o}" aria-pressed="false">${a}</button>`).join("")}
        </div>
        <fieldset class="angio-choice">
          <legend>显示血管</legend>
          <label><input type="radio" name="angio-system" value="both" checked> 全部</label>
          <label><input type="radio" name="angio-system" value="left"> 左冠</label>
          <label><input type="radio" name="angio-system" value="right"> 右冠</label>
        </fieldset>
      </div>
    </section>
  `;const d=e.querySelector("[data-model-vessels]"),p=e.querySelector("[data-projection-vessels]"),l=e.querySelector("#angio-yaw"),r=e.querySelector("#angio-pitch"),g=e.querySelector("[data-yaw-value]"),h=e.querySelector("[data-pitch-value]"),t=e.querySelector("[data-film-label]"),n=[...e.querySelectorAll("[data-pose]")],s=e.querySelectorAll('[name="angio-system"]'),f=new AbortController,i={signal:f.signal};function c(){const a=Number(l.value),o=Number(r.value),b=e.querySelector('[name="angio-system"]:checked').value,u=k(a,"RAO","LAO"),y=k(o,"CAU","CRA");g.value=u,h.value=y,l.setAttribute("aria-valuetext",u),r.setAttribute("aria-valuetext",y),t.textContent=`${u} / ${y}`,n.forEach(($,M)=>{const v=m[M];$.setAttribute("aria-pressed",String(v.yaw===a&&v.pitch===o))}),x(d,w(a-22,o-8,!0),b,!1),x(p,w(a,o,!1),b,!0)}return l.addEventListener("input",c,i),r.addEventListener("input",c,i),s.forEach(a=>a.addEventListener("change",c,i)),n.forEach((a,o)=>a.addEventListener("click",()=>{l.value=m[o].yaw,r.value=m[o].pitch,c()},i)),c(),()=>f.abort()}export{V as mountAngio};
