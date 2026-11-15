---
title: "两种后端"
parent: "渲染内部机制"
nav_order: 1
lang: "zh"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# 两种后端

浏览器可以通过两种方式让页面使用显卡：WebGPU（较新）和 WebGL2。查看器两者都能用，并会自行选择最好的一种，所以你通常什么都不用做。要查看当前用的是哪一种，请看统计浮层中的 **后端**（在视图右上角）。

![统计浮层：后端、FPS、帧耗时、窗口内行数、精灵数/帧、预算、热度分辨率、覆盖率](../assets/img/en/performance-stats-overlay.webp)

查看器在同一接口后面有两套完整的渲染器（[`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)）：**WebGPU**（[`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)）和 **WebGL2**（[`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)）。两者使用相同的算法画出相同的画面；着色器同时以 WGSL 和 GLSL ES 3.00 两种形式存在。统计浮层的第一行 **后端** 显示正在运行的是哪一种；如果没有使用 WebGPU，把鼠标悬停在上面可以看到原因。

## 开发者须知 {#for-developers}

### 如何选择 {#how-one-is-chosen}

一个画布只能持有一种上下文，所以选择只在开始绘制之前做一次（[`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)）：

1. 除非强制使用 WebGL2：如果存在 `navigator.gpu`，就以 `powerPreference: 'high-performance'` 请求一个适配器和设备，并创建 WebGPU 渲染器。任何失败都会被记下作为原因。
2. 如果强制使用 WebGPU 且失败，则停止：视图显示 *无法初始化渲染器。* 以及原因。
3. 否则创建 WebGL2 渲染器（同样请求高性能适配器）。如果 WebGL2 不可用，或无法渲染到浮点纹理（`EXT_color_buffer_float`），视图就显示错误。

`powerPreference: 'high-performance'` 能防止带有可切换显卡的笔记本把集成显卡交给页面使用。除此之外，页面无法控制：硬件加速是浏览器的设置。

### URL 开关 {#url-switches}

将下列内容加在页面地址后面，例如 `http://127.0.0.1:5273/?backend=webgl2`。

| 参数 | 效果 |
|---|---|
| `?backend=webgpu` | 使用 WebGPU，否则失败。 |
| `?backend=webgl2` | 即使 WebGPU 可用，也使用 WebGL2——用来区分"这里渲染错误"和"这里在 WebGPU 上渲染错误"。 |
| `?heat=f16` | 在任一后端上强制使用 16 位热度累积路径（[半浮点累积](half-float-accumulation.md)）。 |
| `?glcheck` | WebGL2：在帧中读取 GL 错误，并通过 `renderer.heatDebug` 公开。默认关闭，因为 `getError` 是流水线同步点。 |
| `?occdebug=<n>` | WebGL2 开发辅助：用遮挡调试值替换热度。不用于日常使用。 |

### 重要的差异 {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| 行存储 | 存储缓冲区：行索引就是数组下标。请求适配器能提供的最大存储缓冲区绑定和缓冲区大小。 | 整数纹理（宽 8,192 个纹素），通过每帧的块索引纹理从 `gl_VertexID` 寻址。 |
| 32 位热度累积 | 当适配器同时提供 `float32-blendable` 和 `float32-filterable` 时 | 当存在 `EXT_float_blend` 时 |
| 其他情况 | 16 位（`r16float`） | 16 位（`R16F`） |
| 深度范围 | [0, 1]；引擎会预先乘上把 three.js 的 [-1, 1] 矩阵重新映射的矩阵。没有它，平行投影（深度是线性的）几乎全部落在 0 以下，并被悄悄裁掉。 | [-1, 1]，原样使用 |
| 统一变量（uniform） | 一个按 256 字节对齐的槽位环，每次绘制一个，通过偏移绑定——`queue.writeBuffer` 在队列上是有序的，所以如果每次绘制都重写同一个缓冲区，每次绘制都会读到最后一次写入。热度通道的统一变量块恰好是一个 256 字节的槽位。 | 普通统一变量 |
| 低于画布分辨率的热度目标 | 拥有自己的深度纹理（一个通道中的每个附件必须大小相同） | |
| 帧捕获 | `captureFrame()` 把合成图再渲染一次到离屏目标并读回（无界面 Chromium 会渲染 WebGPU，但从不合成其画布） | 在下一个渲染帧读回默认帧缓冲区 |
| 读回 | 保留并复用暂存缓冲区；同一时间只有一个读取在进行 | `readPixels`，先询问驱动程序哪种格式/类型组合是合法的 |

两个后端都把精灵曲线表以半浮点上传；WebGPU 的 `queue.writeTexture` 会复制原始字节，所以数据要先编码为 binary16（[`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)）。

#### 纹理限制 {#texture-limits}

`texStorage2D` 超过 `MAX_TEXTURE_SIZE` 时不会抛出异常：分配被丢弃，之后的上传失败，采样返回零。WebGL2 辅助函数 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) 会把两个维度与限制比较，超出时抛出并报告尺寸；块索引纹理是二维的（宽 4,096），所以不会超出限制；`src/render/limits.test.ts` 把每个纹理尺寸与值得支持的限制绑定起来检查。WebGL2 渲染器还会拒绝最大纹理尺寸低于行纹理宽度 8,192 的设备。

### 两者都测试 {#testing-both}

`npm run smoke` 在无界面 Chromium 中以 WebGL2 运行真实应用（默认为 `http://127.0.0.1:5273/`）；对于 WebGPU，把 `"http://127.0.0.1:5273/?backend=webgpu"` 传给 `node tools/smoke.mjs`；对于半浮点路径，运行 `npm run smoke:f16`。`tools/probe-webgpu.mjs` 和 `tools/probe-present.mjs`（列在 [命令行工具](ref-tools.md) 的开发者工具下）用于诊断无界面浏览器中的适配器和呈现是否可用。
