/**
 * ============================================================================
 * Cosmic Genesis — 抬頭顯示器 (Head-Up Display)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 簡潔透明的資訊 overlay，採用玻璃擬態 (Glassmorphism) 設計風格，
 * 以最小視覺干擾呈現必要資訊。左上為模擬數據，右下為控制項。
 * 所有 DOM 操作集中在此模組管理，不污染其他模組。
 */

import { CONFIG, setQuality, getQualityConfig } from '../config.js';

/**
 * HUD 管理類別 (HUD Manager)
 */
export class HUD {
  constructor() {
    // === DOM 元素快取 (DOM element cache) ===
    this.elements = {
      fps: document.getElementById('hud-fps'),
      time: document.getElementById('hud-time'),
      particles: document.getElementById('hud-particles'),
      stars: document.getElementById('hud-stars'),
      galaxies: document.getElementById('hud-galaxies'),
      bh: document.getElementById('hud-bh'),
      events: document.getElementById('hud-events'),
      target: document.getElementById('hud-target'),
      loading: document.getElementById('loading'),
      loadingBar: document.getElementById('loading-bar'),
    };

    // === FPS 計算 (FPS calculation) ===
    this._frameCount = 0;
    this._fpsTimer = 0;
    this._currentFPS = 0;

    // === 控制按鈕 (Control buttons) ===
    this._setupControls();

    // === 狀態 (State) ===
    this.paused = false;

    // === 回呼 (Callbacks) ===
    this.onPause = null;
    this.onFullscreen = null;
    this.onScreenshot = null;
    this.onReset = null;
    this.onQualityChange = null;

    console.log('[HUD] 顯示系統初始化完成 / Initialized');
  }

  /** @private 設定控制按鈕事件 */
  _setupControls() {
    // 暫停按鈕
    const btnPause = document.getElementById('btn-pause');
    btnPause.addEventListener('click', () => {
      this.paused = !this.paused;
      btnPause.textContent = this.paused ? '▶ Play' : '⏸ Pause';
      btnPause.classList.toggle('active', this.paused);
      if (this.onPause) this.onPause(this.paused);
    });

    // 全螢幕按鈕
    document.getElementById('btn-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else {
        document.exitFullscreen().catch(() => {});
      }
      if (this.onFullscreen) this.onFullscreen();
    });

    // 截圖按鈕
    document.getElementById('btn-screenshot').addEventListener('click', () => {
      if (this.onScreenshot) this.onScreenshot();
    });

    // 重置按鈕
    document.getElementById('btn-reset').addEventListener('click', () => {
      if (this.onReset) this.onReset();
    });

    // 畫質切換
    document.querySelectorAll('#hud-quality button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('#hud-quality button').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const quality = btn.dataset.quality;
        setQuality(quality);
        if (this.onQualityChange) this.onQualityChange(quality);
      });
    });
  }

  /**
   * 載入進度更新 (Update loading progress)
   * @param {number} progress - 0~1
   */
  setLoadingProgress(progress) {
    if (this.elements.loadingBar) {
      this.elements.loadingBar.style.width = `${progress * 100}%`;
    }
  }

  /**
   * 隱藏載入畫面 (Hide loading screen)
   */
  hideLoading() {
    if (this.elements.loading) {
      this.elements.loading.classList.add('hidden');
      setTimeout(() => {
        this.elements.loading.style.display = 'none';
      }, 1200);
    }
  }

  /**
   * 更新模擬數據 (Update simulation stats)
   * @param {object} stats
   */
  updateStats(stats) {
    const el = this.elements;

    // FPS
    this._frameCount++;
    this._fpsTimer += stats.delta;
    if (this._fpsTimer >= 0.5) {
      this._currentFPS = Math.round(this._frameCount / this._fpsTimer);
      this._frameCount = 0;
      this._fpsTimer = 0;
    }
    if (el.fps) el.fps.textContent = this._currentFPS;

    // 其他數據
    if (el.time) {
      const years = (stats.simulationTime * 10).toFixed(1);
      el.time.textContent = `${years} Myr`;
    }
    if (el.particles) el.particles.textContent = (stats.particles || 0).toLocaleString();
    if (el.stars) el.stars.textContent = (stats.stars || 0).toLocaleString();
    if (el.galaxies) el.galaxies.textContent = stats.galaxies || 0;
    if (el.bh) el.bh.textContent = stats.blackHoles || 0;
    if (el.events) el.events.textContent = stats.events || 0;
  }

  /**
   * 顯示提示訊息 (Show notification)
   * @param {string} message
   */
  showNotification(message) {
    const el = this.elements.target;
    if (el) {
      el.textContent = `✦ ${message}`;
      el.classList.add('visible');
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(() => el.classList.remove('visible'), 3000);
    }
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    // DOM cleanup not needed for HUD
  }
}
