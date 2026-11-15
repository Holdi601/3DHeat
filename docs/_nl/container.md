---
title: "Eén bestand per wedstrijd (.3dheat)"
parent: "Gegevens binnenhalen"
nav_order: 9
lang: "nl"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Eén bestand per wedstrijd: `.3dheat`

Een `.3dheat`-bestand is één hele wedstrijd in één bestand, om te kopiëren, te bewaren of te delen. Om er één te openen, zet je het bestand gewoon op het paneel Bron.

```
match.3dheat   (een ZIP-bestand)
  manifest      wat de match is, en de lijst van alles erin
  table         de posities (Parquet)
  match.json    het matchdocument
  sidecars      wat de converter heel bewaarde (gebeurtenissen, berichten, ...)
```

Een geconverteerde match was vroeger meerdere bestanden naast elkaar: de tabel
`<match>.parquet`, het matchdocument `<match>.match.json` en de bijbestanden
`<match>.<wat>.parquet` ([Converters bewaren alles](converters.md)). Een
`.3dheat`-bestand bevat ze allemaal in één: één replay, één bestand, om te
kopiëren, te bewaren of te delen.

Het is zo gebouwd dat het laden van duizend ervan even snel is als het laden van
losse tabellen, en zodat latere converters er veel meer in kunnen zetten zonder
een nieuw formaat.

## Er één laden {#loading-one}

Overal waar een bestand of een map geladen wordt, laadt een `.3dheat`-bestand ook,
en een map mag containers en losse bestanden door elkaar bevatten:

| Waar | Wat uit de container gelezen wordt |
|---|---|
| Paneel Bron van de **Heatmap** (bestanden, map, slepen en neerzetten) | de tabellen, alsof het de losse `<match>.parquet` waren |
| **Heatmap → Veel wedstrijden tegelijk** (Bestanden, Map, Map toevoegen) | de tabellen, ter plekke gelezen door de workers van de lader |
| Tabblad **Match** (Laden, of neerzetten op het beeld) | het matchdocument |
| Bord **Tactiek** telemetrie | de tabellen |

Een container openen leest twee kleine stukjes ervan, zijn inhoudsopgave aan het
eind en zijn manifest aan het begin; niets van een tabel wordt gelezen tot de lader
hem leest. Bijbestanden en het matchdocument worden alleen gelezen als iets erom
vraagt. Een map die dezelfde match twee keer bevat, los en verpakt, laadt hem één keer.

## Inpakken en uitpakken {#packing-and-unpacking}

Nieuwe conversies schrijven standaard containers: de War Thunder-converter
(`heat3d-wt-replay`), de CS2-converter (`heat3d_cs2 demos`) en de Tacview-tool
(`node tools/acmi-to-parquet.mjs`). `--loose` houdt de losse bestanden.

Matches die eerder geconverteerd zijn, of door andere tools, worden verpakt met:

```
node tools/3dheat-pack.mjs <map>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <map|bestand.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <map|bestand.3dheat>...
node tools/3dheat-pack.mjs update <bestand.3dheat> [--add <rol>[:<naam>]=<bestand>]... [--remove <naam>]...
node tools/3dheat-pack.mjs repack <map|bestand.3dheat>...
```

- **pack** vindt elke tabel `<match>.parquet` onder de mappen met de bestanden
  die erbij horen en schrijft `<match>.3dheat` ernaast. Een match die al verpakt
  is, wordt overgeslagen. Elke container wordt eerst helemaal teruggelezen (de
  sha256, grootte, CRC en Parquet-voet van elk onderdeel) voordat er iets anders
  gebeurt; de losse bestanden worden alleen verwijderd met `--delete-loose`, en
  voor een match die eerder verpakt was alleen als ze byte voor byte gelijk zijn
  aan wat de container bevat. Een match met een bestand dat in de laatste
  `--settle` minuten (standaard 10) veranderd is, wordt met rust gelaten: een
  converter kan er nog in schrijven.
- **unpack** schrijft de onderdelen terug als losse bestanden naast de container.
- **update** voegt onderdelen toe of vervangt ze zonder de tabellen die al in de
  container zitten opnieuw te schrijven (hieronder).
- **repack** schrijft een container helemaal opnieuw en laat weg wat updates
  achterlieten.

## Het formaat {#the-format}

Een `.3dheat`-bestand is een ZIP-archief (elk ZIP-hulpmiddel opent het), met deze regels:

1. **`manifest.json` is het eerste onderdeel** als een container geschreven wordt,
   en het is altijd aanwezig. Het wordt gevonden via de ZIP-centrale map, dus na
   een `update` kan het verderop in het bestand liggen.
2. **Onderdelen die op bytebereik gelezen worden of al gecomprimeerd zijn, worden
   opgeslagen** (ZIP-methode 0): Parquet, Arrow, afbeeldingen, modellen, audio,
   video, ondoorzichtige blobs. Een opgeslagen onderdeel is één aaneengesloten
   bytebereik van de container, dus een lezer leest de voet van een tabel en zijn
   kolomblokken op de plek zelf, via `File.slice` in een browser of een
   HTTP-bereikverzoek, precies zoals hij het losse bestand zou lezen.
3. **Tekst wordt gedeflateerd** (methode 8): JSON, CSV, platte tekst. Die zijn klein
   en worden helemaal gelezen.
4. Namen zijn UTF-8 (vlag bit 11), relatief, met `/` als scheiding, zonder `..`;
   ze mogen mappen bevatten (`analysis/heat.json`). Een verpakt los bestand houdt
   zijn eigen naam, dus uitpakken geeft dezelfde bestanden terug.
5. Onderdelen groter dan 4 GiB, of containers met meer dan 65.535 onderdelen,
   gebruiken ZIP64 zoals gebruikelijk. Schrijvers zetten geen datadescriptors na
   onderdelen.

De onderdelen die de converters nu schrijven, in deze volgorde:

| Rol | Onderdeel | Opgeslagen |
|---|---|---|
| `table` | `<match>.parquet` | ja |
| `match` | `<match>.match.json` | nee (gedeflateerd) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<rol>.parquet` | ja |
| `summary` | `<match>.summary.json`, de samenvatting van de massa-index ([Massa-analyse](mass-analysis.md)), toegevoegd door `tools/3dheat-summarize.mjs` | nee (gedeflateerd) |

De tabel komt direct na het manifest, zodat de eerste lezing van het begin van het
bestand het manifest en de lokale kop van de tabel samen dekt.

### Het manifest {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<datum>_<sessie>",
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
   "sha256": "<64 hexcijfers>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Veld | Betekenis |
|---|---|
| `format` | altijd `3dheat` |
| `format_version` | `major.minor` (hieronder) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | wat de match is en wat hem gemaakt heeft; `null` waar onbekend |
| `created`, `updated` | wanneer geschreven, wanneer voor het laatst bijgewerkt (`updated` verschijnt alleen na een update) |
| `roles` | elke rol naar de naam van zijn eerste onderdeel: een snelle index |
| `members` | elk onderdeel behalve het manifest: de volledige lijst, en de lijst die een lezer vertrouwt |
| `matches` | optioneel: de matches van een container met er meerdere (hieronder) |
| `references` | optioneel: bestanden die de container nodig heeft maar niet bevat |
| `extensions` | optioneel: de eigen metadata van een converter |

Elk onderdeel:

| Veld | Betekenis |
|---|---|
| `name` | zijn pad in de container |
| `role` | waarvoor het dient (hieronder) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` of `deflate` |
| `bytes` | zijn grootte, niet gecomprimeerd |
| `sha256` | van zijn bytes, niet gecomprimeerd |
| `rows` | het aantal rijen van een tabel |
| `schema` | de conventie die het volgt, `{ "id", "version" }`: de eigen `format` en `version` van een document (`heat3d-wt-replay-match` 2), `heat3d-table` voor een tabel die de viewer leest via zijn `heat3d`-voet, `heat3d-acmi-table` voor die van de Tacview-tool |
| `match` | in een container met meerdere matches de `matches[].id` waar het bij hoort |

### Gemaakt om te groeien {#made-to-grow}

Het formaat is bedoeld om veel rijkere replays te dragen dan nu, zonder te breken
wat er nu mee leest:

- **Versiebeheer.** `format_version` is `major.minor`. Een lezer leest elke
  minor-versie van zijn major en negeert elk veld dat hij niet kent. De minor gaat
  omhoog als er iets bijkomt; de major alleen als de indeling zo verandert dat een
  oudere lezer hem verkeerd zou lezen (een onderdeel niet meer opgeslagen, het
  manifest uit het archief verplaatst). De eigen conventie van elk onderdeel heeft
  een eigen versie, in zijn `schema`, dus een nieuwe tabelindeling of een nieuwe
  documentversie heeft geen nieuwe containerversie nodig. De eerste containers
  die geschreven werden, zeiden in plaats daarvan `"version": 1`; lezers nemen dat
  als 1.0.
- **Rollen zijn open.** Een rol is elke tekst. Lezers gebruiken de rollen die ze
  kennen en houden de rest: een onbekende rol wordt vermeld, nooit geweigerd, en
  `update` en `repack` nemen hem ongewijzigd mee. Een rol mag veel onderdelen
  hebben: meerdere tabellen (sporen per eenheid, telemetrie op andere snelheden),
  gebeurtenissen, stem, videosynchronisatie, verwijzingen naar niveaus,
  figuuroverschrijvingen, analyseresultaten. Namen mogen mappen bevatten.
- **Elke media.** Een onderdeel mag alles zijn wat een mediatype heeft: Parquet,
  JSON, Arrow, PNG- of JPEG-miniaturen, glTF-modellen, audio, ruwe blobs.
- **Meerdere matches.** Een sessie of een toernooi kan in één container: `matches`
  somt ze op (`{ "id", "map", "mode", "started", ... }`) en elk onderdeel noemt zijn
  `match`. De viewer laadt elk onderdeel van rol `table`.
- **Verwijzingen.** Bestanden die een container nodig heeft maar niet bevat, zoals
  een niveau daarvoor, staan in `references` met naam en sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), zodat het juiste bestand
  gevonden en gecontroleerd wordt zonder het in elke match te kopiëren.
- **Uitbreidingen.** `extensions` bevat de eigen metadata van een converter onder
  de eigen sleutel, `"<leverancier>/<naam>": { ... }`, zodat twee converters nooit
  botsen en niets aan de gedeelde velden toegevoegd hoeft te worden.
- **Ter plekke bijwerken.** `update` voegt onderdelen toe of vervangt ze zonder de
  grote opgeslagen tabellen opnieuw te schrijven: de nieuwe onderdelen en een nieuw
  manifest worden na het einde van de container toegevoegd, gevolgd door een nieuwe
  centrale map. Wat vervangen werd, blijft als niet-verwezen bytes staan tot
  `repack`. Elk onderdeel en elk manifestveld, bekend of niet, blijft bewaard. Een
  update die mislukt, wordt teruggedraaid naar de container zoals hij was.

De tests van de viewer houden het hieraan vast: een container van formaat 1.7 met
een onbekende rol, een onbekend veld van een onderdeel, een uitbreiding en een
audio-onderdeel in een map wordt geladen, en overleeft een update en een repack
met alles intact; een container van major 2 wordt geweigerd.

## Schrijvers {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (schrijven, lezen, verifiëren, bijwerken, repacken), gebruikt door het
  inpakprogramma en de Tacview-tool.
- Python: `container.py`, ongeveer 140 regels op de standaard `zipfile`, hetzelfde
  bestand in elke converter (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), zodat geen enkele converter van een andere afhangt.
  Een nieuwe converter kopieert het.
- De viewer leest met
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
