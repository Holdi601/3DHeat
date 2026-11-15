---
title: "Kenniscatalogus"
parent: "De kennislens"
nav_order: 2
lang: "nl"
source: "knowledge-catalogue.md"
source_hash: "dc29e603ed50"
translated: true
outdated: false
---

# Kenniscatalogus

Dit is de volledige lijst van wat de [kennislens](knowledge.md) weet: de patronen die hij zoekt, de ideeën, methoden, historische gevallen en studies die hij aanhaalt, en de boeken en artikelen erachter. Gebruik deze pagina om een item op zijn id op te zoeken of om een bron te controleren.

Deze pagina wordt gegenereerd uit de kennisbank door `node tools/knowledge-doc.mjs`; bewerk niets tussen de markeringen.

<!-- kb:begin -->

De kennisbank bevat 579 items (135 concepten, 37 methoden, 277 historische gevallen, 17 ontwerpprincipes, 113 studies) over 93 patronen, met 556 verwijzingen.

### Patronen (93) {#patterns-93}

| id | familie | hoe het eruitziet in de data |
|---|---|---|
| `concentration` | kracht | De partij die meer eenheden naar één plek brengt, wint die plek met meer dan alleen het aantal verklaart. |
| `local-superiority` | kracht | Doden vallen bij de partij die binnen het gevechtsbereik in de meerderheid is, wat de totalen ook zijn. |
| `attrition` | kracht | Verliezen volgen de sterktes van beide partijen in de tijd; het gevecht wordt beslist door wie het eerst op raakt. |
| `exchange-ratio` | kracht | Doden per verlies verschillen sterk per plek, partij of klasse. |
| `aimed-fire` | kracht | Verliezen groeien met het aantal vijanden, maar niet met het eigen aantal. |
| `area-fire` | kracht | Verliezen groeien met het product van beide aantallen: samendrommen wordt gestraft. |
| `defeat-in-detail` | kracht | Een partij wordt stuk voor stuk vernietigd, naarmate haar delen één voor één aankomen. |
| `mutual-support` | kracht | Een verlies wordt snel beantwoord door een dichtbijzijnde teamgenoot: ruilen. |
| `combined-arms` | kracht | Klassen doen het samen goed waar de een de zwakte van de ander dekt, en alleen slecht. |
| `class-counter` | kracht | Eén klasse wint onevenredig vaak van een bepaalde andere klasse of op een bepaalde plek. |
| `initiative` | kracht | Wie als eerste scoort in een gevecht, wint het gevecht meestal. |
| `key-terrain` | terrein | Dezelfde paar plekken beslissen gevechten, wedstrijd na wedstrijd. |
| `fields-of-fire` | terrein | Plekken die ver zicht hebben over het terrein dat anderen moeten oversteken, scoren meer doden. |
| `high-ground` | terrein | Doden vallen vanaf hoger dan het terrein waarop de slachtoffers staan. |
| `cover` | terrein | Doden per tijdseenheid dalen waar de geometrie zicht en vuur blokkeert. |
| `open-ground` | terrein | Doden per tijdseenheid stijgen waar niets zicht en vuur blokkeert. |
| `kill-zone` | terrein | Doden concentreren zich waar beweging gedwongen wordt door waargenomen, door vuur gedekt terrein. |
| `chokepoint` | terrein | Veel oversteekplaatsen die door weinig terrein geperst worden, met verliezen daar. |
| `reverse-slope` | terrein | Veiligheid net achter een kam of muur, uit het directe zicht van de vijand. |
| `safe-ground` | terrein | Een plek waar tijd wordt doorgebracht, maar waar weinig sterven. |
| `obstacle` | terrein | Routes buigen om geblokkeerd terrein heen tot een paar banen. |
| `flank` | beweging | Een zelden gebruikte route levert meer doden op dan de hoofdroutes. |
| `avenue-of-approach` | beweging | Beweging stroomt langs een paar banen tussen gebieden. |
| `mobility` | beweging | Bewegende eenheden sterven per tijd minder (of meer) dan trage of stilstaande. |
| `static-exposure` | beweging | Eenheden die stilstaan sterven per tijd meer dan bewegende. |
| `interior-lines` | beweging | Een partij met korte routes tussen haar gevechten verschuift sneller haar kracht dan de andere. |
| `envelopment` | beweging | Doden komen uit meerdere richtingen op de positie van één partij. |
| `ambush` | beweging | Eenheden die langs een route bewegen, sterven snel voor vijanden die al in positie staan. |
| `spawn-pressure` | tijd | Levens eindigen snel na het begin op één spawnpunt. |
| `tempo` | tijd | De snellere partij komt eerder bij het gevecht en scoort voordat de ander reageert. |
| `surprise` | tijd | Verliezen komen in een uitbarsting voordat de slachtoffers terugschieten. |
| `energy-advantage` | lucht | Doders hebben meer hoogte en snelheid dan hun slachtoffers. |
| `air-superiority` | lucht | De vliegtuigen van één partij doden vele malen meer dan ze verliezen. |
| `sead` | lucht | Grondluchtverdediging neemt veel vliegtuigen tot ze gevonden en vernietigd zijn. |
| `bvr` | lucht | Doden vallen op grote afstand, voordat het slachtoffer kan naderen. |
| `fleet-salvo` | zee | Een macht die als eerste toeslaat, verliest weinig; de ander overleeft weinig om te antwoorden. |
| `scouting` | zee | De partij die de ander als eerste vindt, kiest het gevecht. |
| `urban-close` | stedelijk | Korte gevechtsafstanden, veel doden tussen dichte geometrie en langzame opruiming. |
| `vertical` | stedelijk | Doden vanaf bovenverdiepingen of daken op straten. |
| `skill-dispersion` | mensen | Enkele spelers zijn goed voor een groot deel van de doden of de sterfgevallen. |
| `ai-vs-player` | mensen | Door AI bestuurde eenheden doen het anders dan spelers op dezelfde plek. |
| `balance` | ontwerp | Partijen, spawns of klassen beginnen met ongelijke kansen. |
| `economy` | ontwerp | Verdiende, betaalde en verloren middelen concentreren zich bij enkele plekken of spelers. |
| `flow` | ontwerp | Hoe spelers door het level bewegen: lussen, banen, doodlopende wegen. |
| `sightlines` | ontwerp | Lange zichtlijnen bepalen waar gevechten beginnen en wie ze wint. |
| `readability` | ontwerp | Doden die spelers niet zien aankomen: van achteren, van buiten het zicht. |
| `formation` | beweging | Eenheden van één partij bewegen samen in een herkenbare vorm: linie, colonne, wig, echelon, blok. |
| `frontal-assault` | beweging | Een groep valt de vijand recht van voren aan. |
| `double-envelopment` | beweging | Twee groepen slaan ongeveer tegelijk op beide flanken van één vijandelijk lichaam. |
| `encirclement` | beweging | Een vijandelijke groep raakt door de andere partij omsingeld, met weinig uitwegen. |
| `penetration` | beweging | Een groep trekt door de vijandelijke linie heen, waar vijanden aan beide kanten staan. |
| `fire-and-maneuver` | beweging | Een deel van de groep beweegt terwijl de rest staat en dekking geeft, en de rollen wisselen. |
| `feint` | beweging | Een kleine groep trekt de vijand naar één plek; de hoofdinspanning slaat kort daarna elders toe. |
| `withdrawal` | beweging | Een groep in contact keert zich af en vergroot de afstand tot de vijand. |
| `pursuit` | beweging | Een groep volgt een vijand die zich verwijdert, en houdt de afstand of verkleint hem. |
| `defence-in-depth` | terrein | Verdedigers staan in meerdere linies achter elkaar langs de oprukas van de vijand. |
| `screening` | beweging | Een klein onderdeel beweegt ver voor het hoofdlichaam uit en ontmoet de vijand als eerste. |
| `dispersion` | kracht | Een partij spreidt zich in de tijd; minder van haar eenheden delen één plek. |
| `missile-defence` | lucht | Vliegtuigen onder raketdreiging draaien de dreiging naar de zijkant of de staart: crank, notch, drag, pump. |
| `angles-fight` | lucht | Dogfight op korte afstand bij lage snelheid en grote draaisnelheid, gevochten om de neuspositie en niet om energie. |
| `cap` | lucht | Vliegtuigen cirkelen minuten lang rond een vast punt en wachten tot de vijand komt. |
| `strike-package` | lucht | Vliegtuigen met verschillende rollen vliegen samen naar een doel; sommigen vallen de grond aan, anderen dekken hen. |
| `line-of-battle` | zee | Schepen varen achter elkaar in colonne zodat alle zijkanten hun kanonnen kunnen richten. |
| `crossing-the-t` | zee | Een colonne snijdt de kop van de vijandelijke colonne: al haar kanonnen kunnen schieten, weinig van de vijand. |
| `fatal-funnel` | stedelijk | Spelers die één deur, kamer of nauwe plek binnengaan, sterven daar binnen korte tijd veel vaker dan elders. |
| `crossfire` | kracht | Verdedigers wier schootsrichtingen vanuit verschillende hoeken samenkomen, winnen meer duels dan één verdediger. |
| `peeker-advantage` | tijd | De speler die in zicht komt, wint duels tegen degene die de hoek houdt vaker (of minder vaak) dan de helft. |
| `entry` | tijd | De eerste kill van een ronde beslist veel van de ronde; entries winnen of verliezen afhankelijk van plek en steun. |
| `utility-support` | kracht | Een flits of rook vlak voor een duel verandert wie het wint. |
| `man-advantage` | kracht | Rondes worden gewonnen door de partij met meer levende spelers, en sommige partijen zetten een voordeel om of verspelen het. |
| `clutch` | mensen | De laatste levende spelers winnen vaker (of minder vaak) dan de stand van de ronde voorspelt. |
| `action-value` | mensen | Kills, ruilen, plantingen en hulpmiddelen verschillen in hoeveel ze de winkans veranderen. |
| `lurk` | beweging | Een speler alleen ver van het team doodt (of sterft) in een ander tempo dan de groep. |
| `rotation` | beweging | Hoe snel een partij spelers naar het gevecht of het doel verschuift, bepaalt of ze het houdt of terugneemt. |
| `collective-order` | mensen | De bewegende eenheden van een partij gaan veel vaker dezelfde kant op dan hun eigen banen, in de tijd verschoven, zouden doen door toeval. |
| `milling` | mensen | De eenheden van een partij cirkelen rond een gemeenschappelijk middelpunt: draaien zonder netto verplaatsing. |
| `herding` | mensen | Eenheden verlaten een plek zoals de teamgenoot voor hen deed, buiten de eigen kansen van de plek en buiten het kopiëren van de vijand. |
| `lane-formation` | mensen | Tegengestelde stromen houden aparte banen aan; beweging concentreert zich op een paar sporen die wedstrijd na wedstrijd worden hergebruikt. |
| `crowding` | mensen | Snelheid en stroom dalen naarmate eenheden samendrommen; door een nauwe doorgang duwen levert harder duwen minder doorgang op. |
| `leadership` | mensen | Sommige eenheden draaien als eerste en andere kopiëren hun richting enkele seconden later. |
| `cohesion` | mensen | Eenheden die van hun groep wegdrijven sterven vaker dan die bij de groep blijven. |
| `breaking-point` | mensen | Een partij die een deel van haar sterkte heeft verloren, stopt met naderen en trekt zich terug, meer dan haar afstand tot de vijand verklaart. |
| `panic` | mensen | Onder plotselinge dreiging spatten eenheden uiteen, vluchten ze of bevriezen ze, en valt de coördinatie uiteen. |
| `loss-chasing` | mensen | Na een verlies nemen eenheden meer (of minder) risico dan na een winst. |
| `hot-hand` | mensen | Succes volgt vaker op succes dan geschudde reeksen van dezelfde speler toestaan. |
| `conformity` | mensen | Leden van een partij kiezen gelijk - aankopen, uitrustingen, routes - buiten hun eigen voorkeuren. |
| `suppression` | mensen | Inkomend vuur verandert hoe eenheden bewegen en schieten, ook als het niet doodt. |
| `social-loafing` | mensen | De inzet per hoofd daalt naarmate er meer teamgenoten aanwezig zijn. |
| `mixed-strategy` | mensen | Keuzes die onvoorspelbaar zouden moeten zijn, worden patroonmatig: de ene optie wint vaker, of keuzes lopen in reeksen. |
| `coordination` | mensen | Leden handelen in de pas zonder zichtbare bevelen: gesynchroniseerde beweging, timing en keuzes. |
| `contagion` | mensen | Een toestand gaat van eenheid tot eenheid over door contact of nabijheid en verspreidt zich over de kaart. |
| `territoriality` | mensen | Eenheden houden afstand van elkaar en blijven op hun eigen terrein. |
| `interaction-network` | mensen | Wie vecht, steunt en wie volgt, vormt een netwerk met knooppunten, clusters en bruggen. |

### Concepten (135) {#concepts-135}

| id | titel | lenzen | patronen | bronnen |
|---|---|---|---|---|
| `concept.lanchester-square` | Lanchesters kwadratenwet (gerichte vuur) | militair, lucht, marine, esports | aimed-fire, concentration, attrition, local-superiority | Lanchester 1916; Osipov 1995; Taylor 1983; Washburn & Kress 2009 |
| `concept.lanchester-linear` | Lanchesters lineaire wet (vlakvuur, één tegen één) | militair, stedelijk, esports | area-fire, attrition, urban-close | Lanchester 1916; Taylor 1983; Bracken 1995; Washburn & Kress 2009 |
| `concept.concentration` | Concentratie van kracht (massa) | militair, lucht, marine, esports | concentration, local-superiority, defeat-in-detail | Clausewitz 1873; Jomini 1862; FM 3-0 2022; MCDP 1 1997 |
| `concept.force-ratio` | Krachtverhoudingen en de 3:1-regel | militair | local-superiority, concentration, balance | Mearsheimer 1989; Epstein 1989; Dupuy 1987; FM 3-90 2023 |
| `concept.exchange-ratio` | Verliesverhouding bij ruil | militair, lucht, esports, ontwerp | exchange-ratio, attrition, air-superiority | Morse & Kimball 1951; Weapons Systems Evaluation Group 1967; Dupuy 1979 |
| `concept.combat-power` | Gevechtskracht en haar vermenigvuldigers | militair | local-superiority, combined-arms, fields-of-fire, cover | Dupuy 1979; Dupuy 1987; FM 3-0 2022; Biddle 2004 |
| `concept.modern-system` | Het moderne systeem van krachtinzet | militair | cover, open-ground, combined-arms, static-exposure | Biddle 2004 |
| `concept.ooda` | De OODA-lus (observeren-oriënteren-beslissen-handelen) | militair, lucht, esports | tempo, initiative, surprise | Boyd 1986; Osinga 2007; MCDP 1 1997 |
| `concept.energy-maneuverability` | Energie-manoeuvreerbaarheidstheorie | lucht | energy-advantage, angles-fight, high-ground, mobility | Boyd et al. 1966; Shaw 1985; Osinga 2007 |
| `concept.bfm-acm` | Basisgevechtsmanoeuvres en luchtgevechtsmanoeuvreren | lucht | angles-fight, energy-advantage, initiative, surprise | Shaw 1985; Weapons Systems Evaluation Group 1967 |
| `concept.terrain-ocoka` | Terreinanalyse: OAKOC / KOCOA | militair, ontwerp, stedelijk | key-terrain, fields-of-fire, avenue-of-approach, cover, obstacle | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.mett-tc` | METT-TC: missievariabelen | militair | balance, key-terrain | FM 3-90 2023; FM 3-0 2022 |
| `concept.key-terrain` | Sleutelterrein en beslissend terrein | militair, ontwerp, esports | key-terrain, high-ground, fields-of-fire | FM 3-90 2023; ATP 2-01.3 2019; FM 34-130 1994 |
| `concept.fields-of-fire` | Waarneming en schootsvelden | militair, ontwerp, esports, stedelijk | fields-of-fire, sightlines, high-ground | FM 3-21.8 2007; FM 3-90 2023; ATP 2-01.3 2019; Fisher 1993 |
| `concept.cover-concealment` | Dekking en camouflage | militair, stedelijk, ontwerp | cover, open-ground, reverse-slope | FM 3-21.8 2007; FM 3-90 2023; Biddle 2004 |
| `concept.avenue-of-approach` | Aanvalsassen en mobiliteitscorridors | militair, ontwerp | avenue-of-approach, flow, chokepoint, obstacle | ATP 2-01.3 2019; FM 34-130 1994; FM 5-33 1990 |
| `concept.chokepoint` | Knelpunten en nauwe doorgangen | militair, ontwerp, esports | chokepoint, kill-zone, obstacle, avenue-of-approach | FM 3-90 2023; Jomini 1862; Herodotus 1858 |
| `concept.engagement-area` | Gevechtsgebieden en doodzones | militair, stedelijk, ontwerp | kill-zone, fields-of-fire, chokepoint, obstacle | FM 3-90 2023; FM 3-90-1 2013; FM 3-21.8 2007 |
| `concept.reverse-slope` | Verdediging op de achterhelling en dekking in het terrein | militair, ontwerp | reverse-slope, safe-ground, cover, high-ground | FM 3-90-1 2013; FM 3-21.8 2007; Siborne 1844 |
| `concept.high-ground` | Het hoger gelegen terrein | militair, ontwerp | high-ground, fields-of-fire, key-terrain | Sun Tzu 1910; Vegetius 1767; FM 3-90 2023 |
| `concept.interior-lines` | Binnenlijnen en buitenlijnen | militair | interior-lines, tempo, concentration | Jomini 1862; Clausewitz 1873 |
| `concept.defeat-in-detail` | Stuk voor stuk verslagen | militair, esports | defeat-in-detail, concentration, local-superiority | Jomini 1862; Lanchester 1916 |
| `concept.mutual-support` | Wederzijdse steun | militair, lucht, esports | mutual-support, combined-arms, defeat-in-detail | FM 3-90 2023; FM 3-21.8 2007; Shaw 1985; Xenopoulos et al. 2020 |
| `concept.combined-arms` | Gecombineerde wapens | militair, ontwerp | combined-arms, class-counter | FM 3-0 2022; Biddle 2004; Doubler 1994 |
| `concept.suppression` | Onderdrukking | militair, stedelijk | combined-arms, mutual-support, cover | FM 3-90 2023; Biddle 2004 |
| `concept.sead` | Onderdrukking en vernietiging van vijandelijke luchtverdediging (SEAD/DEAD) | lucht, militair | sead, air-superiority, combined-arms | JP 3-01 2017; Department of the Air Force 2002; Lambeth 1984; Keaney & Cohen 1993 |
| `concept.cap` | Luchtpatrouille en luchtoverwicht | lucht | cap, air-superiority, exchange-ratio, key-terrain | Department of the Air Force 2002; JP 3-01 2017; Douhet 1942 |
| `concept.bvr` | Gevecht buiten zichtafstand | lucht | bvr, initiative, missile-defence, fields-of-fire | Michel 1997; Keaney & Cohen 1993; Shaw 1985 |
| `concept.indirect-approach` | De indirecte benadering | militair, esports, ontwerp | flank, surprise, avenue-of-approach | Liddell Hart 1954; Sun Tzu 1910 |
| `concept.envelopment` | Omvatting en omsingeling | militair | envelopment, double-envelopment, encirclement, flank, concentration | FM 3-90 2023; Polybius 1889; Goldsworthy 2001 |
| `concept.ambush` | Hinderlaag | militair, esports, ontwerp | ambush, surprise, kill-zone, avenue-of-approach | FM 3-21.8 2007; FM 3-90 2023; Tacitus 1876 |
| `concept.defence-in-depth` | Verdediging in de diepte | militair | defence-in-depth, attrition, kill-zone, key-terrain | FM 3-90-1 2013; Glantz & House 1999 |
| `concept.friction` | Wrijving en de nevel van de oorlog | militair, esports | readability, surprise, tempo | Clausewitz 1873; Benjamini & Hochberg 1995 |
| `concept.culminating-point` | Het keerpunt van de aanval | militair | attrition, tempo, interior-lines | Clausewitz 1873; FM 3-0 2022 |
| `concept.surprise` | Verrassing | militair, lucht, marine, esports | surprise, initiative, ambush | Sun Tzu 1910; Dupuy 1987; MCDP 1 1997 |
| `concept.economy-of-force` | Zuinige krachtinzet | militair, esports | concentration, safe-ground, balance | FM 3-0 2022; MCDP 1 1997 |
| `concept.urban-terrain` | Stedelijk terrein | stedelijk, militair, esports | urban-close, vertical, cover, kill-zone | FM 3-06 2006; FM 90-10 1979 |
| `concept.sea-control` | Zeebeheersing en de beslissende vlootslag | marine | fleet-salvo, concentration, scouting | Mahan 1890; Corbett 1911; Hughes 2000 |
| `concept.salvo` | Hughes' salvomodel: als eerste effectief aanvallen | marine, lucht | fleet-salvo, initiative, scouting | Hughes 1995; Hughes 2000 |
| `concept.search-theory` | Zoek- en detectietheorie | marine, lucht, militair | scouting, fields-of-fire | Koopman 1946; Morse & Kimball 1951 |
| `concept.operations-research` | Operationele onderzoek: maten van doeltreffendheid | militair, lucht, marine, ontwerp | exchange-ratio, attrition | Morse & Kimball 1951; Blackett 1962; Koopman 1946 |
| `concept.wargaming` | Wargaming als analyse | militair, ontwerp | balance, flow | Perla 1990; Perla & McGrady 2011 |
| `concept.manoeuvre-warfare` | Manoeuvreoorlog | militair, esports | tempo, flank, surprise, mobility | MCDP 1 1997; Boyd 1986; Liddell Hart 1954 |
| `concept.morale-cohesion` | Samenhang en de morele factor | militair | mutual-support, defeat-in-detail | Ardant du Picq 1921 |
| `concept.centre-of-gravity` | Zwaartepunt | militair | key-terrain, concentration | Clausewitz 1873; Echevarria 2002; JP 5-0 2020; Vego 2007 |
| `concept.decisive-point` | Beslissende punten | militair, esports | key-terrain, concentration | Jomini 1862; JP 5-0 2020; Vego 2007 |
| `concept.lines-of-operation` | Operatielijnen | militair | avenue-of-approach, interior-lines, flow | Jomini 1862; Vego 2007 |
| `concept.attrition-annihilation` | Strategieën van vernietiging en uitputting | militair | attrition, envelopment, tempo | Delbrück 1990; Clausewitz 1873 |
| `concept.deep-battle` | Diepe slag en diepe operaties | militair | tempo, flank, concentration, interior-lines | Triandafillov 1994; Isserson 2013; Glantz 1991 |
| `concept.airland-battle` | AirLand Battle | militair, lucht | combined-arms, tempo, initiative | FM 100-5 1982; Romjue 1984 |
| `concept.mission-command` | Missiebevel (Auftragstaktik) | militair, esports | tempo, initiative, mutual-support | Citino 2005; van Creveld 1982; MCDP 1 1997 |
| `concept.exploitation` | Doorbraak en uitbuiting | militair | tempo, pursuit, penetration, flank, defeat-in-detail | Triandafillov 1994; Blumenson 1961; FM 3-90 2023 |
| `concept.fire-and-movement` | Vuur en beweging | militair, esports | fire-and-maneuver, mutual-support, cover, combined-arms | ATP 3-21.8 2016; FM 3-21.8 2007; House 1984 |
| `concept.bounding-overwatch` | Afwisselend sprongsgewijs bewegen met dekking | militair, esports | fire-and-maneuver, mutual-support, fields-of-fire, mobility | FM 3-20.15 2007; ATP 3-21.8 2016 |
| `concept.reconnaissance-pull` | Verkenningstrek en infiltratie | militair, esports | flank, screening, scouting, tempo | Gudmundsson 1989; Lupfer 1981; FM 3-90-2 2013 |
| `concept.reserve` | De reserve | militair, esports | tempo, concentration, interior-lines | Clausewitz 1873; FM 3-90 2023 |
| `concept.elastic-defence` | Elastische verdediging en tegenaanval | militair | defence-in-depth, kill-zone, withdrawal, reverse-slope, tempo | Lupfer 1981; FM 3-90-1 2013 |
| `concept.kill-chain` | De killketen (vinden, vastpinnen, volgen, richten, aanvallen, beoordelen) | militair, lucht, marine | tempo, scouting, initiative | JP 3-60 2018; Boyd 1986 |
| `concept.detection-engagement` | Detectiebereik tegenover gevechtsbereik | lucht, marine, militair | scouting, bvr, fields-of-fire, initiative | Koopman 1946; Washburn 2002; Hughes & Girrier 2018 |
| `concept.cev` | Waarde van gevechtseffectiviteit | militair, esports | exchange-ratio, local-superiority, skill-dispersion | Dupuy 1987; Dupuy 1979; Lawrence 2017; van Creveld 1982 |
| `concept.dispersion` | Spreiding op het slagveld | militair, esports | dispersion, area-fire, mutual-support, concentration | Dupuy 1987; Biddle 2004; Clark & Evans 1954 |
| `concept.cas` | Nabije luchtsteun | lucht, militair | combined-arms, class-counter, sead | JP 3-09.3 2019 |
| `concept.interdiction` | Luchtinterdictie | lucht, militair | avenue-of-approach, interior-lines, tempo | Warden 1988; Pape 1996; JP 3-60 2018 |
| `concept.escort-sweep` | Begeleiding tegenover jachtpatrouille | lucht | air-superiority, initiative, mutual-support | Davis 1993; McFarland & Newton 1991 |
| `concept.boom-zoom` | Energiegevecht tegenover draaigevecht | lucht | energy-advantage, initiative | Shaw 1985; Boyd et al. 1966 |
| `concept.pursuit-geometry` | Lead-, pure- en lag-pursuit | lucht | energy-advantage, initiative | Shaw 1985 |
| `concept.thach-weave` | De Thach-weave | lucht | mutual-support, formation, local-superiority | Lundstrom 1984; Shaw 1985 |
| `concept.finger-four` | De finger-four en het gevechtspaar | lucht | mutual-support, formation, scouting | Shaw 1985 |
| `concept.fleet-in-being` | Vloot in bestaan | marine | safe-ground, interior-lines, balance | Corbett 1911; Till 2018 |
| `concept.crossing-the-t` | De T oversteken | marine, militair | crossing-the-t, local-superiority, fields-of-fire, concentration, line-of-battle | Hughes & Girrier 2018; Evans & Peattie 1997 |
| `concept.convoy` | Konvooi | marine | mutual-support, scouting, concentration | Waddington 1973; Blackett 1962; Corbett 1911 |
| `concept.a2ad` | Toegangsbeletsel en gebiedsontzegging | marine, lucht, militair | fields-of-fire, sead, avenue-of-approach | Krepinevich et al. 2003; Till 2018 |
| `concept.strongpoint` | Verdediging van een steunpunt in bebouwd gebied | stedelijk, militair | urban-close, kill-zone, mutual-support, vertical | FM 3-06 2006; FM 90-10 1979 |
| `concept.mouseholing` | Muishol-techniek en bewegen door gebouwen | stedelijk, militair, ontwerp | urban-close, flank, obstacle | FM 90-10 1979; ATP 3-21.8 2016 |
| `concept.siege` | Belegering | militair, stedelijk | envelopment, attrition, safe-ground | Vegetius 1767; FM 3-06 2006 |
| `concept.guerrilla` | Guerrillaoorlog | militair, stedelijk | ambush, mobility, surprise, safe-ground | Lawrence 1920; Mao Tse-tung 1961; Deitchman 1962 |
| `concept.counterinsurgency` | Contrainsurgentie | militair, stedelijk | scouting, key-terrain, safe-ground | Galula 1964; FM 3-24 2006 |
| `concept.sanctuary` | Toevluchtsoord | militair, ontwerp | safe-ground, balance | Galula 1964; Mao Tse-tung 1961 |
| `concept.deception` | Misleiding (maskirovka) | militair, esports | feint, surprise, flank, scouting | Glantz 1989; Sun Tzu 1910 |
| `concept.information-advantage` | Informatievoordeel | militair, esports | scouting, initiative, tempo | FM 3-0 2022; Boyd 1986 |
| `concept.economy-rounds` | Spaarrondes en tempo van middelen | esports, ontwerp | economy, balance, tempo | Xenopoulos et al. 2020; Adams & Dormans 2012 |
| `concept.tactical-formations` | Bewegingsformaties: linie, colonne, wig, echelon | militair, esports | formation, mutual-support | FM 3-21.8 2007; FM 3-20.15 2007; FM 3-90 2023 |
| `concept.frontal-attack` | Frontale aanval | militair | frontal-assault, attrition, concentration | FM 3-90 2023; FM 3-90-1 2013; Liddell Hart 1954 |
| `concept.double-envelopment` | Dubbele omvatting (de tang) | militair | double-envelopment, envelopment, encirclement, flank | FM 3-90 2023; Goldsworthy 2001; Polybius 1889 |
| `concept.encirclement-pocket` | Omsingeling en de ketel | militair | encirclement, envelopment, defeat-in-detail | FM 3-90 2023; Glantz & House 1995; Goldsworthy 2001 |
| `concept.penetration` | Doordringen en doorbraak | militair | penetration, concentration, local-superiority | FM 3-90 2023; Frieser 2005; Gudmundsson 1989 |
| `concept.pursuit` | Achtervolging | militair | pursuit, tempo, withdrawal | FM 3-90-1 2013; FM 3-90 2023; Clausewitz 1873 |
| `concept.retrograde` | Terugtrekkende beweging: terugtrekking, vertraging en aftocht | militair | withdrawal, defence-in-depth, mobility | FM 3-90-1 2013; FM 3-90 2023 |
| `concept.feint-demonstration` | Schijnaanval en demonstratie | militair, esports | feint, surprise, concentration | FM 3-90 2023; Glantz 1989; Liddell Hart 1954 |
| `concept.security-operations` | Scherm, bewaking en dekking: beveiliging voor het hoofdlichaam | militair | screening, scouting, surprise | FM 3-90-2 2013; FM 3-90 2023 |
| `concept.bvr-defensive` | Verdediging tegen een raket: crank, notch, drag en pump | lucht | missile-defence, bvr, energy-advantage | Shaw 1985; Michel 1997; Boyd et al. 1966 |
| `concept.bvr-formations` | Formaties buiten zichtafstand: wall, lead-trail, grinder, pincer | lucht | bvr, formation, double-envelopment, cap | Shaw 1985; Michel 1997 |
| `concept.angles-energy-fight` | Het hoekgevecht en het energiegevecht | lucht | angles-fight, energy-advantage | Shaw 1985; Boyd et al. 1966 |
| `concept.strike-package` | Aanvalspakket en de volgorde van onderdrukking | lucht | strike-package, sead, combined-arms | Keaney & Cohen 1993; Werrell 2005; Nordeen 1990 |
| `concept.line-of-battle` | De slaglinie | marine | line-of-battle, formation, crossing-the-t | Mahan 1890; Hughes & Girrier 2018; Corbett 1910 |
| `concept.fatal-funnel` | De fatale trechter | stedelijk, militair, esports, ontwerp | fatal-funnel, chokepoint, kill-zone, urban-close, entry | FM 3-06.11 2002; ATP 3-21.8 2016; Department of the Army 2011 |
| `concept.room-clearing` | Kamers ontruimen: verrassing, snelheid, gecontroleerd geweld | stedelijk, militair, esports | entry, surprise, tempo, initiative, urban-close, utility-support | FM 3-06.11 2002; Department of the Army 2011; MCWP 3-35.3 1998 |
| `concept.points-of-domination` | Beheersingspunten | stedelijk, militair, esports | crossfire, mutual-support, fields-of-fire, entry | FM 3-06.11 2002; Department of the Army 2011 |
| `concept.slicing-the-pie` | Hoeken vrijmaken: de taart snijden | stedelijk, militair, esports | peeker-advantage, sightlines, cover, readability | FM 3-06.11 2002 |
| `concept.crossfire` | Kruisvuur en elkaar overlappende schootsvelden | militair, stedelijk, esports, ontwerp | crossfire, fields-of-fire, kill-zone, mutual-support | FM 3-21.8 2007; ATP 3-06 2022; FM 3-06.11 2002 |
| `concept.peekers-advantage` | Het voordeel van wie kijkt | esports, ontwerp | peeker-advantage, initiative, surprise, readability | Bernier 2001; Tokey et al. 2024; Lee & Chang 2017; Liu et al. 2022 |
| `concept.man-advantage` | Meerderheid in eliminatierondes | esports, militair | man-advantage, local-superiority, entry, concentration | Xenopoulos et al. 2022; Xenopoulos et al. 2020; Makarov et al. 2018 |
| `concept.entry-duel` | Entry en het openingsduel | esports, stedelijk | entry, initiative, action-value, tempo | Xenopoulos et al. 2020; Xenopoulos et al. 2022; FM 3-06.11 2002 |
| `concept.utility-entry` | Hulpmiddelen vóór de entry: flits en rook | esports, stedelijk, militair | utility-support, surprise, entry, cover | FM 3-06.11 2002; ATP 3-06 2022; Xenopoulos et al. 2020 |
| `concept.social-force-model` | Sociale krachtenmodel van voetgangersbeweging | ontwerp, stedelijk, militair | crowding, lane-formation, panic, territoriality | Helbing & Molnár 1995; Helbing et al. 2005; Moussaïd et al. 2011 |
| `concept.lane-formation` | Baanvorming bij tegenstroom | ontwerp, stedelijk | lane-formation, flow, avenue-of-approach | Helbing et al. 2005; Helbing & Molnár 1995; Moussaïd et al. 2011 |
| `concept.faster-is-slower` | Sneller is langzamer | ontwerp, stedelijk, militair | crowding, chokepoint, panic | Helbing et al. 2000; Garcimartín et al. 2014; Haghani & Sarvi 2018 |
| `concept.fundamental-diagram` | Het fundamentele diagram van menigten | ontwerp, stedelijk | crowding, flow | Seyfried et al. 2005; Fruin 1971; Haghani & Sarvi 2018 |
| `concept.trail-formation` | Paadvorming en wenslijnen | ontwerp, militair | lane-formation, flow, avenue-of-approach, key-terrain | Helbing et al. 1997; Helbing et al. 2005 |
| `concept.panic-myth` | Paniek is zeldzaam: collectieve veerkracht | militair, stedelijk, ontwerp | panic, cohesion, mutual-support | Quarantelli 1954; Drury et al. 2009; Helbing et al. 2000 |
| `concept.boids` | Boids: scheiding, uitlijning, samenhang | ontwerp, militair | collective-order, cohesion, territoriality | Reynolds 1987; Vicsek & Zafeiris 2012 |
| `concept.vicsek-order` | Ordeparameter en het ontstaan van collectieve beweging | ontwerp, militair, lucht, marine | collective-order, coordination | Vicsek et al. 1995; Vicsek & Zafeiris 2012 |
| `concept.collective-states` | Zwerm, cirkelen en gepolariseerde toestanden | ontwerp, militair, marine | milling, collective-order | Couzin et al. 2002; Tunstrøm et al. 2013 |
| `concept.effective-leadership` | Effectief leiderschap zonder signalen | militair, esports, ontwerp | leadership, coordination, herding | Couzin et al. 2005; Dyer et al. 2009; Krause et al. 2010 |
| `concept.topological-interaction` | Buren op aantal, niet op afstand | lucht, militair | cohesion, collective-order | Ballerini et al. 2008 |
| `concept.swarm-intelligence` | Zwermintelligentie | ontwerp, esports, militair | coordination, herding, collective-order | Krause et al. 2010; Lorenz et al. 2011 |
| `concept.information-cascade` | Kuddegedrag en informatiewaterval | esports, ontwerp, militair | herding, conformity | Banerjee 1992; Bikhchandani et al. 1992; Anderson & Holt 1996 |
| `concept.social-loafing` | Sociaal profiteren | esports, ontwerp, militair | social-loafing, mutual-support | Latané et al. 1979; Karau & Williams 1993 |
| `concept.diffusion-of-responsibility` | Verspreiding van verantwoordelijkheid | esports, militair | social-loafing, mutual-support | Darley & Latané 1968; Fischer et al. 2011 |
| `concept.primary-group` | Cohesie van de primaire groep | militair, esports | cohesion, mutual-support, breaking-point | Shils & Janowitz 1948; Siebold 2007; King 2013 |
| `concept.breaking-point` | Breekpunten en verliesdrempels | militair | breaking-point, attrition, panic | Dupuy 1987; Rowland 2006; Dupuy 1990 |
| `concept.suppression-effects` | Onderdrukking: wat vuur behalve doden nog doet | militair, stedelijk | suppression, static-exposure, panic | Rowland 2006; Marshall 1947 |
| `concept.fear-in-combat` | Angst en stress bij beslissingen in gevechten | militair, esports | panic, suppression, loss-chasing | Stouffer & et al. 1949; Starcke & Brand 2012 |
| `concept.choking` | Bezwijken onder druk | esports | panic, loss-chasing, hot-hand | Baumeister 1984 |
| `concept.prospect-theory` | Vooruitzichttheorie en verliesaversie | esports, ontwerp | loss-chasing | Kahneman & Tversky 1979; Tversky & Kahneman 1992 |
| `concept.break-even` | Break-even en het geld-van-het-huis-effect | esports | loss-chasing | Thaler & Johnson 1990; Post et al. 2008 |
| `concept.tilt` | Tilt | esports | loss-chasing, panic | Smith et al. 2009 |
| `concept.sunk-cost` | Verzonken kosten | esports, militair | loss-chasing, key-terrain, attrition | Arkes & Blumer 1985 |
| `concept.hot-hand` | De hete hand en de denkfout daarover | esports | hot-hand, skill-dispersion | Gilovich et al. 1985; Bar-Eli et al. 2006; Miller & Sanjurjo 2018 |
| `concept.mixed-strategy` | Gemengde strategieën: onvoorspelbaar zijn | esports, ontwerp, militair | mixed-strategy, balance | von Neumann & Morgenstern 1944; Walker & Wooders 2001; Wald & Wolfowitz 1940 |
| `concept.shared-mental-models` | Gedeelde mentale modellen | esports, militair | coordination, leadership | Mohammed et al. 2010; DeChurch & Mesmer-Magnus 2010 |
| `concept.teamwork-components` | De onderdelen van teamwerk | esports, militair | coordination, leadership, mutual-support | Salas et al. 2005 |
| `concept.virtual-worlds-labs` | Virtuele werelden als laboratoria van gedrag | ontwerp, esports | interaction-network, contagion, territoriality, coordination | Bainbridge 2007; Castronova 2005; Yee et al. 2007 |
| `concept.proxemics-territory` | Persoonlijke ruimte en territorium | ontwerp, stedelijk | territoriality, cohesion, crowding | Hall 1966; Altman 1975; Yee et al. 2007 |
| `concept.interaction-networks` | Interactienetwerken: knooppunten en zwakke banden | esports, ontwerp | interaction-network, coordination | Barabási & Albert 1999; Granovetter 1973; Newman 2003 |

### Methoden (37) {#methods-37}

| id | titel | patronen | bronnen |
|---|---|---|---|
| `method.lanchester-fit` | Lanchester-exponenten passen op gevechtsdata | attrition, aimed-fire, area-fire, concentration | Engel 1954; Bracken 1995; Fricker 1998; Hartley & Helmbold 1995; Lucas & Turkes 2004; McCullagh & Nelder 1989 |
| `method.exchange-ratio` | Verliesverhouding per partij en per plek | exchange-ratio, kill-zone | Morse & Kimball 1951; Gini 1912; Dupuy 1979 |
| `method.force-ratio` | Lokale krachtverhouding op het moment van elke kill | local-superiority, concentration, defeat-in-detail, bvr | Lanchester 1916; Dupuy 1987; Mearsheimer 1989; Washburn & Kress 2009 |
| `method.viewshed` | Zichtveld: schootsvelden langs de zichtlijn | fields-of-fire, sightlines, cover, reverse-slope | Fisher 1993; ATP 2-01.3 2019; FM 5-33 1990; Kendall 1938 |
| `method.energy-state` | Specifieke energie bij kills en sterfgevallen (lucht) | energy-advantage, air-superiority | Boyd et al. 1966; Shaw 1985; Mann & Whitney 1947 |
| `method.key-terrain` | Blijvende hotspots over wedstrijden heen | key-terrain, flow | FM 3-90 2023; Drachen & Canossa 2009; Kendall 1938 |
| `method.trades` | Ruilpercentage (wederzijdse steun) | mutual-support, defeat-in-detail | Xenopoulos et al. 2020; Schubert et al. 2016; FM 3-21.8 2007 |
| `method.initiative` | Gevechten en het voordeel van de eerste kill | initiative, tempo, fleet-salvo, surprise | Hughes 1995; Boyd 1986; Schubert et al. 2016; Xenopoulos et al. 2020 |
| `method.spatial-autocorrelation` | Ruimtelijke autocorrelatie van sterfgevallen (Moran's I) | kill-zone, flow, key-terrain | Moran 1950; Anselin 1995; Getis & Ord 1992 |
| `method.rate-baseline` | Percentages tegen de eigen basislijn van de kaart, met FDR-controle | exchange-ratio, safe-ground, kill-zone | Benjamini & Hochberg 1995; Kulldorff 1997; Getis & Ord 1992; Drachen & Canossa 2009 |
| `method.ipb` | Inlichtingenvoorbereiding van het slagveld (IPB) | key-terrain, avenue-of-approach, obstacle, fields-of-fire | ATP 2-01.3 2019; FM 34-130 1994 |
| `method.rating-models` | Rangmodellen op basis van paarsgewijze vergelijking (Elo, Glicko, TrueSkill) | skill-dispersion, balance | Elo 1978; Bradley & Terry 1952; Glickman 1999; Herbrich et al. 2007; Minka et al. 2018 |
| `method.win-probability` | Winkans en waardering van acties | initiative, economy, skill-dispersion | Xenopoulos et al. 2020; Hodge et al. 2021; Makarov et al. 2018; Cervone et al. 2016 |
| `method.space-control` | Controle over de ruimte en over het veld | key-terrain, flow, local-superiority | Fernández & Bornn 2018; Spearman 2018; Goldsberry 2012 |
| `method.salvo-fit` | Salvovergelijking gepast op schepen in contact | fleet-salvo, initiative, scouting, attrition | Hughes 1995; Hughes 2000; Armstrong 2005; Hughes & Girrier 2018 |
| `method.combat-power` | Verhouding van gevechtseffectiviteit per eenheidsuur in actie | exchange-ratio, balance, local-superiority, skill-dispersion | Dupuy 1979; Dupuy 1987; Dupuy 1990; Rotte & Schmidt 2003; Biddle 2004 |
| `method.engagement-ranges` | Afstanden van detectie tot gevecht en gevechtsafstanden | bvr, fields-of-fire, scouting, sightlines | Weapons Systems Evaluation Group 1967; Ault 1969; Keaney & Cohen 1993; Shaw 1985; Koopman 1946 |
| `method.kill-chain` | Timing van de killketen | tempo, initiative, surprise | Boyd 1986; Osinga 2007; Weapons Systems Evaluation Group 1967 |
| `method.dispersion` | Spreiding tegen het aandeel van de kills (concentratie van kracht in de tijd) | concentration, area-fire, local-superiority, mutual-support | Lanchester 1916; Biddle 2004; Clausewitz 1873; Jomini 1862 |
| `method.sortie-attrition` | Verliespercentage en kills per vlucht | air-superiority, exchange-ratio, attrition | Keaney & Cohen 1993; Morse & Kimball 1951; Overy 2000; Weapons Systems Evaluation Group 1967 |
| `method.round-win-probability` | Model voor de winkans per ronde | action-value, man-advantage, entry, clutch | Xenopoulos et al. 2022; Lock & Nettleton 2014; Robberechts et al. 2021; Brier 1950; Guo et al. 2017; Pakdaman Naeini et al. 2015 |
| `method.win-probability-added` | Waarde van een actie: toegevoegde winkans | action-value, entry, utility-support, mutual-support | Xenopoulos et al. 2020; Maymin 2021; Fernández et al. 2021; Pollard & Reep 1997; Decroos et al. 2019 |
| `method.adjusted-plus-minus` | Aangepaste plus-minus met ridge-regressie (RAPM) | skill-dispersion, action-value, mutual-support | Sill 2010; Macdonald 2012; Hoerl & Kennard 1970 |
| `method.empirical-bayes` | Krimp: empirische Bayes | skill-dispersion, action-value, clutch | Efron & Morris 1975 |
| `method.expected-kills` | Verwachte uitkomsten: van verwachte doelpunten naar verwachte duels | clutch, action-value, peeker-advantage, sightlines | Rathke 2017; Pollard & Reep 1997; Spearman 2018 |
| `method.setups-rotations` | Opstellingen, rotaties en loerpunten meten | rotation, lurk, interior-lines, concentration, flank | Benjamini & Hochberg 1995 |
| `method.reflection-problem` | Het reflectieprobleem: kopiëren of gemeenschappelijke oorzaak | herding, conformity | Manski 1993 |
| `method.streak-correction` | Reeksen met de correctie voor eindige reeksen | hot-hand | Miller & Sanjurjo 2018; Phipson & Smyth 2010 |
| `method.order-parameters` | Ordeparameters voor polarisatie en cirkelen | collective-order, milling | Vicsek et al. 1995; Couzin et al. 2002; Tunstrøm et al. 2013 |
| `method.lagged-heading` | Leiders uit de koersovereenkomst met tijdvertraging | leadership, coordination | Nagy et al. 2010; Couzin et al. 2005 |
| `method.route-cascade` | Routecascadetest voor kuddegedrag | herding, conformity | Bikhchandani et al. 1992; Manski 1993; Phipson & Smyth 2010 |
| `method.lane-segregation` | Scheiding van banen en persistentie van paden | lane-formation, flow | Helbing et al. 2005; Helbing et al. 1997 |
| `method.straggler-hazard` | Risico van achterblijvers | cohesion, mutual-support, defeat-in-detail | Moussaïd et al. 2010; Siebold 2007 |
| `method.breaking-curve` | Breekkromme | breaking-point, attrition | Dupuy 1987; Rowland 2006 |
| `method.suppression-response` | Reactie op inkomend vuur | suppression | Rowland 2006 |
| `method.risk-after-outcome` | Risico na een verlies of een winst | loss-chasing | Thaler & Johnson 1990; Miller & Sanjurjo 2018 |
| `method.buy-agreement` | Overeenstemming bij aankopen (Fleiss' kappa) | conformity, economy, coordination | Fleiss 1971; Phipson & Smyth 2010 |

### Historische gevallen (277) {#historical-cases-277}

| id | geval | wanneer | omvang | patronen | bronnen |
|---|---|---|---|---|---|
| `case.thermopylae` | Thermopylae | 480 v.Chr. | slag | chokepoint, kill-zone, local-superiority, flank | Herodotus 1858 |
| `case.salamis` | Salamis | 480 v.Chr. | slag | chokepoint, local-superiority, concentration | Herodotus 1858; Strauss 2004 |
| `case.marathon` | Marathon | 490 v.Chr. | slag | envelopment, tempo, concentration | Herodotus 1858 |
| `case.leuctra` | Leuctra | 371 v.Chr. | slag | concentration, local-superiority | Xenophon 1897 |
| `case.gaugamela` | Gaugamela | 331 v.Chr. | slag | concentration, tempo, flank | Arrian 1893 |
| `case.trasimene` | Trasimeense Meer | 217 v.Chr. | slag | ambush, surprise, kill-zone, chokepoint | Polybius 1889 |
| `case.cannae` | Cannae | 216 v.Chr. | slag | double-envelopment, envelopment, encirclement, local-superiority, concentration, attrition | Polybius 1889; Goldsworthy 2001 |
| `case.teutoburg` | Teutoburgerwoud | 9 n.Chr. | slag | ambush, surprise, chokepoint, obstacle | Tacitus 1876 |
| `case.hastings` | Hastings | 1066 | slag | high-ground, key-terrain, surprise | Morillo 1996 |
| `case.stirling-bridge` | Stirling Bridge | 1297 | slag | defeat-in-detail, chokepoint, local-superiority | Barrow 1965 |
| `case.agincourt` | Agincourt | 1415 | slag | chokepoint, kill-zone, fields-of-fire, open-ground | Curry 2005 |
| `case.leuthen` | Leuthen | 1757 | slag | concentration, feint, flank, surprise, interior-lines | Showalter 1996 |
| `case.austerlitz` | Austerlitz | 1805 | slag | key-terrain, high-ground, concentration, surprise | Chandler 1966 |
| `case.trafalgar` | Trafalgar | 1805 | slag | concentration, line-of-battle, local-superiority, penetration, initiative | Corbett 1910; Mahan 1890 |
| `case.waterloo` | Waterloo | 1815 | slag | reverse-slope, key-terrain, safe-ground, attrition | Siborne 1844 |
| `case.fredericksburg` | Fredericksburg: Marye's Heights | 1862 | gevecht | kill-zone, open-ground, cover, fields-of-fire | US War Department 1888 |
| `case.little-round-top` | Gettysburg: Little Round Top | 1863 | gevecht | key-terrain, high-ground, fields-of-fire | Coddington 1968 |
| `case.picketts-charge` | Gettysburg: Pickett's Charge | 1863 | gevecht | frontal-assault, open-ground, kill-zone, fields-of-fire, envelopment | Coddington 1968 |
| `case.isandlwana` | Isandlwana | 1879 | slag | envelopment, defeat-in-detail, surprise | Knight 2002 |
| `case.rorkes-drift` | Rorke's Drift | 1879 | gevecht | cover, kill-zone, mutual-support, local-superiority | Knight 2002 |
| `case.tannenberg` | Tannenberg | 1914 | veldtocht | interior-lines, defeat-in-detail, double-envelopment, encirclement, concentration, envelopment | Showalter 1991 |
| `case.somme-1916` | De Somme, eerste dag | 1 juli 1916 | slag | open-ground, frontal-assault, kill-zone, attrition, static-exposure | Middlebrook 1971; Biddle 2004 |
| `case.verdun` | Verdun | 1916 | veldtocht | attrition, key-terrain, kill-zone | Horne 1962 |
| `case.jutland` | Jutland | 1916 | slag | crossing-the-t, line-of-battle, scouting, exchange-ratio, fleet-salvo | Gordon 1996; Campbell 1986; Corbett 1923 |
| `case.suomussalmi` | Suomussalmi | 1939-40 | slag | defeat-in-detail, ambush, mobility, envelopment | Trotter 1991 |
| `case.ardennes-1940` | Sedan en de Ardennen | mei 1940 | veldtocht | penetration, flank, surprise, tempo, avenue-of-approach | Frieser 2005 |
| `case.arras-1940` | Tegenaanval bij Arras | 21 mei 1940 | gevecht | combined-arms, class-counter, surprise | Frieser 2005 |
| `case.battle-of-britain` | Slag om Engeland | jul-okt 1940 | veldtocht | air-superiority, interior-lines, scouting, concentration | Overy 2000; Bungay 2000 |
| `case.battle-of-atlantic` | Slag om de Atlantische Oceaan: operationeel onderzoek naar konvooien | 1939-45 | veldtocht | scouting, concentration, mutual-support | Blackett 1962; Morse & Kimball 1951 |
| `case.midway` | Midway | juni 1942 | slag | fleet-salvo, scouting, initiative, surprise | Parshall & Tully 2005 |
| `case.el-alamein` | Tweede El Alamein | okt-nov 1942 | slag | attrition, obstacle, kill-zone, combined-arms | Barr 2004 |
| `case.kasserine` | Kasserine-pas | feb 1943 | slag | mutual-support, defeat-in-detail, key-terrain | Blumenson 1967 |
| `case.stalingrad` | Stalingrad | aug 1942-feb 1943 | veldtocht | encirclement, urban-close, attrition, double-envelopment, vertical, envelopment | Beevor 1998; Glantz & House 1995 |
| `case.kursk` | Koersk | juli 1943 | veldtocht | defence-in-depth, attrition, obstacle, fields-of-fire, kill-zone | Glantz & House 1999; Zetterling & Frankson 2000; Lucas & Turkes 2004 |
| `case.prokhorovka` | Prochorovka | 12 juli 1943 | gevecht | exchange-ratio, fields-of-fire, open-ground, local-superiority | Zetterling & Frankson 2000; Glantz & House 1999 |
| `case.villers-bocage` | Villers-Bocage | 13 juni 1944 | gevecht | ambush, kill-zone, chokepoint, class-counter | Forty 2004 |
| `case.normandy-bocage` | Normandische heggenlandschap | juni-juli 1944 | veldtocht | cover, combined-arms, fields-of-fire, urban-close | Doubler 1994; Blumenson 1961 |
| `case.cobra` | Operatie Cobra | juli 1944 | veldtocht | concentration, tempo, local-superiority | Blumenson 1961 |
| `case.leyte-gulf` | Golf van Leyte | okt 1944 | slag | scouting, concentration, chokepoint, surprise | Morison 1958; Cutler 1994 |
| `case.bastogne` | Bastogne | dec 1944 | slag | key-terrain, interior-lines, mutual-support | Cole 1965 |
| `case.tsushima` | Tsushima | mei 1905 | slag | crossing-the-t, concentration, line-of-battle, local-superiority, fields-of-fire | Evans & Peattie 1997 |
| `case.inchon` | Inchon | sept 1950 | veldtocht | flank, surprise, interior-lines | Heinl 1968 |
| `case.mig-alley` | MiG Alley | 1950-53 | veldtocht | air-superiority, exchange-ratio, skill-dispersion, energy-advantage | Werrell 2005 |
| `case.dien-bien-phu` | Dien Bien Phu | 1954 | slag | high-ground, fields-of-fire, key-terrain, attrition | Fall 1966 |
| `case.ia-drang` | Ia Drang: LZ X-Ray | nov 1965 | gevecht | mutual-support, combined-arms, mobility | Moore & Galloway 1992 |
| `case.operation-bolo` | Operatie Bolo | 2 jan 1967 | gevecht | feint, surprise, ambush, initiative, energy-advantage | Michel 1997 |
| `case.valley-of-tears` | Golan: het Dal der Tranen | okt 1973 | slag | fields-of-fire, exchange-ratio, high-ground, kill-zone, obstacle | Herzog 1975; Rabinovich 2004; Kahalani 1984 |
| `case.chinese-farm` | Sinaï: de Chinese boerderij | okt 1973 | slag | combined-arms, class-counter, kill-zone | Herzog 1975; Rabinovich 2004 |
| `case.bekaa-1982` | Bekaa-vallei (Operatie Mole Cricket 19) | juni 1982 | slag | sead, air-superiority, strike-package, scouting, exchange-ratio | Lambeth 1984 |
| `case.falklands` | Luchtoorlog om de Falklands | mei-juni 1982 | veldtocht | air-superiority, kill-zone, exchange-ratio, chokepoint | Ethell & Price 1983; Woodward & Robinson 1992 |
| `case.desert-storm-air` | Luchtcampagne Desert Storm | jan-feb 1991 | veldtocht | air-superiority, sead, bvr, tempo | Keaney & Cohen 1993; Hallion 1992 |
| `case.73-easting` | 73 Easting | 26 feb 1991 | gevecht | exchange-ratio, initiative, fields-of-fire, surprise | Krause 1991; Bourque 2002; Biddle 2004 |
| `case.mogadishu` | Mogadishu | okt 1993 | gevecht | urban-close, kill-zone, avenue-of-approach, vertical | Bowden 1999 |
| `case.grozny` | Grozny | dec 1994-feb 1995 | slag | vertical, urban-close, combined-arms, class-counter, ambush | Grau 1997; FM 3-06 2006 |
| `case.hue` | Hue | jan-mrt 1968 | slag | urban-close, attrition, combined-arms | Nolan 1983 |
| `case.kosovo-1999` | Luchtcampagne Kosovo | mrt-jun 1999 | veldtocht | sead, scouting, static-exposure | Lambeth 2001 |
| `case.fallujah` | Fallujah (Operatie Al Fajr) | nov 2004 | slag | combined-arms, urban-close, mutual-support, envelopment | Matthews 2006 |
| `case.mosul` | Mosul | 2016-17 | veldtocht | urban-close, attrition, vertical, ambush | Arnold & Fiore 2019 |
| `case.kadesh` | Kadesh | ca. 1274 v.Chr. | slag | surprise, ambush, scouting, mutual-support | Healy 1993 |
| `case.issus` | Issus | 333 v.Chr. | slag | chokepoint, concentration, local-superiority, tempo | Arrian 1893 |
| `case.zama` | Zama | 202 v.Chr. | slag | class-counter, envelopment, combined-arms | Polybius 1889; Livy 1905 |
| `case.carrhae` | Carrhae | 53 v.Chr. | slag | class-counter, open-ground, mobility, attrition | Plutarch 1916 |
| `case.pharsalus` | Farsalos | 48 v.Chr. | slag | class-counter, flank, concentration | Caesar 1869 |
| `case.adrianople` | Adrianopel | 378 n.Chr. | slag | envelopment, surprise, scouting, defeat-in-detail | Ammianus Marcellinus 1862 |
| `case.yarmouk` | Yarmouk | 636 n.Chr. | slag | mobility, key-terrain, attrition, envelopment | Kennedy 2007 |
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
| `case.saratoga` | Saratoga | 1777 | veldtocht | obstacle, key-terrain, attrition, fields-of-fire | Ketchum 1997 |
| `case.yorktown` | Yorktown | 1781 | slag | envelopment, key-terrain, attrition | Greene 2005 |
| `case.jena-auerstedt` | Jena-Auerstedt | 1806 | slag | tempo, mobility, defeat-in-detail, local-superiority | Chandler 1966 |
| `case.borodino` | Borodino | 1812 | slag | attrition, fields-of-fire, key-terrain | Chandler 1966 |
| `case.leipzig` | Leipzig | 1813 | slag | envelopment, interior-lines, concentration, chokepoint | Chandler 1966 |
| `case.antietam` | Antietam | 1862 | slag | defeat-in-detail, attrition, chokepoint, interior-lines | Sears 1983 |
| `case.chancellorsville` | Chancellorsville | 1863 | slag | flank, surprise, cover | Sears 1996 |
| `case.vicksburg` | Vicksburg | 1863 | veldtocht | mobility, key-terrain, interior-lines, defeat-in-detail | Ballard 2004 |
| `case.koniggratz` | Königgrätz (Sadowa) | 1866 | slag | envelopment, class-counter, tempo, fields-of-fire | Wawro 1996 |
| `case.sedan-1870` | Sedan | 1870 | slag | envelopment, high-ground, fields-of-fire | Howard 1961 |
| `case.mukden` | Mukden | 1905 | slag | attrition, envelopment, fields-of-fire | Connaughton 1988 |
| `case.omdurman` | Omdurman | 1898 | slag | fields-of-fire, open-ground, exchange-ratio, class-counter | Churchill 1899 |
| `case.spion-kop` | Spion Kop | 1900 | gevecht | high-ground, fields-of-fire, static-exposure, key-terrain | Pakenham 1979 |
| `case.gallipoli` | Gallipoli | 1915 | veldtocht | high-ground, attrition, kill-zone, key-terrain | Travers 2001 |
| `case.cambrai-1917` | Cambrai | nov 1917 | slag | surprise, combined-arms, penetration, class-counter, tempo | Cooper 1967 |
| `case.caporetto` | Caporetto | okt-nov 1917 | veldtocht | tempo, flank, avenue-of-approach, surprise | Gudmundsson 1989; Rommel 1937 |
| `case.kaiserschlacht` | Het Duitse voorjaarsoffensief (Operatie Michael) | mrt-apr 1918 | veldtocht | penetration, tempo, surprise, attrition, mobility | Gudmundsson 1989 |
| `case.amiens-1918` | Amiens | aug 1918 | slag | combined-arms, surprise, concentration | Prior & Wilson 1992 |
| `case.khalkhin-gol` | Chalchin Gol (Nomonhan) | aug 1939 | slag | envelopment, combined-arms, concentration, surprise | Drea 1981; Coox 1985 |
| `case.poland-1939` | De Poolse veldtocht | sept 1939 | veldtocht | envelopment, tempo, mobility, air-superiority | Zaloga & Madej 1985 |
| `case.hannut-gembloux` | Hannut en Gembloux | mei 1940 | slag | concentration, class-counter, combined-arms | Frieser 2005 |
| `case.stonne` | Stonne | mei 1940 | gevecht | key-terrain, attrition, high-ground | Frieser 2005; Doughty 1990 |
| `case.dunkirk` | De omtrek van Duinkerke | mei-juni 1940 | veldtocht | withdrawal, obstacle, safe-ground, mutual-support | Frieser 2005; May 2000 |
| `case.beda-fomm` | Operatie Compass en Beda Fomm | dec 1940-feb 1941 | veldtocht | mobility, flank, tempo, exchange-ratio | Playfair et al. 1954 |
| `case.crusader` | Operatie Crusader en Sidi Rezegh | nov-dec 1941 | veldtocht | defeat-in-detail, combined-arms, attrition, concentration | Playfair et al. 1960 |
| `case.gazala` | Gazala | mei-juni 1942 | slag | flank, defeat-in-detail, mutual-support, obstacle | Playfair et al. 1960 |
| `case.alam-halfa` | Alam Halfa | aug-sept 1942 | slag | fields-of-fire, key-terrain, obstacle, air-superiority | Barr 2004 |
| `case.dubno-brody` | Doebno-Brody | juni 1941 | slag | defeat-in-detail, combined-arms, air-superiority | Glantz 2001; Glantz & House 1995 |
| `case.kiev-1941` | Omsingeling van Kiev | sept 1941 | veldtocht | encirclement, envelopment, double-envelopment, static-exposure, tempo | Glantz & House 1995; Erickson 1975 |
| `case.moscow-1941` | Moskou | okt 1941-jan 1942 | veldtocht | attrition, tempo, interior-lines, surprise | Glantz & House 1995; Erickson 1975 |
| `case.rzhev-mars` | Rzjev en Operatie Mars | 1942 | veldtocht | attrition, kill-zone, defeat-in-detail | Glantz 1999 |
| `case.second-kharkov` | Tweede Charkov | mei 1942 | slag | envelopment, flank, tempo | Glantz 1998 |
| `case.third-kharkov` | Derde Charkov (Manstein's achterhandse slag) | feb-mrt 1943 | veldtocht | tempo, flank, interior-lines, local-superiority | Glantz 1991; Manstein 1958 |
| `case.bagration` | Operatie Bagration | juni-aug 1944 | veldtocht | concentration, envelopment, surprise, tempo | Zaloga 1996; Glantz & House 1995 |
| `case.korsun` | Ketel van Korsoen-Tsjerkassy | jan-feb 1944 | slag | encirclement, envelopment, attrition, open-ground | Nash 2002; Glantz & House 1995 |
| `case.kamenets-podolsky` | Ketel van Kamenets-Podolski | mrt-apr 1944 | veldtocht | mobility, envelopment, interior-lines | Glantz & House 1995 |
| `case.epsom` | Operatie Epsom | juni 1944 | slag | attrition, key-terrain, cover | D'Este 1983; Hastings 1984 |
| `case.goodwood` | Operatie Goodwood | juli 1944 | slag | open-ground, fields-of-fire, combined-arms, exchange-ratio | D'Este 1983; Hastings 1984 |
| `case.totalize` | Operatie Totalize | aug 1944 | slag | surprise, combined-arms, tempo | Copp 2003 |
| `case.mortain` | Mortain | aug 1944 | slag | key-terrain, high-ground, fields-of-fire, air-superiority | Blumenson 1961 |
| `case.falaise` | Ketel van Falaise | aug 1944 | veldtocht | encirclement, envelopment, double-envelopment, kill-zone, chokepoint | Blumenson 1961; Hastings 1984 |
| `case.market-garden` | Market Garden en Arnhem | sept 1944 | veldtocht | chokepoint, avenue-of-approach, tempo, key-terrain | MacDonald 1963; Ryan 1974 |
| `case.aachen` | Aken | okt 1944 | slag | urban-close, combined-arms, envelopment | MacDonald 1963 |
| `case.hurtgen` | Hürtgenwald | sept 1944-feb 1945 | veldtocht | attrition, cover, class-counter, ambush | MacDonald 1963 |
| `case.arracourt` | Arracourt | sept 1944 | slag | exchange-ratio, fields-of-fire, mobility, scouting | Cole 1950 |
| `case.st-vith` | St. Vith | dec 1944 | slag | key-terrain, interior-lines, mobility | Cole 1965; MacDonald 1985 |
| `case.elsenborn` | Elsenborn Ridge | dec 1944 | slag | high-ground, fields-of-fire, key-terrain, chokepoint | Cole 1965; MacDonald 1985 |
| `case.seelow` | Seelow-hoogten | apr 1945 | slag | high-ground, fields-of-fire, attrition, obstacle | Beevor 2002; Glantz & House 1995 |
| `case.berlin-1945` | Berlijn | apr-mei 1945 | slag | urban-close, combined-arms, attrition, vertical | Beevor 2002 |
| `case.spring-awakening` | Operatie Spring Awakening | mrt 1945 | slag | obstacle, attrition, mobility, kill-zone | Glantz & House 1995 |
| `case.ortona` | Ortona | dec 1943 | slag | urban-close, vertical, kill-zone, ambush | Zuehlke 1999 |
| `case.warsaw-1944` | Opstand van Warschau | aug-okt 1944 | veldtocht | urban-close, attrition, vertical | Davies 2003 |
| `case.tarawa` | Tarawa | nov 1943 | slag | open-ground, kill-zone, obstacle, fields-of-fire | Alexander 1993 |
| `case.peleliu` | Peleliu | sept-nov 1944 | slag | cover, attrition, high-ground, mutual-support | Gayle 1996 |
| `case.iwo-jima` | Iwo Jima | feb-mrt 1945 | slag | attrition, aimed-fire, cover, kill-zone | Bartley 1954; Engel 1954 |
| `case.okinawa` | Okinawa | apr-juni 1945 | veldtocht | attrition, reverse-slope, mutual-support, fields-of-fire | Appleman et al. 1948 |
| `case.manila-1945` | Manila | feb-mrt 1945 | slag | urban-close, attrition, vertical | Smith 1963 |
| `case.manchuria-1945` | Mantsjoerije (Augustusstorm) | aug 1945 | veldtocht | tempo, avenue-of-approach, surprise, envelopment | Glantz 1983 |
| `case.pusan-perimeter` | De omtrek van Busan | aug-sept 1950 | veldtocht | interior-lines, mutual-support, obstacle | Appleman 1961 |
| `case.chosin` | Chosin-stuwmeer | nov-dec 1950 | veldtocht | envelopment, mutual-support, chokepoint, key-terrain | Montross & Canzona 1957; Appleman 1987 |
| `case.imjin` | Imjinrivier | apr 1951 | slag | mutual-support, key-terrain, defeat-in-detail, attrition | Salmon 2009 |
| `case.kapyong` | Kapyong | apr 1951 | slag | key-terrain, high-ground, mutual-support, fields-of-fire | O'Neill 1985 |
| `case.pork-chop` | Pork Chop Hill | apr en juli 1953 | gevecht | attrition, kill-zone, key-terrain | Marshall 1956; Hermes 1966 |
| `case.khe-sanh` | Khe Sanh | jan-apr 1968 | slag | high-ground, attrition, air-superiority, key-terrain | Shulimson et al. 1997; Prados & Stubbe 1991 |
| `case.dak-to` | Dak To | nov 1967 | slag | high-ground, attrition, cover | MacGarrigle 1998 |
| `case.hamburger-hill` | Hamburger Hill (Ap Bia Mountain) | mei 1969 | gevecht | attrition, high-ground, kill-zone | Zaffiri 1988 |
| `case.abu-ageila-1967` | Abu Ageila-Um Katef | juni 1967 | slag | combined-arms, flank, tempo, surprise | Herzog 1982; Pollack 2002 |
| `case.ismailia-1973` | Ismailia | okt 1973 | slag | urban-close, cover, ambush, class-counter | Herzog 1975; Rabinovich 2004 |
| `case.sultan-yacoub` | Sultan Yacoub | juni 1982 | gevecht | ambush, kill-zone, avenue-of-approach, scouting | Gabriel 1984; Herzog 1982 |
| `case.beirut-1982` | Beleg van Beiroet | juni-aug 1982 | veldtocht | urban-close, envelopment, attrition | Gabriel 1984 |
| `case.bint-jbeil-2006` | Libanon 2006: Bint Jbeil en de pantserbedreiging | juli-aug 2006 | veldtocht | class-counter, combined-arms, ambush, urban-close | Matthews 2008 |
| `case.fao-1986` | Al-Faw | feb 1986 | slag | surprise, obstacle, attrition | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.basra-1987` | Basra (Karbala-5) | jan-feb 1987 | slag | attrition, obstacle, kill-zone, fields-of-fire | Murray & Woods 2014; Cordesman & Wagner 1990 |
| `case.khafji` | Khafji | jan-feb 1991 | slag | air-superiority, combined-arms, scouting, urban-close | Westermeyer 2008 |
| `case.norfolk-1991` | Objective Norfolk | 26-27 feb 1991 | slag | exchange-ratio, initiative, fields-of-fire, combined-arms | Bourque 2002; Scales 1993 |
| `case.medina-ridge` | Medina Ridge | 27 feb 1991 | slag | exchange-ratio, fields-of-fire, reverse-slope, air-superiority | Bourque 2002; Scales 1993 |
| `case.wadi-al-batin` | Schijnaanvallen bij Wadi al-Batin | feb 1991 | veldtocht | flank, surprise, scouting | Bourque 2002; Scales 1993 |
| `case.nasiriyah` | Nasiriyah | mrt 2003 | slag | ambush, urban-close, avenue-of-approach, readability | Fontenot et al. 2004; Reynolds 2005 |
| `case.objective-peach` | Objective Peach | apr 2003 | gevecht | key-terrain, chokepoint, exchange-ratio | Fontenot et al. 2004 |
| `case.thunder-runs` | De Thunder Runs | apr 2003 | slag | tempo, urban-close, class-counter, surprise | Zucchino 2004; Fontenot et al. 2004 |
| `case.debecka-pass` | Debecka-pas | apr 2003 | gevecht | class-counter, fields-of-fire, key-terrain | Robinson 2004 |
| `case.ramadi-2006` | Ramadi | 2006-07 | veldtocht | key-terrain, urban-close, flow, attrition | Michaels 2010 |
| `case.sadr-city-2008` | Sadr City | mrt-mei 2008 | slag | obstacle, scouting, urban-close, air-superiority | Johnson et al. 2013 |
| `case.anaconda` | Operatie Anaconda | mrt 2002 | slag | high-ground, scouting, surprise, air-superiority | Kugler 2007; Naylor 2005 |
| `case.wanat` | Wanat | juli 2008 | gevecht | high-ground, static-exposure, fields-of-fire, surprise | Combat Studies Institute 2010 |
| `case.kamdesh` | Kamdesh (COP Keating) | okt 2009 | gevecht | high-ground, fields-of-fire, static-exposure | Tapper 2012 |
| `case.musa-qala` | Musa Qala en de peloton-forten | 2006-07 | veldtocht | static-exposure, attrition, key-terrain | Farrell 2017 |
| `case.algiers-1957` | Slag om Algiers | 1956-57 | veldtocht | scouting, urban-close, flow | Horne 1977 |
| `case.rhodesia-fireforce` | Rhodesische Fireforce | 1974-79 | veldtocht | mobility, tempo, exchange-ratio, envelopment | Cilliers 1985 |
| `case.sarajevo` | Beleg van Sarajevo | 1992-96 | veldtocht | high-ground, sightlines, fields-of-fire, kill-zone | Burg & Shoup 1999; Andreas 2008 |
| `case.grozny-2000` | Grozny 1999-2000 | dec 1999-feb 2000 | slag | urban-close, combined-arms, attrition, envelopment | Oliker 2001 |
| `case.georgia-2008` | Russisch-Georgische oorlog | aug 2008 | veldtocht | chokepoint, tempo, local-superiority | Cohen & Hamilton 2011 |
| `case.zelenopillia` | Zelenopillia | juli 2014 | gevecht | surprise, static-exposure, area-fire, scouting | Fox & Rossow 2017 |
| `case.ilovaisk` | Ilovajsk | aug 2014 | slag | envelopment, kill-zone, surprise | Fox & Rossow 2017 |
| `case.debaltseve` | Debaltseve | jan-feb 2015 | slag | envelopment, area-fire, attrition, chokepoint | Fox & Rossow 2017 |
| `case.donetsk-airport` | Luchthaven van Donetsk | sept 2014-jan 2015 | slag | urban-close, attrition, key-terrain, vertical | Fox 2019 |
| `case.hostomel` | Luchthaven Hostomel | feb 2022 | gevecht | key-terrain, surprise, defeat-in-detail, tempo | Zabrodskyi et al. 2022; Watling & Reynolds 2022 |
| `case.brovary` | De Kiev-as en de hinderlaag bij Brovary | mrt 2022 | gevecht | ambush, avenue-of-approach, area-fire, chokepoint | Zabrodskyi et al. 2022 |
| `case.mariupol` | Mariupol en Azovstal | feb-mei 2022 | slag | urban-close, attrition, envelopment, vertical | Watling & Reynolds 2022 |
| `case.kharkiv-2022` | Tegenoffensief bij Charkiv | sept 2022 | veldtocht | surprise, tempo, concentration, local-superiority | Watling & Reynolds 2023 |
| `case.bilohorivka` | Oversteek van de Sivers'kyj Donets bij Bilohorivka | mei 2022 | gevecht | chokepoint, kill-zone, static-exposure, scouting | Zabrodskyi et al. 2022 |
| `case.bakhmut` | Bachmoet | aug 2022-mei 2023 | slag | attrition, urban-close, area-fire | Watling & Reynolds 2023 |
| `case.zaporizhzhia-2023` | Offensief bij Zaporizja | juni-nov 2023 | veldtocht | obstacle, kill-zone, attrition, scouting | Watling & Reynolds 2023 |
| `case.karabakh-2020` | Oorlog om Nagorno-Karabach | sept-nov 2020 | veldtocht | sead, static-exposure, scouting, class-counter | Shaikh & Rumbaugh 2020 |
| `case.blitz-1940` | De Blitz | sept 1940-mei 1941 | veldtocht | attrition, scouting, air-superiority, surprise | Overy 2013; Murray 1983 |
| `case.barbarossa-air-1941` | Barbarossa: de eerste dag in de lucht | 22 juni 1941 | slag | surprise, static-exposure, air-superiority, initiative | Hardesty 1982; Murray 1983 |
| `case.crete-1941` | Kreta | mei 1941 | slag | key-terrain, air-superiority, attrition, combined-arms | Beevor 1991 |
| `case.malta-siege` | Het beleg van Malta | 1940-1942 | veldtocht | key-terrain, attrition, air-superiority, interior-lines | Holland 2003; Roskill 1956 |
| `case.stalingrad-airlift` | De luchtbrug naar Stalingrad | nov 1942-feb 1943 | veldtocht | attrition, economy, air-superiority | Hayward 1998; Murray 1983 |
| `case.kuban-1943` | Luchtgevechten boven de Koeban | apr-juni 1943 | veldtocht | energy-advantage, mutual-support, air-superiority, skill-dispersion | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.kursk-air-1943` | Koersk in de lucht | juli 1943 | slag | surprise, air-superiority, combined-arms, class-counter | Hardesty & Grinberg 2012 |
| `case.bagration-air-1944` | Operatie Bagration in de lucht | juni-aug 1944 | veldtocht | air-superiority, concentration, combined-arms, tempo | Hardesty 1982; Hardesty & Grinberg 2012 |
| `case.ploesti-1943` | Ploiești (Operatie Tidal Wave) | 1 aug 1943 | gevecht | kill-zone, sead, surprise, open-ground | Dugan & Stewart 1962; Craven & Cate 1949 |
| `case.chastise-1943` | De Dammenaanval (Operatie Chastise) | 16-17 mei 1943 | gevecht | surprise, key-terrain, class-counter, attrition | Sweetman 1982 |
| `case.hamburg-1943` | Hamburg (Operatie Gomorra) | juli-aug 1943 | slag | sead, surprise, area-fire, scouting | Middlebrook 1980; Overy 2013 |
| `case.schweinfurt-regensburg-1943` | Schweinfurt-Regensburg | 17 aug 1943 | slag | attrition, mutual-support, exchange-ratio, air-superiority | Middlebrook 1983; Craven & Cate 1949 |
| `case.black-thursday-1943` | Tweede Schweinfurt ("Zwarte Donderdag") | 14 okt 1943 | gevecht | attrition, exchange-ratio, mutual-support | Craven & Cate 1949; Caldwell & Muller 2007 |
| `case.big-week-1944` | Big Week (Operatie Argument) | feb 1944 | veldtocht | air-superiority, attrition, mutual-support, combined-arms | Craven & Cate 1951; Murray 1983; Caldwell & Muller 2007 |
| `case.nuremberg-raid-1944` | De aanval op Neurenberg | 30-31 mrt 1944 | gevecht | ambush, avenue-of-approach, scouting, static-exposure | Middlebrook 1973; Overy 2013 |
| `case.bodenplatte-1945` | Operatie Bodenplatte | 1 jan 1945 | slag | surprise, static-exposure, attrition, readability | Caldwell & Muller 2007; Murray 1983 |
| `case.bismarck-sea-1943` | Slag in de Zee van Bismarck | mrt 1943 | slag | class-counter, air-superiority, surprise, kill-zone | Morison 1950 |
| `case.rabaul-1943` | Het onschadelijk maken van Rabaul | 1943-1944 | veldtocht | flank, air-superiority, key-terrain, attrition | Morison 1950 |
| `case.philippine-sea-1944` | Filipijnse Zee ("Marianas Turkey Shoot") | juni 1944 | slag | exchange-ratio, skill-dispersion, scouting, air-superiority | Y'Blood 1981; Morison 1953 |
| `case.black-tuesday-1951` | Zwarte dinsdag boven Namsi | 23 okt 1951 | gevecht | class-counter, attrition, mutual-support | Futrell 1983; Werrell 2005 |
| `case.rolling-thunder` | Operatie Rolling Thunder | 1965-1968 | veldtocht | sead, attrition, safe-ground, tempo | Clodfelter 1989; Thompson 2000 |
| `case.thanh-hoa-bridge` | De brug van Thanh Hoa | 1965-1972 | gevecht | key-terrain, kill-zone, class-counter, attrition | Thompson 2000 |
| `case.wild-weasel` | De Wild Weasels | 1965-1973 | veldtocht | sead, combined-arms, initiative | Thompson 2000; Werrell 2005 |
| `case.ault-report-1968` | Het rapport-Ault en Top Gun | 1968-1972 | veldtocht | skill-dispersion, exchange-ratio, bvr | Ault 1969; Michel 1997 |
| `case.linebacker-i-1972` | Operatie Linebacker | mei-okt 1972 | veldtocht | class-counter, concentration, key-terrain | Clodfelter 1989; Thompson 2000 |
| `case.linebacker-ii-1972` | Linebacker II ("de Elfdaagse Oorlog") | dec 1972 | veldtocht | sead, avenue-of-approach, attrition, readability | Michel 2002; Clodfelter 1989 |
| `case.operation-focus` | Operatie Focus (Moked) | 5 juni 1967 | slag | surprise, air-superiority, static-exposure, initiative | Oren 2002; Nordeen 1990 |
| `case.war-of-attrition-sam` | Uitputtingsoorlog: de raketgordel | 1969-1970 | veldtocht | sead, attrition, key-terrain, ambush | Bar-Siman-Tov 1980; Nordeen 1990 |
| `case.sam-umbrella-1973` | De luchtverdedigingsparaplu over het kanaal | okt 1973 | slag | sead, combined-arms, safe-ground, kill-zone | Herzog 1975; Rabinovich 2004; Werrell 2005 |
| `case.osirak-1981` | Osirak (Operatie Opera) | 7 juni 1981 | gevecht | surprise, avenue-of-approach, key-terrain | Nordeen 1990 |
| `case.el-dorado-canyon-1986` | Operatie El Dorado Canyon | 15 apr 1986 | gevecht | tempo, sead, surprise, concentration | Venkus 1992 |
| `case.iran-iraq-air` | De luchtoorlog Iran-Irak | 1980-1988 | veldtocht | attrition, static-exposure, balance | Murray & Woods 2014 |
| `case.black-buck-1982` | Black Buck-aanvallen | mei-juni 1982 | gevecht | economy, key-terrain, avenue-of-approach | Ethell & Price 1983 |
| `case.instant-thunder` | Instant Thunder: de planning van de luchtcampagne in de Golf | aug 1990-jan 1991 | veldtocht | tempo, concentration, sead, key-terrain | Putney 2004; Keaney & Cohen 1993 |
| `case.task-force-normandy-1991` | Task Force Normandy: de eerste Apache-aanval | 17 jan 1991 | gevecht | sead, surprise, initiative, combined-arms | Keaney & Cohen 1993; Atkinson 1993 |
| `case.scud-hunt-1991` | De grote Scud-jacht | jan-feb 1991 | veldtocht | scouting, mobility, static-exposure | Keaney & Cohen 1993; Rosenau 2001 |
| `case.highway-of-death-1991` | Mutla Ridge ("Snelweg des Doods") | 26-27 feb 1991 | gevecht | chokepoint, kill-zone, pursuit, withdrawal, open-ground, air-superiority | Atkinson 1993; Keaney & Cohen 1993 |
| `case.anaconda-2002` | Operatie Anaconda: Apaches in de Shahi-Kot | mrt 2002 | slag | high-ground, kill-zone, scouting, readability | Naylor 2005 |
| `case.karbala-apache-2003` | De Apache-aanval bij Karbala | 24 mrt 2003 | gevecht | ambush, kill-zone, urban-close, readability | Fontenot et al. 2004 |
| `case.libya-2011` | De Libische luchtcampagne | mrt-okt 2011 | veldtocht | air-superiority, sead, scouting | Mueller 2015 |
| `case.nagorno-karabakh-2020` | Nagorno-Karabach: drones en luchtverdediging | sept-nov 2020 | veldtocht | sead, class-counter, static-exposure, scouting | Shaikh & Rumbaugh 2020 |
| `case.ukraine-air-2022` | Oekraïne: de betwiste lucht | 2022 | veldtocht | sead, mobility, air-superiority, static-exposure | Bronk et al. 2022 |
| `case.hostomel-2022` | Luchthaven Hostomel | feb 2022 | gevecht | key-terrain, surprise, attrition | Watling & Reynolds 2022 |
| `case.lam-son-719` | Lam Son 719 | feb-mrt 1971 | veldtocht | kill-zone, attrition, avenue-of-approach, static-exposure | Nolan 1986; Hinh 1979 |
| `case.eagle-claw-1980` | Operatie Eagle Claw | apr 1980 | gevecht | readability, mutual-support, attrition | Special Operations Review Group (Holloway 1980 |
| `case.afghanistan-stinger` | Afghanistan: de Stinger | 1986-1989 | veldtocht | class-counter, sead, high-ground | Kuperman 1999; Grau 1996 |
| `case.lepanto-1571` | Lepanto | 1571 | slag | class-counter, fields-of-fire, concentration | Guilmartin 1974 |
| `case.spanish-armada-1588` | De Spaanse Armada | 1588 | veldtocht | mobility, fields-of-fire, surprise, attrition | Mattingly 1959; Martin & Parker 1988 |
| `case.quiberon-bay-1759` | Quiberonbaai | 1759 | slag | tempo, initiative, obstacle | Mahan 1890 |
| `case.chesapeake-1781` | De Chesapeake (Virginia Capes) | 1781 | slag | key-terrain, scouting, interior-lines | Mahan 1890 |
| `case.nile-1798` | De Nijl (Aboukirbaai) | 1798 | slag | concentration, local-superiority, surprise, envelopment | Mahan 1897; Lavery 1998 |
| `case.copenhagen-1801` | Kopenhagen | 1801 | slag | attrition, obstacle, fields-of-fire | Mahan 1897 |
| `case.hampton-roads-1862` | Hampton Roads | mrt 1862 | gevecht | class-counter, balance | US Navy Department 1898 |
| `case.lissa-1866` | Lissa | 1866 | slag | skill-dispersion, concentration, mutual-support | Wilson 1896 |
| `case.yalu-1894` | De Yalu | 1894 | slag | mobility, fields-of-fire, class-counter | Paine 2003; Evans & Peattie 1997 |
| `case.manila-bay-1898` | Manila Bay | 1898 | slag | exchange-ratio, static-exposure, balance | Trask 1981 |
| `case.heligoland-bight-1914` | Helgolandbocht | aug 1914 | slag | concentration, surprise, readability | Corbett 1920 |
| `case.coronel-falklands-1914` | Coronel en de Falklands | nov-dec 1914 | veldtocht | class-counter, local-superiority, mobility | Corbett 1920 |
| `case.dogger-bank-1915` | Doggersbank | jan 1915 | slag | readability, exchange-ratio, initiative | Corbett 1921 |
| `case.river-plate-1939` | De Río de la Plata | dec 1939 | slag | envelopment, mutual-support, local-superiority | Pope 1956; Roskill 1954 |
| `case.taranto-1940` | Taranto | nov 1940 | gevecht | surprise, static-exposure, class-counter | Roskill 1954; Greene & Massignani 1998 |
| `case.matapan-1941` | Kaap Matapan | mrt 1941 | slag | scouting, surprise, exchange-ratio | Greene & Massignani 1998; Roskill 1954 |
| `case.bismarck-1941` | Straat van Denemarken en de zinking van de Bismarck | mei 1941 | veldtocht | scouting, concentration, class-counter | Kennedy 1974; Roskill 1954 |
| `case.pearl-harbor-1941` | Pearl Harbor | 7 dec 1941 | gevecht | surprise, static-exposure, initiative | Prange 1981; Morison 1948 |
| `case.prince-of-wales-repulse-1941` | Prince of Wales en Repulse | 10 dec 1941 | gevecht | class-counter, air-superiority, open-ground | Middlebrook & Mahoney 1977; Roskill 1954 |
| `case.java-sea-1942` | De Javazee | feb 1942 | slag | mutual-support, fields-of-fire, readability | Morison 1948 |
| `case.coral-sea-1942` | De Koraalzee | mei 1942 | slag | scouting, fleet-salvo, initiative | Lundstrom 1984; Morison 1949 |
| `case.savo-island-1942` | Savo Island | aug 1942 | slag | surprise, ambush, scouting, readability | Frank 1990; Morison 1949 |
| `case.eastern-solomons-1942` | De Oostelijke Salomonseilanden | aug 1942 | slag | scouting, fleet-salvo, air-superiority | Lundstrom 1994; Frank 1990 |
| `case.cape-esperance-1942` | Cape Esperance | okt 1942 | slag | fields-of-fire, surprise, readability | Frank 1990; Hornfischer 2011 |
| `case.santa-cruz-1942` | Santa Cruz-eilanden | okt 1942 | slag | attrition, exchange-ratio, skill-dispersion | Lundstrom 1994; Frank 1990 |
| `case.guadalcanal-naval-1942` | Zeeslag bij Guadalcanal | 12-15 nov 1942 | slag | attrition, fields-of-fire, readability, key-terrain | Hornfischer 2011; Frank 1990 |
| `case.tassafaronga-1942` | Tassafaronga | nov 1942 | gevecht | class-counter, fields-of-fire, initiative | Frank 1990; Hornfischer 2011 |
| `case.channel-dash-1942` | De Kanaaldoorbraak | feb 1942 | gevecht | surprise, tempo, defeat-in-detail | Roskill 1956 |
| `case.pedestal-1942` | Operatie Pedestal | aug 1942 | slag | attrition, mutual-support, kill-zone | Roskill 1956; Holland 2003 |
| `case.black-may-1943` | Zwarte mei | mei 1943 | veldtocht | scouting, combined-arms, exchange-ratio, mutual-support | Blair 1998; Roskill 1956 |
| `case.north-cape-1943` | Noordkaap | dec 1943 | slag | scouting, envelopment, concentration | Roskill 1960 |
| `case.pacific-submarines` | De Amerikaanse onderzeeërcampagne tegen Japan | 1941-1945 | veldtocht | economy, attrition, class-counter | Blair 1975 |
| `case.samar-1944` | Voor Samar | 25 okt 1944 | slag | mutual-support, surprise, readability, local-superiority | Hornfischer 2004; Cutler 1994 |
| `case.surigao-1944` | Straat van Surigao | 25 okt 1944 | slag | crossing-the-t, chokepoint, kill-zone, concentration, line-of-battle, fields-of-fire | Tully 2009; Morison 1958 |
| `case.okinawa-kamikaze-1945` | Okinawa: de kamikazecampagne | apr-juni 1945 | veldtocht | attrition, static-exposure, scouting, kill-zone | Morison 1960 |
| `case.eilat-1967` | De zinking van de Eilat | okt 1967 | gevecht | fleet-salvo, class-counter, safe-ground | Hughes 2000; Rabinovich 1988 |
| `case.latakia-1973` | Latakia | okt 1973 | slag | fleet-salvo, class-counter, initiative | Rabinovich 1988; Hughes 2000 |
| `case.belgrano-1982` | De zinking van de General Belgrano | 2 mei 1982 | gevecht | class-counter, scouting, safe-ground | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.sheffield-1982` | Het verlies van HMS Sheffield | 4 mei 1982 | gevecht | fleet-salvo, scouting, static-exposure | Woodward & Robinson 1992; Hastings & Jenkins 1983 |
| `case.uss-stark-1987` | USS Stark | 17 mei 1987 | gevecht | surprise, readability, fleet-salvo | Wise 2007 |
| `case.praying-mantis-1988` | Operatie Praying Mantis | 18 apr 1988 | slag | exchange-ratio, combined-arms, fleet-salvo | Wise 2007 |
| `case.evo-moment-37` | Evo Moment 37 | aug 2004 | gevecht | tempo, initiative, readability | ESPN 2016 |
| `case.bisu-revolution` | De Bisu-revolutie | mrt 2007 | slag | balance, class-counter, mobility | Taylor 2012 |
| `case.dream-coil-ti3` | De Dream Coil op The International 2013 | aug 2013 | gevecht | interior-lines, defeat-in-detail, tempo, initiative | PC Gamer 2013 |
| `case.faker-zed-2013` | Faker's Zed tegen Ryu | sept 2013 | gevecht | skill-dispersion, initiative, readability | Riot Games 2013 |
| `case.olofboost` | De overpass-boost | nov 2014 | gevecht | sightlines, readability, balance, fields-of-fire | GameSpot 2014 |
| `case.coldzera-jump` | De springende AWP op Mirage | apr 2016 | gevecht | surprise, skill-dispersion, chokepoint, local-superiority | PC Gamer 2016 |
| `case.astralis-2018` | Astralis en het hulpmiddelen-tijdperk | 2018 | veldtocht | combined-arms, mutual-support, kill-zone | Upcomer 2018 |
| `case.openai-five-og` | OpenAI Five tegen OG | apr 2019 | slag | ai-vs-player, tempo, concentration | Berner et al. 2019 |
| `case.alphastar-2019` | AlphaStar bereikt grootmeester | 2019 | veldtocht | ai-vs-player, skill-dispersion | Vinyals et al. 2019 |
| `case.desert-storm-left-hook` | De linkerhaak (grondoffensief van Operatie Desert Storm) | 24-28 februari 1991 | veldtocht | flank, envelopment, tempo, penetration | Scales 1993; Bourque 2002; Keaney & Cohen 1993 |
| `case.corrupted-blood` | Het incident Corrupted Blood | september 2005 | veldtocht | contagion, panic, herding, territoriality | Balicer 2007; Lofgren & Fefferman 2007 |

### Game- en leveldesign (17) {#game-and-level-design-17}

| id | titel | patronen | bronnen |
|---|---|---|---|
| `design.chokepoint` | Knelpunten in leveldesign | chokepoint, flow, kill-zone, balance | Totten 2019; Hullett & Whitehead 2010; Güttler & Johansson 2003 |
| `design.flank-routes` | Flankeerroutes en alternatieve paden | flank, flow, avenue-of-approach | Hullett & Whitehead 2010; Totten 2019; Björk & Holopainen 2005 |
| `design.sightlines` | Zichtlijnen en gevechtsafstand | sightlines, fields-of-fire, class-counter, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.cover-placement` | Plaatsing en ritme van dekking | cover, open-ground, flow | Totten 2019; Kremers 2009; Hullett & Whitehead 2010 |
| `design.spawn` | Ontwerp van spawns en spawnbescherming | spawn-pressure, balance, readability | Totten 2019; Güttler & Johansson 2003; Kremers 2009 |
| `design.symmetry-balance` | Symmetrische en asymmetrische kaartbalans | balance, exchange-ratio, key-terrain | Elias et al. 2012; Adams & Dormans 2012; Schell 2008 |
| `design.class-counters` | Klassebalans en tegenmaatregelen | class-counter, balance, combined-arms | Sirlin 2006; Elias et al. 2012; Adams & Dormans 2012 |
| `design.flow` | Stroom, lussen en leesbare indelingen | flow, avenue-of-approach, readability | Lynch 1960; Totten 2019; Alexander et al. 1977; Csikszentmihalyi 1990 |
| `design.economy` | Spele economieën en terugkoppelingslussen | economy, balance, skill-dispersion | Adams & Dormans 2012; Salen & Zimmerman 2003; Koster 2004 |
| `design.matchmaking` | Matchmaking en spreiding van vaardigheid | skill-dispersion, balance | Herbrich et al. 2007; Glickman 1999; Elo 1978 |
| `design.ai-behaviour` | AI-tegenstanders als levelonderzoek | ai-vs-player, readability | Seif El-Nasr et al. 2013; Drachen et al. 2009 |
| `design.meaningful-play` | Betekenisvol spel en keuze | balance, flow, flank | Salen & Zimmerman 2003; Schell 2008; Juul 2005 |
| `design.trading` | Ruilen en teamspel in shooters | mutual-support, initiative | Xenopoulos et al. 2020; Schubert et al. 2016 |
| `design.map-control` | Controle over de kaart | key-terrain, local-superiority, flow | Xenopoulos et al. 2022; Rioult et al. 2014; Fernández & Bornn 2018 |
| `design.heatmaps` | Warmtekaarten en ruimtelijke telemetrie in het ontwerp | flow, kill-zone, key-terrain | Drachen & Canossa 2009; Wallner & Kriglstein 2013; Hoobler et al. 2004; Kim et al. 2008; Bowman et al. 2012 |
| `design.fun-mastery` | Beheersing, leren en plezier | readability, skill-dispersion | Koster 2004; Csikszentmihalyi 1990; Schell 2008 |
| `design.buy-economy` | Economie per ronde en aankoopbeslissingen | conformity, economy, coordination, mixed-strategy | Xenopoulos et al. 2020; Fleiss 1971 |

### Studies (113) {#studies-113}

| id | titel | bronnen |
|---|---|---|
| `study.engel-1954` | Engel: Lanchesters kwadratenwet bij Iwo Jima | Engel 1954 |
| `study.bracken-1995` | Bracken: Lanchester-modellen van de Ardennen | Bracken 1995 |
| `study.fricker-1998` | Fricker: uitputtingsmodellen van de Ardennen opnieuw bekeken | Fricker 1998 |
| `study.lucas-turkes-2004` | Lucas en Turkes: Koersk en de Ardennen | Lucas & Turkes 2004 |
| `study.hartley-helmbold-1995` | Hartley en Helmbold: de kwadratenwet toetsen | Hartley & Helmbold 1995 |
| `study.drachen-canossa-2009` | GIS-analyse van sterfgevallen van spelers | Drachen & Canossa 2009; Seif El-Nasr et al. 2013 |
| `study.hoobler-2004` | Lighthouse: competitief gedrag zichtbaar maken | Hoobler et al. 2004 |
| `study.xenopoulos-2020` | Acties waarderen in Counter-Strike | Xenopoulos et al. 2020 |
| `study.schubert-2016` | Ontmoetingen opsporen in esports | Schubert et al. 2016 |
| `study.red-baron` | Project Red Baron: luchtgevechten boven Vietnam | Weapons Systems Evaluation Group 1967; Michel 1997 |
| `study.dupuy-qjm` | Dupuy: gekwantificeerd oordeel over historische slagen | Dupuy 1979; Dupuy 1987 |
| `study.biddle-2004` | Biddle: de inzet van kracht verklaart de uitkomsten | Biddle 2004 |
| `study.wallner-kriglstein-2013` | Overzicht van de visualisatie van speldata | Wallner & Kriglstein 2013; Bowman et al. 2012 |
| `study.willard-1962` | Willard: Lanchester tegen drie eeuwen landslagen | Willard 1962; Fain 1977 |
| `study.fain-1977` | Fain: zestig gevechten uit de Tweede Wereldoorlog | Fain 1977; Willard 1962 |
| `study.weiss-1966` | Weiss: gevechtsmodellen en de Amerikaanse Burgeroorlog | Weiss 1966 |
| `study.hartley-1995-attrition` | Hartley: een statistisch model van uitputtingsgegevens | Hartley 1995 |
| `study.helmbold-1995` | Helmbold: opmarschsnelheden in landgevechten | Helmbold 1995 |
| `study.lucas-dinges-2004` | Lucas en Dinges: omstandigheden tellen zwaarder dan de wet | Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.kursk-data-base` | De Kursk-databank | Lawrence 2015; Lucas & Dinges 2004; Lucas & Turkes 2004 |
| `study.ardennes-data-base` | De databank van de Ardennencampagne | Bracken 1995; Fricker 1998; Lucas & Turkes 2004 |
| `study.johnson-mackay-2011` | Johnson en MacKay: de Slag om Engeland als Lanchester-gegevens | Johnson & MacKay 2011 |
| `study.rotte-schmidt-2003` | Rotte en Schmidt: getallen winnen nog steeds slagen | Rotte & Schmidt 2003 |
| `study.dupuy-attrition` | Dupuy: regelmatigheden in slachtofferaantallen | Dupuy 1990; Dupuy 1987 |
| `study.dupuy-tndm` | Dupuy's Tactical Numerical Deterministic Model | Dupuy 1990; Lawrence 2017; Dupuy 1987 |
| `study.lawrence-2017` | Lawrence: oorlog in getallen | Lawrence 2017 |
| `study.vancreveld-1982` | Van Creveld: gevechtskracht | van Creveld 1982; Dupuy 1987 |
| `study.reiter-stam-2002` | Reiter en Stam: democratieën in oorlog | Reiter & Stam 2002; Desch 2002 |
| `study.epstein-1985` | Epstein: het adaptieve dynamische model | Epstein 1985; Epstein 1989 |
| `study.deitchman-1962` | Deitchman: Lanchester en guerrillaoorlog | Deitchman 1962; Taylor 1983 |
| `study.armstrong-2005` | Armstrong: het stochastische salvomodel | Armstrong 2005; Hughes 1995 |
| `study.hughes-fleet-tactics` | Hughes: de hoekstenen van de vloottactiek | Hughes & Girrier 2018; Hughes 2000 |
| `study.mearsheimer-epstein` | Het debat over de 3:1-regel | Mearsheimer 1989; Epstein 1989 |
| `study.kress-2012` | Kress: het modelleren van gewapende conflicten | Kress 2012; Washburn & Kress 2009 |
| `study.ault-1969` | Het rapport-Ault: raketten afgevuurd buiten hun bereik | Ault 1969; Michel 1997 |
| `study.gwaps` | Gulf War Air Power Survey | Keaney & Cohen 1993; Hallion 1992 |
| `study.blackett-circus` | Blacketts circus | Blackett 1962; Kirby 2003; Budiansky 2013; McCloskey 1987 |
| `study.depth-charge-settings` | Dieptebominstellingen bij Coastal Command | Waddington 1973; Budiansky 2013; Morse & Kimball 1951 |
| `study.aircraft-camouflage` | Witte onderkanten voor antionderzeebootvliegtuigen | Waddington 1973; Budiansky 2013 |
| `study.wald-survivorship` | Wald: pantser waar de teruggekeerde bommenwerpers niet geraakt waren | Mangel & Samaniego 1984 |
| `study.optimal-search` | Optimaal zoeken: van onderzeeboten tot AF447 | Stone 1975; Stone et al. 2014; Koopman 1946; Washburn 2002 |
| `study.glenn-1996` | Glenn: gevecht in de hel | Glenn 1996; FM 3-06 2006 |
| `study.a2ad-2003` | Toegangsbeletsel en gebiedsontzegging | Krepinevich et al. 2003 |
| `study.bauckhage-2012` | Hoe spelers hun interesse verliezen | Bauckhage et al. 2012; Kaplan & Meier 1958 |
| `study.drachen-sifa-2012` | Clusteren van spelersgedrag in de praktijk | Drachen et al. 2012; Drachen et al. 2009 |
| `study.canossa-2011` | Frustratie van spelers opsporen | Canossa et al. 2011 |
| `study.medler-2011` | Data Cracker: telemetriedashboards in productie | Medler et al. 2011 |
| `study.wallner-kriglstein-2014` | PLATO: visuele analyse van gameplay | Wallner & Kriglstein 2014; Wallner & Kriglstein 2013 |
| `study.miller-crowcroft-2009` | Bewegingen van avatars op de slagvelden van World of Warcraft | Miller & Crowcroft 2009 |
| `study.kim-2008` | TRUE: gebruikerstests op grote schaal meten | Kim et al. 2008 |
| `study.game-data-science` | Datawetenschap voor games | Seif El-Nasr et al. 2021; Seif El-Nasr et al. 2013 |
| `study.ai-and-games` | Kunstmatige intelligentie en games | Yannakakis & Togelius 2018 |
| `study.drachen-2014` | Vaardigheid en teambewegingen in Dota 2 | Drachen et al. 2014 |
| `study.yang-2014` | Gevechtspatronen die MOBA-overwinningen voorspellen | Yang et al. 2014; Schubert et al. 2016 |
| `study.eggert-2015` | Spelersrollen in Dota 2 | Eggert et al. 2015 |
| `study.semenov-2017` | Dota 2-uitslagen voorspellen uit de draft | Semenov et al. 2017; Makarov et al. 2018 |
| `study.hodge-2021` | Live voorspelling van winst in professionele esports | Hodge et al. 2021 |
| `study.rioult-2014` | Topologie van spelerposities | Rioult et al. 2014 |
| `study.bednarek-2017` | Spelers beoordelen in teamshooters | Bednárek et al. 2017 |
| `study.katona-2019` | Voorspellen wie hierna sterft | Katona et al. 2019 |
| `study.block-2018` | Datagedreven verhalen voor esports-publiek | Block et al. 2018 |
| `study.ggviz` | ggViz: spelsituaties op grote schaal doorzoeken | Xenopoulos et al. 2022 |
| `study.openai-five` | OpenAI Five: grootschalig reinforcement learning in Dota 2 | Berner et al. 2019 |
| `study.alphastar` | AlphaStar: grootmeesterniveau in StarCraft II | Vinyals et al. 2019 |
| `study.cervone-2016` | Verwachte ballenbezitwaarde in basketbal | Cervone et al. 2016 |
| `study.decroos-2019` | VAEP: acties met de bal waarderen in voetbal | Decroos et al. 2019 |
| `study.pitch-control` | Veldcontrole en het creëren van ruimte | Spearman 2018; Fernández & Bornn 2018; Taki et al. 1996 |
| `study.franks-2015` | De ruimtelijke structuur van defensief kunnen | Franks et al. 2015; Miller et al. 2014 |
| `study.lucey-2013` | Teamrollen uit trackinggegevens | Lucey et al. 2013 |
| `study.shot-quality` | Verwachte doelpunten en schotkwaliteit | Decroos et al. 2019; Pollard & Reep 1997; Reep & Benjamin 1968 |
| `study.goldsberry-2012` | CourtVision: ruimtelijke schotefficiëntie | Goldsberry 2012; Miller et al. 2014 |
| `study.team-sports-survey` | Ruimtelijk-temporele analyse van teamsporten | Gudmundsson & Horton 2017 |
| `study.ripley-k` | Ripley's K: clustering op elke schaal | Ripley 1977; Baddeley et al. 2015; Diggle 2013 |
| `study.clark-evans-1954` | Clark en Evans: spreiding van de dichtstbijzijnde buur | Clark & Evans 1954 |
| `study.getis-ord` | Getis-Ord-hotspots | Getis & Ord 1992; Ord & Getis 1995; Benjamini & Hochberg 1995 |
| `study.lisa` | Lokale indicatoren van ruimtelijke associatie | Anselin 1995; Moran 1950 |
| `study.scan-statistic` | De ruimtelijke scanstatistiek | Kulldorff 1997 |
| `study.kde` | Kerneldichtheidsschatting | Silverman 1986 |
| `study.knox-1964` | Interactie in ruimte en tijd | Knox 1964; Diggle 2013 |
| `study.maup` | Het probleem van de aanpasbare ruimtelijke eenheden | Openshaw 1984; Tobler 1970 |
| `study.isovists` | Isovisten en zichtgrafen | Benedikt 1979; Turner et al. 2001; Hillier & Hanson 1984 |
| `study.space-syntax` | Space syntax | Hillier & Hanson 1984; Turner et al. 2001 |
| `study.mean-crowding` | Gemiddelde drukte | Lloyd 1967 |
| `study.survival-analysis` | Overlevingsanalyse voor de tijd tot de dood | Kaplan & Meier 1958; Cox 1972 |
| `study.glm` | Gegeneraliseerde lineaire modellen voor tellingen | Nelder & Wedderburn 1972; McCullagh & Nelder 1989; Akaike 1974 |
| `study.bootstrap` | Bootstrap en betrouwbaarheidsintervallen | Efron 1979; Wilson 1927 |
| `study.tokey-2024` | Tokey et al.: latentie en het voordeel van wie kijkt | Tokey et al. 2024 |
| `study.lee-chang-2017` | Lee en Chang: schot om een hoek | Lee & Chang 2017; Bernier 2001 |
| `study.claypool-latency` | Claypool: latentie en acties van spelers | Claypool & Claypool 2006; Liu et al. 2022 |
| `study.xenopoulos-2022-wp` | Xenopoulos et al.: professionals en amateurs via winkans | Xenopoulos et al. 2022; Xenopoulos & Silva 2022 |
| `study.xenopoulos-2021-econ` | Xenopoulos et al.: economische beslissingen in Counter-Strike | Xenopoulos et al. 2021 |
| `study.maymin-2021` | Maymin: slimme kills en waardeloze sterfgevallen | Maymin 2021 |
| `study.moba-live-prediction` | Live voorspelling van de uitslag in MOBA's | Yang et al. 2017; Silva et al. 2018 |
| `study.hayakawa-2025` | Hayakawa et al.: Valorant-rondes uit tactische kenmerken | Hayakawa et al. 2025 |
| `study.paskiv-2026` | Paskiv et al.: rollen in professionele Counter-Strike 2 | Paskiv et al. 2026 |
| `study.ibrahim-2024` | Ibrahim et al.: training van close-quarters battle | Ibrahim et al. 2024 |
| `study.crowd-turbulence` | Menigteturbulentie bij de hadj van 2006 | Helbing et al. 2007; Moussaïd et al. 2011 |
| `study.walking-groups` | Wandelende groepen vormen menigten | Moussaïd et al. 2010 |
| `study.pigeon-hierarchy` | Hiërarchische groepsdynamiek in duivenzwermen | Nagy et al. 2010; Vicsek & Zafeiris 2012 |
| `study.music-lab` | Sociale invloed maakt succes ongelijk en onvoorspelbaar | Salganik et al. 2006 |
| `study.wisdom-undermined` | Sociale invloed ondermijnt de wijsheid van de menigte | Lorenz et al. 2011 |
| `study.drawing-power-of-crowds` | De aantrekkingskracht van een menigte | Milgram et al. 1969; Gallup et al. 2012 |
| `study.asch-conformity` | Conformiteit aan een eenstemmige meerderheid | Asch 1956; Bond & Smith 1996 |
| `study.why-they-fight` | Why They Fight: gevechtsmotivatie in Irak | Wong et al. 2003; Shils & Janowitz 1948 |
| `study.cohesion-performance` | Samenhang en prestatie: meta-analyses | Mullen & Copper 1994; Beal et al. 2003 |
| `study.loss-averse-golfers` | Verliesaversie bij professionele golfers | Pope & Schweitzer 2011 |
| `study.hot-hand-baseball` | Hete handen in honkbal | Green & Zwiebel 2018 |
| `study.penalty-kicks` | Strafschoppen: professionals spelen minimax | Chiappori et al. 2002; Palacios-Huerta 2003; Bar-Eli et al. 2007 |
| `study.minimax-wimbledon` | Minimax-spel op Wimbledon | Walker & Wooders 2001 |
| `study.collective-intelligence` | Collectieve intelligentie van teams | Woolley et al. 2010; Kim et al. 2017 |
| `study.online-world-networks` | Sociale netwerken van een online wereld | Szell et al. 2010 |
| `study.team-networks` | Passnetwerken en teamprestatie | Duch et al. 2010; Grund 2012 |
| `study.complex-contagion` | Gedrag verspreidt zich via geclusterde netwerken | Centola 2010 |

### Bibliografie {#bibliography}

- Adams, E.; Dormans, J. (2012). Game Mechanics: Advanced Game Design. New Riders, Berkeley. *(gecontroleerd 2026-11-15: detail)*
- Akaike, H. (1974). A new look at the statistical model identification. IEEE Transactions on Automatic Control 19(6): 716-723. *(gecontroleerd 2026-11-15: detail)*
- Alexander, C.; Ishikawa, S.; Silverstein, M. (1977). A Pattern Language. Oxford University Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Alexander, J. H. (1993). Across the Reef: The Marine Assault of Tarawa. Marine Corps Historical Center, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Altman, I. (1975). The Environment and Social Behavior: Privacy, Personal Space, Territory, Crowding. Brooks/Cole, Monterey CA. *(gecontroleerd 2026-11-15: detail)*
- Ammianus Marcellinus (vert. Yonge, C. D.) (1862). The Roman History of Ammianus Marcellinus. Henry G. Bohn, London. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Anderson, L. R.; Holt, C. A. (1996). Classroom games: information cascades. Journal of Economic Perspectives 10(4): 187-193. doi:10.1257/jep.10.4.187 *(gecontroleerd 2026-11-15: detail)*
- Andreas, P. (2008). Blue Helmets and Black Markets: The Business of Survival in the Siege of Sarajevo. Cornell University Press, Ithaca. *(gecontroleerd 2026-11-15: detail)*
- Anselin, L. (1995). Local Indicators of Spatial Association—LISA. Geographical Analysis 27(2): 93-115. *(gecontroleerd 2026-11-15: detail)*
- Appleman, R. E. (1961). South to the Naktong, North to the Yalu (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Appleman, R. E. (1987). East of Chosin: Entrapment and Breakout in Korea, 1950. Texas A&M University Press, College Station. *(gecontroleerd 2026-11-15: detail)*
- Appleman, R. E.; Burns, J. M.; Gugeler, R. A.; Stevens, J. (1948). Okinawa: The Last Battle (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Ardant du Picq, C. (vert. Greely, J. N.; Cotton, R. C.) (1921). Battle Studies: Ancient and Modern Battle. Macmillan, New York. https://www.gutenberg.org/ebooks/7294 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Arkes, H. R.; Blumer, C. (1985). The psychology of sunk cost. Organizational Behavior and Human Decision Processes 35(1): 124-140. doi:10.1016/0749-5978(85)90049-4 *(gecontroleerd 2026-11-15: detail)*
- Armstrong, M. J. (2005). A stochastic salvo model for naval surface combat. Operations Research 53(5): 830-841. doi:10.1287/opre.1040.0195 *(gecontroleerd 2026-11-15: detail)*
- Arnold, T. D.; Fiore, N. (2019). Five operational lessons from the Battle for Mosul. Military Review (January-February 2019), Army University Press. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Arrian (vert. Chinnock, E. J.) (1893). The Anabasis of Alexander. Hodder & Stoughton, London. https://www.gutenberg.org/ebooks/46976 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Asch, S. E. (1956). Studies of independence and conformity: I. A minority of one against a unanimous majority. Psychological Monographs: General and Applied 70(9): 1-70. doi:10.1037/h0093718 *(gecontroleerd 2026-11-15: detail)*
- Atkinson, R. (1993). Crusade: The Untold Story of the Persian Gulf War. Houghton Mifflin, Boston. *(gecontroleerd 2026-11-15: detail)*
- Ault, F. W. (1969). Report of the Air-to-Air Missile System Capability Review (the Ault Report). Naval Air Systems Command, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Baddeley, A.; Rubak, E.; Turner, R. (2015). Spatial Point Patterns: Methodology and Applications with R. CRC Press, Boca Raton. *(gecontroleerd 2026-11-15: detail)*
- Bainbridge, W. S. (2007). The scientific research potential of virtual worlds. Science 317(5837): 472-476. doi:10.1126/science.1146930 *(gecontroleerd 2026-11-15: detail)*
- Balicer, R. D. (2007). Modeling infectious diseases dissemination through online role-playing games. Epidemiology 18(2): 260-261. doi:10.1097/01.ede.0000254692.80550.60 *(gecontroleerd 2026-11-15: detail)*
- Ballard, M. B. (2004). Vicksburg: The Campaign That Opened the Mississippi. University of North Carolina Press, Chapel Hill. *(gecontroleerd 2026-11-15: detail)*
- Ballerini, M.; Cabibbo, N.; Candelier, R.; Cavagna, A.; Cisbani, E.; Giardina, I.; Lecomte, V.; Orlandi, A.; Parisi, G.; Procaccini, A.; Viale, M.; Zdravkovic, V. (2008). Interaction ruling animal collective behavior depends on topological rather than metric distance: evidence from a field study. Proceedings of the National Academy of Sciences 105(4): 1232-1237. doi:10.1073/pnas.0711437105 *(gecontroleerd 2026-11-15: detail)*
- Banerjee, A. V. (1992). A simple model of herd behavior. Quarterly Journal of Economics 107(3): 797-817. doi:10.2307/2118364 *(gecontroleerd 2026-11-15: detail)*
- Bar-Eli, M.; Avugos, S.; Raab, M. (2006). Twenty years of "hot hand" research: review and critique. Psychology of Sport and Exercise 7(6): 525-553. doi:10.1016/j.psychsport.2006.03.001 *(gecontroleerd 2026-11-15: detail)*
- Bar-Eli, M.; Azar, O. H.; Ritov, I.; Keidar-Levin, Y.; Schein, G. (2007). Action bias among elite soccer goalkeepers: the case of penalty kicks. Journal of Economic Psychology 28(5): 606-621. doi:10.1016/j.joep.2006.12.001 *(gecontroleerd 2026-11-15: detail)*
- Bar-Siman-Tov, Y. (1980). The Israeli-Egyptian War of Attrition, 1969-1970. Columbia University Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Barabási, A.-L.; Albert, R. (1999). Emergence of scaling in random networks. Science 286(5439): 509-512. doi:10.1126/science.286.5439.509 *(gecontroleerd 2026-11-15: detail)*
- Barr, N. (2004). Pendulum of War: The Three Battles of El Alamein. Jonathan Cape, London. *(gecontroleerd 2026-11-15: detail)*
- Barrow, G. W. S. (1965). Robert Bruce and the Community of the Realm of Scotland. Eyre & Spottiswoode, London. *(gecontroleerd 2026-11-15: detail)*
- Bartley, W. S. (1954). Iwo Jima: Amphibious Epic. Historical Branch, US Marine Corps, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Bauckhage, C.; Kersting, K.; Sifa, R.; Thurau, C.; Drachen, A.; Canossa, A. (2012). How players lose interest in playing a game: an empirical study based on distributions of total playing times. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 139-146. doi:10.1109/CIG.2012.6374148 *(gecontroleerd 2026-11-15: detail)*
- Baumeister, R. F. (1984). Choking under pressure: self-consciousness and paradoxical effects of incentives on skillful performance. Journal of Personality and Social Psychology 46(3): 610-620. doi:10.1037/0022-3514.46.3.610 *(gecontroleerd 2026-11-15: detail)*
- Beal, D. J.; Cohen, R. R.; Burke, M. J.; McLendon, C. L. (2003). Cohesion and performance in groups: a meta-analytic clarification of construct relations. Journal of Applied Psychology 88(6): 989-1004. doi:10.1037/0021-9010.88.6.989 *(gecontroleerd 2026-11-15: detail)*
- Bednárek, D.; Kruliš, M.; Yaghob, J.; Zavoral, F. (2017). Player performance evaluation in team-based first-person shooter eSport. Data Management Technologies and Applications (DATA 2017), CCIS, Springer. *(gecontroleerd 2026-11-15: bestaan)*
- Beevor, A. (1991). Crete: The Battle and the Resistance. John Murray, London. *(gecontroleerd 2026-11-15: detail)*
- Beevor, A. (1998). Stalingrad. Viking, London. *(gecontroleerd 2026-11-15: detail)*
- Beevor, A. (2002). Berlin: The Downfall 1945. Viking, London. *(gecontroleerd 2026-11-15: detail)*
- Benedikt, M. L. (1979). To take hold of space: isovists and isovist fields. Environment and Planning B 6(1): 47-65. *(gecontroleerd 2026-11-15: detail)*
- Benjamini, Y.; Hochberg, Y. (1995). Controlling the false discovery rate: a practical and powerful approach to multiple testing. Journal of the Royal Statistical Society B 57(1): 289-300. *(gecontroleerd 2026-11-15: detail)*
- Berner, C.; Brockman, G.; Chan, B.; Cheung, V.; et al. (OpenAI) (2019). Dota 2 with large scale deep reinforcement learning. arXiv:1912.06680. https://arxiv.org/abs/1912.06680 *(gecontroleerd 2026-11-15: detail)*
- Bernier, Y. W. (2001). Latency compensating methods in client/server in-game protocol design and optimization. Valve Developer Community (Valve Software). https://developer.valvesoftware.com/wiki/Latency_Compensating_Methods_in_Client/Server_In-game_Protocol_Design_and_Optimization *(gecontroleerd 2026-11-15: bestaan)*
- Biddle, S. (2004). Military Power: Explaining Victory and Defeat in Modern Battle. Princeton University Press, Princeton. *(gecontroleerd 2026-11-15: detail)*
- Bikhchandani, S.; Hirshleifer, D.; Welch, I. (1992). A theory of fads, fashion, custom, and cultural change as informational cascades. Journal of Political Economy 100(5): 992-1026. doi:10.1086/261849 *(gecontroleerd 2026-11-15: detail)*
- Björk, S.; Holopainen, J. (2005). Patterns in Game Design. Charles River Media, Hingham. *(gecontroleerd 2026-11-15: detail)*
- Blackett, P. M. S. (1962). Studies of War: Nuclear and Conventional. Oliver & Boyd, Edinburgh. *(gecontroleerd 2026-11-15: detail)*
- Blair, C. (1975). Silent Victory: The U.S. Submarine War Against Japan. Lippincott, Philadelphia. *(gecontroleerd 2026-11-15: detail)*
- Blair, C. (1998). Hitler's U-Boat War: The Hunted, 1942-1945. Random House, New York. *(gecontroleerd 2026-11-15: detail)*
- Block, F.; Hodge, V.; Hobson, S.; Sephton, N.; Devlin, S.; Ursu, M. F.; Drachen, A.; Cowling, P. I. (2018). Narrative bytes: data-driven content production in esports. Proc. ACM International Conference on Interactive Experiences for TV and Online Video (TVX 2018): 29-41. *(gecontroleerd 2026-11-15: bestaan)*
- Blumenson, M. (1961). Breakout and Pursuit (US Army in World War II). Office of the Chief of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Blumenson, M. (1967). Kasserine Pass. Houghton Mifflin, Boston. *(gecontroleerd 2026-11-15: detail)*
- Bond, R.; Smith, P. B. (1996). Culture and conformity: a meta-analysis of studies using Asch's (1952b, 1956) line judgment task. Psychological Bulletin 119(1): 111-137. doi:10.1037/0033-2909.119.1.111 *(gecontroleerd 2026-11-15: detail)*
- Bourque, S. A. (2002). Jayhawk! The VII Corps in the Persian Gulf War. Center of Military History, US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Bowden, M. (1999). Black Hawk Down: A Story of Modern War. Atlantic Monthly Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Bowman, B.; Elmqvist, N.; Jankun-Kelly, T. J. (2012). Toward visualization for games: theory, design space, and patterns. IEEE Transactions on Visualization and Computer Graphics 18(11): 1956-1968. *(gecontroleerd 2026-11-15: detail)*
- Boyd, J. R. (1986). Patterns of Conflict (briefing). Onuitgegeven briefing; gearchiveerd door de Marine Corps University, Quantico. https://www.usmcu.edu/Research/Marine-Corps-History-Division/ *(gecontroleerd 2026-11-15: bestaan)*
- Boyd, J. R.; Christie, T. P.; Gibson, J. E. (1966). Energy-Maneuverability (APGC-TR-66-4). Air Proving Ground Center, Eglin AFB. *(gecontroleerd 2026-11-15: detail)*
- Bracken, J. (1995). Lanchester models of the Ardennes campaign. Naval Research Logistics 42(4): 559-577. *(gecontroleerd 2026-11-15: detail)*
- Bradley, R. A.; Terry, M. E. (1952). Rank analysis of incomplete block designs: I. The method of paired comparisons. Biometrika 39(3/4): 324-345. *(gecontroleerd 2026-11-15: detail)*
- Brier, G. W. (1950). Verification of forecasts expressed in terms of probability. Monthly Weather Review 78(1): 1-3. doi:10.1175/1520-0493(1950)078<0001:VOFEIT>2.0.CO;2 *(gecontroleerd 2026-11-15: detail)*
- Bronk, J.; Reynolds, N.; Watling, J. (2022). The Russian Air War and Ukrainian Requirements for Air Defence. Royal United Services Institute, London (Special Resources, November 2022). *(gecontroleerd 2026-11-15: bestaan)*
- Budiansky, S. (2013). Blackett's War: The Men Who Defeated the Nazi U-Boats and Brought Science to the Art of Warfare. Alfred A. Knopf, New York. *(gecontroleerd 2026-11-15: detail)*
- Bungay, S. (2000). The Most Dangerous Enemy: A History of the Battle of Britain. Aurum Press, London. *(gecontroleerd 2026-11-15: detail)*
- Burg, S. L.; Shoup, P. S. (1999). The War in Bosnia-Herzegovina: Ethnic Conflict and International Intervention. M. E. Sharpe, Armonk. *(gecontroleerd 2026-11-15: detail)*
- Caesar, G. J. (vert. McDevitte, W. A.; Bohn, W. S.) (1869). The Commentaries: The Civil War. Harper & Brothers, New York. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Caldwell, D.; Muller, R. (2007). The Luftwaffe over Germany: Defense of the Reich. Greenhill Books, London. *(gecontroleerd 2026-11-15: detail)*
- Campbell, N. J. M. (1986). Jutland: An Analysis of the Fighting. Conway Maritime Press, London. *(gecontroleerd 2026-11-15: detail)*
- Canossa, A.; Drachen, A.; Sørensen, J. R. M. (2011). Arrrgghh!!! - blending quantitative and qualitative methods to detect player frustration. Proc. 6th International Conference on Foundations of Digital Games (FDG 2011), ACM: 61-68. *(gecontroleerd 2026-11-15: detail)*
- Castronova, E. (2005). Synthetic Worlds: The Business and Culture of Online Games. University of Chicago Press, Chicago. *(gecontroleerd 2026-11-15: detail)*
- Centola, D. (2010). The spread of behavior in an online social network experiment. Science 329(5996): 1194-1197. doi:10.1126/science.1185231 *(gecontroleerd 2026-11-15: detail)*
- Cervone, D.; D'Amour, A.; Bornn, L.; Goldsberry, K. (2016). A multiresolution stochastic process model for predicting basketball possession outcomes. Journal of the American Statistical Association 111(514): 585-599. *(gecontroleerd 2026-11-15: detail)*
- Chandler, D. G. (1966). The Campaigns of Napoleon. Macmillan, New York. *(gecontroleerd 2026-11-15: detail)*
- Chandler, D. G. (1973). Marlborough as Military Commander. Batsford, London. *(gecontroleerd 2026-11-15: detail)*
- Chiappori, P.-A.; Levitt, S.; Groseclose, T. (2002). Testing mixed-strategy equilibria when players are heterogeneous: the case of penalty kicks in soccer. American Economic Review 92(4): 1138-1151. doi:10.1257/00028280260344678 *(gecontroleerd 2026-11-15: detail)*
- Churchill, W. S. (1899). The River War: An Historical Account of the Reconquest of the Soudan. Longmans, Green, London. https://www.gutenberg.org/ebooks/4943 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Cilliers, J. K. (1985). Counter-Insurgency in Rhodesia. Croom Helm, London. *(gecontroleerd 2026-11-15: detail)*
- Citino, R. M. (2005). The German Way of War: From the Thirty Years' War to the Third Reich. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Clark, P. J.; Evans, F. C. (1954). Distance to nearest neighbor as a measure of spatial relationships in populations. Ecology 35(4): 445-453. *(gecontroleerd 2026-11-15: detail)*
- Clausewitz, C. von (vert. Graham, J. J.) (1873). On War. N. Trübner, London. https://www.gutenberg.org/ebooks/1946 *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Claypool, M.; Claypool, K. (2006). Latency and player actions in online games. Communications of the ACM 49(11): 40-45. doi:10.1145/1167838.1167860 *(gecontroleerd 2026-11-15: detail)*
- Clodfelter, M. (1989). The Limits of Air Power: The American Bombing of North Vietnam. Free Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Coddington, E. B. (1968). The Gettysburg Campaign: A Study in Command. Scribner, New York. *(gecontroleerd 2026-11-15: detail)*
- Cohen, A.; Hamilton, R. E. (2011). The Russian Military and the Georgia War: Lessons and Implications. Strategic Studies Institute, US Army War College, Carlisle. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Cole, H. M. (1950). The Lorraine Campaign (US Army in World War II). Historical Division, Department of the Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Cole, H. M. (1965). The Ardennes: Battle of the Bulge (US Army in World War II). Office of the Chief of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Combat Studies Institute (2010). Wanat: Combat Action in Afghanistan, 2008. Combat Studies Institute Press, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Connaughton, R. M. (1988). The War of the Rising Sun and Tumbling Bear: A Military History of the Russo-Japanese War, 1904-5. Routledge, London. *(gecontroleerd 2026-11-15: detail)*
- Cooper, B. (1967). The Ironclads of Cambrai. Souvenir Press, London. *(gecontroleerd 2026-11-15: detail)*
- Coox, A. D. (1985). Nomonhan: Japan Against Russia, 1939. Stanford University Press, Stanford. *(gecontroleerd 2026-11-15: detail)*
- Copp, T. (2003). Fields of Fire: The Canadians in Normandy. University of Toronto Press, Toronto. *(gecontroleerd 2026-11-15: detail)*
- Corbett, J. S. (1910). The Campaign of Trafalgar. Longmans, Green, London. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Corbett, J. S. (1911). Some Principles of Maritime Strategy. Longmans, Green, London. https://www.gutenberg.org/ebooks/15076 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Corbett, J. S. (1920). Naval Operations deel 1 (History of the Great War). Longmans, Green, London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Corbett, J. S. (1921). Naval Operations deel 2 (History of the Great War). Longmans, Green, London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Corbett, J. S. (1923). Naval Operations deel 3 (History of the Great War). Longmans, Green, London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Cordesman, A. H.; Wagner, A. R. (1990). The Lessons of Modern War, Volume II: The Iran-Iraq War. Westview Press, Boulder. *(gecontroleerd 2026-11-15: bestaan)*
- Couzin, I. D.; Krause, J.; Franks, N. R.; Levin, S. A. (2005). Effective leadership and decision-making in animal groups on the move. Nature 433(7025): 513-516. doi:10.1038/nature03236 *(gecontroleerd 2026-11-15: detail)*
- Couzin, I. D.; Krause, J.; James, R.; Ruxton, G. D.; Franks, N. R. (2002). Collective memory and spatial sorting in animal groups. Journal of Theoretical Biology 218(1): 1-11. doi:10.1006/jtbi.2002.3065 *(gecontroleerd 2026-11-15: detail)*
- Cox, D. R. (1972). Regression models and life-tables. Journal of the Royal Statistical Society B 34(2): 187-220. *(gecontroleerd 2026-11-15: detail)*
- Craven, W. F.; Cate, J. L. (red.) (1949). The Army Air Forces in World War II, deel 2: Europe: Torch to Pointblank, August 1942 to December 1943. University of Chicago Press, Chicago. *(gecontroleerd 2026-11-15: bestaan)*
- Craven, W. F.; Cate, J. L. (red.) (1951). The Army Air Forces in World War II, deel 3: Europe: Argument to V-E Day, January 1944 to May 1945. University of Chicago Press, Chicago. *(gecontroleerd 2026-11-15: bestaan)*
- Csikszentmihalyi, M. (1990). Flow: The Psychology of Optimal Experience. Harper & Row, New York. *(gecontroleerd 2026-11-15: detail)*
- Curry, A. (2005). Agincourt: A New History. Tempus, Stroud. *(gecontroleerd 2026-11-15: detail)*
- Cutler, T. J. (1994). The Battle of Leyte Gulf, 23-26 October 1944. HarperCollins, New York. *(gecontroleerd 2026-11-15: detail)*
- D'Este, C. (1983). Decision in Normandy. Collins, London. *(gecontroleerd 2026-11-15: bestaan)*
- Darley, J. M.; Latané, B. (1968). Bystander intervention in emergencies: diffusion of responsibility. Journal of Personality and Social Psychology 8(4, Pt. 1): 377-383. doi:10.1037/h0025589 *(gecontroleerd 2026-11-15: detail)*
- Davies, N. (2003). Rising '44: The Battle for Warsaw. Macmillan, London. *(gecontroleerd 2026-11-15: detail)*
- Davis, R. G. (1993). Carl A. Spaatz and the Air War in Europe. Center for Air Force History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- DeChurch, L. A.; Mesmer-Magnus, J. R. (2010). The cognitive underpinnings of effective teamwork: a meta-analysis. Journal of Applied Psychology 95(1): 32-53. doi:10.1037/a0017328 *(gecontroleerd 2026-11-15: detail)*
- Decroos, T.; Bransen, L.; Van Haaren, J.; Davis, J. (2019). Actions speak louder than goals: valuing player actions in soccer. Proc. 25th ACM SIGKDD Conference on Knowledge Discovery and Data Mining (KDD 2019): 1851-1861. doi:10.1145/3292500.3330758 *(gecontroleerd 2026-11-15: detail)*
- Deitchman, S. J. (1962). A Lanchester model of guerrilla warfare. Operations Research 10(6): 818-827. doi:10.1287/opre.10.6.818 *(gecontroleerd 2026-11-15: detail)*
- Delbrück, H. (vert. Renfroe, W. J.) (1990). History of the Art of War, deel 4: The Dawn of Modern Warfare (oorspr. 1920). University of Nebraska Press, Lincoln. *(gecontroleerd 2026-11-15: bestaan)*
- Department of the Air Force (2002). Counterair Operations (Air Force Doctrine Document 2-1.1). Headquarters US Air Force, Washington DC (DTIC ADA404825). doi:10.21236/ada404825 *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Desch, M. C. (2002). Democracy and victory: why regime type hardly matters. International Security 27(2): 5-47. *(gecontroleerd 2026-11-15: detail)*
- Diggle, P. J. (2013). Statistical Analysis of Spatial and Spatio-Temporal Point Patterns (3e dr.). CRC Press, Boca Raton. *(gecontroleerd 2026-11-15: detail)*
- Doubler, M. D. (1994). Closing with the Enemy: How GIs Fought the War in Europe, 1944-1945. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Doughty, R. A. (1990). The Breaking Point: Sedan and the Fall of France, 1940. Archon Books, Hamden. *(gecontroleerd 2026-11-15: detail)*
- Douhet, G. (vert. Ferrari, D.) (1942). The Command of the Air (oorspr. 1921). Coward-McCann, New York; herdr. Office of Air Force History 1983. *(gecontroleerd 2026-11-15: detail)*
- Drachen, A.; Canossa, A. (2009). Analyzing spatial user behavior in computer games using geographic information systems. Proc. 13th International MindTrek Conference, ACM: 182-189. *(gecontroleerd 2026-11-15: detail)*
- Drachen, A.; Canossa, A.; Yannakakis, G. N. (2009). Player modeling using self-organization in Tomb Raider: Underworld. Proc. IEEE Symposium on Computational Intelligence and Games: 1-8. *(gecontroleerd 2026-11-15: detail)*
- Drachen, A.; Sifa, R.; Bauckhage, C.; Thurau, C. (2012). Guns, swords and data: clustering of player behavior in computer games in the wild. Proc. IEEE Conference on Computational Intelligence and Games (CIG 2012): 163-170. *(gecontroleerd 2026-11-15: detail)*
- Drachen, A.; Yancey, M.; Maguire, J.; Chu, D.; Wang, I. Y.; Mahlmann, T.; Schubert, M.; Klabjan, D. (2014). Skill-based differences in spatio-temporal team behaviour in Defence of the Ancients 2 (DotA 2). Proc. IEEE Games Media Entertainment (GEM 2014): 1-8. doi:10.1109/GEM.2014.7048109 *(gecontroleerd 2026-11-15: bestaan)*
- Drea, E. J. (1981). Nomonhan: Japanese-Soviet Tactical Combat, 1939 (Leavenworth Papers 2). Combat Studies Institute, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Drury, J.; Cocking, C.; Reicher, S. (2009). Everyone for themselves? A comparative study of crowd solidarity among emergency survivors. British Journal of Social Psychology 48(3): 487-506. doi:10.1348/014466608X357893 *(gecontroleerd 2026-11-15: detail)*
- Duch, J.; Waitzman, J. S.; Amaral, L. A. N. (2010). Quantifying the performance of individual players in a team activity. PLoS ONE 5(6): e10937. doi:10.1371/journal.pone.0010937 *(gecontroleerd 2026-11-15: detail)*
- Dugan, J.; Stewart, C. (1962). Ploesti: The Great Ground-Air Battle of 1 August 1943. Random House, New York. *(gecontroleerd 2026-11-15: detail)*
- Dupuy, T. N. (1979). Numbers, Predictions and War. Bobbs-Merrill, Indianapolis. *(gecontroleerd 2026-11-15: detail)*
- Dupuy, T. N. (1987). Understanding War: History and Theory of Combat. Paragon House, New York. *(gecontroleerd 2026-11-15: detail)*
- Dupuy, T. N. (1990). Attrition: Forecasting Battle Casualties and Equipment Losses in Modern War. HERO Books, Fairfax VA. *(gecontroleerd 2026-11-15: detail)*
- Dyer, J. R. G.; Johansson, A.; Helbing, D.; Couzin, I. D.; Krause, J. (2009). Leadership, consensus decision making and collective behaviour in humans. Philosophical Transactions of the Royal Society B 364(1518): 781-789. doi:10.1098/rstb.2008.0233 *(gecontroleerd 2026-11-15: detail)*
- Echevarria, A. J. (2002). Clausewitz's Center of Gravity: Changing Our Warfighting Doctrine - Again!. Strategic Studies Institute, US Army War College, Carlisle PA. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Efron, B. (1979). Bootstrap methods: another look at the jackknife. Annals of Statistics 7(1): 1-26. *(gecontroleerd 2026-11-15: detail)*
- Efron, B.; Morris, C. (1975). Data analysis using Stein's estimator and its generalizations. Journal of the American Statistical Association 70(350): 311-319. doi:10.1080/01621459.1975.10479864 *(gecontroleerd 2026-11-15: detail)*
- Eggert, C.; Herrlich, M.; Smeddinck, J.; Malaka, R. (2015). Classification of player roles in the team-based multi-player game Dota 2. Entertainment Computing - ICEC 2015, LNCS 9353, Springer: 112-125. *(gecontroleerd 2026-11-15: bestaan)*
- Elias, G. S.; Garfield, R.; Gutschera, K. R. (2012). Characteristics of Games. MIT Press, Cambridge MA. *(gecontroleerd 2026-11-15: detail)*
- Elo, A. E. (1978). The Rating of Chessplayers, Past and Present. Arco, New York. *(gecontroleerd 2026-11-15: detail)*
- Engel, J. H. (1954). A verification of Lanchester's law. Journal of the Operations Research Society of America 2(2): 163-171. doi:10.1287/opre.2.2.163 *(gecontroleerd 2026-11-15: detail)*
- Englund, P. (2003). The Battle That Shook Europe: Poltava and the Birth of the Russian Empire. I. B. Tauris, London. *(gecontroleerd 2026-11-15: detail)*
- Epstein, J. M. (1985). The Calculus of Conventional War: Dynamic Analysis without Lanchester Theory. Brookings Institution, Washington DC. *(gecontroleerd 2026-11-15: detail)*
- Epstein, J. M. (1989). The 3:1 rule, the adaptive dynamic model, and the future of security studies. International Security 13(4). *(gecontroleerd 2026-11-15: detail)*
- Erickson, J. (1975). The Road to Stalingrad: Stalin's War with Germany, Volume One. Harper & Row, New York. *(gecontroleerd 2026-11-15: detail)*
- ESPN (2016). Daigo and JWong: the legacy of Street Fighter's Moment 37. ESPN Esports. https://www.espn.com/espn/story/_/id/17391663 *(gecontroleerd 2026-11-15: detail)*
- Ethell, J.; Price, A. (1983). Air War South Atlantic. Sidgwick & Jackson, London. *(gecontroleerd 2026-11-15: detail)*
- Evans, D. C.; Peattie, M. R. (1997). Kaigun: Strategy, Tactics, and Technology in the Imperial Japanese Navy, 1887-1941. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Fain, J. B. (1977). The Lanchester equations and historical warfare: an analysis of sixty World War II land engagements. History, Numbers and War 1(1), Historical Evaluation and Research Organization, Dunn Loring VA. *(gecontroleerd 2026-11-15: detail)*
- Fall, B. B. (1966). Hell in a Very Small Place: The Siege of Dien Bien Phu. Lippincott, Philadelphia. *(gecontroleerd 2026-11-15: detail)*
- Farrell, T. (2017). Unwinnable: Britain's War in Afghanistan, 2001-2014. Bodley Head, London. *(gecontroleerd 2026-11-15: detail)*
- Fernández, J.; Bornn, L. (2018). Wide open spaces: a statistical technique for measuring space creation in professional soccer. MIT Sloan Sports Analytics Conference 2018. *(gecontroleerd 2026-11-15: detail)*
- Fernández, J.; Bornn, L.; Cervone, D. (2021). A framework for the fine-grained evaluation of the instantaneous expected value of soccer possessions. Machine Learning 110(6): 1389-1427. doi:10.1007/s10994-021-05989-6 *(gecontroleerd 2026-11-15: detail)*
- Fischer, P.; Krueger, J. I.; Greitemeyer, T.; Vogrincic, C.; Kastenmüller, A.; Frey, D.; Heene, M.; Wicher, M.; Kainbacher, M. (2011). The bystander-effect: a meta-analytic review on bystander intervention in dangerous and non-dangerous emergencies. Psychological Bulletin 137(4): 517-537. doi:10.1037/a0023304 *(gecontroleerd 2026-11-15: detail)*
- Fisher, P. F. (1993). Algorithm and implementation uncertainty in viewshed analysis. International Journal of Geographical Information Systems 7(4): 331-347. *(gecontroleerd 2026-11-15: detail)*
- Fleiss, J. L. (1971). Measuring nominal scale agreement among many raters. Psychological Bulletin 76(5): 378-382. doi:10.1037/h0031619 *(gecontroleerd 2026-11-15: detail)*
- Fontenot, G.; Degen, E. J.; Tohn, D. (2004). On Point: The United States Army in Operation Iraqi Freedom. Combat Studies Institute Press, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Forty, G. (2004). Villers Bocage (Battle Zone Normandy). Sutton, Stroud. *(gecontroleerd 2026-11-15: detail)*
- Fox, A. C. (2019). "Cyborgs at Little Stalingrad": A Brief History of the Battles of the Donetsk Airport, 26 May 2014 to 21 January 2015 (Land Warfare Paper). Association of the United States Army, Institute of Land Warfare, Arlington. *(gecontroleerd 2026-11-15: bestaan)*
- Fox, A. C.; Rossow, A. J. (2017). Making Sense of Russian Hybrid Warfare: A Brief Assessment of the Russo-Ukrainian War (Land Warfare Paper 112). Association of the United States Army, Institute of Land Warfare, Arlington. *(gecontroleerd 2026-11-15: detail)*
- Frank, R. B. (1990). Guadalcanal: The Definitive Account of the Landmark Battle. Random House, New York. *(gecontroleerd 2026-11-15: detail)*
- Franks, A.; Miller, A.; Bornn, L.; Goldsberry, K. (2015). Characterizing the spatial structure of defensive skill in professional basketball. Annals of Applied Statistics 9(1): 94-121. *(gecontroleerd 2026-11-15: detail)*
- Fricker, R. D. (1998). Attrition models of the Ardennes campaign. Naval Research Logistics 45(1): 1-22. https://www.rand.org/pubs/external_publications/EP19980204.html *(gecontroleerd 2026-11-15: detail)*
- Frieser, K.-H. (2005). The Blitzkrieg Legend: The 1940 Campaign in the West. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Fruin, J. J. (1971). Pedestrian Planning and Design. Metropolitan Association of Urban Designers and Environmental Planners, New York. *(gecontroleerd 2026-11-15: detail)*
- Fuller, J. F. C. (1926). The Foundations of the Science of War. Hutchinson, London. *(gecontroleerd 2026-11-15: detail)*
- Fullerton, T.; Swain, C.; Hoffman, S. (2008). Game Design Workshop (2e dr.). Morgan Kaufmann, Burlington. *(gecontroleerd 2026-11-15: detail)*
- Futrell, R. F. (1983). The United States Air Force in Korea, 1950-1953 (herz. dr.). Office of Air Force History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Gabriel, R. A. (1984). Operation Peace for Galilee: The Israeli-PLO War in Lebanon. Hill & Wang, New York. *(gecontroleerd 2026-11-15: detail)*
- Gallup, A. C.; Hale, J. J.; Sumpter, D. J. T.; Garnier, S.; Kacelnik, A.; Krebs, J. R.; Couzin, I. D. (2012). Visual attention and the acquisition of information in human crowds. Proceedings of the National Academy of Sciences 109(19): 7245-7250. doi:10.1073/pnas.1116141109 *(gecontroleerd 2026-11-15: detail)*
- Galula, D. (1964). Counterinsurgency Warfare: Theory and Practice. Praeger, New York. *(gecontroleerd 2026-11-15: detail)*
- GameSpot (2014). Counter-Strike eSports team forfeits victory after using map exploit. GameSpot. https://www.gamespot.com/articles/counter-strike-esports-team-forfeits-victory-after/1100-6423866/ *(gecontroleerd 2026-11-15: detail)*
- Garcimartín, A.; Zuriguel, I.; Pastor, J. M.; Martín-Gómez, C.; Parisi, D. R. (2014). Experimental evidence of the "faster is slower" effect. Transportation Research Procedia 2: 760-767. doi:10.1016/j.trpro.2014.09.085 *(gecontroleerd 2026-11-15: detail)*
- Gayle, G. D. (1996). Bloody Beaches: The Marines at Peleliu. Marine Corps Historical Center, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Getis, A.; Ord, J. K. (1992). The analysis of spatial association by use of distance statistics. Geographical Analysis 24(3): 189-206. *(gecontroleerd 2026-11-15: detail)*
- Gilovich, T.; Vallone, R.; Tversky, A. (1985). The hot hand in basketball: on the misperception of random sequences. Cognitive Psychology 17(3): 295-314. doi:10.1016/0010-0285(85)90010-6 *(gecontroleerd 2026-11-15: detail)*
- Gini, C. (1912). Variabilità e mutabilità. Tipografia di Paolo Cuppini, Bologna. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Glantz, D. M. (1983). August Storm: The Soviet 1945 Strategic Offensive in Manchuria (Leavenworth Papers 7). Combat Studies Institute, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M. (1989). Soviet Military Deception in the Second World War. Frank Cass, London. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M. (1991). From the Don to the Dnepr: Soviet Offensive Operations, December 1942-August 1943. Frank Cass, London. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M. (1991). Soviet Military Operational Art: In Pursuit of Deep Battle. Frank Cass, London. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M. (1998). Kharkov 1942: Anatomy of a Military Disaster Through Soviet Eyes. Ian Allan, Shepperton. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M. (1999). Zhukov's Greatest Defeat: The Red Army's Epic Disaster in Operation Mars, 1942. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M. (2001). Barbarossa: Hitler's Invasion of Russia 1941. Tempus, Stroud. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M.; House, J. M. (1995). When Titans Clashed: How the Red Army Stopped Hitler. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Glantz, D. M.; House, J. M. (1999). The Battle of Kursk. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Glenn, R. W. (1996). Combat in Hell: A Consideration of Constrained Urban Warfare (MR-780). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR780.html *(gecontroleerd 2026-11-15: detail)*
- Glickman, M. E. (1999). Parameter estimation in large dynamic paired comparison experiments. Journal of the Royal Statistical Society C 48(3): 377-394. *(gecontroleerd 2026-11-15: detail)*
- Goldsberry, K. (2012). CourtVision: new visual and spatial analytics for the NBA. MIT Sloan Sports Analytics Conference 2012. *(gecontroleerd 2026-11-15: detail)*
- Goldsworthy, A. (2001). Cannae. Cassell, London. *(gecontroleerd 2026-11-15: detail)*
- Gordon, A. (1996). The Rules of the Game: Jutland and British Naval Command. John Murray, London. *(gecontroleerd 2026-11-15: detail)*
- Granovetter, M. S. (1973). The strength of weak ties. American Journal of Sociology 78(6): 1360-1380. doi:10.1086/225469 *(gecontroleerd 2026-11-15: detail)*
- Grau, L. W. (1997). Russian-manufactured armored vehicle vulnerability in urban combat: the Chechnya experience. Red Thrust Star (January 1997), Foreign Military Studies Office, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Grau, L. W. (red.) (1996). The Bear Went Over the Mountain: Soviet Combat Tactics in Afghanistan. National Defense University Press, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Green, B.; Zwiebel, J. (2018). The hot-hand fallacy: cognitive mistakes or equilibrium adjustments? Evidence from Major League Baseball. Management Science 64(11): 5315-5348. doi:10.1287/mnsc.2017.2804 *(gecontroleerd 2026-11-15: detail)*
- Greene, J. A. (2005). The Guns of Independence: The Siege of Yorktown, 1781. Savas Beatie, New York. *(gecontroleerd 2026-11-15: detail)*
- Greene, J.; Massignani, A. (1998). The Naval War in the Mediterranean, 1940-1943. Chatham Publishing, London. *(gecontroleerd 2026-11-15: detail)*
- Grund, T. U. (2012). Network structure and team performance: the case of English Premier League soccer teams. Social Networks 34(4): 682-690. doi:10.1016/j.socnet.2012.08.004 *(gecontroleerd 2026-11-15: detail)*
- Gudmundsson, B. I. (1989). Stormtroop Tactics: Innovation in the German Army, 1914-1918. Praeger, New York. *(gecontroleerd 2026-11-15: detail)*
- Gudmundsson, J.; Horton, M. (2017). Spatio-temporal analysis of team sports. ACM Computing Surveys 50(2): artikel 22. https://arxiv.org/abs/1602.06994 *(gecontroleerd 2026-11-15: detail)*
- Guilmartin, J. F. (1974). Gunpowder and Galleys: Changing Technology and Mediterranean Warfare at Sea in the Sixteenth Century. Cambridge University Press, Cambridge. *(gecontroleerd 2026-11-15: detail)*
- Guo, C.; Pleiss, G.; Sun, Y.; Weinberger, K. Q. (2017). On calibration of modern neural networks. Proceedings of the 34th International Conference on Machine Learning (ICML 2017): 1321-1330. doi:10.48550/arXiv.1706.04599 *(gecontroleerd 2026-11-15: detail)*
- Güttler, C.; Johansson, T. D. (2003). Spatial principles of level-design in multi-player first-person shooters. Proc. 2nd Workshop on Network and System Support for Games (NetGames 2003), ACM: 158-170. *(gecontroleerd 2026-11-15: detail)*
- Haghani, M.; Sarvi, M. (2018). Crowd behaviour and motion: empirical methods. Transportation Research Part B: Methodological 107: 253-294. doi:10.1016/j.trb.2017.06.017 *(gecontroleerd 2026-11-15: detail)*
- Haldon, J. (2001). The Byzantine Wars. Tempus, Stroud. *(gecontroleerd 2026-11-15: detail)*
- Hall, E. T. (1966). The Hidden Dimension. Doubleday, Garden City NY. *(gecontroleerd 2026-11-15: detail)*
- Hallion, R. P. (1992). Storm over Iraq: Air Power and the Gulf War. Smithsonian Institution Press, Washington DC. *(gecontroleerd 2026-11-15: detail)*
- Hardesty, V. (1982). Red Phoenix: The Rise of Soviet Air Power, 1941-1945. Smithsonian Institution Press, Washington DC. *(gecontroleerd 2026-11-15: detail)*
- Hardesty, V.; Grinberg, I. (2012). Red Phoenix Rising: The Soviet Air Force in World War II. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Hartley, D. S. (1995). A mathematical model of attrition data. Naval Research Logistics 42(4): 585-607. *(gecontroleerd 2026-11-15: detail)*
- Hartley, D. S.; Helmbold, R. L. (1995). Validating Lanchester's square law and other attrition models. Naval Research Logistics 42(4): 609-633. *(gecontroleerd 2026-11-15: detail)*
- Hastings, M. (1984). Overlord: D-Day and the Battle for Normandy. Michael Joseph, London. *(gecontroleerd 2026-11-15: detail)*
- Hastings, M.; Jenkins, S. (1983). The Battle for the Falklands. Michael Joseph, London. *(gecontroleerd 2026-11-15: detail)*
- Hayakawa, N.; Shimari, K.; Yamasaki, K.; Hoshikawa, H.; Tsuchida, R.; Matsumoto, K. (2025). Round outcome prediction in VALORANT using tactical features from video analysis. IEEE Conference on Games (CoG) 2025: 1-4. doi:10.1109/CoG64752.2025.11114177 *(gecontroleerd 2026-11-15: detail)*
- Hayward, J. S. A. (1998). Stopped at Stalingrad: The Luftwaffe and Hitler's Defeat in the East, 1942-1943. University Press of Kansas, Lawrence. *(gecontroleerd 2026-11-15: detail)*
- Hoofdkwartier, Department of the Army (1979). FM 90-10 Military Operations on Urbanized Terrain (MOUT). US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (1982). FM 100-5 Operations. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (1990). FM 5-33 Terrain Analysis. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (1994). FM 34-130 Intelligence Preparation of the Battlefield. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2002). FM 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (28 februari 2002). https://www.globalsecurity.org/military/library/policy/army/fm/3-06-11/index.html *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Hoofdkwartier, Department of the Army (2006). FM 3-06 Urban Operations. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2006). FM 3-24 Counterinsurgency. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2007). FM 3-21.8 The Infantry Rifle Platoon and Squad. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2007). FM 3-20.15 Tank Platoon. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2011). ATTP 3-06.11 Combined Arms Operations in Urban Terrain. Department of the Army, Washington DC (10 juni 2011). https://archive.org/details/attp-3-06.11-combined-arms-operations-in-urban-terrain-2011 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Hoofdkwartier, Department of the Army (2013). FM 3-90-1 Offense and Defense, Volume 1. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2013). FM 3-90-2 Reconnaissance, Security, and Tactical Enabling Tasks, Volume 2. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Hoofdkwartier, Department of the Army (2016). ATP 3-21.8 Infantry Platoon and Squad. US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2019). ATP 2-01.3 Intelligence Preparation of the Battlefield. US Army, Washington DC. https://armypubs.army.mil *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2022). FM 3-0 Operations. US Army, Washington DC. https://armypubs.army.mil *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army (2023). FM 3-90 Tactics. US Army, Washington DC. https://armypubs.army.mil *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Hoofdkwartier, Department of the Army; Marine Corps Tactics and Operations Group (2022). ATP 3-06 / MCTP 12-10B Urban Operations. Department of the Army, Washington DC (21 juli 2022). https://archive.org/details/arn-35826-atp-3-06-000-web-1 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Hoofdkwartier, US Marine Corps (1998). MCWP 3-35.3 Military Operations on Urbanized Terrain (MOUT). Department of the Navy, Washington DC (26 april 1998). https://archive.org/details/milmanual-mcwp-3-35.3-military-operations-on-urbanized-terrain-mout *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Healy, M. (1993). Qadesh 1300 BC: Clash of the Warrior Kings (Campaign 22). Osprey, London. *(gecontroleerd 2026-11-15: detail)*
- Heinl, R. D. (1968). Victory at High Tide: The Inchon-Seoul Campaign. Lippincott, Philadelphia. *(gecontroleerd 2026-11-15: detail)*
- Helbing, D.; Buzna, L.; Johansson, A.; Werner, T. (2005). Self-organized pedestrian crowd dynamics: experiments, simulations, and design solutions. Transportation Science 39(1): 1-24. doi:10.1287/trsc.1040.0108 *(gecontroleerd 2026-11-15: detail)*
- Helbing, D.; Farkas, I.; Vicsek, T. (2000). Simulating dynamical features of escape panic. Nature 407(6803): 487-490. doi:10.1038/35035023 *(gecontroleerd 2026-11-15: detail)*
- Helbing, D.; Johansson, A.; Al-Abideen, H. Z. (2007). Dynamics of crowd disasters: an empirical study. Physical Review E 75(4): 046109. doi:10.1103/PhysRevE.75.046109 *(gecontroleerd 2026-11-15: detail)*
- Helbing, D.; Keltsch, J.; Molnár, P. (1997). Modelling the evolution of human trail systems. Nature 388(6637): 47-50. doi:10.1038/40353 *(gecontroleerd 2026-11-15: detail)*
- Helbing, D.; Molnár, P. (1995). Social force model for pedestrian dynamics. Physical Review E 51(5): 4282-4286. doi:10.1103/PhysRevE.51.4282 *(gecontroleerd 2026-11-15: detail)*
- Helmbold, R. L. (1995). Rates of advance in land combat operations. Naval Research Logistics 42(4): 635-669. *(gecontroleerd 2026-11-15: detail)*
- Herbrich, R.; Minka, T.; Graepel, T. (2007). TrueSkill: a Bayesian skill rating system. Advances in Neural Information Processing Systems 19, MIT Press: 569-576. *(gecontroleerd 2026-11-15: bestaan)*
- Hermes, W. G. (1966). Truce Tent and Fighting Front (US Army in the Korean War). Office of the Chief of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Herodotus (vert. Rawlinson, G.) (1858). The History of Herodotus. John Murray, London. https://www.gutenberg.org/ebooks/2707 *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Herzog, C. (1975). The War of Atonement. Weidenfeld & Nicolson, London. *(gecontroleerd 2026-11-15: detail)*
- Herzog, C. (1982). The Arab-Israeli Wars: War and Peace in the Middle East. Random House, New York. *(gecontroleerd 2026-11-15: detail)*
- Hillier, B.; Hanson, J. (1984). The Social Logic of Space. Cambridge University Press, Cambridge. *(gecontroleerd 2026-11-15: detail)*
- Hinh, N. D. (1979). Lam Son 719 (Indochina Monographs). US Army Center of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Hodge, V. J.; Devlin, S.; Sephton, N.; Block, F.; Cowling, P. I.; Drachen, A. (2021). Win prediction in multiplayer esports: live professional match prediction. IEEE Transactions on Games 13(4): 368-379. *(gecontroleerd 2026-11-15: detail)*
- Hoerl, A. E.; Kennard, R. W. (1970). Ridge regression: biased estimation for nonorthogonal problems. Technometrics 12(1): 55-67. doi:10.1080/00401706.1970.10488634 *(gecontroleerd 2026-11-15: detail)*
- Holland, J. (2003). Fortress Malta: An Island Under Siege, 1940-1943. Orion, London. *(gecontroleerd 2026-11-15: detail)*
- Hoobler, N.; Humphreys, G.; Agrawala, M. (2004). Visualizing competitive behaviors in multi-user virtual environments. Proc. IEEE Visualization 2004: 163-170. *(gecontroleerd 2026-11-15: detail)*
- Horne, A. (1962). The Price of Glory: Verdun 1916. Macmillan, London. *(gecontroleerd 2026-11-15: detail)*
- Horne, A. (1977). A Savage War of Peace: Algeria 1954-1962. Macmillan, London. *(gecontroleerd 2026-11-15: detail)*
- Hornfischer, J. D. (2004). The Last Stand of the Tin Can Sailors. Bantam, New York. *(gecontroleerd 2026-11-15: detail)*
- Hornfischer, J. D. (2011). Neptune's Inferno: The U.S. Navy at Guadalcanal. Bantam, New York. *(gecontroleerd 2026-11-15: detail)*
- House, J. M. (1984). Toward Combined Arms Warfare: A Survey of 20th-Century Tactics, Doctrine, and Organization. Combat Studies Institute, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Howard, M. (1961). The Franco-Prussian War: The German Invasion of France, 1870-1871. Rupert Hart-Davis, London. *(gecontroleerd 2026-11-15: detail)*
- Hughes, W. P. (1995). A salvo model of warships in missile combat used to evaluate their staying power. Naval Research Logistics 42(2): 267-289. *(gecontroleerd 2026-11-15: detail)*
- Hughes, W. P. (2000). Fleet Tactics and Coastal Combat (2e dr.). Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Hughes, W. P.; Girrier, R. P. (2018). Fleet Tactics and Naval Operations (3e dr.). Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Hullett, K.; Whitehead, J. (2010). Design patterns in FPS levels. Proc. Foundations of Digital Games (FDG 2010), ACM: 78-85. *(gecontroleerd 2026-11-15: detail)*
- Ibrahim, F.; Feildboy, E.; Huber, Y.; Nagy, D.; Hennig, J.; Herzberg, P. Y. (2024). Enhancing close quarters battle performance: the effect of a compact training on the tactical performance and stress response of non-specialized and special forces. Journal of Police and Criminal Psychology. doi:10.1007/s11896-024-09699-2 *(gecontroleerd 2026-11-15: detail)*
- Isserson, G. S. (vert. Menning, B. W.) (2013). The Evolution of Operational Art (oorspr. 1936-37). Combat Studies Institute Press, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Johnson, D. E.; Markel, M. W.; Shannon, B. (2013). The 2008 Battle of Sadr City: Reimagining Urban Combat (RR-160-A). RAND Corporation, Santa Monica. *(gecontroleerd 2026-11-15: detail)*
- Johnson, I. R.; MacKay, N. J. (2011). Lanchester models and the Battle of Britain. Naval Research Logistics 58(3): 210-222. doi:10.1002/nav.20328 *(gecontroleerd 2026-11-15: detail)*
- Joint Chiefs of Staff (2017). JP 3-01 Countering Air and Missile Threats. US Joint Staff, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Joint Chiefs of Staff (2018). JP 3-60 Joint Targeting. US Joint Staff, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Joint Chiefs of Staff (2019). JP 3-09.3 Close Air Support. US Joint Staff, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Joint Chiefs of Staff (2020). JP 5-0 Joint Planning. US Joint Staff, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Jomini, A.-H. de (vert. Mendell, G. H.; Craighill, W. P.) (1862). The Art of War. J. B. Lippincott, Philadelphia. https://www.gutenberg.org/ebooks/13549 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Juul, J. (2005). Half-Real: Video Games between Real Rules and Fictional Worlds. MIT Press, Cambridge MA. *(gecontroleerd 2026-11-15: detail)*
- Kahalani, A. (1984). The Heights of Courage: A Tank Leader's War on the Golan. Greenwood Press, Westport. *(gecontroleerd 2026-11-15: detail)*
- Kahneman, D.; Tversky, A. (1979). Prospect theory: an analysis of decision under risk. Econometrica 47(2): 263-291. doi:10.2307/1914185 *(gecontroleerd 2026-11-15: detail)*
- Kaplan, E. L.; Meier, P. (1958). Nonparametric estimation from incomplete observations. Journal of the American Statistical Association 53(282): 457-481. *(gecontroleerd 2026-11-15: detail)*
- Karau, S. J.; Williams, K. D. (1993). Social loafing: a meta-analytic review and theoretical integration. Journal of Personality and Social Psychology 65(4): 681-706. doi:10.1037/0022-3514.65.4.681 *(gecontroleerd 2026-11-15: detail)*
- Katona, A.; Spick, R.; Hodge, V. J.; Demediuk, S.; Block, F.; Drachen, A.; Walker, J. A. (2019). Time to die: death prediction in Dota 2 using deep learning. Proc. IEEE Conference on Games (CoG 2019): 1-8. *(gecontroleerd 2026-11-15: bestaan)*
- Keaney, T. A.; Cohen, E. A. (1993). Gulf War Air Power Survey: Summary Report. US Government Printing Office, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Kendall, M. G. (1938). A new measure of rank correlation. Biometrika 30(1/2): 81-93. *(gecontroleerd 2026-11-15: detail)*
- Kennedy, H. (2007). The Great Arab Conquests: How the Spread of Islam Changed the World We Live In. Weidenfeld & Nicolson, London. *(gecontroleerd 2026-11-15: detail)*
- Kennedy, L. (1974). Pursuit: The Chase and Sinking of the Bismarck. Collins, London. *(gecontroleerd 2026-11-15: detail)*
- Ketchum, R. M. (1997). Saratoga: Turning Point of America's Revolutionary War. Henry Holt, New York. *(gecontroleerd 2026-11-15: detail)*
- Kim, J. H.; Gunn, D. V.; Schuh, E.; Phillips, B. C.; Pagulayan, R. J.; Wixon, D. (2008). Tracking real-time user experience (TRUE): a comprehensive instrumentation solution for complex systems. Proc. CHI 2008, ACM: 443-452. *(gecontroleerd 2026-11-15: detail)*
- Kim, Y. J.; Engel, D.; Woolley, A. W.; Lin, J. Y. T.; McArthur, N.; Malone, T. W. (2017). What makes a strong team? Using collective intelligence to predict team performance in League of Legends. Proceedings of the 2017 ACM Conference on Computer Supported Cooperative Work and Social Computing (CSCW): 2316-2329. doi:10.1145/2998181.2998185 *(gecontroleerd 2026-11-15: detail)*
- King, A. (2013). The Combat Soldier: Infantry Tactics and Cohesion in the Twentieth and Twenty-First Centuries. Oxford University Press, Oxford. *(gecontroleerd 2026-11-15: detail)*
- Kirby, M. W. (2003). Operational Research in War and Peace: The British Experience from the 1930s to 1970. Imperial College Press, London. *(gecontroleerd 2026-11-15: detail)*
- Knight, I. (2002). Isandlwana 1879: The Great Zulu Victory. Osprey, Oxford. *(gecontroleerd 2026-11-15: detail)*
- Knox, E. G. (1964). The detection of space-time interactions. Journal of the Royal Statistical Society C 13(1): 25-30. *(gecontroleerd 2026-11-15: detail)*
- Koopman, B. O. (1946). Search and Screening (OEG Report 56). Operations Evaluation Group, Office of the Chief of Naval Operations, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Koster, R. (2004). A Theory of Fun for Game Design. Paraglyph Press, Scottsdale. *(gecontroleerd 2026-11-15: detail)*
- Krause, J.; Ruxton, G. D.; Krause, S. (2010). Swarm intelligence in animals and humans. Trends in Ecology & Evolution 25(1): 28-34. doi:10.1016/j.tree.2009.06.016 *(gecontroleerd 2026-11-15: detail)*
- Krause, M. D. (1991). The Battle of 73 Easting, 26 February 1991: A Historical Introduction to a Simulation. US Army Center of Military History / DARPA, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Kremers, R. (2009). Level Design: Concept, Theory, and Practice. A K Peters, Wellesley. *(gecontroleerd 2026-11-15: detail)*
- Krepinevich, A.; Watts, B.; Work, R. (2003). Meeting the Anti-Access and Area-Denial Challenge. Center for Strategic and Budgetary Assessments, Washington DC. *(gecontroleerd 2026-11-15: bestaan)*
- Kress, M. (2012). Modeling armed conflicts. Science 336(6083): 865-869. *(gecontroleerd 2026-11-15: detail)*
- Kugler, R. (2007). Operation Anaconda in Afghanistan: A Case Study of Adaptation in Battle (Case Studies in Defense Transformation 5). Center for Technology and National Security Policy, National Defense University, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Kulldorff, M. (1997). A spatial scan statistic. Communications in Statistics - Theory and Methods 26(6): 1481-1496. *(gecontroleerd 2026-11-15: detail)*
- Kuperman, A. J. (1999). The Stinger missile and U.S. intervention in Afghanistan. Political Science Quarterly 114(2): 219-263. *(gecontroleerd 2026-11-15: detail)*
- Lambeth, B. S. (1984). Moscow's Lessons from the 1982 Lebanon Air War. RAND Corporation, Santa Monica. *(gecontroleerd 2026-11-15: detail)*
- Lambeth, B. S. (2001). NATO's Air War for Kosovo: A Strategic and Operational Assessment (MR-1365-AF). RAND Corporation, Santa Monica. https://www.rand.org/pubs/monograph_reports/MR1365.html *(gecontroleerd 2026-11-15: detail)*
- Lanchester, F. W. (1916). Aircraft in Warfare: The Dawn of the Fourth Arm. Constable, London. https://archive.org/details/aircraftinwarfar00lancrich *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Latané, B.; Williams, K.; Harkins, S. (1979). Many hands make light the work: the causes and consequences of social loafing. Journal of Personality and Social Psychology 37(6): 822-832. doi:10.1037/0022-3514.37.6.822 *(gecontroleerd 2026-11-15: detail)*
- Lavery, B. (1998). Nelson and the Nile: The Naval War Against Bonaparte, 1798. Chatham Publishing, London. *(gecontroleerd 2026-11-15: detail)*
- Lawrence, C. A. (2015). Kursk: The Battle of Prokhorovka. Aberdeen Books, Sheridan CO. *(gecontroleerd 2026-11-15: detail)*
- Lawrence, C. A. (2017). War by Numbers: Understanding Conventional Combat. Potomac Books, Lincoln NE. *(gecontroleerd 2026-11-15: detail)*
- Lawrence, T. E. (1920). The evolution of a revolt. Army Quarterly 1(1): 55-69. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Lee, S. W. K.; Chang, R. K. C. (2017). On "shot around a corner" in first-person shooter games. 15th Annual Workshop on Network and Systems Support for Games (NetGames 2017): 1-6. doi:10.1109/NetGames.2017.7991545 *(gecontroleerd 2026-11-15: detail)*
- Liddell Hart, B. H. (1954). Strategy: The Indirect Approach. Faber & Faber, London. *(gecontroleerd 2026-11-15: bestaan)*
- Liu, S.; Xu, X.; Claypool, M. (2022). A survey and taxonomy of latency compensation techniques for network computer games. ACM Computing Surveys 54(11s): 1-34. doi:10.1145/3519023 *(gecontroleerd 2026-11-15: detail)*
- Livy (vert. Roberts, W. M.) (1905). History of Rome. J. M. Dent (Everyman's Library), London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Lloyd, M. (1967). Mean crowding. Journal of Animal Ecology 36(1): 1-30. *(gecontroleerd 2026-11-15: detail)*
- Lock, D.; Nettleton, D. (2014). Using random forests to estimate win probability before each play of an NFL game. Journal of Quantitative Analysis in Sports 10(2). doi:10.1515/jqas-2013-0100 *(gecontroleerd 2026-11-15: detail)*
- Lofgren, E. T.; Fefferman, N. H. (2007). The untapped potential of virtual game worlds to shed light on real world epidemics. The Lancet Infectious Diseases 7(9): 625-629. doi:10.1016/S1473-3099(07)70212-8 *(gecontroleerd 2026-11-15: detail)*
- Lorenz, J.; Rauhut, H.; Schweitzer, F.; Helbing, D. (2011). How social influence can undermine the wisdom of crowd effect. Proceedings of the National Academy of Sciences 108(22): 9020-9025. doi:10.1073/pnas.1008636108 *(gecontroleerd 2026-11-15: detail)*
- Lucas, T. W.; Dinges, J. A. (2004). The effect of battle circumstances on fitting Lanchester equations to the Battle of Kursk. Military Operations Research 9(2): 17-30. *(gecontroleerd 2026-11-15: bestaan)*
- Lucas, T. W.; Turkes, T. (2004). Fitting Lanchester equations to the battles of Kursk and Ardennes. Naval Research Logistics 51(1): 95-116. doi:10.1002/nav.10101 *(gecontroleerd 2026-11-15: detail)*
- Lucey, P.; Bialkowski, A.; Carr, P.; Morgan, S.; Matthews, I.; Sheikh, Y. (2013). Representing and discovering adversarial team behaviors using player roles. Proc. IEEE Conference on Computer Vision and Pattern Recognition (CVPR 2013): 2706-2713. *(gecontroleerd 2026-11-15: detail)*
- Lundstrom, J. B. (1984). The First Team: Pacific Naval Air Combat from Pearl Harbor to Midway. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Lundstrom, J. B. (1994). The First Team and the Guadalcanal Campaign: Naval Fighter Combat from August to November 1942. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Lupfer, T. T. (1981). The Dynamics of Doctrine: The Changes in German Tactical Doctrine During the First World War (Leavenworth Papers 4). Combat Studies Institute, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Lynch, K. (1960). The Image of the City. MIT Press, Cambridge MA. *(gecontroleerd 2026-11-15: detail)*
- Macdonald, B. (2012). Adjusted plus-minus for NHL players using ridge regression with goals, shots, Fenwick, and Corsi. Journal of Quantitative Analysis in Sports 8(3). doi:10.1515/1559-0410.1447 *(gecontroleerd 2026-11-15: detail)*
- MacDonald, C. B. (1963). The Siegfried Line Campaign (US Army in World War II). Office of the Chief of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- MacDonald, C. B. (1985). A Time for Trumpets: The Untold Story of the Battle of the Bulge. William Morrow, New York. *(gecontroleerd 2026-11-15: detail)*
- MacGarrigle, G. L. (1998). Taking the Offensive: October 1966 to October 1967 (US Army in Vietnam). Center of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Mahan, A. T. (1890). The Influence of Sea Power upon History, 1660-1783. Little, Brown, Boston. https://www.gutenberg.org/ebooks/13529 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Mahan, A. T. (1897). The Life of Nelson: The Embodiment of the Sea Power of Great Britain. Little, Brown, Boston. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Makarov, I.; Savostyanov, D.; Litvyakov, B.; Ignatov, D. I. (2018). Predicting winning team and probabilistic ratings in Dota 2 and Counter-Strike: Global Offensive video games. Analysis of Images, Social Networks and Texts (AIST 2017), LNCS 10716, Springer: 183-196. *(gecontroleerd 2026-11-15: bestaan)*
- Mangel, M.; Samaniego, F. J. (1984). Abraham Wald's work on aircraft survivability. Journal of the American Statistical Association 79(386): 259-267. *(gecontroleerd 2026-11-15: detail)*
- Mann, H. B.; Whitney, D. R. (1947). On a test of whether one of two random variables is stochastically larger than the other. Annals of Mathematical Statistics 18(1): 50-60. *(gecontroleerd 2026-11-15: detail)*
- Manski, C. F. (1993). Identification of endogenous social effects: the reflection problem. Review of Economic Studies 60(3): 531-542. doi:10.2307/2298123 *(gecontroleerd 2026-11-15: detail)*
- Manstein, E. von (1958). Lost Victories. Methuen, London. *(gecontroleerd 2026-11-15: detail)*
- Mao Tse-tung (vert. Griffith, S. B.) (1961). On Guerrilla Warfare (oorspr. 1937). Praeger, New York. *(gecontroleerd 2026-11-15: bestaan)*
- Marshall, S. L. A. (1947). Men Against Fire: The Problem of Battle Command in Future War. William Morrow, New York. *(gecontroleerd 2026-11-15: detail)*
- Marshall, S. L. A. (1956). Pork Chop Hill: The American Fighting Man in Action, Korea, Spring 1953. William Morrow, New York. *(gecontroleerd 2026-11-15: detail)*
- Martin, C.; Parker, G. (1988). The Spanish Armada. Hamish Hamilton, London. *(gecontroleerd 2026-11-15: detail)*
- Matthews, M. M. (2006). Operation AL FAJR: A Study in Army and Marine Corps Joint Operations. Combat Studies Institute Press, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Matthews, M. M. (2008). We Were Caught Unprepared: The 2006 Hezbollah-Israeli War (Long War Series Occasional Paper 26). Combat Studies Institute Press, Fort Leavenworth. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Mattingly, G. (1959). The Armada. Houghton Mifflin, Boston. *(gecontroleerd 2026-11-15: detail)*
- May, E. R. (2000). Strange Victory: Hitler's Conquest of France. Hill & Wang, New York. *(gecontroleerd 2026-11-15: detail)*
- Maymin, P. Z. (2021). Smart kills and worthless deaths: eSports analytics for League of Legends. Journal of Quantitative Analysis in Sports 17(1): 11-27. doi:10.1515/jqas-2019-0096 *(gecontroleerd 2026-11-15: detail)*
- McCloskey, J. F. (1987). The beginnings of operations research: 1934-1941. Operations Research 35(1): 143-152. *(gecontroleerd 2026-11-15: detail)*
- McCullagh, P.; Nelder, J. A. (1989). Generalized Linear Models (2e dr.). Chapman & Hall, London. *(gecontroleerd 2026-11-15: detail)*
- McFarland, S. L.; Newton, W. P. (1991). To Command the Sky: The Battle for Air Superiority over Germany, 1942-1944. Smithsonian Institution Press, Washington DC. *(gecontroleerd 2026-11-15: detail)*
- Mearsheimer, J. J. (1989). Assessing the conventional balance: the 3:1 rule and its critics. International Security 13(4): 54-89 (lente 1989). doi:10.2307/2538780 *(gecontroleerd 2026-11-15: detail)*
- Medler, B.; John, M.; Lane, J. (2011). Data Cracker: developing a visual game analytic tool for analyzing online gameplay. Proc. CHI 2011, ACM: 2365-2374. *(gecontroleerd 2026-11-15: bestaan)*
- Michaels, J. (2010). A Chance in Hell: The Men Who Triumphed over Iraq's Deadliest City and Turned the Tide of War. St. Martin's Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Michel, M. L. (1997). Clashes: Air Combat over North Vietnam 1965-1972. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Michel, M. L. (2002). The Eleven Days of Christmas: America's Last Vietnam Battle. Encounter Books, San Francisco. *(gecontroleerd 2026-11-15: detail)*
- Middlebrook, M. (1971). The First Day on the Somme. Allen Lane, London. *(gecontroleerd 2026-11-15: detail)*
- Middlebrook, M. (1973). The Nuremberg Raid, 30-31 March 1944. Allen Lane, London. *(gecontroleerd 2026-11-15: detail)*
- Middlebrook, M. (1980). The Battle of Hamburg: Allied Bomber Forces Against a German City in 1943. Allen Lane, London. *(gecontroleerd 2026-11-15: detail)*
- Middlebrook, M. (1983). The Schweinfurt-Regensburg Mission. Allen Lane, London. *(gecontroleerd 2026-11-15: detail)*
- Middlebrook, M.; Mahoney, P. (1977). Battleship: The Loss of the Prince of Wales and the Repulse. Allen Lane, London. *(gecontroleerd 2026-11-15: detail)*
- Milgram, S.; Bickman, L.; Berkowitz, L. (1969). Note on the drawing power of crowds of different size. Journal of Personality and Social Psychology 13(2): 79-82. doi:10.1037/h0028070 *(gecontroleerd 2026-11-15: detail)*
- Miller, A.; Bornn, L.; Adams, R.; Goldsberry, K. (2014). Factorized point process intensities: a spatial analysis of professional basketball. Proc. 31st International Conference on Machine Learning (ICML 2014), PMLR 32: 235-243. *(gecontroleerd 2026-11-15: detail)*
- Miller, J. B.; Sanjurjo, A. (2018). Surprised by the hot hand fallacy? A truth in the law of small numbers. Econometrica 86(6): 2019-2047. doi:10.3982/ECTA14943 *(gecontroleerd 2026-11-15: detail)*
- Miller, J. L.; Crowcroft, J. (2009). Avatar movement in World of Warcraft battlegrounds. Proc. 8th Workshop on Network and System Support for Games (NetGames 2009), IEEE: 1-6. doi:10.1109/NETGAMES.2009.5446226 *(gecontroleerd 2026-11-15: bestaan)*
- Minka, T.; Cleven, R.; Zaykov, Y. (2018). TrueSkill 2: an improved Bayesian skill rating system (MSR-TR-2018-8). Microsoft Research, Redmond. *(gecontroleerd 2026-11-15: bestaan)*
- Mohammed, S.; Ferzandi, L.; Hamilton, K. (2010). Metaphor no more: a 15-year review of the team mental model construct. Journal of Management 36(4): 876-910. doi:10.1177/0149206309356804 *(gecontroleerd 2026-11-15: detail)*
- Montross, L.; Canzona, N. A. (1957). The Chosin Reservoir Campaign (US Marine Operations in Korea 1950-1953, deel III). Historical Branch, US Marine Corps, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Moore, H. G.; Galloway, J. L. (1992). We Were Soldiers Once... and Young. Random House, New York. *(gecontroleerd 2026-11-15: detail)*
- Moran, P. A. P. (1950). Notes on continuous stochastic phenomena. Biometrika 37(1/2): 17-23. *(gecontroleerd 2026-11-15: detail)*
- Morillo, S. (red.) (1996). The Battle of Hastings: Sources and Interpretations. Boydell Press, Woodbridge. *(gecontroleerd 2026-11-15: detail)*
- Morison, S. E. (1948). The Rising Sun in the Pacific, 1931-April 1942 (History of US Naval Operations in WWII, deel 3). Little, Brown, Boston. *(gecontroleerd 2026-11-15: detail)*
- Morison, S. E. (1949). Coral Sea, Midway and Submarine Actions, May 1942-August 1942 (History of US Naval Operations in WWII, deel 4). Little, Brown, Boston. *(gecontroleerd 2026-11-15: bestaan)*
- Morison, S. E. (1949). The Struggle for Guadalcanal, August 1942-February 1943 (History of US Naval Operations in WWII, deel 5). Little, Brown, Boston. *(gecontroleerd 2026-11-15: bestaan)*
- Morison, S. E. (1950). Breaking the Bismarcks Barrier, 22 July 1942-1 May 1944 (History of US Naval Operations in WWII, deel 6). Little, Brown, Boston. *(gecontroleerd 2026-11-15: detail)*
- Morison, S. E. (1953). New Guinea and the Marianas, March 1944-August 1944 (History of US Naval Operations in WWII, deel 8). Little, Brown, Boston. *(gecontroleerd 2026-11-15: detail)*
- Morison, S. E. (1958). Leyte, June 1944-January 1945 (History of US Naval Operations in WWII, deel 12). Little, Brown, Boston. *(gecontroleerd 2026-11-15: bestaan)*
- Morison, S. E. (1960). Victory in the Pacific, 1945 (History of US Naval Operations in WWII, deel 14). Little, Brown, Boston. *(gecontroleerd 2026-11-15: detail)*
- Morse, P. M.; Kimball, G. E. (1951). Methods of Operations Research. Technology Press of MIT and John Wiley & Sons, New York, 1951. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Moussaïd, M.; Helbing, D.; Theraulaz, G. (2011). How simple rules determine pedestrian behavior and crowd disasters. Proceedings of the National Academy of Sciences 108(17): 6884-6888. doi:10.1073/pnas.1016507108 *(gecontroleerd 2026-11-15: detail)*
- Moussaïd, M.; Perozo, N.; Garnier, S.; Helbing, D.; Theraulaz, G. (2010). The walking behaviour of pedestrian social groups and its impact on crowd dynamics. PLoS ONE 5(4): e10047. doi:10.1371/journal.pone.0010047 *(gecontroleerd 2026-11-15: detail)*
- Mueller, K. P. (red.) (2015). Precision and Purpose: Airpower in the Libyan Civil War (RR-676-AF). RAND Corporation, Santa Monica. *(gecontroleerd 2026-11-15: detail)*
- Mullen, B.; Copper, C. (1994). The relation between group cohesiveness and performance: an integration. Psychological Bulletin 115(2): 210-227. doi:10.1037/0033-2909.115.2.210 *(gecontroleerd 2026-11-15: detail)*
- Murray, W. (1983). Strategy for Defeat: The Luftwaffe 1933-1945. Air University Press, Maxwell AFB. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Murray, W.; Woods, K. M. (2014). The Iran-Iraq War: A Military and Strategic History. Cambridge University Press, Cambridge. *(gecontroleerd 2026-11-15: detail)*
- Nagy, M.; Ákos, Z.; Biro, D.; Vicsek, T. (2010). Hierarchical group dynamics in pigeon flocks. Nature 464(7290): 890-893. doi:10.1038/nature08891 *(gecontroleerd 2026-11-15: detail)*
- Nash, D. E. (2002). Hell's Gate: The Battle of the Cherkassy Pocket, January-February 1944. RZM Imports, Stamford, CT. *(gecontroleerd 2026-11-15: detail)*
- Naylor, S. (2005). Not a Good Day to Die: The Untold Story of Operation Anaconda. Berkley Books, New York. *(gecontroleerd 2026-11-15: detail)*
- Nelder, J. A.; Wedderburn, R. W. M. (1972). Generalized linear models. Journal of the Royal Statistical Society A 135(3): 370-384. *(gecontroleerd 2026-11-15: detail)*
- Newman, M. E. J. (2003). The structure and function of complex networks. SIAM Review 45(2): 167-256. doi:10.1137/S003614450342480 *(gecontroleerd 2026-11-15: detail)*
- Nolan, K. W. (1983). Battle for Hue: Tet, 1968. Presidio Press, Novato. *(gecontroleerd 2026-11-15: detail)*
- Nolan, K. W. (1986). Into Laos: The Story of Dewey Canyon II/Lam Son 719, Vietnam 1971. Presidio Press, Novato. *(gecontroleerd 2026-11-15: detail)*
- Nordeen, L. O. (1990). Fighters over Israel. Orion Books, New York. *(gecontroleerd 2026-11-15: detail)*
- O'Neill, R. (1985). Australia in the Korean War 1950-53, Volume II: Combat Operations. Australian War Memorial and Australian Government Publishing Service, Canberra. *(gecontroleerd 2026-11-15: bestaan)*
- Oliker, O. (2001). Russia's Chechen Wars 1994-2000: Lessons from Urban Combat (MR-1289-A). RAND Corporation, Santa Monica. *(gecontroleerd 2026-11-15: detail)*
- Openshaw, S. (1984). The Modifiable Areal Unit Problem (CATMOG 38). Geo Books, Norwich. *(gecontroleerd 2026-11-15: detail)*
- Ord, J. K.; Getis, A. (1995). Local spatial autocorrelation statistics: distributional issues and an application. Geographical Analysis 27(4): 286-306. *(gecontroleerd 2026-11-15: detail)*
- Oren, M. B. (2002). Six Days of War: June 1967 and the Making of the Modern Middle East. Oxford University Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Osinga, F. P. B. (2007). Science, Strategy and War: The Strategic Theory of John Boyd. Routledge, Abingdon. *(gecontroleerd 2026-11-15: detail)*
- Osipov, M. (vert. Helmbold, R. L.; Rehm, A. S.) (1995). The influence of the numerical strength of engaged forces on their casualties (oorspr. 1915). Naval Research Logistics 42(3): 435-490. *(gecontroleerd 2026-11-15: detail)*
- Overy, R. (2000). The Battle. Penguin, London, 2000. US edition: W. W. Norton, New York, 2001, as 'The Battle of Britain: The Myth and the Reality'. *(gecontroleerd 2026-11-15: detail)*
- Overy, R. (2013). The Bombing War: Europe 1939-1945. Allen Lane, London. *(gecontroleerd 2026-11-15: detail)*
- Paine, S. C. M. (2003). The Sino-Japanese War of 1894-1895: Perceptions, Power, and Primacy. Cambridge University Press, Cambridge. *(gecontroleerd 2026-11-15: detail)*
- Pakdaman Naeini, M.; Cooper, G. F.; Hauskrecht, M. (2015). Obtaining well calibrated probabilities using Bayesian binning. Proceedings of the AAAI Conference on Artificial Intelligence 29(1). doi:10.1609/aaai.v29i1.9602 *(gecontroleerd 2026-11-15: detail)*
- Pakenham, T. (1979). The Boer War. Weidenfeld & Nicolson, London. *(gecontroleerd 2026-11-15: detail)*
- Palacios-Huerta, I. (2003). Professionals play minimax. Review of Economic Studies 70(2): 395-415. doi:10.1111/1467-937X.00249 *(gecontroleerd 2026-11-15: detail)*
- Pape, R. A. (1996). Bombing to Win: Air Power and Coercion in War. Cornell University Press, Ithaca. *(gecontroleerd 2026-11-15: detail)*
- Parshall, J. B.; Tully, A. P. (2005). Shattered Sword: The Untold Story of the Battle of Midway. Potomac Books, Washington DC. *(gecontroleerd 2026-11-15: detail)*
- Paskiv, V.; Zanevskyy, I.; Koman, V. (2026). Differentiating playing roles in professional Counter-Strike 2 by performance indicators: an observational study. Health, Sport, Rehabilitation. doi:10.58962/hsr.1395 *(gecontroleerd 2026-11-15: detail)*
- PC Gamer (2013). The International 2013: Grand Finals in review. PC Gamer. https://www.pcgamer.com/the-international-2013-grand-finals-in-review *(gecontroleerd 2026-11-15: detail)*
- PC Gamer (2016). The best CS:GO plays of 2016. PC Gamer. https://www.pcgamer.com/the-best-csgo-plays-of-2016 *(gecontroleerd 2026-11-15: detail)*
- Perla, P. P. (1990). The Art of Wargaming. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Perla, P. P.; McGrady, E. D. (2011). Why wargaming works. Naval War College Review 64(3): 111-130. *(gecontroleerd 2026-11-15: detail)*
- Phipson, B.; Smyth, G. K. (2010). Permutation p-values should never be zero: calculating exact p-values when permutations are randomly drawn. Statistical Applications in Genetics and Molecular Biology 9(1): Article 39. doi:10.2202/1544-6115.1585 *(gecontroleerd 2026-11-15: detail)*
- Playfair, I. S. O.; Flynn, F. C.; Molony, C. J. C.; Gleave, T. P. (1960). The Mediterranean and Middle East, Volume III: British Fortunes Reach Their Lowest Ebb (History of the Second World War). HMSO, London. *(gecontroleerd 2026-11-15: detail)*
- Playfair, I. S. O.; Stitt, G. M. S.; Molony, C. J. C.; Toomer, S. E. (1954). The Mediterranean and Middle East, Volume I: The Early Successes against Italy (History of the Second World War). HMSO, London. *(gecontroleerd 2026-11-15: detail)*
- Plutarch (vert. Perrin, B.) (1916). Lives, Volume III: Pericles and Fabius Maximus, Nicias and Crassus (Loeb Classical Library). Heinemann, London; Macmillan, New York. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Pollack, K. M. (2002). Arabs at War: Military Effectiveness, 1948-1991. University of Nebraska Press, Lincoln. *(gecontroleerd 2026-11-15: detail)*
- Pollard, R.; Reep, C. (1997). Measuring the effectiveness of playing strategies at soccer. Journal of the Royal Statistical Society D 46(4): 541-550. *(gecontroleerd 2026-11-15: detail)*
- Polybius (vert. Shuckburgh, E. S.) (1889). The Histories of Polybius. Macmillan, London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Pope, D. (1956). The Battle of the River Plate. William Kimber, London. *(gecontroleerd 2026-11-15: detail)*
- Pope, D. G.; Schweitzer, M. E. (2011). Is Tiger Woods loss averse? Persistent bias in the face of experience, competition, and high stakes. American Economic Review 101(1): 129-157. doi:10.1257/aer.101.1.129 *(gecontroleerd 2026-11-15: detail)*
- Post, T.; van den Assem, M. J.; Baltussen, G.; Thaler, R. H. (2008). Deal or No Deal? Decision making under risk in a large-payoff game show. American Economic Review 98(1): 38-71. doi:10.1257/aer.98.1.38 *(gecontroleerd 2026-11-15: detail)*
- Prados, J.; Stubbe, R. W. (1991). Valley of Decision: The Siege of Khe Sanh. Houghton Mifflin, Boston. *(gecontroleerd 2026-11-15: detail)*
- Prange, G. W. (1981). At Dawn We Slept: The Untold Story of Pearl Harbor. McGraw-Hill, New York. *(gecontroleerd 2026-11-15: detail)*
- Prior, R.; Wilson, T. (1992). Command on the Western Front: The Military Career of Sir Henry Rawlinson, 1914-1918. Blackwell, Oxford. *(gecontroleerd 2026-11-15: detail)*
- Putney, D. T. (2004). Airpower Advantage: Planning the Gulf War Air Campaign, 1989-1991. Air Force History and Museums Program, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Quarantelli, E. L. (1954). The nature and conditions of panic. American Journal of Sociology 60(3): 267-275. doi:10.1086/221536 *(gecontroleerd 2026-11-15: detail)*
- Rabinovich, A. (1988). The Boats of Cherbourg. Seaver Books, New York. *(gecontroleerd 2026-11-15: detail)*
- Rabinovich, A. (2004). The Yom Kippur War: The Epic Encounter That Transformed the Middle East. Schocken, New York. *(gecontroleerd 2026-11-15: detail)*
- Rathke, A. (2017). An examination of expected goals and shot efficiency in soccer. Journal of Human Sport and Exercise 12(Proc2). doi:10.14198/jhse.2017.12.proc2.05 *(gecontroleerd 2026-11-15: detail)*
- Reep, C.; Benjamin, B. (1968). Skill and chance in association football. Journal of the Royal Statistical Society A 131(4): 581-585. *(gecontroleerd 2026-11-15: detail)*
- Reiter, D.; Stam, A. C. (2002). Democracies at War. Princeton University Press, Princeton. *(gecontroleerd 2026-11-15: detail)*
- Reynolds, C. W. (1987). Flocks, herds and schools: a distributed behavioral model. Proceedings of SIGGRAPH '87 (Computer Graphics 21(4)): 25-34. doi:10.1145/37401.37406 *(gecontroleerd 2026-11-15: detail)*
- Reynolds, N. E. (2005). Basrah, Baghdad, and Beyond: The U.S. Marine Corps in the Second Iraq War. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Riot Games (2013). Road to Worlds: Korea regionals recap. League of Legends Nexus. https://nexus.leagueoflegends.com/en-us/2013/09/road-to-worlds-korea-regionals-recap/ *(gecontroleerd 2026-11-15: detail)*
- Rioult, F.; Métivier, J.-P.; Helleu, B.; Scelles, N.; Durand, C. (2014). Mining tracks of competitive video games. AASRI Procedia 8: 82-87. *(gecontroleerd 2026-11-15: detail)*
- Ripley, B. D. (1977). Modelling spatial patterns. Journal of the Royal Statistical Society B 39(2): 172-212. *(gecontroleerd 2026-11-15: detail)*
- Robberechts, P.; Van Haaren, J.; Davis, J. (2021). A Bayesian approach to in-game win probability in soccer. Proceedings of the 27th ACM SIGKDD Conference on Knowledge Discovery & Data Mining: 3512-3521. doi:10.1145/3447548.3467194 *(gecontroleerd 2026-11-15: detail)*
- Roberts, M. (1958). Gustavus Adolphus: A History of Sweden, 1611-1632, Volume II. Longmans, Green, London. *(gecontroleerd 2026-11-15: detail)*
- Robinson, L. (2004). Masters of Chaos: The Secret History of the Special Forces. PublicAffairs, New York. *(gecontroleerd 2026-11-15: detail)*
- Romjue, J. L. (1984). From Active Defense to AirLand Battle: The Development of Army Doctrine 1973-1982. US Army Training and Doctrine Command Historical Office, Fort Monroe. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Rommel, E. (1937). Infanterie greift an (Infantry Attacks). Voggenreiter, Potsdam. *(gecontroleerd 2026-11-15: detail)*
- Rosenau, W. (2001). Special Operations Forces and Elusive Enemy Ground Targets: Lessons from Vietnam and the Persian Gulf War (MR-1408-AF). RAND Corporation, Santa Monica. *(gecontroleerd 2026-11-15: bestaan)*
- Roskill, S. W. (1954). The War at Sea 1939-1945, deel 1: The Defensive. HMSO, London. *(gecontroleerd 2026-11-15: bestaan)*
- Roskill, S. W. (1956). The War at Sea 1939-1945, deel 2: The Period of Balance. HMSO, London. *(gecontroleerd 2026-11-15: bestaan)*
- Roskill, S. W. (1960). The War at Sea 1939-1945, deel 3, deel 1: The Offensive. HMSO, London. *(gecontroleerd 2026-11-15: bestaan)*
- Rotte, R.; Schmidt, C. M. (2003). On the production of victory: empirical determinants of battlefield success in modern war. Defence and Peace Economics 14(3): 175-192. doi:10.1080/1024269022000000868 *(gecontroleerd 2026-11-15: detail)*
- Rowland, D. (2006). The Stress of Battle: Quantifying Human Performance in Combat. The Stationery Office, London. *(gecontroleerd 2026-11-15: detail)*
- Ryan, C. (1974). A Bridge Too Far. Simon & Schuster, New York. *(gecontroleerd 2026-11-15: detail)*
- Salas, E.; Sims, D. E.; Burke, C. S. (2005). Is there a "Big Five" in teamwork?. Small Group Research 36(5): 555-599. doi:10.1177/1046496405277134 *(gecontroleerd 2026-11-15: detail)*
- Salen, K.; Zimmerman, E. (2003). Rules of Play: Game Design Fundamentals. MIT Press, Cambridge MA. *(gecontroleerd 2026-11-15: detail)*
- Salganik, M. J.; Dodds, P. S.; Watts, D. J. (2006). Experimental study of inequality and unpredictability in an artificial cultural market. Science 311(5762): 854-856. doi:10.1126/science.1121066 *(gecontroleerd 2026-11-15: detail)*
- Salmon, A. (2009). To the Last Round: The Epic British Stand on the Imjin River, Korea 1951. Aurum Press, London. *(gecontroleerd 2026-11-15: detail)*
- Scales, R. H. (1993). Certain Victory: The United States Army in the Gulf War. Office of the Chief of Staff, US Army, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Schell, J. (2008). The Art of Game Design: A Book of Lenses. Morgan Kaufmann, Burlington. *(gecontroleerd 2026-11-15: detail)*
- Schubert, M.; Drachen, A.; Mahlmann, T. (2016). Esports analytics through encounter detection. MIT Sloan Sports Analytics Conference 2016. *(gecontroleerd 2026-11-15: bestaan)*
- Sears, S. W. (1983). Landscape Turned Red: The Battle of Antietam. Ticknor & Fields, New Haven. *(gecontroleerd 2026-11-15: detail)*
- Sears, S. W. (1996). Chancellorsville. Houghton Mifflin, Boston. *(gecontroleerd 2026-11-15: detail)*
- Seif El-Nasr, M.; Drachen, A.; Canossa, A. (red.) (2013). Game Analytics: Maximizing the Value of Player Data. Springer, London. *(gecontroleerd 2026-11-15: detail)*
- Seif El-Nasr, M.; Nguyen, T.-H. D.; Canossa, A.; Drachen, A. (2021). Game Data Science. Oxford University Press, Oxford. *(gecontroleerd 2026-11-15: detail)*
- Semenov, A.; Romov, P.; Korolev, S.; Yashkov, D.; Neklyudov, K. (2017). Performance of machine learning algorithms in predicting game outcome from drafts in Dota 2. Analysis of Images, Social Networks and Texts (AIST 2016), CCIS 661, Springer: 26-37. *(gecontroleerd 2026-11-15: bestaan)*
- Seyfried, A.; Steffen, B.; Klingsch, W.; Boltes, M. (2005). The fundamental diagram of pedestrian movement revisited. Journal of Statistical Mechanics: Theory and Experiment 2005(10): P10002. doi:10.1088/1742-5468/2005/10/P10002 *(gecontroleerd 2026-11-15: detail)*
- Shaikh, S.; Rumbaugh, W. (2020). The Air and Missile War in Nagorno-Karabakh: Lessons for the Future of Strike and Defense. Center for Strategic and International Studies, Washington DC. *(gecontroleerd 2026-11-15: bestaan)*
- Shaw, R. L. (1985). Fighter Combat: Tactics and Maneuvering. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Shils, E. A.; Janowitz, M. (1948). Cohesion and disintegration in the Wehrmacht in World War II. Public Opinion Quarterly 12(2): 280-315. doi:10.1086/265951 *(gecontroleerd 2026-11-15: detail)*
- Showalter, D. E. (1991). Tannenberg: Clash of Empires. Archon Books, Hamden. *(gecontroleerd 2026-11-15: detail)*
- Showalter, D. E. (1996). The Wars of Frederick the Great. Longman, London. *(gecontroleerd 2026-11-15: detail)*
- Shulimson, J.; Blasiol, L. A.; Smith, C. R.; Dawson, D. A. (1997). U.S. Marines in Vietnam: The Defining Year, 1968. History and Museums Division, US Marine Corps, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Siborne, W. (1844). History of the War in France and Belgium in 1815. T. & W. Boone, London. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Siebold, G. L. (2007). The essence of military group cohesion. Armed Forces & Society 33(2): 286-295. doi:10.1177/0095327X06294173 *(gecontroleerd 2026-11-15: detail)*
- Sill, J. (2010). Improved NBA adjusted +/- using regularization and out-of-sample testing. MIT Sloan Sports Analytics Conference 2010. https://www.sloansportsconference.com/research-papers/improved-nba-adjusted-using-regularization-and-out-of-sample-testing *(gecontroleerd 2026-11-15: bestaan)*
- Silva, A. L. C.; Pappa, G. L.; Chaimowicz, L. (2018). Continuous outcome prediction of League of Legends competitive matches using recurrent neural networks. SBGames 2018, Computing Track (short paper). http://www.sbgames.org/sbgames2018/files/papers/ComputacaoShort/188226.pdf *(gecontroleerd 2026-11-15: detail)*
- Silverman, B. W. (1986). Density Estimation for Statistics and Data Analysis. Chapman & Hall, London. *(gecontroleerd 2026-11-15: detail)*
- Sirlin, D. (2006). Playing to Win: Becoming the Champion. Lulu.com. *(gecontroleerd 2026-11-15: detail)*
- Smail, R. C. (1956). Crusading Warfare, 1097-1193. Cambridge University Press, Cambridge. *(gecontroleerd 2026-11-15: detail)*
- Smith, G.; Levere, M.; Kurtzman, R. (2009). Poker player behavior after big wins and big losses. Management Science 55(9): 1547-1555. doi:10.1287/mnsc.1090.1044 *(gecontroleerd 2026-11-15: detail)*
- Smith, R. R. (1963). Triumph in the Philippines (US Army in World War II). Office of the Chief of Military History, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Spearman, W. (2018). Beyond expected goals. MIT Sloan Sports Analytics Conference 2018. *(gecontroleerd 2026-11-15: detail)*
- Special Operations Review Group (Holloway, J. L., voorzitter) (1980). Rescue Mission Report. Joint Chiefs of Staff, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Starcke, K.; Brand, M. (2012). Decision making under stress: a selective review. Neuroscience & Biobehavioral Reviews 36(4): 1228-1248. doi:10.1016/j.neubiorev.2012.02.003 *(gecontroleerd 2026-11-15: detail)*
- Stone, L. D. (1975). Theory of Optimal Search. Academic Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Stone, L. D.; Keller, C. M.; Kratzke, T. M.; Strumpfer, J. P. (2014). Search for the wreckage of Air France flight AF 447. Statistical Science 29(1): 69-80. doi:10.1214/13-STS420 *(gecontroleerd 2026-11-15: detail)*
- Stouffer, S. A.; et al. (1949). The American Soldier, Volume II: Combat and Its Aftermath. Princeton University Press, Princeton. *(gecontroleerd 2026-11-15: detail)*
- Strauss, B. (2004). The Battle of Salamis. Simon & Schuster, New York. *(gecontroleerd 2026-11-15: detail)*
- Sumption, J. (1990). The Hundred Years War, Volume I: Trial by Battle. Faber & Faber, London. *(gecontroleerd 2026-11-15: bestaan)*
- Sun Tzu (vert. Giles, L.) (1910). The Art of War. Luzac & Co., London. https://www.gutenberg.org/ebooks/132 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Sweetman, J. (1982). Operation Chastise: The Dams Raid, Epic or Myth. Jane's, London. *(gecontroleerd 2026-11-15: detail)*
- Szell, M.; Lambiotte, R.; Thurner, S. (2010). Multirelational organization of large-scale social networks in an online world. Proceedings of the National Academy of Sciences 107(31): 13636-13641. doi:10.1073/pnas.1004008107 *(gecontroleerd 2026-11-15: detail)*
- Tacitus (vert. Church, A. J.; Brodribb, W. J.) (1876). The Annals. Macmillan, London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Taki, T.; Hasegawa, J.; Fukumura, T. (1996). Development of motion analysis system for quantitative evaluation of teamwork in soccer games. Proc. IEEE International Conference on Image Processing (ICIP 1996). *(gecontroleerd 2026-11-15: detail)*
- Tapper, J. (2012). The Outpost: An Untold Story of American Valor. Little, Brown, New York. *(gecontroleerd 2026-11-15: detail)*
- Taylor, J. G. (1983). Lanchester Models of Warfare (2 delen). Operations Research Society of America, Military Applications Section, Arlington VA. *(gecontroleerd 2026-11-15: detail)*
- Taylor, T. L. (2012). Raising the Stakes: E-Sports and the Professionalization of Computer Gaming. MIT Press, Cambridge MA. *(gecontroleerd 2026-11-15: detail)*
- Thaler, R. H.; Johnson, E. J. (1990). Gambling with the house money and trying to break even: the effects of prior outcomes on risky choice. Management Science 36(6): 643-660. doi:10.1287/mnsc.36.6.643 *(gecontroleerd 2026-11-15: detail)*
- Thompson, W. W. (2000). To Hanoi and Back: The United States Air Force and North Vietnam, 1966-1973. Air Force History and Museums Program, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Till, G. (2018). Seapower: A Guide for the Twenty-First Century (4e dr.). Routledge, Abingdon. *(gecontroleerd 2026-11-15: detail)*
- Tobler, W. R. (1970). A computer movie simulating urban growth in the Detroit region. Economic Geography 46 (supplement): 234-240. *(gecontroleerd 2026-11-15: detail)*
- Tokey, S. S.; Chen, Z.-S.; Mettler, C.; Tang, D.-X.; Boudaoud, B.; Kim, J.; Spjut, J.; Claypool, M. (2024). The effects of network latency on the peeker's advantage in first-person shooter games. Proceedings of the 19th International Conference on the Foundations of Digital Games (FDG 2024). doi:10.1145/3649921.3650002 *(gecontroleerd 2026-11-15: detail)*
- Totten, C. W. (2019). An Architectural Approach to Level Design (2e dr.). CRC Press, Boca Raton. *(gecontroleerd 2026-11-15: detail)*
- Trask, D. F. (1981). The War with Spain in 1898. Macmillan, New York. *(gecontroleerd 2026-11-15: detail)*
- Travers, T. (2001). Gallipoli 1915. Tempus, Stroud. *(gecontroleerd 2026-11-15: detail)*
- Triandafillov, V. K. (vert. Kipp, W. A.) (1994). The Nature of the Operations of Modern Armies (oorspr. 1929). Frank Cass, Ilford. *(gecontroleerd 2026-11-15: detail)*
- Trotter, W. R. (1991). A Frozen Hell: The Russo-Finnish Winter War of 1939-1940. Algonquin Books, Chapel Hill. *(gecontroleerd 2026-11-15: detail)*
- Tully, A. P. (2009). Battle of Surigao Strait. Indiana University Press, Bloomington. *(gecontroleerd 2026-11-15: detail)*
- Tunstrøm, K.; Katz, Y.; Ioannou, C. C.; Huepe, C.; Lutz, M. J.; Couzin, I. D. (2013). Collective states, multistability and transitional behavior in schooling fish. PLoS Computational Biology 9(2): e1002915. doi:10.1371/journal.pcbi.1002915 *(gecontroleerd 2026-11-15: detail)*
- Turnbull, S. (2003). Tannenberg 1410: Disaster for the Teutonic Knights (Campaign 122). Osprey, Oxford. *(gecontroleerd 2026-11-15: detail)*
- Turner, A.; Doxa, M.; O'Sullivan, D.; Penn, A. (2001). From isovists to visibility graphs: a methodology for the analysis of architectural space. Environment and Planning B 28(1): 103-121. *(gecontroleerd 2026-11-15: detail)*
- Tversky, A.; Kahneman, D. (1992). Advances in prospect theory: cumulative representation of uncertainty. Journal of Risk and Uncertainty 5(4): 297-323. doi:10.1007/BF00122574 *(gecontroleerd 2026-11-15: detail)*
- Upcomer (2018). CSGO 2018 retrospective: the reign of Astralis. Upcomer. https://upcomer.com/csgo-2018-retrospective-astralis/ *(gecontroleerd 2026-11-15: bestaan)*
- US Marine Corps (1997). MCDP 1 Warfighting. Headquarters USMC, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- US Navy Department (1898). Official Records of the Union and Confederate Navies in the War of the Rebellion, Series I, deel 7. Government Printing Office, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- US War Department (1888). The War of the Rebellion: Official Records of the Union and Confederate Armies, Series I deel 21 (Fredericksburg). Government Printing Office, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- van Creveld, M. (1982). Fighting Power: German and U.S. Army Performance, 1939-1945. Greenwood Press, Westport. *(gecontroleerd 2026-11-15: detail)*
- Vegetius (vert. Clarke, J.) (1767). De Re Militari (The Military Institutions of the Romans). W. Griffin, London. *(publiek domein)* *(gecontroleerd 2026-11-15: bestaan)*
- Vego, M. N. (2007). Joint Operational Warfare: Theory and Practice. Naval War College, Newport. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Venkus, R. E. (1992). Raid on Qaddafi. St. Martin's Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Vicsek, T.; Czirók, A.; Ben-Jacob, E.; Cohen, I.; Shochet, O. (1995). Novel type of phase transition in a system of self-driven particles. Physical Review Letters 75(6): 1226-1229. doi:10.1103/PhysRevLett.75.1226 *(gecontroleerd 2026-11-15: detail)*
- Vicsek, T.; Zafeiris, A. (2012). Collective motion. Physics Reports 517(3-4): 71-140. doi:10.1016/j.physrep.2012.03.004 *(gecontroleerd 2026-11-15: detail)*
- Vinyals, O.; Babuschkin, I.; Czarnecki, W. M.; et al. (2019). Grandmaster level in StarCraft II using multi-agent reinforcement learning. Nature 575(7782): 350-354. doi:10.1038/s41586-019-1724-z *(gecontroleerd 2026-11-15: detail)*
- von Neumann, J.; Morgenstern, O. (1944). Theory of Games and Economic Behavior. Princeton University Press, Princeton. *(gecontroleerd 2026-11-15: detail)*
- Waddington, C. H. (1973). O.R. in World War 2: Operational Research against the U-Boat. Elek Science, London. *(gecontroleerd 2026-11-15: detail)*
- Wald, A.; Wolfowitz, J. (1940). On a test whether two samples are from the same population. Annals of Mathematical Statistics 11(2): 147-162. doi:10.1214/aoms/1177731909 *(gecontroleerd 2026-11-15: detail)*
- Walker, M.; Wooders, J. (2001). Minimax play at Wimbledon. American Economic Review 91(5): 1521-1538. doi:10.1257/aer.91.5.1521 *(gecontroleerd 2026-11-15: detail)*
- Wallner, G. (red.) (2019). Data Analytics Applications in Gaming and Entertainment. CRC Press, Boca Raton. *(gecontroleerd 2026-11-15: bestaan)*
- Wallner, G.; Kriglstein, S. (2013). Visualization-based analysis of gameplay data - a review of literature. Entertainment Computing 4(3): 143-155. *(gecontroleerd 2026-11-15: detail)*
- Wallner, G.; Kriglstein, S. (2014). PLATO: a visual analytics system for gameplay data. Computers & Graphics 38: 341-356. *(gecontroleerd 2026-11-15: bestaan)*
- Warden, J. A. (1988). The Air Campaign: Planning for Combat. National Defense University Press, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Washburn, A. R. (2002). Search and Detection (4e dr.). INFORMS / Military Applications Section, Linthicum MD. *(gecontroleerd 2026-11-15: bestaan)*
- Washburn, A.; Kress, M. (2009). Combat Modeling. Springer, New York. *(gecontroleerd 2026-11-15: detail)*
- Watling, J.; Reynolds, N. (2022). Operation Z: The Death Throes of an Imperial Delusion. Royal United Services Institute, London (Special Report, April 2022). *(gecontroleerd 2026-11-15: bestaan)*
- Watling, J.; Reynolds, N. (2022). Ukraine at War: Paving the Road from Survival to Victory. Royal United Services Institute, London. *(gecontroleerd 2026-11-15: detail)*
- Watling, J.; Reynolds, N. (2023). Meatgrinder: Russian Tactics in the Second Year of Its Invasion of Ukraine. Royal United Services Institute, London. *(gecontroleerd 2026-11-15: detail)*
- Watling, J.; Reynolds, N. (2023). Stormbreak: Fighting Through Russian Defences in Ukraine's 2023 Offensive. Royal United Services Institute, London. *(gecontroleerd 2026-11-15: detail)*
- Wawro, G. (1996). The Austro-Prussian War: Austria's War with Prussia and Italy in 1866. Cambridge University Press, Cambridge. *(gecontroleerd 2026-11-15: detail)*
- Weapons Systems Evaluation Group (1967). Project Red Baron: Air-to-Air Encounters in Southeast Asia, Volume I (WSEG Report 116). Weapons Systems Evaluation Group, Washington DC (DTIC). *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Weiss, H. K. (1966). Combat models and historical data: the U.S. Civil War. Operations Research 14(5): 759-790. doi:10.1287/opre.14.5.759 *(gecontroleerd 2026-11-15: detail)*
- Werrell, K. P. (2005). Sabres over MiG Alley: The F-86 and the Battle for Air Superiority in Korea. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Werrell, K. P. (2005). Archie to SAM: A Short Operational History of Ground-Based Air Defense (2e dr.). Air University Press, Maxwell AFB. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Westermeyer, P. W. (2008). U.S. Marines in Battle: Al-Khafji, 28 January-1 February 1991. History Division, US Marine Corps, Washington DC. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Willard, D. (1962). Lanchester as Force in History: An Analysis of Land Battles of the Years 1618-1905 (RAC-TP-74). Research Analysis Corporation, Bethesda MD. *(gecontroleerd 2026-11-15: bestaan)*
- Wilson, E. B. (1927). Probable inference, the law of succession, and statistical inference. Journal of the American Statistical Association 22(158): 209-212. *(gecontroleerd 2026-11-15: detail)*
- Wilson, H. W. (1896). Ironclads in Action: A Sketch of Naval Warfare from 1855 to 1895. Sampson Low, Marston, London. *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Wise, H. L. (2007). Inside the Danger Zone: The U.S. Military in the Persian Gulf, 1987-1988. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: detail)*
- Wong, L.; Kolditz, T. A.; Millen, R. A.; Potter, T. M. (2003). Why They Fight: Combat Motivation in the Iraq War. Strategic Studies Institute, US Army War College, Carlisle PA. https://press.armywarcollege.edu/monographs/322/ *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Woodward, S.; Robinson, P. (1992). One Hundred Days: The Memoirs of the Falklands Battle Group Commander. HarperCollins, London. *(gecontroleerd 2026-11-15: detail)*
- Woolley, A. W.; Chabris, C. F.; Pentland, A.; Hashmi, N.; Malone, T. W. (2010). Evidence for a collective intelligence factor in the performance of human groups. Science 330(6004): 686-688. doi:10.1126/science.1193147 *(gecontroleerd 2026-11-15: detail)*
- Xenophon (vert. Dakyns, H. G.) (1897). Hellenica. Macmillan, London. https://www.gutenberg.org/ebooks/1174 *(publiek domein)* *(gecontroleerd 2026-11-15: detail)*
- Xenopoulos, P.; Coelho, B.; Silva, C. (2021). Optimal team economic decisions in Counter-Strike. arXiv preprint 2109.12990. doi:10.48550/arXiv.2109.12990 *(gecontroleerd 2026-11-15: detail)*
- Xenopoulos, P.; Doraiswamy, H.; Silva, C. (2020). Valuing player actions in Counter-Strike: Global Offensive. Proc. IEEE International Conference on Big Data 2020: 1283-1292. https://arxiv.org/abs/2011.01324 *(gecontroleerd 2026-11-15: detail)*
- Xenopoulos, P.; Freeman, W. R.; Silva, C. (2022). Analyzing the differences between professional and amateur esports through win probability. Proceedings of the ACM Web Conference 2022 (WWW '22): 3418-3427. doi:10.1145/3485447.3512277 *(gecontroleerd 2026-11-15: detail)*
- Xenopoulos, P.; Rulff, J.; Nonato, L. G.; Barr, B.; Silva, C. (2022). ggViz: accelerating large-scale esports game analysis. Proc. ACM on Human-Computer Interaction 6 (CHI PLAY): 238. *(gecontroleerd 2026-11-15: bestaan)*
- Xenopoulos, P.; Silva, C. (2022). ESTA: an esports trajectory and action dataset. arXiv preprint 2209.09861. doi:10.48550/arXiv.2209.09861 *(gecontroleerd 2026-11-15: detail)*
- Y'Blood, W. T. (1981). Red Sun Setting: The Battle of the Philippine Sea. Naval Institute Press, Annapolis. *(gecontroleerd 2026-11-15: bestaan)*
- Yang, P.; Harrison, B.; Roberts, D. L. (2014). Identifying patterns in combat that are predictive of success in MOBA games. Proc. 9th International Conference on Foundations of Digital Games (FDG 2014). *(gecontroleerd 2026-11-15: bestaan)*
- Yang, Y.; Qin, T.; Lei, Y.-H. (2017). Real-time eSports match result prediction. arXiv preprint 1701.03162. doi:10.48550/arXiv.1701.03162 *(gecontroleerd 2026-11-15: detail)*
- Yannakakis, G. N.; Togelius, J. (2018). Artificial Intelligence and Games. Springer, Cham. *(gecontroleerd 2026-11-15: detail)*
- Yee, N.; Bailenson, J. N.; Urbanek, M.; Chang, F.; Merget, D. (2007). The unbearable likeness of being digital: the persistence of nonverbal social norms in online virtual environments. CyberPsychology & Behavior 10(1): 115-121. doi:10.1089/cpb.2006.9984 *(gecontroleerd 2026-11-15: detail)*
- Zabrodskyi, M.; Watling, J.; Danylyuk, O. V.; Reynolds, N. (2022). Preliminary Lessons in Conventional Warfighting from Russia's Invasion of Ukraine: February-July 2022. Royal United Services Institute, London. *(gecontroleerd 2026-11-15: detail)*
- Zaffiri, S. (1988). Hamburger Hill: May 11-20, 1969. Presidio Press, Novato. *(gecontroleerd 2026-11-15: detail)*
- Zaloga, S. J. (1996). Bagration 1944: The Destruction of Army Group Centre (Campaign 42). Osprey, London. *(gecontroleerd 2026-11-15: detail)*
- Zaloga, S. J.; Madej, W. V. (1985). The Polish Campaign 1939. Hippocrene Books, New York. *(gecontroleerd 2026-11-15: detail)*
- Zetterling, N.; Frankson, A. (2000). Kursk 1943: A Statistical Analysis. Frank Cass, London. *(gecontroleerd 2026-11-15: detail)*
- Zucchino, D. (2004). Thunder Run: The Armored Strike to Capture Baghdad. Atlantic Monthly Press, New York. *(gecontroleerd 2026-11-15: detail)*
- Zuehlke, M. (1999). Ortona: Canada's Epic World War II Battle. Stoddart, Toronto. *(gecontroleerd 2026-11-15: detail)*

<!-- kb:end -->
