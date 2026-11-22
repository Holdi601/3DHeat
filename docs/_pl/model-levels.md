---
title: "Poziomy 3D"
parent: "Poziomy i geometria tła"
nav_order: 2
lang: "pl"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---


# Poziomy 3D

Poziom 3D to model miejsca — wzgórz, ulic, budynków — w którym znajdują się twoje dane. Pozwala zobaczyć, na którym piętrze, wzgórzu czy dachu jest ciepło. Przeglądarka dzieli go na teren (pełny), budowle (przezroczyste, żebyś mógł zajrzeć do środka) i wodę.

## Wczytaj poziom 3D {#load-a-3d-level}

1. Najpierw wczytaj swoje dane ([Wczytywanie danych](getting-data-in.md)). Model musi używać tej samej przestrzeni świata i jednostki co dane, z osią Y w górę.
2. W **Tło / poziom** wybierz **Cel upraszczania**. Zostaw *Pełny - bez upraszczania*, chyba że model jest ogromny.
3. Naciśnij **Model 3D…** i wybierz plik `.glb`, `.gltf`, `.obj`, `.stl` albo `.ply`.
4. Poczekaj na linię postępu. **Anuluj** zatrzymuje wczytywanie.
5. Naciśnij **F** w widoku. Teren jest pełny, budowle to przezroczyste skorupy, woda jest płaska.
6. Dostrój wygląd w [Wygląd poziomu](level-appearance.md). Naciśnij **Zapisz w bibliotece**, żeby zachować wynik ([Biblioteka poziomów](level-library.md)).

![Wczytany poziom 3D: nieprzezroczysty teren z poziomicami, przezroczyste budynki, płaska woda](../assets/img/en/model-levels-loaded.webp)

**Model 3D…** wczytuje siatkę poziomu. Jest analizowana, klasyfikowana i upraszczana w procesie roboczym w tle ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)) z linią postępu i **Anuluj**: *Odczyt modelu*, *Analiza pliku*, *Pakowanie N tekstur*, *Klasyfikacja N części*, *Upraszczanie terenu (N trójk.)*, *Upraszczanie budowli (N trójk.)*, *Budowa siatki krawędzi*.

## Formaty {#formats}

| Format | Co jest czytane | Ograniczenia |
|---|---|---|
| `.glb` | Każdy prymityw siatki z `mode` 4 (trójkąty) albo bez trybu, z zastosowaną światową transformacją każdego węzła; `POSITION`; `COLOR_0` (vec3 albo vec4) jako kolor wierzchołka; `baseColorTexture` materiału i jego `TEXCOORD_n` jako tekstura; nazwy węzłów i siatek jako nazwy części. | Linie i punkty są pomijane. |
| `.gltf` | To samo. | Tylko z wbudowanymi buforami: glTF odwołujący się do zewnętrznego `.bin` jest odrzucany komunikatem *Wyeksportuj jako jeden plik .glb, żeby geometria była wbudowana.* |
| `.obj` | Ściany, z blokami `o` i `g` jako części. | Tylko geometria (bez materiałów). |
| `.stl` | Binarny i ASCII (`solid …`). | Jedna część. |
| `.ply` | Tylko ASCII. | Binarny PLY jest odrzucany komunikatem *Zamień na .glb albo binarny .stl.* |

Tylko geometria: pozycje, normalne i trójkąty scalone w jeden bufor, plus kolory i współrzędne tekstur, gdy są ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Model bez trójkątów jest odrzucany. Model musi być w tej samej przestrzeni świata i jednostce co dane (oś Y w górę): nic nie jest przekształcane, żeby pasowało.

## Teren, budowle i woda {#ground-structures-and-water}

Poziom jest przy imporcie dzielony na trzy klasy, bo wymagają przeciwnego traktowania ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Naziemne** — rysowane nieprzezroczyście i cieniowane wskazówkami rzeźby (nachylenie, poziomice, rampa wysokości), żeby pozycję dało się odczytać względem nich.
- **Budowle** — budynki i rekwizyty stoją między kamerą a ciepłem w nich, więc są rysowane jako **przezroczysta skorupa** (słabe ściany z jasną krawędzią i zdeduplikowane krawędzie) — albo, gdy są z teksturami, jako pełne w swoich teksturach.
- **Woda** — płaska, bez wskazówek terenu: poziomica przez jezioro to nonsens.

Każda część (węzeł glTF, obiekt OBJ albo grupa) jest klasyfikowana osobno, według pierwszej reguły, która pasuje:

1. **Etykieta eksportera.** Nazwa zaczynająca się od `ground:`, `structure:` albo `water:` (albo z `|` zamiast `:`) jest przyjmowana wprost. Własne eksportery projektu opisują tak każdą część.
2. **Nazwy wody.** `water` jako słowo (nie *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Nazwy terenu.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Nazwy budowli.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometria.** Część zajmująca więcej niż 25% pola X-Z mapy, z więcej niż 60% pola trójkątów skierowanych w górę, to teren. Część z mniej niż 45% skierowanych w górę albo wyższa niż 15% wysokości poziomu, zajmująca przy tym mniej niż 10% pola, to budowla. Udział skierowanych w górę jest ważony polem, więc dom nie jest uznawany za płaski z powodu dachu.
6. **Poza tym teren** — niejednoznaczna część domyślnie jest terenem, bo domyślna prawie niewidoczna skorupa sprawiłaby, że poziom wyglądałby jak błąd renderowania.

Model będący jedną częścią sklasyfikowaną jako budowla staje się terenem (*pojedyncza nienazwana siatka - traktowana jako teren*).

### Siatki nawigacyjne {#navigation-meshes}

Część nazwana `nav:…` (`nav:walkable` z eksportera poziomu) to siatka nawigacyjna: miejsca, w których może stać żołnierz. Jest na liście jako teren (*siatka nawigacyjna - nie rysowana, bo leży na terenie; kliknięcia nadal ją znajdują*), ale **nie jest rysowana**. Jest nałożona na teren, z którego została wygenerowana, współpłaszczyznowo z dokładnością do centymetrów, a rysowana jako teren dwie powierzchnie walczyłyby o każdy piksel: na poziomie z zapieczoną teksturą terenu cały obszar do gry pokazywał się jako ostro zakończone łaty szarości i beżu, po jednej na trójkąt nawigacji. Jest zachowywana, nieuproszczona, żeby [wybór kliknięciem](camera.md#click-to-pick) mógł powiedzieć, czy miejsce jest przechodnie. Wpisy biblioteki jej nie zachowują.

**Pokaż klasyfikację części (N)** w panelu (widoczne dla modeli z więcej niż jedną częścią) wypisuje każdą część z jej klasą i powodem — *oznaczona przez eksportera*, *nazwa pasuje do wzorca*, *zajmuje X% mapy, Y% skierowanych w górę*, *Y% skierowanych w górę, Z% wysokości poziomu*, *niejednoznaczna - domyślnie teren*. Żeby zmienić jedną, zmień nazwę części w modelu źródłowym i zaimportuj ponownie; podział jest zapisany w buforach indeksów.

## Upraszczanie {#simplification}

**Cel upraszczania** ustala budżet trójkątów dla następnego importu ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Ustawienie | Trójkąty |
|---|---|
| *Pełny - bez upraszczania* (domyślnie) | wszystkie |
| *Wysoki - 8 mln trójkątów* | 8 000 000 |
| *Średni - 3 mln trójkątów* | 3 000 000 |
| *Niski - 800 tys. trójkątów* | 800 000 |
| *Sylwetka - 100 tys. trójkątów* | 100 000 |

Budżet jest dzielony **60% na budowle i 40% na teren**, upraszczane osobno — budowle najszybciej tracą kształt przy decymacji. Woda nie jest upraszczana. Upraszczanie to zwijanie krawędzi z metrykami błędu kwadratowego ([meshoptimizer](https://github.com/zeux/meshoptimizer), przez WebAssembly), po scaleniu pokrywających się wierzchołków, więc sylwetki i ostre krawędzie przetrwają. Notatka importu podaje `źródło → teraz trójkątów, odchylenie X%`, podział terenu / budowli / wody na części i — gdy użyto *Pełny* na modelu powyżej 8 mln trójkątów — sugeruje *Wysoki* (do 30 mln) albo *Średni* (powyżej). Bez WebAssembly upraszczanie jest niedostępne i import to mówi.

Poziomy z własnych eksporterów projektu mają już budżet; cel istnieje dla surowej grafiki bez budżetu.

## Tekstury {#textures}

Plik `.glb`, którego części niosą tekstury koloru bazowego, jest rysowany w nich — eksport trasy wyścigowej, na przykład, niesie jedną na kafelek terenu i jedną na każdy umieszczony model.

Tekstura terenu jest domyślnie pokazywana, gdy jest obecna; budowle, które mają tekstury, startują **pełne, we własnych teksturach** (krawężniki, bariery, ściany opon i znaki to krawędzie drogi, a nie budynki, do których można zajrzeć), z wyłączoną siatką i wyłączonym cieniowaniem płaskim. Zob. [Wygląd poziomu](level-appearance.md).

## Duże poziomy {#large-levels}

- Powyżej **300 000** trójkątów budowli krawędzie budowli startują wyłączone, a krycie ścian ustawione na 35%: przy krawędzi w każdym pikselu dzielnica wygląda jak płaska biel.
- Daleka płaszczyzna kamery poszerza się, by objąć poziom ([Poziomy](levels.md#what-a-level-does-for-the-heat)).

## Dla programistów {#for-developers}

### Atlas tekstur {#texture-atlas}

Każda tekstura jest spakowana w **jeden atlas** w procesie roboczym importu ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)), więc poziom pozostaje jednym rysowaniem, jednym próbnikiem i jednym atrybutem współrzędnych tekstury na obu backendach:

- pakowane w półki w rozmiarze każdego obrazu, zmniejszane tylko wtedy, gdy zestaw nie mieściłby się w **8192 px** w żadnym wymiarze (domyślny limit rozmiaru tekstury WebGPU);
- **16-pikselowy margines** wokół każdego obrazu i tylko 5 poziomów mip, które ten margines chroni, żeby odległy znak nigdy nie próbkował tekstury sąsiada;
- **powtarzające się tekstury** pozostają powtarzające się. Obraz, którego próbnik glTF się powtarza (domyślnie w glTF) i którego współrzędne tekstury wychodzą poza 0..1 — ceglana ściana, której UV biegnie od 0 do 40 wzdłuż niej — staje się *kafelkiem*: jego wierzchołki zachowują własne współrzędne i 16-bitowy numer kafelka, a shadery zawijają współrzędną do prostokąta kafelka na piksel, biorąc poziom mip z niezawiniętej współrzędnej, żeby szwy nie były widoczne. Margines kafelka zawiera jego własną przeciwną krawędź. Oś, której próbnik zaciska, jest zaciskana; obraz, którego współrzędne mieszczą się w 0..1, jest rysowany jak dawniej. Poziom z kafelkami kosztuje 4 bajty więcej na wierzchołek.

### Kontrakt eksportera {#the-exporter-contract}

Czego widz potrzebuje od poziomu, bez względu na to, kto go zrobił:

- jeden samodzielny plik `.glb`;
- `POSITION` float32, prymitywy trójkątów;
- nazwy węzłów `ground:*`, `structure:*` i `water:*` (cokolwiek innego jest klasyfikowane wg reguł wyżej), oraz `nav:*` dla siatki nawigacyjnej, która jest zachowywana, ale nie rysowana;
- współrzędne świata, **oś Y w górę**, w tej samej jednostce co telemetria, więc dane leżą na poziomie bez żadnego kroku umieszczania.
