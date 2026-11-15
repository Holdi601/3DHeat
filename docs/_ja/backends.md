---
title: "2つのバックエンド"
parent: "レンダリングの内部"
nav_order: 1
lang: "ja"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# 2つのバックエンド

ブラウザでは、ページがグラフィックカードを2つの方法で使えます。WebGPU（新しい方）と WebGL2 です。ビューアーは両方を使え、最適なほうを自分で選びます。そのため、普通は何もしなくて構いません。今どちらを使っているかは、統計オーバーレイの **バックエンド**（表示の右上）で確認できます。

![統計オーバーレイ: バックエンド、FPS、フレーム、ウィンドウ内の行、スプライト/フレーム、予算、ヒート解像度、カバー率](../assets/img/en/performance-stats-overlay.webp)

ビューアーは、1つのインターフェースの裏に、完全な描画エンジンを2つ持っています（[`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)）。**WebGPU**（[`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)）と **WebGL2**（[`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)）です。どちらも同じアルゴリズムで同じ絵を描きます。シェーダーは WGSL と GLSL ES 3.00 の両方で用意されています。統計オーバーレイの最初の行 **バックエンド** には、どちらが動いているかが書かれています。その項目にマウスを載せると、WebGPU を使わなかった場合はその理由が表示されます。

## 開発者向け {#for-developers}

### 選び方 {#how-one-is-chosen}

1つのキャンバスには1種類のコンテキストしか持てないため、描画の前に一度だけ選びます（[`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)）。

1. WebGL2 を強制していなければ、`navigator.gpu` があるかを調べます。ある場合は、`powerPreference: 'high-performance'` を指定してアダプターとデバイスを要求し、WebGPU の描画エンジンを作ります。失敗した場合は、その理由を覚えておきます。
2. WebGPU を強制していて失敗した場合は、そこで止まります。ビューには *Cannot initialise the renderer.* と理由が表示されます。
3. それ以外の場合は、WebGL2 の描画エンジンを作ります（こちらも高性能アダプターを要求します）。WebGL2 が使えない場合、または浮動小数点のテクスチャへ描けない場合（`EXT_color_buffer_float`）は、ビューにエラーが表示されます。

`powerPreference: 'high-performance'` は、切り替え式のグラフィックスを持つノートPCで、ページに内蔵 GPU が割り当てられるのを防ぎます。それ以外は、ページからできることはありません。ハードウェア・アクセラレーションはブラウザの設定です。

### URL の切り替え {#url-switches}

ページのアドレスの後ろに付けます。例: `http://127.0.0.1:5273/?backend=webgl2`。

| パラメーター | 効果 |
|---|---|
| `?backend=webgpu` | WebGPU を使います。使えなければ失敗します。 |
| `?backend=webgl2` | WebGPU が使える場合でも WebGL2 を使います。「この表示がおかしい」と「WebGPU でだけおかしい」を区別できます。 |
| `?heat=f16` | どちらのバックエンドでも、16ビットのヒート累積の経路を強制します（[半精度浮動小数点の累積](half-float-accumulation.md)）。 |
| `?glcheck` | WebGL2: フレーム中の GL エラーを読み取り、`renderer.heatDebug` で見られるようにします。`getError` は処理の同期点になるため、通常はオフです。 |
| `?occdebug=<n>` | WebGL2 の開発者向け機能: ヒートの代わりに遮蔽のデバッグ値を表示します。通常の利用には使いません。 |

### 重要な違い {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| 行の保存 | ストレージバッファー。行の番号は配列の添字になります。アダプターの最大ストレージバッファーのバインド量とバッファーのサイズを要求します。 | 整数テクスチャ（幅 8,192 テクセル）。`gl_VertexID` からアクセスし、フレームごとのブロック番号テクスチャを使います。 |
| 32ビットのヒート累積 | アダプターが `float32-blendable` と `float32-filterable` の両方を備えている場合 | `EXT_float_blend` がある場合 |
| それ以外 | 16ビット（`r16float`） | 16ビット（`R16F`） |
| 深度の範囲 | [0, 1]。エンジンは three.js の [-1, 1] の行列に、範囲を変える補正を先に掛けます。これがないと、深度が線形の平行投影では、ほぼすべてが 0 未満になり、警告なしで切り捨てられてしまいます。 | [-1, 1]。そのまま使います。 |
| ユニフォーム | 描画ごとに1つずつ、256 バイト単位にそろえたスロットのリング。オフセットでバインドします。`queue.writeBuffer` はキューの中で順番どおりに処理されるため、1つのバッファーを描画ごとに書き換えると、すべての描画が最後の書き込みを読んでしまいます。ヒートの描画パスのユニフォームブロックは、ちょうど 256 バイトのスロット1つ分です。 | 通常のユニフォーム |
| キャンバスより低いヒートの解像度 | 専用の深度テクスチャを持ちます（1つのパスのすべての添付は同じサイズである必要があるため） | |
| フレームの取得 | `captureFrame()` は合成した絵をもう一度、オフスクリーンの描画先へ描き、読み戻します（ヘッドレスの Chromium は WebGPU を描画しますが、キャンバスを合成しません） | 次に描画されるフレームで、デフォルトのフレームバッファーを読み戻します |
| 読み戻し | ステージングバッファーを保持して再利用します。同時に読み取るのは1つだけです。 | `readPixels`。ドライバーに、使える形式と型の組み合わせを確認してから使います。 |

どちらのバックエンドも、スプライトの曲線テーブルを半精度浮動小数点として送ります。WebGPU の `queue.writeTexture` は生のバイトをそのままコピーするため、先に binary16 に変換します（[`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)）。

#### テクスチャの上限 {#texture-limits}

`texStorage2D` が `MAX_TEXTURE_SIZE` を超えても、例外は出ません。確保は捨てられ、その後のアップロードは失敗し、サンプリングはゼロを返します。WebGL2 の補助関数 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) は、両方の寸法を上限と比べ、超えていればサイズを示して例外を投げます。ブロック番号テクスチャは2次元（幅 4,096）なので、上限を超えることはありません。`src/render/limits.test.ts` は、使う価値のある上限に対して、すべてのテクスチャの寸法を確認します。WebGL2 の描画エンジンは、最大テクスチャサイズが行テクスチャの幅 8,192 より小さい機器も受け付けません。

### 両方のテスト {#testing-both}

`npm run smoke` は、WebGL2 上で実際のアプリをヘッドレスの Chromium で動かします（既定では `http://127.0.0.1:5273/`）。WebGPU で試すには、`node tools/smoke.mjs` に `"http://127.0.0.1:5273/?backend=webgpu"` を渡します。半精度の経路では `npm run smoke:f16` を使います。`tools/probe-webgpu.mjs` と `tools/probe-present.mjs`（[コマンドラインツール](ref-tools.md)の開発者ツールに載っています）は、ヘッドレスのブラウザでアダプターと画面への出力が使えるかを調べます。
