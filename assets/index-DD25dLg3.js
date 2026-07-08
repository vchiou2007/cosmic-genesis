import{C as T,B as k,a as u,S as P,A as R,P as E,V as v,D as ut,M as D,G as ot,b as W,F as dt,c as rt,d as $,O as mt,e as st,U as V,f as A,W as U,H as G,N as pt,g as nt,R as gt,h as ft,i as vt,L as bt,j as Mt,k as yt,l as lt,m as wt,n as _t,o as Ct,p as xt,q as St,r as Pt,s as Q}from"./three-RoUVoTIl.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=e(i);fetch(i.href,a)}})();const o={quality:{high:{scale:1,particleRatio:1,bloom:1,shadows:!1,aa:!1},medium:{scale:.75,particleRatio:.6,bloom:.7,shadows:!1,aa:!1},low:{scale:.5,particleRatio:.3,bloom:.4,shadows:!1,aa:!1}},camera:{fov:55,near:.1,far:2e4,defaultPos:[0,15,30],cruiseSpeed:.06,orbitRadius:25,orbitHeightRange:[5,30],targetChangeInterval:10,transitionDuration:4},nebula:{particleCount:3e4,spread:200,colorHues:[.55,.6,.7,.8,.95,.05],opacityRange:[.02,.08],sizeRange:[.5,2],rotationSpeed:5e-5},galaxy:{count:3,starsPerGalaxy:2e4,armCount:[2,4],armSpread:.35,radiusRange:[12,28],thickness:1.5,rotationSpeed:.008,colorPalette:[[.58,.6,.7],[.1,.7,.9],[0,.5,.6]]},starCore:{count:5,sizeRange:[1.5,3.5],pulsationSpeed:.5,colorTempRange:[3500,3e4],glowIntensity:1.5},blackHole:{count:2,sizeRange:[2,5],accretionDiskParticles:15e3,diskRadius:8,diskSpinSpeed:.03,jetParticles:5e3},supernova:{maxConcurrent:2,particleCount:8e3,lifetime:8},binaryStar:{count:1,separationRange:[3,8],orbitalSpeed:.3,massRatioRange:[.3,1],trailParticles:2e3},galaxyCollision:{tidalParticles:5e3,triggerInterval:120},eventScheduler:{supernovaInterval:[15,40],cameraChangeInterval:8},physics:{maxDeltaTime:.05},effects:{bloomStrength:.2,bloomRadius:.05,bloomThreshold:.6}};let ht="high";function Tt(d){o.quality[d]&&(ht=d)}function At(){return o.quality[ht]}const Rt=`
  attribute float aSize;
  attribute float aAlpha;
  attribute vec3 aColor;
  attribute float aPhase;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec3 pos = position;

    // 微幅漂移動畫 (Gentle floating motion)
    float driftX = sin(uTime * 0.02 + aPhase) * 0.5;
    float driftY = cos(uTime * 0.015 + aPhase * 1.3) * 0.5;
    float driftZ = sin(uTime * 0.01 + aPhase * 0.7) * 0.5;
    pos.x += driftX;
    pos.y += driftY;
    pos.z += driftZ;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * uPixelRatio * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    vAlpha = aAlpha;
    vColor = aColor;
  }
`,zt=`
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // 柔和圓形粒子 (Soft circular particle)
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist);
    alpha *= vAlpha * 0.6;

    // 中心亮點 (Bright core)
    float core = exp(-dist * 8.0);
    alpha += core * 0.4;

    gl_FragColor = vec4(vColor, alpha);
  }
`,kt=`
  attribute float aSize;
  attribute float aGlow;

  uniform float uTime;
  uniform float uPixelRatio;
  uniform float uPulseSpeed;

  varying float vGlow;

  void main() {
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // 脈動效果 (Pulsation effect)
    float pulse = 1.0 + 0.15 * sin(uTime * uPulseSpeed + position.x * 0.5);
    float size = aSize * pulse * uPixelRatio * (180.0 / -mvPosition.z);

    gl_PointSize = size;
    gl_Position = projectionMatrix * mvPosition;
    vGlow = aGlow;
  }
`,Ft=`
  uniform vec3 uColor;
  uniform float uIntensity;

  varying float vGlow;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    // 多層高斯光暈 (Multi-layer gaussian glow)
    float glow1 = exp(-dist * dist * 20.0);
    float glow2 = exp(-dist * dist * 4.0) * 0.5;
    float alpha = (glow1 + glow2) * uIntensity * vGlow;

    gl_FragColor = vec4(uColor, alpha);
  }
`,Et=`
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`,It=`
  uniform vec3 uColor;
  uniform float uTime;

  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    // 菲涅爾效應（邊緣發光）
    float rim = 1.0 - max(0.0, dot(vNormal, vViewDir));
    rim = pow(rim, 3.0);

    // 旋轉紋理模擬 (Rotating texture simulation)
    float swirl = sin(uTime * 0.3 + atan(vNormal.x, vNormal.z) * 4.0) * 0.5 + 0.5;

    float brightness = rim * 0.8 + swirl * 0.2;
    vec3 color = uColor * brightness;
    // 核心全黑（事件視界）
    float core = 1.0 - rim;
    color *= (1.0 - smoothstep(0.0, 0.3, core));

    gl_FragColor = vec4(color, rim * 0.9);
  }
`,Bt=`
  attribute float aRadius;
  attribute float aAngle;
  attribute float aHeight;
  attribute float aSpeed;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // 開普勒旋轉 (Keplerian rotation) — 內圈轉更快
    float angularVel = aSpeed / sqrt(aRadius);
    float angle = aAngle + uTime * angularVel;

    vec3 pos;
    pos.x = aRadius * cos(angle);
    pos.z = aRadius * sin(angle);
    pos.y = aHeight * (1.0 - 0.3 * sin(angle * 2.0 + uTime * 0.5));

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (2.0 + 4.0 / (aRadius * 0.2)) * uPixelRatio * (120.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // 內圈亮、外圈暗 (Inner brighter)
    float innerFactor = 1.0 - smoothstep(0.5, 5.0, aRadius);
    vAlpha = 0.4 + innerFactor * 0.6;

    // 顏色從藍白到橙紅 (Color gradient)
    vec3 innerColor = vec3(0.7, 0.8, 1.0);
    vec3 outerColor = vec3(0.9, 0.4, 0.1);
    float mixFactor = smoothstep(0.5, 5.0, aRadius);
    vColor = mix(innerColor, outerColor, mixFactor);
  }
`,Lt=`
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist);
    alpha *= vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`,Dt=`
  attribute float aOffset;
  attribute float aRadial;
  attribute float aAlpha;
  attribute float aSpeed;

  uniform float uTime;
  uniform float uPixelRatio;

  varying float vAlpha;

  void main() {
    // 噴流行進 (Jet propagation)
    float progress = fract(aOffset + uTime * aSpeed);
    float height = progress * 30.0 - 15.0;

    // 微幅螺旋 (Slight helix)
    float twist = progress * 6.28 * 3.0;
    float radius = aRadial * (1.0 + progress * 0.5);
    float x = radius * cos(twist);
    float z = radius * sin(twist);

    vec3 pos = vec3(x, height, z);

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (1.5 + progress * 2.0) * uPixelRatio * (100.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // 漸淡 (Fade out)
    vAlpha = aAlpha * (1.0 - progress);
  }
`,Ht=`
  varying float vAlpha;

  uniform vec3 uColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`,Nt=`
  attribute float aSeed;
  attribute float aAlpha;

  uniform float uTime;
  uniform float uExplosionTime;
  uniform float uPixelRatio;

  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    // 球面爆炸 (Spherical explosion)
    float lifetime = 8.0;
    float age = clamp(uTime - uExplosionTime, 0.0, lifetime);
    float progress = age / lifetime;

    // 每個粒子隨機方向
    float theta = aSeed * 137.5;
    float phi = aSeed * 73.1;
    vec3 dir;
    dir.x = sin(theta) * cos(phi);
    dir.y = sin(theta) * sin(phi);
    dir.z = cos(theta);

    float speed = 1.5 + aSeed * 0.5;
    float radius = progress * speed * 6.0;
    vec3 pos = dir * radius;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = (5.0 - progress * 4.0) * uPixelRatio * (150.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // 顏色隨時間變化：白→橙→紅→紫
    vec3 col1 = vec3(1.0, 0.95, 0.8);
    vec3 col2 = vec3(1.0, 0.6, 0.2);
    vec3 col3 = vec3(0.8, 0.2, 0.05);
    vec3 col4 = vec3(0.2, 0.1, 0.3);

    vec3 c1 = mix(col1, col2, smoothstep(0.0, 0.3, progress));
    vec3 c2 = mix(c1, col3, smoothstep(0.3, 0.6, progress));
    vec3 c3 = mix(c2, col4, smoothstep(0.6, 1.0, progress));
    vColor = c3;

    vAlpha = aAlpha * (1.0 - progress);
    // 初始閃光 (Initial flash)
    if (progress < 0.05) vAlpha *= 3.0;
  }
`,Ot=`
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;class Ut{constructor(t){this.scene=t,this.points=null,this.uniforms=null,this._create(),console.log("[Nebula] 星雲粒子系統建立完成 / Created with",o.nebula.particleCount,"particles")}_create(){const t=o.nebula.particleCount,e=o.nebula.spread,s=new Float32Array(t*3),i=new Float32Array(t*3),a=new Float32Array(t),r=new Float32Array(t),l=new Float32Array(t);for(let h=0;h<t;h++){const c=50+Math.random()*e,m=Math.random()*Math.PI*2,f=Math.acos(2*Math.random()-1);s[h*3]=c*Math.sin(f)*Math.cos(m),s[h*3+1]=c*Math.cos(f)*(.3+Math.random()*.7),s[h*3+2]=c*Math.sin(f)*Math.sin(m);const w=o.nebula.colorHues[Math.floor(Math.random()*o.nebula.colorHues.length)],S=.3+Math.random()*.5,y=.4+Math.random()*.4,g=new T().setHSL(w+(Math.random()-.5)*.1,S,y);i[h*3]=g.r,i[h*3+1]=g.g,i[h*3+2]=g.b;const[C,x]=o.nebula.opacityRange,[b,_]=o.nebula.sizeRange;a[h]=b+Math.random()*(_-b),r[h]=C+Math.random()*(x-C),l[h]=Math.random()*Math.PI*2}const n=new k;n.setAttribute("position",new u(s,3)),n.setAttribute("aColor",new u(i,3)),n.setAttribute("aSize",new u(a,1)),n.setAttribute("aAlpha",new u(r,1)),n.setAttribute("aPhase",new u(l,1)),this.uniforms={uTime:{value:0},uPixelRatio:{value:window.devicePixelRatio}};const p=new P({uniforms:this.uniforms,vertexShader:Rt,fragmentShader:zt,transparent:!0,blending:R,depthWrite:!1});this.points=new E(n,p),this.points.name="Nebula",this.scene.add(this.points)}update(t){this.uniforms&&(this.uniforms.uTime.value+=t,this.points.rotation.y+=o.nebula.rotationSpeed)}dispose(){this.scene.remove(this.points),this.points.geometry.dispose(),this.points.material.dispose()}}const Gt=`
  attribute float size;
  attribute vec3 customColor;
  varying vec3 vColor;

  void main() {
    vColor = customColor;
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // gl_PointSize = 大小 * (螢幕高度相關因子) / 距離
    // 讓恆星在遠近時自動縮放 (size attenuation)
    gl_PointSize = size * (300.0 / -mvPosition.z);

    gl_Position = projectionMatrix * mvPosition;
  }
`,Vt=`
  varying vec3 vColor;

  void main() {
    // 繪製圓形點 (Round point)
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);

    // 柔邊圓形：核心全亮，邊緣平滑漸淡
    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);

    // 如果超出圓形範圍則丟棄 (Discard outside circle)
    if (dist > 0.5) discard;

    // 核心更亮：center glow effect
    float glow = 1.0 - dist * 1.5;
    vec3 finalColor = vColor * (1.0 + glow * 0.5);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;class jt{constructor(t,e=0){this.scene=t,this.mesh=null,this.position=new v((Math.random()-.5)*50,(Math.random()-.5)*20,(Math.random()-.5)*50-15),this.armCount=o.galaxy.armCount[0]+Math.floor(Math.random()*(o.galaxy.armCount[1]-o.galaxy.armCount[0]+1)),this.radius=o.galaxy.radiusRange[0]+Math.random()*(o.galaxy.radiusRange[1]-o.galaxy.radiusRange[0]),this._colorSet=o.galaxy.colorPalette[e%o.galaxy.colorPalette.length],this.starCount=o.galaxy.starsPerGalaxy,this._create(),console.log(`[Galaxy ${e}] 星系建立 / ${this.armCount} 條旋臂, ${this.starCount} 顆恆星`)}_create(){const t=this.starCount,e=new Float32Array(t*3),s=new Float32Array(t*3),i=new Float32Array(t),a=1.2+Math.random()*.6;for(let n=0;n<t;n++){const h=Math.floor(Math.random()*this.armCount)/this.armCount*Math.PI*2,c=Math.pow(Math.random(),.5)*this.radius,m=(1-c/this.radius)*o.galaxy.armSpread+.08,f=(Math.random()-.5)*m,w=h+c*a+f,S=(Math.random()+Math.random()-1)*o.galaxy.thickness;e[n*3]=c*Math.cos(w)+(Math.random()-.5)*.3,e[n*3+1]=S,e[n*3+2]=c*Math.sin(w)+(Math.random()-.5)*.3;const y=Math.random();let g,C,x;y<.1?(g=.5+Math.random()*.2,C=.6+Math.random()*.2,x=1):y<.25?(g=.85+Math.random()*.15,C=.85+Math.random()*.15,x=.95+Math.random()*.05):y<.6?(g=1,C=.9+Math.random()*.1,x=.7+Math.random()*.1):y<.85?(g=1,C=.75+Math.random()*.1,x=.4+Math.random()*.1):(g=1,C=.5+Math.random()*.15,x=.2+Math.random()*.1),s[n*3]=g,s[n*3+1]=C,s[n*3+2]=x;const b=1-c/this.radius*.7,_=.3+Math.random()*.7;i[n]=(.3+b*1)*_}const r=new k;r.setAttribute("position",new u(e,3)),r.setAttribute("customColor",new u(s,3)),r.setAttribute("size",new u(i,1));const l=new P({uniforms:{},vertexShader:Gt,fragmentShader:Vt,transparent:!0,depthWrite:!1,blending:R});this.mesh=new E(r,l),this.mesh.position.copy(this.position),this.mesh.name="Galaxy",this.scene.add(this.mesh)}update(t){this.mesh&&(this.mesh.rotation.y+=o.galaxy.rotationSpeed*t)}getWorldPosition(){const t=new v;return this.mesh.getWorldPosition(t),t}dispose(){this.scene.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh.material.dispose()}}class Qt{constructor(t,e=o.starCore.count){this.scene=t,this.stars=[],this._create(e),console.log("[StarCore] 恆星系統建立完成 / Created",e,"stars")}_temperatureToRGB(t){let e,s,i;return t<=6500?(e=1,s=.4+.5*(t-3500)/3e3,i=.2+.3*(t-3500)/3e3):(e=.9-.3*(t-6500)/23500,s=.9-.4*(t-6500)/23500,i=.8+.2*(t-6500)/23500),new T(Math.max(.3,Math.min(1,e)),Math.max(.2,Math.min(1,s)),Math.max(.2,Math.min(1,i)))}_create(t){const[e,s]=o.starCore.sizeRange;for(let i=0;i<t;i++){const a=e+Math.random()*(s-e),r=o.starCore.colorTempRange[0]+Math.random()*(o.starCore.colorTempRange[1]-o.starCore.colorTempRange[0]),l=this._temperatureToRGB(r),n=o.starCore.pulsationSpeed*(.5+Math.random()*1),p=o.starCore.glowIntensity*(.6+Math.random()*.8),h=new k,c=new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]);h.setAttribute("position",new u(c,3)),h.setIndex([0,1,2,0,2,3]);const m={uTime:{value:Math.random()*100},uColor:{value:l},uIntensity:{value:p},uPulseSpeed:{value:n},uPixelRatio:{value:window.devicePixelRatio}},f=new P({uniforms:m,vertexShader:kt,fragmentShader:Ft,transparent:!0,blending:R,depthWrite:!1,side:ut}),w=new Float32Array([a*2]),S=new Float32Array([1]);h.setAttribute("aSize",new u(w,1)),h.setAttribute("aGlow",new u(S,1));const y=new D(h,f),g=new v((Math.random()-.5)*150,(Math.random()-.5)*60,(Math.random()-.5)*150-50);y.position.copy(g),y.lookAt(this.scene.position),y.name=`StarCore_${i}`,this.scene.add(y),this.stars.push({mesh:y,uniforms:m,position:g,baseSize:a,pulseSpeed:n,color:l,glowIntensity:p})}}update(t){for(const e of this.stars)e.uniforms.uTime.value+=t,e.mesh.lookAt(this.scene.position)}getPositions(){return this.stars.map(t=>t.position)}dispose(){for(const t of this.stars)this.scene.remove(t.mesh),t.mesh.geometry.dispose(),t.mesh.material.dispose();this.stars=[]}}class Wt{constructor(t,e=o.blackHole.count){this.scene=t,this.bhs=[],this._create(e),console.log("[BlackHole] 黑洞系統建立完成 / Created",e,"black holes")}_create(t){const[e,s]=o.blackHole.sizeRange;for(let i=0;i<t;i++){const a=e+Math.random()*(s-e),r=new ot,l=new v((Math.random()-.5)*200,(Math.random()-.5)*60,(Math.random()-.5)*200-80);r.position.copy(l);const n=new W(a*.8,32,32),p=new P({uniforms:{uColor:{value:new T(.4,.2,.8)},uTime:{value:Math.random()*100}},vertexShader:Et,fragmentShader:It,transparent:!0,blending:R,side:dt,depthWrite:!1}),h=new D(n,p);h.name="EventHorizon",r.add(h);const c=o.blackHole.accretionDiskParticles,m=new Float32Array(c*3),f=new Float32Array(c),w=new Float32Array(c),S=new Float32Array(c),y=new Float32Array(c);for(let M=0;M<c;M++){const O=.5+Math.random()*o.blackHole.diskRadius,j=Math.random()*Math.PI*2,et=(Math.random()-.5)*.8*(O/o.blackHole.diskRadius);m[M*3]=O*Math.cos(j),m[M*3+1]=et,m[M*3+2]=O*Math.sin(j),f[M]=O,w[M]=j,S[M]=et,y[M]=.5+Math.random()*1}const g=new k;g.setAttribute("position",new u(m,3)),g.setAttribute("aRadius",new u(f,1)),g.setAttribute("aAngle",new u(w,1)),g.setAttribute("aHeight",new u(S,1)),g.setAttribute("aSpeed",new u(y,1));const C={uTime:{value:Math.random()*100},uPixelRatio:{value:window.devicePixelRatio}},x=new P({uniforms:C,vertexShader:Bt,fragmentShader:Lt,transparent:!0,blending:R,depthWrite:!1}),b=new E(g,x);b.name="AccretionDisk",b.rotation.x=Math.PI*.3,r.add(b);const _=o.blackHole.jetParticles,F=new Float32Array(_*3),Y=new Float32Array(_),X=new Float32Array(_),Z=new Float32Array(_),J=new Float32Array(_);for(let M=0;M<_;M++)F[M*3]=0,F[M*3+1]=0,F[M*3+2]=0,Y[M]=Math.random(),X[M]=.1+Math.random()*.3,Z[M]=.3+Math.random()*.7,J[M]=.05+Math.random()*.15;const I=new k;I.setAttribute("position",new u(F,3)),I.setAttribute("aOffset",new u(Y,1)),I.setAttribute("aRadial",new u(X,1)),I.setAttribute("aAlpha",new u(Z,1)),I.setAttribute("aSpeed",new u(J,1));const K={uTime:{value:Math.random()*100},uPixelRatio:{value:window.devicePixelRatio},uColor:{value:new T(.6,.8,1)}},tt=new P({uniforms:K,vertexShader:Dt,fragmentShader:Ht,transparent:!0,blending:R,depthWrite:!1}),H=new E(I.clone(),tt.clone());H.name="JetTop",H.rotation.x=0,r.add(H);const N=new E(I.clone(),tt.clone());N.name="JetBottom",N.rotation.x=Math.PI,r.add(N),r.name=`BlackHole_${i}`,this.scene.add(r),this.bhs.push({group:r,position:l,size:a,uniforms:{horizon:p.uniforms,disk:C,jet:K},disk:b,jetTop:H,jetBottom:N,horizon:h})}}update(t,e){const s=o.blackHole.diskSpinSpeed;for(const i of this.bhs)i.uniforms.horizon.uTime.value+=t,i.uniforms.disk.uTime.value+=t,i.uniforms.jet.uTime.value+=t,i.disk.rotation.z+=t*s,i.group.rotation.y+=t*.02}getPositions(){return this.bhs.map(t=>t.position)}dispose(){for(const t of this.bhs)this.scene.remove(t.group),t.group.traverse(e=>{var s,i;(e.isMesh||e.isPoints)&&((s=e.geometry)==null||s.dispose(),(i=e.material)==null||i.dispose())});this.bhs=[]}}class $t{constructor(t,e,s){this.scene=t,this.startTime=s,this.lifetime=o.supernova.lifetime,this.alive=!0;const i=o.supernova.particleCount,a=new Float32Array(i*3),r=new Float32Array(i),l=new Float32Array(i);for(let h=0;h<i;h++)a[h*3]=e.x+(Math.random()-.5)*2,a[h*3+1]=e.y+(Math.random()-.5)*2,a[h*3+2]=e.z+(Math.random()-.5)*2,r[h]=Math.random(),l[h]=.3+Math.random()*.7;const n=new k;n.setAttribute("position",new u(a,3)),n.setAttribute("aSeed",new u(r,1)),n.setAttribute("aAlpha",new u(l,1)),this.uniforms={uTime:{value:0},uExplosionTime:{value:s},uPixelRatio:{value:window.devicePixelRatio}};const p=new P({uniforms:this.uniforms,vertexShader:Nt,fragmentShader:Ot,transparent:!0,blending:R,depthWrite:!1});this.points=new E(n,p),this.points.position.copy(e),this.points.name="Supernova",this.scene.add(this.points)}update(t){return this.uniforms.uTime.value=t,t-this.startTime>this.lifetime&&(this.alive=!1,this.scene.remove(this.points),this.points.geometry.dispose(),this.points.material.dispose()),this.alive}}class qt{constructor(t){this.scene=t,this.events=[]}trigger(t,e){if(this._cleanup(e),this.events.length>=o.supernova.maxConcurrent){const i=this.events.shift();i.alive=!1,this.scene.remove(i.points),i.points.geometry.dispose(),i.points.material.dispose()}const s=new $t(this.scene,t,e);return this.events.push(s),console.log("[Supernova] 爆炸觸發! / Explosion triggered at",t),s}_cleanup(t){this.events=this.events.filter(e=>e.update(t))}update(t){this._cleanup(t)}getActiveCount(){return this.events.length}dispose(){for(const t of this.events)this.scene.remove(t.points),t.points.geometry.dispose(),t.points.material.dispose();this.events=[]}}class Yt{constructor(t,e=o.binaryStar.count){this.scene=t,this.systems=[],this._create(e),console.log("[BinaryStar] 雙星系統建立完成 / Created",e,"systems")}_create(t){for(let e=0;e<t;e++){const s=new ot,i=o.binaryStar.separationRange[0]+Math.random()*(o.binaryStar.separationRange[1]-o.binaryStar.separationRange[0]),a=o.binaryStar.massRatioRange[0]+Math.random()*(o.binaryStar.massRatioRange[1]-o.binaryStar.massRatioRange[0]),r=new v((Math.random()-.5)*150,(Math.random()-.5)*50,(Math.random()-.5)*150-50);s.position.copy(r);const l=1.2+Math.random()*1.5,n=new T().setHSL(.08,.8,.7),p=this._createStarMesh(l,n);p.name="Primary";const h=l*a*.7,c=new T().setHSL(.6,.7,.7),m=this._createStarMesh(h,c);m.name="Secondary",s.add(p),s.add(m);const f=o.binaryStar.trailParticles,w=new Float32Array(f*3),S=new Float32Array(f*3),y=new Float32Array(f);for(let b=0;b<f;b++){const _=b/f;w[b*3]=(_-.5)*i,w[b*3+1]=Math.sin(_*Math.PI*4)*.5,w[b*3+2]=Math.cos(_*Math.PI*4)*.3;const F=new T().lerpColors(n,c,_);S[b*3]=F.r,S[b*3+1]=F.g,S[b*3+2]=F.b,y[b]=.3+Math.random()*.4}const g=new k;g.setAttribute("position",new u(w,3)),g.setAttribute("color",new u(S,3)),g.setAttribute("size",new u(y,1));const C=new rt({size:.3,vertexColors:!0,transparent:!0,opacity:.4,blending:R,depthWrite:!1}),x=new E(g,C);x.name="Trail",s.add(x),s.name=`BinaryStar_${e}`,this.scene.add(s),this.systems.push({group:s,primary:p,secondary:m,trail:x,separation:i,massRatio:a,position:r,orbitAngle:Math.random()*Math.PI*2,primaryOffset:i/2*(1/(1+a)),secondaryOffset:i/2*(a/(1+a))})}}_createStarMesh(t,e){const s=new W(t,16,16),i=new $({color:e}),a=new D(s,i),r=new W(t*2.5,16,16),l=new $({color:e,transparent:!0,opacity:.15,blending:R,depthWrite:!1}),n=new D(r,l);return a.add(n),a}update(t){const e=o.binaryStar.orbitalSpeed;for(const s of this.systems){s.orbitAngle+=e*.016;const i=s.orbitAngle,a=Math.cos(i)*s.primaryOffset,r=Math.sin(i)*s.primaryOffset;s.primary.position.set(a,Math.sin(i*2)*.2,r);const l=-Math.cos(i)*s.secondaryOffset,n=-Math.sin(i)*s.secondaryOffset;s.secondary.position.set(l,Math.sin(i*2+Math.PI)*.2,n);const p=o.binaryStar.trailParticles,h=s.trail.geometry.attributes.position.array;for(let c=0;c<p;c++){const m=c/p,f=a*(1-m)+l*m,w=r*(1-m)+n*m;h[c*3]=f,h[c*3+1]=Math.sin(m*Math.PI*4+t)*.3,h[c*3+2]=w+Math.cos(m*Math.PI*4+t*.5)*.2}s.trail.geometry.attributes.position.needsUpdate=!0}}getPositions(){return this.systems.map(t=>{const e=new v;return t.group.getWorldPosition(e),e})}dispose(){for(const t of this.systems)this.scene.remove(t.group),t.group.traverse(e=>{var s,i;(e.isMesh||e.isPoints)&&((s=e.geometry)==null||s.dispose(),(i=e.material)==null||i.dispose())});this.systems=[]}}class Xt{constructor(t){this.scene=t,this.activeCollisions=[],this._tidalParticles=[],this.timeSinceLastCollision=0,this._initParticlePool(),console.log("[GalaxyCollision] 碰撞系統初始化完成 / Initialized")}_initParticlePool(){const t=o.galaxyCollision.tidalParticles,e=new Float32Array(t*3),s=new Float32Array(t*3),i=new Float32Array(t);for(let n=0;n<t;n++){e[n*3]=(Math.random()-.5)*400,e[n*3+1]=(Math.random()-.5)*100,e[n*3+2]=(Math.random()-.5)*400;const p=new T().setHSL(.6+Math.random()*.2,.5,.5+Math.random()*.3);s[n*3]=p.r,s[n*3+1]=p.g,s[n*3+2]=p.b,i[n]=.3+Math.random()*.5}const a=new k;a.setAttribute("position",new u(e,3)),a.setAttribute("color",new u(s,3)),a.setAttribute("size",new u(i,1));const r=new rt({size:.5,vertexColors:!0,transparent:!0,opacity:0,blending:R,depthWrite:!1});this.tidalPoints=new E(a,r),this.tidalPoints.name="TidalStreams",this.tidalPoints.visible=!1,this.scene.add(this.tidalPoints),this._particleStates=[];const l=a.attributes.position;for(let n=0;n<t;n++)this._particleStates.push({baseX:l.array[n*3],baseY:l.array[n*3+1],baseZ:l.array[n*3+2],velocity:new v((Math.random()-.5)*.3,(Math.random()-.5)*.1,(Math.random()-.5)*.3),phase:Math.random()*Math.PI*2})}trigger(t,e){this.activeCollisions.push({position:t.clone(),startTime:e,progress:0,stage:0,duration:30}),this.tidalPoints.visible=!0,this.tidalPoints.material.opacity=.8,this.tidalPoints.position.copy(t);const s=this.tidalPoints.geometry.attributes.position;for(let i=0;i<s.count;i++){const a=this._particleStates[i],r=Math.random()*Math.PI*2,l=20+Math.random()*60;s.array[i*3]=t.x+l*Math.cos(r),s.array[i*3+1]=t.y+(Math.random()-.5)*20,s.array[i*3+2]=t.z+l*Math.sin(r),a.baseX=s.array[i*3],a.baseY=s.array[i*3+1],a.baseZ=s.array[i*3+2],a.velocity.set((Math.random()-.5)*.5,(Math.random()-.5)*.2,(Math.random()-.5)*.5)}s.needsUpdate=!0,console.log("[GalaxyCollision] 碰撞觸發! / Collision triggered at",t)}update(t,e){if(this.timeSinceLastCollision+=t,this.tidalPoints.visible){const s=this.tidalPoints.geometry.attributes.position;for(let a=0;a<s.count;a++){const r=this._particleStates[a],l=Math.sin(e*.1+r.phase)*5;s.array[a*3]+=r.velocity.x*t,s.array[a*3+1]+=r.velocity.y*t+l*t*.1,s.array[a*3+2]+=r.velocity.z*t,r.velocity.multiplyScalar(.999)}s.needsUpdate=!0,this._getOldestCollisionAge(e)>15&&(this.tidalPoints.material.opacity=Math.max(0,this.tidalPoints.material.opacity-t*.02),this.tidalPoints.material.opacity<=0&&(this.tidalPoints.visible=!1))}this.activeCollisions=this.activeCollisions.filter(s=>(s.progress=(e-s.startTime)/s.duration,s.progress<1.2))}_getOldestCollisionAge(t){return this.activeCollisions.length===0?999:t-this.activeCollisions[0].startTime}canTrigger(){return this.timeSinceLastCollision>o.galaxyCollision.triggerInterval&&this.activeCollisions.length<2}dispose(){this.scene.remove(this.tidalPoints),this.tidalPoints.geometry.dispose(),this.tidalPoints.material.dispose(),this.activeCollisions=[]}}class Zt{constructor(t,e,s,i){this.refs=t,this.triggerSupernova=e,this.triggerCollision=s,this.switchCamera=i,this._supernovaTimer=o.eventScheduler.supernovaInterval[0]+Math.random()*(o.eventScheduler.supernovaInterval[1]-o.eventScheduler.supernovaInterval[0]),this._collisionTimer=o.galaxyCollision.triggerInterval*.5,this._cameraTimer=o.eventScheduler.cameraChangeInterval*.5,this._time=0,console.log("[EventScheduler] 事件排程器啟動 / Scheduler started")}update(t){this._time+=t,this._supernovaTimer-=t,this._supernovaTimer<=0&&(this._scheduleSupernova(),this._supernovaTimer=o.eventScheduler.supernovaInterval[0]+Math.random()*(o.eventScheduler.supernovaInterval[1]-o.eventScheduler.supernovaInterval[0])),this._collisionTimer-=t,this._collisionTimer<=0&&this.triggerCollision&&(this._scheduleCollision(),this._collisionTimer=o.galaxyCollision.triggerInterval+Math.random()*30)}_scheduleSupernova(){const t=[];if(this.refs.starCore&&t.push(...this.refs.starCore.getPositions()),this.refs.galaxies)for(const s of this.refs.galaxies)t.push(s.getWorldPosition());this.refs.binaryStar&&t.push(...this.refs.binaryStar.getPositions()),t.length===0&&t.push(new v((Math.random()-.5)*100,(Math.random()-.5)*40,(Math.random()-.5)*100-50));const e=t[Math.floor(Math.random()*t.length)];this.triggerSupernova(e,this._time)}_scheduleCollision(){const t=new v((Math.random()-.5)*150,(Math.random()-.5)*40,(Math.random()-.5)*150-80);this.triggerCollision(t,this._time)}reset(){this._supernovaTimer=10+Math.random()*10,this._collisionTimer=20+Math.random()*20,this._cameraTimer=3,this._time=0}getSimulationTime(){return this._time}dispose(){}}const z=Object.freeze({ORBIT:"orbit",FLYBY:"flyby",ZOOM:"zoom",WIDE:"wide"});class Jt{constructor(t){this.camera=t,this.targets=[],this.currentTarget=null,this.nextTarget=null,this._position=new v(...o.camera.defaultPos),this._lookAt=new v(0,0,0),this._posTarget=this._position.clone(),this._lookTarget=this._lookAt.clone(),this._posVelocity=new v,this._lookVelocity=new v,this._orbitAngle=0,this._orbitRadius=o.camera.orbitRadius,this._orbitHeight=30,this._orbitSpeed=o.camera.cruiseSpeed,this.mode=z.ORBIT,this._modeTimer=0,this._targetChangeTimer=0,this._transitionDuration=o.camera.transitionDuration,this._isTransitioning=!1,this._transitionProgress=0,this._shakeAmount=0,this._shakeDecay=.95,this.camera.position.copy(this._position),this.camera.lookAt(this._lookAt),console.log("[CameraController] 初始化完成 / Initialized")}addTarget(t,e="Unknown",s){this.targets.push({object:t,label:e,orbitRadius:s||o.camera.orbitRadius,active:!0}),this.targets.length===1&&this.setTarget(this.targets[0])}removeTarget(t){this.targets=this.targets.filter(e=>e.object!==t)}setTarget(t){if(this.currentTarget===t)return;this.currentTarget=t,this._isTransitioning=!0,this._transitionProgress=0,this._orbitRadius=t.orbitRadius||o.camera.orbitRadius,this._orbitHeight=o.camera.orbitHeightRange[0]+Math.random()*(o.camera.orbitHeightRange[1]-o.camera.orbitHeightRange[0]);const e=[z.ORBIT,z.ORBIT,z.FLYBY,z.WIDE];this.mode=e[Math.floor(Math.random()*e.length)],this.mode===z.FLYBY&&(this._orbitAngle=Math.random()*Math.PI*2),this._updateTargetLabel(t.label)}switchToRandomTarget(){const t=this.targets.filter(s=>s!==this.currentTarget&&s.active);if(t.length===0)return;const e=t[Math.floor(Math.random()*t.length)];this.setTarget(e)}shake(t=1){this._shakeAmount=Math.max(this._shakeAmount,t)}_updateTargetLabel(t){const e=document.getElementById("hud-target");e&&(e.textContent=`◆ ${t}`,e.classList.add("visible"),clearTimeout(e._hideTimer),e._hideTimer=setTimeout(()=>e.classList.remove("visible"),4e3))}update(t){if(!this.currentTarget)this._orbitAngle+=t*.05,this._posTarget.set(Math.sin(this._orbitAngle)*100,40,Math.cos(this._orbitAngle)*100),this._lookTarget.set(0,0,0);else{const e=new v;this.currentTarget.object.getWorldPosition(e),this._isTransitioning&&(this._transitionProgress+=t/this._transitionDuration,this._transitionProgress>=1&&(this._transitionProgress=1,this._isTransitioning=!1));let s=new v;switch(this.mode){case z.ORBIT:{this._orbitAngle+=t*this._orbitSpeed;const i=Math.sin(this._orbitAngle*.5)*15;s.set(e.x+Math.sin(this._orbitAngle)*this._orbitRadius,e.y+this._orbitHeight+i,e.z+Math.cos(this._orbitAngle)*this._orbitRadius);break}case z.FLYBY:{this._orbitAngle+=t*this._orbitSpeed*.8;const i=this._orbitRadius*.6,a=Math.sin(this._orbitAngle*2)*10+20;s.set(e.x+Math.sin(this._orbitAngle)*i,e.y+a,e.z+Math.cos(this._orbitAngle)*i);break}case z.ZOOM:{const a=10+(Math.sin(this._modeTimer*.3)*.5+.5)*20;s.set(e.x+Math.sin(this._orbitAngle)*a,e.y+5,e.z+Math.cos(this._orbitAngle)*a),this._orbitAngle+=t*.02;break}case z.WIDE:{this._orbitAngle+=t*this._orbitSpeed*.3,s.set(e.x+Math.sin(this._orbitAngle)*this._orbitRadius*1.6,e.y+this._orbitHeight*1.5,e.z+Math.cos(this._orbitAngle)*this._orbitRadius*1.6);break}}if(this._isTransitioning){const i=this._easeInOutCubic(this._transitionProgress);this._posTarget.lerp(s,i*.1),this._lookTarget.lerp(e,i*.08)}else this._posTarget.lerp(s,t*.8),this._lookTarget.lerp(e,t*.6);this._modeTimer+=t}if(this._position.lerp(this._posTarget,t*2),this._lookAt.lerp(this._lookTarget,t*1.5),this._shakeAmount>.01){const e=new v((Math.random()-.5)*this._shakeAmount,(Math.random()-.5)*this._shakeAmount,(Math.random()-.5)*this._shakeAmount);this.camera.position.copy(this._position).add(e),this._shakeAmount*=this._shakeDecay}else this._shakeAmount=0,this.camera.position.copy(this._position);this.camera.lookAt(this._lookAt),this._targetChangeTimer+=t,this._targetChangeTimer>=o.camera.targetChangeInterval&&(this._targetChangeTimer=0,this.switchToRandomTarget())}_easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}reset(){this._position.set(...o.camera.defaultPos),this._posTarget.copy(this._position),this._lookAt.set(0,0,0),this._lookTarget.set(0,0,0),this.camera.position.copy(this._position),this.camera.lookAt(this._lookAt),this._orbitAngle=0,this._targetChangeTimer=0,this.currentTarget=null,this.targets.length>0&&this.setTarget(this.targets[0])}}const ct={name:"CopyShader",uniforms:{tDiffuse:{value:null},opacity:{value:1}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;
			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform float opacity;

		uniform sampler2D tDiffuse;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );
			gl_FragColor = opacity * texel;


		}`};class L{constructor(){this.isPass=!0,this.enabled=!0,this.needsSwap=!0,this.clear=!1,this.renderToScreen=!1}setSize(){}render(){console.error("THREE.Pass: .render() must be implemented in derived pass.")}dispose(){}}const Kt=new mt(-1,1,1,-1,0,1);class te extends k{constructor(){super(),this.setAttribute("position",new st([-1,3,0,-1,-1,0,3,-1,0],3)),this.setAttribute("uv",new st([0,2,0,0,2,0],2))}}const ee=new te;class q{constructor(t){this._mesh=new D(ee,t)}dispose(){this._mesh.geometry.dispose()}render(t){t.render(this._mesh,Kt)}get material(){return this._mesh.material}set material(t){this._mesh.material=t}}class se extends L{constructor(t,e){super(),this.textureID=e!==void 0?e:"tDiffuse",t instanceof P?(this.uniforms=t.uniforms,this.material=t):t&&(this.uniforms=V.clone(t.uniforms),this.material=new P({name:t.name!==void 0?t.name:"unspecified",defines:Object.assign({},t.defines),uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader})),this.fsQuad=new q(this.material)}render(t,e,s){this.uniforms[this.textureID]&&(this.uniforms[this.textureID].value=s.texture),this.fsQuad.material=this.material,this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class it extends L{constructor(t,e){super(),this.scene=t,this.camera=e,this.clear=!0,this.needsSwap=!1,this.inverse=!1}render(t,e,s){const i=t.getContext(),a=t.state;a.buffers.color.setMask(!1),a.buffers.depth.setMask(!1),a.buffers.color.setLocked(!0),a.buffers.depth.setLocked(!0);let r,l;this.inverse?(r=0,l=1):(r=1,l=0),a.buffers.stencil.setTest(!0),a.buffers.stencil.setOp(i.REPLACE,i.REPLACE,i.REPLACE),a.buffers.stencil.setFunc(i.ALWAYS,r,4294967295),a.buffers.stencil.setClear(l),a.buffers.stencil.setLocked(!0),t.setRenderTarget(s),this.clear&&t.clear(),t.render(this.scene,this.camera),t.setRenderTarget(e),this.clear&&t.clear(),t.render(this.scene,this.camera),a.buffers.color.setLocked(!1),a.buffers.depth.setLocked(!1),a.buffers.color.setMask(!0),a.buffers.depth.setMask(!0),a.buffers.stencil.setLocked(!1),a.buffers.stencil.setFunc(i.EQUAL,1,4294967295),a.buffers.stencil.setOp(i.KEEP,i.KEEP,i.KEEP),a.buffers.stencil.setLocked(!0)}}class ie extends L{constructor(){super(),this.needsSwap=!1}render(t){t.state.buffers.stencil.setLocked(!1),t.state.buffers.stencil.setTest(!1)}}class ae{constructor(t,e){if(this.renderer=t,this._pixelRatio=t.getPixelRatio(),e===void 0){const s=t.getSize(new A);this._width=s.width,this._height=s.height,e=new U(this._width*this._pixelRatio,this._height*this._pixelRatio,{type:G}),e.texture.name="EffectComposer.rt1"}else this._width=e.width,this._height=e.height;this.renderTarget1=e,this.renderTarget2=e.clone(),this.renderTarget2.texture.name="EffectComposer.rt2",this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2,this.renderToScreen=!0,this.passes=[],this.copyPass=new se(ct),this.copyPass.material.blending=pt,this.clock=new nt}swapBuffers(){const t=this.readBuffer;this.readBuffer=this.writeBuffer,this.writeBuffer=t}addPass(t){this.passes.push(t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}insertPass(t,e){this.passes.splice(e,0,t),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}removePass(t){const e=this.passes.indexOf(t);e!==-1&&this.passes.splice(e,1)}isLastEnabledPass(t){for(let e=t+1;e<this.passes.length;e++)if(this.passes[e].enabled)return!1;return!0}render(t){t===void 0&&(t=this.clock.getDelta());const e=this.renderer.getRenderTarget();let s=!1;for(let i=0,a=this.passes.length;i<a;i++){const r=this.passes[i];if(r.enabled!==!1){if(r.renderToScreen=this.renderToScreen&&this.isLastEnabledPass(i),r.render(this.renderer,this.writeBuffer,this.readBuffer,t,s),r.needsSwap){if(s){const l=this.renderer.getContext(),n=this.renderer.state.buffers.stencil;n.setFunc(l.NOTEQUAL,1,4294967295),this.copyPass.render(this.renderer,this.writeBuffer,this.readBuffer,t),n.setFunc(l.EQUAL,1,4294967295)}this.swapBuffers()}it!==void 0&&(r instanceof it?s=!0:r instanceof ie&&(s=!1))}}this.renderer.setRenderTarget(e)}reset(t){if(t===void 0){const e=this.renderer.getSize(new A);this._pixelRatio=this.renderer.getPixelRatio(),this._width=e.width,this._height=e.height,t=this.renderTarget1.clone(),t.setSize(this._width*this._pixelRatio,this._height*this._pixelRatio)}this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.renderTarget1=t,this.renderTarget2=t.clone(),this.writeBuffer=this.renderTarget1,this.readBuffer=this.renderTarget2}setSize(t,e){this._width=t,this._height=e;const s=this._width*this._pixelRatio,i=this._height*this._pixelRatio;this.renderTarget1.setSize(s,i),this.renderTarget2.setSize(s,i);for(let a=0;a<this.passes.length;a++)this.passes[a].setSize(s,i)}setPixelRatio(t){this._pixelRatio=t,this.setSize(this._width,this._height)}dispose(){this.renderTarget1.dispose(),this.renderTarget2.dispose(),this.copyPass.dispose()}}class oe extends L{constructor(t,e,s=null,i=null,a=null){super(),this.scene=t,this.camera=e,this.overrideMaterial=s,this.clearColor=i,this.clearAlpha=a,this.clear=!0,this.clearDepth=!1,this.needsSwap=!1,this._oldClearColor=new T}render(t,e,s){const i=t.autoClear;t.autoClear=!1;let a,r;this.overrideMaterial!==null&&(r=this.scene.overrideMaterial,this.scene.overrideMaterial=this.overrideMaterial),this.clearColor!==null&&(t.getClearColor(this._oldClearColor),t.setClearColor(this.clearColor,t.getClearAlpha())),this.clearAlpha!==null&&(a=t.getClearAlpha(),t.setClearAlpha(this.clearAlpha)),this.clearDepth==!0&&t.clearDepth(),t.setRenderTarget(this.renderToScreen?null:s),this.clear===!0&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),t.render(this.scene,this.camera),this.clearColor!==null&&t.setClearColor(this._oldClearColor),this.clearAlpha!==null&&t.setClearAlpha(a),this.overrideMaterial!==null&&(this.scene.overrideMaterial=r),t.autoClear=i}}const re={uniforms:{tDiffuse:{value:null},luminosityThreshold:{value:1},smoothWidth:{value:1},defaultColor:{value:new T(0)},defaultOpacity:{value:0}},vertexShader:`

		varying vec2 vUv;

		void main() {

			vUv = uv;

			gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );

		}`,fragmentShader:`

		uniform sampler2D tDiffuse;
		uniform vec3 defaultColor;
		uniform float defaultOpacity;
		uniform float luminosityThreshold;
		uniform float smoothWidth;

		varying vec2 vUv;

		void main() {

			vec4 texel = texture2D( tDiffuse, vUv );

			float v = luminance( texel.xyz );

			vec4 outputColor = vec4( defaultColor.rgb, defaultOpacity );

			float alpha = smoothstep( luminosityThreshold, luminosityThreshold + smoothWidth, v );

			gl_FragColor = mix( outputColor, texel, alpha );

		}`};class B extends L{constructor(t,e,s,i){super(),this.strength=e!==void 0?e:1,this.radius=s,this.threshold=i,this.resolution=t!==void 0?new A(t.x,t.y):new A(256,256),this.clearColor=new T(0,0,0),this.renderTargetsHorizontal=[],this.renderTargetsVertical=[],this.nMips=5;let a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);this.renderTargetBright=new U(a,r,{type:G}),this.renderTargetBright.texture.name="UnrealBloomPass.bright",this.renderTargetBright.texture.generateMipmaps=!1;for(let c=0;c<this.nMips;c++){const m=new U(a,r,{type:G});m.texture.name="UnrealBloomPass.h"+c,m.texture.generateMipmaps=!1,this.renderTargetsHorizontal.push(m);const f=new U(a,r,{type:G});f.texture.name="UnrealBloomPass.v"+c,f.texture.generateMipmaps=!1,this.renderTargetsVertical.push(f),a=Math.round(a/2),r=Math.round(r/2)}const l=re;this.highPassUniforms=V.clone(l.uniforms),this.highPassUniforms.luminosityThreshold.value=i,this.highPassUniforms.smoothWidth.value=.01,this.materialHighPassFilter=new P({uniforms:this.highPassUniforms,vertexShader:l.vertexShader,fragmentShader:l.fragmentShader}),this.separableBlurMaterials=[];const n=[3,5,7,9,11];a=Math.round(this.resolution.x/2),r=Math.round(this.resolution.y/2);for(let c=0;c<this.nMips;c++)this.separableBlurMaterials.push(this.getSeperableBlurMaterial(n[c])),this.separableBlurMaterials[c].uniforms.invSize.value=new A(1/a,1/r),a=Math.round(a/2),r=Math.round(r/2);this.compositeMaterial=this.getCompositeMaterial(this.nMips),this.compositeMaterial.uniforms.blurTexture1.value=this.renderTargetsVertical[0].texture,this.compositeMaterial.uniforms.blurTexture2.value=this.renderTargetsVertical[1].texture,this.compositeMaterial.uniforms.blurTexture3.value=this.renderTargetsVertical[2].texture,this.compositeMaterial.uniforms.blurTexture4.value=this.renderTargetsVertical[3].texture,this.compositeMaterial.uniforms.blurTexture5.value=this.renderTargetsVertical[4].texture,this.compositeMaterial.uniforms.bloomStrength.value=e,this.compositeMaterial.uniforms.bloomRadius.value=.1;const p=[1,.8,.6,.4,.2];this.compositeMaterial.uniforms.bloomFactors.value=p,this.bloomTintColors=[new v(1,1,1),new v(1,1,1),new v(1,1,1),new v(1,1,1),new v(1,1,1)],this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors;const h=ct;this.copyUniforms=V.clone(h.uniforms),this.blendMaterial=new P({uniforms:this.copyUniforms,vertexShader:h.vertexShader,fragmentShader:h.fragmentShader,blending:R,depthTest:!1,depthWrite:!1,transparent:!0}),this.enabled=!0,this.needsSwap=!1,this._oldClearColor=new T,this.oldClearAlpha=1,this.basic=new $,this.fsQuad=new q(null)}dispose(){for(let t=0;t<this.renderTargetsHorizontal.length;t++)this.renderTargetsHorizontal[t].dispose();for(let t=0;t<this.renderTargetsVertical.length;t++)this.renderTargetsVertical[t].dispose();this.renderTargetBright.dispose();for(let t=0;t<this.separableBlurMaterials.length;t++)this.separableBlurMaterials[t].dispose();this.compositeMaterial.dispose(),this.blendMaterial.dispose(),this.basic.dispose(),this.fsQuad.dispose()}setSize(t,e){let s=Math.round(t/2),i=Math.round(e/2);this.renderTargetBright.setSize(s,i);for(let a=0;a<this.nMips;a++)this.renderTargetsHorizontal[a].setSize(s,i),this.renderTargetsVertical[a].setSize(s,i),this.separableBlurMaterials[a].uniforms.invSize.value=new A(1/s,1/i),s=Math.round(s/2),i=Math.round(i/2)}render(t,e,s,i,a){t.getClearColor(this._oldClearColor),this.oldClearAlpha=t.getClearAlpha();const r=t.autoClear;t.autoClear=!1,t.setClearColor(this.clearColor,0),a&&t.state.buffers.stencil.setTest(!1),this.renderToScreen&&(this.fsQuad.material=this.basic,this.basic.map=s.texture,t.setRenderTarget(null),t.clear(),this.fsQuad.render(t)),this.highPassUniforms.tDiffuse.value=s.texture,this.highPassUniforms.luminosityThreshold.value=this.threshold,this.fsQuad.material=this.materialHighPassFilter,t.setRenderTarget(this.renderTargetBright),t.clear(),this.fsQuad.render(t);let l=this.renderTargetBright;for(let n=0;n<this.nMips;n++)this.fsQuad.material=this.separableBlurMaterials[n],this.separableBlurMaterials[n].uniforms.colorTexture.value=l.texture,this.separableBlurMaterials[n].uniforms.direction.value=B.BlurDirectionX,t.setRenderTarget(this.renderTargetsHorizontal[n]),t.clear(),this.fsQuad.render(t),this.separableBlurMaterials[n].uniforms.colorTexture.value=this.renderTargetsHorizontal[n].texture,this.separableBlurMaterials[n].uniforms.direction.value=B.BlurDirectionY,t.setRenderTarget(this.renderTargetsVertical[n]),t.clear(),this.fsQuad.render(t),l=this.renderTargetsVertical[n];this.fsQuad.material=this.compositeMaterial,this.compositeMaterial.uniforms.bloomStrength.value=this.strength,this.compositeMaterial.uniforms.bloomRadius.value=this.radius,this.compositeMaterial.uniforms.bloomTintColors.value=this.bloomTintColors,t.setRenderTarget(this.renderTargetsHorizontal[0]),t.clear(),this.fsQuad.render(t),this.fsQuad.material=this.blendMaterial,this.copyUniforms.tDiffuse.value=this.renderTargetsHorizontal[0].texture,a&&t.state.buffers.stencil.setTest(!0),this.renderToScreen?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(s),this.fsQuad.render(t)),t.setClearColor(this._oldClearColor,this.oldClearAlpha),t.autoClear=r}getSeperableBlurMaterial(t){const e=[];for(let s=0;s<t;s++)e.push(.39894*Math.exp(-.5*s*s/(t*t))/t);return new P({defines:{KERNEL_RADIUS:t},uniforms:{colorTexture:{value:null},invSize:{value:new A(.5,.5)},direction:{value:new A(.5,.5)},gaussianCoefficients:{value:e}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`#include <common>
				varying vec2 vUv;
				uniform sampler2D colorTexture;
				uniform vec2 invSize;
				uniform vec2 direction;
				uniform float gaussianCoefficients[KERNEL_RADIUS];

				void main() {
					float weightSum = gaussianCoefficients[0];
					vec3 diffuseSum = texture2D( colorTexture, vUv ).rgb * weightSum;
					for( int i = 1; i < KERNEL_RADIUS; i ++ ) {
						float x = float(i);
						float w = gaussianCoefficients[i];
						vec2 uvOffset = direction * invSize * x;
						vec3 sample1 = texture2D( colorTexture, vUv + uvOffset ).rgb;
						vec3 sample2 = texture2D( colorTexture, vUv - uvOffset ).rgb;
						diffuseSum += (sample1 + sample2) * w;
						weightSum += 2.0 * w;
					}
					gl_FragColor = vec4(diffuseSum/weightSum, 1.0);
				}`})}getCompositeMaterial(t){return new P({defines:{NUM_MIPS:t},uniforms:{blurTexture1:{value:null},blurTexture2:{value:null},blurTexture3:{value:null},blurTexture4:{value:null},blurTexture5:{value:null},bloomStrength:{value:1},bloomFactors:{value:null},bloomTintColors:{value:null},bloomRadius:{value:0}},vertexShader:`varying vec2 vUv;
				void main() {
					vUv = uv;
					gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
				}`,fragmentShader:`varying vec2 vUv;
				uniform sampler2D blurTexture1;
				uniform sampler2D blurTexture2;
				uniform sampler2D blurTexture3;
				uniform sampler2D blurTexture4;
				uniform sampler2D blurTexture5;
				uniform float bloomStrength;
				uniform float bloomRadius;
				uniform float bloomFactors[NUM_MIPS];
				uniform vec3 bloomTintColors[NUM_MIPS];

				float lerpBloomFactor(const in float factor) {
					float mirrorFactor = 1.2 - factor;
					return mix(factor, mirrorFactor, bloomRadius);
				}

				void main() {
					gl_FragColor = bloomStrength * ( lerpBloomFactor(bloomFactors[0]) * vec4(bloomTintColors[0], 1.0) * texture2D(blurTexture1, vUv) +
						lerpBloomFactor(bloomFactors[1]) * vec4(bloomTintColors[1], 1.0) * texture2D(blurTexture2, vUv) +
						lerpBloomFactor(bloomFactors[2]) * vec4(bloomTintColors[2], 1.0) * texture2D(blurTexture3, vUv) +
						lerpBloomFactor(bloomFactors[3]) * vec4(bloomTintColors[3], 1.0) * texture2D(blurTexture4, vUv) +
						lerpBloomFactor(bloomFactors[4]) * vec4(bloomTintColors[4], 1.0) * texture2D(blurTexture5, vUv) );
				}`})}}B.BlurDirectionX=new A(1,0);B.BlurDirectionY=new A(0,1);const ne={name:"OutputShader",uniforms:{tDiffuse:{value:null},toneMappingExposure:{value:1}},vertexShader:`
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

		#include <tonemapping_pars_fragment>
		#include <colorspace_pars_fragment>

		varying vec2 vUv;

		void main() {

			gl_FragColor = texture2D( tDiffuse, vUv );

			// tone mapping

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

			#endif

			// color space

			#ifdef SRGB_TRANSFER

				gl_FragColor = sRGBTransferOETF( gl_FragColor );

			#endif

		}`};class le extends L{constructor(){super();const t=ne;this.uniforms=V.clone(t.uniforms),this.material=new gt({name:t.name,uniforms:this.uniforms,vertexShader:t.vertexShader,fragmentShader:t.fragmentShader}),this.fsQuad=new q(this.material),this._outputColorSpace=null,this._toneMapping=null}render(t,e,s){this.uniforms.tDiffuse.value=s.texture,this.uniforms.toneMappingExposure.value=t.toneMappingExposure,(this._outputColorSpace!==t.outputColorSpace||this._toneMapping!==t.toneMapping)&&(this._outputColorSpace=t.outputColorSpace,this._toneMapping=t.toneMapping,this.material.defines={},ft.getTransfer(this._outputColorSpace)===vt&&(this.material.defines.SRGB_TRANSFER=""),this._toneMapping===bt?this.material.defines.LINEAR_TONE_MAPPING="":this._toneMapping===Mt?this.material.defines.REINHARD_TONE_MAPPING="":this._toneMapping===yt?this.material.defines.CINEON_TONE_MAPPING="":this._toneMapping===lt?this.material.defines.ACES_FILMIC_TONE_MAPPING="":this._toneMapping===wt?this.material.defines.AGX_TONE_MAPPING="":this._toneMapping===_t&&(this.material.defines.NEUTRAL_TONE_MAPPING=""),this.material.needsUpdate=!0),this.renderToScreen===!0?(t.setRenderTarget(null),this.fsQuad.render(t)):(t.setRenderTarget(e),this.clear&&t.clear(t.autoClearColor,t.autoClearDepth,t.autoClearStencil),this.fsQuad.render(t))}dispose(){this.material.dispose(),this.fsQuad.dispose()}}class he{constructor(t,e,s){this.renderer=t,this.scene=e,this.camera=s,this.composer=new ae(t),this.renderPass=new oe(e,s),this.composer.addPass(this.renderPass);const{bloomStrength:i,bloomRadius:a,bloomThreshold:r}=o.effects;this.bloomPass=new B(new A(window.innerWidth,window.innerHeight),i,a,r),this.composer.addPass(this.bloomPass),this.outputPass=new le,this.composer.addPass(this.outputPass),console.log("[PostProcessing] 電影級後處理啟動 / Cinematic PP active")}render(t){this.composer.render(t)}resize(t,e){this.composer.setSize(t,e),this.bloomPass.resolution.set(t,e)}updateQuality(){const{bloomStrength:t,bloomRadius:e,bloomThreshold:s}=o.effects;this.bloomPass.strength=t,this.bloomPass.radius=e,this.bloomPass.threshold=s}dispose(){this.composer.dispose()}}class ce{constructor(){this.elements={fps:document.getElementById("hud-fps"),time:document.getElementById("hud-time"),particles:document.getElementById("hud-particles"),stars:document.getElementById("hud-stars"),galaxies:document.getElementById("hud-galaxies"),bh:document.getElementById("hud-bh"),events:document.getElementById("hud-events"),target:document.getElementById("hud-target"),loading:document.getElementById("loading"),loadingBar:document.getElementById("loading-bar")},this._frameCount=0,this._fpsTimer=0,this._currentFPS=0,this._setupControls(),this.paused=!1,this.onPause=null,this.onFullscreen=null,this.onScreenshot=null,this.onReset=null,this.onQualityChange=null,console.log("[HUD] 顯示系統初始化完成 / Initialized")}_setupControls(){const t=document.getElementById("btn-pause");t.addEventListener("click",()=>{this.paused=!this.paused,t.textContent=this.paused?"▶ Play":"⏸ Pause",t.classList.toggle("active",this.paused),this.onPause&&this.onPause(this.paused)}),document.getElementById("btn-fullscreen").addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen().catch(()=>{}):document.documentElement.requestFullscreen().catch(()=>{}),this.onFullscreen&&this.onFullscreen()}),document.getElementById("btn-screenshot").addEventListener("click",()=>{this.onScreenshot&&this.onScreenshot()}),document.getElementById("btn-reset").addEventListener("click",()=>{this.onReset&&this.onReset()}),document.querySelectorAll("#hud-quality button").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll("#hud-quality button").forEach(i=>i.classList.remove("active")),e.classList.add("active");const s=e.dataset.quality;Tt(s),this.onQualityChange&&this.onQualityChange(s)})})}setLoadingProgress(t){this.elements.loadingBar&&(this.elements.loadingBar.style.width=`${t*100}%`)}hideLoading(){this.elements.loading&&(this.elements.loading.classList.add("hidden"),setTimeout(()=>{this.elements.loading.style.display="none"},1200))}updateStats(t){const e=this.elements;if(this._frameCount++,this._fpsTimer+=t.delta,this._fpsTimer>=.5&&(this._currentFPS=Math.round(this._frameCount/this._fpsTimer),this._frameCount=0,this._fpsTimer=0),e.fps&&(e.fps.textContent=this._currentFPS),e.time){const s=(t.simulationTime*10).toFixed(1);e.time.textContent=`${s} Myr`}e.particles&&(e.particles.textContent=(t.particles||0).toLocaleString()),e.stars&&(e.stars.textContent=(t.stars||0).toLocaleString()),e.galaxies&&(e.galaxies.textContent=t.galaxies||0),e.bh&&(e.bh.textContent=t.blackHoles||0),e.events&&(e.events.textContent=t.events||0)}showNotification(t){const e=this.elements.target;e&&(e.textContent=`✦ ${t}`,e.classList.add("visible"),clearTimeout(e._hideTimer),e._hideTimer=setTimeout(()=>e.classList.remove("visible"),3e3))}dispose(){}}class ue{constructor(){this.scene=null,this.camera=null,this.renderer=null,this.clock=new nt,this.postProcessing=null,this.cameraController=null,this.hud=null,this.nebula=null,this.galaxies=[],this.starCore=null,this.blackHole=null,this.supernovaSystem=null,this.binaryStar=null,this.galaxyCollision=null,this.eventScheduler=null,this._paused=!1,this._time=0,this.stats={particles:0,stars:0,galaxies:0,blackHoles:0,events:0},console.log("[Engine] 引擎啟動中 / Starting...")}async init(){const t=new ce;this.hud=t,t.setLoadingProgress(.1),this.scene=new Ct,this.scene.background=new T(0),t.setLoadingProgress(.15),this.camera=new xt(o.camera.fov,window.innerWidth/window.innerHeight,o.camera.near,o.camera.far),this.camera.position.set(...o.camera.defaultPos),t.setLoadingProgress(.2),At(),this.renderer=new St({antialias:!1,alpha:!1,powerPreference:"high-performance"});const e=Math.max(1,window.devicePixelRatio);this.renderer.setPixelRatio(e),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setClearColor(0,1),this.renderer.toneMapping=lt,this.renderer.toneMappingExposure=.8,this.renderer.outputColorSpace=Pt;const s=this.renderer.domElement;s.style.position="fixed",s.style.top="0",s.style.left="0",s.style.width="100vw",s.style.height="100vh",s.style.zIndex="0",s.style.display="block",document.body.prepend(s),console.log(`[Engine] Renderer 初始化 / DPR: ${e}, 尺寸: ${window.innerWidth}x${window.innerHeight}`),t.setLoadingProgress(.3),this.postProcessing=new he(this.renderer,this.scene,this.camera),t.setLoadingProgress(.35),this.cameraController=new Jt(this.camera),t.setLoadingProgress(.4),this.nebula=new Ut(this.scene),t.setLoadingProgress(.45);for(let i=0;i<o.galaxy.count;i++)this.galaxies.push(new jt(this.scene,i));t.setLoadingProgress(.55),this.starCore=new Qt(this.scene),t.setLoadingProgress(.6),this.blackHole=new Wt(this.scene),t.setLoadingProgress(.65),this.binaryStar=new Yt(this.scene),t.setLoadingProgress(.7),this.supernovaSystem=new qt(this.scene),t.setLoadingProgress(.75),this.galaxyCollision=new Xt(this.scene),t.setLoadingProgress(.8),this._registerCameraTargets(),this.eventScheduler=new Zt({starCore:this.starCore,galaxies:this.galaxies,binaryStar:this.binaryStar},(i,a)=>{this.supernovaSystem.trigger(i,a),this.cameraController.shake(.5),this.hud.showNotification("💥 超新星爆炸 / Supernova!")},(i,a)=>{this.galaxyCollision.trigger(i,a),this.cameraController.shake(1),this.hud.showNotification("🌀 星系碰撞 / Galaxy Collision!")},()=>{this.cameraController.switchToRandomTarget()}),t.setLoadingProgress(.85),t.onPause=i=>{this._paused=i,i?(this.clock.stop(),this.hud.showNotification("⏸ 已暫停 / Paused")):(this.clock.start(),this.hud.showNotification("▶ 繼續 / Resumed"))},t.onScreenshot=()=>{this._takeScreenshot()},t.onReset=()=>{this._resetSimulation()},t.onQualityChange=i=>{this._updateRenderingQuality(i),this.hud.showNotification(`📺 畫質: ${i.toUpperCase()}`)},t.onFullscreen=()=>{},t.setLoadingProgress(.9),window.addEventListener("resize",()=>this._onResize()),this._updateStats(),t.setLoadingProgress(1),setTimeout(()=>t.hideLoading(),500),this.clock.start(),this._animate(),console.log("[Engine] 引擎初始化完成 / Ready!")}_registerCameraTargets(){const t=this.cameraController;for(let a=0;a<this.galaxies.length;a++)t.addTarget(this.galaxies[a].mesh,`Galaxy ${a+1}`,20+Math.random()*20);const e=this.starCore.getPositions();for(let a=0;a<Math.min(e.length,3);a++){const r=new Q;r.position.copy(e[a]),this.scene.add(r),t.addTarget(r,`Star Core ${a+1}`,8+Math.random()*10)}const s=this.blackHole.getPositions();for(let a=0;a<s.length;a++){const r=new Q;r.position.copy(s[a]),this.scene.add(r),t.addTarget(r,`Black Hole ${a+1}`,10+Math.random()*8)}const i=new Q;i.position.set(0,0,0),this.scene.add(i),t.addTarget(i,"Deep Field",60)}_updateStats(){this.stats.particles=o.nebula.particleCount+o.blackHole.accretionDiskParticles*o.blackHole.count*2+o.blackHole.jetParticles*o.blackHole.count*2+o.supernova.particleCount,this.stats.stars=o.galaxy.starsPerGalaxy*o.galaxy.count+o.starCore.count,this.stats.galaxies=o.galaxy.count,this.stats.blackHoles=o.blackHole.count}_animate(){requestAnimationFrame(()=>this._animate());const t=Math.min(this.clock.getDelta(),o.physics.maxDeltaTime);if(!this._paused){this._time+=t,this.nebula.update(t);for(const e of this.galaxies)e.update(t);this.starCore.update(t),this.blackHole.update(t,this._time),this.binaryStar.update(this._time),this.supernovaSystem.update(this._time),this.galaxyCollision.update(t,this._time),this.eventScheduler.update(t),this.cameraController.update(t),this.postProcessing.render(t),this.hud.updateStats({delta:t,simulationTime:this._time,particles:this.stats.particles,stars:this.stats.stars,galaxies:this.stats.galaxies,blackHoles:this.stats.blackHoles,events:this.supernovaSystem.getActiveCount()})}}_onResize(){const t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.renderer.setSize(t,e),this.postProcessing.resize(t,e)}_takeScreenshot(){const t=this.renderer.getPixelRatio();this.renderer.setPixelRatio(2),this.postProcessing.resize(window.innerWidth*2,window.innerHeight*2),this.postProcessing.render(0);const e=document.createElement("a");e.download=`cosmic-genesis-${Date.now()}.png`,e.href=this.renderer.domElement.toDataURL("image/png"),e.click(),this.renderer.setPixelRatio(t),this.postProcessing.resize(window.innerWidth,window.innerHeight),this.hud.showNotification("📸 截圖已儲存 / Screenshot saved")}_updateRenderingQuality(t){const e=o.quality[t];this.renderer.setPixelRatio(window.devicePixelRatio*e.scale),this.postProcessing.updateQuality()}_resetSimulation(){this._paused=!1,this._time=0,this.clock.stop(),this.clock.start(),this.cameraController.reset(),this.eventScheduler.reset(),this.hud.showNotification("⟳ 模擬重置 / Simulation reset")}dispose(){var t,e,s,i,a,r,l,n,p;(t=this.nebula)==null||t.dispose(),this.galaxies.forEach(h=>h.dispose()),(e=this.starCore)==null||e.dispose(),(s=this.blackHole)==null||s.dispose(),(i=this.supernovaSystem)==null||i.dispose(),(a=this.binaryStar)==null||a.dispose(),(r=this.galaxyCollision)==null||r.dispose(),(l=this.eventScheduler)==null||l.dispose(),this.cameraController=null,(n=this.postProcessing)==null||n.dispose(),(p=this.hud)==null||p.dispose(),this.renderer.dispose()}}console.log(`
  ╔══════════════════════════════════════════╗
  ║        ✦  COSMIC  GENESIS  ✦            ║
  ║     宇宙創世模擬器 / Universe Simulator   ║
  ╚══════════════════════════════════════════╝
`);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",at):at();function at(){const d=new ue;d.init().catch(t=>{console.error("[FATAL] 引擎初始化失敗 / Engine initialization failed:",t);const e=document.getElementById("loading");e&&(e.innerHTML=`
        <h1>✦ COSMIC GENESIS</h1>
        <p style="color: #ff6b6b; margin-top: 20px;">
          ⚠ 初始化失敗 / Initialization Failed
        </p>
        <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 8px;">
          ${t.message||"Unknown error"}
        </p>
        <p style="font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 20px;">
          請檢查主控台 (/Console) 以了解詳細錯誤訊息<br/>
          Check the console for detailed error information
        </p>
      `)}),window.__cosmicGenesis=d}
