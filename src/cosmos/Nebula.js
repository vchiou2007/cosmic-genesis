/**
 * ============================================================================
 * Cosmic Genesis — 粒子星雲系統 (Nebula / Particle Universe)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 數萬個半透明粒子構成廣闊的星雲背景，每個粒子具有隨機顏色、大小與透明度。
 * 粒子緩慢漂移，形成如 Hubble/Webb 望遠鏡拍攝的星雲動態效果。
 * 採用 ShaderMaterial 以 GPU 加速渲染，減少 CPU 負擔。
 *
 * 技術亮點 (Technical Highlights):
 * - BufferGeometry + ShaderMaterial (GPU 加速)
 * - 程序生成顏色與位置（每次不同）
 * - 慢速浮游動畫
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';
import { nebulaParticleVert, nebulaParticleFrag } from '../shaders.js';

/**
 * 粒子星雲類別 (Nebula Class)
 */
export class Nebula {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.points = null;
    this.uniforms = null;

    this._create();
    console.log('[Nebula] 星雲粒子系統建立完成 / Created with', CONFIG.nebula.particleCount, 'particles');
  }

  /** @private 建立星雲粒子系統 */
  _create() {
    const count = CONFIG.nebula.particleCount;
    const spread = CONFIG.nebula.spread;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const alphas = new Float32Array(count);
    const phases = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // === 位置：球殼狀分佈 (Spherical distribution with density variation) ===
      const radius = 50 + Math.random() * spread;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.cos(phi) * (0.3 + Math.random() * 0.7);
      positions[i * 3 + 2] = radius * Math.sin(phi) * Math.sin(theta);

      // === 顏色：從色相環選取 (Color from hue palette) ===
      const hue = CONFIG.nebula.colorHues[Math.floor(Math.random() * CONFIG.nebula.colorHues.length)];
      const sat = 0.3 + Math.random() * 0.5;
      const lum = 0.4 + Math.random() * 0.4;
      const color = new THREE.Color().setHSL(hue + (Math.random() - 0.5) * 0.1, sat, lum);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      // === 大小與透明度 (Size & Alpha) ===
      const [aMin, aMax] = CONFIG.nebula.opacityRange;
      const [sMin, sMax] = CONFIG.nebula.sizeRange;
      sizes[i] = sMin + Math.random() * (sMax - sMin);
      alphas[i] = aMin + Math.random() * (aMax - aMin);

      // === 隨機相位 (Random phase for floating animation) ===
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('aColor', new THREE.BufferAttribute(colors, 3));
    geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
    geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));

    this.uniforms = {
      uTime: { value: 0 },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
    };

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: nebulaParticleVert,
      fragmentShader: nebulaParticleFrag,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });

    this.points = new THREE.Points(geometry, material);
    this.points.name = 'Nebula';
    this.scene.add(this.points);
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta
   */
  update(delta) {
    if (this.uniforms) {
      this.uniforms.uTime.value += delta;
      this.points.rotation.y += CONFIG.nebula.rotationSpeed;
    }
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    this.scene.remove(this.points);
    this.points.geometry.dispose();
    this.points.material.dispose();
  }
}
