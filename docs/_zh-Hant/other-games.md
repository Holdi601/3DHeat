---
title: "其他賽車遊戲"
parent: "賽車分析"
nav_order: 59
lang: "zh-Hant"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# 檢視器中的其他賽車遊戲

檢視器能讀取許多賽車遊戲的圈速資料，不只一款。這一頁列出這些遊戲，並說明如何從每一款取出一圈的資料。

## 遊戲清單 {#the-games}

| 遊戲 | 紀錄工具 | 檔案中有滑移資料嗎？ | 世界是否鏡像？ | 備註 |
|---|---|---|---|---|
| Forza Horizon 4/5/6、Forza Motorsport | `heat3d_capture telemetry`（透過 UDP 的 Data Out），或 FH Companion 的圈速檔加上它們的 `.tele.gz` | 有，每個輪胎（已正規化） | 有（左手座標系世界） | 每個 FH Companion 圈速檔旁邊的 `.tele.gz` 會提供每個輪胎的滑移；只有圈速檔本身則沒有 |
| Assetto Corsa、ACC、AC EVO、AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally`（共享記憶體） | 有，每個輪胎 | 從圈速量測 | 也包含 ABS 與循跡控制的作動、輪胎負荷、溫度 |
| EA SPORTS WRC、DiRT Rally 2.0 / 1、DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4`（UDP） | 沒有，由輪速推算 | 從圈速量測 | 拉力賽：鬆散路面與跳躍的判定方式不同 |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr`（NGP UDP） | 沒有 | 從圈速量測 | 沒有輪速資料 |
| BeamNG.drive | `heat3d_capture telemetry --game beamng`（一個模組） | 沒有，由輪速推算 | 從圈速量測 | |
| Trackmania | Openplanet 外掛，`telemetry --game trackmania --install` | 每個輪胎的滑移係數 | 從圈速量測 | 街機式物理：滑行的判定方式不同 |
| iRacing | 沒有：使用它自己的 `.ibt` 檔 | 沒有（未記錄）；由偏航角推算 | 沒有（以 GPS 為準） | 在車內按 Alt+L 開啟記錄 |

## 如何錄製一圈 {#how-to-record-a-lap}

1. 在表格中選好你的遊戲，並依照該紀錄工具對應遊戲的頁面設定（遊戲內的設定、模組，或 iRacing 則什麼都不用做）。每款遊戲的步驟不同，所以放在紀錄工具的文件中：[GameCapture：遊戲](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)。
2. 啟動紀錄工具，然後開車。它會為每一圈寫入一個檔案。
3. 在 **賽車分析** 分頁按下 **載入單圈檔案…**，選取兩圈以上同一賽道的圈速（見 [載入圈速](race-loading-laps.md)）。

對於拉力賽遊戲，紀錄工具會為每次賽段行駛寫入一個檔案。對於 Forza，最簡單的開始方式是使用 FH Companion 的資料庫，並把 `.tele.gz` 檔放在圈速檔旁邊。

## 紀錄工具的說明文件 {#what-the-recorders-document}

每款遊戲如何紀錄、會送出什麼資料、各種配置的來源，以及能從其檔案匯出哪些賽道，都由紀錄工具負責說明：[GameCapture：遊戲](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)（公開，位於 [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)）。每個紀錄工具寫出的圈速檔格式則見 [GameCapture：圈速格式](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)。

## 檢視器如何處理這些資料 {#what-the-viewer-does-with-them}

每款遊戲最後都會變成 `heat3d-lap`
檔案（或圈速 CSV；iRacing 的 `.ibt` 則直接讀取），使用 `src/race/schema.ts` 的標準通道名稱，並附上一個 `meta` 區塊，說明其數值的意義：滑移如何縮放、是賽道、拉力還是街機模式、已知時的路面。因此 **賽車分析** 分頁會一視同仁地處理它們。沒有載入賽道模型時，**賽車分析** 分頁會依據圈速本身的分布畫出一條路，所以每款遊戲不需要賽道模型也能使用。

沒有一款拉力遊戲會送出輪胎滑移，這部分由檢視器推算：如果遊戲送出每個輪胎的接地面或表面速度，就拿它和車速比較（`(wheel - car) / car`）；如果遊戲只送出旋轉，就用旋轉以及在該圈上量得的滾動半徑來推算。車身的漂移角，取自車子本身的速度（Forza、AC 系列、Trackmania、RBR），或取自投影到車軸上的世界速度（EA WRC、DiRT、BeamNG），或取自車頭方向與路徑的夾角。車子是否在空中，則由它的輪胎接地、負荷或懸吊判斷。見 `src/race/derive.ts`。

如果某款遊戲的世界是左手座標系（Forza 就是），賽道在檢視器中會被鏡像。圈速中的方向盤與懸吊資料會顯示這一點；**賽車分析** 分頁會提議反轉一個軸。座標系未有文件記載的遊戲（RBR、BeamNG、Trackmania）也以同樣方式處理：量測，而不是假設。

除了行駛通道之外，紀錄工具還會保留每款遊戲額外提供的資料：AC 系列的 ABS 與循跡控制作動、煞車分配、DRS、維修區速限器、增壓，以及煞車片與煞車碟的壽命；iRacing 的輔助設定、煞車分配、燃油、機油與水溫，以及它以自己名稱記錄的其他所有通道。檢視器會依據它的通道表來繪製這些資料，包括指示燈、等級、圖示與圖表，所以多記錄資料不需要修改檢視器。
