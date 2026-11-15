---
title: "Tacview 录像（ACMI）"
parent: "导入数据"
nav_order: 7
lang: "zh"
source: "tacview-acmi.md"
source_hash: "48a81edbd9b3"
translated: true
outdated: false
---

# Tacview 录像（ACMI）

Tacview 是一款记录飞行模拟器中飞行过程的程序；它的文件以 `.acmi` 结尾。3DHeat 可以打开这些文件，让你看到每架飞机飞过的地方。

Tacview 的飞行录像加载方式与任何表格相同：选择或拖入一个 `.acmi`（文本，`.txt.acmi`，或压缩的 `.zip.acmi`），然后按 **加载**。之后你会得到所有飞行的热度，并在 **对局** 标签页中看到带有图形、轨迹和事件列表的回放（[对局回放](match-replay.md)）。ACMI 是 Tacview 的公开文件格式（[文档](https://www.tacview.net/documentation/acmi/)）；DCS（通过 Tacview 的导出器）、IL-2 Great Battles、Falcon BMS、X-Plane、MSFS 等都会写入这种格式，所以这里可以读取它们中的任何一种。

## 录像会变成什么 {#what-a-recording-becomes}

每当一个对象的位置被写入时产生一行，对象所在位置的每个事件产生一行，对象离开时（`Removed`，即其最后所在位置）产生一行。与尚未见过的对象有关的事件——例如书签，或发给所有人的消息——会成为对象 `(recording)` 在参考点处的一行。录像自带其读取说明，因此映射步骤会自动填写。读取器会写入以下列：`Time`、`X`、`Y`、`Altitude`、`Object`、`Coalition`、`Heading`、`Pitch`、`Roll`、`Type`、`Name`、`Pilot`、`Group`、`Country`、`Color`、`Event`、`Latitude`、`Longitude`、`Recording`、`EventObjects`、`RecordingInfo`，以及录像所具有的任何其他属性。它们的作用如下：

| 列 | 作用 | 含义 |
|---|---|---|
| Time | 时间 | 相对录像的 ReferenceTime 的秒数；如果有 ReferenceTime，则为 Unix 秒数，因此时钟显示真实时间。 |
| X, Y | 位置 | 东和北，单位为米，位于与录像参考点相切的平面上：在其附近距离和方位是真实的，在 100 公里处的漂移小于千分之一。北方变为世界的 -Z。 |
| Altitude | 位置（上） | 米。 |
| Object | 人员 | 飞行员和对象的名称及其 id，例如 `Viper 1 (F-16C_50) #a01`；无人对象为 `(T-90A) #401`。 |
| Coalition | 队伍 | 阵营（若没有阵营，则为颜色）。 |
| Heading, Pitch | 朝向 | 度；航向 0 为北。 |
| Recording | 会话 | 录像的 Title，或文件名：多个录像并排加载时，它们的轨迹不会相连。 |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | 过滤器 | 保留用于过滤；Type 和 Name 决定每个对象的[图形](figures.md)，Event 提供复盘的事件列表，Roll 使飞机倾斜。 |
| U, V | | 游戏自身的平面世界米数，前提是每个样本都有（DCS 会写入）。 |
| EventObjects | 过滤器 | 事件提到的每个对象（`Message|a01|b02|...`），按 id 列出。 |
| RecordingInfo | | 录像在该时刻的自身属性——DataSource、DataRecorder、Author、Category、Briefing、Comments……——以 JSON 形式保存。 |
| IAS, Mach, AOA, FuelWeight, ... | 过滤器 | 录像携带的任何其他数值属性。 |
| Parent, CallSign, LockedTarget, Label, Shape, ... | 过滤器 | 录像携带的任何其他文本属性；取值不是数字的属性即为文本。 |

Tacview 位置的四种形式（`lon|lat|alt`、带 `u|v`、带 `roll|pitch|yaw`，以及带有所有这些加上航向的形式）都会被读取；空字段保留上一个值；`-id` 会删除一个对象，删除后再次使用的 id 即为新对象。转义逗号和续行都会被正确处理。

位置始终由纬度和经度投影得出，从不取自 U/V，因此所有游戏的录像都与真实世界的底图共用同一种投影。
