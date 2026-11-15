---
title: "转换器保留全部数据"
parent: "导入数据"
nav_order: 8
lang: "zh"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# 转换器保留全部数据

打开回放不需要本页。本页适用于编写把游戏文件转换为 3DHeat 表格的工具的人，以及想知道为什么这些表格保存了如此多内容的人。

每个把游戏的回放、录像、日志或实时遥测转换为查看器可打开内容的工具，都遵循同一条规则：

> **转换来源中所有当前能够读取的内容，并把其余部分完整保留，以便之后无需原始文件也能读取。**

游戏更新、重装或磁盘写满之后，回放往往就没有了；而实时数据流在发送的那一刻就消失了。转换器丢弃的内容将永远丢失；完整保留的内容，则可以在有人理解它的那一天被解码。因此，转换器从不决定什么有用：它解码能解码的部分，把其他每一条消息、数据包、事件、属性或行都原样保留在表格旁边，并在自己的输出中说明它读取了多少、仅保留了多少。

本页是所有转换器共同遵守的约定：War Thunder、World of Tanks、World of Warships 和 Squad 的回放转换器，CS2 的录像转换器，后台监视器（其 Dota 回放解码器以及每个实时适配器），游戏采集工具的遥测读取器，以及查看器自身的导入功能（Tacview ACMI、OCAP、GPX/KML/IGC/FIT/NMEA）。查看器自身的读取器在[Tacview 录像](tacview-acmi.md)和[加载文件](loading-files.md)中有说明；单文件形式见[每场对局一个文件](container.md)。一场对局变成一张表、一个 `match.json` 和若干附属文件，可选地打包进一个 `.3dheat` 文件。每个工具的 README 都有一个**完整性**部分，列出该来源中读取了什么、原样保留了什么，以及什么不可用，并说明原因。

## 每个条目的三个去处 {#three-homes-for-every-item}

来源中包含的每一项，最终都只会落在以下三个地方之一：

| 去处 | 存放内容 |
|---|---|
| **已解码** | 表格（每个采样或事件一行，查看器读取的列，以及属于该行的其他每个数值的额外列）和对局文档 `<match>.match.json`（属于整场对局的一切内容：设置、阵容、结果、记分板、自检）。 |
| **原样保留** | 表格旁的附属文件：每个未解码或仅部分解码的条目，完整且未改动，并附其类型、时间，以及它所属的单位或实体。 |
| **不可用** | 在 README 的完整性部分中列出并说明原因：格式本身不包含它（客户端回放中没有其他玩家的输入）、来源从不发送它，或不允许读取它（受保护的进程，或密钥不属于我们使用的加密块）。 |

**部分**解码的条目既会被解码，也会被原样保留：表格得到已理解的部分，附属文件得到完整条目，因此日后更好的解码器无需原始文件即可工作。

除此之外没有第四个去处。因为某项看起来没用、因为它是"很可能"的重复、或因为它很大而丢弃它，都是一个错误。只允许在表格中做精简（例如以 2 Hz 而非 60 Hz 记录相机），绝不允许在附属文件中精简。

## 附属文件 {#sidecars}

附属文件是与表格并列的 Parquet 文件，以表格命名：

```
<folder>/<match>.parquet              表格
<folder>/<match>.match.json           对局文档
<folder>/<match>.<what>.parquet       附属文件
```

`<what>` 是下表中的一个单词。新的转换器应选择合适的单词，或在此处新增一个，**同时**加入 [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts) 中的 `SIDECAR_PARQUET`，这样在加载整个文件夹时查看器就会跳过它。

| `<what>` | 保存内容 | 使用者 |
|---|---|---|
| `messages` | 网络流的数据包、实体方法调用和属性更新，完整保存 | War Thunder、World of Tanks、World of Warships |
| `flight` | 每架飞机的飞行模型条目，完整保存 | War Thunder |
| `packets` | 完整的帧和网络消息，或容器块，位于实体流之外 | CS2、Dota 2、Squad |
| `events` | 游戏事件及其所有键，按解析器给出的原样保存 | CS2 |
| `entities` | 实体和属性更新、远程调用、已打开和已关闭的通道，以及解码器所需的导出内容 | Squad、Dota 2 |
| `props` | 解析器读取的每个实体属性，每次变化时记录 | CS2 |
| `units` | 位置表之外的单位状态 | Dota 2 |
| `combatlog` | 战斗日志，每条及其每个字段 | Dota 2 |
| `strings` | 每个字符串表的每一条 | CS2、Dota 2 |
| `objectives` | 占领区和目标，每次变化及其时间 | War Thunder |
| `raw` | 实时数据流：收到的每个数据包、行、API 文档或内存读取，完整保存 | 监视器的会话（`heat.raw.parquet`）、游戏采集工具的赛圈录制器（`<stamp>_<game>.raw.parquet`），以及监视器的 osu!、LoL 和 Valorant 回放文件 |

查看器加载文件夹时，会跳过本表中所有的 `*.<what>.parquet`，以及所有的 `*.match.json`、`*.meta.json`、`*.summary.json` 和其他 JSON 附属文件；若单独选择或拖放其中某个文件来打开，则会像其他表格一样加载它（见[加载文件](loading-files.md)）。

以上是转换器使用 `--loose` 写出的文件。默认情况下，War Thunder、CS2 和 Tacview 转换器会把一场对局的表格、文档和附属文件打包进一个文件 `<match>.3dheat`，名称与上述相同（见[每场对局一个文件](container.md)）；此处所述的一切对每个成员都成立。

### 列 {#columns}

每个附属文件的行对应一个条目。列按以下顺序排列，仅包含适用的部分：

| 列 | 类型 | 内容 |
|---|---|---|
| `time` | float64 | 与表格 `time` 相同时钟下的秒数（若来源计数的是 tick，则为 `tick`；两者都有时则两者都列出） |
| `type` | string（字典） | 该条目是什么，使用来源自己的术语：数据包类型、消息 ID、事件名、属性路径、行前缀 |
| `name` | string（字典） | 已知时的名称（社区名称、类名），否则为空 |
| `entity` / `unit` / `uid` / `player` | 整数或字符串 | 它属于谁，使用与表格相同的 ID，使附属文件的一行可以与一条轨迹连接 |
| `decoded` | string（JSON） | 对它已理解的部分（如有）；否则为空 |
| `payload` | binary | 条目的字节，完整且未改动（二进制来源） |
| `text` | string | 条目的文本，完整且未改动（文本来源：一行日志、一个 JSON 对象、一个键值块） |

允许有更多的列（比特偏移、大小、通道）。重复的字符串采用字典编码，文件以 zstd 写入，因此附属文件只占回放本身大小的一小部分。

附属文件必须能够单独满足需要：日后编写的解码器读取的是附属文件，而绝不是原始回放。若某条目在没有上下文的情况下无法理解（实体的类、字符串表、某条消息所引用的键），则该上下文同样放入附属文件，或放入对局文档中。

### 实时来源 {#live-sources}

实时适配器（UDP 遥测、共享内存、游戏日志、本地 API）根本没有可以回溯的文件。它们会记录来源发送的**每一个字段**，即使目前没有任何东西使用它们：

- 数据包流：每个数据包完整保存，`payload` 为其字节，`type` 为其数据包 ID 或格式，并以到达的速率记录；
- 共享内存或轮询的 API：每次读取的每个字段，要么作为具名列，要么将整个数据块作为 `payload`，以适配器读取的速率记录；
- 日志：每一行，`text` 为该行，`type` 为该行的种类，包括适配器未做处理的行。

这些内容会写入与该会话表格并列的 `<session>.raw.parquet`。文件大小是遵守此规则的代价；它通过 zstd 和字典编码来控制，而不是通过省略内容来控制。

## 自检 {#the-self-check}

每个转换器都会在其对局文档中（或会话的 `meta.json` 中，或在没有对局文档的情况下写入摘要），在 `selfCheck` 下写入一个 `completeness` 块：

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| 字段 | 含义 |
|---|---|
| `seen` | 来源中包含的该类型条目的数量 |
| `decoded` | 完整读入表格或对局文档 |
| `partial` | 部分读入表格或文档，并在附属文件中完整保留 |
| `raw` | 仅在附属文件中完整保留，未解码 |
| `lost` | `seen - decoded - partial - raw`：必须为 0 |

顶层的 `lost` 是各项之和。转换器的测试会断言其在合成样本上为 0，README 则说明其在真实样本上的值。非零的 `lost` 表示转换器承认违反了该规则；它会指出具体类型，以便找到这个缺口。

"类型"取自来源自身：数据包类型、消息 ID、事件名、属性组、行的种类。它们是在转换器遇到时统计的，而不是依据其预期的列表进行统计，因此无人预料到的类型也会以其计数显示，而不会消失。

## README 的完整性部分 {#the-readmes-completeness-section}

每个转换器的 README 都有一个标题为**完整性**的部分，包含三个列表：

- **已读取**：进入表格和对局文档的内容，以及每个新字段是如何与独立来源进行核对的（游戏自身的数字、第二个来源、为此目的而制作的录像）。
- **原样保留**：哪些内容在哪个附属文件中、属于哪种 `type`，以及目前对其已知的情况。
- **不可用**：来源未包含或不允许读取的内容，以及原因。

它会链接回本页。

## 各转换器的现状 {#where-each-converter-stands}

| 转换器 | 附属文件 | 其完整性部分 |
|---|---|---|
| War Thunder 回放 | `messages`、`flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars)（其自检计数位于 `counts` 下；`completeness` 块将随后补充） |
| World of Tanks 回放 | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships 回放 | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad 服务器录像 | `entities`、`packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2 录像 | `events`、`props`、`strings`、`packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 回放（监视器） | `packets`、`entities`、`strings`、`units`、`combatlog` | [Dota 2 回放](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!、LoL、Valorant 回放（监视器） | `raw` | [监视器文档](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs)中各自的页面 |
| 实时适配器（监视器） | `raw` | [监视器文档](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs)中每个游戏的页面，以及 `Session.raw` 对应的[开发说明](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) |
| 赛圈录制器（游戏采集） | `raw`，以及 Forza 赛圈文件中的 `unparsed` 字节 | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| 查看器自身的导入 | 无：见下文 | 本页 |

### 查看器自身的导入 {#the-viewers-own-imports}

Tacview ACMI、OCAP 和 GPS 格式都是在浏览器中从用户自己的文件读取的；查看器不保存其中任何内容，因此文件本身即为记录。它们仍会尽可能多地读取内容：

- **Tacview ACMI**（`src/data/acmi.ts`）：每条带有位置的对象行都成为一行，包含录像携带的每个属性；每个事件成为一行；每次移除成为一行；录像自身的属性（连同文件头的 FileType 和 FileVersion）作为 `RecordingInfo` 出现在每一行上；注释行成为 `Comment` 事件，从未获得位置的对象成为位于参考点的 `Unplaced` 行，只要有任何行带有 U/V，它们就作为列出现。没有位置的属性行会被部分读取：其数值会传递到该对象的下一行，而不是在其自身的时间上。`AcmiTable.completeness` 按行的种类统计文件的行数。
- **OCAP**（`src/data/ocap.ts`）：每个实体的帧、射击、标记，每种事件类型（未知类型作为"任务"行并附其文本），以及文档自身的字段（`Info`）。尚未读取：除文件头所列之外的实体字段和尾随的位置元素（较新记录器的新增内容），以及单位死亡后重复的帧（有意精简：其中没有任何变化）。
- **GPS 格式**（`src/data/geoTracks.ts`）：定位点、它们的时间、海拔、航向和速度，以及在文件记录了的情况下的心率、踏频、功率、温度、卫星数、HDOP 和气压高度。尚未读取：除其他 GPX 和 KML 扩展、除位置语句之外的 NMEA 语句、除定位点及其扩展之外的 IGC 记录，以及除记录（圈、会话、设备信息）之外的 FIT 消息。

列出这些缺口是为了将它们补上，而不是为之辩解；查看器对已加载录像的导出（`src/data/exportRecording.ts`）只写入已读取的内容。

## 添加转换器 {#adding-a-converter}

1. 根据其文档、自身的结构，或通过统计真实样本中的每种消息类型，列出该格式包含的内容。该列表即为自检中的 `types`。
2. 解码当前可以核对的内容。每个新字段在进入表格之前都要与某个独立来源进行核对；暂时无法核对的字段仍保留为原始内容。
3. 其余内容以上述方式命名的附属文件完整保留，使用上述列。
4. 编写 `completeness` 块，以及一个断言其 `lost` 为 0 的测试。
5. 编写 README 的完整性部分，并链接到本页。
6. 若附属文件的 `<what>` 是新的，将其加入上表，并加入 `src/data/filePick.ts` 中的 `SIDECAR_PARQUET`。

转换器是净室实现：它们依据格式、文档和样本编写，绝不参考 GPL 或 AGPL 代码。真实回放的样本保存在制作它的电脑上；测试使用合成文件。
