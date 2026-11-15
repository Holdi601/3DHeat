---
title: "Referens för dataformat"
nav_order: 19
lang: "sv"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Referens för dataformat

Den här sidan listar alla slags filer 3DHeat kan öppna, och hur en tabell i dem måste se ut. En tabell är rader och kolumner, som ett kalkylblad: varje rad säger var något var och, om du har det, när och vem.

Vad fliken Värmekarta läser, kolumn för kolumn, och de ledtrådar en Parquet-fil kan bära. (Fliken Racinganalys läser varvfiler, och fliken Match läser matchsammanfattningar; se [Racinganalys](race-analysis.md) och [Matchanalys](match-analysis.md).)

## Filer {#files}

Det här är den enda kompletta listan över filer som kan läsas in. Panelen **Källa** (**Filer…**, **Mapp…**, eller dra och släpp) tar emot exakt dessa:

| Ändelse | Vad det är | Läses av |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tabell | Parquet-läsaren (nedan) |
| `.csv`, `.tsv`, `.txt` | Avgränsad text | textläsaren (nedan) |
| `.3dheat` | En match i en fil (en ZIP som håller tabellen och dess extra filer) | läses in som tabellen den håller - [En fil per match](container.md) |
| `.acmi` (även `.txt.acmi`, `.zip.acmi`) | Tacview-flygninspelning | sin egen läsare - [Tacview-inspelningar](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-inspelning (Arma-stil) | sin egen läsare |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-spår: GPX, KML/KMZ, NMEA-loggar, IGC-segelflygloggar, FIT-sportfiler | sin egen läsare; positionerna kommer från latitud och longitud |

Läses inte in som positioner: de små JSON-filer som ligger bredvid en tabell för att beskriva den (namn som slutar på `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), och en konverterares extra tabeller (`<match>.events.parquet` och liknande, se [Konverterare](converters.md)) om du inte väljer dem var för sig. Allt annat hoppas över med en orsak. Hur ett urval filtreras förklaras i [Läsa in filer](loading-files.md#which-files-are-kept).

Tomma filer hoppas över. I ett urval som innehåller filer `movement*.<ändelse>` läses bara de in ([Läsa in filer](loading-files.md#which-files-are-kept)).

Datan är **en rad per sampel**: en position vid ett ögonblick, eventuellt med vem, vilken grupp, vilken session, vart de tittade, och eventuella fler kolumner. Händelserader (en kill, en plantering, ett skott) kan ligga i samma tabell som positionsrader, och skiljs åt med en händelsekolumn.

## Avgränsad text (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

En minsta användbar fil, tre rader:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolumnerna kopplar sig själva ([Kolumnmappning](column-mapping.md)).

Tolkas av en skanner på bytenivå som avkodar bara de mappade kolumnerna ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Egenskap | Regel |
|---|---|
| Rubrik | Den första icke-tomma raden håller kolumnnamnen. Ett tomt namn blir `column_N`. |
| Avgränsare | Känns igen från de första 20 icke-tomma raderna i de första 1 MiB, bland komma, semikolon, tabb och lodrätt streck, efter **konsekvens**: avgränsaren som ger samma antal fält på varje samplad rad vinner, sedan den som ger fler fält. Mellanslag känns aldrig igen men kan väljas; vilket enskilt tecken som helst kan skrivas in ([Kolumnmappning](column-mapping.md#the-fields)). |
| Citattecken | RFC 4180: fält får omslutas av dubbla citattecken, `""` inne i citat är ett bokstavligt citattecken. |
| Blanksteg | Inledande och avslutande mellanslag, tabbar och citattecken tas bort från varje fält. |
| Fält per rad | Högst 4 096; fler är ett fel (*är avgränsaren rätt?*). |
| Tal | Valfritt tecken, siffror, valfri `.` och decimaler, valfri exponent (`1.5e-3`). Ett decimalkomma (`1,5`), tusentalsavskiljare eller efterställda enheter (`12 m`) tolkas inte och räknas som saknade. Om din fil använder decimalkomma, byt ut dem mot punkter innan du läser in (sök och ersätt i en textredigerare fungerar). |
| Numerisk kolumn | En kolumn erbjuds som numerisk när mer än 90 % av de icke-tomma värdena i de första 50 raderna går att tolka som tal. |
| Antal rader | Uppskattas före inläsning från den genomsnittliga radlängden i de första 1 MiB. |
| Teckenkodning | UTF-8. |

## Parquet {#parquet}

Läses med [hyparquet](https://github.com/hyparam/hyparquet), kolumnblock för kolumnblock till typade arrayer, och begär bara de mappade kolumnerna ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Egenskap | Regel |
|---|---|
| Antal rader | Exakt, från filens slut, före inläsning. |
| Förhandsvisning | De första 50 raderna, avkodade som objekt; deras värden avgör vilka kolumner som ser numeriska ut. |
| Heltal | `INT32`, och `INT64` (avkodat som BigInt) blir tal. |
| Decimaltal | `FLOAT`, `DOUBLE`. |
| Booleska värden | 1 och 0. |
| Strängar | Används för kolumner för person, grupp, session och kategori; en sträng som ser ut som ett tal godtas för numeriska roller. |
| Logiska typerna `TIMESTAMP` och `DATE` | Avkodas till tidpunkter (millisekunder sedan 1970); används som tidsaxel ignoreras enhetsinställningen. |
| Kapslade kolumner | Struct- och list-kolumner är inte avsedda för någon roll (de förhandsvisas som JSON-text); inte testade. |
| Metadata i filens slut | Nyckeln `heat3d` läses som mappningsledtrådar (nedan). |

En position-, tids- eller blickkolumn som innehåller något annat än ett tal avkodas som saknad.

## Kolumnroller och typer {#column-roles-and-types}

| Roll | Typ i filen | Krävs | Lagras som | Gränser |
|---|---|---|---|---|
| X, Y, Z | tal | två av tre | 32-bitars flyttal, efter [axelmappningen](axes-units-and-time.md) | En rad utan en användbar position släpps. |
| Tid | tal i en av [tidsenheterna](axes-units-and-time.md#time-units), Parquet-tidsstämpel, eller ISO-8601-text | nej | 32-bitars flyttal i sekunder från tidigaste raden | Sortering nekas över 400 000 000 rader ([varför](memory-and-budgets.md#the-sort-ceiling)). |
| Person | vad som helst; ordbokskodad | nej | 32-bitars id | |
| Session | vad som helst; ordbokskodad | nej | 32-bitars id | Etiketter listas upp till 100 000 sessioner. |
| Grupp | vad som helst; ordbokskodad | nej | 16-bitars id | Upp till 4 096 grupper, annars släpps grupperingen. |
| Gir, stigning | tal, grader eller radianer | nej | 32-bitars flyttal i radianer | |
| Riktning X, Y, Z | tal | nej (alla tre tillsammans) | omvandlas till gir och stigning | |
| Filterkolumn, *intervall* | tal | nej | 32-bitars flyttal | Upp till 4 filter aktiva samtidigt. |
| Filterkolumn, *kategori* | vad som helst; ordbokskodad | nej | 32-bitars id | Upp till 4 096 värden, annars behålls inte kolumnen. |

En Parquet-kolumn av typen `TIMESTAMP` som behålls som filterkolumn är ett *intervall* av epokmillisekunder - ett reglage, inte en lista.

## Resultatkolumner {#outcome-columns}

Vem som vann, på varje rad, så att en plats, en väg eller ett drag kan bedömas efter hur ofta dess sida sedan vann ([Vinstandel](win-rate.md)). Visaren behåller de här kolumnerna själv, listar dem först i [filtren](filters.md) på visarens språk och läser dem i [vinstandelskartan](win-rate.md), [uppdelningen](breakdown.md) och [volymstatistiken](volumes.md#statistics). En konverterare för ett rondbaserat spel (CS2, Valorant, Rainbow Six Siege) eller ett matchbaserat (War Thunder) skriver alla fyra; Tacview-konverteraren skriver dem för en DCS-servers kampanjer där en rundfil säger vem som vann ([DCS-servrar](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Kolumn | Typ | Betydelse |
|---|---|---|
| `won` | 0/1 (tom där det är okänt) | radens sida (lag) vann **ronden**; i ett spel utan ronder matchen |
| `matchWon` | 0/1 (tom där det är okänt) | radens sida (lag) vann **matchen**; tom där inspelningen inte visar slutet |
| `round` | heltal, från 1 | ronden som raden hör till; 1 genom hela ett matchbaserat spel |
| `roundEndReason` | text | hur ronden slutade (i ett matchbaserat spel matchen), med orden nedan |

`won` och `matchWon` hör till radens sida: en T-spelares rader bär T-sidans resultat, en AI-enhets rader dess lags; rader som inte hör till någon sida lämnar dem tomma. En sida som byter vid halvtid behåller sin egen `matchWon` och tar varje ronds `won` så som den spelade den. Oavgjort är 0 för båda sidor.

Slutorsakerna är gemensamma för alla spel, så att ett filter fungerar på alla (ett spels eget ord mappas där det går, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Betydelse | Spel |
|---|---|---|
| `elimination` | alla spelare på en sida är ute | CS2, Valorant, Rainbow Six Siege |
| `bomb` | bomben (spike, desarmerarens mål) exploderade | CS2, Valorant, Rainbow Six Siege |
| `defuse` | bomben (spike) desarmerades | CS2, Valorant, Rainbow Six Siege |
| `time` | rondens klocka tog slut; War Thunder: avgjort med biljetter kvar på båda sidor | alla |
| `surrender` | en sida gav upp | CS2, Valorant, Rainbow Six Siege |
| `draw` | ingen vinnare | CS2 |
| `objective` | ett mål taget eller hållet (gisslan ut, område säkrat) | Rainbow Six Siege |
| `capture` | biljetterna tog slut medan vinnaren höll erövringszoner; DCS: en beständig kampanj som vanns genom att ta alla flygfält och zoner | War Thunder, DCS |
| `tickets` | biljetter förlorade genom nedskjutningar | War Thunder |
| `destruction` | de sista fordonen förlorade på en gång, ingen kvar att spawna | War Thunder |
| `other` | allt annat | |

Ange dem också i `heat3d`-ledtrådarnas `extra`-lista, som vilken annan kolumn som helst. Kolumnnamnen `win`, `round_won`, `match_won`, `end_reason` och `win_reason` läses som samma kolumner.

## `heat3d`-ledtrådarna {#the-heat3d-hints}

En Parquet-fil kan bära sina egna läsinstruktioner i filens slut, i nyckel/värde-metadata, under nyckeln **`heat3d`**, som ett JSON-objekt ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Visaren tillämpar dem över sina egna gissningar när filen är den första i ett urval; varje post är valfri och varje resultat visas ändå och kan redigeras i panelen [Kolumnmappning](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Allt som inte går att tolka som ett JSON-objekt ignoreras.

### Schema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          kolumnnamn för positionen
    "time": string,                                  tidskolumnen
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filterkolumner att behålla, mest användbara först
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  måste vara > 0
  },
  "entity": {
    "size": number                                   storleken på en spårad sak i filens enheter, > 0
  }
}
```

| Post | Tillämpas när | Verkan |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | den namngivna kolumnen finns i filen | Sätter den rollen. |
| `columns.timeUnit` | den är en av de sju enheterna | Sätter tidsenheten. |
| `columns.angleUnit` | `"degrees"` eller `"radians"` | Sätter vinkelenheten. |
| `columns.lookMode` | `"vector"` med dirX, dirY och dirZ alla satta; `"yawPitch"` med yaw satt; `"none"` | Sätter blickläget. |
| `columns.extra` | den är en array | Ersätter den automatiska filterlistan och behåller bara befintliga kolumner som inte används av en roll; var och en är *intervall* när den såg numerisk ut i förhandsvisningen, annars *kategori*. Utan den behålls den automatiska listan minus alla kolumner en ledtråd tilldelat en roll. |
| `axes.up` | `"y"` eller `"z"` | Upp-axel. |
| `axes.flipX/Y/Z` | en boolean | Vänder. |
| `axes.scale` | ett tal > 0 | Enhetsskala. |
| `entity.size` | ett tal > 0 | [Enhetens storlek](sessions-persons-groups.md#entity-size) (multipliceras med enhetsskalan vid inläsning). Det enda sättet att sätta den. |

### Exempel {#example}

En påhittad export av ett skjutspel: Z-upp, centimeter, en vänsterhänt värld, spelare cirka 72 cm breda.

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

### Så skriver du den {#writing-it}

Med pyarrow skrivs egen schemametadata till filens nyckel/värde-metadata:

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

`npm run inspect -- file.parquet` skriver ut en fils schema, vilket är ett snabbt sätt att kontrollera kolumnnamnen som ledtrådarna hänvisar till.

## Vad fliken Värmekarta skriver {#what-the-heatmap-tab-writes}

Ingenting skrivs tillbaka till datan. Utdata är:

- videor, som WebM (VP9 eller VP8) - [Kamerabana och video](camera-path-and-video.md);
- en kamerapose, kopierad till urklipp som text - [Kamera](camera.md#pose);
- nivåer sparade i webbläsarens [nivåbibliotek](level-library.md).
