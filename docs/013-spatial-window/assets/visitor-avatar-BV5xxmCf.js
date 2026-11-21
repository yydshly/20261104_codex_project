import{a as Ni,b as Vi,V as g,Q as w,E as it,M as b,G as te,c as kt,D as Wt,d as zt,L as Ne,e as rt,I as Di,S as Bi,T as Fi,U as Hi,f as ce,g as j,C as D,h as B,O as Le,i as U,j as ki,k as G,l as Wi,m as zi,n as jt,o as ot,A as ji,R as be,p as ge,q as Un,r as Nn,s as Xi}from"./app-i92LGSBE.js";/*!
 * @pixiv/three-vrm v3.5.5
 * VRM file loader for three.js.
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 */var we=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())}),E=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())}),Xt=class extends Le{constructor(e){super(),this.weight=0,this.isBinary=!1,this.overrideBlink="none",this.overrideLookAt="none",this.overrideMouth="none",this._binds=[],this.name=`VRMExpression_${e}`,this.expressionName=e,this.type="VRMExpression",this.visible=!1}get binds(){return this._binds}get overrideBlinkAmount(){return this.overrideBlink==="block"?0<this.outputWeight?1:0:this.overrideBlink==="blend"?this.outputWeight:0}get overrideLookAtAmount(){return this.overrideLookAt==="block"?0<this.outputWeight?1:0:this.overrideLookAt==="blend"?this.outputWeight:0}get overrideMouthAmount(){return this.overrideMouth==="block"?0<this.outputWeight?1:0:this.overrideMouth==="blend"?this.outputWeight:0}get outputWeight(){return this.isBinary?this.weight>.5?1:0:this.weight}addBind(e){this._binds.push(e)}deleteBind(e){const t=this._binds.indexOf(e);t>=0&&this._binds.splice(t,1)}applyWeight(e){var t;let n=this.outputWeight;n*=(t=e==null?void 0:e.multiplier)!=null?t:1,this.isBinary&&n<1&&(n=0),this._binds.forEach(i=>i.applyWeight(n))}clearAppliedWeight(){this._binds.forEach(e=>e.clearAppliedWeight())}};function Vn(e,t,n){var i,r;const o=e.parser.json,a=(i=o.nodes)==null?void 0:i[t];if(a==null)return console.warn(`extractPrimitivesInternal: Attempt to use nodes[${t}] of glTF but the node doesn't exist`),null;const l=a.mesh;if(l==null)return null;const s=(r=o.meshes)==null?void 0:r[l];if(s==null)return console.warn(`extractPrimitivesInternal: Attempt to use meshes[${l}] of glTF but the mesh doesn't exist`),null;const u=s.primitives.length,c=[];return n.traverse(d=>{c.length<u&&d.isMesh&&c.push(d)}),c}function Gt(e,t){return E(this,null,function*(){const n=yield e.parser.getDependency("node",t);return Vn(e,t,n)})}function Yt(e){return E(this,null,function*(){const t=yield e.parser.getDependencies("node"),n=new Map;return t.forEach((i,r)=>{const o=Vn(e,r,i);o!=null&&n.set(r,o)}),n})}var $e={Aa:"aa",Ih:"ih",Ou:"ou",Ee:"ee",Oh:"oh",Blink:"blink",Happy:"happy",Angry:"angry",Sad:"sad",Relaxed:"relaxed",LookUp:"lookUp",Surprised:"surprised",LookDown:"lookDown",LookLeft:"lookLeft",LookRight:"lookRight",BlinkLeft:"blinkLeft",BlinkRight:"blinkRight",Neutral:"neutral"};function Dn(e){return Math.max(Math.min(e,1),0)}var qt=class Bn{constructor(){this.blinkExpressionNames=["blink","blinkLeft","blinkRight"],this.lookAtExpressionNames=["lookLeft","lookRight","lookUp","lookDown"],this.mouthExpressionNames=["aa","ee","ih","oh","ou"],this._expressions=[],this._expressionMap={}}get expressions(){return this._expressions.concat()}get expressionMap(){return Object.assign({},this._expressionMap)}get presetExpressionMap(){const t={},n=new Set(Object.values($e));return Object.entries(this._expressionMap).forEach(([i,r])=>{n.has(i)&&(t[i]=r)}),t}get customExpressionMap(){const t={},n=new Set(Object.values($e));return Object.entries(this._expressionMap).forEach(([i,r])=>{n.has(i)||(t[i]=r)}),t}copy(t){return this._expressions.concat().forEach(i=>{this.unregisterExpression(i)}),t._expressions.forEach(i=>{this.registerExpression(i)}),this.blinkExpressionNames=t.blinkExpressionNames.concat(),this.lookAtExpressionNames=t.lookAtExpressionNames.concat(),this.mouthExpressionNames=t.mouthExpressionNames.concat(),this}clone(){return new Bn().copy(this)}getExpression(t){var n;return(n=this._expressionMap[t])!=null?n:null}registerExpression(t){this._expressions.push(t),this._expressionMap[t.expressionName]=t}unregisterExpression(t){const n=this._expressions.indexOf(t);n===-1&&console.warn("VRMExpressionManager: The specified expressions is not registered"),this._expressions.splice(n,1),delete this._expressionMap[t.expressionName]}getValue(t){var n;const i=this.getExpression(t);return(n=i==null?void 0:i.weight)!=null?n:null}setValue(t,n){const i=this.getExpression(t);i&&(i.weight=Dn(n))}resetValues(){this._expressions.forEach(t=>{t.weight=0})}getExpressionTrackName(t){const n=this.getExpression(t);return n?`${n.name}.weight`:null}update(){const t=this._calculateWeightMultipliers();this._expressions.forEach(n=>{n.clearAppliedWeight()}),this._expressions.forEach(n=>{let i=1;const r=n.expressionName;this.blinkExpressionNames.indexOf(r)!==-1&&(i*=t.blink),this.lookAtExpressionNames.indexOf(r)!==-1&&(i*=t.lookAt),this.mouthExpressionNames.indexOf(r)!==-1&&(i*=t.mouth),n.applyWeight({multiplier:i})})}_calculateWeightMultipliers(){let t=1,n=1,i=1;return this._expressions.forEach(r=>{t-=r.overrideBlinkAmount,n-=r.overrideLookAtAmount,i-=r.overrideMouthAmount}),t=Math.max(0,t),n=Math.max(0,n),i=Math.max(0,i),{blink:t,lookAt:n,mouth:i}}},he={Color:"color",EmissionColor:"emissionColor",ShadeColor:"shadeColor",RimColor:"rimColor",OutlineColor:"outlineColor"},Gi={_Color:he.Color,_EmissionColor:he.EmissionColor,_ShadeColor:he.ShadeColor,_RimColor:he.RimColor,_OutlineColor:he.OutlineColor},Yi=new D,Fn=class Hn{constructor({material:t,type:n,targetValue:i,targetAlpha:r}){this.material=t,this.type=n,this.targetValue=i,this.targetAlpha=r??1;const o=this._initColorBindState(),a=this._initAlphaBindState();this._state={color:o,alpha:a}}applyWeight(t){const{color:n,alpha:i}=this._state;if(n!=null){const{propertyName:r,deltaValue:o}=n,a=this.material[r];a!=null&&a.add(Yi.copy(o).multiplyScalar(t))}if(i!=null){const{propertyName:r,deltaValue:o}=i;this.material[r]!=null&&(this.material[r]+=o*t)}}clearAppliedWeight(){const{color:t,alpha:n}=this._state;if(t!=null){const{propertyName:i,initialValue:r}=t,o=this.material[i];o!=null&&o.copy(r)}if(n!=null){const{propertyName:i,initialValue:r}=n;this.material[i]!=null&&(this.material[i]=r)}}_initColorBindState(){var t,n,i;const{material:r,type:o,targetValue:a}=this,l=this._getPropertyNameMap(),s=(n=(t=l==null?void 0:l[o])==null?void 0:t[0])!=null?n:null;if(s==null)return console.warn(`Tried to add a material color bind to the material ${(i=r.name)!=null?i:"(no name)"}, the type ${o} but the material or the type is not supported.`),null;const c=r[s].clone(),d=new D(a.r-c.r,a.g-c.g,a.b-c.b);return{propertyName:s,initialValue:c,deltaValue:d}}_initAlphaBindState(){var t,n,i;const{material:r,type:o,targetAlpha:a}=this,l=this._getPropertyNameMap(),s=(n=(t=l==null?void 0:l[o])==null?void 0:t[1])!=null?n:null;if(s==null&&a!==1)return console.warn(`Tried to add a material alpha bind to the material ${(i=r.name)!=null?i:"(no name)"}, the type ${o} but the material or the type does not support alpha.`),null;if(s==null)return null;const u=r[s],c=a-u;return{propertyName:s,initialValue:u,deltaValue:c}}_getPropertyNameMap(){var t,n;return(n=(t=Object.entries(Hn._propertyNameMapMap).find(([i])=>this.material[i]===!0))==null?void 0:t[1])!=null?n:null}};Fn._propertyNameMapMap={isMeshStandardMaterial:{color:["color","opacity"],emissionColor:["emissive",null]},isMeshBasicMaterial:{color:["color","opacity"]},isMToonMaterial:{color:["color","opacity"],emissionColor:["emissive",null],outlineColor:["outlineColorFactor",null],matcapColor:["matcapFactor",null],rimColor:["parametricRimColorFactor",null],shadeColor:["shadeColorFactor",null]}};var Qt=Fn,Ie=class{constructor({primitives:e,index:t,weight:n}){this.primitives=e,this.index=t,this.weight=n}applyWeight(e){this.primitives.forEach(t=>{var n;((n=t.morphTargetInfluences)==null?void 0:n[this.index])!=null&&(t.morphTargetInfluences[this.index]+=this.weight*e)})}clearAppliedWeight(){this.primitives.forEach(e=>{var t;((t=e.morphTargetInfluences)==null?void 0:t[this.index])!=null&&(e.morphTargetInfluences[this.index]=0)})}},$t=new ge,kn=class Wn{constructor({material:t,scale:n,offset:i}){var r,o;this.material=t,this.scale=n,this.offset=i;const a=(r=Object.entries(Wn._propertyNamesMap).find(([l])=>t[l]===!0))==null?void 0:r[1];a==null?(console.warn(`Tried to add a texture transform bind to the material ${(o=t.name)!=null?o:"(no name)"} but the material is not supported.`),this._properties=[]):(this._properties=[],a.forEach(l=>{var s;const u=(s=t[l])==null?void 0:s.clone();if(!u)return null;t[l]=u;const c=u.offset.clone(),d=u.repeat.clone(),h=i.clone().sub(c),p=n.clone().sub(d);this._properties.push({name:l,initialOffset:c,deltaOffset:h,initialScale:d,deltaScale:p})}))}applyWeight(t){this._properties.forEach(n=>{const i=this.material[n.name];i!==void 0&&(i.offset.add($t.copy(n.deltaOffset).multiplyScalar(t)),i.repeat.add($t.copy(n.deltaScale).multiplyScalar(t)))})}clearAppliedWeight(){this._properties.forEach(t=>{const n=this.material[t.name];n!==void 0&&(n.offset.copy(t.initialOffset),n.repeat.copy(t.initialScale))})}};kn._propertyNamesMap={isMeshStandardMaterial:["map","emissiveMap","bumpMap","normalMap","displacementMap","roughnessMap","metalnessMap","alphaMap"],isMeshBasicMaterial:["map","specularMap","alphaMap"],isMToonMaterial:["map","normalMap","emissiveMap","shadeMultiplyTexture","rimMultiplyTexture","outlineWidthMultiplyTexture","uvAnimationMaskTexture"]};var Zt=kn,qi=new Set(["1.0","1.0-beta"]),zn=class jn{get name(){return"VRMExpressionLoaderPlugin"}constructor(t){this.parser=t}afterRoot(t){return E(this,null,function*(){t.userData.vrmExpressionManager=yield this._import(t)})}_import(t){return E(this,null,function*(){const n=yield this._v1Import(t);if(n)return n;const i=yield this._v0Import(t);return i||null})}_v1Import(t){return E(this,null,function*(){var n,i;const r=this.parser.json;if(!(((n=r.extensionsUsed)==null?void 0:n.indexOf("VRMC_vrm"))!==-1))return null;const a=(i=r.extensions)==null?void 0:i.VRMC_vrm;if(!a)return null;const l=a.specVersion;if(!qi.has(l))return console.warn(`VRMExpressionLoaderPlugin: Unknown VRMC_vrm specVersion "${l}"`),null;const s=a.expressions;if(!s)return null;const u=new Set(Object.values($e)),c=new Map;s.preset!=null&&Object.entries(s.preset).forEach(([h,p])=>{if(p!=null){if(!u.has(h)){console.warn(`VRMExpressionLoaderPlugin: Unknown preset name "${h}" detected. Ignoring the expression`);return}c.set(h,p)}}),s.custom!=null&&Object.entries(s.custom).forEach(([h,p])=>{if(u.has(h)){console.warn(`VRMExpressionLoaderPlugin: Custom expression cannot have preset name "${h}". Ignoring the expression`);return}c.set(h,p)});const d=new qt;return yield Promise.all(Array.from(c.entries()).map(h=>E(this,[h],function*([p,m]){var f,_,v,M,R,T,x;const y=new Xt(p);if(t.scene.add(y),y.isBinary=(f=m.isBinary)!=null?f:!1,y.overrideBlink=(_=m.overrideBlink)!=null?_:"none",y.overrideLookAt=(v=m.overrideLookAt)!=null?v:"none",y.overrideMouth=(M=m.overrideMouth)!=null?M:"none",(R=m.morphTargetBinds)==null||R.forEach(S=>E(this,null,function*(){var A;if(S.node===void 0||S.index===void 0)return;const I=yield Gt(t,S.node),P=S.index;if(!I.every(L=>Array.isArray(L.morphTargetInfluences)&&P<L.morphTargetInfluences.length)){console.warn(`VRMExpressionLoaderPlugin: ${m.name} attempts to index morph #${P} but not found.`);return}y.addBind(new Ie({primitives:I,index:P,weight:(A=S.weight)!=null?A:1}))})),m.materialColorBinds||m.textureTransformBinds){const S=[];t.scene.traverse(A=>{const I=A.material;I&&(Array.isArray(I)?S.push(...I):S.push(I))}),(T=m.materialColorBinds)==null||T.forEach(A=>E(this,null,function*(){S.filter(P=>{var L;const O=(L=this.parser.associations.get(P))==null?void 0:L.materials;return A.material===O}).forEach(P=>{y.addBind(new Qt({material:P,type:A.type,targetValue:new D().fromArray(A.targetValue),targetAlpha:A.targetValue[3]}))})})),(x=m.textureTransformBinds)==null||x.forEach(A=>E(this,null,function*(){S.filter(P=>{var L;const O=(L=this.parser.associations.get(P))==null?void 0:L.materials;return A.material===O}).forEach(P=>{var L,O;y.addBind(new Zt({material:P,offset:new ge().fromArray((L=A.offset)!=null?L:[0,0]),scale:new ge().fromArray((O=A.scale)!=null?O:[1,1])}))})}))}d.registerExpression(y)}))),d})}_v0Import(t){return E(this,null,function*(){var n;const i=this.parser.json,r=(n=i.extensions)==null?void 0:n.VRM;if(!r)return null;const o=r.blendShapeMaster;if(!o)return null;const a=new qt,l=o.blendShapeGroups;if(!l)return a;const s=new Set;return yield Promise.all(l.map(u=>E(this,null,function*(){var c;const d=u.presetName,h=d!=null&&jn.v0v1PresetNameMap[d]||null,p=h??u.name;if(p==null){console.warn("VRMExpressionLoaderPlugin: One of custom expressions has no name. Ignoring the expression");return}if(s.has(p)){console.warn(`VRMExpressionLoaderPlugin: An expression preset ${d} has duplicated entries. Ignoring the expression`);return}s.add(p);const m=new Xt(p);t.scene.add(m),m.isBinary=(c=u.isBinary)!=null?c:!1,u.binds&&u.binds.forEach(_=>E(this,null,function*(){var v;if(_.mesh===void 0||_.index===void 0)return;const M=[];if((v=i.nodes)==null||v.forEach((T,x)=>{T.mesh===_.mesh&&M.push(x)}),M.length===0){console.warn(`VRMExpressionLoaderPlugin: ${u.name} attempts to bind a morph target to the mesh #${_.mesh} but the mesh is not found or not used in the scene. Ignoring the bind.`);return}const R=_.index;yield Promise.all(M.map(T=>E(this,null,function*(){var x;const y=yield Gt(t,T);if(!y.every(S=>Array.isArray(S.morphTargetInfluences)&&R<S.morphTargetInfluences.length)){console.warn(`VRMExpressionLoaderPlugin: ${u.name} attempts to index ${R}th morph but not found.`);return}m.addBind(new Ie({primitives:y,index:R,weight:.01*((x=_.weight)!=null?x:100)}))})))}));const f=u.materialValues;f&&f.length!==0&&f.forEach(_=>{if(_.materialName===void 0||_.propertyName===void 0||_.targetValue===void 0)return;const v=[];t.scene.traverse(R=>{if(R.material){const T=R.material;Array.isArray(T)?v.push(...T.filter(x=>(x.name===_.materialName||x.name===_.materialName+" (Outline)")&&v.indexOf(x)===-1)):T.name===_.materialName&&v.indexOf(T)===-1&&v.push(T)}});const M=_.propertyName;v.forEach(R=>{if(M==="_MainTex_ST"){const x=new ge(_.targetValue[0],_.targetValue[1]),y=new ge(_.targetValue[2],_.targetValue[3]);y.y=1-y.y-x.y,m.addBind(new Zt({material:R,scale:x,offset:y}));return}const T=Gi[M];if(T){m.addBind(new Qt({material:R,type:T,targetValue:new D().fromArray(_.targetValue),targetAlpha:_.targetValue[3]}));return}console.warn(M+" is not supported")})}),a.registerExpression(m)}))),a})}};zn.v0v1PresetNameMap={a:"aa",e:"ee",i:"ih",o:"oh",u:"ou",blink:"blink",joy:"happy",angry:"angry",sorrow:"sad",fun:"relaxed",lookup:"lookUp",lookdown:"lookDown",lookleft:"lookLeft",lookright:"lookRight",blink_l:"blinkLeft",blink_r:"blinkRight",neutral:"neutral"};var Qi=zn,st=class se{constructor(t,n){this._firstPersonOnlyLayer=se.DEFAULT_FIRSTPERSON_ONLY_LAYER,this._thirdPersonOnlyLayer=se.DEFAULT_THIRDPERSON_ONLY_LAYER,this._initializedLayers=!1,this.humanoid=t,this.meshAnnotations=n}copy(t){if(this.humanoid!==t.humanoid)throw new Error("VRMFirstPerson: humanoid must be same in order to copy");return this.meshAnnotations=t.meshAnnotations.map(n=>({meshes:n.meshes.concat(),type:n.type})),this}clone(){return new se(this.humanoid,this.meshAnnotations).copy(this)}get firstPersonOnlyLayer(){return this._firstPersonOnlyLayer}get thirdPersonOnlyLayer(){return this._thirdPersonOnlyLayer}setup({firstPersonOnlyLayer:t=se.DEFAULT_FIRSTPERSON_ONLY_LAYER,thirdPersonOnlyLayer:n=se.DEFAULT_THIRDPERSON_ONLY_LAYER}={}){this._initializedLayers||(this._firstPersonOnlyLayer=t,this._thirdPersonOnlyLayer=n,this.meshAnnotations.forEach(i=>{i.meshes.forEach(r=>{i.type==="firstPersonOnly"?(r.layers.set(this._firstPersonOnlyLayer),r.traverse(o=>o.layers.set(this._firstPersonOnlyLayer))):i.type==="thirdPersonOnly"?(r.layers.set(this._thirdPersonOnlyLayer),r.traverse(o=>o.layers.set(this._thirdPersonOnlyLayer))):i.type==="auto"&&this._createHeadlessModel(r)})}),this._initializedLayers=!0)}_excludeTriangles(t,n,i,r){let o=0;if(n!=null&&n.length>0)for(let a=0;a<t.length;a+=3){const l=t[a],s=t[a+1],u=t[a+2],c=n[l],d=i[l];if(c[0]>0&&r.includes(d[0])||c[1]>0&&r.includes(d[1])||c[2]>0&&r.includes(d[2])||c[3]>0&&r.includes(d[3]))continue;const h=n[s],p=i[s];if(h[0]>0&&r.includes(p[0])||h[1]>0&&r.includes(p[1])||h[2]>0&&r.includes(p[2])||h[3]>0&&r.includes(p[3]))continue;const m=n[u],f=i[u];m[0]>0&&r.includes(f[0])||m[1]>0&&r.includes(f[1])||m[2]>0&&r.includes(f[2])||m[3]>0&&r.includes(f[3])||(t[o++]=l,t[o++]=s,t[o++]=u)}return o}_createErasedMesh(t,n){const i=new zi(t.geometry.clone(),t.material);i.name=`${t.name}(erase)`,i.frustumCulled=t.frustumCulled,i.layers.set(this._firstPersonOnlyLayer);const r=i.geometry,o=r.getAttribute("skinIndex"),a=o instanceof jt?[]:o.array,l=[];for(let f=0;f<a.length;f+=4)l.push([a[f],a[f+1],a[f+2],a[f+3]]);const s=r.getAttribute("skinWeight"),u=s instanceof jt?[]:s.array,c=[];for(let f=0;f<u.length;f+=4)c.push([u[f],u[f+1],u[f+2],u[f+3]]);const d=r.getIndex();if(!d)throw new Error("The geometry doesn't have an index buffer");const h=Array.from(d.array),p=this._excludeTriangles(h,c,l,n),m=[];for(let f=0;f<p;f++)m[f]=h[f];return r.setIndex(m),t.onBeforeRender&&(i.onBeforeRender=t.onBeforeRender),i.bind(new ot(t.skeleton.bones,t.skeleton.boneInverses),new B),i}_createHeadlessModelForSkinnedMesh(t,n){const i=[];if(n.skeleton.bones.forEach((o,a)=>{this._isEraseTarget(o)&&i.push(a)}),!i.length){n.layers.enable(this._thirdPersonOnlyLayer),n.layers.enable(this._firstPersonOnlyLayer);return}n.layers.set(this._thirdPersonOnlyLayer);const r=this._createErasedMesh(n,i);t.add(r)}_createHeadlessModel(t){if(t.type==="Group")if(t.layers.set(this._thirdPersonOnlyLayer),this._isEraseTarget(t))t.traverse(n=>n.layers.set(this._thirdPersonOnlyLayer));else{const n=new te;n.name=`_headless_${t.name}`,n.layers.set(this._firstPersonOnlyLayer),t.parent.add(n),t.children.filter(i=>i.type==="SkinnedMesh").forEach(i=>{const r=i;this._createHeadlessModelForSkinnedMesh(n,r)})}else if(t.type==="SkinnedMesh"){const n=t;this._createHeadlessModelForSkinnedMesh(t.parent,n)}else this._isEraseTarget(t)&&(t.layers.set(this._thirdPersonOnlyLayer),t.traverse(n=>n.layers.set(this._thirdPersonOnlyLayer)))}_isEraseTarget(t){return t===this.humanoid.getRawBoneNode("head")?!0:t.parent?this._isEraseTarget(t.parent):!1}};st.DEFAULT_FIRSTPERSON_ONLY_LAYER=9;st.DEFAULT_THIRDPERSON_ONLY_LAYER=10;var Jt=st,$i=new Set(["1.0","1.0-beta"]),Zi=class{get name(){return"VRMFirstPersonLoaderPlugin"}constructor(e){this.parser=e}afterRoot(e){return E(this,null,function*(){const t=e.userData.vrmHumanoid;if(t!==null){if(t===void 0)throw new Error("VRMFirstPersonLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");e.userData.vrmFirstPerson=yield this._import(e,t)}})}_import(e,t){return E(this,null,function*(){if(t==null)return null;const n=yield this._v1Import(e,t);if(n)return n;const i=yield this._v0Import(e,t);return i||null})}_v1Import(e,t){return E(this,null,function*(){var n,i;const r=this.parser.json;if(!(((n=r.extensionsUsed)==null?void 0:n.indexOf("VRMC_vrm"))!==-1))return null;const a=(i=r.extensions)==null?void 0:i.VRMC_vrm;if(!a)return null;const l=a.specVersion;if(!$i.has(l))return console.warn(`VRMFirstPersonLoaderPlugin: Unknown VRMC_vrm specVersion "${l}"`),null;const s=a.firstPerson,u=[],c=yield Yt(e);return Array.from(c.entries()).forEach(([d,h])=>{var p,m;const f=(p=s==null?void 0:s.meshAnnotations)==null?void 0:p.find(_=>_.node===d);u.push({meshes:h,type:(m=f==null?void 0:f.type)!=null?m:"auto"})}),new Jt(t,u)})}_v0Import(e,t){return E(this,null,function*(){var n;const i=this.parser.json,r=(n=i.extensions)==null?void 0:n.VRM;if(!r)return null;const o=r.firstPerson;if(!o)return null;const a=[],l=yield Yt(e);return Array.from(l.entries()).forEach(([s,u])=>{const c=i.nodes[s],d=o.meshAnnotations?o.meshAnnotations.find(h=>h.mesh===c.mesh):void 0;a.push({meshes:u,type:this._convertV0FlagToV1Type(d==null?void 0:d.firstPersonFlag)})}),new Jt(t,a)})}_convertV0FlagToV1Type(e){return e==="FirstPersonOnly"?"firstPersonOnly":e==="ThirdPersonOnly"?"thirdPersonOnly":e==="Both"?"both":"auto"}},Kt=new g,en=new g,Ji=new w,tn=class extends te{constructor(e){super(),this.vrmHumanoid=e,this._boneAxesMap=new Map,Object.values(e.humanBones).forEach(t=>{const n=new ji(1);n.matrixAutoUpdate=!1,n.material.depthTest=!1,n.material.depthWrite=!1,this.add(n),this._boneAxesMap.set(t,n)})}dispose(){Array.from(this._boneAxesMap.values()).forEach(e=>{e.geometry.dispose(),e.material.dispose()})}updateMatrixWorld(e){Array.from(this._boneAxesMap.entries()).forEach(([t,n])=>{t.node.updateWorldMatrix(!0,!1),t.node.matrixWorld.decompose(Kt,Ji,en);const i=Kt.set(.1,.1,.1).divide(en);n.matrix.copy(t.node.matrixWorld).scale(i)}),super.updateMatrixWorld(e)}},Be=["hips","spine","chest","upperChest","neck","head","leftEye","rightEye","jaw","leftUpperLeg","leftLowerLeg","leftFoot","leftToes","rightUpperLeg","rightLowerLeg","rightFoot","rightToes","leftShoulder","leftUpperArm","leftLowerArm","leftHand","rightShoulder","rightUpperArm","rightLowerArm","rightHand","leftThumbMetacarpal","leftThumbProximal","leftThumbDistal","leftIndexProximal","leftIndexIntermediate","leftIndexDistal","leftMiddleProximal","leftMiddleIntermediate","leftMiddleDistal","leftRingProximal","leftRingIntermediate","leftRingDistal","leftLittleProximal","leftLittleIntermediate","leftLittleDistal","rightThumbMetacarpal","rightThumbProximal","rightThumbDistal","rightIndexProximal","rightIndexIntermediate","rightIndexDistal","rightMiddleProximal","rightMiddleIntermediate","rightMiddleDistal","rightRingProximal","rightRingIntermediate","rightRingDistal","rightLittleProximal","rightLittleIntermediate","rightLittleDistal"],Ki={hips:null,spine:"hips",chest:"spine",upperChest:"chest",neck:"upperChest",head:"neck",leftEye:"head",rightEye:"head",jaw:"head",leftUpperLeg:"hips",leftLowerLeg:"leftUpperLeg",leftFoot:"leftLowerLeg",leftToes:"leftFoot",rightUpperLeg:"hips",rightLowerLeg:"rightUpperLeg",rightFoot:"rightLowerLeg",rightToes:"rightFoot",leftShoulder:"upperChest",leftUpperArm:"leftShoulder",leftLowerArm:"leftUpperArm",leftHand:"leftLowerArm",rightShoulder:"upperChest",rightUpperArm:"rightShoulder",rightLowerArm:"rightUpperArm",rightHand:"rightLowerArm",leftThumbMetacarpal:"leftHand",leftThumbProximal:"leftThumbMetacarpal",leftThumbDistal:"leftThumbProximal",leftIndexProximal:"leftHand",leftIndexIntermediate:"leftIndexProximal",leftIndexDistal:"leftIndexIntermediate",leftMiddleProximal:"leftHand",leftMiddleIntermediate:"leftMiddleProximal",leftMiddleDistal:"leftMiddleIntermediate",leftRingProximal:"leftHand",leftRingIntermediate:"leftRingProximal",leftRingDistal:"leftRingIntermediate",leftLittleProximal:"leftHand",leftLittleIntermediate:"leftLittleProximal",leftLittleDistal:"leftLittleIntermediate",rightThumbMetacarpal:"rightHand",rightThumbProximal:"rightThumbMetacarpal",rightThumbDistal:"rightThumbProximal",rightIndexProximal:"rightHand",rightIndexIntermediate:"rightIndexProximal",rightIndexDistal:"rightIndexIntermediate",rightMiddleProximal:"rightHand",rightMiddleIntermediate:"rightMiddleProximal",rightMiddleDistal:"rightMiddleIntermediate",rightRingProximal:"rightHand",rightRingIntermediate:"rightRingProximal",rightRingDistal:"rightRingIntermediate",rightLittleProximal:"rightHand",rightLittleIntermediate:"rightLittleProximal",rightLittleDistal:"rightLittleIntermediate"};function Xn(e){return e.invert?e.invert():e.inverse(),e}var Z=new g,J=new w,Ze=class{constructor(e){this.humanBones=e,this.restPose=this.getAbsolutePose()}getAbsolutePose(){const e={};return Object.keys(this.humanBones).forEach(t=>{const n=t,i=this.getBoneNode(n);i&&(Z.copy(i.position),J.copy(i.quaternion),e[n]={position:Z.toArray(),rotation:J.toArray()})}),e}getPose(){const e={};return Object.keys(this.humanBones).forEach(t=>{const n=t,i=this.getBoneNode(n);if(!i)return;Z.set(0,0,0),J.identity();const r=this.restPose[n];r!=null&&r.position&&Z.fromArray(r.position).negate(),r!=null&&r.rotation&&Xn(J.fromArray(r.rotation)),Z.add(i.position),J.premultiply(i.quaternion),e[n]={position:Z.toArray(),rotation:J.toArray()}}),e}setPose(e){Object.entries(e).forEach(([t,n])=>{const i=t,r=this.getBoneNode(i);if(!r)return;const o=this.restPose[i];o&&(n!=null&&n.position&&(r.position.fromArray(n.position),o.position&&r.position.add(Z.fromArray(o.position))),n!=null&&n.rotation&&(r.quaternion.fromArray(n.rotation),o.rotation&&r.quaternion.multiply(J.fromArray(o.rotation))))})}resetPose(){Object.entries(this.restPose).forEach(([e,t])=>{const n=this.getBoneNode(e);n&&(t!=null&&t.position&&n.position.fromArray(t.position),t!=null&&t.rotation&&n.quaternion.fromArray(t.rotation))})}getBone(e){var t;return(t=this.humanBones[e])!=null?t:void 0}getBoneNode(e){var t,n;return(n=(t=this.humanBones[e])==null?void 0:t.node)!=null?n:null}},Fe=new g,er=new w,tr=new g,nn=class Gn extends Ze{static _setupTransforms(t){const n=new Le;n.name="VRMHumanoidRig";const i={},r={},o={};Be.forEach(l=>{var s;const u=t.getBoneNode(l);if(u){const c=new g,d=new w;u.updateWorldMatrix(!0,!1),u.matrixWorld.decompose(c,d,Fe),i[l]=c,r[l]=u.quaternion.clone();const h=new w;(s=u.parent)==null||s.matrixWorld.decompose(Fe,h,Fe),o[l]=h}});const a={};return Be.forEach(l=>{var s;const u=t.getBoneNode(l);if(u){const c=i[l];let d=l,h;for(;h==null&&(d=Ki[d],d!=null);)h=i[d];const p=new Le;p.name="Normalized_"+u.name,(d?(s=a[d])==null?void 0:s.node:n).add(p),p.position.copy(c),h&&p.position.sub(h),a[l]={node:p}}}),{rigBones:a,root:n,parentWorldRotations:o,boneRotations:r}}constructor(t){const{rigBones:n,root:i,parentWorldRotations:r,boneRotations:o}=Gn._setupTransforms(t);super(n),this.original=t,this.root=i,this._parentWorldRotations=r,this._boneRotations=o}update(){Be.forEach(t=>{const n=this.original.getBoneNode(t);if(n!=null){const i=this.getBoneNode(t),r=this._parentWorldRotations[t],o=er.copy(r).invert(),a=this._boneRotations[t];if(n.quaternion.copy(i.quaternion).multiply(r).premultiply(o).multiply(a),t==="hips"){const l=i.getWorldPosition(tr);n.parent.updateWorldMatrix(!0,!1);const s=n.parent.matrixWorld,u=l.applyMatrix4(s.invert());n.position.copy(u)}}})}},rn=class Yn{get restPose(){return console.warn("VRMHumanoid: restPose is deprecated. Use either rawRestPose or normalizedRestPose instead."),this.rawRestPose}get rawRestPose(){return this._rawHumanBones.restPose}get normalizedRestPose(){return this._normalizedHumanBones.restPose}get humanBones(){return this._rawHumanBones.humanBones}get rawHumanBones(){return this._rawHumanBones.humanBones}get normalizedHumanBones(){return this._normalizedHumanBones.humanBones}get normalizedHumanBonesRoot(){return this._normalizedHumanBones.root}constructor(t,n){var i;this.autoUpdateHumanBones=(i=n==null?void 0:n.autoUpdateHumanBones)!=null?i:!0,this._rawHumanBones=new Ze(t),this._normalizedHumanBones=new nn(this._rawHumanBones)}copy(t){return this.autoUpdateHumanBones=t.autoUpdateHumanBones,this._rawHumanBones=new Ze(t.humanBones),this._normalizedHumanBones=new nn(this._rawHumanBones),this}clone(){return new Yn(this.humanBones,{autoUpdateHumanBones:this.autoUpdateHumanBones}).copy(this)}getAbsolutePose(){return console.warn("VRMHumanoid: getAbsolutePose() is deprecated. Use either getRawAbsolutePose() or getNormalizedAbsolutePose() instead."),this.getRawAbsolutePose()}getRawAbsolutePose(){return this._rawHumanBones.getAbsolutePose()}getNormalizedAbsolutePose(){return this._normalizedHumanBones.getAbsolutePose()}getPose(){return console.warn("VRMHumanoid: getPose() is deprecated. Use either getRawPose() or getNormalizedPose() instead."),this.getRawPose()}getRawPose(){return this._rawHumanBones.getPose()}getNormalizedPose(){return this._normalizedHumanBones.getPose()}setPose(t){return console.warn("VRMHumanoid: setPose() is deprecated. Use either setRawPose() or setNormalizedPose() instead."),this.setRawPose(t)}setRawPose(t){return this._rawHumanBones.setPose(t)}setNormalizedPose(t){return this._normalizedHumanBones.setPose(t)}resetPose(){return console.warn("VRMHumanoid: resetPose() is deprecated. Use either resetRawPose() or resetNormalizedPose() instead."),this.resetRawPose()}resetRawPose(){return this._rawHumanBones.resetPose()}resetNormalizedPose(){return this._normalizedHumanBones.resetPose()}getBone(t){return console.warn("VRMHumanoid: getBone() is deprecated. Use either getRawBone() or getNormalizedBone() instead."),this.getRawBone(t)}getRawBone(t){return this._rawHumanBones.getBone(t)}getNormalizedBone(t){return this._normalizedHumanBones.getBone(t)}getBoneNode(t){return console.warn("VRMHumanoid: getBoneNode() is deprecated. Use either getRawBoneNode() or getNormalizedBoneNode() instead."),this.getRawBoneNode(t)}getRawBoneNode(t){return this._rawHumanBones.getBoneNode(t)}getNormalizedBoneNode(t){return this._normalizedHumanBones.getBoneNode(t)}update(){this.autoUpdateHumanBones&&this._normalizedHumanBones.update()}},nr={Hips:"hips",Spine:"spine",Head:"head",LeftUpperLeg:"leftUpperLeg",LeftLowerLeg:"leftLowerLeg",LeftFoot:"leftFoot",RightUpperLeg:"rightUpperLeg",RightLowerLeg:"rightLowerLeg",RightFoot:"rightFoot",LeftUpperArm:"leftUpperArm",LeftLowerArm:"leftLowerArm",LeftHand:"leftHand",RightUpperArm:"rightUpperArm",RightLowerArm:"rightLowerArm",RightHand:"rightHand"},ir=new Set(["1.0","1.0-beta"]),on={leftThumbProximal:"leftThumbMetacarpal",leftThumbIntermediate:"leftThumbProximal",rightThumbProximal:"rightThumbMetacarpal",rightThumbIntermediate:"rightThumbProximal"},rr=class{get name(){return"VRMHumanoidLoaderPlugin"}constructor(e,t){this.parser=e,this.helperRoot=t==null?void 0:t.helperRoot,this.autoUpdateHumanBones=t==null?void 0:t.autoUpdateHumanBones}afterRoot(e){return E(this,null,function*(){e.userData.vrmHumanoid=yield this._import(e)})}_import(e){return E(this,null,function*(){const t=yield this._v1Import(e);if(t)return t;const n=yield this._v0Import(e);return n||null})}_v1Import(e){return E(this,null,function*(){var t,n;const i=this.parser.json;if(!(((t=i.extensionsUsed)==null?void 0:t.indexOf("VRMC_vrm"))!==-1))return null;const o=(n=i.extensions)==null?void 0:n.VRMC_vrm;if(!o)return null;const a=o.specVersion;if(!ir.has(a))return console.warn(`VRMHumanoidLoaderPlugin: Unknown VRMC_vrm specVersion "${a}"`),null;const l=o.humanoid;if(!l)return null;const s=l.humanBones.leftThumbIntermediate!=null||l.humanBones.rightThumbIntermediate!=null,u={};l.humanBones!=null&&(yield Promise.all(Object.entries(l.humanBones).map(d=>E(this,[d],function*([h,p]){let m=h;const f=p.node;if(s){const v=on[m];v!=null&&(m=v)}const _=yield this.parser.getDependency("node",f);if(_==null){console.warn(`A glTF node bound to the humanoid bone ${m} (index = ${f}) does not exist`);return}u[m]={node:_}}))));const c=new rn(this._ensureRequiredBonesExist(u),{autoUpdateHumanBones:this.autoUpdateHumanBones});if(e.scene.add(c.normalizedHumanBonesRoot),this.helperRoot){const d=new tn(c);this.helperRoot.add(d),d.renderOrder=this.helperRoot.renderOrder}return c})}_v0Import(e){return E(this,null,function*(){var t;const i=(t=this.parser.json.extensions)==null?void 0:t.VRM;if(!i)return null;const r=i.humanoid;if(!r)return null;const o={};r.humanBones!=null&&(yield Promise.all(r.humanBones.map(l=>E(this,null,function*(){const s=l.bone,u=l.node;if(s==null||u==null)return;if(u<0){console.warn(`A glTF node index for the humanoid bone ${s} is negative (${u}), ignoring this bone.`);return}const c=yield this.parser.getDependency("node",u);if(c==null){console.warn(`A glTF node bound to the humanoid bone ${s} (index = ${u}) does not exist`);return}const d=on[s],h=d??s;if(o[h]!=null){console.warn(`Multiple bone entries for ${h} detected (index = ${u}), ignoring duplicated entries.`);return}o[h]={node:c}}))));const a=new rn(this._ensureRequiredBonesExist(o),{autoUpdateHumanBones:this.autoUpdateHumanBones});if(e.scene.add(a.normalizedHumanBonesRoot),this.helperRoot){const l=new tn(a);this.helperRoot.add(l),l.renderOrder=this.helperRoot.renderOrder}return a})}_ensureRequiredBonesExist(e){const t=Object.values(nr).filter(n=>e[n]==null);if(t.length>0)throw new Error(`VRMHumanoidLoaderPlugin: These humanoid bones are required but not exist: ${t.join(", ")}`);return e}},sn=class extends G{constructor(){super(),this._currentTheta=0,this._currentRadius=0,this.theta=0,this.radius=0,this._currentTheta=0,this._currentRadius=0,this._attrPos=new U(new Float32Array(195),3),this.setAttribute("position",this._attrPos),this._attrIndex=new U(new Uint16Array(189),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;this._currentTheta!==this.theta&&(this._currentTheta=this.theta,e=!0),this._currentRadius!==this.radius&&(this._currentRadius=this.radius,e=!0),e&&this._buildPosition()}_buildPosition(){this._attrPos.setXYZ(0,0,0,0);for(let e=0;e<64;e++){const t=e/63*this._currentTheta;this._attrPos.setXYZ(e+1,this._currentRadius*Math.sin(t),0,this._currentRadius*Math.cos(t))}this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<63;e++)this._attrIndex.setXYZ(e*3,0,e+1,e+2);this._attrIndex.needsUpdate=!0}},or=class extends G{constructor(){super(),this.radius=0,this._currentRadius=0,this.tail=new g,this._currentTail=new g,this._attrPos=new U(new Float32Array(294),3),this.setAttribute("position",this._attrPos),this._attrIndex=new U(new Uint16Array(194),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;this._currentRadius!==this.radius&&(this._currentRadius=this.radius,e=!0),this._currentTail.equals(this.tail)||(this._currentTail.copy(this.tail),e=!0),e&&this._buildPosition()}_buildPosition(){for(let e=0;e<32;e++){const t=e/16*Math.PI;this._attrPos.setXYZ(e,Math.cos(t),Math.sin(t),0),this._attrPos.setXYZ(32+e,0,Math.cos(t),Math.sin(t)),this._attrPos.setXYZ(64+e,Math.sin(t),0,Math.cos(t))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.setXYZ(96,0,0,0),this._attrPos.setXYZ(97,this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<32;e++){const t=(e+1)%32;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(64+e*2,32+e,32+t),this._attrIndex.setXY(128+e*2,64+e,64+t)}this._attrIndex.setXY(192,96,97),this._attrIndex.needsUpdate=!0}},Te=new w,an=new w,pe=new g,ln=new g,un=Math.sqrt(2)/2,sr=new w(0,0,-un,un),ar=new g(0,1,0),lr=class extends te{constructor(e){super(),this.matrixAutoUpdate=!1,this.vrmLookAt=e;{const t=new sn;t.radius=.5;const n=new kt({color:65280,transparent:!0,opacity:.5,side:Wt,depthTest:!1,depthWrite:!1});this._meshPitch=new zt(t,n),this.add(this._meshPitch)}{const t=new sn;t.radius=.5;const n=new kt({color:16711680,transparent:!0,opacity:.5,side:Wt,depthTest:!1,depthWrite:!1});this._meshYaw=new zt(t,n),this.add(this._meshYaw)}{const t=new or;t.radius=.1;const n=new Ne({color:16777215,depthTest:!1,depthWrite:!1});this._lineTarget=new rt(t,n),this._lineTarget.frustumCulled=!1,this.add(this._lineTarget)}}dispose(){this._meshYaw.geometry.dispose(),this._meshYaw.material.dispose(),this._meshPitch.geometry.dispose(),this._meshPitch.material.dispose(),this._lineTarget.geometry.dispose(),this._lineTarget.material.dispose()}updateMatrixWorld(e){const t=b.DEG2RAD*this.vrmLookAt.yaw;this._meshYaw.geometry.theta=t,this._meshYaw.geometry.update();const n=b.DEG2RAD*this.vrmLookAt.pitch;this._meshPitch.geometry.theta=n,this._meshPitch.geometry.update(),this.vrmLookAt.getLookAtWorldPosition(pe),this.vrmLookAt.getLookAtWorldQuaternion(Te),Te.multiply(this.vrmLookAt.getFaceFrontQuaternion(an)),this._meshYaw.position.copy(pe),this._meshYaw.quaternion.copy(Te),this._meshPitch.position.copy(pe),this._meshPitch.quaternion.copy(Te),this._meshPitch.quaternion.multiply(an.setFromAxisAngle(ar,t)),this._meshPitch.quaternion.multiply(sr);const{target:i,autoUpdate:r}=this.vrmLookAt;i!=null&&r&&(i.getWorldPosition(ln).sub(pe),this._lineTarget.geometry.tail.copy(ln),this._lineTarget.geometry.update(),this._lineTarget.position.copy(pe)),super.updateMatrixWorld(e)}},ur=new g,dr=new g;function Je(e,t){return e.matrixWorld.decompose(ur,t,dr),t}function Ee(e){return[Math.atan2(-e.z,e.x),Math.atan2(e.y,Math.sqrt(e.x*e.x+e.z*e.z))]}function dn(e){const t=Math.round(e/2/Math.PI);return e-2*Math.PI*t}var cn=new g(0,0,1),cr=new g,hr=new g,pr=new g,fr=new w,He=new w,hn=new w,mr=new w,ke=new it,qn=class Qn{constructor(t,n){this.offsetFromHeadBone=new g,this.autoUpdate=!0,this.faceFront=new g(0,0,1),this.humanoid=t,this.applier=n,this._yaw=0,this._pitch=0,this._needsUpdate=!0,this._restHeadWorldQuaternion=this.getLookAtWorldQuaternion(new w)}get yaw(){return this._yaw}set yaw(t){this._yaw=t,this._needsUpdate=!0}get pitch(){return this._pitch}set pitch(t){this._pitch=t,this._needsUpdate=!0}get euler(){return console.warn("VRMLookAt: euler is deprecated. use getEuler() instead."),this.getEuler(new it)}getEuler(t){return t.set(b.DEG2RAD*this._pitch,b.DEG2RAD*this._yaw,0,"YXZ")}copy(t){if(this.humanoid!==t.humanoid)throw new Error("VRMLookAt: humanoid must be same in order to copy");return this.offsetFromHeadBone.copy(t.offsetFromHeadBone),this.applier=t.applier,this.autoUpdate=t.autoUpdate,this.target=t.target,this.faceFront.copy(t.faceFront),this}clone(){return new Qn(this.humanoid,this.applier).copy(this)}reset(){this._yaw=0,this._pitch=0,this._needsUpdate=!0}getLookAtWorldPosition(t){const n=this.humanoid.getRawBoneNode("head");return t.copy(this.offsetFromHeadBone).applyMatrix4(n.matrixWorld)}getLookAtWorldQuaternion(t){const n=this.humanoid.getRawBoneNode("head");return Je(n,t)}getFaceFrontQuaternion(t){if(this.faceFront.distanceToSquared(cn)<.01)return t.copy(this._restHeadWorldQuaternion).invert();const[n,i]=Ee(this.faceFront);return ke.set(0,.5*Math.PI+n,i,"YZX"),t.setFromEuler(ke).premultiply(mr.copy(this._restHeadWorldQuaternion).invert())}getLookAtWorldDirection(t){return this.getLookAtWorldQuaternion(He),this.getFaceFrontQuaternion(hn),t.copy(cn).applyQuaternion(He).applyQuaternion(hn).applyEuler(this.getEuler(ke))}lookAt(t){const n=fr.copy(this._restHeadWorldQuaternion).multiply(Xn(this.getLookAtWorldQuaternion(He))),i=this.getLookAtWorldPosition(hr),r=pr.copy(t).sub(i).applyQuaternion(n).normalize(),[o,a]=Ee(this.faceFront),[l,s]=Ee(r),u=dn(l-o),c=dn(a-s);this._yaw=b.RAD2DEG*u,this._pitch=b.RAD2DEG*c,this._needsUpdate=!0}update(t){this.target!=null&&this.autoUpdate&&this.lookAt(this.target.getWorldPosition(cr)),this._needsUpdate&&(this._needsUpdate=!1,this.applier.applyYawPitch(this._yaw,this._pitch))}};qn.EULER_ORDER="YXZ";var _r=qn,gr=new g(0,0,1),H=new w,ie=new w,V=new it(0,0,0,"YXZ"),Ae=class{constructor(e,t,n,i,r){this.humanoid=e,this.rangeMapHorizontalInner=t,this.rangeMapHorizontalOuter=n,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r,this.faceFront=new g(0,0,1),this._restQuatLeftEye=new w,this._restQuatRightEye=new w,this._restLeftEyeParentWorldQuat=new w,this._restRightEyeParentWorldQuat=new w;const o=this.humanoid.getRawBoneNode("leftEye"),a=this.humanoid.getRawBoneNode("rightEye");o&&(this._restQuatLeftEye.copy(o.quaternion),Je(o.parent,this._restLeftEyeParentWorldQuat)),a&&(this._restQuatRightEye.copy(a.quaternion),Je(a.parent,this._restRightEyeParentWorldQuat))}applyYawPitch(e,t){const n=this.humanoid.getRawBoneNode("leftEye"),i=this.humanoid.getRawBoneNode("rightEye"),r=this.humanoid.getNormalizedBoneNode("leftEye"),o=this.humanoid.getNormalizedBoneNode("rightEye");n&&(t<0?V.x=-b.DEG2RAD*this.rangeMapVerticalDown.map(-t):V.x=b.DEG2RAD*this.rangeMapVerticalUp.map(t),e<0?V.y=-b.DEG2RAD*this.rangeMapHorizontalInner.map(-e):V.y=b.DEG2RAD*this.rangeMapHorizontalOuter.map(e),H.setFromEuler(V),this._getWorldFaceFrontQuat(ie),r.quaternion.copy(ie).multiply(H).multiply(ie.invert()),H.copy(this._restLeftEyeParentWorldQuat),n.quaternion.copy(r.quaternion).multiply(H).premultiply(H.invert()).multiply(this._restQuatLeftEye)),i&&(t<0?V.x=-b.DEG2RAD*this.rangeMapVerticalDown.map(-t):V.x=b.DEG2RAD*this.rangeMapVerticalUp.map(t),e<0?V.y=-b.DEG2RAD*this.rangeMapHorizontalOuter.map(-e):V.y=b.DEG2RAD*this.rangeMapHorizontalInner.map(e),H.setFromEuler(V),this._getWorldFaceFrontQuat(ie),o.quaternion.copy(ie).multiply(H).multiply(ie.invert()),H.copy(this._restRightEyeParentWorldQuat),i.quaternion.copy(o.quaternion).multiply(H).premultiply(H.invert()).multiply(this._restQuatRightEye))}lookAt(e){console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");const t=b.RAD2DEG*e.y,n=b.RAD2DEG*e.x;this.applyYawPitch(t,n)}_getWorldFaceFrontQuat(e){if(this.faceFront.distanceToSquared(gr)<.01)return e.identity();const[t,n]=Ee(this.faceFront);return V.set(0,.5*Math.PI+t,n,"YZX"),e.setFromEuler(V)}};Ae.type="bone";var Ke=class{constructor(e,t,n,i,r){this.expressions=e,this.rangeMapHorizontalInner=t,this.rangeMapHorizontalOuter=n,this.rangeMapVerticalDown=i,this.rangeMapVerticalUp=r}applyYawPitch(e,t){t<0?(this.expressions.setValue("lookDown",0),this.expressions.setValue("lookUp",this.rangeMapVerticalUp.map(-t))):(this.expressions.setValue("lookUp",0),this.expressions.setValue("lookDown",this.rangeMapVerticalDown.map(t))),e<0?(this.expressions.setValue("lookLeft",0),this.expressions.setValue("lookRight",this.rangeMapHorizontalOuter.map(-e))):(this.expressions.setValue("lookRight",0),this.expressions.setValue("lookLeft",this.rangeMapHorizontalOuter.map(e)))}lookAt(e){console.warn("VRMLookAtBoneApplier: lookAt() is deprecated. use apply() instead.");const t=b.RAD2DEG*e.y,n=b.RAD2DEG*e.x;this.applyYawPitch(t,n)}};Ke.type="expression";var pn=class{constructor(e,t){this.inputMaxValue=e,this.outputScale=t}map(e){return this.outputScale*Dn(e/this.inputMaxValue)}},vr=new Set(["1.0","1.0-beta"]),Re=.01,Mr=class{get name(){return"VRMLookAtLoaderPlugin"}constructor(e,t){this.parser=e,this.helperRoot=t==null?void 0:t.helperRoot}afterRoot(e){return E(this,null,function*(){const t=e.userData.vrmHumanoid;if(t===null)return;if(t===void 0)throw new Error("VRMLookAtLoaderPlugin: vrmHumanoid is undefined. VRMHumanoidLoaderPlugin have to be used first");const n=e.userData.vrmExpressionManager;if(n!==null){if(n===void 0)throw new Error("VRMLookAtLoaderPlugin: vrmExpressionManager is undefined. VRMExpressionLoaderPlugin have to be used first");e.userData.vrmLookAt=yield this._import(e,t,n)}})}_import(e,t,n){return E(this,null,function*(){if(t==null||n==null)return null;const i=yield this._v1Import(e,t,n);if(i)return i;const r=yield this._v0Import(e,t,n);return r||null})}_v1Import(e,t,n){return E(this,null,function*(){var i,r,o;const a=this.parser.json;if(!(((i=a.extensionsUsed)==null?void 0:i.indexOf("VRMC_vrm"))!==-1))return null;const s=(r=a.extensions)==null?void 0:r.VRMC_vrm;if(!s)return null;const u=s.specVersion;if(!vr.has(u))return console.warn(`VRMLookAtLoaderPlugin: Unknown VRMC_vrm specVersion "${u}"`),null;const c=s.lookAt;if(!c)return null;const d=c.type==="expression"?1:10,h=this._v1ImportRangeMap(c.rangeMapHorizontalInner,d),p=this._v1ImportRangeMap(c.rangeMapHorizontalOuter,d),m=this._v1ImportRangeMap(c.rangeMapVerticalDown,d),f=this._v1ImportRangeMap(c.rangeMapVerticalUp,d);let _;c.type==="expression"?_=new Ke(n,h,p,m,f):_=new Ae(t,h,p,m,f);const v=this._importLookAt(t,_);return v.offsetFromHeadBone.fromArray((o=c.offsetFromHeadBone)!=null?o:[0,.06,0]),v})}_v1ImportRangeMap(e,t){var n,i;let r=(n=e==null?void 0:e.inputMaxValue)!=null?n:90;const o=(i=e==null?void 0:e.outputScale)!=null?i:t;return r<Re&&(console.warn("VRMLookAtLoaderPlugin: inputMaxValue of a range map is too small. Consider reviewing the range map!"),r=Re),new pn(r,o)}_v0Import(e,t,n){return E(this,null,function*(){var i,r,o,a;const s=(i=this.parser.json.extensions)==null?void 0:i.VRM;if(!s)return null;const u=s.firstPerson;if(!u)return null;const c=u.lookAtTypeName==="BlendShape"?1:10,d=this._v0ImportDegreeMap(u.lookAtHorizontalInner,c),h=this._v0ImportDegreeMap(u.lookAtHorizontalOuter,c),p=this._v0ImportDegreeMap(u.lookAtVerticalDown,c),m=this._v0ImportDegreeMap(u.lookAtVerticalUp,c);let f;u.lookAtTypeName==="BlendShape"?f=new Ke(n,d,h,p,m):f=new Ae(t,d,h,p,m);const _=this._importLookAt(t,f);return u.firstPersonBoneOffset?_.offsetFromHeadBone.set((r=u.firstPersonBoneOffset.x)!=null?r:0,(o=u.firstPersonBoneOffset.y)!=null?o:.06,-((a=u.firstPersonBoneOffset.z)!=null?a:0)):_.offsetFromHeadBone.set(0,.06,0),_.faceFront.set(0,0,-1),f instanceof Ae&&f.faceFront.set(0,0,-1),_})}_v0ImportDegreeMap(e,t){var n,i;const r=e==null?void 0:e.curve;JSON.stringify(r)!=="[0,0,0,1,1,1,1,0]"&&console.warn("Curves of LookAtDegreeMap defined in VRM 0.0 are not supported");let o=(n=e==null?void 0:e.xRange)!=null?n:90;const a=(i=e==null?void 0:e.yRange)!=null?i:t;return o<Re&&(console.warn("VRMLookAtLoaderPlugin: xRange of a degree map is too small. Consider reviewing the degree map!"),o=Re),new pn(o,a)}_importLookAt(e,t){const n=new _r(e,t);if(this.helperRoot){const i=new lr(n);this.helperRoot.add(i),i.renderOrder=this.helperRoot.renderOrder}return n}};function xr(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}var yr=new Set(["1.0","1.0-beta"]),wr=class{get name(){return"VRMMetaLoaderPlugin"}constructor(e,t){var n,i,r;this.parser=e,this.needThumbnailImage=(n=t==null?void 0:t.needThumbnailImage)!=null?n:!1,this.acceptLicenseUrls=(i=t==null?void 0:t.acceptLicenseUrls)!=null?i:["https://vrm.dev/licenses/1.0/"],this.acceptV0Meta=(r=t==null?void 0:t.acceptV0Meta)!=null?r:!0}afterRoot(e){return E(this,null,function*(){e.userData.vrmMeta=yield this._import(e)})}_import(e){return E(this,null,function*(){const t=yield this._v1Import(e);if(t!=null)return t;const n=yield this._v0Import(e);return n??null})}_v1Import(e){return E(this,null,function*(){var t,n,i;const r=this.parser.json;if(!(((t=r.extensionsUsed)==null?void 0:t.indexOf("VRMC_vrm"))!==-1))return null;const a=(n=r.extensions)==null?void 0:n.VRMC_vrm;if(a==null)return null;const l=a.specVersion;if(!yr.has(l))return console.warn(`VRMMetaLoaderPlugin: Unknown VRMC_vrm specVersion "${l}"`),null;const s=a.meta;if(!s)return null;const u=s.licenseUrl;if(!new Set(this.acceptLicenseUrls).has(u))throw new Error(`VRMMetaLoaderPlugin: The license url "${u}" is not accepted`);let d;return this.needThumbnailImage&&s.thumbnailImage!=null&&(d=(i=yield this._extractGLTFImage(s.thumbnailImage))!=null?i:void 0),{metaVersion:"1",name:s.name,version:s.version,authors:s.authors,copyrightInformation:s.copyrightInformation,contactInformation:s.contactInformation,references:s.references,thirdPartyLicenses:s.thirdPartyLicenses,thumbnailImage:d,licenseUrl:s.licenseUrl,avatarPermission:s.avatarPermission,allowExcessivelyViolentUsage:s.allowExcessivelyViolentUsage,allowExcessivelySexualUsage:s.allowExcessivelySexualUsage,commercialUsage:s.commercialUsage,allowPoliticalOrReligiousUsage:s.allowPoliticalOrReligiousUsage,allowAntisocialOrHateUsage:s.allowAntisocialOrHateUsage,creditNotation:s.creditNotation,allowRedistribution:s.allowRedistribution,modification:s.modification,otherLicenseUrl:s.otherLicenseUrl}})}_v0Import(e){return E(this,null,function*(){var t;const i=(t=this.parser.json.extensions)==null?void 0:t.VRM;if(!i)return null;const r=i.meta;if(!r)return null;if(!this.acceptV0Meta)throw new Error("VRMMetaLoaderPlugin: Attempted to load VRM0.0 meta but acceptV0Meta is false");let o;return this.needThumbnailImage&&r.texture!=null&&r.texture!==-1&&(o=yield this.parser.getDependency("texture",r.texture)),{metaVersion:"0",allowedUserName:r.allowedUserName,author:r.author,commercialUssageName:r.commercialUssageName,contactInformation:r.contactInformation,licenseName:r.licenseName,otherLicenseUrl:r.otherLicenseUrl,otherPermissionUrl:r.otherPermissionUrl,reference:r.reference,sexualUssageName:r.sexualUssageName,texture:o??void 0,title:r.title,version:r.version,violentUssageName:r.violentUssageName}})}_extractGLTFImage(e){return E(this,null,function*(){var t;const i=(t=this.parser.json.images)==null?void 0:t[e];if(i==null)return console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${e}] of glTF as a thumbnail but the image doesn't exist`),null;let r=i.uri;if(i.bufferView!=null){const a=yield this.parser.getDependency("bufferView",i.bufferView),l=new Blob([a],{type:i.mimeType});r=URL.createObjectURL(l)}return r==null?(console.warn(`VRMMetaLoaderPlugin: Attempt to use images[${e}] of glTF as a thumbnail but the image couldn't load properly`),null):yield new Di().loadAsync(xr(r,this.parser.options.path)).catch(a=>(console.error(a),console.warn("VRMMetaLoaderPlugin: Failed to load a thumbnail image"),null))})}},Tr=class{constructor(e){this.scene=e.scene,this.meta=e.meta,this.humanoid=e.humanoid,this.expressionManager=e.expressionManager,this.firstPerson=e.firstPerson,this.lookAt=e.lookAt}update(e){this.humanoid.update(),this.lookAt&&this.lookAt.update(e),this.expressionManager&&this.expressionManager.update()}},Rr=class extends Tr{constructor(e){super(e),this.materials=e.materials,this.springBoneManager=e.springBoneManager,this.nodeConstraintManager=e.nodeConstraintManager}update(e){super.update(e),this.nodeConstraintManager&&this.nodeConstraintManager.update(),this.springBoneManager&&this.springBoneManager.update(e),this.materials&&this.materials.forEach(t=>{t.update&&t.update(e)})}},Sr=Object.defineProperty,fn=Object.getOwnPropertySymbols,Er=Object.prototype.hasOwnProperty,Ar=Object.prototype.propertyIsEnumerable,mn=(e,t,n)=>t in e?Sr(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,_n=(e,t)=>{for(var n in t||(t={}))Er.call(t,n)&&mn(e,n,t[n]);if(fn)for(var n of fn(t))Ar.call(t,n)&&mn(e,n,t[n]);return e},ee=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())}),Pr={"":3e3,srgb:3001};function Lr(e,t){parseInt(be,10)>=152?e.colorSpace=t:e.encoding=Pr[t]}var br=class{get pending(){return Promise.all(this._pendings)}constructor(e,t){this._parser=e,this._materialParams=t,this._pendings=[]}assignPrimitive(e,t){t!=null&&(this._materialParams[e]=t)}assignColor(e,t,n){if(t!=null){const i=new D().fromArray(t);n&&i.convertSRGBToLinear(),this._materialParams[e]=i}}assignTexture(e,t,n){return ee(this,null,function*(){const i=ee(this,null,function*(){if(t!=null){const r=yield this._parser.assignTexture(this._materialParams,e,t);if(r==null){console.warn("GLTFMToonMaterialParamsAssignHelper: Failed to load texture. The rendering result may be wrong");return}n&&Lr(r,"srgb")}});return this._pendings.push(i),i})}assignTextureByIndex(e,t,n){return ee(this,null,function*(){return this.assignTexture(e,t!=null?{index:t}:void 0,n)})}},Ir=`// #define PHONG

varying vec3 vViewPosition;

#ifndef FLAT_SHADED
  varying vec3 vNormal;
#endif

#include <common>

// #include <uv_pars_vertex>
#ifdef MTOON_USE_UV
  varying vec2 vUv;

  // COMPAT: pre-r151 uses a common uvTransform
  #if THREE_VRM_THREE_REVISION < 151
    uniform mat3 uvTransform;
  #endif
#endif

// #include <uv2_pars_vertex>
// COMAPT: pre-r151 uses uv2 for lightMap and aoMap
#if THREE_VRM_THREE_REVISION < 151
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    attribute vec2 uv2;
    varying vec2 vUv2;
    uniform mat3 uv2Transform;
  #endif
#endif

// #include <displacementmap_pars_vertex>
// #include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
  uniform sampler2D outlineWidthMultiplyTexture;
  uniform mat3 outlineWidthMultiplyTextureUvTransform;
#endif

uniform float outlineWidthFactor;

void main() {

  // #include <uv_vertex>
  #ifdef MTOON_USE_UV
    // COMPAT: pre-r151 uses a common uvTransform
    #if THREE_VRM_THREE_REVISION >= 151
      vUv = uv;
    #else
      vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
    #endif
  #endif

  // #include <uv2_vertex>
  // COMAPT: pre-r151 uses uv2 for lightMap and aoMap
  #if THREE_VRM_THREE_REVISION < 151
    #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
      vUv2 = ( uv2Transform * vec3( uv2, 1 ) ).xy;
    #endif
  #endif

  #include <color_vertex>

  #include <beginnormal_vertex>
  #include <morphnormal_vertex>
  #include <skinbase_vertex>
  #include <skinnormal_vertex>

  // we need this to compute the outline properly
  objectNormal = normalize( objectNormal );

  #include <defaultnormal_vertex>

  #ifndef FLAT_SHADED // Normal computed with derivatives when FLAT_SHADED
    vNormal = normalize( transformedNormal );
  #endif

  #include <begin_vertex>

  #include <morphtarget_vertex>
  #include <skinning_vertex>
  // #include <displacementmap_vertex>
  #include <project_vertex>
  #include <logdepthbuf_vertex>
  #include <clipping_planes_vertex>

  vViewPosition = - mvPosition.xyz;

  #ifdef OUTLINE
    float worldNormalLength = length( transformedNormal );
    vec3 outlineOffset = outlineWidthFactor * worldNormalLength * objectNormal;

    #ifdef USE_OUTLINEWIDTHMULTIPLYTEXTURE
      vec2 outlineWidthMultiplyTextureUv = ( outlineWidthMultiplyTextureUvTransform * vec3( vUv, 1 ) ).xy;
      float outlineTex = texture2D( outlineWidthMultiplyTexture, outlineWidthMultiplyTextureUv ).g;
      outlineOffset *= outlineTex;
    #endif

    #ifdef OUTLINE_WIDTH_SCREEN
      outlineOffset *= vViewPosition.z / projectionMatrix[ 1 ].y;
    #endif

    gl_Position = projectionMatrix * modelViewMatrix * vec4( outlineOffset + transformed, 1.0 );

    gl_Position.z += 1E-6 * gl_Position.w; // anti-artifact magic
  #endif

  #include <worldpos_vertex>
  // #include <envmap_vertex>
  #include <shadowmap_vertex>
  #include <fog_vertex>

}`,Or=`// #define PHONG

uniform vec3 litFactor;

uniform float opacity;

uniform vec3 shadeColorFactor;
#ifdef USE_SHADEMULTIPLYTEXTURE
  uniform sampler2D shadeMultiplyTexture;
  uniform mat3 shadeMultiplyTextureUvTransform;
#endif

uniform float shadingShiftFactor;
uniform float shadingToonyFactor;

#ifdef USE_SHADINGSHIFTTEXTURE
  uniform sampler2D shadingShiftTexture;
  uniform mat3 shadingShiftTextureUvTransform;
  uniform float shadingShiftTextureScale;
#endif

uniform float giEqualizationFactor;

uniform vec3 parametricRimColorFactor;
#ifdef USE_RIMMULTIPLYTEXTURE
  uniform sampler2D rimMultiplyTexture;
  uniform mat3 rimMultiplyTextureUvTransform;
#endif
uniform float rimLightingMixFactor;
uniform float parametricRimFresnelPowerFactor;
uniform float parametricRimLiftFactor;

#ifdef USE_MATCAPTEXTURE
  uniform vec3 matcapFactor;
  uniform sampler2D matcapTexture;
  uniform mat3 matcapTextureUvTransform;
#endif

uniform vec3 emissive;
uniform float emissiveIntensity;

uniform vec3 outlineColorFactor;
uniform float outlineLightingMixFactor;

#ifdef USE_UVANIMATIONMASKTEXTURE
  uniform sampler2D uvAnimationMaskTexture;
  uniform mat3 uvAnimationMaskTextureUvTransform;
#endif

uniform float uvAnimationScrollXOffset;
uniform float uvAnimationScrollYOffset;
uniform float uvAnimationRotationPhase;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>

// #include <uv_pars_fragment>
#if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
  varying vec2 vUv;
#endif

// #include <uv2_pars_fragment>
// COMAPT: pre-r151 uses uv2 for lightMap and aoMap
#if THREE_VRM_THREE_REVISION < 151
  #if defined( USE_LIGHTMAP ) || defined( USE_AOMAP )
    varying vec2 vUv2;
  #endif
#endif

#include <map_pars_fragment>

#ifdef USE_MAP
  uniform mat3 mapUvTransform;
#endif

// #include <alphamap_pars_fragment>

#include <alphatest_pars_fragment>

#include <aomap_pars_fragment>
// #include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>

#ifdef USE_EMISSIVEMAP
  uniform mat3 emissiveMapUvTransform;
#endif

// #include <envmap_common_pars_fragment>
// #include <envmap_pars_fragment>
// #include <cube_uv_reflection_fragment>
#include <fog_pars_fragment>

// #include <bsdfs>
// COMPAT: pre-r151 doesn't have BRDF_Lambert in <common>
#if THREE_VRM_THREE_REVISION < 151
  vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
    return RECIPROCAL_PI * diffuseColor;
  }
#endif

#include <lights_pars_begin>

#include <normal_pars_fragment>

// #include <lights_phong_pars_fragment>
varying vec3 vViewPosition;

struct MToonMaterial {
  vec3 diffuseColor;
  vec3 shadeColor;
  float shadingShift;
};

float linearstep( float a, float b, float t ) {
  return clamp( ( t - a ) / ( b - a ), 0.0, 1.0 );
}

/**
 * Convert NdotL into toon shading factor using shadingShift and shadingToony
 */
float getShading(
  const in float dotNL,
  const in float shadow,
  const in float shadingShift
) {
  float shading = dotNL;
  shading = shading + shadingShift;
  shading = linearstep( -1.0 + shadingToonyFactor, 1.0 - shadingToonyFactor, shading );
  shading *= shadow;
  return shading;
}

/**
 * Mix diffuseColor and shadeColor using shading factor and light color
 */
vec3 getDiffuse(
  const in MToonMaterial material,
  const in float shading,
  in vec3 lightColor
) {
  #ifdef DEBUG_LITSHADERATE
    return vec3( BRDF_Lambert( shading * lightColor ) );
  #endif

  vec3 col = lightColor * BRDF_Lambert( mix( material.shadeColor, material.diffuseColor, shading ) );

  // The "comment out if you want to PBR absolutely" line
  #ifdef V0_COMPAT_SHADE
    col = min( col, material.diffuseColor );
  #endif

  return col;
}

// COMPAT: pre-r156 uses a struct GeometricContext
#if THREE_VRM_THREE_REVISION >= 157
  void RE_Direct_MToon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {
    float dotNL = clamp( dot( geometryNormal, directLight.direction ), -1.0, 1.0 );
    vec3 irradiance = directLight.color;

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;

    irradiance *= dotNL;

    float shading = getShading( dotNL, shadow, material.shadingShift );

    // toon shaded diffuse
    reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );
  }

  void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {
    // indirect diffuse will use diffuseColor, no shadeColor involved
    reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;
  }
#else
  void RE_Direct_MToon( const in IncidentLight directLight, const in GeometricContext geometry, const in MToonMaterial material, const in float shadow, inout ReflectedLight reflectedLight ) {
    float dotNL = clamp( dot( geometry.normal, directLight.direction ), -1.0, 1.0 );
    vec3 irradiance = directLight.color;

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;

    irradiance *= dotNL;

    float shading = getShading( dotNL, shadow, material.shadingShift );

    // toon shaded diffuse
    reflectedLight.directDiffuse += getDiffuse( material, shading, directLight.color );
  }

  void RE_IndirectDiffuse_MToon( const in vec3 irradiance, const in GeometricContext geometry, const in MToonMaterial material, inout ReflectedLight reflectedLight ) {
    // indirect diffuse will use diffuseColor, no shadeColor involved
    reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

    // directSpecular will be used for rim lighting, not an actual specular
    reflectedLight.directSpecular += irradiance;
  }
#endif

#define RE_Direct RE_Direct_MToon
#define RE_IndirectDiffuse RE_IndirectDiffuse_MToon
#define Material_LightProbeLOD( material ) (0)

#include <shadowmap_pars_fragment>
// #include <bumpmap_pars_fragment>

// #include <normalmap_pars_fragment>
#ifdef USE_NORMALMAP

  uniform sampler2D normalMap;
  uniform mat3 normalMapUvTransform;
  uniform vec2 normalScale;

#endif

// COMPAT: pre-r151
// USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151
#if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )

  uniform mat3 normalMatrix;

#endif

// COMPAT: pre-r151
// USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( TANGENTSPACE_NORMALMAP ) )

  // Per-Pixel Tangent Space Normal Mapping
  // http://hacksoflife.blogspot.ch/2009/11/per-pixel-tangent-space-normal-mapping.html

  // three-vrm specific change: it requires \`uv\` as an input in order to support uv scrolls

  // Temporary compat against shader change @ Three.js r126, r151
  #if THREE_VRM_THREE_REVISION >= 151

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

  #else

    vec3 perturbNormal2Arb( vec2 uv, vec3 eye_pos, vec3 surf_norm, vec3 mapN, float faceDirection ) {

      vec3 q0 = vec3( dFdx( eye_pos.x ), dFdx( eye_pos.y ), dFdx( eye_pos.z ) );
      vec3 q1 = vec3( dFdy( eye_pos.x ), dFdy( eye_pos.y ), dFdy( eye_pos.z ) );
      vec2 st0 = dFdx( uv.st );
      vec2 st1 = dFdy( uv.st );

      vec3 N = normalize( surf_norm );

      vec3 q1perp = cross( q1, N );
      vec3 q0perp = cross( N, q0 );

      vec3 T = q1perp * st0.x + q0perp * st1.x;
      vec3 B = q1perp * st0.y + q0perp * st1.y;

      // three-vrm specific change: Workaround for the issue that happens when delta of uv = 0.0
      // TODO: Is this still required? Or shall I make a PR about it?
      if ( length( T ) == 0.0 || length( B ) == 0.0 ) {
        return surf_norm;
      }

      float det = max( dot( T, T ), dot( B, B ) );
      float scale = ( det == 0.0 ) ? 0.0 : faceDirection * inversesqrt( det );

      return normalize( T * ( mapN.x * scale ) + B * ( mapN.y * scale ) + N * mapN.z );

    }

  #endif

#endif

// #include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

// == post correction ==========================================================
void postCorrection() {
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  #include <fog_fragment>
  #include <premultiplied_alpha_fragment>
  #include <dithering_fragment>
}

// == main procedure ===========================================================
void main() {
  #include <clipping_planes_fragment>

  vec2 uv = vec2(0.5, 0.5);

  #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
    uv = vUv;

    float uvAnimMask = 1.0;
    #ifdef USE_UVANIMATIONMASKTEXTURE
      vec2 uvAnimationMaskTextureUv = ( uvAnimationMaskTextureUvTransform * vec3( uv, 1 ) ).xy;
      uvAnimMask = texture2D( uvAnimationMaskTexture, uvAnimationMaskTextureUv ).b;
    #endif

    float uvRotCos = cos( uvAnimationRotationPhase * uvAnimMask );
    float uvRotSin = sin( uvAnimationRotationPhase * uvAnimMask );
    uv = mat2( uvRotCos, -uvRotSin, uvRotSin, uvRotCos ) * ( uv - 0.5 ) + 0.5;
    uv = uv + vec2( uvAnimationScrollXOffset, uvAnimationScrollYOffset ) * uvAnimMask;
  #endif

  #ifdef DEBUG_UV
    gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
    #if ( defined( MTOON_USE_UV ) && !defined( MTOON_UVS_VERTEX_ONLY ) )
      gl_FragColor = vec4( uv, 0.0, 1.0 );
    #endif
    return;
  #endif

  vec4 diffuseColor = vec4( litFactor, opacity );
  ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
  vec3 totalEmissiveRadiance = emissive * emissiveIntensity;

  #include <logdepthbuf_fragment>

  // #include <map_fragment>
  #ifdef USE_MAP
    vec2 mapUv = ( mapUvTransform * vec3( uv, 1 ) ).xy;
    vec4 sampledDiffuseColor = texture2D( map, mapUv );
    #ifdef DECODE_VIDEO_TEXTURE
      sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
    #endif
    diffuseColor *= sampledDiffuseColor;
  #endif

  // #include <color_fragment>
  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )
    diffuseColor.rgb *= vColor;
  #endif

  // #include <alphamap_fragment>

  #include <alphatest_fragment>

  // #include <specularmap_fragment>

  // #include <normal_fragment_begin>
  float faceDirection = gl_FrontFacing ? 1.0 : -1.0;

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

  #ifdef USE_NORMALMAP

    vec2 normalMapUv = ( normalMapUvTransform * vec3( uv, 1 ) ).xy;

  #endif

  #ifdef USE_NORMALMAP_TANGENTSPACE

    #ifdef USE_TANGENT

      mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

    #else

      mat3 tbn = getTangentFrame( - vViewPosition, normal, normalMapUv );

    #endif

    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

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

    #if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

      tbn2[0] *= faceDirection;
      tbn2[1] *= faceDirection;

    #endif

  #endif

  // non perturbed normal for clearcoat among others

  vec3 nonPerturbedNormal = normal;

  #ifdef OUTLINE
    normal *= -1.0;
  #endif

  // #include <normal_fragment_maps>

  // COMPAT: pre-r151
  // USE_NORMALMAP_OBJECTSPACE used to be OBJECTSPACE_NORMALMAP in pre-r151
  #if defined( USE_NORMALMAP_OBJECTSPACE ) || defined( OBJECTSPACE_NORMALMAP )

    normal = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

    #ifdef FLIP_SIDED

      normal = - normal;

    #endif

    #ifdef DOUBLE_SIDED

      normal = normal * faceDirection;

    #endif

    normal = normalize( normalMatrix * normal );

  // COMPAT: pre-r151
  // USE_NORMALMAP_TANGENTSPACE used to be TANGENTSPACE_NORMALMAP in pre-r151
  #elif defined( USE_NORMALMAP_TANGENTSPACE ) || defined( TANGENTSPACE_NORMALMAP )

    vec3 mapN = texture2D( normalMap, normalMapUv ).xyz * 2.0 - 1.0;
    mapN.xy *= normalScale;

    // COMPAT: pre-r151
    #if THREE_VRM_THREE_REVISION >= 151 || defined( USE_TANGENT )

      normal = normalize( tbn * mapN );

    #else

      normal = perturbNormal2Arb( uv, -vViewPosition, normal, mapN, faceDirection );

    #endif

  #endif

  // #include <emissivemap_fragment>
  #ifdef USE_EMISSIVEMAP
    vec2 emissiveMapUv = ( emissiveMapUvTransform * vec3( uv, 1 ) ).xy;
    totalEmissiveRadiance *= texture2D( emissiveMap, emissiveMapUv ).rgb;
  #endif

  #ifdef DEBUG_NORMAL
    gl_FragColor = vec4( 0.5 + 0.5 * normal, 1.0 );
    return;
  #endif

  // -- MToon: lighting --------------------------------------------------------
  // accumulation
  // #include <lights_phong_fragment>
  MToonMaterial material;

  material.diffuseColor = diffuseColor.rgb;

  material.shadeColor = shadeColorFactor;
  #ifdef USE_SHADEMULTIPLYTEXTURE
    vec2 shadeMultiplyTextureUv = ( shadeMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;
    material.shadeColor *= texture2D( shadeMultiplyTexture, shadeMultiplyTextureUv ).rgb;
  #endif

  #if ( defined( USE_COLOR ) && !defined( IGNORE_VERTEX_COLOR ) )
    material.shadeColor.rgb *= vColor;
  #endif

  material.shadingShift = shadingShiftFactor;
  #ifdef USE_SHADINGSHIFTTEXTURE
    vec2 shadingShiftTextureUv = ( shadingShiftTextureUvTransform * vec3( uv, 1 ) ).xy;
    material.shadingShift += texture2D( shadingShiftTexture, shadingShiftTextureUv ).r * shadingShiftTextureScale;
  #endif

  // #include <lights_fragment_begin>

  // MToon Specific changes:
  // Since we want to take shadows into account of shading instead of irradiance,
  // we had to modify the codes that multiplies the results of shadowmap into color of direct lights.

  // COMPAT: pre-r156 uses a struct GeometricContext
  #if THREE_VRM_THREE_REVISION >= 157
    vec3 geometryPosition = - vViewPosition;
    vec3 geometryNormal = normal;
    vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

    vec3 geometryClearcoatNormal;

    #ifdef USE_CLEARCOAT

      geometryClearcoatNormal = clearcoatNormal;

    #endif
  #else
    GeometricContext geometry;

    geometry.position = - vViewPosition;
    geometry.normal = normal;
    geometry.viewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

    #ifdef USE_CLEARCOAT

      geometry.clearcoatNormal = clearcoatNormal;

    #endif
  #endif

  IncidentLight directLight;

  // since these variables will be used in unrolled loop, we have to define in prior
  float shadow;

  #if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

    PointLight pointLight;
    #if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
    PointLightShadow pointLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

      pointLight = pointLights[ i ];

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        getPointLightInfo( pointLight, geometryPosition, directLight );
      #else
        getPointLightInfo( pointLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
      pointLightShadow = pointLightShadows[ i ];
      // COMPAT: pre-r166
      // r166 introduced shadowIntensity
      #if THREE_VRM_THREE_REVISION >= 166
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
      #else
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
      #endif
      #endif

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );
      #else
        RE_Direct( directLight, geometry, material, shadow, reflectedLight );
      #endif

    }
    #pragma unroll_loop_end

  #endif

  #if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

    SpotLight spotLight;
    // COMPAT: pre-r144 uses NUM_SPOT_LIGHT_SHADOWS, r144+ uses NUM_SPOT_LIGHT_COORDS
    #if THREE_VRM_THREE_REVISION >= 144
      #if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_COORDS > 0
      SpotLightShadow spotLightShadow;
      #endif
    #elif defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
    SpotLightShadow spotLightShadow;
    #endif

    #pragma unroll_loop_start
    for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

      spotLight = spotLights[ i ];

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        getSpotLightInfo( spotLight, geometryPosition, directLight );
      #else
        getSpotLightInfo( spotLight, geometry, directLight );
      #endif

      shadow = 1.0;
      // COMPAT: pre-r144 uses NUM_SPOT_LIGHT_SHADOWS and vSpotShadowCoord, r144+ uses NUM_SPOT_LIGHT_COORDS and vSpotLightCoord
      // COMPAT: pre-r166 does not have shadowIntensity, r166+ has shadowIntensity
      #if THREE_VRM_THREE_REVISION >= 166
        #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_COORDS )
        spotLightShadow = spotLightShadows[ i ];
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
        #endif
      #elif THREE_VRM_THREE_REVISION >= 144
        #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_COORDS )
        spotLightShadow = spotLightShadows[ i ];
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
        #endif
      #elif defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
      spotLightShadow = spotLightShadows[ i ];
      shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotShadowCoord[ i ] ) : 1.0;
      #endif

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );
      #else
        RE_Direct( directLight, geometry, material, shadow, reflectedLight );
      #endif

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

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        getDirectionalLightInfo( directionalLight, directLight );
      #else
        getDirectionalLightInfo( directionalLight, geometry, directLight );
      #endif

      shadow = 1.0;
      #if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
      directionalLightShadow = directionalLightShadows[ i ];
      // COMPAT: pre-r166
      // r166 introduced shadowIntensity
      #if THREE_VRM_THREE_REVISION >= 166
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
      #else
        shadow = all( bvec2( directLight.visible, receiveShadow ) ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
      #endif
      #endif

      // COMPAT: pre-r156 uses a struct GeometricContext
      #if THREE_VRM_THREE_REVISION >= 157
        RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, shadow, reflectedLight );
      #else
        RE_Direct( directLight, geometry, material, shadow, reflectedLight );
      #endif

    }
    #pragma unroll_loop_end

  #endif

  // #if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

  //   RectAreaLight rectAreaLight;

  //   #pragma unroll_loop_start
  //   for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

  //     rectAreaLight = rectAreaLights[ i ];
  //     RE_Direct_RectArea( rectAreaLight, geometry, material, reflectedLight );

  //   }
  //   #pragma unroll_loop_end

  // #endif

  #if defined( RE_IndirectDiffuse )

    vec3 iblIrradiance = vec3( 0.0 );

    vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

    // COMPAT: pre-r156 uses a struct GeometricContext
    // COMPAT: pre-r156 doesn't have a define USE_LIGHT_PROBES
    #if THREE_VRM_THREE_REVISION >= 157
      #if defined( USE_LIGHT_PROBES )
        irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
      #endif
    #else
      irradiance += getLightProbeIrradiance( lightProbe, geometry.normal );
    #endif

    #if ( NUM_HEMI_LIGHTS > 0 )

      #pragma unroll_loop_start
      for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

        // COMPAT: pre-r156 uses a struct GeometricContext
        #if THREE_VRM_THREE_REVISION >= 157
          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
        #else
          irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometry.normal );
        #endif

      }
      #pragma unroll_loop_end

    #endif

  #endif

  // #if defined( RE_IndirectSpecular )

  //   vec3 radiance = vec3( 0.0 );
  //   vec3 clearcoatRadiance = vec3( 0.0 );

  // #endif

  #include <lights_fragment_maps>
  #include <lights_fragment_end>

  // modulation
  #include <aomap_fragment>

  vec3 col = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;

  #ifdef DEBUG_LITSHADERATE
    gl_FragColor = vec4( col, diffuseColor.a );
    postCorrection();
    return;
  #endif

  // -- MToon: rim lighting -----------------------------------------
  vec3 viewDir = normalize( vViewPosition );

  #ifndef PHYSICALLY_CORRECT_LIGHTS
    reflectedLight.directSpecular /= PI;
  #endif
  vec3 rimMix = mix( vec3( 1.0 ), reflectedLight.directSpecular, rimLightingMixFactor );

  vec3 rim = parametricRimColorFactor * pow( saturate( 1.0 - dot( viewDir, normal ) + parametricRimLiftFactor ), parametricRimFresnelPowerFactor );

  #ifdef USE_MATCAPTEXTURE
    {
      vec3 x = normalize( vec3( viewDir.z, 0.0, -viewDir.x ) );
      vec3 y = cross( viewDir, x ); // guaranteed to be normalized
      vec2 sphereUv = 0.5 + 0.5 * vec2( dot( x, normal ), -dot( y, normal ) );
      sphereUv = ( matcapTextureUvTransform * vec3( sphereUv, 1 ) ).xy;
      vec3 matcap = texture2D( matcapTexture, sphereUv ).rgb;
      rim += matcapFactor * matcap;
    }
  #endif

  #ifdef USE_RIMMULTIPLYTEXTURE
    vec2 rimMultiplyTextureUv = ( rimMultiplyTextureUvTransform * vec3( uv, 1 ) ).xy;
    rim *= texture2D( rimMultiplyTexture, rimMultiplyTextureUv ).rgb;
  #endif

  col += rimMix * rim;

  // -- MToon: Emission --------------------------------------------------------
  col += totalEmissiveRadiance;

  // #include <envmap_fragment>

  // -- Almost done! -----------------------------------------------------------
  #if defined( OUTLINE )
    col = outlineColorFactor.rgb * mix( vec3( 1.0 ), col, outlineLightingMixFactor );
  #endif

  #ifdef OPAQUE
    diffuseColor.a = 1.0;
  #endif

  gl_FragColor = vec4( col, diffuseColor.a );
  postCorrection();
}
`,Cr={None:"none"},gn={None:"none",ScreenCoordinates:"screenCoordinates"},Ur={3e3:"",3001:"srgb"};function We(e){return parseInt(be,10)>=152?e.colorSpace:Ur[e.encoding]}var Nr=class extends Bi{constructor(e={}){var t;super({vertexShader:Ir,fragmentShader:Or}),this.uvAnimationScrollXSpeedFactor=0,this.uvAnimationScrollYSpeedFactor=0,this.uvAnimationRotationSpeedFactor=0,this.fog=!0,this.normalMapType=Fi,this._ignoreVertexColor=!0,this._v0CompatShade=!1,this._debugMode=Cr.None,this._outlineWidthMode=gn.None,this._isOutline=!1,e.transparentWithZWrite&&(e.depthWrite=!0),delete e.transparentWithZWrite,e.fog=!0,e.lights=!0,e.clipping=!0,this.uniforms=Hi.merge([ce.common,ce.normalmap,ce.emissivemap,ce.fog,ce.lights,{litFactor:{value:new D(1,1,1)},mapUvTransform:{value:new j},colorAlpha:{value:1},normalMapUvTransform:{value:new j},shadeColorFactor:{value:new D(0,0,0)},shadeMultiplyTexture:{value:null},shadeMultiplyTextureUvTransform:{value:new j},shadingShiftFactor:{value:0},shadingShiftTexture:{value:null},shadingShiftTextureUvTransform:{value:new j},shadingShiftTextureScale:{value:1},shadingToonyFactor:{value:.9},giEqualizationFactor:{value:.9},matcapFactor:{value:new D(1,1,1)},matcapTexture:{value:null},matcapTextureUvTransform:{value:new j},parametricRimColorFactor:{value:new D(0,0,0)},rimMultiplyTexture:{value:null},rimMultiplyTextureUvTransform:{value:new j},rimLightingMixFactor:{value:1},parametricRimFresnelPowerFactor:{value:5},parametricRimLiftFactor:{value:0},emissive:{value:new D(0,0,0)},emissiveIntensity:{value:1},emissiveMapUvTransform:{value:new j},outlineWidthMultiplyTexture:{value:null},outlineWidthMultiplyTextureUvTransform:{value:new j},outlineWidthFactor:{value:0},outlineColorFactor:{value:new D(0,0,0)},outlineLightingMixFactor:{value:1},uvAnimationMaskTexture:{value:null},uvAnimationMaskTextureUvTransform:{value:new j},uvAnimationScrollXOffset:{value:0},uvAnimationScrollYOffset:{value:0},uvAnimationRotationPhase:{value:0}},(t=e.uniforms)!=null?t:{}]),this.setValues(e),this._uploadUniformsWorkaround(),this.customProgramCacheKey=()=>[...Object.entries(this._generateDefines()).map(([n,i])=>`${n}:${i}`),this.matcapTexture?`matcapTextureColorSpace:${We(this.matcapTexture)}`:"",this.shadeMultiplyTexture?`shadeMultiplyTextureColorSpace:${We(this.shadeMultiplyTexture)}`:"",this.rimMultiplyTexture?`rimMultiplyTextureColorSpace:${We(this.rimMultiplyTexture)}`:""].join(","),this.onBeforeCompile=n=>{const i=parseInt(be,10),r=Object.entries(_n(_n({},this._generateDefines()),this.defines)).filter(([o,a])=>!!a).map(([o,a])=>`#define ${o} ${a}`).join(`
`)+`
`;n.vertexShader=r+n.vertexShader,n.fragmentShader=r+n.fragmentShader,i<154&&(n.fragmentShader=n.fragmentShader.replace("#include <colorspace_fragment>","#include <encodings_fragment>"))}}get color(){return this.uniforms.litFactor.value}set color(e){this.uniforms.litFactor.value=e}get map(){return this.uniforms.map.value}set map(e){this.uniforms.map.value=e}get normalMap(){return this.uniforms.normalMap.value}set normalMap(e){this.uniforms.normalMap.value=e}get normalScale(){return this.uniforms.normalScale.value}set normalScale(e){this.uniforms.normalScale.value=e}get emissive(){return this.uniforms.emissive.value}set emissive(e){this.uniforms.emissive.value=e}get emissiveIntensity(){return this.uniforms.emissiveIntensity.value}set emissiveIntensity(e){this.uniforms.emissiveIntensity.value=e}get emissiveMap(){return this.uniforms.emissiveMap.value}set emissiveMap(e){this.uniforms.emissiveMap.value=e}get shadeColorFactor(){return this.uniforms.shadeColorFactor.value}set shadeColorFactor(e){this.uniforms.shadeColorFactor.value=e}get shadeMultiplyTexture(){return this.uniforms.shadeMultiplyTexture.value}set shadeMultiplyTexture(e){this.uniforms.shadeMultiplyTexture.value=e}get shadingShiftFactor(){return this.uniforms.shadingShiftFactor.value}set shadingShiftFactor(e){this.uniforms.shadingShiftFactor.value=e}get shadingShiftTexture(){return this.uniforms.shadingShiftTexture.value}set shadingShiftTexture(e){this.uniforms.shadingShiftTexture.value=e}get shadingShiftTextureScale(){return this.uniforms.shadingShiftTextureScale.value}set shadingShiftTextureScale(e){this.uniforms.shadingShiftTextureScale.value=e}get shadingToonyFactor(){return this.uniforms.shadingToonyFactor.value}set shadingToonyFactor(e){this.uniforms.shadingToonyFactor.value=e}get giEqualizationFactor(){return this.uniforms.giEqualizationFactor.value}set giEqualizationFactor(e){this.uniforms.giEqualizationFactor.value=e}get matcapFactor(){return this.uniforms.matcapFactor.value}set matcapFactor(e){this.uniforms.matcapFactor.value=e}get matcapTexture(){return this.uniforms.matcapTexture.value}set matcapTexture(e){this.uniforms.matcapTexture.value=e}get parametricRimColorFactor(){return this.uniforms.parametricRimColorFactor.value}set parametricRimColorFactor(e){this.uniforms.parametricRimColorFactor.value=e}get rimMultiplyTexture(){return this.uniforms.rimMultiplyTexture.value}set rimMultiplyTexture(e){this.uniforms.rimMultiplyTexture.value=e}get rimLightingMixFactor(){return this.uniforms.rimLightingMixFactor.value}set rimLightingMixFactor(e){this.uniforms.rimLightingMixFactor.value=e}get parametricRimFresnelPowerFactor(){return this.uniforms.parametricRimFresnelPowerFactor.value}set parametricRimFresnelPowerFactor(e){this.uniforms.parametricRimFresnelPowerFactor.value=e}get parametricRimLiftFactor(){return this.uniforms.parametricRimLiftFactor.value}set parametricRimLiftFactor(e){this.uniforms.parametricRimLiftFactor.value=e}get outlineWidthMultiplyTexture(){return this.uniforms.outlineWidthMultiplyTexture.value}set outlineWidthMultiplyTexture(e){this.uniforms.outlineWidthMultiplyTexture.value=e}get outlineWidthFactor(){return this.uniforms.outlineWidthFactor.value}set outlineWidthFactor(e){this.uniforms.outlineWidthFactor.value=e}get outlineColorFactor(){return this.uniforms.outlineColorFactor.value}set outlineColorFactor(e){this.uniforms.outlineColorFactor.value=e}get outlineLightingMixFactor(){return this.uniforms.outlineLightingMixFactor.value}set outlineLightingMixFactor(e){this.uniforms.outlineLightingMixFactor.value=e}get uvAnimationMaskTexture(){return this.uniforms.uvAnimationMaskTexture.value}set uvAnimationMaskTexture(e){this.uniforms.uvAnimationMaskTexture.value=e}get uvAnimationScrollXOffset(){return this.uniforms.uvAnimationScrollXOffset.value}set uvAnimationScrollXOffset(e){this.uniforms.uvAnimationScrollXOffset.value=e}get uvAnimationScrollYOffset(){return this.uniforms.uvAnimationScrollYOffset.value}set uvAnimationScrollYOffset(e){this.uniforms.uvAnimationScrollYOffset.value=e}get uvAnimationRotationPhase(){return this.uniforms.uvAnimationRotationPhase.value}set uvAnimationRotationPhase(e){this.uniforms.uvAnimationRotationPhase.value=e}get ignoreVertexColor(){return this._ignoreVertexColor}set ignoreVertexColor(e){this._ignoreVertexColor=e,this.needsUpdate=!0}get v0CompatShade(){return this._v0CompatShade}set v0CompatShade(e){this._v0CompatShade=e,this.needsUpdate=!0}get debugMode(){return this._debugMode}set debugMode(e){this._debugMode=e,this.needsUpdate=!0}get outlineWidthMode(){return this._outlineWidthMode}set outlineWidthMode(e){this._outlineWidthMode=e,this.needsUpdate=!0}get isOutline(){return this._isOutline}set isOutline(e){this._isOutline=e,this.needsUpdate=!0}get isMToonMaterial(){return!0}update(e){this._uploadUniformsWorkaround(),this._updateUVAnimation(e)}copy(e){return super.copy(e),this.map=e.map,this.normalMap=e.normalMap,this.emissiveMap=e.emissiveMap,this.shadeMultiplyTexture=e.shadeMultiplyTexture,this.shadingShiftTexture=e.shadingShiftTexture,this.matcapTexture=e.matcapTexture,this.rimMultiplyTexture=e.rimMultiplyTexture,this.outlineWidthMultiplyTexture=e.outlineWidthMultiplyTexture,this.uvAnimationMaskTexture=e.uvAnimationMaskTexture,this.normalMapType=e.normalMapType,this.uvAnimationScrollXSpeedFactor=e.uvAnimationScrollXSpeedFactor,this.uvAnimationScrollYSpeedFactor=e.uvAnimationScrollYSpeedFactor,this.uvAnimationRotationSpeedFactor=e.uvAnimationRotationSpeedFactor,this.ignoreVertexColor=e.ignoreVertexColor,this.v0CompatShade=e.v0CompatShade,this.debugMode=e.debugMode,this.outlineWidthMode=e.outlineWidthMode,this.isOutline=e.isOutline,this.needsUpdate=!0,this}_updateUVAnimation(e){this.uniforms.uvAnimationScrollXOffset.value+=e*this.uvAnimationScrollXSpeedFactor,this.uniforms.uvAnimationScrollYOffset.value+=e*this.uvAnimationScrollYSpeedFactor,this.uniforms.uvAnimationRotationPhase.value+=e*this.uvAnimationRotationSpeedFactor,this.uniforms.alphaTest.value=this.alphaTest,this.uniformsNeedUpdate=!0}_uploadUniformsWorkaround(){this.uniforms.opacity.value=this.opacity,this._updateTextureMatrix(this.uniforms.map,this.uniforms.mapUvTransform),this._updateTextureMatrix(this.uniforms.normalMap,this.uniforms.normalMapUvTransform),this._updateTextureMatrix(this.uniforms.emissiveMap,this.uniforms.emissiveMapUvTransform),this._updateTextureMatrix(this.uniforms.shadeMultiplyTexture,this.uniforms.shadeMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.shadingShiftTexture,this.uniforms.shadingShiftTextureUvTransform),this._updateTextureMatrix(this.uniforms.matcapTexture,this.uniforms.matcapTextureUvTransform),this._updateTextureMatrix(this.uniforms.rimMultiplyTexture,this.uniforms.rimMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.outlineWidthMultiplyTexture,this.uniforms.outlineWidthMultiplyTextureUvTransform),this._updateTextureMatrix(this.uniforms.uvAnimationMaskTexture,this.uniforms.uvAnimationMaskTextureUvTransform),this.uniformsNeedUpdate=!0}_generateDefines(){const e=parseInt(be,10),t=this.outlineWidthMultiplyTexture!==null,n=this.map!==null||this.normalMap!==null||this.emissiveMap!==null||this.shadeMultiplyTexture!==null||this.shadingShiftTexture!==null||this.rimMultiplyTexture!==null||this.uvAnimationMaskTexture!==null;return{THREE_VRM_THREE_REVISION:e,OUTLINE:this._isOutline,MTOON_USE_UV:t||n,MTOON_UVS_VERTEX_ONLY:t&&!n,V0_COMPAT_SHADE:this._v0CompatShade,USE_SHADEMULTIPLYTEXTURE:this.shadeMultiplyTexture!==null,USE_SHADINGSHIFTTEXTURE:this.shadingShiftTexture!==null,USE_MATCAPTEXTURE:this.matcapTexture!==null,USE_RIMMULTIPLYTEXTURE:this.rimMultiplyTexture!==null,USE_OUTLINEWIDTHMULTIPLYTEXTURE:this._isOutline&&this.outlineWidthMultiplyTexture!==null,USE_UVANIMATIONMASKTEXTURE:this.uvAnimationMaskTexture!==null,IGNORE_VERTEX_COLOR:this._ignoreVertexColor===!0,DEBUG_NORMAL:this._debugMode==="normal",DEBUG_LITSHADERATE:this._debugMode==="litShadeRate",DEBUG_UV:this._debugMode==="uv",OUTLINE_WIDTH_SCREEN:this._isOutline&&this._outlineWidthMode===gn.ScreenCoordinates}}_updateTextureMatrix(e,t){e.value&&(e.value.matrixAutoUpdate&&e.value.updateMatrix(),t.value.copy(e.value.matrix))}},Vr=new Set(["1.0","1.0-beta"]),$n=class Pe{get name(){return Pe.EXTENSION_NAME}constructor(t,n={}){var i,r,o,a;this.parser=t,this.materialType=(i=n.materialType)!=null?i:Nr,this.renderOrderOffset=(r=n.renderOrderOffset)!=null?r:0,this.v0CompatShade=(o=n.v0CompatShade)!=null?o:!1,this.debugMode=(a=n.debugMode)!=null?a:"none",this._mToonMaterialSet=new Set}beforeRoot(){return ee(this,null,function*(){this._removeUnlitExtensionIfMToonExists()})}afterRoot(t){return ee(this,null,function*(){t.userData.vrmMToonMaterials=Array.from(this._mToonMaterialSet)})}getMaterialType(t){return this._getMToonExtension(t)?this.materialType:null}extendMaterialParams(t,n){const i=this._getMToonExtension(t);return i?this._extendMaterialParams(i,n):null}loadMesh(t){return ee(this,null,function*(){var n;const i=this.parser,o=(n=i.json.meshes)==null?void 0:n[t];if(o==null)throw new Error(`MToonMaterialLoaderPlugin: Attempt to use meshes[${t}] of glTF but the mesh doesn't exist`);const a=o.primitives,l=yield i.loadMesh(t);if(a.length===1){const s=l,u=a[0].material;u!=null&&this._setupPrimitive(s,u)}else{const s=l;for(let u=0;u<a.length;u++){const c=s.children[u],d=a[u].material;d!=null&&this._setupPrimitive(c,d)}}return l})}_removeUnlitExtensionIfMToonExists(){const i=this.parser.json.materials;i==null||i.map((r,o)=>{var a;this._getMToonExtension(o)&&((a=r.extensions)!=null&&a.KHR_materials_unlit)&&delete r.extensions.KHR_materials_unlit})}_getMToonExtension(t){var n,i;const a=(n=this.parser.json.materials)==null?void 0:n[t];if(a==null){console.warn(`MToonMaterialLoaderPlugin: Attempt to use materials[${t}] of glTF but the material doesn't exist`);return}const l=(i=a.extensions)==null?void 0:i[Pe.EXTENSION_NAME];if(l==null)return;const s=l.specVersion;if(!Vr.has(s)){console.warn(`MToonMaterialLoaderPlugin: Unknown ${Pe.EXTENSION_NAME} specVersion "${s}"`);return}return l}_extendMaterialParams(t,n){return ee(this,null,function*(){var i;delete n.metalness,delete n.roughness;const r=new br(this.parser,n);r.assignPrimitive("transparentWithZWrite",t.transparentWithZWrite),r.assignColor("shadeColorFactor",t.shadeColorFactor),r.assignTexture("shadeMultiplyTexture",t.shadeMultiplyTexture,!0),r.assignPrimitive("shadingShiftFactor",t.shadingShiftFactor),r.assignTexture("shadingShiftTexture",t.shadingShiftTexture,!0),r.assignPrimitive("shadingShiftTextureScale",(i=t.shadingShiftTexture)==null?void 0:i.scale),r.assignPrimitive("shadingToonyFactor",t.shadingToonyFactor),r.assignPrimitive("giEqualizationFactor",t.giEqualizationFactor),r.assignColor("matcapFactor",t.matcapFactor),r.assignTexture("matcapTexture",t.matcapTexture,!0),r.assignColor("parametricRimColorFactor",t.parametricRimColorFactor),r.assignTexture("rimMultiplyTexture",t.rimMultiplyTexture,!0),r.assignPrimitive("rimLightingMixFactor",t.rimLightingMixFactor),r.assignPrimitive("parametricRimFresnelPowerFactor",t.parametricRimFresnelPowerFactor),r.assignPrimitive("parametricRimLiftFactor",t.parametricRimLiftFactor),r.assignPrimitive("outlineWidthMode",t.outlineWidthMode),r.assignPrimitive("outlineWidthFactor",t.outlineWidthFactor),r.assignTexture("outlineWidthMultiplyTexture",t.outlineWidthMultiplyTexture,!1),r.assignColor("outlineColorFactor",t.outlineColorFactor),r.assignPrimitive("outlineLightingMixFactor",t.outlineLightingMixFactor),r.assignTexture("uvAnimationMaskTexture",t.uvAnimationMaskTexture,!1),r.assignPrimitive("uvAnimationScrollXSpeedFactor",t.uvAnimationScrollXSpeedFactor),r.assignPrimitive("uvAnimationScrollYSpeedFactor",t.uvAnimationScrollYSpeedFactor),r.assignPrimitive("uvAnimationRotationSpeedFactor",t.uvAnimationRotationSpeedFactor),r.assignPrimitive("v0CompatShade",this.v0CompatShade),r.assignPrimitive("debugMode",this.debugMode),yield r.pending})}_setupPrimitive(t,n){const i=this._getMToonExtension(n);if(i){const r=this._parseRenderOrder(i);t.renderOrder=r+this.renderOrderOffset,this._generateOutline(t),this._addToMaterialSet(t);return}}_shouldGenerateOutline(t){return typeof t.outlineWidthMode=="string"&&t.outlineWidthMode!=="none"&&typeof t.outlineWidthFactor=="number"&&t.outlineWidthFactor>0}_generateOutline(t){const n=t.material;if(!(n instanceof Ni)||!this._shouldGenerateOutline(n))return;t.material=[n];const i=n.clone();i.name+=" (Outline)",i.isOutline=!0,i.side=Vi,t.material.push(i);const r=t.geometry,o=r.index?r.index.count:r.attributes.position.count/3;r.addGroup(0,o,0),r.addGroup(0,o,1)}_addToMaterialSet(t){const n=t.material,i=new Set;Array.isArray(n)?n.forEach(r=>i.add(r)):i.add(n);for(const r of i)this._mToonMaterialSet.add(r)}_parseRenderOrder(t){var n;return(t.transparentWithZWrite?0:19)+((n=t.renderQueueOffsetNumber)!=null?n:0)}};$n.EXTENSION_NAME="VRMC_materials_mtoon";var Dr=$n,Br=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())}),Zn=class et{get name(){return et.EXTENSION_NAME}constructor(t){this.parser=t}extendMaterialParams(t,n){return Br(this,null,function*(){const i=this._getHDREmissiveMultiplierExtension(t);if(i==null)return;console.warn("VRMMaterialsHDREmissiveMultiplierLoaderPlugin: `VRMC_materials_hdr_emissiveMultiplier` is archived. Use `KHR_materials_emissive_strength` instead.");const r=i.emissiveMultiplier;n.emissiveIntensity=r})}_getHDREmissiveMultiplierExtension(t){var n,i;const a=(n=this.parser.json.materials)==null?void 0:n[t];if(a==null){console.warn(`VRMMaterialsHDREmissiveMultiplierLoaderPlugin: Attempt to use materials[${t}] of glTF but the material doesn't exist`);return}const l=(i=a.extensions)==null?void 0:i[et.EXTENSION_NAME];if(l!=null)return l}};Zn.EXTENSION_NAME="VRMC_materials_hdr_emissiveMultiplier";var Fr=Zn,Hr=Object.defineProperty,kr=Object.defineProperties,Wr=Object.getOwnPropertyDescriptors,vn=Object.getOwnPropertySymbols,zr=Object.prototype.hasOwnProperty,jr=Object.prototype.propertyIsEnumerable,Mn=(e,t,n)=>t in e?Hr(e,t,{enumerable:!0,configurable:!0,writable:!0,value:n}):e[t]=n,k=(e,t)=>{for(var n in t||(t={}))zr.call(t,n)&&Mn(e,n,t[n]);if(vn)for(var n of vn(t))jr.call(t,n)&&Mn(e,n,t[n]);return e},xn=(e,t)=>kr(e,Wr(t)),Xr=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())});function re(e){return Math.pow(e,2.2)}var Gr=class{get name(){return"VRMMaterialsV0CompatPlugin"}constructor(e){var t;this.parser=e,this._renderQueueMapTransparent=new Map,this._renderQueueMapTransparentZWrite=new Map;const n=this.parser.json;n.extensionsUsed=(t=n.extensionsUsed)!=null?t:[],n.extensionsUsed.indexOf("KHR_texture_transform")===-1&&n.extensionsUsed.push("KHR_texture_transform")}beforeRoot(){return Xr(this,null,function*(){var e;const t=this.parser.json,n=(e=t.extensions)==null?void 0:e.VRM,i=n==null?void 0:n.materialProperties;i&&(this._populateRenderQueueMap(i),i.forEach((r,o)=>{var a,l;const s=(a=t.materials)==null?void 0:a[o];if(s==null){console.warn(`VRMMaterialsV0CompatPlugin: Attempt to use materials[${o}] of glTF but the material doesn't exist`);return}if(r.shader==="VRM/MToon"){const u=this._parseV0MToonProperties(r,s);t.materials[o]=u}else if((l=r.shader)!=null&&l.startsWith("VRM/Unlit")){const u=this._parseV0UnlitProperties(r,s);t.materials[o]=u}else r.shader==="VRM_USE_GLTFSHADER"||console.warn(`VRMMaterialsV0CompatPlugin: Unknown shader: ${r.shader}`)}))})}_parseV0MToonProperties(e,t){var n,i,r,o,a,l,s,u,c,d,h,p,m,f,_,v,M,R,T,x,y,S,A,I,P,L,O,Y,le,ue,X,F,ne,de,N,dt,ct,ht,pt,ft,mt,_t,gt,vt,Mt,xt,yt,wt,Tt,Rt,St,Et,At,Pt,Lt;const bt=(i=(n=e.keywordMap)==null?void 0:n._ALPHABLEND_ON)!=null?i:!1,oi=((r=e.floatProperties)==null?void 0:r._ZWrite)===1&&bt,si=this._v0ParseRenderQueue(e),It=(a=(o=e.keywordMap)==null?void 0:o._ALPHATEST_ON)!=null?a:!1,ai=bt?"BLEND":It?"MASK":"OPAQUE",li=It?(s=(l=e.floatProperties)==null?void 0:l._Cutoff)!=null?s:.5:void 0,ui=((c=(u=e.floatProperties)==null?void 0:u._CullMode)!=null?c:2)===0,$=this._portTextureTransform(e),di=((h=(d=e.vectorProperties)==null?void 0:d._Color)!=null?h:[1,1,1,1]).map((Ht,Ui)=>Ui===3?Ht:re(Ht)),Ot=(p=e.textureProperties)==null?void 0:p._MainTex,ci=Ot!=null?{index:Ot,extensions:k({},$)}:void 0,hi=(f=(m=e.floatProperties)==null?void 0:m._BumpScale)!=null?f:1,Ct=(_=e.textureProperties)==null?void 0:_._BumpMap,pi=Ct!=null?{index:Ct,scale:hi,extensions:k({},$)}:void 0,fi=((M=(v=e.vectorProperties)==null?void 0:v._EmissionColor)!=null?M:[0,0,0,1]).map(re),Ut=(R=e.textureProperties)==null?void 0:R._EmissionMap,mi=Ut!=null?{index:Ut,extensions:k({},$)}:void 0,_i=((x=(T=e.vectorProperties)==null?void 0:T._ShadeColor)!=null?x:[.97,.81,.86,1]).map(re),Nt=(y=e.textureProperties)==null?void 0:y._ShadeTexture,gi=Nt!=null?{index:Nt,extensions:k({},$)}:void 0;let Me=(A=(S=e.floatProperties)==null?void 0:S._ShadeShift)!=null?A:0,xe=(P=(I=e.floatProperties)==null?void 0:I._ShadeToony)!=null?P:.9;xe=b.lerp(xe,1,.5+.5*Me),Me=-Me-(1-xe);const Vt=(O=(L=e.floatProperties)==null?void 0:L._IndirectLightIntensity)!=null?O:.1,vi=Vt?1-Vt:void 0,Ve=(Y=e.textureProperties)==null?void 0:Y._SphereAdd,Mi=Ve!=null?[1,1,1]:void 0,xi=Ve!=null?{index:Ve}:void 0,yi=(ue=(le=e.floatProperties)==null?void 0:le._RimLightingMix)!=null?ue:0,Dt=(X=e.textureProperties)==null?void 0:X._RimTexture,wi=Dt!=null?{index:Dt,extensions:k({},$)}:void 0,Ti=((ne=(F=e.vectorProperties)==null?void 0:F._RimColor)!=null?ne:[0,0,0,1]).map(re),Ri=(N=(de=e.floatProperties)==null?void 0:de._RimFresnelPower)!=null?N:1,Si=(ct=(dt=e.floatProperties)==null?void 0:dt._RimLift)!=null?ct:0,Ei=["none","worldCoordinates","screenCoordinates"][(pt=(ht=e.floatProperties)==null?void 0:ht._OutlineWidthMode)!=null?pt:0];let De=(mt=(ft=e.floatProperties)==null?void 0:ft._OutlineWidth)!=null?mt:0;De=.01*De;const Bt=(_t=e.textureProperties)==null?void 0:_t._OutlineWidthTexture,Ai=Bt!=null?{index:Bt,extensions:k({},$)}:void 0,Pi=((vt=(gt=e.vectorProperties)==null?void 0:gt._OutlineColor)!=null?vt:[0,0,0]).map(re),Li=((xt=(Mt=e.floatProperties)==null?void 0:Mt._OutlineColorMode)!=null?xt:0)===1?(wt=(yt=e.floatProperties)==null?void 0:yt._OutlineLightingMix)!=null?wt:1:0,Ft=(Tt=e.textureProperties)==null?void 0:Tt._UvAnimMaskTexture,bi=Ft!=null?{index:Ft,extensions:k({},$)}:void 0,Ii=(St=(Rt=e.floatProperties)==null?void 0:Rt._UvAnimScrollX)!=null?St:0;let ye=(At=(Et=e.floatProperties)==null?void 0:Et._UvAnimScrollY)!=null?At:0;ye!=null&&(ye=-ye);const Oi=(Lt=(Pt=e.floatProperties)==null?void 0:Pt._UvAnimRotation)!=null?Lt:0,Ci={specVersion:"1.0",transparentWithZWrite:oi,renderQueueOffsetNumber:si,shadeColorFactor:_i,shadeMultiplyTexture:gi,shadingShiftFactor:Me,shadingToonyFactor:xe,giEqualizationFactor:vi,matcapFactor:Mi,matcapTexture:xi,rimLightingMixFactor:yi,rimMultiplyTexture:wi,parametricRimColorFactor:Ti,parametricRimFresnelPowerFactor:Ri,parametricRimLiftFactor:Si,outlineWidthMode:Ei,outlineWidthFactor:De,outlineWidthMultiplyTexture:Ai,outlineColorFactor:Pi,outlineLightingMixFactor:Li,uvAnimationMaskTexture:bi,uvAnimationScrollXSpeedFactor:Ii,uvAnimationScrollYSpeedFactor:ye,uvAnimationRotationSpeedFactor:Oi};return xn(k({},t),{pbrMetallicRoughness:{baseColorFactor:di,baseColorTexture:ci},normalTexture:pi,emissiveTexture:mi,emissiveFactor:fi,alphaMode:ai,alphaCutoff:li,doubleSided:ui,extensions:{VRMC_materials_mtoon:Ci}})}_parseV0UnlitProperties(e,t){var n,i,r,o,a;const l=e.shader==="VRM/UnlitTransparentZWrite",s=e.shader==="VRM/UnlitTransparent"||l,u=this._v0ParseRenderQueue(e),c=e.shader==="VRM/UnlitCutout",d=s?"BLEND":c?"MASK":"OPAQUE",h=c?(i=(n=e.floatProperties)==null?void 0:n._Cutoff)!=null?i:.5:void 0,p=this._portTextureTransform(e),m=((o=(r=e.vectorProperties)==null?void 0:r._Color)!=null?o:[1,1,1,1]).map(re),f=(a=e.textureProperties)==null?void 0:a._MainTex,_=f!=null?{index:f,extensions:k({},p)}:void 0,v={specVersion:"1.0",transparentWithZWrite:l,renderQueueOffsetNumber:u,shadeColorFactor:m,shadeMultiplyTexture:_};return xn(k({},t),{pbrMetallicRoughness:{baseColorFactor:m,baseColorTexture:_},alphaMode:d,alphaCutoff:h,extensions:{VRMC_materials_mtoon:v}})}_portTextureTransform(e){var t,n,i,r,o;const a=(t=e.vectorProperties)==null?void 0:t._MainTex;if(a==null)return{};const l=[(n=a==null?void 0:a[0])!=null?n:0,(i=a==null?void 0:a[1])!=null?i:0],s=[(r=a==null?void 0:a[2])!=null?r:1,(o=a==null?void 0:a[3])!=null?o:1];return l[1]=1-s[1]-l[1],{KHR_texture_transform:{offset:l,scale:s}}}_v0ParseRenderQueue(e){var t,n;const i=e.shader==="VRM/UnlitTransparentZWrite",r=((t=e.keywordMap)==null?void 0:t._ALPHABLEND_ON)!=null||e.shader==="VRM/UnlitTransparent"||i,o=((n=e.floatProperties)==null?void 0:n._ZWrite)===1||i;let a=0;if(r){const l=e.renderQueue;l!=null&&(o?a=this._renderQueueMapTransparentZWrite.get(l):a=this._renderQueueMapTransparent.get(l))}return a}_populateRenderQueueMap(e){const t=new Set,n=new Set;e.forEach(i=>{var r,o;const a=i.shader==="VRM/UnlitTransparentZWrite",l=((r=i.keywordMap)==null?void 0:r._ALPHABLEND_ON)!=null||i.shader==="VRM/UnlitTransparent"||a,s=((o=i.floatProperties)==null?void 0:o._ZWrite)===1||a;if(l){const u=i.renderQueue;u!=null&&(s?n.add(u):t.add(u))}}),t.size>10&&console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${t.size} render queues for Transparent materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`),n.size>10&&console.warn(`VRMMaterialsV0CompatPlugin: This VRM uses ${n.size} render queues for TransparentZWrite materials while VRM 1.0 only supports up to 10 render queues. The model might not be rendered correctly.`),Array.from(t).sort().forEach((i,r)=>{const o=Math.min(Math.max(r-t.size+1,-9),0);this._renderQueueMapTransparent.set(i,o)}),Array.from(n).sort().forEach((i,r)=>{const o=Math.min(Math.max(r,0),9);this._renderQueueMapTransparentZWrite.set(i,o)})}},yn=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())}),q=new g,ze=class extends te{constructor(e){super(),this._attrPosition=new U(new Float32Array([0,0,0,0,0,0]),3),this._attrPosition.setUsage(ki);const t=new G;t.setAttribute("position",this._attrPosition);const n=new Ne({color:16711935,depthTest:!1,depthWrite:!1});this._line=new Wi(t,n),this.add(this._line),this.constraint=e}updateMatrixWorld(e){q.setFromMatrixPosition(this.constraint.destination.matrixWorld),this._attrPosition.setXYZ(0,q.x,q.y,q.z),this.constraint.source&&q.setFromMatrixPosition(this.constraint.source.matrixWorld),this._attrPosition.setXYZ(1,q.x,q.y,q.z),this._attrPosition.needsUpdate=!0,super.updateMatrixWorld(e)}};function wn(e,t){return t.set(e.elements[12],e.elements[13],e.elements[14])}var Yr=new g,qr=new g;function Qr(e,t){return e.decompose(Yr,t,qr),t}function Oe(e){return e.invert?e.invert():e.inverse(),e}var at=class{constructor(e,t){this.destination=e,this.source=t,this.weight=1}},$r=new g,Zr=new g,Jr=new g,Kr=new w,eo=new w,to=new w,no=class extends at{get aimAxis(){return this._aimAxis}set aimAxis(e){this._aimAxis=e,this._v3AimAxis.set(e==="PositiveX"?1:e==="NegativeX"?-1:0,e==="PositiveY"?1:e==="NegativeY"?-1:0,e==="PositiveZ"?1:e==="NegativeZ"?-1:0)}get dependencies(){const e=new Set([this.source]);return this.destination.parent&&e.add(this.destination.parent),e}constructor(e,t){super(e,t),this._aimAxis="PositiveX",this._v3AimAxis=new g(1,0,0),this._dstRestQuat=new w}setInitState(){this._dstRestQuat.copy(this.destination.quaternion)}update(){this.destination.updateWorldMatrix(!0,!1),this.source.updateWorldMatrix(!0,!1);const e=Kr.identity(),t=eo.identity();this.destination.parent&&(Qr(this.destination.parent.matrixWorld,e),Oe(t.copy(e)));const n=$r.copy(this._v3AimAxis).applyQuaternion(this._dstRestQuat).applyQuaternion(e),i=wn(this.source.matrixWorld,Zr).sub(wn(this.destination.matrixWorld,Jr)).normalize(),r=to.setFromUnitVectors(n,i).premultiply(t).multiply(e).multiply(this._dstRestQuat);this.destination.quaternion.copy(this._dstRestQuat).slerp(r,this.weight)}};function io(e,t){const n=[e];let i=e.parent;for(;i!==null;)n.unshift(i),i=i.parent;n.forEach(r=>{t(r)})}var ro=class{constructor(){this._constraints=new Set,this._objectConstraintsMap=new Map}get constraints(){return this._constraints}addConstraint(e){this._constraints.add(e);let t=this._objectConstraintsMap.get(e.destination);t==null&&(t=new Set,this._objectConstraintsMap.set(e.destination,t)),t.add(e)}deleteConstraint(e){this._constraints.delete(e),this._objectConstraintsMap.get(e.destination).delete(e)}setInitState(){const e=new Set,t=new Set;for(const n of this._constraints)this._processConstraint(n,e,t,i=>i.setInitState())}update(){const e=new Set,t=new Set;for(const n of this._constraints)this._processConstraint(n,e,t,i=>i.update())}_processConstraint(e,t,n,i){if(n.has(e))return;if(t.has(e))throw new Error("VRMNodeConstraintManager: Circular dependency detected while updating constraints");t.add(e);const r=e.dependencies;for(const o of r)io(o,a=>{const l=this._objectConstraintsMap.get(a);if(l)for(const s of l)this._processConstraint(s,t,n,i)});i(e),n.add(e)}},oo=new w,so=new w,ao=class extends at{get dependencies(){return new Set([this.source])}constructor(e,t){super(e,t),this._dstRestQuat=new w,this._invSrcRestQuat=new w}setInitState(){this._dstRestQuat.copy(this.destination.quaternion),Oe(this._invSrcRestQuat.copy(this.source.quaternion))}update(){const e=oo.copy(this._invSrcRestQuat).multiply(this.source.quaternion),t=so.copy(this._dstRestQuat).multiply(e);this.destination.quaternion.copy(this._dstRestQuat).slerp(t,this.weight)}},lo=new g,uo=new w,co=new w,ho=class extends at{get rollAxis(){return this._rollAxis}set rollAxis(e){this._rollAxis=e,this._v3RollAxis.set(e==="X"?1:0,e==="Y"?1:0,e==="Z"?1:0)}get dependencies(){return new Set([this.source])}constructor(e,t){super(e,t),this._rollAxis="X",this._v3RollAxis=new g(1,0,0),this._dstRestQuat=new w,this._invDstRestQuat=new w,this._invSrcRestQuatMulDstRestQuat=new w}setInitState(){this._dstRestQuat.copy(this.destination.quaternion),Oe(this._invDstRestQuat.copy(this._dstRestQuat)),Oe(this._invSrcRestQuatMulDstRestQuat.copy(this.source.quaternion)).multiply(this._dstRestQuat)}update(){const e=uo.copy(this._invDstRestQuat).multiply(this.source.quaternion).multiply(this._invSrcRestQuatMulDstRestQuat),t=lo.copy(this._v3RollAxis).applyQuaternion(e),i=co.setFromUnitVectors(t,this._v3RollAxis).premultiply(this._dstRestQuat).multiply(e);this.destination.quaternion.copy(this._dstRestQuat).slerp(i,this.weight)}},po=new Set(["1.0","1.0-beta"]),Jn=class ve{get name(){return ve.EXTENSION_NAME}constructor(t,n){this.parser=t,this.helperRoot=n==null?void 0:n.helperRoot}afterRoot(t){return yn(this,null,function*(){t.userData.vrmNodeConstraintManager=yield this._import(t)})}_import(t){return yn(this,null,function*(){var n;const i=this.parser.json;if(!(((n=i.extensionsUsed)==null?void 0:n.indexOf(ve.EXTENSION_NAME))!==-1))return null;const o=new ro,a=yield this.parser.getDependencies("node");return a.forEach((l,s)=>{var u;const c=i.nodes[s],d=(u=c==null?void 0:c.extensions)==null?void 0:u[ve.EXTENSION_NAME];if(d==null)return;const h=d.specVersion;if(!po.has(h)){console.warn(`VRMNodeConstraintLoaderPlugin: Unknown ${ve.EXTENSION_NAME} specVersion "${h}"`);return}const p=d.constraint;if(p.roll!=null){const m=this._importRollConstraint(l,a,p.roll);o.addConstraint(m)}else if(p.aim!=null){const m=this._importAimConstraint(l,a,p.aim);o.addConstraint(m)}else if(p.rotation!=null){const m=this._importRotationConstraint(l,a,p.rotation);o.addConstraint(m)}}),t.scene.updateMatrixWorld(),o.setInitState(),o})}_importRollConstraint(t,n,i){const{source:r,rollAxis:o,weight:a}=i,l=n[r],s=new ho(t,l);if(o!=null&&(s.rollAxis=o),a!=null&&(s.weight=a),this.helperRoot){const u=new ze(s);this.helperRoot.add(u)}return s}_importAimConstraint(t,n,i){const{source:r,aimAxis:o,weight:a}=i,l=n[r],s=new no(t,l);if(o!=null&&(s.aimAxis=o),a!=null&&(s.weight=a),this.helperRoot){const u=new ze(s);this.helperRoot.add(u)}return s}_importRotationConstraint(t,n,i){const{source:r,weight:o}=i,a=n[r],l=new ao(t,a);if(o!=null&&(l.weight=o),this.helperRoot){const s=new ze(l);this.helperRoot.add(s)}return l}};Jn.EXTENSION_NAME="VRMC_node_constraint";var fo=Jn,Se=(e,t,n)=>new Promise((i,r)=>{var o=s=>{try{l(n.next(s))}catch(u){r(u)}},a=s=>{try{l(n.throw(s))}catch(u){r(u)}},l=s=>s.done?i(s.value):Promise.resolve(s.value).then(o,a);l((n=n.apply(e,t)).next())}),lt=class{},je=new g,K=new g,Kn=class extends lt{get type(){return"capsule"}constructor(e){var t,n,i,r;super(),this.offset=(t=e==null?void 0:e.offset)!=null?t:new g(0,0,0),this.tail=(n=e==null?void 0:e.tail)!=null?n:new g(0,0,0),this.radius=(i=e==null?void 0:e.radius)!=null?i:0,this.inside=(r=e==null?void 0:e.inside)!=null?r:!1}calculateCollision(e,t,n,i){je.setFromMatrixPosition(e),K.subVectors(this.tail,this.offset).applyMatrix4(e),K.sub(je);const r=K.lengthSq();i.copy(t).sub(je);const o=K.dot(i);o<=0||(r<=o||K.multiplyScalar(o/r),i.sub(K));const a=i.length(),l=this.inside?this.radius-n-a:a-n-this.radius;return l<0&&(i.multiplyScalar(1/a),this.inside&&i.negate()),l}},Xe=new g,Tn=new j,ei=class extends lt{get type(){return"plane"}constructor(e){var t,n;super(),this.offset=(t=e==null?void 0:e.offset)!=null?t:new g(0,0,0),this.normal=(n=e==null?void 0:e.normal)!=null?n:new g(0,0,1)}calculateCollision(e,t,n,i){i.setFromMatrixPosition(e),i.negate().add(t),Tn.getNormalMatrix(e),Xe.copy(this.normal).applyNormalMatrix(Tn).normalize();const r=i.dot(Xe)-n;return i.copy(Xe),r}},mo=new g,ti=class extends lt{get type(){return"sphere"}constructor(e){var t,n,i;super(),this.offset=(t=e==null?void 0:e.offset)!=null?t:new g(0,0,0),this.radius=(n=e==null?void 0:e.radius)!=null?n:0,this.inside=(i=e==null?void 0:e.inside)!=null?i:!1}calculateCollision(e,t,n,i){i.subVectors(t,mo.setFromMatrixPosition(e));const r=i.length(),o=this.inside?this.radius-n-r:r-n-this.radius;return o<0&&(i.multiplyScalar(1/r),this.inside&&i.negate()),o}},W=new g,_o=class extends G{constructor(e){super(),this.worldScale=1,this._currentRadius=0,this._currentOffset=new g,this._currentTail=new g,this._shape=e,this._attrPos=new U(new Float32Array(396),3),this.setAttribute("position",this._attrPos),this._attrIndex=new U(new Uint16Array(264),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;const t=this._shape.radius/this.worldScale;this._currentRadius!==t&&(this._currentRadius=t,e=!0),this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),e=!0);const n=W.copy(this._shape.tail).divideScalar(this.worldScale);this._currentTail.distanceToSquared(n)>1e-10&&(this._currentTail.copy(n),e=!0),e&&this._buildPosition()}_buildPosition(){W.copy(this._currentTail).sub(this._currentOffset);const e=W.length()/this._currentRadius;for(let i=0;i<=16;i++){const r=i/16*Math.PI;this._attrPos.setXYZ(i,-Math.sin(r),-Math.cos(r),0),this._attrPos.setXYZ(17+i,e+Math.sin(r),Math.cos(r),0),this._attrPos.setXYZ(34+i,-Math.sin(r),0,-Math.cos(r)),this._attrPos.setXYZ(51+i,e+Math.sin(r),0,Math.cos(r))}for(let i=0;i<32;i++){const r=i/16*Math.PI;this._attrPos.setXYZ(68+i,0,Math.sin(r),Math.cos(r)),this._attrPos.setXYZ(100+i,e,Math.sin(r),Math.cos(r))}const t=Math.atan2(W.y,Math.sqrt(W.x*W.x+W.z*W.z)),n=-Math.atan2(W.z,W.x);this.rotateZ(t),this.rotateY(n),this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<34;e++){const t=(e+1)%34;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(68+e*2,34+e,34+t)}for(let e=0;e<32;e++){const t=(e+1)%32;this._attrIndex.setXY(136+e*2,68+e,68+t),this._attrIndex.setXY(200+e*2,100+e,100+t)}this._attrIndex.needsUpdate=!0}},go=class extends G{constructor(e){super(),this.worldScale=1,this._currentOffset=new g,this._currentNormal=new g,this._shape=e,this._attrPos=new U(new Float32Array(18),3),this.setAttribute("position",this._attrPos),this._attrIndex=new U(new Uint16Array(10),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),e=!0),this._currentNormal.equals(this._shape.normal)||(this._currentNormal.copy(this._shape.normal),e=!0),e&&this._buildPosition()}_buildPosition(){this._attrPos.setXYZ(0,-.5,-.5,0),this._attrPos.setXYZ(1,.5,-.5,0),this._attrPos.setXYZ(2,.5,.5,0),this._attrPos.setXYZ(3,-.5,.5,0),this._attrPos.setXYZ(4,0,0,0),this._attrPos.setXYZ(5,0,0,.25),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this.lookAt(this._currentNormal),this._attrPos.needsUpdate=!0}_buildIndex(){this._attrIndex.setXY(0,0,1),this._attrIndex.setXY(2,1,2),this._attrIndex.setXY(4,2,3),this._attrIndex.setXY(6,3,0),this._attrIndex.setXY(8,4,5),this._attrIndex.needsUpdate=!0}},vo=class extends G{constructor(e){super(),this.worldScale=1,this._currentRadius=0,this._currentOffset=new g,this._shape=e,this._attrPos=new U(new Float32Array(288),3),this.setAttribute("position",this._attrPos),this._attrIndex=new U(new Uint16Array(192),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;const t=this._shape.radius/this.worldScale;this._currentRadius!==t&&(this._currentRadius=t,e=!0),this._currentOffset.equals(this._shape.offset)||(this._currentOffset.copy(this._shape.offset),e=!0),e&&this._buildPosition()}_buildPosition(){for(let e=0;e<32;e++){const t=e/16*Math.PI;this._attrPos.setXYZ(e,Math.cos(t),Math.sin(t),0),this._attrPos.setXYZ(32+e,0,Math.cos(t),Math.sin(t)),this._attrPos.setXYZ(64+e,Math.sin(t),0,Math.cos(t))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentOffset.x,this._currentOffset.y,this._currentOffset.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<32;e++){const t=(e+1)%32;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(64+e*2,32+e,32+t),this._attrIndex.setXY(128+e*2,64+e,64+t)}this._attrIndex.needsUpdate=!0}},Mo=new g,Ge=class extends te{constructor(e){if(super(),this.matrixAutoUpdate=!1,this.collider=e,this.collider.shape instanceof ti)this._geometry=new vo(this.collider.shape);else if(this.collider.shape instanceof Kn)this._geometry=new _o(this.collider.shape);else if(this.collider.shape instanceof ei)this._geometry=new go(this.collider.shape);else throw new Error("VRMSpringBoneColliderHelper: Unknown collider shape type detected");const t=new Ne({color:16711935,depthTest:!1,depthWrite:!1});this._line=new rt(this._geometry,t),this.add(this._line)}dispose(){this._geometry.dispose()}updateMatrixWorld(e){this.collider.updateWorldMatrix(!0,!1),this.matrix.copy(this.collider.matrixWorld);const t=this.matrix.elements;this._geometry.worldScale=Mo.set(t[0],t[1],t[2]).length(),this._geometry.update(),super.updateMatrixWorld(e)}},xo=class extends G{constructor(e){super(),this.worldScale=1,this._currentRadius=0,this._currentTail=new g,this._springBone=e,this._attrPos=new U(new Float32Array(294),3),this.setAttribute("position",this._attrPos),this._attrIndex=new U(new Uint16Array(194),1),this.setIndex(this._attrIndex),this._buildIndex(),this.update()}update(){let e=!1;const t=this._springBone.settings.hitRadius/this.worldScale;this._currentRadius!==t&&(this._currentRadius=t,e=!0),this._currentTail.equals(this._springBone.initialLocalChildPosition)||(this._currentTail.copy(this._springBone.initialLocalChildPosition),e=!0),e&&this._buildPosition()}_buildPosition(){for(let e=0;e<32;e++){const t=e/16*Math.PI;this._attrPos.setXYZ(e,Math.cos(t),Math.sin(t),0),this._attrPos.setXYZ(32+e,0,Math.cos(t),Math.sin(t)),this._attrPos.setXYZ(64+e,Math.sin(t),0,Math.cos(t))}this.scale(this._currentRadius,this._currentRadius,this._currentRadius),this.translate(this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.setXYZ(96,0,0,0),this._attrPos.setXYZ(97,this._currentTail.x,this._currentTail.y,this._currentTail.z),this._attrPos.needsUpdate=!0}_buildIndex(){for(let e=0;e<32;e++){const t=(e+1)%32;this._attrIndex.setXY(e*2,e,t),this._attrIndex.setXY(64+e*2,32+e,32+t),this._attrIndex.setXY(128+e*2,64+e,64+t)}this._attrIndex.setXY(192,96,97),this._attrIndex.needsUpdate=!0}},yo=new g,wo=class extends te{constructor(e){super(),this.matrixAutoUpdate=!1,this.springBone=e,this._geometry=new xo(this.springBone);const t=new Ne({color:16776960,depthTest:!1,depthWrite:!1});this._line=new rt(this._geometry,t),this.add(this._line)}dispose(){this._geometry.dispose()}updateMatrixWorld(e){this.springBone.bone.updateWorldMatrix(!0,!1),this.matrix.copy(this.springBone.bone.matrixWorld);const t=this.matrix.elements;this._geometry.worldScale=yo.set(t[0],t[1],t[2]).length(),this._geometry.update(),super.updateMatrixWorld(e)}},Ye=class extends Le{constructor(e){super(),this.colliderMatrix=new B,this.shape=e}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),To(this.colliderMatrix,this.matrixWorld,this.shape.offset)}};function To(e,t,n){const i=t.elements;e.copy(t),n&&(e.elements[12]=i[0]*n.x+i[4]*n.y+i[8]*n.z+i[12],e.elements[13]=i[1]*n.x+i[5]*n.y+i[9]*n.z+i[13],e.elements[14]=i[2]*n.x+i[6]*n.y+i[10]*n.z+i[14])}var Ro=new B;function So(e){return e.invert?e.invert():e.getInverse(Ro.copy(e)),e}var Eo=class{constructor(e){this._inverseCache=new B,this._shouldUpdateInverse=!0,this.matrix=e;const t={set:(n,i,r)=>(this._shouldUpdateInverse=!0,n[i]=r,!0)};this._originalElements=e.elements,e.elements=new Proxy(e.elements,t)}get inverse(){return this._shouldUpdateInverse&&(So(this._inverseCache.copy(this.matrix)),this._shouldUpdateInverse=!1),this._inverseCache}revert(){this.matrix.elements=this._originalElements}},qe=new B,oe=new g,fe=new g,me=new g,_e=new g,Ao=new B,Po=class{constructor(e,t,n={},i=[]){this._currentTail=new g,this._prevTail=new g,this._boneAxis=new g,this._worldSpaceBoneLength=0,this._center=null,this._initialLocalMatrix=new B,this._initialLocalRotation=new w,this._initialLocalChildPosition=new g;var r,o,a,l,s,u;this.bone=e,this.bone.matrixAutoUpdate=!1,this.child=t,this.settings={hitRadius:(r=n.hitRadius)!=null?r:0,stiffness:(o=n.stiffness)!=null?o:1,gravityPower:(a=n.gravityPower)!=null?a:0,gravityDir:(s=(l=n.gravityDir)==null?void 0:l.clone())!=null?s:new g(0,-1,0),dragForce:(u=n.dragForce)!=null?u:.4},this.colliderGroups=i}get dependencies(){const e=new Set,t=this.bone.parent;t&&e.add(t);for(let n=0;n<this.colliderGroups.length;n++)for(let i=0;i<this.colliderGroups[n].colliders.length;i++)e.add(this.colliderGroups[n].colliders[i]);return e}get center(){return this._center}set center(e){var t;(t=this._center)!=null&&t.userData.inverseCacheProxy&&(this._center.userData.inverseCacheProxy.revert(),delete this._center.userData.inverseCacheProxy),this._center=e,this._center&&(this._center.userData.inverseCacheProxy||(this._center.userData.inverseCacheProxy=new Eo(this._center.matrixWorld)))}get initialLocalChildPosition(){return this._initialLocalChildPosition}get _parentMatrixWorld(){return this.bone.parent?this.bone.parent.matrixWorld:qe}setInitState(){this._initialLocalMatrix.copy(this.bone.matrix),this._initialLocalRotation.copy(this.bone.quaternion),this.child?this._initialLocalChildPosition.copy(this.child.position):this._initialLocalChildPosition.copy(this.bone.position).normalize().multiplyScalar(.07);const e=this._getMatrixWorldToCenter();this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(e),this._prevTail.copy(this._currentTail),this._boneAxis.copy(this._initialLocalChildPosition).normalize()}reset(){this.bone.quaternion.copy(this._initialLocalRotation),this.bone.updateMatrix(),this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld,this.bone.matrix);const e=this._getMatrixWorldToCenter();this.bone.localToWorld(this._currentTail.copy(this._initialLocalChildPosition)).applyMatrix4(e),this._prevTail.copy(this._currentTail)}update(e){if(e<=0)return;this._calcWorldSpaceBoneLength();const t=fe.copy(this._boneAxis).transformDirection(this._initialLocalMatrix).transformDirection(this._parentMatrixWorld);_e.copy(this._currentTail).add(oe.subVectors(this._currentTail,this._prevTail).multiplyScalar(1-this.settings.dragForce)).applyMatrix4(this._getMatrixCenterToWorld()).addScaledVector(t,this.settings.stiffness*e).addScaledVector(this.settings.gravityDir,this.settings.gravityPower*e),me.setFromMatrixPosition(this.bone.matrixWorld),_e.sub(me).normalize().multiplyScalar(this._worldSpaceBoneLength).add(me),this._collision(_e),this._prevTail.copy(this._currentTail),this._currentTail.copy(_e).applyMatrix4(this._getMatrixWorldToCenter());const n=Ao.multiplyMatrices(this._parentMatrixWorld,this._initialLocalMatrix).invert();this.bone.quaternion.setFromUnitVectors(this._boneAxis,oe.copy(_e).applyMatrix4(n).normalize()).premultiply(this._initialLocalRotation),this.bone.updateMatrix(),this.bone.matrixWorld.multiplyMatrices(this._parentMatrixWorld,this.bone.matrix)}_collision(e){for(let t=0;t<this.colliderGroups.length;t++)for(let n=0;n<this.colliderGroups[t].colliders.length;n++){const i=this.colliderGroups[t].colliders[n],r=i.shape.calculateCollision(i.colliderMatrix,e,this.settings.hitRadius,oe);if(r<0){e.addScaledVector(oe,-r),e.sub(me);const o=e.length();e.multiplyScalar(this._worldSpaceBoneLength/o).add(me)}}}_calcWorldSpaceBoneLength(){oe.setFromMatrixPosition(this.bone.matrixWorld),this.child?fe.setFromMatrixPosition(this.child.matrixWorld):(fe.copy(this._initialLocalChildPosition),fe.applyMatrix4(this.bone.matrixWorld)),this._worldSpaceBoneLength=oe.sub(fe).length()}_getMatrixCenterToWorld(){return this._center?this._center.matrixWorld:qe}_getMatrixWorldToCenter(){return this._center?this._center.userData.inverseCacheProxy.inverse:qe}};function Lo(e,t){const n=[];let i=e;for(;i!==null;)n.unshift(i),i=i.parent;n.forEach(r=>{t(r)})}function tt(e,t){e.children.forEach(n=>{t(n)||tt(n,t)})}function bo(e){var t;const n=new Map;for(const i of e){let r=i;do{const o=((t=n.get(r))!=null?t:0)+1;if(o===e.size)return r;n.set(r,o),r=r.parent}while(r!==null)}return null}var Rn=class{constructor(){this._joints=new Set,this._sortedJoints=[],this._hasWarnedCircularDependency=!1,this._ancestors=[],this._objectSpringBonesMap=new Map,this._isSortedJointsDirty=!1,this._relevantChildrenUpdated=this._relevantChildrenUpdated.bind(this)}get joints(){return this._joints}get springBones(){return console.warn("VRMSpringBoneManager: springBones is deprecated. use joints instead."),this._joints}get colliderGroups(){const e=new Set;return this._joints.forEach(t=>{t.colliderGroups.forEach(n=>{e.add(n)})}),Array.from(e)}get colliders(){const e=new Set;return this.colliderGroups.forEach(t=>{t.colliders.forEach(n=>{e.add(n)})}),Array.from(e)}addJoint(e){this._joints.add(e);let t=this._objectSpringBonesMap.get(e.bone);t==null&&(t=new Set,this._objectSpringBonesMap.set(e.bone,t)),t.add(e),this._isSortedJointsDirty=!0}addSpringBone(e){console.warn("VRMSpringBoneManager: addSpringBone() is deprecated. use addJoint() instead."),this.addJoint(e)}deleteJoint(e){this._joints.delete(e),this._objectSpringBonesMap.get(e.bone).delete(e),this._isSortedJointsDirty=!0}deleteSpringBone(e){console.warn("VRMSpringBoneManager: deleteSpringBone() is deprecated. use deleteJoint() instead."),this.deleteJoint(e)}setInitState(){this._sortJoints();for(let e=0;e<this._sortedJoints.length;e++){const t=this._sortedJoints[e];t.bone.updateMatrix(),t.bone.updateWorldMatrix(!1,!1),t.setInitState()}}reset(){this._sortJoints();for(let e=0;e<this._sortedJoints.length;e++){const t=this._sortedJoints[e];t.bone.updateMatrix(),t.bone.updateWorldMatrix(!1,!1),t.reset()}}update(e){this._sortJoints();for(let t=0;t<this._ancestors.length;t++)this._ancestors[t].updateWorldMatrix(t===0,!1);for(let t=0;t<this._sortedJoints.length;t++){const n=this._sortedJoints[t];n.bone.updateMatrix(),n.bone.updateWorldMatrix(!1,!1),n.update(e),tt(n.bone,this._relevantChildrenUpdated)}}_sortJoints(){if(!this._isSortedJointsDirty)return;const e=[],t=new Set,n=new Set,i=new Set;for(const o of this._joints)this._insertJointSort(o,t,n,e,i);this._sortedJoints=e;const r=bo(i);this._ancestors=[],r&&(this._ancestors.push(r),tt(r,o=>{var a,l;return((l=(a=this._objectSpringBonesMap.get(o))==null?void 0:a.size)!=null?l:0)>0?!0:(this._ancestors.push(o),!1)})),this._isSortedJointsDirty=!1}_insertJointSort(e,t,n,i,r){if(n.has(e))return;if(t.has(e)){this._hasWarnedCircularDependency||(console.warn("VRMSpringBoneManager: Circular dependency detected"),this._hasWarnedCircularDependency=!0);return}t.add(e);const o=e.dependencies;for(const a of o){let l=!1,s=null;Lo(a,u=>{const c=this._objectSpringBonesMap.get(u);if(c)for(const d of c)l=!0,this._insertJointSort(d,t,n,i,r);else l||(s=u)}),s&&r.add(s)}i.push(e),n.add(e)}_relevantChildrenUpdated(e){var t,n;return((n=(t=this._objectSpringBonesMap.get(e))==null?void 0:t.size)!=null?n:0)>0?!0:(e.updateWorldMatrix(!1,!1),!1)}},Sn="VRMC_springBone_extended_collider",Io=new Set(["1.0","1.0-beta"]),Oo=new Set(["1.0"]),ni=class ae{get name(){return ae.EXTENSION_NAME}constructor(t,n){var i;this.parser=t,this.jointHelperRoot=n==null?void 0:n.jointHelperRoot,this.colliderHelperRoot=n==null?void 0:n.colliderHelperRoot,this.useExtendedColliders=(i=n==null?void 0:n.useExtendedColliders)!=null?i:!0}afterRoot(t){return Se(this,null,function*(){t.userData.vrmSpringBoneManager=yield this._import(t)})}_import(t){return Se(this,null,function*(){const n=yield this._v1Import(t);if(n!=null)return n;const i=yield this._v0Import(t);return i??null})}_v1Import(t){return Se(this,null,function*(){var n,i,r,o,a;const l=t.parser.json;if(!(((n=l.extensionsUsed)==null?void 0:n.indexOf(ae.EXTENSION_NAME))!==-1))return null;const u=new Rn,c=yield t.parser.getDependencies("node"),d=(i=l.extensions)==null?void 0:i[ae.EXTENSION_NAME];if(!d)return null;const h=d.specVersion;if(!Io.has(h))return console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${ae.EXTENSION_NAME} specVersion "${h}"`),null;const p=(r=d.colliders)==null?void 0:r.map((f,_)=>{var v,M,R,T,x,y,S,A,I,P,L,O,Y,le,ue;const X=c[f.node];if(X==null)return console.warn(`VRMSpringBoneLoaderPlugin: The collider #${_} attempted to reference a node #${f.node} but not found. Skipping the collider`),null;const F=f.shape,ne=(v=f.extensions)==null?void 0:v[Sn];if(this.useExtendedColliders&&ne!=null){const de=ne.specVersion;if(!Oo.has(de))console.warn(`VRMSpringBoneLoaderPlugin: Unknown ${Sn} specVersion "${de}". Fallbacking to the ${ae.EXTENSION_NAME} definition`);else{const N=ne.shape;if(N.sphere)return this._importSphereCollider(X,{offset:new g().fromArray((M=N.sphere.offset)!=null?M:[0,0,0]),radius:(R=N.sphere.radius)!=null?R:0,inside:(T=N.sphere.inside)!=null?T:!1});if(N.capsule)return this._importCapsuleCollider(X,{offset:new g().fromArray((x=N.capsule.offset)!=null?x:[0,0,0]),radius:(y=N.capsule.radius)!=null?y:0,tail:new g().fromArray((S=N.capsule.tail)!=null?S:[0,0,0]),inside:(A=N.capsule.inside)!=null?A:!1});if(N.plane)return this._importPlaneCollider(X,{offset:new g().fromArray((I=N.plane.offset)!=null?I:[0,0,0]),normal:new g().fromArray((P=N.plane.normal)!=null?P:[0,0,1])})}}if(F.sphere)return this._importSphereCollider(X,{offset:new g().fromArray((L=F.sphere.offset)!=null?L:[0,0,0]),radius:(O=F.sphere.radius)!=null?O:0,inside:!1});if(F.capsule)return this._importCapsuleCollider(X,{offset:new g().fromArray((Y=F.capsule.offset)!=null?Y:[0,0,0]),radius:(le=F.capsule.radius)!=null?le:0,tail:new g().fromArray((ue=F.capsule.tail)!=null?ue:[0,0,0]),inside:!1});console.warn(`VRMSpringBoneLoaderPlugin: The collider #${_} has no valid shape. Skipping the collider`)}),m=(o=d.colliderGroups)==null?void 0:o.map((f,_)=>{var v;return{colliders:((v=f.colliders)!=null?v:[]).map(R=>{const T=p==null?void 0:p[R];return T??(console.warn(`VRMSpringBoneLoaderPlugin: The collider group #${_} attempted to reference a collider #${R} but not found. Skipping the collider`),null)}).filter(R=>R!=null),name:f.name}});return(a=d.springs)==null||a.forEach((f,_)=>{var v;const M=f.joints,R=(v=f.colliderGroups)==null?void 0:v.map(y=>{const S=m==null?void 0:m[y];return S??(console.warn(`VRMSpringBoneLoaderPlugin: The spring #${_} attempted to reference a collider group #${y} but not found. Skipping the collider group`),null)}).filter(y=>y!=null),T=f.center!=null?c[f.center]:void 0;let x;M.forEach(y=>{if(x){const S=x.node,A=c[S],I=y.node,P=c[I],L={hitRadius:x.hitRadius,dragForce:x.dragForce,gravityPower:x.gravityPower,stiffness:x.stiffness,gravityDir:x.gravityDir!=null?new g().fromArray(x.gravityDir):void 0},O=this._importJoint(A,P,L,R);T&&(O.center=T),u.addJoint(O)}x=y})}),u.setInitState(),u})}_v0Import(t){return Se(this,null,function*(){var n,i,r;const o=t.parser.json;if(!(((n=o.extensionsUsed)==null?void 0:n.indexOf("VRM"))!==-1))return null;const l=(i=o.extensions)==null?void 0:i.VRM,s=l==null?void 0:l.secondaryAnimation;if(!s)return null;const u=s==null?void 0:s.boneGroups;if(!u)return null;const c=new Rn,d=yield t.parser.getDependencies("node"),h=(r=s.colliderGroups)==null?void 0:r.map((p,m)=>{var f;const _=d[p.node];return _==null?(console.warn(`VRMSpringBoneLoaderPlugin: The collider group #${m} attempted to reference a node #${p.node} but not found. Skipping the collider group`),null):{colliders:((f=p.colliders)!=null?f:[]).map((M,R)=>{var T,x,y;const S=new g(0,0,0);return M.offset&&S.set((T=M.offset.x)!=null?T:0,(x=M.offset.y)!=null?x:0,M.offset.z?-M.offset.z:0),this._importSphereCollider(_,{offset:S,radius:(y=M.radius)!=null?y:0,inside:!1})})}});return u==null||u.forEach((p,m)=>{const f=p.bones;f&&f.forEach(_=>{var v,M,R,T;const x=d[_];if(x==null){console.warn(`VRMSpringBoneLoaderPlugin: The spring bone group #${m} attempted to reference a node #${_} but not found. Skipping the node`);return}const y=new g;p.gravityDir?y.set((v=p.gravityDir.x)!=null?v:0,(M=p.gravityDir.y)!=null?M:0,(R=p.gravityDir.z)!=null?R:0):y.set(0,-1,0);const S=p.center!=null?d[p.center]:void 0,A={hitRadius:p.hitRadius,dragForce:p.dragForce,gravityPower:p.gravityPower,stiffness:p.stiffiness,gravityDir:y},I=(T=p.colliderGroups)==null?void 0:T.map(P=>{const L=h==null?void 0:h[P];return L??(console.warn(`VRMSpringBoneLoaderPlugin: The spring #${m} attempted to reference a collider group #${P} but not found. Skipping the collider group`),null)}).filter(P=>P!=null);x.traverse(P=>{var L;const O=(L=P.children[0])!=null?L:null,Y=this._importJoint(P,O,A,I);S&&(Y.center=S),c.addJoint(Y)})})}),t.scene.updateMatrixWorld(),c.setInitState(),c})}_importJoint(t,n,i,r){const o=new Po(t,n,i,r);if(this.jointHelperRoot){const a=new wo(o);this.jointHelperRoot.add(a),a.renderOrder=this.jointHelperRoot.renderOrder}return o}_importSphereCollider(t,n){const i=new ti(n),r=new Ye(i);if(t.add(r),this.colliderHelperRoot){const o=new Ge(r);this.colliderHelperRoot.add(o),o.renderOrder=this.colliderHelperRoot.renderOrder}return r}_importCapsuleCollider(t,n){const i=new Kn(n),r=new Ye(i);if(t.add(r),this.colliderHelperRoot){const o=new Ge(r);this.colliderHelperRoot.add(o),o.renderOrder=this.colliderHelperRoot.renderOrder}return r}_importPlaneCollider(t,n){const i=new ei(n),r=new Ye(i);if(t.add(r),this.colliderHelperRoot){const o=new Ge(r);this.colliderHelperRoot.add(o),o.renderOrder=this.colliderHelperRoot.renderOrder}return r}};ni.EXTENSION_NAME="VRMC_springBone";var Co=ni,Uo=class{get name(){return"VRMLoaderPlugin"}constructor(e,t){var n,i,r,o,a,l,s,u,c,d;this.parser=e;const h=t==null?void 0:t.helperRoot,p=t==null?void 0:t.autoUpdateHumanBones;this.expressionPlugin=(n=t==null?void 0:t.expressionPlugin)!=null?n:new Qi(e),this.firstPersonPlugin=(i=t==null?void 0:t.firstPersonPlugin)!=null?i:new Zi(e),this.humanoidPlugin=(r=t==null?void 0:t.humanoidPlugin)!=null?r:new rr(e,{helperRoot:h,autoUpdateHumanBones:p}),this.lookAtPlugin=(o=t==null?void 0:t.lookAtPlugin)!=null?o:new Mr(e,{helperRoot:h}),this.metaPlugin=(a=t==null?void 0:t.metaPlugin)!=null?a:new wr(e),this.mtoonMaterialPlugin=(l=t==null?void 0:t.mtoonMaterialPlugin)!=null?l:new Dr(e),this.materialsHDREmissiveMultiplierPlugin=(s=t==null?void 0:t.materialsHDREmissiveMultiplierPlugin)!=null?s:new Fr(e),this.materialsV0CompatPlugin=(u=t==null?void 0:t.materialsV0CompatPlugin)!=null?u:new Gr(e),this.springBonePlugin=(c=t==null?void 0:t.springBonePlugin)!=null?c:new Co(e,{colliderHelperRoot:h,jointHelperRoot:h}),this.nodeConstraintPlugin=(d=t==null?void 0:t.nodeConstraintPlugin)!=null?d:new fo(e,{helperRoot:h})}beforeRoot(){return we(this,null,function*(){yield this.materialsV0CompatPlugin.beforeRoot(),yield this.mtoonMaterialPlugin.beforeRoot()})}loadMesh(e){return we(this,null,function*(){return yield this.mtoonMaterialPlugin.loadMesh(e)})}getMaterialType(e){const t=this.mtoonMaterialPlugin.getMaterialType(e);return t??null}extendMaterialParams(e,t){return we(this,null,function*(){yield this.materialsHDREmissiveMultiplierPlugin.extendMaterialParams(e,t),yield this.mtoonMaterialPlugin.extendMaterialParams(e,t)})}afterRoot(e){return we(this,null,function*(){yield this.metaPlugin.afterRoot(e),yield this.humanoidPlugin.afterRoot(e),yield this.expressionPlugin.afterRoot(e),yield this.lookAtPlugin.afterRoot(e),yield this.firstPersonPlugin.afterRoot(e),yield this.springBonePlugin.afterRoot(e),yield this.nodeConstraintPlugin.afterRoot(e),yield this.mtoonMaterialPlugin.afterRoot(e);const t=e.userData.vrmMeta,n=e.userData.vrmHumanoid;if(t&&n){const i=new Rr({scene:e.scene,expressionManager:e.userData.vrmExpressionManager,firstPerson:e.userData.vrmFirstPerson,humanoid:n,lookAt:e.userData.vrmLookAt,meta:t,materials:e.userData.vrmMToonMaterials,springBoneManager:e.userData.vrmSpringBoneManager,nodeConstraintManager:e.userData.vrmNodeConstraintManager});e.userData.vrm=i}})}};function No(e){const t=new Set;return e.traverse(n=>{if(!n.isMesh)return;const i=n;t.add(i)}),t}function En(e,t,n){if(t.size===1){const a=t.values().next().value;if(a.weight===1)return e[a.index]}const i=new Float32Array(e[0].count*3);let r=0;if(n)r=1;else for(const a of t)r+=a.weight;for(const a of t){const l=e[a.index],s=a.weight/r;for(let u=0;u<l.count;u++)i[u*3+0]+=l.getX(u)*s,i[u*3+1]+=l.getY(u)*s,i[u*3+2]+=l.getZ(u)*s}return new U(i,3)}function Vo(e){var t;const n=No(e.scene),i=new Map,r=(t=e.expressionManager)==null?void 0:t.expressionMap;if(r!=null)for(const[o,a]of Object.entries(r)){const l=new Set;for(const s of a.binds)if(s instanceof Ie){if(s.weight!==0)for(const u of s.primitives){let c=i.get(u);c==null&&(c=new Map,i.set(u,c));let d=c.get(o);d==null&&(d=new Set,c.set(o,d)),d.add(s)}l.add(s)}for(const s of l)a.deleteBind(s)}for(const o of n){const a=i.get(o);if(a==null)continue;const l=o.geometry.morphAttributes;o.geometry.morphAttributes={};const s=o.geometry.clone();o.geometry=s;const u=s.morphTargetsRelative,c=l.position!=null,d=l.normal!=null,h={},p={},m=[];if(c||d){c&&(h.position=[]),d&&(h.normal=[]);let f=0;for(const[_,v]of a)c&&(h.position[f]=En(l.position,v,u)),d&&(h.normal[f]=En(l.normal,v,u)),r==null||r[_].addBind(new Ie({index:f,weight:1,primitives:[o]})),p[_]=f,m.push(0),f++}s.morphAttributes=h,o.morphTargetDictionary=p,o.morphTargetInfluences=m}}function Ce(e,t,n){if(e.getComponent)return e.getComponent(t,n);{let i=e.array[t*e.itemSize+n];return e.normalized&&(i=b.denormalize(i,e.array)),i}}function ii(e,t,n,i){e.setComponent?e.setComponent(t,n,i):(e.normalized&&(i=b.normalize(i,e.array)),e.array[t*e.itemSize+n]=i)}function Do(e){var t;const n=Bo(e),i=new Set;for(const d of n)i.has(d.geometry)&&(d.geometry=jo(d.geometry)),i.add(d.geometry);const r=new Map;for(const d of i){const h=d.getAttribute("skinIndex"),p=(t=r.get(h))!=null?t:new Map;r.set(h,p);const m=d.getAttribute("skinWeight"),f=Fo(h,m);p.set(m,f)}const o=new Map;for(const d of n){const h=Ho(d,r);o.set(d,h)}const a=[];for(const[d,h]of o){let p=!1;for(const m of a)if(ko(h,m.boneInverseMap)){p=!0,m.meshes.add(d);for(const[_,v]of h)m.boneInverseMap.set(_,v);break}p||a.push({boneInverseMap:h,meshes:new Set([d])})}const l=new Map,s=new Qe,u=new Qe,c=new Qe;for(const d of a){const{boneInverseMap:h,meshes:p}=d,m=Array.from(h.keys()),f=Array.from(h.values()),_=new ot(m,f),v=u.getOrCreate(_);for(const M of p){const R=M.geometry.getAttribute("skinIndex"),T=s.getOrCreate(R),x=M.skeleton.bones,y=x.map(I=>c.getOrCreate(I)).join(","),S=`${T};${v};${y}`;let A=l.get(S);A==null&&(A=R.clone(),Wo(A,x,m),l.set(S,A)),M.geometry.setAttribute("skinIndex",A)}for(const M of p)M.bind(_,new B)}}function Bo(e){const t=new Set;return e.traverse(n=>{if(!n.isSkinnedMesh)return;const i=n;t.add(i)}),t}function Fo(e,t){const n=new Set;for(let i=0;i<e.count;i++)for(let r=0;r<e.itemSize;r++){const o=Ce(e,i,r);Ce(t,i,r)!==0&&n.add(o)}return n}function Ho(e,t){const n=new Map,i=e.skeleton,r=e.geometry,o=r.getAttribute("skinIndex"),a=r.getAttribute("skinWeight"),l=t.get(o),s=l==null?void 0:l.get(a);if(!s)throw new Error("Unreachable. attributeUsedIndexSetMap does not know the skin index attribute or the skin weight attribute.");for(const u of s)n.set(i.bones[u],i.boneInverses[u]);return n}function ko(e,t){for(const[n,i]of e.entries()){const r=t.get(n);if(r!=null&&!zo(i,r))return!1}return!0}function Wo(e,t,n){const i=new Map;for(const o of t)i.set(o,i.size);const r=new Map;for(const[o,a]of n.entries()){const l=i.get(a);r.set(l,o)}for(let o=0;o<e.count;o++)for(let a=0;a<e.itemSize;a++){const l=Ce(e,o,a),s=r.get(l);ii(e,o,a,s)}e.needsUpdate=!0}function zo(e,t,n){if(n=n||1e-4,e.elements.length!=t.elements.length)return!1;for(let i=0,r=e.elements.length;i<r;i++)if(Math.abs(e.elements[i]-t.elements[i])>n)return!1;return!0}var Qe=class{constructor(){this._objectIndexMap=new Map,this._index=0}get(e){return this._objectIndexMap.get(e)}getOrCreate(e){let t=this._objectIndexMap.get(e);return t==null&&(t=this._index,this._objectIndexMap.set(e,t),this._index++),t}};function jo(e){var t,n,i,r;const o=new G;o.name=e.name,o.setIndex(e.index);for(const[a,l]of Object.entries(e.attributes))o.setAttribute(a,l);for(const[a,l]of Object.entries(e.morphAttributes)){const s=a;o.morphAttributes[s]=l.concat()}o.morphTargetsRelative=e.morphTargetsRelative,o.groups=[];for(const a of e.groups)o.addGroup(a.start,a.count,a.materialIndex);return o.boundingSphere=(n=(t=e.boundingSphere)==null?void 0:t.clone())!=null?n:null,o.boundingBox=(r=(i=e.boundingBox)==null?void 0:i.clone())!=null?r:null,o.drawRange.start=e.drawRange.start,o.drawRange.count=e.drawRange.count,o.userData=e.userData,o}function An(e){if(Object.values(e).forEach(t=>{t!=null&&t.isTexture&&t.dispose()}),e.isShaderMaterial){const t=e.uniforms;t&&Object.values(t).forEach(n=>{const i=n.value;i!=null&&i.isTexture&&i.dispose()})}e.dispose()}function Xo(e){const t=e.geometry;t&&t.dispose();const n=e.skeleton;n&&n.dispose();const i=e.material;i&&(Array.isArray(i)?i.forEach(r=>An(r)):i&&An(i))}function Go(e){e.traverse(Xo)}function Yo(e,t){var n,i;console.warn("VRMUtils.removeUnnecessaryJoints: removeUnnecessaryJoints is deprecated. Use combineSkeletons instead. combineSkeletons contributes more to the performance improvement. This function will be removed in the next major version.");const r=(n=t==null?void 0:t.experimentalSameBoneCounts)!=null?n:!1,o=[];e.traverse(s=>{s.type==="SkinnedMesh"&&o.push(s)});const a=new Map;let l=0;for(const s of o){const c=s.geometry.getAttribute("skinIndex");if(a.has(c))continue;const d=new Map,h=new Map;for(let p=0;p<c.count;p++)for(let m=0;m<c.itemSize;m++){const f=Ce(c,p,m);let _=d.get(f);_==null&&(_=d.size,d.set(f,_),h.set(_,f)),ii(c,p,m,_)}c.needsUpdate=!0,a.set(c,h),l=Math.max(l,d.size)}for(const s of o){const c=s.geometry.getAttribute("skinIndex"),d=a.get(c),h=[],p=[],m=r?l:d.size;for(let _=0;_<m;_++){const v=(i=d.get(_))!=null?i:0;h.push(s.skeleton.bones[v]),p.push(s.skeleton.boneInverses[v])}const f=new ot(h,p);s.bind(f,new B)}}function qo(e,t){const n=e.position.count,i=new Array(n);let r=0;const o=t.array;for(let a=0;a<o.length;a++){const l=o[a];i[l]||(i[l]=!0,r++)}return{isVertexUsed:i,vertexCount:n,verticesUsed:r}}function Qo(e){const t=[],n=[];let i=0;for(let r=0;r<e.length;r++)if(e[r]){const o=i++;t[r]=o,n[o]=r}return{originalIndexNewIndexMap:t,newIndexOriginalIndexMap:n}}function $o(e,t){var n,i,r,o;t.name=e.name,t.morphTargetsRelative=e.morphTargetsRelative,e.groups.forEach(a=>{t.addGroup(a.start,a.count,a.materialIndex)}),t.boundingBox=(i=(n=e.boundingBox)==null?void 0:n.clone())!=null?i:null,t.boundingSphere=(o=(r=e.boundingSphere)==null?void 0:r.clone())!=null?o:null,t.setDrawRange(e.drawRange.start,e.drawRange.count),t.userData=e.userData}function Zo(e,t,n){const i=t.array,r=new i.constructor(i.length);for(let o=0;o<i.length;o++){const a=i[o];r[o]=n[a]}e.setIndex(new U(r,t.itemSize,t.normalized))}function Ue(e,t,n){const i=e.constructor,r=new i(t.length*n);let o=!0;for(let a=0;a<t.length;a++){const s=t[a]*n,u=a*n;for(let c=0;c<n;c++){const d=e[s+c];r[u+c]=d,o=o&&d===0}}return[r,o]}function Jo(e){var t;const n=new Map,i=[];for(const[r,o]of Object.entries(e))if(o.isInterleavedBufferAttribute){const a=o,l=a.data,s=(t=n.get(l))!=null?t:[];n.set(l,s),s.push([r,a])}else{const a=o;i.push([r,a])}return[n,i]}function Ko(e,t,n){const[i,r]=Jo(t);for(const[o,a]of i){const l=o.array,{stride:s}=o,[u]=Ue(l,n,s),c=new Un(u,s);c.setUsage(o.usage);for(const[d,h]of a){const{itemSize:p,offset:m,normalized:f}=h,_=new Nn(c,p,m,f);e.setAttribute(d,_)}}for(const[o,a]of r){const l=a.array,{itemSize:s,normalized:u}=a,[c]=Ue(l,n,s);e.setAttribute(o,new U(c,s,u))}}function es(e){var t;const n=new Map,i=[];for(const[r,o]of Object.entries(e)){const a=r;for(let l=0;l<o.length;l++){const s=o[l];if(s.isInterleavedBufferAttribute){const u=s,c=u.data,d=(t=n.get(c))!=null?t:[];n.set(c,d),d.push([a,l,u])}else{const u=s;i.push([a,l,u])}}}return[n,i]}function ts(e,t,n){var i,r;let o=!0;const[a,l]=es(t),s={};for(const[u,c]of a){const d=u.array,{stride:h}=u,[p,m]=Ue(d,n,h);o=o&&m;const f=new Un(p,h);f.setUsage(u.usage);for(const[_,v,M]of c){const{itemSize:R,offset:T,normalized:x}=M,y=new Nn(f,R,T,x);(i=s[_])!=null||(s[_]=[]),s[_][v]=y}}for(const[u,c,d]of l){const h=d,p=h.array,{itemSize:m,normalized:f}=h,[_,v]=Ue(p,n,m);o=o&&v,(r=s[u])!=null||(s[u]=[]),s[u][c]=new U(_,m,f)}e.morphAttributes=o?{}:s}function ns(e){const t=new Map;e.traverse(n=>{if(!n.isMesh)return;const i=n,r=i.geometry,o=r.index;if(o==null)return;const a=t.get(r);if(a!=null){i.geometry=a;return}const{isVertexUsed:l,vertexCount:s,verticesUsed:u}=qo(r.attributes,o);if(u===s)return;const{originalIndexNewIndexMap:c,newIndexOriginalIndexMap:d}=Qo(l),h=new G;$o(r,h),t.set(r,h),Zo(h,o,c),Ko(h,r.attributes,d),ts(h,r.morphAttributes,d),i.geometry=h}),Array.from(t.keys()).forEach(n=>{n.dispose()})}function is(e){var t;((t=e.meta)==null?void 0:t.metaVersion)==="0"&&(e.scene.rotation.y=Math.PI)}var Q=class{constructor(){}};Q.combineMorphs=Vo;Q.combineSkeletons=Do;Q.deepDispose=Go;Q.removeUnnecessaryJoints=Yo;Q.removeUnnecessaryVertices=ns;Q.rotateVRM0=is;/*!
 * @pixiv/three-vrm-core v3.5.5
 * The implementation of core features of VRM, for @pixiv/three-vrm
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm-core is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 *//*!
 * @pixiv/three-vrm-materials-mtoon v3.5.5
 * MToon (toon material) module for @pixiv/three-vrm
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm-materials-mtoon is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 *//*!
 * @pixiv/three-vrm-materials-hdr-emissive-multiplier v3.5.5
 * Support VRMC_hdr_emissiveMultiplier for @pixiv/three-vrm
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm-materials-hdr-emissive-multiplier is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 *//*!
 * @pixiv/three-vrm-materials-v0compat v3.5.5
 * VRM0.0 materials compatibility layer plugin for @pixiv/three-vrm
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm-materials-v0compat is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 *//*!
 * @pixiv/three-vrm-node-constraint v3.5.5
 * Node constraint module for @pixiv/three-vrm
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm-node-constraint is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 *//*!
 * @pixiv/three-vrm-springbone v3.5.5
 * Spring bone module for @pixiv/three-vrm
 *
 * Copyright (c) 2019-2026 pixiv Inc.
 * @pixiv/three-vrm-springbone is distributed under MIT License
 * https://github.com/pixiv/three-vrm/blob/release/LICENSE
 */const C=e=>e.getWorldPosition(new g),Pn=e=>e.getWorldQuaternion(new w);function ut(e,t){const n=Pn(e.parent);e.quaternion.copy(n.invert().multiply(t).multiply(Pn(e))),e.updateWorldMatrix(!1,!0)}function nt(e,t,n){const i=C(e),r=C(t).sub(i).normalize(),o=n.clone().sub(i).normalize();ut(e,new w().setFromUnitVectors(r,o))}function Ln(e,t,n,i){const r=e(t+"UpperArm"),o=e(t+"LowerArm"),a=e(t+"Hand"),l=C(r),s=C(o),u=l.distanceTo(s),c=s.distanceTo(C(a)),d=n.clone().sub(l),h=b.clamp(d.length(),Math.abs(u-c)+1e-4,u+c-1e-4);d.normalize();const p=i.clone().sub(l);p.addScaledVector(d,-p.dot(d)).normalize();const m=(u*u-c*c+h*h)/(2*h),f=Math.sqrt(Math.max(0,u*u-m*m)),_=l.clone().addScaledVector(d,m).addScaledVector(p,f);nt(r,o,_),nt(o,a,l.addScaledVector(d,h))}function bn(e,t){const n=e(t+"Hand"),i=e(t+"MiddleProximal"),r=e(t+"IndexProximal"),o=e(t+"LittleProximal"),a=C(i).sub(C(n)),l=C(o).sub(C(r)),s=a.cross(l).y<0?-1:1;return{hand:n,middle:i,index:r,little:o,sign:s}}function In({hand:e,middle:t,index:n,little:i,sign:r},o,a){const l=C(t).sub(C(e)).normalize(),s=C(i).sub(C(n)).multiplyScalar(r);s.addScaledVector(l,-s.dot(l)).normalize();const u=l.clone().cross(s),c=a.clone().cross(o).normalize(),d=o.clone().cross(c),h=new w().setFromRotationMatrix(new B().makeBasis(l,s,u)),p=new w().setFromRotationMatrix(new B().makeBasis(o,c,d));ut(e,p.multiply(h.invert()))}function On(e,t,n,i){const r=n.clone().negate();for(const o of["Index","Middle","Ring","Little"]){const a=["Proximal","Intermediate","Distal"].map(l=>e(t+o+l));for(const[l,s]of a.entries()){const u=a[l+1],d=(u?C(u).sub(C(s)).normalize():C(s).sub(C(a[l-1])).normalize()).cross(r).normalize();ut(s,new w().setFromAxisAngle(d,i[l]))}}}const z=(e,t,n)=>new g(e,t,n),Cn=e=>e.getWorldPosition(new g),rs=e=>e.getWorldQuaternion(new w);async function ri(){const e=new Xi;e.register(i=>new Uo(i));const n=(await e.loadAsync("./visitor/AvatarSample_C.vrm")).userData.vrm;if(!n)throw new Error("The visitor model did not contain a VRM humanoid.");return Q.rotateVRM0(n),Q.combineSkeletons(n.scene),n}async function os(e,t,n){var _,v;const i=await ri(),r=new te;r.add(i.scene),r.scale.setScalar(.58),r.rotation.set(.43,.055,0);const o=M=>i.humanoid.getNormalizedBoneNode(M);o("spine").rotation.x=-.16,o("chest").rotation.x=-.1,o("head").rotation.set(.53,-.065,-.04),r.updateMatrixWorld(!0),r.position.copy(z(-.098,.112,.034).sub(Cn(o("head")))),r.updateMatrixWorld(!0);const a=bn(o,"right"),l=bn(o,"left");t.updateWorldMatrix(!0,!1);const s=rs(t);Ln(o,"right",z(-.255,n+.023,.016),z(-.245,-.042,-.05));const u=z(-.03,-.56,.83).normalize(),c=z(0,.83,.56).normalize();In(a,u,c),On(o,"right",c,[.16,.34,.23]);const d=t.localToWorld(z(-.145,.005,.035));Ln(o,"left",d,z(.108,-.082,-.012));const h=z(1,.11,0).normalize().applyQuaternion(s),p=z(0,0,1).applyQuaternion(s);In(l,h,p),On(o,"left",p,[.1,.28,.18]);const m=o("leftThumbMetacarpal"),f=z(.55,-.32,-.67).normalize().applyQuaternion(s);nt(m,o("leftThumbProximal"),Cn(m).add(f)),i.scene.traverse(M=>{M.isMesh&&(M.frustumCulled=!1,M.castShadow=!M.material.transparent)});for(const M of i.materials??[])(_=M.color)==null||_.multiplyScalar(.83);return(v=i.expressionManager)==null||v.setValue("happy",.18),i.update(0),e.add(r),i}const ds=Object.freeze(Object.defineProperty({__proto__:null,loadHumanoidAvatar:ri,loadVisitorAvatar:os},Symbol.toStringTag,{value:"Module"}));export{In as a,Ln as b,On as c,ri as l,bn as r,ds as v};
