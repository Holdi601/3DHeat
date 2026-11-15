---
title: "Zachowanie zbiorowe"
parent: "Wnioski"
nav_order: 3
lang: "pl"
source: "collective-behaviour.md"
source_hash: "bb95ded2346c"
translated: true
outdated: false
---

# Zachowanie zbiorowe: tłumy, stada, kawalerie i decyzje pod presją

Gracze w meczu zachowują się jak ludzie wszędzie: zbijają się przy drzwiach, idą za tym, który poszedł pierwszy, trzymają się razem albo się rozciągają, cofają się po ciężkich stratach i ryzykują więcej po złym życiu. **Miary soczewki zachowania** mierzą te wzorce metodami nauki o tłumach, fizyki ruchu zbiorowego, ekonomii behawioralnej i psychologii wojskowej. Każda jest porównywana z własnym modelem zerowym, a wyniki czyta się przez pasujące pozycje [bazy wiedzy](knowledge.md).

## Wypróbuj {#try-it}

1. Wczytaj jeden albo więcej meczów z czasem, pozycjami i drużynami.
2. Otwórz **Wnioski** i uruchom.
3. Rozwiń **Miary soczewki**: miary zachowania są wypisane razem z innymi (Zgodność kierunku, Stadne przechodzenie tras, Pasy i ślady, Ścisk, Liderzy i naśladowcy, Spójność i maruderzy, Punkt załamania, Ryzyko po stratach, Serie, Zgodność zakupów, Tłumienie), każda z liczbami, testem i literaturą, która ją wyjaśnia.
4. **Podsumowanie** je przytacza; **Napisz z pomocą SI** wysyła je razem z raportem.

## Miary {#the-measures}

Trasy są przeliczane na jeden punkt co 2 s (pozycja na końcu przedziału i prędkość w jego trakcie). Odległości są skalowane typową rozstawą danych, czyli medianą odległości od jednostki do jej najbliższego kolegi z drużyny, więc ta sama miara działa dla piechoty, czołgów i samolotów.

| Miara | Co mierzy | Model zerowy i test | Wiedza |
|---|---|---|---|
| Zgodność kierunku | Polaryzacja (długość średniego kursu jednostek) ruchomych jednostek każdej strony co 2 s, krążenie (obrót wokół środka ciężkości), udział czasu spolaryzowanego, krążenia i roju, według fazy meczu; w walkach dwóch zgodnych stron udział zabójstw strony bardziej zgodnej | Trasa każdej jednostki przesunięta w czasie w obrębie meczu (zachowuje ścieżkę, łamie równoczesność); test zmiany znaku w oknach 60 s | Vicsek 1995, Couzin 2002, Tunstrøm 2013 |
| Stadne przechodzenie tras | Jak często jednostka opuszcza miejsce tak, jak zrobił to kolega przed nią (w ciągu 30 s), tą samą drogą wejścia, w stosunku do własnych udziałów wyjść z tego miejsca oraz do kopiowania wcześniejszego przejścia wroga | Wyjścia tasowane w obrębie miejsca i wejścia; efekt to kopiowanie kolegi minus kopiowanie wroga (problem odbicia Manskiego: kopiowanie i wspólny plan wyglądają tak samo) | Banerjee 1992, Bikhchandani i in. 1992, Manski 1993 |
| Pasy i ślady | Boczna segregacja dwóch kierunków w miejscach z ruchem przeciwnym; udział ruchu na najbardziej uczęszczanych 10% terenu, jego współczynnik Giniego i pokrycie najbardziej uczęszczanego terenu meczów | Kierunki tasowane między całymi wizytami; dwie siatki przesunięte o pół miejsca, każda testowana, Bonferroni | Helbing i in. 1997, 2005 |
| Ścisk | Prędkość (względem własnego tempa jednostki) i przepływ według liczby sąsiadów w promieniu dwukrotności typowej rozstawy, spadek przepustowości w najgęstszej klasie, na najbardziej uczęszczanym terenie; zgony na godzinę w tłumach; strzały na minutę kolegów w pobliżu (lenistwo społeczne) | Własna korelacja prędkości i gęstości każdej jednostki, zmiana znaku po jednostkach, minimalny efekt ρ poza ±0,05; dokładne testy częstości | Helbing i in. 2000, Seyfried i in. 2005, Latané i in. 1979 |
| Liderzy i naśladowcy | Dla kolegów podróżujących razem: opóźnienie czasowe (do 8 s), przy którym kurs jednego najlepiej przewiduje kurs drugiego; graf liderów, przechodniość trójek, wskaźniki zgonów i zabójstw liderów | Pary z jedną trasą przesuniętą w czasie dają próg 95%; test dwumianowy względem 5% | Nagy i in. 2010, Couzin i in. 2005 |
| Spójność i maruderzy | Czas spędzony dalej niż trzykrotność typowej rozstawy strony od najbliższego kolegi; tam wskaźnik zgonów w porównaniu z wskaźnikiem w grupie; rozstawa strony w zestawieniu z jej udziałem w zabójstwach walki | Dokładny warunkowy test dwóch częstości Poissona | Shils i Janowitz 1948, Siebold 2007 |
| Punkt załamania | Prędkość zbliżania się do wroga (w tempie własnej strony) według udziału strony utraconego w ostatniej minucie; najniższy poziom strat, przy którym strony się wycofują | Jednostronny bootstrap klastrowy wobec wycofania o jedną dziesiątą tempa (straty przychodzą tam, gdzie strony się spotykają, a strony, które się spotykają, przestają się zbliżać), Bonferroni po poziomach | Dupuy 1987, Rowland 2006 |
| Ryzyko po stratach | Udział następnego życia spędzony przed własną stroną w kierunku wroga, ponad udział własnej strony i innych wracających jednostek w tym czasie: po życiu straconym bez zabójstwa w porównaniu z po takim z zabójstwem; wczesny zgon po wczesnym zgonie (tilt) | Życia każdej jednostki tasowane (pierwsze zachowane), więc obciążenie skończoną sekwencją jest w modelu zerowym | Kahneman i Tversky 1979, Thaler i Johnson 1990 |
| Serie | P(zabójstwo po k zabójstwach) − P(zabójstwo po k zgonach), k = 1..3 | Sekwencja każdego gracza tasowana 1000 razy: odejmowane jest obciążenie, które pokazali Miller i Sanjurjo; Bonferroni po k | Gilovich i in. 1985, Miller i Sanjurjo 2018 |
| Zgodność zakupów | Kappa Fleissa pasm wyposażenia (eko, siła, pełne; tercyle poza Counter-Strike) w rundzie strony | Rundy gracz-runda strony tasowane między jej rundami | Fleiss 1971 |
| Tłumienie | Prędkość w 4 s po obrażeniach niezabijających wobec 4 s przed nimi oraz strzały w 10 s po wobec przed, przy trafieniach i przy spokojnych chwilach tej samej jednostki | Zmiana znaku po jednostkach, minimalne efekty 0,05 tempa i jeden strzał na minutę | Rowland 2006 |

Każda wartość p w raporcie przechodzi przez korektę Benjaminiego-Hochberga (`q`) na fałszywe odkrycia. Miara jest pomijana, gdy dane jej nie uniosą: zakup wymaga rund i wartości wyposażenia, tłumienie zdarzeń obrażeń, serie i ryzyko zabójstw i zgonów przypisanych jednostkom.

## W analizie masowej {#in-the-mass-analysis}

Każde podsumowanie meczu (`<match>.summary.json`, zob. [Analiza masowa](mass-analysis.md)) zawiera te same miary dla tego meczu w sekcji `behaviour`, więc tysiące meczów można porównać bez ponownego czytania ich wierszy.

## Jak dobrze to działa {#how-well-it-works}

Na symulowanych bitwach z wbudowanym każdym efektem i na tych samych światach bez nich (`src/insights/behaviour/sim.ts`, `behaviour.test.ts`): każda miara znajduje zaszyty efekt, a światy zerowe zostają poniżej progu fałszywych odkryć. Ryzyko po stratach ma najmniejszą moc. Stadne przechodzenie tras nie odróżni kopiowania od wspólnego planu (strona, która ma jeden wspólny cel, jest tą miarą „stadna”).

## Dla programistów {#for-developers}

- `src/insights/behaviour/acc.ts` - akumulator (przeliczone trasy, zdarzenia, rundy) i `finish`; `motion.ts` i `choice.ts` to miary; `bstats.ts` to pomocnicze funkcje permutacji, bootstrapu i kappy; `shows.ts` to wzorce i zdania, które czyta soczewka (`lens.<measure>`).
- `feed.ts` zasila go z fragmentów workera wniosków; `summaryTap.ts` z podsumowania meczu, gdy strumieniuje tabelę.
- Wiedza: `src/insights/knowledge/behaviour.ts` (wpisy), `patterns-behaviour.ts`, `refs-behaviour.ts` (źródła, każde sprawdzone w rekordzie Crossref albo Open Library).
- Etykiety: `lens.metric.<measure>` w `locales/*/lens.json`.
