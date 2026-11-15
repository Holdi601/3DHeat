---
title: "Wczytywanie plików"
parent: "Wczytywanie danych"
nav_order: 1
lang: "pl"
source: "loading-files.md"
source_hash: "75d650b0894d"
translated: true
outdated: false
---

# Wczytywanie plików

Ta strona pokazuje, jak podać 3DHeat swoje pliki i co program z nimi robi. Upuść folder,
a program wybierze pliki z pozycjami i połączy je w jeden obraz.

1. Otwórz **Źródło** u góry paska bocznego Mapy cieplnej.
2. Upuść pliki albo folder na strefę upuszczania albo naciśnij **Pliki…** lub **Folder…**.
3. Przeczytaj linię wyboru i **Szacowaną pamięć** (zobacz obrazek poniżej).
4. Naciśnij **Wczytaj**.

![Panel Źródło po upuszczeniu folderu z dziesięcioma meczami: 1 linia wyboru, 2 Szacowana pamięć: mieści się, 3 Wczytaj 10 plików](../assets/img/en/loading-files-source.webp)

*Po upuszczeniu folderu 3DHeat mówi, co znalazł i czy się to zmieści.*

Pliki wczytuje się w panelu **Źródło** u góry paska bocznego zakładki Mapa cieplna.
Wszystko wybrane naraz staje się **jednym** zbiorem danych.

## Wybieranie plików {#choosing-files}

| Element | Co robi |
|---|---|
| **Upuść tutaj pliki lub folder** (strefa upuszczania) | Upuść dowolną mieszankę plików i folderów. Foldery są przeglądane rekurencyjnie. Kliknięcie strefy otwiera ten sam wybierak co **Pliki…**. |
| **Jeden plik…** | Wybierak dla jednego pliku. |
| **Pliki…** | Wybierak, który przyjmuje kilka plików. |
| **Folder…** | Wybierak folderu (wybierak `webkitdirectory` przeglądarki); oferowany jest każdy plik w drzewie folderu. |

Wybieraki przyjmują typy plików z [listy plików, które można wczytać](data-formats.md#files).
Krótko: `.parquet`/`.pq` czytane są jako Parquet, `.csv`/`.tsv`/`.txt` jako tekst z
separatorami, `.acmi` (Tacview), `.json`/`.json.gz` OCAP i formaty GPS (GPX, KML, KMZ, NMEA,
IGC, FIT) idą przez własne czytniki, a kontenery meczów `.3dheat` wczytują się jako tabele,
które zawierają ([Jeden plik na mecz](container.md)). Kontener, którego nie da się odczytać,
jest pomijany jako *nie jest plikiem csv/parquet*.

Upuszczone foldery są przeglądane do głębokości 12 poziomów i najwyżej 20 000 plików, jako
zabezpieczenie przed pętlami dowiązań symbolicznych i nieskończonymi drzewami.

## Które pliki są zachowywane {#which-files-are-kept}

Zanim cokolwiek zostanie odczytane, wybór jest filtrowany ([`filterDataFiles`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts)):

- Plik z innym rozszerzeniem jest pomijany: *nie jest plikiem csv/parquet*.
- Plik o rozmiarze 0 bajtów jest pomijany: *pusty (0 bajtów)*.
- **Dodatki konwertera** - surowe dane, które konwerter trzyma obok tabeli meczu,
  `<mecz>.messages.parquet`, `.events.parquet`, `.raw.parquet` i inne wymienione w
  [Konwertery zachowują wszystko](converters.md) - są pomijane: *dodatek konwertera*. Aby
  otworzyć jeden, wybierz go albo upuść samodzielnie (albo tylko dodatki): wybór złożony
  wyłącznie z dodatków wczytuje je jak każdą tabelę. JSON obok tabeli (`.match.json`,
  `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json` i
  `.hints.json`) nigdy nie jest proponowany jako pozycje.
- **Zasada pliku ruchu.** Jeśli jakikolwiek plik w wyborze nazywa się `movement*.parquet`,
  `movement*.csv` (i inne rozszerzenia) - `movement.parquet`, `movement_1.parquet` i tak dalej -
  to każdy inny plik danych jest pomijany: *nie jest plikiem ruchu, a ten folder ma pliki ruchu*.
  Eksporty telemetrii często zawierają jedną tabelę pozycji obok dziesiątek tabel bez pozycji,
  a rysować można tylko te pierwsze. Folder bez żadnego pliku ruchu wczytuje wszystkie swoje
  pliki danych. Przykład: folder z `movement_1.parquet`, `kills.parquet` i `shop.parquet`
  wczytuje `movement_1.parquet`; pozostałe dwa są wymienione jako pominięte. Przykład: folder z
  `movement_1.parquet`, `kills.parquet` i `shop.parquet` wczytuje `movement_1.parquet`; pozostałe
  dwa są wymienione jako pominięte.
- Zachowane pliki są sortowane według ścieżki w wyborze, więc ten sam folder zawsze daje ten
  sam zbiór danych i te same kolory.

Panel pokazuje potem wybór (nazwę jednego pliku albo `folder (N plików)` z użyciem najdłuższej
wspólnej części ścieżki), liczbę plików, ich łączny rozmiar i łączną liczbę wierszy - dokładną,
gdy wszystkie pliki są Parquet, oznaczoną `≈`, gdy którykolwiek jest CSV. Pominięte pliki są
wypisane z powodem, pierwsze cztery z nazwy.

## Czytanie schematu {#reading-the-schema}

**Pierwszy** plik wyboru jest otwierany, by opisać schemat ("Czytanie schematu"): jego nazwy kolumn,
pierwsze 50 wierszy danych, które kolumny wyglądają na liczbowe, a dla Parquet typ logiczny każdej
kolumny i wpis `heat3d` w stopce. Folder eksportów jednej tabeli ma jeden schemat, więc jeden plik
reprezentuje wszystkie. Potem mierzony jest każdy plik ("Liczenie wierszy"): stopka Parquet daje
dokładną liczbę w jednym małym odczycie; liczba wierszy CSV jest szacowana ze średniej długości linii
z jego pierwszego megabajta.

Panel [Mapowanie kolumn](column-mapping.md) otwiera się z automatycznie zgadniętym mapowaniem, a
[szacowana pamięć](memory-and-budgets.md) pojawia się nad przyciskiem **Wczytaj**.

## Komunikaty przed wczytaniem {#messages-before-loading}

Pod wyborem panel wypisuje, z [`validateMapping`](https://github.com/Holdi601/3DHeat/blob/main/src/data/validate.ts):

- **Błędy** (czerwone) - wczytywanie nie może się zacząć: mniej niż dwie osie pozycji, ta sama
  kolumna na dwóch osiach, zmapowana kolumna, której nie ma w pliku, kolumna pozycji, która nie
  wygląda na liczbową, kolumna czasu, której próbkowane wartości są tekstem, podczas gdy jednostką
  jest liczba (każdy wiersz byłby odczytany jako NaN i wylądowałby w czasie 0), kolumna czasu
  ustawiona na ISO-8601, z której żadna próbkowana wartość nie daje się przeczytać jako data,
  skala jednostki równa 0.
- **Ostrzeżenia** (bursztynowe) - wczytanie się uda, ale prawdopodobnie nie tak, jak zamierzono:
  kolumna grupy, która przyjmuje różną wartość w większości próbkowanych wierszy (więc to identyfikator,
  a nie grupa), kolumna czasu `DATE` (każdy wiersz dnia ma ten sam moment), kierunek patrzenia
  ustawiony bez swoich kolumn.
- **Uwagi** - to, co wynika z mapowania: rysowanie na płaszczyźnie, gdy jedna oś nie jest zmapowana,
  brak osi czasu bez kolumny czasu, brak tras bez kolumny osoby, a bez kolumny grupy jeden kolor dla
  wszystkiego i różnica, która może dzielić tylko po kolumnie zachowanej do filtrowania.

## Wczytywanie {#loading}

Przycisk **Wczytaj** pokazuje *Wczytaj plik*, *Wczytaj N plików* albo *Wczytaj N plików (1 z K)*, gdy
ustawiony jest [krok decymacji](memory-and-budgets.md#decimation). Pokazuje *Za duże - zmniejsz albo
przerzedź* i jest wyłączony, gdy [sprawdzenie zmieszczenia](memory-and-budgets.md#the-fit-check)
mówi, że wczytywanie się nie zmieści; jest też wyłączony, gdy mapowanie ma błędy albo inne wczytywanie
trwa.

Podczas wczytywania panel pokazuje bieżący krok (z `[plik/pliki]` z przodu, gdy plików jest kilka),
wiersze odczytane dotąd, pasek postępu i **Anuluj**. Anuluj kończy wątek wczytujący, a wraz z nim
wątki parsujące, które uruchomił.

Strona dalej się rysuje podczas wczytywania, bo praca dzieje się w tle. Widzisz bieżący krok, odczytane
wiersze, pasek postępu i **Anuluj**. Po ostatnim pliku panel pokazuje kroki *Ustawianie wierszy w
kolejności czasu*, *Zmiana kolejności kolumn (n z m)*, *Mierzenie zasięgu*, *Budowanie listy*,
*Podsumowywanie sesji* i *Obliczanie czasu życia*, a potem *Wysyłanie N wierszy do GPU* przez jedną
klatkę, żeby długiego wysyłania nie wzięto za zamrożenie.

### Jak to działa {#how-it-works}

Wczytywanie działa w Web Worker ([`ingestWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestWorker.ts)).
Przy kilku plikach i więcej niż jednym [wątku parsującym](memory-and-budgets.md#parser-threads) do tylu
plików parsuje się **naraz**, każdy we własnym wątku parsującym ([`parseWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parseWorker.ts)),
o ile budżet RAM na to pozwala; i tak są łączone pojedynczo w kolejności wyboru, więc zbiór danych
jest taki sam jak przy wczytywaniu jeden po drugim. Gdy kilka jest w toku, wiersz postępu nazywa plik,
który ostatnio zgłosił postęp, a pasek i liczba wierszy sumują każdy plik w toku. Przy jednym wątku albo
jednym pliku pliki są parsowane jeden po drugim w samym wątku wczytującym. Czytane są tylko kolumny,
które nazywa mapowanie: niezmapowana kolumna pliku Parquet nic nie kosztuje; CSV jest przeglądany bajt
po bajcie, ale dekodowane są tylko zmapowane pola.

## Kilka plików staje się jednym zbiorem danych {#several-files-become-one-dataset}

Gdy wczytano więcej niż jeden plik ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), [`builder.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/builder.ts)):

- **Jedna lista.** Osoby, grupy, sesje i wartości kategorii są słownikami wspólnymi dla wszystkich
  plików, więc ten sam gracz w dwóch eksportach to jedna osoba z jedną trasą.
- **Jeden początek czasu.** Czasy trzymane są jako 64-bitowe sekundy podczas łączenia i przesuwane na
  najwcześniejszy czas *całego* wyboru, a potem zapisywane jako 32-bitowe sekundy od tego początku.
  Cztery eksporty z czterech popołudni ustawiają się w swojej prawdziwej kolejności, a nie jeden na
  drugim.
- **Jedna kolejność czasu.** Wiersze ze wszystkich plików są sortowane według czasu sortowaniem
  radix (zobacz [Górna granica sortowania](memory-and-budgets.md#the-sort-ceiling)).
- **Kolumna `Source file`.** Każdy wiersz pamięta, z którego pliku pochodzi, jako kolumnę kategorii o
  nazwie `Source file`. Pojawia się w [Filtrach](filters.md) i jako *Source file - porównaj dwa
  wczytania* w [podziale różnicy](difference.md). Wczytanie jednego pliku jej nie dostaje - stała
  kolumna kosztowałaby 4 bajty na wiersz, żeby nic nie mówić.
- **Brakujące kolumny.** Plik, któremu brakuje jednej z kolumn *filtra*, po prostu nie dodaje dla niej
  wartości. Plik, któremu brakuje zmapowanej kolumny *roli* (X, czas, osoba, ...), nie wczytuje się z
  komunikatem *plik nie ma kolumny "nazwa"*; przy wczytywaniu wielu plików taki plik jest pomijany, a
  reszta się wczytuje, a pominięte pliki są wypisane przy zbiorze danych. Wczytanie jednego pliku, które
  się nie uda, zgłasza błąd.
- **Ostrzeżenie o braku.** Gdy wczytane wiersze są mniej niż 95% wierszy policzonych wcześniej, zbiór
  danych niesie ostrzeżenie z brakującym udziałem - z nieczytelnych plików albo z wierszy bez użytecznej
  pozycji, które są odrzucane po drodze.

## Po wczytaniu {#after-loading}

Nowy zbiór danych zastępuje poprzedni. Przy każdym wczytaniu ([`setDataset`](https://github.com/Holdi601/3DHeat/blob/main/src/state/store.ts)):

- wszystkie filtry i widoczność grup są czyszczone;
- podział różnicy według grup jest resetowany: pierwsza połowa grup (zaokrąglona w górę) dodatnia,
  reszta ujemna;
- promień sprite'a ustawiany na zasięg poziomy / 120, a nasycenie na analityczne oszacowanie; rozmiar
  sześcianu, długość promienia patrzenia, prędkość lotu i płaszczyzny bliska/daleka ustawiane według
  zasięgu (zobacz [Sesje, osoby i grupy](sessions-persons-groups.md#entity-size));
- sesja powtórki pudełkowej ustawiana na sesję z największą liczbą wierszy;
- trasy ciepła liniowego zgadywane na nowo ([Ciepło liniowe](line-heat.md));
- tryb widoku wraca do **Ciepło**, jeśli bieżący tryb nie jest obsługiwany przez nowe dane; oś czasu
  wraca do **Wszystko** bez kolumny czasu, a historia do **Narastająco** bez czasów życia;
- głowica odtwarzania stoi na początku, a odtwarzanie się zatrzymuje;
- kamera obejmuje cały zbiór danych z domyślnego kierunku (patrząc wzdłuż -Z, pochylona w dół o około 36°).

Panel **Zbiór danych** pokazuje wtedy nazwę zbioru (wybór, liczby wierszy i plików oraz krok, jeśli
go użyto), `N drużyn · N osób · zasięg Ns` i każde ostrzeżenie, jakie wczytanie zgłosiło, na bursztynowo,
tak długo, jak zbiór jest wczytany. **Zwolnij** w tym panelu usuwa zbiór danych.
