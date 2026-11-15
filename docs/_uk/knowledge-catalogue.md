---
title: "Каталог знань"
parent: "Лінза знань"
nav_order: 2
lang: "uk"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Каталог знань

Це повний список того, що знає [лінза знань](knowledge.md): патерни, яких вона шукає, ідеї, методи, історичні випадки та дослідження, які вона наводить, а також книжки й статті, на яких вони ґрунтуються. Скористайтеся ним, щоб знайти запис за його ідентифікатором або перевірити джерело.

Ця сторінка створюється з бази знань командою `node tools/knowledge-doc.mjs`; не редагуйте текст між позначками.

<!-- kb:begin -->

База знань містить 579 записів (135 понять, 37 методів, 277 історичних випадків, 17 принципів дизайну, 113 досліджень) для 93 патернів, і посилається на 556 джерел.

### Патерни (93) {#patterns-93}

| id | родина | як це виглядає в даних |
|---|---|---|
| `concentration` | сила | Сторона, яка зосереджує більше підрозділів в одному місці, перемагає в ньому з перевагою, більшою за саму їхню кількість. |
| `local-superiority` | сила | Убивства дістаються тій стороні, яка переважає іншу в межах дальності бою, незалежно від загальних сум. |
| `attrition` | сила | Втрати залежать від сил обох сторін з часом; бій вирішує той, хто першим вичерпається. |
| `exchange-ratio` | сила | Кількість убивств на одну втрату суттєво відрізняється залежно від місця, сторони чи класу. |
| `aimed-fire` | сила | Втрати зростають разом із чисельністю ворога, але не разом із власною. |
| `area-fire` | сила | Втрати зростають із добутком чисельностей обох сторін: тіснота карається. |
| `defeat-in-detail` | сила | Сторону знищують по частинах, бо її підрозділи приходять по одному. |
| `mutual-support` | сила | Втрату швидко компенсує сусідній товариш по команді: обміни. |
| `combined-arms` | сила | Класи добре працюють разом, коли кожен прикриває слабкість іншого, і погано поодинці. |
| `class-counter` | сила | Один клас непропорційно добре б'ється з певним іншим класом або в певному місці. |
| `initiative` | сила | Той, хто першим набирає очки в зіткненні, зазвичай його й виграє. |
| `key-terrain` | місцевість | Ті самі кілька місць вирішують бої матч за матчем. |
| `fields-of-fire` | місцевість | Місця, з яких видно далеко над землею, яку мусять перетинати інші, дають більше убивств. |
| `high-ground` | місцевість | Убивства відбуваються зверху над землею, на якій стоять жертви. |
| `cover` | місцевість | Смертей за час менше там, де геометрія закриває видимість і вогонь. |
| `open-ground` | місцевість | Смертей за час більше там, де ніщо не закриває видимість і вогонь. |
| `kill-zone` | місцевість | Смерті зосереджуються там, де рух змушений іти через прострілювану, вогнем прикриту землю. |
| `chokepoint` | місцевість | Багато переходів стискаються через малу ділянку землі, і там гинуть люди. |
| `reverse-slope` | місцевість | Безпека відразу за гребенем чи стіною, поза прямим зором ворога. |
| `safe-ground` | місцевість | Місце, де витрачається час, але гине мало. |
| `obstacle` | місцевість | Маршрути огинають заблоковану землю і зводяться до кількох смуг. |
| `flank` | рух | Рідко використовуваний маршрут приносить більше убивств, ніж головні. |
| `avenue-of-approach` | рух | Рух тече кількома смугами між зонами. |
| `mobility` | рух | Рухомі підрозділи гинуть менше (або більше) за час, ніж повільні чи нерухомі. |
| `static-exposure` | рух | Підрозділи, що стоять на місці, гинуть за час частіше, ніж ті, що рухаються. |
| `interior-lines` | рух | Сторона з короткими маршрутами між своїми боями змінює сили швидше за іншу. |
| `envelopment` | рух | Убивства приходять з кількох напрямків на позицію однієї сторони. |
| `ambush` | рух | Підрозділи, що рухаються маршрутом, швидко гинуть від ворогів, які вже зайняли позицію. |
| `spawn-pressure` | час | Життя закінчується незабаром після початку на одній точці появи. |
| `tempo` | час | Швидша сторона доходить до бою і набирає очки раніше, ніж інша встигає відреагувати. |
| `surprise` | час | Втрати приходять сплеском, раніше ніж жертви відповідають вогнем. |
| `energy-advantage` | повітря | Убивці мають більшу висоту і швидкість, ніж їхні жертви. |
| `air-superiority` | повітря | Літаки однієї сторони вбивають у багато разів більше, ніж втрачають. |
| `sead` | повітря | Наземна протиповітряна оборона забирає багато літаків, поки її не знайдуть і не знищать. |
| `bvr` | повітря | Убивства відбуваються на великій дальності, раніше ніж жертва встигне зблизитися. |
| `fleet-salvo` | море | Сила, яка першою завдає удару, мало втрачає; інша мало виживає, щоб відповісти. |
| `scouting` | море | Сторона, яка першою знаходить іншу, обирає бій. |
| `urban-close` | місто | Короткі дистанції бою, багато смертей серед щільної геометрії, повільне очищення. |
| `vertical` | місто | Убивства з верхніх поверхів чи дахів по вулицях. |
| `skill-dispersion` | люди | Кілька гравців дають велику частку убивств або смертей. |
| `ai-vs-player` | люди | Підрозділи, керовані ШІ, у тому самому місці виходять інакше, ніж гравці. |
| `balance` | дизайн | Сторони, точки появи або класи починають з нерівними шансами. |
| `economy` | дизайн | Ресурси, які заробляють, витрачають і втрачають, зосереджуються в кількох місцях або гравцях. |
| `flow` | дизайн | Як гравці рухаються рівнем: петлі, смуги, тупики. |
| `sightlines` | дизайн | Довгі лінії видимості вирішують, де починаються бої і хто їх виграє. |
| `readability` | дизайн | Смерті, яких гравці не можуть передбачити: ззаду, з-поза поля зору. |
| `formation` | рух | Підрозділи однієї сторони рухаються разом у впізнаваній формі: лінія, колона, клин, ешелон, квадрат. |
| `frontal-assault` | рух | Група зближується з ворогом прямо в обличчя його фронту. |
| `double-envelopment` | рух | Дві групи одночасно б'ють у обидва фланги одного ворожого угруповання. |
| `encirclement` | рух | Ворожа група опиняється з усіх боків в оточенні іншої сторони і з малим числом виходів. |
| `penetration` | рух | Група проходить крізь ворожу лінію там, де вороги стоять з обох її боків. |
| `fire-and-maneuver` | рух | Частина групи рухається, поки решта стоїть і прикриває її, і ролі по черзі міняються. |
| `feint` | рух | Невелика група відтягує ворога в одне місце; головний удар пролунає в іншому незабаром після цього. |
| `withdrawal` | рух | Група в контакті розвертається і збільшує відстань до ворога. |
| `pursuit` | рух | Група переслідує ворога, що відходить, зберігаючи або скорочуючи відстань. |
| `defence-in-depth` | місцевість | Захисники стоять кількома смугами одна за одною вздовж осі наступу ворога. |
| `screening` | рух | Невеликий елемент рухається далеко попереду свого основного підрозділу і першим зустрічає ворога. |
| `dispersion` | сила | Сторона з часом розосереджується; менше її підрозділів діють в одному місці. |
| `missile-defence` | повітря | Літаки під загрозою ракет повертають загрозу боком або хвостом: crank, notch, drag, pump. |
| `angles-fight` | повітря | Ближній повітряний бій на малій швидкості й великій швидкості повороту, який ведеться за положенням носа, а не за енергією. |
| `cap` | повітря | Літаки кружляють над фіксованою точкою хвилинами, чекаючи, поки прийде ворог. |
| `strike-package` | повітря | Літаки різних ролей летять разом до цілі; одні атакують землю, інші їх прикривають. |
| `line-of-battle` | море | Кораблі йдуть колоною один за одним, щоб усі борти могли вести вогонь. |
| `crossing-the-t` | море | Колона перетинає голову ворожої колони: увесь її вогонь працює, а ворожий майже ні. |
| `fatal-funnel` | місто | Гравці, що заходять в один прохід, кімнату чи вузьке місце, гинуть там за лічені миті значно частіше, ніж ті, що заходять деінде. |
| `crossfire` | сила | Засідки, чиї лінії вогню сходяться з різних кутів, перемагають у більшій кількості дуелів, ніж одна засідка. |
| `peeker-advantage` | час | Гравець, що виходить у поле зору, виграє дуелі з тим, хто тримає кут, частіше (або рідше), ніж у половині випадків. |
| `entry` | час | Перше убивство раунду вирішує значну його частину; входи виграють або програють залежно від місця і підтримки. |
| `utility-support` | сила | Спалах чи димова завіса прямо перед дуеллю змінює того, хто її виграє. |
| `man-advantage` | сила | Раунди виграє сторона з більшою кількістю живих гравців, і деякі команди перетворюють або марнують перевагу. |
| `clutch` | люди | Останні живі гравці виграють частіше (або рідше), ніж передбачає стан раунду. |
| `action-value` | люди | Убивства, обміни, закладання й утиліти різняться тим, наскільки змінюють шанс на перемогу. |
| `lurk` | рух | Гравець, який сам далеко від команди, убиває (або гине) з іншою частотою, ніж зграя. |
| `rotation` | рух | Те, як швидко сторона перекидає гравців до бою чи до цілі, вирішує, чи вона втримає позицію, чи відіб'є її. |
| `collective-order` | люди | Рухомі підрозділи однієї сторони рухаються в один бік набагато частіше, ніж це дали б їхні власні траєкторії, зсунуті в часі, за випадком. |
| `milling` | люди | Підрозділи сторони кружляють навколо спільного центру: обертання без чистого переміщення. |
| `herding` | люди | Підрозділи покидають місце так само, як товариш перед ними, поза власними шансами цього місця і поза копіюванням ворога. |
| `lane-formation` | люди | Зустрічні потоки тримаються окремих смуг; рух концентрується на кількох стежках, які повторно використовуються матч за матчем. |
| `crowding` | люди | Швидкість і потік падають, коли підрозділи збиваються в купу; через вузьке місце сильніший натиск пропускає менше. |
| `leadership` | люди | Одні підрозділи повертають першими, а інші копіюють їхній напрямок за кілька секунд. |
| `cohesion` | люди | Підрозділи, що відбиваються від своєї групи, гинуть частіше за тих, хто тримається разом з нею. |
| `breaking-point` | люди | Сторона, що втратила певну частку сил, перестає зближуватися і відступає, поза тим, що пояснює її відстань до ворога. |
| `panic` | люди | Під раптовою загрозою підрозділи розлітаються, тікають або завмирають, і координація розвалюється. |
| `loss-chasing` | люди | Після втрати підрозділи беруть більше (або менше) ризику, ніж після виграшу. |
| `hot-hand` | люди | Успіх частіше тягне за собою успіх, ніж дозволяють перетасовані послідовності того самого гравця. |
| `conformity` | люди | Члени сторони обирають однаково - покупки, спорядження, маршрути - поза власними вподобаннями. |
| `suppression` | люди | Вогонь, що летить у бік, змінює те, як підрозділи рухаються і стріляють, навіть коли не вбиває. |
| `social-loafing` | люди | На одного учасника припадає менше дії, коли товаришів більше. |
| `mixed-strategy` | люди | Вибори, які мали б бути непередбачуваними, стають закономірними: один варіант виграє частіше, або вибори йдуть послідовностями. |
| `coordination` | люди | Члени діють у лад без видимих наказів: синхронний рух, час і вибори. |
| `contagion` | люди | Стан переходить від підрозділу до підрозділу через дотик або близькість і поширюється картою. |
| `territoriality` | люди | Підрозділи тримають дистанцію один від одного і стоять на своїй землі. |
| `interaction-network` | люди | Хто з ким б'ється, підтримує і йде слідом, утворює мережу з вузлами, групами та мостами. |

### Поняття (135) {#concepts-135}

| id | назва | лінзи | патерни | джерела |
|---|---|---|---|---|
| `concept.lanchester-square` | Квадратичний закон Ланчестера (прицільний вогонь) | військова, повітря, флот, кіберспорт | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Лінійний закон Ланчестера (площинний вогонь, один на один) | військова, місто, кіберспорт | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Зосередження сил (маса) | військова, повітря, флот, кіберспорт | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Співвідношення сил і правило 3:1 | військова | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Коефіцієнт обміну втратами | військова, повітря, кіберспорт, дизайн | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Бойова сила та її множники | військова | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Сучасна система застосування сил | військова | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Цикл OODA (спостерігати-орієнтуватися-вирішувати-діяти) | військова, повітря, кіберспорт | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Теорія енергії та маневреності | повітря | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Базові повітряні маневри та повітряне маневрування в бою | повітря | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Аналіз місцевості: OAKOC / KOCOA | військова, дизайн, місто | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: змінні місії | військова | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Ключова та вирішальна місцевість | військова, дизайн, кіберспорт | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Спостереження і сектори вогню | військова, дизайн, кіберспорт, місто | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Укриття і маскування | військова, місто, дизайн | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Напрямки підходу і коридори руху | військова, дизайн | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Вузькі місця і ущелини | військова, дизайн, кіберспорт | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Зони бою і зони ураження | військова, місто, дизайн | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Оборона на зворотному схилі та укриття в складці місцевості | військова, дизайн | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Висота | військова, дизайн | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Внутрішні та зовнішні лінії | військова | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Розгром по частинах | військова, кіберспорт | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Взаємна підтримка | військова, повітря, кіберспорт | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Спільні види зброї | військова, дизайн | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Придушення | військова, місто | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Придушення та знищення ворожої протиповітряної оборони (SEAD/DEAD) | повітря, військова | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Бойове повітряне патрулювання і панування в повітрі | повітря | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Бій за межами видимості | повітря | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Непрямий підхід | військова, кіберспорт, дизайн | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Охоплення та оточення | військова | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Засідка | військова, кіберспорт, дизайн | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Глибоко ешелонована оборона | військова | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Тертя і туман війни | військова, кіберспорт | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Точка найвищої напруги атаки | військова | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Несподіванка | військова, повітря, флот, кіберспорт | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Економія сил | військова, кіберспорт | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Міська місцевість | місто, військова, кіберспорт | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Контроль моря і вирішальна флотська битва | флот | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Модель залпів Г'юза: діяти ефективно першим | флот, повітря | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Теорія пошуку і виявлення | флот, повітря, військова | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Дослідження операцій: показники ефективності | військова, повітря, флот, дизайн | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Воєнні ігри як аналіз | військова, дизайн | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Маневрена війна | військова, кіберспорт | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Згуртованість і моральний чинник | військова | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Центр ваги | військова | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Вирішальні точки | військова, кіберспорт | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Лінії операцій | військова | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Стратегії знищення та виснаження | військова | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Глибокий бій і глибокі операції | військова | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | військова, повітря | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Командування через завдання (Auftragstaktik) | військова, кіберспорт | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Прорив і розвиток успіху | військова | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Вогонь і рух | військова, кіберспорт | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Перебіжки з прикриттям | військова, кіберспорт | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Витягування на розвідку і проникнення | військова, кіберспорт | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Резерв | військова, кіберспорт | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Гнучка оборона та контратака | військова | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Ланцюг ураження (знайти, зафіксувати, відстежити, цілеуказати, уразити, оцінити) | військова, повітря, флот | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Дальність виявлення проти дальності бою | повітря, флот, військова | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Показник бойової ефективності | військова, кіберспорт | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Розосередження на полі бою | військова, кіберспорт | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Авіаційна підтримка в ближньому бою | повітря, військова | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Авіаційна інтердикція | повітря, військова | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Супровід проти розвідувального пошуку винищувачів | повітря | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Бій на енергії проти бою на віражах | повітря | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Випереджальне, чисте і відставане переслідування | повітря | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Ухиляння Тача | повітря | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Ланка «палець-чотири» і бойова пара | повітря | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Флот у готовності | флот | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Перетин «Т» | флот, військова | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Конвой | флот | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Заперечення доступу та заборона району | флот, повітря, військова | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Оборона опорного пункту в забудові | місто, військова | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Прохід крізь будинки від отвору до отвору | місто, військова, дизайн | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Облога | військова, місто | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Партизанська війна | військова, місто | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Контрповстанська діяльність | військова, місто | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Сховище | військова, дизайн | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Оманна діяльність (маскіровка) | військова, кіберспорт | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Перевага в інформації | військова, кіберспорт | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Раунди економіки та темп ресурсів | кіберспорт, дизайн | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Бойові порядки руху: лінія, колона, клин, ешелон | військова, кіберспорт | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Фронтальна атака | військова | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Подвійне охоплення (кліщі) | військова | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Оточення та котел | військова | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Пробиття і прорив | військова | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Переслідування | військова | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Відхід: відступ, затримка і відхід | військова | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Відволікаючий удар і демонстрація | військова, кіберспорт | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Завіса, охорона і прикриття: захист попереду основних сил | військова | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Захист від ракети: crank, notch, drag і pump | повітря | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Порядки для бою за межами видимості: стіна, ведучий-ведений, молотарка, кліщі | повітря | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Бій за положенням носа і бій на енергії | повітря | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Ударний пакет і послідовність придушення | повітря | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Бойова лінія | флот | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Смертельна воронка | місто, військова, кіберспорт, дизайн | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Зачистка кімнат: несподіванка, швидкість, контрольоване насильство | місто, військова, кіберспорт | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Точки панування | місто, військова, кіберспорт | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Зачистка кутів: «нарізання піцци» | місто, військова, кіберспорт | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Перехресний вогонь і взаємоперекриваючі сектори | військова, місто, кіберспорт, дизайн | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Перевага того, хто виглядає | кіберспорт, дизайн | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Перевага в людях у раундах на вибування | кіберспорт, військова | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Вхід і перший дуель | кіберспорт, місто | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Утиліта перед входом: спалах і дим | кіберспорт, місто, військова | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Модель соціальних сил руху пішоходів | дизайн, місто, військова | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Утворення смуг у зустрічному потоці | дизайн, місто | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Швидше - значить повільніше | дизайн, місто, військова | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Фундаментальна діаграма натовпів | дизайн, місто | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Утворення стежок і бажані лінії руху | дизайн, військова | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Паніка трапляється рідко: колективна стійкість | військова, місто, дизайн | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: відокремлення, вирівнювання, згуртованість | дизайн, військова | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Параметр порядку і початок колективного руху | дизайн, військова, повітря, флот | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Рій, кружляння та поляризовані стани | дизайн, військова, флот | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Ефективне лідерство без сигналів | військова, кіберспорт, дизайн | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Сусіди за кількістю, а не за відстанню | повітря, військова | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Інтелект рою | дизайн, кіберспорт, військова | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Стадність і каскади інформації | кіберспорт, дизайн, військова | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Соціальне ледарювання | кіберспорт, дизайн, військова | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Розмивання відповідальності | кіберспорт, військова | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Згуртованість первинного колективу | військова, кіберспорт | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Точки зламу та пороги втрат | військова | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Придушення: що вогонь робить, крім убивства | військова, місто | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Страх і стрес у бойових рішеннях | військова, кіберспорт | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Зрив під тиском | кіберспорт | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Теорія перспектив і неприйняття втрат | кіберспорт, дизайн | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Ефекти точки беззбитковості та «чужих грошей» | кіберспорт | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Тилт (зрив через гнів) | кіберспорт | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Витрачені втрати (sunk cost) | кіберспорт, військова | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | «Гаряча рука» і помилка на її основі | кіберспорт | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Змішані стратегії: бути непередбачуваним | кіберспорт, дизайн, військова | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Спільні ментальні моделі | кіберспорт, військова | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Складові командної роботи | кіберспорт, військова | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Віртуальні світи як лабораторії поведінки | дизайн, кіберспорт | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Особистий простір і територія | дизайн, місто | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Мережі взаємодії: хаби і слабкі зв'язки | кіберспорт, дизайн | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Методи (37) {#methods-37}

| id | назва | патерни | джерела |
|---|---|---|---|
| `method.lanchester-fit` | Підгонка показників Ланчестера до даних бою | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Коефіцієнт обміну за стороною і за місцем | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Локальне співвідношення сил у момент кожного убивства | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Зона видимості: лінії зору і сектори вогню | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Питома енергія під час убивств і смертей (повітря) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Стійкість гарячих точок між матчами | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Частота обмінів (взаємна підтримка) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Зіткнення та перевага першого убивства | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Просторова автокореляція смертей (I Морана) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Частоти відносно власної бази карти з контролем FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Розвідувальна підготовка поля бою (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Моделі рейтингу парних порівнянь (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Імовірність перемоги та оцінка дій | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Контроль простору та контроль поля | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Рівняння залпу, підігнане під кораблі в зіткненні | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Коефіцієнт бойової ефективності на одиницю часу в бою | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Дальність від виявлення до бою і дальності бою | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Таймінг ланцюга ураження | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Розосередження проти частки убивств (зосередження сил у часі) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Частота втрат і убивств за виліт | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Модель імовірності перемоги в раунді | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Оцінка дії: додана імовірність перемоги | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Скоригований плюс-мінус методом гребеневої регресії (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Усадка: емпіричний баєс | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Очікувані результати: від очікуваних голів до очікуваних дуелей | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Вимірювання позицій, ротацій і засідок | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Проблема відображення: копіювання чи спільна причина | herding, conformity | Manski 1993 |
| `method.streak-correction` | Серії з поправкою на скінченну послідовність | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Параметри порядку для поляризації та кружляння | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Лідери за кореляцією напрямку з затримкою в часі | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Тест каскаду маршрутів на стадність | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Розділення смуг і стійкість стежок | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Ризик для відсталих | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Крива зламу | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Реакція на вогонь, що летить у бік | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Ризик після програшу чи виграшу | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Узгодженість закупівель (каппа Флісса) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Історичні випадки (277) {#historical-cases-277}

| id | випадок | коли | масштаб | патерни | джерела |
|---|---|---|---|---|---|
| `case.thermopylae` | Фермопіли | 480 до н. е. | бій | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Саламін | 480 до н. е. | бій | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Марафон | 490 до н. е. | бій | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Левктри | 371 до н. е. | бій | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Гавгамели | 331 до н. е. | бій | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Трасименське озеро | 217 до н. е. | бій | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Канни | 216 до н. е. | бій | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Тевтобурзький ліс | 9 н. е. | бій | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Гастінгс | 1066 | бій | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Стірлінг-брідж | 1297 | бій | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Азенкур | 1415 | бій | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Лойтен | 1757 | бій | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Аустерліц | 1805 | бій | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Трафальгар | 1805 | бій | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Ватерлоо | 1815 | бій | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Фредериксберг: Мейрі-Гайтс | 1862 | зіткнення | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Геттісберг: Літл-Раунд-Топ | 1863 | зіткнення | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Геттісберг: атака Пікетта | 1863 | зіткнення | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Ісандлвана | 1879 | бій | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Рорк-Дрифт | 1879 | зіткнення | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Танненберг | 1914 | кампанія | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Сомма, перший день | 1 липня 1916 | бій | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Верден | 1916 | кампанія | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Ютландія | 1916 | бій | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Суомуссалмі | 1939-1940 | бій | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Седан і Арденни | травень 1940 | кампанія | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Контратака під Аррасом | 21 травня 1940 | зіткнення | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Битва за Британію | лип.-жовт. 1940 | кампанія | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Битва за Атлантику: дослідження операцій конвоїв | 1939-1945 | кампанія | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Мідвей | червень 1942 | бій | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Друга битва при Ель-Аламейні | жовт.-лист. 1942 | бій | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Перевал Кассерін | лютий 1943 | бій | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Сталінград | серп. 1942-лют. 1943 | кампанія | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Курськ | липень 1943 | кампанія | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Прохорівка | 12 липня 1943 | зіткнення | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Вільє-Бокаж | 13 червня 1944 | зіткнення | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Живоплотні Нормандії | червень-липень 1944 | кампанія | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Операція «Кобра» | липень 1944 | кампанія | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Лейтська затока | жовт. 1944 | бій | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Бастонь | груд. 1944 | бій | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Цусіма | травень 1905 | бій | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Інчхон | верес. 1950 | кампанія | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | «Алея МіГів» | 1950-1953 | кампанія | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Дьєнб'єнфу | 1954 | бій | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Я-Дранг: зона посадки X-Ray | листоп. 1965 | зіткнення | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Операція «Боло» | 2 січня 1967 | зіткнення | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Голан: Долина сліз | жовт. 1973 | бій | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Синай: Китайська ферма | жовт. 1973 | бій | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Долина Бекаа (операція «Мідяча цвіркунка 19») | червень 1982 | бій | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Повітряна війна за Фолклендські острови | трав.-черв. 1982 | кампанія | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Повітряна кампанія «Буря в пустелі» | січ.-лют. 1991 | кампанія | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Істинг | 26 лютого 1991 | зіткнення | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Могадишо | жовт. 1993 | зіткнення | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Грозний | груд. 1994-лют. 1995 | бій | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Хюе | січ.-бер. 1968 | бій | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Повітряна кампанія в Косові | бер.-черв. 1999 | кампанія | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Фаллуджа (операція «Світанок») | листоп. 2004 | бій | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Мосул | 2016-2017 | кампанія | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Кадеш | бл. 1274 до н. е. | бій | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Іс | 333 до н. е. | бій | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Зама | 202 до н. е. | бій | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Карри | 53 до н. е. | бій | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Фарсал | 48 до н. е. | бій | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Адріанополь | 378 н. е. | бій | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Ярмук | 636 н. е. | бій | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Манцикерт | 1071 | бій | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Хаттін | 1187 | бій | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Беннокберн | 1314 | бій | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Креси | 1346 | бій | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Пуатьє | 1356 | бій | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Грюнвальд (Танненберг) | 1410 | бій | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Брайтенфельд | 1631 | бій | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Блінгейм | 1704 | бій | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Полтава | 1709 | бій | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Росбах | 1757 | бій | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Саратога | 1777 | кампанія | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Йорктаун | 1781 | бій | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Єна-Ауерштедт | 1806 | бій | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Бородіно | 1812 | бій | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Лейпциг | 1813 | бій | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Антіетам | 1862 | бій | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Шанселорсвілл | 1863 | бій | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Віксбург | 1863 | кампанія | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Кенінгрец (Садова) | 1866 | бій | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Седан | 1870 | бій | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Мукден | 1905 | бій | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Омдурман | 1898 | бій | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Спайон-Коп | 1900 | зіткнення | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Галліполі | 1915 | кампанія | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Камбре | листоп. 1917 | бій | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Капоретто | жовт.-листоп. 1917 | кампанія | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Німецький весняний наступ (операція «Міхаель») | бер.-квіт. 1918 | кампанія | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Амьєн | серп. 1918 | бій | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Халхін-Гол (Номонхан) | серп. 1939 | бій | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Польська кампанія | верес. 1939 | кампанія | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Ганют і Жамблу | травень 1940 | бій | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Стон | травень 1940 | зіткнення | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Периметр Дюнкерка | трав.-черв. 1940 | кампанія | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Операція «Компас» і Беда-Фомм | груд. 1940-лют. 1941 | кампанія | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Операція «Хрестоносець» і Сіді-Рецег | листоп.-груд. 1941 | кампанія | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Газала | трав.-черв. 1942 | бій | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Алам-Хальфа | серп.-верес. 1942 | бій | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Дубно-Броди | червень 1941 | бій | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Оточення Києва | верес. 1941 | кампанія | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Москва | жовт. 1941-січ. 1942 | кампанія | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ржев і операція «Марс» | 1942 | кампанія | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Другий Харків | травень 1942 | бій | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Третій Харків (удар Манштейна з відходу) | лют.-бер. 1943 | кампанія | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Операція «Багратіон» | черв.-серп. 1944 | кампанія | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Корсунь-Шевченківський котел | січ.-лют. 1944 | бій | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Кам'янець-Подільський котел | бер.-квіт. 1944 | кампанія | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Операція «Епсом» | червень 1944 | бій | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Операція «Гудвуд» | липень 1944 | бій | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Операція «Тоталайз» | серп. 1944 | бій | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Мортен | серп. 1944 | бій | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Котел під Фалезом | серп. 1944 | кампанія | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | «Маркет-Гарден» і Арнем | верес. 1944 | кампанія | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Аахен | жовт. 1944 | бій | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Гюртгенський ліс | верес. 1944-лют. 1945 | кампанія | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Араку | верес. 1944 | бій | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Сент-Віт | груд. 1944 | бій | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Ельзенборнський хребет | груд. 1944 | бій | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Зеловські висоти | квіт. 1945 | бій | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Берлін | квіт.-трав. 1945 | бій | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Операція «Весняне пробудження» | бер. 1945 | бій | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ортона | груд. 1943 | бій | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Варшавське повстання | серп.-жовт. 1944 | кампанія | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Тарава | листоп. 1943 | бій | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Пеліліу | верес.-листоп. 1944 | бій | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Іводзіма | лют.-бер. 1945 | бій | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Окінава | квіт.-черв. 1945 | кампанія | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Маніла | лют.-бер. 1945 | бій | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Маньчжурія («Серпневий шторм») | серп. 1945 | кампанія | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Пусанський периметр | серп.-верес. 1950 | кампанія | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Чосинське водосховище | листоп.-груд. 1950 | кампанія | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Імджин | квіт. 1951 | бій | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Капьон | квіт. 1951 | бій | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Пог-Чоп-хілл | квіт. і липень 1953 | зіткнення | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Кхешань | січ.-квіт. 1968 | бій | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Дак-Тхо | листоп. 1967 | бій | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Гамбургер-хілл (гора Ап Бі) | трав. 1969 | зіткнення | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Абу-Агейла - Ум-Катеф | черв. 1967 | бій | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ісмаїлія | жовт. 1973 | бій | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Султан-Якуб | черв. 1982 | зіткнення | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Облога Бейрута | черв.-серп. 1982 | кампанія | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Ліван 2006: Бінт-Джбейль і загроза протитанкових засобів | липень-серп. 2006 | кампанія | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Ель-Фау | лют. 1986 | бій | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Басра (Кербела-5) | січ.-лют. 1987 | бій | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Хафджі | січ.-лют. 1991 | бій | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Ціль «Норфолк» | 26-27 лютого 1991 | бій | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Медінський хребет | 27 лютого 1991 | бій | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Відволікаючі дії в ваді аль-Батін | лют. 1991 | кампанія | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Насірія | бер. 2003 | бій | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Ціль «Персик» | квіт. 2003 | зіткнення | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Рейди «Грім» | квіт. 2003 | бій | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Перевал Дебецька | квіт. 2003 | зіткнення | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Рамаді | 2006-2007 | кампанія | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Садр-Сіті | бер.-трав. 2008 | бій | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Операція «Анаконда» | бер. 2002 | бій | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Ванат | липень 2008 | зіткнення | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Камдеш (блокпост Кітінг) | жовт. 2009 | зіткнення | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Муса-Кала і взводні форти | 2006-2007 | кампанія | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Алжирська битва | 1956-1957 | кампанія | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Родезійська вогнева група | 1974-1979 | кампанія | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Облога Сараєва | 1992-1996 | кампанія | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Грозний 1999-2000 | груд. 1999-лют. 2000 | бій | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Російсько-грузинська війна | серп. 2008 | кампанія | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Зеленопілля | липень 2014 | зіткнення | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Іловайськ | серп. 2014 | бій | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Дебальцеве | січ.-лют. 2015 | бій | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Донецький аеропорт | верес. 2014-січ. 2015 | бій | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Гостомельський аеропорт | лют. 2022 | зіткнення | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Київський напрямок і засідка під Броварами | бер. 2022 | зіткнення | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Маріуполь і «Азовсталь» | лют.-трав. 2022 | бій | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Харківський контрнаступ | верес. 2022 | кампанія | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Переправа через Сіверський Донець біля Білогорівки | трав. 2022 | зіткнення | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Бахмут | серп. 2022-трав. 2023 | бій | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Запорізький наступ | черв.-листоп. 2023 | кампанія | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Війна за Нагірний Карабах | верес.-листоп. 2020 | кампанія | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Бліц | верес. 1940-трав. 1941 | кампанія | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | «Барбаросса»: перший день у повітрі | 22 червня 1941 | бій | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Крит | трав. 1941 | бій | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Облога Мальти | 1940-1942 | кампанія | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Повітряний міст до Сталінграда | листоп. 1942-лют. 1943 | кампанія | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Повітряні бої над Кубанню | квіт.-черв. 1943 | кампанія | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Курськ у повітрі | липень 1943 | бій | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Операція «Багратіон» у повітрі | черв.-серп. 1944 | кампанія | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Плоєшті (операція «Велика хвиля») | 1 серпня 1943 | зіткнення | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Рейд на греблі (операція «Покарання») | 16-17 травня 1943 | зіткнення | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Гамбург (операція «Гоморра») | липень-серп. 1943 | бій | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Швайнфурт - Регенсбург | 17 серпня 1943 | бій | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Другий Швайнфурт («Чорний четвер») | 14 жовтня 1943 | зіткнення | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Великий тиждень (операція «Аргумент») | лют. 1944 | кампанія | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Рейд на Нюрнберг | 30-31 березня 1944 | зіткнення | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Операція «Боденплатте» | 1 січня 1945 | бій | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Битва в Бісмарковому морі | бер. 1943 | бій | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Нейтралізація Рабаула | 1943-1944 | кампанія | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Філіппінське море («Розстріл індиків на Маріанах») | черв. 1944 | бій | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | «Чорний вівторок» над Намсі | 23 жовтня 1951 | зіткнення | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Операція «Rolling Thunder» | 1965-1968 | кампанія | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Міст Тханьхоа | 1965-1972 | зіткнення | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | «Дикі ласки» | 1965-1973 | кампанія | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Звіт Олта і «Top Gun» | 1968-1972 | кампанія | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Операція «Linebacker» | трав.-жовт. 1972 | кампанія | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | «Linebacker II» («одинадцятиденна війна») | груд. 1972 | кампанія | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Операція «Фокус» (Мокед) | 5 червня 1967 | бій | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Війна на виснаження: пояс ракет | 1969-1970 | кампанія | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Парасолька ЗРК над каналом | жовт. 1973 | бій | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (операція «Опера») | 7 червня 1981 | зіткнення | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Операція «Ель-Дорадо-Кеньйон» | 15 квітня 1986 | зіткнення | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Повітряна війна Ірану та Іраку | 1980-1988 | кампанія | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Рейди «Блек-Бак» | трав.-черв. 1982 | зіткнення | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | «Миттєвий грім»: планування повітряної кампанії в затоці | серп. 1990-січ. 1991 | кампанія | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Оперативна група «Нормандія»: перший удар «Апачів» | 17 січня 1991 | зіткнення | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Велике полювання на «Скадів» | січ.-лют. 1991 | кампанія | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Пагорб Мутла («Дорога смерті») | 26-27 лютого 1991 | зіткнення | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Операція «Анаконда»: «Апачі» в Шахі-Коті | бер. 2002 | бій | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Атака «Апачів» під Кербелою | 24 березня 2003 | зіткнення | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Повітряна кампанія над Лівією | бер.-жовт. 2011 | кампанія | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Нагірний Карабах: дрони і ППО | верес.-листоп. 2020 | кампанія | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Україна: спірне небо | 2022 | кампанія | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Гостомельський аеропорт | лют. 2022 | зіткнення | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Лам Шон 719 | лют.-бер. 1971 | кампанія | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Операція «Орлина кігтя» | квіт. 1980 | зіткнення | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Афганістан: «Стінгер» | 1986-1989 | кампанія | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Лепанто | 1571 | бій | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Непереможна армада | 1588 | кампанія | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Затока Киберон | 1759 | бій | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Чесапікська затока (Вірджинські миси) | 1781 | бій | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Ніл (затока Абукір) | 1798 | бій | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Копенгаген | 1801 | бій | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Гемптон-Роудс | бер. 1862 | зіткнення | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Ліса | 1866 | бій | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Ялу | 1894 | бій | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Манільська затока | 1898 | бій | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Гельголандська бухта | серп. 1914 | бій | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Коронель і Фолклендські острови | листоп.-груд. 1914 | кампанія | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Доґґер-Банк | січ. 1915 | бій | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Ла-Плата | груд. 1939 | бій | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Таранто | листоп. 1940 | зіткнення | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Мис Матапан | бер. 1941 | бій | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Датська протока і потоплення «Бісмарка» | трав. 1941 | кампанія | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Перл-Гарбор | 7 грудня 1941 | зіткнення | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | «Принц Веллський» і «Репалс» | 10 грудня 1941 | зіткнення | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Яванське море | лют. 1942 | бій | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Коралове море | травень 1942 | бій | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Острів Саво | серп. 1942 | бій | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Східні Соломонові острови | серп. 1942 | бій | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Мис Есперанс | жовт. 1942 | бій | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Острови Санта-Крус | жовт. 1942 | бій | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Морська битва за Гуадалканал | 12-15 листопада 1942 | бій | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Тассафаронга | листоп. 1942 | зіткнення | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Прорив через Ла-Манш | лют. 1942 | зіткнення | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Операція «Педестал» | серп. 1942 | бій | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Чорний травень | травень 1943 | кампанія | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Північний Мис | груд. 1943 | бій | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Підводна кампанія США проти Японії | 1941-1945 | кампанія | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Біля Самару | 25 жовтня 1944 | бій | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Протока Сурігао | 25 жовтня 1944 | бій | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Окінава: кампанія камікадзе | квіт.-черв. 1945 | кампанія | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Потоплення «Ейлата» | жовт. 1967 | зіткнення | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Латакія | жовт. 1973 | бій | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Потоплення крейсера «Генерал Бельграно» | 2 травня 1982 | зіткнення | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Втрата HMS «Шеффілд» | 4 травня 1982 | зіткнення | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS «Старк» | 17 травня 1987 | зіткнення | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Операція «Молячий богомол» | 18 квітня 1988 | бій | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | серп. 2004 | зіткнення | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Революція Bisu | бер. 2007 | бій | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | «Dream Coil» на The International 2013 | серп. 2013 | зіткнення | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Zed Faker проти Ryu | верес. 2013 | зіткнення | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Буст на естакаді | листоп. 2014 | зіткнення | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Стрибок з AWP на Mirage | квіт. 2016 | зіткнення | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis і епоха утиліт | 2018 | кампанія | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five проти OG | квіт. 2019 | бій | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar досягає рівня гросмейстера | 2019 | кампанія | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Лівий гак (наступ сухопутних військ в операції «Буря в пустелі») | 24-28 лютого 1991 | кампанія | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Інцидент «Corrupted Blood» | верес. 2005 | кампанія | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Дизайн ігор і рівнів (17) {#game-and-level-design-17}

| id | назва | патерни | джерела |
|---|---|---|---|
| `design.chokepoint` | Вузькі місця в дизайні рівнів | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Фланкувальні маршрути та альтернативні шляхи | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Лінії видимості та дистанція бою | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Розміщення укриттів і їхній ритм | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Дизайн точок появи та захист від появи | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Баланс симетричних і асиметричних карт | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Баланс класів і контри | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Потік, петлі та зрозумілі розкладки | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Економіки ігор і петлі зворотного зв'язку | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Підбір гравців і розкид навичок | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | ШІ-суперники як зонди рівня | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Змістовна гра і вибір | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Обміни та командна гра в шутерах | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Контроль карти | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Теплові карти і просторова телеметрія в дизайні | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Майстерність, навчання і задоволення | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Економіка раундів і рішення про закупівлі | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Дослідження (113) {#studies-113}

| id | назва | джерела |
|---|---|---|
| `study.engel-1954` | Engel: квадратичний закон Ланчестера на Іводзімі | Engel 1954 |
| `study.bracken-1995` | Bracken: моделі Ланчестера для Арденн | Bracken 1995 |
| `study.fricker-1998` | Fricker: моделі виснаження в Арденнах, переглянуті | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas і Turkes: Курськ і Арденни | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley і Helmbold: перевірка квадратичного закону | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-аналіз смертей гравців | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: візуалізація змагальної поведінки | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Оцінка дій у Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Виявлення зіткнень у кіберспорті | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: повітряний бій над В'єтнамом | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: кількісна оцінка історичних битв | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: застосування сил пояснює результати | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Огляд візуалізації даних ігрового процесу | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Ланчестер проти трьох століть сухопутних битв | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: шістдесят зіткнень Другої світової | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: бойові моделі та громадянська війна в США | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: статистична модель даних про втрати | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: темпи просування в сухопутному бою | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas і Dinges: обставини важать більше за закон | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | База даних «Курськ» | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | База даних кампанії в Арденнах | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson і MacKay: Битва за Британію як дані Ланчестера | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte і Schmidt: кількість досі вирішує битви | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: закономірності втрат у битвах | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Тактична чисельна детермінована модель Dupuy | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: війна в цифрах | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: бойова потужність | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter і Stam: демократії на війні | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: адаптивна динамічна модель | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Ланчестер і партизанська війна | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: стохастична модель залпів | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: наріжні камені флотської тактики | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Дискусія про правило 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: моделювання збройних конфліктів | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Звіт Олта: ракети, випущені поза їхньою зоною | Ault 1969; Michel 1997 |
| `study.gwaps` | Огляд повітряної могутності в війні в затоці | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | «Цирк» Блекетта | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Налаштування глибинних бомб у Береговому командуванні | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Білі нижні частини протичовнових літаків | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: броня там, де бомбардувальники, що повернулися, не були поранені | Mangel & Samaniego 1984 |
| `study.optimal-search` | Оптимальний пошук: від підводних човнів до AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: бій у пеклі | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Заперечення доступу та заборона району | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Як гравці втрачають інтерес | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Кластеризація поведінки гравців у природних умовах | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Виявлення розчарування гравців | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: панелі телеметрії у виробництві | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: візуальна аналітика ігрового процесу | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Рух аватарів на полях битв World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: інструментування користувацьких тестів у великому масштабі | Kim et al. 2008 |
| `study.game-data-science` | Наука про дані в іграх | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Штучний інтелект та ігри | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Навички та рух команди в Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Схеми бою, що передбачають перемоги в MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Ролі гравців у Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Передбачення результатів Dota 2 за драфтами | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Прогноз перемоги в реальному часі в професійному кіберспорті | Hodge et al. 2021 |
| `study.rioult-2014` | Топологія позицій гравців | Rioult et al. 2014 |
| `study.bednarek-2017` | Оцінка гравців у командних шутерах | Bednárek et al. 2017 |
| `study.katona-2019` | Передбачення, хто загине наступним | Katona et al. 2019 |
| `study.block-2018` | Історії на основі даних для аудиторії кіберспорту | Block et al. 2018 |
| `study.ggviz` | ggViz: пошук ігрових станів у великому масштабі | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: масштабне навчання з підкріпленням у Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: рівень гросмейстера в StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Очікувана цінність володіння в баскетболі | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: оцінка дій з м'ячем у футболі | Decroos et al. 2019 |
| `study.pitch-control` | Контроль поля і створення простору | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Просторова структура оборонних навичок | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Командні ролі за даними трекінгу | Lucey et al. 2013 |
| `study.shot-quality` | Очікувані голи та якість удару | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: просторова ефективність кидків | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Просторово-часовий аналіз командних видів спорту | Gudmundsson & Horton 2017 |
| `study.ripley-k` | K-функція Ріплі: групування на кожному масштабі | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark і Evans: розосередження за найближчим сусідом | Clark & Evans 1954 |
| `study.getis-ord` | Гарячі точки Гетіса-Орда | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Локальні індикатори просторового зв'язку | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Просторова статистика сканування | Kulldorff 1997 |
| `study.kde` | Оцінка щільності ядром | Silverman 1986 |
| `study.knox-1964` | Просторово-часова взаємодія | Knox 1964; Diggle 2013 |
| `study.maup` | Проблема модифікованої просторової одиниці (MAUP) | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Ізовісти і графи видимості | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Синтаксис простору | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Середня скупченість | Lloyd 1967 |
| `study.survival-analysis` | Аналіз виживання для часу до смерті | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Узагальнені лінійні моделі для підрахунків | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Бутстреп та інтервальні оцінки | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: затримка і перевага того, хто виглядає | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee і Chang: постріл з-за кута | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: затримка і дії гравців | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: професіонали й любителі через імовірність перемоги | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: економічні рішення в Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: розумні убивства і марні смерті | Maymin 2021 |
| `study.moba-live-prediction` | Прогноз результату MOBA в реальному часі | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: раунди Valorant за тактичними ознаками | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: ролі в професійному Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: тренування ближнього бою | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Турбулентність натовпу під час хаджу 2006 року | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Групи пішоходів формують натовпи | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Ієрархічна динаміка груп у зграях голубів | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Соціальний вплив робить успіх нерівним і непередбачуваним | Salganik et al. 2006 |
| `study.wisdom-undermined` | Соціальний вплив підриває мудрість натовпу | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Притягальна сила натовпу | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Конформізм перед одностайною більшістю | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: бойова мотивація в Іраку | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Згуртованість і результативність: мета-аналізи | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Неприйняття втрат серед професійних гольфістів | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | «Гаряча рука» в бейсболі | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Пенальті: професіонали грають мінімакс | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Гра мінімакс на Вімблдоні | Walker & Wooders 2001 |
| `study.collective-intelligence` | Колективний інтелект команд | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Соціальні мережі онлайн-світу | Szell et al. 2010 |
| `study.team-networks` | Мережі передач і результативність команди | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Поведінка поширюється через кластеризовані мережі | Centola 2010 |

### Бібліографія {#bibliography}


- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(перевірено 2026-11-15: деталі)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(перевірено 2026-11-15: деталі)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(перевірено 2026-11-15: деталі)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(перевірено 2026-11-15: деталі)*
- Ammianus Marcellinus (пер. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(перевірено 2026-11-15: деталі)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(перевірено 2026-11-15: деталі)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(перевірено 2026-11-15: деталі)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(перевірено 2026-11-15: деталі)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Ardant du Picq, C. (пер. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(перевірено 2026-11-15: деталі)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(перевірено 2026-11-15: деталі)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Arrian (пер. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(перевірено 2026-11-15: деталі)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(перевірено 2026-11-15: деталі)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(перевірено 2026-11-15: деталі)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(перевірено 2026-11-15: деталі)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(перевірено 2026-11-15: деталі)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(перевірено 2026-11-15: деталі)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(перевірено 2026-11-15: деталі)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(перевірено 2026-11-15: деталі)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(перевірено 2026-11-15: деталі)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(перевірено 2026-11-15: деталі)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(перевірено 2026-11-15: деталі)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(перевірено 2026-11-15: деталі)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(перевірено 2026-11-15: деталі)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(перевірено 2026-11-15: деталі)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(перевірено 2026-11-15: деталі)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(перевірено 2026-11-15: деталі)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(перевірено 2026-11-15: деталі)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(перевірено 2026-11-15: існування)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(перевірено 2026-11-15: деталі)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(перевірено 2026-11-15: деталі)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(перевірено 2026-11-15: деталі)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(перевірено 2026-11-15: деталі)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(перевірено 2026-11-15: деталі)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(перевірено 2026-11-15: деталі)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(перевірено 2026-11-15: існування)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(перевірено 2026-11-15: деталі)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(перевірено 2026-11-15: деталі)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(перевірено 2026-11-15: деталі)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(перевірено 2026-11-15: деталі)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(перевірено 2026-11-15: деталі)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(перевірено 2026-11-15: деталі)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(перевірено 2026-11-15: існування)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(перевірено 2026-11-15: деталі)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(перевірено 2026-11-15: деталі)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(перевірено 2026-11-15: деталі)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(перевірено 2026-11-15: деталі)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(перевірено 2026-11-15: існування)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(перевірено 2026-11-15: деталі)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(перевірено 2026-11-15: деталі)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(перевірено 2026-11-15: деталі)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(перевірено 2026-11-15: деталі)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(перевірено 2026-11-15: існування)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(перевірено 2026-11-15: деталі)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(перевірено 2026-11-15: деталі)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(перевірено 2026-11-15: деталі)*
- Caesar, G. J. (пер. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(перевірено 2026-11-15: деталі)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(перевірено 2026-11-15: деталі)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(перевірено 2026-11-15: деталі)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(перевірено 2026-11-15: деталі)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(перевірено 2026-11-15: деталі)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(перевірено 2026-11-15: деталі)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(перевірено 2026-11-15: деталі)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(перевірено 2026-11-15: деталі)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(перевірено 2026-11-15: деталі)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(перевірено 2026-11-15: деталі)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(перевірено 2026-11-15: деталі)*
- Clausewitz, C. von (пер. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(перевірено 2026-11-15: деталі)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(перевірено 2026-11-15: деталі)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(перевірено 2026-11-15: деталі)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(перевірено 2026-11-15: деталі)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(перевірено 2026-11-15: деталі)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(перевірено 2026-11-15: деталі)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(перевірено 2026-11-15: деталі)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Corbett, J. S. (1920). Naval Operations т. 1 (History of the Great War). Longmans, Green, London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Corbett, J. S. (1921). Naval Operations т. 2 (History of the Great War). Longmans, Green, London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Corbett, J. S. (1923). Naval Operations т. 3 (History of the Great War). Longmans, Green, London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(перевірено 2026-11-15: існування)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(перевірено 2026-11-15: деталі)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(перевірено 2026-11-15: деталі)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(перевірено 2026-11-15: деталі)*
- Craven, W. F.; Cate, J. L. (ред.) (1949). The Army Air Forces in World War II, т. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(перевірено 2026-11-15: існування)*
- Craven, W. F.; Cate, J. L. (ред.) (1951). The Army Air Forces in World War II, т. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(перевірено 2026-11-15: існування)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(перевірено 2026-11-15: деталі)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(перевірено 2026-11-15: деталі)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(перевірено 2026-11-15: деталі)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(перевірено 2026-11-15: існування)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(перевірено 2026-11-15: деталі)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(перевірено 2026-11-15: деталі)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(перевірено 2026-11-15: деталі)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(перевірено 2026-11-15: деталі)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(перевірено 2026-11-15: деталі)*
- Delbrück, H. (пер. Renfroe, W. J.) (1990). History of the Art of War, т. 4: The Dawn of Modern Warfare (оригінал 1920). University of Nebraska Press, Lincoln. *(перевірено 2026-11-15: існування)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(перевірено 2026-11-15: деталі)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(перевірено 2026-11-15: деталі)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(перевірено 2026-11-15: деталі)*
- Douhet, G. (пер. Ferrari, D.) (1942). The Command of the Air (оригінал 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(перевірено 2026-11-15: деталі)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(перевірено 2026-11-15: деталі)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(перевірено 2026-11-15: деталі)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(перевірено 2026-11-15: деталі)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(перевірено 2026-11-15: існування)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(перевірено 2026-11-15: деталі)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(перевірено 2026-11-15: деталі)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(перевірено 2026-11-15: деталі)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(перевірено 2026-11-15: деталі)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(перевірено 2026-11-15: деталі)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(перевірено 2026-11-15: деталі)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(перевірено 2026-11-15: деталі)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(перевірено 2026-11-15: деталі)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(перевірено 2026-11-15: деталі)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(перевірено 2026-11-15: існування)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(перевірено 2026-11-15: деталі)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(перевірено 2026-11-15: деталі)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(перевірено 2026-11-15: деталі)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(перевірено 2026-11-15: деталі)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(перевірено 2026-11-15: деталі)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(перевірено 2026-11-15: деталі)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(перевірено 2026-11-15: деталі)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(перевірено 2026-11-15: деталі)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(перевірено 2026-11-15: деталі)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(перевірено 2026-11-15: деталі)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(перевірено 2026-11-15: деталі)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(перевірено 2026-11-15: деталі)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(перевірено 2026-11-15: деталі)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(перевірено 2026-11-15: деталі)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(перевірено 2026-11-15: деталі)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(перевірено 2026-11-15: деталі)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(перевірено 2026-11-15: деталі)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(перевірено 2026-11-15: деталі)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(перевірено 2026-11-15: існування)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(перевірено 2026-11-15: деталі)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(перевірено 2026-11-15: деталі)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(перевірено 2026-11-15: деталі)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(перевірено 2026-11-15: деталі)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(перевірено 2026-11-15: деталі)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(перевірено 2026-11-15: деталі)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(перевірено 2026-11-15: деталі)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(перевірено 2026-11-15: деталі)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(перевірено 2026-11-15: деталі)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(перевірено 2026-11-15: деталі)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(перевірено 2026-11-15: деталі)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(перевірено 2026-11-15: деталі)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(перевірено 2026-11-15: деталі)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(перевірено 2026-11-15: деталі)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(перевірено 2026-11-15: деталі)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(перевірено 2026-11-15: деталі)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(перевірено 2026-11-15: деталі)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(перевірено 2026-11-15: деталі)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(перевірено 2026-11-15: деталі)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(перевірено 2026-11-15: деталі)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(перевірено 2026-11-15: деталі)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(перевірено 2026-11-15: деталі)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(перевірено 2026-11-15: деталі)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(перевірено 2026-11-15: деталі)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(перевірено 2026-11-15: деталі)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(перевірено 2026-11-15: деталі)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(перевірено 2026-11-15: деталі)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(перевірено 2026-11-15: деталі)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(перевірено 2026-11-15: деталі)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(перевірено 2026-11-15: деталі)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(перевірено 2026-11-15: деталі)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(перевірено 2026-11-15: деталі)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(перевірено 2026-11-15: деталі)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(перевірено 2026-11-15: деталі)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(перевірено 2026-11-15: деталі)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(перевірено 2026-11-15: деталі)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(перевірено 2026-11-15: деталі)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(перевірено 2026-11-15: деталі)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(перевірено 2026-11-15: деталі)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(перевірено 2026-11-15: деталі)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(перевірено 2026-11-15: деталі)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(перевірено 2026-11-15: деталі)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(перевірено 2026-11-15: деталі)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(перевірено 2026-11-15: деталі)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(перевірено 2026-11-15: деталі)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(перевірено 2026-11-15: деталі)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(перевірено 2026-11-15: деталі)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(перевірено 2026-11-15: деталі)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(перевірено 2026-11-15: існування)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Herodotus (пер. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(перевірено 2026-11-15: деталі)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(перевірено 2026-11-15: деталі)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(перевірено 2026-11-15: деталі)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(перевірено 2026-11-15: деталі)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(перевірено 2026-11-15: деталі)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(перевірено 2026-11-15: деталі)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(перевірено 2026-11-15: деталі)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(перевірено 2026-11-15: деталі)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(перевірено 2026-11-15: деталі)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(перевірено 2026-11-15: деталі)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(перевірено 2026-11-15: деталі)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(перевірено 2026-11-15: деталі)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(перевірено 2026-11-15: деталі)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(перевірено 2026-11-15: деталі)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(перевірено 2026-11-15: деталі)*
- Isserson, G. S. (пер. Menning, B. W.) (2013). The Evolution of Operational Art (оригінал 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(перевірено 2026-11-15: деталі)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(перевірено 2026-11-15: деталі)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Jomini, A.-H. de (пер. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(перевірено 2026-11-15: деталі)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(перевірено 2026-11-15: деталі)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(перевірено 2026-11-15: деталі)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(перевірено 2026-11-15: деталі)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(перевірено 2026-11-15: деталі)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(перевірено 2026-11-15: існування)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(перевірено 2026-11-15: деталі)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(перевірено 2026-11-15: деталі)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(перевірено 2026-11-15: деталі)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(перевірено 2026-11-15: деталі)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(перевірено 2026-11-15: деталі)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(перевірено 2026-11-15: деталі)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(перевірено 2026-11-15: деталі)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(перевірено 2026-11-15: деталі)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(перевірено 2026-11-15: деталі)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(перевірено 2026-11-15: деталі)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(перевірено 2026-11-15: деталі)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(перевірено 2026-11-15: деталі)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(перевірено 2026-11-15: деталі)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(перевірено 2026-11-15: існування)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(перевірено 2026-11-15: деталі)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(перевірено 2026-11-15: деталі)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(перевірено 2026-11-15: деталі)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(перевірено 2026-11-15: деталі)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(перевірено 2026-11-15: деталі)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(перевірено 2026-11-15: деталі)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(перевірено 2026-11-15: деталі)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(перевірено 2026-11-15: деталі)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(перевірено 2026-11-15: деталі)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(перевірено 2026-11-15: деталі)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(перевірено 2026-11-15: існування)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(перевірено 2026-11-15: деталі)*
- Livy (пер. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(перевірено 2026-11-15: деталі)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(перевірено 2026-11-15: деталі)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(перевірено 2026-11-15: деталі)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(перевірено 2026-11-15: деталі)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(перевірено 2026-11-15: існування)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(перевірено 2026-11-15: деталі)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(перевірено 2026-11-15: деталі)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(перевірено 2026-11-15: деталі)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(перевірено 2026-11-15: деталі)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(перевірено 2026-11-15: деталі)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(перевірено 2026-11-15: існування)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(перевірено 2026-11-15: деталі)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(перевірено 2026-11-15: деталі)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(перевірено 2026-11-15: деталі)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(перевірено 2026-11-15: деталі)*
- Mao Tse-tung (пер. Griffith, S. B.) (1961). On Guerrilla Warfare (оригінал 1937). Praeger, New York. *(перевірено 2026-11-15: існування)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(перевірено 2026-11-15: деталі)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(перевірено 2026-11-15: деталі)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(перевірено 2026-11-15: деталі)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(перевірено 2026-11-15: деталі)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(перевірено 2026-11-15: деталі)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(перевірено 2026-11-15: деталі)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(перевірено 2026-11-15: деталі)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(перевірено 2026-11-15: деталі)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(перевірено 2026-11-15: деталі)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(перевірено 2026-11-15: деталі)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(перевірено 2026-11-15: існування)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(перевірено 2026-11-15: деталі)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(перевірено 2026-11-15: деталі)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(перевірено 2026-11-15: деталі)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(перевірено 2026-11-15: деталі)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(перевірено 2026-11-15: деталі)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(перевірено 2026-11-15: деталі)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(перевірено 2026-11-15: деталі)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(перевірено 2026-11-15: деталі)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(перевірено 2026-11-15: деталі)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(перевірено 2026-11-15: деталі)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(перевірено 2026-11-15: існування)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(перевірено 2026-11-15: існування)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(перевірено 2026-11-15: деталі)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(перевірено 2026-11-15: деталі)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(перевірено 2026-11-15: деталі)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(перевірено 2026-11-15: деталі)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, т. 3). Little, Brown, Boston. *(перевірено 2026-11-15: деталі)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, т. 4). Little, Brown, Boston. *(перевірено 2026-11-15: існування)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, т. 5). Little, Brown, Boston. *(перевірено 2026-11-15: існування)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, т. 6). Little, Brown, Boston. *(перевірено 2026-11-15: деталі)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, т. 8). Little, Brown, Boston. *(перевірено 2026-11-15: деталі)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, т. 12). Little, Brown, Boston. *(перевірено 2026-11-15: існування)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, т. 14). Little, Brown, Boston. *(перевірено 2026-11-15: деталі)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(перевірено 2026-11-15: деталі)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(перевірено 2026-11-15: деталі)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(перевірено 2026-11-15: деталі)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(перевірено 2026-11-15: деталі)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(перевірено 2026-11-15: деталі)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(перевірено 2026-11-15: деталі)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(перевірено 2026-11-15: деталі)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(перевірено 2026-11-15: деталі)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(перевірено 2026-11-15: деталі)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(перевірено 2026-11-15: деталі)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(перевірено 2026-11-15: деталі)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(перевірено 2026-11-15: деталі)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(перевірено 2026-11-15: деталі)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(перевірено 2026-11-15: існування)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(перевірено 2026-11-15: деталі)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(перевірено 2026-11-15: деталі)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(перевірено 2026-11-15: деталі)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(перевірено 2026-11-15: деталі)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(перевірено 2026-11-15: деталі)*
- Osipov, M. (пер. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (оригінал 1915). Naval Research Logistics 42(3): 435-490. *(перевірено 2026-11-15: деталі)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(перевірено 2026-11-15: деталі)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(перевірено 2026-11-15: деталі)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(перевірено 2026-11-15: деталі)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(перевірено 2026-11-15: деталі)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(перевірено 2026-11-15: деталі)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(перевірено 2026-11-15: деталі)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(перевірено 2026-11-15: деталі)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(перевірено 2026-11-15: деталі)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(перевірено 2026-11-15: деталі)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(перевірено 2026-11-15: деталі)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(перевірено 2026-11-15: деталі)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(перевірено 2026-11-15: деталі)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(перевірено 2026-11-15: деталі)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(перевірено 2026-11-15: деталі)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(перевірено 2026-11-15: деталі)*
- Plutarch (пер. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(перевірено 2026-11-15: деталі)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(перевірено 2026-11-15: деталі)*
- Polybius (пер. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(перевірено 2026-11-15: деталі)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(перевірено 2026-11-15: деталі)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(перевірено 2026-11-15: деталі)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(перевірено 2026-11-15: деталі)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(перевірено 2026-11-15: деталі)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(перевірено 2026-11-15: деталі)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(перевірено 2026-11-15: деталі)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(перевірено 2026-11-15: деталі)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(перевірено 2026-11-15: деталі)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(перевірено 2026-11-15: деталі)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(перевірено 2026-11-15: деталі)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(перевірено 2026-11-15: деталі)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(перевірено 2026-11-15: деталі)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(перевірено 2026-11-15: деталі)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(перевірено 2026-11-15: деталі)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(перевірено 2026-11-15: деталі)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(перевірено 2026-11-15: деталі)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(перевірено 2026-11-15: деталі)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(перевірено 2026-11-15: деталі)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(перевірено 2026-11-15: деталі)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(перевірено 2026-11-15: існування)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, т. 1: The Defensive. HMSO, London. *(перевірено 2026-11-15: існування)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, т. 2: The Period of Balance. HMSO, London. *(перевірено 2026-11-15: існування)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, т. 3, part 1: The Offensive. HMSO, London. *(перевірено 2026-11-15: існування)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(перевірено 2026-11-15: деталі)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(перевірено 2026-11-15: деталі)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(перевірено 2026-11-15: деталі)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(перевірено 2026-11-15: деталі)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(перевірено 2026-11-15: деталі)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(перевірено 2026-11-15: деталі)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(перевірено 2026-11-15: деталі)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(перевірено 2026-11-15: деталі)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(перевірено 2026-11-15: існування)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(перевірено 2026-11-15: деталі)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(перевірено 2026-11-15: деталі)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (ред.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(перевірено 2026-11-15: деталі)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(перевірено 2026-11-15: деталі)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(перевірено 2026-11-15: існування)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(перевірено 2026-11-15: деталі)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(перевірено 2026-11-15: існування)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(перевірено 2026-11-15: деталі)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(перевірено 2026-11-15: деталі)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(перевірено 2026-11-15: деталі)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(перевірено 2026-11-15: деталі)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(перевірено 2026-11-15: існування)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(перевірено 2026-11-15: деталі)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(перевірено 2026-11-15: деталі)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(перевірено 2026-11-15: деталі)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(перевірено 2026-11-15: деталі)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(перевірено 2026-11-15: деталі)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(перевірено 2026-11-15: деталі)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(перевірено 2026-11-15: деталі)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(перевірено 2026-11-15: деталі)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(перевірено 2026-11-15: деталі)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(перевірено 2026-11-15: деталі)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(перевірено 2026-11-15: деталі)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(перевірено 2026-11-15: існування)*
- Sun Tzu (пер. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(перевірено 2026-11-15: деталі)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(перевірено 2026-11-15: деталі)*
- Tacitus (пер. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(перевірено 2026-11-15: деталі)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(перевірено 2026-11-15: деталі)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(перевірено 2026-11-15: деталі)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(перевірено 2026-11-15: деталі)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(перевірено 2026-11-15: деталі)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(перевірено 2026-11-15: деталі)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(перевірено 2026-11-15: деталі)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(перевірено 2026-11-15: деталі)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(перевірено 2026-11-15: деталі)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(перевірено 2026-11-15: деталі)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(перевірено 2026-11-15: деталі)*
- Triandafillov, V. K. (пер. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (оригінал 1929). Frank Cass, Ilford. *(перевірено 2026-11-15: деталі)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(перевірено 2026-11-15: деталі)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(перевірено 2026-11-15: деталі)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(перевірено 2026-11-15: деталі)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(перевірено 2026-11-15: деталі)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(перевірено 2026-11-15: деталі)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(перевірено 2026-11-15: деталі)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(перевірено 2026-11-15: існування)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, т. 7. Government Printing Office, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I т. 21 (Fredericksburg). Government Printing Office, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(перевірено 2026-11-15: деталі)*
- Vegetius (пер. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(суспільне надбання)* *(перевірено 2026-11-15: існування)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(перевірено 2026-11-15: деталі)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(перевірено 2026-11-15: деталі)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(перевірено 2026-11-15: деталі)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(перевірено 2026-11-15: деталі)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(перевірено 2026-11-15: деталі)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(перевірено 2026-11-15: деталі)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(перевірено 2026-11-15: деталі)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(перевірено 2026-11-15: деталі)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(перевірено 2026-11-15: існування)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(перевірено 2026-11-15: деталі)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(перевірено 2026-11-15: існування)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(перевірено 2026-11-15: існування)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(перевірено 2026-11-15: деталі)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(перевірено 2026-11-15: існування)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(перевірено 2026-11-15: деталі)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(перевірено 2026-11-15: деталі)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(перевірено 2026-11-15: деталі)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(перевірено 2026-11-15: деталі)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(перевірено 2026-11-15: деталі)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(перевірено 2026-11-15: існування)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(перевірено 2026-11-15: деталі)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: деталі)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(перевірено 2026-11-15: деталі)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(перевірено 2026-11-15: деталі)*
- Xenophon (пер. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(суспільне надбання)* *(перевірено 2026-11-15: деталі)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(перевірено 2026-11-15: деталі)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(перевірено 2026-11-15: деталі)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(перевірено 2026-11-15: деталі)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(перевірено 2026-11-15: існування)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(перевірено 2026-11-15: деталі)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(перевірено 2026-11-15: існування)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(перевірено 2026-11-15: існування)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(перевірено 2026-11-15: деталі)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(перевірено 2026-11-15: деталі)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(перевірено 2026-11-15: деталі)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(перевірено 2026-11-15: деталі)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(перевірено 2026-11-15: деталі)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(перевірено 2026-11-15: деталі)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(перевірено 2026-11-15: деталі)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(перевірено 2026-11-15: деталі)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(перевірено 2026-11-15: деталі)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(перевірено 2026-11-15: деталі)*

<!-- kb:end -->
