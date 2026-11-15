---
title: "移動速度"
parent: "作戦ボード"
nav_order: 1
lang: "ja"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# 移動速度

兵士、戦車、ジェット機がAからBへ行くのにどれくらいかかるか。このページでは、[作戦ボード](tactics-board.md)の各フィギュアがどれくらいの速さで動くか、そしてその数値がどこから来るかを説明します。計画の時間を信用したり、変更したりできるようにするためです。

[作戦ボード](tactics-board.md)は、各フィギュアの速さから計画の時間を計ります。速度は、`src/tactics/speeds/` にあるゲームごとの1つのファイルから来ます。各クラス（歩兵、地上車両、船、航空機、ヘリコプター）の移動モードごとの速度に加え、CS2 の武器ごと、または航空機の種類ごとのような名前付きのプロファイルがあります。どのファイルも出典を示します。どの値も、**公式**（ゲーム自身のデータ、または実在の航空機の公表値）か、**概算**（コミュニティによる測定、または典型的な値）かを示します。

これらは出発点です。**どのフィギュアも、ボード上で速度を上書きできます**。そのため、計画では、測定された速度、重い荷物を持つ兵士、損傷した戦車を使うことができます。

## モード {#modes}

| クラス | モード |
|---|---|
| 歩兵 | 匍匐（伏せ）、しゃがみ、歩行（遅く静かな歩き）、走行（既定の移動）、全力疾走 |
| 地上車両、船 | 低速、慎重、通常（不整地）、急行（道路の最高速度） |
| 航空機、ヘリコプター | 低速（進入、旋回待機、ホバリングのタクシー）、巡航、戦闘（旋回速度または攻撃の進入）、最大 |

ゲームにないモードは空欄のままです。CS2 と Valorant には全力疾走も伏せもありません。

## 斜面 {#slopes}

各ファイルは、そのゲームが斜面をどう扱うかも示します。CS2、Valorant、Squad は水平方向の速度に上限があるため、斜面はプレイヤーを遅くしません。Arma は斜面で歩兵を遅くするため、そのファイルと汎用のファイルは Tobler のハイキング関数を使います。Battlefield と車両のシミュレーターは、単純な勾配のペナルティを使います。

## ゲームごと {#per-game}

**Counter-Strike 2**（1秒あたりの単位。1単位は1インチとして扱う）。**公式**。走行速度は、ゲームの武器定義にある `m_flMaxSpeed` の値です。ナイフと C4 は 250、グレネードは 245、ピストルは 240（デザートイーグル 230、R8 180）、SMG は 220〜240、ライフルは 210〜225、AWP は 200、LMG は 195 と 150。スコープ付きの AWP（100）、AUG と SG 553（150）、G3SG1 と SCAR-20（120）は、それぞれ独自のプロファイルを持ちます。歩行は走行 × 0.52、しゃがみは走行 × 0.34 です。Valve はこの 2 つの係数を公表していませんが、どの武器もデモの記録でそれを示しています。計画を実際の動きと照合するには、同じマップでデモを読み込み、プレイヤーの速度を比べてください。

**Valorant**（m/s）。ナイフは 6.75 m/s で走ります。各武器は、ゲームデータの走行速度の倍率をそれに掛けます。これにより、ゲーム内のアーセナルが表示する速度になります。ほとんどのサイドアームと SMG は 5.73、ライフルは 5.4、ヘビー級とオペレーターは 5.13、ショットガンは 5.06 です。これらの走行速度は正確です。歩行としゃがみの速度は、Riot が公表していないため**概算**（走行の 0.55 と 0.4 倍）です。スコープ付きのスナイパーのプロファイルも概算です。

**Battlefield**（km/h）。**概算**。EA は移動の数値を公表していません。歩兵は、伏せて約 1 m/s、しゃがんで 2、走って 4、全力疾走で 6.4。車両、ジェット機、ヘリコプター、船は、それぞれのクラスのゲーム内の典型的な速度を得ます。

**Squad**（km/h）。**概算**。走行（3.3 m/s）と全力疾走（5.9 m/s）は、ゲームの仕組みについてのコミュニティの解説から得ています。匍匐、しゃがみ、ゆっくりした歩行は概算で、すべての車両クラスとヘリコプターも同様です。

**Arma**（km/h）。**概算**。歩兵の速さは、コミュニティによる計測です。歩行は約 5 km/h、しゃがんだ戦術的な速さは 9 km/h、ジョギングは 15 km/h、全力疾走は約 21 km/h です。車両の最高速度は、第三者の一覧にある、バニラの Arma 3 車両の各クラスの設定された最大値です。遅い車両のモードは概算です。

**DCS / War Thunder / IL-2**（km/h）。パレットにあるすべての航空機とヘリコプターが、それぞれ独自のプロファイルを持ちます。巡航と最高速度は、実在の航空機の**公表値**です。シミュレーターはこれをよく再現しています。最高速度は、ジェット機は海面高度、プロペラ機は定格高度で、どちらかは各プロファイルの注に書かれています。低速と戦闘速度は典型的な値です。地上車両は、実在の車両の公表された道路での速度を丸めたもの（**概算**）を使います。船は、その種類の公表された最高速度を使います。

**その他**（m/s）。**概算**の実世界の既定値: 匍匐 0.5、しゃがみ 1.5、歩行 1.4、走行 3.5、全力疾走 6。

## 出典 {#sources}

Counter-Strike 2
- [CS2 の武器定義（`weapons.vdata`）、SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB の武器ページ](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com の武器（走行速度の倍率）](https://valorant-api.com/v1/weapons)
- [VLR.gg: ナイフの速度 6.75 m/s](https://vlr.gg/post/4240306)
- [Riot サポート: 歩行、走行、しゃがみ](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA フォーラム: Battlefield 6 の移動速度](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 の移動ガイド](https://deltiasgaming.com/?p=309455)
- [6.4 m/s の全力疾走についての公開前のレポート](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad のゲームメカニクスの投稿（2018）](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/)（速度は公表していない）

Arma
- [Bohemia フォーラム: 歩行速度](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia フォーラム: 移動速度の調整](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 フィードバックのトラッカー: 全力疾走の速度](https://feedback.bistudio.com/T64047)
- [Arma 3 フィールドマニュアル: 歩兵の操作](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [陣営ごとの Arma 3 車両の数値（holy.gg）](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- 各航空機とヘリコプターの種類の Wikipedia の仕様。`air.json` の各プロファイルからリンクされている
- [V 速度](https://en.wikipedia.org/wiki/V_speeds)。典型的な進入速度と戦闘速度について
- [War Thunder wiki](https://wiki.warthunder.com/)。地上車両について
- [アーレイ・バーク級駆逐艦](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer)、およびほかの艦種の公表された速度

その他
- [好みの歩行速度](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler のハイキング関数](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
