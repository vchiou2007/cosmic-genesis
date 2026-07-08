/**
 * ============================================================================
 * Cosmic Genesis — 恆星核心系統 (Star Core System)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 模擬大質量恆星，使用 ShaderMaterial 實現柔和光暈與脈動效果。
 * 顏色根據黑體輻射色溫變化，從藍白到紅橙。
 * 每顆恆星具有隨機大小、亮度與脈動頻率。
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { starGlowVert, starGlowFrag } from '../shaders.js';

/**
 * 恆星核心類別 (Star Core Class)
 */
export class StarCore {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [count]
   */
  constructor(scene, count = CONFIG.starCore.count) {
    this.scene = scene;
    this.stars = [];
    this._create(count);
    console.log('[StarCore] 恆星系統建立完成 / Created', count, 'stars');
  }

  /** @private 色溫轉 RGB (Blackbody color temperature to RGB) */
  _temperatureToRGB(tempK) {
    let r, g, b;
    // 簡化版黑體輻射顏色 (Simplified blackbody radiation)
    if (tempK <= 6500) {
      r = 1.0;
      g = 0.4 + 0.5 * (tempK - 3500) / 3000;
      b = 0.2 + 0.3 * (tempK - 3500) / 3000;
    } else {
      r = 0.9 - 0.3 * (tempK - 6500) / 23500;
      g = 0.9 - 0.4 * (tempK - 6500) / 23500;
      b = 0.8 + 0.2 * (tempK - 6500) / 23500;
    }
    return new THREE.Color(
      Math.max(0.3, Math.min(1, r)),
      Math.max(0.2, Math.min(1, g)),
      Math.max(0.2, Math.min(1, b))
    );
  }

  /** @private 建立恆星系統 */
  _create(count) {
    const [minSize, maxSize] = CONFIG.starCore.sizeRange;

    // 背景光暈用大 Sprite (Background glow sprite)
    for (let i = 0; i < count; i++) {
      const size = minSize + Math.random() * (maxSize - minSize);
      const temp = CONFIG.starCore.colorTempRange[0] +
        Math.random() * (CONFIG.starCore.colorTempRange[1] - CONFIG.starCore.colorTempRange[0]);
      const color = this._temperatureToRGB(temp);
      const pulseSpeed = CONFIG.starCore.pulsationSpeed * (0.5 + Math.random() * 1.0);
      const glowIntensity = CONFIG.starCore.glowIntensity * (0.6 + Math.random() * 0.8);

      // === 主要光暈 (Main glow sprite) ===
      const glowGeo = new THREE.BufferGeometry();
      const verts = new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]);
      glowGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
      glowGeo.setIndex([0, 1, 2, 0, 2, 3]);

      const uniforms = {
        uTime: { value: Math.random() * 100 },
        uColor: { value: color },
        uIntensity: { value: glowIntensity },
        uPulseSpeed: { value: pulseSpeed },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
      };

      const glowMat = new THREE.ShaderMaterial({
        uniforms,
        vertexShader: starGlowVert,
        fragmentShader: starGlowFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      });

      // 屬性
      const aSize = new Float32Array([size * 8]);
      const aGlow = new Float32Array([1.0]);
      glowGeo.setAttribute('aSize', new THREE.BufferAttribute(aSize, 1));
      glowGeo.setAttribute('aGlow', new THREE.BufferAttribute(aGlow, 1));

      const glowMesh = new THREE.Mesh(glowGeo, glowMat);

      // === 隨機位置 (Random position in the scene) ===
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 150 - 50
      );
      glowMesh.position.copy(pos);
      glowMesh.lookAt(this.scene.position);
      glowMesh.name = `StarCore_${i}`;

      this.scene.add(glowMesh);

      this.stars.push({
        mesh: glowMesh,
        uniforms,
        position: pos,
        baseSize: size,
        pulseSpeed,
        color,
        glowIntensity,
      });
    }
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta
   */
  update(delta) {
    for (const star of this.stars) {
      star.uniforms.uTime.value += delta;
      // 始終面向相機 (Always face camera - handled in shader via gl_PointSize)
      star.mesh.lookAt(this.scene.position);
    }
  }

  /**
   * 取得所有恆星位置 (Get all star positions)
   * @returns {THREE.Vector3[]}
   */
  getPositions() {
    return this.stars.map(s => s.position);
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    for (const star of this.stars) {
      this.scene.remove(star.mesh);
      star.mesh.geometry.dispose();
      star.mesh.material.dispose();
    }
    this.stars = [];
  }
}
