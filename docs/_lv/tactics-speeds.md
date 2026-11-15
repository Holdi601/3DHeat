---
title: "Kustības ātrumi"
parent: "Taktikas tāfele"
nav_order: 1
lang: "lv"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Kustības ātrumi

Cik ilgi karavīram, tankam vai reaktīvajam lidaparātam nepieciešams, lai nokļūtu no A līdz B? Šī lapa saka, cik ātri kustas katra figūra [taktikas tāfelē](tactics-board.md) un no kurienes šie skaitļi nāk, lai tu varētu uzticēties plāna laikiem vai tos mainīt.

[Taktikas tāfele](tactics-board.md) plāna laikus aprēķina pēc tā, cik ātri kustas katra figūra. Ātrumi nāk no viena faila katrai spēlei mapē `src/tactics/speeds/`: ātrums katram kustības režīmam katrā klasē (kājnieki, sauszemes transportlīdzekļi, laivas, lidaparāti, helikopteri), plus nosauktie profili, piemēram, viens katram CS2 ierocim vai viens katram lidaparāta tipam. Katrs fails uzskaita savus avotus, un katra vērtība saka, vai tā ir **oficiāla** (pašas spēles dati vai publicētie reālā lidaparāta dati) vai **aptuvena** (kopienas mērīta vai tipiska vērtība).

Tās ir sākumpunkti. **Katra figūra var pārrakstīt savus ātrumus tāfelē**, tāpēc plānā var izmantot izmērītu ātrumu, nastā apgrūtinātu karavīru vai bojātu tanku.

## Režīmi {#modes}

| Klase | Režīmi |
|---|---|
| Kājnieki | ložņāšana (guļus), pieņemties, iet (lēnais, klusais solis), skriet (noklusējuma kustība), sprints |
| Sauszemes transportlīdzekļi, laivas | ložņāšana, piesardzīgi, parasti (pa lauku), steigā (ceļa maksimālais ātrums) |
| Lidaparāti, helikopteri | lēni (tuvošanās, riņķošana, kustība virs zemes), kreiserēšana, kaujas (stūra ātrums vai uzbrukuma skrējiens), maksimālais |

Režīms, kuru spēlei nav, paliek tukšs: CS2 un Valorant nav sprinta un guļus pozīcijas.

## Nogāzes {#slopes}

Katrs fails saka arī, kā spēle apstrādā nogāzes. CS2, Valorant un Squad ierobežo horizontālo ātrumu, tāpēc nogāze nepalēnina spēlētāju. Arma palēnina kājniekus nogāzēs, tāpēc tās fails un vispārīgais izmanto Toblera pārgājiena funkciju. Battlefield un transportlīdzekļu simulatori izmanto vienkāršu slīpuma sodu.

## Pa spēlēm {#per-game}

**Counter-Strike 2** (vienības sekundē; viena vienība tiek ņemta kā viena colla). **Oficiāls.** Skrējiena ātrumi ir `m_flMaxSpeed` vērtības spēles ieroču definīcijās: nazis un C4 250, granātas 245, pistoles 240 (Desert Eagle 230, R8 180), PPŠ 220 līdz 240, šautenes 210 līdz 225, AWP 200, vieglie ložmetēji 195 un 150. Snaipera AWP (100), AUG un SG 553 (150) un G3SG1 un SCAR-20 (120) ar tēmēkli ir savi profili. Iešana ir skrējiens × 0,52, bet pietupšanās — skrējiens × 0,34. Valve šos divus reizinātājus nepublicē, bet katrs ierocis tos rāda demo ierakstos. Lai pārbaudītu plānu pret īstu kustību, ielādē demo tajā pašā kartē un salīdzini spēlētāju ātrumus.

**Valorant** (m/s). Nazis skrien ar 6,75 m/s. Katrs ierocis to reizina ar savu skrējiena ātruma reizinātāju no spēles datiem, un tā rodas ātrumi, ko rāda spēles Arsenal: 5,73 vairumam pistoļu un PPŠ, 5,4 šautenēm, 5,13 smagajiem un Operatoram, 5,06 bise. Šie skrējiena ātrumi ir precīzi. Iešanas un pietupšanās ātrumi ir **aplēses** (0,55 un 0,4 × skrējiens), jo Riot tos nepublicē. Snaipera profili ar tēmēkli arī ir aplēses.

**Battlefield** (km/h). **Aptuvens.** EA nepublicē kustības skaitļus. Kājnieki: aptuveni 1 m/s guļus, 2 pietupies, 4 skrienot un 6,4 sprintā. Transportlīdzekļi, lidaparāti, helikopteri un laivas saņem tipiskus spēles ātrumus savai klasei.

**Squad** (km/h). **Aptuvens.** Skrējiens (3,3 m/s) un sprints (5,9 m/s) nāk no kopienas apraksta par spēles mehāniku. Ložņāšana, pietupšanās un lēnā iešana ir aplēses, tāpat katra transportlīdzekļu klase un helikopteri.

**Arma** (km/h). **Aptuvens.** Kājnieku soļi ir kopienas hronometrāža: aptuveni 5 km/h ejot, 9 km/h pietupies taktiskā solī, 15 km/h skrienot un aptuveni 21 km/h sprintā. Transportlīdzekļu maksimālie ātrumi ir katras klases vanilla Arma 3 transportlīdzekļu konfigurētie maksimumi, no trešās puses saraksta. Lēnākie transportlīdzekļu režīmi ir aplēses.

**DCS / War Thunder / IL-2** (km/h). Katram lidaparātam un helikopteram palitrā ir savs profils. Kreiserēšanas un maksimālie ātrumi ir reālo lidaparātu **publicētie dati**, ko simulatori modelē tuvu. Maksimums ir jūras līmenī reaktīviem un nominālā augstumā propelleru lidaparātiem, un katra profila piezīme saka, kura. Lēnie un kaujas ātrumi ir tipiskas vērtības. Sauszemes transportlīdzekļi izmanto reālo transportlīdzekļu publicētos ceļa ātrumus, noapaļotus (**aptuveni**). Kuģi izmanto savas klases publicētos maksimālos ātrumus.

**Cits** (m/s). **Aptuveni** reālās pasaules noklusējumi: ložņāšana 0,5, pietupšanās 1,5, iešana 1,4, skrējiens 3,5, sprints 6.

## Avoti {#sources}

Counter-Strike 2
- [CS2 ieroču definīcijas (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB ieroču lapas](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: kustības mehānika](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com ieroči (skrējiena ātruma reizinātāji)](https://valorant-api.com/v1/weapons)
- [VLR.gg: naža ātrums 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot atbalsts: iešana, skriešana un pietupšanās](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA forumi: Battlefield 6 kustības ātrums](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 kustības ceļvedis](https://deltiasgaming.com/?p=309455)
- [Pirmsizlaides ziņojums par 6,4 m/s sprintu](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad spēles mehānikas ziņa (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ātrumus nepublicē)

Arma
- [Bohemia forumi: iešanas ātrums](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia forumi: kustības ātruma pielāgošana](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 atsauksmju izsekotājs: sprinta ātrums](https://feedback.bistudio.com/T64047)
- [Arma 3 lauka rokasgrāmata: kājnieku vadība](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 transportlīdzekļu statistika pa frakcijām (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Katra lidaparāta un helikoptera tipa Wikipedia specifikācijas, saistītas no katra profila `air.json`
- [V ātrumi](https://en.wikipedia.org/wiki/V_speeds), tipiskiem tuvošanās un kaujas ātrumiem
- [War Thunder wiki](https://wiki.warthunder.com/), sauszemes transportlīdzekļiem
- [Arleigh Burke klases iznīcinātājs](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) un citu kuģu klašu publicētie ātrumi

Citi
- [Vēlamais iešanas ātrums](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblera pārgājiena funkcija](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
