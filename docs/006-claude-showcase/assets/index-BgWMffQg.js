const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./wildfire-BrByrhyf.js","./wildfire-CCpavafp.css","./chess-S2Melr5C.js","./chess-DybXTRbz.css","./font-workshop-D2b35jx5.js","./font-workshop-BQ4PKe0Q.css","./induction-BJSNU1B6.js","./induction-mX2161q3.css","./angio-9ezMh5lY.js","./angio-B-aXmk1T.css","./haiku-workshop-Bpzi6aV4.js","./haiku-workshop-BAN0l72e.css","./font-DLlOrFw7.js","./font-CbtG3ofD.css","./haiku-EIdbMHQ9.js","./haiku-D5pYoslP.css"])))=>i.map(i=>d[i]);
(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const s of n.addedNodes)s.tagName==="LINK"&&s.rel==="modulepreload"&&a(s)}).observe(document,{childList:!0,subtree:!0});function t(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=t(i);fetch(i.href,n)}})();function Z(){const e=document.createElement("details");e.className="lab-angio-study",e.innerHTML=`
    <summary>第一课 · 同一段血管，为什么看起来更短？</summary>
    <div class="lab-angio-study-body">
      <p>打开 <a href="#angio">AngioView 原版展台</a>练习。让左冠系统 <strong>Left</strong> 保持选中，在二维造影视图打开 <strong>Labels</strong>，并在三维心脏打开 <strong>Foreshort.</strong>（投影缩短着色）。</p>
      <ol>
        <li>选 <strong>RAO caudal</strong>（RAO 30° / CAU 30°），找到标为 <strong>pLAD</strong> 的前降支近段。</li>
        <li>切换到 <strong>Spider</strong>（LAO 45° / CAU 35°），再找一次 pLAD。对照它在二维图上的走向，以及三维图里表示投影缩短的颜色。</li>
      </ol>
      <form>
        <fieldset>
          <legend>如果同一段 pLAD 在二维画面里更短，换角度本身能解释这个变化吗？</legend>
          <label><input type="radio" name="projection" value="yes" required> 能。越接近顺着血管看，它在平面上的投影越短。</label>
          <label><input type="radio" name="projection" value="no"> 不能。画面里的长度只由三维模型里的血管长度决定。</label>
        </fieldset>
        <button type="submit">检查理解</button>
        <p data-angio-feedback role="status" hidden></p>
      </form>
      <p class="lab-angio-study-note">本练习使用同一个教学模型比较投影。角度改变的是观察方向。</p>
    </div>`;const r=e.querySelector("form"),t=e.querySelector("[data-angio-feedback]");return r.addEventListener("submit",a=>{a.preventDefault();const i=new FormData(r).get("projection");t.textContent=i==="yes"?"对。就像从正上方看一支平放的笔，能看到它的长度。视线慢慢转到笔尖方向，笔在画面里就会缩短。":"再看看三维图里那段血管的走向。视线越贴近它的轴向，它在二维画面里的投影越短。",t.hidden=!1}),r.addEventListener("change",()=>{t.hidden=!0}),e}const pe=[{title:"医学影像练习库",audience:"医学生、住院医师和带教老师",detail:"把同一病例的不同角度或 CT 切片编成练习。学生先标记结构，再看教师标注与三维回放。第三课演示了三视角识别流程，病例库可以使用有教学使用许可的去标识影像。",label:"公开医学影像库 TCIA",url:"https://www.cancerimagingarchive.net/about-the-cancer-imaging-archive-tcia/"},{title:"操作模拟训练",audience:"住院医师、技能培训中心",detail:"在虚拟人体上移动超声探头，对照探头方向和屏幕切面。老师可以设定目标切面，学员可以反复练习并回看操作。",label:"医学模拟训练研究",url:"https://pubmed.ncbi.nlm.nih.gov/12368674/"},{title:"检查前讲解",audience:"患者、家属和医护",detail:"用几步动画展示导管如何到达检查部位、拍摄设备怎样转动，以及屏幕上显示的是什么。方便医护现场讲解，患者也能回看。",label:"放射学会患者资料",url:"https://www.radiologyinfo.org/en/info/angiocath"},{title:"术前讨论",audience:"临床团队",detail:"用患者影像重建血管和邻近器官，供团队共同标记、测量和讨论路径。进入临床工作流前，由临床团队验证模型和测量的准确性。",label:"SlicerHeart",url:"https://slicerheart.org/"},{title:"出院随访与康复",audience:"患者、康复团队",detail:"把医护制定的康复计划拆成每天能查看和记录的任务。复诊时对照完成情况和遇到的困难，便于医患一起调整计划。",label:"居家心脏康复科学声明",url:"https://www.jacc.org/doi/10.1016/j.jacc.2019.03.008"}];function X(){const e=document.createElement("section");return e.className="lab-future lab-angio-directions",e.id="lab-angio-directions",e.tabIndex=-1,e.setAttribute("aria-labelledby","lab-angio-directions-title"),e.innerHTML=`
    <div class="lab-future-heading">
      <h4 id="lab-angio-directions-title">医学产品扩展方向</h4>
    </div>
    <dl>
      ${pe.map(({title:r,audience:t,detail:a,label:i,url:n})=>`
        <div>
          <dt>${r}</dt>
          <dd><p class="lab-angio-audience">${t}</p>
            <p>${a}</p>
            <a href="${n}" target="_blank" rel="noopener noreferrer">${i} ↗</a>
          </dd>
        </div>`).join("")}
    </dl>`,e}function ne(e){const r=[];for(let t=0;t<e.length-1;t++){const a=e[Math.max(0,t-1)],i=e[t],n=e[t+1],s=e[Math.min(e.length-1,t+2)];for(let o=0;o<7;o++){const c=o/7;r.push(i.map((d,u)=>{const h=a[u],f=n[u],p=s[u];return .5*(2*d+(f-h)*c+(2*h-5*d+4*f-p)*c**2+(3*d-h-3*f+p)*c**3)}))}}return[...r,e.at(-1)]}function E(e,r,t){const a=e*Math.PI/180,i=r*Math.PI/180,n=Math.cos(a),s=Math.sin(a),o=Math.cos(i),c=Math.sin(i);return([d,u,h])=>{const f=d*n+h*s,p=h*n-d*s,v=u*c+p*o,l=t?380/(380-v):1;return[140+f*l*1.12,123+(u*o-p*c)*l*1.12,v]}}const D=["#ad4c20","#087e88"],se=[[[-10,-46,4],[-5,-30,12],[8,-12,28],[16,7,36],[19,25,33],[25,57,18]],[[-10,-46,4],[-4,-29,-9],[7,-12,-23],[15,7,-35],[22,26,-34],[31,54,-36]]],V=se.map(e=>e[3]),be=se.map(ne),he=[[[-54,-77,8],[-34,-66,6],[-20,-55,5],[-10,-46,4]],[[-24,-58,5],[-38,-44,-5],[-52,-29,-14],[-59,-7,-12]],[[8,-12,28],[-6,-7,35],[-19,6,40],[-28,30,28]],[[22,26,-34],[40,23,-31],[57,32,-22],[65,45,-19]]].map(ne),R=E(-37,15,!0);function H(e){return e.map(([r,t])=>`${r.toFixed(1)},${t.toFixed(1)}`).join(" ")}function F(e,r){const t=he.map((i,n)=>`<polyline class="lab-angio-context" points="${H(i.map(e))}" stroke-width="${n?2:4}"/>`),a=be.map((i,n)=>`<polyline class="lab-angio-branch" points="${H(i.map(e))}" stroke="${r?D[n]:"#343737"}"/>`);return[...t,...a].join("")}function P(e){const[[r,t],[a,i]]=V.map(e);return Math.hypot(r-a,t-i)}function T(e,r){const t=V.map(e),[[a,i],[n,s]]=t;return F(e,r)+(r?t.map(([o,c],d)=>`<circle cx="${o}" cy="${c}" r="4.5" fill="${D[d]}" stroke="#f3eee2" stroke-width="1.5"/>`).join(""):`<ellipse cx="${(a+n)/2}" cy="${(i+s)/2}" rx="21" ry="17" class="lab-angio-target"/>`)}function oe(e){const r=[[1,0,0],[0,1,0],[0,0,1]].map(e),t=r.map(n=>n[2]),a=[[-50,-58],[50,-58],[50,65],[-50,65]].map(([n,s])=>r.map(([o,c,d])=>(o-140)*n/1.12+(c-123)*s/1.12+d*67)),i=V.map((n,s)=>{const o=67-e(n)[2],c=n.map((h,f)=>h+t[f]*o),[d,u]=R(n);return`<polyline points="${H([n,c].map(R))}" class="lab-angio-ray" stroke="${D[s]}"/>
      <circle cx="${d}" cy="${u}" r="4" fill="${D[s]}"/>`});return`<polygon points="${H(a.map(R))}" class="lab-angio-detector"/>`+F(R,!0)+i.join("")}const G=[{name:"RAO 10°",yaw:-10,pitch:0},{name:"LAO 35°",yaw:35,pitch:0},{name:"CRA 12°",yaw:0,pitch:12}];function Y(){const e=document.createElement("details");e.className="lab-angio-study",e.innerHTML=`
    <summary>第二课 · 哪个角度能把重叠的分支分开？</summary>
    <div class="lab-angio-study-body lab-angio-angle">
      <p>正位影像里的虚线圈住了两条几乎重合的分支。从三个角度里选一个，让它们在标记处尽量分开。</p>
      <div class="lab-angio-films">
        <figure>
          <figcaption><span>01</span> 初始正位 · AP</figcaption>
          <svg class="lab-angio-film" viewBox="0 0 280 246" role="img" aria-label="初始正位。两条分支在虚线圈内几乎重合。"></svg>
        </figure>
        <figure>
          <figcaption><span>02</span> <strong data-angle-caption>第二视角</strong></figcaption>
          <div class="lab-angio-preview">
            <p data-angle-empty>选择下面的角度，查看第二张投影。</p>
            <svg data-angle-film class="lab-angio-film" viewBox="0 0 280 246" role="img" aria-label="选定角度的模拟造影" hidden></svg>
          </div>
        </figure>
      </div>
      <form>
        <fieldset class="lab-angio-angle-choices">
          <legend>选择第二个角度</legend>
          ${G.map(({name:m},y)=>`<label><input type="radio" name="second-view" value="${y}" required> ${m}</label>`).join("")}
        </fieldset>
        <button type="submit">核对角度并看回放</button>
        <p data-angle-feedback role="status" hidden></p>
      </form>
      <section data-angle-replay class="lab-angio-replay" aria-label="三维投影回放" hidden>
        <div>
          <h4>三维投影回放</h4>
          <p>橙色和青色是同样的两条分支。虚线表示两处标记沿观察方向投到探测板上的路径。拖动进度，观察第二视角的投影。</p>
          <p class="lab-angio-gap">标记处间距 <output data-angle-gap aria-live="off"></output> 图上单位</p>
          <div class="lab-angio-replay-controls">
            <button type="button" data-angle-play>重播转动</button>
            <label>转动进度 <input data-angle-progress type="range" min="0" max="100" value="100"></label>
          </div>
        </div>
        <svg data-angle-space viewBox="0 0 280 246" role="img" aria-label="两条分支在三维空间的位置和射向探测板的投影路径"></svg>
      </section>
      <p class="lab-angio-study-note">此题采用简化的空间分支，间距只比较图上的两个标记点。也可以到 <a href="#angio">AngioView 原版展台</a>，用解剖模型观察更多角度和分支。</p>
    </div>`;const r=e.querySelector("form"),t=e.querySelector(".lab-angio-film"),a=e.querySelector("[data-angle-film]"),i=e.querySelector("[data-angle-caption]"),n=e.querySelector("[data-angle-empty]"),s=e.querySelector("[data-angle-feedback]"),o=e.querySelector("[data-angle-replay]"),c=e.querySelector("[data-angle-space]"),d=e.querySelector("[data-angle-progress]"),u=e.querySelector("[data-angle-gap]"),h=E(0,0,!1),f=Math.max(...G.map(({yaw:m,pitch:y})=>P(E(m,y,!1))));let p,v;function l(m,y){const w=p.yaw*m,g=p.pitch*m,b=E(w,g,!1);i.textContent=m===1?p.name:m===0?"AP · 正位":`${w?w>0?"LAO":"RAO":"CRA"} ${Math.abs(w||g).toFixed(0)}°`,a.innerHTML=T(b,y),y&&(u.value=P(b).toFixed(1),c.innerHTML=oe(b))}return t.innerHTML=T(h,!1),r.addEventListener("change",()=>{cancelAnimationFrame(v),p=G[Number(new FormData(r).get("second-view"))],a.removeAttribute("hidden"),n.hidden=!0,s.hidden=!0,o.hidden=!0,d.value="100",l(1,!1)}),r.addEventListener("submit",m=>{if(m.preventDefault(),!p)return;cancelAnimationFrame(v);const y=P(E(p.yaw,p.pitch,!1)),w=y===f?"这组角度里，两个标记在这个视角分得最开。":"两个标记已经分开。试试其他角度，比较哪一个分得更开。";s.textContent=`标记处间距从 ${P(h).toFixed(1)} 增到 ${y.toFixed(1)} 图上单位。${w}`,s.hidden=!1,o.hidden=!1,d.value="100",l(1,!0)}),d.addEventListener("input",()=>{cancelAnimationFrame(v),l(Number(d.value)/100,!0)}),e.querySelector("[data-angle-play]").addEventListener("click",()=>{if(cancelAnimationFrame(v),matchMedia("(prefers-reduced-motion: reduce)").matches){d.value=d.value==="0"?"100":"0",l(Number(d.value)/100,!0);return}const m=performance.now();function y(w){if(!e.isConnected||!e.open)return;const g=Math.min((w-m)/1250,1);d.value=String(Math.round(g*100)),l(g,!0),g<1&&(v=requestAnimationFrame(y))}v=requestAnimationFrame(y)}),e}const _=[{yaw:35,pitch:0,angle:"LAO 35°",title:"看示范"},{yaw:-34,pitch:0,angle:"RAO 34°",title:"跟着找"},{yaw:24,pitch:30,angle:"LAO 24° / CRA 30°",title:"自己认"}];function me(e,r){const t=r+1;return`
    <figure data-match-card>
      <figcaption><span>0${t}</span> <strong>${e.title}</strong><small>${e.angle}</small></figcaption>
      <div class="lab-angio-match-image">
        <svg data-match-film viewBox="0 0 280 246" class="lab-angio-film" role="img"
          aria-label="第 ${t} 张模拟造影"${r===2?" hidden":""}></svg>
        <div data-match-targets role="group" aria-label="第 ${t} 张候选点"></div>
        ${r===2?"<p data-match-locked>认对第二张后解锁</p>":""}
      </div>
    </figure>`}function ee(){const e=document.createElement("details");e.className="lab-angio-study",e.innerHTML=`
    <summary>第三课 · 同一条血管，三张图</summary>
    <div class="lab-angio-study-body lab-angio-angle">
      <p>先看第一张的<strong class="lab-angio-orange">橙色分支</strong>。记住它从共同分叉走出来后，在哪一段岔出小支。换到第二张和第三张，点你认为还在这条分支上的编号。</p>
      <div class="lab-angio-films lab-angio-match">${_.map(me).join("")}</div>
      <p data-match-feedback role="status" hidden></p>
      <div data-match-replay class="lab-angio-replay lab-angio-match-review" hidden>
        <div>
          <h4>把三张图连起来看</h4>
          <p>选一张图或拖动进度，观察探测板的方向，以及同一条橙色分支怎样投到平面上。</p>
          <div class="lab-angio-match-controls" role="group" aria-label="回看三张投影">
            ${_.map((g,b)=>`<button type="button" data-match-view="${b}" aria-pressed="false">第 ${b+1} 张</button>`).join("")}
          </div>
          <label>回放进度 <input data-match-progress type="range" min="0" max="200" value="0"></label>
          <p data-match-view-label></p>
        </div>
        <div class="lab-angio-films lab-angio-match-replay">
          <figure>
            <figcaption>空间分支与探测板</figcaption>
            <svg data-match-space viewBox="0 0 280 246" role="img" aria-label="三维分支和探测板示意"></svg>
          </figure>
          <figure>
            <figcaption>同角度的二维投影</figcaption>
            <svg data-match-projection viewBox="0 0 280 246" role="img" aria-label="回放角度的二维投影"></svg>
          </figure>
        </div>
      </div>
      <button type="button" data-match-reset hidden>重新练习</button>
      <p class="lab-angio-study-note">本题使用简化的教学分支。<a href="#angio">AngioView 原版展台</a>提供可操作的冠脉解剖模型。</p>
    </div>`;const r=[...e.querySelectorAll("[data-match-card]")],t=[...e.querySelectorAll("[data-match-film]")],a=[...e.querySelectorAll("[data-match-targets]")],i=e.querySelector("[data-match-feedback]"),n=e.querySelector("[data-match-locked]"),s=e.querySelector("[data-match-replay]"),o=e.querySelector("[data-match-progress]"),c=e.querySelector("[data-match-view-label]"),d=e.querySelector("[data-match-space]"),u=e.querySelector("[data-match-projection]"),h=[...e.querySelectorAll("[data-match-view]")],f=e.querySelector("[data-match-reset]"),p=_.map(({yaw:g,pitch:b})=>E(g,b,!1)),v=p.map(g=>V.map((b,A)=>({branch:A,position:g(b)})).sort((b,A)=>b.position[0]-A.position[0]));let l;function m(g){a[g].innerHTML=v[g].map(({position:[b,A]},S)=>`<button type="button" data-match-choice="${S}" aria-label="选第 ${g+1} 张的候选 ${S+1}"
        style="left:${b/2.8}%;top:${A/2.46}%">${S+1}</button>`).join("")}function y(g){const b=Math.min(Math.floor(g/100),1),A=g/100-b,S=_[b],N=_[b+1],B=S.yaw+(N.yaw-S.yaw)*A,ue=S.pitch+(N.pitch-S.pitch)*A,z=E(B,ue,!1),Q=g/100,O=Number.isInteger(Q)?Q:-1;r.forEach((W,U)=>W.toggleAttribute("data-active",U===O)),h.forEach((W,U)=>W.setAttribute("aria-pressed",String(U===O))),c.textContent=O>=0?`第 ${O+1} 张 · ${_[O].angle}`:`从第 ${b+1} 张转向第 ${b+2} 张`,o.setAttribute("aria-valuetext",c.textContent),d.innerHTML=oe(z),u.innerHTML=T(z,!0)}function w(){l=1,t[0].innerHTML=T(p[0],!0),t[1].innerHTML=F(p[1],!1),t[2].setAttribute("hidden",""),n.hidden=!1,a[2].replaceChildren(),m(1),i.hidden=!0,s.hidden=!0,f.hidden=!0,r.forEach(g=>g.removeAttribute("data-active"))}return e.addEventListener("click",g=>{const b=g.target.closest("[data-match-choice]");if(!b||!a[l]?.contains(b))return;const A=Number(b.dataset.matchChoice),S=v[l][A].branch===0;if(i.hidden=!1,l===1){if(!S){i.textContent="再跟一下靠近共同分叉就有小支的那一条，然后重选第二张。";return}i.textContent="第二张找对了。现在换一个角度，试着独立找出同一条分支。",t[1].innerHTML=T(p[1],!0),a[1].replaceChildren(),l=2,t[2].innerHTML=F(p[2],!1),t[2].removeAttribute("hidden"),n.hidden=!0,m(2),a[2].querySelector("button").focus();return}const N=v[2].findIndex(({branch:B})=>B===0)+1;i.textContent=S?"第三张也找对了。回放时留意橙色分支在每张图的位置。":`第三张你选了 ${A+1} 号，橙色分支上的点是 ${N} 号。用回放跟着橙色分支从第一张看到第三张。`,t[2].innerHTML=T(p[2],!0),a[2].replaceChildren(),l=3,s.hidden=!1,f.hidden=!1,o.value="200",y(200),h[2].focus()}),h.forEach((g,b)=>g.addEventListener("click",()=>{o.value=String(b*100),y(b*100)})),o.addEventListener("input",()=>y(Number(o.value))),f.addEventListener("click",()=>{w(),a[1].querySelector("button").focus()}),w(),e}const le="abcdefgh",ge=["rnbqkbnr","pppppppp","........","........","........","........","PPPPPPPP","RNBQKBNR"],ve={k:0,q:50,r:100,b:0,n:50,p:100},fe=new Set(["b","n","p"]);function ye(e,r){const t=(r==="b"?2:0)+Number(fe.has(e));return`<span class="chess-study-piece" aria-hidden="true" style="background-position:${ve[e]}% ${t*100/3}%"></span>`}function $e(e,r,t){const a=le[t]+(8-r),i=a==="e2",n=a==="e3"||a==="e4",s=(r+t)%2?"shade":"light",o=e.toLowerCase(),c=e==="."?"":ye(o,e===o?"b":"w");return`<span class="chess-study-square chess-study-square--${s}" data-square="${a}" data-piece="${e}">
    ${c}${i?'<span class="chess-study-selected"></span>':""}${n?'<span class="chess-study-target"></span>':""}
  </span>`}function we(e){const r=`./${e}`;return`
    <figure class="chess-study">
      <div class="chess-study-paper" style="--chess-study-sheet: url('${r}')">
        <div class="chess-study-header">
          <span class="chess-study-kicker">WOODLAND POST OFFICE</span>
          <strong>林间邮局</strong>
          <span class="chess-study-edition">原创手绘样张</span>
        </div>
        <div class="chess-study-frame" role="img" aria-label="林间邮局主题国际象棋的标准开局。白方 e2 兵已选中，e3 和 e4 标出合法落点。">
          <div class="chess-study-ranks" aria-hidden="true">${[..."87654321"].map(t=>`<span>${t}</span>`).join("")}</div>
          <div class="chess-study-board" aria-hidden="true">
            ${ge.map((t,a)=>[...t].map((i,n)=>$e(i,a,n)).join("")).join("")}
          </div>
          <div class="chess-study-files" aria-hidden="true">${[...le].map(t=>`<span>${t}</span>`).join("")}</div>
        </div>
        <div class="chess-study-legend">
          <span><i class="chess-study-ring-key" aria-hidden="true"></i>选中的兵</span>
          <span><i class="chess-study-dot-key" aria-hidden="true"></i>可走的位置</span>
        </div>
      </div>
      <figcaption>同一个开局里，用王冠、城垛、马头和圆顶区分棋子。信封、邮袋和围巾呼应邮局主题。<a href="${r}" target="_blank" rel="noopener noreferrer">查看棋子原图 ↗</a></figcaption>
    </figure>
  `}const Ae={"wildfire-video":{image:"research/fire.jpg",outcome:"拖动时间轴，查看火线、热点、无人机和隔离带的同步回放。",implementation:"原片展示三维地图和多对象回放。本地用预设公式计算火线扩张与偏移，再按同一时间轴更新热点、无人机与隔离带。",try:"拖到 T+18 小时，切换热点与无人机图层，再播放火线的变化。",boundary:"本地地图和火线使用模拟数据。风向、风速和真实地形推演属于后续扩展。"},chess:{image:"research/chess.jpg",outcome:"林间邮局手绘棋盘，可以本地双人或和简易电脑对弈，支持悔棋和棋局保存。",implementation:"棋规与画法分开。本地由 chess.js 判断合法走法、将军和结束状态，手绘素材负责呈现，简易电脑从合法走法中作出选择。",try:"选择一枚棋子，查看可走位置。落子后悔棋，或切到挑战电脑再下一步。",boundary:"手绘主题和规则已接入。语音老师、分级残局和完整课程列为扩展方向。"},font:{image:"research/font.jpg",outcome:"重写字母、实时试字并导出 OTF。绘画部分有《卧室》、虹桥集市和现代上海长卷对照。",implementation:"原库从笔记提取轮廓并打包字体。本地先提供字母画板，把笔画转成字形轮廓，再用 opentype.js 导出 OTF；画风实验是另行生成的参考再创作样张。",try:"清空一个字母，在画板上重写并应用字形，再到试字区输入该字母并下载字体。",boundary:"本地字形编辑支持 A–Z 和空格。画风实验使用已生成的作品，生成新题材需要新的创作过程。"},induction:{image:"research/induction.jpg",outcome:"三维磁铁、线圈、场线与仪表联动，支持改变匝数、磁极和往复速度。",implementation:"本地用 Three.js 呈现磁铁、线圈与场线。理想偶极场用于估算线圈磁通，按磁通变化率计算感应电动势，并同步更新仪表和波形。",try:"先看自动往复时的波形，再反转磁极。滚到速度对照，比较峰值与方向。",boundary:"理想偶极场与简化电路采用相对单位，适合观察关系。接真实仪器需要标定。"},angio:{image:"research/angio.jpg",outcome:"本地双视图投影和三个互动练习，演示缩短、视角选择以及同一分支的跨视角识别。",implementation:"把同一组三维教学分支按不同观察角度投影到二维。本地练习通过标记间距、分支对应和动画回放说明重叠、缩短与视角的关系。",try:"先改变投影角度，再展开第二课选择一个视角，提交后查看空间投影回放。",boundary:"练习使用简化教学分支。真实影像病例库、测量和临床工作流需另行准备与验证。"},haiku:{image:"research/haiku-ai.jpg",outcome:"编辑、播放与导出五幕短片，回看雨后城市生成稿。本机工坊可从一句主题生成诗和镜头。",implementation:"本机把主题交给 AI 生成诗句和镜头 JSON；网页校验后，用现有纸纹、手绘元素和动作逐帧绘制到 Canvas，支持播放与 WebM 导出。",try:"先播放已完成的短片，再进工坊修改示例诗句和片长。本机启动后，还可以输入新主题生成。",boundary:"AI 在现有绘图元素和动作范围内编排。新主题生成依赖本机已登录的 Codex 与网络；公开版提供示例编辑、播放和导出。"}},q=e=>`./${e}`,ae=(e,r)=>`<a href="${e}" target="_blank" rel="noopener noreferrer">${r} ↗</a>`;function K(e){return e.filter(r=>r.overview).map(r=>({...r,study:Ae[r.id],demo:r.play?{route:`${r.id}/play`,title:r.play.title}:r.overview.demo}))}function Se(e){return`
    <section class="lab-research-gallery" aria-labelledby="lab-gallery-title">
      <h3 id="lab-gallery-title">六个演示，直接打开体验</h3>
      <p class="lab-research-lead">每张图来自本地演示。原版、社区实现和研究说明可在下方对照。</p>
      <div class="lab-research-cards">
        ${K(e).map(r=>`
          <article class="lab-research-card">
            <a href="#${r.demo.route}" aria-label="打开${r.demo.title}">
              <img src="${q(r.study.image)}" alt="${r.overview.title??r.title}的本地演示画面" width="920" height="480" loading="lazy">
            </a>
            <div class="lab-research-card-body">
              <p class="lab-section-index"><span>${r.number}</span> 本地演示</p>
              <h4>${r.overview.title??r.title}</h4>
              <p class="lab-product-name">${r.overview.productName}</p>
              <p>${r.study.outcome}</p>
              <div class="lab-research-links">
                <a class="lab-play-link" href="#${r.demo.route}">${r.demo.title} →</a>
                <a href="#${r.id}">看原版与研究 →</a>
              </div>
            </div>
          </article>`).join("")}
      </div>
    </section>`}function xe(e,r){const t=K(r).find(s=>s.id===(e.id==="wildfire"?"wildfire-video":e.id));if(!t)return"";const{overview:a,study:i}=t,n=[["已完成的效果",i.outcome],["动手试一次",i.try],["原理与本地实现",i.implementation],["可复用能力",a.reuse],["后续扩展",a.expansion],["当前范围",i.boundary]];return`
    <div class="lab-extension-title">
      <div><p class="lab-section-index"><span>${t.number}</span> RESEARCH NOTES</p>
      <h3 id="lab-extension-title">效果与研究笔记</h3></div>
      <a href="#overview">返回六项总览 →</a>
    </div>
    <dl class="lab-research-notes">
      ${n.map(([s,o])=>`<div><dt>${s}</dt><dd>${o}</dd></div>`).join("")}
    </dl>
    <p class="lab-research-source-note">源码记录 · ${a.codeStatus}</p>
    <div class="lab-resource-links">
      ${ae(t.source.type==="video"?t.original:t.source.url,t.source.type==="video"?"作者原片与说明":"作者在线版")}
      ${a.sourceLabel?ae(t.original,a.sourceLabel):""}
      <a href="#${t.id}">完整原作展台与扩展说明 →</a>
    </div>`}function Le(){return`
    <section class="lab-research-results" aria-labelledby="lab-understanding-title">
      <h3 id="lab-understanding-title">我们的理解 · 从产品效果到可复用机制</h3>
      <dl class="lab-research-notes">
        <div><dt>风格与规则分别复用</dt><dd>手绘象棋用主题改变体验，棋规独立判断走法；手写字体把个人字形变成可安装素材。画风参考实验则观察构图、配色与笔触，再创作新的题材。</dd></div>
        <div><dt>让同一数据驱动不同画面</dt><dd>山火用共同时间轴组织火线与资源回放，电磁实验让参数、三维装置和仪表同步，冠脉教学让同一空间结构对应不同角度的投影。</dd></div>
        <div><dt>给创作一个可执行的范围</dt><dd>俳句工坊把主题变成诗句和镜头方案，再用统一纸纹、画法与时间轴执行。可复用的是编排和制作流程，新的题材仍受支持的元素与动作限制。</dd></div>
        <div><dt>按实际能力决定下一步</dt><dd>当前山火是模拟回放，电磁与冠脉使用教学模型，绘画是已完成的参考再创作。真实数据推演、病例应用和教学收益需要继续验证；新主题 AI 生成需本机服务。</dd></div>
      </dl>
    </section>`}function ke(){return`
    <section class="lab-research-results" aria-labelledby="lab-results-title">
      <h3 id="lab-results-title">研究中完成的作品</h3>
      <p class="lab-research-lead">原画与再创作、程序动画与 AI 生成稿，集中回看。</p>
      <details class="lab-results-detail">
        <summary>原画与我们的画风实验 · 5 幅</summary>
        <div class="lab-results-images">
          ${[["van-gogh-the-bedroom-1889.jpg","参考原画 · 梵高《卧室》"],["balcony-after-the-rain.png","我们的创作 · 《雨后的阳台》"],["qingming-zhang-zeduan-hongqiao.jpg","参考原画 · 《清明上河图》虹桥局部"],["qingming-hongqiao-spring-market.png","我们的创作 · 《虹桥春市》"],["huangpu-river-spring-scroll.png","我们的创作 · 《黄浦江春景》"]].map(([r,t])=>`<figure>
            <a href="${q(r)}" target="_blank" rel="noopener noreferrer">
              <img src="${q(r)}" alt="${t}" loading="lazy"></a>
            <figcaption>${t}</figcaption>
          </figure>`).join("")}
        </div>
        <p><a href="#font/play">进入笔迹与画风工坊，查看构图、配色和笔触分析 →</a></p>
      </details>
      <details class="lab-results-detail">
        <summary>已完成的动画短片 · 2 部</summary>
        <div class="lab-results-films">
          ${[["research/dusk-to-dawn.webm","research/dusk-to-dawn-poster.jpg","《从暮到晓》","15 秒 · 纸鸢、檐雨、夜航、窗霜和晨鸟五幕"],["research/rain-city.webm","research/rain-city-poster.jpg","《雨停后的末班站》","6 秒 · 主题「雨停后的城市，安静一点」的 AI 生成稿"]].map(([r,t,a,i])=>`<figure>
            <video controls playsinline preload="none" width="720" height="720" poster="${q(t)}" aria-label="${a}已完成短片">
              <source src="${q(r)}" type="video/webm">
              <a href="${q(r)}">下载${a}</a>
            </video>
            <figcaption><strong>${a}</strong><br>${i}</figcaption>
          </figure>`).join("")}
        </div>
        <p><a href="#haiku/play">进入短诗工坊，编辑镜头或生成一个新主题 →</a></p>
      </details>
    </section>`}const te=[["principle","原理"],["reuse","可复用能力"],["expansion","扩展价值"]],M=(e,r)=>`<a href="${e}" target="_blank" rel="noopener noreferrer">${r} <span aria-hidden="true">↗</span></a>`,J=e=>`<span class="lab-overview-cell-label" aria-hidden="true">${e}</span>`;function Ee(e){const r="./six-research-projects.png";return`
    <details class="lab-results-detail lab-overview-poster" id="guide-image" open>
      <summary>研究引导图 · 六个产品的效果、原理与扩展</summary>
      <figure class="lab-overview-figure">
      <a href="${r}" target="_blank" rel="noopener noreferrer" aria-label="在新标签打开总览原图">
        <img src="${r}" width="1920" height="1420" alt="六项研究总览图，配有山火、国际象棋、手写字体、电磁感应、冠脉投影和俳句动画的实际演示画面。原理、复用和扩展方向见下方对照表。">
      </a>
      <figcaption>沿用本轮已生成的研究引导图。点击图片查看高清原图，下方可直接打开六个演示。</figcaption>
      </figure>
    </details>
    ${Se(e)}
    ${Le()}
    ${ke()}
    <h3 class="lab-overview-table-title">原理、价值与来源对照</h3>
    <table class="lab-overview-table" role="table" aria-labelledby="lab-exhibit-title" id="lab-overview-table" tabindex="-1">
      <thead role="rowgroup">
        <tr role="row">
          <th scope="col" role="columnheader">项目</th>
          ${te.map(([,t])=>`<th scope="col" role="columnheader">${t}</th>`).join("")}
          <th scope="col" role="columnheader">原版与源码</th>
          <th scope="col" role="columnheader">本地演示</th>
        </tr>
      </thead>
      <tbody role="rowgroup">
        ${e.filter(t=>t.overview).map(t=>{const{overview:a}=t,i=t.source.type==="video",n=t.play?{route:`${t.id}/play`,title:t.play.title}:a.demo,s=e.find(o=>o.id===t.related?.id&&o.source.type==="community");return`<tr role="row">
            <th scope="row" role="rowheader">
              <span class="lab-section-index">${t.number} / ${t.area}</span>
              <a class="lab-overview-project" href="#${t.id}">${a.title??t.title}</a>
              <small class="lab-overview-code">${a.productName}</small>
            </th>
            ${te.map(([o,c])=>`<td role="cell">${J(c)}${a[o]}</td>`).join("")}
            <td role="cell" class="lab-overview-links">
              ${J("原版与源码")}
              ${i?M(t.original,"作者原片"):M(t.source.url,"原版在线体验")}
              ${a.sourceLabel?M(t.original,a.sourceLabel):""}
              <small class="lab-overview-code">${a.codeStatus}</small>
            </td>
            <td role="cell" class="lab-overview-links">
              ${J("本地演示")}
              <a class="lab-overview-demo" href="#${n.route}">${n.title} <span aria-hidden="true">→</span></a>
              ${s?`
                <a href="#${s.id}">火迹 · 社区版 <span aria-hidden="true">→</span></a>
                ${M(s.original,"社区仓库")}
                <small class="lab-overview-code">源码公开 · 未见许可证</small>
              `:""}
            </td>
          </tr>`}).join("")}
      </tbody>
    </table>`}const _e="modulepreload",je=function(e,r){return new URL(e,r).href},re={},$=function(r,t,a){let i=Promise.resolve();if(t&&t.length>0){let d=function(u){return Promise.all(u.map(h=>Promise.resolve(h).then(f=>({status:"fulfilled",value:f}),f=>({status:"rejected",reason:f}))))};const s=document.getElementsByTagName("link"),o=document.querySelector("meta[property=csp-nonce]"),c=o?.nonce||o?.getAttribute("nonce");i=d(t.map(u=>{if(u=je(u,a),u in re)return;re[u]=!0;const h=u.endsWith(".css"),f=h?'[rel="stylesheet"]':"";if(a)for(let v=s.length-1;v>=0;v--){const l=s[v];if(l.href===u&&(!h||l.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${f}`))return;const p=document.createElement("link");if(p.rel=h?"stylesheet":_e,h||(p.as="script"),p.crossOrigin="",p.href=u,c&&p.setAttribute("nonce",c),document.head.appendChild(p),h)return new Promise((v,l)=>{p.addEventListener("load",v),p.addEventListener("error",()=>l(new Error(`Unable to preload CSS for ${u}`)))})}))}function n(s){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=s,window.dispatchEvent(o),!o.defaultPrevented)throw s}return i.then(s=>{for(const o of s||[])o.status==="rejected"&&n(o.reason);return r().catch(n)})},C=[{id:"wildfire",number:"01",title:"火迹 · 山火复盘",label:"FireTrace · 社区版",area:"态势回放",original:"https://github.com/Dingyi-studios/firetrace",source:{type:"community",url:"https://realkk.icu/firetrace/",caption:"Dingyi-studios 发布的可操作工作台。支持三维地形、热像无人机和消防资源回放，使用演练数据。"},use:"先拖动事件时间轴，再选一架无人机跟踪火线，或在消防资源中回放一次洒水。火线、车辆、队员和投放画面会跟随同一事件时间。",reuse:"适合用来演示应急复盘，或参考地图、时间轴与多对象状态同步的实现。仓库公开，未标明开源许可证。",related:{id:"wildfire-video",label:"看 Dilum 的原片"},play:{title:"山火模拟回放",label:"本地演示 · 模拟数据",caption:"拖动时间轴，对照火线、热点和无人机。下方汇总了真实地形与风场的后续接入方式。",load:()=>$(async()=>{const{mountWildfire:e}=await import("./wildfire-BrByrhyf.js");return{mountWildfire:e}},__vite__mapDeps([0,1]),import.meta.url).then(({mountWildfire:e})=>e)},future:{title:"用真实地形和风场推演火线",diagram:"wildfire-roadmap.svg",diagramAlt:"山火演示与扩展路线图。上方是当前演练的工作原理，下方是历史数据准备、火线计算与网页回放，以及后期的风向对照和误差检验。",current:"本地演示用程序生成地形，火线按预设公式随时间扩张和偏移。社区工作台提供三维场景与资源回放。真实地形、风速和风向驱动的火线计算列为后续扩展。",steps:[{title:"选历史案例，准备数据",description:"用 USGS 3DEP 高程建地形，提取 NOAA HRRR 逐小时风场，用 LANDFIRE 匹配燃料类型。另备燃料含水率、起火位置和时间，以及有时间戳的历史边界。"},{title:"模型计算，网页回放",description:"将输入对齐到同一坐标系和时间基准。用 FARSITE 输出各位置的火到达时间及各时刻的模拟边界，再让地图、风场和过火面积随时间轴更新。历史边界和模拟边界分层显示。"}],followup:"首个案例跑通后，可以固定其他输入，只改一段时间的风向做两组对照，再用留出的历史边界检查火线位置和过火面积的误差。",sources:[{label:"USGS 地形",url:"https://www.usgs.gov/3d-elevation-program/about-3dep-products-services"},{label:"NOAA 风场",url:"https://rapidrefresh.noaa.gov/hrrr/"},{label:"LANDFIRE 燃料",url:"https://www.landfire.gov/fuel/fbfm40"},{label:"NIFC 火场记录",url:"https://data-nifc.opendata.arcgis.com/"},{label:"NASA 卫星估算边界",url:"https://firms.modaps.eosdis.nasa.gov/descriptions/FEDS_VIIRS_SNPP.html"},{label:"FARSITE 模型",url:"https://research.fs.usda.gov/firelab/projects/flammap"}]}},{id:"wildfire-video",number:"01",title:"山火分析原片",label:"Wildfire analysis",area:"原作录像",original:"https://x.com/DilumSanjaya/status/2108241054298415258",source:{type:"video",url:"https://video.twimg.com/amplify_video/2108237504487047172/vid/avc1/1250x720/i4QWw8MWIDF5vPV1.mp4?tag=29",poster:"https://pbs.twimg.com/amplify_video_thumb/2108237504487047172/img/UXDO8JrrYpZT17PA.jpg",width:1250,height:720,caption:"Dilum Sanjaya 发布的 1 分 55 秒原片，展示三维地形、热区图层、无人机和火线回放。"},use:"录屏里可以看清三维地形、热区、无人机画面和事件时间轴如何配合。作者确认演示使用模拟数据。",reuse:"可参考态势回放的界面与工作流。目前未找到作者开放的运行入口、源码或可接入的数据。",related:{id:"wildfire",label:"操作「火迹」社区版"},overview:{title:"山火分析",productName:"Wildfire Analysis · Dilum Sanjaya",principle:"原片用模拟数据展示三维地形、热点和无人机回放。本地演示按预设公式让火线随时间扩张和偏移。",reuse:"复用地图图层、事件时间轴和多对象回放，搭建应急演练或事件复盘工具。",expansion:"接入真实地形、燃料和风场，对比不同条件下的火线，再用历史火场边界校验。",codeStatus:"原版未查到公开源码",demo:{route:"wildfire/play",title:"山火模拟回放"}}},{id:"chess",number:"02",title:"手绘国际象棋",label:"Notebook chess",area:"游戏与教学",original:"https://kevintngo.com/work/ballpoint-gambit/",source:{type:"live",url:"https://ballpoint-gambit.vercel.app/",caption:"Kevin Ngo 发布的 Ballpoint Gambit，使用原版棋盘、主题和对局控件。"},use:"可以下棋，也可以进 Lessons 跟着语音老师 Quill 练习棋子走法。它把视觉主题和入门教学做进了同一款游戏。",reuse:"可参考它把规则拆成可练习步骤的方式。作者公开了试玩页，未查到可复用的源码或美术授权。",overview:{productName:"Ballpoint Gambit",principle:"棋盘的画法与走棋规则分开。本地用棋规引擎判断走法，再用手绘棋子和棋盘呈现当前棋局。",reuse:"同一套棋规和对弈交互可以搭配不同的画风，也能用于练习走法。",expansion:"做主题棋盘、语音入门和分级残局训练，让初学者先学会走，再学会判断。",sourceLabel:"作者项目页",codeStatus:"未查到公开源码"},play:{title:"林间邮局",caption:"用手绘棋子和电脑对弈，或在同一台设备上双人对弈。棋局会保存在这个浏览器里。",load:()=>$(async()=>{const{mountChess:e}=await import("./chess-S2Melr5C.js");return{mountChess:e}},__vite__mapDeps([2,3]),import.meta.url).then(({mountChess:e})=>e)},future:{title:"把手绘风格做进一局棋",sample:"chess-woodland-post-pieces.png",current:"原版把棋子、棋盘和手写素材画进 Canvas。林间邮局使用米白和松绿的手绘棋子，由 chess.js 判断走法，画面根据棋局更新。",steps:[{title:"风格样张",description:"把林间邮局主题放进标准开局。检查双方颜色、六种棋子的轮廓，以及选中和落点标记是否一眼能认出。"},{title:"实际对弈",description:"林间邮局已接入本地棋盘。可以和电脑或身边的人下一局，试试选中、落子、吃子和悔棋。"},{title:"按需增加主题和教学",description:"用同一套走棋规则支持换主题。入门关卡可以先做马走日，再加入解除将军和一步将死。"}],sources:[{label:"原版手绘棋盘",url:"https://kevintngo.com/work/ballpoint-gambit/"},{label:"chess.js 规则文档",url:"https://jhlywa.github.io/chess.js/"}]}},{id:"font",number:"03",title:"手写字体",label:"Harshpreet Hand",area:"字体与工具",original:"https://github.com/harshpreet931/harshpreet-hand",source:{type:"live",url:"https://harshpreet931.github.io/harshpreet-hand/",caption:"Harshpreet Singh 发布的完整字体样张，包括在线试字、笔记照片对照和字符表。"},use:"试打带重复字母的英文，例如 hello，再切换字形变体。满意后可以下载字体，直接用于文档、卡片或网页。",reuse:"字体采用 SIL OFL 1.1，生成流程采用 MIT。可以用自己的笔迹运行生成流程。现有字库主要覆盖拉丁字母、数字和西欧重音字符。",resource:{label:"下载字体",url:"https://github.com/harshpreet931/harshpreet-hand/releases/latest"},overview:{productName:"Harshpreet Hand",principle:"从手写笔记中提取字形轮廓，转成矢量并打包为字体。常见字母有多种写法，保留自然的笔迹变化。",reuse:"复用字形提取和字体打包流程，用自己的笔迹生成可安装字库。",expansion:"制作个人或品牌字体，扩大字库覆盖。工坊还展示了如何把一幅画的风格用于新的题材。",sourceLabel:"字库与生成源码",codeStatus:"生成流程 MIT · 字体 OFL 1.1"},play:{title:"笔迹字体工坊",caption:"在画板上重写字母，试打新字形，下载自己的 OTF 字体。下方可用梵高《卧室》做绘画参考。",label:"原创体验 · 字形与画风",load:()=>$(async()=>{const{mountFontWorkshop:e}=await import("./font-workshop-D2b35jx5.js");return{mountFontWorkshop:e}},__vite__mapDeps([4,5]),import.meta.url).then(({mountFontWorkshop:e})=>e)},future:{title:"把个人笔迹与画风变成可重复使用的素材",current:"原库从笔记提取字形并打包为字体。本地工坊支持重写 A–Z、实时试字与 OTF 导出。画风研究另有《卧室》到《雨后的阳台》、虹桥原画到春市，以及现代上海长卷的对照。",steps:[{title:"字体复用",description:"把个人字形做成可安装的字库，供卡片、网页与文档使用。扩充数字和标点后，可覆盖更多真实排版场景。"},{title:"绘画参考",description:"从参考图观察构图、配色与笔触，在新的场景中重新安排主体。工坊展示的是已完成的再创作样张。"},{title:"按需扩展",description:"字体方向可增加照片提取和字符覆盖，绘画方向可增加参考图输入与作品版本对照。"}],sources:[{label:"原字库与生成流程",url:"https://github.com/harshpreet931/harshpreet-hand"},{label:"《卧室》馆藏说明",url:"https://www.artic.edu/artworks/28560/the-bedroom"}]}},{id:"induction",number:"04",title:"交互式电磁场",label:"Induction bench",area:"科学可视化",original:"https://github.com/thebuggeddev/electromagnetism",source:{type:"live",url:"https://electromagnetism.wasmer.app/",caption:"作者发布的 Induction Bench，保留原版三维线圈、磁铁、场线和仪表。"},use:"让磁铁分别从两个方向穿过线圈，比较电压和电流的方向。适合课堂上先预测、再操作验证。",reuse:"原仓库可以阅读和运行，未标明开源许可证。可以研究三维场线、实验动作与仪表之间的同步方式。",overview:{productName:"Induction Bench",principle:"移动磁铁会改变穿过线圈的磁通。实验台用法拉第定律计算感应电压，让场线、仪表和波形随操作更新。",reuse:"复用三维模型、可调参数和即时反馈，做能反复操作的科学实验。",expansion:"扩展到发电机与不同线圈的对照实验，接入实测电压验证曲线。",sourceLabel:"作者项目仓库",codeStatus:"源码公开 · 未见许可证"},play:{title:"三维电磁感应实验台",caption:"在三维视图中移动磁铁，比较检流计、磁通与波形，再改变速度做对照。",label:"原创体验 · 三维实验",load:async()=>{const[{mountInduction:e},{mountInductionScene:r}]=await Promise.all([$(()=>import("./induction-BJSNU1B6.js"),__vite__mapDeps([6,7]),import.meta.url),$(()=>import("./induction-scene-BCMJ5Gns.js"),[],import.meta.url)]);return t=>e(t,{createScene:r})}},future:{title:"从可操作的装置到可对照的实验",current:"本地实验台把三维装置、检流计、磁通与波形接在同一组参数上，支持反转磁极、改变匝数、速度与观察视角。读数采用简化模型的相对单位。",steps:[{title:"课堂对照",description:"只改速度或匝数，观察电动势峰值和方向。现有速度对照可直接用于先预测、后验证的练习。"},{title:"接实测数据",description:"导入带时间戳的磁铁位置和电压，标定单位后叠加曲线，比较峰值与过零点。"},{title:"更多装置",description:"增加旋转线圈、负载与发电机模型，研究转速、频率和功率之间的关系。"}],sources:[{label:"作者实验仓库",url:"https://github.com/thebuggeddev/electromagnetism"},{label:"法拉第定律",url:"https://openstax.org/books/university-physics-volume-2/pages/13-1-faradays-law"}]}},{id:"angio",number:"05",title:"冠脉造影教学",label:"Coronary projection",area:"空间教学",original:"https://x.com/AnnasRahmanMD/status/2107153860271706177",source:{type:"live",url:"https://angioview.com/",caption:"Annas Rahman 发布的 AngioView，使用原站的解剖模型、造影视图和拍摄角度预设。"},use:"选择两个拍摄角度，观察同一冠脉分支在三维模型和二维造影中的对应关系，练习识别重叠和缩短。",reuse:"原站可直接用于造影视角教学。作者公开了数据与模型的来源说明，未查到应用源码。",overview:{productName:"AngioView",principle:"改变拍摄角度，将同一组三维冠脉投影到二维平面，观察分支如何重叠或缩短。",reuse:"复用三维结构与二维影像联动的教学方法，帮助学员建立空间对应关系。",expansion:"做多视角病例题库，练习辨认分支和选择角度，也可延伸到 CT 切面和超声探头训练。",sourceLabel:"作者原帖",codeStatus:"未查到应用源码",demo:{route:"angio/play",title:"冠脉投影练习"}},play:{title:"冠脉投影练习",label:"本地演示 · 教学模型",caption:"调整角度对照三维血管和二维投影，再做缩短、视角选择和跨视角识别练习。",load:()=>$(async()=>{const{mountAngio:e}=await import("./angio-9ezMh5lY.js");return{mountAngio:e}},__vite__mapDeps([8,9]),import.meta.url).then(({mountAngio:e})=>e)}},{id:"haiku",number:"06",title:"二十首俳句动画",label:"Twenty haiku",area:"程序化叙事",original:"https://x.com/kevin_t_ngo/status/2107939123818574231",source:{type:"video",url:"https://video.twimg.com/amplify_video/2107938456404160512/vid/avc1/720x720/J2ecfhpsNkcOEo0E.mp4?tag=29",poster:"https://pbs.twimg.com/amplify_video_thumb/2107938456404160512/img/oowoHvH55FWXJnCs.jpg",width:720,height:720,caption:"Kevin Ngo 发布的 40 秒方形原片，收录二十首英文俳句、手绘线条、不同纸色与原声。"},use:"作者请 Claude Haiku 5.5 写了 20 首俳句，并用 JavaScript 逐帧绘制。每首诗围绕一个意象，用纸纹、手绘线条和简短动作把它变成镜头。",reuse:"可借鉴纸纹、铅笔笔触和方形构图，也可以复用让画面、诗句和声音跟随同一条时间轴的做法。作者公开了成片和制作说明，目前未找到原动画工程。",overview:{productName:"Twenty Haiku · Kevin Ngo",principle:"原作让 AI 写俳句，再用 JavaScript 逐帧绘制。工坊根据一句主题生成诗和镜头方案，由网页画出动画。",reuse:"复用纸上手绘风格、时间轴和导出工具。更换主题即可重新生成构图和动作。",expansion:"做诗文课堂、节令短片和展览内容，也可以加入朗读、字幕和多幕编排。",codeStatus:"未查到原动画工程"},play:{title:"短诗动画工坊",label:"原创体验 · 纸上动画",caption:"编辑、播放和导出《从暮到晓》的五幕示例。本机工坊还可输入一句主题，生成三行诗和纸上手绘镜头。",load:()=>$(async()=>{const{mountHaikuWorkshop:e}=await import("./haiku-workshop-Bpzi6aV4.js");return{mountHaikuWorkshop:e}},__vite__mapDeps([10,11]),import.meta.url).then(({mountHaikuWorkshop:e})=>e)},future:{title:"把纸上手绘风格做成创作入口",current:"在本机工坊输入一句主题，AI 写三行诗，并决定画什么、怎么动、何时出现。网页用统一的纸上手绘风格逐帧绘制并自动播放。输入「雨停后的城市」，就生成了雨滴落进路灯倒影、荡开水纹的镜头。生成稿可改诗句、调片长或导出视频。画面细节取决于工坊支持的画法。",steps:[{title:"诗文课堂",description:"给一首诗做两个镜头版本，让学生选择哪种画面更贴近诗句，并说出取舍。"},{title:"节令与展览短片",description:"用同一套纸色和笔触生成不同主题的镜头，编排成系列，再按展屏和社交平台的尺寸导出。"},{title:"旁白与字幕",description:"把朗读的停顿对齐到动作节点，提供逐句时刻调整，并导出含声音的短片。"}],sources:[{label:"Kevin Ngo 原片与发布说明",url:"https://x.com/kevin_t_ngo/status/2107939123818574231"},{label:"Claude 官方制作说明",url:"https://x.com/claudeai/status/2111177845846495646"}]}}],ce={wildfire:{title:"山火分析",caption:"拖动时间轴，观察模拟火线、热点和响应队伍。",load:()=>$(async()=>{const{mountWildfire:e}=await import("./wildfire-BrByrhyf.js");return{mountWildfire:e}},__vite__mapDeps([0,1]),import.meta.url).then(({mountWildfire:e})=>e)},chess:{title:"手绘国际象棋",caption:"在手绘棋盘上走子、撤销，或和简易电脑对弈。",load:()=>$(async()=>{const{mountChess:e}=await import("./chess-S2Melr5C.js");return{mountChess:e}},__vite__mapDeps([2,3]),import.meta.url).then(({mountChess:e})=>e)},font:{title:"手写字体",caption:"输入文字，切换字号、字重和字形变体。",load:()=>$(async()=>{const{mountFont:e}=await import("./font-DLlOrFw7.js");return{mountFont:e}},__vite__mapDeps([12,13]),import.meta.url).then(({mountFont:e})=>e)},induction:{title:"交互式电磁场",caption:"移动磁铁，观察简化模型的磁场和感应曲线。",load:()=>$(async()=>{const{mountInduction:e}=await import("./induction-BJSNU1B6.js");return{mountInduction:e}},__vite__mapDeps([6,7]),import.meta.url).then(({mountInduction:e})=>e)},angio:{title:"冠脉造影教学",caption:"调整拍摄角度，对照空间示意和二维投影。",load:()=>$(async()=>{const{mountAngio:e}=await import("./angio-9ezMh5lY.js");return{mountAngio:e}},__vite__mapDeps([8,9]),import.meta.url).then(({mountAngio:e})=>e)},haiku:{title:"二十首俳句动画",caption:"切换本地创作的二十首短诗，播放或拖动程序动画。",load:()=>$(async()=>{const{mountHaiku:e}=await import("./haiku-EIdbMHQ9.js");return{mountHaiku:e}},__vite__mapDeps([14,15]),import.meta.url).then(({mountHaiku:e})=>e)}},qe=C.find(e=>e.id==="wildfire"),Te=[{title:"可操作的作者原版",type:"live"},{title:"可操作的社区实现",type:"community"},{title:"作者视频",type:"video"}],x=document.querySelector("#app");x.innerHTML=`
  <header class="lab-header">
    <div class="lab-wrap lab-masthead">
      <a class="lab-brand" href="#overview">
        <span class="lab-mark" aria-hidden="true"><i></i><i></i><i></i><i></i></span>
        <span>效果研究室</span>
      </a>
      <span class="lab-edition">CLAUDE SHOWCASE <span aria-hidden="true">/</span> VOL. 01</span>
      <nav class="lab-top-nav" aria-label="研究室入口">
        <a class="lab-top-link lab-top-overview" href="#overview" data-exhibit="overview">六项总览</a>
        <a class="lab-top-link" href="https://x.com/claudeai/status/2111177834127601902" target="_blank" rel="noopener noreferrer">原始作品串 <span aria-hidden="true">↗</span></a>
      </nav>
    </div>
  </header>
  <main class="lab-wrap">
    <section class="lab-intro" aria-labelledby="lab-title">
      <div>
        <p class="lab-eyebrow"><span></span> Claude 社区作品</p>
        <h1 id="lab-title">六个优秀产品的效果与复用研究</h1>
        <p class="lab-intro-text">从实际产品效果理解实现原理，记录可复用能力与扩展方向。保留作者原版、研究演示和创作成果。</p>
      </div>
      <div class="lab-index-mark" aria-hidden="true">
        <span>RESEARCH<br>PROJECTS</span><b>06</b>
      </div>
    </section>
    <div class="lab-layout">
      <aside class="lab-sidebar">
        <div class="lab-nav-group">
          <div class="lab-nav-heading"><span>我们的六个演示</span><span>06</span></div>
          <nav class="lab-nav" aria-label="本地演示">
            ${K(C).map(e=>`
              <a class="lab-nav-item" href="#${e.demo.route}" data-exhibit="${e.demo.route}">
                <span class="lab-nav-number">${e.number}</span>
                <span class="lab-nav-label"><strong>${e.demo.title}</strong><small>本地体验与研究笔记</small></span>
                <span class="lab-nav-arrow" aria-hidden="true">→</span>
              </a>`).join("")}
          </nav>
        </div>
        ${Te.map(({title:e,type:r})=>{const t=C.filter(({source:a})=>a.type===r);return`<div class="lab-nav-group">
            <div class="lab-nav-heading"><span>${e}</span><span>${String(t.length).padStart(2,"0")}</span></div>
            <nav class="lab-nav" aria-label="${e}">
              ${t.map(a=>`
                <a class="lab-nav-item" href="#${a.id}" data-exhibit="${a.id}">
                  <span class="lab-nav-number">${a.number}</span>
                  <span class="lab-nav-label"><strong>${a.title}</strong><small>${a.label}</small></span>
                  <span class="lab-nav-arrow" aria-hidden="true">↗</span>
                </a>`).join("")}
            </nav>
          </div>`}).join("")}
        <details class="lab-nav-group lab-archive">
          <summary>旧版回看 · 6 个本地效果</summary>
          <nav class="lab-nav" aria-label="旧版回看">
            ${Object.entries(ce).map(([e,r])=>`
              <a class="lab-nav-item lab-archive-item" href="#${e}/local" data-exhibit="${e}/local">${r.title}</a>
            `).join("")}
          </nav>
        </details>
      </aside>
      <article class="lab-exhibit" aria-labelledby="lab-exhibit-title">
        <header class="lab-exhibit-head"></header>
        <div class="lab-demo" id="lab-demo"></div>
        <section class="lab-extension" aria-labelledby="lab-extension-title"></section>
      </article>
    </div>
  </main>
  <footer class="lab-wrap lab-footer">
    <span>效果研究室 <span aria-hidden="true">/</span> Claude 社区作品</span>
    <span>原作展台与复用说明</span>
  </footer>
`;const k=x.querySelector(".lab-demo"),L=x.querySelector(".lab-exhibit-head"),j=x.querySelector(".lab-extension"),Ce=x.querySelector(".lab-archive"),Oe=x.querySelector(".lab-intro"),Ne=x.querySelector(".lab-layout"),Re=x.querySelector(".lab-sidebar");let ie,I;function Pe(e,r){const{source:t}=r;if(t.type!=="video"){const d=document.createElement("iframe");d.className="lab-source-frame",d.title=r.title,d.setAttribute("sandbox","allow-scripts allow-same-origin allow-popups"),d.setAttribute("allow","clipboard-write; fullscreen"),d.referrerPolicy="no-referrer",d.src=t.url;const u=document.createElement("p");u.className="lab-media-error",u.append("可直接操作下方原站。若嵌入加载受限，请",Object.assign(document.createElement("a"),{href:t.url,textContent:"在新标签打开",target:"_blank",rel:"noopener noreferrer"})),e.append(u,d);return}const a=document.createElement("video");a.className="lab-source-video",a.setAttribute("aria-label",`${r.title} · 作者原片`),a.controls=!0,a.playsInline=!0,a.preload="metadata",a.poster=t.poster,a.width=t.width,a.height=t.height,a.src=t.url;const i=document.createElement("p");i.className="lab-media-error",i.hidden=!0,i.append("当前网络未能载入原片。",Object.assign(document.createElement("a"),{href:t.url,textContent:"在新标签播放原片 ↗",target:"_blank",rel:"noopener noreferrer"}));const n=document.createElement("div");n.className="lab-media-toolbar";const s=document.createElement("button");s.type="button";const o=()=>{s.textContent=a.paused?"播放原片":"暂停原片"};o(),a.addEventListener("play",o),a.addEventListener("pause",o),a.addEventListener("ended",o);const c=()=>{i.hidden=!1};return a.addEventListener("error",c),s.addEventListener("click",()=>{a.paused?a.play().catch(()=>{a.error&&c()}):a.pause()}),n.append(s),e.append(n,a,i),()=>a.pause()}async function de(){const[e,r]=location.hash.slice(1).split("/"),t=!e||e==="overview"&&!r,a=C.find(l=>l.id===e)??qe,i=a.id===e&&r==="local"?ce[e]:void 0,n=a.id===e&&r==="play"?a.play:void 0,s=i??n,o=t?"overview":s?`${a.id}/${r}`:a.id;if(location.hash&&location.hash!==`#${o}`&&history.replaceState(null,"",`#${o}`),ie===o)return;ie=o,I?.(),I=void 0;for(const l of k.querySelectorAll("video"))l.pause();k.querySelectorAll(".lab-angio-study").forEach(l=>{l.open=!1});for(const l of x.querySelectorAll("[data-exhibit]"))l.dataset.exhibit===o?l.setAttribute("aria-current","page"):l.removeAttribute("aria-current");if(Oe.hidden=t,Re.hidden=t,Ne.classList.toggle("lab-layout--overview",t),k.classList.toggle("lab-demo--overview",t),j.hidden=t,t){L.innerHTML=`
      <p class="lab-section-index"><span>06</span> CLAUDE 社区作品</p>
      <div class="lab-exhibit-title-row"><h2 id="lab-exhibit-title" tabindex="-1">六个优秀产品的效果与复用研究</h2></div>
      <p class="lab-interaction">研究山火分析、手绘国际象棋、手写字体、电磁感应实验、冠脉造影教学与俳句动画。从原版效果出发，理解规则、数据与呈现如何配合，再通过六个演示验证可复用的做法。</p>
      <p class="lab-interaction">这里汇总已完成的效果与我们的理解，并标明后续扩展和当前范围。原版链接、源码记录、绘画对照和动画短片均保留。</p>
      <button type="button" class="lab-future-jump lab-overview-jump" aria-controls="lab-overview-table">查看对照表与演示入口 ↓</button>
    `,k.innerHTML=Ee(C),L.querySelector(".lab-overview-jump").addEventListener("click",()=>{const l=k.querySelector("#lab-overview-table");l.focus({preventScroll:!0}),l.scrollIntoView({block:"start"})}),L.querySelector("h2").focus();return}const c=document.createElement("div");if(c.className="lab-demo-host",k.replaceChildren(c),s){i&&(Ce.open=!0),L.innerHTML=`
      <p class="lab-section-index"><span>${a.number}</span> ${n?"本地演示":"旧版回看"}</p>
      <div class="lab-exhibit-title-row">
        <h2 id="lab-exhibit-title" tabindex="-1">${s.title}</h2>
        <a class="lab-source" href="#${a.id}">看原版展台 →</a>
      </div>
      <p class="lab-interaction"><span class="lab-source-badge">${n?n.label??"可玩 · 本地对弈":"旧版 · 本地效果"}</span> ${s.caption}</p>
    `,j.innerHTML=xe(a,C),c.innerHTML=`<p class="lab-archive-status" role="status">正在载入${s.title}…</p>`;try{const l=await s.load();if(!c.isConnected)return;c.replaceChildren();const m=n&&a.future?.sample;I=m?l(c,{sheet:m}):l(c),n&&a.id==="angio"&&(c.append(Z(),Y(),ee()),j.append(X())),n&&L.querySelector("h2").focus()}catch(l){if(!c.isConnected)return;c.innerHTML=`<p class="lab-archive-status" role="alert">${s.title}载入失败，请刷新页面重试。</p>`,console.error(l)}return}const d=a.source.type!=="video",u=a.id==="angio",h={live:"可操作 · 作者在线版",community:"可操作 · 社区实现",video:"仅有作者视频"}[a.source.type],f=d?a.source.url:a.original,p=d?"全屏打开原站":"打开原帖",v=a.play?{route:`${a.id}/play`,title:a.play.title}:a.overview?.demo;L.innerHTML=`
    <p class="lab-section-index"><span>${a.number}</span> ${a.area}</p>
    <div class="lab-exhibit-title-row">
      <h2 id="lab-exhibit-title" tabindex="-1">${a.title}</h2>
      <a class="lab-source" href="${f}" target="_blank" rel="noopener noreferrer">${p} <span aria-hidden="true">↗</span></a>
    </div>
    <p class="lab-interaction"><span class="lab-source-badge" data-live="${d}">${h}</span> ${a.source.caption}
      ${a.future?`<button type="button" class="lab-future-jump" aria-controls="lab-future">${a.future.sample?"棋盘样张与路线图":"原理与路线图"} ↓</button>`:""}
      ${u?'<button type="button" class="lab-future-jump" aria-controls="lab-angio-directions">医学产品扩展方向 ↓</button>':""}
    </p>
    ${v?`<a class="lab-play-link" href="#${v.route}">试玩${v.title} →</a>`:""}
  `,j.innerHTML=`
    <div class="lab-extension-title">
      <div><p class="lab-section-index"><span>→</span> USE &amp; REUSE</p><h3 id="lab-extension-title">实际用途与复用</h3></div>
      <div class="lab-resource-links">
        ${a.related?`<a href="#${a.related.id}">${a.related.label} →</a>`:""}
        ${a.resource?`<a href="${a.resource.url}" target="_blank" rel="noopener noreferrer">${a.resource.label} ↗</a>`:""}
        <a href="${a.original}" target="_blank" rel="noopener noreferrer">来源说明 ↗</a>
      </div>
    </div>
    <div class="lab-extension-grid">
      <div><h4>${d?"现在能做什么":"原片展示什么"}</h4><p>${a.use}</p></div>
      <div><h4>可复用范围</h4><p>${a.reuse}</p></div>
    </div>
    ${a.future?`
      <section class="lab-future" id="lab-future" aria-labelledby="lab-future-title" tabindex="-1">
        <div class="lab-future-heading">
          <h4 id="lab-future-title">扩展方向 · ${a.future.title}</h4>
          <span class="lab-source-badge">${a.play?"已可试玩":"后续按需"}</span>
        </div>
        ${a.future.sample?we(a.future.sample):a.future.diagram?`
          <figure class="lab-future-figure">
            <img src="./${a.future.diagram}" alt="${a.future.diagramAlt}" loading="lazy" decoding="async">
            <figcaption><a href="./${a.future.diagram}" target="_blank" rel="noopener noreferrer">查看路线图大图 ↗</a></figcaption>
          </figure>
        `:""}
        <p>${a.future.current}</p>
        <ol>${a.future.steps.map(({title:l,description:m})=>`<li><strong>${l}</strong><br>${m}</li>`).join("")}</ol>
        ${a.future.followup?`<p>${a.future.followup}</p>`:""}
        ${a.play?`<a class="lab-play-link" href="#${a.id}/play">${a.future.sample?"用这套棋子开一局":`试玩${a.play.title}`} →</a>`:""}
        <div class="lab-resource-links">
          ${a.future.sources.map(({label:l,url:m})=>`<a href="${m}" target="_blank" rel="noopener noreferrer">${l} ↗</a>`).join("")}
        </div>
      </section>
    `:""}
  `,u&&(k.prepend(Z(),Y(),ee()),j.append(X())),L.querySelectorAll(".lab-future-jump").forEach(l=>l.addEventListener("click",()=>{const m=j.querySelector(`#${l.getAttribute("aria-controls")}`);m.focus({preventScroll:!0}),m.scrollIntoView({block:"start"})})),c.classList.add("lab-source-host"),I=Pe(c,a),L.querySelector("h2").focus()}window.addEventListener("hashchange",de);de();export{E as c,ye as r,ne as s};
