---
title: "Analiza meczu (CS2)"
nav_order: 10
lang: "pl"
source: "match-analysis.md"
source_hash: "0b9ab06a759f"
translated: true
outdated: false
---


# Analiza meczu (Counter-Strike 2)

Karta **Mecz** odtwarza nagranie jako figury, a dla meczu Counter-Strike 2 pokazuje też tablicę wyników: kto wygrał każdą rundę, jak, i kto zdobył zabójstwa. Użyj jej, by przejrzeć mecz runda po rundzie, a potem przeskoczyć do tej samej chwili na mapie cieplnej.

Karta Mecz odtwarza każde nagranie jako figury: nagranie War Thunder albo Tacview albo demo CS2, wymienione pod **Mecze w powtórce** ([Powtórka meczu](match-replay.md)). Plik `.match.json` CS2 dodaje tablicę wyników opisaną na tej stronie.

## Przejrzyj mecz CS2 {#review-a-cs2-match}

1. Zamień demo ([niżej](#where-the-data-comes-from)) na plik `.parquet` i plik `.match.json`.
2. W zakładce **Mapa cieplna** wczytaj plik `.parquet` pod **Źródło**.
3. Otwórz zakładkę **Mecz** i kliknij **Wczytaj pliki meczów…**, albo upuść plik `.match.json` na widok.
4. Kliknij mecz w **Podsumowania meczów**, a potem komórkę paska rund, żeby otworzyć tę rundę.
5. Kliknij **Pokaż rundę**, żeby zobaczyć tę rundę na mapie cieplnej, albo **Powtórka rundy**, żeby ją obejrzeć jako figury.

![Karta Mecz: pasek rund z otwartą rundą, lista zabójstw i Tablica wyników](../assets/img/en/match-analysis-round.webp)

Słowa takie jak KAST, ADR, eco, force buy i trade są w [słowniczku](glossary.md#counter-strike-words).

## Skąd są dane {#where-the-data-comes-from}

Konwerter demo z [3DHeat CS2](https://github.com/Holdi601/3DHeat-CS2) zamienia dema na dwa pliki na mecz, w folderze dla każdej mapy:

```bash
python -m heat3d_cs2 demos <demo files or folders> -o out
```

| Plik | Wczytywany w | Zawiera |
|---|---|---|
| `<match>.parquet` | zakładka **Mapa cieplna** (panel Źródło, jak każdy Parquet — jeden plik, kilka albo cały folder) | pozycję każdego gracza osiem razy na sekundę i każde zdarzenie w miejscu, gdzie zaszło: zabójstwo, zgon, zranienie, strzał, rzut, dym, błysk, HE, mołotow, dekoy, oślepienie, podłożenie, rozbrojenie, eksplozja; z `match`, `round`, `roundId`, `event`, `player`, `side`, `team`, kierunkiem patrzenia, `weapon`, `place`, `opening`, `traded`... |
| `<match>.match.json` | zakładka **Mecz** | drużyny, wynik, każdą rundę (zwycięzca, jak, ekonomia, podłożenie, każde zabójstwo po kolei, clutche, ocaleni), wiersz tablicy wyników każdego gracza |

Stopka pliku Parquet niesie instrukcje odczytu (klucz `heat3d`), więc otwiera się bez żadnych ustawień: gracz jako osoba, strona jako grupa, każda runda (`roundId`, „<match> #NN”) jako sesja, kierunek patrzenia włączony i świat we właściwym układzie (świat CS2 jest prawoskrętny z osią Z w górę; odczytany jako domyślne mapowanie Z-w-górę wyszedłby lustrzanie odbity). Zob. [Mapowanie kolumn](column-mapping.md) i [Wczytywanie plików](loading-files.md). `python -m heat3d_cs2 map <map>` eksportuje geometrię mapy w tym samym układzie, wczytywaną w **Poziom**.

Konwencje stojące za liczbami są konwertera (opisane w jego README i zapisane w każdym podsumowaniu): zgon jest **pomszczony**, gdy jego zabójca zostaje zabity przez jednego z kolegów ofiary w ciągu **5 s**; **KAST** to udział rund z zabójstwem, asystą (asysta po błysku też się liczy), przetrwaniem albo pomszczonym zgonem; **obrażenia** to faktycznie utracone zdrowie, tylko wrogów; **clutch** to bycie ostatnim żywym po jednej stronie, gdy stoją wrogowie, wygrany, gdy ta strona wygra; **zakup** dla każdej strony z średniej wartości wyposażenia pod koniec czasu zamrożenia — pierwsza runda każdej regulaminowej połowy to runda pistoletowa (w dogrywce żadna), potem poniżej 1500 $ to eco, poniżej 4000 $ to force buy, a wszystko więcej to pełny zakup.

## Karta {#the-tab}

Pasek boczny karty Mecz ma na górze przełącznik trybu i wybór sesji mapy cieplnej, poniżej sekcje meczu, a potem **Filtry**, **Poziom** i **Kamera** mapy cieplnej — widok to mapa cieplna tego Parquet, który jest wczytany w karcie Mapa cieplna.

### Podsumowania meczów {#match-summaries}

| Kontrolka | Robi |
|---|---|
| **Wczytaj pliki meczów…** | wybiera pliki `.json` (kilka naraz): podsumowania `.match.json` |
| upuszczenie na widok | pliki JSON upuszczone na widok, gdy karta Mecz jest otwarta, wczytują się tak samo (inne pliki są ignorowane) |
| **Wyczyść** | usuwa każdy mecz |
| **Wszystkie mecze** (przy dwóch lub więcej) | „N meczów, M rund”: statystyki ze wszystkich |
| wiersz meczu | „TeamA 13 vs TeamB 9”, mapa · N rund: otwiera ten mecz |

Plik jest przyjmowany, gdy jest JSON z `"format": "heat3d-cs2-match"` i tablicami `rounds`, `players` i `teams`. Błędy są wypisywane pod przyciskami: „<plik>: nie JSON”, „<plik>: nie jest podsumowaniem meczu CS2 (heat3d-cs2-match)”, „<plik>: brak rounds, players albo teams”. Mecz wczytany ponownie (ta sama nazwa `match`) zastępuje wcześniejszy. Mecze są sortowane według mapy, a potem nazwy. Gdy wczytany jest dokładnie jeden mecz, zostaje otwarty; w przeciwnym razie wybór zostaje (domyślnie wszystkie mecze).

Gdy nic nie jest wczytane, sekcja tłumaczy: zamień przez `python -m heat3d_cs2 demos`, wczytaj tutaj pliki `.match.json`, a pliki `.parquet` w karcie Mapa cieplna.

### Mecz (jeden mecz otwarty) {#match-one-match-open}

**Nagłówek:** obie drużyny z wynikiem, mapa, połowy — „połowy 7-5, 6-6”: rundy 1–12 i 13–24 (gra premierowa i konkurencyjna to MR12; własna długość połowy podsumowania, gdy ją podaje, więc 1–15 i 16–30 dla MR15) — a potem, gdy mecz poszedł do dogrywki, jego wynik osobno: „dogrywka 4-2”, rundy po obu połowach. Runda zremisowana nie liczy się żadnej drużynie. I „N rund przerwanych w demie”, gdy podsumowanie zawiera niekompletne rundy.

**Pasek rund:** komórka na rundę, zabarwiona stroną, która wygrała, z jej numerem i znakiem, jak się skończyła. Runda zremisowana (bez zwycięzcy) to neutralna szara komórka z oznaczeniem `=`, nigdy kolorem strony; jej podpowiedź mówi „Runda 30: remis — żadna strona jej nie wygrała”.

| Znak | Zakończona przez |
|---|---|
| B | bomba wybuchła |
| D | bomba rozbrojona |
| K | wyeliminowanie |
| T | skończył się czas |
| S | kapitulacja |
| = | remis |
| ? | inne |

Podział zaznacza początek drugiej połowy (runda 13 albo runda po długości połowy z podsumowania) i każdej trzyrundowej połowy dogrywki (rundy 25, 28, 31, …). Najedź na komórkę: „Runda 7: TeamA (T) - bomba wybuchła, podłożona A” („…, podłożona, nieznane miejsce”, gdy podsumowanie nie ma miejsca) oraz zakup i wartość wyposażenia obu stron. Kliknij, żeby otworzyć rundę; kliknij ponownie, żeby ją zamknąć („Kliknij rundę, by zobaczyć jej zabójstwa, ekonomię i powtórkę”).

**Runda:**

- „Runda 7: <drużyna> wygrała - <jak>” („Runda 30: remis — żadna strona jej nie wygrała” przy remisie) i jak długo trwała runda (od końca zamrożenia do rozstrzygnięcia, m:ss);
- ekonomia: drużyna każdej strony, zakup (pistolet, eco, force buy, pełny zakup) i wartość wyposażenia („4350 $”);
- podłożenie: miejsce, gracz i czas od początku rundy (z każdej wersji podsumowania); „Podłożone przez <gracz> o 1:05, nieznane miejsce”, gdy miejsce nie jest znane;
- **lista zabójstw**, po kolei: czas od początku rundy, atakujący (w kolorze strony; „world” przy braku atakującego), broń i flagi — **HS** strzał w głowę, **WB** przez ścianę, **SM** przez dym; **open** pierwsze zabójstwo rundy, **trade** (pomszczenie kolegi w ciągu 5 s), **traded** (zabójca został zabity w ciągu 5 s), **team** zabójstwo drużynowe (samobójstwo nie jest żadnym). Zabójstwa po rozstrzygnięciu rundy są przyciemnione;
- clutche: „<gracz> (T) sam przeciw 3: wygrał clutch” / „przegrał”;
- kto był żywy na końcu, osobno dla każdej strony („nikt”);
- **Pokaż rundę**: wszystko z tej rundy na mapie cieplnej;
- **Powtórka rundy**: odtwarza rundę jako pudełka, od jej początku (poniżej).

Przyciski **Pokaż na mapie cieplnej** (zob. [niżej](#show-in-the-heatmap)) dla tego meczu albo otwartej rundy.

### Tablica wyników {#scoreboard}

Tabela na drużynę, wiersz na gracza:

| Kolumna | Co to jest |
|---|---|
| K, D | zabójstwa, zgony |
| A | asysty, wliczając asysty po błysku |
| ± | zabójstwa minus zgony (zielone powyżej 0, czerwone poniżej) |
| ADR | obrażenia na rundę, faktycznie utracone zdrowie |
| KAST | % rund z zabójstwem, asystą, przetrwaniem albo pomszczonym zgonem |
| HS | % zabójstw strzałem w głowę |
| Open | wygrane-przegrane pojedynki otwierające |
| Cl | wygrane/rozegrane clutche |

Najedź na gracza: zabójstwa pomszczające, ile razy został pomszczony, asysty po błysku, oślepieni wrogowie, obrażenia od granatów i rundy z wielokrotnymi zabójstwami („2×3k”). **Kliknij gracza**, by zobaczyć jego zabójstwa i zgony na mapie cieplnej (w tym meczu).

### We wszystkich meczach (Wszystkie mecze) {#across-matches-all-matches}

Ze wszystkich wczytanych meczów:

- „N meczów · M rund · <mapy>” oraz „N rund zremisowanych, wygranych przez żadną stronę”, gdy były remisy;
- **Wygrane rundy** dla każdej strony: ogółem, w rundach **pistoletowych** (rundy pistoletowe z podsumowania), oraz w zakupach **eco**, **force** i **pełne** (każde jako procent z rozegranymi rundami; najedź, by zobaczyć „wygrane z rozegranych”). Runda zremisowana jest rozegrana przez obie strony i wygrana przez żadną;
- **Bomba**: podłożenia na miejsce i jak często strona T potem wygrywała te rundy („12 podłożeń na A (T wygrało 67%)”), podłożenia, których miejsca podsumowanie nie zna, osobno („2 podłożenia na nieznanym miejscu (T wygrało 50%)”), albo „nigdy nie podłożono”; jak kończyły się rundy, najczęstsze pierwsze;
- „Strona, która wzięła pierwsze zabójstwo, wygrała N% tych rund.” (samobójstwo nie jest pierwszym zabójstwem; runda zremisowana nie zamienia otwarcia);
- **Pojedynki otwierające, gdzie**: dziesięć miejsc z największą liczbą zabójstw otwierających (według miejsca ofiary; nazwy miejsc gry zrobione czytelnymi, „TopofMid” → „Top of Mid”), pojedynki i udział wygranych przez stronę T;
- **Gracze**: piętnastu najlepszych według zabójstw minus zgony, połączonych ze wszystkich ich meczów (dopasowanie po Steam ID): mecze, K-D, ADR i KAST ważone rozegranymi rundami, HS% ważone zabójstwami, pojedynki otwierające. **Kliknij gracza**, by zobaczyć jego zabójstwa i zgony ze wszystkich meczów na mapie cieplnej.

Przyciski Pokaż na mapie cieplnej dla wszystkich wczytanych meczów są pod tym.

## Co rozstrzygnęło rundy {#what-decided-the-rounds}

Ta karta liczy; [Wnioski](insights.md#who-won-what-decided-the-rounds) wyjaśniają. Gdy wczytana jest tabela mapy cieplnej meczu (zawiera kolumnę `won`), **Wnioski** dzielą rundy każdej strony według tego, co się w nich stało - pojedynek otwierający, zakup, pomszczona pierwsza śmierć, podłożenie, wyposażenie użytkowe, wczesny pierwszy kontakt, każde utrzymane miejsce i każde miejsce osiągnięte w pierwszych 25 s - i mówią, co zrobiło różnicę, z różnicą odsetków wygranych, jej 95-procentowym przedziałem i q, oraz *mało rund*, gdy ramię ma mniej niż osiem. Wskazują punkty zwrotne (zabójstwa i podłożenia, które najbardziej zmieniły szansę na wygraną) oraz graczy i miejsca, które najwięcej dodały lub odebrały, a **Podsumowanie** i **Komentator** zaczynają od nich. Zmyślony przykład:

> T wygrało 79% z 19 rund, w których trzymało Mid, wobec 24% z 21 bez tego (55 punktów, 95% od 26 do 74) - q 0,004.
>
> Punkty zwrotne: runda 17 w 48 s, zabójstwo CT na B site zmieniło jego szansę z 31% na 58% i wygrało ono rundę.

Jeden mecz ma mniej niż 30 rund, więc jego szanse na wygraną pochodzą ze stałego modelu wstępnego opartego na żywych graczach, podłożeniu i zegarze; tekst to mówi. W wielu meczach te same pytania zadaje [analiza masowa](mass-analysis.md#who-won).

## Pokaż na mapie cieplnej {#show-in-the-heatmap}

Każdy link ustawia **filtry** mapy cieplnej, więc to, co jest pokazane, pozostaje widoczne i edytowalne w panelu Filtry, a **Pokaż wszystkie** je czyści. Działają na tabeli mapy cieplnej wczytanej w karcie Mapa cieplna; karta Mecz sama jej nigdy nie wczytuje.

| Przycisk | Pokazane zdarzenia |
|---|---|
| **Pozycje** | `position` — gdzie byli gracze, osiem razy na sekundę |
| **Zabójstwa** | `kill` — gdzie stał zabójca |
| **Zgony** | `death` — gdzie upadła ofiara |
| **Otwarcia** | `kill` i `death` z `opening` = 1 — pierwsze zabójstwo każdej rundy, gdzie stali obaj (oferowane tylko, gdy tabela ma kolumnę `opening`) |
| **Smoki** | `smoke` — gdzie wylądowały dymy |
| **Flashe** | `flash` — gdzie wybuchły błyski |
| **Mołotowy** | `molotov` — gdzie płonęły mołotowy i zapalające |
| **HE** | `he` — gdzie wybuchły granaty HE |
| **Podłożenia** | `plant` — gdzie podłożono bombę |
| **Strzały** | `shot` — skąd oddano strzały |

Zakres zależy od tego, gdzie są przyciski: wszystkie wczytane mecze, ten mecz albo ta runda („Pokaż na mapie cieplnej - runda 7”).

To, czego nie da się zastosować, jest powiedziane pod przyciskami, a nie cicho odfiltrowane do niczego: „brak zachowanej kolumny meczu — mecz nie zastosowany”, „mecz: X nie ma w wczytanych danych”, tak samo dla rundy i zdarzeń, „gracza X nie ma w wczytanych danych”, „strony X nie ma w wczytanych danych”, „brak danych mapy cieplnej: wczytaj pliki .parquet meczów w karcie Mapa cieplna”. Bez wczytanych danych linki też mówią „Wczytaj pliki .parquet meczów w karcie Mapa cieplna, żeby je zobaczyć na mapie.”

**Powtórka rundy** dodatkowo przełącza mapę cieplną na **Powtórkę pudełek**, oś czasu w tryb *odtwarzania* z oknem ustawionym na *czas życia*, przewija do początku sesji rundy i odtwarza. Gdy runda nie jest sesją wczytanych danych: „ta runda nie jest sesją wczytanych danych: nie ma czego odtwarzać”.

## Dla programistów {#for-developers}

Kod: [`src/ui/match/MatchPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/match/MatchPanel.tsx),
[`src/match/matchDoc.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/matchDoc.ts),
[`src/match/focus.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/match/focus.ts),
[`src/state/matchStore.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/state/matchStore.ts).

### Wersje podsumowań {#summary-versions}

Karta czyta podsumowania wersji 1 i wersji 2 (`"version"` w pliku) obok siebie i traktuje je jednakowo:

| | Wersja 2 | Wersja 1 |
|---|---|---|
| czas podłożenia | sekundy od początku rundy, jak zabójstwa | sekundy meczu; karta odejmuje początek rundy |
| miejsce podłożenia | `A` albo `B`; puste, gdy demo tego nie mówi | `A`, `B` albo numer encji — odczytywane jako nieznane miejsce |
| długość połowy | `halfLength`, od miejsca, w którym strony pierwszy raz się zamieniają; 12, gdy jest null | 12 (MR12) |
| rundy pistoletowe | `pistolRounds` (runda 1 i pierwsza runda po połowie) | rundy, których zakup to `pistol` |
| runda zremisowana | `winner` i `winnerTeam` puste | - |
| samobójstwo | `suicide` na zabójstwie, nigdy jako zabójstwo drużynowe | po tym, że atakujący i ofiara to ten sam gracz |

`noscope` i `attackerBlind` zabójstwa (wersja 2) nie są pokazywane w karcie Mecz, która też nie pokazuje żadnego miejsca z tabeli mapy cieplnej, więc pusty `place` wiersza granatu tam niczego tutaj nie zmienia.

Jak fokus staje się filtrami (`focusFilters`):

- **mecz** → filtr kategorii na kolumnie `match`;
- **runda** → filtr zakresu `round` = N na liczbowej kolumnie `round` (filtr kategorii na kategorycznej), a sesja rundy (`<match> #NN`) jest wybrana w wyborze sesji;
- **zdarzenia** → filtr kategorii na kolumnie `event`;
- **gracz** → filtr osoby na tym graczu;
- **strona** → filtr grupy.
