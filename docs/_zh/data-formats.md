---
title: "数据格式参考"
nav_order: 19
lang: "zh"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# 数据格式参考

本页列出 3DHeat 能打开的每一种文件，以及其中的表格必须是什么样子。表格就是行和列，像电子表格一样：每一行说明某物在哪里，如果你有，还说明何时以及是谁。

这里说明热力图标签页读取的内容，逐列列出，以及 Parquet 文件可以携带的提示。（赛车分析标签页读取圈文件，对局分析标签页读取对局摘要；见[赛车分析](race-analysis.md)和[对局分析](match-analysis.md)。）

## 文件 {#files}

这是可加载文件的完整列表。**来源**面板（**文件…**、**文件夹…**，或拖放）只接受以下这些：

| 扩展名 | 是什么 | 读取器 |
|---|---|---|
| `.parquet`、`.pq` | Parquet 表 | Parquet 读取器（见下） |
| `.csv`、`.tsv`、`.txt` | 分隔文本 | 文本读取器（见下） |
| `.3dheat` | 一个文件中的一场对局（一个包含表格及其附加内容的 ZIP） | 作为它所包含的表格加载——[一个文件一场对局](container.md) |
| `.acmi`（也包括 `.txt.acmi`、`.zip.acmi`） | Tacview 飞行录像 | 其自己的读取器——[Tacview 录像](tacview-acmi.md) |
| `.json`、`.json.gz` | OCAP 录像（类似 Arma） | 其自己的读取器 |
| `.gpx`、`.kml`、`.kmz`、`.nmea`、`.nma`、`.igc`、`.fit` | GPS 轨迹：GPX、KML/KMZ、NMEA 日志、IGC 滑翔日志、FIT 运动文件 | 其自己的读取器；位置取自纬度和经度 |

以下不作为位置加载：与表格放在一起、用于描述该表格的小型 JSON 文件（名称以 `.match.json`、`.course.json`、`.level.json`、`.meta.json`、`.summary.json`、`.session.json`、`.hints.json` 结尾的文件），以及转换工具的附加表格（`<比赛>.events.parquet` 等，见[转换工具](converters.md)），除非你单独选中它们。其他内容会被跳过并说明原因。选择如何被过滤，在[加载文件](loading-files.md#which-files-are-kept)中说明。

空文件会被跳过。在包含 `movement*.<扩展名>` 文件的选择中，只加载这些文件（[加载文件](loading-files.md#which-files-are-kept)）。

数据是**每个采样一行**：某个时刻的位置，可选地附带是谁、属于哪个小组、哪个会话、看向何处，以及任何更多的列。事件行（击杀、安放、射击）可以与位置行放在同一张表中，通过一个事件列来区分。

## 分隔文本（CSV、TSV、TXT） {#delimited-text-csv-tsv-txt}

一个最小的有用文件，三行：

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

列会自动对应（[列映射](column-mapping.md)）。

由逐字节的扫描器解析，只解码已映射的列（[`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)）。

| 方面 | 规则 |
|---|---|
| 表头 | 第一个非空行保存列名。空的名称变为 `column_N`。 |
| 分隔符 | 从前 1 MiB 中的前 20 个非空行检测，在逗号、分号、制表符和竖线之间，依据**一致性**：在每个抽样行上字段数相同的分隔符胜出，然后是字段数更多的那个。空格从不被自动检测，但可以手动选择；任何单个字符都可以输入（[列映射](column-mapping.md#the-fields)）。 |
| 引号 | RFC 4180：字段可以用双引号包住，引号内的 `""` 表示一个字面引号。 |
| 空白 | 每个字段开头和结尾的空格、制表符和引号会被去掉。 |
| 每行字段数 | 最多 4,096；超过则报错（*分隔符对吗？*）。 |
| 数字 | 可选的符号、数字、可选的 `.` 和小数、可选的指数（`1.5e-3`）。小数逗号（`1,5`）、千位分隔符或尾随单位（`12 m`）无法解析，计为缺失。若你的文件使用小数逗号，请在加载前把它们替换为小数点（在文本编辑器中查找替换即可）。 |
| 数值列 | 当前 50 行中非空值超过 90% 能解析为数字时，该列会被当作数值列提供。 |
| 行数 | 加载前根据前 1 MiB 的平均行长估算。 |
| 文本编码 | UTF-8。 |

## Parquet {#parquet}

使用 [hyparquet](https://github.com/hyparam/hyparquet) 读取，逐个列块地读入类型化数组，只请求已映射的列（[`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts)、[`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)）。

| 方面 | 规则 |
|---|---|
| 行数 | 精确，取自文件尾，加载前即可得知。 |
| 预览 | 前 50 行，解码为对象；它们的值决定哪些列被视为数值。 |
| 整数 | `INT32`，以及 `INT64`（解码为 BigInt）都变为数字。 |
| 浮点数 | `FLOAT`、`DOUBLE`。 |
| 布尔值 | 1 和 0。 |
| 字符串 | 用于人物、小组、会话和类别列；看起来像数字的字符串在数值角色中可以接受。 |
| `TIMESTAMP`、`DATE` 逻辑类型 | 解码为时间点（自 1970 年起的毫秒数）；用作时间轴时，忽略单位设置。 |
| 嵌套列 | 结构体和列表列不用于任何角色（预览时显示为 JSON 文本）；未经测试。 |
| 文件尾元数据 | 键 `heat3d` 作为映射提示读取（见下）。 |

位置、时间或视角列中若含有非数字的内容，会解码为缺失。

## 列角色与类型 {#column-roles-and-types}

| 角色 | 文件中的类型 | 是否必需 | 存储为 | 限制 |
|---|---|---|---|---|
| X、Y、Z | 数字 | 三者中的两个 | 32 位浮点数，经过[坐标轴映射](axes-units-and-time.md)之后 | 没有可用位置的行会被丢弃。 |
| 时间 | [时间单位](axes-units-and-time.md#time-units)中的数字、Parquet 时间戳，或 ISO-8601 文本 | 否 | 从最早一行开始的 32 位浮点秒数 | 行数超过 400,000,000 时拒绝排序（[原因](memory-and-budgets.md#the-sort-ceiling)）。 |
| 人物 | 任意；字典编码 | 否 | 32 位 id | |
| 会话 | 任意；字典编码 | 否 | 32 位 id | 最多列出 100,000 个会话的标签。 |
| 小组 | 任意；字典编码 | 否 | 16 位 id | 最多 4,096 个小组，否则分组被丢弃。 |
| 偏航、俯仰 | 数字，度或弧度 | 否 | 32 位浮点弧度 | |
| 方向 X、Y、Z | 数字 | 否（三者须同时存在） | 转换为偏航和俯仰 | |
| 筛选列，*范围* | 数字 | 否 | 32 位浮点数 | 同时最多启用 4 个筛选。 |
| 筛选列，*类别* | 任意；字典编码 | 否 | 32 位 id | 最多 4,096 个值，否则不保留该列。 |

作为筛选列保留的 Parquet `TIMESTAMP` 列，是一个以自 1970 年起的毫秒数表示的*范围*——一个滑块，而不是列表。

## `heat3d` 提示 {#the-heat3d-hints}

Parquet 文件可以在其文件尾的键/值元数据中携带自己的读取说明，键为 **`heat3d`**，其值为一个 JSON 对象（[`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)）。当该文件是一次选择中的第一个文件时，查看器会将这些提示应用到它自己的猜测之上；每一项都是可选的，每个结果仍会显示，并可在[列映射](column-mapping.md#the-heat3d-hints-in-a-parquet-footer)面板中编辑。无法解析为 JSON 对象的内容会被忽略。

### 架构 {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          位置的列名
    "time": string,                                  时间列
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           要保留的筛选列，最有用的排在前面
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  必须 > 0
  },
  "entity": {
    "size": number                                   一个被追踪事物在文件单位中的大小，> 0
  }
}
```

| 条目 | 何时应用 | 效果 |
|---|---|---|
| `columns.x` … `columns.dirZ`、`time`、`personId`、`teamId`、`sessionId` | 文件中存在所命名的列 | 设置该角色。 |
| `columns.timeUnit` | 是七种单位之一 | 设置时间单位。 |
| `columns.angleUnit` | `"degrees"` 或 `"radians"` | 设置角度单位。 |
| `columns.lookMode` | `"vector"`，且 dirX、dirY、dirZ 全部设置；`"yawPitch"`，且设置了 yaw；`"none"` | 设置视角模式。 |
| `columns.extra` | 是一个数组 | 替换自动生成的筛选列表，只保留存在的、且未被任何角色使用的列；每一列若在预览中看起来是数字，则为*范围*，否则为*类别*。没有它时，保留自动列表，但去掉被提示分配给某个角色的列。 |
| `axes.up` | `"y"` 或 `"z"` | 向上的轴。 |
| `axes.flipX/Y/Z` | 布尔值 | 翻转。 |
| `axes.scale` | 大于 0 的数字 | 单位缩放。 |
| `entity.size` | 大于 0 的数字 | [实体大小](sessions-persons-groups.md#entity-size)（加载时乘以单位缩放）。这是设置它的唯一方法。 |

### 示例 {#example}

一个虚构的射击游戏导出：Z 轴向上，单位为厘米，左手坐标系的世界，玩家约 72 cm 宽。

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### 写入提示 {#writing-it}

使用 pyarrow 时，自定义的架构元数据会写入文件的键/值元数据中：

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` 会打印一个文件的架构，这是检查提示所指列名的快速方法。

## 热力图标签页写入什么 {#what-the-heatmap-tab-writes}

数据本身从不被写回。输出包括：

- 视频，为 WebM（VP9 或 VP8）——[摄像机路径与视频](camera-path-and-video.md)；
- 摄像机位姿，以文本形式复制到剪贴板——[摄像机](camera.md#pose)；
- 保存在浏览器[关卡库](level-library.md)中的关卡。
