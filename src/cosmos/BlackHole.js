/**
 * ============================================================================
 * Cosmic Genesis — 黑洞系統 (Black Hole System)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 黑洞由三個視覺層次組成：(1) 事件視界球體（自訂著色器渲染邊緣發光），
 * (2) 吸積盤粒子系統（開普勒旋轉、內熱外冷），(3) 相對論性噴流。
 * 整體視覺參考 Interstellar 電影與 NASA 黑洞模擬。
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';
import {
  blackHoleVert,
  blackHoleFrag,
  accretionDiskVert,
  accretionDiskFrag,
  jetVert,
  jetFrag,
} from '../shaders.js';

/**
 * 黑洞類別 (Black Hole Class)
 */
export class BlackHole {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [count]
   */
  constructor(scene, count = CONFIG.blackHole.count) {
    this.scene = scene;
    this.bhs = [];
    this._create(count);
    console.log('[BlackHole] 黑洞系統建立完成 / Created', count, 'black holes');
  }

  /** @private 建立黑洞 */
  _create(count) {
    const [minSize, maxSize] = CONFIG.blackHole.sizeRange;

    for (let i = 0; i < count; i++) {
      const size = minSize + Math.random() * (maxSize - minSize);
      const bhGroup = new THREE.Group();

      // === 位置 (Position) ===
      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 60,
        (Math.random() - 0.5) * 200 - 80
      );
      bhGroup.position.copy(pos);

      // === (1) 事件視界 (Event Horizon) ===
      const horizonGeo = new THREE.SphereGeometry(size * 0.8, 32, 32);
      const horizonMat = new THREE.ShaderMaterial({
        uniforms: {
          uColor: { value: new THREE.Color(0.4, 0.2, 0.8) },
          uTime: { value: Math.random() * 100 },
        },
        vertexShader: blackHoleVert,
        fragmentShader: blackHoleFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.FrontSide,
        depthWrite: false,
      });
      const horizon = new THREE.Mesh(horizonGeo, horizonMat);
      horizon.name = 'EventHorizon';
      bhGroup.add(horizon);

      // === (2) 吸積盤 (Accretion Disk) ===
      const diskParticles = CONFIG.blackHole.accretionDiskParticles;
      const diskPositions = new Float32Array(diskParticles * 3);
      const diskRadii = new Float32Array(diskParticles);
      const diskAngles = new Float32Array(diskParticles);
      const diskHeights = new Float32Array(diskParticles);
      const diskSpeeds = new Float32Array(diskParticles);

      for (let j = 0; j < diskParticles; j++) {
        const radius = 0.5 + Math.random() * CONFIG.blackHole.diskRadius;
        const angle = Math.random() * Math.PI * 2;
        const height = (Math.random() - 0.5) * 0.8 * (radius / CONFIG.blackHole.diskRadius);

        diskPositions[j * 3] = radius * Math.cos(angle);
        diskPositions[j * 3 + 1] = height;
        diskPositions[j * 3 + 2] = radius * Math.sin(angle);

        diskRadii[j] = radius;
        diskAngles[j] = angle;
        diskHeights[j] = height;
        diskSpeeds[j] = 0.5 + Math.random() * 1.0;
      }

      const diskGeo = new THREE.BufferGeometry();
      diskGeo.setAttribute('position', new THREE.BufferAttribute(diskPositions, 3));
      diskGeo.setAttribute('aRadius', new THREE.BufferAttribute(diskRadii, 1));
      diskGeo.setAttribute('aAngle', new THREE.BufferAttribute(diskAngles, 1));
      diskGeo.setAttribute('aHeight', new THREE.BufferAttribute(diskHeights, 1));
      diskGeo.setAttribute('aSpeed', new THREE.BufferAttribute(diskSpeeds, 1));

      const diskUniforms = {
        uTime: { value: Math.random() * 100 },
        uPixelRatio: { value: window.devicePixelRatio },
      };

      const diskMat = new THREE.ShaderMaterial({
        uniforms: diskUniforms,
        vertexShader: accretionDiskVert,
        fragmentShader: accretionDiskFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const disk = new THREE.Points(diskGeo, diskMat);
      disk.name = 'AccretionDisk';
      disk.rotation.x = Math.PI * 0.3; // 傾角 (Tilt for cinematic look)
      bhGroup.add(disk);

      // === (3) 噴流 (Relativistic Jets) ===
      const jetParticles = CONFIG.blackHole.jetParticles;
      const jetPos = new Float32Array(jetParticles * 3);
      const jetOffsets = new Float32Array(jetParticles);
      const jetRadials = new Float32Array(jetParticles);
      const jetAlphas = new Float32Array(jetParticles);
      const jetSpeeds = new Float32Array(jetParticles);

      for (let j = 0; j < jetParticles; j++) {
        jetPos[j * 3] = 0;
        jetPos[j * 3 + 1] = 0;
        jetPos[j * 3 + 2] = 0;
        jetOffsets[j] = Math.random();
        jetRadials[j] = 0.1 + Math.random() * 0.3;
        jetAlphas[j] = 0.3 + Math.random() * 0.7;
        jetSpeeds[j] = 0.05 + Math.random() * 0.15;
      }

      const jetGeo = new THREE.BufferGeometry();
      jetGeo.setAttribute('position', new THREE.BufferAttribute(jetPos, 3));
      jetGeo.setAttribute('aOffset', new THREE.BufferAttribute(jetOffsets, 1));
      jetGeo.setAttribute('aRadial', new THREE.BufferAttribute(jetRadials, 1));
      jetGeo.setAttribute('aAlpha', new THREE.BufferAttribute(jetAlphas, 1));
      jetGeo.setAttribute('aSpeed', new THREE.BufferAttribute(jetSpeeds, 1));

      const jetUniforms = {
        uTime: { value: Math.random() * 100 },
        uPixelRatio: { value: window.devicePixelRatio },
        uColor: { value: new THREE.Color(0.6, 0.8, 1.0) },
      };

      const jetMat = new THREE.ShaderMaterial({
        uniforms: jetUniforms,
        vertexShader: jetVert,
        fragmentShader: jetFrag,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const jetTop = new THREE.Points(jetGeo.clone(), jetMat.clone());
      jetTop.name = 'JetTop';
      jetTop.rotation.x = 0;
      bhGroup.add(jetTop);

      const jetBottom = new THREE.Points(jetGeo.clone(), jetMat.clone());
      jetBottom.name = 'JetBottom';
      jetBottom.rotation.x = Math.PI;
      bhGroup.add(jetBottom);

      bhGroup.name = `BlackHole_${i}`;
      this.scene.add(bhGroup);

      this.bhs.push({
        group: bhGroup,
        position: pos,
        size,
        uniforms: { horizon: horizonMat.uniforms, disk: diskUniforms, jet: jetUniforms },
        disk,
        jetTop,
        jetBottom,
        horizon,
      });
    }
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta
   * @param {number} time
   */
  update(delta, time) {
    const spinSpeed = CONFIG.blackHole.diskSpinSpeed;
    for (const bh of this.bhs) {
      bh.uniforms.horizon.uTime.value += delta;
      bh.uniforms.disk.uTime.value += delta;
      bh.uniforms.jet.uTime.value += delta;
      bh.disk.rotation.z += delta * spinSpeed;
      bh.group.rotation.y += delta * 0.02;
    }
  }

  /**
   * 取得所有黑洞位置 (Get all BH positions)
   * @returns {THREE.Vector3[]}
   */
  getPositions() {
    return this.bhs.map(bh => bh.position);
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    for (const bh of this.bhs) {
      this.scene.remove(bh.group);
      bh.group.traverse(child => {
        if (child.isMesh || child.isPoints) {
          child.geometry?.dispose();
          child.material?.dispose();
        }
      });
    }
    this.bhs = [];
  }
}
