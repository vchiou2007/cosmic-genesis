/**
 * ============================================================================
 * Cosmic Genesis — 宇宙事件排程器 (Event Scheduler)
 * ============================================================================
 *
 * 設計理念 (Design Philosophy):
 * 負責協調所有宇宙事件的觸發時機，包括超新星爆炸、星系碰撞、相機切換等。
 * 採用時間間隔與隨機性相結合的方式，讓每次觀看都有不同的體驗。
 * 所有事件位置從已有的天體系統中隨機選取，確保事件發生在有意義的位置。
 */

import * as THREE from 'three';
import { CONFIG } from '../config.js';

/**
 * 事件排程器類別 (Event Scheduler Class)
 */
export class EventScheduler {
  /**
   * @param {object} cosmosRefs - 參考宇宙各系統的引用
   * @param {Function} triggerSupernova - 觸發超新星的函式
   * @param {Function} triggerCollision - 觸發星系碰撞的函式
   * @param {Function} switchCamera - 切換相機目標的函式
   */
  constructor(cosmosRefs, triggerSupernova, triggerCollision, switchCamera) {
    this.refs = cosmosRefs;
    this.triggerSupernova = triggerSupernova;
    this.triggerCollision = triggerCollision;
    this.switchCamera = switchCamera;

    // === 計時器 (Timers) ===
    this._supernovaTimer = CONFIG.eventScheduler.supernovaInterval[0] +
      Math.random() * (CONFIG.eventScheduler.supernovaInterval[1] - CONFIG.eventScheduler.supernovaInterval[0]);
    this._collisionTimer = CONFIG.galaxyCollision.triggerInterval * 0.5;
    this._cameraTimer = CONFIG.eventScheduler.cameraChangeInterval * 0.5;
    this._time = 0;

    console.log('[EventScheduler] 事件排程器啟動 / Scheduler started');
  }

  /**
   * 每幀更新 (Per-frame update)
   * @param {number} delta
   */
  update(delta) {
    this._time += delta;

    // === 超新星計時 (Supernova timer) ===
    this._supernovaTimer -= delta;
    if (this._supernovaTimer <= 0) {
      this._scheduleSupernova();
      this._supernovaTimer = CONFIG.eventScheduler.supernovaInterval[0] +
        Math.random() * (CONFIG.eventScheduler.supernovaInterval[1] - CONFIG.eventScheduler.supernovaInterval[0]);
    }

    // === 星系碰撞計時 (Galaxy collision timer) ===
    this._collisionTimer -= delta;
    if (this._collisionTimer <= 0 && this.triggerCollision) {
      this._scheduleCollision();
      this._collisionTimer = CONFIG.galaxyCollision.triggerInterval +
        Math.random() * 30;
    }
  }

  /** @private 排程超新星 */
  _scheduleSupernova() {
    // 從現有恆星或星系位置選取爆炸點
    const positions = [];

    if (this.refs.starCore) {
      positions.push(...this.refs.starCore.getPositions());
    }
    if (this.refs.galaxies) {
      for (const g of this.refs.galaxies) {
        positions.push(g.getWorldPosition());
      }
    }
    if (this.refs.binaryStar) {
      positions.push(...this.refs.binaryStar.getPositions());
    }

    if (positions.length === 0) {
      // 預設位置 (Fallback)
      positions.push(new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 40,
        (Math.random() - 0.5) * 100 - 50
      ));
    }

    const pos = positions[Math.floor(Math.random() * positions.length)];
    this.triggerSupernova(pos, this._time);
  }

  /** @private 排程星系碰撞 */
  _scheduleCollision() {
    const pos = new THREE.Vector3(
      (Math.random() - 0.5) * 150,
      (Math.random() - 0.5) * 40,
      (Math.random() - 0.5) * 150 - 80
    );
    this.triggerCollision(pos, this._time);
  }

  /**
   * 重置所有計時器 (Reset all timers)
   */
  reset() {
    this._supernovaTimer = 10 + Math.random() * 10;
    this._collisionTimer = 20 + Math.random() * 20;
    this._cameraTimer = 3;
    this._time = 0;
  }

  /**
   * 取得總模擬時間 (Get total simulation time)
   * @returns {number}
   */
  getSimulationTime() {
    return this._time;
  }

  /**
   * 釋放資源 (Dispose)
   */
  dispose() {
    // Nothing to clean up
  }
}
