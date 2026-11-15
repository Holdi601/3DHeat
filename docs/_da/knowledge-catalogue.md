---
title: "Vidensoversigt"
parent: "Vidensobjektivet"
nav_order: 2
lang: "da"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Videnskatalog

Dette er den fulde liste over, hvad [vidensobjektivet](knowledge.md) kender: de mønstre, det leder efter, ideerne, metoderne, de historiske tilfælde og studierne, det henviser til, og bøgerne og artiklerne bag dem. Brug den til at slå et punkt op efter dets id eller til at tjekke en kilde.

Denne side genereres fra vidensbasen med `node tools/knowledge-doc.mjs`; redigér ikke mellem markørerne.

<!-- kb:begin -->

Vidensbasen har 579 poster (135 begreber, 37 metoder, 277 historiske tilfælde, 17 designprincipper, 113 studier) fordelt på 93 mønstre og med 556 henvisninger.

### Mønstre (93) {#patterns-93}

| id | familie | sådan ser det ud i dataene |
|---|---|---|
| `concentration` | styrke | Den side, der samler flere enheder ét sted, vinder stedet med mere end sine tal alene forklarer. |
| `local-superiority` | styrke | Dræb går til den side, der har flest enheder inden for kampafstand, uanset de samlede tal. |
| `attrition` | styrke | Tab følger begge siders styrke over tid; kampen afgøres af, hvem der løber tør først. |
| `exchange-ratio` | styrke | Dræb pr. tab adskiller sig kraftigt efter sted, side eller klasse. |
| `aimed-fire` | styrke | Tabene vokser med fjendens antal, men ikke med ens eget. |
| `area-fire` | styrke | Tabene vokser med produktet af begge siders antal: sammenpakning straffes. |
| `defeat-in-detail` | styrke | En side ødelægges stykvis, efterhånden som dens dele kommer én ad gangen. |
| `mutual-support` | styrke | Et tab besvares hurtigt af en nærliggende holdkammerat: byttehandler. |
| `combined-arms` | styrke | Klasser klarer sig godt sammen, hvor hver dækker den andens svaghed, og dårligt alene. |
| `class-counter` | styrke | Én klasse vinder uforholdsmæssigt meget mod en bestemt anden klasse eller på et bestemt sted. |
| `initiative` | styrke | Den, der scorer først i et sammenstød, har en tendens til at vinde det. |
| `key-terrain` | terræn | De samme få steder afgør kampe kamp efter kamp. |
| `fields-of-fire` | terræn | Steder, der ser langt ud over det terræn, andre må krydse, scorer flere drab. |
| `high-ground` | terræn | Drab begås oppefra det terræn, ofrene står på. |
| `cover` | terræn | Dødsfald pr. tid falder, hvor geometrien blokerer for sigt og ild. |
| `open-ground` | terræn | Dødsfald pr. tid stiger, hvor intet blokerer for sigt og ild. |
| `kill-zone` | terræn | Dødsfald koncentreres, hvor bevægelsen tvinges gennem observeret terræn, der er dækket af ild. |
| `chokepoint` | terræn | Mange passager presses gennem lidt terræn, og der sker tab. |
| `reverse-slope` | terræn | Sikkerhed lige bag en kam eller mur, uden for fjendens direkte sigt. |
| `safe-ground` | terræn | Et sted, hvor der bruges tid, men hvor få dør. |
| `obstacle` | terræn | Ruter bøjer uden om blokeret terræn ind i få baner. |
| `flank` | bevægelse | En sjældent brugt rute fører til flere drab end de almindelige ruter. |
| `avenue-of-approach` | bevægelse | Bevægelsen flyder langs få baner mellem områder. |
| `mobility` | bevægelse | Bevægelige enheder dør mindre (eller mere) pr. tid end langsomme eller stillestående enheder. |
| `static-exposure` | bevægelse | Enheder, der står stille, dør mere pr. tid end dem, der bevæger sig. |
| `interior-lines` | bevægelse | En side med korte ruter mellem sine kampe flytter styrke hurtigere end den anden side. |
| `envelopment` | bevægelse | Drab kommer fra flere retninger ind på den ene sides position. |
| `ambush` | bevægelse | Enheder, der bevæger sig ad en rute, dør hurtigt for fjender, der allerede står i position. |
| `spawn-pressure` | tid | Liv ender kort efter, de er startet ved ét spawn-punkt. |
| `tempo` | tid | Den hurtigere side når frem til kampen og scorer, før den anden reagerer. |
| `surprise` | tid | Tab kommer i et udbrud, før ofrene kan skyde tilbage. |
| `energy-advantage` | luft | Dræberne har mere højde og fart end deres ofre. |
| `air-superiority` | luft | Den ene sides fly dræber mange gange, hvad de selv taber. |
| `sead` | luft | Jordbaseret luftforsvar tager mange fly, indtil det er fundet og ødelagt. |
| `bvr` | luft | Drab sker på lang afstand, før offeret kan komme tættere på. |
| `fleet-salvo` | sø | En styrke, der rammer først, taber lidt; den anden overlever knap til at svare. |
| `scouting` | sø | Den side, der finder den anden først, vælger kampen. |
| `urban-close` | by | Korte kampafstande, mange dødsfald mellem tæt bebyggelse og langsom rydning. |
| `vertical` | by | Drab fra øvre etager eller tage ned på gaderne. |
| `skill-dispersion` | mennesker | Få spillere står for en stor del af drabene eller dødsfaldene. |
| `ai-vs-player` | mennesker | AI-styrede enheder klarer sig anderledes end spillere på samme sted. |
| `balance` | design | Sider, spawn-punkter eller klasser starter med ulige chancer. |
| `economy` | design | Ressourcer, der tjenes, betales og tabes, koncentreres på få steder eller hos få spillere. |
| `flow` | design | Hvordan spillere bevæger sig gennem banen: sløjfer, baner og blindgyder. |
| `sightlines` | design | Lange sigtelinjer afgør, hvor kampe starter, og hvem der vinder dem. |
| `readability` | design | Dødsfald, spillerne ikke kan se komme: bagfra eller fra uden for sigt. |
| `formation` | bevægelse | Enheder på en side bevæger sig sammen i en genkendelig form: linje, kolonne, kile, echelon eller boks. |
| `frontal-assault` | bevægelse | En gruppe går direkte løs på fjenden, lige ind i fronten af dens styrke. |
| `double-envelopment` | bevægelse | To grupper angriber begge flanker på ét fjendtligt led omtrent samtidig. |
| `encirclement` | bevægelse | En fjendtlig gruppe ender med den anden side hele vejen rundt om sig og med få veje ud. |
| `penetration` | bevægelse | En gruppe passerer gennem fjendens linje, hvor fjender står på begge sider af den. |
| `fire-and-maneuver` | bevægelse | En del af en gruppe bevæger sig, mens resten står stille og dækker, og rollerne skiftes. |
| `feint` | bevægelse | En lille gruppe lokker fjenden til ét sted; hovedindsatsen rammer et andet sted kort efter. |
| `withdrawal` | bevægelse | En gruppe i kontakt drejer væk og øger afstanden til fjenden. |
| `pursuit` | bevægelse | En gruppe følger en fjende, der bevæger sig væk, og bevarer eller indsnævrer afstanden. |
| `defence-in-depth` | terræn | Forsvarere står i flere bælter bag hinanden langs fjendens fremrykningsakse. |
| `screening` | bevægelse | Et lille element bevæger sig langt foran sit hovedlegeme og møder fjenden først. |
| `dispersion` | styrke | En side spreder sig over tid; færre af dens enheder deler ét sted. |
| `missile-defence` | luft | Fly under missiltrussel vender truslen mod siden eller halen: crank, notch, drag, pump. |
| `angles-fight` | luft | Nærdistancekamp i luften ved lav fart og høj drejehastighed, kæmpet om næseposition frem for energi. |
| `cap` | luft | Fly kredser om en fast station i minutter og venter på, at fjenden kommer. |
| `strike-package` | luft | Fly med forskellige roller flyver sammen mod et mål; nogle angriber jorden, andre dækker dem. |
| `line-of-battle` | sø | Skibe damper i kolonne, den ene bag den anden, så alle brede sider kan bruges. |
| `crossing-the-t` | sø | En kolonne passerer over hovedet på fjendens kolonne: alle dens kanoner er i brug, mens få af fjendens kan bruges. |
| `fatal-funnel` | by | Spillere, der går ind ad én dør, ét rum eller én flaskehals, dør der inden for få øjeblikke langt oftere end ved andre indgange. |
| `crossfire` | styrke | Holdere, hvis skudlinjer mødes fra forskellige vinkler, vinder flere dueller end én enkelt holder. |
| `peeker-advantage` | tid | Spilleren, der bevæger sig ind i synsfeltet, vinder dueller mod den, der holder vinklen, oftere (eller sjældnere) end halvdelen af gangene. |
| `entry` | tid | Det første drab i en runde afgør meget af runden; indtrængninger vinder eller taber efter sted og støtte. |
| `utility-support` | styrke | En blitz eller røg lige før en duel ændrer, hvem der vinder den. |
| `man-advantage` | styrke | Runder vindes af den side med flest spillere i live, og nogle hold omsætter eller smider en fordel væk. |
| `clutch` | mennesker | Sidste spillere i live vinder oftere (eller sjældnere), end rundens tilstand forudsiger. |
| `action-value` | mennesker | Drab, byttehandler, plantninger og utility adskiller sig i, hvor meget de ændrer chancen for at vinde. |
| `lurk` | bevægelse | En spiller alene langt fra holdet dræber (eller dør) i en anden takt end flokken. |
| `rotation` | bevægelse | Hvor hurtigt en side flytter spillere til kampen eller målet, afgør om den holder eller tager det igen. |
| `collective-order` | mennesker | En sides bevægelige enheder vender samme vej langt oftere, end deres egne spor, forskudt i tid, ville give ved tilfældighed. |
| `milling` | mennesker | En sides enheder kredser om et fælles centrum: rotation uden nettobevægelse. |
| `herding` | mennesker | Enheder forlader et sted, ligesom holdkammeraten før dem gjorde, ud over stedets egne odds og ud over at kopiere fjenden. |
| `lane-formation` | mennesker | Modsatte strømme holder sig til adskilte baner; bevægelsen koncentreres på få stier, der bruges kamp efter kamp. |
| `crowding` | mennesker | Fart og flow falder, når enheder samler sig; gennem en flaskehals får hårdere tryk færre igennem. |
| `leadership` | mennesker | Nogle enheder drejer først, og andre kopierer deres retning nogle sekunder senere. |
| `cohesion` | mennesker | Enheder, der driver væk fra deres gruppe, dør oftere end dem, der holder sammen med den. |
| `breaking-point` | mennesker | En side, der har mistet en del af sin styrke, holder op med at lukke afstanden og trækker sig tilbage, ud over hvad dens afstand til fjenden forklarer. |
| `panic` | mennesker | Under pludselig trussel spreder enheder sig, flygter eller fryser, og koordinationen bryder sammen. |
| `loss-chasing` | mennesker | Efter et tab tager enheder mere (eller mindre) risiko end efter en gevinst. |
| `hot-hand` | mennesker | Succes følger succes oftere, end tilfældigt blandede rækkefølger af den samme spiller tillader. |
| `conformity` | mennesker | Medlemmer af en side vælger ens (køb, udrustning, ruter) ud over deres egne præferencer. |
| `suppression` | mennesker | Indkommende ild ændrer, hvordan enheder bevæger sig og skyder, selv når den ikke dræber. |
| `social-loafing` | mennesker | Indsatsen pr. hoved falder, jo flere holdkammerater der er til stede. |
| `mixed-strategy` | mennesker | Valg, der burde være uforudsigelige, bliver mønstrede: den ene mulighed vinder oftere, eller valgene kommer i faste rækkefølger. |
| `coordination` | mennesker | Medlemmer handler i takt uden synlige ordrer: synkroniseret bevægelse, timing og valg. |
| `contagion` | mennesker | En tilstand smitter fra enhed til enhed ved kontakt eller nærhed og spreder sig over kortet. |
| `territoriality` | mennesker | Enheder holder afstand til hinanden og holder fast i deres eget område. |
| `interaction-network` | mennesker | Hvem der kæmper, støtter og følger hvem, danner et netværk med knudepunkter, klynger og broer. |


### Begreber (135) {#concepts-135}

| id | titel | objektiver | mønstre | kilder |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesters kvadratlov (målrettet ild) | militær, luft, søværn, esport | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesters lineære lov (områdeild, en mod en) | militær, by, esport | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Koncentration af styrke (masse) | militær, luft, søværn, esport | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Styrkeforhold og 3:1-reglen | militær | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Tabsudvekslingsforhold | militær, luft, esport, design | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Kampkraft og dens multiplikatorer | militær | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Det moderne system for styrkeanvendelse | militær | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | OODA-løkken (observer-orientér-beslut-handl) | militær, luft, esport | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Teori om energi og manøvredygtighed | luft | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Grundlæggende jagermanøvrer og luftkampsmanøvrering | luft | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Terrænanalyse: OAKOC / KOCOA | militær, design, by | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: missionsvariable | militær | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Nøgle- og afgørende terræn | militær, design, esport | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Observation og skudfelter | militær, design, esport, by | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Dækning og skjul | militær, by, design | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Fremrykningsakser og mobilitetskorridorer | militær, design | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Flaskehalse og snævre passager | militær, design, esport | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Kampområder og dødszoner | militær, by, design | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Forsvar på bagskråningen og dækning mod sigt (defilade) | militær, design | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Højt terræn | militær, design | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Indre og ydre linjer | militær | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Nederlag stykvis | militær, esport | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Gensidig støtte | militær, luft, esport | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Kombinerede våben | militær, design | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Nedkæmpelse | militær, by | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Nedkæmpelse og ødelæggelse af fjendtligt luftforsvar (SEAD/DEAD) | luft, militær | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Kampflypatrulje og luftoverherredømme | luft | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Kamp uden for synsvidde | luft | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | Den indirekte fremgangsmåde | militær, esport, design | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Omfavnelse og indkesling | militær | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Baghold | militær, esport, design | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Forsvar i dybden | militær | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Friktion og krigens tåge | militær, esport | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Angrebets kulminationspunkt | militær | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Overraskelse | militær, luft, søværn, esport | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Økonomi i styrkeanvendelsen | militær, esport | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Bymæssigt terræn | by, militær, esport | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Havkontrol og den afgørende flådekamp | søværn | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughes' salvemodel: angreb effektivt først | søværn, luft | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Søge- og detektionsteori | søværn, luft, militær | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operationsanalyse: effektmål | militær, luft, søværn, design | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Krigsspil som analyse | militær, design | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manøvrekrig | militær, esport | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Sammenhold og den moralske faktor | militær | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Tyngdepunkt | militær | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Afgørende punkter | militær, esport | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Operationslinjer | militær | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategier for udslettelse og udmattelse | militær | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Dyb kamp og dybe operationer | militær | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | militær, luft | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Missionsledelse (Auftragstaktik) | militær, esport | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Gennembrud og udnyttelse | militær | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Ild og bevægelse | militær, esport | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Skiftevis bevægelse og dækning (bounding overwatch) | militær, esport | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Rekognoscering og infiltration | militær, esport | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | Reserven | militær, esport | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastisk forsvar og modangreb | militær | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | Dræbekæden (find, fiksér, følg, mål, engager, vurdér) | militær, luft, søværn | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Detektionsafstand over for kampafstand | luft, søværn, militær | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Kampeffektivitetsværdi | militær, esport | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Spredning på slagmarken | militær, esport | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Nær luftstøtte | luft, militær | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Luftinterdiktion | luft, militær | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Eskorte over for jagerfejning | luft | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energikamp over for drejekamp | luft | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Lead-, pure- og lag-forfølgelse | luft | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | Thach-vævningen | luft | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | Finger-four og kampparret | luft | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Flåden som trussel (fleet in being) | søværn | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | At krydse T'et | søværn, militær | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvoj | søværn | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Adgangsnægtelse og områdenægtelse | søværn, luft, militær | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Forsvar fra stærke punkter i bebyggede områder | by, militær | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Mouseholing og bevægelse gennem bygninger | by, militær, design | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Belejring | militær, by | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guerillakrig | militær, by | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Modoprør | militær, by | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Fristed | militær, design | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Vildledning (maskirovka) | militær, esport | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informationsfordel | militær, esport | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Økonomirunder og ressourcetempo | esport, design | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Bevægelsesformationer: linje, kolonne, kile, echelon | militær, esport | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontalangreb | militær | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Dobbelt omfavnelse (klemmen) | militær | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Indkesling og lommen | militær | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Indtrængning og gennembrud | militær | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Forfølgelse | militær | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Tilbagetrækning: tilbagetog, forsinkelse og retræte | militær | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Finte og demonstration | militær, esport | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Skærm, vagt og dækning: sikring foran hovedlegemet | militær | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Forsvar mod et missil: crank, notch, drag og pump | luft | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formationer uden for synsvidde: wall, lead-trail, grinder, pincer | luft | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Vinkelkampen og energikampen | luft | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Angrebspakke og rækkefølgen af nedkæmpelse | luft | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | Slaglinjen | søværn | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | Den dødbringende tragt | by, militær, esport, design | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Rydning af rum: overraskelse, fart og kontrolleret vold | by, militær, esport | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Dominanspunkter | by, militær, esport | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Rydning af hjørner: at skære kagen | by, militær, esport | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Krydsild og indgribende skudfelter | militær, by, esport, design | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Fordelen ved at kigge frem | esport, design | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Mandsfordel i eliminationsrunder | esport, militær | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Indtrængning og åbningsduellen | esport, by | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Utility før indtrængningen: blitz og røg | esport, by, militær | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Social-kraft-modellen for fodgængerbevægelse | design, by, militær | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Banedannelse i modstrøm | design, by | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Hurtigere er langsommere | design, by, militær | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Menneskemængders grundlæggende diagram | design, by | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Stidannelse og ønskelinjer | design, militær | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Panik er sjælden: kollektiv modstandsdygtighed | militær, by, design | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: adskillelse, justering, samhørighed | design, militær | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Ordensparameter og begyndelsen på kollektiv bevægelse | design, militær, luft, søværn | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Sværm, kredsen og polariserede tilstande | design, militær, søværn | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Effektivt lederskab uden signaler | militær, esport, design | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Naboer efter antal, ikke efter afstand | luft, militær | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Sværmintelligens | design, esport, militær | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Flokdannelse og informationskaskader | esport, design, militær | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Social slaphed | esport, design, militær | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Spredning af ansvar | esport, militær | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Primærgruppens sammenhold | militær, esport | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Brydepunkter og tabsgrænser | militær | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Nedkæmpelse: hvad ild gør ud over at dræbe | militær, by | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Frygt og stress i kampbeslutninger | militær, esport | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | At knibe under pres | esport | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Udsigtsteori og tabsaversion | esport, design | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Break-even- og house-money-effekter | esport | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | esport | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Tabte omkostninger (sunk cost) | esport, militær | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | Den varme hånd og dens fejlslutning | esport | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Blandede strategier: at være uforudsigelig | esport, design, militær | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Fælles mentale modeller | esport, militær | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | Holdarbejdets komponenter | esport, militær | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtuelle verdener som adfærdslaboratorier | design, esport | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Personligt rum og territorium | design, by | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Interaktionsnetværk: knudepunkter og svage bånd | esport, design | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |


### Metoder (37) {#methods-37}

| id | titel | mønstre | kilder |
|---|---|---|---|
| `method.lanchester-fit` | Tilpasning af Lanchester-eksponenter til kampdata | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Udvekslingsforhold efter side og sted | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Lokalt styrkeforhold i det øjeblik hvert drab sker | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Synsfelt: skudfelter efter sigtelinje | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Specifik energi ved drab og dødsfald (luft) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Vedholdenhed i hotspots på tværs af kampe | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Byttehastighed (gensidig støtte) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Sammenstød og fordel ved første drab | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Rumlig autokorrelation af dødsfald (Morans I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Rater mod kortets egen baseline med FDR-kontrol | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Efterretningsforberedelse af slagmarken (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Parvise rangeringsmodeller (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Sejrssandsynlighed og vurdering af handlinger | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Rumkontrol og banekontrol | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Salvoligningen tilpasset skibe i kontakt | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Kampeffektivitetsforhold pr. enhedstime i aktion | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Afstande fra detektion til kamp og i kamp | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Timing i dræbekæden | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Spredning over for andel af drab (koncentration af styrke i tid) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Tabsrate og drab pr. udflugt | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model for sejrssandsynlighed i runden | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Handlingsværdi: tilført sejrssandsynlighed | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Justeret plus-minus med rygregression (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Krympning: empirisk Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Forventede udfald: fra forventede mål til forventede dueller | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Måling af opstillinger, rotationer og lurk | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Refleksionsproblemet: kopiering eller fælles årsag | herding, conformity | Manski 1993 |
| `method.streak-correction` | Rækker med korrektion for endelige sekvenser | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Polariserings- og kredsningens ordensparametre | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Ledere ud fra tidsforskudt korrelation af retning | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Rutekaskade-test for flokdannelse | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Banesegregation og stiers vedholdenhed | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Efterslæberens risiko | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Brydningskurve | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Reaktion på indkommende ild | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risiko efter et tab eller en gevinst | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Købsenighed (Fleiss' kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |


### Historiske tilfælde (277) {#historical-cases-277}

| id | sag | hvornår | skala | mønstre | kilder |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopylæ | 480 f.Kr. | slag | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 f.Kr. | slag | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 f.Kr. | slag | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuktra | 371 f.Kr. | slag | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 f.Kr. | slag | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimenosøen | 217 f.Kr. | slag | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 f.Kr. | slag | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburger Wald | 9 e.Kr. | slag | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | slag | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirling Bridge | 1297 | slag | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | slag | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | slag | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | slag | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | slag | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | slag | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | træfning | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | træfning | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Picketts angreb | 1863 | træfning | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | slag | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | træfning | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | felttog | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | Somme, første dag | 1. juli 1916 | slag | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | felttog | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jylland | 1916 | slag | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | slag | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan og Ardennerne | maj 1940 | felttog | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Modangrebet ved Arras | 21. maj 1940 | træfning | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Slaget om Storbritannien | juli-okt. 1940 | felttog | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Slaget om Atlanten: konvojernes operationsanalyse | 1939-45 | felttog | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | juni 1942 | slag | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Anden El Alamein | okt.-nov. 1942 | slag | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine-passet | feb. 1943 | slag | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | aug. 1942-feb. 1943 | felttog | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Kursk | juli 1943 | felttog | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prokhorovka | 12. juli 1943 | træfning | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13. juni 1944 | træfning | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandiets hækkelandskab | juni-juli 1944 | felttog | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operation Cobra | juli 1944 | felttog | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Leyte-bugten | okt. 1944 | slag | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dec. 1944 | slag | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | maj 1905 | slag | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | sept. 1950 | felttog | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | felttog | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | slag | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov. 1965 | træfning | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operation Bolo | 2. jan. 1967 | træfning | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: Tårernes dal | okt. 1973 | slag | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinai: Den kinesiske gård | okt. 1973 | slag | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa-dalen (Operation Mole Cricket 19) | juni 1982 | slag | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Falklandskrigens luftkrig | maj-juni 1982 | felttog | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Ørkenstorm: luftfelttoget | jan.-feb. 1991 | felttog | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26. feb. 1991 | træfning | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | okt. 1993 | træfning | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | dec. 1994-feb. 1995 | slag | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | jan.-marts 1968 | slag | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Kosovo: luftkampagnen | marts-juni 1999 | felttog | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (Operation Al Fajr) | nov. 2004 | slag | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | felttog | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesh | ca. 1274 f.Kr. | slag | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issos | 333 f.Kr. | slag | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 f.Kr. | slag | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 f.Kr. | slag | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Pharsalos | 48 f.Kr. | slag | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopel | 378 e.Kr. | slag | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | 636 e.Kr. | slag | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
| `case.manzikert` | Manzikert | 1071 | slag | mobility, ambush, mutual-support, defeat-in-detail | Haldon 2001 |
| `case.hattin` | Hattin | 1187 | slag | attrition, key-terrain, envelopment, static-exposure | Smail 1956 |
| `case.bannockburn` | Bannockburn | 1314 | slag | chokepoint, obstacle, key-terrain, local-superiority | Barrow 1965 |
| `case.crecy` | Crécy | 1346 | slag | fields-of-fire, kill-zone, high-ground, class-counter | Sumption 1990 |
| `case.poitiers-1356` | Poitiers | 1356 | slag | cover, obstacle, flank, fields-of-fire | Sumption 1990 |
| `case.grunwald-1410` | Grunwald (Tannenberg) | 1410 | slag | envelopment, attrition, flank, local-superiority | Turnbull 2003 |
| `case.breitenfeld` | Breitenfeld | 1631 | slag | combined-arms, mobility, flank, interior-lines | Roberts 1958 |
| `case.blenheim` | Blenheim | 1704 | slag | concentration, local-superiority, kill-zone | Chandler 1973 |
| `case.poltava` | Poltava | 1709 | slag | fields-of-fire, obstacle, defeat-in-detail, attrition | Englund 2003 |
| `case.rossbach` | Rossbach | 1757 | slag | surprise, flank, tempo, reverse-slope | Showalter 1996 |
| `case.saratoga` | Saratoga | 1777 | felttog | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | slag | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | slag | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | slag | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | slag | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | slag | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | slag | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | felttog | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | slag | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | slag | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | slag | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | slag | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | træfning | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | felttog | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov. 1917 | slag | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | okt.-nov. 1917 | felttog | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Det tyske forårsoffensiv (Operation Michael) | marts-apr. 1918 | felttog | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | aug. 1918 | slag | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Khalkhin Gol (Nomonhan) | aug. 1939 | slag | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | Det polske felttog | sept. 1939 | felttog | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut og Gembloux | maj 1940 | slag | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | maj 1940 | træfning | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | Forsvarsringen ved Dunkerque | maj-juni 1940 | felttog | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operation Compass og Beda Fomm | dec. 1940-feb. 1941 | felttog | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operation Crusader og Sidi Rezegh | nov.-dec. 1941 | felttog | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | maj-juni 1942 | slag | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | aug.-sept. 1942 | slag | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Dubno-Brody | juni 1941 | slag | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Indkeslingen af Kiev | sept. 1941 | felttog | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskva | okt. 1941-jan. 1942 | felttog | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzhev og Operation Mars | 1942 | felttog | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Anden Kharkov | maj 1942 | slag | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Tredje Kharkov (Mansteins bagsidehug) | feb.-marts 1943 | felttog | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operation Bagration | juni-aug. 1944 | felttog | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Korsun-Tjerkassy-lommen | jan.-feb. 1944 | slag | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Kamenets-Podolsky-lommen | marts-apr. 1944 | felttog | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operation Epsom | juni 1944 | slag | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operation Goodwood | juli 1944 | slag | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operation Totalize | aug. 1944 | slag | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | aug. 1944 | slag | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Falaise-lommen | aug. 1944 | felttog | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden og Arnhem | sept. 1944 | felttog | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aachen | okt. 1944 | slag | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenskoven | sept. 1944-feb. 1945 | felttog | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sept. 1944 | slag | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dec. 1944 | slag | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn-kammen | dec. 1944 | slag | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow-højderne | apr. 1945 | slag | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlin | apr.-maj 1945 | slag | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operation Spring Awakening | marts 1945 | slag | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dec. 1943 | slag | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Warszawaopstanden | aug.-okt. 1944 | felttog | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov. 1943 | slag | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sept.-nov. 1944 | slag | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | feb.-marts 1945 | slag | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | apr.-juni 1945 | felttog | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | feb.-marts 1945 | slag | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Manchuriet (Auguststorm) | aug. 1945 | felttog | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | Pusan-omkredsen | aug.-sept. 1950 | felttog | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosin-reservoiret | nov.-dec. 1950 | felttog | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjin-floden | apr. 1951 | slag | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |

| `case.kapyong` | Kapyong | apr. 1951 | slag | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | april og juli 1953 | træfning | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jan.-apr. 1968 | slag | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov. 1967 | slag | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia Mountain) | maj 1969 | træfning | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | juni 1967 | slag | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | okt. 1973 | slag | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | juni 1982 | træfning | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Belejringen af Beirut | juni-aug. 1982 | felttog | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Jbeil og panserværnstruslen | juli-aug. 2006 | felttog | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | feb. 1986 | slag | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jan.-feb. 1987 | slag | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | jan.-feb. 1991 | slag | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Mål Norfolk | 26.-27. feb. 1991 | slag | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27. feb. 1991 | slag | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Wadi al-Batin-finterne | feb. 1991 | felttog | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | marts 2003 | slag | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Mål Peach | apr. 2003 | træfning | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | Thunder Runs | apr. 2003 | slag | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debecka-passet | apr. 2003 | træfning | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | felttog | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | marts-maj 2008 | slag | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operation Anaconda | marts 2002 | slag | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | juli 2008 | træfning | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | okt. 2009 | træfning | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala og plutonhusene | 2006-07 | felttog | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Slaget om Algier | 1956-57 | felttog | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodesian Fireforce | 1974-79 | felttog | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Belejringen af Sarajevo | 1992-96 | felttog | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | dec. 1999-feb. 2000 | slag | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Den russisk-georgiske krig | aug. 2008 | felttog | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | juli 2014 | træfning | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovaisk | aug. 2014 | slag | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | jan.-feb. 2015 | slag | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Donetsks lufthavn | sept. 2014-jan. 2015 | slag | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Hostomel-lufthavnen | feb. 2022 | træfning | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | Kyiv-aksen og baghold ved Brovary | marts 2022 | træfning | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol og Azovstal | feb.-maj 2022 | slag | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Modoffensiven ved Kharkiv | sept. 2022 | felttog | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Overgangen over Siverskyi Donets ved Bilohorivka | maj 2022 | træfning | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bakhmut | aug. 2022-maj 2023 | slag | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Offensiven ved Zaporizjja | juni-nov. 2023 | felttog | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Krigen om Nagorno-Karabakh | sept.-nov. 2020 | felttog | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | Blitzen | sept. 1940-maj 1941 | felttog | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: den første dag i luften | 22. juni 1941 | slag | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | maj 1941 | slag | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Belejringen af Malta | 1940-1942 | felttog | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | Luftbroen til Stalingrad | nov. 1942-feb. 1943 | felttog | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Luftkampene over Kuban | apr.-juni 1943 | felttog | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Kursk i luften | juli 1943 | slag | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operation Bagration i luften | juni-aug. 1944 | felttog | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operation Tidal Wave) | 1. aug. 1943 | træfning | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | Dæmningsangrebet (Operation Chastise) | 16.-17. maj 1943 | træfning | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (Operation Gomorrha) | juli-aug. 1943 | slag | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17. aug. 1943 | slag | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Anden Schweinfurt ("Black Thursday") | 14. okt. 1943 | træfning | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Operation Argument) | feb. 1944 | felttog | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | Nürnberg-angrebet | 30.-31. marts 1944 | træfning | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operation Bodenplatte | 1. jan. 1945 | slag | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Slaget i Bismarckhavet | marts 1943 | slag | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Neutralisering af Rabaul | 1943-1944 | felttog | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filippinerhavet ("Marianas Turkey Shoot") | juni 1944 | slag | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Den sorte tirsdag over Namsi | 23. okt. 1951 | træfning | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operation Rolling Thunder | 1965-1968 | felttog | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | Thanh Hoa-broen | 1965-1972 | træfning | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | The Wild Weasels | 1965-1973 | felttog | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Ault-rapporten og Top Gun | 1968-1972 | felttog | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operation Linebacker | maj-okt. 1972 | felttog | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("Elleve-dages-krigen") | dec. 1972 | felttog | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operation Focus (Moked) | 5. juni 1967 | slag | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Udmattelseskrigen: missilbæltet | 1969-1970 | felttog | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | SAM-paraplyen over kanalen | okt. 1973 | slag | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operation Opera) | 7. juni 1981 | træfning | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operation El Dorado Canyon | 15. apr. 1986 | træfning | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | Iran-Irak-luftkrigen | 1980-1988 | felttog | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Buck-angrebene | maj-juni 1982 | træfning | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: planlægningen af luftfelttoget i Golfen | aug. 1990-jan. 1991 | felttog | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: det første Apache-angreb | 17. jan. 1991 | træfning | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | Den store Scud-jagt | jan.-feb. 1991 | felttog | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla-kammen ("Highway of Death") | 26.-27. feb. 1991 | træfning | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operation Anaconda: Apacher i Shahi-Kot | marts 2002 | slag | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | Apache-angrebet ved Karbala | 24. marts 2003 | træfning | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | Luftfelttoget i Libyen | marts-okt. 2011 | felttog | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabakh: droner og luftforsvar | sept.-nov. 2020 | felttog | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Ukraine: den omstridte luft | 2022 | felttog | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Hostomel-lufthavnen | feb. 2022 | træfning | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | feb.-marts 1971 | felttog | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operation Eagle Claw | apr. 1980 | træfning | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghanistan: Stinger | 1986-1989 | felttog | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | slag | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | Den spanske armada | 1588 | felttog | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberonbugten | 1759 | slag | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | Chesapeake (Virginia Capes) | 1781 | slag | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | Nilen (Aboukirbugten) | 1798 | slag | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | København | 1801 | slag | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | marts 1862 | træfning | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | slag | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | Yalu | 1894 | slag | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manila Bay | 1898 | slag | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgoland Bugt | aug. 1914 | slag | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel og Falklandsøerne | nov.-dec. 1914 | felttog | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Dogger Bank | jan. 1915 | slag | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | River Plate | dec. 1939 | slag | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nov. 1940 | træfning | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Kap Matapan | marts 1941 | slag | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Danmarksstrædet og Bismarcks synke | maj 1941 | felttog | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7. dec. 1941 | træfning | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales og Repulse | 10. dec. 1941 | træfning | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | Javahavet | feb. 1942 | slag | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | Korallehavet | maj 1942 | slag | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo Island | aug. 1942 | slag | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | Østsalomonerne | aug. 1942 | slag | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | okt. 1942 | slag | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruz-øerne | okt. 1942 | slag | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Søslaget ved Guadalcanal | 12.-15. nov. 1942 | slag | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov. 1942 | træfning | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | Kanalløbet | feb. 1942 | træfning | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operation Pedestal | aug. 1942 | slag | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Den sorte maj | maj 1943 | felttog | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Nordkap | dec. 1943 | slag | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | Den amerikanske ubådskampagne mod Japan | 1941-1945 | felttog | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Off Samar | 25. okt. 1944 | slag | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Surigao-strædet | 25. okt. 1944 | slag | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: kamikazekampagnen | apr.-juni 1945 | felttog | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | Eilats synke | okt. 1967 | træfning | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | okt. 1973 | slag | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | Generalen Belgranos synke | 2. maj 1982 | træfning | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | HMS Sheffields tab | 4. maj 1982 | træfning | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17. maj 1987 | træfning | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operation Praying Mantis | 18. apr. 1988 | slag | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | aug. 2004 | træfning | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | Bisu-revolutionen | marts 2007 | slag | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | Dream Coil ved The International 2013 | aug. 2013 | træfning | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Fakers Zed mod Ryu | sept. 2013 | træfning | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | Overpass-boosten | nov. 2014 | træfning | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | AWP-hoppet på Mirage | apr. 2016 | træfning | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis og utility-æraen | 2018 | felttog | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five mod OG | apr. 2019 | slag | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar når grandmaster | 2019 | felttog | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | Venstre hage (Operation Desert Storms landoffensiv) | 24.-28. februar 1991 | felttog | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Hændelsen Corrupted Blood | september 2005 | felttog | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |


### Spil- og banedesign (17) {#game-and-level-design-17}

| id | titel | mønstre | kilder |
|---|---|---|---|
| `design.chokepoint` | Flaskehalse i banedesign | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Flankeruter og alternative veje | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Sigtelinjer og kampafstand | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Placering og rytme af dækning | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Spawn-design og spawn-beskyttelse | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Balance på symmetriske og asymmetriske kort | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Klassebalance og modtræk | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Flow, sløjfer og læsbare layouts | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Spiløkonomier og feedback-sløjfer | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking og spredning af dygtighed | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI-modstandere som banesonder | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Meningsfuldt spil og valg | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Byttehandel og holdspil i skydespil | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Kontrol over kortet | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Varmekort og rumlig telemetri i design | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Mestring, læring og sjov | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Rundeøkonomier og købsbeslutninger | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Studier (113) {#studies-113}

| id | titel | kilder |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesters kvadratlov ved Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchester-modeller for Ardennerne | Bracken 1995 |
| `study.fricker-1998` | Fricker: udmattelsesmodeller for Ardennerne, set igen | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas og Turkes: Kursk og Ardennerne | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley og Helmbold: validering af kvadratloven | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-analyse af spilleres dødsfald | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: visualisering af konkurrencepræget adfærd | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Værdisætning af handlinger i Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Registrering af sammenstød i esport | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: luftkamp over Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: kvantificeret vurdering af historiske slag | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: styrkeanvendelse forklarer udfaldet | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Oversigt over visualisering af spildata | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester mod tre århundreders landslag | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: tres træfninger i Anden Verdenskrig | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: kampmodeller og den amerikanske borgerkrig | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: en statistisk model for tabsdata | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: fremrykningshastigheder i landkamp | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas og Dinges: omstændighederne betyder mere end loven | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | Kursk-databasen | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | Databasen for Ardennerne-felttoget | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson og MacKay: Slaget om Storbritannien som Lanchester-data | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte og Schmidt: tal vinder stadig slag | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: regelmæssigheder i kampens tab | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuys taktiske numeriske deterministiske model | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: krig i tal | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: kampkraft | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter og Stam: demokratier i krig | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: den adaptive dynamiske model | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester og guerillakrig | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: den stokastiske salvemodel | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: flådetaktikkens hjørnesten | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Debatten om 3:1-reglen | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: modellering af væbnede konflikter | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Ault-rapporten: missiler affyret uden for deres rækkevidde | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blacketts cirkus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Dybdebombeindstillinger i Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Hvide undersider på antiubådsfly | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: pansring der, hvor de hjemvendte bombefly ikke var ramt | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimal søgning: fra ubåde til AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: kamp i helvede | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Adgangsnægtelse og områdenægtelse | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Hvordan spillere mister interessen | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Gruppering af spilleradfærd i naturen | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Afsløring af spillerfrustration | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: telemetri-dashboards i drift | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: visuel analyse af spil | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Avatarbevægelse på slagmarker i World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: instrumentering af brugertest i stor skala | Kim et al. 2008 |
| `study.game-data-science` | Spildatavidenskab | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Kunstig intelligens og spil | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Dygtighed og holdbevægelse i Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Kampmønstre, der forudsiger MOBA-sejre | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Spillerroller i Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Forudsigelse af Dota 2-udfald ud fra draft | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Live-sejrsforudsigelse i professionel esport | Hodge et al. 2021 |
| `study.rioult-2014` | Topologi for spillerpositioner | Rioult et al. 2014 |
| `study.bednarek-2017` | Evaluering af spillere i holdbaserede skydespil | Bednárek et al. 2017 |
| `study.katona-2019` | Forudsigelse af, hvem der dør næst | Katona et al. 2019 |
| `study.block-2018` | Datadrevne historier til esport-publikum | Block et al. 2018 |
| `study.ggviz` | ggViz: søgning efter spiltilstande i stor skala | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: storskala forstærkningslæring i Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: grandmaster-niveau i StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Forventet besiddelsesværdi i basketball | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: værdisætning af handlinger med bolden i fodbold | Decroos et al. 2019 |
| `study.pitch-control` | Banekontrol og skabelse af rum | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | Den rumlige struktur i forsvarsfærdigheder | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Holdroller ud fra trackingdata | Lucey et al. 2013 |
| `study.shot-quality` | Forventede mål og skudkvalitet | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: rumlig skydeeffektivitet | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Rumlig-tidslig analyse af holdsport | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripleys K: klyngedannelse på alle skalaer | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark og Evans: spredning efter nærmeste nabo | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord-hotspots | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokale indikatorer for rumlig sammenhæng | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | Den rumlige scanningsstatistik | Kulldorff 1997 |
| `study.kde` | Kernedensitetsestimering | Silverman 1986 |
| `study.knox-1964` | Rum-tids-interaktion | Knox 1964; Diggle 2013 |
| `study.maup` | Det modificerbare arealenhedsproblem | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovister og synlighedsgrafer | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Space syntax | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Gennemsnitlig trængsel | Lloyd 1967 |
| `study.survival-analysis` | Overlevelsesanalyse for tid til død | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Generaliserede lineære modeller for tællinger | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap og intervalestimater | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: latenstid og fordelen ved at kigge frem | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee og Chang: skud rundt om et hjørne | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: latenstid og spillerhandlinger | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: professionelle og amatører set gennem sejrssandsynlighed | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: økonomiske beslutninger i Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: kloge drab og værdiløse dødsfald | Maymin 2021 |
| `study.moba-live-prediction` | Live-udfaldsforudsigelse i MOBA'er | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: Valorant-runder ud fra taktiske træk | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: roller i professionel Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: træning i nærkamp | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Menneskemængdens turbulens ved hajjen i 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Gående grupper former menneskemængder | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hierarkisk gruppedynamik i dueflokke | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Social indflydelse gør succes ulige og uforudsigelig | Salganik et al. 2006 |
| `study.wisdom-undermined` | Social indflydelse underminerer kollektiv visdom | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | En menneskemængdes tiltrækningskraft | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Tilpasning til et enstemmigt flertal | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: kampmotivation i Irak | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Sammenhold og præstation: metaanalyser | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Tabsaversion blandt professionelle golfspillere | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Varme hænder i baseball | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Straffespark: professionelle spiller minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimax-spil ved Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Holdenes kollektive intelligens | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Sociale netværk i en online-verden | Szell et al. 2010 |
| `study.team-networks` | Afleveringsnetværk og holdpræstation | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Adfærd spreder sig gennem klyngede netværk | Centola 2010 |


### Litteratur {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(tjekket 2026-11-15: detaljer)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(tjekket 2026-11-15: detaljer)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(tjekket 2026-11-15: detaljer)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(tjekket 2026-11-15: detaljer)*
- Ammianus Marcellinus (trans. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(tjekket 2026-11-15: detaljer)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(tjekket 2026-11-15: detaljer)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(tjekket 2026-11-15: detaljer)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(tjekket 2026-11-15: detaljer)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Ardant du Picq, C. (trans. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(tjekket 2026-11-15: detaljer)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(tjekket 2026-11-15: detaljer)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Arrian (trans. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(tjekket 2026-11-15: detaljer)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(tjekket 2026-11-15: detaljer)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(tjekket 2026-11-15: detaljer)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(tjekket 2026-11-15: detaljer)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(tjekket 2026-11-15: detaljer)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(tjekket 2026-11-15: detaljer)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(tjekket 2026-11-15: detaljer)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(tjekket 2026-11-15: detaljer)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(tjekket 2026-11-15: detaljer)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(tjekket 2026-11-15: detaljer)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(tjekket 2026-11-15: detaljer)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(tjekket 2026-11-15: detaljer)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(tjekket 2026-11-15: detaljer)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(tjekket 2026-11-15: detaljer)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(tjekket 2026-11-15: detaljer)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(tjekket 2026-11-15: detaljer)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(tjekket 2026-11-15: detaljer)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(tjekket 2026-11-15: eksistens)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(tjekket 2026-11-15: detaljer)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(tjekket 2026-11-15: detaljer)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(tjekket 2026-11-15: detaljer)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(tjekket 2026-11-15: detaljer)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(tjekket 2026-11-15: detaljer)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(tjekket 2026-11-15: detaljer)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(tjekket 2026-11-15: eksistens)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(tjekket 2026-11-15: detaljer)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(tjekket 2026-11-15: detaljer)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(tjekket 2026-11-15: detaljer)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(tjekket 2026-11-15: detaljer)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(tjekket 2026-11-15: detaljer)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(tjekket 2026-11-15: detaljer)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(tjekket 2026-11-15: eksistens)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(tjekket 2026-11-15: detaljer)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(tjekket 2026-11-15: detaljer)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(tjekket 2026-11-15: detaljer)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(tjekket 2026-11-15: detaljer)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Unpublished briefing; archived by the Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(tjekket 2026-11-15: eksistens)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(tjekket 2026-11-15: detaljer)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(tjekket 2026-11-15: detaljer)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(tjekket 2026-11-15: detaljer)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(tjekket 2026-11-15: detaljer)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(tjekket 2026-11-15: eksistens)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(tjekket 2026-11-15: detaljer)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(tjekket 2026-11-15: detaljer)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(tjekket 2026-11-15: detaljer)*
- Caesar, G. J. (trans. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(tjekket 2026-11-15: detaljer)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(tjekket 2026-11-15: detaljer)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(tjekket 2026-11-15: detaljer)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(tjekket 2026-11-15: detaljer)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(tjekket 2026-11-15: detaljer)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(tjekket 2026-11-15: detaljer)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(tjekket 2026-11-15: detaljer)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(tjekket 2026-11-15: detaljer)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(tjekket 2026-11-15: detaljer)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(tjekket 2026-11-15: detaljer)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(tjekket 2026-11-15: detaljer)*
- Clausewitz, C. von (trans. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(tjekket 2026-11-15: detaljer)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(tjekket 2026-11-15: detaljer)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(tjekket 2026-11-15: detaljer)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(tjekket 2026-11-15: detaljer)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(tjekket 2026-11-15: detaljer)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(tjekket 2026-11-15: detaljer)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(tjekket 2026-11-15: detaljer)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Corbett, J. S. (1920). Naval Operations vol. 1 (History of the Great War). Longmans, Green, London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Corbett, J. S. (1921). Naval Operations vol. 2 (History of the Great War). Longmans, Green, London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Corbett, J. S. (1923). Naval Operations vol. 3 (History of the Great War). Longmans, Green, London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(tjekket 2026-11-15: eksistens)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(tjekket 2026-11-15: detaljer)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(tjekket 2026-11-15: detaljer)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(tjekket 2026-11-15: detaljer)*
- Craven, W. F.; Cate, J. L. (eds.) (1949). The Army Air Forces in World War II, vol. 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(tjekket 2026-11-15: eksistens)*
- Craven, W. F.; Cate, J. L. (eds.) (1951). The Army Air Forces in World War II, vol. 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(tjekket 2026-11-15: eksistens)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(tjekket 2026-11-15: detaljer)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(tjekket 2026-11-15: detaljer)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(tjekket 2026-11-15: detaljer)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(tjekket 2026-11-15: eksistens)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(tjekket 2026-11-15: detaljer)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(tjekket 2026-11-15: detaljer)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(tjekket 2026-11-15: detaljer)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(tjekket 2026-11-15: detaljer)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(tjekket 2026-11-15: detaljer)*
- Delbrück, H. (trans. Renfroe, W. J.) (1990). History of the Art of War, vol. 4: The Dawn of Modern Warfare (orig. 1920). University of Nebraska Press, Lincoln. *(tjekket 2026-11-15: eksistens)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(tjekket 2026-11-15: detaljer)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3rd ed.). CRC Press, Boca Raton. *(tjekket 2026-11-15: detaljer)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(tjekket 2026-11-15: detaljer)*
- Douhet, G. (trans. Ferrari, D.) (1942). The Command of the Air (orig. 1921). Coward-McCann, New York; reprinted Office of Air Force History 1983. *(tjekket 2026-11-15: detaljer)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(tjekket 2026-11-15: detaljer)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(tjekket 2026-11-15: detaljer)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(tjekket 2026-11-15: detaljer)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(tjekket 2026-11-15: eksistens)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(tjekket 2026-11-15: detaljer)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(tjekket 2026-11-15: detaljer)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(tjekket 2026-11-15: detaljer)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(tjekket 2026-11-15: detaljer)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(tjekket 2026-11-15: detaljer)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(tjekket 2026-11-15: detaljer)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(tjekket 2026-11-15: detaljer)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(tjekket 2026-11-15: detaljer)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(tjekket 2026-11-15: detaljer)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(tjekket 2026-11-15: eksistens)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(tjekket 2026-11-15: detaljer)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(tjekket 2026-11-15: detaljer)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(tjekket 2026-11-15: detaljer)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(tjekket 2026-11-15: detaljer)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(tjekket 2026-11-15: detaljer)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(tjekket 2026-11-15: detaljer)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(tjekket 2026-11-15: detaljer)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(tjekket 2026-11-15: detaljer)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(tjekket 2026-11-15: detaljer)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(tjekket 2026-11-15: detaljer)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(tjekket 2026-11-15: detaljer)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(tjekket 2026-11-15: detaljer)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(tjekket 2026-11-15: detaljer)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(tjekket 2026-11-15: detaljer)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(tjekket 2026-11-15: detaljer)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(tjekket 2026-11-15: detaljer)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(tjekket 2026-11-15: detaljer)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(tjekket 2026-11-15: detaljer)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(tjekket 2026-11-15: eksistens)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(tjekket 2026-11-15: detaljer)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(tjekket 2026-11-15: detaljer)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(tjekket 2026-11-15: detaljer)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(tjekket 2026-11-15: detaljer)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(tjekket 2026-11-15: detaljer)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(tjekket 2026-11-15: detaljer)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2nd ed.). Morgan Kaufmann, Burlington. *(tjekket 2026-11-15: detaljer)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (rev. ed.). Office of Air Force History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(tjekket 2026-11-15: detaljer)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(tjekket 2026-11-15: detaljer)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(tjekket 2026-11-15: detaljer)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(tjekket 2026-11-15: detaljer)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(tjekket 2026-11-15: detaljer)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(tjekket 2026-11-15: detaljer)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(tjekket 2026-11-15: detaljer)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(tjekket 2026-11-15: detaljer)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(tjekket 2026-11-15: detaljer)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(tjekket 2026-11-15: detaljer)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(tjekket 2026-11-15: detaljer)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(tjekket 2026-11-15: detaljer)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(tjekket 2026-11-15: detaljer)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Grau, L. W. (ed.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(tjekket 2026-11-15: detaljer)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(tjekket 2026-11-15: detaljer)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(tjekket 2026-11-15: detaljer)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(tjekket 2026-11-15: detaljer)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(tjekket 2026-11-15: detaljer)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): article 22. https://arxiv.org/abs/1602.06994 *(tjekket 2026-11-15: detaljer)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(tjekket 2026-11-15: detaljer)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(tjekket 2026-11-15: detaljer)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(tjekket 2026-11-15: detaljer)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(tjekket 2026-11-15: detaljer)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(tjekket 2026-11-15: detaljer)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(tjekket 2026-11-15: detaljer)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(tjekket 2026-11-15: detaljer)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(tjekket 2026-11-15: detaljer)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(tjekket 2026-11-15: detaljer)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(tjekket 2026-11-15: detaljer)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(tjekket 2026-11-15: detaljer)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(tjekket 2026-11-15: detaljer)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(tjekket 2026-11-15: detaljer)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(tjekket 2026-11-15: detaljer)*
- Headquarters, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 February 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Headquarters, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 June 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Headquarters, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Headquarters, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Headquarters, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 July 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Headquarters, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 April 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(tjekket 2026-11-15: detaljer)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(tjekket 2026-11-15: detaljer)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(tjekket 2026-11-15: detaljer)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(tjekket 2026-11-15: detaljer)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(tjekket 2026-11-15: detaljer)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(tjekket 2026-11-15: detaljer)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(tjekket 2026-11-15: detaljer)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(tjekket 2026-11-15: detaljer)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(tjekket 2026-11-15: eksistens)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Herodotus (trans. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(tjekket 2026-11-15: detaljer)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(tjekket 2026-11-15: detaljer)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(tjekket 2026-11-15: detaljer)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(tjekket 2026-11-15: detaljer)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(tjekket 2026-11-15: detaljer)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(tjekket 2026-11-15: detaljer)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(tjekket 2026-11-15: detaljer)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(tjekket 2026-11-15: detaljer)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(tjekket 2026-11-15: detaljer)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(tjekket 2026-11-15: detaljer)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(tjekket 2026-11-15: detaljer)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(tjekket 2026-11-15: detaljer)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(tjekket 2026-11-15: detaljer)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2nd ed.). Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3rd ed.). Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(tjekket 2026-11-15: detaljer)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(tjekket 2026-11-15: detaljer)*
- Isserson, G. S. (trans. Menning, B. W.) (2013). The Evolution of Operational Art (orig. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(tjekket 2026-11-15: detaljer)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(tjekket 2026-11-15: detaljer)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Jomini, A.-H. de (trans. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(tjekket 2026-11-15: detaljer)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(tjekket 2026-11-15: detaljer)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(tjekket 2026-11-15: detaljer)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(tjekket 2026-11-15: detaljer)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(tjekket 2026-11-15: detaljer)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(tjekket 2026-11-15: eksistens)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(tjekket 2026-11-15: detaljer)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(tjekket 2026-11-15: detaljer)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(tjekket 2026-11-15: detaljer)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(tjekket 2026-11-15: detaljer)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(tjekket 2026-11-15: detaljer)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(tjekket 2026-11-15: detaljer)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(tjekket 2026-11-15: detaljer)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(tjekket 2026-11-15: detaljer)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(tjekket 2026-11-15: detaljer)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(tjekket 2026-11-15: detaljer)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(tjekket 2026-11-15: detaljer)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(tjekket 2026-11-15: detaljer)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(tjekket 2026-11-15: detaljer)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(tjekket 2026-11-15: eksistens)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(tjekket 2026-11-15: detaljer)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(tjekket 2026-11-15: detaljer)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(tjekket 2026-11-15: detaljer)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(tjekket 2026-11-15: detaljer)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(tjekket 2026-11-15: detaljer)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(tjekket 2026-11-15: detaljer)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(tjekket 2026-11-15: detaljer)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(tjekket 2026-11-15: detaljer)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(tjekket 2026-11-15: detaljer)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(tjekket 2026-11-15: detaljer)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(tjekket 2026-11-15: eksistens)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(tjekket 2026-11-15: detaljer)*
- Livy (trans. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(tjekket 2026-11-15: detaljer)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(tjekket 2026-11-15: detaljer)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(tjekket 2026-11-15: detaljer)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(tjekket 2026-11-15: detaljer)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(tjekket 2026-11-15: eksistens)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(tjekket 2026-11-15: detaljer)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(tjekket 2026-11-15: detaljer)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(tjekket 2026-11-15: detaljer)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(tjekket 2026-11-15: detaljer)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(tjekket 2026-11-15: detaljer)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(tjekket 2026-11-15: eksistens)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(tjekket 2026-11-15: detaljer)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(tjekket 2026-11-15: detaljer)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(tjekket 2026-11-15: detaljer)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(tjekket 2026-11-15: detaljer)*
- Mao Tse-tung (trans. Griffith, S. B.) (1961). On Guerrilla Warfare (orig. 1937). Praeger, New York. *(tjekket 2026-11-15: eksistens)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(tjekket 2026-11-15: detaljer)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(tjekket 2026-11-15: detaljer)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(tjekket 2026-11-15: detaljer)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(tjekket 2026-11-15: detaljer)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(tjekket 2026-11-15: detaljer)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(tjekket 2026-11-15: detaljer)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(tjekket 2026-11-15: detaljer)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2nd ed.). Chapman & Hall, London. *(tjekket 2026-11-15: detaljer)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(tjekket 2026-11-15: detaljer)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (Spring 1989). doi:10.2307/2538780 *(tjekket 2026-11-15: detaljer)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(tjekket 2026-11-15: eksistens)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(tjekket 2026-11-15: detaljer)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(tjekket 2026-11-15: detaljer)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(tjekket 2026-11-15: detaljer)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(tjekket 2026-11-15: detaljer)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(tjekket 2026-11-15: detaljer)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(tjekket 2026-11-15: detaljer)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(tjekket 2026-11-15: detaljer)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(tjekket 2026-11-15: detaljer)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(tjekket 2026-11-15: detaljer)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(tjekket 2026-11-15: detaljer)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(tjekket 2026-11-15: eksistens)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(tjekket 2026-11-15: eksistens)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(tjekket 2026-11-15: detaljer)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, Volume III). Historical Branch, US Marine Corps, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(tjekket 2026-11-15: detaljer)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(tjekket 2026-11-15: detaljer)*
- Morillo, S. (ed.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(tjekket 2026-11-15: detaljer)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, vol. 3). Little, Brown, Boston. *(tjekket 2026-11-15: detaljer)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, vol. 4). Little, Brown, Boston. *(tjekket 2026-11-15: eksistens)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, vol. 5). Little, Brown, Boston. *(tjekket 2026-11-15: eksistens)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, vol. 6). Little, Brown, Boston. *(tjekket 2026-11-15: detaljer)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, vol. 8). Little, Brown, Boston. *(tjekket 2026-11-15: detaljer)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, vol. 12). Little, Brown, Boston. *(tjekket 2026-11-15: eksistens)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, vol. 14). Little, Brown, Boston. *(tjekket 2026-11-15: detaljer)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(tjekket 2026-11-15: detaljer)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(tjekket 2026-11-15: detaljer)*
- Mueller, K. P. (ed.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(tjekket 2026-11-15: detaljer)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(tjekket 2026-11-15: detaljer)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(tjekket 2026-11-15: detaljer)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(tjekket 2026-11-15: detaljer)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(tjekket 2026-11-15: detaljer)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(tjekket 2026-11-15: detaljer)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(tjekket 2026-11-15: detaljer)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(tjekket 2026-11-15: detaljer)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(tjekket 2026-11-15: detaljer)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(tjekket 2026-11-15: detaljer)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(tjekket 2026-11-15: detaljer)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(tjekket 2026-11-15: eksistens)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(tjekket 2026-11-15: detaljer)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(tjekket 2026-11-15: detaljer)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(tjekket 2026-11-15: detaljer)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(tjekket 2026-11-15: detaljer)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(tjekket 2026-11-15: detaljer)*
- Osipov, M. (trans. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (orig. 1915). Naval Research Logistics 42(3): 435-490. *(tjekket 2026-11-15: detaljer)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(tjekket 2026-11-15: detaljer)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(tjekket 2026-11-15: detaljer)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(tjekket 2026-11-15: detaljer)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(tjekket 2026-11-15: detaljer)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(tjekket 2026-11-15: detaljer)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(tjekket 2026-11-15: detaljer)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(tjekket 2026-11-15: detaljer)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(tjekket 2026-11-15: detaljer)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(tjekket 2026-11-15: detaljer)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(tjekket 2026-11-15: detaljer)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(tjekket 2026-11-15: detaljer)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(tjekket 2026-11-15: detaljer)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(tjekket 2026-11-15: detaljer)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(tjekket 2026-11-15: detaljer)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(tjekket 2026-11-15: detaljer)*
- Plutarch (trans. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(tjekket 2026-11-15: detaljer)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(tjekket 2026-11-15: detaljer)*
- Polybius (trans. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(tjekket 2026-11-15: detaljer)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(tjekket 2026-11-15: detaljer)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(tjekket 2026-11-15: detaljer)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(tjekket 2026-11-15: detaljer)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(tjekket 2026-11-15: detaljer)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(tjekket 2026-11-15: detaljer)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(tjekket 2026-11-15: detaljer)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(tjekket 2026-11-15: detaljer)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(tjekket 2026-11-15: detaljer)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(tjekket 2026-11-15: detaljer)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(tjekket 2026-11-15: detaljer)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(tjekket 2026-11-15: detaljer)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(tjekket 2026-11-15: detaljer)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(tjekket 2026-11-15: detaljer)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(tjekket 2026-11-15: detaljer)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(tjekket 2026-11-15: detaljer)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(tjekket 2026-11-15: detaljer)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(tjekket 2026-11-15: detaljer)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(tjekket 2026-11-15: detaljer)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(tjekket 2026-11-15: detaljer)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(tjekket 2026-11-15: eksistens)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, vol. 1: The Defensive. HMSO, London. *(tjekket 2026-11-15: eksistens)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, vol. 2: The Period of Balance. HMSO, London. *(tjekket 2026-11-15: eksistens)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, vol. 3, part 1: The Offensive. HMSO, London. *(tjekket 2026-11-15: eksistens)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(tjekket 2026-11-15: detaljer)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(tjekket 2026-11-15: detaljer)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(tjekket 2026-11-15: detaljer)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(tjekket 2026-11-15: detaljer)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(tjekket 2026-11-15: detaljer)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(tjekket 2026-11-15: detaljer)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(tjekket 2026-11-15: detaljer)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(tjekket 2026-11-15: detaljer)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(tjekket 2026-11-15: eksistens)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(tjekket 2026-11-15: detaljer)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(tjekket 2026-11-15: detaljer)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (eds.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(tjekket 2026-11-15: detaljer)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(tjekket 2026-11-15: detaljer)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(tjekket 2026-11-15: eksistens)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(tjekket 2026-11-15: detaljer)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(tjekket 2026-11-15: eksistens)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(tjekket 2026-11-15: detaljer)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(tjekket 2026-11-15: detaljer)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(tjekket 2026-11-15: detaljer)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(tjekket 2026-11-15: detaljer)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(tjekket 2026-11-15: eksistens)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(tjekket 2026-11-15: detaljer)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(tjekket 2026-11-15: detaljer)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(tjekket 2026-11-15: detaljer)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(tjekket 2026-11-15: detaljer)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(tjekket 2026-11-15: detaljer)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(tjekket 2026-11-15: detaljer)*
- Special Operations Review Group (Holloway, J. L., chair) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(tjekket 2026-11-15: detaljer)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(tjekket 2026-11-15: detaljer)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(tjekket 2026-11-15: detaljer)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(tjekket 2026-11-15: detaljer)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(tjekket 2026-11-15: detaljer)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(tjekket 2026-11-15: eksistens)*
- Sun Tzu (trans. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(tjekket 2026-11-15: detaljer)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(tjekket 2026-11-15: detaljer)*
- Tacitus (trans. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(tjekket 2026-11-15: detaljer)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(tjekket 2026-11-15: detaljer)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 vols.). Operations Research Society of America, Military Applications Section, Arlington VA. *(tjekket 2026-11-15: detaljer)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(tjekket 2026-11-15: detaljer)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(tjekket 2026-11-15: detaljer)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4th ed.). Routledge, Abingdon. *(tjekket 2026-11-15: detaljer)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(tjekket 2026-11-15: detaljer)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(tjekket 2026-11-15: detaljer)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2nd ed.). CRC Press, Boca Raton. *(tjekket 2026-11-15: detaljer)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(tjekket 2026-11-15: detaljer)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(tjekket 2026-11-15: detaljer)*
- Triandafillov, V. K. (trans. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (orig. 1929). Frank Cass, Ilford. *(tjekket 2026-11-15: detaljer)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(tjekket 2026-11-15: detaljer)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(tjekket 2026-11-15: detaljer)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(tjekket 2026-11-15: detaljer)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(tjekket 2026-11-15: detaljer)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(tjekket 2026-11-15: detaljer)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(tjekket 2026-11-15: detaljer)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(tjekket 2026-11-15: eksistens)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, vol. 7. Government Printing Office, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I vol. 21 (Fredericksburg). Government Printing Office, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(tjekket 2026-11-15: detaljer)*
- Vegetius (trans. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(offentligt domæne)* *(tjekket 2026-11-15: eksistens)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(tjekket 2026-11-15: detaljer)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(tjekket 2026-11-15: detaljer)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(tjekket 2026-11-15: detaljer)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(tjekket 2026-11-15: detaljer)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(tjekket 2026-11-15: detaljer)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(tjekket 2026-11-15: detaljer)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(tjekket 2026-11-15: detaljer)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(tjekket 2026-11-15: detaljer)*
- Wallner, G. (ed.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(tjekket 2026-11-15: eksistens)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(tjekket 2026-11-15: detaljer)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(tjekket 2026-11-15: eksistens)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Washburn, A. R. (2002). Search and Detection (4th ed.). INFORMS / Military Applications Section, Linthicum MD. *(tjekket 2026-11-15: eksistens)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(tjekket 2026-11-15: detaljer)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(tjekket 2026-11-15: eksistens)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(tjekket 2026-11-15: detaljer)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(tjekket 2026-11-15: detaljer)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(tjekket 2026-11-15: detaljer)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(tjekket 2026-11-15: detaljer)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(tjekket 2026-11-15: detaljer)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2nd ed.). Air University Press, Maxwell AFB. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(tjekket 2026-11-15: eksistens)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(tjekket 2026-11-15: detaljer)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: detaljer)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(tjekket 2026-11-15: detaljer)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(tjekket 2026-11-15: detaljer)*
- Xenophon (trans. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(offentligt domæne)* *(tjekket 2026-11-15: detaljer)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(tjekket 2026-11-15: detaljer)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(tjekket 2026-11-15: detaljer)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(tjekket 2026-11-15: detaljer)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(tjekket 2026-11-15: eksistens)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(tjekket 2026-11-15: detaljer)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(tjekket 2026-11-15: eksistens)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(tjekket 2026-11-15: eksistens)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(tjekket 2026-11-15: detaljer)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(tjekket 2026-11-15: detaljer)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(tjekket 2026-11-15: detaljer)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(tjekket 2026-11-15: detaljer)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(tjekket 2026-11-15: detaljer)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(tjekket 2026-11-15: detaljer)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(tjekket 2026-11-15: detaljer)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(tjekket 2026-11-15: detaljer)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(tjekket 2026-11-15: detaljer)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(tjekket 2026-11-15: detaljer)*


<!-- kb:end -->

