---
title: "Kamera i sterowanie"
nav_order: 14
has_children: true
lang: "pl"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---


# Kamera i sterowanie

Lecisz przez scenę jak ptak: **W A S D**, by się poruszać, przeciągnij myszą, by się rozglądać. Użyj tej strony, by latać, przeskoczyć do widoku z góry albo z boku i odczytać dokładnie, gdzie jest kamera.

## Lot w 4 krokach {#fly-in-4-steps}

1. Kliknij raz na widok, żeby miał klawiaturę.
2. Trzymaj **W**, by lecieć do przodu, **S** do tyłu, **A** i **D** na boki, **Spacja** w górę, **Q** w dół.
3. Trzymaj lewy albo prawy przycisk myszy i przeciągnij, by się rozejrzeć.
4. Naciśnij **F**, by ponownie dopasować wszystkie dane do widoku.

Kamera to swobodna kamera lotu z rzutowaniem perspektywicznym i równoległym, gotowymi widokami, wpisywaną pozą i głębią ostrości. Jej ustawienia są w panelu **Kamera i scena** na dole paska bocznego (pokazywane też w kartach Analiza wyścigu i Mecz). Implementacja to [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Lot {#flying}

| Wejście | Działanie |
|---|---|
| `W` `A` `S` `D` albo klawisze strzałek | Do przodu (wzdłuż widoku, z jego pochyleniem), w lewo, do tyłu, w prawo |
| `Space` albo `E` | W górę (w górę świata) |
| `Q` albo lewy `Ctrl` | W dół |
| `Shift` (przytrzymany) | 6× szybciej |
| lewy `Alt` (przytrzymany) | 15% prędkości |
| Przeciągnięcie lewym albo prawym przyciskiem myszy | Rozglądanie się. Wskaźnik jest zablokowany podczas przeciągania. |
| Kółko myszy | Prędkość lotu ×1,5 na jeden ząbek (perspektywa); zoom (równoległe) |
| `F` | Dopasuj dane do widoku |
| Kliknięcie (bez przeciągania) | Pokazuje, co jest pod wskaźnikiem ([Oglądanie widoku](#inspecting-the-view)) |
| `C` | Kopiuje pozycję kamery, odchylenie i pochylenie |
| `G` | Przejdź do wpisanego punktu |
| `Esc` | Zamyka kartę wyboru (i przestaje śledzić jednostkę) |

### Podczas śledzenia jednostki {#while-following-a-unit}

Gdy kamera śledzi jednostkę w powtórce ([Powtórka meczu](match-replay.md)), klawisze lotu robią coś innego:

| Wejście | Działanie |
|---|---|
| Kółko, `W` / `S` | Bliżej jednostki / dalej (wyżej / niżej w widoku satelitarnym) |
| `A` / `D`, `Q` / `E` | Krążenie wokół jednostki (widoki pościgu i orbity) |
| Przeciągnięcie | Rozglądanie się wokół jednostki (w kokpicie: rozglądanie się w środku) |
| `V` / `Shift+V` | Następny / poprzedni widok kamery |
| `Esc` | Najpierw przestaje patrzeć na drugą jednostkę, potem przestaje śledzić |

Klawisze ruchu sumują się z [padem](gamepad.md); wszystkie pozostałe są w [dokumencie klawiszy](keyboard-reference.md). Klawisze są ignorowane, gdy aktywne jest pole tekstowe albo lista rozwijana. Pochylenie jest ograniczone tuż przed pionem w górę i w dół.

## Panel Kamera i scena {#camera--scene-panel}

![Panel Kamera i scena: Rzutowanie, Gotowe widoki, przyciski Pole widzenia, Prędkość lotu i Pozycja](../assets/img/en/camera-panel.webp)

### Rzutowanie {#projection}

**Rzutowanie**: *Perspektywa* (domyślnie) albo *Równoległe*.

*Równoległe* (ortograficzne) usuwa skrót perspektywiczny, więc dwa punkty o tej samej gęstości wyglądają tak samo wielkie w dowolnym miejscu kadru — to porównanie, dla którego istnieje mapa cieplna — i to ono sprawia, że widok izometryczny jest izometryczny. W trybie równoległym kółko myszy przybliża (nie ma ruchu do przodu, który zmienia skalę), a [wskaźnik prędkości](#fly-speed) jest ukryty.

**Przełączanie zachowuje ten sam rozmiar obiektu.** Rzut równoległy nie ma pola widzenia, więc jego wysokość bryły nie jest związana z odległością kamery; zwykłe przełączenie albo mocno przybliża, albo nic nie pokazuje. Przejście do równoległego ustawia wysokość bryły na to, co kamera perspektywiczna obejmuje w odległości ostrzenia (2 × odległość × tan(fov / 2); odległość ostrzenia to odległość ostatniego dopasowania). Powrót przywraca pozę perspektywiczną, którą zostawiłeś, w tej samej pozornej skali, a nie tam, gdzie zabłądził widok równoległy.

### Gotowe widoki {#preset-views}

| Grupa | Przyciski | Orientacja |
|---|---|---|
| **Izometria** | **Pn-Wsch**, **Pn-Zach**, **Pd-Wsch**, **Pd-Zach** | Równoległe, pochylenie -35,264° (= atan(1/√2), kąt, przy którym wszystkie trzy osie rzutują się na tę samą długość), odchylenie -45°, 45°, -135°, 135°. Cztery narożniki, bo pojedynczy zawsze chowa połowę mapy za tym, co bliżej. |
| **Rzuty** | **Góra**, **Dół**, **Przód**, **Tył**, **Lewo**, **Prawo** | Równoległe. Góra patrzy prosto w dół (pochylenie -89,9°), Dół prosto w górę, Przód wzdłuż -Z (odchylenie 0°), Tył wzdłuż +Z (180°), Lewo wzdłuż -X (-90°), Prawo wzdłuż +X (90°). |
| | **Wróć do perspektywy** | Powrót do pozy perspektywicznej, którą zostawiłeś. W perspektywie wyłączone. |
| | **Widok trzy czwarte** | Perspektywa, odchylenie -35°, pochylenie -28°. |

Każdy gotowy widok przełącza samo rzutowanie — w perspektywie „widok z góry” wciąż zbiega się do punktu zbiegu i równe pola przestają wyglądać na równe — i dopasowuje dane z tego kierunku.

### Pole widzenia {#field-of-view}

**Pole widzenia** — kąt pionowy. Domyślnie 65°, 10–140° na suwaku (179° z uchwytem), z przyciskami **Płaski 20°**, **Długi 35°**, **Normalny 50°**, **Szeroki 65°**, **Bardzo szeroki 90°**. Wąski spłaszcza perspektywę i bardziej przypomina rzut równoległy; szeroki przesadza głębię i utrudnia ocenę odległości. Działa też w trybie równoległym, gdzie ustala skalę, do której wraca przełącznik, oraz odległość, jakiej używa **Klatka**.

### Prędkość lotu {#fly-speed}

**Prędkość lotu** — jednostki świata (metry) na sekundę przy pełnym gazie. Domyślnie 120; przy każdym wczytaniu rozmiar poziomy danych / 12. Logarytmiczna, 0,02–20 000 (200 000 z uchwytem; uchwyt zmienia ją w stosunkach, a nie w kwotach). Kółko myszy mnoży lub dzieli ją przez 1,5 na ząbek, w zakresie 0,02–200 000.

Ta sama wartość jest pokazana w prawym dolnym rogu widoku (tylko w perspektywie): prędkość w m/s albo km/s i czas przelotu przez dane (albo poziom, gdy wczytany jest poziom 3D) przy tej prędkości. Przeciągnij ją w górę lub w dół, by zmienić prędkość.

### Bliska i daleka płaszczyzna {#near-and-far}

**Blisko** (domyślnie 0,5) i **Daleko** (domyślnie 40 000) to odległości przycinania. Obie są przeliczane z danych przy każdym wczytaniu (blisko = max(0,05, rozmiar / 20 000), daleko = rozmiar × 12) i poszerzane, nigdy zawężane, przez większy poziom 3D ([Poziomy](levels.md#what-a-level-does-for-the-heat)). Ich stosunek ustala dokładność głębi, na której polega zasłanianie, więc bardzo małe Blisko przy dużym Daleko osłabia [zasłanianie](depth-and-culling.md). Patrząc z zewnątrz sceny albo wysoko nad jej ziemią, faktycznie używana płaszczyzna bliska przesuwa się do 2% tej odległości, więc mapa oglądana z daleka zachowuje dość głębi, by woda i brzeg nie migotały; pole pokazuje wciąż ustawioną wartość.

### Pozostałe ustawienia {#other-controls}

| Ustawienie | Domyślnie | Znaczenie |
|---|---|---|
| **Odwróć Y** | wyłączone | Odwraca rozglądanie myszą w górę i w dół. |
| **Głębia ostrości** | wyłączona | Zob. poniżej. |
| **Gamepad** | włączony | Zob. [Gamepad i HOTAS](gamepad.md). |
| **Pozycja** | | Zob. poniżej. |
| **Inspekcja** | | Odczyt kamery, wybór kliknięciem, konwencja odchylenia i *Przejdź do punktu*; zob. [Oglądanie widoku](#inspecting-the-view). |
| **Klatka zbioru danych (F)** | | Dopasowuje dane (w karcie Analiza wyścigu: okrążenia) do widoku, zachowując bieżący kierunek. Kamera stoi w odległości r / tan(fov / 2) od środka, gdzie r to połowa przekątnej granic danych. |
| **Siatka**, **Osie** | włączone, włączone | Siatka na ziemi z odstępem 1/2/5 × 10ⁿ około 1/40 rozpiętości danych (sięgająca 1,5 × danych, między 8 a 120 krokami siatki) i kolorowe osie. |
| **Odwróć oś świata** X, Y, Z | wyłączone | Zob. poniżej. |

### Pozycja {#pose}

Pięć pól liczbowych — **X**, **Y**, **Z** oraz **odchylenie °**, **pochylenie °** — które podążają za kamerą, dopóki żadne z nich nie ma fokusa. Wpisz wartość i naciśnij `Enter` (albo wyjdź z pola), by przesunąć kamerę tam. **kopiuj** wstawia `poz X Y Z · odchylenie A · pochylenie B` do schowka (z `(odchylenie gry)` za tym, gdy wybrana jest ta konwencja). Lot to sposób na eksplorowanie; współrzędne to sposób na odtworzenie widoku. To te same liczby co [odczyt kamery](#camera-readout): współrzędne danych, także gdy oś jest odwrócona, i odchylenie w wybranej [konwencji](#yaw-conventions).

### Odwróć oś świata {#invert-world-axis}

**Odwróć oś świata X / Y / Z** rysuje świat z odwróconą tą osią. Gra, która trzyma świat lewoskrętny, wychodzi w tym prawoskrętnym widoku odbity lustrzanie — zakręty w prawo rysują się jako w lewo — a odwrócenie X albo Z przywraca go. **Zmienia się tylko rysowanie**: dane, analiza i każda współrzędna, którą pokazują narzędzia (poza, linijka, przekrój), zostają współrzędnymi gry. Widok przewraca się w miejscu, zostawiając cię patrzącego na to samo miejsce. To ustawienie jest zapamiętywane w przeglądarce (klucz `localStorage` `heat3d.mirror`); porównaj z [odbiciami](axes-units-and-time.md#flips) przy wczytywaniu, które zmieniają dane.

## Oglądanie widoku {#inspecting-the-view}

Gdzie jest kamera, co jest pod wskaźnikiem i przejście do punktu — blok **Inspekcja** w panelu Kamera i scena oraz dwie nakładki w lewym górnym rogu widoku. Kod jest w [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) i [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Ustawienie | Domyślnie | Znaczenie |
|---|---|---|
| **Pozycja kamery nad widokiem** | włączone | Odczyt kamery, poniżej. Zamykany też przez **×**. |
| **Kliknięcie pokazuje, co tam jest** | włączone | Wybór kliknięciem, poniżej. |
| **Konwencja odchylenia** | Przeglądarka | Jakie odchylenie pokazują i odczytują odczyt, pola pozy i pole skoku. |

Te trzy są zapamiętywane w przeglądarce (klucz `localStorage` `heat3d.inspect`).

### Odczyt kamery {#camera-readout}

W lewym górnym rogu widoku: **x**, **y**, **z**, **odchylenie** i **pochylenie** kamery, na żywo, z etykietą nazywającą konwencję odchylenia. Pokazuje te same liczby co [Poza](#pose) i nic nie kosztuje podczas lotu (jest zapisywany na zegarze klatek, bez ponownego renderowania paneli).

- **kopiuj** (albo `C` wszędzie poza polem tekstowym) wstawia `x X y Y z Z odchylenie A pochylenie B (odchylenie przeglądarki)` do schowka, z kropkami dziesiętnymi bez względu na język — linia, którą pole skoku i każdy skrypt odczytują z powrotem.
- **przejdź** (albo `G`) otwiera pole pod spodem: wklej punkt i naciśnij `Enter`, żeby na niego spojrzeć, albo wklej całą skopiowaną pozę, żeby stanąć w tym widoku. `Esc` zamyka pole.

### Współrzędne: własny układ danych {#coordinates-the-datas-own-frame}

Każda współrzędna, jaką pokazują albo przyjmują narzędzia inspekcji, jest w **własnym układzie załadowanych danych**: [mapowanie osi](axes-units-and-time.md) z wczytania (oś w górę, odbicia, skala) jest cofane. Pozycja odczytana z widoku to liczba, którą trzyma tabela źródłowa, a liczba z tabeli wpisana w pole skoku ląduje na tym miejscu. Gdy mapowanie niczego nie zmienia (wczytanie z osią Y w górę, bez skali — tak zapisują narzędzia przechwytywania i eksportery poziomów), to po prostu świat; w przeciwnym razie odczyt niesie znacznik **układ danych**. Bez zbioru danych współrzędne są współrzędnymi świata. Odchylenie i pochylenie zawsze dotyczą świata widza, z osią Y w górę.

### Konwencje odchylenia {#yaw-conventions}

| Konwencja | Odchylenie 0° patrzy wzdłuż | Rośnie w stronę | Używana przez |
|---|---|---|---|
| **Przeglądarka** | -Z | -X | swobodną kamerę lotu, [gotowe widoki](#preset-views) |
| **Gra / narzędzia przechwytywania** | +X | -Z | kolumny `yaw` i pozy narzędzi przechwytywania; w poziomie wyeksportowanym w układzie widza — własne odchylenie gry |

Pochylenie jest takie samo w obu: w górę od poziomu. Różnią się o ćwierć obrotu i niczym więcej:

> odchylenie przeglądarki = odchylenie gry - 90°

Kierunek `d` to `(cos p · cos y, sin p, -cos p · sin y)` w konwencji gry i `(-sin y · cos p, sin p, -cos y · cos p)` w konwencji widza. Wybierz **Gra / narzędzia przechwytywania**, żeby wpisać odchylenie prosto z tabeli narzędzia przechwytywania albo porównać z nim odczyt.

### Przejście do punktu {#going-to-a-point}

**Przejdź do punktu**, w bloku Inspekcja (i w polu **przejdź** odczytu):

- pole tekstowe przyjmuje `x, y, z` albo `x y z` (lub `x; y; z`), z kropką albo przecinkiem dziesiętnym — `-321.6, 137.8, -59.9` i `-321,6 137,8 -59,9` to ten sam punkt. Pięć liczb dodaje odchylenie i pochylenie, a poza skopiowana z odczytu albo z pól pozy jest czytana w całości, z etykietami i konwencją włącznie;
- **odchylenie °** i **pochylenie °** (opcjonalnie) obracają kamerę w wybranej konwencji;
- **Spójrz na** zachowuje kierunek (podnoszony, by patrzeć w dół co najmniej 20°, jeśli patrzył poziomo) i cofa się wzdłuż niego do bieżącej odległości, utrzymywanej między 0,3% a 3% szerokości sceny — 6 do 60 m na dwukilometrowym poziomie. Odległość ostrzenia, wysokość bryły w widoku równoległym i prędkość lotu idą za tym, więc widok od razu jest użyteczny;
- **Stań tutaj** stawia kamerę w punkcie, obróconą do podanego odchylenia i pochylenia, albo tak jak była.

Wklejona poza z własnym odchyleniem i pochyleniem zawsze stawia cię w tym widoku.

### Wybór kliknięciem {#click-to-pick}

Kliknięcie na widok — naciśnięcie i puszczenie bez przeciągania więcej niż 4 piksele; przeciągnięcie wciąż rozgląda — pokazuje kartę w lewym górnym rogu z tym, co jest pod wskaźnikiem. Gdy [linijka](measure.md) jest włączona, kliknięcia idą do linijki.

**Narysowany punkt danych wygrywa.** Najbliższa próbka w odległości 8 pikseli od kliknięcia, spośród faktycznie narysowanych: wiersze w oknie czasu i w czasie życia, przechodzące [filtry](filters.md), pokazane grupy i podział różnicy, w obrębie odcięcia odległości i przekroju, który przycina mapę cieplną. W replayu pudełka, pudełko pod wskaźnikiem (gdziekolwiek na nim). Karta wypisuje każdą kolumnę, jaką niesie wiersz, pod własnymi nazwami kolumn źródła — czas (zegarowy albo sekundy z pliku w `m:ss.ss`), osoba, grupa, sesja, każda zachowana kolumna, pozycja i kierunek patrzenia — oraz odległość od kamery. W pamięci są tylko kolumny, które wczytanie zachowało: kolumna niewybrana jako [kolumna filtra](column-mapping.md) nie jest pokazywana.

**W przeciwnym razie powierzchnia poziomu**: punkt, w którym promień kliknięcia spotyka prawdziwe trójkąty poziomu (nie płaszczyznę odniesienia linijki), z **częścią**, do której należy (nazwa z eksportera, `structure:props`, `ground:terrain …`), jej **rodzajem** (ziemia, budowla, woda, obraz mapy), współrzędnymi i odległością. Geometria ukryta przez przekrój albo odcięcie odległości jest przepuszczana. Gdy poziom ma [siatkę nawigacyjną](model-levels.md#navigation-meshes), linia ją nazywa i mówi, czy miejsce na niej leży (✓). Nazwa części z przedrostkiem `≈` została zgadnięta z pudełek ograniczających części, bo ta część poziomu została uproszczona przy wczytywaniu.

Karta zostaje, aż ją zamkniesz (**×**, `Esc`), inne kliknięcie odpowie na coś innego albo kliknięcie w pustkę. W scenie rysowany jest cyjanowy krzyżyk w punkcie, a na ekranie pierścień nad nim. Jej przyciski: **kopiuj** (każda wartość i współrzędne jako `x, y, z`), **Spójrz na** i **Stań tutaj** (przy punkcie danych — patrząc tak, jak patrzył wiersz, gdy ma kierunek patrzenia; przy powierzchni — 1,7 m nad nią).

Poziom jest indeksowany do wyboru przy pierwszym kliknięciu, które tego wymaga: siatka kolumn nad jego obszarem, budowana po kilka milisekund między klatkami, żeby widok nigdy się nie zatrzymał (około sekundy pracy dla poziomu z kilkoma milionami trójkątów), i trzymana, aż poziom się zmieni. Do tego czasu karta mówi *Przygotowanie poziomu do wyboru* z procentem i odpowiada na kliknięcie, gdy jest gotowe. Wyszukiwanie punktu danych wśród ponad czterech milionów narysowanych wierszy jest rozkładane na klatki w ten sam sposób.

## Głębia ostrości {#depth-of-field}

Zwijana sekcja w Kamera i scena, zatytułowana *Głębia ostrości - włączona*, gdy jest włączona. Domyślnie wyłączona: to efekt prezentacji, a domyślny widok ma pokazywać dane, a nie ich interpretację.

| Ustawienie | Domyślnie | Zakres (pokrętło) | Znaczenie |
|---|---|---|---|
| **Włączona** | wyłączona | | |
| **Ostrość na kadrowany obiekt** | włączona | | Ostrość na odległości, której użyło ostatnie dopasowanie (*Ostrość na N m.*). |
| **Odległość ostrzenia** | 1000 | 1–200 000, logarytmiczna (10 000 000) | Pokazana, gdy ostrość jest ręczna. |
| **Przysłona** | ±35% | ±2% do ±200%, logarytmiczna (±3200%) | Głębia zachowana ostro, jako ułamek odległości ostrzenia — względna, a nie liczba f, bo sceny sięgają od pokoju do mapy o szerokości ośmiu kilometrów. |
| **Maksymalne rozmycie** | 12 px | 1–48 (256) | Największy promień rozmycia; koszt rośnie wraz z nim. |

Rozmywa **poziom, siatkę i pudełka** — *nie mapę cieplną*. Ciepło w pikselu to suma sprite'ów na wielu głębiach, więc nie ma jednej głębi, na której byłoby nieostre; rozmycie go przez to, co geometria stoi za nim, byłoby błędne wszędzie tam, gdzie ono unosi się przed nią. Ostre dane na złagodzonym tle są też bardziej użyteczne z tych dwóch. Rozmycie to 24-tapowe zbieranie pod złotym kątem w przebiegu składania, ważone tak, by ostry pierwszy plan nie był rozmazywany na zewnątrz przez rozmyte tło za nim. Zmiana odświeża widok bez restartowania akumulacji ciepła.

## Rozdzielczość płótna {#canvas-resolution}

Płótno jest renderowane w współczynniku pikseli wyświetlacza, ograniczonym do 2. Bufor ciepła może być renderowany w niższej rozdzielczości niż to ([Rozdzielczość ciepła](performance-and-stats.md)).

## Strony w tej sekcji {#pages-in-this-section}

- [Gamepad i HOTAS](gamepad.md)
- [Skróty klawiszowe i mysz](keyboard-reference.md)
