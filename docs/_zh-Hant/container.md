---
title: "每場比賽一個檔案 (.3dheat)"
parent: "匯入資料"
nav_order: 9
lang: "zh-Hant"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# 每場比賽一個檔案：`.3dheat`

`.3dheat` 檔案是一整場完整的比賽，裝在一個檔案中，方便複製、保存或分享。要開啟它，只需把檔案拖放到來源面板上。

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

過去，一場轉換後的比賽是多個並排的檔案：表格 `<match>.parquet`、比賽文件 `<match>.match.json`，以及附屬檔 `<match>.<what>.parquet`（[轉換器保留所有資料](converters.md)）。`.3dheat` 檔案把它們全部裝進一個檔案裡：一次重播、一個檔案，方便複製、保存或分享。

它的設計使得載入一千個這樣的檔案，與載入散開的表格一樣快；而且之後的轉換器可以放入更多內容，而不需要新的格式。

## 載入 {#loading-one}

凡是能載入檔案或資料夾的地方，`.3dheat` 檔案也都能載入，而且一個資料夾可以混合容器與散開的檔案：

| 位置 | 從容器中讀取的內容 |
|---|---|
| **熱圖** 來源面板（檔案、資料夾、拖放） | 它的表格，如同它們是散開的 `<match>.parquet` |
| **熱圖 → 一次疊加多場比賽**（檔案、資料夾、新增資料夾） | 它的表格，由載入器的工作執行緒就地讀取 |
| **對戰** 分頁（載入，或拖放到視圖上） | 比賽文件 |
| **戰術板** 的遙測 | 它的表格 |

開啟容器時只會讀取其中兩個小部分：結尾的目錄與開頭的清單；表格的任何內容都要等載入器讀取時才會讀取。附屬檔與比賽文件只有在有人要求時才會讀取。若某個資料夾同時含有同一場比賽的散開檔與打包檔，只會載入一次。

## 打包與解包 {#packing-and-unpacking}

新的轉換預設會寫出容器：War Thunder 轉換器（`heat3d-wt-replay`）、CS2 轉換器（`heat3d_cs2 demos`）以及 Tacview 工具（`node tools/acmi-to-parquet.mjs`）。`--loose` 則保留散開的檔案。

先前已轉換，或由其他工具轉換的比賽，可以用以下指令打包：

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** 會在各資料夾下找出每一個表格 `<match>.parquet`，連同屬於它的檔案，並在旁邊寫出 `<match>.3dheat`。已打包的比賽會被略過。每個容器在其他任何事情發生之前，都會被完整讀回檢查（每個成員的 sha256、大小、CRC 與 Parquet 結尾區）；散開的檔案只有在指定 `--delete-loose` 時才會被刪除，而對於較早打包的比賽，只有當它們與容器所含內容逐位元組相同時才會刪除。若某場比賽有檔案在最近 `--settle` 分鐘內（預設為 10 分鐘）被變更，則會略過它：轉換器可能仍在寫入。
- **unpack** 會把各成員以散開的檔案寫回到容器旁邊。
- **update** 會新增或替換成員，而不必重寫容器中已有的表格（見下文）。
- **repack** 會完整重寫容器，捨棄更新後留下的內容。

## 格式 {#the-format}

`.3dheat` 檔案是一個 ZIP 封存檔（任何 ZIP 工具都能開啟），並遵守以下規則：

1. 寫入容器時，**`manifest.json` 為第一個成員**，且一律存在。它是透過 ZIP 中央目錄找到的，因此在 `update` 之後，它可能位於檔案較後的位置。
2. **以位元組範圍讀取或已經壓縮過的成員會以儲存方式保存**（ZIP 方法 0）：Parquet、Arrow、圖片、模型、音訊、影片、不透明的二進位資料。儲存的成員是容器中一段連續的位元組範圍，因此讀取器可以就地讀取表格的結尾區與其欄位區塊——在瀏覽器中以 `File.slice`，或以 HTTP 範圍請求——與讀取散開的檔案完全相同。
3. **文字會被壓縮**（方法 8）：JSON、CSV、純文字。這些檔案很小，會整個讀取。
4. 名稱為 UTF-8（旗標位元 11）、相對路徑、以 `/` 分隔，且不含 `..`；可以包含資料夾（例如 `analysis/heat.json`）。被打包的散開檔案會保留其原本的名稱，因此解包後會得到相同的檔案。
5. 超過 4 GiB 的成員，或成員數超過 65,535 的容器，會如常使用 ZIP64。寫入者不會在成員之後放置資料描述項。

目前轉換器寫入的成員，依此順序排列：

| 角色 | 成員 | 是否儲存 |
|---|---|---|
| `table` | `<match>.parquet` | 是 |
| `match` | `<match>.match.json` | 否（已壓縮） |
| `messages`、`flight`、`events`、`effects`、`objectives`、`packets`、`props`、`strings`，等等 | `<match>.<role>.parquet` | 是 |
| `summary` | `<match>.summary.json`，大量索引的摘要（[大量分析](mass-analysis.md)），由 `tools/3dheat-summarize.mjs` 加入 | 否（已壓縮） |

表格緊接在清單之後，因此讀取器對檔案開頭的第一次讀取，會同時涵蓋清單與表格的本地標頭。

### 清單 {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| 欄位 | 意義 |
|---|---|
| `format` | 一律為 `3dheat` |
| `format_version` | `major.minor`（見下文） |
| `game`、`source`、`converter`、`match`、`map`、`mode`、`started` | 這場比賽是什麼，以及由什麼產生；未知時為 `null` |
| `created`、`updated` | 寫入的時間、最後更新的時間（`updated` 只在更新後出現） |
| `roles` | 將每個角色對應到其第一個成員的名稱：快速索引 |
| `members` | 除清單之外的所有成員：完整清單，也是讀取器所信任的依據 |
| `matches` | 可選：含有多場比賽的容器中，各場比賽的資訊（見下文） |
| `references` | 可選：容器需要、但並未包含的檔案 |
| `extensions` | 可選：轉換器自己的中繼資料 |

每個成員：

| 欄位 | 意義 |
|---|---|
| `name` | 它在容器中的路徑 |
| `role` | 它的用途（見下文） |
| `media_type` | `application/vnd.apache.parquet`、`application/json`、`image/png`、`model/gltf-binary`、`audio/ogg`、`application/octet-stream`，等等 |
| `compression` | `stored` 或 `deflate` |
| `bytes` | 其大小，未壓縮 |
| `sha256` | 其位元組的雜湊值，未壓縮 |
| `rows` | 表格的列數 |
| `schema` | 它所遵循的慣例，`{ "id", "version" }`：文件自身的 `format` 與 `version`（`heat3d-wt-replay-match` 2）、讀取器透過其 `heat3d` 結尾區讀取的表格為 `heat3d-table`，Tacview 工具的表格為 `heat3d-acmi-table` |
| `match` | 在含有多場比賽的容器中，它所屬的 `matches[].id` |

### 為成長而設計 {#made-to-grow}

這個格式的目標，是能承載比今日豐富得多的重播，同時又不破壞現有的讀取器：

- **版本控制。** `format_version` 為 `major.minor`。讀取器會讀取其主版本下的每個次版本，並忽略它不認識的任何欄位。新增內容時次版本會增加；只有當版本配置改變、使舊讀取器會錯誤讀取時，主版本才會增加（例如成員不再被儲存、清單移出封存檔）。每個成員自身的慣例則在其 `schema` 中分開版本化，因此新的表格配置或新的文件版本不需要新的容器版本。最早寫出的容器寫的是 `"version": 1`；讀取器會把它視為 1.0。
- **角色是開放的。** 角色可以是任何字串。讀取器使用它們認識的角色，並保留其餘的：未知的角色會被列出，絕不會被拒絕，而 `update` 與 `repack` 會原樣保留它。一個角色可以有多個成員：多張表格（每個單位的軌跡、以其他頻率的遙測）、事件、語音、影片同步、關卡參考、圖示覆寫、分析結果。名稱可以包含資料夾。
- **任何媒體。** 成員可以是任何具有媒體型別的東西：Parquet、JSON、Arrow、PNG 或 JPEG 縮圖、glTF 模型、音訊、原始的二進位資料。
- **多場比賽。** 一個場次或一場錦標賽可以放在同一個容器中：`matches` 會列出它們（`{ "id", "map", "mode", "started", ... }`），而每個成員都會指名其 `match`。檢視器會載入角色為 `table` 的每個成員。
- **參考。** 容器需要、但並未包含的檔案（例如某場比賽的關卡），會在 `references` 中以名稱與 sha256 列出（`{ "kind": "level", "name": "...", "sha256": "..." }`），因此能找到並檢查正確的檔案，而不必把它複製到每一場比賽中。
- **擴充。** `extensions` 會把轉換器自己的中繼資料放在其專屬的鍵下，即 `"<vendor>/<name>": { ... }`，因此兩個轉換器絕不會衝突，共用欄位也不需要任何新增。
- **就地更新。** `update` 會新增或替換成員，而不必重寫龐大的儲存表格：新成員與新清單會附加在容器結尾之後，接著是新的中央目錄。被替換的內容會以未被參照的位元組保留，直到 `repack` 為止。每個成員與每個清單欄位，無論是否已知，都會被保留。若更新失敗，容器會被截回更新前的狀態。

檢視器的測試確保這一點：一個格式為 1.7 的容器，在一個資料夾中含有未知的角色、一個成員欄位、一個擴充與一個音訊成員，可以被載入，並且在更新與重新打包之後，所有內容都完整保留；而主版本為 2 的容器會被拒絕。

## 寫入者 {#writers}

- Node：[`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)（寫入、讀取、驗證、更新、重新打包），由打包工具與 Tacview 工具使用。
- Python：`container.py`，約 140 行，以標準的 `zipfile` 實作，每個轉換器中都有相同的檔案（`heat3d_ext_warthunder/container.py`、`heat3d_cs2/container.py`），因此沒有任何轉換器依賴另一個。新的轉換器只需複製它。
- 檢視器的讀取實作位於 [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts)。
