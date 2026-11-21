const I=["#4e9ce5","#b081f7"],K=["#ffc56e","#6fe7df"];function T(a){return(1+(a/.32)**2)**-1.5}function Q(){return`
    <section class="induction-lab__comparison" aria-labelledby="induction-comparison-title">
      <span class="induction-lab__eyebrow">对照实验 01 · 磁铁速度</span>
      <h3 id="induction-comparison-title">同一块磁铁，快推和慢推有什么区别？</h3>
      <p>两次都让同一磁极朝前，从左到右匀速穿过同一个 150 匝线圈。第一次速度固定为 1×。拖动滑块，只改变第二次的速度。</p>
      <label class="induction-lab__speed">第二次速度
        <input type="range" data-speed-ratio min="1" max="3" step=".25" value="2">
        <output data-speed-value aria-live="off">2×</output>
      </label>
      <div class="induction-lab__peaks" aria-label="感应电动势绝对峰值（相对单位）">
        <span class="induction-lab__voltage">第一次峰值 <output data-base-peak></output></span>
        <span class="induction-lab__current">第二次峰值 <output data-test-peak aria-live="off"></output></span>
        <span>相对单位</span>
      </div>
      <svg class="induction-lab__plot" viewBox="0 0 440 166" role="img" aria-label="两个速度下的感应电动势。横轴为磁铁位置，纵轴为带正负的电动势。">
        <path class="induction-lab__axes" d="M28 74H424M226 12V136"/>
        <text x="12" y="24">+</text><text x="12" y="78">0</text><text x="12" y="130">−</text>
        <path data-base-curve stroke="#ffc56e"/><path data-test-curve stroke="#6fe7df" stroke-dasharray="5 3"/>
        <text x="28" y="154">接近线圈</text><text x="226" y="154" text-anchor="middle">线圈中心</text><text x="424" y="154" text-anchor="end">离开线圈</text>
      </svg>
      <details>
        <summary>为什么速度会改变峰值？</summary>
        <p>磁铁越快，同样的磁通变化就发生在越短的时间里。按法拉第定律，感应电动势是每匝磁通的变化率乘以匝数再取负。在这个模型里，磁铁经过中心前后，磁通由增转减，电动势的正负也跟着反转。 <a href="https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law" target="_blank" rel="noopener noreferrer">法拉第定律</a></p>
      </details>
    </section>`}function Z(a){const c=a.querySelector("[data-speed-ratio]"),e=a.querySelector("[data-speed-value]"),l=a.querySelector("[data-base-curve]"),b=a.querySelector("[data-test-curve]"),t=a.querySelector("[data-test-peak]"),s=.001,o=Array.from({length:101},(u,m)=>{const x=m/50-1;return-(T(x+s)-T(x-s))/(2*s*4)}),r=Math.max(...o.map(Math.abs)),d=59/(r*Number(c.max));function h(u){return o.map((m,x)=>`${x?"L":"M"}${(28+x*3.96).toFixed(2)} ${(74-m*u*d).toFixed(2)}`).join(" ")}function f(){const u=Number(c.value);e.value=`${u}×`,t.value=(r*u).toFixed(2),b.setAttribute("d",h(u))}l.setAttribute("d",h(1)),a.querySelector("[data-base-peak]").value=r.toFixed(2),c.addEventListener("input",f),f()}function Y(a){const c=a.getBoundingClientRect(),e=Math.min(window.devicePixelRatio||1,2),l=Math.max(1,Math.round(c.width*e)),b=Math.max(1,Math.round(c.height*e));(a.width!==l||a.height!==b)&&(a.width=l,a.height=b);const t=a.getContext("2d");return t.setTransform(e,0,0,e,0,0),{context:t,width:c.width,height:c.height}}function z(a){return Math.min(224,a*.33)}function tt(a,c,e,l,b){const{context:t,width:s,height:o}=Y(a);if(!s||!o)return;const r=s/2,d=o*.51,h=r+c*z(s),f=Math.min(90,s*.24),u=26,m=t.createRadialGradient(r,d,12,r,d,s*.65);m.addColorStop(0,"#172f50"),m.addColorStop(1,"#0a1426"),t.fillStyle=m,t.fillRect(0,0,s,o),t.strokeStyle="#243650",t.lineWidth=.7,t.beginPath();for(let i=r%24;i<s;i+=24)t.moveTo(i,0),t.lineTo(i,o);for(let i=d%24;i<o;i+=24)t.moveTo(0,i),t.lineTo(s,i);t.stroke(),t.strokeStyle="#587092",t.setLineDash([4,5]),t.beginPath(),t.moveTo(14,d),t.lineTo(s-14,d),t.moveTo(r,24),t.lineTo(r,o-20),t.stroke(),t.setLineDash([]);const x=t.createLinearGradient(h-110,d,h+110,d);x.addColorStop(0,I[e>0?0:1]),x.addColorStop(1,I[e>0?1:0]),t.strokeStyle=x,t.lineWidth=1.05;for(let i=0;i<12;i+=1){const w=(34+i*12+i**2*2.2)*Math.min(s/520,1);t.globalAlpha=.78-i*.045,t.beginPath();for(let p=0;p<=96;p+=1){const _=p/96*2*Math.PI,g=Math.sin(_),S=w*g**2,M=h+S*Math.cos(_),y=d+S*g;p===0?t.moveTo(M,y):t.lineTo(M,y)}t.stroke()}t.globalAlpha=1;const P=Math.round(5+l/30),k=Math.min(57,s*.19),B=Math.min(76,s*.24),E=Math.min(1,Math.abs(b));t.lineWidth=1.6,t.strokeStyle=`rgba(255, 177, 103, ${.48+E*.45})`,t.shadowColor="#f49e5e",t.shadowBlur=E*13;for(let i=0;i<P;i+=1){const w=r+(i/(P-1)-.5)*B;t.beginPath(),t.ellipse(w,d,10,k,-.12,0,Math.PI*2),t.stroke()}t.shadowBlur=0,t.save(),t.beginPath(),t.roundRect(h-f/2,d-u/2,f,u,6),t.clip(),t.fillStyle=I[e>0?0:1],t.fillRect(h-f/2,d-u/2,f/2,u),t.fillStyle=I[e>0?1:0],t.fillRect(h,d-u/2,f/2,u),t.restore(),t.fillStyle="#091525",t.font="bold 12px ui-monospace, monospace",t.textAlign="center",t.textBaseline="middle",t.fillText(e>0?"S":"N",h-f/4,d),t.fillText(e>0?"N":"S",h+f/4,d)}function U(a,c){const{context:e,width:l,height:b}=Y(a);if(!l||!b)return;const t=11,s=b/2;e.fillStyle="#0a1426",e.fillRect(0,0,l,b),e.strokeStyle="#263951",e.lineWidth=.75,e.beginPath();for(let o=t;o<l;o+=24)e.moveTo(o,t),e.lineTo(o,b-t);for(let o=-2;o<=2;o+=1){const r=s+o*(b-t*2)/4;e.moveTo(t,r),e.lineTo(l-t,r)}e.stroke(),c.forEach((o,r)=>{e.strokeStyle=K[r],e.lineWidth=r===0?2:1.45,e.beginPath(),o.forEach((d,h)=>{const f=t+h/209*(l-t*2),u=s-Math.tanh(d)*(s-t);h===0?e.moveTo(f,u):e.lineTo(f,u)}),e.stroke()})}function et(){return`
    <aside class="induction-lab__instruments" aria-label="实时仪表">
      <span class="induction-lab__eyebrow">02 / 实时读数</span>
      <h4>检流计</h4>
      <svg viewBox="0 0 188 120" class="induction-lab__meter" aria-hidden="true">
        <path d="M27.66 52.8 A82 82 0 0 1 160.34 52.8"/>
        <g>${Array.from({length:13},(c,e)=>{const l=(e-6)*9;return`<line x1="94" x2="94" y1="19" y2="${e%3===0?29:25}" transform="rotate(${l} 94 101)"/>`}).join("")}</g>
        <text x="18" y="66">−</text><text x="90" y="14">0</text><text x="162" y="66">+</text>
        <line data-needle x1="94" y1="101" x2="94" y2="26"/>
        <circle cx="94" cy="101" r="4"/>
      </svg>
      <dl>
        <div><dt>感应电动势</dt><dd><output data-voltage aria-live="off">0.00</output></dd></div>
        <div><dt>感应电流</dt><dd><output data-current aria-live="off">0.00</output></dd></div>
        <div><dt>每匝磁通</dt><dd><output data-flux aria-live="off">0.00</output></dd></div>
      </dl>
      <p>相对单位 · 按当前模型计算</p>
    </aside>`}function at(){return`
    <section class="induction-lab__flux-panel" aria-label="磁通随磁铁位置变化">
      <div class="induction-lab__scope-label">
        <span class="induction-lab__eyebrow">04 / 磁通与位置</span>
        <span>圆点是磁铁当前位置</span>
      </div>
      <svg viewBox="0 0 350 132" role="img" aria-label="磁通与位置曲线，磁铁经过线圈中心时磁通的绝对值最大">
        <path class="induction-lab__axes" d="M12 66H338M175 13V113"/>
        <path data-flux-curve d="${Array.from({length:101},(c,e)=>`${e?"L":"M"}${(12+e*3.26).toFixed(2)} ${(66-T(e/50-1)*47).toFixed(2)}`).join(" ")}"/>
        <line data-flux-marker x1="175" x2="175" y1="13" y2="113"/>
        <circle data-flux-point cx="175" cy="19" r="4"/>
        <text x="12" y="125">左</text><text x="175" y="125" text-anchor="middle">线圈中心</text><text x="338" y="125" text-anchor="end">右</text>
      </svg>
    </section>`}function nt(a,{createScene:c}={}){const e=!!c;a.innerHTML=`
    <section class="induction-lab${e?" induction-lab--bench":""}" aria-label="电磁感应实验">
      <header class="induction-lab__header">
        <div>
          <span class="induction-lab__eyebrow">FIELD STUDY / 04</span>
          <h3>${e?"磁铁穿过线圈":"电磁感应实验台"}</h3>
        </div>
        <span class="induction-lab__tag">教学模型</span>
      </header>
      <div class="induction-lab__apparatus">
      <div class="induction-lab__scene" data-scene>
        <canvas data-field aria-hidden="true"></canvas>
        ${e?`
          <div class="induction-lab__scene-bar">
            <span>01 / 磁铁与线圈</span>
            <div role="group" aria-label="观察视角">
              <button type="button" data-view="angled" aria-pressed="true">斜视</button>
              <button type="button" data-view="side" aria-pressed="false">侧视</button>
              <button type="button" data-view="top" aria-pressed="false">俯视</button>
              <button type="button" data-view="axis" aria-pressed="false">沿轴</button>
            </div>
          </div>`:""}
        <span class="induction-lab__guide" data-scene-guide>${e?"拖磁铁沿轴移动 · 拖空白处旋转 · 滚轮缩放":"左右拖动磁铁穿过线圈"}</span>
      </div>
      ${e?et():""}
      </div>
      <div class="induction-lab__controls">
        <div class="induction-lab__buttons" role="group" aria-label="实验控制">
          <button type="button" data-auto aria-pressed="true">自动往复</button>
          <button type="button" data-flip>反转磁极</button>
          ${e?'<button type="button" data-lines aria-pressed="true">磁铁场线</button>':""}
          <button type="button" data-reset>重置</button>
        </div>
        <label>磁铁位置 <input type="range" data-position min="-100" max="100" value="0"></label>
        <label>线圈匝数 <input type="range" data-turns min="30" max="300" step="10" value="150"> <output data-turns-value>150</output></label>
        ${e?'<label>往复速度 <input type="range" data-auto-speed min=".5" max="2" step=".25" value="1"> <output data-auto-speed-value>1×</output></label>':""}
      </div>
      <div class="induction-lab__charts">
      <div class="induction-lab__scope">
        <div class="induction-lab__scope-label">
          <span class="induction-lab__eyebrow">${e?"03 / 实时示波器":"实时示波器"}</span>
          <span class="induction-lab__voltage">感应电动势 ${e?"":'<output data-voltage aria-live="off">0.00</output>'}</span>
          <span class="induction-lab__current">感应电流 ${e?"":'<output data-current aria-live="off">0.00</output>'}</span>
        </div>
        <canvas data-trace role="img" aria-label="最近 7 秒的感应电动势和感应电流曲线"></canvas>
      </div>
      ${e?at():""}
      </div>
      <p class="induction-lab__note">场线显示磁铁的理想偶极场。读数由简化模型计算，采用相对单位。</p>
      ${e?Q():""}
      ${e?`
        <section class="induction-lab__comparison induction-lab__extensions" aria-labelledby="induction-extensions">
          <span class="induction-lab__eyebrow">扩展方向</span>
          <h3 id="induction-extensions">可以接着做哪些实验</h3>
          <dl>
            <div><dt>同条件比较</dt><dd>把线圈角度、磁铁和导线材料加入可保存的实验条件。每次只改一项，叠加波形，记录峰值和方向。原版的导体管落磁实验可作为下一套装置。</dd></div>
            <div><dt>接真实仪器</dt><dd>导入电压、磁铁位置和时间的数据，在同一张图上对照实测与模型，检查峰值和过零时刻的差异。</dd></div>
            <div><dt>从线圈到发电机</dt><dd>把往复磁铁换成旋转线圈，观察转速怎样改变交流频率，再接不同负载看电流和输出功率。</dd></div>
          </dl>
          <a href="https://electromagnetism.wasmer.app/" target="_blank" rel="noopener noreferrer">对照作者原版 ↗</a>
        </section>`:""}
    </section>`,e&&Z(a);const l=a.querySelector("[data-field]"),b=a.querySelector("[data-trace]"),t=a.querySelector("[data-auto]"),s=a.querySelector("[data-position]"),o=a.querySelector("[data-turns]"),r=a.querySelector("[data-turns-value]"),d=a.querySelector("[data-voltage]"),h=a.querySelector("[data-current]"),f=a.querySelector("[data-flux]"),u=a.querySelector("[data-flux-curve]"),m=a.querySelector("[data-flux-point]"),x=a.querySelector("[data-flux-marker]"),P=a.querySelector("[data-needle]"),k=a.querySelector("[data-auto-speed]"),B=a.querySelector("[data-auto-speed-value]"),E=window.matchMedia("(prefers-reduced-motion: reduce)"),i=[Array(210).fill(0),Array(210).fill(0)],w=e?-.78:0;let p=w,_=p,g=1,S=150,M=0,y=0,W=0,N=0,q=!E.matches,O=0,V=0,$=null,A;function L(n){q=n,t.setAttribute("aria-pressed",String(q)),q&&(W=Math.asin(Math.max(-1,Math.min(1,p/.9))))}function D(){i.forEach(n=>n.fill(0)),M=0,y=0,U(b,i)}function C(n){_=n,s.value=String(Math.round(_*100))}function j(n){const v=l.getBoundingClientRect();C(Math.max(-1,Math.min(1,(n.clientX-v.left-v.width/2)/z(v.width))))}const G=[...a.querySelectorAll("[data-view]")];if(e)try{A=c(a.querySelector("[data-scene]"),{onMove:C,onGrab:()=>{L(!1),C(p)},onOrbit:()=>G.forEach(n=>n.setAttribute("aria-pressed","false"))}),l.hidden=!0}catch{a.querySelector("[data-scene]").classList.add("induction-lab__scene--fallback"),a.querySelector("[data-scene-guide]").textContent="二维视图 · 左右拖动磁铁穿过线圈"}G.forEach(n=>n.addEventListener("click",()=>{A?.setView(n.dataset.view),G.forEach(v=>v.setAttribute("aria-pressed",String(v===n)))}));const F=a.querySelector("[data-lines]");F?.addEventListener("click",()=>{const n=F.getAttribute("aria-pressed")!=="true";F.setAttribute("aria-pressed",String(n)),A.setFieldVisible(n)}),F&&!A&&(F.hidden=!0),k?.addEventListener("input",()=>{B.value=`${k.value}×`}),C(w),L(q),t.addEventListener("click",()=>L(!q)),a.querySelector("[data-flip]").addEventListener("click",()=>{g*=-1}),a.querySelector("[data-reset]").addEventListener("click",()=>{p=w,C(w),g=1,S=150,o.value="150",r.value="150",k&&(k.value="1",B.value="1×"),L(!E.matches),D()}),s.addEventListener("input",()=>{L(!1),_=Number(s.value)/100}),o.addEventListener("input",()=>{S=Number(o.value),r.value=o.value}),l.addEventListener("pointerdown",n=>{$!==null||n.button!==0||(L(!1),$=n.pointerId,l.setPointerCapture($),j(n))}),l.addEventListener("pointermove",n=>{n.pointerId===$&&j(n)}),l.addEventListener("lostpointercapture",n=>{n.pointerId===$&&($=null)});function X(n){const v=O?Math.min((n-O)/1e3,.05):0;O=n,q&&(W+=v*1.35*Number(k?.value??1),_=Math.sin(W)*.9);const J=p;if(p+=(_-p)*(1-Math.exp(-v*16)),M=v?-g*(S/150)*(T(p)-T(J))/(v*4):0,y+=(M/(1+S/420)-y)*(1-Math.exp(-v*11)),q&&(s.value=String(Math.round(_*100))),A?A.render(p,g,S,y):tt(l,p,g,S,y),N+=v,N>=1/30&&(N%=1/30,i[0].push(M),i[1].push(y),i.forEach(R=>R.shift()),U(b,i),d.value=(Math.abs(M)<.005?0:M).toFixed(2),h.value=(Math.abs(y)<.005?0:y).toFixed(2),e)){const R=g*T(p),H=(175+p*163).toFixed(2);f.value=R.toFixed(2),u.setAttribute("transform",g>0?"":"translate(0 132) scale(1 -1)"),x.setAttribute("x1",H),x.setAttribute("x2",H),m.setAttribute("cx",H),m.setAttribute("cy",(66-R*47).toFixed(2)),P.setAttribute("transform",`rotate(${52*Math.tanh(y)} 94 101)`)}l.isConnected&&(V=requestAnimationFrame(X))}return D(),V=requestAnimationFrame(X),()=>{cancelAnimationFrame(V),A?.dispose()}}export{nt as mountInduction};
