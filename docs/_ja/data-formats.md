---
title: "データ形式リファレンス"
nav_order: 19
lang: "ja"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# データ形式リファレンス

このページは、3DHeat が開けるファイルの種類すべてと、その中の表がどう見えなければならないかを示します。表は、スプレッドシートのように行と列です。どの行も、何かがどこにあったかを示します。わかっていれば、いつ、誰がかも示します。

ヒートマップのタブが、列ごとに何を読むか、そして Parquet ファイルが持てるヒントです。（レース分析のタブはラップファイルを読み、マッチのタブは試合の要約を読みます。[レース分析](race-analysis.md) と [マッチの分析](match-analysis.md) を参照してください。）

## ファイル {#files}

これが、読み込めるファイルの唯一の完全な一覧です。**ソース** のパネル（**ファイル…**、**フォルダー…**、またはドラッグ＆ドロップ）は、ちょうどこれらを受け付けます。

| 拡張子 | 中身 | 読み込むもの |
|---|---|---|
| `.parquet`、`.pq` | Parquet の表 | Parquet の読み込み機能（下記） |
| `.csv`、`.tsv`、`.txt` | 区切りのあるテキスト | テキストの読み込み機能（下記） |
| `.3dheat` | 1 ファイルに一試合（表とその付属物を保持する ZIP） | 中に入っている表として読み込む。[一ファイルで一試合](container.md) |
| `.acmi`（`.txt.acmi`、`.zip.acmi` も） | Tacview の飛行記録 | 独自の読み込み機能。[Tacview の記録](tacview-acmi.md) |
| `.json`、`.json.gz` | OCAP の記録（Arma 形式） | 独自の読み込み機能 |
| `.gpx`、`.kml`、`.kmz`、`.nmea`、`.nma`、`.igc`、`.fit` | GPS の軌跡：GPX、KML/KMZ、NMEA のログ、IGC のグライダーのログ、FIT のスポーツファイル | 独自の読み込み機能。位置は緯度と経度から |

位置としては読み込まないもの：表を説明するために隣に置かれる小さな JSON ファイル（名前の末尾が `.match.json`、`.course.json`、`.level.json`、`.meta.json`、`.summary.json`、`.session.json`、`.hints.json` のもの）。変換ツールの付属の表（`<match>.events.parquet` など。[変換ツール](converters.md) を参照）も、単独で選ばない限り読み込みません。ほかのものはすべて、理由とともに飛ばされます。選択がどう絞り込まれるかは、[ファイルの読み込み](loading-files.md#which-files-are-kept) で説明しています。

空のファイルは飛ばされます。`movement*.<ext>` のファイルを含む選択では、それらだけが読み込まれます（[ファイルの読み込み](loading-files.md#which-files-are-kept)）。

データは **サンプルごとに一行** です。ある瞬間の位置です。任意で、誰か、どのグループ、どのセッション、どこを見ていたか、そしてさらに続く列を持てます。イベントの行（キル、設置、射撃）は、位置の行と同じ表に置けます。イベントの列で区別します。

## 区切りのあるテキスト（CSV、TSV、TXT） {#delimited-text-csv-tsv-txt}

役に立つ最小のファイルです。三行です。

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

列は自動で対応付けられます（[列の対応付け](column-mapping.md)）。

バイト単位のスキャナーで解析されます。対応付けられた列だけを復号します（[`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)）。

| 項目 | ルール |
|---|---|
| ヘッダー | 最初の空でない行に、列の名前があります。名前が空の場合は `column_N` になります。 |
| 区切り文字 | 最初の 1 MiB の、最初の 20 行の空でない行から、カンマ、セミコロン、タブ、パイプの中から **一貫性** で判断します。調べたすべての行で同じ項目数になる区切り文字が勝ち、次に、より多くの項目を与えるものが勝ちます。スペースは自動では判断されませんが、選べます。任意の一文字を入力できます（[列の対応付け](column-mapping.md#the-fields)）。 |
| 引用符 | RFC 4180：項目は二重引用符で囲めます。引用符の中の `""` は、文字どおりの引用符です。 |
| 空白 | 各項目の前後の空白、タブ、引用符は取り除かれます。 |
| 行あたりの項目数 | 最大 4,096。それより多いとエラーになります（*区切り文字は合っていますか？*）。 |
| 数字 | 任意の符号、数字、任意の `.` と小数、任意の指数（`1.5e-3`）。小数点のカンマ（`1,5`）、千の区切り、後ろの単位（`12 m`）は解析されず、欠損として数えられます。ファイルが小数点のカンマを使っている場合は、読み込む前にピリオドに置き換えてください（テキストエディターの検索と置換で行えます）。 |
| 数値の列 | 最初の 50 行の、空でない値の 90% を超える値が数字として解析できる場合、その列は数値として提示されます。 |
| 行数 | 読み込む前に、最初の 1 MiB の平均的な行の長さから見積もります。 |
| テキストの文字コード | UTF-8。 |

## Parquet {#parquet}

[hyparquet](https://github.com/hyparam/hyparquet) で読みます。列のチャンクごとに、型付きの配列へ読み込みます。対応付けられた列だけを要求します（[`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts)、[`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)）。

| 項目 | ルール |
|---|---|
| 行数 | 正確です。読み込む前に、フッターから得ます。 |
| プレビュー | 最初の 50 行を、オブジェクトとして復号します。その値が、どの列が数値らしく見えるかを決めます。 |
| 整数 | `INT32` と `INT64`（BigInt として復号）は数値になります。 |
| 浮動小数点 | `FLOAT`、`DOUBLE`。 |
| 真偽値 | 1 と 0。 |
| 文字列 | 人、グループ、セッション、カテゴリーの列に使います。数値らしい文字列は、数値の役割にも受け付けられます。 |
| `TIMESTAMP`、`DATE` の論理型 | 瞬間（1970 年からのミリ秒）に復号されます。時間の軸として使うときは、単位の設定は無視されます。 |
| 入れ子の列 | 構造体とリストの列は、どの役割にも向きません（JSON のテキストとしてプレビューされます）。試していません。 |
| フッターのメタデータ | キー `heat3d` は、対応付けのヒントとして読まれます（下記）。 |

位置、時間、見た目の列が、数字以外のものを持つ場合は、欠損として復号されます。

## 列の役割と型 {#column-roles-and-types}

| 役割 | ファイルでの型 | 必須 | 保存形式 | 制限 |
|---|---|---|---|---|
| X、Y、Z | 数値 | 三つのうち二つ | 32 ビット浮動小数点。[軸の対応付け](axes-units-and-time.md) の後 | 使える位置のない行は捨てられます。 |
| 時間 | [時間の単位](axes-units-and-time.md#time-units) のどれかの数値、Parquet のタイムスタンプ、または ISO-8601 のテキスト | いいえ | 最も早い行からの 32 ビット浮動小数点の秒 | 4 億行を超えると、並べ替えは拒否されます（[理由](memory-and-budgets.md#the-sort-ceiling)）。 |
| 人 | 任意。辞書で符号化 | いいえ | 32 ビットの ID | |
| セッション | 任意。辞書で符号化 | いいえ | 32 ビットの ID | 最大 100,000 セッションまでラベルが並びます。 |
| グループ | 任意。辞書で符号化 | いいえ | 16 ビットの ID | 最大 4,096 グループ。それ以上ならグループ分けは捨てられます。 |
| ヨー、ピッチ | 数値。度またはラジアン | いいえ | 32 ビット浮動小数点のラジアン | |
| 方向 X、Y、Z | 数値 | いいえ（三つすべて一緒に） | ヨーとピッチに変換 | |
| フィルター列、*範囲* | 数値 | いいえ | 32 ビット浮動小数点 | 同時に有効なフィルターは最大 4 つ。 |
| フィルター列、*カテゴリー* | 任意。辞書で符号化 | いいえ | 32 ビットの ID | 最大 4,096 の値。それ以上なら列は保持されません。 |

フィルター列として残された Parquet の `TIMESTAMP` 列は、エポックからのミリ秒の *範囲* になります。一覧ではなく、スライダーです。

## `heat3d` のヒント {#the-heat3d-hints}

Parquet ファイルは、フッターのキーと値のメタデータに、**`heat3d`** というキーの下で、自分の読み取りの指示を持てます。JSON オブジェクトとしてです（[`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)）。ビューアーは、そのファイルが選択の最初のものであるとき、自分の推測の上にそれを適用します。どの項目も任意で、どの結果も、[列の対応付け](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) のパネルで、まだ表示され、編集できます。JSON オブジェクトとして解析できないものは無視されます。

### スキーマ {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          column names for the position
    "time": string,                                  the time column
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filter columns to keep, most useful first
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  must be > 0
  },
  "entity": {
    "size": number                                   size of one tracked thing in file units, > 0
  }
}
```

| 項目 | 適用されるとき | 効果 |
|---|---|---|
| `columns.x` … `columns.dirZ`、`time`、`personId`、`teamId`、`sessionId` | 指定された列がファイルにある | その役割を設定します。 |
| `columns.timeUnit` | 七つの単位のどれか | 時間の単位を設定します。 |
| `columns.angleUnit` | `"degrees"` または `"radians"` | 角度の単位を設定します。 |
| `columns.lookMode` | dirX、dirY、dirZ がすべて設定された `"vector"`。yaw が設定された `"yawPitch"`。`"none"` | 見た目のモードを設定します。 |
| `columns.extra` | 配列である | 自動のフィルターの一覧を置き換えます。存在する列で、どの役割にも使われていないものだけを残します。各列は、プレビューで数値らしく見えれば *範囲*、そうでなければ *カテゴリー* になります。これがない場合、自動の一覧は残し、ヒントが役割に割り当てた列だけを除きます。 |
| `axes.up` | `"y"` または `"z"` | 上の軸。 |
| `axes.flipX/Y/Z` | 真偽値 | 反転。 |
| `axes.scale` | 0 より大きい数値 | 単位の縮尺。 |
| `entity.size` | 0 より大きい数値 | [実体の大きさ](sessions-persons-groups.md#entity-size)（読み込み時に単位の縮尺を掛けます）。設定できる唯一の方法です。 |

### 例 {#example}

シューティングゲームの、架空の書き出しの例です。Z が上、センチメートル単位、左手系の世界、プレイヤーの幅はおよそ 72 cm です。

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

### 書き込み方 {#writing-it}

pyarrow では、カスタムのスキーマのメタデータを、ファイルのキーと値のメタデータに書き込みます。

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

`npm run inspect -- file.parquet` は、ファイルのスキーマを表示します。ヒントが参照している列の名前を素早く確かめるのに使えます。

## ヒートマップのタブが書くもの {#what-the-heatmap-tab-writes}

データへは何も書き戻されません。出力は次のとおりです。

データへは何も書き戻されません。出力は次のとおりです。

- 動画（WebM、VP9 または VP8）。[カメラの経路と動画](camera-path-and-video.md)。
- カメラの姿勢。テキストとしてクリップボードにコピーされます。[カメラ](camera.md#pose)。
- ブラウザーの [レベルのライブラリ](level-library.md) に保存されたレベル。
