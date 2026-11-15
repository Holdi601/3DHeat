---
title: "載入單圈"
parent: "賽車分析"
nav_order: 51
lang: "zh-Hant"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# 載入單圈

單圈檔是一次駕駛的紀錄：車子在哪裡、駕駛做了什麼，每秒記錄很多次。載入同一條賽道的兩圈或以上，**賽車分析**分頁就能比較它們。

![賽車分析分頁的「單圈」區段，已載入三個示範圈：單圈列表、參考圈星號與焦點圈](../assets/img/en/race-loading-laps-list.webp)

## 第一次載入單圈 {#your-first-laps}

1. 打開**賽車分析**分頁。
2. 只是想看看？按下**示範圈**（見[示範圈](#demo-laps)）。
3. 要載入自己的單圈：用記錄工具在遊戲中錄下（見[檔案格式](#file-formats)）。記錄工具會每圈寫一個檔案。
4. 按下**載入單圈檔案…**，選取兩個或以上同一條賽道的檔案；或按下**資料夾…**，選取存放這些檔案的資料夾。你也可以把檔案或資料夾拖放到 3D 視圖上。
5. 在列表中點選一圈，就能看到它在哪裡損失時間。

**警告：單圈是一次只比較一條賽道。** 載入另一條有名稱的賽道的單圈，會清除目前已載入的單圈。

## 按鈕 {#the-buttons}

| 控制項 | 功能 |
|---|---|
| **載入單圈檔案…** | 檔案選擇器，可一次選取多個 `.json`、`.csv`、`.txt`、`.ibt`、`.gz` 與 `.h3dcars` 檔（`.h3dcars` 是車輛檔，見[車輛](race-replay-and-scene.md#the-cars)） |
| **資料夾…** | 資料夾選擇器：資料夾及其子資料夾中的每個單圈檔 |
| **示範圈** | 一條虛構賽道上的三個虛構單圈（見[示範圈](#demo-laps)） |
| **清除** | 移除所有單圈（載入單圈後才會顯示） |
| 拖放到視圖上 | 拖放到 3D 視圖上的檔案與整個資料夾，載入方式相同 |

單圈會**加入**到已載入的單圈中——**除非它們屬於另一條有名稱的賽道：那時會先清除已載入的單圈**（單圈一次只比較一條賽道）。無法讀取的檔案會列在按鈕下方，每個一行；其餘的檔案仍會載入。

## 檔案格式 {#file-formats}

檔案格式是依內容判斷，而不是依檔名。白話來說：

- **heat3d-lap** 是 3DHeat 記錄工具對大多數遊戲寫出的檔案。
- **FH Companion** 是一個免費工具，用來記錄 Forza Horizon 的單圈。它會寫出一個單圈檔，旁邊還有一個 `.json.tele.gz` 檔（同一圈加上每個輪胎的資料，並以 gzip 壓縮）。請兩個一起選取。
- **iRacing `.ibt`** 是 iRacing 自己的遙測檔；在車內按 Alt+L 開啟記錄，然後原樣載入該檔案。
- **單圈 CSV** 是純文字表格，每一列代表一個時間點。

| 格式 | 典型來源 | 讀取方式 |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...`（Forza Horizon 與 Motorsport 透過 Data Out、AC / ACC / AC EVO / AC Rally、EA SPORTS WRC、DiRT Rally 2.0 / 1、DiRT 4、Richard Burns Rally、BeamNG.drive） | `fromHeat3dLap` |
| FH Companion 單圈 `.json` | FH Companion 的單圈庫 | `fromFhCompanion` |
| FH Companion 遙測 `.json.tele.gz` | 每個 FH Companion 單圈檔旁邊 | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing 自己的遙測檔（在車內按 Alt+L 開啟記錄） | `readIbt` |
| 單圈 CSV | `heat3d_capture laps`、Trackmania 外掛，或任何含有 `x`、`z`、時間欄位，並可選擇性含有 `lap` 欄位的 CSV | `fromCsv` |

每款遊戲如何記錄、送出什麼資料，記錄工具都有說明：[GameCapture：遊戲](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)，以及[GameCapture：單圈格式](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)。另請參見[其他賽車遊戲](other-games.md)。

## 資料夾與賽道 {#folders-and-courses}

**資料夾…**，或拖放的資料夾，會載入其下的所有檔案。在資料夾內，只會考慮副檔名為 `.json`、`.csv`、`.txt`、`.ibt` 或 `.tele.gz` 的檔案；不是單圈的 `.json`（例如賽道本身的檔案或其地圖），會被略過，且不會出錯。

**一次選取中包含多條賽道。** FH Companion 的單圈庫會把每條賽道放在名為 `<賽道名稱> (course_<x>_<z>_to_<x>_<z>)` 的資料夾中（未命名的賽道則只是 `course_...`）。若選取的檔案分布在一個以上這樣的賽道資料夾中，則什麼都不會載入；取而代之的是，**單圈**區段會顯示「這些是 N 條賽道的單圈，單圈一次只比較一條賽道。請選一條：」，並列出每條賽道與它的單圈數（副檔名為 `.json`、`.csv` 或 `.ibt` 的檔案，不計 `course.json`），單圈最多的排在最前面。點選其中一條，即可載入該賽道的檔案。

賽道是以其名稱與**起點**來識別，而不是終點。FH Companion 會把未完成的跑圈，以相同的名稱與起點保存在 `unfinished/` 中，並以它們停下的地方作為終點；這些跑圈會跟著它們的賽道走，並在列表中標示為**不完整**。

**選取的檔案中包含多條賽道。** 當直接選取的檔案（不是從賽道資料夾選取）屬於一個以上有名稱的賽道時，會為每條賽道提供同樣的選擇；沒有賽道名稱的單圈，會跟著所選的那條賽道一起載入。

## 車輛名稱 {#car-names}

單圈會以遊戲提供的完整車輛名稱來稱呼。若單圈檔沒有寫出車輛名稱：

1. **資料夾。** FH Companion 的單圈庫會把單圈放在
   `<賽道>/<等級>/<車輛名稱> '<yy> (car<number>)/<調校>/<標籤>/<單圈>.json` 這樣的資料夾結構中。最內層符合 `<名稱> (car<number>)` 的資料夾，會提供名稱與編號；只符合 `car<number>` 的，則只提供編號。只有選取資料夾或拖放資料夾時，才會帶有這個路徑。
2. **同一台車的其他單圈。** 一旦有任何單圈寫出了車輛名稱，同一遊戲與同一車輛編號的每一圈，都會使用這個名稱——包括一起載入的單圈，以及之後在這個瀏覽器中載入的單圈：這些名稱會保存在 `localStorage` 中，鍵值為 `heat3d.carNames`（格式為 `<遊戲>:<車輛編號>`）。在無痕視窗中，它們只會保留到單圈被移除為止。
3. 否則就用 「car 1234」（以編號表示），或只寫「car」。

**標籤。** 在單圈列表中，每一圈會顯示它的車輛名稱；同一台車的多圈會編號為「名稱 #1」、「名稱 #2」。分析中的句子在名稱唯一時使用相同的標籤；若不唯一，則使用車輛名稱加上圈速，寫成「名稱 (1:29.616)」（時間為範例），若仍不唯一，則再加編號。

**分組。** 當車輛編號（若沒有編號，則為名稱）與表現指數都相同時，單圈會被歸為同一台車（用於包絡線、設定檔與比較）（`carKey`）：同一款車但不同調校，會被視為不同的車。

**等級。** 一圈的表現等級由遊戲提供（Forza 為 D..X，iRacing 則為車輛等級的簡稱）；統計時依 D、C、B、A、S1、S2、R、X 排序，其他的則依字母排序。

## 示範圈 {#demo-laps}

**示範圈**會載入一條虛構賽道上的三個單圈（四段直線與四個右彎），由一個簡單的車輛模型產生（[`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)）：每個彎道的抓地限制速度、一次向前的加速計算，以及一次向後的煞車計算，就像圈速模擬器那樣。

| 單圈 | 車 | 失誤 |
|---|---|---|
| 乾淨的 | 抓地車 | 無 |
| 有失誤的 | 抓地車 | 在 T2 提早 35 m 煞車，在 T3 出彎時晚 30 m 踩油門，以 0.88 倍速度通過 T4，並向一側偏了 1.2 m |
| 另一台車 | 動力車 | 無；向另一側偏了 1.2 m |

| 車（編號） | 抓地 | 煞車 | 牽引 | 功率/質量 | 空氣阻力 |
|---|---|---|---|---|---|
| 抓地車（9001） | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| 動力車（9002） | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

有失誤的那一圈會成為焦點。這條賽道的排列方式與 Forza 保留其世界的方式相同（左手座標系），因此——就像真實的 Forza 單圈一樣——它會呈現鏡像，而分頁會提供**反轉 X**。三個單圈都帶有每個輪胎的資料，因此分頁的每個部分都有內容可以顯示。

## 單圈列表 {#the-lap-list}

每一列由左到右，依序為：

| 元素 | 功能 |
|---|---|
| ● / ○ | 顯示或隱藏該圈（線條、車、卡片、圖表）；隱藏的圈仍會被分析 |
| 色條 | 該圈的顏色 |
| 名稱與標籤 | 點選即可**設為焦點**；滑鼠移上去可看它的來源檔案與車輛（名稱 · 等級 PI · 傳動方式） |
| ⌖ | 用攝影機追逐這台車（再按一次停止） |
| ★ | 以這一圈為基準比較所有圈（設為參考圈）；參考圈本身會停用 |
| × | 移除該圈 |

**標籤：** *reference*（參考圈）；在多個等級時，等級中最快的那一圈會標示 *best of X*（或 *best of its class*，即「該等級最佳」）；未到達終點的跑圈會標示 *partial*（不完整）。

**第二行：**等級（只有在多個等級時才顯示）、圈速（`1:29.616`）、與它比較的那一圈（等級中最佳的，或參考圈）之間的差距，以 `+0.512` 表示（範例）；若該圈比參考圈的起點晚 10 m 以上開始，則顯示*起跑較晚*。

單圈超過 8 圈時，會出現「已畫 N / M」的提示，並提供**全部顯示**（畫出每一圈：較慢，而且線條會纏在一起）與**只顯示正在查看的**（參考圈、焦點圈與它所屬等級中最佳的那一圈；統計無論哪種方式都會計算所有圈）。

列表下方：若單圈表示繪圖是鏡像的，會出現鏡像提示（見[鏡像的世界](race-replay-and-scene.md#mirrored-worlds)）；若有兩圈或以上，會出現提示「點選一圈即可看它在哪裡損失時間……」；若有多個等級，還會說明每一圈都會與它自己等級中最快的那一圈比較。

### 參考圈與焦點 {#reference-and-focus}

- **參考圈：**其他每一圈都會對齊它，預設也與它比較的那一圈。除非使用者以 ★ 另外選定，否則就是最快的**完整**圈（若沒有完整圈，則為第一個載入的圈）。移除參考圈後，會回到自動選擇。
- **焦點：**顯示其發現、車輛控制與地圖的那一圈。若使用者選定了它，就一直保持；否則就是參考圈以外**最慢**的那一圈（「最值得學習」）。將某一圈設為焦點，也會讓它重新顯示，並讓它所屬等級中最佳的那一圈也顯示。將參考圈設為焦點，會將它與各彎道中最快通過的其他圈比較。
- **等級：**若單圈有多個表現等級，每一圈都會與它自己等級中最快的完整圈比較（參考圈，在參考圈的等級中）。見[賽道統計](race-course-statistics.md)。

### 顏色 {#colours}

每一圈都會依其在載入順序中的位置，取得自己的顏色，因此即使其他圈被隱藏，它的顏色也不會改變。色相會依熱圖團隊模式分組的方式，平均分布在色環上；而每個色位的明度（OKLCH 中為 0.52 到 0.66）與彩度（0.12 到 0.18），會選在與相鄰色位（最後一個與第一個也互相比較）之間，於一般、紅綠色弱（protan）與藍綠色弱（deutan）的視覺下，都盡可能拉開的數值，並且每一色在深色圖表背景上的對比度都至少為 3:1。

## 給開發者 {#for-developers}

程式碼：[`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts)（`loadLapFiles`）、[`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts)、[`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts)、[`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts)。

### 每種格式如何讀取 {#how-each-format-is-read}

每一種格式最後都會變成一個 `LapTrace`：使用統一名稱的通道（`time`、`distance`、`x`、`y`、`z`、`speed`、`throttle`、`slipRatio.FL` ……，見[通道表](race-charts-and-hud.md#the-channel-table)）、車輛、圈速、是否為完整圈，以及一個 `meta` 區塊。對每種格式，`time` 與 `distance` 都會平移到從 0 開始；若來源沒有 `speed`，則以相鄰樣本的距離除以時間來推算。

#### heat3d-lap JSON {#heat3d-lap-json}

一個包含 `"format": "heat3d-lap"` 的 JSON 物件。讀取的欄位：

| 欄位 | 用途 |
|---|---|
| `channels` | 以統一名稱為鍵的通道陣列物件，每個通道一個陣列；每個輪胎的通道以 `name.FL`、`name.FR`、`name.RL`、`name.RR` 表示。`time`、`x` 與 `z` 為必填 |
| `car.carOrdinal`、`car.name`、`car.carClass`、`car.carPI`、`car.drivetrain` | 車輛：編號、名稱、Forza 等級索引（0 D、1 C、2 B、3 A、4 S1、5 S2、6 X）、表現指數、傳動方式代碼（0 前驅、1 後驅、2 四驅） |
| `lap.seconds` | 圈速；若沒有，則取最後一個 `time` 值 |
| `lap.complete` | `false` 表示不完整的跑圈；其他值都視為完整 |
| `game`、`track` | 名稱；`game` 決定其類別（見下文） |
| `units.slipRatio` / `units.slipAngle` | 滑移的縮放方式：單位中含有 `raw` 代表 `scaled`，含有 `normalised` 代表 `peak`，其他則為 `physical` |
| `meta` | `slip`、`surface`、`discipline` 若有給出，會覆寫上述判斷 |

沒有 `distance` 通道時，距離會由 3D 位置加總而來。

#### FH Companion 單圈檔 {#fh-companion-lap-files}

一個 JSON 物件，含有一個 `Lap` 物件，內有 `samples` 陣列（約每 5 m 一個樣本）。欄位對應如下：

| FH Companion | 通道 |
|---|---|
| `Metres`、`Seconds` | `distance`、`time`（平移，使單圈從 0 開始） |
| `X`、`Y`、`Z` | `x`、`y`、`z` |
| `Speed`、`Throttle`、`Brake`、`Steer`、`Clutch`、`HandBrake`、`Gear` | 相同，改為小寫 |
| `LatG`、`LongG` | `latAcc`、`longAcc`（單位為 m/s²，雖然名稱是 G） |
| `Puddle` | `puddle` |

車輛來自 `Lap.carOrdinal`、`Lap.carName`（僅較新的檔案）、`Class`（或以 `Lap.carClass` 作為 Forza 等級索引）、`Lap.performanceIndex`、`Lap.drivetrain` 與 `Lap.peakKilowatts`；圈速來自 `Lap.lapSeconds`；`EndedAtFinish: false` 的跑圈為不完整。遊戲為 `forza-horizon`。

這些檔案沒有輪胎資料，也沒有航向，因此單靠它們無法判斷鎖死、輪胎空轉與側滑；但推擠（由方向盤相對於路徑判斷）與碰撞、撞車仍可判斷。請也一併選取每個檔案旁的 `.tele.gz`，以取得其餘資料。

#### FH Companion 遙測（`.json.tele.gz`） {#fh-companion-telemetry-jsontelegz}

經 gzip 壓縮的 JSON `{ version, columns, data }`：一圈中 Forza 的完整 Data Out，每個封包一列，使用遊戲自己的欄位名稱。欄位是依名稱查找，從不依位置。格式 2 會保留每一個封包（約每秒 110 個，而遊戲是 64 個 tick）；若某列在記錄工具自己的時鐘（`t`、`metres`）以外，與前一列完全相同，就會被丟棄，因此一圈會以遊戲的每秒 64 列讀取。（載入按鈕的提示文字就是這樣說的：「每個輪胎的滑移，64 Hz」。）

| Data Out 欄位 | 通道 |
|---|---|
| `t`、`metres` | `time`、`distance` |
| `PositionX/Y/Z` | `x`、`y`、`z` |
| `Yaw`、`Pitch`、`Roll` | `yaw`、`pitch`、`roll` |
| `VelocityX/Y/Z` | `latVel`、`vertVel`、`longVel`（車身座標：x 向右、y 向上、z 向前） |
| `AccelerationX/Y/Z` | `latAcc`、`vertAcc`、`longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`、`CurrentEngineRpm`、`Gear`、`Power`、`Torque`、`Boost`、`Fuel` | `speed`、`rpm`、`gear`、`power`、`torque`、`boost`、`fuel` |
| `Accel`、`Brake`、`Clutch`、`HandBrake` | `throttle`、`brake`、`clutch`、`handbrake`，由 0..255 換算為 0..1 |
| `Steer` | `steer`，由 -127..127 換算為 -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`、`TireSlipAngle<Wheel>`、`TireCombinedSlip<Wheel>` | `slipRatio.<W>`、`slipAngle.<W>`、`combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`，由華氏換算為攝氏 |
| `WheelRotationSpeed<Wheel>`、`WheelInPuddle<Wheel>`、`WheelOnRumbleStrip<Wheel>`、`SurfaceRumble<Wheel>` | 每個輪胎的 `wheelSpeed`、`puddle`、`rumble`、`surfaceRumble` |

`<Wheel>` 為 `FrontLeft`、`FrontRight`、`RearLeft`、`RearRight`，對應 `FL`、`FR`、`RL`、`RR`。滑移標記為 `peak`（Forza 的正規化滑移：超過 1 時，輪胎已失去抓地力）。

**配對。** 單圈檔 `<lap>.json` 與 `<lap>.json.tele.gz` 若一起選取或一起拖放（路徑相同，只差 `.tele.gz`），就會合併成**一圈**：使用遙測檔的通道，搭配單圈檔的車輛、等級、圈速、賽道與不完整標記。若遙測檔本身有車輛名稱，則以它為準。單獨的 `.tele.gz` 也能載入：格式 2 的檔案包含 `car`（`ordinal`、`name`、`class`、`pi`）、`track` 與 `lapSeconds`；沒有這些資料時，圈速就是遙測的持續時間，車輛則不明。

#### iRacing `.ibt` {#iracing-ibt}

iRacing 的遙測檔會直接讀取（在瀏覽器中，不需要轉換）：112 位元組的標頭、32 位元組的磁碟子標頭、變數表（每個通道 144 位元組），以及工作階段的 YAML。

- **必要通道：**`SessionTime`、`Lap`、`Lat`、`Lon`。缺少時會顯示：「……沒有 SessionTime、Lap、Lat 與 Lon 通道——它是 iRacing 的遙測檔嗎？」
- **位置：**緯度與經度會依第一個非零定位點所在的切平面，換算成公尺（地球半徑 6 371 008.8 m）：x 向東、z 向南、y 為海拔（`Alt`）——因此在預設攝影機方向下，北方朝畫面上方。這不是賽道本身的座標系；若用已擷取的賽道模型，單圈就對不上。
- **單圈：**工作階段會在 `Lap` 改變的地方切開；只保留樣本數超過 60、起點低於 `LapDistPct` 5%、終點高於 95% 的單圈。不完整的單圈會被捨棄。若什麼都不剩，則顯示：「……沒有完整的 N 公里賽道單圈」（賽道長度來自 YAML），或「……沒有完整的單圈」。
- **距離：**從單圈起點算起的 `LapDist`；若沒有，則由位置加總而來。
- **車輛：**來自 `DriverInfo`：玩家的 `CarScreenName`、`CarID`（作為車輛編號）與 `CarClassShortName`（作為等級）。賽道則為 `TrackDisplayName`，若沒有則用 `TrackName`。

對應的通道：

| iRacing | 通道 | 換算 |
|---|---|---|
| `Speed`、`Throttle`、`Brake`、`Gear`、`RPM` | 相同名稱 | - |
| `Clutch` | `clutch` | `1 - v`（iRacing 記錄的是離合器的嚙合程度；本工具記錄的是踏板） |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax`（弧度，逆時針為負，換算為 -1..1，右為正；最大值至少為 0.1，若沒有則為 π） |
| `LatAccel`、`LongAccel`、`VertAccel` | `latAcc`、`longAcc`、`vertAcc` | - |
| `Yaw`、`Pitch`、`Roll`、`YawRate` | 相同，改為小寫 | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`、`dcTractionControl` | `absLevel`、`tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | 若大於 1.5，則除以 100 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`、`WaterTemp`、`OilTemp` | `fuel`、`waterTemp`、`oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | 胎體中段溫度 |
| `LFshockDefl` ... | `suspensionM.FL` ... | 阻尼器變形量，m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0.145038（kPa 換算為 psi） |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

輪胎前綴：`LF` → FL、`RF` → FR、`LR` → RL、`RR` → RR。**其他每個**每個樣本只有一個值的通道（非位元欄位型別）都會以它自己的名稱保留下來——若以輪胎前綴開頭，則為每個輪胎（`RRspeed` 會變成 `speed.RR`）——因此圖表與卡片上的數值列表會提供它們全部。iRacing 不記錄輪胎滑移，所以車輛控制是以漂移角來判斷：`Yaw` 對照行進方向所得的角度，與車子實際去向的比較——以及方向盤相對於路徑的情況。只有在無法擬合航向時，才會使用橫擺角速度與側向加速度的比較，因此這時沒有漂移角（見[車輛控制事件](race-control-events.md)）。

錯誤訊息：「……太短，不是 .ibt 檔」、「……沒有 iRacing 遙測標頭」、「……沒有定位點」。

#### 單圈 CSV {#lap-csv}

每個樣本一列；同一個檔案中的多圈，會以 `lap` 欄位區分。分隔符號會從前五行自動偵測。可選的第一行 `# { ...json... }` 用來描述這次跑圈：`game`、`track`、`seconds`、`complete`、`meta`、`car`。

| 欄位（不分大小寫） | 通道 |
|---|---|
| `x`、`y`、`z` | 位置（`x` 與 `z` 為必填） |
| `elapsed` 或 `time` | `time`（每圈必填） |
| `metres` 或 `distance` | `distance`（否則由位置加總） |
| `speed_ms` 或 `speed` | `speed`（m/s） |
| `throttle`、`brake`、`steer`、`gear`、`clutch`、`handbrake`、`puddle` | 相同 |
| `lat_g`、`long_g` | `latAcc`、`longAcc` |
| 任何統一通道名稱，例如 `latVel`、`slipIndex.FL` | 其本身 |
| `lap` | 每一列屬於哪一圈 |
| `lap_seconds`、`car`、`car_class`、`pi`、`course` | 圈速、車輛編號、等級、PI、賽道（取自每圈的第一列） |

若沒有描述，遊戲會視為 `forza-horizon`，且每一圈都視為完整。當一個檔案包含多圈時，單圈的來源會顯示為 `<檔案> · <圈>`。錯誤訊息：「……沒有任何資料列」、「……沒有 x 與 z 欄位」、「……沒有含有時間欄位的單圈」。

#### 類別與地面 {#discipline-and-surface}

當單圈沒有說明時，分析會對它做以下假設（`lap.ts`）：

- **類別：**`meta.discipline`；若沒有，遊戲名稱符合 `rally|wrc|dirt|rbr` 者為**拉力賽**，`trackmania` 為**街機**，其他都是**賽道**。
- **地面：**`meta.surface`；若沒有，則依賽道名稱與來源判斷：名稱為 `monte` 的拉力賽為**混合**；`snow|ice|winter|arctic|sweden` 為**雪地**；柏油拉力賽（Spain／España／Catalunya／Costa Daurada、Croatia／Hrvatska、Central Europe、Germany／Deutschland、Japan、Corsica／Corse、Ypres，或字詞 tarmac／asphalt）為**柏油**；名稱中含有 `scramble|trail|cross country|dirt|gravel` 的，為**鬆軟路面**；其他拉力賽路段，則依車輛的駕駛方式判斷：在樣本中，速度超過 12 m/s、位於地面上（至少 200 個樣本），側向加速度第 95 百分位達到 10 m/s² 或以上，且在車輛過彎速度達到該值 70% 以上時（至少 30 個樣本），中位數漂移角低於 6°，即為**柏油**；其他情況，或資料不足無法判斷時，為**鬆軟路面**。非拉力賽但名稱含有 `rally` 的為鬆軟路面；其餘為柏油。
- 每個樣本若有 `loose` 通道（Forza 的路面震動、Trackmania 的材質，見[車輛控制事件](race-control-events.md#the-ground)），會覆寫該單圈的地面設定。
