---
title: "Brzine kretanja"
parent: "Ploča taktika"
nav_order: 1
lang: "hr"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Brzine kretanja

Koliko je vremena vojniku, tenku ili mlazu potrebno da ode od A do B? Ova stranica kaže kojom brzinom se svaka figura kreće na [ploči taktike](tactics-board.md) i odakle ti brojevi dolaze, da možete vjerovati vremenima u svom planu ili ih promijeniti.

[Ploča taktike](tactics-board.md) mjeri vrijeme plana po tome kojom brzinom se svaka figura kreće. Brzine dolaze iz jedne datoteke po igri u `src/tactics/speeds/`: brzina za svaki način kretanja svake klase (pješaštvo, kopnena vozila, brodovi, zrakoplovi, helikopteri), plus imenovani profili, poput jednog po oružju u CS2 ili jednog po vrsti zrakoplova. Svaka datoteka navodi svoje izvore, a svaka vrijednost kaže je li **službena** (vlastiti podaci igre ili objavljene brojke stvarnog zrakoplova) ili **približna** (izmjerena od zajednice ili tipična vrijednost).

To su polazne točke. **Svaka figura može prepisati svoje brzine na ploči**, pa plan može koristiti izmjerenu brzinu, opterećenog vojnika ili oštećen tenk.

## Načini {#modes}

| Klasa | Načini |
|---|---|
| Pješaštvo | puzanje (na trbuhu), čučanje, hod (spor, tih hod), trčanje (zadano kretanje), sprint |
| Kopnena vozila, brodovi | puzanje, oprezno, normalno (van ceste), juriš (najveća brzina na cesti) |
| Zrakoplovi, helikopteri | sporo (prilaz, kruženje, lebdenje-vožnja), krstarenje, borbeno (kutna brzina ili napad), najveća |

Način koji igra nema ostaje prazan: CS2 i Valorant nemaju sprint ni puzanje.

## Nagibi {#slopes}

Svaka datoteka također kaže kako igra tretira nagibe. CS2, Valorant i Squad ograničavaju vodoravnu brzinu, pa nagib ne usporava igrača. Arma usporava pješaštvo na nagibima, pa njezina datoteka i opća koriste Toblerovu funkciju hodanja. Battlefield i simulatori vozila koriste običnu kaznu za nagib.

## Po igri {#per-game}

**Counter-Strike 2** (jedinica u sekundi; jedna jedinica uzima se kao jedan inč). **Službeno.** Brzine trčanja su vrijednosti `m_flMaxSpeed` u definicijama oružja igre: nož i C4 250, granate 245, pištolji 240 (Desert Eagle 230, R8 180), SMG-ovi 220 do 240, puške 210 do 225, AWP 200, strojnice 195 i 150. Snajper AWP s optikom (100), AUG i SG 553 (150) te G3SG1 i SCAR-20 (120) imaju vlastite profile. Hod je trčanje × 0,52, a čučanje je trčanje × 0,34. Valve ne objavljuje ta dva množitelja, ali ih svako oružje pokazuje u snimkama demoa. Da provjerite plan naspram stvarnog kretanja, učitajte demo na istoj karti i usporedite brzine igrača.

**Valorant** (m/s). Nož trči brzinom od 6,75 m/s. Svako oružje množi to svojim množiteljem brzine trčanja iz podataka igre, što daje brzine koje prikazuje Arsenal u igri: 5,73 za većinu pištolja i SMG-ova, 5,4 za puške, 5,13 za teško oružje i Operatera, 5,06 za sačmarice. Ove brzine trčanja su točne. Brzine hoda i čučanja su **procjene** (0,55 i 0,4 × trčanje) jer Riot ih ne objavljuje. Profili snajpera s optikom su također procjene.

**Battlefield** (km/h). **Približno.** EA ne objavljuje brojke kretanja. Pješaštvo: oko 1 m/s na trbuhu, 2 čučeći, 4 u trčanju i 6,4 u sprintu. Vozila, mlazni zrakoplovi, helikopteri i brodovi dobivaju tipične brzine iz igre za svoju klasu.

**Squad** (km/h). **Približno.** Trčanje (3,3 m/s) i sprint (5,9 m/s) potječu iz zajedničkog opisa mehanike igre. Puzanje, čučanje i spori hod su procjene, kao i svaka klasa vozila i helikopteri.

**Arma** (km/h). **Približno.** Tempi pješaštva su vremena zajednice: oko 5 km/h hodajući, 9 km/h tempo taktički čučeći, 15 km/h laganim trčanjem i oko 21 km/h sprintom. Najveće brzine vozila su konfigurirane maksimume standardnih vozila Arme 3 u svakoj klasi, iz popisa treće strane. Sporiji načini vozila su procjene.

**DCS / War Thunder / IL-2** (km/h). Svaki zrakoplov i helikopter na paleti ima vlastiti profil. Brzine krstarenja i najveće su **objavljene brojke** stvarnih zrakoplova, koje simulatori vjerno modeliraju. Najveća je na razini mora za mlazne zrakoplove, a na nazivnoj visini za propelerske, a bilješka svakog profila kaže koja. Spore i borbene brzine su tipične vrijednosti. Kopnena vozila koriste objavljene cestovne brzine stvarnih vozila, zaokružene (**približno**). Brodovi koriste objavljene najveće brzine svoje klase.

**Ostalo** (m/s). **Približne** stvarne zadane vrijednosti: puzanje 0,5, čučanje 1,5, hod 1,4, trčanje 3,5, sprint 6.

## Izvori {#sources}

Counter-Strike 2
- [Definicije oružja CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Stranice oružja CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com oružja (množitelji brzine trčanja)](https://valorant-api.com/v1/weapons)
- [VLR.gg: brzina noža 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot podrška: Hodanje, trčanje i čučanje](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA forumi: brzina kretanja u Battlefieldu 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Vodič za kretanje u Battlefieldu 6](https://deltiasgaming.com/?p=309455)
- [Izvješće prije izlaska o sprintu od 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: objava o mehanici igre Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ne objavljuje brzine)

Arma
- [Bohemia forumi: brzina hoda](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia forumi: podešavanje brzine kretanja](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 praćenje povratnih informacija: brzina sprinta](https://feedback.bistudio.com/T64047)
- [Arma 3 priručnik: upravljanje pješaštvom](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistika vozila Arme 3 po frakciji (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedijine specifikacije svakog tipa zrakoplova i helikoptera, povezane iz svakog profila u `air.json`
- [V brzine](https://en.wikipedia.org/wiki/V_speeds), za tipične brzine prilaza i borbe
- [War Thunder wiki](https://wiki.warthunder.com/), za kopnena vozila
- [Razred Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), i objavljene brzine ostalih klasa brodova

Ostalo
- [Preferirana brzina hodanja](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerova funkcija hodanja](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
