---
title: "Rýchlosti pohybu"
parent: "Taktická tabuľa"
nav_order: 1
lang: "sk"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Rýchlosti pohybu

Ako dlho trvá vojakovi, tanku alebo prúdovému lietadlu dostať sa z A do B? Táto stránka hovorí, ako rýchlo sa každá figúra hýbe na [taktickej tabuli](tactics-board.md), a odkiaľ tieto čísla pochádzajú, aby ste mohli časom na svojom pláne dôverovať alebo ich zmeniť.

[Taktická tabuľa](tactics-board.md) počíta čas plánu podľa toho, ako rýchlo sa každá figúra hýbe. Rýchlosti pochádzajú z jedného súboru pre každú hru v `src/tactics/speeds/`: rýchlosť pre každý režim pohybu každej triedy (pechota, pozemné vozidlá, lode, lietadlá, vrtuľníky), plus pomenované profily, napríklad jeden na každú zbraň CS2 alebo jeden na každý typ lietadla. Každý súbor uvádza svoje zdroje a každá hodnota hovorí, či je **oficiálna** (vlastné dáta hry alebo uverejnené údaje skutočného lietadla), alebo **približná** (zmerané komunitou alebo typická hodnota).

Sú to východiskové body. **Každá figúra môže na tabuli prepísať svoje rýchlosti**, takže plán môže použiť zmeranú rýchlosť, preťaženého vojaka alebo poškodený tank.

## Režimy {#modes}

| Trieda | Režimy |
|---|---|
| Pechota | plazenie (ležmo), drep, chôdza (pomalá, tichá chôdza), beh (predvolený pohyb), šprint |
| Pozemné vozidlá, lode | plazenie, opatrne, normálne (terénom), nápor (najvyššia rýchlosť po ceste) |
| Lietadlá, vrtuľníky | pomaly (priblíženie, kĺzanie na mieste, zavesenie), plavba, boj (rohová rýchlosť alebo útočný prelet), maximum |

Režim, ktorý hra nemá, zostane prázdny: CS2 a Valorant nemajú šprint ani ležanie.

## Svahy {#slopes}

Každý súbor tiež hovorí, ako hra zaobchádza so svahmi. CS2, Valorant a Squad obmedzujú vodorovnú rýchlosť, takže svah hráča nespomalí. Arma spomaľuje pechotu na svahoch, preto jej súbor a všeobecný súbor používajú Toblerovu turistickú funkciu. Battlefield a simulátory vozidiel používajú jednoduchý trest za sklon.

## Podľa hier {#per-game}

**Counter-Strike 2** (jednotky za sekundu; jedna jednotka sa berie ako jeden palec). **Oficiálne.** Rýchlosti behu sú hodnoty `m_flMaxSpeed` z definícií zbraní hry: nôž a C4 250, granáty 245, pištole 240 (Desert Eagle 230, R8 180), SMG 220 až 240, pušky 210 až 225, AWP 200, ľahké guľomety 195 a 150. Ostrelená AWP (100), AUG a SG 553 (150) a G3SG1 a SCAR-20 (120) majú vlastné profily. Chôdza je beh × 0,52 a drep je beh × 0,34. Valve tieto dva násobiteľa nezverejňuje, ale každá zbraň sa ukazuje v nahrávkach demo. Ak chcete plán overiť voči skutočnému pohybu, načítajte demo na tej istej mape a porovnajte rýchlosti hráčov.

**Valorant** (m/s). Nôž beží rýchlosťou 6,75 m/s. Každá zbraň túto hodnotu vynásobí svojím násobiteľom rýchlosti behu z herných dát, čím vzniknú rýchlosti, ktoré ukazuje hra v Arsenal: 5,73 pre väčšinu sekundárnych zbraní a SMG, 5,4 pre pušky, 5,13 pre ťažké zbrane a Operátora, 5,06 pre brokovnice. Tieto rýchlosti behu sú presné. Rýchlosti chôdze a drepu sú **odhady** (0,55 a 0,4 × beh), lebo Riot ich nezverejňuje. Profily odstrelovačov s ďalekohľadom sú tiež odhady.

**Battlefield** (km/h). **Približné.** EA nezverejňuje čísla pohybu. Pechota: asi 1 m/s v ľahu, 2 v drepe, 4 pri behu a 6,4 pri šprinte. Vozidlá, lietadlá, vrtuľníky a lode dostanú typické herné rýchlosti pre svoju triedu.

**Squad** (km/h). **Približné.** Beh (3,3 m/s) a šprint (5,9 m/s) pochádzajú z komunitného opisu herných mechaník. Plazenie, drep a pomalá chôdza sú odhady, rovnako každá trieda vozidiel a vrtuľníky.

**Arma** (km/h). **Približné.** Tempá pechoty sú komunitné merania: asi 5 km/h chôdza, 9 km/h taktické tempo v drepe, 15 km/h klus a asi 21 km/h šprint. Najvyššie rýchlosti vozidiel sú nastavené maximá vanilkových vozidiel Arma 3 v každej triede, z externého zoznamu. Pomalšie režimy vozidiel sú odhady.

**DCS / War Thunder / IL-2** (km/h). Každé lietadlo a vrtuľník v palete má vlastný profil. Rýchlosti plavby a maximálne sú **uverejnené údaje** skutočných lietadiel, ktoré simulácie modelujú presne. Maximum je pri hladine mora pre prúdové lietadlá a pri menovitej výške pre vrtuľové lietadlá, a poznámka každého profilu hovorí, ktoré. Pomalé a bojové rýchlosti sú typické hodnoty. Pozemné vozidlá používajú uverejnené cestné rýchlosti skutočných vozidiel, zaokrúhlené (**približné**). Lode používajú uverejnené najvyššie rýchlosti svojej triedy.

**Iné** (m/s). **Približné** bežné hodnoty zo skutočného sveta: plazenie 0,5, drep 1,5, chôdza 1,4, beh 3,5, šprint 6.

## Zdroje {#sources}

Counter-Strike 2
- [Definície zbraní CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Stránky zbraní CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com zbrane (násobiče rýchlosti behu)](https://valorant-api.com/v1/weapons)
- [VLR.gg: rýchlosť noža 6,75 m/s](https://vlr.gg/post/4240306)
- [Podpora Riot: Chôdza, beh a drep](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Fóra EA: rýchlosť pohybu v Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Sprievodca pohybom v Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Predpremiérová správa o šprinte 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: príspevok o herných mechanikách Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (rýchlosti nezverejňuje)

Arma
- [Fóra Bohemia: rýchlosť chôdze](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Fóra Bohemia: ladenie rýchlosti pohybu](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Evidencia pripomienok Arma 3: rýchlosť šprintu](https://feedback.bistudio.com/T64047)
- [Arma 3 Field Manual: ovládanie pechoty](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Štatistiky vozidiel Arma 3 podľa frakcie (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Wikipédia: špecifikácie každého typu lietadla a vrtuľníka, prepojené z každého profilu v `air.json`
- [V speeds](https://en.wikipedia.org/wiki/V_speeds), pre typické rýchlosti priblíženia a boja
- [Wiki War Thunder](https://wiki.warthunder.com/), pre pozemné vozidlá
- [Torpédoborec triedy Arleigh Burke](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) a uverejnené rýchlosti ostatných tried lodí

Iné
- [Preferovaná rýchlosť chôdze](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Toblerova turistická funkcia](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
