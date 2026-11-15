---
title: "Tacview の記録 (ACMI)"
parent: "データの取り込み"
nav_order: 7
lang: "ja"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview の記録（ACMI）

Tacview は、フライトシミュレーターの飛行を記録するプログラムです。そのファイルの拡張子は `.acmi` です。3DHeat はそれを開き、すべての機体がどこを飛んだかを見せます。

Tacview の飛行の記録は、ほかの表と同じように読み込めます。`.acmi`（テキスト、`.txt.acmi`、または圧縮された `.zip.acmi`）を選ぶか、ドロップして **読み込む** を押します。すると、すべての飛行のヒートが得られます。**マッチ** タブでは、フィギュア、航跡、イベントの一覧を含む再生が見られます（[マッチの再生](match-replay.md)）。ACMI は Tacview の公開されたファイル形式です（[ドキュメント](https://www.tacview.net/documentation/acmi/)）。DCS（Tacview のエクスポーター経由）、IL-2 Great Battles、Falcon BMS、X-Plane、MSFS などがこの形式で書き出すため、どれも読めます。

## 記録が何になるか {#what-a-recording-becomes}

オブジェクトの位置が書き込まれるたびに1行、オブジェクトの場所で起きたイベントごとに1行、オブジェクトがいなくなったとき（`Removed`、最後にいた場所）に1行です。まだ見ていないオブジェクトに関するイベント（ブックマーク、全員へのメッセージなど）は、基準点にある `(recording)` というオブジェクトの行になります。記録には、読み方の指示が含まれているので、マッピングの手順は自動で埋まります。読み取りは、次の列を書きます: `Time`、`X`、`Y`、`Altitude`、`Object`、`Coalition`、`Heading`、`Pitch`、`Roll`、`Type`、`Name`、`Pilot`、`Group`、`Country`、`Color`、`Event`、`Latitude`、`Longitude`、`Recording`、`EventObjects`、`RecordingInfo`。そのあとに、記録が持つそのほかのプロパティが続きます。それぞれの役割は次のとおりです。

| 列 | 役割 | 意味 |
|---|---|---|
| Time | 時間 | 記録の ReferenceTime からの秒数。ReferenceTime があるときは Unix 秒なので、時計は実際の時刻を示します。 |
| X、Y | 位置 | 東と北（メートル）。記録の基準点で地球に接する面の上での値です。基準点の近くでは距離と方位が正確で、100 km 先でも誤差は千分の一未満です。北はワールドの -Z になります。 |
| Altitude | 位置（上） | メートル。 |
| Object | 人物 | パイロットとオブジェクトの名前（ID 付き）。例: `Viper 1 (F-16C_50) #a01`。無人のオブジェクトは `(T-90A) #401`。 |
| Coalition | チーム | 陣営（陣営がないときは色）。 |
| Heading、Pitch | 向き | 度。方位 0 は北です。 |
| Recording | セッション | 記録の Title、またはファイル名。複数の記録を並べて読み込んでも、航跡はつながりません。 |
| Type、Name、Pilot、Group、Country、Color、Event、Roll、Latitude、Longitude | フィルター | フィルター用に保存されます。Type と Name は、各オブジェクトの[フィギュア](figures.md)を選びます。Event は、ディブリーフのイベント一覧に使われます。Roll は、機体の傾きに使われます。 |
| U、V | | すべてのサンプルにある場合の、ゲーム自身の平面のワールドのメートル値（DCS が書き出します）。 |
| EventObjects | フィルター | イベントが指名するすべてのオブジェクト（`Message|a01|b02|...`）。ID で書かれます。 |
| RecordingInfo | | その時点での記録自身のプロパティ（DataSource、DataRecorder、Author、Category、Briefing、Comments など）。JSON で書かれます。 |
| IAS、Mach、AOA、FuelWeight など | フィルター | 記録が持つそのほかの数値のプロパティ。 |
| Parent、CallSign、LockedTarget、Label、Shape など | フィルター | 記録が持つそのほかの文字列のプロパティ。値が数値でないプロパティは、文字列として扱われます。 |

Tacview の位置の 4 つの形式（`lon|lat|alt`、`u|v` を伴うもの、`roll|pitch|yaw` を伴うもの、そしてそれらすべてと方位を伴うもの）はすべて読まれます。空の欄には、直前の値が残ります。`-id` はオブジェクトを削除します。削除のあとに同じ ID が再び使われると、それは新しいオブジェクトになります。エスケープされたカンマと、続きの行も扱われます。

位置は常に緯度と経度から投影されます。U/V からとることはありません。そのため、どのゲームの記録も、実際の世界の背景と同じ投影を共有します。
