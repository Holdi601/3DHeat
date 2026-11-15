---
title: "Konwertery zachowują wszystko"
parent: "Wczytywanie danych"
nav_order: 8
lang: "pl"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---


# Konwertery zachowują wszystko

Nie potrzebujesz tej strony, żeby otworzyć powtórkę. Jest dla osób, które piszą narzędzia zamieniające pliki gier na tabele 3DHeat, i dla każdego, kto chce wiedzieć, dlaczego te tabele zawierają tak wiele.

Każde narzędzie, które zamienia powtórkę, demo, log albo telemetrię na żywo z gry w coś, co otwiera przeglądarka, stosuje jedną zasadę:

> **Zamień wszystko, co źródło zawiera i co da się odczytać już teraz, a resztę zachowaj w całości, żeby dało się ją odczytać później bez oryginalnego pliku.**

Powtórka często przepada po aktualizacji gry, ponownej instalacji albo pełnym dysku, a dane na żywo przepadają w chwili wysłania. To, co konwerter odrzuci, przepada na dobre; to, co zachowa w całości, można zdekodować tego dnia, gdy ktoś zrozumie format. Dlatego konwerter nigdy nie decyduje, co się przyda: dekoduje to, co potrafi, zachowuje każdą inną wiadomość, pakiet, zdarzenie, właściwość albo linię bez zmian obok tabeli i mówi w swoim własnym wyniku, ile z każdego odczytał, a ile tylko zachował.

Ta strona opisuje konwencję, którą dzielą wszystkie konwertery: powtórki War Thunder, World of Tanks, World of Warships i Squad, konwerter demo CS2, działający w tle watcher (jego dekoder powtórek Dota 2 i każdy adapter na żywo), czytniki telemetrii narzędzia do przechwytywania gry oraz importy przeglądarki (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Czytniki przeglądarki opisują [Nagrania Tacview](tacview-acmi.md) i [Wczytywanie plików](loading-files.md); forma jednoplikowa to [Jeden plik na mecz](container.md). Jeden mecz staje się tabelą, `match.json` i plikami towarzyszącymi, opcjonalnie spakowanymi w jeden plik `.3dheat`. README każdego narzędzia ma sekcję **Kompletność**, która wymienia dla danego źródła, co jest odczytane, co zachowane surowo i czego nie ma, i dlaczego.

## Trzy miejsca dla każdej pozycji {#three-homes-for-every-item}

Wszystko, co zawiera źródło, trafia dokładnie do jednego z trzech miejsc:

| Miejsce | Co tam trafia |
|---|---|
| **Zdekodowane** | Tabela (jeden wiersz na próbkę albo zdarzenie, kolumny, które czyta przeglądarka, dodatkowe kolumny dla każdej innej wartości należącej do wiersza) i dokument meczu `<match>.match.json` (wszystko, co należy do meczu jako całości: ustawienia, składy, wyniki, tablice wyników, samokontrola). |
| **Zachowane surowo** | Plik towarzyszący obok tabeli: każda pozycja, która nie jest zdekodowana albo jest zdekodowana tylko częściowo, w całości i bez zmian, z jej typem, czasem i jednostką albo podmiotem, do którego należy. |
| **Niedostępne** | Wymienione w sekcji Kompletność README z powodem: format tego nie przenosi (powtórka po stronie klienta nie ma wejść innych graczy), źródło tego nigdy nie wysyła albo odczyt jest niedozwolony (chroniony proces, zaszyfrowany blok, którego klucz nie jest nasz do użycia). |

Pozycja **częściowo** zdekodowana jest zdekodowana *i* zachowana surowo: tabela dostaje to, co zostało zrozumiane, a plik towarzyszący całą pozycję, więc lepszy dekoder później nie potrzebuje oryginalnego pliku.

Nie ma czwartego miejsca. Odrzucenie czegoś, bo wyglądało na bezużyteczne, bo było „prawdopodobnie” duplikatem albo bo było duże, jest błędem. Przycinanie jest dozwolone tylko w tabeli (kamera co 2 Hz zamiast 60), nigdy w pliku towarzyszącym.

## Pliki towarzyszące {#sidecars}

Plik towarzyszący to plik Parquet obok tabeli, nazwany od niej:

```
<folder>/<match>.parquet              the table
<folder>/<match>.match.json           the match document
<folder>/<match>.<what>.parquet       a sidecar
```

`<what>` to jedno słowo z tej listy. Nowy konwerter wybiera słowo, które pasuje, albo dodaje nowe tutaj **i** do `SIDECAR_PARQUET` w [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts), żeby przeglądarka pomijała je przy wczytywaniu całego folderu.

| `<what>` | Zawiera | Używany przez |
|---|---|---|
| `messages` | pakiety, wywołania metod encji i aktualizacje właściwości strumienia sieciowego, w całości | War Thunder, World of Tanks, World of Warships |
| `flight` | wpisy modelu lotu każdego samolotu, w całości | War Thunder |
| `packets` | całe ramki i wiadomości sieciowe albo fragmenty kontenera, poza strumieniem encji | CS2, Dota 2, Squad |
| `events` | zdarzenia gry z wszystkimi kluczami, tak jak podaje je parser | CS2 |
| `entities` | aktualizacje encji i właściwości, wywołania zdalne, kanały otwarte i zamknięte, z eksportami potrzebnymi dekoderowi | Squad, Dota 2 |
| `props` | każda właściwość encji, którą czyta parser, za każdym razem, gdy się zmieniła | CS2 |
| `units` | stan jednostek poza tabelą pozycji | Dota 2 |
| `combatlog` | dziennik walki, każdy wpis z każdym polem | Dota 2 |
| `strings` | każdy wpis każdej tablicy tekstów | CS2, Dota 2 |
| `objectives` | strefy przejęć i cele, każda zmiana z czasem | War Thunder |
| `raw` | transmisja na żywo: każdy otrzymany pakiet, linia, dokument API albo odczyt pamięci, w całości | sesje watchera (`heat.raw.parquet`), rejestratory okrążeń narzędzia przechwytywania gry (`<stamp>_<game>.raw.parquet`), pliki powtórek osu!, LoL i Valorant watchera |

Ładowanie folderu w przeglądarce pomija każdy `*.<what>.parquet` z tej listy oraz każdy `*.match.json`, `*.meta.json`, `*.summary.json` i inne pliki towarzyszące JSON; otwarcie jednego z nich samodzielnie, przez wybranie albo upuszczenie tylko tego pliku, wczytuje go jak każdą tabelę (zob. [Wczytywanie plików](loading-files.md)).

To są pliki, jak konwerter je zapisuje z `--loose`. Domyślnie konwertery War Thunder, CS2 i Tacview pakują tabelę, dokument i pliki towarzyszące meczu w jeden plik `<match>.3dheat` pod tymi samymi nazwami (zob. [Jeden plik na mecz](container.md)); wszystko tutaj obowiązuje dla każdego elementu.

### Kolumny {#columns}

Każdy wiersz pliku towarzyszącego to jedna pozycja. Kolumny są w tej kolejności, o ile mają zastosowanie:

| Kolumna | Typ | Co |
|---|---|---|
| `time` | float64 | sekundy na tym samym zegarze co `time` tabeli (albo `tick`, gdy źródło liczy ticki; wtedy oba) |
| `type` | string (słownik) | czym jest pozycja, w terminach źródła: typ pakietu, id wiadomości, nazwa zdarzenia, ścieżka właściwości, prefiks linii |
| `name` | string (słownik) | jej nazwa, jeśli jest znana (nazwa społeczności, nazwa klasy), inaczej pusta |
| `entity` / `unit` / `uid` / `player` | liczba całkowita albo tekst | do kogo należy, w tych samych identyfikatorach co tabela, więc wiersz pliku towarzyszącego można połączyć ze ścieżką |
| `decoded` | string (JSON) | co z niej zrozumiano, jeśli cokolwiek; w przeciwnym razie puste |
| `payload` | binary | bajty pozycji, w całości i bez zmian (źródła binarne) |
| `text` | string | tekst pozycji, w całości i bez zmian (źródła tekstowe: linia logu, obiekt JSON, blok klucz-wartość) |

Dozwolone są dalsze kolumny (przesunięcie bitowe, rozmiar, kanał). Powtarzające się ciągi są kodowane słownikowo, a plik jest zapisywany w zstd, więc plik towarzyszący to ułamek rozmiaru samej powtórki.

Plik towarzyszący musi wystarczać sam: dekoder napisany później czyta plik towarzyszący, nigdy oryginalnej powtórki. Tam, gdzie pozycji nie da się zrozumieć bez kontekstu (klasa encji, tablica tekstów, klucz, do którego odnosi się wiadomość), kontekst trafia również do pliku towarzyszącego albo do dokumentu meczu.

### Źródła na żywo {#live-sources}

Adaptery na żywo (telemetria UDP, pamięć współdzielona, dziennik gry, lokalne API) nie mają pliku, do którego można wrócić. **Zapisują każde pole, które źródło wysyła**, nawet te, których nic jeszcze nie używa:

- strumień pakietów: każdy pakiet w całości, `payload` to bajty, `type` to jego id albo format pakietu, w tempie, w jakim przychodzi;
- pamięć współdzielona albo odpytywane API: każde pole każdego odczytu, albo jako nazwane kolumny, albo cały blok jako `payload`, w tempie, w jakim adapter czyta;
- dziennik: każda linia, `text` to linia, `type` to rodzaj linii, także linie, na które adapter nie reaguje.

Trafiają one do `<session>.raw.parquet` obok tabeli sesji. Rozmiar to cena tej zasady; jest utrzymywany w ryzach dzięki zstd i kodowaniu słownikowemu, a nie przez pomijanie czegokolwiek.

## Samokontrola {#the-self-check}

Każdy konwerter zapisuje do swojego dokumentu meczu (albo `meta.json` sesji, albo podsumowania, gdy nie ma dokumentu meczu) blok `completeness` pod `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Pole | Znaczenie |
|---|---|
| `seen` | ile pozycji tego typu zawiera źródło |
| `decoded` | odczytane w całości do tabeli albo dokumentu meczu |
| `partial` | odczytane w części do tabeli albo dokumentu, a w całości zachowane w pliku towarzyszącym |
| `raw` | zachowane w całości tylko w pliku towarzyszącym, niezdekodowane |
| `lost` | `seen - decoded - partial - raw`: musi wynosić 0 |

Najwyższe `lost` to suma. Testy konwertera potwierdzają, że wynosi 0 na jego syntetycznych próbkach, a README mówi, jakie było na prawdziwych. Niezerowe `lost` to konwerter mówiący, że złamał zasadę; nazywa typ, więc lukę można znaleźć.

Pola „types” są własne źródła: typy pakietów, id wiadomości, nazwy zdarzeń, grupy właściwości, rodzaje linii. Liczone są tam, gdzie konwerter je napotka, a nie z listy tego, czego się spodziewa, więc nieznany typ pojawia się z własnym licznikiem zamiast zniknąć.

## Sekcja Kompletność w README {#the-readmes-completeness-section}

Każde README konwertera ma sekcję zatytułowaną **Kompletność**, z trzema listami:

- **Odczytane**: co trafia do tabeli i dokumentu meczu oraz jak każde nowe pole zostało sprawdzone z czymś niezależnym (liczbami samej gry, drugim źródłem, nagraniem zrobionym w tym celu).
- **Zachowane surowo**: co jest w którym pliku towarzyszącym, pod jakim `type`, i co o tym jest dotąd wiadomo.
- **Niedostępne**: czego źródło nie zawiera albo czego nie wolno czytać, i dlaczego.

Odsyła z powrotem tutaj.

## Gdzie stoi każdy konwerter {#where-each-converter-stands}

| Konwerter | Pliki towarzyszące | Jego sekcja Kompletność |
|---|---|---|
| Powtórki War Thunder | `messages`, `flight` | [README 3DHeat-Ext-WarThunder](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (liczby samokontroli są pod `counts`; blok `completeness` jest w planach) |
| Powtórki World of Tanks | `messages` | [README 3DHeat-Ext-WoT](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| Powtórki World of Warships | `messages` | [README 3DHeat-Ext-WoWs](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Demo serwerów Squad | `entities`, `packets` | [README 3DHeat-Ext-Squad](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| Demo CS2 | `events`, `props`, `strings`, `packets` | [README 3DHeat-CS2](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Powtórki Dota 2 (watcher) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Powtórki Dota 2](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| Powtórki osu!, LoL, Valorant (watcher) | `raw` | ich strony w [dokumentacji watchera](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Adaptery na żywo (watcher) | `raw` | strona każdej gry w [dokumentacji watchera](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) oraz [rozwój](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) dla `Session.raw` |
| Rejestratory okrążeń (przechwytywanie gry) | `raw`, oraz bajty `unparsed` wewnątrz pliku okrążenia Forzy | [README 3DHeat-GameCapture](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Własne importy przeglądarki | brak: zob. niżej | ta strona |

### Własne importy przeglądarki {#the-viewers-own-imports}

Tacview ACMI, OCAP i formaty GPS są czytane w przeglądarce z pliku użytkownika; przeglądarka niczego z nich nie przechowuje, więc sam plik pozostaje zapisem. Mimo to czytają tyle, ile mogą:

- **Tacview ACMI** (`src/data/acmi.ts`): każda linia obiektu z pozycją to wiersz z każdą właściwością, jaką niesie nagranie; każde zdarzenie to wiersz; każde usunięcie to wiersz; właściwości samego nagrania (z FileType i FileVersion z nagłówka) są na każdym wierszu jako `RecordingInfo`; linia komentarza to zdarzenie `Comment`, obiekt, który nigdy nie dostaje pozycji, to wiersz `Unplaced` w punkcie odniesienia, a U/V są kolumnami, gdy jakikolwiek wiersz je ma. Linia właściwości bez pozycji jest czytana częściowo: jej wartości trafiają do następnego wiersza obiektu, a nie na swój czas. `AcmiTable.completeness` liczy linie pliku według rodzaju.
- **OCAP** (`src/data/ocap.ts`): każda klatka encji, strzały, znaczniki, każdy rodzaj zdarzenia (nieznane rodzaje jako wiersze „Mission” z ich tekstem) i pola samego dokumentu (`Info`). Jeszcze nie czytane: pola encji i końcowe elementy pozycji inne niż wymienione w jego nagłówku (dodatki nowszego rejestratora) oraz powtarzające się klatki martwej jednostki po jej śmierci (celowo przerzedzone: w nich nic się nie zmienia).
- **Formaty GPS** (`src/data/geoTracks.ts`): fiksy, ich czas, wysokość, kurs i prędkość oraz tętno, kadencja, moc, temperatura, satelity, HDOP i wysokość ciśnieniowa tam, gdzie plik je zapisuje. Jeszcze nie czytane: inne rozszerzenia GPX i KML, zdania NMEA inne niż pozycyjne, rekordy IGC inne niż fiksy i ich rozszerzenia oraz komunikaty FIT inne niż rekordy (okrążenia, sesje, informacje o urządzeniu).

Te braki są wymienione po to, by je zamknąć, a nie by je usprawiedliwiać; eksporty przeglądarki wczytanego nagrania (`src/data/exportRecording.ts`) zapisują tylko to, co zostało odczytane.

## Dodawanie konwertera {#adding-a-converter}

1. Wypisz, co zawiera format, z jego dokumentacji, jego własnych struktur albo przez policzenie każdego typu wiadomości w prawdziwych próbkach. Lista to pole `types` samokontroli.
2. Zdekoduj to, co da się już sprawdzić. Każde nowe pole jest sprawdzane z czymś niezależnym, zanim trafi do tabeli; pole, którego jeszcze nie da się sprawdzić, zostaje surowe.
3. Resztę zachowaj w całości w pliku towarzyszącym o nazwie jak wyżej, z kolumnami jak wyżej.
4. Napisz blok `completeness` i test, że `lost` wynosi 0.
5. Napisz sekcję Kompletność w README i odeślij tutaj.
6. Jeśli `<what>` pliku towarzyszącego jest nowe, dodaj je do tabeli wyżej i do `SIDECAR_PARQUET` w `src/data/filePick.ts`.

Konwertery są pisane metodą czystego pokoju: powstają na podstawie formatów, dokumentacji i próbek, nigdy z kodu GPL ani AGPL. Próbki prawdziwych powtórek zostają na maszynie, która je zrobiła; testy używają syntetycznych plików.
