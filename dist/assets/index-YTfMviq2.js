import{C as M,B as k,a as c,S as F,A as x,P as R,V as _,b as D,D as K,M as B,G as X,c as j,F as tt,d as Q,e as et,f as st,g as it,W as ot,N as at,h as rt,O,i as nt}from"./three-HkWlBulR.js";(function(){const t=document.createElement("link").relList;if(t&&t.supports&&t.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))s(i);new MutationObserver(i=>{for(const a of i)if(a.type==="childList")for(const r of a.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&s(r)}).observe(document,{childList:!0,subtree:!0});function e(i){const a={};return i.integrity&&(a.integrity=i.integrity),i.referrerPolicy&&(a.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?a.credentials="include":i.crossOrigin==="anonymous"?a.credentials="omit":a.credentials="same-origin",a}function s(i){if(i.ep)return;i.ep=!0;const a=e(i);fetch(i.href,a)}})();const o={quality:{high:{scale:1,particleRatio:1,bloom:1,shadows:!0,aa:!0},medium:{scale:.75,particleRatio:.6,bloom:.5,shadows:!1,aa:!0},low:{scale:.5,particleRatio:.3,bloom:.2,shadows:!1,aa:!1}},camera:{fov:50,near:.1,far:2e4,defaultPos:[0,40,80],cruiseSpeed:.08,orbitRadius:60,orbitHeightRange:[10,60],targetChangeInterval:8,transitionDuration:3},nebula:{particleCount:25e3,spread:300,colorHues:[.55,.65,.75,.85,0,.05],opacityRange:[.005,.04],sizeRange:[.2,1],rotationSpeed:1e-4},galaxy:{count:3,starsPerGalaxy:3e4,armCount:[2,4],armSpread:.4,radiusRange:[15,35],thickness:2,rotationSpeed:.005,colorPalette:[[.58,.6,.7],[.1,.6,.8],[0,.5,.6]]},starCore:{count:5,sizeRange:[1.5,3.5],pulsationSpeed:.5,colorTempRange:[3500,3e4],glowIntensity:1.5},blackHole:{count:2,sizeRange:[2,5],accretionDiskParticles:15e3,diskRadius:8,diskSpinSpeed:.03,jetParticles:5e3},supernova:{maxConcurrent:2,particleCount:8e3,lifetime:8},binaryStar:{count:1,separationRange:[3,8],orbitalSpeed:.3,massRatioRange:[.3,1],trailParticles:2e3},galaxyCollision:{tidalParticles:5e3,triggerInterval:120},eventScheduler:{supernovaInterval:[15,40],cameraChangeInterval:8},physics:{maxDeltaTime:.05}};let J="high";function lt(p){o.quality[p]&&(J=p)}function ht(){return o.quality[J]}const ct=`
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
`,dt=`
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
`,ut=`
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
`,mt=`
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
`,gt=`
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`,pt=`
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
`,ft=`
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
`,vt=`
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
`,yt=`
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
`,wt=`
  varying float vAlpha;

  uniform vec3 uColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`,bt=`
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
`,_t=`
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;class Mt{constructor(t){this.scene=t,this.points=null,this.uniforms=null,this._create(),console.log("[Nebula] 星雲粒子系統建立完成 / Created with",o.nebula.particleCount,"particles")}_create(){const t=o.nebula.particleCount,e=o.nebula.spread,s=new Float32Array(t*3),i=new Float32Array(t*3),a=new Float32Array(t),r=new Float32Array(t),h=new Float32Array(t);for(let l=0;l<t;l++){const d=50+Math.random()*e,g=Math.random()*Math.PI*2,v=Math.acos(2*Math.random()-1);s[l*3]=d*Math.sin(v)*Math.cos(g),s[l*3+1]=d*Math.cos(v)*(.3+Math.random()*.7),s[l*3+2]=d*Math.sin(v)*Math.sin(g);const b=o.nebula.colorHues[Math.floor(Math.random()*o.nebula.colorHues.length)],P=.3+Math.random()*.5,y=.4+Math.random()*.4,u=new M().setHSL(b+(Math.random()-.5)*.1,P,y);i[l*3]=u.r,i[l*3+1]=u.g,i[l*3+2]=u.b;const[A,z]=o.nebula.opacityRange,[w,C]=o.nebula.sizeRange;a[l]=w+Math.random()*(C-w),r[l]=A+Math.random()*(z-A),h[l]=Math.random()*Math.PI*2}const n=new k;n.setAttribute("position",new c(s,3)),n.setAttribute("aColor",new c(i,3)),n.setAttribute("aSize",new c(a,1)),n.setAttribute("aAlpha",new c(r,1)),n.setAttribute("aPhase",new c(h,1)),this.uniforms={uTime:{value:0},uPixelRatio:{value:window.devicePixelRatio}};const m=new F({uniforms:this.uniforms,vertexShader:ct,fragmentShader:dt,transparent:!0,blending:x,depthWrite:!1});this.points=new R(n,m),this.points.name="Nebula",this.scene.add(this.points)}update(t){this.uniforms&&(this.uniforms.uTime.value+=t,this.points.rotation.y+=o.nebula.rotationSpeed)}dispose(){this.scene.remove(this.points),this.points.geometry.dispose(),this.points.material.dispose()}}class Pt{constructor(t,e=0){this.scene=t,this.mesh=null,this.position=new _((Math.random()-.5)*60,(Math.random()-.5)*30,(Math.random()-.5)*60-20),this.armCount=o.galaxy.armCount[0]+Math.floor(Math.random()*(o.galaxy.armCount[1]-o.galaxy.armCount[0]+1)),this.radius=o.galaxy.radiusRange[0]+Math.random()*(o.galaxy.radiusRange[1]-o.galaxy.radiusRange[0]),this._colorSet=o.galaxy.colorPalette[e%o.galaxy.colorPalette.length],this.starCount=o.galaxy.starsPerGalaxy,this._create(),console.log(`[Galaxy ${e}] 星系建立完成 / Created: ${this.armCount} arms, ${this.starCount} stars`)}_create(){const t=this.starCount,e=new Float32Array(t*3),s=new Float32Array(t*3),i=new Float32Array(t),a=1.5+Math.random()*.5;for(let n=0;n<t;n++){const l=Math.floor(Math.random()*this.armCount)/this.armCount*Math.PI*2,d=Math.pow(Math.random(),.6)*this.radius,g=(1-d/this.radius)*o.galaxy.armSpread+.1,v=(Math.random()-.5)*g,b=l+d*a+v,P=(Math.random()+Math.random()-1)*o.galaxy.thickness;e[n*3]=d*Math.cos(b)+(Math.random()-.5)*.5,e[n*3+1]=P,e[n*3+2]=d*Math.sin(b)+(Math.random()-.5)*.5;const y=Math.random();let u;y<.1?u=new M(.6,.7,1):y<.3?u=new M(.9,.9,1):y<.7?u=new M(1,.95,.8):y<.9?u=new M(1,.8,.5):u=new M(1,.6,.3),s[n*3]=u.r,s[n*3+1]=u.g,s[n*3+2]=u.b;const A=.3+.7*(1-d/this.radius);i[n]=.5+A*.6}const r=new k;r.setAttribute("position",new c(e,3)),r.setAttribute("color",new c(s,3)),r.setAttribute("size",new c(i,1));const h=new D({size:2.5,vertexColors:!0,transparent:!1,opacity:1,blending:x,sizeAttenuation:!0,depthWrite:!1});this.mesh=new R(r,h),this.mesh.position.copy(this.position),this.mesh.name="Galaxy",this.scene.add(this.mesh)}update(t){this.mesh&&(this.mesh.rotation.y+=o.galaxy.rotationSpeed*t)}getWorldPosition(){const t=new _;return this.mesh.getWorldPosition(t),t}dispose(){this.scene.remove(this.mesh),this.mesh.geometry.dispose(),this.mesh.material.dispose()}}class Ct{constructor(t,e=o.starCore.count){this.scene=t,this.stars=[],this._create(e),console.log("[StarCore] 恆星系統建立完成 / Created",e,"stars")}_temperatureToRGB(t){let e,s,i;return t<=6500?(e=1,s=.4+.5*(t-3500)/3e3,i=.2+.3*(t-3500)/3e3):(e=.9-.3*(t-6500)/23500,s=.9-.4*(t-6500)/23500,i=.8+.2*(t-6500)/23500),new M(Math.max(.3,Math.min(1,e)),Math.max(.2,Math.min(1,s)),Math.max(.2,Math.min(1,i)))}_create(t){const[e,s]=o.starCore.sizeRange;for(let i=0;i<t;i++){const a=e+Math.random()*(s-e),r=o.starCore.colorTempRange[0]+Math.random()*(o.starCore.colorTempRange[1]-o.starCore.colorTempRange[0]),h=this._temperatureToRGB(r),n=o.starCore.pulsationSpeed*(.5+Math.random()*1),m=o.starCore.glowIntensity*(.6+Math.random()*.8),l=new k,d=new Float32Array([-1,-1,0,1,-1,0,1,1,0,-1,1,0]);l.setAttribute("position",new c(d,3)),l.setIndex([0,1,2,0,2,3]);const g={uTime:{value:Math.random()*100},uColor:{value:h},uIntensity:{value:m},uPulseSpeed:{value:n},uPixelRatio:{value:window.devicePixelRatio}},v=new F({uniforms:g,vertexShader:ut,fragmentShader:mt,transparent:!0,blending:x,depthWrite:!1,side:K}),b=new Float32Array([a*2]),P=new Float32Array([1]);l.setAttribute("aSize",new c(b,1)),l.setAttribute("aGlow",new c(P,1));const y=new B(l,v),u=new _((Math.random()-.5)*150,(Math.random()-.5)*60,(Math.random()-.5)*150-50);y.position.copy(u),y.lookAt(this.scene.position),y.name=`StarCore_${i}`,this.scene.add(y),this.stars.push({mesh:y,uniforms:g,position:u,baseSize:a,pulseSpeed:n,color:h,glowIntensity:m})}}update(t){for(const e of this.stars)e.uniforms.uTime.value+=t,e.mesh.lookAt(this.scene.position)}getPositions(){return this.stars.map(t=>t.position)}dispose(){for(const t of this.stars)this.scene.remove(t.mesh),t.mesh.geometry.dispose(),t.mesh.material.dispose();this.stars=[]}}class St{constructor(t,e=o.blackHole.count){this.scene=t,this.bhs=[],this._create(e),console.log("[BlackHole] 黑洞系統建立完成 / Created",e,"black holes")}_create(t){const[e,s]=o.blackHole.sizeRange;for(let i=0;i<t;i++){const a=e+Math.random()*(s-e),r=new X,h=new _((Math.random()-.5)*200,(Math.random()-.5)*60,(Math.random()-.5)*200-80);r.position.copy(h);const n=new j(a*.8,32,32),m=new F({uniforms:{uColor:{value:new M(.4,.2,.8)},uTime:{value:Math.random()*100}},vertexShader:gt,fragmentShader:pt,transparent:!0,blending:x,side:tt,depthWrite:!1}),l=new B(n,m);l.name="EventHorizon",r.add(l);const d=o.blackHole.accretionDiskParticles,g=new Float32Array(d*3),v=new Float32Array(d),b=new Float32Array(d),P=new Float32Array(d),y=new Float32Array(d);for(let f=0;f<d;f++){const E=.5+Math.random()*o.blackHole.diskRadius,G=Math.random()*Math.PI*2,Y=(Math.random()-.5)*.8*(E/o.blackHole.diskRadius);g[f*3]=E*Math.cos(G),g[f*3+1]=Y,g[f*3+2]=E*Math.sin(G),v[f]=E,b[f]=G,P[f]=Y,y[f]=.5+Math.random()*1}const u=new k;u.setAttribute("position",new c(g,3)),u.setAttribute("aRadius",new c(v,1)),u.setAttribute("aAngle",new c(b,1)),u.setAttribute("aHeight",new c(P,1)),u.setAttribute("aSpeed",new c(y,1));const A={uTime:{value:Math.random()*100},uPixelRatio:{value:window.devicePixelRatio}},z=new F({uniforms:A,vertexShader:ft,fragmentShader:vt,transparent:!0,blending:x,depthWrite:!1}),w=new R(u,z);w.name="AccretionDisk",w.rotation.x=Math.PI*.3,r.add(w);const C=o.blackHole.jetParticles,T=new Float32Array(C*3),N=new Float32Array(C),W=new Float32Array(C),V=new Float32Array(C),q=new Float32Array(C);for(let f=0;f<C;f++)T[f*3]=0,T[f*3+1]=0,T[f*3+2]=0,N[f]=Math.random(),W[f]=.1+Math.random()*.3,V[f]=.3+Math.random()*.7,q[f]=.05+Math.random()*.15;const I=new k;I.setAttribute("position",new c(T,3)),I.setAttribute("aOffset",new c(N,1)),I.setAttribute("aRadial",new c(W,1)),I.setAttribute("aAlpha",new c(V,1)),I.setAttribute("aSpeed",new c(q,1));const $={uTime:{value:Math.random()*100},uPixelRatio:{value:window.devicePixelRatio},uColor:{value:new M(.6,.8,1)}},U=new F({uniforms:$,vertexShader:yt,fragmentShader:wt,transparent:!0,blending:x,depthWrite:!1}),L=new R(I.clone(),U.clone());L.name="JetTop",L.rotation.x=0,r.add(L);const H=new R(I.clone(),U.clone());H.name="JetBottom",H.rotation.x=Math.PI,r.add(H),r.name=`BlackHole_${i}`,this.scene.add(r),this.bhs.push({group:r,position:h,size:a,uniforms:{horizon:m.uniforms,disk:A,jet:$},disk:w,jetTop:L,jetBottom:H,horizon:l})}}update(t,e){const s=o.blackHole.diskSpinSpeed;for(const i of this.bhs)i.uniforms.horizon.uTime.value+=t,i.uniforms.disk.uTime.value+=t,i.uniforms.jet.uTime.value+=t,i.disk.rotation.z+=t*s,i.group.rotation.y+=t*.02}getPositions(){return this.bhs.map(t=>t.position)}dispose(){for(const t of this.bhs)this.scene.remove(t.group),t.group.traverse(e=>{var s,i;(e.isMesh||e.isPoints)&&((s=e.geometry)==null||s.dispose(),(i=e.material)==null||i.dispose())});this.bhs=[]}}class xt{constructor(t,e,s){this.scene=t,this.startTime=s,this.lifetime=o.supernova.lifetime,this.alive=!0;const i=o.supernova.particleCount,a=new Float32Array(i*3),r=new Float32Array(i),h=new Float32Array(i);for(let l=0;l<i;l++)a[l*3]=e.x+(Math.random()-.5)*2,a[l*3+1]=e.y+(Math.random()-.5)*2,a[l*3+2]=e.z+(Math.random()-.5)*2,r[l]=Math.random(),h[l]=.3+Math.random()*.7;const n=new k;n.setAttribute("position",new c(a,3)),n.setAttribute("aSeed",new c(r,1)),n.setAttribute("aAlpha",new c(h,1)),this.uniforms={uTime:{value:0},uExplosionTime:{value:s},uPixelRatio:{value:window.devicePixelRatio}};const m=new F({uniforms:this.uniforms,vertexShader:bt,fragmentShader:_t,transparent:!0,blending:x,depthWrite:!1});this.points=new R(n,m),this.points.position.copy(e),this.points.name="Supernova",this.scene.add(this.points)}update(t){return this.uniforms.uTime.value=t,t-this.startTime>this.lifetime&&(this.alive=!1,this.scene.remove(this.points),this.points.geometry.dispose(),this.points.material.dispose()),this.alive}}class At{constructor(t){this.scene=t,this.events=[]}trigger(t,e){if(this._cleanup(e),this.events.length>=o.supernova.maxConcurrent){const i=this.events.shift();i.alive=!1,this.scene.remove(i.points),i.points.geometry.dispose(),i.points.material.dispose()}const s=new xt(this.scene,t,e);return this.events.push(s),console.log("[Supernova] 爆炸觸發! / Explosion triggered at",t),s}_cleanup(t){this.events=this.events.filter(e=>e.update(t))}update(t){this._cleanup(t)}getActiveCount(){return this.events.length}dispose(){for(const t of this.events)this.scene.remove(t.points),t.points.geometry.dispose(),t.points.material.dispose();this.events=[]}}class Tt{constructor(t,e=o.binaryStar.count){this.scene=t,this.systems=[],this._create(e),console.log("[BinaryStar] 雙星系統建立完成 / Created",e,"systems")}_create(t){for(let e=0;e<t;e++){const s=new X,i=o.binaryStar.separationRange[0]+Math.random()*(o.binaryStar.separationRange[1]-o.binaryStar.separationRange[0]),a=o.binaryStar.massRatioRange[0]+Math.random()*(o.binaryStar.massRatioRange[1]-o.binaryStar.massRatioRange[0]),r=new _((Math.random()-.5)*150,(Math.random()-.5)*50,(Math.random()-.5)*150-50);s.position.copy(r);const h=1.2+Math.random()*1.5,n=new M().setHSL(.08,.8,.7),m=this._createStarMesh(h,n);m.name="Primary";const l=h*a*.7,d=new M().setHSL(.6,.7,.7),g=this._createStarMesh(l,d);g.name="Secondary",s.add(m),s.add(g);const v=o.binaryStar.trailParticles,b=new Float32Array(v*3),P=new Float32Array(v*3),y=new Float32Array(v);for(let w=0;w<v;w++){const C=w/v;b[w*3]=(C-.5)*i,b[w*3+1]=Math.sin(C*Math.PI*4)*.5,b[w*3+2]=Math.cos(C*Math.PI*4)*.3;const T=new M().lerpColors(n,d,C);P[w*3]=T.r,P[w*3+1]=T.g,P[w*3+2]=T.b,y[w]=.3+Math.random()*.4}const u=new k;u.setAttribute("position",new c(b,3)),u.setAttribute("color",new c(P,3)),u.setAttribute("size",new c(y,1));const A=new D({size:.3,vertexColors:!0,transparent:!0,opacity:.4,blending:x,depthWrite:!1}),z=new R(u,A);z.name="Trail",s.add(z),s.name=`BinaryStar_${e}`,this.scene.add(s),this.systems.push({group:s,primary:m,secondary:g,trail:z,separation:i,massRatio:a,position:r,orbitAngle:Math.random()*Math.PI*2,primaryOffset:i/2*(1/(1+a)),secondaryOffset:i/2*(a/(1+a))})}}_createStarMesh(t,e){const s=new j(t,16,16),i=new Q({color:e}),a=new B(s,i),r=new j(t*2.5,16,16),h=new Q({color:e,transparent:!0,opacity:.15,blending:x,depthWrite:!1}),n=new B(r,h);return a.add(n),a}update(t){const e=o.binaryStar.orbitalSpeed;for(const s of this.systems){s.orbitAngle+=e*.016;const i=s.orbitAngle,a=Math.cos(i)*s.primaryOffset,r=Math.sin(i)*s.primaryOffset;s.primary.position.set(a,Math.sin(i*2)*.2,r);const h=-Math.cos(i)*s.secondaryOffset,n=-Math.sin(i)*s.secondaryOffset;s.secondary.position.set(h,Math.sin(i*2+Math.PI)*.2,n);const m=o.binaryStar.trailParticles,l=s.trail.geometry.attributes.position.array;for(let d=0;d<m;d++){const g=d/m,v=a*(1-g)+h*g,b=r*(1-g)+n*g;l[d*3]=v,l[d*3+1]=Math.sin(g*Math.PI*4+t)*.3,l[d*3+2]=b+Math.cos(g*Math.PI*4+t*.5)*.2}s.trail.geometry.attributes.position.needsUpdate=!0}}getPositions(){return this.systems.map(t=>{const e=new _;return t.group.getWorldPosition(e),e})}dispose(){for(const t of this.systems)this.scene.remove(t.group),t.group.traverse(e=>{var s,i;(e.isMesh||e.isPoints)&&((s=e.geometry)==null||s.dispose(),(i=e.material)==null||i.dispose())});this.systems=[]}}class Rt{constructor(t){this.scene=t,this.activeCollisions=[],this._tidalParticles=[],this.timeSinceLastCollision=0,this._initParticlePool(),console.log("[GalaxyCollision] 碰撞系統初始化完成 / Initialized")}_initParticlePool(){const t=o.galaxyCollision.tidalParticles,e=new Float32Array(t*3),s=new Float32Array(t*3),i=new Float32Array(t);for(let n=0;n<t;n++){e[n*3]=(Math.random()-.5)*400,e[n*3+1]=(Math.random()-.5)*100,e[n*3+2]=(Math.random()-.5)*400;const m=new M().setHSL(.6+Math.random()*.2,.5,.5+Math.random()*.3);s[n*3]=m.r,s[n*3+1]=m.g,s[n*3+2]=m.b,i[n]=.3+Math.random()*.5}const a=new k;a.setAttribute("position",new c(e,3)),a.setAttribute("color",new c(s,3)),a.setAttribute("size",new c(i,1));const r=new D({size:.5,vertexColors:!0,transparent:!0,opacity:0,blending:x,depthWrite:!1});this.tidalPoints=new R(a,r),this.tidalPoints.name="TidalStreams",this.tidalPoints.visible=!1,this.scene.add(this.tidalPoints),this._particleStates=[];const h=a.attributes.position;for(let n=0;n<t;n++)this._particleStates.push({baseX:h.array[n*3],baseY:h.array[n*3+1],baseZ:h.array[n*3+2],velocity:new _((Math.random()-.5)*.3,(Math.random()-.5)*.1,(Math.random()-.5)*.3),phase:Math.random()*Math.PI*2})}trigger(t,e){this.activeCollisions.push({position:t.clone(),startTime:e,progress:0,stage:0,duration:30}),this.tidalPoints.visible=!0,this.tidalPoints.material.opacity=.8,this.tidalPoints.position.copy(t);const s=this.tidalPoints.geometry.attributes.position;for(let i=0;i<s.count;i++){const a=this._particleStates[i],r=Math.random()*Math.PI*2,h=20+Math.random()*60;s.array[i*3]=t.x+h*Math.cos(r),s.array[i*3+1]=t.y+(Math.random()-.5)*20,s.array[i*3+2]=t.z+h*Math.sin(r),a.baseX=s.array[i*3],a.baseY=s.array[i*3+1],a.baseZ=s.array[i*3+2],a.velocity.set((Math.random()-.5)*.5,(Math.random()-.5)*.2,(Math.random()-.5)*.5)}s.needsUpdate=!0,console.log("[GalaxyCollision] 碰撞觸發! / Collision triggered at",t)}update(t,e){if(this.timeSinceLastCollision+=t,this.tidalPoints.visible){const s=this.tidalPoints.geometry.attributes.position;for(let a=0;a<s.count;a++){const r=this._particleStates[a],h=Math.sin(e*.1+r.phase)*5;s.array[a*3]+=r.velocity.x*t,s.array[a*3+1]+=r.velocity.y*t+h*t*.1,s.array[a*3+2]+=r.velocity.z*t,r.velocity.multiplyScalar(.999)}s.needsUpdate=!0,this._getOldestCollisionAge(e)>15&&(this.tidalPoints.material.opacity=Math.max(0,this.tidalPoints.material.opacity-t*.02),this.tidalPoints.material.opacity<=0&&(this.tidalPoints.visible=!1))}this.activeCollisions=this.activeCollisions.filter(s=>(s.progress=(e-s.startTime)/s.duration,s.progress<1.2))}_getOldestCollisionAge(t){return this.activeCollisions.length===0?999:t-this.activeCollisions[0].startTime}canTrigger(){return this.timeSinceLastCollision>o.galaxyCollision.triggerInterval&&this.activeCollisions.length<2}dispose(){this.scene.remove(this.tidalPoints),this.tidalPoints.geometry.dispose(),this.tidalPoints.material.dispose(),this.activeCollisions=[]}}class kt{constructor(t,e,s,i){this.refs=t,this.triggerSupernova=e,this.triggerCollision=s,this.switchCamera=i,this._supernovaTimer=o.eventScheduler.supernovaInterval[0]+Math.random()*(o.eventScheduler.supernovaInterval[1]-o.eventScheduler.supernovaInterval[0]),this._collisionTimer=o.galaxyCollision.triggerInterval*.5,this._cameraTimer=o.eventScheduler.cameraChangeInterval*.5,this._time=0,console.log("[EventScheduler] 事件排程器啟動 / Scheduler started")}update(t){this._time+=t,this._supernovaTimer-=t,this._supernovaTimer<=0&&(this._scheduleSupernova(),this._supernovaTimer=o.eventScheduler.supernovaInterval[0]+Math.random()*(o.eventScheduler.supernovaInterval[1]-o.eventScheduler.supernovaInterval[0])),this._collisionTimer-=t,this._collisionTimer<=0&&this.triggerCollision&&(this._scheduleCollision(),this._collisionTimer=o.galaxyCollision.triggerInterval+Math.random()*30)}_scheduleSupernova(){const t=[];if(this.refs.starCore&&t.push(...this.refs.starCore.getPositions()),this.refs.galaxies)for(const s of this.refs.galaxies)t.push(s.getWorldPosition());this.refs.binaryStar&&t.push(...this.refs.binaryStar.getPositions()),t.length===0&&t.push(new _((Math.random()-.5)*100,(Math.random()-.5)*40,(Math.random()-.5)*100-50));const e=t[Math.floor(Math.random()*t.length)];this.triggerSupernova(e,this._time)}_scheduleCollision(){const t=new _((Math.random()-.5)*150,(Math.random()-.5)*40,(Math.random()-.5)*150-80);this.triggerCollision(t,this._time)}reset(){this._supernovaTimer=10+Math.random()*10,this._collisionTimer=20+Math.random()*20,this._cameraTimer=3,this._time=0}getSimulationTime(){return this._time}dispose(){}}const S=Object.freeze({ORBIT:"orbit",FLYBY:"flyby",ZOOM:"zoom",WIDE:"wide"});class zt{constructor(t){this.camera=t,this.targets=[],this.currentTarget=null,this.nextTarget=null,this._position=new _(...o.camera.defaultPos),this._lookAt=new _(0,0,0),this._posTarget=this._position.clone(),this._lookTarget=this._lookAt.clone(),this._posVelocity=new _,this._lookVelocity=new _,this._orbitAngle=0,this._orbitRadius=o.camera.orbitRadius,this._orbitHeight=30,this._orbitSpeed=o.camera.cruiseSpeed,this.mode=S.ORBIT,this._modeTimer=0,this._targetChangeTimer=0,this._transitionDuration=o.camera.transitionDuration,this._isTransitioning=!1,this._transitionProgress=0,this._shakeAmount=0,this._shakeDecay=.95,this.camera.position.copy(this._position),this.camera.lookAt(this._lookAt),console.log("[CameraController] 初始化完成 / Initialized")}addTarget(t,e="Unknown",s){this.targets.push({object:t,label:e,orbitRadius:s||o.camera.orbitRadius,active:!0}),this.targets.length===1&&this.setTarget(this.targets[0])}removeTarget(t){this.targets=this.targets.filter(e=>e.object!==t)}setTarget(t){if(this.currentTarget===t)return;this.currentTarget=t,this._isTransitioning=!0,this._transitionProgress=0,this._orbitRadius=t.orbitRadius||o.camera.orbitRadius,this._orbitHeight=o.camera.orbitHeightRange[0]+Math.random()*(o.camera.orbitHeightRange[1]-o.camera.orbitHeightRange[0]);const e=[S.ORBIT,S.ORBIT,S.FLYBY,S.WIDE];this.mode=e[Math.floor(Math.random()*e.length)],this.mode===S.FLYBY&&(this._orbitAngle=Math.random()*Math.PI*2),this._updateTargetLabel(t.label)}switchToRandomTarget(){const t=this.targets.filter(s=>s!==this.currentTarget&&s.active);if(t.length===0)return;const e=t[Math.floor(Math.random()*t.length)];this.setTarget(e)}shake(t=1){this._shakeAmount=Math.max(this._shakeAmount,t)}_updateTargetLabel(t){const e=document.getElementById("hud-target");e&&(e.textContent=`◆ ${t}`,e.classList.add("visible"),clearTimeout(e._hideTimer),e._hideTimer=setTimeout(()=>e.classList.remove("visible"),4e3))}update(t){if(!this.currentTarget)this._orbitAngle+=t*.05,this._posTarget.set(Math.sin(this._orbitAngle)*100,40,Math.cos(this._orbitAngle)*100),this._lookTarget.set(0,0,0);else{const e=new _;this.currentTarget.object.getWorldPosition(e),this._isTransitioning&&(this._transitionProgress+=t/this._transitionDuration,this._transitionProgress>=1&&(this._transitionProgress=1,this._isTransitioning=!1));let s=new _;switch(this.mode){case S.ORBIT:{this._orbitAngle+=t*this._orbitSpeed;const i=Math.sin(this._orbitAngle*.5)*15;s.set(e.x+Math.sin(this._orbitAngle)*this._orbitRadius,e.y+this._orbitHeight+i,e.z+Math.cos(this._orbitAngle)*this._orbitRadius);break}case S.FLYBY:{this._orbitAngle+=t*this._orbitSpeed*.8;const i=this._orbitRadius*.6,a=Math.sin(this._orbitAngle*2)*10+20;s.set(e.x+Math.sin(this._orbitAngle)*i,e.y+a,e.z+Math.cos(this._orbitAngle)*i);break}case S.ZOOM:{const a=10+(Math.sin(this._modeTimer*.3)*.5+.5)*20;s.set(e.x+Math.sin(this._orbitAngle)*a,e.y+5,e.z+Math.cos(this._orbitAngle)*a),this._orbitAngle+=t*.02;break}case S.WIDE:{this._orbitAngle+=t*this._orbitSpeed*.3,s.set(e.x+Math.sin(this._orbitAngle)*this._orbitRadius*1.6,e.y+this._orbitHeight*1.5,e.z+Math.cos(this._orbitAngle)*this._orbitRadius*1.6);break}}if(this._isTransitioning){const i=this._easeInOutCubic(this._transitionProgress);this._posTarget.lerp(s,i*.1),this._lookTarget.lerp(e,i*.08)}else this._posTarget.lerp(s,t*.8),this._lookTarget.lerp(e,t*.6);this._modeTimer+=t}if(this._position.lerp(this._posTarget,t*2),this._lookAt.lerp(this._lookTarget,t*1.5),this._shakeAmount>.01){const e=new _((Math.random()-.5)*this._shakeAmount,(Math.random()-.5)*this._shakeAmount,(Math.random()-.5)*this._shakeAmount);this.camera.position.copy(this._position).add(e),this._shakeAmount*=this._shakeDecay}else this._shakeAmount=0,this.camera.position.copy(this._position);this.camera.lookAt(this._lookAt),this._targetChangeTimer+=t,this._targetChangeTimer>=o.camera.targetChangeInterval&&(this._targetChangeTimer=0,this.switchToRandomTarget())}_easeInOutCubic(t){return t<.5?4*t*t*t:1-Math.pow(-2*t+2,3)/2}reset(){this._position.set(...o.camera.defaultPos),this._posTarget.copy(this._position),this._lookAt.set(0,0,0),this._lookTarget.set(0,0,0),this.camera.position.copy(this._position),this.camera.lookAt(this._lookAt),this._orbitAngle=0,this._targetChangeTimer=0,this.currentTarget=null,this.targets.length>0&&this.setTarget(this.targets[0])}}class It{constructor(t,e,s){this.renderer=t,this.scene=e,this.camera=s,console.log("[PostProcessing] 簡化模式啟動 / Simplified mode active")}resize(t,e){}render(t){this.renderer.render(this.scene,this.camera)}updateQuality(){}dispose(){}}class Ft{constructor(){this.elements={fps:document.getElementById("hud-fps"),time:document.getElementById("hud-time"),particles:document.getElementById("hud-particles"),stars:document.getElementById("hud-stars"),galaxies:document.getElementById("hud-galaxies"),bh:document.getElementById("hud-bh"),events:document.getElementById("hud-events"),target:document.getElementById("hud-target"),loading:document.getElementById("loading"),loadingBar:document.getElementById("loading-bar")},this._frameCount=0,this._fpsTimer=0,this._currentFPS=0,this._setupControls(),this.paused=!1,this.onPause=null,this.onFullscreen=null,this.onScreenshot=null,this.onReset=null,this.onQualityChange=null,console.log("[HUD] 顯示系統初始化完成 / Initialized")}_setupControls(){const t=document.getElementById("btn-pause");t.addEventListener("click",()=>{this.paused=!this.paused,t.textContent=this.paused?"▶ Play":"⏸ Pause",t.classList.toggle("active",this.paused),this.onPause&&this.onPause(this.paused)}),document.getElementById("btn-fullscreen").addEventListener("click",()=>{document.fullscreenElement?document.exitFullscreen().catch(()=>{}):document.documentElement.requestFullscreen().catch(()=>{}),this.onFullscreen&&this.onFullscreen()}),document.getElementById("btn-screenshot").addEventListener("click",()=>{this.onScreenshot&&this.onScreenshot()}),document.getElementById("btn-reset").addEventListener("click",()=>{this.onReset&&this.onReset()}),document.querySelectorAll("#hud-quality button").forEach(e=>{e.addEventListener("click",()=>{document.querySelectorAll("#hud-quality button").forEach(i=>i.classList.remove("active")),e.classList.add("active");const s=e.dataset.quality;lt(s),this.onQualityChange&&this.onQualityChange(s)})})}setLoadingProgress(t){this.elements.loadingBar&&(this.elements.loadingBar.style.width=`${t*100}%`)}hideLoading(){this.elements.loading&&(this.elements.loading.classList.add("hidden"),setTimeout(()=>{this.elements.loading.style.display="none"},1200))}updateStats(t){const e=this.elements;if(this._frameCount++,this._fpsTimer+=t.delta,this._fpsTimer>=.5&&(this._currentFPS=Math.round(this._frameCount/this._fpsTimer),this._frameCount=0,this._fpsTimer=0),e.fps&&(e.fps.textContent=this._currentFPS),e.time){const s=(t.simulationTime*10).toFixed(1);e.time.textContent=`${s} Myr`}e.particles&&(e.particles.textContent=(t.particles||0).toLocaleString()),e.stars&&(e.stars.textContent=(t.stars||0).toLocaleString()),e.galaxies&&(e.galaxies.textContent=t.galaxies||0),e.bh&&(e.bh.textContent=t.blackHoles||0),e.events&&(e.events.textContent=t.events||0)}showNotification(t){const e=this.elements.target;e&&(e.textContent=`✦ ${t}`,e.classList.add("visible"),clearTimeout(e._hideTimer),e._hideTimer=setTimeout(()=>e.classList.remove("visible"),3e3))}dispose(){}}class Lt{constructor(){this.container=document.getElementById("canvas-container"),this.scene=null,this.camera=null,this.renderer=null,this.clock=new et,this.postProcessing=null,this.cameraController=null,this.hud=null,this.nebula=null,this.galaxies=[],this.starCore=null,this.blackHole=null,this.supernovaSystem=null,this.binaryStar=null,this.galaxyCollision=null,this.eventScheduler=null,this._paused=!1,this._time=0,this.stats={particles:0,stars:0,galaxies:0,blackHoles:0,events:0},console.log("[Engine] 引擎啟動中 / Starting...")}async init(){const t=new Ft;this.hud=t,t.setLoadingProgress(.1),this.scene=new st,this.scene.background=new M(0),t.setLoadingProgress(.15),this.camera=new it(o.camera.fov,window.innerWidth/window.innerHeight,o.camera.near,o.camera.far),t.setLoadingProgress(.2);const e=ht();this.renderer=new ot({antialias:e.aa,powerPreference:"high-performance"}),this.renderer.setSize(window.innerWidth,window.innerHeight),this.renderer.setPixelRatio(window.devicePixelRatio*e.scale),this.renderer.toneMapping=at,this.renderer.toneMappingExposure=1.5,this.renderer.outputColorSpace=rt,this.container.appendChild(this.renderer.domElement),t.setLoadingProgress(.3),this.postProcessing=new It(this.renderer,this.scene,this.camera),t.setLoadingProgress(.35),this.cameraController=new zt(this.camera),t.setLoadingProgress(.4),this.nebula=new Mt(this.scene),t.setLoadingProgress(.45);for(let s=0;s<o.galaxy.count;s++)this.galaxies.push(new Pt(this.scene,s));t.setLoadingProgress(.55),this.starCore=new Ct(this.scene),t.setLoadingProgress(.6),this.blackHole=new St(this.scene),t.setLoadingProgress(.65),this.binaryStar=new Tt(this.scene),t.setLoadingProgress(.7),this.supernovaSystem=new At(this.scene),t.setLoadingProgress(.75),this.galaxyCollision=new Rt(this.scene),t.setLoadingProgress(.8),this._registerCameraTargets(),this.eventScheduler=new kt({starCore:this.starCore,galaxies:this.galaxies,binaryStar:this.binaryStar},(s,i)=>{this.supernovaSystem.trigger(s,i),this.cameraController.shake(.5),this.hud.showNotification("💥 超新星爆炸 / Supernova!")},(s,i)=>{this.galaxyCollision.trigger(s,i),this.cameraController.shake(1),this.hud.showNotification("🌀 星系碰撞 / Galaxy Collision!")},()=>{this.cameraController.switchToRandomTarget()}),t.setLoadingProgress(.85),t.onPause=s=>{this._paused=s,s?(this.clock.stop(),this.hud.showNotification("⏸ 已暫停 / Paused")):(this.clock.start(),this.hud.showNotification("▶ 繼續 / Resumed"))},t.onScreenshot=()=>{this._takeScreenshot()},t.onReset=()=>{this._resetSimulation()},t.onQualityChange=s=>{this._updateRenderingQuality(s),this.hud.showNotification(`📺 畫質: ${s.toUpperCase()}`)},t.onFullscreen=()=>{},t.setLoadingProgress(.9),window.addEventListener("resize",()=>this._onResize()),this._updateStats(),t.setLoadingProgress(1),setTimeout(()=>t.hideLoading(),500),this.clock.start(),this._animate(),console.log("[Engine] 引擎初始化完成 / Ready!")}_registerCameraTargets(){const t=this.cameraController;for(let a=0;a<this.galaxies.length;a++)t.addTarget(this.galaxies[a].mesh,`Galaxy ${a+1}`,60+Math.random()*40);const e=this.starCore.getPositions();for(let a=0;a<Math.min(e.length,3);a++){const r=new O;r.position.copy(e[a]),this.scene.add(r),t.addTarget(r,`Star Core ${a+1}`,20+Math.random()*20)}const s=this.blackHole.getPositions();for(let a=0;a<s.length;a++){const r=new O;r.position.copy(s[a]),this.scene.add(r),t.addTarget(r,`Black Hole ${a+1}`,15+Math.random()*10)}const i=new O;i.position.set(0,0,0),this.scene.add(i),t.addTarget(i,"Deep Field",120)}_updateStats(){this.stats.particles=o.nebula.particleCount+o.blackHole.accretionDiskParticles*o.blackHole.count*2+o.blackHole.jetParticles*o.blackHole.count*2+o.supernova.particleCount,this.stats.stars=o.galaxy.starsPerGalaxy*o.galaxy.count+o.starCore.count,this.stats.galaxies=o.galaxy.count,this.stats.blackHoles=o.blackHole.count}_animate(){requestAnimationFrame(()=>this._animate());const t=Math.min(this.clock.getDelta(),o.physics.maxDeltaTime);if(!this._paused){this._time+=t,this.nebula.update(t);for(const e of this.galaxies)e.update(t);this.starCore.update(t),this.blackHole.update(t,this._time),this.binaryStar.update(this._time),this.supernovaSystem.update(this._time),this.galaxyCollision.update(t,this._time),this.eventScheduler.update(t),this.cameraController.update(t),this.postProcessing.render(t),this.hud.updateStats({delta:t,simulationTime:this._time,particles:this.stats.particles,stars:this.stats.stars,galaxies:this.stats.galaxies,blackHoles:this.stats.blackHoles,events:this.supernovaSystem.getActiveCount()})}}_onResize(){const t=window.innerWidth,e=window.innerHeight;this.camera.aspect=t/e,this.camera.updateProjectionMatrix(),this.postProcessing.resize(t,e)}_takeScreenshot(){const t=new nt;this.renderer.getSize(t);const e=this.renderer.getPixelRatio();this.renderer.setPixelRatio(2),this.postProcessing.resize(window.innerWidth*2,window.innerHeight*2),this.postProcessing.render(0);const s=document.createElement("a");s.download=`cosmic-genesis-${Date.now()}.png`,s.href=this.renderer.domElement.toDataURL("image/png"),s.click(),this.renderer.setPixelRatio(e),this.postProcessing.resize(window.innerWidth,window.innerHeight),this.hud.showNotification("📸 截圖已儲存 / Screenshot saved")}_updateRenderingQuality(t){const e=o.quality[t];this.renderer.setPixelRatio(window.devicePixelRatio*e.scale),this.renderer.setAntialias(e.aa),this.postProcessing.updateQuality()}_resetSimulation(){this._paused=!1,this._time=0,this.clock.stop(),this.clock.start(),this.cameraController.reset(),this.eventScheduler.reset(),this.hud.showNotification("⟳ 模擬重置 / Simulation reset")}dispose(){var t,e,s,i,a,r,h,n,m;(t=this.nebula)==null||t.dispose(),this.galaxies.forEach(l=>l.dispose()),(e=this.starCore)==null||e.dispose(),(s=this.blackHole)==null||s.dispose(),(i=this.supernovaSystem)==null||i.dispose(),(a=this.binaryStar)==null||a.dispose(),(r=this.galaxyCollision)==null||r.dispose(),(h=this.eventScheduler)==null||h.dispose(),this.cameraController=null,(n=this.postProcessing)==null||n.dispose(),(m=this.hud)==null||m.dispose(),this.renderer.dispose()}}console.log(`
  ╔══════════════════════════════════════════╗
  ║        ✦  COSMIC  GENESIS  ✦            ║
  ║     宇宙創世模擬器 / Universe Simulator   ║
  ╚══════════════════════════════════════════╝
`);document.readyState==="loading"?document.addEventListener("DOMContentLoaded",Z):Z();function Z(){const p=new Lt;p.init().catch(t=>{console.error("[FATAL] 引擎初始化失敗 / Engine initialization failed:",t);const e=document.getElementById("loading");e&&(e.innerHTML=`
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
      `)}),window.__cosmicGenesis=p}
