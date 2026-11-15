---
title: "赛车分析：方法"
parent: "赛车分析"
nav_order: 58
lang: "zh"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# 赛车分析：方法

简而言之：

- 圈按**距离**比较，而不是按时间，这样赛道上的同一个地点才能对齐。
- 每个弯作为**整体**评判，从一个刹车区到下一个刹车区。
- 损失的时间被**拆分**为：在哪里损失（刹车、入弯、出弯、直道），以及车辆解释了其中多少。
- 原因用**文字解释**，并附上建议。
- 要使用它而不是了解它的工作原理，见：[赛车分析](race-analysis.md)。

这是**赛车分析**标签页背后的方法：它衡量什么，如何判定时间损失在哪里，以及如何把它转化为建议。它是分析代码（`src/race/`）所遵循的规格，因此这里的每条规则都有对应的代码和一项用于验证的测试。

## 专业工具做什么 {#what-the-professional-tools-do}

成熟的工具在核心上趋于一致，主要区别在于它们在多大程度上深入到*原因*：

- **一切都按距离而不是时间比较。** 两圈被重采样到同一条距离轴上；在相同距离处经过时间的累积差就是*增量*（delta）（MoTeC 称之为时间方差，其他工具称之为时间差或增量曲线）。它的斜率说明此刻在哪里损失时间：斜率平缓是加速、阻力或持续抓地；斜率陡峭则是刹车或油门的差异；上下起伏的波动则是入弯速度与出弯速度之间的取舍。
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/)、
  [section time analysis](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)、
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **每个弯都被拆分为若干阶段**：刹车、入弯、中段、出弯——刹车点、最大刹车与松开、最低速度及其位置、挡位、油门重新踩下、回到全油门、出弯速度。
  ([Driver61：六个阶段](https://driver61.com/uni/corner-phases/)、
  [iRacing 圈分析指南](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **每个弯的迷你分段，以及由各段最快者拼成的理论最佳圈。**（[Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps)、
  [Overcut](https://overcut.gg/)）
- **驾驶走线也会被比较**，但从不单独看：“没有对比因素的情况下，图像上的一条线毫无意义”——它要与速度曲线和增量结合起来读。
  （[Track Titan：如何分析遥测](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)、
  [Sim Racing Telemetry：赛车线](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)）
- **找根因，而不是看症状。** 直道上的损失真的是油门的问题，还是糟糕的入弯迫使油门踩得晚？失误按圈时间代价排序，并用平实的语言解释。
  （[Track Titan 教练流程](https://www.tracktitan.io/post/november-2025-update-coaching-flows)）

### 第一版出了什么问题，以及为什么重要 {#what-went-wrong-in-the-first-version-and-why-it-matters}

第一版对每个*阶段*单独计价，并且只看损失。一圈如果刹车更早，就会在刹车阶段损失时间，并被告知要晚刹车——即使这种更早的刹车让车更早转向、更早踩油门、更快地出弯，并在直道上把时间全部赢回。在一次测试中，它告诉做了这种事的那一圈“刹车要晚得多”，而另一圈——它确实刹车更晚——错过了弯心、走得太宽，并损失了它刚刚赢得的全部时间。时间数据显示两种跑法持平，而建议却说相反。

修正的办法是上面所有来源都认可的规则：**一个弯作为整体评判**，从它的刹车区开始，到下一个弯的刹车区为止，因为“有时牺牲弯中的几毫秒，可以让之后的路段更快，从而改善整圈时间”
（[人工赛车手的驾驶风格偏置](https://arxiv.org/abs/2504.12744)）。

## 规则所编码的赛车知识 {#racing-knowledge-the-rules-encode}

**出弯速度比入弯速度更重要**，而且后面直道越长越重要：“直道上花的时间主导了弯中花的时间”，出弯时的速度不足会一直带到下一个刹车点。通过一个弯加直道的最快方法，往往是弯中慢一点，以便更早给油——*慢进快出*。
（[Race & Track Driving：提高圈时间的顺序](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)、
[Driver61：弯的优先级](https://driver61.com/uni/prioritising-corners/)）
一个既以最短时间为目标、又因出弯速度而获得奖励的规划器，会把弯心往后移，从而得到*更快*的圈；能够平衡两者的奖励，对于长为 `L`、速度为 `v` 的直道，每单位出弯速度的价值为 `L / v²`——即速度差在直道上所损失的时间，随直道长度增加，并随速度的平方而减少
（[arXiv 2504.12744](https://arxiv.org/abs/2504.12744)）。

**按通往何处对弯分类。** 通往直道的弯：最大化出弯速度，晚弯心，尽早回到油门。位于直道尽头的弯：最大化带入直道的速度，尽量晚刹车，稍早的弯心可以接受。位于弯与弯之间的弯：为其后那个更重要的弯做出妥协。两种都可能的弯，按通往直道的弯处理。速度越快的弯权重越大：速度高时赛车加速很弱，每损失一公里每小时都无法再赢回来。
（[Allen Berg：三种弯](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)、
[Driver61：弯的优先级](https://driver61.com/uni/prioritising-corners/)、
[Driver61：不同的弯，不同的技术](https://driver61.com/uni/different-corner-technique/)）

**摩擦圆。** 轮胎只有一份抓地力预算，用于刹车、转弯和加速，可以任意组合；总加速度为 `sqrt(lat² + long²)`。过渡刹车（trail braking）沿着这个圆的边缘进行：随着转向和侧向载荷增大而松开刹车。
（[摩擦圆](https://www.yourdatadriven.com/friction-circle-introduction/)、
[g-g 图](https://trailbrake.com/data-analysis-tips/gg-diagram/)）

**滑行**——两个踏板都不踩——是失去速度最慢的方式，也是一个可衡量的关键绩效指标。
（[Racecar Engineering / OptimumG：滑行系数](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)）

**滑移。** 纵向力在滑移率约为 10-20% 时达到峰值，之后下降；超过这一点，车轮在刹车时抱死，或在动力下打转。Forza 报告的滑移是归一化的：0 为完全抓地，绝对值超过 1 则表示抓地力已失去。
（[纵向滑移](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)、
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)）

**转向不足与转向过度。** 前轮侧偏角大于后轮为转向不足；后轮大于前轮为转向过度。没有侧偏角时：车转向的幅度少于方向盘所要求的（方向盘转角超过低速时车辆所需的阿克曼角 `L/R`）。
（[转向不足概述](https://www.sciencedirect.com/topics/engineering/understeer)、
[转向不足与转向过度](https://en.wikipedia.org/wiki/Understeer_and_oversteer)）

## 走线的几何 {#the-geometry-of-a-line}

车在半径 `R` 上能保持的速度为 `v = sqrt(a R)`，其中 `a` 是轮胎所提供的横向加速度（再加上下压力所增加的部分，它随 `v²` 增长）。因此**速度随半径的平方根增长**：在中段走一条半径大 20% 的线，那里大约快 10%。
（[最大过弯速度](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)、
[formula1-dictionary：过弯](https://www.formula1-dictionary.net/cornering_tech.html)）

**几何走线**是穿过一个弯的最大圆弧：从外侧边缘开始，在弯心处贴近内侧，再回到外侧。对于一个转过 `θ` 角、宽为 `w`（减去车宽）的路面，与两侧外边缘相切、并触及内侧转角的圆弧，其半径为 `R = w / (1 - cos(θ/2))`（再加上内侧边缘自身的半径）——对于直角弯约为 `3.4 w`，对于发夹弯为 `w`。这就是为什么利用宽度在中速弯中最重要，在发夹弯中最不重要。
（[赛车线](https://en.wikipedia.org/wiki/Racing_line)）

**晚弯心**转入更晚、更深，起初半径较紧，并在出弯时放开半径：中段较慢，但更早直行、更早全油门——“最低速度稍低，但出弯时加速曲线更强”。**早弯心**则相反：入弯更快，但出弯时半径收紧，并压住油门——大多是个错误，除非抓地力极低，此时入弯时损失的速度无法在出弯时补回。
（[赛车线](https://en.wikipedia.org/wiki/Racing_line)、
[赛车遥测词汇](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)、
[赛车线的数学](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)）

**“V”与“U”。** U 是经典的圆润走线：半径最大，转向变化最小。V 则早转入、切得更深，在中段快速使车转过来，并为更直的出弯做好准备：刹车保持笔直（因此可以更晚），最低速度较低但来得更晚，全油门来得早得多。
（[Track Titan：V 形线](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)）

**曲率与距离。** 最快的线是最短路径与最少弯曲之间的折中；在赛道的宽度范围内，曲率比距离更重要；在车辆处于极限时，最小曲率线接近最小时间线——而在车能够加速的地方，它们会分开。
（[考虑曲率与距离的全局最小时间轨迹规划](https://www.nature.com/articles/s41598-025-21211-2)、
[TUM 全局赛道轨迹优化](https://github.com/TUMFTM/global_racetrajectory_optimization)）

**连续的弯**——双弯心、连续弯——是同一个问题：其中一个弯的出弯线就是下一个弯的入弯线，并且要从通往直道的那个弯开始向回推导。
（[Driver61：不同的弯，不同的技术](https://driver61.com/uni/different-corner-technique/)）

## 哪种走线适合哪种车 {#which-line-suits-which-car}

决定因素是车辆在该弯速度下的**动力与抓地力之比**——“动量是抓地力对动力，是一个比率问题”。
（[Ross Bentley：动量型赛车](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)、
[动量胜过马力](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)）

| 车辆在此弯 | 走线 | 原因 |
|---|---|---|
| 相对抓地力加速强劲（“直接冲击”，point and shoot） | V：直线晚刹车，在短而急的中段转向，并早直行、早全油门 | 时间靠全油门赢得，而不是靠最低速度 |
| 相对抓地力加速偏弱（“动量”，momentum） | 宽而圆的 U，弯心略晚，保持最低速度 | 它赢不回被磨掉的速度 |
| 介于两者之间 | 慢进快出：晚弯心的 U | 经典的折中 |
| 快速弯，有下压力时更甚 | U，接近几何走线 | 速度下的加速很弱；下压力抓地随 `v²` 增长，因此中段的速度获得双重回报 |
| 抓地力极低（湿滑、雪地） | 更早的弯心 | 入弯时损失的速度无法在出弯时补回 |
| 动力远超抓地力 | 走线的影响较小 | 出弯受牵引力限制，而不是走线 |

“弯越快，越接近几何走线；弯越慢，越需要通过晚弯心来改变它。”
（[Skip Barber：Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)、
[赛车线的数学](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)、
[Track Titan：V 形线](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)、
[Driver61：抓地力](https://driver61.com/uni/grip/)）

驱动方式对走线的驾驶方法的影响，比对走线本身的影响更大：前驱车在刹车时被转过来（过渡刹车），只在车轮回正时获得动力，否则会向外冲；动力强的后驱车在全油门之前必须先摆正，否则车尾会滑开；四驱车在转向时仍能吃住动力，所以可以更早给油。
（[FWD 技术](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)、
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)、
[AWD vs RWD cornering](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)）

查看者通过车辆自己的驾驶，测量每个弯的动力与抓地力之比——出弯速度下的全油门加速度，除以最低速度下的横向抓地力——在 0.45 及以上称为“直接冲击”，在 0.25 及以下称为“动量”。在 150-250 km/h 时抓地力比 55-110 km/h 时高出 15% 以上，则表示下压力在起作用。

## 方法 {#the-method}

以下的数字是推理过程。代码所用的阈值各自记录在一页中，若本页的数字与之不同，以那些页面为准：[逐弯分析](race-corner-analysis.md)、[车辆控制事件](race-control-events.md)、[车辆档案与比较](race-car-profiles.md)和[赛道统计](race-course-statistics.md)。

### 1. 一条距离轴 {#one-distance-axis}

最快的圈是参考圈，除非用户另行选择。它的行驶路径就是这条轴：其他每圈的采样点都投影到它上面，使每个采样点得到沿参考圈的距离 `s` 和带符号的横向偏移 `d`。投影只从上一次匹配处向前搜索，因此一圈即使穿过自己，也不会跳到桥的另一侧。然后，各圈的每个通道都被重采样到同一个网格上，每 2 m 一个点。每圈在最后几米以它当时的速度延伸，因此它在终点线的增量就是它的圈时间差。

### 2. 弯，以及每个弯占全圈的份额 {#corners-and-each-corners-share-of-the-lap}

弯、路段和复合弯如何被找出：[逐弯分析](race-corner-analysis.md#segments-braking-zone-to-braking-zone)。

### 3. 一个弯的时间账 {#the-time-account-of-a-corner}

净差、拆分、出弯速度和车辆的拉力：[逐弯分析](race-corner-analysis.md#the-time-account-of-a-corner)。

### 4. 结论与原因 {#the-verdict-and-the-cause}

结论的模式，以及入弯和出弯的原因：[逐弯分析](race-corner-analysis.md#the-verdict-and-the-finding)。

### 5. 车辆与驾驶员的对比 {#the-car-against-the-driver}

当两圈在不同车辆中时，车辆所解释的那部分损失会被扣除，分为几个部分：

- **拉力**：两车从相同速度开始沿直道行驶的情况，如上所述；
- **抓地力**：在未被更紧半径解释的那部分较低最低速度中，占的份额为 `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`，前提是这一圈处于其车辆的极限（达到该速度下所显示值的 90%）；
- **刹车**：从 `u` 降到 `v`，减速度分别为 `a1` 与 `a2`，终点相同，代价为 `(1/a1 - 1/a2)(u - v)² / 2u`——只有当这一圈在该区内平均刹车力接近其车辆能做到的程度（而不只是峰值）时才计算。

一辆车能做什么，来自它的每一圈已加载的数据：每 5 m/s 速度区间内的横向抓地力、刹车力和全油门加速度（分别取第 95、第 95 和第 90 百分位数）。抓地力指的是车辆**保持了半秒**的状态——半秒内横向加速度的平均值——而不是单个采样点所触及的数值：路肩、侧滑后的回正、车被追上，都会让单个采样点突然变高，而经常这样的车看起来比实际抓地力更强。（已与两种不同车辆的实际圈数据对照检验：逐采样点的衡量让两车接近；保持半秒的衡量则能像它们的圈时间那样把两者区分开。）刹车和拉力对每个采样点取其自身与相邻采样点的中位数。空中、落地后的稳定过程，以及每一次撞击（见第 6 节），在车辆恢复之前都会被排除。

**每辆车是什么样的**（`profile.ts`），来自相同的圈：

- **保持的抓地力**：该半秒横向加速度的第 95 百分位数；
- **拉力**：全油门下，0 到 50 km/h、50-120、120-200 以及 200 以上的拉力，以及它显示过的最大值；
- **刹车**：从 60 到 160 km/h 的刹车；
- **最高速度**：在直道上全油门时，它停止增速（持续一秒）的那一点——必须是直道上的行驶，而不是平直通过的长弯，因为在任何动力下，车在弯中都会被磨掉速度。若没有足够长的直道，则以它在最高速时仍在拉的程度来说明它离最高速还有多远。除了圈所显示的之外，不做任何猜测：曾有一次用功率随速度的拟合加上阻力，把一辆公路车的最高速估计高出了实际 100 km/h，因为齿比和限速器远在阻力起作用之前就结束了车的拉力；
- **丢失车尾**：一圈中它的侧滑超过 10° 漂移（在松散路面上为 20°）且方向盘朝弯的反方向打过的次数——被反打方向接住——其中有多少次始于油门，以及它们开始时抓地力的占比。为了有意斜着开的车，并不算是在丢失什么；需要被接住的才算。对每辆车的计数方式相同，因此可以相互比较；
- **平衡**，在圈有侧偏角数据时：极限处前轮对后轮。

**对比各车**将各车并排放置：一张表，以及每辆车相对另一辆的一句话描述（“X 的加速更好，但转向不够猛，停车需要更长距离，而且更容易丢失车尾”），以及每一个足够明显的差异（抓地力差 4%、拉力或刹车差 5%、最高速差 4 km/h，以及车尾被接住的次数每圈多一次且多出半数以上），还有每辆车该怎么开。只有一辆车时，则说明那辆车是什么样的。

**在每个弯中**，当两圈在不同车辆中时，发现会说明其中有多少是由车辆决定的，以及如何充分利用这辆车：

- **穿过中段**：在另一辆车的走线上，这辆车的抓地力允许的速度为 `v_other · √(grip_mine / grip_other)`。若这一圈达到了它，差距就是车辆造成的，任何刹车点都改变不了它——会这样说明，并把这个弯归咎于车辆而不是驾驶员；若它达到的更少，则剩下的余地是可以赢回的，并会说明多少。然后说明时间可以在哪里赢回：通往直道，或在拉力更强的车中，于弯心之后——直线刹车，晚入弯，早把车指向出口；否则，就是道路允许的最大半径，因为更大的半径是在不增加抓地力的前提下获得更高速度的唯一方式；
- **车尾失控**（在此处发生）：在这辆车中比另一辆车更容易丢失车尾时：在这辆车中该怎么办——随着方向盘回正而慢慢给油，或在弯中不收油地轻柔松开刹车，取决于它的侧滑如何开始；
- **之后的直道**：另一辆车从相同速度出发更强的拉力所赢得的部分，以及这辆车在哪里拉力用完；
- **更早的刹车点**：在刹车力较弱的车中。

若一圈在弯中段侧滑（在柏油上超过 10° 漂移），它是超出了抓地力，而不是不够；因此它永远不会被告知在那里还有抓地力余量。若这一圈的车尾在低于弯所需的横向加速度时就已松开，“还有抓地力余量”会建议用小步去找出原因。

### 6. 车辆控制：抱死、轮胎打滑、侧滑与推头，撞击与事故 {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

每一圈也会读取车辆是如何被操控的——哪里车轮抱死、哪里驱动轮打滑、哪里车尾甩出、哪里车头冲宽——因为这些失误是单看时间无法说明的。有三件事让它在各款游戏和各种路面上都能成立。

**抓地力消失的位置是从车辆自己的驾驶中测得的。** 工程师会为每辆车在能产生最大减速度的滑移处设定抱死阈值（OptimumG 刹车系列中的 MoTeC 通道，对一辆车使用 -0.07），而不是采用书本数值，而书本数值本身也彼此不一致：柏油上力的峰值出现在 5-20% 滑移处，取决于轮胎和车型；雪地上则为 6%，或 20-60%，取决于来源；砂石路面则没有任何来源给出数值。游戏对滑移的缩放方式又各不相同：Forza 的滑移是“归一化”的，超过 1 即失去抓地力——然而，车辆的刹车可能在远低于或远高于 1 处发挥最佳，而普通的刹车区也可能超过 1。因此，对每辆车，在它所有已加载的圈上，将其产生的力按其所出现的滑移分组：直线刹车时，减速度对车轮的滑移率；在动力下，加速度（占该速度下车所能产生值的比例）对驱动轮的滑移；弯中抓地力（占该速度下车辆抓地力的比例）对每个轴的侧偏角。极限是力在峰值之后下降 8% 的滑移点。在数据中从不下降的曲线——Forza Horizon 的弯中与牵引力——没有极限，单靠滑移也无法标记任何东西。数据不足时，极限取标称峰值的一又二分之一。

**地面在每个采样点都是已知的**，只要游戏提供这一信息：Forza 在砂石、泥地和草地上会使轮胎震动（柏油赛道上的采样很少，泥地和越野赛道上则很多），Trackmania 会指出每个车轮下的材质，而拉力赛段的地面则按第 11 节所述的方法找出。曲线、漂移习惯和阈值在柏油和松散路面上分开保存。

**每个事件都会与另一圈在相同米数上的情况对照。** 在砂石、雪地上，或在漂移较多的街机赛车中，侧滑正是弯的驾驶方式：最优控制研究在柏油上发现了“低漂移”的解，而在越野中则发现了“激进、高漂移、甚至反向转向”的解；拉力赛数据显示轮胎“远在非线性区域之内”；而在非常松散的路面上，抱死车轮甚至能让车停得更快。因此，另一圈也做出的事件——占其 80% 或以上——是这个弯的驾驶方式，而不是失误；而另一圈没有做出的事件，只有在它损失了时间时才算失误：即从事件之前不久到事件后 40 m 之间损失的时间。解释了某个弯 40% 或以上损失的失误，则成为该弯的原因。

检测阈值、与另一圈的对照测试、撞击和事故，以及建议文字：[车辆控制事件](race-control-events.md)。

### 6b. 多圈：赛道统计 {#b-many-laps-the-courses-statistics}

级别比较、什么算失误、统计数据和失误地图：[赛道统计](race-course-statistics.md)。

### 7. 驾驶的走线 {#the-driven-line}

对每一圈和每个弯，仅根据位置计算：它从哪里开始转向（其最紧曲率的五分之一处），其最紧半径（±8 m 之内），前半段和后半段航向变化中的平均半径，等等。

- **形状**：最紧半径与平均半径之比低于 0.55 为 V，高于 0.75 为 U；
- **弯心**：出弯半径与入弯半径之比高于 1.25 为晚，低于 0.8 为早；
- **速度上的弯心**：其最慢点比转弯中点早 15 m 以上为慢进快出；晚 15 m 以上则表示过了中点仍在减速。

与另一圈比较：在入弯、最紧部分以及两圈都平直的地方，它偏内或偏外多少，以及每圈在哪里开始转入。每条发现的结尾，都会给出适合这辆车在该弯的走线，依据是该弯通往何处、车辆测得的动力与抓地力之比、下压力和驱动方式，并说明该圈是否按此驾驶。“逐弯对比”表列出了每个弯中最快的圈及其走线形状，并汇总最佳的各弯成绩。

### 8. 两张地图 {#two-maps}

- **在哪里**：赛道按 `dΔt/ds`（相对参考圈）着色，损失时间处为红色，获得时间处为绿色。
- **为什么**：每个损失都画在其原因所在处，按原因组（刹车、入弯、出弯、直道、车辆）着色，代价越大画得越宽。

### 9. 回放 {#replay}

一个时钟，三种把它转换为每圈自身时间的方式：从起跑线开始、在某一点对齐（每圈都在赛道上的同一点、同一时刻到达，然后放开），以及并排（每圈都被保持在参考圈的距离上）。

### 10. 世界是哪一种方向 {#which-way-round-the-world-is}

查看器的世界是右手坐标系，Y 轴向上。左手坐标系的游戏（Forza 也是其中之一）在这里会呈镜像：每个右转弯都画成左转弯，赛道与圈一样。圈会自己说明这一点——正向转向在每个适配器中都是向右的，而弯中外侧的悬挂会压缩——因此赛车标签页会提议修正，**摄像机与场景 → 反转世界坐标轴**即可做到：X、Y 或 Z 被反向绘制。只有绘制会改变——一个折叠进视图矩阵的镜像；摄像机在绘制的世界中飞行，而数据、分析以及工具显示的每个坐标，都仍然保持游戏自己的坐标。分析用相同的测量说明弯是左还是右。

### 11. 拉力赛：侧滑、左脚与空中 {#rally-the-slide-the-left-foot-the-air}

拉力赛段并不是在更差的抓地力下开的赛道。在砂石和雪地上，侧滑正是过弯的方式：车在入弯时通过转移重心被转过来——“刹车把车的重量前移……前轮获得抓地力，后轮失去抓地力，车身侧滑着转入弯中”，然后一旦“对准了你想去的方向”就回到油门上（[DirtFish：如何使用刹车](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)）。左脚负责刹车，使油门和刹车可以相互配合，手刹在紧弯中帮助转向（[RallySport Ontario：拉力驾驶入门](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)、[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)），而车也会离开地面。第 6 节已经用另一圈对照地读取了侧滑；以下这些规则覆盖其余部分。

- **地面。** 圈自己的说明（`meta.surface`，拉力录制工具的 `--surface`），否则根据赛段名称——柏油拉力赛（西班牙、克罗地亚、中欧、德国、日本、科西嘉、Ypres）、冬季赛（雪地），蒙特卡洛的柏油上带有雪和冰（混合）——否则根据车辆的驾驶方式。Rally2 车在砂石上的横向极限为 0.7-0.9 g，在柏油上为 1.3-1.4 g（[grenzbereich，参考值](https://github.com/GitCrush/grenzbereich)），而在砂石上它会漂移得更多（第 6 节）。因此，若车在地面上以 10 m/s² 或更高的横向加速度行驶（第 95 百分位数，速度足够，在地面上），并且在其过弯达到该值 70% 的任何地方，中位漂移角低于 6°，则为柏油；其他情况或数据不足以判断，为松散路面。
- **车在其所在地面上能做什么。** 抓地力、刹车和拉力（第 5 节）在圈在柏油和松散路面上各自行驶超过五分之一采样点时，分别在两种路面上测量，每个弯则在其最慢点时车下的地面上进行判断。空中以及着地后 0.3 s 内的采样点，会被排除在所有测量车辆的内容之外——包括包络线、轮胎曲线、抱死和轮胎打滑：着地会让车的冲击超过轮胎所能承受的极限，而在空中打滑的车轮不是轮胎打滑。在松散路面上不判断下压力，因为赛段的快速段与慢速段是不同的道路。
- **左脚的一下轻点不是刹车。** 在油门仍在半开或以上的状态下，轻点刹车，持续不到 15 m，是为了稳住车或使其转向；一圈为某个弯开始刹车的位置，是第一次让油门松开的刹车，或持续更久的刹车。
- **车在入弯时转过来。** 对每圈和每个弯，从其刹车点到最慢点之后 5 m，取最大的漂移角。在松散路面上，一圈若使车的转向比另一圈少 8° 或以上（另一圈使其转过 12° 或以上），并且更晚获得动力或平直，则为**车身转得不够**：建议是在入弯时收油或轻点左脚刹车，让后轮随之转过来——若另一圈用了手刹，则参考其手刹点；或在低于 54 km/h 的弯中使用手刹——并在弯心之前让车头指向出口。一圈若使其转得比另一圈多 12° 或以上，且仍然更晚获得动力，则为**车身转得太多**：在能够踩下油门之前，必须先把车摆正。这两种情况，在出弯时都是该弯的原因，排在车辆控制失误之后。松散路面上的走线建议，对每个弯都说明同样的事。
- **空中。** 比另一圈的飞行长 0.2 s 或以上，并且从起跳前 10 m 到落地后 40 m（或弯的结束）之间造成了时间损失的飞行，在它解释了该弯损失的 40% 或以上时即为原因；其后的那个弯，若以更慢的速度到达，会说明这一点。在空中，车无法转向、刹车或驱动。建议是在起跳时保持油门——“起跳时不要收油”，否则车头会下沉——并且越过顶点时稍慢，或轻点刹车，让车保持低姿态（[DirtFish：如何跳拉力车](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)）。
- **最多三个弯的复合弯。** 一段不断弯、从未平直通过的路段，不会被当作一个长的复合弯：超过三个弯后，就开始一个新的复合弯。

`src/race/rally.test.ts` 用一个简单模型运行的赛段来检验以上全部分析：一辆车转向不足且更晚获得动力、一次更长的飞行、左脚的轻点、一段弯多的路段，以及柏油与砂石的对比。


## 数据，以及每个来源允许什么 {#data-and-what-each-source-allows}

| 来源 | 采样率 | 通道 | 允许 |
|---|---|---|---|
| FH Companion 圈文件 | 约 5 m | 位置、速度、油门、刹车、转向、横向/纵向加速度、挡位 | 除车辆控制之外的一切，车辆控制需要旁边的遥测数据 |
| FH Companion 的 `.tele.gz`，位于每个圈文件旁边 | 游戏的 64 Hz（保留每个数据包的录制工具约每秒 110 个，重复的被丢弃） | Forza 的整个 Data Out：每个车轮的滑移率、侧偏角、组合滑移、转速、悬挂、路面震动；车身坐标系速度；偏航角速度 | 全部，包括车辆控制 |
| 由 `heat3d_capture telemetry` 录制的 Forza Data Out | 60 Hz | 以上全部，加上每个车轮的轮胎温度、滑移率、侧偏角、组合滑移、悬挂行程、车轮速度、路面震动；转速、功率、扭矩、偏航角速度 | 全部 |
| Assetto Corsa、ACC、AC EVO、AC Rally（共享内存，`heat3d_capture telemetry --game ...`） | 60-333 Hz | 一个超集：轮胎核心及内/中/外侧温度、胎压、刹车温度、车轮载荷、外倾角、滑移率与侧偏角；车身坐标系速度；ABS 与牵引力控制的作用（ACC、EVO、AC Rally） | 全部 |
| iRacing `.ibt`，直接读取 | 60 Hz | 来自 GPS 的位置、踏板、转向、加速度、偏航、每个车轮的胎体温度、减震器压缩量、胎压、磨损 | 全部；车辆控制来自漂移角（其偏航与行驶方向的差）和转向，没有滑移（未记录） |
| EA SPORTS WRC、DiRT Rally 2.0 / 1 / DiRT 4（UDP） | 每帧；100 Hz | 位置、世界速度和车辆的轴向、每个车轮接触面的速度和悬挂、踏板、转向、赛段时钟和长度 | 全部；滑移和漂移角由数据推导 |
| Richard Burns Rally（NGP UDP） | 每个物理步 | 位置、车辆自身速度、每个车轮的弹簧压缩与力、踏板 | 除车轮滑移外的全部 |
| BeamNG.drive（`heat3d` 协议模组） | 最高 100 Hz | 位置、世界速度和轴向、每个车轮的表面速度、转速、载荷和接地 | 全部；滑移和漂移角由数据推导 |
| Trackmania（Openplanet 插件） | 每帧 | 位置、前向和侧向速度、踏板（刹车为开/关）、转向、每个车轮的滑移系数和松散地面、是否在空中 | 全部；漂移角由侧向速度得出 |

每个来源都会被转换为同一种圈格式 `heat3d-lap`，其通道使用规范名称（`speed`、`throttle`、`tireTemp[FL]` 等）。车辆标记和图表会绘制圈所拥有的任何通道。

## 来源 {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections：时间方差曲线](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer（距离域增量）](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing 圈分析指南](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry：圈会话](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry：分析赛车线](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut：从分段得出的理论最佳圈](https://overcut.gg/)
- [Track Titan：如何分析遥测](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG：刹车分析、抱死与稳定性关键指标（2019 年 9 月）](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG：油门上（2020 年 1 月）](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM：赛车手的关键绩效指标（arXiv 2005.10044）](https://arxiv.org/pdf/2005.10044)
- [轮胎与路面摩擦模型及最佳滑移（PMC9920324）](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB：轮胎与路面摩擦，雪和冰上的峰值滑移](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard：轮胎摩擦系数，峰值与滑动](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline：纵向力](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline：横向力](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [车辆稳定性，车身侧滑极限（arXiv 1104.1582）](https://arxiv.org/pdf/1104.1582)
- [拉力赛的高侧滑驾驶（Georgia Tech，IJVAS）](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [最短时间的拉力赛动作（Georgia Tech，ISIE 2005）](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC 参考偏航角速度（arXiv 2305.18422）](https://arxiv.org/pdf/2305.18422)
- [通过转向相对偏航检测转向不足与转向过度（US10293852B2）](https://patents.google.com/patent/US10293852B2/en)
- [EDC：转向角、阿克曼与转向不足梯度](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM：数学通道（Kus，合成 g）](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta：转向过度与转向不足部件](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking：在非常松散的路面上抱死](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy：砂石拉力数据记录](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish：如何使用刹车](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish：如何跳拉力车](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario：拉力驾驶入门](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick（斯堪的纳维亚甩尾）](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich：拉力车辆动力学，参考值](https://github.com/GitCrush/grenzbereich)
- [Trackmania 速度漂移训练插件（常数）](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania 速度侧滑的写作](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan：教练流程](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan：V 形线](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [人工赛车手的驾驶风格偏置（出弯速度与最小时间）](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving：提高圈时间的顺序](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg 赛车学校：三种弯](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61：弯的优先级](https://driver61.com/uni/prioritising-corners/)
- [Driver61：不同的弯，不同的技术](https://driver61.com/uni/different-corner-technique/)
- [Driver61：弯的六个阶段](https://driver61.com/uni/corner-phases/)
- [Driver61：抓地力](https://driver61.com/uni/grip/)
- [Skip Barber 赛车学校：Going Faster（节选）](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley：什么是动量型赛车](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [动量胜过马力之争](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [赛车线的数学，第 2 部分](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD，第 1 部分](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD 技术](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD vs RWD 过弯](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [赛车线](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary：过弯技术](https://www.formula1-dictionary.net/cornering_tech.html)
- [最大过弯速度](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [赛车遥测词汇](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [考虑曲率与距离的全局最小时间轨迹规划](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM：全局赛道轨迹优化](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG：滑行系数](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [摩擦圆入门](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com：g-g 图](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [纵向滑移](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [转向不足概述](https://www.sciencedirect.com/topics/engineering/understeer)
- [转向不足与转向过度](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out 文档](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard：牵引力受限的加速](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard：动力受限的加速](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO 共享内存](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally 遥测读取器](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT 解析](https://github.com/teamjorge/ibt)
