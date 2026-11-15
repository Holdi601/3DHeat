---
title: "Analiza zbiorcza"
nav_order: 8
lang: "pl"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: true
---

# Analiza zbiorcza: tysiące meczów naraz

**Analiza masowa** pokazuje, co daje cały folder meczów: który pojazd wygrywa najczęściej, która strona ma przewagę, gdzie dzieje się najwięcej. Używaj jej, gdy masz dużo więcej meczów, niż zdołasz obejrzeć.

Działa na podstawie małego podsumowania każdego meczu, więc tysiąc albo dziesięć tysięcy meczów otwiera się szybko. Pełne wiersze wczytuje dopiero dla meczów, które klikniesz.

## Wypróbuj {#try-it}

1. Otwórz **Analiza masowa** na pasku bocznym Heatmap.
2. Naciśnij **Folder…** (albo **Pliki…**) i wybierz swoje mecze `.3dheat`.
3. Poczekaj, aż panel odczyta podsumowania („Podsumowania... n z N”).
4. Naciśnij **Otwórz analizę**. Otworzy się okno z zakładkami.
5. Ustaw filtry (Gra, Mapa, Tryb, Z, Do), a potem przeczytaj zakładkę, na przykład Bilans.
6. Kliknij wiersz, komórkę albo wniosek: jego mecze wczytają się do widoku 3D, z kamerą na tym miejscu.

![Zakładka Bilans: współczynnik wygranych i zabójstwa na zgon według pojazdu](../assets/img/en/mass-balance.webp)

```
folder of .3dheat -> summaries -> window (tabs) -> click a row -> matches open in 3D
```

Plik `.3dheat` to jeden mecz ([Jeden plik na mecz](container.md)). *Mapa cieplna* i *wiersz* są wyjaśnione w [słowniczku](glossary.md).

## Zdobywanie podsumowań {#getting-the-summaries}

Większość ludzi nic nie musi robić: panel sam wylicza brakujące podsumowania. Żeby raz przygotować duży folder, użyj narzędzia offline poniżej.

Każdy mecz `.3dheat` dostaje podsumowanie (`src/mass/summarize.ts`), trzymane w kontenerze jako plik `<match>.summary.json` (rola `summary`, zob. [Jeden plik na mecz](container.md)). Narzędzie offline zapisuje je i indeks dla każdego folderu. To narzędzie dla programistów; uruchom je na dużym folderze, żeby oszczędzić panelowi pracy:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Mecz już podsumowany (ta sama wersja formatu) jest tylko czytany; `--force` wylicza go od nowa. `--no-write` zostawia kontenery w spokoju.
- Plik zmieniony w ciągu ostatnich `--settle` minut (10) jest pomijany: konwerter może jeszcze go zapisywać.
- `<folder>/3dheat-index.jsonl.gz`: jedna linia na mecz — jego ścieżka, rozmiar, czas i podsumowanie bez siatki. `<folder>/3dheat-index.grids.jsonl.gz`: jedna linia na mecz z jego siatką.
- Uruchom na maszynie, na której leżą pliki, z niskim priorytetem (na przykład `nice -n 19 ionice -c3` w Linuksie).

Panel bierze dla każdego meczu pierwsze z dostępnych: linię indeksu folderu (ta sama ścieżka i rozmiar), pamięć podręczną przeglądarki (IndexedDB, po nazwie, rozmiarze i czasie), element `summary` kontenera albo podsumowanie wyliczone w puli procesów roboczych i zapisane w pamięci podręcznej. Dzięki temu folder bez indeksu też działa — za pierwszym razem w tempie czytania tabel, potem z pamięci podręcznej.

## Panel {#the-panel}

Wybierz folder (albo pliki; **Dodaj folder…** dołącza kolejny). Okno ma filtry **Gra**, **Mapa**, **Tryb**, **Z** i **Do**, wybór **Podziel według**, **Najmniej żyć** i **Tylko gracze** oraz te zakładki. Każda liczba pochodzi z podsumowań. Kliknięcie wiersza, komórki albo wniosku wczytuje jego mecze do widoku jako nakładkę wielu meczów, z filtrami, które je pokazują (pojazd, klasa, broń, drużyna, gracz), i z kamerą na tym miejscu:

| Zakładka | Co pokazuje |
|---|---|
| Przegląd | mecze, godziny, gracze, życia, wiersze, daty; mecze dziennie; według gry, mapy, trybu; sumy zdarzeń; ekonomia według waluty; kiedy w meczu coś się dzieje |
| Bilans | według pojazdu, klasy, broni albo drużyny; podział według mapy, trybu, poziomu albo gry: K/D z jego przedziałem ~95%, współczynnik wygranych (Wilson), przetrwanie, zabójstwa i trafienia na minutę, zarobek na minutę, oraz q — współczynnik fałszywych odkryć Benjamini-Hochberga dla K/D i wygranej względem reszty podziału. **Najmniej żyć** ukrywa wiersze z zbyt małą liczbą żyć, by im ufać; **Tylko gracze** pomija to, czym kierowało AI misji |
| Trendy | używanie (udział w obecności), K/D albo współczynnik wygranych najlepszych pojazdów lub klas dzień, tydzień albo miesiąc |
| Gracze | różni gracze, mecze gracza, gracze w meczu, najczęściej pojawiający się gracze |
| Strony | każda strona każdej mapy: mecze wygrane wobec równego podziału |
| Walki z bliska | dane z rund: otwierające pojedynki według strony i ich zamiana, wymiany, gracz broniący przeciwko atakującemu, crossfire, wejścia po oślepieniu, celność, podłożenia, przewaga liczebna i, **Według mapy**, miejsca, które zabijają graczy wchodzących do nich — każde jako udział z jego przedziałem Wilsona, z liczników `cqb` podsumowań ([Walki z bliska i rundy](close-quarters.md)) |
| Mapa | zsumowana siatka mapy: obecność, zabójstwa, zgony, K/D, dowolne zdarzenie, przepływ i **gorąca w ilu meczach** (stabilność); według drużyny, przy komórkach 1, 2, 4 albo 8 razy większych |
| Miejsca | miejsca, które wyróżniają się w liczbach, ale nie w mapie cieplnej (duży obszar zajęty jako całość, korytarze, pasma wysokości); **Znajdź miejsca** |
| Nisze | grupy wypadające wyraźnie lepiej albo gorzej niż reszta (pojazd na jednej mapie, sektor na jednej wysokości); **Znajdź nisze** |
| Wnioski | wykrywacze masowe i wykrywacze map (poniżej); **Kopiuj raport (JSON)** daje JSON, który czyta model językowy |

## Wnioski z wielu meczów {#insights-over-many-matches}

Zakładka **Miejsca** znajduje miejsca, które wyróżniają się w liczbach, ale nie w mapie cieplnej — duży obszar zajęty jako całość, korytarz, pasmo wysokości, miejsce zajęte tylko w jednej części meczu. Zaznacza te, których zwykła mapa cieplna nie pokazuje, jako **ukryte**, i obrysowuje je w widoku 3D. **Wczytaj** leci tam razem z meczami, które je trzymały. Zakładka **Nisze** znajduje grupy (pojazd na jednej mapie i stronie, sektor na jednej wysokości) wypadające wyraźnie lepiej albo gorzej niż reszta; kliknij jedną, żeby zobaczyć jej doprecyzowania.

Zakładka **Wnioski** znajduje, we wszystkich meczach, pojazdy, które wymieniają się lub wygrywają lepiej albo gorzej niż reszta, miejsca gorące w stałym udziale meczów, strony wygrywające więcej niż równy podział, pojazdy, których użycie zmienia się w czasie, oraz części meczu, które mają więcej zabójstw niż równomierny rozkład. Każde odkrycie ma swoje liczby, efekt, przedział i współczynnik fałszywych odkryć (utrzymywany na 5%), a kliknięcie wczytuje jego mecze. Szczegóły: [Dla programistów](#for-developers).

## Skala {#scale}

Małą wersję tego możesz powtórzyć sam: `node tools/demo-data.mjs` zapisuje 150 syntetycznych meczów czołgów do `tools/.shots/demo/mass` (około 1000 wierszy każdy). Zmierzone na tych 150 syntetycznych meczach demo z `tools/demo-data.mjs` na komputerze stacjonarnym (prawdziwy mecz jest znacznie większy):

- `tools/3dheat-summarize.mjs` z 4 procesami roboczymi: 2,6 do 4,8 s dla wszystkich 150, 8 do 21 ms na mecz w procesie roboczym; drugi przebieg, który tylko czyta podsumowania, trwa około 2 s.
- Otwarcie folderu w panelu, z obecnym indeksem, aż okno się pokaże: 0,9 do 1,6 s (własna część procesu roboczego, czytanie 150 linii indeksu, to 20 do 40 ms).
- Przejście do zakładki, aż jej tabela się narysuje: Przegląd 10 do 30 ms, Bilans 30 do 70 ms, Trendy 30 do 45 ms, Gracze 15 do 35 ms, Strony 15 do 20 ms, Mapa 55 do 130 ms.
- Magazyn trzyma 150 meczów w około 0,5 MB.

Otwarcie okna zajmuje jedną krótką klatkę: wybrane pliki idą do procesu roboczego po 16 naraz, a pola dat i pierwsza zakładka pojawiają się klatkę później.

Magazyn trzyma około 15 KB na mecz, więc 10 000 meczów zajmuje ~150 MB w procesie roboczym; siatki nigdy nie są trzymane dłużej, niż potrzebuje tego mapa.

## Dla programistów {#for-developers}

### Wnioski z wielu meczów {#insights-over-many-matches}

`src/mass/detect.ts` — każde odkrycie z jego liczbami, efektem i przedziałem, p i q (Benjamini-Hochberg po wszystkim, co wykrywacz sprawdził, utrzymany na 5%), drill-down, który wczytuje jego mecze, oraz klucz zdania z jego wartościami; raport (`heat3d.mass/1`) to to, co `massReportForModel` przekazuje narratorowi, w tym samym kształcie co raport jednego meczu (`insights/seam.ts`).

| Wykrywacz | Znajduje |
|---|---|
| `balance` | pojazd gracza, który wymienia się lub wygrywa lepiej albo gorzej niż reszta na mapie lub w trybie |
| `hotspot` | miejsca gorące w stałym udziale meczów, które przyszły (mecze gorące / mecze widziane, względem innych komórek mapy) — nie tylko gorące w sumie |
| `side` | strona mapy wygrywająca więcej niż równy podział |
| `meta` | udział pojazdu w życiach graczy albo jego K/D przesuwające się między wcześniejszą a późniejszą połową dat, na mapę — dość duże, by się liczyć, trend w kwartałach, ten sam kierunek na większości map (niżej) |
| `phase` | część długości meczu mająca więcej zabójstw, trafień, wystrzeleń... niż równomierny rozkład |
| `place` | miejsca wyróżniające się na wielu meczach (Etap B, niżej): stopa regionu albo udział zabójstw względem własnej obecności każdego meczu, koła, korytarze, rosnące strefy, pasma wysokości, fazy; ukryte, gdy zwykła mapa ich nie pokazuje |
| `niche` | grupy wypadające wyraźnie lepiej albo gorzej (Etap B, niżej) |
| `grid.*` | wykrywacze jednego zbioru danych (pozycje mocy, gorące i ciche strefy, miejsca klas) na zsumowanych siatkach każdej mapy: `GridMerge.toInsightJob` wypełnia siatki przebiegu wniosków z podsumowań; wykrywacze wymagające trajektorii pomijają je |

### Podsumowanie {#the-summary}

Zwykły JSON (`src/mass/types.ts`), około 5–30 KB po kompresji na mecz:

- mecz: gra, mapa, tryb, misja, start, długość, wiersze, życia, gracze, AI, drużyny (życia, gracze, obecność, zabójstwa, zgony, wygrana, pieniądze), zwycięzca;
- na pojazd i drużynę: klasa, poziom, życia, życia graczy, obecność, zdarzenia według kanonicznego rodzaju, zabójstwa według klasy celu, wygrane, pieniądze;
- na gracza (po identyfikatorze użytkownika, a gdy go nie ma, po nazwie): drużyna, życia, obecność, zabójstwa, zgony, trafienia, wystrzelenia, wygrana, pojazdy; na broń: zdarzenia według rodzaju;
- kolumny ekonomii (`cost_*`, `earn_*`) i ich sumy;
- fazy: zdarzenia według rodzaju w 20 przedziałach długości meczu i według minuty;
- zachowanie: miary zbiorowego zachowania meczu (zgodność, prowadzenie po trasie, pasy, tłok, liderzy, maruderzy, punkt załamania, ryzyko po stratach, serie, zgodność zakupów, tłumienie), każda z własnym modelem zerowym, p i q — zob. [Zachowanie zbiorowe](collective-behaviour.md);
- siatka (niżej).

Liczone tak, jak liczy widz: kolumny znajdowane tak, jak znajduje je ładowarka wielu meczów (`leanSpec`), zdarzenia przez `data/canonical.ts`; zabójstwo, które broń Tacview zalicza, liczy się dla strzelca; zgon powiedziany dwa razy naraz (`dead`, `death`) liczy się raz.

#### Siatka: to, na czym opiera się Etap B {#the-grid-what-stage-b-builds-on}

Część przestrzenna jest zrobiona pod statystyki skanowania regionów dowolnej wielkości i kształtu, nie tylko pod obrazy mapy cieplnej:

- **Piramida.** Komórki są wyrównanymi potęgami dwójki w jednostkach świata (x, z tak, jak je umieszcza widz). Poziom `k` to komórki zsumowane przez `ix >> k, iz >> k` — dokładnie, w obrębie meczu i między meczami o innych rozmiarach komórek — a każdy region (pudełko, korytarz wzdłuż linii, pierścień) to suma komórek. Najdrobniejszy poziom mieści robustny zasięg meczu (komórki zawierające 99% obecności) w 128 komórkach; wartości poza nim są zachowane.
- **Ekspozycja obok każdego zliczenia.** Sekundy obecności na komórkę, na drużynę (`pt`), na klasę pojazdu (`pc`) i na pasmo wysokości (`ph`), więc stopa, oczekiwanie i stosunek regionu są liczone dla dowolnej podgrupy.
- **Wysokość.** Pasma powyżej poziomu zerowego meczu (1. percentyl wysokości): poniżej 3 m, 3–10, 10–30, 30–100, 100–300, 300–1000, 1000–3000, powyżej; plik z kolumną `floor`/`storey`/`deck` dzieli na pasma według pięter. `y` to średnia wysokość każdej komórki, `y0` jej najniższy punkt (jej piętro, dla wysokości nad nim).
- **Zdarzenia** jako krotki `[komórka, rodzaj, drużyna, klasa, pasmo, liczba]`.
- **Wycinki czasu** na zgrubnym poziomie (8 komórek na bok), według minuty od startu meczu: `[cx, cz, minuta, rodzaj, wartość]`, sekundy obecności jako rodzaj `GRID_KINDS.length`; fazy meczu to minuty na długości.
- Rzadkie, liczby całkowite, sekundy co do dziesiątej: ograniczone tym, co się wydarzyło.

### Etap B: miejsca i nisze {#stage-b-places-and-niches}

Etap B szuka tego, co wyróżnia się w liczbach, ale nie przyciąga wzroku: dużego obszaru zajętego jako całość, bez gorącej komórki w środku, dziwnego stosunku zabójstw do zgonów przy małej liczbie zdarzeń, korytarza, pasma wysokości, skupiska obecnego tylko w jednej części meczu — oraz grup (pojazd na jednej mapie po jednej stronie, sektor na jednej wysokości) wypadających wyraźnie lepiej albo gorzej niż reszta. Jedno **Znajdź miejsca** / **Znajdź nisze** / **Znajdź wnioski** uruchamia wszystkie wykrywacze; trzy zakładki dzielą ten sam raport.

#### Miejsca (`src/mass/scan.ts`) {#places-srcmassscants}

Mecze każdej mapy są czytane dwa razy, po jednym meczu naraz; pamięć trzyma sumy na rastrze o najwyżej 64 komórkach na bok (16 dla skanowania czasoprzestrzennego), nigdy mecze.

- **Miary.** Stopa zdarzenia na sekundę obecności — zabójstwa, zgony, trafienia, wystrzelenia, przejęcia, dla wszystkich jednostek, na klasę (4 z największą liczbą zdarzeń), na pasmo wysokości — oraz udział zabójstw w zabójstwach i zgonach (wszystkie, na stronę, na pasmo). Które klasy i strony — ustalają nagłówki (`planOf`).
- **Oczekiwanie według meczu.** Stopa każdego meczu rozłożona na jego własną obecność w komórce daje oczekiwanie komórki (skanowanie Kulldorffa skorygowane kowariatami, rozwarstwione według meczu): kilka krwawych meczów albo jeden zajęty serwer nie tworzy miejsca.
- **Rozproszenie.** Mecze różnią się znacznie bardziej, niż zakłada rozkład Poissona. Reszty każdego meczu są sumowane w blokach po 1, 2, 4, 8, 16 komórek; rozproszenie każdego rozmiaru bloku (kwadraty reszt przez wariancję zerową, połączone, bez najgorszych 5% bloków) skaluje każdy test regionu tej wielkości: iloraz wiarygodności quasi, Poisson dla stóp, dwumianowy dla udziałów.
- **Regiony.** Koła od 0,75 do 18 komórek; elipsy pod sześcioma kątami, 3 i 6 razy dłuższe niż szerokie, od 3 do 18 komórek (korytarze; oś to `place.path` wniosku); strefy rosnące komórka po komórce od najsilniejszych lokalnych komórek Getis-Ord Gi*, dopóki rośnie statystyka regionu (kształty nieregularne) — rosną na jednej połowie meczów i testowane są na drugiej, więc swoboda wzrostu nie kosztuje fałszywych miejsc; każde pasmo wysokości przeciwko pozostałym pasmom meczu na całej mapie (odporne na skupienia); cylindry czasoprzestrzenne: koło w jednej albo dwóch piątych długości meczu, przeciwko własnemu rozkładowi zdarzeń meczu w miejscu i czasie (skanowanie permutacyjne czasoprzestrzeni).
- **Testowanie.** p z ilorazu quasi-wiarygodności; Benjamini-Hochberg po każdym regionie sprawdzonym na każdej mapie (700 000 na trzech mapach to zwyczajnie) na poziomie 5%. Co przechodzi, jest przycinane (region w większości zawarty w silniejszym z tej samej miary mówi to samo), potem badane pod kątem **stabilności** — mecze, które go widziały, mecze, w których się utrzymał, jego kierunek w pięciu podziałach meczów — i testowane jeszcze raz przy wariancji, jaką same mecze pokazują (odporne na skupienia, mecze jako skupienia, nigdy przy Poissonie), BH jeszcze raz. Ciche miejsca na bazie (2% lub więcej odrodzeń, startów i lądowań mapy) są pomijane.
- **Efekt.** Stosunek stopy (lub szans), skurczony przez empiryczny Bayes (prior gamma dopasowany do bloków 2×2 mapy), z przedziałem ~95% przy rozproszeniu; Gi* na 1, 2 i 4 komórkach oraz lokalne Morana w środku.
- **Oczywistość wizualna.** Ile region już pokazuje w zwykłej mapie cieplnej swojego zdarzenia (skala logarytmiczna do najjaśniejszej komórki, tak jak rysują to widoki): jego kontrast z pierścieniem wokół (jedna dziesiąta palety trudno zobaczyć, dwie piąte zwyczajnie) i jasny szczyt niosący nadmiar; stosunku mapa cieplna nigdy nie rysuje, więc udział liczy się za połowę. Poniżej 35% to **ukryte**. Ranga: siła (efekt nasycający się przy 4 razach, ciche miejsca przy 0,7) razy `1 - 0,7 x oczywistość` razy zgodność podziałów.

Zakładka **Miejsca** wymienia je (domyślnie tylko ukryte; według mapy, kształtu, kierunku); kliknięcie obrysowuje miejsca mapy w widoku 3D (`placeLines.ts`: górne linie silnika, budowane raz — magenta ukryte, bursztynowe zwykłe, cyjan ciche, wybrane pełne; pasmo jako pudełko od podłogi do sufitu) i na płótnie zakładki Mapa; **Wczytaj** leci tam i wczytuje 60 meczów, które najczęściej je trzymały, filtrowane według jego zdarzenia (i klasy).

#### Nisze (`src/mass/niche.ts`) {#niches-srcmassnichets}

Przeszukiwanie wiązką (szerokość 24, głębokość 3) po trzech tabelach: **życia** (życia graczy: gra, mapa, tryb, klasa, pojazd, strona, poziom, kwartał dat, tercja długości meczów; K/D, wygrana, zgon jako życie, zabójstwa na godzinę, zarobek na minutę), **miejsca** (zabójstwa i zgony według mapy, trybu, dat, sektora mapy 4 × 4, klasy, strony, pasma) i **fazy** (sektor i piąta część meczu: K/D, zgony na godzinę obecności). Grupa jest testowana względem całości, z meczami jako skupieniami (wariancja sandwich reszt według meczu); jej efekt to iloraz szans lub stóp, skurczony przez prior 20 wyników; potrzebuje 30 wyników w 8 meczach, a udoskonalenie musi być o 10% silniejsze od swojego rodzica; grupy, w których wynik to nic albo wszystko (nie zapisany dla nich), są pomijane. Zachowane: BH poniżej 5% po każdej ocenionej grupie, skurczony iloraz co najmniej 1,25 (albo 1/1,25), cztery z pięciu podziałów zgodne, a nie udoskonalenie, które tylko powtarza swojego rodzica. Zakładka **Nisze** je wymienia; kliknięcie pokazuje każde doprecyzowanie grupy o jednym warunku (eksplorator), **Wczytaj** wczytuje jej mecze. Wyposażenia nie są jeszcze w podsumowaniach.

#### Zmiany mety o znaczeniu praktycznym {#meta-shifts-with-practical-significance}

Przy mieszanych datach dwumianowy test na życiach oznaczał prawie każdą zmianę jako istotną. `meta` teraz testuje odporne na skupienia (życia każdego meczu jako skupienie), zachowuje zmianę użycia tylko przy 2 punktach i co najmniej 25%, zmianę K/D 1,3 razy, kwartały dat trendujące w tym samym kierunku (tau Kendalla co najmniej 0,5) i — dla pojazdu na kilku mapach — ten sam kierunek na większości z nich. Zostaje tylko kilka zmian na zbiorze testowym, na którym zwykły test oznaczał prawie wszystkie.

#### Dla modelu {#for-a-model}

`massReportForModel` daje każdemu miejscu jego `region` (kształt, ukryte, oczywistość, wysokości, faza), a każdej niszy jej `conditions`, plus liczbę regionów i grup, które zostały sprawdzone. Soczewka wiedzy może czytać miejsca jako strefy zabójstw i podejścia: ich rodzaje to `place.*` i `niche.*`.

#### Sprawdzenia {#checks}

`scan.test.ts` zakłada rozlany obszar (1,6 razy wyższa stopa zgonów na kole o 22 komórkach, słaby w każdej komórce), korytarz, pasmo wysokości i skupisko tylko w fazie w 240 syntetycznych meczach o rozproszeniu — wszystkie znalezione, rozlany ukryty — i uruchamia osiem zerowych zestawów po 60 meczów: brak miejsca. `niche.test.ts` znajduje zaszczepioną grupę pojazd × mapa × strona i nic w pięciu zerowych tabelach.
