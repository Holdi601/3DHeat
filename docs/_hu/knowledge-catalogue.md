---
title: "Tudáskatalógus"
parent: "A tudás-lencse"
nav_order: 2
lang: "hu"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Tudásjegyzék

Ez a teljes lista arról, amit a [tudáslencse](knowledge.md) tud: a mintákról, amelyeket keres, az ötletekről, módszerekről, történelmi esetekről és tanulmányokról, amelyeket idéz, valamint a könyvekről és tanulmányokról, amelyek mögöttük állnak. Azonosító alapján keress vele egy bejegyzést, vagy ellenőrizz vele egy forrást.

Ezt az oldalt a `node tools/knowledge-doc.mjs` parancs generálja a tudásbázisból; a jelölők közötti részt ne szerkeszd.

<!-- kb:begin -->

A tudásbázis 579 bejegyzést tartalmaz (135 fogalom, 37 módszer, 277 történelmi eset, 17 tervezési elv, 113 tanulmány), 93 mintát, és 556 hivatkozást idéz.

### Minták (93) {#patterns-93}

| azonosító | család | hogyan néz ki az adatokban |
|---|---|---|
| `concentration` | erő | Az a fél, amelyik egy helyre több egységet visz, a létszámából adódónál nagyobb mértékben nyeri meg azt a helyet. |
| `local-superiority` | erő | Az ölések abban a félben jelennek meg, amelyik a harci hatótávolságon belül többen van, a teljes létszámtól függetlenül. |
| `attrition` | erő | A veszteségek mindkét fél erősségét követik az idő során; a harcot az dönti el, hogy ki fogy ki előbb. |
| `exchange-ratio` | erő | Az ölések és a veszteségek aránya erősen eltér hely, fél vagy osztály szerint. |
| `aimed-fire` | erő | A veszteségek az ellenség létszámával nőnek, a sajátéval nem. |
| `area-fire` | erő | A veszteségek mindkét fél létszámának szorzatával nőnek: a tömörülést büntetik. |
| `defeat-in-detail` | erő | Egy felet darabonként semmisítenek meg, ahogy a részei egyesével érkeznek. |
| `mutual-support` | erő | Egy veszteségre gyorsan válaszol egy közeli csapattárs: cserék lesznek. |
| `combined-arms` | erő | Az osztályok együtt jól teljesítenek, ha az egyik fedezi a másik gyengeségét, egyedül rosszul. |
| `class-counter` | erő | Egy osztály aránytalanul jól szerepel egy bizonyos másik osztály ellen, vagy egy bizonyos helyen. |
| `initiative` | erő | Aki először szerez pontot egy összecsapásban, az általában megnyeri azt. |
| `key-terrain` | terep | Ugyanaz néhány hely dönt a harcokról meccsről meccsre. |
| `fields-of-fire` | terep | Azok a helyek, amelyek messzire ellátnak a terepen, amelyet mások átkelnek, több ölést érnek el. |
| `high-ground` | terep | Az ölések onnan születnek, ahonnan felülről nézik azt a talajt, amelyen az áldozatok állnak. |
| `cover` | terep | Az ölések száma időegységenként csökken ott, ahol a geometria eltakarja a látást és a tüzelést. |
| `open-ground` | terep | Az ölések száma időegységenként nő ott, ahol semmi nem takarja a látást és a tüzelést. |
| `kill-zone` | terep | A halálok ott koncentrálódnak, ahol a mozgást megfigyelt, tűzfedezetű terepre kényszerítik. |
| `chokepoint` | terep | Sok átkelés halad át kevés terepen, és ott veszteségek vannak. |
| `reverse-slope` | terep | Biztonság egy gerinc vagy fal mögött, az ellenség közvetlen látóterén kívül. |
| `safe-ground` | terep | Olyan hely, ahol időt töltenek, de kevesen halnak meg. |
| `obstacle` | terep | Az útvonalak elkerülik az elzárt területet, és néhány sávba szűkülnek. |
| `flank` | mozgás | Egy ritkán használt útvonal több ölést hoz, mint a fő útvonalak. |
| `avenue-of-approach` | mozgás | A mozgás néhány sáv mentén áramlik a területek között. |
| `mobility` | mozgás | A mozgó egységek időegységenként kevesebbet (vagy többet) halnak, mint a lassú vagy álló egységek. |
| `static-exposure` | mozgás | Az álló egységek időegységenként többen halnak meg, mint a mozgók. |
| `interior-lines` | mozgás | Az a fél, amelynek rövid útvonalai vannak a harcai között, gyorsabban tolja el az erőt, mint a másik. |
| `envelopment` | mozgás | Az ölések több irányból érkeznek az egyik fél állására. |
| `ambush` | mozgás | Az útvonalon mozgó egységek gyorsan meghalnak a pozícióban már ott lévő ellenségtől. |
| `spawn-pressure` | idő | Az életek hamar véget érnek, miután egy újraéledési pontnál elkezdődnek. |
| `tempo` | idő | A gyorsabb fél ér a harchoz, és pontot szerez, mielőtt a másik reagálna. |
| `surprise` | idő | A veszteségek hirtelen sorozatban jönnek, mielőtt az áldozatok visszalőnének. |
| `energy-advantage` | légi | A vadászok nagyobb magasságot és sebességet hordoznak, mint áldozataik. |
| `air-superiority` | légi | Az egyik fél repülőgépei többszörösen annyit ölnek, mint amennyit elveszítenek. |
| `sead` | légi | A földi légvédelem sok repülőgépet elvesz, amíg meg nem találják és meg nem semmisítik. |
| `bvr` | légi | Az ölések nagy távolságban történnek, mielőtt az áldozat közelebb érhetne. |
| `fleet-salvo` | tengeri | Az a haderő, amelyik elsőként üt, keveset veszít; a másiknak kevés túlélője marad, hogy válaszoljon. |
| `scouting` | tengeri | Az a fél dönti el az összecsapást, amelyik előbb találja meg a másikat. |
| `urban-close` | városi | Rövid harci távolságok, sok halál sűrű geometria között, lassú tisztítás. |
| `vertical` | városi | Ölések felső emeletekről vagy tetőkről az utcákra. |
| `skill-dispersion` | emberek | Néhány játékos adja a halálok vagy ölések nagy részét. |
| `ai-vs-player` | emberek | Az MI által irányított egységek másként teljesítenek, mint a játékosok ugyanazon a helyen. |
| `balance` | tervezés | A felek, újraéledési pontok vagy osztályok egyenetlen esélyekkel indulnak. |
| `economy` | tervezés | A megszerzett, kifizetett és elveszett erőforrások néhány helyen vagy játékosnál koncentrálódnak. |
| `flow` | tervezés | Ahogy a játékosok mozognak a pályán: körök, sávok, zsákutcák. |
| `sightlines` | tervezés | A hosszú látóvonalak döntik el, hol kezdődnek a harcok és ki nyeri őket. |
| `readability` | tervezés | Olyan halálok, amelyeket a játékosok nem látnak előre: hátulról, látótávolságon kívülről. |
| `formation` | mozgás | Egy fél egységei együtt mozognak felismerhető alakzatban: sor, oszlop, ék, lépcső, doboz. |
| `frontal-assault` | mozgás | Egy csoport egyenesen az ellenségnek rohan, annak frontja ellen. |
| `double-envelopment` | mozgás | Két csoport nagyjából egy időben üt egy ellenséges test mindkét szárnyára. |
| `encirclement` | mozgás | Egy ellenséges csoport körbekerül: a másik fél mindenfelől körülveszi, és kevés kiút marad. |
| `penetration` | mozgás | Egy csoport áthalad az ellenséges vonalon úgy, hogy ellenségek állnak mindkét oldalán. |
| `fire-and-maneuver` | mozgás | A csoport egy része mozog, miközben a többi áll és fedezi, a szerepek váltakoznak. |
| `feint` | mozgás | Egy kis csoport az ellenséget egy helyre vonzza; a fő erőfeszítés kicsivel később máshol üt. |
| `withdrawal` | mozgás | Egy érintkezésben lévő csoport elfordul, és növeli a távolságot az ellenségtől. |
| `pursuit` | mozgás | Egy csoport követ egy távolodó ellenséget, és megtartja vagy csökkenti a távolságot. |
| `defence-in-depth` | terep | A védők több sávban állnak egymás mögött az ellenség előrenyomulási tengelye mentén. |
| `screening` | mozgás | Egy kis elem messze a főteste előtt mozog, és elsőként találkozik az ellenséggel. |
| `dispersion` | erő | Egy fél idővel szétterül; kevesebb egysége osztozik egy helyen. |
| `missile-defence` | légi | A rakétafenyegetés alatt álló repülőgépek a fenyegetést oldalra vagy a farok felé fordítják: crank, notch, drag, pump. |
| `angles-fight` | légi | Közelharc kis sebességen és nagy fordulási sebességen, az orrpozícióért, nem az energiáért vívva. |
| `cap` | légi | A repülőgépek percekig egy rögzített állomás körül keringenek, és az ellenségre várnak. |
| `strike-package` | légi | Különböző szerepű repülőgépek együtt repülnek a célpontig; egyesek a földet támadják, mások fedezik őket. |
| `line-of-battle` | tengeri | A hajók egymás mögött oszlopban haladnak, hogy minden oldalszórásuk tüzelhessen. |
| `crossing-the-t` | tengeri | Egy oszlop átvág az ellenséges oszlop feje előtt: minden ágyúja tüzel, az ellenségé kevés. |
| `fatal-funnel` | városi | A játékosok, akik egy ajtón, szobán vagy szűkületen lépnek be, ott pillanatok alatt sokkal gyakrabban halnak meg, mint máshol. |
| `crossfire` | erő | Azok a tartók, akiknek a tűzvonalai különböző szögekből találkoznak, több párbajt nyernek, mint egyetlen tartó. |
| `peeker-advantage` | idő | Az a játékos, aki látótérbe lép, gyakrabban (vagy ritkábban) nyeri meg a párbajt annál, aki a szöget tartja, mint a fele esetekben. |
| `entry` | idő | Egy kör első ölése nagyrészt eldönti a kört; a belépők helytől és támogatástól függően nyernek vagy veszítenek. |
| `utility-support` | erő | Egy villanás vagy füst közvetlenül a párbaj előtt megváltoztatja, ki nyeri azt. |
| `man-advantage` | erő | A köröket az nyeri, akinek több játékosa maradt életben, és egyes felek az előnyüket átváltják, vagy eldobják. |
| `clutch` | emberek | Az utolsó életben maradt játékosok gyakrabban (vagy ritkábban) nyernek, mint amit a kör állapota megjósol. |
| `action-value` | emberek | Az ölések, cserék, bombák elhelyezése és a segédeszközök eltérő mértékben változtatják meg a győzelem esélyét. |
| `lurk` | mozgás | Egy játékos, aki egyedül messze van a csapattól, más ütemben öl (vagy hal meg), mint a csoport. |
| `rotation` | mozgás | Az dönti el, hogy egy fél megtartja vagy visszafoglalja a helyet, hogy milyen gyorsan tolja játékosait a harchoz vagy a célponthoz. |
| `collective-order` | emberek | Egy fél mozgó egységei sokkal gyakrabban néznek egy irányba, mint amennyit az idővel eltolt saját nyomaik véletlenül mutatnának. |
| `milling` | emberek | Egy fél egységei egy közös középpont körül keringenek: forgás nettó elmozdulás nélkül. |
| `herding` | emberek | Az egységek ugyanúgy hagyják el a helyet, ahogy az előttük járó társuk tette, a hely saját esélyein és az ellenség utánzásán túl. |
| `lane-formation` | emberek | Az ellentétes áramlások külön sávokon maradnak; a mozgás néhány, meccsről meccsre újrahasznált ösvényen koncentrálódik. |
| `crowding` | emberek | A sebesség és az áramlás csökken, ahogy az egységek összetömörülnek; szűkületen át a nagyobb nyomás kevesebbet enged át. |
| `leadership` | emberek | Néhány egység elsőként fordul, és mások néhány másodperccel később másolják az irányukat. |
| `cohesion` | emberek | A csoportjától eltávolodó egységek gyakrabban halnak meg, mint azok, amelyek vele maradnak. |
| `breaking-point` | emberek | Az a fél, amely erejének egy részét elvesztette, abbahagyja a közeledést és visszavonul, a távolságából magyarázhatónál nagyobb mértékben. |
| `panic` | emberek | Hirtelen fenyegetés alatt az egységek szétszóródnak, elmenekülnek vagy megdermednek, és a koordináció felbomlik. |
| `loss-chasing` | emberek | Egy veszteség után az egységek több (vagy kevesebb) kockázatot vállalnak, mint egy nyereség után. |
| `hot-hand` | emberek | A siker gyakrabban követi a sikert, mint ahogy az ugyanazon játékos összekevert sorozatai engedik. |
| `conformity` | emberek | Egy fél tagjai hasonlóan választanak - vásárlásban, felszerelésben, útvonalban -, a saját preferenciájukon túl is. |
| `suppression` | emberek | A beérkező tűz megváltoztatja, hogyan mozognak és lőnek az egységek, még ha nem is öl. |
| `social-loafing` | emberek | Fejenkénti tevékenység csökken, ahogy több csapattárs van jelen. |
| `mixed-strategy` | emberek | Az olyan választások, amelyeknek kiszámíthatatlannak kellene lenniük, mintázatossá válnak: egy lehetőség többet nyer, vagy a választások sorozatokba rendeződnek. |
| `coordination` | emberek | A tagok látható parancs nélkül összehangoltan cselekszenek: szinkron mozgás, időzítés és választások. |
| `contagion` | emberek | Egy állapot egységről egységre terjed érintkezés vagy közelség révén, és átterjed a térképen. |
| `territoriality` | emberek | Az egységek tartják a távolságot egymástól, és a saját területükhöz ragaszkodnak. |
| `interaction-network` | emberek | Akik harcolnak, támogatnak és követnek, olyan hálózatot alkotnak, amelynek csomópontjai, fürtjei és hídjai vannak. |

### Fogalmak (135) {#concepts-135}

| azonosító | cím | területek | minták | források |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchester négyzettörvénye (célzott tűz) | katonai, légi, haditengerészeti, e-sport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchester lineáris törvénye (területi tűz, egy az egy ellen) | katonai, városi, e-sport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Az erő koncentrálása (tömeg) | katonai, légi, haditengerészeti, e-sport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Erőarányok és a 3:1 szabály | katonai | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Veszteségcsere-arány | katonai, légi, e-sport, tervezés | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Harcérték és szorzói | katonai | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | A modern erőalkalmazás rendszere | katonai | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Az OODA-hurok (megfigyel-orientálódik-dönt-cselekszik) | katonai, légi, e-sport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energia-manőverezőképesség-elmélet | légi | energy-advantage, angles-fight, high-ground, mobility | Boyd és mtsai 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Alapvető vadászmanőverek és légi harci manőverezés | légi | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Terepelemzés: OAKOC / KOCOA | katonai, tervezés, városi | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: a küldetés változói | katonai | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Kulcsfontosságú és döntő terep | katonai, tervezés, e-sport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Megfigyelés és tűzmezők | katonai, tervezés, e-sport, városi | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Fedezék és álcázás | katonai, városi, tervezés | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Megközelítési útvonalak és mozgási folyosók | katonai, tervezés | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Szűkületek és szorosok | katonai, tervezés, e-sport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Harcterületek és halálzónák | katonai, városi, tervezés | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Fordított lejtős védelem és takarás | katonai, tervezés | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | A magaslat | katonai, tervezés | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Belső és külső vonalak | katonai | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Megsemmisítés darabonként | katonai, e-sport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Kölcsönös támogatás | katonai, légi, e-sport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos és mtsai 2020 |
| `concept.combined-arms` | Kombinált fegyvernemek | katonai, tervezés | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Lefogás | katonai, városi | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Az ellenséges légvédelem lefogása és megsemmisítése (SEAD/DEAD) | légi, katonai | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Harcászati légi járőrözés és légi fölény | légi | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Látótávolságon túli összecsapás | légi | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | A közvetett megközelítés | katonai, e-sport, tervezés | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Oldalbekerítés és körbezárás | katonai | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Leshelyzet | katonai, e-sport, tervezés | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Mélységi védelem | katonai | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Súrlódás és a köd a harcban | katonai, e-sport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | A támadás csúcspontja | katonai | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Meglepetés | katonai, légi, haditengerészeti, e-sport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Az erő takarékos alkalmazása | katonai, e-sport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Városi terep | városi, katonai, e-sport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Tengeri uralom és a döntő flottacsata | haditengerészeti | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughes szalvó-modellje: elsőként hatékonyan támadni | haditengerészeti, légi | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Keresési és felderítési elmélet | haditengerészeti, légi, katonai | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Hadműveleti kutatás: a hatékonyság mérőszámai | katonai, légi, haditengerészeti, tervezés | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Hadijáték mint elemzés | katonai, tervezés | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manőverharc | katonai, e-sport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Összetartás és az erkölcsi tényező | katonai | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Súlypont | katonai | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Döntő pontok | katonai, e-sport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Hadműveleti vonalak | katonai | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | A megsemmisítés és a kimerítés stratégiái | katonai | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Mélységi harc és mélységi hadműveletek | katonai | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | katonai, légi | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Feladatvezérlés (Auftragstaktik) | katonai, e-sport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Áttörés és kihasználás | katonai | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Tűz és mozgás | katonai, e-sport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Ugrásszerű előrenyomulás fedezettel | katonai, e-sport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Felderítő előretolás és behatolás | katonai, e-sport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | A tartalék | katonai, e-sport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Rugalmas védelem és ellentámadás | katonai | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | A pusztítási lánc (megtalál, rögzít, követ, célra vesz, támad, értékel) | katonai, légi, haditengerészeti | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Felderítési távolság és harci távolság | légi, haditengerészeti, katonai | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Harchatékonyság-érték | katonai, e-sport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Szóródás a csatatéren | katonai, e-sport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Légi támogatás a szárazföldi erőknek | légi, katonai | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Légi lezárás | légi, katonai | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Kísérés kontra vadászseprés | légi | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energiaharc kontra fordulóharc | légi | energy-advantage, initiative | Shaw 1985; Boyd és mtsai 1966 |
| `concept.pursuit-geometry` | Vezető, tiszta és követő üldözés | légi | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | A Thach-cikázás | légi | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Az ujjnégyes és a harci pár | légi | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Létező flotta | haditengerészeti | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | A T átvágása | haditengerészeti, katonai | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoj | haditengerészeti | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Hozzáférés-megtagadás és területmegtagadás | haditengerészeti, légi, katonai | fields-of-fire, sead, avenue-of-approach | Krepinevich és mtsai 2003; Till 2018 |
| `concept.strongpoint` | Erődített pont védelme beépített területen | városi, katonai | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Egérlyukazás és mozgás épületeken át | városi, katonai, tervezés | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Ostrom | katonai, városi | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Gerillaháború | katonai, városi | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Felkelés elleni harc | katonai, városi | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Menedék | katonai, tervezés | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Megtévesztés (maszkirovka) | katonai, e-sport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Információs előny | katonai, e-sport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Gazdaságos körök és erőforrás-tempó | e-sport, tervezés | economy, balance, tempo | Xenopoulos és mtsai 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Mozgási alakzatok: sor, oszlop, ék, lépcső | katonai, e-sport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontális támadás | katonai | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Kettős oldalbekerítés (a csípő) | katonai | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Körbezárás és a bekerítési zsák | katonai | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Áttörés | katonai | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Üldözés | katonai | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Visszavonuló harc: hátrálás, késleltetés és visszavonulás | katonai | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Csel és bemutató akció | katonai, e-sport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Felderítés, őrzés és fedezés a főerő előtt | katonai | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Védekezés rakéta ellen: crank, notch, drag és pump | légi | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd és mtsai 1966 |
| `concept.bvr-formations` | Látótávolságon túli alakzatok: fal, vezető-követő, daráló, csipesz | légi | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | A szögharc és az energiaharc | légi | angles-fight, energy-advantage | Shaw 1985; Boyd és mtsai 1966 |
| `concept.strike-package` | Csapatcsomag és a lefogás sorrendje | légi | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | A csatasor | haditengerészeti | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | A végzetes tölcsér | városi, katonai, e-sport, tervezés | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Helyiségek átvizsgálása: meglepetés, sebesség, irányított erőszak | városi, katonai, e-sport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Uralkodó pontok | városi, katonai, e-sport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Sarkok átvizsgálása: a szeletelés | városi, katonai, e-sport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Keresztüzek és egymásba zárkózó tűzmezők | katonai, városi, e-sport, tervezés | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | A kukkoló előnye | e-sport, tervezés | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey és mtsai 2024; Lee & Chang 2017; Liu és mtsai 2022 |
| `concept.man-advantage` | Létszámelőny kiesési körökben | e-sport, katonai | man-advantage, local-superiority, entry, concentration | Xenopoulos és mtsai 2022; Xenopoulos és mtsai 2020; Makarov és mtsai 2018 |
| `concept.entry-duel` | A belépés és a nyitópárbaj | e-sport, városi | entry, initiative, action-value, tempo | Xenopoulos és mtsai 2020; Xenopoulos és mtsai 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Segédeszköz a belépés előtt: villanás és füst | e-sport, városi, katonai | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos és mtsai 2020 |
| `concept.social-force-model` | Gyalogos mozgás társadalmi erőmodellje | tervezés, városi, katonai | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing és mtsai 2005; Moussaïd és mtsai 2011 |
| `concept.lane-formation` | Sávképződés ellenirányú áramlásban | tervezés, városi | lane-formation, flow, avenue-of-approach | Helbing és mtsai 2005; Helbing & Molnár 1995; Moussaïd és mtsai 2011 |
| `concept.faster-is-slower` | A gyorsabb lassabb | tervezés, városi, katonai | crowding, chokepoint, panic | Helbing és mtsai 2000; Garcimartín és mtsai 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | A tömegek alapdiagramja | tervezés, városi | crowding, flow | Seyfried és mtsai 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Ösvényképződés és kívánt útvonalak | tervezés, katonai | lane-formation, flow, avenue-of-approach, key-terrain | Helbing és mtsai 1997; Helbing és mtsai 2005 |
| `concept.panic-myth` | A pánik ritka: kollektív ellenállóképesség | katonai, városi, tervezés | panic, cohesion, mutual-support | Quarantelli 1954; Drury és mtsai 2009; Helbing és mtsai 2000 |
| `concept.boids` | Boidok: szétválasztás, összehangolás, összetartás | tervezés, katonai | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Rendparaméter és a kollektív mozgás kezdete | tervezés, katonai, légi, haditengerészeti | collective-order, coordination | Vicsek és mtsai 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Raj, körözés és polarizált állapotok | tervezés, katonai, haditengerészeti | milling, collective-order | Couzin és mtsai 2002; Tunstrøm és mtsai 2013 |
| `concept.effective-leadership` | Hatékony vezetés jelzések nélkül | katonai, e-sport, tervezés | leadership, coordination, herding | Couzin és mtsai 2005; Dyer és mtsai 2009; Krause és mtsai 2010 |
| `concept.topological-interaction` | Szomszédok száma szerint, nem távolság szerint | légi, katonai | cohesion, collective-order | Ballerini és mtsai 2008 |
| `concept.swarm-intelligence` | Rajintelligencia | tervezés, e-sport, katonai | coordination, herding, collective-order | Krause és mtsai 2010; Lorenz és mtsai 2011 |
| `concept.information-cascade` | Csordaszellem és információs lavinák | e-sport, tervezés, katonai | herding, conformity | Banerjee 1992; Bikhchandani és mtsai 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Társadalmi lustaság | e-sport, tervezés, katonai | social-loafing, mutual-support | Latané és mtsai 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | A felelősség szétterülése | e-sport, katonai | social-loafing, mutual-support | Darley & Latané 1968; Fischer és mtsai 2011 |
| `concept.primary-group` | Elsődleges csoport összetartása | katonai, e-sport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Törési pontok és veszteségküszöbök | katonai | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Lefogás: amit a tűz a gyilkoláson kívül tesz | katonai, városi | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Félelem és stressz a harci döntésekben | katonai, e-sport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Fulladás nyomás alatt | e-sport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Kilátáselmélet és veszteségkerülés | e-sport, tervezés | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | A nullszaldó és a házpénz-hatás | e-sport | loss-chasing | Thaler & Johnson 1990; Post és mtsai 2008 |
| `concept.tilt` | Tilt | e-sport | loss-chasing, panic | Smith és mtsai 2009 |
| `concept.sunk-cost` | Elsüllyedt költség | e-sport, katonai | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | A forró kéz és tévedése | e-sport | hot-hand, skill-dispersion | Gilovich és mtsai 1985; Bar-Eli és mtsai 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Vegyes stratégiák: kiszámíthatatlanná válni | e-sport, tervezés, katonai | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Közös mentális modellek | e-sport, katonai | coordination, leadership | Mohammed és mtsai 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | A csapatmunka összetevői | e-sport, katonai | coordination, leadership, mutual-support | Salas és mtsai 2005 |
| `concept.virtual-worlds-labs` | Virtuális világok mint viselkedéslaboratóriumok | tervezés, e-sport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee és mtsai 2007 |
| `concept.proxemics-territory` | Személyes tér és terület | tervezés, városi | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee és mtsai 2007 |
| `concept.interaction-networks` | Interakciós hálózatok: csomópontok és gyenge kötések | e-sport, tervezés | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Módszerek (37) {#methods-37}

| azonosító | cím | minták | források |
|---|---|---|---|
| `method.lanchester-fit` | Lanchester-kitevők illesztése összecsapási adatokra | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Veszteségcsere-arány fél és hely szerint | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Helyi erőarány minden ölés pillanatában | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Látómező: látóvonal-alapú tűzmezők | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Fajlagos energia az ölések és halálok idején (légi) | energy-advantage, air-superiority | Boyd és mtsai 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Forrópontok állandósága meccsről meccsre | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Cserearány (kölcsönös támogatás) | mutual-support, defeat-in-detail | Xenopoulos és mtsai 2020; Schubert és mtsai 2016; FM 3-21.8 2007 |
| `method.initiative` | Összecsapások és az első ölés előnye | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert és mtsai 2016; Xenopoulos és mtsai 2020 |
| `method.spatial-autocorrelation` | A halálok térbeli autokorrelációja (Moran I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Arányok a térkép saját alapvonalához, FDR-szabályozással | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | A csatatér hírszerzési előkészítése (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Páros összehasonlító értékelőmodellek (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich és mtsai 2007; Minka és mtsai 2018 |
| `method.win-probability` | Győzelmi valószínűség és cselekvésérték | initiative, economy, skill-dispersion | Xenopoulos és mtsai 2020; Hodge és mtsai 2021; Makarov és mtsai 2018; Cervone és mtsai 2016 |
| `method.space-control` | Térfoglalás és labdairányítás | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Szalvó-egyenlet kapcsolatban álló hajókra illesztve | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Harchatékonysági arány egységóránként, akcióban | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Felderítési és harci távolságok | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Pusztítási lánc időzítése | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Szóródás az ölésrészesedéssel szemben (az erő koncentrálása időben) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Veszteségráta és ölés bevetésenként | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Környerési valószínűség-modell | action-value, man-advantage, entry, clutch | Xenopoulos és mtsai 2022; Lock & Nettleton 2014; Robberechts és mtsai 2021; Brier 1950; Guo és mtsai 2017; Pakdaman Naeini és mtsai 2015 |
| `method.win-probability-added` | Cselekvésérték: hozzáadott győzelmi valószínűség | action-value, entry, utility-support, mutual-support | Xenopoulos és mtsai 2020; Maymin 2021; Fernández és mtsai 2021; Pollard & Reep 1997; Decroos és mtsai 2019 |
| `method.adjusted-plus-minus` | Korrigált plusz-mínusz gerinc-regresszióval (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Zsugorítás: empirikus Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Várható kimenetelek: a várható gólokból a várható párbajokig | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Felállások, rotációk és lesek mérése | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | A tükröződési probléma: másolás vagy közös ok | herding, conformity | Manski 1993 |
| `method.streak-correction` | Sorozatok véges sorozatra vonatkozó korrekcióval | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Polarizációs és körözési rendparaméterek | collective-order, milling | Vicsek és mtsai 1995; Couzin és mtsai 2002; Tunstrøm és mtsai 2013 |
| `method.lagged-heading` | Vezetők időeltolt irányszög-korrelációból | leadership, coordination | Nagy és mtsai 2010; Couzin és mtsai 2005 |
| `method.route-cascade` | Útvonal-kaszkád teszt a csordaszellemre | herding, conformity | Bikhchandani és mtsai 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Sávelkülönítés és ösvény-állandóság | lane-formation, flow | Helbing és mtsai 2005; Helbing és mtsai 1997 |
| `method.straggler-hazard` | Lemaradók kockázata | cohesion, mutual-support, defeat-in-detail | Moussaïd és mtsai 2010; Siebold 2007 |
| `method.breaking-curve` | Törési görbe | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Válasz a beérkező tűzre | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Kockázat egy veszteség vagy nyereség után | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Vásárlási egyetértés (Fleiss-kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Történelmi esetek (277) {#historical-cases-277}

| azonosító | eset | mikor | léptéke | minták | források |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopülai | i. e. 480 | csata | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Szalamisz | i. e. 480 | csata | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathón | i. e. 490 | csata | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | i. e. 371 | csata | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | i. e. 331 | csata | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimenói-tó | i. e. 217 | csata | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | i. e. 216 | csata | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburgi erdő | i. sz. 9 | csata | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | csata | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingi híd | 1297 | csata | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | csata | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | csata | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | csata | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | csata | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | csata | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye-magaslat | 1862 | összecsapás | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | összecsapás | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickett-roham | 1863 | összecsapás | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | csata | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | összecsapás | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | hadjárat | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | A Somme, az első nap | 1916. július 1. | csata | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | hadjárat | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jütland | 1916 | csata | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939–40 | csata | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan és az Ardennek | 1940 május | hadjárat | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Arrasi ellentámadás | 1940. május 21. | összecsapás | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Britanniai csata | 1940 júl.–okt. | hadjárat | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Atlanti csata: a konvojok hadműveleti kutatása | 1939–45 | hadjárat | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | 1942 június | csata | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Második El-Alamein | 1942 okt.–nov. | csata | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine-szoros | 1943 febr. | csata | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Sztálingrád | 1942 aug.–1943 febr. | hadjárat | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kurszk | 1943 július | hadjárat | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prohorovka | 1943. július 12. | összecsapás | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 1944. június 13. | összecsapás | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandiai sövénysorok | 1944 jún.–júl. | hadjárat | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Cobra hadművelet | 1944 július | hadjárat | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte-öböl | 1944 okt. | csata | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | 1944 dec. | csata | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Cuzsima | 1905 május | csata | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Incheon | 1950 szept. | hadjárat | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG-folyosó | 1950–53 | hadjárat | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | csata | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | 1965 nov. | összecsapás | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Bolo hadművelet | 1967. január 2. | összecsapás | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golán: a könnyek völgye | 1973 okt. | csata | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sínai: a kínai farm | 1973 okt. | csata | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa-völgy (Mole Cricket 19 hadművelet) | 1982 június | csata | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Falkland-szigeteki légi háború | 1982 máj.–jún. | hadjárat | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | A Sivatagi Vihar légi hadjárata | 1991 jan.–febr. | hadjárat | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 1991. február 26. | összecsapás | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadiscio | 1993 okt. | összecsapás | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Groznij | 1994 dec.–1995 febr. | csata | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | 1968 jan.–márc. | csata | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Koszovói légi hadjárat | 1999 márc.–jún. | hadjárat | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallúdzsa (Al Fajr hadművelet) | 2004 nov. | csata | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Moszul | 2016–17 | hadjárat | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesz | i. e. kb. 1274 | csata | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | i. e. 333 | csata | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | i. e. 202 | csata | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | i. e. 53 | csata | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsalus | i. e. 48 | csata | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopolisz | i. sz. 378 | csata | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmúk | i. sz. 636 | csata | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | csata | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattín | 1187 | csata | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | csata | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | csata | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | csata | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | csata | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | csata | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | csata | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | csata | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | csata | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | hadjárat | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | csata | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena–Auerstedt | 1806 | csata | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Boroggyino | 1812 | csata | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Lipcse | 1813 | csata | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | csata | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | csata | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | hadjárat | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | csata | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |

| `case.sedan-1870` | Sedan | 1870 | csata | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | csata | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | csata | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | összecsapás | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | hadjárat | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | 1917 nov. | csata | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | 1917 okt.–nov. | hadjárat | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | A német tavaszi offenzíva (Michael hadművelet) | 1918 márc.–ápr. | hadjárat | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | 1918 aug. | csata | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Halhin-gol (Nomonhan) | 1939 aug. | csata | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | A lengyel hadjárat | 1939 szept. | hadjárat | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut és Gembloux | 1940 máj. | csata | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | 1940 máj. | összecsapás | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | A dunkerque-i kerület | 1940 máj.–jún. | hadjárat | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Compass hadművelet és Beda Fomm | 1940 dec.–1941 febr. | hadjárat | mobility, flank, tempo, exchange-ratio | Playfair és mtsai 1954 |
| `case.crusader` | Crusader hadművelet és Szidi Rezegh | 1941 nov.–dec. | hadjárat | defeat-in-detail, combined-arms, attrition, concentration | Playfair és mtsai 1960 |
| `case.gazala` | Gazala | 1942 máj.–jún. | csata | flank, defeat-in-detail, mutual-support, obstacle | Playfair és mtsai 1960 |
| `case.alam-halfa` | Alam Halfa | 1942 aug.–szept. | csata | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno–Brody | 1941 jún. | csata | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | A kijevi bekerítés | 1941 szept. | hadjárat | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moszkva | 1941 okt.–1942 jan. | hadjárat | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzsev és a Mars hadművelet | 1942 | hadjárat | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Második Harkov | 1942 máj. | csata | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Harmadik Harkov (Manstein visszavágó csapása) | 1943 febr.–márc. | hadjárat | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Bagration hadművelet | 1944 jún.–aug. | hadjárat | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | A korszun-cserkaszi zsák | 1944 jan.–febr. | csata | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | A kamenyec-podolszki zsák | 1944 márc.–ápr. | hadjárat | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Epsom hadművelet | 1944 június | csata | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Goodwood hadművelet | 1944 július | csata | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Totalize hadművelet | 1944 aug. | csata | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | 1944 aug. | csata | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | A falaise-i zsák | 1944 aug. | hadjárat | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden és Arnhem | 1944 szept. | hadjárat | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | 1944 okt. | csata | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgeni erdő | 1944 szept.–1945 febr. | hadjárat | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | 1944 szept. | csata | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | 1944 dec. | csata | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborni gerinc | 1944 dec. | csata | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow-magaslatok | 1945 ápr. | csata | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | 1945 ápr.–máj. | csata | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Tavaszi ébredés hadművelet | 1945 márc. | csata | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | 1943 dec. | csata | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | A varsói felkelés | 1944 aug.–okt. | hadjárat | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | 1943 nov. | csata | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | 1944 szept.–nov. | csata | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | 1945 febr.–márc. | csata | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinava | 1945 ápr.–jún. | hadjárat | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman és mtsai 1948 |
| `case.manila-1945` | Manila | 1945 febr.–márc. | csata | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandzsúria (Augusztusi vihar) | 1945 aug. | hadjárat | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | A pusani kerület | 1950 aug.–szept. | hadjárat | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Csosin-víztározó | 1950 nov.–dec. | hadjárat | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjin-folyó | 1951 ápr. | csata | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapjong | 1951 ápr. | csata | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop-domb | 1951 ápr. és 1953 júl. | összecsapás | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | 1968 jan.–ápr. | csata | high-ground, attrition, air-superiority, key-terrain | Shulimson és mtsai 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | 1967 nov. | csata | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia-hegy) | 1969 máj. | összecsapás | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila–Um Katef | 1967 jún. | csata | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Iszmailia | 1973 okt. | csata | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Szultan Jakub | 1982 jún. | összecsapás | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Bejrút ostroma | 1982 jún.–aug. | hadjárat | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Dzsbeil és a páncélelhárító fenyegetés | 2006 júl.–aug. | hadjárat | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | 1986 febr. | csata | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala–5) | 1987 jan.–febr. | csata | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafdzsi | 1991 jan.–febr. | csata | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Norfolk célpont | 1991. február 26–27. | csata | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina-gerinc | 1991. február 27. | csata | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | A Wadi al-Batin-i csalások | 1991 febr. | hadjárat | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nászirija | 2003 márc. | csata | ambush, urban-close, avenue-of-approach, readability | Fontenot és mtsai 2004; Reynolds 2005 |
| `case.objective-peach` | Peach célpont | 2003 ápr. | összecsapás | key-terrain, chokepoint, exchange-ratio | Fontenot és mtsai 2004 |
| `case.thunder-runs` | A Thunder Runs | 2003 ápr. | csata | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot és mtsai 2004 |
| `case.debecka-pass` | A Debecka-szoros | 2003 ápr. | összecsapás | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramádi | 2006–07 | hadjárat | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Szadr City | 2008 márc.–máj. | csata | obstacle, scouting, urban-close, air-superiority | Johnson és mtsai 2013 |
| `case.anaconda` | Anaconda hadművelet | 2002 márc. | csata | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | 2008 júl. | összecsapás | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | 2009 okt. | összecsapás | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala és a szakaszházak | 2006–07 | hadjárat | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Algíri csata | 1956–57 | hadjárat | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | A rhodesiai Fireforce | 1974–79 | hadjárat | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Szarajevó ostroma | 1992–96 | hadjárat | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Groznij 1999–2000 | 1999 dec.–2000 febr. | csata | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Orosz–grúz háború | 2008 aug. | hadjárat | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | 2014 júl. | összecsapás | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovajszk | 2014 aug. | csata | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debalcevo | 2015 jan.–febr. | csata | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | A donyecki repülőtér | 2014 szept.–2015 jan. | csata | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | A Hosztomeli repülőtér | 2022 febr. | összecsapás | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi és mtsai 2022; Watling & Reynolds 2022 |
| `case.brovary` | A kijevi tengely és a brovari lesállás | 2022 márc. | összecsapás | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi és mtsai 2022 |
| `case.mariupol` | Mariupol és az Azovsztal | 2022 febr.–máj. | csata | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | A harkivi ellentámadás | 2022 szept. | hadjárat | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | A Szeverszkij-Donyec-átkelés Bilohorivkánál | 2022 máj. | összecsapás | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi és mtsai 2022 |
| `case.bakhmut` | Bahmut | 2022 aug.–2023 máj. | csata | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | A zaporizzsjai offenzíva | 2023 jún.–nov. | hadjárat | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | A Hegyi-Karabahi háború | 2020 szept.–nov. | hadjárat | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | A londoni Blitz | 1940 szept.–1941 máj. | hadjárat | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: az első nap a levegőben | 1941. június 22. | csata | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kréta | 1941 máj. | csata | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Málta ostroma | 1940–1942 | hadjárat | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | A sztálingrádi légihíd | 1942 nov.–1943 febr. | hadjárat | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Légi csaták a Kubanyon | 1943 ápr.–jún. | hadjárat | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kurszk a levegőben | 1943 július | csata | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Bagration hadművelet a levegőben | 1944 jún.–aug. | hadjárat | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Tidal Wave hadművelet) | 1943. augusztus 1. | összecsapás | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | A gátrajtaütés (Chastise hadművelet) | 1943. május 16–17. | összecsapás | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (Gomorrha hadművelet) | 1943 júl.–aug. | csata | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt–Regensburg | 1943. augusztus 17. | csata | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Második Schweinfurt ("Fekete csütörtök") | 1943. október 14. | összecsapás | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Argument hadművelet) | 1944 febr. | hadjárat | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | A nürnbergi rajtaütés | 1944. március 30–31. | összecsapás | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Bodenplatte hadművelet | 1945. január 1. | csata | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | A Bismarck-tengeri csata | 1943 márc. | csata | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Rabaul semlegesítése | 1943–44 | hadjárat | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Fülöp-tengeri csata ("Marianas Turkey Shoot") | 1944 jún. | csata | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Fekete kedd Namsi felett | 1951. október 23. | összecsapás | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Rolling Thunder hadművelet | 1965–68 | hadjárat | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | A Thanh Hoa-híd | 1965–72 | összecsapás | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | A Wild Weasels | 1965–73 | hadjárat | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Az Ault-jelentés és a Top Gun | 1968–72 | hadjárat | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Linebacker hadművelet | 1972 máj.–okt. | hadjárat | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II (a "tizenegy napos háború") | 1972 dec. | hadjárat | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Focus hadművelet (Moked) | 1967. június 5. | csata | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | A kimerítő háború: a rakétaöv | 1969–70 | hadjárat | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | A SAM-ernyő a csatorna felett | 1973 okt. | csata | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Opera hadművelet) | 1981. június 7. | összecsapás | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | El Dorado Canyon hadművelet | 1986. április 15. | összecsapás | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Az iráni–iraki légi háború | 1980–88 | hadjárat | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Buck-rajtaütések | 1982 máj.–jún. | összecsapás | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: az öböl-háborús légi hadjárat tervezése | 1990 aug.–1991 jan. | hadjárat | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Normandy Hadcsoport: az első Apache-csapás | 1991. január 17. | összecsapás | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | A nagy Scud-vadászat | 1991 jan.–febr. | hadjárat | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla-gerinc ("A halál autópályája") | 1991. február 26–27. | összecsapás | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Anaconda hadművelet: Apache-k a Sahi-Kotban | 2002 márc. | csata | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | A karbalai Apache-támadás | 2003. március 24. | összecsapás | ambush, kill-zone, urban-close, readability | Fontenot és mtsai 2004 |
| `case.libya-2011` | A líbiai légi hadjárat | 2011 márc.–okt. | hadjárat | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Hegyi-Karabah: drónok és légvédelem | 2020 szept.–nov. | hadjárat | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukrajna: a vitatott levegő | 2022 | hadjárat | sead, mobility, air-superiority, static-exposure | Bronk és mtsai 2022 |
| `case.hostomel-2022` | A Hosztomeli repülőtér | 2022 febr. | összecsapás | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | 1971 febr.–márc. | hadjárat | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Eagle Claw hadművelet | 1980 ápr. | összecsapás | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afganisztán: a Stinger | 1986–89 | hadjárat | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | csata | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | A spanyol Armada | 1588 | hadjárat | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberon-öböl | 1759 | csata | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | A Chesapeake (Virginia Capes) | 1781 | csata | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | A Nílus (Aboukir-öböl) | 1798 | csata | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Koppenhága | 1801 | csata | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | 1862 márc. | összecsapás | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Visz | 1866 | csata | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | A Jalu | 1894 | csata | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manila-öböl | 1898 | csata | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgoland-öböl | 1914 aug. | csata | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel és a Falkland-szigetek | 1914 nov.–dec. | hadjárat | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | 1915 jan. | csata | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | A La Plata-folyó | 1939 dec. | csata | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | 1940 nov. | összecsapás | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Matapan-fok | 1941 márc. | csata | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | A Dán-szoros és a Bismarck elsüllyesztése | 1941 máj. | hadjárat | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 1941. december 7. | összecsapás | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales és Repulse | 1941. december 10. | összecsapás | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | A Jáva-tenger | 1942 febr. | csata | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | A Korall-tenger | 1942 máj. | csata | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo-sziget | 1942 aug. | csata | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | A Keleti Salamon-szigetek | 1942 aug. | csata | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Esperance-fok | 1942 okt. | csata | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruz-szigetek | 1942 okt. | csata | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Guadalcanali tengeri csata | 1942. november 12–15. | csata | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | 1942 nov. | összecsapás | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | A Csatorna-rohanás | 1942 febr. | összecsapás | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Pedestal hadművelet | 1942 aug. | csata | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Fekete május | 1943 máj. | hadjárat | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Északi-fok | 1943 dec. | csata | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Az amerikai tengeralattjáró-hadjárat Japán ellen | 1941–45 | hadjárat | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Samar mellett | 1944. október 25. | csata | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigao-szoros | 1944. október 25. | csata | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinava: a kamikaze-hadjárat | 1945 ápr.–jún. | hadjárat | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Az Eilat elsüllyesztése | 1967 okt. | összecsapás | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | 1973 okt. | csata | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | A General Belgrano elsüllyesztése | 1982. május 2. | összecsapás | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | A HMS Sheffield elvesztése | 1982. május 4. | összecsapás | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 1987. május 17. | összecsapás | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Praying Mantis hadművelet | 1988. április 18. | csata | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | 2004 aug. | összecsapás | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | A Bisu-forradalom | 2007 márc. | csata | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | A Dream Coil a The International 2013-on | 2013 aug. | összecsapás | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker Zedje Ryu ellen | 2013 szept. | összecsapás | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Az Overpass-ugrás | 2014 nov. | összecsapás | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Ugró AWP a Miragen | 2016 ápr. | összecsapás | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Az Astralis és a segédeszközök kora | 2018 | hadjárat | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | Az OpenAI Five az OG ellen | 2019 ápr. | csata | ai-vs-player, tempo, concentration | Berner és mtsai 2019 |
| `case.alphastar-2019` | Az AlphaStar eléri a nagymester szintet | 2019 | hadjárat | ai-vs-player, skill-dispersion | Vinyals és mtsai 2019 |
| `case.desert-storm-left-hook` | A bal horog (Sivatagi Vihar szárazföldi támadás) | 1991. február 24–28. | hadjárat | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | A Corrupted Blood-eset | 2005 szept. | hadjárat | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Játéktervezés (17) {#game-and-level-design-17}

| azonosító | cím | minták | források |
|---|---|---|---|
| `design.chokepoint` | Szűkületek a pályatervezésben | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Oldalútvonalak és alternatív utak | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Látóvonalak és harci távolság | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Fedezékek elhelyezése és ritmusa | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Újraéledési pontok tervezése és védelme | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Szimmetrikus és aszimmetrikus pályák egyensúlya | balance, exchange-ratio, key-terrain | Elias és mtsai 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Osztályok egyensúlya és ellenszerei | class-counter, balance, combined-arms | Sirlin 2006; Elias és mtsai 2012; Adams & Dormans 2012 |
| `design.flow` | Áramlás, körök és olvasható elrendezések | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander és mtsai 1977; Csikszentmihalyi 1990 |
| `design.economy` | Játékgazdaságok és visszacsatoló körök | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Párosítás és a készségek szórása | skill-dispersion, balance | Herbrich és mtsai 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | MI-ellenfelek mint pályavizsgálók | ai-vs-player, readability | Seif El-Nasr és mtsai 2013; Drachen és mtsai 2009 |
| `design.meaningful-play` | Értelmes játék és döntés | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Cserék és csapatjáték lövöldözős játékokban | mutual-support, initiative | Xenopoulos és mtsai 2020; Schubert és mtsai 2016 |
| `design.map-control` | Pályairányítás | key-terrain, local-superiority, flow | Xenopoulos és mtsai 2022; Rioult és mtsai 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Hőtérképek és térbeli telemetria a tervezésben | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler és mtsai 2004; Kim és mtsai 2008; Bowman és mtsai 2012 |
| `design.fun-mastery` | Elsajátítás, tanulás és szórakozás | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Körgazdaságok és vásárlási döntések | conformity, economy, coordination, mixed-strategy | Xenopoulos és mtsai 2020; Fleiss 1971 |

### Tanulmányok (113) {#studies-113}

| azonosító | cím | források |
|---|---|---|
| `study.engel-1954` | Engel: Lanchester négyzettörvénye Iwo Jimánál | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchester-modellek az Ardennekről | Bracken 1995 |
| `study.fricker-1998` | Fricker: az Ardennek kimerülési modelljei újragondolva | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas és Turkes: Kurszk és az Ardennek | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley és Helmbold: a négyzettörvény validálása | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Játékoshalálok GIS-elemzése | Drachen & Canossa 2009; Seif El-Nasr és mtsai 2013 |
| `study.hoobler-2004` | Lighthouse: a versenyző viselkedés megjelenítése | Hoobler és mtsai 2004 |
| `study.xenopoulos-2020` | Cselekvések értékelése a Counter-Strike-ban | Xenopoulos és mtsai 2020 |
| `study.schubert-2016` | Találkozásfelismerés e-sportban | Schubert és mtsai 2016 |
| `study.red-baron` | Project Red Baron: légi harc Vietnám felett | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: történelmi csaták számszerűsített megítélése | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: az erőalkalmazás magyarázza az eredményeket | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Áttekintés a játékadat-vizualizációról | Wallner & Kriglstein 2013; Bowman és mtsai 2012 |
| `study.willard-1962` | Willard: Lanchester három évszázad szárazföldi csatáival szemben | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: hatvan második világháborús összecsapás | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: harcmodellek és az amerikai polgárháború | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: a kimerülési adatok statisztikai modellje | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: az előrenyomulás üteme szárazföldi harcban | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas és Dinges: a körülmények fontosabbak a törvénynél | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | A kurszki adatbázis | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Az ardenneki hadjárat adatbázisa | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson és MacKay: a Britanniai csata mint Lanchester-adat | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte és Schmidt: a számok még mindig megnyerik a csatákat | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: a harci veszteségek szabályszerűségei | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy taktikai numerikus determinisztikus modellje | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: háború számokban | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: harci erő | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter és Stam: demokráciák háborúban | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: az adaptív dinamikus modell | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester és a gerillaháború | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: a sztochasztikus szalvó-modell | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: a flottataktika sarokkövei | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | A 3:1 szabály vitája | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: fegyveres konfliktusok modellezése | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Az Ault-jelentés: rakéták kilőve a hatókörükön kívül | Ault 1969; Michel 1997 |
| `study.gwaps` | Öböl-háborús légi hatalmi felmérés | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackett cirkusza | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | A mélységi töltések beállításai a Parti Parancsnokságon | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Fehér hasak a tengeralattjáró-elhárító repülőgépeken | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: páncél oda, ahol a visszatérő bombázókat nem találták el | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimális keresés: a tengeralattjáróktól az AF447-ig | Stone 1975; Stone és mtsai 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: harc a pokolban | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Hozzáférés-megtagadás és területmegtagadás | Krepinevich és mtsai 2003 |
| `study.bauckhage-2012` | Hogyan veszítik el a játékosok az érdeklődésüket | Bauckhage és mtsai 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Játékosviselkedés csoportosítása a valóságban | Drachen és mtsai 2012; Drachen és mtsai 2009 |
| `study.canossa-2011` | Játékosi frusztráció felismerése | Canossa és mtsai 2011 |
| `study.medler-2011` | Data Cracker: telemetriai műszerfalak éles használatban | Medler és mtsai 2011 |
| `study.wallner-kriglstein-2014` | PLATO: játékmenet vizuális elemzése | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Avatarok mozgása a World of Warcraft csatatereken | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: felhasználói tesztek műszerezése nagy léptékben | Kim és mtsai 2008 |
| `study.game-data-science` | Játékadat-tudomány | Seif El-Nasr és mtsai 2021; Seif El-Nasr és mtsai 2013 |
| `study.ai-and-games` | Mesterséges intelligencia és játékok | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Készség és csapatmozgás a Dota 2-ben | Drachen és mtsai 2014 |
| `study.yang-2014` | Harci minták, amelyek megjósolják a MOBA-győzelmeket | Yang és mtsai 2014; Schubert és mtsai 2016 |
| `study.eggert-2015` | Játékosszerepek a Dota 2-ben | Eggert és mtsai 2015 |
| `study.semenov-2017` | Dota 2 kimenetelek megjóslása a draftból | Semenov és mtsai 2017; Makarov és mtsai 2018 |
| `study.hodge-2021` | Élő győzelemvalószínűség-előrejelzés profi e-sportban | Hodge és mtsai 2021 |
| `study.rioult-2014` | Játékosi pozíciók topológiája | Rioult és mtsai 2014 |
| `study.bednarek-2017` | Játékosok értékelése csapatalapú lövöldözőkben | Bednárek és mtsai 2017 |
| `study.katona-2019` | Megjósolni, ki hal meg következőként | Katona és mtsai 2019 |
| `study.block-2018` | Adatvezérelt történetek az e-sport-közönségnek | Block és mtsai 2018 |
| `study.ggviz` | ggViz: játékállapotok keresése nagy léptékben | Xenopoulos és mtsai 2022 |
| `study.openai-five` | OpenAI Five: nagyléptékű megerősítéses tanulás a Dota 2-ben | Berner és mtsai 2019 |
| `study.alphastar` | AlphaStar: nagymesteri szint a StarCraft II-ben | Vinyals és mtsai 2019 |
| `study.cervone-2016` | Várható birtoklási érték kosárlabdában | Cervone és mtsai 2016 |
| `study.decroos-2019` | VAEP: a labdás cselekvések értékelése futballban | Decroos és mtsai 2019 |
| `study.pitch-control` | Pályairányítás és térteremtés | Spearman 2018; Fernández & Bornn 2018; Taki és mtsai 1996 |
| `study.franks-2015` | A védekező készség térbeli szerkezete | Franks és mtsai 2015; Miller és mtsai 2014 |
| `study.lucey-2013` | Csapatszerepek követési adatokból | Lucey és mtsai 2013 |
| `study.shot-quality` | Várható gólok és a lövés minősége | Decroos és mtsai 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: térbeli lövési hatékonyság | Goldsberry 2012; Miller és mtsai 2014 |
| `study.team-sports-survey` | Csapatsportok téridő-elemzése | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley K: csoportosulás minden léptékben | Ripley 1977; Baddeley és mtsai 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark és Evans: legközelebbi szomszéd szóródása | Clark & Evans 1954 |
| `study.getis-ord` | Getis–Ord forrópontok | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Helyi térbeli kapcsolat-mutatók | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | A térbeli szkennelési statisztika | Kulldorff 1997 |
| `study.kde` | Magfüggvényes sűrűségbecslés | Silverman 1986 |
| `study.knox-1964` | Tér-idő kölcsönhatás | Knox 1964; Diggle 2013 |
| `study.maup` | A módosítható területi egység problémája | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izovisztek és láthatósági gráfok | Benedikt 1979; Turner és mtsai 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Térszintaxis | Hillier & Hanson 1984; Turner és mtsai 2001 |
| `study.mean-crowding` | Átlagos tömörülés | Lloyd 1967 |
| `study.survival-analysis` | Túlélésanalízis a halálig eltelt időre | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Általánosított lineáris modellek számokra | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap és intervallumbecslések | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey és mtsai: késleltetés és a kukkoló előnye | Tokey és mtsai 2024 |
| `study.lee-chang-2017` | Lee és Chang: lövés a sarok mögül | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: késleltetés és a játékosok cselekvései | Claypool & Claypool 2006; Liu és mtsai 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos és mtsai: profik és amatőrök a győzelemvalószínűségen át | Xenopoulos és mtsai 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos és mtsai: gazdasági döntések a Counter-Strike-ban | Xenopoulos és mtsai 2021 |
| `study.maymin-2021` | Maymin: okos ölések és értéktelen halálok | Maymin 2021 |
| `study.moba-live-prediction` | Élő kimenetel-előrejelzés MOBA-kban | Yang és mtsai 2017; Silva és mtsai 2018 |
| `study.hayakawa-2025` | Hayakawa és mtsai: Valorant-körök taktikai jellemzőkből | Hayakawa és mtsai 2025 |
| `study.paskiv-2026` | Paskiv és mtsai: szerepek a profi Counter-Strike 2-ben | Paskiv és mtsai 2026 |
| `study.ibrahim-2024` | Ibrahim és mtsai: közelharci csatázás képzése | Ibrahim és mtsai 2024 |
| `study.crowd-turbulence` | Tömegturbulencia a 2006-os hadzsin | Helbing és mtsai 2007; Moussaïd és mtsai 2011 |
| `study.walking-groups` | A gyalogos csoportok alakítják a tömeget | Moussaïd és mtsai 2010 |
| `study.pigeon-hierarchy` | Hierarchikus csoportdinamika galambrajokban | Nagy és mtsai 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | A társadalmi befolyás egyenlőtlenné és kiszámíthatatlanná teszi a sikert | Salganik és mtsai 2006 |
| `study.wisdom-undermined` | A társadalmi befolyás aláássa a tömeg bölcsességét | Lorenz és mtsai 2011 |
| `study.drawing-power-of-crowds` | A tömeg vonzereje | Milgram és mtsai 1969; Gallup és mtsai 2012 |
| `study.asch-conformity` | Megfelelés egyhangú többségnek | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: harci motiváció Irakban | Wong és mtsai 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Összetartás és teljesítmény: metaelemzések | Mullen & Copper 1994; Beal és mtsai 2003 |
| `study.loss-averse-golfers` | Veszteségkerülés profi golfozók körében | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Forró kéz a baseballban | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Büntetők: a profik minimax-játékot játszanak | Chiappori és mtsai 2002; Palacios-Huerta 2003; Bar-Eli és mtsai 2007 |
| `study.minimax-wimbledon` | Minimax játék Wimbledonban | Walker & Wooders 2001 |
| `study.collective-intelligence` | Csapatok kollektív intelligenciája | Woolley és mtsai 2010; Kim és mtsai 2017 |
| `study.online-world-networks` | Egy online világ társadalmi hálózatai | Szell és mtsai 2010 |
| `study.team-networks` | Passzhálózatok és csapatteljesítmény | Duch és mtsai 2010; Grund 2012 |
| `study.complex-contagion` | A viselkedés klaszterezett hálózatokon terjed | Centola 2010 |

### Irodalomjegyzék {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(ellenőrizve 2026-11-15: részletek)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(ellenőrizve 2026-11-15: részletek)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(ellenőrizve 2026-11-15: részletek)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(ellenőrizve 2026-11-15: részletek)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(ellenőrizve 2026-11-15: részletek)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(ellenőrizve 2026-11-15: részletek)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(ellenőrizve 2026-11-15: részletek)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(ellenőrizve 2026-11-15: részletek)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(ellenőrizve 2026-11-15: részletek)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(ellenőrizve 2026-11-15: részletek)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(ellenőrizve 2026-11-15: részletek)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(ellenőrizve 2026-11-15: részletek)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(ellenőrizve 2026-11-15: részletek)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(ellenőrizve 2026-11-15: részletek)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(ellenőrizve 2026-11-15: részletek)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(ellenőrizve 2026-11-15: részletek)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(ellenőrizve 2026-11-15: részletek)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(ellenőrizve 2026-11-15: részletek)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(ellenőrizve 2026-11-15: részletek)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(ellenőrizve 2026-11-15: részletek)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(ellenőrizve 2026-11-15: részletek)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(ellenőrizve 2026-11-15: részletek)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(ellenőrizve 2026-11-15: részletek)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(ellenőrizve 2026-11-15: részletek)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(ellenőrizve 2026-11-15: létezés)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(ellenőrizve 2026-11-15: részletek)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(ellenőrizve 2026-11-15: részletek)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(ellenőrizve 2026-11-15: részletek)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(ellenőrizve 2026-11-15: részletek)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(ellenőrizve 2026-11-15: részletek)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(ellenőrizve 2026-11-15: részletek)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(ellenőrizve 2026-11-15: létezés)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(ellenőrizve 2026-11-15: részletek)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(ellenőrizve 2026-11-15: részletek)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(ellenőrizve 2026-11-15: részletek)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(ellenőrizve 2026-11-15: részletek)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(ellenőrizve 2026-11-15: részletek)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(ellenőrizve 2026-11-15: részletek)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(ellenőrizve 2026-11-15: létezés)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(ellenőrizve 2026-11-15: részletek)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(ellenőrizve 2026-11-15: részletek)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(ellenőrizve 2026-11-15: létezés)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(ellenőrizve 2026-11-15: részletek)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(ellenőrizve 2026-11-15: részletek)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(ellenőrizve 2026-11-15: részletek)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(ellenőrizve 2026-11-15: részletek)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(ellenőrizve 2026-11-15: létezés)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(ellenőrizve 2026-11-15: részletek)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(ellenőrizve 2026-11-15: részletek)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(ellenőrizve 2026-11-15: részletek)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(ellenőrizve 2026-11-15: részletek)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(ellenőrizve 2026-11-15: részletek)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(ellenőrizve 2026-11-15: részletek)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(ellenőrizve 2026-11-15: részletek)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(ellenőrizve 2026-11-15: részletek)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(ellenőrizve 2026-11-15: részletek)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(ellenőrizve 2026-11-15: részletek)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(ellenőrizve 2026-11-15: részletek)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(ellenőrizve 2026-11-15: részletek)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(ellenőrizve 2026-11-15: részletek)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(ellenőrizve 2026-11-15: részletek)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(ellenőrizve 2026-11-15: részletek)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(ellenőrizve 2026-11-15: részletek)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(ellenőrizve 2026-11-15: részletek)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(ellenőrizve 2026-11-15: részletek)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(ellenőrizve 2026-11-15: részletek)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(ellenőrizve 2026-11-15: részletek)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(ellenőrizve 2026-11-15: létezés)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(ellenőrizve 2026-11-15: részletek)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(ellenőrizve 2026-11-15: részletek)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(ellenőrizve 2026-11-15: részletek)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(ellenőrizve 2026-11-15: létezés)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(ellenőrizve 2026-11-15: létezés)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(ellenőrizve 2026-11-15: részletek)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(ellenőrizve 2026-11-15: részletek)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(ellenőrizve 2026-11-15: részletek)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(ellenőrizve 2026-11-15: létezés)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(ellenőrizve 2026-11-15: részletek)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(ellenőrizve 2026-11-15: részletek)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(ellenőrizve 2026-11-15: részletek)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(ellenőrizve 2026-11-15: részletek)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(ellenőrizve 2026-11-15: részletek)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(ellenőrizve 2026-11-15: létezés)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(ellenőrizve 2026-11-15: részletek)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(ellenőrizve 2026-11-15: részletek)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(ellenőrizve 2026-11-15: részletek)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(ellenőrizve 2026-11-15: részletek)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(ellenőrizve 2026-11-15: részletek)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(ellenőrizve 2026-11-15: részletek)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(ellenőrizve 2026-11-15: részletek)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(ellenőrizve 2026-11-15: létezés)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(ellenőrizve 2026-11-15: részletek)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(ellenőrizve 2026-11-15: részletek)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(ellenőrizve 2026-11-15: részletek)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(ellenőrizve 2026-11-15: részletek)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(ellenőrizve 2026-11-15: részletek)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(ellenőrizve 2026-11-15: részletek)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(ellenőrizve 2026-11-15: részletek)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(ellenőrizve 2026-11-15: részletek)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(ellenőrizve 2026-11-15: részletek)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(ellenőrizve 2026-11-15: létezés)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(ellenőrizve 2026-11-15: részletek)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(ellenőrizve 2026-11-15: részletek)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(ellenőrizve 2026-11-15: részletek)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(ellenőrizve 2026-11-15: részletek)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(ellenőrizve 2026-11-15: részletek)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(ellenőrizve 2026-11-15: részletek)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(ellenőrizve 2026-11-15: részletek)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(ellenőrizve 2026-11-15: részletek)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(ellenőrizve 2026-11-15: részletek)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(ellenőrizve 2026-11-15: részletek)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(ellenőrizve 2026-11-15: részletek)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(ellenőrizve 2026-11-15: részletek)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(ellenőrizve 2026-11-15: részletek)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(ellenőrizve 2026-11-15: részletek)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(ellenőrizve 2026-11-15: részletek)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(ellenőrizve 2026-11-15: részletek)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(ellenőrizve 2026-11-15: részletek)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(ellenőrizve 2026-11-15: részletek)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(ellenőrizve 2026-11-15: létezés)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(ellenőrizve 2026-11-15: részletek)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(ellenőrizve 2026-11-15: részletek)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(ellenőrizve 2026-11-15: részletek)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(ellenőrizve 2026-11-15: részletek)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(ellenőrizve 2026-11-15: részletek)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(ellenőrizve 2026-11-15: részletek)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(ellenőrizve 2026-11-15: részletek)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(ellenőrizve 2026-11-15: részletek)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(ellenőrizve 2026-11-15: részletek)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(ellenőrizve 2026-11-15: részletek)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(ellenőrizve 2026-11-15: részletek)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(ellenőrizve 2026-11-15: részletek)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(ellenőrizve 2026-11-15: részletek)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(ellenőrizve 2026-11-15: részletek)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(ellenőrizve 2026-11-15: részletek)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(ellenőrizve 2026-11-15: részletek)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(ellenőrizve 2026-11-15: részletek)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(ellenőrizve 2026-11-15: részletek)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(ellenőrizve 2026-11-15: részletek)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(ellenőrizve 2026-11-15: részletek)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(ellenőrizve 2026-11-15: részletek)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(ellenőrizve 2026-11-15: részletek)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(ellenőrizve 2026-11-15: részletek)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(ellenőrizve 2026-11-15: részletek)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(ellenőrizve 2026-11-15: részletek)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(ellenőrizve 2026-11-15: részletek)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(ellenőrizve 2026-11-15: részletek)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(ellenőrizve 2026-11-15: részletek)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(ellenőrizve 2026-11-15: részletek)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(ellenőrizve 2026-11-15: részletek)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(ellenőrizve 2026-11-15: részletek)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(ellenőrizve 2026-11-15: részletek)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(ellenőrizve 2026-11-15: részletek)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(ellenőrizve 2026-11-15: részletek)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(ellenőrizve 2026-11-15: részletek)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(ellenőrizve 2026-11-15: részletek)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(ellenőrizve 2026-11-15: részletek)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(ellenőrizve 2026-11-15: részletek)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(ellenőrizve 2026-11-15: részletek)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(ellenőrizve 2026-11-15: részletek)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(ellenőrizve 2026-11-15: részletek)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(ellenőrizve 2026-11-15: részletek)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(ellenőrizve 2026-11-15: részletek)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(ellenőrizve 2026-11-15: részletek)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(ellenőrizve 2026-11-15: részletek)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(ellenőrizve 2026-11-15: részletek)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(ellenőrizve 2026-11-15: részletek)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(ellenőrizve 2026-11-15: részletek)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(ellenőrizve 2026-11-15: létezés)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(ellenőrizve 2026-11-15: részletek)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(ellenőrizve 2026-11-15: részletek)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(ellenőrizve 2026-11-15: részletek)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(ellenőrizve 2026-11-15: részletek)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(ellenőrizve 2026-11-15: részletek)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(ellenőrizve 2026-11-15: részletek)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(ellenőrizve 2026-11-15: részletek)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(ellenőrizve 2026-11-15: részletek)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(ellenőrizve 2026-11-15: részletek)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(ellenőrizve 2026-11-15: részletek)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(ellenőrizve 2026-11-15: részletek)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(ellenőrizve 2026-11-15: részletek)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(ellenőrizve 2026-11-15: részletek)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(ellenőrizve 2026-11-15: részletek)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(ellenőrizve 2026-11-15: részletek)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(ellenőrizve 2026-11-15: részletek)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(ellenőrizve 2026-11-15: részletek)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(ellenőrizve 2026-11-15: részletek)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(ellenőrizve 2026-11-15: részletek)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(ellenőrizve 2026-11-15: részletek)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(ellenőrizve 2026-11-15: részletek)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(ellenőrizve 2026-11-15: részletek)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(ellenőrizve 2026-11-15: létezés)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(ellenőrizve 2026-11-15: részletek)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(ellenőrizve 2026-11-15: részletek)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(ellenőrizve 2026-11-15: részletek)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(ellenőrizve 2026-11-15: részletek)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(ellenőrizve 2026-11-15: részletek)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(ellenőrizve 2026-11-15: részletek)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(ellenőrizve 2026-11-15: részletek)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(ellenőrizve 2026-11-15: részletek)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(ellenőrizve 2026-11-15: részletek)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(ellenőrizve 2026-11-15: részletek)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(ellenőrizve 2026-11-15: részletek)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(ellenőrizve 2026-11-15: részletek)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(ellenőrizve 2026-11-15: részletek)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(ellenőrizve 2026-11-15: létezés)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(ellenőrizve 2026-11-15: részletek)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(ellenőrizve 2026-11-15: részletek)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(ellenőrizve 2026-11-15: részletek)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(ellenőrizve 2026-11-15: részletek)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(ellenőrizve 2026-11-15: részletek)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(ellenőrizve 2026-11-15: részletek)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(ellenőrizve 2026-11-15: részletek)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(ellenőrizve 2026-11-15: részletek)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(ellenőrizve 2026-11-15: részletek)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(ellenőrizve 2026-11-15: részletek)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(ellenőrizve 2026-11-15: létezés)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(ellenőrizve 2026-11-15: részletek)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(ellenőrizve 2026-11-15: részletek)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(ellenőrizve 2026-11-15: részletek)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(ellenőrizve 2026-11-15: részletek)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(ellenőrizve 2026-11-15: részletek)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(ellenőrizve 2026-11-15: létezés)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(ellenőrizve 2026-11-15: részletek)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(ellenőrizve 2026-11-15: részletek)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(ellenőrizve 2026-11-15: részletek)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(ellenőrizve 2026-11-15: részletek)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(ellenőrizve 2026-11-15: részletek)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(ellenőrizve 2026-11-15: létezés)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(ellenőrizve 2026-11-15: részletek)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(ellenőrizve 2026-11-15: részletek)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(ellenőrizve 2026-11-15: részletek)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(ellenőrizve 2026-11-15: részletek)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(ellenőrizve 2026-11-15: létezés)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(ellenőrizve 2026-11-15: részletek)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(ellenőrizve 2026-11-15: részletek)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(ellenőrizve 2026-11-15: részletek)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(ellenőrizve 2026-11-15: részletek)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(ellenőrizve 2026-11-15: részletek)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(ellenőrizve 2026-11-15: részletek)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(ellenőrizve 2026-11-15: részletek)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(ellenőrizve 2026-11-15: részletek)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(ellenőrizve 2026-11-15: részletek)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(ellenőrizve 2026-11-15: részletek)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(ellenőrizve 2026-11-15: létezés)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(ellenőrizve 2026-11-15: részletek)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(ellenőrizve 2026-11-15: részletek)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(ellenőrizve 2026-11-15: részletek)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(ellenőrizve 2026-11-15: részletek)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(ellenőrizve 2026-11-15: részletek)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(ellenőrizve 2026-11-15: részletek)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(ellenőrizve 2026-11-15: részletek)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(ellenőrizve 2026-11-15: részletek)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(ellenőrizve 2026-11-15: részletek)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(ellenőrizve 2026-11-15: létezés)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(ellenőrizve 2026-11-15: létezés)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(ellenőrizve 2026-11-15: részletek)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(ellenőrizve 2026-11-15: részletek)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(ellenőrizve 2026-11-15: részletek)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(ellenőrizve 2026-11-15: részletek)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(ellenőrizve 2026-11-15: létezés)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(ellenőrizve 2026-11-15: létezés)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(ellenőrizve 2026-11-15: létezés)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(ellenőrizve 2026-11-15: részletek)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(ellenőrizve 2026-11-15: részletek)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(ellenőrizve 2026-11-15: részletek)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(ellenőrizve 2026-11-15: részletek)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(ellenőrizve 2026-11-15: részletek)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(ellenőrizve 2026-11-15: részletek)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(ellenőrizve 2026-11-15: részletek)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(ellenőrizve 2026-11-15: részletek)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(ellenőrizve 2026-11-15: részletek)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(ellenőrizve 2026-11-15: részletek)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(ellenőrizve 2026-11-15: részletek)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(ellenőrizve 2026-11-15: részletek)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(ellenőrizve 2026-11-15: részletek)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(ellenőrizve 2026-11-15: létezés)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(ellenőrizve 2026-11-15: részletek)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(ellenőrizve 2026-11-15: részletek)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(ellenőrizve 2026-11-15: részletek)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(ellenőrizve 2026-11-15: részletek)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(ellenőrizve 2026-11-15: részletek)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(ellenőrizve 2026-11-15: részletek)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(ellenőrizve 2026-11-15: részletek)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(ellenőrizve 2026-11-15: részletek)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(ellenőrizve 2026-11-15: részletek)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(ellenőrizve 2026-11-15: részletek)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(ellenőrizve 2026-11-15: részletek)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(ellenőrizve 2026-11-15: részletek)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(ellenőrizve 2026-11-15: részletek)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(ellenőrizve 2026-11-15: részletek)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(ellenőrizve 2026-11-15: részletek)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(ellenőrizve 2026-11-15: részletek)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(ellenőrizve 2026-11-15: részletek)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(ellenőrizve 2026-11-15: részletek)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(ellenőrizve 2026-11-15: részletek)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(ellenőrizve 2026-11-15: részletek)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(ellenőrizve 2026-11-15: részletek)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(ellenőrizve 2026-11-15: részletek)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(ellenőrizve 2026-11-15: részletek)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(ellenőrizve 2026-11-15: részletek)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(ellenőrizve 2026-11-15: részletek)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(ellenőrizve 2026-11-15: részletek)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(ellenőrizve 2026-11-15: részletek)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(ellenőrizve 2026-11-15: részletek)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(ellenőrizve 2026-11-15: részletek)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(ellenőrizve 2026-11-15: részletek)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(ellenőrizve 2026-11-15: részletek)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(ellenőrizve 2026-11-15: részletek)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(ellenőrizve 2026-11-15: részletek)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(ellenőrizve 2026-11-15: részletek)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(ellenőrizve 2026-11-15: részletek)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(ellenőrizve 2026-11-15: részletek)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(ellenőrizve 2026-11-15: részletek)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(ellenőrizve 2026-11-15: részletek)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(ellenőrizve 2026-11-15: részletek)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(ellenőrizve 2026-11-15: részletek)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(ellenőrizve 2026-11-15: részletek)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(ellenőrizve 2026-11-15: létezés)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(ellenőrizve 2026-11-15: létezés)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(ellenőrizve 2026-11-15: létezés)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(ellenőrizve 2026-11-15: létezés)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(ellenőrizve 2026-11-15: részletek)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(ellenőrizve 2026-11-15: részletek)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(ellenőrizve 2026-11-15: részletek)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(ellenőrizve 2026-11-15: részletek)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(ellenőrizve 2026-11-15: részletek)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(ellenőrizve 2026-11-15: részletek)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(ellenőrizve 2026-11-15: részletek)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(ellenőrizve 2026-11-15: részletek)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(ellenőrizve 2026-11-15: létezés)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(ellenőrizve 2026-11-15: részletek)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(ellenőrizve 2026-11-15: részletek)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(ellenőrizve 2026-11-15: részletek)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(ellenőrizve 2026-11-15: részletek)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(ellenőrizve 2026-11-15: létezés)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(ellenőrizve 2026-11-15: részletek)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(ellenőrizve 2026-11-15: létezés)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(ellenőrizve 2026-11-15: részletek)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(ellenőrizve 2026-11-15: részletek)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(ellenőrizve 2026-11-15: részletek)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(ellenőrizve 2026-11-15: részletek)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(ellenőrizve 2026-11-15: létezés)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(ellenőrizve 2026-11-15: részletek)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(ellenőrizve 2026-11-15: részletek)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(ellenőrizve 2026-11-15: részletek)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(ellenőrizve 2026-11-15: részletek)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(ellenőrizve 2026-11-15: részletek)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(ellenőrizve 2026-11-15: részletek)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(ellenőrizve 2026-11-15: részletek)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(ellenőrizve 2026-11-15: részletek)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(ellenőrizve 2026-11-15: részletek)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(ellenőrizve 2026-11-15: részletek)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(ellenőrizve 2026-11-15: létezés)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(ellenőrizve 2026-11-15: részletek)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(ellenőrizve 2026-11-15: részletek)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(ellenőrizve 2026-11-15: részletek)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(ellenőrizve 2026-11-15: részletek)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(ellenőrizve 2026-11-15: részletek)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(ellenőrizve 2026-11-15: részletek)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(ellenőrizve 2026-11-15: részletek)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(ellenőrizve 2026-11-15: részletek)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(ellenőrizve 2026-11-15: részletek)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(ellenőrizve 2026-11-15: részletek)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(ellenőrizve 2026-11-15: részletek)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(ellenőrizve 2026-11-15: részletek)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(ellenőrizve 2026-11-15: részletek)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(ellenőrizve 2026-11-15: részletek)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(ellenőrizve 2026-11-15: részletek)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(ellenőrizve 2026-11-15: részletek)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(ellenőrizve 2026-11-15: részletek)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(ellenőrizve 2026-11-15: részletek)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(ellenőrizve 2026-11-15: részletek)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(ellenőrizve 2026-11-15: részletek)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(ellenőrizve 2026-11-15: létezés)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(ellenőrizve 2026-11-15: részletek)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(közkincs)* *(ellenőrizve 2026-11-15: létezés)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(ellenőrizve 2026-11-15: részletek)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(ellenőrizve 2026-11-15: részletek)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(ellenőrizve 2026-11-15: részletek)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(ellenőrizve 2026-11-15: részletek)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(ellenőrizve 2026-11-15: részletek)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(ellenőrizve 2026-11-15: részletek)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(ellenőrizve 2026-11-15: részletek)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(ellenőrizve 2026-11-15: létezés)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(ellenőrizve 2026-11-15: részletek)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(ellenőrizve 2026-11-15: létezés)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(ellenőrizve 2026-11-15: létezés)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(ellenőrizve 2026-11-15: részletek)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(ellenőrizve 2026-11-15: létezés)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(ellenőrizve 2026-11-15: részletek)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(ellenőrizve 2026-11-15: részletek)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(ellenőrizve 2026-11-15: részletek)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(ellenőrizve 2026-11-15: részletek)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(ellenőrizve 2026-11-15: részletek)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(ellenőrizve 2026-11-15: létezés)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(ellenőrizve 2026-11-15: részletek)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: részletek)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(ellenőrizve 2026-11-15: részletek)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(ellenőrizve 2026-11-15: részletek)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(közkincs)* *(ellenőrizve 2026-11-15: részletek)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(ellenőrizve 2026-11-15: részletek)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(ellenőrizve 2026-11-15: részletek)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(ellenőrizve 2026-11-15: részletek)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(ellenőrizve 2026-11-15: létezés)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(ellenőrizve 2026-11-15: részletek)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(ellenőrizve 2026-11-15: létezés)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(ellenőrizve 2026-11-15: létezés)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(ellenőrizve 2026-11-15: részletek)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(ellenőrizve 2026-11-15: részletek)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(ellenőrizve 2026-11-15: részletek)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(ellenőrizve 2026-11-15: részletek)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(ellenőrizve 2026-11-15: részletek)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(ellenőrizve 2026-11-15: részletek)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(ellenőrizve 2026-11-15: részletek)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(ellenőrizve 2026-11-15: részletek)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(ellenőrizve 2026-11-15: részletek)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(ellenőrizve 2026-11-15: részletek)*

<!-- kb:end -->
