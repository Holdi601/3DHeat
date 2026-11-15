---
title: "兩種後端"
parent: "渲染內部機制"
nav_order: 1
lang: "zh-Hant"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# 兩種後端

瀏覽器可以用兩種方式讓頁面使用顯示卡：WebGPU（較新）和 WebGL2。檢視器兩種都能用，並會自己選出最好的一種，所以你通常不需要做任何事。要看目前用的是哪一種，請查看檢視畫面右上角統計浮層中的 **後端**。

![統計浮層：後端、FPS、影格、時間窗內資料列、Sprite／影格、預算、熱度解析度、覆蓋率](../assets/img/en/performance-stats-overlay.webp)

檢視器在同一個介面後面有兩套完整的渲染器（[`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)）：**WebGPU**（[`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)）與 **WebGL2**（[`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)）。兩者使用相同的演算法，畫出相同的畫面；著色器同時以 WGSL 與 GLSL ES 3.00 撰寫。統計浮層的第一行 **後端** 會顯示目前執行的是哪一種；將滑鼠移到上面，若沒有使用 WebGPU，會顯示原因。

## 給開發者 {#for-developers}

### 如何選擇 {#how-one-is-chosen}

一個畫布只能擁有一種內容環境，所以選擇只會在任何繪製之前做一次（[`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)）：

1. 除非強制使用 WebGL2：若存在 `navigator.gpu`，就要求一個 `powerPreference: 'high-performance'` 的配接器與一個裝置，並建立 WebGPU 渲染器。任何失敗都會記下原因。
2. 若強制使用 WebGPU 且失敗，就停止：畫面會顯示 *無法初始化渲染器。* 並附上原因。
3. 否則建立 WebGL2 渲染器（同樣要求高效能配接器）。若 WebGL2 無法使用，或無法渲染到浮點紋理（`EXT_color_buffer_float`），畫面會顯示錯誤。

`powerPreference: 'high-performance'` 能避免具有可切換顯示晶片的筆電把整合式 GPU 交給頁面使用。除此之外，頁面無法控制：硬體加速是瀏覽器的設定。

### 網址參數 {#url-switches}

把以下參數加在頁面網址後面，例如 `http://127.0.0.1:5273/?backend=webgl2`。

| 參數 | 效果 |
|---|---|
| `?backend=webgpu` | 使用 WebGPU，否則失敗。 |
| `?backend=webgl2` | 即使 WebGPU 可用，也使用 WebGL2 ——用來區分「這裡渲染錯誤」與「在 WebGPU 上渲染錯誤」。 |
| `?heat=f16` | 在兩種後端上強制使用 16 位元熱度累積路徑（[半精度浮點累積](half-float-accumulation.md)）。 |
| `?glcheck` | WebGL2：在影格中讀取 GL 錯誤，並將其放在 `renderer.heatDebug` 上。預設關閉，因為 `getError` 是管線同步點。 |
| `?occdebug=<n>` | WebGL2 開發者輔助功能：以遮擋除錯值取代熱度。不供一般使用。 |

### 重要差異 {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| 資料列儲存 | 儲存緩衝區：資料列索引就是陣列下標。會要求配接器能提供的最大儲存緩衝區綁定與緩衝區大小。 | 整數紋理（寬 8,192 texel），透過每個影格的區塊索引紋理，從 `gl_VertexID` 定址。 |
| 32 位元熱度累積 | 當配接器同時提供 `float32-blendable` 與 `float32-filterable` 時 | 當有 `EXT_float_blend` 時 |
| 其他情況 | 16 位元（`r16float`） | 16 位元（`R16F`） |
| 深度範圍 | [0, 1]；引擎會預先乘上把 three.js 的 [-1, 1] 矩陣重新映射的矩陣。若沒有這一步，平行投影（其深度是線性的）幾乎全部會落在 0 以下，並被無聲地裁掉。 | [-1, 1]，照原樣使用 |
| 統一變數（uniform） | 一組以 256 位元組對齊的環形槽位，每次繪製一個，以偏移量綁定——`queue.writeBuffer` 在佇列上是有順序的，所以若每次繪製都重寫同一個緩衝區，每次繪製都會讀到最後一次寫入的值。熱度通道的統一區塊正好是一個 256 位元組槽位。 | 一般的 uniform |
| 熱度目標低於畫布解析度 | 取得自己的深度紋理（一個通道中的所有附件都必須是相同大小） | |
| 影格擷取 | `captureFrame()` 會把合成結果再渲染一次到離屏目標，再讀回（無頭 Chromium 會渲染 WebGPU，但不會合成它的畫布） | 在下一個渲染的影格中讀回預設的幀緩衝區 |
| 讀回 | 保留並重複使用暫存緩衝區；同時只有一個讀取在進行中 | `readPixels`，先詢問驅動程式哪一組格式／型別是合法的 |

兩種後端都以半精度浮點上傳 sprite 曲線表；WebGPU 的 `queue.writeTexture` 會直接複製原始位元組，所以資料要先編碼成 binary16（[`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)）。

#### 紋理上限 {#texture-limits}

`texStorage2D` 超過 `MAX_TEXTURE_SIZE` 時不會丟出例外：配置會被捨棄，之後的上傳會失敗，取樣則回傳零。WebGL2 輔助函式 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) 會把兩個維度與上限比較，超過時丟出並附上大小；區塊索引紋理是二維的（寬 4,096），所以不會超過上限；`src/render/limits.test.ts` 會把每個紋理維度與值得支援的上限對照鎖定。WebGL2 渲染器也會拒絕最大紋理大小低於資料列紋理寬度 8,192 的裝置。

### 兩種都要測試 {#testing-both}

`npm run smoke` 會在無頭 Chromium 中以 WebGL2 驅動真正的應用程式（預設為 `http://127.0.0.1:5273/`）；若要測試 WebGPU，請對 `node tools/smoke.mjs` 傳入 `"http://127.0.0.1:5273/?backend=webgpu"`；半精度路徑則使用 `npm run smoke:f16`。`tools/probe-webgpu.mjs` 與 `tools/probe-present.mjs`（列在 [命令列工具](ref-tools.md) 的開發者工具下）用來在無頭瀏覽器中診斷配接器與呈現是否可用。
