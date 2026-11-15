---
title: "Tacview 錄影 (ACMI)"
parent: "匯入資料"
nav_order: 7
lang: "zh-Hant"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview 錄影（ACMI）

Tacview 是一個在飛行模擬器中記錄飛行的程式；它的檔案副檔名是 `.acmi`。3DHeat 可以開啟這些檔案，讓你看到每一架飛機飛過的地方。

Tacview 的飛行錄影與任何表格一樣載入：選取或拖放一個 `.acmi`（文字檔、`.txt.acmi`，或壓縮檔 `.zip.acmi`），然後按下 **載入**。接著你會得到所有飛行的熱度；在 **對戰** 分頁中，則有一個包含圖示、軌跡與事件清單的重播（[對戰重播](match-replay.md)）。ACMI 是 Tacview 的公開檔案格式（[說明文件](https://www.tacview.net/documentation/acmi/)）；DCS（透過 Tacview 的匯出器）、IL-2 Great Battles、Falcon BMS、X-Plane、MSFS 等都會寫出這種格式，所以這裡能讀取它們的任何一種。

## 錄影會變成什麼 {#what-a-recording-becomes}

每次寫入物件位置時產生一列，物件所在位置的每個事件產生一列，物件離開時（`Removed`，即它最後所在的位置）產生一列。與尚未見過的物件有關的事件——例如書籤、發給所有人的訊息——會成為參考點上、物件為 `(recording)` 的一列。錄影本身帶有自己的讀取說明，所以對應步驟會自動填入。讀取器會寫出以下欄位：`Time`、`X`、`Y`、`Altitude`、`Object`、`Coalition`、`Heading`、`Pitch`、`Roll`、`Type`、`Name`、`Pilot`、`Group`、`Country`、`Color`、`Event`、`Latitude`、`Longitude`、`Recording`、`EventObjects`、`RecordingInfo`，之後再加上錄影中有的其他屬性。它們的用途如下：

| 欄位 | 用途 | 意義 |
|---|---|---|
| Time | 時間 | 錄影的 ReferenceTime 之後的秒數；若有 ReferenceTime，則為 Unix 秒數，所以時鐘會顯示真實時間。 |
| X、Y | 位置 | 東與北，以公尺為單位，位於與地球在錄影參考點相切的平面上：在其附近，距離與方位是真實的，在 100 公里處的漂移不到千分之一。北方會成為世界的 -Z。 |
| Altitude | 位置（向上） | 公尺。 |
| Object | 人員 | 飛行員與物件的名稱加上其 id，例如 `Viper 1 (F-16C_50) #a01`；無人物件則為 `(T-90A) #401`。 |
| Coalition | 隊伍 | 陣營（若沒有陣營，則為顏色）。 |
| Heading、Pitch | 視線 | 度數；航向 0 為北方。 |
| Recording | 工作階段 | 錄影的 Title，或檔案名稱：多個錄影並排載入時，它們的軌跡不會相連。 |
| Type、Name、Pilot、Group、Country、Color、Event、Roll、Latitude、Longitude | 過濾器 | 保留給過濾使用；Type 與 Name 決定每個物件的[圖示](figures.md)，Event 提供檢討的事件清單，Roll 讓飛機傾斜。 |
| U、V | | 遊戲自己的平面世界公尺數，前提是每個樣本都有（DCS 會寫入）。 |
| EventObjects | 過濾器 | 每個事件指名的所有物件（`Message|a01|b02|...`），依 id 列出。 |
| RecordingInfo | | 錄影在當時的自有屬性——DataSource、DataRecorder、Author、Category、Briefing、Comments……——以 JSON 格式保存。 |
| IAS、Mach、AOA、FuelWeight…… | 過濾器 | 錄影帶有的任何其他數值屬性。 |
| Parent、CallSign、LockedTarget、Label、Shape…… | 過濾器 | 錄影帶有的任何其他文字屬性；凡任何非數字值的屬性都視為文字。 |

Tacview 位置的四種形式（`lon|lat|alt`、含 `u|v`、含 `roll|pitch|yaw`，以及含全部且附航向）都會被讀取；空白欄位會保留上一個值。`-id` 會移除一個物件，移除後再次使用的 id 會成為新物件。跳脫的逗號與續行也會被處理。

位置一律由緯度與經度投影而來，絕不取自 U/V，所以來自每款遊戲的錄影，都與真實世界的背景共用同一種投影。
