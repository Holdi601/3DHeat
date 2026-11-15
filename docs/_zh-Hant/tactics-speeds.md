---
title: "移動速度"
parent: "戰術板"
nav_order: 1
lang: "zh-Hant"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# 移動速度

一名士兵、一輛戰車或一架噴射機，從 A 到 B 需要多久？本頁說明[戰術看板](tactics-board.md)上每個模型的移動速度，以及這些數字的來源，讓你能信任計畫上的時間，或加以修改。

[戰術看板](tactics-board.md)會根據每個模型的移動速度來計算計畫的時間。速度來自 `src/tactics/speeds/` 中每款遊戲的一個檔案：每個類別（步兵、地面載具、船隻、飛機、直升機）的每種移動模式都有一個速度，此外還有具名的設定檔，例如每一種 CS2 武器或每一種飛機類型各一個。每個檔案都會列出其來源，而每個數值都會標示它是**官方**（遊戲本身的資料，或真實飛機的公開數據）還是**約略**（社群實測或一般典型值）。

這些只是起點。**每個模型都可以在看板上覆寫其速度**，因此計畫可以使用實測速度、負重的士兵或受損的戰車。

## 移動模式 {#modes}

| 類別 | 模式 |
|---|---|
| 步兵 | 匍匐（趴下）、蹲下、步行（緩慢、安靜的步行）、跑步（預設移動）、衝刺 |
| 地面載具、船隻 | 匍匐、謹慎、一般（越野）、急速（道路最高速） |
| 飛機、直升機 | 慢速（進場、盤旋、懸停滑行）、巡航、戰鬥（轉彎速度或攻擊航線）、最大 |

遊戲沒有的模式會留空：CS2 與 Valorant 沒有衝刺，也沒有趴下。

## 坡度 {#slopes}

每個檔案也會說明遊戲如何處理坡度。CS2、Valorant 與 Squad 會限制水平速度，因此坡度不會減慢玩家。Arma 會在坡上減慢步兵，因此它的檔案與通用檔案都使用 Tobler 的步行函數。Battlefield 與載具模擬則使用單純的坡度懲罰。

## 各遊戲說明 {#per-game}

**Counter-Strike 2**（每秒單位數；一個單位視為一英吋）。**官方。**跑步速度取自遊戲武器定義中的 `m_flMaxSpeed` 數值：小刀與 C4 為 250，手榴彈 245，手槍 240（沙漠之鷹 230，R8 180），衝鋒槍 220 至 240，步槍 210 至 225，AWP 200，輕機槍 195 與 150。帶瞄準鏡的 AWP（100）、AUG 與 SG 553（150），以及 G3SG1 與 SCAR-20（120）有各自的設定檔。步行為跑步 × 0.52，蹲下為跑步 × 0.34。Valve 並未公布這兩個乘數，但每種武器都會在示範錄影中顯示它們。若要以真實移動來檢查計畫，請在同一張地圖上載入一個示範，並比較玩家的速度。

**Valorant**（m/s）。小刀的速度為 6.75 m/s。每種武器會以遊戲資料中的跑步速度乘數乘上此值，得到遊戲內武庫所顯示的速度：大多數副武器與衝鋒槍為 5.73，步槍為 5.4，重型武器與 Operator 為 5.13，霰彈槍為 5.06。這些跑步速度是精確的。步行與蹲下的速度是**估計值**（跑步的 0.55 與 0.4 倍），因為 Riot 並未公布它們。帶瞄準鏡的狙擊槍設定檔同樣為估計值。

**Battlefield**（km/h）。**約略。**EA 未公布任何移動數值。步兵：趴下約 1 m/s，蹲下 2，跑步 4，衝刺 6.4。載具、噴射機、直升機與船隻，則取其類別在遊戲中的典型速度。

**Squad**（km/h）。**約略。**跑步（3.3 m/s）與衝刺（5.9 m/s）來自社群對遊戲機制的說明文章。匍匐、蹲下與慢速步行為估計值，所有載具類別與直升機亦然。

**Arma**（km/h）。**約略。**步兵速度是社群的計時：步行約 5 km/h，蹲下戰術步速 9 km/h，慢跑 15 km/h，衝刺約 21 km/h。載具最高速度則是第三方列表中，各類別原版 Arma 3 載具所設定的最高值。較慢的載具模式為估計值。

**DCS／War Thunder／IL-2**（km/h）。調色盤中的每架飛機與直升機都有自己的設定檔。巡航與最高速度是真實飛機的**公開數據**，這些模擬器能精確地模擬它們。噴射機的最大值為海平面的數值，螺旋槳飛機則為額定高度的數值，每個設定檔的備註會說明是哪一種。慢速與戰鬥速度為典型值。地面載具採用真實載具公開的道路速度，已四捨五入（**約略**）。船艦採用其類別公開的最高速度。

**其他**（m/s）。**約略**的現實世界預設值：匍匐 0.5，蹲下 1.5，步行 1.4，跑步 3.5，衝刺 6。

## 來源 {#sources}

Counter-Strike 2
- [CS2 武器定義（`weapons.vdata`），SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB 武器頁面](https://csdb.gg/weapons/)
- [Counter-Strike Wiki：移動機制](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com 武器（跑步速度乘數）](https://valorant-api.com/v1/weapons)
- [VLR.gg：小刀速度 6.75 m/s](https://vlr.gg/post/4240306)
- [Riot 支援：步行、跑步與蹲下](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA 論壇：Battlefield 6 移動速度](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 移動指南](https://deltiasgaming.com/?p=309455)
- [發售前報告中的 6.4 m/s 衝刺](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad：Squad 遊戲機制貼文（2018）](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/)（未公布速度）

Arma
- [Bohemia 論壇：步行速度](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia 論壇：移動速度調校](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 回饋追蹤器：衝刺速度](https://feedback.bistudio.com/T64047)
- [Arma 3 野戰手冊：步兵操控](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [依陣營列出的 Arma 3 載具數據（holy.gg）](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS／War Thunder／IL-2
- 每種飛機與直升機類型的維基百科規格，從 `air.json` 中的每個設定檔連結而來
- [V 速度](https://en.wikipedia.org/wiki/V_speeds)，典型的進場與戰鬥速度
- [War Thunder 維基](https://wiki.warthunder.com/)，地面載具
- [Arleigh Burke 級驅逐艦](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer)，以及其他船艦類別公開的速度

其他
- [偏好步行速度](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler 的步行函數](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
