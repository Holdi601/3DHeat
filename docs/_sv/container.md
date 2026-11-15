---
title: "En fil per match (.3dheat)"
parent: "Läsa in data"
nav_order: 9
lang: "sv"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# En fil per match: `.3dheat`

En `.3dheat`-fil är en hel match i en fil, att kopiera, spara eller dela. För att öppna en, släpp bara filen på panelen Källa.

```
match.3dheat   (en ZIP-fil)
  manifest      vad matchen är, och listan över allt som finns inuti
  table         positionerna (Parquet)
  match.json    matchdokumentet
  sidecars      det konverteraren behöll helt (händelser, meddelanden, ...)
```

En konverterad match var tidigare flera filer bredvid varandra: tabellen
`<match>.parquet`, matchdokumentet `<match>.match.json` och sidofilerna
`<match>.<vad>.parquet` ([Konverterare behåller allt](converters.md)). En
`.3dheat`-fil håller alla i en: ett repris, en fil, att kopiera, spara eller
dela.

Den är byggd så att det går lika snabbt att läsa in tusen av dem som de lösa
tabellerna, och så att senare konverterare kan lägga mycket mer i den utan ett
nytt format.

## Läsa in en {#loading-one}

Överallt där en fil eller en mapp läses in, läses även en `.3dheat`-fil in,
och en mapp kan blanda behållare och lösa filer:

| Var | Vad som läses ur behållaren |
|---|---|
| **Värmekarta**-panelen Källa (filer, mapp, dra och släpp) | dess tabeller, som om de var den lösa `<match>.parquet` |
| **Värmekarta → Många matcher på en gång** (Filer, Mapp, Lägg till mapp) | dess tabeller, lästa på plats av inläsarens arbetare |
| **Match**-fliken (Läs in, eller släpp på vyn) | matchdokumentet |
| **Taktik**-tavlans telemetri | dess tabeller |

Att öppna en behållare läser två små delar av den, dess katalog i slutet och
dess manifest i början; inget av en tabell läses förrän inläsaren läser den.
Sidofiler och matchdokumentet läses bara när något begär dem. En mapp som
innehåller samma match två gånger, lös och packad, läser in den en gång.

## Packa och packa upp {#packing-and-unpacking}

Nya konverteringar skriver behållare som standard: War Thunder-konverteraren
(`heat3d-wt-replay`), CS2-konverteraren (`heat3d_cs2 demos`) och Tacview-verktyget
(`node tools/acmi-to-parquet.mjs`). `--loose` behåller de separata filerna.

Matcher som konverterades förut, eller av andra verktyg, packas med:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** hittar varje tabell `<match>.parquet` under mapparna med de filer
  som hör till den, och skriver `<match>.3dheat` bredvid dem. En match som redan
  är packad hoppas över. Varje behållare läses tillbaka i sin helhet (varje
  medlems sha256, storlek, CRC och Parquet-fot) innan något annat händer; de
  lösa filerna tas bort först med `--delete-loose`, och för en match som packats
  tidigare bara när de är byte för byte det behållaren innehåller. En match med
  en fil som ändrats under de senaste `--settle`-minuterna (10 som standard)
  lämnas orörd: en konverterare kan fortfarande skriva på den.
- **unpack** skriver tillbaka medlemmarna som lösa filer bredvid behållaren.
- **update** lägger till eller ersätter medlemmar utan att skriva om tabellerna
  som redan finns i behållaren (nedan).
- **repack** skriver om en behållare i sin helhet och tar bort det som
  uppdateringar lämnat kvar.

## Formatet {#the-format}

En `.3dheat`-fil är ett ZIP-arkiv (vilket ZIP-verktyg som helst öppnar den), med dessa regler:

1. **`manifest.json` är första medlemmen** när en behållare skrivs, och den finns alltid. Den hittas via ZIP:ens centrala katalog, så efter en `update` kan den ligga senare i filen.
2. **Medlemmar som läses med bytintervall eller redan är komprimerade lagras** (ZIP-metod 0): Parquet, Arrow, bilder, modeller, ljud, video, ogenomskinliga blobbar. En lagrad medlem är ett sammanhängande bytintervall i behållaren, så en läsare kan läsa en tabells fot och dess kolumndelar på plats, med `File.slice` i en webbläsare eller en HTTP-intervallbegäran, precis som den skulle läsa den lösa filen.
3. **Text komprimeras** (metod 8): JSON, CSV, vanlig text. De är små och läses i sin helhet.
4. Namnen är UTF-8 (flaggbit 11), relativa, med `/` som avskiljare, utan `..`; de kan innehålla mappar (`analysis/heat.json`). En packad lös fil behåller sitt namn, så uppackning ger tillbaka samma filer.
5. Medlemmar större än 4 GiB, eller behållare med fler än 65 535 medlemmar, använder ZIP64 som vanligt. Skrivare lägger inga datadeskriptorer efter medlemmarna.

Medlemmarna som konverterarna skriver i dag, i denna ordning:

| Roll | Medlem | Lagrad |
|---|---|---|
| `table` | `<match>.parquet` | ja |
| `match` | `<match>.match.json` | nej (komprimerad) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | ja |
| `summary` | `<match>.summary.json`, massindexets sammanfattning ([Masanalys](mass-analysis.md)), tillagd av `tools/3dheat-summarize.mjs` | nej (komprimerad) |

Tabellen kommer direkt efter manifestet, så läsarens första läsning av filens
början täcker både manifestet och tabellens lokala huvud.

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

| Fält | Betydelse |
|---|---|
| `format` | alltid `3dheat` |
| `format_version` | `major.minor` (nedan) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | vad matchen är och vad som gjorde den; `null` där det inte är känt |
| `created`, `updated` | när den skrevs, när den senast uppdaterades (`updated` finns bara efter en uppdatering) |
| `roles` | varje roll till namnet på dess första medlem: ett snabbt register |
| `members` | alla medlemmar utom manifestet: hela listan, och den en läsare litar på |
| `matches` | valfri: matcherna i en behållare med flera (nedan) |
| `references` | valfri: filer som behållaren behöver men inte innehåller |
| `extensions` | valfri: en konverterares egna metadata |

Varje medlem:

| Fält | Betydelse |
|---|---|
| `name` | dess sökväg i behållaren |
| `role` | vad den är till för (nedan) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` eller `deflate` |
| `bytes` | dess storlek, okomprimerad |
| `sha256` | av dess byte, okomprimerade |
| `rows` | en tabells antal rader |
| `schema` | konventionen den följer, `{ "id", "version" }`: ett dokuments egna `format` och `version` (`heat3d-wt-replay-match` 2), `heat3d-table` för en tabell som visningsprogrammet läser via sin `heat3d`-fot, `heat3d-acmi-table` för Tacview-verktygets |
| `match` | i en behållare med flera matcher, `matches[].id` den hör till |

### Gjord för att växa {#made-to-grow}

Formatet är tänkt att bära betydligt rikare repriser än dagens utan att bryta
det som läser det nu:

- **Versionering.** `format_version` är `major.minor`. En läsare läser varje
  minor-version av sin major och ignorerar varje fält den inte känner till.
  Minor höjs när något läggs till; major bara när layouten ändras så att en
  äldre läsare skulle läsa den fel (en medlem lagras inte längre, manifestet
  flyttats ut ur arkivet). Varje medlems egen konvention versioneras separat,
  i sin `schema`, så en ny tabelllayout eller en ny dokumentversion behöver ingen
  ny behållarversion. De första behållarna som skrevs sade `"version": 1`
  i stället; läsare tar det som 1.0.
- **Roller är öppna.** En roll är vilken sträng som helst. Läsare använder de
  roller de känner till och behåller resten: en okänd roll listas, avvisas
  aldrig, och `update` och `repack` bär den vidare orörd. En roll kan ha många
  medlemmar: flera tabeller (spår per enhet, telemetri i andra takter),
  händelser, röst, videosynk, nivåreferenser, figuröverskrivningar,
  analysresultat. Namn kan innehålla mappar.
- **Vilket media som helst.** En medlem kan vara vad som helst med en
  mediatyp: Parquet, JSON, Arrow, PNG- eller JPEG-miniatyrer, glTF-modeller,
  ljud, råa blobbar.
- **Flera matcher.** En session eller en turnering kan ligga i en behållare:
  `matches` listar dem (`{ "id", "map", "mode", "started", ... }`) och varje
  medlem anger sin `match`. Visningsprogrammet läser in varje medlem med rollen
  `table`.
- **Referenser.** Filer som en behållare behöver men inte innehåller, till
  exempel en nivå, listas i `references` med namn och sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), så att rätt fil hittas
  och kontrolleras utan att kopieras in i varje match.
- **Tillägg.** `extensions` håller en konverterares egna metadata under sin
  egen nyckel, `"<leverantör>/<namn>": { ... }`, så två konverterare aldrig
  krockar och inget behöver läggas till i de gemensamma fälten.
- **Uppdatering på plats.** `update` lägger till eller ersätter medlemmar utan
  att skriva om de stora lagrade tabellerna: de nya medlemmarna och ett nytt
  manifest läggs efter behållarens slut, följt av en ny central katalog. Det som
  ersattes finns kvar som oreferade byte tills `repack`. Varje medlem och
  varje manifestfält, kända eller inte, behålls. En uppdatering som misslyckas
  skärs tillbaka till behållaren som den var.

Visningsprogrammets tester håller den till detta: en behållare i format 1.7 med
en okänd roll, ett medlemsfält, ett tillägg och en ljudmedlem i en mapp läses in,
och klarar en uppdatering och en repack med allt intakt; en behållare med major 2
avvisas.

## Skrivare {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (skriva, läsa, verifiera, uppdatera, repack), används av packverktyget och
  Tacview-verktyget.
- Python: `container.py`, ungefär 140 rader på standardmodulen `zipfile`, samma
  fil i varje konverterare (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), så att ingen konverterare beror på en annan. En ny
  konverterare kopierar den.
- Visningsprogrammet läser med
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
