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

![示範圈的賽車分析頁籤：側邊欄含單圈與可改進之處、賽道上的車輛，以及檢視下方的圖表](../assets/img/en/race-analysis-overview.webp)

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
4. 閱讀**可改進之處**。點擊某項發現：車輛會在其前 40 m 對齊，攝影機會框住它，重播會播放經過該處的過程，並開啟量測。
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

### What happens when laps are loaded {#what-happens-when-laps-are-loaded}

Every time the set of laps, the reference or the language changes, the whole
analysis is redone (`analyse` in
[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts)):

1. Derived channels are added to each lap where the game does not send them:
   drift angle, wheel slip from wheel speeds, in the air, loose ground, yaw
   rate ([`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)).
2. The reference is chosen and every lap is projected onto its path and
   resampled every 2 m ([`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)).
3. Whether the game's world is mirrored is worked out from the laps
   ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)).
4. Corners are found on the reference, and grouped into segments from one
   braking zone to the next ([`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)).
5. Per car: its envelope (grip, braking, pull per speed), its profile, its
   tyre curves ([`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts),
   [`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts),
   [`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)).
6. Per lap and segment: what it did (brake point, slowest point, full
   throttle, ...) and the line it drove ([`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)).
7. Per lap: its car-control events, each laid against the lap it is compared
   with there.
8. Per lap and segment: the time account against its comparison lap and the
   finding in words.
9. The time map and the cause map per lap.

The texts are produced in the current language; switching language runs the
analysis again (and renames the demo laps). A failure in the analysis is
shown under the **Laps** buttons as an error and the laps stay loaded.

### Source files {#source-files}

| File | Role |
|---|---|
| `src/race/adapters.ts`, `ibt.ts` | reading lap files |
| `src/race/lap.ts`, `carNames.ts`, `synthetic.ts` | the lap type, naming, demo laps |
| `src/race/derive.ts`, `handedness.ts` | derived channels, mirrored worlds |
| `src/race/align.ts`, `segments.ts`, `line.ts` | distance axis, corners, lines |
| `src/race/analysis.ts` | corners compared, causes, findings |
| `src/race/envelope.ts`, `profile.ts` | what a car can do |
| `src/race/control.ts`, `impacts.ts` | car control, hits and crashes |
| `src/race/stats.ts` | many laps |
| `src/race/replay.ts`, `scene.ts`, `glyph.ts`, `geometry.ts` | replay and drawing |
| `src/race/schema.ts`, `graphs.ts` | the channel table, the charts' rows |
| `src/ui/race/*` | the sidebar, the charts, the HUD, the labels |
| `src/state/raceStore.ts` | the tab's state and the replay clock |
