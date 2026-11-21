import{r as N,j as t}from"./index-Dy1-aU0v.js";import{c as z,a as B}from"./chairVisual-Rsjvpymm.js";const K=`#version 300 es
void main() {
  vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`,W=`#version 300 es
precision highp float;
out vec4 pixel;
uniform vec2 resolution;
uniform float time, surge, night, reading, interior;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}
float noise(vec2 p) {
  vec2 id = floor(p);
  vec2 f = fract(p);
  vec2 w = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(id), hash(id + vec2(1.0, 0.0)), w.x),
             mix(hash(id + vec2(0.0, 1.0)), hash(id + 1.0), w.x), w.y);
}
float fog(vec2 p) {
  float value = 0.0;
  float weight = 0.53;
  mat2 turn = mat2(1.62, 1.21, -1.21, 1.62);
  for (int i = 0; i < 4; i++) {
    value += noise(p) * weight;
    p = turn * p + 7.2;
    weight *= 0.5;
  }
  return value;
}
void main() {
  vec2 uv = gl_FragCoord.xy / resolution;
  uv.y = 1.0 - uv.y;
  vec2 flow = uv * vec2(4.2, 3.6) + vec2(time * 0.10, time * -0.041);
  float cloud = fog(flow + vec2(fog(flow * 0.73 + 5.0), fog(flow + 21.5)) * 1.95);
  float foreground = smoothstep(0.67, 1.01, uv.y + (cloud - 0.53) * 0.34);
  float lower = mix(0.67, 0.14, interior) * foreground;
  float surgeFront = 1.04 - 0.82 * surge;
  float covered = smoothstep(surgeFront - 0.09, surgeFront + 0.22,
                            uv.y + (cloud - 0.5) * 0.34);
  float alpha = max(lower, max(covered * surge * 0.985, surge * (0.28 + 0.40 * cloud)));
  vec3 dayFog = mix(vec3(0.78, 0.77, 0.70), vec3(0.98, 0.93, 0.85), cloud);
  vec3 nightFog = mix(vec3(0.11, 0.16, 0.26), vec3(0.39, 0.44, 0.55), cloud);
  vec3 color = mix(dayFog, nightFog, night);
  color = mix(color, vec3(0.80, 0.62, 0.44), reading * 0.64);
  float porch = exp(-9.0 * length(uv - vec2(0.74, 0.72)));
  color = mix(color, vec3(0.85, 0.50, 0.21), porch * night * (1.0 - surge) * 0.56);
  pixel = vec4(color * alpha, alpha);
}`;function X(l,r){const e=l.getContext("webgl2",{alpha:!0,premultipliedAlpha:!0,antialias:!1});if(!e)return null;const s=[[e.VERTEX_SHADER,K],[e.FRAGMENT_SHADER,W]].map(([i,a])=>{const o=e.createShader(i);return e.shaderSource(o,a),e.compileShader(o),o}),h=e.createProgram();if(s.forEach(i=>e.attachShader(h,i)),e.linkProgram(h),s.forEach(i=>e.deleteShader(i)),!e.getProgramParameter(h,e.LINK_STATUS))return e.deleteProgram(h),null;e.useProgram(h);const m=e.createVertexArray();e.bindVertexArray(m);const f=Object.fromEntries(["resolution","time","surge","night","reading","interior"].map(i=>[i,e.getUniformLocation(h,i)]));let v=[0,0,0,0];function c(){const[i,a,o,d]=v;e.uniform1f(f.time,i),e.uniform1f(f.surge,a),e.uniform1f(f.night,o),e.uniform1f(f.reading,d),e.drawArrays(e.TRIANGLES,0,3)}e.uniform1f(f.interior,Number(r));const u=new ResizeObserver(([{contentRect:i}])=>{const a=Math.round(Math.min(i.width,850)),o=Math.round(i.height/Math.max(i.width,1)*a);!a||!o||(l.width=a,l.height=o,e.viewport(0,0,a,o),e.uniform2f(f.resolution,a,o),c())});return u.observe(l),{paint(i,a,o,d){v=[i,a,o,d],c()},dispose(){u.disconnect(),e.deleteVertexArray(m),e.deleteProgram(h)}}}const H=[{id:"morning",label:"Morning",caption:"$0 for electricity",night:0,reading:0,dark:0},{id:"night",label:"Night",caption:"$0 for electricity",night:1,reading:0,dark:1}],T=[{id:"daylight",label:"日光",caption:"明亮自然光",night:0,reading:0,dark:0},{id:"reading",label:"阅读灯",caption:"暖光照亮座椅",night:0,reading:1,dark:.88},{id:"night",label:"夜间",caption:"低照度氛围光",night:1,reading:0,dark:1}],w=240,I=820,R="/20261104_codex_project/001-interaction-effects-lab/demo-assets/lighting",Y="/20261104_codex_project/001-interaction-effects-lab/demo-assets/virtualfit/room.webp";function b(l,r,e){const s=Math.min(1,Math.max(0,(e-l)/(r-l)));return s*s*(3-2*s)}function Z(l,r,e,s,h,m,f){const v=N.useRef(null);return N.useEffect(()=>{const c=l.current,u=window.matchMedia("(prefers-reduced-motion: reduce)"),i=X(r.current,h);let a=s,o=s,d=null,j=0,g=-100;c.dataset.fog=i?"webgl":"css";function p(){j||(j=requestAnimationFrame(U))}function k(n,E,y,_,x,$,D,P){const F=(M,S=y)=>e[n][M]*(1-S)+e[E][M]*S,L=F("night"),G=F("reading");c.style.setProperty("--night",L.toFixed(4)),c.style.setProperty("--reading",(L<.999?G/(1-L):0).toFixed(4)),c.style.setProperty("--dark",F("dark").toFixed(4)),c.style.setProperty("--text-dark",F("dark",_).toFixed(4)),c.style.setProperty("--sink",`${(x*100).toFixed(4)}%`),c.style.setProperty("--surge",$.toFixed(4)),c.style.setProperty("--dip",D.toFixed(4)),e.forEach((M,S)=>{const q=(S===n?1-y:0)+(S===E?y:0);c.style.setProperty(`--mode-${M.id}`,q.toFixed(4))}),i&&(d||u.matches||P-g>31)&&(i.paint(u.matches?0:P*.001,$,L,G),g=P)}function A(n){d={from:a,to:n,start:performance.now()},c.dataset.phase="sinking",p()}function C(n){d=null,a=n,c.dataset.phase="idle",m(n),f(n),k(n,n,1,1,0,0,0,performance.now())}function U(n){if(j=0,!d)i&&n-g>31&&(i.paint(n*.001,0,e[a].night,e[a].reading),g=n);else{const{from:E,to:y,start:_}=d,x=Math.max(0,n-_),$=x>=w;$&&a!==y&&(a=y,m(y),c.dataset.phase="rising");const D=$?Math.max(0,1-(x-w)/I)**3.4*.27:b(0,w,x)*.27,P=b(0,w*.9,x)*(1-b(w+70,w+I*.92,x)),F=b(30,190,x)*(1-b(330,720,x));k(E,y,b(120,520,x),b(340,760,x),D,P,F,n),x>=w+I&&(d=null,c.dataset.phase="idle",f(a),o!==a&&A(o))}!u.matches&&(d||i)&&p()}function V(n){o=n,u.matches?C(n):!d&&n!==a&&A(n)}function O(){u.matches?(cancelAnimationFrame(j),j=0,C(o)):p()}return v.current=V,k(s,s,1,1,0,0,0,performance.now()),!u.matches&&i&&p(),u.addEventListener("change",O),()=>{cancelAnimationFrame(j),u.removeEventListener("change",O),i==null||i.dispose(),v.current=null}},[l,r,e,s,h,m,f]),v}function J(){return t.jsx("svg",{viewBox:"0 0 40 40","aria-hidden":"true",children:Array.from({length:12},(l,r)=>t.jsx("path",{d:"M18.4 3.5h3.2l.9 8.4h-5Z",transform:`rotate(${r*30} 20 20)`},r))})}function Q({visible:l}){return t.jsxs(t.Fragment,{children:[t.jsxs("div",{className:"lighting-backdrop","aria-hidden":"true",children:[t.jsx("img",{src:`${R}/morning-sky.webp`,alt:""}),t.jsx("img",{className:"lighting-night",src:`${R}/night-sky.webp`,alt:""})]}),t.jsx("div",{className:"lighting-subject","aria-hidden":"true",children:H.map(({id:r},e)=>t.jsxs("div",{className:"lighting-house","data-current":l===e,children:[t.jsx("img",{className:"lighting-ground",src:`${R}/${r}-ground.webp`,alt:""}),t.jsx("img",{src:`${R}/${r}-house.webp`,alt:""})]},r))}),t.jsx("div",{className:"lighting-foreground","aria-hidden":"true"})]})}function ee({visible:l,chair:r,finish:e}){const[s,h]=z(r);return t.jsxs(t.Fragment,{children:[t.jsx("div",{className:"lighting-backdrop lighting-room","aria-hidden":"true",children:T.map(({id:m})=>t.jsx("div",{className:`lighting-room-view lighting-${m}`,children:t.jsx("img",{src:Y,alt:""})},m))}),t.jsxs("div",{className:"lighting-subject lighting-room-subject","data-room":T[l].id,"aria-hidden":"true",children:[t.jsx("div",{className:"lighting-chair-shadow"}),t.jsx("img",{className:"lighting-chair",src:B(r,e),alt:"",style:{"--chair-width":s,"--chair-height":h}})]})]})}function re({mode:l,furniture:r}){const e=l==="product",s=e?T:H,h=e?0:1,[m,f]=N.useState(h),[v,c]=N.useState(h),[u,i]=N.useState(h),a=N.useRef(null),o=N.useRef(null),d=Z(a,o,s,h,e,c,i);function j(g){var p;f(g),(p=d.current)==null||p.call(d,g)}return t.jsxs("section",{ref:a,className:`lighting-demo${e?" lighting-product":""}`,"data-scene":s[v].id,"data-target":s[m].id,"data-phase":"idle","data-chair":e?r.chair.id:void 0,"data-finish":e?r.finish.id:void 0,children:[e?t.jsx(ee,{visible:v,chair:r.chair,finish:r.finish}):t.jsx(Q,{visible:v}),t.jsx("div",{className:"lighting-fog-css","aria-hidden":"true"}),t.jsx("canvas",{className:"lighting-fog",ref:o,"aria-hidden":"true"}),t.jsxs("div",{className:"lighting-ui",children:[t.jsxs("header",{className:"lighting-header",children:[t.jsxs("span",{className:"lighting-brand",children:[!e&&t.jsx(J,{}),e?"Forma Living":"Lumen Roof"]}),t.jsx("div",{className:"lighting-nav","aria-hidden":"true",children:e?t.jsx("span",{children:"READING ROOM"}):t.jsxs(t.Fragment,{children:[t.jsx("span",{children:"How It Works"}),t.jsx("span",{children:"Our Cases"}),t.jsx("span",{children:"About Us"})]})}),t.jsx("span",{className:"lighting-badge",children:e?`${r.chair.name} · ${r.finish.name}`:"Smart Solar"})]}),t.jsx("div",{className:"lighting-heading",children:e?t.jsxs(t.Fragment,{children:[t.jsxs("p",{children:[r.chair.name.toUpperCase()," / LIGHTING STUDIO"]}),t.jsx("h3",{children:"一把椅子，三种光"})]}):t.jsxs("h3",{children:[t.jsx("span",{children:"$0 Electricity Bills"}),t.jsxs("span",{children:[t.jsx("em",{children:"for the next"})," ",t.jsx("b",{children:"7 Years"})]})]})}),t.jsxs("div",{className:"lighting-dock",children:[t.jsx("div",{className:"lighting-modes",role:"group","aria-label":e?"房间光照":"Time of day",onKeyDown:g=>{if(g.key!=="ArrowLeft"&&g.key!=="ArrowRight")return;g.preventDefault();const p=(m+(g.key==="ArrowRight"?1:s.length-1))%s.length;j(p),g.currentTarget.querySelectorAll("button")[p].focus()},children:s.map(({id:g,label:p,caption:k},A)=>t.jsxs("button",{type:"button","aria-pressed":m===A,style:{"--mode-weight":`var(--mode-${g})`},onClick:()=>j(A),children:[t.jsx("span",{children:p}),t.jsx("small",{children:k})]},g))}),t.jsx("p",{role:"status",children:e?`当前光照 · ${s[u].label}`:"The same roof, from sunrise to night."})]})]})]})}export{re as default};
