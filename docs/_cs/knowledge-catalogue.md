---
title: "Katalog znalostí"
parent: "Čočka znalostí"
nav_order: 2
lang: "cs"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Katalog znalostí

Toto je úplný seznam všeho, co zná [čočka znalostí](knowledge.md): vzorce, které hledá, nápady, metody, historické případy a studie, které cituje, a knihy a články, na kterých to celé stojí. Použijte jej k vyhledání položky podle jejího id nebo k ověření zdroje.

Tato stránka se vytváří ze znalostní databáze příkazem `node tools/knowledge-doc.mjs`; mezi značkami neupravujte.

<!-- kb:begin -->

Znalostní databáze obsahuje 579 položek (135 pojmů, 37 metod, 277 historických případů, 17 principů návrhu, 113 studií) u 93 vzorců a odkazuje na 556 zdrojů.

### Vzorce (93) {#patterns-93}

| id | rodina | jak to vypadá v datech |
|---|---|---|
| `concentration` | síla | Strana, která přivede na jedno místo více jednotek, ovládne to místo s větší převahou, než odpovídá jen jejich počtu. |
| `local-superiority` | síla | Zabití připadají té straně, která má v dosahu boje převahu, bez ohledu na celkové počty. |
| `attrition` | síla | Ztráty sledují síly obou stran v čase; boj rozhodne, kdo dřív dojde na konec. |
| `exchange-ratio` | síla | Počet zabití na jednu ztrátu se výrazně liší podle místa, strany nebo třídy. |
| `aimed-fire` | síla | Ztráty rostou s počtem nepřítele, ale ne s počtem vlastních jednotek. |
| `area-fire` | síla | Ztráty rostou se součinem počtů obou stran: tlačenice je trestána. |
| `defeat-in-detail` | síla | Strana je zničena po částech, jak její díly přicházejí jeden po druhém. |
| `mutual-support` | síla | Na ztrátu rychle odpoví blízký spoluhráč: výměna. |
| `combined-arms` | síla | Třídy si vedou dobře společně, když jedna kryje slabinu druhé, a špatně samy. |
| `class-counter` | síla | Jedna třída vyhrává nepřiměřeně často proti určité jiné třídě nebo na určitém místě. |
| `initiative` | síla | Kdo první zasáhne v boji, ten jej obvykle vyhraje. |
| `key-terrain` | terén | Stejných několik míst rozhoduje boje zápas za zápasem. |
| `fields-of-fire` | terén | Místa, která daleko vidí přes terén, který musí ostatní přejít, získávají více zabití. |
| `high-ground` | terén | Zabití se dělají shora, z terénu výše než ten, na kterém stojí oběti. |
| `cover` | terén | Úmrtí za čas klesají tam, kde geometrie brání výhledu a palbě. |
| `open-ground` | terén | Úmrtí za čas rostou tam, kde nic nebrání výhledu a palbě. |
| `kill-zone` | terén | Úmrtí se soustředí tam, kde je pohyb nucen vést přes pozorovaný terén kryty palbou. |
| `chokepoint` | terén | Mnoho přechodů projde úzkým místem a ztráty jsou právě tam. |
| `reverse-slope` | terén | Bezpečí těsně za hřbetem nebo zdí, mimo přímý výhled nepřítele. |
| `safe-ground` | terén | Místo, kde se stráví čas, ale umírá se málo. |
| `obstacle` | terén | Trasy se obcházejí překážkami a vedou do několika úzkých pruhů. |
| `flank` | pohyb | Málo používaná trasa vede k většímu počtu zabití než hlavní trasy. |
| `avenue-of-approach` | pohyb | Pohyb teče podél několika pruhů mezi oblastmi. |
| `mobility` | pohyb | Pohybující se jednotky umírají za čas méně (nebo více) než pomalé nebo stojící. |
| `static-exposure` | pohyb | Jednotky, které stojí, umírají za čas více než ty, které se pohybují. |
| `interior-lines` | pohyb | Strana s krátkými trasami mezi svými boji mění sílu rychleji než druhá. |
| `envelopment` | pohyb | Zabití přicházejí z několika směrů na pozici jedné strany. |
| `ambush` | pohyb | Jednotky, které se pohybují po trase, rychle umírají na nepřátele, kteří už jsou na místě. |
| `spawn-pressure` | čas | Životy skončí brzy poté, co začnou na jednom místě oživení. |
| `tempo` | čas | Rychlejší strana se dostane do boje dřív a zasáhne dřív, než druhá zareaguje. |
| `surprise` | čas | Ztráty přicházejí v náhlé dávce dřív, než oběti stihnou vrátit palbu. |
| `energy-advantage` | vzduch | Zabíjející mají větší výšku a rychlost než jejich oběti. |
| `air-superiority` | vzduch | Letadla jedné strany zabijí mnohonásobně více, než sama ztratí. |
| `sead` | vzduch | Pozemní protivzdušná obrana sebere mnoho letadel, dokud není nalezena a zničena. |
| `bvr` | vzduch | Zabití se dějí na velké vzdálenosti, dřív než se oběť může přiblížit. |
| `fleet-salvo` | moře | Síla, která udeří první, ztratí málo; druhá málo přežije, aby mohla odpovědět. |
| `scouting` | moře | Strana, která najde druhou dřív, si vybere boj. |
| `urban-close` | městské prostředí | Krátké dosahy boje, mnoho úmrtí mezi hustou zástavbou a pomalé čištění. |
| `vertical` | městské prostředí | Zabití z horních pater nebo střech do ulic. |
| `skill-dispersion` | lidé | Několik hráčů tvoří velký podíl na zabitích nebo úmrtích. |
| `ai-vs-player` | lidé | Jednotky řízené AI si na stejném místě vedou jinak než hráči. |
| `balance` | návrh | Strany, oživení nebo třídy začínají s nerovnými šancemi. |
| `economy` | návrh | Zdroje, které se získají, zaplatí a ztratí, se soustředí na několik míst nebo hráčů. |
| `flow` | návrh | Jak se hráči pohybují úrovní: smyčky, pruhy, slepé uličky. |
| `sightlines` | návrh | Dlouhé zorné linie rozhodují, kde boje začnou a kdo je vyhraje. |
| `readability` | návrh | Úmrtí, která hráči nevidí přicházet: zezadu, z místa mimo výhled. |
| `formation` | pohyb | Jednotky jedné strany se pohybují spolu v rozpoznatelném tvaru: řada, kolona, klín, šikmá řada, čtverec. |
| `frontal-assault` | pohyb | Skupina se přiblíží k nepříteli přímo proti jeho čelu. |
| `double-envelopment` | pohyb | Dvě skupiny udeří zhruba ve stejnou chvíli na oba boky jednoho nepřátelského tělesa. |
| `encirclement` | pohyb | Nepřátelská skupina se ocitne obklíčena druhou stranou ze všech stran a má málo únikových cest. |
| `penetration` | pohyb | Skupina projde nepřátelskou linií tam, kde nepřátelé stojí na obou jejích stranách. |
| `fire-and-maneuver` | pohyb | Část skupiny se pohybuje, zatímco zbytek stojí a kryje ji; role se střídají. |
| `feint` | pohyb | Malá skupina přiláká nepřítele na jedno místo; hlavní úsilí udeří jinde krátce poté. |
| `withdrawal` | pohyb | Skupina ve styku se otočí a zvětší vzdálenost od nepřítele. |
| `pursuit` | pohyb | Skupina pronásleduje nepřítele, který uteče, a udržuje nebo zkracuje vzdálenost. |
| `defence-in-depth` | terén | Obránci stojí v několika pásmech za sebou podél osy postupu nepřítele. |
| `screening` | pohyb | Malý oddíl se pohybuje daleko před svým hlavním tělesem a s nepřítelem se střetne jako první. |
| `dispersion` | síla | Strana se v čase rozptyluje; méně jejích jednotek sdílí jedno místo. |
| `missile-defence` | vzduch | Letadla pod hrozbou střely otáčejí hrozbu k boku nebo ocasu: crank, notch, drag, pump. |
| `angles-fight` | vzduch | Souboj na blízko při nízké rychlosti a velkém úhlu zatáčení, který se bojuje o pozici nosu, ne o energii. |
| `cap` | vzduch | Letadla krouží minuty kolem pevného stanoviště a čekají, až nepřítel přijde. |
| `strike-package` | vzduch | Letadla různých rolí letí k cíli společně; některá útočí na zem, jiná je kryjí. |
| `line-of-battle` | moře | Lodě pluly v kolóně jedna za druhou, aby všechny boky mohly střílet. |
| `crossing-the-t` | moře | Kolona projde přes příď nepřátelské kolony: všechna její děla mohou střílet, nepřítel jen málo. |
| `fatal-funnel` | městské prostředí | Hráči, kteří vejdou jedněmi dveřmi, místností nebo úzkým místem, tam zemřou během okamžiků mnohem častěji než na jiném místě. |
| `crossfire` | síla | Držitelé, jejichž palebné linie se sbíhají z různých úhlů, vyhrají více soubojů než jeden držitel. |
| `peeker-advantage` | čas | Hráč, který vykoukne do výhledu, vyhrává souboje proti tomu, kdo drží úhel, častěji (nebo méně často) než v polovině případů. |
| `entry` | čas | První zabití kola rozhodne velkou část kola; vstupy vyhrávají nebo prohrávají podle místa a podpory. |
| `utility-support` | síla | Záblesk nebo kouř těsně před soubojem změní, kdo jej vyhraje. |
| `man-advantage` | síla | Kola vyhrává strana s více živými hráči a některé strany převahu promění nebo ji promrhají. |
| `clutch` | lidé | Poslední živí hráči vyhrávají častěji (nebo méně často), než předpovídá stav kola. |
| `action-value` | lidé | Zabití, výměny, položení bomby a užitečné předměty se liší tím, jak moc mění šanci na výhru. |
| `lurk` | pohyb | Hráč sám daleko od týmu zabíjí (nebo umírá) jiným tempem než zbytek skupiny. |
| `rotation` | pohyb | Jak rychle strana přesouvá hráče do boje nebo k cíli, rozhoduje, zda udrží, nebo znovu dobyje. |
| `collective-order` | lidé | Pohybující se jednotky jedné strany míří stejným směrem mnohem častěji, než by z náhody dávaly jejich vlastní stopy posunuté v čase. |
| `milling` | lidé | Jednotky jedné strany krouží kolem společného středu: otáčení bez čistého přesunu. |
| `herding` | lidé | Jednotky odcházejí z místa stejně, jako odešel spoluhráč před nimi, nad rámec vlastních šancí místa a nad rámec kopírování nepřítele. |
| `lane-formation` | lidé | Protichůdné proudy drží oddělené pruhy; pohyb se soustředí na několik stezek, které se zápas od zápasu znovu používají. |
| `crowding` | lidé | Rychlost a tok klesají, když se jednotky tlačí k sobě; přes úzké místo tlak protlačí méně lidí. |
| `leadership` | lidé | Některé jednotky se otočí jako první a ostatní kopírují jejich směr o několik vteřin později. |
| `cohesion` | lidé | Jednotky, které se odpoutají od své skupiny, umírají častěji než ty, které s ní zůstávají. |
| `breaking-point` | lidé | Strana, která ztratila část své síly, přestane se přibližovat a ustupuje, nad rámec toho, co vysvětluje její vzdálenost od nepřítele. |
| `panic` | lidé | Při náhlé hrozbě se jednotky rozprchnou, uprchnou nebo ztuhnou a koordinace se rozpadne. |
| `loss-chasing` | lidé | Po ztrátě jednotky berou více (nebo méně) rizika než po zisku. |
| `hot-hand` | lidé | Úspěch následuje úspěch častěji, než dovolují zamíchané posloupnosti stejného hráče. |
| `conformity` | lidé | Členové jedné strany volí stejně - nákupy, výbavu, trasy - nad rámec svých vlastních preferencí. |
| `suppression` | lidé | Dopadající palba mění, jak se jednotky pohybují a střílí, i když nezabije. |
| `social-loafing` | lidé | Výkon na hlavu klesá, jak je přítomno více spoluhráčů. |
| `mixed-strategy` | lidé | Volby, které by měly být nepředvídatelné, se stávají vzorcem: jedna možnost vyhrává častěji, nebo volby běží v posloupnostech. |
| `coordination` | lidé | Členové jednají v souladu bez viditelných rozkazů: sladěný pohyb, načasování a volby. |
| `contagion` | lidé | Stav přechází z jedné jednotky na další dotykem nebo blízkostí a šíří se po mapě. |
| `territoriality` | lidé | Jednotky si drží odstup od sebe a drží své vlastní území. |
| `interaction-network` | lidé | Kdo bojuje, podporuje a následuje koho, tvoří síť s uzly, shluky a mosty. |

### Pojmy (135) {#concepts-135}

| id | pojem | čočky | vzorce | zdroje |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesterův čtvercový zákon (mířená palba) | vojenství, letectví, námořnictví, esport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesterův lineární zákon (plošná palba, jeden na jednoho) | vojenství, městský boj, esport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Soustředění síly (hmota) | vojenství, letectví, námořnictví, esport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Poměry sil a pravidlo 3:1 | vojenství | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Poměr výměny ztrát | vojenství, letectví, esport, návrh | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Bojová síla a její násobiče | vojenství | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Moderní systém nasazení sil | vojenství | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | Smyčka OODA (pozoruj, orientuj se, rozhodni, jednej) | vojenství, letectví, esport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teorie energie a manévrovatelnosti | letectví | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Základní stíhací manévry a manévrování v leteckém boji | letectví | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Analýza terénu: OAKOC / KOCOA | vojenství, návrh, městský boj | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: proměnné úkolu | vojenství | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Klíčový a rozhodující terén | vojenství, návrh, esport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Pozorování a palebná pole | vojenství, návrh, esport, městský boj | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Kryt a maskování | vojenství, městský boj, návrh | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Přístupové osy a pohyblivé koridory | vojenství, návrh | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Úzká místa a průsmyky | vojenství, návrh, esport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Prostory nasazení a zóny zabití | vojenství, městský boj, návrh | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Obrana za svahem a krytí za terénem | vojenství, návrh | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Vyvýšený terén | vojenství, návrh | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Vnitřní a vnější linie | vojenství | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Porážka po částech | vojenství, esport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Vzájemná podpora | vojenství, letectví, esport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Spojené zbraně | vojenství, návrh | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Potlačení palbou | vojenství, městský boj | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Potlačení a ničení nepřátelské protivzdušné obrany (SEAD/DEAD) | letectví, vojenství | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Stálá letecká hlídka a letecká převaha | letectví | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Boj za hranicí dohledu | letectví | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Nepřímý přístup | vojenství, esport, návrh | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Obchvat a obklíčení | vojenství | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Přepadení | vojenství, esport, návrh | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Obrana do hloubky | vojenství | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Tření a mlha války | vojenství, esport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Kulminační bod útoku | vojenství | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Překvapení | vojenství, letectví, námořnictví, esport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Hospodárnost sil | vojenství, esport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Městský terén | městský boj, vojenství, esport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Kontrola moře a rozhodující bitva loďstva | námořnictví | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughesův model salv: účinně zaútočit první | námořnictví, letectví | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Teorie hledání a detekce | námořnictví, letectví, vojenství | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operační výzkum: míry účinnosti | vojenství, letectví, námořnictví, návrh | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Válečné hry jako analýza | vojenství, návrh | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manévrový boj | vojenství, esport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Soudržnost a morální faktor | vojenství | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Těžiště | vojenství | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Rozhodující body | vojenství, esport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Operační linie | vojenství | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategie zničení a vyčerpání | vojenství | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Hluboký boj a hluboké operace | vojenství | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | vojenství, letectví | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Velení na základě úkolu (Auftragstaktik) | vojenství, esport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Průlom a využití | vojenství | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Palba a pohyb | vojenství, esport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Střídavý postup s krytím (bounding overwatch) | vojenství, esport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Vtažení průzkumem a infiltrace | vojenství, esport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Záloha | vojenství, esport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Pružná obrana a protiútok | vojenství | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Řetěz zabití (najít, zafixovat, sledovat, zacílit, zasáhnout, vyhodnotit) | vojenství, letectví, námořnictví | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Dosah detekce a dosah boje | letectví, námořnictví, vojenství | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Hodnota bojové účinnosti | vojenství, esport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Rozptýlení na bojišti | vojenství, esport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Letecká podpora nejblíže bojujícím | letectví, vojenství | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Letecká interdikce | letectví, vojenství | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Doprovod versus stíhací zametání | letectví | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energetický boj versus zatáčkový boj | letectví | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Předstihové, čisté a zpožděné pronásledování | letectví | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thachův kličkovací manévr (Thach weave) | letectví | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Čtveřice „finger-four“ a bojová dvojice | letectví | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flotila jako hrozba (fleet in being) | námořnictví | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Přecházení T | námořnictví, vojenství | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoj | námořnictví | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Odpírání přístupu a oblasti (A2/AD) | námořnictví, letectví, vojenství | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Obrana pevných bodů v zastavěných oblastech | městský boj, vojenství | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Mouseholing a pohyb budovami | městský boj, vojenství, návrh | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Obléhání | vojenství, městský boj | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Partyzánská válka | vojenství, městský boj | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Protipovstalecký boj | vojenství, městský boj | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Útočiště | vojenství, návrh | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Klam (maskirovka) | vojenství, esport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informační převaha | vojenství, esport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Ekonomická kola a tempo zdrojů | esport, návrh | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Pohybové formace: řada, kolona, klín, šikmá řada | vojenství, esport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontální útok | vojenství | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Dvojitý obchvat (kleště) | vojenství | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Obklíčení a kotel | vojenství | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Pronik a průlom | vojenství | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Pronásledování | vojenství | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Ústup: odsun, zdržování a ústup | vojenství | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Demonstrace a klam | vojenství, esport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Clona, stráž a kryt: zabezpečení před hlavním tělesem | vojenství | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Obrana proti střele: crank, notch, drag a pump | letectví | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formace za hranicí dohledu: zeď, vedoucí a následující, mlýnek, kleště | letectví | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Úhlový a energetický boj | letectví | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Úderný balík a posloupnost potlačení | letectví | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Bojová linie | námořnictví | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Smrtící nálevka | městský boj, vojenství, esport, návrh | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Čištění místností: překvapení, rychlost, řízené násilí | městský boj, vojenství, esport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Body převahy | městský boj, vojenství, esport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Čištění rohů: krájení koláče | městský boj, vojenství, esport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Křížová palba a navazující palebná pole | vojenství, městský boj, esport, návrh | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Výhoda toho, kdo vykoukne | esport, návrh | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Početní převaha v eliminačních kolech | esport, vojenství | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Vstup a první souboj | esport, městský boj | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Užitečné předměty před vstupem: záblesk a kouř | esport, městský boj, vojenství | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Model sociální síly pohybu chodců | návrh, městský boj, vojenství | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Vytváření pruhů v protiproudu | návrh, městský boj | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Rychleji znamená pomaleji | návrh, městský boj, vojenství | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Základní diagram davů | návrh, městský boj | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Vytváření stezek a žádané trasy (desire lines) | návrh, vojenství | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panika je vzácná: kolektivní odolnost | vojenství, městský boj, návrh | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: oddělení, sladění, soudržnost | návrh, vojenství | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Řádový parametr a nástup kolektivního pohybu | návrh, vojenství, letectví, námořnictví | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Roj, kroužení a polarizované stavy | návrh, vojenství, námořnictví | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Účinné vedení bez signálů | vojenství, esport, návrh | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Sousedé podle počtu, ne podle vzdálenosti | letectví, vojenství | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Inteligence roje | návrh, esport, vojenství | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Stádní chování a informační kaskády | esport, návrh, vojenství | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Sociální lenošení (social loafing) | esport, návrh, vojenství | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Rozptýlení odpovědnosti | esport, vojenství | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Soudržnost primární skupiny | vojenství, esport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Body zlomu a práh ztrát | vojenství | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Potlačení: co palba dělá kromě zabíjení | vojenství, městský boj | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Strach a stres v bojových rozhodnutích | vojenství, esport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Selhání pod tlakem | esport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Teorie vyhlídek a averze ke ztrátě | esport, návrh | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Efekty nulového zisku a „cizích peněz“ | esport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt (naštvání) | esport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Utopené náklady | esport, vojenství | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Horká ruka a její omyl | esport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Smíšené strategie: být nepředvídatelný | esport, návrh, vojenství | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Sdílené mentální modely | esport, vojenství | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Složky týmové práce | esport, vojenství | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtuální světy jako laboratoře chování | návrh, esport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Osobní prostor a teritorium | návrh, městský boj | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Interakční sítě: uzly a slabé vazby | esport, návrh | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Metody (37) {#methods-37}

| id | metoda | vzorce | zdroje |
|---|---|---|---|
| `method.lanchester-fit` | Přizpůsobení Lanchesterových exponentů datům ze střetů | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Poměr výměny podle strany a místa | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Místní poměr sil v okamžiku každého zabití | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Oblast výhledu: palební pole podle zorné linie | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Měrná energie při zabitích a úmrtích (vzduch) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Stálost horkých míst napříč zápasy | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Míra výměn (vzájemná podpora) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Střety a výhoda prvního zabití | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Prostorová autokorelace úmrtí (Moranovo I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Míry vůči vlastní základně mapy s kontrolou FDR | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Zpravodajská příprava bojiště (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Modely hodnocení párových porovnání (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Pravděpodobnost výhry a ohodnocení akcí | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Kontrola prostoru a kontrola hřiště | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Rovnice salv přizpůsobená lodím ve styku | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Poměr bojové účinnosti na jednotku a hodinu v akci | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Dosahy od detekce po boj a dosahy boje | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Časování řetězu zabití | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Rozptýlení proti podílu zabití (soustředění síly v čase) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Míra ztrát a zabití na výstup | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model pravděpodobnosti výhry kola | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Hodnota akce: přidaná pravděpodobnost výhry | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Upravený plus-minus hřebenovou regresí (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Smršťování: empirický Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Očekávané výsledky: od očekávaných gólů k očekávaným soubojům | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Měření rozestavení, rotací a číhání | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Problém odrazu: kopírování, nebo společná příčina | herding, conformity | Manski 1993 |
| `method.streak-correction` | Série s korekcí konečné posloupnosti | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Řádové parametry polarizace a kroužení | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Vůdci podle korelace směru se zpožděním | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Test stádního chování kaskádou tras | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Oddělení pruhů a stálost stezek | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Riziko opozdilců | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Křivka zlomu | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Reakce na dopadající palbu | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Riziko po ztrátě nebo zisku | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Shoda nákupů (Fleissova kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Historické případy (277) {#historical-cases-277}

| id | případ | kdy | rozsah | vzorce | zdroje |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopyly | 480 př. n. l. | bitva | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamína | 480 př. n. l. | bitva | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathón | 490 př. n. l. | bitva | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 př. n. l. | bitva | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 př. n. l. | bitva | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimenské jezero | 217 př. n. l. | bitva | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 př. n. l. | bitva | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburský les | n. l. 9 | bitva | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | bitva | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirlingský most | 1297 | bitva | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Azincourt | 1415 | bitva | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Lutyně (Leuthen) | 1757 | bitva | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Slavkov (Austerlitz) | 1805 | bitva | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | bitva | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | bitva | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | střet | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | střet | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickettův útok | 1863 | střet | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | bitva | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | střet | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | tažení | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, první den | 1. července 1916 | bitva | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | tažení | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutsko | 1916 | bitva | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | bitva | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan a Ardeny | květen 1940 | tažení | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Protiútok u Arrasu | 21. května 1940 | střet | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Bitva o Británii | červenec-říjen 1940 | tažení | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Bitva o Atlantik: operační výzkum konvojů | 1939-45 | tažení | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | červen 1942 | bitva | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Druhá bitva u El Alameinu | říjen-listopad 1942 | bitva | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserinský průsmyk | únor 1943 | bitva | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | srpen 1942-únor 1943 | tažení | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | červenec 1943 | tažení | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prochorovka | 12. července 1943 | střet | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. června 1944 | střet | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Živé ploty v Normandii | červen-červenec 1944 | tažení | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operace Cobra | červenec 1944 | tažení | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte | říjen 1944 | bitva | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | prosinec 1944 | bitva | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Cušima | květen 1905 | bitva | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inčchon | září 1950 | tažení | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | tažení | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | bitva | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | listopad 1965 | střet | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operace Bolo | 2. ledna 1967 | střet | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: Údolí slz | říjen 1973 | bitva | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinaj: Čínská farma | říjen 1973 | bitva | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa (operace Mole Cricket 19) | červen 1982 | bitva | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Letecká válka o Falklandy | květen-červen 1982 | tažení | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Letecké tažení Pouštní bouře | leden-únor 1991 | tažení | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. února 1991 | střet | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadišo | říjen 1993 | střet | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Groznyj | prosinec 1994-únor 1995 | bitva | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Huế | leden-březen 1968 | bitva | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Letecké tažení v Kosovu | březen-červen 1999 | tažení | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallúdža (operace Al Fajr) | listopad 2004 | bitva | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | tažení | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadeš | asi 1274 př. n. l. | bitva | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 př. n. l. | bitva | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 př. n. l. | bitva | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 př. n. l. | bitva | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsálos | 48 př. n. l. | bitva | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopol | n. l. 378 | bitva | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Jarmúk | n. l. 636 | bitva | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | bitva | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattín | 1187 | bitva | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | bitva | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | bitva | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | bitva | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | bitva | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | bitva | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | bitva | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | bitva | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | bitva | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | tažení | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | bitva | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | bitva | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | bitva | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Lipsko | 1813 | bitva | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | bitva | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | bitva | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | tažení | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadová) | 1866 | bitva | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | bitva | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | bitva | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurmán | 1898 | bitva | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | střet | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | tažení | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | listopad 1917 | bitva | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | říjen-listopad 1917 | tažení | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Německá jarní ofenziva (operace Michael) | březen-duben 1918 | tažení | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | srpen 1918 | bitva | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Chalchin Gol (Nomonhan) | srpen 1939 | bitva | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Polské tažení | září 1939 | tažení | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut a Gembloux | květen 1940 | bitva | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | květen 1940 | střet | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Dunkerský obvod | květen-červen 1940 | tažení | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operace Compass a Beda Fomm | prosinec 1940-únor 1941 | tažení | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operace Crusader a Sidi Rezegh | listopad-prosinec 1941 | tažení | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | květen-červen 1942 | bitva | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | srpen-září 1942 | bitva | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | červen 1941 | bitva | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Obklíčení Kyjeva | září 1941 | tažení | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskva | říjen 1941-leden 1942 | tažení | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rževský výběžek a operace Mars | 1942 | tažení | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Druhý Charkov | květen 1942 | bitva | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Třetí Charkov (Mansteinův zpětný úder) | únor-březen 1943 | tažení | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operace Bagration | červen-srpen 1944 | tažení | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsuň-Ševčenkovský kotel | leden-únor 1944 | bitva | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenec-Podolský kotel | březen-duben 1944 | tažení | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operace Epsom | červen 1944 | bitva | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operace Goodwood | červenec 1944 | bitva | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operace Totalize | srpen 1944 | bitva | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | srpen 1944 | bitva | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaiský kotel | srpen 1944 | tažení | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden a Arnhem | září 1944 | tažení | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Cáchy | říjen 1944 | bitva | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenský les | září 1944-únor 1945 | tažení | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | září 1944 | bitva | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | Sankt Vith | prosinec 1944 | bitva | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn Ridge | prosinec 1944 | bitva | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelowské výšiny | duben 1945 | bitva | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlín | duben-květen 1945 | bitva | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operace Spring Awakening | březen 1945 | bitva | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | prosinec 1943 | bitva | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Varšavské povstání | srpen-říjen 1944 | tažení | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | listopad 1943 | bitva | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | září-listopad 1944 | bitva | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | únor-březen 1945 | bitva | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | duben-červen 1945 | tažení | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | únor-březen 1945 | bitva | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandžusko (srpnová bouře) | srpen 1945 | tažení | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusanský perimetr | srpen-září 1950 | tažení | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosinská přehrada | listopad-prosinec 1950 | tažení | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Řeka Imjin | duben 1951 | bitva | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapjong | duben 1951 | bitva | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | duben a červenec 1953 | střet | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | leden-duben 1968 | bitva | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | listopad 1967 | bitva | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (hora Ap Bia) | květen 1969 | střet | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | červen 1967 | bitva | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | říjen 1973 | bitva | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | červen 1982 | střet | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Obležení Bejrútu | červen-srpen 1982 | tažení | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Džbajl a hrozba protitankových zbraní | červenec-srpen 2006 | tažení | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Fáw | únor 1986 | bitva | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | leden-únor 1987 | bitva | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Chafdží | leden-únor 1991 | bitva | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objective Norfolk | 26.–27. února 1991 | bitva | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27. února 1991 | bitva | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Klamné útoky u Wádí al-Batin | únor 1991 | tažení | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | An Násiríja | březen 2003 | bitva | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objective Peach | duben 2003 | střet | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Thunder Runs | duben 2003 | bitva | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Průsmyk Dibeka | duben 2003 | střet | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramádí | 2006-07 | tažení | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | březen-květen 2008 | bitva | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operace Anaconda | březen 2002 | bitva | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | červenec 2008 | střet | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | říjen 2009 | střet | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Músá Kala a čety v domech | 2006-07 | tažení | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Bitva o Alžír | 1956-57 | tažení | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodéská Fireforce | 1974-79 | tažení | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Obležení Sarajeva | 1992-96 | tažení | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Groznyj 1999-2000 | prosinec 1999-únor 2000 | bitva | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Rusko-gruzínská válka | srpen 2008 | tažení | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillja | červenec 2014 | střet | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovajsk | srpen 2014 | bitva | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debalcevo | leden-únor 2015 | bitva | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Doněcké letiště | září 2014-leden 2015 | bitva | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Letiště Hostomel | únor 2022 | střet | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kyjevská osa a přepadení u Brovar | březen 2022 | střet | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol a Azovstal | únor-květen 2022 | bitva | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Charkovská protiofenziva | září 2022 | tažení | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Přechod přes Sjverskyj Doněc u Bilohoriwky | květen 2022 | střet | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bachmut | srpen 2022-květen 2023 | bitva | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Záporožská ofenziva | červen-listopad 2023 | tažení | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Válka o Náhorní Karabach | září-listopad 2020 | tažení | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitz | září 1940-květen 1941 | tažení | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: první den ve vzduchu | 22. června 1941 | bitva | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kréta | květen 1941 | bitva | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Obležení Malty | 1940-1942 | tažení | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Stalingradský vzdušný most | listopad 1942-únor 1943 | tažení | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Letecké boje nad Kubání | duben-červen 1943 | tažení | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk ve vzduchu | červenec 1943 | bitva | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operace Bagration ve vzduchu | červen-srpen 1944 | tažení | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploješť (operace Tidal Wave) | 1. srpna 1943 | střet | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Nálet na přehrady (operace Chastise) | 16.–17. května 1943 | střet | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburk (operace Gomorrah) | červenec-srpen 1943 | bitva | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. srpna 1943 | bitva | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Druhý Schweinfurt („Černý čtvrtek“) | 14. října 1943 | střet | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Velký týden (operace Argument) | únor 1944 | tažení | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Nálet na Norimberk | 30.–31. března 1944 | střet | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operace Bodenplatte | 1. ledna 1945 | bitva | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Bitva v Bismarckově moři | březen 1943 | bitva | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralizace Rabaulu | 1943-1944 | tažení | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filipínské moře („Marianas Turkey Shoot“) | červen 1944 | bitva | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Černé úterý nad Namsi | 23. října 1951 | střet | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operace Rolling Thunder | 1965-1968 | tažení | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Most Thanh Hóa | 1965-1972 | střet | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | Wild Weasels | 1965-1973 | tažení | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Aultova zpráva a Top Gun | 1968-1972 | tažení | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operace Linebacker | květen-říjen 1972 | tažení | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II („Jedenáctidenní válka“) | prosinec 1972 | tažení | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operace Focus (Moked) | 5. června 1967 | bitva | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Válka na vyčerpání: pás raket | 1969-1970 | tažení | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | Deštník SAM nad Suezským kanálem | říjen 1973 | bitva | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (operace Opera) | 7. června 1981 | střet | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operace El Dorado Canyon | 15. dubna 1986 | střet | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Íránsko-irácká letecká válka | 1980-1988 | tažení | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Nájezdy Black Buck | květen-červen 1982 | střet | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: plánování leteckého tažení v Zálivu | srpen 1990-leden 1991 | tažení | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: první úder Apache | 17. ledna 1991 | střet | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Velký lov na Scudy | leden-únor 1991 | tažení | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla Ridge („Silnice smrti“) | 26.–27. února 1991 | střet | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operace Anaconda: Apache v Šahí Kotu | březen 2002 | bitva | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Útok Apache u Karbaly | 24. března 2003 | střet | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Letecké tažení v Libyi | březen-říjen 2011 | tažení | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Náhorní Karabach: drony a protivzdušná obrana | září-listopad 2020 | tažení | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukrajina: sporné nebe | 2022 | tažení | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Letiště Hostomel | únor 2022 | střet | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | únor-březen 1971 | tažení | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operace Eagle Claw | duben 1980 | střet | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghánistán: Stinger | 1986-1989 | tažení | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | bitva | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Španělská Armáda | 1588 | tažení | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberonský záliv | 1759 | bitva | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginské mysy) | 1781 | bitva | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nil (záliv Aboukir) | 1798 | bitva | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kodaň | 1801 | bitva | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | březen 1862 | střet | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | bitva | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Ja-lu | 1894 | bitva | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manilský záliv | 1898 | bitva | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolandský záliv | srpen 1914 | bitva | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel a Falklandy | listopad-prosinec 1914 | tažení | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Doggerská mělčina | leden 1915 | bitva | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | Río de la Plata | prosinec 1939 | bitva | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | listopad 1940 | střet | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Matapan | březen 1941 | bitva | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Dánský průliv a potopení Bismarcku | květen 1941 | tažení | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. prosince 1941 | střet | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales a Repulse | 10. prosince 1941 | střet | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Jávské moře | únor 1942 | bitva | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Korálové moře | květen 1942 | bitva | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Ostrov Savo | srpen 1942 | bitva | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Východní Šalomounovy ostrovy | srpen 1942 | bitva | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | říjen 1942 | bitva | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Ostrovy Santa Cruz | říjen 1942 | bitva | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Námořní bitva u Guadalcanalu | 12.–15. listopadu 1942 | bitva | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | listopad 1942 | střet | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Kanálový úprk | únor 1942 | střet | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operace Pedestal | srpen 1942 | bitva | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Černý květen | květen 1943 | tažení | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Severní mys | prosinec 1943 | bitva | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Americká ponorková kampaň proti Japonsku | 1941-1945 | tažení | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | U ostrova Samar | 25. října 1944 | bitva | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigaoský průliv | 25. října 1944 | bitva | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kamikadze | duben-červen 1945 | tažení | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Potopení Elatu | říjen 1967 | střet | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | říjen 1973 | bitva | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Potopení křižníku General Belgrano | 2. května 1982 | střet | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Ztráta HMS Sheffield | 4. května 1982 | střet | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. května 1987 | střet | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operace Praying Mantis | 18. dubna 1988 | bitva | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | srpen 2004 | střet | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu revolution | březen 2007 | bitva | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil na The International 2013 | srpen 2013 | střet | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakerův Zed proti Ryuovi | září 2013 | střet | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Překlenovací boost | listopad 2014 | střet | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | Skákající AWP na Mirage | duben 2016 | střet | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis a éra užitečných předmětů | 2018 | tažení | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five proti OG | duben 2019 | bitva | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar dosahuje grandmastera | 2019 | tažení | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Levý hák (pozemní ofenziva operace Pouštní bouře) | 24.–28. února 1991 | tažení | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Incident Corrupted Blood | září 2005 | tažení | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Herní a úrovňový návrh (17) {#game-and-level-design-17}

| id | název | vzorce | zdroje |
|---|---|---|---|
| `design.chokepoint` | Úzká místa v návrhu úrovní | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Boční trasy a střídavé cesty | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Zorné linie a vzdálenost boje | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Umístění krytů a rytmus | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Návrh oživení a ochrana po oživení | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Vyvážení symetrických a nesymetrických map | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Vyvážení tříd a protiopatření | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Tok, smyčky a přehledná uspořádání | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Herní ekonomiky a zpětnovazební smyčky | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Párování hráčů a rozptyl dovedností | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | Soupeři řízení AI jako sondy úrovně | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Smysluplná hra a volba | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Výměny a týmová hra ve střílečkách | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kontrola mapy | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Tepelné mapy a prostorová telemetrie v návrhu | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Zvládnutí, učení a zábava | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Kola ekonomiky a rozhodnutí o nákupu | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Studie (113) {#studies-113}

| id | název | zdroje |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesterův čtvercový zákon na Iwo Jimě | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchesterovy modely pro Ardeny | Bracken 1995 |
| `study.fricker-1998` | Fricker: znovu o modelech vyčerpání v Ardenách | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas a Turkes: Kursk a Ardeny | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley a Helmbold: ověření čtvercového zákona | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | Analýza úmrtí hráčů v GIS | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: vizualizace soutěžního chování | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Ohodnocení akcí v Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Detekce střetů v esportu | Schubert et al. 2016 |
| `study.red-baron` | Projekt Red Baron: letecké boje nad Vietnamem | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: kvantifikovaný úsudek o historických bitvách | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: nasazení sil vysvětluje výsledky | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Přehled vizualizace herních dat | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester proti třem stoletím pozemních bitev | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: šedesát střetů druhé světové války | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: bojové modely a americká občanská válka | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: statistický model dat o vyčerpání | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: rychlosti postupu v pozemním boji | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas a Dinges: okolnosti jsou důležitější než zákon | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Databáze Kursk | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Databáze tažení v Ardenách | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson a MacKay: Bitva o Británii jako data pro Lanchestera | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte a Schmidt: počty stále vyhrávají bitvy | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: pravidelnosti ztrát v bitvách | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuyho taktický číselný deterministický model | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: válka čísly | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: bojová síla | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter a Stam: demokracie ve válce | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: adaptivní dynamický model | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester a partyzánská válka | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: stochastický model salv | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: základní kameny taktiky loďstev | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Debata o pravidle 3:1 | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modelování ozbrojených konfliktů | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Aultova zpráva: střely vypálené mimo svou obálku | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blackettův cirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Nastavení hloubkových pum v pobřežním velitelství | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Bílé spodní strany protiponorkových letadel | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: pancíř tam, kde se vracející bombardéry nezasáhly | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimální hledání: od ponorek po AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: boj v pekle | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Odpírání přístupu a oblasti | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Jak hráči ztrácejí zájem | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Shlukování chování hráčů v přirozeném prostředí | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Rozpoznávání frustrace hráčů | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: telemetrické přehledy v provozu | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: vizuální analýza hry | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Pohyb avatarů na bojištích World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: přístrojové vybavení uživatelských testů ve velkém | Kim et al. 2008 |
| `study.game-data-science` | Věda o datech ve hrách | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Umělá inteligence a hry | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Dovednost a pohyb týmu v Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Vzorce boje, které předpovídají výhry v MOBA | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Role hráčů v Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Předpovídání výsledků Dota 2 z draftů | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Živé předpovídání výher v profesionálním esportu | Hodge et al. 2021 |
| `study.rioult-2014` | Topologie pozic hráčů | Rioult et al. 2014 |
| `study.bednarek-2017` | Hodnocení hráčů v týmových střílečkách | Bednárek et al. 2017 |
| `study.katona-2019` | Předpovídání, kdo zemře jako další | Katona et al. 2019 |
| `study.block-2018` | Příběhy řízené daty pro publikum esportu | Block et al. 2018 |
| `study.ggviz` | ggViz: hledání herních stavů ve velkém | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: posilované učení ve velkém v Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: úroveň grandmastera ve StarCraftu II | Vinyals et al. 2019 |
| `study.cervone-2016` | Očekávaná hodnota držení míče v basketbalu | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: ohodnocení akcí s míčem ve fotbalu | Decroos et al. 2019 |
| `study.pitch-control` | Kontrola hřiště a vytváření prostoru | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Prostorová struktura obranné dovednosti | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Role v týmu z dat sledování | Lucey et al. 2013 |
| `study.shot-quality` | Očekávané góly a kvalita střelby | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: prostorová efektivita střelby | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Prostorově-časová analýza týmových sportů | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripleyho K: shlukování v každém měřítku | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark a Evans: rozptyl podle nejbližšího souseda | Clark & Evans 1954 |
| `study.getis-ord` | Horká místa Getise-Orda | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokální ukazatele prostorové asociace | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Prostorová skenovací statistika | Kulldorff 1997 |
| `study.kde` | Odhad jádrové hustoty | Silverman 1986 |
| `study.knox-1964` | Prostorově-časová interakce | Knox 1964; Diggle 2013 |
| `study.maup` | Problém modifikovatelné plošné jednotky | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Izovisty a grafy viditelnosti | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Syntax prostoru | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Střední hustota davu (mean crowding) | Lloyd 1967 |
| `study.survival-analysis` | Analýza přežití pro dobu do smrti | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Zobecněné lineární modely pro počty | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap a intervalové odhady | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey a kol.: latence a výhoda toho, kdo vykoukne | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee a Chang: výstřel za rohem | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: latence a akce hráčů | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos a kol.: profesionálové a amatéři optikou pravděpodobnosti výhry | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos a kol.: ekonomická rozhodnutí v Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: chytrá zabití a bezcenná úmrtí | Maymin 2021 |
| `study.moba-live-prediction` | Živé předpovídání výsledků v MOBA | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa a kol.: kola ve Valorantu z taktických rysů | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv a kol.: role v profesionálním Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim a kol.: trénink boje na blízko | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Turbulence davu na pouti Hadždž 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Chodící skupiny formují davy | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarchická dynamika skupin u hejn holubů | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Sociální vliv činí úspěch nerovným a nepředvídatelným | Salganik et al. 2006 |
| `study.wisdom-undermined` | Sociální vliv oslabuje moudrost davů | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | Přitažlivost davu | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Konformita vůči jednomyslné většině | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: motivace k boji v Iráku | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Soudržnost a výkon: metaanalýzy | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Averze ke ztrátě mezi profesionálními golfisty | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Horké ruce v baseballu | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penalty: profesionálové hrají minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Hra minimax ve Wimbledonu | Walker & Wooders 2001 |
| `study.collective-intelligence` | Kolektivní inteligence týmů | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Sociální sítě online světa | Szell et al. 2010 |
| `study.team-networks` | Sítě přihrávek a výkon týmu | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Chování se šíří shlukovanými sítěmi | Centola 2010 |

### Bibliografie {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(ověřeno 2026-11-15: podrobnosti)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(ověřeno 2026-11-15: podrobnosti)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(ověřeno 2026-11-15: podrobnosti)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(ověřeno 2026-11-15: podrobnosti)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(ověřeno 2026-11-15: podrobnosti)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(ověřeno 2026-11-15: podrobnosti)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(ověřeno 2026-11-15: podrobnosti)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(ověřeno 2026-11-15: podrobnosti)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(ověřeno 2026-11-15: podrobnosti)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(ověřeno 2026-11-15: podrobnosti)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(ověřeno 2026-11-15: podrobnosti)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(ověřeno 2026-11-15: podrobnosti)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(ověřeno 2026-11-15: podrobnosti)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(ověřeno 2026-11-15: podrobnosti)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(ověřeno 2026-11-15: podrobnosti)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(ověřeno 2026-11-15: podrobnosti)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(ověřeno 2026-11-15: podrobnosti)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(ověřeno 2026-11-15: podrobnosti)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(ověřeno 2026-11-15: podrobnosti)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(ověřeno 2026-11-15: podrobnosti)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(ověřeno 2026-11-15: podrobnosti)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(ověřeno 2026-11-15: podrobnosti)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(ověřeno 2026-11-15: podrobnosti)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(ověřeno 2026-11-15: podrobnosti)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(ověřeno 2026-11-15: existence)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(ověřeno 2026-11-15: podrobnosti)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(ověřeno 2026-11-15: podrobnosti)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(ověřeno 2026-11-15: podrobnosti)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(ověřeno 2026-11-15: podrobnosti)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(ověřeno 2026-11-15: podrobnosti)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(ověřeno 2026-11-15: podrobnosti)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(ověřeno 2026-11-15: existence)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(ověřeno 2026-11-15: podrobnosti)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(ověřeno 2026-11-15: podrobnosti)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(ověřeno 2026-11-15: podrobnosti)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(ověřeno 2026-11-15: podrobnosti)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(ověřeno 2026-11-15: podrobnosti)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(ověřeno 2026-11-15: existence)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(ověřeno 2026-11-15: podrobnosti)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(ověřeno 2026-11-15: podrobnosti)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(ověřeno 2026-11-15: existence)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(ověřeno 2026-11-15: podrobnosti)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(ověřeno 2026-11-15: podrobnosti)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(ověřeno 2026-11-15: podrobnosti)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(ověřeno 2026-11-15: podrobnosti)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(ověřeno 2026-11-15: existence)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(ověřeno 2026-11-15: podrobnosti)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(ověřeno 2026-11-15: podrobnosti)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(ověřeno 2026-11-15: podrobnosti)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(ověřeno 2026-11-15: podrobnosti)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(ověřeno 2026-11-15: podrobnosti)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(ověřeno 2026-11-15: podrobnosti)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(ověřeno 2026-11-15: podrobnosti)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(ověřeno 2026-11-15: podrobnosti)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(ověřeno 2026-11-15: podrobnosti)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(ověřeno 2026-11-15: podrobnosti)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(ověřeno 2026-11-15: podrobnosti)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(ověřeno 2026-11-15: podrobnosti)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(ověřeno 2026-11-15: podrobnosti)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(ověřeno 2026-11-15: podrobnosti)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(ověřeno 2026-11-15: podrobnosti)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(ověřeno 2026-11-15: podrobnosti)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(ověřeno 2026-11-15: podrobnosti)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(ověřeno 2026-11-15: existence)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(ověřeno 2026-11-15: podrobnosti)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(ověřeno 2026-11-15: podrobnosti)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(ověřeno 2026-11-15: podrobnosti)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(ověřeno 2026-11-15: existence)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(ověřeno 2026-11-15: existence)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(ověřeno 2026-11-15: podrobnosti)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(ověřeno 2026-11-15: podrobnosti)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(ověřeno 2026-11-15: existence)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(ověřeno 2026-11-15: podrobnosti)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(ověřeno 2026-11-15: podrobnosti)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(ověřeno 2026-11-15: podrobnosti)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(ověřeno 2026-11-15: podrobnosti)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(ověřeno 2026-11-15: podrobnosti)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(ověřeno 2026-11-15: existence)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(ověřeno 2026-11-15: podrobnosti)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(ověřeno 2026-11-15: podrobnosti)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(ověřeno 2026-11-15: podrobnosti)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(ověřeno 2026-11-15: podrobnosti)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(ověřeno 2026-11-15: podrobnosti)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(ověřeno 2026-11-15: podrobnosti)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(ověřeno 2026-11-15: podrobnosti)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(ověřeno 2026-11-15: existence)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(ověřeno 2026-11-15: podrobnosti)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(ověřeno 2026-11-15: podrobnosti)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(ověřeno 2026-11-15: podrobnosti)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(ověřeno 2026-11-15: podrobnosti)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(ověřeno 2026-11-15: podrobnosti)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(ověřeno 2026-11-15: podrobnosti)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(ověřeno 2026-11-15: existence)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(ověřeno 2026-11-15: podrobnosti)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(ověřeno 2026-11-15: podrobnosti)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(ověřeno 2026-11-15: podrobnosti)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(ověřeno 2026-11-15: podrobnosti)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(ověřeno 2026-11-15: podrobnosti)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(ověřeno 2026-11-15: podrobnosti)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(ověřeno 2026-11-15: podrobnosti)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(ověřeno 2026-11-15: podrobnosti)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(ověřeno 2026-11-15: podrobnosti)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(ověřeno 2026-11-15: podrobnosti)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(ověřeno 2026-11-15: podrobnosti)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(ověřeno 2026-11-15: podrobnosti)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(ověřeno 2026-11-15: podrobnosti)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(ověřeno 2026-11-15: podrobnosti)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(ověřeno 2026-11-15: podrobnosti)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(ověřeno 2026-11-15: podrobnosti)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(ověřeno 2026-11-15: podrobnosti)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(ověřeno 2026-11-15: existence)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(ověřeno 2026-11-15: podrobnosti)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(ověřeno 2026-11-15: podrobnosti)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(ověřeno 2026-11-15: podrobnosti)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(ověřeno 2026-11-15: podrobnosti)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(ověřeno 2026-11-15: podrobnosti)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(ověřeno 2026-11-15: podrobnosti)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(ověřeno 2026-11-15: podrobnosti)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(ověřeno 2026-11-15: podrobnosti)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(ověřeno 2026-11-15: podrobnosti)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(ověřeno 2026-11-15: podrobnosti)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(ověřeno 2026-11-15: podrobnosti)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(ověřeno 2026-11-15: podrobnosti)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(ověřeno 2026-11-15: podrobnosti)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(ověřeno 2026-11-15: podrobnosti)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(ověřeno 2026-11-15: podrobnosti)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(ověřeno 2026-11-15: podrobnosti)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(ověřeno 2026-11-15: podrobnosti)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(ověřeno 2026-11-15: podrobnosti)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(ověřeno 2026-11-15: podrobnosti)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(ověřeno 2026-11-15: podrobnosti)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(ověřeno 2026-11-15: podrobnosti)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(ověřeno 2026-11-15: podrobnosti)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(ověřeno 2026-11-15: podrobnosti)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(ověřeno 2026-11-15: podrobnosti)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(ověřeno 2026-11-15: podrobnosti)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(ověřeno 2026-11-15: podrobnosti)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(ověřeno 2026-11-15: podrobnosti)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(ověřeno 2026-11-15: podrobnosti)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(ověřeno 2026-11-15: podrobnosti)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(ověřeno 2026-11-15: podrobnosti)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(ověřeno 2026-11-15: podrobnosti)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(ověřeno 2026-11-15: podrobnosti)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(ověřeno 2026-11-15: podrobnosti)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(ověřeno 2026-11-15: podrobnosti)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(ověřeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(ověřeno 2026-11-15: podrobnosti)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(ověřeno 2026-11-15: podrobnosti)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(ověřeno 2026-11-15: podrobnosti)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(ověřeno 2026-11-15: podrobnosti)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(ověřeno 2026-11-15: podrobnosti)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(ověřeno 2026-11-15: podrobnosti)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(ověřeno 2026-11-15: podrobnosti)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(ověřeno 2026-11-15: podrobnosti)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(ověřeno 2026-11-15: existence)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(ověřeno 2026-11-15: podrobnosti)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(ověřeno 2026-11-15: podrobnosti)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(ověřeno 2026-11-15: podrobnosti)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(ověřeno 2026-11-15: podrobnosti)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(ověřeno 2026-11-15: podrobnosti)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(ověřeno 2026-11-15: podrobnosti)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(ověřeno 2026-11-15: podrobnosti)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(ověřeno 2026-11-15: podrobnosti)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(ověřeno 2026-11-15: podrobnosti)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(ověřeno 2026-11-15: podrobnosti)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(ověřeno 2026-11-15: podrobnosti)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(ověřeno 2026-11-15: podrobnosti)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(ověřeno 2026-11-15: podrobnosti)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(ověřeno 2026-11-15: podrobnosti)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(ověřeno 2026-11-15: podrobnosti)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(ověřeno 2026-11-15: podrobnosti)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(ověřeno 2026-11-15: podrobnosti)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(ověřeno 2026-11-15: podrobnosti)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(ověřeno 2026-11-15: podrobnosti)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(ověřeno 2026-11-15: podrobnosti)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(ověřeno 2026-11-15: existence)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(ověřeno 2026-11-15: podrobnosti)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(ověřeno 2026-11-15: podrobnosti)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(ověřeno 2026-11-15: podrobnosti)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(ověřeno 2026-11-15: podrobnosti)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(ověřeno 2026-11-15: podrobnosti)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(ověřeno 2026-11-15: podrobnosti)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(ověřeno 2026-11-15: podrobnosti)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(ověřeno 2026-11-15: podrobnosti)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(ověřeno 2026-11-15: podrobnosti)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(ověřeno 2026-11-15: podrobnosti)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(ověřeno 2026-11-15: podrobnosti)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(ověřeno 2026-11-15: podrobnosti)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(ověřeno 2026-11-15: existence)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(ověřeno 2026-11-15: podrobnosti)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(ověřeno 2026-11-15: podrobnosti)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(ověřeno 2026-11-15: podrobnosti)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(ověřeno 2026-11-15: podrobnosti)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(ověřeno 2026-11-15: podrobnosti)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(ověřeno 2026-11-15: podrobnosti)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(ověřeno 2026-11-15: podrobnosti)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(ověřeno 2026-11-15: podrobnosti)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(ověřeno 2026-11-15: podrobnosti)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(ověřeno 2026-11-15: podrobnosti)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(ověřeno 2026-11-15: existence)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(ověřeno 2026-11-15: podrobnosti)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(ověřeno 2026-11-15: podrobnosti)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(ověřeno 2026-11-15: podrobnosti)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(ověřeno 2026-11-15: podrobnosti)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(ověřeno 2026-11-15: podrobnosti)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(ověřeno 2026-11-15: existence)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(ověřeno 2026-11-15: podrobnosti)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(ověřeno 2026-11-15: podrobnosti)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(ověřeno 2026-11-15: podrobnosti)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(ověřeno 2026-11-15: podrobnosti)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(ověřeno 2026-11-15: podrobnosti)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(ověřeno 2026-11-15: existence)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(ověřeno 2026-11-15: podrobnosti)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(ověřeno 2026-11-15: podrobnosti)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(ověřeno 2026-11-15: podrobnosti)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(ověřeno 2026-11-15: podrobnosti)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(ověřeno 2026-11-15: existence)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(ověřeno 2026-11-15: podrobnosti)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(ověřeno 2026-11-15: podrobnosti)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(ověřeno 2026-11-15: podrobnosti)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(ověřeno 2026-11-15: podrobnosti)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(ověřeno 2026-11-15: podrobnosti)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(ověřeno 2026-11-15: podrobnosti)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(ověřeno 2026-11-15: existence)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(ověřeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(ověřeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(ověřeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(ověřeno 2026-11-15: podrobnosti)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(ověřeno 2026-11-15: podrobnosti)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(ověřeno 2026-11-15: podrobnosti)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(ověřeno 2026-11-15: podrobnosti)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(ověřeno 2026-11-15: podrobnosti)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(ověřeno 2026-11-15: podrobnosti)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(ověřeno 2026-11-15: existence)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(ověřeno 2026-11-15: existence)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(ověřeno 2026-11-15: podrobnosti)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(ověřeno 2026-11-15: podrobnosti)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(ověřeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(ověřeno 2026-11-15: existence)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(ověřeno 2026-11-15: existence)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(ověřeno 2026-11-15: existence)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(ověřeno 2026-11-15: podrobnosti)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(ověřeno 2026-11-15: podrobnosti)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(ověřeno 2026-11-15: podrobnosti)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(ověřeno 2026-11-15: podrobnosti)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(ověřeno 2026-11-15: podrobnosti)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(ověřeno 2026-11-15: podrobnosti)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(ověřeno 2026-11-15: podrobnosti)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(ověřeno 2026-11-15: podrobnosti)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(ověřeno 2026-11-15: podrobnosti)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(ověřeno 2026-11-15: podrobnosti)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(ověřeno 2026-11-15: podrobnosti)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(ověřeno 2026-11-15: podrobnosti)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(ověřeno 2026-11-15: existence)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(ověřeno 2026-11-15: podrobnosti)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(ověřeno 2026-11-15: podrobnosti)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(ověřeno 2026-11-15: podrobnosti)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(ověřeno 2026-11-15: podrobnosti)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(ověřeno 2026-11-15: podrobnosti)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(ověřeno 2026-11-15: podrobnosti)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(ověřeno 2026-11-15: podrobnosti)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(ověřeno 2026-11-15: podrobnosti)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(ověřeno 2026-11-15: podrobnosti)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(ověřeno 2026-11-15: podrobnosti)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(ověřeno 2026-11-15: podrobnosti)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(ověřeno 2026-11-15: podrobnosti)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(ověřeno 2026-11-15: podrobnosti)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(ověřeno 2026-11-15: podrobnosti)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(ověřeno 2026-11-15: podrobnosti)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(ověřeno 2026-11-15: podrobnosti)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(ověřeno 2026-11-15: podrobnosti)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(ověřeno 2026-11-15: podrobnosti)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(ověřeno 2026-11-15: podrobnosti)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(ověřeno 2026-11-15: podrobnosti)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(ověřeno 2026-11-15: podrobnosti)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(ověřeno 2026-11-15: podrobnosti)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(ověřeno 2026-11-15: podrobnosti)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(ověřeno 2026-11-15: podrobnosti)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(ověřeno 2026-11-15: podrobnosti)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(ověřeno 2026-11-15: podrobnosti)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(ověřeno 2026-11-15: podrobnosti)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(ověřeno 2026-11-15: podrobnosti)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(ověřeno 2026-11-15: podrobnosti)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(ověřeno 2026-11-15: podrobnosti)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(ověřeno 2026-11-15: podrobnosti)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(ověřeno 2026-11-15: podrobnosti)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(ověřeno 2026-11-15: podrobnosti)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(ověřeno 2026-11-15: podrobnosti)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(ověřeno 2026-11-15: podrobnosti)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(ověřeno 2026-11-15: podrobnosti)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(ověřeno 2026-11-15: podrobnosti)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(ověřeno 2026-11-15: existence)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(ověřeno 2026-11-15: existence)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(ověřeno 2026-11-15: existence)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(ověřeno 2026-11-15: existence)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(ověřeno 2026-11-15: podrobnosti)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(ověřeno 2026-11-15: podrobnosti)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(ověřeno 2026-11-15: podrobnosti)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(ověřeno 2026-11-15: podrobnosti)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(ověřeno 2026-11-15: podrobnosti)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(ověřeno 2026-11-15: podrobnosti)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(ověřeno 2026-11-15: podrobnosti)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(ověřeno 2026-11-15: existence)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(ověřeno 2026-11-15: podrobnosti)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(ověřeno 2026-11-15: podrobnosti)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(ověřeno 2026-11-15: podrobnosti)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(ověřeno 2026-11-15: podrobnosti)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(ověřeno 2026-11-15: existence)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(ověřeno 2026-11-15: podrobnosti)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(ověřeno 2026-11-15: existence)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(ověřeno 2026-11-15: podrobnosti)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(ověřeno 2026-11-15: podrobnosti)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(ověřeno 2026-11-15: podrobnosti)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(ověřeno 2026-11-15: podrobnosti)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(ověřeno 2026-11-15: existence)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(ověřeno 2026-11-15: podrobnosti)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(ověřeno 2026-11-15: podrobnosti)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(ověřeno 2026-11-15: podrobnosti)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(ověřeno 2026-11-15: podrobnosti)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(ověřeno 2026-11-15: podrobnosti)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(ověřeno 2026-11-15: podrobnosti)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(ověřeno 2026-11-15: podrobnosti)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(ověřeno 2026-11-15: podrobnosti)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(ověřeno 2026-11-15: podrobnosti)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(ověřeno 2026-11-15: existence)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(ověřeno 2026-11-15: podrobnosti)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(ověřeno 2026-11-15: podrobnosti)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(ověřeno 2026-11-15: podrobnosti)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(ověřeno 2026-11-15: podrobnosti)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(ověřeno 2026-11-15: podrobnosti)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(ověřeno 2026-11-15: podrobnosti)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(ověřeno 2026-11-15: podrobnosti)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(ověřeno 2026-11-15: podrobnosti)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(ověřeno 2026-11-15: podrobnosti)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(ověřeno 2026-11-15: podrobnosti)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(ověřeno 2026-11-15: podrobnosti)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(ověřeno 2026-11-15: podrobnosti)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(ověřeno 2026-11-15: podrobnosti)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(ověřeno 2026-11-15: podrobnosti)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(ověřeno 2026-11-15: podrobnosti)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(ověřeno 2026-11-15: podrobnosti)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(ověřeno 2026-11-15: podrobnosti)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(ověřeno 2026-11-15: podrobnosti)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(ověřeno 2026-11-15: existence)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(ověřeno 2026-11-15: podrobnosti)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(volné dílo)* *(ověřeno 2026-11-15: existence)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(ověřeno 2026-11-15: podrobnosti)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(ověřeno 2026-11-15: podrobnosti)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(ověřeno 2026-11-15: podrobnosti)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(ověřeno 2026-11-15: podrobnosti)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(ověřeno 2026-11-15: podrobnosti)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(ověřeno 2026-11-15: podrobnosti)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(ověřeno 2026-11-15: podrobnosti)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(ověřeno 2026-11-15: existence)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(ověřeno 2026-11-15: podrobnosti)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(ověřeno 2026-11-15: existence)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(ověřeno 2026-11-15: existence)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(ověřeno 2026-11-15: existence)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(ověřeno 2026-11-15: podrobnosti)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(ověřeno 2026-11-15: podrobnosti)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(ověřeno 2026-11-15: podrobnosti)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(ověřeno 2026-11-15: podrobnosti)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(ověřeno 2026-11-15: podrobnosti)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(ověřeno 2026-11-15: existence)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(ověřeno 2026-11-15: podrobnosti)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: podrobnosti)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(ověřeno 2026-11-15: podrobnosti)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(ověřeno 2026-11-15: podrobnosti)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(volné dílo)* *(ověřeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(ověřeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(ověřeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(ověřeno 2026-11-15: podrobnosti)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(ověřeno 2026-11-15: existence)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(ověřeno 2026-11-15: podrobnosti)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(ověřeno 2026-11-15: existence)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(ověřeno 2026-11-15: existence)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(ověřeno 2026-11-15: podrobnosti)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(ověřeno 2026-11-15: podrobnosti)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(ověřeno 2026-11-15: podrobnosti)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(ověřeno 2026-11-15: podrobnosti)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(ověřeno 2026-11-15: podrobnosti)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(ověřeno 2026-11-15: podrobnosti)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(ověřeno 2026-11-15: podrobnosti)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(ověřeno 2026-11-15: podrobnosti)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(ověřeno 2026-11-15: podrobnosti)*

<!-- kb:end -->
