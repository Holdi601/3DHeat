---
title: "列映射"
parent: "导入数据"
nav_order: 2
lang: "zh"
source: "column-mapping.md"
source_hash: "8ea2f450df99"
translated: true
outdated: false
---

# 列映射

文件就是一张表，3DHeat 必须知道哪一列保存东西向位置、哪一列保存时间、哪一列保存玩家名字，等等。这个面板就是它说明自己猜了什么、你在哪里修正错误猜测的地方。

![载入 Parquet 文件后的列映射面板：每个框都已填好——1 X，2 Y，3 Z，4 时间，5 人员 ID，6 会话 / 对局，7 队伍 / 分组](../assets/img/en/column-mapping-panel.webp)

*文件自己给出了列名，因此每个框都已填好。*

例如，一个表头为 `x,y,z,t,player,team` 的 CSV 会自动映射：x、y、z 成为位置，`t` 成为时间，`player` 成为[人员](glossary.md)，`team` 成为[分组](glossary.md)。

选择文件后，**列映射** 面板会在数据源面板下方打开。它说明哪一列扮演哪个角色。它会自动填写，每个字段在按 **加载** 之前都可以更改；映射在加载时读取，因此之后更改它需要重新加载。

## 各字段 {#the-fields}

所有列菜单都列出第一个文件的每一列，外加 *- 无 -*。

| 字段 | 角色 | 说明 |
|---|---|---|
| **分隔符** | 仅 CSV：字段分隔符。 | 菜单：*逗号 ,*、*分号 ;*、*制表符*、*竖线 \|*、*空格*；或在 *或输入一个字符* 中输入任何单个字符。自动检测（见下文）。更改它会重新运行自动映射，因此之前所做的编辑会丢失。 |
| **X**、**Y**、**Z** | 位置。 | 至少需要两个；未映射的第三个轴为 0（数据位于一个平面上）。两个轴使用同一列是错误。 |
| **源数据中的向上轴** | 源数据中哪个轴朝上。 | *Z 朝上（大多数游戏引擎）* 或 *Y 朝上（图形学惯例）*。参见[坐标轴、单位与时间](axes-units-and-time.md)。 |
| **单位缩放** | 乘以每一个位置。 | 按钮 *1 (m)* 和 *0.01 (cm→m)*，或输入一个值。 |
| **翻转 X / 翻转 Y / 翻转 Z** | 对源数据的某个轴取反。 | 应用于位置和视线方向向量。 |
| **时间** | 时间轴。 | 可选。没有它就没有时间线。 |
| **时间单位** | 如何读取时间列。 | 七种单位；参见[坐标轴、单位与时间](axes-units-and-time.md#time)。对 Parquet 的 `TIMESTAMP`/`DATE` 列忽略此项，面板会说明这一点。 |
| **人员 ID** | 每一行属于谁或什么。 | 可选。使轨迹、生命周期、盒式回放和线条热度成为可能。 |
| **会话 / 对局** | 每一行属于哪一场对局、突袭、回合、运行或圈。 | 可选。位置从不会跨会话变化进行插值、拖尾或连接成路线。参见[会话、人员与分组](sessions-persons-groups.md)。 |
| **队伍 / 分组** | 任何低基数的列。 | 可选。驱动分组颜色、队伍热度以及按分组的差值拆分。 |
| **视线方向** | *无*、*偏航 / 俯仰列* 或 *方向向量列*。 | 使用偏航/俯仰时：**偏航**、**俯仰** 和 **角度单位**（*度* / *弧度*）。使用向量时：**方向 X**、**方向 Y**、**方向 Z**。用于[盒式回放](box-replay.md)的视线射线。 |
| **保留用于筛选** | 保存在内存中的额外列。 | 每列一个复选框；对每个勾选的列，选择 *范围*（数值）或 *类别*。每列每行占 4 字节，并在加载时需要一次解码。只有保留的列才能被[筛选](filters.md)、用于[差值拆分](difference.md)或作为[线条热度](line-heat.md)的事件列。 |
| **显示示例行** | 前 12 个采样行的表格，包含所有列。 | 用于检查猜测是否正确。 |

若勾选的筛选列未明确设置，则按 *范围* 读取；看起来为数值的编号列通常用 *类别* 更有用。同一时间只能启用 4 个筛选（[筛选](filters.md)）。

## 自动映射如何猜测 {#how-the-auto-mapping-guesses}

猜测的逻辑在 [`src/data/automap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts) 中。它会查看列名、采样行中哪些列是数值（超过 90% 的非空值可解析为数字）、每列在采样中有多少个不同的值，以及 Parquet 的逻辑类型。名称模式按顺序尝试，不区分大小写，第一个匹配任何仍空闲列的模式获胜。

### 位置 {#position}

| 轴 | 名称模式，按顺序（仅数值列） |
|---|---|
| X | `x`、`…_x` / `… x`、`pos…x`、`x…pos`、`loc…x`、`lon…`、`longitude` |
| Y | `y`、`…_y`、`pos…y`、`y…pos`、`loc…y`、`lat…`、`latitude` |
| Z | `z`、`…_z`、`pos…z`、`z…pos`、`loc…z`、`…alt…`、`…height…`、`…elev…` |

如果某个轴仍为空，则依次由第一个空闲的数值列（忽略 `filename`、`level`、`year`、`month`、`day`、`hour`、`location`）填入。错误的猜测在屏幕上一目了然；空的则会让视口空白。

### 时间 {#time}

- **优先 Parquet 时间戳列。** 在逻辑类型为 `TIMESTAMP` 或 `DATE` 的列中，按评分选出最佳者：如果名称匹配某个时间模式则加 10,000，普通 `DATE` 减 5,000，再加上采样中不同值的数量。整日日期和恒定的会话开始时间几乎没有不同的值，因此事件瞬间胜出。单位则为 *Unix 时间戳（毫秒）*。
- **否则按名称：** `time`、`timestamp`、`ts`、`…event…time…`、`…time…stamp…`、`t`、`…date…time…`、`when`、`tick`、`…frame…`，然后是经过时间的名称（`gdur`、`g_duration`、`…duration…`、`…elapsed…`、`…match time…`、`…round time…`、`…game time…`、`…minute from start…`、`…since start…`、`age`）。单位则根据数值猜测：当某个值形如 `YYYY-MM-DDT…` 或 `YYYY-MM-DD …` 时为 ISO-8601；否则按最大量级判断：超过 10^17 纳秒、超过 10^14 微秒、超过 10^11 Unix 毫秒、超过 10^8 Unix 秒、超过 10^6 毫秒，否则为秒。

选择了经过时间列时，面板会注明每个会话随后都会与其自身的开始对齐——适合叠加对局，但无法看到它们的真实先后顺序。

### 会话、人员、分组 {#session-person-group}

会话是在时间轴 **之后**、人员和分组 **之前** 认领的，因为会话列通常是时间戳（每场对局的每一行上都是该对局的开始时刻）。

| 角色 | 名称模式，按顺序 |
|---|---|
| 会话 | `session` / `session_id`、`match…`、`round…`、`raid…`、`game…`、`run…`、`replay…`、`instance…`、`lap…`、`stint…`（每个都须完全匹配，可选地带 `_id`） |
| 人员 | `name`、`…player…id/name…`、`…user…`、`…account…`、`persona…`、`…character…`、`victim`、`actor`、`…puuid…`、`…steam id…`、`subject…`，然后是 `driver` / `driver_id` / `driver_name`、`car` / `car_id` / `car_name`（赛车数据：移动的是车） |
| 分组 | `spawn_team`、`real_team`、`team` / `team_id` / `team_name`、`squad…`、`side`、`…faction…`、`clan…`、`party…`、`alliance…`、`car_class` |
| 分组，后备 | `…victim_ai…`、`…killer_ai…`、`…is_ai/bot/npc…`、`target_type`、`survived`、`outcome`、`result` |

在大多数采样行上取不同值的分组候选（超过 max(48, 样本的 60%)）是编号而非分组：如果尚未找到人员列，它会成为人员列，且不会被用作分组。如果根本找不到分组列，则使用介于 2 至 12 个不同值之间、且非数值的、不同值最少的列。

### 视线方向 {#look-direction}

名为 `yaw`、`…rot…yaw…`、`…heading…`、`azimuth…`、`…view…yaw…` 的数值列，或 `rot_z` / `rotation_z`，会把视线方向切换为偏航/俯仰；俯仰则查找 `pitch`、`…rot…pitch…`、`…elevation…angle…`、`…view…pitch…`。当任何采样的偏航绝对值超过 7 时假定为度，否则为弧度。方向向量从不被猜测；它来自下方的提示或由你提供。

### 筛选列 {#filter-columns}

最多自动保留 **6** 列，按以下顺序排列：

1. `region`、`sessionMode`、`actor`——为筛选而存在的列（得分 1200）；
2. 在采样中有变化的类别列，不同值越少越靠前（1000 减去计数）；
3. 在采样中恒定的列，但仅当载入了多个文件时——它可能在文件之间不同，例如区域或测试运行编号（600）；
4. 数值列（500）。

已扮演某个角色的列、上述噪声名称、单文件加载中恒定的列，以及自由文本列（不同值超过 max(16, 样本的一半)）都不会被自动提供。任何列仍可手动勾选。

### 向上轴 {#up-axis}

三个轴都已映射时，在样本中 Y 和 Z 的散布较小的那个轴被当作向上的轴（地图比其高度宽得多）；否则假定 Z 朝上。

## Parquet 页脚中的 `heat3d` 提示 {#the-heat3d-hints-in-a-parquet-footer}

Parquet 文件可以说明应该如何读取它。如果文件页脚的键/值元数据中有键为 **`heat3d`** 的条目，其值会被解析为 JSON，并覆盖在猜测之上（[`applyHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)）。CS2 演示转换器会写入这样的条目，因此它的表格会以玩家为人员、以阵营为分组、每个回合为一个会话、开启视线方向，并且世界方向正确。

只有选择中的 **第一个** 文件会被读取提示。每个条目都是可选的，每个被提示的值仍会出现在面板中，并且可以更改。架构的完整说明，附有示例及其编写方法，见[数据格式参考](data-formats.md#the-heat3d-hints)。

简要规则：

- 提示所指定的列，只有当文件确实拥有该列时才会应用。
- `lookMode: "vector"` 仅当 `dirX`、`dirY` 和 `dirZ` 全部设置时生效；`"yawPitch"` 仅当设置了 `yaw` 时生效。
- `extra` 存在时，会替换自动筛选列表（未知名称和已扮演角色的列会被丢弃）；每一项的范围/类别类型取决于它是否看起来为数值。不存在时，保留自动列表，减去提示已赋予角色的任何列。
- `axes.up` 必须为 `"y"` 或 `"z"`，翻转必须为布尔值，`scale` 必须为正数。
- `entity.size` 若为正数，则为文件单位下一个被追踪对象的大小（[实体大小](sessions-persons-groups.md#entity-size)）；它是设置该值的唯一方式。

## 已知问题：覆盖 CSV 分隔符 {#known-issue-overriding-the-csv-separator}

当你把分隔符改为与检测到的不同的分隔符时，列表和示例行不会改变（预览仍使用检测到的分隔符进行拆分）。加载本身仍使用所选的分隔符。如果检测到的分隔符有误：

1. 在文本编辑器中打开该文件。
2. 将分隔符全部替换为逗号（并把小数点的逗号替换为点）。
3. 保存，然后重新加载该文件。

原因在 [`previewSource`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sourcePreview.ts) 中。
