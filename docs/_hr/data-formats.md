---
title: "Referenca formata podataka"
nav_order: 19
lang: "hr"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referenca formata podataka

Ova stranica navodi svaku vrstu datoteke koju 3DHeat može otvoriti i kakva tablica unutar nje mora biti. Tablica su redci i stupci, kao u proračunskoj tablici: svaki redak kaže gdje je nešto bilo i, ako to imate, kada i tko.

Što kartica **Toplinska karta** čita, stupac po stupac, i koje nagovještaje datoteka Parquet može nositi. (Kartica **Analiza utrke** čita datoteke krugova, a kartica **Meč** sažetke mečeva; vidi [Analiza utrke](race-analysis.md) i [Analiza meča](match-analysis.md).)

## Datoteke {#files}

Ovo je jedini potpuni popis datoteka koje se mogu učitati. Panel **Izvor** (**Datoteke…**, **Mapa…** ili povlačenje i ispuštanje) prihvaća upravo ove:

| Ekstenzija | Što je | Čita ga |
|---|---|---|
| `.parquet`, `.pq` | Parquet tablica | čitač Parquet (dolje) |
| `.csv`, `.tsv`, `.txt` | tekst s razdjelnikom | čitač teksta (dolje) |
| `.3dheat` | jedna utakmica u jednoj datoteci (ZIP koji drži tablicu i njezine dodatke) | učitava se kao tablica koju drži - [Jedna datoteka za utakmicu](container.md) |
| `.acmi` (također `.txt.acmi`, `.zip.acmi`) | snimka leta Tacview | vlastiti čitač - [Tacview snimke](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP snimka (u stilu Arme) | vlastiti čitač |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS tragovi: GPX, KML/KMZ, NMEA zapisnici, IGC zapisnici jedriličarenja, FIT sportske datoteke | vlastiti čitač; položaji dolaze iz zemljopisne širine i dužine |

Ne učitavaju se kao položaji: male JSON datoteke koje stoje uz tablicu i opisuju je (imena koja završavaju na `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`) te dodatne tablice pretvarača (`<utakmica>.events.parquet` i slične, vidi [Pretvarači](converters.md)), osim ako ih sami ne odaberete. Sve ostalo se preskače uz razlog. Kako se odabir filtrira, objašnjeno je u [Učitavanje datoteka](loading-files.md#which-files-are-kept).

Prazne datoteke se preskaču. U odabiru koji sadrži datoteke `movement*.<ext>` učitavaju se samo one ([Učitavanje datoteka](loading-files.md#which-files-are-kept)).

Podaci su **jedan redak po uzorku**: položaj u nekom trenutku, po želji uz to tko, koja grupa, koja sesija, kamo je gledao, i svi dodatni stupci. Retci događaja (ubojstvo, postavljanje eksploziva, pucanj) mogu biti u istoj tablici kao i reci položaja, a razlikuju se po stupcu događaja.

## Tekst s razdjelnikom (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Najmanja korisna datoteka, tri retka:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Stupci se sami preslikavaju ([Preslikavanje stupaca](column-mapping.md)).

Čita je skener na razini bajtova koji dekodira samo preslikane stupce ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekt | Pravilo |
|---|---|
| Zaglavlje | Prvi neprazni redak sadrži nazive stupaca. Prazan naziv postaje `column_N`. |
| Razdjelnik | Otkriva se iz prvih 20 nepraznih redaka prvog 1 MiB, među zarezom, točkom-zarezom, tabom i uspravnom crtom, po **dosljednosti**: razdjelnik koji daje isti broj polja u svakom uzorkovanom retku pobjeđuje, zatim onaj koji daje više polja. Razmak se nikad ne otkriva, ali se može odabrati; bilo koji pojedinačni znak može se upisati ([Preslikavanje stupaca](column-mapping.md#the-fields)). |
| Navodnici | RFC 4180: polja mogu biti omotana dvostrukim navodnicima, a `""` unutar navodnika je doslovni navodnik. |
| Razmaci | Početni i završni razmaci, tabovi i navodnici skidaju se s svakog polja. |
| Polja po retku | Najviše 4 096; više je greška (*je li razdjelnik ispravan?*). |
| Brojevi | Opcionalni predznak, znamenke, opcionalna `.` i decimale, opcionalni eksponent (`1.5e-3`). Decimalni zarez (`1,5`), razdjelnici tisućica ili jedinice iza broja (`12 m`) ne čitaju se i broje se kao nedostajuće. Ako vaša datoteka koristi decimalne zareze, zamijenite ih točkama prije učitavanja (pronađi i zamijeni u uređivaču teksta radi). |
| Brojčani stupac | Stupac se nudi kao brojčani kad više od 90% nepraznih vrijednosti u prvih 50 redaka prolazi kao brojevi. |
| Broj redaka | Procjenjuje se prije učitavanja iz prosječne duljine retka prvog 1 MiB. |
| Kodiranje teksta | UTF-8. |

## Parquet {#parquet}

Čita se s [hyparquet](https://github.com/hyparam/hyparquet), dio po dio stupaca u tipizirana polja, tražeći samo preslikane stupce ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekt | Pravilo |
|---|---|
| Broj redaka | Točan, iz podnožja, prije učitavanja. |
| Pregled | Prvih 50 redaka, dekodiranih kao objekti; njihove vrijednosti odlučuju koji stupci izgledaju brojčano. |
| Cijeli brojevi | `INT32` i `INT64` (dekodirani kao BigInt) postaju brojevi. |
| Decimalni | `FLOAT`, `DOUBLE`. |
| Logičke vrijednosti | 1 i 0. |
| Tekst | Koristi se za stupce osobe, grupe, sesije i kategorije; tekst koji izgleda kao broj prihvaća se za brojčane uloge. |
| Logički tipovi `TIMESTAMP`, `DATE` | Dekodiraju se u trenutke (milisekunde od 1970.); kad se koriste kao vremenska os, postavka jedinice se zanemaruje. |
| Ugniježđeni stupci | Struct i list stupci nisu namijenjeni nijednoj ulozi (pregledavaju se kao JSON tekst); neispitano. |
| Metapodaci podnožja | Ključ `heat3d` čita se kao nagovještaji preslikavanja (dolje). |

Stupac položaja, vremena ili pogleda koji sadrži nešto drugo osim broja dekodira se kao nedostajući.

## Uloge stupaca i tipovi {#column-roles-and-types}

| Uloga | Tip u datoteci | Obavezno | Pohranjeno kao | Ograničenja |
|---|---|---|---|---|
| X, Y, Z | broj | dva od tri | 32-bitni decimalni, nakon [preslikavanja osi](axes-units-and-time.md) | Redak bez upotrebljivog položaja se odbacuje. |
| Vrijeme | broj u jednoj od [jedinica vremena](axes-units-and-time.md#time-units), Parquet timestamp ili ISO-8601 tekst | ne | 32-bitne decimalne sekunde od najranijeg retka | Sortiranje se odbija iznad 400 000 000 redaka ([zašto](memory-and-budgets.md#the-sort-ceiling)). |
| Osoba | bilo koji; rječnički kodiran | ne | 32-bitni id | |
| Sesija | bilo koji; rječnički kodiran | ne | 32-bitni id | Oznake se navode do 100 000 sesija. |
| Grupa | bilo koji; rječnički kodiran | ne | 16-bitni id | Do 4 096 grupa, inače se grupiranje odbacuje. |
| Yaw, pitch | broj, stupnjevi ili radijani | ne | 32-bitni decimalni u radijanima | |
| Smjer X, Y, Z | broj | ne (sva tri zajedno) | pretvara se u yaw i pitch | |
| Stupac filtra, *raspon* | broj | ne | 32-bitni decimalni | Do 4 filtra aktivna istovremeno. |
| Stupac filtra, *kategorija* | bilo koji; rječnički kodiran | ne | 32-bitni id | Do 4 096 vrijednosti, inače se stupac ne čuva. |

Stupac `TIMESTAMP` u Parquetu koji se koristi kao stupac filtra je *raspon* epoch milisekundi - klizač, a ne popis.

## Nagovještaji `heat3d` {#the-heat3d-hints}

Datoteka Parquet može nositi vlastite upute za čitanje u metapodacima ključ/vrijednost podnožja, pod ključem **`heat3d`**, kao JSON objekt ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Preglednik ih primjenjuje preko vlastitih pretpostavki kad je datoteka prva u odabiru; svaka stavka je neobavezna, a svaki rezultat i dalje se prikazuje i može se uređivati na panelu [Preslikavanje stupaca](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Sve što se ne može pročitati kao JSON objekt se ignorira.

### Shema {#schema}

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

| Stavka | Primjenjuje se kad | Učinak |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | navedeni stupac postoji u datoteci | Postavlja tu ulogu. |
| `columns.timeUnit` | to je jedna od sedam jedinica | Postavlja jedinicu vremena. |
| `columns.angleUnit` | `"degrees"` ili `"radians"` | Postavlja jedinicu kuta. |
| `columns.lookMode` | `"vector"` kad su dirX, dirY i dirZ svi postavljeni; `"yawPitch"` kad je yaw postavljen; `"none"` | Postavlja način pogleda. |
| `columns.extra` | to je niz | Zamjenjuje automatski popis filtara, zadržavajući samo postojeće stupce koji nisu korišteni ni za jednu ulogu; svaki je *raspon* kad je u pregledu izgledao brojčano, inače *kategorija*. Bez njega se automatski popis zadržava, umanjen za svaki stupac koji je nagovještaj dodijelio ulozi. |
| `axes.up` | `"y"` ili `"z"` | Os prema gore. |
| `axes.flipX/Y/Z` | logička vrijednost | Zrcaljenja. |
| `axes.scale` | broj > 0 | Mjerilo jedinice. |
| `entity.size` | broj > 0 | [Veličina entiteta](sessions-persons-groups.md#entity-size) (pomnoženo mjerilom jedinice pri učitavanju). Jedini način da se postavi. |

### Primjer {#example}

Izmišljeni izvoz pucačine: Z prema gore, centimetri, lijevoruki svijet, igrači široki oko 72 cm.

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

### Pisanje {#writing-it}

Uz pyarrow, prilagođeni metapodaci sheme upisuju se u metapodatke ključ/vrijednost datoteke:

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

`npm run inspect -- file.parquet` ispisuje shemu datoteke, što je brz način da provjerite nazive stupaca na koje nagovještaji upućuju.

## Što kartica Toplinska karta piše {#what-the-heatmap-tab-writes}

Ništa se ne upisuje natrag u podatke. Izlazi su:

- videozapisi, kao WebM (VP9 ili VP8) - [Putanja kamere i video](camera-path-and-video.md);
- položaj kamere, kopiran u međuspremnik kao tekst - [Kamera](camera.md#pose);
- razine spremljene u [biblioteku razina](level-library.md) preglednika.
