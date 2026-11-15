---
title: "Jeden plik na mecz (.3dheat)"
parent: "Wczytywanie danych"
nav_order: 9
lang: "pl"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Jeden plik na mecz: `.3dheat`

Plik `.3dheat` to cały mecz w jednym pliku, do skopiowania, zachowania albo udostępnienia.
Aby go otworzyć, wystarczy upuścić plik na panel Źródło.

```
match.3dheat   (plik ZIP)
  manifest      czym jest mecz i lista wszystkiego w środku
  table         pozycje (Parquet)
  match.json    dokument meczu
  sidecars      to, co konwerter zachował w całości (zdarzenia, wiadomości, ...)
```

Przekonwertowany mecz był kiedyś kilkoma plikami obok siebie: tabela
`<mecz>.parquet`, dokument meczu `<mecz>.match.json` i dodatki
`<mecz>.<co>.parquet` ([Konwertery zachowują wszystko](converters.md)). Plik
`.3dheat` trzyma je wszystkie w jednym: jedna powtórka, jeden plik, do skopiowania,
zachowania albo udostępnienia.

Jest tak zbudowany, że wczytanie tysiąca takich plików jest równie szybkie jak
wczytanie luźnych tabel, i tak, by późniejsze konwertery mogły wsadzić do niego znacznie
więcej bez nowego formatu.

## Wczytywanie jednego {#loading-one}

Wszędzie tam, gdzie wczytuje się plik albo folder, wczyta się też plik `.3dheat`,
a folder może mieszać kontenery z luźnymi plikami:

| Gdzie | Co jest czytane z kontenera |
|---|---|
| panel źródła **Mapa cieplna** (pliki, folder, przeciągnij i upuść) | jego tabele, jakby były luźnym `<mecz>.parquet` |
| **Mapa cieplna → Wiele meczów naraz** (Pliki, Folder, Dodaj folder) | jego tabele, czytane na miejscu przez wątki czytnika |
| zakładka **Mecz** (Wczytaj albo upuść na widok) | dokument meczu |
| telemetria tablicy **Taktyka** | jego tabele |

Otwarcie kontenera czyta dwa małe fragmenty: jego katalog na końcu i manifest na początku;
z tabeli nic nie jest czytane, dopóki czytnik tego nie zażąda. Dodatki i dokument meczu są
czytane tylko wtedy, gdy ktoś o nie poprosi. Folder, w którym ten sam mecz jest dwa razy - luźno
i spakowany - wczytuje go raz.

## Pakowanie i rozpakowywanie {#packing-and-unpacking}

Nowe konwersje domyślnie zapisują kontenery: konwerter War Thunder
(`heat3d-wt-replay`), konwerter CS2 (`heat3d_cs2 demos`) i narzędzie Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` zachowuje osobne pliki.

Mecze przekonwertowane wcześniej albo przez inne narzędzia pakuje się poleceniem:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <rola>[:<nazwa>]=<plik>]... [--remove <nazwa>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** znajduje w folderach każdą tabelę `<mecz>.parquet` wraz z plikami, które do niej należą,
  i zapisuje obok niej `<mecz>.3dheat`. Mecz już spakowany jest pomijany. Każdy kontener jest najpierw
  odczytywany w całości (sha256, rozmiar, CRC i stopka Parquet każdego elementu), zanim cokolwiek innego
  się stanie; luźne pliki są usuwane tylko z `--delete-loose`, a dla meczu spakowanego wcześniej tylko
  wtedy, gdy są bajt w bajt tym, co trzyma kontener. Mecz z plikiem zmienionym w ciągu ostatnich
  `--settle` minut (domyślnie 10) jest zostawiany w spokoju: konwerter może go jeszcze zapisywać.
- **unpack** zapisuje elementy z powrotem jako luźne pliki obok kontenera.
- **update** dodaje albo zastępuje elementy bez przepisywania tabel już zapisanych w kontenerze (niżej).
- **repack** przepisuje kontener w całości, usuwając to, co po aktualizacjach zostało jako martwe bajty.

## Format {#the-format}

Plik `.3dheat` to archiwum ZIP (każde narzędzie ZIP je otworzy), z tymi zasadami:

1. **`manifest.json` jest pierwszym elementem**, gdy kontener jest zapisywany, i jest zawsze obecny.
   Znajduje się go przez katalog centralny ZIP, więc po `update` może leżeć dalej w pliku.
2. **Elementy czytane przez zakres bajtów albo już spakowane są zapisywane bez kompresji**
   (metoda ZIP 0): Parquet, Arrow, obrazy, modele, dźwięk, wideo, nieprzejrzyste bloby.
   Zapisany element to jeden ciągły zakres bajtów kontenera, więc czytnik czyta stopkę tabeli
   i jej fragmenty kolumn na miejscu, przez `File.slice` w przeglądarce albo żądanie zakresu HTTP,
   dokładnie tak jak czytałby luźny plik.
3. **Tekst jest kompresowany** (metoda 8): JSON, CSV, zwykły tekst. Są małe i czytane w całości.
4. Nazwy są w UTF-8 (bit flagi 11), względne, z ukośnikami `/`, bez `..`; mogą zawierać foldery
   (`analysis/heat.json`). Luźny plik spakowany zachowuje swoją nazwę, więc rozpakowanie daje te same pliki.
5. Elementy większe niż 4 GiB albo kontenery z więcej niż 65 535 elementami używają ZIP64, jak zwykle.
   Zapisujący nie stawiają deskryptorów danych za elementami.

Elementy, które konwertery zapisują dziś, w tej kolejności:

| Rola | Element | Bez kompresji |
|---|---|---|
| `table` | `<mecz>.parquet` | tak |
| `match` | `<mecz>.match.json` | nie (skompresowany) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<mecz>.<rola>.parquet` | tak |
| `summary` | `<mecz>.summary.json`, podsumowanie indeksu zbiorczego ([Analiza zbiorcza](mass-analysis.md)), dodawane przez `tools/3dheat-summarize.mjs` | nie (skompresowany) |

Tabela idzie zaraz za manifestem, więc pierwszy odczyt czytnika od początku pliku obejmuje
manifest i lokalny nagłówek tabeli razem.

### Manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<mapa>_RB_<data>_<sesja>",
 "map": "<mapa>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<mecz>.parquet", "match": "<mecz>.match.json", "flight": "<mecz>.flight.parquet" },
 "members": [
  {
   "name": "<mecz>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 cyfry szesnastkowe>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Pole | Znaczenie |
|---|---|
| `format` | zawsze `3dheat` |
| `format_version` | `major.minor` (niżej) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | czym jest mecz i co go wytworzyło; `null`, gdy nieznane |
| `created`, `updated` | kiedy zapisano, kiedy ostatnio zaktualizowano (`updated` pojawia się dopiero po aktualizacji) |
| `roles` | każda rola z nazwą jej pierwszego elementu: szybki indeks |
| `members` | każdy element poza manifestem: pełna lista i ta, której czytnik ufa |
| `matches` | opcjonalne: mecze kontenera, który trzyma kilka (niżej) |
| `references` | opcjonalne: pliki, których kontener potrzebuje, ale nie trzyma |
| `extensions` | opcjonalne: metadane konwertera |

Każdy element:

| Pole | Znaczenie |
|---|---|
| `name` | jego ścieżka w kontenerze |
| `role` | do czego służy (niżej) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` albo `deflate` |
| `bytes` | jego rozmiar, nieskompresowany |
| `sha256` | z jego bajtów, nieskompresowanych |
| `rows` | liczba wierszy tabeli |
| `schema` | konwencja, której się trzyma, `{ "id", "version" }`: własne `format` i `version` dokumentu (`heat3d-wt-replay-match` 2), `heat3d-table` dla tabeli, którą przeglądarka czyta po jej stopce `heat3d`, `heat3d-acmi-table` dla narzędzia Tacview |
| `match` | w kontenerze kilku meczów: `matches[].id`, do którego należy |

### Zbudowany do rozwoju {#made-to-grow}

Format ma pozwolić nieść dużo bogatsze powtórki niż dzisiejsze, bez psucia tego, co czyta obecne:

- **Wersjonowanie.** `format_version` to `major.minor`. Czytnik czyta każdą wersję minor swojego major
  i ignoruje każde pole, którego nie zna. Minor rośnie, gdy coś dodano; major tylko wtedy, gdy układ
  się zmienił tak, że starszy czytnik odczytałby go błędnie (element nie jest już zapisany bez kompresji,
  manifest przeniesiony poza archiwum). Konwencja każdego elementu ma własną wersję, w polu `schema`,
  więc nowy układ tabeli albo nowa wersja dokumentu nie wymaga nowej wersji kontenera. Pierwsze zapisane
  kontenery miały zamiast tego `"version": 1`; czytniki traktują to jako 1.0.
- **Role są otwarte.** Rola to dowolny ciąg znaków. Czytniki używają ról, które znają, a resztę zachowują:
  nieznana rola jest wypisywana, nigdy odrzucana, a `update` i `repack` przenoszą ją nietkniętą. Rola może
  mieć wiele elementów: kilka tabel (ścieżki jednostek, telemetria w innych częstotliwościach), zdarzenia,
  głos, synchronizację wideo, odwołania do poziomów, nadpisania sylwetek, wyniki analiz. Nazwy mogą
  zawierać foldery.
- **Dowolne media.** Element może być czymkolwiek z typem mediów: Parquet, JSON, Arrow, miniatury PNG lub JPEG,
  modele glTF, dźwięk, surowe bloby.
- **Kilka meczów.** Sesja albo turniej może trafić do jednego kontenera: `matches` je wymienia
  (`{ "id", "map", "mode", "started", ... }`), a każdy element wskazuje swój `match`. Przeglądarka wczytuje
  każdy element roli `table`.
- **Odwołania.** Pliki, których kontener potrzebuje, ale nie trzyma (na przykład poziom), są wymienione w
  `references` z nazwą i sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), więc właściwy plik
  jest znajdowany i sprawdzany bez kopiowania go do każdego meczu.
- **Rozszerzenia.** `extensions` trzyma metadane konwertera pod jego własnym kluczem,
  `"<dostawca>/<nazwa>": { ... }`, więc dwa konwertery nigdy się nie zderzą i nie trzeba nic dodawać do
  wspólnych pól.
- **Aktualizacja w miejscu.** `update` dodaje albo zastępuje elementy bez przepisywania dużych tabel bez
  kompresji: nowe elementy i nowy manifest są dopisywane za końcem kontenera, a za nimi nowy katalog centralny.
  To, co zastąpiono, zostaje jako nieprzywołane bajty, aż do `repack`. Każdy element i każde pole manifestu,
  znane albo nie, jest zachowywane. Nieudana aktualizacja jest cofana do kontenera takiego, jakim był.

Testy przeglądarki tego pilnują: kontener w formacie 1.7 z nieznaną rolą, polem elementu, rozszerzeniem
i elementem dźwiękowym w folderze się wczytuje i przetrwa aktualizację oraz repack z tym wszystkim w całości;
kontener w major 2 jest odrzucany.

## Zapisujący {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (zapis, odczyt, weryfikacja, aktualizacja, repack), używany przez narzędzie pakowania i narzędzie Tacview.
- Python: `container.py`, około 140 linii na standardowym `zipfile`, ten sam plik w każdym konwerterze
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), więc żaden konwerter nie zależy od
  innego. Nowy konwerter kopiuje go.
- Przeglądarka czyta za pomocą
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
