# ✦ Cosmic Genesis — 宇宙創世模擬器

> **An automatic, never-stopping universe evolution simulator with cinematic visuals**
> **全自動、永不停歇的宇宙演化模擬器，具電影級視覺效果**

![Cosmic Genesis](https://img.shields.io/badge/Three.js-r170-green?logo=three.js)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite)

---

## 📖 專案簡介 / Overview

Cosmic Genesis 是一個全自動運行的 3D 宇宙模擬器，無需任何玩家操作。每次執行都因程序生成（Procedural Generation）而產生獨一無二的宇宙，包含：

- **粒子星雲** — 數萬個半透明粒子構成廣闊星雲背景
- **螺旋星系** — 使用 InstancedMesh 渲染數萬顆恆星，多種旋臂型態
- **恆星核心** — 多顆大質量恆星，具備脈動光暈與色溫變化
- **黑洞系統** — 事件視界 + 吸積盤 + 相對論性噴流
- **超新星爆炸** — 自動觸發的爆炸事件，粒子殼層向外擴散
- **雙星系統** — 兩星互繞，伴隨質量傳輸粒子流
- **星系碰撞** — 觸發潮汐尾跡與恆星流
- **電影級鏡頭** — 自動巡航、環繞、特寫，IMAX 紀錄片體驗

**技術亮點：**
- ✅ Three.js GPU 加速（ShaderMaterial、InstancedMesh）
- ✅ 後處理特效（Bloom、色差、暈影、ACES Tone Mapping）
- ✅ 自訂 GLSL 著色器（星雲、黑洞、吸積盤、噴流）
- ✅ 模組化架構，完整中英註解
- ✅ 無需伺服器，純靜態部署

---

## 🚀 快速開始 / Quick Start

### 前置需求 / Prerequisites
- **Node.js** 18+（建議 20+）
- **npm** 9+ 或 **yarn** 或 **pnpm**

### 安裝與執行 / Install & Run

```bash
# 1. 進入專案目錄
cd cosmic-genesis

# 2. 安裝依賴
npm install

# 3. 啟動開發伺服器
npm run dev

# 4. 在瀏覽器中開啟
# Open http://localhost:5173/cosmic-genesis/
```

### 建置部署版本 / Build for Production

```bash
npm run build
```

產生 `dist/` 目錄，可直接部署到靜態伺服器。

### 預覽建置結果 / Preview Build

```bash
npm run preview
```

---

## 🌐 GitHub Pages 部署 / Deployment

### 方法一：自動部署 (GitHub Actions)

在專案根目錄建立 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
      - uses: actions/deploy-pages@v4
```

### 方法二：手動部署

```bash
npm run build
cd dist
git init
git checkout -b gh-pages
git add -A
git commit -m "deploy"
git remote add origin https://github.com/<你的帳號>/cosmic-genesis.git
git push -f origin gh-pages
```

然後在 GitHub 專案 Settings → Pages 中選擇 `gh-pages` branch。

---

## 🏗️ 專案架構 / Project Structure

```
cosmic-genesis/
├── index.html              # 入口 HTML（含 HUD 結構）
├── package.json            # 套件組態
├── vite.config.js          # Vite 組態（base 設為 /cosmic-genesis/）
├── README.md               # 本文件
└── src/
    ├── main.js             # ✅ 應用程式進入點
    ├── config.js           # ✅ 全域組態（所有可調參數集中管理）
    ├── shaders.js          # ✅ 所有自訂 GLSL 著色器
    ├── CameraController.js # ✅ 電影級自動巡航相機
    ├── core/
    │   └── Engine.js       # ✅ 主引擎（協調所有系統）
    ├── cosmos/
    │   ├── Nebula.js       # ✅ 粒子星雲系統
    │   ├── Galaxy.js       # ✅ 螺旋星系系統（InstancedMesh）
    │   ├── StarCore.js     # ✅ 恆星核心系統（ShaderMaterial 光暈）
    │   ├── BlackHole.js    # ✅ 黑洞系統（事件視界+吸積盤+噴流）
    │   ├── SupernovaSystem.js # ✅ 超新星爆炸系統
    │   ├── BinaryStar.js   # ✅ 雙星系統
    │   ├── GalaxyCollision.js # ✅ 星系碰撞系統
    │   └── EventScheduler.js  # ✅ 宇宙事件排程器
    ├── effects/
    │   └── PostProcessing.js  # ✅ 後處理特效管線（Bloom、色差等）
    └── ui/
        └── HUD.js          # ✅ 抬頭顯示器（資訊 overlay + 控制項）
```

### 模組說明 / Module Descriptions

| 模組 / Module | 職責 / Responsibility | 技術 / Technology |
|---|---|---|
| **Engine** | 協調所有系統、動畫迴圈、初始化 | Three.js Scene management |
| **CameraController** | 自動巡航、目標追蹤、轉場動畫 | lerp/slerp 平滑插值 |
| **Nebula** | 背景星雲粒子、浮游動畫 | BufferGeometry + ShaderMaterial |
| **Galaxy** | 螺旋星系、多旋臂型態 | InstancedMesh（大量恆星） |
| **StarCore** | 恆星光暈、色溫脈動 | 自訂 ShaderMaterial |
| **BlackHole** | 事件視界、吸積盤、噴流 | 多層 ShaderMaterial + Points |
| **SupernovaSystem** | 爆炸粒子殼層、顏色演變 | 自訂 ShaderMaterial |
| **BinaryStar** | 雙星軌道、質量傳輸流 | Group + Points trail |
| **GalaxyCollision** | 潮汐尾跡、合併動畫 | Points 粒子系統 |
| **EventScheduler** | 事件計時與觸發 | 時間間隔 + 隨機性 |
| **PostProcessing** | Bloom、色差、暈影 | EffectComposer 管線 |
| **HUD** | 資訊顯示、控制按鈕、FPS | DOM-based Glassmorphism |

---

## 🎨 設計理念 / Design Philosophy

### 粒子星雲 (Nebula)
使用 BufferGeometry 搭配 ShaderMaterial 在 GPU 上渲染數萬個半透明粒子，每個粒子具有獨立顏色（從色相環選取）、大小與透明度。粒子緩慢漂移，模擬 Hubble 望遠鏡拍攝的星雲動態。

### 螺旋星系 (Galaxy)
採用 InstancedMesh 技術，用一個幾何體實例化數萬次，大幅減少 Draw Call。恆星位置透過旋臂公式計算：`angle = armAngle + radius × twist`。顏色根據黑體輻射色溫隨機分布，從藍白(O型)到紅(M型)。

### 黑洞 (Black Hole)
三層結構構成逼真的黑洞：(1) 事件視界球體使用菲涅爾效應（邊緣發光）搭配旋轉紋理，(2) 吸積盤粒子採用開普勒旋轉（內圈轉更快），(3) 噴流粒子沿軸向外射出並螺旋扭曲。

### 超新星 (Supernova)
每個粒子沿隨機方向（黃金角度球面分布）向外爆炸擴散。顏色隨時間演變：白熱（0%）→ 橙色（30%）→ 紅色（60%）→ 紫色（100%），模擬真實超新星的光變曲線與冷卻過程。

### 相機 (Camera)
仿 BBC/NASA 紀錄片風格的電影級自動巡航。支援四種模式：
- **ORBIT** — 環繞目標旋轉
- **FLYBY** — 飛越目標
- **ZOOM** — 推進特寫
- **WIDE** — 廣角全景

使用平滑插值（lerp）實現無縫轉場，並在超新星爆炸時觸發鏡頭震動。

### 後處理 (Post-Processing)
採用 ACES Filmic Tone Mapping 獲得寬動態範圍的電影感色調。疊加 Bloom（泛光）、Chromatic Aberration（色差）與 Vignette（暈影），營造太空望遠鏡的視覺質感。

---

## ⚙️ 組態調整 / Configuration

所有可調參數集中在 `src/config.js`：

```javascript
// 範例：調整粒子數量以符合效能
CONFIG.nebula.particleCount = 50000;  // 預設 80000
CONFIG.galaxy.starsPerGalaxy = 20000; // 預設 30000
```

**品質等級 / Quality Levels：**
| 等級 / Level | 解析度比例 | 粒子比例 | Bloom | 陰影 | 反鋸齒 |
|---|---|---|---|---|---|
| **HQ** (高) | 1.0x | 100% | 0.8 | ✅ | ✅ |
| **MQ** (中) | 0.75x | 60% | 0.5 | ❌ | ✅ |
| **LQ** (低) | 0.5x | 30% | 0.2 | ❌ | ❌ |

---

## 🎮 控制項 / Controls

| 按鈕 / Button | 功能 / Function |
|---|---|
| ⏸ **Pause / Play** | 暫停與繼續模擬 |
| ⛶ **Fullscreen** | 切換全螢幕模式 |
| ◉ **Screenshot** | 高解析度截圖 |
| ⟳ **Reset** | 重置模擬狀態 |
| **HQ / MQ / LQ** | 切換畫質等級 |

---

## 🔧 技術細節 / Technical Details

### 效能優化策略
- **InstancedMesh**：數萬顆恆星只需一次 Draw Call
- **ShaderMaterial**：粒子運算在 GPU 上執行，不佔用 CPU
- **粒子池 (Object Pooling)**：潮汐粒子與超新星使用固定大小池
- **動態品質切換**：可即時調整解析度與特效等級
- **Delta Time 限制**：防止長時間暫停後的大幅度跳幀

### 可能遇到的問題
- **瀏覽器 WebGL 支援**：需要支援 WebGL 2.0 的現代瀏覽器
- **記憶體使用**：長時間執行請留意 GPU 記憶體
- **行動裝置**：建議使用 LQ 模式以獲得流暢體驗

---

## 📦 依賴套件 / Dependencies

| 套件 | 版本 | 用途 |
|---|---|---|
| [three](https://threejs.org/) | ^0.170.0 | 3D 渲染引擎 |
| [vite](https://vitejs.dev/) | ^6.0.0 | 開發伺服器與打包工具 |

---

## 📝 授權 / License

MIT License © 2026 Vincent

---

## 🙏 靈感來源 / Inspiration

- **NASA James Webb Space Telescope** 官方影像
- **Interstellar** (2014) 電影黑洞視覺
- **BBC Universe** 紀錄片系列
- **Apple Vision Pro** 發表會設計美學
- **Three.js** 官方範例與社群

---

*讓宇宙在你眼前展開 ✦*
*Let the universe unfold before your eyes ✦*
