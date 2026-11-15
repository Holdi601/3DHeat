---
title: "Reference for dataformater"
nav_order: 19
lang: "da"
source: "data-formats.md"
source_hash: "23c1890ce185"
translated: true
outdated: false
---

# Reference for dataformater

Denne side lister hver slags fil, 3DHeat kan åbne, og hvordan en tabel i den skal se ud. En tabel er rækker og kolonner, ligesom et regneark: hver række siger, hvor noget var, og – hvis du har det – hvornår og hvem.

Hvad fanen Heatmap læser, kolonne for kolonne, og de hints en Parquet-fil kan bære. (Fanen Løbsanalyse læser omgangsfiler, og fanen Match læser kampoversigter; se [Løbsanalyse](race-analysis.md) og [Kampanalyse](match-analysis.md).)

## Filer {#files}

Dette er den ene fuldstændige liste over filer, der kan indlæses. Panelet **Kilde** (**Filer …**, **Mappe …**, eller træk og slip) accepterer præcis disse:

| Endelse | Hvad det er | Læses af |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tabel | Parquet-læseren (nedenfor) |
| `.csv`, `.tsv`, `.txt` | Afgrænset tekst | tekstlæseren (nedenfor) |
| `.3dheat` | Én kamp i én fil (en ZIP, der holder tabellen og dens ekstra) | indlæses som den tabel, den holder – [Én fil pr. kamp](container.md) |
| `.acmi` (også `.txt.acmi`, `.zip.acmi`) | Tacview flyveoptagelse | sin egen læser – [Tacview-optagelser](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-optagelse (Arma-stil) | sin egen læser |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-spor: GPX, KML/KMZ, NMEA-logfiler, IGC-svæveflyvelogs, FIT-sportsfiler | sin egen læser; positioner kommer fra breddegrad og længdegrad |

Ikke indlæst som positioner: de små JSON-filer, der ligger ved siden af en tabel og beskriver den (navne, der ender på `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), og en konverters ekstra tabeller (`<kamp>.events.parquet` og lignende, se [Konvertere](converters.md)), medmindre du vælger dem alene. Alt andet springes over med en grund. Hvordan et valg filtreres, forklares i [Indlæsning af filer](loading-files.md#which-files-are-kept).

Tomme filer springes over. I et valg, der indeholder `movement*.<ext>`-filer, indlæses kun dem ([Indlæsning af filer](loading-files.md#which-files-are-kept)).

Data er **én række pr. sample**: en position på et øjeblik, evt. med hvem, hvilken gruppe, hvilken session, hvor de kiggede hen, og eventuelle yderligere kolonner. Hændelsesrækker (en dræbt, en plantning, et skud) kan stå i samme tabel som positionsrækker, adskilt af en hændelseskolonne.

## Afgrænset tekst (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

En mindste nyttig fil, tre rækker:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolonnerne kortlægges selv ([Kolonnekortlægning](column-mapping.md)).

Læses af en scanner på byte-niveau, der kun afkoder de kortlagte kolonner ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Forhold | Regel |
|---|---|
| Overskrift | Den første ikke-tomme linje holder kolonnenavnene. Et tomt navn bliver til `column_N`. |
| Skilletegn | Findes ud fra de første 20 ikke-tomme linjer i de første 1 MiB, blandt komma, semikolon, tabulator og lodret streg, ud fra **konsistens**: det skilletegn, der giver det samme antal felter på hver stikprøvelinje, vinder, derefter det, der giver flest felter. Mellemrum findes aldrig automatisk, men kan vælges; ethvert enkelt tegn kan skrives ind ([Kolonnekortlægning](column-mapping.md#the-fields)). |
| Citering | RFC 4180: felter må stå i dobbelte anførselstegn, og `""` inde i anførselstegn er et bogstaveligt anførselstegn. |
| Mellemrum | Foranstillede og efterstillede mellemrum, tabulatorer og anførselstegn fjernes fra hvert felt. |
| Felter pr. række | Højst 4.096; flere er en fejl (*er skilletegnet rigtigt?*). |
| Tal | Valgfrit fortegn, cifre, valgfrit `.` og decimaler, valgfri eksponent (`1.5e-3`). Et dansk decimalkomma (`1,5`), tusindtalsseparatorer eller efterstillede enheder (`12 m`) læses ikke og tæller som manglende. Bruger din fil decimalkommaer, så erstat dem med punktummer, før du indlæser den (søg og erstat i en teksteditor virker). |
| Talkolonne | En kolonne tilbydes som numerisk, når mere end 90 % af de ikke-tomme værdier i de første 50 rækker kan læses som tal. |
| Antal rækker | Estimeret før indlæsning ud fra gennemsnitslinjelængden i de første 1 MiB. |
| Tekstkodning | UTF-8. |

## Parquet {#parquet}

Læses med [hyparquet](https://github.com/hyparam/hyparquet), kolonnestykke for kolonnestykke ind i typede arrays, og kun de kortlagte kolonner hentes ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Forhold | Regel |
|---|---|
| Antal rækker | Præcist, fra footeren, før indlæsning. |
| Forhåndsvisning | De første 50 rækker, afkodet som objekter; deres værdier afgør, hvilke kolonner der ser numeriske ud. |
| Heltal | `INT32`, og `INT64` (afkodet som BigInt) bliver til tal. |
| Decimaltal | `FLOAT`, `DOUBLE`. |
| Booleske værdier | 1 og 0. |
| Strenge | Bruges til person-, gruppe-, session- og kategorikolonner; en streng, der ligner et tal, accepteres for talroller. |
| Logiske typerne `TIMESTAMP`, `DATE` | Afkodes til tidspunkter (millisekunder siden 1970); bruges som tidsakse, og enhedsindstillingen ignoreres. |
| Indlejrede kolonner | Struct- og list-kolonner er ikke beregnet til nogen rolle (de vises som JSON-tekst); ikke testet. |
| Footer-metadata | Nøglen `heat3d` læses som kortlægningshints (nedenfor). |

En position-, tids- eller kigge-kolonne, der holder noget andet end et tal, afkodes som manglende.

## Kolonneroller og typer {#column-roles-and-types}

| Rolle | Type i filen | Påkrævet | Gemt som | Grænser |
|---|---|---|---|---|
| X, Y, Z | tal | to ud af tre | 32-bit flydende komma, efter [aksekortlægningen](axes-units-and-time.md) | En række uden en brugbar position droppes. |
| Tid | tal i en af [tidsenhederne](axes-units-and-time.md#time-units), Parquet-tidsstempel, eller ISO-8601-tekst | nej | 32-bit flydende komma i sekunder fra den tidligste række | Sortering afvises over 400.000.000 rækker ([hvorfor](memory-and-budgets.md#the-sort-ceiling)). |
| Person | vilkårlig; ordbogskodet | nej | 32-bit id | |
| Session | vilkårlig; ordbogskodet | nej | 32-bit id | Etiketter listes op til 100.000 sessioner. |
| Gruppe | vilkårlig; ordbogskodet | nej | 16-bit id | Op til 4.096 grupper, ellers droppes grupperingen. |
| Retning (yaw), hældning (pitch) | tal, grader eller radianer | nej | 32-bit flydende komma i radianer | |
| Retningsvektor X, Y, Z | tal | nej (alle tre sammen) | omregnes til yaw og pitch | |
| Filterkolonne, *interval* | tal | nej | 32-bit flydende komma | Op til 4 filtre aktive ad gangen. |
| Filterkolonne, *kategori* | vilkårlig; ordbogskodet | nej | 32-bit id | Op til 4.096 værdier, ellers beholdes kolonnen ikke. |

En Parquet-`TIMESTAMP`-kolonne, der beholdes som filterkolonne, er et *interval* af epoch-millisekunder – en skyder, ikke en liste.

## Resultatkolonner {#outcome-columns}

Hvem der vandt, på hver række, så et sted, en rute eller et træk kan bedømmes efter, hvor ofte dets side endte med at vinde ([Sejrsandel](win-rate.md)). Viewer'en beholder selv disse kolonner, viser dem først i [filtrene](filters.md) på viewerens sprog og læser dem i [sejrsandelskortet](win-rate.md), [opdelingen](breakdown.md) og [volumenstatistikken](volumes.md#statistics). En konverter til et rundebaseret spil (CS2, Valorant, Rainbow Six Siege) eller et kampbaseret (War Thunder) skriver alle fire:

| Kolonne | Type | Betydning |
|---|---|---|
| `won` | 0/1 (tom, hvor det er ukendt) | rækkens side (hold) vandt **runden**; i et spil uden runder kampen |
| `matchWon` | 0/1 (tom, hvor det er ukendt) | rækkens side (hold) vandt **kampen**; tom, hvor optagelsen ikke viser slutningen |
| `round` | helt tal, fra 1 | den runde, rækken hører til; 1 gennem hele et kampbaseret spil |
| `roundEndReason` | tekst | hvordan runden sluttede (i et kampbaseret spil kampen), med ordene nedenfor |

`won` og `matchWon` hører til rækkens side: en T-spillers rækker bærer T-sidens resultat, en AI-enheds rækker dens holds; rækker, der ikke hører til nogen side, lader dem stå tomme. En side, der bytter ved halvleg, beholder sin egen `matchWon` og tager hver rundes `won`, som den spillede den. Uafgjort er 0 for begge sider.

Slutårsagerne er fælles for alle spil, så ét filter virker på dem alle (et spils eget ord kobles til dem, hvor det kan, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Betydning | Spil |
|---|---|---|
| `elimination` | alle spillere på én side er ude | CS2, Valorant, Rainbow Six Siege |
| `bomb` | bomben (spike, defuserens mål) sprang | CS2, Valorant, Rainbow Six Siege |
| `defuse` | bomben (spike) blev desarmeret | CS2, Valorant, Rainbow Six Siege |
| `time` | rundens ur løb ud; War Thunder: afgjort med billetter tilbage på begge sider | alle |
| `surrender` | en side opgav | CS2, Valorant, Rainbow Six Siege |
| `draw` | ingen vinder | CS2 |
| `objective` | et mål taget eller holdt (gidsel hentet ud, område sikret) | Rainbow Six Siege |
| `capture` | løb tør for billetter, mens vinderen holdt erobringszoner | War Thunder |
| `tickets` | billetter tabt til drab | War Thunder |
| `destruction` | de sidste køretøjer tabt på én gang, ingen tilbage til at spawne | War Thunder |
| `other` | alt andet | |

Nævn dem også i `heat3d`-hintenes `extra`-liste, som enhver anden kolonne. Kolonnenavnene `win`, `round_won`, `match_won`, `end_reason` og `win_reason` læses som de samme kolonner.

## `heat3d`-hints {#the-heat3d-hints}

En Parquet-fil kan bære sine egne læseinstruktioner i footerens nøgle/værdi-metadata, under nøglen **`heat3d`**, som et JSON-objekt ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Viewer'en anvender dem frem for sine egne gæt, når filen er den første i et valg; hver post er valgfri, og hvert resultat vises stadig og kan redigeres i panelet [Kolonnekortlægning](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Alt, der ikke kan læses som et JSON-objekt, ignoreres.

### Skema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          kolonnenavne for positionen
    "time": string,                                  tidskolonnen
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filterkolonner, der beholdes, mest nyttige først
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  skal være > 0
  },
  "entity": {
    "size": number                                   størrelsen af én sporet ting i filens enheder, > 0
  }
}
```

| Post | Anvendes når | Virkning |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | den navngivne kolonne findes i filen | Sætter den rolle. |
| `columns.timeUnit` | det er en af de syv enheder | Sætter tidsenheden. |
| `columns.angleUnit` | `"degrees"` eller `"radians"` | Sætter vinkelenheden. |
| `columns.lookMode` | `"vector"` med dirX, dirY og dirZ alle sat; `"yawPitch"` med yaw sat; `"none"` | Sætter kigge-tilstanden. |
| `columns.extra` | det er et array | Erstatter den automatiske filterliste og beholder kun eksisterende kolonner, der ikke bruges af en rolle; hver enkelt er *interval*, når den så numerisk ud i forhåndsvisningen, ellers *kategori*. Uden den beholdes den automatiske liste, minus de kolonner et hint har tildelt en rolle. |
| `axes.up` | `"y"` eller `"z"` | Op-aksen. |
| `axes.flipX/Y/Z` | en boolsk værdi | Vendinger. |
| `axes.scale` | et tal > 0 | Enhedsskala. |
| `entity.size` | et tal > 0 | [Enhedens størrelse](sessions-persons-groups.md#entity-size) (ganget med enhedsskalaen ved indlæsning). Den eneste måde at sætte den på. |

### Eksempel {#example}

Et opdigtet eksport fra et skydespil: Z-op, centimeter, en venstrehåndet verden, spillere ca. 72 cm brede.

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

### Skrivning af den {#writing-it}

Med pyarrow skrives tilpasset skemametadata til filens nøgle/værdi-metadata:

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

`npm run inspect -- file.parquet` udskriver en fils skema, hvilket er en hurtig måde at kontrollere de kolonnenavne, hints'ene henviser til.

## Hvad fanen Heatmap skriver {#what-the-heatmap-tab-writes}

Intet skrives tilbage til dataene. Resultaterne er:

- videoer, som WebM (VP9 eller VP8) – [Kameraforløb og video](camera-path-and-video.md);
- en kamerapositur, kopieret til udklipsholderen som tekst – [Kamera](camera.md#pose);
- niveauer gemt i browserens [niveaubibliotek](level-library.md).
