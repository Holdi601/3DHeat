---
title: "热度模式"
nav_order: 4
has_children: true
lang: "zh"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# 热度模式

每个点都会加上一点光晕，光晕叠加起来，叠加的结果再用颜色绘制。模式是五种绘制方式，每种回答一个问题。

热力图标签页侧边栏顶部的模式栏决定如何绘制[数据集](glossary.md)。按键 1-4 分别选择热度、差值、队伍热度和线条。模型叠加没有快捷键。

![The mode bar with Heat, Difference, Team heat, Figure overlay and Lines](../assets/img/en/heat-modes-bar.webp)

| 模式 | 它回答的问题 |
|---|---|
| **热度** | 发生在哪里，发生了多少？ |
| **差值** | 哪一方做得更多？ |
| **队伍热度** | 是谁的？ |
| **线条** | 人们走了哪条路？ |
| **模型叠加** | 谁在哪里，在什么时候？ |

![The same data in four modes: Heat, Difference, Team heat and Lines](../assets/img/en/heat-modes-grid.webp)

| 模式（模式栏标签） | 按键 | 绘制内容 | 需要 |
|---|---|---|---|
| **热度** | 1 | 叠加式密度：每个可见行都会添加一个面向摄像机的径向精灵。[热度](heat.md) | 一个数据集 |
| **差值** | 2 | 带符号的密度：一组人口相加，另一组相减。[差值](difference.md) | 两方：至少两个分组，或在保留的列上进行划分 |
| **队伍热度** | 3 | 按分组着色的密度：每个分组一种色相，在分组重叠处混合。[队伍热度](team-heat.md) | 一个分组列 |
| **模型叠加** | - | 每个人一个图形（或方框），沿时间线移动：即回放。[模型叠加](box-replay.md)、[比赛回放](match-replay.md) | 一个人员列 |
| **线条** | 4 | 线条热度：从一个人的每个采样点到其下一个采样点画一条线，热度向两侧衰减。[线条热度](line-heat.md) | 一个人员列和一个时间列 |

数据无法支持的模式会灰显，其提示框会给出原因，例如 *不可用 - 差值模式需要两个分组，或一个可用于划分的保留列；此数据只有一个分组。* 当新数据集无法支持当前模式时，视图会回退到**热度**。

按键 1-4 同样会对照数据进行检查：对灰显模式按下对应按键不会有任何作用。

## 每种模式显示哪些面板 {#which-panels-each-mode-shows}

| 面板 | 热度 | 差值 | 队伍热度 | 模型叠加 | 线条 |
|---|---|---|---|---|---|
| 路线（[线条热度](line-heat.md)） | | | | | 是 |
| 热度形状（含**跟随视图**和**任意缩放下密度一致**）、热度颜色、精灵像素钳制、深度、距离剔除 | 是 | 是 | 是 | | 是 |
| 方向（[方向热度](directional-heat.md)）、数值（[数值加权](value-weighting.md)） | 是 | 是 | 是 | | 是 |
| 队伍查看器（[模型叠加](box-replay.md)） | | | | 是 | |
| 差值划分（[差值](difference.md)） | | 是 | | | |
| [队伍](teams-list.md)、[实体](entities.md)、[筛选](filters.md)、背景 / 关卡、[切片](slice.md)、[测量](measure.md)、摄像机路径与渲染、性能、摄像机与场景 | 是 | 是 | 是 | 是 | 是 |

## 所有热度模式共有的部分 {#what-every-heat-mode-shares}

四种热度模式（除模型叠加外的所有模式）是同一台机器，只是输入不同（[`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)）：

1. **哪些行。** [时间线](timeline.md)窗口选出按时间排序的一段连续行；[筛选](filters.md)、分组可见性、差值划分、[距离剔除](depth-and-culling.md#distance-culling)和[切片](slice.md)在顶点着色器中逐行决定每一行是否参与以及参与的强度。
2. **泼溅。** 每个参与的行被绘制为一个精灵（在线条模式中则为一段线段）到一个浮点**热度目标**中，并加上其渐变值。当行数超过一帧所能承受的数量时，会绘制行的分层采样，并按权重进行补偿。参见[采样与预算](sampling-and-budgets.md)。
3. **累积。** 在没有任何变化时，帧会被不断合并，直到每一行恰好贡献一次。参见[累积](accumulation.md)。
4. **合成。** 每个像素的累积值除以**饱和点**，经过**密度响应**塑形，再由**最低热度**提升，然后在**颜色渐变**中查找，其透明度将其混合到场景上。参见[颜色与曝光](colour-and-exposure.md)。

第 4 步的所有内容都在合成时应用，因此拖动这些控件永远不会重新开始累积；而第 1-2 步中的任何变化都会重新开始。

## 本节包含的页面 {#pages-in-this-section}

- [热度](heat.md)——普通热度模式，以及其面板概览
  - [精灵形状](sprite-shape.md)——半径、强度、衰减、曲线编辑器、像素钳制、扁平化
  - [颜色与曝光](colour-and-exposure.md)——渐变编辑器、饱和点、自动曝光、最低热度、密度响应
  - [深度与剔除](depth-and-culling.md)——被关卡遮挡、隐藏在地形后、距离剔除
- [差值](difference.md)——差值划分
- [队伍热度](team-heat.md)
- [线条热度](line-heat.md)——路线
- [模型叠加](box-replay.md)——回放模式（文件仍名为 box replay）
- [方向热度](directional-heat.md)
- [数值加权](value-weighting.md)
