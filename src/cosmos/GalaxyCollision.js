/**
 * ============================================================================
 * Cosmic Genesis — 星系碰撞系統 (Galaxy Collision System)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 模擬兩個螺旋星系碰撞合併的壯觀過程。碰撞觸發大量潮汐尾跡粒子
 * （Tidal Streams），形成恆星流與物質橋。靈感來自 Hubble 拍攝的
 * 觸鬚星系 (Antennae Galaxies) 與老鼠星系 (Mice Galaxies)。
 *
 * 碰撞流程 (Collision Sequence):
 * 1. 接近：兩個星系沿軌道靠近
 * 2. 接觸：潮汐力拉出恆星流
 * 3. 穿過：互相穿越並放慢
 * 4. 合併：最終結合成橢圓星系（模擬簡化版本）
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

/**
 * 星系碰撞事件類別 (Galaxy Collision Event)
 */
export class GalaxyCollision {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.activeCollisions = [];
    this._tidalParticles = [];
    this.timeSinceLastCollision = 0;

    // === 建立靜態潮汐粒子池 (Tidal particle pool) ===
    this._initParticlePool();
    console.log('[GalaxyCollision] 碰撞系統初始化完成 / Initialized');
  }

  /** @private 初始化潮汐粒子池 */
  _initParticlePool() {
    const count = CONFIG.galaxyCollision.tidalParticles;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 400;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 400;
      const color = new THREE.Color().setHSL(0.6 + Math.random() * 0.2, 0.5, 0.5 + Math.random() * 0.3);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;
      sizes[i] = 0.3 + Math.random() * 0.5;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.PointsMaterial({
      size: 0.5,
      vertexColors: true,
      transparent: true,
      opacity: 0.0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.tidalPoints = new THREE.Points(geo, mat);
    this.tidalPoints.name = 'TidalStreams';
    this.tidalPoints.visible = false;
    this.scene.add(this.tidalPoints);

    // 保存粒子狀態 (Save particle state)
    this._particleStates = [];
    const posAttr = geo.attributes.position;
    for (let i = 0; i < count; i++) {
      this._particleStates.push({
        baseX: posAttr.array[i * 3],
        baseY: posAttr.array[i * 3 + 1],
        baseZ: posAttr.array[i * 3 + 2],
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * 0.3,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.3
        ),
        phase: Math.random() * Math.PI * 2,
      });
    }
  }

  /**
   * 觸發星系碰撞 (Trigger a galaxy collision)
   * @param {THREE.Vector3} position
   * @param {number} time
   */
  trigger(position, time) {
    this.activeCollisions.push({
      position: position.clone(),
      startTime: time,
      progress: 0,
      stage: 0, // 0=approach, 1=contact, 2=merge
      duration: 30,
    });

    // 顯示潮汐粒子 (Show tidal particles)
    this.tidalPoints.visible = true;
    this.tidalPoints.material.opacity = 0.8;
    this.tidalPoints.position.copy(position);

    // 初始化粒子位置 (Initialize particle positions)
    const posAttr = this.tidalPoints.geometry.attributes.position;
    for (let i = 0; i < posAttr.count; i++) {
      const state = this._particleStates[i];
      const angle = Math.random() * Math.PI * 2;
      const radius = 20 + Math.random() * 60;
      posAttr.array[i * 3] = position.x + radius * Math.cos(angle);
      posAttr.array[i * 3 + 1] = position.y + (Math.random() - 0.5) * 20;
      posAttr.array[i * 3 + 2] = position.z + radius * Math.sin(angle);
      state.baseX = posAttr.array[i * 3];
      state.baseY = posAttr.array[i * 3 + 1];
      state.baseZ = posAttr.array[i * 3 + 2];
      state.velocity.set(
        (Math.random() - 0.5) * 0.5,
        (Math.random() - 0.5) * 0.2,
        (Math.random() - 0.5) * 0.5
      );
    }
    posAttr.needsUpdate = true;

    console.log('[GalaxyCollision] 碰撞觸發! / Collision triggered at', position);
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta
   * @param {number} time
   */
  update(delta, time) {
    this.timeSinceLastCollision += delta;

    // === 更新潮汐粒子 (Update tidal particles) ===
    if (this.tidalPoints.visible) {
      const posAttr = this.tidalPoints.geometry.attributes.position;
      let anyAlive = false;

      for (let i = 0; i < posAttr.count; i++) {
        const state = this._particleStates[i];
        // 潮汐尾跡運動 (Tidal stream motion)
        const wave = Math.sin(time * 0.1 + state.phase) * 5;
        posAttr.array[i * 3] += state.velocity.x * delta;
        posAttr.array[i * 3 + 1] += state.velocity.y * delta + wave * delta * 0.1;
        posAttr.array[i * 3 + 2] += state.velocity.z * delta;
        // 微幅衰減 (Slight decay)
        state.velocity.multiplyScalar(0.999);
      }
      posAttr.needsUpdate = true;

      // 淡出 (Fade out over time)
      const age = this._getOldestCollisionAge(time);
      if (age > 15) {
        this.tidalPoints.material.opacity = Math.max(0, this.tidalPoints.material.opacity - delta * 0.02);
        if (this.tidalPoints.material.opacity <= 0) {
          this.tidalPoints.visible = false;
        }
      }
    }

    // === 清理舊碰撞 (Clean up old collisions) ===
    this.activeCollisions = this.activeCollisions.filter(c => {
      c.progress = (time - c.startTime) / c.duration;
      return c.progress < 1.2;
    });
  }

  /** @private 取得最舊碰撞的年齡 */
  _getOldestCollisionAge(time) {
    if (this.activeCollisions.length === 0) return 999;
    return time - this.activeCollisions[0].startTime;
  }

  /**
   * 檢查是否可以觸發新碰撞 (Check if can trigger)
   * @returns {boolean}
   */
  canTrigger() {
    return this.timeSinceLastCollision > CONFIG.galaxyCollision.triggerInterval &&
           this.activeCollisions.length < 2;
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    this.scene.remove(this.tidalPoints);
    this.tidalPoints.geometry.dispose();
    this.tidalPoints.material.dispose();
    this.activeCollisions = [];
  }
}
