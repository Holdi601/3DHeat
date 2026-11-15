---
title: "賽車分析"
nav_order: 14
has_children: true
lang: "zh-Hant"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# 賽車分析

你開過同一條賽道兩次。**賽車分析**頁籤會把這兩趟行駛一起以 3D 播放，指出某一圈哪裡比較慢，並告訴你為什麼。還沒有單圈資料？按下**示範圈**。

![示範圈的賽車分析頁籤：側邊欄含單圈與可改進之處、賽道上的車輛，以及檢視下方的圖表](../assets/img/zh-Hant/race-analysis-overview.webp)

此頁籤會比較同一條賽道的兩圈或更多圈。它與熱圖共用畫布、攝影機與載入的賽道模型（**背景／關卡**）；其餘部分都是它自己的：有自己的側邊欄，以及檢視下方自己的列。*單圈*、*參考*與*頂點*等詞彙，都在[詞彙表](glossary.md)中說明。

本頁是此頁籤的地圖。每個部分都有自己的頁面：

| 頁面 | 涵蓋內容 |
|---|---|
| [載入單圈](race-loading-laps.md) | 每種檔案格式、資料夾與賽道、車輛名稱、示範圈、單圈清單、參考與聚焦 |
| [重播與 3D 場景](race-replay-and-scene.md) | 傳輸列、三種重播模式、將車輛對齊、追逐攝影機、線條、地圖、車輛、標籤、鏡像世界 |
| [圖表與 HUD](race-charts-and-hud.md) | 距離圖表、圖表選擇器、懸停與縮放、車輛卡片、通道表 |
| [車輛操控事件](race-control-events.md) | 鎖死、輪胎空轉、過度轉向、打滑、轉向不足、碰撞、撞擊、ABS/TC、手煞車、空中：每種如何偵測，附上每個門檻值 |
| [逐彎分析](race-corner-analysis.md) | 依距離對齊、彎道與路段、彎道的時間結算、每個成因與其檢查順序、走線形狀與建議 |
| [車輛剖面與比較](race-car-profiles.md) | 每台車能做什麼（依其單圈測量）；*車輛比較*；車輛在每個彎道決定了什麼 |
| [賽道統計](race-course-statistics.md) | 同一條賽道的多圈：每個彎道與每種類型的失誤、失誤地圖、熱度匯出、效能限制 |
| [賽車分析：方法](race-analytics.md) | 規則背後的研究與來源 |
| [其他賽車遊戲](other-games.md) | 檢視器如何處理每款遊戲的單圈：遊戲未傳送時推算的側滑與漂移、鏡像世界、額外通道 |

## 畫面 {#the-screen}

**側邊欄**，由上至下（各區段可以收合）：

1. **單圈** - 載入、列出、顯示／隱藏、參考、聚焦、追逐。
   請參閱[載入單圈](race-loading-laps.md)。
2. **賽道統計** - 只在載入三圈以上時出現。
   請參閱[賽道統計](race-course-statistics.md)。
3. **可改進之處** - 聚焦單圈的發現，逐彎顯示。
   請參閱[逐彎分析](race-corner-analysis.md)。
4. **逐彎分析**（若有多個車輛等級則為*逐彎分析 - 等級 X*）- 每個彎道中最快的單圈及其走線。兩圈或更多圈時顯示。
5. **車輛控制** - 聚焦單圈的鎖死、打滑、推擠與撞擊。
   請參閱[車輛操控事件](race-control-events.md)。
6. **車輛比較**（只有一台車時為**車輛**）- 請參閱[車輛剖面與比較](race-car-profiles.md)。
7. **檢視** - 賽道上繪製哪種地圖，以及繪製什麼。
   請參閱[重播與 3D 場景](race-replay-and-scene.md)。
8. 共用的**關卡**與**攝影機與場景**面板（賽道模型、座標軸翻轉、攝影機）- 與熱圖及[攝影機](camera.md)一同說明。

**檢視**會顯示賽道、所行駛的線條、地圖、車輛、貼在賽道上的標籤，以及左上角最多六張車輛卡片（請參閱[圖表與 HUD](race-charts-and-hud.md)）。沒有載入任何單圈時，它會顯示「尚未載入單圈 - 將兩個或更多單圈檔案拖放到這裡，或從側邊欄載入示範圈。」

**檢視下方的列**包含重播傳輸控制，以及（除非隱藏）距離圖表。

## 快速開始 {#quick-start}

1. 開啟**賽車分析**頁籤（位於側邊欄頂端，與**熱圖**並列）。
2. 載入單圈。按**示範圈**即可看到此頁籤如何處理三圈虛構的單圈。若要使用你自己的單圈，請先錄製（[檔案格式與錄製工具](race-loading-laps.md#file-formats)），然後按**載入單圈檔案…**或**資料夾…**，或把檔案或資料夾拖放到檢視上。
3. 最快的完整單圈會成為參考；其他單圈中最慢的那圈會被聚焦。點擊清單中的任何單圈即可聚焦它；★ 可將某圈設為參考。
4. 閱讀**可改進之處**。點擊某項發現：車輛會在其前 40 m 對齊，攝影機會框住它，重播會播放經過該處的過程，並開啟測量。
5. 將滑鼠移到圖表上，即可讓每台車移到該公尺位置；按住 Shift 再點擊，則會在該處對齊它們。

## 按鍵 {#keyboard}

在賽車頁籤開啟時：

| 按鍵 | 功能 |
|---|---|
| **K** | 播放／暫停重播 |
| **Home** | 回到重播開頭 |
| 數字鍵 | 無作用（在熱圖中會切換模式） |

在文字欄位或下拉式選單中輸入的按鍵會被忽略。攝影機按鍵與熱圖中相同（**W A S D**、**Space** 上升、**Q** 下降、**Shift** 加速、**Alt** 減速、滑鼠轉向；全部見[攝影機](camera.md)）；**F** 會框住已載入的單圈（與載入單圈時相同）。

## 多圈 {#many-laps}

- 所有已載入的單圈都會被分析並計數；數十圈只需一到兩秒。
- 超過 **8** 圈（`SHOW_ALL_UP_TO`）時，新增的單圈只有在它是參考、被聚焦的單圈，或被聚焦單圈所屬等級中的最佳單圈時才會被繪製。*全部顯示* / *只顯示被查看的*可切換。
- 超過 **10** 台可見車輛（`PLAIN_PAST`）時，未被查看的單圈（不是聚焦、被追逐的車，或參考）會以每 6 m 一個點的稀疏線條繪製，而非每 1.5 m，並且使用普通車輛。
- 圖表最多繪製 **8** 圈；HUD 最多顯示 **6** 張卡片。
- 賽道統計從 **3** 圈起出現。

詳情：[賽道統計](race-course-statistics.md#performance-with-many-laps)。

## 預設檢視設定 {#default-view-settings}

| 設定 | 預設值 |
|---|---|
| 地圖 | 時間地圖 |
| 行駛線條、車輛、輪胎與懸吊、標籤、由單圈產生的賽道 | 開 |
| 卡片上的所有數值 | 關 |
| 車輛大小 | 1× |
| 圖表 | 顯示 |
| 重播模式 | 從線條開始 |
| 重播速度 | 1× |
| 循環 | 開 |

以上皆不會被儲存；重新載入會從預設值開始。瀏覽器會記住的只有：語言，以及從單圈檔案學到的車輛名稱（請參閱[載入單圈](race-loading-laps.md#car-names)）。

## 給開發者 {#for-developers}

### 載入單圈時會發生什麼 {#what-happens-when-laps-are-loaded}

每當單圈集合、參考或語言改變時，整個分析都會重新進行（[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts) 中的 `analyse`）：

1. 在遊戲沒有送出的地方，為每一圈加入推導出的通道：漂移角、由輪速推得的車輪打滑、是否在空中、是否在鬆散地面、偏航率（[`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)）。
2. 選定參考，並把每一圈投影到其路徑上，每 2 m 重新取樣（[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)）。
3. 從各圈推算遊戲世界是否鏡像（[`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)）。
4. 在參考上找出彎道，並把它們從一個煞車區到下一個煞車區分組為路段（[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)）。
5. 對每輛車：其包絡（每個速度下的抓地力、煞車與牽引力）、其檔案，以及其輪胎曲線（[`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts)、[`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts)、[`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)）。
6. 對每一圈與每個路段：它做了什麼（煞車點、最慢點、全油門等……）以及它所行駛的路線（[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)）。
7. 對每一圈：其車輛操控事件，各自與該圈在此處所對照的圈次並列。
8. 對每一圈與每個路段：相對於對照圈次的時間帳，以及用文字寫成的發現。
9. 每一圈的時間圖與原因圖。

文字會以目前的語言產生；切換語言會重新執行分析（並重新命名示範圈）。若分析失敗，錯誤會顯示在**單圈**按鈕下方，單圈仍保持載入。

### 原始檔案 {#source-files}

| 檔案 | 作用 |
|---|---|
| `src/race/adapters.ts`、`ibt.ts` | 讀取單圈檔案 |
| `src/race/lap.ts`、`carNames.ts`、`synthetic.ts` | 單圈類型、命名、示範圈 |
| `src/race/derive.ts`、`handedness.ts` | 推導通道、鏡像世界 |
| `src/race/align.ts`、`segments.ts`、`line.ts` | 距離軸、彎道、線條 |
| `src/race/analysis.ts` | 彎道比較、原因、發現 |
| `src/race/envelope.ts`、`profile.ts` | 車輛能做什麼 |
| `src/race/control.ts`、`impacts.ts` | 車輛操控、碰撞與撞擊 |
| `src/race/stats.ts` | 多圈 |
| `src/race/replay.ts`、`scene.ts`、`glyph.ts`、`geometry.ts` | 重播與繪製 |
| `src/race/schema.ts`、`graphs.ts` | 通道表、圖表的列 |
| `src/ui/race/*` | 側邊欄、圖表、HUD、標籤 |
| `src/state/raceStore.ts` | 頁籤的狀態與重播時鐘 |
