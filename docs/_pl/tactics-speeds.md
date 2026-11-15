---
title: "Prędkości ruchu"
parent: "Tablica taktyczna"
nav_order: 1
lang: "pl"
source: "tactics-speeds.md"
source_hash: "2c00ee3717c2"
translated: true
outdated: false
---

# Prędkości ruchu

Ile czasu zajmie żołnierzowi, czołgowi albo odrzutowcowi dojście z punktu A do B? Ta strona mówi, jak szybko porusza się każda figura na [tablicy taktycznej](tactics-board.md) i skąd biorą się te liczby, byś mógł ufać czasom w swoim planie albo je zmienić.

[Tablica taktyczna](tactics-board.md) liczy czas planu z tego, jak szybko porusza się każda figura. Prędkości pochodzą z jednego pliku na grę w `src/tactics/speeds/`: prędkość dla każdego trybu ruchu każdej klasy (piechota, pojazdy lądowe, łodzie, samoloty, helikoptery), a także nazwane profile, na przykład jeden na każdą broń CS2 albo jeden na każdy typ samolotu. Każdy plik wymienia swoje źródła, a każda wartość mówi, czy jest **oficjalna** (dane samej gry albo opublikowane parametry prawdziwego samolotu), czy **przybliżona** (zmierzona przez społeczność albo typowa).

To są punkty wyjścia. **Każda figura może nadpisać swoje prędkości na tablicy**, więc plan może użyć zmierzonej prędkości, obładowanego żołnierza albo uszkodzonego czołgu.

## Tryby {#modes}

| Klasa | Tryby |
|---|---|
| Piechota | czołganie (leżąc), kucanie, chód (wolny, cichy krok), bieg (domyślny ruch), sprint |
| Pojazdy lądowe, łodzie | czołganie, ostrożnie, normalnie (teren), pośpiech (prędkość maksymalna na drodze) |
| Samoloty, helikoptery | wolno (podejście, krążenie, zawis), przelot, walka (prędkość na zakręcie albo nalot), maksymalnie |

Tryb, którego gra nie ma, zostaje pusty: CS2 i Valorant nie mają sprintu ani leżenia.

## Zbocza {#slopes}

Każdy plik mówi też, jak gra traktuje zbocza. CS2, Valorant i Squad ograniczają prędkość poziomą, więc zbocze nie spowalnia gracza. Arma spowalnia piechotę na zboczach, więc jej plik i plik ogólny używają funkcji wędrówki Toblera. Battlefield i symulatory pojazdów używają zwykłej kary za nachylenie.

## Według gry {#per-game}

**Counter-Strike 2** (jednostki na sekundę; jedna jednostka to jeden cal). **Oficjalne.** Prędkości biegu to wartości `m_flMaxSpeed` z definicji broni w grze: nóż i C4 250, granaty 245, pistolety 240 (Desert Eagle 230, R8 180), pistolety maszynowe 220-240, karabiny 210-225, AWP 200, karabiny maszynowe 195 i 150. Snajperka AWP z lunetą (100), AUG i SG 553 (150) oraz G3SG1 i SCAR-20 (120) mają własne profile. Chód to bieg × 0,52, a kucanie to bieg × 0,34. Valve nie publikuje tych dwóch mnożników, ale każda broń widać w nagraniach demo. Aby sprawdzić plan względem prawdziwego ruchu, wczytaj demo z tej samej mapy i porównaj prędkości graczy.

**Valorant** (m/s). Nóż biegnie z prędkością 6,75 m/s. Każda broń mnoży to przez swój mnożnik prędkości biegu z danych gry, co daje prędkości pokazywane w grze w Arsenale: 5,73 dla większości pistoletów i pistoletów maszynowych, 5,4 dla karabinów, 5,13 dla ciężkich i Operatora, 5,06 dla strzelb. Te prędkości biegu są dokładne. Prędkości chodu i kucania są **szacunkami** (0,55 i 0,4 × bieg), bo Riot ich nie publikuje. Profile snajperek z lunetą też są szacunkami.

**Battlefield** (km/h). **Przybliżone.** EA nie publikuje liczb ruchu. Piechota: około 1 m/s leżąc, 2 kucając, 4 biegnąc i 6,4 sprintem. Pojazdy, samoloty, helikoptery i łodzie dostają typowe prędkości z gry dla swojej klasy.

**Squad** (km/h). **Przybliżone.** Bieg (3,3 m/s) i sprint (5,9 m/s) pochodzą z opisu mechaniki gry napisanego przez społeczność. Czołganie, kucanie i wolny chód to szacunki, tak samo jak każda klasa pojazdów i helikopterów.

**Arma** (km/h). **Przybliżone.** Tempa piechoty to czasy społeczności: około 5 km/h na chodzie, 9 km/h w taktycznym tempie kucając, 15 km/h w truchcie i około 21 km/h w sprincie. Maksymalne prędkości pojazdów to skonfigurowane maksima standardowych pojazdów Arma 3 w każdej klasie, z zestawienia zewnętrznego. Wolniejsze tryby pojazdów są szacunkami.

**DCS / War Thunder / IL-2** (km/h). Każdy samolot i helikopter w palecie ma własny profil. Prędkości przelotowe i maksymalne to **opublikowane dane** prawdziwych samolotów, które symulatory modelują dokładnie. Maksimum to na poziomie morza dla odrzutowców i na nominalnej wysokości dla samolotów śmigłowych. Notatka każdego profilu mówi, które. Prędkości wolne i bojowe są typowymi wartościami. Pojazdy lądowe używają opublikowanych prędkości drogowych prawdziwych pojazdów, zaokrąglonych (**przybliżone**). Okręty używają opublikowanych prędkości maksymalnych swojej klasy.

**Inne** (m/s). **Przybliżone** domyślne wartości ze świata rzeczywistego: czołganie 0,5, kucanie 1,5, chód 1,4, bieg 3,5, sprint 6.

## Źródła {#sources}

Counter-Strike 2
- [Definicje broni CS2 (`weapons.vdata`), SteamDB GameTracking-CS2](https://github.com/SteamDatabase/GameTracking-CS2/blob/master/game/csgo/pak01_dir/scripts/weapons.vdata)
- [Strony broni CSDB](https://csdb.gg/weapons/)
- [Counter-Strike Wiki: Movement Mechanics](https://counterstrikewiki.com/Movement_Mechanics)

Valorant
- [valorant-api.com weapons (mnożniki prędkości biegu)](https://valorant-api.com/v1/weapons)
- [VLR.gg: prędkość noża 6,75 m/s](https://vlr.gg/post/4240306)
- [Wsparcie Riot: Walking, Running and Crouching](https://support.riotgames.com/en-us/valorant/gameplay/walking-running-and-crouching)

Battlefield
- [Forum EA: prędkość ruchu w Battlefield 6](https://forums.ea.com/discussions/battlefield-6-beta-feedback-en/movement-speed/12440378)
- [Przewodnik po ruchu w Battlefield 6](https://deltiasgaming.com/?p=309455)
- [Raport przedpremierowy o sprincie 6,4 m/s](https://www.reddit.com/r/Battlefield/comments/1jci338/for_reference/mi9ahrb/)

Squad
- [r/joinsquad: wpis o mechanice gry Squad (2018)](https://www.reddit.com/r/joinsquad/comments/7xeh9g/squad_game_mechanics_post/)
- [Squad](https://joinsquad.com/) (nie publikuje prędkości)

Arma
- [Forum Bohemia: prędkość chodu](https://forums.bohemia.net/forums/topic/176583-walking-speed/)
- [Forum Bohemia: strojenie prędkości ruchu](https://forums.bistudio.com/topic/144224-movement-speed-tweaking/)
- [Tracker uwag do Arma 3: prędkość sprintu](https://feedback.bistudio.com/T64047)
- [Podręcznik Arma 3: Infantry Controls](https://community.bistudio.com/wiki/Arma_3_Field_Manual_-_Infantry_Controls)
- [Statystyki pojazdów Arma 3 według frakcji (holy.gg)](https://www.holy.gg/en/post/arma-3-complete-vehicle-stats-by-faction)

DCS / War Thunder / IL-2
- Specyfikacje Wikipedii każdego typu samolotu i helikoptera, podlinkowane z każdego profilu w `air.json`
- [V speeds](https://en.wikipedia.org/wiki/V_speeds), dla typowych prędkości podejścia i walki
- [Wiki War Thunder](https://wiki.warthunder.com/), dla pojazdów lądowych
- [Arleigh Burke-class destroyer](https://en.wikipedia.org/wiki/Arleigh_Burke-class_destroyer) oraz opublikowane prędkości innych klas okrętów

Inne
- [Preferred walking speed](https://en.wikipedia.org/wiki/Preferred_walking_speed)
- [Tobler's hiking function](https://en.wikipedia.org/wiki/Tobler%27s_hiking_function)
