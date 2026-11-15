---
title: "模型叠加中的图形"
parent: "图形"
grand_parent: "回放"
nav_order: 2
lang: "zh"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# 图形叠加中的图形

本页讲的是如何把方块变成每个单位真实样子的小型三维图形，以及图形身后留下的烟雾和火焰。回放本身的控件见[对局回放](match-replay.md)。

在[盒子回放](box-replay.md)和对局标签页的图形回放中，**用图标代替方块**（默认开启）会把每个在线人员画成其身份的图形：步行的士兵、某人驾驶的坦克、Tacview 轨迹所对应的飞机。图形具有方块的颜色、位置和朝向。对于飞机和导弹，它还具有俯仰，并且在数据中有 Roll 列时还有倾斜。**图标大小** 用于缩放它们；1 倍即为真实大小。点击图形的效果与点击其方块相同。

## 使用哪个图形 {#which-figure}

由数据自身的名称和类型列决定。完整的规则以及列名，见[图形](figures.md#which-figure-a-unit-gets)。两种列都没有的数据就是人员的数据：每个人都是士兵。

匹配结果按标签缓存，因此每一帧只需付出放置的代价。除非数据说明一个被追踪的物体有多大（CS2 导出数据说明一名玩家宽 32 个单位），否则一个数据单位就是一米；图形会据此缩放。

你可以在自己的电脑上用一个可选的、属于你自己的图形包替换目录中的图形；见[图形](figures.md#an-optional-local-figure-pack)。

## 效果 {#effects}

会留下某种东西一段时间的事件行，会在其发生的地方绘制，持续时间与其效果相同，颜色为造成它的一方的颜色：烟雾（约 18 秒）、燃烧瓶或燃烧弹（7 秒）、闪光弹（约 1 秒）和高爆弹爆炸（不到 1 秒）、诱饵（15 秒）、已布置的炸弹（40 秒）。它们来自一个事件列（Event、Events），其标签为 `smoke`、`molotov`、`incendiary`、`flash`、`he`、`decoy` 或 `plant`——CS2 导出数据会在引爆时写入它们。

## 对局回放：Tacview 的工具 {#match-replay-tacviews-tools}

相机、书签、战术显示、统计、标签、**垂线**、事件列表和图表窗口，都在[对局回放](match-replay.md)中说明。[Tacview 功能对等](tacview-parity.md)列出了每项 Tacview 功能及其当前状态。
