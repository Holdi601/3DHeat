---
title: "レース分析：方法"
parent: "レース分析"
nav_order: 58
lang: "ja"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# レース分析：方法

要約：

- ラップは **時間ではなく距離** で比べます。こうすると、コース上の同じ場所がきちんと重なります。
- 各コーナーは **まるごと** 判断します。ブレーキングゾーンから次のブレーキングゾーンまでです。
- 失った時間は、**どこで** 失ったか（ブレーキング、進入、立ち上がり、ストレート）と、その中で車がどれだけ説明できるかに **分けます**。
- 原因は **言葉で説明** し、助言を付けます。
- 使い方を知りたい場合は、仕組みの説明ではなく [レース分析](race-analysis.md) を見てください。

これは **レース分析** タブの裏にある方法です。何を測るか、どうやって「タイムがどこで失われたか」を決めるか、そしてそれをどう助言に変えるかを書いています。ここに書かれたルールはすべて分析コード（`src/race/`）に対応しており、それを確かめるテストがあります。

## 専門ツールがしていること {#what-the-professional-tools-do}

確立したツールはどれも同じ中核を持っています。違いは主に、*原因* にどこまで踏み込むかです。

- **すべてを時間ではなく距離で比べます。** 2つのラップを一本の距離軸に並べ直します。同じ距離での経過時間の差が *デルタ* です（MoTeC は time variance、ほかは time slip や delta trace と呼びます）。その傾きから、今どこでタイムを失っているかがわかります。傾きが緩ければ加速、空気抵抗、または持続するグリップの差です。急なら、ブレーキかアクセルの差です。上下に揺れる波なら、進入速度と立ち上がり速度の取引きです。
  （[MoTeC i2](https://www.motec.com.au/i2/i2highlights/)、
  [区間タイム分析](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)、
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer)）
- **各コーナーは局面に分けられます**：ブレーキング、進入、中間、立ち上がりです。ブレーキ地点、ブレーキのピークと解放、最低速度とその場所、ギア、アクセルを踏み始める場所、全開に戻る場所、立ち上がり速度を見ます。
  （[Driver61：6つの局面](https://driver61.com/uni/corner-phases/)、
  [iRacing ラップ分析ガイド](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)）
- **コーナーごとのミニセクターと、理論上のベストラップ。** 各セクターで最速だったものをつなぎ合わせます。
  （[Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps)、
  [Overcut](https://overcut.gg/)）
- **走行ラインも比べますが、それだけでは見ません。**「寄与する要因がわかるまで、画像上のラインは意味がない」。速度の波形やデルタと合わせて読みます。
  （[Track Titan：テレメトリの分析方法](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)、
  [Sim Racing Telemetry：レースライン](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)）
- **症状ではなく根本原因を見ます。** ストレートで失った時間は本当にアクセルのせいか。それとも悪い進入のせいで、アクセルを遅く踏むことになったのか。ミスはラップタイムへの損失の大きさで順位をつけ、わかりやすい言葉で説明します。
  （[Track Titan：コーチングの流れ](https://www.tracktitan.io/post/november-2025-update-coaching-flows)）

### 最初の版でまずかったこととその重要性 {#what-went-wrong-in-the-first-version-and-why-it-matters}

最初の版では、各 *局面* を別々に計算し、損失だけを見ていました。ブレーキを早めに踏んだラップは、ブレーキング局面で時間を失うので、「もっと遅くブレーキを踏め」と言われました。しかし、その早いブレーキのおかげで車が早く向きを変え、早くアクセルを踏め、コーナーをより速く抜けられたかもしれません。そして、その差をストレートで全部取り返していたかもしれません。ある試験では、そのように走ったラップに「かなり遅くブレーキを踏め」と伝えました。もう一方のラップは実際に遅くブレーキを踏んでいましたが、アペックスを外して膨らみ、得たものをまさに失っていました。タイムのデータは二つの走り方が同じだと示していましたが、助言は逆のことを言っていました。

修正は、上のすべての情報源が一致しているルールです。**コーナーはまるごと判断します**。そのコーナーのブレーキングゾーンから、次のコーナーのブレーキングゾーンまでです。「コーナーで数ミリ秒を犠牲にすると、その後の区間が速くなり、ラップ全体のタイムが改善することがある」からです
（[人工レースドライバーの運転スタイルを偏らせる](https://arxiv.org/abs/2504.12744)）。

## レースの知識をルールに組み込んでいます {#racing-knowledge-the-rules-encode}

**立ち上がり速度は進入速度より大切です。** 続くストレートが長いほど、その差は大きくなります。「ストレートで過ごす時間がコーナーで過ごす時間を上回る」ためです。立ち上がりで遅れた速度は、次のブレーキ地点まで持ち越されます。コーナーとストレートを最も速く抜ける方法は、しばしば少し遅く曲がり、早くアクセルを踏むことです。*遅く入って、速く出る* です。
（[Race & Track Driving：ラップタイムを上げる手順](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)、
[Driver61：コーナーの優先順位](https://driver61.com/uni/prioritising-corners/)）
立ち上がり速度に報酬を与える最速ラインの計画では、アペックスがより後ろに移り、ラップは *速く* なります。二つをバランスさせる報酬は、長さ `L` のストレートを速度 `v` で走るとき、立ち上がり速度 1 単位あたり `L / v²` です。つまり、ストレートで速度差が失う時間は、その長さに比例して大きくなり、速度の二乗に反比例して小さくなります
（[arXiv 2504.12744](https://arxiv.org/abs/2504.12744)）。

**コーナーは、その先につながるもので分けます。** 直線につながるものは、立ち上がり速度を最大にし、アペックスは遅めにして、できるだけ早くパワーに戻します。直線の手前にあるものは、そこに持ち込む速度を最大にし、できるだけ遅くブレーキを踏みます。アペックスが早くても構いません。二つのコーナーの間にあるものは、その後に重要な方を優先して妥協します。直線につながるか、そうでないか決めきれないコーナーは、直線につながるものとして扱います。速いコーナーほど重く見ます。速度が高いと車の加速は弱く、失った km/h は取り返せないからです。
（[Allen Berg：コーナーの3タイプ](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)、
[Driver61：コーナーの優先順位](https://driver61.com/uni/prioritising-corners/)、
[Driver61：コーナーが違えば技術も違う](https://driver61.com/uni/different-corner-technique/)）

**摩擦円。** タイヤのグリップは一つの予算で、ブレーキ、旋回、加速にどんな割合で使っても構いません。全体の加速度は `sqrt(lat² + long²)` です。トレイルブレーキは、その円のふちをたどります。ハンドルを切り、横方向の力が増えるにつれ、ブレーキを緩めていきます。
（[摩擦円の紹介](https://www.yourdatadriven.com/friction-circle-introduction/)、
[g-g 図](https://trailbrake.com/data-analysis-tips/gg-diagram/)）

**惰性走行**、つまりアクセルもブレーキも踏まない状態は、速度を落とす最も遅い方法であり、それ自体が測定すべき重要な指標です。
（[Racecar Engineering / OptimumG：惰性係数](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)）

**スリップ。** 前後方向の力は、スリップ率がおよそ 10〜20% でピークになり、その後は下がります。それを超えると、ブレーキでタイヤがロックするか、加速でホイールが空転します。Forza は、スリップを正規化した値で報告します。0 は完全なグリップ、1 を超える大きさはグリップを失ったことを意味します。
（[前後方向のスリップ](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)、
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)）

**アンダーステアとオーバーステア。** 前輪のスリップ角が後輪より大きいとアンダーステア、後輪のほうが大きいとオーバーステアです。スリップ角がないときは、ハンドルの入力に対して車が十分に曲がらないことを指します。低速で車が必要とするアッカーマン角 `L/R` を超えるハンドル角です。
（[アンダーステアの概要](https://www.sciencedirect.com/topics/engineering/understeer)、
[アンダーステアとオーバーステア](https://en.wikipedia.org/wiki/Understeer_and_oversteer)）

## ラインの幾何学 {#the-geometry-of-a-line}

半径 `R` のカーブで車が出せる速度は `v = sqrt(a R)` です。`a` はタイヤが生み出す横方向の加速度で、ダウンフォースが加える分（`v²` に比例して増えます）も加わります。したがって **速度は半径の平方根に比例して増えます**。中心寄りを通るラインで、半径が 20% 大きければ、そこでの速度はおよそ 10% 速くなります。
（[最大コーナリング速度](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)、
[formula1-dictionary：コーナリング](https://www.formula1-dictionary.net/cornering_tech.html)）

**幾何学的なライン** は、コーナーを通る最も大きな円弧です。外側のふちから出発し、アペックスで内側に触れ、また外側に戻ります。幅 `w` の道路で角度 `θ` を曲がるとき（車の幅を引いた分）、両方の外側のふちに接し、内側の角に触れる円弧は `R = w / (1 - cos(θ/2))` になります（内側のふちの半径も加えます）。直角なら約 `3.4 w`、ヘアピンなら `w` です。そのため、道幅を使うことは中速コーナーで最も大切で、ヘアピンでは最も大切ではありません。
（[レースライン](https://en.wikipedia.org/wiki/Racing_line)）

**遅いアペックス** は、遅く、深く曲がり始めます。最初は半径が小さく、出口に向けて半径を広げます。中間部は遅く、ストレートには早く、全開には早く戻ります。「最低速度はわずかに下がるが、立ち上がりの加速プロファイルが強くなる」。**早いアペックス** はその逆です。進入は速いですが、出口に向けて半径が狭まり、アクセルを抑えることになります。非常に低いグリップの場合を除けば、ほぼ間違いです。その場合、進入で失った速度は、後から取り返せないからです。
（[レースライン](https://en.wikipedia.org/wiki/Racing_line)、
[レーステレメトリの用語](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)、
[レースラインの数学 パート2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)）

**「V」と「U」。** U は古典的な丸いラインです。最も大きな半径で、ハンドルの切り替えが最も少なくて済みます。V は早めに曲がり始め、深く入り、中間で車を素早く向け、出口を直線に近づけます。ブレーキは真っすぐに保てるので遅くまで踏めます。最低速度は低いですが、より後で到達します。全開はずっと早く来ます。
（[Track Titan：V ライン](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)）

**曲率と距離。** 最速のラインは、最短の経路と最も曲がりの少ない経路の妥協点です。サーキットの幅では、曲率のほうが重要になります。最小曲率のラインは、車が限界にあるところでは最小タイムのラインに近くなります。車が加速できるところでは、そこから離れます。
（[グローバル最小時間軌道計画](https://www.nature.com/articles/s41598-025-21211-2)、
[TUM グローバルレース軌道最適化](https://github.com/TUMFTM/global_racetrajectory_optimization)）

**連続するコーナー**（ダブルアペックスやシケイン）は、一つの問題として扱います。一つ目の出口のラインが、二つ目の進入のラインになります。ストレートにつながる最後のコーナーから、逆向きに組み立てていきます。
（[Driver61：コーナーが違えば技術も違う](https://driver61.com/uni/different-corner-technique/)）

## どの車にどのラインが合うか {#which-line-suits-which-car}

それを決めるのは、そのコーナーの速度域での車の **パワーとグリップの比** です。「勢い（モメンタム）はグリップとパワーの比の問題だ」。
（[Ross Bentley：モメンタムカー](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)、
[勢いはホースパワーに勝る](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)）

| このコーナーでの車 | ライン | 理由 |
|---|---|---|
| グリップの割に強く加速する（「踏んで行く」） | V：まっすぐ遅くまでブレーキ、短くタイトな中間部で向きを変え、早く真っすぐ・フラットにする | タイムは最低速度ではなく、全開で稼ぐ |
| グリップの割に加速が弱い（「勢い」型） | 広めの U、少し遅いアペックス、最低速度を高く保つ | 擦って失った速度は取り返せない |
| その中間 | 遅く入って速く出る：遅いアペックスの U | 古典的な妥協点 |
| 速いコーナー（ダウンフォースがあればなおさら） | U、幾何学的なラインに近く | 速度が高いと加速は弱い。ダウンフォースによるグリップは `v²` とともに増えるので、中間部の速度が二重に効く |
| とても低いグリップ（雨、雪） | 早いアペックス | 進入で失った速度は、出口で取り返せない |
| グリップをはるかに超えるパワー | ラインの影響は小さい | 出口を制限するのはラインではなく、トラクション |

「コーナーが速いほど幾何学的なラインに近づき、遅いほど遅いアペックスで大きく変える」。
（[Skip Barber：Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)、
[レースラインの数学 パート2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)、
[Track Titan：V ライン](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)、
[Driver61：グリップ](https://driver61.com/uni/grip/)）

駆動方式は、ラインそのものより、そのライン上の走り方を大きく変えます。前輪駆動の車は、ブレーキで車の向きを変え（トレイルブレーキ）、ホイールがほどけるにつれて初めてパワーを与えます。そうしないと外に膨らみます。パワフルな後輪駆動の車は、全開にする前にまっすぐになっている必要があります。そうしないと、リアが流れます。四輪駆動は、曲がりながらでもパワーをかけられるので、アクセルを早く踏めます。
（[FWD の技術](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)、
[RWD と FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)、
[AWD と RWD のコーナリング](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)）

ビューアーは、各コーナーで車のパワーとグリップの比を、その車自身の走りから測ります。立ち上がり速度での全開加速を、最低速度での横方向グリップで割った値です。0.45 以上なら「踏んで行く」、0.25 以下なら「勢い」と呼びます。150〜250 km/h でのグリップが、55〜110 km/h でのグリップより 15% 以上高い車は、ダウンフォースが効いています。

## 方法 {#the-method}

以下の数字が、その考え方です。コードが使うしきい値は、それぞれ一つのページにまとめてあります。ここの数字とそれらが違う場合は、それらのページが基準になります：[コーナーごとの分析](race-corner-analysis.md)、[車両の制御イベント](race-control-events.md)、[車両プロファイルと比較](race-car-profiles.md)、[コースの統計](race-course-statistics.md)。

### 1. 一つの距離軸 {#one-distance-axis}

最速のラップが基準です。ユーザーが別のものを選ばない限り、そうします。その走行経路が軸になります。ほかのすべてのラップのサンプルを、その軸に投影します。こうすると、各サンプルは基準上の距離 `s` と、符号付きの横方向のずれ `d` を得ます。投影は前回の一致点から先へだけ探すので、自分と交差するラップが橋の反対側に飛ぶことはありません。その後、すべてのラップを、すべてのチャンネルについて 2 m ごとの一つの格子に並べ直します。各ラップは最後の数メートルを、その時の速度のまま走ります。そのため、ゴールでのデルタは、ラップタイムの差になります。

### 2. コーナー、そして各コーナーのラップ内の割合 {#corners-and-each-corners-share-of-the-lap}

コーナー、区間、複合コーナーがどのように見つかるか：[コーナーごとの分析](race-corner-analysis.md#segments-braking-zone-to-braking-zone)。

### 3. コーナーのタイムの内訳 {#the-time-account-of-a-corner}

差し引き、分割、立ち上がり速度、そして車の引き：[コーナーごとの分析](race-corner-analysis.md#the-time-account-of-a-corner)。

### 4. 判定と原因 {#the-verdict-and-the-cause}

判定のパターンと、進入と出口での原因：[コーナーごとの分析](race-corner-analysis.md#the-verdict-and-the-finding)。

### 5. 車と運転者の比較 {#the-car-against-the-driver}

ラップが異なる車で走られた場合、車が説明できる損失を、次の部分ごとに取り除きます。

- **引き**：同じ速度からストレートを下ったときの車。上に書いたとおりです。
- **グリップ**：狭い半径では説明できない、低い最低速度のうち、次の割合です。`½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`。ラップがその車の限界で走られていた場合のみです（その速度で見せたものの 90%）。
- **ブレーキ**：`u` から `v` まで、減速度 `a1` 対 `a2` で減速し、同じ地点で終わる場合の損失は `(1/a1 - 1/a2)(u - v)² / 2u`です。ピークだけでなく、ゾーン全体の平均でその車がほぼ最大限に強くブレーキを踏んだ場合のみです。

車ができることは、その車の読み込まれた全ラップから決まります。5 m/s の速度ビンごとに、横方向のグリップ、ブレーキ、全開加速を求めます（95 パーセンタイル、95 パーセンタイル、90 パーセンタイル）。グリップとは、車が **0.5 秒間保った** もの、つまり 0.5 秒間で平均した横方向の加速度です。単一のサンプルが触れた値ではありません。縁石、滑りが戻るところ、車を捕まえ直すところは、どれも一瞬だけ値を跳ね上げます。そのように頻繁に起きる車は、実際よりグリップがあるように見えてしまいます。（二つの異なる車の記録ラップで確かめました。サンプルごとの測り方では二台がほぼ同じになりました。0.5 秒間保つ測り方では、二台のラップタイムと同じように区別できました。）ブレーキと引きは、各サンプルを自分と近くのサンプルの中央値として扱います。空気の抵抗、着地後の落ち着き、そして車が回復するまでのすべての接触（6節）は除外します。

**各車がどんな車か**（`profile.ts`）。同じラップから、次を求めます。

- **保てるグリップ**：0.5 秒間の横方向加速度の 95 パーセンタイル。
- **引き**：全開で 50 km/h まで、50〜120、120〜200、200 超の各区間、そして示した最大値。
- **ブレーキ**：60 から 160 km/h まで。
- **最高速度**：ストレートで 1 秒間、全開にしても加速が止まったところ。ストレートを直進しているところで、長いカーブを平らに抜けるところではありません。カーブではどんなパワーでも速度を失うからです。どのストレートも十分に長くない場合は、最も速いところでまだ引いていた値が、どれだけ離れていたかを示します。ラップが示す以上の推測はしません。空気抵抗に対するパワーと速度のフィットでは、一般道の車を実際の最高速度より 100 km/h も高く出してしまいました。ギア比とリミッターが、空気抵抗より前に車の引きを終わらせるからです。
- **リアを失う**：ラップごとに、10° を超えて滑った回数（砂利では 20°）。その際、ハンドルはコーナーと反対向きに切られていました（カウンターステア）。そのうち、アクセルを踏んでいる最中に始まった回数と、それが始まったときのグリップの割合。わざと少し横を向けて走る車は、何も失っていません。捕まえ直す必要のある車は失っています。すべての車を同じ方法で数えるので、二台の車を比べることができます。
- **バランス**：ラップがスリップ角を持つ場合、限界での前輪と後輪の比較。

**比較された車** は、車を並べて比べます。表があり、各車が他方に対してどうであるかを一文で書きます（「X の方が加速は良いが、同じように曲がれず、止まるのに時間がかかり、リアを失いやすい」）。明確な差はすべて書きます（グリップ 4%、引きかブレーキ 5%、最高速度 4 km/h、ラップごとに少なくとも一回多くリアを捕まえ直す場合は、その 1.5 倍の頻度）。そして各車の走らせ方も書きます。車が一台だけなら、その車がどんな車かを書きます。

**各コーナーでは**、ラップが異なる車で走られた場合、その結論は、車がどれだけ決めているかと、この車をどう最大限に生かすかを書きます。

- **中間部**：相手の車のラインなら、この車のグリップで許される速度は `v_other · √(grip_mine / grip_other)` です。ラップがその速度を保っていれば、差は車によるものです。どのブレーキ地点もそれを変えられません。そう書き、そのコーナーは運転者ではなく車のせいだとします。それより遅く抜けていれば、残りは取り返せる余地があり、その量も書きます。次に、そのタイムをどこで稼げるかを書きます。直線につながる場所か、より強く引く車ならアペックスの後です。まっすぐブレーキを踏み、遅めに曲がり始め、早く出口に向けます。それ以外は、道路が許す最も大きな半径です。より大きな半径は、グリップを増やさずに速度を上げる唯一の方法だからです。
- **リアが流れた**：ここで、相手の車より失いやすい車の場合。この車でどうするか：ホイールがほどけるにつれてアクセルを入れていくか、コーナーの途中で持ち上げずに、ブレーキを優しく緩めていくか。どのように滑りが始まるかによります。
- **その後のストレート**：同じ速度からの相手の車のより強い引きが、どれだけ稼いだか。そして、この車がそこでどこで引きを使い切ったか。
- **より早いブレーキ地点**：ブレーキを強く踏めない車の場合。

ラップがコーナーの中間で滑った場合（舗装路で 10° を超えて滑った場合）、それはグリップが足りなかったのではなく、グリップの限界を超えていたのです。そこではグリップに余裕があるとは決して伝えません。また、そのラップで車のリアが、コーナーが求めた横方向加速度より小さい値で流れた場合、「余裕のあるグリップ」は、小さな段階を踏んでそれを見つけるよう伝えます。

### 6. 車の制御：ロック、ホイールスピン、滑りと押し出し、接触と衝突 {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

すべてのラップは、車がどう扱われたかについても読まれます。どこでホイールがロックしたか、駆動輪がどこで空転したか、リアがどこで出たか、フロントがどこで外に膨らんだか。これらは、タイムだけでは名前がつかないミスだからです。ゲームやサーフェスをまたいで、これが成り立つように三つのことをしています。

**グリップがどこで終わるかは、その車自身の走りから測ります。** エンジニアは、車ごとのロックのしきい値を、最も減速度が大きくなったスリップで設定します（OptimumG のブレーキ シリーズでの MoTeC のチャンネルは、ある車では -0.07 を使います）。教科書の値は使いません。そして教科書の値はそもそも食い違います。舗装路では、力のピークはタイヤやモデルによって 5〜20% のスリップで現れます。雪では、情報源によって 6%、または 20〜60% です。砂利については、どの情報源も値を示していません。ゲームはさらにスリップの尺度が異なります。Forza のスリップは「正規化」されていて、1 を超えるとグリップを失ったことになります。しかし車のブレーキは、その 1 を大きく下回る、あるいは大きく上回るところで最も良く効くことがあり、ふつうのブレーキ ゾーンは 1 を超えることもあります。そこで、車ごとに、読み込まれたその車の全ラップについて、発生した力を、走ったスリップに対して区分します。直線のブレーキでは、減速度を車輪のスリップ率に対して。加速では（その速度で車が出せる量の割合として）、駆動輪のスリップに対して。コーナリンググリップ（その速度での車のグリップの割合として）を、各車軸のスリップ角に対して。そして限界は、力が 8% 落ちた最良点を超えたスリップです。データの中で一度も下がらない曲線（Forza Horizon の旋回と牽引）には限界がなく、スリップだけではそこでは何も示しません。データが少なすぎる場合は、限界は公称ピークの 1.5 倍とします。

**地面は、ゲームがそれを示している場合はサンプルごとに分かります。** Forza は砂利、ダート、草の上でタイヤを振動させます（舗装のサーキットではサンプルがほとんどなく、ダートやクロスカントリーのコースでは多くあります）。Trackmania は各ホイールの下の素材を示します。ラリーのステージの路面は、11節で説明するように見つけます。カーブ、ドリフトの癖、しきい値は、舗装路と未舗装路で別々に保ちます。

**どの出来事も、同じメートル数の範囲で、もう一方のラップと並べて比べます。** 砂利、雪、ドリフトの多いアーケードレースでは、滑りがコーナーの走り方そのものです。最適制御の研究では、舗装路では「低ドリフト」の解、オフロードでは「攻撃的で、高ドリフト、カウンターステアさえ使う」解が見つかっています。ラリーのデータでは、タイヤが「非線形領域のかなり内側」にあることが示されています。非常に緩い路面でホイールをロックさせると、車を早く止めることさえできます。そのため、もう一方のラップも起こした出来事（その 80% 以上）は、コーナーの走り方であり、ミスではありません。もう一方が起こさなかった出来事は、時間を失わせた場合にのみミスです。その時間は、出来事の直前から、その 40 m 後までに失った時間です。コーナーの損失の 40% 以上を説明するミスは、そのコーナーの原因になります。

判定のしきい値、もう一方のラップとの比較、接触と衝突、そして助言の文章：[車両の制御イベント](race-control-events.md)。

### 6b. 多くのラップ：コースの統計 {#b-many-laps-the-courses-statistics}

クラス比較、何をミスと数えるか、統計、そしてミスマップ：[コースの統計](race-course-statistics.md)。

### 7. 走行ライン {#the-driven-line}

各ラップとコーナーについて、位置だけから求めます。曲がり始めた場所（最もきつい曲率の 5 分の 1 の地点）、最もきつい半径（±8 m の範囲）、進行方向の変化の前半と後半それぞれの平均半径、など。

- **形**：最もきつい半径を平均半径で割った値が 0.55 未満なら V、0.75 を超えれば U です。
- **アペックス**：出口の半径を進入の半径で割った値が 1.25 を超えれば遅いアペックス、0.8 未満なら早いアペックスです。
- **速度の頂点**：最も遅い地点が、そのターンの半分の地点より 15 m 以上前なら、遅く入って速く出ています。15 m 以上後なら、中間部を過ぎても減速し続けています。

もう一方のラップと比べると、曲がり始めでどれだけ内側か外側を走ったか、最もきつい部分と両方が平らになっているところでどうだったか、そして各ラップがどこで曲がり始めたかがわかります。各判定は、そのラップの車がそのコーナーで合うラインで締めくくられます。そのコーナーがどこにつながるか、車の計測されたパワーとグリップの比、ダウンフォース、駆動方式によって決まります。そして、そのラップがそのように走ったかどうかも示します。「コーナーごと」の表は、各コーナーを通る最速のラップと、そのラインの形を示します。さらに、最良のコーナーをまとめたものも示します。

### 8. 二つの地図 {#two-maps}

- **どこで**：コースを、基準に対する `dΔt/ds` で色分けします。タイムを失っている場所は赤、得ている場所は緑です。
- **なぜ**：各損失は、その原因のある場所に描かれます。原因のグループ（ブレーキング、進入、立ち上がり、ストレート、車）で色分けし、コストの大きいものほど太く描きます。

### 9. リプレイ {#replay}

一つの時計を、各ラップ自身のタイムに変換する三つの方法があります。ライン上で、整列させて（すべてのラップがコース上の一点に同じ瞬間に到達し、そこから解き放たれる）、そして並べて（すべてのラップを基準の距離に保つ）。

### 10. 世界の向き {#which-way-round-the-world-is}

ビューアーの世界は右手系で、Y が上です。左手系の世界を持つゲーム（Forza もその一つ）は、そこで鏡映しになります。右に曲がるカーブはすべて左に曲がるものとして描かれ、コースもラップも同様です。ラップ自身がそれを示します。正のステアリングは、どのアダプターでも右向きで、カーブの外側のサスペンションは縮みます。そのため、レースのタブはそれを直すことを提案し、**Camera & scene → Invert world axis** がそれを行います。X、Y、Z のいずれかを逆向きに描きます。変わるのは描画だけです。ビュー行列に折り込まれた反転です。カメラは描かれた世界の中を飛びますが、データ、分析、ツールが示す座標はすべて、ゲーム自身のままです。分析も同じ測り方で、カーブを左か右かと名付けます。

### 11. ラリー：滑り、左足、空中 {#rally-the-slide-the-left-foot-the-air}

ラリーのステージは、より悪いグリップで走るサーキットではありません。砂利や雪の上では、滑りがコーナーの走り方そのものです。車は、進入で重心を移すことで向きを変えます。「ブレーキは車の重心を前に移す……前輪がグリップを得て、後輪がグリップを失い、車は滑りながらコーナーに入って回る」。その後、「行きたい方向に向いた」ら、アクセルに戻します（[DirtFish：ブレーキの使い方](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)）。左足でブレーキを担当し、アクセルとブレーキを組み合わせて使えるようにします。サイドブレーキは、狭いコーナーで車の向きを変えます（[RallySport Ontario：ラリー運転の基本](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)、[スカンジナビアン・フリック](https://en.wikipedia.org/wiki/Scandinavian_flick)）。そして車は地面を離れます。6節では、滑りをもう一方のラップと比べて読んでいます。以下のルールが、残りを担当します。

- **路面。** ラップが示すもの（`meta.surface`、ラリーの記録装置の `--surface`）。次にイベントの名前（舗装のラリー：スペイン、クロアチア、中央ヨーロッパ、ドイツ、日本、コルシカ、イーペル。冬のラリー：雪。モンテカルロの舗装路で雪や氷が残るもの：混在）。最後に、車がどう走らせられたか。Rally2 車の横方向の限界は、砂利では 0.7〜0.9 g、舗装路では 1.3〜1.4 g です（[grenzbereich、参考値](https://github.com/GitCrush/grenzbereich)）。砂利ではドリフトがずっと多くなります（6節）。したがって、車が 10 m/s² 以上（95 パーセンタイル、速度域、その路面上）で引いていて、コーナーの 70% 以内で曲がっているどこでも、中央値のドリフトが 6 度未満のステージは舗装路とします。それ以外、または判断材料が少なすぎる場合は、未舗装路とします。
- **その路面で、車ができること。** グリップ、ブレーキ、引き（5節）は、ラップが各路面でサンプルの 5 分の 1 以上を走っている場合、舗装路と未舗装路を別々に測ります。各コーナーは、最も遅い地点で車の下にあった路面を使って判定します。空中にあるサンプルと、着地後 0.3 s の間のサンプルは、車を測るすべてのものから除外します。たとえば、エンベロープ、タイヤの曲線、ロックやホイールスピンです。着地は、タイヤができることを超えて車を揺らします。また、空中で空転したホイールは、ホイールスピンではありません。ダウンフォースは未舗装路では判定しません。そこでは、ステージの速い区間と遅い区間が別の道だからです。
- **左足を少し当てるのは、ブレーキではない。** アクセルがまだ半分以上踏まれている状態で、15 m 未満の間に軽くブレーキを当てるのは、車を落ち着かせるか、向きを変えるためのものです。ラップがコーナーのためにブレーキを踏み始めたのは、アクセルが離れたときのその最初のブレーキです。または、それより長く続いたブレーキです。
- **進入で車を回した。** 各ラップとコーナーについて、ブレーキ開始から最も遅い地点の 5 m 先までの、最大のドリフト角です。未舗装路では、もう一方のラップより車を 8 度以上少なく回し（もう一方は 12 度以上回した）、より遅くパワーをかけた、または全開にしたラップは、**車を少なく回しました**。助言は、向きを変えていくときにリフトするか、左足のブレーキを少し当てて、リアが回り込むようにすることです。もう一方のラップがサイドブレーキを使ったところで使うか、54 km/h より遅いコーナーではサイドブレーキを使うこともあります。そして、アペックスの前に出口を向いているようにします。もう一方より 12 度以上多く回し、それでもパワーを遅くかけたものは、**回しすぎました**。パワーを落とす前に、まっすぐにする必要がありました。どちらの場合も、車の制御のミスの後に、出口でのそのコーナーの原因になります。未舗装路での走行ラインの助言も、すべてのコーナーで同じことを言います。
- **空中。** もう一方のラップより 0.2 s 以上長く空中にあり、離陸の 10 m 前から着地の 40 m 後まで（またはコーナーの終わりまで）に時間を失ったもの。それが、コーナーの損失の 40% 以上を説明する場合は原因です。その後のコーナーは、より遅く到達したことで、それを示します。空中では、車は曲がることも、ブレーキを踏むことも、駆動することもできません。助言は、離陸時にもアクセルを入れたままにすることです。「離陸中にアクセルを戻さない」。アクセルを戻すと、ノーズが下がるからです。そして、頂上をわずかにゆっくりと、またはブレーキを少し当てて越えます。そうすると車は低く保たれます（[DirtFish：ラリーカーのジャンプ方法](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)）。
- **曲がり 3 つまでの複合コーナー。** まったく平らにならずに走られる曲がりくねった区間は、一つの長い複合コーナーではありません。曲がりが 3 つを超えると、新しい複合コーナーが始まります。

`src/race/rally.test.ts` は、単純なモデルで走らせたステージについて、この分析のすべてを確かめます。車が少なく、遅くパワーをかける場合、より長い空中、左足の小さなブレーキ、曲がりくねった区間、舗装路と砂利の比較です。

## データと、各ソースが許すこと {#data-and-what-each-source-allows}

| ソース | レート | チャンネル | 許すこと |
|---|---|---|---|
| FH Companion のラップファイル | 約 5 m | 位置、速度、スロットル、ブレーキ、ステアリング、横方向と前後方向の加速度、ギア | 車の制御以外のすべて（車の制御には隣のテレメトリが必要） |
| FH Companion の `.tele.gz`（各ラップファイルの隣） | ゲームの 64 Hz（すべてのパケットを保存する記録装置は、1 秒あたり約 110 を書き込みます。繰り返しは捨てます） | Forza の Data Out のすべて：ホイールごとのスリップ率、スリップ角、合成スリップ、回転、サスペンション、路面の振動。車のフレームでの速度。ヨーレート | すべて（車の制御を含む） |
| `heat3d_capture telemetry` が記録する Forza Data Out | 60 Hz | 上記のすべてに加えて、ホイールごとに、タイヤ温度、スリップ率、スリップ角、合成スリップ、サスペンションの移動量、ホイール速度、ランブルストリップ。RPM、パワー、トルク、ヨーレート | すべて |
| Assetto Corsa、ACC、AC EVO、AC Rally（共有メモリ、`heat3d_capture telemetry --game ...`） | 60〜333 Hz | 上位互換：タイヤのコアと内側・中央・外側の温度、圧力、ブレーキ温度、ホイール荷重、キャンバー、スリップ率と角度。車のフレームでの速度。ABS と TC の作動（ACC、EVO、AC Rally） | すべて |
| iRacing の `.ibt`（直接読み込み） | 60 Hz | GPS からの位置、ペダル、ステアリング、g、ヨー、ホイールごとのカーカス温度、ダンパーの変位、圧力、摩耗 | すべて。車の制御は、ドリフト角（ヨーと進行方向の差）とステアリングから。スリップは記録されないため含まれない |
| EA SPORTS WRC、DiRT Rally 2.0 / 1 / DiRT 4（UDP） | フレームごと、100 Hz | 位置、ワールド速度と車の軸、ホイールごとの接地面の速度とサスペンション、ペダル、ステアリング、ステージの時計と長さ | すべて。スリップとドリフト角は導出 |
| Richard Burns Rally（NGP UDP） | 物理ステップごと | 位置、車自身の速度、ホイールごとのばねの変位と力、ペダル | ホイールのスリップを除くすべて |
| BeamNG.drive（`heat3d` プロトコルの mod） | 最大 100 Hz | 位置、ワールド速度と軸、ホイールごとの表面速度、回転、荷重、地面との接触 | すべて。スリップとドリフト角は導出 |
| Trackmania（Openplanet プラグイン） | フレームごと | 位置、前方と横の速度、ペダル（ブレーキのオン／オフ）、ステアリング、ホイールごとのスリップ係数と緩い地面、空中 | すべて。ドリフト角は横の速度から |

すべてのソースは、一つのラップ形式 `heat3d-lap` に変換されます。そのチャンネルには正規の名前（`speed`、`throttle`、`tireTemp[FL]` など）が付きます。車のグリフとグラフは、ラップが持つチャンネルをすべて描きます。

## ソース {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [区間を速くする：タイムの分散の形](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer（距離領域のデルタ）](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing ラップ分析ガイド](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry：セッションのラップ](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry：レースラインの分析](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut：セクターからの理論上のベスト](https://overcut.gg/)
- [Track Titan：テレメトリの分析方法](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG：ブレーキ分析、ロックと安定性の KPI（2019年9月）](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG：スロットルについて（2020年1月）](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM：レースドライバーの重要業績指標（arXiv 2005.10044）](https://arxiv.org/pdf/2005.10044)
- [タイヤと路面の摩擦モデルと最適スリップ（PMC9920324）](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB：タイヤと路面の摩擦、雪と氷でのピークのスリップ](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard：タイヤの摩擦係数、ピークと滑走](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline：前後方向の力](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline：横方向の力](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [車両の安定性、車体の滑り角の限界（arXiv 1104.1582）](https://arxiv.org/pdf/1104.1582)
- [高いスリップ角でのラリー走行（Georgia Tech、IJVAS）](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [最小時間のラリー機動（Georgia Tech、ISIE 2005）](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC の基準ヨーレート（arXiv 2305.18422）](https://arxiv.org/pdf/2305.18422)
- [ステアリングをヨーに対して切ることによるオーバーステアとアンダーステアの検出（US10293852B2）](https://patents.google.com/patent/US10293852B2/en)
- [EDC：ステアリング角、アッカーマン、アンダーステアの勾配](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM：数学チャンネル（Kus、合成 g）](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta：オーバーステアとアンダーステアのウィジェット](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [カデンスブレーキ：非常に緩い路面でのロック](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy：砂利のラリーでのデータ記録](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish：ブレーキの使い方](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish：ラリーカーのジャンプ方法](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario：ラリー運転の基本](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [スカンジナビアン・フリック](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich：ラリー車の力学、参考値](https://github.com/GitCrush/grenzbereich)
- [Trackmania のスピードドリフト練習プラグイン（定数）](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania のスピードスライドの解説](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan：コーチングの流れ](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan：V ライン](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [人工レースドライバーの運転スタイルを偏らせる（立ち上がり速度対最小タイム）](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving：ラップタイムを上げる手順](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools：コーナーの3タイプ](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61：コーナーの優先順位](https://driver61.com/uni/prioritising-corners/)
- [Driver61：コーナーが違えば技術も違う](https://driver61.com/uni/different-corner-technique/)
- [Driver61：コーナーの6つの局面](https://driver61.com/uni/corner-phases/)
- [Driver61：グリップ](https://driver61.com/uni/grip/)
- [Skip Barber Racing School：Going Faster（抜粋）](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley：モメンタムカーとは](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [勢いはホースパワーに勝る論争](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [レースラインの数学 パート2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD と FWD パート1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD の技術](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD と RWD のコーナリング](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [レースライン](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary：コーナリング技術](https://www.formula1-dictionary.net/cornering_tech.html)
- [最大コーナリング速度](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [レーステレメトリの用語](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [曲率と距離を考慮した、グローバルな最小時間軌道計画](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM：グローバルなレース軌道の最適化](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG：惰性係数](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [摩擦円の紹介](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com：g-g 図](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [前後方向のスリップ](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [アンダーステアの概要](https://www.sciencedirect.com/topics/engineering/understeer)
- [アンダーステアとオーバーステア](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out のドキュメント](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard：トラクション制限の加速](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard：パワー制限の加速](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO の共有メモリ](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally テレメトリリーダー](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT の解析](https://github.com/teamjorge/ibt)
