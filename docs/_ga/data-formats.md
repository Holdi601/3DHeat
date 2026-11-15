---
title: "Tagairt do fhormáidí sonraí"
nav_order: 19
lang: "ga"
source: "data-formats.md"
source_hash: "2ffd2bfd6f0f"
translated: true
outdated: true
---

# Tagairt do fhormáidí sonraí

Liostaíonn an leathanach seo gach cineál comhaid is féidir le 3DHeat a oscailt, agus cad a chaithfidh tábla laistigh de a bheith cosúil leis. Is ráithe agus colúin é tábla, cosúil le scarbhileog: insíonn gach ráith cá raibh rud éigin, agus, má tá sé agat, cathain agus cé a bhí ann.

Cad a léann an cluaisín Teasmhapa, colún ar cholún, agus na leideanna a d'fhéadfadh comhad Parquet a iompar. (Léann an cluaisín Anailís rása comhaid lap, agus an cluaisín Meaitseáil achoimrí meaitseála; féach [Anailís rása](race-analysis.md) agus [Anailís meaitseála](match-analysis.md).)

## Comhaid {#files}

Seo an liosta iomlán amháin de chomhaid is féidir a luchtú. Glacann an painéal **Foinse** (**Comhaid…**, **Fillteán…**, nó tarraing agus scaoil) na cinn seo go díreach:

| Síneadh | Cad é | Léite ag |
|---|---|---|
| `.parquet`, `.pq` | tábla Parquet | an léitheoir Parquet (thíos) |
| `.csv`, `.tsv`, `.txt` | téacs deighilte | an léitheoir téacs (thíos) |
| `.3dheat` | meaitseáil amháin i gcomhad amháin (ZIP a choinníonn an tábla agus a bhreiseanna) | luchtaítear mar an tábla a choinníonn sé - [Comhad amháin do mheaitseáil](container.md) |
| `.acmi` (freisin `.txt.acmi`, `.zip.acmi`) | taifeadadh eitilte Tacview | a léitheoir féin - [Taifeadtaí Tacview](tacview-acmi.md) |
| `.json`, `.json.gz` | taifeadadh OCAP (cosúil le Arma) | a léitheoir féin |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | rianta GPS: GPX, KML/KMZ, loganna NMEA, loganna sciathánaíochta IGC, comhaid spóirt FIT | a léitheoir féin; tagann suímh ó dhomhanleithead agus fadlíne |

Ní luchtaítear mar shuímh na comhaid JSON bheaga a shuíonn in aice le tábla chun cur síos a dhéanamh air (ainmneacha a chríochnaíonn `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), ná táblaí breise tiontaire (`<match>.events.parquet` agus cosúil leo, féach [Tiontaithe](converters.md)) mura roghnaíonn tú iad ar leith. Scipeáiltear rud ar bith eile agus cúis leis. Míneofar conas a scagtar roghnú in [Luchtú comhad](loading-files.md#which-files-are-kept).

Scipeáiltear comhaid folmha. I roghnú ina bhfuil comhaid `movement*.<ext>`, ní luchtaítear ach iad sin ([Luchtú comhad](loading-files.md#which-files-are-kept)).

Is é an sonra **ró amháin do gach sampla**: suíomh ag nóiméad, go roghnach le cé, cén grúpa, cén seisiún, cá raibh siad ag féachaint, agus aon cholúin bhreise. Is féidir ráitis imeachta (marú, plandáil, lámhaigh) a bheith sa tábla céanna le ráitis suímh, agus iad a scaradh le colún imeachta.

## Téacs deighilte (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

An comhad is simplí a bhfuil úsáid ann, trí ró:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Mapálann na colúin iad féin ([Mapáil colún](column-mapping.md)).

Parsáiltear é le scanóir ar leibhéal beart a dhíchódaíonn colúin mapáilte amháin ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Gné | Riail |
|---|---|
| Ceannlíne | Coimeádann an chéad líne neamhfholamh ainmneacha na gcolún. Déantar `column_N` d'ainm folamh. |
| Deighilteoir | Brathaithe ó na chéad 20 líne neamhfholamh den chéad 1 MiB, i measc camóg, leathphointe, tab agus píopa, de réir **comhsheasmhachta**: buaileann an deighilteoir a thugann an líon réimsí céanna ar gach líne sampla, agus ansin an ceann a thugann níos mó réimsí. Ní bhrathaítear spás riamh ach is féidir é a roghnú; is féidir aon charachtar aonair a chlóscríobh ([Mapáil colún](column-mapping.md#the-fields)). |
| Luachana | RFC 4180: féadfar réimsí a fhilleadh i luachana dúbailte, is litriú é `""` taobh istigh de luachana. |
| Spásanna bána | Baintear spásanna, tabs agus luachana tosaigh agus deiridh as gach réimse. |
| Réimsí in aghaidh an róa | Ar a mhéad 4,096; níos mó is earráid é (*an bhfuil an deighilteoir ceart?*). |
| Uimhreacha | Comhartha roghnach, digití, `.` roghnach agus deachúlacha, easpónant roghnach (`1.5e-3`). Ní pharsáiltear camóg deachúlach (`1,5`), scartháin mhílte nó aonaid i ndiaidh (`12 m`) agus áirítear mar easnamh iad. Má úsáideann do chomhad camóga deachúlacha, athraigh iad go poncanna sula luchtaíonn tú é (déanann aimsigh agus cuir in ionad i eagarthóir téacs an jab). |
| Colún uimhriúil | Cuirtear colún i láthair mar uimhriúil nuair a pharsáiltear níos mó ná 90% de na luachanna neamhfholmha sna chéad 50 ró mar uimhreacha. |
| Líon ró | Meastar roimh an luchtú ó mheánfhad líne an chéad 1 MiB. |
| Ionchódú téacs | UTF-8. |

## Parquet {#parquet}

Léitear le [hyparquet](https://github.com/hyparam/hyparquet), ceap colúin ar cheap colúin isteach in eagair chineálaithe, ag iarraidh colúin mhapáilte amháin ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Gné | Riail |
|---|---|
| Líon ró | Cruinn, ón bhfootar, roimh an luchtú. |
| Réamhamharc | An chéad 50 ró, díchódaithe mar réada; is iad a luachanna a shocraíonn cé de na colúin a bhreathnaítear uimhriúil. |
| Slánuimhreacha | `INT32`, agus `INT64` (díchódaithe mar BigInt) ina n-uimhreacha. |
| Snámhphointí | `FLOAT`, `DOUBLE`. |
| Booleans | 1 agus 0. |
| Teaghráin | Úsáidtear iad le haghaidh colún duine, grúpa, seisiúin agus catagóire; glactar le teaghrán a bhreathnaítear uimhriúil le haghaidh róil uimhriúla. |
| Cineálacha loighciúla `TIMESTAMP`, `DATE` | Díchódaítear go ceannphointí (milliseconds ó 1970); mar ais ama úsáidtear iad, agus déantar neamhaird den socrú aonaid. |
| Colúin neadaithe | Níl colúin struct agus liosta beartaithe do aon ról (taispeántar iad mar théacs JSON); gan tástáil. |
| Meiteashonraí footar | Léitear an eochair `heat3d` mar leideanna mapála (thíos). |

Díchódaítear colún suímh, ama nó féachana a bhfuil rud eile ann seachas uimhir mar easnamh.

## Róil agus cineálacha colún {#column-roles-and-types}

| Ról | Cineál sa chomhad | Riachtanach | Stóráilte mar | Teorainneacha |
|---|---|---|---|---|
| X, Y, Z | uimhir | dhá cheann as trí | snámhphointe 32-beart, tar éis an [mhapála ais](axes-units-and-time.md) | Scriosta ró gan suíomh inúsáidte. |
| Am | uimhir in aon cheann de na [haonaid ama](axes-units-and-time.md#time-units), ama Parquet, nó téacs ISO-8601 | níl | soicindí snámhphointe 32-beart ón ró is luaithe | Diúltaítear do shórtáil os cionn 400,000,000 ró ([cén fáth](memory-and-budgets.md#the-sort-ceiling)). |
| Duine | ar bith; ionchódaithe le foclóir | níl | aitheantas 32-beart | |
| Seisiún | ar bith; ionchódaithe le foclóir | níl | aitheantas 32-beart | Liostaítear lipéid go dtí 100,000 seisiún. |
| Grúpa | ar bith; ionchódaithe le foclóir | níl | aitheantas 16-beart | Suas le 4,096 grúpa, nó scriosfar an grúpáil. |
| Giúrach, claonadh | uimhir, céimeanna nó radanna | níl | snámhphointe 32-beart radanna | |
| Treo X, Y, Z | uimhir | níl (an trí le chéile) | tiontaithe go giúrach agus claonadh | |
| Colún scagaire, *raon* | uimhir | níl | snámhphointe 32-beart | Suas le 4 scagaire gníomhach ag an am céanna. |
| Colún scagaire, *catagóir* | ar bith; ionchódaithe le foclóir | níl | aitheantas 32-beart | Suas le 4,096 luach, nó ní coimeádtar an colún. |

Is *raon* de mhilleasoin epoch é colún `TIMESTAMP` Parquet a choinnítear mar cholún scagaire - sleamhnán, ní liosta.

## Leideanna `heat3d` {#the-heat3d-hints}

Is féidir le comhad Parquet a threoracha léitheoireachta féin a iompar i meiteashonraí eochair/luacha a fhootair, faoin eochair **`heat3d`**, mar réad JSON ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Cuireann an t-amharcléirí ar an mbarr iad thar a thuairimí féin nuair is é an comhad an chéad cheann de roghnú; is roghnach gach iontráil agus taispeántar agus is féidir gach toradh a chur in eagar sa phainéal [Mapáil colún](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) fós. Déantar neamhaird de rud ar bith nach bpharsáiltear mar réad JSON.

### Scéim {#schema}

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

| Iontráil | Cur i bhfeidhm nuair | Éifeacht |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | tá an colún ainmnithe sa chomhad | Socraíonn sé an ról sin. |
| `columns.timeUnit` | is ceann de na seacht n-aonad é | Socraíonn an t-aonad ama. |
| `columns.angleUnit` | `"degrees"` nó `"radians"` | Socraíonn an t-aonad uillinne. |
| `columns.lookMode` | `"vector"` le dirX, dirY agus dirZ socraithe go léir; `"yawPitch"` le yaw socraithe; `"none"` | Socraíonn an mód féachana. |
| `columns.extra` | is eagar é | Cuireann sé an liosta scagaire uathoibríoch in ionad, ag coinneáil ach colúin atá ann nach n-úsáidtear mar ról; is *raon* é gach ceann a bhreathnaíodh uimhriúil sa réamhamharc, nó *catagóir* murab ea. Gan é, coinnítear an liosta uathoibríoch ach amháin aon cholún a shann leid chun ról. |
| `axes.up` | `"y"` nó `"z"` | Ais suas. |
| `axes.flipX/Y/Z` | boole | Casann. |
| `axes.scale` | uimhir > 0 | Scála aonaid. |
| `entity.size` | uimhir > 0 | [Méid aonáin](sessions-persons-groups.md#entity-size) (iolraithe ag scála an aonaid ag an luchtú). An t-aon bhealach chun é a shocrú. |

### Sampla {#example}

Easpórtáil shamhlaithe de scáthóg: Z-suas, ceintiméadair, domhan clé-lámhach, imreoirí thart ar 72 cm ar leithead.

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

### Á scríobh {#writing-it}

Le pyarrow, scríobhtar meiteashonraí scéime saincheaptha go meiteashonraí eochair/luacha an chomhaid:

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

Priontálann `npm run inspect -- file.parquet` scéim comhaid, rud a fhágann go bhfuil sé tapa na hainmneacha colún a dtagraíonn na leideanna dóibh a sheiceáil.

## Cad a scríobhann cluaisín Teasmhapa {#what-the-heatmap-tab-writes}

Ní scríobhtar aon rud ar ais sna sonraí. Is iad seo na haschuir:

- físeáin, mar WebM (VP9 nó VP8) - [Cosán ceamara agus físeán](camera-path-and-video.md);
- pose ceamara, cóipeáilte chuig an ngearrthaisce mar théacs - [Ceamara](camera.md#pose);
- leibhéil shábháilte sa [leabharlann leibhéal](level-library.md) sa bhrabhsálaí.
