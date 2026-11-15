---
title: "模型疊加中的圖示"
parent: "圖示"
grand_parent: "重播"
nav_order: 2
lang: "zh-Hant"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# 圖示疊加中的圖示

這一頁說明如何把方塊變成每個單位實際上是什麼的小型 3D 圖示，以及圖示留下的煙霧與火焰。重播本身的控制項位於[對戰重播](match-replay.md)。

在[箱形重播](box-replay.md)與對戰分頁的圖示重播中，**以圖示取代方塊**（預設開啟）會把每個活動中的人員畫成他們所代表的圖示：步行的士兵、某人駕駛的坦克、Tacview 軌跡所代表的飛機。圖示具有方塊的顏色、位置與航向。對於飛機與飛彈，若資料有 Roll 欄位，它還會有俯仰與傾斜。**圖示大小** 會縮放它們；1 倍即為真實大小。點擊圖示的回應方式，與點擊它的方塊相同。

## 哪一種圖示 {#which-figure}

由資料本身的名稱與類型欄位決定。完整規則與欄位名稱見[圖示](figures.md#which-figure-a-unit-gets)。兩種欄位都沒有的資料屬於人員：每個人都是士兵。

配對結果會依標籤快取，所以每個影格只需付出放置的成本。除非資料說明一個被追蹤物件有多大，否則一個資料單位即為一公尺（CS2 匯出會說明一名玩家寬 32 單位）；圖示會依此縮放。

你自己的一組可選圖示可以在你的電腦上取代目錄圖示；見[圖示](figures.md#an-optional-local-figure-pack)。

## 效果 {#effects}

會留下某種東西一段時間的事件列，會在事件發生的位置繪製，持續到該效果結束，顏色取決於造成它的人：煙霧（約 18 秒）、燃燒瓶或燃燒彈（7 秒）、閃光（約一秒）與高爆爆炸（不到一秒）、誘餌（15 秒）、已放置的炸彈（40 秒）。它們來自標籤為 `smoke`、`molotov`、`incendiary`、`flash`、`he`、`decoy` 或 `plant` 的事件欄位（Event、Events）——CS2 匯出會在引爆時寫入它們。

## 對戰重播：Tacview 的工具 {#match-replay-tacviews-tools}

攝影機、書籤、戰術顯示、統計、標籤、**垂直線**、事件清單與圖表視窗，都說明在[對戰重播](match-replay.md)中。[Tacview 對等功能](tacview-parity.md)列出每一項 Tacview 功能，以及它目前的狀態。
