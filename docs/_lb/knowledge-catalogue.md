---
title: "Wëssenskatalog"
parent: "D'Wëssenslens"
nav_order: 2
lang: "lb"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Wëssenskatalog

Dëst ass déi vollstänneg Lëscht vun deem, wat d'[D'Wëssenslens](knowledge.md) weess: d'Muster, no deenen se sicht, d'Iddien, d'Methoden, d'historesch Fäll a d'Studien, déi se zitéiert, a d'Bicher a Pabeieren, déi dorhannert stinn. Benotz se, fir en Entrée iwwer seng ID ze fannen oder eng Quell ze kontrolléieren.

Dës Säit gëtt aus der Wëssensbasis vum `node tools/knowledge-doc.mjs` generéiert; ännert net tëscht de Markéierungen.

<!-- kb:begin -->

D'Wëssensbasis huet 579 Entréeën (135 Konzepter, 37 Methoden, 277 historesch Fäll, 17 Designprinzipien, 113 Studien) iwwer 93 Muster a zitéiert 556 Quellen.

### Muster (93) {#patterns-93}

| id | Famill | wat et an den Donnéeën ausgesäit |
|---|---|---|
| `concentration` | Kraaft | Déi Säit, déi méi Eenheeten op eng Plaz bréngt, gewënnt déi Plaz mat méi wéi just hirer Zuel. |
| `local-superiority` | Kraaft | Ofschëss goen un déi Säit, déi an der Kampfdistanz méi Leit huet wéi déi anerer, egal wéi d'Gesamtzuelen sinn. |
| `attrition` | Kraaft | Verloschter folgen de Stäerkten vu béide Säite mat der Zäit; de Kampf gëtt vun deem entscheet, deen als éischt ausgaangen ass. |
| `exchange-ratio` | Kraaft | Ofschëss pro Verloscht ënnerscheede sech staark no Plaz, Säit oder Klass. |
| `aimed-fire` | Kraaft | Verloschter wuessen mat der Zuel vum Feind, awer net mat der eegener. |
| `area-fire` | Kraaft | Verloschter wuessen mat dem Produkt vun de Zuelen op béide Säite: Gedréngs gëtt bestrooft. |
| `defeat-in-detail` | Kraaft | Eng Säit gëtt Stéck fir Stéck zerstéiert, well hir Deeler eent nom anere kommen. |
| `mutual-support` | Kraaft | En Verloscht gëtt séier vun engem Kolleeg an der Nopesch beäntwert: Trades. |
| `combined-arms` | Kraaft | Klasse si gutt zesumme, wou jiddereen d'Schwächt vum anere deckt, a schlecht eleng. |
| `class-counter` | Kraaft | Eng Klass gewënnt iwwerdeems géint eng bestëmmt aner Klass oder un enger bestëmmter Plaz. |
| `initiative` | Kraaft | Wien an engem Gefecht als éischt trëfft, gewënnt et meeschtens. |
| `key-terrain` | Terrain | Déi selwecht puer Plazen entscheede Gefechter, Match fir Match. |
| `fields-of-fire` | Terrain | Plazen, déi wäit iwwer de Buedem gesinn, deen anerer iwwerquere mussen, maachen méi Ofschëss. |
| `high-ground` | Terrain | Ofschëss ginn vun uewen gemaach, vum Buedem aus, op deem d'Affer stinn. |
| `cover` | Terrain | Doudesfäll pro Zäit falen, wou d'Geometrie d'Siicht a Feier blockéiert. |
| `open-ground` | Terrain | Doudesfäll pro Zäit klammen, wou näischt d'Siicht a Feier blockéiert. |
| `kill-zone` | Terrain | Doudesfäll konzentréiere sech, wou d'Bewegung duerch beobachtete, Feier-gedeckten Buedem gezwongen ass. |
| `chokepoint` | Terrain | Vill Iwwergäng, duerch wéineg Buedem gedréckt, mat Verloschter do. |
| `reverse-slope` | Terrain | Sécherheet direkt hanner engem Kamm oder enger Mauer, ausserhalb vun der direkter Siicht vum Feind. |
| `safe-ground` | Terrain | Eng Plaz, wou Zäit verbruecht gëtt, awer wou wéineg stierwen. |
| `obstacle` | Terrain | Weeër biege ronderëm blockéiert Buedem a ginn an e puer Gaassen. |
| `flank` | Bewegung | Eng selten benotzte Route féiert zu méi Ofschëss wéi déi Haaptrouten. |
| `avenue-of-approach` | Bewegung | D'Bewegung fléisst laanscht e puer Gaassen tëscht de Beräicher. |
| `mobility` | Bewegung | Sech beweegend Eenheeten stierwen pro Zäit manner (oder méi) wéi lues oder stänneg Eenheeten. |
| `static-exposure` | Bewegung | Eenheeten, déi stoen, stierwen pro Zäit méi wéi déi, déi sech beweegen. |
| `interior-lines` | Bewegung | Eng Säit mat kuerze Weeër tëscht hire Kämpf verréckelt hir Kraaft méi séier wéi déi anerer. |
| `envelopment` | Bewegung | Ofschëss kommen aus verschiddene Richtungen op d'Positioun vun enger Säit. |
| `ambush` | Bewegung | Eenheeten, déi eng Route laanschtgoen, stierwen séier, wann Feinde schonn a Stellung sinn. |
| `spawn-pressure` | Zäit | Liewen ophalen séier, nodeems se bei engem Spawn ugefaang hunn. |
| `tempo` | Zäit | Déi séier Säit kënnt am Gefecht un an trëfft, ier déi anerer reagéiert. |
| `surprise` | Zäit | Verloschter kommen an engem Schub, ier d'Affer zréckschéisst. |
| `energy-advantage` | Loft | Killer hunn méi Héicht a Vitesse wéi hir Affer. |
| `air-superiority` | Loft | Déi eng Säit hir Fligeren maachen vill méi Ofschëss wéi se verléieren. |
| `sead` | Loft | Buedemflak hëlt ville Fligeren, bis se fonnt an zerstéiert ass. |
| `bvr` | Loft | Ofschëss geschéien op laang Distanz, ier d'Affer no kann kommen. |
| `fleet-salvo` | Mier | Eng Kraaft, déi als éischt trëfft, verléiert wéineg; déi anerer bleift kaum iwwreg fir ze äntwerten. |
| `scouting` | Mier | Déi Säit, déi déi anerer als éischt fënnt, wielt de Kampf. |
| `urban-close` | Stad | Kuerz Kampfdistanzen, vill Doudesfäll an dichter Geometrie, lues Botzen. |
| `vertical` | Stad | Ofschëss vun ieweschte Stäck oder vun Dächer op d'Strooss. |
| `skill-dispersion` | Leit | E puer Spiller maachen en grousse Undeel vun de Ofschëss oder Doudesfäll. |
| `ai-vs-player` | Leit | KI-gesteuert Eenheeten fueren anescht wéi Spiller um selwechte Plaz. |
| `balance` | Design | Säiten, Spawns oder Klassen fänken mat ongläiche Chancen un. |
| `economy` | Design | Ressourcen, déi verdéngt, bezuelt a verluer ginn, konzentréieren sech op e puer Plazen oder Spiller. |
| `flow` | Design | Wéi d'Spiller sech duerch de Level beweegen: Schleifen, Gaassen, Sackgaassen. |
| `sightlines` | Design | Laang Siichtlinnen entscheeden, wou Gefechter ufänken a wien se gewënnt. |
| `readability` | Design | Doudesfäll, déi Spiller net kommen gesinn: vun hannen, vun ausserhalb vun der Siicht. |
| `formation` | Bewegung | Eenheeten vun enger Säit beweegen sech zesumme a enger erkennbarer Form: Linn, Kolonn, Keil, Echelon, Box. |
| `frontal-assault` | Bewegung | Eng Grupp geet direkt op de Feind zou, an d'Gesiicht vu senger Front. |
| `double-envelopment` | Bewegung | Zwou Gruppen attackéieren béid Flanke vun engem Feind ongeféier zur selwechter Zäit. |
| `encirclement` | Bewegung | Eng Feindgrupp ass vun der anerer Säit ronderëm, mat wéineg Ausgäng. |
| `penetration` | Bewegung | Eng Grupp geet duerch d'Feindlinn, wou Feinde op béide Säite stinn. |
| `fire-and-maneuver` | Bewegung | En Deel vun enger Grupp beweegt sech, wärend den Rescht steet a deckt, an d'Rolle wiesselen. |
| `feint` | Bewegung | Eng kleng Grupp zitt de Feind op eng Plaz; de Haaptaufwand schléit answou an iwwer Kuerzem. |
| `withdrawal` | Bewegung | Eng Grupp am Kontakt dréit sech of an mécht d'Distanz zum Feind méi grouss. |
| `pursuit` | Bewegung | Eng Grupp follegt engem Feind, deen sech wegbewegt, a hält oder verkierzt d'Distanz. |
| `defence-in-depth` | Terrain | Verteidiger stinn a méi Gürtele, een hanner dem anere, laanscht d'Virrückungsachs vum Feind. |
| `screening` | Bewegung | En klenge Element beweegt sech wäit virun sengem Haaptkierper an trëfft den Feind als éischt. |
| `dispersion` | Kraaft | Eng Säit verdeelt sech mat der Zäit; manner vun hire Eenheeten sinn op der selwechter Plaz. |
| `missile-defence` | Loft | Fligeren ënner Raketebedrohung dréinen d'Bedrohung op d'Säit oder de Schwanz: crank, notch, drag, pump. |
| `angles-fight` | Loft | Nosekampf op kuerz Distanz, mat niddreger Vitesse an héijer Drehrate, ausgefuer fir d'Nasepositioun an net fir d'Energie. |
| `cap` | Loft | Fligeren kreesen Minutten laang ronderëm eng fix Statioun a waarden, bis de Feind kënnt. |
| `strike-package` | Loft | Fligeren mat verschiddene Rollen fléien zesummen op e Ziel; e puer greifen de Buedem un, anerer decken se. |
| `line-of-battle` | Mier | Schëffe fueren a Kolonn hannereneen, sou datt all Breitsäit trëfft. |
| `crossing-the-t` | Mier | Eng Kolonn fiert iwwer de Kapp vun der Feindkolonn: all hir Kanounen treffen, wéineg vum Feind. |
| `fatal-funnel` | Stad | Spiller, déi duerch eng Dir, e Raum oder e Engpass goen, stierwen do séier, vill méi dacks wéi wann se anescht goen. |
| `crossfire` | Kraaft | Halter, deenen hir Feierlinnen aus verschiddene Winkelen zesummelafen, gewannen méi Duelle wéi een eenzelne Halter. |
| `peeker-advantage` | Zäit | De Spiller, deen an d'Siicht kënnt, gewënnt Duelle géint deen, deen de Wénkel hält, méi (oder manner) dacks wéi d'Halschent. |
| `entry` | Zäit | Den éischte Ofschoss vun enger Ronn entscheet vill vun der Ronn; Entréen gewannen oder verléieren no Plaz a Ënnerstëtzung. |
| `utility-support` | Kraaft | En Blitz oder Rauch just virum Duell ännert, wien et gewënnt. |
| `man-advantage` | Kraaft | Ronnen gi vun der Säit gewonnen, déi méi Spiller lieweg huet; e puer Säite verwandelen oder verspillen e Virdeel. |
| `clutch` | Leit | Lescht Spiller, déi iwwreg sinn, gewannen méi (oder manner) dacks, wéi de Stand vun der Ronn virausgesot huet. |
| `action-value` | Leit | Ofschëss, Trades, Plantéierungen an Utility ënnerscheede sech an, wéi vill se d'Chance ze gewannen änneren. |
| `lurk` | Bewegung | En Spiller eleng wäit vum Team schéisst (oder stierft) an enger anerer Quote wéi de Rescht vun der Grupp. |
| `rotation` | Bewegung | Wéi séier eng Säit Spiller an de Kampf oder op de Ziel verréckelt, entscheet, ob si hält oder zréckhëlt. |
| `collective-order` | Leit | D'Beweegungseenheeten vun enger Säit fueren dacks an déi selwecht Richtung, vill méi dacks wéi hir eegene Spueren, zeitlech verschuewen, dat zoufälleg géif. |
| `milling` | Leit | D'Eenheeten vun enger Säit kreesen ronderëm e gemeinsame Mëttelpunkt: Drehung ouni Nettobewegung. |
| `herding` | Leit | Eenheeten verloossen eng Plaz, wéi de Kolleeg virun hinnen et gemaach huet, méi wéi d'Chance vun der Plaz selwer an méi wéi den Feind nozemaachen. |
| `lane-formation` | Leit | Géigesätzlech Strömungen halen sech a getrennte Gaassen; d'Bewegung konzentréiert sech op e puer Trail, déi Match fir Match nees benotzt ginn. |
| `crowding` | Leit | Geschwindegkeet a Fluss falen, wann d'Eenheeten sech drängen; duerch e Engpass beweegen méi drécken manner duerch. |
| `leadership` | Leit | E puer Eenheeten dréinen als éischt, an anerer kopéieren hir Richtung e puer Sekonnen méi spéit. |
| `cohesion` | Leit | Eenheeten, déi sech vun hirer Grupp ewechdriwwen, stierwen méi dacks wéi déi, déi bei hir bleiwen. |
| `breaking-point` | Leit | Eng Säit, déi e Undeel vun hirer Kraaft verluer huet, hält op ze drécken a geet zréck, méi wéi d'Distanz zum Feind et erkläert. |
| `panic` | Leit | Ënner plötzlecher Bedrohung zerstreien sech d'Eenheeten, flitzen ewech oder frëre, an d'Koordinatioun fällt zesummen. |
| `loss-chasing` | Leit | No engem Verloscht huelen d'Eenheeten méi (oder manner) Risiko wéi no engem Gewënn. |
| `hot-hand` | Leit | Erfolleg follegt dacks op Erfolleg, méi wéi gemëschte Sequenzen vum selwechte Spiller et erlaben. |
| `conformity` | Leit | Mataarbechter vun enger Säit wielen gläich - Akeef, Ausrüstung, Weeër - iwwer hir eege Virléiften hinaus. |
| `suppression` | Leit | Feier, dat ukënnt, verännert, wéi Eenheeten sech beweegen a schéissen, och wann et net dout. |
| `social-loafing` | Leit | Aktioun pro Kapp fält, wann méi Kolleegen do sinn. |
| `mixed-strategy` | Leit | Wielen, déi onberechenbar sollte sinn, ginn e Muster: eng Optioun gewënnt méi, oder d'Wielen lafen a Sequenzen. |
| `coordination` | Leit | Mataarbechter handelen am Tak ouni sichtbar Befehl: synchroniséiert Bewegung, Timing a Wielen. |
| `contagion` | Leit | En Zoustand geet vun Eenheet zu Eenheet duerch Kontakt oder Nopesch a verbreet sech iwwer d'Kaart. |
| `territoriality` | Leit | Eenheeten halen Distanz vuneneen a bleiwen op hirem eegene Terrain. |
| `interaction-network` | Leit | Wien kämpft, ënnerstëtzt a follegt wiem, bildet en Netz mat Navën, Clustere a Bréckelen. |

### Konzepter (135) {#concepts-135}

| id | Titel | Lënsen | Muster | Quellen |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchester sengt Quadratgesetz (gezielt Feier) | Militäresch, Loft, E-Sport, Marine | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchester sengt linear Gesetz (Flächefeier, een géint een) | Militäresch, Stad, E-Sport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Konzentratioun vun der Kraaft (Mass) | Militäresch, Loft, Marine, E-Sport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Kraafverhältnisser an d'3:1-Regel | Militäresch | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Ofschossverhältnis | Militäresch, Loft, E-Sport, Design | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Kampfwäert an seng Multiplikatoren | Militäresch | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Dat modern System vum Kraafasaz | Militäresch | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | De OODA-Zyklus (beobachten, orientéieren, entscheeden, handelen) | Militäresch, Loft, E-Sport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Theorie vun der Energie-Manöverfäegkeet | Loft | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Grondmanöver vum Jagdfliger an Loftkampf-Manöver | Loft | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Terrainanalyse: OAKOC / KOCOA | Militäresch, Design, Stad | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: Missiounsvariabelen | Militäresch | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Schlëssel- a entscheedend Terrain | Militäresch, Design, E-Sport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Observatioun a Schossfelder | Militäresch, Design, E-Sport, Stad | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Deckung a Verstoppung | Militäresch, Stad, Design | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Ugangsachsen a Bewegungskorridoren | Militäresch, Design | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Engpässer a Schluchten | Militäresch, Design, E-Sport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Engagementszonen a Killzonen | Militäresch, Stad, Design | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Verteidegung um Réckhang a Versteckung | Militäresch, Design | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Dat héich Terrain | Militäresch, Design | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Innen- a Ausseliniën | Militäresch | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Stéck fir Stéck besiegt | Militäresch, E-Sport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Géigesäiteg Ënnerstëtzung | Militäresch, Loft, E-Sport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Kombinéiert Waffen | Militäresch, Design | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Ënnerdréckung | Militäresch, Stad | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Ënnerdréckung an Zerstéierung vun der Feindflak (SEAD/DEAD) | Loft, Militäresch | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Loftpatrull an Loftherrschaft (CAP) | Loft | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Gefecht ausserhalb vun der Siichtweit (BVR) | Loft | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Den indirekten Androck | Militäresch, E-Sport, Design | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Ëmfaassung an Ëmzéiung | Militäresch | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Hannerhalt | Militäresch, E-Sport, Design | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Verteidegung an der Déift | Militäresch | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Reibung an den Nebel vum Krich | Militäresch, E-Sport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Den héchste Punkt vum Ugrëff | Militäresch | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Iwwerraschung | Militäresch, Loft, Marine, E-Sport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Ekonomie vun der Kraaft | Militäresch, E-Sport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Stadterrain | Stad, Militäresch, E-Sport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Mierkontroll an déi entscheedend Flottenschluecht | Marine | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughes sengt Salvemodell: als Éischten effektiv ugräifen | Marine, Loft | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Such- a Detektiounstheorie | Marine, Loft, Militäresch | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operations Research: Moossen vun der Effektivitéit | Militäresch, Loft, Marine, Design | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Krichsspiller als Analyse | Militäresch, Design | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manöver-Krichsféierung | Militäresch, E-Sport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Zesummenhalt an de moralesche Faktor | Militäresch | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Schwéierpunkt | Militäresch | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Entscheedend Punkten | Militäresch, E-Sport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Operatiounslinnen | Militäresch | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategien vun Ausläschung an Erschöpfung | Militäresch | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Déif Schluecht a déif Operatiounen | Militäresch | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | Militäresch, Loft | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Missiounskommando (Auftragstaktik) | Militäresch, E-Sport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Duerchbroch an Ausnotzung | Militäresch | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Feier a Bewegung | Militäresch, E-Sport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Wiesselsprong mat Iwwerwaachung | Militäresch, E-Sport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Opklärungszuch an Infiltratioun | Militäresch, E-Sport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | D'Reserv | Militäresch, E-Sport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastesch Verteidegung an Géigeugrëff | Militäresch | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | D'Killkette (fannen, fixéieren, verfollegen, zilen, engagéieren, bewäerten) | Militäresch, Loft, Marine | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Detektiounsdistanz géint Engagementsdistanz | Loft, Marine, Militäresch | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Kampfeffektivitéitswäert | Militäresch, E-Sport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Streeung op dem Schluechtfeld | Militäresch, E-Sport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Nootkampfunterstëtzung aus der Loft (CAS) | Loft, Militäresch | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Loftinterdiktioun | Loft, Militäresch | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Eskort géint Jagdsweep | Loft | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energiekampf géint Drehkampf | Loft | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Lead-, Pure- an Lag-Verfollegung | Loft | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | De Thach-Weave | Loft | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | De Finger-Four an d'Kampfpaar | Loft | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flott als Drohung (Fleet in being) | Marine | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | Iwwer den T kreuzen | Marine, Militäresch | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoi | Marine | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Zougangsverhënnerung an Zonenverweigerung (A2/AD) | Marine, Loft, Militäresch | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Stützpunktverteidegung a bebaute Gebidder | Stad, Militäresch | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Mausloch-Method an de Bewegung duerch Gebaier | Stad, Militäresch, Design | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Belagerung | Militäresch, Stad | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guerillakrich | Militäresch, Stad | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Opstandsbekämpfung | Militäresch, Stad | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Zufluchtsoord | Militäresch, Design | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Täuschung (Maskirowka) | Militäresch, E-Sport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informatiounsvirdeel | Militäresch, E-Sport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Spuerronnen an Ressourcetempo | E-Sport, Design | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Bewegungsformatiounen: Linn, Kolonn, Keil, Echelon | Militäresch, E-Sport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontalen Ugrëff | Militäresch | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Duebel Ëmfaassung (d'Zaang) | Militäresch | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Ëmzéiung an de Kessel | Militäresch | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Penetratioun a Duerchbroch | Militäresch | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Verfolgung | Militäresch | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Réckzuch: Réckzuch, Verzögerung an Retraite | Militäresch | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Feint an Demonstratioun | Militäresch, E-Sport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Schutz, Wuecht a Deckung: Sécherheet virun dem Haaptkierper | Militäresch | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Géint eng Rakéit verteidegen: crank, notch, drag a pump | Loft | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formatiounen ausserhalb vun der Siichtweit: Wand, Lead-Trail, Grinder, Zaang | Loft | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Den Nosekampf an den Energiekampf | Loft | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Ugrëffspaket an d'Sequenz vun der Ënnerdréckung | Loft | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | D'Schluechtlinn | Marine | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | De fatale Trichter | Stad, Militäresch, E-Sport, Design | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Raum botzen: Iwwerraschung, Vitesse, kontrolléiert Gewalt | Stad, Militäresch, E-Sport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Dominanzpunkten | Stad, Militäresch, E-Sport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Ecken botzen: de Kuch schneiden | Stad, Militäresch, E-Sport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Kräiz- a Gegefeier a verschränkte Schossfelder | Militäresch, Stad, E-Sport, Design | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | De Virdeel vum Spioun (Peeker) | E-Sport, Design | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Mannvirdeel an Eliminatiounsronnen | E-Sport, Militäresch | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Entrée an den éischte Duell | E-Sport, Stad | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Utility virum Entrée: Blitz a Rauch | E-Sport, Stad, Militäresch | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Sozial-Kraaftmodell vun der Foussgängerbewegung | Design, Stad, Militäresch | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Gaassenbildung am Géigefloss | Design, Stad | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Méi séier ass méi lues | Design, Stad, Militäresch | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Dat grondleeënd Diagramm vun de Mengen | Design, Stad | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Trailbildung an Wonschlinnen | Design, Militäresch | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panik ass selten: kollektiv Widerstandsfäegkeet | Militäresch, Stad, Design | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: Trennung, Ausrichtung, Zesummenhalt | Design, Militäresch | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Ordnungsparameter an den Ufank vun der kollektiver Bewegung | Design, Militäresch, Loft, Marine | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Schwäermen, Kreesen a polariséiert Zoustänn | Design, Militäresch, Marine | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Wierksam Féierung ouni Signaler | Militäresch, E-Sport, Design | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Nopesch no der Zuel, net no der Distanz | Loft, Militäresch | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Schwäermintelligenz | Design, E-Sport, Militäresch | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Herding an Informatiounskaskaden | E-Sport, Design, Militäresch | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Sozialt Faulenzen | E-Sport, Design, Militäresch | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Verdeelung vun der Verantwortung | E-Sport, Militäresch | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Zesummenhalt an der Primärgrupp | Militäresch, E-Sport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Brechpunkten a Verloschtschwellen | Militäresch | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Ënnerdréckung: wat Feier nieft dem Doudmaachen mécht | Militäresch, Stad | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Angscht a Stress bei de Kampfentscheedungen | Militäresch, E-Sport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Versoen ënner Drock | E-Sport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Prospecttheorie a Verloschtaversioun | E-Sport, Design | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Break-even- a Hausgeld-Effekter | E-Sport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | E-Sport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Verluer Kapital (Sunk Cost) | E-Sport, Militäresch | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | D'waarm Hand an hiren Fehlschluss | E-Sport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Gemëschte Strategien: onberechenbar sinn | E-Sport, Design, Militäresch | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Gedeelte mental Modeller | E-Sport, Militäresch | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | D'Komponente vun der Teamaarbecht | E-Sport, Militäresch | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtuell Welte als Laboratoiren vum Verhalen | Design, E-Sport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Perséinleche Ofstand a Territorium | Design, Stad | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Interaktiounsnetzwierker: Navën a schwaach Bindungen | E-Sport, Design | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Methoden (37) {#methods-37}

| id | Titel | Muster | Quellen |
|---|---|---|---|
| `method.lanchester-fit` | Lanchester-Exponenten un Engagementsdaten upassen | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Ofschossverhältnis no Säit a no Plaz | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Lokaalt Kraafverhältnis am Moment vun all Ofschoss | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Siichtfeld: Schossfelder mat Sichtlinn | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Spezifesch Energie bei Ofschëss a Doudesfäll (Loft) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Hotspot-Bestänneg iwwer Matcher | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Trade-Quot (géigesäiteg Ënnerstëtzung) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Engagementer a Virdeel beim éischte Ofschoss | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Raumlech Autokorrelatioun vun den Doudesfäll (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Quoten géint d'eege Basis vun der Kaart, mat FDR-Kontroll | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Intelligenzvirbereedung vum Schluechtfeld (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Vergläichsmodeller fir Bewäertung (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Gewënnwahrscheinlechkeet a Bewäertung vun Aktiounen | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Raumkontroll an Terraincontroll | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | D'Salvegläichung op Schëffe am Kontakt upassen | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Kampfeffektivitéitsverhältnis pro Eenheet-Stonn am Asaz | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Distanzen vun der Detektioun bis zum Engagement | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Timing vun der Killkette | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Streeung géint Ofschossundeel (Konzentratioun vun der Kraaft an der Zäit) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Verloschtquot an Ofschëss pro Asaz | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Modell vun der Gewënnwahrscheinlechkeet pro Ronn | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Aktiounswäert: dobäi Gewënnwahrscheinlechkeet | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Ugepasst Plus-Minus duerch Ridge-Regressioun (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Schrumpfung: empiresch Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Erwaart Resultater: vun erwaarte Ziler bis zu erwaarte Duellen | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Opstellungen, Rotatiounen a Lurks miessen | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | D'Reflexiounsproblem: Kopie oder gemeinsam Ursaach | herding, conformity | Manski 1993 |
| `method.streak-correction` | Serien mat der Korrektur fir endlech Sequenzen | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Polariséierungs- a Kreesordnungsparameter | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Féierer aus der zäitverschobener Richtungskorrelatioun | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Route-Kaskaden-Test fir Herding | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Gaassentrennung an d'Dauerhaftegkeet vun de Trailen | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Nohängergefor | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Brechkurv | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Reaktioun op eegenkommend Feier | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risiko no engem Verloscht oder engem Gewënn | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Akeefsakkord (Fleiss' Kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Historesch Fäll (277) {#historical-cases-277}

| id | Fall | Wann | Gréisst | Muster | Quellen |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopylae | 480 v. Chr. | Schluecht | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 v. Chr. | Schluecht | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 v. Chr. | Schluecht | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctra | 371 v. Chr. | Schluecht | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 v. Chr. | Schluecht | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Lac Trasimene | 217 v. Chr. | Schluecht | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 v. Chr. | Schluecht | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburger Wald | n. Chr. 9 | Schluecht | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | Schluecht | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirling Bridge | 1297 | Schluecht | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | Schluecht | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | Schluecht | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | Schluecht | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | Schluecht | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | Schluecht | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | Gefecht | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | Gefecht | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickett's Charge | 1863 | Gefecht | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | Schluecht | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | Gefecht | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | Feldzuch | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | D'Somme, den éischte Dag | 1. Juli 1916 | Schluecht | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | Feldzuch | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | Schluecht | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | Schluecht | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan a d'Ardennen | Mee 1940 | Feldzuch | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Géigeugrëff bei Arras | 21. Mee 1940 | Gefecht | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Battle of Britain | Juli-Okt. 1940 | Feldzuch | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Schluecht am Atlantik: Operations Research bei de Konvoien | 1939-45 | Feldzuch | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | Juni 1942 | Schluecht | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Zweete El Alamein | Okt.-Nov. 1942 | Schluecht | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine Pass | Feb. 1943 | Schluecht | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | Aug. 1942-Feb. 1943 | Feldzuch | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | Juli 1943 | Feldzuch | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12. Juli 1943 | Gefecht | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. Juni 1944 | Gefecht | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandie-Hecken | Juni-Juli 1944 | Feldzuch | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operatioun Cobra | Juli 1944 | Feldzuch | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte Gulf | Okt. 1944 | Schluecht | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | Dez. 1944 | Schluecht | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | Mee 1905 | Schluecht | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | Sept. 1950 | Feldzuch | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | Feldzuch | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | Schluecht | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | Nov. 1965 | Gefecht | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operatioun Bolo | 2. Jan. 1967 | Gefecht | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: d'Tal vun de Trännen | Okt. 1973 | Schluecht | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinai: d'Chinese Farm | Okt. 1973 | Schluecht | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa-Tal (Operatioun Mole Cricket 19) | Juni 1982 | Schluecht | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Falklands-Loftkrich | Mee-Juni 1982 | Feldzuch | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Desert Storm Loftkampagne | Jan.-Feb. 1991 | Feldzuch | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. Feb. 1991 | Gefecht | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | Okt. 1993 | Gefecht | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | Dez. 1994-Feb. 1995 | Schluecht | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | Jan.-Mäerz 1968 | Schluecht | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kosovo-Loftkampagne | Mäerz-Juni 1999 | Feldzuch | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (Operatioun Al Fajr) | Nov. 2004 | Schluecht | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | Feldzuch | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesh | ongeféier 1274 v. Chr. | Schluecht | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issus | 333 v. Chr. | Schluecht | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 v. Chr. | Schluecht | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 v. Chr. | Schluecht | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsalus | 48 v. Chr. | Schluecht | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopel | n. Chr. 378 | Schluecht | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | n. Chr. 636 | Schluecht | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | Schluecht | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | Schluecht | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | Schluecht | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | Schluecht | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | Schluecht | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | Schluecht | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | Schluecht | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | Schluecht | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltawa | 1709 | Schluecht | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | Schluecht | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | Feldzuch | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | Schluecht | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | Schluecht | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | Schluecht | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | Schluecht | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | Schluecht | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | Schluecht | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | Feldzuch | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | Schluecht | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | Schluecht | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | Schluecht | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | Schluecht | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | Gefecht | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | Feldzuch | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | Nov. 1917 | Schluecht | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | Okt.-Nov. 1917 | Feldzuch | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | D'däitsch Fréijoersoffensiv (Operatioun Michael) | Mäerz-Abr. 1918 | Feldzuch | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | Aug. 1918 | Schluecht | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | Aug. 1939 | Schluecht | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | De polnesche Feldzuch | Sept. 1939 | Feldzuch | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut a Gembloux | Mee 1940 | Schluecht | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | Mee 1940 | Gefecht | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | D'Dünkirchen-Perimeter | Mee-Juni 1940 | Feldzuch | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operatioun Compass a Beda Fomm | Dez. 1940-Feb. 1941 | Feldzuch | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operatioun Crusader a Sidi Rezegh | Nov.-Dez. 1941 | Feldzuch | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | Mee-Juni 1942 | Schluecht | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | Aug.-Sept. 1942 | Schluecht | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | Juni 1941 | Schluecht | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Kiew-Kessel | Sept. 1941 | Feldzuch | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskau | Okt. 1941-Jan. 1942 | Feldzuch | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rschew an Operatioun Mars | 1942 | Feldzuch | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Zweete Charkow | Mee 1942 | Schluecht | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Drëtte Charkow (dem Manstein sengen Réckschlag) | Feb.-Mäerz 1943 | Feldzuch | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operatioun Bagration | Juni-Aug. 1944 | Feldzuch | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | De Kessel vu Korsun-Tscherkassy | Jan.-Feb. 1944 | Schluecht | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | De Kessel vu Kamenez-Podolsk | Mäerz-Abr. 1944 | Feldzuch | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operatioun Epsom | Juni 1944 | Schluecht | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operatioun Goodwood | Juli 1944 | Schluecht | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operatioun Totalize | Aug. 1944 | Schluecht | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | Aug. 1944 | Schluecht | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | De Kessel vu Falaise | Aug. 1944 | Feldzuch | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden a Arnhem | Sept. 1944 | Feldzuch | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | Okt. 1944 | Schluecht | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenwald | Sept. 1944-Feb. 1945 | Feldzuch | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | Sept. 1944 | Schluecht | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | Dez. 1944 | Schluecht | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborner Kamm | Dez. 1944 | Schluecht | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow-Héichten | Abr. 1945 | Schluecht | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | Abr.-Mee 1945 | Schluecht | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operatioun Fréijoerserwächen | Mäerz 1945 | Schluecht | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | Dez. 1943 | Schluecht | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Opstand vu Warschau | Aug.-Okt. 1944 | Feldzuch | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | Nov. 1943 | Schluecht | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | Sept.-Nov. 1944 | Schluecht | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | Feb.-Mäerz 1945 | Schluecht | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | Abr.-Juni 1945 | Feldzuch | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | Feb.-Mäerz 1945 | Schluecht | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mandschurei (August-Sturm) | Aug. 1945 | Feldzuch | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | De Pusan-Perimeter | Aug.-Sept. 1950 | Feldzuch | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosin-Stausee | Nov.-Dez. 1950 | Feldzuch | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjin-Fluss | Abr. 1951 | Schluecht | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | Abr. 1951 | Schluecht | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | Abr. und Juli 1953 | Gefecht | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | Jan.-Abr. 1968 | Schluecht | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | Nov. 1967 | Schluecht | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap-Bia-Berg) | Mee 1969 | Gefecht | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | Juni 1967 | Schluecht | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | Okt. 1973 | Schluecht | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | Juni 1982 | Gefecht | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Belagerung vu Beirut | Juni-Aug. 1982 | Feldzuch | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Jbeil an d'Panzerofwehr-Bedrohung | Juli-Aug. 2006 | Feldzuch | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | Feb. 1986 | Schluecht | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | Jan.-Feb. 1987 | Schluecht | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | Jan.-Feb. 1991 | Schluecht | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Zil Norfolk | 26.-27. Feb. 1991 | Schluecht | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina-Rigg | 27. Feb. 1991 | Schluecht | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | D'Scheinangrëffer am Wadi al-Batin | Feb. 1991 | Feldzuch | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | Mäerz 2003 | Schluecht | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Zil Peach | Abr. 2003 | Gefecht | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | D'Thunder Runs | Abr. 2003 | Schluecht | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debecka-Pass | Abr. 2003 | Gefecht | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | Feldzuch | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | Mäerz-Mee 2008 | Schluecht | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operatioun Anaconda | Mäerz 2002 | Schluecht | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | Juli 2008 | Gefecht | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | Okt. 2009 | Gefecht | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala an d'Plattoonshäiser | 2006-07 | Feldzuch | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | D'Schluecht vun Algier | 1956-57 | Feldzuch | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | D'rhodesesch Fireforce | 1974-79 | Feldzuch | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | D'Belagerung vu Sarajevo | 1992-96 | Feldzuch | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grosny 1999-2000 | Dez. 1999-Feb. 2000 | Schluecht | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Russesch-georgeschen Krich | Aug. 2008 | Feldzuch | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillja | Juli 2014 | Gefecht | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilowajsk | Aug. 2014 | Schluecht | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debalzewe | Jan.-Feb. 2015 | Schluecht | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | De Flughafen Donezk | Sept. 2014-Jan. 2015 | Schluecht | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | De Flughafen Hostomel | Feb. 2022 | Gefecht | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | D'Kiewer Achs an den Hannerhalt bei Browary | Mäerz 2022 | Gefecht | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol an Asowstal | Feb.-Mee 2022 | Schluecht | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | D'Charkiwer Géigeoffensiv | Sept. 2022 | Feldzuch | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | D'Iwwerquerung vum Siwerski Donez bei Bilohorivka | Mee 2022 | Gefecht | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bachmut | Aug. 2022-Mee 2023 | Schluecht | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | D'Saporischschja-Offensiv | Juni-Nov. 2023 | Feldzuch | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | De Krich vu Bergkarabach | Sept.-Nov. 2020 | Feldzuch | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | D'Blitz | Sept. 1940-Mee 1941 | Feldzuch | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: den éischte Dag an der Loft | 22. Juni 1941 | Schluecht | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | Mee 1941 | Schluecht | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | D'Belagerung vu Malta | 1940-1942 | Feldzuch | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | D'Loftbrécke vu Stalingrad | Nov. 1942-Feb. 1943 | Feldzuch | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Loftkämpf iwwer dem Kuban | Abr.-Juni 1943 | Feldzuch | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk an der Loft | Juli 1943 | Schluecht | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operatioun Bagration an der Loft | Juni-Aug. 1944 | Feldzuch | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operatioun Tidal Wave) | 1. Aug. 1943 | Gefecht | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | De Dämmraid (Operatioun Chastise) | 16.-17. Mee 1943 | Gefecht | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (Operatioun Gomorrha) | Juli-Aug. 1943 | Schluecht | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. Aug. 1943 | Schluecht | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Zweete Schweinfurt ("Schwaarze Donneschdeg") | 14. Okt. 1943 | Gefecht | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Operatioun Argument) | Feb. 1944 | Feldzuch | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | De Nürnberg-Raid | 30.-31. Mäerz 1944 | Gefecht | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operatioun Bodenplatte | 1. Jan. 1945 | Schluecht | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | D'Schluecht an der Bismarcksee | Mäerz 1943 | Schluecht | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | D'Neutraliséierung vu Rabaul | 1943-1944 | Feldzuch | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Philippinesch Mier ("Marianas Turkey Shoot") | Juni 1944 | Schluecht | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Schwaarze Dënschdeg iwwer Namsi | 23. Okt. 1951 | Gefecht | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operatioun Rolling Thunder | 1965-1968 | Feldzuch | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | D'Thanh-Hoa-Bréck | 1965-1972 | Gefecht | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | D'Wild Weasels | 1965-1973 | Feldzuch | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Den Ault-Bericht a Top Gun | 1968-1972 | Feldzuch | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operatioun Linebacker | Mee-Okt. 1972 | Feldzuch | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("den Elwe-Deeg-Krich") | Dez. 1972 | Feldzuch | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operatioun Focus (Moked) | 5. Juni 1967 | Schluecht | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Zermürbungskrich: de Raketegürtel | 1969-1970 | Feldzuch | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | De SAM-Schirm iwwer dem Kanal | Okt. 1973 | Schluecht | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operatioun Opera) | 7. Juni 1981 | Gefecht | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operatioun El Dorado Canyon | 15. Abr. 1986 | Gefecht | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | De Loftkrich Iran-Irak | 1980-1988 | Feldzuch | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black-Buck-Iwwerfäll | Mee-Juni 1982 | Gefecht | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: d'Planung vum Golfkrich-Loftkampf | Aug. 1990-Jan. 1991 | Feldzuch | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: den éischte Apache-Schlag | 17. Jan. 1991 | Gefecht | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | D'Groussjagd op d'Scud | Jan.-Feb. 1991 | Feldzuch | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla-Rigg ("Autobunn vum Doud") | 26.-27. Feb. 1991 | Gefecht | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operatioun Anaconda: Apaches am Shahi-Kot | Mäerz 2002 | Schluecht | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | De Apache-Angrëff bei Karbala | 24. Mäerz 2003 | Gefecht | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | D'libesch Loftkampagne | Mäerz-Okt. 2011 | Feldzuch | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Bergkarabach: Drohnen an Loftverteidegung | Sept.-Nov. 2020 | Feldzuch | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | D'Ukrain: d'ëmkämpfte Loft | 2022 | Feldzuch | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | De Flughafen Hostomel | Feb. 2022 | Gefecht | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | Feb.-Mäerz 1971 | Feldzuch | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operatioun Eagle Claw | Abr. 1980 | Gefecht | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghanistan: d'Stinger | 1986-1989 | Feldzuch | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | Schluecht | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | D'spuenesch Armada | 1588 | Feldzuch | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberon Bay | 1759 | Schluecht | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | D'Chesapeake (Virginia Capes) | 1781 | Schluecht | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | De Nil (Aboukir Bay) | 1798 | Schluecht | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhagen | 1801 | Schluecht | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | Mäerz 1862 | Gefecht | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | Schluecht | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | De Yalu | 1894 | Schluecht | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manila Bay | 1898 | Schluecht | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgoland-Bucht | Aug. 1914 | Schluecht | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel an d'Falklands | Nov.-Dez. 1914 | Feldzuch | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | Jan. 1915 | Schluecht | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | De River Plate | Dez. 1939 | Schluecht | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | Nov. 1940 | Gefecht | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Kap Matapan | Mäerz 1941 | Schluecht | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | D'Dänemarkstrooss an d'Versenkung vun der Bismarck | Mee 1941 | Feldzuch | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. Dez. 1941 | Gefecht | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales a Repulse | 10. Dez. 1941 | Gefecht | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | D'Javasee | Feb. 1942 | Schluecht | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | D'Korallesee | Mee 1942 | Schluecht | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo-Insel | Aug. 1942 | Schluecht | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | D'Ëstlech Salomonen | Aug. 1942 | Schluecht | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Kap Esperance | Okt. 1942 | Schluecht | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | D'Santa-Cruz-Inselen | Okt. 1942 | Schluecht | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Marineschluecht vu Guadalcanal | 12.-15. Nov. 1942 | Schluecht | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | Nov. 1942 | Gefecht | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | De Kanal-Sprong | Feb. 1942 | Gefecht | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operatioun Pedestal | Aug. 1942 | Schluecht | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Schwaarze Mee | Mee 1943 | Feldzuch | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Nordkap | Dez. 1943 | Schluecht | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | D'US-U-Boot-Kampagne géint Japan | 1941-1945 | Feldzuch | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Virun Samar | 25. Okt. 1944 | Schluecht | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | D'Surigao-Stroos | 25. Okt. 1944 | Schluecht | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: d'Kamikaze-Kampagne | Abr.-Juni 1945 | Feldzuch | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | D'Versenkung vun der Eilat | Okt. 1967 | Gefecht | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | Okt. 1973 | Schluecht | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | D'Versenkung vun der General Belgrano | 2. Mee 1982 | Gefecht | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | De Verloscht vun HMS Sheffield | 4. Mee 1982 | Gefecht | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. Mee 1987 | Gefecht | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operatioun Praying Mantis | 18. Abr. 1988 | Schluecht | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | Aug. 2004 | Gefecht | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | D'Bisu-Revolutioun | Mäerz 2007 | Schluecht | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | De Dream Coil bei The International 2013 | Aug. 2013 | Gefecht | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker säi Zed géint Ryu | Sept. 2013 | Gefecht | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | De Boost vun der Overpass | Nov. 2014 | Gefecht | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | De sprangende AWP op Mirage | Abr. 2016 | Gefecht | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis an d'Utility-Ära | 2018 | Feldzuch | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five géint OG | Abr. 2019 | Schluecht | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar erreecht Grandmaster | 2019 | Feldzuch | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Den lénksen Haken (Desert-Storm-Buedemoffensiv) | 24.-28. Feb. 1991 | Feldzuch | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | De Corrupted-Blood-Vorfall | Sept. 2005 | Feldzuch | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Spill- a Levelsdesign (17) {#game-and-level-design-17}

| id | Titel | Muster | Quellen |
|---|---|---|---|
| `design.chokepoint` | Engpässer am Leveldesign | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Flankenrouten an alternativ Weeër | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Siichtlinnen an Engagementsdistanz | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Plazéierung vun der Deckung an hirem Rhythmus | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Spawn-Design a Spawnschutz | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Balance vun symmetresche a asymmetresche Kaarten | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Klassebalance a Géigenmoossnamen | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Fluss, Schleifen a liesbar Layouten | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Spillekonomien a Feedbackschleifen | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking a Fäegkeetsverdeelung | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | KI-Géigner als Level-Sonden | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Sënnvollt Spill a Wiel | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Trading a Teamspill bei Shootern | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kaartkontroll | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Heatmaps a räumlech Telemetrie am Design | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Beherrschung, Léieren a Spaass | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Ronnekonomien a Kafentscheedungen | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Studien (113) {#studies-113}

| id | Titel | Quellen |
|---|---|---|
| `study.engel-1954` | Engel: Lanchester sengt Quadratgesetz bei Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchester-Modeller an den Ardennen | Bracken 1995 |
| `study.fricker-1998` | Fricker: Verloschtmodeller an den Ardennen nach emol ugekuckt | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas a Turkes: Kursk an d'Ardennen | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley a Helmbold: d'Quadratgesetz validéieren | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-Analyse vun de Spillerdoudesfäll | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: d'Visualiséierung vum kompetitive Verhalen | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | D'Bewäertung vun Aktiounen an Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Begegnungserkennung am E-Sport | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: Loftkampf iwwer Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: quantifizéiert Urteel iwwer historesch Schluechten | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: d'Kraafasaz erkläert d'Resultater | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Iwwersiicht iwwer d'Visualiséierung vun Spillerdaten | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester géint dräi Joerhonnerte Landschluechten | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: sechzeg Engagementer vum Zweete Weltkrich | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: Kampfmodeller an den amerikanesche Biergerkrich | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: en statistescht Modell fir Verloschtdaten | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: Vorrückungsraten am Landkampf | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas a Dinges: d'Ëmstänn si méi wichteg wéi d'Gesetz | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | D'Kursk-Datebank | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | D'Datebank vun der Ardennen-Kampagne | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson a MacKay: d'Schluecht ëm Groussbritannien als Lanchester-Donnéeën | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte a Schmidt: Zuelen gewannen nach ëmmer Schluechten | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: Regelméissegkeete bei de Schluechtverloschter | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy sengt Taktesch Numeresch Deterministesch Modell | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: Krich a Zuelen | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: d'Kampfkraaft | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter a Stam: Demokratien am Krich | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: dat adaptiv dynamescht Modell | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester an de Guerillakrich | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: dat stochastescht Salvemodell | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: d'Eckstäin vun der Flottentaktik | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | D'Debatt ëm d'3:1-Regel | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: d'Modelléierung vu bewaffnete Konflikter | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | De Ault-Bericht: Raketen ofgeschoss ausserhalb vun hirer Enveloppe | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blacketts Zirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Tiefladungseinstellungen bei der Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Wäiss Ënnersäit bei U-Boot-Jagdfligeren | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: d'Panzerung do, wou d'zréckkomm Bommfligeren net getraff goufen | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimal Sichen: vun U-Booter bis AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: Kampf an der Hell | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Zougangsverhënnerung an Zonenverweigerung | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Wéi Spiller hiert Interesse verléieren | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Clustering vum Spillerverhalen an der Praxis | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Erkennen vu Spillerfrustratioun | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: Telemetrie-Dashboards an der Produktioun | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: visuell Analyse vum Spill | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Avatarbewegung an de World-of-Warcraft-Schluechtfelder | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: Benotzertester op grousser Skala instrumentéieren | Kim et al. 2008 |
| `study.game-data-science` | Spill-Datenwëssenschaft | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Kënschtlech Intelligenz an Spiller | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Skill an d'Teambeweegung an Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Kampfmuster, déi MOBA-Gewënn viraussoen | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Spillerrollen an Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Dota-2-Resultater aus de Drafts viraussoen | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Live-Gewënnvirsoen am Profi-E-Sport | Hodge et al. 2021 |
| `study.rioult-2014` | Topologie vun de Spilleraposen | Rioult et al. 2014 |
| `study.bednarek-2017` | Spiller a Team-Shootern bewäerten | Bednárek et al. 2017 |
| `study.katona-2019` | Viraussoen, wien als nächst stierft | Katona et al. 2019 |
| `study.block-2018` | Date-baséiert Geschichten fir E-Sport-Publikum | Block et al. 2018 |
| `study.ggviz` | ggViz: Spillzoustänn an der Skala sichen | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: grouss Skala-Verstäerkungslernen an Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: Grandmaster-Niveau an StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Erwaart Ballbesëtzwäert am Basketball | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: Aktiounen um Ball am Fussball bewäerten | Decroos et al. 2019 |
| `study.pitch-control` | Feldkontroll a Raumschafung | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | D'Raumstruktur vun der defensiver Fäegkeet | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Team-Rollen aus Tracking-Donnéeën | Lucey et al. 2013 |
| `study.shot-quality` | Erwaart Goals a Schossqualitéit | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: räumlech Schoss-Effizienz | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Raum-zäitlech Analyse vun Teamsport | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley's K: Clustering op all Skalen | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark a Evans: Verdeelung vun de nootste Noparen | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord-Hotspots | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokal Indikatoren vun der räumlecher Associatioun | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | D'räumlech Scan-Statistik | Kulldorff 1997 |
| `study.kde` | Kernel-Dichteschätzung | Silverman 1986 |
| `study.knox-1964` | Raum-Zäit-Interaktioun | Knox 1964; Diggle 2013 |
| `study.maup` | De modifizéierbare Flächeneenheeten-Problem | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovisten a Siichtgraphen | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Raumsyntax | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Duerchschnëttlech Gedrängtheet | Lloyd 1967 |
| `study.survival-analysis` | Iwwerliewensanalyse fir d'Zäit bis zum Doud | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Verallgemeinert linear Modeller fir Zuelen | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap a Konfidenzintervaller | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: Latenz an de Peeker-Virdeel | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee a Chang: Schoss ronderëm e Eck | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: Latenz an d'Spilleraktiounen | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: Profien a Amateuren duerch d'Gewënnwahrscheinlechkeet | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: wirtschaftlech Entscheedungen an Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: clever Ofschëss a wäertlos Doudesfäll | Maymin 2021 |
| `study.moba-live-prediction` | Live-Resultatsvirhersoe bei MOBAs | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: Valorant-Ronnen aus taktesche Mierkmalen | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: Rollen am Profi-Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: Nahkampf-Training | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Massenturbulenz beim Hajj 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Gehgruppen formen Mengen | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarchesch Gruppendynamik bei Taubefluchten | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Sozialen Afloss mécht Erfolleg ongläich a net virausgesinn | Salganik et al. 2006 |
| `study.wisdom-undermined` | Sozialen Afloss ënnergräift d'Weisheet vun de Mengen | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | D'Unzéiungskraaft vun enger Mass | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Konformitéit mat enger einstëmmeger Mehrheet | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: Kampfmotivatioun am Irak | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Zesummenhalt a Leeschtung: Meta-Analysen | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Verloschtaversioun bei Profi-Golfer | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Waarm Hänn am Baseball | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Penalty-Schéiss: Profien spillen Minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimax-Spill bei Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Kollektiv Intelligenz vun Teams | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Sozial Netzwierker an enger Online-Welt | Szell et al. 2010 |
| `study.team-networks` | Passnetzwierker a Teamleeschtung | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Verhalen verbreet sech duerch geclusterte Netzwierker | Centola 2010 |

### Bibliografie {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(geprüft 2026-11-15: Detail)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(geprüft 2026-11-15: Detail)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(geprüft 2026-11-15: Detail)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(geprüft 2026-11-15: Detail)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(geprüft 2026-11-15: Detail)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(geprüft 2026-11-15: Detail)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(geprüft 2026-11-15: Detail)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(geprüft 2026-11-15: Detail)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(geprüft 2026-11-15: Detail)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(geprüft 2026-11-15: Detail)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(geprüft 2026-11-15: Detail)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(geprüft 2026-11-15: Detail)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(geprüft 2026-11-15: Detail)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(geprüft 2026-11-15: Detail)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(geprüft 2026-11-15: Detail)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(geprüft 2026-11-15: Detail)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(geprüft 2026-11-15: Detail)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(geprüft 2026-11-15: Detail)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(geprüft 2026-11-15: Detail)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(geprüft 2026-11-15: Detail)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(geprüft 2026-11-15: Detail)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(geprüft 2026-11-15: Detail)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(geprüft 2026-11-15: Detail)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(geprüft 2026-11-15: Detail)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(geprüft 2026-11-15: Detail)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(geprüft 2026-11-15: Detail)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(geprüft 2026-11-15: Detail)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(geprüft 2026-11-15: Existenz)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(geprüft 2026-11-15: Detail)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(geprüft 2026-11-15: Detail)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(geprüft 2026-11-15: Detail)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(geprüft 2026-11-15: Detail)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(geprüft 2026-11-15: Detail)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(geprüft 2026-11-15: Detail)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(geprüft 2026-11-15: Existenz)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(geprüft 2026-11-15: Detail)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(geprüft 2026-11-15: Detail)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(geprüft 2026-11-15: Detail)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(geprüft 2026-11-15: Detail)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(geprüft 2026-11-15: Detail)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(geprüft 2026-11-15: Detail)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(geprüft 2026-11-15: Existenz)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(geprüft 2026-11-15: Detail)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(geprüft 2026-11-15: Detail)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(geprüft 2026-11-15: Detail)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(geprüft 2026-11-15: Detail)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(geprüft 2026-11-15: Existenz)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(geprüft 2026-11-15: Detail)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(geprüft 2026-11-15: Detail)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(geprüft 2026-11-15: Detail)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(geprüft 2026-11-15: Detail)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(geprüft 2026-11-15: Existenz)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(geprüft 2026-11-15: Detail)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(geprüft 2026-11-15: Detail)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(geprüft 2026-11-15: Detail)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(geprüft 2026-11-15: Detail)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(geprüft 2026-11-15: Detail)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(geprüft 2026-11-15: Detail)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(geprüft 2026-11-15: Detail)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(geprüft 2026-11-15: Detail)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(geprüft 2026-11-15: Detail)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(geprüft 2026-11-15: Detail)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(geprüft 2026-11-15: Detail)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(geprüft 2026-11-15: Detail)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(geprüft 2026-11-15: Detail)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(geprüft 2026-11-15: Detail)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(geprüft 2026-11-15: Detail)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(geprüft 2026-11-15: Detail)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(geprüft 2026-11-15: Detail)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(geprüft 2026-11-15: Detail)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(geprüft 2026-11-15: Detail)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(geprüft 2026-11-15: Detail)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(geprüft 2026-11-15: Detail)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(geprüft 2026-11-15: Existenz)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(geprüft 2026-11-15: Detail)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(geprüft 2026-11-15: Detail)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(geprüft 2026-11-15: Detail)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(geprüft 2026-11-15: Existenz)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(geprüft 2026-11-15: Existenz)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(geprüft 2026-11-15: Detail)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(geprüft 2026-11-15: Detail)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(geprüft 2026-11-15: Detail)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(geprüft 2026-11-15: Existenz)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(geprüft 2026-11-15: Detail)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(geprüft 2026-11-15: Detail)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(geprüft 2026-11-15: Detail)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(geprüft 2026-11-15: Detail)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(geprüft 2026-11-15: Detail)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(geprüft 2026-11-15: Existenz)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(geprüft 2026-11-15: Detail)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(geprüft 2026-11-15: Detail)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(geprüft 2026-11-15: Detail)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(geprüft 2026-11-15: Detail)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(geprüft 2026-11-15: Detail)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(geprüft 2026-11-15: Detail)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(geprüft 2026-11-15: Detail)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(geprüft 2026-11-15: Existenz)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(geprüft 2026-11-15: Detail)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(geprüft 2026-11-15: Detail)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(geprüft 2026-11-15: Detail)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(geprüft 2026-11-15: Detail)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(geprüft 2026-11-15: Detail)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(geprüft 2026-11-15: Detail)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(geprüft 2026-11-15: Detail)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(geprüft 2026-11-15: Detail)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(geprüft 2026-11-15: Detail)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(geprüft 2026-11-15: Existenz)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(geprüft 2026-11-15: Detail)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(geprüft 2026-11-15: Detail)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(geprüft 2026-11-15: Detail)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(geprüft 2026-11-15: Detail)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(geprüft 2026-11-15: Detail)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(geprüft 2026-11-15: Detail)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(geprüft 2026-11-15: Detail)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(geprüft 2026-11-15: Detail)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(geprüft 2026-11-15: Detail)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(geprüft 2026-11-15: Detail)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(geprüft 2026-11-15: Detail)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(geprüft 2026-11-15: Detail)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(geprüft 2026-11-15: Detail)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(geprüft 2026-11-15: Detail)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(geprüft 2026-11-15: Detail)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(geprüft 2026-11-15: Detail)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(geprüft 2026-11-15: Detail)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(geprüft 2026-11-15: Detail)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(geprüft 2026-11-15: Existenz)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(geprüft 2026-11-15: Detail)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(geprüft 2026-11-15: Detail)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(geprüft 2026-11-15: Detail)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(geprüft 2026-11-15: Detail)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(geprüft 2026-11-15: Detail)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(geprüft 2026-11-15: Detail)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(geprüft 2026-11-15: Detail)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(geprüft 2026-11-15: Detail)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(geprüft 2026-11-15: Detail)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(geprüft 2026-11-15: Detail)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(geprüft 2026-11-15: Detail)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(geprüft 2026-11-15: Detail)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(geprüft 2026-11-15: Detail)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(geprüft 2026-11-15: Detail)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(geprüft 2026-11-15: Detail)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(geprüft 2026-11-15: Detail)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(geprüft 2026-11-15: Detail)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(geprüft 2026-11-15: Detail)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(geprüft 2026-11-15: Detail)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(geprüft 2026-11-15: Detail)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(geprüft 2026-11-15: Detail)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(geprüft 2026-11-15: Detail)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(geprüft 2026-11-15: Detail)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(geprüft 2026-11-15: Detail)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(geprüft 2026-11-15: Detail)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(geprüft 2026-11-15: Detail)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(geprüft 2026-11-15: Detail)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(geprüft 2026-11-15: Detail)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(geprüft 2026-11-15: Detail)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(geprüft 2026-11-15: Detail)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(geprüft 2026-11-15: Detail)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(geprüft 2026-11-15: Detail)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(geprüft 2026-11-15: Detail)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(geprüft 2026-11-15: Detail)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(geprüft 2026-11-15: Detail)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(geprüft 2026-11-15: Detail)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(geprüft 2026-11-15: Detail)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(geprüft 2026-11-15: Detail)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(geprüft 2026-11-15: Detail)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(geprüft 2026-11-15: Detail)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(geprüft 2026-11-15: Detail)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(geprüft 2026-11-15: Detail)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(geprüft 2026-11-15: Detail)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(geprüft 2026-11-15: Detail)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(geprüft 2026-11-15: Detail)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(geprüft 2026-11-15: Detail)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(geprüft 2026-11-15: Detail)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(geprüft 2026-11-15: Detail)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(geprüft 2026-11-15: Existenz)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(geprüft 2026-11-15: Detail)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(geprüft 2026-11-15: Detail)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(geprüft 2026-11-15: Detail)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(geprüft 2026-11-15: Detail)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(geprüft 2026-11-15: Detail)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(geprüft 2026-11-15: Detail)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(geprüft 2026-11-15: Detail)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(geprüft 2026-11-15: Detail)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(geprüft 2026-11-15: Detail)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(geprüft 2026-11-15: Detail)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(geprüft 2026-11-15: Detail)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(geprüft 2026-11-15: Detail)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(geprüft 2026-11-15: Detail)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(geprüft 2026-11-15: Detail)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(geprüft 2026-11-15: Detail)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(geprüft 2026-11-15: Detail)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(geprüft 2026-11-15: Detail)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(geprüft 2026-11-15: Detail)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(geprüft 2026-11-15: Detail)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(geprüft 2026-11-15: Detail)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(geprüft 2026-11-15: Detail)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(geprüft 2026-11-15: Detail)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(geprüft 2026-11-15: Existenz)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(geprüft 2026-11-15: Detail)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(geprüft 2026-11-15: Detail)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(geprüft 2026-11-15: Detail)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(geprüft 2026-11-15: Detail)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(geprüft 2026-11-15: Detail)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(geprüft 2026-11-15: Detail)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(geprüft 2026-11-15: Detail)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(geprüft 2026-11-15: Detail)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(geprüft 2026-11-15: Detail)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(geprüft 2026-11-15: Detail)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(geprüft 2026-11-15: Detail)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(geprüft 2026-11-15: Detail)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(geprüft 2026-11-15: Detail)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(geprüft 2026-11-15: Existenz)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(geprüft 2026-11-15: Detail)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(geprüft 2026-11-15: Detail)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(geprüft 2026-11-15: Detail)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(geprüft 2026-11-15: Detail)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(geprüft 2026-11-15: Detail)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(geprüft 2026-11-15: Detail)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(geprüft 2026-11-15: Detail)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(geprüft 2026-11-15: Detail)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(geprüft 2026-11-15: Detail)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(geprüft 2026-11-15: Detail)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(geprüft 2026-11-15: Existenz)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(geprüft 2026-11-15: Detail)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(geprüft 2026-11-15: Detail)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(geprüft 2026-11-15: Detail)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(geprüft 2026-11-15: Detail)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(geprüft 2026-11-15: Detail)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(geprüft 2026-11-15: Existenz)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(geprüft 2026-11-15: Detail)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(geprüft 2026-11-15: Detail)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(geprüft 2026-11-15: Detail)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(geprüft 2026-11-15: Detail)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(geprüft 2026-11-15: Detail)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(geprüft 2026-11-15: Existenz)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(geprüft 2026-11-15: Detail)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(geprüft 2026-11-15: Detail)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(geprüft 2026-11-15: Detail)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(geprüft 2026-11-15: Detail)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(geprüft 2026-11-15: Existenz)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(geprüft 2026-11-15: Detail)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(geprüft 2026-11-15: Detail)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(geprüft 2026-11-15: Detail)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(geprüft 2026-11-15: Detail)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(geprüft 2026-11-15: Detail)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(geprüft 2026-11-15: Detail)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(geprüft 2026-11-15: Detail)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(geprüft 2026-11-15: Detail)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(geprüft 2026-11-15: Detail)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(geprüft 2026-11-15: Detail)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(geprüft 2026-11-15: Existenz)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(geprüft 2026-11-15: Detail)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(geprüft 2026-11-15: Detail)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(geprüft 2026-11-15: Detail)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(geprüft 2026-11-15: Detail)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(geprüft 2026-11-15: Detail)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(geprüft 2026-11-15: Detail)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(geprüft 2026-11-15: Detail)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(geprüft 2026-11-15: Detail)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(geprüft 2026-11-15: Detail)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(geprüft 2026-11-15: Detail)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(geprüft 2026-11-15: Existenz)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(geprüft 2026-11-15: Existenz)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(geprüft 2026-11-15: Detail)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(geprüft 2026-11-15: Detail)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(geprüft 2026-11-15: Detail)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(geprüft 2026-11-15: Detail)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(geprüft 2026-11-15: Detail)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(geprüft 2026-11-15: Existenz)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(geprüft 2026-11-15: Existenz)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(geprüft 2026-11-15: Detail)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(geprüft 2026-11-15: Detail)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(geprüft 2026-11-15: Existenz)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(geprüft 2026-11-15: Detail)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(geprüft 2026-11-15: Detail)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(geprüft 2026-11-15: Detail)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(geprüft 2026-11-15: Detail)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(geprüft 2026-11-15: Detail)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(geprüft 2026-11-15: Detail)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(geprüft 2026-11-15: Detail)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(geprüft 2026-11-15: Detail)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(geprüft 2026-11-15: Detail)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(geprüft 2026-11-15: Detail)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(geprüft 2026-11-15: Detail)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(geprüft 2026-11-15: Detail)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(geprüft 2026-11-15: Detail)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(geprüft 2026-11-15: Detail)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(geprüft 2026-11-15: Existenz)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(geprüft 2026-11-15: Detail)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(geprüft 2026-11-15: Detail)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(geprüft 2026-11-15: Detail)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(geprüft 2026-11-15: Detail)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(geprüft 2026-11-15: Detail)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(geprüft 2026-11-15: Detail)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(geprüft 2026-11-15: Detail)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(geprüft 2026-11-15: Detail)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(geprüft 2026-11-15: Detail)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(geprüft 2026-11-15: Detail)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(geprüft 2026-11-15: Detail)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(geprüft 2026-11-15: Detail)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(geprüft 2026-11-15: Detail)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(geprüft 2026-11-15: Detail)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(geprüft 2026-11-15: Detail)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(geprüft 2026-11-15: Detail)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(geprüft 2026-11-15: Detail)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(geprüft 2026-11-15: Detail)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(geprüft 2026-11-15: Detail)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(geprüft 2026-11-15: Detail)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(geprüft 2026-11-15: Detail)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(geprüft 2026-11-15: Detail)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(geprüft 2026-11-15: Detail)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(geprüft 2026-11-15: Detail)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(geprüft 2026-11-15: Detail)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(geprüft 2026-11-15: Detail)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(geprüft 2026-11-15: Detail)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(geprüft 2026-11-15: Detail)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(geprüft 2026-11-15: Detail)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(geprüft 2026-11-15: Detail)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(geprüft 2026-11-15: Detail)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(geprüft 2026-11-15: Detail)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(geprüft 2026-11-15: Detail)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(geprüft 2026-11-15: Detail)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(geprüft 2026-11-15: Detail)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(geprüft 2026-11-15: Detail)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(geprüft 2026-11-15: Detail)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(geprüft 2026-11-15: Detail)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(geprüft 2026-11-15: Detail)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(geprüft 2026-11-15: Detail)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(geprüft 2026-11-15: Detail)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(geprüft 2026-11-15: Detail)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(geprüft 2026-11-15: Detail)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(geprüft 2026-11-15: Existenz)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(geprüft 2026-11-15: Existenz)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(geprüft 2026-11-15: Existenz)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(geprüft 2026-11-15: Existenz)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(geprüft 2026-11-15: Detail)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(geprüft 2026-11-15: Detail)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(geprüft 2026-11-15: Detail)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(geprüft 2026-11-15: Detail)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(geprüft 2026-11-15: Detail)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(geprüft 2026-11-15: Detail)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(geprüft 2026-11-15: Detail)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(geprüft 2026-11-15: Detail)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(geprüft 2026-11-15: Existenz)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(geprüft 2026-11-15: Detail)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(geprüft 2026-11-15: Detail)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(geprüft 2026-11-15: Detail)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(geprüft 2026-11-15: Detail)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(geprüft 2026-11-15: Existenz)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(geprüft 2026-11-15: Detail)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(geprüft 2026-11-15: Existenz)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(geprüft 2026-11-15: Detail)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(geprüft 2026-11-15: Detail)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(geprüft 2026-11-15: Detail)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(geprüft 2026-11-15: Detail)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(geprüft 2026-11-15: Existenz)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(geprüft 2026-11-15: Detail)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(geprüft 2026-11-15: Detail)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(geprüft 2026-11-15: Detail)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(geprüft 2026-11-15: Detail)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(geprüft 2026-11-15: Detail)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(geprüft 2026-11-15: Detail)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(geprüft 2026-11-15: Detail)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(geprüft 2026-11-15: Detail)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(geprüft 2026-11-15: Detail)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(geprüft 2026-11-15: Detail)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(geprüft 2026-11-15: Detail)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(geprüft 2026-11-15: Existenz)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(geprüft 2026-11-15: Detail)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(geprüft 2026-11-15: Detail)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(geprüft 2026-11-15: Detail)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(geprüft 2026-11-15: Detail)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(geprüft 2026-11-15: Detail)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(geprüft 2026-11-15: Detail)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(geprüft 2026-11-15: Detail)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(geprüft 2026-11-15: Detail)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(geprüft 2026-11-15: Detail)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(geprüft 2026-11-15: Detail)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(geprüft 2026-11-15: Detail)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(geprüft 2026-11-15: Detail)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(geprüft 2026-11-15: Detail)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(geprüft 2026-11-15: Detail)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(geprüft 2026-11-15: Detail)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(geprüft 2026-11-15: Detail)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(geprüft 2026-11-15: Detail)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(geprüft 2026-11-15: Detail)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(geprüft 2026-11-15: Detail)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(geprüft 2026-11-15: Detail)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(geprüft 2026-11-15: Existenz)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(geprüft 2026-11-15: Detail)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(gemeinfrei)* *(geprüft 2026-11-15: Existenz)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(geprüft 2026-11-15: Detail)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(geprüft 2026-11-15: Detail)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(geprüft 2026-11-15: Detail)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(geprüft 2026-11-15: Detail)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(geprüft 2026-11-15: Detail)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(geprüft 2026-11-15: Detail)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(geprüft 2026-11-15: Detail)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(geprüft 2026-11-15: Detail)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(geprüft 2026-11-15: Existenz)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(geprüft 2026-11-15: Detail)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(geprüft 2026-11-15: Existenz)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(geprüft 2026-11-15: Existenz)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(geprüft 2026-11-15: Detail)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(geprüft 2026-11-15: Existenz)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(geprüft 2026-11-15: Detail)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(geprüft 2026-11-15: Detail)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(geprüft 2026-11-15: Detail)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(geprüft 2026-11-15: Detail)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(geprüft 2026-11-15: Detail)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(geprüft 2026-11-15: Existenz)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(geprüft 2026-11-15: Detail)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Detail)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(geprüft 2026-11-15: Detail)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(geprüft 2026-11-15: Detail)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(gemeinfrei)* *(geprüft 2026-11-15: Detail)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(geprüft 2026-11-15: Detail)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(geprüft 2026-11-15: Detail)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(geprüft 2026-11-15: Detail)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(geprüft 2026-11-15: Existenz)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(geprüft 2026-11-15: Detail)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(geprüft 2026-11-15: Existenz)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(geprüft 2026-11-15: Existenz)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(geprüft 2026-11-15: Detail)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(geprüft 2026-11-15: Detail)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(geprüft 2026-11-15: Detail)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(geprüft 2026-11-15: Detail)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(geprüft 2026-11-15: Detail)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(geprüft 2026-11-15: Detail)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(geprüft 2026-11-15: Detail)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(geprüft 2026-11-15: Detail)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(geprüft 2026-11-15: Detail)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(geprüft 2026-11-15: Detail)*

<!-- kb:end -->
