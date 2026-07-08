/**
 * ============================================================================
 * Cosmic Genesis — 簡化後處理管線 (Simplified Post-Processing)
 * ============================================================================
 *
 * 先移除所有特效，確保基礎渲染正常。
 * 移除 Bloom、色差、暈影，僅保留直通渲染。
 * Remove all effects, keep only passthrough rendering for debugging.
 */

import * as THREE from 'three';

/**
 * 後處理管理類別 (Post-Processing Manager) — 最小化版本
 */
export class PostProcessingManager {
  /**
   * @param {THREE.WebGLRenderer} renderer
   * @param {THREE.Scene} scene
   * @param {THREE.PerspectiveCamera} camera
   */
  constructor(renderer, scene, camera) {
    this.renderer = renderer;
    this.scene = scene;
    this.camera = camera;
    console.log('[PostProcessing] 簡化模式啟動 / Simplified mode active');
  }

  resize(w, h) {
    // 無特效，不需調整
  }

  render(delta) {
    this.renderer.render(this.scene, this.camera);
  }

  updateQuality() {
    // 無特效
  }

  dispose() {
    // 無需清理
  }
}
