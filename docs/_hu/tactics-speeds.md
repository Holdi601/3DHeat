---
title: "Mozgási sebességek"
parent: "Taktikatábla"
nav_order: 1
lang: "hu"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Mozgási sebességek

Mennyi idő alatt ér át egy katona, egy tank vagy egy sugárhajtású gép A-ból B-be? Ez az oldal megmondja, milyen gyorsan mozog minden figura a [taktikai táblán](tactics-board.md), és honnan származnak ezek a számok, hogy megbízhasson a tervén lévő időkben, vagy megváltoztathassa őket.

A [taktikai tábla](tactics-board.md) a tervet abból időzíti, milyen gyorsan mozog minden figura. A sebességek játékonként egy-egy fájlból jönnek a `src/tactics/speeds/` mappában: minden osztály (gyalogság, szárazföldi járművek, hajók, repülőgépek, helikopterek) minden mozgásmódjához egy sebesség, valamint elnevezett profilok, például minden CS2-fegyverhez vagy minden repülőgéptípushoz egy. Minden fájl felsorolja a forrásait, és minden érték megmondja, hogy **hivatalos** (a játék saját adatai, vagy egy valódi repülőgép közzétett adatai) vagy **közelítő** (közösség által mért vagy tipikus érték).

Ezek kiindulópontok. **Minden figura felülírhatja a sebességeit a táblán**, így egy terv használhat mért sebességet, megterhelt katonát vagy sérült tankot.

## Módok {#modes}

| Osztály | Módok |
|---|---|
| Gyalogság | kúszás (fekvő), guggolás, séta (a lassú, csendes séta), futás (alapértelmezett mozgás), sprint |
| Szárazföldi járművek, hajók | kúszás, óvatos, normál (terepen), rohanás (út legnagyobb sebessége) |
| Repülőgépek, helikopterek | lassú (megközelítés, körözés, lebegő gurulás), utazósebesség, harc (sarokerő vagy támadófutás), maximum |

Egy mód, amelyet a játék nem ismer, üresen marad: a CS2-ben és a Valorantban nincs sprint és nincs fekvés.

## Lejtők {#slopes}

Minden fájl azt is megmondja, hogyan kezeli a játék a lejtőket. A CS2, a Valorant és a Squad korlátozza a vízszintes sebességet, így a lejtő nem lassítja a játékost. Az Arma lassítja a gyalogságot a lejtőkön, ezért a fájlja és az általános fájl Tobler túrázási függvényét használja. A Battlefield és a járműszimulátorok sima emelkedési büntetést alkalmaznak.

## Játékonként {#per-game}

**Counter-Strike 2** (egység másodpercenként; egy egységet egy hüvelyknek veszünk). **Hivatalos.** A futási sebességek a játék fegyverdefinícióiban lévő `m_flMaxSpeed` értékek: a kés és a C4 250, a gránátok 245, a pisztolyok 240 (Desert Eagle 230, R8 180), a géppisztolyok 220–240, a puskák 210–225, az AWP 200, a könnyű géppuskák 195 és 150. A célzott AWP (100), az AUG és az SG 553 (150), valamint a G3SG1 és a SCAR-20 (120) saját profillal rendelkezik. A séta a futás × 0,52, a guggolás a futás × 0,34. A Valve nem teszi közzé ez a két szorzót, de minden fegyver megjelenik a demófelvételekben. Ha egy tervet valódi mozgáshoz szeretne mérni, töltsön be egy demót ugyanarról a pályáról, és hasonlítsa össze a játékosok sebességeit.

**Valorant** (m/s). A kés 6,75 m/s-mal fut. Minden fegyver ezt megszorozza a saját futási sebesség-szorzójával a játékadatokból, ami a játékbeli Arsenal által mutatott sebességeket adja: 5,73 a legtöbb oldalfegyvernél és géppisztolynál, 5,4 a puskáknál, 5,13 a nehézfegyvereknél és az Operatornál, 5,06 a sörétes puskáknál. Ezek a futási sebességek pontosak. A séta és a guggolás sebessége **becslés** (0,55 és 0,4 × futás), mert a Riot nem teszi közzé őket. A célzott mesterlövész-profilok szintén becslések.

**Battlefield** (km/h). **Közelítő.** Az EA nem tesz közzé mozgási adatokat. Gyalogság: kb. 1 m/s fekve, 2 guggolva, 4 futva és 6,4 sprintelve. A járművek, sugárhajtású gépek, helikopterek és hajók osztályuk tipikus játékbeli sebességét kapják.

**Squad** (km/h). **Közelítő.** A futás (3,3 m/s) és a sprint (5,9 m/s) a játékmechanikáról szóló közösségi összefoglalóból származik. A kúszás, a guggolás és a lassú séta becslés, akárcsak minden járműosztály és a helikopterek.

**Arma** (km/h). **Közelítő.** A gyalogság tempói közösségi mérések: kb. 5 km/h séta, 9 km/h guggolva taktikai tempó, 15 km/h kocogás és kb. 21 km/h sprint. A járművek csúcssebessége az egyes osztályok vanilla Arma 3 járműveinek beállított maximuma, egy harmadik féltől származó összeállításból. A lassabb járműmódok becslések.

**DCS / War Thunder / IL-2** (km/h). A palettán minden repülőgépnek és helikopternek saját profilja van. Az utazó- és a maximális sebesség a valódi repülőgépek **közzétett adatai**, amelyeket a szimulátorok szorosan modelleznek. A maximum sugárhajtásúaknál tengerszinten, a légcsavarosoknál a névleges magasságon értendő, és minden profil megjegyzése megmondja, melyik. A lassú és a harci sebességek tipikus értékek. A szárazföldi járművek a valódi járművek közzétett úti sebességeit használják, kerekítve (**közelítő**). A hajók osztályuk közzétett csúcssebességeit használják.

**Egyéb** (m/s). **Közelítő** valós alapértékek: kúszás 0,5, guggolás 1,5, séta 1,4, futás 3,5, sprint 6.

## Források {#sources}

Counter-Strike 2
- [CS2 fegyverdefiníciók (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB fegyveroldalak](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com fegyverek (futási sebesség-szorzók)](https://valorant-api.com/v1/weapons)
- [VLR.gg: késsebesség 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot támogatás: Séta, futás és guggolás](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA fórumok: Battlefield 6 mozgási sebesség](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Battlefield 6 mozgási útmutató](https://deltiasgaming.com/?p=309455)
- [Kiadás előtti jelentés egy 6,4 m/s-os sprintről](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: Squad játékmechanika-bejegyzés (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (nem tesz közzé sebességeket)

Arma
- [Bohemia fórumok: séta sebessége](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia fórumok: mozgási sebesség hangolása](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 visszajelzés-követő: sprintsebesség](https://feedback.bistudio.com/T64047)
- [Arma 3 Kézikönyv: Gyalogsági vezérlés](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Arma 3 járműstatisztikák frakciónként (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Az egyes repülőgép- és helikoptertípusok Wikipédia-specifikációi, amelyekre az `air.json` minden profilja hivatkozik
- [V-sebességek](https://en.wikipedia.org/wiki/V_speeds), a tipikus megközelítési és harci sebességekért
- [War Thunder wiki](https://wiki.warthunder.com/), a szárazföldi járművekhez
- [Arleigh Burke-osztályú romboló](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), és a többi hajóosztály közzétett sebességei

Egyéb
- [Előnyben részesített járássebesség](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler túrázási függvénye](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
