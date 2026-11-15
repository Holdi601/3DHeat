---
title: "移动速度"
parent: "战术面板"
nav_order: 1
lang: "zh"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---


# 移动速度

一名士兵、一辆坦克或一架喷气机从 A 点到 B 点要多久？本页说明战术面板上每个图形的移动速度，以及这些数字的来源，使你能够信任计划中的时间，或按需更改它们。

[战术面板](tactics-board.md)会根据每个图形的移动速度来计算计划的时间。这些速度来自 `src/tactics/speeds/` 中每个游戏的一个文件：为每个类别（步兵、地面载具、船只、飞机、直升机）的每种移动模式提供一个速度，并附带命名的配置，例如每种 CS2 武器一个、每种飞机类型一个。每个文件都列出了它的来源，每个数值都会说明它是**官方**的（游戏自身的数据，或真实飞机公布的数据），还是**近似**的（社区测量或典型值）。

这些只是起点。**每个图形都可以在面板上覆盖其速度**，因此一份计划可以使用实测速度、负重的士兵或受损的坦克。

## 模式 {#modes}

| 类别 | 模式 |
|---|---|
| 步兵 | 匍匐（俯卧）、蹲行、行走（缓慢、安静的步行）、跑步（默认移动）、冲刺 |
| 地面载具、船只 | 匍匐、谨慎、正常（越野）、冲刺（道路最高速度） |
| 飞机、直升机 | 慢速（进近、盘旋、悬停滑行）、巡航、战斗（转弯速度或攻击俯冲）、最大 |

游戏中没有的模式会留空：CS2 和无畏契约没有冲刺，也没有匍匐。

## 坡度 {#slopes}

每个文件还说明游戏如何处理坡度。CS2、无畏契约和 Squad 会限制水平速度，因此坡度不会让玩家减速。Arma 会让步兵在坡上减速，因此它的文件和通用文件使用托布勒徒步函数。战地和载具模拟器使用简单的坡度惩罚。

## 各游戏 {#per-game}

**反恐精英 2**（单位每秒；一个单位按一英寸计）。**官方。** 跑步速度取自游戏武器定义中的 `m_flMaxSpeed` 值：刀和 C4 为 250，手榴弹为 245，手枪为 240（沙漠之鹰 230，R8 180），冲锋枪为 220 到 240，步枪为 210 到 225，AWP 为 200，轻机枪为 195 和 150。开镜的 AWP（100）、AUG 和 SG 553（150）以及 G3SG1 和 SCAR-20（120）有各自的配置。行走为跑步的 × 0.52，蹲行为跑步的 × 0.34。Valve 没有公布这两个乘数，但每把武器都在录像中体现了它们。要用真实移动来核对计划，请在同一张地图上载入一场录像，并比较玩家的速度。

**无畏契约**（米每秒）。刀的速度为 6.75 m/s。每把武器都把它乘以游戏数据中的跑步速度乘数，从而得到游戏内武库中显示的速度：大多数副武器和冲锋枪为 5.73，步枪为 5.4，重型武器和“操作员”为 5.13，霰弹枪为 5.06。这些跑步速度是精确的。行走和蹲行速度是**估计值**（跑步的 0.55 和 0.4 倍），因为 Riot 没有公布它们。开镜狙击手的配置同样是估计值。

**战地**（千米每小时）。**近似。** EA 没有公布任何移动数值。步兵：匍匐约 1 m/s，蹲行 2，跑步 4，冲刺 6.4。载具、喷气机、直升机和船只采用各自类别的典型游戏内速度。

**Squad**（千米每小时）。**近似。** 跑步（3.3 m/s）和冲刺（5.9 m/s）来自一篇关于游戏机制的社区文章。匍匐、蹲行和慢走是估计值，每个载具类别和直升机也是估计值。

**Arma**（千米每小时）。**近似。** 步兵的步速是社区测得的：步行约 5 km/h，蹲下的战术步速 9 km/h，慢跑 15 km/h，冲刺约 21 km/h。载具的最高速度是每个类别中原版 Arma 3 载具的配置最大值，来自第三方列表。较慢的载具模式是估计值。

**DCS / 战争雷霆 / IL-2**（千米每小时）。调色板中的每架飞机和直升机都有自己的配置。巡航速度和最大速度是真实飞机**公布的数据**，这些模拟器对此建模非常接近。最大速度，喷气机取海平面，螺旋桨飞机取额定高度，每个配置的说明会注明所用的是哪一个。慢速和战斗速度是典型值。地面载具使用真实载具公布的道路速度，并取整（**近似**）。船只使用其类别公布的最高速度。

**其他**（米每秒）。**近似**的现实世界默认值：匍匐 0.5，蹲行 1.5，行走 1.4，跑步 3.5，冲刺 6。

## 来源 {#sources}

反恐精英 2
- [CS2 武器定义（`weapons.vdata`），SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB 武器页面](https://csdb.gg/weapons/)
- [Counter-Strike Wiki：Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

无畏契约
- [valorant-api.com 武器（跑步速度乘数）](https://valorant-api.com/v1/weapons)
- [VLR.gg：刀的速度 6.75 m/s](https://vlr.gg/post/4240306)
- [Riot 支持：Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

战地
- [EA 论坛：Battlefield 6 movement speed](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 移动指南](https://deltiasgaming.com/?p=309455)
- [发布前报告的 6.4 m/s 冲刺速度](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad：Squad game mechanics post（2018）](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/)（不公布速度）

Arma
- [Bohemia 论坛：walking speed](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia 论坛：movement speed tweaking](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 反馈跟踪器：sprint speed](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual：Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [按阵营划分的 Arma 3 载具数据（holy.gg）](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / 战争雷霆 / IL-2
- 每种飞机和直升机类型的维基百科规格，由 `air.json` 中的每个配置链接而来
- [V speeds](https://en.wikipedia.org/wiki/V_speeds)，用于典型的进近和战斗速度
- [战争雷霆维基](https://wiki.warthunder.com/)，用于地面载具
- [Arleigh Burke 级驱逐舰](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer)，以及其他舰船类别公布的速度

其他
- [Preferred walking speed](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler's hiking function](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
