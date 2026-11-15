---
title: "软件渲染检测"
parent: "渲染内部机制"
nav_order: 6
lang: "zh"
source: "software-rendering.md"
source_hash: "2ae9a1addecb"
translated: true
outdated: false
---

# 软件渲染检测

如果你的浏览器用主处理器而不是显卡绘图，查看器会慢很多倍。查看器会注意到这一点，并显示一个红色方框，告诉你该打开什么。

当浏览器关闭了硬件加速，或其驱动程序被列入黑名单时，它会用 CPU 绘制 WebGL 和 WebGPU。一切仍然可以工作，只是慢很多倍，结果就是"这个查看器处理我的数据慢得无法使用"——这种症状指向的是工具，而不是浏览器中的某个开关。因此查看器会查看渲染器的名称，并把它说出来（[`gpuClass.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/gpuClass.ts)）。

## 横幅 {#the-banner}

当渲染器被明确识别为软件渲染时，侧边栏顶部（热力图和对局标签页）、模式栏上方会出现一个红色方框：

![红色横幅：未使用显卡运行](../assets/img/en/software-rendering-banner.webp)

> **当前未使用显卡运行。**
> 此浏览器正在用 CPU 而不是显卡绘图，速度会慢很多倍，无法处理大型数据集。请在浏览器设置中开启硬件加速（Chrome：设置 → 系统 → "可用时使用图形加速"，然后重新启动），并检查显卡驱动程序是否为最新版本。

## 开发者须知 {#for-developers}

### 判断方式 {#how-it-decides}

渲染器字符串——WebGL2 的 `UNMASKED_RENDERER_WEBGL`，或 WebGPU 的适配器厂商、架构和设备——会被转为小写并进行分类：

- 包含 `swiftshader`、`llvmpipe`、`softpipe`、`swrast`、`microsoft basic render driver`、`apple software renderer` 或 `generic renderer` 时为**软件**；
- 包含已知的 GPU 厂商或系列（`nvidia`、`geforce`、`rtx`、`quadro`、`amd`、`radeon`、`intel`、`arc`、`apple m`、`adreno`、`mali`、`powervr`、`xclipse`）时为**硬件**；
- 其他情况为**未知**。

只有*软件*会显示横幅。无法识别的适配器什么也不说：让一个拥有正常显卡的人去重新配置浏览器，比漏掉一种情况是更严重的失误。

### 短名称 {#the-short-name}

同一模块也会为显示而缩短渲染器字符串：例如从形如 `ANGLE (Vendor, Vendor Model (0x0000ABCD) Direct3D11 vs_5_0 ps_5_0, D3D11)` 的 ANGLE 字符串中，它保留设备字段，去掉 PCI id 以及末尾的 API 和着色器模型，显示为 `Vendor Model`。短名称显示在 **资源预算** 中，完整字符串作为其工具提示；内存估算则显示完整字符串。
