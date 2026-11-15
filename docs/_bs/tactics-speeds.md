---
title: "Brzine kretanja"
parent: "Tabla taktika"
nav_order: 1
lang: "bs"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Brzine kretanja

Koliko vremena treba vojniku, tenku ili mlazu da stigne od A do B? Ova stranica kaže koliko brzo se svaka figura kreće na [tabli taktike](tactics-board.md), i odakle ti brojevi dolaze, pa možeš vjerovati vremenima na svom planu ili ih promijeniti.

[Tabla taktike](tactics-board.md) računa vrijeme plana iz toga koliko brzo se svaka figura kreće. Brzine dolaze iz jedne datoteke po igri u `src/tactics/speeds/`: brzina za svaki način kretanja svake klase (pješadija, kopnena vozila, čamci, avioni, helikopteri), plus imenovani profili, poput jednog po CS2 oružju ili jednog po tipu aviona. Svaka datoteka navodi svoje izvore, a svaka vrijednost kaže da li je **službena** (podaci same igre, ili objavljene brojke stvarnog aviona) ili **približna** (izmjerena od zajednice ili tipična vrijednost).

To su polazne tačke. **Svaka figura može prepisati svoje brzine na tabli**, pa plan može koristiti izmjerenu brzinu, opterećenog vojnika ili oštećen tenk.

## Režimi {#modes}

| Klasa | Režimi |
|---|---|
| Pješadija | puzanje (ležeći), čučanje, hod (spor, tih hod), trčanje (zadano kretanje), sprint |
| Kopnena vozila, čamci | puzanje, oprezno, normalno (van puta), jurnjava (najveća brzina na putu) |
| Avioni, helikopteri | sporo (prilaz, kruženje, lebdenje-taksiranje), krstarenje, borba (ugaona brzina ili napadački prolaz), maksimalno |

Režim koji igra nema ostaje prazan: CS2 i Valorant nemaju sprint i nemaju ležanje.

## Padine {#slopes}

Svaka datoteka također kaže kako igra tretira padine. CS2, Valorant i Squad ograničavaju horizontalnu brzinu, pa padina ne usporava igrača. Arma usporava pješadiju na padinama, pa njena datoteka i generička koriste Toblerovu funkciju pješačenja. Battlefield i simulatori vozila koriste običnu kaznu nagiba.

## Po igri {#per-game}

**Counter-Strike 2** (jedinice u sekundi; jedna jedinica se uzima kao jedan inč). **Službeno.** Brzine trčanja su vrijednosti `m_flMaxSpeed` iz definicija oružja igre: nož i C4 250, granate 245, pištolji 240 (Desert Eagle 230, R8 180), mitraljezi 220 do 240, puške 210 do 225, AWP 200, LMG-ovi 195 i 150. AWP sa nišanom (100), AUG i SG 553 (150) i G3SG1 i SCAR-20 (120) imaju svoje profile. Hod je trčanje × 0,52, a čučanje trčanje × 0,34. Valve ne objavljuje ta dva množitelja, ali ih svako oružje pokazuje u snimcima demoa. Da provjeriš plan naspram stvarnog kretanja, učitaj demo na istoj mapi i uporedi brzine igrača.

**Valorant** (m/s). Nož trči brzinom 6,75 m/s. Svako oružje množi to svojim množiteljem brzine trčanja iz podataka igre, što daje brzine koje prikazuje Arsenal u igri: 5,73 za većinu pištolja i mitraljeza, 5,4 za puške, 5,13 za teško naoružanje i Operatera, 5,06 za sačmarice. Ove brzine trčanja su tačne. Brzine hoda i čučanja su **procjene** (0,55 i 0,4 × trčanje) jer Riot ih ne objavljuje. Profili snajpera sa nišanom su također procjene.

**Battlefield** (km/h). **Približno.** EA ne objavljuje brojke kretanja. Pješadija: otprilike 1 m/s ležeći, 2 čučeći, 4 u trku i 6,4 u sprintu. Vozila, mlazni avioni, helikopteri i čamci dobijaju tipične brzine iz igre za svoju klasu.

**Squad** (km/h). **Približno.** Trčanje (3,3 m/s) i sprint (5,9 m/s) dolaze iz teksta zajednice o mehanici igre. Puzanje, čučanje i spori hod su procjene, kao i svaka klasa vozila i helikopter.

**Arma** (km/h). **Približno.** Tempo pješadije su mjerenja zajednice: otprilike 5 km/h hodajući, 9 km/h čučeći taktički tempo, 15 km/h kasajući i oko 21 km/h u sprintu. Najveće brzine vozila su konfigurisane maksimume vanilla vozila Arme 3 u svakoj klasi, iz spiska trećih strana. Sporiji režimi vozila su procjene.

**DCS / War Thunder / IL-2** (km/h). Svaki avion i helikopter u paleti ima svoj profil. Brzine krstarenja i maksimalne brzine su **objavljene brojke** stvarnih aviona, koje simulatori vjerno modeliraju. Maksimum je na nivou mora za mlazne avione, a na nazivnoj visini za aviona s propelerom, a napomena svakog profila kaže koje. Spore i borbene brzine su tipične vrijednosti. Kopnena vozila koriste objavljene brzine na putu stvarnih vozila, zaokružene (**približno**). Brodovi koriste objavljene najveće brzine svoje klase.

**Ostalo** (m/s). **Približne** stvarne zadane vrijednosti: puzanje 0,5, čučanje 1,5, hod 1,4, trčanje 3,5, sprint 6.

## Izvori {#sources}

Counter-Strike 2
- [Definicije oružja CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [CSDB stranice oružja](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com oružja (množitelji brzine trčanja)](https://valorant-api.com/v1/weapons)
- [VLR.gg: brzina noža 6,75 m/s](https://vlr.gg/post/4240306)
- [Riot podrška: Hodanje, trčanje i čučanje](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [EA forumi: brzina kretanja u Battlefieldu 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Vodič za kretanje u Battlefieldu 6](https://deltiasgaming.com/?p=309455)
- [Izvještaj prije izlaska o sprintu od 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: objava o mehanici igre Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (ne objavljuje brzine)

Arma
- [Bohemia forumi: brzina hoda](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Bohemia forumi: podešavanje brzine kretanja](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Arma 3 praćenje prijedloga: brzina sprinta](https://feedback.bistudio.com/T64047)
- [Priručnik za Arma 3: Upravljanje pješadijom](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistika vozila Arme 3 po frakciji (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedia specifikacije svakog tipa aviona i helikoptera, povezane iz svakog profila u `air.json`
- [V brzine](https://en.wikipedia.org/wiki/V_speeds), za tipične brzine prilaza i borbe
- [War Thunder wiki](https://wiki.warthunder.com/), za kopnena vozila
- [Razarač klase Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer), i objavljene brzine ostalih klasa brodova

Ostalo
- [Preferirana brzina hodanja](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerova funkcija pješačenja](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
