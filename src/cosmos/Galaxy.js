/**
 * ============================================================================
 * Cosmic Genesis — 螺旋星系系統 (Spiral Galaxy System)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 使用 Three.js InstancedMesh 渲染數萬顆恆星，每顆恆星透過旋臂公式
 * 計算位置，形成壯觀的螺旋星系。支援多種星系型態（2臂、3臂、4臂）。
 * InstancedMesh 大幅減少 Draw Call，讓數萬恆星也能順暢渲染。
 *
 * 旋臂公式 (Spiral Arm Formula):
 *   x = radius * cos(angle + radius * twist)
 *   z = radius * sin(angle + radius * twist)
 *   y = Gaussian random (厚度)
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

/**
 * 星系類別 (Galaxy Class)
 */
export class Galaxy {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [index=0]
   */
  constructor(scene, index = 0) {
    this.scene = scene;
    this.mesh = null;

    // 星系核心位置 (分散在不同位置)
    this.position = new THREE.Vector3(
      (Math.random() - 0.5) * 200,
      (Math.random() - 0.5) * 80,
      (Math.random() - 0.5) * 200 - 100
    );

    this.armCount = CONFIG.galaxy.armCount[0] +
      Math.floor(Math.random() * (CONFIG.galaxy.armCount[1] - CONFIG.galaxy.armCount[0] + 1));

    this.radius = CONFIG.galaxy.radiusRange[0] +
      Math.random() * (CONFIG.galaxy.radiusRange[1] - CONFIG.galaxy.radiusRange[0]);

    this._colorSet = CONFIG.galaxy.colorPalette[index % CONFIG.galaxy.colorPalette.length];
    this.starCount = CONFIG.galaxy.starsPerGalaxy;

    this._create();
    console.log(`[Galaxy ${index}] 星系建立完成 / Created: ${this.armCount} arms, ${this.starCount} stars`);
  }

  /** @private 建立星系 InstancedMesh */
  _create() {
    const count = this.starCount;
    const dummy = new THREE.Object3D();

    // === 建立一顆星的原型 (A single star prototype) ===
    const starGeo = new THREE.BufferGeometry();
    const verts = new Float32Array([
      -0.3, -0.3, 0,
       0.3, -0.3, 0,
       0.3,  0.3, 0,
      -0.3,  0.3, 0,
    ]);
    starGeo.setAttribute('position', new THREE.BufferAttribute(verts, 3));
    starGeo.setIndex([0, 1, 2, 0, 2, 3]);

    // === InstancedMesh ===
    const starMat = new THREE.MeshBasicMaterial({
      color: new THREE.Color().setHSL(this._colorSet[0], 0.3, 0.7),
      transparent: true,
      opacity: 0.9,
    });

    this.mesh = new THREE.InstancedMesh(starGeo, starMat, count);
    this.mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

    // 儲存每個星體的顏色與大小資料
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const armTwist = 1.5 + Math.random() * 0.5; // 纏繞程度

    for (let i = 0; i < count; i++) {
      // === 旋臂位置計算 (Spiral arm position) ===
      const armIndex = Math.floor(Math.random() * this.armCount);
      const armAngle = (armIndex / this.armCount) * Math.PI * 2;

      // 徑向位置：核心密度較高 (Radial position with core density)
      const radial = Math.pow(Math.random(), 0.6) * this.radius;
      const scatter = (1 - radial / this.radius) * CONFIG.galaxy.armSpread + 0.1;
      const angleOffset = (Math.random() - 0.5) * scatter;

      const angle = armAngle + radial * armTwist + angleOffset;

      // 高斯厚度 (Gaussian thickness)
      const thickness = (Math.random() + Math.random() - 1) * CONFIG.galaxy.thickness;

      const x = radial * Math.cos(angle);
      const z = radial * Math.sin(angle);
      const y = thickness;

      dummy.position.set(
        x + (Math.random() - 0.5) * 0.5,
        y,
        z + (Math.random() - 0.5) * 0.5
      );

      // 大小：核心較大 (Size: larger near core)
      const sizeFactor = 0.3 + 0.7 * (1 - radial / this.radius);
      const starSize = 0.1 + sizeFactor * 0.6;
      dummy.scale.set(starSize, starSize, 1);

      // 旋轉 (Random rotation)
      dummy.rotation.z = Math.random() * Math.PI * 2;

      dummy.updateMatrix();
      this.mesh.setMatrixAt(i, dummy.matrix);

      // === 顏色：依溫度變化 (Color by temperature) ===
      const tempMix = Math.random();
      let starColor;
      if (tempMix < 0.1) {
        starColor = new THREE.Color(0.6, 0.7, 1.0);      // 藍白 O/B
      } else if (tempMix < 0.3) {
        starColor = new THREE.Color(0.9, 0.9, 1.0);      // 白 A/F
      } else if (tempMix < 0.7) {
        starColor = new THREE.Color(1.0, 0.95, 0.8);     // 黃 G (太陽)
      } else if (tempMix < 0.9) {
        starColor = new THREE.Color(1.0, 0.8, 0.5);      // 橙 K
      } else {
        starColor = new THREE.Color(1.0, 0.6, 0.3);      // 紅 M
      }
      colors[i * 3] = starColor.r;
      colors[i * 3 + 1] = starColor.g;
      colors[i * 3 + 2] = starColor.b;
      sizes[i] = starSize;
    }

    this.mesh.instanceMatrix.needsUpdate = true;
    this.mesh.setColorAt(0, new THREE.Color(1, 1, 1)); // dummy
    if (this.mesh.instanceColor) {
      this.mesh.instanceColor.needsUpdate = false;
    }

    // 儲存顏色陣列供更新使用
    this._colors = colors;
    this._sizes = sizes;

    // 儲存原始位置供旋轉計算
    this._positions = [];
    for (let i = 0; i < count; i++) {
      const mat = new THREE.Matrix4();
      this.mesh.getMatrixAt(i, mat);
      const pos = new THREE.Vector3();
      pos.setFromMatrixPosition(mat);
      this._positions.push(pos);
    }

    this.mesh.position.copy(this.position);
    this.mesh.name = 'Galaxy';
    this.scene.add(this.mesh);
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta
   */
  update(delta) {
    if (!this.mesh) return;
    this.mesh.rotation.y += CONFIG.galaxy.rotationSpeed * delta;
  }

  /**
   * 取得世界位置 (Get world position)
   * @returns {THREE.Vector3}
   */
  getWorldPosition() {
    const pos = new THREE.Vector3();
    this.mesh.getWorldPosition(pos);
    return pos;
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    this.scene.remove(this.mesh);
    this.mesh.geometry.dispose();
    this.mesh.material.dispose();
  }
}
