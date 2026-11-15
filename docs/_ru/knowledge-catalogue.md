---
title: "Каталог знаний"
parent: "Линза знаний"
nav_order: 2
lang: "ru"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Каталог знаний

Это полный список того, что знает [линза знаний](knowledge.md): паттерны, которые она ищет, идеи, методы, исторические случаи и исследования, которые она цитирует, а также книги и статьи, на которых они основаны. Используйте его, чтобы найти запись по id или проверить источник.

Эта страница создаётся из базы знаний командой `node tools/knowledge-doc.mjs`; не редактируйте текст между метками.

<!-- kb:begin -->

База знаний содержит 579 записей (135 концептов, 37 методов, 277 исторических случаев, 17 принципов дизайна, 113 исследований) по 93 паттернам и ссылается на 556 источников.

### Паттерны (93) {#patterns-93}

| id | семейство | как это выглядит в данных |
|---|---|---|
| `concentration` | сила | Сторона, которая собирает больше юнитов в одном месте, побеждает там с перевесом, большим, чем одно только число юнитов. |
| `local-superiority` | сила | Убийства достаются той стороне, которая в радиусе боя превосходит противника численно, какими бы ни были общие итоги. |
| `attrition` | сила | Потери следуют за силами обеих сторон во времени; бой решает та сторона, у которой раньше кончаются ресурсы. |
| `exchange-ratio` | сила | Число убийств на одну потерю заметно различается по месту, стороне или классу. |
| `aimed-fire` | сила | Потери растут вместе с численностью врага, но не вместе со своей собственной. |
| `area-fire` | сила | Потери растут вместе с произведением численности обеих сторон: тесноту наказывают. |
| `defeat-in-detail` | сила | Сторону уничтожают по частям, потому что её части подходят по одной. |
| `mutual-support` | сила | На потерю быстро отвечает ближний товарищ по команде: происходят обмены. |
| `combined-arms` | сила | Классы хорошо работают вместе, когда каждый прикрывает слабость другого, и плохо работают поодиночке. |
| `class-counter` | сила | Один класс непропорционально выигрывает против определённого другого класса или в определённом месте. |
| `initiative` | сила | Тот, кто первым набирает очки в столкновении, обычно выигрывает его. |
| `key-terrain` | местность | Одни и те же несколько мест решают бои матч за матчем. |
| `fields-of-fire` | местность | Места, которые далеко видят по земле, которую другие должны пересечь, приносят больше убийств. |
| `high-ground` | местность | Убийства совершаются сверху, с земли выше той, на которой стоят жертвы. |
| `cover` | местность | Число смертей в единицу времени падает там, где геометрия закрывает обзор и огонь. |
| `open-ground` | местность | Число смертей в единицу времени растёт там, где ничто не закрывает обзор и огонь. |
| `kill-zone` | местность | Смерти сосредоточены там, где движение вынуждено идти по просматриваемой, простреливаемой местности. |
| `chokepoint` | местность | Много переходов протискиваются через небольшой участок, и там растут потери. |
| `reverse-slope` | местность | Безопасность сразу за гребнем или стеной, вне прямой видимости врага. |
| `safe-ground` | местность | Место, где проводят время, но мало погибают. |
| `obstacle` | местность | Маршруты огибают заблокированную местность и сходятся в несколько коридоров. |
| `flank` | движение | Редко используемый маршрут приносит больше убийств, чем основные. |
| `avenue-of-approach` | движение | Движение течёт по нескольким коридорам между районами. |
| `mobility` | движение | Подвижные юниты умирают реже (или чаще) за время, чем медленные или неподвижные. |
| `static-exposure` | движение | Юниты, которые стоят на месте, умирают за время чаще, чем движущиеся. |
| `interior-lines` | движение | Сторона с короткими маршрутами между своими боями быстрее перебрасывает силы, чем другая. |
| `envelopment` | движение | Убийства приходят с нескольких направлений на позицию одной стороны. |
| `ambush` | движение | Юниты, идущие по маршруту, быстро гибнут от врагов, уже занявших позицию. |
| `spawn-pressure` | время | Жизни заканчиваются скоро после начала у одной точки появления. |
| `tempo` | время | Более быстрая сторона приходит к бою и набирает очки раньше, чем другая успевает среагировать. |
| `surprise` | время | Потери приходят всплеском, прежде чем жертвы успевают ответить огнём. |
| `energy-advantage` | воздух | У убийц больше высоты и скорости, чем у их жертв. |
| `air-superiority` | воздух | Самолёты одной стороны убивают в много раз больше, чем теряют. |
| `sead` | воздух | Наземная противовоздушная оборона забирает много самолётов, пока её не найдут и не уничтожат. |
| `bvr` | воздух | Убийства происходят на большой дистанции, до того как жертва успевает сблизиться. |
| `fleet-salvo` | море | Сила, которая первой наносит удар, теряет мало; у другой мало что уцелело, чтобы ответить. |
| `scouting` | море | Сторона, которая первой находит другую, выбирает бой. |
| `urban-close` | город | Короткие дистанции боя, много смертей среди плотной застройки, медленная зачистка. |
| `vertical` | город | Убийства с верхних этажей или крыш по улицам. |
| `skill-dispersion` | люди | Несколько игроков дают большую долю убийств или смертей. |
| `ai-vs-player` | люди | Юниты под управлением ИИ действуют иначе, чем игроки на том же месте. |
| `balance` | дизайн | У сторон, точек появления или классов неравные шансы на старте. |
| `economy` | дизайн | Заработанные, потраченные и потерянные ресурсы сосредоточены у нескольких мест или игроков. |
| `flow` | дизайн | Как игроки движутся по уровню: петли, коридоры, тупики. |
| `sightlines` | дизайн | Длинные линии видимости решают, где начнутся бои и кто их выиграет. |
| `readability` | дизайн | Смерти, которых игрок не может предвидеть: сзади, из-за пределов видимости. |
| `formation` | движение | Юниты одной стороны движутся вместе в узнаваемой форме: линия, колонна, клин, эшелон, квадрат. |
| `frontal-assault` | движение | Группа идёт на врага прямо в лоб его фронта. |
| `double-envelopment` | движение | Две группы бьют по обоим флангам одного вражеского строя почти одновременно. |
| `encirclement` | движение | Вражеская группа оказывается окружённой другой стороной со всех сторон и с малым числом выходов. |
| `penetration` | движение | Группа проходит через вражескую линию там, где с обеих её сторон стоят враги. |
| `fire-and-maneuver` | движение | Часть группы движется, пока остальные стоят и прикрывают её, и роли меняются. |
| `feint` | движение | Небольшая группа отвлекает врага в одно место; основной удар наносится в другом месте вскоре после этого. |
| `withdrawal` | движение | Группа, которая в соприкосновении, поворачивает прочь и увеличивает дистанцию до врага. |
| `pursuit` | движение | Группа преследует врага, который уходит, сохраняя или сокращая дистанцию. |
| `defence-in-depth` | местность | Защитники стоят в нескольких рубежах один за другим вдоль направления наступления врага. |
| `screening` | движение | Небольшой отряд уходит далеко вперёд от основных сил и встречает врага первым. |
| `dispersion` | сила | Сторона со временем рассредоточивается; меньше её юнитов находятся в одном месте. |
| `missile-defence` | воздух | Самолёты под угрозой ракеты поворачивают так, чтобы угроза пришлась на борт или хвост: crank, notch, drag, pump. |
| `angles-fight` | воздух | Ближний воздушный бой на малой скорости и большой скорости поворота, ведётся за положение носа, а не за энергию. |
| `cap` | воздух | Самолёты кружат над фиксированной точкой минутами, ожидая, когда придёт враг. |
| `strike-package` | воздух | Самолёты разных ролей летят вместе к цели; одни атакуют землю, другие их прикрывают. |
| `line-of-battle` | море | Корабли идут колонной один за другим, чтобы работали все борта. |
| `crossing-the-t` | море | Колонна проходит поперёк головы вражеской колонны: все её орудия работают, а у врага мало. |
| `fatal-funnel` | город | Игроки, входящие в один проём, комнату или узкое место, гибнут там в считанные мгновения гораздо чаще, чем при входе в другом месте. |
| `crossfire` | сила | Засевшие, чьи линии огня сходятся с разных углов, выигрывают больше дуэлей, чем один засевший. |
| `peeker-advantage` | время | Игрок, который выходит в поле зрения, выигрывает дуэли против того, кто держит угол, чаще (или реже), чем в половине случаев. |
| `entry` | время | Первое убийство в раунде решает во многом весь раунд; входы выигрываются или проигрываются в зависимости от места и поддержки. |
| `utility-support` | сила | Вспышка или дым непосредственно перед дуэлью меняет того, кто её выиграет. |
| `man-advantage` | сила | Раунды выигрывает сторона с большим числом живых игроков, а некоторые команды превращают перевес в победу, а некоторые его растрачивают. |
| `clutch` | люди | Последние живые игроки выигрывают чаще (или реже), чем предсказывает состояние раунда. |
| `action-value` | люди | Убийства, обмены, закладки и полезные действия различаются по тому, насколько они меняют шанс выиграть. |
| `lurk` | движение | Игрок, который один и далеко от команды, убивает (или гибнет) с иной скоростью, чем стая. |
| `rotation` | движение | То, как быстро сторона переводит игроков к бою или к цели, решает, удержит она позицию или отвоюет её. |
| `collective-order` | люди | Движущиеся юниты одной стороны идут в одном направлении гораздо чаще, чем это бы вышло случайно из их собственных траекторий, сдвинутых во времени. |
| `milling` | люди | Юниты одной стороны ходят по кругу вокруг общего центра: вращение без чистого перемещения. |
| `herding` | люди | Юниты уходят из места так же, как это сделал товарищ перед ними, сверх собственных шансов места и сверх подражания врагу. |
| `lane-formation` | люди | Встречные потоки держатся разных полос; движение сосредотачивается на нескольких тропах, которыми пользуются матч за матчем. |
| `crowding` | люди | Скорость и поток падают, когда юниты сбиваются в кучу; через узкое место сильнее давить значит пропустить меньше. |
| `leadership` | люди | Одни юниты поворачивают первыми, а другие копируют их направление через несколько секунд. |
| `cohesion` | люди | Юниты, которые отходят от своей группы, гибнут чаще, чем те, что держатся с ней. |
| `breaking-point` | люди | Сторона, потерявшая долю своей силы, перестаёт сближаться и отходит, сверх того, что объясняет её расстояние до врага. |
| `panic` | люди | Под внезапной угрозой юниты разбегаются, уносятся прочь или замирают, и координация распадается. |
| `loss-chasing` | люди | После потери юниты берут на себя больше (или меньше) риска, чем после выигрыша. |
| `hot-hand` | люди | Успех чаще следует за успехом, чем позволяют перетасованные последовательности тех же игроков. |
| `conformity` | люди | Члены одной стороны выбирают одинаково: покупки, снаряжение, маршруты, сверх своих собственных предпочтений. |
| `suppression` | люди | Огонь противника меняет то, как юниты движутся и стреляют, даже когда не убивает. |
| `social-loafing` | люди | Действие на одного человека падает, когда товарищей становится больше. |
| `mixed-strategy` | люди | Выборы, которые должны быть непредсказуемыми, становятся закономерными: один вариант выигрывает чаще или выборы идут сериями. |
| `coordination` | люди | Участники действуют в такт без видимых приказов: синхронное движение, тайминг и выборы. |
| `contagion` | люди | Состояние передаётся от юнита к юниту по контакту или близости и распространяется по карте. |
| `territoriality` | люди | Юниты держат дистанцию друг от друга и держатся за свою территорию. |
| `interaction-network` | люди | Кто с кем сражается, поддерживает и за кем следует, образует сеть с узлами, кластерами и мостами. |

### Концепты (135) {#concepts-135}

| id | название | линзы | паттерны | источники |
|---|---|---|---|---|
| `concept.lanchester-square` | Квадратичный закон Ланчестера (прицельный огонь) | военное, воздух, море, киберспорт | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Линейный закон Ланчестера (площадной огонь, один на один) | военное, город, киберспорт | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Сосредоточение сил (масса) | военное, воздух, море, киберспорт | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Соотношение сил и правило 3:1 | военное | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Коэффициент обмена потерями | военное, воздух, киберспорт, дизайн | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Боевая мощь и её множители | военное | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Современная система применения сил | военное | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Цикл OODA (наблюдать, ориентироваться, решать, действовать) | военное, воздух, киберспорт | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Теория энергии и манёвренности | воздух | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Базовые истребительные манёвры и воздушное манёвренное противоборство | воздух | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Анализ местности: OAKOC / KOCOA | военное, дизайн, город | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: переменные задачи | военное | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Ключевая и решающая местность | военное, дизайн, киберспорт | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Наблюдение и секторы обстрела | военное, дизайн, киберспорт, город | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Укрытие и маскировка | военное, город, дизайн | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Направления подхода и коридоры мобильности | военное, дизайн | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Узкие места и теснины | военное, дизайн, киберспорт | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Зоны боя и зоны поражения | военное, город, дизайн | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Оборона за обратным скатом и укрытие в складке местности | военное, дизайн | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Господствующая высота | военное, дизайн | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Внутренние и внешние линии | военное | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Разгром по частям | военное, киберспорт | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Взаимная поддержка | военное, воздух, киберспорт | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Комбинированные виды войск | военное, дизайн | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Подавление | военное, город | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Подавление и уничтожение вражеской противовоздушной обороны (SEAD/DEAD) | воздух, военное | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Боевое воздушное патрулирование и господство в воздухе | воздух | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Бой за пределами визуальной видимости | воздух | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Непрямой подход | военное, киберспорт, дизайн | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Обход и окружение | военное | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Засада | военное, киберспорт, дизайн | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Глубокая оборона | военное | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Трение и туман войны | военное, киберспорт | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Кульминационный пункт наступления | военное | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Внезапность | военное, воздух, море, киберспорт | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Экономия сил | военное, киберспорт | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Городская местность | город, военное, киберспорт | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Контроль над морем и решающий флотский бой | морское | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Модель залпа Хьюза: атаковать первым, эффективно | морское, воздух | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Теория поиска и обнаружения | морское, воздух, военное | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Исследование операций: меры эффективности | военное, воздух, морское, дизайн | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Военные игры как анализ | военное, дизайн | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Война маневра | военное, киберспорт | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Сплочённость и моральный фактор | военное | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Центр тяжести | военное | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Решающие пункты | военное, киберспорт | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Линии операций | военное | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Стратегии уничтожения и истощения | военное | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Глубокий бой и глубокие операции | военное | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | военное, воздух | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Командование через задачу (Auftragstaktik) | военное, киберспорт | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Прорыв и развитие успеха | военное | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Огонь и движение | военное, киберспорт | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Перебежки под прикрытием | военное, киберспорт | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Разведывательное вытягивание и просачивание | военное, киберспорт | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Резерв | военное, киберспорт | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Гибкая оборона и контратака | военное | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Цепочка поражения (найти, зафиксировать, отследить, выбрать цель, поразить, оценить) | военное, воздух, морское | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Дальность обнаружения и дальность боя | воздух, морское, военное | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Показатель боевой эффективности | военное, киберспорт | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Рассредоточение на поле боя | военное, киберспорт | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Авиация непосредственной поддержки | воздух, военное | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Воздушный перехват (интердикция) | воздух, военное | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Сопровождение против свободной охоты истребителей | воздух | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Энергетический бой против маневренного | воздух | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Упреждение, чистое и отставание при преследовании | воздух | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Виражи Таха | воздух | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Пара и звено из четырёх («финггер-фор») | воздух | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Флот в потенции | морское | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Пересечение «Т» | морское, военное | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Конвой | морское | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Заграждение доступа и зона отказа (A2/AD) | морское, воздух, военное | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Оборона опорного пункта в застройке | город, военное | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Проход через стены домов и движение по зданиям | город, военное, дизайн | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Осада | военное, город | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Партизанская война | военное, город | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Контрповстанческая борьба | военное, город | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Убежище | военное, дизайн | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Обман (маскировка, маскировка-маскировка) | военное, киберспорт | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Информационное преимущество | военное, киберспорт | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Экономические раунды и темп ресурсов | киберспорт, дизайн | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Боевые порядки: линия, колонна, клин, эшелон | военное, киберспорт | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Фронтальная атака | военное | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Двойной обход (клещи) | военное | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Окружение и котёл | военное | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Проникновение и прорыв | военное | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Преследование | военное | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Отход: отступление, задержка и отход | военное | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Ложный удар и демонстрация | военное, киберспорт | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Охранение, прикрытие и обеспечение: защита впереди основных сил | военное | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Защита от ракеты: crank, notch, drag и pump | воздух | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Строи для боя за пределами визуальной видимости: стена, ведущий и ведомый, мясорубка, клещи | воздух | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Бой за углы и энергетический бой | воздух | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Ударный пакет и последовательность подавления | воздух | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Боевая линия | морское | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Роковая воронка | город, военное, киберспорт, дизайн | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Зачистка комнаты: внезапность, скорость, управляемое насилие | город, военное, киберспорт | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Точки господства | город, военное, киберспорт | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Зачистка углов: «резка пирога» | город, военное, киберспорт | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Перекрёстный огонь и взаимосвязанные секторы обстрела | военное, город, киберспорт, дизайн | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Преимущество выглядывающего | киберспорт, дизайн | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Перевес в людях в раундах на выбывание | киберспорт, военное | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Вход и первая дуэль | киберспорт, город | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Полезные действия перед входом: вспышка и дым | киберспорт, город, военное | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Модель социальных сил для движения пешеходов | дизайн, город, военное | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Образование полос при встречном потоке | дизайн, город | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Быстрее значит медленнее | дизайн, город, военное | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Фундаментальная диаграмма толп | дизайн, город | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Образование троп и желаемые линии движения | дизайн, военное | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Паника встречается редко: коллективная устойчивость | военное, город, дизайн | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: разделение, выравнивание, сплочение | дизайн, военное | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Параметр порядка и возникновение коллективного движения | дизайн, военное, воздух, морское | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Роевые, кружащие и поляризованные состояния | дизайн, военное, морское | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Эффективное лидерство без сигналов | военное, киберспорт, дизайн | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Соседи по количеству, а не по расстоянию | воздух, военное | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Роевой интеллект | дизайн, киберспорт, военное | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Стадное поведение и информационные каскады | киберспорт, дизайн, военное | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Социальная леность | киберспорт, дизайн, военное | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Размывание ответственности | киберспорт, военное | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Сплочённость первичной группы | военное, киберспорт | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Точки срыва и пороги потерь | военное | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Подавление: что огонь делает помимо убийства | военное, город | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Страх и стресс в боевых решениях | военное, киберспорт | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Срыв под давлением | киберспорт | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Теория перспектив и неприятие потерь | киберспорт, дизайн | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Эффекты «выйти в ноль» и «деньги казино» | киберспорт | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Тилт (потеря контроля после неудач) | киберспорт | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Невозвратные издержки | киберспорт, военное | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | «горячая рука» и её заблуждение | киберспорт | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Смешанные стратегии: быть непредсказуемым | киберспорт, дизайн, военное | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Общие ментальные модели | киберспорт, военное | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Составляющие командной работы | киберспорт, военное | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Виртуальные миры как лаборатории поведения | дизайн, киберспорт | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Личное пространство и территория | дизайн, город | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Сети взаимодействий: узлы и слабые связи | киберспорт, дизайн | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Методы (37) {#methods-37}

| id | название | паттерны | источники |
|---|---|---|---|
| `method.lanchester-fit` | Подгонка показателей Ланчестера под данные боя | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Коэффициент обмена по сторонам и по местам | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Местное соотношение сил в момент каждого убийства | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Зона видимости: секторы обстрела по линии видимости | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Удельная энергия в момент убийств и смертей (воздух) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Постоянство горячих точек от матча к матчу | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Частота обменов (взаимная поддержка) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Столкновения и преимущество первого убийства | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Пространственная автокорреляция смертей (I Морана) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Частоты относительно базовой линии карты с контролем FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Разведывательная подготовка поля боя (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Модели рейтинга парных сравнений (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Вероятность победы и оценка действий | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Контроль пространства и контроль поля | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Уравнение залпа, подогнанное под корабли в бою | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Коэффициент боевой эффективности на единицу времени в бою | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Дальности обнаружения и боя | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Тайминг цепочки поражения | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Рассредоточение против доли убийств (сосредоточение сил во времени) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Частота потерь и убийств за вылет | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Модель вероятности выигрыша раунда | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Ценность действия: добавленная вероятность победы | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Скорректированный плюс-минус методом гребневой регрессии (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Сжатие к среднему: эмпирический байес | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Ожидаемые исходы: от ожидаемых голов к ожидаемым дуэлям | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Измерение расстановок, ротаций и засад | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Проблема отражения: подражание или общая причина | herding, conformity | Manski 1993 |
| `method.streak-correction` | Серии с поправкой на конечную последовательность | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Параметры порядка поляризации и кружения | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Лидеры по корреляции направления со сдвигом во времени | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Проверка каскада маршрутов на стадное поведение | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Разделение полос и устойчивость троп | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Опасность отставших | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Кривая срыва | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Реакция на летящий огонь | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Риск после потери или выигрыша | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Согласие в покупках (каппа Флисса) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Исторические случаи (277) {#historical-cases-277}

| id | случай | когда | масштаб | паттерны | источники |
|---|---|---|---|---|---|
| `case.thermopylae` | Фермопилы | 480 до н. э. | сражение | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Саламин | 480 до н. э. | сражение | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Марафон | 490 до н. э. | сражение | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Левктры | 371 до н. э. | сражение | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Гавгамелы | 331 до н. э. | сражение | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Тразименское озеро | 217 до н. э. | сражение | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Канны | 216 до н. э. | сражение | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Тевтобургский лес | 9 н. э. | сражение | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Гастингс | 1066 | сражение | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Стерлинг-бридж | 1297 | сражение | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Азенкур | 1415 | сражение | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Лойтен | 1757 | сражение | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Аустерлиц | 1805 | сражение | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Трафальгар | 1805 | сражение | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Ватерлоо | 1815 | сражение | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Фредериксберг: Высоты Мэрайи | 1862 | столкновение | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Геттисберг: Литтл-Раунд-Топ | 1863 | столкновение | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Геттисберг: атака Пиккета | 1863 | столкновение | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Изандлвана | 1879 | сражение | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Роркс-Дрифт | 1879 | столкновение | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Танненберг | 1914 | кампания | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Сомма, первый день | 1 июля 1916 | сражение | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Верден | 1916 | кампания | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Ютландия | 1916 | сражение | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Суомуссалми | 1939-40 | сражение | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Седан и Арденны | май 1940 | кампания | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Контратака у Арраса | 21 мая 1940 | столкновение | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Битва за Британию | июль-окт. 1940 | кампания | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Битва за Атлантику: исследование операций для конвоев | 1939-45 | кампания | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Мидуэй | июнь 1942 | сражение | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Вторая битва при Эль-Аламейне | окт.-нояб. 1942 | сражение | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Перевал Кассерин | февр. 1943 | сражение | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Сталинград | авг. 1942-февр. 1943 | кампания | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Курск | июль 1943 | кампания | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Прохоровка | 12 июля 1943 | столкновение | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Вилье-Бокаж | 13 июня 1944 | столкновение | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Живые изгороди Нормандии | июнь-июль 1944 | кампания | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Операция «Кобра» | июль 1944 | кампания | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Лейте | окт. 1944 | сражение | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Бастонь | дек. 1944 | сражение | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Цусима | май 1905 | сражение | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Инчхон | сент. 1950 | кампания | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | «Аллея МиГов» | 1950-53 | кампания | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Дьен Бьен Фу | 1954 | сражение | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: зона посадки X-Ray | нояб. 1965 | столкновение | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Операция «Bolo» | 2 янв. 1967 | столкновение | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Голан: Долина слёз | окт. 1973 | сражение | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Синай: Китайская ферма | окт. 1973 | сражение | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Долина Бекаа (операция «Mole Cricket 19») | июнь 1982 | сражение | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Воздушная война за Фолкленды | май-июнь 1982 | кампания | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Воздушная кампания «Буря в пустыне» | янв.-февр. 1991 | кампания | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Истинг | 26 февр. 1991 | столкновение | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Могадишо | окт. 1993 | столкновение | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Грозный | дек. 1994-февр. 1995 | сражение | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Хюэ | янв.-март 1968 | сражение | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Воздушная кампания в Косово | март-июнь 1999 | кампания | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Фаллуджа (операция «Аль-Фаджр») | нояб. 2004 | сражение | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Мосул | 2016-17 | кампания | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Кадеш | ок. 1274 до н. э. | сражение | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Исс | 333 до н. э. | сражение | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Зама | 202 до н. э. | сражение | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Карры | 53 до н. э. | сражение | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Фарсал | 48 до н. э. | сражение | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Адрианополь | 378 н. э. | сражение | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Ярмук | 636 н. э. | сражение | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Манцикерт | 1071 | сражение | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Хаттин | 1187 | сражение | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Бэннокбёрн | 1314 | сражение | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Креси | 1346 | сражение | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Пуатье | 1356 | сражение | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Грюнвальд (Танненберг) | 1410 | сражение | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Брайтенфельд | 1631 | сражение | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Бленхейм | 1704 | сражение | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Полтава | 1709 | сражение | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Росбах | 1757 | сражение | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Саратога | 1777 | кампания | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Йорктаун | 1781 | сражение | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Йена и Ауэрштедт | 1806 | сражение | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Бородино | 1812 | сражение | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Лейпциг | 1813 | сражение | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Энтитем | 1862 | сражение | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Чанселорсвилль | 1863 | сражение | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Виксберг | 1863 | кампания | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Кёниггрец (Садова) | 1866 | сражение | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Седан | 1870 | сражение | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Мукден | 1905 | сражение | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Омдурман | 1898 | сражение | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Спайон-Коп | 1900 | столкновение | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Галлиполи | 1915 | кампания | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Камбре | нояб. 1917 | сражение | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Капоретто | окт.-нояб. 1917 | кампания | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Весеннее немецкое наступление (операция «Михаэль») | март-апр. 1918 | кампания | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Амьен | авг. 1918 | сражение | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Халхин-Гол (Номонхан) | авг. 1939 | сражение | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Польская кампания | сент. 1939 | кампания | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Ганнют и Жамблу | май 1940 | сражение | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Стон | май 1940 | столкновение | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Периметр Дюнкерка | май-июнь 1940 | кампания | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Операция «Компас» и Беда-Фомм | дек. 1940-февр. 1941 | кампания | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Операция «Крусейдер» и Сиди-Резег | нояб.-дек. 1941 | кампания | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Газала | май-июнь 1942 | сражение | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Алам-Хальфа | авг.-сент. 1942 | сражение | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Дубно-Броды | июнь 1941 | сражение | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Киевский котёл | сент. 1941 | кампания | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Москва | окт. 1941-янв. 1942 | кампания | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ржев и операция «Марс» | 1942 | кампания | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Вторая битва за Харьков | май 1942 | сражение | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Третья битва за Харьков (обратный удар Манштейна) | февр.-март 1943 | кампания | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Операция «Багратион» | июнь-авг. 1944 | кампания | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Корсунь-Шевченковский котёл | янв.-февр. 1944 | сражение | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Каменец-Подольский котёл | март-апр. 1944 | кампания | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Операция «Эпсом» | июнь 1944 | сражение | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Операция «Гудвуд» | июль 1944 | сражение | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Операция «Тоталайз» | авг. 1944 | сражение | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Мортен | авг. 1944 | сражение | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Фалезский котёл | авг. 1944 | кампания | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | «Маркет-Гарден» и Арнем | сент. 1944 | кампания | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Аахен | окт. 1944 | сражение | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Хюртгенский лес | сент. 1944-февр. 1945 | кампания | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Аракур | сент. 1944 | сражение | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Сент-Вит | дек. 1944 | сражение | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Эльзенборнский хребет | дек. 1944 | сражение | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Зееловские высоты | апр. 1945 | сражение | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Берлин | апр.-май 1945 | сражение | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Операция «Весеннее пробуждение» | март 1945 | сражение | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ортона | дек. 1943 | сражение | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Варшавское восстание | авг.-окт. 1944 | кампания | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Тарава | нояб. 1943 | сражение | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Пелелиу | сент.-нояб. 1944 | сражение | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Иводзима | февр.-март 1945 | сражение | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Окинава | апр.-июнь 1945 | кампания | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Манила | февр.-март 1945 | сражение | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Маньчжурия (Августовская буря) | авг. 1945 | кампания | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Пусанский периметр | авг.-сент. 1950 | кампания | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Чосинское водохранилище | нояб.-дек. 1950 | кампания | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Имджин | апр. 1951 | сражение | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Капён | апр. 1951 | сражение | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Порк-Чоп-Хилл | апр. и июль 1953 | столкновение | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Кхесань | янв.-апр. 1968 | сражение | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Дакто | нояб. 1967 | сражение | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Гамбургер-Хилл (гора Ап-Би) | май 1969 | столкновение | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Абу-Агейла — Ум-Катеф | июнь 1967 | сражение | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Исмаилия | окт. 1973 | сражение | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Султан-Якуб | июнь 1982 | столкновение | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Осада Бейрута | июнь-авг. 1982 | кампания | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Ливан 2006: Бинт-Джбейль и угроза противотанковых средств | июль-авг. 2006 | кампания | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Эль-Фао | февр. 1986 | сражение | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Басра («Кербела-5») | янв.-февр. 1987 | сражение | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Хафджи | янв.-февр. 1991 | сражение | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Цель «Норфолк» | 26-27 февр. 1991 | сражение | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Хребет Медина | 27 февр. 1991 | сражение | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Ложные удары у Вади-аль-Батин | февр. 1991 | кампания | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Насирия | март 2003 | сражение | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Цель «Пич» | апр. 2003 | столкновение | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Броски «Гром» | апр. 2003 | сражение | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Перевал Дебека | апр. 2003 | столкновение | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Рамади | 2006-07 | кампания | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Садр-Сити | март-май 2008 | сражение | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Операция «Анаконда» | март 2002 | сражение | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Ванат | июль 2008 | столкновение | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Камдеш (застава COP Keating) | окт. 2009 | столкновение | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Муса-Кала и заставы-дома взвода | 2006-07 | кампания | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Битва за Алжир | 1956-57 | кампания | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Родезийский «Огненный отряд» | 1974-79 | кампания | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Осада Сараево | 1992-96 | кампания | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Грозный 1999-2000 | дек. 1999-февр. 2000 | сражение | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Русско-грузинская война | авг. 2008 | кампания | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Зеленопилье | июль 2014 | столкновение | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Иловайск | авг. 2014 | сражение | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Дебальцево | янв.-февр. 2015 | сражение | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Донецкий аэропорт | сент. 2014-янв. 2015 | сражение | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Гостомельский аэропорт | февр. 2022 | столкновение | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Киевское направление и засада у Броваров | март 2022 | столкновение | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Мариуполь и «Азовсталь» | февр.-май 2022 | сражение | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Харьковское контрнаступление | сент. 2022 | кампания | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Переправа через Северский Донец у Белогоровки | май 2022 | столкновение | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Бахмут | авг. 2022-май 2023 | сражение | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Запорожское наступление | июнь-нояб. 2023 | кампания | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Нагорно-Карабахская война | сент.-нояб. 2020 | кампания | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Блиц | сент. 1940-май 1941 | кампания | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | «Барбаросса»: первый день в воздухе | 22 июня 1941 | сражение | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Крит | май 1941 | сражение | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Осада Мальты | 1940-1942 | кампания | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Воздушный мост к Сталинграду | нояб. 1942-февр. 1943 | кампания | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Воздушные бои над Кубанью | апр.-июнь 1943 | кампания | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Курская дуга в воздухе | июль 1943 | сражение | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Операция «Багратион» в воздухе | июнь-авг. 1944 | кампания | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Плоешти (операция «Tidal Wave») | 1 авг. 1943 | столкновение | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Налёт на плотины (операция «Chastise») | 16-17 мая 1943 | столкновение | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Гамбург (операция «Гоморра») | июль-авг. 1943 | сражение | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Швайнфурт — Регенсбург | 17 авг. 1943 | сражение | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Второй Швайнфурт («Чёрный четверг») | 14 окт. 1943 | столкновение | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | «Большая неделя» (операция «Argument») | февр. 1944 | кампания | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Налёт на Нюрнберг | 30-31 марта 1944 | столкновение | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Операция «Боденплатте» | 1 янв. 1945 | сражение | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Сражение в Бисмарковом море | март 1943 | сражение | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Нейтрализация Рабаула | 1943-1944 | кампания | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Филиппинское море («Охота на индеек» у Марианских островов) | июнь 1944 | сражение | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Чёрный вторник над Намсы | 23 окт. 1951 | столкновение | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Операция «Rolling Thunder» | 1965-1968 | кампания | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Мост Тханьхоа | 1965-1972 | столкновение | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | «Дикие ласки» (Wild Weasels) | 1965-1973 | кампания | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Доклад Олта и «Топ Ган» | 1968-1972 | кампания | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Операция «Linebacker» | май-окт. 1972 | кампания | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | «Linebacker II» («Одиннадцатидневная война») | дек. 1972 | кампания | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Операция «Фокус» (Moked) | 5 июня 1967 | сражение | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Война на истощение: пояс ЗРК | 1969-1970 | кампания | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Зонтик ЗРК над каналом | окт. 1973 | сражение | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Осирак (операция «Opera») | 7 июня 1981 | столкновение | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Операция «El Dorado Canyon» | 15 апр. 1986 | столкновение | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Воздушная война Ирана и Ирака | 1980-1988 | кампания | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Рейды «Black Buck» | май-июнь 1982 | столкновение | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | «Instant Thunder»: планирование воздушной кампании в Заливе | авг. 1990-янв. 1991 | кампания | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Оперативная группа «Нормандия»: первый удар «Апачей» | 17 янв. 1991 | столкновение | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Большая охота на «Скады» | янв.-февр. 1991 | кампания | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Перевал Мутла («Дорога смерти») | 26-27 февр. 1991 | столкновение | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Операция «Анаконда»: «Апачи» в Шахи-Коте | март 2002 | сражение | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Атака «Апачей» под Кербелой | 24 марта 2003 | столкновение | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Воздушная кампания над Ливией | март-окт. 2011 | кампания | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Нагорный Карабах: дроны и ПВО | сент.-нояб. 2020 | кампания | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Украина: оспариваемое небо | 2022 | кампания | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Гостомельский аэропорт | февр. 2022 | столкновение | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Лам Шон 719 | февр.-март 1971 | кампания | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Операция «Eagle Claw» | апр. 1980 | столкновение | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Афганистан: «Стингер» | 1986-1989 | кампания | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Лепанто | 1571 | сражение | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Испанская Армада | 1588 | кампания | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Бухта Киберон | 1759 | сражение | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Чесапик (Вирджинские мысы) | 1781 | сражение | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Нил (бухта Абукир) | 1798 | сражение | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Копенгаген | 1801 | сражение | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Хэмптон-Роудс | март 1862 | столкновение | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Лисса | 1866 | сражение | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Ялу | 1894 | сражение | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Манильская бухта | 1898 | сражение | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Гельголандская бухта | авг. 1914 | сражение | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Коронель и Фолклендские острова | нояб.-дек. 1914 | кампания | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Доггер-Банк | янв. 1915 | сражение | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Ла-Плата | дек. 1939 | сражение | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Таранто | нояб. 1940 | столкновение | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Мыс Матапан | март 1941 | сражение | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Датский пролив и гибель «Бисмарка» | май 1941 | кампания | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Перл-Харбор | 7 дек. 1941 | столкновение | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | «Prince of Wales» и «Repulse» | 10 дек. 1941 | столкновение | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Яванское море | февр. 1942 | сражение | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Коралловое море | май 1942 | сражение | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Саво | авг. 1942 | сражение | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Восточные Соломоновы острова | авг. 1942 | сражение | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Мыс Эспаранс | окт. 1942 | сражение | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Острова Санта-Крус | окт. 1942 | сражение | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Морское сражение у Гуадалканала | 12-15 нояб. 1942 | сражение | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Тассафаронга | нояб. 1942 | столкновение | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Прорыв через Ла-Манш | февр. 1942 | столкновение | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Операция «Pedestal» | авг. 1942 | сражение | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Чёрный май | май 1943 | кампания | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Нордкап | дек. 1943 | сражение | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Подводная кампания США против Японии | 1941-1945 | кампания | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | У острова Самар | 25 окт. 1944 | сражение | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Пролив Суригао | 25 окт. 1944 | сражение | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Окинава: кампания камикадзе | апр.-июнь 1945 | кампания | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Гибель «Эйлата» | окт. 1967 | столкновение | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Латакия | окт. 1973 | сражение | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Гибель крейсера «General Belgrano» | 2 мая 1982 | столкновение | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Потеря HMS «Sheffield» | 4 мая 1982 | столкновение | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS «Stark» | 17 мая 1987 | столкновение | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Операция «Praying Mantis» | 18 апр. 1988 | сражение | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | авг. 2004 | столкновение | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Революция Bisu | март 2007 | сражение | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | «Dream Coil» на The International 2013 | авг. 2013 | столкновение | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Zed Faker против Ryu | сент. 2013 | столкновение | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Буст на эстакаде | нояб. 2014 | столкновение | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Прыгающий AWP на Mirage | апр. 2016 | столкновение | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis и эпоха гранат | 2018 | кампания | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five против OG | апр. 2019 | сражение | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar достигает уровня грандмастера | 2019 | кампания | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Левый крюк (наступление на суше в операции «Буря в пустыне») | 24-28 февр. 1991 | кампания | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Инцидент «Corrupted Blood» | сент. 2005 | кампания | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Дизайн игровых уровней (17) {#game-and-level-design-17}

| id | название | паттерны | источники |
|---|---|---|---|
| `design.chokepoint` | Узкие места в дизайне уровней | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Фланговые маршруты и обходные пути | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Линии видимости и дистанция боя | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Расстановка и ритм укрытий | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Дизайн точек появления и защита при появлении | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Баланс симметричных и асимметричных карт | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Баланс классов и контрмеры | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Поток, петли и понятные планировки | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Экономики игр и петли обратной связи | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Подбор игроков и разброс навыков | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Противники-ИИ как зонды уровня | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Осмысленная игра и выбор | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Обмены и командная игра в шутерах | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Контроль карты | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Тепловые карты и пространственная телеметрия в дизайне | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Мастерство, обучение и удовольствие | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Экономика раундов и решения о покупках | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Исследования (113) {#studies-113}

| id | название | источники |
|---|---|---|
| `study.engel-1954` | Энгель: квадратичный закон Ланчестера на Иводзиме | Engel 1954 |
| `study.bracken-1995` | Брэкен: модели Ланчестера для Арденн | Bracken 1995 |
| `study.fricker-1998` | Фрикер: модели истощения для Арденн, пересмотр | Fricker 1998 |
| `study.lucas-turkes-2004` | Лукас и Тюркес: Курск и Арденны | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Хартли и Хелмбольд: проверка квадратичного закона | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Пространственный анализ гибели игроков (GIS) | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: визуализация соревновательного поведения | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Оценка действий в Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Обнаружение столкновений в киберспорте | Schubert et al. 2016 |
| `study.red-baron` | Проект «Red Baron»: воздушный бой над Вьетнамом | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Дюпюи: количественная оценка исторических сражений | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Биддл: применение сил объясняет исходы | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Обзор визуализации игровых данных | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Уиллард: Ланчестер против трёх веков сухопутных сражений | Willard 1962; Fain 1977 |
| `study.fain-1977` | Фейн: шестьдесят сражений Второй мировой войны | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Вайсс: боевые модели и Гражданская война в США | Weiss 1966 |
| `study.hartley-1995-attrition` | Хартли: статистическая модель данных об истощении | Hartley 1995 |
| `study.helmbold-1995` | Хелмбольд: скорости продвижения в сухопутном бою | Helmbold 1995 |
| `study.lucas-dinges-2004` | Лукас и Динджес: обстоятельства важнее закона | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | База данных по Курской дуге | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | База данных по кампании в Арденнах | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Джонсон и Маккей: Битва за Британию как данные Ланчестера | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Ротте и Шмидт: численность по-прежнему выигрывает сражения | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Дюпюи: закономерности боевых потерь | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Тактическая численная детерминированная модель Дюпюи | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Лоуренс: война в цифрах | Lawrence 2017 |
| `study.vancreveld-1982` | Ван Кревельд: боевая мощь | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Райтер и Стэм: демократии на войне | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Эпштейн: адаптивная динамическая модель | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Дейчман: Ланчестер и партизанская война | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Армстронг: стохастическая модель залпа | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Хьюз: основы флотской тактики | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Спор о правиле 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Крес: моделирование вооружённых конфликтов | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Доклад Олта: ракеты, выпущенные вне своих границ применения | Ault 1969; Michel 1997 |
| `study.gwaps` | Обзор воздушной мощи в Войне в Заливе | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | «Цирк» Блэкетта | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Настройки глубинных бомб в Береговом командовании | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Белые нижние поверхности противолодочных самолётов | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Вальд: броня там, где возвращавшиеся бомбардировщики не были поражены | Mangel & Samaniego 1984 |
| `study.optimal-search` | Оптимальный поиск: от подлодок до AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Гленн: бой в аду | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Заграждение доступа и зона отказа | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Как игроки теряют интерес | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Кластеризация поведения игроков в природных условиях | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Обнаружение разочарования игроков | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: панели телеметрии в производстве | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: визуальная аналитика игрового процесса | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Движение аватаров на полях боя World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: массовые пользовательские тесты с инструментами | Kim et al. 2008 |
| `study.game-data-science` | Наука о данных в играх | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Искусственный интеллект и игры | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Навык и перемещения команды в Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Боевые паттерны, предсказывающие победы в MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Роли игроков в Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Предсказание исходов Dota 2 по драфтам | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Предсказание победы в прямом эфире в профессиональном киберспорте | Hodge et al. 2021 |
| `study.rioult-2014` | Топология позиций игроков | Rioult et al. 2014 |
| `study.bednarek-2017` | Оценка игроков в командных шутерах | Bednárek et al. 2017 |
| `study.katona-2019` | Предсказание, кто погибнет следующим | Katona et al. 2019 |
| `study.block-2018` | Истории на основе данных для аудитории киберспорта | Block et al. 2018 |
| `study.ggviz` | ggViz: поиск игровых состояний в большом масштабе | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: крупномасштабное обучение с подкреплением в Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: уровень грандмастера в StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Ожидаемая ценность владения мячом в баскетболе | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: оценка действий с мячом в футболе | Decroos et al. 2019 |
| `study.pitch-control` | Контроль поля и создание пространства | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Пространственная структура защитного мастерства | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Роли команды по данным трекинга | Lucey et al. 2013 |
| `study.shot-quality` | Ожидаемые голы и качество удара | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: пространственная эффективность бросков | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Пространственно-временной анализ командных видов спорта | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K-функция Рипли: кластеризация на каждом масштабе | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Кларк и Эванс: рассредоточение по ближайшему соседу | Clark & Evans 1954 |
| `study.getis-ord` | Горячие точки Гетиса — Орда | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Локальные индикаторы пространственной связи | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Статистика пространственного сканирования | Kulldorff 1997 |
| `study.kde` | Оценка плотности ядром | Silverman 1986 |
| `study.knox-1964` | Пространственно-временное взаимодействие | Knox 1964; Diggle 2013 |
| `study.maup` | Проблема модифицируемой areal-единицы (MAUP) | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Изовисты и графы видимости | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Пространственный синтаксис | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Средняя скученность | Lloyd 1967 |
| `study.survival-analysis` | Анализ выживаемости для времени до смерти | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Обобщённые линейные модели для счётных данных | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Бутстрэп и интервальные оценки | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Токи и др.: задержка и преимущество выглядывающего | Tokey et al. 2024 |
| `study.lee-chang-2017` | Ли и Чанг: выстрел из-за угла | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Клейпул: задержка и действия игрока | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Ксеноулос и др.: профессионалы и любители через вероятность победы | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Ксеноулос и др.: экономические решения в Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Меймин: умные убийства и бесполезные смерти | Maymin 2021 |
| `study.moba-live-prediction` | Предсказание исхода MOBA в реальном времени | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Хаякава и др.: раунды Valorant по тактическим признакам | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Паскив и др.: роли в профессиональном Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ибрагим и др.: тренировка ближнего боя | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Турбулентность толпы на хадже 2006 года | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Группы пешеходов формируют толпы | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Иерархическая динамика групп в стаях голубей | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Социальное влияние делает успех неравным и непредсказуемым | Salganik et al. 2006 |
| `study.wisdom-undermined` | Социальное влияние подрывает мудрость толпы | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Притягательная сила толпы | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Подчинение единодушному большинству | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | «Почему они сражаются»: боевая мотивация в Ираке | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Сплочённость и результативность: метаанализы | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Неприятие потерь у профессиональных игроков в гольф | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | «Горячая рука» в бейсболе | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Пенальти: профессионалы играют минимакс | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Игра минимакс на Уимблдоне | Walker & Wooders 2001 |
| `study.collective-intelligence` | Коллективный интеллект команд | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Социальные сети онлайн-мира | Szell et al. 2010 |
| `study.team-networks` | Сети передач и результативность команды | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Поведение распространяется по кластеризованным сетям | Centola 2010 |

### Библиография {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(проверено 2026-11-15: подробно)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(проверено 2026-11-15: подробно)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(проверено 2026-11-15: подробно)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(проверено 2026-11-15: подробно)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(проверено 2026-11-15: подробно)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(проверено 2026-11-15: подробно)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(проверено 2026-11-15: подробно)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(проверено 2026-11-15: подробно)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(проверено 2026-11-15: подробно)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(проверено 2026-11-15: подробно)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(проверено 2026-11-15: подробно)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(проверено 2026-11-15: подробно)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(проверено 2026-11-15: подробно)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(проверено 2026-11-15: подробно)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(проверено 2026-11-15: подробно)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(проверено 2026-11-15: подробно)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(проверено 2026-11-15: подробно)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(проверено 2026-11-15: подробно)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(проверено 2026-11-15: подробно)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(проверено 2026-11-15: подробно)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(проверено 2026-11-15: подробно)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(проверено 2026-11-15: подробно)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(проверено 2026-11-15: подробно)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(проверено 2026-11-15: подробно)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(проверено 2026-11-15: подробно)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(проверено 2026-11-15: подробно)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(проверено 2026-11-15: подробно)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(проверено 2026-11-15: существование)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(проверено 2026-11-15: подробно)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(проверено 2026-11-15: подробно)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(проверено 2026-11-15: подробно)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(проверено 2026-11-15: подробно)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(проверено 2026-11-15: подробно)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(проверено 2026-11-15: подробно)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(проверено 2026-11-15: существование)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(проверено 2026-11-15: подробно)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(проверено 2026-11-15: подробно)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(проверено 2026-11-15: подробно)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(проверено 2026-11-15: подробно)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(проверено 2026-11-15: подробно)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(проверено 2026-11-15: подробно)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(проверено 2026-11-15: существование)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(проверено 2026-11-15: подробно)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(проверено 2026-11-15: подробно)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(проверено 2026-11-15: подробно)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(проверено 2026-11-15: подробно)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(проверено 2026-11-15: существование)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(проверено 2026-11-15: подробно)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(проверено 2026-11-15: подробно)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(проверено 2026-11-15: подробно)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(проверено 2026-11-15: подробно)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(проверено 2026-11-15: существование)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(проверено 2026-11-15: подробно)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(проверено 2026-11-15: подробно)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(проверено 2026-11-15: подробно)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(проверено 2026-11-15: подробно)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(проверено 2026-11-15: подробно)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(проверено 2026-11-15: подробно)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(проверено 2026-11-15: подробно)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(проверено 2026-11-15: подробно)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(проверено 2026-11-15: подробно)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(проверено 2026-11-15: подробно)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(проверено 2026-11-15: подробно)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(проверено 2026-11-15: подробно)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(проверено 2026-11-15: подробно)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(проверено 2026-11-15: подробно)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(проверено 2026-11-15: подробно)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(проверено 2026-11-15: подробно)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(проверено 2026-11-15: подробно)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(проверено 2026-11-15: подробно)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(проверено 2026-11-15: подробно)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(проверено 2026-11-15: подробно)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(проверено 2026-11-15: подробно)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(проверено 2026-11-15: существование)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(проверено 2026-11-15: подробно)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(проверено 2026-11-15: подробно)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(проверено 2026-11-15: подробно)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(проверено 2026-11-15: существование)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(проверено 2026-11-15: существование)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(проверено 2026-11-15: подробно)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(проверено 2026-11-15: подробно)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(проверено 2026-11-15: подробно)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(проверено 2026-11-15: существование)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(проверено 2026-11-15: подробно)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(проверено 2026-11-15: подробно)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(проверено 2026-11-15: подробно)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(проверено 2026-11-15: подробно)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(проверено 2026-11-15: подробно)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(проверено 2026-11-15: существование)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(проверено 2026-11-15: подробно)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(проверено 2026-11-15: подробно)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(проверено 2026-11-15: подробно)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(проверено 2026-11-15: подробно)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(проверено 2026-11-15: подробно)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(проверено 2026-11-15: подробно)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(проверено 2026-11-15: подробно)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(проверено 2026-11-15: существование)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(проверено 2026-11-15: подробно)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(проверено 2026-11-15: подробно)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(проверено 2026-11-15: подробно)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(проверено 2026-11-15: подробно)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(проверено 2026-11-15: подробно)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(проверено 2026-11-15: подробно)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(проверено 2026-11-15: подробно)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(проверено 2026-11-15: подробно)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(проверено 2026-11-15: подробно)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(проверено 2026-11-15: существование)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(проверено 2026-11-15: подробно)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(проверено 2026-11-15: подробно)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(проверено 2026-11-15: подробно)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(проверено 2026-11-15: подробно)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(проверено 2026-11-15: подробно)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(проверено 2026-11-15: подробно)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(проверено 2026-11-15: подробно)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(проверено 2026-11-15: подробно)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(проверено 2026-11-15: подробно)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(проверено 2026-11-15: подробно)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(проверено 2026-11-15: подробно)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(проверено 2026-11-15: подробно)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(проверено 2026-11-15: подробно)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(проверено 2026-11-15: подробно)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(проверено 2026-11-15: подробно)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(проверено 2026-11-15: подробно)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(проверено 2026-11-15: подробно)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(проверено 2026-11-15: подробно)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(проверено 2026-11-15: существование)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(проверено 2026-11-15: подробно)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(проверено 2026-11-15: подробно)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(проверено 2026-11-15: подробно)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(проверено 2026-11-15: подробно)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(проверено 2026-11-15: подробно)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(проверено 2026-11-15: подробно)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(проверено 2026-11-15: подробно)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(проверено 2026-11-15: подробно)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(проверено 2026-11-15: подробно)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(проверено 2026-11-15: подробно)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(проверено 2026-11-15: подробно)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(проверено 2026-11-15: подробно)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(проверено 2026-11-15: подробно)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(проверено 2026-11-15: подробно)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(проверено 2026-11-15: подробно)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(проверено 2026-11-15: подробно)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(проверено 2026-11-15: подробно)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(проверено 2026-11-15: подробно)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(проверено 2026-11-15: подробно)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(проверено 2026-11-15: подробно)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(проверено 2026-11-15: подробно)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(проверено 2026-11-15: подробно)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(проверено 2026-11-15: подробно)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(проверено 2026-11-15: подробно)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(проверено 2026-11-15: подробно)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(проверено 2026-11-15: подробно)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(проверено 2026-11-15: подробно)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(проверено 2026-11-15: подробно)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(проверено 2026-11-15: подробно)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(проверено 2026-11-15: подробно)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(проверено 2026-11-15: подробно)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(проверено 2026-11-15: подробно)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(проверено 2026-11-15: подробно)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(проверено 2026-11-15: подробно)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(проверено 2026-11-15: подробно)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(проверено 2026-11-15: подробно)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(проверено 2026-11-15: подробно)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(проверено 2026-11-15: подробно)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(проверено 2026-11-15: подробно)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(проверено 2026-11-15: подробно)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(проверено 2026-11-15: подробно)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(проверено 2026-11-15: подробно)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(проверено 2026-11-15: подробно)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(проверено 2026-11-15: подробно)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(проверено 2026-11-15: подробно)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(проверено 2026-11-15: подробно)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(проверено 2026-11-15: подробно)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(проверено 2026-11-15: подробно)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(проверено 2026-11-15: подробно)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(проверено 2026-11-15: подробно)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(проверено 2026-11-15: подробно)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(проверено 2026-11-15: подробно)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(проверено 2026-11-15: подробно)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(проверено 2026-11-15: существование)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(проверено 2026-11-15: подробно)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(проверено 2026-11-15: подробно)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(проверено 2026-11-15: подробно)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(проверено 2026-11-15: подробно)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(проверено 2026-11-15: подробно)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(проверено 2026-11-15: подробно)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(проверено 2026-11-15: подробно)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(проверено 2026-11-15: подробно)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(проверено 2026-11-15: подробно)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(проверено 2026-11-15: подробно)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(проверено 2026-11-15: подробно)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(проверено 2026-11-15: подробно)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(проверено 2026-11-15: подробно)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(проверено 2026-11-15: подробно)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(проверено 2026-11-15: подробно)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(проверено 2026-11-15: подробно)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(проверено 2026-11-15: подробно)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(проверено 2026-11-15: подробно)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(проверено 2026-11-15: подробно)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(проверено 2026-11-15: подробно)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(проверено 2026-11-15: подробно)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(проверено 2026-11-15: подробно)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(проверено 2026-11-15: существование)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(проверено 2026-11-15: подробно)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(проверено 2026-11-15: подробно)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(проверено 2026-11-15: подробно)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(проверено 2026-11-15: подробно)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(проверено 2026-11-15: подробно)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(проверено 2026-11-15: подробно)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(проверено 2026-11-15: подробно)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(проверено 2026-11-15: подробно)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(проверено 2026-11-15: подробно)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(проверено 2026-11-15: подробно)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(проверено 2026-11-15: подробно)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(проверено 2026-11-15: подробно)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(проверено 2026-11-15: подробно)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(проверено 2026-11-15: существование)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(проверено 2026-11-15: подробно)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(проверено 2026-11-15: подробно)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(проверено 2026-11-15: подробно)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(проверено 2026-11-15: подробно)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(проверено 2026-11-15: подробно)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(проверено 2026-11-15: подробно)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(проверено 2026-11-15: подробно)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(проверено 2026-11-15: подробно)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(проверено 2026-11-15: подробно)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(проверено 2026-11-15: подробно)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(проверено 2026-11-15: существование)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(проверено 2026-11-15: подробно)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(проверено 2026-11-15: подробно)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(проверено 2026-11-15: подробно)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(проверено 2026-11-15: подробно)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(проверено 2026-11-15: подробно)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(проверено 2026-11-15: существование)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(проверено 2026-11-15: подробно)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(проверено 2026-11-15: подробно)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(проверено 2026-11-15: подробно)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(проверено 2026-11-15: подробно)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(проверено 2026-11-15: подробно)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(проверено 2026-11-15: существование)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(проверено 2026-11-15: подробно)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(проверено 2026-11-15: подробно)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(проверено 2026-11-15: подробно)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(проверено 2026-11-15: подробно)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(проверено 2026-11-15: существование)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(проверено 2026-11-15: подробно)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(проверено 2026-11-15: подробно)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(проверено 2026-11-15: подробно)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(проверено 2026-11-15: подробно)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(проверено 2026-11-15: подробно)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(проверено 2026-11-15: подробно)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(проверено 2026-11-15: подробно)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(проверено 2026-11-15: подробно)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(проверено 2026-11-15: подробно)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(проверено 2026-11-15: подробно)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(проверено 2026-11-15: существование)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(проверено 2026-11-15: подробно)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(проверено 2026-11-15: подробно)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(проверено 2026-11-15: подробно)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(проверено 2026-11-15: подробно)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(проверено 2026-11-15: подробно)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(проверено 2026-11-15: подробно)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(проверено 2026-11-15: подробно)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(проверено 2026-11-15: подробно)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(проверено 2026-11-15: подробно)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(проверено 2026-11-15: подробно)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(проверено 2026-11-15: существование)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(проверено 2026-11-15: существование)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(проверено 2026-11-15: подробно)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(проверено 2026-11-15: подробно)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(проверено 2026-11-15: подробно)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(проверено 2026-11-15: подробно)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(проверено 2026-11-15: подробно)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(проверено 2026-11-15: существование)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(проверено 2026-11-15: существование)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(проверено 2026-11-15: подробно)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(проверено 2026-11-15: подробно)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(проверено 2026-11-15: существование)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(проверено 2026-11-15: подробно)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(проверено 2026-11-15: подробно)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(проверено 2026-11-15: подробно)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(проверено 2026-11-15: подробно)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(проверено 2026-11-15: подробно)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(проверено 2026-11-15: подробно)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(проверено 2026-11-15: подробно)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(проверено 2026-11-15: подробно)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(проверено 2026-11-15: подробно)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(проверено 2026-11-15: подробно)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(проверено 2026-11-15: подробно)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(проверено 2026-11-15: подробно)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(проверено 2026-11-15: подробно)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(проверено 2026-11-15: подробно)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(проверено 2026-11-15: существование)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(проверено 2026-11-15: подробно)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(проверено 2026-11-15: подробно)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(проверено 2026-11-15: подробно)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(проверено 2026-11-15: подробно)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(проверено 2026-11-15: подробно)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(проверено 2026-11-15: подробно)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(проверено 2026-11-15: подробно)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(проверено 2026-11-15: подробно)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(проверено 2026-11-15: подробно)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(проверено 2026-11-15: подробно)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(проверено 2026-11-15: подробно)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(проверено 2026-11-15: подробно)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(проверено 2026-11-15: подробно)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(проверено 2026-11-15: подробно)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(проверено 2026-11-15: подробно)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(проверено 2026-11-15: подробно)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(проверено 2026-11-15: подробно)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(проверено 2026-11-15: подробно)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(проверено 2026-11-15: подробно)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(проверено 2026-11-15: подробно)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(проверено 2026-11-15: подробно)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(проверено 2026-11-15: подробно)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(проверено 2026-11-15: подробно)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(проверено 2026-11-15: подробно)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(проверено 2026-11-15: подробно)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(проверено 2026-11-15: подробно)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(проверено 2026-11-15: подробно)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(проверено 2026-11-15: подробно)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(проверено 2026-11-15: подробно)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(проверено 2026-11-15: подробно)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(проверено 2026-11-15: подробно)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(проверено 2026-11-15: подробно)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(проверено 2026-11-15: подробно)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(проверено 2026-11-15: подробно)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(проверено 2026-11-15: подробно)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(проверено 2026-11-15: подробно)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(проверено 2026-11-15: подробно)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(проверено 2026-11-15: подробно)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(проверено 2026-11-15: подробно)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(проверено 2026-11-15: подробно)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(проверено 2026-11-15: подробно)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(проверено 2026-11-15: подробно)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(проверено 2026-11-15: подробно)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(проверено 2026-11-15: существование)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(проверено 2026-11-15: существование)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(проверено 2026-11-15: существование)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(проверено 2026-11-15: существование)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(проверено 2026-11-15: подробно)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(проверено 2026-11-15: подробно)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(проверено 2026-11-15: подробно)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(проверено 2026-11-15: подробно)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(проверено 2026-11-15: подробно)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(проверено 2026-11-15: подробно)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(проверено 2026-11-15: подробно)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(проверено 2026-11-15: подробно)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(проверено 2026-11-15: существование)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(проверено 2026-11-15: подробно)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(проверено 2026-11-15: подробно)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(проверено 2026-11-15: подробно)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(проверено 2026-11-15: подробно)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(проверено 2026-11-15: существование)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(проверено 2026-11-15: подробно)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(проверено 2026-11-15: существование)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(проверено 2026-11-15: подробно)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(проверено 2026-11-15: подробно)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(проверено 2026-11-15: подробно)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(проверено 2026-11-15: подробно)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(проверено 2026-11-15: существование)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(проверено 2026-11-15: подробно)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(проверено 2026-11-15: подробно)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(проверено 2026-11-15: подробно)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(проверено 2026-11-15: подробно)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(проверено 2026-11-15: подробно)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(проверено 2026-11-15: подробно)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(проверено 2026-11-15: подробно)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(проверено 2026-11-15: подробно)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(проверено 2026-11-15: подробно)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(проверено 2026-11-15: подробно)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(проверено 2026-11-15: подробно)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(проверено 2026-11-15: существование)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(проверено 2026-11-15: подробно)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(проверено 2026-11-15: подробно)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(проверено 2026-11-15: подробно)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(проверено 2026-11-15: подробно)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(проверено 2026-11-15: подробно)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(проверено 2026-11-15: подробно)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(проверено 2026-11-15: подробно)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(проверено 2026-11-15: подробно)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(проверено 2026-11-15: подробно)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(проверено 2026-11-15: подробно)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(проверено 2026-11-15: подробно)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(проверено 2026-11-15: подробно)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(проверено 2026-11-15: подробно)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(проверено 2026-11-15: подробно)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(проверено 2026-11-15: подробно)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(проверено 2026-11-15: подробно)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(проверено 2026-11-15: подробно)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(проверено 2026-11-15: подробно)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(проверено 2026-11-15: подробно)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(проверено 2026-11-15: подробно)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(проверено 2026-11-15: существование)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(проверено 2026-11-15: подробно)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(общественное достояние)* *(проверено 2026-11-15: существование)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(проверено 2026-11-15: подробно)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(проверено 2026-11-15: подробно)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(проверено 2026-11-15: подробно)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(проверено 2026-11-15: подробно)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(проверено 2026-11-15: подробно)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(проверено 2026-11-15: подробно)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(проверено 2026-11-15: подробно)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(проверено 2026-11-15: подробно)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(проверено 2026-11-15: существование)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(проверено 2026-11-15: подробно)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(проверено 2026-11-15: существование)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(проверено 2026-11-15: существование)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(проверено 2026-11-15: подробно)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(проверено 2026-11-15: существование)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(проверено 2026-11-15: подробно)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(проверено 2026-11-15: подробно)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(проверено 2026-11-15: подробно)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(проверено 2026-11-15: подробно)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(проверено 2026-11-15: подробно)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(проверено 2026-11-15: существование)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(проверено 2026-11-15: подробно)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(проверено 2026-11-15: подробно)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(проверено 2026-11-15: подробно)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(проверено 2026-11-15: подробно)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(общественное достояние)* *(проверено 2026-11-15: подробно)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(проверено 2026-11-15: подробно)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(проверено 2026-11-15: подробно)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(проверено 2026-11-15: подробно)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(проверено 2026-11-15: существование)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(проверено 2026-11-15: подробно)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(проверено 2026-11-15: существование)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(проверено 2026-11-15: существование)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(проверено 2026-11-15: подробно)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(проверено 2026-11-15: подробно)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(проверено 2026-11-15: подробно)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(проверено 2026-11-15: подробно)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(проверено 2026-11-15: подробно)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(проверено 2026-11-15: подробно)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(проверено 2026-11-15: подробно)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(проверено 2026-11-15: подробно)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(проверено 2026-11-15: подробно)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(проверено 2026-11-15: подробно)*

<!-- kb:end -->
