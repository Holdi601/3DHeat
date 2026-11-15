---
title: "Opis formatów danych"
nav_order: 19
lang: "pl"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: true
---

# Opis formatów danych

Ta strona wymienia każdy rodzaj pliku, który 3DHeat potrafi otworzyć, i to, jak musi wyglądać tabela w środku. Tabela to wiersze i kolumny, jak arkusz kalkulacyjny: każdy wiersz mówi, gdzie coś było i, jeśli to masz, kiedy i kto.

Co zakładka Mapa cieplna czyta, kolumna po kolumnie, i podpowiedzi, jakie może nieść plik Parquet. (Zakładka Analiza wyścigowa czyta pliki okrążeń, a zakładka Mecz – podsumowania meczów; zobacz [Analiza wyścigowa](race-analysis.md) i [Analiza meczu (CS2)](match-analysis.md).)

## Pliki {#files}

To jedyna pełna lista plików, które można wczytać. Panel **Źródło** (**Pliki…**, **Folder…** albo przeciągnięcie i upuszczenie) przyjmuje dokładnie te:

| Rozszerzenie | Co to jest | Odczytuje |
|---|---|---|
| `.parquet`, `.pq` | tabela Parquet | czytnik Parquet (niżej) |
| `.csv`, `.tsv`, `.txt` | tekst z separatorami | czytnik tekstu (niżej) |
| `.3dheat` | jeden mecz w jednym pliku (ZIP trzymający tabelę i jej dodatki) | wczytuje się jako tabela, którą zawiera – [Jeden plik na mecz](container.md) |
| `.acmi` (także `.txt.acmi`, `.zip.acmi`) | zapis lotu Tacview | własny czytnik – [Nagrania Tacview (ACMI)](tacview-acmi.md) |
| `.json`, `.json.gz` | zapis OCAP (w stylu Arma) | własny czytnik |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | ślady GPS: GPX, KML/KMZ, dzienniki NMEA, dzienniki szybowcowe IGC, pliki sportowe FIT | własny czytnik; pozycje pochodzą z szerokości i długości geograficznej |

Nie wczytuje się jako pozycji: małych plików JSON leżących obok tabeli i ją opisujących (nazwy kończące się na `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`) ani dodatkowych tabel konwertera (`<mecz>.events.parquet` i podobne, zobacz [Konwertery](converters.md)), chyba że wybierzesz je osobno. Wszystko inne jest pomijane z podaniem powodu. Jak filtruje się wybór, wyjaśnia [Wczytywanie plików](loading-files.md#which-files-are-kept).

Puste pliki są pomijane. W wyborze, który zawiera pliki `movement*.<rozszerzenie>`, wczytuje się tylko je ([Wczytywanie plików](loading-files.md#which-files-are-kept)).

Dane to **jeden wiersz na próbkę**: pozycja w jednej chwili, opcjonalnie z tym, kto, która grupa, która sesja, dokąd patrzył, i wszelkie dalsze kolumny. Wiersze zdarzeń (zabójstwo, założenie ładunku, strzał) mogą siedzieć w tej samej tabeli co wiersze pozycji, odróżnione kolumną zdarzenia.

## Tekst z separatorami (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Najmniejszy użyteczny plik, trzy wiersze:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolumny ustawiają się same ([Mapowanie kolumn](column-mapping.md)).

Analizuje to skaner bajtowy, który dekoduje tylko przypisane kolumny ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekt | Reguła |
|---|---|
| Nagłówek | Pierwszy niepusty wiersz zawiera nazwy kolumn. Pusta nazwa staje się `column_N`. |
| Separator | Wykrywany z pierwszych 20 niepustych wierszy z pierwszego 1 MiB, spośród przecinka, średnika, tabulatora i kreski pionowej, według **spójności**: wygrywa separator dający tę samą liczbę pól w każdym próbkowanym wierszu, potem ten dający więcej pól. Spacji nigdy się nie wykrywa, ale można ją wybrać; można wpisać dowolny pojedynczy znak ([Mapowanie kolumn](column-mapping.md#the-fields)). |
| Cytowanie | RFC 4180: pola mogą być w podwójnych cudzysłowach, a `""` w cudzysłowie to dosłowny cudzysłów. |
| Białe znaki | Spacje, tabulatory i cudzysłowy na początku i końcu każdego pola są obcinane. |
| Pól w wierszu | Co najwyżej 4096; więcej to błąd (*czy separator jest dobry?*). |
| Liczby | Opcjonalny znak, cyfry, opcjonalna `.` i ułamki, opcjonalny wykładnik (`1.5e-3`). Przecinek dziesiętny (`1,5`), separatory tysięcy i jednostki po liczbie (`12 m`) nie dają się odczytać i liczą się jako brakujące. Jeśli twój plik używa przecinków dziesiętnych, zamień je na kropki przed wczytaniem (pomaga wyszukaj i zastąp w edytorze tekstu). |
| Kolumna liczbowa | Kolumna jest oferowana jako liczbowa, gdy ponad 90% niepustych wartości w pierwszych 50 wierszach odczytuje się jako liczby. |
| Liczba wierszy | Szacowana przed wczytaniem ze średniej długości wiersza z pierwszego 1 MiB. |
| Kodowanie tekstu | UTF-8. |

## Parquet {#parquet}

Czytane przez [hyparquet](https://github.com/hyparam/hyparquet), fragment kolumny po fragmencie kolumny do typowanych tablic, pobierając tylko przypisane kolumny ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekt | Reguła |
|---|---|
| Liczba wierszy | Dokładna, z stopki, przed wczytaniem. |
| Podgląd | Pierwsze 50 wierszy, zdekodowane jako obiekty; ich wartości decydują, które kolumny wyglądają na liczbowe. |
| Liczby całkowite | `INT32`, a `INT64` (dekodowane jako BigInt) stają się liczbami. |
| Liczby zmiennoprzecinkowe | `FLOAT`, `DOUBLE`. |
| Wartości logiczne | 1 i 0. |
| Tekst | Używany w kolumnach osoby, grupy, sesji i kategorii; tekst wyglądający na liczbę jest przyjmowany dla ról liczbowych. |
| Typy logiczne `TIMESTAMP`, `DATE` | Dekodują się na chwile (milisekundy od 1970); jako oś czasu ustawienie jednostki jest ignorowane. |
| Kolumny zagnieżdżone | Kolumny struct i list nie są przeznaczone do żadnej roli (w podglądzie pokazują się jako tekst JSON); nietestowane. |
| Metadane stopki | Klucz `heat3d` jest czytany jako podpowiedzi mapowania (niżej). |

Kolumna pozycji, czasu albo spojrzenia, która zawiera coś innego niż liczbę, dekoduje się jako brakująca.

## Role kolumn i typy {#column-roles-and-types}

| Rola | Typ w pliku | Wymagana | Zapisywana jako | Limity |
|---|---|---|---|---|
| X, Y, Z | liczba | dwie z trzech | 32-bitowa liczba zmiennoprzecinkowa, po [mapowaniu osi](axes-units-and-time.md) | Wiersz bez użytecznej pozycji jest pomijany. |
| Czas | liczba w jednej z [jednostek czasu](axes-units-and-time.md#time-units), znacznik czasu Parquet albo tekst ISO-8601 | nie | 32-bitowe sekundy zmiennoprzecinkowe od najwcześniejszego wiersza | Sortowanie jest odrzucane powyżej 400 000 000 wierszy ([dlaczego](memory-and-budgets.md#the-sort-ceiling)). |
| Osoba | dowolny; kodowany słownikowo | nie | 32-bitowe id | |
| Sesja | dowolny; kodowany słownikowo | nie | 32-bitowe id | Etykiety wypisywane do 100 000 sesji. |
| Grupa | dowolny; kodowany słownikowo | nie | 16-bitowe id | Do 4096 grup, inaczej grupowanie jest porzucane. |
| Yaw, pitch | liczba, stopnie albo radiany | nie | 32-bitowe radiany zmiennoprzecinkowe | |
| Kierunek X, Y, Z | liczba | nie (wszystkie trzy razem) | przeliczany na yaw i pitch | |
| Kolumna filtra, *zakres* | liczba | nie | 32-bitowa liczba zmiennoprzecinkowa | Do 4 aktywnych filtrów naraz. |
| Kolumna filtra, *kategoria* | dowolny; kodowany słownikowo | nie | 32-bitowe id | Do 4096 wartości, inaczej kolumna nie jest zachowywana. |

Kolumna `TIMESTAMP` w Parquet zachowana jako kolumna filtra jest *zakresem* milisekund epoki – suwakiem, a nie listą.

## Podpowiedzi `heat3d` {#the-heat3d-hints}

Plik Parquet może nieść własne instrukcje czytania w metadanych klucz-wartość stopki, pod kluczem **`heat3d`**, jako obiekt JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Aplikacja stosuje je ponad własne zgadywanie, gdy plik jest pierwszy w wyborze; każdy wpis jest opcjonalny, a każdy wynik i tak jest widoczny i edytowalny w panelu [Mapowanie kolumn](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Wszystko, co nie daje się odczytać jako obiekt JSON, jest ignorowane.

### Schemat {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          nazwy kolumn pozycji
    "time": string,                                  kolumna czasu
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           kolumny filtrów do zachowania, najbardziej użyteczne pierwsze
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  musi być > 0
  },
  "entity": {
    "size": number                                   rozmiar jednej śledzonej rzeczy w jednostkach pliku, > 0
  }
}
```

| Wpis | Stosowany, gdy | Skutek |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | nazwana kolumna istnieje w pliku | Ustawia tę rolę. |
| `columns.timeUnit` | jest jedną z siedmiu jednostek | Ustawia jednostkę czasu. |
| `columns.angleUnit` | `"degrees"` albo `"radians"` | Ustawia jednostkę kąta. |
| `columns.lookMode` | `"vector"`, gdy dirX, dirY i dirZ są wszystkie ustawione; `"yawPitch"`, gdy yaw jest ustawiony; `"none"` | Ustawia tryb spojrzenia. |
| `columns.extra` | jest tablicą | Zastępuje automatyczną listę filtrów, zachowując tylko istniejące kolumny, których nie używa żadna rola; każda jest *zakresem*, gdy w podglądzie wyglądała na liczbową, inaczej *kategorią*. Bez tego zachowuje się automatyczną listę bez kolumn przypisanych przez podpowiedź do roli. |
| `axes.up` | `"y"` albo `"z"` | Oś w górę. |
| `axes.flipX/Y/Z` | wartość logiczna | Odwrócenia. |
| `axes.scale` | liczba > 0 | Skala jednostek. |
| `entity.size` | liczba > 0 | [Rozmiar jednostki](sessions-persons-groups.md#entity-size) (mnożony przez skalę jednostek przy wczytaniu). Jedyny sposób, by go ustawić. |

### Przykład {#example}

Zmyślony eksport strzelanki: Z w górę, centymetry, świat lewoskrętny, gracze mają około 72 cm szerokości.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Zapisywanie {#writing-it}

Z pyarrow własne metadane schematu zapisuje się w metadanych klucz-wartość pliku:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` wypisuje schemat pliku – szybki sposób, by sprawdzić nazwy kolumn, do których odnoszą się podpowiedzi.

## Co zapisuje zakładka Mapa cieplna {#what-the-heatmap-tab-writes}

Nic nie zapisuje się z powrotem do danych. Wynikami są:

- wideo w formacie WebM (VP9 albo VP8) – [Ścieżka kamery i wideo](camera-path-and-video.md);
- pozycja kamery, skopiowana do schowka jako tekst – [Kamera](camera.md#pose);
- poziomy zapisane w [bibliotece poziomów](level-library.md) przeglądarki.
