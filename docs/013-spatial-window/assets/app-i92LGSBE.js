const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["./reference-figure-DOhF0L_7.js","./modulepreload-polyfill-B5Qt9EMX.js"])))=>i.map(i=>d[i]);
import"./modulepreload-polyfill-B5Qt9EMX.js";const hp="modulepreload",fp=function(i,e){return new URL(i,e).href},Du={},Fc=function(e,t,n){let s=Promise.resolve();if(t&&t.length>0){let o=function(u){return Promise.all(u.map(f=>Promise.resolve(f).then(h=>({status:"fulfilled",value:h}),h=>({status:"rejected",reason:h}))))};const a=document.getElementsByTagName("link"),c=document.querySelector("meta[property=csp-nonce]"),l=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));s=o(t.map(u=>{if(u=fp(u,n),u in Du)return;Du[u]=!0;const f=u.endsWith(".css"),h=f?'[rel="stylesheet"]':"";if(!!n)for(let v=a.length-1;v>=0;v--){const g=a[v];if(g.href===u&&(!f||g.rel==="stylesheet"))return}else if(document.querySelector(`link[href="${u}"]${h}`))return;const p=document.createElement("link");if(p.rel=f?"stylesheet":hp,f||(p.as="script"),p.crossOrigin="",p.href=u,l&&p.setAttribute("nonce",l),document.head.appendChild(p),f)return new Promise((v,g)=>{p.addEventListener("load",v),p.addEventListener("error",()=>g(new Error(`Unable to preload CSS for ${u}`)))})}))}function r(o){const a=new Event("vite:preloadError",{cancelable:!0});if(a.payload=o,window.dispatchEvent(a),!a.defaultPrevented)throw o}return s.then(o=>{for(const a of o||[])a.status==="rejected"&&r(a.reason);return e().catch(r)})};/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Bc="187",dp=0,Uu=1,pp=2,Dr=1,mp=2,wr=3,Xi=0,ln=1,Gn=2,ks=0,Ur=1,Il=2,Ou=3,Fu=4,gp=5,Fs=100,_p=101,xp=102,vp=103,Sp=104,Mp=200,yp=201,bp=202,Tp=203,Ff=204,Bf=205,Ep=206,wp=207,Ap=208,Rp=209,Cp=210,Pp=211,Lp=212,Ip=213,Np=214,Nl=0,Dl=1,Ul=2,Wr=3,Ol=4,Fl=5,Bl=6,zl=7,zc=0,Dp=1,Up=2,Ri=0,zf=1,kf=2,Hf=3,kc=4,Gf=5,Vf=6,Wf=7,Bu="attached",Op="detached",Xf=300,qs=301,Xr=302,Ua=303,Oa=304,qi=1e3,ei=1001,ra=1002,Gt=1003,qf=1004,Ar=1005,jt=1006,Jo=1007,ti=1008,yn=1009,Yf=1010,Kf=1011,qr=1012,Hc=1013,ni=1014,Ln=1015,Un=1016,Gc=1017,Vc=1018,Ys=1020,$f=35902,Jf=35899,Zf=1021,Qf=1022,Wn=1023,Yi=1026,Vi=1027,Wc=1028,Xc=1029,us=1030,qc=1031,Yc=1033,Zo=33776,Qo=33777,jo=33778,ea=33779,kl=35840,Hl=35841,Gl=35842,Vl=35843,Wl=36196,Xl=37492,ql=37496,Yl=37488,Kl=37489,oa=37490,$l=37491,Jl=37808,Zl=37809,Ql=37810,jl=37811,ec=37812,tc=37813,nc=37814,ic=37815,sc=37816,rc=37817,oc=37818,ac=37819,lc=37820,cc=37821,uc=36492,hc=36494,fc=36495,dc=36283,pc=36284,aa=36285,mc=36286,Yr=2300,Kr=2301,Fa=2302,zu=2303,ku=2400,Hu=2401,Gu=2402,Fp=2500,Bp=0,jf=1,gc=2,zp=3200,la=0,kp=1,yi="",xt="srgb",xn="srgb-linear",ca="linear",St="srgb",Ba=7680,Hp=519,Gp=512,Vp=513,Wp=514,ed=515,Xp=516,qp=517,td=518,nd=519,id=35044,ty=35048,Vu="300 es",Xn=2e3,$r=2001;function Yp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Kp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function Jr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function $p(){const i=Jr("canvas");return i.style.display="block",i}const Wu={};function ua(...i){const e="THREE."+i.shift();console.log(e,...i)}function sd(i){const e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){const t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Ve(...i){i=sd(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function $e(...i){i=sd(i);const e="THREE."+i.shift();{const t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Hs(...i){const e=i.join(" ");e in Wu||(Wu[e]=!0,Ve(...i))}function Jp(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const Zp={[Nl]:Nl,[Ul]:Bl,[Ol]:Ol,[Wr]:Fl,[Dl]:Dl,[Bl]:Ul,[zl]:zl,[Fl]:Wr};class ds{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const s=n[e];if(s!==void 0){const r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}}const sn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let Xu=1234567;const Or=Math.PI/180,Ks=180/Math.PI;function Yn(){const i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(sn[i&255]+sn[i>>8&255]+sn[i>>16&255]+sn[i>>24&255]+"-"+sn[e&255]+sn[e>>8&255]+"-"+sn[e>>16&15|64]+sn[e>>24&255]+"-"+sn[t&63|128]+sn[t>>8&255]+"-"+sn[t>>16&255]+sn[t>>24&255]+sn[n&255]+sn[n>>8&255]+sn[n>>16&255]+sn[n>>24&255]).toLowerCase()}function ot(i,e,t){return Math.max(e,Math.min(t,i))}function Kc(i,e){return(i%e+e)%e}function Qp(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function jp(i,e,t){return i!==e?(t-i)/(e-i):0}function Fr(i,e,t){return(1-t)*i+t*e}function e0(i,e,t,n){return Fr(i,e,1-Math.exp(-t*n))}function t0(i,e=1){return e-Math.abs(Kc(i,e*2)-e)}function n0(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function i0(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function s0(i,e){return i+Math.floor(Math.random()*(e-i+1))}function r0(i,e){return i+Math.random()*(e-i)}function o0(i){return i*(.5-Math.random())}function a0(i){i!==void 0&&(Xu=i);let e=Xu+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function l0(i){return i*Or}function c0(i){return i*Ks}function u0(i){return i>0&&Number.isInteger(i)&&2**Math.round(Math.log2(i))===i}function h0(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function rd(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function f0(i,e,t,n,s){const r=Math.cos,o=Math.sin,a=r(t/2),c=o(t/2),l=r((e+n)/2),u=o((e+n)/2),f=r((e-n)/2),h=o((e-n)/2),d=r((n-e)/2),p=o((n-e)/2);switch(s){case"XYX":i.set(a*u,c*f,c*h,a*l);break;case"YZY":i.set(c*h,a*u,c*f,a*l);break;case"ZXZ":i.set(c*f,c*h,a*u,a*l);break;case"XZX":i.set(a*u,c*p,c*d,a*l);break;case"YXY":i.set(c*d,a*u,c*p,a*l);break;case"ZYZ":i.set(c*p,c*d,a*u,a*l);break;default:Ve("MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function Ea(i){switch(i.constructor){case Uint32Array:return 4294967295;case Uint16Array:return 65535;case Uint8Array:case Uint8ClampedArray:return 255;case Int32Array:return 2147483647;case Int16Array:return 32767;case Int8Array:return 127;default:return}}function $c(i,e){if(e.constructor===Float32Array)return i;const t=Ea(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.max(i/t,-1)}function Jc(i,e){if(e.constructor===Float32Array)return i;const t=Ea(e);if(t===void 0)throw new Error("THREE.MathUtils: Invalid component type.");return Math.round(i*t)}const kt={DEG2RAD:Or,RAD2DEG:Ks,generateUUID:Yn,clamp:ot,euclideanModulo:Kc,mapLinear:Qp,inverseLerp:jp,lerp:Fr,damp:e0,pingpong:t0,smoothstep:n0,smootherstep:i0,randInt:s0,randFloat:r0,randFloatSpread:o0,seededRandom:a0,degToRad:l0,radToDeg:c0,isPowerOfTwo:u0,ceilPowerOfTwo:h0,floorPowerOfTwo:rd,setQuaternionFromProperEuler:f0,normalize:Jc,denormalize:$c},vu=class vu{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=ot(this.x,e.x,t.x),this.y=ot(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=ot(this.x,e,t),this.y=ot(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ot(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ot(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};vu.prototype.isVector2=!0;let he=vu;class En{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let c=n[s+0],l=n[s+1],u=n[s+2],f=n[s+3],h=r[o+0],d=r[o+1],p=r[o+2],v=r[o+3];if(f!==v||c!==h||l!==d||u!==p){let g=c*h+l*d+u*p+f*v;g<0&&(h=-h,d=-d,p=-p,v=-v,g=-g);let m=1-a;if(g<.9995){const x=Math.acos(g),y=Math.sin(x);m=Math.sin(m*x)/y,a=Math.sin(a*x)/y,c=c*m+h*a,l=l*m+d*a,u=u*m+p*a,f=f*m+v*a}else{c=c*m+h*a,l=l*m+d*a,u=u*m+p*a,f=f*m+v*a;const x=1/Math.sqrt(c*c+l*l+u*u+f*f);c*=x,l*=x,u*=x,f*=x}}e[t]=c,e[t+1]=l,e[t+2]=u,e[t+3]=f}static multiplyQuaternionsFlat(e,t,n,s,r,o){const a=n[s],c=n[s+1],l=n[s+2],u=n[s+3],f=r[o],h=r[o+1],d=r[o+2],p=r[o+3];return e[t]=a*p+u*f+c*d-l*h,e[t+1]=c*p+u*h+l*f-a*d,e[t+2]=l*p+u*d+a*h-c*f,e[t+3]=u*p-a*f-c*h-l*d,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,c=Math.sin,l=a(n/2),u=a(s/2),f=a(r/2),h=c(n/2),d=c(s/2),p=c(r/2);switch(o){case"XYZ":this._x=h*u*f+l*d*p,this._y=l*d*f-h*u*p,this._z=l*u*p+h*d*f,this._w=l*u*f-h*d*p;break;case"YXZ":this._x=h*u*f+l*d*p,this._y=l*d*f-h*u*p,this._z=l*u*p-h*d*f,this._w=l*u*f+h*d*p;break;case"ZXY":this._x=h*u*f-l*d*p,this._y=l*d*f+h*u*p,this._z=l*u*p+h*d*f,this._w=l*u*f-h*d*p;break;case"ZYX":this._x=h*u*f-l*d*p,this._y=l*d*f+h*u*p,this._z=l*u*p-h*d*f,this._w=l*u*f+h*d*p;break;case"YZX":this._x=h*u*f+l*d*p,this._y=l*d*f+h*u*p,this._z=l*u*p-h*d*f,this._w=l*u*f-h*d*p;break;case"XZY":this._x=h*u*f-l*d*p,this._y=l*d*f-h*u*p,this._z=l*u*p+h*d*f,this._w=l*u*f+h*d*p;break;default:Ve("Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],c=t[9],l=t[2],u=t[6],f=t[10],h=n+a+f;if(h>0){const d=.5/Math.sqrt(h+1);this._w=.25/d,this._x=(u-c)*d,this._y=(r-l)*d,this._z=(o-s)*d}else if(n>a&&n>f){const d=2*Math.sqrt(1+n-a-f);this._w=(u-c)/d,this._x=.25*d,this._y=(s+o)/d,this._z=(r+l)/d}else if(a>f){const d=2*Math.sqrt(1+a-n-f);this._w=(r-l)/d,this._x=(s+o)/d,this._y=.25*d,this._z=(c+u)/d}else{const d=2*Math.sqrt(1+f-n-a);this._w=(o-s)/d,this._x=(r+l)/d,this._y=(c+u)/d,this._z=.25*d}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(ot(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,c=t._y,l=t._z,u=t._w;return this._x=n*u+o*a+s*l-r*c,this._y=s*u+o*c+r*a-n*l,this._z=r*u+o*l+n*c-s*a,this._w=o*u-n*a-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=this.dot(e);a<0&&(n=-n,s=-s,r=-r,o=-o,a=-a);let c=1-t;if(a<.9995){const l=Math.acos(a),u=Math.sin(l);c=Math.sin(c*l)/u,t=Math.sin(t*l)/u,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+o*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}const Su=class Su{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(qu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(qu.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,c=e.w,l=2*(o*s-a*n),u=2*(a*t-r*s),f=2*(r*n-o*t);return this.x=t+c*l+o*f-a*u,this.y=n+c*u+a*l-r*f,this.z=s+c*f+r*u-o*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=ot(this.x,e.x,t.x),this.y=ot(this.y,e.y,t.y),this.z=ot(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=ot(this.x,e,t),this.y=ot(this.y,e,t),this.z=ot(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ot(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,c=t.z;return this.x=s*c-r*a,this.y=r*o-n*c,this.z=n*a-s*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return za.copy(this).projectOnVector(e),this.sub(za)}reflect(e){return this.sub(za.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(ot(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Su.prototype.isVector3=!0;let L=Su;const za=new L,qu=new En,Mu=class Mu{constructor(e,t,n,s,r,o,a,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l)}set(e,t,n,s,r,o,a,c,l){const u=this.elements;return u[0]=e,u[1]=s,u[2]=a,u[3]=t,u[4]=r,u[5]=c,u[6]=n,u[7]=o,u[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],c=n[6],l=n[1],u=n[4],f=n[7],h=n[2],d=n[5],p=n[8],v=s[0],g=s[3],m=s[6],x=s[1],y=s[4],S=s[7],E=s[2],b=s[5],_=s[8];return r[0]=o*v+a*x+c*E,r[3]=o*g+a*y+c*b,r[6]=o*m+a*S+c*_,r[1]=l*v+u*x+f*E,r[4]=l*g+u*y+f*b,r[7]=l*m+u*S+f*_,r[2]=h*v+d*x+p*E,r[5]=h*g+d*y+p*b,r[8]=h*m+d*S+p*_,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8];return t*o*u-t*a*l-n*r*u+n*a*c+s*r*l-s*o*c}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],f=u*o-a*l,h=a*c-u*r,d=l*r-o*c,p=t*f+n*h+s*d;if(p===0)return this.set(0,0,0,0,0,0,0,0,0);const v=1/p;return e[0]=f*v,e[1]=(s*l-u*n)*v,e[2]=(a*n-s*o)*v,e[3]=h*v,e[4]=(u*t-s*c)*v,e[5]=(s*r-a*t)*v,e[6]=d*v,e[7]=(n*c-l*t)*v,e[8]=(o*t-n*r)*v,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){const c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*o+l*a)+o+e,-s*l,s*c,-s*(-l*o+c*a)+a+t,0,0,1),this}scale(e,t){return Hs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(ka.makeScale(e,t)),this}rotate(e){return Hs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(ka.makeRotation(-e)),this}translate(e,t){return Hs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(ka.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Mu.prototype.isMatrix3=!0;let Ze=Mu;const ka=new Ze,Yu=new Ze().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Ku=new Ze().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function d0(){const i={enabled:!0,workingColorSpace:xn,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===St&&(s.r=Ci(s.r),s.g=Ci(s.g),s.b=Ci(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===St&&(s.r=Gs(s.r),s.g=Gs(s.g),s.b=Gs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===yi?ca:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[o].fromXYZ).multiply(this.spaces[r].toXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[xn]:{primaries:e,whitePoint:n,transfer:ca,toXYZ:Yu,fromXYZ:Ku,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:xt},outputColorSpaceConfig:{drawingBufferColorSpace:xt}},[xt]:{primaries:e,whitePoint:n,transfer:St,toXYZ:Yu,fromXYZ:Ku,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:xt}}}),i}const ct=d0();function Ci(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Gs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}let ps;class p0{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{ps===void 0&&(ps=Jr("canvas")),ps.width=e.width,ps.height=e.height;const s=ps.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=ps}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=Jr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Ci(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ci(t[n]/255)*255):t[n]=Ci(t[n]);return{data:t,width:e.width,height:e.height}}else return Ve("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let m0=0;class Zc{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:m0++}),this.uuid=Yn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width||0,t.height||0,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(Ha(s[o].image)):r.push(Ha(s[o]))}else r=Ha(s);n.url=r}return t||(e.images[this.uuid]=n),n}}function Ha(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?p0.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Ve("Texture: Unable to serialize Texture."),{})}let g0=0;const Ga=new L;class Vt extends ds{constructor(e=Vt.DEFAULT_IMAGE,t=Vt.DEFAULT_MAPPING,n=ei,s=ei,r=jt,o=ti,a=Wn,c=yn,l=Vt.DEFAULT_ANISOTROPY,u=yi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:g0++}),this.uuid=Yn(),this.name="",this.source=new Zc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=l,this.format=a,this.internalFormat=null,this.type=c,this.offset=new he(0,0),this.repeat=new he(1,1),this.center=new he(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ze,this.generateMipmaps=!0,this.mipmapsAutoUpdate=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.isPMREMTexture=!1,this.normalized=!1}get width(){return this.source.getSize(Ga).x}get height(){return this.source.getSize(Ga).y}get depth(){return this.source.getSize(Ga).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.mipmapsAutoUpdate=e.mipmapsAutoUpdate,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isPMREMTexture=e.isPMREMTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){Ve(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ve(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,mipmapsAutoUpdate:this.mipmapsAutoUpdate,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==Xf)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case qi:e.x=e.x-Math.floor(e.x);break;case ei:e.x=e.x<0?0:1;break;case ra:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case qi:e.y=e.y-Math.floor(e.y);break;case ei:e.y=e.y<0?0:1;break;case ra:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Vt.DEFAULT_IMAGE=null;Vt.DEFAULT_MAPPING=Xf;Vt.DEFAULT_ANISOTROPY=1;const yu=class yu{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r;const c=e.elements,l=c[0],u=c[4],f=c[8],h=c[1],d=c[5],p=c[9],v=c[2],g=c[6],m=c[10];if(Math.abs(u-h)<.01&&Math.abs(f-v)<.01&&Math.abs(p-g)<.01){if(Math.abs(u+h)<.1&&Math.abs(f+v)<.1&&Math.abs(p+g)<.1&&Math.abs(l+d+m-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(l+1)/2,S=(d+1)/2,E=(m+1)/2,b=(u+h)/4,_=(f+v)/4,M=(p+g)/4;return y>S&&y>E?y<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(y),s=b/n,r=_/n):S>E?S<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(S),n=b/s,r=M/s):E<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(E),n=_/r,s=M/r),this.set(n,s,r,t),this}let x=Math.sqrt((g-p)*(g-p)+(f-v)*(f-v)+(h-u)*(h-u));return Math.abs(x)<.001&&(x=1),this.x=(g-p)/x,this.y=(f-v)/x,this.z=(h-u)/x,this.w=Math.acos((l+d+m-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=ot(this.x,e.x,t.x),this.y=ot(this.y,e.y,t.y),this.z=ot(this.z,e.z,t.z),this.w=ot(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=ot(this.x,e,t),this.y=ot(this.y,e,t),this.z=ot(this.z,e,t),this.w=ot(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(ot(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};yu.prototype.isVector4=!0;let bt=yu;class _0 extends ds{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:jt,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new bt(0,0,e,t),this.scissorTest=!1,this.viewport=new bt(0,0,e,t),this.textures=[];const s=n.count;for(let r=0;r<s;r++)this.textures[r]=new Vt({width:e,height:t,depth:n.depth}),this.textures[r].isRenderTargetTexture=!0,this.textures[r].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){const t={minFilter:jt,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.mipmapsAutoUpdate!==void 0&&(t.mipmapsAutoUpdate=e.mipmapsAutoUpdate),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const s=Object.assign({},e.textures[t].image);this.textures[t].source=new Zc(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){const t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;else this.depthTexture=null;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Nn extends _0{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class od extends Vt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class x0 extends Vt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Gt,this.minFilter=Gt,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}}const Ta=class Ta{constructor(e,t,n,s,r,o,a,c,l,u,f,h,d,p,v,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,c,l,u,f,h,d,p,v,g)}set(e,t,n,s,r,o,a,c,l,u,f,h,d,p,v,g){const m=this.elements;return m[0]=e,m[4]=t,m[8]=n,m[12]=s,m[1]=r,m[5]=o,m[9]=a,m[13]=c,m[2]=l,m[6]=u,m[10]=f,m[14]=h,m[3]=d,m[7]=p,m[11]=v,m[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ta().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();const t=this.elements,n=e.elements,s=1/ms.setFromMatrixColumn(e,0).length(),r=1/ms.setFromMatrixColumn(e,1).length(),o=1/ms.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),c=Math.cos(s),l=Math.sin(s),u=Math.cos(r),f=Math.sin(r);if(e.order==="XYZ"){const h=o*u,d=o*f,p=a*u,v=a*f;t[0]=c*u,t[4]=-c*f,t[8]=l,t[1]=d+p*l,t[5]=h-v*l,t[9]=-a*c,t[2]=v-h*l,t[6]=p+d*l,t[10]=o*c}else if(e.order==="YXZ"){const h=c*u,d=c*f,p=l*u,v=l*f;t[0]=h+v*a,t[4]=p*a-d,t[8]=o*l,t[1]=o*f,t[5]=o*u,t[9]=-a,t[2]=d*a-p,t[6]=v+h*a,t[10]=o*c}else if(e.order==="ZXY"){const h=c*u,d=c*f,p=l*u,v=l*f;t[0]=h-v*a,t[4]=-o*f,t[8]=p+d*a,t[1]=d+p*a,t[5]=o*u,t[9]=v-h*a,t[2]=-o*l,t[6]=a,t[10]=o*c}else if(e.order==="ZYX"){const h=o*u,d=o*f,p=a*u,v=a*f;t[0]=c*u,t[4]=p*l-d,t[8]=h*l+v,t[1]=c*f,t[5]=v*l+h,t[9]=d*l-p,t[2]=-l,t[6]=a*c,t[10]=o*c}else if(e.order==="YZX"){const h=o*c,d=o*l,p=a*c,v=a*l;t[0]=c*u,t[4]=v-h*f,t[8]=p*f+d,t[1]=f,t[5]=o*u,t[9]=-a*u,t[2]=-l*u,t[6]=d*f+p,t[10]=h-v*f}else if(e.order==="XZY"){const h=o*c,d=o*l,p=a*c,v=a*l;t[0]=c*u,t[4]=-f,t[8]=l*u,t[1]=h*f+v,t[5]=o*u,t[9]=d*f-p,t[2]=p*f-d,t[6]=a*u,t[10]=v*f+h}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(v0,e,S0)}lookAt(e,t,n){const s=this.elements;return vn.subVectors(e,t),vn.lengthSq()===0&&(vn.z=1),vn.normalize(),Ni.crossVectors(n,vn),Ni.lengthSq()===0&&(Math.abs(n.z)===1?vn.x+=1e-4:vn.z+=1e-4,vn.normalize(),Ni.crossVectors(n,vn)),Ni.normalize(),po.crossVectors(vn,Ni),s[0]=Ni.x,s[4]=po.x,s[8]=vn.x,s[1]=Ni.y,s[5]=po.y,s[9]=vn.y,s[2]=Ni.z,s[6]=po.z,s[10]=vn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],c=n[8],l=n[12],u=n[1],f=n[5],h=n[9],d=n[13],p=n[2],v=n[6],g=n[10],m=n[14],x=n[3],y=n[7],S=n[11],E=n[15],b=s[0],_=s[4],M=s[8],R=s[12],w=s[1],C=s[5],N=s[9],F=s[13],I=s[2],B=s[6],H=s[10],k=s[14],Q=s[3],G=s[7],Z=s[11],V=s[15];return r[0]=o*b+a*w+c*I+l*Q,r[4]=o*_+a*C+c*B+l*G,r[8]=o*M+a*N+c*H+l*Z,r[12]=o*R+a*F+c*k+l*V,r[1]=u*b+f*w+h*I+d*Q,r[5]=u*_+f*C+h*B+d*G,r[9]=u*M+f*N+h*H+d*Z,r[13]=u*R+f*F+h*k+d*V,r[2]=p*b+v*w+g*I+m*Q,r[6]=p*_+v*C+g*B+m*G,r[10]=p*M+v*N+g*H+m*Z,r[14]=p*R+v*F+g*k+m*V,r[3]=x*b+y*w+S*I+E*Q,r[7]=x*_+y*C+S*B+E*G,r[11]=x*M+y*N+S*H+E*Z,r[15]=x*R+y*F+S*k+E*V,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],c=e[9],l=e[13],u=e[2],f=e[6],h=e[10],d=e[14],p=e[3],v=e[7],g=e[11],m=e[15],x=c*d-l*h,y=a*d-l*f,S=a*h-c*f,E=o*d-l*u,b=o*h-c*u,_=o*f-a*u;return t*(v*x-g*y+m*S)-n*(p*x-g*E+m*b)+s*(p*y-v*E+m*_)-r*(p*S-v*b+g*_)}determinantAffine(){const e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],o=e[5],a=e[9],c=e[2],l=e[6],u=e[10];return t*(o*u-a*l)-n*(r*u-a*c)+s*(r*l-o*c)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],c=e[6],l=e[7],u=e[8],f=e[9],h=e[10],d=e[11],p=e[12],v=e[13],g=e[14],m=e[15],x=t*a-n*o,y=t*c-s*o,S=t*l-r*o,E=n*c-s*a,b=n*l-r*a,_=s*l-r*c,M=u*v-f*p,R=u*g-h*p,w=u*m-d*p,C=f*g-h*v,N=f*m-d*v,F=h*m-d*g,I=x*F-y*N+S*C+E*w-b*R+_*M;if(I===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const B=1/I;return e[0]=(a*F-c*N+l*C)*B,e[1]=(s*N-n*F-r*C)*B,e[2]=(v*_-g*b+m*E)*B,e[3]=(h*b-f*_-d*E)*B,e[4]=(c*w-o*F-l*R)*B,e[5]=(t*F-s*w+r*R)*B,e[6]=(g*S-p*_-m*y)*B,e[7]=(u*_-h*S+d*y)*B,e[8]=(o*N-a*w+l*M)*B,e[9]=(n*w-t*N-r*M)*B,e[10]=(p*b-v*S+m*x)*B,e[11]=(f*S-u*b-d*x)*B,e[12]=(a*R-o*C-c*M)*B,e[13]=(t*C-n*R+s*M)*B,e[14]=(v*y-p*E-g*x)*B,e[15]=(u*E-f*y+h*x)*B,this}scale(e){const t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,c=e.z,l=r*o,u=r*a;return this.set(l*o+n,l*a-s*c,l*c+s*a,0,l*a+s*c,u*a+n,u*c-s*o,0,l*c-s*a,u*c+s*o,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){const s=this.elements,r=t._x,o=t._y,a=t._z,c=t._w,l=r+r,u=o+o,f=a+a,h=r*l,d=r*u,p=r*f,v=o*u,g=o*f,m=a*f,x=c*l,y=c*u,S=c*f,E=n.x,b=n.y,_=n.z;return s[0]=(1-(v+m))*E,s[1]=(d+S)*E,s[2]=(p-y)*E,s[3]=0,s[4]=(d-S)*b,s[5]=(1-(h+m))*b,s[6]=(g+x)*b,s[7]=0,s[8]=(p+y)*_,s[9]=(g-x)*_,s[10]=(1-(h+v))*_,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){const s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];const r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let o=ms.set(s[0],s[1],s[2]).length();const a=ms.set(s[4],s[5],s[6]).length(),c=ms.set(s[8],s[9],s[10]).length();r<0&&(o=-o),Fn.copy(this);const l=1/o,u=1/a,f=1/c;return Fn.elements[0]*=l,Fn.elements[1]*=l,Fn.elements[2]*=l,Fn.elements[4]*=u,Fn.elements[5]*=u,Fn.elements[6]*=u,Fn.elements[8]*=f,Fn.elements[9]*=f,Fn.elements[10]*=f,t.setFromRotationMatrix(Fn),n.x=o,n.y=a,n.z=c,this}makePerspective(e,t,n,s,r,o,a=Xn,c=!1){const l=this.elements,u=2*r/(t-e),f=2*r/(n-s),h=(t+e)/(t-e),d=(n+s)/(n-s);let p,v;if(c)p=r/(o-r),v=o*r/(o-r);else if(a===Xn)p=-(o+r)/(o-r),v=-2*o*r/(o-r);else if(a===$r)p=-o/(o-r),v=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=h,l[12]=0,l[1]=0,l[5]=f,l[9]=d,l[13]=0,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=Xn,c=!1){const l=this.elements,u=2/(t-e),f=2/(n-s),h=-(t+e)/(t-e),d=-(n+s)/(n-s);let p,v;if(c)p=1/(o-r),v=o/(o-r);else if(a===Xn)p=-2/(o-r),v=-(o+r)/(o-r);else if(a===$r)p=-1/(o-r),v=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return l[0]=u,l[4]=0,l[8]=0,l[12]=h,l[1]=0,l[5]=f,l[9]=0,l[13]=d,l[2]=0,l[6]=0,l[10]=p,l[14]=v,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};Ta.prototype.isMatrix4=!0;let et=Ta;const ms=new L,Fn=new et,v0=new L(0,0,0),S0=new L(1,1,1),Ni=new L,po=new L,vn=new L,$u=new et,Ju=new En;class qn{constructor(e=0,t=0,n=0,s=qn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const s=e.elements,r=s[0],o=s[4],a=s[8],c=s[1],l=s[5],u=s[9],f=s[2],h=s[6],d=s[10];switch(t){case"XYZ":this._y=Math.asin(ot(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-u,d),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(h,l),this._z=0);break;case"YXZ":this._x=Math.asin(-ot(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(a,d),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-f,r),this._z=0);break;case"ZXY":this._x=Math.asin(ot(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-f,d),this._z=Math.atan2(-o,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-ot(f,-1,1)),Math.abs(f)<.9999999?(this._x=Math.atan2(h,d),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-o,l));break;case"YZX":this._z=Math.asin(ot(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-u,l),this._y=Math.atan2(-f,r)):(this._x=0,this._y=Math.atan2(a,d));break;case"XZY":this._z=Math.asin(-ot(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(h,l),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-u,d),this._y=0);break;default:Ve("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return $u.makeRotationFromQuaternion(e),this.setFromRotationMatrix($u,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Ju.setFromEuler(this),this.setFromQuaternion(Ju,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}qn.DEFAULT_ORDER="XYZ";class Qc{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let M0=0;const Zu=new L,gs=new En,hi=new et,mo=new L,or=new L,y0=new L,b0=new En,Qu=new L(1,0,0),ju=new L(0,1,0),eh=new L(0,0,1),th={type:"added"},T0={type:"removed"},_s={type:"childadded",child:null},Va={type:"childremoved",child:null};class At extends ds{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:M0++}),this.uuid=Yn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=At.DEFAULT_UP.clone();const e=new L,t=new qn,n=new En,s=new L(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new et},normalMatrix:{value:new Ze}}),this.matrix=new et,this.matrixWorld=new et,this.matrixAutoUpdate=At.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Qc,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale),this.pivot!==null&&this.position.copy(this.pivot).applyMatrix4(this.matrix).sub(this.pivot)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.multiply(gs),this}rotateOnWorldAxis(e,t){return gs.setFromAxisAngle(e,t),this.quaternion.premultiply(gs),this}rotateX(e){return this.rotateOnAxis(Qu,e)}rotateY(e){return this.rotateOnAxis(ju,e)}rotateZ(e){return this.rotateOnAxis(eh,e)}translateOnAxis(e,t){return Zu.copy(e).applyQuaternion(this.quaternion),this.position.add(Zu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Qu,e)}translateY(e){return this.translateOnAxis(ju,e)}translateZ(e){return this.translateOnAxis(eh,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(hi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?mo.copy(e):mo.set(e,t,n);const s=this.parent;this.updateWorldMatrix(!0,!1),or.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?hi.lookAt(or,mo,this.up):hi.lookAt(mo,or,this.up),this.quaternion.setFromRotationMatrix(hi),s&&(hi.extractRotation(s.matrixWorld),gs.setFromRotationMatrix(hi),this.quaternion.premultiply(gs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?($e("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(th),_s.child=e,this.dispatchEvent(_s),_s.child=null):$e("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(T0),Va.child=e,this.dispatchEvent(Va),Va.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),hi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),hi.multiply(e.parent.matrixWorld)),e.applyMatrix4(hi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(th),_s.child=e,this.dispatchEvent(_s),_s.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,e,y0),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(or,b0,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){return!0}traverse(e){e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);const e=this.pivot;if(e!==null){const t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){const s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){const r=this.children;for(let o=0,a=r.length;o<a;o++)r[o].updateWorldMatrix(!1,!0,n)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,c){return a[c.uuid]===void 0&&(a[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const c=a.shapes;if(Array.isArray(c))for(let l=0,u=c.length;l<u;l++){const f=c[l];r(e.shapes,f)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let c=0,l=this.material.length;c<l;c++)a.push(r(e.materials,this.material[c]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){const c=this.animations[a];s.animations.push(r(e.animations,c))}}if(t){const a=o(e.geometries),c=o(e.materials),l=o(e.textures),u=o(e.images),f=o(e.shapes),h=o(e.skeletons),d=o(e.animations),p=o(e.nodes);a.length>0&&(n.geometries=a),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),u.length>0&&(n.images=u),f.length>0&&(n.shapes=f),h.length>0&&(n.skeletons=h),d.length>0&&(n.animations=d),p.length>0&&(n.nodes=p)}return n.object=s,n;function o(a){const c=[];for(const l in a){const u=a[l];delete u.metadata,c.push(u)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}}At.DEFAULT_UP=new L(0,1,0);At.DEFAULT_MATRIX_AUTO_UPDATE=!0;At.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;class tt extends At{constructor(){super(),this.isGroup=!0,this.type="Group"}}const E0={type:"move"};class Wa{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new tt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new tt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new tt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null;const a=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){o=!0;for(const v of e.hand.values()){const g=t.getJointPose(v,n),m=this._getHandJoint(l,v);g!==null&&(m.matrix.fromArray(g.transform.matrix),m.matrix.decompose(m.position,m.quaternion,m.scale),m.matrixWorldNeedsUpdate=!0,m.jointRadius=g.radius),m.visible=g!==null}const u=l.joints["index-finger-tip"],f=l.joints["thumb-tip"],h=u.position.distanceTo(f.position),d=.02,p=.005;l.inputState.pinching&&h>d+p?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&h<=d-p&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.quaternion,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.quaternion,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(E0)))}return a!==null&&(a.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new tt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}const ad={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Di={h:0,s:0,l:0},go={h:0,s:0,l:0};function Xa(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}class Oe{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=xt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ct.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=ct.workingColorSpace){return this.r=e,this.g=t,this.b=n,ct.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=ct.workingColorSpace){if(e=Kc(e,1),t=ot(t,0,1),n=ot(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Xa(o,r,e+1/3),this.g=Xa(o,r,e),this.b=Xa(o,r,e-1/3)}return ct.colorSpaceToWorking(this,s),this}setStyle(e,t=xt){function n(r){r!==void 0&&parseFloat(r)<1&&Ve("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseFloat(r[1]))/100,Math.min(100,parseFloat(r[2]))/100,Math.min(100,parseFloat(r[3]))/100,t);break;case"hsl":case"hsla":if(r=/^\s*([+-]?(?:\d+(?:\.\d+)?|\.\d+))\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*,\s*(\d+(?:\.\d+)?|\.\d+)\%\s*(?:,\s*(\d+(?:\.\d+)?|\.\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Ve("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);Ve("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=xt){const n=ad[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Ve("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ci(e.r),this.g=Ci(e.g),this.b=Ci(e.b),this}copyLinearToSRGB(e){return this.r=Gs(e.r),this.g=Gs(e.g),this.b=Gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=xt){return ct.workingToColorSpace(rn.copy(this),e),Math.round(ot(rn.r*255,0,255))*65536+Math.round(ot(rn.g*255,0,255))*256+Math.round(ot(rn.b*255,0,255))}getHexString(e=xt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ct.workingColorSpace){ct.workingToColorSpace(rn.copy(this),t);const n=rn.r,s=rn.g,r=rn.b,o=Math.max(n,s,r),a=Math.min(n,s,r);let c,l;const u=(a+o)/2;if(a===o)c=0,l=0;else{const f=o-a;switch(l=u<=.5?f/(o+a):f/(2-o-a),o){case n:c=(s-r)/f+(s<r?6:0);break;case s:c=(r-n)/f+2;break;case r:c=(n-s)/f+4;break}c/=6}return e.h=c,e.s=l,e.l=u,e}getRGB(e,t=ct.workingColorSpace){return ct.workingToColorSpace(rn.copy(this),t),e.r=rn.r,e.g=rn.g,e.b=rn.b,e}getStyle(e=xt){ct.workingToColorSpace(rn.copy(this),e);const t=rn.r,n=rn.g,s=rn.b;return e!==xt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Di),this.setHSL(Di.h+e,Di.s+t,Di.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Di),e.getHSL(go);const n=Fr(Di.h,go.h,t),s=Fr(Di.s,go.s,t),r=Fr(Di.l,go.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const rn=new Oe;Oe.NAMES=ad;class wa{constructor(e,t=25e-5){this.isFogExp2=!0,this.name="",this.color=new Oe(e),this.density=t}clone(){return new wa(this.color,this.density)}toJSON(){return{type:"FogExp2",name:this.name,color:this.color.getHex(),density:this.density}}}class Kn extends At{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new qn,this.environmentIntensity=1,this.environmentRotation=new qn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),this.background=e.background!==null?e.background.clone():null,this.environment=e.environment!==null?e.environment.clone():null,this.fog=e.fog!==null?e.fog.clone():null,this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),this.overrideMaterial=e.overrideMaterial!==null?e.overrideMaterial.clone():null,this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}}const Bn=new L,fi=new L,qa=new L,di=new L,xs=new L,vs=new L,nh=new L,Ya=new L,Ka=new L,$a=new L,Ja=new bt,Za=new bt,Qa=new bt;class Pn{constructor(e=new L,t=new L,n=new L){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),Bn.subVectors(e,t),s.cross(Bn);const r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){Bn.subVectors(s,t),fi.subVectors(n,t),qa.subVectors(e,t);const o=Bn.dot(Bn),a=Bn.dot(fi),c=Bn.dot(qa),l=fi.dot(fi),u=fi.dot(qa),f=o*l-a*a;if(f===0)return r.set(0,0,0),null;const h=1/f,d=(l*c-a*u)*h,p=(o*u-a*c)*h;return r.set(1-d-p,p,d)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,di)===null?!1:di.x>=0&&di.y>=0&&di.x+di.y<=1}static getInterpolation(e,t,n,s,r,o,a,c){return this.getBarycoord(e,t,n,s,di)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,di.x),c.addScaledVector(o,di.y),c.addScaledVector(a,di.z),c)}static getInterpolatedAttribute(e,t,n,s,r,o){return Ja.setScalar(0),Za.setScalar(0),Qa.setScalar(0),Ja.fromBufferAttribute(e,t),Za.fromBufferAttribute(e,n),Qa.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Ja,r.x),o.addScaledVector(Za,r.y),o.addScaledVector(Qa,r.z),o}static isFrontFacing(e,t,n,s){return Bn.subVectors(n,t),fi.subVectors(e,t),Bn.cross(fi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return Bn.subVectors(this.c,this.b),fi.subVectors(this.a,this.b),Bn.cross(fi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return Pn.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return Pn.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return Pn.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return Pn.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return Pn.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,s=this.b,r=this.c;let o,a;xs.subVectors(s,n),vs.subVectors(r,n),Ya.subVectors(e,n);const c=xs.dot(Ya),l=vs.dot(Ya);if(c<=0&&l<=0)return t.copy(n);Ka.subVectors(e,s);const u=xs.dot(Ka),f=vs.dot(Ka);if(u>=0&&f<=u)return t.copy(s);const h=c*f-u*l;if(h<=0&&c>=0&&u<=0&&c-u>0)return o=c/(c-u),t.copy(n).addScaledVector(xs,o);$a.subVectors(e,r);const d=xs.dot($a),p=vs.dot($a);if(p>=0&&d<=p)return t.copy(r);const v=d*l-c*p;if(v<=0&&l>=0&&p<=0)return a=l/(l-p),t.copy(n).addScaledVector(vs,a);const g=u*p-d*f;if(g<=0&&f-u>=0&&d-p>=0)return nh.subVectors(r,s),a=(f-u)/(f-u+(d-p)),t.copy(s).addScaledVector(nh,a);const m=1/(g+v+h);return o=v*m,a=h*m,t.copy(n).addScaledVector(xs,o).addScaledVector(vs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}class si{constructor(e=new L(1/0,1/0,1/0),t=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(zn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(zn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=zn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0&&e.isBatchedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,zn):zn.fromBufferAttribute(r,o),zn.applyMatrix4(e.matrixWorld),this.expandByPoint(zn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),_o.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),_o.copy(n.boundingBox)),_o.applyMatrix4(e.matrixWorld),this.union(_o)}const s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,zn),zn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(ar),xo.subVectors(this.max,ar),Ss.subVectors(e.a,ar),Ms.subVectors(e.b,ar),ys.subVectors(e.c,ar),Ui.subVectors(Ms,Ss),Oi.subVectors(ys,Ms),Qi.subVectors(Ss,ys);let t=[0,-Ui.z,Ui.y,0,-Oi.z,Oi.y,0,-Qi.z,Qi.y,Ui.z,0,-Ui.x,Oi.z,0,-Oi.x,Qi.z,0,-Qi.x,-Ui.y,Ui.x,0,-Oi.y,Oi.x,0,-Qi.y,Qi.x,0];return!ja(t,Ss,Ms,ys,xo)||(t=[1,0,0,0,1,0,0,0,1],!ja(t,Ss,Ms,ys,xo))?!1:(vo.crossVectors(Ui,Oi),t=[vo.x,vo.y,vo.z],ja(t,Ss,Ms,ys,xo))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,zn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(zn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(pi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),pi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),pi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),pi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),pi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),pi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),pi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),pi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(pi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const pi=[new L,new L,new L,new L,new L,new L,new L,new L],zn=new L,_o=new si,Ss=new L,Ms=new L,ys=new L,Ui=new L,Oi=new L,Qi=new L,ar=new L,xo=new L,vo=new L,ji=new L;function ja(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){ji.fromArray(i,r);const a=s.x*Math.abs(ji.x)+s.y*Math.abs(ji.y)+s.z*Math.abs(ji.z),c=e.dot(ji),l=t.dot(ji),u=n.dot(ji);if(Math.max(-Math.max(c,l,u),Math.min(c,l,u))>a)return!1}return!0}const Bt=new L,So=new he;let w0=0;class bn extends ds{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:w0++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=id,this.updateRanges=[],this.gpuType=Ln,this.version=0,this._normalizationScale=e!==void 0?Ea(e):void 0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this._normalizationScale=e._normalizationScale,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)So.fromBufferAttribute(this,t),So.applyMatrix3(e),this.setXY(t,So.x,So.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix3(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyMatrix4(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.applyNormalMatrix(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Bt.fromBufferAttribute(this,t),Bt.transformDirection(e),this.setXYZ(t,Bt.x,Bt.y,Bt.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=this._denormalize(t)),t}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=this._denormalize(t)),t}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=this._denormalize(t)),t}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=this._denormalize(t)),t}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):$c(e,this.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):Jc(e,this.array)}}class ld extends bn{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class cd extends bn{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class Qe extends bn{constructor(e,t,n){super(new Float32Array(e),t,n)}}const A0=new si,lr=new L,el=new L;class ri{constructor(e=new L,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):A0.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;lr.subVectors(e,this.center);const t=lr.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(lr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(el.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(lr.copy(e.center).add(el)),this.expandByPoint(lr.copy(e.center).sub(el))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}let R0=0;const An=new et,tl=new At,bs=new L,Sn=new si,cr=new si,$t=new L;class It extends ds{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:R0++}),this.uuid=Yn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Yp(e)?cd:ld)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new Ze().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return An.makeRotationFromQuaternion(e),this.applyMatrix4(An),this}rotateX(e){return An.makeRotationX(e),this.applyMatrix4(An),this}rotateY(e){return An.makeRotationY(e),this.applyMatrix4(An),this}rotateZ(e){return An.makeRotationZ(e),this.applyMatrix4(An),this}translate(e,t,n){return An.makeTranslation(e,t,n),this.applyMatrix4(An),this}scale(e,t,n){return An.makeScale(e,t,n),this.applyMatrix4(An),this}lookAt(e){return tl.lookAt(e),tl.updateMatrix(),this.applyMatrix4(tl.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(bs).negate(),this.translate(bs.x,bs.y,bs.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let s=0,r=e.length;s<r;s++){const o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Qe(n,3))}else{const n=Math.min(e.length,t.count);for(let s=0;s<n;s++){const r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Ve("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new si);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){$e("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){const r=t[n];Sn.setFromBufferAttribute(r),this.morphTargetsRelative?($t.addVectors(this.boundingBox.min,Sn.min),this.boundingBox.expandByPoint($t),$t.addVectors(this.boundingBox.max,Sn.max),this.boundingBox.expandByPoint($t)):(this.boundingBox.expandByPoint(Sn.min),this.boundingBox.expandByPoint(Sn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&$e('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ri);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){$e("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(e){const n=this.boundingSphere.center;if(Sn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];cr.setFromBufferAttribute(a),this.morphTargetsRelative?($t.addVectors(Sn.min,cr.min),Sn.expandByPoint($t),$t.addVectors(Sn.max,cr.max),Sn.expandByPoint($t)):(Sn.expandByPoint(cr.min),Sn.expandByPoint(cr.max))}Sn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)$t.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared($t));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],c=this.morphTargetsRelative;for(let l=0,u=a.count;l<u;l++)$t.fromBufferAttribute(a,l),c&&(bs.fromBufferAttribute(e,l),$t.add(bs)),s=Math.max(s,n.distanceToSquared($t))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&$e('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){$e("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,s=t.normal,r=t.uv;let o=this.getAttribute("tangent");(o===void 0||o.count!==n.count)&&(o=new bn(new Float32Array(4*n.count),4),this.setAttribute("tangent",o));const a=[],c=[],l=new Uint8Array(n.count);for(let R=0;R<n.count;R++)a[R]=new L,c[R]=new L;const u=new L,f=new L,h=new L,d=new he,p=new he,v=new he,g=new L,m=new L;function x(R,w,C){l[R]=l[w]=l[C]=1,u.fromBufferAttribute(n,R),f.fromBufferAttribute(n,w),h.fromBufferAttribute(n,C),d.fromBufferAttribute(r,R),p.fromBufferAttribute(r,w),v.fromBufferAttribute(r,C),f.sub(u),h.sub(u),p.sub(d),v.sub(d);const N=1/(p.x*v.y-v.x*p.y);isFinite(N)&&(g.copy(f).multiplyScalar(v.y).addScaledVector(h,-p.y).multiplyScalar(N),m.copy(h).multiplyScalar(p.x).addScaledVector(f,-v.x).multiplyScalar(N),a[R].add(g),a[w].add(g),a[C].add(g),c[R].add(m),c[w].add(m),c[C].add(m))}let y=this.groups;y.length===0&&(y=[{start:0,count:e.count}]);for(let R=0,w=y.length;R<w;++R){const C=y[R],N=C.start,F=C.count;for(let I=N,B=N+F;I<B;I+=3)x(e.getX(I+0),e.getX(I+1),e.getX(I+2))}const S=new L,E=new L,b=new L,_=new L;function M(R){b.fromBufferAttribute(s,R),_.copy(b);const w=a[R];S.copy(w),S.sub(b.multiplyScalar(b.dot(w))).normalize(),E.crossVectors(_,w);const N=E.dot(c[R])<0?-1:1;o.setXYZW(R,S.x,S.y,S.z,N)}for(let R=0,w=n.count;R<w;++R)l[R]&&M(R);this._transformed=!0}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new bn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let h=0,d=n.count;h<d;h++)n.setXYZ(h,0,0,0);const s=new L,r=new L,o=new L,a=new L,c=new L,l=new L,u=new L,f=new L;if(e)for(let h=0,d=e.count;h<d;h+=3){const p=e.getX(h+0),v=e.getX(h+1),g=e.getX(h+2);s.fromBufferAttribute(t,p),r.fromBufferAttribute(t,v),o.fromBufferAttribute(t,g),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),a.fromBufferAttribute(n,p),c.fromBufferAttribute(n,v),l.fromBufferAttribute(n,g),a.add(u),c.add(u),l.add(u),n.setXYZ(p,a.x,a.y,a.z),n.setXYZ(v,c.x,c.y,c.z),n.setXYZ(g,l.x,l.y,l.z)}else for(let h=0,d=t.count;h<d;h+=3)s.fromBufferAttribute(t,h+0),r.fromBufferAttribute(t,h+1),o.fromBufferAttribute(t,h+2),u.subVectors(o,r),f.subVectors(s,r),u.cross(f),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)$t.fromBufferAttribute(e,t),$t.normalize(),e.setXYZ(t,$t.x,$t.y,$t.z)}toNonIndexed(){function e(a,c){const l=a.array,u=a.itemSize,f=a.normalized,h=new l.constructor(c.length*u);let d=0,p=0;for(let v=0,g=c.length;v<g;v++){a.isInterleavedBufferAttribute?d=c[v]*a.data.stride+a.offset:d=c[v]*u;for(let m=0;m<u;m++)h[p++]=l[d++]}return new bn(h,u,f)}if(this.index===null)return Ve("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new It,n=this.index.array,s=this.attributes;for(const a in s){const c=s[a],l=e(c,n);t.setAttribute(a,l)}const r=this.morphAttributes;for(const a in r){const c=[],l=r[a];for(let u=0,f=l.length;u<f;u++){const h=l[u],d=e(h,n);c.push(d)}t.morphAttributes[a]=c}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,c=o.length;a<c;a++){const l=o[a];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){const c=this.parameters;for(const l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const c in n){const l=n[c];e.data.attributes[c]=l.toJSON(e.data)}const s={};let r=!1;for(const c in this.morphAttributes){const l=this.morphAttributes[c],u=[];for(let f=0,h=l.length;f<h;f++){const d=l[f];u.push(d.toJSON(e.data))}u.length>0&&(s[c]=u,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const s=e.attributes;for(const l in s){const u=s[l];this.setAttribute(l,u.clone(t))}const r=e.morphAttributes;for(const l in r){const u=[],f=r[l];for(let h=0,d=f.length;h<d;h++)u.push(f[h].clone(t));this.morphAttributes[l]=u}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let l=0,u=o.length;l<u;l++){const f=o[l];this.addGroup(f.start,f.count,f.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}}class ud{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=id,this.updateRanges=[],this.version=0,this.uuid=Yn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});const t=ih(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=this.array.slice(0).buffer);const n=new this.array.constructor(e.arrayBuffers[t]),s=new this.constructor(n,this.stride);return s.setUsage(this.usage),s}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={});const t=ih(this.array);e.arrayBuffers[t]===void 0&&(e.arrayBuffers[t]=Array.from(new Uint32Array(this.array.slice(0).buffer)));const n={uuid:this.uuid,buffer:t,type:this.array.constructor.name,stride:this.stride};return n.usage=this.usage,n}}function ih(i){return i.buffer._uuid===void 0&&(i.buffer._uuid=Yn()),i.byteOffset===0&&i.byteLength===i.buffer.byteLength?i.buffer._uuid:i.buffer._uuid+":"+i.byteOffset+":"+i.byteLength}const un=new L;class Zr{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s,this._normalizationScale=e!==void 0?Ea(e.array):void 0}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=this._denormalize(n)),n}setComponent(e,t,n){return this.normalized&&(n=this._normalize(n)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=this._normalize(t)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=this._denormalize(t)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=this._denormalize(t)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=this._denormalize(t)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=this._denormalize(t)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=this._normalize(t),n=this._normalize(n),s=this._normalize(s),r=this._normalize(r)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){ua("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new bn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Zr(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){ua("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}_denormalize(e){const t=this._normalizationScale;return t!==void 0?Math.max(e/t,-1):$c(e,this.data.array)}_normalize(e){const t=this._normalizationScale;return t!==void 0?Math.round(e*t):Jc(e,this.data.array)}}const nl=new L,C0=new L,P0=new Ze;class Si{constructor(e=new L(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const s=nl.subVectors(n,t).cross(C0.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){const s=e.delta(nl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const o=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(o<0||o>1)?null:t.copy(e.start).addScaledVector(s,o)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||P0.getNormalMatrix(e),s=this.coplanarPoint(nl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}}let L0=0;class Dn extends ds{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:L0++}),this.uuid=Yn(),this.name="",this.type="Material",this.blending=Ur,this.side=Xi,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ff,this.blendDst=Bf,this.blendEquation=Fs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Oe(0,0,0),this.blendAlpha=0,this.depthFunc=Wr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Hp,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ba,this.stencilZFail=Ba,this.stencilZPass=Ba,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){Ve(`Material: parameter '${t}' has value of undefined.`);continue}const s=this[t];if(s===void 0){Ve(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.diffuseRoughness!==void 0&&(n.diffuseRoughness=this.diffuseRoughness),this.diffuseRoughnessMap&&this.diffuseRoughnessMap.isTexture&&(n.diffuseRoughnessMap=this.diffuseRoughnessMap.toJSON(e).uuid),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessMinimum!==void 0&&(n.iridescenceThicknessMinimum=this.iridescenceThicknessMinimum),this.iridescenceThicknessMaximum!==void 0&&(n.iridescenceThicknessMaximum=this.iridescenceThicknessMaximum),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){const o=[];for(const a in r){const c=r[a];delete c.metadata,o.push(c)}return o}if(t){const r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Oe().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.diffuseRoughness!==void 0&&(this.diffuseRoughness=e.diffuseRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessMinimum!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum),e.iridescenceThicknessMaximum!==void 0&&(this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessMinimum=e.iridescenceThicknessRange[0],this.iridescenceThicknessMaximum=e.iridescenceThicknessRange[1]),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Si().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new he().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new he().fromArray(e.clearcoatNormalScale)),e.diffuseRoughnessMap!==void 0&&(this.diffuseRoughnessMap=t[e.diffuseRoughnessMap]||null),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class hd extends Dn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Oe(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}let Ts;const ur=new L,Es=new L,ws=new L,As=new he,hr=new he,fd=new et,Mo=new L,fr=new L,yo=new L,sh=new he,il=new he,rh=new he;class I0 extends At{constructor(e=new hd){if(super(),this.isSprite=!0,this.type="Sprite",Ts===void 0){Ts=new It;const t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new ud(t,5);Ts.setIndex([0,1,2,0,2,3]),Ts.setAttribute("position",new Zr(n,3,0,!1)),Ts.setAttribute("uv",new Zr(n,2,3,!1))}this.geometry=Ts,this.material=e,this.center=new he(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&$e('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Es.setFromMatrixScale(this.matrixWorld),fd.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),ws.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Es.multiplyScalar(-ws.z);const n=this.material.rotation;let s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));const o=this.center;bo(Mo.set(-.5,-.5,0),ws,o,Es,s,r),bo(fr.set(.5,-.5,0),ws,o,Es,s,r),bo(yo.set(.5,.5,0),ws,o,Es,s,r),sh.set(0,0),il.set(1,0),rh.set(1,1);let a=e.ray.intersectTriangle(Mo,fr,yo,!1,ur);if(a===null&&(bo(fr.set(-.5,.5,0),ws,o,Es,s,r),il.set(0,1),a=e.ray.intersectTriangle(Mo,yo,fr,!1,ur),a===null))return;const c=e.ray.origin.distanceTo(ur);c<e.near||c>e.far||t.push({distance:c,point:ur.clone(),uv:Pn.getInterpolation(ur,Mo,fr,yo,sh,il,rh,new he),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}toJSON(e){const t=super.toJSON(e);return t.object.center=this.center.toArray(),t}}function bo(i,e,t,n,s,r){As.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(hr.x=r*As.x-s*As.y,hr.y=s*As.x+r*As.y):hr.copy(As),i.copy(e),i.x+=hr.x,i.y+=hr.y,i.applyMatrix4(fd)}const mi=new L,sl=new L,To=new L,Eo=new L;class ao{constructor(e=new L,t=new L(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,mi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=mi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(mi.copy(this.origin).addScaledVector(this.direction,t),mi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){sl.copy(e).add(t).multiplyScalar(.5),To.copy(t).sub(e).normalize(),Eo.copy(this.origin).sub(sl);const r=e.distanceTo(t)*.5,o=-this.direction.dot(To),a=Eo.dot(this.direction),c=-Eo.dot(To),l=Eo.lengthSq(),u=Math.abs(1-o*o);let f,h,d,p;if(u>0)if(f=o*c-a,h=o*a-c,p=r*u,f>=0)if(h>=-p)if(h<=p){const v=1/u;f*=v,h*=v,d=f*(f+o*h+2*a)+h*(o*f+h+2*c)+l}else h=r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*c)+l;else h=-r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*c)+l;else h<=-p?(f=Math.max(0,-(-o*r+a)),h=f>0?-r:Math.min(Math.max(-r,-c),r),d=-f*f+h*(h+2*c)+l):h<=p?(f=0,h=Math.min(Math.max(-r,-c),r),d=h*(h+2*c)+l):(f=Math.max(0,-(o*r+a)),h=f>0?r:Math.min(Math.max(-r,-c),r),d=-f*f+h*(h+2*c)+l);else h=o>0?-r:r,f=Math.max(0,-(o*h+a)),d=-f*f+h*(h+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,f),s&&s.copy(sl).addScaledVector(To,h),d}intersectSphere(e,t){if(e.radius<0)return null;mi.subVectors(e.center,this.origin);const n=mi.dot(this.direction),s=mi.dot(mi)-n*n,r=e.radius*e.radius;if(s>r)return null;const o=Math.sqrt(r-s),a=n-o,c=n+o;return c<0?null:a<0?this.at(c,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,c;const l=1/this.direction.x,u=1/this.direction.y,f=1/this.direction.z,h=this.origin;return l>=0?(n=(e.min.x-h.x)*l,s=(e.max.x-h.x)*l):(n=(e.max.x-h.x)*l,s=(e.min.x-h.x)*l),u>=0?(r=(e.min.y-h.y)*u,o=(e.max.y-h.y)*u):(r=(e.max.y-h.y)*u,o=(e.min.y-h.y)*u),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),f>=0?(a=(e.min.z-h.z)*f,c=(e.max.z-h.z)*f):(a=(e.max.z-h.z)*f,c=(e.min.z-h.z)*f),n>c||a>s)||((a>n||n!==n)&&(n=a),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,mi)!==null}intersectTriangle(e,t,n,s,r){const o=this.origin,a=this.direction,c=a.x,l=a.y,u=a.z,f=e.x-o.x,h=e.y-o.y,d=e.z-o.z,p=t.x-o.x,v=t.y-o.y,g=t.z-o.z,m=n.x-o.x,x=n.y-o.y,y=n.z-o.z,S=Math.abs(c),E=Math.abs(l),b=Math.abs(u);let _,M,R,w,C,N,F,I,B,H,k,Q;if(S>=E&&S>=b?(R=c,N=f,B=p,Q=m,c>=0?(_=l,M=u,w=h,C=d,F=v,I=g,H=x,k=y):(_=u,M=l,w=d,C=h,F=g,I=v,H=y,k=x)):E>=b?(R=l,N=h,B=v,Q=x,l>=0?(_=u,M=c,w=d,C=f,F=g,I=p,H=y,k=m):(_=c,M=u,w=f,C=d,F=p,I=g,H=m,k=y)):(R=u,N=d,B=g,Q=y,u>=0?(_=c,M=l,w=f,C=h,F=p,I=v,H=m,k=x):(_=l,M=c,w=h,C=f,F=v,I=p,H=x,k=m)),R===0)return null;const G=_/R,Z=M/R,V=1/R,ue=w-G*N,Re=C-Z*N,D=F-G*B,K=I-Z*B,ne=H-G*Q,fe=k-Z*Q,ce=ne*K-fe*D,pe=ue*fe-Re*ne,He=D*Re-K*ue;if(s){if(ce<0||pe<0||He<0)return null}else if((ce<0||pe<0||He<0)&&(ce>0||pe>0||He>0))return null;const se=ce+pe+He;if(se===0)return null;const ge=V*(ce*N+pe*B+He*Q);return(se>0?ge<0:ge>0)?null:this.at(ge/se,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class it extends Dn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.combine=zc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const oh=new et,es=new ao,wo=new ri,ah=new L,Ao=new L,Ro=new L,Co=new L,rl=new L,Po=new L,lh=new L,Lo=new L;class mt extends At{constructor(e=new It,t=new it){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);const a=this.morphTargetInfluences;if(r&&a){Po.set(0,0,0);for(let c=0,l=r.length;c<l;c++){const u=a[c],f=r[c];u!==0&&(rl.fromBufferAttribute(f,e),o?Po.addScaledVector(rl,u):Po.addScaledVector(rl.sub(t),u))}t.add(Po)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),wo.copy(n.boundingSphere),wo.applyMatrix4(r),es.copy(e.ray).recast(e.near),!(wo.containsPoint(es.origin)===!1&&(es.intersectSphere(wo,ah)===null||es.origin.distanceToSquared(ah)>(e.far-e.near)**2))&&(oh.copy(r).invert(),es.copy(e.ray).applyMatrix4(oh),!(n.boundingBox!==null&&es.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,es)))}_computeIntersections(e,t,n){let s;const r=this.geometry,o=this.material,a=r.index,c=r.attributes.position,l=r.attributes.uv,u=r.attributes.uv1,f=r.attributes.normal,h=r.groups,d=r.drawRange;if(a!==null)if(Array.isArray(o))for(let p=0,v=h.length;p<v;p++){const g=h[p],m=o[g.materialIndex],x=Math.max(g.start,d.start),y=Math.min(a.count,Math.min(g.start+g.count,d.start+d.count));for(let S=x,E=y;S<E;S+=3){const b=a.getX(S),_=a.getX(S+1),M=a.getX(S+2);s=Io(this,m,e,n,l,u,f,b,_,M),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const p=Math.max(0,d.start),v=Math.min(a.count,d.start+d.count);for(let g=p,m=v;g<m;g+=3){const x=a.getX(g),y=a.getX(g+1),S=a.getX(g+2);s=Io(this,o,e,n,l,u,f,x,y,S),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(o))for(let p=0,v=h.length;p<v;p++){const g=h[p],m=o[g.materialIndex],x=Math.max(g.start,d.start),y=Math.min(c.count,Math.min(g.start+g.count,d.start+d.count));for(let S=x,E=y;S<E;S+=3){const b=S,_=S+1,M=S+2;s=Io(this,m,e,n,l,u,f,b,_,M),s&&(s.faceIndex=Math.floor(S/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{const p=Math.max(0,d.start),v=Math.min(c.count,d.start+d.count);for(let g=p,m=v;g<m;g+=3){const x=g,y=g+1,S=g+2;s=Io(this,o,e,n,l,u,f,x,y,S),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}}function N0(i,e,t,n,s,r,o,a){let c;if(e.side===ln?c=n.intersectTriangle(o,r,s,!0,a):c=n.intersectTriangle(s,r,o,e.side===Xi,a),c===null)return null;Lo.copy(a),Lo.applyMatrix4(i.matrixWorld);const l=t.ray.origin.distanceTo(Lo);return l<t.near||l>t.far?null:{distance:l,point:Lo.clone(),object:i}}function Io(i,e,t,n,s,r,o,a,c,l){i.getVertexPosition(a,Ao),i.getVertexPosition(c,Ro),i.getVertexPosition(l,Co);const u=N0(i,e,t,n,Ao,Ro,Co,lh);if(u){const f=new L;Pn.getBarycoord(lh,Ao,Ro,Co,f),s&&(u.uv=Pn.getInterpolatedAttribute(s,a,c,l,f,new he)),r&&(u.uv1=Pn.getInterpolatedAttribute(r,a,c,l,f,new he)),o&&(u.normal=Pn.getInterpolatedAttribute(o,a,c,l,f,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));const h={a,b:c,c:l,normal:new L,materialIndex:0};Pn.getNormal(Ao,Ro,Co,h.normal),u.face=h,u.barycoord=f}return u}const dr=new bt,ch=new bt,uh=new bt,D0=new bt,hh=new et,No=new L,ol=new ri,fh=new et,al=new ao;class U0 extends mt{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=Bu,this.bindMatrix=new et,this.bindMatrixInverse=new et,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new si),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,No),this.boundingBox.expandByPoint(No)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new ri),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,No),this.boundingSphere.expandByPoint(No)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}raycast(e,t){const n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),ol.copy(this.boundingSphere),ol.applyMatrix4(s),e.ray.intersectsSphere(ol)!==!1&&(fh.copy(s).invert(),al.copy(e.ray).applyMatrix4(fh),!(this.boundingBox!==null&&al.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,al)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new bt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===Bu?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Op?this.bindMatrixInverse.copy(this.bindMatrix).invert():Ve("SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,s=this.geometry;ch.fromBufferAttribute(s.attributes.skinIndex,e),uh.fromBufferAttribute(s.attributes.skinWeight,e),t.isVector4?(dr.copy(t),t.set(0,0,0,0)):(dr.set(t.x,t.y,t.z,1),t.set(0,0,0)),dr.applyMatrix4(this.bindMatrix);for(let r=0;r<4;r++){const o=uh.getComponent(r);if(o!==0){const a=ch.getComponent(r);hh.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(D0.copy(dr).applyMatrix4(hh),o)}}return t.isVector4&&(t.w=dr.w),t.applyMatrix4(this.bindMatrixInverse)}}class dd extends At{constructor(){super(),this.isBone=!0,this.type="Bone"}}class jc extends Vt{constructor(e=null,t=1,n=1,s,r,o,a,c,l=Gt,u=Gt,f,h){super(null,o,a,c,l,u,s,r,f,h),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const dh=new et,O0=new et;class eu{constructor(e=[],t=[]){this.uuid=Yn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.previousBoneMatrices=null,this.boneTexture=null,this.previousBoneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){Ve("Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new et)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new et;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:O0;dh.multiplyMatrices(a,t[r]),dh.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new eu(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new jc(t,e,e,Wn,Ln);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null),this.previousBoneTexture!==null&&(this.previousBoneTexture.dispose(),this.previousBoneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){const r=e.bones[n];let o=t[r];o===void 0&&(Ve("Skeleton: No bone found with UUID:",r),o=new dd),this.bones.push(o),this.boneInverses.push(new et().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){const o=t[s];e.bones.push(o.uuid);const a=n[s];e.boneInverses.push(a.toArray())}return e}}class ha extends bn{constructor(e,t,n,s=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const Rs=new et,ph=new et,Do=[],mh=new si,F0=new et,pr=new mt,mr=new ri;class tu extends mt{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new ha(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,F0)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new si),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Rs),mh.copy(e.boundingBox).applyMatrix4(Rs),this.boundingBox.union(mh)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new ri),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,Rs),mr.copy(e.boundingSphere).applyMatrix4(Rs),this.boundingSphere.union(mr)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),this.morphTexture=e.morphTexture!==null?e.morphTexture.clone():null,this.instanceColor=e.instanceColor!==null?e.instanceColor.clone():null,this.count=e.count,this.boundingBox=e.boundingBox!==null?e.boundingBox.clone():null,this.boundingSphere=e.boundingSphere!==null?e.boundingSphere.clone():null,this}getColorAt(e,t){return this.instanceColor===null?t.setRGB(1,1,1):t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){return t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=s[o+a]}raycast(e,t){const n=this.matrixWorld,s=this.count;if(pr.geometry=this.geometry,pr.material=this.material,pr.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),mr.copy(this.boundingSphere),mr.applyMatrix4(n),e.ray.intersectsSphere(mr)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Rs),ph.multiplyMatrices(n,Rs),pr.matrixWorld=ph,pr.raycast(e,Do);for(let o=0,a=Do.length;o<a;o++){const c=Do[o];c.instanceId=r,c.object=this,t.push(c)}Do.length=0}}setColorAt(e,t){return this.instanceColor===null&&(this.instanceColor=new ha(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3),this}setMatrixAt(e,t){return t.toArray(this.instanceMatrix.array,e*16),this}setMorphAt(e,t){const n=t.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new jc(new Float32Array(s*this.count),s,this.count,Wc,Ln));const r=this.morphTexture.source.data.data;let o=0;for(let l=0;l<n.length;l++)o+=n[l];const a=this.geometry.morphTargetsRelative?1:1-o,c=s*e;return r[c]=a,r.set(n,c+1),this}updateMorphTargets(){}dispose(){super.dispose(),this.instanceMatrix.dispose(),this.instanceColor!==null&&this.instanceColor.dispose(),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const ts=new ri,B0=new he(.5,.5),Uo=new L;class Qr{constructor(e=new Si,t=new Si,n=new Si,s=new Si,r=new Si,o=new Si){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=Xn,n=!1){const s=this.planes,r=e.elements,o=r[0],a=r[1],c=r[2],l=r[3],u=r[4],f=r[5],h=r[6],d=r[7],p=r[8],v=r[9],g=r[10],m=r[11],x=r[12],y=r[13],S=r[14],E=r[15];if(s[0].setComponents(l-o,d-u,m-p,E-x).normalize(),s[1].setComponents(l+o,d+u,m+p,E+x).normalize(),s[2].setComponents(l+a,d+f,m+v,E+y).normalize(),s[3].setComponents(l-a,d-f,m-v,E-y).normalize(),n)s[4].setComponents(c,h,g,S).normalize(),s[5].setComponents(l-c,d-h,m-g,E-S).normalize();else if(s[4].setComponents(l-c,d-h,m-g,E-S).normalize(),t===Xn)s[5].setComponents(l+c,d+h,m+g,E+S).normalize();else if(t===$r)s[5].setComponents(c,h,g,S).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ts.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ts.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ts)}intersectsSprite(e){ts.center.set(0,0,0);const t=B0.distanceTo(e.center);return ts.radius=.7071067811865476+t,ts.applyMatrix4(e.matrixWorld),this.intersectsSphere(ts)}intersectsSphere(e){const t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const s=t[n];if(Uo.x=s.normal.x>0?e.max.x:e.min.x,Uo.y=s.normal.y>0?e.max.y:e.min.y,Uo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Uo)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}const gh=new et;class nu{constructor(){this.coordinateSystem=Xn,this._frustums=[],this._count=0}setFromArrayCamera(e){const t=e.cameras,n=this._frustums;for(let s=0;s<t.length;s++){const r=t[s];gh.multiplyMatrices(r.projectionMatrix,r.matrixWorldInverse),n[s]===void 0&&(n[s]=new Qr),n[s].setFromProjectionMatrix(gh,r.coordinateSystem,r.reversedDepth)}return this._count=t.length,this}getFrustum(e){return this._frustums[e]}intersectsObject(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsObject(e))return!0;return!1}intersectsSprite(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSprite(e))return!0;return!1}intersectsSphere(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsSphere(e))return!0;return!1}intersectsBox(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].intersectsBox(e))return!0;return!1}containsPoint(e){const t=this._frustums;for(let n=0;n<this._count;n++)if(t[n].containsPoint(e))return!0;return!1}copy(e){this.coordinateSystem=e.coordinateSystem;const t=this._frustums,n=e._frustums;for(let s=0;s<e._count;s++)t[s]===void 0&&(t[s]=new Qr),t[s].copy(n[s]);return this._count=e._count,this}clone(){return new nu().copy(this)}}class iu extends Dn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Oe(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const fa=new L,da=new L,_h=new et,gr=new ao,Oo=new ri,ll=new L,xh=new L;class su extends At{constructor(e=new It,t=new iu){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)fa.fromBufferAttribute(t,s-1),da.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=fa.distanceTo(da);e.setAttribute("lineDistance",new Qe(n,1))}else Ve("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Oo.copy(n.boundingSphere),Oo.applyMatrix4(s),Oo.radius+=r,e.ray.intersectsSphere(Oo)===!1)return;_h.copy(s).invert(),gr.copy(e.ray).applyMatrix4(_h);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){const d=Math.max(0,o.start),p=Math.min(u.count,o.start+o.count);for(let v=d,g=p-1;v<g;v+=l){const m=u.getX(v),x=u.getX(v+1),y=Fo(this,e,gr,c,m,x,v);y&&t.push(y)}if(this.isLineLoop){const v=u.getX(p-1),g=u.getX(d),m=Fo(this,e,gr,c,v,g,p-1);m&&t.push(m)}}else{const d=Math.max(0,o.start),p=Math.min(h.count,o.start+o.count);for(let v=d,g=p-1;v<g;v+=l){const m=Fo(this,e,gr,c,v,v+1,v);m&&t.push(m)}if(this.isLineLoop){const v=Fo(this,e,gr,c,p-1,d,p-1);v&&t.push(v)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Fo(i,e,t,n,s,r,o){const a=i.geometry.attributes.position;if(fa.fromBufferAttribute(a,s),da.fromBufferAttribute(a,r),t.distanceSqToSegment(fa,da,ll,xh)>n)return;ll.applyMatrix4(i.matrixWorld);const l=e.ray.origin.distanceTo(ll);if(!(l<e.near||l>e.far))return{distance:l,point:xh.clone().applyMatrix4(i.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:i}}const vh=new L,Sh=new L;class pd extends su{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)vh.fromBufferAttribute(t,s),Sh.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+vh.distanceTo(Sh);e.setAttribute("lineDistance",new Qe(n,1))}else Ve("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class z0 extends su{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class md extends Dn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Oe(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Mh=new et,_c=new ao,Bo=new ri,zo=new L;class k0 extends At{constructor(e=new It,t=new md){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0?this.morphTargetInfluences=e.morphTargetInfluences.slice():this.morphTargetInfluences=void 0,e.morphTargetDictionary!==void 0?this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary):this.morphTargetDictionary=void 0,this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){const n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Bo.copy(n.boundingSphere),Bo.applyMatrix4(s),Bo.radius+=r,e.ray.intersectsSphere(Bo)===!1)return;Mh.copy(s).invert(),_c.copy(e.ray).applyMatrix4(Mh);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=a*a,l=n.index,f=n.attributes.position;if(l!==null){const h=Math.max(0,o.start),d=Math.min(l.count,o.start+o.count);for(let p=h,v=d;p<v;p++){const g=l.getX(p);zo.fromBufferAttribute(f,g),yh(zo,g,c,s,e,t,this)}}else{const h=Math.max(0,o.start),d=Math.min(f.count,o.start+o.count);for(let p=h,v=d;p<v;p++)zo.fromBufferAttribute(f,p),yh(zo,p,c,s,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){const a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function yh(i,e,t,n,s,r,o){const a=_c.distanceSqToPoint(i);if(a<t){const c=new L;_c.closestPointToPoint(i,c),c.applyMatrix4(n);const l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(a),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class gd extends Vt{constructor(e=[],t=qs,n,s,r,o,a,c,l,u){super(e,t,n,s,r,o,a,c,l,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class oi extends Vt{constructor(e,t,n,s,r,o,a,c,l){super(e,t,n,s,r,o,a,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}}class $s extends Vt{constructor(e,t,n=ni,s,r,o,a=Gt,c=Gt,l,u=Yi,f=1){if(u!==Yi&&u!==Vi)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const h={width:e,height:t,depth:f};super(h,s,r,o,a,c,u,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Zc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}}class _d extends $s{constructor(e,t=ni,n=qs,s,r,o=Gt,a=Gt,c,l=Yi){const u={width:e,height:e,depth:1},f=[u,u,u,u,u,u];super(e,e,t,n,s,r,o,a,c,l),this.image=f,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}}class xd extends Vt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class en extends It{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};const a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);const c=[],l=[],u=[],f=[];let h=0,d=0;p("z","y","x",-1,-1,n,t,e,o,r,0),p("z","y","x",1,-1,n,t,-e,o,r,1),p("x","z","y",1,1,e,n,t,s,o,2),p("x","z","y",1,-1,e,n,-t,s,o,3),p("x","y","z",1,-1,e,t,n,s,r,4),p("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new Qe(l,3)),this.setAttribute("normal",new Qe(u,3)),this.setAttribute("uv",new Qe(f,2));function p(v,g,m,x,y,S,E,b,_,M,R){const w=S/_,C=E/M,N=S/2,F=E/2,I=b/2,B=_+1,H=M+1;let k=0,Q=0;const G=new L;for(let Z=0;Z<H;Z++){const V=Z*C-F;for(let ue=0;ue<B;ue++){const Re=ue*w-N;G[v]=Re*x,G[g]=V*y,G[m]=I,l.push(G.x,G.y,G.z),G[v]=0,G[g]=0,G[m]=b>0?1:-1,u.push(G.x,G.y,G.z),f.push(ue/_),f.push(1-Z/M),k+=1}}for(let Z=0;Z<M;Z++)for(let V=0;V<_;V++){const ue=h+V+B*Z,Re=h+V+B*(Z+1),D=h+(V+1)+B*(Z+1),K=h+(V+1)+B*Z;c.push(ue,Re,K),c.push(Re,D,K),Q+=6}a.addGroup(d,Q,R),d+=Q,h+=k}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new en(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}class Js extends It{constructor(e=1,t=1,n=4,s=8,r=1){super(),this.type="CapsuleGeometry",this.parameters={radius:e,height:t,capSegments:n,radialSegments:s,heightSegments:r},t=Math.max(0,t),n=Math.max(1,Math.floor(n)),s=Math.max(3,Math.floor(s)),r=Math.max(1,Math.floor(r));const o=[],a=[],c=[],l=[],u=t/2,f=Math.PI/2*e,h=t,d=2*f+h,p=n*2+r,v=s+1,g=new L,m=new L;for(let x=0;x<=p;x++){let y=0,S=0,E=0,b=0;if(x<=n){const R=x/n,w=R*Math.PI/2;S=-u-e*Math.cos(w),E=e*Math.sin(w),b=-e*Math.cos(w),y=R*f}else if(x<=n+r){const R=(x-n)/r;S=-u+R*t,E=e,b=0,y=f+R*h}else{const R=(x-n-r)/n,w=R*Math.PI/2;S=u+e*Math.sin(w),E=e*Math.cos(w),b=e*Math.sin(w),y=f+h+R*f}const _=Math.max(0,Math.min(1,y/d));let M=0;x===0?M=.5/s:x===p&&(M=-.5/s);for(let R=0;R<=s;R++){const w=R/s,C=w*Math.PI*2,N=Math.sin(C),F=Math.cos(C);m.x=-E*F,m.y=S,m.z=E*N,a.push(m.x,m.y,m.z),g.set(-E*F,b,E*N),g.normalize(),c.push(g.x,g.y,g.z),l.push(w+M,_)}if(x>0){const R=(x-1)*v;for(let w=0;w<s;w++){const C=R+w,N=R+w+1,F=x*v+w,I=x*v+w+1;o.push(C,N,F),o.push(N,I,F)}}}this.setIndex(o),this.setAttribute("position",new Qe(a,3)),this.setAttribute("normal",new Qe(c,3)),this.setAttribute("uv",new Qe(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Js(e.radius,e.height,e.capSegments,e.radialSegments,e.heightSegments)}}class Tn extends It{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);const r=[],o=[],a=[],c=[],l=new L,u=new he;o.push(0,0,0),a.push(0,0,1),c.push(.5,.5);for(let f=0,h=3;f<=t;f++,h+=3){const d=n+f/t*s;l.x=e*Math.cos(d),l.y=e*Math.sin(d),o.push(l.x,l.y,l.z),a.push(0,0,1),u.x=(o[h]/e+1)/2,u.y=(o[h+1]/e+1)/2,c.push(u.x,u.y)}for(let f=1;f<=t;f++)r.push(f,f+1,0);this.setIndex(r),this.setAttribute("position",new Qe(o,3)),this.setAttribute("normal",new Qe(a,3)),this.setAttribute("uv",new Qe(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Tn(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class dt extends It{constructor(e=1,t=1,n=1,s=32,r=1,o=!1,a=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:c};const l=this;s=Math.floor(s),r=Math.floor(r);const u=[],f=[],h=[],d=[];let p=0;const v=[],g=n/2;let m=0;x(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(u),this.setAttribute("position",new Qe(f,3)),this.setAttribute("normal",new Qe(h,3)),this.setAttribute("uv",new Qe(d,2));function x(){const S=new L,E=new L;let b=0;const _=(t-e)/n;for(let M=0;M<=r;M++){const R=[],w=M/r,C=w*(t-e)+e;for(let N=0;N<=s;N++){const F=N/s,I=F*c+a,B=Math.sin(I),H=Math.cos(I);E.x=C*B,E.y=-w*n+g,E.z=C*H,f.push(E.x,E.y,E.z),S.set(B,_,H).normalize(),h.push(S.x,S.y,S.z),d.push(F,1-w),R.push(p++)}v.push(R)}for(let M=0;M<s;M++)for(let R=0;R<r;R++){const w=v[R][M],C=v[R+1][M],N=v[R+1][M+1],F=v[R][M+1];(e>0||R!==0)&&(u.push(w,C,F),b+=3),(t>0||R!==r-1)&&(u.push(C,N,F),b+=3)}l.addGroup(m,b,0),m+=b}function y(S){const E=p,b=new he,_=new L;let M=0;const R=S===!0?e:t,w=S===!0?1:-1;for(let N=1;N<=s;N++)f.push(0,g*w,0),h.push(0,w,0),d.push(.5,.5),p++;const C=p;for(let N=0;N<=s;N++){const I=N/s*c+a,B=Math.cos(I),H=Math.sin(I);_.x=R*H,_.y=g*w,_.z=R*B,f.push(_.x,_.y,_.z),h.push(0,w,0),b.x=B*.5+.5,b.y=H*.5*w+.5,d.push(b.x,b.y),p++}for(let N=0;N<s;N++){const F=E+N,I=C+N;S===!0?u.push(I,I+1,F):u.push(I+1,I,F),M+=3}l.addGroup(m,M,S===!0?1:2),m+=M}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new dt(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Aa extends dt{constructor(e=1,t=1,n=32,s=1,r=!1,o=0,a=Math.PI*2){super(0,e,t,n,s,r,o,a),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:o,thetaLength:a}}static fromJSON(e){return new Aa(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class ru extends It{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};const r=[],o=[];a(s),l(n),u(),this.setAttribute("position",new Qe(r,3)),this.setAttribute("normal",new Qe(r.slice(),3)),this.setAttribute("uv",new Qe(o,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function a(x){const y=new L,S=new L,E=new L;for(let b=0;b<t.length;b+=3)d(t[b+0],y),d(t[b+1],S),d(t[b+2],E),c(y,S,E,x)}function c(x,y,S,E){const b=E+1,_=[];for(let M=0;M<=b;M++){_[M]=[];const R=x.clone().lerp(S,M/b),w=y.clone().lerp(S,M/b),C=b-M;for(let N=0;N<=C;N++)N===0&&M===b?_[M][N]=R:_[M][N]=R.clone().lerp(w,N/C)}for(let M=0;M<b;M++)for(let R=0;R<2*(b-M)-1;R++){const w=Math.floor(R/2);R%2===0?(h(_[M][w+1]),h(_[M+1][w]),h(_[M][w])):(h(_[M][w+1]),h(_[M+1][w+1]),h(_[M+1][w]))}}function l(x){const y=new L;for(let S=0;S<r.length;S+=3)y.x=r[S+0],y.y=r[S+1],y.z=r[S+2],y.normalize().multiplyScalar(x),r[S+0]=y.x,r[S+1]=y.y,r[S+2]=y.z}function u(){const x=new L;for(let y=0;y<r.length;y+=3){x.x=r[y+0],x.y=r[y+1],x.z=r[y+2];const S=g(x)/2/Math.PI+.5,E=m(x)/Math.PI+.5;o.push(S,1-E)}p(),f()}function f(){for(let x=0;x<o.length;x+=6){const y=o[x+0],S=o[x+2],E=o[x+4],b=Math.max(y,S,E),_=Math.min(y,S,E);b>.9&&_<.1&&(y<.2&&(o[x+0]+=1),S<.2&&(o[x+2]+=1),E<.2&&(o[x+4]+=1))}}function h(x){r.push(x.x,x.y,x.z)}function d(x,y){const S=x*3;y.x=e[S+0],y.y=e[S+1],y.z=e[S+2]}function p(){const x=new L,y=new L,S=new L,E=new L,b=new he,_=new he,M=new he;for(let R=0,w=0;R<r.length;R+=9,w+=6){x.set(r[R+0],r[R+1],r[R+2]),y.set(r[R+3],r[R+4],r[R+5]),S.set(r[R+6],r[R+7],r[R+8]),b.set(o[w+0],o[w+1]),_.set(o[w+2],o[w+3]),M.set(o[w+4],o[w+5]),E.copy(x).add(y).add(S).divideScalar(3);const C=g(E);v(b,w+0,x,C),v(_,w+2,y,C),v(M,w+4,S,C)}}function v(x,y,S,E){E<0&&x.x===1&&(o[y]=x.x-1),S.x===0&&S.z===0&&(o[y]=E/2/Math.PI+.5)}function g(x){return Math.atan2(x.z,-x.x)}function m(x){return Math.atan2(-x.y,Math.sqrt(x.x*x.x+x.z*x.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ru(e.vertices,e.indices,e.radius,e.detail)}}class ou extends ru{constructor(e=1,t=0){const n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],o=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,o,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new ou(e.radius,e.detail)}}class ai{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Ve("Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let s=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,c=r-1,l;for(;a<=c;)if(s=Math.floor(a+(c-a)/2),l=n[s]-o,l<0)a=s+1;else if(l>0)c=s-1;else{c=s;break}if(s=c,n[s]===o)return s/(r-1);const u=n[s],h=n[s+1]-u,d=(o-u)/h;return(s+d)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);const o=this.getPoint(s),a=this.getPoint(r),c=t||(o.isVector2?new he:new L);return c.copy(a).sub(o).normalize(),c}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new L,s=[],r=[],o=[],a=new L,c=new et;for(let d=0;d<=e;d++){const p=d/e;s[d]=this.getTangentAt(p,new L)}r[0]=new L,o[0]=new L;let l=Number.MAX_VALUE;const u=Math.abs(s[0].x),f=Math.abs(s[0].y),h=Math.abs(s[0].z);u<=l&&(l=u,n.set(1,0,0)),f<=l&&(l=f,n.set(0,1,0)),h<=l&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let d=1;d<=e;d++){if(r[d]=r[d-1].clone(),o[d]=o[d-1].clone(),a.crossVectors(s[d-1],s[d]),a.length()>Number.EPSILON){a.normalize();const p=Math.acos(ot(s[d-1].dot(s[d]),-1,1));r[d].applyMatrix4(c.makeRotationAxis(a,p))}o[d].crossVectors(s[d],r[d])}if(t===!0){let d=Math.acos(ot(r[0].dot(r[e]),-1,1));d/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(d=-d);for(let p=1;p<=e;p++)r[p].applyMatrix4(c.makeRotationAxis(s[p],d*p)),o[p].crossVectors(s[p],r[p])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this.cacheArcLengths=null,this}}class au extends ai{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=c}getPoint(e,t=new he){const n=t,s=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);const a=this.aStartAngle+e*r;let c=this.aX+this.xRadius*Math.cos(a),l=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const u=Math.cos(this.aRotation),f=Math.sin(this.aRotation),h=c-this.aX,d=l-this.aY;c=h*u-d*f+this.aX,l=h*f+d*u+this.aY}return n.set(c,l)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class H0 extends au{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function lu(){let i=0,e=0,t=0,n=0;function s(r,o,a,c){i=r,e=a,t=-3*r+3*o-2*a-c,n=2*r-2*o+a+c}return{initCatmullRom:function(r,o,a,c,l){s(o,a,l*(a-r),l*(c-o))},initNonuniformCatmullRom:function(r,o,a,c,l,u,f){let h=(o-r)/l-(a-r)/(l+u)+(a-o)/u,d=(a-o)/u-(c-o)/(u+f)+(c-a)/f;h*=u,d*=u,s(o,a,h,d)},calc:function(r){const o=r*r,a=o*r;return i+e*r+t*o+n*a}}}const bh=new L,Th=new L,cl=new lu,ul=new lu,hl=new lu;class vd extends ai{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new L){const n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),c=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:c===0&&a===r-1&&(a=r-2,c=1);let l,u;this.closed||a>0?l=s[(a-1)%r]:(Th.subVectors(s[0],s[1]).add(s[0]),l=Th);const f=s[a%r],h=s[(a+1)%r];if(this.closed||a+2<r?u=s[(a+2)%r]:(bh.subVectors(s[r-1],s[r-2]).add(s[r-1]),u=bh),this.curveType==="centripetal"||this.curveType==="chordal"){const d=this.curveType==="chordal"?.5:.25;let p=Math.pow(l.distanceToSquared(f),d),v=Math.pow(f.distanceToSquared(h),d),g=Math.pow(h.distanceToSquared(u),d);v<1e-4&&(v=1),p<1e-4&&(p=v),g<1e-4&&(g=v),cl.initNonuniformCatmullRom(l.x,f.x,h.x,u.x,p,v,g),ul.initNonuniformCatmullRom(l.y,f.y,h.y,u.y,p,v,g),hl.initNonuniformCatmullRom(l.z,f.z,h.z,u.z,p,v,g)}else this.curveType==="catmullrom"&&(cl.initCatmullRom(l.x,f.x,h.x,u.x,this.tension),ul.initCatmullRom(l.y,f.y,h.y,u.y,this.tension),hl.initCatmullRom(l.z,f.z,h.z,u.z,this.tension));return n.set(cl.calc(c),ul.calc(c),hl.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new L().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Eh(i,e,t,n,s){const r=(n-e)*.5,o=(s-t)*.5,a=i*i,c=i*a;return(2*t-2*n+r+o)*c+(-3*t+3*n-2*r-o)*a+r*i+t}function G0(i,e){const t=1-i;return t*t*e}function V0(i,e){return 2*(1-i)*i*e}function W0(i,e){return i*i*e}function Br(i,e,t,n){return G0(i,e)+V0(i,t)+W0(i,n)}function X0(i,e){const t=1-i;return t*t*t*e}function q0(i,e){const t=1-i;return 3*t*t*i*e}function Y0(i,e){return 3*(1-i)*i*i*e}function K0(i,e){return i*i*i*e}function zr(i,e,t,n,s){return X0(i,e)+q0(i,t)+Y0(i,n)+K0(i,s)}class Sd extends ai{constructor(e=new he,t=new he,n=new he,s=new he){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new he){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(zr(e,s.x,r.x,o.x,a.x),zr(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class $0 extends ai{constructor(e=new L,t=new L,n=new L,s=new L){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new L){const n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(zr(e,s.x,r.x,o.x,a.x),zr(e,s.y,r.y,o.y,a.y),zr(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Md extends ai{constructor(e=new he,t=new he){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new he){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new he){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class J0 extends ai{constructor(e=new L,t=new L){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new L){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new L){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class yd extends ai{constructor(e=new he,t=new he,n=new he){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new he){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Br(e,s.x,r.x,o.x),Br(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class bd extends ai{constructor(e=new L,t=new L,n=new L){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new L){const n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Br(e,s.x,r.x,o.x),Br(e,s.y,r.y,o.y),Br(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Td extends ai{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new he){const n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,c=s[o===0?o:o-1],l=s[o],u=s[o>s.length-2?s.length-1:o+1],f=s[o>s.length-3?s.length-1:o+2];return n.set(Eh(a,c.x,l.x,u.x,f.x),Eh(a,c.y,l.y,u.y,f.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const s=e.points[t];this.points.push(new he().fromArray(s))}return this}}var pa=Object.freeze({__proto__:null,ArcCurve:H0,CatmullRomCurve3:vd,CubicBezierCurve:Sd,CubicBezierCurve3:$0,EllipseCurve:au,LineCurve:Md,LineCurve3:J0,QuadraticBezierCurve:yd,QuadraticBezierCurve3:bd,SplineCurve:Td});class Z0 extends ai{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1,this.cacheLengths=null}add(e){this.curves.push(e)}closePath(){const e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){const n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new pa[n](t,e))}return this}getPoint(e,t){const n=e*this.getLength(),s=this.getCurveLengths();let r=0;for(;r<s.length;){if(s[r]>=n){const o=s[r]-n,a=this.curves[r],c=a.getLength(),l=c===0?0:1-o/c;return a.getPointAt(l,t)}r++}return null}getLength(){const e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;const e=[];let t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){const t=[];let n;for(let s=0,r=this.curves;s<r.length;s++){const o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,c=o.getPoints(a);for(let l=0;l<c.length;l++){const u=c[l];n&&n.equals(u)||(t.push(u),n=u)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this.cacheLengths=null,this}toJSON(){const e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){const s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){const s=e.curves[t];this.curves.push(new pa[s.type]().fromJSON(s))}return this.cacheLengths=null,this}}class Zs extends Z0{constructor(e){super(),this.type="Path",this.currentPoint=new he,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){const n=new Md(this.currentPoint.clone(),new he(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){const r=new yd(this.currentPoint.clone(),new he(e,t),new he(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){const a=new Sd(this.currentPoint.clone(),new he(e,t),new he(n,s),new he(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){const t=[this.currentPoint.clone()].concat(e),n=new Td(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){const a=this.currentPoint.x,c=this.currentPoint.y;return this.absarc(e+a,t+c,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,c){const l=this.currentPoint.x,u=this.currentPoint.y;return this.absellipse(e+l,t+u,n,s,r,o,a,c),this}absellipse(e,t,n,s,r,o,a,c){const l=new au(e,t,n,s,r,o,a,c);if(this.curves.length>0){const f=l.getPoint(0);f.equals(this.currentPoint)||this.lineTo(f.x,f.y)}this.curves.push(l);const u=l.getPoint(1);return this.currentPoint.copy(u),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){const e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}}class Pi extends Zs{constructor(e){super(e),this.uuid=Yn(),this.type="Shape",this.holes=[]}getPointsHoles(e){const t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){const e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){const s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){const s=e.holes[t];this.holes.push(new Zs().fromJSON(s))}return this}}function Q0(i,e,t=2){const n=e&&e.length,s=n?e[0]*t:i.length;let r=Ed(i,0,s,t,!0);const o=[];if(!r||r.next===r.prev)return o;let a,c,l;if(n&&(r=im(i,e,r,t)),i.length>80*t){a=i[0],c=i[1];let u=a,f=c;for(let h=t;h<s;h+=t){const d=i[h],p=i[h+1];d<a&&(a=d),p<c&&(c=p),d>u&&(u=d),p>f&&(f=p)}l=Math.max(u-a,f-c),l=l!==0?32767/l:0}return jr(r,o,t,a,c,l,0),o}function Ed(i,e,t,n,s){let r;if(s===pm(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=wh(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=wh(o/n|0,i[o],i[o+1],r);return r&&Qs(r,r.next)&&(to(r),r=r.next),r}function hs(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(Qs(t,t.next)||Dt(t.prev,t,t.next)===0)){if(to(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function jr(i,e,t,n,s,r,o){if(!i)return;!o&&r&&lm(i,n,s,r);let a=i;for(;i.prev!==i.next;){const c=i.prev,l=i.next;if(r?em(i,n,s,r):j0(i)){e.push(c.i,i.i,l.i),to(i),i=l.next,a=l.next;continue}if(i=l,i===a){o?o===1?(i=tm(hs(i),e),jr(i,e,t,n,s,r,2)):o===2&&nm(i,e,t,n,s,r):jr(hs(i),e,t,n,s,r,1);break}}}function j0(i){const e=i.prev,t=i,n=i.next;if(Dt(e,t,n)>=0)return!1;const s=e.x,r=t.x,o=n.x,a=e.y,c=t.y,l=n.y,u=Math.min(s,r,o),f=Math.min(a,c,l),h=Math.max(s,r,o),d=Math.max(a,c,l);let p=n.next;for(;p!==e;){if(p.x>=u&&p.x<=h&&p.y>=f&&p.y<=d&&Rr(s,a,r,c,o,l,p.x,p.y)&&Dt(p.prev,p,p.next)>=0)return!1;p=p.next}return!0}function em(i,e,t,n){const s=i.prev,r=i,o=i.next;if(Dt(s,r,o)>=0)return!1;const a=s.x,c=r.x,l=o.x,u=s.y,f=r.y,h=o.y,d=Math.min(a,c,l),p=Math.min(u,f,h),v=Math.max(a,c,l),g=Math.max(u,f,h),m=xc(d,p,e,t,n),x=xc(v,g,e,t,n);let y=i.prevZ,S=i.nextZ;for(;y&&y.z>=m&&S&&S.z<=x;){if(y.x>=d&&y.x<=v&&y.y>=p&&y.y<=g&&y!==s&&y!==o&&Rr(a,u,c,f,l,h,y.x,y.y)&&Dt(y.prev,y,y.next)>=0||(y=y.prevZ,S.x>=d&&S.x<=v&&S.y>=p&&S.y<=g&&S!==s&&S!==o&&Rr(a,u,c,f,l,h,S.x,S.y)&&Dt(S.prev,S,S.next)>=0))return!1;S=S.nextZ}for(;y&&y.z>=m;){if(y.x>=d&&y.x<=v&&y.y>=p&&y.y<=g&&y!==s&&y!==o&&Rr(a,u,c,f,l,h,y.x,y.y)&&Dt(y.prev,y,y.next)>=0)return!1;y=y.prevZ}for(;S&&S.z<=x;){if(S.x>=d&&S.x<=v&&S.y>=p&&S.y<=g&&S!==s&&S!==o&&Rr(a,u,c,f,l,h,S.x,S.y)&&Dt(S.prev,S,S.next)>=0)return!1;S=S.nextZ}return!0}function tm(i,e){let t=i;do{const n=t.prev,s=t.next.next;!Qs(n,s)&&Ad(n,t,t.next,s)&&eo(n,s)&&eo(s,n)&&(e.push(n.i,t.i,s.i),to(t),to(t.next),t=i=s),t=t.next}while(t!==i);return hs(t)}function nm(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&hm(o,a)){let c=Rd(o,a);o=hs(o,o.next),c=hs(c,c.next),jr(o,e,t,n,s,r,0),jr(c,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function im(i,e,t,n){const s=[];for(let r=0,o=e.length;r<o;r++){const a=e[r]*n,c=r<o-1?e[r+1]*n:i.length,l=Ed(i,a,c,n,!1);l===l.next&&(l.steiner=!0),s.push(um(l))}s.sort(sm);for(let r=0;r<s.length;r++)t=rm(s[r],t);return t}function sm(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){const n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function rm(i,e){const t=om(i,e);if(!t)return e;const n=Rd(t,i);return hs(n,n.next),hs(t,t.next)}function om(i,e){let t=e;const n=i.x,s=i.y;let r=-1/0,o;if(Qs(i,t))return t;do{if(Qs(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){const f=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(f<=n&&f>r&&(r=f,o=t.x<t.next.x?t:t.next,f===n))return o}t=t.next}while(t!==e);if(!o)return null;const a=o,c=o.x,l=o.y;let u=1/0;t=o;do{if(n>=t.x&&t.x>=c&&n!==t.x&&wd(s<l?n:r,s,c,l,s<l?r:n,s,t.x,t.y)){const f=Math.abs(s-t.y)/(n-t.x);eo(t,i)&&(f<u||f===u&&(t.x>o.x||t.x===o.x&&am(o,t)))&&(o=t,u=f)}t=t.next}while(t!==a);return o}function am(i,e){return Dt(i.prev,i,e.prev)<0&&Dt(e.next,i,i.next)<0}function lm(i,e,t,n){let s=i;do s.z===0&&(s.z=xc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,cm(s)}function cm(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let l=0;l<t&&(a++,o=o.nextZ,!!o);l++);let c=t;for(;a>0||c>0&&o;)a!==0&&(c===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,c--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function xc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function um(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function wd(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function Rr(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&wd(i,e,t,n,s,r,o,a)}function hm(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!fm(i,e)&&(eo(i,e)&&eo(e,i)&&dm(i,e)&&(Dt(i.prev,i,e.prev)||Dt(i,e.prev,e))||Qs(i,e)&&Dt(i.prev,i,i.next)>0&&Dt(e.prev,e,e.next)>0)}function Dt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function Qs(i,e){return i.x===e.x&&i.y===e.y}function Ad(i,e,t,n){const s=Ho(Dt(i,e,t)),r=Ho(Dt(i,e,n)),o=Ho(Dt(t,n,i)),a=Ho(Dt(t,n,e));return!!(s!==r&&o!==a||s===0&&ko(i,t,e)||r===0&&ko(i,n,e)||o===0&&ko(t,i,n)||a===0&&ko(t,e,n))}function ko(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Ho(i){return i>0?1:i<0?-1:0}function fm(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Ad(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function eo(i,e){return Dt(i.prev,i,i.next)<0?Dt(i,e,i.next)>=0&&Dt(i,i.prev,e)>=0:Dt(i,e,i.prev)<0||Dt(i,i.next,e)<0}function dm(i,e){let t=i,n=!1;const s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Rd(i,e){const t=vc(i.i,i.x,i.y),n=vc(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function wh(i,e,t,n){const s=vc(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function to(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function vc(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function pm(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}class mm{static triangulate(e,t,n=2){return Q0(e,t,n)}}class Ti{static area(e){const t=e.length;let n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return Ti.area(e)<0}static triangulateShape(e,t){const n=[],s=[],r=[];Ah(e),Rh(n,e);let o=e.length;t.forEach(Ah);for(let c=0;c<t.length;c++)s.push(o),o+=t[c].length,Rh(n,t[c]);const a=mm.triangulate(n,s);for(let c=0;c<a.length;c+=3)r.push(a.slice(c,c+3));return r}}function Ah(i){const e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Rh(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}class lo extends It{constructor(e=new Pi([new he(.5,.5),new he(-.5,.5),new he(-.5,-.5),new he(.5,-.5)]),t={}){super(),this.type="ExtrudeGeometry",this.parameters={shapes:e,options:t},e=Array.isArray(e)?e:[e];const n=this,s=[],r=[];for(let a=0,c=e.length;a<c;a++){const l=e[a];o(l)}this.setAttribute("position",new Qe(s,3)),this.setAttribute("uv",new Qe(r,2)),this.computeVertexNormals();function o(a){const c=[],l=t.curveSegments!==void 0?t.curveSegments:12,u=t.steps!==void 0?t.steps:1,f=t.depth!==void 0?t.depth:1;let h=t.bevelEnabled!==void 0?t.bevelEnabled:!0,d=t.bevelThickness!==void 0?t.bevelThickness:.2,p=t.bevelSize!==void 0?t.bevelSize:d-.1,v=t.bevelOffset!==void 0?t.bevelOffset:0,g=t.bevelSegments!==void 0?t.bevelSegments:3;const m=t.extrudePath,x=t.UVGenerator!==void 0?t.UVGenerator:gm;let y,S=!1,E,b,_,M;if(m){y=m.getSpacedPoints(u),S=!0,h=!1;const Y=m.isCatmullRomCurve3?m.closed:!1;E=m.computeFrenetFrames(u,Y),b=new L,_=new L,M=new L}h||(g=0,d=0,p=0,v=0);const R=a.extractPoints(l);let w=R.shape;const C=R.holes;if(!Ti.isClockWise(w)){w=w.reverse();for(let Y=0,le=C.length;Y<le;Y++){const ae=C[Y];Ti.isClockWise(ae)&&(C[Y]=ae.reverse())}}function F(Y){const ae=10000000000000001e-36;let ve=Y[0];for(let j=1;j<=Y.length;j++){const De=j%Y.length,Ne=Y[De],$=Ne.x-ve.x,_e=Ne.y-ve.y,Ce=$*$+_e*_e,U=Math.max(Math.abs(Ne.x),Math.abs(Ne.y),Math.abs(ve.x),Math.abs(ve.y)),Ke=ae*U*U;if(Ce<=Ke){Y.splice(De,1),j--;continue}ve=Ne}}F(w),C.forEach(F);const I=C.length,B=w;for(let Y=0;Y<I;Y++){const le=C[Y];w=w.concat(le)}function H(Y,le,ae){return le||$e("ExtrudeGeometry: vec does not exist"),Y.clone().addScaledVector(le,ae)}const k=w.length;function Q(Y,le,ae){let ve,j,De;const Ne=Y.x-le.x,$=Y.y-le.y,_e=ae.x-Y.x,Ce=ae.y-Y.y,U=Ne*Ne+$*$,Ke=Ne*Ce-$*_e;if(Math.abs(Ke)>Number.EPSILON){const Ye=Math.sqrt(U),at=Math.sqrt(_e*_e+Ce*Ce),ye=le.x-$/Ye,Ot=le.y+Ne/Ye,qe=ae.x-Ce/at,Je=ae.y+_e/at,P=((qe-ye)*Ce-(Je-Ot)*_e)/(Ne*Ce-$*_e);ve=ye+Ne*P-Y.x,j=Ot+$*P-Y.y;const T=ve*ve+j*j;if(T<=2)return new he(ve,j);De=Math.sqrt(T/2)}else{let Ye=!1;Ne>Number.EPSILON?_e>Number.EPSILON&&(Ye=!0):Ne<-Number.EPSILON?_e<-Number.EPSILON&&(Ye=!0):Math.sign($)===Math.sign(Ce)&&(Ye=!0),Ye?(ve=-$,j=Ne,De=Math.sqrt(U)):(ve=Ne,j=$,De=Math.sqrt(U/2))}return new he(ve/De,j/De)}const G=[];for(let Y=0,le=B.length,ae=le-1,ve=Y+1;Y<le;Y++,ae++,ve++)ae===le&&(ae=0),ve===le&&(ve=0),G[Y]=Q(B[Y],B[ae],B[ve]);const Z=[];let V,ue=G.concat();for(let Y=0,le=I;Y<le;Y++){const ae=C[Y];V=[];for(let ve=0,j=ae.length,De=j-1,Ne=ve+1;ve<j;ve++,De++,Ne++)De===j&&(De=0),Ne===j&&(Ne=0),V[ve]=Q(ae[ve],ae[De],ae[Ne]);Z.push(V),ue=ue.concat(V)}let Re;if(g===0)Re=Ti.triangulateShape(B,C);else{const Y=[],le=[];for(let ae=0;ae<g;ae++){const ve=ae/g,j=d*Math.cos(ve*Math.PI/2),De=p*Math.sin(ve*Math.PI/2)+v;for(let Ne=0,$=B.length;Ne<$;Ne++){const _e=H(B[Ne],G[Ne],De);pe(_e.x,_e.y,-j),ve===0&&Y.push(_e)}for(let Ne=0,$=I;Ne<$;Ne++){const _e=C[Ne];V=Z[Ne];const Ce=[];for(let U=0,Ke=_e.length;U<Ke;U++){const Ye=H(_e[U],V[U],De);pe(Ye.x,Ye.y,-j),ve===0&&Ce.push(Ye)}ve===0&&le.push(Ce)}}Re=Ti.triangulateShape(Y,le)}const D=Re.length,K=p+v;for(let Y=0;Y<k;Y++){const le=h?H(w[Y],ue[Y],K):w[Y];S?(_.copy(E.normals[0]).multiplyScalar(le.x),b.copy(E.binormals[0]).multiplyScalar(le.y),M.copy(y[0]).add(_).add(b),pe(M.x,M.y,M.z)):pe(le.x,le.y,0)}for(let Y=1;Y<=u;Y++)for(let le=0;le<k;le++){const ae=h?H(w[le],ue[le],K):w[le];S?(_.copy(E.normals[Y]).multiplyScalar(ae.x),b.copy(E.binormals[Y]).multiplyScalar(ae.y),M.copy(y[Y]).add(_).add(b),pe(M.x,M.y,M.z)):pe(ae.x,ae.y,f/u*Y)}for(let Y=g-1;Y>=0;Y--){const le=Y/g,ae=d*Math.cos(le*Math.PI/2),ve=p*Math.sin(le*Math.PI/2)+v;for(let j=0,De=B.length;j<De;j++){const Ne=H(B[j],G[j],ve);pe(Ne.x,Ne.y,f+ae)}for(let j=0,De=C.length;j<De;j++){const Ne=C[j];V=Z[j];for(let $=0,_e=Ne.length;$<_e;$++){const Ce=H(Ne[$],V[$],ve);S?pe(Ce.x,Ce.y+y[u-1].y,y[u-1].x+ae):pe(Ce.x,Ce.y,f+ae)}}}ne(),fe();function ne(){const Y=s.length/3;if(h){let le=0,ae=k*le;for(let ve=0;ve<D;ve++){const j=Re[ve];He(j[2]+ae,j[1]+ae,j[0]+ae)}le=u+g*2,ae=k*le;for(let ve=0;ve<D;ve++){const j=Re[ve];He(j[0]+ae,j[1]+ae,j[2]+ae)}}else{for(let le=0;le<D;le++){const ae=Re[le];He(ae[2],ae[1],ae[0])}for(let le=0;le<D;le++){const ae=Re[le];He(ae[0]+k*u,ae[1]+k*u,ae[2]+k*u)}}n.addGroup(Y,s.length/3-Y,0)}function fe(){const Y=s.length/3;let le=0;ce(B,le),le+=B.length;for(let ae=0,ve=C.length;ae<ve;ae++){const j=C[ae];ce(j,le),le+=j.length}n.addGroup(Y,s.length/3-Y,1)}function ce(Y,le){let ae=Y.length;for(;--ae>=0;){const ve=ae;let j=ae-1;j<0&&(j=Y.length-1);for(let De=0,Ne=u+g*2;De<Ne;De++){const $=k*De,_e=k*(De+1),Ce=le+ve+$,U=le+j+$,Ke=le+j+_e,Ye=le+ve+_e;se(Ce,U,Ke,Ye)}}}function pe(Y,le,ae){c.push(Y),c.push(le),c.push(ae)}function He(Y,le,ae){ge(Y),ge(le),ge(ae);const ve=s.length/3,j=x.generateTopUV(n,s,ve-3,ve-2,ve-1);Ue(j[0]),Ue(j[1]),Ue(j[2])}function se(Y,le,ae,ve){ge(Y),ge(le),ge(ve),ge(le),ge(ae),ge(ve);const j=s.length/3,De=x.generateSideWallUV(n,s,j-6,j-3,j-2,j-1);Ue(De[0]),Ue(De[1]),Ue(De[3]),Ue(De[1]),Ue(De[2]),Ue(De[3])}function ge(Y){s.push(c[Y*3+0]),s.push(c[Y*3+1]),s.push(c[Y*3+2])}function Ue(Y){r.push(Y.x),r.push(Y.y)}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes,n=this.parameters.options;return _m(t,n,e)}static fromJSON(e,t){const n=[];for(let r=0,o=e.shapes.length;r<o;r++){const a=t[e.shapes[r]];n.push(a)}const s=e.options.extrudePath;return s!==void 0&&(e.options.extrudePath=new pa[s.type]().fromJSON(s)),new lo(n,e.options)}}const gm={generateTopUV:function(i,e,t,n,s){const r=e[t*3],o=e[t*3+1],a=e[n*3],c=e[n*3+1],l=e[s*3],u=e[s*3+1];return[new he(r,o),new he(a,c),new he(l,u)]},generateSideWallUV:function(i,e,t,n,s,r){const o=e[t*3],a=e[t*3+1],c=e[t*3+2],l=e[n*3],u=e[n*3+1],f=e[n*3+2],h=e[s*3],d=e[s*3+1],p=e[s*3+2],v=e[r*3],g=e[r*3+1],m=e[r*3+2];return Math.abs(a-u)<Math.abs(o-l)?[new he(o,1-c),new he(l,1-f),new he(h,1-p),new he(v,1-m)]:[new he(a,1-c),new he(u,1-f),new he(d,1-p),new he(g,1-m)]}};function _m(i,e,t){if(t.shapes=[],Array.isArray(i))for(let n=0,s=i.length;n<s;n++){const r=i[n];t.shapes.push(r.uuid)}else t.shapes.push(i.uuid);return t.options=Object.assign({},e),e.extrudePath!==void 0&&(t.options.extrudePath=e.extrudePath.toJSON()),t}class Ra extends It{constructor(e=[new he(0,-.5),new he(.5,0),new he(0,.5)],t=12,n=0,s=Math.PI*2){super(),this.type="LatheGeometry",this.parameters={points:e,segments:t,phiStart:n,phiLength:s},t=Math.floor(t),s=ot(s,0,Math.PI*2);const r=[],o=[],a=[],c=[],l=[],u=1/t,f=new L,h=new he,d=new L,p=new L,v=new L;let g=0,m=0;for(let x=0;x<=e.length-1;x++)switch(x){case 0:g=e[x+1].x-e[x].x,m=e[x+1].y-e[x].y,d.x=m*1,d.y=-g,d.z=m*0,v.copy(d),d.normalize(),c.push(d.x,d.y,d.z);break;case e.length-1:v.normalize(),c.push(v.x,v.y,v.z);break;default:g=e[x+1].x-e[x].x,m=e[x+1].y-e[x].y,d.x=m*1,d.y=-g,d.z=m*0,p.copy(d),d.x+=v.x,d.y+=v.y,d.z+=v.z,d.normalize(),c.push(d.x,d.y,d.z),v.copy(p)}for(let x=0;x<=t;x++){const y=n+x*u*s,S=Math.sin(y),E=Math.cos(y);for(let b=0;b<=e.length-1;b++){f.x=e[b].x*S,f.y=e[b].y,f.z=e[b].x*E,o.push(f.x,f.y,f.z),h.x=x/t,h.y=b/(e.length-1),a.push(h.x,h.y);const _=c[3*b+0]*S,M=c[3*b+1],R=c[3*b+0]*E;l.push(_,M,R)}}for(let x=0;x<t;x++)for(let y=0;y<e.length-1;y++){const S=y+x*e.length,E=S,b=S+e.length,_=S+e.length+1,M=S+1;r.push(E,b,M),r.push(_,M,b)}this.setIndex(r),this.setAttribute("position",new Qe(o,3)),this.setAttribute("uv",new Qe(a,2)),this.setAttribute("normal",new Qe(l,3))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ra(e.points,e.segments,e.phiStart,e.phiLength)}}class ut extends It{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};const r=e/2,o=t/2,a=Math.floor(n),c=Math.floor(s),l=a+1,u=c+1,f=e/a,h=t/c,d=[],p=[],v=[],g=[];for(let m=0;m<u;m++){const x=m*h-o;for(let y=0;y<l;y++){const S=y*f-r;p.push(S,-x,0),v.push(0,0,1),g.push(y/a),g.push(1-m/c)}}for(let m=0;m<c;m++)for(let x=0;x<a;x++){const y=x+l*m,S=x+l*(m+1),E=x+1+l*(m+1),b=x+1+l*m;d.push(y,S,b),d.push(S,E,b)}this.setIndex(d),this.setAttribute("position",new Qe(p,3)),this.setAttribute("normal",new Qe(v,3)),this.setAttribute("uv",new Qe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new ut(e.width,e.height,e.widthSegments,e.heightSegments)}}class cu extends It{constructor(e=.5,t=1,n=32,s=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:o},n=Math.max(3,n),s=Math.max(1,s);const a=[],c=[],l=[],u=[];let f=e;const h=(t-e)/s,d=new L,p=new he;for(let v=0;v<=s;v++){for(let g=0;g<=n;g++){const m=r+g/n*o;d.x=f*Math.cos(m),d.y=f*Math.sin(m),c.push(d.x,d.y,d.z),l.push(0,0,1),p.x=(d.x/t+1)/2,p.y=(d.y/t+1)/2,u.push(p.x,p.y)}f+=h}for(let v=0;v<s;v++){const g=v*(n+1);for(let m=0;m<n;m++){const x=m+g,y=x,S=x+n+1,E=x+n+2,b=x+1;a.push(y,S,b),a.push(S,E,b)}}this.setIndex(a),this.setAttribute("position",new Qe(c,3)),this.setAttribute("normal",new Qe(l,3)),this.setAttribute("uv",new Qe(u,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new cu(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class fs extends It{constructor(e=new Pi([new he(0,.5),new he(-.5,-.5),new he(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};const n=[],s=[],r=[],o=[];let a=0,c=0;if(Array.isArray(e)===!1)l(e);else for(let u=0;u<e.length;u++)l(e[u]),this.addGroup(a,c,u),a+=c,c=0;this.setIndex(n),this.setAttribute("position",new Qe(s,3)),this.setAttribute("normal",new Qe(r,3)),this.setAttribute("uv",new Qe(o,2));function l(u){const f=s.length/3,h=u.extractPoints(t);let d=h.shape;const p=h.holes;Ti.isClockWise(d)===!1&&(d=d.reverse());for(let g=0,m=p.length;g<m;g++){const x=p[g];Ti.isClockWise(x)===!0&&(p[g]=x.reverse())}const v=Ti.triangulateShape(d,p);for(let g=0,m=p.length;g<m;g++){const x=p[g];d=d.concat(x)}for(let g=0,m=d.length;g<m;g++){const x=d[g];s.push(x.x,x.y,0),r.push(0,0,1),o.push(x.x,x.y)}for(let g=0,m=v.length;g<m;g++){const x=v[g],y=x[0]+f,S=x[1]+f,E=x[2]+f;n.push(y,S,E),c+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON(),t=this.parameters.shapes;return xm(t,e)}static fromJSON(e,t){const n=[];for(let s=0,r=e.shapes.length;s<r;s++){const o=t[e.shapes[s]];n.push(o)}return new fs(n,e.curveSegments)}}function xm(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){const s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}class Qt extends It{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const c=Math.min(o+a,Math.PI);let l=0;const u=[],f=new L,h=new L,d=[],p=[],v=[],g=[];for(let m=0;m<=n;m++){const x=[],y=m/n,S=o+y*a,E=e*Math.cos(S),b=Math.sqrt(e*e-E*E);let _=0;m===0&&o===0?_=.5/t:m===n&&c===Math.PI&&(_=-.5/t);for(let M=0;M<=t;M++){const R=M/t,w=s+R*r;f.x=-b*Math.cos(w),f.y=E,f.z=b*Math.sin(w),p.push(f.x,f.y,f.z),h.copy(f).normalize(),v.push(h.x,h.y,h.z),g.push(R+_,1-y),x.push(l++)}u.push(x)}for(let m=0;m<n;m++)for(let x=0;x<t;x++){const y=u[m][x+1],S=u[m][x],E=u[m+1][x],b=u[m+1][x+1];(m!==0||o>0)&&d.push(y,S,b),(m!==n-1||c<Math.PI)&&d.push(S,E,b)}this.setIndex(d),this.setAttribute("position",new Qe(p,3)),this.setAttribute("normal",new Qe(v,3)),this.setAttribute("uv",new Qe(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Qt(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class gn extends It{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,o=0,a=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:o,thetaLength:a},n=Math.floor(n),s=Math.floor(s);const c=[],l=[],u=[],f=[],h=new L,d=new L,p=new L;for(let v=0;v<=n;v++){const g=o+v/n*a;for(let m=0;m<=s;m++){const x=m/s*r;d.x=(e+t*Math.cos(g))*Math.cos(x),d.y=(e+t*Math.cos(g))*Math.sin(x),d.z=t*Math.sin(g),l.push(d.x,d.y,d.z),h.x=e*Math.cos(x),h.y=e*Math.sin(x),p.subVectors(d,h).normalize(),u.push(p.x,p.y,p.z),f.push(m/s),f.push(v/n)}}for(let v=1;v<=n;v++)for(let g=1;g<=s;g++){const m=(s+1)*v+g-1,x=(s+1)*(v-1)+g-1,y=(s+1)*(v-1)+g,S=(s+1)*v+g;c.push(m,x,S),c.push(x,y,S)}this.setIndex(c),this.setAttribute("position",new Qe(l,3)),this.setAttribute("normal",new Qe(u,3)),this.setAttribute("uv",new Qe(f,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}}class uu extends It{constructor(e=new bd(new L(-1,-1,0),new L(-1,1,0),new L(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new L,c=new L,l=new he;let u=new L;const f=[],h=[],d=[],p=[];v(),this.setIndex(p),this.setAttribute("position",new Qe(f,3)),this.setAttribute("normal",new Qe(h,3)),this.setAttribute("uv",new Qe(d,2));function v(){for(let y=0;y<t;y++)g(y);g(r===!1?t:0),x(),m()}function g(y){u=e.getPointAt(y/t,u);const S=o.normals[y],E=o.binormals[y];for(let b=0;b<=s;b++){const _=b/s*Math.PI*2,M=Math.sin(_),R=-Math.cos(_);c.x=R*S.x+M*E.x,c.y=R*S.y+M*E.y,c.z=R*S.z+M*E.z,c.normalize(),h.push(c.x,c.y,c.z),a.x=u.x+n*c.x,a.y=u.y+n*c.y,a.z=u.z+n*c.z,f.push(a.x,a.y,a.z)}}function m(){for(let y=1;y<=t;y++)for(let S=1;S<=s;S++){const E=(s+1)*(y-1)+(S-1),b=(s+1)*y+(S-1),_=(s+1)*y+S,M=(s+1)*(y-1)+S;p.push(E,b,M),p.push(b,_,M)}}function x(){for(let y=0;y<=t;y++)for(let S=0;S<=s;S++)l.x=y/t,l.y=S/s,d.push(l.x,l.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new uu(new pa[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}function js(i){const e={};for(const t in i){e[t]={};for(const n in i[t]){const s=i[t][n];if(Ch(s))s.isRenderTargetTexture?(Ve("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Ch(s[0])){const r=[];for(let o=0,a=s.length;o<a;o++)r[o]=s[o].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function dn(i){const e={};for(let t=0;t<i.length;t++){const n=js(i[t]);for(const s in n)e[s]=n[s]}return e}function Ch(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function vm(i){const e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Cd(i){const e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ct.workingColorSpace}const Sm={clone:js,merge:dn};var Mm=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,ym=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ki extends Dn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mm,this.fragmentShader=ym,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=js(e.uniforms),this.uniformsGroups=vm(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const s in this.uniforms){const o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(const n in e.uniforms){const s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Oe().setHex(s.value);break;case"v2":this.uniforms[n].value=new he().fromArray(s.value);break;case"v3":this.uniforms[n].value=new L().fromArray(s.value);break;case"v4":this.uniforms[n].value=new bt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new Ze().fromArray(s.value);break;case"m4":this.uniforms[n].value=new et().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(const n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}}class bm extends Ki{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}}class Lt extends Dn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Oe(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=la,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class wn extends Lt{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new he(1,1),this.clearcoatNormalMap=null,this.diffuseRoughnessMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return ot(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessMinimum=100,this.iridescenceThicknessMaximum=400,this.iridescenceThicknessMap=null,this.sheenColor=new Oe(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Oe(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Oe(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._diffuseRoughness=0,this._dispersion=0,this._iridescence=0,this._retroreflectivity=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get diffuseRoughness(){return this._diffuseRoughness}set diffuseRoughness(e){this._diffuseRoughness>0!=e>0&&this.version++,this._diffuseRoughness=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get retroreflectivity(){return this._retroreflectivity}set retroreflectivity(e){this._retroreflectivity>0!=e>0&&this.version++,this._retroreflectivity=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}get iridescenceThicknessRange(){return Hs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),[this.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum]}set iridescenceThicknessRange(e){Hs('MeshPhysicalMaterial: The "iridescenceThicknessRange" property has been replaced by "iridescenceThicknessMinimum" and "iridescenceThicknessMaximum".'),this.iridescenceThicknessMinimum=e[0],this.iridescenceThicknessMaximum=e[1]}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.diffuseRoughness=e.diffuseRoughness,this.diffuseRoughnessMap=e.diffuseRoughnessMap,this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessMinimum=e.iridescenceThicknessMinimum,this.iridescenceThicknessMaximum=e.iridescenceThicknessMaximum,this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.retroreflectivity=e.retroreflectivity,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class Tm extends Dn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Oe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Oe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=la,this.normalScale=new he(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new qn,this.combine=zc,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class Em extends Dn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=zp,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class wm extends Dn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function Hi(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Cr(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}function Am(i){function e(s,r){return i[s]-i[r]}const t=i.length,n=new Array(t);for(let s=0;s!==t;++s)n[s]=s;return n.sort(e),n}function Ph(i,e,t){const n=i.length,s=new i.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let c=0;c!==e;++c)s[o++]=i[a+c]}return s}function Rm(i,e,t,n){let s=1,r=i[0];for(;r!==void 0&&r[n]===void 0;)r=i[s++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=i[s++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=i[s++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=i[s++];while(r!==void 0)}class er{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}}class Cm extends er{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:ku,endingEnd:ku}}intervalChanged_(e,t,n){const s=this.parameterPositions;let r=e-2,o=e+1,a=s[r],c=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case Hu:r=e,a=2*t-n;break;case Gu:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Hu:o=e,c=2*n-t;break;case Gu:o=1,c=n+s[1]-s[0];break;default:o=e-1,c=t}const l=(n-t)*.5,u=this.valueSize;this._weightPrev=l/(t-a),this._weightNext=l/(c-n),this._offsetPrev=r*u,this._offsetNext=o*u}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this._offsetPrev,f=this._offsetNext,h=this._weightPrev,d=this._weightNext,p=(n-t)/(s-t),v=p*p,g=v*p,m=-h*g+2*h*v-h*p,x=(1+h)*g+(-1.5-2*h)*v+(-.5+h)*p+1,y=(-1-d)*g+(1.5+d)*v+.5*p,S=d*g-d*v;for(let E=0;E!==a;++E)r[E]=m*o[u+E]+x*o[l+E]+y*o[c+E]+S*o[f+E];return r}}class Pm extends er{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=(n-t)/(s-t),f=1-u;for(let h=0;h!==a;++h)r[h]=o[l+h]*f+o[c+h]*u;return r}}class Lm extends er{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}}class Im extends er{interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=e*a,l=c-a,u=this.inTangents,f=this.outTangents;if(!u||!f){const p=(n-t)/(s-t),v=1-p;for(let g=0;g!==a;++g)r[g]=o[l+g]*v+o[c+g]*p;return r}const h=a*2,d=e-1;for(let p=0;p!==a;++p){const v=o[l+p],g=o[c+p],m=d*h+p*2,x=f[m],y=f[m+1],S=e*h+p*2,E=u[S],b=u[S+1],_=Dm(n,t,x,E,s);r[p]=Pd(_,v,y,b,g)}return r}}function Pd(i,e,t,n,s){const r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Nm(i,e,t,n,s){const r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Dm(i,e,t,n,s){let r=(i-e)/(s-e);for(let o=0;o<8;o++){const a=Pd(r,e,t,n,s)-i;if(Math.abs(a)<1e-10)break;const c=Nm(r,e,t,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-a/c))}return r}class $n{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Hi(t,this.TimeBufferType),this.values=Hi(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Hi(e.times,Array),values:Hi(e.values,Array)};const s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Cr(e.settings)&&(n.settings={inTangents:Hi(e.settings.inTangents,Array),outTangents:Hi(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Lm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Pm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Cm(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){const t=new Im(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Yr:t=this.InterpolantFactoryMethodDiscrete;break;case Kr:t=this.InterpolantFactoryMethodLinear;break;case Fa:t=this.InterpolantFactoryMethodSmooth;break;case zu:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Ve("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Yr;case this.InterpolantFactoryMethodLinear:return Kr;case this.InterpolantFactoryMethodSmooth:return Fa;case this.InterpolantFactoryMethodBezier:return zu}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e;Cr(this.settings)&&(Lh(this.settings.inTangents,e),Lh(this.settings.outTangents,e))}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Cr(this.settings)&&(Ih(this.settings.inTangents,e),Ih(this.settings.outTangents,e))}return this}trim(e,t){const n=this.times,s=n.length;let r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&($e("KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,s=this.values,r=n.length;r===0&&($e("KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const c=n[a];if(typeof c=="number"&&isNaN(c)){$e("KeyframeTrack: Time is not a valid number.",this,a,c),e=!1;break}if(o!==null&&o>c){$e("KeyframeTrack: Out of order keys.",this,a,c,o),e=!1;break}o=c}if(s!==void 0&&Kp(s))for(let a=0,c=s.length;a!==c;++a){const l=s[a];if(isNaN(l)){$e("KeyframeTrack: Value is not a valid number.",this,a,l),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Fa,r=e.length-1;let o=1;for(let a=1;a<r;++a){let c=!1;const l=e[a],u=e[a+1];if(l!==u&&(a!==1||l!==e[0]))if(s)c=!0;else{const f=a*n,h=f-n,d=f+n;for(let p=0;p!==n;++p){const v=t[f+p];if(v!==t[h+p]||v!==t[d+p]){c=!0;break}}}if(c){if(a!==o){e[o]=e[a];const f=a*n,h=o*n;for(let d=0;d!==n;++d)t[h+d]=t[f+d]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,c=o*n,l=0;l!==n;++l)t[c+l]=t[a+l];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Cr(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}}function Lh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]+=e}function Ih(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}$n.prototype.ValueTypeName="";$n.prototype.TimeBufferType=Float32Array;$n.prototype.ValueBufferType=Float32Array;$n.prototype.DefaultInterpolation=Kr;class tr extends $n{constructor(e,t,n){super(e,t,n)}}tr.prototype.ValueTypeName="bool";tr.prototype.ValueBufferType=Array;tr.prototype.DefaultInterpolation=Yr;tr.prototype.InterpolantFactoryMethodLinear=void 0;tr.prototype.InterpolantFactoryMethodSmooth=void 0;class Ld extends $n{constructor(e,t,n,s){super(e,t,n,s)}}Ld.prototype.ValueTypeName="color";class no extends $n{constructor(e,t,n,s){super(e,t,n,s)}}no.prototype.ValueTypeName="number";class Um extends er{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=(n-t)/(s-t);let l=e*a;for(let u=l+a;l!==u;l+=4)En.slerpFlat(r,0,o,l-a,o,l,c);return r}}class io extends $n{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Um(this.times,this.values,this.getValueSize(),e)}}io.prototype.ValueTypeName="quaternion";io.prototype.InterpolantFactoryMethodSmooth=void 0;class nr extends $n{constructor(e,t,n){super(e,t,n)}}nr.prototype.ValueTypeName="string";nr.prototype.ValueBufferType=Array;nr.prototype.DefaultInterpolation=Yr;nr.prototype.InterpolantFactoryMethodLinear=void 0;nr.prototype.InterpolantFactoryMethodSmooth=void 0;class ma extends $n{constructor(e,t,n,s){super(e,t,n,s)}}ma.prototype.ValueTypeName="vector";class Om{constructor(e="",t=-1,n=[],s=Fp){this.name=e,this.tracks=n,this.duration=t,this.blendMode=s,this.uuid=Yn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,s=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(Bm(n[o]).scale(s));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,s={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push($n.toJSON(n[r]));return s}static CreateFromMorphTargetSequence(e,t,n,s){const r=t.length,o=[];for(let a=0;a<r;a++){let c=[],l=[];c.push((a+r-1)%r,a,(a+1)%r),l.push(0,1,0);const u=Am(c);c=Ph(c,1,u),l=Ph(l,1,u),!s&&c[0]===0&&(c.push(r),l.push(l[0])),o.push(new no(".morphTargetInfluences["+t[a].name+"]",c,l).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const s=e;n=s.geometry&&s.geometry.animations||s.animations}for(let s=0;s<n.length;s++)if(n[s].name===t)return n[s];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const s={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,c=e.length;a<c;a++){const l=e[a],u=l.name.match(r);if(u&&u.length>1){const f=u[1];let h=s[f];h||(s[f]=h=[]),h.push(l)}}const o=[];for(const a in s)o.push(this.CreateFromMorphTargetSequence(a,s[a],t,n));return o}resetDuration(){const e=this.tracks;let t=0;for(let n=0,s=e.length;n!==s;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function Fm(i){switch(i.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return no;case"vector":case"vector2":case"vector3":case"vector4":return ma;case"color":return Ld;case"quaternion":return io;case"bool":case"boolean":return tr;case"string":return nr}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+i)}function Bm(i){if(i.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=Fm(i.type);if(i.times===void 0){const n=[],s=[];Rm(i.keys,n,s,"value"),i.times=n,i.values=s}let t;return e.parse!==void 0?t=e.parse(i):t=new e(i.name,i.times,i.values,i.interpolation),Cr(i.settings)&&(t.settings={inTangents:Hi(i.settings.inTangents,Float32Array),outTangents:Hi(i.settings.outTangents,Float32Array)}),t}const Ei={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Nh(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Nh(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Nh(i){try{const e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}class Id{constructor(e,t,n){const s=this;let r=!1,o=0,a=0,c;const l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(u){a++,r===!1&&s.onStart!==void 0&&s.onStart(u,o,a),r=!0},this.itemEnd=function(u){o++,s.onProgress!==void 0&&s.onProgress(u,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return u=u.normalize("NFC"),c?c(u):u},this.setURLModifier=function(u){return c=u,this},this.addHandler=function(u,f){return l.push(u,f),this},this.removeHandler=function(u){const f=l.indexOf(u);return f!==-1&&l.splice(f,2),this},this.getHandler=function(u){for(let f=0,h=l.length;f<h;f+=2){const d=l[f],p=l[f+1];if(d.global&&(d.lastIndex=0),d.test(u))return p}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}}const zm=new Id;class ir{constructor(e){this.manager=e!==void 0?e:zm,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},this.priority="auto",this.cache="default",typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){const n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}setPriority(e){return this.priority=e,this}setCache(e){return this.cache=e,this}abort(){return this}}ir.DEFAULT_MATERIAL_NAME="__DEFAULT";const gi={};class km extends Error{constructor(e,t){super(e),this.response=t}}class Nd extends ir{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=Ei.get(`file:${e}`);if(r!==void 0){this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0);return}if(gi[e]!==void 0){gi[e].push({onLoad:t,onProgress:n,onError:s});return}gi[e]=[],gi[e].push({onLoad:t,onProgress:n,onError:s});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",priority:this.priority,cache:this.cache,signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,c=this.responseType;fetch(o).then(l=>{if(l.status===200||l.status===0){if(l.status===0&&Ve("FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||l.body===void 0||l.body.getReader===void 0)return l;const u=gi[e],f=l.body.getReader(),h=l.headers.get("X-File-Size")||l.headers.get("Content-Length"),d=h?parseInt(h):0,p=d!==0;let v=0;const g=new ReadableStream({start(m){x();function x(){f.read().then(({done:y,value:S})=>{if(y)m.close();else{v+=S.byteLength;const E=new ProgressEvent("progress",{lengthComputable:p,loaded:v,total:d});for(let b=0,_=u.length;b<_;b++){const M=u[b];M.onProgress&&M.onProgress(E)}m.enqueue(S),x()}},y=>{m.error(y)})}}});return new Response(g)}else throw new km(`fetch for "${l.url}" responded with ${l.status}: ${l.statusText}`,l)}).then(l=>{switch(c){case"arraybuffer":return l.arrayBuffer();case"blob":return l.blob();case"document":return l.text().then(u=>new DOMParser().parseFromString(u,a));case"json":return l.json();default:if(a==="")return l.text();{const f=/charset="?([^;"\s]*)"?/i.exec(a),h=f&&f[1]?f[1].toLowerCase():void 0,d=new TextDecoder(h);return l.arrayBuffer().then(p=>d.decode(p))}}}).then(l=>{Ei.add(`file:${e}`,l);const u=gi[e];delete gi[e];for(let f=0,h=u.length;f<h;f++){const d=u[f];d.onLoad&&d.onLoad(l)}}).catch(l=>{const u=gi[e];if(u===void 0)throw this.manager.itemError(e),l;delete gi[e];for(let f=0,h=u.length;f<h;f++){const d=u[f];d.onError&&d.onError(l)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Cs=new WeakMap;class Hm extends ir{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Ei.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let f=Cs.get(o);f===void 0&&(f=[],Cs.set(o,f)),f.push({onLoad:t,onError:s})}return o}const a=Jr("img");function c(){u(),t&&t(this);const f=Cs.get(this)||[];for(let h=0;h<f.length;h++){const d=f[h];d.onLoad&&d.onLoad(this)}Cs.delete(this),r.manager.itemEnd(e)}function l(f){u(),s&&s(f),Ei.remove(`image:${e}`);const h=Cs.get(this)||[];for(let d=0;d<h.length;d++){const p=h[d];p.onError&&p.onError(f)}Cs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function u(){a.removeEventListener("load",c,!1),a.removeEventListener("error",l,!1)}return a.addEventListener("load",c,!1),a.addEventListener("error",l,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Ei.add(`image:${e}`,a),r.manager.itemStart(e),a.fetchPriority=this.priority,a.src=e,a}}class co extends ir{constructor(e){super(e)}load(e,t,n,s){const r=new Vt,o=new Hm(this.manager);return o.setPriority(this.priority),o.setCache(this.cache),o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}}class Ca extends At{static registerNode(e){this.prototype._lightNode=e}constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Oe(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}}class li extends Ca{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Oe(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){const t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}}const fl=new et,Dh=new L,Uh=new L;class hu{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new he(512,512),this.mapType=yn,this.map=null,this.mapPass=null,this.matrix=new et,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Qr,this._frameExtents=new he(1,1),this._viewportCount=1,this._viewports=[new bt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera;Dh.setFromMatrixPosition(e.matrixWorld),t.position.copy(Dh),Uh.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Uh),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){fl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(fl,e.coordinateSystem,e.reversedDepth);const r=this._frameExtents,o=s?s.z/r.x:1,a=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;e.coordinateSystem===$r||e.reversedDepth?t.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,1,0,0,0,0,1):t.set(.5*o,0,0,.5*o+c,0,.5*a,0,.5*a+l,0,0,.5,.5,0,0,0,1),t.multiply(fl)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.mapType=e.mapType,this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.mapType=this.mapType,e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}const Go=new L,Vo=new En,Jn=new L;class Dd extends At{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new et,this.projectionMatrix=new et,this.projectionMatrixInverse=new et,this.coordinateSystem=Xn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Go,Vo,Jn),Jn.x===1&&Jn.y===1&&Jn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Go,Vo,Jn.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Go,Vo,Jn),Jn.x===1&&Jn.y===1&&Jn.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Go,Vo,Jn.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}}const Fi=new L,Oh=new he,Fh=new he;class Ht extends Dd{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Ks*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(Or*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Ks*2*Math.atan(Math.tan(Or*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Fi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Fi.x,Fi.y).multiplyScalar(-e/Fi.z),Fi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Fi.x,Fi.y).multiplyScalar(-e/Fi.z)}getViewSize(e,t){return this.getViewBounds(e,Oh,Fh),t.subVectors(Fh,Oh)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(Or*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s;const o=this.view;if(this.view!==null&&this.view.enabled){const c=o.fullWidth,l=o.fullHeight;r+=o.offsetX*s/c,t-=o.offsetY*n/l,s*=o.width/c,n*=o.height/l}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}class Gm extends hu{constructor(){super(new Ht(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Ks*2*e.angle*this.focus,s=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||s!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=s,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this.aspect=e.aspect,this}toJSON(){const e=super.toJSON();return e.focus=this.focus,e.aspect=this.aspect,e}}class fu extends Ca{constructor(e,t,n=0,s=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.distance=n,this.angle=s,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new Gm}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.map=e.map,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.angle=this.angle,t.object.decay=this.decay,t.object.penumbra=this.penumbra,t.object.target=this.target.uuid,this.map&&this.map.isTexture&&(t.object.map=this.map.toJSON(e).uuid),t.object.shadow=this.shadow.toJSON(),t}}class Vm extends hu{constructor(){super(new Ht(90,1,.5,500)),this.isPointLightShadow=!0}}class ii extends Ca{constructor(e,t,n=0,s=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=s,this.shadow=new Vm}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){super.dispose(),this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.distance=this.distance,t.object.decay=this.decay,t.object.shadow=this.shadow.toJSON(),t}}class du extends Dd{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=s+t,c=s-t;if(this.view!==null&&this.view.enabled){const l=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,o=r+l*this.view.width,a-=u*this.view.offsetY,c=a-u*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class Wm extends hu{constructor(){super(new du(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class Wt extends Ca{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(At.DEFAULT_UP),this.updateMatrix(),this.target=new At,this.shadow=new Wm}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){const t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}}class kr{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const dl=new WeakMap;class Xm extends ir{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&Ve("ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&Ve("ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,s){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=Ei.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(l=>{dl.has(o)===!0?(s&&s(dl.get(o)),r.manager.itemError(e),r.manager.itemEnd(e)):(t&&t(l),r.manager.itemEnd(e))});return}setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);return}const a={};a.credentials=this.withCredentials||this.crossOrigin!=="anonymous"?"include":"same-origin",a.headers=this.requestHeader,a.priority=this.priority,a.cache=this.cache,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const c=fetch(e,a).then(function(l){return l.blob()}).then(function(l){return createImageBitmap(l,Object.assign({},r.options,{colorSpaceConversion:"none"}))}).then(function(l){return Ei.add(`image-bitmap:${e}`,l),t&&t(l),r.manager.itemEnd(e),l}).catch(function(l){s&&s(l),dl.set(c,l),Ei.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});Ei.add(`image-bitmap:${e}`,c),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const Ps=-90,Ls=1;class Sc extends At{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const s=new Ht(Ps,Ls,e,t);s.layers=this.layers,this.add(s);const r=new Ht(Ps,Ls,e,t);r.layers=this.layers,this.add(r);const o=new Ht(Ps,Ls,e,t);o.layers=this.layers,this.add(o);const a=new Ht(Ps,Ls,e,t);a.layers=this.layers,this.add(a);const c=new Ht(Ps,Ls,e,t);c.layers=this.layers,this.add(c);const l=new Ht(Ps,Ls,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,c]=t;for(const l of t)this.remove(l);if(e===Xn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===$r)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,c,l,u]=this.children,f=e.getRenderTarget(),h=e.getActiveCubeFace(),d=e.getActiveMipmapLevel(),p=e.xr.enabled;e.xr.enabled=!1;const v=n.texture.mipmapsAutoUpdate;n.texture.mipmapsAutoUpdate=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.mipmapsAutoUpdate=v,e.setRenderTarget(n,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,u),e.setRenderTarget(f,h,d),e.xr.enabled=p,n.texture.needsPMREMUpdate=!0}}class qm extends Ht{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e,this.perCameraFrustumCulled=!1}}const pu="\\[\\]\\.:\\/",Ym=new RegExp("["+pu+"]","g"),mu="[^"+pu+"]",Km="[^"+pu.replace("\\.","")+"]",$m=/((?:WC+[\/:])*)/.source.replace("WC",mu),Jm=/(WCOD+)?/.source.replace("WCOD",Km),Zm=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",mu),Qm=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",mu),jm=new RegExp("^"+$m+Jm+Zm+Qm+"$"),eg=["material","materials","bones","map"];class tg{constructor(e,t,n){const s=n||Mt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class Mt{constructor(e,t,n){this.path=t,this.parsedPath=n||Mt.parseTrackName(t),this.node=Mt.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new Mt.Composite(e,t,n):new Mt(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Ym,"")}static parseTrackName(e){const t=jm.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){const r=n.nodeName.substring(s+1);eg.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const c=n(a.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,s=t.propertyName;let r=t.propertyIndex;if(e||(e=Mt.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Ve("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){$e("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){$e("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){$e("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let u=0;u<e.length;u++)if(e[u].name===l){l=u;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){$e("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){$e("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){$e("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){$e("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}const o=e[s];if(o===void 0){const l=t.nodeName;$e("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){$e("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){$e("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(c=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}Mt.Composite=tg;Mt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Mt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Mt.prototype.GetterByBindingType=[Mt.prototype._getValue_direct,Mt.prototype._getValue_array,Mt.prototype._getValue_arrayElement,Mt.prototype._getValue_toArray];Mt.prototype.SetterByBindingTypeAndVersioning=[[Mt.prototype._setValue_direct,Mt.prototype._setValue_direct_setNeedsUpdate,Mt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_array,Mt.prototype._setValue_array_setNeedsUpdate,Mt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_arrayElement,Mt.prototype._setValue_arrayElement_setNeedsUpdate,Mt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Mt.prototype._setValue_fromArray,Mt.prototype._setValue_fromArray_setNeedsUpdate,Mt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class ny{constructor(e,t,n,s,r,o=!1){this.isGLBufferAttribute=!0,this.name="",this.buffer=e,this.type=t,this.itemSize=n,this.elementSize=s,this.count=r,this.normalized=o,this.version=0}set needsUpdate(e){e===!0&&this.version++}setBuffer(e){return this.buffer=e,this}setType(e,t){return this.type=e,this.elementSize=t,this}setItemSize(e){return this.itemSize=e,this}setCount(e){return this.count=e,this}}const Bh=new et;class ng{constructor(e,t,n=0,s=1/0){this.ray=new ao(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Qc,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):$e("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Bh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Bh),this}intersectObject(e,t=!0,n=[]){return Mc(e,this,n,t),n.sort(zh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Mc(e[s],this,n,t);return n.sort(zh),n}}function zh(i,e){return i.distance-e.distance}function Mc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){const r=i.children;for(let o=0,a=r.length;o<a;o++)Mc(r[o],e,t,!0)}}class iy extends pd{constructor(e=1){const t=[0,0,0,e,0,0,0,0,0,0,e,0,0,0,0,0,0,e],n=[1,0,0,1,.6,0,0,1,0,.6,1,0,0,0,1,0,.6,1],s=new It;s.setAttribute("position",new Qe(t,3)),s.setAttribute("color",new Qe(n,3));const r=new iu({vertexColors:!0,toneMapped:!1});super(s,r),this.type="AxesHelper"}setColors(e,t,n){const s=new Oe,r=this.geometry.attributes.color.array;return s.set(e),s.toArray(r,0),s.toArray(r,3),s.set(t),s.toArray(r,6),s.toArray(r,9),s.set(n),s.toArray(r,12),s.toArray(r,15),this.geometry.attributes.color.needsUpdate=!0,this}dispose(){super.dispose(),this.geometry.dispose(),this.material.dispose()}}function kh(i,e,t,n){const s=ig(n);switch(t){case Zf:return i*e;case Wc:return i*e/s.components*s.byteLength;case Xc:return i*e/s.components*s.byteLength;case us:return i*e*2/s.components*s.byteLength;case qc:return i*e*2/s.components*s.byteLength;case Qf:return i*e*3/s.components*s.byteLength;case Wn:return i*e*4/s.components*s.byteLength;case Yc:return i*e*4/s.components*s.byteLength;case Zo:case Qo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case jo:case ea:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Hl:case Vl:return Math.max(i,16)*Math.max(e,8)/4;case kl:case Gl:return Math.max(i,8)*Math.max(e,8)/2;case Wl:case Xl:case Yl:case Kl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case ql:case oa:case $l:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Jl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Zl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Ql:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case jl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case ec:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case tc:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case nc:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case ic:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case sc:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case rc:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case oc:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ac:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case lc:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case cc:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case uc:case hc:case fc:return Math.ceil(i/4)*Math.ceil(e/4)*16;case dc:case pc:return Math.ceil(i/4)*Math.ceil(e/4)*8;case aa:case mc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function ig(i){switch(i){case yn:case Yf:return{byteLength:1,components:1};case qr:case Kf:case Un:return{byteLength:2,components:1};case Gc:case Vc:return{byteLength:2,components:4};case ni:case Hc:case Ln:return{byteLength:4,components:1};case $f:case Jf:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Bc}}));typeof window<"u"&&(window.__THREE__?Ve("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Bc);/**
 * @license
 * Copyright 2010-2026 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function Ud(){let i=null,e=!1,t=null,n=null;function s(r,o){n=i.requestAnimationFrame(s),t(r,o)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function sg(i){const e=new WeakMap;function t(a,c){const l=a.array,u=a.usage,f=l.byteLength,h=i.createBuffer();i.bindBuffer(c,h),i.bufferData(c,l,u),a.onUploadCallback();let d;if(l instanceof Float32Array)d=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)d=i.HALF_FLOAT;else if(l instanceof Uint16Array)a.isFloat16BufferAttribute?d=i.HALF_FLOAT:d=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)d=i.SHORT;else if(l instanceof Uint32Array)d=i.UNSIGNED_INT;else if(l instanceof Int32Array)d=i.INT;else if(l instanceof Int8Array)d=i.BYTE;else if(l instanceof Uint8Array)d=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)d=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:h,type:d,bytesPerElement:l.BYTES_PER_ELEMENT,version:a.version,size:f}}function n(a,c,l){const u=c.array,f=c.updateRanges;if(i.bindBuffer(l,a),f.length===0)i.bufferSubData(l,0,u);else{f.sort((d,p)=>d.start-p.start);let h=0;for(let d=1;d<f.length;d++){const p=f[h],v=f[d];v.start<=p.start+p.count+1?p.count=Math.max(p.count,v.start+v.count-p.start):(++h,f[h]=v)}f.length=h+1;for(let d=0,p=f.length;d<p;d++){const v=f[d];i.bufferSubData(l,v.start*u.BYTES_PER_ELEMENT,u,v.start,v.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const c=e.get(a);c&&(i.deleteBuffer(c.buffer),e.delete(a))}function o(a,c){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const u=e.get(a);(!u||u.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const l=e.get(a);if(l===void 0)e.set(a,t(a,c));else if(l.version<a.version){if(l.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,a,c),l.version=a.version}}return{get:s,remove:r,update:o}}var rg=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,og=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ag=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,lg=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,cg=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,ug=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,hg=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,fg=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,dg=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,pg=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,mg=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,gg=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,_g=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,xg=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,vg=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Sg=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,Mg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,yg=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,bg=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Eg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,wg=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Ag=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,Rg=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Cg=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,Pg=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Lg=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ig=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Ng=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Dg="gl_FragColor = linearToOutputTexel( gl_FragColor );",Ug=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Og=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,Fg=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	uniform samplerCube envMap;
	#ifdef ENVMAP_TYPE_PMREM
		float roughnessToMip( const in float roughness ) {
			float r = clamp( roughness, 0.0, 1.0 );
			return ENVMAP_MAX_LOD * r * ( 2.0 - r );
		}
	#endif
#endif`,Bg=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,zg=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,kg=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Hg=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Gg=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Vg=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Wg=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Xg=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,qg=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Yg=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Kg=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,$g=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Jg=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * worldNormal, ENVMAP_MAX_LOD );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_PMREM
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureLod( envMap, envMapRotation * reflectVec, roughnessToMip( roughness ) );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureLod( envMap, envMapRotation * retroVec, roughnessToMip( roughness ) );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_PMREM
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_PMREM
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Zg=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Qg=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,jg=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,e_=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,t_=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.045 );
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef USE_DIFFUSE_ROUGHNESS
	float diffuseRoughnessFactor = diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		diffuseRoughnessFactor *= texture2D( diffuseRoughnessMap, vDiffuseRoughnessMapUv ).r;
	#endif
	material.diffuseRoughness = saturate( diffuseRoughnessFactor );
#endif
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.045 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,n_=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float diffuseRoughness;
	#endif
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
#ifdef USE_DIFFUSE_ROUGHNESS
	const float EON_EPSILON = 1e-7;
	float FON_DirectionalAlbedo( const in float mu, const in float roughness, const in float A ) {
		float muComp = 1.0 - mu;
		float gOverPi = muComp * ( 0.0571085289 + muComp * ( 0.491881867 + muComp * ( - 0.332181442 + muComp * 0.0714429953 ) ) );
		return A * ( 1.0 + roughness * gOverPi );
	}
	vec3 BRDF_EON( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 diffuseColor, const in float roughness ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return BRDF_Lambert( rho );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float s = dot( lightDir, viewDir ) - dotNL * dotNV;
		float sOverT = ( s > 0.0 ) ? s / max( max( dotNL, dotNV ), EON_EPSILON ) : s;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		vec3 singleScatter = rho * RECIPROCAL_PI * A * ( 1.0 + roughness * sOverT );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		float albedoV = FON_DirectionalAlbedo( dotNV, roughness, A );
		float albedoL = FON_DirectionalAlbedo( dotNL, roughness, A );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		vec3 multiScatter = rhoMultiScatter * RECIPROCAL_PI
			* max( EON_EPSILON, 1.0 - albedoV )
			* max( EON_EPSILON, 1.0 - albedoL )
			/ max( EON_EPSILON, 1.0 - averageAlbedo );
		return singleScatter + multiScatter;
	}
	vec3 EON_DirectionalAlbedo( const in vec3 diffuseColor, const in float roughness, const in float dotNV ) {
		vec3 rho = saturate( diffuseColor );
		if ( roughness <= EON_EPSILON ) return rho;
		float A = 1.0 / ( 1.0 + ( 0.5 - 2.0 / ( 3.0 * PI ) ) * roughness );
		float directionalAlbedo = FON_DirectionalAlbedo( dotNV, roughness, A );
		float averageAlbedo = A * ( 1.0 + ( 2.0 / 3.0 - 28.0 / ( 15.0 * PI ) ) * roughness );
		vec3 rhoMultiScatter = rho * rho * averageAlbedo / max( vec3( EON_EPSILON ), vec3( 1.0 ) - rho * ( 1.0 - averageAlbedo ) );
		return rho * directionalAlbedo + rhoMultiScatter * ( 1.0 - directionalAlbedo );
	}
#endif
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = max( material.clearcoatRoughness, 0.045 );
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = max( material.roughness, 0.045 );
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float alphaT = max( material.alphaT, alpha );
		float V = V_GGX_SmithCorrelated_Anisotropic( alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		vec3 diffuseBRDF = BRDF_EON( directLight.direction, geometryViewDir, geometryNormal, material.diffuseColor, material.diffuseRoughness ) * ( 1.0 - material.metalness );
	#else
		vec3 diffuseBRDF = BRDF_Lambert( material.diffuseContribution );
	#endif
	reflectedLight.directDiffuse += irradiance * diffuseBRDF * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuseAlbedo = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness );
		vec3 diffuse = irradiance * RECIPROCAL_PI * diffuseAlbedo * ( 1.0 - singleScattering - multiScattering );
	#else
		vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#endif
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	#ifdef USE_DIFFUSE_ROUGHNESS
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		vec3 diffuse = EON_DirectionalAlbedo( material.diffuseColor, material.diffuseRoughness, dotNV ) * ( 1.0 - material.metalness ) * ( 1.0 - totalScatteringDielectric );
	#else
		vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	#endif
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,i_=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_LIGHT_PROBE_GRIDS > 0
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		int probeGrid = - 1;
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( isInsideLightProbeGrid( probeWorldPos, probeWorldNormal, probesMin[ i ], probesMax[ i ], probesResolution[ i ] ) ) probeGrid = UNROLLED_LOOP_INDEX;
		}
		#pragma unroll_loop_end
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_LIGHT_PROBE_GRIDS; i ++ ) {
			if ( probeGrid == UNROLLED_LOOP_INDEX ) irradiance += getLightProbeGridIrradiance( probesSH[ i ], probesMin[ i ], probesMax[ i ], probesResolution[ i ], probeWorldPos, probeWorldNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,s_=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_PMREM )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,r_=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,o_=`#if NUM_LIGHT_PROBE_GRIDS > 0
uniform highp sampler3D probesSH[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMin[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesMax[ NUM_LIGHT_PROBE_GRIDS ];
uniform vec3 probesResolution[ NUM_LIGHT_PROBE_GRIDS ];
bool isInsideLightProbeGrid( vec3 worldPos, vec3 worldNormal, vec3 probesMin, vec3 probesMax, vec3 probesResolution ) {
	vec3 spacing = ( probesMax - probesMin ) / probesResolution;
	vec3 samplePos = worldPos + worldNormal * spacing * 0.5;
	vec3 margin = spacing * 0.01;
	return all( greaterThanEqual( samplePos, probesMin - margin ) ) && all( lessThanEqual( samplePos, probesMax + margin ) );
}
vec3 getLightProbeGridIrradiance( highp sampler3D probesSH, vec3 probesMin, vec3 probesMax, vec3 probesResolution, vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 probeSpacing = gridRange / res;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.5 / res, 1.0 - 0.5 / res );
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,a_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,l_=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,c_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,u_=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,h_=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,f_=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,d_=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,p_=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,m_=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,g_=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,__=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,x_=`#if defined( USE_MORPHCOLORS )
	#if defined( USE_COLOR_ALPHA )
		vColor *= morphTargetBaseInfluence;
	#elif defined( USE_COLOR )
		vColor.rgb *= morphTargetBaseInfluence;
	#endif
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor.rgb += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,v_=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,S_=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,M_=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,y_=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,b_=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,T_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,E_=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,w_=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,A_=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,R_=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,C_=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,P_=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,L_=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,I_=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,N_=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,D_=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,U_=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,O_=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,F_=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,B_=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,z_=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,k_=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				vec2 radius = shadowRadius * texelSize;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float lightDistance = length( lightToPosition );
			float depthRange = shadowCameraFar - shadowCameraNear;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float depthA = - shadowCameraNear / depthRange - shadowBias;
				float depthB = shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#else
				float depthA = shadowCameraFar / depthRange + shadowBias;
				float depthB = - shadowCameraNear * shadowCameraFar / ( depthRange * lightDistance );
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			shadow = 0.0;
			for ( int i = 0; i < 5; i ++ ) {
				vec2 offset = vogelDiskSample( i, 5, phi );
				vec3 direction = bd3D + ( tangent * offset.x + bitangent * offset.y ) * texelSize;
				vec3 absDirection = abs( direction );
				float dp = depthA + depthB / max( max( absDirection.x, absDirection.y ), absDirection.z );
				shadow += texture( shadowMap, vec4( direction, dp ) );
			}
			shadow *= 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,H_=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,G_=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,V_=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,W_=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,X_=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,q_=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Y_=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,K_=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,$_=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,J_=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Z_=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,Q_=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,j_=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,ex=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,tx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	uniform mat3 diffuseRoughnessMapTransform;
	varying vec2 vDiffuseRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,nx=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DIFFUSE_ROUGHNESSMAP
	vDiffuseRoughnessMapUv = ( diffuseRoughnessMapTransform * vec3( DIFFUSE_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,ix=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const sx=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,rx=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ox=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ax=`uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <envmap_common_pars_fragment>
void main() {
	#ifdef ENVMAP_TYPE_PMREM
		vec4 texColor = textureLod( envMap, backgroundRotation * vWorldDirection, roughnessToMip( backgroundBlurriness ) );
	#else
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lx=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cx=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ux=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,hx=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,fx=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,dx=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,px=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,mx=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,gx=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_x=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,xx=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,vx=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sx=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mx=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,yx=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,bx=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tx=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Ex=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,wx=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ax=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Rx=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Cx=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DIFFUSE_ROUGHNESS
	uniform float diffuseRoughness;
	#ifdef USE_DIFFUSE_ROUGHNESSMAP
		uniform sampler2D diffuseRoughnessMap;
	#endif
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Px=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lx=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Ix=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Nx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Dx=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Ux=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Ox=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Fx=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,rt={alphahash_fragment:rg,alphahash_pars_fragment:og,alphamap_fragment:ag,alphamap_pars_fragment:lg,alphatest_fragment:cg,alphatest_pars_fragment:ug,aomap_fragment:hg,aomap_pars_fragment:fg,batching_pars_vertex:dg,batching_vertex:pg,begin_vertex:mg,beginnormal_vertex:gg,bsdfs:_g,iridescence_fragment:xg,bumpmap_pars_fragment:vg,clipping_planes_fragment:Sg,clipping_planes_pars_fragment:Mg,clipping_planes_pars_vertex:yg,clipping_planes_vertex:bg,color_fragment:Tg,color_pars_fragment:Eg,color_pars_vertex:wg,color_vertex:Ag,common:Rg,defaultnormal_vertex:Cg,displacementmap_pars_vertex:Pg,displacementmap_vertex:Lg,emissivemap_fragment:Ig,emissivemap_pars_fragment:Ng,colorspace_fragment:Dg,colorspace_pars_fragment:Ug,envmap_fragment:Og,envmap_common_pars_fragment:Fg,envmap_pars_fragment:Bg,envmap_pars_vertex:zg,envmap_physical_pars_fragment:Jg,envmap_vertex:kg,fog_vertex:Hg,fog_pars_vertex:Gg,fog_fragment:Vg,fog_pars_fragment:Wg,gradientmap_pars_fragment:Xg,lightmap_pars_fragment:qg,lights_lambert_fragment:Yg,lights_lambert_pars_fragment:Kg,lights_pars_begin:$g,lights_toon_fragment:Zg,lights_toon_pars_fragment:Qg,lights_phong_fragment:jg,lights_phong_pars_fragment:e_,lights_physical_fragment:t_,lights_physical_pars_fragment:n_,lights_fragment_begin:i_,lights_fragment_maps:s_,lights_fragment_end:r_,lightprobes_pars_fragment:o_,logdepthbuf_fragment:a_,logdepthbuf_pars_fragment:l_,logdepthbuf_pars_vertex:c_,logdepthbuf_vertex:u_,map_fragment:h_,map_pars_fragment:f_,map_particle_fragment:d_,map_particle_pars_fragment:p_,metalnessmap_fragment:m_,metalnessmap_pars_fragment:g_,morphinstance_vertex:__,morphcolor_vertex:x_,morphnormal_vertex:v_,morphtarget_pars_vertex:S_,morphtarget_vertex:M_,normal_fragment_begin:y_,normal_fragment_maps:b_,normal_pars_fragment:T_,normal_pars_vertex:E_,normal_vertex:w_,normalmap_pars_fragment:A_,clearcoat_normal_fragment_begin:R_,clearcoat_normal_fragment_maps:C_,clearcoat_pars_fragment:P_,iridescence_pars_fragment:L_,opaque_fragment:I_,packing:N_,premultiplied_alpha_fragment:D_,project_vertex:U_,dithering_fragment:O_,dithering_pars_fragment:F_,roughnessmap_fragment:B_,roughnessmap_pars_fragment:z_,shadowmap_pars_fragment:k_,shadowmap_pars_vertex:H_,shadowmap_vertex:G_,shadowmask_pars_fragment:V_,skinbase_vertex:W_,skinning_pars_vertex:X_,skinning_vertex:q_,skinnormal_vertex:Y_,specularmap_fragment:K_,specularmap_pars_fragment:$_,tonemapping_fragment:J_,tonemapping_pars_fragment:Z_,transmission_fragment:Q_,transmission_pars_fragment:j_,uv_pars_fragment:ex,uv_pars_vertex:tx,uv_vertex:nx,worldpos_vertex:ix,background_vert:sx,background_frag:rx,backgroundCube_vert:ox,backgroundCube_frag:ax,cube_vert:lx,cube_frag:cx,depth_vert:ux,depth_frag:hx,distance_vert:fx,distance_frag:dx,equirect_vert:px,equirect_frag:mx,linedashed_vert:gx,linedashed_frag:_x,meshbasic_vert:xx,meshbasic_frag:vx,meshlambert_vert:Sx,meshlambert_frag:Mx,meshmatcap_vert:yx,meshmatcap_frag:bx,meshnormal_vert:Tx,meshnormal_frag:Ex,meshphong_vert:wx,meshphong_frag:Ax,meshphysical_vert:Rx,meshphysical_frag:Cx,meshtoon_vert:Px,meshtoon_frag:Lx,points_vert:Ix,points_frag:Nx,shadow_vert:Dx,shadow_frag:Ux,sprite_vert:Ox,sprite_frag:Fx},Le={common:{diffuse:{value:new Oe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ze}},envmap:{envMap:{value:null},envMapRotation:{value:new Ze},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ze}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ze}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ze},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ze},normalScale:{value:new he(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ze},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ze}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ze}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ze}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Oe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:[]},probesMin:{value:[]},probesMax:{value:[]},probesResolution:{value:[]}},points:{diffuse:{value:new Oe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0},uvTransform:{value:new Ze}},sprite:{diffuse:{value:new Oe(16777215)},opacity:{value:1},center:{value:new he(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ze},alphaMap:{value:null},alphaMapTransform:{value:new Ze},alphaTest:{value:0}}},jn={basic:{uniforms:dn([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.fog]),vertexShader:rt.meshbasic_vert,fragmentShader:rt.meshbasic_frag},lambert:{uniforms:dn([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new Oe(0)},envMapIntensity:{value:1}}]),vertexShader:rt.meshlambert_vert,fragmentShader:rt.meshlambert_frag},phong:{uniforms:dn([Le.common,Le.specularmap,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,Le.lights,{emissive:{value:new Oe(0)},specular:{value:new Oe(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:rt.meshphong_vert,fragmentShader:rt.meshphong_frag},standard:{uniforms:dn([Le.common,Le.envmap,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.roughnessmap,Le.metalnessmap,Le.fog,Le.lights,{emissive:{value:new Oe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag},toon:{uniforms:dn([Le.common,Le.aomap,Le.lightmap,Le.emissivemap,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.gradientmap,Le.fog,Le.lights,{emissive:{value:new Oe(0)}}]),vertexShader:rt.meshtoon_vert,fragmentShader:rt.meshtoon_frag},matcap:{uniforms:dn([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,Le.fog,{matcap:{value:null}}]),vertexShader:rt.meshmatcap_vert,fragmentShader:rt.meshmatcap_frag},points:{uniforms:dn([Le.points,Le.fog]),vertexShader:rt.points_vert,fragmentShader:rt.points_frag},dashed:{uniforms:dn([Le.common,Le.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:rt.linedashed_vert,fragmentShader:rt.linedashed_frag},depth:{uniforms:dn([Le.common,Le.displacementmap]),vertexShader:rt.depth_vert,fragmentShader:rt.depth_frag},normal:{uniforms:dn([Le.common,Le.bumpmap,Le.normalmap,Le.displacementmap,{opacity:{value:1}}]),vertexShader:rt.meshnormal_vert,fragmentShader:rt.meshnormal_frag},sprite:{uniforms:dn([Le.sprite,Le.fog]),vertexShader:rt.sprite_vert,fragmentShader:rt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ze},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:rt.background_vert,fragmentShader:rt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ze}},vertexShader:rt.backgroundCube_vert,fragmentShader:rt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:rt.cube_vert,fragmentShader:rt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:rt.equirect_vert,fragmentShader:rt.equirect_frag},distance:{uniforms:dn([Le.common,Le.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:rt.distance_vert,fragmentShader:rt.distance_frag},shadow:{uniforms:dn([Le.lights,Le.fog,{color:{value:new Oe(0)},opacity:{value:1}}]),vertexShader:rt.shadow_vert,fragmentShader:rt.shadow_frag}};jn.physical={uniforms:dn([jn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ze},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ze},clearcoatNormalScale:{value:new he(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ze},diffuseRoughness:{value:0},diffuseRoughnessMap:{value:null},diffuseRoughnessMapTransform:{value:new Ze},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ze},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ze},sheen:{value:0},sheenColor:{value:new Oe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ze},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ze},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ze},transmissionSamplerSize:{value:new he},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ze},attenuationDistance:{value:0},attenuationColor:{value:new Oe(0)},specularColor:{value:new Oe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ze},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ze},anisotropyVector:{value:new he},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ze}}]),vertexShader:rt.meshphysical_vert,fragmentShader:rt.meshphysical_frag};const Wo={r:0,b:0,g:0},Bx=new et,Od=new Ze;Od.set(-1,0,0,0,1,0,0,0,1);function zx(i,e,t,n,s,r){const o=new Oe(0);let a=s===!0?0:1,c,l,u=null,f=0,h=null;function d(x){let y=x.isScene===!0?x.background:null;if(y&&y.isTexture){const S=x.backgroundBlurriness>0;y=e.get(y,S)}return y}function p(x){let y=!1;const S=d(x);S===null?g(o,a):S&&S.isColor&&(g(S,1),y=!0);const E=i.xr.getEnvironmentBlendMode();E==="additive"?t.buffers.color.setClear(0,0,0,1,r):E==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||y)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function v(x,y){const S=d(y);S&&S.isCubeTexture?(l===void 0&&(l=new mt(new en(1,1,1),new Ki({name:"BackgroundCubeMaterial",uniforms:js(jn.backgroundCube.uniforms),vertexShader:jn.backgroundCube.vertexShader,fragmentShader:jn.backgroundCube.fragmentShader,side:ln,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(E,b,_){this.matrixWorld.copyPosition(_.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=S,l.material.uniforms.backgroundBlurriness.value=y.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(Bx.makeRotationFromEuler(y.backgroundRotation)).transpose(),S.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(Od),l.material.toneMapped=ct.getTransfer(S.colorSpace)!==St,(u!==S||f!==S.version||h!==i.toneMapping)&&(l.material.needsUpdate=!0,u=S,f=S.version,h=i.toneMapping),l.layers.enableAll(),x.unshift(l,l.geometry,l.material,0,0,null)):S&&S.isTexture&&(c===void 0&&(c=new mt(new ut(2,2),new Ki({name:"BackgroundMaterial",uniforms:js(jn.background.uniforms),vertexShader:jn.background.vertexShader,fragmentShader:jn.background.fragmentShader,side:Xi,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=S,c.material.uniforms.backgroundIntensity.value=y.backgroundIntensity,c.material.toneMapped=ct.getTransfer(S.colorSpace)!==St,S.matrixAutoUpdate===!0&&S.updateMatrix(),c.material.uniforms.uvTransform.value.copy(S.matrix),(u!==S||f!==S.version||h!==i.toneMapping)&&(c.material.needsUpdate=!0,u=S,f=S.version,h=i.toneMapping),c.layers.enableAll(),x.unshift(c,c.geometry,c.material,0,0,null))}function g(x,y){x.getRGB(Wo,Cd(i)),t.buffers.color.setClear(Wo.r,Wo.g,Wo.b,y,r)}function m(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(x,y=1){o.set(x),a=y,g(o,a)},getClearAlpha:function(){return a},setClearAlpha:function(x){a=x,g(o,a)},render:p,addToRenderList:v,dispose:m}}function kx(i,e){const t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null);let r=s,o=!1;function a(C,N,F,I,B){let H=!1;const k=f(C,I,F,N);r!==k&&(r=k,l(r.object)),H=d(C,I,F,B),H&&p(C,I,F,B),B!==null&&e.update(B,i.ELEMENT_ARRAY_BUFFER),(H||o)&&(o=!1,S(C,N,F,I),B!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(B).buffer))}function c(){return i.createVertexArray()}function l(C){return i.bindVertexArray(C)}function u(C){return i.deleteVertexArray(C)}function f(C,N,F,I){const B=I.wireframe===!0;let H=n[N.id];H===void 0&&(H={},n[N.id]=H);const k=C.isInstancedMesh===!0?C.id:0;let Q=H[k];Q===void 0&&(Q={},H[k]=Q);let G=Q[F.id];G===void 0&&(G={},Q[F.id]=G);let Z=G[B];return Z===void 0&&(Z=h(c()),G[B]=Z),Z}function h(C){const N=[],F=[],I=[];for(let B=0;B<t;B++)N[B]=0,F[B]=0,I[B]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:N,enabledAttributes:F,attributeDivisors:I,object:C,attributes:{},index:null}}function d(C,N,F,I){const B=r.attributes,H=N.attributes;let k=0;const Q=F.getAttributes();for(const G in Q)if(Q[G].location>=0){const V=B[G];let ue=H[G];if(ue===void 0&&(G==="instanceMatrix"&&C.instanceMatrix&&(ue=C.instanceMatrix),G==="instanceColor"&&C.instanceColor&&(ue=C.instanceColor)),V===void 0||V.attribute!==ue||ue&&V.data!==ue.data)return!0;k++}return r.attributesNum!==k||r.index!==I}function p(C,N,F,I){const B={},H=N.attributes;let k=0;const Q=F.getAttributes();for(const G in Q)if(Q[G].location>=0){let V=H[G];V===void 0&&(G==="instanceMatrix"&&C.instanceMatrix&&(V=C.instanceMatrix),G==="instanceColor"&&C.instanceColor&&(V=C.instanceColor));const ue={};ue.attribute=V,V&&V.data&&(ue.data=V.data),B[G]=ue,k++}r.attributes=B,r.attributesNum=k,r.index=I}function v(){const C=r.newAttributes;for(let N=0,F=C.length;N<F;N++)C[N]=0}function g(C){m(C,0)}function m(C,N){const F=r.newAttributes,I=r.enabledAttributes,B=r.attributeDivisors;F[C]=1,I[C]===0&&(i.enableVertexAttribArray(C),I[C]=1),B[C]!==N&&(i.vertexAttribDivisor(C,N),B[C]=N)}function x(){const C=r.newAttributes,N=r.enabledAttributes;for(let F=0,I=N.length;F<I;F++)N[F]!==C[F]&&(i.disableVertexAttribArray(F),N[F]=0)}function y(C,N,F,I,B,H,k){k===!0?i.vertexAttribIPointer(C,N,F,B,H):i.vertexAttribPointer(C,N,F,I,B,H)}function S(C,N,F,I){v();const B=I.attributes,H=F.getAttributes(),k=N.defaultAttributeValues;for(const Q in H){const G=H[Q];if(G.location>=0){let Z=B[Q];if(Z===void 0&&(Q==="instanceMatrix"&&C.instanceMatrix&&(Z=C.instanceMatrix),Q==="instanceColor"&&C.instanceColor&&(Z=C.instanceColor)),Z!==void 0){const V=Z.normalized,ue=Z.itemSize,Re=e.get(Z);if(Re===void 0)continue;const D=Re.buffer,K=Re.type,ne=Re.bytesPerElement,fe=K===i.INT||K===i.UNSIGNED_INT||Z.gpuType===Hc;if(Z.isInterleavedBufferAttribute){const ce=Z.data,pe=ce.isInterleavedBuffer===!0?ce.stride:ce.itemSize,He=Z.offset;if(ce.isInstancedInterleavedBuffer||ce.isInstancedBufferAttribute){for(let se=0;se<G.locationSize;se++)m(G.location+se,ce.meshPerAttribute);C.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let se=0;se<G.locationSize;se++)g(G.location+se);i.bindBuffer(i.ARRAY_BUFFER,D);for(let se=0;se<G.locationSize;se++)y(G.location+se,ue/G.locationSize,K,V,pe*ne,(He+ue/G.locationSize*se)*ne,fe)}else{if(Z.isInstancedBufferAttribute){for(let ce=0;ce<G.locationSize;ce++)m(G.location+ce,Z.meshPerAttribute);C.isInstancedMesh!==!0&&I._maxInstanceCount===void 0&&(I._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let ce=0;ce<G.locationSize;ce++)g(G.location+ce);i.bindBuffer(i.ARRAY_BUFFER,D);for(let ce=0;ce<G.locationSize;ce++)y(G.location+ce,ue/G.locationSize,K,V,ue*ne,ue/G.locationSize*ce*ne,fe)}}else if(k!==void 0){const V=k[Q];if(V!==void 0)switch(V.length){case 2:i.vertexAttrib2fv(G.location,V);break;case 3:i.vertexAttrib3fv(G.location,V);break;case 4:i.vertexAttrib4fv(G.location,V);break;default:i.vertexAttrib1fv(G.location,V)}}}}x()}function E(){R();for(const C in n){const N=n[C];for(const F in N){const I=N[F];for(const B in I){const H=I[B];for(const k in H)u(H[k].object),delete H[k];delete I[B]}}delete n[C]}}function b(C){if(n[C.id]===void 0)return;const N=n[C.id];for(const F in N){const I=N[F];for(const B in I){const H=I[B];for(const k in H)u(H[k].object),delete H[k];delete I[B]}}delete n[C.id]}function _(C){for(const N in n){const F=n[N];for(const I in F){const B=F[I];if(B[C.id]===void 0)continue;const H=B[C.id];for(const k in H)u(H[k].object),delete H[k];delete B[C.id]}}}function M(C){for(const N in n){const F=n[N],I=C.isInstancedMesh===!0?C.id:0,B=F[I];if(B!==void 0){for(const H in B){const k=B[H];for(const Q in k)u(k[Q].object),delete k[Q];delete B[H]}delete F[I],Object.keys(F).length===0&&delete n[N]}}}function R(){w(),o=!0,r!==s&&(r=s,l(r.object))}function w(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:R,resetDefaultState:w,dispose:E,releaseStatesOfGeometry:b,releaseStatesOfObject:M,releaseStatesOfProgram:_,initAttributes:v,enableAttribute:g,disableUnusedAttributes:x}}function Hx(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function o(c,l,u){u!==0&&(i.drawArraysInstanced(n,c,l,u),t.update(l,n,u))}function a(c,l,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,u);let h=0;for(let d=0;d<u;d++)h+=l[d];t.update(h,n,1)}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a}function Gx(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){const _=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(_.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(_){return!(_!==Wn&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(_){const M=_===Un&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(_!==yn&&_!==Ln&&!M&&n.convert(_)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(_){if(_==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";_="mediump"}return _==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp";const u=c(l);u!==l&&(Ve("WebGLRenderer:",l,"not supported, using",u,"instead."),l=u);const f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),h=t.logarithmicDepthBuffer===!0&&f===!1;t.reversedDepthBuffer===!0&&f===!1&&Ve("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer."),t.logarithmicDepthBuffer===!0&&f===!0&&Ve("WebGLRenderer: Logarithmic depth buffer is ignored when reversed depth buffer is enabled.");const d=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),p=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),m=i.getParameter(i.MAX_VERTEX_ATTRIBS),x=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),y=i.getParameter(i.MAX_VARYING_VECTORS),S=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),E=i.getParameter(i.MAX_SAMPLES),b=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:o,textureTypeReadable:a,precision:l,logarithmicDepthBuffer:h,reversedDepthBuffer:f,maxTextures:d,maxVertexTextures:p,maxTextureSize:v,maxCubemapSize:g,maxAttributes:m,maxVertexUniforms:x,maxVaryings:y,maxFragmentUniforms:S,maxSamples:E,samples:b}}function Vx(i){const e=this;let t=null,n=0,s=!1,r=!1;const o=new Si,a=new Ze,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(f,h){const d=f.length!==0||h||n!==0||s;return s=h,n=f.length,d},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(f,h){t=u(f,h,0)},this.setState=function(f,h,d){const p=f.clippingPlanes,v=f.clipIntersection,g=f.clipShadows,m=i.get(f);if(!s||p===null||p.length===0||r&&!g)r?u(null):l();else{const x=r?0:n,y=x*4;let S=m.clippingState||null;c.value=S,S=u(p,h,y,d);for(let E=0;E!==y;++E)S[E]=t[E];m.clippingState=S,this.numIntersection=v?this.numPlanes:0,this.numPlanes+=x}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function u(f,h,d,p){const v=f!==null?f.length:0;let g=null;if(v!==0){if(g=c.value,p!==!0||g===null){const m=d+v*4,x=h.matrixWorldInverse;a.getNormalMatrix(x),(g===null||g.length<m)&&(g=new Float32Array(m));for(let y=0,S=d;y!==v;++y,S+=4)o.copy(f[y]).applyMatrix4(x,a),o.normal.toArray(g,S),g[S+3]=o.constant}c.value=g,c.needsUpdate=!0}return e.numPlanes=v,e.numIntersection=0,g}}class gu extends Nn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new gd(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new en(5,5,5),r=new Ki({name:"CubemapFromEquirect",uniforms:js(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ln,blending:ks});r.uniforms.tEquirect.value=t;const o=new mt(s,r),a=t.minFilter;return t.minFilter===ti&&(t.minFilter=jt),new Sc(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}}const Hh=256,Wx=3,Xx=20,Fd=256,Bd=16,qx=3,Yx=new L,Kx=new Oe;class so{constructor(e){this._renderer=e,this._cubeSize=0,this._sourceTarget=null,this._cubeCamera=new Sc(1,10,null),this._boxMesh=new mt(new en(5,5,5),null),this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null,this._integrationMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){const{size:o=256,position:a=Yx}=r,c=this._renderer;this._setSize(o);const l=this._allocateTarget(),u=this._getSourceTarget(!0);t>0&&(u.texture.mipmapsAutoUpdate=!1);const f=c.autoClear,h=c.autoClearColor,d=c.autoClearDepth,p=c.autoClearStencil,v=e.background;c.autoClear=!0,c.autoClearColor=!0,c.autoClearDepth=!0,c.autoClearStencil=!0,v===null&&(e.background=c.getClearColor(Kx));const g=new Sc(n,s,u);return g.position.copy(a),g.update(c,e),c.autoClear=f,c.autoClearColor=h,c.autoClearDepth=d,c.autoClearStencil=p,e.background=v,t>0&&(u.texture.mipmapsAutoUpdate=!0,this._blur(l,t)),this._applyPMREM(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Wh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Vh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._sourceTarget!==null&&this._sourceTarget.dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._integrationMaterial!==null&&this._integrationMaterial.dispose(),this._boxMesh.geometry.dispose()}static lodToRoughness(e,t){return t>0?1-Math.sqrt(1-e/t):0}_setSize(e){this._cubeSize=Math.max(Hh,rd(e))}_fromTexture(e,t){e.mapping===qs||e.mapping===Xr?this._setSize(e.image.length===0?Hh:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4);const n=t||this._allocateTarget();return this._textureToCubemap(e),this._applyPMREM(n),n}_allocateTarget(){const e=this._cubeSize,t=Gh(e,!1,!1),n=Math.log2(e)-Wx;for(let s=0;s<=n;s++)t.texture.mipmaps.push({width:e>>s,height:e>>s});return t.texture.name="PMREM",t.texture.isPMREMTexture=!0,t}_getSourceTarget(e=!1){const t=this._cubeSize,n=this._sourceTarget;return(n===null||n.width!==t||e&&n.depthBuffer===!1)&&(n!==null&&n.dispose(),this._sourceTarget=Gh(t,!0,e)),this._sourceTarget}_compileMaterial(e){this._boxMesh.material=e,this._renderer.compile(this._boxMesh,this._cubeCamera.children[0])}_renderCube(e,t,n){const s=this._boxMesh,r=this._cubeCamera;s.material=n,r.renderTarget=e,r.activeMipmapLevel=t;const o=e.width>>t;e.viewport.set(0,0,o,o),r.update(this._renderer,s),e.viewport.set(0,0,e.width,e.height)}_textureToCubemap(e){let t;e.mapping===qs||e.mapping===Xr?(this._cubemapMaterial===null&&(this._cubemapMaterial=Wh()),t=this._cubemapMaterial,t.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):(this._equirectMaterial===null&&(this._equirectMaterial=Vh()),t=this._equirectMaterial),t.uniforms.envMap.value=e,this._renderCube(this._getSourceTarget(),0,t)}_applyPMREM(e){this._ggxMaterial===null&&(this._ggxMaterial=$x(),this._integrationMaterial=Jx());const t=this._cubeSize,n=e.texture.mipmaps.length-1,s=this._ggxMaterial.uniforms;s.envMap.value=this._sourceTarget.texture;const r=this._integrationMaterial.uniforms;r.envMap.value=this._sourceTarget.texture,r.sourceLod.value=Math.log2(t/Bd);for(let o=0;o<=n;o++){const a=so.lodToRoughness(o,n);if(o>n-qx)r.roughness.value=a,this._renderCube(e,o,this._integrationMaterial);else{const c=a>0?Math.log2(t)+.5*Math.log2(6/(Fd*Math.pow(a,4)))+.5:0;s.roughness.value=a,s.lodBias.value=c,this._renderCube(e,o,this._ggxMaterial)}}}_blur(e,t){this._blurMaterial===null&&(this._blurMaterial=Zx());const n=this._blurMaterial,s=n.uniforms,r=this._sourceTarget;s.sigma.value=Math.min(t,Math.PI)/Math.SQRT2,s.envMap.value=r.texture,this._renderCube(e,0,n),s.envMap.value=e.texture,this._renderCube(r,0,n)}}function Gh(i,e,t){return new gu(i,{minFilter:ti,generateMipmaps:e,type:Un,colorSpace:xn,depthBuffer:t})}function uo(i,e,t){return new Ki({name:i,uniforms:e,vertexShader:rt.cube_vert,fragmentShader:t,side:ln,blending:ks,depthTest:!1,depthWrite:!1})}function $x(){return uo("PMREMGGXConvolution",{envMap:{value:null},roughness:{value:0},lodBias:{value:0}},`

		#define GGX_SAMPLES ${Fd}u

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float lodBias;

		#include <common>

		// Van der Corput radical inverse
		float radicalInverse_VdC( uint bits ) {

			bits = ( bits << 16u ) | ( bits >> 16u );
			bits = ( ( bits & 0x55555555u ) << 1u ) | ( ( bits & 0xAAAAAAAAu ) >> 1u );
			bits = ( ( bits & 0x33333333u ) << 2u ) | ( ( bits & 0xCCCCCCCCu ) >> 2u );
			bits = ( ( bits & 0x0F0F0F0Fu ) << 4u ) | ( ( bits & 0xF0F0F0F0u ) >> 4u );
			bits = ( ( bits & 0x00FF00FFu ) << 8u ) | ( ( bits & 0xFF00FF00u ) >> 8u );
			return float( bits ) * 2.3283064365386963e-10; // / 0x100000000

		}

		// Hammersley sequence
		vec2 hammersley( uint i, uint N ) {

			return vec2( float( i ) / float( N ), radicalInverse_VdC( i ) );

		}

		void main() {

			vec3 N = normalize( vWorldDirection );

			// For very low roughness, just sample the environment directly
			if ( roughness < 0.001 ) {

				gl_FragColor = vec4( textureLod( envMap, N, 0.0 ).rgb, 1.0 );
				return;

			}

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			// Tangent space basis for VNDF sampling
			vec3 up = abs( N.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, N ) );
			vec3 bitangent = cross( N, tangent );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			for ( uint i = 0u; i < GGX_SAMPLES; i ++ ) {

				vec2 Xi = hammersley( i, GGX_SAMPLES );

				// With V = N, sample the reflected direction directly.
				float invQ = 1.0 / ( 1.0 - Xi.x + alpha2 * Xi.x );
				float NdotL = ( 1.0 - Xi.x - alpha2 * Xi.x ) * invQ;

				if ( NdotL > 0.0 ) {

					float phi = 2.0 * PI * Xi.y;
					float sinTheta = 2.0 * alpha * sqrt( Xi.x * ( 1.0 - Xi.x ) ) * invQ;
					vec3 L = N * NdotL + ( tangent * cos( phi ) + bitangent * sin( phi ) ) * sinTheta;

					// Match the source mip to the sample's solid angle. The terms
					// independent of the sample are precomputed in lodBias.
					float d = alpha2 * invQ;
					float lod = max( log2( d ) + lodBias, 0.0 );

					// Weight by NdotL for the split-sum approximation
					prefilteredColor += textureLod( envMap, L, lod ).rgb * NdotL;
					totalWeight += NdotL;

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Jx(){return uo("PMREMGGXIntegration",{envMap:{value:null},roughness:{value:0},sourceLod:{value:0},sourceSize:{value:Bd}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float roughness;
		uniform float sourceLod;
		uniform int sourceSize;

		void main() {

			vec3 N = normalize( vWorldDirection );

			float alpha = roughness * roughness;
			float alpha2 = alpha * alpha;

			float texelSize = 2.0 / float( sourceSize );

			vec3 prefilteredColor = vec3( 0.0 );
			float totalWeight = 0.0;

			// Pair opposite texels: only the one in N's hemisphere contributes.
			for ( int face = 0; face < 3; face ++ ) {

				for ( int y = 0; y < sourceSize; y ++ ) {

					for ( int x = 0; x < sourceSize; x ++ ) {

						vec2 uv = ( vec2( x, y ) + 0.5 ) * texelSize - 1.0;
						vec3 texelDirection = face == 0 ? vec3( 1.0, uv ) : ( face == 1 ? vec3( uv.x, 1.0, uv.y ) : vec3( uv, 1.0 ) );

						float invDistance = inversesqrt( 1.0 + dot( uv, uv ) );
						float NdotL = dot( N, texelDirection );
						texelDirection *= NdotL < 0.0 ? - 1.0 : 1.0;
						NdotL = abs( NdotL ) * invDistance;

						// With V = N, NdotH squared is ( 1 + NdotL ) / 2. Common factors
						// in the GGX distribution and texel solid angle cancel when normalized.
						float d = 1.0 + alpha2 + ( alpha2 - 1.0 ) * NdotL;
						float weight = NdotL * invDistance * invDistance * invDistance / ( d * d );

						prefilteredColor += textureLod( envMap, texelDirection, sourceLod ).rgb * weight;
						totalWeight += weight;

					}

				}

			}

			gl_FragColor = vec4( prefilteredColor / totalWeight, 1.0 );

		}
	`)}function Zx(){return uo("PMREMSphericalGaussianBlur",{envMap:{value:null},sigma:{value:0}},`

		#define SAMPLES ${Xx}
		#define GOLDEN_ANGLE 2.39996322973

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float sigma;

		#include <common>

		void main() {

			vec3 outputDirection = normalize( vWorldDirection );

			vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
			vec3 tangent = normalize( cross( up, outputDirection ) );
			vec3 bitangent = cross( outputDirection, tangent );

			// Truncate the kernel at three standard deviations or at the antipode.
			float thetaMax = min( 3.0 * sigma, PI );
			float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

			vec3 accumColor = vec3( 0.0 );
			float accumWeight = 0.0;

			for ( int i = 0; i < SAMPLES; i ++ ) {

				// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
				float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
				float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
				float phi = float( i ) * GOLDEN_ANGLE;

				vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
				vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

				// Correct the planar sample density to solid angle.
				float weight = sin( theta ) / theta;

				accumColor += weight * textureLod( envMap, sampleDirection, 0.0 ).rgb;
				accumWeight += weight;

			}

			gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

		}
	`)}function Vh(){return uo("PMREMEquirectangularToCubemap",{envMap:{value:null}},`

		varying vec3 vWorldDirection;

		uniform sampler2D envMap;

		#include <common>

		void main() {

			// Average four subpixel samples to preserve small, bright features.
			vec3 direction = normalize( vWorldDirection );
			vec3 dx = dFdx( direction ) * 0.25;
			vec3 dy = dFdy( direction ) * 0.25;

			vec3 color = textureLod( envMap, equirectUv( normalize( direction - dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx - dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction - dx + dy ) ), 0.0 ).rgb;
			color += textureLod( envMap, equirectUv( normalize( direction + dx + dy ) ), 0.0 ).rgb;
			gl_FragColor = vec4( color * 0.25, 1.0 );

		}
	`)}function Wh(){return uo("PMREMCubemapToCubemap",{envMap:{value:null},flipEnvMap:{value:-1}},`

		varying vec3 vWorldDirection;

		uniform samplerCube envMap;
		uniform float flipEnvMap;

		void main() {

			gl_FragColor = vec4( textureCube( envMap, vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) ).rgb, 1.0 );

		}
	`)}function Qx(i){let e=new WeakMap,t=new WeakMap,n=null;function s(h,d=!1){return h==null?null:d?o(h):r(h)}function r(h){if(h&&h.isTexture){const d=h.mapping;if(d===Ua||d===Oa)if(e.has(h)){const p=e.get(h).texture;return a(p,h.mapping)}else{const p=h.image;if(p&&p.height>0){const v=new gu(p.height);return v.fromEquirectangularTexture(i,h),e.set(h,v),h.addEventListener("dispose",l),a(v.texture,h.mapping)}else return null}}return h}function o(h){if(h&&h.isTexture&&h.isPMREMTexture!==!0){const d=h.mapping,p=d===Ua||d===Oa,v=d===qs||d===Xr;if(p||v){let g=t.get(h);const m=g!==void 0?g.texture.pmremVersion:0;if(h.isRenderTargetTexture&&h.pmremVersion!==m)return n===null&&(n=new so(i)),g=p?n.fromEquirectangular(h,g):n.fromCubemap(h,g),g.texture.pmremVersion=h.pmremVersion,t.set(h,g),g.texture;if(g!==void 0)return g.texture;{const x=h.image;return p&&x&&x.height>0||v&&x&&c(x)?(n===null&&(n=new so(i)),g=p?n.fromEquirectangular(h):n.fromCubemap(h),g.texture.pmremVersion=h.pmremVersion,t.set(h,g),h.addEventListener("dispose",u),g.texture):null}}}return h}function a(h,d){return d===Ua?h.mapping=qs:d===Oa&&(h.mapping=Xr),h}function c(h){let d=0;const p=6;for(let v=0;v<p;v++)h[v]!==void 0&&d++;return d===p}function l(h){const d=h.target;d.removeEventListener("dispose",l);const p=e.get(d);p!==void 0&&(e.delete(d),p.dispose())}function u(h){const d=h.target;d.removeEventListener("dispose",u);const p=t.get(d);p!==void 0&&(t.delete(d),p.dispose())}function f(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:f}}function jx(i){const e={};function t(n){if(e[n]!==void 0)return e[n];const s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const s=t(n);return s===null&&Hs("WebGLRenderer: "+n+" extension not supported."),s}}}function ev(i,e,t,n){const s={},r=new WeakMap,o=new FinalizationRegistry(p=>delete s[p]);function a(p){c(p.target)}function c(p){p.index!==null&&e.remove(p.index);for(const g in p.attributes)e.remove(p.attributes[g]);p.removeEventListener("dispose",a),delete s[p.id],o.unregister(p);const v=r.get(p);v&&(e.remove(v),r.delete(p)),n.releaseStatesOfGeometry(p),p.isInstancedBufferGeometry===!0&&delete p._maxInstanceCount,t.memory.geometries--}function l(p,v){return s[v.id]!==void 0||(v.addEventListener("dispose",a),s[v.id]=new WeakRef(v),o.register(v,v.id,v),t.memory.geometries++),v}function u(p){const v=p.attributes;for(const g in v)e.update(v[g],i.ARRAY_BUFFER)}function f(p){const v=p.index,g=p.attributes.position;let m=0;if(g===void 0)return;const x=v!==null?v.array.length:g.array.length/3-1,y=g.count>=65535?cd:ld,S=new y(Math.ceil(x/3)*6,1),E=S.array;if(v!==null){const _=v.array;m=v.version;for(let M=0,R=0;M<x;M+=3){const w=_[M+0],C=_[M+1],N=_[M+2];E[R++]=w,E[R++]=C,E[R++]=C,E[R++]=N,E[R++]=N,E[R++]=w}}else{m=g.version;for(let _=0,M=0;_<x;_+=3){const R=_+0,w=_+1,C=_+2;E[M++]=R,E[M++]=w,E[M++]=w,E[M++]=C,E[M++]=C,E[M++]=R}}S.version=m;const b=r.get(p);b&&e.remove(b),r.set(p,S)}function h(p){const v=r.get(p);if(v){const g=p.index;g!==null&&v.version<g.version&&f(p)}else f(p);return r.get(p)}function d(){for(const p in s){const v=s[p].deref();v!==void 0&&c(v)}}return{get:l,update:u,getWireframeAttribute:h,dispose:d}}function tv(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function c(f,h){i.drawElements(n,h,r,f*o),t.update(h,n,1)}function l(f,h,d){d!==0&&(i.drawElementsInstanced(n,h,r,f*o,d),t.update(h,n,d))}function u(f,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,h,0,r,f,0,d);let v=0;for(let g=0;g<d;g++)v+=h[g];t.update(v,n,1)}this.setMode=s,this.setIndex=a,this.render=c,this.renderInstances=l,this.renderMultiDraw=u}function nv(i){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:$e("WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function iv(i,e,t){const n=new WeakMap,s=new bt;function r(o,a,c){const l=o.morphTargetInfluences,u=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,f=u!==void 0?u.length:0;let h=n.get(a);if(h===void 0||h.count!==f){let R=function(){_.dispose(),n.delete(a),a.removeEventListener("dispose",R)};h!==void 0&&h.texture.dispose();const d=a.morphAttributes.position!==void 0,p=a.morphAttributes.normal!==void 0,v=a.morphAttributes.color!==void 0,g=a.morphAttributes.position||[],m=a.morphAttributes.normal||[],x=a.morphAttributes.color||[];let y=0;d===!0&&(y=1),p===!0&&(y=2),v===!0&&(y=3);let S=a.attributes.position.count*y,E=1;S>e.maxTextureSize&&(E=Math.ceil(S/e.maxTextureSize),S=e.maxTextureSize);const b=new Float32Array(S*E*4*f),_=new od(b,S,E,f);_.type=Ln,_.needsUpdate=!0;const M=y*4;for(let w=0;w<f;w++){const C=g[w],N=m[w],F=x[w],I=S*E*4*w;for(let B=0;B<C.count;B++){const H=B*M;d===!0&&(s.fromBufferAttribute(C,B),b[I+H+0]=s.x,b[I+H+1]=s.y,b[I+H+2]=s.z,b[I+H+3]=0),p===!0&&(s.fromBufferAttribute(N,B),b[I+H+4]=s.x,b[I+H+5]=s.y,b[I+H+6]=s.z,b[I+H+7]=0),v===!0&&(s.fromBufferAttribute(F,B),b[I+H+8]=s.x,b[I+H+9]=s.y,b[I+H+10]=s.z,b[I+H+11]=F.itemSize===4?s.w:1)}}h={count:f,texture:_,size:new he(S,E)},n.set(a,h),a.addEventListener("dispose",R)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let d=0;for(let v=0;v<l.length;v++)d+=l[v];const p=a.morphTargetsRelative?1:1-d;c.getUniforms().setValue(i,"morphTargetBaseInfluence",p),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",h.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function sv(i,e,t,n,s){let r=new WeakMap;function o(l){const u=s.render.frame,f=l.geometry,h=e.get(l,f);if(r.get(h)!==u&&(e.update(h),r.set(h,u)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==u&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,u))),l.isSkinnedMesh){const d=l.skeleton;r.get(d)!==u&&(d.update(),r.set(d,u))}return h}function a(){r=new WeakMap}function c(l){const u=l.target;u.removeEventListener("dispose",c),n.releaseStatesOfObject(u),t.remove(u.instanceMatrix),u.instanceColor!==null&&t.remove(u.instanceColor)}return{update:o,dispose:a}}const rv={[zf]:"LINEAR_TONE_MAPPING",[kf]:"REINHARD_TONE_MAPPING",[Hf]:"CINEON_TONE_MAPPING",[kc]:"ACES_FILMIC_TONE_MAPPING",[Vf]:"AGX_TONE_MAPPING",[Wf]:"NEUTRAL_TONE_MAPPING",[Gf]:"CUSTOM_TONE_MAPPING"};function ov(i,e,t,n,s,r){const o=new Nn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1});let a=null,c=null,l=null;const u=new It;u.setAttribute("position",new Qe([-1,3,0,-1,-1,0,3,-1,0],3)),u.setAttribute("uv",new Qe([0,2,0,0,2,0],2));const f=new bm({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),h=new mt(u,f),d=new du(-1,1,1,-1,0,1);let p=null,v=null,g=!1,m,x=null,y=[],S=!1;this.setSize=function(E,b){o.setSize(E,b),a!==null&&a.setSize(E,b),c!==null&&c.setSize(E,b);for(let _=0;_<y.length;_++){const M=y[_];M.setSize&&M.setSize(E,b)}},this.setEffects=function(E){y=E,S=y.length>0&&y[0].isRenderPass===!0;const b=o.width,_=o.height;y.length>0&&a===null&&(a=new Nn(b,_,{type:Un,depthBuffer:!1,stencilBuffer:!1}),c=new Nn(b,_,{type:Un,depthBuffer:!1,stencilBuffer:!1}));const M=s===!0&&y.some(R=>R.needsDepthTexture===!0);M!==(o.depthTexture!==null)&&(M===!0&&l===null&&(l=new $s(b,_),r===!0&&(l.format=Vi,l.type=Ys)),o.dispose(),o.depthTexture=M?l:null,o.resolveDepthBuffer=M,o.storeMultisampledDepthBuffer=M);for(let R=0;R<y.length;R++){const w=y[R];w.setSize&&w.setSize(b,_),M&&w.needsDepthTexture===!0&&w.setDepthTexture&&w.setDepthTexture(l)}},this.begin=function(E,b){if(g||E.toneMapping===Ri&&y.length===0)return!1;if(x=b,b!==null){const _=b.width,M=b.height;(o.width!==_||o.height!==M)&&this.setSize(_,M)}return S===!1&&E.setRenderTarget(o),m=E.toneMapping,E.toneMapping=Ri,!0},this.hasRenderPass=function(){return S},this.end=function(E,b){E.toneMapping=m,g=!0;let _=o,M=a;for(let R=0;R<y.length;R++){const w=y[R];w.enabled!==!1&&(w.render(E,M,_,b),w.needsSwap!==!1&&(_=M,M=M===a?c:a))}if(p!==E.outputColorSpace||v!==E.toneMapping){p=E.outputColorSpace,v=E.toneMapping,f.defines={},ct.getTransfer(p)===St&&(f.defines.SRGB_TRANSFER="");const R=rv[v];R&&(f.defines[R]=""),f.needsUpdate=!0}f.uniforms.tDiffuse.value=_.texture,E.setRenderTarget(x),E.render(h,d),x=null,g=!1},this.isCompositing=function(){return g},this.dispose=function(){o.dispose(),a!==null&&a.dispose(),c!==null&&c.dispose(),u.dispose(),f.dispose()}}const zd=new Vt,kd=new $s(1,1),Hd=new _d(1),Gd=new od,Vd=new x0,Wd=new gd,Xh=[],qh=[],Yh=new Float32Array(16),Kh=new Float32Array(9),$h=new Float32Array(4);function sr(i,e,t){const n=i[0];if(n<=0||n>0)return i;const s=e*t;let r=Xh[s];if(r===void 0&&(r=new Float32Array(s),Xh[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Xt(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function qt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Pa(i,e){let t=qh[e];t===void 0&&(t=new Int32Array(e),qh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function av(i,e){const t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function lv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;i.uniform2fv(this.addr,e),qt(t,e)}}function cv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Xt(t,e))return;i.uniform3fv(this.addr,e),qt(t,e)}}function uv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;i.uniform4fv(this.addr,e),qt(t,e)}}function hv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Xt(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,n))return;$h.set(n),i.uniformMatrix2fv(this.addr,!1,$h),qt(t,n)}}function fv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Xt(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,n))return;Kh.set(n),i.uniformMatrix3fv(this.addr,!1,Kh),qt(t,n)}}function dv(i,e){const t=this.cache,n=e.elements;if(n===void 0){if(Xt(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),qt(t,e)}else{if(Xt(t,n))return;Yh.set(n),i.uniformMatrix4fv(this.addr,!1,Yh),qt(t,n)}}function pv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function mv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;i.uniform2iv(this.addr,e),qt(t,e)}}function gv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;i.uniform3iv(this.addr,e),qt(t,e)}}function _v(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;i.uniform4iv(this.addr,e),qt(t,e)}}function xv(i,e){const t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function vv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Xt(t,e))return;i.uniform2uiv(this.addr,e),qt(t,e)}}function Sv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Xt(t,e))return;i.uniform3uiv(this.addr,e),qt(t,e)}}function Mv(i,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Xt(t,e))return;i.uniform4uiv(this.addr,e),qt(t,e)}}function La(i){return i.version===0&&(i.compareFunction=nd,i.needsUpdate=!0),i}function yv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?r=La(kd):r=zd,t.setTexture2D(e||r,s)}function bv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Vd,s)}function Tv(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_CUBE_SHADOW?r=La(Hd):r=Wd,t.setTextureCube(e||r,s)}function Ev(i,e,t){const n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||Gd,s)}function wv(i){switch(i){case 5126:return av;case 35664:return lv;case 35665:return cv;case 35666:return uv;case 35674:return hv;case 35675:return fv;case 35676:return dv;case 5124:case 35670:return pv;case 35667:case 35671:return mv;case 35668:case 35672:return gv;case 35669:case 35673:return _v;case 5125:return xv;case 36294:return vv;case 36295:return Sv;case 36296:return Mv;case 35678:case 36198:case 36298:case 36306:case 35682:return yv;case 35679:case 36299:case 36307:return bv;case 35680:case 36300:case 36308:case 36293:return Tv;case 36289:case 36303:case 36311:case 36292:return Ev}}function Av(i,e){i.uniform1fv(this.addr,e)}function Rv(i,e){const t=sr(e,this.size,2);i.uniform2fv(this.addr,t)}function Cv(i,e){const t=sr(e,this.size,3);i.uniform3fv(this.addr,t)}function Pv(i,e){const t=sr(e,this.size,4);i.uniform4fv(this.addr,t)}function Lv(i,e){const t=sr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Iv(i,e){const t=sr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Nv(i,e){const t=sr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Dv(i,e){i.uniform1iv(this.addr,e)}function Uv(i,e){i.uniform2iv(this.addr,e)}function Ov(i,e){i.uniform3iv(this.addr,e)}function Fv(i,e){i.uniform4iv(this.addr,e)}function Bv(i,e){i.uniform1uiv(this.addr,e)}function zv(i,e){i.uniform2uiv(this.addr,e)}function kv(i,e){i.uniform3uiv(this.addr,e)}function Hv(i,e){i.uniform4uiv(this.addr,e)}function Gv(i,e,t){const n=this.cache,s=e.length,r=Pa(t,s);Xt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));let o;this.type===i.SAMPLER_2D_SHADOW?o=La(kd):o=zd;for(let a=0;a!==s;++a)t.setTexture2D(e[a]||o,r[a])}function Vv(i,e,t){const n=this.cache,s=e.length,r=Pa(t,s);Xt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||Vd,r[o])}function Wv(i,e,t){const n=this.cache,s=e.length,r=Pa(t,s);Xt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));let o;this.type===i.SAMPLER_CUBE_SHADOW?o=La(Hd):o=Wd;for(let a=0;a!==s;++a)t.setTextureCube(e[a]||o,r[a])}function Xv(i,e,t){const n=this.cache,s=e.length,r=Pa(t,s);Xt(n,r)||(i.uniform1iv(this.addr,r),qt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||Gd,r[o])}function qv(i){switch(i){case 5126:return Av;case 35664:return Rv;case 35665:return Cv;case 35666:return Pv;case 35674:return Lv;case 35675:return Iv;case 35676:return Nv;case 5124:case 35670:return Dv;case 35667:case 35671:return Uv;case 35668:case 35672:return Ov;case 35669:case 35673:return Fv;case 5125:return Bv;case 36294:return zv;case 36295:return kv;case 36296:return Hv;case 35678:case 36198:case 36298:case 36306:case 35682:return Gv;case 35679:case 36299:case 36307:return Vv;case 35680:case 36300:case 36308:case 36293:return Wv;case 36289:case 36303:case 36311:case 36292:return Xv}}class Yv{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=wv(t.type)}}class Kv{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=qv(t.type)}}class $v{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const s=this.seq;for(let r=0,o=s.length;r!==o;++r){const a=s[r];a.setValue(e,t[a.id],n)}}}const pl=/(\w+)(\])?(\[|\.)?/g;function Jh(i,e){i.seq.push(e),i.map[e.id]=e}function Jv(i,e,t){const n=i.name,s=n.length;for(pl.lastIndex=0;;){const r=pl.exec(n),o=pl.lastIndex;let a=r[1];const c=r[2]==="]",l=r[3];if(c&&(a=a|0),l===void 0||l==="["&&o+2===s){Jh(t,l===void 0?new Yv(a,i,e):new Kv(a,i,e));break}else{let f=t.map[a];f===void 0&&(f=new $v(a),Jh(t,f)),t=f}}}class ta{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let o=0;o<n;++o){const a=e.getActiveUniform(t,o),c=e.getUniformLocation(t,a.name);Jv(a,c,this)}const s=[],r=[];for(const o of this.seq)o.type===e.SAMPLER_2D_SHADOW||o.type===e.SAMPLER_CUBE_SHADOW||o.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(o):r.push(o);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){const r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){const s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){const a=t[r],c=n[a.id];c.needsUpdate!==!1&&a.setValue(e,c.value,s)}}static seqWithValue(e,t){const n=[];for(let s=0,r=e.length;s!==r;++s){const o=e[s];o.id in t&&n.push(o)}return n}}function Zh(i,e,t){const n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}const Zv=37297;let Qv=0;function jv(i,e){const t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const Qh=new Ze;function eS(i){ct._getMatrix(Qh,ct.workingColorSpace,i);const e=`mat3( ${Qh.elements.map(t=>t.toFixed(4))} )`;switch(ct.getTransfer(i)){case ca:return[e,"LinearTransferOETF"];case St:return[e,"sRGBTransferOETF"];default:return Ve("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function jh(i,e,t){const n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+jv(i.getShaderSource(e),a)}else return r}function tS(i,e){const t=eS(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( ${t[0]} * value.rgb, value.a ) );`,"}"].join(`
`)}const nS={[zf]:"Linear",[kf]:"Reinhard",[Hf]:"Cineon",[kc]:"ACESFilmic",[Vf]:"AgX",[Wf]:"Neutral",[Gf]:"Custom"};function iS(i,e){const t=nS[e];return t===void 0?(Ve("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Xo=new L;function sS(){ct.getLuminanceCoefficients(Xo);const i=Xo.x.toFixed(4),e=Xo.y.toFixed(4),t=Xo.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function rS(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Pr).join(`
`)}function oS(i){const e=[];for(const t in i){const n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function aS(i,e){const t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){const r=i.getActiveAttrib(e,s),o=r.name;let a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function Pr(i){return i!==""}function ef(i,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows).replace(/NUM_LIGHT_PROBE_GRIDS/g,e.numLightProbeGrids)}function tf(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const lS=/^[ \t]*#include +<([\w\d./]+)>/gm;function yc(i){return i.replace(lS,cS)}function cS(i,e){const t=rt[e];if(t===void 0)throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">");return yc(t)}const uS=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function nf(i){return i.replace(uS,hS)}function hS(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function sf(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}const fS={[Dr]:"SHADOWMAP_TYPE_PCF",[wr]:"SHADOWMAP_TYPE_VSM"};function dS(i){return fS[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}const pS={[Xr]:"ENVMAP_MODE_REFRACTION"};function mS(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":pS[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}const gS={[zc]:"ENVMAP_BLENDING_MULTIPLY",[Dp]:"ENVMAP_BLENDING_MIX",[Up]:"ENVMAP_BLENDING_ADD"};function _S(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":gS[i.combine]||"ENVMAP_BLENDING_NONE"}function xS(i,e,t,n){const s=i.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const c=dS(t),l=t.envMapPMREM===!0?"ENVMAP_TYPE_PMREM":"ENVMAP_TYPE_CUBE",u=mS(t),f=_S(t),h=rS(t),d=oS(r),p=s.createProgram();let v,g,m=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d].filter(Pr).join(`
`),v.length>0&&(v+=`
`),g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d].filter(Pr).join(`
`),g.length>0&&(g+=`
`)):(v=[sf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+u:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.diffuseRoughnessMapUv?"#define DIFFUSE_ROUGHNESSMAP_UV "+t.diffuseRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Pr).join(`
`),g=[sf(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,d,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+u:"",t.envMap?"#define "+f:"",t.envMapPMREM?"#define ENVMAP_MAX_LOD "+t.envMapMaxLod+".0":"",t.envMapPMREM?"#define ENVMAP_SIZE "+t.envMapSize+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.diffuseRoughness?"#define USE_DIFFUSE_ROUGHNESS":"",t.diffuseRoughnessMap?"#define USE_DIFFUSE_ROUGHNESSMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Ri?"#define TONE_MAPPING":"",t.toneMapping!==Ri?rt.tonemapping_pars_fragment:"",t.toneMapping!==Ri?iS("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",rt.colorspace_pars_fragment,tS("linearToOutputTexel",t.outputColorSpace),sS(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Pr).join(`
`)),o=yc(o),o=ef(o,t),o=tf(o,t),a=yc(a),a=ef(a,t),a=tf(a,t),o=nf(o),a=nf(a),t.isRawShaderMaterial!==!0&&(m=`#version 300 es
`,v=[h,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,g=["#define varying in",t.glslVersion===Vu?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Vu?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);const x=m+v+o,y=m+g+a,S=Zh(s,s.VERTEX_SHADER,x),E=Zh(s,s.FRAGMENT_SHADER,y);s.attachShader(p,S),s.attachShader(p,E),t.index0AttributeName!==void 0?s.bindAttribLocation(p,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(p,0,"position"),s.linkProgram(p);function b(w){if(i.debug.checkShaderErrors){const C=s.getProgramInfoLog(p)||"",N=s.getShaderInfoLog(S)||"",F=s.getShaderInfoLog(E)||"",I=C.trim(),B=N.trim(),H=F.trim();let k=!0,Q=!0;if(s.getProgramParameter(p,s.LINK_STATUS)===!1)if(k=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,p,S,E);else{const G=jh(s,S,"vertex"),Z=jh(s,E,"fragment");$e("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(p,s.VALIDATE_STATUS)+`

Material Name: `+w.name+`
Material Type: `+w.type+`

Program Info Log: `+I+`
`+G+`
`+Z)}else I!==""?Ve("WebGLProgram: Program Info Log:",I):(B===""||H==="")&&(Q=!1);Q&&(w.diagnostics={runnable:k,programLog:I,vertexShader:{log:B,prefix:v},fragmentShader:{log:H,prefix:g}})}s.deleteShader(S),s.deleteShader(E),_=new ta(s,p),M=aS(s,p)}let _;this.getUniforms=function(){return _===void 0&&b(this),_};let M;this.getAttributes=function(){return M===void 0&&b(this),M};let R=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return R===!1&&(R=s.getProgramParameter(p,Zv)),R},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(p),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Qv++,this.cacheKey=e,this.usedTimes=1,this.program=p,this.vertexShader=S,this.fragmentShader=E,this}let vS=0;class SS{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){const s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new MS(e),t.set(e,n)),n}}class MS{constructor(e){this.id=vS++,this.code=e,this.usedTimes=0}}function yS(i){return i===us||i===oa||i===aa}function bS(i,e,t,n,s,r){const o=new Qc,a=new SS,c=new Set,l=[],u=new Map,f=n.logarithmicDepthBuffer,h={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function d(_){return c.add(_),_===0?"uv":`uv${_}`}function p(_,M,R,w,C,N){const F=w.fog,I=C.geometry,B=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?w.environment:null,H=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,k=e.get(_.envMap||B,H),Q=h[_.type];let G=n.precision;_.precision!==null&&(G=n.getMaxPrecision(_.precision),G!==_.precision&&Ve("WebGLProgram.getParameters:",_.precision,"not supported, using",G,"instead."));const Z=I.morphAttributes.position||I.morphAttributes.normal||I.morphAttributes.color,V=Z!==void 0?Z.length:0;let ue=0;I.morphAttributes.position!==void 0&&(ue=1),I.morphAttributes.normal!==void 0&&(ue=2),I.morphAttributes.color!==void 0&&(ue=3);let Re,D,K,ne;if(Q){const Pe=jn[Q];Re=Pe.vertexShader,D=Pe.fragmentShader}else{Re=_.vertexShader,D=_.fragmentShader;const Pe=a.getVertexShaderStage(_),vt=a.getFragmentShaderStage(_);a.update(_,Pe,vt),K=Pe.id,ne=vt.id}const fe=i.getRenderTarget(),ce=i.state.buffers.depth.getReversed(),pe=C.isInstancedMesh===!0,He=C.isBatchedMesh===!0,se=!!_.map,ge=!!_.matcap,Ue=!!k,Y=Ue&&k.isPMREMTexture===!0,le=!!_.aoMap,ae=!!_.lightMap,ve=!!_.bumpMap&&_.wireframe===!1,j=!!_.normalMap,De=!!_.displacementMap,Ne=!!_.emissiveMap,$=!!_.metalnessMap,_e=!!_.roughnessMap,Ce=_.anisotropy>0,U=_.clearcoat>0,Ke=_.diffuseRoughness>0,Ye=_.dispersion>0,at=_.retroreflectivity>0,ye=_.iridescence>0,Ot=_.sheen>0,qe=_.transmission>0,Je=Ce&&!!_.anisotropyMap,P=U&&!!_.clearcoatMap,T=U&&!!_.clearcoatNormalMap,X=U&&!!_.clearcoatRoughnessMap,de=Ke&&!!_.diffuseRoughnessMap,oe=ye&&!!_.iridescenceMap,Se=ye&&!!_.iridescenceThicknessMap,we=Ot&&!!_.sheenColorMap,te=Ot&&!!_.sheenRoughnessMap,ie=!!_.specularMap,be=!!_.specularColorMap,O=!!_.specularIntensityMap,re=qe&&!!_.transmissionMap,ee=qe&&!!_.thicknessMap,Te=!!_.gradientMap,xe=!!_.alphaMap,Me=_.alphaTest>0,We=!!_.alphaHash,st=!!_.extensions;let me=Ri;_.toneMapped&&(fe===null||fe.isXRRenderTarget===!0)&&(me=i.toneMapping);const Xe=Y?k.isCompressedCubeTexture?k.image[0].mipmaps:k.mipmaps:null,nt={shaderID:Q,shaderType:_.type,shaderName:_.name,vertexShader:Re,fragmentShader:D,defines:_.defines,customVertexShaderID:K,customFragmentShaderID:ne,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:G,batching:He,batchingColor:He&&C._colorsTexture!==null,instancing:pe,instancingColor:pe&&C.instanceColor!==null,instancingMorph:pe&&C.morphTexture!==null,outputColorSpace:fe===null?i.outputColorSpace:fe.isXRRenderTarget===!0?fe.texture.colorSpace:ct.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:se,matcap:ge,envMap:Ue,envMapMode:Ue&&k.mapping,envMapPMREM:Y,envMapMaxLod:Y?Xe.length-1:null,envMapSize:Y?Xe[0].width:null,aoMap:le,lightMap:ae,bumpMap:ve,normalMap:j,displacementMap:De,emissiveMap:Ne,normalMapObjectSpace:j&&_.normalMapType===kp,normalMapTangentSpace:j&&_.normalMapType===la,packedNormalMap:j&&_.normalMapType===la&&yS(_.normalMap.format),metalnessMap:$,roughnessMap:_e,anisotropy:Ce,anisotropyMap:Je,clearcoat:U,clearcoatMap:P,clearcoatNormalMap:T,clearcoatRoughnessMap:X,diffuseRoughness:Ke,diffuseRoughnessMap:de,dispersion:Ye,retroreflection:at,iridescence:ye,iridescenceMap:oe,iridescenceThicknessMap:Se,sheen:Ot,sheenColorMap:we,sheenRoughnessMap:te,specularMap:ie,specularColorMap:be,specularIntensityMap:O,transmission:qe,transmissionMap:re,thicknessMap:ee,gradientMap:Te,opaque:_.transparent===!1&&_.blending===Ur&&_.alphaToCoverage===!1,alphaMap:xe,alphaTest:Me,alphaHash:We,combine:_.combine,mapUv:se&&d(_.map.channel),aoMapUv:le&&d(_.aoMap.channel),lightMapUv:ae&&d(_.lightMap.channel),bumpMapUv:ve&&d(_.bumpMap.channel),normalMapUv:j&&d(_.normalMap.channel),displacementMapUv:De&&d(_.displacementMap.channel),emissiveMapUv:Ne&&d(_.emissiveMap.channel),metalnessMapUv:$&&d(_.metalnessMap.channel),roughnessMapUv:_e&&d(_.roughnessMap.channel),anisotropyMapUv:Je&&d(_.anisotropyMap.channel),clearcoatMapUv:P&&d(_.clearcoatMap.channel),clearcoatNormalMapUv:T&&d(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:X&&d(_.clearcoatRoughnessMap.channel),diffuseRoughnessMapUv:de&&d(_.diffuseRoughnessMap.channel),iridescenceMapUv:oe&&d(_.iridescenceMap.channel),iridescenceThicknessMapUv:Se&&d(_.iridescenceThicknessMap.channel),sheenColorMapUv:we&&d(_.sheenColorMap.channel),sheenRoughnessMapUv:te&&d(_.sheenRoughnessMap.channel),specularMapUv:ie&&d(_.specularMap.channel),specularColorMapUv:be&&d(_.specularColorMap.channel),specularIntensityMapUv:O&&d(_.specularIntensityMap.channel),transmissionMapUv:re&&d(_.transmissionMap.channel),thicknessMapUv:ee&&d(_.thicknessMap.channel),alphaMapUv:xe&&d(_.alphaMap.channel),vertexTangents:!!I.attributes.tangent&&(j||Ce),vertexNormals:!!I.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!I.attributes.color&&I.attributes.color.itemSize===4,pointsUvs:C.isPoints===!0&&!!I.attributes.uv&&(se||xe),fog:!!F,useFog:_.fog===!0,fogExp2:!!F&&F.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||I.attributes.normal===void 0&&j===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:f,reversedDepthBuffer:ce,skinning:C.isSkinnedMesh===!0,hasPositionAttribute:I.attributes.position!==void 0,morphTargets:I.morphAttributes.position!==void 0,morphNormals:I.morphAttributes.normal!==void 0,morphColors:I.morphAttributes.color!==void 0,morphTargetsCount:V,morphTextureStride:ue,numSunLights:M.sun.length,numDirLights:M.directional.length,numPointLights:M.point.length,numSpotLights:M.spot.length,numSpotLightMaps:M.spotLightMap.length,numRectAreaLights:M.rectArea.length,numHemiLights:M.hemi.length,numSunLightShadows:M.sunShadowMap.length,numDirLightShadows:M.directionalShadowMap.length,numPointLightShadows:M.pointShadowMap.length,numSpotLightShadows:M.spotShadowMap.length,numSpotLightShadowsWithMaps:M.numSpotLightShadowsWithMaps,numLightProbes:M.numLightProbes,numLightProbeGrids:N.filter(Pe=>Pe.texture!==null).length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&R.length>0,shadowMapType:i.shadowMap.type,toneMapping:me,decodeVideoTexture:se&&_.map.isVideoTexture===!0&&ct.getTransfer(_.map.colorSpace)===St,decodeVideoTextureEmissive:Ne&&_.emissiveMap.isVideoTexture===!0&&ct.getTransfer(_.emissiveMap.colorSpace)===St,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Gn,flipSided:_.side===ln,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:st&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(st&&_.extensions.multiDraw===!0||He)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return nt.vertexUv1s=c.has(1),nt.vertexUv2s=c.has(2),nt.vertexUv3s=c.has(3),c.clear(),nt}function v(_){const M=[];if(_.shaderID?M.push(_.shaderID):(M.push(_.customVertexShaderID),M.push(_.customFragmentShaderID)),_.defines!==void 0)for(const R in _.defines)M.push(R),M.push(_.defines[R]);return _.isRawShaderMaterial===!1&&(g(M,_),m(M,_),M.push(i.outputColorSpace)),M.push(_.customProgramCacheKey),M.join()}function g(_,M){_.push(M.precision),_.push(M.outputColorSpace),_.push(M.envMapMode),_.push(M.envMapPMREM),_.push(M.envMapMaxLod),_.push(M.envMapSize),_.push(M.mapUv),_.push(M.alphaMapUv),_.push(M.lightMapUv),_.push(M.aoMapUv),_.push(M.bumpMapUv),_.push(M.normalMapUv),_.push(M.displacementMapUv),_.push(M.emissiveMapUv),_.push(M.metalnessMapUv),_.push(M.roughnessMapUv),_.push(M.anisotropyMapUv),_.push(M.clearcoatMapUv),_.push(M.clearcoatNormalMapUv),_.push(M.clearcoatRoughnessMapUv),_.push(M.diffuseRoughnessMapUv),_.push(M.iridescenceMapUv),_.push(M.iridescenceThicknessMapUv),_.push(M.sheenColorMapUv),_.push(M.sheenRoughnessMapUv),_.push(M.specularMapUv),_.push(M.specularColorMapUv),_.push(M.specularIntensityMapUv),_.push(M.transmissionMapUv),_.push(M.thicknessMapUv),_.push(M.combine),_.push(M.fogExp2),_.push(M.sizeAttenuation),_.push(M.morphTargetsCount),_.push(M.numSunLights),_.push(M.numDirLights),_.push(M.numPointLights),_.push(M.numSpotLights),_.push(M.numSpotLightMaps),_.push(M.numHemiLights),_.push(M.numRectAreaLights),_.push(M.numSunLightShadows),_.push(M.numDirLightShadows),_.push(M.numPointLightShadows),_.push(M.numSpotLightShadows),_.push(M.numSpotLightShadowsWithMaps),_.push(M.numLightProbes),_.push(M.numLightProbeGrids),_.push(M.shadowMapType),_.push(M.toneMapping),_.push(M.numClippingPlanes),_.push(M.numClipIntersection),_.push(M.depthPacking)}function m(_,M){o.disableAll(),M.instancing&&o.enable(0),M.instancingColor&&o.enable(1),M.instancingMorph&&o.enable(2),M.matcap&&o.enable(3),M.envMap&&o.enable(4),M.normalMapObjectSpace&&o.enable(5),M.normalMapTangentSpace&&o.enable(6),M.clearcoat&&o.enable(7),M.iridescence&&o.enable(8),M.alphaTest&&o.enable(9),M.vertexColors&&o.enable(10),M.vertexAlphas&&o.enable(11),M.vertexUv1s&&o.enable(12),M.vertexUv2s&&o.enable(13),M.vertexUv3s&&o.enable(14),M.vertexTangents&&o.enable(15),M.anisotropy&&o.enable(16),M.alphaHash&&o.enable(17),M.batching&&o.enable(18),M.dispersion&&o.enable(19),M.retroreflection&&o.enable(24),M.diffuseRoughness&&o.enable(25),M.batchingColor&&o.enable(20),M.gradientMap&&o.enable(21),M.packedNormalMap&&o.enable(22),M.vertexNormals&&o.enable(23),_.push(o.mask),o.disableAll(),M.fog&&o.enable(0),M.useFog&&o.enable(1),M.flatShading&&o.enable(2),M.logarithmicDepthBuffer&&o.enable(3),M.reversedDepthBuffer&&o.enable(4),M.skinning&&o.enable(5),M.morphTargets&&o.enable(6),M.morphNormals&&o.enable(7),M.morphColors&&o.enable(8),M.premultipliedAlpha&&o.enable(9),M.shadowMapEnabled&&o.enable(10),M.doubleSided&&o.enable(11),M.flipSided&&o.enable(12),M.useDepthPacking&&o.enable(13),M.dithering&&o.enable(14),M.transmission&&o.enable(15),M.sheen&&o.enable(16),M.opaque&&o.enable(17),M.pointsUvs&&o.enable(18),M.decodeVideoTexture&&o.enable(19),M.decodeVideoTextureEmissive&&o.enable(20),M.alphaToCoverage&&o.enable(21),M.numLightProbeGrids>0&&o.enable(22),M.hasPositionAttribute&&o.enable(23),_.push(o.mask)}function x(_){const M=h[_.type];let R;if(M){const w=jn[M];R=Sm.clone(w.uniforms)}else R=_.uniforms;return R}function y(_,M){let R=u.get(M);return R!==void 0?++R.usedTimes:(R=new xS(i,M,_,s),l.push(R),u.set(M,R)),R}function S(_){if(--_.usedTimes===0){const M=l.indexOf(_);l[M]=l[l.length-1],l.pop(),u.delete(_.cacheKey),_.destroy()}}function E(_){a.remove(_)}function b(){a.dispose()}return{getParameters:p,getProgramCacheKey:v,getUniforms:x,acquireProgram:y,releaseProgram:S,releaseShaderCache:E,programs:l,dispose:b}}function TS(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,c){i.get(o)[a]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function ES(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function rf(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function of(){const i=[];let e=0;const t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(h){let d=0;return h.isInstancedMesh&&(d+=2),h.isSkinnedMesh&&(d+=1),d}function a(h,d,p,v,g,m){let x=i[e];return x===void 0?(x={id:h.id,object:h,geometry:d,material:p,materialVariant:o(h),groupOrder:v,renderOrder:h.renderOrder,z:g,group:m},i[e]=x):(x.id=h.id,x.object=h,x.geometry=d,x.material=p,x.materialVariant=o(h),x.groupOrder=v,x.renderOrder=h.renderOrder,x.z=g,x.group=m),e++,x}function c(h,d,p,v,g,m,x){x.reversedDepth===!0&&(g=-g);const y=a(h,d,p,v,g,m);p.transmission>0?n.push(y):p.transparent===!0?s.push(y):t.push(y)}function l(h,d,p,v,g,m){const x=a(h,d,p,v,g,m);p.transmission>0?n.unshift(x):p.transparent===!0?s.unshift(x):t.unshift(x)}function u(h,d){t.length>1&&t.sort(h||ES),n.length>1&&n.sort(d||rf),s.length>1&&s.sort(d||rf)}function f(){for(let h=e,d=i.length;h<d;h++){const p=i[h];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:f,sort:u}}function wS(){let i=new WeakMap;function e(n,s){const r=i.get(n);let o;return r===void 0?(o=new of,i.set(n,[o])):s>=r.length?(o=new of,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function AS(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new L,color:new Oe};break;case"SpotLight":t={position:new L,direction:new L,color:new Oe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new L,color:new Oe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new L,skyColor:new Oe,groundColor:new Oe};break;case"RectAreaLight":t={color:new Oe,position:new L,halfWidth:new L,halfHeight:new L};break}return i[e.id]=t,t}}}function RS(){const i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new he,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}let CS=0;function PS(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function LS(i){const e=new AS,t=RS(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new L);const s=new L,r=new et,o=new et;function a(l){let u=0,f=0,h=0;for(let N=0;N<9;N++)n.probe[N].set(0,0,0);let d=0,p=0,v=0,g=0,m=0,x=0,y=0,S=0,E=0,b=0,_=0,M=0,R=0,w=0;l.sort(PS);for(let N=0,F=l.length;N<F;N++){const I=l[N],B=I.color,H=I.intensity,k=I.distance;let Q=null;if(I.shadow&&I.shadow.map&&(I.shadow.map.texture.format===us?Q=I.shadow.map.texture:Q=I.shadow.map.depthTexture||I.shadow.map.texture),I.isAmbientLight)u+=B.r*H,f+=B.g*H,h+=B.b*H;else if(I.isLightProbe){for(let G=0;G<9;G++)n.probe[G].addScaledVector(I.sh.coefficients[G],H);w++}else if(I.isSunLight){const G=e.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const Z=I.shadow,V=t.get(I);V.shadowIntensity=Z.intensity,V.shadowBias=Z.bias,V.shadowNormalBias=Z.normalBias,V.shadowRadius=Z.radius,V.shadowMapSize.copy(Z.mapSize).multiply(Z.getFrameExtents()),n.sunShadow[p]=V,n.sunShadowMap[p]=Q;const ue=Z.getViewportCount();for(let Re=0;Re<ue;Re++)n.sunShadowMatrix[v+Re]=Z.getMatrix(Re),n.sunShadowCascade[v+Re]=Z._cascadeData[Re];v+=ue,p++}n.sun[d]=G,d++}else if(I.isDirectionalLight){const G=e.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity),I.castShadow){const Z=I.shadow,V=t.get(I);V.shadowIntensity=Z.intensity,V.shadowBias=Z.bias,V.shadowNormalBias=Z.normalBias,V.shadowRadius=Z.radius,V.shadowMapSize=Z.mapSize,n.directionalShadow[g]=V,n.directionalShadowMap[g]=Q,n.directionalShadowMatrix[g]=I.shadow.matrix,E++}n.directional[g]=G,g++}else if(I.isSpotLight){const G=e.get(I);G.position.setFromMatrixPosition(I.matrixWorld),G.color.copy(B).multiplyScalar(H),G.distance=k,G.coneCos=Math.cos(I.angle),G.penumbraCos=Math.cos(I.angle*(1-I.penumbra)),G.decay=I.decay,n.spot[x]=G;const Z=I.shadow;if(I.map&&(n.spotLightMap[M]=I.map,M++,Z.updateMatrices(I),I.castShadow&&R++),n.spotLightMatrix[x]=Z.matrix,I.castShadow){const V=t.get(I);V.shadowIntensity=Z.intensity,V.shadowBias=Z.bias,V.shadowNormalBias=Z.normalBias,V.shadowRadius=Z.radius,V.shadowMapSize=Z.mapSize,n.spotShadow[x]=V,n.spotShadowMap[x]=Q,_++}x++}else if(I.isRectAreaLight){const G=e.get(I);G.color.copy(B).multiplyScalar(H),G.halfWidth.set(I.width*.5,0,0),G.halfHeight.set(0,I.height*.5,0),n.rectArea[y]=G,y++}else if(I.isPointLight){const G=e.get(I);if(G.color.copy(I.color).multiplyScalar(I.intensity),G.distance=I.distance,G.decay=I.decay,I.castShadow){const Z=I.shadow,V=t.get(I);V.shadowIntensity=Z.intensity,V.shadowBias=Z.bias,V.shadowNormalBias=Z.normalBias,V.shadowRadius=Z.radius,V.shadowMapSize=Z.mapSize,V.shadowCameraNear=Z.camera.near,V.shadowCameraFar=Z.camera.far,n.pointShadow[m]=V,n.pointShadowMap[m]=Q,n.pointShadowMatrix[m]=I.shadow.matrix,b++}n.point[m]=G,m++}else if(I.isHemisphereLight){const G=e.get(I);G.skyColor.copy(I.color).multiplyScalar(H),G.groundColor.copy(I.groundColor).multiplyScalar(H),n.hemi[S]=G,S++}}y>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Le.LTC_FLOAT_1,n.rectAreaLTC2=Le.LTC_FLOAT_2):(n.rectAreaLTC1=Le.LTC_HALF_1,n.rectAreaLTC2=Le.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=f,n.ambient[2]=h;const C=n.hash;(C.sunLength!==d||C.directionalLength!==g||C.pointLength!==m||C.spotLength!==x||C.rectAreaLength!==y||C.hemiLength!==S||C.numSunShadows!==p||C.numDirectionalShadows!==E||C.numPointShadows!==b||C.numSpotShadows!==_||C.numSpotMaps!==M||C.numLightProbes!==w)&&(n.sun.length=d,n.directional.length=g,n.spot.length=x,n.rectArea.length=y,n.point.length=m,n.hemi.length=S,n.sunShadow.length=p,n.sunShadowMap.length=p,n.sunShadowMatrix.length=v,n.sunShadowCascade.length=v,n.directionalShadow.length=E,n.directionalShadowMap.length=E,n.directionalShadowMatrix.length=E,n.pointShadow.length=b,n.pointShadowMap.length=b,n.pointShadowMatrix.length=b,n.spotShadow.length=_,n.spotShadowMap.length=_,n.spotLightMatrix.length=_+M-R,n.spotLightMap.length=M,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=w,C.sunLength=d,C.directionalLength=g,C.pointLength=m,C.spotLength=x,C.rectAreaLength=y,C.hemiLength=S,C.numSunShadows=p,C.numDirectionalShadows=E,C.numPointShadows=b,C.numSpotShadows=_,C.numSpotMaps=M,C.numLightProbes=w,n.version=CS++)}function c(l,u){let f=0,h=0,d=0,p=0,v=0,g=0;const m=u.matrixWorldInverse;for(let x=0,y=l.length;x<y;x++){const S=l[x];if(S.isSunLight){const E=n.sun[f];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(m),f++}else if(S.isDirectionalLight){const E=n.directional[h];E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),h++}else if(S.isSpotLight){const E=n.spot[p];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),E.direction.setFromMatrixPosition(S.matrixWorld),s.setFromMatrixPosition(S.target.matrixWorld),E.direction.sub(s),E.direction.transformDirection(m),p++}else if(S.isRectAreaLight){const E=n.rectArea[v];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),o.identity(),r.copy(S.matrixWorld),r.premultiply(m),o.extractRotation(r),E.halfWidth.set(S.width*.5,0,0),E.halfHeight.set(0,S.height*.5,0),E.halfWidth.applyMatrix4(o),E.halfHeight.applyMatrix4(o),v++}else if(S.isPointLight){const E=n.point[d];E.position.setFromMatrixPosition(S.matrixWorld),E.position.applyMatrix4(m),d++}else if(S.isHemisphereLight){const E=n.hemi[g];E.direction.setFromMatrixPosition(S.matrixWorld),E.direction.transformDirection(m),g++}}}return{setup:a,setupView:c,state:n}}function af(i){const e=new LS(i),t=[],n=[],s=[];function r(f){u.camera=f,t.length=0,n.length=0,s.length=0}function o(f){f.isLightProbeGrid?s.push(f):t.push(f)}function a(f){n.push(f)}function c(){e.setup(t),s.sort((f,h)=>f.priority-h.priority||f.id-h.id)}function l(f){e.setupView(t,f)}const u={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:u,setupLights:c,setupLightsView:l,pushLight:o,pushShadow:a}}function IS(i){let e=new WeakMap;function t(s,r=0){const o=e.get(s);let a;return o===void 0?(a=new af(i),e.set(s,[a])):r>=o.length?(a=new af(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const NS=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,DS=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,US=[new L(1,0,0),new L(-1,0,0),new L(0,1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1)],OS=[new L(0,-1,0),new L(0,-1,0),new L(0,0,1),new L(0,0,-1),new L(0,-1,0),new L(0,-1,0)],lf=new et,_r=new L,ml=new L;function FS(i,e,t){let n=new Qr;const s=new he,r=new he,o=new bt,a=new Em,c=new wm,l={},u=t.maxTextureSize,f={[Xi]:ln,[ln]:Xi,[Gn]:Gn},h=new Ki({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new he},radius:{value:4}},vertexShader:NS,fragmentShader:DS}),d=h.clone();d.defines.HORIZONTAL_PASS=1;const p=new It;p.setAttribute("position",new bn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const v=new mt(p,h),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Dr;let m=this.type;this.render=function(b,_,M){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||b.length===0)return;this.type===mp&&(Ve("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Dr);const R=i.getRenderTarget(),w=i.getActiveCubeFace(),C=i.getActiveMipmapLevel(),N=i.state;N.setBlending(ks),N.buffers.depth.getReversed()===!0?N.buffers.color.setClear(0,0,0,0):N.buffers.color.setClear(1,1,1,1),N.buffers.depth.setTest(!0),N.setScissorTest(!1);const F=m!==this.type;F&&_.traverse(function(I){I.material&&(Array.isArray(I.material)?I.material.forEach(B=>B.needsUpdate=!0):I.material.needsUpdate=!0)});for(let I=0,B=b.length;I<B;I++){const H=b[I],k=H.shadow;if(k===void 0){Ve("WebGLShadowMap:",H,"has no shadow.");continue}if(k.autoUpdate===!1&&k.needsUpdate===!1)continue;s.copy(k.mapSize);const Q=k.getFrameExtents();s.multiply(Q),r.copy(k.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/Q.x),s.x=r.x*Q.x,k.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/Q.y),s.y=r.y*Q.y,k.mapSize.y=r.y));const G=i.state.buffers.depth.getReversed();if(k.camera._reversedDepth=G,k.map===null||F===!0){if(k.map!==null&&(k.map.depthTexture!==null&&(k.map.depthTexture.dispose(),k.map.depthTexture=null),k.map.dispose()),this.type===wr){if(H.isPointLight){Ve("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}k.map=new Nn(s.x,s.y,{format:us,type:Un,minFilter:jt,magFilter:jt,generateMipmaps:!1}),k.map.texture.name=H.name+".shadowMap",k.map.depthTexture=new $s(s.x,s.y,Ln),k.map.depthTexture.name=H.name+".shadowMapDepth",k.map.depthTexture.format=Yi,k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Gt,k.map.depthTexture.magFilter=Gt}else H.isPointLight?(k.map=new gu(s.x),k.map.depthTexture=new _d(s.x,ni)):(k.map=new Nn(s.x,s.y),k.map.depthTexture=new $s(s.x,s.y,ni)),k.map.depthTexture.name=H.name+".shadowMap",k.map.depthTexture.format=Yi,this.type===Dr?(k.map.depthTexture.compareFunction=G?td:ed,k.map.depthTexture.minFilter=jt,k.map.depthTexture.magFilter=jt):(k.map.depthTexture.compareFunction=null,k.map.depthTexture.minFilter=Gt,k.map.depthTexture.magFilter=Gt);k.camera.updateProjectionMatrix()}k.map.isWebGLCubeRenderTarget!==!0&&(k.map.width!==s.x||k.map.height!==s.y)&&k.map.setSize(s.x,s.y);const Z=k.map.isWebGLCubeRenderTarget?6:k.getViewportCount();H.isPointLight!==!0&&k.updateMatrices(H,M);const V=(k.camera.layers.mask&4294967294)!==0?k.camera.layers:M.layers;for(let ue=0;ue<Z;ue++){const Re=k.getCamera(ue);if(H.isPointLight){const D=k.camera,K=k.matrix,ne=H.distance||D.far;ne!==D.far&&(D.far=ne,D.updateProjectionMatrix()),_r.setFromMatrixPosition(H.matrixWorld),D.position.copy(_r),ml.copy(D.position),ml.add(US[ue]),D.up.copy(OS[ue]),D.lookAt(ml),D.updateMatrixWorld(),K.makeTranslation(-_r.x,-_r.y,-_r.z),lf.multiplyMatrices(D.projectionMatrix,D.matrixWorldInverse),k._frustum.setFromProjectionMatrix(lf,D.coordinateSystem,D.reversedDepth)}if(k.map.isWebGLCubeRenderTarget)i.setRenderTarget(k.map,ue),i.clear();else{ue===0&&(i.setRenderTarget(k.map),i.clear());const D=k.getViewport(ue);o.set(r.x*D.x,r.y*D.y,r.x*D.z,r.y*D.w),N.viewport(o)}n=k.getFrustum(ue),S(_,M,Re,H,V,this.type)}k.isPointLightShadow!==!0&&this.type===wr&&x(k,M),k.needsUpdate=!1}m=this.type,g.needsUpdate=!1,i.setRenderTarget(R,w,C)};function x(b,_){const M=e.update(v);h.defines.VSM_SAMPLES!==b.blurSamples&&(h.defines.VSM_SAMPLES=b.blurSamples,d.defines.VSM_SAMPLES=b.blurSamples,h.needsUpdate=!0,d.needsUpdate=!0),b.mapPass===null?b.mapPass=new Nn(s.x,s.y,{format:us,type:Un}):(b.mapPass.width!==b.map.width||b.mapPass.height!==b.map.height)&&b.mapPass.setSize(b.map.width,b.map.height),h.uniforms.shadow_pass.value=b.map.depthTexture,h.uniforms.resolution.value.set(b.map.width,b.map.height),h.uniforms.radius.value=b.radius,i.setRenderTarget(b.mapPass),i.clear(),i.renderBufferDirect(_,null,M,h,v,null),d.uniforms.shadow_pass.value=b.mapPass.texture,d.uniforms.resolution.value.set(b.map.width,b.map.height),d.uniforms.radius.value=b.radius,i.setRenderTarget(b.map),i.clear(),i.renderBufferDirect(_,null,M,d,v,null)}function y(b,_,M,R){let w=null;const C=M.isPointLight===!0?b.customDistanceMaterial:b.customDepthMaterial;if(C!==void 0)w=C;else if(w=M.isPointLight===!0?c:a,i.localClippingEnabled&&_.clipShadows===!0&&Array.isArray(_.clippingPlanes)&&_.clippingPlanes.length!==0||_.displacementMap&&_.displacementScale!==0||_.alphaMap&&_.alphaTest>0||_.map&&_.alphaTest>0||_.alphaToCoverage===!0){const N=w.uuid,F=_.uuid;let I=l[N];I===void 0&&(I={},l[N]=I);let B=I[F];B===void 0&&(B=w.clone(),I[F]=B,_.addEventListener("dispose",E)),w=B}if(w.visible=_.visible,w.wireframe=_.wireframe,R===wr?w.side=_.shadowSide!==null?_.shadowSide:_.side:w.side=_.shadowSide!==null?_.shadowSide:f[_.side],w.alphaMap=_.alphaMap,w.alphaTest=_.alphaToCoverage===!0?.5:_.alphaTest,w.map=_.map,w.clipShadows=_.clipShadows,w.clippingPlanes=_.clippingPlanes,w.clipIntersection=_.clipIntersection,w.displacementMap=_.displacementMap,w.displacementScale=_.displacementScale,w.displacementBias=_.displacementBias,w.wireframeLinewidth=_.wireframeLinewidth,w.linewidth=_.linewidth,M.isPointLight===!0&&w.isMeshDistanceMaterial===!0){const N=i.properties.get(w);N.light=M}return w}function S(b,_,M,R,w,C){if(b.visible===!1)return;if(b.layers.test(w)&&(b.isMesh||b.isLine||b.isPoints)&&(b.castShadow||b.receiveShadow&&C===wr)&&(!b.frustumCulled||b.intersectsFrustum(n))){b.modelViewMatrix.multiplyMatrices(M.matrixWorldInverse,b.matrixWorld);const I=e.update(b),B=b.material;if(Array.isArray(B)){const H=I.groups;for(let k=0,Q=H.length;k<Q;k++){const G=H[k],Z=B[G.materialIndex];if(Z&&Z.visible){const V=y(b,Z,R,C);b.onBeforeShadow(i,b,_,M,I,V,G),i.renderBufferDirect(M,null,I,V,b,G),b.onAfterShadow(i,b,_,M,I,V,G)}}}else if(B.visible){const H=y(b,B,R,C);b.onBeforeShadow(i,b,_,M,I,H,null),i.renderBufferDirect(M,null,I,H,b,null),b.onAfterShadow(i,b,_,M,I,H,null)}}const F=b.children;for(let I=0,B=F.length;I<B;I++)S(F[I],_,M,R,w,C)}function E(b){b.target.removeEventListener("dispose",E);for(const M in l){const R=l[M],w=b.target.uuid;w in R&&(R[w].dispose(),delete R[w])}}}function BS(i,e){function t(){let O=!1;const re=new bt;let ee=null;const Te=new bt(0,0,0,0);return{setMask:function(xe){ee!==xe&&!O&&(i.colorMask(xe,xe,xe,xe),ee=xe)},setLocked:function(xe){O=xe},setClear:function(xe,Me,We,st,me){me===!0&&(xe*=st,Me*=st,We*=st),re.set(xe,Me,We,st),Te.equals(re)===!1&&(i.clearColor(xe,Me,We,st),Te.copy(re))},reset:function(){O=!1,ee=null,Te.set(-1,0,0,0)}}}function n(){let O=!1,re=!1,ee=null,Te=null,xe=null;return{setReversed:function(Me){if(re!==Me){const We=e.get("EXT_clip_control");Me?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT),re=Me;const st=xe;xe=null,this.setClear(st)}},getReversed:function(){return re},setTest:function(Me){Me?ce(i.DEPTH_TEST):pe(i.DEPTH_TEST)},setMask:function(Me){ee!==Me&&!O&&(i.depthMask(Me),ee=Me)},setFunc:function(Me){if(re&&(Me=Zp[Me]),Te!==Me){switch(Me){case Nl:i.depthFunc(i.NEVER);break;case Dl:i.depthFunc(i.ALWAYS);break;case Ul:i.depthFunc(i.LESS);break;case Wr:i.depthFunc(i.LEQUAL);break;case Ol:i.depthFunc(i.EQUAL);break;case Fl:i.depthFunc(i.GEQUAL);break;case Bl:i.depthFunc(i.GREATER);break;case zl:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Te=Me}},setLocked:function(Me){O=Me},setClear:function(Me){xe!==Me&&(xe=Me,re&&(Me=1-Me),i.clearDepth(Me))},reset:function(){O=!1,ee=null,Te=null,xe=null,re=!1}}}function s(){let O=!1,re=null,ee=null,Te=null,xe=null,Me=null,We=null,st=null,me=null;return{setTest:function(Xe){O||(Xe?ce(i.STENCIL_TEST):pe(i.STENCIL_TEST))},setMask:function(Xe){re!==Xe&&!O&&(i.stencilMask(Xe),re=Xe)},setFunc:function(Xe,nt,Pe){(ee!==Xe||Te!==nt||xe!==Pe)&&(i.stencilFunc(Xe,nt,Pe),ee=Xe,Te=nt,xe=Pe)},setOp:function(Xe,nt,Pe){(Me!==Xe||We!==nt||st!==Pe)&&(i.stencilOp(Xe,nt,Pe),Me=Xe,We=nt,st=Pe)},setLocked:function(Xe){O=Xe},setClear:function(Xe){me!==Xe&&(i.clearStencil(Xe),me=Xe)},reset:function(){O=!1,re=null,ee=null,Te=null,xe=null,Me=null,We=null,st=null,me=null}}}const r=new t,o=new n,a=new s;let c={};const l=new WeakMap;let u={},f={},h={},d=new WeakMap,p=[],v=null,g=!1,m=null,x=null,y=null,S=null,E=null,b=null,_=null,M=new Oe(0,0,0),R=0,w=!1,C=null,N=null,F=null,I=null,B=null;const H=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let k=!1,Q=0;const G=i.getParameter(i.VERSION);G.indexOf("WebGL")!==-1?(Q=parseFloat(/^WebGL (\d)/.exec(G)[1]),k=Q>=1):G.indexOf("OpenGL ES")!==-1&&(Q=parseFloat(/^OpenGL ES (\d)/.exec(G)[1]),k=Q>=2);let Z=null,V={};const ue=i.getParameter(i.SCISSOR_BOX),Re=i.getParameter(i.VIEWPORT),D=new bt().fromArray(ue),K=new bt().fromArray(Re);function ne(O,re,ee,Te){const xe=new Uint8Array(4),Me=i.createTexture();i.bindTexture(O,Me),i.texParameteri(O,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(O,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let We=0;We<ee;We++)O===i.TEXTURE_3D||O===i.TEXTURE_2D_ARRAY?i.texImage3D(re,0,i.RGBA,1,1,Te,0,i.RGBA,i.UNSIGNED_BYTE,xe):i.texImage2D(re+We,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,xe);return Me}const fe={};fe[i.TEXTURE_2D]=ne(i.TEXTURE_2D,i.TEXTURE_2D,1),fe[i.TEXTURE_CUBE_MAP]=ne(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),fe[i.TEXTURE_2D_ARRAY]=ne(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),fe[i.TEXTURE_3D]=ne(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ce(i.DEPTH_TEST),o.setFunc(Wr),ve(!1),j(Uu),ce(i.CULL_FACE),le(ks);function ce(O){u[O]!==!0&&(i.enable(O),u[O]=!0)}function pe(O){u[O]!==!1&&(i.disable(O),u[O]=!1)}function He(O,re){return h[O]!==re?(i.bindFramebuffer(O,re),h[O]=re,O===i.DRAW_FRAMEBUFFER&&(h[i.FRAMEBUFFER]=re),O===i.FRAMEBUFFER&&(h[i.DRAW_FRAMEBUFFER]=re),!0):!1}function se(O,re){let ee=p,Te=!1;if(O){ee=d.get(re),ee===void 0&&(ee=[],d.set(re,ee));const xe=O.textures;if(ee.length!==xe.length||ee[0]!==i.COLOR_ATTACHMENT0){for(let Me=0,We=xe.length;Me<We;Me++)ee[Me]=i.COLOR_ATTACHMENT0+Me;ee.length=xe.length,Te=!0}}else ee[0]!==i.BACK&&(ee[0]=i.BACK,Te=!0);Te&&i.drawBuffers(ee)}function ge(O){return v!==O?(i.useProgram(O),v=O,!0):!1}const Ue={[Fs]:i.FUNC_ADD,[_p]:i.FUNC_SUBTRACT,[xp]:i.FUNC_REVERSE_SUBTRACT};Ue[vp]=i.MIN,Ue[Sp]=i.MAX;const Y={[Mp]:i.ZERO,[yp]:i.ONE,[bp]:i.SRC_COLOR,[Ff]:i.SRC_ALPHA,[Cp]:i.SRC_ALPHA_SATURATE,[Ap]:i.DST_COLOR,[Ep]:i.DST_ALPHA,[Tp]:i.ONE_MINUS_SRC_COLOR,[Bf]:i.ONE_MINUS_SRC_ALPHA,[Rp]:i.ONE_MINUS_DST_COLOR,[wp]:i.ONE_MINUS_DST_ALPHA,[Pp]:i.CONSTANT_COLOR,[Lp]:i.ONE_MINUS_CONSTANT_COLOR,[Ip]:i.CONSTANT_ALPHA,[Np]:i.ONE_MINUS_CONSTANT_ALPHA};function le(O,re,ee,Te,xe,Me,We,st,me,Xe){if(O===ks){g===!0&&(pe(i.BLEND),g=!1);return}if(g===!1&&(ce(i.BLEND),g=!0),O!==gp){if(O!==m||Xe!==w){if((x!==Fs||E!==Fs)&&(i.blendEquation(i.FUNC_ADD),x=Fs,E=Fs),Xe)switch(O){case Ur:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Il:i.blendFunc(i.ONE,i.ONE);break;case Ou:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Fu:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:$e("WebGLState: Invalid blending: ",O);break}else switch(O){case Ur:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Il:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Ou:$e("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Fu:$e("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:$e("WebGLState: Invalid blending: ",O);break}y=null,S=null,b=null,_=null,M.set(0,0,0),R=0,m=O,w=Xe}return}xe=xe||re,Me=Me||ee,We=We||Te,(re!==x||xe!==E)&&(i.blendEquationSeparate(Ue[re],Ue[xe]),x=re,E=xe),(ee!==y||Te!==S||Me!==b||We!==_)&&(i.blendFuncSeparate(Y[ee],Y[Te],Y[Me],Y[We]),y=ee,S=Te,b=Me,_=We),(st.equals(M)===!1||me!==R)&&(i.blendColor(st.r,st.g,st.b,me),M.copy(st),R=me),m=O,w=!1}function ae(O,re){O.side===Gn?pe(i.CULL_FACE):ce(i.CULL_FACE);let ee=O.side===ln;re&&(ee=!ee),ve(ee),O.blending===Ur&&O.transparent===!1?le(ks):le(O.blending,O.blendEquation,O.blendSrc,O.blendDst,O.blendEquationAlpha,O.blendSrcAlpha,O.blendDstAlpha,O.blendColor,O.blendAlpha,O.premultipliedAlpha),o.setFunc(O.depthFunc),o.setTest(O.depthTest),o.setMask(O.depthWrite),r.setMask(O.colorWrite);const Te=O.stencilWrite;a.setTest(Te),Te&&(a.setMask(O.stencilWriteMask),a.setFunc(O.stencilFunc,O.stencilRef,O.stencilFuncMask),a.setOp(O.stencilFail,O.stencilZFail,O.stencilZPass)),Ne(O.polygonOffset,O.polygonOffsetFactor,O.polygonOffsetUnits),O.alphaToCoverage===!0?ce(i.SAMPLE_ALPHA_TO_COVERAGE):pe(i.SAMPLE_ALPHA_TO_COVERAGE)}function ve(O){C!==O&&(O?i.frontFace(i.CW):i.frontFace(i.CCW),C=O)}function j(O){O!==dp?(ce(i.CULL_FACE),O!==N&&(O===Uu?i.cullFace(i.BACK):O===pp?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):pe(i.CULL_FACE),N=O}function De(O){O!==F&&(k&&i.lineWidth(O),F=O)}function Ne(O,re,ee){O?(ce(i.POLYGON_OFFSET_FILL),(I!==re||B!==ee)&&(I=re,B=ee,o.getReversed()&&(re=-re,ee=-ee),i.polygonOffset(re,ee))):pe(i.POLYGON_OFFSET_FILL)}function $(O){O?ce(i.SCISSOR_TEST):pe(i.SCISSOR_TEST)}function _e(O){O===void 0&&(O=i.TEXTURE0+H-1),Z!==O&&(i.activeTexture(O),Z=O)}function Ce(O,re,ee){ee===void 0&&(Z===null?ee=i.TEXTURE0+H-1:ee=Z);let Te=V[ee];Te===void 0&&(Te={type:void 0,texture:void 0},V[ee]=Te),(Te.type!==O||Te.texture!==re)&&(Z!==ee&&(i.activeTexture(ee),Z=ee),i.bindTexture(O,re||fe[O]),Te.type=O,Te.texture=re)}function U(){const O=V[Z];O!==void 0&&O.type!==void 0&&(i.bindTexture(O.type,null),O.type=void 0,O.texture=void 0)}function Ke(){try{i.compressedTexImage2D(...arguments)}catch(O){$e("WebGLState:",O)}}function Ye(){try{i.compressedTexImage3D(...arguments)}catch(O){$e("WebGLState:",O)}}function at(){try{i.texSubImage2D(...arguments)}catch(O){$e("WebGLState:",O)}}function ye(){try{i.texSubImage3D(...arguments)}catch(O){$e("WebGLState:",O)}}function Ot(){try{i.compressedTexSubImage2D(...arguments)}catch(O){$e("WebGLState:",O)}}function qe(){try{i.compressedTexSubImage3D(...arguments)}catch(O){$e("WebGLState:",O)}}function Je(){try{i.texStorage2D(...arguments)}catch(O){$e("WebGLState:",O)}}function P(){try{i.texStorage3D(...arguments)}catch(O){$e("WebGLState:",O)}}function T(){try{i.texImage2D(...arguments)}catch(O){$e("WebGLState:",O)}}function X(){try{i.texImage3D(...arguments)}catch(O){$e("WebGLState:",O)}}function de(O){return f[O]!==void 0?f[O]:i.getParameter(O)}function oe(O,re){f[O]!==re&&(i.pixelStorei(O,re),f[O]=re)}function Se(O){D.equals(O)===!1&&(i.scissor(O.x,O.y,O.z,O.w),D.copy(O))}function we(O){K.equals(O)===!1&&(i.viewport(O.x,O.y,O.z,O.w),K.copy(O))}function te(O,re){let ee=l.get(re);ee===void 0&&(ee=new WeakMap,l.set(re,ee));let Te=ee.get(O);Te===void 0&&(Te=i.getUniformBlockIndex(re,O.name),i.uniformBlockBinding(re,Te,Te),ee.set(O,Te))}function ie(O,re,ee){const xe=l.get(re).get(O);c[xe]!==ee&&(i.bindBufferBase(i.UNIFORM_BUFFER,xe,ee),c[xe]=ee)}function be(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),u={},f={},Z=null,V={},h={},c={},d=new WeakMap,p=[],v=null,g=!1,m=null,x=null,y=null,S=null,E=null,b=null,_=null,M=new Oe(0,0,0),R=0,w=!1,C=null,N=null,F=null,I=null,B=null,D.set(0,0,i.canvas.width,i.canvas.height),K.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ce,disable:pe,bindFramebuffer:He,drawBuffers:se,useProgram:ge,setBlending:le,setMaterial:ae,setFlipSided:ve,setCullFace:j,setLineWidth:De,setPolygonOffset:Ne,setScissorTest:$,activeTexture:_e,bindTexture:Ce,unbindTexture:U,compressedTexImage2D:Ke,compressedTexImage3D:Ye,texImage2D:T,texImage3D:X,pixelStorei:oe,getParameter:de,updateUBOMapping:te,uniformBlockBinding:ie,texStorage2D:Je,texStorage3D:P,texSubImage2D:at,texSubImage3D:ye,compressedTexSubImage2D:Ot,compressedTexSubImage3D:qe,scissor:Se,viewport:we,reset:be}}function zS(i,e,t,n,s,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new he,u=new WeakMap,f=new Set;let h;const d=new WeakMap,p=new Set,v=new FinalizationRegistry(P=>p.delete(P));let g=!1;try{g=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function m(P,T){return g?new OffscreenCanvas(P,T):Jr("canvas")}function x(P,T,X){let de=1;const oe=Je(P);if((oe.width>X||oe.height>X)&&(de=X/Math.max(oe.width,oe.height)),de<1)if(typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&P instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&P instanceof ImageBitmap||typeof VideoFrame<"u"&&P instanceof VideoFrame){const Se=Math.floor(de*oe.width),we=Math.floor(de*oe.height);h===void 0&&(h=m(Se,we));const te=T?m(Se,we):h;return te.width=Se,te.height=we,te.getContext("2d").drawImage(P,0,0,Se,we),Ve("WebGLRenderer: Texture has been resized from ("+oe.width+"x"+oe.height+") to ("+Se+"x"+we+")."),te}else return"data"in P&&Ve("WebGLRenderer: Image in DataTexture is too big ("+oe.width+"x"+oe.height+")."),P;return P}function y(P){return P.generateMipmaps}function S(P){i.generateMipmap(P)}function E(P){return P.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:P.isWebGL3DRenderTarget?i.TEXTURE_3D:P.isWebGLArrayRenderTarget||P.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function b(P,T,X,de,oe,Se=!1){if(P!==null){if(i[P]!==void 0)return i[P];Ve("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+P+"'")}let we;de&&(we=e.get("EXT_texture_norm16"),we||Ve("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let te=T;if(T===i.RED&&(X===i.FLOAT&&(te=i.R32F),X===i.HALF_FLOAT&&(te=i.R16F),X===i.UNSIGNED_BYTE&&(te=i.R8),X===i.UNSIGNED_SHORT&&we&&(te=we.R16_EXT),X===i.SHORT&&we&&(te=we.R16_SNORM_EXT)),T===i.RED_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.R8UI),X===i.UNSIGNED_SHORT&&(te=i.R16UI),X===i.UNSIGNED_INT&&(te=i.R32UI),X===i.BYTE&&(te=i.R8I),X===i.SHORT&&(te=i.R16I),X===i.INT&&(te=i.R32I)),T===i.RG&&(X===i.FLOAT&&(te=i.RG32F),X===i.HALF_FLOAT&&(te=i.RG16F),X===i.UNSIGNED_BYTE&&(te=i.RG8),X===i.UNSIGNED_SHORT&&we&&(te=we.RG16_EXT),X===i.SHORT&&we&&(te=we.RG16_SNORM_EXT)),T===i.RG_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.RG8UI),X===i.UNSIGNED_SHORT&&(te=i.RG16UI),X===i.UNSIGNED_INT&&(te=i.RG32UI),X===i.BYTE&&(te=i.RG8I),X===i.SHORT&&(te=i.RG16I),X===i.INT&&(te=i.RG32I)),T===i.RGB_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.RGB8UI),X===i.UNSIGNED_SHORT&&(te=i.RGB16UI),X===i.UNSIGNED_INT&&(te=i.RGB32UI),X===i.BYTE&&(te=i.RGB8I),X===i.SHORT&&(te=i.RGB16I),X===i.INT&&(te=i.RGB32I)),T===i.RGBA_INTEGER&&(X===i.UNSIGNED_BYTE&&(te=i.RGBA8UI),X===i.UNSIGNED_SHORT&&(te=i.RGBA16UI),X===i.UNSIGNED_INT&&(te=i.RGBA32UI),X===i.BYTE&&(te=i.RGBA8I),X===i.SHORT&&(te=i.RGBA16I),X===i.INT&&(te=i.RGBA32I)),T===i.RGB&&(X===i.UNSIGNED_SHORT&&we&&(te=we.RGB16_EXT),X===i.SHORT&&we&&(te=we.RGB16_SNORM_EXT),X===i.UNSIGNED_INT_5_9_9_9_REV&&(te=i.RGB9_E5),X===i.UNSIGNED_INT_10F_11F_11F_REV&&(te=i.R11F_G11F_B10F)),T===i.RGBA){const ie=Se?ca:ct.getTransfer(oe);X===i.FLOAT&&(te=i.RGBA32F),X===i.HALF_FLOAT&&(te=i.RGBA16F),X===i.UNSIGNED_BYTE&&(te=ie===St?i.SRGB8_ALPHA8:i.RGBA8),X===i.UNSIGNED_SHORT&&we&&(te=we.RGBA16_EXT),X===i.SHORT&&we&&(te=we.RGBA16_SNORM_EXT),X===i.UNSIGNED_SHORT_4_4_4_4&&(te=i.RGBA4),X===i.UNSIGNED_SHORT_5_5_5_1&&(te=i.RGB5_A1)}return(te===i.R16F||te===i.R32F||te===i.RG16F||te===i.RG32F||te===i.RGBA16F||te===i.RGBA32F)&&e.get("EXT_color_buffer_float"),te}function _(P,T){let X;return P?T===null||T===ni||T===Ys?X=i.DEPTH24_STENCIL8:T===Ln?X=i.DEPTH32F_STENCIL8:T===qr&&(X=i.DEPTH24_STENCIL8,Ve("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):T===null||T===ni||T===Ys?X=i.DEPTH_COMPONENT24:T===Ln?X=i.DEPTH_COMPONENT32F:T===qr&&(X=i.DEPTH_COMPONENT16),X}function M(P,T){return y(P)===!0||P.isFramebufferTexture&&P.minFilter!==Gt&&P.minFilter!==jt?Math.log2(Math.max(T.width,T.height))+1:P.mipmaps.length>0?P.mipmaps.length:P.isCompressedTexture&&Array.isArray(P.image)?T.mipmaps.length:1}function R(P){const T=new WeakRef(P);n.get(P).__ref=T,p.add(T),v.register(P,T,T)}function w(P){const T=n.get(P).__ref;T!==void 0&&(p.delete(T),v.unregister(T))}function C(P){F(P.target)}function N(P){I(P.target)}function F(P){P.removeEventListener("dispose",C),w(P),H(P),P.isVideoTexture&&u.delete(P),P.isHTMLTexture&&f.delete(P)}function I(P){P.removeEventListener("dispose",N),w(P),Q(P)}function B(){for(const P of p){const T=P.deref();T!==void 0&&(T.isRenderTarget===!0?I(T):F(T))}p.clear(),f.clear()}function H(P){const T=n.get(P);if(T.__webglInit===void 0)return;const X=P.source,de=d.get(X);if(de){const oe=de[T.__cacheKey];oe.usedTimes--,oe.usedTimes===0&&k(P),Object.keys(de).length===0&&d.delete(X)}n.remove(P)}function k(P){const T=n.get(P);i.deleteTexture(T.__webglTexture);const X=P.source,de=d.get(X);delete de[T.__cacheKey],o.memory.textures--}function Q(P){const T=n.get(P);T.__depthDisposeCallback&&T.__depthDisposeCallback();const X=P.depthTexture;if(X&&X.renderTarget===P&&F(X),P.isWebGLCubeRenderTarget)for(let oe=0;oe<6;oe++){if(Array.isArray(T.__webglFramebuffer[oe]))for(let Se=0;Se<T.__webglFramebuffer[oe].length;Se++)i.deleteFramebuffer(T.__webglFramebuffer[oe][Se]);else i.deleteFramebuffer(T.__webglFramebuffer[oe]);T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer[oe])}else{if(Array.isArray(T.__webglFramebuffer))for(let oe=0;oe<T.__webglFramebuffer.length;oe++)i.deleteFramebuffer(T.__webglFramebuffer[oe]);else i.deleteFramebuffer(T.__webglFramebuffer);if(T.__webglDepthbuffer&&i.deleteRenderbuffer(T.__webglDepthbuffer),T.__webglMultisampledFramebuffer&&i.deleteFramebuffer(T.__webglMultisampledFramebuffer),T.__webglColorRenderbuffer)for(let oe=0;oe<T.__webglColorRenderbuffer.length;oe++)T.__webglColorRenderbuffer[oe]&&i.deleteRenderbuffer(T.__webglColorRenderbuffer[oe]);T.__webglDepthRenderbuffer&&i.deleteRenderbuffer(T.__webglDepthRenderbuffer)}const de=P.textures;for(let oe=0,Se=de.length;oe<Se;oe++){const we=n.get(de[oe]);we.__webglTexture&&(i.deleteTexture(we.__webglTexture),o.memory.textures--),n.remove(de[oe])}n.remove(P)}let G=0;function Z(){G=0}function V(){return G}function ue(P){G=P}function Re(){const P=G;return P>=s.maxTextures&&Ve("WebGLTextures: Trying to use "+(P+1)+" texture units while this GPU supports only "+s.maxTextures),G+=1,P}function D(P){const T=[];return T.push(P.wrapS),T.push(P.wrapT),T.push(P.wrapR||0),T.push(P.magFilter),T.push(P.minFilter),T.push(P.anisotropy),T.push(P.internalFormat),T.push(P.format),T.push(P.type),T.push(P.generateMipmaps),T.push(P.mipmapsAutoUpdate),T.push(P.premultiplyAlpha),T.push(P.flipY),T.push(P.unpackAlignment),T.push(P.colorSpace),T.join()}function K(P,T){const X=n.get(P);if(P.isVideoTexture&&Ot(P),P.isRenderTargetTexture===!1&&P.isExternalTexture!==!0&&P.version>0&&X.__version!==P.version){const de=P.image;if(de===null)Ve("WebGLRenderer: Texture marked for update but no image data found.");else if(de.complete===!1)Ve("WebGLRenderer: Texture marked for update but image is incomplete");else{ae(X,P,T);return}}else P.isExternalTexture&&(X.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,X.__webglTexture,i.TEXTURE0+T)}function ne(P,T){const X=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&X.__version!==P.version){ae(X,P,T);return}else P.isExternalTexture&&(X.__webglTexture=P.sourceTexture?P.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,X.__webglTexture,i.TEXTURE0+T)}function fe(P,T){const X=n.get(P);if(P.isRenderTargetTexture===!1&&P.version>0&&X.__version!==P.version){ae(X,P,T);return}t.bindTexture(i.TEXTURE_3D,X.__webglTexture,i.TEXTURE0+T)}function ce(P,T){const X=n.get(P);if(P.version>0&&X.__version!==P.version){ve(X,P,T);return}t.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture,i.TEXTURE0+T)}const pe={[qi]:i.REPEAT,[ei]:i.CLAMP_TO_EDGE,[ra]:i.MIRRORED_REPEAT},He={[Gt]:i.NEAREST,[qf]:i.NEAREST_MIPMAP_NEAREST,[Ar]:i.NEAREST_MIPMAP_LINEAR,[jt]:i.LINEAR,[Jo]:i.LINEAR_MIPMAP_NEAREST,[ti]:i.LINEAR_MIPMAP_LINEAR},se={[Gp]:i.NEVER,[nd]:i.ALWAYS,[Vp]:i.LESS,[ed]:i.LEQUAL,[Wp]:i.EQUAL,[td]:i.GEQUAL,[Xp]:i.GREATER,[qp]:i.NOTEQUAL};function ge(P,T){if(T.type===Ln&&e.has("OES_texture_float_linear")===!1&&(T.magFilter===jt||T.magFilter===Jo||T.magFilter===Ar||T.magFilter===ti||T.minFilter===jt||T.minFilter===Jo||T.minFilter===Ar||T.minFilter===ti)&&Ve("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(P,i.TEXTURE_WRAP_S,pe[T.wrapS]),i.texParameteri(P,i.TEXTURE_WRAP_T,pe[T.wrapT]),(P===i.TEXTURE_3D||P===i.TEXTURE_2D_ARRAY)&&i.texParameteri(P,i.TEXTURE_WRAP_R,pe[T.wrapR]),i.texParameteri(P,i.TEXTURE_MAG_FILTER,He[T.magFilter]),i.texParameteri(P,i.TEXTURE_MIN_FILTER,He[T.minFilter]),T.compareFunction&&(i.texParameteri(P,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(P,i.TEXTURE_COMPARE_FUNC,se[T.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(T.magFilter===Gt||T.minFilter!==Ar&&T.minFilter!==ti||T.type===Ln&&e.has("OES_texture_float_linear")===!1)return;if(T.anisotropy>1||n.get(T).__currentAnisotropy){const X=e.get("EXT_texture_filter_anisotropic");i.texParameterf(P,X.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(T.anisotropy,s.getMaxAnisotropy())),n.get(T).__currentAnisotropy=T.anisotropy}}}function Ue(P,T){let X=!1;P.__webglInit===void 0&&(P.__webglInit=!0,T.addEventListener("dispose",C),R(T));const de=T.source;let oe=d.get(de);oe===void 0&&(oe={},d.set(de,oe));const Se=D(T);if(Se!==P.__cacheKey){oe[Se]===void 0&&(oe[Se]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,X=!0),oe[Se].usedTimes++;const we=oe[P.__cacheKey];we!==void 0&&(oe[P.__cacheKey].usedTimes--,we.usedTimes===0&&k(T)),P.__cacheKey=Se,P.__webglTexture=oe[Se].texture}return X}function Y(P,T,X){return Math.floor(Math.floor(P/X)/T)}function le(P,T,X,de){const Se=P.updateRanges;if(Se.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,T.width,T.height,X,de,T.data);else{Se.sort((O,re)=>O.start-re.start);let we=0;for(let O=1;O<Se.length;O++){const re=Se[we],ee=Se[O],Te=re.start+re.count,xe=Y(ee.start,T.width,4),Me=Y(re.start,T.width,4);ee.start<=Te+1&&xe===Me&&Y(ee.start+ee.count-1,T.width,4)===xe?re.count=Math.max(re.count,ee.start+ee.count-re.start):(++we,Se[we]=ee)}Se.length=we+1;const te=t.getParameter(i.UNPACK_ROW_LENGTH),ie=t.getParameter(i.UNPACK_SKIP_PIXELS),be=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,T.width);for(let O=0,re=Se.length;O<re;O++){const ee=Se[O],Te=Math.floor(ee.start/4),xe=Math.ceil(ee.count/4),Me=Te%T.width,We=Math.floor(Te/T.width),st=xe,me=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Me),t.pixelStorei(i.UNPACK_SKIP_ROWS,We),t.texSubImage2D(i.TEXTURE_2D,0,Me,We,st,me,X,de,T.data)}P.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,te),t.pixelStorei(i.UNPACK_SKIP_PIXELS,ie),t.pixelStorei(i.UNPACK_SKIP_ROWS,be)}}function ae(P,T,X){let de=i.TEXTURE_2D;(T.isDataArrayTexture||T.isCompressedArrayTexture)&&(de=i.TEXTURE_2D_ARRAY),T.isData3DTexture&&(de=i.TEXTURE_3D);const oe=Ue(P,T),Se=T.source;t.bindTexture(de,P.__webglTexture,i.TEXTURE0+X);const we=n.get(Se);if(Se.version!==we.__version||oe===!0){if(t.activeTexture(i.TEXTURE0+X),(typeof ImageBitmap<"u"&&T.image instanceof ImageBitmap)===!1){const me=ct.getPrimaries(ct.workingColorSpace),Xe=T.colorSpace===yi?null:ct.getPrimaries(T.colorSpace),nt=T.colorSpace===yi||me===Xe?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,nt)}t.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment);let ie=x(T.image,!1,s.maxTextureSize);ie=qe(T,ie);const be=r.convert(T.format,T.colorSpace),O=r.convert(T.type);let re=b(T.internalFormat,be,O,T.normalized,T.colorSpace,T.isVideoTexture);ge(de,T);let ee;const Te=T.mipmaps,xe=T.isVideoTexture!==!0,Me=we.__version===void 0||oe===!0,We=Se.dataReady,st=M(T,ie);if(T.isDepthTexture)re=_(T.format===Vi,T.type),Me&&(xe?t.texStorage2D(i.TEXTURE_2D,1,re,ie.width,ie.height):t.texImage2D(i.TEXTURE_2D,0,re,ie.width,ie.height,0,be,O,null));else if(T.isDataTexture)if(Te.length>0){xe&&Me&&t.texStorage2D(i.TEXTURE_2D,st,re,Te[0].width,Te[0].height);for(let me=0,Xe=Te.length;me<Xe;me++)ee=Te[me],xe?We&&t.texSubImage2D(i.TEXTURE_2D,me,0,0,ee.width,ee.height,be,O,ee.data):t.texImage2D(i.TEXTURE_2D,me,re,ee.width,ee.height,0,be,O,ee.data);T.generateMipmaps=!1}else xe?(Me&&t.texStorage2D(i.TEXTURE_2D,st,re,ie.width,ie.height),We&&le(T,ie,be,O)):t.texImage2D(i.TEXTURE_2D,0,re,ie.width,ie.height,0,be,O,ie.data);else if(T.isCompressedTexture)if(T.isCompressedArrayTexture){xe&&Me&&t.texStorage3D(i.TEXTURE_2D_ARRAY,st,re,Te[0].width,Te[0].height,ie.depth);for(let me=0,Xe=Te.length;me<Xe;me++)if(ee=Te[me],T.format!==Wn)if(be!==null)if(xe){if(We)if(T.layerUpdates.size>0){const nt=kh(ee.width,ee.height,T.format,T.type);for(const Pe of T.layerUpdates){const vt=ee.data.subarray(Pe*nt/ee.data.BYTES_PER_ELEMENT,(Pe+1)*nt/ee.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,me,0,0,Pe,ee.width,ee.height,1,be,vt)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,me,0,0,0,ee.width,ee.height,ie.depth,be,ee.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,me,re,ee.width,ee.height,ie.depth,0,ee.data,0,0);else Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else xe?We&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,me,0,0,0,ee.width,ee.height,ie.depth,be,O,ee.data):t.texImage3D(i.TEXTURE_2D_ARRAY,me,re,ee.width,ee.height,ie.depth,0,be,O,ee.data);T.layerUpdates.size>0&&T.clearLayerUpdates()}else{xe&&Me&&t.texStorage2D(i.TEXTURE_2D,st,re,Te[0].width,Te[0].height);for(let me=0,Xe=Te.length;me<Xe;me++)ee=Te[me],T.format!==Wn?be!==null?xe?We&&t.compressedTexSubImage2D(i.TEXTURE_2D,me,0,0,ee.width,ee.height,be,ee.data):t.compressedTexImage2D(i.TEXTURE_2D,me,re,ee.width,ee.height,0,ee.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):xe?We&&t.texSubImage2D(i.TEXTURE_2D,me,0,0,ee.width,ee.height,be,O,ee.data):t.texImage2D(i.TEXTURE_2D,me,re,ee.width,ee.height,0,be,O,ee.data)}else if(T.isDataArrayTexture)if(xe){if(Me&&t.texStorage3D(i.TEXTURE_2D_ARRAY,st,re,ie.width,ie.height,ie.depth),We)if(T.layerUpdates.size>0){const me=kh(ie.width,ie.height,T.format,T.type);for(const Xe of T.layerUpdates){const nt=ie.data.subarray(Xe*me/ie.data.BYTES_PER_ELEMENT,(Xe+1)*me/ie.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Xe,ie.width,ie.height,1,be,O,nt)}T.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,ie.width,ie.height,ie.depth,be,O,ie.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,re,ie.width,ie.height,ie.depth,0,be,O,ie.data);else if(T.isData3DTexture)xe?(Me&&t.texStorage3D(i.TEXTURE_3D,st,re,ie.width,ie.height,ie.depth),We&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,ie.width,ie.height,ie.depth,be,O,ie.data)):t.texImage3D(i.TEXTURE_3D,0,re,ie.width,ie.height,ie.depth,0,be,O,ie.data);else if(T.isFramebufferTexture){if(Me)if(xe)t.texStorage2D(i.TEXTURE_2D,st,re,ie.width,ie.height);else{let me=ie.width,Xe=ie.height;for(let nt=0;nt<st;nt++)t.texImage2D(i.TEXTURE_2D,nt,re,me,Xe,0,be,O,null),me>>=1,Xe>>=1}}else if(T.isHTMLTexture){if("texElementImage2D"in i){const me=i.canvas;if(me.hasAttribute("layoutsubtree")||me.setAttribute("layoutsubtree","true"),ie.parentNode!==me){me.appendChild(ie),f.add(T),me.onpaint=Xe=>{const nt=Xe.changedElements;for(const Pe of f)nt.includes(Pe.image)&&(Pe.needsUpdate=!0)},me.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,ie);else{const nt=i.RGBA,Pe=i.RGBA,vt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,nt,Pe,vt,ie)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Te.length>0){if(xe&&Me){const me=Je(Te[0]);t.texStorage2D(i.TEXTURE_2D,st,re,me.width,me.height)}for(let me=0,Xe=Te.length;me<Xe;me++)ee=Te[me],xe?We&&t.texSubImage2D(i.TEXTURE_2D,me,0,0,be,O,ee):t.texImage2D(i.TEXTURE_2D,me,re,be,O,ee);T.generateMipmaps=!1}else if(xe){if(Me){const me=Je(ie);t.texStorage2D(i.TEXTURE_2D,st,re,me.width,me.height)}We&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,be,O,ie)}else t.texImage2D(i.TEXTURE_2D,0,re,be,O,ie);y(T)&&T.mipmapsAutoUpdate===!0&&S(de),we.__version=Se.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function ve(P,T,X){if(T.image.length!==6)return;const de=Ue(P,T),oe=T.source;t.bindTexture(i.TEXTURE_CUBE_MAP,P.__webglTexture,i.TEXTURE0+X);const Se=n.get(oe);if(oe.version!==Se.__version||de===!0){t.activeTexture(i.TEXTURE0+X);const we=ct.getPrimaries(ct.workingColorSpace),te=T.colorSpace===yi?null:ct.getPrimaries(T.colorSpace),ie=T.colorSpace===yi||we===te?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,T.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,T.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,T.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,ie);const be=T.isCompressedTexture||T.image[0].isCompressedTexture,O=T.image[0]&&T.image[0].isDataTexture,re=[];for(let Pe=0;Pe<6;Pe++)!be&&!O?re[Pe]=x(T.image[Pe],!0,s.maxCubemapSize):re[Pe]=O?T.image[Pe].image:T.image[Pe],re[Pe]=qe(T,re[Pe]);const ee=re[0],Te=r.convert(T.format,T.colorSpace),xe=r.convert(T.type);let Me=b(T.internalFormat,Te,xe,T.normalized,T.colorSpace);const We=T.isVideoTexture!==!0,st=Se.__version===void 0||de===!0,me=oe.dataReady;let Xe=M(T,ee);ge(i.TEXTURE_CUBE_MAP,T);let nt;if(T.isDepthTexture){if(Me=_(T.format===Vi,T.type),st)if(We)t.texStorage2D(i.TEXTURE_CUBE_MAP,1,Me,ee.width,ee.height);else for(let Pe=0;Pe<6;Pe++)t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0,Me,ee.width,ee.height,0,Te,xe,null)}else if(be){We&&st&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Xe,Me,ee.width,ee.height);for(let Pe=0;Pe<6;Pe++){nt=re[Pe].mipmaps;for(let vt=0;vt<nt.length;vt++){const Yt=nt[vt];T.format!==Wn?Te!==null?We?me&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt,0,0,Yt.width,Yt.height,Te,Yt.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt,Me,Yt.width,Yt.height,0,Yt.data):Ve("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):We?me&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt,0,0,Yt.width,Yt.height,Te,xe,Yt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt,Me,Yt.width,Yt.height,0,Te,xe,Yt.data)}}}else{if(nt=T.mipmaps,We&&st){nt.length>0&&Xe++;const Pe=Je(re[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Xe,Me,Pe.width,Pe.height)}for(let Pe=0;Pe<6;Pe++)if(O){We?me&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0,0,0,re[Pe].width,re[Pe].height,Te,xe,re[Pe].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0,Me,re[Pe].width,re[Pe].height,0,Te,xe,re[Pe].data);for(let vt=0;vt<nt.length;vt++){const Li=nt[vt].image[Pe].image;We?me&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt+1,0,0,Li.width,Li.height,Te,xe,Li.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt+1,Me,Li.width,Li.height,0,Te,xe,Li.data)}}else{We?me&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0,0,0,Te,xe,re[Pe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,0,Me,Te,xe,re[Pe]);for(let vt=0;vt<nt.length;vt++){const Yt=nt[vt];We?me&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt+1,0,0,Te,xe,Yt.image[Pe]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Pe,vt+1,Me,Te,xe,Yt.image[Pe])}}}y(T)&&T.mipmapsAutoUpdate===!0&&S(i.TEXTURE_CUBE_MAP),Se.__version=oe.version,T.onUpdate&&T.onUpdate(T)}P.__version=T.version}function j(P,T,X,de,oe,Se){const we=r.convert(X.format,X.colorSpace),te=r.convert(X.type),ie=b(X.internalFormat,we,te,X.normalized,X.colorSpace),be=n.get(T),O=n.get(X);if(O.__renderTarget=T,!be.__hasExternalTextures){const re=Math.max(1,T.width>>Se),ee=Math.max(1,T.height>>Se);oe===i.TEXTURE_3D||oe===i.TEXTURE_2D_ARRAY?t.texImage3D(oe,Se,ie,re,ee,T.depth,0,we,te,null):t.texImage2D(oe,Se,ie,re,ee,0,we,te,null)}t.bindFramebuffer(i.FRAMEBUFFER,P),ye(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,de,oe,O.__webglTexture,0,at(T)):(oe===i.TEXTURE_2D||oe>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&oe<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,de,oe,O.__webglTexture,Se),t.bindFramebuffer(i.FRAMEBUFFER,null)}function De(P,T,X){if(i.bindRenderbuffer(i.RENDERBUFFER,P),T.depthBuffer){const de=T.depthTexture,oe=de&&de.isDepthTexture?de.type:null,Se=_(T.stencilBuffer,oe),we=T.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;ye(T)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,at(T),Se,T.width,T.height):X?i.renderbufferStorageMultisample(i.RENDERBUFFER,at(T),Se,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,Se,T.width,T.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,we,i.RENDERBUFFER,P)}else{const de=T.textures;for(let oe=0;oe<de.length;oe++){const Se=de[oe],we=r.convert(Se.format,Se.colorSpace),te=r.convert(Se.type),ie=b(Se.internalFormat,we,te,Se.normalized,Se.colorSpace);ye(T)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,at(T),ie,T.width,T.height):X?i.renderbufferStorageMultisample(i.RENDERBUFFER,at(T),ie,T.width,T.height):i.renderbufferStorage(i.RENDERBUFFER,ie,T.width,T.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ne(P,T,X){const de=T.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,P),!(T.depthTexture&&T.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");const oe=n.get(T.depthTexture);oe.__renderTarget=T;const Se=de?T.depthTexture.image[0]:T.depthTexture.image;(!oe.__webglTexture||Se.width!==T.width||Se.height!==T.height)&&(Se.width=T.width,Se.height=T.height,T.depthTexture.needsUpdate=!0),de?ce(T.depthTexture,0):K(T.depthTexture,0);const we=oe.__webglTexture,te=at(T),ie=de?i.TEXTURE_CUBE_MAP_POSITIVE_X+X:i.TEXTURE_2D,be=T.depthTexture.format===Vi?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(T.depthTexture.format===Yi)ye(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,be,ie,we,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,be,ie,we,0);else if(T.depthTexture.format===Vi)ye(T)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,be,ie,we,0,te):i.framebufferTexture2D(i.FRAMEBUFFER,be,ie,we,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function $(P){const T=n.get(P),X=P.isWebGLCubeRenderTarget===!0;if(T.__boundDepthTexture!==P.depthTexture){const de=P.depthTexture;if(T.__depthDisposeCallback&&T.__depthDisposeCallback(),de){const oe=()=>{delete T.__boundDepthTexture,delete T.__depthDisposeCallback,de.removeEventListener("dispose",oe)};de.addEventListener("dispose",oe),T.__depthDisposeCallback=oe}T.__boundDepthTexture=de}if(P.depthTexture&&!T.__autoAllocateDepthBuffer)if(X)for(let de=0;de<6;de++)Ne(T.__webglFramebuffer[de],P,de);else P.texture.mipmaps.length>0?Ne(T.__webglFramebuffer[0],P,0):Ne(T.__webglFramebuffer,P,0);else if(X){T.__webglDepthbuffer=[];for(let de=0;de<6;de++)if(t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[de]),T.__webglDepthbuffer[de]===void 0)T.__webglDepthbuffer[de]=i.createRenderbuffer(),De(T.__webglDepthbuffer[de],P,!1);else{const oe=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=T.__webglDepthbuffer[de];i.bindRenderbuffer(i.RENDERBUFFER,Se),i.framebufferRenderbuffer(i.FRAMEBUFFER,oe,i.RENDERBUFFER,Se)}}else if(P.texture.mipmaps.length>0?t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,T.__webglFramebuffer),T.__webglDepthbuffer===void 0)T.__webglDepthbuffer=i.createRenderbuffer(),De(T.__webglDepthbuffer,P,!1);else{const oe=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=T.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Se),i.framebufferRenderbuffer(i.FRAMEBUFFER,oe,i.RENDERBUFFER,Se)}t.bindFramebuffer(i.FRAMEBUFFER,null)}function _e(P,T,X){const de=n.get(P);T!==void 0&&j(de.__webglFramebuffer,P,P.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),X!==void 0&&$(P)}function Ce(P){const T=P.texture,X=n.get(P),de=n.get(T);P.addEventListener("dispose",N),R(P);const oe=P.textures,Se=P.isWebGLCubeRenderTarget===!0,we=oe.length>1;if(we||(de.__webglTexture===void 0&&(de.__webglTexture=i.createTexture()),de.__version=T.version,o.memory.textures++),Se){X.__webglFramebuffer=[];for(let te=0;te<6;te++)if(T.mipmaps.length>0){X.__webglFramebuffer[te]=[];for(let ie=0;ie<T.mipmaps.length;ie++)X.__webglFramebuffer[te][ie]=i.createFramebuffer()}else X.__webglFramebuffer[te]=i.createFramebuffer()}else{if(T.mipmaps.length>0){X.__webglFramebuffer=[];for(let te=0;te<T.mipmaps.length;te++)X.__webglFramebuffer[te]=i.createFramebuffer()}else X.__webglFramebuffer=i.createFramebuffer();if(we)for(let te=0,ie=oe.length;te<ie;te++){const be=n.get(oe[te]);be.__webglTexture===void 0&&(be.__webglTexture=i.createTexture(),o.memory.textures++)}if(P.samples>0&&ye(P)===!1){X.__webglMultisampledFramebuffer=i.createFramebuffer(),X.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,X.__webglMultisampledFramebuffer);for(let te=0;te<oe.length;te++){const ie=oe[te];X.__webglColorRenderbuffer[te]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,X.__webglColorRenderbuffer[te]);const be=r.convert(ie.format,ie.colorSpace),O=r.convert(ie.type),re=b(ie.internalFormat,be,O,ie.normalized,ie.colorSpace,P.isXRRenderTarget===!0),ee=at(P);i.renderbufferStorageMultisample(i.RENDERBUFFER,ee,re,P.width,P.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+te,i.RENDERBUFFER,X.__webglColorRenderbuffer[te])}i.bindRenderbuffer(i.RENDERBUFFER,null),P.depthBuffer&&(X.__webglDepthRenderbuffer=i.createRenderbuffer(),De(X.__webglDepthRenderbuffer,P,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Se){t.bindTexture(i.TEXTURE_CUBE_MAP,de.__webglTexture),ge(i.TEXTURE_CUBE_MAP,T);for(let te=0;te<6;te++)if(T.mipmaps.length>0)for(let ie=0;ie<T.mipmaps.length;ie++)j(X.__webglFramebuffer[te][ie],P,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+te,ie);else j(X.__webglFramebuffer[te],P,T,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+te,0);y(T)?S(i.TEXTURE_CUBE_MAP):T.mipmaps.length>0&&i.texParameteri(i.TEXTURE_CUBE_MAP,i.TEXTURE_MAX_LEVEL,T.mipmaps.length-1),t.unbindTexture()}else if(we){for(let te=0,ie=oe.length;te<ie;te++){const be=oe[te],O=n.get(be);let re=i.TEXTURE_2D;(P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(re=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(re,O.__webglTexture),ge(re,be),j(X.__webglFramebuffer,P,be,i.COLOR_ATTACHMENT0+te,re,0),y(be)&&S(re)}t.unbindTexture()}else{let te=i.TEXTURE_2D;if((P.isWebGL3DRenderTarget||P.isWebGLArrayRenderTarget)&&(te=P.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(te,de.__webglTexture),ge(te,T),T.mipmaps.length>0)for(let ie=0;ie<T.mipmaps.length;ie++)j(X.__webglFramebuffer[ie],P,T,i.COLOR_ATTACHMENT0,te,ie);else j(X.__webglFramebuffer,P,T,i.COLOR_ATTACHMENT0,te,0);y(T)?S(te):T.mipmaps.length>0&&i.texParameteri(te,i.TEXTURE_MAX_LEVEL,T.mipmaps.length-1),t.unbindTexture()}P.depthBuffer&&$(P)}function U(P){const T=P.textures;for(let X=0,de=T.length;X<de;X++){const oe=T[X];if(y(oe)&&oe.mipmapsAutoUpdate===!0){const Se=E(P),we=n.get(oe).__webglTexture;t.bindTexture(Se,we),S(Se),t.unbindTexture()}}}const Ke=[];function Ye(P){if(P.samples>0){if(ye(P)===!1){const T=P.textures,X=P.width,de=P.height;let oe=i.COLOR_BUFFER_BIT;const Se=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,we=n.get(P),te=T.length>1;if(te)for(let be=0;be<T.length;be++)t.bindFramebuffer(i.FRAMEBUFFER,we.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+be,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,we.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+be,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer),P.texture.mipmaps.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let be=0;be<T.length;be++){if(P.resolveDepthBuffer&&(P.depthBuffer&&(oe|=i.DEPTH_BUFFER_BIT),P.stencilBuffer&&P.resolveStencilBuffer&&(oe|=i.STENCIL_BUFFER_BIT)),te){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,we.__webglColorRenderbuffer[be]);const O=n.get(T[be]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,O,0)}i.blitFramebuffer(0,0,X,de,0,0,X,de,oe,i.NEAREST),c===!0&&(Ke.length=0,Ke.push(i.COLOR_ATTACHMENT0+be),P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&Ke.push(Se),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ke))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),te)for(let be=0;be<T.length;be++){t.bindFramebuffer(i.FRAMEBUFFER,we.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+be,i.RENDERBUFFER,we.__webglColorRenderbuffer[be]);const O=n.get(T[be]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,we.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+be,i.TEXTURE_2D,O,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(P.depthBuffer&&P.storeMultisampledDepthBuffer===!1&&c){const T=P.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[T])}}}function at(P){return Math.min(s.maxSamples,P.samples)}function ye(P){const T=n.get(P);return P.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&T.__useRenderToTexture!==!1}function Ot(P){const T=o.render.frame;u.get(P)!==T&&(u.set(P,T),P.update())}function qe(P,T){const X=P.colorSpace,de=P.format,oe=P.type;return P.isCompressedTexture===!0||P.isVideoTexture===!0||X!==xn&&X!==yi&&(ct.getTransfer(X)===St?(de!==Wn||oe!==yn)&&Ve("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):$e("WebGLTextures: Unsupported texture color space:",X)),T}function Je(P){return typeof HTMLImageElement<"u"&&P instanceof HTMLImageElement?(l.width=P.naturalWidth||P.width,l.height=P.naturalHeight||P.height):typeof VideoFrame<"u"&&P instanceof VideoFrame?(l.width=P.displayWidth,l.height=P.displayHeight):(l.width=P.width,l.height=P.height),l}this.allocateTextureUnit=Re,this.resetTextureUnits=Z,this.getTextureUnits=V,this.setTextureUnits=ue,this.setTexture2D=K,this.setTexture2DArray=ne,this.setTexture3D=fe,this.setTextureCube=ce,this.rebindTextures=_e,this.setupRenderTarget=Ce,this.updateRenderTargetMipmap=U,this.updateMultisampleRenderTarget=Ye,this.setupDepthRenderbuffer=$,this.setupFrameBufferTexture=j,this.useMultisampledRTT=ye,this.dispose=B}function kS(i,e){function t(n,s=yi){let r;const o=ct.getTransfer(s);if(n===yn)return i.UNSIGNED_BYTE;if(n===Gc)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Vc)return i.UNSIGNED_SHORT_5_5_5_1;if(n===$f)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Jf)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Yf)return i.BYTE;if(n===Kf)return i.SHORT;if(n===qr)return i.UNSIGNED_SHORT;if(n===Hc)return i.INT;if(n===ni)return i.UNSIGNED_INT;if(n===Ln)return i.FLOAT;if(n===Un)return i.HALF_FLOAT;if(n===Zf)return i.ALPHA;if(n===Qf)return i.RGB;if(n===Wn)return i.RGBA;if(n===Yi)return i.DEPTH_COMPONENT;if(n===Vi)return i.DEPTH_STENCIL;if(n===Wc)return i.RED;if(n===Xc)return i.RED_INTEGER;if(n===us)return i.RG;if(n===qc)return i.RG_INTEGER;if(n===Yc)return i.RGBA_INTEGER;if(n===Zo||n===Qo||n===jo||n===ea)if(o===St)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Zo)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Qo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===jo)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Zo)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Qo)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===jo)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ea)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===kl||n===Hl||n===Gl||n===Vl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===kl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Hl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Gl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Vl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Wl||n===Xl||n===ql||n===Yl||n===Kl||n===oa||n===$l)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Wl||n===Xl)return o===St?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ql)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Yl)return r.COMPRESSED_R11_EAC;if(n===Kl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===oa)return r.COMPRESSED_RG11_EAC;if(n===$l)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Jl||n===Zl||n===Ql||n===jl||n===ec||n===tc||n===nc||n===ic||n===sc||n===rc||n===oc||n===ac||n===lc||n===cc)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Jl)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Zl)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ql)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===jl)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===ec)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===tc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===nc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ic)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===sc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===rc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===oc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ac)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===lc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===cc)return o===St?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===uc||n===hc||n===fc)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===uc)return o===St?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===hc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===fc)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===dc||n===pc||n===aa||n===mc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===dc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===pc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===aa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===mc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Ys?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}const HS=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,GS=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class VS{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new xd(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Ki({vertexShader:HS,fragmentShader:GS,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new mt(new ut(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class WS extends ds{constructor(e,t){super();const n=this;let s=null,r=1,o=null,a="local-floor",c=1,l=null,u=null,f=null,h=null,d=null,p=null;const v=typeof XRWebGLBinding<"u",g=new VS,m={},x=t.getContextAttributes();let y=null,S=null;const E=[],b=[],_=new he;let M=null,R=null;const w=new Ht;w.viewport=new bt;const C=new Ht;C.viewport=new bt;const N=[w,C],F=new qm;let I=null,B=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(D){let K=E[D];return K===void 0&&(K=new Wa,E[D]=K),K.getTargetRaySpace()},this.getControllerGrip=function(D){let K=E[D];return K===void 0&&(K=new Wa,E[D]=K),K.getGripSpace()},this.getHand=function(D){let K=E[D];return K===void 0&&(K=new Wa,E[D]=K),K.getHandSpace()};function H(D){const K=b.indexOf(D.inputSource);if(K===-1)return;const ne=E[K];ne!==void 0&&(ne.update(D.inputSource,D.frame,l||o),ne.dispatchEvent({type:D.type,data:D.inputSource}))}function k(){s.removeEventListener("select",H),s.removeEventListener("selectstart",H),s.removeEventListener("selectend",H),s.removeEventListener("squeeze",H),s.removeEventListener("squeezestart",H),s.removeEventListener("squeezeend",H),s.removeEventListener("end",k),s.removeEventListener("inputsourceschange",Q);for(let D=0;D<E.length;D++){const K=b[D];K!==null&&(b[D]=null,E[D].disconnect(K))}I=null,B=null,g.reset();for(const D in m)delete m[D];if(e.setRenderTarget(y),d=null,h=null,f=null,s=null,S=null,Re.stop(),n.isPresenting=!1,e.setPixelRatio(M),e.setSize(_.width,_.height,!1),R!==null){const D=R.camera;D.fov=R.fov,D.zoom=R.zoom,D.updateProjectionMatrix(),R=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(D){r=D,n.isPresenting===!0&&Ve("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(D){a=D,n.isPresenting===!0&&Ve("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||o},this.setReferenceSpace=function(D){l=D},this.getBaseLayer=function(){return h!==null?h:d},this.getBinding=function(){return f===null&&v&&(f=new XRWebGLBinding(s,t)),f},this.getFrame=function(){return p},this.getSession=function(){return s},this.setSession=async function(D){if(s=D,s!==null){if(y=e.getRenderTarget(),s.addEventListener("select",H),s.addEventListener("selectstart",H),s.addEventListener("selectend",H),s.addEventListener("squeeze",H),s.addEventListener("squeezestart",H),s.addEventListener("squeezeend",H),s.addEventListener("end",k),s.addEventListener("inputsourceschange",Q),x.xrCompatible!==!0&&await t.makeXRCompatible(),M=e.getPixelRatio(),e.getSize(_),v&&"createProjectionLayer"in XRWebGLBinding.prototype){let ne=null,fe=null,ce=null;x.depth&&(ce=x.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ne=x.stencil?Vi:Yi,fe=x.stencil?Ys:ni);const pe={colorFormat:t.RGBA8,depthFormat:ce,scaleFactor:r};f=this.getBinding(),h=f.createProjectionLayer(pe),s.updateRenderState({layers:[h]}),e.setPixelRatio(1),e.setSize(h.textureWidth,h.textureHeight,!1),S=new Nn(h.textureWidth,h.textureHeight,{format:Wn,type:yn,depthTexture:new $s(h.textureWidth,h.textureHeight,fe,void 0,void 0,void 0,void 0,void 0,void 0,ne),stencilBuffer:x.stencil,colorSpace:e.outputColorSpace,samples:x.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1,storeMultisampledDepthBuffer:h.ignoreDepthValues===!1,storeMultisampledStencilBuffer:h.ignoreDepthValues===!1})}else{const ne={antialias:x.antialias,alpha:!0,depth:x.depth,stencil:x.stencil,framebufferScaleFactor:r};d=new XRWebGLLayer(s,t,ne),s.updateRenderState({baseLayer:d}),e.setPixelRatio(1),e.setSize(d.framebufferWidth,d.framebufferHeight,!1),S=new Nn(d.framebufferWidth,d.framebufferHeight,{format:Wn,type:yn,colorSpace:e.outputColorSpace,stencilBuffer:x.stencil,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1,storeMultisampledDepthBuffer:d.ignoreDepthValues===!1,storeMultisampledStencilBuffer:d.ignoreDepthValues===!1})}S.isXRRenderTarget=!0,this.setFoveation(c),l=null,o=await s.requestReferenceSpace(a),Re.setContext(s),Re.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function Q(D){for(let K=0;K<D.removed.length;K++){const ne=D.removed[K],fe=b.indexOf(ne);fe>=0&&(b[fe]=null,E[fe].disconnect(ne))}for(let K=0;K<D.added.length;K++){const ne=D.added[K];let fe=b.indexOf(ne);if(fe===-1){for(let pe=0;pe<E.length;pe++)if(pe>=b.length){b.push(ne),fe=pe;break}else if(b[pe]===null){b[pe]=ne,fe=pe;break}if(fe===-1)break}const ce=E[fe];ce&&ce.connect(ne)}}function G(D,K){K===null?D.matrixWorld.copy(D.matrix):D.matrixWorld.multiplyMatrices(K.matrixWorld,D.matrix),D.matrixWorldInverse.copy(D.matrixWorld).invert()}this.updateCamera=function(D){if(s===null)return;let K=D.near,ne=D.far;g.texture!==null&&(g.depthNear>0&&(K=g.depthNear),g.depthFar>0&&(ne=g.depthFar)),F.near=C.near=w.near=K,F.far=C.far=w.far=ne,(I!==F.near||B!==F.far)&&(s.updateRenderState({depthNear:F.near,depthFar:F.far}),I=F.near,B=F.far),F.layers.mask=D.layers.mask|6,w.layers.mask=F.layers.mask&-5,C.layers.mask=F.layers.mask&-3;const fe=D.parent,ce=F.cameras;G(F,fe);for(let pe=0;pe<ce.length;pe++)G(ce[pe],fe);F.projectionMatrix.copy(w.projectionMatrix),F.projectionMatrixInverse.copy(w.projectionMatrixInverse),R===null&&D.isPerspectiveCamera&&(R={camera:D,fov:D.fov,zoom:D.zoom}),Z(D,F,fe)};function Z(D,K,ne){ne===null?D.matrix.copy(K.matrixWorld):(D.matrix.copy(ne.matrixWorld),D.matrix.invert(),D.matrix.multiply(K.matrixWorld)),D.matrix.decompose(D.position,D.quaternion,D.scale),D.updateMatrixWorld(!0),D.projectionMatrix.copy(K.projectionMatrix),D.projectionMatrixInverse.copy(K.projectionMatrixInverse),D.isPerspectiveCamera&&(D.fov=Ks*2*Math.atan(1/D.projectionMatrix.elements[5]),D.zoom=1)}this.getCamera=function(){return F},this.getFoveation=function(){if(!(h===null&&d===null))return c},this.setFoveation=function(D){c=D,h!==null&&(h.fixedFoveation=D),d!==null&&d.fixedFoveation!==void 0&&(d.fixedFoveation=D)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(F)},this.getCameraTexture=function(D){return m[D]};let V=null;function ue(D,K){if(u=K.getViewerPose(l||o),p=K,u!==null){const ne=u.views;d!==null&&(e.setRenderTargetFramebuffer(S,d.framebuffer),e.setRenderTarget(S));let fe=!1;ne.length!==F.cameras.length&&(F.cameras.length=0,fe=!0);for(let se=0;se<ne.length;se++){const ge=ne[se];let Ue=null;if(d!==null)Ue=d.getViewport(ge);else{const le=f.getViewSubImage(h,ge);Ue=le.viewport,se===0&&(e.setRenderTargetTextures(S,le.colorTexture,le.depthStencilTexture),e.setRenderTarget(S))}let Y=N[se];Y===void 0&&(Y=new Ht,Y.layers.enable(se),Y.viewport=new bt,N[se]=Y),Y.matrix.fromArray(ge.transform.matrix),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.projectionMatrix.fromArray(ge.projectionMatrix),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert(),Y.viewport.set(Ue.x,Ue.y,Ue.width,Ue.height),se===0&&(F.matrix.copy(Y.matrix),F.matrix.decompose(F.position,F.quaternion,F.scale)),fe===!0&&F.cameras.push(Y)}const ce=s.enabledFeatures;if(ce&&ce.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&v){f=n.getBinding();const se=f.getDepthInformation(ne[0]);se&&se.isValid&&se.texture&&g.init(se,s.renderState)}if(ce&&ce.includes("camera-access")&&v){e.state.unbindTexture(),f=n.getBinding();for(let se=0;se<ne.length;se++){const ge=ne[se].camera;if(ge){let Ue=m[ge];Ue||(Ue=new xd,m[ge]=Ue);const Y=f.getCameraImage(ge);Ue.sourceTexture=Y}}}}for(let ne=0;ne<E.length;ne++){const fe=b[ne],ce=E[ne];fe!==null&&ce!==void 0&&ce.update(fe,K,l||o)}V&&V(D,K),K.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:K}),p=null}const Re=new Ud;Re.setAnimationLoop(ue),this.setAnimationLoop=function(D){V=D},this.dispose=function(){}}}const XS=new et,Xd=new Ze;Xd.set(-1,0,0,0,1,0,0,0,1);function qS(i,e){function t(g,m){g.matrixAutoUpdate===!0&&g.updateMatrix(),m.value.copy(g.matrix)}function n(g,m){m.color.getRGB(g.fogColor.value,Cd(i)),m.isFog?(g.fogNear.value=m.near,g.fogFar.value=m.far):m.isFogExp2&&(g.fogDensity.value=m.density)}function s(g,m,x,y,S){m.isNodeMaterial?m.uniformsNeedUpdate=!1:m.isMeshBasicMaterial?r(g,m):m.isMeshLambertMaterial?(r(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshToonMaterial?(r(g,m),f(g,m)):m.isMeshPhongMaterial?(r(g,m),u(g,m),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)):m.isMeshStandardMaterial?(r(g,m),h(g,m),m.isMeshPhysicalMaterial&&d(g,m,S)):m.isMeshMatcapMaterial?(r(g,m),p(g,m)):m.isMeshDepthMaterial?r(g,m):m.isMeshDistanceMaterial?(r(g,m),v(g,m)):m.isMeshNormalMaterial?r(g,m):m.isLineBasicMaterial?(o(g,m),m.isLineDashedMaterial&&a(g,m)):m.isPointsMaterial?c(g,m,x,y):m.isSpriteMaterial?l(g,m):m.isShadowMaterial?(g.color.value.copy(m.color),g.opacity.value=m.opacity):m.isShaderMaterial&&(m.uniformsNeedUpdate=!1)}function r(g,m){g.opacity.value=m.opacity,m.color&&g.diffuse.value.copy(m.color),m.emissive&&g.emissive.value.copy(m.emissive).multiplyScalar(m.emissiveIntensity),m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.bumpMap&&(g.bumpMap.value=m.bumpMap,t(m.bumpMap,g.bumpMapTransform),g.bumpScale.value=m.bumpScale,m.side===ln&&(g.bumpScale.value*=-1)),m.normalMap&&(g.normalMap.value=m.normalMap,t(m.normalMap,g.normalMapTransform),g.normalScale.value.copy(m.normalScale),m.side===ln&&g.normalScale.value.negate()),m.displacementMap&&(g.displacementMap.value=m.displacementMap,t(m.displacementMap,g.displacementMapTransform),g.displacementScale.value=m.displacementScale,g.displacementBias.value=m.displacementBias),m.emissiveMap&&(g.emissiveMap.value=m.emissiveMap,t(m.emissiveMap,g.emissiveMapTransform)),m.specularMap&&(g.specularMap.value=m.specularMap,t(m.specularMap,g.specularMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest);const x=e.get(m),y=x.envMap,S=x.envMapRotation;y&&(g.envMap.value=y,g.envMapRotation.value.setFromMatrix4(XS.makeRotationFromEuler(S)).transpose(),y.isCubeTexture&&y.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(Xd),g.reflectivity.value=m.reflectivity,g.ior.value=m.ior,g.refractionRatio.value=m.refractionRatio),m.lightMap&&(g.lightMap.value=m.lightMap,g.lightMapIntensity.value=m.lightMapIntensity,t(m.lightMap,g.lightMapTransform)),m.aoMap&&(g.aoMap.value=m.aoMap,g.aoMapIntensity.value=m.aoMapIntensity,t(m.aoMap,g.aoMapTransform))}function o(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform))}function a(g,m){g.dashSize.value=m.dashSize,g.totalSize.value=m.dashSize+m.gapSize,g.scale.value=m.scale}function c(g,m,x,y){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.size.value=m.size*x,g.scale.value=y*.5,m.map&&(g.map.value=m.map,t(m.map,g.uvTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function l(g,m){g.diffuse.value.copy(m.color),g.opacity.value=m.opacity,g.rotation.value=m.rotation,m.map&&(g.map.value=m.map,t(m.map,g.mapTransform)),m.alphaMap&&(g.alphaMap.value=m.alphaMap,t(m.alphaMap,g.alphaMapTransform)),m.alphaTest>0&&(g.alphaTest.value=m.alphaTest)}function u(g,m){g.specular.value.copy(m.specular),g.shininess.value=Math.max(m.shininess,1e-4)}function f(g,m){m.gradientMap&&(g.gradientMap.value=m.gradientMap)}function h(g,m){g.metalness.value=m.metalness,m.metalnessMap&&(g.metalnessMap.value=m.metalnessMap,t(m.metalnessMap,g.metalnessMapTransform)),g.roughness.value=m.roughness,m.roughnessMap&&(g.roughnessMap.value=m.roughnessMap,t(m.roughnessMap,g.roughnessMapTransform)),m.envMap&&(g.envMapIntensity.value=m.envMapIntensity)}function d(g,m,x){g.ior.value=m.ior,m.diffuseRoughness>0&&(g.diffuseRoughness.value=m.diffuseRoughness,m.diffuseRoughnessMap&&(g.diffuseRoughnessMap.value=m.diffuseRoughnessMap,t(m.diffuseRoughnessMap,g.diffuseRoughnessMapTransform))),m.sheen>0&&(g.sheenColor.value.copy(m.sheenColor).multiplyScalar(m.sheen),g.sheenRoughness.value=m.sheenRoughness,m.sheenColorMap&&(g.sheenColorMap.value=m.sheenColorMap,t(m.sheenColorMap,g.sheenColorMapTransform)),m.sheenRoughnessMap&&(g.sheenRoughnessMap.value=m.sheenRoughnessMap,t(m.sheenRoughnessMap,g.sheenRoughnessMapTransform))),m.clearcoat>0&&(g.clearcoat.value=m.clearcoat,g.clearcoatRoughness.value=m.clearcoatRoughness,m.clearcoatMap&&(g.clearcoatMap.value=m.clearcoatMap,t(m.clearcoatMap,g.clearcoatMapTransform)),m.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=m.clearcoatRoughnessMap,t(m.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),m.clearcoatNormalMap&&(g.clearcoatNormalMap.value=m.clearcoatNormalMap,t(m.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(m.clearcoatNormalScale),m.side===ln&&g.clearcoatNormalScale.value.negate())),m.dispersion>0&&(g.dispersion.value=m.dispersion),m.retroreflectivity>0&&(g.retroreflectivity.value=m.retroreflectivity),m.iridescence>0&&(g.iridescence.value=m.iridescence,g.iridescenceIOR.value=m.iridescenceIOR,g.iridescenceThicknessMinimum.value=m.iridescenceThicknessMinimum,g.iridescenceThicknessMaximum.value=m.iridescenceThicknessMaximum,m.iridescenceMap&&(g.iridescenceMap.value=m.iridescenceMap,t(m.iridescenceMap,g.iridescenceMapTransform)),m.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=m.iridescenceThicknessMap,t(m.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),m.transmission>0&&(g.transmission.value=m.transmission,g.transmissionSamplerMap.value=x.texture,g.transmissionSamplerSize.value.set(x.width,x.height),m.transmissionMap&&(g.transmissionMap.value=m.transmissionMap,t(m.transmissionMap,g.transmissionMapTransform)),g.thickness.value=m.thickness,m.thicknessMap&&(g.thicknessMap.value=m.thicknessMap,t(m.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=m.attenuationDistance,g.attenuationColor.value.copy(m.attenuationColor)),m.anisotropy>0&&(g.anisotropyVector.value.set(m.anisotropy*Math.cos(m.anisotropyRotation),m.anisotropy*Math.sin(m.anisotropyRotation)),m.anisotropyMap&&(g.anisotropyMap.value=m.anisotropyMap,t(m.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=m.specularIntensity,g.specularColor.value.copy(m.specularColor),m.specularColorMap&&(g.specularColorMap.value=m.specularColorMap,t(m.specularColorMap,g.specularColorMapTransform)),m.specularIntensityMap&&(g.specularIntensityMap.value=m.specularIntensityMap,t(m.specularIntensityMap,g.specularIntensityMapTransform))}function p(g,m){m.matcap&&(g.matcap.value=m.matcap)}function v(g,m){const x=e.get(m).light;g.referencePosition.value.setFromMatrixPosition(x.matrixWorld),g.nearDistance.value=x.shadow.camera.near,g.farDistance.value=x.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function YS(i,e,t,n){let s={},r={};function o(x,y){const S=y.program;n.uniformBlockBinding(x,S,s[x.id])}function a(x,y){let S=s[x.id];S===void 0&&(p(x),S=c(x),s[x.id]=S,x.addEventListener("dispose",g));const E=y.program;n.updateUBOMapping(x,E);const b=e.render.frame;r[x.id]!==b&&(l(x),r[x.id]=b)}function c(x){const y=i.createBuffer(),S=x.__size,E=x.usage;return i.bindBuffer(i.UNIFORM_BUFFER,y),i.bufferData(i.UNIFORM_BUFFER,S,E),i.bindBuffer(i.UNIFORM_BUFFER,null),y}function l(x){const y=s[x.id],S=x.uniforms,E=x.__cache;i.bindBuffer(i.UNIFORM_BUFFER,y);for(let b=0,_=S.length;b<_;b++){const M=S[b];if(Array.isArray(M))for(let R=0,w=M.length;R<w;R++)u(M[R],b,R,E);else u(M,b,0,E)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function u(x,y,S,E){if(h(x,y,S,E)===!0){const b=x.__offset,_=x.value;if(Array.isArray(_)){let M=0;for(let R=0;R<_.length;R++){const w=_[R],C=v(w,!0);f(w,x.__data,M),M+=C.storage/Float32Array.BYTES_PER_ELEMENT}}else f(_,x.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,b,x.__data)}}function f(x,y,S){typeof x=="number"||typeof x=="boolean"?y[S]=x:x.isMatrix3?(y[S]=x.elements[0],y[S+1]=x.elements[1],y[S+2]=x.elements[2],y[S+3]=0,y[S+4]=x.elements[3],y[S+5]=x.elements[4],y[S+6]=x.elements[5],y[S+7]=0,y[S+8]=x.elements[6],y[S+9]=x.elements[7],y[S+10]=x.elements[8],y[S+11]=0):ArrayBuffer.isView(x)?y.set(x.subarray(0,y.length-S),S):x.toArray(y,S)}function h(x,y,S,E){const b=x.value,_=y+"_"+S;if(Array.isArray(b)){E[_]===void 0&&(E[_]=[]);const M=E[_];let R=!1;for(let w=0;w<b.length;w++)d(b[w],M,w)===!0&&(R=!0);return R}return d(b,E,_)}function d(x,y,S){if(y[S]===void 0)return typeof x=="number"||typeof x=="boolean"?y[S]=x:ArrayBuffer.isView(x)?y[S]=x.slice():y[S]=x.clone(),!0;{const E=y[S];if(typeof x=="number"||typeof x=="boolean"){if(E!==x)return y[S]=x,!0}else{if(ArrayBuffer.isView(x))return!0;if(E.equals(x)===!1)return E.copy(x),!0}}return!1}function p(x){const y=x.uniforms;let S=0;const E=16;for(let _=0,M=y.length;_<M;_++){const R=Array.isArray(y[_])?y[_]:[y[_]];for(let w=0,C=R.length;w<C;w++){const N=R[w],F=Array.isArray(N.value)?N.value:[N.value],I=Array.isArray(y[_])||Array.isArray(N.value);let B=S;for(let k=0,Q=F.length;k<Q;k++){const G=F[k],Z=v(G,I),V=S%E,ue=V%Z.boundary,Re=V+ue;S+=ue,Re!==0&&E-Re<Z.storage&&(S+=E-Re),k===0&&(B=S),S+=Z.storage}const H=N.type==="int"?Int32Array:N.type==="uint"?Uint32Array:Float32Array;N.__data=new H((S-B)/Float32Array.BYTES_PER_ELEMENT),N.__offset=B}}const b=S%E;return b>0&&(S+=E-b),x.__size=S,x.__cache={},this}function v(x,y){const S={boundary:0,storage:0};return typeof x=="number"||typeof x=="boolean"?(S.boundary=4,S.storage=4):x.isVector2?(S.boundary=8,S.storage=8):x.isVector3||x.isColor?(S.boundary=16,S.storage=12):x.isVector4?(S.boundary=16,S.storage=16):x.isMatrix3?(S.boundary=16,S.storage=48):x.isMatrix4?(S.boundary=16,S.storage=64):x.isTexture?Ve("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(x)?(S.boundary=16,S.storage=x.byteLength):Ve("WebGLRenderer: Unsupported uniform value type.",x),y===!0&&(S.boundary=16,S.storage=Math.ceil(S.storage/16)*16),S}function g(x){const y=x.target;y.removeEventListener("dispose",g),i.deleteBuffer(s[y.id]),delete s[y.id],delete r[y.id]}function m(){for(const x in s)i.deleteBuffer(s[x]);s={},r={}}return{bind:o,update:a,dispose:m}}const KS=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]);let Zn=null;function $S(){return Zn===null&&(Zn=new jc(KS,16,16,us,Un),Zn.name="DFG_LUT",Zn.minFilter=jt,Zn.magFilter=jt,Zn.wrapS=ei,Zn.wrapT=ei,Zn.generateMipmaps=!1,Zn.needsUpdate=!0),Zn}class JS{constructor(e={}){const{canvas:t=$p(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:f=!1,reversedDepthBuffer:h=!1,outputBufferType:d=yn}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;const v=d,g=new Set([Yc,qc,Xc]),m=new Set([yn,ni,qr,Ys,Gc,Vc]),x=new Uint32Array(4),y=new Int32Array(4),S={textures:[],min:[],max:[],resolution:[]};let E=null,b=null;const _=[],M=[];let R=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Ri,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const w=this;let C=!1,N=null,F=null,I=null,B=null;this._outputColorSpace=xt;let H=0,k=0,Q=null,G=-1,Z=null;const V=new bt,ue=new bt;let Re=null;const D=new Oe(0);let K=0,ne=t.width,fe=t.height,ce=1,pe=null,He=null;const se=new bt(0,0,ne,fe),ge=new bt(0,0,ne,fe);let Ue=!1;const Y=new Qr,le=new nu;let ae=!1,ve=!1;const j=new et,De=new L,Ne=new bt,$={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let _e=!1;function Ce(){return Q===null?ce:1}let U=n;function Ke(A,z){return t.getContext(A,z)}let Ye,at,ye,Ot,qe,Je,P,T,X,de,oe,Se,we,te,ie,be,O,re,ee,Te,xe,Me,We;try{const A={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:u,failIfMajorPerformanceCaveat:f};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Bc}`),t.addEventListener("webglcontextlost",Xe,!1),t.addEventListener("webglcontextrestored",nt,!1),t.addEventListener("webglcontextcreationerror",Pe,!1),U===null){const z="webgl2";if(U=Ke(z,A),U===null)throw Ke(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}st()}catch(A){throw t.removeEventListener("webglcontextlost",Xe,!1),t.removeEventListener("webglcontextrestored",nt,!1),t.removeEventListener("webglcontextcreationerror",Pe,!1),$e("WebGLRenderer: "+A.message),A}function st(){Ye=new jx(U),Ye.init(),xe=new kS(U,Ye),at=new Gx(U,Ye,e,xe),ye=new BS(U,Ye),at.reversedDepthBuffer&&h&&ye.buffers.depth.setReversed(!0),F=U.createFramebuffer(),I=U.createFramebuffer(),B=U.createFramebuffer(),Ot=new nv(U),qe=new TS,Je=new zS(U,Ye,ye,qe,at,xe,Ot),P=new Qx(w),T=new sg(U),Me=new kx(U,T),X=new ev(U,T,Ot,Me),de=new sv(U,X,T,Me,Ot),re=new iv(U,at,Je),ie=new Vx(qe),oe=new bS(w,P,Ye,at,Me,ie),Se=new qS(w,qe),we=new wS,te=new IS(Ye),O=new zx(w,P,ye,de,p,c),be=new FS(w,de,at),We=new YS(U,Ot,at,ye),ee=new Hx(U,Ye,Ot),Te=new tv(U,Ye,Ot),Ot.programs=oe.programs,w.capabilities=at,w.extensions=Ye,w.properties=qe,w.renderLists=we,w.shadowMap=be,w.state=ye,w.info=Ot}v!==yn&&(R=new ov(v,t.width,t.height,a,s,r));const me=new WS(w,U);this.xr=me,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){const A=Ye.get("WEBGL_lose_context");A&&A.loseContext()},this.forceContextRestore=function(){const A=Ye.get("WEBGL_lose_context");A&&A.restoreContext()},this.getPixelRatio=function(){return ce},this.setPixelRatio=function(A){A!==void 0&&(ce=A,this.setSize(ne,fe,!1))},this.getSize=function(A){return A.set(ne,fe)},this.setSize=function(A,z,J=!0){if(me.isPresenting){Ve("WebGLRenderer: Can't change size while VR device is presenting.");return}ne=A,fe=z,t.width=Math.floor(A*ce),t.height=Math.floor(z*ce),J===!0&&(t.style.width=A+"px",t.style.height=z+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,A,z)},this.getDrawingBufferSize=function(A){return A.set(ne*ce,fe*ce).floor()},this.setDrawingBufferSize=function(A,z,J){ne=A,fe=z,ce=J,t.width=Math.floor(A*J),t.height=Math.floor(z*J),this.setViewport(0,0,A,z)},this.setEffects=function(A){if(v===yn){$e("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(A){for(let z=0;z<A.length;z++)if(A[z].isOutputPass===!0){Ve("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(A||[])},this.getCurrentViewport=function(A){return A.copy(V)},this.getViewport=function(A){return A.copy(se)},this.setViewport=function(A,z,J,W){A.isVector4?se.set(A.x,A.y,A.z,A.w):se.set(A,z,J,W),ye.viewport(V.copy(se).multiplyScalar(Ce()).round())},this.getScissor=function(A){return A.copy(ge)},this.setScissor=function(A,z,J,W){A.isVector4?ge.set(A.x,A.y,A.z,A.w):ge.set(A,z,J,W),ye.scissor(ue.copy(ge).multiplyScalar(Ce()).round())},this.getScissorTest=function(){return Ue},this.setScissorTest=function(A){ye.setScissorTest(Ue=A)},this.setOpaqueSort=function(A){pe=A},this.setTransparentSort=function(A){He=A},this.getClearColor=function(A){return A.copy(O.getClearColor())},this.setClearColor=function(){O.setClearColor(...arguments)},this.getClearAlpha=function(){return O.getClearAlpha()},this.setClearAlpha=function(){O.setClearAlpha(...arguments)},this.clear=function(A=!0,z=!0,J=!0){let W=0;if(A){let q=!1;if(Q!==null){const Ae=Q.texture.format;q=g.has(Ae)}if(q){const Ae=Q.texture.type,Fe=m.has(Ae),Ee=O.getClearColor(),Ie=O.getClearAlpha(),Ge=Ee.r,je=Ee.g,ht=Ee.b;Fe?(x[0]=Ge,x[1]=je,x[2]=ht,x[3]=Ie,U.clearBufferuiv(U.COLOR,0,x)):(y[0]=Ge,y[1]=je,y[2]=ht,y[3]=Ie,U.clearBufferiv(U.COLOR,0,y))}else W|=U.COLOR_BUFFER_BIT}z&&(W|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),J&&(W|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),W!==0&&U.clear(W)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(A){A.setRenderer(this),N=A},this.dispose=function(){t.removeEventListener("webglcontextlost",Xe,!1),t.removeEventListener("webglcontextrestored",nt,!1),t.removeEventListener("webglcontextcreationerror",Pe,!1),O.dispose(),we.dispose(),te.dispose(),Je.dispose(),qe.dispose(),P.dispose(),de.dispose(),X.dispose(),Me.dispose(),We.dispose(),oe.dispose(),me.dispose(),me.removeEventListener("sessionstart",Tu),me.removeEventListener("sessionend",Eu),$i.stop()};function Xe(A){A.preventDefault(),ua("WebGLRenderer: Context Lost."),C=!0}function nt(){ua("WebGLRenderer: Context Restored."),C=!1;const A=Ot.autoReset,z=be.enabled,J=be.autoUpdate,W=be.needsUpdate,q=be.type;st(),Ot.autoReset=A,be.enabled=z,be.autoUpdate=J,be.needsUpdate=W,be.type=q}function Pe(A){$e("WebGLRenderer: A WebGL context could not be created. Reason: ",A.statusMessage)}function vt(A){const z=A.target;z.removeEventListener("dispose",vt),Yt(z)}function Yt(A){Li(A),qe.remove(A)}function Li(A){const z=qe.get(A).programs;z!==void 0&&(z.forEach(function(J){oe.releaseProgram(J)}),A.isShaderMaterial&&oe.releaseShaderCache(A))}this.renderBufferDirect=function(A,z,J,W,q,Ae){z===null&&(z=$);const Fe=q.isMesh&&q.matrixWorld.determinantAffine()<0,Ee=lp(A,z,J,W,q);ye.setMaterial(W,Fe);let Ie=J.index,Ge=1;if(W.wireframe===!0){if(Ie=X.getWireframeAttribute(J),Ie===void 0)return;Ge=2}const je=J.drawRange,ht=J.attributes.position;let Be=je.start*Ge,ft=(je.start+je.count)*Ge;Ae!==null&&(Be=Math.max(Be,Ae.start*Ge),ft=Math.min(ft,(Ae.start+Ae.count)*Ge)),Ie!==null?(Be=Math.max(Be,0),ft=Math.min(ft,Ie.count)):ht!=null&&(Be=Math.max(Be,0),ft=Math.min(ft,ht.count));const Ft=ft-Be;if(Ft<0||Ft===1/0)return;Me.setup(q,W,Ee,J,Ie);let Rt,Tt=ee;if(Ie!==null&&(Rt=T.get(Ie),Tt=Te,Tt.setIndex(Rt)),q.isMesh)W.wireframe===!0?(ye.setLineWidth(W.wireframeLinewidth*Ce()),Tt.setMode(U.LINES)):Tt.setMode(U.TRIANGLES);else if(q.isLine){let tn=W.linewidth;tn===void 0&&(tn=1),ye.setLineWidth(tn*Ce()),q.isLineSegments?Tt.setMode(U.LINES):q.isLineLoop?Tt.setMode(U.LINE_LOOP):Tt.setMode(U.LINE_STRIP)}else q.isPoints?Tt.setMode(U.POINTS):q.isSprite&&Tt.setMode(U.TRIANGLES);if(q.isBatchedMesh)if(Ye.get("WEBGL_multi_draw"))Tt.renderMultiDraw(q._multiDrawStarts,q._multiDrawCounts,q._multiDrawCount);else{const tn=q._multiDrawStarts,ze=q._multiDrawCounts,cn=q._multiDrawCount,_t=Ie?T.get(Ie).bytesPerElement:1,Ji=qe.get(W).currentProgram.getUniforms();for(let nn=0;nn<cn;nn++)Ji.setValue(U,"_gl_DrawID",nn),Tt.render(tn[nn]/_t,ze[nn])}else if(q.isInstancedMesh)Tt.renderInstances(Be,Ft,q.count);else if(J.isInstancedBufferGeometry){const tn=J._maxInstanceCount!==void 0?J._maxInstanceCount:1/0,ze=Math.min(J.instanceCount,tn);Tt.renderInstances(Be,Ft,ze)}else Tt.render(Be,Ft)};function bu(A,z,J,W){N!==null&&A.isNodeMaterial&&N.setObject(W,A),ae===!0&&ie.setState(A,J,!1),A.transparent===!0&&A.side===Gn&&A.forceSinglePass===!1?(A.side=ln,A.needsUpdate=!0,rr(A,z,W),A.side=Xi,A.needsUpdate=!0,rr(A,z,W),A.side=Gn):rr(A,z,W)}this.compile=function(A,z,J=null){J===null&&(J=A),N!==null&&N.renderStart(A,z,J),b=te.get(J),b.init(z),M.push(b),J.traverseVisible(function(q){q.isLight&&q.layers.test(z.layers)&&(b.pushLight(q),q.castShadow&&b.pushShadow(q))}),A!==J&&A.traverseVisible(function(q){q.isLight&&q.layers.test(z.layers)&&(b.pushLight(q),q.castShadow&&b.pushShadow(q))}),b.setupLights(),N!==null&&N.updateLights(b.state.lightsArray),ve=this.localClippingEnabled,ae=ie.init(this.clippingPlanes,ve),ae===!0&&ie.setGlobalState(this.clippingPlanes,z),N!==null&&be.render(b.state.shadowsArray,J,z);const W=new Set;return A.traverse(function(q){if(!(q.isMesh||q.isPoints||q.isLine||q.isSprite))return;const Ae=q.material;if(Ae)if(Array.isArray(Ae))for(let Fe=0;Fe<Ae.length;Fe++){const Ee=Ae[Fe];bu(Ee,J,z,q),W.add(Ee)}else bu(Ae,J,z,q),W.add(Ae)}),b=M.pop(),N!==null&&N.renderEnd(),W},this.compileAsync=function(A,z,J=null){const W=this.compile(A,z,J);return new Promise(q=>{function Ae(){if(W.forEach(function(Fe){const Ie=qe.get(Fe).currentProgram;(Ie===void 0||Ie.isReady())&&W.delete(Fe)}),W.size===0){q(A);return}setTimeout(Ae,10)}Ye.get("KHR_parallel_shader_compile")!==null?Ae():setTimeout(Ae,10)})};let Na=null;function op(A){Na&&Na(A)}function Tu(){$i.stop()}function Eu(){$i.start()}const $i=new Ud;$i.setAnimationLoop(op),typeof self<"u"&&$i.setContext(self),this.setAnimationLoop=function(A){Na=A,me.setAnimationLoop(A),A===null?$i.stop():$i.start()},me.addEventListener("sessionstart",Tu),me.addEventListener("sessionend",Eu),this.render=function(A,z){if(z!==void 0&&z.isCamera!==!0){$e("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(C===!0)return;N!==null&&N.renderStart(A,z);const J=me.enabled===!0&&me.isPresenting===!0,W=R!==null&&(Q===null||J)&&R.begin(w,Q);if(A.matrixWorldAutoUpdate===!0&&A.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),me.enabled===!0&&me.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(me.cameraAutoUpdate===!0&&me.updateCamera(z),z=me.getCamera()),A.isScene===!0&&A.onBeforeRender(w,A,z,Q),b=te.get(A,M.length),b.init(z),b.state.textureUnits=Je.getTextureUnits(),M.push(b),j.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),z.isArrayCamera?le.setFromArrayCamera(z):Y.setFromProjectionMatrix(j,Xn,z.reversedDepth),ve=this.localClippingEnabled,ae=ie.init(this.clippingPlanes,ve),E=we.get(A,_.length),E.init(),_.push(E),this.info.render.frame++,me.enabled===!0&&me.isPresenting===!0){const Fe=w.xr.getDepthSensingMesh();Fe!==null&&Da(Fe,z,-1/0,w.sortObjects)}Da(A,z,0,w.sortObjects),E.finish(),N!==null&&N.updateLights(b.state.lightsArray),w.sortObjects===!0&&E.sort(pe,He),_e=me.enabled===!1||me.isPresenting===!1||me.hasDepthSensing()===!1,_e&&O.addToRenderList(E,A),this.info.autoReset===!0&&this.info.reset(),ae===!0&&ie.beginShadows();const q=b.state.shadowsArray;if(be.render(q,A,z),ae===!0&&ie.endShadows(),(W&&R.hasRenderPass())===!1){const Fe=E.opaque,Ee=E.transmissive;if(b.setupLights(),z.isArrayCamera){const Ie=z.cameras;if(Ee.length>0)for(let Ge=0,je=Ie.length;Ge<je;Ge++){const ht=Ie[Ge];Au(Fe,Ee,A,ht)}_e&&O.render(A);for(let Ge=0,je=Ie.length;Ge<je;Ge++){const ht=Ie[Ge];wu(E,A,ht,ht.viewport)}}else Ee.length>0&&Au(Fe,Ee,A,z),_e&&O.render(A),wu(E,A,z)}Q!==null&&k===0&&(Je.updateMultisampleRenderTarget(Q),Je.updateRenderTargetMipmap(Q)),W&&R.end(w),A.isScene===!0&&A.onAfterRender(w,A,z),Me.resetDefaultState(),G=-1,Z=null,M.pop(),M.length>0?(b=M[M.length-1],Je.setTextureUnits(b.state.textureUnits),ae===!0&&ie.setGlobalState(w.clippingPlanes,b.state.camera)):b=null,_.pop(),_.length>0?E=_[_.length-1]:E=null,N!==null&&N.renderEnd()};function Da(A,z,J,W){if(A.visible===!1)return;if(A.layers.test(z.layers)){if(A.isGroup)J=A.renderOrder;else if(A.isLOD)A.autoUpdate===!0&&A.update(z);else if(A.isLight)b.pushLight(A),A.castShadow&&b.pushShadow(A);else if(A.isSprite){const Fe=z.isArrayCamera?le:Y;if(!A.frustumCulled||A.intersectsFrustum(Fe)){W&&Ne.setFromMatrixPosition(A.matrixWorld).applyMatrix4(j);const Ee=de.update(A),Ie=A.material;Ie.visible&&E.push(A,Ee,Ie,J,Ne.z,null,z)}}else if(A.isMesh||A.isLine||A.isPoints){const Fe=z.isArrayCamera?le:Y;if(!A.frustumCulled||A.intersectsFrustum(Fe)){const Ee=de.update(A),Ie=A.material;if(W&&(A.boundingSphere!==void 0?(A.boundingSphere===null&&A.computeBoundingSphere(),Ne.copy(A.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),Ne.copy(Ee.boundingSphere.center)),Ne.applyMatrix4(A.matrixWorld).applyMatrix4(j)),Array.isArray(Ie)){const Ge=Ee.groups;for(let je=0,ht=Ge.length;je<ht;je++){const Be=Ge[je],ft=Ie[Be.materialIndex];ft&&ft.visible&&E.push(A,Ee,ft,J,Ne.z,Be,z)}}else Ie.visible&&E.push(A,Ee,Ie,J,Ne.z,null,z)}}}const Ae=A.children;for(let Fe=0,Ee=Ae.length;Fe<Ee;Fe++)Da(Ae[Fe],z,J,W)}function wu(A,z,J,W){const{opaque:q,transmissive:Ae,transparent:Fe}=A;b.setupLightsView(J),ae===!0&&ie.setGlobalState(w.clippingPlanes,J),W&&ye.viewport(V.copy(W)),q.length>0&&ho(q,z,J),Ae.length>0&&ho(Ae,z,J),Fe.length>0&&ho(Fe,z,J),ye.buffers.depth.setTest(!0),ye.buffers.depth.setMask(!0),ye.buffers.color.setMask(!0),ye.setPolygonOffset(!1)}function Au(A,z,J,W){if((J.isScene===!0?J.overrideMaterial:null)!==null)return;if(b.state.transmissionRenderTarget[W.id]===void 0){const Be=Ye.has("EXT_color_buffer_half_float")||Ye.has("EXT_color_buffer_float");b.state.transmissionRenderTarget[W.id]=new Nn(1,1,{generateMipmaps:!0,type:Be?Un:yn,minFilter:ti,samples:Math.max(4,at.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:ct.workingColorSpace})}const Ae=b.state.transmissionRenderTarget[W.id],Fe=W.viewport||V;Ae.setSize(Fe.z*w.transmissionResolutionScale,Fe.w*w.transmissionResolutionScale);const Ee=w.getRenderTarget(),Ie=w.getActiveCubeFace(),Ge=w.getActiveMipmapLevel();w.setRenderTarget(Ae),w.getClearColor(D),K=w.getClearAlpha(),K<1&&w.setClearColor(16777215,.5),w.clear(),_e&&O.render(J);const je=w.toneMapping;w.toneMapping=Ri;const ht=W.viewport;if(W.viewport!==void 0&&(W.viewport=void 0),b.setupLightsView(W),ae===!0&&ie.setGlobalState(w.clippingPlanes,W),ho(A,J,W),Je.updateMultisampleRenderTarget(Ae),Je.updateRenderTargetMipmap(Ae),Ye.has("WEBGL_multisampled_render_to_texture")===!1){let Be=!1;for(let ft=0,Ft=z.length;ft<Ft;ft++){const Rt=z[ft],{object:Tt,geometry:tn,material:ze,group:cn}=Rt;if(ze.side===Gn&&Tt.layers.test(W.layers)){const _t=ze.side;ze.side=ln,ze.needsUpdate=!0,Ru(Tt,J,W,tn,ze,cn),ze.side=_t,ze.needsUpdate=!0,Be=!0}}Be===!0&&(Je.updateMultisampleRenderTarget(Ae),Je.updateRenderTargetMipmap(Ae))}w.setRenderTarget(Ee,Ie,Ge),w.setClearColor(D,K),ht!==void 0&&(W.viewport=ht),w.toneMapping=je}function ho(A,z,J){const W=z.isScene===!0?z.overrideMaterial:null;for(let q=0,Ae=A.length;q<Ae;q++){const Fe=A[q],{object:Ee,geometry:Ie,group:Ge}=Fe;let je=Fe.material;je.allowOverride===!0&&W!==null&&(je=W),Ee.layers.test(J.layers)&&Ru(Ee,z,J,Ie,je,Ge)}}function Ru(A,z,J,W,q,Ae){N!==null&&q.isNodeMaterial&&N.setObject(A,q),A.onBeforeRender(w,z,J,W,q,Ae),A.modelViewMatrix.multiplyMatrices(J.matrixWorldInverse,A.matrixWorld),A.normalMatrix.getNormalMatrix(A.modelViewMatrix),q.onBeforeRender(w,z,J,W,A,Ae),q.transparent===!0&&q.side===Gn&&q.forceSinglePass===!1?(q.side=ln,q.needsUpdate=!0,w.renderBufferDirect(J,z,W,q,A,Ae),q.side=Xi,q.needsUpdate=!0,w.renderBufferDirect(J,z,W,q,A,Ae),q.side=Gn):w.renderBufferDirect(J,z,W,q,A,Ae),A.onAfterRender(w,z,J,W,q,Ae)}function Cu(A){let z=0;for(const J of A)J.texture!==null&&z++;return z}function rr(A,z,J){z.isScene!==!0&&(z=$);const W=qe.get(A),q=b.state.lights,Ae=b.state.shadowsArray,Fe=q.state.version,Ee=oe.getParameters(A,q.state,Ae,z,J,b.state.lightProbeGridArray),Ie=oe.getProgramCacheKey(Ee);let Ge=W.programs;W.environment=A.isMeshStandardMaterial||A.isMeshLambertMaterial||A.isMeshPhongMaterial?z.environment:null,W.fog=z.fog;const je=A.isMeshStandardMaterial||A.isMeshLambertMaterial&&!A.envMap||A.isMeshPhongMaterial&&!A.envMap;W.envMap=P.get(A.envMap||W.environment,je),W.envMapRotation=W.environment!==null&&A.envMap===null?z.environmentRotation:A.envMapRotation,Ge===void 0&&(A.addEventListener("dispose",vt),Ge=new Map,W.programs=Ge,W.programVariants=new Map);let ht=Ge.get(Ie);if(ht!==void 0){if(W.currentProgram===ht&&W.lightsStateVersion===Fe)return Lu(A,Ee),ht}else Ee.uniforms=oe.getUniforms(A),N!==null&&A.isNodeMaterial&&N.build(A,J,Ee),A.onBeforeCompile(Ee,w),ht=oe.acquireProgram(Ee,Ie),Ge.set(Ie,ht),W.uniforms=Ee.uniforms;const Be=W.uniforms;return(!A.isShaderMaterial&&!A.isRawShaderMaterial||A.clipping===!0)&&(Be.clippingPlanes=ie.uniform),Lu(A,Ee),W.needsLights=up(A),W.lightsStateVersion=Fe,W.needsLights&&(Be.ambientLightColor.value=q.state.ambient,Be.lightProbe.value=q.state.probe,Be.sunLights.value=q.state.sun,Be.sunLightShadows.value=q.state.sunShadow,Be.directionalLights.value=q.state.directional,Be.directionalLightShadows.value=q.state.directionalShadow,Be.spotLights.value=q.state.spot,Be.spotLightShadows.value=q.state.spotShadow,Be.rectAreaLights.value=q.state.rectArea,Be.ltc_1.value=q.state.rectAreaLTC1,Be.ltc_2.value=q.state.rectAreaLTC2,Be.pointLights.value=q.state.point,Be.pointLightShadows.value=q.state.pointShadow,Be.hemisphereLights.value=q.state.hemi,Be.sunShadowMatrix.value=q.state.sunShadowMatrix,Be.sunShadowCascade.value=q.state.sunShadowCascade,Be.directionalShadowMatrix.value=q.state.directionalShadowMatrix,Be.spotLightMatrix.value=q.state.spotLightMatrix,Be.spotLightMap.value=q.state.spotLightMap,Be.pointShadowMatrix.value=q.state.pointShadowMatrix),W.numLightProbeGrids=Cu(b.state.lightProbeGridArray),W.currentProgram=ht,W.uniformsList=null,ht}function ap(A,z,J,W,q){const Ae=qe.get(A),Fe=Ae.currentProgram.id+","+W+","+q;let Ee=Ae.programVariants.get(Fe);return Ee===void 0?(Ee=rr(A,z,J),Ae.programVariants.set(Fe,Ee)):(Ae.currentProgram=Ee,Ae.uniformsList=null,Ae.outputColorSpace=W,Ae.toneMapping=q),Ee}function Pu(A){if(A.uniformsList===null){const z=A.currentProgram.getUniforms();A.uniformsList=ta.seqWithValue(z.seq,A.uniforms)}return A.uniformsList}function Lu(A,z){const J=qe.get(A);J.outputColorSpace=z.outputColorSpace,J.batching=z.batching,J.batchingColor=z.batchingColor,J.instancing=z.instancing,J.instancingColor=z.instancingColor,J.instancingMorph=z.instancingMorph,J.skinning=z.skinning,J.morphTargets=z.morphTargets,J.morphNormals=z.morphNormals,J.morphColors=z.morphColors,J.morphTargetsCount=z.morphTargetsCount,J.numClippingPlanes=z.numClippingPlanes,J.numIntersection=z.numClipIntersection,J.vertexAlphas=z.vertexAlphas,J.vertexTangents=z.vertexTangents,J.toneMapping=z.toneMapping}function lp(A,z,J,W,q){z.isScene!==!0&&(z=$),Je.resetTextureUnits();const Ae=z.fog,Fe=W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial?z.environment:null,Ee=Q===null?w.outputColorSpace:Q.isXRRenderTarget===!0?Q.texture.colorSpace:ct.workingColorSpace,Ie=W.isMeshStandardMaterial||W.isMeshLambertMaterial&&!W.envMap||W.isMeshPhongMaterial&&!W.envMap,Ge=P.get(W.envMap||Fe,Ie),je=W.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,ht=!!J.attributes.tangent&&(!!W.normalMap||W.anisotropy>0),Be=!!J.morphAttributes.position,ft=!!J.morphAttributes.normal,Ft=!!J.morphAttributes.color;let Rt=Ri;W.toneMapped&&(Q===null||Q.isXRRenderTarget===!0)&&(Rt=w.toneMapping);const Tt=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,tn=Tt!==void 0?Tt.length:0,ze=qe.get(W),cn=b.state.lights;if(ae===!0&&(ve===!0||A!==Z)){const Nt=A===Z&&W.id===G;ie.setState(W,A,Nt)}let _t=!1,Ji=!1;W.version===ze.__version?ze.needsLights&&ze.lightsStateVersion!==cn.state.version||q.isBatchedMesh&&ze.batching===!1||!q.isBatchedMesh&&ze.batching===!0||q.isBatchedMesh&&ze.batchingColor===!0&&q._colorsTexture===null||q.isBatchedMesh&&ze.batchingColor===!1&&q._colorsTexture!==null||q.isInstancedMesh&&ze.instancing===!1||!q.isInstancedMesh&&ze.instancing===!0||q.isSkinnedMesh&&ze.skinning===!1||!q.isSkinnedMesh&&ze.skinning===!0||q.isInstancedMesh&&ze.instancingColor===!0&&q.instanceColor===null||q.isInstancedMesh&&ze.instancingColor===!1&&q.instanceColor!==null||q.isInstancedMesh&&ze.instancingMorph===!0&&q.morphTexture===null||q.isInstancedMesh&&ze.instancingMorph===!1&&q.morphTexture!==null||ze.envMap!==Ge||W.fog===!0&&ze.fog!==Ae||ze.numClippingPlanes!==void 0&&(ze.numClippingPlanes!==ie.numPlanes||ze.numIntersection!==ie.numIntersection)||ze.vertexAlphas!==je||ze.vertexTangents!==ht||ze.morphTargets!==Be||ze.morphNormals!==ft||ze.morphColors!==Ft||ze.morphTargetsCount!==tn||ze.numLightProbeGrids!==Cu(b.state.lightProbeGridArray)?_t=!0:(ze.outputColorSpace!==Ee||ze.toneMapping!==Rt)&&(Ji=!0):(_t=!0,ze.__version=W.version);let nn=ze.currentProgram;(_t===!0||Ji===!0)&&(nn=Ji===!0?ap(W,z,q,Ee,Rt):rr(W,z,q),N&&W.isNodeMaterial&&N.onUpdateProgram(W,nn,ze));let fo=!1,Ii=!1,Zi=!1;const pt=nn.getUniforms(),Zt=ze.uniforms;if(ye.useProgram(nn.program)&&(fo=!0,Ii=!0,Zi=!0),W.id!==G&&(G=W.id,Ii=!0),fo||Z!==A){ye.buffers.depth.getReversed()&&A.reversedDepth!==!0&&(A._reversedDepth=!0,A.updateProjectionMatrix()),pt.setValue(U,"projectionMatrix",A.projectionMatrix),pt.setValue(U,"viewMatrix",A.matrixWorldInverse);const Kt=pt.map.cameraPosition;Kt!==void 0&&Kt.setValue(U,De.setFromMatrixPosition(A.matrixWorld)),at.logarithmicDepthBuffer&&pt.setValue(U,"logDepthBufFC",2/(Math.log(A.far+1)/Math.LN2)),(W.isMeshPhongMaterial||W.isMeshToonMaterial||W.isMeshLambertMaterial||W.isMeshBasicMaterial||W.isMeshStandardMaterial||W.isShaderMaterial)&&pt.setValue(U,"isOrthographic",A.isOrthographicCamera===!0),Z!==A&&(Z=A,Ii=!0,Zi=!0)}if(ze.needsLights&&(cn.state.sunShadowMap.length>0&&pt.setValue(U,"sunShadowMap",cn.state.sunShadowMap,Je),cn.state.directionalShadowMap.length>0&&pt.setValue(U,"directionalShadowMap",cn.state.directionalShadowMap,Je),cn.state.spotShadowMap.length>0&&pt.setValue(U,"spotShadowMap",cn.state.spotShadowMap,Je),cn.state.pointShadowMap.length>0&&pt.setValue(U,"pointShadowMap",cn.state.pointShadowMap,Je)),q.isSkinnedMesh){pt.setOptional(U,q,"bindMatrix"),pt.setOptional(U,q,"bindMatrixInverse");const Nt=q.skeleton;Nt&&(Nt.boneTexture===null&&Nt.computeBoneTexture(),pt.setValue(U,"boneTexture",Nt.boneTexture,Je))}q.isBatchedMesh&&(pt.setOptional(U,q,"batchingTexture"),pt.setValue(U,"batchingTexture",q._matricesTexture,Je),pt.setOptional(U,q,"batchingIdTexture"),pt.setValue(U,"batchingIdTexture",q._indirectTexture,Je),pt.setOptional(U,q,"batchingColorTexture"),q._colorsTexture!==null&&pt.setValue(U,"batchingColorTexture",q._colorsTexture,Je));const On=J.morphAttributes;if((On.position!==void 0||On.normal!==void 0||On.color!==void 0)&&re.update(q,J,nn),(Ii||ze.receiveShadow!==q.receiveShadow)&&(ze.receiveShadow=q.receiveShadow,pt.setValue(U,"receiveShadow",q.receiveShadow)),(W.isMeshStandardMaterial||W.isMeshLambertMaterial||W.isMeshPhongMaterial)&&W.envMap===null&&z.environment!==null&&(Zt.envMapIntensity.value=z.environmentIntensity),Zt.dfgLUT!==void 0&&(Zt.dfgLUT.value=$S()),Ii){if(pt.setValue(U,"toneMappingExposure",w.toneMappingExposure),ze.needsLights&&cp(Zt,Zi),Ae&&W.fog===!0&&Se.refreshFogUniforms(Zt,Ae),Se.refreshMaterialUniforms(Zt,W,ce,fe,b.state.transmissionRenderTarget[A.id]),ze.needsLights&&ze.numLightProbeGrids>0){const Nt=S;let Kt=0;for(const ui of b.state.lightProbeGridArray)ui.texture!==null&&(Nt.textures[Kt]=ui.texture,Nt.min[Kt]=ui.boundingBox.min,Nt.max[Kt]=ui.boundingBox.max,Nt.resolution[Kt]=ui.resolution,Kt++);for(const ui in Nt)Nt[ui].length=Kt;Zt.probesSH.value=Nt.textures,Zt.probesMin.value=Nt.min,Zt.probesMax.value=Nt.max,Zt.probesResolution.value=Nt.resolution}ta.upload(U,Pu(ze),Zt,Je)}if(W.isShaderMaterial&&W.uniformsNeedUpdate===!0&&(ta.upload(U,Pu(ze),Zt,Je),W.uniformsNeedUpdate=!1),W.isSpriteMaterial&&pt.setValue(U,"center",q.center),pt.setValue(U,"modelViewMatrix",q.modelViewMatrix),pt.setValue(U,"normalMatrix",q.normalMatrix),pt.setValue(U,"modelMatrix",q.matrixWorld),W.uniformsGroups!==void 0){const Nt=W.uniformsGroups;for(let Kt=0,ui=Nt.length;Kt<ui;Kt++){const Nu=Nt[Kt];We.update(Nu,nn),We.bind(Nu,nn)}}return nn}function cp(A,z){A.ambientLightColor.needsUpdate=z,A.lightProbe.needsUpdate=z,A.sunLights.needsUpdate=z,A.sunLightShadows.needsUpdate=z,A.directionalLights.needsUpdate=z,A.directionalLightShadows.needsUpdate=z,A.pointLights.needsUpdate=z,A.pointLightShadows.needsUpdate=z,A.spotLights.needsUpdate=z,A.spotLightShadows.needsUpdate=z,A.rectAreaLights.needsUpdate=z,A.hemisphereLights.needsUpdate=z}function up(A){return A.isMeshLambertMaterial||A.isMeshToonMaterial||A.isMeshPhongMaterial||A.isMeshStandardMaterial||A.isShadowMaterial||A.isShaderMaterial&&A.lights===!0}this.getActiveCubeFace=function(){return H},this.getActiveMipmapLevel=function(){return k},this.getRenderTarget=function(){return Q},this.setRenderTargetTextures=function(A,z,J){const W=qe.get(A);W.__autoAllocateDepthBuffer=A.resolveDepthBuffer===!1,W.__autoAllocateDepthBuffer===!1&&(W.__useRenderToTexture=!1),qe.get(A.texture).__webglTexture=z,qe.get(A.depthTexture).__webglTexture=W.__autoAllocateDepthBuffer?void 0:J,W.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(A,z){const J=qe.get(A);J.__webglFramebuffer=z,J.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(A,z=0,J=0){Q=A,H=z,k=J;let W=null,q=!1,Ae=!1;if(A){const Ee=qe.get(A);if(Ee.__useDefaultFramebuffer!==void 0){ye.bindFramebuffer(U.FRAMEBUFFER,Ee.__webglFramebuffer),V.copy(A.viewport),ue.copy(A.scissor),Re=A.scissorTest,ye.viewport(V),ye.scissor(ue),ye.setScissorTest(Re),G=-1;return}else if(Ee.__webglFramebuffer===void 0)Je.setupRenderTarget(A);else if(Ee.__hasExternalTextures)Je.rebindTextures(A,qe.get(A.texture).__webglTexture,qe.get(A.depthTexture).__webglTexture);else if(A.depthBuffer){const je=A.depthTexture;if(Ee.__boundDepthTexture!==je){if(je!==null&&qe.has(je)&&(A.width!==je.image.width||A.height!==je.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");Je.setupDepthRenderbuffer(A)}}const Ie=A.texture;(Ie.isData3DTexture||Ie.isDataArrayTexture||Ie.isCompressedArrayTexture)&&(Ae=!0);const Ge=qe.get(A).__webglFramebuffer;A.isWebGLCubeRenderTarget?(Array.isArray(Ge[z])?W=Ge[z][J]:W=Ge[z],q=!0):A.samples>0&&Je.useMultisampledRTT(A)===!1?W=qe.get(A).__webglMultisampledFramebuffer:Array.isArray(Ge)?W=Ge[J]:W=Ge,V.copy(A.viewport),ue.copy(A.scissor),Re=A.scissorTest}else V.copy(se).multiplyScalar(ce).floor(),ue.copy(ge).multiplyScalar(ce).floor(),Re=Ue;if(J!==0&&(W=F),ye.bindFramebuffer(U.FRAMEBUFFER,W)&&ye.drawBuffers(A,W),ye.viewport(V),ye.scissor(ue),ye.setScissorTest(Re),q){const Ee=qe.get(A.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+z,Ee.__webglTexture,J)}else if(Ae){const Ee=z;for(let Ie=0;Ie<A.textures.length;Ie++){const Ge=qe.get(A.textures[Ie]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+Ie,Ge.__webglTexture,J,Ee)}}else if(A!==null&&J!==0){const Ee=qe.get(A.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Ee.__webglTexture,J)}G=-1};function Iu(A){const z=qe.get(A);return(z.__readFormat!==A.format||z.__readType!==A.type)&&(z.__readFormat=A.format,z.__readType=A.type,z.__formatReadable=at.textureFormatReadable(A.format),z.__typeReadable=at.textureTypeReadable(A.type)),z}this.readRenderTargetPixels=function(A,z,J,W,q,Ae,Fe,Ee=0){if(!(A&&A.isWebGLRenderTarget)){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Ie=qe.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Fe!==void 0&&(Ie=Ie[Fe],Array.isArray(Ie)&&(Ie=Ie[0])),Ie){ye.bindFramebuffer(U.FRAMEBUFFER,Ie);try{const Ge=A.textures[Ee],je=Ge.format,ht=Ge.type;A.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ee);const Be=Iu(Ge);if(Be.__formatReadable===!1){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Be.__typeReadable===!1){$e("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=A.width-W&&J>=0&&J<=A.height-q&&U.readPixels(z,J,W,q,xe.convert(je),xe.convert(ht),Ae)}finally{const Ge=Q!==null?qe.get(Q).__webglFramebuffer:null;ye.bindFramebuffer(U.FRAMEBUFFER,Ge)}}},this.readRenderTargetPixelsAsync=async function(A,z,J,W,q,Ae,Fe,Ee=0){if(!(A&&A.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Ie=qe.get(A).__webglFramebuffer;if(A.isWebGLCubeRenderTarget&&Fe!==void 0&&(Ie=Ie[Fe],Array.isArray(Ie)&&(Ie=Ie[0])),Ie)if(z>=0&&z<=A.width-W&&J>=0&&J<=A.height-q){ye.bindFramebuffer(U.FRAMEBUFFER,Ie);const Ge=A.textures[Ee],je=Ge.format,ht=Ge.type;A.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Ee);const Be=Iu(Ge);if(Be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const ft=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,ft),U.bufferData(U.PIXEL_PACK_BUFFER,Ae.byteLength,U.STREAM_READ),U.readPixels(z,J,W,q,xe.convert(je),xe.convert(ht),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);const Ft=Q!==null?qe.get(Q).__webglFramebuffer:null;ye.bindFramebuffer(U.FRAMEBUFFER,Ft);const Rt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Jp(U,Rt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,ft),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,Ae),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(ft),U.deleteSync(Rt),Ae}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(A,z=null,J=0){const W=Math.pow(2,-J),q=Math.floor(A.image.width*W),Ae=Math.floor(A.image.height*W),Fe=z!==null?z.x:0,Ee=z!==null?z.y:0;Je.setTexture2D(A,0),U.copyTexSubImage2D(U.TEXTURE_2D,J,0,0,Fe,Ee,q,Ae),ye.unbindTexture()},this.copyTextureToTexture=function(A,z,J=null,W=null,q=0,Ae=0){let Fe,Ee,Ie,Ge,je,ht,Be,ft,Ft;const Rt=A.isCompressedTexture?A.mipmaps[Ae]:A.image;if(J!==null)Fe=J.max.x-J.min.x,Ee=J.max.y-J.min.y,Ie=J.isBox3?J.max.z-J.min.z:1,Ge=J.min.x,je=J.min.y,ht=J.isBox3?J.min.z:0;else{const pt=Math.pow(2,-q);Fe=Math.floor(Rt.width*pt),Ee=Math.floor(Rt.height*pt),A.isDataArrayTexture?Ie=Rt.depth:A.isData3DTexture?Ie=Math.floor(Rt.depth*pt):Ie=1,Ge=0,je=0,ht=0}W!==null?(Be=W.x,ft=W.y,Ft=W.z):(Be=0,ft=0,Ft=0);const Tt=xe.convert(z.format),tn=xe.convert(z.type);let ze;z.isData3DTexture?(Je.setTexture3D(z,0),ze=U.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(Je.setTexture2DArray(z,0),ze=U.TEXTURE_2D_ARRAY):(Je.setTexture2D(z,0),ze=U.TEXTURE_2D),ye.activeTexture(U.TEXTURE0),ye.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,z.flipY),ye.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),ye.pixelStorei(U.UNPACK_ALIGNMENT,z.unpackAlignment);const cn=ye.getParameter(U.UNPACK_ROW_LENGTH),_t=ye.getParameter(U.UNPACK_IMAGE_HEIGHT),Ji=ye.getParameter(U.UNPACK_SKIP_PIXELS),nn=ye.getParameter(U.UNPACK_SKIP_ROWS),fo=ye.getParameter(U.UNPACK_SKIP_IMAGES);ye.pixelStorei(U.UNPACK_ROW_LENGTH,Rt.width),ye.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Rt.height),ye.pixelStorei(U.UNPACK_SKIP_PIXELS,Ge),ye.pixelStorei(U.UNPACK_SKIP_ROWS,je),ye.pixelStorei(U.UNPACK_SKIP_IMAGES,ht);const Ii=A.isDataArrayTexture||A.isData3DTexture,Zi=z.isDataArrayTexture||z.isData3DTexture;if(A.isDepthTexture){const pt=qe.get(A),Zt=qe.get(z),On=qe.get(pt.__renderTarget),Nt=qe.get(Zt.__renderTarget);ye.bindFramebuffer(U.READ_FRAMEBUFFER,On.__webglFramebuffer),ye.bindFramebuffer(U.DRAW_FRAMEBUFFER,Nt.__webglFramebuffer);for(let Kt=0;Kt<Ie;Kt++)Ii&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,qe.get(A).__webglTexture,q,ht+Kt),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,qe.get(z).__webglTexture,Ae,Ft+Kt)),U.blitFramebuffer(Ge,je,Ge+Fe,je+Ee,Be,ft,Be+Fe,ft+Ee,U.DEPTH_BUFFER_BIT,U.NEAREST);ye.bindFramebuffer(U.READ_FRAMEBUFFER,null),ye.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(q!==0||A.isRenderTargetTexture||qe.has(A)){const pt=qe.get(A),Zt=qe.get(z);ye.bindFramebuffer(U.READ_FRAMEBUFFER,I),ye.bindFramebuffer(U.DRAW_FRAMEBUFFER,B);for(let On=0;On<Ie;On++)Ii?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,pt.__webglTexture,q,ht+On):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,pt.__webglTexture,q),Zi?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,Zt.__webglTexture,Ae,Ft+On):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Zt.__webglTexture,Ae),q!==0?U.blitFramebuffer(Ge,je,Ge+Fe,je+Ee,Be,ft,Be+Fe,ft+Ee,U.COLOR_BUFFER_BIT,U.NEAREST):Zi?U.copyTexSubImage3D(ze,Ae,Be,ft,Ft+On,Ge,je,Fe,Ee):U.copyTexSubImage2D(ze,Ae,Be,ft,Ge,je,Fe,Ee);ye.bindFramebuffer(U.READ_FRAMEBUFFER,null),ye.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else Zi?A.isDataTexture||A.isData3DTexture?U.texSubImage3D(ze,Ae,Be,ft,Ft,Fe,Ee,Ie,Tt,tn,Rt.data):z.isCompressedArrayTexture?U.compressedTexSubImage3D(ze,Ae,Be,ft,Ft,Fe,Ee,Ie,Tt,Rt.data):U.texSubImage3D(ze,Ae,Be,ft,Ft,Fe,Ee,Ie,Tt,tn,Rt):A.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,Ae,Be,ft,Fe,Ee,Tt,tn,Rt.data):A.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,Ae,Be,ft,Rt.width,Rt.height,Tt,Rt.data):U.texSubImage2D(U.TEXTURE_2D,Ae,Be,ft,Fe,Ee,Tt,tn,Rt);ye.pixelStorei(U.UNPACK_ROW_LENGTH,cn),ye.pixelStorei(U.UNPACK_IMAGE_HEIGHT,_t),ye.pixelStorei(U.UNPACK_SKIP_PIXELS,Ji),ye.pixelStorei(U.UNPACK_SKIP_ROWS,nn),ye.pixelStorei(U.UNPACK_SKIP_IMAGES,fo),Ae===0&&z.generateMipmaps===!0&&z.mipmapsAutoUpdate===!0&&U.generateMipmap(ze),ye.unbindTexture()},this.initRenderTarget=function(A){qe.get(A).__webglFramebuffer===void 0&&Je.setupRenderTarget(A)},this.initTexture=function(A){A.isCubeTexture?Je.setTextureCube(A,0):A.isData3DTexture?Je.setTexture3D(A,0):A.isDataArrayTexture||A.isCompressedArrayTexture?Je.setTexture2DArray(A,0):Je.setTexture2D(A,0),ye.unbindTexture()},this.resetState=function(){H=0,k=0,Q=null,ye.reset(),Me.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return Xn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ct._getDrawingBufferColorSpace(e),t.unpackColorSpace=ct._getUnpackColorSpace()}}const xr=new L;function Rn(i,e,t,n,s,r){const o=2*Math.PI*s/4,a=Math.max(r-2*s,0),c=Math.PI/4;xr.copy(e),xr[n]=0,xr.normalize();const l=.5*o/(o+a),u=1-xr.angleTo(i)/c;return Math.sign(xr[t])===1?u*l:a/(o+a)+l+l*(1-u)}class ci extends en{constructor(e=1,t=1,n=1,s=2,r=.1){const o=s*2+1;if(r=Math.min(e/2,t/2,n/2,r),super(1,1,1,o,o,o),this.type="RoundedBoxGeometry",this.parameters={width:e,height:t,depth:n,segments:s,radius:r},o===1)return;const a=this.toNonIndexed();this.index=null,this.attributes.position=a.attributes.position,this.attributes.normal=a.attributes.normal,this.attributes.uv=a.attributes.uv;const c=new L,l=new L,u=new L(e,t,n).divideScalar(2).subScalar(r),f=this.attributes.position.array,h=this.attributes.normal.array,d=this.attributes.uv.array,p=f.length/6,v=new L,g=.5/o;for(let m=0,x=0;m<f.length;m+=3,x+=2)switch(c.fromArray(f,m),l.copy(c),l.x-=Math.sign(l.x)*g,l.y-=Math.sign(l.y)*g,l.z-=Math.sign(l.z)*g,l.normalize(),f[m+0]=u.x*Math.sign(c.x)+l.x*r,f[m+1]=u.y*Math.sign(c.y)+l.y*r,f[m+2]=u.z*Math.sign(c.z)+l.z*r,h[m+0]=l.x,h[m+1]=l.y,h[m+2]=l.z,Math.floor(m/p)){case 0:v.set(1,0,0),d[x+0]=Rn(v,l,"z","y",r,n),d[x+1]=1-Rn(v,l,"y","z",r,t);break;case 1:v.set(-1,0,0),d[x+0]=1-Rn(v,l,"z","y",r,n),d[x+1]=1-Rn(v,l,"y","z",r,t);break;case 2:v.set(0,1,0),d[x+0]=1-Rn(v,l,"x","z",r,e),d[x+1]=Rn(v,l,"z","x",r,n);break;case 3:v.set(0,-1,0),d[x+0]=1-Rn(v,l,"x","z",r,e),d[x+1]=1-Rn(v,l,"z","x",r,n);break;case 4:v.set(0,0,1),d[x+0]=1-Rn(v,l,"x","y",r,e),d[x+1]=1-Rn(v,l,"y","x",r,t);break;case 5:v.set(0,0,-1),d[x+0]=Rn(v,l,"x","y",r,e),d[x+1]=1-Rn(v,l,"y","x",r,t);break}}static fromJSON(e){return new ci(e.width,e.height,e.depth,e.segments,e.radius)}}function ZS(){const i=new Kn;i.background=new Oe("#17232b");const e=(D,K=.7,ne=0)=>new Lt({color:D,roughness:K,metalness:ne}),t=D=>new it({color:D,toneMapped:!1}),n=e("#6b3e31"),s=e("#a86545"),r=e("#285251",.36),o=e("#223735"),a=e("#bc7f43",.34,.48),c=e("#ffe1bc",.42),l=e("#bd6857"),u=e("#242124",.34);function f(D,K,ne,fe,ce,pe=i){const He=new mt(D,K);return He.position.set(ne,fe,ce),He.castShadow=!0,He.receiveShadow=!0,pe.add(He),He}function h(D,K,ne,fe,ce,pe,He,se=i,ge=0){const Ue=ge?new ci(D,K,ne,2,ge):new en(D,K,ne);return f(Ue,He,fe,ce,pe,se)}function d(D,K,ne,fe,ce,pe,He,se=i){const ge=f(new Qt(1,28,18),He,fe,ce,pe,se);return ge.scale.set(D,K,ne),ge}function p(D,K,ne,fe,ce,pe=i){const He=new it({map:K,toneMapped:!1}),se=f(D,He,ne,fe,ce,pe);return se.castShadow=!1,se}i.add(new li("#dbeaff","#925732",1.45));const v=new Wt("#ffe4bb",2.1);v.position.set(-.58,.56,.6),v.target.position.set(0,-.1,-.55),v.castShadow=!0,v.shadow.mapSize.set(1024,1024),Object.assign(v.shadow.camera,{left:-.8,right:.8,top:.65,bottom:-.72,near:.1,far:3}),v.shadow.normalBias=.002,i.add(v,v.target);const g=new Wt("#9dc8ff",1.18);g.position.set(.65,.28,.1),i.add(g);const m=(D,K,ne)=>new Zs().moveTo(-D,K).lineTo(-D,ne).lineTo(D,ne).lineTo(D,K).closePath(),x=new Pi().moveTo(-.6,-.6).lineTo(.6,-.6).lineTo(.6,.6).lineTo(-.6,.6).closePath();x.holes.push(m(.458,-.258,.212)),f(new fs(x),t("#1f2b32"),0,0,0).castShadow=!1;const y=new Pi().moveTo(-.463,-.263).lineTo(.463,-.263).lineTo(.463,.217).lineTo(-.463,.217).closePath();y.holes.push(m(.458,-.258,.212)),f(new fs(y),t("#af8d69"),0,0,.001).castShadow=!1;const S=e("#dfab7b");h(1.07,.68,.04,0,0,-1.33,S),h(1.04,.025,1.306,0,.315,-.663,o),h(1.04,.026,1.306,0,-.304,-.663,n);for(const D of[-1,1]){h(.025,.66,1.31,D*.517,0,-.663,S),h(.022,.235,1.31,D*.502,-.171,-.663,r),h(.029,.014,1.31,D*.49,-.048,-.663,a);for(const K of[-.18,-.55,-.94,-1.27])h(.032,.601,.022,D*.488,.012,K,n)}h(1.04,.23,.025,0,-.175,-1.296,r),h(1.04,.014,.023,0,-.051,-1.282,a);const E=["#b57d56","#a96f4c","#b47a53","#c48c63"].map(D=>e(D));for(let D=0;D<14;D+=1)h(.071,.009,1.3,(D-6.5)*.073,-.287,-.663,E[D%4]);h(.65,.009,.74,-.06,-.279,-.61,l,i,.004),h(.59,.002,.675,-.06,-.2735,-.61,e("#a64e3b"),i,.001);const b=.208,_=.066,M=-1.255;f(new Tn(.211,64),o,b,_,M-.006),f(new gn(.202,.014,14,64),a,b,_,M),p(new Tn(.191,64),eM(),b,_,M+.002);for(let D=0;D<8;D+=1){const K=D*Math.PI/4;d(.0046,.0046,.004,b+Math.cos(K)*.205,_+Math.sin(K)*.205,M+.014,c)}h(.34,.33,.096,-.257,-.081,-1.242,n,i,.008),h(.313,.28,.02,-.257,-.097,-1.185,o);for(let D=0;D<4;D+=1)h(.326,.011,.072,-.257,-.23+D*.091,-1.151,s);for(const D of[-.41,-.31,-.207,-.103])h(.01,.29,.072,D,-.086,-1.151,s);for(const[D,K,ne,fe,ce,pe]of[[-.36,-.196,.064,.057,c,.04],[-.262,-.2,.061,.048,l,-.04],[-.166,-.112,.054,.052,c,.05],[-.364,-.116,.058,.042,l,.14],[-.268,-.022,.058,.05,c,-.08],[-.168,-.208,.05,.035,a,.06]])h(ne,fe,.029,D,K,-1.134,ce,i,.003).rotation.z=pe;h(.337,.117,.032,-.256,.169,-1.265,a,i,.007),p(new ut(.319,.102),QS(),-.256,.169,-1.247),h(.3,.169,.216,.273,-.199,-.48,o,i,.016),h(.324,.032,.252,.273,-.11,-.48,n,i,.009),h(.253,.079,.006,.273,-.199,-.37,r,i,.003),h(.087,.011,.016,.273,-.188,-.363,a,i,.004),h(.114,.013,.073,.322,-.087,-.417,l,i,.004),h(.099,.011,.066,.312,-.075,-.418,c,i,.004).rotation.y=-.12;const R=new tt;R.position.set(.236,-.032,-.464),i.add(R),h(.135,.015,.055,0,-.057,0,a,R,.006),f(new dt(.065,.065,.028,48),n,0,0,0,R).rotation.x=Math.PI/2,f(new gn(.06,.006,12,48),a,0,0,.015,R),f(new Tn(.057,48),t("#ede0ba"),0,0,.016,R).castShadow=!1;for(let D=0;D<12;D+=1){const K=D*Math.PI/6,ne=h(D%3?.002:.0035,.008,.001,Math.sin(K)*.047,Math.cos(K)*.047,.017,u,R);ne.rotation.z=-K}const w=[.027,.042].map((D,K)=>{const ne=new tt;return R.add(ne),h(.006-K*.002,D,.002,0,D/2,.02+K*.002,u,ne,8e-4),ne});d(.004,.004,.002,0,0,.025,l,R),h(.004,.091,.004,.37,.264,-.72,a),f(new dt(.025,.077,.058,40),r,.37,.19,-.72),f(new dt(.068,.068,.005,40),t("#ffe0a4"),.37,.16,-.72);const C=new ii("#ffc47e",.11,.9,2);C.position.set(.37,.144,-.72),i.add(C),h(.57,.004,.012,-.027,.299,-.58,t("#fbd39b"));const N=new tt;N.position.set(-.174,0,.094),N.rotation.y=.11,i.add(N);const F=(D,K,ne,fe,ce,pe,He)=>d(D,K,ne,fe,ce,pe,He,N),I=(D,K,ne,fe,ce,pe,He,se)=>h(D,K,ne,fe,ce,pe,He,N,se);h(.295,.023,.245,-.174,-.238,.061,a,i,.01),h(.276,.01,.223,-.174,-.223,.061,n,i,.004),h(.246,.028,.173,-.174,-.26,.022,r,i,.009);const B=e("#426564"),H=e("#e8a273"),k=e("#e5a49a"),Q=e("#fff0d6");I(.123,.124,.069,0,-.057,-.045,l,.019),F(.077,.079,.058,0,-.049,0,B),F(.069,.034,.063,0,.012,.006,l),F(.058,.021,.054,0,.024,.011,H);for(const D of[-1,1]){F(.027,.053,.031,D*.034,-.14,-.004,o),I(.057,.046,.084,D*.038,-.194,.018,c,.016),I(.059,.01,.084,D*.038,-.212,.018,l,.004);const K=F(.027,.05,.029,D*.072,-.064,.014,B);K.rotation.z=D*.45,F(.021,.018,.023,D*.079,-.094,.051,c)}const G=new tt;G.position.set(.021,-.08,.075),G.rotation.set(-.08,-.11,.18),N.add(G),h(.131,.075,.012,0,0,0,c,G,.006),p(new ut(.119,.063),jS(),0,0,.0065,G),F(.022,.017,.019,.084,-.086,.081,Q),F(.099,.076,.073,0,.077,.007,c);for(const[D,K,ne]of[[-1,.135,.17],[1,.124,-.28]]){const fe=new tt;fe.position.set(D*.044,.171+(D<0?.011:0),.005),fe.rotation.z=ne,N.add(fe),h(.037,K,.035,0,0,0,c,fe,.016),h(.019,K*.73,.009,0,.003,.016,k,fe,.004)}F(.052,.028,.021,0,.051,.064,Q),F(.01,.0065,.006,0,.062,.085,l);const Z=[];for(const D of[-1,1]){const K=new tt;K.position.set(D*.033,.087,.075),N.add(K),d(.0108,.0145,.006,0,0,0,u,K).castShadow=!1,d(.0035,.0044,.0025,-.003,.004,.006,Q,K).castShadow=!1,Z.push(K);const ne=F(.015,.007,.004,D*.055,.064,.067,k);ne.rotation.y=D*.35,F(.007,.0025,.002,D*.006,.048,.084,l).rotation.z=D*.26}const V=window.matchMedia("(prefers-reduced-motion: reduce)");let ue=-1,Re=1;return{scene:i,update(D,K){const ne=D.getHours()*60+D.getMinutes(),fe=ne!==ue;fe&&(w[0].rotation.z=-ne*Math.PI/360,w[1].rotation.z=-D.getMinutes()*Math.PI/30,ue=ne);const ce=(K??0)%5800,pe=!V.matches&&ce>5550?1-.9*Math.sin((ce-5550)*Math.PI/250):1;if(Re===pe)return fe;for(const He of Z)He.scale.y=pe;return Re=pe,!0}}}function _u(i,e,t){const n=document.createElement("canvas");n.width=i,n.height=e,t(n.getContext("2d"));const s=new oi(n);return s.colorSpace=xt,s.anisotropy=4,s}function QS(){return _u(512,176,i=>{i.fillStyle="#203d3b",i.fillRect(0,0,512,176),i.strokeStyle="#ae8156",i.lineWidth=2,i.strokeRect(10,10,492,156),i.textAlign="center",i.fillStyle="#fae1b3",i.font="bold 59px Georgia, serif",i.fillText("LUNAR POST",256,90),i.fillStyle="#cba576",i.font="22px Consolas, monospace",i.fillText("•  STATION N° 07  •",256,132)})}function jS(){return _u(320,176,i=>{i.fillStyle="#edd0a3",i.fillRect(0,0,320,176),i.strokeStyle="#b18b6e",i.lineWidth=3,i.beginPath(),i.moveTo(0,0),i.lineTo(156,99),i.lineTo(320,0),i.moveTo(0,176),i.lineTo(108,73),i.moveTo(320,176),i.lineTo(212,70),i.stroke(),i.fillStyle="#ad534b",i.beginPath(),i.arc(156,99,21,0,Math.PI*2),i.fill(),i.fillStyle="#f7d5a7",i.font="21px Georgia, serif",i.textAlign="center",i.fillText("✦",156,106)})}function eM(){return _u(640,640,i=>{const e=i.createLinearGradient(0,50,0,640);e.addColorStop(0,"#111b35"),e.addColorStop(.66,"#295471"),e.addColorStop(1,"#a67979"),i.fillStyle=e,i.fillRect(0,0,640,640);for(let s=0;s<90;s+=1){const r=(s*177.89+21)%640,o=(s*97.23+19)%470;i.fillStyle=s%7?"#b3cbdba0":"#fce3b8",i.fillRect(r,o,s%7?2:4,s%7?2:4)}const t=i.createRadialGradient(410,219,80,410,219,216);t.addColorStop(0,"#f9ceaa74"),t.addColorStop(1,"#f9ceaa00"),i.fillStyle=t,i.fillRect(0,0,640,520),i.save(),i.beginPath(),i.arc(410,219,113,0,2*Math.PI),i.clip();const n=i.createLinearGradient(335,100,475,328);n.addColorStop(0,"#fdf0d4"),n.addColorStop(1,"#cf9a80"),i.fillStyle=n,i.fillRect(285,102,250,230);for(const[s,r,o,a]of[[341,181,30,26],[434,154,23,17],[462,254,53,34],[357,272,15,12],[397,220,19,14],[505,190,25,21]])i.fillStyle="#ac6c6b35",i.beginPath(),i.ellipse(s,r,o,a,-.23,0,Math.PI*2),i.fill();i.restore();for(const[s,r,o]of[[478,"#35566d",[67,25,62,9,56,28,71]],[517,"#273f54",[29,63,43,92,49,78,21]],[564,"#202f45",[60,32,67,47,72,33,74]]]){i.fillStyle=r,i.beginPath(),i.moveTo(0,640);for(const[a,c]of o.entries())i.lineTo(a*107,s-c);i.lineTo(640,640),i.fill()}})}function cf(i,e){if(e===Bp)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),i;if(e===gc||e===jf){let t=i.getIndex();if(t===null){const r=[],o=i.getAttribute("position");if(o!==void 0){for(let a=0;a<o.count;a++)r.push(a);i.setIndex(r),t=i.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),i}const n=t.count-2,s=[];if(e===gc)for(let r=1;r<=n;r++)s.push(t.getX(0)),s.push(t.getX(r)),s.push(t.getX(r+1));else for(let r=0;r<n;r++)r%2===0?(s.push(t.getX(r)),s.push(t.getX(r+1)),s.push(t.getX(r+2))):(s.push(t.getX(r+2)),s.push(t.getX(r+1)),s.push(t.getX(r)));return s.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles."),i.setIndex(s),i.clearGroups(),i}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),i}function tM(i){const e=new Map,t=new Map,n=i.clone();return qd(i,n,function(s,r){e.set(r,s),t.set(s,r)}),n.traverse(function(s){if(!s.isSkinnedMesh)return;const r=s,o=e.get(s),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(c){return t.get(c)}),r.bind(r.skeleton,r.bindMatrix)}),n}function qd(i,e,t){t(i,e);for(let n=0;n<i.children.length;n++)qd(i.children[n],e.children[n],t)}class nM extends ir{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new aM(t)}),this.register(function(t){return new lM(t)}),this.register(function(t){return new cM(t)}),this.register(function(t){return new xM(t)}),this.register(function(t){return new vM(t)}),this.register(function(t){return new SM(t)}),this.register(function(t){return new hM(t)}),this.register(function(t){return new fM(t)}),this.register(function(t){return new dM(t)}),this.register(function(t){return new pM(t)}),this.register(function(t){return new oM(t)}),this.register(function(t){return new mM(t)}),this.register(function(t){return new uM(t)}),this.register(function(t){return new _M(t)}),this.register(function(t){return new gM(t)}),this.register(function(t){return new sM(t)}),this.register(function(t){return new uf(t,lt.EXT_MESHOPT_COMPRESSION)}),this.register(function(t){return new uf(t,lt.KHR_MESHOPT_COMPRESSION)}),this.register(function(t){return new MM(t)})}load(e,t,n,s){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const l=kr.extractUrlBase(e);o=kr.resolveURL(l,this.path)}else o=kr.extractUrlBase(e);this.manager.itemStart(e);const a=function(l){s?s(l):console.error(l),r.manager.itemError(e),r.manager.itemEnd(e)},c=new Nd(this.manager);c.setPriority(this.priority),c.setCache(this.cache),c.setPath(this.path),c.setResponseType("arraybuffer"),c.setRequestHeader(this.requestHeader),c.setWithCredentials(this.withCredentials),c.load(e,function(l){try{r.parse(l,o,function(u){t(u),r.manager.itemEnd(e)},a)}catch(u){a(u)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,s){let r;const o={},a={},c=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(c.decode(new Uint8Array(e,0,4))===Yd){try{o[lt.KHR_BINARY_GLTF]=new yM(e)}catch(f){s&&s(f);return}r=JSON.parse(o[lt.KHR_BINARY_GLTF].content)}else r=JSON.parse(c.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){s&&s(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const l=new UM(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,priority:this.priority,cache:this.cache,withCredentials:this.withCredentials,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});l.fileLoader.setRequestHeader(this.requestHeader);for(let u=0;u<this.pluginCallbacks.length;u++){const f=this.pluginCallbacks[u](l);f.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[f.name]=f,o[f.name]=!0}if(r.extensionsUsed)for(let u=0;u<r.extensionsUsed.length;++u){const f=r.extensionsUsed[u],h=r.extensionsRequired||[];switch(f){case lt.KHR_MATERIALS_UNLIT:o[f]=new rM;break;case lt.KHR_DRACO_MESH_COMPRESSION:o[f]=new bM(r,this.dracoLoader);break;case lt.KHR_TEXTURE_TRANSFORM:o[f]=new TM;break;case lt.KHR_MESH_QUANTIZATION:o[f]=new EM;break;default:h.indexOf(f)>=0&&a[f]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+f+'".')}}l.setExtensions(o),l.setPlugins(a),l.parse(n,s)}parseAsync(e,t){const n=this;return new Promise(function(s,r){n.parse(e,t,s,r)})}}function iM(){let i={};return{get:function(e){return i[e]},add:function(e,t){i[e]=t},remove:function(e){delete i[e]},removeAll:function(){i={}}}}function Ut(i,e,t){const n=i.json.materials[e];return n.extensions&&n.extensions[t]?n.extensions[t]:null}const lt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DIFFUSE_ROUGHNESS:"KHR_materials_diffuse_roughness",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",KHR_MESHOPT_COMPRESSION:"KHR_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class sM{constructor(e){this.parser=e,this.name=lt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,s=t.length;n<s;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let s=t.cache.get(n);if(s)return s;const r=t.json,c=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let l;const u=new Oe(16777215);c.color!==void 0&&u.setRGB(c.color[0],c.color[1],c.color[2],xn);const f=c.range!==void 0?c.range:0;switch(c.type){case"directional":l=new Wt(u),l.target.position.set(0,0,-1),l.add(l.target);break;case"point":l=new ii(u),l.distance=f;break;case"spot":l=new fu(u),l.distance=f,c.spot=c.spot||{},c.spot.innerConeAngle=c.spot.innerConeAngle!==void 0?c.spot.innerConeAngle:0,c.spot.outerConeAngle=c.spot.outerConeAngle!==void 0?c.spot.outerConeAngle:Math.PI/4,l.angle=c.spot.outerConeAngle,l.penumbra=1-c.spot.innerConeAngle/c.spot.outerConeAngle,l.target.position.set(0,0,-1),l.add(l.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+c.type)}return l.position.set(0,0,0),Qn(l,c),c.intensity!==void 0&&(l.intensity=c.intensity),l.name=t.createUniqueName(c.name||"light_"+e),s=Promise.resolve(l),t.cache.add(n,s),s}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(c){return n._getNodeRef(t.cache,a,c)})}}class rM{constructor(){this.name=lt.KHR_MATERIALS_UNLIT}getMaterialType(){return it}extendParams(e,t,n){const s=[];e.color=new Oe(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],xn),e.opacity=o[3]}r.baseColorTexture!==void 0&&s.push(n.assignTexture(e,"map",r.baseColorTexture,xt))}return Promise.all(s)}}class oM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);return n===null||n.emissiveStrength!==void 0&&(t.emissiveIntensity=n.emissiveStrength),Promise.resolve()}}class aM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];if(n.clearcoatFactor!==void 0&&(t.clearcoat=n.clearcoatFactor),n.clearcoatTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatMap",n.clearcoatTexture)),n.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=n.clearcoatRoughnessFactor),n.clearcoatRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"clearcoatRoughnessMap",n.clearcoatRoughnessTexture)),n.clearcoatNormalTexture!==void 0&&(s.push(this.parser.assignTexture(t,"clearcoatNormalMap",n.clearcoatNormalTexture)),n.clearcoatNormalTexture.scale!==void 0)){const r=n.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new he(r,r)}return Promise.all(s)}}class lM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_DIFFUSE_ROUGHNESS}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return t.diffuseRoughness=n.diffuseRoughnessFactor!==void 0?n.diffuseRoughnessFactor:0,n.diffuseRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"diffuseRoughnessMap",n.diffuseRoughnessTexture)),Promise.all(s)}}class cM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_DISPERSION}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);return n===null||(t.dispersion=n.dispersion!==void 0?n.dispersion:0),Promise.resolve()}}class uM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return n.iridescenceFactor!==void 0&&(t.iridescence=n.iridescenceFactor),n.iridescenceTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceMap",n.iridescenceTexture)),n.iridescenceIor!==void 0&&(t.iridescenceIOR=n.iridescenceIor),n.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessMinimum=n.iridescenceThicknessMinimum),n.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessMaximum=n.iridescenceThicknessMaximum),n.iridescenceThicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"iridescenceThicknessMap",n.iridescenceThicknessTexture)),Promise.all(s)}}class hM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_SHEEN}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];if(t.sheenColor=new Oe(0,0,0),t.sheenRoughness=0,t.sheen=1,n.sheenColorFactor!==void 0){const r=n.sheenColorFactor;t.sheenColor.setRGB(r[0],r[1],r[2],xn)}return n.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=n.sheenRoughnessFactor),n.sheenColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenColorMap",n.sheenColorTexture,xt)),n.sheenRoughnessTexture!==void 0&&s.push(this.parser.assignTexture(t,"sheenRoughnessMap",n.sheenRoughnessTexture)),Promise.all(s)}}class fM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return n.transmissionFactor!==void 0&&(t.transmission=n.transmissionFactor),n.transmissionTexture!==void 0&&s.push(this.parser.assignTexture(t,"transmissionMap",n.transmissionTexture)),Promise.all(s)}}class dM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_VOLUME}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];t.thickness=n.thicknessFactor!==void 0?n.thicknessFactor:0,n.thicknessTexture!==void 0&&s.push(this.parser.assignTexture(t,"thicknessMap",n.thicknessTexture)),t.attenuationDistance=n.attenuationDistance||1/0;const r=n.attenuationColor||[1,1,1];return t.attenuationColor=new Oe().setRGB(r[0],r[1],r[2],xn),Promise.all(s)}}class pM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_IOR}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);return n===null||(t.ior=n.ior!==void 0?n.ior:1.5,t.ior===0&&(t.ior=1e3)),Promise.resolve()}}class mM{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_SPECULAR}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];t.specularIntensity=n.specularFactor!==void 0?n.specularFactor:1,n.specularTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularIntensityMap",n.specularTexture));const r=n.specularColorFactor||[1,1,1];return t.specularColor=new Oe().setRGB(r[0],r[1],r[2],xn),n.specularColorTexture!==void 0&&s.push(this.parser.assignTexture(t,"specularColorMap",n.specularColorTexture,xt)),Promise.all(s)}}class gM{constructor(e){this.parser=e,this.name=lt.EXT_MATERIALS_BUMP}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return t.bumpScale=n.bumpFactor!==void 0?n.bumpFactor:1,n.bumpTexture!==void 0&&s.push(this.parser.assignTexture(t,"bumpMap",n.bumpTexture)),Promise.all(s)}}class _M{constructor(e){this.parser=e,this.name=lt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){return Ut(this.parser,e,this.name)!==null?wn:null}extendMaterialParams(e,t){const n=Ut(this.parser,e,this.name);if(n===null)return Promise.resolve();const s=[];return n.anisotropyStrength!==void 0&&(t.anisotropy=n.anisotropyStrength),n.anisotropyRotation!==void 0&&(t.anisotropyRotation=n.anisotropyRotation),n.anisotropyTexture!==void 0&&s.push(this.parser.assignTexture(t,"anisotropyMap",n.anisotropyTexture)),Promise.all(s)}}class xM{constructor(e){this.parser=e,this.name=lt.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,s=n.textures[e];if(!s.extensions||!s.extensions[this.name])return null;const r=s.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class vM{constructor(e){this.parser=e,this.name=lt.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let c=n.textureLoader;if(a.uri){const l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}}class SM{constructor(e){this.parser=e,this.name=lt.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,s=n.json,r=s.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=s.images[o.source];let c=n.textureLoader;if(a.uri){const l=n.options.manager.getHandler(a.uri);l!==null&&(c=l)}return n.loadTextureImage(e,o.source,c)}}class uf{constructor(e,t){this.name=t,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const s=n.extensions[this.name],r=this.parser.getDependency("buffer",s.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const c=s.byteOffset||0,l=s.byteLength||0,u=s.count,f=s.byteStride,h=new Uint8Array(a,c,l);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(u,f,h,s.mode,s.filter).then(function(d){return d.buffer}):o.ready.then(function(){const d=new ArrayBuffer(u*f);return o.decodeGltfBuffer(new Uint8Array(d),u,f,h,s.mode,s.filter),d})})}else return null}}class MM{constructor(e){this.name=lt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const s=t.meshes[n.mesh];for(const l of s.primitives)if(l.mode!==Cn.TRIANGLES&&l.mode!==Cn.TRIANGLE_STRIP&&l.mode!==Cn.TRIANGLE_FAN&&l.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],c={};for(const l in o)a.push(this.parser.getDependency("accessor",o[l]).then(u=>(c[l]=u,c[l])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(l=>{const u=l.pop(),f=u.isGroup?u.children:[u],h=l[0].count,d=[];for(const p of f){const v=new et,g=new L,m=new En,x=new L(1,1,1),y=new tu(p.geometry,p.material,h);for(let E=0;E<h;E++)c.TRANSLATION&&g.fromBufferAttribute(c.TRANSLATION,E),c.ROTATION&&m.fromBufferAttribute(c.ROTATION,E),c.SCALE&&x.fromBufferAttribute(c.SCALE,E),y.setMatrixAt(E,v.compose(g,m,x));let S=null;for(const E in c)if(E==="_COLOR_0"){const b=c[E];y.instanceColor=new ha(b.array,b.itemSize,b.normalized)}else if(E!=="TRANSLATION"&&E!=="ROTATION"&&E!=="SCALE"){if(S===null){const _=y.geometry;S=new It,S.name=_.name;for(const M in _.attributes)S.setAttribute(M,_.attributes[M]);for(const M in _.morphAttributes)S.morphAttributes[M]=_.morphAttributes[M];_.index!==null&&S.setIndex(_.index),S.morphTargetsRelative=_.morphTargetsRelative;for(const M of _.groups)S.addGroup(M.start,M.count,M.materialIndex);_.boundingBox!==null&&(S.boundingBox=_.boundingBox.clone()),_.boundingSphere!==null&&(S.boundingSphere=_.boundingSphere.clone()),S.drawRange.start=_.drawRange.start,S.drawRange.count=_.drawRange.count,S.userData=Object.assign({},_.userData),y.geometry=S}const b=c[E];S.setAttribute(E,new ha(b.array,b.itemSize,b.normalized))}At.prototype.copy.call(y,p),this.parser.assignFinalMaterial(y),d.push(y)}return u.isGroup?(u.clear(),u.add(...d),u):d[0]}))}}const Yd="glTF",vr=12,hf={JSON:1313821514,BIN:5130562};class yM{constructor(e){this.name=lt.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,vr),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Yd)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const s=this.header.length-vr,r=new DataView(e,vr);let o=0;for(;o<s;){const a=r.getUint32(o,!0);o+=4;const c=r.getUint32(o,!0);if(o+=4,c===hf.JSON){const l=new Uint8Array(e,vr+o,a);this.content=n.decode(l)}else if(c===hf.BIN){const l=vr+o;this.body=e.slice(l,l+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class bM{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=lt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,s=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},c={},l={};for(const u in o){const f=bc[u]||u.toLowerCase();a[f]=o[u]}for(const u in e.attributes){const f=bc[u]||u.toLowerCase();if(o[u]!==void 0){const h=n.accessors[e.attributes[u]],d=Vs[h.componentType];l[f]=d.name,c[f]=h.normalized===!0}}return t.getDependency("bufferView",r).then(function(u){return new Promise(function(f,h){s.decodeDracoFile(u,function(d){for(const p in d.attributes){const v=d.attributes[p],g=c[p];g!==void 0&&(v.normalized=g)}f(d)},a,l,xn,h)})})}}class TM{constructor(){this.name=lt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){if((t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0)return e;if(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),t.rotation!==void 0){const n=Math.cos(e.rotation),s=Math.sin(e.rotation);e.matrix.set(e.repeat.x*n,e.repeat.y*s,e.offset.x,-e.repeat.x*s,e.repeat.y*n,e.offset.y,0,0,1),e.matrixAutoUpdate=!1}return e.needsUpdate=!0,e}}class EM{constructor(){this.name=lt.KHR_MESH_QUANTIZATION}}class Kd extends er{constructor(e,t,n,s){super(e,t,n,s)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s*3+s;for(let o=0;o!==s;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,s){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,c=a*2,l=a*3,u=s-t,f=(n-t)/u,h=f*f,d=h*f,p=e*l,v=p-l,g=-2*d+3*h,m=d-h,x=1-g,y=m-h+f;for(let S=0;S!==a;S++){const E=o[v+S+a],b=o[v+S+c]*u,_=o[p+S+a],M=o[p+S]*u;r[S]=x*E+y*b+g*_+m*M}return r}}const wM=new En;class AM extends Kd{interpolate_(e,t,n,s){const r=super.interpolate_(e,t,n,s);return wM.fromArray(r).normalize().toArray(r),r}}const Cn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Vs={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},ff={9728:Gt,9729:jt,9984:qf,9985:Jo,9986:Ar,9987:ti},df={33071:ei,33648:ra,10497:qi},gl={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},bc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Bi={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},RM={CUBICSPLINE:void 0,LINEAR:Kr,STEP:Yr},_l={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function CM(i){return i.DefaultMaterial===void 0&&(i.DefaultMaterial=new Lt({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:Xi})),i.DefaultMaterial}function ns(i,e,t){for(const n in t.extensions)i[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function Qn(i,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(i.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function PM(i,e,t){let n=!1,s=!1,r=!1;for(let l=0,u=e.length;l<u;l++){const f=e[l];if(f.POSITION!==void 0&&(n=!0),f.NORMAL!==void 0&&(s=!0),f.COLOR_0!==void 0&&(r=!0),n&&s&&r)break}if(!n&&!s&&!r)return Promise.resolve(i);const o=[],a=[],c=[];for(let l=0,u=e.length;l<u;l++){const f=e[l];if(n){const h=f.POSITION!==void 0?t.getDependency("accessor",f.POSITION):i.attributes.position;o.push(h)}if(s){const h=f.NORMAL!==void 0?t.getDependency("accessor",f.NORMAL):i.attributes.normal;a.push(h)}if(r){const h=f.COLOR_0!==void 0?t.getDependency("accessor",f.COLOR_0):i.attributes.color;c.push(h)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c)]).then(function(l){const u=l[0],f=l[1],h=l[2];return n&&(i.morphAttributes.position=u),s&&(i.morphAttributes.normal=f),r&&(i.morphAttributes.color=h),i.morphTargetsRelative=!0,i})}function LM(i,e){if(i.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)i.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(i.morphTargetInfluences.length===t.length){i.morphTargetDictionary={};for(let n=0,s=t.length;n<s;n++)i.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function IM(i){let e;const t=i.extensions&&i.extensions[lt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+xl(t.attributes):e=i.indices+":"+xl(i.attributes)+":"+i.mode,i.targets!==void 0)for(let n=0,s=i.targets.length;n<s;n++)e+=":"+xl(i.targets[n]);return e}function xl(i){let e="";const t=Object.keys(i).sort();for(let n=0,s=t.length;n<s;n++)e+=t[n]+":"+i[t[n]]+";";return e}function Tc(i){switch(i){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function NM(i){return i.search(/\.jpe?g($|\?)/i)>0||i.search(/^data\:image\/jpeg/)===0?"image/jpeg":i.search(/\.webp($|\?)/i)>0||i.search(/^data\:image\/webp/)===0?"image/webp":i.search(/\.ktx2($|\?)/i)>0||i.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const DM=new et;class UM{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new iM,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,s=-1,r=!1,o=-1;if(typeof navigator<"u"&&typeof navigator.userAgent<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const c=a.match(/Version\/(\d+)/);s=n&&c?parseInt(c[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&s<17||r&&o<98?(this.textureLoader=new co(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)):(this.textureLoader=new Xm(this.options.manager),this.textureLoader.setPriority(this.options.priority),this.textureLoader.setCache(this.options.cache)),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setWithCredentials(this.options.withCredentials),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new Nd(this.options.manager),this.fileLoader.setPriority(this.options.priority),this.fileLoader.setCache(this.options.cache),this.fileLoader.setResponseType("arraybuffer"),(this.options.withCredentials||this.options.crossOrigin==="use-credentials")&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,s=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][s.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:s.asset,parser:n,userData:{}};return ns(r,a,s),Qn(a,s),Promise.all(n._invokeAll(function(c){return c.afterRoot&&c.afterRoot(a)})).then(function(){for(const c of a.scenes)c.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let s=0,r=t.length;s<r;s++){const o=t[s].joints;for(let a=0,c=o.length;a<c;a++)e[o[a]].isBone=!0}for(let s=0,r=e.length;s<r;s++){const o=e[s];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const s=n.clone(),r=(o,a)=>{const c=this.associations.get(o);c!=null&&this.associations.set(a,c);for(const[l,u]of o.children.entries())r(u,a.children[l])};return r(n,s),s.name+="_instance_"+e.uses[t]++,s}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const s=e(t[n]);if(s)return s}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let s=0;s<t.length;s++){const r=e(t[s]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let s=this.cache.get(n);if(!s){switch(e){case"scene":s=this.loadScene(t);break;case"node":s=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":s=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":s=this.loadAccessor(t);break;case"bufferView":s=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":s=this.loadBuffer(t);break;case"material":s=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":s=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":s=this.loadSkin(t);break;case"animation":s=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":s=this.loadCamera(t);break;default:if(s=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!s)throw new Error("Unknown type: "+e);break}this.cache.add(n,s)}return s}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,s=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(s.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[lt.KHR_BINARY_GLTF].body);const s=this.options;return new Promise(function(r,o){n.load(kr.resolveURL(t.uri,s.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const s=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+s)})}loadAccessor(e){const t=this,n=this.json,s=this.json.accessors[e];if(s.bufferView===void 0&&s.sparse===void 0){const o=gl[s.type],a=Vs[s.componentType],c=s.normalized===!0,l=new a(s.count*o);return Promise.resolve(new bn(l,o,c))}const r=[];return s.bufferView!==void 0?r.push(this.getDependency("bufferView",s.bufferView)):r.push(null),s.sparse!==void 0&&(r.push(this.getDependency("bufferView",s.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",s.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],c=gl[s.type],l=Vs[s.componentType],u=l.BYTES_PER_ELEMENT,f=u*c,h=s.byteOffset||0,d=s.bufferView!==void 0?n.bufferViews[s.bufferView].byteStride:void 0,p=s.normalized===!0;let v,g;if(d&&d!==f){const m=Math.floor(h/d),x="InterleavedBuffer:"+s.bufferView+":"+s.componentType+":"+m+":"+s.count;let y=t.cache.get(x);y||(v=new l(a,m*d,s.count*d/u),y=new ud(v,d/u),t.cache.add(x,y)),g=new Zr(y,c,h%d/u,p)}else a===null?v=new l(s.count*c):v=new l(a,h,s.count*c),g=new bn(v,c,p);if(s.sparse!==void 0){const m=gl.SCALAR,x=Vs[s.sparse.indices.componentType],y=s.sparse.indices.byteOffset||0,S=s.sparse.values.byteOffset||0,E=new x(o[1],y,s.sparse.count*m),b=new l(o[2],S,s.sparse.count*c);a!==null&&(g=new bn(g.array.slice(),g.itemSize,g.normalized)),g.normalized=!1;for(let _=0,M=E.length;_<M;_++){const R=E[_];if(g.setX(R,b[_*c]),c>=2&&g.setY(R,b[_*c+1]),c>=3&&g.setZ(R,b[_*c+2]),c>=4&&g.setW(R,b[_*c+3]),c>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}g.normalized=p}return g})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const c=n.manager.getHandler(o.uri);c!==null&&(a=c)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const s=this,r=this.json,o=r.textures[e],a=r.images[t],c=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[c])return this.textureCache[c];const l=this.loadImageSource(t,n).then(function(u){u.flipY=!1,u.name=o.name||a.name||"",u.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(u.name=a.uri);const h=(r.samplers||{})[o.sampler]||{};return u.magFilter=ff[h.magFilter]||jt,u.minFilter=ff[h.minFilter]||ti,u.wrapS=df[h.wrapS]||qi,u.wrapT=df[h.wrapT]||qi,u.generateMipmaps=!u.isCompressedTexture&&u.minFilter!==Gt&&u.minFilter!==jt,s.associations.set(u,{textures:e}),u}).catch(function(){return null});return this.textureCache[c]=l,l}loadImageSource(e,t){const n=this,s=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(h=>h.clone());const o=s.images[e],a=self.URL||self.webkitURL;let c=o.uri||"",l=!1,u;if(t.isKTX2Loader===!0&&o.bufferView!==void 0)u=n.getDependency("bufferView",o.bufferView).then(function(h){return new Promise(function(d,p){t.parse(h,d,p)})});else{if(o.bufferView!==void 0)c=n.getDependency("bufferView",o.bufferView).then(function(h){l=!0;const d=new Blob([h],{type:o.mimeType});return c=a.createObjectURL(d),c});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");u=Promise.resolve(c).then(function(h){return new Promise(function(d,p){let v=d;t.isImageBitmapLoader===!0&&(v=function(g){const m=new Vt(g);m.needsUpdate=!0,d(m)}),t.load(kr.resolveURL(h,r.path),v,void 0,p)})})}const f=u.then(function(h){return l===!0&&a.revokeObjectURL(c),Qn(h,o),h.userData.mimeType=o.mimeType||NM(o.uri),h}).catch(function(h){throw console.error("THREE.GLTFLoader: Couldn't load texture",c),h});return this.sourceCache[e]=f,f}assignTexture(e,t,n,s){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[lt.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[lt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const c=r.associations.get(o);o=r.extensions[lt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,c)}}return s!==void 0&&(o.colorSpace=s),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const s=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let c=this.cache.get(a);c||(c=new md,Dn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,c.sizeAttenuation=!1,this.cache.add(a,c)),n=c}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let c=this.cache.get(a);c||(c=new iu,Dn.prototype.copy.call(c,n),c.color.copy(n.color),c.map=n.map,this.cache.add(a,c)),n=c}if(s||r||o){let a="ClonedMaterial:"+n.uuid+":";s&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let c=this.cache.get(a);c||(c=n.clone(),r&&(c.vertexColors=!0),o&&(c.flatShading=!0),s&&(c.normalScale&&(c.normalScale.y*=-1),c.clearcoatNormalScale&&(c.clearcoatNormalScale.y*=-1)),this.cache.add(a,c),this.associations.set(c,this.associations.get(n))),n=c}e.material=n}getMaterialType(){return Lt}loadMaterial(e){const t=this,n=this.json,s=this.extensions,r=n.materials[e];let o;const a={},c=r.extensions||{},l=[];if(c[lt.KHR_MATERIALS_UNLIT]){const f=s[lt.KHR_MATERIALS_UNLIT];o=f.getMaterialType(),l.push(f.extendParams(a,r,t))}else{const f=r.pbrMetallicRoughness||{};if(a.color=new Oe(1,1,1),a.opacity=1,Array.isArray(f.baseColorFactor)){const h=f.baseColorFactor;a.color.setRGB(h[0],h[1],h[2],xn),a.opacity=h[3]}f.baseColorTexture!==void 0&&l.push(t.assignTexture(a,"map",f.baseColorTexture,xt)),a.metalness=f.metallicFactor!==void 0?f.metallicFactor:1,a.roughness=f.roughnessFactor!==void 0?f.roughnessFactor:1,f.metallicRoughnessTexture!==void 0&&(l.push(t.assignTexture(a,"metalnessMap",f.metallicRoughnessTexture)),l.push(t.assignTexture(a,"roughnessMap",f.metallicRoughnessTexture))),o=this._invokeOne(function(h){return h.getMaterialType&&h.getMaterialType(e)}),l.push(Promise.all(this._invokeAll(function(h){return h.extendMaterialParams&&h.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Gn);const u=r.alphaMode||_l.OPAQUE;if(u===_l.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,u===_l.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==it&&(l.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new he(1,1),r.normalTexture.scale!==void 0)){const f=r.normalTexture.scale;a.normalScale.set(f,f)}if(r.occlusionTexture!==void 0&&o!==it&&(l.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==it){const f=r.emissiveFactor;a.emissive=new Oe().setRGB(f[0],f[1],f[2],xn)}return r.emissiveTexture!==void 0&&o!==it&&l.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,xt)),Promise.all(l).then(function(){const f=new o(a);return r.name&&(f.name=r.name),Qn(f,r),t.associations.set(f,{materials:e}),r.extensions&&ns(s,f,r),f})}createUniqueName(e){const t=Mt.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,s=this.primitiveCache;function r(a){return n[lt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(c){return pf(c,a,t)})}const o=[];for(let a=0,c=e.length;a<c;a++){const l=e[a],u=IM(l),f=s[u];if(f)o.push(f.promise);else{let h;l.extensions&&l.extensions[lt.KHR_DRACO_MESH_COMPRESSION]?h=r(l):h=pf(new It,l,t),l.mode===Cn.TRIANGLE_STRIP?h=h.then(d=>cf(d,jf)):l.mode===Cn.TRIANGLE_FAN&&(h=h.then(d=>cf(d,gc))),s[u]={primitive:l,promise:h},o.push(h)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,s=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let c=0,l=o.length;c<l;c++){const u=o[c].material===void 0?CM(this.cache):this.getDependency("material",o[c].material);a.push(u)}return a.push(t.loadGeometries(o)),Promise.all(a).then(async function(c){const l=c.slice(0,c.length-1),u=c[c.length-1],f=[];for(let d=0,p=u.length;d<p;d++){const v=u[d],g=o[d];let m;const x=l[d];if(g.mode===Cn.TRIANGLES||g.mode===Cn.TRIANGLE_STRIP||g.mode===Cn.TRIANGLE_FAN||g.mode===void 0){const y=r.isSkinnedMesh===!0,S=v.hasAttribute("skinIndex")&&v.hasAttribute("skinWeight");y&&S===!1&&console.warn("THREE.GLTFLoader: Missing skinIndex or skinWeight attributes. Skinning disabled."),m=y&&S?new U0(v,x):new mt(v,x),m.isSkinnedMesh===!0&&m.normalizeSkinWeights()}else if(g.mode===Cn.LINES)m=new pd(v,x);else if(g.mode===Cn.LINE_STRIP)m=new su(v,x);else if(g.mode===Cn.LINE_LOOP)m=new z0(v,x);else if(g.mode===Cn.POINTS)m=new k0(v,x);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+g.mode);Object.keys(m.geometry.morphAttributes).length>0&&LM(m,r),m.name=t.createUniqueName(r.name||"mesh_"+e),Qn(m,r),g.extensions&&ns(s,m,g),t.assignFinalMaterial(m),f.push(m)}for(let d=0,p=f.length;d<p;d++)t.associations.set(f[d],{meshes:e,primitives:d});if(f.length===1)return r.extensions&&ns(s,f[0],r),f[0];const h=new tt;r.extensions&&ns(s,h,r),t.associations.set(h,{meshes:e});for(let d=0,p=f.length;d<p;d++)h.add(f[d]);return h})}loadCamera(e){let t;const n=this.json.cameras[e],s=n[n.type];if(!s){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Ht(kt.radToDeg(s.yfov),s.aspectRatio||1,s.znear||1,s.zfar||2e6):n.type==="orthographic"&&(t=new du(-s.xmag,s.xmag,s.ymag,-s.ymag,s.znear,s.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),Qn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let s=0,r=t.joints.length;s<r;s++)n.push(this._loadNodeShallow(t.joints[s]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(s){const r=s.pop(),o=s,a=[],c=[];for(let l=0,u=o.length;l<u;l++){const f=o[l];if(f){a.push(f);const h=new et;r!==null&&h.fromArray(r.array,l*16),c.push(h)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[l])}return new eu(a,c)})}loadAnimation(e){const t=this.json,n=this,s=t.animations[e],r=s.name?s.name:"animation_"+e,o=[],a=[],c=[],l=[],u=[];for(let f=0,h=s.channels.length;f<h;f++){const d=s.channels[f],p=s.samplers[d.sampler],v=d.target,g=v.node,m=s.parameters!==void 0?s.parameters[p.input]:p.input,x=s.parameters!==void 0?s.parameters[p.output]:p.output;v.node!==void 0&&(o.push(this.getDependency("node",g)),a.push(this.getDependency("accessor",m)),c.push(this.getDependency("accessor",x)),l.push(p),u.push(v))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(c),Promise.all(l),Promise.all(u)]).then(function(f){const h=f[0],d=f[1],p=f[2],v=f[3],g=f[4],m=[];for(let y=0,S=h.length;y<S;y++){const E=h[y],b=d[y],_=p[y],M=v[y],R=g[y];if(E===void 0)continue;E.updateMatrix&&E.updateMatrix();const w=n._createAnimationTracks(E,b,_,M,R);if(w)for(let C=0;C<w.length;C++)m.push(w[C])}const x=new Om(r,void 0,m);return Qn(x,s),x})}createNodeMesh(e){const t=this.json,n=this,s=t.nodes[e];return s.mesh===void 0?null:n.getDependency("mesh",s.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,s.mesh,r);return s.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let c=0,l=s.weights.length;c<l;c++)a.morphTargetInfluences[c]=s.weights[c]}),o})}loadNode(e){const t=this.json,n=this,s=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=s.children||[];for(let l=0,u=a.length;l<u;l++)o.push(n.getDependency("node",a[l]));const c=s.skin===void 0?Promise.resolve(null):n.getDependency("skin",s.skin);return Promise.all([r,Promise.all(o),c]).then(function(l){const u=l[0],f=l[1],h=l[2];h!==null&&u.traverse(function(d){d.isSkinnedMesh&&d.bind(h,DM)});for(let d=0,p=f.length;d<p;d++)u.add(f[d]);if(u.userData.pivot!==void 0&&f.length>0){const d=u.userData.pivot,p=f[0];u.pivot=new L().fromArray(d),u.position.x-=d[0],u.position.y-=d[1],u.position.z-=d[2],p.position.set(0,0,0),delete u.userData.pivot}return u})}_loadNodeShallow(e){const t=this.json,n=this.extensions,s=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?s.createUniqueName(r.name):"",a=[],c=s._invokeOne(function(l){return l.createNodeMesh&&l.createNodeMesh(e)});return c&&a.push(c),r.camera!==void 0&&a.push(s.getDependency("camera",r.camera).then(function(l){return s._getNodeRef(s.cameraCache,r.camera,l)})),s._invokeAll(function(l){return l.createNodeAttachment&&l.createNodeAttachment(e)}).forEach(function(l){a.push(l)}),this.nodeCache[e]=Promise.all(a).then(function(l){let u;if(r.isBone===!0?u=new dd:l.length>1?u=new tt:l.length===1?u=l[0]:u=new At,u!==l[0])for(let f=0,h=l.length;f<h;f++)u.add(l[f]);if(r.name&&(u.userData.name=r.name,u.name=o),Qn(u,r),r.extensions&&ns(n,u,r),r.matrix!==void 0){const f=new et;f.fromArray(r.matrix),u.applyMatrix4(f)}else r.translation!==void 0&&u.position.fromArray(r.translation),r.rotation!==void 0&&u.quaternion.fromArray(r.rotation),r.scale!==void 0&&u.scale.fromArray(r.scale);if(!s.associations.has(u))s.associations.set(u,{});else if(r.mesh!==void 0&&s.meshCache.refs[r.mesh]>1){const f=s.associations.get(u);s.associations.set(u,{...f})}return s.associations.get(u).nodes=e,u}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],s=this,r=new tt;n.name&&(r.name=s.createUniqueName(n.name)),Qn(r,n),n.extensions&&ns(t,r,n);const o=n.nodes||[],a=[];for(let c=0,l=o.length;c<l;c++)a.push(s.getDependency("node",o[c]));return Promise.all(a).then(function(c){for(let u=0,f=c.length;u<f;u++){const h=c[u];h.parent!==null?r.add(tM(h)):r.add(h)}const l=u=>{const f=new Map;for(const[h,d]of s.associations)(h instanceof Dn||h instanceof Vt)&&f.set(h,d);return u.traverse(h=>{const d=s.associations.get(h);d!=null&&f.set(h,d)}),f};return s.associations=l(r),r})}_createAnimationTracks(e,t,n,s,r){const o=[],a=e.name?e.name:e.uuid,c=[];function l(d){d.morphTargetInfluences&&c.push(d.name?d.name:d.uuid)}Bi[r.path]===Bi.weights?(l(e),e.isGroup&&e.children.forEach(l)):c.push(a);let u;switch(Bi[r.path]){case Bi.weights:u=no;break;case Bi.rotation:u=io;break;case Bi.translation:case Bi.scale:u=ma;break;default:switch(n.itemSize){case 1:u=no;break;case 2:case 3:default:u=ma;break}break}const f=s.interpolation!==void 0?RM[s.interpolation]:Kr,h=this._getArrayFromAccessor(n);for(let d=0,p=c.length;d<p;d++){const v=new u(c[d]+"."+Bi[r.path],t.array,h,f);s.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(v),o.push(v)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=Tc(t.constructor),s=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)s[r]=t[r]*n;t=s}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const s=this instanceof io?AM:Kd;return new s(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function OM(i,e,t){const n=e.attributes,s=new si;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],c=a.min,l=a.max;if(c!==void 0&&l!==void 0){if(s.set(new L(c[0],c[1],c[2]),new L(l[0],l[1],l[2])),a.normalized){const u=Tc(Vs[a.componentType]);s.min.multiplyScalar(u),s.max.multiplyScalar(u)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new L,c=new L;for(let l=0,u=r.length;l<u;l++){const f=r[l];if(f.POSITION!==void 0){const h=t.json.accessors[f.POSITION],d=h.min,p=h.max;if(d!==void 0&&p!==void 0){if(c.setX(Math.max(Math.abs(d[0]),Math.abs(p[0]))),c.setY(Math.max(Math.abs(d[1]),Math.abs(p[1]))),c.setZ(Math.max(Math.abs(d[2]),Math.abs(p[2]))),h.normalized){const v=Tc(Vs[h.componentType]);c.multiplyScalar(v)}a.max(c)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}s.expandByVector(a)}i.boundingBox=s;const o=new ri;s.getCenter(o.center),o.radius=s.min.distanceTo(s.max)/2,i.boundingSphere=o}function pf(i,e,t){const n=e.attributes,s=[];function r(o,a){return t.getDependency("accessor",o).then(function(c){i.setAttribute(a,c)})}for(const o in n){const a=bc[o]||o.toLowerCase();a in i.attributes||s.push(r(n[o],a))}if(e.indices!==void 0&&!i.index){const o=t.getDependency("accessor",e.indices).then(function(a){i.setIndex(a)});s.push(o)}return ct.workingColorSpace!==xn&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ct.workingColorSpace}" not supported.`),Qn(i,e),OM(i,e,t),Promise.all(s).then(function(){return e.targets!==void 0?PM(i,e.targets,t):i})}class FM extends Kn{constructor(){super(),this.name="RoomEnvironment",this.position.y=-3.5;const e=new en;e.deleteAttribute("uv");const t=new Lt({side:ln}),n=new Lt,s=new ii(16777215,900,28,2);s.position.set(.418,16.199,.3),this.add(s);const r=new mt(e,t);r.position.set(-.757,13.219,.717),r.scale.set(31.713,28.305,28.591),this.add(r);const o=new tu(e,n,6),a=new At;a.position.set(-10.906,2.009,1.846),a.rotation.set(0,-.195,0),a.scale.set(2.328,7.905,4.651),a.updateMatrix(),o.setMatrixAt(0,a.matrix),a.position.set(-5.607,-.754,-.758),a.rotation.set(0,.994,0),a.scale.set(1.97,1.534,3.955),a.updateMatrix(),o.setMatrixAt(1,a.matrix),a.position.set(6.167,.857,7.803),a.rotation.set(0,.561,0),a.scale.set(3.927,6.285,3.687),a.updateMatrix(),o.setMatrixAt(2,a.matrix),a.position.set(-2.017,.018,6.124),a.rotation.set(0,.333,0),a.scale.set(2.002,4.566,2.064),a.updateMatrix(),o.setMatrixAt(3,a.matrix),a.position.set(2.291,-.756,-2.621),a.rotation.set(0,-.286,0),a.scale.set(1.546,1.552,1.496),a.updateMatrix(),o.setMatrixAt(4,a.matrix),a.position.set(-2.193,-.369,-5.547),a.rotation.set(0,.516,0),a.scale.set(3.875,3.487,2.986),a.updateMatrix(),o.setMatrixAt(5,a.matrix),this.add(o);const c=new mt(e,Is(50));c.position.set(-16.116,14.37,8.208),c.scale.set(.1,2.428,2.739),this.add(c);const l=new mt(e,Is(50));l.position.set(-16.109,18.021,-8.207),l.scale.set(.1,2.425,2.751),this.add(l);const u=new mt(e,Is(17));u.position.set(14.904,12.198,-1.832),u.scale.set(.15,4.265,6.331),this.add(u);const f=new mt(e,Is(43));f.position.set(-.462,8.89,14.52),f.scale.set(4.38,5.441,.088),this.add(f);const h=new mt(e,Is(20));h.position.set(3.235,11.486,-12.541),h.scale.set(2.5,2,.1),this.add(h);const d=new mt(e,Is(100));d.position.set(0,20,0),d.scale.set(1,.1,1),this.add(d)}dispose(){const e=new Set;this.traverse(t=>{t.isMesh&&(e.add(t.geometry),e.add(t.material))});for(const t of e)t.dispose()}}function Is(i){return new Tm({color:0,emissive:16777215,emissiveIntensity:i})}function BM(i){const e=new Kn;e.background=new Oe("#111d24");const t=new FM,n=new so(i);e.environment=n.fromScene(t,.04).texture,e.environmentIntensity=.48,t.dispose(),n.dispose();const s=(R,w=.76,C=0)=>new Lt({color:R,roughness:w,metalness:C}),r=new it({color:"#15252e",toneMapped:!1}),o=new it({color:"#57767a",toneMapped:!1}),a=new it({color:"#a4ead6",toneMapped:!1}),c=s("#192d39"),l=s("#254957"),u=s("#ab8463",.45,.5);function f(R,w,C,N,F){const I=new mt(R,w);return I.position.set(C,N,F),I.receiveShadow=!0,e.add(I),I}function h(R,w,C,N,F,I,B){return f(new en(R,w,C),B,N,F,I)}e.add(new li("#d6f2f9","#706458",1.5));const d=new Wt("#ffecce",2.3);d.position.set(-.44,.61,.66),d.castShadow=!0,d.shadow.mapSize.set(1024,1024),Object.assign(d.shadow.camera,{left:-.58,right:.58,top:.6,bottom:-.61,near:.08,far:2.5}),d.shadow.normalBias=.002,e.add(d);const p=new Wt("#8fd2fd",2.05);p.position.set(.4,.27,-.31),e.add(p);const v=.453,g=.222,m=-.253;for(const[R,w,C,N]of[[1.2,.6-g,0,(.6+g)/2],[1.2,.6+m,0,(m-.6)/2],[.6-v,g-m,-1.053/2,(g+m)/2],[.6-v,g-m,(.6+v)/2,(g+m)/2]])f(new ut(R,w),r,C,N,0);for(const R of[g,m])f(new ut(2*v,.003),o,0,R,.001);for(const R of[-1,1]){f(new ut(.003,g-m),o,R*v,(g+m)/2,.001),h(.025,.66,1.06,R*.5,0,-.544,c);for(const w of[-.24,-.5,-.77])h(.013,.59,.018,R*.481,0,w,l),h(.003,.183,.005,R*.473,.069,w,a)}h(1.03,.026,1.08,0,-.29,-.554,c),h(1.03,.023,1.08,0,.315,-.554,c),h(1.02,.66,.04,0,0,-1.08,c),h(.72,.44,.024,0,-.012,-1.045,l),h(.66,.008,.032,0,.212,-1.029,a);for(const R of[-1,1]){h(.004,.33,.028,R*.33,-.006,-1.026,o),h(.003,.004,.87,R*.328,-.272,-.514,o);for(let w=0;w<5;w+=1)h(.027,.003,.003,R*.3,-.095+w*.042,-1.03,o)}const x=-.225,y=.07;f(new dt(.217,.237,.048,80),c,0,x-.034,y),f(new dt(.227,.227,.01,80),u,0,x-.012,y),f(new dt(.21,.219,.009,80),l,0,x-.0045,y);const S=f(new gn(.203,.0015,8,80),o,0,x+5e-4,y);S.rotation.x=-Math.PI/2;const E=new tt;E.position.set(0,x,y),e.add(E);let b,_;function M(R){const w=new si().setFromObject(R,!0),C=w.getSize(new L),N=w.getCenter(new L),F=Math.hypot(C.x,C.z),I=Math.min(.474/C.y,.378/F);if(w.isEmpty()||!Number.isFinite(I)||I<=0)throw vl(R),new Error("文件里没有可展示的模型。");const B=new tt;return B.scale.setScalar(I),B.position.set(-N.x*I,-w.min.y*I,-N.z*I),B.add(R),R.traverse(H=>{H.isMesh&&(H.castShadow=H.receiveShadow=!0)}),B}return{scene:e,update:()=>!1,setAngle(R){E.rotation.y=kt.degToRad(R)},async loadSample(){const R=await fetch("./astronaut.glb");if(!R.ok)throw new Error("示例模型载入失败。");b=M(await mf(await R.arrayBuffer())),b.visible=!_,E.add(b)},async importFile(R){if(R.size>50*1024*1024)throw new Error("请选择不超过 50 MB 的 GLB 文件。");const w=M(await mf(await R.arrayBuffer()));_&&(_.removeFromParent(),vl(_)),_=w,E.add(_),b&&(b.visible=!1)},resetSample(){_&&(_.removeFromParent(),vl(_),_=void 0),b&&(b.visible=!0)}}}async function mf(i){const e=new DataView(i);if(e.byteLength<20||e.getUint32(0,!0)!==1179937895||e.getUint32(4,!0)!==2)throw new Error("请选择有效的 GLB 2.0 文件。");const t=e.getUint32(12,!0);let n;try{const r=JSON.parse(new TextDecoder().decode(new Uint8Array(i,20,t)));n=[...r.buffers??[],...r.images??[]]}catch{throw new Error("无法读取 GLB 文件。")}if(n.some(r=>(r==null?void 0:r.uri)&&!String(r.uri).startsWith("data:")))throw new Error("请将网格和贴图嵌入 GLB 文件。");const s=new Id;s.setURLModifier(r=>{if(r.startsWith("blob:")||r.startsWith("data:"))return r;throw new Error("请将网格和贴图嵌入 GLB 文件。")});try{const{scene:r}=await new nM(s).parseAsync(i,"");return r}catch{throw new Error("无法读取模型。请使用内嵌贴图、未压缩的 GLB 2.0。")}}function vl(i){const e=new Set,t=new Set;i.traverse(n=>{if(n.isMesh){e.add(n.geometry),n.skeleton&&e.add(n.skeleton);for(const s of Array.isArray(n.material)?n.material:[n.material]){e.add(s);for(const r of Object.values(s))r!=null&&r.isTexture&&(e.add(r),r.image instanceof ImageBitmap&&t.add(r.image))}}});for(const n of e)n.dispose();for(const n of t)n.close()}const Vn='"Microsoft YaHei", "Segoe UI", sans-serif',zM='Georgia, "Microsoft YaHei", serif',Ec='Consolas, "Segoe UI", monospace',kM="#f8e8cb",Hr="#352b28",ga="#a04131",HM=["日","一","二","三","四","五","六"],Sl=i=>String(i).padStart(2,"0");function GM(){const i=new Kn;i.background=new Oe("#342c27");let e=!0,t={city:"北京",label:"正在获取天气"},n="",s="";const r=new co,o=M=>new it({color:M,toneMapped:!1}),a=new Lt({color:"#674332",roughness:.83}),c=new Lt({color:"#4a3329",roughness:.82}),l=o("#b68a5c");function u(M,R,w,C,N){const F=new mt(M,R);return F.position.set(w,C,N),i.add(F),F}function f(M,R,w,C,N,F,I){return u(new en(M,R,w),I,C,N,F)}function h(M,R,w,C,N,F,I){const B=new it({toneMapped:!1,alphaTest:I?.61:0,alphaToCoverage:I}),H=u(new ut(R,w),B,C,N,F);H.visible=!1,r.load("./morning-desk/"+M+".png",k=>{k.colorSpace=xt,k.anisotropy=4,B.map=k,B.needsUpdate=!0,H.visible=!0,e=!0})}function d(M,R,w,C,N,F,I,B){const H=document.createElement("canvas");H.width=F,H.height=I;const k=new oi(H);return k.colorSpace=xt,k.anisotropy=4,f(M+.009,R+.009,.013,w,C,N-.007,B),u(new ut(M,R),new it({map:k,toneMapped:!1}),w,C,N),Q=>{Q(H.getContext("2d")),k.needsUpdate=!0}}i.add(new li("#ffe9cc","#63504c",1.6));const p=new Wt("#ffbf80",2.15);p.position.set(-.46,.55,-.12),i.add(p),h("veranda",2.06,1.16,0,-.006,-.6,!1),f(1.04,.028,.64,0,-.247,-.282,c);const v=["#765044","#815540","#6b4b40"].map(M=>new Lt({color:M,roughness:.85}));for(let M=0;M<12;M+=1)f(.081,.003,.58,(M-5.5)*.085,-.232,-.257,v[M%v.length]);for(const M of[-1,1])f(.035,.55,.038,M*.479,0,-.225,c),f(.028,.022,.047,M*.466,.19,-.222,a),f(.031,.024,.039,M*.462,-.202,-.22,a);const g=.461,m=.227,x=-.249,y=o("#282321");for(const[M,R,w,C]of[[1.2,.6-m,0,(.6+m)/2],[1.2,.6+x,0,(x-.6)/2],[.6-g,m-x,-1.061/2,(m+x)/2],[.6-g,m-x,(.6+g)/2,(m+x)/2]])u(new ut(M,R),y,w,C,0);for(const M of[m,x])u(new ut(2*g,.002),l,0,M,.001);for(const M of[-1,1])u(new ut(.002,m-x),l,M*g,(m+x)/2,.001),f(.229,.018,.222,M*.304,-.249,.029,c),f(.219,.005,.216,M*.304,-.238,.029,a);h("sasuke",.328,.492,-.304,.011,.082,!0),h("naruto",.325,.4875,.307,.0088,.079,!0);const S=d(.256,.218,-.137,.025,.126,720,616,c),E=d(.256,.177,.143,.04,.126,720,498,c),b=d(.352,.103,.005,-.155,.153,960,281,c);return d(.187,.033,0,.264,.0018,750,132,c)(M=>{Ia(M,"#282321","#8b694d"),pn(M,"木 叶  ·  晨 间 桌",375,81,43,Vn,"#ead3ae","center",600)}),b(M=>gf(M,t)),{scene:i,setWeather(M){t=M,b(R=>gf(R,t)),e=!0},update(M){const R=`${M.getHours()}:${M.getMinutes()}:${M.getSeconds()}`,w=`${M.getFullYear()}-${M.getMonth()}-${M.getDate()}`;R!==n&&(E(N=>WM(N,M)),n=R,e=!0),w!==s&&(S(N=>VM(N,M)),s=w,e=!0);const C=e;return e=!1,C}}}function Ia(i,e,t){const{width:n,height:s}=i.canvas;i.fillStyle=e,i.fillRect(0,0,n,s),i.strokeStyle=t,i.lineWidth=3,i.strokeRect(13,13,n-26,s-26)}function pn(i,e,t,n,s,r,o,a="left",c=400,l){i.font=`${c} ${s}px ${r}`,i.fillStyle=o,i.textAlign=a,l?i.fillText(e,t,n,l):i.fillText(e,t,n)}function _a(i,e,t,n,s){i.strokeStyle=s,i.lineWidth=2,i.beginPath(),i.moveTo(e,n),i.lineTo(t,n),i.stroke()}function VM(i,e){Ia(i,kM,"#c8a477");const t=e.getFullYear(),n=e.getMonth(),s=e.getDate();pn(i,"佐助  /  本月日历",45,64,29,Vn,ga,"left",700),pn(i,`${t} 年 ${n+1} 月`,45,142,62,Vn,Hr,"left",700),_a(i,45,675,171,"#c8a477");const r=["一","二","三","四","五","六","日"],o=(new Date(t,n,1).getDay()+6)%7,a=new Date(t,n+1,0).getDate();for(const[c,l]of r.entries())pn(i,l,87+c*91,225,34,Vn,"#806b58","center");for(let c=1;c<=a;c+=1){const l=o+c-1,u=87+l%7*91,f=283+Math.floor(l/7)*57;c===s&&(i.fillStyle=ga,i.beginPath(),i.arc(u,f-13,25,0,Math.PI*2),i.fill()),pn(i,c,u,f,40,Ec,c===s?"#fff3d5":Hr,"center",700)}}function WM(i,e){Ia(i,"#242926","#ae865e"),pn(i,"鸣人  /  本地时间",49,79,33,Vn,"#f0bb84","left",700),_a(i,49,671,109,"#665748");const t=`${Sl(e.getHours())}:${Sl(e.getMinutes())}`;pn(i,t,41,306,188,Ec,"#fff0cd","left",700),pn(i,Sl(e.getSeconds()),662,305,55,Ec,"#e0ad74","right",600),_a(i,49,671,349,"#665748"),pn(i,`${e.getMonth()+1} 月 ${e.getDate()} 日   ·   星期${HM[e.getDay()]}`,50,429,47,Vn,"#f0dcc2","left",500)}function gf(i,e){if(Ia(i,"#ead3a8","#b78959"),pn(i,e.city+"  /  今日天气",48,66,37,Vn,ga,"left",700,860),_a(i,48,911,90,"#bb946a"),e.temperature==null){pn(i,e.label,48,181,51,Vn,Hr,"left",700);return}pn(i,`${e.temperature}°`,46,222,126,zM,Hr,"left",700),pn(i,e.label,310,162,59,Vn,Hr,"left",700,450);const t=e.low==null||e.high==null?"":`${e.low}° 至 ${e.high}°`,n=e.rain==null?"":`降雨 ${e.rain}%`,s=[t,n].filter(Boolean).join("   ·   ");pn(i,s,310,220,44,Vn,"#624b37","left",600,600),e.stale&&pn(i,"上次更新",903,67,28,Vn,ga,"right",700)}const Ml='"Microsoft YaHei", "Segoe UI", sans-serif',Sr='"Segoe UI", "Microsoft YaHei", sans-serif',_i="#293028",Mr="#55594e",_f=["日","一","二","三","四","五","六"],xf=i=>String(i).padStart(2,"0");function vf(i,e=!1){const t=new Kn;t.background=new Oe(e?"#181916":"#302a24");let n=!0,s="",r=-1/0,o={city:"北京",label:"正在获取天气"};const a=e?window.matchMedia("(prefers-reduced-motion: reduce)"):null,c=new co().load("./window-desk/"+(e?"rain-night.png":"room.png"),()=>{n=!0});c.colorSpace=xt,c.anisotropy=8;const l=-.155,u=-.46,f=.69,h=Sf(c,i,!1,e),d=new mt(new ut(2.5,1.7),h);d.position.z=-.87,t.add(d);const p=new mt(new ut(1.58,f-u),Sf(c,i,!0));p.rotation.x=-Math.PI/2,p.position.set(0,l,(f+u)/2),p.renderOrder=1,t.add(p),t.add(new li("#f2e5d1","#504035",e?1.15:2.05));const v=new Wt(e?"#9cb4d0":"#e4edf2",e?.62:1.55);v.position.set(.55,.5,-.24),t.add(v);const g=new Wt("#ffd7a0",e?1.3:.72);g.position.set(-.44,.26,.2),t.add(g);const m=e?.115:.032,x=-.015,y=-.055,S=new Lt({map:XM(),color:"#a78b70",roughness:.6,metalness:.08}),E=new Lt({color:"#302a25",roughness:.66}),b=new Lt({color:"#3e372d",roughness:.73}),_=new tt;_.position.set(m,l,x),_.rotation.y=y,_.scale.setScalar(e?.8:.86),t.add(_);function M(B,H,k,Q,G,Z,V,ue,Re){const D=new mt(new ci(H,k,Q,3,G),Z);return D.position.set(V,ue,Re),B.add(D),D}M(_,.3,.011,.082,.005,E,0,.0055,-.036),M(_,.24,.044,.021,.006,E,0,.029,-.044).rotation.x=-.25;const R=new tt;R.position.set(0,.119,-.007),R.rotation.x=-.095,_.add(R),M(R,.443,.21,.035,.01,S,0,0,0),M(R,.425,.192,.009,.004,b,0,0,.015);const w=document.createElement("canvas");w.width=1200,w.height=516;const C=w.getContext("2d"),N=new oi(w);N.colorSpace=xt,N.anisotropy=8;const F=new mt(new ut(.405,.174),new it({map:N,toneMapped:!1}));F.position.z=.0201,R.add(F);const I=qM();for(const[B,H,k,Q]of[[.56,.28,.035,.57],[.37,.11,-.023,.65]]){const G=new mt(new ut(B,H),new it({map:I,transparent:!0,opacity:Q,depthWrite:!1,toneMapped:!1}));G.rotation.set(-Math.PI/2,0,y),G.position.set(m+(e?.025:-.023),l+7e-4,x+k),G.renderOrder=2,t.add(G)}return{scene:t,viewGain:[.26,.18,.2],setWeather(B){o=B,s=""},update(B,H){const k=`${B.getFullYear()}-${B.getMonth()}-${B.getDate()}-${B.getHours()}:${B.getMinutes()}`;k!==s&&(YM(C,B,o,e),N.needsUpdate=!0,s=k,n=!0),a&&!a.matches&&H-r>=42&&(h.uniforms.rainSeconds.value=H/1e3,r=H,n=!0);const Q=n;return n=!1,Q}}}function Sf(i,e,t,n=!1){return new Ki({transparent:t,depthWrite:!t,toneMapped:!1,defines:n?{RAIN_GLASS:1}:{},uniforms:{photograph:{value:i},refDistance:{value:e},deskLayer:{value:t?1:0},rainSeconds:{value:0}},vertexShader:`
      varying vec3 worldPoint;
      void main() {
        worldPoint = (modelMatrix * vec4(position, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,fragmentShader:`
      uniform sampler2D photograph;
      uniform float refDistance;
      uniform float deskLayer;
      varying vec3 worldPoint;
      #ifdef RAIN_GLASS
        uniform float rainSeconds;

        float glassPane(vec2 uv, float left, float right) {
          return smoothstep(left, left + 0.012, uv.x) *
            (1.0 - smoothstep(right - 0.012, right, uv.x));
        }

        float rainDrop(vec2 uv) {
          float onGlass = (glassPane(uv, 0.48, 0.738) + glassPane(uv, 0.79, 0.915)) *
            smoothstep(0.327, 0.351, uv.y) * (1.0 - smoothstep(0.97, 0.999, uv.y));
          vec2 grid = uv * vec2(39.0, 8.0);
          float lane = floor(grid.x);
          float speed = 0.16 + fract(sin(lane * 74.81) * 2937.17) * 0.19;
          grid.y += rainSeconds * speed;
          vec2 cell = floor(grid);
          float seed = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
          vec2 local = fract(grid);
          float dx = abs(local.x - 0.18 - 0.64 * seed);
          float dy = local.y - 0.32;
          float bead = 1.0 - smoothstep(0.62, 1.0, length(vec2(dx / 0.043, dy / 0.026)));
          float tail = (1.0 - smoothstep(0.005, 0.019, dx)) *
            smoothstep(-0.009, 0.025, dy) * (1.0 - smoothstep(0.10, 0.37, dy));
          return onGlass * step(0.67, seed) * (bead + 0.34 * tail);
        }
      #endif
      void main() {
        vec2 projected = worldPoint.xy * (refDistance / (refDistance - worldPoint.z));
        vec2 uv = vec2(0.5) + projected * vec2(0.87, 0.87 * 16.0 / 9.0);
        float blend = smoothstep(-0.46, -0.34, worldPoint.z) *
          (1.0 - smoothstep(0.31, 0.44, abs(projected.x)));
        vec3 color = texture2D(photograph, uv).rgb;
        #ifdef RAIN_GLASS
          float drop = rainDrop(uv);
          vec3 bent = texture2D(photograph, uv + vec2(0.0015, -0.0028) * drop).rgb;
          color = mix(color, bent, drop * 0.64) + vec3(0.039, 0.048, 0.056) * drop;
        #endif
        gl_FragColor = vec4(color, mix(1.0, blend, deskLayer));
        #include <colorspace_fragment>
      }
    `})}function XM(){const i=document.createElement("canvas");i.width=768,i.height=256;const e=i.getContext("2d");e.fillStyle="#dedbd6",e.fillRect(0,0,768,256);for(let n=1;n<256;n+=2){e.beginPath(),e.strokeStyle=n%7===0?"#ffffffe0":"#60452932",e.lineWidth=n%9===0?1.6:.6;for(let s=0;s<=768;s+=16)e.lineTo(s,n+Math.sin(s*.013+n*.11)*1.8+Math.sin(s*.005+n*.41)*3);e.stroke()}const t=new oi(i);return t.colorSpace=xt,t.anisotropy=8,t}function qM(){const i=document.createElement("canvas");i.width=i.height=128;const e=i.getContext("2d"),t=e.createRadialGradient(64,64,6,64,64,64);t.addColorStop(0,"rgba(21, 15, 12, 0.92)"),t.addColorStop(.55,"rgba(21, 15, 12, 0.48)"),t.addColorStop(1,"rgba(21, 15, 12, 0)"),e.fillStyle=t,e.fillRect(0,0,128,128);const n=new oi(i);return n.colorSpace=xt,n}function YM(i,e,t,n){const s=i.createLinearGradient(0,516,1200,0);s.addColorStop(0,n?"#d4bc95":"#d1c8b4"),s.addColorStop(.52,n?"#c7b89a":"#e0dccc"),s.addColorStop(1,n?"#b7b3a0":"#e9e7d9"),i.fillStyle=s,i.fillRect(0,0,1200,516);function r(h,d,p,v,g=_i,m=500,x="left",y=Ml,S){i.font=`${m} ${v}px ${y}`,i.fillStyle=g,i.textAlign=x,S?i.fillText(h,d,p,S):i.fillText(h,d,p)}function o(h,d,p,v){i.strokeStyle="#9d9e8d",i.lineWidth=2,i.beginPath(),i.moveTo(h,d),i.lineTo(p,v),i.stroke()}const a=e.getMonth(),c=e.getFullYear(),l=e.getDate();if(r("本地时间",45,58,31,Mr,600),r(`${xf(e.getHours())}:${xf(e.getMinutes())}`,39,221,175,_i,650,"left",Sr),r(`${a+1} 月 ${l} 日   星期${_f[e.getDay()]}`,48,284,42,_i,550),o(47,318,600,318),r(`${t.city}  ·  室外${t.stale?"  ·  上次更新":""}`,48,365,31,Mr,600,"left",Ml,540),t.temperature==null)r(t.label,48,452,47,_i,600);else{r(`${t.temperature}°`,45,464,94,_i,650,"left",Sr),r(t.label,231,417,36,_i,600,"left",Ml,157);const h=t.low==null||t.high==null?"":`${t.low}° / ${t.high}°`;r(h,232,470,33,Mr,550,"left",Sr),t.humidity!=null&&(r("室外湿度",414,416,31,Mr,550),r(`${t.humidity}%`,414,476,56,_i,650,"left",Sr))}o(635,42,635,474),r(`${c} 年 ${a+1} 月`,675,76,42,_i,650),o(675,107,1152,107);const u=(new Date(c,a,1).getDay()+6)%7,f=new Date(c,a+1,0).getDate();for(let h=0;h<7;h+=1)r(_f[(h+1)%7],709+h*68,152,30,Mr,600,"center");for(let h=1;h<=f;h+=1){const d=u+h-1,p=709+d%7*68,v=207+Math.floor(d/7)*47;h===l&&(i.fillStyle="#495648",i.beginPath(),i.arc(p,v-11,22,0,Math.PI*2),i.fill()),r(String(h),p,v,35,h===l?"#f5f0df":_i,600,"center",Sr)}}const Gr='"Microsoft YaHei", "Segoe UI", sans-serif',KM='Georgia, "Microsoft YaHei", serif',$M=["一","二","三","四","五","六","日"],Mf=i=>String(i).padStart(2,"0");function JM(i){const e=new Kn;e.background=new Oe("#171717");const t=(V,ue=.75,Re=0)=>new Lt({color:V,roughness:ue,metalness:Re}),n=new it({color:"#191919",toneMapped:!1}),s=t("#9b6643"),r=t("#50352d"),o=t("#242320"),a=t("#aa8055",.37,.55),c=t("#284c4d"),l=t("#97816a"),u=t("#e9cbaa"),f=new it({color:"#ffd296",toneMapped:!1});function h(V,ue,Re,D,K,ne=e){const fe=new mt(V,ue);return fe.position.set(Re,D,K),fe.castShadow=!0,fe.receiveShadow=!0,ne.add(fe),fe}function d(V,ue,Re,D,K,ne,fe,ce=0,pe=e){const He=ce?new ci(V,ue,Re,2,ce):new en(V,ue,Re);return h(He,fe,D,K,ne,pe)}function p(V,ue,Re,D,K,ne,fe,ce=e){const pe=h(new Qt(1,28,18),fe,D,K,ne,ce);return pe.scale.set(V,ue,Re),pe}function v(V,ue,Re,D,K,ne,fe,ce=e){const pe=document.createElement("canvas");pe.width=ne,pe.height=fe;const He=new oi(pe);return He.colorSpace=xt,He.anisotropy=8,h(new ut(V,ue),new it({map:He,toneMapped:!1}),Re,D,K,ce).castShadow=!1,se=>{se(pe.getContext("2d")),He.needsUpdate=!0}}e.add(new li("#d9e9ed","#77543b",1.25));const g=new Wt("#ffe0b3",2.15);g.position.set(-.47,.65,.56),g.target.position.set(0,-.07,-.5),g.castShadow=!0,g.shadow.mapSize.set(1024,1024),Object.assign(g.shadow.camera,{left:-.66,right:.66,top:.52,bottom:-.56,near:.05,far:2.8}),g.shadow.normalBias=.0018,g.shadow.intensity=.72,e.add(g,g.target);const m=new Wt("#a1cfed",.95);m.position.set(.67,.25,-.1),e.add(m),d(1.07,.61,.031,0,0,-1.22,l),d(1.04,.028,1.2,0,-.281,-.607,r),d(1.04,.03,1.2,0,.302,-.607,r);const x=["#925d43","#9e6749","#a36d4e","#82503d"].map(V=>t(V));for(let V=0;V<14;V+=1)d(.071,.007,1.19,(V-6.5)*.073,-.263,-.606,x[V%4]);for(const V of[-1,1]){d(.026,.61,1.2,V*.514,0,-.611,l),d(.014,.232,1.19,V*.494,-.143,-.61,c),d(.019,.014,1.19,V*.482,-.026,-.61,s);for(const ue of[-.18,-.48,-.81,-1.16])d(.026,.545,.023,V*.48,.012,ue,r)}d(1.04,.237,.021,0,-.145,-1.196,c),d(1.04,.015,.022,0,-.027,-1.181,s),d(.28,.23,.102,-.265,-.135,-1.16,r,.006);for(const V of[-.19,-.112])for(const ue of[-.324,-.203])d(.112,.067,.013,ue,V,-1.102,s,.005),p(.009,.009,.006,ue,V,-1.09,a);d(.304,.022,.12,-.265,-.019,-1.154,s,.005);const y=-.317,S=-1.082;h(new dt(.047,.051,.011,28),a,y,-.002,S),h(new dt(.006,.007,.094,20),a,y,.05,S),h(new dt(.029,.075,.061,36),u,y,.106,S),h(new dt(.066,.066,.0025,36),f,y,.076,S);const E=new ii("#ffba71",.1,.9,2);E.position.set(y,.066,S+.02),e.add(E);for(const[V,ue]of["#b56c4e","#747959","#9e8358","#aa6049"].entries())d(.023,.049+V*.012,.032,-.239+V*.026,.016+V*.006,-1.094,t(ue),.002).rotation.z=(V-1)*.06;d(.255,.129,.135,.327,-.201,-.68,r,.009),d(.269,.017,.149,.327,-.128,-.68,s,.005),d(.128,.011,.075,.351,-.115,-.65,c,.002),d(.116,.008,.067,.343,-.105,-.65,u,.002).rotation.y=-.13,d(.356,.231,.018,.291,.107,-1.168,r,.005);const b=v(.333,.208,.291,.107,-1.157,672,420),_=-.436,M=.436,R=-.199,w=.207,C=new Pi().moveTo(-.62,-.56).lineTo(.62,-.56).lineTo(.62,.56).lineTo(-.62,.56).closePath();C.holes.push(new Zs().moveTo(_,R).lineTo(_,w).lineTo(M,w).lineTo(M,R).closePath()),h(new fs(C),n,0,0,0).castShadow=!1,d(.891,.017,.079,0,R-.008,-.039,s,.004);const N=d(.903,.016,.008,0,R-.009,.0045,r,.003);N.castShadow=!1;for(const V of[_,M])d(.014,w-R,.038,V,(w+R)/2,-.019,o,.003);d(.883,.011,.027,0,w-.0045,-.014,r,.002);const F=new tt;F.position.set(.208,-.137,.175),F.rotation.set(-.12,-.2,.075),F.visible=!1,e.add(F),d(.236,.142,.04,0,0,0,s,.01,F),d(.216,.12,.006,0,0,.02,r,.003,F);const I=v(.201,.105,0,0,.0235,804,420,F);let B;Fc(async()=>{const{loadVisitorAvatar:V}=await import("./visitor-avatar-BV5xxmCf.js").then(ue=>ue.v);return{loadVisitorAvatar:V}},[],import.meta.url).then(({loadVisitorAvatar:V})=>V(e,F,R)).then(V=>{B=V,F.visible=!0,i("ready")}).catch(V=>{console.error("Failed to load the visitor avatar",V),i("error")});const H=window.matchMedia("(prefers-reduced-motion: reduce)");let k={city:"北京",label:"正在获取天气"},Q="",G="",Z=1;return{scene:e,viewGain:[.6,.28,.25],setWeather(V){k=V,G=""},update(V,ue){var ce,pe;let Re=!1;const D=`${Mf(V.getHours())}:${Mf(V.getMinutes())}`,K=`${V.getFullYear()}-${V.getMonth()}-${V.getDate()}`;Q!==D&&(I(He=>ZM(He,D)),Q=D,Re=!0),G!==K&&(b(He=>QM(He,V,k)),G=K,Re=!0);const ne=ue%5900,fe=!H.matches&&ne>5660?1-.9*Math.sin((ne-5660)*Math.PI/240):1;return B&&fe!==Z&&((ce=B.expressionManager)==null||ce.setValue("blink",1-fe),(pe=B.expressionManager)==null||pe.update(),Z=fe,Re=!0),Re}}}function Bs(i,e,t,n,s,r,o=Gr,a="left",c){i.font=`600 ${s}px ${o}`,i.textAlign=a,i.fillStyle=r,c?i.fillText(e,t,n,c):i.fillText(e,t,n)}function ZM(i,e){i.fillStyle="#e4d6b9",i.fillRect(0,0,804,420),i.strokeStyle="#a28764",i.lineWidth=2,i.strokeRect(12,12,780,396),Bs(i,"今 日 时 间",402,85,46,"#705842",Gr,"center"),Bs(i,e,402,315,205,"#302a22",KM,"center",726)}function QM(i,e,t){i.fillStyle="#dfcfb1",i.fillRect(0,0,672,420);const n=e.getFullYear(),s=e.getMonth(),r=e.getDate();Bs(i,`${n} 年 ${s+1} 月`,31,57,43,"#393127");const o=(new Date(n,s,1).getDay()+6)%7,a=new Date(n,s+1,0).getDate();for(let f=0;f<7;f+=1)Bs(i,$M[f],70+f*87,102,32,"#695944",Gr,"center");for(let f=1;f<=a;f+=1){const h=o+f-1,d=70+h%7*87,p=147+Math.floor(h/7)*37;f===r&&(i.fillStyle="#9f5140",i.beginPath(),i.arc(d,p-11,19,0,Math.PI*2),i.fill()),Bs(i,f,d,p,33,f===r?"#fff0d4":"#3b3328",Gr,"center")}i.fillStyle="#b8a482",i.fillRect(31,354,610,2);const c=t.temperature==null?t.label:`${t.temperature}° ${t.label}`,l=t.humidity==null?"":`  ·  湿度 ${t.humidity}%`,u=t.stale?" · 上次更新":"";Bs(i,`${t.city}  ·  ${c}${l}${u}`,31,401,32,"#4a3a2b",Gr,"left",610)}const jM=Math.PI*2,wc=.192,yf=.077,e1=-.067,$d=-.031,Jd=.297,In=(i,e)=>new Lt({color:i,roughness:.85,...e}),t1=i=>new it({color:i,toneMapped:!1});function _n(i,e,t,n,s,r,o=!0){const a=new mt(e,t);return a.position.set(n,s,r),a.castShadow=a.receiveShadow=o,i.add(a),a}function xu(i,e,t){const n=document.createElement("canvas");n.width=i,n.height=e;const s=n.getContext("2d");t==null||t(s,i,e);const r=new oi(n);return r.colorSpace=xt,r.anisotropy=8,{map:r,ctx:s,width:i,height:e}}function n1(i){return()=>(i=Math.imul(1664525,i)+1013904223>>>0)/4294967296}function i1(){return xu(1536,1024,(i,e,t)=>{const n=n1(13),s=84;for(let r=0;r<t;r+=s){const o=Math.floor(n()*410)-570;for(let a=o;a<e;a+=560){const c=n()*7;i.fillStyle=`hsl(34 54% ${66+c}%)`,i.fillRect(a,r,560,s),i.save(),i.beginPath(),i.rect(a,r,560,s),i.clip();for(let l=0;l<180;l++){const u=a-120+n()*640,f=r+n()*s,h=28+n()*410,d=(n()-.5)*12;i.strokeStyle=l%3?`rgba(94,61,29,${.025+n()*.1})`:"#fff2c728",i.lineWidth=.25+n()*1.9,i.beginPath(),i.moveTo(u,f),i.bezierCurveTo(u+h*.32,f+d,u+h*.68,f-d,u+h,f),i.stroke()}i.restore(),i.fillStyle="#9e78495a",i.fillRect(a,r,1.25,s)}i.fillStyle="#a17d545c",i.fillRect(0,r,e,1.2),i.fillStyle="#ffefcd88",i.fillRect(0,r+1.2,e,1)}}).map}function s1(){const{map:i}=xu(128,128,(e,t,n)=>{e.fillStyle="#e4e9ec",e.fillRect(0,0,t,n);const s=e.createLinearGradient(0,0,t,n);s.addColorStop(0,"#f1f3f6"),s.addColorStop(.66,"#dce4e9"),s.addColorStop(1,"#d6dfe4"),e.fillStyle=s,e.fillRect(2,2,t-4,n-4),e.strokeStyle="#ffffff72",e.strokeRect(3,3,t-6,n-6)});return i.wrapS=i.wrapT=qi,i.repeat.set(13,6.2),i}function r1(i,e,t){const n=In("#62a894"),s=In("#7ea463"),r=In("#9db977");_n(i,new dt(.032,.023,.044,36),n,e,.022,t),_n(i,new gn(.03,.0026,10,38),n,e,.044,t).rotation.x=Math.PI/2,_n(i,new Tn(.029,32),In("#685a42"),e,.043,t).rotation.x=-Math.PI/2;const o=(a,c,l,u,f,h,d)=>{const p=_n(i,new Qt(1,24,16),d,e+a,c,t+l);p.scale.set(u,f,u*.55),p.rotation.z=h};o(0,.061,0,.018,.031,-.04,s),o(-.013,.102,-.004,.018,.029,.26,s),o(.018,.09,.008,.016,.022,-.62,r),o(.024,.123,.006,.012,.022,-.2,r)}function o1(i,e,t){const n=In("#3f4789",{roughness:.48}),s=In("#d7e2ef",{roughness:.3,metalness:.14});_n(i,new dt(.039,.043,.015,48),n,e,.008,t),_n(i,new dt(.0038,.0038,.548,18),s,e,.279,t),_n(i,new dt(.0054,.0063,.024,18),n,e,.025,t)}function a1(i,e,t){for(const[n,s,r]of[[.038,.026,"#ebc5d7"],[.031,.064,"#e8c8df"],[.026,.097,"#c9c1e7"],[.021,.125,"#f4e2f0"]]){const o=_n(i,new Qt(n,32,20),In(r),e,s,t);o.scale.y=.67}_n(i,new Qt(.015,28,16),In("#f2e5ed"),e,.151,t)}function l1(i){const e=new tt;e.position.set(0,Jd,$d),i.add(e);const{map:t,ctx:n}=xu(1024,384);_n(e,new ci(wc,yf,.018,4,.0035),In("#343e3d",{roughness:.43}),0,0,0),_n(e,new ut(wc-.009,yf-.009),new it({map:t,toneMapped:!1}),0,0,.0092,!1);let s=-1;return r=>{const o=Math.floor(r.getTime()/6e4);if(o===s)return!1;s=o;const a=String(r.getHours()).padStart(2,"0")+String(r.getMinutes()).padStart(2,"0");n.fillStyle="#e9e9e1",n.fillRect(0,0,1024,384),n.textAlign="center",n.textBaseline="middle",n.font="700 220px Arial, sans-serif";for(const[c,l]of[30,244,580,794].entries())n.fillStyle="#333432",n.fillRect(l,24,200,257),n.fillStyle="#41413e",n.fillRect(l,153,200,128),n.fillStyle="#f9f8ef",n.fillText(a[c],l+100,161),n.fillStyle="#101311",n.fillRect(l,151,200,4),n.fillStyle="#ffffff25",n.fillRect(l,155,200,2);n.fillStyle="#32342f";for(const c of[119,183])n.beginPath(),n.arc(512,c,7.5,0,jM),n.fill();return n.font='500 35px "Microsoft YaHei", sans-serif',n.fillStyle="#565650",n.fillText(`${r.getMonth()+1}月${r.getDate()}日   ${["星期日","星期一","星期二","星期三","星期四","星期五","星期六"][r.getDay()]}`,512,331),t.needsUpdate=!0,!0}}function c1(i){const e=new Kn,t="#211f1e";e.background=new Oe(t),e.add(new li("#f2f7ff","#cbb29b",1.83));const n=new Wt("#fff9f0",1.38);n.position.set(-.39,.45,.68),n.target.position.set(.06,-.15,-.38),n.castShadow=!0,n.shadow.mapSize.set(2048,2048),Object.assign(n.shadow.camera,{left:-.66,right:.66,top:.65,bottom:-.65,near:.03,far:1.9}),n.shadow.normalBias=7e-4,n.shadow.bias=-7e-5,n.shadow.radius=2.5,e.add(n,n.target);const s=new tt;s.position.set(0,-.244,-.009),s.rotation.x=.375,e.add(s);const r=_n(s,new ut(1.11,.98),In("#ffffff",{map:i1()}),0,0,-.488,!1);r.rotation.x=-Math.PI/2,r.receiveShadow=!0;const o=_n(s,new ut(1.12,.56),In("#ffffff",{map:s1(),emissive:"#a1bdd6",emissiveIntensity:.21}),0,.28,-.97,!1);o.receiveShadow=!0;const a=In("#c8d6e3",{emissive:"#a1bdd6",emissiveIntensity:.12});for(const d of[-1,1]){const p=_n(s,new ut(.98,.56),a,d*.552,.28,-.488,!1);p.rotation.y=-d*Math.PI/2,p.receiveShadow=!0}r1(s,-.385,-.25),o1(s,.296,-.67),a1(s,.404,-.27);const c=t1(t),l=(d,p,v,g)=>_n(e,new ut(d,p),c,v,g,0,!1);l(2,.5,0,.479),l(2,.5,0,-.486),l(.5,.47,-.714,-.003),l(.5,.47,.714,-.003);const u=l1(s);let f,h=!1;return Fc(async()=>{const{loadReferenceFigure:d}=await import("./reference-figure-DOhF0L_7.js");return{loadReferenceFigure:d}},__vite__mapDeps([0,1]),import.meta.url).then(({loadReferenceFigure:d})=>d(s,{z:e1,clockZ:$d,clockY:Jd,clockWidth:wc})).then(d=>{f=d,i("ready")}).catch(d=>{console.error("Failed to load the reference figure",d),i("error")}),{scene:e,viewGain:[.67,.44,.55],get shadowsChanged(){return h},update(d,p){const v=u(d);return h=(f==null?void 0:f(p))??!1,v||h}}}function ro(i,e,t,n,s,r){const o=i.near/n;i.projectionMatrix.makePerspective((-s-e)*o,(s-e)*o,(r-t)*o,(-r-t)*o,i.near,i.far),i.projectionMatrixInverse.copy(i.projectionMatrix).invert()}const Hn={width:.65,height:.65*9/16,z:.005},is={width:.687,height:.402},u1=1.02,bf=.39,yt=(i,e=.42,t=.3)=>new Lt({color:i,roughness:e,metalness:t});function wt(i,e,t,n,s,r,o=!0){const a=new mt(e,t);return a.position.set(n,s,r),a.castShadow=a.receiveShadow=o,i.add(a),a}function Ct(i,e,t,n,s,r,o,a,c=.003){return wt(i,new ci(t,n,s,3,c),e,r,o,a)}function Zd(i,e,t){const n=new Pi,s=i/2,r=e/2;return n.moveTo(-s+t,-r),n.lineTo(s-t,-r),n.quadraticCurveTo(s,-r,s,-r+t),n.lineTo(s,r-t),n.quadraticCurveTo(s,r,s-t,r),n.lineTo(-s+t,r),n.quadraticCurveTo(-s,r,-s,r-t),n.lineTo(-s,-r+t),n.quadraticCurveTo(-s,-r,-s+t,-r),n}function yl(i,e,t){const n=new fs(Zd(i,e,t),8),s=n.attributes.position,r=n.attributes.uv;for(let o=0;o<s.count;o++)r.setXY(o,s.getX(o)/i+.5,s.getY(o)/e+.5);return n}function h1(i,e,t,n=.004){const s=new vd(t.map(r=>new L(...r)));return wt(i,new uu(s,32,n,8),e,0,0,0)}function f1(i,e){const t=new tt;t.position.set(.05,.194,.025),t.rotation.set(-.425,-.43,0,"YXZ"),i.add(t);const n=yt("#23211e",.54,.18),s=yt("#4b4842",.33,.6),r=yt("#1f1d1b",.3,.13),o=new lo(Zd(is.width,is.height,.022),{depth:.018,bevelThickness:.0025,bevelSize:.0024,bevelSegments:4,curveSegments:10});wt(t,o,[n,s],0,0,-.02),wt(t,yl(is.width-.005,is.height-.005,.02),r,0,0,.001,!1),wt(t,yl(Hn.width,Hn.height,.008),new it({map:e.texture}),0,0,Hn.z,!1);const a=new it({color:"#1b1b1a"});wt(t,yl(.108,.013,.006),a,0,Hn.height/2-.005,Hn.z+4e-4,!1),wt(t,new Tn(.0027,24),yt("#374253",.23,.38),.016,Hn.height/2-.0048,Hn.z+8e-4,!1),wt(t,new Tn(85e-5,16),new it({color:"#546a7a"}),.0157,Hn.height/2-.004,Hn.z+.001,!1);const c=yt("#eee0ba",.33,.04),l=wt(t,new Js(.0076,.459,7,24),c,.034,is.height/2+.009,-.011);l.rotation.z=Math.PI/2;const u=wt(t,new Aa(.0069,.019,24),c,-.204,is.height/2+.009,-.011);u.rotation.z=Math.PI/2,Ct(t,s,.045,.003,.004,.232,is.height/2+.002,-.009,.001),t.updateMatrixWorld(!0);const f=new L(0,.077,-.033),h=t.worldToLocal(new L(.131,.012,-.152));h.x=0;const d=Ct(t,n,.41,f.distanceTo(h),.016,0,0,0,.007);d.position.copy(f).lerp(h,.5),d.quaternion.setFromUnitVectors(new L(0,1,0),f.clone().sub(h).normalize());const p=Ct(i,n,.435,.012,.034,0,0,0,.004);return p.position.copy(t.localToWorld(h)),p.position.y=.006,p.rotation.y=t.rotation.y,t}function Qd(i,e,t,n,s,r,o,a,c){const l=new tt;l.position.set(r,o,a),l.rotation.y=c,i.add(l),Ct(l,t,n,s,.04,0,0,0,.011);const u=e?new it({map:e,color:"#c2c9ce",toneMapped:!1}):new wn({color:"#35434b",roughness:.45,metalness:.12,specularIntensity:.35,emissive:"#263744",emissiveIntensity:.19}),f=wt(l,new ut(n-.024,s-.035),u,0,.006,.0203,!1),h=new it({color:"#a3c2af"});return wt(l,new Tn(.00135,12),h,n/2-.025,-s/2+.008,.0204,!1),{monitor:l,picture:f}}function d1(i,e){const{monitor:t,picture:n}=Qd(i,null,e,1.1,.616,-.245,.403,-.682,.04),s=yt("#6d675f",.57,.24);return Ct(t,s,.062,.0028,.001,0,-.294,.0208,5e-4),Ct(i,s,.249,.016,.183,-.522,.009,-.638,.008),Ct(i,s,.054,.292,.051,-.525,.158,-.685,.008),Ct(i,s,.285,.036,.037,-.39,.284,-.705,.007),Ct(i,e,.094,.075,.029,-.262,.284,-.713,.006),h1(i,e,[[-.283,.262,-.717],[-.399,.223,-.729],[-.525,.064,-.725],[-.585,.009,-.78]],.003),n}function p1(i,e,t){const n=yt("#645d4e",.47,.24),s=yt("#9a8266",.39,.42),r=yt("#a79c86",.63,.08),o=new Lt({color:"#cfc2a6",emissive:"#ffd29a",emissiveIntensity:0,roughness:.76});wt(i,new dt(.054,.062,.018,48),n,e,.009,t),wt(i,new dt(.019,.026,.026,32),n,e,.027,t),wt(i,new dt(.009,.011,.204,28),s,e,.126,t);const a=[[0,0],[.051,0],[.06,.002],[.063,.006],[.062,.013],[.058,.023],[.051,.033],[.041,.041],[.028,.046],[.014,.049],[0,.05]].map(([h,d])=>new he(h,d));wt(i,new Ra(a,64),r,e,.224,t),wt(i,new dt(.053,.05,.005,48),o,e,.222,t,!1);const c=wt(i,new gn(.057,.0018,12,64),s,e,.226,t,!1);c.rotation.x=Math.PI/2;const l=new ii("#ffd4a1",0,1.6,2);l.position.set(e,.205,t);const u=new fu("#ffd1a0",0,.87,.8,.94,2);u.position.copy(l.position),u.target.position.set(e-.096,0,t+.095),u.castShadow=!0,u.shadow.mapSize.set(1024,1024),u.shadow.camera.near=.035,u.shadow.normalBias=.001,u.shadow.bias=-13e-5,u.shadow.radius=4;const f=new ii("#ffcf99",0,2.75,2);return f.position.set(e+.08,.6,t-.26),i.add(l,u,u.target,f),h=>{o.emissiveIntensity=h*1.06,l.intensity=h*.055,u.intensity=h*.155,f.intensity=h*.34}}function m1(i,e){Ct(i,e,1.39,.042,.238,.19,1.218,-.799,.007);const t=yt("#39332f",.67,.2);for(const s of[-.34,.72])Ct(i,t,.023,.123,.022,s,1.143,-.897);const n=["#555a52","#8b664a","#5c4e3c","#667477","#8b7c61"];for(const[s,r]of n.entries()){const o=.13+s%3*.019;Ct(i,yt(r,.84,0),.036,o,.124,-.27+s*.04,1.24+o/2,-.795)}Ct(i,yt("#7b6145",.69,0),.203,.053,.133,.63,1.265,-.796)}function g1(i){const e=new tt;e.position.set(.845,0,.105),i.add(e);const t=yt("#41656c",.29,.04),n=[[0,.008],[.031,.008],[.041,.019],[.045,.072],[.045,.09],[.042,.093],[.038,.09],[.038,.073],[.034,.029],[0,.023]].map(([r,o])=>new he(r,o));wt(e,new Ra(n,40),t,0,0,0),wt(e,new gn(.023,.005,12,30),t,.06,.056,0),wt(e,new dt(.07,.069,.006,36),yt("#876546",.81,0),0,.004,0);const s=wt(e,new Tn(.037,40),yt("#3c2418",.25,0),0,.07,0,!1);s.rotation.x=-Math.PI/2}function _1(i,e,t){const n=new Kn;n.background=new Oe("#171312");const s=new Nn(1536,864,{colorSpace:xn,type:Un,samples:2});s.texture.anisotropy=4;const r=new co;function o(j,De=!0){const Ne=r.load("./"+j,t);return Ne.colorSpace=De?xt:yi,Ne.anisotropy=8,Ne}const a=o("outer-desk/wood.jpg"),c=o("outer-desk/wood-normal.jpg",!1),l=o("outer-desk/wood-rough.jpg",!1);for(const j of[a,c,l])j.wrapS=j.wrapT=qi,j.repeat.set(1.06,.85),j.center.set(.5,.5),j.rotation=Math.PI/2;const u=new wn({color:"#f3f4fc",map:a,normalMap:c,normalScale:new he(.17,.17),roughness:.69,clearcoat:.07,clearcoatRoughness:.89,clearcoatRoughnessMap:l}),f=wt(n,new ut(2.65,1.37),u,0,0,-.105,!1);f.rotation.x=-Math.PI/2,f.receiveShadow=!0;const h=yt("#382313",.7,0);Ct(n,h,2.65,.054,1.37,0,-.03,-.105,.006),Ct(n,h,2.44,.116,.035,0,-.113,.528);for(const j of[-1.196,1.196])for(const De of[-.65,.49])Ct(n,h,.071,.83,.071,j,-.46,De);const d=wt(n,new ut(4.4,3.9),yt("#514438",.91,0),0,-.876,.75,!1);d.rotation.x=-Math.PI/2,d.receiveShadow=!0;const p=yt("#252423",.52,.15),v=yt("#81776b",.97,0),g=wt(n,new ut(4.2,3.6),v,0,.92,-.92,!1);g.receiveShadow=!0;for(const j of[-1,1]){const De=wt(n,new ut(3.6,3.6),v,j*1.8,.92,.88,!1);De.rotation.y=-j*Math.PI/2,De.receiveShadow=!0}const m=yt("#4f3623",.82,0);Ct(n,m,.41,1.6,.037,-.76,.62,-.867);for(let j=0;j<7;j++)Ct(n,yt(j%2?"#61412a":"#503423",.84,0),.022,1.56,.015,-.94+j*.055,.61,-.84);m1(n,m);const x=d1(n,p),y=x.material,S=p1(n,.69,-.174),E=new tt;E.position.set(-.89,.043,.021),E.rotation.y=.25,E.scale.setScalar(2.5),n.add(E);const{monitor:b,picture:_}=Qd(E,o("window-desk/room.png"),p,.34,.22,0,.112,-.083,0);b.rotation.x=-.16,_.material.color.set("#799f9c"),Ct(E,yt("#3c3b3a",.43,.42),.343,.014,.231,0,-.01,.022,.006),Ct(E,p,.29,.002,.094,0,-.002,.02,.001);const M=yt("#51504e",.61,.07);for(let j=0;j<4;j++)for(let De=0;De<13;De++)Ct(E,M,.017,.0019,.015,(De-6)*.021,2e-4,.056-j*.021,7e-4);Ct(E,yt("#575552",.61,.17),.122,.001,.054,0,-.0023,.094,4e-4);const R=f1(n,s),w=new ii("#d9e8ff",.034,.43,2);w.position.copy(R.localToWorld(new L(0,-.08,.075))),n.add(w);const C=new tt;C.position.set(.544,.011,.123),C.rotation.y=-.28,n.add(C);const N=yt("#292d2b",.87,.02);Ct(C,N,.177,.004,.231,0,-.007,0),Ct(C,yt("#b8ab95",.96,0),.171,.013,.224,.001,.001,0),Ct(C,N,.177,.004,.231,0,.009,0),Ct(C,yt("#534a3a",.89,0),.005,.003,.231,.053,.0115,0);const F=wt(C,new Js(.0034,.117,5,16),yt("#424d4a",.28,.5),-.04,.016,.008);F.rotation.x=Math.PI/2,F.rotation.z=-.12,g1(n);const I=new li("#e4eeff","#775b45",1.45);n.add(I);const B=new Wt("#fff1d6",1.58);B.position.set(-.91,1.49,.66),B.target.position.set(.07,.1,-.19),B.castShadow=!0,B.shadow.mapSize.set(2048,2048),Object.assign(B.shadow.camera,{left:-1.25,right:1.25,top:1,bottom:-1,near:.06,far:3}),B.shadow.bias=-12e-5,B.shadow.normalBias=.0018,B.shadow.radius=3,n.add(B,B.target);const H=new Wt("#c4d3ea",.36);H.position.set(.7,.57,-.27),n.add(H);const k=new Ht(40,1,.035,8),Q=new L(-.225,.535,1);k.position.copy(Q),k.lookAt(.02,.252,-.15);const G=k.quaternion.clone(),Z=new L,V=new qn(0,0,0,"YXZ"),ue=new En,Re=new En,D=new L,K=new L,ne=new Ht(45,1,.05,8),fe=_.material.color.clone(),ce=I.color.clone(),pe=new Oe("#ffe6ca"),He=window.matchMedia("(prefers-reduced-motion: reduce)");let se="auto",ge=null,Ue=0,Y=null,le,ae,ve=!1;return{setDisplayScene(j){return Y===j?!1:(Y=j,Y&&!le&&(le=new Nn(960,540,{colorSpace:xn,type:Un}),ae=new it({map:le.texture})),x.material=Y?ae:y,ve=!!Y,!0)},setLighting(j){se=j},update(j,De){const Ne=Y?Y.update(De):i.update(j,De);Y&&Ne&&(ve=!0);const $=j.getHours(),Ce=Y||se==="night"||se==="auto"&&($>=19||$<6)?1:0,U=Math.min(De-Ue,100);Ue=De;const Ke=ge===null||He.matches||Math.abs(Ce-ge)<.002?Ce:kt.lerp(ge,Ce,1-Math.exp(-U/185));return Ke===ge?Ne:(ge=Ke,S(Ke),I.color.copy(ce).lerp(pe,Ke),I.intensity=kt.lerp(1.45,.96,Ke),B.intensity=kt.lerp(1.58,.28,Ke),H.intensity=kt.lerp(.36,.24,Ke),w.intensity=kt.lerp(.034,.059,Ke),_.material.color.copy(fe).multiplyScalar(1-Ke*.62),!0)},setLook(j,De){V.set(De,j,0)},render(j,De,Ne){const $=De.x*.49,_e=De.y*.47,Ce=(De.z-e)*.49;k.position.copy(Q).add(Z.set($,_e,Ce).applyQuaternion(G)),ue.setFromEuler(V),k.quaternion.copy(G).multiply(ue),D.set($,_e,Ce).applyQuaternion(Re.copy(ue).invert()),ro(k,D.x,D.y,u1+D.z,bf*Ne,bf),R.worldToLocal(K.copy(k.position)),K.z-=Hn.z,K.divideScalar(Hn.width),K.z=Math.max(.45,K.z),ne.position.copy(K),ro(ne,K.x,K.y,K.z,.5,9/32);const U=j.getRenderTarget(),Ke=j.shadowMap.needsUpdate;try{Y?(j.shadowMap.needsUpdate=!1,ve&&(j.setRenderTarget(le),j.render(Y.scene,Y.overview),ve=!1),Y.aimDetail(K),j.setRenderTarget(s),j.render(Y.scene,Y.detailCamera)):(j.shadowMap.needsUpdate=Ke||i.shadowsChanged,j.setRenderTarget(s),j.render(i.scene,ne))}finally{j.setRenderTarget(U)}j.shadowMap.needsUpdate=Ke,j.render(n,k)}}}const zs=new L(0,1,0),bl=.385,Tf=.363,xi=i=>new Lt({color:i,roughness:.83});function zt(i,e,t,n,s,r){const o=new mt(e,t);return o.position.set(n,s,r),i.add(o),o}function Ef(i,{coat:e,scarf:t,hat:n,carriesBag:s=!1}){const r=new tt;i.add(r);const o=xi(e),a=xi(t),c=xi("#364347"),l=xi("#242e32"),u=xi("#c89673"),f=xi("#353030"),h=(b,_,M,R=.035)=>new ci(b,_,M,3,R);zt(r,h(.348,.485,.24,.077),o,0,.952,0),zt(r,h(.31,.09,.223),o,0,.726,0),zt(r,h(.015,.324,.011,.004),a,.013,.944,.122),zt(r,new dt(.062,.065,.102,16),u,0,1.218,.007),zt(r,new dt(.096,.103,.057,22),a,0,1.206,.006),zt(r,h(.063,.171,.025,.009),a,-.052,1.119,.118),zt(r,new Qt(.109,24,16),u,0,1.358,.012).scale.set(.88,1.09,.88),zt(r,new Qt(.026,14,9),u,.004,1.355,.102).scale.set(.65,.7,1),zt(r,new Qt(.11,24,14,0,Math.PI*2,0,Math.PI*.53),n?xi(n):f,0,1.414,.01).scale.set(.92,.67,.96),zt(r,new Qt(.07,20,10),f,0,1.369,-.036).scale.set(1.15,.99,.82);const d=xi("#3c302d");for(const b of[-.037,.037])zt(r,new Qt(.007,10,8),d,b,1.373,.101);const p=[-1,1].map(b=>{const _=new tt;_.position.set(b*.174,1.117,.001),r.add(_),zt(_,new Js(.053,.152,6,14),o,0,-.105,0);const M=new tt;if(M.position.y=-.215,_.add(M),zt(M,new Js(.044,.129,6,14),o,0,-.091,0),zt(M,new Qt(.043,14,11),u,0,-.204,0),s&&b===1){const R=xi("#835d3d");zt(M,h(.2,.229,.115,.02),R,0,-.381,.012);const w=zt(M,new gn(.047,.008,8,22),l,0,-.256,.012);w.scale.y=.63;for(const C of[-.061,.061])zt(M,h(.017,.211,.004,.001),l,C,-.379,.07)}return{shoulder:_,elbow:M,side:b}}),v=[-1,1].map(b=>({hip:new L(b*.094,.778,0),upper:zt(r,new dt(.064,.073,1,15),c,0,0,0),lower:zt(r,new dt(.042,.059,1,15),c,0,0,0),foot:zt(r,h(.11,.076,.216,.028),l,0,0,0)})),g=new L,m=new L,x=new L,y=new L,S=new L;function E(b,_,M){S.subVectors(M,_),b.position.copy(_).lerp(M,.5),b.scale.y=S.length()+.027,b.quaternion.setFromUnitVectors(zs,S.normalize())}return{root:r,pose(b,_,M=0,R=0,w=0){r.position.copy(b[0]).lerp(b[1],.5),r.rotation.y=_;const C=Math.hypot(b[1].x-b[0].x,b[1].z-b[0].z),N=.778-kt.clamp((C-.23)*.26,0,.16);for(let F=0;F<v.length;F++){const I=v[F];I.hip.y=N,g.copy(b[F]).sub(r.position).applyAxisAngle(zs,-_),I.foot.position.copy(g),I.foot.position.y+=.039,I.foot.position.z+=.042,g.y+=.069,x.subVectors(g,I.hip);const B=Math.min(x.length(),bl+Tf-.001);x.normalize(),y.set(0,0,1).addScaledVector(x,-x.z).normalize();const H=(bl**2-Tf**2+B**2)/(2*B);m.copy(I.hip).addScaledVector(x,H).addScaledVector(y,Math.sqrt(Math.max(0,bl**2-H**2))),E(I.upper,I.hip,m),E(I.lower,m,g)}for(const F of p){const I=F.side===1?R:0;F.shoulder.rotation.set(M*F.side*(s&&F.side===1?.38:1),0,F.side*.095+I*1.74),F.elbow.rotation.x=-.11-I*.13,F.elbow.rotation.z=I*(.56+w*.24)}}}}const Ns=5.12,yr=-1.29,x1=12,wf=.44;function v1(i,e,t,n){const s=Ef(i,{coat:"#4c5f55",scarf:"#c9935e",carriesBag:!0}),r=Ef(i,{coat:"#975d48",scarf:"#e1bd8d",hat:"#c9ad88"}),o=[new L(e-.1,.49,t),new L(e+.1,.49,t)],a=[[0,.16,.79,e-.1,.42,.19],[1,.79,1.34,e+.09,.77,.17],[0,1.34,1.8,1.2,1.08,.1],[1,1.8,2.25,.95,1.4,.1],[0,2.25,2.7,.56,1.69,.09],[1,2.7,3.14,.32,1.88,.09],[0,3.14,3.53,-.02,2.03,.08],[1,3.53,3.91,.15,2.16,.07]].map(([S,E,b,_,M,R])=>({side:S,from:E,to:b,point:new L(_,n,M),lift:R})),c=[new L,new L],l=new L(-.94,n,2.34),u=[new L,new L],f=[a.at(-2).point,a.at(-1).point],h=new L(0,0,1).applyAxisAngle(zs,yr),d=new L(1,0,0).applyAxisAngle(zs,yr),p=x(f[0].clone().lerp(f[1],.5),Ns+.34),v=x(l,Ns),g=[new L,new L];function m(S,E,b){S[0].set(-.103,0,.024).applyAxisAngle(zs,b).add(E),S[1].set(.103,0,-.024).applyAxisAngle(zs,b).add(E)}function x(S,E){return Array.from({length:x1},(b,_)=>{const M=_%2;return{side:M,from:E+_*wf,to:E+(_+1)*wf,point:S.clone().addScaledVector(h,.34+_*.455).addScaledVector(d,M===0?-.103:.103),lift:.082}})}function y(S,E,b,_){S[0].copy(E[0]),S[1].copy(E[1]);let M=0;for(const{side:R,from:w,to:C,point:N,lift:F}of b){if(_<w)break;const I=kt.clamp((_-w)/(C-w),0,1);S[R].lerp(N,kt.smoothstep(I,0,1));const B=Math.sin(I*Math.PI);S[R].y+=B*F,M=(R===0?1:-1)*B*.3}return M}return S=>{const E=kt.smoothstep,b=E(S,2.16,2.5)*(1-E(S,3.42,3.83)),_=kt.lerp(2.42,1.79,E(S,1.07,3.38)),M=kt.lerp(_,yr,E(S,4.56,Ns));if(S<Ns?(m(u,l,M),r.pose(u,M,0,b,Math.sin((S-2.5)*12.3))):(m(g,l,yr),r.pose(u,yr,y(u,g,v,S))),s.root.visible=S>=-.28,!s.root.visible)return;const R=-.89*E(S,1.16,2.42)-.28*E(S,3.48,4.15)-.12*E(S,4.75,Ns+.34),w=S>=Ns,C=y(c,w?f:o,w?p:a,S);s.pose(c,R,C)}}const rs=-1.05,jd=.37,Vr=9,xa=5.1,Ac=7,ep=-77.4,tp=Vr+xa,Rc=tp+1.55,na=Rc+6.2,Cc=na+1.55,S1=Cc+6.7,Lr=-1.91,M1=ep+Ac*(Vr+xa/2),y1=new L(0,1,0),Pt=(i,e=.81,t=0)=>new Lt({color:i,roughness:e,metalness:t}),os=i=>new it({color:i});function Wi(i,e,t,n=0,s=0,r=0){const o=new mt(e,t);return o.position.set(n,s,r),i.add(o),o}function ke(i,e,t,n,s,r,o,a,c=0){const l=c?new ci(t,n,s,3,c):new en(t,n,s);return Wi(i,l,e,r,o,a)}function as(i,e,t,n,s){const r=new tu(e,t,n),o=new At;for(let a=0;a<n;a++)s(o,a),o.updateMatrix(),r.setMatrixAt(a,o.matrix);return i.add(r),r}function Ws(i,e,t){const n=document.createElement("canvas");n.width=i,n.height=e;const s=n.getContext("2d"),r=new oi(n);r.colorSpace=xt,r.anisotropy=4;function o(...a){t(s,i,e,...a),r.needsUpdate=!0}return{texture:r,redraw:o}}function ia(i,e,t,n,s,r,o){return Wi(i,new ut(t,n),new it({map:e}),s,r,o)}function b1(){const i=Ws(640,180,(n,s,r)=>{n.fillStyle="#193037",n.fillRect(0,0,s,r),n.strokeStyle="#889d9a",n.lineWidth=4,n.strokeRect(7,7,s-14,r-14),n.fillStyle="#e7e4cd",n.font='600 83px "Microsoft YaHei", sans-serif',n.textAlign="center",n.fillText("雾港站",291,99),n.font="500 29px Arial",n.fillText("W U G A N G",291,143),n.fillStyle="#b59454",n.fillRect(501,44,91,91),n.fillStyle="#172830",n.font="700 52px Arial",n.fillText("1",546,107)});i.redraw();const e=Ws(512,96,(n,s,r,o)=>{n.fillStyle="#151b20",n.fillRect(0,0,s,r),n.font='600 46px "Microsoft YaHei", sans-serif',n.fillStyle="#ffc16e",n.textAlign="center",n.fillText(o,s/2,65)}),t=Ws(384,112,(n,s,r)=>{n.fillStyle="#294a43",n.fillRect(0,0,s,r),n.strokeStyle="#96b0a0",n.lineWidth=3,n.strokeRect(5,5,s-10,r-10),n.fillStyle="#e2e4cb",n.textAlign="center",n.font='600 46px "Microsoft YaHei", sans-serif',n.fillText("←  出口",s/2,63),n.font="500 21px Arial",n.fillText("EXIT",s/2+39,89)});return t.redraw(),{name:i.texture,arrival:e,exit:t.texture}}function T1(i){const e=new Qt(165,40,24),t=e.attributes.position,n=new Float32Array(t.count*3),s=new Oe("#4b5966"),r=new Oe("#1d314c"),o=new Oe;for(let a=0;a<t.count;a++){const c=t.getY(a)/165;o.copy(s).lerp(r,kt.smoothstep(c,-.02,.56)),o.toArray(n,a*3)}e.setAttribute("color",new bn(n,3)),Wi(i,e,new it({side:ln,vertexColors:!0,fog:!1}),-38,0,0)}function E1(i){const e=Pt("#4b4b48"),t=Pt("#493f3a"),n=Pt("#888e91",.39,.64),s=Wi(i,new ut(275,102),Pt("#2f3f43"),-39,-.11,-20);s.rotation.x=-Math.PI/2,ke(i,e,160,.085,2.5,-43,-.042,rs),ke(i,Pt("#425054"),83,.02,1,-57,-.047,2.88),as(i,new en(.17,.082,1.96),t,267,(h,d)=>{h.position.set(-122+d*.59,.006,rs)});for(const h of[-.54,.54])ke(i,n,160,.067,.061,-43,.073,rs+h),ke(i,e,160,.031,.115,-43,.042,rs+h);as(i,new ou(.053,0),Pt("#62635e"),740,(h,d)=>{const p=Math.sin(d*78.233)*43758.5453%1,v=Math.sin(d*31.271)*13546.862%1;h.position.set(-111+d*.188+p*.2,.012,rs+v*1.22),h.scale.set(1+Math.abs(v),.38+Math.abs(p)*.45,.68+Math.abs(p)),h.rotation.y=d*.53});const r=Pt("#4b5a5c",.87,.08);as(i,new en(.07,.54,.07),r,44,(h,d)=>{h.position.set(-87+d*1.65,.24,3.43)}),ke(i,r,71,.028,.032,-51.5,.44,3.43),ke(i,r,71,.026,.026,-51.5,.24,3.43);const o=Pt("#20393b"),a=Pt("#263b45"),c=(h,d,p)=>{as(i,new Aa(1,1,10),h,d*3,(v,g)=>{const m=Math.floor(g/3),x=g%3,y=2.2+(Math.sin(m*1.8)+1)*2,S=p+Math.cos(m*2.45)*3.6;v.position.set(-97+m*2.75,y*(.3+x*.24),S);const E=y*(.23-x*.048);v.scale.set(E,y*.55,E),v.rotation.y=m*.61})};c(a,43,-18),c(o,39,-11);const l=new Qt(1,32,18);for(const[h,d,p,v]of[[-72,11,-30,36],[-34,8,-26,25],[-9,10,-33,26],[19,8,-30,25]])Wi(i,l,a,h,-2,p).scale.set(v,d,11);const u=Pt("#344349"),f=os("#ffad58");for(const h of[-62,-38,-21])ke(i,u,.1,1.83,.1,h,.91,-2.34),ke(i,u,.25,.42,.18,h,1.86,-2.34,.035),Wi(i,new Qt(.061,12,8),f,h,1.9,-2.23),ke(i,u,.27,.13,.29,h,.065,-2.34)}function w1(i,e){const t=Pt("#87897f"),n=Pt("#a7a497"),s=Pt("#c6ab71"),r=Pt("#38515a",.57,.17),o=Pt("#80634f"),a=Pt("#c8994d"),c=os("#ffe0a2"),l=jd;ke(i,t,28,l,5.6,1.4,l/2-.02,3.1,.055),as(i,new en(.963,.023,.716),n,196,(d,p)=>{d.position.set(-12.12+p%28,l-.017,.72+Math.floor(p/28)*.737)}),ke(i,s,28,.025,.34,1.4,l-.015,.493),as(i,new dt(.025,.027,.008,8),a,558,(d,p)=>{d.position.set(-12.42+p%186*.15,l+.001,.385+Math.floor(p/186)*.104)}),as(i,new en(.47,.012,.055),a,42,(d,p)=>{d.position.set(-12.2+p*.66,l-.001,.795)});const u=Pt("#394449");for(const d of[-8.1,-3.8,4.5,8.8,13.1])if(ke(i,r,.115,3.1-l,.12,d,(3.1+l)/2,1.05,.012),ke(i,t,.24,.11,.23,d,l+.05,1.05,.012),ke(i,r,.117,.095,.89,d,3.1,1.46),ke(i,c,.59,.029,.11,d,3.1-.062,1.5,.011),d===-3.8||d===4.5){const v=new ii("#ffcf8e",8.2,10,2);v.position.set(d,2.9,1.65),i.add(v)}ke(i,u,21.7,.12,2.18,2.5,3.24,1.56,.025),ke(i,r,21.8,.17,.1,2.5,3.18,2.61,.014),ke(i,s,21.7,.027,.026,2.5,3.105,2.67),ke(i,r,2.45,.69,.11,-1.65,2.65,1.09,.022),ia(i,e.name,2.33,.6,-1.65,2.65,1.151),ke(i,u,2.02,.4,.085,2.88,2.72,1.08,.018),ia(i,e.arrival.texture,1.9,.345,2.88,2.72,1.126);for(const d of[-5.4,4.25]){ke(i,o,1.66,.075,.43,d,.8,2.87,.033),ke(i,o,1.66,.19,.06,d,1.1,2.67,.018);for(const p of[-.61,.61])ke(i,r,.069,.45,.29,d+p,.57,2.87),ke(i,r,.06,.37,.074,d+p,.92,2.66)}ke(i,u,.35,.61,.35,-6.62,.67,3,.038),ke(i,r,.065,1.67,.071,-1.97,1.2,2.12,.012),ke(i,r,.92,.28,.059,-1.97,2.01,2.12,.018),ia(i,e.exit,.86,.235,-1.97,2.01,2.153);const f=Pt("#657571"),h=Pt("#6e5244");ke(i,h,9.2,2.68,1.9,1.2,1.27,-4.47,.055),ke(i,f,9.62,.16,2.34,1.2,2.68,-4.44,.039);for(const d of[-2,-.45,1.11,2.68,4.24])ke(i,r,1.12,1.21,.066,d,1.43,-3.49,.028),ke(i,c,1,1.11,.027,d,1.43,-3.451,.018),ke(i,r,.04,1.14,.034,d,1.43,-3.43),ke(i,r,1.01,.041,.035,d,1.54,-3.43)}function A1(i){const e=new tt;i.add(e);const t=Pt("#d0d2c6",.48,.11),n=Pt("#397a7b",.45,.16),s=Pt("#263940",.7,.18),r=Pt("#9aa7a5",.51,.24),o=os("#e5bd84"),a=Pt("#685949",.86),c=os("#394e54"),l=os("#fff4cc").color.multiplyScalar(2.1),u=new it({color:l}),f=os("#f1bb62"),h=os("#c94f3b"),d=[],p=Ws(128,90,(_,M,R)=>{const w=_.createLinearGradient(0,0,0,R);w.addColorStop(0,"#f4d6a3"),w.addColorStop(.2,"#d2ad76"),w.addColorStop(1,"#8f7961"),_.fillStyle=w,_.fillRect(0,0,M,R),_.fillStyle="#635d56";for(const C of[12,77])_.beginPath(),_.roundRect(C,51,33,40,5),_.fill();_.fillStyle="#fff0c835",_.fillRect(0,11,M,6)});p.redraw();const v=new it({map:p.texture}),g=new ut(.8,.63);function m(_,M,R){ke(_,s,1.02,.07,.065,M,2.055,R,.013);for(const C of[-1,1])ke(_,s,.068,1.59,.062,M+C*.481,1.25,R,.013);const w=new tt;w.position.set(M,0,.525),w.visible=!1,_.add(w),ke(w,a,.86,1.55,.017,0,1.24,0,.024),ke(w,c,.53,.83,.014,0,1.31,.012,.02),ke(w,o,.56,.07,.018,0,1.943,.014),ke(w,r,.89,.045,.292,0,.47,.138,.012),ke(w,f,.8,.014,.021,0,.495,.248);for(const C of[-1,1])ke(w,r,.024,.89,.026,C*.36,1.24,.019,.008);for(const C of[-1,1]){const N=new tt;N.position.set(M+C*.237,1.23,R+.052),_.add(N),ke(N,r,.464,1.62,.058,0,0,0,.025),ke(N,c,.238,.6,.012,0,.31,.032,.027),ke(N,n,.463,.24,.011,0,-.42,.033),d.push({leaf:N,side:C,restX:N.position.x,vestibule:w})}}function x(_,M){const R=new tt;R.position.set(_,0,rs),e.add(R),ke(R,t,8.25,2.04,1.24,-4.13,1.46,-.11,.19),ke(R,n,8.1,.24,.044,-4.15,.815,-.724,.018),ke(R,t,8.25,.39,.241,-4.13,2.285,.61,.061);for(const[w,C]of[[-8.255,-6.88],[-5.84,Lr-.52],[Lr+.52,-.005]]){const N=(w+C)/2;ke(R,t,C-w,1.76,.241,N,1.32,.61,.038),ke(R,n,C-w-.017,.24,.041,N,.815,.717,.019)}ke(R,s,8.05,.15,1.31,-4.18,.405,0,.055),ke(R,r,2.09,.115,.89,-4.23,2.53,0,.047);for(const w of[-1.79,-6.7])for(const C of[-1,1]){const N=Wi(R,new dt(.24,.24,.1,22),s,w,.277,C*.55);N.rotation.x=Math.PI/2}for(const w of[-1,1]){for(const C of[-.77,-3,-4.12,-5.23,-7.46]){ke(R,s,.92,.74,.037,C,1.66,w*.726,.065);const N=Wi(R,g,v,C,1.66,w*.758);w===-1&&(N.rotation.y=Math.PI),ke(R,s,.046,.65,.02,C+.2,1.66,w*.766),ke(R,r,.86,.028,.02,C,1.355,w*.766)}if(w===1)m(R,Lr,.725),m(R,-6.36,.725);else for(const C of[Lr,-6.36])ke(R,r,.96,1.62,.044,C,1.23,-.737,.032),ke(R,c,.61,.62,.014,C,1.54,-.763,.028)}if(M){ke(R,n,.12,1.73,1.22,.006,1.36,0,.053),ke(R,s,.053,.84,1.22,.083,1.78,0,.024);for(const w of[-.31,.31])ke(R,c,.033,.62,.525,.116,1.83,w,.015),ke(R,u,.029,.12,.17,.104,1.02,w*1.48,.012);ke(R,f,.03,.11,.44,.12,2.204,0,.013),ke(R,s,.09,.133,.49,.077,.56,0,.015)}else for(const w of[-.43,.43])ke(R,h,.037,.095,.13,-8.26,.95,w,.012);return R}const y=x(0,!0);x(-8.42,!1);const S=Ws(256,80,(_,M,R)=>{_.fillStyle="#19343a",_.fillRect(0,0,M,R),_.fillStyle="#f5d698",_.font='700 45px "Microsoft YaHei", sans-serif',_.textAlign="center",_.fillText("01  雾港",M/2,55)});S.redraw(),ia(y,S.texture,.84,.23,-.78,1.15,.778);const E=Ws(96,96,(_,M,R)=>{const w=_.createRadialGradient(M/2,R/2,0,M/2,R/2,M/2);w.addColorStop(0,"#ffe2aebb"),w.addColorStop(.2,"#ffcf8970"),w.addColorStop(1,"#ffcb6a00"),_.fillStyle=w,_.fillRect(0,0,M,R)});E.redraw();for(const _ of[-.46,.46]){const M=new I0(new hd({map:E.texture,blending:Il,depthWrite:!1}));M.position.set(.136,1.02,_),M.scale.set(.66,.66,1),y.add(M)}const b=new fu("#ffe2ac",51,26,.4,.77,2);return b.position.set(.28,.95,0),b.target.position.set(16,.2,0),y.add(b,b.target),{train:e,setDoors(_){for(const{leaf:M,side:R,restX:w,vestibule:C}of d)M.position.x=w+R*_*.41,C.visible=_>.002}}}function R1(){const i=new Kn;i.background=new Oe("#273c50"),i.fog=new wa("#273c50",.012),T1(i),i.add(new li("#a9c6e7","#655c52",1.51));const e=new Wt("#a7cbff",1.17);e.position.set(5,8,13),i.add(e);const t=new Wt("#ffdda7",.52);t.position.set(-4,4,-6),i.add(t);const n=b1();E1(i),w1(i,n);const s=A1(i),r=v1(i,M1+Lr,rs+.646,jd),o=new Ht(42,16/9,.1,235);o.position.set(11,9.2,22),o.lookAt(-19,1,-.7);const a=new Ht(45,16/9,.1,240),c=new L(1.7,2.16,2.6),l=7.6,u=new En().setFromAxisAngle(y1,.35).multiply(new En().setFromEuler(new qn(-.13,0,0)));a.quaternion.copy(u);let f=null,h=null,d;return{scene:i,overview:o,detailCamera:a,replay(){f=null,h=null},update(p){f??(f=p);const v=Math.min(S1,(p-f)/1e3);if(v===h)return!1;h=v;const g=Math.max(0,v-Vr),m=Math.min(xa,g),x=Math.max(0,v-Cc),y=Math.min(x,4),S=Ac*(y*y/8+x-y);s.train.position.x=ep+Ac*(Math.min(v,Vr)+m-m*m/(2*xa))+S;const E=kt.smoothstep(v,tp+.54,Rc)*(1-kt.smoothstep(v,na,na+1));s.setDoors(E),r(v-Rc);let b="01   请在黄线内候车";return v>=Cc+5.1?b="01   列车已离站":v>=na?b="01   列车即将发车":E>.55?b="01   已到站":v>=Vr-.6&&(b="01   列车进站"),b!==d&&(d=b,n.arrival.redraw(b)),!0},aimDetail(p){a.position.copy(p).multiplyScalar(l).applyQuaternion(u).add(c),ro(a,p.x,p.y,p.z,.5,9/32)}}}const hn=1.43,br=.88,qo=.335,ss=i=>new Lt({color:i,metalness:.4,roughness:.33}),vi=i=>new Lt({color:i,roughness:.82});function Mn(i,e,t,n=0,s=0,r=0){const o=new mt(e,t);return o.position.set(n,s,r),i.add(o),o}function gt(i,e,t,n,s,r,o,a,c=.028){return Mn(i,new ci(t,n,s,4,c),e,r,o,a)}function fn(i,e,t,n,s,r,o){const a=Mn(i,new dt(t,t,n,64),e,s,r,o);return a.rotation.x=Math.PI/2,a}function Tl(i,e,t,n,s,r,o,a=!1){const c=document.createElement("canvas");c.width=640,c.height=a?640:Math.round(640*t/e),o(c.getContext("2d"),c.width,c.height);const l=new oi(c);l.colorSpace=xt,l.anisotropy=8;const u=a?new Tn(e/2,96):new ut(e,t);return Mn(i,u,new it({map:l}),n,s,r)}function C1(){const i=new Pi;return i.moveTo(-.77,.24),i.lineTo(.77,.24),i.lineTo(.77,1.52),i.bezierCurveTo(.77,2.52,-.77,2.52,-.77,1.52),i.closePath(),i}function El(i,e,t,n,s,r,o){const a=new Pi;for(let c=0;c<n*4;c++){const l=c*Math.PI*2/(n*4),u=t-(c%4===0||c%4===3?.036:0);c===0?a.moveTo(u,0):a.lineTo(u*Math.cos(l),u*Math.sin(l))}a.closePath();for(let c=0;c<5;c++){const l=c*Math.PI*2/5,u=new Zs;u.absarc(t*.53*Math.cos(l),t*.53*Math.sin(l),t*.132,0,Math.PI*2,!0),a.holes.push(u)}return Mn(i,new lo(a,{depth:.032,bevelSize:.005,bevelThickness:.004,bevelSegments:2,curveSegments:10}),e,s,r,o)}function Af(i,e,t,n,s){const r=n.clone().sub(t),o=Mn(i,new dt(s,s,r.length(),20),e);o.position.copy(t).lerp(n,.5),o.quaternion.setFromUnitVectors(new L(0,1,0),r.normalize())}function P1(i,e){const t=new Kn;t.background=new Oe("#223032"),t.fog=new wa("#223032",.055),t.add(new li("#dce4dc","#735140",1.48));const n=new Wt("#ffdbab",1.75);n.position.set(-3,4,-3),n.castShadow=!0,n.shadow.mapSize.set(2048,2048),Object.assign(n.shadow.camera,{left:-3.5,right:3.5,top:3.5,bottom:-3.5,far:14}),n.shadow.normalBias=.024,t.add(n);const s=new Wt("#bcd9ee",1.16);s.position.set(3,3,3),t.add(s);const r=vi("#4f2e21"),o=vi("#77472d"),a=ss("#b7a064"),c=ss("#d8ae59"),l=ss("#8d6739"),u=ss("#728481"),f=vi("#26302c"),h=vi("#364d44"),d=vi("#172c28"),p=new co().load("./outer-desk/wood.jpg",e);p.colorSpace=xt,p.anisotropy=8;const v=new Lt({color:"#e5be99",map:p,roughness:.76}),g=Mn(t,new ut(23,20),vi("#353d36"),0,-.954,0);g.rotation.x=-Math.PI/2,g.receiveShadow=!0,gt(t,v,5.38,.19,3.56,0,-.117,0,.055);for(const $ of[-2.38,2.38])for(const _e of[-1.45,1.45])gt(t,r,.18,.78,.18,$,-.56,_e);for(const $ of[-1.51,1.51])gt(t,r,4.91,.2,.1,0,-.27,$);gt(t,h,3.8,.027,2.6,0,-.013,-.16);for(const $ of[-1.72,1.72])gt(t,ss("#75886a"),.016,.006,2.3,$,.003,-.16,.002);for(const $ of[-1.31,.99])gt(t,ss("#75886a"),3.45,.006,.014,0,.003,$,.002);const m=vi("#334743");for(const $ of[-8.4,8.4]){gt(t,m,22,5.7,.07,0,1.87,$),gt(t,o,22,.055,.16,0,.56,$*.991);for(let _e=-12;_e<=12;_e++)gt(t,h,.016,3.6,.025,_e*.67,2.38,$*.994)}const x=new tt;x.rotation.y=Math.PI,t.add(x);const y=new tt;y.position.set(-.49,-1.41,-3.73),y.scale.setScalar(1.65),x.add(y);const S=gt(y,o,1.22,.88,.08,2.2,2.13,-2.78);Tl(y,1.14,.8,S.position.x,S.position.y,-2.73,($,_e,Ce)=>{$.fillStyle="#bfb391",$.fillRect(0,0,_e,Ce),$.strokeStyle="#54594f",$.lineWidth=2,$.strokeRect(25,25,_e-50,Ce-50),$.fillStyle="#41483e",$.font="24px Georgia, serif",$.fillText("PLATE 01    /    ESCAPEMENT",50,66);for(const[U,Ke,Ye]of[[260,219,101],[407,230,45]]){for(const at of[Ye,Ye*.83,Ye*.15])$.beginPath(),$.arc(U,Ke,at,0,Math.PI*2),$.stroke();$.beginPath(),$.moveTo(U-Ye-21,Ke),$.lineTo(U+Ye+21,Ke),$.moveTo(U,Ke-Ye-21),$.lineTo(U,Ke+Ye+21),$.stroke()}$.fillRect(50,Ce-60,130,2)});const E=gt(y,r,1.59,.081,.53,-2.36,1.65,-2.6,.018);for(const[$,_e]of["#4b625d","#71583c","#9b845f","#58665c","#80644d"].entries()){const Ce=.27+$%3*.066;gt(y,vi(_e),.137,Ce,.306,-2.94+$*.155,E.position.y+.04+Ce/2,-2.54,.009)}gt(y,o,.49,.24,.38,-1.93,1.81,-2.54,.024);const b=new tt;b.position.set(-1.7,.02,-.79),b.rotation.y=.105,x.add(b),gt(b,r,1.09,.93,.51,0,.46,0,.041),gt(b,o,1.15,.052,.55,0,.925,.008,.015);for(const $ of[-.257,.257])for(const _e of[.173,.463,.753])gt(b,v,.471,.247,.055,$,_e,.264,.012),gt(b,l,.132,.046,.042,$,_e,.3,.009),gt(b,c,.084,.017,.021,$,_e,.327,.005);gt(b,u,.365,.048,.29,-.16,.97,.067,.011),gt(b,f,.33,.023,.246,-.16,.997,.067,.008),fn(b,l,.082,.037,-.16,1.015,.084).rotation.x=0;const _=new tt;_.position.set(1.58,0,-.43),x.add(_),Mn(_,new dt(.204,.227,.065,40),f,0,.033,0),Af(_,l,new L(0,.05,0),new L(0,1.08,0),.029),Af(_,l,new L(0,1.08,0),new L(-.36,1.44,.085),.024);const M=new tt;M.position.set(-.36,1.39,.085),M.rotation.z=-.29,_.add(M),Mn(M,new dt(.092,.237,.19,40,1,!0),u,0,-.03,0);const R=new Lt({color:"#e5c698",emissive:"#ffce89",emissiveIntensity:.52});Mn(M,new dt(.207,.207,.012,36),R,0,-.119,0);const w=new ii("#ffd4a0",3.6,4.5,2);w.position.set(-.36,1.19,.085),_.add(w),gt(t,r,1.75,.21,.83,0,.122,0,.051),gt(t,o,1.62,.09,.75,0,.245,0,.026),Mn(t,new lo(C1(),{depth:.19,bevelSize:.036,bevelThickness:.034,bevelSegments:4,curveSegments:28}),r,0,0,-.015);for(const $ of[-.72,.72])gt(x,o,.105,1.37,.335,$,.94,.149,.036);fn(t,c,.676,.052,0,1.51,.205),fn(t,vi("#e9dabb"),.631,.031,0,1.51,.238),Tl(t,1.235,1.235,0,1.51,.258,($,_e)=>{$.fillStyle="#e9dbb9",$.fillRect(0,0,_e,_e),$.strokeStyle="#897554",$.lineWidth=2;for(const Ce of[295,266])$.beginPath(),$.arc(320,320,Ce,0,Math.PI*2),$.stroke();for(let Ce=0;Ce<60;Ce++){const U=Ce*Math.PI/30;$.beginPath(),$.moveTo(320+Math.sin(U)*271,320-Math.cos(U)*271),$.lineTo(320+Math.sin(U)*291,320-Math.cos(U)*291),$.lineWidth=Ce%5===0?3:1,$.stroke()}$.fillStyle="#293c34",$.font="600 42px Georgia",$.textAlign="center",$.textBaseline="middle",["XII","I","II","III","IV","V","VI","VII","VIII","IX","X","XI"].forEach((Ce,U)=>{const Ke=U*Math.PI/6;$.fillText(Ce,320+Math.sin(Ke)*223,320-Math.cos(Ke)*223)}),$.font="18px Georgia",$.fillText("ATELIER   /   01",320,419)},!0);const C=new tt,N=new tt,F=new tt;for(const[$,_e,Ce,U,Ke]of[[C,d,.042,.31,.272],[N,d,.029,.445,.281],[F,l,.01,.495,.29]])$.position.set(0,1.51,Ke),gt($,_e,Ce,U,.009,0,U*.4,0,.004),t.add($);fn(t,c,.032,.019,0,1.51,.297),fn(x,l,.638,.046,0,1.47,.071),fn(x,f,.598,.036,0,1.47,.105),gt(x,u,.183,.705,.048,0,1.18,.171,.017),gt(x,f,.08,.575,.014,0,1.18,.199,.005);for(const $ of[-.465,.421])gt(x,l,.165,.546,.058,$,hn,.176,.019),fn(x,u,.042,.054,$,hn,.258);for(const[$,_e]of[[-.42,1.84],[.42,1.84],[-.43,1.08],[.43,1.08],[0,1.96]])fn(x,a,.037,.025,$,_e,.143),gt(x,f,.041,.008,.004,$,_e,.159,.001);const I=Mn(x,new gn(.095,.008,12,48),c,0,hn,.228),B=Mn(x,new gn(.199,.005,10,64),ss("#e9cb82"),0,hn,.222);fn(x,u,.045,.071,0,hn,.227);const H=El(x,a,.268,26,-.465,hn,qo),k=El(x,a,.222,22,.421,hn,qo),Q=El(x,c,.228,22,0,br,qo);fn(Q,l,.065,.054,0,0,.035),fn(Q,c,.031,.037,0,0,.066);for(const $ of[H,k])fn($,l,.048,.048,0,0,.041);const G=new tt;G.position.set(.32,1.28,.245),x.add(G),gt(G,u,.023,.604,.022,0,-.31,0,.008),fn(G,c,.112,.034,0,-.625,.012),fn(G,l,.09,.014,0,-.625,.034),gt(x,o,.63,.064,.44,.99,.038,.62,.043),gt(x,f,.55,.035,.36,.99,.075,.62,.028);for(const[$,_e]of[[.83,.55],[1.08,.56],[1.18,.72]]){const Ce=fn(x,u,.037,.021,$,.11,_e);Ce.rotation.x=0}const Z=new tt;Z.position.set(-1.03,.057,.52),Z.rotation.y=-.35,x.add(Z);const V=Mn(Z,new dt(.016,.016,.4,16),u,0,0,0);V.rotation.x=Math.PI/2,gt(Z,o,.094,.081,.245,0,0,.265,.041),Tl(x,.79,.16,0,.143,.437,($,_e,Ce)=>{$.fillStyle="#5a4329",$.fillRect(0,0,_e,Ce),$.fillStyle="#e7d1a4",$.textAlign="center",$.font='600 42px "Microsoft YaHei", sans-serif',$.fillText("01   ·   机芯检修",_e/2,Ce*.66)}),t.traverse($=>{!$.isMesh||$.material.isMeshBasicMaterial||($.receiveShadow=!0,$.castShadow=$!==g)});for(const $ of[H,k,Q,G])$.traverse(_e=>{_e.castShadow=!1});const ue=new Ht(42,16/9,.04,36),Re=new L(0,1.17,0),D=Math.PI+.13,K=.24;let ne=D,fe=!1,ce=0,pe=0;x.updateWorldMatrix(!0,!0);const He=new ng,se=new he,ge=new L,Ue=new Si(new L(0,0,1),qo+.055);let Y=null,le=br,ae=null,ve=null,j=!0;function De($,_e){return se.set($,_e),He.setFromCamera(se,ue),He.ray.intersectPlane(Ue,ge)?x.worldToLocal(ge):null}function Ne(){Y=null,le=Q.position.y=br,ae=null,j=!0,i(!1)}return{reset:Ne,flip(){return fe=!fe,fe},setLook($,_e){ce=$,pe=_e},render($,_e,Ce){const U=kt.clamp(-.17+pe,-.56,.055),Ke=_e.x*.48,Ye=_e.y*.48,at=Math.max(4.94,2.78*Ce);ue.rotation.set(U,ne+ce,0,"YXZ"),ue.position.set(Ke,Ye,_e.z).multiplyScalar(at).applyQuaternion(ue.quaternion).add(Re),ro(ue,Ke,Ye,_e.z,.5,.5/Ce),ue.updateMatrixWorld(!0),$.render(t,ue)},install(){ae===null&&(le=hn,j=!0)},grab($,_e){if(fe||ne!==D||ae!==null||le===hn)return!1;const Ce=De($,_e);return!Ce||Math.hypot(Ce.x,Ce.y-Q.position.y)>.258?!1:(Y=Ce.y-Q.position.y,!0)},drag($,_e){if(Y===null)return;const Ce=De($,_e);Ce&&(Q.position.y=le=kt.clamp(Ce.y-Y,br,hn),j=!0)},release($){Y!==null&&(Y=null,le=!$&&Q.position.y>hn-.13?hn:br,j=!0)},update($,_e){const Ce=ve===null?16:Math.min(50,Math.max(0,_e-ve));ve=_e;const U=fe?K:D,Ke=ne!==U;Ke&&(ne=kt.lerp(ne,U,1-Math.exp(-Ce/145)),Math.abs(ne-U)<.006&&(ne=U));const Ye=Math.abs(le-Q.position.y)>.001;Ye&&(Q.position.y=kt.lerp(Q.position.y,le,1-Math.exp(-Ce/72))),Y===null&&le===hn&&hn-Q.position.y<=.004&&ae===null&&(Q.position.y=hn,ae=_e,i(!0));const at=ae===null?0:(_e-ae)/1e3;H.rotation.z=.04+at*1.23,Q.rotation.z=.11-at*1.45,k.rotation.z=.02+at*1.45,N.rotation.z=-.81-at*.094,C.rotation.z=1-at*.094/12,F.rotation.z=-2.21-at*.65,G.rotation.z=Math.sin(at*4.5)*.17,I.visible=B.visible=ae===null;const ye=j||Ke||Ye||ae!==null;return j=!1,ye}}}const bi=1.2,va=.64;function L1(i,e){const t=new JS({antialias:!0});t.setPixelRatio(Math.min(window.devicePixelRatio,1.75)),t.shadowMap.enabled=!0,t.shadowMap.type=Dr,t.shadowMap.autoUpdate=!1,t.shadowMap.needsUpdate=!0,t.toneMapping=kc,t.toneMappingExposure=1.28,i.append(t.domElement);const n=new Ht(45,1,.05,8);let s=.31,r=!0;const o=new L;function a(m,x="人物载入失败，请刷新页面重试。"){const y=i.querySelector(m);return S=>{y.hidden=S==="ready",S==="error"&&(y.textContent=x),g()}}const c=c1(a("#reference-avatar-status","人物模型载入失败，请刷新页面重试。")),l=_1(c,bi,g),u=new Map([["desk",l],["reference",c]]),f={rain:()=>vf(bi,!0),window:()=>vf(bi),daily:GM,visitor:()=>JM(a("#visitor-avatar-status")),studio:()=>BM(t),prototype:I1,"moon-post":ZS};let h=l,d,p,v;new ResizeObserver(()=>{const{clientWidth:m,clientHeight:x}=i;!m||!x||(s=x/(2*m),t.setSize(m,x,!1),r=!0)}).observe(i);function g(){t.shadowMap.needsUpdate=!0,r=!0}return{repairClock(){p==null||p.install()},resetWorkshop(){p==null||p.reset()},grabRepair(m,x){return p==null?void 0:p.grab(m,x)},dragRepair(m,x){p==null||p.drag(m,x)},releaseRepair(m){p==null||p.release(m)},flipWorkshop(){return r=!0,p==null?void 0:p.flip()},replayStation(){d==null||d.replay(),r=!0},setDeskLighting(m){l.setLighting(m)},setDeskLook(m,x){h===p?p.setLook(m,x):l.setLook(m,x),r=!0},setScene(m){var E;m==="station"&&(d??(d=R1())),m==="workshop"&&!p&&(p=P1(e,g),u.set(m,p));const x=m==="station"?d:null,y=l.setDisplayScene(x);if(x){y&&m==="station"&&d.replay(),h=l,g();return}if(!u.has(m)){const b=f[m]();v&&((E=b.setWeather)==null||E.call(b,v)),u.set(m,b)}const S=u.get(m);h===S&&!y||(h=S,g())},async loadSample(){await u.get("studio").loadSample(),g()},async importModel(m){await u.get("studio").importFile(m),g()},resetModel(){u.get("studio").resetSample(),g()},setModelAngle(m){u.get("studio").setAngle(m),g()},setWeather(m){var x;v=m;for(const y of u.values())(x=y.setWeather)==null||x.call(y,m)},draw(m,x){h.update(new Date,x)&&(r=!0);const y=h.viewGain,S=y?{x:m.x*y[0],y:m.y*y[1],z:bi+(m.z-bi)*y[2]}:m;if(!(!r&&Math.hypot(S.x-o.x,S.y-o.y,S.z-o.z)<3e-4)){if(r=!1,o.set(S.x,S.y,S.z),h.render){h.render(t,S,.5/s);return}h.shadowsChanged&&(t.shadowMap.needsUpdate=!0),n.position.set(S.x,S.y,S.z),ro(n,S.x,S.y,S.z,.5,s),t.render(h.scene,n)}}}}function I1(){const i=new Kn;i.background=new Oe("#13282b");const e=(se,ge=.78,Ue=0)=>new Lt({color:se,roughness:ge,metalness:Ue}),t=e("#8cdbbd"),n=e("#376965"),s=e("#183238"),r=e("#31514e"),o=e("#bd8250",.42,.34),a=e("#e9d7b4"),c=e("#965f3e"),l=new it({color:"#ffd997"});function u(se,ge,Ue,Y,le){const ae=new mt(se,ge);return ae.position.set(Ue,Y,le),ae.castShadow=!0,ae.receiveShadow=!0,i.add(ae),ae}function f(se,ge,Ue,Y,le,ae,ve){return u(new en(se,ge,Ue),ve,Y,le,ae)}function h(se,ge,Ue,Y,le,ae,ve){return u(new dt(se,ge,Ue,32),ve,Y,le,ae)}function d(se,ge,Ue,Y,le){return u(new Qt(se,28,18),le,ge,Ue,Y)}function p(se,ge,Ue,Y,le,ae){const ve=u(new ut(se,ge),new it({map:ae,toneMapped:!1}),Ue,Y,le);return ve.castShadow=!1,ve}i.add(new li("#c0e5f8","#493020",2.2));const v=new Wt("#ffdfa6",2.2);v.position.set(-.35,.67,.05),v.target.position.set(0,-.24,-.65),v.castShadow=!0,v.shadow.mapSize.set(1024,1024),Object.assign(v.shadow.camera,{left:-.78,right:.78,top:.78,bottom:-.78,near:.1,far:2.7}),v.shadow.normalBias=.004,i.add(v,v.target);const g=new ii("#ffb86e",.075,1.4);g.position.set(-.35,.14,-.93),i.add(g);const m=.441,x=.232,y=new Pi().moveTo(-.6,-.6).lineTo(.6,-.6).lineTo(.6,.6).lineTo(-.6,.6).closePath();y.holes.push(new Zs().moveTo(-m,-x).lineTo(-m,x).lineTo(m,x).lineTo(m,-x).closePath());const S=new it({color:"#263236",toneMapped:!1});u(new fs(y),S,0,0,0).castShadow=!1;const E=new it({color:"#77938a",toneMapped:!1});for(const se of[-1,1])u(new ut(2*m+.005,.0025),E,0,se*(x+.00125),.001).castShadow=!1,u(new ut(.0025,2*x),E,se*(m+.00125),0,.001).castShadow=!1;f(1.06,.66,.035,0,0,-1.31,n);for(const se of[-1,1]){f(.033,.66,1.34,se*.514,0,-.672,n),f(.018,.66,1.32,se*.497,-.015,-.67,s),f(.009,.009,1.3,se*.485,.229,-.657,o);for(const ge of[-.17,-.48,-.8,-1.12])f(.023,.62,.025,se*.48,-.008,ge,n)}f(1.05,.03,1.33,0,.325,-.667,s),f(1.05,.035,1.33,0,-.326,-.667,r);for(let se=0;se<12;se+=1){const ge=e(se%3===0?"#936144":se%3===1?"#a87752":"#83553e");f(.081,.007,1.321,(se-5.5)*.083,-.305,-.664,ge)}f(1,.024,.025,0,-.285,-1.284,s),f(.7,.007,.025,0,.305,-.71,l),f(.7,.007,.025,0,.305,-1.03,l);const b=.19,_=.058,M=-1.27,R=new it({color:"#0f2034"}),w=new it({color:"#e2e3c9"});u(new Tn(.202,64),R,b,_,M).castShadow=!1,u(new gn(.204,.016,16,64),o,b,_,M+.012),u(new gn(.185,.005,12,56),s,b,_,M+.01);for(let se=0;se<26;se+=1){const ge=se*2.399963,Ue=Math.sqrt((se+1)/27)*.174;u(new Tn(se%5===0?.0027:.0013,8),w,b+Math.cos(ge)*Ue,_+Math.sin(ge)*Ue,M+.002).castShadow=!1}const C=d(.071,b+.014,_+.009,M+.027,e("#dd9568"));C.castShadow=!1;const N=u(new cu(.086,.122,64),new it({color:"#b98e70",side:Gn}),...C.position);N.rotation.set(1.06,.2,-.34),N.castShadow=!1;const F=Rf(420,192);F.ctx.fillStyle="#244743",F.ctx.fillRect(0,0,420,192),F.ctx.strokeStyle="#82aaa1",F.ctx.lineWidth=3,F.ctx.strokeRect(11,11,398,170),F.ctx.fillStyle="#e9dbb3",F.ctx.font="bold 68px Consolas, monospace",F.ctx.fillText("RELAY",36,91),F.ctx.fillStyle="#9dbfb0",F.ctx.font="25px Consolas, monospace",F.ctx.fillText("OBSERVATORY / 01",38,143),f(.304,.144,.018,-.25,.142,-1.279,o),p(.29,.132,-.25,.142,-1.268,F.texture),f(.27,.018,.12,-.245,-.108,-1.231,c);for(let se=0;se<6;se+=1){const ge=.065+se%3*.016;f(.022,ge,.05,-.33+se*.026,-.098+ge/2,-1.227,[a,o,t][se%3])}h(.004,.004,.135,-.35,.254,-.93,o),h(.021,.077,.058,-.35,.164,-.93,o),h(.068,.068,.004,-.35,.134,-.93,l);const I=-.085,B=-.59;f(.48,.032,.27,I,-.162,B,c);for(const se of[I-.205,I+.205])for(const ge of[B-.095,B+.095])f(.027,.13,.027,se,-.24,ge,s);const H=-.078;f(.302,.132,.075,H,-.077,-.558,o),f(.286,.115,.078,H,-.075,-.553,s);const k=Rf(640,240);p(.277,.104,H,-.075,-.513,k.texture),f(.25,.012,.085,H,-.142,-.553,s);const Q=-.228,G=.177,Z=.113,V=new L(-.366,.3,-.36),ue=new L(-.326,.147,-.105),Re=new L(Q-.033,G,Z-.049),D=new L(Q-.034,G+.046,Z),K=new L(Q-.056,G+.077,Z);function ne(se,ge,Ue,Y){const le=se.clone().lerp(ge,.5),ae=ge.clone().sub(se);h(Ue,Ue,ae.length(),...le,Y).quaternion.setFromUnitVectors(new L(0,1,0),ae.normalize())}f(.106,.022,.112,V.x,V.y,V.z,o),ne(V,ue,.016,o),d(.029,...ue,s),ne(ue,Re,.021,o),d(.032,...Re,s),d(.073,Q,G,Z,a).scale.set(1.12,.94,.82),u(new gn(.052,.008,14,44),o,Q,G-.006,Z+.044),d(.048,Q,G-.006,Z+.046,s).scale.z=.42,u(new gn(.022,.0045,12,36),new it({color:"#a5f4d5"}),Q,G-.006,Z+.067),d(.008,Q-.006,G-.001,Z+.071,t),ne(D,K,.005,o),d(.011,...K,l);const fe=new Wt("#b5ebed",.85);fe.position.set(.25,.4,.8),i.add(fe);const ce=.31,pe=-.29;h(.066,.046,.079,ce,-.263,pe,e("#c17b59")),h(.059,.059,.003,ce,-.221,pe,s);for(let se=0;se<9;se+=1){const ge=se*2.4,Ue=.028+se%4*.012,Y=.055+se%5*.023,le=new L(ce+Math.cos(ge)*Ue,-.216+Y,pe+Math.sin(ge)*Ue),ae=new L(ce,-.22,pe);h(.0025,.0035,le.distanceTo(ae),...ae.clone().lerp(le,.5),t).quaternion.setFromUnitVectors(new L(0,1,0),le.clone().sub(ae).normalize());const j=d(.025,...le,se%2?t:e("#437958"));j.scale.set(.7,1.55,.29),j.rotation.set(Math.sin(ge)*.6,-ge,-Math.cos(ge)*.7)}let He="";return{scene:i,update(se){const ge=[se.getHours(),se.getMinutes()].map(Ue=>String(Ue).padStart(2,"0")).join(":");return He===ge?!1:(N1(k.ctx,ge),k.texture.needsUpdate=!0,He=ge,!0)}}}function Rf(i,e){const t=document.createElement("canvas");t.width=i,t.height=e;const n=new oi(t);return n.colorSpace=xt,{ctx:t.getContext("2d"),texture:n}}function N1(i,e){i.fillStyle="#1b2426",i.fillRect(0,0,640,240),i.font="bold 148px Consolas, monospace",i.textAlign="center";const t=[17,164,345,492];for(const[n,s]of[...e.replace(":","")].entries()){const r=t[n];i.fillStyle="#303a3a",i.fillRect(r,14,129,173),i.fillStyle="#fff1cc",i.fillText(s,r+64.5,151),i.fillStyle="#1b2426",i.fillRect(r,95,129,2)}i.fillStyle="#e4b27e",i.fillRect(313,70,13,13),i.fillRect(313,112,13,13),i.fillStyle="#a8c9bc",i.font="22px Consolas, monospace",i.fillText("L O C A L   T I M E",320,221)}const D1={name:"北京",latitude:39.9042,longitude:116.4074},np="spatial-desk-weather-city";function U1(i){const e=document.querySelector("#weather-search"),t=document.querySelector("#weather-query"),n=document.querySelector("#weather-matches"),s=document.querySelector("#weather-search-status"),r=document.querySelector("#weather-status");let o=O1(),a=[],c=0,l=0,u;function f(p){i(p),r.textContent=p.temperature==null?`${p.city} · ${p.label}`:[p.city,`${p.temperature}°`,p.label,p.humidity==null?"":`室外湿度 ${p.humidity}%`,p.stale?"上次更新":""].filter(Boolean).join(" · ")}async function h(){var y,S,E;const p=++l,{name:v,latitude:g,longitude:m}=o;u||f({city:v,label:"正在获取天气"});const x=new URLSearchParams({latitude:g,longitude:m,timezone:"auto",forecast_days:"1",current:"temperature_2m,weather_code,relative_humidity_2m",daily:"temperature_2m_max,temperature_2m_min,precipitation_probability_max"});try{const{current:b,daily:_}=await Cf("https://api.open-meteo.com/v1/forecast?"+x);if(p!==l)return;if(!Number.isFinite(b==null?void 0:b.temperature_2m))throw new Error("Missing temperature");u={city:v,label:F1(b.weather_code),temperature:Tr(b.temperature_2m),humidity:Tr(b.relative_humidity_2m),low:Tr((y=_==null?void 0:_.temperature_2m_min)==null?void 0:y[0]),high:Tr((S=_==null?void 0:_.temperature_2m_max)==null?void 0:S[0]),rain:Tr((E=_==null?void 0:_.precipitation_probability_max)==null?void 0:E[0])},f(u)}catch{if(p!==l)return;f(u?{...u,stale:!0}:{city:v,label:"暂时无法更新"})}}function d(p){o={name:p.name,latitude:p.latitude,longitude:p.longitude};try{localStorage.setItem(np,JSON.stringify(o))}catch{}n.hidden=!0,t.value="",s.textContent="",u=void 0,h()}e.addEventListener("submit",async p=>{p.preventDefault();const v=t.value.trim();if(v.length<2){s.textContent="请输入至少两个字符。";return}const g=++c;n.hidden=!0,s.textContent="正在搜索城市…";try{const m=new URLSearchParams({name:v,language:"zh",count:"6"}),{results:x}=await Cf("https://geocoding-api.open-meteo.com/v1/search?"+m);if(g!==c)return;if(a=(x??[]).filter(ip),!a.length){s.textContent="没有找到城市，可以试试拼音。";return}if(a.length===1){d(a[0]);return}n.replaceChildren(new Option("选择匹配的城市",""),...a.map((y,S)=>new Option([...new Set([y.name,y.admin1,y.country].filter(Boolean))].join(" · "),String(S)))),n.hidden=!1,s.textContent=""}catch{g===c&&(s.textContent="暂时无法搜索城市，请稍后再试。")}}),n.addEventListener("change",()=>{n.value!==""&&d(a[Number(n.value)])}),h(),setInterval(h,900*1e3)}async function Cf(i){const e=await fetch(i,{signal:AbortSignal.timeout(9e3)});if(!e.ok)throw new Error(`HTTP ${e.status}`);return e.json()}function ip(i){return typeof(i==null?void 0:i.name)=="string"&&Number.isFinite(i.latitude)&&Number.isFinite(i.longitude)}function O1(){try{const i=JSON.parse(localStorage.getItem(np));if(ip(i))return i}catch{}return D1}function Tr(i){return Number.isFinite(i)?Math.round(i):null}function F1(i){return i===0?"晴":i===1||i===2?"多云":i===3?"阴":i===45||i===48?"雾":i>=51&&i<=57?"毛毛雨":i>=61&&i<=67?"雨":i>=71&&i<=77?"雪":i>=80&&i<=82?"阵雨":i===85||i===86?"阵雪":i>=95?"雷雨":"天气未分类"}const on=document.querySelector("#viewport"),Yo=document.querySelector(".stage"),Mi=document.querySelector("#camera-feed"),Sa=document.querySelector("#camera"),B1=document.querySelector("#camera-label"),z1=document.querySelector("#mode-label"),Er=document.querySelector("#stage-hint"),Pc=[...document.querySelectorAll("button[data-scene]")],k1=document.querySelector("#scene-eyebrow"),H1=document.querySelector("#scene-title"),G1=document.querySelector("#scene-intro"),V1=document.querySelector("#brand-name"),wl=document.querySelector("#view-controls"),Ko=document.querySelector("#desk-settings"),Ds=document.querySelector("#desk-home"),Al=document.querySelector("#desk-lighting"),Pf=document.querySelector("#station-replay"),sa=document.querySelector("#workshop-install"),Lf=document.querySelector("#workshop-reset"),Rl=document.querySelector("#workshop-flip");let Lc=!1,Ir=!1;const W1=document.querySelector("#weather-controls"),X1=document.querySelector("#model-controls"),Cl=document.querySelector("#model-open"),$o=document.querySelector("#model-file"),Us=document.querySelector("#model-reset"),Pl=document.querySelector("#model-status"),Ll=document.querySelector("#model-angle"),q1=document.querySelector("#model-angle-value"),If=document.querySelector("#model-credit"),Nf=document.querySelector("#status"),Y1=document.querySelector("#status-dot"),Ma=document.querySelector("#recenter"),Ic=document.querySelector("#sensitivity"),K1=document.querySelector("#gain-value"),Df=document.querySelector("#offset"),$1=document.querySelector("#meter-dot"),Nr=document.querySelector("#fullscreen"),wi={x:0,y:0,z:bi},zi={...wi},mn={...wi},ls=(i,e,t)=>Math.min(Math.max(i,e),t);let Jt,cs,Nc,sp,an="preview",Et="desk",ki=0,Gi=null,oo=null,kn=[],Dc=0,Uc=-1,Oc=-1/0,Uf=performance.now();function Ai(i,e="idle"){Nf.textContent!==i&&(Nf.textContent=i),Y1.dataset.state=e}function ya(i){an=i,Sa.disabled=an==="starting",Sa.setAttribute("aria-pressed",String(an==="camera")),B1.textContent={preview:"开启摄像头",starting:"正在开启…",camera:"关闭摄像头"}[an],z1.textContent=an==="camera"?"摄像头模式":"鼠标预览",ba()}function Os(i){return i==="desk"||i==="station"||i==="workshop"}function ba(){if(Et==="workshop"){Ir?Er.textContent=Lc?"钟面上的指针重新走起来了。":"钟停住了，绕到背面看看机芯。":Er.textContent=Lc?"机芯已经运转，绕到正面看看指针。":"抓住下方的铜齿轮，沿槽向上推回轴心。";return}if(Et==="station"){Er.textContent=an==="camera"?"侧身看月台，旅客碰面后会走向出口。":"先看远处的车灯，再看旅客下车、碰面和离开。";return}if(Et==="desk"){Er.textContent=an==="camera"?"移动头部看视差，拖动画面或用方向键环顾桌面。":"移动鼠标看视差，拖动画面或用方向键环顾桌面。";return}const i=an==="camera"?"慢慢左右挪动头部":"左右移动鼠标",e={reference:"留意贴在黑边上的蝴蝶结和房间两侧",visitor:"留意搭在窗沿上的手和递出来的木牌",rain:"看看玻璃上的雨和桌灯下的墨水屏",window:"看看桌面、墨水屏和窗景之间的距离",daily:"从两边看进木叶村的走廊",studio:"看看人物和窗框之间的空间","moon-post":"观察月兔的耳朵、窗框和后方的邮局",prototype:"观察窗框前的机器人"}[Et];Er.textContent=`${i}，${e}。`}function Xs(i,e){ki+=1,cs==null||cs.getTracks().forEach(t=>t.stop()),cs=void 0,Mi.srcObject=null,oo=null,Gi=null,kn=[],Ma.disabled=!0,Object.assign(mn,wi),ya("preview"),Ai(i,e)}async function J1(){var t;if(!((t=navigator.mediaDevices)!=null&&t.getUserMedia)){Ai("浏览器无法访问摄像头，请用 Chrome 或 Edge 打开本地地址。","error");return}const i=++ki;ya("starting"),Ai("等待摄像头授权…","pending");let e;try{e=await navigator.mediaDevices.getUserMedia({video:{width:{ideal:640},height:{ideal:480},frameRate:{ideal:30},facingMode:"user"},audio:!1})}catch(n){if(i!==ki)return;const s={NotAllowedError:"摄像头权限未开启，请在浏览器地址栏或 Windows 隐私设置中允许访问。",NotFoundError:"未找到摄像头。连接摄像头后可以重试。",NotReadableError:"无法读取摄像头。检查设备是否被其他应用占用。"}[n.name]??"摄像头无法启动，请检查连接后重试。";Xs(s,"error");return}if(i!==ki){e.getTracks().forEach(n=>n.stop());return}cs=e,cs.getVideoTracks()[0].addEventListener("ended",()=>{i===ki&&Xs("摄像头已断开。可以继续用鼠标预览。","error")},{once:!0}),Mi.srcObject=cs,Ai("正在加载本地追踪模型…","pending");try{if(await Mi.play(),!Nc){const n=await Fc(()=>import("./tracker-DzDmLCmE.js"),[],import.meta.url),s=await n.createDetector();if(i!==ki){s.close();return}Nc=s,sp=n.readFace}}catch(n){if(i!==ki)return;console.error(n),Xs("追踪模型未能启动。你可以重试或继续用鼠标预览。","error");return}i===ki&&(Dc=performance.now(),Uc=-1,Oc=-1/0,Object.assign(mn,wi),ya("camera"),Ai("请正对屏幕，正在寻找人脸…","pending"))}function Z1(i){if(Mi.readyState>=2&&i-Oc>=40&&Mi.currentTime!==Uc){Uc=Mi.currentTime,Oc=i;const e=sp(Nc,Mi,i);if(e){if(Dc=i,oo=e,!Gi){if(kn.push(e),kn.length<5){Ai("正在校准，请保持正对屏幕…","pending");return}Gi={x:kn.reduce((o,a)=>o+a.x,0)/kn.length,y:kn.reduce((o,a)=>o+a.y,0)/kn.length,size:kn.reduce((o,a)=>o+a.size,0)/kn.length},kn=[]}Ma.disabled=!1,Ai("正在追踪 · 左右移动试试","live");const t=Number(Ic.value),n=bi*ls(Gi.size/e.size,.72,1.38),s=(Gi.x-.5)*bi-(e.x-.5)*n,r=(Gi.y-.5)*bi-(e.y-.5)*n;mn.x=ls(s*t*1.18,-va,va),mn.y=ls(r*t*Mi.videoHeight/Mi.videoWidth,-.24,.24),mn.z=n;return}}i-Dc>650&&(oo=null,kn=[],Ma.disabled=!0,Object.assign(mn,wi),Ai(Gi?"暂未看到人脸，请回到摄像头前。":"请正对屏幕，正在寻找人脸…","pending"))}function rp(i){if(an==="camera")try{Z1(i)}catch(s){console.error(s),Xs("追踪中断，可以重试或继续用鼠标预览。","error")}const e=1-Math.exp(-Math.min(i-Uf,100)/76);Uf=i,zi.x+=(mn.x-zi.x)*e,zi.y+=(mn.y-zi.y)*e,zi.z+=(mn.z-zi.z)*e;const t=Math.round(zi.x/va*100),n=`${t>0?"+":""}${t}%`;Df.value!==n&&(Df.value=n,$1.style.left=`${(t+100)/2}%`),Jt.draw(zi,i),requestAnimationFrame(rp)}function Q1(){let i=!1,e=!1,t=!1;function n(r,o=!1){Pl.textContent=r,Pl.dataset.error=String(o)}function s(r){Ll.value=r,q1.value=`${r}°`,Jt.setModelAngle(r)}Ll.addEventListener("input",()=>s(Number(Ll.value)));for(const r of document.querySelectorAll("[data-angle]"))r.addEventListener("click",()=>s(Number(r.dataset.angle)));Cl.addEventListener("click",()=>$o.click()),$o.addEventListener("change",async()=>{const r=$o.files[0];if($o.value="",!(!r||e)){e=!0,Cl.disabled=Us.disabled=!0,n("正在载入模型…");try{await Jt.importModel(r),t=!0,Us.hidden=!i,If.hidden=!0,s(0),n(r.name)}catch(o){n(o.message,!0)}finally{e=!1,Cl.disabled=Us.disabled=!1}}}),Us.addEventListener("click",()=>{Jt.resetModel(),t=!1,Us.hidden=!0,If.hidden=!1,s(0),n("示例模型 · 宇航员")}),Jt.loadSample().then(()=>{i=!0,Us.hidden=!t,!e&&!t&&Pl.dataset.error!=="true"&&n("示例模型 · 宇航员")}).catch(()=>{!e&&!t&&n("示例未能载入。你可以导入自己的 GLB。",!0)})}function j1(){ya("preview"),U1(l=>Jt.setWeather(l));let i=!1,e=!1,t=null,n=0,s=0;function r(l,u){n=ls(l,-30,30),s=ls(u,-28,32),Jt.setDeskLook(n*Math.PI/180,s*Math.PI/180),Ds.disabled=n===0&&s===0}function o(){r(0,0),an==="preview"&&Object.assign(mn,wi)}Ds.addEventListener("click",o),Pf.addEventListener("click",()=>Jt.replayStation()),sa.addEventListener("click",()=>Jt.repairClock()),Lf.addEventListener("click",()=>Jt.resetWorkshop()),Rl.addEventListener("click",()=>{Ir=Jt.flipWorkshop(),Rl.textContent=Ir?"查看机芯":"查看钟面",sa.hidden=Ir,o(),ba()}),Al.addEventListener("change",()=>Jt.setDeskLighting(Al.value)),Ko.addEventListener("click",()=>{e=!e,wl.hidden=!e,Ko.setAttribute("aria-expanded",String(e)),e&&document.fullscreenElement!==Yo&&wl.scrollIntoView({block:"nearest"})});const a={desk:["A ROOM WITHIN","桌上平板","桌上摆着一台平板，屏幕里还有一间房。"],station:["WUGANG STATION","双屏小车站","雾港的列车正从远处驶来。"],workshop:["CLOCK ATELIER","微缩修复工坊","一座停摆的机械钟等你修好。"],reference:["THE CLOCK KEEPER","举钟来客","亮房间里，有人举着一块翻页钟。"],visitor:["THE VISITOR","桌沿来客","有人扶着窗沿，把今天的时间递到你面前。"],rain:["RAIN AT THE WINDOW","雨夜留灯","一盏暖灯和一台安静工作的墨水屏。"],window:["WINDOW DESK","窗边桌面","窗边的墨水屏显示时间、月历和室外天气。"],daily:["KONOHA MORNING DESK","木叶晨间桌","佐助翻月历，鸣人报时间，出门前再看一眼天气。"],studio:["FIGURE STUDIO","人物展台","把 3D 人物摆上展台，从正面、侧面和背面看造型细节。"],"moon-post":["LUNAR POST","月面邮局","观察月兔如何跨过窗框，以及邮局里不同距离的物件。"],prototype:["RELAY OBSERVATORY","观测舱原型","从两侧看进观测舱，留意探出窗框的巡检机器人。"]};for(const l of Pc)l.addEventListener("click",()=>{Et=l.dataset.scene,Jt.setScene(Et);const u=Os(Et)||Et==="reference",f=u||["visitor","rain","window"].includes(Et);document.body.dataset.scene=Et,document.body.classList.toggle("immersive-desk",f),Ds.hidden=!Os(Et),Ds.textContent=Et==="workshop"?"回到工台":"回到平板",Ds.title=Ds.textContent+"（Home）",Al.hidden=Et!=="desk",Pf.hidden=Et!=="station",Rl.hidden=Lf.hidden=Et!=="workshop",sa.hidden=Et!=="workshop"||Ir,on.tabIndex=Os(Et)?0:-1,Os(Et)&&o(),Ko.hidden=!f,Ko.textContent=u?"视角设置":"天气与视角",wl.hidden=f&&!e,W1.hidden=u||!f&&Et!=="daily",X1.hidden=Et!=="studio",Et==="studio"&&!i&&(Q1(),i=!0),[k1.textContent,H1.textContent,G1.textContent]=a[Et],V1.textContent=f?a[Et][1]:"视差窗口";for(const h of Pc)h.setAttribute("aria-pressed",String(h===l));ba()});Sa.addEventListener("click",()=>{an==="camera"?Xs("摄像头已关闭。"):an==="preview"&&J1()}),Ma.addEventListener("click",()=>{oo&&(Gi=oo,Object.assign(mn,wi))}),Ic.addEventListener("input",()=>{K1.value=Ic.value+"×"});function c(l){const u=on.getBoundingClientRect();return[(l.clientX-u.left)/u.width*2-1,1-(l.clientY-u.top)/u.height*2]}on.addEventListener("pointerdown",l=>{if(!Os(Et)||l.button!==0||t)return;on.focus({preventScroll:!0}),on.setPointerCapture(l.pointerId);const u=Et==="workshop"&&Jt.grabRepair(...c(l));t={id:l.pointerId,x:l.clientX,y:l.clientY,yaw:n,pitch:s,gear:u},on.classList.add("looking-around")}),on.addEventListener("pointermove",l=>{if((t==null?void 0:t.id)===l.pointerId){if(t.gear){Jt.dragRepair(...c(l));return}r(t.yaw+(l.clientX-t.x)/on.clientWidth*104,t.pitch+(l.clientY-t.y)/on.clientHeight*88);return}if(an!=="preview")return;const u=on.getBoundingClientRect(),f=(l.clientX-u.left)/u.width,h=(l.clientY-u.top)/u.height;mn.x=ls((f-.5)*2,-1,1)*va,mn.y=ls((.5-h)*2,-1,1)*.24}),on.addEventListener("pointerleave",()=>{an==="preview"&&!t&&Object.assign(mn,wi)}),on.addEventListener("pointerup",l=>{(t==null?void 0:t.id)===l.pointerId&&t.gear&&Jt.releaseRepair(!1)}),on.addEventListener("lostpointercapture",l=>{(t==null?void 0:t.id)===l.pointerId&&(t.gear&&Jt.releaseRepair(!0),t=null,on.classList.remove("looking-around"),an==="preview"&&Object.assign(mn,wi))}),on.addEventListener("keydown",l=>{if(!Os(Et))return;const u={ArrowLeft:[7,0],ArrowRight:[-7,0],ArrowUp:[0,6],ArrowDown:[0,-6]}[l.key];u?(l.preventDefault(),r(n+u[0],s+u[1])):l.key==="Home"&&(l.preventDefault(),o())}),Nr.disabled=!document.fullscreenEnabled,Nr.addEventListener("click",async()=>{try{document.fullscreenElement===Yo?await document.exitFullscreen():await Yo.requestFullscreen()}catch(l){console.warn(l)}}),document.addEventListener("fullscreenchange",()=>{const l=document.fullscreenElement===Yo?"退出全屏":"全屏显示";Nr.setAttribute("aria-label",l),Nr.title=l}),window.addEventListener("pagehide",()=>{an!=="preview"&&Xs("摄像头已关闭。")})}var Of;try{Jt=L1(on,e=>{Lc=e,sa.disabled=e,Et==="workshop"&&ba()}),j1();const i=new URLSearchParams(location.search).get("scene")??"workshop";(Of=Pc.find(e=>e.dataset.scene===i))==null||Of.click(),requestAnimationFrame(rp)}catch(i){console.error(i),document.querySelector("#render-error").hidden=!1,Sa.disabled=!0,Nr.disabled=!0,Ai("3D 画面无法启动。","error")}export{iy as A,si as B,Oe as C,Gn as D,qn as E,tt as G,Hm as I,iu as L,kt as M,At as O,En as Q,Bc as R,Ki as S,la as T,Sm as U,L as V,Fc as _,Dn as a,ln as b,it as c,mt as d,pd as e,Le as f,Ze as g,et as h,bn as i,ty as j,It as k,su as l,U0 as m,ny as n,eu as o,he as p,ud as q,Zr as r,nM as s};
