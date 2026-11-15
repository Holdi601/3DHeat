---
title: "示範資料"
nav_order: 2
lang: "zh-Hant"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# 示範資料：五分鐘內試用檢視器

![示範山谷中十場戰車比賽的熱度：第 4 步顯示的內容](../assets/img/en/heat-hero.webp)

還沒有你自己的資料？儲存庫可以產生一些。其中的所有內容都是虛構的：一座山谷、一個院子，以及三種虛構遊戲風格的比賽，玩家名稱是 *Blue 1* 或 *Red 3*。本網站的所有圖片都是用它拍攝的。

## 產生資料 {#make-it}

```bash
node tools/demo-data.mjs
```

這會寫入 `tools/.shots/demo/`：

| 檔案 | 內容 |
|---|---|
| `demo-valley.glb` | 一座 12 公里長的山谷，有兩座山丘與一個村莊，作為 3D 關卡 |
| `demo-yard.glb` | 一個 160 公尺的圍牆院子，有建築物，作為 3D 關卡 |
| `tanks.parquet` | 10 場戰車比賽，每方 8 人：移動、射擊、命中（含車體上的命中位置）、火焰、擊殺、殘骸、砲塔瞄準、勝方 |
| `tanks/match-NN.parquet` | 同樣的比賽，每場一個檔案，供[一次疊加多場比賽](many-matches.md)使用 |
| `air.parquet` | 4 對 4 的空戰，含飛彈、干擾彈、擊殺與未命中 |
| `shooter.parquet` | 12 回合，每回合 5 對 5 步行作戰：射擊、擊殺、安置炸彈、獲得與花費的金錢、頭盔與道具 |
| `mass/` | 一個資料夾，內含許多小型 `.3dheat` 比賽，供[大量分析](mass-analysis.md)使用 |
| 賽車單圈組 | 一台車在虛構賽道上的兩圈，供[賽車分析](race-analysis.md)使用 |

每個表格都在其結尾說明自己的欄位，因此不需任何對應就能載入。

## 試用 {#try-it}

1. 啟動檢視器（Windows 使用 `start.bat`，或在任何系統上先執行一次 `npm install` 再執行 `npm run dev`），然後開啟 `http://127.0.0.1:5273/`。
2. **背景 / 關卡 → 3D 模型…**，選取 `demo-valley.glb`。
3. **來源 → 多個檔案…**，選取 `tanks.parquet`。
4. 按 `F` 讓畫面框住資料。你會看到十場比賽的[熱度](heat.md)。
5. 試試模式列：**差異**（Blue 對 Red）、**隊伍熱度**、**線條**。
6. 開啟**洞察**（在熱圖側邊欄中）：它會找出射擊、命中與摧毀次數遠多於其他地方的位置，例如兩座山丘周圍。
7. 開啟**對戰**頁籤；在**重播中的對戰**下選擇 *Match 01*；在時間軸上按**播放**：即是[重播](match-replay.md)。

![以模型呈現戰車的 Match 01 重播](../assets/img/en/replay-overview.webp)

對於射擊遊戲，請載入 `demo-yard.glb` 與 `shooter.parquet`；對於空戰，請載入 `air.parquet`（在**圖示大小** 4 時，模型較容易看清楚；此滑桿位於熱圖側邊欄的**隊伍檢視器**面板中）。

## 螢幕截圖 {#the-screenshots}

本網站的圖片是由腳本從這些資料製作的，可使用檢視器的任一種語言：

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

螢幕截圖伺服器不載入本機的模型包，因此只會顯示公開的模型目錄。圖片會存到 `docs/assets/img/<lang>/`。請參閱[維護文件](maintaining.md)。
