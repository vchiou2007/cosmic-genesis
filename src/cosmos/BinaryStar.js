/**
 * ============================================================================
 * Cosmic Genesis — 雙星系統 (Binary Star System)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 兩顆恆星圍繞共同質心旋轉，並以粒子流（質量傳輸）連接。
 * 視覺靈感來自 R Aquarii 等真實雙星系統的 Hubble 望遠鏡影像。
 * 雙星軌道為橢圓形，根據質量比調整軌道半徑。
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

/**
 * 雙星系統類別 (Binary Star System)
 */
export class BinaryStar {
  /**
   * @param {THREE.Scene} scene
   * @param {number} [count]
   */
  constructor(scene, count = CONFIG.binaryStar.count) {
    this.scene = scene;
    this.systems = [];
    this._create(count);
    console.log('[BinaryStar] 雙星系統建立完成 / Created', count, 'systems');
  }

  /** @private */
  _create(count) {
    for (let i = 0; i < count; i++) {
      const group = new THREE.Group();
      const separation = CONFIG.binaryStar.separationRange[0] +
        Math.random() * (CONFIG.binaryStar.separationRange[1] - CONFIG.binaryStar.separationRange[0]);
      const massRatio = CONFIG.binaryStar.massRatioRange[0] +
        Math.random() * (CONFIG.binaryStar.massRatioRange[1] - CONFIG.binaryStar.massRatioRange[0]);

      const pos = new THREE.Vector3(
        (Math.random() - 0.5) * 150,
        (Math.random() - 0.5) * 50,
        (Math.random() - 0.5) * 150 - 50
      );
      group.position.copy(pos);

      // === 主星 (Primary star - larger) ===
      const primarySize = 1.2 + Math.random() * 1.5;
      const primaryColor = new THREE.Color().setHSL(0.08, 0.8, 0.7); // 暖黃
      const primary = this._createStarMesh(primarySize, primaryColor);
      primary.name = 'Primary';

      // === 次星 (Secondary star - smaller) ===
      const secondarySize = primarySize * massRatio * 0.7;
      const secondaryColor = new THREE.Color().setHSL(0.6, 0.7, 0.7); // 藍白
      const secondary = this._createStarMesh(secondarySize, secondaryColor);
      secondary.name = 'Secondary';

      group.add(primary);
      group.add(secondary);

      // === 連接粒子流 (Mass transfer stream) ===
      const trailCount = CONFIG.binaryStar.trailParticles;
      const trailPositions = new Float32Array(trailCount * 3);
      const trailColors = new Float32Array(trailCount * 3);
      const trailSizes = new Float32Array(trailCount);

      for (let j = 0; j < trailCount; j++) {
        const t = j / trailCount;
        trailPositions[j * 3] = (t - 0.5) * separation;
        trailPositions[j * 3 + 1] = Math.sin(t * Math.PI * 4) * 0.5;
        trailPositions[j * 3 + 2] = Math.cos(t * Math.PI * 4) * 0.3;
        const c = new THREE.Color().lerpColors(primaryColor, secondaryColor, t);
        trailColors[j * 3] = c.r;
        trailColors[j * 3 + 1] = c.g;
        trailColors[j * 3 + 2] = c.b;
        trailSizes[j] = 0.3 + Math.random() * 0.4;
      }

      const trailGeo = new THREE.BufferGeometry();
      trailGeo.setAttribute('position', new THREE.BufferAttribute(trailPositions, 3));
      trailGeo.setAttribute('color', new THREE.BufferAttribute(trailColors, 3));
      trailGeo.setAttribute('size', new THREE.BufferAttribute(trailSizes, 1));

      const trailMat = new THREE.PointsMaterial({
        size: 0.3,
        vertexColors: true,
        transparent: true,
        opacity: 0.4,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const trail = new THREE.Points(trailGeo, trailMat);
      trail.name = 'Trail';
      group.add(trail);

      group.name = `BinaryStar_${i}`;
      this.scene.add(group);

      this.systems.push({
        group,
        primary,
        secondary,
        trail,
        separation,
        massRatio,
        position: pos,
        orbitAngle: Math.random() * Math.PI * 2,
        primaryOffset: (separation / 2) * (1 / (1 + massRatio)),
        secondaryOffset: (separation / 2) * (massRatio / (1 + massRatio)),
      });
    }
  }

  /** @private 建立恆星網格 (Create star mesh with glow) */
  _createStarMesh(size, color) {
    const geo = new THREE.SphereGeometry(size, 16, 16);
    const mat = new THREE.MeshBasicMaterial({ color });
    const mesh = new THREE.Mesh(geo, mat);

    // 外層光暈 (Outer glow)
    const glowGeo = new THREE.SphereGeometry(size * 2.5, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.15,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    mesh.add(glow);

    return mesh;
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} time
   */
  update(time) {
    const speed = CONFIG.binaryStar.orbitalSpeed;
    for (const sys of this.systems) {
      sys.orbitAngle += speed * 0.016; // 約 60fps 基準
      const angle = sys.orbitAngle;

      // 計算軌道位置 (Compute orbital positions)
      const px = Math.cos(angle) * sys.primaryOffset;
      const pz = Math.sin(angle) * sys.primaryOffset;
      sys.primary.position.set(px, Math.sin(angle * 2) * 0.2, pz);

      const sx = -Math.cos(angle) * sys.secondaryOffset;
      const sz = -Math.sin(angle) * sys.secondaryOffset;
      sys.secondary.position.set(sx, Math.sin(angle * 2 + Math.PI) * 0.2, sz);

      // 更新粒子流位置 (Update trail)
      const trailCount = CONFIG.binaryStar.trailParticles;
      const pos = sys.trail.geometry.attributes.position.array;
      for (let j = 0; j < trailCount; j++) {
        const t = j / trailCount;
        const lerpX = px * (1 - t) + sx * t;
        const lerpZ = pz * (1 - t) + sz * t;
        pos[j * 3] = lerpX;
        pos[j * 3 + 1] = Math.sin(t * Math.PI * 4 + time) * 0.3;
        pos[j * 3 + 2] = lerpZ + Math.cos(t * Math.PI * 4 + time * 0.5) * 0.2;
      }
      sys.trail.geometry.attributes.position.needsUpdate = true;
    }
  }

  /**
   * 取得所有系統位置 (Get all system positions)
   * @returns {THREE.Vector3[]}
   */
  getPositions() {
    return this.systems.map(s => {
      const pos = new THREE.Vector3();
      s.group.getWorldPosition(pos);
      return pos;
    });
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    for (const sys of this.systems) {
      this.scene.remove(sys.group);
      sys.group.traverse(child => {
        if (child.isMesh || child.isPoints) {
          child.geometry?.dispose();
          child.material?.dispose();
        }
      });
    }
    this.systems = [];
  }
}
