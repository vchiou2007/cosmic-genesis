/**
 * ============================================================================
 * Cosmic Genesis — 主引擎 (Main Engine)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 引擎是所有系統的核心協調者，負責初始化 Three.js 渲染器、場景、相機，
 * 建立所有宇宙模組、管理動畫迴圈，並處理視窗大小變化。
 * 遵循「單一職責」原則，將渲染、物理、事件、UI 分別委託給對應模組。
 *
 * 初始化流程 (Initialization Flow):
 * 1. 建立 Renderer（含 HDR 與 Tone Mapping）
 * 2. 建立 Scene（含背景與霧）
 * 3. 建立 Camera
 * 4. 建立後處理管線
 * 5. 建立宇宙系統（星雲、星系、恆星、黑洞等）
 * 6. 建立相機控制器
 * 7. 建立事件排程器
 * 8. 建立 HUD
 * 9. 啟動動畫迴圈
 */

import * as THREE from 'three';
import { CONFIG, getQualityConfig, activeQuality } from '../config.js';

// Cosmos modules
import { Nebula } from '../cosmos/Nebula.js';
import { Galaxy } from '../cosmos/Galaxy.js';
import { StarCore } from '../cosmos/StarCore.js';
import { BlackHole } from '../cosmos/BlackHole.js';
import { SupernovaSystem } from '../cosmos/SupernovaSystem.js';
import { BinaryStar } from '../cosmos/BinaryStar.js';
import { GalaxyCollision } from '../cosmos/GalaxyCollision.js';
import { EventScheduler } from '../cosmos/EventScheduler.js';

// Core systems
import { CameraController } from '../CameraController.js';
import { PostProcessingManager } from '../effects/PostProcessing.js';
import { HUD } from '../ui/HUD.js';

/**
 * 主引擎類別 (Main Engine Class)
 */
export class Engine {
  constructor() {
    this.container = document.getElementById('canvas-container');
    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.clock = new THREE.Clock();

    // === 系統引用 (System references) ===
    this.postProcessing = null;
    this.cameraController = null;
    this.hud = null;
    this.nebula = null;
    this.galaxies = [];
    this.starCore = null;
    this.blackHole = null;
    this.supernovaSystem = null;
    this.binaryStar = null;
    this.galaxyCollision = null;
    this.eventScheduler = null;

    // === 狀態 (State) ===
    this._paused = false;
    this._time = 0;

    // === 統計 (Stats) ===
    this.stats = {
      particles: 0,
      stars: 0,
      galaxies: 0,
      blackHoles: 0,
      events: 0,
    };

    console.log('[Engine] 引擎啟動中 / Starting...');
  }

  /**
   * 初始化所有系統 (Initialize all systems)
   */
  async init() {
    const hud = new HUD();
    this.hud = hud;
    hud.setLoadingProgress(0.1);

    // === (1) 建立 Scene ===
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x000005);
    // 深空星光霧效 (Deep space fog)
    this.scene.fog = new THREE.FogExp2(0x000005, 0.0003);

    hud.setLoadingProgress(0.15);

    // === (2) 建立 Camera ===
    this.camera = new THREE.PerspectiveCamera(
      CONFIG.camera.fov,
      window.innerWidth / window.innerHeight,
      CONFIG.camera.near,
      CONFIG.camera.far
    );

    hud.setLoadingProgress(0.2);

    // === (3) 建立 Renderer ===
    const quality = getQualityConfig();
    this.renderer = new THREE.WebGLRenderer({
      antialias: quality.aa,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(window.devicePixelRatio * quality.scale);
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.container.appendChild(this.renderer.domElement);

    hud.setLoadingProgress(0.3);

    // === (4) 建立後處理 ===
    this.postProcessing = new PostProcessingManager(this.renderer, this.scene, this.camera);

    hud.setLoadingProgress(0.35);

    // === (5) 建立相機控制器 ===
    this.cameraController = new CameraController(this.camera);

    hud.setLoadingProgress(0.4);

    // === (6) 建立宇宙系統 (Cosmos systems) ===
    this.nebula = new Nebula(this.scene);
    hud.setLoadingProgress(0.45);

    // 星系 (Galaxies)
    for (let i = 0; i < CONFIG.galaxy.count; i++) {
      this.galaxies.push(new Galaxy(this.scene, i));
    }
    hud.setLoadingProgress(0.55);

    this.starCore = new StarCore(this.scene);
    hud.setLoadingProgress(0.6);

    this.blackHole = new BlackHole(this.scene);
    hud.setLoadingProgress(0.65);

    this.binaryStar = new BinaryStar(this.scene);
    hud.setLoadingProgress(0.7);

    this.supernovaSystem = new SupernovaSystem(this.scene);
    hud.setLoadingProgress(0.75);

    this.galaxyCollision = new GalaxyCollision(this.scene);
    hud.setLoadingProgress(0.8);

    // === (7) 註冊相機目標 (Register camera targets) ===
    this._registerCameraTargets();

    // === (8) 建立事件排程器 ===
    this.eventScheduler = new EventScheduler(
      {
        starCore: this.starCore,
        galaxies: this.galaxies,
        binaryStar: this.binaryStar,
      },
      (pos, time) => {
        // 超新星回呼 (Supernova callback)
        this.supernovaSystem.trigger(pos, time);
        this.cameraController.shake(0.5);
        this.hud.showNotification('💥 超新星爆炸 / Supernova!');
      },
      (pos, time) => {
        // 碰撞回呼 (Collision callback)
        this.galaxyCollision.trigger(pos, time);
        this.cameraController.shake(1.0);
        this.hud.showNotification('🌀 星系碰撞 / Galaxy Collision!');
      },
      () => {
        // 相機切換回呼 (Camera switch callback)
        this.cameraController.switchToRandomTarget();
      }
    );

    hud.setLoadingProgress(0.85);

    // === (9) 設定 HUD 回呼 (Setup HUD callbacks) ===
    hud.onPause = (paused) => {
      this._paused = paused;
      if (paused) {
        this.clock.stop();
        this.hud.showNotification('⏸ 已暫停 / Paused');
      } else {
        this.clock.start();
        this.hud.showNotification('▶ 繼續 / Resumed');
      }
    };

    hud.onScreenshot = () => {
      this._takeScreenshot();
    };

    hud.onReset = () => {
      this._resetSimulation();
    };

    hud.onQualityChange = (level) => {
      this._updateRenderingQuality(level);
      this.hud.showNotification(`📺 畫質: ${level.toUpperCase()}`);
    };

    hud.onFullscreen = () => {
      // 全螢幕事件已由 DOM 處理
    };

    hud.setLoadingProgress(0.9);

    // === (10) 視窗大小變化 ===
    window.addEventListener('resize', () => this._onResize());

    // === (11) 統計資訊 ===
    this._updateStats();

    hud.setLoadingProgress(1.0);
    setTimeout(() => hud.hideLoading(), 500);

    // === (12) 啟動動畫 ===
    this.clock.start();
    this._animate();

    console.log('[Engine] 引擎初始化完成 / Ready!');
  }

  /** @private 註冊相機追蹤目標 */
  _registerCameraTargets() {
    const cc = this.cameraController;

    // 星系 (Galaxies)
    for (let i = 0; i < this.galaxies.length; i++) {
      cc.addTarget(this.galaxies[i].mesh, `Galaxy ${i + 1}`, 60 + Math.random() * 40);
    }

    // 恆星核心 (Star cores)
    const starPositions = this.starCore.getPositions();
    // 用 empty Object3D 作為相機目標
    for (let i = 0; i < Math.min(starPositions.length, 3); i++) {
      const obj = new THREE.Object3D();
      obj.position.copy(starPositions[i]);
      this.scene.add(obj);
      cc.addTarget(obj, `Star Core ${i + 1}`, 20 + Math.random() * 20);
    }

    // 黑洞 (Black holes)
    const bhPositions = this.blackHole.getPositions();
    for (let i = 0; i < bhPositions.length; i++) {
      const obj = new THREE.Object3D();
      obj.position.copy(bhPositions[i]);
      this.scene.add(obj);
      cc.addTarget(obj, `Black Hole ${i + 1}`, 15 + Math.random() * 10);
    }

    // 預設目標 (Default: look at origin)
    const origin = new THREE.Object3D();
    origin.position.set(0, 0, 0);
    this.scene.add(origin);
    cc.addTarget(origin, 'Deep Field', 120);
  }

  /** @private 更新統計 */
  _updateStats() {
    this.stats.particles = CONFIG.nebula.particleCount +
      CONFIG.blackHole.accretionDiskParticles * CONFIG.blackHole.count * 2 +
      CONFIG.blackHole.jetParticles * CONFIG.blackHole.count * 2 +
      CONFIG.supernova.particleCount;
    this.stats.stars = CONFIG.galaxy.starsPerGalaxy * CONFIG.galaxy.count + CONFIG.starCore.count;
    this.stats.galaxies = CONFIG.galaxy.count;
    this.stats.blackHoles = CONFIG.blackHole.count;
  }

  /** @private 動畫迴圈 */
  _animate() {
    requestAnimationFrame(() => this._animate());

    // === 時間計算 (Time calculation) ===
    const delta = Math.min(this.clock.getDelta(), CONFIG.physics.maxDeltaTime);
    if (this._paused) return;

    this._time += delta;

    // === 更新宇宙系統 (Update cosmos) ===
    this.nebula.update(delta);

    for (const g of this.galaxies) {
      g.update(delta);
    }

    this.starCore.update(delta);

    this.blackHole.update(delta, this._time);

    this.binaryStar.update(this._time);

    this.supernovaSystem.update(this._time);

    this.galaxyCollision.update(delta, this._time);

    this.eventScheduler.update(delta);

    // === 更新相機 (Update camera) ===
    this.cameraController.update(delta);

    // === 後處理渲染 (Post-processing render) ===
    this.postProcessing.render(delta);

    // === 更新 HUD ===
    this.hud.updateStats({
      delta,
      simulationTime: this._time,
      particles: this.stats.particles,
      stars: this.stats.stars,
      galaxies: this.stats.galaxies,
      blackHoles: this.stats.blackHoles,
      events: this.supernovaSystem.getActiveCount(),
    });
  }

  /** @private 視窗 resize */
  _onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.postProcessing.resize(w, h);
  }

  /** @private 截圖 */
  _takeScreenshot() {
    // 暫時以原始解析度渲染 (Render at native resolution)
    const originalSize = new THREE.Vector2();
    this.renderer.getSize(originalSize);
    const originalPixelRatio = this.renderer.getPixelRatio();

    // 高解析度截圖 (High-res screenshot)
    this.renderer.setPixelRatio(2);
    this.postProcessing.resize(window.innerWidth * 2, window.innerHeight * 2);
    this.postProcessing.render(0);

    const link = document.createElement('a');
    link.download = `cosmic-genesis-${Date.now()}.png`;
    link.href = this.renderer.domElement.toDataURL('image/png');
    link.click();

    // 恢復 (Restore)
    this.renderer.setPixelRatio(originalPixelRatio);
    this.postProcessing.resize(window.innerWidth, window.innerHeight);

    this.hud.showNotification('📸 截圖已儲存 / Screenshot saved');
  }

  /** @private 更新渲染品質 */
  _updateRenderingQuality(level) {
    const quality = CONFIG.quality[level];
    this.renderer.setPixelRatio(window.devicePixelRatio * quality.scale);
    this.renderer.setAntialias(quality.aa);
    this.postProcessing.updateQuality();
  }

  /** @private 重置模擬 */
  _resetSimulation() {
    this._paused = false;
    this._time = 0;
    this.clock.stop();
    this.clock.start();

    // 重置相機
    this.cameraController.reset();

    // 重設事件排程
    this.eventScheduler.reset();

    this.hud.showNotification('⟳ 模擬重置 / Simulation reset');
  }

  /**
   * 釋放所有資源 (Dispose all resources)
   */
  dispose() {
    this.nebula?.dispose();
    this.galaxies.forEach(g => g.dispose());
    this.starCore?.dispose();
    this.blackHole?.dispose();
    this.supernovaSystem?.dispose();
    this.binaryStar?.dispose();
    this.galaxyCollision?.dispose();
    this.eventScheduler?.dispose();
    this.cameraController = null;
    this.postProcessing?.dispose();
    this.hud?.dispose();
    this.renderer.dispose();
  }
}
