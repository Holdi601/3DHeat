---
title: "En fil pr. kamp (.3dheat)"
parent: "Indlæs data"
nav_order: 9
lang: "da"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# En fil pr. kamp: `.3dheat`

En `.3dheat`-fil er en hel kamp i én fil, til at kopiere, gemme eller dele. For at åbne en, slip blot filen på Kilde-panelet.

```
match.3dheat   (en ZIP-fil)
  manifest      hvad kampen er, og listen over alt indeni
  table         positionerne (Parquet)
  match.json    kampdokumentet
  sidecars      det konverteren gemte hele (hændelser, beskeder, ...)
```

En konverteret kamp var tidligere flere filer side om side: tabellen
`<match>.parquet`, kampdokumentet `<match>.match.json` og sidevognene
`<match>.<hvad>.parquet` ([Konvertere gemmer alt](converters.md)). En
`.3dheat`-fil holder dem alle i én: én replay, én fil, til at kopiere, gemme
eller dele.

Den er bygget, så det at indlæse tusind af dem er lige så hurtigt som at
indlæse de løse tabeller, og så senere konvertere kan lægge langt mere i den
uden et nyt format.

## Indlæs en {#loading-one}

Hvor som helst en fil eller en mappe indlæses, indlæses en `.3dheat`-fil også,
og en mappe kan blande containere og løse filer:

| Hvor | Hvad der læses fra containeren |
|---|---|
| **Heatmap**-kildepanelet (filer, mappe, træk og slip) | dens tabeller, som om de var den løse `<match>.parquet` |
| **Heatmap → Mange kampe på én gang** (Filer, Mappe, Tilføj mappe) | dens tabeller, læst på stedet af indlæserens workers |
| **Kamp**-fanen (Indlæs, eller slip på visningen) | kampdokumentet |
| **Taktik**-tavlens telemetri | dens tabeller |

Når en container åbnes, læses to små dele af den: dens katalog til sidst og
dens manifest i starten; intet af en tabel læses, før indlæseren læser den.
Sidevogne og kampdokumentet læses kun, når noget beder om dem. En mappe, der
holder den samme kamp to gange, løs og pakket, indlæser den én gang.

## Pakke og pakke ud {#packing-and-unpacking}

Nye konverteringer skriver containere som standard: War Thunder-konverteren
(`heat3d-wt-replay`), CS2-konverteren (`heat3d_cs2 demos`) og Tacview-værktøjet
(`node tools/acmi-to-parquet.mjs`). `--loose` beholder de separate filer.

Kampe, der blev konverteret før, eller af andre værktøjer, pakkes med:

```
node tools/3dheat-pack.mjs <mappe>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <mappe|fil.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <mappe|fil.3dheat>...
node tools/3dheat-pack.mjs update <fil.3dheat> [--add <rolle>[:<navn>]=<fil>]... [--remove <navn>]...
node tools/3dheat-pack.mjs repack <mappe|fil.3dheat>...
```

- **pack** finder hver tabel `<match>.parquet` under mapperne sammen med de
  filer, der hører til den, og skriver `<match>.3dheat` ved siden af dem. En
  kamp, der allerede er pakket, springes over. Hver container læses tilbage hel
  (hver medlems sha256, størrelse, CRC og Parquet-footer), før noget andet sker;
  de løse filer slettes kun med `--delete-loose`, og for en kamp pakket tidligere
  kun når de er byte for byte det, containeren holder. En kamp med en fil, der
  er ændret i de sidste `--settle` minutter (10 som standard), lades i fred: en
  konverter skriver måske stadig på den.
- **unpack** skriver medlemmerne tilbage som løse filer ved siden af containeren.
- **update** tilføjer eller erstatter medlemmer uden at omskrive de tabeller,
  der allerede er i containeren (nedenfor).
- **repack** omskriver en container helt og fjerner det, opdateringer efterlod.

## Formatet {#the-format}

En `.3dheat`-fil er et ZIP-arkiv (ethvert ZIP-værktøj åbner den), med disse regler:

1. **`manifest.json` er det første medlem**, når en container skrives, og den
   findes altid. Den findes via ZIP's centrale katalog, så efter en `update`
   kan den ligge senere i filen.
2. **Medlemmer, der læses via byteområder, eller som allerede er komprimeret,
   gemmes** (ZIP-metode 0): Parquet, Arrow, billeder, modeller, lyd, video,
   uigennemsigtige blobs. Et gemt medlem er ét sammenhængende byteområde i
   containeren, så en læser læser en tabels footer og dens kolonnestykker på
   stedet, med `File.slice` i en browser eller en HTTP-områdeforespørgsel,
   præcis som den ville læse den løse fil.
3. **Tekst er deflate-komprimeret** (metode 8): JSON, CSV, almindelig tekst. Disse
   er små og læses hele.
4. Navne er UTF-8 (flagbit 11), relative, med `/` som skilletegn, uden `..`; de
   kan indeholde mapper (`analysis/heat.json`). En pakket løs fil beholder sit
   eget navn, så udpakning giver de samme filer tilbage.
5. Medlemmer større end 4 GiB, eller containere med mere end 65.535 medlemmer,
   bruger ZIP64 som normalt. Skrivere sætter ingen datadeskriptorer efter
   medlemmer.

De medlemmer, konverterne skriver i dag, i denne rækkefølge:

| Rolle | Medlem | Gemt |
|---|---|---|
| `table` | `<match>.parquet` | ja |
| `match` | `<match>.match.json` | nej (deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<rolle>.parquet` | ja |
| `summary` | `<match>.summary.json`, massens indeks' resumé ([Masseanalyse](mass-analysis.md)), tilføjet af `tools/3dheat-summarize.mjs` | nej (deflate) |

Tabellen kommer lige efter manifestet, så læserens første læsning af filens
start dækker både manifestet og tabellens lokale header.

### Manifestet {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Felt | Betydning |
|---|---|
| `format` | altid `3dheat` |
| `format_version` | `major.minor` (nedenfor) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | hvad kampen er, og hvad der lavede den; `null`, hvor det ikke kendes |
| `created`, `updated` | hvornår skrevet, hvornår sidst opdateret (`updated` findes kun efter en opdatering) |
| `roles` | hver rolle til navnet på dens første medlem: et hurtigt indeks |
| `members` | alle medlemmer undtagen manifestet: den fulde liste, og den en læser stoler på |
| `matches` | valgfri: kampene i en container, der holder flere (nedenfor) |
| `references` | valgfri: filer containeren har brug for, men ikke holder |
| `extensions` | valgfri: en konverters egne metadata |

Hvert medlem:

| Felt | Betydning |
|---|---|
| `name` | dets sti i containeren |
| `role` | hvad det er til (nedenfor) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` eller `deflate` |
| `bytes` | dets størrelse, ukomprimeret |
| `sha256` | af dets bytes, ukomprimeret |
| `rows` | en tabels antal rækker |
| `schema` | konventionen, det følger, `{ "id", "version" }`: et dokuments eget `format` og `version` (`heat3d-wt-replay-match` 2), `heat3d-table` for en tabel viewet læser via sin `heat3d`-footer, `heat3d-acmi-table` for Tacview-værktøjets |
| `match` | i en container med flere kampe, `matches[].id`, den hører til |

### Lavet til at vokse {#made-to-grow}

Formatet er tænkt til at bære langt rigere replays end i dag uden at bryde det,
der læser det nu:

- **Versionering.** `format_version` er `major.minor`. En læser læser hver
  minor-version af sin major og ignorerer hvert felt, den ikke kender. Minor
  går op, når noget tilføjes; major kun når layoutet ændres, så en ældre læser
  ville læse det forkert (et medlem er ikke længere gemt, manifestet er flyttet
  ud af arkivet). Hvert medlems egen konvention er versioneret for sig, i sit
  `schema`, så et nyt tabellayout eller en ny dokumentversion ikke kræver en ny
  containerversion. De første containere, der blev skrevet, sagde
  `"version": 1` i stedet; læsere tager det som 1.0.
- **Roller er åbne.** En rolle er enhver streng. Læsere bruger de roller, de
  kender, og beholder resten: en ukendt rolle listes, afvises aldrig, og
  `update` og `repack` bærer den videre urørt. En rolle kan have mange
  medlemmer: flere tabeller (spor pr. enhed, telemetri i andre hastigheder),
  hændelser, stemme, videosynkronisering, banereferencer, figur-overskrivninger,
  analyseresultater. Navne kan indeholde mapper.
- **Ethvert medie.** Et medlem kan være hvad som helst med en medietype:
  Parquet, JSON, Arrow, PNG- eller JPEG-miniaturer, glTF-modeller, lyd, rå blobs.
- **Flere kampe.** En session eller et turnering kan gå i én container:
  `matches` lister dem (`{ "id", "map", "mode", "started", ... }`), og hvert
  medlem navngiver sin `match`. Vieweren indlæser hvert medlem med rollen `table`.
- **Kilder.** Filer, en container har brug for, men ikke holder, f.eks. en
  bane, listes i `references` med navn og sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), så den rigtige fil
  findes og kontrolleres uden at blive kopieret ind i hver kamp.
- **Udvidelser.** `extensions` holder en konverters egne metadata under sin egen
  nøgle, `"<leverandør>/<navn>": { ... }`, så to konvertere aldrig kolliderer,
  og intet skal tilføjes de fælles felter.
- **Opdatering på stedet.** `update` tilføjer eller erstatter medlemmer uden at
  omskrive de store gemte tabeller: de nye medlemmer og et nyt manifest føjes
  efter containerens slutning, efterfulgt af en ny central katalog. Det der blev
  erstattet bliver som ureferencerede bytes, indtil `repack`. Hvert medlem og
  hvert manifestfelt, kendt eller ej, beholdes. En opdatering, der fejler,
  skæres tilbage til containeren, som den var.

Viewerens tests holder den til dette: en container af format 1.7 med en ukendt
rolle, et medlemsfelt, en udvidelse og et lydmedlem i en mappe indlæses, og
overlever en opdatering og en repack med alt intakt; en container af major 2
afvises.

## Skrivere {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (skriv, læs, verificér, opdatér, repack), brugt af pakkeværktøjet og
  Tacview-værktøjet.
- Python: `container.py`, cirka 140 linjer på standardbiblioteket `zipfile`, den
  samme fil i hver konverter (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), så ingen konverter afhænger af en anden. En ny
  konverter kopierer den.
- Vieweren læser med
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
