---
title: "知识目录"
parent: "知识视角"
nav_order: 2
lang: "zh"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# 知识目录

这是[知识视角](knowledge.md)所掌握内容的完整列表：它寻找的模式、它引用的思想、方法、历史案例和研究，以及其背后的书籍和论文。用它按 id 查找条目，或核对某个出处。

本页由知识库通过 `node tools/knowledge-doc.mjs` 生成；请勿编辑标记之间的内容。

<!-- kb:begin -->

知识库共有 579 条条目（135 个概念、37 种方法、277 个历史案例、17 条设计原则、113 项研究），涵盖 93 种模式，引用了 556 条参考文献。

### 模式（93）{#patterns-93}

| id | 类别 | 在数据中的样子 |
|---|---|---|
| `concentration` | 兵力 | 把更多单位集中到一处的一方，赢得该处的幅度超过单纯的人数差距。 |
| `local-superiority` | 兵力 | 在交战距离内，击杀归于人数占优的一方，不论总数如何。 |
| `attrition` | 兵力 | 随着时间推移，损失反映双方的实力；谁先耗尽，谁就决定胜负。 |
| `exchange-ratio` | 兵力 | 不同地点、阵营或兵种之间，每次损失所换得的击杀数差别很大。 |
| `aimed-fire` | 兵力 | 损失随敌方人数增加，却不随己方人数增加。 |
| `area-fire` | 兵力 | 损失随双方人数之积增长：拥挤会受到惩罚。 |
| `defeat-in-detail` | 兵力 | 一方的兵力陆续到达，被逐个击破。 |
| `mutual-support` | 兵力 | 一名损失者很快被附近的队友补上：互相交换击杀。 |
| `combined-arms` | 兵力 | 各兵种互补弱点时表现良好，单独作战则很差。 |
| `class-counter` | 兵力 | 某一兵种对另一兵种，或在某种地点，取得悬殊的胜利。 |
| `initiative` | 兵力 | 交战中先得分的一方，往往会赢下这场交战。 |
| `key-terrain` | 地形 | 同样几处地点，场场比赛都决定战斗胜负。 |
| `fields-of-fire` | 地形 | 能俯瞰他人必须穿越之地的地点，会得到更多击杀。 |
| `high-ground` | 地形 | 击杀来自受害者所站地面之上。 |
| `cover` | 地形 | 在几何结构遮挡视线和火力的地方，单位时间内的死亡减少。 |
| `open-ground` | 地形 | 在没有遮挡视线和火力的地方，单位时间内的死亡增加。 |
| `kill-zone` | 地形 | 当移动被迫穿过可被观察、火力覆盖的地面时，死亡集中于此。 |
| `chokepoint` | 地形 | 许多人被挤过很小的一片地面，死亡集中在那里。 |
| `reverse-slope` | 地形 | 紧靠山脊或墙后，躲开敌人直接视线的安全位置。 |
| `safe-ground` | 地形 | 人们会在此停留一段时间，但很少有人死亡的地方。 |
| `obstacle` | 地形 | 路线绕过受阻地面，汇集成少数几条通道。 |
| `flank` | 机动 | 少有人走的路线，比主路带来更多击杀。 |
| `avenue-of-approach` | 机动 | 移动沿着区域之间的少数几条通道流动。 |
| `mobility` | 机动 | 移动的单位，单位时间内的死亡比慢速或静止的单位少（或多）。 |
| `static-exposure` | 机动 | 静止站立的单位，单位时间内的死亡比移动中的多。 |
| `interior-lines` | 机动 | 一方在各自交战之间的路线较短，其兵力转移速度快于对手。 |
| `envelopment` | 机动 | 击杀从多个方向落在一方的阵地上。 |
| `ambush` | 机动 | 沿路线移动的单位，很快被已在位置上的敌人击中。 |
| `spawn-pressure` | 时间 | 生命在某个出生点开始后不久就结束。 |
| `tempo` | 时间 | 节奏较快的一方先抵达战斗并在对手反应前得分。 |
| `surprise` | 时间 | 损失在受害者还击之前一阵涌来。 |
| `energy-advantage` | 空中 | 击杀者比受害者拥有更高的高度与速度。 |
| `air-superiority` | 空中 | 一方的飞机击杀数是其损失的许多倍。 |
| `sead` | 空中 | 地面防空在被发现并摧毁之前，会击落许多飞机。 |
| `bvr` | 空中 | 击杀发生在远距离，受害者还来不及接近。 |
| `fleet-salvo` | 海上 | 先打出一击的一方损失很小；另一方剩下的很少，无力还手。 |
| `scouting` | 海上 | 先发现对方的一方，决定交战方式。 |
| `urban-close` | 城市 | 交战距离短，密集的几何结构中死亡多，清剿速度慢。 |
| `vertical` | 城市 | 从楼上或屋顶向街道上的目标射击造成击杀。 |
| `skill-dispersion` | 人员 | 少数玩家占了很大比例的击杀或死亡。 |
| `ai-vs-player` | 人员 | 由 AI 控制的单位与同一地点的玩家表现不同。 |
| `balance` | 设计 | 阵营、出生点或兵种的起始机会不均。 |
| `economy` | 设计 | 赚取、支付和损失的资源集中在少数地点或玩家身上。 |
| `flow` | 设计 | 玩家如何穿行关卡：环路、通道、死胡同。 |
| `sightlines` | 设计 | 长视线决定交战从何处开始，以及谁能赢。 |
| `readability` | 设计 | 玩家看不到的死亡：从背后、从视野外而来。 |
| `formation` | 机动 | 一方的单位以可辨认的形状一起移动：横队、纵队、楔形、梯队、方阵。 |
| `frontal-assault` | 机动 | 一群人直接冲向敌人的正面。 |
| `double-envelopment` | 机动 | 两群人几乎同时打击同一敌群的两翼。 |
| `encirclement` | 机动 | 一群敌人被对方从四周包围，几乎无路可退。 |
| `penetration` | 机动 | 一群人穿过敌方防线，而敌人位于其两侧。 |
| `fire-and-maneuver` | 机动 | 一部分人移动，其余人停下掩护，角色交替进行。 |
| `feint` | 机动 | 小股部队把敌人引向一处；随后主力很快在别处发起攻击。 |
| `withdrawal` | 机动 | 正在接触的一群人转身撤开，拉开与敌人的距离。 |
| `pursuit` | 机动 | 一群人追赶正在远离的敌人，保持或缩短距离。 |
| `defence-in-depth` | 地形 | 防守方沿敌方进攻轴线，前后排列几道阵带。 |
| `screening` | 机动 | 一个小分队远远走在主力前面，最先遭遇敌人。 |
| `dispersion` | 兵力 | 一方随时间推移而分散开来；共处一地的单位变少。 |
| `missile-defence` | 空中 | 受导弹威胁的飞机把威胁转向机身侧面或尾部：crank、notch、drag、pump 等机动。 |
| `angles-fight` | 空中 | 低速、高转弯率的近距离空战，争夺机头位置而非能量。 |
| `cap` | 空中 | 飞机在固定位置上空盘旋数分钟，等待敌人到来。 |
| `strike-package` | 空中 | 不同职能的飞机一同飞往目标；有的攻击地面，有的掩护他们。 |
| `line-of-battle` | 海上 | 舰船排成纵队一艘接一艘航行，使所有舷侧火炮都能开火。 |
| `crossing-the-t` | 海上 | 一列纵队横穿敌方纵队的前端：己方全部火炮都能开火，敌方只有少数能还击。 |
| `fatal-funnel` | 城市 | 玩家进入某一门口、房间或通道时，在片刻间死亡的次数远多于进入其他地方。 |
| `crossfire` | 兵力 | 从不同角度交汇的火力线，使持有者赢得的对决多于单独一名持有者。 |
| `peeker-advantage` | 时间 | 先探身进入视野的玩家，与守着角度的对手对决，胜率高于（或低于）一半。 |
| `entry` | 时间 | 一回合的第一次击杀决定该回合的大部分结果；进攻手的胜负取决于位置和支援。 |
| `utility-support` | 兵力 | 对决前的闪光弹或烟雾弹，会改变谁赢得这场对决。 |
| `man-advantage` | 兵力 | 回合由存活人数较多的一方赢得，有的队伍会利用或浪费人数优势。 |
| `clutch` | 人员 | 最后存活的玩家，赢得的次数多于（或少于）回合局势所预测的次数。 |
| `action-value` | 人员 | 击杀、交换击杀、安放炸弹与道具，对赢得机会的改变程度各不相同。 |
| `lurk` | 机动 | 独自远离队伍的玩家，击杀（或死亡）的速率与大部队不同。 |
| `rotation` | 机动 | 一方转移玩家到战斗或目标处的速度，决定其能守住还是夺回。 |
| `collective-order` | 人员 | 一方的移动单位朝同一方向前进的次数，远多于按时间错开后的各自轨迹偶然会出现的次数。 |
| `milling` | 人员 | 一方的单位绕着共同中心打转：转动而没有净位移。 |
| `herding` | 人员 | 单位离开某处的方式，与其前一名队友相同；超出该处本身的几率，也超出模仿敌人的程度。 |
| `lane-formation` | 人员 | 相反方向的人流各走各的通道；移动集中在少数几条被反复使用的路径上。 |
| `crowding` | 人员 | 单位聚集时速度与流量下降；通过瓶颈时，越用力推进，通过的人反而越少。 |
| `leadership` | 人员 | 一些单位先转向，其他单位在几秒后跟着同一方向。 |
| `cohesion` | 人员 | 脱离群体的单位，比保持在群体中的单位死亡更多。 |
| `breaking-point` | 人员 | 一方损失了一部分实力后，便停止逼近并后撤，其程度超出其与敌人距离所能解释的范围。 |
| `panic` | 人员 | 面对突然的威胁，单位四散、加速逃开或僵住，协同随之瓦解。 |
| `loss-chasing` | 人员 | 一次损失之后，单位承担的风险多于（或少于）一次收获之后。 |
| `hot-hand` | 人员 | 成功跟随成功的次数，多于同一玩家打乱顺序的同样记录所允许的次数。 |
| `conformity` | 人员 | 一方的成员做出相同的选择（购买、装备、路线），超出各自的偏好。 |
| `suppression` | 人员 | 即使没有造成死亡，来袭的火力也会改变单位的移动与射击方式。 |
| `social-loafing` | 人员 | 队友越多，人均行动越少。 |
| `mixed-strategy` | 人员 | 本应不可预测的选择变得有规律：某一选项更常获胜，或选择按序列进行。 |
| `coordination` | 人员 | 成员无需明显指令即可步调一致：同步的移动、时机与选择。 |
| `contagion` | 人员 | 状态通过接触或邻近在单位之间传递，并在地图上扩散。 |
| `territoriality` | 人员 | 单位彼此保持距离，守住各自的地盘。 |
| `interaction-network` | 人员 | 谁与谁作战、支援、跟随，形成带有枢纽、集群与桥梁的网络。 |

### 概念（135）{#concepts-135}

| id | 标题 | 视角 | 模式 | 来源 |
|---|---|---|---|---|
| `concept.lanchester-square` | 兰彻斯特平方律（定向火力） | 军事, 空中, 海军, 电竞 | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | 兰彻斯特线性律（面状火力，一对一） | 军事, 城市, 电竞 | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | 兵力集中（质量） | 军事, 空中, 海军, 电竞 | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | 兵力比与 3:1 法则 | 军事 | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | 损失交换比 | 军事, 空中, 电竞, 设计 | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | 战斗力及其倍增因子 | 军事 | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | 现代兵力运用体系 | 军事 | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA 循环（观察-判断-决策-行动） | 军事, 空中, 电竞 | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | 能量机动理论 | 空中 | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | 基本战斗机动与空战机动 | 空中 | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | 地形分析：OAKOC / KOCOA | 军事, 设计, 城市 | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC：任务变量 | 军事 | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | 关键地形与决定性地形 | 军事, 设计, 电竞 | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | 观察与射界 | 军事, 设计, 电竞, 城市 | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | 掩护与隐蔽 | 军事, 城市, 设计 | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | 进攻通道与机动走廊 | 军事, 设计 | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | 瓶颈与隘口 | 军事, 设计, 电竞 | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | 交战区与杀伤区 | 军事, 城市, 设计 | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | 反斜坡防御与遮蔽 | 军事, 设计 | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | 高地 | 军事, 设计 | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | 内线与外线 | 军事 | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | 逐个击破 | 军事, 电竞 | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | 相互支援 | 军事, 空中, 电竞 | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | 诸兵种合成 | 军事, 设计 | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | 压制 | 军事, 城市 | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | 压制与摧毁敌防空（SEAD/DEAD） | 空中, 军事 | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | 空中战斗巡逻与制空 | 空中 | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | 视距外交战 | 空中 | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | 间接路线 | 军事, 电竞, 设计 | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | 包抄与合围 | 军事 | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | 伏击 | 军事, 电竞, 设计 | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | 纵深防御 | 军事 | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | 摩擦与战争迷雾 | 军事, 电竞 | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | 进攻的顶点 | 军事 | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | 突袭 | 军事, 空中, 海军, 电竞 | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | 兵力经济（次要方向用兵） | 军事, 电竞 | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | 城市地形 | 城市, 军事, 电竞 | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | 制海与决定性舰队战 | 海军 | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | 休斯齐射模型：有效地先发制人 | 海军, 空中 | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | 搜索与探测理论 | 海军, 空中, 军事 | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | 运筹学：效能指标 | 军事, 空中, 海军, 设计 | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | 作为分析手段的兵棋推演 | 军事, 设计 | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | 机动战 | 军事, 电竞 | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | 凝聚力与士气因素 | 军事 | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | 重心 | 军事 | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | 决定性点 | 军事, 电竞 | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | 作战线 | 军事 | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | 歼灭与消耗战略 | 军事 | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | 纵深作战 | 军事 | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | 空地一体战 | 军事, 空中 | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | 任务式指挥（Auftragstaktik） | 军事, 电竞 | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | 突破与扩张战果 | 军事 | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | 火力与机动 | 军事, 电竞 | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | 跃进掩护 | 军事, 电竞 | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | 侦察拉引与渗透 | 军事, 电竞 | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | 预备队 | 军事, 电竞 | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | 弹性防御与反击 | 军事 | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | 杀伤链（发现、定位、跟踪、瞄准、交战、评估） | 军事, 空中, 海军 | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | 探测距离与交战距离 | 空中, 海军, 军事 | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | 战斗效能值 | 军事, 电竞 | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | 战场分散 | 军事, 电竞 | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | 近距空中支援 | 空中, 军事 | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | 空中拦截 | 空中, 军事 | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | 护航与战斗机扫荡 | 空中 | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | 能量作战与盘旋作战 | 空中 | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | 领先、纯追踪与滞后追踪 | 空中 | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | 萨奇穿插（Thach weave） | 空中 | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | 指四编队与战斗对 | 空中 | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | 存在舰队 | 海军 | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | 横扫敌首（T 字横截） | 海军, 军事 | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | 护航运输 | 海军 | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | 反介入/区域拒止 | 海军, 空中, 军事 | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | 城区据点防御 | 城市, 军事 | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | 穿墙与穿楼移动 | 城市, 军事, 设计 | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | 围城 | 军事, 城市 | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | 游击战 | 军事, 城市 | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | 反叛乱 | 军事, 城市 | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | 庇护所 | 军事, 设计 | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | 欺骗（伪装，maskirovka） | 军事, 电竞 | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | 信息优势 | 军事, 电竞 | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | 经济回合与资源节奏 | 电竞, 设计 | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | 机动队形：横队、纵队、楔形、梯队 | 军事, 电竞 | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | 正面进攻 | 军事 | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | 双重包抄（钳形） | 军事 | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | 合围与包围圈 | 军事 | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | 突穿与突破 | 军事 | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | 追击 | 军事 | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | 后退：撤退、迟滞与退却 | 军事 | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | 佯攻与示威 | 军事, 电竞 | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | 掩护、警戒与侦察：主力之前的安全保障 | 军事 | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | 应对导弹：crank、notch、drag 与 pump | 空中 | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | 视距外编队：墙式、领头-跟随、绞杀、钳形 | 空中 | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | 角度作战与能量作战 | 空中 | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | 打击编队与压制的顺序 | 空中 | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | 战列线 | 海军 | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | 致命漏斗 | 城市, 军事, 电竞, 设计 | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | 清剿房间：突袭、速度与受控暴力 | 城市, 军事, 电竞 | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | 控制点 | 城市, 军事, 电竞 | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | 清扫拐角：切饼法 | 城市, 军事, 电竞 | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | 交叉火力与交错射界 | 军事, 城市, 电竞, 设计 | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | 探身者优势 | 电竞, 设计 | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | 淘汰回合中的人数优势 | 电竞, 军事 | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | 进攻与开局对决 | 电竞, 城市 | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | 进攻前的道具：闪光弹与烟雾弹 | 电竞, 城市, 军事 | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | 行人运动的社会力模型 | 设计, 城市, 军事 | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | 对向人流的通道形成 | 设计, 城市 | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | 越快越慢 | 设计, 城市, 军事 | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | 人群基本图 | 设计, 城市 | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | 踩出小径与期望路线 | 设计, 军事 | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | 恐慌很罕见：集体韧性 | 军事, 城市, 设计 | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids：分离、对齐、聚合 | 设计, 军事 | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | 序参量与集体运动的出现 | 设计, 军事, 空中, 海军 | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | 群集、打转与极化状态 | 设计, 军事, 海军 | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | 无信号的有效领导 | 军事, 电竞, 设计 | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | 按数量而非距离确定邻居 | 空中, 军事 | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | 群体智能 | 设计, 电竞, 军事 | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | 从众与信息级联 | 电竞, 设计, 军事 | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | 社会懈怠 | 电竞, 设计, 军事 | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | 责任分散 | 电竞, 军事 | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | 初级群体凝聚力 | 军事, 电竞 | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | 崩溃点与伤亡阈值 | 军事 | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | 压制：火力除杀伤之外的作用 | 军事, 城市 | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | 战斗决策中的恐惧与压力 | 军事, 电竞 | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | 高压下失常 | 电竞 | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | 前景理论与损失厌恶 | 电竞, 设计 | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | 保本与赌场资金效应 | 电竞 | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | 情绪上头（tilt） | 电竞 | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | 沉没成本 | 电竞, 军事 | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | 手感与其谬误 | 电竞 | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | 混合策略：保持不可预测 | 电竞, 设计, 军事 | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | 共享心智模型 | 电竞, 军事 | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | 团队合作的构成要素 | 电竞, 军事 | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | 作为行为实验室的虚拟世界 | 设计, 电竞 | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | 个人空间与领地 | 设计, 城市 | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | 互动网络：枢纽与弱连接 | 电竞, 设计 | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### 方法（37）{#methods-37}

| id | 标题 | 模式 | 来源 |
|---|---|---|---|
| `method.lanchester-fit` | 将兰彻斯特指数拟合到交战数据 | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | 按阵营与地点计算交换比 | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | 每次击杀时刻的局部兵力比 | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | 可视域：视线射界 | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | 击杀与死亡时的比能量（空中） | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | 跨比赛的热点持续性 | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | 交换击杀率（相互支援） | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | 交战与先发击杀的优势 | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | 死亡的空间自相关（莫兰指数） | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | 对照地图自身基线的比率，并控制 FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | 战场情报准备（IPB） | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | 成对比较评分模型（Elo、Glicko、TrueSkill） | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | 胜率与行动估值 | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | 空间控制与场地控制 | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | 对接触中的舰船拟合齐射方程 | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | 每作战小时的战斗效能比 | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | 探测到交战的距离与交战距离 | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | 杀伤链时机 | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | 分散度与击杀份额（时间上的兵力集中） | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | 每架次的损失率与击杀数 | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | 回合胜率模型 | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | 行动价值：增加的胜率 | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | 岭回归调整正负值（RAPM） | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | 收缩估计：经验贝叶斯 | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | 期望结果：从期望进球到期望对决 | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | 测量布置、轮转与潜伏 | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | 反射问题：模仿还是共同原因 | herding, conformity | Manski 1993 |
| `method.streak-correction` | 连续成功与有限序列修正 | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | 极化与打转的序参量 | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | 从时间滞后的朝向相关中找出领导者 | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | 路线级联检验的从众行为 | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | 通道分隔与小径的持续性 | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | 掉队风险 | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | 崩溃曲线 | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | 对来袭火力的反应 | suppression | Rowland 2006 |
| `method.risk-after-outcome` | 损失或收获之后的风险 | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | 购买一致性（Fleiss' kappa） | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### 历史案例（277）{#historical-cases-277}

| id | 案例 | 时间 | 规模 | 模式 | 来源 |
|---|---|---|---|---|---|
| `case.thermopylae` | 温泉关 | 公元前 480 年 | 战役 | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | 萨拉米斯 | 公元前 480 年 | 战役 | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | 马拉松 | 公元前 490 年 | 战役 | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | 留克特拉 | 公元前 371 年 | 战役 | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | 高加美拉 | 公元前 331 年 | 战役 | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | 特拉西梅诺湖 | 公元前 217 年 | 战斗 | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | 坎尼 | 公元前 216 年 | 战斗 | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | 条顿堡森林 | 公元 9 年 | 战斗 | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | 黑斯廷斯 | 1066 年 | 战斗 | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | 斯特灵桥 | 1297 年 | 战斗 | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | 阿金库尔 | 1415 年 | 战斗 | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | 洛伊滕 | 1757 年 | 战斗 | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | 奥斯特利茨 | 1805 年 | 战斗 | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | 特拉法尔加 | 1805 年 | 战斗 | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | 滑铁卢 | 1815 年 | 战斗 | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | 弗雷德里克斯堡：玛丽高地 | 1862 年 | 交战 | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | 葛底斯堡：小圆顶 | 1863 年 | 交战 | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | 葛底斯堡：皮克特冲锋 | 1863 年 | 交战 | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | 伊桑德尔瓦纳 | 1879 年 | 战斗 | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | 罗克渡口 | 1879 年 | 交战 | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | 坦能堡 | 1914 年 | 战局 | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | 索姆河，第一天 | 1916 年 7 月 1 日 | 战斗 | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | 凡尔登 | 1916 年 | 战局 | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | 日德兰 | 1916 年 | 战斗 | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | 苏奥穆萨尔米 | 1939–1940 年 | 战斗 | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | 色当与阿登 | 1940 年 5 月 | 战局 | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | 阿拉斯反击 | 1940 年 5 月 21 日 | 交战 | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | 不列颠之战 | 1940 年 7 月至 10 月 | 战局 | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | 大西洋之战：护航的运筹分析 | 1939–1945 年 | 战局 | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | 中途岛 | 1942 年 6 月 | 战斗 | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | 第二次阿拉曼 | 1942 年 10 月至 11 月 | 战斗 | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | 卡塞林山口 | 1943 年 2 月 | 战斗 | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | 斯大林格勒 | 1942 年 8 月至 1943 年 2 月 | 战局 | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | 库尔斯克 | 1943 年 7 月 | 战局 | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | 普罗霍罗夫卡 | 1943 年 7 月 12 日 | 交战 | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | 维勒博卡日 | 1944 年 6 月 13 日 | 交战 | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | 诺曼底树篱地带 | 1944 年 6 月至 7 月 | 战局 | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | 眼镜蛇行动 | 1944 年 7 月 | 战局 | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | 莱特湾 | 1944 年 10 月 | 战斗 | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | 巴斯托涅 | 1944 年 12 月 | 战斗 | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | 对马海峡 | 1905 年 5 月 | 战斗 | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | 仁川 | 1950 年 9 月 | 战局 | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | 米格走廊 | 1950–1953 年 | 战局 | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | 奠边府 | 1954 年 | 战斗 | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | 雅德朗河：X 射线着陆区 | 1965 年 11 月 | 交战 | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | 博洛行动 | 1967 年 1 月 2 日 | 交战 | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | 戈兰高地：泪谷 | 1973 年 10 月 | 战斗 | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | 西奈：中国农场 | 1973 年 10 月 | 战斗 | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | 贝卡谷地（鼹鼠蟋蟀 19 行动） | 1982 年 6 月 | 战斗 | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | 马岛空战 | 1982 年 5 月至 6 月 | 战局 | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | 沙漠风暴空中战役 | 1991 年 1 月至 2 月 | 战局 | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting（东经 73 线） | 1991 年 2 月 26 日 | 交战 | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | 摩加迪沙 | 1993 年 10 月 | 交战 | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | 格罗兹尼 | 1994 年 12 月至 1995 年 2 月 | 战斗 | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | 顺化 | 1968 年 1 月至 3 月 | 战斗 | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | 科索沃空中行动 | 1999 年 3 月至 6 月 | 战局 | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | 费卢杰（Al Fajr 行动） | 2004 年 11 月 | 战斗 | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | 摩苏尔 | 2016–2017 年 | 战局 | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | 卡叠石 | 约公元前 1274 年 | 战斗 | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | 伊苏斯 | 公元前 333 年 | 战斗 | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | 扎马 | 公元前 202 年 | 战斗 | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | 卡莱 | 公元前 53 年 | 战斗 | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | 法尔萨卢斯 | 公元前 48 年 | 战斗 | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | 阿德里安堡 | 公元 378 年 | 战斗 | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | 雅穆克 | 公元 636 年 | 战斗 | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | 曼齐克特 | 1071 年 | 战斗 | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | 哈廷 | 1187 年 | 战斗 | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | 班诺克本 | 1314 年 | 战斗 | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | 克雷西 | 1346 年 | 战斗 | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | 普瓦捷 | 1356 年 | 战斗 | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | 格伦瓦尔德（坦能堡） | 1410 年 | 战斗 | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | 布赖滕菲尔德 | 1631 年 | 战斗 | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | 布伦海姆 | 1704 年 | 战斗 | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | 波尔塔瓦 | 1709 年 | 战斗 | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | 罗斯巴赫 | 1757 年 | 战斗 | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | 萨拉托加 | 1777 年 | 战局 | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | 约克镇 | 1781 年 | 战斗 | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | 耶拿-奥尔施泰特 | 1806 年 | 战斗 | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | 博罗季诺 | 1812 年 | 战斗 | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | 莱比锡 | 1813 年 | 战斗 | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | 安蒂特姆 | 1862 年 | 战斗 | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | 钱斯勒斯维尔 | 1863 年 | 战斗 | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | 维克斯堡 | 1863 年 | 战局 | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | 柯尼希格雷茨（萨多瓦） | 1866 年 | 战斗 | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | 色当 | 1870 年 | 战斗 | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | 奉天 | 1905 年 | 战斗 | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | 恩图曼 | 1898 年 | 战斗 | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | 斯皮昂科普 | 1900 年 | 交战 | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | 加利波利 | 1915 年 | 战局 | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | 康布雷 | 1917 年 11 月 | 战斗 | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | 卡波雷托 | 1917 年 10 月至 11 月 | 战局 | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | 德军春季攻势（米夏埃尔行动） | 1918 年 3 月至 4 月 | 战局 | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | 亚眠 | 1918 年 8 月 | 战斗 | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | 诺门罕（哈勒欣河） | 1939 年 8 月 | 战斗 | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | 波兰战役 | 1939 年 9 月 | 战局 | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | 汉努特与让布卢 | 1940 年 5 月 | 战斗 | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | 斯托讷 | 1940 年 5 月 | 交战 | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | 敦刻尔克周边防线 | 1940 年 5 月至 6 月 | 战局 | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | 罗盘行动与贝达富姆 | 1940 年 12 月至 1941 年 2 月 | 战局 | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | 十字军行动与锡迪雷泽格 | 1941 年 11 月至 12 月 | 战局 | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | 加扎拉 | 1942 年 5 月至 6 月 | 战斗 | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | 阿拉姆哈勒法 | 1942 年 8 月至 9 月 | 战斗 | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | 杜布诺-布罗迪 | 1941 年 6 月 | 战斗 | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | 基辅合围 | 1941 年 9 月 | 战局 | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | 莫斯科 | 1941 年 10 月至 1942 年 1 月 | 战局 | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | 勒热夫与火星行动 | 1942 年 | 战局 | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | 第二次哈尔科夫 | 1942 年 5 月 | 战斗 | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | 第三次哈尔科夫（曼施泰因的回击） | 1943 年 2 月至 3 月 | 战局 | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | 巴格拉季昂行动 | 1944 年 6 月至 8 月 | 战局 | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | 科尔孙-切尔卡瑟包围圈 | 1944 年 1 月至 2 月 | 战斗 | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | 卡缅涅茨-波多利斯基包围圈 | 1944 年 3 月至 4 月 | 战局 | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | 埃普森行动 | 1944 年 6 月 | 战斗 | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | 古德伍德行动 | 1944 年 7 月 | 战斗 | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | 全面行动（Totalize） | 1944 年 8 月 | 战斗 | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | 莫尔坦 | 1944 年 8 月 | 战斗 | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | 法莱兹包围圈 | 1944 年 8 月 | 战局 | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | 市场花园与阿纳姆 | 1944 年 9 月 | 战局 | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | 亚琛 | 1944 年 10 月 | 战斗 | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | 许特根森林 | 1944 年 9 月至 1945 年 2 月 | 战局 | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | 阿拉库尔 | 1944 年 9 月 | 战斗 | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | 圣维特 | 1944 年 12 月 | 战斗 | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | 埃尔森博恩岭 | 1944 年 12 月 | 战斗 | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | 泽洛高地 | 1945 年 4 月 | 战斗 | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | 柏林 | 1945 年 4 月至 5 月 | 战斗 | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | 春醒行动 | 1945 年 3 月 | 战斗 | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | 奥尔托纳 | 1943 年 12 月 | 战斗 | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | 华沙起义 | 1944 年 8 月至 10 月 | 战局 | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | 塔拉瓦 | 1943 年 11 月 | 战斗 | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | 贝柳 | 1944 年 9 月至 11 月 | 战斗 | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | 硫磺岛 | 1945 年 2 月至 3 月 | 战斗 | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | 冲绳 | 1945 年 4 月至 6 月 | 战局 | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | 马尼拉 | 1945 年 2 月至 3 月 | 战斗 | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | 满洲（八月风暴） | 1945 年 8 月 | 战局 | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | 釜山环形防线 | 1950 年 8 月至 9 月 | 战局 | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | 长津湖 | 1950 年 11 月至 12 月 | 战局 | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | 临津江 | 1951 年 4 月 | 战斗 | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | 加平 | 1951 年 4 月 | 战斗 | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | 猪排山 | 1953 年 4 月和 7 月 | 交战 | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | 溪山 | 1968 年 1 月至 4 月 | 战斗 | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | 达托 | 1967 年 11 月 | 战斗 | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | 汉堡山（Ap Bia 山） | 1969 年 5 月 | 交战 | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | 阿布阿格拉-乌姆卡提夫 | 1967 年 6 月 | 战斗 | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | 伊斯梅利亚 | 1973 年 10 月 | 战斗 | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | 苏丹雅库卜 | 1982 年 6 月 | 交战 | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | 贝鲁特围城 | 1982 年 6 月至 8 月 | 战局 | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | 黎巴嫩 2006：宾特杰拜勒与反坦克威胁 | 2006 年 7 月至 8 月 | 战局 | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | 法奥 | 1986 年 2 月 | 战斗 | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | 巴士拉（卡尔巴拉-5） | 1987 年 1 月至 2 月 | 战斗 | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | 哈夫吉 | 1991 年 1 月至 2 月 | 战斗 | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | 目标诺福克 | 1991 年 2 月 26 日至 27 日 | 战斗 | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | 麦地那岭 | 1991 年 2 月 27 日 | 战斗 | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | 瓦迪巴廷佯攻 | 1991 年 2 月 | 战局 | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | 纳西里耶 | 2003 年 3 月 | 战斗 | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | 目标桃子 | 2003 年 4 月 | 交战 | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | 雷霆突进 | 2003 年 4 月 | 战斗 | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | 德贝卡山口 | 2003 年 4 月 | 交战 | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | 拉马迪 | 2006–2007 年 | 战局 | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | 萨德尔城 | 2008 年 3 月至 5 月 | 战斗 | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | 蟒蛇行动 | 2002 年 3 月 | 战斗 | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | 瓦纳特 | 2008 年 7 月 | 交战 | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | 卡姆德什（COP 基廷） | 2009 年 10 月 | 交战 | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | 穆萨卡拉与排屋 | 2006–2007 年 | 战局 | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | 阿尔及尔战役 | 1956–1957 年 | 战局 | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | 罗得西亚火力部队 | 1974–1979 年 | 战局 | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | 萨拉热窝围城 | 1992–1996 年 | 战局 | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | 格罗兹尼 1999–2000 年 | 1999 年 12 月至 2000 年 2 月 | 战斗 | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | 俄格战争 | 2008 年 8 月 | 战局 | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | 泽列诺皮利亚 | 2014 年 7 月 | 交战 | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | 伊洛瓦伊斯克 | 2014 年 8 月 | 战斗 | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | 德巴尔采沃 | 2015 年 1 月至 2 月 | 战斗 | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | 顿涅茨克机场 | 2014 年 9 月至 2015 年 1 月 | 战斗 | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | 霍斯托梅利机场 | 2022 年 2 月 | 交战 | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | 基辅方向与布罗瓦雷伏击 | 2022 年 3 月 | 交战 | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | 马里乌波尔与亚速钢厂 | 2022 年 2 月至 5 月 | 战斗 | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | 哈尔科夫反攻 | 2022 年 9 月 | 战局 | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | 比洛戈里夫卡的谢维尔斯基顿涅茨河渡口 | 2022 年 5 月 | 交战 | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | 巴赫穆特 | 2022 年 8 月至 2023 年 5 月 | 战斗 | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | 扎波罗热进攻 | 2023 年 6 月至 11 月 | 战局 | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | 纳戈尔诺-卡拉巴赫战争 | 2020 年 9 月至 11 月 | 战局 | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | 闪电战 | 1940 年 9 月至 1941 年 5 月 | 战局 | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | 巴巴罗萨：空中的第一天 | 1941 年 6 月 22 日 | 战斗 | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | 克里特 | 1941 年 5 月 | 战斗 | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | 马耳他围困 | 1940–1942 年 | 战局 | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | 斯大林格勒空运 | 1942 年 11 月至 1943 年 2 月 | 战局 | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | 库班上空的空战 | 1943 年 4 月至 6 月 | 战局 | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | 库尔斯克上空 | 1943 年 7 月 | 战斗 | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | 巴格拉季昂行动的空中战役 | 1944 年 6 月至 8 月 | 战局 | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | 普洛耶什蒂（"大潮行动"） | 1943 年 8 月 1 日 | 交战 | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | 水坝突袭（"迅雷行动"） | 1943 年 5 月 16 日至 17 日 | 交战 | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | 汉堡（"蛾摩拉行动"） | 1943 年 7 月至 8 月 | 战斗 | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | 施韦因富特-雷根斯堡 | 1943 年 8 月 17 日 | 战斗 | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | 第二次施韦因富特（"黑色星期四"） | 1943 年 10 月 14 日 | 交战 | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | 大周（"论据行动"） | 1944 年 2 月 | 战局 | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | 纽伦堡空袭 | 1944 年 3 月 30 日至 31 日 | 交战 | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | 博登普拉特行动 | 1945 年 1 月 1 日 | 战斗 | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | 俾斯麦海海战 | 1943 年 3 月 | 战斗 | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | 压制拉包尔 | 1943–1944 年 | 战局 | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | 菲律宾海（"马里亚纳火鸡射击"） | 1944 年 6 月 | 战斗 | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | 南市上空的"黑色星期二" | 1951 年 10 月 23 日 | 交战 | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | 滚雷行动 | 1965–1968 年 | 战局 | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | 清化大桥 | 1965–1972 年 | 交战 | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | 野鼬鼠（Wild Weasel）部队 | 1965–1973 年 | 战局 | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | 奥尔特报告与"壮志凌云"学校 | 1968–1972 年 | 战局 | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | 后卫行动 | 1972 年 5 月至 10 月 | 战局 | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | 后卫二号（"十一日战争"） | 1972 年 12 月 | 战局 | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | 焦点行动（Moked） | 1967 年 6 月 5 日 | 战斗 | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | 消耗战：导弹带 | 1969–1970 年 | 战局 | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | 运河上空的萨姆导弹伞 | 1973 年 10 月 | 战斗 | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | 奥西拉克（"歌剧行动"） | 1981 年 6 月 7 日 | 交战 | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | 黄金峡谷行动（El Dorado Canyon） | 1986 年 4 月 15 日 | 交战 | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | 两伊空战 | 1980–1988 年 | 战局 | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | 黑鹿行动 | 1982 年 5 月至 6 月 | 交战 | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | 即时雷霆：海湾空中战役的规划 | 1990 年 8 月至 1991 年 1 月 | 战局 | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | 诺曼底特遣队：首次阿帕奇打击 | 1991 年 1 月 17 日 | 交战 | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | 大猎飞毛腿 | 1991 年 1 月至 2 月 | 战局 | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | 穆特拉岭（"死亡公路"） | 1991 年 2 月 26 日至 27 日 | 交战 | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | 蟒蛇行动：沙希科特的阿帕奇 | 2002 年 3 月 | 战斗 | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | 卡尔巴拉的阿帕奇攻击 | 2003 年 3 月 24 日 | 交战 | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | 利比亚空中行动 | 2011 年 3 月至 10 月 | 战局 | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | 纳戈尔诺-卡拉巴赫：无人机与防空 | 2020 年 9 月至 11 月 | 战局 | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | 乌克兰：争夺的天空 | 2022 年 | 战局 | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | 霍斯托梅利机场 | 2022 年 2 月 | 交战 | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719（南越 719 行动） | 1971 年 2 月至 3 月 | 战局 | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | 鹰爪行动 | 1980 年 4 月 | 交战 | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | 阿富汗：毒刺导弹 | 1986–1989 年 | 战局 | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | 勒班陀 | 1571 年 | 战斗 | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | 西班牙无敌舰队 | 1588 年 | 战局 | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | 基伯龙湾 | 1759 年 | 战斗 | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | 切萨皮克（弗吉尼亚角） | 1781 年 | 战斗 | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | 尼罗河（阿布吉尔湾） | 1798 年 | 战斗 | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | 哥本哈根 | 1801 年 | 战斗 | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | 汉普顿锚地 | 1862 年 3 月 | 交战 | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | 利萨 | 1866 年 | 战斗 | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | 鸭绿江 | 1894 年 | 战斗 | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | 马尼拉湾 | 1898 年 | 战斗 | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | 黑尔戈兰湾 | 1914 年 8 月 | 战斗 | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | 科罗内尔与福克兰群岛 | 1914 年 11 月至 12 月 | 战局 | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | 多格滩 | 1915 年 1 月 | 战斗 | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | 拉普拉塔河 | 1939 年 12 月 | 战斗 | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | 塔兰托 | 1940 年 11 月 | 交战 | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | 马塔潘角 | 1941 年 3 月 | 战斗 | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | 丹麦海峡与俾斯麦号沉没 | 1941 年 5 月 | 战局 | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | 珍珠港 | 1941 年 12 月 7 日 | 交战 | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | 威尔士亲王号与反击号 | 1941 年 12 月 10 日 | 交战 | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | 爪哇海 | 1942 年 2 月 | 战斗 | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | 珊瑚海 | 1942 年 5 月 | 战斗 | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | 萨沃岛 | 1942 年 8 月 | 战斗 | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | 东所罗门群岛 | 1942 年 8 月 | 战斗 | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | 埃斯佩兰斯角 | 1942 年 10 月 | 战斗 | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | 圣克鲁斯群岛 | 1942 年 10 月 | 战斗 | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | 瓜达尔卡纳尔岛海战 | 1942 年 11 月 12 日至 15 日 | 战斗 | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | 塔萨法隆加 | 1942 年 11 月 | 交战 | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | 海峡突围 | 1942 年 2 月 | 交战 | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | 颈甲行动 | 1942 年 8 月 | 战斗 | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | 黑色五月 | 1943 年 5 月 | 战局 | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | 北角 | 1943 年 12 月 | 战斗 | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | 美国对日潜艇战役 | 1941–1945 年 | 战局 | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | 萨马岛附近 | 1944 年 10 月 25 日 | 战斗 | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | 苏里高海峡 | 1944 年 10 月 25 日 | 战斗 | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | 冲绳：神风特攻战役 | 1945 年 4 月至 6 月 | 战局 | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | 埃拉特号沉没 | 1967 年 10 月 | 交战 | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | 拉塔基亚 | 1973 年 10 月 | 战斗 | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | 贝尔格拉诺将军号沉没 | 1982 年 5 月 2 日 | 交战 | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | 谢菲尔德号的损失 | 1982 年 5 月 4 日 | 交战 | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | 美国海军"斯塔克"号 | 1987 年 5 月 17 日 | 交战 | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | 螳螂行动 | 1988 年 4 月 18 日 | 战斗 | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37（电竞经典时刻） | 2004 年 8 月 | 交战 | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu 革命（星际争霸） | 2007 年 3 月 | 战斗 | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | 2013 年 The International 上的"梦幻线圈" | 2013 年 8 月 | 交战 | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker 的 Zed 对阵 Ryu | 2013 年 9 月 | 交战 | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | 立交桥加速（The Overpass boost） | 2014 年 11 月 | 交战 | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Mirage 上跳跃的 AWP | 2016 年 4 月 | 交战 | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis 与道具时代 | 2018 年 | 战局 | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five 对阵 OG | 2019 年 4 月 | 战斗 | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar 达到大师级 | 2019 年 | 战局 | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | 左勾拳（沙漠风暴地面进攻） | 1991 年 2 月 24 日至 28 日 | 战局 | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | 腐化之血事件 | 2005 年 9 月 | 战局 | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### 游戏与关卡设计（17）{#game-and-level-design-17}

| id | 标题 | 模式 | 来源 |
|---|---|---|---|
| `design.chokepoint` | 关卡设计中的瓶颈 | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | 侧翼路线与替代路径 | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | 视线与交战距离 | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | 掩体布置与节奏 | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | 出生点设计与出生保护 | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | 对称与不对称地图的平衡 | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | 兵种平衡与克制 | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | 流动、环路与易读的布局 | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | 游戏经济与反馈循环 | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | 匹配与技能分布 | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | 作为关卡探针的 AI 对手 | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | 有意义的游戏与选择 | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | 射击游戏中的交换击杀与团队配合 | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | 地图控制 | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | 设计中的热力图与空间遥测 | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | 精通、学习与乐趣 | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | 回合经济与购买决策 | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### 研究（113）{#studies-113}

| id | 标题 | 来源 |
|---|---|---|
| `study.engel-1954` | Engel：硫磺岛上的兰彻斯特平方律 | Engel 1954 |
| `study.bracken-1995` | Bracken：阿登的兰彻斯特模型 | Bracken 1995 |
| `study.fricker-1998` | Fricker：重新审视阿登的消耗模型 | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas 与 Turkes：库尔斯克与阿登 | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley 与 Helmbold：验证平方律 | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | 玩家死亡的 GIS 分析 | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse：可视化竞技行为 | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | 评估《反恐精英》中的行动价值 | Xenopoulos et al. 2020 |
| `study.schubert-2016` | 电竞中的交战检测 | Schubert et al. 2016 |
| `study.red-baron` | 红男爵项目：越战中的空战 | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy：对历史战役的量化判断 | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle：兵力运用解释结果 | Biddle 2004 |
| `study.wallner-kriglstein-2013` | 游戏数据可视化综述 | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard：三个世纪陆战中的兰彻斯特 | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain：六十次第二次世界大战交战 | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss：作战模型与美国内战 | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley：消耗数据的统计模型 | Hartley 1995 |
| `study.helmbold-1995` | Helmbold：陆战中的推进速度 | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas 与 Dinges：环境比定律更重要 | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | 库尔斯克数据库 | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | 阿登战役数据库 | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson 与 MacKay：把不列颠之战当作兰彻斯特数据 | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte 与 Schmidt：数量仍然决定战役 | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy：战斗伤亡的规律 | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy 的战术数值确定性模型 | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence：用数字看战争 | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld：战斗力 | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter 与 Stam：民主国家的战争 | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein：适应性动态模型 | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman：兰彻斯特与游击战 | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong：随机齐射模型 | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes：舰队战术的基石 | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | 3:1 法则之争 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress：武装冲突建模 | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | 奥尔特报告：在包线之外发射的导弹 | Ault 1969; Michel 1997 |
| `study.gwaps` | 海湾战争空中力量调查 | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackett 的"马戏团" | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | 海岸司令部的深水炸弹设定 | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | 反潜飞机的白色机腹 | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald：给未被击中的返航轰炸机加装装甲 | Mangel & Samaniego 1984 |
| `study.optimal-search` | 最优搜索：从潜艇到 AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn：地狱中的战斗 | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | 反介入与区域拒止 | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | 玩家如何失去兴趣 | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | 对真实玩家行为进行聚类 | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | 检测玩家的挫败感 | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker：生产中的遥测仪表板 | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO：游戏的可视分析 | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | 《魔兽世界》战场中的角色移动 | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE：大规模用户测试的仪器化 | Kim et al. 2008 |
| `study.game-data-science` | 游戏数据科学 | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | 人工智能与游戏 | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Dota 2 中的技术与团队移动 | Drachen et al. 2014 |
| `study.yang-2014` | 可预测 MOBA 胜负的战斗模式 | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Dota 2 中的玩家角色 | Eggert et al. 2015 |
| `study.semenov-2017` | 从选角预测 Dota 2 的结果 | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | 职业电竞中的实时胜负预测 | Hodge et al. 2021 |
| `study.rioult-2014` | 玩家位置的拓扑 | Rioult et al. 2014 |
| `study.bednarek-2017` | 评估团队射击游戏中的玩家 | Bednárek et al. 2017 |
| `study.katona-2019` | 预测下一个死亡的是谁 | Katona et al. 2019 |
| `study.block-2018` | 面向电竞观众的数据故事 | Block et al. 2018 |
| `study.ggviz` | ggViz：大规模搜索游戏状态 | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five：Dota 2 中的大规模强化学习 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar：星际争霸 II 的大师级水平 | Vinyals et al. 2019 |
| `study.cervone-2016` | 篮球中的预期控球价值 | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP：足球中对持球动作的估值 | Decroos et al. 2019 |
| `study.pitch-control` | 场地控制与空间创造 | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | 防守技能的空间结构 | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | 从跟踪数据中识别团队角色 | Lucey et al. 2013 |
| `study.shot-quality` | 预期进球与射门质量 | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision：空间投篮效率 | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | 团队运动的时空分析 | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley 的 K 函数：各尺度上的聚集 | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark 与 Evans：最近邻分散 | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord 热点 | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | 空间关联的局部指标 | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | 空间扫描统计量 | Kulldorff 1997 |
| `study.kde` | 核密度估计 | Silverman 1986 |
| `study.knox-1964` | 时空交互 | Knox 1964; Diggle 2013 |
| `study.maup` | 可修改面积单元问题 | Openshaw 1984; Tobler 1970 |
| `study.isovists` | 等视域与可见性图 | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | 空间句法 | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | 平均拥挤度 | Lloyd 1967 |
| `study.survival-analysis` | 死亡时间的生存分析 | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | 计数数据的广义线性模型 | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | 自助法与区间估计 | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey 等：延迟与探身者优势 | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee 与 Chang：转角射击 | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool：延迟与玩家动作 | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos 等：通过胜率看职业与业余选手 | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos 等：《反恐精英》中的经济决策 | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin：聪明的击杀与无价值的死亡 | Maymin 2021 |
| `study.moba-live-prediction` | MOBA 的实时结果预测 | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa 等：从战术特征看 Valorant 的回合 | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv 等：职业《反恐精英 2》中的角色 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim 等：训练近距离作战 | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | 2006 年麦加朝觐中的人群湍流 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | 步行群体如何塑造人群 | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | 鸽群中的层级群体动力学 | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | 社会影响使成功不平等且难以预测 | Salganik et al. 2006 |
| `study.wisdom-undermined` | 社会影响削弱群体智慧 | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | 人群的吸引力 | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | 从众于一致的多数 | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | 《他们为何而战》：伊拉克的战斗动机 | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | 凝聚力与表现：元分析 | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | 职业高尔夫球手中的损失厌恶 | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | 棒球中的手感 | Green & Zwiebel 2018 |
| `study.penalty-kicks` | 点球：职业球员采用极小化极大策略 | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | 温布尔登的极小化极大打法 | Walker & Wooders 2001 |
| `study.collective-intelligence` | 团队的集体智慧 | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | 网络世界的社交网络 | Szell et al. 2010 |
| `study.team-networks` | 传球网络与团队表现 | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | 行为通过聚集的网络传播 | Centola 2010 |

### 参考文献 {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *（已核对 2026-11-15：细节）*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *（已核对 2026-11-15：细节）*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *（已核对 2026-11-15：细节）*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *（已核对 2026-11-15：细节）*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *（公有领域）* *（已核对 2026-11-15：细节）*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *（已核对 2026-11-15：细节）*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *（已核对 2026-11-15：细节）*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *（已核对 2026-11-15：细节）*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *（已核对 2026-11-15：细节）*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *（公有领域）* *（已核对 2026-11-15：细节）*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *（已核对 2026-11-15：细节）*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *（已核对 2026-11-15：细节）*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *（公有领域）* *（已核对 2026-11-15：存在）*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *（公有领域）* *（已核对 2026-11-15：细节）*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *（已核对 2026-11-15：细节）*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *（已核对 2026-11-15：细节）*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *（已核对 2026-11-15：细节）*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *（已核对 2026-11-15：细节）*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *（已核对 2026-11-15：细节）*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *（已核对 2026-11-15：细节）*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *（已核对 2026-11-15：细节）*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *（已核对 2026-11-15：细节）*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *（已核对 2026-11-15：细节）*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *（已核对 2026-11-15：细节）*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *（已核对 2026-11-15：细节）*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *（已核对 2026-11-15：细节）*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *（已核对 2026-11-15：细节）*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *（已核对 2026-11-15：细节）*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *（已核对 2026-11-15：细节）*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *（已核对 2026-11-15：细节）*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *（已核对 2026-11-15：细节）*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *（已核对 2026-11-15：存在）*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *（已核对 2026-11-15：细节）*
- Beevor, A. (1998). Stalingrad. Viking, London. *（已核对 2026-11-15：细节）*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *（已核对 2026-11-15：细节）*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *（已核对 2026-11-15：细节）*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *（已核对 2026-11-15：细节）*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *（已核对 2026-11-15：细节）*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *（已核对 2026-11-15：存在）*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *（已核对 2026-11-15：细节）*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *（已核对 2026-11-15：细节）*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *（已核对 2026-11-15：细节）*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *（已核对 2026-11-15：细节）*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *（已核对 2026-11-15：细节）*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *（已核对 2026-11-15：细节）*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *（已核对 2026-11-15：存在）*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *（已核对 2026-11-15：细节）*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *（已核对 2026-11-15：细节）*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *（已核对 2026-11-15：细节）*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *（已核对 2026-11-15：细节）*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *（已核对 2026-11-15：存在）*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *（已核对 2026-11-15：细节）*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *（已核对 2026-11-15：细节）*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *（已核对 2026-11-15：细节）*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *（已核对 2026-11-15：细节）*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *（已核对 2026-11-15：存在）*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *（已核对 2026-11-15：细节）*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *（已核对 2026-11-15：细节）*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *（已核对 2026-11-15：细节）*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *（公有领域）* *（已核对 2026-11-15：细节）*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *（已核对 2026-11-15：细节）*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *（已核对 2026-11-15：细节）*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *（已核对 2026-11-15：细节）*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *（已核对 2026-11-15：细节）*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *（已核对 2026-11-15：细节）*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *（已核对 2026-11-15：细节）*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *（已核对 2026-11-15：细节）*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *（已核对 2026-11-15：细节）*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *（已核对 2026-11-15：细节）*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *（公有领域）* *（已核对 2026-11-15：细节）*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *（已核对 2026-11-15：细节）*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *（已核对 2026-11-15：细节）*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *（公有领域）* *（已核对 2026-11-15：存在）*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *（已核对 2026-11-15：细节）*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *（已核对 2026-11-15：细节）*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *（已核对 2026-11-15：细节）*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *（公有领域）* *（已核对 2026-11-15：细节）*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *（已核对 2026-11-15：细节）*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *（已核对 2026-11-15：细节）*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *（已核对 2026-11-15：细节）*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *（已核对 2026-11-15：细节）*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *（公有领域）* *（已核对 2026-11-15：细节）*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *（公有领域）* *（已核对 2026-11-15：细节）*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *（已核对 2026-11-15：存在）*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *（已核对 2026-11-15：细节）*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *（已核对 2026-11-15：细节）*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *（已核对 2026-11-15：细节）*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *（已核对 2026-11-15：存在）*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *（已核对 2026-11-15：存在）*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *（已核对 2026-11-15：细节）*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *（已核对 2026-11-15：细节）*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *（已核对 2026-11-15：细节）*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *（已核对 2026-11-15：存在）*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *（已核对 2026-11-15：细节）*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *（已核对 2026-11-15：细节）*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *（已核对 2026-11-15：细节）*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *（已核对 2026-11-15：细节）*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *（已核对 2026-11-15：细节）*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *（已核对 2026-11-15：存在）*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *（公有领域）* *（已核对 2026-11-15：存在）*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *（已核对 2026-11-15：细节）*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *（已核对 2026-11-15：细节）*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *（已核对 2026-11-15：细节）*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *（已核对 2026-11-15：细节）*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *（已核对 2026-11-15：细节）*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *（已核对 2026-11-15：细节）*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *（已核对 2026-11-15：细节）*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *（已核对 2026-11-15：存在）*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *（已核对 2026-11-15：细节）*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *（已核对 2026-11-15：细节）*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *（已核对 2026-11-15：细节）*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *（已核对 2026-11-15：细节）*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *（已核对 2026-11-15：细节）*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *（已核对 2026-11-15：细节）*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *（已核对 2026-11-15：细节）*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *（公有领域）* *（已核对 2026-11-15：细节）*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *（已核对 2026-11-15：细节）*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *（已核对 2026-11-15：细节）*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *（已核对 2026-11-15：存在）*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *（已核对 2026-11-15：细节）*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *（已核对 2026-11-15：细节）*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *（已核对 2026-11-15：细节）*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *（已核对 2026-11-15：细节）*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *（已核对 2026-11-15：细节）*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *（已核对 2026-11-15：细节）*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *（已核对 2026-11-15：细节）*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *（已核对 2026-11-15：细节）*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *（已核对 2026-11-15：细节）*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *（已核对 2026-11-15：细节）*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *（已核对 2026-11-15：细节）*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *（已核对 2026-11-15：细节）*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *（已核对 2026-11-15：细节）*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *（已核对 2026-11-15：细节）*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *（已核对 2026-11-15：细节）*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *（已核对 2026-11-15：细节）*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *（已核对 2026-11-15：细节）*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *（已核对 2026-11-15：细节）*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *（已核对 2026-11-15：存在）*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *（已核对 2026-11-15：细节）*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *（已核对 2026-11-15：细节）*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *（已核对 2026-11-15：细节）*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *（已核对 2026-11-15：细节）*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *（已核对 2026-11-15：细节）*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *（已核对 2026-11-15：细节）*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *（已核对 2026-11-15：细节）*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *（已核对 2026-11-15：细节）*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *（已核对 2026-11-15：细节）*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *（已核对 2026-11-15：细节）*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *（已核对 2026-11-15：细节）*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *（已核对 2026-11-15：细节）*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *（已核对 2026-11-15：细节）*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *（已核对 2026-11-15：细节）*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *（公有领域）* *（已核对 2026-11-15：存在）*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *（已核对 2026-11-15：细节）*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *（已核对 2026-11-15：细节）*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *（已核对 2026-11-15：细节）*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *（已核对 2026-11-15：细节）*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *（已核对 2026-11-15：细节）*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *（已核对 2026-11-15：细节）*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *（已核对 2026-11-15：细节）*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *（已核对 2026-11-15：细节）*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *（已核对 2026-11-15：细节）*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *（已核对 2026-11-15：细节）*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *（已核对 2026-11-15：细节）*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *（已核对 2026-11-15：细节）*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *（已核对 2026-11-15：细节）*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *（已核对 2026-11-15：细节）*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *（已核对 2026-11-15：细节）*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *（已核对 2026-11-15：细节）*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *（已核对 2026-11-15：细节）*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *（已核对 2026-11-15：细节）*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *（已核对 2026-11-15：细节）*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *（已核对 2026-11-15：细节）*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *（已核对 2026-11-15：细节）*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *（已核对 2026-11-15：细节）*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *（已核对 2026-11-15：细节）*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *（已核对 2026-11-15：细节）*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *（已核对 2026-11-15：细节）*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *（已核对 2026-11-15：细节）*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *（已核对 2026-11-15：细节）*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *（已核对 2026-11-15：细节）*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *（已核对 2026-11-15：细节）*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *（已核对 2026-11-15：细节）*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *（已核对 2026-11-15：细节）*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *（公有领域）* *（已核对 2026-11-15：细节）*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *（公有领域）* *（已核对 2026-11-15：细节）*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *（公有领域）* *（已核对 2026-11-15：存在）*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *（公有领域）* *（已核对 2026-11-15：细节）*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *（公有领域）* *（已核对 2026-11-15：细节）*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *（已核对 2026-11-15：细节）*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *（已核对 2026-11-15：细节）*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *（已核对 2026-11-15：细节）*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *（已核对 2026-11-15：细节）*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *（已核对 2026-11-15：细节）*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *（已核对 2026-11-15：细节）*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *（已核对 2026-11-15：细节）*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *（已核对 2026-11-15：细节）*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *（已核对 2026-11-15：存在）*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *（公有领域）* *（已核对 2026-11-15：存在）*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *（已核对 2026-11-15：细节）*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *（已核对 2026-11-15：细节）*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *（已核对 2026-11-15：细节）*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *（已核对 2026-11-15：细节）*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *（已核对 2026-11-15：细节）*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *（已核对 2026-11-15：细节）*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *（已核对 2026-11-15：细节）*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *（已核对 2026-11-15：细节）*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *（已核对 2026-11-15：细节）*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *（已核对 2026-11-15：细节）*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *（已核对 2026-11-15：细节）*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *（已核对 2026-11-15：细节）*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *（已核对 2026-11-15：细节）*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *（已核对 2026-11-15：细节）*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *（已核对 2026-11-15：细节）*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *（已核对 2026-11-15：细节）*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *（已核对 2026-11-15：细节）*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *（公有领域）* *（已核对 2026-11-15：细节）*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *（已核对 2026-11-15：细节）*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *（已核对 2026-11-15：细节）*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *（已核对 2026-11-15：细节）*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *（已核对 2026-11-15：细节）*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *（已核对 2026-11-15：细节）*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *（已核对 2026-11-15：存在）*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *（已核对 2026-11-15：细节）*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *（已核对 2026-11-15：细节）*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *（已核对 2026-11-15：细节）*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *（已核对 2026-11-15：细节）*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *（已核对 2026-11-15：细节）*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *（已核对 2026-11-15：细节）*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *（已核对 2026-11-15：细节）*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *（已核对 2026-11-15：细节）*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *（已核对 2026-11-15：细节）*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *（已核对 2026-11-15：细节）*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *（已核对 2026-11-15：细节）*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *（已核对 2026-11-15：细节）*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *（已核对 2026-11-15：细节）*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *（已核对 2026-11-15：存在）*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *（已核对 2026-11-15：细节）*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *（已核对 2026-11-15：细节）*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *（已核对 2026-11-15：细节）*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *（已核对 2026-11-15：细节）*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *（已核对 2026-11-15：细节）*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *（公有领域）* *（已核对 2026-11-15：细节）*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *（已核对 2026-11-15：细节）*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *（已核对 2026-11-15：细节）*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *（已核对 2026-11-15：细节）*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *（已核对 2026-11-15：细节）*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *（公有领域）* *（已核对 2026-11-15：存在）*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *（已核对 2026-11-15：细节）*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *（已核对 2026-11-15：存在）*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *（已核对 2026-11-15：细节）*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *（已核对 2026-11-15：细节）*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *（已核对 2026-11-15：细节）*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *（已核对 2026-11-15：细节）*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *（已核对 2026-11-15：细节）*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *（已核对 2026-11-15：存在）*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *（已核对 2026-11-15：细节）*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *（已核对 2026-11-15：细节）*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *（已核对 2026-11-15：细节）*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *（已核对 2026-11-15：细节）*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *（已核对 2026-11-15：细节）*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *（公有领域）* *（已核对 2026-11-15：细节）*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *（公有领域）* *（已核对 2026-11-15：细节）*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *（已核对 2026-11-15：存在）*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *（已核对 2026-11-15：细节）*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *（已核对 2026-11-15：细节）*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *（已核对 2026-11-15：细节）*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *（已核对 2026-11-15：细节）*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *（已核对 2026-11-15：存在）*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *（已核对 2026-11-15：细节）*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *（已核对 2026-11-15：细节）*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *（已核对 2026-11-15：细节）*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *（公有领域）* *（已核对 2026-11-15：细节）*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *（已核对 2026-11-15：细节）*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *（已核对 2026-11-15：细节）*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *（已核对 2026-11-15：细节）*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *（已核对 2026-11-15：细节）*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *（已核对 2026-11-15：细节）*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *（已核对 2026-11-15：细节）*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *（已核对 2026-11-15：细节）*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *（已核对 2026-11-15：存在）*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *（已核对 2026-11-15：细节）*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *（已核对 2026-11-15：细节）*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *（已核对 2026-11-15：细节）*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *（已核对 2026-11-15：细节）*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *（已核对 2026-11-15：细节）*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *（已核对 2026-11-15：细节）*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *（已核对 2026-11-15：细节）*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *（已核对 2026-11-15：细节）*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *（已核对 2026-11-15：细节）*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *（已核对 2026-11-15：细节）*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *（已核对 2026-11-15：存在）*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *（已核对 2026-11-15：存在）*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *（已核对 2026-11-15：细节）*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *（已核对 2026-11-15：细节）*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *（已核对 2026-11-15：细节）*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *（已核对 2026-11-15：细节）*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *（已核对 2026-11-15：细节）*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *（已核对 2026-11-15：存在）*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *（已核对 2026-11-15：存在）*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *（已核对 2026-11-15：细节）*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *（已核对 2026-11-15：细节）*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *（已核对 2026-11-15：存在）*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *（已核对 2026-11-15：细节）*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *（公有领域）* *（已核对 2026-11-15：细节）*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *（已核对 2026-11-15：细节）*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *（已核对 2026-11-15：细节）*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *（已核对 2026-11-15：细节）*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *（已核对 2026-11-15：细节）*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *（公有领域）* *（已核对 2026-11-15：细节）*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *（已核对 2026-11-15：细节）*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *（已核对 2026-11-15：细节）*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *（已核对 2026-11-15：细节）*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *（已核对 2026-11-15：细节）*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *（已核对 2026-11-15：细节）*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *（已核对 2026-11-15：细节）*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *（已核对 2026-11-15：细节）*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *（已核对 2026-11-15：细节）*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *（已核对 2026-11-15：细节）*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *（已核对 2026-11-15：存在）*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *（已核对 2026-11-15：细节）*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *（已核对 2026-11-15：细节）*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *（已核对 2026-11-15：细节）*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *（已核对 2026-11-15：细节）*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *（已核对 2026-11-15：细节）*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *（已核对 2026-11-15：细节）*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *（已核对 2026-11-15：细节）*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *（已核对 2026-11-15：细节）*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *（已核对 2026-11-15：细节）*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *（已核对 2026-11-15：细节）*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *（已核对 2026-11-15：细节）*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *（已核对 2026-11-15：细节）*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *（已核对 2026-11-15：细节）*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *（已核对 2026-11-15：细节）*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *（已核对 2026-11-15：细节）*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *（已核对 2026-11-15：细节）*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *（已核对 2026-11-15：细节）*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *（已核对 2026-11-15：细节）*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *（已核对 2026-11-15：细节）*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *（已核对 2026-11-15：细节）*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *（已核对 2026-11-15：细节）*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *（公有领域）* *（已核对 2026-11-15：存在）*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *（已核对 2026-11-15：细节）*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *（已核对 2026-11-15：细节）*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *（已核对 2026-11-15：细节）*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *（已核对 2026-11-15：细节）*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *（已核对 2026-11-15：细节）*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *（已核对 2026-11-15：细节）*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *（已核对 2026-11-15：细节）*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *（已核对 2026-11-15：细节）*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *（已核对 2026-11-15：细节）*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *（已核对 2026-11-15：细节）*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *（已核对 2026-11-15：细节）*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *（已核对 2026-11-15：细节）*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *（已核对 2026-11-15：细节）*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *（已核对 2026-11-15：细节）*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *（已核对 2026-11-15：细节）*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *（已核对 2026-11-15：细节）*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *（已核对 2026-11-15：细节）*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *（已核对 2026-11-15：细节）*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *（已核对 2026-11-15：细节）*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *（已核对 2026-11-15：细节）*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *（已核对 2026-11-15：细节）*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *（公有领域）* *（已核对 2026-11-15：细节）*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *（已核对 2026-11-15：细节）*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *（已核对 2026-11-15：存在）*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *（已核对 2026-11-15：存在）*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *（已核对 2026-11-15：存在）*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *（已核对 2026-11-15：存在）*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *（已核对 2026-11-15：细节）*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *（已核对 2026-11-15：细节）*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *（已核对 2026-11-15：细节）*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *（已核对 2026-11-15：细节）*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *（已核对 2026-11-15：细节）*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *（已核对 2026-11-15：细节）*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *（已核对 2026-11-15：细节）*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *（已核对 2026-11-15：细节）*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *（已核对 2026-11-15：存在）*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *（已核对 2026-11-15：细节）*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *（已核对 2026-11-15：细节）*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *（已核对 2026-11-15：细节）*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *（已核对 2026-11-15：细节）*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *（已核对 2026-11-15：存在）*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *（已核对 2026-11-15：细节）*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *（已核对 2026-11-15：存在）*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *（已核对 2026-11-15：细节）*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *（已核对 2026-11-15：细节）*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *（已核对 2026-11-15：细节）*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *（公有领域）* *（已核对 2026-11-15：细节）*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *（已核对 2026-11-15：细节）*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *（已核对 2026-11-15：存在）*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *（已核对 2026-11-15：细节）*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *（已核对 2026-11-15：细节）*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *（已核对 2026-11-15：细节）*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *（已核对 2026-11-15：细节）*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *（已核对 2026-11-15：细节）*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *（已核对 2026-11-15：细节）*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *（已核对 2026-11-15：细节）*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *（已核对 2026-11-15：细节）*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *（已核对 2026-11-15：细节）*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *（已核对 2026-11-15：细节）*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *（已核对 2026-11-15：细节）*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *（已核对 2026-11-15：存在）*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *（公有领域）* *（已核对 2026-11-15：细节）*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *（已核对 2026-11-15：细节）*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *（已核对 2026-11-15：细节）*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *（已核对 2026-11-15：细节）*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *（已核对 2026-11-15：细节）*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *（已核对 2026-11-15：细节）*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *（已核对 2026-11-15：细节）*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *（已核对 2026-11-15：细节）*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *（已核对 2026-11-15：细节）*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *（已核对 2026-11-15：细节）*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *（已核对 2026-11-15：细节）*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *（已核对 2026-11-15：细节）*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *（已核对 2026-11-15：细节）*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *（已核对 2026-11-15：细节）*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *（已核对 2026-11-15：细节）*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *（已核对 2026-11-15：细节）*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *（已核对 2026-11-15：细节）*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *（已核对 2026-11-15：细节）*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *（已核对 2026-11-15：细节）*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *（已核对 2026-11-15：细节）*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *（已核对 2026-11-15：细节）*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *（已核对 2026-11-15：存在）*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *（公有领域）* *（已核对 2026-11-15：存在）*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *（已核对 2026-11-15：细节）*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *（公有领域）* *（已核对 2026-11-15：存在）*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *（公有领域）* *（已核对 2026-11-15：细节）*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *（已核对 2026-11-15：细节）*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *（已核对 2026-11-15：细节）*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *（已核对 2026-11-15：细节）*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *（已核对 2026-11-15：细节）*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *（已核对 2026-11-15：细节）*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *（已核对 2026-11-15：细节）*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *（已核对 2026-11-15：细节）*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *（已核对 2026-11-15：细节）*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *（已核对 2026-11-15：存在）*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *（已核对 2026-11-15：细节）*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *（已核对 2026-11-15：存在）*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *（已核对 2026-11-15：存在）*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *（已核对 2026-11-15：细节）*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *（已核对 2026-11-15：存在）*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *（已核对 2026-11-15：细节）*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *（已核对 2026-11-15：细节）*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *（已核对 2026-11-15：细节）*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *（已核对 2026-11-15：细节）*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *（公有领域）* *（已核对 2026-11-15：细节）*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *（已核对 2026-11-15：细节）*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *（公有领域）* *（已核对 2026-11-15：细节）*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *（公有领域）* *（已核对 2026-11-15：细节）*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *（已核对 2026-11-15：存在）*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *（已核对 2026-11-15：细节）*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *（公有领域）* *（已核对 2026-11-15：细节）*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *（已核对 2026-11-15：细节）*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *（公有领域）* *（已核对 2026-11-15：细节）*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *（已核对 2026-11-15：细节）*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *（已核对 2026-11-15：细节）*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *（公有领域）* *（已核对 2026-11-15：细节）*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *（已核对 2026-11-15：细节）*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *（已核对 2026-11-15：细节）*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *（已核对 2026-11-15：细节）*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *（已核对 2026-11-15：存在）*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *（已核对 2026-11-15：细节）*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *（已核对 2026-11-15：存在）*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *（已核对 2026-11-15：存在）*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *（已核对 2026-11-15：细节）*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *（已核对 2026-11-15：细节）*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *（已核对 2026-11-15：细节）*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *（已核对 2026-11-15：细节）*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *（已核对 2026-11-15：细节）*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *（已核对 2026-11-15：细节）*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *（已核对 2026-11-15：细节）*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *（已核对 2026-11-15：细节）*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *（已核对 2026-11-15：细节）*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *（已核对 2026-11-15：细节）*

<!-- kb:end -->
