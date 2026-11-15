---
title: "Rychlosti pohybu"
parent: "Taktická tabule"
nav_order: 1
lang: "cs"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Rychlosti pohybu

Jak dlouho trvá vojákovi, tanku nebo tryskáči dostat se z A do B? Tato stránka říká, jak rychle se každá figura pohybuje na [taktické tabuli](tactics-board.md), a odkud ta čísla pocházejí, abyste mohli časům na svém plánu věřit, nebo je změnit.

[Taktická tabule](tactics-board.md) měří čas plánu podle toho, jak rychle se každá figura pohybuje. Rychlosti pocházejí z jednoho souboru pro každou hru v `src/tactics/speeds/`: rychlost pro každý režim pohybu každé třídy (pěchota, pozemní vozidla, lodě, letadla, vrtulníky), plus pojmenované profily, například jeden pro každou zbraň CS2 nebo jeden pro každý typ letadla. Každý soubor uvádí své zdroje a každá hodnota říká, zda je **oficiální** (vlastní data hry, nebo zveřejněné údaje skutečného letadla), nebo **přibližná** (naměřená komunitou nebo typická hodnota).

Jsou to výchozí body. **Každá figura může na tabuli přepsat své rychlosti**, takže plán může použít naměřenou rychlost, zatíženého vojáka nebo poškozený tank.

## Režimy {#modes}

| Třída | Režimy |
|---|---|
| Pěchota | plazení (vleže), dřep, chůze (pomalá, tichá chůze), běh (výchozí pohyb), sprint |
| Pozemní vozidla, lodě | plazení, opatrně, normálně (terénem), spěch (nejvyšší rychlost na silnici) |
| Letadla, vrtulníky | pomalu (přiblížení, kroužení, zavěšení), přelet, boj (rohová rychlost nebo útočný přelet), maximum |

Režim, který hra nemá, zůstane prázdný: CS2 a Valorant nemají sprint ani plazení.

## Svahy {#slopes}

Každý soubor také říká, jak hra zachází se svahy. CS2, Valorant a Squad omezují vodorovnou rychlost, takže svah hráče nezpomalí. Arma zpomaluje pěchotu ve svazích, takže její soubor a obecný soubor používají Toblerovu funkci chůze. Battlefield a simulátory vozidel používají prostý postih za sklon.

## Podle hry {#per-game}

**Counter-Strike 2** (jednotky za sekundu; jedna jednotka se bere jako jeden palec). **Oficiální.** Rychlosti běhu jsou hodnoty `m_flMaxSpeed` z definic zbraní ve hře: nůž a C4 250, granáty 245, pistole 240 (Desert Eagle 230, R8 180), SMG 220 až 240, pušky 210 až 225, AWP 200, LMG 195 a 150. Nasazená AWP (100), AUG a SG 553 (150) a G3SG1 a SCAR-20 (120) mají vlastní profily. Chůze je běh × 0,52 a dřep je běh × 0,34. Valve tyto dva násobitele nezveřejňuje, ale každá zbraň se ukazuje v záznamech demo. Chcete-li plán ověřit proti skutečnému pohybu, načtěte demo na stejné mapě a porovnejte rychlosti hráčů.

**Valorant** (m/s). Nůž jede rychlostí 6,75 m/s. Každá zbraň tuto hodnotu vynásobí svým násobitelem rychlosti běhu z herních dat, což dá rychlosti, které ukazuje Arsenal ve hře: 5,73 pro většinu pistolí a SMG, 5,4 pro pušky, 5,13 pro těžké zbraně a Operátora, 5,06 pro brokovnice. Tyto rychlosti běhu jsou přesné. Rychlosti chůze a dřepu jsou **odhady** (0,55 a 0,4 × běh), protože Riot je nezveřejňuje. Profily odstřelovacích pušek s puškohledem jsou také odhady.

**Battlefield** (km/h). **Přibližné.** EA nezveřejňuje žádná čísla pohybu. Pěchota: zhruba 1 m/s vleže, 2 v dřepu, 4 během a 6,4 sprintem. Vozidla, proudová letadla, vrtulníky a lodě dostávají typické rychlosti ve hře pro svou třídu.

**Squad** (km/h). **Přibližné.** Běh (3,3 m/s) a sprint (5,9 m/s) pocházejí z komunitního popisu herní mechaniky. Plazení, dřep a pomalá chůze jsou odhady, stejně jako každá třída vozidel a vrtulníky.

**Arma** (km/h). **Přibližné.** Tempa pěchoty jsou komunitní časy: zhruba 5 km/h chůze, 9 km/h taktické tempo v dřepu, 15 km/h klus a zhruba 21 km/h sprint. Maximální rychlosti vozidel jsou nastavená maxima vanilkových vozidel Arma 3 v každé třídě, z výpisu třetí strany. Pomalejší režimy vozidel jsou odhady.

**DCS / War Thunder / IL-2** (km/h). Každé letadlo a vrtulník v paletě má vlastní profil. Přelet a maximální rychlosti jsou **zveřejněné údaje** skutečných letadel, které simulátory věrně modelují. Maximum je u proudových letadel u hladiny moře a u vrtulových při jmenovité výšce; poznámka každého profilu říká, které. Pomalé a bojové rychlosti jsou typické hodnoty. Pozemní vozidla používají zveřejněné silniční rychlosti skutečných vozidel, zaokrouhlené (**přibližné**). Lodě používají zveřejněné maximální rychlosti své třídy.

**Ostatní** (m/s). **Přibližné** výchozí hodnoty z reálného světa: plazení 0,5, dřep 1,5, chůze 1,4, běh 3,5, sprint 6.

## Zdroje {#sources}

Counter-Strike 2
- [Definice zbraní CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Stránky zbraní na CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Pohybové mechaniky](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com zbraně (násobitelé rychlosti běhu)](https://valorant-api.com/v1/weapons)
- [VLR.gg: rychlost nože 6,75 m/s](https://vlr.gg/post/4240306)
- [Podpora Riot: Chůze, běh a dřep](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Fóra EA: rychlost pohybu v Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Průvodce pohybem v Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Předpremiérový report sprintu 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: příspěvek o herní mechanice Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (rychlosti nezveřejňuje)

Arma
- [Fóra Bohemia: rychlost chůze](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Fóra Bohemia: ladění rychlosti pohybu](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Sledovač připomínek Arma 3: rychlost sprintu](https://feedback.bistudio.com/T64047)
- [Příručka Arma 3: ovládání pěchoty](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statistiky vozidel Arma 3 podle frakcí (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipedia: specifikace každého typu letadla a vrtulníku, odkazovaná z každého profilu v `air.json`
- [Rychlosti V](https://en.wikipedia.org/wiki/V_speeds), pro typické rychlosti přiblížení a boje
- [Wiki War Thunder](https://wiki.warthunder.com/), pro pozemní vozidla
- [Torpédoborec třídy Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) a zveřejněné rychlosti ostatních tříd lodí

Ostatní
- [Preferovaná rychlost chůze](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerova funkce chůze](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
