---
title: "資料格式參考"
nav_order: 19
lang: "zh-Hant"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: true
---

# 資料格式參考

本頁列出 3DHeat 能開啟的每一種檔案，以及其中的表格必須長什麼樣子。表格就是列與欄，類似試算表：每一列都說明某樣東西在哪裡，若你有記錄，還會說明它是什麼時候、是誰。

本頁說明**熱圖**分頁逐欄讀取的內容，以及 Parquet 檔可以攜帶的提示。（**賽車分析**分頁讀取的是單圈檔，**對戰**分頁讀取的是對戰摘要；請見[賽車分析](race-analysis.md)與[對戰分析](match-analysis.md)。）

## 檔案 {#files}

這是可載入檔案的完整清單。**來源**面板（**多個檔案…**、**資料夾…**，或拖放）只接受以下這些：

| 副檔名 | 是什麼 | 由誰讀取 |
|---|---|---|
| `.parquet`、`.pq` | Parquet 表格 | Parquet 讀取器（見下文） |
| `.csv`、`.tsv`、`.txt` | 以分隔符號區分的文字 | 文字讀取器（見下文） |
| `.3dheat` | 一個檔案中的一場對戰（一個 ZIP，內含表格與其附加內容） | 以它所含的表格載入——[一個檔案一場對戰](container.md) |
| `.acmi`（也包括 `.txt.acmi`、`.zip.acmi`） | Tacview 飛行紀錄 | 它自己的讀取器——[Tacview 紀錄](tacview-acmi.md) |
| `.json`、`.json.gz` | OCAP 紀錄（Arma 類型） | 它自己的讀取器 |
| `.gpx`、`.kml`、`.kmz`、`.nmea`、`.nma`、`.igc`、`.fit` | GPS 軌跡：GPX、KML/KMZ、NMEA 紀錄、IGC 滑翔紀錄、FIT 運動檔 | 它自己的讀取器；位置來自緯度與經度 |

以下內容不會當作位置載入：表格旁用來描述它的小型 JSON 檔（檔名結尾為 `.match.json`、`.course.json`、`.level.json`、`.meta.json`、`.summary.json`、`.session.json`、`.hints.json` 的檔案），以及轉換工具附帶的額外表格（`<對戰>.events.parquet` 之類，見[轉換工具](converters.md)），除非你單獨選取它們。其他檔案都會被略過，並附上原因。選取內容如何被篩選，說明於[載入檔案](loading-files.md#which-files-are-kept)。

空檔案會被略過。在包含 `movement*.<ext>` 檔案的選取中，只會載入那些檔案（[載入檔案](loading-files.md#which-files-are-kept)）。

資料是**每個樣本一列**：某個時刻的一個位置，可選擇性地包含是誰、屬於哪個群組、哪一個工作階段、他們正在看哪裡，以及任何其他欄位。事件列（擊殺、安放、射擊）可以與位置列放在同一個表格中，由一個事件欄位來區分。

## 以分隔符號區分的文字（CSV、TSV、TXT） {#delimited-text-csv-tsv-txt}

一個最小的有用檔案，三列：

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

欄位會自動對應（[欄位對應](column-mapping.md)）。

由逐位元組的掃描器解析，它只解碼已對應的欄位（[`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)）。

| 項目 | 規則 |
|---|---|
| 標頭 | 第一個非空白的行包含欄位名稱。空的名稱會變成 `column_N`。 |
| 分隔符號 | 在第一個 1 MiB 中，取前 20 個非空白行，從逗號、分號、定位字元與直線符號中，依**一致性**偵測：在每個取樣行中欄位數都相同的分隔符號獲勝，若有多個，則取欄位數較多的。空白字元永遠不會被自動偵測，但可以手動選擇；任何單一字元都可以輸入（[欄位對應](column-mapping.md#the-fields)）。 |
| 引號 | 符合 RFC 4180：欄位可以用雙引號包起來，引號內的 `""` 代表一個引號字元。 |
| 空白 | 每個欄位前後的空格、定位字元與引號都會被修剪。 |
| 每列的欄位數 | 最多 4,096；超過會出錯（*分隔符號對嗎？*）。 |
| 數字 | 可選的正負號、數字、可選的 `.` 與小數、可選的指數（`1.5e-3`）。小數點用逗號（`1,5`）、千位分隔符號或尾隨單位（`12 m`）都無法解析，會被視為缺漏。若你的檔案使用小數逗號，請在載入前先把它們換成小數點（在文字編輯器中使用尋找與取代即可）。 |
| 數字欄位 | 當前 50 列中，超過 90% 的非空值可以被解析為數字時，該欄位就會被視為數字欄位。 |
| 列數 | 在載入前，根據第一個 1 MiB 的平均行長估算。 |
| 文字編碼 | UTF-8。 |

## Parquet {#parquet}

使用 [hyparquet](https://github.com/hyparam/hyparquet) 讀取，逐一欄位區塊轉為型別化陣列，只請求已對應的欄位（[`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts)、[`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)）。

| 項目 | 規則 |
|---|---|
| 列數 | 精確值，從檔案尾部（footer）取得，在載入前即可知道。 |
| 預覽 | 前 50 列，解碼為物件；它們的值決定哪些欄位看起來是數字。 |
| 整數 | `INT32`，以及 `INT64`（解碼為 BigInt）會變成數字。 |
| 浮點數 | `FLOAT`、`DOUBLE`。 |
| 布林值 | 1 與 0。 |
| 字串 | 用於人員、群組、工作階段與類別欄位；看起來像數字的字串，在數字角色中也會被接受。 |
| `TIMESTAMP`、`DATE` 邏輯型別 | 解碼為時間點（自 1970 年起的毫秒數）；作為時間軸使用時，單位設定會被忽略。 |
| 巢狀欄位 | 結構與清單欄位不適用於任何角色（預覽時會以 JSON 文字顯示）；未經測試。 |
| 尾部中繼資料 | 鍵 `heat3d` 會被讀取為對應提示（見下文）。 |

位置、時間或視角欄位若含有非數字的內容，會被解碼為缺漏值。

## 欄位角色與型別 {#column-roles-and-types}

| 角色 | 檔案中的型別 | 必填 | 儲存為 | 限制 |
|---|---|---|---|---|
| X、Y、Z | 數字 | 三者中的兩個 | 32 位元浮點數，經過[軸向對應](axes-units-and-time.md)之後 | 沒有可用位置的列會被捨棄。 |
| 時間 | [時間單位](axes-units-and-time.md#time-units)之一的數字、Parquet 時間戳記，或 ISO-8601 文字 | 否 | 自最早的列起算的 32 位元浮點數秒 | 超過 400,000,000 列時拒絕排序（[原因](memory-and-budgets.md#the-sort-ceiling)）。 |
| 人員 | 任何型別；字典編碼 | 否 | 32 位元 ID | |
| 工作階段 | 任何型別；字典編碼 | 否 | 32 位元 ID | 最多列出 100,000 個工作階段的標籤。 |
| 群組 | 任何型別；字典編碼 | 否 | 16 位元 ID | 最多 4,096 個群組，否則會捨棄分組。 |
| 偏航、俯仰 | 數字，度或弧度 | 否 | 32 位元浮點數弧度 | |
| 方向 X、Y、Z | 數字 | 否（三者須同時提供） | 轉換為偏航與俯仰 | |
| 篩選欄位，*範圍* | 數字 | 否 | 32 位元浮點數 | 同時最多啟用 4 個篩選器。 |
| 篩選欄位，*類別* | 任何型別；字典編碼 | 否 | 32 位元 ID | 最多 4,096 個值，否則不保留該欄位。 |

作為篩選欄位保留的 Parquet `TIMESTAMP` 欄位，會是以紀元毫秒表示的*範圍*——是一個滑桿，而不是清單。

## `heat3d` 提示 {#the-heat3d-hints}

Parquet 檔可以在其尾部的鍵值中繼資料中，攜帶自己的讀取說明，鍵為 **`heat3d`**，值為一個 JSON 物件（[`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)）。當該檔案是選取中的第一個時，檢視器會以這些提示覆蓋它自己的猜測；每個項目都是選用的，而每個結果仍會在[欄位對應](column-mapping.md#the-heat3d-hints-in-a-parquet-footer)面板中顯示並可編輯。無法解析為 JSON 物件的內容會被忽略。

### 結構 {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          位置的欄位名稱
    "time": string,                                  時間欄位
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           要保留的篩選欄位，最有用的排在前面
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  必須 > 0
  },
  "entity": {
    "size": number                                   一個被追蹤物體以檔案單位計的大小，> 0
  }
}
```

| 項目 | 何時套用 | 效果 |
|---|---|---|
| `columns.x` 至 `columns.dirZ`、`time`、`personId`、`teamId`、`sessionId` | 檔案中存在該名稱的欄位 | 設定該角色。 |
| `columns.timeUnit` | 是七種單位之一 | 設定時間單位。 |
| `columns.angleUnit` | `"degrees"` 或 `"radians"` | 設定角度單位。 |
| `columns.lookMode` | `"vector"`，且 dirX、dirY、dirZ 都已設定；`"yawPitch"`，且已設定 yaw；`"none"` | 設定視角模式。 |
| `columns.extra` | 是一個陣列 | 取代自動的篩選清單，只保留存在、且未被任何角色使用的欄位；每一個在預覽中看起來是數字時為*範圍*，否則為*類別*。沒有此項目時，會保留自動清單，但扣除任何已被提示指定為角色的欄位。 |
| `axes.up` | `"y"` 或 `"z"` | 向上的軸。 |
| `axes.flipX/Y/Z` | 布林值 | 翻轉。 |
| `axes.scale` | 大於 0 的數字 | 單位比例。 |
| `entity.size` | 大於 0 的數字 | [實體大小](sessions-persons-groups.md#entity-size)（載入時會乘以單位比例）。這是唯一的設定方式。 |

### 範例 {#example}

一個虛構的射擊遊戲匯出：Z 軸朝上、單位為公分、左手座標系的世界，玩家約寬 72 cm。

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### 寫入提示 {#writing-it}

使用 pyarrow 時，自訂的結構中繼資料會寫入檔案的鍵值中繼資料：

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` 會印出檔案的結構，這是快速檢查提示所指欄位名稱的方法。

## 熱圖分頁會寫出什麼 {#what-the-heatmap-tab-writes}

資料不會被寫回。輸出包括：

- 影片，格式為 WebM（VP9 或 VP8）——[攝影機路徑與影片](camera-path-and-video.md)；
- 攝影機姿態，以文字形式複製到剪貼簿——[攝影機](camera.md#pose)；
- 儲存在瀏覽器[關卡庫](level-library.md)中的關卡。
