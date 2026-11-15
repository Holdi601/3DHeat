---
title: "其他赛车游戏"
parent: "赛车分析"
nav_order: 59
lang: "zh"
source: "other-games.md"
source_hash: "79f0f087f176"
translated: true
outdated: false
---

# 查看器支持的其他赛车游戏

查看器可以读取许多赛车游戏的圈数据，而不只是一款。本页列出这些游戏，并说明如何从每款游戏中导出一圈。

## 游戏列表 {#the-games}

| 游戏 | 记录器 | 文件中有滑移吗？ | 世界是否镜像？ | 备注 |
|---|---|---|---|---|
| Forza Horizon 4/5/6, Forza Motorsport | `heat3d_capture telemetry`（通过 UDP 的 Data Out），或 FH Companion 的圈文件加上它们的 `.tele.gz` | 有，每个车轮（已归一化） | 有（左手坐标系世界） | 每个 FH Companion 圈文件旁的 `.tele.gz` 提供每个车轮的滑移；只有圈文件本身则没有 |
| Assetto Corsa, ACC, AC EVO, AC Rally | `heat3d_capture telemetry --game ac / acc / acevo / acrally`（共享内存） | 有，每个车轮 | 从圈数据中测得 | 另外还有 ABS 和牵引力控制的作用、车轮负载、温度 |
| EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4 | `heat3d_capture telemetry --game wrc / dirtrally2 / dirtrally / dirt4`（UDP） | 没有，由车轮速度推算 | 从圈数据中测得 | 拉力赛：松软路面和跳跃的判断方式不同 |
| Richard Burns Rally | `heat3d_capture telemetry --game rbr`（NGP UDP） | 没有 | 从圈数据中测得 | 没有车轮速度 |
| BeamNG.drive | `heat3d_capture telemetry --game beamng`（一个模组） | 没有，由车轮速度推算 | 从圈数据中测得 | |
| Trackmania | Openplanet 插件，`telemetry --game trackmania --install` | 每个车轮一个滑移系数 | 从圈数据中测得 | 街机式物理：滑动的判断方式不同 |
| iRacing | 无：使用它自己的 `.ibt` 文件 | 没有（未记录）；由横摆推算 | 没有（基于 GPS） | 在车内用 Alt+L 打开记录 |

## 如何记录一圈 {#how-to-record-a-lap}

1. 在表中选择你的游戏，并按照该游戏的记录器页面进行设置（在游戏中做设置、安装模组，或 iRacing 无需任何设置）。各游戏的步骤不同，所以写在记录器的文档中：[GameCapture：游戏](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)。
2. 启动记录器，然后开车。它每圈写入一个文件。
3. 在 **赛车分析** 标签页中按 **加载圈文件…**，选择同一赛道的两圈或更多圈（见 [加载圈数据](race-loading-laps.md)）。

对于拉力赛游戏，记录器每个赛段运行生成一个文件；对于 Forza，最简单的开始方式是使用 FH Companion 的库，并把 `.tele.gz` 文件放在圈文件旁边。

## 记录器的文档 {#what-the-recorders-document}

每款游戏如何记录、发送什么内容、其布局的来源，以及可从其文件导出哪些赛道，都由记录器负责说明：[GameCapture：游戏](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)（公开，位于 [3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture)）。每个记录器写入的圈文件格式见 [GameCapture：圈文件格式](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)。

## 查看器如何处理这些数据 {#what-the-viewer-does-with-them}

每款游戏最终都会变成 `heat3d-lap` 文件（或圈 CSV，或像 iRacing 的 `.ibt` 那样被直接读取），使用 `src/race/schema.ts` 中的标准通道名，并带有一个 `meta` 块，说明其数值的含义：滑移如何缩放、是赛道、拉力还是街机模式、以及已知时的路面。因此 **赛车分析** 标签页对它们一视同仁。未加载赛道模型时，**赛车分析** 标签页会根据圈数据自身的分布绘制道路，所以没有赛道模型，每款游戏也都能使用。

所有拉力游戏都不发送的轮胎滑移由查看器自行计算：若游戏发送了每个车轮的接触面或表面速度，就用它与车速比较（`(wheel - car) / car`）；若只发送了转速，则用该圈上测得的滚动半径，根据转速计算。漂移角来自车辆自身的速度（Forza、AC 系列、Trackmania、RBR），或来自投影到车辆轴上的世界速度（EA WRC、DiRT、BeamNG），或来自车头朝向与路径的差。车辆是否在空中，由其车轮的接触、负载或悬挂判断。参见 `src/race/derive.ts`。

若某款游戏的世界是左手坐标系（Forza 就是），赛道在查看器中会被镜像；圈数据本身的转向和悬挂会暴露这一点，**赛车分析** 标签页会提供反转一个轴的选项。坐标系未有文档说明的游戏（RBR、BeamNG、Trackmania）也以同样方式处理：通过测量确定，而不是假定。

除驾驶通道之外，记录器还保存每款游戏额外提供的内容：AC 系列的 ABS 和牵引力控制动作、制动分配、DRS、维修区限速器、增压，以及刹车片和刹车盘寿命；iRacing 的辅助设置、制动分配、燃油、机油和水温，以及它以自己名称记录的其他每个通道。查看器从其通道表中绘制这些内容，包括指示灯、等级条、图标和曲线图，所以多记录数据无需修改查看器。
