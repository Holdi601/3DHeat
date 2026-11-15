---
title: "Yfirlit yfir gagnasnið"
nav_order: 19
lang: "is"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: false
---

# Yfirlit yfir gagnasnið

Þessi síða telur upp sérhverja tegund skráa sem 3DHeat getur opnað, og hvernig tafla inni í henni þarf að líta út. Tafla er raðir og dálkar, eins og í töflureikni: sérhver röð segir hvar eitthvað var og, ef þú hefur það, hvenær og hver.

Það sem Hitakortsflipinn les, dálk fyrir dálk, og vísbendingarnar sem Parquet-skrá getur borið. (Flipinn Kappakstursgreining les hringjaskrár og flipinn Leikur les samantektir leikja; sjá [Kappakstursgreining](race-analysis.md) og [Greining leikja](match-analysis.md).)

## Skrár {#files}

Þetta er eini heildarlistinn yfir skrár sem hægt er að hlaða. **Uppruni**-spjaldið (**Skrár…**, **Mappa…**, eða draga og sleppa) tekur við nákvæmlega þessum:

| Ending | Hvað það er | Lesið af |
|---|---|---|
| `.parquet`, `.pq` | Parquet-tafla | Parquet-lesarinn (hér að neðan) |
| `.csv`, `.tsv`, `.txt` | Texti með skiljum | textalesarinn (hér að neðan) |
| `.3dheat` | Einn leikur í einni skrá (ZIP sem geymir töfluna og viðbæturnar) | hleðst sem taflan sem hún geymir – [Ein skrá fyrir leik](container.md) |
| `.acmi` (líka `.txt.acmi`, `.zip.acmi`) | Tacview-flugupptaka | eigin lesari – [Tacview-upptökur](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-upptaka (Arma-gerð) | eigin lesari |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-leiðir: GPX, KML/KMZ, NMEA-skrár, IGC-svifflugskrár, FIT-íþróttaskrár | eigin lesari; staðsetningar koma úr breiddar- og lengdargráðu |

Ekki hlaðið sem staðsetningar: litlu JSON-skrárnar sem liggja við hlið töflu og lýsa henni (nöfn sem enda á `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), og viðbótartöflur breytis (`<match>.events.parquet` og þess háttar, sjá [Breytar](converters.md)) nema þú veljir þær sjálfstætt. Allt annað er sleppt með ástæðu. Hvernig val er síað er útskýrt í [Hleðsla skráa](loading-files.md#which-files-are-kept).

Tómar skrár eru sleppt. Í vali sem inniheldur `movement*.<ext>`-skrár eru aðeins þær hlaðnar ([Hleðsla skráa](loading-files.md#which-files-are-kept)).

Gögnin eru **ein röð fyrir hvert sýni**: staðsetning á augnabliki, valfrjálst með hver, hvaða hópur, hvaða lota, hvert var horft, og allir frekari dálkar. Atburðaraðir (dráp, uppsetning, skot) geta verið í sömu töflu og staðsetningaraðir, aðgreindar með atburðadálki.

## Texti með skiljum (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Minnsta nytsamlega skrá, þrjár raðir:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Dálkarnir raða sér sjálfir ([Dálkakortlagning](column-mapping.md)).

Lesið af bæti-stiga sem afkóðar aðeins þá dálka sem eru kortlagðir ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Þáttur | Regla |
|---|---|
| Haus | Fyrsta lína sem er ekki tóm heldur dálkaheitunum. Tómt heiti verður `column_N`. |
| Skil | Greind út frá fyrstu 20 línum sem eru ekki tómar í fyrsta 1 MiB, af kommu, semíkommu, tabi og lóðréttu striki, eftir **samkvæmni**: skilið sem gefur sama reitafjölda á sérhverri sýndri línu vinnur, og síðan það sem gefur fleiri reiti. Bil er aldrei greint en má velja; hvaða stakt tákn sem er má slá inn ([Dálkakortlagning](column-mapping.md#the-fields)). |
| Tilvitnanir | RFC 4180: reitir mega vera innan tvöfaldra gæsalappa, `""` inni í tilvitnun er bókstafleg gæsalappa. |
| Bil | Bil í upphafi og enda, tabar og gæsalappir eru klippt af hverjum reit. |
| Reitir í röð | Í mesta lagi 4.096; fleiri er villa (*er skiljan rétt?*). |
| Tölur | Valfrjálst formerki, tölustafir, valfrjálst `.` og aukastafir, valfrjálst veldi (`1.5e-3`). Aukastafakomma (`1,5`), þúsundaskil eða eftirstandandi einingar (`12 m`) eru ekki lesin og teljast vanta. Ef skráin þín notar aukastafakommur skaltu skipta þeim út fyrir punkta áður en þú hleður henni (leita og skipta út í textaritli virkar). |
| Talnadálkur | Dálkur er boðinn sem tölugildi þegar yfir 90% af gildum sem eru ekki tóm í fyrstu 50 röðunum lesast sem tölur. |
| Fjöldi raða | Áætlaður áður en hleðsla hefst út frá meðallengd lína í fyrsta 1 MiB. |
| Stafakóðun | UTF-8. |

## Parquet {#parquet}

Lesið með [hyparquet](https://github.com/hyparam/hyparquet), dálkabút fyrir dálkabút í tegundaðar fylkingar, og aðeins kortlagðir dálkar sóttir ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Þáttur | Regla |
|---|---|
| Fjöldi raða | Nákvæmur, úr fótnótu skrárinnar, áður en hleðsla hefst. |
| Forskoðun | Fyrstu 50 raðirnar, afkóðaðar sem hlutir; gildi þeirra ákveða hvaða dálkar líta út eins og tölur. |
| Heiltölur | `INT32`, og `INT64` (afkóðað sem BigInt) verða tölur. |
| Brotatölur | `FLOAT`, `DOUBLE`. |
| Rökgildi | 1 og 0. |
| Strengir | Notaðir fyrir dálka fyrir persónu, hóp, lotu og flokk; strengur sem lítur út eins og tala er tekinn gildur fyrir talnahlutverk. |
| `TIMESTAMP`, `DATE` rökleg tegund | Afkóðast í tímapunkta (millisekúndur frá 1970); notað sem tímaás, þá er einingastillingin hunsuð. |
| Hreiðraðir dálkar | Dálkar með byggingu og lista eru ekki ætlaðir í neitt hlutverk (þeir birtast sem JSON-texti í forskoðun); ekki prófað. |
| Lýsigögn fótnótu | Lykillinn `heat3d` er lesinn sem kortlagningarvísbendingar (hér að neðan). |

Staðsetningar-, tíma- eða útlitsdálkur sem geymir eitthvað annað en tölu afkóðast sem vantandi.

## Dálkahlutverk og gerðir {#column-roles-and-types}

| Hlutverk | Gerð í skránni | Krafist | Geymt sem | Takmörk |
|---|---|---|---|---|
| X, Y, Z | tala | tvö af þremur | 32 bita brotatala, eftir [ásavarpun](axes-units-and-time.md) | Röð án nothæfrar staðsetningar er felld niður. |
| Tími | tala í einni af [tímaeiningunum](axes-units-and-time.md#time-units), Parquet-tímapunktur, eða ISO-8601-texti | nei | 32 bita brotatala sekúndur frá fyrstu röð | Röðun er hafnað yfir 400.000.000 raðir ([af hverju](memory-and-budgets.md#the-sort-ceiling)). |
| Persóna | hvað sem er; orðabókarkóðað | nei | 32 bita auðkenni | |
| Lota | hvað sem er; orðabókarkóðað | nei | 32 bita auðkenni | Merki skráð fyrir allt að 100.000 lotur. |
| Hópur | hvað sem er; orðabókarkóðað | nei | 16 bita auðkenni | Allt að 4.096 hópar, annars er hópaskiptingin felld niður. |
| Snúningur, halli | tala, gráður eða radíanar | nei | 32 bita brotatala í radíönum | |
| Stefna X, Y, Z | tala | nei (allar þrjár saman) | breytt í snúning og halla | |
| Síudálkur, *bil* | tala | nei | 32 bita brotatala | Allt að 4 síur virkar í einu. |
| Síudálkur, *flokkur* | hvað sem er; orðabókarkóðað | nei | 32 bita auðkenni | Allt að 4.096 gildi, annars er dálkurinn ekki geymdur. |

Parquet-dálkur af gerðinni `TIMESTAMP` sem er geymdur sem síudálkur er *bil* í millisekúndum frá tímabili – renna, ekki listi.

## `heat3d`-vísbendingarnar {#the-heat3d-hints}

Parquet-skrá getur borið sínar eigin lesleiðbeiningar í lýsigögnum lykil/gildi fótnótunnar, undir lyklinum **`heat3d`**, sem JSON-hlutur ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Skoðarinn beitir þeim yfir eigin ágiskanir þegar skráin er fyrst í vali; sérhver færsla er valfrjáls og sérhver niðurstaða er samt sýnd og hægt að breyta henni í [Dálkakortlagning](column-mapping.md#the-heat3d-hints-in-a-parquet-footer)-spjaldinu. Allt sem er ekki gilt JSON-hlutur er hunsað.

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

| Færsla | Beitt þegar | Áhrif |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | dálkurinn sem er nefndur er til í skránni | Setur það hlutverk. |
| `columns.timeUnit` | það er ein af sjö einingunum | Setur tímaeininguna. |
| `columns.angleUnit` | `"degrees"` eða `"radians"` | Setur hornaeininguna. |
| `columns.lookMode` | `"vector"` með dirX, dirY og dirZ öll sett; `"yawPitch"` með yaw sett; `"none"` | Setur útlitsham. |
| `columns.extra` | það er fylki | Kemur í stað sjálfvirka síulistans, og heldur aðeins dálkum sem eru til og eru ekki notaðir í hlutverki; hver þeirra er *bil* þegar hann leit út eins og tala í forskoðuninni, annars *flokkur*. Án hans er sjálfvirki listinn geymdur, mínus þá dálka sem vísbending úthlutaði hlutverki. |
| `axes.up` | `"y"` eða `"z"` | Uppásinn. |
| `axes.flipX/Y/Z` | rökgildi | Snúningar. |
| `axes.scale` | tala > 0 | Einingakvarði. |
| `entity.size` | tala > 0 | [Stærð einingar](sessions-persons-groups.md#entity-size) (margfaldað með einingakvarðanum við hleðslu). Eina leiðin til að setja hana. |

### Dæmi {#example}

Uppdiktaður útflutningur úr skotleik: Z-upp, sentimetrar, vinstri-handar heimur, leikmenn um 72 cm breiðir.

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

### Skrifa hana {#writing-it}

Með pyarrow er sérsniðið skemalýsigögn skrifuð í lýsigögn lykil/gildi skráarinnar:

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

`npm run inspect -- file.parquet` prentar skema skráar, sem er fljótleg leið til að athuga dálkaheitin sem vísbendingarnar vísa í.

## Það sem Hitakortsflipinn skrifar {#what-the-heatmap-tab-writes}

Ekkert er skrifað aftur í gögnin. Úttökin eru:

- myndbönd, sem WebM (VP9 eða VP8) – [Myndavélarleið og myndband](camera-path-and-video.md);
- stelling myndavélar, afrituð á klippiborðið sem texti – [Myndavél](camera.md#pose);
- borð vistuð í [borðasafni](level-library.md) vafrans.
