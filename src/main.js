/**
 * ============================================================================
 * Cosmic Genesis — 宇宙創世模擬器 (Entry Point)
 * ============================================================================
 *
 * 專案簡介 (Project Overview):
 * 一個全自動、永不停歇的宇宙演化模擬器，採用 Three.js 與 GPU 加速渲染。
 * 包含粒子星雲、螺旋星系、恆星、黑洞、超新星、雙星系統、星系碰撞等。
 * 鏡頭自動巡航，打造如 IMAX 紀錄片般的沉浸式太空觀賞體驗。
 *
 * 執行方式 (How to run):
 *   npm install
 *   npm run dev     → 開發模式
 *   npm run build   → 建置部署版本
 *
 * 技術棧 (Tech Stack):
 * - Vite (開發伺服器與打包)
 * - Three.js (3D 渲染引擎)
 * - GLSL Shaders (自訂 GPU 特效)
 * - ES Modules (模組化架構)
 *
 * @author Vincent
 * @version 1.0.0
 */

import { Engine } from './core/Engine.js';

// ============================================================================
// 應用程式啟動 (Application Bootstrap)
// ============================================================================

console.log(`
  ╔══════════════════════════════════════════╗
  ║        ✦  COSMIC  GENESIS  ✦            ║
  ║     宇宙創世模擬器 / Universe Simulator   ║
  ╚══════════════════════════════════════════╝
`);

// 當 DOM 準備就緒時啟動引擎
// Start the engine when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}

/**
 * 啟動函式 (Bootstrap function)
 * 建立引擎實例並初始化所有系統
 */
function bootstrap() {
  const engine = new Engine();

  // 啟動初始化（非同步）
  // Start initialization (async)
  engine.init().catch(error => {
    console.error('[FATAL] 引擎初始化失敗 / Engine initialization failed:', error);

    // 顯示錯誤訊息給使用者 (Show error to user)
    const loading = document.getElementById('loading');
    if (loading) {
      loading.innerHTML = `
        <h1>✦ COSMIC GENESIS</h1>
        <p style="color: #ff6b6b; margin-top: 20px;">
          ⚠ 初始化失敗 / Initialization Failed
        </p>
        <p style="font-size: 12px; color: rgba(255,255,255,0.4); margin-top: 8px;">
          ${error.message || 'Unknown error'}
        </p>
        <p style="font-size: 11px; color: rgba(255,255,255,0.25); margin-top: 20px;">
          請檢查主控台 (/Console) 以了解詳細錯誤訊息<br/>
          Check the console for detailed error information
        </p>
      `;
    }
  });

  // 將引擎實例掛載到全域，方便除錯
  // Expose engine instance globally for debugging
  window.__cosmicGenesis = engine;
}
