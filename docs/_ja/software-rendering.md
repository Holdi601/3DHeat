---
title: "ソフトウェアレンダリングの検出"
parent: "レンダリングの内部"
nav_order: 6
lang: "ja"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# ソフトウェア描画の検出

ブラウザがグラフィックカードではなく、メインのプロセッサーで描画している場合、ビューアーは何倍も遅くなります。ビューアーはこれに気づき、何を有効にすればよいかを示す赤い箱を表示します。

ブラウザでハードウェアアクセラレーションがオフになっている場合や、ドライバーがブロックリストに入っている場合、ブラウザは WebGL と WebGPU を CPU で描画します。すべては動きますが、何倍も遅くなります。その結果は「このビューアーは、私のデータでは使い物にならないほど遅い」という症状になります。これはブラウザの設定ではなく、ツールに問題があるように見えます。そのためビューアーは、描画エンジンの名前を調べて、そのことを伝えます（[`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)）。

## 警告の帯 {#the-banner}

描画エンジンがソフトウェアだと確実に判定されると、サイドバーの上部（ヒートとマッチのタブ）に、モードのバーの上に赤い箱が現れます。

![赤い帯: グラフィックカードを使わずに動作しています](../assets/img/en/software-rendering-banner.webp)

> **グラフィックカードを使わずに動作しています。**
> このブラウザはグラフィックカードではなく CPU で描画しています。これは何倍も遅く、大きなデータセットは扱えません。ブラウザの設定でハードウェアアクセラレーションを有効にし（Chrome: 設定 → システム → 「グラフィック アクセラレーションが使用可能な場合は使用する」をオンにして再起動）、グラフィックドライバーが最新であることも確認してください。

## 開発者向け {#for-developers}

### 判定の仕方 {#how-it-decides}

描画エンジンの文字列（WebGL2 の `UNMASKED_RENDERER_WEBGL`、または WebGPU のアダプターのベンダー、アーキテクチャ、デバイス）は、小文字にされ、次のように分類されます。

- `swiftshader`、`llvmpipe`、`softpipe`、`swrast`、`microsoft basic render driver`、`apple software renderer`、`generic renderer` を含むと **ソフトウェア**。
- 既知の GPU のベンダーまたは系列（`nvidia`、`geforce`、`rtx`、`quadro`、`amd`、`radeon`、`intel`、`arc`、`apple m`、`adreno`、`mali`、`powervr`、`xclipse`）を含むと **ハードウェア**。
- それ以外は **不明**。

警告の帯が出るのは、*ソフトウェア* の場合だけです。認識できないアダプターでは何も表示しません。正常な GPU を持つ人をブラウザの設定変更に向かわせるのは、ケースを見逃すより悪い失敗だからです。

### 短い名前 {#the-short-name}

同じモジュールは、表示用に描画エンジンの文字列を短くします。`ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` のような ANGLE の文字列からは、デバイスの欄を残し、PCI の ID と末尾の API とシェーダーのモデルを取り除いて、`Vendor Model` と表示します。短い名前は **リソース予算** に表示され、完全な文字列は、その説明文として出ます。メモリの見積もりには完全な文字列が表示されます。
