/**
 * ============================================================================
 * Cosmic Genesis — 自訂著色器 (Custom Shaders)
 * ============================================================================
 *
 * 包含所有自訂 GLSL 著色器程式碼，用於粒子、黑洞、星雲等特效。
 * Contains all custom GLSL shader code for particles, black holes, nebulae, etc.
 */

// ============================================================================
// 星雲粒子頂點著色器 (Nebula Particle Vertex Shader)
// ============================================================================
export const nebulaParticleVert = `
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
`;

// ============================================================================
// 星雲粒子片段著色器 (Nebula Particle Fragment Shader)
// ============================================================================
export const nebulaParticleFrag = `
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
`;

// ============================================================================
// 恆星光暈頂點著色器 (Star Glow Vertex Shader)
// ============================================================================
export const starGlowVert = `
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
`;

// ============================================================================
// 恆星光暈片段著色器 (Star Glow Fragment Shader)
// ============================================================================
export const starGlowFrag = `
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
`;

// ============================================================================
// 黑洞事件視界頂點著色器 (Black Hole Event Horizon Vertex Shader)
// ============================================================================
export const blackHoleVert = `
  varying vec3 vNormal;
  varying vec3 vViewDir;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 mvPos = modelViewMatrix * vec4(position, 1.0);
    vViewDir = normalize(-mvPos.xyz);
    gl_Position = projectionMatrix * mvPos;
  }
`;

// ============================================================================
// 黑洞事件視界片段著色器 (Black Hole Event Horizon Fragment Shader)
// ============================================================================
export const blackHoleFrag = `
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
`;

// ============================================================================
// 吸積盤頂點著色器 (Accretion Disk Vertex Shader)
// ============================================================================
export const accretionDiskVert = `
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
`;

// ============================================================================
// 吸積盤片段著色器 (Accretion Disk Fragment Shader)
// ============================================================================
export const accretionDiskFrag = `
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
`;

// ============================================================================
// 噴流頂點著色器 (Jet Stream Vertex Shader)
// ============================================================================
export const jetVert = `
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
`;

// ============================================================================
// 噴流片段著色器 (Jet Fragment Shader)
// ============================================================================
export const jetFrag = `
  varying float vAlpha;

  uniform vec3 uColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(uColor, alpha);
  }
`;

// ============================================================================
// 超新星頂點著色器 (Supernova Vertex Shader)
// ============================================================================
export const supernovaVert = `
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
`;

// ============================================================================
// 超新星片段著色器 (Supernova Fragment Shader)
// ============================================================================
export const supernovaFrag = `
  varying float vAlpha;
  varying vec3 vColor;

  void main() {
    vec2 center = gl_PointCoord - vec2(0.5);
    float dist = length(center);
    if (dist > 0.5) discard;

    float alpha = smoothstep(0.5, 0.0, dist) * vAlpha;
    gl_FragColor = vec4(vColor, alpha);
  }
`;

// ============================================================================
// 色差特效頂點著色器 (Chromatic Aberration Vertex Shader)
// ============================================================================
export const chromaticAberrationVert = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

// ============================================================================
// 色差特效片段著色器 (Chromatic Aberration Fragment Shader)
// ============================================================================
export const chromaticAberrationFrag = `
  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uStrength;

  varying vec2 vUv;

  void main() {
    vec2 uv = vUv;

    // 鏡頭四周色差 (Radial chromatic aberration)
    vec2 center = uv - 0.5;
    float dist = length(center);

    vec2 offset = uStrength * dist * normalize(center);

    float r = texture2D(tDiffuse, uv + offset).r;
    float g = texture2D(tDiffuse, uv).g;
    float b = texture2D(tDiffuse, uv - offset).b;

    gl_FragColor = vec4(r, g, b, 1.0);
  }
`;

// ============================================================================
// 暈影特效片段著色器 (Vignette Fragment Shader)
// ============================================================================
export const vignetteFrag = `
  uniform sampler2D tDiffuse;
  uniform float uStrength;

  varying vec2 vUv;

  void main() {
    vec4 color = texture2D(tDiffuse, vUv);
    vec2 center = vUv - 0.5;
    float vignette = 1.0 - dot(center, center) * uStrength * 2.0;
    vignette = clamp(vignette, 0.0, 1.0);
    gl_FragColor = vec4(color.rgb * vignette, color.a);
  }
`;
