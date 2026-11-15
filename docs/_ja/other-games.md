---
title: "他のレーシングゲーム"
parent: "レース分析"
nav_order: 59
lang: "ja"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# ビューアーで扱うほかのレーシングゲーム

ビューアーは、1つのゲームだけでなく多くのレーシングゲームのラップを読み込めます。このページでは、対応しているゲームの一覧と、各ゲームからラップを取り出す方法を説明します。

## ゲーム {#the-games}

| ゲーム | 記録ツール | ファイルにスリップ値があるか? | ワールドが反転しているか? | 補足 |
|---|---|---|---|---|
| Forza Horizon 4/5/6、Forza Motorsport | `heat3d_capture telemetry`（UDP で Data Out）、または FH Companion のラップファイルと `.tele.gz` | はい、ホイールごと（正規化済み） | はい（左手系のワールド） | ラップファイルの横にある `.tele.gz` で、すべてのホイールのスリップ値がわかります。ラップファイルだけではわかりません |
| Assetto Corsa、ACC、AC EVO、AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally`（共有メモリ） | はい、ホイールごと | ラップから測定 | ABS と トラクションコントロールの作動、ホイールの荷重、温度も記録されます |
| EA SPORTS WRC、DiRT Rally 2.0 / 1、DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4`（UDP） | いいえ。ホイールの速度から計算します | ラップから測定 | ラリーでは、荒れた路面やジャンプの扱いが違います |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr`（NGP UDP） | いいえ | ラップから測定 | ホイールの速度はありません |
| BeamNG.drive | `heat3d_capture telemetry --game beamng`（MOD） | いいえ。ホイールの速度から計算します | ラップから測定 | |
| Trackmania | Openplanet のプラグイン。`telemetry --game trackmania --install` | ホイールごとのスリップ係数 | ラップから測定 | アーケードの物理なので、スライドの扱いが違います |
| iRacing | なし。独自の `.ibt` ファイルを使います | いいえ（記録されません）。ヨーから計算します | いいえ（GPS ベース） | 車内で Alt+L を押して記録をオンにします |

## ラップを記録する方法 {#how-to-record-a-lap}

1. 上の表でゲームを選び、そのゲームの記録ツールのページどおりに設定します（ゲーム内の設定、MOD、または iRacing の場合は何もしません）。手順はゲームごとに違うため、記録ツールのドキュメントにあります: [GameCapture: ゲーム](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)。
2. 記録を開始してから走ります。ラップごとに1つのファイルが作られます。
3. **レース分析** タブで **ラップファイルを読み込む…** を押し、同じコースのラップを2つ以上選びます（[ラップの読み込み](race-loading-laps.md)を参照）。

ラリーゲームでは、記録ツールはステージの走行ごとに1つのファイルを作ります。Forza の場合は、FH Companion のライブラリを使い、ラップファイルの横にある `.tele.gz` ファイルを使うのが一番簡単です。

## 記録ツールのドキュメント {#what-the-recorders-document}

各ゲームの記録方法、送られるデータ、レイアウトの出典、ゲームのファイルからエクスポートできるコースは、記録ツール側で説明されています。公開されています: [GameCapture: ゲーム](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)（[3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) にあります）。どの記録ツールも書き出すラップファイルについては、[GameCapture: ラップの形式](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)を見てください。

## ビューアーでの扱い {#what-the-viewer-does-with-them}

どのゲームのデータも、最終的には `heat3d-lap` ファイル（またはラップの CSV）になります。iRacing の `.ibt` は直接読み込まれます。チャンネル名は `src/race/schema.ts` の標準名を使い、`meta` のブロックで数値の意味を説明します。スリップ値の尺度、サーキット・ラリー・アーケードの区別、わかっている場合は路面も書かれます。そのため **レース分析** タブは、すべてのゲームを同じように扱えます。コースのモデルを読み込んでいない場合でも、**レース分析** タブはラップ自身の広がりから道路を描くので、どのゲームでもそのまま使えます。

ラリーゲームのどれも送らないタイヤのスリップ値は、ビューアーが計算します。ゲームがタイヤの接地面または路面の速度を送る場合は、その速度と車の速度を比べます（`(wheel - car) / car`）。回転だけを送る場合は、回転と、ラップ上で測ったローリング半径から求めます。ドリフト角は、車自身の速度から求めます（Forza、AC の各ゲーム、Trackmania、RBR）。EA WRC、DiRT、BeamNG のようにワールドの速度を車の軸に投影する場合もあります。ほかには、進行方向と経路の向きの差から求めます。車が空中にあるかどうかは、タイヤの接地、荷重、サスペンションから判断します。詳しくは `src/race/derive.ts` を見てください。

ゲームのワールドが左手系の場合（Forza がそうです）、ビューアーではコースが左右反転して表示されます。ラップのハンドルとサスペンションの動きでそれがわかり、**レース分析** タブは軸を反転させるかどうかを提案します。ワールドの手系が書かれていないゲーム（RBR、BeamNG、Trackmania）も同じように扱います。仮定するのではなく、測って判断します。

運転に関するチャンネルのほかに、記録ツールはゲーム独自のデータも保存します。AC の各ゲームでは ABS と トラクションコントロールの作動、ブレーキバイアス、DRS、ピットリミッター、ブースト、ブレーキパッドとディスクの寿命です。iRacing では、アシスト設定、ブレーキバイアス、燃料、オイルと水温、そのほかゲームが独自の名前で記録するすべてのチャンネルです。ビューアーはこれらをチャンネル表から描画します（ランプ、レベル、グリフ、グラフ）。そのため、記録するデータを増やしてもビューアー側の変更は必要ありません。
