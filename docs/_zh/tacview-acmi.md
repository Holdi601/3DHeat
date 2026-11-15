---
title: "Tacview 录像（ACMI）"
parent: "导入数据"
nav_order: 7
lang: "zh"
source: "tacview-acmi.md"
source_hash: "08423333214c"
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

## DCS 服务器：谁获胜，每次出击如何结束 {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS 多人服务器全天候用 Tacview 录制它的任务，而持久型 PvP 服务器会在许多任务之间进行一场战役：一方夺下另一方的每个机场、FARP 和区域即获胜，这需要好几天和多次任务重启。录像记录的是飞行，而不是战役：没有消息说明谁夺下了什么，机场只在开头写入一次，也没有任何内容说明谁获胜。Tacview 转换器（`node tools/acmi-to-parquet.mjs`，[`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)）把能知道的内容加到每一行上，不能知道的就留空——它从不猜测。

| 列 | 含义 |
|---|---|
| `server` | 服务器或战役，取自录像的头部（其 Title、Author 和 Comments 会写出已知的公开服务器——Blue Flag、SPS Contention、Growling Sidewinder；否则取写出某人名字的 Author）；`--server Name` 为整个文件夹命名。头部没有写出任何服务器的录像——例如 Author 为 `Admin`，Title 和 Comments 不是任何已知服务器写的——不归属任何服务器：`server` 为空，即使它是从某个服务器的录像页面下载的也一样，因为该页面也可能包含其他社区的任务 |
| `mission` | 去掉版本号和战役月份的录像 Title：`Operation_Example_V7.7.99` 变成 `Operation Example` |
| `campaign` | 录像所属的战役回合，按服务器、地图和编号：`Example Server North 3`。一份录像就是一个会话（从一次重启到下一次重启）；一个回合跨越许多会话，持续数天或数周 |
| `round` | 该回合的编号：服务器公开编号时用服务器自己的编号，否则是该服务器和地图上见到的第 n 个回合；来自回合文件（见下文），没有回合文件时为空 |
| `session` | 录像在该回合各会话中的位置，1、2、...；`sessionStart` 是它的真实开始时间（Unix 秒） |
| `heldRed`、`heldBlue` | 会话开始时每一方占有的争夺地点，来自串联的回合文件（见下文） |
| `won`、`matchWon` | 该行所属一方（其 Color，Red 或 Blue）赢得该战役时为 1，输掉时为 0；没有回合文件写明胜者时为空，中立行也为空。一场战役同时是回合和比赛，所以两列的值相同 |
| `roundEndReason` | 通过夺下一切而赢得的战役为 `capture` |
| 回合每个会话上的 `won`、`matchWon` | 回合的结果，一旦知道回合结束，就写在它的每份录像上 |
| `sortie` | 在飞机的行上：它的飞行，从一次起飞到下一次起飞依次为 1、2、...；第一次起飞前和降落后的地面时间计入它所属的那次飞行 |
| `sortieResult` | 那次飞行如何结束：`landed`、`landed damaged`（在空中被击中后）、`ejected`、`shot down`、`destroyed`（在地面上）、`crashed`、`despawned`（在空中消失且看不到原因——玩家离开）、`airborne at end`、`no takeoff` |
| `sortieKills` | 该飞机在那次飞行中被记的击杀数 |

在持久型服务器上，出击才是有意义的单位：按 `sortieResult` = `shot down` 筛选，可以看到在哪里损失了飞行；也可以在[明细](breakdown.md)中按 `sortieResult` 或 `server` 拆分热度。组成出击的起飞、降落、弹射、击杀和坠毁，是转换器根据飞机的运动推算出的事件（见上文）。

在一个回合的两个会话之间被夺下的地点——由回合文件得知，见下文——是较晚那份录像开头的 `capture` 事件：`Object` 为 `(campaign)`，位于该地点，`Detail` 为 `Red to Blue, between missions`，`Inferred` 为 `between missions`。

在录像中能看到换边的机场或 FARP——以另一种颜色再次写入，或者被移除后在五分钟内以另一种颜色在原位置再次写入——会成为该停机坪处的 `capture` 事件：`Event` = `capture`，`Airfield` 为其名称，`Detail` 为 `Red to Blue`，`Coalition` 为其新的一方。第一次以某种颜色写入的停机坪不算占领。目前查看过的服务器都只写入一次停机坪，所以它们的录像中没有占领。

### 回合文件 {#rounds-files}

回合文件按服务器写明它的战役回合、谁赢得了它们，以及每个回合的会话。它来自服务器公开的内容，或者来自录像本身（见下文）。

谁赢得了一场战役，是服务器公开的内容——它网页上的战役日志——而不是录像里的内容。回合文件带有这一信息，转换器用 `--rounds file.json` 读取它（可以给出多个）：

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

一份录像属于其 `server` 下 `title`（一个正则表达式）与其 Title 匹配的那些回合；每一行属于其真实时间所在的回合——即录像的 RecordingTime 加上该行的秒数，而不是任务在游戏内的日期。时间均为 UTC。没有胜者的回合（已轮换、仍在进行）会给它的行写上回合编号和空结果。

与比赛文档相对应的 `acmi` 页脚会说明结果来自哪里，就像 War Thunder 比赛的 `result.source` 那样：`outcome.result` 是 `{ winner, round, endReason, source }`，`source` 是回合文件的 `source`，没有任何来源写明胜者时为 `null`。`outcome` 还会列出录像的回合、占领，以及按结束方式统计的出击：

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

在该战役中，Blue 一方飞行员 `Viper 1 (F-16C_50) #a01` 的一行于是写着：`server` Example Server，`round` 41，`won` 1，`roundEndReason` capture，`sortie` 2，`sortieResult` landed，`sortieKills` 1。

### 从录像本身得出回合 {#rounds-from-the-recordings-themselves}

持久型服务器在重启之间保留它的战役，每份录像开头都是双方的地面单位和静态物体，位于战役留下它们的位置。`node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` 读取每份录像的最初几分钟（[`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)），把每个服务器在同一张地图上的录像按时间排序，并把它们串联起来：

- **地点**：把地面分成约 2 km 的格子；会话开始时格子里四分之三的单位属于某一方，这个格子就归这一方。*争夺*地点是看到被双方都占有过的地点。
- **占领**：在下一个会话开始时由另一方占有的地点——在两次任务之间被夺下，或在前一次任务期间被夺下。
- **新回合**：一个会话的地点与上一个会话相比，有超过 60% 不同——这是新回合的开局布局，而不是旧回合的一步。服务器换到另一张地图时，回合也会结束（新地图的会话在最后一个会话之后开始并继续下去）。
- **谁获胜**：对已结束的回合，是在其最后一个会话开始时占有每个地点的一方（`capture`，置信度高）；否则是占有更多争夺地点的一方（是对方两倍时为中，否则为低；因换地图而结束时为低）。未结束的回合没有胜者，但每个会话都会说明开始时每一方占有多少地点，所以能看出谁领先。
- 如果一个服务器的所有会话开局都一样，它在会话之间不保留状态：不会被串联。

最后一个会话的开始可能比回合结束早好几个小时，所以置信度很重要。对照一个公开其胜者的服务器检查过：串联在公开回合开始的那个会话上找到了每一个新回合，并且在它能检查的 9 个回合中，最后一次开始时领先的一方每次都是公开的胜者。`--official file.json` 保留这类服务器公开的回合，并把串联得到的会话加进去；文件中的 `validation` 说明串联吻合到什么程度。在一个虚构的战役中：

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### 把一个战役回合作为系列观看 {#watching-a-campaign-round-as-a-series}

把一个回合的录像——`campaign` 相同的文件——一起加载，查看器就会把它们作为一个系列播放：按真实顺序一个会话接一个会话播放，两个会话之间的几小时或几天被缩短为一分钟的间隔。时间轴用黄色标出每个会话的开始，用深色带标出间隔，时钟显示正在播放哪个会话及其真实日期（`session 4/12 · 2026-11-02 12:38 UTC`）。热度、回放、筛选和 **洞察** 在整个系列上的作用，与在任何已加载的数据上一样。**对局** 标签页的 **战役回合** 部分列出各会话及其日期、每次开始时每一方占有多少争夺地点——也以整个回合的图表显示——以及在此之前被夺下了多少；点击即可跳到某个会话的开始。单独加载的录像会在那里说明它是哪个回合的哪个会话。一起加载的不同回合的录像不构成系列：每一份都从零开始，就像各自独立的比赛一样。多比赛加载器（**一次叠加多场比赛**）也会把一个回合作为系列播放，以流式方式加载并按 GPU 调整大小，适用于好几 GB 的回合。

回合中易手的地点会作为占领区画在地图上，按正在播放的会话开始时占有它的一方着色，并在会话交界处切换；每次易手都是回放事件列表中的一次占领。这些地点是从已加载的行推算出来的——每个会话最初几分钟内的地面单位和静态物体，按约 2 km 的格子，与串联的做法相同——所以需要完整加载器（多比赛加载器保留的每行数据太少）。

**从回合中的一份录像加载整个回合。** 在普通浏览器中，查看器无法打开你没有选择的文件：请把回合的文件一起加载。由本地查看器服务器（`npm run dev` 或 `npm run preview`）提供时，它就可以：在被 git 忽略的 `tools/local-data.json` 中添加一个 `campaigns` 条目，写明回合文件所在的文件夹和已转换录像所在的文件夹，单份录像的战役回合部分就会提供 **加载整个回合**，获取在那里找到的该回合的各个会话，并用多比赛加载器加载它们：

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

只提供回合文件中写明的录像（`tools/campaign-files.mjs`）；在这些文件夹中找不到的会话只计数，不加载。

已知服务器公开的内容：

| 服务器 | 一个回合 | 一方如何获胜 | 在哪里能读到胜者 |
|---|---|---|---|
| SPS Contention | 在一张地图和一个时代上的一场战役（数天），跨越多次重启 | 夺下每个机场、FARP 和据点；没有胜者就结束的战役已被轮换 | 服务器公开的战役日志（每场战役的胜者、开始、结束） |
| Blue Flag | 跨越许多场 5 小时任务的一个战役回合；Title 中的 `_YYYY_MM` 每次重启前进一个月 | 夺下每个敌方阵地；较早的回合以固定时间后占有更多的一方为胜者 | 至今没有找到公开的形式；录像的串联会跟踪每个回合，以及每次开始时谁占有多少 |
| Growling Sidewinder | 一个开放冲突任务的一次运行（6 小时） | 夺下区域和机场 | 它的统计页面显示飞行员，而不是结果；每个会话开局都一样，所以没有跨越多个会话的回合：空 |
| 对抗 AI 的任务（夺取区域的任务） | 一次任务运行 | 玩家一方对抗任务的 AI：没有 PvP 结果 | 空 |
| 未归属（头部没有写出服务器） | - | - | 空，`server` 也为空 |
