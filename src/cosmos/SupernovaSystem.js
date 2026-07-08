/**
 * ============================================================================
 * Cosmic Genesis — 超新星爆炸系統 (Supernova Explosion System)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 超新星是宇宙中最劇烈的爆炸事件。此模組模擬恆星爆炸時向外擴散的
 * 粒子殼層，顏色從白熱→橙→紅→紫逐步變化，代表不同階段的冷卻過程。
 * 初始閃光極亮，隨後逐漸暗淡，呈現真實超新星的光變曲線。
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { supernovaVert, supernovaFrag } from '../shaders.js';

/**
 * 超新星事件類別 (Supernova Event Class)
 * 每個實例代表一次爆炸事件
 */
class SupernovaEvent {
  /**
   * @param {THREE.Scene} scene
   * @param {THREE.Vector3} position
   * @param {number} startTime
   */
  constructor(scene, position, startTime) {
    this.scene = scene;
    this.startTime = startTime;
    this.lifetime = CONFIG.supernova.lifetime;
    this.alive = true;

    const count = CONFIG.supernova.particleCount;
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const alphas = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = position.x + (Math.random() - 0.5) * 2;
      positions[i * 3 + 1] = position.y + (Math.random() - 0.5) * 2;
      positions[i * 3 + 2] = position.z + (Math.random() - 0.5) * 2;
      seeds[i] = Math.random();
      alphas[i] = 0.3 + Math.random() * 0.7;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
    geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uExplosionTime: { value: startTime },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    const mat = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: supernovaVert,
      fragmentShader: supernovaFrag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geo, mat);
    this.points.position.copy(position);
    this.points.name = 'Supernova';
    this.scene.add(this.points);
  }

  /**
   * 更新 (Update)
   * @param {number} time
   * @returns {boolean} 是否存活
   */
  update(time) {
    this.uniforms.uTime.value = time;
    const age = time - this.startTime;
    if (age > this.lifetime) {
      this.alive = false;
      this.scene.remove(this.points);
      this.points.geometry.dispose();
      this.points.material.dispose();
    }
    return this.alive;
  }
}

/**
 * 超新星系統管理類別 (Supernova System Manager)
 * 管理多個超新星事件的生成與生命週期
 */
export class SupernovaSystem {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.events = [];
  }

  /**
   * 在指定位置觸發超新星 (Trigger supernova at position)
   * @param {THREE.Vector3} position
   * @param {number} time
   */
  trigger(position, time) {
    // 檢查是否達到最大並發數 (Check max concurrent)
    this._cleanup(time);
    if (this.events.length >= CONFIG.supernova.maxConcurrent) {
      // 移除最老的 (Remove oldest)
      const oldest = this.events.shift();
      oldest.alive = false;
      this.scene.remove(oldest.points);
      oldest.points.geometry.dispose();
      oldest.points.material.dispose();
    }

    const event = new SupernovaEvent(this.scene, position, time);
    this.events.push(event);
    console.log(`[Supernova] 爆炸觸發! / Explosion triggered at`, position);
    return event;
  }

  /** @private 清理已結束事件 */
  _cleanup(time) {
    this.events = this.events.filter(e => e.update(time));
  }

  /**
   * 每幀更新 (Update all events)
   * @param {number} time
   */
  update(time) {
    this._cleanup(time);
  }

  /**
   * 取得活躍事件數 (Get active event count)
   * @returns {number}
   */
  getActiveCount() {
    return this.events.length;
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    for (const e of this.events) {
      this.scene.remove(e.points);
      e.points.geometry.dispose();
      e.points.material.dispose();
    }
    this.events = [];
  }
}
