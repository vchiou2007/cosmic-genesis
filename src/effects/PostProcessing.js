/**
 * ============================================================================
 * Cosmic Genesis — 後處理特效管線
 * Post-Processing Effects Pipeline
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 使用 Three.js EffectComposer 建立多階段後處理管線，包含 Bloom（泛光）、
 * 色差 (Chromatic Aberration）、暈影 (Vignette）等特效，營造電影級視覺。
 * 採用 ACES Filmic Tone Mapping 獲得寬動態範圍的電影感畫面。
 */

import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { CONFIG, getQualityConfig } from '../config.js';
import {
  chromaticAberrationVert,
  chromaticAberrationFrag,
  vignetteFrag,
} from '../shaders.js';

/**
 * 後處理管理類別 (Post-Processing Manager)
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
    this.composer = null;
    this.bloomPass = null;
    this.chromaticAberrationPass = null;
    this.vignettePass = null;

    this._init();
    console.log('[PostProcessing] 特效管線初始化完成 / Pipeline initialized');
  }

  /** @private 初始化 composer 與各特效 */
  _init() {
    const quality = getQualityConfig();

    // === EffectComposer ===
    this.composer = new EffectComposer(this.renderer);

    // === RenderPass（基礎渲染）===
    const renderPass = new RenderPass(this.scene, this.camera);
    this.composer.addPass(renderPass);

    // === Bloom（泛光效果）===
    if (quality.bloom > 0.01) {
      this.bloomPass = new UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        CONFIG.effects.bloomStrength * quality.bloom,
        CONFIG.effects.bloomRadius,
        CONFIG.effects.bloomThreshold
      );
      this.composer.addPass(this.bloomPass);
    }

    // === Chromatic Aberration（色差）===
    if (CONFIG.effects.chromaticAberration > 0) {
      this.chromaticAberrationPass = new ShaderPass({
        vertexShader: chromaticAberrationVert,
        fragmentShader: chromaticAberrationFrag,
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
          uStrength: { value: CONFIG.effects.chromaticAberration },
        },
      });
      this.composer.addPass(this.chromaticAberrationPass);
    }

    // === Vignette（暈影）===
    if (CONFIG.effects.vignetteStrength > 0) {
      this.vignettePass = new ShaderPass({
        vertexShader: chromaticAberrationVert,
        fragmentShader: vignetteFrag,
        uniforms: {
          tDiffuse: { value: null },
          uStrength: { value: CONFIG.effects.vignetteStrength },
        },
      });
      this.composer.addPass(this.vignettePass);
    }

    // === OutputPass（色彩空間輸出）===
    const outputPass = new OutputPass();
    this.composer.addPass(outputPass);
  }

  /**
   * 重新設定大小 (Resize)
   * @param {number} w
   * @param {number} h
   */
  resize(w, h) {
    this.composer.setSize(w, h);
    if (this.bloomPass) {
      this.bloomPass.resolution.set(w, h);
    }
    if (this.chromaticAberrationPass) {
      this.chromaticAberrationPass.uniforms.uResolution.value.set(w, h);
    }
  }

  /**
   * 渲染一幀 (Render one frame)
   * @param {number} delta
   */
  render(delta) {
    this.composer.render(delta);
  }

  /**
   * 更新畫質設定 (Update quality settings)
   */
  updateQuality() {
    const quality = getQualityConfig();
    if (this.bloomPass) {
      this.bloomPass.strength = CONFIG.effects.bloomStrength * quality.bloom;
    }
  }

  /**
   * 釋放資源 (Dispose resources)
   */
  dispose() {
    this.composer.dispose();
  }
}
