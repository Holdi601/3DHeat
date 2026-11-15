---
title: "軟體渲染偵測"
parent: "渲染內部機制"
nav_order: 6
lang: "zh-Hant"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# 軟體渲染偵測

如果你的瀏覽器是用主處理器而不是顯示卡來繪圖，檢視器會慢上許多倍。檢視器會察覺這一點，並顯示一個紅色方塊，告訴你該開啟什麼。

當瀏覽器關閉了硬體加速，或它的驅動程式被列入黑名單時，它會在 CPU 上繪製 WebGL 與 WebGPU。一切仍然能運作，只是慢上許多倍，使用者的體驗會是「這個檢視器用我的資料慢到無法使用」——這個症狀指向的是工具，而不是瀏覽器中的某個開關。因此檢視器會查看渲染器的名稱，並直接說明（[`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)）。

## 橫幅 {#the-banner}

當渲染器被確定為軟體時，側邊欄頂端（熱度與對戰分頁）、模式列上方會出現一個紅色方塊：

![紅色橫幅：在沒有顯示卡的情況下執行](../assets/img/en/software-rendering-banner.webp)

> **在沒有顯示卡的情況下執行。**
> 這個瀏覽器是用 CPU 而不是顯示卡來繪圖，速度會慢上許多倍，無法處理大型資料集。請在瀏覽器設定中開啟硬體加速（Chrome：設定 → 系統 →「可用時使用圖形加速」，然後重新啟動），並確認顯示卡驅動程式是最新版本。

## 給開發者 {#for-developers}

### 如何判斷 {#how-it-decides}

渲染器字串——WebGL2 的 `UNMASKED_RENDERER_WEBGL`，或 WebGPU 的配接器廠商、架構與裝置——會被轉為小寫並加以分類：

- **軟體**：包含 `swiftshader`、`llvmpipe`、`softpipe`、`swrast`、`microsoft basic render driver`、`apple software renderer` 或 `generic renderer`；
- **硬體**：包含已知的 GPU 廠商或系列（`nvidia`、`geforce`、`rtx`、`quadro`、`amd`、`radeon`、`intel`、`arc`、`apple m`、`adreno`、`mali`、`powervr`、`xclipse`）；
- **未知**：其他情況。

只有*軟體*會顯示橫幅。無法辨識的配接器什麼都不會說：讓一台有正常顯示卡的電腦去重新設定瀏覽器，是比漏掉一個案例更糟的失誤。

### 簡短名稱 {#the-short-name}

同一個模組會把渲染器字串縮短以供顯示：例如從 ANGLE 字串 `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)`，它會保留裝置欄位，去掉 PCI id 與結尾的 API 與著色器模型版本，顯示為 `Vendor Model`。簡短名稱會出現在 **資源預算** 中，完整字串則為其提示文字；記憶體估算會顯示完整字串。
