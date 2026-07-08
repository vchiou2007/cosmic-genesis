/**
 * ============================================================================
 * Cosmic Genesis — 電影級自動巡航相機控制器
 * Cinematic Auto-Cruise Camera Controller
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 模仿 BBC/NASA 紀錄片的攝影機運動，自動環繞、縮放與追蹤不同天體。
 * 使用平滑插值 (lerp/slerp) 實現無縫轉場，營造如太空望遠鏡般的觀賞體驗。
 *
 * 三種行為模式 (Three Behavior Modes):
 * 1. ORBIT — 環繞目標旋轉
 * 2. FLYBY — 飛越目標
 * 3. ZOOM — 推進/拉遠特寫
 */

import * as THREE from 'three';
import { CONFIG } from './config.js';

// 相機行為模式 (Camera behavior modes)
const Mode = Object.freeze({
  ORBIT: 'orbit',
  FLYBY: 'flyby',
  ZOOM: 'zoom',
  WIDE: 'wide',
});

/**
 * 相機控制器類別 (Camera Controller Class)
 */
export class CameraController {
  /**
   * @param {THREE.PerspectiveCamera} camera
   */
  constructor(camera) {
    this.camera = camera;
    this.targets = [];          // 可追蹤的目標清單
    this.currentTarget = null;  // 目前目標
    this.nextTarget = null;     // 下個目標

    // === 位置與朝向 (Position & LookAt) ===
    this._position = new THREE.Vector3(...CONFIG.camera.defaultPos);
    this._lookAt = new THREE.Vector3(0, 0, 0);

    // === 插值器 (Interpolators for smooth transitions) ===
    this._posTarget = this._position.clone();
    this._lookTarget = this._lookAt.clone();
    this._posVelocity = new THREE.Vector3();
    this._lookVelocity = new THREE.Vector3();

    // === 環繞參數 (Orbit parameters) ===
    this._orbitAngle = 0;
    this._orbitRadius = CONFIG.camera.orbitRadius;
    this._orbitHeight = 30;
    this._orbitSpeed = CONFIG.camera.cruiseSpeed;

    // === 狀態 (State) ===
    this.mode = Mode.ORBIT;
    this._modeTimer = 0;
    this._targetChangeTimer = 0;
    this._transitionDuration = CONFIG.camera.transitionDuration;
    this._isTransitioning = false;
    this._transitionProgress = 0;

    // === 震動/晃動 (Cinematic shake for supernovae) ===
    this._shakeAmount = 0;
    this._shakeDecay = 0.95;

    // === 一開始放在預設位置 ===
    this.camera.position.copy(this._position);
    this.camera.lookAt(this._lookAt);

    console.log('[CameraController] 初始化完成 / Initialized');
  }

  /**
   * 加入可追蹤目標
   * Add a trackable target
   * @param {THREE.Object3D} obj
   * @param {string} label
   * @param {number} [orbitRadius]
   */
  addTarget(obj, label = 'Unknown', orbitRadius) {
    this.targets.push({
      object: obj,
      label,
      orbitRadius: orbitRadius || CONFIG.camera.orbitRadius,
      active: true,
    });
    if (this.targets.length === 1) {
      this.setTarget(this.targets[0]);
    }
  }

  /**
   * 移除目標 (Remove a target)
   * @param {THREE.Object3D} obj
   */
  removeTarget(obj) {
    this.targets = this.targets.filter(t => t.object !== obj);
  }

  /**
   * 設定目前目標 (Set current target)
   * @param {object} target
   */
  setTarget(target) {
    if (this.currentTarget === target) return;
    this.currentTarget = target;
    this._isTransitioning = true;
    this._transitionProgress = 0;

    // 根據目標設定環繞參數
    this._orbitRadius = target.orbitRadius || CONFIG.camera.orbitRadius;
    this._orbitHeight = CONFIG.camera.orbitHeightRange[0] +
      Math.random() * (CONFIG.camera.orbitHeightRange[1] - CONFIG.camera.orbitHeightRange[0]);

    // 隨機選擇模式
    const modes = [Mode.ORBIT, Mode.ORBIT, Mode.FLYBY, Mode.WIDE];
    this.mode = modes[Math.floor(Math.random() * modes.length)];

    if (this.mode === Mode.FLYBY) {
      this._orbitAngle = Math.random() * Math.PI * 2;
    }

    // 更新 HUD 目標提示
    this._updateTargetLabel(target.label);
  }

  /**
   * 隨機切換到下個目標
   * Switch to a random next target
   */
  switchToRandomTarget() {
    const active = this.targets.filter(t => t !== this.currentTarget && t.active);
    if (active.length === 0) return;
    const next = active[Math.floor(Math.random() * active.length)];
    this.setTarget(next);
  }

  /**
   * 觸發震動 (Trigger shake effect)
   * @param {number} amount
   */
  shake(amount = 1.0) {
    this._shakeAmount = Math.max(this._shakeAmount, amount);
  }

  /** @private 更新 HUD 目標標籤 */
  _updateTargetLabel(label) {
    const el = document.getElementById('hud-target');
    if (el) {
      el.textContent = `◆ ${label}`;
      el.classList.add('visible');
      clearTimeout(el._hideTimer);
      el._hideTimer = setTimeout(() => el.classList.remove('visible'), 4000);
    }
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta - 時間差（秒）
   */
  update(delta) {
    if (!this.currentTarget) {
      // 無目標時預設空拍 (Default wide shot)
      this._orbitAngle += delta * 0.05;
      this._posTarget.set(
        Math.sin(this._orbitAngle) * 100,
        40,
        Math.cos(this._orbitAngle) * 100
      );
      this._lookTarget.set(0, 0, 0);
    } else {
      const targetPos = new THREE.Vector3();
      this.currentTarget.object.getWorldPosition(targetPos);

      // === 轉場處理 (Transition handling) ===
      if (this._isTransitioning) {
        this._transitionProgress += delta / this._transitionDuration;
        if (this._transitionProgress >= 1) {
          this._transitionProgress = 1;
          this._isTransitioning = false;
        }
      }

      // === 根據模式計算相機位置 ===
      let targetCamPos = new THREE.Vector3();

      switch (this.mode) {
        case Mode.ORBIT: {
          // 環繞軌道 (Orbital path)
          this._orbitAngle += delta * this._orbitSpeed;
          const heightOffset = Math.sin(this._orbitAngle * 0.5) * 15;
          targetCamPos.set(
            targetPos.x + Math.sin(this._orbitAngle) * this._orbitRadius,
            targetPos.y + this._orbitHeight + heightOffset,
            targetPos.z + Math.cos(this._orbitAngle) * this._orbitRadius
          );
          break;
        }
        case Mode.FLYBY: {
          // 飛越 (Flyby)
          this._orbitAngle += delta * this._orbitSpeed * 0.8;
          const flyRadius = this._orbitRadius * 0.6;
          const flyHeight = Math.sin(this._orbitAngle * 2) * 10 + 20;
          targetCamPos.set(
            targetPos.x + Math.sin(this._orbitAngle) * flyRadius,
            targetPos.y + flyHeight,
            targetPos.z + Math.cos(this._orbitAngle) * flyRadius
          );
          break;
        }
        case Mode.ZOOM: {
          // 特寫推進 (Close-up approach)
          const zoomProgress = Math.sin(this._modeTimer * 0.3) * 0.5 + 0.5;
          const zoomRadius = 10 + zoomProgress * 20;
          targetCamPos.set(
            targetPos.x + Math.sin(this._orbitAngle) * zoomRadius,
            targetPos.y + 5,
            targetPos.z + Math.cos(this._orbitAngle) * zoomRadius
          );
          this._orbitAngle += delta * 0.02;
          break;
        }
        case Mode.WIDE: {
          // 廣角全景 (Wide panorama)
          this._orbitAngle += delta * this._orbitSpeed * 0.3;
          targetCamPos.set(
            targetPos.x + Math.sin(this._orbitAngle) * this._orbitRadius * 1.6,
            targetPos.y + this._orbitHeight * 1.5,
            targetPos.z + Math.cos(this._orbitAngle) * this._orbitRadius * 1.6
          );
          break;
        }
      }

      // === 平滑追蹤 (Smooth tracking) ===
      if (this._isTransitioning) {
        // 轉場期間加速 (Faster movement during transition)
        const ease = this._easeInOutCubic(this._transitionProgress);
        this._posTarget.lerp(targetCamPos, ease * 0.1);
        this._lookTarget.lerp(targetPos, ease * 0.08);
      } else {
        // 正常平滑跟隨 (Normal smooth follow)
        this._posTarget.lerp(targetCamPos, delta * 0.8);
        this._lookTarget.lerp(targetPos, delta * 0.6);
      }

      // 模式計時器 (Mode timer)
      this._modeTimer += delta;
    }

    // === 應用位置 (Apply position with smooth spring) ===
    this._position.lerp(this._posTarget, delta * 2.0);
    this._lookAt.lerp(this._lookTarget, delta * 1.5);

    // === 震動效果 (Shake effect) ===
    if (this._shakeAmount > 0.01) {
      const shakeVec = new THREE.Vector3(
        (Math.random() - 0.5) * this._shakeAmount,
        (Math.random() - 0.5) * this._shakeAmount,
        (Math.random() - 0.5) * this._shakeAmount
      );
      this.camera.position.copy(this._position).add(shakeVec);
      this._shakeAmount *= this._shakeDecay;
    } else {
      this._shakeAmount = 0;
      this.camera.position.copy(this._position);
    }

    this.camera.lookAt(this._lookAt);

    // === 定時切換目標 (Periodic target switching) ===
    this._targetChangeTimer += delta;
    if (this._targetChangeTimer >= CONFIG.camera.targetChangeInterval) {
      this._targetChangeTimer = 0;
      this.switchToRandomTarget();
    }
  }

  /** @private 三次緩入緩出 (Cubic ease in-out) */
  _easeInOutCubic(t) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  /**
   * 重設相機 (Reset camera)
   */
  reset() {
    this._position.set(...CONFIG.camera.defaultPos);
    this._posTarget.copy(this._position);
    this._lookAt.set(0, 0, 0);
    this._lookTarget.set(0, 0, 0);
    this.camera.position.copy(this._position);
    this.camera.lookAt(this._lookAt);
    this._orbitAngle = 0;
    this._targetChangeTimer = 0;
    this.currentTarget = null;

    if (this.targets.length > 0) {
      this.setTarget(this.targets[0]);
    }
  }
}
