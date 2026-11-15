---
title: "Tacview 錄影 (ACMI)"
parent: "匯入資料"
nav_order: 7
lang: "zh-Hant"
source: "tacview-acmi.md"
source_hash: "08423333214c"
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

## DCS 伺服器：誰獲勝，每次出擊如何結束 {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS 多人伺服器全天候用 Tacview 錄製它的任務，而持久型 PvP 伺服器會在許多任務之間進行一場戰役：一方奪下另一方的每個機場、FARP 和區域即獲勝，這需要好幾天和多次任務重新啟動。錄影記錄的是飛行，而不是戰役：沒有訊息說明誰奪下了什麼，機場只在開頭寫入一次，也沒有任何內容說明誰獲勝。Tacview 轉換器（`node tools/acmi-to-parquet.mjs`，[`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)）把能知道的內容加到每一列上，不能知道的就留空——它從不猜測。

| 欄位 | 意義 |
|---|---|
| `server` | 伺服器或戰役，取自錄影的標頭（其 Title、Author 和 Comments 會寫出已知的公開伺服器——Blue Flag、SPS Contention、Growling Sidewinder；否則取寫出某人名字的 Author）；`--server Name` 為整個資料夾命名。標頭沒有寫出任何伺服器的錄影——例如 Author 為 `Admin`，Title 和 Comments 不是任何已知伺服器寫的——不歸屬任何伺服器：`server` 為空，即使它是從某個伺服器的錄影頁面下載的也一樣，因為該頁面也可能包含其他社群的任務 |
| `mission` | 去掉版本號和戰役月份的錄影 Title：`Operation_Example_V7.7.99` 變成 `Operation Example` |
| `campaign` | 錄影所屬的戰役回合，依伺服器、地圖和編號：`Example Server North 3`。一份錄影就是一個工作階段（從一次重新啟動到下一次）；一個回合跨越許多工作階段，持續數天或數週 |
| `round` | 該回合的編號：伺服器公開編號時用伺服器自己的編號，否則是在該伺服器和地圖上見到的第 n 個回合；來自回合檔案（見下文），沒有回合檔案時為空 |
| `session` | 錄影在該回合各工作階段中的位置，1、2、...；`sessionStart` 是它的真實開始時間（Unix 秒） |
| `heldRed`、`heldBlue` | 工作階段開始時每一方佔有的爭奪地點，來自串連的回合檔案（見下文） |
| `won`、`matchWon` | 該列所屬一方（其 Color，Red 或 Blue）贏得該戰役時為 1，輸掉時為 0；沒有回合檔案寫明勝者時為空，中立的列也為空。一場戰役同時是回合和比賽，所以兩個欄位的值相同 |
| `roundEndReason` | 透過奪下一切而贏得的戰役為 `capture` |
| 回合每個工作階段上的 `won`、`matchWon` | 回合的結果，一旦知道回合結束，就寫在它的每份錄影上 |
| `sortie` | 在飛機的列上：它的飛行，從一次起飛到下一次起飛依序為 1、2、...；第一次起飛前和降落後的地面時間計入它所屬的那次飛行 |
| `sortieResult` | 那次飛行如何結束：`landed`、`landed damaged`（在空中被擊中後）、`ejected`、`shot down`、`destroyed`（在地面上）、`crashed`、`despawned`（在空中消失且看不到原因——玩家離開）、`airborne at end`、`no takeoff` |
| `sortieKills` | 該飛機在那次飛行中被記的擊殺數 |

在持久型伺服器上，出擊才是有意義的單位：依 `sortieResult` = `shot down` 篩選，可以看到在哪裡損失了飛行；也可以在[明細](breakdown.md)中依 `sortieResult` 或 `server` 拆分熱度。組成出擊的起飛、降落、彈射、擊殺和墜毀，是轉換器根據飛機的移動推算出的事件（見上文）。

在一個回合的兩個工作階段之間被奪下的地點——由回合檔案得知，見下文——是較晚那份錄影開頭的 `capture` 事件：`Object` 為 `(campaign)`，位於該地點，`Detail` 為 `Red to Blue, between missions`，`Inferred` 為 `between missions`。

在錄影中能看到換邊的機場或 FARP——以另一種顏色再次寫入，或者被移除後在五分鐘內以另一種顏色在原位置再次寫入——會成為該停機坪處的 `capture` 事件：`Event` = `capture`，`Airfield` 為其名稱，`Detail` 為 `Red to Blue`，`Coalition` 為其新的一方。第一次以某種顏色寫入的停機坪不算佔領。目前查看過的伺服器都只寫入一次停機坪，所以它們的錄影中沒有佔領。

### 回合檔案 {#rounds-files}

回合檔案依伺服器寫明它的戰役回合、誰贏得了它們，以及每個回合的工作階段。它來自伺服器公開的內容，或者來自錄影本身（見下文）。

誰贏得了一場戰役，是伺服器公開的內容——它網頁上的戰役日誌——而不是錄影裡的內容。回合檔案帶有這項資訊，轉換器用 `--rounds file.json` 讀取它（可以給出多個）：

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

一份錄影屬於其 `server` 下 `title`（一個正規表示式）與其 Title 相符的那些回合；每一列屬於其真實時間所在的回合——即錄影的 RecordingTime 加上該列的秒數，而不是任務在遊戲內的日期。時間均為 UTC。沒有勝者的回合（已輪換、仍在進行）會給它的列寫上回合編號和空的結果。

與比賽文件相對應的 `acmi` 頁尾會說明結果來自哪裡，就像 War Thunder 比賽的 `result.source` 那樣：`outcome.result` 是 `{ winner, round, endReason, source }`，`source` 是回合檔案的 `source`，沒有任何來源寫明勝者時為 `null`。`outcome` 還會列出錄影的回合、佔領，以及依結束方式統計的出擊：

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

在該戰役中，Blue 一方飛行員 `Viper 1 (F-16C_50) #a01` 的一列於是寫著：`server` Example Server，`round` 41，`won` 1，`roundEndReason` capture，`sortie` 2，`sortieResult` landed，`sortieKills` 1。

### 從錄影本身得出回合 {#rounds-from-the-recordings-themselves}

持久型伺服器在重新啟動之間保留它的戰役，每份錄影開頭都是雙方的地面單位和靜態物件，位於戰役留下它們的位置。`node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` 讀取每份錄影的最初幾分鐘（[`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)），把每個伺服器在同一張地圖上的錄影依時間排序，並把它們串連起來：

- **地點**：把地面分成約 2 km 的格子；工作階段開始時格子裡四分之三的單位屬於某一方，這個格子就歸這一方。*爭奪*地點是看到被雙方都佔有過的地點。
- **佔領**：在下一個工作階段開始時由另一方佔有的地點——在兩次任務之間被奪下，或在前一次任務期間被奪下。
- **新回合**：一個工作階段的地點與上一個相比，有超過 60% 不同——這是新回合的開局佈局，而不是舊回合的一步。伺服器換到另一張地圖時，回合也會結束（新地圖的工作階段在最後一個之後開始並繼續下去）。
- **誰獲勝**：對已結束的回合，是在其最後一個工作階段開始時佔有每個地點的一方（`capture`，信賴度高）；否則是佔有較多爭奪地點的一方（是對方兩倍時為中，否則為低；因換地圖而結束時為低）。未結束的回合沒有勝者，但每個工作階段都會說明開始時每一方佔有多少地點，所以能看出誰領先。
- 如果一個伺服器的所有工作階段開局都一樣，它在工作階段之間不保留狀態：不會被串連。

最後一個工作階段的開始可能比回合結束早好幾個小時，所以信賴度很重要。對照一個公開其勝者的伺服器檢查過：串連在公開回合開始的那個工作階段上找到了每一個新回合，並且在它能檢查的 9 個回合中，最後一次開始時領先的一方每次都是公開的勝者。`--official file.json` 保留這類伺服器公開的回合，並把串連得到的工作階段加進去；檔案中的 `validation` 說明串連吻合到什麼程度。在一個虛構的戰役中：

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### 把一個戰役回合當作系列觀看 {#watching-a-campaign-round-as-a-series}

把一個回合的錄影——`campaign` 相同的檔案——一起載入，檢視器就會把它們當作一個系列播放：依真實順序一個工作階段接一個工作階段播放，兩個工作階段之間的幾小時或幾天被縮短為一分鐘的間隔。時間軸用黃色標出每個工作階段的開始，用深色帶標出間隔，時鐘顯示正在播放哪個工作階段及其真實日期（`session 4/12 · 2026-11-02 12:38 UTC`）。熱度、重播、篩選和 **洞察** 在整個系列上的作用，與在任何已載入的資料上一樣。**對戰** 分頁的 **戰役回合** 區段列出各工作階段及其日期、每次開始時每一方佔有多少爭奪地點——也以整個回合的圖表顯示——以及在此之前被奪下了多少；點一下即可跳到某個工作階段的開始。單獨載入的錄影會在那裡說明它是哪個回合的哪個工作階段。一起載入的不同回合的錄影不構成系列：每一份都從零開始，就像各自獨立的比賽一樣。多場比賽載入器（**一次疊加多場比賽**）也會把一個回合當作系列播放，以串流方式載入並依 GPU 調整大小，適用於好幾 GB 的回合。

回合中易手的地點會以佔領區畫在地圖上，依正在播放的工作階段開始時佔有它的一方著色，並在工作階段交界處切換；每次易手都是重播事件清單中的一次佔領。這些地點是從已載入的列推算出來的——每個工作階段最初幾分鐘內的地面單位和靜態物件，依約 2 km 的格子，與串連的做法相同——所以需要完整載入器（多場比賽載入器保留的每列資料太少）。

**從回合中的一份錄影載入整個回合。** 在一般瀏覽器中，檢視器無法開啟你沒有選擇的檔案：請把回合的檔案一起載入。由本機檢視器伺服器（`npm run dev` 或 `npm run preview`）提供時，它就可以：在被 git 忽略的 `tools/local-data.json` 中加入一個 `campaigns` 項目，寫明回合檔案所在的資料夾和已轉換錄影所在的資料夾，單份錄影的戰役回合區段就會提供 **載入整個回合**，取得在那裡找到的該回合的各個工作階段，並用多場比賽載入器載入它們：

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

只提供回合檔案中寫明的錄影（`tools/campaign-files.mjs`）；在這些資料夾中找不到的工作階段只計數，不載入。

已知伺服器公開的內容：

| 伺服器 | 一個回合 | 一方如何獲勝 | 在哪裡能讀到勝者 |
|---|---|---|---|
| SPS Contention | 在一張地圖和一個時代上的一場戰役（數天），跨越多次重新啟動 | 奪下每個機場、FARP 和據點；沒有勝者就結束的戰役已被輪換 | 伺服器公開的戰役日誌（每場戰役的勝者、開始、結束） |
| Blue Flag | 跨越許多場 5 小時任務的一個戰役回合；Title 中的 `_YYYY_MM` 每次重新啟動前進一個月 | 奪下每個敵方陣地；較早的回合以固定時間後佔有較多的一方為勝者 | 至今沒有找到公開的形式；錄影的串連會追蹤每個回合，以及每次開始時誰佔有多少 |
| Growling Sidewinder | 一個開放衝突任務的一次執行（6 小時） | 奪下區域和機場 | 它的統計頁面顯示飛行員，而不是結果；每個工作階段開局都一樣，所以沒有跨越多個工作階段的回合：空 |
| 對抗 AI 的任務（奪取區域的任務） | 一次任務執行 | 玩家一方對抗任務的 AI：沒有 PvP 結果 | 空 |
| 未歸屬（標頭沒有寫出伺服器） | - | - | 空，`server` 也為空 |
