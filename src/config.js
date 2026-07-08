/**
 * ============================================================================
 * Cosmic Genesis — 全域組態設定
 * Global Configuration
 * ============================================================================
 *
 * 所有可調參數集中管理，方便調整效能與視覺效果。
 * All tunable parameters are centralized here for easy performance and visual tuning.
 */

export const CONFIG = {

  // ===== 渲染品質 (Rendering Quality) =====
  quality: {
    // scale 為 devicePixelRatio 的倍數：1.0 = 使用螢幕原始解析度
    // scale is a multiplier of devicePixelRatio: 1.0 = native screen resolution
    high:   { scale: 1.0, particleRatio: 1.0, bloom: 1.0, shadows: true, aa: true },
    medium: { scale: 0.75, particleRatio: 0.6, bloom: 0.5, shadows: false, aa: true },
    low:    { scale: 0.5, particleRatio: 0.3, bloom: 0.2, shadows: false, aa: false },
  },

  // ===== 相機設定 (Camera Settings) =====
  camera: {
    fov: 50,
    near: 0.1,
    far: 20000,
    defaultPos: [0, 40, 80],
    // 巡航參數 (Cruise parameters)
    cruiseSpeed: 0.08,       // 整體巡航速度
    orbitRadius: 60,          // 環繞半徑
    orbitHeightRange: [10, 60], // 高度範圍
    targetChangeInterval: 8,  // 更換目標間隔（秒）
    transitionDuration: 3,    // 轉場持續時間（秒）
  },

  // ===== 粒子星雲設定 (Nebula / Particle Universe) =====
  nebula: {
    particleCount: 25000,     // 粒子總數（從80,000降為25,000，減少白色霧狀）
    spread: 300,              // 散佈範圍（從800降為300，集中在相機附近）
    colorHues: [0.55, 0.65, 0.75, 0.85, 0.0, 0.05], // 色相範圍（藍色到紫色到紅色）
    opacityRange: [0.005, 0.04],
    sizeRange: [0.2, 1.0],
    rotationSpeed: 0.0001,    // 自轉速度
  },

  // ===== 星系設定 (Galaxy Settings) =====
  galaxy: {
    count: 3,                 // 星系數量
    starsPerGalaxy: 30000,   // 每個星系的恆星數（instanced mesh）
    armCount: [2, 4],        // 旋臂數量範圍
    armSpread: 0.4,          // 旋臂散佈度
    radiusRange: [15, 35],   // 星系半徑範圍（從30-80縮小為15-35）
    thickness: 2.0,          // 星系厚度
    rotationSpeed: 0.005,    // 自轉速度
    colorPalette: [
      [0.58, 0.6, 0.7],      // 藍白
      [0.1, 0.6, 0.8],       // 暖黃
      [0.0, 0.5, 0.6],       // 橙紅
    ],
  },

  // ===== 恆星核心設定 (Star Core Settings) =====
  starCore: {
    count: 5,                 // 大恆星數量
    sizeRange: [1.5, 3.5],
    pulsationSpeed: 0.5,
    colorTempRange: [3500, 30000], // Kelvin 色溫範圍
    glowIntensity: 1.5,
  },

  // ===== 黑洞設定 (Black Hole Settings) =====
  blackHole: {
    count: 2,
    sizeRange: [2.0, 5.0],
    eventHorizonGlow: 2.0,
    accretionDiskParticles: 15000,
    diskRadius: 8,
    diskSpinSpeed: 0.03,
    jetParticles: 5000,
    jetLength: 30,
    jetSpeed: 0.15,
  },

  // ===== 超新星設定 (Supernova Settings) =====
  supernova: {
    maxConcurrent: 2,
    particleCount: 8000,
    expansionSpeed: 2.0,
    lifetime: 8.0,            // 秒
    colorSequence: [
      [1.0, 0.9, 0.7],       // 白熱
      [1.0, 0.6, 0.2],       // 橙
      [0.8, 0.2, 0.05],      // 紅
      [0.2, 0.1, 0.3],       // 紫暗
    ],
  },

  // ===== 雙星系統 (Binary Star System) =====
  binaryStar: {
    count: 1,
    separationRange: [3, 8],
    orbitalSpeed: 0.3,
    massRatioRange: [0.3, 1.0],
    trailParticles: 2000,
  },

  // ===== 星系碰撞 (Galaxy Collision) =====
  galaxyCollision: {
    enabled: true,
    collisionSpeed: 0.02,
    tidalParticles: 5000,
    triggerInterval: 120,     // 觸發間隔（秒）
  },

  // ===== 事件排程 (Event Scheduler) =====
  eventScheduler: {
    supernovaInterval: [15, 40],   // 超新星間隔範圍（秒）
    cameraChangeInterval: 8,
    collisionCheckInterval: 5,
  },

  // ===== 物理模擬 (Physics) =====
  physics: {
    gravityStrength: 0.5,
    dampingFactor: 0.998,
    timeScale: 1.0,
    maxDeltaTime: 0.05,
  },

  // ===== 特效設定 (Post-Processing Effects) =====
  effects: {
    bloomStrength: 0.5,
    bloomRadius: 0.2,
    bloomThreshold: 0.3,
    chromaticAberration: 0.002,
    vignetteStrength: 0.3,
    filmGrain: 0.05,
  },
};

/**
 * 目前活躍的品質等級
 * Current active quality level
 * @type {'high'|'medium'|'low'}
 */
export let activeQuality = 'high';

/**
 * 切換品質等級
 * Switch quality level
 * @param {'high'|'medium'|'low'} level
 */
export function setQuality(level) {
  if (CONFIG.quality[level]) {
    activeQuality = level;
  }
}

/**
 * 取得目前品質組態
 * Get current quality configuration
 */
export function getQualityConfig() {
  return CONFIG.quality[activeQuality];
}
