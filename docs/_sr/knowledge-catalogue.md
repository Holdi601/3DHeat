---
title: "Каталог знања"
parent: "Сочиво знања"
nav_order: 2
lang: "sr"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Каталог знања

Ово је цео списак онога што [сочиво знања](knowledge.md) зна: обрасце које тражи, идеје, методе, историјске случајеве и студије које наводи, и књиге и радове на којима се то заснива. Користите га да пронађете унос по његовом ид-у или да проверите извор.

Ова страница се прави из базе знања помоћу `node tools/knowledge-doc.mjs`; не мењајте ништа између ознака.

<!-- kb:begin -->

База знања садржи 579 уноса (135 појмова, 37 метода, 277 историјских случајева, 17 принципа дизајна, 113 студија) у 93 обрасца, уз 556 референци.

### Обрасци (93) {#patterns-93}

| id | породица | како то изгледа у подацима |
|---|---|---|
| `concentration` | сила | Страна која доведе више јединица на једно место побеђује то место више него што би то дао сам број јединица. |
| `local-superiority` | сила | Убиства иду на ону страну која у домету ангажовања има већи број, без обзира на укупне бројке. |
| `attrition` | сила | Губици прате снаге обе стране током времена; борбу одлучује ко први остане без снаге. |
| `exchange-ratio` | сила | Број убистава по губитку јако се разликује по месту, страни или класи. |
| `aimed-fire` | сила | Губици расту са бројем непријатеља, али не и са бројем сопствених јединица. |
| `area-fire` | сила | Губици расту са производом бројева обе стране: гужва се кажњава. |
| `defeat-in-detail` | сила | Страна се уништава по деловима, јер њени делови стижу један по један. |
| `mutual-support` | сила | На губитак брзо одговара близак саиграч: размена. |
| `combined-arms` | сила | Класе добро раде заједно тамо где свака покрива слабост друге, а лоше саме. |
| `class-counter` | сила | Једна класа непропорционално побеђује одређену другу класу или побеђује на одређеном месту. |
| `initiative` | сила | Ко први постигне погодак у ангажовању, има тенденцију да га и добије. |
| `key-terrain` | терен | Исто неколико места одлучује борбе из меча у меч. |
| `fields-of-fire` | терен | Места која далеко виде преко терена који други морају да пређу носе више убистава. |
| `high-ground` | терен | Убиства се врше одозго, са земљишта вишег од оног на коме стоје жртве. |
| `cover` | терен | Смрти по времену падају тамо где геометрија блокира видик и ватру. |
| `open-ground` | терен | Смрти по времену расту тамо где ништа не блокира видик и ватру. |
| `kill-zone` | терен | Смрти се гомилају тамо где је кретање принуђено кроз осматрано, ватром покривено земљиште. |
| `chokepoint` | терен | Много прелаза стиснуто кроз мало простора, са губицима на том месту. |
| `reverse-slope` | терен | Сигурност непосредно иза гребена или зида, ван директног видика непријатеља. |
| `safe-ground` | терен | Место на коме се троши време, а мало ко гине. |
| `obstacle` | терен | Путање заобилазе блокирано земљиште и своде се на неколико праваца. |
| `flank` | кретање | Ретко коришћена рута води до више убистава него главне. |
| `avenue-of-approach` | кретање | Кретање тече дуж неколико праваца између области. |
| `mobility` | кретање | Покретне јединице гину мање (или више) по времену него спорије или непокретне. |
| `static-exposure` | кретање | Јединице које стоје у месту гину више по времену него оне које се крећу. |
| `interior-lines` | кретање | Страна са кратким путевима између својих борби брже помера снагу од друге. |
| `envelopment` | кретање | Убиства долазе из неколико праваца на положај једне стране. |
| `ambush` | кретање | Јединице које се крећу дуж руте брзо гину од непријатеља који су већ на положају. |
| `spawn-pressure` | време | Животи се брзо завршавају после почетка на једном спауну. |
| `tempo` | време | Бржа страна стиже до борбе и постиже погодак пре него што други реагује. |
| `surprise` | време | Губици долазе у налету пре него што жртве узврате ватру. |
| `energy-advantage` | ваздух | Убице имају већу висину и брзину од својих жртава. |
| `air-superiority` | ваздух | Авиони једне стране убијају много пута више него што губе. |
| `sead` | ваздух | Земаљска противваздушна одбрана одузима много авиона док се не пронађе и уништи. |
| `bvr` | ваздух | Убиства се дешавају на великој даљини, пре него што жртва може да се приближи. |
| `fleet-salvo` | море | Снага која први нанесе удар мало губи; друга мало преживи да узврати. |
| `scouting` | море | Страна која први пронађе другу бира борбу. |
| `urban-close` | градско | Кратки домети ангажовања, много смрти међу густом геометријом, спора чистка. |
| `vertical` | градско | Убиства са виших спратова или кровова на улице. |
| `skill-dispersion` | људи | Неколико играча чини велики део убистава или смрти. |
| `ai-vs-player` | људи | Јединице које контролише AI другачије пролазе од играча на истом месту. |
| `balance` | дизајн | Стране, спауни или класе почињу са неједнаким шансама. |
| `economy` | дизајн | Ресурси који се зарађују, троше и губе концентришу се на неколико места или играча. |
| `flow` | дизајн | Како играчи пролазе кроз ниво: петље, стазе, слепе улице. |
| `sightlines` | дизајн | Дуге линије видика одлучују где борбе почињу и ко их добија. |
| `readability` | дизајн | Смрти које играчи не могу да предвиде: од позади, из мртвог угла. |
| `formation` | кретање | Јединице једне стране се крећу заједно у препознатљивом облику: линија, колона, клин, ешалон, квадрат. |
| `frontal-assault` | кретање | Група се приближава непријатељу право у лице његовог фронта. |
| `double-envelopment` | кретање | Две групе истовремено нападају оба бока једног непријатељског тела. |
| `encirclement` | кретање | Непријатељска група се нађе опкољена са свих страна и са мало излаза. |
| `penetration` | кретање | Група пролази кроз непријатељску линију тамо где непријатељи стоје са обе њене стране. |
| `fire-and-maneuver` | кретање | Део групе се креће док остали стоје и покривају га, а улоге се смењују. |
| `feint` | кретање | Мала група вуче непријатеља на једно место; главни напор удара на другом месту убрзо после тога. |
| `withdrawal` | кретање | Група у додиру се окреће и повећава растојање до непријатеља. |
| `pursuit` | кретање | Група прати непријатеља који се удаљава и задржава или смањује растојање. |
| `defence-in-depth` | терен | Браниоци стоје у неколико појасева један иза другог дуж правца напредовања непријатеља. |
| `screening` | кретање | Мали елемент се креће далеко испред своје главнине и први налази непријатеља. |
| `dispersion` | сила | Страна се временом раширује; мање њених јединица дели исто место. |
| `missile-defence` | ваздух | Авиони под претњом ракете окрећу претњу ка боку или репу: crank, notch, drag, pump. |
| `angles-fight` | ваздух | Борба из блиске даљине при малој брзини и великој брзини окретања, вођена за положај носа, а не за енергију. |
| `cap` | ваздух | Авиони круже око фиксне станице минутима, чекајући да непријатељ дође. |
| `strike-package` | ваздух | Авиони различитих улога лете заједно до циља: неки нападају земљу, други покривају њих. |
| `line-of-battle` | море | Бродови иду у колони један иза другог, тако да сви бокови могу да гађају. |
| `crossing-the-t` | море | Колона пролази преко главе непријатељске колоне: сви њени топови гађају, а мало непријатељских. |
| `fatal-funnel` | градско | Играчи који уђу кроз једна врата, собу или уско грло гину тамо за тренутак много чешће него кад уђу на другом месту. |
| `crossfire` | сила | Држаоци чије се линије ватре укрштају из различитих праваца добијају више дуела него један држалац. |
| `peeker-advantage` | време | Играч који уђе у видно поље побеђује у дуелима против онога који држи угао чешће (или ређе) него у половини случајева. |
| `entry` | време | Прво убиство у кругу одлучује велики део круга; улази добијају или губе зависно од места и подршке. |
| `utility-support` | сила | Блиц или димна граната непосредно пре дуела мења ко га добија. |
| `man-advantage` | сила | Кругове добија страна са више живих играча, а неке стране претварају или бацају предност. |
| `clutch` | људи | Последњи живи играчи добијају чешће (или ређе) него што стање круга предвиђа. |
| `action-value` | људи | Убиства, размене, постављања и помоћна средства се разликују по томе колико мењају шансу за победу. |
| `lurk` | кретање | Играч сам далеко од тима убија (или гине) другачијом брзином од групе. |
| `rotation` | кретање | Брзина којом страна помера играче ка борби или циљу одлучује да ли држи или поново осваја. |
| `collective-order` | људи | Покретне јединице једне стране иду у исти правац много чешће него што би то дало њихово сопствено кретање, померено у времену, по случају. |
| `milling` | људи | Јединице једне стране круже око заједничког средишта: ротација без нето кретања. |
| `herding` | људи | Јединице напуштају неко место онако како је то урадио саиграч пре њих, више него што то дају шансе самог места и више од копирања непријатеља. |
| `lane-formation` | људи | Супротни токови држе одвојене стазе; кретање се концентрише на неколико трагова који се користе из меча у меч. |
| `crowding` | људи | Брзина и проток падају како се јединице згрушавају; кроз уско грло, јачи гурање пропушта мање. |
| `leadership` | људи | Неке јединице се прве окрећу, а друге копирају њихов правац неколико секунди касније. |
| `cohesion` | људи | Јединице које се одвоје од своје групе гину чешће од оних које остају с њом. |
| `breaking-point` | људи | Страна која је изгубила део своје снаге престаје да се приближава и повлачи се, више него што то објашњава растојање до непријатеља. |
| `panic` | људи | Под изненадном претњом јединице се раштркају, беже или се укоче, и координација се распада. |
| `loss-chasing` | људи | После губитка јединице узимају више (или мање) ризика него после добитка. |
| `hot-hand` | људи | Успех прати успех чешће него што то дозвољавају измешане серије истог играча. |
| `conformity` | људи | Чланови једне стране бирају слично — куповине, опрему, руте — више него што то дају њихове сопствене преференције. |
| `suppression` | људи | Долазећа ватра мења начин на који се јединице крећу и гађају, чак и кад не убија. |
| `social-loafing` | људи | Учинак по глави пада што је више саиграча присутно. |
| `mixed-strategy` | људи | Избори који би требало да буду непредвидиви постају обрасци: једна опција побеђује чешће, или избори теку у низовима. |
| `coordination` | људи | Чланови делују у кораку без видљивих наређења: усклађено кретање, време и избори. |
| `contagion` | људи | Стање прелази са јединице на јединицу додиром или близином и шири се по мапи. |
| `territoriality` | људи | Јединице одржавају размак једна од друге и држе се свог терена. |
| `interaction-network` | људи | Ко се бори, подржава и прати кога, чини мрежу са чворовима, групама и мостовима. |

### Појмови (135) {#concepts-135}

| id | назив | сочива | обрасци | извори |
|---|---|---|---|---|
| `concept.lanchester-square` | Ланчестеров квадратни закон (циљана ватра) | војна, ваздух, поморска, е-спорт | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Ланчестеров линеарни закон (ватра по површини, један на један) | војна, градска, е-спорт | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Концентрација снаге (маса) | војна, ваздух, поморска, е-спорт | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Односи снага и правило 3:1 | војна | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Однос размене губитака | војна, ваздух, е-спорт, дизајн | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Борбена моћ и њени множитељи | војна | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Савремени систем употребе снага | војна | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA петља (посматрај, оријентиши се, одлучи, делуј) | војна, ваздух, е-спорт | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Теорија енергије и маневарске способности | ваздух | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Основни ловачки маневри и ваздушно маневрисање у борби | ваздух | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Анализа терена: OAKOC / KOCOA | војна, дизајн, градска | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: променљиве задатка | војна | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Кључни и одлучујући терен | војна, дизајн, е-спорт | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Осматрање и поља ватре | војна, дизајн, е-спорт, градска | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Заклон и прикривање | војна, градска, дизајн | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Правци приласка и коридори покретљивости | војна, дизајн | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Уска грла и клисуре | војна, дизајн, е-спорт | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Области ангажовања и зоне убијања | војна, градска, дизајн | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Одбрана са обрнутог нагиба и заклањање | војна, дизајн | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Висинско земљиште | војна, дизајн | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Унутрашње и спољашње линије | војна | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Поразити по деловима | војна, е-спорт | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Узајамна подршка | војна, ваздух, е-спорт | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Здружени родови | војна, дизајн | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Сузбијање | војна, градска | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Сузбијање и уништавање непријатељске противваздушне одбране (SEAD/DEAD) | ваздух, војна | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Борбена ваздушна патрола и ваздушна надмоћ | ваздух | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Ангажовање ван визуелног домета | ваздух | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Индиректни приступ | војна, е-спорт, дизајн | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Обухват и опкољавање | војна | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Заседа | војна, е-спорт, дизајн | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Дубинска одбрана | војна | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Трење и магла рата | војна, е-спорт | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Кулминациона тачка напада | војна | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Изненађење | војна, ваздух, поморска, е-спорт | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Економија снага | војна, е-спорт | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Градски терен | градска, војна, е-спорт | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Контрола мора и одлучујућа флотна битка | поморска | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Хјузов модел салве: први нападни удар је ефикасан | поморска, ваздух | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Теорија претраге и откривања | поморска, ваздух, војна | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Истраживање операција: мере ефикасности | војна, ваздух, поморска, дизајн | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Ратне игре као анализа | војна, дизајн | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Ратовање маневром | војна, е-спорт | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Кохезија и морални фактор | војна | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Центар гравитације | војна | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Одлучујуће тачке | војна, е-спорт | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Линије операција | војна | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Стратегије истребљења и исцрпљивања | војна | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Дубока битка и дубоке операције | војна | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | војна, ваздух | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Командовање задатком (Auftragstaktik) | војна, е-спорт | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Пробој и искоришћавање | војна | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Ватра и кретање | војна, е-спорт | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Скок уз покривање (bounding overwatch) | војна, е-спорт | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Извиђачко привлачење и инфилтрација | војна, е-спорт | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Резерва | војна, е-спорт | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Еластична одбрана и контранапад | војна | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Ланац убијања (открити, фиксирати, пратити, циљати, ангажовати, проценити) | војна, ваздух, поморска | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Домет откривања наспрам домета ангажовања | ваздух, поморска, војна | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Вредност борбене ефикасности | војна, е-спорт | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Раштрканост на бојишту | војна, е-спорт | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Блиска ваздушна подршка | ваздух, војна | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Ваздушна интердикција | ваздух, војна | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Пратња наспрам чишћења ловцима | ваздух | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Борба енергијом наспрам борбе окретањем | ваздух | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Водећа, чиста и заостајућа потера | ваздух | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Тачов плес (Thach weave) | ваздух | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Формација „прст-четири“ и борбени пар | ваздух | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Флота у постојању | поморска | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Пресецање Т-а | поморска, војна | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Конвој | поморска | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Приступна забрана и ускраћивање простора (A2/AD) | поморска, ваздух, војна | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Одбрана упоришта у насељеним местима | градска, војна | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Пробијање кроз рупе у зидовима и кретање кроз зграде (mouseholing) | градска, војна, дизајн | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Опсада | војна, градска | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Герилско ратовање | војна, градска | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Контрапобуна | војна, градска | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Уточиште | војна, дизајн | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Обмана (маскировка) | војна, е-спорт | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Информациона предност | војна, е-спорт | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Економски кругови и темпо ресурса | е-спорт, дизајн | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Формације кретања: линија, колона, клин, ешалон | војна, е-спорт | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Фронтални напад | војна | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Двоструки обухват (клешта) | војна | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Опкољавање и џеп | војна | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Продор и пробој | војна | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Потера | војна | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Ретроградно: повлачење, одлагање и отступање | војна | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Финта и демонстрација | војна, е-спорт | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Заклон, стража и обезбеђење: осигурање испред главнине | војна | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Одбрана од ракете: crank, notch, drag и pump | ваздух | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Формације ван визуелног домета: зид, вођа-задњи, млин, клешта | ваздух | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Борба углова и борба енергијом | ваздух | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Ударни пакет и редослед сузбијања | ваздух | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Борбена линија | поморска | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Фатални левак | градска, војна, е-спорт, дизајн | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Чишћење просторије: изненађење, брзина, контролисано насиље | градска, војна, е-спорт | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Тачке доминације | градска, војна, е-спорт | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Чишћење углова: сечење торте (slicing the pie) | градска, војна, е-спорт | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Унакрсна ватра и међусобно укрштена поља ватре | војна, градска, е-спорт, дизајн | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Предност онога који искаче | е-спорт, дизајн | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Предност у броју у круговима елиминације | е-спорт, војна | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Улаз и отварајући дуел | е-спорт, градска | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Помоћна средства пре улаза: блиц и дим | е-спорт, градска, војна | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Модел социјалне силе у кретању пешака | дизајн, градска, војна | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Формирање стаза у противтоку | дизајн, градска | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Брже је спорије | дизајн, градска, војна | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Основни дијаграм гомила | дизајн, градска | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Формирање трагова и жељене линије кретања | дизајн, војна | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Паника је ретка: колективна отпорност | војна, градска, дизајн | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: раздвајање, усклађивање, кохезија | дизајн, војна | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Параметар поретка и почетак колективног кретања | дизајн, војна, ваздух, поморска | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Јато, кружење и поларизована стања | дизајн, војна, поморска | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Ефикасно вођство без сигнала | војна, е-спорт, дизајн | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Суседи по броју, а не по растојању | ваздух, војна | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Интелигенција јата | дизајн, е-спорт, војна | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Копирање (herding) и информационе каскаде | е-спорт, дизајн, војна | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Друштвено лењарење | е-спорт, дизајн, војна | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Раслојавање одговорности | е-спорт, војна | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Кохезија примарне групе | војна, е-спорт | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Преломне тачке и прагови губитака | војна | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Сузбијање: шта ватра ради осим убијања | војна, градска | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Страх и стрес у борбеним одлукама | војна, е-спорт | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Гушење под притиском | е-спорт | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Теорија перспективе и аверзија према губитку | е-спорт, дизајн | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Ефекти поврата уложеног и „туђег новца“ | е-спорт | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Тилт (емоционални пад) | е-спорт | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Утопљени трошак | е-спорт, војна | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Врућа рука и њена заблуда | е-спорт | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Мешовите стратегије: бити непредвидив | е-спорт, дизајн, војна | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Заједнички ментални модели | е-спорт, војна | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Компоненте тимског рада | е-спорт, војна | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Виртуелни светови као лабораторије понашања | дизајн, е-спорт | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Лични простор и територија | дизајн, градска | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Мреже интеракције: чворови и слабе везе | е-спорт, дизајн | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Методе (37) {#methods-37}

| id | назив | обрасци | извори |
|---|---|---|---|
| `method.lanchester-fit` | Прилагођавање Ланчестерових експонената подацима о ангажовању | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Однос размене по страни и по месту | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Локални однос снага у тренутку сваког убиства | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Viewshed: поља ватре по линијама видика | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Специфична енергија при убиствима и смрти (ваздух) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Постојаност жаришта кроз мечеве | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Стопа размена (узајамна подршка) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Ангажовања и предност првог убиства | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Просторна аутокорелација смрти (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Стопе у односу на сопствену основу мапе, са FDR контролом | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Обавештајна припрема бојишта (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Модели рангирања парним поређењем (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Вероватноћа победе и вредновање акција | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Контрола простора и контрола терена (pitch control) | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Једначина салве прилагођена бродовима у додиру | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Однос борбене ефикасности по јединичном часу у акцији | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Домети откривања и ангажовања | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Временско усклађивање ланца убијања | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Раштрканост наспрам удела убистава (концентрација снаге у времену) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Стопа губитака и убистава по полету | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Модел вероватноће победе у кругу | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Вредност акције: додата вероватноћа победе | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Прилагођени plus-minus помоћу ридж регресије (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Скупљање: емпиријски Бејз | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Очекивани исходи: од очекиваних голова до очекиваних дуела | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Мерење постављања, ротација и вребања | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Проблем рефлексије: копирање или заједнички узрок | herding, conformity | Manski 1993 |
| `method.streak-correction` | Серије са корекцијом за коначан низ | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Параметри поларизације и кружења | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Вође по корелацији правца са кашњењем | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Тест каскаде руте за копирање | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Раздвајање стаза и трајност трагова | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Хазард заосталих | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Крива прелома | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Одговор на долазећу ватру | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Ризик после губитка или добитка | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Споразум о куповини (Fleiss' kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Историјски случајеви (277) {#historical-cases-277}

| id | случај | када | размера | обрасци | извори |
|---|---|---|---|---|---|
| `case.thermopylae` | Термопиле | 480. п. н. е. | битка | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Саламина | 480. п. н. е. | битка | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Маратон | 490. п. н. е. | битка | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Леутра | 371. п. н. е. | битка | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Гаугамела | 331. п. н. е. | битка | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Трасименско језеро | 217. п. н. е. | битка | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Кана | 216. п. н. е. | битка | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Тевтобуршка шума | 9. н. е. | битка | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Хејстингс | 1066 | битка | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Стерлингски мост | 1297 | битка | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Азенкур | 1415 | битка | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Ројтен | 1757 | битка | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Аустерлиц | 1805 | битка | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Трафалгар | 1805 | битка | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Ватерло | 1815 | битка | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Фредериксберг: Мејријеве висове | 1862 | окршај | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Гетисберг: Литл Раунд Топ | 1863 | окршај | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Гетисберг: Пикетов јуриш | 1863 | окршај | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Исандлвана | 1879 | битка | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Рорков Дрифт | 1879 | окршај | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Танеберг | 1914 | кампања | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Сома, први дан | 1. јул 1916 | битка | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Верден | 1916 | кампања | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Јатланд | 1916 | битка | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Суомусалми | 1939–40 | битка | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Седан и Ардени | мај 1940 | кампања | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Противнапад код Арраса | 21. мај 1940 | окршај | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Битка за Британију | јул–окт. 1940 | кампања | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Битка за Атлантик: истраживање операција конвоја | 1939–45 | кампања | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Мидвеј | јун 1942 | битка | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Друга ел-Аламејн | окт.–нов. 1942 | битка | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Касерински превој | феб. 1943 | битка | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Стаљинград | авг. 1942–феб. 1943 | кампања | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Курск | јул 1943 | кампања | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Прохоровка | 12. јул 1943 | окршај | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Вилер-Бокаж | 13. јун 1944 | окршај | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Живе ограде у Нормандији | јун–јул 1944 | кампања | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Операција Кобра | јул 1944 | кампања | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Заливски Лејте | окт. 1944 | битка | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Бастон | дец. 1944 | битка | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Цушима | мај 1905 | битка | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Инчон | сеп. 1950 | кампања | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | Миг аллеј | 1950–53 | кампања | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Дијен Бијен Фу | 1954 | битка | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Иа Дранг: зона слетања X-Ray | нов. 1965 | окршај | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Операција Боло | 2. јан 1967 | окршај | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Голан: Долина суза | окт. 1973 | битка | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Синај: Кинеска фарма | окт. 1973 | битка | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Долина Бека (операција Mole Cricket 19) | јун 1982 | битка | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Ваздушни рат за Фокланде | мај–јун 1982 | кампања | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Ваздушна кампања Пустињска олуја | јан.–феб. 1991 | кампања | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Истинг | 26. феб. 1991 | окршај | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Могадишу | окт. 1993 | окршај | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Грозни | дец. 1994–феб. 1995 | битка | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Хуе | јан.–мар. 1968 | битка | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Ваздушна кампања на Косову | мар.–јун 1999 | кампања | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Фалуџа (операција Al Fajr) | нов. 2004 | битка | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Мосул | 2016–17 | кампања | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Кадеш | око 1274. п. н. е. | битка | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Исо | 333. п. н. е. | битка | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Зама | 202. п. н. е. | битка | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Каре | 53. п. н. е. | битка | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Фарсал | 48. п. н. е. | битка | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Одрин | 378. н. е. | битка | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Јармук | 636. н. е. | битка | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Манцикерт | 1071 | битка | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Хатин | 1187 | битка | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Бенокберн | 1314 | битка | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Креси | 1346 | битка | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Поатје (Poitiers) | 1356 | битка | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Грунвалд (Танеберг) | 1410 | битка | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Брајтенфелд | 1631 | битка | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Бленхајм | 1704 | битка | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Полтава | 1709 | битка | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Росбах | 1757 | битка | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Саратога | 1777 | кампања | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Јорктаун | 1781 | битка | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Јена–Ауерштет | 1806 | битка | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Бородино | 1812 | битка | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Лајпциг | 1813 | битка | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Антијетам | 1862 | битка | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Чанселорсвил | 1863 | битка | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Виксбург | 1863 | кампања | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Кенигрец (Садова) | 1866 | битка | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Седан | 1870 | битка | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Мукден | 1905 | битка | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Омдурман | 1898 | битка | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Шпион коп | 1900 | окршај | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Галиполи | 1915 | кампања | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Камбре | нов. 1917 | битка | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Капоредо | окт.–нов. 1917 | кампања | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Немачка пролећна офанзива (операција Михаел) | мар.–апр. 1918 | кампања | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Амјен | авг. 1918 | битка | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Халкин Гол (Номонхан) | авг. 1939 | битка | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Пољска кампања | сеп. 1939 | кампања | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Ханит и Жамблу | мај 1940 | битка | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Стон | мај 1940 | окршај | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Обруч око Даркерка | мај–јун 1940 | кампања | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Операција Компас и Беда Фома | дец. 1940–феб. 1941 | кампања | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Операција Крусејдер и Сиди Резех | нов.–дец. 1941 | кампања | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Газала | мај–јун 1942 | битка | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Алам Халфа | авг.–сеп. 1942 | битка | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Дубно–Броди | јун 1941 | битка | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Опкољавање Кијева | сеп. 1941 | кампања | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Москва | окт. 1941–јан. 1942 | кампања | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Ржев и операција Марс | 1942 | кампања | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Други Харков | мај 1942 | битка | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Трећи Харков (Манштајнов удар уназад) | феб.–мар. 1943 | кампања | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Операција Багратион | јун–авг. 1944 | кампања | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Коршун-Черкаски џеп | јан.–феб. 1944 | битка | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Каменец-Подољски џеп | мар.–апр. 1944 | кампања | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Операција Епсом | јун 1944 | битка | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Операција Гудвуд | јул 1944 | битка | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Операција Тотализ | авг. 1944 | битка | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Мортен | авг. 1944 | битка | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Фалез џеп | авг. 1944 | кампања | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Маркет Гарден и Арнем | сеп. 1944 | кампања | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Ахен | окт. 1944 | битка | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Хиртгенска шума | сеп. 1944–феб. 1945 | кампања | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Аракур | сеп. 1944 | битка | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Сент Вит | дец. 1944 | битка | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Елзенборн рит | дец. 1944 | битка | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Зелова висорава | апр. 1945 | битка | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Берлин | апр.–мај 1945 | битка | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Операција Пролећно буђење | мар. 1945 | битка | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ортона | дец. 1943 | битка | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Варшавски устанак | авг.–окт. 1944 | кампања | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Тарава | нов. 1943 | битка | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Пелељу | сеп.–нов. 1944 | битка | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Ивожима | феб.–мар. 1945 | битка | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Окинава | апр.–јун 1945 | кампања | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Манила | феб.–мар. 1945 | битка | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Мандџурија (Августовска олуја) | авг. 1945 | кампања | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Пусански обруч | авг.–сеп. 1950 | кампања | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Чосинско језеро | нов.–дец. 1950 | кампања | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Имђин | апр. 1951 | битка | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Капјон | апр. 1951 | битка | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Брдо Порк Чоп | апр. и јул 1953 | окршај | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Кхе Сањ | јан.–апр. 1968 | битка | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Дак То | нов. 1967 | битка | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Хамбургер хил (планина Ап Биа) | мај 1969 | окршај | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Абу Агеила–Ум Катеф | јун 1967 | битка | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Исмаилија | окт. 1973 | битка | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Султан Јакуб | јун 1982 | окршај | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Опсада Бејрута | јун–авг. 1982 | кампања | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Либан 2006: Бинт Џбеил и претња противтенковским оружјем | јул–авг. 2006 | кампања | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Ал-Фао | феб. 1986 | битка | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Басра (Кербела-5) | јан.–феб. 1987 | битка | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Хафџи | јан.–феб. 1991 | битка | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Циљ Норфолк | 26–27. феб. 1991 | битка | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Медина рит | 27. феб. 1991 | битка | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Финте у вади ал-Батин | феб. 1991 | кампања | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Насирија | мар. 2003 | битка | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Циљ Пич | апр. 2003 | окршај | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Громовити јуриши (Thunder Runs) | апр. 2003 | битка | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Дебеха превој | апр. 2003 | окршај | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Рамади | 2006–07 | кампања | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Садр Сити | мар.–мај 2008 | битка | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Операција Анаконда | мар. 2002 | битка | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Ванат | јул 2008 | окршај | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Камдеш (COP Keating) | окт. 2009 | окршај | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Муса Кала и куће водова | 2006–07 | кампања | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Битка за Алжир | 1956–57 | кампања | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Родезијска ватрена снага | 1974–79 | кампања | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Опсада Сарајева | 1992–96 | кампања | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Грозни 1999–2000 | дец. 1999–феб. 2000 | битка | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Руско-грузијански рат | авг. 2008 | кампања | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Зеленопоље | јул 2014 | окршај | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Иловајск | авг. 2014 | битка | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Дебалцево | јан.–феб. 2015 | битка | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Аеродром Доњецк | сеп. 2014–јан. 2015 | битка | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Аеродром Хостомељ | феб. 2022 | окршај | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Киевски правац и заседа код Бровара | мар. 2022 | окршај | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Мариупољ и Азовстал | феб.–мај 2022 | битка | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Харковски контранапад | сеп. 2022 | кампања | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Прелаз преко Северског Доњца код Билогорвке | мај 2022 | окршај | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Бахмут | авг. 2022–мај 2023 | битка | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Запорошка офанзива | јун–нов. 2023 | кампања | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Рат у Нагорно-Карабаху | сеп.–нов. 2020 | кампања | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Блиц | сеп. 1940–мај 1941 | кампања | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Барбароса: први дан у ваздуху | 22. јун 1941 | битка | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Крит | мај 1941 | битка | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Опсада Малте | 1940–1942 | кампања | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Ваздушни мост за Стаљинград | нов. 1942–феб. 1943 | кампања | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Ваздушне битке над Кубанем | апр.–јун 1943 | кампања | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Курск у ваздуху | јул 1943 | битка | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Операција Багратион у ваздуху | јун–авг. 1944 | кампања | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Плоешти (Операција Таласни удар) | 1. авг. 1943 | окршај | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Рација на бране (Операција Частис) | 16–17. мај 1943 | окршај | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Хамбург (операција Гомора) | јул–авг. 1943 | битка | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Швајнфурт–Регенсбург | 17. авг. 1943 | битка | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Други Швајнфурт („Црни четвртак“) | 14. окт. 1943 | окршај | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Велика недеља (операција Argument) | феб. 1944 | кампања | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Нирнбершка рација | 30–31. мар. 1944 | окршај | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Операција Боденплате | 1. јан. 1945 | битка | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Битка у Бизмарковом мору | мар. 1943 | битка | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Неутралисање Рабаула | 1943–1944 | кампања | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Филипинско море („Мариански лов на ћурке“) | јун 1944 | битка | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Црни уторак изнад Намсија | 23. окт. 1951 | окршај | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Операција Rolling Thunder | 1965–1968 | кампања | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Мост Танх Хоа | 1965–1972 | окршај | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Дивље ласице (Wild Weasels) | 1965–1973 | кампања | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Ултов извештај и Top Gun | 1968–1972 | кампања | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Операција Linebacker | мај–окт. 1972 | кампања | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II („Рат од једанаест дана“) | дец. 1972 | кампања | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Операција Фокус (Moked) | 5. јун 1967 | битка | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Рат на исцрпљивање: појас ракета | 1969–1970 | кампања | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | SAM кишобран над каналом | окт. 1973 | битка | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Осирак (операција Опера) | 7. јун 1981 | окршај | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Операција Ел Дорадо Канјон | 15. апр. 1986 | окршај | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Ваздушни рат Иран–Ирак | 1980–1988 | кампања | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Рације Блек Бак | мај–јун 1982 | окршај | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: планирање ваздушне кампање у Заливу | авг. 1990–јан. 1991 | кампања | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: први удар Апачима | 17. јан. 1991 | окршај | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Велики лов на Скадове | јан.–феб. 1991 | кампања | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Мутла рит („Аутопут смрти“) | 26–27. феб. 1991 | окршај | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Операција Анаконда: Апачи у Шахи Коту | мар. 2002 | битка | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Напад Апачима код Кербеле | 24. мар. 2003 | окршај | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Ваздушна кампања у Либији | мар.–окт. 2011 | кампања | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Нагорно-Карабах: дронови и противваздушна одбрана | сеп.–нов. 2020 | кампања | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Украјина: оспораван ваздушни простор | 2022 | кампања | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Аеродром Хостомељ | феб. 2022 | окршај | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | феб.–мар. 1971 | кампања | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Операција Орлова канџа (Eagle Claw) | апр. 1980 | окршај | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Авганистан: Стингер | 1986–1989 | кампања | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Лепанто | 1571 | битка | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Шпанска армада | 1588 | кампања | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Заљев Киберон | 1759 | битка | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Чесапик (Вирџинија Кејпс) | 1781 | битка | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Нил (заљев Абукир) | 1798 | битка | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Копенхаген | 1801 | битка | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Хемптон Роудс | мар. 1862 | окршај | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Лиса (Вис) | 1866 | битка | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Ялу | 1894 | битка | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Манилски залив | 1898 | битка | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Хелголандски залив | авг. 1914 | битка | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Коронел и Фокланди | нов.–дец. 1914 | кампања | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Доггер Банк | јан. 1915 | битка | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Рио де ла Плата | дец. 1939 | битка | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Таранто | нов. 1940 | окршај | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Рт Матапан | мар. 1941 | битка | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Дански теснац и потапање Бизмарка | мај 1941 | кампања | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Перл Харбор | 7. дец. 1941 | окршај | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Принц од Велса и Репалс | 10. дец. 1941 | окршај | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Јавско море | феб. 1942 | битка | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Корално море | мај 1942 | битка | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Савоо острво | авг. 1942 | битка | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Источна Соломонска острва | авг. 1942 | битка | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Рт Есперанс | окт. 1942 | битка | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Острва Санта Круз | окт. 1942 | битка | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Поморска битка за Гвадалканал | 12–15. нов. 1942 | битка | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Тасафаронга | нов. 1942 | окршај | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Бег кроз Ламанш (Channel Dash) | феб. 1942 | окршај | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Операција Педестал | авг. 1942 | битка | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Црни мај | мај 1943 | кампања | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Нордкап | дец. 1943 | битка | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Амерички подморнички рат против Јапана | 1941–1945 | кампања | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Код Самара | 25. окт. 1944 | битка | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Суригаоски теснац | 25. окт. 1944 | битка | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Окинава: кампања камиказа | апр.–јун 1945 | кампања | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Потапање Ејлата | окт. 1967 | окршај | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Латакија | окт. 1973 | битка | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Потапање Генерала Белграна | 2. мај 1982 | окршај | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Губитак брода HMS Sheffield | 4. мај 1982 | окршај | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. мај 1987 | окршај | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Операција Praying Mantis | 18. апр. 1988 | битка | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | авг. 2004 | окршај | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Бису револуција | мар. 2007 | битка | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil на The International 2013 | авг. 2013 | окршај | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Фејкеров Зед против Рјуа | сеп. 2013 | окршај | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Буст на надвожњаку | нов. 2014 | окршај | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | AWP са скоком на Mirage | апр. 2016 | окршај | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis и ера помоћних средстава | 2018 | кампања | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five против OG | апр. 2019 | битка | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar достиже велемајстора | 2019 | кампања | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Леви удар (копнена офанзива операције Пустињска олуја) | 24–28. феб. 1991 | кампања | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Инцидент Corrupted Blood | сеп. 2005 | кампања | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Дизајн игре и нивоа (17) {#game-and-level-design-17}

| id | назив | обрасци | извори |
|---|---|---|---|
| `design.chokepoint` | Уска грла у дизајну нивоа | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Бочне руте и алтернативни путеви | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Линије видика и растојање ангажовања | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Постављање заклона и ритам | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Дизајн спауна и заштита на спауну | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Симетрична и асиметрична равнотежа мапа | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Равнотежа класа и контре | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Ток, петље и читљиви распореди | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Економије у играма и повратне петље | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Удруживање играча и распон вештине | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI противници као испитивачи нивоа | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Смислена игра и избор | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Размена и тимска игра у шутерима | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Контрола мапе | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Топлотне мапе и просторна телеметрија у дизајну | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Овладавање, учење и забава | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Кружне економије и одлуке о куповини | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Студије (113) {#studies-113}

| id | назив | извори |
|---|---|---|
| `study.engel-1954` | Енгел: Ланчестеров квадратни закон на Ивожими | Engel 1954 |
| `study.bracken-1995` | Брекен: Ланчестерови модели за Ардене | Bracken 1995 |
| `study.fricker-1998` | Фрикер: поново о моделима исцрпљивања за Ардене | Fricker 1998 |
| `study.lucas-turkes-2004` | Лукас и Туркес: Курск и Ардене | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Хартли и Хелмболд: провера квадратног закона | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS анализа смрти играча | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: визуелизација такмичарског понашања | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Вредновање акција у Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Откривање сусрета у е-спорту | Schubert et al. 2016 |
| `study.red-baron` | Пројекат Red Baron: ваздушна борба над Вијетнамом | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Дупи: квантификована процена историјских битака | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Биддл: употреба снага објашњава исходе | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Преглед визуелизације података о игри | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Вилард: Ланчестер наспрам три века копнених битака | Willard 1962; Fain 1977 |
| `study.fain-1977` | Фејн: шездесет ангажовања Другог светског рата | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Вајс: борбени модели и Амерички грађански рат | Weiss 1966 |
| `study.hartley-1995-attrition` | Хартли: статистички модел података о исцрпљивању | Hartley 1995 |
| `study.helmbold-1995` | Хелмболд: брзине напредовања у копненој борби | Helmbold 1995 |
| `study.lucas-dinges-2004` | Лукас и Диндес: околности су важније од закона | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | База података о Курску | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | База података о кампањи у Арденима | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Џонсон и Мекеј: Битка за Британију као Ланчестерови подаци | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Ротте и Шмит: бројеви и даље одлучују битке | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Дупи: правилности губитака у битци | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Дупијев тактички нумерички детерминистички модел | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Лоренс: рат кроз бројеве | Lawrence 2017 |
| `study.vancreveld-1982` | Ван Кревелд: борбена моћ | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Рајтер и Стам: демократије у рату | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Епштајн: адаптивни динамички модел | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Дајчман: Ланчестер и герилско ратовање | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Армстронг: стохастички модел салве | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Хјуз: темељи флотне тактике | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Расправа о правилу 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Крес: моделовање оружаних сукоба | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ултов извештај: ракете испаљене ван своје области | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey (Истраживање ваздушне моћи у Заливском рату) | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Блекетов циркус | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Подешавања дубинских бомби у Приобалној команди (Coastal Command) | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Бели доњи делови авиона против подморница | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Валд: оклоп тамо где авиони који су се вратили нису били погођени | Mangel & Samaniego 1984 |
| `study.optimal-search` | Оптимална претрага: од подморница до AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Глен: борба у паклу | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Приступна забрана и ускраћивање простора | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Како играчи губе интересовање | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Груписање понашања играча у природи | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Откривање фрустрације играча | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: телеметријске табле у производњи | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: визуелна аналитика игре | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Кретање аватара на бојним пољима World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: инструментисање корисничких тестова у великом обиму | Kim et al. 2008 |
| `study.game-data-science` | Наука о подацима у играма | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Вештачка интелигенција и игре | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Вештина и кретање тима у Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Борбени обрасци који предвиђају победе у MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Улоге играча у Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Предвиђање исхода Dota 2 из драфтова | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Предвиђање победе уживо у професионалном е-спорту | Hodge et al. 2021 |
| `study.rioult-2014` | Топологија положаја играча | Rioult et al. 2014 |
| `study.bednarek-2017` | Вредновање играча у тимским шутерима | Bednárek et al. 2017 |
| `study.katona-2019` | Предвиђање ко ће следећи погинути | Katona et al. 2019 |
| `study.block-2018` | Приче засноване на подацима за публику е-спорта | Block et al. 2018 |
| `study.ggviz` | ggViz: претраживање стања игре у великом обиму | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: велико учење с појачањем у Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: ниво велемајстора у StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Очекивана вредност поседа у кошарци | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: вредновање акција са лоптом у фудбалу | Decroos et al. 2019 |
| `study.pitch-control` | Контрола терена и стварање простора | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Просторна структура одбрамбене вештине | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Улоге тимова из података праћења | Lucey et al. 2013 |
| `study.shot-quality` | Очекивани голови и квалитет удараца | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: просторна ефикасност шута | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Просторно-временска анализа тимских спортова | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripleyjeva K-функција: груписање на свакој скали | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Кларк и Еванс: раштрканост по најближем суседу | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord жаришта | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Локални показатељи просторне повезаности | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Просторна статистика скенирања | Kulldorff 1997 |
| `study.kde` | Процена густине језгром | Silverman 1986 |
| `study.knox-1964` | Просторно-временска интеракција | Knox 1964; Diggle 2013 |
| `study.maup` | Проблем променљивих просторних јединица | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Изовисте и графови видљивости | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Синтакса простора | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Средња гужва | Lloyd 1967 |
| `study.survival-analysis` | Анализа преживљавања за време до смрти | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Уопштени линеарни модели за бројеве | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Бутстреп и интервали поуздања | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Токеј и сар.: кашњење и предност онога који искаче | Tokey et al. 2024 |
| `study.lee-chang-2017` | Ли и Чанг: пуцањ иза ћошка | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Клајпул: кашњење и радње играча | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Ксенополус и сар.: професионалци и аматери кроз вероватноћу победе | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Ксенополус и сар.: економске одлуке у Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Мејмин: паметна убиства и бескорисне смрти | Maymin 2021 |
| `study.moba-live-prediction` | Предвиђање исхода уживо у MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Хајакава и сар.: рунде Valorant из тактичких одлика | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Паскив и сар.: улоге у професионалном Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ибрахим и сар.: обука за борбу из блиске даљине | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Турбуленција гомиле на хађу 2006. | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Групе које ходају обликују гомиле | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Хијерархијска динамика група у јатима голубова | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Друштвени утицај чини успех неједнаким и непредвидивим | Salganik et al. 2006 |
| `study.wisdom-undermined` | Друштвени утицај слаби мудрост гомиле | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Привлачна моћ гомиле | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Конформизам према једногласној већини | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: борбена мотивација у Ираку | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Кохезија и учинак: метаанализе | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Аверзија према губитку међу професионалним голферима | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Вруће руке у бејзболу | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Једанаестерци: професионалци играју минимакс | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Минимакс игра на Вимблдону | Walker & Wooders 2001 |
| `study.collective-intelligence` | Колективна интелигенција тимова | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Друштвене мреже једног онлајн света | Szell et al. 2010 |
| `study.team-networks` | Мреже додавања и учинак тима | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Понашање се шири кроз груписане мреже | Centola 2010 |

### Библиографија {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(проверено 2026-11-15: детаљи)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(проверено 2026-11-15: детаљи)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(проверено 2026-11-15: детаљи)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(проверено 2026-11-15: детаљи)*
- Ammianus Marcellinus (прев. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(проверено 2026-11-15: детаљи)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(проверено 2026-11-15: детаљи)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(проверено 2026-11-15: детаљи)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(проверено 2026-11-15: детаљи)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Ardant du Picq, C. (прев. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(проверено 2026-11-15: детаљи)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(проверено 2026-11-15: детаљи)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Arrian (прев. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(проверено 2026-11-15: детаљи)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(проверено 2026-11-15: детаљи)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(проверено 2026-11-15: детаљи)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(проверено 2026-11-15: детаљи)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(проверено 2026-11-15: детаљи)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(проверено 2026-11-15: детаљи)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(проверено 2026-11-15: детаљи)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(проверено 2026-11-15: детаљи)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(проверено 2026-11-15: детаљи)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(проверено 2026-11-15: детаљи)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(проверено 2026-11-15: детаљи)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(проверено 2026-11-15: детаљи)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(проверено 2026-11-15: детаљи)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(проверено 2026-11-15: детаљи)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(проверено 2026-11-15: детаљи)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(проверено 2026-11-15: детаљи)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(проверено 2026-11-15: детаљи)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(проверено 2026-11-15: постојање)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(проверено 2026-11-15: детаљи)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(проверено 2026-11-15: детаљи)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(проверено 2026-11-15: детаљи)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(проверено 2026-11-15: детаљи)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(проверено 2026-11-15: детаљи)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(проверено 2026-11-15: детаљи)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(проверено 2026-11-15: постојање)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(проверено 2026-11-15: детаљи)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(проверено 2026-11-15: детаљи)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(проверено 2026-11-15: детаљи)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(проверено 2026-11-15: детаљи)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(проверено 2026-11-15: детаљи)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(проверено 2026-11-15: детаљи)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(проверено 2026-11-15: постојање)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(проверено 2026-11-15: детаљи)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(проверено 2026-11-15: детаљи)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(проверено 2026-11-15: детаљи)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(проверено 2026-11-15: детаљи)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(проверено 2026-11-15: постојање)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(проверено 2026-11-15: детаљи)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(проверено 2026-11-15: детаљи)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(проверено 2026-11-15: детаљи)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(проверено 2026-11-15: детаљи)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(проверено 2026-11-15: постојање)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(проверено 2026-11-15: детаљи)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(проверено 2026-11-15: детаљи)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(проверено 2026-11-15: детаљи)*
- Caesar, G. J. (прев. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(проверено 2026-11-15: детаљи)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(проверено 2026-11-15: детаљи)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(проверено 2026-11-15: детаљи)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(проверено 2026-11-15: детаљи)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(проверено 2026-11-15: детаљи)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(проверено 2026-11-15: детаљи)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(проверено 2026-11-15: детаљи)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(проверено 2026-11-15: детаљи)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(проверено 2026-11-15: детаљи)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(проверено 2026-11-15: детаљи)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(проверено 2026-11-15: детаљи)*
- Clausewitz, C. von (прев. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(проверено 2026-11-15: детаљи)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(проверено 2026-11-15: детаљи)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(проверено 2026-11-15: детаљи)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(проверено 2026-11-15: детаљи)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(проверено 2026-11-15: детаљи)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(проверено 2026-11-15: детаљи)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(проверено 2026-11-15: детаљи)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(проверено 2026-11-15: постојање)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(проверено 2026-11-15: детаљи)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(проверено 2026-11-15: детаљи)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(проверено 2026-11-15: детаљи)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(проверено 2026-11-15: постојање)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(проверено 2026-11-15: постојање)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(проверено 2026-11-15: детаљи)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(проверено 2026-11-15: детаљи)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(проверено 2026-11-15: детаљи)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(проверено 2026-11-15: постојање)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(проверено 2026-11-15: детаљи)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(проверено 2026-11-15: детаљи)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(проверено 2026-11-15: детаљи)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(проверено 2026-11-15: детаљи)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(проверено 2026-11-15: детаљи)*
- Delbrück, H. (прев. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(проверено 2026-11-15: постојање)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(проверено 2026-11-15: детаљи)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(проверено 2026-11-15: детаљи)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(проверено 2026-11-15: детаљи)*
- Douhet, G. (прев. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(проверено 2026-11-15: детаљи)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(проверено 2026-11-15: детаљи)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(проверено 2026-11-15: детаљи)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(проверено 2026-11-15: детаљи)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(проверено 2026-11-15: постојање)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(проверено 2026-11-15: детаљи)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(проверено 2026-11-15: детаљи)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(проверено 2026-11-15: детаљи)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(проверено 2026-11-15: детаљи)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(проверено 2026-11-15: детаљи)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(проверено 2026-11-15: детаљи)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(проверено 2026-11-15: детаљи)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(проверено 2026-11-15: детаљи)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(проверено 2026-11-15: детаљи)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(проверено 2026-11-15: постојање)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(проверено 2026-11-15: детаљи)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(проверено 2026-11-15: детаљи)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(проверено 2026-11-15: детаљи)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(проверено 2026-11-15: детаљи)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(проверено 2026-11-15: детаљи)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(проверено 2026-11-15: детаљи)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(проверено 2026-11-15: детаљи)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(проверено 2026-11-15: детаљи)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(проверено 2026-11-15: детаљи)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(проверено 2026-11-15: детаљи)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(проверено 2026-11-15: детаљи)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(проверено 2026-11-15: детаљи)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(проверено 2026-11-15: детаљи)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(проверено 2026-11-15: детаљи)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(проверено 2026-11-15: детаљи)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(проверено 2026-11-15: детаљи)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(проверено 2026-11-15: детаљи)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(проверено 2026-11-15: детаљи)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(проверено 2026-11-15: постојање)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(проверено 2026-11-15: детаљи)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(проверено 2026-11-15: детаљи)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(проверено 2026-11-15: детаљи)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(проверено 2026-11-15: детаљи)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(проверено 2026-11-15: детаљи)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(проверено 2026-11-15: детаљи)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(проверено 2026-11-15: детаљи)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(проверено 2026-11-15: детаљи)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(проверено 2026-11-15: детаљи)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(проверено 2026-11-15: детаљи)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(проверено 2026-11-15: детаљи)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(проверено 2026-11-15: детаљи)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(проверено 2026-11-15: детаљи)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(проверено 2026-11-15: детаљи)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(проверено 2026-11-15: детаљи)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(проверено 2026-11-15: детаљи)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(проверено 2026-11-15: детаљи)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(проверено 2026-11-15: детаљи)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(проверено 2026-11-15: детаљи)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(проверено 2026-11-15: детаљи)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(проверено 2026-11-15: детаљи)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(проверено 2026-11-15: детаљи)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(проверено 2026-11-15: детаљи)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(проверено 2026-11-15: детаљи)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(проверено 2026-11-15: детаљи)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(проверено 2026-11-15: детаљи)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(проверено 2026-11-15: детаљи)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(проверено 2026-11-15: детаљи)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(проверено 2026-11-15: детаљи)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(проверено 2026-11-15: детаљи)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(проверено 2026-11-15: детаљи)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(проверено 2026-11-15: детаљи)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(проверено 2026-11-15: детаљи)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(проверено 2026-11-15: детаљи)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(проверено 2026-11-15: детаљи)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(проверено 2026-11-15: детаљи)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(проверено 2026-11-15: детаљи)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(проверено 2026-11-15: детаљи)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(проверено 2026-11-15: детаљи)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(проверено 2026-11-15: детаљи)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(проверено 2026-11-15: детаљи)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(проверено 2026-11-15: детаљи)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(проверено 2026-11-15: детаљи)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(проверено 2026-11-15: детаљи)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(проверено 2026-11-15: детаљи)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(проверено 2026-11-15: детаљи)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(проверено 2026-11-15: детаљи)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(проверено 2026-11-15: детаљи)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(проверено 2026-11-15: постојање)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Herodotus (прев. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(проверено 2026-11-15: детаљи)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(проверено 2026-11-15: детаљи)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(проверено 2026-11-15: детаљи)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(проверено 2026-11-15: детаљи)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(проверено 2026-11-15: детаљи)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(проверено 2026-11-15: детаљи)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(проверено 2026-11-15: детаљи)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(проверено 2026-11-15: детаљи)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(проверено 2026-11-15: детаљи)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(проверено 2026-11-15: детаљи)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(проверено 2026-11-15: детаљи)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(проверено 2026-11-15: детаљи)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(проверено 2026-11-15: детаљи)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(проверено 2026-11-15: детаљи)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(проверено 2026-11-15: детаљи)*
- Isserson, G. S. (прев. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(проверено 2026-11-15: детаљи)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(проверено 2026-11-15: детаљи)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Jomini, A.-H. de (прев. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(проверено 2026-11-15: детаљи)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(проверено 2026-11-15: детаљи)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(проверено 2026-11-15: детаљи)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(проверено 2026-11-15: детаљи)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(проверено 2026-11-15: детаљи)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(проверено 2026-11-15: постојање)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(проверено 2026-11-15: детаљи)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(проверено 2026-11-15: детаљи)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(проверено 2026-11-15: детаљи)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(проверено 2026-11-15: детаљи)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(проверено 2026-11-15: детаљи)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(проверено 2026-11-15: детаљи)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(проверено 2026-11-15: детаљи)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(проверено 2026-11-15: детаљи)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(проверено 2026-11-15: детаљи)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(проверено 2026-11-15: детаљи)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(проверено 2026-11-15: детаљи)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(проверено 2026-11-15: детаљи)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(проверено 2026-11-15: детаљи)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(проверено 2026-11-15: постојање)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(проверено 2026-11-15: детаљи)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(проверено 2026-11-15: детаљи)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(проверено 2026-11-15: детаљи)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(проверено 2026-11-15: детаљи)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(проверено 2026-11-15: детаљи)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(проверено 2026-11-15: детаљи)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(проверено 2026-11-15: детаљи)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(проверено 2026-11-15: детаљи)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(проверено 2026-11-15: детаљи)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(проверено 2026-11-15: детаљи)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(проверено 2026-11-15: постојање)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(проверено 2026-11-15: детаљи)*
- Livy (прев. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(проверено 2026-11-15: детаљи)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(проверено 2026-11-15: детаљи)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(проверено 2026-11-15: детаљи)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(проверено 2026-11-15: детаљи)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(проверено 2026-11-15: постојање)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(проверено 2026-11-15: детаљи)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(проверено 2026-11-15: детаљи)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(проверено 2026-11-15: детаљи)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(проверено 2026-11-15: детаљи)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(проверено 2026-11-15: детаљи)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(проверено 2026-11-15: постојање)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(проверено 2026-11-15: детаљи)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(проверено 2026-11-15: детаљи)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(проверено 2026-11-15: детаљи)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(проверено 2026-11-15: детаљи)*
- Mao Tse-tung (прев. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(проверено 2026-11-15: постојање)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(проверено 2026-11-15: детаљи)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(проверено 2026-11-15: детаљи)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(проверено 2026-11-15: детаљи)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(проверено 2026-11-15: детаљи)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(проверено 2026-11-15: детаљи)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(проверено 2026-11-15: детаљи)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(проверено 2026-11-15: детаљи)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(проверено 2026-11-15: детаљи)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(проверено 2026-11-15: детаљи)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(проверено 2026-11-15: детаљи)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(проверено 2026-11-15: постојање)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(проверено 2026-11-15: детаљи)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(проверено 2026-11-15: детаљи)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(проверено 2026-11-15: детаљи)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(проверено 2026-11-15: детаљи)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(проверено 2026-11-15: детаљи)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(проверено 2026-11-15: детаљи)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(проверено 2026-11-15: детаљи)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(проверено 2026-11-15: детаљи)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(проверено 2026-11-15: детаљи)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(проверено 2026-11-15: детаљи)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(проверено 2026-11-15: постојање)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(проверено 2026-11-15: постојање)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(проверено 2026-11-15: детаљи)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(проверено 2026-11-15: детаљи)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(проверено 2026-11-15: детаљи)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(проверено 2026-11-15: детаљи)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(проверено 2026-11-15: детаљи)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(проверено 2026-11-15: постојање)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(проверено 2026-11-15: постојање)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(проверено 2026-11-15: детаљи)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(проверено 2026-11-15: детаљи)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(проверено 2026-11-15: постојање)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(проверено 2026-11-15: детаљи)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(проверено 2026-11-15: детаљи)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(проверено 2026-11-15: детаљи)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(проверено 2026-11-15: детаљи)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(проверено 2026-11-15: детаљи)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(проверено 2026-11-15: детаљи)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(проверено 2026-11-15: детаљи)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(проверено 2026-11-15: детаљи)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(проверено 2026-11-15: детаљи)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(проверено 2026-11-15: детаљи)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(проверено 2026-11-15: детаљи)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(проверено 2026-11-15: детаљи)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(проверено 2026-11-15: детаљи)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(проверено 2026-11-15: детаљи)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(проверено 2026-11-15: постојање)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(проверено 2026-11-15: детаљи)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(проверено 2026-11-15: детаљи)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(проверено 2026-11-15: детаљи)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(проверено 2026-11-15: детаљи)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(проверено 2026-11-15: детаљи)*
- Osipov, M. (прев. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(проверено 2026-11-15: детаљи)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(проверено 2026-11-15: детаљи)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(проверено 2026-11-15: детаљи)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(проверено 2026-11-15: детаљи)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(проверено 2026-11-15: детаљи)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(проверено 2026-11-15: детаљи)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(проверено 2026-11-15: детаљи)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(проверено 2026-11-15: детаљи)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(проверено 2026-11-15: детаљи)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(проверено 2026-11-15: детаљи)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(проверено 2026-11-15: детаљи)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(проверено 2026-11-15: детаљи)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(проверено 2026-11-15: детаљи)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(проверено 2026-11-15: детаљи)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(проверено 2026-11-15: детаљи)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(проверено 2026-11-15: детаљи)*
- Plutarch (прев. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(проверено 2026-11-15: детаљи)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(проверено 2026-11-15: детаљи)*
- Polybius (прев. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(проверено 2026-11-15: детаљи)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(проверено 2026-11-15: детаљи)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(проверено 2026-11-15: детаљи)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(проверено 2026-11-15: детаљи)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(проверено 2026-11-15: детаљи)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(проверено 2026-11-15: детаљи)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(проверено 2026-11-15: детаљи)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(проверено 2026-11-15: детаљи)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(проверено 2026-11-15: детаљи)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(проверено 2026-11-15: детаљи)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(проверено 2026-11-15: детаљи)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(проверено 2026-11-15: детаљи)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(проверено 2026-11-15: детаљи)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(проверено 2026-11-15: детаљи)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(проверено 2026-11-15: детаљи)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(проверено 2026-11-15: детаљи)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(проверено 2026-11-15: детаљи)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(проверено 2026-11-15: детаљи)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(проверено 2026-11-15: детаљи)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(проверено 2026-11-15: детаљи)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(проверено 2026-11-15: постојање)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(проверено 2026-11-15: постојање)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(проверено 2026-11-15: постојање)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(проверено 2026-11-15: постојање)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(проверено 2026-11-15: детаљи)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(проверено 2026-11-15: детаљи)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(проверено 2026-11-15: детаљи)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(проверено 2026-11-15: детаљи)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(проверено 2026-11-15: детаљи)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(проверено 2026-11-15: детаљи)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(проверено 2026-11-15: детаљи)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(проверено 2026-11-15: детаљи)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(проверено 2026-11-15: постојање)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(проверено 2026-11-15: детаљи)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(проверено 2026-11-15: детаљи)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(проверено 2026-11-15: детаљи)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(проверено 2026-11-15: детаљи)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(проверено 2026-11-15: постојање)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(проверено 2026-11-15: детаљи)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(проверено 2026-11-15: постојање)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(проверено 2026-11-15: детаљи)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(проверено 2026-11-15: детаљи)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(проверено 2026-11-15: детаљи)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(проверено 2026-11-15: детаљи)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(проверено 2026-11-15: постојање)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(проверено 2026-11-15: детаљи)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(проверено 2026-11-15: детаљи)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(проверено 2026-11-15: детаљи)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(проверено 2026-11-15: детаљи)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(проверено 2026-11-15: детаљи)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(проверено 2026-11-15: детаљи)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(проверено 2026-11-15: детаљи)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(проверено 2026-11-15: детаљи)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(проверено 2026-11-15: детаљи)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(проверено 2026-11-15: детаљи)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(проверено 2026-11-15: детаљи)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(проверено 2026-11-15: постојање)*
- Sun Tzu (прев. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(проверено 2026-11-15: детаљи)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(проверено 2026-11-15: детаљи)*
- Tacitus (прев. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(проверено 2026-11-15: детаљи)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(проверено 2026-11-15: детаљи)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(проверено 2026-11-15: детаљи)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(проверено 2026-11-15: детаљи)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(проверено 2026-11-15: детаљи)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(проверено 2026-11-15: детаљи)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(проверено 2026-11-15: детаљи)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(проверено 2026-11-15: детаљи)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(проверено 2026-11-15: детаљи)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(проверено 2026-11-15: детаљи)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(проверено 2026-11-15: детаљи)*
- Triandafillov, V. K. (прев. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(проверено 2026-11-15: детаљи)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(проверено 2026-11-15: детаљи)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(проверено 2026-11-15: детаљи)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(проверено 2026-11-15: детаљи)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(проверено 2026-11-15: детаљи)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(проверено 2026-11-15: детаљи)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(проверено 2026-11-15: детаљи)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(проверено 2026-11-15: постојање)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(проверено 2026-11-15: детаљи)*
- Vegetius (прев. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(јавно доступно)* *(проверено 2026-11-15: постојање)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(проверено 2026-11-15: детаљи)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(проверено 2026-11-15: детаљи)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(проверено 2026-11-15: детаљи)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(проверено 2026-11-15: детаљи)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(проверено 2026-11-15: детаљи)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(проверено 2026-11-15: детаљи)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(проверено 2026-11-15: детаљи)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(проверено 2026-11-15: детаљи)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(проверено 2026-11-15: постојање)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(проверено 2026-11-15: детаљи)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(проверено 2026-11-15: постојање)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(проверено 2026-11-15: постојање)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(проверено 2026-11-15: детаљи)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(проверено 2026-11-15: постојање)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(проверено 2026-11-15: детаљи)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(проверено 2026-11-15: детаљи)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(проверено 2026-11-15: детаљи)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(проверено 2026-11-15: детаљи)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(проверено 2026-11-15: детаљи)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(проверено 2026-11-15: постојање)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(проверено 2026-11-15: детаљи)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(проверено 2026-11-15: детаљи)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(проверено 2026-11-15: детаљи)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(проверено 2026-11-15: детаљи)*
- Xenophon (прев. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(јавно доступно)* *(проверено 2026-11-15: детаљи)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(проверено 2026-11-15: детаљи)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(проверено 2026-11-15: детаљи)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(проверено 2026-11-15: детаљи)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(проверено 2026-11-15: постојање)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(проверено 2026-11-15: детаљи)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(проверено 2026-11-15: постојање)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(проверено 2026-11-15: постојање)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(проверено 2026-11-15: детаљи)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(проверено 2026-11-15: детаљи)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(проверено 2026-11-15: детаљи)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(проверено 2026-11-15: детаљи)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(проверено 2026-11-15: детаљи)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(проверено 2026-11-15: детаљи)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(проверено 2026-11-15: детаљи)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(проверено 2026-11-15: детаљи)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(проверено 2026-11-15: детаљи)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(проверено 2026-11-15: детаљи)*

<!-- kb:end -->
