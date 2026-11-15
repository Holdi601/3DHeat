---
title: "轉換器保留所有資料"
parent: "匯入資料"
nav_order: 8
lang: "zh-Hant"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# 轉換器保留所有資料

你不需要本頁也能開啟重播。本頁是寫給那些撰寫工具、把遊戲檔案轉換成 3DHeat 表格的人看的，也給想知道為什麼這些表格能保存這麼多資料的人看。

每一個把遊戲的重播、示範、紀錄或即時遙測轉換成檢視器能開啟之物的工具，都遵循同一條規則：

> **盡可能讀取來源中現在就能讀取的所有資料，並將其餘部分完整保留，使得之後不需要原始檔案也能再讀取。**

重播常常會在遊戲更新、重新安裝或磁碟已滿之後遺失，而即時資料流一旦送出就消失了。轉換器丟棄的東西會永遠失去；完整保留下來的東西，則可以在有人理解它的那一天被解碼。因此，轉換器從不決定什麼東西日後會有用：它會解碼能解碼的部分，並把其他每一則訊息、封包、事件、屬性或行，原樣保存在表格旁邊，同時在自己的輸出中說明每一類資料有多少被讀取、多少只是被保留。

本頁是所有轉換器共同遵守的慣例，適用於：War Thunder、World of Tanks、World of Warships 與 Squad 的重播轉換器、CS2 示範轉換器、背景監看程式（其 Dota 重播解碼器與每個即時介接器）、遊戲擷取工具的遙測讀取器，以及檢視器自己的匯入功能（Tacview ACMI、OCAP、GPX/KML/IGC/FIT/NMEA）。檢視器自己的讀取器說明於 [Tacview 錄影](tacview-acmi.md)與[載入檔案](loading-files.md)；單一檔案的形式見[每個檔案一場對戰](container.md)。一場對戰會變成一個表格、一份 `match.json` 與附屬檔，並可選擇打包成一個 `.3dheat` 檔案。每個工具的 README 都有一個**完整性**（Completeness）章節，列出該來源中哪些已讀取、哪些以原樣保留，以及哪些無法取得，並說明原因。

## 每項資料的三個去處 {#three-homes-for-every-item}

來源中的所有資料，都只會落在下列三個去處之一：

| 去處 | 放什麼 |
|---|---|
| **已解碼** | 表格（每個樣本或事件一列，檢視器會讀取的欄位，以及屬於某列的其他每個數值的額外欄位），以及對戰文件 `<match>.match.json`（屬於整場對戰的所有內容：設定、名單、結果、計分板、自我檢查）。 |
| **原樣保留** | 表格旁的附屬檔：每一項未被解碼、或只被部分解碼的資料，完整且未經改動地保存，並附上其類型、時間，以及它所屬的單位或實體。 |
| **無法取得** | 在 README 的完整性章節中列出並說明原因：格式本身不包含它（用戶端重播沒有其他玩家的輸入）、來源從不傳送它，或不被允許讀取它（受保護的程序，或一個金鑰不屬於我們使用的加密區塊）。 |

**部分**解碼的項目，會同時被解碼*並且*原樣保留：表格取得能理解的部分，附屬檔保存整個項目，因此日後有更好的解碼器時，就不需要原始檔案。

沒有第四個去處。因為看起來沒用、因為「大概」是重複、或因為太大而丟掉某項資料，都是錯誤。精簡只允許在表格中進行（例如以每秒 2 次而非 60 次記錄攝影機），附屬檔中絕不允許。

## 附屬檔 {#sidecars}

附屬檔是放在表格旁邊的 Parquet 檔案，以表格為名：

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` 是下表中的一個字。新的轉換器會選擇最符合的字，或在此新增一個字**並且**加入到 [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts) 中的 `SIDECAR_PARQUET`，使檢視器在載入整個資料夾時將其略過。

| `<what>` | 保存內容 | 使用者 |
|---|---|---|
| `messages` | 網路串流中的封包、實體方法呼叫與屬性更新，完整保存 | War Thunder、World of Tanks、World of Warships |
| `flight` | 每架飛機的飛行模型條目，完整保存 | War Thunder |
| `packets` | 完整的畫面與網路訊息，或實體串流之外的容器區塊 | CS2、Dota 2、Squad |
| `events` | 遊戲事件及其所有鍵，依解析器提供的原樣 | CS2 |
| `entities` | 實體與屬性更新、遠端呼叫、開啟與關閉的頻道，以及解碼器所需的匯出資料 | Squad、Dota 2 |
| `props` | 解析器讀取的每個實體屬性，每次變動時記錄 | CS2 |
| `units` | 位置表格之外的每單位狀態 | Dota 2 |
| `combatlog` | 戰鬥紀錄，每筆項目的每個欄位 | Dota 2 |
| `strings` | 每個字串表的每個條目 | CS2、Dota 2 |
| `objectives` | 佔領區與目標，每次變動及其時間 | War Thunder |
| `raw` | 即時資料流：收到的每個封包、每行紀錄、每份 API 文件或記憶體讀取，完整保存 | 監看程式的工作階段（`heat.raw.parquet`）、遊戲擷取工具的單圈錄製器（`<stamp>_<game>.raw.parquet`），以及監看程式的 osu!、LoL 與 Valorant 重播檔案 |

檢視器在載入資料夾時，會略過本表中每一個 `*.<what>.parquet`，以及每一個 `*.match.json`、`*.meta.json`、`*.summary.json` 與其他 JSON 附屬檔；若單獨開啟其中一個（只選取或拖放該檔案），則會像任何其他表格一樣載入（見[載入檔案](loading-files.md)）。

以上是轉換器加上 `--loose` 參數時寫出的檔案。預設情況下，War Thunder、CS2 與 Tacview 轉換器會把一場對戰的表格、文件與附屬檔，以相同的名稱打包成一個檔案 `<match>.3dheat`（見[每個檔案一場對戰](container.md)）；本頁所述的一切，對每個成員都成立。

### 欄位 {#columns}

每個附屬檔的每一列是一個項目。欄位依序如下，只列出適用的部分：

| 欄位 | 類型 | 內容 |
|---|---|---|
| `time` | float64 | 與表格的 `time` 相同時鐘上的秒數（若來源計算的是 tick，則為 `tick`；兩者皆有時兩者都列） |
| `type` | string（字典） | 這個項目是什麼，以來源自己的用語表示：封包類型、訊息 ID、事件名稱、屬性路徑、行前綴 |
| `name` | string（字典） | 若已知，其名稱（社群名稱、類別名稱），否則為空 |
| `entity` / `unit` / `uid` / `player` | 整數或字串 | 它屬於誰，使用與表格相同的 ID，因此附屬檔的一列可以與某條軌跡相連 |
| `decoded` | string（JSON） | 對該項目的理解內容，若有的話；否則為空 |
| `payload` | binary | 項目的位元組，完整且未經改動（二進位來源） |
| `text` | string | 項目的文字，完整且未經改動（文字來源：一行紀錄、一個 JSON 物件、一個鍵值區塊） |

允許加入其他欄位（位元偏移、大小、頻道）。重複出現的字串採字典編碼，檔案以 zstd 寫入，因此附屬檔只佔重播本身大小的一小部分。

附屬檔必須能單獨足夠使用：之後撰寫的解碼器讀的是附屬檔，而不是原始重播。若某項目若沒有上下文就無法理解（實體的類別、字串表、某個訊息所參照的鍵），則上下文也會一併放入附屬檔，或放入對戰文件中。

### 即時來源 {#live-sources}

即時介接器（UDP 遙測、共享記憶體、遊戲紀錄、本機 API）根本沒有可以回頭讀取的檔案。它們會記錄**來源傳送的每一個欄位**，即使目前還沒有任何東西使用它們：

- 封包資料流：每個封包完整保存，`payload` 為其位元組，`type` 為其封包 ID 或格式，並以其到達的速率記錄；
- 共享記憶體或輪詢式 API：每次讀取的每個欄位，可為具名欄位，或將整個區塊以 `payload` 保存，並以介接器讀取的速率記錄；
- 紀錄檔：每一行，`text` 為該行，`type` 為該行的種類，包括介接器不會採取行動的行。

這些會寫入與該工作階段表格相鄰的 `<session>.raw.parquet`。檔案的大小是遵守此規則的代價；它是靠 zstd 與字典編碼來控制的，而不是靠省略資料。

## 自我檢查 {#the-self-check}

每個轉換器都會把一個 `completeness` 區塊寫入其對戰文件（若沒有對戰文件，則寫入工作階段的 `meta.json`，或摘要），位於 `selfCheck` 之下：

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| 欄位 | 意義 |
|---|---|
| `seen` | 來源中此類型的項目數 |
| `decoded` | 完整讀入表格或對戰文件 |
| `partial` | 部分讀入表格或文件，並完整保存於附屬檔中 |
| `raw` | 僅完整保存於附屬檔中，未被解碼 |
| `lost` | `seen - decoded - partial - raw`：必須為 0 |

最上層的 `lost` 是各類型的總和。轉換器的測試會斷言其在合成樣本上為 0，而 README 則說明其在真實樣本上的數值。非零的 `lost` 表示轉換器承認它破壞了規則；它會指出類型，以便找出缺口。

「類型」採用來源自己的分類：封包類型、訊息 ID、事件名稱、屬性群組、行的種類。它們是在轉換器遇到時計數的，而不是依據預期會遇到的清單，因此沒有人預料到的類型，也會以其計數顯示出來，而不會消失。

## README 的完整性章節 {#the-readmes-completeness-section}

每個轉換器的 README 都有一個標題為**完整性**（Completeness）的章節，其中包含三個清單：

- **已讀取**：哪些內容進入表格與對戰文件，以及每個新欄位是如何與獨立來源核對的（遊戲本身的數字、第二個來源，或為此目的而做的錄製）。
- **原樣保留**：哪些內容在哪個附屬檔中、屬於哪個 `type`，以及目前對它已知的資訊。
- **無法取得**：來源沒有攜帶或不被允許讀取的內容，以及原因。

它會連回本頁。

## 各轉換器的現況 {#where-each-converter-stands}

| 轉換器 | 附屬檔 | 其完整性章節 |
|---|---|---|
| War Thunder 重播 | `messages`、`flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars)（其自我檢查計數位於 `counts` 之下；`completeness` 區塊待補） |
| World of Tanks 重播 | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships 重播 | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad 伺服器示範 | `entities`、`packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 示範 | `events`、`props`、`strings`、`packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 重播（監看程式） | `packets`、`entities`、`strings`、`units`、`combatlog` | [Dota 2 重播](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!、LoL、Valorant 重播（監看程式） | `raw` | [監看程式文件](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs)中的各自頁面 |
| 即時介接器（監看程式） | `raw` | [監看程式文件](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs)中每款遊戲的頁面，以及 `Session.raw` 的[開發說明](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) |
| 單圈錄製器（遊戲擷取） | `raw`，以及 Forza 單圈檔案中的 `unparsed` 位元組 | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| 檢視器自己的匯入 | 無：見下文 | 本頁 |

### 檢視器自己的匯入 {#the-viewers-own-imports}

Tacview ACMI、OCAP 與 GPS 格式，都是在瀏覽器中從使用者自己的檔案讀取的；檢視器不保存其中任何東西，因此檔案本身就是紀錄。它們仍會盡可能多地讀取：

- **Tacview ACMI**（`src/data/acmi.ts`）：每一個帶有位置的物件行是一列，帶有錄影所攜帶的每個屬性；每個事件是一列；每次移除是一列；錄影本身的屬性（附帶標頭的 FileType 與 FileVersion）會以 `RecordingInfo` 出現在每一列上；註解行是一個 `Comment` 事件，從未取得位置的物件是一列 `Unplaced`，位於參考點上，而只要任何一列有 U/V，它們就會成為欄位。沒有位置的屬性行會被部分讀取：其數值會到達該物件的下一列，而不是在其自己的時間點出現。`AcmiTable.completeness` 會依種類計算檔案的行數。
- **OCAP**（`src/data/ocap.ts`）：每個實體的畫面、射擊、標記、每種事件類型（未知類型以「Mission」列出其文字），以及文件自己的欄位（`Info`）。尚未讀取：除標頭所列之外的實體欄位與尾隨的位置元素（較新紀錄器新增的內容），以及陣亡單位在死亡後重複的畫面（刻意精簡：其中沒有任何變化）。
- **GPS 格式**（`src/data/geoTracks.ts`）：定位點、其時間、高度、航向與速度，以及檔案有紀錄時的心率、踏頻、功率、溫度、衛星數、HDOP 與氣壓高度。尚未讀取：GPX 與 KML 的其他擴充、位置以外的 NMEA 語句、定位點與其擴充以外的 IGC 記錄，以及除記錄（圈、工作階段、裝置資訊）以外的 FIT 訊息。

列出這些缺口是為了把它們補上，而不是為了替它們辯解；檢視器對已載入錄影的匯出（`src/data/exportRecording.ts`）只寫入實際讀取到的內容。

## 新增轉換器 {#adding-a-converter}

1. 列出該格式所包含的內容，依據其文件、其自身的結構，或透過計算真實樣本中每一種訊息類型。這份清單就是自我檢查的 `types`。
2. 解碼目前能核對的部分。每個新欄位在進入表格之前，都必須先與某個獨立來源核對；尚無法核對的欄位則保持原樣。
3. 將其餘內容完整保存在上述命名規則的附屬檔中，並使用上述欄位。
4. 寫入 `completeness` 區塊，並撰寫測試確認其 `lost` 為 0。
5. 撰寫 README 的完整性章節，並連結回本頁。
6. 若附屬檔的 `<what>` 是新的，請將其加入上方的表格，以及 `src/data/filePick.ts` 中的 `SIDECAR_PARQUET`。

轉換器採乾淨室（clean-room）方式撰寫：只依據格式、文件與樣本，絕不參照 GPL 或 AGPL 程式碼。真實重播的樣本只留在製作它們的電腦上；測試使用合成檔案。

