---
title: "Andmevormingute viide"
nav_order: 19
lang: "et"
source: "data-formats.md"
source_hash: "3b120416f7a6"
translated: true
outdated: false
---

# Andmevormingute viide

See leht loetleb kõik failitüübid, mida 3DHeat oskab avada, ja selgitab, millise kujuga peab tabel nende sees olema. Tabel on read ja veerud nagu tabelarvutuses: iga rida ütleb, kus midagi oli ja, kui sul see andmed on, millal ja kes.

Mida soojuskaardi vaade loeb veerust veergu ja milliseid vihjeid Parquet-fail võib kanda. (Sõiduanalüüsi vaade loeb ringifaile ja matši vaade matšide kokkuvõtteid; vt [Sõiduanalüüs](race-analysis.md) ja [Matšianalüüs (CS2)](match-analysis.md).)

## Failid {#files}

See on ainus täielik loetelu laaditavatest failidest. **Allika** paneel (**Failid…**, **Kaust…** või lohistamine) võtab vastu täpselt need:

| Laiend | Mis see on | Lugeja |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tabel | Parquet-lugeja (allpool) |
| `.csv`, `.tsv`, `.txt` | Eraldajatega tekst | tekstilugeja (allpool) |
| `.3dheat` | Üks matš ühes failis (ZIP, mis hoiab tabelit ja selle lisasid) | laadib selle tabelina - [Üks fail matši kohta](container.md) |
| `.acmi` (ka `.txt.acmi`, `.zip.acmi`) | Tacview lennusalvestis | oma lugeja - [Tacview salvestised (ACMI)](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-salvestis (Arma moodi) | oma lugeja |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-rajad: GPX, KML/KMZ, NMEA-logid, IGC purjelennu logid, FIT spordifailid | oma lugeja; asukohad tulevad laiuskraadist ja pikkuskraadist |

Asukohtadena ei laadita: väikesed JSON-failid, mis asuvad tabeli kõrval ja kirjeldavad seda (nimed lõpevad `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), ja konverterite lisatabelid (`<matš>.events.parquet` jms, vt [Konverterid säilitavad kõik](converters.md)), kui neid just eraldi ei vali. Kõik muu jäetakse vahele koos põhjusega. Kuidas valikut filtreeritakse, on selgitatud lehel [Failide laadimine](loading-files.md#which-files-are-kept).

Tühjad failid jäetakse vahele. Valikus, kus on `movement*.<laiend>` faile, laaditakse ainult need ([Failide laadimine](loading-files.md#which-files-are-kept)).

Andmed on **üks rida ühe mõõtepunkti kohta**: asukoht hetkel, valikuliselt kes, millisesse gruppi, millisesse sessiooni, kuhu vaadati, ja kõik muud veerud. Sündmuse read (tapmine, pommi paigaldamine, lasu) võivad olla samas tabelis asukohtade ridadega, eristatuna sündmuse veeru järgi.

## Eraldajatega tekst (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Väikseim kasulik fail, kolm rida:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Veerud seostuvad ise ([Veergude seostamine](column-mapping.md)).

Lugeja on baidi tasemel skanner, mis dekodeerib ainult seostatud veerud ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspekt | Reegel |
|---|---|
| Päis | Esimene mittetühi rida hoiab veergude nimesid. Tühi nimi muutub `column_N`-iks. |
| Eraldaja | Tuvastatakse esimese 1 MiB esimestest 20 mittetühjast reast, valikute hulgast: koma, semikoolon, tabulaator ja torujoon, **järjekindluse** järgi: võidab eraldaja, mis annab igal proovitud real sama väljade arvu, ja seejärel see, mis annab rohkem välju. Tühikut ei tuvastata, aga selle võib valida; võib sisestada ükskõik millise ühe märgi ([Veergude seostamine](column-mapping.md#the-fields)). |
| Jutumärgid | RFC 4180: väljad võivad olla topelt-jutumärkide vahel, jutumärkide sees on `""` sõnasõnaline jutumärk. |
| Tühikud | Väljade algusest ja lõpust eemaldatakse tühikud, tabulaatorid ja jutumärgid. |
| Välju rea kohta | Kuni 4096; rohkem on viga (*kas eraldaja on õige?*). |
| Arvud | Valikuline märk, numbrid, valikuline `.` ja kümnendikud, valikuline eksponent (`1.5e-3`). Kümnendkoma (`1,5`), tuhandete eraldajad ja järele kirjutatud ühikud (`12 m`) ei loeta arvudena ja on puuduvad. Kui su failis on kümnendkomad, asenda need enne laadimist punktidega (sobib tekstiredaktori otsi ja asenda). |
| Arvuline veerg | Veerg pakutakse arvulisena, kui üle 90% esimese 50 rea mittetühjadest väärtustest loetakse arvudeks. |
| Ridade arv | Hinnatakse enne laadimist esimese 1 MiB keskmisest rea pikkusest. |
| Tekstikodeering | UTF-8. |

## Parquet {#parquet}

Loetakse [hyparquet](https://github.com/hyparam/hyparquet) abil, veeruosa kaupa tüüpidega massiivideks, küsides ainult seostatud veerge ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspekt | Reegel |
|---|---|
| Ridade arv | Täpne, failijalust, enne laadimist. |
| Eelvaade | Esimesed 50 rida objektidena; nende väärtused otsustavad, millised veerud näevad arvulised välja. |
| Täisarvud | `INT32` ja `INT64` (dekodeeritakse BigInt-ina) muutuvad arvudeks. |
| Ujuvkomaarvud | `FLOAT`, `DOUBLE`. |
| Tõeväärtused | 1 ja 0. |
| Stringid | Kasutatakse isiku-, grupi-, sessiooni- ja kategooriaveergudena; arvulise väljanägemisega string on arvulistes rollides vastuvõetav. |
| `TIMESTAMP`, `DATE` loogilised tüübid | Dekodeeritakse hetkedeks (millisekundit alates 1970); ajateljena kasutades ühikuseadet ei arvestata. |
| Pesastatud veerud | Struct- ja list-veerud ei sobi ühessegi rolli (eelvaates JSON-tekstina); testimata. |
| Failijalu metaandmed | Võtit `heat3d` loetakse seostusvihjetena (allpool). |

Asukoha, aja või vaatamise veerg, mis sisaldab muud kui arvu, dekodeeritakse puuduvana.

## Veeruroll ja tüübid {#column-roles-and-types}

| Roll | Tüüp failis | Kohustuslik | Salvestatakse kujul | Piirangud |
|---|---|---|---|---|
| X, Y, Z | arv | kaks kolmest | 32-bitine ujuvkoma, pärast [teljeseadet](axes-units-and-time.md) | Rida ilma kasutatava asukohata jäetakse välja. |
| Aeg | arv ühes [ajaühikus](axes-units-and-time.md#time-units), Parquet-ajatempel või ISO-8601 tekst | ei | 32-bitine ujuvkoma sekundites, alates varaseimast reast | Sorteerimine keeldub üle 400 000 000 rea ([miks](memory-and-budgets.md#the-sort-ceiling)). |
| Isik | mis tahes; sõnastikukodeeritud | ei | 32-bitine id | |
| Sessioon | mis tahes; sõnastikukodeeritud | ei | 32-bitine id | Silte kuvatakse kuni 100 000 sessioonini. |
| Grupp | mis tahes; sõnastikukodeeritud | ei | 16-bitine id | Kuni 4096 gruppi, muidu grupeerimine jäetakse ära. |
| Pööre, kallak (yaw, pitch) | arv, kraadid või radiaanid | ei | 32-bitine ujuvkoma radiaanides | |
| Suund X, Y, Z | arv | ei (kõik kolm koos) | teisendatakse pöördeks ja kallakuks | |
| Filtriveerg, *vahemik* | arv | ei | 32-bitine ujuvkoma | Kuni 4 filtrit korraga aktiivne. |
| Filtriveerg, *kategooria* | mis tahes; sõnastikukodeeritud | ei | 32-bitine id | Kuni 4096 väärtust, muidu veergu ei hoita. |

Parquet-i `TIMESTAMP`-veerg, mida hoitakse filtriveerguna, on *vahemik* epoch-millisekundites: liugur, mitte loend.

## Tulemuse veerud {#outcome-columns}

Kes võitis, igal real, et kohta, marsruuti või käiku saaks hinnata selle järgi, kui tihti selle pool lõpuks võitis ([Võitude osakaal](win-rate.md)). Vaataja hoiab need veerud ise alles, loetleb need [filtrites](filters.md) esimesena vaataja keeles ja loeb neid [võitude kaardil](win-rate.md), [jaotuses](breakdown.md) ja [mahu statistikas](volumes.md#statistics). Raundipõhise mängu (CS2, Valorant, Rainbow Six Siege) või mängupõhise mängu (War Thunder) konverter kirjutab kõik neli; Tacview konverter kirjutab need DCS-serveri kampaaniate jaoks, kus voorude fail ütleb, kes võitis ([DCS-serverid](tacview-acmi.md#dcs-servers-who-won-and-how-each-sortie-ended)):

| Veerg | Tüüp | Tähendus |
|---|---|---|
| `won` | 0/1 (tühi, kus teadmata) | rea pool (meeskond) võitis **raundi**; raundideta mängus mängu |
| `matchWon` | 0/1 (tühi, kus teadmata) | rea pool (meeskond) võitis **mängu**; tühi, kus salvestis lõppu ei näita |
| `round` | täisarv, alates 1 | raund, kuhu rida kuulub; mängupõhises mängus kogu aeg 1 |
| `roundEndReason` | tekst | kuidas raund lõppes (mängupõhises mängus mäng), allolevate sõnadega |

`won` ja `matchWon` kuuluvad rea poolele: T-mängija ridadel on T-poole tulemus, AI-üksuse ridadel tema meeskonna oma; ridadel, mis ei kuulu ühelegi poolele, jäävad need tühjaks. Pool, mis poolajal vahetab, hoiab oma `matchWon` ja võtab iga raundi `won` nii, nagu ta seda mängis. Viik on mõlemale poolele 0.

Lõpu põhjused on kõigil mängudel ühised, nii et üks filter töötab kõigil (mängu enda sõna seotakse nendega, kus võimalik, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Tähendus | Mängud |
|---|---|---|
| `elimination` | ühe poole kõik mängijad väljas | CS2, Valorant, Rainbow Six Siege |
| `bomb` | pomm (spike, desarmeerija sihtmärk) plahvatas | CS2, Valorant, Rainbow Six Siege |
| `defuse` | pomm (spike) desarmeeriti | CS2, Valorant, Rainbow Six Siege |
| `time` | raundi kell sai otsa; War Thunder: otsustatud, kui mõlemal poolel oli pileteid alles | kõik |
| `surrender` | üks pool andis alla | CS2, Valorant, Rainbow Six Siege |
| `draw` | võitjat pole | CS2 |
| `objective` | eesmärk võetud või hoitud (pantvang välja viidud, ala kindlustatud) | Rainbow Six Siege |
| `capture` | piletid said otsa, kui võitja hoidis vallutustsoone; DCS: püsiv kampaania, mis võideti kõigi lennuväljade ja tsoonide vallutamisega | War Thunder, DCS |
| `tickets` | piletid kaotatud mahalaskmistega | War Thunder |
| `destruction` | viimased sõidukid kaotatud korraga, kedagi pole enam ilmumas | War Thunder |
| `other` | kõik muu | |

Nimeta need ka `heat3d` vihjete `extra` loendis, nagu iga teist veergu. Veerunimesid `win`, `round_won`, `match_won`, `end_reason` ja `win_reason` loetakse samade veergudena.

## `heat3d` vihjed {#the-heat3d-hints}

Parquet-fail võib kanda oma lugemisjuhiseid failijalu võtme/väärtuse metaandmetes, võtmes **`heat3d`**, JSON-objektina ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Vaataja rakendab need oma oletuste üle, kui fail on valiku esimene; iga kirje on valikuline ja iga tulemus on ikka näha ja muudetav [Veergude seostamise](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) paneelis. Kõik, mis ei parsi JSON-objektiks, ignoreeritakse.

### Skeem {#schema}

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

| Kirje | Rakendub, kui | Mõju |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | nimetatud veerg on failis | Määrab selle rolli. |
| `columns.timeUnit` | on üks seitsmest ühikust | Määrab ajaühiku. |
| `columns.angleUnit` | `"degrees"` või `"radians"` | Määrab nurgaühiku. |
| `columns.lookMode` | `"vector"`, kui dirX, dirY ja dirZ on kõik seatud; `"yawPitch"`, kui yaw on seatud; `"none"` | Määrab vaatamisrežiimi. |
| `columns.extra` | on massiiv | Asendab automaatse filtriloendi: jätab alles ainult olemasolevad veerud, mida ükski roll ei kasuta; igaüks on *vahemik*, kui see eelvaates näis arvuline, muidu *kategooria*. Ilma selleta jääb automaatne loend alles, miinus veerud, mille vihje on seotud mõne rolliga. |
| `axes.up` | `"y"` või `"z"` | Ülesuunaline telg. |
| `axes.flipX/Y/Z` | tõeväärtus | Peegeldused. |
| `axes.scale` | arv > 0 | Ühikuskaala. |
| `entity.size` | arv > 0 | [Üksuse suurus](sessions-persons-groups.md#entity-size) (korrutatakse laadimisel ühikuskaalaga). Ainus viis seda määrata. |

### Näide {#example}

Väljamõeldud laskurimängu eksport: Z üles, sentimeetrid, vasakukäeline maailm, mängijad umbes 72 cm laiused.

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

### Kirjutamine {#writing-it}

Pyarrow'ga kirjutatakse kohandatud skeemi metaandmed faili võtme/väärtuse metaandmetesse:

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

`npm run inspect -- file.parquet` prindib faili skeemi. See on kiire viis kontrollida veerunimesid, millele vihjed viitavad.

## Mida soojuskaardi vaade kirjutab {#what-the-heatmap-tab-writes}

Andmetesse ei kirjutata midagi tagasi. Väljundid on:

- videod WebM-vormingus (VP9 või VP8) - [Kaamerarada ja video](camera-path-and-video.md);
- kaamera positsioon, mis kopeeritakse lõikelauale tekstina - [Kaamera](camera.md#pose);
- brauseri [tasemete raamatukogus](level-library.md) salvestatud tasemed.
