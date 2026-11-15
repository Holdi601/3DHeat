---
title: "デモデータ"
nav_order: 2
lang: "ja"
source: "demo-data.md"
source_hash: "217e44016d8d"
translated: true
outdated: false
---

# デモデータ：5分でビューアーを試す

![demo valley の10戦車マッチのヒート：手順4で見えるもの](../assets/img/en/heat-hero.webp)

まだご自身のデータがありませんか。リポジトリがデータを作ります。その中のものはすべて架空です。ある谷、ある作業場、そして3種類の架空のゲームスタイルの試合があり、プレイヤーは *Blue 1* や *Red 3* と呼ばれます。このサイトの画像はすべて、このデータを使って撮影しました。

## 作る {#make-it}

```bash
node tools/demo-data.mjs
```

これは `tools/.shots/demo/` に書き込みます。

| ファイル | 内容 |
|---|---|
| `demo-valley.glb` | 2つの丘と村がある 12 km の谷。3Dレベルとして |
| `demo-yard.glb` | 建物のある、壁に囲まれた 160 m の作業場。3Dレベルとして |
| `tanks.parquet` | 戦車の10試合。8対8。移動、射撃、車体上の位置を含む命中、火災、撃破、残骸、砲塔の照準、勝者 |
| `tanks/match-NN.parquet` | 同じ試合を1試合ずつ1ファイルにしたもの。[多数の試合を一度に](many-matches.md)で使います |
| `air.parquet` | ミサイル、フレア、撃墜、外れを含む、4対4の空中戦 |
| `shooter.parquet` | 徒歩の5対5を12ラウンド。射撃、撃破、爆弾の設置、獲得と使用したクレジット、ヘルメットと補助道具 |
| `mass/` | 小さな `.3dheat` の試合を入れたフォルダー。[大量分析](mass-analysis.md)用 |
| ラップのセット | 架空のコースを走る1台の車の2ラップ。[レース分析](race-analysis.md)用 |

それぞれの表は、列の名前をフッターに書いています。そのため、割り当てをしなくても読み込めます。

## 試す {#try-it}

1. ビューアーを起動します（Windows では `start.bat`。どのシステムでも、一度 `npm install` を実行してから `npm run dev`）。そして `http://127.0.0.1:5273/` を開きます。
2. **背景/レベル → 3Dモデル…** を選び、`demo-valley.glb` を選びます。
3. **ソース → ファイル…** を選び、`tanks.parquet` を選びます。
4. `F` を押して、データに合わせて表示します。10試合の[ヒート](heat.md)が見えます。
5. モードバーを試します：**差分**（Blue 対 Red）、**チームヒート**、**ライン**。
6. **インサイト**を開きます（ヒートマップのサイドバー内）。ほかの場所よりずっと多くの射撃、命中、破壊があった場所を見つけます。2つの丘の周辺です。
7. **マッチ** タブを開きます。**リプレイ内のマッチ** の下で *Match 01* を選び、タイムラインの **再生** を押します。これが[リプレイ](match-replay.md)です。

![戦車をフィギュアとして表示した Match 01 のリプレイ](../assets/img/en/replay-overview.webp)

シューター用には、`demo-yard.glb` と `shooter.parquet` を読み込みます。空中戦用には、`air.parquet` を読み込みます。（フィギュアは **フィギュアのサイズ** を 4 にすると見やすくなります。これはヒートマップのサイドバーの **チームビューアー** パネルにあるスライダーです。）

## スクリーンショット {#the-screenshots}

このサイトの画像は、このデータからスクリプトで作られます。ビューアーのどの言語でも作れます：

```bash
node tools/demo-data.mjs
HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1   # PowerShell: $env:HEAT3D_FIGURE_PACK="none"; npx vite ...
node tools/docs-shots.mjs --lang en
```

スクリーンショット用のサーバーは、ローカルのフィギュアパックなしで動くため、公開のフィギュアカタログだけが表示されます。画像は `docs/assets/img/<lang>/` に保存されます。[ドキュメントの保守](maintaining.md)を参照してください。
