---
title: "ナレッジカタログ"
parent: "ナレッジレンズ"
nav_order: 2
lang: "ja"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# ナレッジカタログ

このページは、[ナレッジレンズ](knowledge.md)が知っていることの全一覧です。レンズが探すパターン、引用するアイデア・手法・歴史的事例・研究、そしてその元になった本や論文が載っています。IDで項目を探したり、出典を確かめたりするときに使ってください。

このページはナレッジベースから `node tools/knowledge-doc.mjs` で生成されています。マーカーの間は編集しないでください。

<!-- kb:begin -->

ナレッジベースには579件の項目があります（概念135、手法37、歴史的事例277、設計原則17、研究113）。93のパターンを扱い、556件の出典を引用しています。

### パターン (93) {#patterns-93}

| id | 系統 | データではどう見えるか |
|---|---|---|
| `concentration` | 戦力 | 一か所により多くの部隊を集めた側は、数の差だけでは説明できないほど、その場所で勝つ。 |
| `local-superiority` | 戦力 | 交戦距離の中で数が多い側が、全体の数に関係なく敗者を倒す。 |
| `attrition` | 戦力 | 損失は時間とともに両側の強さに従う。戦いは先に力を使い果たした側が負ける。 |
| `exchange-ratio` | 戦力 | 一回の損失に対する撃破数は、場所・側・兵科によって大きく違う。 |
| `aimed-fire` | 戦力 | 損失は敵の数とともに増えるが、自軍の数とは関係しない。 |
| `area-fire` | 戦力 | 損失は両軍の数の積とともに増える。密集は罰せられる。 |
| `defeat-in-detail` | 戦力 | 一度に一部ずつ到着する部隊が、個別に潰される。 |
| `mutual-support` | 戦力 | 味方が落とされると、近くの味方がすぐに報復する。相討ちになる。 |
| `combined-arms` | 戦力 | 兵科は、互いの弱点を補い合うときには強く、単独では弱い。 |
| `class-counter` | 戦力 | 特定の兵科が、特定の他の兵科や特定の場所では不釣り合いに勝つ。 |
| `initiative` | 戦力 | 交戦で先に得点した側が、その戦いに勝つ傾向がある。 |
| `key-terrain` | 地形 | 同じ少数の場所が、試合ごとに戦いを決める。 |
| `fields-of-fire` | 地形 | 他の側が渡らねばならない地面を遠くまで見渡せる場所は、より多くの撃破を取る。 |
| `high-ground` | 地形 | 撃破は、被害者が立つ地面より高い位置から行われる。 |
| `cover` | 地形 | 地形が視界と射撃を遮る場所では、時間あたりの死亡が減る。 |
| `open-ground` | 地形 | 視界と射撃を遮るものがない場所では、時間あたりの死亡が増える。 |
| `kill-zone` | 地形 | 見張られ、火力に覆われた地面を通らざるを得ない場所で死亡が集中する。 |
| `chokepoint` | 地形 | 多くの通過者が、わずかな地面を通り抜ける。その場所で損失が出る。 |
| `reverse-slope` | 地形 | 稜線や壁の裏側で、敵から直接見られない安全な場所。 |
| `safe-ground` | 地形 | 時間は過ごすが、死ぬ人は少ない場所。 |
| `obstacle` | 地形 | 通路は、塞がれた地面を避けて少数のルートに曲がる。 |
| `flank` | 移動 | あまり使われない経路が、主要な経路より多くの撃破につながる。 |
| `avenue-of-approach` | 移動 | 移動は、地域の間をいくつかの道筋に沿って流れる。 |
| `mobility` | 移動 | 動いている部隊は、遅い部隊や止まっている部隊より時間あたりの死亡が少ない（または多い）。 |
| `static-exposure` | 移動 | 止まっている部隊は、動いている部隊より時間あたりの死亡が多い。 |
| `interior-lines` | 移動 | 交戦の間の経路が短い側は、もう一方より速く戦力を移す。 |
| `envelopment` | 移動 | 一方の陣地へ、複数の方向から撃破が来る。 |
| `ambush` | 移動 | 経路を進む部隊は、すでに配置についた敵にすぐ倒される。 |
| `spawn-pressure` | 時間 | 一つの出現地点から出ると、命はすぐ終わる。 |
| `tempo` | 時間 | 速い側が先に戦闘に着き、相手が反応する前に得点する。 |
| `surprise` | 時間 | 被害者が撃ち返す前に、損失が一度にまとめて起きる。 |
| `energy-advantage` | 航空 | 撃つ側は、撃たれる側より高度と速度を多く持っている。 |
| `air-superiority` | 航空 | 一方の航空機が、失う数の何倍もの敵を撃墜する。 |
| `sead` | 航空 | 地上の防空網は、見つけられて破壊されるまで多くの航空機を落とす。 |
| `bvr` | 航空 | 撃破は長距離で起き、被害者が近づく前に決まる。 |
| `fleet-salvo` | 海戦 | 先に一撃を入れた部隊はほとんど損失を出さず、残りはわずかしか生き残れず反撃できない。 |
| `scouting` | 海戦 | 相手を先に見つけた側が、戦い方を選ぶ。 |
| `urban-close` | 市街地 | 交戦距離が短く、密集した地形で多くが死に、制圧が遅い。 |
| `vertical` | 市街地 | 上階や屋上から、通りへの撃破が行われる。 |
| `skill-dispersion` | 人の行動 | 少数のプレイヤーが、撃破や死亡の大きな割合を占める。 |
| `ai-vs-player` | 人の行動 | 同じ場所で、AIが操作する部隊はプレイヤーと違う結果になる。 |
| `balance` | 設計 | 側・出現地点・兵科が、不均等な条件で始まる。 |
| `economy` | 設計 | 稼がれ、支払われ、失われる資源が、少数の場所やプレイヤーに集まる。 |
| `flow` | 設計 | プレイヤーがマップをどう動くか。周回路、レーン、行き止まり。 |
| `sightlines` | 設計 | 長い見通し線が、戦いがどこで始まり、誰が勝つかを決める。 |
| `readability` | 設計 | プレイヤーが予測できない死。背後から、視界の外から。 |
| `formation` | 移動 | 一方の部隊が、まとまって認識できる形で動く。線、縦隊、楔形、梯形、方形。 |
| `frontal-assault` | 移動 | 一つの集団が、敵の正面へまっすぐ突っ込む。 |
| `double-envelopment` | 移動 | 二つの集団が、ほぼ同時に一つの敵部隊の両側面を攻める。 |
| `encirclement` | 移動 | 敵の集団が、相手側に四方を囲まれ、逃げ道がほとんどなくなる。 |
| `penetration` | 移動 | 集団が、両側に敵がいる敵の線を突き抜ける。 |
| `fire-and-maneuver` | 移動 | 集団の一部が動き、残りが止まって援護する。役割は交互に入れ替わる。 |
| `feint` | 移動 | 小さな集団が敵を一か所に引き寄せ、そのすぐ後に主力が別の場所を攻める。 |
| `withdrawal` | 移動 | 接触中の集団が向きを変え、敵との距離を広げる。 |
| `pursuit` | 移動 | 集団が、離れていく敵を追う。距離を保つか、縮める。 |
| `defence-in-depth` | 地形 | 防御側が、敵の進攻の軸に沿って、前後に並ぶいくつもの帯に陣を張る。 |
| `screening` | 移動 | 小さな部隊が本隊よりずっと前を進み、最初に敵と出会う。 |
| `dispersion` | 戦力 | 一方の側が時間とともに広がる。同じ場所にいる部隊は少なくなる。 |
| `missile-defence` | 航空 | ミサイルに狙われた航空機は、脅威を側面や後方へ向け直す。クランク、ノッチ、ドラッグ、ポンプ。 |
| `angles-fight` | 航空 | 低速・高旋回率での近距離格闘戦。エネルギーではなく、機首の位置をめぐって戦う。 |
| `cap` | 航空 | 航空機が敵の来るのを待ち、固定の位置の周りを何分も旋回する。 |
| `strike-package` | 航空 | 役割の違う航空機が一緒に目標へ飛ぶ。一部は地上を攻撃し、他は援護する。 |
| `line-of-battle` | 海戦 | 艦が縦隊で一隻ずつ続いて進み、すべての舷側砲が敵に向く。 |
| `crossing-the-t` | 海戦 | 一つの縦隊が敵の縦隊の先頭を横切る。自軍の砲はすべて敵に向き、敵の砲はほとんど向かない。 |
| `fatal-funnel` | 市街地 | 一つの出入口・部屋・狭所に入ったプレイヤーは、他の場所に入るよりずっと高い確率で、そこで数秒のうちに倒される。 |
| `crossfire` | 戦力 | 射線が異なる角度から交わる待ち伏せ者は、一人の待ち伏せ者より多くの決闘に勝つ。 |
| `peeker-advantage` | 時間 | 視界に出て行くプレイヤーは、角を押さえている相手に対して、半分より多く（または少なく）決闘に勝つ。 |
| `entry` | 時間 | ラウンドの最初の撃破が、そのラウンドの大部分を決める。突入は、場所と支援によって勝つことも負けることもある。 |
| `utility-support` | 戦力 | 決闘の直前のフラッシュやスモークが、どちらが勝つかを変える。 |
| `man-advantage` | 戦力 | ラウンドは、生き残っている人数の多い側が勝つ。一部の側は、その優位を活かし、または無駄にする。 |
| `clutch` | 人の行動 | 最後に生き残ったプレイヤーは、ラウンドの状態から予測されるより多く（または少なく）勝つ。 |
| `action-value` | 人の行動 | 撃破、相討ち、設置、支援行動は、勝つ見込みをどれだけ変えるかが違う。 |
| `lurk` | 移動 | チームから遠く離れて一人でいるプレイヤーは、群れとは違う割合で撃破（または死亡）する。 |
| `rotation` | 移動 | 側が選手を戦いや目標へ移す速さによって、その場所を守れるか、奪い返せるかが決まる。 |
| `collective-order` | 人の行動 | 一方の側の動く部隊は、時間をずらした自分たちの動きが偶然で説明できる以上に、同じ方向を向く。 |
| `milling` | 人の行動 | 一方の側の部隊が共通の中心の周りを回る。正味の移動はないまま、旋回する。 |
| `herding` | 人の行動 | 部隊は、その場所自体の確率を超え、敵のまねも超えて、前の味方と同じ道筋で場所を離れる。 |
| `lane-formation` | 人の行動 | 反対向きの流れは、別々のレーンを保つ。移動は、試合ごとに再利用される少数の道筋に集中する。 |
| `crowding` | 人の行動 | 部隊が密集すると、速度と流れが落ちる。狭所では、強く押すほど通過する数が減る。 |
| `leadership` | 人の行動 | 一部の部隊が先に向きを変え、他の部隊が数秒遅れてその向きをまねる。 |
| `cohesion` | 人の行動 | 集団から離れていく部隊は、集団に留まる部隊より多く死ぬ。 |
| `breaking-point` | 人の行動 | 戦力の一定割合を失った側は、敵との距離では説明できないほど、前進をやめて退く。 |
| `panic` | 人の行動 | 突然の脅威の下で部隊は散り、逃げ去り、または凍りつき、連携が崩れる。 |
| `loss-chasing` | 人の行動 | 損失の後の部隊は、利益の後より多く（または少なく）危険を冒す。 |
| `hot-hand` | 人の行動 | 同じプレイヤーでも、順序を混ぜた場合より、成功が成功に続く頻度が高い。 |
| `conformity` | 人の行動 | 一方の側のメンバーは、自分の好みを超えて、購入・装備・経路などを揃えて選ぶ。 |
| `suppression` | 人の行動 | 撃たれた部隊は、倒されなくても、動き方や撃ち方が変わる。 |
| `social-loafing` | 人の行動 | 味方が多いほど、一人あたりの行動が減る。 |
| `mixed-strategy` | 人の行動 | 予測されないはずの選択に、パターンが出てくる。一方の選択肢が多く勝つ、または選択が一定の順序で続く。 |
| `coordination` | 人の行動 | 目に見える命令がなくても、メンバーが足並みをそろえて動く。移動、タイミング、選択が揃う。 |
| `contagion` | 人の行動 | 接触や近さによって、ある状態が部隊から部隊へ伝わり、マップ全体に広がる。 |
| `territoriality` | 人の行動 | 部隊は互いに距離を保ち、自分の陣地を守る。 |
| `interaction-network` | 人の行動 | 誰が戦い、誰を支援し、誰について行くかが、中心・集団・橋渡しを持つネットワークを作る。 |

### 概念 (135) {#concepts-135}

| id | 題名 | 視点 | パターン | 出典 |
|---|---|---|---|---|
| `concept.lanchester-square` | ランチェスターの二乗法則（照準射撃） | 軍事, 航空, 海軍, eスポーツ | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | ランチェスターの一次法則（面制圧、一対一） | 軍事, 市街地, eスポーツ | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | 戦力の集中（質量） | 軍事, 航空, 海軍, eスポーツ | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | 戦力比と3対1の法則 | 軍事 | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | 損失交換比 | 軍事, 航空, eスポーツ, 設計 | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | 戦闘力とその乗数 | 軍事 | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | 近代的な戦力運用の体系 | 軍事 | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODAループ（観察・情勢判断・決心・行動） | 軍事, 航空, eスポーツ | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | エネルギー機動理論 | 航空 | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | 基本的な格闘機動と空中機動戦 | 航空 | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | 地形分析：OAKOC / KOCOA | 軍事, 設計, 市街地 | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC：任務の変数 | 軍事 | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | 要地と決定的地形 | 軍事, 設計, eスポーツ | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | 観察と射界 | 軍事, 設計, eスポーツ, 市街地 | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | 掩蔽と秘匿 | 軍事, 市街地, 設計 | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | 接近経路と機動回廊 | 軍事, 設計 | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | 隘路と狭隘部 | 軍事, 設計, eスポーツ | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | 交戦地域と殺傷地帯 | 軍事, 市街地, 設計 | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | 逆斜面の防御と遮蔽 | 軍事, 設計 | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | 高地 | 軍事, 設計 | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | 内線と外線 | 軍事 | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | 各個撃破 | 軍事, eスポーツ | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | 相互支援 | 軍事, 航空, eスポーツ | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | 諸兵科連合 | 軍事, 設計 | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | 制圧射撃 | 軍事, 市街地 | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | 敵防空網の制圧と破壊（SEAD/DEAD） | 航空, 軍事 | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | 戦闘空中哨戒と制空 | 航空 | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | 視程外（BVR）交戦 | 航空 | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | 間接的アプローチ | 軍事, eスポーツ, 設計 | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | 包囲と包み込み | 軍事 | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | 待ち伏せ | 軍事, eスポーツ, 設計 | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | 縦深防御 | 軍事 | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | 摩擦と戦場の霧 | 軍事, eスポーツ | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | 攻勢の頂点 | 軍事 | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | 奇襲 | 軍事, 航空, 海軍, eスポーツ | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | 戦力の節約 | 軍事, eスポーツ | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | 市街地の地形 | 市街地, 軍事, eスポーツ | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | 制海権と決戦的な艦隊戦 | 海軍 | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughesの斉射モデル：先に有効に攻撃する | 海軍, 航空 | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | 捜索と探知の理論 | 海軍, 航空, 軍事 | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | 作戦分析：有効性の尺度 | 軍事, 航空, 海軍, 設計 | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | 分析としてのウォーゲーム | 軍事, 設計 | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | 機動戦 | 軍事, eスポーツ | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | 結束と士気の要素 | 軍事 | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | 重心 | 軍事 | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | 決定的地点 | 軍事, eスポーツ | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | 作戦線 | 軍事 | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | 殲滅と消耗の戦略 | 軍事 | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | 縦深戦闘と縦深作戦 | 軍事 | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle（空地戦闘） | 軍事, 航空 | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | 任務指揮（Auftragstaktik） | 軍事, eスポーツ | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | 突破と戦果拡張 | 軍事 | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | 火力と機動 | 軍事, eスポーツ | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | 交互躍進と警戒援護 | 軍事, eスポーツ | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | 偵察による誘引と浸透 | 軍事, eスポーツ | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | 予備隊 | 軍事, eスポーツ | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | 弾力的防御と反撃 | 軍事 | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | キルチェーン（発見・固定・追跡・目標化・交戦・評価） | 軍事, 航空, 海軍 | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | 探知距離と交戦距離 | 航空, 海軍, 軍事 | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | 戦闘効果値 | 軍事, eスポーツ | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | 戦場での分散 | 軍事, eスポーツ | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | 近接航空支援 | 航空, 軍事 | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | 航空阻止 | 航空, 軍事 | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | 護衛とファイタースイープ | 航空 | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | エネルギー戦と旋回戦 | 航空 | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | リード、ピュア、ラグの追尾 | 航空 | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | サッチ・ウィーブ | 航空 | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | フィンガーフォーと戦闘二機編隊 | 航空 | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | 存在する艦隊 | 海軍 | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | T字戦法（敵先頭の横切り） | 海軍, 軍事 | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | 船団護送 | 海軍 | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | 接近阻止・領域拒否 | 海軍, 航空, 軍事 | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | 市街地での拠点防御 | 市街地, 軍事 | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | 建物の壁をぶち抜いて進む移動 | 市街地, 軍事, 設計 | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | 包囲戦 | 軍事, 市街地 | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | ゲリラ戦 | 軍事, 市街地 | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | 対反乱作戦 | 軍事, 市街地 | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | 聖域 | 軍事, 設計 | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | 欺瞞（マスキロフカ） | 軍事, eスポーツ | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | 情報優位 | 軍事, eスポーツ | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | 節約ラウンドと資源のテンポ | eスポーツ, 設計 | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | 移動隊形：線、縦隊、楔形、梯形 | 軍事, eスポーツ | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | 正面攻撃 | 軍事 | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | 二重包囲（挟撃） | 軍事 | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | 包囲とポケット | 軍事 | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | 浸透と突破 | 軍事 | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | 追撃 | 軍事 | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | 後退：撤退、遅滞、退却 | 軍事 | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | 陽動と示威行動 | 軍事, eスポーツ | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | 警戒・護衛・掩護：本隊の前方の安全確保 | 軍事 | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | ミサイルへの対処：クランク、ノッチ、ドラッグ、ポンプ | 航空 | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | 視程外の編隊：壁、リード・トレイル、グラインダー、挟撃 | 航空 | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | 角度の戦いとエネルギーの戦い | 航空 | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | 攻撃パッケージと制圧の順序 | 航空 | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | 戦列 | 海軍 | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | 致命的な漏斗（ファタル・ファネル） | 市街地, 軍事, eスポーツ, 設計 | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | 室内制圧：奇襲、速さ、統制された暴力 | 市街地, 軍事, eスポーツ | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | 制圧点 | 市街地, 軍事, eスポーツ | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | 角の確認：ピザを切るように確認する | 市街地, 軍事, eスポーツ | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | 十字砲火と交差する射界 | 軍事, 市街地, eスポーツ, 設計 | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | 覗き見る側の優位 | eスポーツ, 設計 | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | 脱落ラウンドでの人数の優位 | eスポーツ, 軍事 | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | 突入と最初の決闘 | eスポーツ, 市街地 | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | 突入の前の補助装備：フラッシュとスモーク | eスポーツ, 市街地, 軍事 | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | 歩行者の動きの社会的力モデル | 設計, 市街地, 軍事 | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | 逆流でのレーン形成 | 設計, 市街地 | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | 速い方が遅い | 設計, 市街地, 軍事 | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | 群衆の基本図 | 設計, 市街地 | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | 踏み跡の形成と希望線 | 設計, 軍事 | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | パニックはまれ：集団の回復力 | 軍事, 市街地, 設計 | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | ボイド：分離、整列、結合 | 設計, 軍事 | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | 秩序変数と集団運動の始まり | 設計, 軍事, 航空, 海軍 | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | 群れ、旋回、分極した状態 | 設計, 軍事, 海軍 | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | 合図なしの効果的な統率 | 軍事, eスポーツ, 設計 | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | 距離ではなく数で数える近傍 | 航空, 軍事 | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | 群知能 | 設計, eスポーツ, 軍事 | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | 群れ行動と情報のカスケード | eスポーツ, 設計, 軍事 | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | 社会的手抜き | eスポーツ, 設計, 軍事 | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | 責任の分散 | eスポーツ, 軍事 | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | 一次集団の結束 | 軍事, eスポーツ | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | 崩壊点と損耗の限界 | 軍事 | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | 制圧：撃破以外に火力が与える影響 | 軍事, 市街地 | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | 戦闘での恐怖とストレスと判断 | 軍事, eスポーツ | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | プレッシャーの下での失速 | eスポーツ | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | プロスペクト理論と損失回避 | eスポーツ, 設計 | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | 損益分岐点と「家の金」効果 | eスポーツ | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | ティルト（苛立ちによる崩れ） | eスポーツ | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | サンクコスト | eスポーツ, 軍事 | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | ホットハンドとその誤謬 | eスポーツ | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | 混合戦略：読まれないこと | eスポーツ, 設計, 軍事 | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | 共有の心的モデル | eスポーツ, 軍事 | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | チームワークの構成要素 | eスポーツ, 軍事 | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | 行動の実験室としての仮想世界 | 設計, eスポーツ | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | 個人の空間と縄張り | 設計, 市街地 | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | 相互作用のネットワーク：ハブと弱いつながり | eスポーツ, 設計 | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### 手法 (37) {#methods-37}

| id | 題名 | パターン | 出典 |
|---|---|---|---|
| `method.lanchester-fit` | 交戦データへのランチェスター指数の当てはめ | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | 側別・場所別の交換比 | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | 撃破の瞬間ごとの局所的な戦力比 | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | 可視領域：視線による射界 | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | 撃破と死亡時の比エネルギー（航空） | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | 試合をまたぐホットスポットの持続 | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | 相討ちの割合（相互支援） | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | 交戦と先制撃破の優位 | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | 死亡の空間的自己相関（Moran's I） | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | マップ自身の基準に対する割合と、FDR による管理 | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | 戦場情報の準備（IPB） | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | 対比較による評価モデル（Elo, Glicko, TrueSkill） | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | 勝率と行動の価値づけ | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | 空間支配とピッチ支配 | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | 接触中の艦に当てはめた斉射方程式 | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | 交戦中の単位時間あたりの戦闘効果比 | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | 探知から交戦までの距離と、交戦距離 | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | キルチェーンの時間配分 | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | 撃破の割合に対する分散（時間で見た戦力の集中） | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | 出撃あたりの損失率と撃墜数 | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | ラウンド勝率モデル | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | 行動の価値：追加された勝率 | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | リッジ回帰による調整済みプラスマイナス（RAPM） | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | 縮小推定：経験ベイズ | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | 期待される結果：期待得点から期待決闘へ | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | 配置、ローテーション、ラーク（単独行動）の測定 | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | 反映問題：模倣か、共通の原因か | herding, conformity | Manski 1993 |
| `method.streak-correction` | 有限系列の補正を伴う連続記録 | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | 分極と旋回の秩序変数 | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | 時間差をつけた向きの相関によるリーダーの特定 | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | 群れ行動の経路カスケード検定 | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | レーンの分離と踏み跡の持続 | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | 遅れた者の危険率 | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | 崩壊曲線 | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | 撃たれたときの反応 | suppression | Rowland 2006 |
| `method.risk-after-outcome` | 損失または利益の後のリスク | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | 購入の一致（Fleissのカッパ） | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### 歴史的事例 (277) {#historical-cases-277}

| id | 事例 | 時期 | 規模 | パターン | 出典 |
|---|---|---|---|---|---|
| `case.thermopylae` | テルモピュライ | 紀元前480年 | 会戦 | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | サラミス | 紀元前480年 | 会戦 | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | マラトン | 紀元前490年 | 会戦 | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | レウクトラ | 紀元前371年 | 会戦 | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | ガウガメラ | 紀元前331年 | 会戦 | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | トラシメヌス湖 | 紀元前217年 | 会戦 | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | カンナエ | 紀元前216年 | 会戦 | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | トイトブルク森 | 紀元9年 | 会戦 | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | ヘイスティングズ | 1066年 | 会戦 | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | スターリング橋 | 1297年 | 会戦 | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | アジャンクール | 1415年 | 会戦 | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | ロイテン | 1757年 | 会戦 | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | アウステルリッツ | 1805年 | 会戦 | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | トラファルガー | 1805年 | 会戦 | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | ワーテルロー | 1815年 | 会戦 | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | フレデリックスバーグ：マリーズ・ハイツ | 1862年 | 交戦 | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | ゲティスバーグ：リトル・ラウンドトップ | 1863年 | 交戦 | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | ゲティスバーグ：ピケットの突撃 | 1863年 | 交戦 | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | イサンドルワナ | 1879年 | 会戦 | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | ロークス・ドリフト | 1879年 | 交戦 | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | タンネンベルク | 1914年 | 作戦 | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | ソンムの戦い、初日 | 1916年7月1日 | 会戦 | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | ヴェルダン | 1916年 | 作戦 | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | ユトランド | 1916年 | 会戦 | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | スオムッサルミ | 1939〜40年 | 会戦 | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | スダンとアルデンヌ | 1940年5月 | 作戦 | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | アラス反撃 | 1940年5月21日 | 交戦 | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | バトル・オブ・ブリテン | 1940年7〜10月 | 作戦 | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | 大西洋の戦い：船団のオペレーションズ・リサーチ | 1939〜45年 | 作戦 | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | ミッドウェー | 1942年6月 | 会戦 | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | 第二次エル・アラメイン | 1942年10〜11月 | 会戦 | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | カセリーヌ峠 | 1943年2月 | 会戦 | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | スターリングラード | 1942年8月〜1943年2月 | 作戦 | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | クルスク | 1943年7月 | 作戦 | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | プロホロフカ | 1943年7月12日 | 交戦 | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | ヴィレル・ボカージュ | 1944年6月13日 | 交戦 | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | ノルマンディーの生垣地帯 | 1944年6〜7月 | 作戦 | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | コブラ作戦 | 1944年7月 | 作戦 | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | レイテ湾 | 1944年10月 | 会戦 | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | バストーニュ | 1944年12月 | 会戦 | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | 対馬沖海戦 | 1905年5月 | 会戦 | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | 仁川上陸作戦 | 1950年9月 | 作戦 | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | ミグ・アレー | 1950〜53年 | 作戦 | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | ディエンビエンフー | 1954年 | 会戦 | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | イアドラン渓谷：LZ X-Ray | 1965年11月 | 交戦 | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | ボロ作戦 | 1967年1月2日 | 交戦 | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | ゴラン：涙の谷 | 1973年10月 | 会戦 | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | シナイ：チャイニーズ・ファーム | 1973年10月 | 会戦 | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | ベカー高原（作戦モールクリケット19） | 1982年6月 | 会戦 | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | フォークランド航空戦 | 1982年5〜6月 | 作戦 | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | 砂漠の嵐 航空作戦 | 1991年1〜2月 | 作戦 | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73イースティング | 1991年2月26日 | 交戦 | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | モガディシュ | 1993年10月 | 交戦 | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | グロズヌイ | 1994年12月〜1995年2月 | 会戦 | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | フエ | 1968年1〜3月 | 会戦 | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | コソボ航空作戦 | 1999年3〜6月 | 作戦 | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | ファルージャ（作戦アル・ファジル） | 2004年11月 | 会戦 | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | モスル | 2016〜17年 | 作戦 | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | カデシュ | 紀元前1274年頃 | 会戦 | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | イッソス | 紀元前333年 | 会戦 | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | ザマ | 紀元前202年 | 会戦 | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | カルラエ | 紀元前53年 | 会戦 | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | ファルサロス | 紀元前48年 | 会戦 | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | アドリアノープル | 紀元378年 | 会戦 | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | ヤルムーク | 636年 | 会戦 | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | マンジケルト | 1071年 | 会戦 | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | ヒッティーン | 1187年 | 会戦 | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | バノックバーン | 1314年 | 会戦 | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | クレシー | 1346年 | 会戦 | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | ポワティエ | 1356年 | 会戦 | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | グルンヴァルト（タンネンベルク） | 1410年 | 会戦 | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | ブライテンフェルト | 1631年 | 会戦 | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | ブレンハイム | 1704年 | 会戦 | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | ポルタヴァ | 1709年 | 会戦 | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | ロスバッハ | 1757年 | 会戦 | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | サラトガ | 1777年 | 作戦 | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | ヨークタウン | 1781年 | 会戦 | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | イエナ・アウエルシュテット | 1806年 | 会戦 | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | ボロジノ | 1812年 | 会戦 | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | ライプツィヒ | 1813年 | 会戦 | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | アンティータム | 1862年 | 会戦 | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | チャンセラーズヴィル | 1863年 | 会戦 | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | ヴィックスバーグ | 1863年 | 作戦 | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | ケーニヒグレーツ（サドヴァ） | 1866年 | 会戦 | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | セダン | 1870年 | 会戦 | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | 奉天 | 1905年 | 会戦 | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | オムドゥルマン | 1898年 | 会戦 | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | スピオン・コップ | 1900年 | 交戦 | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | ガリポリ | 1915年 | 作戦 | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | カンブレー | 1917年11月 | 会戦 | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | カポレット | 1917年10〜11月 | 作戦 | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | ドイツ軍の春季攻勢（作戦ミヒャエル） | 1918年3〜4月 | 作戦 | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | アミアン | 1918年8月 | 会戦 | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | ハルハ河（ノモンハン） | 1939年8月 | 会戦 | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | ポーランド戦役 | 1939年9月 | 作戦 | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | ハヌットとジャンブルー | 1940年5月 | 会戦 | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | ストンヌ | 1940年5月 | 交戦 | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | ダンケルク周辺の防衛線 | 1940年5〜6月 | 作戦 | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | コンパス作戦とベダ・フォム | 1940年12月〜1941年2月 | 作戦 | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | クルセイダー作戦とシディ・レゼグ | 1941年11〜12月 | 作戦 | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | ガザラ | 1942年5〜6月 | 会戦 | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | アラム・ハルファ | 1942年8〜9月 | 会戦 | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | ドゥブノ・ブロディ | 1941年6月 | 会戦 | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | キエフ包囲 | 1941年9月 | 作戦 | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | モスクワ | 1941年10月〜1942年1月 | 作戦 | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | ルジェフと火星作戦 | 1942年 | 作戦 | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | 第二次ハリコフ | 1942年5月 | 会戦 | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | 第三次ハリコフ（マンシュタインの逆襲） | 1943年2〜3月 | 作戦 | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | バグラチオン作戦 | 1944年6〜8月 | 作戦 | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | コルスン・チェルカッシィの包囲 | 1944年1〜2月 | 会戦 | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | カーメネツ・ポドリスキーの包囲 | 1944年3〜4月 | 作戦 | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | エプソム作戦 | 1944年6月 | 会戦 | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | グッドウッド作戦 | 1944年7月 | 会戦 | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | トータライズ作戦 | 1944年8月 | 会戦 | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | モルタン | 1944年8月 | 会戦 | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | ファレーズの包囲 | 1944年8月 | 作戦 | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | マーケット・ガーデンとアーネム | 1944年9月 | 作戦 | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | アーヘン | 1944年10月 | 会戦 | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | ヒュルトゲンの森 | 1944年9月〜1945年2月 | 作戦 | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | アラクール | 1944年9月 | 会戦 | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | サン＝ヴィト | 1944年12月 | 会戦 | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | エルゼンボルン尾根 | 1944年12月 | 会戦 | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | ゼーロウ高地 | 1945年4月 | 会戦 | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | ベルリン | 1945年4〜5月 | 会戦 | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | 作戦春の目覚め | 1945年3月 | 会戦 | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | オルトーナ | 1943年12月 | 会戦 | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | ワルシャワ蜂起 | 1944年8〜10月 | 作戦 | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | タラワ | 1943年11月 | 会戦 | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | ペリリュー | 1944年9〜11月 | 会戦 | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | 硫黄島 | 1945年2〜3月 | 会戦 | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | 沖縄 | 1945年4〜6月 | 作戦 | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | マニラ | 1945年2〜3月 | 会戦 | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | 満洲（八月の嵐） | 1945年8月 | 作戦 | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | 釜山防衛線 | 1950年8〜9月 | 作戦 | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | 長津湖 | 1950年11〜12月 | 作戦 | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | 臨津江 | 1951年4月 | 会戦 | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | 竹山 | 1951年4月 | 会戦 | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | ポークチョップ・ヒル | 1951年4月と1953年7月 | 交戦 | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | ケサン | 1968年1〜4月 | 会戦 | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | ダクト | 1967年11月 | 会戦 | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | ハンバーガー・ヒル（アップ・ビア山） | 1969年5月 | 交戦 | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | アブ・アゲイラ＝ウム・カテフ | 1967年6月 | 会戦 | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | イスマイリア | 1973年10月 | 会戦 | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | スルタン・ヤアクーブ | 1982年6月 | 交戦 | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | ベイルート包囲 | 1982年6〜8月 | 作戦 | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | レバノン2006：ビント・ジュベイルと対戦車の脅威 | 2006年7〜8月 | 作戦 | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | アル＝ファオ | 1986年2月 | 会戦 | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | バスラ（カルバラ5） | 1987年1〜2月 | 会戦 | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | ハフジ | 1991年1〜2月 | 会戦 | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | 目標ノーフォーク | 1991年2月26〜27日 | 会戦 | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | メディナ・リッジ | 1991年2月27日 | 会戦 | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | ワジ・アル＝バティンの陽動 | 1991年2月 | 作戦 | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | ナーシリーヤ | 2003年3月 | 会戦 | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | 目標ピーチ | 2003年4月 | 交戦 | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | サンダー・ラン | 2003年4月 | 会戦 | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | デベッカ峠 | 2003年4月 | 交戦 | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | ラマディ | 2006〜07年 | 作戦 | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | サドル・シティ | 2008年3〜5月 | 会戦 | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | 作戦アナコンダ | 2002年3月 | 会戦 | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | ワナット | 2008年7月 | 交戦 | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | カムデシュ（COPキーティング） | 2009年10月 | 交戦 | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | ムサ・カラと小隊の拠点 | 2006〜07年 | 作戦 | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | アルジェの戦い | 1956〜57年 | 作戦 | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | ローデシアのファイアフォース | 1974〜79年 | 作戦 | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | サラエボ包囲 | 1992〜96年 | 作戦 | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | グロズヌイ 1999〜2000年 | 1999年12月〜2000年2月 | 会戦 | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | ロシア・ジョージア戦争 | 2008年8月 | 作戦 | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | ゼレノピリャ | 2014年7月 | 交戦 | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | イロヴァイスク | 2014年8月 | 会戦 | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | デバルツェヴェ | 2015年1〜2月 | 会戦 | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | ドネツク空港 | 2014年9月〜2015年1月 | 会戦 | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | ホストメリ空港 | 2022年2月 | 交戦 | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | キーウ軸とブロヴァリーの待ち伏せ | 2022年3月 | 交戦 | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | マリウポリとアゾフスターリ | 2022年2〜5月 | 会戦 | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | ハリコフの反攻 | 2022年9月 | 作戦 | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | ビロホリフカでのシヴェルシキー・ドネツ川の渡河 | 2022年5月 | 交戦 | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | バフムト | 2022年8月〜2023年5月 | 会戦 | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | ザポリージャ攻勢 | 2023年6〜11月 | 作戦 | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | ナゴルノ・カラバフ戦争 | 2020年9〜11月 | 作戦 | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | ロンドン大空襲 | 1940年9月〜1941年5月 | 作戦 | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | バルバロッサ：空での初日 | 1941年6月22日 | 会戦 | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | クレタ | 1941年5月 | 会戦 | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | マルタ包囲 | 1940〜42年 | 作戦 | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | スターリングラードへの空輸 | 1942年11月〜1943年2月 | 作戦 | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | クバン上空の航空戦 | 1943年4〜6月 | 作戦 | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | 空のクルスク | 1943年7月 | 会戦 | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | 空のバグラチオン作戦 | 1944年6〜8月 | 作戦 | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | プロイェシュティ（作戦タイダル・ウェーブ） | 1943年8月1日 | 交戦 | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | ダム襲撃（作戦チャスタイズ） | 1943年5月16〜17日 | 交戦 | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | ハンブルク（作戦ゴモラ） | 1943年7〜8月 | 会戦 | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | シュヴァインフルト＝レーゲンスブルク | 1943年8月17日 | 会戦 | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | 第二次シュヴァインフルト（「暗黒の木曜日」） | 1943年10月14日 | 交戦 | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | ビッグ・ウィーク（作戦アーギュメント） | 1944年2月 | 作戦 | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | ニュルンベルク空襲 | 1944年3月30〜31日 | 交戦 | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | 作戦ボーデンプラッテ | 1945年1月1日 | 会戦 | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | ビスマルク海海戦 | 1943年3月 | 会戦 | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | ラバウルの無力化 | 1943〜44年 | 作戦 | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | フィリピン海（「マリアナの七面鳥撃ち」） | 1944年6月 | 会戦 | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | ナムシー上空の「暗黒の火曜日」 | 1951年10月23日 | 交戦 | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | 作戦ローリング・サンダー | 1965〜68年 | 作戦 | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | タインホア橋 | 1965〜72年 | 交戦 | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | ワイルド・ウィーゼル | 1965〜73年 | 作戦 | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | オールト報告書とトップガン | 1968〜72年 | 作戦 | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | 作戦リンバッカー | 1972年5〜10月 | 作戦 | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | リンバッカーII（「11日間の戦争」） | 1972年12月 | 作戦 | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | 作戦フォーカス（モケド） | 1967年6月5日 | 会戦 | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | 消耗戦争：ミサイル帯 | 1969〜70年 | 作戦 | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | 運河上空の地対空ミサイルの傘 | 1973年10月 | 会戦 | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | オシラク（作戦オペラ） | 1981年6月7日 | 交戦 | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | 作戦エルドラド・キャニオン | 1986年4月15日 | 交戦 | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | イラン・イラク航空戦 | 1980〜88年 | 作戦 | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | ブラックバック作戦 | 1982年5〜6月 | 交戦 | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | インスタント・サンダー：湾岸航空作戦の計画 | 1990年8月〜1991年1月 | 作戦 | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | 任務部隊ノルマンディー：最初のアパッチ攻撃 | 1991年1月17日 | 交戦 | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | 大スカッド狩り | 1991年1〜2月 | 作戦 | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | ムトラ尾根（「死のハイウェイ」） | 1991年2月26〜27日 | 交戦 | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | 作戦アナコンダ：シャヒ・コットのアパッチ | 2002年3月 | 会戦 | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | カルバラのアパッチ攻撃 | 2003年3月24日 | 交戦 | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | リビア航空作戦 | 2011年3〜10月 | 作戦 | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | ナゴルノ・カラバフ：ドローンと防空 | 2020年9〜11月 | 作戦 | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | ウクライナ：争われる空 | 2022年 | 作戦 | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | ホストメリ空港 | 2022年2月 | 交戦 | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | ラムソン719 | 1971年2〜3月 | 作戦 | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | 作戦イーグル・クロー | 1980年4月 | 交戦 | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | アフガニスタン：スティンガー | 1986〜89年 | 作戦 | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | レパント | 1571年 | 会戦 | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | スペインの無敵艦隊 | 1588年 | 作戦 | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | キブロン湾 | 1759年 | 会戦 | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | チェサピーク（ヴァージニア岬） | 1781年 | 会戦 | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | ナイル（アブキール湾） | 1798年 | 会戦 | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | コペンハーゲン | 1801年 | 会戦 | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | ハンプトン・ローズ | 1862年3月 | 交戦 | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | リッサ | 1866年 | 会戦 | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | 鴨緑江 | 1894年 | 会戦 | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | マニラ湾 | 1898年 | 会戦 | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | ヘルゴラント湾 | 1914年8月 | 会戦 | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | コロネルとフォークランド | 1914年11〜12月 | 作戦 | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | ドッガーバンク | 1915年1月 | 会戦 | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | ラプラタ川 | 1939年12月 | 会戦 | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | タラント | 1940年11月 | 交戦 | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | マタパン岬 | 1941年3月 | 会戦 | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | デンマーク海峡とビスマルクの撃沈 | 1941年5月 | 作戦 | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | 真珠湾 | 1941年12月7日 | 交戦 | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | プリンス・オブ・ウェールズとレパルス | 1941年12月10日 | 交戦 | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | ジャワ海 | 1942年2月 | 会戦 | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | 珊瑚海 | 1942年5月 | 会戦 | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | サボ島 | 1942年8月 | 会戦 | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | 東ソロモン | 1942年8月 | 会戦 | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | エスペランス岬 | 1942年10月 | 会戦 | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | サンタクルーズ諸島 | 1942年10月 | 会戦 | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | ガダルカナル島沖海戦 | 1942年11月12〜15日 | 会戦 | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | タサファロンガ | 1942年11月 | 交戦 | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | 海峡突破作戦 | 1942年2月 | 交戦 | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | 作戦ペデスタル | 1942年8月 | 会戦 | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | 暗黒の五月 | 1943年5月 | 作戦 | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | ノースケープ | 1943年12月 | 会戦 | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | 米潜水艦による対日作戦 | 1941〜45年 | 作戦 | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | サマール沖 | 1944年10月25日 | 会戦 | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | スリガオ海峡 | 1944年10月25日 | 会戦 | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | 沖縄：神風特攻作戦 | 1945年4〜6月 | 作戦 | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | エイラートの撃沈 | 1967年10月 | 交戦 | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | ラタキア | 1973年10月 | 会戦 | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | ベルグラーノ号の撃沈 | 1982年5月2日 | 交戦 | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | HMSシェフィールドの喪失 | 1982年5月4日 | 交戦 | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USSスターク | 1987年5月17日 | 交戦 | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | 作戦プレイング・マンティス | 1988年4月18日 | 会戦 | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | 2004年8月 | 交戦 | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu革命 | 2007年3月 | 会戦 | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | The International 2013の Dream Coil | 2013年8月 | 交戦 | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakerのゼドによる Ryu への攻撃 | 2013年9月 | 交戦 | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | オーバーパスのブースト | 2014年11月 | 交戦 | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Mirageでのジャンプ撃ちのAWP | 2016年4月 | 交戦 | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralisと補助装備の時代 | 2018年 | 作戦 | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI FiveのOG戦 | 2019年4月 | 会戦 | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStarがグランドマスターに到達 | 2019年 | 作戦 | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | 左フック（砂漠の嵐 地上攻勢） | 1991年2月24〜28日 | 作戦 | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | 「腐敗した血」事件 | 2005年9月 | 作戦 | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### ゲームとレベル設計 (17) {#game-and-level-design-17}

| id | 題名 | パターン | 出典 |
|---|---|---|---|
| `design.chokepoint` | レベル設計での隘路 | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | 側面の経路と代替ルート | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | 見通し線と交戦距離 | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | 遮蔽物の配置とリズム | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | 出現地点の設計と出現直後の保護 | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | 対称と非対称のマップのバランス | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | 兵科のバランスと相性 | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | 流れ、周回路、読みやすい配置 | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | ゲームの経済とフィードバックループ | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | マッチメイキングと実力の幅 | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | レベルを調べる道具としてのAI対戦相手 | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | 意味のあるプレイと選択 | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | 撃ち合いにおける相討ちとチームプレイ | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | マップの支配 | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | 設計でのヒートマップと空間テレメトリ | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | 習熟、学習、楽しさ | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | ラウンドの経済と購入の判断 | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### 研究 (113) {#studies-113}

| id | 題名 | 出典 |
|---|---|---|
| `study.engel-1954` | Engel：硫黄島でのランチェスターの二乗法則 | Engel 1954 |
| `study.bracken-1995` | Bracken：アルデンヌのランチェスター・モデル | Bracken 1995 |
| `study.fricker-1998` | Fricker：アルデンヌの消耗モデルの再検討 | Fricker 1998 |
| `study.lucas-turkes-2004` | LucasとTurkes：クルスクとアルデンヌ | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | HartleyとHelmbold：二乗法則の検証 | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | プレイヤーの死のGIS分析 | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse：競技的な行動の可視化 | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Counter-Strikeでの行動の価値づけ | Xenopoulos et al. 2020 |
| `study.schubert-2016` | eスポーツでの交戦の検出 | Schubert et al. 2016 |
| `study.red-baron` | プロジェクト・レッドバロン：ベトナム上空の空中戦 | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy：歴史的会戦の定量的な判断 | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle：戦力の運用が結果を説明する | Biddle 2004 |
| `study.wallner-kriglstein-2013` | ゲームプレイデータの可視化の調査 | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard：三世紀の陸上戦闘とランチェスター | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain：第二次世界大戦の六十の交戦 | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss：戦闘モデルと米国南北戦争 | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley：消耗データの統計モデル | Hartley 1995 |
| `study.helmbold-1995` | Helmbold：陸上戦闘での前進速度 | Helmbold 1995 |
| `study.lucas-dinges-2004` | LucasとDinges：法則より状況が重要 | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | クルスク・データベース | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | アルデンヌ作戦データベース | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | JohnsonとMacKay：ランチェスターのデータとしての英国の戦い | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | RotteとSchmidt：数はなお会戦に勝つ | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy：会戦の死傷の規則性 | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuyの戦術的数値決定論モデル | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence：数字で見る戦争 | Lawrence 2017 |
| `study.vancreveld-1982` | ヴァン・クレフェルト：戦闘力 | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | ReiterとStam：戦争をする民主主義国 | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein：適応動的モデル | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman：ランチェスターとゲリラ戦 | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong：確率的斉射モデル | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes：艦隊戦術の基礎 | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | 3対1の法則の論争 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress：武力紛争のモデル化 | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ault報告書：包絡線の外で発射されたミサイル | Ault 1969; Michel 1997 |
| `study.gwaps` | 湾岸戦争航空戦力調査 | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | ブラケットの「サーカス」 | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | 沿岸航空軍団の爆雷の深度設定 | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | 対潜航空機の白い下面 | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald：帰還した爆撃機に被弾がなかった場所に装甲を | Mangel & Samaniego 1984 |
| `study.optimal-search` | 最適捜索：潜水艦からAF447まで | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn：地獄での戦闘 | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | 接近阻止・領域拒否 | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | プレイヤーはどのように興味を失うか | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | 実際のプレイヤー行動のクラスタリング | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | プレイヤーのフラストレーションの検出 | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker：製品で使われるテレメトリのダッシュボード | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO：ゲームプレイのビジュアル分析 | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | World of Warcraftの戦場でのアバターの動き | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE：大規模なユーザーテストの計測 | Kim et al. 2008 |
| `study.game-data-science` | ゲームのデータサイエンス | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | 人工知能とゲーム | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Dota 2でのスキルとチームの動き | Drachen et al. 2014 |
| `study.yang-2014` | MOBAの勝利を予測する戦闘パターン | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Dota 2でのプレイヤーの役割 | Eggert et al. 2015 |
| `study.semenov-2017` | ドラフトからDota 2の結果を予測する | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | プロのeスポーツでのライブの勝利予測 | Hodge et al. 2021 |
| `study.rioult-2014` | プレイヤーの位置のトポロジー | Rioult et al. 2014 |
| `study.bednarek-2017` | チーム制のシューターでのプレイヤーの評価 | Bednárek et al. 2017 |
| `study.katona-2019` | 次に誰が死ぬかを予測する | Katona et al. 2019 |
| `study.block-2018` | eスポーツの観客のためのデータに基づく物語 | Block et al. 2018 |
| `study.ggviz` | ggViz：大規模なゲーム状態の検索 | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five：Dota 2での大規模な強化学習 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar：StarCraft IIでのグランドマスター級の強さ | Vinyals et al. 2019 |
| `study.cervone-2016` | バスケットボールでの期待される保持価値 | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP：サッカーでのボールに触れる行動の価値づけ | Decroos et al. 2019 |
| `study.pitch-control` | ピッチ支配と空間の創出 | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | 守備の技術の空間構造 | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | 追跡データからのチームの役割 | Lucey et al. 2013 |
| `study.shot-quality` | 期待ゴールとシュートの質 | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision：空間的なシュートの効率 | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | チームスポーツの時空間分析 | Gudmundsson & Horton 2017 |
| `study.ripley-k` | RipleyのK：あらゆる尺度での集まり | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | ClarkとEvans：最近傍の分散 | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ordのホットスポット | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | 空間的関連の局所指標 | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | 空間スキャン統計 | Kulldorff 1997 |
| `study.kde` | カーネル密度推定 | Silverman 1986 |
| `study.knox-1964` | 時空間の相互作用 | Knox 1964; Diggle 2013 |
| `study.maup` | 可変な地域単位の問題 | Openshaw 1984; Tobler 1970 |
| `study.isovists` | アイソビストと見通しグラフ | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | スペース・シンタックス | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | 平均混雑度 | Lloyd 1967 |
| `study.survival-analysis` | 死亡までの時間の生存分析 | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | 件数のための一般化線形モデル | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | ブートストラップと区間推定 | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokeyら：遅延と覗き見る側の優位 | Tokey et al. 2024 |
| `study.lee-chang-2017` | LeeとChang：角の向こうを撃つ | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool：遅延とプレイヤーの行動 | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulosら：勝率から見たプロとアマチュア | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulosら：Counter-Strikeの経済的な判断 | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin：賢いキルと無価値な死 | Maymin 2021 |
| `study.moba-live-prediction` | MOBAでのライブの結果予測 | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawaら：戦術的な特徴から見たValorantのラウンド | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskivら：プロのCounter-Strike 2での役割 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahimら：近接戦闘の訓練 | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | 2006年のハッジの群衆の乱流 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | 歩くグループが群衆を形作る | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | ハトの群れにおける階層的な集団の動き | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | 社会的影響が成功を不平等で予測しにくくする | Salganik et al. 2006 |
| `study.wisdom-undermined` | 社会的影響が群衆の知恵を損なう | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | 群衆の引き寄せる力 | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | 全員一致の多数への同調 | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight：イラクでの戦闘の動機 | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | 結束と成果：メタ分析 | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | プロのゴルファーの損失回避 | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | 野球のホットハンド | Green & Zwiebel 2018 |
| `study.penalty-kicks` | PKでプロはミニマックスで打つ | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | ウィンブルドンでのミニマックスの打ち方 | Walker & Wooders 2001 |
| `study.collective-intelligence` | チームの集合知 | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | オンラインの世界の社会的ネットワーク | Szell et al. 2010 |
| `study.team-networks` | パスのネットワークとチームの成績 | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | 行動は集団化したネットワークを通じて広がる | Centola 2010 |

### 文献一覧 {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *（2026-11-15 確認：詳細）*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *（2026-11-15 確認：詳細）*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *（2026-11-15 確認：詳細）*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *（2026-11-15 確認：詳細）*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *（2026-11-15 確認：詳細）*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *（2026-11-15 確認：詳細）*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *（2026-11-15 確認：詳細）*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *（2026-11-15 確認：詳細）*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *（2026-11-15 確認：詳細）*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *（2026-11-15 確認：詳細）*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *（2026-11-15 確認：詳細）*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *（2026-11-15 確認：詳細）*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *（2026-11-15 確認：詳細）*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *（2026-11-15 確認：詳細）*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *（2026-11-15 確認：詳細）*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *（2026-11-15 確認：詳細）*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *（2026-11-15 確認：詳細）*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *（2026-11-15 確認：詳細）*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *（2026-11-15 確認：詳細）*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *（2026-11-15 確認：詳細）*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *（2026-11-15 確認：詳細）*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *（2026-11-15 確認：詳細）*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *（2026-11-15 確認：詳細）*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *（2026-11-15 確認：詳細）*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *（2026-11-15 確認：詳細）*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *（2026-11-15 確認：詳細）*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *（2026-11-15 確認：詳細）*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *（2026-11-15 確認：存在）*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *（2026-11-15 確認：詳細）*
- Beevor, A. (1998). Stalingrad. Viking, London. *（2026-11-15 確認：詳細）*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *（2026-11-15 確認：詳細）*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *（2026-11-15 確認：詳細）*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *（2026-11-15 確認：詳細）*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *（2026-11-15 確認：詳細）*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *（2026-11-15 確認：存在）*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *（2026-11-15 確認：詳細）*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *（2026-11-15 確認：詳細）*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *（2026-11-15 確認：詳細）*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *（2026-11-15 確認：詳細）*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *（2026-11-15 確認：詳細）*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *（2026-11-15 確認：詳細）*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *（2026-11-15 確認：存在）*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *（2026-11-15 確認：詳細）*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *（2026-11-15 確認：詳細）*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *（2026-11-15 確認：詳細）*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *（2026-11-15 確認：詳細）*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *（2026-11-15 確認：存在）*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *（2026-11-15 確認：詳細）*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *（2026-11-15 確認：詳細）*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *（2026-11-15 確認：詳細）*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *（2026-11-15 確認：詳細）*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *（2026-11-15 確認：存在）*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *（2026-11-15 確認：詳細）*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *（2026-11-15 確認：詳細）*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *（2026-11-15 確認：詳細）*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *（2026-11-15 確認：詳細）*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *（2026-11-15 確認：詳細）*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *（2026-11-15 確認：詳細）*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *（2026-11-15 確認：詳細）*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *（2026-11-15 確認：詳細）*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *（2026-11-15 確認：詳細）*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *（2026-11-15 確認：詳細）*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *（2026-11-15 確認：詳細）*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *（2026-11-15 確認：詳細）*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *（2026-11-15 確認：詳細）*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *（2026-11-15 確認：詳細）*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *（2026-11-15 確認：詳細）*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *（2026-11-15 確認：詳細）*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *（2026-11-15 確認：詳細）*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *（2026-11-15 確認：詳細）*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *（2026-11-15 確認：詳細）*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *（2026-11-15 確認：詳細）*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *（2026-11-15 確認：詳細）*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *（2026-11-15 確認：存在）*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *（2026-11-15 確認：詳細）*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *（2026-11-15 確認：詳細）*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *（2026-11-15 確認：詳細）*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *（2026-11-15 確認：存在）*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *（2026-11-15 確認：存在）*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *（2026-11-15 確認：詳細）*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *（2026-11-15 確認：詳細）*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *（2026-11-15 確認：詳細）*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *（2026-11-15 確認：存在）*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *（2026-11-15 確認：詳細）*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *（2026-11-15 確認：詳細）*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *（2026-11-15 確認：詳細）*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *（2026-11-15 確認：詳細）*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *（2026-11-15 確認：詳細）*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *（2026-11-15 確認：存在）*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *（2026-11-15 確認：詳細）*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *（2026-11-15 確認：詳細）*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *（2026-11-15 確認：詳細）*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *（2026-11-15 確認：詳細）*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *（2026-11-15 確認：詳細）*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *（2026-11-15 確認：詳細）*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *（2026-11-15 確認：詳細）*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *（2026-11-15 確認：存在）*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *（2026-11-15 確認：詳細）*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *（2026-11-15 確認：詳細）*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *（2026-11-15 確認：詳細）*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *（2026-11-15 確認：詳細）*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *（2026-11-15 確認：詳細）*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *（2026-11-15 確認：詳細）*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *（2026-11-15 確認：詳細）*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *（2026-11-15 確認：詳細）*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *（2026-11-15 確認：詳細）*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *（2026-11-15 確認：存在）*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *（2026-11-15 確認：詳細）*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *（2026-11-15 確認：詳細）*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *（2026-11-15 確認：詳細）*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *（2026-11-15 確認：詳細）*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *（2026-11-15 確認：詳細）*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *（2026-11-15 確認：詳細）*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *（2026-11-15 確認：詳細）*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *（2026-11-15 確認：詳細）*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *（2026-11-15 確認：詳細）*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *（2026-11-15 確認：詳細）*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *（2026-11-15 確認：詳細）*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *（2026-11-15 確認：詳細）*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *（2026-11-15 確認：詳細）*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *（2026-11-15 確認：詳細）*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *（2026-11-15 確認：詳細）*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *（2026-11-15 確認：詳細）*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *（2026-11-15 確認：詳細）*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *（2026-11-15 確認：詳細）*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *（2026-11-15 確認：存在）*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *（2026-11-15 確認：詳細）*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *（2026-11-15 確認：詳細）*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *（2026-11-15 確認：詳細）*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *（2026-11-15 確認：詳細）*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *（2026-11-15 確認：詳細）*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *（2026-11-15 確認：詳細）*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *（2026-11-15 確認：詳細）*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *（2026-11-15 確認：詳細）*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *（2026-11-15 確認：詳細）*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *（2026-11-15 確認：詳細）*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *（2026-11-15 確認：詳細）*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *（2026-11-15 確認：詳細）*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *（2026-11-15 確認：詳細）*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *（2026-11-15 確認：詳細）*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *（2026-11-15 確認：詳細）*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *（2026-11-15 確認：詳細）*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *（2026-11-15 確認：詳細）*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *（2026-11-15 確認：詳細）*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *（2026-11-15 確認：詳細）*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *（2026-11-15 確認：詳細）*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *（2026-11-15 確認：詳細）*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *（2026-11-15 確認：詳細）*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *（2026-11-15 確認：詳細）*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *（2026-11-15 確認：詳細）*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *（2026-11-15 確認：詳細）*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *（2026-11-15 確認：詳細）*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *（2026-11-15 確認：詳細）*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *（2026-11-15 確認：詳細）*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *（2026-11-15 確認：詳細）*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *（2026-11-15 確認：詳細）*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *（2026-11-15 確認：詳細）*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *（2026-11-15 確認：詳細）*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *（2026-11-15 確認：詳細）*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *（2026-11-15 確認：詳細）*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *（2026-11-15 確認：詳細）*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *（2026-11-15 確認：詳細）*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *（2026-11-15 確認：詳細）*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *（2026-11-15 確認：詳細）*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *（2026-11-15 確認：詳細）*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *（2026-11-15 確認：詳細）*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *（2026-11-15 確認：詳細）*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *（2026-11-15 確認：詳細）*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *（2026-11-15 確認：詳細）*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *（2026-11-15 確認：詳細）*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *（2026-11-15 確認：詳細）*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *（2026-11-15 確認：詳細）*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *（2026-11-15 確認：詳細）*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *（2026-11-15 確認：詳細）*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *（2026-11-15 確認：詳細）*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *（2026-11-15 確認：詳細）*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *（2026-11-15 確認：詳細）*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *（2026-11-15 確認：詳細）*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *（2026-11-15 確認：詳細）*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *（2026-11-15 確認：存在）*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *（2026-11-15 確認：詳細）*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *（2026-11-15 確認：詳細）*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *（2026-11-15 確認：詳細）*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *（2026-11-15 確認：詳細）*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *（2026-11-15 確認：詳細）*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *（2026-11-15 確認：詳細）*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *（2026-11-15 確認：詳細）*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *（2026-11-15 確認：詳細）*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *（2026-11-15 確認：詳細）*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *（2026-11-15 確認：詳細）*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *（2026-11-15 確認：詳細）*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *（2026-11-15 確認：詳細）*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *（2026-11-15 確認：詳細）*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *（2026-11-15 確認：詳細）*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *（2026-11-15 確認：詳細）*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *（2026-11-15 確認：詳細）*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *（2026-11-15 確認：詳細）*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *（2026-11-15 確認：詳細）*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *（2026-11-15 確認：詳細）*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *（2026-11-15 確認：詳細）*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *（2026-11-15 確認：詳細）*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *（2026-11-15 確認：詳細）*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *（2026-11-15 確認：存在）*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *（2026-11-15 確認：詳細）*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *（2026-11-15 確認：詳細）*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *（2026-11-15 確認：詳細）*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *（2026-11-15 確認：詳細）*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *（2026-11-15 確認：詳細）*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *（2026-11-15 確認：詳細）*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *（2026-11-15 確認：詳細）*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *（2026-11-15 確認：詳細）*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *（2026-11-15 確認：詳細）*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *（2026-11-15 確認：詳細）*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *（2026-11-15 確認：詳細）*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *（2026-11-15 確認：詳細）*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *（2026-11-15 確認：詳細）*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *（2026-11-15 確認：存在）*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *（2026-11-15 確認：詳細）*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *（2026-11-15 確認：詳細）*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *（2026-11-15 確認：詳細）*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *（2026-11-15 確認：詳細）*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *（2026-11-15 確認：詳細）*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *（2026-11-15 確認：詳細）*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *（2026-11-15 確認：詳細）*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *（2026-11-15 確認：詳細）*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *（2026-11-15 確認：詳細）*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *（2026-11-15 確認：詳細）*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *（2026-11-15 確認：存在）*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *（2026-11-15 確認：詳細）*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *（2026-11-15 確認：詳細）*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *（2026-11-15 確認：詳細）*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *（2026-11-15 確認：詳細）*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *（2026-11-15 確認：詳細）*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *（2026-11-15 確認：存在）*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *（2026-11-15 確認：詳細）*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *（2026-11-15 確認：詳細）*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *（2026-11-15 確認：詳細）*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *（2026-11-15 確認：詳細）*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *（2026-11-15 確認：詳細）*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *（2026-11-15 確認：存在）*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *（2026-11-15 確認：詳細）*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *（2026-11-15 確認：詳細）*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *（2026-11-15 確認：詳細）*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *（2026-11-15 確認：詳細）*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *（2026-11-15 確認：存在）*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *（2026-11-15 確認：詳細）*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *（2026-11-15 確認：詳細）*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *（2026-11-15 確認：詳細）*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *（2026-11-15 確認：詳細）*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *（2026-11-15 確認：詳細）*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *（2026-11-15 確認：詳細）*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *（2026-11-15 確認：詳細）*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *（2026-11-15 確認：詳細）*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *（2026-11-15 確認：詳細）*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *（2026-11-15 確認：詳細）*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *（2026-11-15 確認：存在）*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *（2026-11-15 確認：詳細）*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *（2026-11-15 確認：詳細）*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *（2026-11-15 確認：詳細）*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *（2026-11-15 確認：詳細）*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *（2026-11-15 確認：詳細）*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *（2026-11-15 確認：詳細）*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *（2026-11-15 確認：詳細）*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *（2026-11-15 確認：詳細）*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *（2026-11-15 確認：詳細）*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *（2026-11-15 確認：詳細）*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *（2026-11-15 確認：存在）*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *（2026-11-15 確認：存在）*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *（2026-11-15 確認：詳細）*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *（2026-11-15 確認：詳細）*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *（2026-11-15 確認：詳細）*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *（2026-11-15 確認：詳細）*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *（2026-11-15 確認：詳細）*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *（2026-11-15 確認：存在）*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *（2026-11-15 確認：存在）*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *（2026-11-15 確認：詳細）*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *（2026-11-15 確認：詳細）*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *（2026-11-15 確認：存在）*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *（2026-11-15 確認：詳細）*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *（2026-11-15 確認：詳細）*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *（2026-11-15 確認：詳細）*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *（2026-11-15 確認：詳細）*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *（2026-11-15 確認：詳細）*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *（2026-11-15 確認：詳細）*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *（2026-11-15 確認：詳細）*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *（2026-11-15 確認：詳細）*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *（2026-11-15 確認：詳細）*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *（2026-11-15 確認：詳細）*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *（2026-11-15 確認：詳細）*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *（2026-11-15 確認：詳細）*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *（2026-11-15 確認：詳細）*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *（2026-11-15 確認：詳細）*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *（2026-11-15 確認：存在）*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *（2026-11-15 確認：詳細）*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *（2026-11-15 確認：詳細）*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *（2026-11-15 確認：詳細）*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *（2026-11-15 確認：詳細）*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *（2026-11-15 確認：詳細）*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *（2026-11-15 確認：詳細）*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *（2026-11-15 確認：詳細）*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *（2026-11-15 確認：詳細）*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *（2026-11-15 確認：詳細）*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *（2026-11-15 確認：詳細）*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *（2026-11-15 確認：詳細）*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *（2026-11-15 確認：詳細）*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *（2026-11-15 確認：詳細）*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *（2026-11-15 確認：詳細）*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *（2026-11-15 確認：詳細）*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *（2026-11-15 確認：詳細）*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *（2026-11-15 確認：詳細）*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *（2026-11-15 確認：詳細）*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *（2026-11-15 確認：詳細）*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *（2026-11-15 確認：詳細）*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *（2026-11-15 確認：詳細）*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *（2026-11-15 確認：詳細）*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *（2026-11-15 確認：詳細）*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *（2026-11-15 確認：詳細）*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *（2026-11-15 確認：詳細）*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *（2026-11-15 確認：詳細）*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *（2026-11-15 確認：詳細）*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *（2026-11-15 確認：詳細）*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *（2026-11-15 確認：詳細）*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *（2026-11-15 確認：詳細）*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *（2026-11-15 確認：詳細）*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *（2026-11-15 確認：詳細）*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *（2026-11-15 確認：詳細）*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *（2026-11-15 確認：詳細）*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *（2026-11-15 確認：詳細）*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *（2026-11-15 確認：詳細）*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *（2026-11-15 確認：詳細）*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *（2026-11-15 確認：詳細）*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *（2026-11-15 確認：詳細）*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *（2026-11-15 確認：詳細）*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *（2026-11-15 確認：詳細）*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *（2026-11-15 確認：詳細）*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *（2026-11-15 確認：詳細）*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *（2026-11-15 確認：存在）*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *（2026-11-15 確認：存在）*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *（2026-11-15 確認：存在）*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *（2026-11-15 確認：存在）*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *（2026-11-15 確認：詳細）*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *（2026-11-15 確認：詳細）*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *（2026-11-15 確認：詳細）*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *（2026-11-15 確認：詳細）*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *（2026-11-15 確認：詳細）*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *（2026-11-15 確認：詳細）*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *（2026-11-15 確認：詳細）*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *（2026-11-15 確認：詳細）*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *（2026-11-15 確認：存在）*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *（2026-11-15 確認：詳細）*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *（2026-11-15 確認：詳細）*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *（2026-11-15 確認：詳細）*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *（2026-11-15 確認：詳細）*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *（2026-11-15 確認：存在）*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *（2026-11-15 確認：詳細）*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *（2026-11-15 確認：存在）*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *（2026-11-15 確認：詳細）*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *（2026-11-15 確認：詳細）*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *（2026-11-15 確認：詳細）*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *（2026-11-15 確認：詳細）*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *（2026-11-15 確認：存在）*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *（2026-11-15 確認：詳細）*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *（2026-11-15 確認：詳細）*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *（2026-11-15 確認：詳細）*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *（2026-11-15 確認：詳細）*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *（2026-11-15 確認：詳細）*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *（2026-11-15 確認：詳細）*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *（2026-11-15 確認：詳細）*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *（2026-11-15 確認：詳細）*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *（2026-11-15 確認：詳細）*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *（2026-11-15 確認：詳細）*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *（2026-11-15 確認：詳細）*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *（2026-11-15 確認：存在）*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *（2026-11-15 確認：詳細）*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *（2026-11-15 確認：詳細）*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *（2026-11-15 確認：詳細）*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *（2026-11-15 確認：詳細）*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *（2026-11-15 確認：詳細）*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *（2026-11-15 確認：詳細）*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *（2026-11-15 確認：詳細）*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *（2026-11-15 確認：詳細）*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *（2026-11-15 確認：詳細）*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *（2026-11-15 確認：詳細）*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *（2026-11-15 確認：詳細）*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *（2026-11-15 確認：詳細）*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *（2026-11-15 確認：詳細）*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *（2026-11-15 確認：詳細）*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *（2026-11-15 確認：詳細）*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *（2026-11-15 確認：詳細）*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *（2026-11-15 確認：詳細）*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *（2026-11-15 確認：詳細）*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *（2026-11-15 確認：詳細）*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *（2026-11-15 確認：詳細）*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *（2026-11-15 確認：存在）*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *（2026-11-15 確認：詳細）*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *（パブリックドメイン）* *（2026-11-15 確認：存在）*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *（2026-11-15 確認：詳細）*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *（2026-11-15 確認：詳細）*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *（2026-11-15 確認：詳細）*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *（2026-11-15 確認：詳細）*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *（2026-11-15 確認：詳細）*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *（2026-11-15 確認：詳細）*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *（2026-11-15 確認：詳細）*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *（2026-11-15 確認：詳細）*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *（2026-11-15 確認：存在）*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *（2026-11-15 確認：詳細）*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *（2026-11-15 確認：存在）*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *（2026-11-15 確認：存在）*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *（2026-11-15 確認：詳細）*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *（2026-11-15 確認：存在）*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *（2026-11-15 確認：詳細）*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *（2026-11-15 確認：詳細）*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *（2026-11-15 確認：詳細）*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *（2026-11-15 確認：詳細）*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *（2026-11-15 確認：詳細）*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *（2026-11-15 確認：存在）*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *（2026-11-15 確認：詳細）*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *（2026-11-15 確認：詳細）*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *（2026-11-15 確認：詳細）*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *（2026-11-15 確認：詳細）*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *（パブリックドメイン）* *（2026-11-15 確認：詳細）*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *（2026-11-15 確認：詳細）*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *（2026-11-15 確認：詳細）*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *（2026-11-15 確認：詳細）*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *（2026-11-15 確認：存在）*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *（2026-11-15 確認：詳細）*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *（2026-11-15 確認：存在）*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *（2026-11-15 確認：存在）*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *（2026-11-15 確認：詳細）*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *（2026-11-15 確認：詳細）*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *（2026-11-15 確認：詳細）*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *（2026-11-15 確認：詳細）*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *（2026-11-15 確認：詳細）*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *（2026-11-15 確認：詳細）*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *（2026-11-15 確認：詳細）*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *（2026-11-15 確認：詳細）*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *（2026-11-15 確認：詳細）*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *（2026-11-15 確認：詳細）*

<!-- kb:end -->
