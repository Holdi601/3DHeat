---
title: "Tło świata"
parent: "Poziomy i geometria tła"
nav_order: 5
has_children: true
lang: "pl"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Tło świata

Tło świata kładzie prawdziwy grunt pod zapis lotu: wzgórza, drogi, rzeki, lotniska i budynki, pobrane z darmowych otwartych danych map. Używaj go, gdy zapis Tacview unosiłby się inaczej nad pustą siatką. To [poziom](glossary.md), więc ciepło i figury leżą na nim.

## Zbuduj je {#build-one}

1. Wczytaj zapis lotu, który mówi, gdzie na Ziemi się odbył (plik Tacview `.acmi`), albo nie wczytuj nic i wybierz teatr w kroku 3. Zobacz [Wczytywanie danych](getting-data-in.md).
2. Otwórz **Tło / poziom** w panelu bocznym.
3. Naciśnij **Tło z prawdziwego świata**, żeby zbudować grunt pod swoimi danymi. Albo wybierz mapę gry w **Teatr działań** i naciśnij **Zbuduj tło teatru działań** (albo **Strumieniuj teatr działań**).
4. Czekaj. Panel pokazuje postęp (*Kafelki wysokości*, *Kafelki map*, *Budowanie tła*); **Anuluj** go zatrzymuje.
5. Lataj dookoła. Wiersz z podziękowaniem za dane map jest napisany w prawym dolnym rogu widoku.

Pierwsze zbudowanie pobiera kilkadziesiąt megabajtów. Przeglądarka je zachowuje, więc drugie zbudowanie tego samego obszaru nic nie pobiera. **Zapomnij kafelki map** je usuwa. Przycisk **Tło z prawdziwego świata** pokazuje się tylko wtedy, gdy wczytane dane niosą odniesienie geograficzne (niżej).

Wszystko buduje się w tle, w procesie roboczym ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Wynik zastępuje bieżący poziom i zachowuje się jak każdy [poziom 3D](model-levels.md): chowa za sobą ciepło, jest przecinany przez przekrój, ma [ustawienia wyglądu](level-appearance.md) i można go zapisać w [bibliotece](level-library.md).

## Gdzie są dane: odniesienie geograficzne {#where-the-data-is-the-geographic-reference}

Zbiór danych dostaje odniesienie geograficzne tylko ze źródła, które je podaje:

- **Zapis ACMI**: jego nagłówek `ReferenceLatitude` i `ReferenceLongitude` oraz pozycje, które czytnik rzutuje na płaszczyznę styczną do elipsoidy WGS84 w tym punkcie (X na wschód, Y na północ, w metrach; wysokości to wysokość zapisu nad poziomem morza). Odniesienie zostaje, gdy odwzorowanie bierze **X** i **Y** jako osie gruntu – tak jak podpowiedzi samego zapisu – i znika, gdy grunt pochodzi z innej kolumny, na przykład płaskiego świata gry, czyli **U** i **V**.
- **Tabela Parquet, której podpowiedzi `heat3d` mają wpis `geo`** – tabele DCS, MSFS, X-Plane i IL-2 (Tacview) z [Watchera](https://github.com/Holdi601/3DHeat-Watcher). Wpis opisano w [Dla deweloperów](#for-developers).

Wczytanie kilku plików zachowuje odniesienie tylko wtedy, gdy wszystkie mają to samo. Każdy inny wczytywacz nie jest zmieniany i nie niesie żadnego.

Tło rzutuje się tak samo, a potem przechodzi przez odwzorowanie osi wczytania, więc ląduje pod danymi, jakiekolwiek odbicia lub skalę odwzorowanie stosuje.

## Teatry {#theatres}

Wybór **Teatr działań** wypisuje mapy świata rzeczywistego z DCS World (Kaukaz, Nevada, Normandia 2, Kanał La Manche, Syria, Zatoka Perska, Mariany, Mariany II wojny, Południowy Atlantyk, Synaj, Afganistan, Kola, Niemcy zimnej wojny, Irak) i IL-2 Great Battles (Stalingrad, Moskwa, Kubań, Nadrenia, Normandia, Prochorowka, Wielkie Łuki, Arras, Odessa, Zatoka Fińska / Leningrad, Korea), każda ze swoim prostokątem na Ziemi ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Prostokąty DCS to zasięgi użyte przez edytory, obliczone z opublikowanych odwzorowań; prostokąty IL-2 oraz te z DCS oznaczone jako takie są szacunkami z opublikowanych rozmiarów map i miast na ich brzegach – panel mówi, które są które.

**Zbuduj tło teatru działań** buduje dwa poziomy szczegółowości w jednej siatce:

| Poziom | Obszar | Teren | Mapa |
|---|---|---|---|
| Teatr | cały prostokąt | najgłębsze przybliżenie do 10, które potrzebuje co najwyżej 64 kafelków wysokości (około 3 km na wierzchołek nad Kaukazem, 1 km nad Normandią) | morze, jeziora, pokrycie terenu i autostrady z co najwyżej 64 kafelków wektorowych przy przybliżeniu 4–9 |
| Szczegółowy obszar | **Pod danymi**, **Wokół punktu** (szerokość, długość geograficzna, 12–400 km) albo nic | do przybliżenia 12 w co najwyżej 100 kafelkach, co najwyżej 500 000 wierzchołków | wszystko poniżej, z co najwyżej 1500 kafelków wektorowych przy najgłębszym przybliżeniu do 14, które się mieści |

Szczegółowy obszar wycina dziurę w siatce teatru, poszerzoną do całych komórek, tak że obie siatki dzielą linie brzegowe, a cienka ścianka zamyka szczelinę, gdzie próbkują wysokości inaczej.

Gdy dane są wczytane, teatr buduje się na płaszczyźnie danych, więc ląduje pod nimi tak, jak zbudowano. Bez danych buduje się go wokół własnego punktu odniesienia teatru (pełne stopnie w pobliżu szczegółowego obszaru). Dane wczytane później na innym odniesieniu – plik ACMI nazywa swoje własne – przesuwają tło pod siebie: dokładne przesunięcie między dwiema projekcjami liczy się na siatce 256 × 256 nad tłem i odczytuje między węzłami, z dokładnością do metra lub dwóch na cały teatr ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Tło zapisane w bibliotece zachowuje swoje miejsce i przesuwa się tak samo, gdy zostanie wczytane pod innymi danymi.

### Strumieniowanie teatru {#streaming-a-theatre}

**Strumieniuj teatr działań** pokazuje teatr tak, jak przeglądarka map symulatora lotów: grunt przychodzi jako wiele małych kafelków wokół kamery, wczytywanych w miarę lotu i porzucanych, gdy są poza zasięgiem ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Drzewo ćwiartek kafelków Web Mercator.** Korzenie przy przybliżeniu 5 pokrywają 1500 km wokół kamery, więc grunt sięga poza prostokąt teatru aż po horyzont. Kafelek dzieli się na cztery dzieci, gdy kamera jest bliżej niż 1,4 jego szerokości, aż do przybliżenia 15 (około 1 km na kafelek, 15 m między wierzchołkami terenu): szczegółowość maleje z odległością, tak jak maleje na ekranie.
- **Każdy kafelek to własna siatka**, budowana w procesie roboczym ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): siatka terenu 65 × 65 z obrzeżem wokół krawędzi (więc sąsiedzi o różnej szczegółowości nigdy nie pokazują szczeliny), pokrycie terenu i morze namalowane na niej, drogi, linie kolejowe, jeziora, rzeki, lotniska, zmierzone pasy startowe i budynki na wierzchu, a opcjonalnie zdjęcie satelitarne ich kwadratu. Renderer rysuje kafelki wyglądem i regułami głębi poziomu, więc chowają ciepło za sobą jak każdy poziom.
- **Najpierw zgrubnie.** Kafelki zamawia się zgrubne i bliskie najpierw, cztery pobrania naraz na źródło; gdy dzieci kafelka się wczytują, kafelek je zastępuje, więc widok od razu się wypełnia i wyostrza.
- **Pamięć**: zbudowane kafelki trzyma się do 600 MB, najdawniej rysowane usuwa się pierwsze. **Pobrania** zostają w pamięci podręcznej kafelków, ograniczonej do budżetu 2 GB, najstarsze wychodzą pierwsze: przelot z powrotem nad obszarem nic nie kosztuje i nie ma limitu na jedno zbudowanie.
- **Zapisywane w bibliotece** jako to, co strumieniują – teatr, jego opcje i jego miejsce na Ziemi – a nie jako kafelki: wczytanie strumieniuje ponownie, z pamięci podręcznej kafelków tam, gdzie kafelki nadal są. Kliknięcia i inspektor trafiają w kafelki tak, jak w każdy poziom.
- Oba renderery rysują kafelki: sprawdzono je obok siebie na prawdziwym GPU (WebGPU i WebGL2 na tej samej karcie), w tym ciepło schowane za grzbietem.
- Gdy dane są wczytane, kafelki buduje się na płaszczyźnie danych; dane wczytane później na innej płaszczyźnie przebudowują je tam (z pamięci podręcznej).
- Zmierzone na syntetycznych lotach nad trzema miejscami (Normandia, Nevada, Syria): około 63, 45 i 24 MB przy pierwszej wizycie ze zdjęciami; druga wizyta nic nie pobiera.

## Co jest budowane {#what-is-built}

| Część | Źródło | Jak |
|---|---|---|
| Zdjęcia (strumieniowane teatry, opcjonalnie) | EOX Sentinel-2 cloudless 2016 | **Zdjęcia satelitarne** nakładają bezchmurną mozaikę z 2016 roku (około 10 m na piksel, przybliżenie 14, głębsze kafelki ją powiększają) na grunt zamiast namalowanego pokrycia terenu; drogi, pasy, budynki i nazwy zostają na wierzchu. |
| Dokładniejsze zdjęcia (USA, Francja) | USGS National Map orthoimagery; IGN BD ORTHO | Przy włączonych **Zdjęciach satelitarnych** kafelek mapy z przybliżenia 13, leżący w całości w sąsiadujących Stanach Zjednoczonych lub we francuskiej metropolii, bierze zamiast tego krajowe ortofoto, o dwa przybliżenia głębsze niż kafelek (szesnaście jego kafelków złożonych w jeden obraz, około 1–2 m na piksel z bliska). Wszędzie indziej EOX. |
| Teren (strumieniowane teatry) | Mapterhorn | Copernicus GLO-30 wszędzie (około 19 m na piksel przy przybliżeniu 12), skala metrowa tam, gdzie jest w tym pomiar krajowy (Francja, USA i inne); czytany o dwa przybliżenia zgrubniej niż każdy kafelek. AWS Terrain Tiles, jeśli Mapterhorn jest nieosiągalny. |
| Teren | AWS Terrain Tiles (Terrarium PNG) | Siatka wysokości nad prostokątem: przybliżenie to najgłębsze do 12 (około 28 m na piksel przy 43° N), które potrzebuje co najwyżej 36 kafelków, a siatka jest przerzedzana do co najwyżej 400 000 wierzchołków. Rysowana jako grunt z zwykłymi wskazówkami rzeźby. |
| Drogi, linie kolejowe | kafelki wektorowe OpenFreeMap, warstwa `transportation` | Płaskie wstęgi nałożone na teren, zagęszczone do rozstawu terenu i podniesione o kilka procent jego wysokości, żeby nie walczyły z nim. Szerokości według klasy, od 16 m (autostrada) do 3 m (ścieżka, kolej); nigdy węższe niż przekątna prostokąta / 5000. Ścieżki, promy i tunele są pomijane. |
| Lotniska | warstwa `aeroway` | Wielokąty pasów, dróg kołowania, płyt postojowych i lądowisk helikopterów nałożone jako grunt; linie pasów i dróg kołowania jako wstęgi 45 m i 18 m. |
| Woda | warstwa `water` | Morze płasko na 0 m, jeziora i stawy płasko na najniższym brzegu, rzeki nałożone. Rysowane jako woda: cieniowanie płaskie, bez poziomic. |
| Pokrycie terenu | warstwy `landcover` i `landuse` | Namalowane na własnych wierzchołkach terenu, bez dodatkowych trójkątów: lasy, trawy i parki na zielono, pola na słomkowo, mokradła, piasek, skały, lód; obszary mieszkalne, przemysłowe, handlowe, wojskowe i kamieniołomy w stonowanych tonach. Woda jest malowana także pod powierzchnią wody, więc brzeg czytelny jest z każdej wysokości. Goły grunt dostaje spokojny odcień wysokości (nizina szarozielona, wyżyna brązowa, śnieg powyżej 3000 m). Czytelne w rozdzielczości terenu: około 30–45 m w szczegółowym obszarze, kilometry w teatrze. |
| Nazwy miejsc | warstwy `place` i `aerodrome_label` | Miasta, miasteczka i wsie oraz lotniska z kodem ICAO, napisane nad widokiem; jak daleko pokazuje się każdy rodzaj, rośnie z wysokością kamery, najwyżej 70 naraz. |
| Zmierzone pasy startowe | [OurAirports](https://ourairports.com/data/) `runways.csv` (domena publiczna) | Opcjonalne (**Pasy startowe z OurAirports**, domyślnie włączone): każdy otwarty pas z obydwoma końcami na liście, od progu do progu o podanej szerokości, z pasami bocznymi, przerywaną linią środkową i kreskami progów. Jedna lista 4 MB, pobrana raz i zachowana w pamięci podręcznej. |
| Budynki | warstwa `building` | Obrysy wyciągnięte od `render_min_height` do `render_height` (6 m, gdy brak) ponad najniższym gruntem pod nimi; części `hide_3d` pomijane. Rysowane jako konstrukcje. |

Kafelki wektorowe czyta się przy przybliżeniu 14 (jedynym z budynkami), gdy prostokąt potrzebuje ich co najwyżej 300; w przeciwnym razie przy najgłębszym przybliżeniu, które to spełnia, aż do 8. Większy obszar dostaje sam teren.

### Wygląd {#look}

Tło zaczyna się z włączonym **Pokaż przechwyconą barwę** – kolor pozwala odróżnić jasną drogę od szarego gruntu, na którym leży, ciemny pas od płyty postojowej – z wyłączonymi krawędziami trójkątów gruntu, bo regularna siatka nic nie mówi, słabymi poziomicami, nieprzezroczystym morzem (podłoga pod nim walczyłaby z powierzchnią o głębię z daleka) i budynkami jasnoszarymi i prawie pełnymi, jak rysuje je mapa. Otwarte morze nie dostaje żadnych trójkątów gruntu. Wszystko inne ma domyślny wygląd poziomu modelowego.

## Podziękowania na płótnie {#credits-on-the-canvas}

Gdy tło jest poziomem, podziękowanie jego źródeł pisze się w prawym dolnym rogu widoku, bez potrzeby klikania, tak aby zrzuty ekranu i wyrenderowane filmy je niosły:

> OpenFreeMap © OpenMapTiles · Dane © współtwórcy OpenStreetMap · Wysokości: Terrain Tiles – SRTM, GMTED2010, 3DEP dzięki uprzejmości U.S. Geological Survey; ETOPO1: NOAA; i inne

Każda część prowadzi do strony z przypisem swojego źródła (openstreetmap.org/copyright i [lista przypisów Terrain Tiles](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Tło zapisane w bibliotece zachowuje swoje podziękowania i pokazuje je ponownie po wczytaniu. Tekst tłumaczy się razem z aplikacją; nazwy nie.

## Źródła i ich warunki {#sources-and-their-terms}

Każde źródło, jego licencja i jak tło mieści się w warunkach: [Tło świata: źródła i warunki](world-backdrop-sources.md).

## Pamięć podręczna kafelków {#the-tile-cache}

Każdy kafelek i TileJSON kafelków wektorowych trzyma się w Cache API przeglądarki pod `3dheat-world-tiles-v1`, według adresu URL. Drugie zbudowanie tego samego obszaru nie wysyła żadnych zapytań i działa offline: najpierw pyta się o TileJSON, a gdy to się nie uda, jego zapisana kopia podaje kafelki już trzymane. Kafelki, których serwer nie ma (otwarte morze, 404), też są zapamiętywane jako nieobecne.

Adresy kafelków wektorowych niosą datę kompilacji mapy, więc gdy OpenFreeMap opublikuje nową kompilację, następne tło pobiera świeże kafelki, a stare zostają, aż się je wyczyści. Pamięć podręczna jest ograniczona do 2 GB: po jej przekroczeniu najpierw usuwa się kafelki zapisane najdawniej. **Zapomnij kafelki map** usuwa całą pamięć. Pamięć podręczna wymaga bezpiecznego źródła (`https://` lub `localhost`); gdzie indziej każde zbudowanie pobiera od nowa.

## W porównaniu z Tacview {#compared-with-tacview}

Sprawdzone na oko, w jednym miejscu na teatr, na syntetycznych zapisach: rozbiegi do startu leżą na osiach narysowanych pasów, przejścia nad wybrzeżem wypadają na brzegu. Strona Tacview pochodzi z jego dokumentacji i opublikowanych zrzutów ekranu (tacview.net, jego strona na Steamie), a nie z uruchomienia go tutaj.

| | Tacview 1.9 | To tło, strumieniowane |
|---|---|---|
| Zasięg | cała kula ziemska | 1500 km wokół kamery, gdziekolwiek jest |
| Teren | ETOPO1 (około 1,25 km) wbudowany; SRTM 25–75 m, jeśli użytkownik zainstaluje pliki; teren DCS wyeksportowany z DCS | Copernicus GLO-30 (Mapterhorn), skala metrowa we Francji i w USA |
| Obrazy | brak wbudowanych; tekstury, które użytkownik pobiera (Mapview, SAS Planet, dodatki, na przykład mapa VFR Kaukazu) | EOX Sentinel-2 cloudless 2016, około 10 m, strumieniowane |
| Pokrycie terenu | brak, chyba że w teksturze | z OpenStreetMap, malowane na terenie (bez zdjęć) |
| Drogi, linie kolejowe | brak, chyba że w teksturze | każda klasa blisko kamery, główne drogi z daleka |
| Budynki | brak | wyciągnięte obrysy blisko kamery |
| Lotniska | etykiety i pasy jako płaskie prostokąty, bez oznaczeń | pasy z zmierzonymi końcami, z pasami bocznymi, linią środkową i kreskami progów; drogi kołowania, płyty postojowe; nazwy z kodami ICAO |
| Nazwy miejsc | część etykiet wsi i miast | miasta, miasteczka, wsie, lotniska, zależnie od odległości i wysokości |

Gdzie wciąż odstaje:

- **Rozdzielczość zdjęć**: poza USA i Francją mozaika satelitarna 10 m jest miękka poniżej około 2 km; Tacview z teksturą w przybliżeniu 17, zainstalowaną przez użytkownika, jest tam ostrzejszy.
- **Teren w kształcie samego DCS**: Tacview może pokazać teren, który eksportuje sam DCS; tutaj jest to prawdziwa Ziemia, która różni się od terenu DCS tam, gdzie modelerzy map go zmienili.
- **Krzywizna**: grunt jest płaską płaszczyzną, więc horyzont nie jest horyzontem zakrzywionej Ziemi; Tacview rysuje sferę.
- **Szybkość**: pierwsza wizyta w miejscu pobiera dziesiątki megabajtów, zanim obraz się wyostrzy; w przeglądarce z renderowaniem programowym (zrzuty ekranu) rysuje się z kilkoma klatkami na sekundę przy kilkuset kafelkach.

## Ograniczenia i co będzie później {#limits-and-what-comes-later}

- **Rozdzielczość terenu**: około 30 m w najlepszym razie, a grubiej na dużych obszarach. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (Cloud-Optimized GeoTIFF na AWS, bez klucza, ze stałym tekstem przypisu) jest lepszym źródłem: 30 m wszędzie, GLO-90 tam, gdzie GLO-30 ma luki (Armenia i Azerbejdżan, które pokrywa DCS Caucasus). Potrzebuje czytnika GeoTIFF i nie jest jeszcze używany.
- **Lepszy teren**: Copernicus GLO-30 na AWS nie wysyła nagłówków CORS, więc przeglądarka go nie odczyta; lustro OpenTopography da się odczytać (CORS i zakresy), ale ich warunki użycia w publicznej aplikacji są nieznane – trzeba zapytać przed jakimkolwiek użyciem. Mapterhorn już zawiera GLO-30.
- **Krzywizna**: grunt jest płaską płaszczyzną, a wysokości nie są obniżane o krzywiznę Ziemi, zgodnie z tym, jak układa się zapisy (wysokość jako wysokość); daleko od odniesienia obie rzeczy dryfują razem, o mniej niż część na tysiąc przy 100 km. Zginanie samych kafelków oddzieliłoby je od danych daleko, więc nie jest oferowane. Zakrzywiony horyzont wymaga tego samego obniżenia – kwadrat odległości od kamery podzielony przez dwukrotny promień Ziemi – zastosowanego w każdym przebiegu, który rysuje pozycję (poziom, kafelki, ciepło, linie, pudełka, etykiety, wybór) jako jeden wspólny parametr; prawdziwy globus potrzebuje też pozycji wyśrodkowanych na Ziemi dla danych i renderowania względem kamery. Oba są planowane wraz z trybem globusa.
- **Tylko dzisiejszy świat**: historyczne mapy DCS i IL-2 (Normandia 2, Kanał La Manche, Niemcy zimnej wojny, każda mapa IL-2) rysuje się z dzisiejszymi miastami, drogami i linią brzegu; panel to mówi. Lotniska z epoki nie są rysowane.
- **Brak trybu globusa**: tło to płaska lokalna płaszczyzna. Widok całej Ziemi jest planowany.
- Drogi są poszerzane na dużych obszarach, żeby zostały widoczne; z bliska są szersze niż w życiu.
- Nazwy teatrów DCS w tabelach Watchera dopasowuje się tak, jak podaje je DCS w `mission.theatre`; nazwa spoza listy wraca do pierwszego punktu zaokrąglonego do pełnych stopni, a potem tylko do szerokości i długości geograficznej.

## Mapy historyczne (jeszcze nie zbudowane) {#historical-maps-not-built-yet}

Mapy z epoki mogłyby później pokryć historyczne teatry. Serie US Army Map Service (AMS) to dzieła federalne rządu USA, ogólnie traktowane jako domena publiczna (sprawdź rekord każdego skanu; wiele to przedruki brytyjskich GSGS albo niemieckich oryginałów, których prawa korony lub czas ochrony dzieł anonimowych też już upłynęły):

| Teatr | Seria | Gdzie zeskanowane |
|---|---|---|
| IL-2 Stalingrad, Moskwa, Kubań, Wielkie Łuki, Prochorowka, Leningrad | AMS **N501**, Europa Wschodnia 1:250 000 (zestawiona w latach 50. z map radzieckich i niemieckich) | UT Austin PCL; niektóre arkusze georeferencyjne w UT GeoData |
| IL-2 Normandia, DCS Normandia 2 i Kanał La Manche | AMS **M661** / GSGS 4250, Francja 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Nadrenia | AMS **M501** 1:250 000 i **M841** 1:25 000 (Niemcy) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (wydania z 1951) i **L552** 1:250 000 | ANU Open Research (arkusze L751, „copyright expired”), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | brytyjskie mapy okopów z I wojny (nie AMS) | McMaster University; National Library of Scotland (warunki niekomercyjne) |

Arkusze AMS mają podziałkę szerokości i długości geograficznej na rogach, więc każdy byłby umieszczany dopasowaniem czterech rogów i nakładany na teren jako tekstura, budowany i trzymany lokalnie jak kafelki.

## Dla deweloperów {#for-developers}

### Wpis `geo` w tabeli Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` i `up` nazywają kolumny, które trzymają metry na wschód i na północ na tej samej płaszczyźnie stycznej w (`lat0`, `lon0`) oraz wysokość. Wczytanie zachowuje odniesienie, gdy jego odwzorowanie bierze dokładnie te kolumny (wschód jako X, północ i wysokość jako Y i Z, w którejkolwiek kolejności). Opcjonalny wpis `dcs` nazywa metry własne tabeli DCS (x na północ, y w górę, z na wschód) i jej teatr: wczytanie, które odwzorowuje te kolumny, zamiast tego umieszcza się przez rzut Merkatora poprzecznego tego teatru ([współrzędne DCS](#dcs-coordinates)). Tabela bez `geo` czyta się jak dotąd.

### Współrzędne DCS {#dcs-coordinates}

Każdy teatr DCS to rzut Merkatora poprzecznego (WGS84, skala 0,9996) z własnym południkiem środkowym i fałszywym początkiem; x w DCS to współrzędna północna, a z – wschodnia. Stałe to te, które publikuje projekt pydcs; matematyka to szereg Krügera do szóstego rzędu (Karney 2011), przeniesiony do [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Tło dla metrów DCS buduje się od razu w nich, więc tabela Watchera DCS odwzorowana przez `dcs_x`/`dcs_y`/`dcs_z`, poziom zapisany przez konwerter terenu DCS i tło współdzielą jedną ramę. Stałe Iraku nie są publikowane; dopasowano je do opublikowanych punktów odniesienia (4 cm średniokwadratowo).

Tabele DCS Watchera leżą na płaszczyźnie stycznej w stałym punkcie odniesienia teatru (tym samym, którego używa wybór teatru, niżej), więc kilka misji na jednym teatrze łączy się z zachowanym odniesieniem i układa się z tłem teatru bez jego przesuwania.

### Uproszczenie i budżet {#simplification-and-budget}

- Budynki poniżej 20 m² są pomijane; 60 m², gdy prostokąt ma ponad 30 km szerokości, 150 m² poza 80 km. Reszta dodaje się od największych, aż budynki osiągną 1,5 mln trójkątów.
- Drogi lokalne, drogi serwisowe i ścieżki są pomijane poza 60 km szerokości; poza 150 km zostają tylko autostrady, drogi ekspresowe, główne i drugorzędne.
- Całe tło mieści się w około 3 mln trójkątów. Notatka z importu mówi, ile budynków pominięto.
