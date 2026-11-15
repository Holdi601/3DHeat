---
title: "Referenza tal-formati tad-data"
nav_order: 19
lang: "mt"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Referenza tal-formati tad-data

Din il-paġna telenka kull tip ta' fajl li 3DHeat jista' jiftaħ, u x'għandha tkun tabella ġewwa fajl. Tabella hi ringieli u kolonni, bħal fuq folja tal-kalkulu: kull ringiela tgħid fejn kien xi ħaġa, u, jekk għandek dan, meta u min.

Dak li t-tab Heatmap jaqra, kolonna b'kolonna, u l-ħjiel li fajl Parquet jista' jġorr. (It-tab Analiżi tat-tellieqa jaqra fajls tad-dawriet, u t-tab Analiżi tal-logħbiet kif jaqra s-sommarji tal-logħbiet; ara [Analiżi tat-tellieqa](race-analysis.md) u [Analiżi tal-logħba](match-analysis.md).)

## Fajls {#files}

Din hi l-lista sħiħa u waħda ta' kull fajl li jista' jitgħabba. Il-panew **Sors** (**Fajls…**, **Folder…**, jew tqegħid b'idejk) jaċċetta biss dawn:

| Estensjoni | X'inhu | Miqri minn |
|---|---|---|
| `.parquet`, `.pq` | tabella Parquet | il-qarrej tal-Parquet (hawn taħt) |
| `.csv`, `.tsv`, `.txt` | test b'delimitatur | il-qarrej tat-test (hawn taħt) |
| `.3dheat` | logħba waħda f'fajl wieħed (ZIP li fih it-tabella u l-affarijiet extra tagħha) | titgħabba bħala t-tabella li fiha - [Fajl wieħed għal kull logħba](container.md) |
| `.acmi` (ukoll `.txt.acmi`, `.zip.acmi`) | rekording ta' titjira ta' Tacview | il-qarrej proprju tiegħu - [Rekordings ta' Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | rekording OCAP (bħal Arma) | il-qarrej proprju tiegħu |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | traċċi GPS: GPX, KML/KMZ, reġistri NMEA, reġistri tal-glider IGC, fajls tal-isport FIT | il-qarrej proprju tiegħu; il-pożizzjonijiet jiġu mil-latitudni u l-longitudni |

Mhux mitgħabbija bħala pożizzjonijiet: il-fajls JSON żgħar li jinsabu ħdejn tabella biex jiddeskrivuha (l-ismijiet li jispiċċaw b'`.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), u t-tabelli extra ta' konvertitur (`<match>.events.parquet` u simili, ara [Konvertituri](converters.md)) sakemm ma tagħżilhomx waħedhom. Kull ħaġa oħra titħalla barra bir-raġuni tagħha. Kif tintgħażel għażla hi spjegata f'[Tagħbija tal-fajls](loading-files.md#which-files-are-kept).

Fajls vojta jitħallew barra. F'għażla li fiha fajls `movement*.<estensjoni>`, jitgħabbew dawk biss ([Tagħbija tal-fajls](loading-files.md#which-files-are-kept)).

Id-dejta hi **ringiela waħda għal kull kampjun**: pożizzjoni f'mument, b'min hu, liema grupp, liema sessjoni, fejn kien qed iħares, u kwalunkwe kolonni oħra. Ringieli ta' avvenimenti (qtil, plant, strixxa) jistgħu jkunu fl-istess tabella tar-ringieli ta' pożizzjoni, imfarrqa b'kolonna ta' avveniment.

## Delimitat bit-test (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Fajl sempliċi u utli, tliet ringieli:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Il-kolonni jitqegħdu waħedhom ([Tqabbil tal-kolonni](column-mapping.md)).

Jinqara minn skanner tal-bajt li jiddekodifika biss il-kolonni mmappjati ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Aspett | Regola |
|---|---|
| Header | L-ewwel linja mhux vojta fiha l-ismijiet tal-kolonni. Isem vojt isir `column_N`. |
| Delimitatur | Jinstab mill-ewwel 20 linja mhux vojta tal-ewwel 1 MiB, fost il-virgola, il-punt u virgola, it-tab u l-pipe, bl-**konsistenza**: id-delimitatur li jagħti l-istess għadd ta' oqsma fuq kull linja mkejla jirbaħ, imbagħad dak li jagħti aktar oqsma. Spazju qatt ma jinstab imma jista' jintgħażel; kull karattru wieħed jista' jinkiteb ([Tqabbil tal-kolonni](column-mapping.md#the-fields)). |
| Quoting | RFC 4180: l-oqsma jistgħu jkunu mgħottija b'virgoletti doppji, `""` ġewwa virgoletti hu virgoletta litterali. |
| Spazji | Spazji, tabs u virgoletti fuq it-tarf ta' kull qasam jitneħħew. |
| Oqsma għal kull ringiela | Sa 4,096 bil-massimu; iktar minn hekk hu żball (*id-delimitatur hu sew?*). |
| Numri | Sinjal fakultattiv, ċifri, `.` fakultattiv u deċimali, esponent fakultattiv (`1.5e-3`). Virgola deċimali (`1,5`), separaturi tal-eluf jew unitajiet warajn (`12 m`) ma jinqrawx u jitqiesu nieqsa. Jekk il-fajl tiegħek juża virgoli deċimali, ibdiljhom b'punti qabel it-tagħbija (find and replace f'editur tat-test jaħdem). |
| Kolonna numerika | Kolonna tidher bħala numerika meta aktar minn 90% tal-valuri mhux vojta fl-ewwel 50 ringiela jinqraw bħala numri. |
| Għadd tar-ringieli | Jitqies qabel it-tagħbija mit-tul medju tal-linji fl-ewwel 1 MiB. |
| Kodifikazzjoni tat-test | UTF-8. |

## Parquet {#parquet}

Jinqara b'[hyparquet](https://github.com/hyparam/hyparquet), chunk tal-kolonna kull darba f'arrays tipati, u jintalbu biss il-kolonni mmappjati ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Aspett | Regola |
|---|---|
| Għadd tar-ringieli | Eżatt, mill-footer, qabel it-tagħbija. |
| Preview | L-ewwel 50 ringiela, iddekodifikati bħala oġġetti; il-valuri tagħhom jiddeċiedu liema kolonni jidhru numeriċi. |
| Interi | `INT32`, u `INT64` (iddekodifikati bħala BigInt) isiru numri. |
| Frazzjonijiet | `FLOAT`, `DOUBLE`. |
| Booleans | 1 u 0. |
| Stringi | Jintużaw għal kolonni ta' persuna, grupp, sessjoni u kategorija; string li tidher bħala numru tiġi aċċettata għal rwoli numerici. |
| Tipi loġiċi `TIMESTAMP`, `DATE` | Jiddekodifikaw f'istanzi (millisekondi mill-1970); meta jintużaw bħala assi tal-ħin, is-settings tal-unità jiġu injorati. |
| Kolonni nested | Kolonni ta' struct u lista mhumiex maħsuba għal ebda rwol (jidhru preview bħala test JSON); mhux ittestjati. |
| Metadata tal-footer | Iċ-ċavetta `heat3d` tinqara bħala ħjiel tal-mappa (hawn taħt). |

Pożizzjoni, ħin jew kolonna ta' ħarsa li fiha xi ħaġa ħlief numru tiddekodifika bħala nieqsa.

## It-tipi tal-kolonni u r-rwoli {#column-roles-and-types}

| Rwol | It-tip fil-fajl | Meħtieġ | Miżmum bħala | Limiti |
|---|---|---|---|---|
| X, Y, Z | numru | tnejn minn tlieta | float ta' 32-bit, wara l-[tqabbil tal-assi](axes-units-and-time.md) | ringiela mingħajr pożizzjoni utilizzabbli titwarrab. |
| Ħin | numru f'waħda mill-[unitajiet taż-żmien](axes-units-and-time.md#time-units), timestamp ta' Parquet, jew test ISO-8601 | le | float ta' 32-bit f'sekondi mill-iktar bikri | L-issortjar jiġi rifjutat fuq 400,000,000 ringiela ([għaliex](memory-and-budgets.md#the-sort-ceiling)). |
| Persuna | kwalunkwe; ikkodifikata b'dizzjunarju | le | ID ta' 32-bit | |
| Sessjoni | kwalunkwe; ikkodifikata b'dizzjunarju | le | ID ta' 32-bit | Tikketti miktuba sa 100,000 sessjoni. |
| Grupp | kwalunkwe; ikkodifikata b'dizzjunarju | le | ID ta' 16-bit | Sa 4,096 grupp, inkella t-tqassim jitneħħa. |
| Yaw, pitch | numru, gradi jew radjanti | le | float ta' 32-bit radjanti | |
| Direzzjoni X, Y, Z | numru | le (it-tlieta flimkien) | maqlub għal yaw u pitch | |
| Kolonna ta' filtru, *firxa* | numru | le | float ta' 32-bit | Sa 4 filtri attivi f'daqqa. |
| Kolonna ta' filtru, *kategorija* | kwalunkwe; ikkodifikata b'dizzjunarju | le | ID ta' 32-bit | Sa 4,096 valur, inkella l-kolonna ma tinżammx. |

Kolonna Parquet ta' `TIMESTAMP` miżmuma bħala kolonna ta' filtru hi *firxa* ta' millisekondi epoch - slider, mhux lista.

## Il-ħjiel `heat3d` {#the-heat3d-hints}

Fajl Parquet jista' jġorr l-istruzzjonijiet tiegħu stess tal-qari fil-metadata ta' ċavetta/valur tal-footer tiegħu, taħt iċ-ċavetta **`heat3d`**, bħala oġġett JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Il-viewer japplikahom fuq it-tħmin tiegħu stess meta l-fajl ikun l-ewwel ta' għażla; kull dħul hu fakultattiv u kull riżultat jibqa' muri u editjabbli fil-panew [Tqabbil tal-kolonni](column-mapping.md#the-heat3d-hints-in-a-parquet-footer). Kull ħaġa li ma tinqarax bħala oġġett JSON titħalla barra.

### Skema {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          ismijiet tal-kolonni għall-pożizzjoni
    "time": string,                                  il-kolonna tal-ħin
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           kolonni ta' filtru biex jinżammu, l-aktar utli l-ewwel
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  irid ikun > 0
  },
  "entity": {
    "size": number                                   id ta' oġġett wieħed imkejjel f'unitajiet tal-fajl, > 0
  }
}
```

| Dħul | Meta japplika | Effett |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | il-kolonna msemmija teżisti fil-fajl | Jissettja dak ir-rwol. |
| `columns.timeUnit` | hi waħda minn l-erba' unitajiet | Jissettja l-unità taż-żmien. |
| `columns.angleUnit` | `"degrees"` jew `"radians"` | Jissettja l-unità tal-angolu. |
| `columns.lookMode` | `"vector"` bid-dirX, dirY u dirZ kollha missettjati; `"yawPitch"` bil-yaw imissettja; `"none"` | Jissettja l-mod tal-ħarsa. |
| `columns.extra` | hi array | Jieħu post il-lista awtomatika tal-filtri, u jżomm biss kolonni eżistenti li mhumiex użati minn rwol; kull waħda hi *firxa* meta dehret numerika fil-preview, inkella *kategorija*. Mingħajr dan, il-lista awtomatika tinżamm nieqsa kull kolonna li dħul assenjalha rwol. |
| `axes.up` | `"y"` jew `"z"` | L-assi ta' fuq. |
| `axes.flipX/Y/Z` | boolean | Qlib. |
| `axes.scale` | numru > 0 | Skala tal-unità. |
| `entity.size` | numru > 0 | [Daqs tal-entità](sessions-persons-groups.md#entity-size) (imdaqqas bl-iskala tal-unità meta titgħabba). L-unika mod kif tissettja. |

### Eżempju {#example}

Esportazzjoni mħejjija ta' shooter: Z 'il fuq, ċentimetri, dinja bl-idejn ix-xellug, plejers madwar 72 cm wisa'.

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

### Kitba tagħha {#writing-it}

Bil-pyarrow, metadata skema ta' xtara tinkiteb fil-metadata ta' ċavetta/valur tal-fajl:

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

`npm run inspect -- file.parquet` iwerwi l-iskema ta' fajl, li hi mod malajr biex tiċċekkja l-ismijiet tal-kolonni li l-ħjiel jirreferu għalihom.

## Dak li t-tab Heatmap jikteb {#what-the-heatmap-tab-writes}

Ebda ħaġa ma terġa' tinkiteb lura fid-dejta. L-outputs huma:

- vidjows, bħala WebM (VP9 jew VP8) - [Passaġġ tal-kamera u video](camera-path-and-video.md);
- pożizzjoni tal-kamera, miktuba fuq il-clipboard bħala test - [Kamera](camera.md#pose);
- livelli mħażna fil-[librerija tal-livelli](level-library.md) tal-browser.
