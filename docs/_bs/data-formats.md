---
title: "Referenca formata podataka"
nav_order: 19
lang: "bs"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Referenca formata podataka

Ova stranica navodi svaku vrstu datoteke koju 3DHeat može otvoriti, i kako tabela unutar nje mora da izgleda. Tabela su redovi i kolone, kao u tabelarnoj datoteci: svaki red kaže gdje je nešto bilo i, ako to imate, kada i ko.

Šta kartica Toplotna mapa čita, kolona po kolonu, i nagovještaji koje Parquet datoteka može nositi. (Kartica Analiza utrke čita datoteke krugova, a kartica Meč sažetke mečeva; vidi [Analiza utrke](race-analysis.md) i [Analiza meča](match-analysis.md).)

## Datoteke {#files}

Ovo je jedini potpun spisak datoteka koje se mogu učitati. Panel **Izvor** (**Datoteke…**, **Mapa…**, ili prevlačenje i puštanje) prihvata tačno ove:

| Ekstenzija | Šta je | Čita je |
|---|---|---|
| `.parquet`, `.pq` | Parquet tabela | Parquet čitač (dolje) |
| `.csv`, `.tsv`, `.txt` | Tekst sa razdjelnicima | čitač teksta (dolje) |
| `.3dheat` | Jedan meč u jednoj datoteci (ZIP koji drži tabelu i njene dodatke) | učitava se kao tabela koju sadrži – [Jedna datoteka za meč](container.md) |
| `.acmi` (takođe `.txt.acmi`, `.zip.acmi`) | Tacview snimak leta | njegov vlastiti čitač – [Tacview snimci](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP snimak (kao Arma) | njegov vlastiti čitač |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS tragovi: GPX, KML/KMZ, NMEA zapisnici, IGC zapisnici jedrenja, FIT sportske datoteke | njegov vlastiti čitač; pozicije dolaze iz geografske širine i dužine |

Ne učitavaju se kao pozicije: male JSON datoteke koje stoje uz tabelu i opisuju je (nazivi koji se završavaju na `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), i dodatne tabele konvertora (`<meč>.events.parquet` i slično, vidi [Konvertori](converters.md)) osim ako ih sami izaberete. Sve drugo se preskače uz razlog. Kako se izbor filtrira objašnjeno je u [Učitavanje datoteka](loading-files.md#which-files-are-kept).

Prazne datoteke se preskaču. U izboru koji sadrži `movement*.<ekstenzija>` datoteke, učitavaju se samo te ([Učitavanje datoteka](loading-files.md#which-files-are-kept)).

Podaci su **jedan red po uzorku**: pozicija u jednom trenutku, opciono sa tim ko je, koja grupa, koja sesija, gdje je gledao, i sve dodatne kolone. Redovi događaja (ubistvo, postavljanje, pucanj) mogu stajati u istoj tabeli kao redovi pozicija, a razlikuju se po koloni događaja.

## Tekst sa razdjelnicima (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Najmanja korisna datoteka, tri reda:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Kolone se same preslikavaju ([Mapiranje kolona](column-mapping.md)).

Čita se skenerom na nivou bajta koji dekodira samo preslikane kolone ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Osobina | Pravilo |
|---|---|
| Zaglavlje | Prvi neprazan red sadrži nazive kolona. Prazan naziv postaje `column_N`. |
| Razdjelnik | Prepoznaje se iz prvih 20 nepraznih redova prvih 1 MiB, među zarezom, tačka-zarezom, tabulatorom i uspravnom crtom, po **doslijednosti**: razdjelnik koji daje isti broj polja u svakom uzorkovanom redu pobjeđuje, zatim onaj koji daje više polja. Razmak se nikad ne prepoznaje, ali se može izabrati; može se upisati bilo koji pojedinačni znak ([Mapiranje kolona](column-mapping.md#the-fields)). |
| Navodnici | RFC 4180: polja mogu biti obavijena dvostrukim navodnicima, a `""` unutar navodnika je doslovan navodnik. |
| Razmaci | Početni i završni razmaci, tabulatori i navodnici se skidaju sa svakog polja. |
| Polja po redu | Najviše 4 096; više je greška (*je li razdjelnik tačan?*). |
| Brojevi | Opcionalni znak, cifre, opciono `.` i decimale, opcioni eksponent (`1.5e-3`). Decimalni zarez (`1,5`), separatori hiljada ili završne jedinice (`12 m`) se ne čitaju i broje se kao nedostajuće. Ako vaša datoteka koristi decimalne zareze, zamijenite ih tačkama prije učitavanja (pronalaženje i zamjena u uređivaču teksta to radi). |
| Brojčana kolona | Kolona se nudi kao brojčana kada više od 90% nepraznih vrijednosti u prvih 50 redova može da se pročita kao broj. |
| Broj redova | Procjenjuje se prije učitavanja iz prosječne dužine reda prvih 1 MiB. |
| Kodiranje teksta | UTF-8. |

## Parquet {#parquet}

Čita se sa [hyparquet](https://github.com/hyparam/hyparquet), dio po dio kolone u tipizirane nizove, tražeći samo preslikane kolone ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Osobina | Pravilo |
|---|---|
| Broj redova | Tačan, iz podnožja datoteke, prije učitavanja. |
| Pregled | Prvih 50 redova, dekodiranih kao objekti; njihove vrijednosti odlučuju koje kolone izgledaju brojčano. |
| Cijeli brojevi | `INT32` i `INT64` (dekodiran kao BigInt) postaju brojevi. |
| Decimalni brojevi | `FLOAT`, `DOUBLE`. |
| Logičke vrijednosti | 1 i 0. |
| Tekst | Koristi se za kolone osobe, grupe, sesije i kategorije; tekst koji izgleda kao broj prihvata se za brojčane uloge. |
| Logički tipovi `TIMESTAMP`, `DATE` | Dekodiraju se u trenutke (milisekunde od 1970); kada se koriste kao vremenska osa, postavka jedinice se ignoriše. |
| Ugnježdene kolone | Kolone struct i list nisu namijenjene nijednoj ulozi (u pregledu se prikazuju kao JSON tekst); nisu testirane. |
| Metapodaci podnožja | Ključ `heat3d` se čita kao nagovještaji preslikavanja (dolje). |

Kolona pozicije, vremena ili pogleda koja sadrži nešto drugo osim broja dekodira se kao nedostajuća.

## Uloge i tipovi kolona {#column-roles-and-types}

| Uloga | Tip u datoteci | Obavezno | Čuva se kao | Ograničenja |
|---|---|---|---|---|
| X, Y, Z | broj | dva od tri | 32-bitni decimalni broj, poslije [preslikavanja osa](axes-units-and-time.md) | Red bez upotrebljive pozicije se odbacuje. |
| Vrijeme | broj u jednoj od [jedinica vremena](axes-units-and-time.md#time-units), Parquet vremenski žig, ili ISO-8601 tekst | ne | 32-bitne decimalne sekunde od najranijeg reda | Sortiranje se odbija iznad 400 000 000 redova ([zašto](memory-and-budgets.md#the-sort-ceiling)). |
| Osoba | bilo šta; kodirano rječnikom | ne | 32-bitni id | |
| Sesija | bilo šta; kodirano rječnikom | ne | 32-bitni id | Oznake se navode do 100 000 sesija. |
| Grupa | bilo šta; kodirano rječnikom | ne | 16-bitni id | Do 4 096 grupa, inače se grupisanje odbacuje. |
| Yaw, pitch | broj, stepeni ili radijani | ne | 32-bitni decimalni broj u radijanima | |
| Smjer X, Y, Z | broj | ne (sva tri zajedno) | pretvara se u yaw i pitch | |
| Kolona filtera, *opseg* | broj | ne | 32-bitni decimalni broj | Do 4 aktivna filtera istovremeno. |
| Kolona filtera, *kategorija* | bilo šta; kodirano rječnikom | ne | 32-bitni id | Do 4 096 vrijednosti, inače se kolona ne čuva. |

Parquet kolona `TIMESTAMP` sačuvana kao kolona filtera je *opseg* epoha u milisekundama – klizač, a ne spisak.

## Kolone ishoda {#outcome-columns}

Ko je pobijedio, u svakom redu, kako bi se mjesto, put ili potez mogli ocijeniti po tome koliko je često njihova strana zatim pobijedila ([Procenat pobjeda](win-rate.md)). Prikazivač ove kolone zadržava sam, navodi ih prve u [filterima](filters.md) na jeziku prikazivača i čita ih u [mapi procenta pobjeda](win-rate.md), u [raščlambi](breakdown.md) i u [statistici volumena](volumes.md#statistics). Konverter za igru s rundama (CS2, Valorant, Rainbow Six Siege) ili s mečevima (War Thunder) zapisuje sve četiri; konverter za Tacview ih zapisuje za kampanje DCS servera kada datoteka krugova kaže ko je pobijedio ([DCS serveri](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Kolona | Tip | Značenje |
|---|---|---|
| `won` | 0/1 (prazno gdje nije poznato) | strana (tim) reda je dobila **rundu**; u igri bez rundi meč |
| `matchWon` | 0/1 (prazno gdje nije poznato) | strana (tim) reda je dobila **meč**; prazno gdje snimak ne pokazuje kraj |
| `round` | cijeli broj, od 1 | runda kojoj red pripada; u igri s mečevima svuda 1 |
| `roundEndReason` | tekst | kako je runda završila (u igri s mečevima meč), riječima ispod |

`won` i `matchWon` pripadaju strani reda: redovi igrača T nose ishod strane T, redovi AI jedinice ishod njenog tima; redovi koji ne pripadaju nijednoj strani ostavljaju ih praznim. Strana koja na poluvremenu zamijeni stranu zadržava svoj `matchWon` i uzima `won` svake runde onako kako ju je igrala. Neriješeno je 0 za obje strane.

Razlozi završetka su zajednički svim igrama, tako da jedan filter radi na svima (vlastita riječ igre se mapira gdje je moguće, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Značenje | Igre |
|---|---|---|
| `elimination` | ispali su svi igrači jedne strane | CS2, Valorant, Rainbow Six Siege |
| `bomb` | bomba (spike, cilj deaktivatora) je eksplodirala | CS2, Valorant, Rainbow Six Siege |
| `defuse` | bomba (spike) je deaktivirana | CS2, Valorant, Rainbow Six Siege |
| `time` | vrijeme runde je isteklo; War Thunder: odlučeno dok su obje strane još imale bodove | sve |
| `surrender` | strana se predala | CS2, Valorant, Rainbow Six Siege |
| `draw` | bez pobjednika | CS2 |
| `objective` | cilj zauzet ili zadržan (talac izveden, područje osigurano) | Rainbow Six Siege |
| `capture` | bodovi su istekli dok je pobjednik držao zone za zauzimanje; DCS: trajna kampanja dobijena zauzimanjem svih aerodroma i zona | War Thunder, DCS |
| `tickets` | bodovi izgubljeni zbog ubistava | War Thunder |
| `destruction` | posljednja vozila izgubljena odjednom, niko više ne može ući | War Thunder |
| `other` | bilo šta drugo | |

Navedite ih i u listi `extra` u nagovještajima `heat3d`, kao bilo koju drugu kolonu. Imena kolona `win`, `round_won`, `match_won`, `end_reason` i `win_reason` čitaju se kao iste kolone.

## Nagovještaji `heat3d` {#the-heat3d-hints}

Parquet datoteka može nositi sopstvena uputstva za čitanje u metapodacima ključ/vrijednost svog podnožja, pod ključem **`heat3d`**, kao JSON objekat ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Pregledač ih primjenjuje preko sopstvenih pretpostavki kada je datoteka prva u izboru; svaka stavka je opciona, a svaki rezultat se i dalje prikazuje i može se mijenjati u panelu [Mapiranje kolona](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Sve što se ne može pročitati kao JSON objekat se ignoriše.

### Šema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          nazivi kolona za poziciju
    "time": string,                                  kolona vremena
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           kolone filtera za čuvanje, od najkorisnije
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  mora biti > 0
  },
  "entity": {
    "size": number                                   veličina jedne praćene stvari u jedinicama datoteke, > 0
  }
}
```

| Stavka | Primjenjuje se kada | Efekat |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | navedena kolona postoji u datoteci | Postavlja tu ulogu. |
| `columns.timeUnit` | jedna je od sedam jedinica | Postavlja jedinicu vremena. |
| `columns.angleUnit` | `"degrees"` ili `"radians"` | Postavlja jedinicu ugla. |
| `columns.lookMode` | `"vector"` sa postavljenim dirX, dirY i dirZ; `"yawPitch"` sa postavljenim yaw; `"none"` | Postavlja režim pogleda. |
| `columns.extra` | to je niz | Zamjenjuje automatski spisak filtera, zadržavajući samo postojeće kolone koje nisu u nekoj ulozi; svaka je *opseg* kada je u pregledu izgledala brojčano, inače *kategorija*. Bez nje se automatski spisak zadržava, bez svake kolone koju je nagovještaj dodijelio nekoj ulozi. |
| `axes.up` | `"y"` ili `"z"` | Osa gore. |
| `axes.flipX/Y/Z` | logička vrijednost | Obrtanja. |
| `axes.scale` | broj > 0 | Razmjer jedinice. |
| `entity.size` | broj > 0 | [Veličina entiteta](sessions-persons-groups.md#entity-size) (pomnožena razmjerom jedinice pri učitavanju). Jedini način da se postavi. |

### Primjer {#example}

Izmišljen izvoz pucačine: Z gore, centimetri, lijevoruk svijet, igrači široki oko 72 cm.

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

Sa pyarrow-om, prilagođeni metapodaci šeme upisuju se u metapodatke ključ/vrijednost datoteke:

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

`npm run inspect -- file.parquet` ispisuje šemu datoteke, što je brz način da provjerite nazive kolona na koje se nagovještaji odnose.

## Šta kartica Toplotna mapa piše {#what-the-heatmap-tab-writes}

Ništa se ne upisuje nazad u podatke. Izlazi su:

- video zapisi, kao WebM (VP9 ili VP8) – [Putanja kamere i video](camera-path-and-video.md);
- položaj kamere, kopiran u clipboard kao tekst – [Kamera](camera.md#pose);
- nivoi sačuvani u [biblioteci nivoa](level-library.md) pregledača.
