---
title: "語言"
nav_order: 17
lang: "zh-Hant"
source: "languages.md"
source_hash: "3fe0a88e89d1"
translated: true
outdated: false
---

# 語言

檢視器可以使用你的語言：每個按鈕、提示與訊息，以及競賽與對戰分析的每一句話，都會以你選擇的語言顯示。它支援 40 種語言，若瀏覽器的語言受支援，就會以該語言啟動。

歐洲各國的官方語言都有支援（歐盟的 24 種，以及挪威語、冰島語、烏克蘭語、俄語、白俄羅斯語、塞爾維亞語、波士尼亞語、馬其頓語、阿爾巴尼亞語、土耳其語、盧森堡語與加泰隆尼亞語），另外還有日語、韓語，以及簡體與繁體中文。完整清單：[語言清單](ref-languages.md)。

英語是其他所有語言翻譯的來源，也是遺漏訊息時的後備語言。

## 變更語言 {#change-the-language}

1. 打開側邊欄頂端名稱旁的下拉選單。第一個選項是**自動 - <語言>**（即目前偵測到的瀏覽器語言）；之後列出每種語言的原生名稱，即使你看不懂目前顯示的語言，也能找到自己的語言。
2. 選擇一種語言。它會立即切換，並保存在這個瀏覽器中。選擇*自動*即可忘記先前的選擇。

在私密視窗中，或儲存空間被封鎖時，此選擇只會保留到頁面關閉為止。

切換語言會做以下事情：

- 每個標籤、提示與訊息都會以新語言重新繪製；
- 競賽分析會以新語言**重新計算**（它的句子是由測量數值組成，而不是事後翻譯），示範圈數會被重新命名，圖表也會重新繪製；
- 數字、清單與複數形式會依新語言的規則呈現。

## 啟動時使用的語言 {#which-language-it-starts-in}

1. 此瀏覽器中**選定**的語言（若有的話，保存在 `localStorage` 的 `heat3d.language` 中）。
2. 否則使用**瀏覽器**的語言：`navigator.languages` 中第一個檢視器支援的語言。標籤會依語言部分比對（`de-AT` → `de`），並有以下別名：`nb` 與 `nn` → 挪威語（`no`）；`zh-TW`、`zh-HK`、`zh-MO`、`zh-Hant`，以及任何帶有 `Hant` 書寫系統的標籤 → 繁體中文；`zh-Hans`、`zh-CN`、`zh-SG` 及其他 `zh` → 簡體中文；`cnr`（黑山語）→ 塞爾維亞語。
3. 否則使用**英語**。

頁面的 `<html lang>` 會設為所使用的語言。

## 數字、清單與複數 {#numbers-lists-and-plurals}

檢視器文字中的數字、清單與複數，會依該語言的寫法呈現（「3.5」或「3,5」、「a、b 與 c」）。比英語長的標籤會換行，並在語言允許的地方加上連字號，而不會超出側邊欄。圖表中過長的列名會以省略號截斷，滑鼠移上去時會完整顯示。

你在輸入框中輸入的數字，可以使用小數點或逗號。

## 給譯者與開發者 {#for-translators-and-developers}

程式碼：[`src/i18n/`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)
（[`index.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/index.ts)、
[`languages.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/languages.ts)、
[`message.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/i18n/message.ts)），
[`src/ui/LanguagePicker.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/LanguagePicker.tsx)。

### 數字、清單與複數的寫法 {#how-numbers-lists-and-plurals-are-written}

- 帶小數的**數字**（`num`）使用該語言的小數點，並且**不做位數分組**：距離 3108 m 在每種語言中都保持為一個數字。
- 作為計數或大小的**整數**（`int`）使用該語言的位數分組。
- **清單**（`list`）以該語言的方式連接：「a、b 與 c」、「a、b 或 c」，或使用該語言自己的分隔符號依序排列（訊息 `common.listSeparator`：英語為 ", "，日語與兩種中文則為「、」）。
- **複數**透過 `Intl.PluralRules`（`one`、`two`、`few`、`many`、`other`）遵循各語言自己的規則。
- 傳給 `Intl` 的地區設定為該語言的標籤，但若標籤本身會取得其他國家的規則，則例外：葡萄牙語為 `pt-PT`（巴西的複數規則會把 0 視為 one），挪威語為 `nb`，簡體中文為 `zh-CN`，繁體中文為 `zh-TW`。

### 翻譯目錄 {#the-catalogs}

`src/i18n/locales/<語言>/<部分>.json`，檢視器的每個部分各一個檔案，每種語言的部分都相同。

檢視器共有 30 個部分的檔案（例如 `app.json`、`heat.json`、`match.json`、`race-text.json`、`units.json`），每種語言都有相同的一組。資料夾中列出了全部檔案。

每個檔案都是一個扁平的 JSON 物件：鍵是完整拼寫的（例如 `"race.ui.laps.load"`），值則是訊息。英語隨檢視器一起打包；其他語言則在選擇時才會下載。

**查找順序：**目前語言的訊息，其次是英語訊息，最後是鍵本身（在開發模式下，主控台會顯示 "i18n: no message …" 警告）。若訊息格式化失敗，會退回英語，因此有問題的譯文不會讓檢視器壞掉。

#### 訊息語法 {#the-message-syntax}

檢視器所使用的 ICU 訊息語法部分：

| 形式 | 範例 | 意義 |
|---|---|---|
| `{name}` | `{file} has no rows` | 原樣放入的數值 |
| `{n, plural, …}` | `{laps, plural, one {# lap} other {# laps}}` | 依該語言的複數規則選擇分支，或精確的 `=0`、`=1` …；`#` 是依該語言寫法呈現的數字 |
| `{w, select, …}` | `{kind, select, crash {Crash} other {Hit}}` | 依單字選擇的分支 |

分支可以巢狀，每個 `plural` 與 `select` 都必須有 `other` 分支。
與完整的 ICU 不同，**撇號就只是撇號**，因為車名與英語所有格中都有撇號，所以不需要加引號。無法寫出字面上的 `{` 或 `}`。

譯文必須保留的內容：大括號中的名稱由程式碼填入；`select` 中的單字是程式碼用來選擇分支的依據（`crash`、`onto-straight`、`yes`/`none`），必須與英語相同；複數類別則可以不同（每種語言使用自己的類別：波蘭語為 `one`、`few`、`many`、`other`；日語只有 `other`）。

### 翻譯如何產生，以及測試 {#how-the-translations-were-made-and-the-tests}

這些翻譯是由 AI 模型根據英語製作的，並使用賽車術語詞彙表；競賽文字還會在填入數值後再讀過一次。歡迎母語人士提出修正（見下文）。

`src/i18n/i18n.test.ts` 會檢查：

- 程式碼要求的每一則訊息在英語中都存在：每一個 `t('…')` 呼叫，以及保存在表格中並於之後交給 `t()` 的每個鍵（以部分名稱開頭的鍵，例如 `app.` 或 `heat.`）；
- 程式碼由各部分組成的訊息都存在：每個錯誤的 `label`、`short`、`count` 與 `here`，每個車輛比較的特徵，每個頻道的標籤；
- 每則訊息在每種語言中都能**解析**；
- 每個譯文都**保留英語訊息的數值與選擇**（不增加也不遺漏數值；每個 `select` 都保留其單字）；
- 每種語言都有**全部**的英語訊息，且已翻譯的語言集合恰好是上方的清單；
- 以所選語言顯示的訊息，在缺少時會退回英語。

### 修正譯文 {#correcting-a-translation}

歡迎母語人士提出修正，每項修正只是一行 JSON。

1. 找到該訊息：在英語目錄（`src/i18n/locales/en/`）中搜尋你看到的英文文字（將語言選擇器切換為英語即可閱讀），並記下它的鍵。
2. 在你的語言中打開同一個部分，例如 `src/i18n/locales/de/race-ui.json`，然後變更該鍵的值。保留其中每一個 `{name}`，保留 `select` 中的單字，並寫出你的語言所需的複數分支：

   ```json
   "race.ui.laps.courseLaps": "{count, plural, one {# Runde} other {# Runden}}",
   ```

3. 執行 `npm test`（或只執行 `npx vitest run src/i18n`）：測試會告訴你某個數值或選擇是否遺漏，或某則訊息是否已無法解析。
4. 在開發伺服器運行時，切換語言（或重新載入）後即可看到變更。

**新增訊息**（在程式碼中）：先將它加入英語部分，再加入其他每種語言（在每種語言都加入之前，測試會失敗）。

**新增語言**：將它加入 `languages.ts` 中的 `LANGUAGES`（其 BCP 47 標籤與原生名稱，以及必要時的別名或 `Intl` 地區設定），並建立資料夾 `src/i18n/locales/<標籤>/`，其中包含所有部分。
