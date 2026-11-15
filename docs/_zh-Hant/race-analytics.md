---
title: "賽車分析：方法"
parent: "賽車分析"
nav_order: 58
lang: "zh-Hant"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# 賽車分析：方法

簡要說明：

- 單圈以**距離**比較，而不是以時間比較，這樣賽道上同一個地點才會對齊。
- 每個彎道都**整體**判斷，從一個煞車區到下一個煞車區。
- 損失的時間會**拆分**：在哪裡損失（煞車、入彎、出彎、直線），以及車輛能解釋多少。
- 原因會用**文字說明**，並附上建議。
- 若要使用它，請看[賽車分析](race-analysis.md)；這裡說的是方法，不是操作說明。

這是**賽車分析**分頁背後的方法：它量測什麼、如何判斷時間是在哪裡損失的，以及如何把結果變成建議。它是分析程式碼（`src/race/`）所依循的規格，因此這裡的每條規則都有對應的程式碼，並有測試加以固定。

## 專業工具怎麼做 {#what-the-professional-tools-do}

這些成熟的工具大致有相同的核心，主要差別在於它們對*原因*探究到什麼程度：

- **一切都以距離比較，而不是時間。** 兩圈會被重新取樣到同一條距離軸上；在相同距離處，累計的經過時間差就是*差值*（*delta*）。（MoTeC 稱它為時間變化量（time variance），其他工具則稱為時間差（time slip）或差值線（delta trace）。）差值線的斜率說明此刻時間正在哪裡流失：斜率平緩表示加速、空氣阻力或持續的抓地力；斜率陡峭表示煞車或油門的差異；起伏的波浪則表示入彎速度和出彎之間的取捨。
  （[MoTeC i2](https://www.motec.com.au/i2/i2highlights/)、
  [區段時間分析](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)、
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer)）
- **每個彎道都分成階段**：煞車、入彎、中段、出彎——煞車點、煞車峰值與放開、最低速度及其位置、檔位、油門開始踩、回到全油門、出彎速度。
  （[Driver61：六個階段](https://driver61.com/uni/corner-phases/)、
  [iRacing 圈速分析指南](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)）
- **每個彎道有迷你分段，並由各段最快的成績拼出理論最佳圈。**
  （[Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps)、
  [Overcut](https://overcut.gg/)）
- **實際走線也會被比較，但絕不單獨看**：「在圖上看一條線，在你知道影響因素之前毫無意義」——要和速度曲線與差值線一起讀。
  （[Track Titan：如何分析遙測](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)、
  [Sim Racing Telemetry：賽車走線](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)）
- **找根本原因，而不是表面症狀。** 直線上的損失，真的是油門的問題嗎？還是因為入彎不好，逼得油門必須晚踩？失誤會依圈速損失大小排序，並用淺白的話解釋。
  （[Track Titan 教練流程](https://www.tracktitan.io/post/november-2025-update-coaching-flows)）

### 第一版出了什麼問題，為什麼重要 {#what-went-wrong-in-the-first-version-and-why-it-matters}

第一版會把每個*階段*各自計算，而且只看損失。一圈如果提早煞車，就會在煞車階段損失時間，然後被告知要晚一點煞車——即使這樣提早煞車讓車子更早轉向、更早踩油門、出彎時速度更快，並在直線上全部贏回來。在一次測試中，系統告訴那一圈「煞車要晚很多」，但另一圈（確實晚煞車）卻漏了頂點、衝出賽道，正好損失了它賺到的時間。時間資料顯示兩種走法持平，建議卻說了相反的話。

修正的做法，是上面所有來源都同意的規則：**彎道要整體判斷**，從這個彎道的煞車區，到下一個彎道的煞車區。因為「在一個彎道上犧牲幾毫秒，有時可以讓之後的區段更快，進而改善整圈的時間」（[Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)）。

## 規則中編碼的賽車知識 {#racing-knowledge-the-rules-encode}

**出彎速度比入彎速度更重要**，而且後面的直線越長，影響越大：「直線上花的時間主導彎道上花的時間」，出彎時少掉的速度，會一路帶到下一個煞車點。一段彎道加直線最快的走法，常常是把彎開慢一點，讓油門早一點踩下去——*慢進快出*。
（[Race & Track Driving：提升圈速的順序](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)、
[Driver61：彎道的優先順序](https://driver61.com/uni/prioritising-corners/)）
如果最短時間規劃器同時因出彎速度而獲得獎勵，它會把頂點往後移，跑出*更快*的圈速；能平衡兩者的獎勵，每單位出彎速度值 `L / v²`（直線長度為 `L`，速度為 `v`）。也就是說，速度差在直線上造成的時間損失，會隨直線長度增加，並隨速度平方減少。
（[arXiv 2504.12744](https://arxiv.org/abs/2504.12744)）

**依彎道接的是什麼來分類。** 接直線的彎道：盡量提高出彎速度，晚一點頂點，儘早回到全油門。位於直線末端的彎道：盡量保留進入時的速度，儘量晚煞車，提早頂點也可以接受。夾在彎道之間的：為重要的那個彎做取捨。可能兩種都算的彎道，一律當作接直線的彎道處理。速度越快的彎道權重越高：速度快時車子加速力較弱，損失掉的每一公里/小時都很難再追回來。
（[Allen Berg：三種彎道](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)、
[Driver61：彎道的優先順序](https://driver61.com/uni/prioritising-corners/)、
[Driver61：不同彎道，不同技巧](https://driver61.com/uni/different-corner-technique/)）

**摩擦圓。** 輪胎只有一份抓地力預算，可以用在煞車、過彎和加速的任意組合；總加速度為 `sqrt(lat² + long²)`。煞車中途放開（trail braking）就是沿著這個圓的邊緣走：方向盤轉動、側向負荷增加時，煞車隨之放開。
（[摩擦圓](https://www.yourdatadriven.com/friction-circle-introduction/)、
[g-g 圖](https://trailbrake.com/data-analysis-tips/gg-diagram/)）

**滑行**——兩腳都沒踩——是最慢的減速方式，也是一項可以單獨衡量的關鍵績效指標。
（[Racecar Engineering / OptimumG：滑行係數](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)）

**滑移率。** 縱向力在約 10-20% 的滑移率時達到峰值，之後下降；超過這點，煞車時車輪會鎖死，動力輸出時則會空轉。Forza 會回報經過正規化的滑移率：0 代表完全抓地，超過 1 的絕對值代表已失去抓地力。
（[縱向滑移](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)、
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)）

**轉向不足與轉向過度。** 前輪的側滑角大於後輪，是轉向不足；後輪大於前輪，是轉向過度。沒有側滑角資料時：車子轉得比方向盤要求的少（方向盤角度超過車子在低速時所需的阿克曼角 `L/R`）。
（[轉向不足概述](https://www.sciencedirect.com/topics/engineering/understeer)、
[轉向不足與轉向過度（維基百科）](https://en.wikipedia.org/wiki/Understeer_and_oversteer)）

## 走線的幾何 {#the-geometry-of-a-line}

車子在半徑 `R` 的彎道上能維持的速度是 `v = sqrt(a R)`，其中 `a` 是輪胎能提供的側向加速度（再加上下壓力帶來的部分，它會隨 `v²` 增加）。所以**速度與半徑的平方根成正比**：中段走一條半徑大 20% 的線，那裡大約快 10%。
（[最大過彎速度](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)、
[formula1-dictionary：過彎](https://www.formula1-dictionary.net/cornering_tech.html)）

**幾何走線**是穿過彎道的最大圓弧：從外側邊緣出發，在頂點貼近內側，再回到外側。若彎道轉過 `θ` 角，路寬為 `w`（扣掉車寬），一條同時與兩側外緣相切、並貼近內側角的圓弧，其半徑為 `R = w / (1 - cos(θ/2))`（再加上內側邊緣自身的半徑）——直角彎約為 `3.4 w`，髮夾彎約為 `w`。這就是為什麼善用路寬在中型彎道最重要，在髮夾彎則最不重要。
（[賽車走線](https://en.wikipedia.org/wiki/Racing_line)）

**晚頂點**會較晚切入、切得更深，一開始的半徑較小，出彎時半徑逐漸打開：中段速度較慢，但能更早拉直、更早踩到全油門——「最低速稍微低一點，但出彎時加速曲線更強」。**早頂點**正好相反：入彎較快，但出彎時半徑收緊，反而會限制油門——除了在極低抓地力的路面，因為入彎時損失的速度無法在出彎時補回來，否則幾乎都是失誤。
（[賽車走線](https://en.wikipedia.org/wiki/Racing_line)、
[賽車遙測詞彙](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)、
[賽車走線的數學（第二部分）](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)）

**「V」與「U」。** U 是經典的圓弧走線：半徑最大，方向盤變化最少。V 切入較早、切得較深，中段讓車子快速轉向，並為出彎排好路線，好讓車子能更直地駛出：煞車保持直線（因此可以晚一點煞），最低速較低但出現得較晚，全油門也來得早很多。
（[Track Titan：V 型走線](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)）

**曲率與距離。** 最快的走線，是最短路徑與曲率最小的路徑之間的折衷；在賽道的寬度範圍內，曲率比較重要。只要車子處於極限，曲率最小的走線就會接近最短時間的走線，只有在車子其實還能加速的地方才會分開。
（[考量曲率與距離的全域最短時間軌跡規劃](https://www.nature.com/articles/s41598-025-21211-2)、
[TUM 全域賽道軌跡最佳化](https://github.com/TUMFTM/global_racetrajectory_optimization)）

**連續彎**——雙頂點、連續彎道——是同一個問題：前一個彎的出彎線，就是下一個彎的入彎線；它們要從接直線的那個彎開始，往回逆推。
（[Driver61：不同彎道，不同技巧](https://driver61.com/uni/different-corner-technique/)）

## 哪種走線適合哪種車 {#which-line-suits-which-car}

決定因素是車子在該彎速度下的**動力與抓地力之比**——「動量是抓地力對動力的比值，是一個比例問題」。
（[Ross Bentley：動量型賽車](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)、
[動量勝過馬力](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)）

| 在這個彎道上的車 | 走線 | 原因 |
|---|---|---|
| 相對於抓地力，加速很猛（「點了就射」，point and shoot） | V：直線煞車、晚煞，中段短而緊地轉向，出彎盡早拉直、盡早全油門 | 時間是靠全油門贏回來的，而不是靠最低速 |
| 相對於抓地力，加速較弱（「動量型」，momentum） | 較寬的 U，稍晚的頂點，維持最低速 | 它無法把丟掉的速度再贏回來 |
| 介於兩者之間 | 慢進快出：晚頂點的 U | 經典的折衷 |
| 快速彎，有下壓力時更是如此 | U，接近幾何走線 | 速度高時加速本來就弱；下壓力帶來的抓地力隨 `v²` 增加，所以中段的速度等於賺了兩次 |
| 抓地力極低（濕滑、雪地） | 較早的頂點 | 入彎時損失的速度無法再補回來 |
| 動力遠超過抓地力 | 走線的影響較小 | 限制出彎的是牽引力，而不是走線 |

「彎道越快，越接近幾何走線；彎道越慢，越要用晚頂點去改動它。」
（[Skip Barber：Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)、
[賽車走線的數學（第二部分）](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)、
[Track Titan：V 型走線](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)、
[Driver61：抓地力](https://driver61.com/uni/grip/)）

驅動方式對「怎麼開這條線」的影響，大過走線本身：前驅車要靠煞車把車身轉向（trail braking），並且等車輪放鬆後才給油，否則會往外漂；動力強的後驅車，要先把車拉直才能踩全油門，否則後輪會滑開；四驅車則可以邊轉向邊給油，因此油門能提早踩下。
（[FWD 技巧](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)、
[RWD 與 FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)、
[AWD 與 RWD 過彎](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)）

查看器會從車子自己的駕駛數據，量測每個彎道的動力與抓地力之比——以出彎速度下的全油門加速度，除以最低速時的側向抓地力——在 0.45 以上稱為「點了就射」，0.25 以下稱為「動量型」。若車子在 150-250 公里/小時的抓地力，比 55-110 公里/小時的抓地力高出 15% 以上，代表下壓力正在起作用。

## 方法 {#the-method}

以下的數字是推理過程。程式使用的門檻值各自記錄在一個頁面上，當這裡的數字與那些頁面不同時，以那些頁面為準：[逐彎分析](race-corner-analysis.md)、[車輛控制事件](race-control-events.md)、[車輛設定與比較](race-car-profiles.md)，以及[賽道統計](race-course-statistics.md)。

### 1. 一條距離軸 {#one-distance-axis}

最快的一圈是參考圈，除非使用者另外選擇。它的實際行駛路線就是距離軸：其他每一圈的樣本都會投影到它上面，每個樣本會得到一個沿參考圈的距離 `s`，以及一個帶正負號的側向偏移 `d`。投影只會從前一個配對點往前搜尋，因此一圈若曾交叉經過自己，就不會跳到橋的另一側。之後，所有圈都會在每 2 m 的同一格網上，對每個通道重新取樣。每一圈最後幾公尺會以它當時的速度延伸，讓它在終點的差值就等於圈速差。

### 2. 彎道，以及每個彎道在整圈中的比重 {#corners-and-each-corners-share-of-the-lap}

彎道、區段與連續彎如何找出來：[逐彎分析](race-corner-analysis.md#segments-braking-zone-to-braking-zone)。

### 3. 彎道的時間帳 {#the-time-account-of-a-corner}

淨差、拆分、出彎速度與車輛的牽引力：[逐彎分析](race-corner-analysis.md#the-time-account-of-a-corner)。

### 4. 判定與原因 {#the-verdict-and-the-cause}

判定的模式，以及入彎與出彎的原因：[逐彎分析](race-corner-analysis.md#the-verdict-and-the-finding)。

### 5. 車輛與駕駛的分別 {#the-car-against-the-driver}

當單圈使用不同車輛時，車輛能解釋的那部分損失會先被扣掉，分成幾個部分：

- **牽引力**：兩車從相同速度駛過直線時的表現，如上所述；
- **抓地力**：在最低速中，扣掉由較小半徑解釋的部分之後，剩餘的那部分，佔比為 `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`，且該圈必須在車子的極限（達到該速度下所展現能力的 90%）；
- **煞車**：從 `u` 減速到 `v`，煞車減速度分別為 `a1` 與 `a2`，並在同一點結束，其成本為 `(1/a1 - 1/a2)(u - v)² / 2u`——只有在該圈於整個煞車區平均煞車力道，接近車子能做到的上限（而不只是峰值）時才計算。

每台車能做到什麼，是由每一圈已載入的資料共同決定：每 5 m/s 的速度區間內，側向抓地力、煞車與全油門加速度（分別取第 95、第 95、第 90 百分位）。抓地力量的是車子**持續保持半秒**的表現——也就是側向加速度在 0.5 秒內的平均值，而不是某一個樣本碰到的最高值。路肩、側滑後的回正、被其他車追上，都會讓單一樣本瞬間飆高；一台常做這些事的車，看起來會比實際更有抓地力。（已用兩台不同車輛的實際單圈驗證：逐樣本的量法讓兩車非常接近；改用持續半秒來量，則能像它們的圈速一樣把兩車分開。）煞車與牽引力的計算，會把每個樣本取它自己與鄰近樣本的中位數。空中的時段、落地後的穩定時間，以及在車輛恢復之前的每一次碰撞（第 6 節），都會被排除。

**每台車的特性是什麼**（`profile.ts`），來自同一批單圈：

- **抓地力保持**：該半秒側向加速度的第 95 百分位；
- **牽引力**：全油門，在 0-50、50-120、120-200 公里/小時以及 200 以上各速度區間的加速能力，以及它曾展現的最大值；
- **煞車**：從 60 到 160 公里/小時的煞車能力；
- **極速**：在直線上全油門，車速不再增加超過一秒的那個速度。是直線地駛過，而不是把長彎用全油門帶過——在那裡，車子無論動力多大都會損失速度。若沒有夠長的直線，就以它在最高速時仍在拉的力道，推算它距離極速還有多遠。除了資料顯示的範圍外，不做任何猜測：曾有一次用「動力對速度，加上空氣阻力」去擬合，結果讓一般道路車的極速高估了 100 公里/小時，因為齒比和限速器會比空氣阻力更早結束車子的拉力；
- **失去後輪**：一圈中側滑超過 10° 漂移角（在鬆散路面則為 20°），且方向盤朝相反方向打來反打修正的次數；其中有多少次是在油門下開始的，以及它們開始時佔抓地力的比例。刻意輕微側滑的車並沒有失去什麼；需要被拉回來的，才算失去後輪。每台車都用同樣的標準計算，因此兩台車可以互相比較；
- **平衡**：有側滑角資料時，於極限狀態下比較前輪與後輪的側滑角。

**車輛比較**會把車輛並排列出：一張表格，加上每台車相對於另一台的一句描述（例如「X 加速較好，但轉向不夠猛，煞車距離較長，也比較容易失去後輪」），以及每一項明顯的差異（抓地力差 4%、牽引力或煞車差 5%、極速差 4 公里/小時，或後輪被拉回的次數多出一次以上，且多了一半以上），還有每台車該怎麼開。只有一台車時，它會說明那台車的特性。

**在每一個彎道中**，當單圈使用不同車輛時，判定文字會說明其中哪些是車輛決定的，以及如何把這台車發揮到最好：

- **中段**：在另一台車的走線上，這台車的抓地力能允許 `v_other · √(grip_mine / grip_other)` 的速度。如果該圈保持了這個速度，差距就來自車輛本身，任何煞車點都改變不了它——這會被說明，並把這個彎歸因於車，而非駕駛；如果保持的速度較低，剩下的部分就還能拿回來，並會說明拿回多少。接著說明時間可以從哪裡賺回來：接直線的彎，或者在頂點之後、牽引力更強的車——直線煞車、晚一點切入、早點讓車頭對準出口；否則，就是道路允許的最大半徑，因為只有更大的半徑，才能在不增加抓地力的前提下得到更多速度；
- **後輪失控**：在這台車上，這個彎道的後輪曾經失控，而它又比另一台車更容易失控：說明在這台車上該怎麼做——隨著方向盤回正，慢慢給油；或是在過彎中不要抬油，而是溫和地放開煞車，依它的側滑如何開始來決定；
- **之後的直線**：另一台車在相同速度下更強的牽引力，在直線上佔用了多少時間，以及這台車在哪裡用完了牽引力；
- **煞車點更早**：在煞車力道較弱的車上，煞車點需要提前。

圈中若在彎道中段側滑（在柏油上超過 10° 漂移角），代表它是超過了抓地力，而不是抓地力不夠；它絕不會被告知在那裡還有抓地力可用。而若該圈的後輪在低於彎道所需的側向加速度時就已經放掉，「還有抓地力可用」會建議用小步慢慢找回來。

### 6. 車輛控制：鎖死、輪胎空轉、側滑與推擠、碰撞與撞車 {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

每一圈也會檢查車子是如何被操控的——哪個輪胎鎖死、驅動輪在哪裡空轉、後輪在哪裡滑開、前輪在哪裡寬寬地漂出去——因為這些失誤是單靠時間無法指出來的。有三件事讓它能跨遊戲、跨路面都成立。

**抓地力消失的地方，是從車子本身的駕駛量出來的。** 工程師通常會為每台車設定一個鎖死門檻，取能產生最大減速度的滑移率（例如 OptimumG 煞車系列中，某台車使用的 MoTeC 通道是 -0.07），而不是採用書上的數值，而且書上的數值本來就彼此不一致：柏油上的摩擦力峰值出現在 5-20% 的滑移率，視輪胎與模型而定；雪地則在 6% 或 20-60%，視資料來源而定；碎石路則沒有任何來源給出數值。遊戲對滑移率的縮放方式又各不相同：Forza 的滑移率是「正規化」的，超過 1 就代表失去抓地力——然而，車子的煞車可能在遠低於或遠高於 1 的地方發揮最好，而一般的煞車區也可能超過 1。因此，對每台車，在它的每一圈資料中，把它產生的力量對它所經歷的滑移量分組：直線煞車時，減速度對車輪的滑移率；加速時（以該速度下車子能做到的比例表示），對驅動輪的滑移率；過彎抓地力（以該速度下車子抓地力的比例表示），對各軸的側滑角。極限就是超過最佳點之後，力量已下降 8% 時的滑移量。若資料中某條曲線從不下降——例如 Forza Horizon 的過彎與牽引——就沒有極限，也就不能單靠滑移來標記任何事。資料太少時，極限就取標稱峰值的 1.5 倍。

**地面在每個樣本都是已知的**，只要遊戲有提供：Forza 會在碎石、泥土與草地上讓輪胎震動（在柏油賽道上樣本很少，在泥地與越野賽道上則很多）；Trackmania 會標出每個輪胎下的材質；拉力賽路段的地面則依第 11 節所述找出。彎道的曲線、漂移習慣與門檻，會分別為柏油與鬆散路面各自設定。

**每個事件都會放到另一圈相同的距離上比較。** 在碎石、雪地，或是漂移很多的街機賽車中，側滑本來就是過彎的方式：最佳控制的研究發現，柏油上是「低漂移」的解，越野上則是「激進、高漂移、甚至要反打方向盤」的解；拉力賽的資料也顯示，輪胎「深入非線性區」，而且在非常鬆散的地面上鎖死車輪，甚至能讓車子更快停下來。因此，若另一圈也有同樣的事件——佔 80% 或以上——那就是這個彎道的開法，而不是失誤；若另一圈沒有，才算失誤，但前提是它造成了時間損失：從事件發生前到事件後 40 m 之間損失的時間。若某個失誤解釋了彎道損失的 40% 以上，它就會成為該彎道的原因。

偵測門檻、「另一圈測試」、碰撞與撞車，以及建議文字：[車輛控制事件](race-control-events.md)。

### 6b. 多圈資料：賽道統計 {#b-many-laps-the-courses-statistics}

車種比較、什麼算失誤、統計資料與失誤地圖：[賽道統計](race-course-statistics.md)。

### 7. 實際走線 {#the-driven-line}

對每一圈與每個彎道，只根據位置資料：從它開始轉向的地方（曲率最大值的五分之一處）、它的最小半徑（±8 m 範圍內）、轉向角前半段與後半段的平均半徑，然後：

- **形狀**：最小半徑與平均半徑的比值低於 0.55 為 V，高於 0.75 為 U；
- **頂點**：出口半徑與入口半徑的比值高於 1.25 為晚頂點，低於 0.8 為早頂點；
- **速度頂點**：最低速點比轉向中點早超過 15 m，為慢進快出；比中點晚超過 15 m，表示過了中段還在減速。

與另一圈比較：在入彎、最小半徑處，以及兩圈都已踩到全油門的地方，它比另一圈偏向內側或外側多少；以及各自在哪裡開始切入。每個判定最後，都會附上該圈的車在這個彎道上適合的走線——依彎道接的是什麼、車子的動力與抓地力之比、下壓力和驅動方式——以及該圈是否照著開。「逐彎表格」會列出每個彎道最快的那圈，附上它的走線形狀，並把各彎最好的表現湊在一起。

### 8. 兩張地圖 {#two-maps}

- **哪裡**：賽道依 `dΔt/ds`（相對於參考圈）上色，紅色代表時間正在流失，綠色代表時間正在賺回。
- **為什麼**：每一個損失都畫在它的原因所在的位置，依原因的類別上色——煞車、入彎、出彎、直線、車輛——損失越大的畫得越寬。

### 9. 重播 {#replay}

一個時鐘，三種方式把它轉換成每一圈自己的時間：從起跑線開始、排齊（每一圈在同一時刻抵達賽道上的同一點，然後同時放開），以及並排（每一圈都保持在參考圈的距離上）。

### 10. 世界是哪一種手性 {#which-way-round-the-world-is}

查看器的世界是右手座標系，Y 軸朝上。使用左手座標系的遊戲（Forza 就是其中之一）在查看器中會呈現鏡像：每一個右彎都會被畫成左彎，賽道與各圈皆然。各圈本身就會說明這一點——所有轉接器中，方向盤的正向都是朝右，而且彎道外側的懸吊會被壓縮——因此賽車分頁會提議修正，而**攝影機與場景 → 反轉世界軸**就能做到：X、Y 或 Z 可以被反向繪製。改變的只是繪製：在視圖矩陣中摺疊一個鏡射；攝影機在繪製出來的世界中飛行，而資料、分析，以及工具顯示的每個座標，仍然是遊戲原本的。分析也會以相同的量測方式，判斷彎道是向左還是向右。

### 11. 拉力賽：側滑、左腳與空中 {#rally-the-slide-the-left-foot-the-air}

拉力賽路段不是在較差抓地力下跑的賽道。在碎石與雪地上，側滑本身就是過彎的方式：車子在入彎時藉由移動車重來轉向——「煞車會把車重往前移……前輪獲得抓地力，後輪失去抓地力，車子在滑動中轉進彎道」，然後等它「對準你想去的方向」，才把油門踩回去（[DirtFish：如何使用煞車](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)）。左腳負責煞車，讓油門和煞車能彼此配合；手煞車則用來在緊彎中轉向（[RallySport Ontario：拉力賽駕駛基礎](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)、[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)）。而且車子會離開地面。第 6 節已經把側滑與另一圈對照讀取；以下這些規則則處理其餘部分。

- **地面。** 以該圈標示的為準（`meta.surface`，拉力賽記錄器的 `--surface`）；沒有的話，看賽事名稱——柏油拉力賽（西班牙、克羅埃西亞、中歐、德國、日本、科西嘉、伊普爾）、冬季賽（雪地）、蒙地卡羅的柏油路上有雪與冰（混合）——再沒有的話，就看車子是怎麼開的。Rally2 車輛在碎石上的側向極限為 0.7-0.9 g，在柏油上則為 1.3-1.4 g（[grenzbereich，參考值](https://github.com/GitCrush/grenzbereich)）；而且在碎石上，車子會漂移得更多（第 6 節）。因此，若某段路段中，車子在速度夠快、位於地面上的情況下，達到 10 m/s² 以上的側向加速度（第 95 百分位），同時中位數漂移角低於 6 度，且只要在其達到該值 70% 以下的過彎中，那就是柏油；其他情況，或資料不足無法判斷時，則為鬆散路面。
- **在該地面上，車子能做到什麼。** 抓地力、煞車與牽引（第 5 節）會分別在柏油與鬆散路面上量測，前提是各圈在兩種路面上的樣本至少各佔五分之一；每個彎道則以車子在最低速點下方的地面來判斷。在空中以及落地後 0.3 秒內的樣本，會被排除在所有量測車輛的資料之外——包括包絡線、輪胎曲線、鎖死與空轉：落地的衝擊會讓車子超過輪胎所能做到的範圍，而在空中空轉的車輪也不算輪胎空轉。在鬆散路面上不判斷下壓力，因為同一段路段中，快的與慢的部分本來就是不同的路。
- **左腳輕點不算煞車。** 油門仍在半開以上時，輕輕碰一下煞車、時間不到 15 m，只是在穩定車子或讓它轉向；一圈何時開始為彎道煞車，是第一次讓油門放開的煞車點，或持續超過這個時間的煞車點。
- **入彎時的轉向。** 對每一圈與每個彎道，取從煞車開始到最低速點後 5 m 之間，最大的漂移角。在鬆散路面上，若某圈讓車子轉向的角度，比另一圈少 8 度以上（而另一圈轉到了 12 度以上），且油門或全油門踩得較晚，那就是**轉向不足**：建議在入彎時抬油或輕踩左腳煞車，讓後輪甩過來——若另一圈也用了手煞車，則比照它的煞車點；或在低於 54 公里/小時的彎道中使用手煞車——並在頂點前讓車頭對準出口。若某圈讓車子轉向的角度，比另一圈多 12 度以上，而且仍然踩油門較晚，那就是**轉過頭**：在動力能踩下去之前，必須先把方向修正回來。兩者都是出彎時的原因，並排在車輛控制失誤之後。鬆散路面上的走線建議，對每個彎道都說同樣的話。
- **空中。** 比另一圈在空中多 0.2 秒以上，並且在起跳前 10 m 到落地後 40 m（或彎道結束時）之間造成時間損失的飛行，若解釋了該彎道損失的 40% 以上，就是原因；接在它之後、以較慢速度抵達的彎道，也會說明這點。在空中，車子無法轉向、煞車或驅動。建議是起跳時保持油門——「起跳時不要收油門」，否則車頭會下沉——並把山頂的速度放慢一點，或輕踩煞車，讓車子保持低姿態（[DirtFish：如何跳拉力賽車](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)）。
- **最多三個彎的連續彎。** 一段不曾完全踩到全油門、連續轉彎的路段，不會當成一個很長的連續彎：超過三個彎之後，就開始新的一組。

`src/race/rally.test.ts` 以簡單模型模擬的路段，檢驗分析是否符合以上所有規則：車子轉向不足且油門踩得晚、飛躍時間較長、左腳輕踩、連續彎路段，以及柏油與碎石的對照。

## 資料，以及每個來源允許什麼 {#data-and-what-each-source-allows}

| 來源 | 取樣率 | 通道 | 允許 |
|---|---|---|---|
| FH Companion 單圈檔 | 約每 5 m | 位置、速度、油門、煞車、方向盤、側向／縱向加速度、檔位 | 除了車輛控制以外的全部；車輛控制需要旁邊的遙測檔 |
| FH Companion 的 `.tele.gz`，位於每個單圈檔旁 | 遊戲的 64 Hz（保留每個封包的記錄器約每秒 110 筆；重複的會被去掉） | Forza 的完整 Data Out：每個輪胎的滑移率、側滑角、合成滑移、轉速、懸吊、路面震動；車身座標系的速度；橫擺角速度 | 全部，包括車輛控制 |
| Forza Data Out，由 `heat3d_capture telemetry` 記錄 | 60 Hz | 以上全部，加上每個輪胎的：輪胎溫度、滑移率、側滑角、合成滑移、懸吊行程、輪速、路面震動帶；轉速、功率、扭矩、橫擺角速度 | 全部 |
| Assetto Corsa、ACC、AC EVO、AC Rally（共享記憶體，`heat3d_capture telemetry --game ...`） | 60-333 Hz | 更完整的一組：輪胎核心與內、中、外側溫度，胎壓，煞車溫度，輪胎負荷，外傾角，滑移率與側滑角；車身座標系的速度；ABS 與 TC 是否作動（ACC、EVO、AC Rally） | 全部 |
| iRacing `.ibt`，直接讀取 | 60 Hz | 來自 GPS 的位置、油門與煞車、方向盤、加速度、橫擺、每個輪胎的胎體溫度、阻尼器行程、胎壓、磨耗 | 全部；車輛控制由漂移角（橫擺相對於行進方向）與方向盤判斷；沒有滑移（未記錄） |
| EA SPORTS WRC、DiRT Rally 2.0 / 1 / DiRT 4（UDP） | 逐幀；100 Hz | 位置、世界座標速度與車身軸向、每個輪胎接地點的速度與懸吊、油門與煞車、方向盤、賽段計時與長度 | 全部；滑移與漂移角由資料推算 |
| Richard Burns Rally（NGP UDP） | 每個物理步 | 位置、車輛自身速度、每個輪胎的彈簧變形與受力、油門與煞車 | 全部，輪胎滑移除外 |
| BeamNG.drive（`heat3d` 協定模組） | 最高 100 Hz | 位置、世界座標速度與軸向、每個輪胎的表面速度、旋轉、負荷與接地 | 全部；滑移與漂移角由資料推算 |
| Trackmania（Openplanet 外掛） | 逐幀 | 位置、前向與側向速度、油門與煞車（開／關）、方向盤、每個輪胎的滑移係數與鬆散地面、是否在空中 | 全部；漂移角由側向速度推算 |

每個來源都會轉換成同一種單圈格式 `heat3d-lap`，其通道使用統一的名稱（`speed`、`throttle`、`tireTemp[FL]` ……）。車輛圖示與圖表會繪製單圈所擁有的任何通道。

## 來源 {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Speeding up your sections：time variance shapes](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer（距離域差值）](https://github.com/taishiliu25/lap-delta-analyzer)
- [iRacing 圈速分析指南](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry：session laps](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry：分析賽車走線](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut：由分段得出理論最佳圈](https://overcut.gg/)
- [Track Titan：如何分析遙測](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG：煞車分析、鎖死與穩定性 KPI（2019 年 9 月）](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG：油門控制（2020 年 1 月）](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM：賽車手的關鍵績效指標（arXiv 2005.10044）](https://arxiv.org/pdf/2005.10044)
- [輪胎與路面摩擦模型及最佳滑移（PMC9920324）](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB：輪胎與路面摩擦，雪地與冰面上的峰值滑移](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard：輪胎摩擦係數，峰值與滑動](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline：縱向力](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline：側向力](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [車輛穩定性與車身側滑極限（arXiv 1104.1582）](https://arxiv.org/pdf/1104.1582)
- [高側滑角下的拉力賽駕駛（Georgia Tech，IJVAS）](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [最短時間拉力賽操作（Georgia Tech，ISIE 2005）](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [ESC 參考橫擺角速度（arXiv 2305.18422）](https://arxiv.org/pdf/2305.18422)
- [以方向盤對橫擺偵測轉向不足與轉向過度（US10293852B2）](https://patents.google.com/patent/US10293852B2/en)
- [EDC：方向盤角度、阿克曼與轉向不足梯度](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM：數學通道（Kus，合成 g 值）](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta：轉向不足與轉向過度小工具](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Cadence braking：在非常鬆散的路面上鎖死](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy：碎石拉力賽資料記錄](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish：如何使用煞車](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish：如何跳拉力賽車](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario：拉力賽駕駛基礎](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich：拉力賽車輛動力學，參考值](https://github.com/GitCrush/grenzbereich)
- [Trackmania 速度漂移訓練外掛（常數）](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania 速度側滑技術文章](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan：教練流程](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan：V 型走線](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver（出彎速度與最短時間）](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving：提升圈速的順序](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools：三種彎道](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61：彎道的優先順序](https://driver61.com/uni/prioritising-corners/)
- [Driver61：不同彎道，不同技巧](https://driver61.com/uni/different-corner-technique/)
- [Driver61：彎道的六個階段](https://driver61.com/uni/corner-phases/)
- [Driver61：抓地力](https://driver61.com/uni/grip/)
- [Skip Barber Racing School：Going Faster（節錄）](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley：什麼是動量型賽車](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [動量勝過馬力的爭論](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [賽車走線的數學，第二部分](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD 與 FWD，第一部分](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [FWD 技巧](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD 與 RWD 過彎](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [賽車走線（維基百科）](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary：過彎技巧](https://www.formula1-dictionary.net/cornering_tech.html)
- [最大過彎速度](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [賽車遙測詞彙](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [考量曲率與距離的全域最短時間軌跡規劃](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM：全域賽道軌跡最佳化](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG：滑行係數](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [摩擦圓入門](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com：g-g 圖](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [縱向滑移](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [轉向不足概述](https://www.sciencedirect.com/topics/engineering/understeer)
- [轉向不足與轉向過度（維基百科）](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Forza Motorsport Data Out 文件](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard：受牽引限制的加速](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard：受動力限制的加速](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO 共享記憶體](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally 遙測讀取器](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [iRacing IBT 解析](https://github.com/teamjorge/ibt)
