---
title: "維護文件"
nav_order: 23
lang: "zh-Hant"
source: "maintaining.md"
source_hash: "4a4fb46273e5"
translated: true
outdated: false
---

# 維護文件

這一頁是給負責照顧檢視器與本網站的人看的。它列出在變更後，讓頁面、圖片與翻譯保持正確的步驟。

本網站會在**每次發佈**時重新檢查，也會在任何大幅變動時重新檢查：按鍵、UI 的操作路徑、設定、檔案格式。檢查清單如下：

1. **重新產生參考頁面**：`node tools/docs-refs.mjs`（每種語言都加上 `--lang <lang>`）。`node tools/docs-refs.mjs --check` 會在某頁已過時時失敗。
2. **重新產生螢幕截圖**，使用[示範資料](demo-data.md)。請使用地區為 en-US 的電腦或容器，讓數字顯示為 `0.35` 而不是 `0,35`（在變更之前，數字輸入框會跟隨瀏覽器的地區設定）。用 `node tools/demo-data.mjs` 製作示範資料，在 5321 連接埠啟動開發伺服器，且**不**載入本機圖示包：`HEAT3D_FIGURE_PACK=none npx vite --port 5321 --strictPort --host 127.0.0.1`，然後執行 `node tools/docs-shots.mjs --lang <lang>`。請檢視每一張圖片：只能出現示範名稱（*Demo Valley*、*Blue 1*、*Red 3* ……），不能有真實地圖、玩家或錄影。
3. **列出自上一個發佈標籤以來的變更**：`git log --oneline <last tag>..HEAD`，以及 `CHANGELOG.md` 的 **Docs** 區段，它會把每個功能對應到其頁面。每個新功能都需要一頁或一個區段，若它會在畫面上出現，還需要附上圖片。
4. **獨立審閱英文頁面**，由沒有撰寫它們的人，針對三種讀者進行：初學者、八歲的孩子、專家。步驟是否完整且順序正確？用詞是否與 UI 相符？圖片是否為最新？圖表的標籤是否正確？
5. **修正審閱發現的問題**。
6. **依原始碼的雜湊值重新翻譯變更的頁面**，然後針對每種語言進行審閱。見 `tools/docs-translate.md`。
7. **掃描變更檔案中的機密詞彙**，並確認沒有任何圖片顯示示範資料以外的內容。
8. **只在發佈獲得核准後才發佈。**

相關儲存庫的文件網站也適用同樣的檢查（見[首頁](index.md#related-repositories)）。

## exporters/ 底下的工具 {#the-tools-under-exporters}

檢視器周邊的工具是各自獨立的公開專案，各自採用 MIT 授權，有各自的發行版、wiki 與更新檢查，並以 git 子模組的形式固定在本儲存庫中：

| 資料夾 | 儲存庫 |
|---|---|
| `exporters/gamefiles/` | [3DHeat-GameFiles](https://github.com/Holdi601/3DHeat-GameFiles)——從遊戲自己的封存檔取出賽道與關卡 |
| `exporters/gamecapture/` | [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)——圈速遙測紀錄工具；從遊戲錄影取得關卡 |
| `exporters/unreal/` | [3DHeat-UnrealExporter](https://github.com/Holdi601/3DHeat-UnrealExporter)——Unreal Editor 外掛 |
| `exporters/cs2/` | [3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2)——CS2 示範與地圖 |
| `exporters/watcher/` | [3DHeat-Watcher](https://github.com/Holdi601/3DHeat-Watcher)——在背景記錄遊戲過程 |

**固定**表示本儲存庫記錄了每個工具的一個確切提交。檢視器的簽出會取得這些提交：

```bash
git clone --recursive https://github.com/Holdi601/3DHeat
# 或者，在一般複製之後：
git submodule update --init
```

上述兩種更新方式都會在拉取後執行 `git submodule update --init`，所以工具會跟隨檢視器最新版本所固定的提交——而不是工具自己最新的提交。工具的較新發行版，要等到這裡的固定值被移動後才會到達檢視器：工具的變更會先在它自己的資料夾（它自己的儲存庫）中提交並推送，然後才在這裡提交新的固定值。每個工具也會檢查它自己較新的發行版；這在各自的儲存庫中有文件說明。
