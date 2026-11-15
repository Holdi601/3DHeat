---
title: "Referentie gegevensformaten"
nav_order: 19
lang: "nl"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referentie gegevensformaten

Deze pagina somt elk soort bestand op dat 3DHeat kan openen, en hoe een tabel erin eruit moet zien. Een tabel bestaat uit rijen en kolommen, zoals een spreadsheet: elke rij zegt waar iets was en, als je het hebt, wanneer en door wie.

Wat het tabblad Warmtekaart kolom voor kolom leest, en de aanwijzingen die een Parquet-bestand kan bevatten. (Het tabblad Race-analyse leest rondebestanden, en het tabblad Wedstrijd leest wedstrijdsamenvattingen; zie [Race-analyse](race-analysis.md) en [Wedstrijdanalyse (CS2)](match-analysis.md).)

## Bestanden {#files}

Dit is de ene volledige lijst van laadbare bestanden. Het paneel **Bron** (**Bestanden…**, **Map…**, of slepen en neerzetten) accepteert precies deze:

| Extensie | Wat het is | Gelezen door |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tabel | de Parquet-lezer (hieronder) |
| `.csv`, `.tsv`, `.txt` | tekst met scheidingstekens | de tekstlezer (hieronder) |
| `.3dheat` | Eén wedstrijd in één bestand (een ZIP met de tabel en zijn extra's) | wordt geladen als de tabel die het bevat - [Eén bestand per wedstrijd](container.md) |
| `.acmi` (ook `.txt.acmi`, `.zip.acmi`) | Tacview-vluchtopname | de eigen lezer - [Tacview-opnamen (ACMI)](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-opname (Arma-stijl) | de eigen lezer |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-tracks: GPX, KML/KMZ, NMEA-logs, IGC-logs van zweefvliegen, FIT-sportbestanden | de eigen lezer; posities komen uit breedte- en lengtegraad |

Niet als posities geladen: de kleine JSON-bestanden die naast een tabel staan om die te beschrijven (namen die eindigen op `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), en de extra tabellen van een converter (`<wedstrijd>.events.parquet` en dergelijke, zie [Converters bewaren alles](converters.md)), tenzij je ze apart kiest. Al het andere wordt overgeslagen met een reden. Hoe een selectie wordt gefilterd, staat uitgelegd in [Bestanden laden](loading-files.md#which-files-are-kept).

Lege bestanden worden overgeslagen. In een selectie die `movement*.<ext>`-bestanden bevat, worden alleen die geladen ([Bestanden laden](loading-files.md#which-files-are-kept)).

De gegevens zijn **één rij per sample**: een positie op een moment, optioneel met wie, welke groep, welke sessie, waar die keek, en eventuele extra kolommen. Gebeurtenisrijen (een kill, een plant, een schot) kunnen in dezelfde tabel staan als positierijen, herkenbaar aan een gebeurtenis-kolom.

## Tekst met scheidingstekens (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Een kleinst bruikbaar bestand, drie rijen:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

De kolommen koppelen zichzelf ([Kolomtoewijzing](column-mapping.md)).

Ingelezen door een scanner op bytenniveau die alleen de gekoppelde kolommen decodeert ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Onderdeel | Regel |
|---|---|
| Koprij | De eerste niet-lege regel bevat de kolomnamen. Een lege naam wordt `column_N`. |
| Scheidingsteken | Bepaald uit de eerste 20 niet-lege regels van de eerste 1 MiB, uit komma, puntkomma, tab en pijp, op **consistentie**: het scheidingsteken dat op elke bemonsterde regel hetzelfde aantal velden geeft, wint; daarna het scheidingsteken dat er meer geeft. Spatie wordt nooit automatisch gedetecteerd, maar kan wel gekozen worden; elk enkel teken kan getypt worden ([Kolomtoewijzing](column-mapping.md#the-fields)). |
| Aanhalingstekens | RFC 4180: velden mogen tussen dubbele aanhalingstekens staan; `""` binnen aanhalingstekens is een letterlijk aanhalingsteken. |
| Witruimte | Spaties, tabs en aanhalingstekens aan het begin en eind van elk veld worden afgehaald. |
| Velden per rij | Hoogstens 4.096; meer is een fout (*klopt het scheidingsteken?*). |
| Getallen | Optioneel teken, cijfers, optioneel `.` en decimalen, optionele exponent (`1.5e-3`). Een decimale komma (`1,5`), duizendtalscheidingen of eenheden erachter (`12 m`) worden niet gelezen en tellen als ontbrekend. Als je bestand decimale komma's gebruikt, vervang ze dan door punten voordat je laadt (zoeken en vervangen in een teksteditor werkt). |
| Getalkolom | Een kolom wordt als getal aangeboden als meer dan 90% van de niet-lege waarden in de eerste 50 rijen als getal gelezen kan worden. |
| Aantal rijen | Vooraf geschat uit de gemiddelde regellengte van de eerste 1 MiB. |
| Tekstcodering | UTF-8. |

## Parquet {#parquet}

Gelezen met [hyparquet](https://github.com/hyparam/hyparquet), kolomblok per kolomblok in getypte arrays, waarbij alleen de gekoppelde kolommen worden opgevraagd ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Onderdeel | Regel |
|---|---|
| Aantal rijen | Exact, uit de footer, vóór het laden. |
| Voorbeeld | De eerste 50 rijen, gedecodeerd als objecten; hun waarden bepalen welke kolommen numeriek lijken. |
| Gehele getallen | `INT32`, en `INT64` (gedecodeerd als BigInt) worden getallen. |
| Kommagetallen | `FLOAT`, `DOUBLE`. |
| Booleans | 1 en 0. |
| Tekst | Gebruikt voor persoon-, groep-, sessie- en categoriekolommen; een tekst die op een getal lijkt, wordt geaccepteerd voor numerieke rollen. |
| `TIMESTAMP`- en `DATE`-logische typen | Worden gedecodeerd naar tijdstippen (milliseconden sinds 1970); als tijdas gebruikt, wordt de instelling van de eenheid genegeerd. |
| Geneste kolommen | Struct- en lijstkolommen zijn voor geen enkele rol bedoeld (ze worden als JSON-tekst getoond); niet getest. |
| Metadata van de footer | De sleutel `heat3d` wordt gelezen als koppelaanwijzingen (hieronder). |

Een positie-, tijd- of kijkkolom die iets anders dan een getal bevat, wordt gedecodeerd als ontbrekend.

## Kolomrollen en typen {#column-roles-and-types}

| Rol | Type in het bestand | Verplicht | Opgeslagen als | Grenzen |
|---|---|---|---|---|
| X, Y, Z | getal | twee van de drie | 32-bits float, na de [assenafbeelding](axes-units-and-time.md) | Een rij zonder bruikbare positie wordt weggelaten. |
| Tijd | getal in een van de [tijdseenheden](axes-units-and-time.md#time-units), Parquet-tijdstempel, of ISO-8601-tekst | nee | 32-bits float seconden vanaf de vroegste rij | Sorteren wordt geweigerd boven 400.000.000 rijen ([waarom](memory-and-budgets.md#the-sort-ceiling)). |
| Persoon | elk; woordenboekcodering | nee | 32-bits id | |
| Sessie | elk; woordenboekcodering | nee | 32-bits id | Labels getoond tot 100.000 sessies. |
| Groep | elk; woordenboekcodering | nee | 16-bits id | Tot 4.096 groepen, anders vervalt de groepering. |
| Gier, stamphoek | getal, graden of radialen | nee | 32-bits float radialen | |
| Richting X, Y, Z | getal | nee (alle drie samen) | omgezet naar gier en stamphoek | |
| Filterkolom, *bereik* | getal | nee | 32-bits float | Tot 4 filters tegelijk actief. |
| Filterkolom, *categorie* | elk; woordenboekcodering | nee | 32-bits id | Tot 4.096 waarden, anders wordt de kolom niet bewaard. |

Een Parquet-`TIMESTAMP`-kolom die als filterkolom bewaard wordt, is een *bereik* van epoch-milliseconden - een schuifregelaar, geen lijst.

## De `heat3d`-aanwijzingen {#the-heat3d-hints}

Een Parquet-bestand kan zijn eigen leesinstructies meedragen in de sleutel/waarde-metadata van zijn footer, onder de sleutel **`heat3d`**, als JSON-object ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). De viewer past ze toe boven zijn eigen gissingen wanneer het bestand het eerste van een selectie is; elk item is optioneel, en elk resultaat wordt nog steeds getoond en is aanpasbaar in het paneel [Kolomtoewijzing](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Alles wat niet als JSON-object leesbaar is, wordt genegeerd.

### Schema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          kolomnamen voor de positie
    "time": string,                                  de tijdkolom
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filterkolommen om te bewaren, het nuttigst eerst
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  moet > 0 zijn
  },
  "entity": {
    "size": number                                   grootte van één gevolgd ding in bestandseenheden, > 0
  }
}
```

| Item | Toegepast wanneer | Effect |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | de genoemde kolom bestaat in het bestand | Stelt die rol in. |
| `columns.timeUnit` | het is een van de zeven eenheden | Stelt de tijdseenheid in. |
| `columns.angleUnit` | `"degrees"` of `"radians"` | Stelt de hoekeenheid in. |
| `columns.lookMode` | `"vector"` met dirX, dirY en dirZ alle drie ingesteld; `"yawPitch"` met yaw ingesteld; `"none"` | Stelt de kijkmodus in. |
| `columns.extra` | het is een array | Vervangt de automatische filterlijst en houdt alleen bestaande kolommen over die niet door een rol gebruikt worden; elk wordt *bereik* als het in het voorbeeld numeriek leek, anders *categorie*. Zonder dit blijft de automatische lijst behouden, min elke kolom die een aanwijzing aan een rol toekende. |
| `axes.up` | `"y"` of `"z"` | Opwaartse as. |
| `axes.flipX/Y/Z` | een boolean | Omkeringen. |
| `axes.scale` | een getal > 0 | Eenheidsschaal. |
| `entity.size` | een getal > 0 | [Grootte van een entiteit](sessions-persons-groups.md#entity-size) (vermenigvuldigd met de eenheidsschaal bij het laden). De enige manier om die in te stellen. |

### Voorbeeld {#example}

Een verzonnen export van een shooter: Z omhoog, centimeters, een linkshandige wereld, spelers ongeveer 72 cm breed.

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

### Het schrijven {#writing-it}

Met pyarrow wordt aangepaste schemametadata geschreven naar de sleutel/waarde-metadata van het bestand:

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

`npm run inspect -- file.parquet` toont het schema van een bestand, een snelle manier om de kolomnamen te controleren waarnaar de aanwijzingen verwijzen.

## Wat het tabblad Warmtekaart schrijft {#what-the-heatmap-tab-writes}

Er wordt niets teruggeschreven naar de gegevens. De uitvoer is:

- video's, als WebM (VP9 of VP8) - [Camerapad en video](camera-path-and-video.md);
- een cameraopstelling, als tekst naar het klembord gekopieerd - [Camera en bediening](camera.md#pose);
- levels die zijn opgeslagen in de [niveaubibliotheek](level-library.md) van de browser.
