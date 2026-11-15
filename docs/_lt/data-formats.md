---
title: "Duomenų formatų nuoroda"
nav_order: 19
lang: "lt"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Duomenų formatų nuoroda

Šiame puslapyje išvardyta kiekviena rūšis failų, kuriuos 3DHeat gali atidaryti, ir kaip turi atrodyti lentelė jų viduje. Lentelė yra eilutės ir stulpeliai, kaip skaičiuoklėje: kiekviena eilutė nurodo, kur kas buvo, o jei turite – kada ir kas.

Ką **Heatmap** skirtukas nuskaito stulpelis po stulpelio ir kokias užuominas gali turėti Parquet failas. (**Race analysis** skirtukas nuskaito ratų failus, o **Match** skirtukas – rungtynių santraukas; žr. [Lenktynių analizė](race-analysis.md) ir [Rungtynių analizė](match-analysis.md).)

## Failai {#files}

Tai vienintelis išsamus įkeliamų failų sąrašas. **Šaltinio** skydelis (**Failai…**, **Aplankas…** arba vilkimas ir numetimas) priima tiksliai šiuos:

| Plėtinys | Ką tai reiškia | Nuskaito |
|---|---|---|
| `.parquet`, `.pq` | Parquet lentelė | Parquet skaitytuvas (žemiau) |
| `.csv`, `.tsv`, `.txt` | Tekstas su skyrikliais | teksto skaitytuvas (žemiau) |
| `.3dheat` | Vienos rungtynės vienas failas (ZIP, kuriame yra lentelė ir jos priedai) | įkeliamas kaip lentelė, kurią jis turi – [Vienas failas, viena rungtynės](container.md) |
| `.acmi` (taip pat `.txt.acmi`, `.zip.acmi`) | Tacview skrydžio įrašas | savas skaitytuvas – [Tacview įrašai](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP įrašas (panašus į Arma) | savas skaitytuvas |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS trasos: GPX, KML/KMZ, NMEA žurnalai, IGC planerių žurnalai, FIT sporto failai | savas skaitytuvas; padėtys imamos iš platumos ir ilgumos |

Kaip padėtys neįkeliami: maži JSON failai, esantys šalia lentelės ir ją aprašantys (pavadinimai baigiasi `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), ir konverterio papildomos lentelės (`<match>.events.parquet` ir panašios, žr. [Konverteriai](converters.md)), nebent pasirinksite jas atskirai. Viskas kita praleidžiama su priežastimi. Kaip pasirinkimas filtruojamas, paaiškinta [Failų įkėlimas](loading-files.md#which-files-are-kept).

Tušti failai praleidžiami. Pasirinkime, kuriame yra `movement*.<ext>` failų, įkeliami tik jie ([Failų įkėlimas](loading-files.md#which-files-are-kept)).

Duomenys yra **viena eilutė vienam matavimui**: padėtis tam tikru momentu, neprivaloma – kas, kuri grupė, kuri sesija, kur žiūrėta, ir visi kiti stulpeliai. Įvykių eilutės (nužudymas, bombos padėjimas, šūvis) gali būti toje pačioje lentelėje kaip padėčių eilutės; skiriasi jos pagal įvykio stulpelį.

## Skiriklių tekstas (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Mažiausias naudingas failas, trijų eilučių:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Stulpeliai susiejasi patys ([Stulpelių susiejimas](column-mapping.md)).

Skaito baitų lygio skaitytuvas, kuris iššifruoja tik susietus stulpelius ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Savybė | Taisyklė |
|---|---|
| Antraštė | Pirmoji netuščia eilutė laiko stulpelių pavadinimus. Tuščias pavadinimas tampa `column_N`. |
| Skyriklis | Aptinkamas pagal pirmas 20 netuščių eilučių pirmo 1 MiB dalies, tarp kablelio, kabliataškio, tabuliavimo ir vertikaliosios brūkšnio linijos, pagal **nuoseklumą**: laimi skyriklis, kuris duoda tą patį laukų skaičių kiekvienoje patikrintoje eilutėje, o tada tas, kuris duoda daugiau laukų. Tarpo niekada neaptinka, bet jį galima pasirinkti; galima įvesti bet kurį vieną simbolį ([Stulpelių susiejimas](column-mapping.md#the-fields)). |
| Kabutės | RFC 4180: laukai gali būti įrėminti dvigubomis kabutėmis; `""` kabutėse yra tiesioginė kabutė. |
| Tarpai | Iš kiekvieno lauko pradžios ir pabaigos nukerpami tarpai, tabuliacijos ir kabutės. |
| Laukai vienoje eilutėje | Daugiausia 4 096; daugiau – klaida (*ar skyriklis teisingas?*). |
| Skaičiai | Neprivalomas ženklas, skaitmenys, neprivalomas `.` ir dešimtainės dalys, neprivalomas eksponentas (`1.5e-3`). Dešimtainis kablelis (`1,5`), tūkstančių skyrikliai ar mato vienetai gale (`12 m`) neiššifruojami ir laikomi trūkstamais. Jei jūsų faile yra dešimtainiai kableliai, prieš įkeliant pakeiskite juos taškais (tinka rasti ir pakeisti teksto redaktoriuje). |
| Skaitinis stulpelis | Stulpelis siūlomas kaip skaitinis, kai daugiau kaip 90 % netuščių pirmųjų 50 eilučių reikšmių yra skaičiai. |
| Eilučių skaičius | Įkeliant įvertinamas prieš tai, pagal vidutinį eilutės ilgį pirmame 1 MiB. |
| Teksto kodavimas | UTF-8. |

## Parquet {#parquet}

Skaitoma su [hyparquet](https://github.com/hyparam/hyparquet), stulpelių grupė po stulpelių grupės, į tipizuotus masyvus, prašant tik susietų stulpelių ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Savybė | Taisyklė |
|---|---|
| Eilučių skaičius | Tikslus, iš failo poraštės, prieš įkeliant. |
| Peržiūra | Pirmosios 50 eilučių, iššifruotos kaip objektai; jų reikšmės nusprendžia, kurie stulpeliai atrodo skaitiniai. |
| Sveikieji skaičiai | `INT32` ir `INT64` (iššifruojami kaip BigInt) tampa skaičiais. |
| Realieji skaičiai | `FLOAT`, `DOUBLE`. |
| Loginės reikšmės | 1 ir 0. |
| Eilutės | Naudojamos asmens, grupės, sesijos ir kategorijos stulpeliams; eilutę, panašią į skaičių, priima skaitiniams vaidmenims. |
| `TIMESTAMP`, `DATE` loginiai tipai | Iššifruojami į momentus (milisekundės nuo 1970 m.); naudojami kaip laiko ašis, vieneto nustatymas ignoruojamas. |
| Įdėtieji stulpeliai | Struktūros ir sąrašų stulpeliai nėra skirti jokiam vaidmeniui (peržiūroje rodomi kaip JSON tekstas); neišbandyta. |
| Poraštės metaduomenys | Raktas `heat3d` skaitomas kaip susiejimo užuominos (žemiau). |

Padėties, laiko ar žvilgsnio stulpelis, kuriame yra ne skaičius, iššifruojamas kaip trūkstamas.

## Stulpelių vaidmenys ir tipai {#column-roles-and-types}

| Vaidmuo | Tipas faile | Privaloma | Saugoma kaip | Ribos |
|---|---|---|---|---|
| X, Y, Z | skaičius | du iš trijų | 32 bitų realusis skaičius, po [ašių susiejimo](axes-units-and-time.md) | Eilutė be tinkamos padėties išmetama. |
| Laikas | skaičius viename iš [laiko vienetų](axes-units-and-time.md#time-units), Parquet laiko žymė arba ISO-8601 tekstas | ne | 32 bitų realusis skaičius sekundėmis nuo ankstyviausios eilutės | Rūšiuoti atsisakoma, kai eilučių daugiau nei 400 000 000 ([kodėl](memory-and-budgets.md#the-sort-ceiling)). |
| Asmuo | bet koks; žodyne užkoduotas | ne | 32 bitų id | |
| Sesija | bet koks; žodyne užkoduotas | ne | 32 bitų id | Etiketės rodomos iki 100 000 sesijų. |
| Grupė | bet koks; žodyne užkoduotas | ne | 16 bitų id | Iki 4 096 grupių, kitaip grupavimas atmetamas. |
| Yaw, pitch | skaičius, laipsniais arba radianais | ne | 32 bitų realusis skaičius radianais | |
| Kryptis X, Y, Z | skaičius | ne (visi trys kartu) | paverčiami į yaw ir pitch | |
| Filtro stulpelis, *intervalas* | skaičius | ne | 32 bitų realusis skaičius | Vienu metu aktyvūs iki 4 filtrų. |
| Filtro stulpelis, *kategorija* | bet koks; žodyne užkoduotas | ne | 32 bitų id | Iki 4 096 reikšmių, kitaip stulpelis nelaikomas. |

Parquet `TIMESTAMP` stulpelis, paliktas kaip filtro stulpelis, yra *intervalas* epochos milisekundėmis – slankiklis, o ne sąrašas.

## `heat3d` užuominos {#the-heat3d-hints}

Parquet failas gali turėti savo skaitymo nurodymus poraštės raktų ir reikšmių metaduomenyse, po raktu **`heat3d`**, kaip JSON objektą ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Peržiūros programa jas taiko virš savo spėjimų, kai failas yra pirmasis pasirinkime. Kiekvienas įrašas neprivalomas, o kiekvienas rezultatas vis dar rodomas ir gali būti keičiamas [Stulpelių susiejimo](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) skydelyje. Viskas, kas neiššifruojama kaip JSON objektas, ignoruojama.

### Schema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          stulpelių pavadinimai padėčiai
    "time": string,                                  laiko stulpelis
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           filtro stulpeliai, kuriuos išlaikyti, naudingiausi pirmiausia
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  turi būti > 0
  },
  "entity": {
    "size": number                                   vieno sekamo objekto dydis failo vienetais, > 0
  }
}
```

| Įrašas | Taikoma, kai | Poveikis |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | nurodytas stulpelis yra faile | Nustato tą vaidmenį. |
| `columns.timeUnit` | yra vienas iš septynių vienetų | Nustato laiko vienetą. |
| `columns.angleUnit` | `"degrees"` arba `"radians"` | Nustato kampo vienetą. |
| `columns.lookMode` | `"vector"`, kai nustatyti visi dirX, dirY ir dirZ; `"yawPitch"`, kai nustatytas yaw; `"none"` | Nustato žvilgsnio režimą. |
| `columns.extra` | yra masyvas | Pakeičia automatinį filtrų sąrašą, paliekant tik esamus stulpelius, nenaudojamus jokiam vaidmeniui; kiekvienas yra *intervalas*, jei peržiūroje atrodė skaitinis, kitaip *kategorija*. Be jo automatinis sąrašas paliekamas, atėmus stulpelius, kuriuos užuomina priskyrė vaidmeniui. |
| `axes.up` | `"y"` arba `"z"` | Vertikalioji ašis. |
| `axes.flipX/Y/Z` | loginė reikšmė | Apverčia ašį. |
| `axes.scale` | skaičius > 0 | Vieneto mastelis. |
| `entity.size` | skaičius > 0 | [Objekto dydis](sessions-persons-groups.md#entity-size) (įkeliant padauginamas iš vieneto mastelio). Vienintelis būdas jį nustatyti. |

### Pavyzdys {#example}

Išgalvotas šaudyklės eksportas: Z ašis viršuje, centimetrai, kairiarankė pasaulio sistema, žaidėjai maždaug 72 cm pločio.

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

### Rašymas {#writing-it}

Su pyarrow pasirinktiniai schemos metaduomenys įrašomi į failo raktų ir reikšmių metaduomenis:

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

`npm run inspect -- file.parquet` išspausdina failo schemą – greitas būdas patikrinti stulpelių pavadinimus, į kuriuos nurodo užuominos.

## Ką rašo Heatmap skirtukas {#what-the-heatmap-tab-writes}

Duomenys niekada neperrašomi. Išvestys yra:

- vaizdo įrašai WebM formatu (VP9 arba VP8) – [Kameros kelias ir vaizdo įrašas](camera-path-and-video.md);
- kameros padėtis, nukopijuota į iškarpinę kaip tekstas – [Kamera](camera.md#pose);
- lygiai, išsaugoti naršyklės [lygių bibliotekoje](level-library.md).
