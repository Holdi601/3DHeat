---
title: "Rörelsehastigheter"
parent: "Taktiktavla"
nav_order: 1
lang: "sv"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Rörelsehastigheter

Hur lång tid tar det för en soldat, en stridsvagn eller en jet att komma från A till B? Den här sidan visar hur snabbt varje figur rör sig på [taktiktavlan](tactics-board.md), och varifrån siffrorna kommer. Då kan du lita på tiderna i din plan eller ändra dem.

[Taktiktavlan](tactics-board.md) tidsätter en plan utifrån hur snabbt varje figur rör sig. Hastigheterna kommer från en fil per spel i `src/tactics/speeds/`: en hastighet för varje rörelseläge i varje klass (infanteri, markfordon, båtar, flygplan, helikoptrar), plus namngivna profiler, till exempel en per CS2-vapen eller en per flygplanstyp. Varje fil listar sina källor. Varje värde anger om det är **officiellt** (spelets egna data, eller de publicerade siffrorna för ett verkligt flygplan) eller **ungefärligt** (uppmätt av gemenskapen eller ett typiskt värde).

Det här är utgångspunkter. **Varje figur kan åsidosätta sina hastigheter på tavlan**, så en plan kan använda en uppmätt hastighet, en tungt lastad soldat eller en skadad stridsvagn.

## Lägen {#modes}

| Klass | Lägen |
|---|---|
| Infanteri | krypa (liggande), huka, gå (den långsamma, tysta gången), springa (standardrörelse), sprinta |
| Markfordon, båtar | krypa, försiktig, normal (terräng), rusa (största hastighet på väg) |
| Flygplan, helikoptrar | långsam (inflygning, kretsning, hovring), kryssning, strid (hörnhastighet eller attackflygning), maximal |

Ett läge som spelet inte har lämnas tomt. CS2 och Valorant har varken sprint eller liggande.

## Sluttningar {#slopes}

Varje fil säger också hur spelet hanterar sluttningar. CS2, Valorant och Squad begränsar den horisontella hastigheten, så en sluttning bromsar inte en spelare. Arma bromsar infanteri i sluttningar. Därför använder dess fil och den generiska Toblers vandringsfunktion. Battlefield och fordonssimulatorerna använder ett enkelt lutningsstraff.

## Per spel {#per-game}

**Counter-Strike 2** (enheter per sekund; en enhet räknas som en tum). **Officiellt.** Springhastigheterna är värdena `m_flMaxSpeed` i spelets vapendefinitioner: kniv och C4 250, granater 245, pistoler 240 (Desert Eagle 230, R8 180), kulsprutepistoler 220 till 240, gevär 210 till 225, AWP 200, lätta kulsprutor 195 och 150. Den skoplagda AWP:n (100), AUG och SG 553 (150) samt G3SG1 och SCAR-20 (120) har egna profiler. Gång är spring × 0,52 och huka är spring × 0,34. Valve publicerar inte de två multiplikatorerna, men varje vapen visar dem i demoinspelningar. För att kontrollera en plan mot verklig rörelse, läs in en demo på samma karta och jämför spelarnas hastigheter.

**Valorant** (m/s). Kniven springer med 6,75 m/s. Varje vapen multiplicerar det med sin springhastighetsmultiplikator från spelets data. Det ger hastigheterna som Arsenalen i spelet visar: 5,73 för de flesta sidovapen och kulsprutepistoler, 5,4 för gevär, 5,13 för tunga vapen och Operatorn, 5,06 för hagelgevär. Dessa springhastigheter är exakta. Gång- och hukhastigheterna är **uppskattningar** (0,55 och 0,4 × spring), eftersom Riot inte publicerar dem. De skoplagda krypskyttprofilerna är också uppskattningar.

**Battlefield** (km/h). **Ungefärligt.** EA publicerar inga rörelsesiffror. Infanteri: ungefär 1 m/s liggande, 2 hukande, 4 springande och 6,4 sprintande. Fordon, jetplan, helikoptrar och båtar får typiska hastigheter i spelet för sin klass.

**Squad** (km/h). **Ungefärligt.** Springning (3,3 m/s) och sprint (5,9 m/s) kommer från en gemenskapsbeskrivning av spelmekaniken. Krypning, huka och långsam gång är uppskattningar, och så är varje fordonsklass och helikopter.

**Arma** (km/h). **Ungefärligt.** Infanteritempon är gemenskapens tidtagningar: ungefär 5 km/h gående, 9 km/h i hukande taktiskt tempo, 15 km/h joggande och ungefär 21 km/h sprintande. Fordonens högsta hastigheter är de konfigurerade maxvärdena för de vanliga Arma 3-fordonen i varje klass, från en tredjepartslista. De långsammare fordonslägena är uppskattningar.

**DCS / War Thunder / IL-2** (km/h). Varje flygplan och helikopter i paletten har en egen profil. Kryssnings- och maxhastigheter är de **publicerade siffrorna** för de verkliga flygplanen, som simulatorerna efterliknar noga. Maxhastigheten gäller på havsnivå för jetplan och vid den angivna höjden för propellerflygplan. Varje profils anteckning säger vilket. Långsam- och stridshastigheter är typiska värden. Markfordon använder de publicerade vägfarterna för de verkliga fordonen, avrundade (**ungefärligt**). Fartyg använder de publicerade topphastigheterna för sin klass.

**Övrigt** (m/s). **Ungefärliga** standardvärden från verkligheten: krypa 0,5, huka 1,5, gå 1,4, springa 3,5, sprinta 6.

## Källor {#sources}

Counter-Strike 2
- [CS2:s vapendefinitioner (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB:s vapensidor](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com, vapen (springhastighetsmultiplikatorer)](https://valorant-api.com/v1/weapons)
- [VLR.gg: knivhastighet 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot support: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA-forumet: Battlefield 6-rörelsehastighet](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6-rörelseguide](https://deltiasgaming.com/?p=309455)
- [Rapport före lansering om en sprint på 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: inlägg om Squads spelmekanik (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (publicerar inga hastigheter)

Arma
- [Bohemia-forumet: gånghastighet](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia-forumet: justering av rörelsehastighet](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 feedback tracker: sprinthastighet](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3-fordonsstatistik per fraktion (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedias specifikationer för varje flygplans- och helikoptertyp, länkade från varje profil i `air.json`
- [V-hastigheter](https://en.wikipedia.org/wiki/V_speeds), för typiska inflygnings- och stridshastigheter
- [War Thunder-wikin](https://wiki.warthunder.com/), för markfordon
- [Arleigh Burke-klass-jagare](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), och de andra fartygsklassernas publicerade hastigheter

Övrigt
- [Föredragen gånghastighet](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblers vandringsfunktion](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
