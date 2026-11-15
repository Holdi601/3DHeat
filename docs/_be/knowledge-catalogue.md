---
title: "Каталог ведаў"
parent: "Лінза ведаў"
nav_order: 2
lang: "be"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Каталог ведаў

Гэта поўны спіс таго, што ведае [лінза ведаў](knowledge.md): шаблоны, якія яна шукае, ідэі, метады, гістарычныя выпадкі і даследаванні, якія яна цытуе, а таксама кнігі і артыкулы, на якіх яны грунтуюцца. Выкарыстоўвайце яго, каб знайсці запіс па ідэнтыфікатары або праверыць крыніцу.

Гэта старонка генеруецца з базы ведаў камандай `node tools/knowledge-doc.mjs`; не мяняйце нічога паміж маркерамі.

<!-- kb:begin -->

База ведаў утрымлівае 579 запісаў (135 канцэпцый, 37 метадаў, 277 гістарычных выпадкаў, 17 прынцыпаў дызайну, 113 даследаванняў) у 93 шаблонах, з 556 спасылкамі на крыніцы.

### Шаблоны (93) {#patterns-93}

| id | сямейства | як гэта выглядае ў дадзеных |
|---|---|---|
| `concentration` | сіла | Бок, які сцягвае больш адзінак у адно месца, перамагае ў гэтым месцы з перавагай, большай за адну колькасць. |
| `local-superiority` | сіла | Забойствы дастаюцца той старане, якая мае перавагу ў колькасці ў межах дыстанцыі бою, незалежна ад агульных лічбаў. |
| `attrition` | сіла | Страты ідуць за сілай абодвух бакоў з цягам часу; бой вырашае тое, хто першы вычарпае рэсурсы. |
| `exchange-ratio` | сіла | Колькасць забойстваў на адну страту моцна адрозніваецца ў залежнасці ад месца, боку або класа. |
| `aimed-fire` | сіла | Страты растуць разам з колькасцю праціўніка, але не з уласнай колькасцю. |
| `area-fire` | сіла | Страты растуць разам з дабыткам колькасцей абодвух бакоў: скучванне караецца. |
| `defeat-in-detail` | сіла | Бок разбіваецца па частках, па меры таго як яго часткі падыходзяць паасобку. |
| `mutual-support` | сіла | Страту хутка кампенсуе блізкі саюзнік: адбываецца абмен. |
| `combined-arms` | сіла | Класы добра працуюць разам, калі кожны прыкрывае слабасць іншага, і дрэнна — паасобку. |
| `class-counter` | сіла | Адзін клас непрапарцыйна часта перамагае пэўны іншы клас або перамагае ў пэўным месцы. |
| `initiative` | сіла | Той, хто першым набірае ачкі ў баі, як правіла, выйграе яго. |
| `key-terrain` | мясцовасць | Адны і тыя ж некалькі месцаў вырашаюць бітвы ў кожным матчы. |
| `fields-of-fire` | мясцовасць | Месцы, з якіх далёка відаць зямлю, па якой павінны ісці іншыя, даюць больш забойстваў. |
| `high-ground` | мясцовасць | Забойствы здзяйсняюцца зверху над зямлёй, на якой стаяць ахвяры. |
| `cover` | мясцовасць | Смерць за час зніжаецца там, дзе геаметрыя блакуе прагляд і агонь. |
| `open-ground` | мясцовасць | Смерць за час расце там, дзе нішто не блакуе прагляд і агонь. |
| `kill-zone` | мясцовасць | Смерць сканцэнтравана там, дзе рух вымушаны ісці праз назіраемую зямлю, пад агнём. |
| `chokepoint` | мясцовасць | Многа праходаў праціскаюцца праз мала зямлі, і там ёсць страты. |
| `reverse-slope` | мясцовасць | Бяспека проста за грэбнем або сцяной, па-за прамым поглядам праціўніка. |
| `safe-ground` | мясцовасць | Месца, дзе праводзіцца час, але гінуць мала. |
| `obstacle` | мясцовасць | Маршруты абыходзяць заблакаваную зямлю і звужаюцца да некалькіх шляхоў. |
| `flank` | рух | Рэдка выкарыстоўваны маршрут вядзе да большай колькасці забойстваў, чым асноўныя. |
| `avenue-of-approach` | рух | Рух ідзе ўздоўж некалькіх шляхоў паміж раёнамі. |
| `mobility` | рух | Рухомыя адзінкі гінуць на час менш (або больш), чым павольныя або нерухомыя. |
| `static-exposure` | рух | Адзінкі, якія стаяць на месцы, гінуць на час больш, чым тыя, што рухаюцца. |
| `interior-lines` | рух | Бок з кароткімі маршрутамі паміж сваімі баямі мяняе сілу хутчэй за другі. |
| `envelopment` | рух | Забойствы прыходзяць з некалькіх напрамкаў на адну пазіцыю аднаго боку. |
| `ambush` | рух | Адзінкі, што рухаюцца па маршруце, хутка гінуць ад праціўнікаў, якія ўжо занялі пазіцыі. |
| `spawn-pressure` | час | Жыццё заканчваецца неўзабаве пасля пачатку на адным спаўне. |
| `tempo` | час | Хутчэйшы бок дабягае да бою і набірае ачкі раней, чым другі паспявае адрэагаваць. |
| `surprise` | час | Страты прыходзяць чаргой да таго, як ахвяры адкажуць агнём. |
| `energy-advantage` | авіяцыя | Забойцы маюць больш вышыні і хуткасці, чым іх ахвяры. |
| `air-superiority` | авіяцыя | Самалёты аднаго боку забіваюць у многа разоў больш, чым страчваюць. |
| `sead` | авіяцыя | Наземная проціпаветраная абарона забірае шмат самалётаў, пакуль яе не знойдуць і не знішчаць. |
| `bvr` | авіяцыя | Забойствы адбываюцца на вялікай дыстанцыі, раней чым ахвяра можа збліжыцца. |
| `fleet-salvo` | мора | Сіла, якая першай нанясе ўдар, мала страчвае; другая мала застаецца, каб адказаць. |
| `scouting` | мора | Бок, які першым знойдзе другі, выбірае бой. |
| `urban-close` | горад | Кароткія дыстанцыі бою, многа смерцяў сярод шчыльнай геаметрыі, павольная зачыстка. |
| `vertical` | горад | Забойствы з верхніх паверхаў або дахаў на вуліцы. |
| `skill-dispersion` | людзі | Некалькі гульцоў забяспечваюць вялікую долю забойстваў або смерцяў. |
| `ai-vs-player` | людзі | Адзінкі пад кіраваннем ШІ выступаюць інакш, чым гульцы на тым жа месцы. |
| `balance` | дызайн | Бакі, спаўны або класы пачынаюць з няроўнымі шанцамі. |
| `economy` | дызайн | Рэсурсы, якія здабываюцца, выдаткоўваюцца і страчваюцца, сканцэнтраваны ў некалькіх месцах або ў некалькіх гульцоў. |
| `flow` | дызайн | Як гульцы рухаюцца па ўзроўні: петлі, калідоры, тупікі. |
| `sightlines` | дызайн | Доўгія лініі прагляду вызначаюць, дзе пачынаюцца бі і хто іх выйграе. |
| `readability` | дызайн | Смерці, якія гульцы не могуць убачыць загадзя: ззаду, з-за межы бачнасці. |
| `formation` | рух | Адзінкі аднаго боку рухаюцца разам у пазнавальнай форме: лінія, калона, клін, эшалон, квадрат. |
| `frontal-assault` | рух | Група наступае на праціўніка прама ў твар яго фронту. |
| `double-envelopment` | рух | Дзве групы ўдараюць па абодвух флангах аднаго праціўніка прыблізна адначасова. |
| `encirclement` | рух | Група праціўніка апынаецца абкружанай з усіх бакоў другім бокам і мае мала шляхоў выхаду. |
| `penetration` | рух | Група праходзіць праз лінію праціўніка, калі ворагі стаяць па абодва бакі ад яе. |
| `fire-and-maneuver` | рух | Частка групы рухаецца, а астатнія стаяць і прыкрываюць, і ролі чаргуюцца. |
| `feint` | рух | Невялікая група прыцягвае праціўніка ў адно месца; галоўны ўдар наносіцца ў іншым месцы неўзабаве. |
| `withdrawal` | рух | Група ў кантакце разварочваецца і адыходзіць, павялічваючы адлегласць да праціўніка. |
| `pursuit` | рух | Група ідзе следам за праціўнікам, які адыходзіць, захоўваючы або скарачаючы дыстанцыю. |
| `defence-in-depth` | мясцовасць | Абаронцы стаяць некалькімі паласамі адна за адной уздоўж восі наступу праціўніка. |
| `screening` | рух | Невялікі элемент рухаецца далёка наперадзе сваёй галоўнай часткі і першым сустракае праціўніка. |
| `dispersion` | сіла | Бок з цягам часу расцягваецца; менш яго адзінак знаходзіцца ў адным месцы. |
| `missile-defence` | авіяцыя | Самалёты пад пагрозай ракет паварочваюць пагрозу на бок або на хвост: crank, notch, drag, pump. |
| `angles-fight` | авіяцыя | Блізкі паветраны бой на малой хуткасці і з высокай хуткасцю павароту, вядзецца за пазіцыю носа, а не за энергію. |
| `cap` | авіяцыя | Самалёты кружаць вакол нерухомай кропкі хвіліны, чакаючы, пакуль прыйдзе праціўнік. |
| `strike-package` | авіяцыя | Самалёты розных роляў ляцяць разам да мэты: адны атакуюць зямлю, другія прыкрываюць. |
| `line-of-battle` | мора | Караблі ідуць калонай адзін за адным, каб усе борты маглі страляць. |
| `crossing-the-t` | мора | Калона праходзіць перад галавой калоны праціўніка: усе яе гарматы страляюць, а гарматаў праціўніка — мала. |
| `fatal-funnel` | горад | Гульцы, якія ўваходзяць праз адны дзверы, пакой або праход, гінуць там за імгненні значна часцей, чым уваходзячы ў іншым месцы. |
| `crossfire` | сіла | Тыя, чые лініі агню сыходзяцца пад рознымі вуглямі, выйграюць больш дуэляў, чым адзін гулец. |
| `peeker-advantage` | час | Гулец, які выходзіць у поле зроку, выйграе дуэлі супраць таго, хто трымае кут, часцей (або радзей) за палову. |
| `entry` | час | Першае забойства ў раўндзе вырашае многае ў раўндзе; уваходы выйгрываюць або прайграюць па месцы і падтрымцы. |
| `utility-support` | сіла | Успышка або дым перад дуэллю мяняюць тое, хто яе выйграе. |
| `man-advantage` | сіла | Раўнды выйграюцца бокам з большай колькасцю жывых гульцоў, і некаторыя бакі пераводзяць перавагу ў перамогу або марнуюць яе. |
| `clutch` | людзі | Апошнія жывыя гульцы выйграюць часцей (або радзей), чым прагназуе стан раўнды. |
| `action-value` | людзі | Забойствы, размены, закладкі і выкарыстанне ўтыліт адрозніваюцца тым, наколькі моцна змяняюць шанец на перамогу. |
| `lurk` | рух | Гулец, адзін далёка ад каманды, забівае (або гіне) з іншым тэмпам, чым астатнія. |
| `rotation` | рух | Тое, як хутка бок перамяшчае гульцоў у бой або да мэты, вызначае, ці ўтрымае ён пазіцыю або вярне яе. |
| `collective-order` | людзі | Рухомыя адзінкі аднаго боку ідуць у адзін бок значна часцей, чым гэта давалі б іх уласныя трасы, зрушаныя ў часе, выпадкова. |
| `milling` | людзі | Адзінкі аднаго боку кружаць вакол агульнага цэнтра: круцяцца без чыстага перамяшчэння. |
| `herding` | людзі | Адзінкі пакідаюць месца так, як гэта зрабіў таварыш перад імі, — больш за шанцы самога месца і больш за капіраванне праціўніка. |
| `lane-formation` | людзі | Сустрэчныя патокі трымаюцца асобных палос; рух канцэнтруецца на некалькіх сцежках, якімі карыстаюцца матч за матчам. |
| `crowding` | людзі | Хуткасць і паток падаюць, калі адзінкі збіваюцца ў кучу; праз праход ціск мацней не прапускае больш. |
| `leadership` | людзі | Некаторыя адзінкі паварочваюць першымі, а іншыя капіруюць іх кірунак праз некалькі секунд. |
| `cohesion` | людзі | Адзінкі, якія адбіваюцца ад сваёй групы, гінуць часцей за тых, што трымаюцца побач. |
| `breaking-point` | людзі | Бок, які страціў частку сваёй сілы, перастае наступаць і адыходзіць больш, чым тлумачыць яго адлегласць да праціўніка. |
| `panic` | людзі | Пад раптоўнай пагрозай адзінкі разбягаюцца, уцякаюць або застываюць, і каардынацыя распадаецца. |
| `loss-chasing` | людзі | Пасля страты адзінкі рызыкуюць больш (або менш), чым пасля выйгрышу. |
| `hot-hand` | людзі | Поспех часцей вядзе за сабой поспех, чым дазваляюць перамешаныя паслядоўнасці таго ж гульца. |
| `conformity` | людзі | Члены боку выбіраюць аднолькава — закупкі, узбраенне, маршруты — больш за ўласныя перавагі. |
| `suppression` | людзі | Шквальны агонь мяняе тое, як адзінкі рухаюцца і страляюць, нават калі не забівае. |
| `social-loafing` | людзі | Укладанне на кожнага падае, калі побач больш таварышаў. |
| `mixed-strategy` | людзі | Выбары, якія павінны быць непрадказальнымі, становяцца шаблоннымі: адзін варыянт выйгрывае часцей або выбары ідуць паслядоўнасцямі. |
| `coordination` | людзі | Члены дзейнічаюць узгоднена без бачных загадаў: сінхроннае перамяшчэнне, час і выбары. |
| `contagion` | людзі | Стан пераходзіць ад адзінкі да адзінкі праз дотык або блізкасць і распаўсюджваецца па карце. |
| `territoriality` | людзі | Адзінкі трымаюць дыстанцыю адна ад адной і ўтрымліваюць сваю зямлю. |
| `interaction-network` | людзі | Хто з кім б'ецца, падтрымлівае або ідзе следам, утварае сетку з вузламі, групамі і масточкамі. |

### Канцэпцыі (135) {#concepts-135}

| id | назва | лінзы | шаблоны | крыніцы |
|---|---|---|---|---|
| `concept.lanchester-square` | Квадратны закон Ланчэстэра (прыцэльны агонь) | ваенная, авіяцыя, флот, кіберспорт | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Лінейны закон Ланчэстэра (масавы агонь, адзін на адзін) | ваенная, горад, кіберспорт | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Канцэнтрацыя сілы (маса) | ваенная, авіяцыя, флот, кіберспорт | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Суадносіны сіл і правіла 3:1 | ваенная | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Каэфіцыент абмену стратамі | ваенная, авіяцыя, кіберспорт, дызайн | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Баявая моц і яе множнікі | ваенная | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Сучасная сістэма выкарыстання сіл | ваенная | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Цыкл OODA (назіраць, арыентавацца, рашаць, дзейнічаць) | ваенная, авіяцыя, кіберспорт | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Тэорыя энергіі і манеўранасці | авіяцыя | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Базавыя манеўры істрэбіцеляў і паветранае манеўраванне | авіяцыя | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Аналіз мясцовасці: OAKOC / KOCOA | ваенная, дызайн, горад | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: змінныя задання | ваенная | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Ключавая і вырашальная мясцовасць | ваенная, дызайн, кіберспорт | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Назіранне і сектары агню | ваенная, дызайн, кіберспорт, горад | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Прыкрыццё і маскіроўка | ваенная, горад, дызайн | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Шляхі падыходу і калідоры руху | ваенная, дызайн | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Вузкія месцы і цясніны | ваенная, дызайн, кіберспорт | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Зоны бою і зоны паражэння | ваенная, горад, дызайн | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Абарона за адваротным схілам і прыкрыццё ад агню | ваенная, дызайн | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Высокая мясцовасць | ваенная, дызайн | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Унутраныя і вонкавыя лініі | ваенная | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Разгром па частках | ваенная, кіберспорт | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Узаемная падтрымка | ваенная, авіяцыя, кіберспорт | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Камбінаваныя роды войск | ваенная, дызайн | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Падаўленне | ваенная, горад | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Падаўленне і знішчэнне проціпаветранай абароны праціўніка (SEAD/DEAD) | авіяцыя, ваенная | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Паветраны патруль прыкрыцця і паветраная перавага | авіяцыя | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Бой за межамі прамой бачнасці | авіяцыя | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Ускосны падыход | ваенная, кіберспорт, дызайн | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Ахоп і абкружэнне | ваенная | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Засада | ваенная, кіберспорт, дызайн | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Глыбокая абарона | ваенная | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Трэнне і туман вайны | ваенная, кіберспорт | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Кульмінацыйны пункт наступу | ваенная | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Нечаканасць | ваенная, авіяцыя, флот, кіберспорт | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Эканомія сіл | ваенная, кіберспорт | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Гарадская мясцовасць | горад, ваенная, кіберспорт | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Кантроль мора і вырашальная бітва флоту | флот | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Мадэль залпаў Х'юза: эфектыўна атакаваць першым | флот, авіяцыя | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Тэорыя пошуку і выяўлення | флот, авіяцыя, ваенная | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Аперацыйныя даследаванні: меры эфектыўнасці | ваенная, авіяцыя, флот, дызайн | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Ваенныя гульні як аналіз | ваенная, дызайн | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Манеўраная вайна | ваенная, кіберспорт | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Згуртаванасць і маральны фактар | ваенная | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Цэнтр цяжару | ваенная | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Вырашальныя пункты | ваенная, кіберспорт | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Лініі дзеянняў | ваенная | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Стратэгіі знішчэння і знясілення | ваенная | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Глыбокі бой і глыбокія аперацыі | ваенная | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | Паветрана-наземны бой (AirLand Battle) | ваенная, авіяцыя | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Камандаванне задачай (Auftragstaktik) | ваенная, кіберспорт | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Прарыў і развіццё поспеху | ваенная | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Агонь і рух | ваенная, кіберспорт | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Перабежкі з прыкрыццём | ваенная, кіберспорт | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Разведвальны рух і пранікненне | ваенная, кіберспорт | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Рэзерв | ваенная, кіберспорт | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Эластычная абарона і контратака | ваенная | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Ланцуг паражэння (знайсці, зафіксаваць, прасачыць, абраць мэту, паразіць, ацаніць) | ваенная, авіяцыя, флот | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Дыяпазон выяўлення супраць дыяпазону бою | авіяцыя, флот, ваенная | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Каэфіцыент баявой эфектыўнасці | ваенная, кіберспорт | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Рассяроджанасць на полі бою | ваенная, кіберспорт | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Блізкая паветраная падтрымка | авіяцыя, ваенная | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Паветраная забарона (інтэрдыкцыя) | авіяцыя, ваенная | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Суправаджэнне супраць зачысткі істрэбіцелямі | авіяцыя | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Бой на энергіі супраць віражнога бою | авіяцыя | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Вядучая, чыстая і адстаючая пагоня | авіяцыя | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Пляценне Тача | авіяцыя | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Сістэма «палец-чатыры» і бойная пара | авіяцыя | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Флот у гатоўнасці | флот | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Перасячэнне Т | флот, ваенная | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Канвой | флот | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Прадухіленне доступу і зона адмаўлення | флот, авіяцыя, ваенная | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Абарона апорнага пункта ў забудове | горад, ваенная | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Праходжанне праз будынкі праломамі | горад, ваенная, дызайн | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Аблога | ваенная, горад | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Партызанская вайна | ваенная, горад | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Контрпаўстанцкая дзейнасць | ваенная, горад | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Прыстанішча | ваенная, дызайн | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Падман (маскіроўка) | ваенная, кіберспорт | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Інфармацыйная перавага | ваенная, кіберспорт | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Эканамічныя раўнды і тэмп рэсурсаў | кіберспорт, дызайн | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Саставы руху: лінія, калона, клін, эшалон | ваенная, кіберспорт | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Лабавая атака | ваенная | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Падвойнае ахоп (клешні) | ваенная | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Абкружэнне і катол | ваенная | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Пранікненне і прарыў | ваенная | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Пагоня | ваенная | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Адыход: адступленне, затрымка і водступ | ваенная | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Ілжывая атака і дэманстрацыя | ваенная, кіберспорт | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Прыкрыццё, ахова і забеспячэнне: бяспека перад галоўнай часткай | ваенная | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Абарона ад ракеты: crank, notch, drag і pump | авіяцыя | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Саставы за межамі прамой бачнасці: wall, lead-trail, grinder, pincer | авіяцыя | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Бой на кутах і бой на энергіі | авіяцыя | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Ударны пакет і паслядоўнасць падаўлення | авіяцыя | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Лінія бою | флот | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Смяротная воронка | горад, ваенная, кіберспорт, дызайн | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Зачыстка пакоя: нечаканасць, хуткасць, кантраляваная сіла | горад, ваенная, кіберспорт | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Пункты дамінавання | горад, ваенная, кіберспорт | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Праверка вуглоў: «рэзка пірага» | горад, ваенная, кіберспорт | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Перакрыжаваны агонь і сцепленыя сектары агню | ваенная, горад, кіберспорт, дызайн | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Перавага таго, хто выглядае | кіберспорт, дызайн | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Перавага ў людзях у раўндах выбывання | кіберспорт, ваенная | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Уваход і першая дуэль | кіберспорт, горад | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Утыліта перад уваходам: успышка і дым | кіберспорт, горад, ваенная | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Мадэль сацыяльнай сілы руху пешаходаў | дызайн, горад, ваенная | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Утварэнне палос у сустрэчным патоку | дызайн, горад | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Хутчэй — значыць павольней | дызайн, горад, ваенная | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Асноўная дыяграма натоўпаў | дызайн, горад | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Утварэнне сцежак і жаданыя лініі | дызайн, ваенная | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Паніка рэдкая: калектыўная ўстойлівасць | ваенная, горад, дызайн | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: аддаленне, выраўноўванне, згуртаванасць | дызайн, ваенная | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Параметр парадку і пачатак калектыўнага руху | дызайн, ваенная, авіяцыя, флот | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Раі, кругавы рух і палярызаваныя станы | дызайн, ваенная, флот | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Эфектыўнае лідэрства без сігналаў | ваенная, кіберспорт, дызайн | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Суседзі па колькасці, а не па адлегласці | авіяцыя, ваенная | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Раёвы інтэлект | дызайн, кіберспорт, ваенная | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Статкавасць і каскады інфармацыі | кіберспорт, дызайн, ваенная | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Сацыяльнае лянотнічанне | кіберспорт, дызайн, ваенная | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Размыванне адказнасці | кіберспорт, ваенная | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Згуртаванасць першаснай групы | ваенная, кіберспорт | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Пункты зрыву і парогі страт | ваенная | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Падаўленне: што агонь робіць, акрамя забойства | ваенная, горад | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Страх і стрэс у баявых рашэннях | ваенная, кіберспорт | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Задыханне пад ціскам | кіберспорт | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Тэорыя перспектыў і страху страт | кіберспорт, дызайн | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Эфекты беззбыткоўнасці і «грошы казіно» | кіберспорт | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Тылт (разгубленасць) | кіберспорт | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Бескарыснасць мінулых выдаткаў | кіберспорт, ваенная | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | «Гарачая рука» і яе памылка | кіберспорт | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Змешаныя стратэгіі: быць непрадказальным | кіберспорт, дызайн, ваенная | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Агульныя ментальныя мадэлі | кіберспорт, ваенная | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Складнікі каманднай работы | кіберспорт, ваенная | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Віртуальныя светы як лабараторыі паводзін | дызайн, кіберспорт | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Асабістая прастора і тэрыторыя | дызайн, горад | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Сеткі ўзаемадзеяння: хабы і слабыя сувязі | кіберспорт, дызайн | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Методы (37) {#methods-37}

| id | назва | шаблоны | крыніцы |
|---|---|---|---|
| `method.lanchester-fit` | Падгонка паказальнікаў Ланчэстэра да дадзеных баёў | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Каэфіцыент абмену па баку і месцу | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Лакальнае суадносіны сіл у момант кожнага забойства | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Поле прагляду: лініі бачнасці і сектары агню | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Удзельная энергія пры забойствах і смерцях (авіяцыя) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Устойлівасць гарачых кропак праз матчы | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Хуткасць размену (узаемная падтрымка) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Бойкі і перавага першага забойства | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Прасторавая аўтакарэляцыя смерцяў (I Морана) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Хуткасці супраць базавай лініі карты з кантролем FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Разведвальная падрыхтоўка поля бою (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Мадэлі рэйтынгаў парнага параўнання (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Імавернасць перамогі і ацэнка дзеянняў | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Кантроль прасторы і кантроль поля | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Раўнанне залпу, падагнанае да караблёў у кантакце | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Каэфіцыент баявой эфектыўнасці на адну гадзіну ў дзеянні | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Дыяпазоны ад выяўлення да бою і дыяпазоны бою | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Тайминг ланцуга паражэння | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Рассяроджанасць супраць долі забойстваў (канцэнтрацыя сілы ў часе) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Хуткасць страт і забойстваў за вылет | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Мадэль імавернасці перамогі ў раўндзе | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Ацэнка дзеяння: дададзеная імавернасць перамогі | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Скарэктаваны плюс-мінус праз рэгрэсію хрыбта (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Сціскальнасць: эмпірычны Байес | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Чаканыя вынікі: ад чаканых голаў да чаканых дуэляў | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Вымярэнне пастановак, ратацый і засад | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Праблема адлюстравання: капіраванне або агульная прычына | herding, conformity | Manski 1993 |
| `method.streak-correction` | Серыі з папраўкай на канечную паслядоўнасць | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Параметры парадку для палярызацыі і кругавога руху | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Лідэры па карэляцыі напрамку са зрухам у часе | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Тэст каскаду маршрутаў на статкавасць | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Падзел палос і ўстойлівасць сцежак | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Рызыка для адстаючых | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Крывая зрыву | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Рэакцыя на ўваходны агонь | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Рызыка пасля страты або выйгрышу | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Згода па закупках (каэфіцыент Фляйса) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Гістарычныя выпадкі (277) {#historical-cases-277}

| id | выпадак | калі | маштаб | шаблоны | крыніцы |
|---|---|---|---|---|---|
| `case.thermopylae` | Фермапілы | 480 да н. э. | бітва | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Саламін | 480 да н. э. | бітва | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Марафон | 490 да н. э. | бітва | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Левктры | 371 да н. э. | бітва | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Гаўгамелы | 331 да н. э. | бітва | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Трасімэнскае возера | 217 да н. э. | бітва | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Канны | 216 да н. э. | бітва | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Тэўтабургскі лес | 9 н. э. | бітва | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Гастынгс | 1066 | бітва | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Стырлінгскі мост | 1297 | бітва | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Азенкур | 1415 | бітва | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Льютэн | 1757 | бітва | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Аўстэрліц | 1805 | бітва | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Трафальгар | 1805 | бітва | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Ватэрлоо | 1815 | бітва | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Фрэдэрыксбург: Мары-Хайтс | 1862 | сутычка | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Геттысберг: Літл-Раўнд-Топ | 1863 | сутычка | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Геттысберг: атака Піке́та | 1863 | сутычка | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Ісандлвана | 1879 | бітва | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Роркс-Дрыфт | 1879 | сутычка | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Танэнбэрг | 1914 | кампанія | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Сомма, першы дзень | 1 ліпеня 1916 | бітва | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Вердэн | 1916 | кампанія | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Ютландыя | 1916 | бітва | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Суомусальмі | 1939–40 | бітва | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Седан і Арденны | травень 1940 | кампанія | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Контратака пад Арра | 21 траўня 1940 | сутычка | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Бітва за Брытанію | ліпень–кастрычнік 1940 | кампанія | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Бітва за Атлантыку: аперацыйныя даследаванні канвояў | 1939–45 | кампанія | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Мідуэй | чэрвень 1942 | бітва | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Другі Эль-Аламейн | кастрычнік–лістапад 1942 | бітва | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Касерынскі перавал | люты 1943 | бітва | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Сталінград | жнівень 1942 – люты 1943 | кампанія | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Курск | ліпень 1943 | кампанія | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Праахораўка | 12 ліпеня 1943 | сутычка | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Вілер-Бокаж | 13 чэрвеня 1944 | сутычка | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Нармандскія жывыя агароджы | чэрвень–ліпень 1944 | кампанія | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Аперацыя «Кобра» | ліпень 1944 | кампанія | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Заліў Лейтэ | кастрычнік 1944 | бітва | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Бастонь | снежань 1944 | бітва | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Цусіма | травень 1905 | бітва | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Інчхон | верасень 1950 | кампанія | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | Аллея МіГаў | 1950–53 | кампанія | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Дзьен Бьен Фу | 1954 | бітва | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Я Дранг: зона пасадкі X-Ray | лістапад 1965 | сутычка | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Аперацыя «Боло» | 2 студзеня 1967 | сутычка | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Голан: Даліна слёз | кастрычнік 1973 | бітва | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Сінай: Кітайская ферма | кастрычнік 1973 | бітва | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Даліна Бекаа (аперацыя «Mole Cricket 19») | чэрвень 1982 | бітва | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Паветраная вайна за Фалклэнды | травень–чэрвень 1982 | кампанія | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Паветраная кампанія «Буры ў пустыні» | студзень–люты 1991 | кампанія | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 лютага 1991 | сутычка | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Магадыша | кастрычнік 1993 | сутычка | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Грозны | снежань 1994 – люты 1995 | бітва | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Хюэ | студзень–сакавік 1968 | бітва | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Паветраная кампанія ў Косава | сакавік–чэрвень 1999 | кампанія | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Фалуджа (аперацыя «Аль-Фаджр») | лістапад 2004 | бітва | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Масул | 2016–17 | кампанія | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Кадэш | каля 1274 да н. э. | бітва | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Іс | 333 да н. э. | бітва | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Зама | 202 да н. э. | бітва | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Карры | 53 да н. э. | бітва | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Фарсал | 48 да н. э. | бітва | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Адрыянопаль | 378 н. э. | бітва | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Ярмук | 636 н. э. | бітва | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Манцыкерт | 1071 | бітва | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Хаттын | 1187 | бітва | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Бэнакберн | 1314 | бітва | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Крэсі | 1346 | бітва | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Пуацье | 1356 | бітва | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Грунвальд (Танэнбэрг) | 1410 | бітва | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Брайтэнфэльд | 1631 | бітва | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Бленгейм | 1704 | бітва | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Палтава | 1709 | бітва | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Росбах | 1757 | бітва | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Саратога | 1777 | кампанія | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Ёрктаўн | 1781 | бітва | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Іена–Ауэрштэдт | 1806 | бітва | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Барадзіно | 1812 | бітва | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Лейпцыг | 1813 | бітва | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Энтыетэм | 1862 | бітва | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Чанселорсвіл | 1863 | бітва | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Віксберг | 1863 | кампанія | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Кёніггрэц (Садова) | 1866 | бітва | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Седан | 1870 | бітва | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Мукдэн | 1905 | бітва | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Омдурман | 1898 | бітва | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Спайён-Коп | 1900 | сутычка | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Галіполі | 1915 | кампанія | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Камбрэ | лістапад 1917 | бітва | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Капарэта | кастрычнік–лістапад 1917 | кампанія | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Нямецкае вясновае наступленне (аперацыя «Міхаэль») | сакавік–красавік 1918 | кампанія | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Амьен | жнівень 1918 | бітва | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Халхін-Гол (Номонхан) | жнівень 1939 | бітва | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Польская кампанія | верасень 1939 | кампанія | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Ганю і Жамблу | травень 1940 | бітва | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Стонн | травень 1940 | сутычка | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Дюнкеркскі перыметр | травень–чэрвень 1940 | кампанія | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Аперацыя «Кампас» і Бэда-Фомм | снежань 1940 – люты 1941 | кампанія | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Аперацыя «Крусэйдэр» і Сідзі-Рэзэх | лістапад–снежань 1941 | кампанія | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Газала | травень–чэрвень 1942 | бітва | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Алам-Хальфа | жнівень–верасень 1942 | бітва | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Дубна–Броды | чэрвень 1941 | бітва | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Кіеўскае атачэнне | верасень 1941 | кампанія | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Масква | кастрычнік 1941 – студзень 1942 | кампанія | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ржэў і аперацыя «Марс» | 1942 | кампанія | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Другі Харкаў | травень 1942 | бітва | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Трэці Харкаў (удар Манштэйна назад) | люты–сакавік 1943 | кампанія | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Аперацыя «Багратыён» | чэрвень–жнівень 1944 | кампанія | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Карсунь-Чаркаскі катол | студзень–люты 1944 | бітва | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Каменец-Падольскі катол | сакавік–красавік 1944 | кампанія | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Аперацыя «Эпсам» | чэрвень 1944 | бітва | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Аперацыя «Гудвуд» | ліпень 1944 | бітва | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Аперацыя «Тоталайз» | жнівень 1944 | бітва | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Мортэн | жнівень 1944 | бітва | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Фалезскі катол | жнівень 1944 | кампанія | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden і Арнем | верасень 1944 | кампанія | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Аахен | кастрычнік 1944 | бітва | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Гюртгенскі лес | верасень 1944 – люты 1945 | кампанія | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Аракур | верасень 1944 | бітва | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Сэнт-Віт | снежань 1944 | бітва | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Хрыбет Эльзенборн | снежань 1944 | бітва | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Зееловскія высоты | красавік 1945 | бітва | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Берлін | красавік–травень 1945 | бітва | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Аперацыя «Вясновае прабуджэнне» | сакавік 1945 | бітва | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ортона | снежань 1943 | бітва | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Варшаўскае паўстанне | жнівень–кастрычнік 1944 | кампанія | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Тарава | лістапад 1943 | бітва | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Пэліліу | верасень–лістапад 1944 | бітва | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Іво-Джыма | люты–сакавік 1945 | бітва | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Окінава | красавік–чэрвень 1945 | кампанія | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Маніла | люты–сакавік 1945 | бітва | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Манджурыя (Жнівеньская бура) | жнівень 1945 | кампанія | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Пусанскі перыметр | жнівень–верасень 1950 | кампанія | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Чосінскае вадасховішча | лістапад–снежань 1950 | кампанія | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Імджын | квітень 1951 | бітва | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Капён | квітень 1951 | бітва | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Пок-Чоп-Хіл | квітень і ліпень 1953 | сутычка | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Кхесань | студзень–красавік 1968 | бітва | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Дак То | лістапад 1967 | бітва | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Гамбургер-Хіл (Ап Бя) | травень 1969 | сутычка | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Абу-Агейла – Ум-Катэф | чэрвень 1967 | бітва | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ісмаілія | кастрычнік 1973 | бітва | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Султан Якуб | чэрвень 1982 | сутычка | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Аблога Бейрута | чэрвень–жнівень 1982 | кампанія | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Ліван 2006: Бінт-Джбейл і супрацьтанкавая пагроза | ліпень–жнівень 2006 | кампанія | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Аль-Фаў | люты 1986 | бітва | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Басра (Кербела-5) | студзень–люты 1987 | бітва | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Хафджы | студзень–люты 1991 | бітва | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Аб'ект «Норфалк» | 26–27 лютага 1991 | бітва | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Медина-Рыдж | 27 лютага 1991 | бітва | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Ілжывыя ўдары ў вадзі аль-Батын | люты 1991 | кампанія | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Насірыя | сакавік 2003 | бітва | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Аб'ект «Пич» | красавік 2003 | сутычка | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Громавыя рэйды | красавік 2003 | бітва | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Дэбецкі перавал | красавік 2003 | сутычка | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Рамадзі | 2006–07 | кампанія | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Садр-Сіці | сакавік–травень 2008 | бітва | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Аперацыя «Анаконда» | сакавік 2002 | бітва | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Ванат | ліпень 2008 | сутычка | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Камдэш (КОП Кітынг) | кастрычнік 2009 | сутычка | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Муса-Кала і ўзводныя дамы | 2006–07 | кампанія | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Алжырская бітва | 1956–57 | кампанія | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Родэзійскі Fireforce | 1974–79 | кампанія | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Аблога Сараева | 1992–96 | кампанія | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Грозны 1999–2000 | снежань 1999 – люты 2000 | бітва | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Расійска-грузінская вайна | жнівень 2008 | кампанія | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Зеленапілля | ліпень 2014 | сутычка | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ілавайск | жнівень 2014 | бітва | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Дэбальцава | студзень–люты 2015 | бітва | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Донецкі аэрапорт | верасень 2014 – студзень 2015 | бітва | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Гастамель (аэрапорт) | люты 2022 | сутычка | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Кіеўскі напрамак і засада пад Броварамі | сакавік 2022 | сутычка | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Марыупаль і Азоўсталь | люты–травень 2022 | бітва | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Харкаўскі контрнаступ | верасень 2022 | кампанія | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Пераправа праз Сіверскі Данец пад Білагорыўкай | травень 2022 | сутычка | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Бахмут | жнівень 2022 – травень 2023 | бітва | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Запарожскі наступ | чэрвень–лістапад 2023 | кампанія | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Вайна ў Нагорным Карабаху | верасень–лістапад 2020 | кампанія | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Блітц | верасень 1940 – травень 1941 | кампанія | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | «Барбаросса»: першы дзень у паветры | 22 чэрвеня 1941 | бітва | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Крыт | травень 1941 | бітва | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Аблога Мальты | 1940–1942 | кампанія | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Паветраны мост да Сталінграда | лістапад 1942 – люты 1943 | кампанія | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Паветраныя бітвы над Кубанню | красавік–чэрвень 1943 | кампанія | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Курск у паветры | ліпень 1943 | бітва | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Аперацыя «Багратыён» у паветры | чэрвень–жнівень 1944 | кампанія | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Плоешці (аперацыя «Tidal Wave») | 1 жніўня 1943 | сутычка | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Рэйд на дамбы (аперацыя «Chastise») | 16–17 травеня 1943 | сутычка | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Гамбург (аперацыя «Гамора») | ліпень–жнівень 1943 | бітва | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Швайнфурт–Рэгенсбург | 17 жніўня 1943 | бітва | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Другі Швайнфурт («Чорны чацвер») | 14 кастрычніка 1943 | сутычка | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Вялікі тыдзень (аперацыя «Argument») | люты 1944 | кампанія | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Нюрнбергскі рэйд | 30–31 сакавіка 1944 | сутычка | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Аперацыя «Бадэнплатэ» | 1 студзеня 1945 | бітва | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Бітва ў Бісмарк-моры | сакавік 1943 | бітва | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Нейтралізацыя Рабаула | 1943–1944 | кампанія | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Філіпінскае мора («Марыянскае паляванне на індычак») | чэрвень 1944 | бітва | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Чорны аўторак над Намсі | 23 кастрычніка 1951 | сутычка | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Аперацыя «Rolling Thunder» | 1965–1968 | кампанія | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Мост Тханьхоа | 1965–1972 | сутычка | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965–1973 | кампанія | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Даклад Олта і «Top Gun» | 1968–1972 | кампанія | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Аперацыя «Linebacker» | травень–кастрычнік 1972 | кампанія | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II («Адзінаццацідзённая вайна») | снежань 1972 | кампанія | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Аперацыя «Фокус» (Moked) | 5 чэрвеня 1967 | бітва | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Вайна на знясіленне: ракетны пояс | 1969–1970 | кампанія | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | ЗРК-парасоль над каналам | кастрычнік 1973 | бітва | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Осірак (аперацыя «Opera») | 7 чэрвеня 1981 | сутычка | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Аперацыя «El Dorado Canyon» | 15 красавіка 1986 | сутычка | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Паветраная вайна Ірана і Іраку | 1980–1988 | кампанія | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Рэйды «Black Buck» | травень–чэрвень 1982 | сутычка | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | «Instant Thunder»: планаванне паветранай кампаніі ў Персідскім заліве | жнівень 1990 – студзень 1991 | кампанія | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: першы ўдар Apache | 17 студзеня 1991 | сутычка | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Вялікае паляванне на «Scud» | студзень–люты 1991 | кампанія | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Мутла-Рыдж («Дарога смерці») | 26–27 лютага 1991 | сутычка | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Аперацыя «Анаконда»: Apache ў Шахі-Коце | сакавік 2002 | бітва | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Атака Apache пад Кербелай | 24 сакавіка 2003 | сутычка | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Паветраная кампанія ў Лівіі | сакавік–кастрычнік 2011 | кампанія | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Нагорны Карабах: дроны і паветраная абарона | верасень–лістапад 2020 | кампанія | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Украіна: спрэчнае паветра | 2022 | кампанія | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Гастамель (аэрапорт) | люты 2022 | сутычка | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Лам Шон 719 | люты–сакавік 1971 | кампанія | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Аперацыя «Eagle Claw» | красавік 1980 | сутычка | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Афганістан: «Stinger» | 1986–1989 | кампанія | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Лепанта | 1571 | бітва | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Іспанская Армада | 1588 | кампанія | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Бухта Кіберон | 1759 | бітва | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Чэсапік (Вірджынскія мысы) | 1781 | бітва | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Ніл (бухта Абукір) | 1798 | бітва | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Капенгаген | 1801 | бітва | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Хэмптан-Роўдс | сакавік 1862 | сутычка | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Ліса (Віс) | 1866 | бітва | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Ялу | 1894 | бітва | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Манільская бухта | 1898 | бітва | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Гельгаландская бухта | жнівень 1914 | бітва | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Каронель і Фолклэнды | лістапад–снежань 1914 | кампанія | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Доггер-Банк | студзень 1915 | бітва | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Рыа-дэ-ла-Плата | снежань 1939 | бітва | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Таранта | лістапад 1940 | сутычка | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Мыс Матапан | сакавік 1941 | бітва | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Дацкі праліў і патапленне «Бісмарка» | травень 1941 | кампанія | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Пэрл-Харбар | 7 снежня 1941 | сутычка | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | «Prince of Wales» і «Repulse» | 10 снежня 1941 | сутычка | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Яванскае мора | люты 1942 | бітва | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Каралавае мора | травень 1942 | бітва | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Савуа-Айленд | жнівень 1942 | бітва | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Усходнія Саламонавы | жнівень 1942 | бітва | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Мыс Эспэранс | кастрычнік 1942 | бітва | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Астравы Санта-Круз | кастрычнік 1942 | бітва | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Марская бітва за Гуадалканал | 12–15 лістапада 1942 | бітва | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Тасафаронга | лістапад 1942 | сутычка | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Рывок праз Ла-Манш | люты 1942 | сутычка | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Аперацыя «Pedestal» | жнівень 1942 | бітва | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Чорны травень | травень 1943 | кампанія | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Нордкап | снежань 1943 | бітва | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Падводная кампанія ЗША супраць Японіі | 1941–1945 | кампанія | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Ля Самара | 25 кастрычніка 1944 | бітва | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Пралівы Сурыгао | 25 кастрычніка 1944 | бітва | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Окінава: кампанія камікадзэ | красавік–чэрвень 1945 | кампанія | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Патапленне «Эйлата» | кастрычнік 1967 | сутычка | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Латакія | кастрычнік 1973 | бітва | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Патапленне «General Belgrano» | 2 травеня 1982 | сутычка | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Страта HMS «Sheffield» | 4 травеня 1982 | сутычка | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS «Stark» | 17 траўня 1987 | сутычка | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Аперацыя «Praying Mantis» | 18 красавіка 1988 | бітва | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | жнівень 2004 | сутычка | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Рэвалюцыя Bisu | сакавік 2007 | бітва | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil на The International 2013 | жнівень 2013 | сутычка | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Zed Faker супраць Ryu | верасень 2013 | сутычка | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Буст на шляхапроводзе | лістапад 2014 | сутычка | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Скачучы AWP на Mirage | красавік 2016 | сутычка | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis і эра ўтыліт | 2018 | кампанія | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five супраць OG | красавік 2019 | бітва | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar дасягае грандмайстра | 2019 | кампанія | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Левы крук (наземны наступ аперацыі «Буры ў пустыні») | 24–28 лютага 1991 | кампанія | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Інцыдэнт Corrupted Blood | верасень 2005 | кампанія | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Дызайн гульні і ўзроўняў (17) {#game-and-level-design-17}

| id | назва | шаблоны | крыніцы |
|---|---|---|---|
| `design.chokepoint` | Вузкія месцы ў дызайне ўзроўняў | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Флангавыя маршруты і альтэрнатыўныя шляхі | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Лініі прагляду і дыстанцыя бою | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Размяшчэнне і рытм укрыццяў | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Дызайн спаўнаў і абарона пры спаўне | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Баланс сіметрычных і асіметрычных карт | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Баланс класаў і контраў | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Рух, петлі і зразумелыя схемы | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Эканомікі гульняў і зваротныя сувязі | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Падбор супернікаў і размах майстэрства | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Супернікі ШІ як зонды ўзроўню | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Значная гульня і выбар | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Размены і камандная гульня ў шутарах | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Кантроль карты | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Цеплавыя карты і прасторавая тэлеметрыя ў дызайне | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Майстэрства, навучанне і забава | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Эканомікі раўндаў і рашэнні аб закупцы | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Даследаванні (113) {#studies-113}

| id | назва | крыніцы |
|---|---|---|
| `study.engel-1954` | Engel: закон квадратаў Ланчэстэра ля Іво-Джымы | Engel 1954 |
| `study.bracken-1995` | Bracken: мадэлі Ланчэстэра для Арденаў | Bracken 1995 |
| `study.fricker-1998` | Fricker: мадэлі знясілення для Арденаў, перагледжаныя | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas і Turkes: Курск і Ардэны | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley і Helmbold: праверка закону квадратаў | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-аналіз смерцяў гульцоў | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: візуалізацыя канкурэнтных паводзін | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Ацэнка дзеянняў у Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Выяўленне сутычак у кіберспорце | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: паветраны бой над В'етнамам | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: колькасная ацэнка гістарычных бітваў | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: прымяненне сіл тлумачыць вынікі | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Агляд візуалізацыі дадзеных гульні | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Ланчэстэр супраць трох стагоддзяў бітваў на сушы | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: шэсцьдзесят сутычак Другой сусветнай вайны | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: баявыя мадэлі і Грамадзянская вайна ў ЗША | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: статыстычная мадэль даных пра страты | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: тэмпы наступу ў сухапутным бою | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas і Dinges: абставіны важнейшыя за закон | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | База даных Курска | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | База даных кампаніі ў Арденах | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson і MacKay: Бітва за Брытанію як даныя Ланчэстэра | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte і Schmidt: колькасць па-ранейшаму вырашае бітвы | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: заканамернасці стратаў у бітвах | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Тактычная лікавая дэтэрмінаваная мадэль Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: вайна ў лічбах | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: баявая сіла | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter і Stam: дэмакратыі на вайне | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: адаптыўная дынамічная мадэль | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Ланчэстэр і партызанская вайна | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: стахастычная мадэль залпаў | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: асновы флоцкай тактыкі | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Спрэчка пра правіла 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: мадэляванне ўзброеных канфліктаў | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Даклад Олта: ракеты, выпушчаныя па-за межамі іх зоны | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey (аналіз паветранай моцы ў вайне ў Персідскім заліве) | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Цырк Блэкета | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Настройкі глыбінных бомб у Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Белыя днішчы супрацьлодкавых самалётаў | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: броня там, дзе не ўражаныя бамбавікі, што вярнуліся | Mangel & Samaniego 1984 |
| `study.optimal-search` | Аптымальны пошук: ад падводных лодак да AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: бой у пекле | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Прадухіленне доступу і зона адмаўлення | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Як гульцы губляюць цікавасць | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Кластарызацыя паводзін гульцоў у натуральных умовах | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Выяўленне расчаравання гульцоў | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: панэлі тэлеметрыі ў вытворчасці | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: візуальная аналітыка гульні | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Рух аватараў на полях бітваў World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: інструментаванне карыстальніцкіх тэстаў у маштабе | Kim et al. 2008 |
| `study.game-data-science` | Навука пра даныя ў гульнях | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Штучны інтэлект і гульні | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Майстэрства і рух камандаў у Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Баявыя ўзоры, якія прадказваюць перамогі ў MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Ролі гульцоў у Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Прагноз вынікаў Dota 2 па драфтах | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Жывы прагноз перамогі ў прафесійным кіберспорце | Hodge et al. 2021 |
| `study.rioult-2014` | Тапалогія пазіцый гульцоў | Rioult et al. 2014 |
| `study.bednarek-2017` | Ацэнка гульцоў у камандных шутарах | Bednárek et al. 2017 |
| `study.katona-2019` | Прагноз, хто загіне наступным | Katona et al. 2019 |
| `study.block-2018` | Гісторыі на аснове даных для аўдыторыі кіберспорту | Block et al. 2018 |
| `study.ggviz` | ggViz: пошук станаў гульні ў маштабе | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: буйнамаштабнае навучанне з падмацаваннем у Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: узровень грандмайстра ў StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Ачаканая вартасць валодання мячом у баскетболе | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: ацэнка дзеянняў з мячом у футболе | Decroos et al. 2019 |
| `study.pitch-control` | Кантроль поля і стварэнне прасторы | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Прасторавая структура аборончага майстэрства | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Роля камандных гульцоў па трэкінгавых даных | Lucey et al. 2013 |
| `study.shot-quality` | Чаканыя голы і якасць удару | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: прасторавая эфектыўнасць кідкоў | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Прасторава-часавы аналіз камандных відаў спорту | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K Рыплі: скапленні на кожным маштабе | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark і Evans: рассяроджанасць па бліжэйшым суседзе | Clark & Evans 1954 |
| `study.getis-ord` | Гарачыя кропкі Getis-Ord | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Лакальныя індыкатары прасторавай асацыяцыі | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Прасторавая статыстыка сканавання | Kulldorff 1997 |
| `study.kde` | Ядравая ацэнка шчыльнасці | Silverman 1986 |
| `study.knox-1964` | Прасторава-часавая ўзаемасувязь | Knox 1964; Diggle 2013 |
| `study.maup` | Праблема мадыфікаванай прасторавай адзінкі | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Ізавісты і графы бачнасці | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Сінтаксіс прасторы | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Сярэдняе скучванне | Lloyd 1967 |
| `study.survival-analysis` | Аналіз выжывання для часу да смерці | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Абагульненыя лінейныя мадэлі для падлікаў | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Бутстрап і інтэрвальныя ацэнкі | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: затрымка і перавага таго, хто выглядае | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee і Chang: стрэл з-за вугла | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: затрымка і дзеянні гульцоў | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: прафесіяналы і аматары праз імавернасць перамогі | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: эканамічныя рашэнні ў Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: разумныя забойствы і марныя смерці | Maymin 2021 |
| `study.moba-live-prediction` | Прагноз жывога выніку ў MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: раўнды Valorant па тактычных прыкметах | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: ролі ў прафесійным Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: навучанне баявым дзеянням на блізкай дыстанцыі | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Турбулентнасць натоўпу на хаджы 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Групы пешаходаў фармуюць натоўпы | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Іерархічная дынаміка групы ў статках голубоў | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Сацыяльны ўплыў робіць поспех нераўнамерным і непрадказальным | Salganik et al. 2006 |
| `study.wisdom-undermined` | Сацыяльны ўплыў падрывае мудрасць натоўпу | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Прыцягальная сіла натоўпу | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Падпарадкаванне аднагалоснай большасці | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: баявая матывацыя ў Іраку | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Згуртаванасць і вынік: метааналізы | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Страх страт сярод прафесійных гольфістаў | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | «Гарачыя рукі» ў бейсболе | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Пенальці: прафесіяналы гуляюць мінімакс | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Мінімаксная гульня на Уімблдоне | Walker & Wooders 2001 |
| `study.collective-intelligence` | Калектыўны інтэлект каманд | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Сацыяльныя сеткі анлайн-свету | Szell et al. 2010 |
| `study.team-networks` | Сеткі перадач і вынік каманды | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Паводзіны распаўсюджваюцца праз кластарызаваныя сеткі | Centola 2010 |

### Бібліяграфія {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(праверана 2026-11-15: падрабязнасці)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(праверана 2026-11-15: падрабязнасці)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(праверана 2026-11-15: падрабязнасці)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(праверана 2026-11-15: падрабязнасці)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(праверана 2026-11-15: падрабязнасці)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(праверана 2026-11-15: падрабязнасці)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(праверана 2026-11-15: падрабязнасці)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(праверана 2026-11-15: падрабязнасці)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(праверана 2026-11-15: падрабязнасці)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(праверана 2026-11-15: падрабязнасці)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(праверана 2026-11-15: падрабязнасці)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(праверана 2026-11-15: падрабязнасці)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(праверана 2026-11-15: падрабязнасці)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(праверана 2026-11-15: падрабязнасці)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(праверана 2026-11-15: падрабязнасці)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(праверана 2026-11-15: падрабязнасці)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(праверана 2026-11-15: падрабязнасці)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(праверана 2026-11-15: падрабязнасці)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(праверана 2026-11-15: падрабязнасці)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(праверана 2026-11-15: падрабязнасці)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(праверана 2026-11-15: падрабязнасці)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(праверана 2026-11-15: падрабязнасці)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(праверана 2026-11-15: падрабязнасці)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(праверана 2026-11-15: падрабязнасці)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(праверана 2026-11-15: наяўнасць)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(праверана 2026-11-15: падрабязнасці)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(праверана 2026-11-15: падрабязнасці)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(праверана 2026-11-15: падрабязнасці)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(праверана 2026-11-15: падрабязнасці)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(праверана 2026-11-15: падрабязнасці)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(праверана 2026-11-15: падрабязнасці)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(праверана 2026-11-15: наяўнасць)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(праверана 2026-11-15: падрабязнасці)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(праверана 2026-11-15: падрабязнасці)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(праверана 2026-11-15: падрабязнасці)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(праверана 2026-11-15: падрабязнасці)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(праверана 2026-11-15: падрабязнасці)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(праверана 2026-11-15: падрабязнасці)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(праверана 2026-11-15: наяўнасць)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(праверана 2026-11-15: падрабязнасці)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(праверана 2026-11-15: падрабязнасці)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(праверана 2026-11-15: наяўнасць)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(праверана 2026-11-15: падрабязнасці)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(праверана 2026-11-15: падрабязнасці)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(праверана 2026-11-15: падрабязнасці)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(праверана 2026-11-15: падрабязнасці)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(праверана 2026-11-15: наяўнасць)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(праверана 2026-11-15: падрабязнасці)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(праверана 2026-11-15: падрабязнасці)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(праверана 2026-11-15: падрабязнасці)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(праверана 2026-11-15: падрабязнасці)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(праверана 2026-11-15: падрабязнасці)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(праверана 2026-11-15: падрабязнасці)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(праверана 2026-11-15: падрабязнасці)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(праверана 2026-11-15: падрабязнасці)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(праверана 2026-11-15: падрабязнасці)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(праверана 2026-11-15: падрабязнасці)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(праверана 2026-11-15: падрабязнасці)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(праверана 2026-11-15: падрабязнасці)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(праверана 2026-11-15: падрабязнасці)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(праверана 2026-11-15: падрабязнасці)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(праверана 2026-11-15: падрабязнасці)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(праверана 2026-11-15: падрабязнасці)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(праверана 2026-11-15: падрабязнасці)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(праверана 2026-11-15: падрабязнасці)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(праверана 2026-11-15: падрабязнасці)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(праверана 2026-11-15: падрабязнасці)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(праверана 2026-11-15: наяўнасць)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(праверана 2026-11-15: падрабязнасці)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(праверана 2026-11-15: падрабязнасці)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(праверана 2026-11-15: падрабязнасці)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(праверана 2026-11-15: наяўнасць)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(праверана 2026-11-15: наяўнасць)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(праверана 2026-11-15: падрабязнасці)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(праверана 2026-11-15: падрабязнасці)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(праверана 2026-11-15: падрабязнасці)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(праверана 2026-11-15: наяўнасць)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(праверана 2026-11-15: падрабязнасці)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(праверана 2026-11-15: падрабязнасці)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(праверана 2026-11-15: падрабязнасці)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(праверана 2026-11-15: падрабязнасці)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(праверана 2026-11-15: падрабязнасці)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(праверана 2026-11-15: наяўнасць)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(праверана 2026-11-15: падрабязнасці)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(праверана 2026-11-15: падрабязнасці)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(праверана 2026-11-15: падрабязнасці)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(праверана 2026-11-15: падрабязнасці)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(праверана 2026-11-15: падрабязнасці)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(праверана 2026-11-15: падрабязнасці)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(праверана 2026-11-15: падрабязнасці)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(праверана 2026-11-15: наяўнасць)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(праверана 2026-11-15: падрабязнасці)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(праверана 2026-11-15: падрабязнасці)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(праверана 2026-11-15: падрабязнасці)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(праверана 2026-11-15: падрабязнасці)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(праверана 2026-11-15: падрабязнасці)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(праверана 2026-11-15: падрабязнасці)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(праверана 2026-11-15: падрабязнасці)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(праверана 2026-11-15: падрабязнасці)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(праверана 2026-11-15: падрабязнасці)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(праверана 2026-11-15: наяўнасць)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(праверана 2026-11-15: падрабязнасці)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(праверана 2026-11-15: падрабязнасці)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(праверана 2026-11-15: падрабязнасці)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(праверана 2026-11-15: падрабязнасці)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(праверана 2026-11-15: падрабязнасці)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(праверана 2026-11-15: падрабязнасці)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(праверана 2026-11-15: падрабязнасці)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(праверана 2026-11-15: падрабязнасці)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(праверана 2026-11-15: падрабязнасці)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(праверана 2026-11-15: падрабязнасці)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(праверана 2026-11-15: падрабязнасці)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(праверана 2026-11-15: падрабязнасці)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(праверана 2026-11-15: падрабязнасці)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(праверана 2026-11-15: падрабязнасці)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(праверана 2026-11-15: падрабязнасці)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(праверана 2026-11-15: падрабязнасці)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(праверана 2026-11-15: падрабязнасці)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(праверана 2026-11-15: падрабязнасці)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(праверана 2026-11-15: наяўнасць)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(праверана 2026-11-15: падрабязнасці)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(праверана 2026-11-15: падрабязнасці)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(праверана 2026-11-15: падрабязнасці)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(праверана 2026-11-15: падрабязнасці)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(праверана 2026-11-15: падрабязнасці)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(праверана 2026-11-15: падрабязнасці)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(праверана 2026-11-15: падрабязнасці)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(праверана 2026-11-15: падрабязнасці)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(праверана 2026-11-15: падрабязнасці)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(праверана 2026-11-15: падрабязнасці)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(праверана 2026-11-15: падрабязнасці)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(праверана 2026-11-15: падрабязнасці)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(праверана 2026-11-15: падрабязнасці)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(праверана 2026-11-15: падрабязнасці)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(праверана 2026-11-15: падрабязнасці)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(праверана 2026-11-15: падрабязнасці)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(праверана 2026-11-15: падрабязнасці)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(праверана 2026-11-15: падрабязнасці)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(праверана 2026-11-15: падрабязнасці)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(праверана 2026-11-15: падрабязнасці)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(праверана 2026-11-15: падрабязнасці)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(праверана 2026-11-15: падрабязнасці)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(праверана 2026-11-15: падрабязнасці)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(праверана 2026-11-15: падрабязнасці)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(праверана 2026-11-15: падрабязнасці)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(праверана 2026-11-15: падрабязнасці)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(праверана 2026-11-15: падрабязнасці)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(праверана 2026-11-15: падрабязнасці)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(праверана 2026-11-15: падрабязнасці)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(праверана 2026-11-15: падрабязнасці)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(праверана 2026-11-15: падрабязнасці)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(праверана 2026-11-15: падрабязнасці)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(праверана 2026-11-15: падрабязнасці)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(праверана 2026-11-15: падрабязнасці)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(праверана 2026-11-15: падрабязнасці)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(праверана 2026-11-15: падрабязнасці)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(праверана 2026-11-15: падрабязнасці)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(праверана 2026-11-15: падрабязнасці)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(праверана 2026-11-15: падрабязнасці)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(праверана 2026-11-15: падрабязнасці)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(праверана 2026-11-15: падрабязнасці)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(праверана 2026-11-15: падрабязнасці)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(праверана 2026-11-15: падрабязнасці)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(праверана 2026-11-15: падрабязнасці)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(праверана 2026-11-15: падрабязнасці)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(праверана 2026-11-15: падрабязнасці)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(праверана 2026-11-15: падрабязнасці)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(праверана 2026-11-15: падрабязнасці)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(праверана 2026-11-15: наяўнасць)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(праверана 2026-11-15: падрабязнасці)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(праверана 2026-11-15: падрабязнасці)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(праверана 2026-11-15: падрабязнасці)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(праверана 2026-11-15: падрабязнасці)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(праверана 2026-11-15: падрабязнасці)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(праверана 2026-11-15: падрабязнасці)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(праверана 2026-11-15: падрабязнасці)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(праверана 2026-11-15: падрабязнасці)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(праверана 2026-11-15: падрабязнасці)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(праверана 2026-11-15: падрабязнасці)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(праверана 2026-11-15: падрабязнасці)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(праверана 2026-11-15: падрабязнасці)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(праверана 2026-11-15: падрабязнасці)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(праверана 2026-11-15: падрабязнасці)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(праверана 2026-11-15: падрабязнасці)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(праверана 2026-11-15: падрабязнасці)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(праверана 2026-11-15: падрабязнасці)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(праверана 2026-11-15: падрабязнасці)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(праверана 2026-11-15: падрабязнасці)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(праверана 2026-11-15: падрабязнасці)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(праверана 2026-11-15: падрабязнасці)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(праверана 2026-11-15: падрабязнасці)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(праверана 2026-11-15: наяўнасць)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(праверана 2026-11-15: падрабязнасці)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(праверана 2026-11-15: падрабязнасці)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(праверана 2026-11-15: падрабязнасці)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(праверана 2026-11-15: падрабязнасці)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(праверана 2026-11-15: падрабязнасці)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(праверана 2026-11-15: падрабязнасці)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(праверана 2026-11-15: падрабязнасці)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(праверана 2026-11-15: падрабязнасці)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(праверана 2026-11-15: падрабязнасці)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(праверана 2026-11-15: падрабязнасці)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(праверана 2026-11-15: падрабязнасці)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(праверана 2026-11-15: падрабязнасці)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(праверана 2026-11-15: падрабязнасці)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(праверана 2026-11-15: наяўнасць)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(праверана 2026-11-15: падрабязнасці)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(праверана 2026-11-15: падрабязнасці)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(праверана 2026-11-15: падрабязнасці)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(праверана 2026-11-15: падрабязнасці)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(праверана 2026-11-15: падрабязнасці)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(праверана 2026-11-15: падрабязнасці)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(праверана 2026-11-15: падрабязнасці)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(праверана 2026-11-15: падрабязнасці)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(праверана 2026-11-15: падрабязнасці)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(праверана 2026-11-15: падрабязнасці)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(праверана 2026-11-15: наяўнасць)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(праверана 2026-11-15: падрабязнасці)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(праверана 2026-11-15: падрабязнасці)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(праверана 2026-11-15: падрабязнасці)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(праверана 2026-11-15: падрабязнасці)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(праверана 2026-11-15: падрабязнасці)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(праверана 2026-11-15: наяўнасць)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(праверана 2026-11-15: падрабязнасці)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(праверана 2026-11-15: падрабязнасці)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(праверана 2026-11-15: падрабязнасці)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(праверана 2026-11-15: падрабязнасці)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(праверана 2026-11-15: падрабязнасці)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(праверана 2026-11-15: наяўнасць)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(праверана 2026-11-15: падрабязнасці)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(праверана 2026-11-15: падрабязнасці)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(праверана 2026-11-15: падрабязнасці)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(праверана 2026-11-15: падрабязнасці)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(праверана 2026-11-15: наяўнасць)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(праверана 2026-11-15: падрабязнасці)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(праверана 2026-11-15: падрабязнасці)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(праверана 2026-11-15: падрабязнасці)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(праверана 2026-11-15: падрабязнасці)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(праверана 2026-11-15: падрабязнасці)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(праверана 2026-11-15: падрабязнасці)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(праверана 2026-11-15: падрабязнасці)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(праверана 2026-11-15: падрабязнасці)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(праверана 2026-11-15: падрабязнасці)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(праверана 2026-11-15: падрабязнасці)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(праверана 2026-11-15: наяўнасць)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(праверана 2026-11-15: падрабязнасці)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(праверана 2026-11-15: падрабязнасці)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(праверана 2026-11-15: падрабязнасці)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(праверана 2026-11-15: падрабязнасці)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(праверана 2026-11-15: падрабязнасці)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(праверана 2026-11-15: падрабязнасці)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(праверана 2026-11-15: падрабязнасці)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(праверана 2026-11-15: падрабязнасці)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(праверана 2026-11-15: падрабязнасці)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(праверана 2026-11-15: наяўнасць)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(праверана 2026-11-15: наяўнасць)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(праверана 2026-11-15: падрабязнасці)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(праверана 2026-11-15: падрабязнасці)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(праверана 2026-11-15: падрабязнасці)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(праверана 2026-11-15: падрабязнасці)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(праверана 2026-11-15: наяўнасць)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(праверана 2026-11-15: наяўнасць)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(праверана 2026-11-15: наяўнасць)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(праверана 2026-11-15: падрабязнасці)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(праверана 2026-11-15: падрабязнасці)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(праверана 2026-11-15: падрабязнасці)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(праверана 2026-11-15: падрабязнасці)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(праверана 2026-11-15: падрабязнасці)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(праверана 2026-11-15: падрабязнасці)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(праверана 2026-11-15: падрабязнасці)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(праверана 2026-11-15: падрабязнасці)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(праверана 2026-11-15: падрабязнасці)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(праверана 2026-11-15: падрабязнасці)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(праверана 2026-11-15: падрабязнасці)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(праверана 2026-11-15: падрабязнасці)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(праверана 2026-11-15: падрабязнасці)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(праверана 2026-11-15: наяўнасць)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(праверана 2026-11-15: падрабязнасці)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(праверана 2026-11-15: падрабязнасці)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(праверана 2026-11-15: падрабязнасці)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(праверана 2026-11-15: падрабязнасці)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(праверана 2026-11-15: падрабязнасці)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(праверана 2026-11-15: падрабязнасці)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(праверана 2026-11-15: падрабязнасці)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(праверана 2026-11-15: падрабязнасці)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(праверана 2026-11-15: падрабязнасці)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(праверана 2026-11-15: падрабязнасці)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(праверана 2026-11-15: падрабязнасці)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(праверана 2026-11-15: падрабязнасці)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(праверана 2026-11-15: падрабязнасці)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(праверана 2026-11-15: падрабязнасці)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(праверана 2026-11-15: падрабязнасці)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(праверана 2026-11-15: падрабязнасці)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(праверана 2026-11-15: падрабязнасці)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(праверана 2026-11-15: падрабязнасці)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(праверана 2026-11-15: падрабязнасці)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(праверана 2026-11-15: падрабязнасці)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(праверана 2026-11-15: падрабязнасці)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(праверана 2026-11-15: падрабязнасці)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(праверана 2026-11-15: падрабязнасці)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(праверана 2026-11-15: падрабязнасці)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(праверана 2026-11-15: падрабязнасці)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(праверана 2026-11-15: падрабязнасці)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(праверана 2026-11-15: падрабязнасці)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(праверана 2026-11-15: падрабязнасці)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(праверана 2026-11-15: падрабязнасці)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(праверана 2026-11-15: падрабязнасці)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(праверана 2026-11-15: падрабязнасці)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(праверана 2026-11-15: падрабязнасці)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(праверана 2026-11-15: падрабязнасці)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(праверана 2026-11-15: падрабязнасці)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(праверана 2026-11-15: падрабязнасці)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(праверана 2026-11-15: падрабязнасці)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(праверана 2026-11-15: падрабязнасці)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(праверана 2026-11-15: падрабязнасці)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(праверана 2026-11-15: падрабязнасці)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(праверана 2026-11-15: падрабязнасці)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(праверана 2026-11-15: падрабязнасці)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(праверана 2026-11-15: наяўнасць)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(праверана 2026-11-15: наяўнасць)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(праверана 2026-11-15: наяўнасць)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(праверана 2026-11-15: наяўнасць)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(праверана 2026-11-15: падрабязнасці)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(праверана 2026-11-15: падрабязнасці)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(праверана 2026-11-15: падрабязнасці)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(праверана 2026-11-15: падрабязнасці)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(праверана 2026-11-15: падрабязнасці)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(праверана 2026-11-15: падрабязнасці)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(праверана 2026-11-15: падрабязнасці)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(праверана 2026-11-15: падрабязнасці)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(праверана 2026-11-15: наяўнасць)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(праверана 2026-11-15: падрабязнасці)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(праверана 2026-11-15: падрабязнасці)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(праверана 2026-11-15: падрабязнасці)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(праверана 2026-11-15: падрабязнасці)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(праверана 2026-11-15: наяўнасць)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(праверана 2026-11-15: падрабязнасці)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(праверана 2026-11-15: наяўнасць)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(праверана 2026-11-15: падрабязнасці)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(праверана 2026-11-15: падрабязнасці)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(праверана 2026-11-15: падрабязнасці)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(праверана 2026-11-15: падрабязнасці)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(праверана 2026-11-15: наяўнасць)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(праверана 2026-11-15: падрабязнасці)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(праверана 2026-11-15: падрабязнасці)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(праверана 2026-11-15: падрабязнасці)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(праверана 2026-11-15: падрабязнасці)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(праверана 2026-11-15: падрабязнасці)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(праверана 2026-11-15: падрабязнасці)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(праверана 2026-11-15: падрабязнасці)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(праверана 2026-11-15: падрабязнасці)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(праверана 2026-11-15: падрабязнасці)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(праверана 2026-11-15: падрабязнасці)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(праверана 2026-11-15: наяўнасць)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(праверана 2026-11-15: падрабязнасці)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(праверана 2026-11-15: падрабязнасці)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(праверана 2026-11-15: падрабязнасці)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(праверана 2026-11-15: падрабязнасці)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(праверана 2026-11-15: падрабязнасці)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(праверана 2026-11-15: падрабязнасці)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(праверана 2026-11-15: падрабязнасці)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(праверана 2026-11-15: падрабязнасці)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(праверана 2026-11-15: падрабязнасці)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(праверана 2026-11-15: падрабязнасці)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(праверана 2026-11-15: падрабязнасці)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(праверана 2026-11-15: падрабязнасці)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(праверана 2026-11-15: падрабязнасці)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(праверана 2026-11-15: падрабязнасці)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(праверана 2026-11-15: падрабязнасці)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(праверана 2026-11-15: падрабязнасці)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(праверана 2026-11-15: падрабязнасці)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(праверана 2026-11-15: падрабязнасці)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(праверана 2026-11-15: падрабязнасці)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(праверана 2026-11-15: падрабязнасці)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(праверана 2026-11-15: наяўнасць)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(праверана 2026-11-15: падрабязнасці)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(публічны дамен)* *(праверана 2026-11-15: наяўнасць)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(праверана 2026-11-15: падрабязнасці)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(праверана 2026-11-15: падрабязнасці)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(праверана 2026-11-15: падрабязнасці)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(праверана 2026-11-15: падрабязнасці)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(праверана 2026-11-15: падрабязнасці)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(праверана 2026-11-15: падрабязнасці)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(праверана 2026-11-15: падрабязнасці)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(праверана 2026-11-15: наяўнасць)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(праверана 2026-11-15: падрабязнасці)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(праверана 2026-11-15: наяўнасць)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(праверана 2026-11-15: наяўнасць)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(праверана 2026-11-15: падрабязнасці)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(праверана 2026-11-15: наяўнасць)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(праверана 2026-11-15: падрабязнасці)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(праверана 2026-11-15: падрабязнасці)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(праверана 2026-11-15: падрабязнасці)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(праверана 2026-11-15: падрабязнасці)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(праверана 2026-11-15: падрабязнасці)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(праверана 2026-11-15: наяўнасць)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(праверана 2026-11-15: падрабязнасці)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(праверана 2026-11-15: падрабязнасці)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(праверана 2026-11-15: падрабязнасці)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(праверана 2026-11-15: падрабязнасці)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(публічны дамен)* *(праверана 2026-11-15: падрабязнасці)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(праверана 2026-11-15: падрабязнасці)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(праверана 2026-11-15: падрабязнасці)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(праверана 2026-11-15: падрабязнасці)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(праверана 2026-11-15: наяўнасць)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(праверана 2026-11-15: падрабязнасці)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(праверана 2026-11-15: наяўнасць)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(праверана 2026-11-15: наяўнасць)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(праверана 2026-11-15: падрабязнасці)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(праверана 2026-11-15: падрабязнасці)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(праверана 2026-11-15: падрабязнасці)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(праверана 2026-11-15: падрабязнасці)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(праверана 2026-11-15: падрабязнасці)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(праверана 2026-11-15: падрабязнасці)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(праверана 2026-11-15: падрабязнасці)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(праверана 2026-11-15: падрабязнасці)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(праверана 2026-11-15: падрабязнасці)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(праверана 2026-11-15: падрабязнасці)*

<!-- kb:end -->
