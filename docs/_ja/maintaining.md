---
title: "ドキュメントの保守"
nav_order: 23
lang: "ja"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# ドキュメントの保守

このページは、ビューアーとこのサイトの保守を担当する人のためのものです。変更の後にページ、画像、翻訳を正しく保つための手順を挙げます。

このサイトは、**リリースのたび**と、何かが大きく変わるたびに、確認し直されます。変わるものは、キー操作、UI の操作の道筋、設定、ファイルの形式です。確認の手順は次のとおりです。

1. **参照ページを再生成します**: `node tools/docs-refs.mjs`（言語ごとに `--lang <lang>` を付けます）。`node tools/docs-refs.mjs --check` は、ページが古くなっていると失敗します。
2. **スクリーンショットを再生成します**。[デモデータ](demo-data.md)を使います。地域が en-US のコンピューターまたはコンテナーを使ってください。そうすると、数字は `0.35` になり、`0,35` にはなりません（数字のボックスは、変更されるまでブラウザの地域に従います）。デモデータは `node tools/demo-data.mjs` で作ります。開発サーバーをポート 5321 で、**ローカルのフィギュアパックなしで** 起動します: `HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`。その後、`node tools/docs-shots.mjs --lang <lang>` を実行します。すべての画像を確認してください。デモの名前（*Demo Valley*、*Blue 1*、*Red 3* など）だけがあり、実際の地図、プレイヤー、記録がないことを確かめます。
3. **前回のリリースのタグ以降に何が変わったかを一覧にします**: `git log --oneline <last tag>..HEAD`、および `CHANGELOG.md` の **Docs** のセクション。これは、各機能をそのページに対応させています。新しい機能には、ページかセクションが必要です。画面に表示されるものは、画像も付けます。
4. **英語のページを、書いていない人が独立して確認します**。3 種類の読者を想定します: 初心者、8 歳の子ども、専門家。手順は完全で正しい順番か。言葉は UI のものか。画像は最新か。図のラベルは正しいか。
5. **確認で見つかった問題を直します。**
6. **変わったページを、元の文のハッシュで翻訳し直します**。それから、言語ごとに確認します。`tools/docs-translate.md` を参照してください。
7. **変更されたファイルで、機密の用語をスキャンします**。画像にデモデータ以外が写っていないことを確認します。
8. **公開するのは、リリースが承認されたあとだけです。**

同じ確認は、関連するリポジトリのドキュメントサイトにも及びます（[ホーム](index.md#related-repositories)のページを参照）。

## exporters/ の下のツール {#the-tools-under-exporters}

ビューアーの周りのツールは、それぞれ独立した公開プロジェクトです。それぞれに独自の MIT ライセンス、リリース、wiki、更新の確認があります。このリポジトリには、git のサブモジュールとして固定されています。

| フォルダー | リポジトリ |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles) - ゲーム自身のアーカイブから取り出したコースとレベル |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture) - ラップのテレメトリの記録ツール。ゲームプレイの映像からのレベル |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter) - Unreal Editor のプラグイン |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2) - CS2 のデモとマップ |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher) - バックグラウンドでプレイを記録します |

**固定されている** とは、このリポジトリが、各ツールの正確に 1 つのコミットを記録していることを意味します。ビューアーのチェックアウトを行うと、そのコミットが取得されます。

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# または、通常のクローンのあと:
git submodule update --init
```

上の両方の更新の方法は、取得の後に `git submodule update --init` を実行します。そのため、ツールは、ビューアーの最新版が固定しているコミットに従います。ツール自身の最新のコミットには従いません。ツールの新しいリリースがビューアーに届くのは、ここでの固定が動かされたときです。ツールへの変更は、まずそのツールのフォルダー（そのリポジトリ）でコミットされ、プッシュされます。そのあとで、新しい固定がここでコミットされます。各ツールは、自分の新しいリリースも確認します。それは各リポジトリに書かれています。
