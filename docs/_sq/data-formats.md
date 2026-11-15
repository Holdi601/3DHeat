---
title: "Referenca e formateve të të dhënave"
nav_order: 19
lang: "sq"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referenca e formateve të të dhënave

Kjo faqe liston çdo lloj skedari që 3DHeat mund ta hapë, dhe si duhet të duket një tabelë brenda tij. Një tabelë është rreshta dhe kolona, si një fletëllogaritëse: çdo rresht thotë ku ishte diçka dhe, nëse e ke, kur dhe kush.

Çfarë lexon skeda Heatmap, kolonë pas kolone, dhe sugjerimet që mund të mbartë një skedar Parquet. (Skeda Analiza e garës lexon skedarë xhirosh, dhe skeda e Ndeshjes përmbledhje ndeshjesh; shih [Analiza e garës](race-analysis.md) dhe [Analiza e ndeshjes](match-analysis.md).)

## Skedarët {#files}

Kjo është e vetmja listë e plotë e skedarëve që mund të ngarkohen. Paneli **Burimi** (**Skedarë…**, **Dosje…**, ose tërhiq dhe lësho) pranon saktësisht këto:

| Shtesa | Çfarë është | Lexohet nga |
|---|---|---|
| `.parquet`, `.pq` | tabelë Parquet | lexuesi i Parquet (më poshtë) |
| `.csv`, `.tsv`, `.txt` | tekst i ndarë | lexuesi i tekstit (më poshtë) |
| `.3dheat` | një ndeshje në një skedar (një ZIP që mban tabelën dhe shtesat e saj) | ngarkohet si tabela që mban - [Një skedar për ndeshje](container.md) |
| `.acmi` (edhe `.txt.acmi`, `.zip.acmi`) | regjistrim fluturimi Tacview | lexuesi i vet - [Regjistrimet Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | regjistrim OCAP (si Arma) | lexuesi i vet |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | gjurmë GPS: GPX, KML/KMZ, regjistra NMEA, regjistra planorizmi IGC, skedarë sporti FIT | lexuesi i vet; pozicionet vijnë nga gjerësia dhe gjatësia |

Nuk ngarkohen si pozicione: skedarët e vegjël JSON që qëndrojnë pranë një tabele për ta përshkruar (emrat që mbarojnë me `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), dhe tabelat shtesë të një konvertuesi (`<match>.events.parquet` e të ngjashme, shih [Konvertuesit](converters.md)), përveç nëse i zgjedh vetë. Çdo gjë tjetër kapërcehet me një arsye. Si filtrohet një zgjedhje shpjegohet te [Ngarkimi i skedarëve](loading-files.md#which-files-are-kept).

Skedarët bosh kapërcehen. Në një zgjedhje që përmban skedarë `movement*.<ext>`, ngarkohen vetëm ata ([Ngarkimi i skedarëve](loading-files.md#which-files-are-kept)).

Të dhënat janë **një rresht për mostër**: një pozicion në një moment, opsionalisht me kush, cili grup, cili sesion, ku po shikonte, dhe çdo kolonë tjetër. Rreshtat e ngjarjeve (një vrasje, një vendosje, një të shtënë) mund të jenë në të njëjtën tabelë me rreshtat e pozicioneve, të dalluar me një kolonë ngjarjeje.

## Tekst i ndarë (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Një skedar më i vogël i dobishëm, tre rreshta:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolonat lidhen vetvetiu ([Hartëzimi i kolonave](column-mapping.md)).

Analizohet nga një skaner në nivel bajti që dekodon vetëm kolonat e hartëzuara ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekti | Rregulli |
|---|---|
| Koka | Rreshti i parë jo bosh mban emrat e kolonave. Një emër bosh bëhet `column_N`. |
| Ndarësi | Zbulohet nga 20 rreshtat e parë jo boshë të 1 MiB të parë, midis presjes, pikëpresjes, tab-it dhe pipe-it, sipas **qëndrueshmërisë**: ndarësi që jep të njëjtin numër fushash në çdo rresht të marrë në shembull fiton, pastaj ai që jep më shumë fusha. Hapësira nuk zbulohet kurrë, por mund të zgjidhet; çdo karakter i vetëm mund të shkruhet ([Hartëzimi i kolonave](column-mapping.md#the-fields)). |
| Thonjëzat | RFC 4180: fushat mund të mbështillen në thonjëza të dyfishta; `""` brenda thonjëzave është një thonjëz e thjeshtë. |
| Hapësirat | Hapësirat, tab-et dhe thonjëzat në fillim dhe në fund të çdo fushe hiqen. |
| Fusha për rresht | Më së shumti 4,096; më shumë është gabim (*a është i saktë ndarësi?*). |
| Numrat | Shenjë opsionale, shifra, `.` dhe dhjetore opsionale, eksponent opsional (`1.5e-3`). Presja dhjetore (`1,5`), ndarësit e mijësheve ose njësitë në fund (`12 m`) nuk lexohen dhe numërohen si të munguara. Nëse skedari yt përdor presje dhjetore, zëvendësoji me pika përpara ngarkimit (gjetja dhe zëvendësimi në një redaktues teksti funksionon). |
| Kolona numerike | Një kolonë ofrohet si numerike kur më shumë se 90% e vlerave jo boshe në 50 rreshtat e parë lexohen si numra. |
| Numri i rreshtave | Vlerësohet para ngarkimit nga gjatësia mesatare e rreshtit të 1 MiB të parë. |
| Kodimi i tekstit | UTF-8. |

## Parquet {#parquet}

Lexohet me [hyparquet](https://github.com/hyparam/hyparquet), pjesë kolone pas pjese kolone, në vargje të tipizuara, duke kërkuar vetëm kolonat e hartëzuara ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekti | Rregulli |
|---|---|
| Numri i rreshtave | Saktë, nga footer-i, para ngarkimit. |
| Pamja paraprake | 50 rreshtat e parë, të dekoduar si objekte; vlerat e tyre vendosin cilat kolona duken numerike. |
| Numrat e plotë | `INT32`, dhe `INT64` (i dekoduar si BigInt) bëhen numra. |
| Numrat me presje | `FLOAT`, `DOUBLE`. |
| Vlerat logjike | 1 dhe 0. |
| Vargjet | Përdoren për kolonat e personit, grupit, sesionit dhe kategorisë; një varg që duket numër pranohet për rolet numerike. |
| Logjikat `TIMESTAMP`, `DATE` | Dekodohen në çaste (milisekonda që nga 1970); përdoren si bosht kohe, dhe cilësimi i njësisë injorohet. |
| Kolona të fole | Kolonat struct dhe list nuk janë për asnjë rol (duken si tekst JSON në pamjen paraprake); të pa testuara. |
| Metadata e footer-it | Çelësi `heat3d` lexohet si sugjerime hartëzimi (më poshtë). |

Një kolonë pozicioni, kohe ose shikimi që mban diçka tjetër nga një numër dekodohet si e munguar.

## Rolet dhe tipet e kolonave {#column-roles-and-types}

| Roli | Tipi në skedar | Kërkohet | Ruhet si | Kufijtë |
|---|---|---|---|---|
| X, Y, Z | numër | dy nga tre | 32-bit float, pas [hartëzimit të boshteve](axes-units-and-time.md) | Një rresht pa pozicion të përdorshëm hidhet. |
| Koha | numër në një nga [njësitë e kohës](axes-units-and-time.md#time-units), kohë Parquet, ose tekst ISO-8601 | jo | 32-bit float sekonda nga rreshti më i hershëm | Renditja refuzohet mbi 400,000,000 rreshta ([pse](memory-and-budgets.md#the-sort-ceiling)). |
| Personi | çfarëdo; i koduar me fjalor | jo | id 32-bit | |
| Sesioni | çfarëdo; i koduar me fjalor | jo | id 32-bit | Etiketat listohen deri 100,000 sesione. |
| Grupi | çfarëdo; i koduar me fjalor | jo | id 16-bit | Deri 4,096 grupe, përndryshe grupimi hidhet. |
| Yaw, pitch | numër, gradë ose radianë | jo | 32-bit float radianë | |
| Drejtimi X, Y, Z | numër | jo (të tre bashkë) | konvertohet në yaw dhe pitch | |
| Kolona filtri, *interval* | numër | jo | 32-bit float | Deri 4 filtra aktivë njëherësh. |
| Kolona filtri, *kategori* | çfarëdo; i koduar me fjalor | jo | id 32-bit | Deri 4,096 vlera, përndryshe kolona nuk mbahet. |

Një kolonë Parquet `TIMESTAMP` e mbajtur si kolonë filtri është një *interval* i milisekondave epoke - një rrëshqitës, jo një listë.

## Sugjerimet `heat3d` {#the-heat3d-hints}

Një skedar Parquet mund të mbajë udhëzimet e veta të leximit në metadatën çelës/vlerë të footer-it, nën çelësin **`heat3d`**, si objekt JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Shfaqësi i aplikon ato mbi supozimet e veta kur skedari është i pari i një zgjedhjeje; çdo hyrje është opsionale, dhe çdo rezultat shfaqet dhe mund të ndryshohet te paneli [Hartëzimi i kolonave](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Çdo gjë që nuk lexohet si objekt JSON injorohet.

### Skema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          column names for the position
    "time": string,                                  the time column
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filter columns to keep, most useful first
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  must be > 0
  },
  "entity": {
    "size": number                                   size of one tracked thing in file units, > 0
  }
}
```

| Hyrja | Aplikohet kur | Efekti |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | kolona e emërtuar ekziston në skedar | Cakton atë rol. |
| `columns.timeUnit` | është një nga shtatë njësitë | Cakton njësinë e kohës. |
| `columns.angleUnit` | `"degrees"` ose `"radians"` | Cakton njësinë e këndit. |
| `columns.lookMode` | `"vector"` me dirX, dirY dhe dirZ të gjitha të vendosura; `"yawPitch"` me yaw të vendosur; `"none"` | Cakton mënyrën e shikimit. |
| `columns.extra` | është një varg | Zëvendëson listën automatike të filtrave, duke mbajtur vetëm kolonat ekzistuese që nuk përdoren nga një rol; secila është *interval* kur dukej numerike në pamjen paraprake, përndryshe *kategori*. Pa të, mbahet lista automatike pa asnjë kolonë që një sugjerim ia ka caktuar një roli. |
| `axes.up` | `"y"` ose `"z"` | Boshti lart. |
| `axes.flipX/Y/Z` | një boolean | Kthesa. |
| `axes.scale` | një numër > 0 | Shkalla e njësisë. |
| `entity.size` | një numër > 0 | [Madhësia e entitetit](sessions-persons-groups.md#entity-size) (shumëzohet me shkallën e njësisë kur ngarkohet). Mënyra e vetme për ta vendosur. |

### Shembull {#example}

Një eksport i trilluar i një loje të shtënash: Z lart, centimetra, një botë e majtë, lojtarët rreth 72 cm të gjerë.

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

### Shkrimi i saj {#writing-it}

Me pyarrow, metadata e personalizuar e skemës shkruhet te metadata çelës/vlerë e skedarit:

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

`npm run inspect -- file.parquet` shfaq skemën e një skedari, që është një mënyrë e shpejtë për të kontrolluar emrat e kolonave që i referohen sugjerimet.

## Çfarë shkruan skeda Heatmap {#what-the-heatmap-tab-writes}

Asgjë nuk shkruhet përsëri te të dhënat. Daljet janë:

- video, si WebM (VP9 ose VP8) - [Rruga e kamerës dhe videoja](camera-path-and-video.md);
- një pozicion kamere, i kopjuar në clipboard si tekst - [Kamera](camera.md#pose);
- nivele të ruajtura në [bibliotekën e niveleve](level-library.md) të shfletuesit.
