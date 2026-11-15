---
title: "每场比赛一个文件 (.3dheat)"
parent: "导入数据"
nav_order: 9
lang: "zh"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---


# 每场比赛一个文件：`.3dheat`

`.3dheat` 文件是把整场比赛装在一个文件里，便于复制、保存或分享。要打开它，只需把文件拖到数据源面板上。

```
match.3dheat   (一个 ZIP 文件)
  manifest      比赛是什么，以及其中所有内容的列表
  table         位置（Parquet）
  match.json    对局文档
  sidecars      转换器完整保留的内容（事件、消息……）
```

过去，一场转换后的比赛是并排的几个文件：表格 `<match>.parquet`、对局文档 `<match>.match.json`，以及附属文件 `<match>.<what>.parquet`（[转换器保留全部数据](converters.md)）。`.3dheat` 文件把它们全部装在一个文件中：一场回放、一个文件，便于复制、保存或分享。

它的设计目标是：载入一千个这样的文件与载入零散的表格一样快；并且以后的转换器无需新格式，就能把更多内容放进去。

## 载入一个文件 {#loading-one}

凡是可以载入文件或文件夹的地方，`.3dheat` 文件同样可以载入；一个文件夹中可以混合容器和零散文件：

| 位置 | 从容器中读取的内容 |
|---|---|
| **热力图** 数据源面板（文件、文件夹、拖放） | 其中的表格，就像零散的 `<match>.parquet` 一样 |
| **热力图 → 同时查看多场比赛**（文件、文件夹、添加文件夹） | 其中的表格，由加载器的 worker 原地读取 |
| **对局** 标签（加载，或拖到视图上） | 对局文档 |
| **战术** 面板的遥测 | 其中的表格 |

打开容器只会读取它的两小部分：末尾的目录和开头的 manifest；在加载器读取之前，表格的内容一个字节都不会被读取。附属文件和对局文档只在有东西请求时才会读取。如果一个文件夹中同一场比赛既有零散文件又有打包文件，只会载入一次。

## 打包与解包 {#packing-and-unpacking}

新的转换默认写入容器：战争雷霆转换器（`heat3d-wt-replay`）、CS2 转换器（`heat3d_cs2 demos`）以及 Tacview 工具（`node tools/acmi-to-parquet.mjs`）。`--loose` 则保留分开的文件。

之前转换的或由其他工具转换的比赛，可以用下面的命令打包：

```
node tools/3dheat-pack.mjs <文件夹>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <文件夹|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <文件夹|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <角色>[:<名称>]=<文件>]... [--remove <名称>]...
node tools/3dheat-pack.mjs repack <文件夹|file.3dheat>...
```

- **pack** 在这些文件夹中找到每个表格 `<match>.parquet`，连同属于它的文件，并在旁边写入 `<match>.3dheat`。已经打包的比赛会被跳过。在做任何其他事情之前，每个容器都会被完整地读回校验（每个成员的 sha256、大小、CRC 和 Parquet 页脚）；零散文件只有在使用 `--delete-loose` 时才会被删除，而对于较早打包的比赛，只有当它们与容器中的内容逐字节一致时才会删除。在最近 `--settle` 分钟内（默认 10 分钟）有文件改动的比赛会被忽略：转换器可能仍在写入它。
- **unpack** 把成员作为零散文件写回到容器旁边。
- **update** 添加或替换成员，而不重写容器中已有的表格（见下文）。
- **repack** 重写整个容器，丢弃更新遗留的内容。

## 格式 {#the-format}

`.3dheat` 文件是一个 ZIP 压缩包（任何 ZIP 工具都能打开），遵循以下规则：

1. 写入容器时，**`manifest.json` 是第一个成员**，并且始终存在。它通过 ZIP 的中央目录找到，因此在 `update` 之后它可能位于文件的较后位置。
2. **按字节范围读取的成员或已经压缩过的成员会被原样存储**（ZIP 方法 0）：Parquet、Arrow、图像、模型、音频、视频、不透明的二进制块。被存储的成员是容器中一段连续的字节范围，因此读取器可以在原地读取表格的页脚及其列块——在浏览器中通过 `File.slice`，或通过 HTTP 范围请求——与读取零散文件的方式完全相同。
3. **文本会被压缩**（方法 8）：JSON、CSV、纯文本。它们很小，整体读取。
4. 名称为 UTF-8 编码（标志位 11），为相对路径，使用 `/` 分隔，不含 `..`；可以包含文件夹（如 `analysis/heat.json`）。打包的零散文件保留其原名，因此解包会还原出相同的文件。
5. 大于 4 GiB 的成员，或包含超过 65,535 个成员的容器，照常使用 ZIP64。写入器不在成员之后放置数据描述符。

转换器目前按以下顺序写入的成员：

| 角色 | 成员 | 是否存储 |
|---|---|---|
| `table` | `<match>.parquet` | 是 |
| `match` | `<match>.match.json` | 否（压缩） |
| `messages`、`flight`、`events`、`effects`、`objectives`、`packets`、`props`、`strings`，等等 | `<match>.<role>.parquet` | 是 |
| `summary` | `<match>.summary.json`，即批量索引的摘要（[批量分析](mass-analysis.md)），由 `tools/3dheat-summarize.mjs` 添加 | 否（压缩） |

表格紧接在 manifest 之后，因此读取器对文件开头的第一次读取，同时覆盖了 manifest 和表格的本地文件头。

### manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 个十六进制数字>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| 字段 | 含义 |
|---|---|
| `format` | 始终为 `3dheat` |
| `format_version` | `主版本.次版本`（见下文） |
| `game`、`source`、`converter`、`match`、`map`、`mode`、`started` | 比赛是什么，以及由什么生成；未知时为 `null` |
| `created`、`updated` | 写入的时间，以及最后更新的时间（`updated` 仅在更新之后出现） |
| `roles` | 每个角色到其第一个成员名称的映射：一个快速索引 |
| `members` | 除 manifest 之外的所有成员：完整列表，也是读取器所信任的依据 |
| `matches` | 可选：包含多场比赛的容器中的各场比赛（见下文） |
| `references` | 可选：容器需要但并未保存的文件 |
| `extensions` | 可选：转换器自己的元数据 |

每个成员：

| 字段 | 含义 |
|---|---|
| `name` | 它在容器中的路径 |
| `role` | 它的用途（见下文） |
| `media_type` | `application/vnd.apache.parquet`、`application/json`、`image/png`、`model/gltf-binary`、`audio/ogg`、`application/octet-stream`，等等 |
| `compression` | `stored` 或 `deflate` |
| `bytes` | 它的大小，解压后 |
| `sha256` | 其字节（解压后）的哈希 |
| `rows` | 表格的行数 |
| `schema` | 它遵循的约定，`{ "id", "version" }`：文档自身的 `format` 和 `version`（`heat3d-wt-replay-match` 2），读取器通过其 `heat3d` 页脚读取的表格为 `heat3d-table`，Tacview 工具的表格为 `heat3d-acmi-table` |
| `match` | 在包含多场比赛的容器中，它所属的 `matches[].id` |

### 为扩展而设计 {#made-to-grow}

这种格式旨在承载比今天丰富得多的回放，同时不破坏现有读取器的兼容性：

- **版本管理。** `format_version` 为 `主版本.次版本`。读取器会读取其主版本下的每个次版本，并忽略它不认识的字段。添加内容时次版本升高；只有当布局改变，使旧读取器会读错时（例如某个成员不再被存储，或 manifest 被移到压缩包之外），主版本才会升高。每个成员自身的约定在其 `schema` 中单独标注版本，因此新的表格布局或新的文档版本无需新的容器版本。最早写入的容器写的是 `"version": 1`；读取器会将其视为 1.0。
- **角色是开放的。** 角色可以是任意字符串。读取器使用它们认识的角色，并保留其余角色：未知角色会被列出，绝不会被拒绝，`update` 和 `repack` 会原样保留它。一个角色可以有多个成员：多张表格（每个单位的轨迹、其他频率的遥测）、事件、语音、视频同步、关卡引用、图形覆盖、分析结果。名称中可以包含文件夹。
- **任意媒体。** 成员可以是任何具有媒体类型的内容：Parquet、JSON、Arrow、PNG 或 JPEG 缩略图、glTF 模型、音频、原始二进制块。
- **多场比赛。** 一个会话或一场锦标赛可以放入一个容器：`matches` 列出它们（`{ "id", "map", "mode", "started", ... }`），每个成员都会注明其 `match`。查看器会载入每一个角色为 `table` 的成员。
- **引用。** 容器需要但并未保存的文件（例如某场比赛所用的关卡），会在 `references` 中按名称和 sha256 列出（`{ "kind": "level", "name": "...", "sha256": "..." }`），这样无需把它复制到每场比赛中，也能找到并校验正确的文件。
- **扩展。** `extensions` 在每个转换器自己的键下保存其元数据，即 `"<厂商>/<名称>": { ... }`，因此两个转换器永远不会冲突，也无需向共享字段中添加任何内容。
- **原地更新。** `update` 在不重写大型存储表格的情况下添加或替换成员：新的成员和新的 manifest 会追加在容器末尾，随后是新的中央目录。被替换的内容会作为未被引用的字节保留，直到 `repack`。每个成员和每个 manifest 字段，无论是否已知，都会被保留。失败的更新会被回滚到更新前的容器状态。

查看器的测试保证了这一点：一个格式为 1.7 的容器，包含未知角色、一个成员字段、一个扩展和一个音频成员，放在一个文件夹中可以被载入，并且在经过更新和重新打包后，所有内容都完整保留；主版本为 2 的容器则会被拒绝。

## 写入器 {#writers}

- Node：[`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)（写入、读取、校验、更新、重新打包），由打包工具和 Tacview 工具使用。
- Python：`container.py`，约 140 行，基于标准库 `zipfile`，每个转换器中都是同一个文件（`heat3d_ext_warthunder/container.py`、`heat3d_cs2/container.py`），因此没有任何转换器依赖另一个。新的转换器直接复制它即可。
- 查看器使用 [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts) 读取。
