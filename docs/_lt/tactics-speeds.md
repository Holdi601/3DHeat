---
title: "Judėjimo greičiai"
parent: "Taktikos lenta"
nav_order: 1
lang: "lt"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Judėjimo greičiai

Kiek laiko kariui, tankui ar reaktyviniam lėktuvui nukakti iš A į B? Šis puslapis parodo, kaip greitai juda kiekviena figūra [taktikos lentoje](tactics-board.md) ir iš kur tie skaičiai atsiranda, kad galėtumėte pasitikėti savo plano laikais arba juos pakeisti.

[Taktikos lenta](tactics-board.md) planą laiko pagal tai, kaip greitai juda kiekviena figūra. Greičiai ateina iš vieno failo kiekvienam žaidimui aplanke `src/tactics/speeds/`: greitis kiekvienam kiekvienos klasės judėjimo režimui (pėstininkai, sausumos technika, valtys, lėktuvai, sraigtasparniai), be to, pavadinti profiliai, pavyzdžiui, vienas kiekvienam CS2 ginklui ar vienas kiekvienam lėktuvo tipui. Kiekviename faile išvardyti šaltiniai, o kiekviena reikšmė nurodo, ar ji yra **oficiali** (paties žaidimo duomenys arba tikrojo lėktuvo paskelbti skaičiai), ar **apytikslė** (bendruomenės išmatuota arba tipinė reikšmė).

Tai yra atskaitos taškai. **Kiekviena figūra gali perrašyti savo greičius lentoje**, todėl plane galima naudoti išmatuotą greitį, apkrautą pėstininką ar pažeistą tanką.

## Režimai {#modes}

| Klasė | Režimai |
|---|---|
| Pėstininkai | šliaužimas (ant pilvo), tupėjimas, ėjimas (lėtas, tylus ėjimas), bėgimas (numatytasis judėjimas), sprintas |
| Sausumos technika, valtys | šliaužimas, atsargiai, įprastai (per lauką), skubėjimas (kelio didžiausias greitis) |
| Lėktuvai, sraigtasparniai | lėtai (artėjimas, skrydis vietoje, kabėjimas), kreiserinis, kovinis (kampo greitis arba puolimo skrydis), maksimalus |

Režimas, kurio žaidimas neturi, paliekamas tuščias: CS2 ir Valorant neturi sprinto ir gulėjimo.

## Nuokalnės {#slopes}

Kiekvienas failas taip pat nurodo, kaip žaidimas traktuoja nuokalnes. CS2, Valorant ir Squad riboja horizontalų greitį, todėl nuokalnė nelėtina žaidėjo. Arma lėtina pėstininkus nuokalnėse, todėl jos failas ir bendrasis naudoja Toblerio pėsčiųjų funkciją. Battlefield ir techninės simuliacijos naudoja paprastą nuolydžio baudą.

## Pagal žaidimą {#per-game}

**Counter-Strike 2** (vienetai per sekundę; vienas vienetas laikomas vienu coliu). **Oficialu.** Bėgimo greičiai yra `m_flMaxSpeed` reikšmės žaidimo ginklų aprašuose: peilis ir C4 – 250, granatos – 245, pistoletai – 240 (Desert Eagle – 230, R8 – 180), SMG – nuo 220 iki 240, šautuvai – nuo 210 iki 225, AWP – 200, LMG – 195 ir 150. Snaiperinis AWP (100), AUG ir SG 553 (150) bei G3SG1 ir SCAR-20 (120) turi savo profilius. Ėjimas yra bėgimas × 0,52, o tupėjimas – bėgimas × 0,34. Valve nepaskelbia šių dviejų daugiklių, tačiau kiekvienas ginklas juos rodo demonstracijų įrašuose. Norėdami patikrinti planą pagal tikrą judėjimą, įkelkite demonstraciją tame pačiame žemėlapyje ir palyginkite žaidėjų greičius.

**Valorant** (m/s). Peilis bėga 6,75 m/s greičiu. Kiekvienas ginklas tai padaugina iš savo bėgimo greičio daugiklio iš žaidimo duomenų, o tai duoda greičius, kuriuos rodo žaidimo Arsenalas: 5,73 daugumai šoninių ginklų ir SMG, 5,4 šautuvams, 5,13 sunkiesiems ir Operatoriui, 5,06 brokovams. Šie bėgimo greičiai tikslūs. Ėjimo ir tupėjimo greičiai yra **įverčiai** (0,55 ir 0,4 × bėgimas), nes Riot jų nepublikuoja. Snaiperio profiliai su taikikliu taip pat yra įverčiai.

**Battlefield** (km/h). **Apytikslė.** EA neskelbia judėjimo skaičių. Pėstininkai: maždaug 1 m/s gulint, 2 tupint, 4 bėgant ir 6,4 sprintu. Technika, reaktyviniai lėktuvai, sraigtasparniai ir valtys gauna tipinius žaidimo greičius savo klasei.

**Squad** (km/h). **Apytikslė.** Bėgimas (3,3 m/s) ir sprintas (5,9 m/s) ateina iš bendruomenės žinynėlio apie žaidimo mechaniką. Šliaužimas, tupėjimas ir lėtas ėjimas yra įverčiai, taip pat kiekviena technikos klasė ir sraigtasparniai.

**Arma** (km/h). **Apytikslė.** Pėstininkų žingsniai yra bendruomenės matavimai: maždaug 5 km/h ėjimas, 9 km/h tupint taktiniu žingsniu, 15 km/h bėgimas ir apie 21 km/h sprintas. Sausumos technikos maksimalūs greičiai yra kiekvienos klasės vanilinių Arma 3 technikos sukonfigūruoti maksimumai, iš trečios šalies sąrašo. Lėtesni technikos režimai yra įverčiai.

**DCS / War Thunder / IL-2** (km/h). Kiekvienas lėktuvas ir sraigtasparnis paletėje turi savo profilį. Kreiserinis ir maksimalūs greičiai yra tikrųjų lėktuvų **paskelbti skaičiai**, kuriuos simuliatoriai modeliuoja artimai. Maksimalus – reaktyviniams jūros lygyje, o sraigtiniams – nominaliame aukštyje, ir kiekvieno profilio pastaba nurodo, kuris. Lėti ir kovos greičiai yra tipinės reikšmės. Sausumos technika naudoja tikrųjų transporto priemonių paskelbtus kelio greičius, suapvalintus (**apytikslė**). Laivai naudoja savo klasės paskelbtus didžiausius greičius.

**Kita** (m/s). **Apytikslės** realaus pasaulio numatytosios reikšmės: šliaužimas 0,5, tupėjimas 1,5, ėjimas 1,4, bėgimas 3,5, sprintas 6.

## Šaltiniai {#sources}

Counter-Strike 2
- [CS2 ginklų aprašai (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB ginklų puslapiai](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com ginklai (bėgimo greičio daugikliai)](https://valorant-api.com/v1/weapons)
- [VLR.gg: peilio greitis 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot palaikymas: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA forumai: Battlefield 6 judėjimo greitis](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 judėjimo vadovas](https://deltiasgaming.com/?p=309455)
- [Prieš išleidimą paskelbtas 6,4 m/s sprinto pranešimas](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad žaidimo mechanikos įrašas (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (greičių nepublikuoja)

Arma
- [Bohemia forumai: ėjimo greitis](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia forumai: judėjimo greičio derinimas](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 atsiliepimų sekiklis: sprinto greitis](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 technikos statistika pagal frakciją (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Kiekvieno lėktuvo ir sraigtasparnio tipo Wikipedia specifikacijos, nuorodos iš kiekvieno profilio `air.json`
- [V speeds](https://en.wikipedia.org/wiki/V_speeds), tipiniams artėjimo ir kovos greičiams
- [War Thunder wiki](https://wiki.warthunder.com/), sausumos technikai
- [Arleigh Burke-class destroyer](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) ir kitų laivų klasių paskelbti greičiai

Kita
- [Pageidaujamas ėjimo greitis](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerio pėsčiųjų funkcija](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
