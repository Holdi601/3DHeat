---
title: "导入数据"
nav_order: 3
has_children: true
lang: "zh"
source: "getting-data-in.md"
source_hash: "35eb9e47859c"
translated: true
outdated: false
---

# 导入数据

在 3DHeat 能画出任何东西之前，它需要一张表：每一行都说明某物在哪里，如果有的话，还包括何时以及是谁。本节说明一个文件如何变成一幅图画。还没有数据？试试[演示数据](demo-data.md)。

**现在就这样做：**

1. 在热力图侧边栏中打开**数据源**，按**多个文件…**（或把文件或文件夹拖到放置区）。
2. 查看**列映射**：各个方框通常已经填好。
3. 检查**内存估算**显示为*适合*。
4. 按**加载**。

```mermaid
flowchart LR
  A["Source<br/>pick files or a folder"] --> B["Preview<br/>first rows"]
  B --> C["Column mapping<br/>X, Y, Z, time, person, team"]
  C --> D["Memory estimate<br/>fits, tight or won't fit"]
  D --> E["Load"]
  E --> F["The picture"]
```

热力图标签页显示的一切都来自一个**数据集**：一张由行组成的表，每行都有一个位置，还可以有时间、人员、分组、会话、朝向以及任意数量用于筛选的额外列。本节说明数据集是如何生成的。

## 从文件到画面的路径 {#the-path-from-files-to-picture}

1. 在**数据源**面板中**选择文件**——一个、多个、一个文件夹树，或直接拖放。接受 Parquet、CSV、Tacview、GPS 轨迹等格式；完整列表见[数据格式](data-formats.md#files)。参见[加载文件](loading-files.md)。
2. **预览。** 打开所选的第一个文件：显示它的列名、前 50 行、哪些列看起来是数值，以及（对于 Parquet）每一列的逻辑类型和文件自带的读取说明，即 `heat3d` 页脚条目。
3. **自动映射。** 列会被分配到各个角色——X、Y、Z、时间、人员、会话、分组、朝向——并保留少数几列用于筛选。每个猜测都显示在**列映射**面板中，并且可以更改。参见[列映射](column-mapping.md)和[坐标轴、单位与时间](axes-units-and-time.md)。
4. **统计。** 读取每个文件的行数（Parquet 从页脚精确读取，CSV 则为估算），因此面板可以在加载前告诉你加载需要多少内存以及是否放得下。如果放不下，它会建议每隔 *N* 行加载一行。参见[内存与预算](memory-and-budgets.md)。
5. **加载。** 后台工作线程只解析每个文件中已映射的列——一次可以处理多个文件，最多不超过[解析线程](memory-and-budgets.md#parser-threads)预算——并按所选顺序将它们合并为一个数据集：所有文件共用一套人员、分组和会话的字典，共用一个时间起点，所有行按时间排序。参见[会话、人员与分组](sessions-persons-groups.md)。
6. **上传。** 主线程在一帧内显示“正在将 N 行上传到 GPU”，然后在 GPU 预算内把这些行打包进 GPU 内存。参见[GPU 内存驻留](gpu-memory.md)。
7. **第一幅画面。** 摄像机对准数据，精灵半径和饱和度根据数据范围和行数设定；渲染 8 帧之后，饱和度会根据画面本身进行测量（[颜色与曝光](colour-and-exposure.md)）。

## 加载前检查的要求 {#requirements-checked-before-a-load}

| 需要 | 缺少时会怎样 |
|---|---|
| **X / Y / Z 中至少两个** | 拒绝加载。只有两个时，第三轴为 0，数据会在 3D 场景中绘制为平面——这正是俯视地图热度图所需要的。 |
| 时间列 | 可选。没有它，时间线被禁用，视图保持在**全部**模式，侧边栏会说明这一点。 |
| 人员列 | 可选。[模型叠加](box-replay.md)（每个人一个图形）、[线条热度](line-heat.md)（每个人走过的路径）、插值、轨迹和**生命周期**历史都需要它。 |
| 分组列 | 可选。[队伍热度](team-heat.md)和[差值](difference.md)模式（至少两个分组）需要它。 |

已加载的数据无法支持的模式会在模式栏中灰显；把鼠标悬停在上面会说明原因。

## 没有你自己的数据时 {#without-your-own-data}

**数据集**面板（位于**数据源**下方）有一个[合成生成器](synthetic-generator.md)，可以生成任意规模的大逃杀式数据集，适合用来试用查看器，或测试一台机器能承受的极限。

## 本节包含的页面 {#pages-in-this-section}

- [加载文件](loading-files.md)——选择器、文件夹、拖放、多文件合并、移动文件规则、进度和取消
- [列映射](column-mapping.md)——映射面板中的每个字段、自动映射如何猜测、`heat3d` 提示
- [坐标轴、单位与时间](axes-units-and-time.md)——向上轴、翻转、单位比例、时间单位、朝向
- [会话、人员与分组](sessions-persons-groups.md)——各自的作用、限制、共享名称、实体大小、数据集面板
- [合成生成器](synthetic-generator.md)
- [内存与预算](memory-and-budgets.md)——占用模型、容量检查、抽稀、排序上限、资源预算
