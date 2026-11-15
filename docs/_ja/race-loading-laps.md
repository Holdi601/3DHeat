---
title: "ラップの読み込み"
parent: "レース分析"
nav_order: 51
lang: "ja"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# ラップの読み込み

ラップファイルは、一回の走行の記録です。車がどこにいたか、ドライバーが何をしたかを、毎秒何度も記録します。同じコースのラップを二つ以上読み込むと、**レース分析** タブでそれらを比べられます。

![レース分析タブのラップの部分。デモラップを三つ読み込んだ状態：ラップ一覧、基準の星、フォーカス](../assets/img/en/race-loading-laps-list.webp)

## 最初のラップ {#your-first-laps}

1. **レース分析** タブを開きます。
2. 見るだけですか？ **デモラップ** を押します（[デモラップ](#demo-laps) を参照）。
3. 自分のラップの場合：ゲームで記録装置を使って記録します（[ファイル形式](#file-formats) を参照）。記録装置は、ラップごとに一つのファイルを書きます。
4. **ラップファイルを読み込む…** を押し、同じコースのファイルを二つ以上選びます。または **フォルダー…** を押し、それらが入ったフォルダーを選びます。3D 表示にファイルやフォルダーをドロップすることもできます。
5. 一覧のラップをクリックすると、そのラップがどこでタイムを失っているかがわかります。

**注意：ラップは一度に一つのコースずつ比べます。** 別の名前のコースのラップを読み込むと、すでに読み込まれているラップは消去されます。

## ボタン {#the-buttons}

| 操作 | 働き |
|---|---|
| **ラップファイルを読み込む…** | `.json`、`.csv`、`.txt`、`.ibt`、`.gz`、`.h3dcars` のファイルを選ぶ選択画面。一度に複数選べます（`.h3dcars` は車のファイルです。[車](race-replay-and-scene.md#the-cars) を参照） |
| **フォルダー…** | フォルダーを選ぶ画面。そのフォルダーと、その下にあるすべてのラップファイルを読み込みます |
| **デモラップ** | 架空のサーキットを走る、架空のラップ三つ（[デモラップ](#demo-laps) を参照） |
| **クリア** | すべてのラップを削除します（ラップが読み込まれているときに表示されます） |
| 表示にドロップ | 3D 表示にドロップしたファイルやフォルダーは、同じように読み込まれます |

ラップは、読み込まれているものに **追加** されます。**ただし、別の名前のコースのものである場合は、読み込まれているラップが先に消去されます**（ラップは一度に一つのコースずつ比べるため）。読めないファイルは、ボタンの下に一行ずつ書かれます。ほかのファイルは読み込まれます。

## ファイル形式 {#file-formats}

形式は、ファイル名ではなく、中身から判断します。簡単に言うと次のとおりです。

- **heat3d-lap** は、3DHeat の記録装置がほとんどのゲームで書くファイルです。
- **FH Companion** は、Forza Horizon のラップを記録する無料のツールです。ラップファイルと、その隣に `.json.tele.gz` ファイル（同じラップの、すべてのタイヤのデータを gzip で圧縮したもの）を書きます。両方を一緒に選んでください。
- **iRacing `.ibt`** は iRacing 自身のテレメトリファイルです。車の中で Alt+L を押して記録をオンにし、ファイルをそのまま読み込みます。
- **ラップ CSV** は、一行が一つの瞬間を表す、ただの表です。

| 形式 | 典型的な出どころ | 読み込む関数 |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...`（Data Out の Forza Horizon と Motorsport、AC / ACC / AC EVO / AC Rally、EA SPORTS WRC、DiRT Rally 2.0 / 1、DiRT 4、Richard Burns Rally、BeamNG.drive） | `fromHeat3dLap` |
| FH Companion のラップ `.json` | FH Companion のラップライブラリ | `fromFhCompanion` |
| FH Companion のテレメトリ `.json.tele.gz` | 各 FH Companion のラップファイルの隣 | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing 自身のテレメトリファイル（車の中で Alt+L で記録をオン） | `readIbt` |
| ラップ CSV | `heat3d_capture laps`、Trackmania のプラグイン、または `x`、`z`、時間の列、必要に応じて `lap` 列を持つ CSV | `fromCsv` |

各ゲームがどう記録され、何を送るかは、記録装置の文書に書かれています。
[GameCapture：ゲーム](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
と [GameCapture：ラップの形式](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)。
[ほかのレースゲーム](other-games.md) も参照してください。

## フォルダーとコース {#folders-and-courses}

**フォルダー…**、またはドロップされたフォルダーは、その下にあるすべてのファイルを読み込みます。フォルダーの中では、拡張子が `.json`、`.csv`、`.txt`、`.ibt`、`.tele.gz` のファイルだけを対象にします。ラップではない `.json`（コース自身のファイル、その地図）は、エラーなしで飛ばされます。

**一回の選択に複数のコースがある場合。** FH Companion のラップライブラリは、各コースを `<コース名> (course_<x>_<z>_to_<x>_<z>)` という名前のフォルダーに入れます（名前のないコースは、ただの `course_...`）。選んだファイルが二つ以上のそうしたコースのフォルダーにまたがっている場合、何も読み込まれません。代わりに **ラップ** の部分に「これは N 個のコースのラップです。ラップは一度に一つのコースずつ比べます。一つ選んでください：」と表示され、各コースとそのラップ数が、ラップの多い順に並びます（拡張子が `.json`、`.csv`、`.ibt` のファイルを数えます。`course.json` は数えません）。一つをクリックすると、そのコースのファイルが読み込まれます。

コースは、その名前と **スタート** の地点で識別されます。ゴールではありません。最後まで走らなかった走りは、FH Companion が同じ名前とスタートのもとに（`unfinished/` の中に）保存し、止まった地点を終わりとして記録します。それらはそのコースに含まれ、一覧では **部分的** と印されます。

**選んだファイルに複数のコースがある場合。** コースのフォルダーからではなく直接選んだファイルが、名前のある複数のコースのラップである場合、同じ選択が各コースについて示されます。どのコースの名前も持たないラップは、選ばれたコースに一緒に入ります。

## 車の名前 {#car-names}

ラップは、ゲームが付けた車の正式な名前で呼ばれます。ラップファイルが車の名前を書いていない場合は、次の順で決めます。

1. **フォルダー。** FH Companion のライブラリは、ラップを `<コース>/<クラス>/<車の名前> '<yy> (car<number>)/<チューン>/<タグ>/<ラップ>.json` の中に保存します。`<name> (car<number>)` に一致する一番内側のフォルダーが、名前と番号を与えます。`car<number>` に一致するものは、番号だけを与えます。このパスを持つのは、フォルダーの選択とドロップされたフォルダーだけです。
2. **同じ車の別のラップ。** いずれかのラップが車の名前を持つと、同じゲームと同じ車の番号を持つすべてのラップは、その名前で呼ばれます。一緒に読み込まれたラップと、このブラウザーで後から読み込まれたラップが対象です。名前は `localStorage` の `heat3d.carNames` に（`<ゲーム>:<車の番号>` をキーにして）保存されます。プライベートウィンドウでは、ラップと同じ期間だけ残ります。
3. それ以外は、番号による「car 1234」、または「car」です。

**ラベル。** ラップ一覧では、ラップに車の名前が表示されます。同じ車のラップが複数ある場合は、「名前 #1」「名前 #2」と番号が付きます。分析の文章も、ラベルが一意であれば同じラベルを使います。一意でない場合は、車の名前とラップタイムを使います：「名前 (1:29.616)」（これは例のタイムです）。それでも一意でなければ、さらに番号を付けます。

**グループ化。** ラップは、車の番号（番号がなければ名前）と、性能指数が同じであれば、同じ車として扱われます（包絡線、プロファイル、比較のため。`carKey`）。同じモデルでもチューンが違えば、別の車です。

**クラス。** ラップの性能クラスは、ゲームのものです（Forza は D..X、iRacing は車のクラスの短い名前）。統計は、D、C、B、A、S1、S2、R、X の順に並べ、その他は名前順に並べます。

## デモラップ {#demo-laps}

**デモラップ** は、架空のサーキット（ストレート四つと右コーナー四つ）のラップを三つ読み込みます。簡単な車両モデルで作られています（[`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)）。各コーナーはグリップで制限された速度になり、ラップシミュレーターのように、前向きの加速の計算と、後ろ向きのブレーキの計算で作られています。

| ラップ | 車 | ミス |
|---|---|---|
| クリーン | グリップの車 | なし |
| ミスあり | グリップの車 | T2 に 35 m 早くブレーキを踏む。T3 を出るところで 30 m 遅くアクセルを踏む。T4 をその速度の 0.88 で通る。一方に 1.2 m ずれて走る |
| 別の車 | パワーの車 | なし。反対側に 1.2 m ずれて走る |

| 車（番号） | グリップ | ブレーキ | トラクション | パワー/質量 | 空気抵抗 |
|---|---|---|---|---|---|
| グリップの車（9001） | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| パワーの車（9002） | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

ミスのあるラップがフォーカスされます。サーキットは、Forza が自分の世界を保つ形（左手系）で並べられています。そのため、実際の Forza のラップと同じように、鏡映しになって表示され、タブは **Xを反転** を提供します。三つのラップはすべて、ホイールごとのデータを持つので、タブのすべての部分に表示するものがあります。

## ラップ一覧 {#the-lap-list}

各行を、左から右に見ると次のとおりです。

| 要素 | 働き |
|---|---|
| ● / ○ | ラップを表示／非表示にします（ライン、車、カード、グラフ）。非表示のラップも分析されます |
| 色の線 | ラップの色 |
| 名前とタグ | クリックで、そのラップを **フォーカス** します。マウスを載せると、元のファイルと車（名前・クラス PI・駆動方式）が見えます |
| ⌖ | この車をカメラで追いかけます（もう一度クリックすると止まります） |
| ★ | すべてをこのラップと比べます（基準にします）。基準のラップでは無効です |
| × | ラップを削除します |

**タグ：** *reference*（基準）。複数のクラスがあるとき、クラスの最速のラップには *best of X*（またはクラスのベスト）。ゴールまで届かなかった走りには *partial*（部分的）。

**二行目：** クラス（複数のクラスがある場合のみ）、ラップタイム（`1:29.616`）、比べている相手のラップとの差（そのクラスのベスト、または基準）を `+0.512`（例）のように表示します。ラップのスタートが基準のスタートより 10 m 以上遅れている場合は、*starts late*（遅いスタート）と出ます。

ラップが 8 個より多いと、「N 件中 M 件を描画」の行が出て、**すべて表示**（すべてのラップを描きます。遅くて、線が絡み合います）と **注目中のみ**（基準、フォーカスしたラップ、そのクラスのベスト。統計はどちらの場合もすべてのラップを数えます）を選べます。

一覧の下には、ラップが描画の鏡映しだと示している場合の、鏡映のヒントがあります（[鏡映の世界](race-replay-and-scene.md#mirrored-worlds) を参照）。二つ以上のラップがある場合は、「ラップをクリックすると、どこでタイムを失っているかがわかります…」というヒントも表示されます。複数のクラスがある場合は、各ラップが自分のクラスで最速のものと比べられる、という説明も付きます。

### 基準とフォーカス {#reference-and-focus}

- **基準：** ほかのすべてのラップが合わせられ、初期設定では比べられる相手となるラップです。★ で別のものを選ばない限り、最速の **完走** ラップです（完走したものがない場合は、最初に読み込まれたラップ）。基準のラップを削除すると、自動の選択に戻ります。
- **フォーカス：** 判定、車の制御、地図が表示されるラップです。ユーザーが置いた場所に留まります。そうでない場合は、基準ではない **最も遅い** ラップです（「最も学べるもの」）。ラップをフォーカスすると、そのラップと、そのクラスのベストラップも表示されるようになります。基準をフォーカスすると、各コーナーで最速だった別のラップと比べられます。
- **クラス：** 複数の性能クラスのラップがある場合、各ラップは自分のクラスの最速の完走ラップと比べられます（基準は、基準のクラスの中で）。[コースの統計](race-course-statistics.md) を参照してください。

### 色 {#colours}

すべてのラップは、読み込み順での位置によって、それぞれ自分の色を得ます。そのため、ほかのラップが非表示でも、ラップは色を保ちます。色相は、ヒートマップのチームモードがグループを並べるのと同じように、色相環に沿って並びます。各枠では、明るさ（OKLCH で 0.52〜0.66）と彩度（0.12〜0.18）を、通常の色覚、赤色弱、緑色弱の見え方で、隣の枠（最後は最初の枠）から最も離れるように選びます。どの見え方でも、暗いグラフの背景に対して少なくとも 3:1 のコントラストを持ちます。

## 開発者向け {#for-developers}

コード：[`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts)（`loadLapFiles`）、[`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts)、[`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts)、[`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts)。

### 各形式の読み方 {#how-each-format-is-read}

どの形式も、最終的には一つの `LapTrace` になります。チャンネルは正規の名前を持ち（`time`、`distance`、`x`、`y`、`z`、`speed`、`throttle`、`slipRatio.FL` など。[チャンネル表](race-charts-and-hud.md#the-channel-table) を参照）、車、ラップタイム、完走かどうか、そして `meta` のブロックを持ちます。どの形式でも、`time` と `distance` は 0 から始まるようにずらされます。ソースに `speed` がない場合は、隣接するサンプルから、距離を時間で割って求めます。

#### heat3d-lap JSON {#heat3d-lap-json}

`"format": "heat3d-lap"` を持つ JSON オブジェクトです。読み取るフィールドは次のとおりです。

| フィールド | 用途 |
|---|---|
| `channels` | チャンネルごとの配列を持つオブジェクト（正規の名前で）。ホイールごとのチャンネルは `name.FL`、`name.FR`、`name.RL`、`name.RR`。`time`、`x`、`z` は必須 |
| `car.carOrdinal`、`car.name`、`car.carClass`、`car.carPI`、`car.drivetrain` | 車：ID、名前、Forza のクラス番号（0 D、1 C、2 B、3 A、4 S1、5 S2、6 X）、性能指数、駆動方式のコード（0 FWD、1 RWD、2 AWD） |
| `lap.seconds` | ラップタイム。ない場合は最後の `time` の値 |
| `lap.complete` | `false` は部分的な走りを示す。それ以外はすべて完走 |
| `game`、`track` | 名前。`game` がどの種目かを決める（下記） |
| `units.slipRatio` / `units.slipAngle` | スリップの尺度。単位に `raw` を含めば `scaled`、`normalised` なら `peak`、それ以外は `physical` |
| `meta` | `slip`、`surface`、`discipline` を指定すると、上記を上書きする |

`distance` チャンネルがない場合、距離は 3D の位置から足し合わせて求めます。

#### FH Companion のラップファイル {#fh-companion-lap-files}

`samples` 配列（約 5 m ごとに一つのサンプル）を持つ `Lap` オブジェクトを持つ JSON オブジェクトです。フィールドの対応は次のとおりです。

| FH Companion | チャンネル |
|---|---|
| `Metres`、`Seconds` | `distance`、`time`（ラップが 0 から始まるようにずらす） |
| `X`、`Y`、`Z` | `x`、`y`、`z` |
| `Speed`、`Throttle`、`Brake`、`Steer`、`Clutch`、`HandBrake`、`Gear` | 同じもの（小文字） |
| `LatG`、`LongG` | `latAcc`、`longAcc`（m/s²。名前に反して） |
| `Puddle` | `puddle` |

車は、`Lap.carOrdinal`、`Lap.carName`（新しいファイルのみ）、`Class`（または `Lap.carClass` の Forza クラス番号）、`Lap.performanceIndex`、`Lap.drivetrain`、`Lap.peakKilowatts` から得ます。タイムは `Lap.lapSeconds` から得ます。`EndedAtFinish: false` の走りは部分的です。種目は `forza-horizon` です。

これらのファイルには、タイヤのデータも向きもないので、ロック、ホイールスピン、滑りは、これだけでは判定できません。ただし、押し出し（経路に対するステアリングから）と、接触や衝突は判定できます。残りのために、それぞれの隣にある `.tele.gz` も選んでください。

#### FH Companion のテレメトリ（`.json.tele.gz`） {#fh-companion-telemetry-jsontelegz}

gzip で圧縮した JSON `{ version, columns, data }` です。一つのラップの Forza の Data Out すべてが、パケットごとに一行で、ゲーム自身のフィールド名で入っています。列は名前で探し、位置では探しません。形式 2 はすべてのパケットを保持します（ゲームの 64 ティックに対して、1 秒あたり約 110）。記録装置自身の時計（`t`、`metres`）以外のすべてが直前の行と同じ行は捨てられるので、ラップは毎秒ゲームの 64 行で読めます。（読み込みボタンのツールチップにそう書かれています：「すべてのタイヤのスリップを 64 Hz で」。）

| Data Out のフィールド | チャンネル |
|---|---|
| `t`、`metres` | `time`、`distance` |
| `PositionX/Y/Z` | `x`、`y`、`z` |
| `Yaw`、`Pitch`、`Roll` | `yaw`、`pitch`、`roll` |
| `VelocityX/Y/Z` | `latVel`、`vertVel`、`longVel`（車のフレーム：x が右、y が上、z が前） |
| `AccelerationX/Y/Z` | `latAcc`、`vertAcc`、`longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`、`CurrentEngineRpm`、`Gear`、`Power`、`Torque`、`Boost`、`Fuel` | `speed`、`rpm`、`gear`、`power`、`torque`、`boost`、`fuel` |
| `Accel`、`Brake`、`Clutch`、`HandBrake` | `throttle`、`brake`、`clutch`、`handbrake`。0..255 から 0..1 に換算 |
| `Steer` | `steer`。-127..127 から -1..1 に換算 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`、`TireSlipAngle<Wheel>`、`TireCombinedSlip<Wheel>` | `slipRatio.<W>`、`slipAngle.<W>`、`combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`。華氏から摂氏に換算 |
| `WheelRotationSpeed<Wheel>`、`WheelInPuddle<Wheel>`、`WheelOnRumbleStrip<Wheel>`、`SurfaceRumble<Wheel>` | ホイールごとの `wheelSpeed`、`puddle`、`rumble`、`surfaceRumble` |

`<Wheel>` は、`FrontLeft`、`FrontRight`、`RearLeft`、`RearRight` から、`FL`、`FR`、`RL`、`RR` になります。スリップには `peak` と印が付きます（Forza の正規化されたスリップです。1 を超えるとタイヤはグリップを失っています）。

**組み合わせ。** ラップファイル `<lap>.json` と `<lap>.json.tele.gz` を一緒に選ぶか、ドロップすると（同じパスで、`.tele.gz` だけが違う）、**一つ** のラップになります。テレメトリのチャンネルと、ラップファイルの車、クラス、タイム、コース、部分フラグを持ちます。テレメトリファイル自身が車の名前を持っていれば、そちらが優先されます。`.tele.gz` だけでも読み込めます。形式 2 のファイルは `car`（`ordinal`、`name`、`class`、`pi`）、`track`、`lapSeconds` を持ちます。それらがない場合、ラップタイムはテレメトリ自身の長さになり、車は不明になります。

#### iRacing `.ibt` {#iracing-ibt}

iRacing のテレメトリファイルは、直接読み込まれます（ブラウザーで、変換なし）。112 バイトのヘッダー、32 バイトのディスクのサブヘッダー、変数の表（チャンネルごとに 144 バイト）、そしてセッションの YAML です。

- **必須のチャンネル：** `SessionTime`、`Lap`、`Lat`、`Lon`。これらがない場合：「… に SessionTime、Lap、Lat、Lon のチャンネルがありません。iRacing のテレメトリファイルですか？」
- **位置：** 緯度と経度を、最初のゼロでない位置の接平面上で、メートルで並べます（地球の半径 6 371 008.8 m）。x は東、z は南、y は高度（`Alt`）です。そのため、初期設定のカメラの向きでは、北が画面の上になります。コースのモデル自身の座標系ではありません。抽出したコースのモデルは、それに合わなくなるからです。
- **ラップ：** セッションは `Lap` が変わるところで分割されます。ラップは、60 サンプルより多く、`LapDistPct` の 5% 未満で始まり、95% を超えて終わる場合に残ります。部分的なラップは捨てられます。残りがない場合：「… に、N km のコースの完走ラップがありません」（コースの長さは YAML から）、または「… に完走ラップがありません」。
- **距離：** ラップの始まりからの `LapDist`。なければ位置から足し合わせます。
- **車：** `DriverInfo` から。プレイヤーの `CarScreenName`（車の名前）、`CarID`（車の番号として）、`CarClassShortName`（クラスとして）。コース：`TrackDisplayName`、なければ `TrackName`。

対応するチャンネル：

| iRacing | チャンネル | 換算 |
|---|---|---|
| `Speed`、`Throttle`、`Brake`、`Gear`、`RPM` | 同じ名前 | - |
| `Clutch` | `clutch` | `1 - v`（iRacing はつながりの度合いを数え、こちらはペダルのため） |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax`（ラジアン、反時計回りが -1..1 の右が正。最大は少なくとも 0.1、なければ π） |
| `LatAccel`、`LongAccel`、`VertAccel` | `latAcc`、`longAcc`、`vertAcc` | - |
| `Yaw`、`Pitch`、`Roll`、`YawRate` | 同じ（小文字） | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`、`dcTractionControl` | `absLevel`、`tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | 1.5 を超える場合は 100 で割る |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`、`WaterTemp`、`OilTemp` | `fuel`、`waterTemp`、`oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | カーカスの中央の温度 |
| `LFshockDefl` ... | `suspensionM.FL` ... | ダンパーの変位（m） |
| `LFpressure` ... | `tirePressure.FL` ... | × 0.145038（kPa から psi） |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

ホイールの接頭辞：`LF` は FL、`RF` は FR、`LR` は RL、`RR` は RR です。サンプルごとに一つの値を持つ **ほかのすべての** チャンネル（ビットのフィールド型でないもの）は、自分の名前のまま通されます。ホイールの接頭辞で始まる場合はホイールごとになります（`RRspeed` は `speed.RR` になります）。そのため、グラフとカードの値の一覧は、そのすべてを選べます。iRacing はタイヤのスリップを記録しません。そのため、車の制御は、ドリフト角で判定します。ドリフト角とは、進行方向に合わせた `Yaw` と、車が進んでいく先との差です。また、経路に対するステアリングでも判定します。ヨーレートと横方向加速度の関係は、向きを合わせられないときにのみ使われます。そのため、ドリフト角はありません（[車両の制御イベント](race-control-events.md) を参照）。

エラー：「… は .ibt ファイルとしては短すぎます」、「… に iRacing のテレメトリのヘッダーがありません」、「… に位置の記録がありません」。

#### ラップ CSV {#lap-csv}

サンプルごとに一行です。一つのファイルにある多くのラップは、`lap` 列で区別されます。区切り文字は、最初の 5 行から判断します。省略可能な最初の行 `# { ...json... }` は、走りを説明します：`game`、`track`、`seconds`、`complete`、`meta`、`car`。

| 列（大文字小文字は区別しない） | チャンネル |
|---|---|
| `x`、`y`、`z` | 位置（`x` と `z` は必須） |
| `elapsed` または `time` | `time`（ラップごとに必須） |
| `metres` または `distance` | `distance`（なければ位置から足し合わせる） |
| `speed_ms` または `speed` | `speed`（m/s） |
| `throttle`、`brake`、`steer`、`gear`、`clutch`、`handbrake`、`puddle` | 同じ |
| `lat_g`、`long_g` | `latAcc`、`longAcc` |
| 正規のチャンネル名（例：`latVel`、`slipIndex.FL`） | その名前そのもの |
| `lap` | 行がどのラップに属するか |
| `lap_seconds`、`car`、`car_class`、`pi`、`course` | ラップタイム、車の番号、クラス、PI、コース（各ラップの最初の行から） |

説明がない場合、種目は `forza-horizon` とみなされ、すべてのラップは完走とみなされます。ファイルに複数のラップがある場合、ラップの出どころは `<ファイル> · <ラップ>` と表示されます。エラー：「… に行がありません」、「… に x 列と z 列がありません」、「… に時間の列があるラップがありません」。

#### 種目と路面 {#discipline-and-surface}

ラップが何も言わないとき、分析がそのラップについて仮定することです（`lap.ts`）。

- **種目：** `meta.discipline`。なければ、ゲーム名が `rally|wrc|dirt|rbr` に一致すれば **ラリー**、`trackmania` は **アーケード**、それ以外は **サーキット**。
- **路面：** `meta.surface`。なければ、コース名と出どころから。`monte` を名前に持つラリーは **混在**。`snow|ice|winter|arctic|sweden` は **雪**。舗装路のラリー（Spain/España/Catalunya/Costa Daurada、Croatia/Hrvatska、Central Europe、Germany/Deutschland、Japan、Corsica/Corse、Ypres、または tarmac/asphalt という語）は **舗装路**。`scramble|trail|cross country|dirt|gravel` を含む名前は **未舗装路**。ほかのラリーのステージは、車がどう走らせられたかで判断します。12 m/s より速いサンプルのうち、地面の上にあるもの（少なくとも 200 個）で、横方向加速度の 95 パーセンタイルが 10 m/s² 以上で、かつ、コーナーの 70% 以上（少なくとも 30 サンプル）で曲がっているところでのドリフト角の中央値が 6° 未満であれば **舗装路**。それ以外、または判断材料が少なすぎる場合は **未舗装路**。`rally` を含むラリー以外の名前は未舗装路、それ以外はすべて舗装路です。
- サンプルごとに、`loose` のチャンネル（Forza の路面の振動、Trackmania の素材。[車両の制御イベント](race-control-events.md#the-ground) を参照）が、ラップの路面を上書きします。

