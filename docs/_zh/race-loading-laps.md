---
title: "加载圈次"
parent: "赛车分析"
nav_order: 51
lang: "zh"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

圈文件记录的是一次驾驶：车在哪里、驾驶员做了什么，每秒记录许多次。加载同一条赛道的两圈或更多圈后，**赛车分析**标签页就能比较它们。

![赛车分析标签页的“圈”部分，加载了三条演示圈：圈列表、参考星标和焦点](../assets/img/en/race-loading-laps-list.webp)

## 你的第一批圈 {#your-first-laps}

1. 打开**赛车分析**标签页。
2. 只是想看看？按**演示圈**（见[演示圈](#demo-laps)）。
3. 想用自己的圈：用录制工具在游戏中录下（见[文件格式](#file-formats)）。录制工具每圈写一个文件。
4. 按**加载圈文件…**，选择同一条赛道的两个或更多文件；或按**文件夹…**，选择存放这些文件的文件夹。你也可以把文件或文件夹拖到 3D 视图上。
5. 点击圈列表中的一圈，看它在哪里损失时间。

**注意：圈只能逐条赛道比较。** 加载另一条有名字的赛道的圈时，已加载的圈会先被清除。

## 按钮 {#the-buttons}

| 控件 | 作用 |
|---|---|
| **加载圈文件…** | 文件选择框，可一次选多个 `.json`、`.csv`、`.txt`、`.ibt`、`.gz` 和 `.h3dcars` 文件（`.h3dcars` 是车辆文件，见[车辆](race-replay-and-scene.md#the-cars)） |
| **文件夹…** | 文件夹选择框：加载该文件夹及其子文件夹中的每个圈文件 |
| **演示圈** | 一条虚构赛道上的三圈（见[演示圈](#demo-laps)） |
| **清除** | 移除所有圈（加载了圈后才会显示） |
| 拖到视图上 | 拖到 3D 视图上的文件和整个文件夹，加载方式相同 |

圈会**添加**到已加载的圈中——**但如果它们属于另一条有名字的赛道，则先清除已加载的圈**（圈只能逐条赛道比较）。无法读取的文件会列在按钮下方，每个文件一行；其余文件照常加载。

## 文件格式 {#file-formats}

程序根据内容判断格式，而不是文件名。简单地说：

- **heat3d-lap** 是 3DHeat 录制工具对大多数游戏写出的文件。
- **FH Companion** 是一款免费工具，用来录制 Forza Horizon 的圈。它写出一个圈文件，并在旁边写出一个 `.json.tele.gz` 文件（同一圈里每个轮胎的数据，经过 gzip 压缩）。两个文件要一起选中。
- **iRacing `.ibt`** 是 iRacing 自己的遥测文件。在车里按 Alt+L 打开记录，然后原样加载该文件。
- **圈 CSV** 是普通表格，每行是一个时刻。

| 格式 | 典型来源 | 读取函数 |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...`（Forza Horizon 和 Motorsport 通过 Data Out、AC / ACC / AC EVO / AC Rally、EA SPORTS WRC、DiRT Rally 2.0 / 1、DiRT 4、Richard Burns Rally、BeamNG.drive） | `fromHeat3dLap` |
| FH Companion 圈 `.json` | FH Companion 的圈库 | `fromFhCompanion` |
| FH Companion 遥测 `.json.tele.gz` | 每个 FH Companion 圈文件旁边的文件 | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing 自己的遥测文件（在车里按 Alt+L 打开记录） | `readIbt` |
| 圈 CSV | `heat3d_capture laps`、Trackmania 插件，或任何带 `x`、`z`、时间列、可选 `lap` 列的 CSV | `fromCsv` |

每款游戏如何录制、发送什么数据，由录制工具说明：
[GameCapture：游戏](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
和 [GameCapture：圈格式](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md)。
另见[其他赛车游戏](other-games.md)。

## 文件夹与赛道 {#folders-and-courses}

**文件夹…**或拖入的文件夹，会带入其下的每个文件。在文件夹中，只考虑以 `.json`、`.csv`、`.txt`、`.ibt` 或 `.tele.gz` 结尾的文件；不是圈的 `.json`（赛道自己的文件、地图）会被跳过，不报错。

**一次选中多条赛道。** FH Companion 的圈库把每条赛道放在名为 `<赛道名> (course_<x>_<z>_to_<x>_<z>)` 的文件夹中（未命名的赛道则是 `course_...`）。如果选中的文件分布在多个这样的赛道文件夹中，则什么都不加载；**圈**一节会显示“这些圈来自 N 条赛道，而圈只能逐条赛道比较。请选择一条：”，并列出每条赛道及其圈数（以 `.json`、`.csv` 或 `.ibt` 结尾的文件，不计 `course.json`），圈最多的排在最前。点击其中一条，即加载该赛道的文件。

赛道以其名称和**起点**区分，而不是终点。没有跑完的圈，FH Companion 会以相同的名称和起点保存在 `unfinished/` 中，终点记为它停下的位置——它们与所属赛道一起归类，并在列表中标为**不完整**。

**所选文件涉及多条赛道。** 直接选中的文件（不是来自赛道文件夹）如果属于多条有名字的赛道，则为每条赛道提供同样的选择。没有赛道名的圈，跟随所选的那条赛道。

## 车辆名称 {#car-names}

圈以游戏给出的车辆完整名称命名。如果圈文件没有写出车辆名，则按以下顺序处理：

1. **文件夹。** FH Companion 的圈库把圈存放在 `<赛道>/<级别>/<车辆名> '<yy> (car<编号>)/<调校>/<标签>/<圈>.json` 中。最内层、匹配 `<名称> (car<编号>)` 的文件夹给出名称和编号；只匹配 `car<编号>` 的，则只给出编号。只有选择文件夹或拖入文件夹时，才会带上这个路径。
2. **同一车辆的另一圈。** 只要有一圈写出了车辆名，所有游戏和车辆编号相同的圈都会使用这个名称——包括一起加载的圈，以及以后在此浏览器中加载的圈：名称保存在 `localStorage` 的 `heat3d.carNames` 中（键为 `<游戏>:<车辆编号>`）。在无痕窗口中，它们只保留到圈被清除为止。
3. 否则用编号显示为“车辆 1234”，或只显示“车辆”。

**标签。** 在圈列表中，每圈显示其车辆名。同一车辆的几圈会编号为“名称 #1”“名称 #2”。分析中的句子在标签唯一时使用相同的标签；否则使用车辆名加圈时间，即“名称（1:29.616）”（时间仅为示例），仍不唯一时再加编号。

**分组。** 当车辆编号（没有编号时用名称）和性能指数相同时，圈属于同一辆车（用于包络、档案和比较）：同一型号、不同调校的车是另一辆车（`carKey`）。

**级别。** 圈的性能级别取自游戏（Forza 为 D..X，iRacing 为车辆级别的简称）。统计中按 D、C、B、A、S1、S2、R、X 排序，其余按字母顺序排在后面。

## 演示圈 {#demo-laps}

**演示圈**加载一条虚构赛道上的三圈（四段直道和四个右弯）。它们由一个简单的车辆模型生成（[`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)）：每个弯的抓地力限制速度，加上向前的加速过程和向后的刹车过程，与赛车模拟器的做法相同。

| 圈 | 车辆 | 失误 |
|---|---|---|
| 干净的圈 | 抓地型赛车 | 无 |
| 有失误的圈 | 抓地型赛车 | 在 T2 提前 35 m 刹车，出 T3 时晚 30 m 给油，以其速度的 0.88 过 T4，向一侧偏 1.2 m |
| 另一辆车 | 动力型赛车 | 无；向另一侧偏 1.2 m |

| 车辆（编号） | 抓地力 | 刹车 | 牵引力 | 功率/质量 | 阻力 |
|---|---|---|---|---|---|
| 抓地型赛车（9001） | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0.0009 /m |
| 动力型赛车（9002） | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0.0006 /m |

焦点在有失误的那圈上。赛道的布局与 Forza 的世界一致（左手坐标系），因此——与真实的 Forza 圈完全一样——它会呈镜像，标签页提供**反转 X**。三圈都带有每个轮胎的数据，所以标签页的每一部分都有内容可显示。

## 圈列表 {#the-lap-list}

每一行从左到右：

| 元素 | 作用 |
|---|---|
| ● / ○ | 显示或隐藏该圈（线条、车辆、卡片、图表）；隐藏的圈仍会参与分析 |
| 颜色条 | 该圈的颜色 |
| 名称和标签 | 点击以**聚焦**该圈；悬停可看到其来源文件和车辆（名称 · 级别 PI · 驱动方式） |
| ⌖ | 用镜头跟随这辆车（再点一次停止） |
| ★ | 将所有比较以这一圈为基准（设为参考）；在参考圈上不可用 |
| × | 移除该圈 |

**标签：** *参考*；有多个级别时，每级最快的圈显示*某级最快*（或*本级别最快*）；*不完整*表示未跑到终点的一次行驶。

**第二行：**级别（仅当有多个级别时显示）、圈时间（`1:29.616`）、与其比较的圈之间的差距（本级别最快或参考圈）如 `+0.512`（示例），以及当该圈比参考圈的起点晚 10 m 以上时显示*起步晚*。

圈超过 8 条时，会显示“已绘制 N/M”，并提供**全部显示**（绘制每一圈：较慢，而且线条会缠成一团）和**只显示正在查看的**（参考圈、聚焦的圈和本级别最快的圈；无论哪种方式，统计都会计入每一圈）。

列表下方：当圈的数据表明画面是镜像时，会显示镜像提示（见[镜像世界](race-replay-and-scene.md#mirrored-worlds)）；有两圈或更多时，显示提示“点击一圈，查看它在哪里丢了时间……”；有多个级别时，还会提示每圈都与其本级别中最快的圈比较。

### 参考与焦点 {#reference-and-focus}

- **参考：**其他所有圈都对齐到它，并默认与之比较。除非用 ★ 选了另一圈，否则它是最快的**完整**圈（如果没有完整的圈，则是最先加载的圈）。移除参考圈后，回到自动选择。
- **焦点：**显示其发现、车辆控制和地图的那一圈。它停留在用户选定的位置；否则是除参考圈外**最慢**的那一圈（“最值得学习”）。聚焦一圈还会取消它的隐藏状态，并显示其级别中最快的圈。聚焦参考圈时，则会与每个弯中最快的其他圈比较。
- **级别：**圈有多个性能级别时，每圈与其本级别中最快的完整圈比较（参考圈所在级别中的参考圈）。见[赛道统计](race-course-statistics.md)。

### 颜色 {#colours}

每圈都有自己的颜色，按加载顺序分配，因此隐藏其他圈时，一圈的颜色不会改变。色相沿色轮间隔分布，与热力图的队伍模式分组相同；对于每个位置，明度（OKLCH 中 0.52 至 0.66）和彩度（0.12 至 0.18）经过挑选，使其在正常、红色盲和绿色盲视觉下，与相邻位置（最后一个与第一个）尽可能区分开，并且各自对深色图表背景的对比度至少为 3:1。

## 开发者信息 {#for-developers}

代码：[`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts)（`loadLapFiles`）、[`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts)、[`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts)、[`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts)。

### 各格式如何读取 {#how-each-format-is-read}

每种格式最终都变成一个 `LapTrace`：使用规范名称的通道（`time`、`distance`、`x`、`y`、`z`、`speed`、`throttle`、`slipRatio.FL` 等，见[通道表](race-charts-and-hud.md#the-channel-table)）、车辆、圈时间、是否为完整圈，以及一个 `meta` 块。对所有格式，`time` 和 `distance` 都会平移到从 0 开始；若某个来源没有 `speed`，则用相邻采样点的距离除以时间来计算。

#### heat3d-lap JSON {#heat3d-lap-json}

一个带有 `"format": "heat3d-lap"` 的 JSON 对象。读取的字段：

| 字段 | 用途 |
|---|---|
| `channels` | 一个对象，其中每个通道是一个数组，以规范名称为键；按车轮的通道写作 `name.FL`、`name.FR`、`name.RL`、`name.RR`。`time`、`x` 和 `z` 为必需 |
| `car.carOrdinal`、`car.name`、`car.carClass`、`car.carPI`、`car.drivetrain` | 车辆：编号、名称、Forza 级别索引（0 为 D，1 为 C，2 为 B，3 为 A，4 为 S1，5 为 S2，6 为 X）、性能指数、驱动方式代码（0 为 FWD，1 为 RWD，2 为 AWD） |
| `lap.seconds` | 圈时间；缺省时取最后一个 `time` 值 |
| `lap.complete` | `false` 表示不完整的一次行驶；其他值都视为完整 |
| `game`、`track` | 名称；`game` 决定项目类别（见下） |
| `units.slipRatio` / `units.slipAngle` | 滑移的缩放方式：单位中含 `raw` 表示 `scaled`，含 `normalised` 表示 `peak`，其他为 `physical` |
| `meta` | 给出的 `slip`、`surface`、`discipline` 会覆盖上述判断 |

没有 `distance` 通道时，距离由三维位置累加得出。

#### FH Companion 圈文件 {#fh-companion-lap-files}

一个 JSON 对象，其中 `Lap` 对象包含一个 `samples` 数组（约每 5 m 一个采样点）。映射的字段：

| FH Companion | 通道 |
|---|---|
| `Metres`、`Seconds` | `distance`、`time`（平移，使圈从 0 开始） |
| `X`、`Y`、`Z` | `x`、`y`、`z` |
| `Speed`、`Throttle`、`Brake`、`Steer`、`Clutch`、`HandBrake`、`Gear` | 同名，改为小写 |
| `LatG`、`LongG` | `latAcc`、`longAcc`（m/s²，名称虽为 G） |
| `Puddle` | `puddle` |

车辆取自 `Lap.carOrdinal`、`Lap.carName`（仅较新的文件）、`Class`（或 `Lap.carClass`，即 Forza 级别索引）、`Lap.performanceIndex`、`Lap.drivetrain` 和 `Lap.peakKilowatts`；圈时间取自 `Lap.lapSeconds`；`EndedAtFinish: false` 的一次行驶为不完整。游戏为 `forza-horizon`。

这些文件不含轮胎数据，也没有航向，因此单靠它们无法判断抱死、轮胎打滑和侧滑；但可以判断推动（由转向与路径的偏差得出）以及碰撞和撞击。若要获得其余数据，请同时选中每个文件旁边的 `.tele.gz`。

#### FH Companion 遥测（`.json.tele.gz`） {#fh-companion-telemetry-jsontelegz}

经 gzip 压缩的 JSON `{ version, columns, data }`：Forza 整个 Data Out 中的一圈数据，每个数据包一行，使用游戏自己的字段名。按名称查找列，从不按位置查找。格式 2 保留每一个数据包（约每秒 110 个，而游戏为每秒 64 次）；若某行与前一行除了录制工具自己的时钟（`t`、`metres`）之外完全相同，则丢弃，因此一圈读取时为游戏的每秒 64 行。（加载按钮的提示框写明了这一点：“每个轮胎的滑移，64 Hz”。）

| Data Out 字段 | 通道 |
|---|---|
| `t`、`metres` | `time`、`distance` |
| `PositionX/Y/Z` | `x`、`y`、`z` |
| `Yaw`、`Pitch`、`Roll` | `yaw`、`pitch`、`roll` |
| `VelocityX/Y/Z` | `latVel`、`vertVel`、`longVel`（车身坐标系：x 向右，y 向上，z 向前） |
| `AccelerationX/Y/Z` | `latAcc`、`vertAcc`、`longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`、`CurrentEngineRpm`、`Gear`、`Power`、`Torque`、`Boost`、`Fuel` | `speed`、`rpm`、`gear`、`power`、`torque`、`boost`、`fuel` |
| `Accel`、`Brake`、`Clutch`、`HandBrake` | `throttle`、`brake`、`clutch`、`handbrake`，由 0..255 缩放到 0..1 |
| `Steer` | `steer`，由 -127..127 缩放到 -1..1 |
| `NormalizedSuspensionTravel<车轮>` | `suspension.<W>` |
| `TireSlipRatio<车轮>`、`TireSlipAngle<车轮>`、`TireCombinedSlip<车轮>` | `slipRatio.<W>`、`slipAngle.<W>`、`combinedSlip.<W>` |
| `TireTemp<车轮>` | `tireTemp.<W>`，由华氏度换算为摄氏度 |
| `WheelRotationSpeed<车轮>`、`WheelInPuddle<车轮>`、`WheelOnRumbleStrip<车轮>`、`SurfaceRumble<车轮>` | 每个车轮的 `wheelSpeed`、`puddle`、`rumble`、`surfaceRumble` |

`<车轮>` 为 `FrontLeft`、`FrontRight`、`RearLeft`、`RearRight`，对应 `FL`、`FR`、`RL`、`RR`。滑移标记为 `peak`（Forza 的归一化滑移：超过 1 时轮胎已失去抓地力）。

**配对。** 一起选中或拖入的 `<圈>.json` 和 `<圈>.json.tele.gz`（路径相同，只是后缀为 `.tele.gz`）会合并为**一**圈：通道取自遥测文件，车辆、级别、时间、赛道和不完整标志取自圈文件。遥测文件自己的车辆名（若有）优先。单独的 `.tele.gz` 也能加载：格式 2 的文件包含 `car`（`ordinal`、`name`、`class`、`pi`）、`track` 和 `lapSeconds`；没有这些时，圈时间为遥测本身的时长，车辆未知。

#### iRacing `.ibt` {#iracing-ibt}

iRacing 的遥测文件直接读取（在浏览器中，无需转换）：112 字节的文件头、32 字节的磁盘子头、变量表（每个通道 144 字节）以及会话 YAML。

- **必需的通道：**`SessionTime`、`Lap`、`Lat`、`Lon`。缺少时显示：“… 没有 SessionTime、Lap、Lat 和 Lon 通道——这是 iRacing 遥测文件吗？”
- **位置：**纬度和经度在第一个非零定位点处的切平面上换算为米（地球半径 6 371 008.8 m）：x 向东，z 向南，y 为海拔（`Alt`）——因此在默认镜头下，北朝上。这不是赛道自身的坐标系：提取出的赛道模型与它不会对齐。
- **圈：**会话在 `Lap` 变化的地方分开；一圈只有在采样点超过 60 个、起点低于 `LapDistPct` 的 5%、终点高于 95% 时才保留。不完整的圈被丢弃。若一个都不剩："… 没有 N km 赛道的完整一圈"（赛道长度来自 YAML）或"… 没有完整的一圈"。
- **距离：**从圈起点开始的 `LapDist`；没有时，由位置累加得出。
- **车辆：**来自 `DriverInfo`：玩家的 `CarScreenName`、`CarID`（作为车辆编号）和 `CarClassShortName`（作为级别）。赛道：`TrackDisplayName`，否则为 `TrackName`。

映射的通道：

| iRacing | 通道 | 换算 |
|---|---|---|
| `Speed`、`Throttle`、`Brake`、`Gear`、`RPM` | 同名 | - |
| `Clutch` | `clutch` | `1 - v`（iRacing 记录的是离合器的接合程度；我们记录的是踏板） |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax`（弧度，逆时针为负，换算到 -1..1，向右为正；最大值至少 0.1，缺省时为 π） |
| `LatAccel`、`LongAccel`、`VertAccel` | `latAcc`、`longAcc`、`vertAcc` | - |
| `Yaw`、`Pitch`、`Roll`、`YawRate` | 同名，改为小写 | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`、`dcTractionControl` | `absLevel`、`tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | 大于 1.5 时除以 100 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`、`WaterTemp`、`OilTemp` | `fuel`、`waterTemp`、`oilTemp` | - |
| `LFtempCM` 等 | `tireTemp.FL` 等 | 胎体中部温度 |
| `LFshockDefl` 等 | `suspensionM.FL` 等 | 减震器压缩量，m |
| `LFpressure` 等 | `tirePressure.FL` 等 | × 0.145038（kPa 换算为 psi） |
| `LFwearM` 等 | `tireWear.FL` 等 | `1 - v` |

车轮前缀：`LF` 为 FL，`RF` 为 FR，`LR` 为 RL，`RR` 为 RR。**其他每个**每个采样只有一个值的通道（非位字段类型）都会以原名保留；若以车轮前缀开头，则按车轮保留（`RRspeed` 变为 `speed.RR`），因此图表和卡片的数值列表可以显示全部数据。iRacing 不记录轮胎滑移，因此车辆控制以漂移角判断——`Yaw` 与行驶方向的夹角，与车辆实际去向相比较——以及转向与路径的对比。只有在无法拟合航向时才使用偏航角速度与横向加速度，因此没有漂移角（见[车辆控制事件](race-control-events.md)）。

错误信息："… 太短，不是 .ibt 文件"、"… 没有 iRacing 遥测文件头"、"… 没有定位点"。

#### 圈 CSV {#lap-csv}

每个采样一行；多圈在同一文件中时，用 `lap` 列区分。分隔符根据前五行判断。可选的第一行 `# { ...json... }` 描述此次行驶：`game`、`track`、`seconds`、`complete`、`meta`、`car`。

| 列（不区分大小写） | 通道 |
|---|---|
| `x`、`y`、`z` | 位置（`x` 和 `z` 必需） |
| `elapsed` 或 `time` | `time`（每圈必需） |
| `metres` 或 `distance` | `distance`（否则由位置累加） |
| `speed_ms` 或 `speed` | `speed`（m/s） |
| `throttle`、`brake`、`steer`、`gear`、`clutch`、`handbrake`、`puddle` | 同名 |
| `lat_g`、`long_g` | `latAcc`、`longAcc` |
| 任何规范通道名，例如 `latVel`、`slipIndex.FL` | 本身 |
| `lap` | 每行属于哪一圈 |
| `lap_seconds`、`car`、`car_class`、`pi`、`course` | 圈时间、车辆编号、级别、PI、赛道（取自每圈的第一行） |

没有说明时，游戏视为 `forza-horizon`，每圈视为完整。若一个文件包含多圈，每圈的来源显示为 `<文件> · <圈>`。错误信息："… 没有数据行"、"… 没有 x 和 z 列"、"… 没有带时间列的圈"。

#### 项目类别与路面 {#discipline-and-surface}

当圈没有说明时，分析对该圈的假设（`lap.ts`）：

- **项目类别：**`meta.discipline`；否则，游戏名匹配 `rally|wrc|dirt|rbr` 为**拉力赛**，`trackmania` 为**竞速（arcade）**，其他为**赛道赛车**。
- **路面：**`meta.surface`；否则根据赛道名和来源：名为 `monte` 的拉力赛为**混合**；`snow|ice|winter|arctic|sweden` 为**雪地**；柏油拉力赛（Spain/España/Catalunya/Costa Daurada、Croatia/Hrvatska、Central Europe、Germany/Deutschland、Japan、Corsica/Corse、Ypres，或词语 tarmac/asphalt）为**柏油**；名称含 `scramble|trail|cross country|dirt|gravel` 的为**松散路面**；其他拉力赛段则根据车辆的驾驶方式判断：在以超过 12 m/s 行驶且在地面上（至少 200 个采样）的采样中，若横向加速度的第 95 百分位数不低于 10 m/s²，同时在车辆以该值的 70% 或以上转弯的地方（至少 30 个采样）中位漂移角低于 6°，则为柏油；其他情况或数据不足以判断的，为松散路面。名称中含 `rally` 但不是拉力赛的，为松散路面；其余为柏油。
- 每个采样中，`loose` 通道（Forza 的路面震动、Trackmania 的材质，见[车辆控制事件](race-control-events.md#the-ground)）会覆盖该圈的路面。
