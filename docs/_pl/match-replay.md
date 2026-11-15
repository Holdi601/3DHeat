---
title: "Powtórka meczu"
nav_order: 9
has_children: true
lang: "pl"
source: "match-replay.md"
source_hash: "9d61f24a5a04"
translated: true
outdated: false
---

# Powtórka meczu

Powtórka to film z meczu, w którym każdy gracz jest narysowany jako to, czym kierował. Użyj jej, by ponownie obejrzeć walkę, śledzić jedną jednostkę i zobaczyć, kto w kogo trafił.

Strzały, trafienia, pożary i wraki są rysowane na jednostkach i celach na poziomie. Kamery, etykiety i wyświetlacz taktyczny pomagają czytać walkę. Znasz Tacview? [Zgodność z Tacview](tacview-parity.md) pokazuje, gdzie jest każde z jego narzędzi.

![Powtórka z figurami dla demo czołgów: czołgi jako własne figury, z etykietami nazwy, pojazdu i prędkości](../assets/img/en/replay-overview.webp)

## Rozpocznij powtórkę {#start-a-replay}

1. Wczytaj nagranie przez **Źródło → Pliki…** albo upuszczając je na panel Źródło (dowolna tabela z kolumną **osoby** i **czasu**, plik Tacview, przekonwertowana powtórka, mecz w [`.3dheat`](container.md)). Zob. [Wczytywanie danych](getting-data-in.md).
2. Otwórz kartę **Mecz** i wybierz **Powtórka z figurami**, albo wybierz **Nałożone figury** na pasku trybów karty Mapa cieplna.
3. W **Mecze w powtórce** wybierz jeden mecz, wszystkie naraz albo kilka.
4. Naciśnij **Odtwórz** na osi czasu (albo `K`). Przeciągnij oś czasu, by przeskoczyć.

Figury zastępują sześciany dla każdej jednostki, której nazwa albo typ jest znany (zob. [Sylwetki](figures.md)). Dane bez kolumny nazwy ani typu są rysowane jako żołnierze.

![Karta Mecz: wybór meczów, sekcja Figury, widoki kamer, Odtwórz i lista zdarzeń](../assets/img/en/match-replay-tab.webp)

## Figury {#figures}

![Płonący czołg w kamerze orbity, z pociskiem, który go trafił](../assets/img/en/replay-tanks.webp)

| Ustawienie (sekcja **Figury**) | Domyślnie | Co robi |
|---|---|---|
| **Figury zamiast sześcianów** | włączone | Wyłączone rysuje zwykłe sześciany. |
| **Rozmiar figur** (razy rozmiar prawdziwy) | 1 | 1 to rozmiar prawdziwy; od 0,25 do 20 razy (skala logarytmiczna). Większy pomaga z daleka. |
| **Najmniejsza figura na ekranie** | 36 px | Figury z daleka rosną, by mieć tyle; 0-200 px; 0 zostawia rozmiar prawdziwy. |
| **Z daleka**: Figura, Strzałka, Symbol | Figura | Czym staje się jednostka z daleka. |
| **Symbole** | NATO (APP-6) | NATO (APP-6), rosyjskie znaki taktyczne, ikony **Mapa gry** albo **Tylko kształty (dla daltonistów)**. |
| **Rozmiar symbolu**, **Moja strona**, **Wrogie / Neutralne**, **Kreski kursu** | 28 px (12-64), automatycznie, wrogie, włączone | Jak wyglądają symbole i która strona jest przyjazna. |
| **Linie pionowe** | włączone | Linia od każdej jednostki prosto w dół do ziemi, tak by wysokości były czytelne w 3D. |
| **Linie pionowe i etykiety przy uzbrojeniu** | wyłączone | Linie do ziemi i etykiety na pociskach i bombach. |
| **Pożary na jednostkach** | włączone | Płomienie od chwili, gdy jednostka się zapali, aż do ugaszenia. |
| **Trafienia w jednostki** | włączone | Znaki w miejscach, gdzie trafiły pociski (niżej). **Trafienia pozostają**: 1-300 sekund albo **Całe życie**. **Pływające znaczniki**: znaki rysowane ponad powierzchnią. |
| **Linie celowania i wieży** | wyłączone | Przerywane: dokąd patrzy gracz; ciągłe: dokąd wskazuje działo. |
| **Budynki** | pełne | Pełne albo przezroczyste budynki, gdy poziom je rysuje. |

### Symbole z daleka {#symbols-at-a-distance}

Gdy jednostka byłaby mniejsza niż **Najmniejsza figura na ekranie**, może stać się symbolem, który pozostaje czytelny. Kształt mówi, jakiego jest rodzaju (na przykład zaokrąglony prostokąt ze znakiem gąsienicy dla pancerza); kolor mówi, po czyjej jest stronie. Otwórz menu **Symbole**, aby zmienić styl.

![Te same sześć jednostek jako symbole NATO, rosyjskie znaki taktyczne, ikony mapy gry i same kształty](../assets/img/en/match-replay-symbols-styles.webp)

### Znaczniki trafień, wraki i pożary {#hit-marks-wrecks-and-fires}

- **Znaczniki trafień** leżą na powierzchni, w którą trafił pocisk, w skali figury. Ich wygląd mówi, co się stało: dziura (przebił), jasny rozprysk (nie przebił), rysa (odbił się), gwiazda sadzy (pocisk odłamkowo-burzący). Kolorowy pierścień mówi, co zrobił: strzał zabójczy, moduł zniszczony, krytyczne, poważne, uszkodzenie, bez uszkodzenia, trafienie. Najedź na znacznik, aby zobaczyć nazwę pocisku.
- Zniszczona jednostka jest rysowana **zwęglona** jako wrak od swojej śmierci, aż się odrodzi albo zostanie usunięta; jej symbol jest przekreślony.
- **Pożary** palą się na jednostce od chwili, gdy się zapali, aż do ugaszenia.
- **Wieże** obracają się tam, gdzie dane mówią, że wskazuje działo (a jeśli takich danych brak, tam, gdzie patrzy gracz).

### Broń, pociski i smugi {#weapons-decoys-and-tracers}

Przy włączonej opcji **Broń, strzały i trafienia** (sekcja Widok drużyn) rakiety, pociski kierowane, bomby i torpedy lecą jako własne figury z dymnym ogonem; kule i pociski są smugami; uderzenia i eksplozje błyskają. Smuga narysowana **przerywaną** linią została wyliczona z trafienia, bo dane nie miały strzału. Flary i plewy są rysowane jako wabiki; są ukryte na liście jednostek, chyba że zaznaczono *Wabiki i pociski*.

## Kamery {#cameras}

Kliknij jednostkę albo jej etykietę, by **podążać** za nią; sekcja **Powtórka** oferuje **Pościg**, **Orbita**, **Kokpit** (z wyświetlaczem head-up, `H`), **Stała**, **Padlock**, **Cel** i **Satelita**. `V` przełącza je po kolei, **Odległość kamery** ustala, jak daleko. Esc przerywa.

- **Widok dwóch jednostek**: wybierz **Cel** (albo kliknij jednostkę z Ctrl/Alt), by patrzeć na nią z podążanej jednostki; **Zamień** zamienia je miejscami.
- **Miara**: kliknij Shiftem dwie jednostki, aby zobaczyć kierunek, zasięg i różnicę wysokości między nimi.
- **Mapa 2D** (`M`): w rogu albo na cały ekran, ze śladami i nazwami.
- **Zakładki** (`B`): zapisują moment i kamerę; wypisane są też własne zabójstwa, zgony i znaczniki nagrania.
- **Zdarzenia**: każde zdarzenie w kolejności czasu; kliknięcie przeskakuje tam. `Page Up` / `Page Down` przeskakują między zdarzeniami; **Pauza przy zdarzeniu** zatrzymuje się przy każdym.

## Wyświetlanie taktyczne {#tactical-display}

![Demo powietrzne w wyglądzie wyświetlacza taktycznego (T): siatka terenu, panele zabójstw i zdarzeń](../assets/img/en/replay-air-tactical.webp)

Sekcja **Wyświetlanie taktyczne** rysuje dla żadnej jednostki, dla wybranych, dla wszystkich albo dla jednego rodzaju (samoloty, naziemne, okręty, uzbrojenie): wektory prędkości i ścieżkę przed jednostką, linie dziobu i nośności, stożki radarów, namierzenia, łącza danych, strefy i linie zaangażowania, linie widzenia, miejsca, w które patrzą gracze (stożki widzenia), celowanie wieży i zarejestrowaną kamerę.

### Styl wyświetlacza {#display-style}

`T` (albo przełącznik **Pokaż jako wyświetlacz taktyczny**) przełącza wygląd na styl ekranu radarowego: poświata, kontury, linie poziomicy, siatka pomiarowa, linie skanowania, pierścienie zasięgu, drabiny wysokości, panele z zabójstwami i zdarzeniami oraz **Reżyser**, który sam przesuwa kamerę do zdarzeń.

![Ta sama walka powietrzna w zwykłym wyglądzie](../assets/img/en/replay-air.webp)

## Cele {#objectives}

Gdy mecz przychodzi z celami, sekcja **Cele** rysuje je na poziomie: strefy przejęcia (z właścicielem i postępem przejęcia), spawny, lotniska, obszary i cele bombardowania, każda warstwa do przełączenia, z etykietami. Widać je przez grunt. Gdy wczytano kilka trybów gry, **Tryb** filtruje mecze według trybu. Cele pochodzą z pliku meczu konwertera obok nagrania albo z wnętrza kontenera [`.3dheat`](container.md).

## Etykiety i statystyki {#labels-and-statistics}

- **Etykiety**: reguły dla każdego rodzaju (**Zaznaczone**, **Samoloty**, **Naziemne**, **Okręty**, **Uzbrojenie**, **SI**): pokazane albo nie, jakie wartości i **Priorytet** określa, kto dostaje miejsce, gdy etykiety się nakładają. **Rozsuwaj etykiety** przesuwa etykietę obok jednostki, gdy zasłaniałaby inną, a gdzie nie ma miejsca, pomija ją. **Rozmiar etykiet** wynosi od 60 do 250%. **Wróć do nazwy, pojazdu, wysokości i prędkości** przywraca reguły.
  - Jednostki naziemne zaczynają od nazwy, pojazdu i prędkości.
  - Samoloty zaczynają od nazwy, pojazdu, wysokości i prędkości.
  - Okręty zaczynają od nazwy, pojazdu, prędkości i kursu.
  - Najedź na jednostkę, aby zobaczyć wszystkie jej wartości.
- **Statystyki**: dla każdej drużyny i jednostki: zabójstwa, zgony, strzały, trafienia, współczynnik trafień, starty, lądowania, czas w powietrzu, prędkość maksymalna, wysokość i G, dystans. Eksport CSV.
- **Wykresy**: wartości jednostki w czasie, porównanie dwóch jednostek albo jednej wartości z inną.

## Wiele meczów naraz {#many-matches-at-once}

Aby nałożyć na siebie setki albo tysiące meczów, zob. [Wiele meczów naraz](many-matches.md). Szczegóły figur (dym, ogień, inne efekty z czasem): [Sylwetki w nakładce](figure-replay.md). Lista funkcji Tacview: [Zgodność z Tacview](tacview-parity.md), podstrona tej strony.
