---
title: "更新"
nav_order: 21
lang: "zh-Hant"
source: "updates.md"
source_hash: "674c07a79c56"
translated: true
outdated: false
---

# 更新

檢視器會在有較新版本時告訴你，而且只有在你同意時才會自行更新。沒有你的同意，你的電腦上不會有任何東西被變更。

## 更新檢視器 {#update-the-viewer}

1. **在頁面中。** 有較新版本時，側邊欄頂端的名稱下方會出現一個方塊：「3DHeat 有較新的版本可用」。點擊**立即更新**。完成後頁面會自行重新載入。**稍後**會隱藏此方塊，直到你重新載入頁面為止。
2. **若它要求你執行 restart.bat**，請關閉伺服器視窗（由 `start.bat` 開啟的黑色視窗），然後連按兩下 `restart.bat`。
3. **啟動檢視器時。** `start.bat` 也會檢查。若有較新版本，它會詢問 **Update now? [Y/N]**（立即更新？[Y/N]）。按 `Y` 即可更新。按 `N`，或等待 60 秒不作回答，則會啟動你目前擁有的版本。

![更新通知，含立即更新與稍後按鈕](../assets/img/en/updates-notice.webp)

有你自己修改內容的副本絕不會替你自動更新；方塊只會告訴你有更新在等待，並說明要提交或暫存你的變更，然後執行 `git pull`。不是透過 git 安裝的副本（例如 zip 檔案）則不會顯示任何內容。

檢查運作的步驟如下：

```
page ---(after 4 s, then every 6 h)---> dev server ---> git fetch
   behind?  no  -> nothing is shown
            yes -> your own changes or commits?  yes -> tell you only
                                                 no  -> [Update now] -> git pull
                                                        -> reload, or "run restart.bat"
```

## 安全規則 {#the-safety-rules}

- **只允許快轉**（`git pull --ff-only`）：更新絕不會合併、重新基底或改寫任何東西。
- **沒有本機變更**：若簽出版本中，已追蹤檔案有未提交的變更（`git status --porcelain --untracked-files=no` 的結果不是空的），則絕不會自動更新 - 他人的工作不應被更新覆寫。它只會被告知有更新在等待。未追蹤的檔案（資料、匯出）不算變更。
- **沒有本機提交**：若簽出版本包含上游沒有的提交（「已分岔」），則不會更新 - 快轉無法使其更新，而合併應由你手動執行 `git pull`。頁面與 `start.bat` 都會以相同的文字說明此情況，而 `start.bat` 會啟動目前所在的版本。
- **只接受來自頁面本身的請求**：開發伺服器的更新請求必須帶有自訂標頭，且當瀏覽器送出 `Origin` 時，必須來自伺服器自己的主機（見下文）。
- 只有具有上游分支的 git 簽出版本才會被更新；其他任何情況（沒有 `.git` 的副本、未安裝 git、靜態建置）都會保持不變，且不會有任何訊息。

## start.bat 做了什麼 {#what-startbat-does}

`start.bat`（連按兩下即可；該視窗就是伺服器）依序執行：

1. 尋找 Node.js - 在 `PATH` 中，否則在 `%ProgramFiles%\nodejs`、`%ProgramFiles(x86)%\nodejs` 或 `%LOCALAPPDATA%\Programs\nodejs` 中尋找 - 若找不到，會提議以 `winget install -e --id OpenJS.NodeJS.LTS` 安裝（會詢問，Y/N；之後必須重新開啟視窗，Windows 才會讀取新的 `PATH`）。
2. **更新**，前提是已安裝 git 且資料夾中有 `.git`：
   - `git fetch --quiet`（無網路或沒有上游時會靜默略過）；
   - 計算 `git rev-list --count HEAD..@{u}`；若沒有落後，則不顯示任何訊息；
   - 有本機變更：「3DHeat 有較新的版本可用（N 項變更），但此副本有本機變更，因此不會更新。請提交或暫存後，再執行 git pull。」- 然後啟動目前所在的版本；
   - 有自己的提交（`git rev-list --count @{u}..HEAD` 不為 0）：「3DHeat 有較新的版本可用（N 項變更），但此副本有最新版本沒有的自身提交，因此不會更新。請使用 git pull 更新。」- 然後啟動目前所在的版本；
   - 其他情況：「3DHeat 有較新的版本可用（N 項變更）。」並詢問 **Update now? [Y/N]**。按 `N`，或 60 秒內沒有回答，會印出「未更新；正在啟動你目前擁有的版本。」並啟動目前所在的版本。按 `Y` 時：會印出「正在更新...」，說明 `package.json` 或 `package-lock.json` 是否會變更，執行 `git pull --ff-only`（若仍然失敗，例如網路問題：「更新未完成；正在啟動你目前擁有的版本。」），接著執行 `git submodule update --init`（已釘選的工具，見[維護文件](maintaining.md#the-tools-under-exporters)），若套件檔案有變更且 `node_modules` 存在，則執行 `npm install`，最後印出「已更新。」。
3. 拒絕啟動第二個伺服器：若連接埠 **5273** 已有程式在監聽，它會說明並指向 `restart.bat` / `stop.bat`。
4. 第一次執行時（沒有 `node_modules`），會先詢問是否下載相依套件（約 300 MB，安裝到 `node_modules\`，不會安裝到系統層級）。
5. 在 `127.0.0.1:5273` 啟動開發伺服器（`--strictPort`），並在準備就緒後開啟瀏覽器。

`restart.bat` 會（依連接埠）停止伺服器，然後再次執行 `start.bat`，因此它會詢問相同的問題。`stop.bat` 只會停止伺服器。

## 給開發者 {#for-developers}

### 執行期間：更新路由 {#while-it-runs-the-update-route}

開發伺服器（`vite.config.ts` 中的 Vite 外掛 `heat3d-self-update`）提供 `/__heat3d/update`。它只存在於開發伺服器上，不在靜態建置中，也不在 `vite preview` 中。

**`GET /__heat3d/update`** 回答簽出版本是否落後：

```json
{ "checkout": true, "upstream": "origin/main", "behind": 3, "ahead": 0, "dirty": false, "latest": "the newest commit's subject" }
```

- 資料夾不是 git 簽出版本時，`checkout: false`；
- 它**最多每 30 分鐘**執行一次 `git fetch --quiet`（期間的查詢會以上次取得的結果回答）；
- `behind` / `ahead` 來自 `git rev-list --count HEAD..@{u}` / `@{u}..HEAD`，`dirty` 來自 `git status --porcelain --untracked-files=no`，`latest` 為上游最新提交的主旨；
- 沒有上游分支時，`upstream: null` 且 `behind: 0`。

**`POST /__heat3d/update/apply`** 會把簽出版本更新到最新：

1. 除非請求帶有標頭 `X-Heat3d-Update: 1`，且（若帶有 `Origin`）該來源的主機與請求的 `Host` 相同，否則以 `403 { ok: false, reason: "forbidden" }` 拒絕。跨站表單若沒有 CORS 預檢，就無法送出自訂標頭，而此伺服器從不授予預檢。
2. 沒有需要做的事（不是簽出版本、沒有上游、未落後）：`{ ok: true, updated: false }`。
3. 有本機變更：`{ ok: false, reason: "dirty" }`；有本機提交：`{ ok: false, reason: "diverged" }`。
4. 否則：記下會變更的檔案（`git diff --name-only HEAD @{u}`）、執行 `git pull --ff-only`（逾時 2 分鐘）、執行 `git submodule update --init`（失敗則忽略）、當 `package.json` 或 `package-lock.json` 有變更時執行 `npm install`（逾時 15 分鐘），並回答 `{ ok: true, updated: true, restart }`。`restart` 說明為何正在執行的伺服器無法套用此更新：相依套件被重新安裝時為 `"dependencies"`，只有 `vite.config` 檔案變更時為 `"config"`，無需重新啟動時為 `false`。
5. git 或 npm 指令失敗時，回答 `{ ok: false, reason: "<the error, up to 300 characters>" }`。

回應為 JSON，並帶有 `Cache-Control: no-store`。伺服器只監聽 `127.0.0.1`，因此無法從網路存取此路由。

### 頁面中的通知 {#the-notice-in-the-page}

`UpdateBanner`，位於側邊欄頂端名稱下方：

- 頁面載入後 **4 秒** 會查詢此路由（不在最初幾秒內：頁面還要載入資料集並啟動 GPU），之後只要頁面保持開啟，就會 **每 6 小時** 再查詢一次。
- 沒有此路由（靜態建置）、資料夾不是簽出版本，或沒有更新的版本時，它**什麼都不顯示**：每次啟動都出現的通知，會讓人學會忽略。
- 落後且沒有本機變更時：「3DHeat 有新版本可用（N 項變更，最新：<主旨>）。」並提供**立即更新**與**稍後**（*稍後*會隱藏通知，直到頁面重新載入）。
- 落後且有本機變更時：同樣的句子，加上「此副本有本機變更，因此不會自動更新；請先 commit 或 stash 這些變更，再執行 git pull。」——沒有按鈕。
- **立即更新**會送出請求到 `/apply`（顯示「更新中…」）。之後：
  - 「已更新。頁面將重新載入。」——並在 1.5 秒後重新載入（伺服器已經提供新檔案）；
  - 相依套件被重新安裝時：「已更新。相依套件已變更：請關閉伺服器視窗並執行 **restart.bat** 以完成更新。」；
  - 只有伺服器設定變更時：「已更新。伺服器設定已變更：請關閉伺服器視窗並執行 **restart.bat** 以完成更新。」；
  - 最後發現沒有需要套用的內容（`updated: false`，例如 `start.bat` 已在此期間更新過此副本）：「沒有需要更新的內容：此副本已是最新版本。」——並且不會重新載入；
  - 被拒絕：顯示上述有本機變更的句子，或「此副本有最新版本沒有的自有提交；請用 git pull 更新。」，或「更新未能完成：<原因>」。
