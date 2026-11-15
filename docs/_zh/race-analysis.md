---
title: "赛车分析"
nav_order: 14
has_children: true
lang: "zh"
source: "race-analysis.md"
source_hash: "63d7f4b85872"
translated: true
outdated: false
---

# 赛车分析

你驾驶同一条赛道两次。**赛车分析**标签页会在 3D 中同时播放两次行驶，显示一圈在哪里更慢，并告诉你原因。还没有圈次？按**演示圈**。

![The Race analysis tab with demo laps: the sidebar with Laps and Where to improve, the cars on the course, the charts under the view](../assets/img/zh/race-analysis-overview.webp)

该标签页比较同一赛道上的两圈或更多圈。它与热力图共享画布、摄像机和已加载的赛道模型（**背景/关卡**）；其余部分都是它自己的：自己的侧边栏和视图下方自己的工具条。*圈*、*参考*和*弯心*等词语在[术语表](glossary.md)中。

本页是该标签页的地图。每个部分都有自己的页面：

| 页面 | 涵盖内容 |
|---|---|
| [加载圈次](race-loading-laps.md) | 每种文件格式、文件夹和赛道、车辆名称、演示圈、圈次列表、参考和聚焦 |
| [回放与 3D 场景](race-replay-and-scene.md) | 传输栏、三种回放模式、对齐车辆、追尾摄像机、线条、地图、车辆、标签、镜像世界 |
| [图表与 HUD](race-charts-and-hud.md) | 距离图表、图表选择器、悬停与缩放、车辆卡片、通道表 |
| [车辆操控事件](race-control-events.md) | 抱死、轮胎空转、过度转向、打滑、转向不足、碰撞、撞击、ABS/TC、手刹、空中——每项如何检测，附每个阈值 |
| [逐弯分析](race-corner-analysis.md) | 按距离对齐、弯道与路段、一个弯道的时间账、每个原因及其尝试顺序、走线形状和建议 |
| [车辆档案与对比](race-car-profiles.md) | 每辆车能做什么（从其圈次测量）；*车辆对比*；车辆在每个弯道中决定了什么 |
| [赛道统计](race-course-statistics.md) | 同一赛道的多圈：每个弯道和每种类型的失误、失误地图、热度图导出、性能极限 |
| [赛车分析：方法](race-analytics.md) | 规则背后的研究，附来源 |
| [其他赛车游戏](other-games.md) | 查看器对每款游戏圈次的处理：在游戏不发送数据的地方推算打滑和漂移、镜像世界、额外通道 |

## 界面 {#the-screen}

**侧边栏**，从上到下（各部分可以折叠）：

1. **圈次**——加载、列表、显示/隐藏、参考、聚焦、追尾。
   参见[加载圈次](race-loading-laps.md)。
2. **赛道统计**——仅在加载了三圈或更多时出现。
   参见[赛道统计](race-course-statistics.md)。
3. **可改进之处**——聚焦圈次的发现，逐弯显示。
   参见[逐弯分析](race-corner-analysis.md)。
4. **逐弯分析**（加载了多个类别时为*逐弯分析 - X 类*）——每个弯道中最快的圈及其走线。两圈或更多时显示。
5. **车辆控制**——聚焦圈次的抱死、滑动、推头和碰撞。
   参见[车辆操控事件](race-control-events.md)。
6. **车辆对比**（只有一辆车时为**车辆**）——参见[车辆档案与对比](race-car-profiles.md)。
7. **视图**——赛道上绘制哪张地图，以及绘制什么。
   参见[回放与 3D 场景](race-replay-and-scene.md)。
8. 共享的**关卡**和**相机与场景**面板（赛道模型、坐标轴反转、摄像机）——与热力图和[摄像机](camera.md)一同说明。

**视图**显示赛道、行驶线条、地图、车辆、固定在赛道上的标签，以及左上角最多六张车辆卡片（参见[图表与 HUD](race-charts-and-hud.md)）。未加载圈次时，它会显示“未加载圈次 - 将两个或更多圈次文件拖放到此处，或从侧边栏加载演示圈。”

**视图下方的工具条**包含回放传输控件，以及（除非隐藏）距离图表。

## 快速开始 {#quick-start}

1. 打开**赛车分析**标签页（位于侧边栏顶部**热力图**旁边）。
2. 获取圈次。按**演示圈**，看看该标签页如何处理三个虚构的圈次。对于你自己的圈次，请先录制（[文件格式与录制器](race-loading-laps.md#file-formats)），然后按**加载圈文件…**或**文件夹…**，或将文件或文件夹拖放到视图上。
3. 用时最快的完整一圈成为参考；其他圈中最慢的一圈被聚焦。点击列表中的任何一圈即可聚焦它；★ 可将一圈设为参考。
4. 阅读**可改进之处**。点击某个发现：车辆会在其前 40 m 处对齐，摄像机对准它，回放会播放经过它的部分，并打开测量数据。
5. 将鼠标悬停在图表上可使每辆车移动到该米位置；按住 Shift 点击则在该处对齐它们。

## 键盘 {#keyboard}

赛车标签页打开时：

| 按键 | 作用 |
|---|---|
| **K** | 播放 / 暂停回放 |
| **Home** | 回到回放起点 |
| 数字键 | 无（在热力图中它们用于切换模式） |

在文本框或下拉菜单中输入的按键会被忽略。摄像机按键的工作方式与热力图中相同（**W A S D**、**空格**上升、**Q** 下降、**Shift** 加速、**Alt** 减速、鼠标转动视角；全部在[摄像机](camera.md)中）；**F** 对准已加载的圈次（与加载圈次时相同）。

## 多圈 {#many-laps}

- 所有已加载的圈次都会被分析和统计；数十圈需要一两秒。
- 超过 **8** 圈（`SHOW_ALL_UP_TO`）时，新增的圈次只有在它们是参考、聚焦圈，或聚焦圈所在类别中的最快圈时才会绘制。*显示全部* / *仅显示正在查看的* 可以切换。
- 超过 **10** 辆可见车辆（`PLAIN_PAST`）时，未被查看的圈次（既不是聚焦、也不是追尾车辆或参考）会以每 6 m 一个点的线条绘制，而不是每 1.5 m 一个点，并且使用普通车辆外观。
- 图表最多绘制 **8** 圈；HUD 最多显示 **6** 张卡片。
- 从 **3** 圈起出现赛道统计。

详情：[赛道统计](race-course-statistics.md#performance-with-many-laps)。

## 默认视图设置 {#default-view-settings}

| 设置 | 默认值 |
|---|---|
| 地图 | 时间地图 |
| 行驶线条、车辆、轮胎与悬架、标签、来自圈次的赛道 | 开 |
| 卡片上的所有数值 | 关 |
| 车辆大小 | 1× |
| 图表 | 显示 |
| 回放模式 | 从线条开始 |
| 回放速度 | 1× |
| 循环 | 开 |

这些设置都不会保存；重新加载会从默认值开始。浏览器中会记住的内容：语言，以及从圈次文件中学到的车辆名称（参见[加载圈次](race-loading-laps.md#car-names)）。

## 开发者信息 {#for-developers}

### 加载圈次时会发生什么 {#what-happens-when-laps-are-loaded}

每当圈次集合、参考或语言发生变化时，整个分析都会重新进行（[`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts) 中的 `analyse`）：

1. 在游戏没有发送的地方，为每一圈添加推导出的通道：漂移角、由轮速得出的车轮滑移、空中状态、松散地面、横摆角速度（[`derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts)）。
2. 选出参考，并将每一圈投影到其路径上，每 2 m 重新采样（[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts)）。
3. 根据圈次判断游戏的世界是否镜像（[`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)）。
4. 在参考上找出弯道，并将其从一个刹车区到下一个刹车区分组为路段（[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts)）。
5. 对每辆车：其包络（每个速度下的抓地力、制动、牵引）、其档案、其轮胎曲线（[`envelope.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/envelope.ts)、[`profile.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/profile.ts)、[`control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts)）。
6. 对每圈和每个路段：它做了什么（刹车点、最慢点、全油门等……）以及它所走的线（[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts)）。
7. 对每圈：其车辆控制事件，每个事件都与该处对比的圈次并列。
8. 对每圈和每个路段：相对于对比圈的时间账，以及用文字表述的发现。
9. 每圈的时间地图和原因地图。

文字以当前语言生成；切换语言会重新运行分析（并重命名演示圈）。分析失败时，错误会显示在**圈次**按钮下方，圈次仍保持加载状态。

### 源文件 {#source-files}

| 文件 | 作用 |
|---|---|
| `src/race/adapters.ts`、`ibt.ts` | 读取圈次文件 |
| `src/race/lap.ts`、`carNames.ts`、`synthetic.ts` | 圈次类型、命名、演示圈 |
| `src/race/derive.ts`、`handedness.ts` | 推导通道、镜像世界 |
| `src/race/align.ts`、`segments.ts`、`line.ts` | 距离轴、弯道、线条 |
| `src/race/analysis.ts` | 弯道对比、原因、发现 |
| `src/race/envelope.ts`、`profile.ts` | 车辆能做什么 |
| `src/race/control.ts`、`impacts.ts` | 车辆控制、碰撞和撞击 |
| `src/race/stats.ts` | 多圈 |
| `src/race/replay.ts`、`scene.ts`、`glyph.ts`、`geometry.ts` | 回放与绘制 |
| `src/race/schema.ts`、`graphs.ts` | 通道表、图表的行 |
| `src/ui/race/*` | 侧边栏、图表、HUD、标签 |
| `src/state/raceStore.ts` | 标签页的状态和回放时钟 |
