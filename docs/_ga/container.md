---
title: "Comhad amháin in aghaidh an chluiche (.3dheat)"
parent: "Sonraí a iontráil"
nav_order: 9
lang: "ga"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Comhad amháin cluiche: `.3dheat`

Is comhad é `.3dheat` ina chuid iomlán de chluiche amháin i gcomhad amháin, le cóipeáil, a choinneáil nó a roinnt. Chun ceann a oscailt, scaoil an comhad ar an bpainéal Foinse.

```
match.3dheat   (comhad ZIP)
  manifest      cad é an cluiche, agus liosta gach rud atá istigh
  table         na suíomhanna (Parquet)
  match.json    doiciméad an chluiche
  sidecars      an rud a choinnigh an tiontaire ina iomláine (imeachtaí, teachtaireachtaí, ...)
```

Bhí cluiche tiontaithe ina chomhaid éagsúla taobh le taobh roimhe seo: an tábla `<match>.parquet`, doiciméad an chluiche `<match>.match.json` agus na sáiteáin `<match>.<what>.parquet` ([Coinníonn tiontairí gach rud](converters.md)). Coinníonn comhad `.3dheat` iad go léir in aon cheann amháin: athsheinm amháin, comhad amháin, le cóipeáil, a choinneáil nó a roinnt.

Tógadh é ionas go bhfuil lódáil míle acu chomh tapa le lódáil na dtáblaí scaoilte, agus ionas gur féidir le tiontairí níos déanaí i bhfad níos mó a chur isteach ann gan formáid nua.

## Ceann a lódáil {#loading-one}

Áit ar bith a lódáiltear comhad nó fillteán, lódáiltear comhad `.3dheat` freisin, agus is féidir le fillteán coimeádáin agus comhaid scaoilte a mheascadh:

| Áit | Cad a léitear ón gcoimeádán |
|---|---|
| Painéal foinse na **Léarscála teasa** (comhaid, fillteán, tarraing agus scaoil) | a thablaí, amhail is dá mbeidís ina `<match>.parquet` scaoilte |
| **Léarscáil teasa → Go leor cluichí ag an am céanna** (Comhaid, Fillteán, Cuir fillteán leis) | a thablaí, léite ar an láthair ag oibrithe an lódálaí |
| Cluaisín **Cluiche** (Lódáil, nó scaoil ar an radharc) | doiciméad an chluiche |
| Clár **Beartaíochta** telemetry | a thablaí |

Nuair a oscailtear coimeádán léitear dhá phíosa bheag de: a eolaire ag an deireadh agus a mhainifeist ag an tús; ní léitear aon rud de tábla go dtí go léann an lódálaí é. Ní léitear sáiteáin agus doiciméad an chluiche ach nuair a iarrann rud éigin orthu. Fillteán ina bhfuil an cluiche céanna faoi dhó, scaoilte agus pacáilte, lódálann sé uair amháin é.

## Pacáil agus dípacáil {#packing-and-unpacking}

Scríobhann tiontairí nua coimeádáin de réir réamhshocraithe: tiontaire War Thunder (`heat3d-wt-replay`), tiontaire CS2 (`heat3d_cs2 demos`) agus an uirlis Tacview (`node tools/acmi-to-parquet.mjs`). Coinníonn `--loose` na comhaid ar leith.

Pacáiltear cluichí a tiontaíodh roimhe seo, nó le huirlisí eile, leis an gceann seo:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** aimsíonn gach tábla `<match>.parquet` faoi na fillteáin, leis na comhaid a bhaineann leis, agus scríobhann `<match>.3dheat` taobh leo. Cuirtear cluiche atá pacáilte cheana ar leataobh. Léitear gach coimeádán ar ais ina iomláine (sha256, méid, CRC agus bonnlíne Parquet de gach ball) sula ndéantar aon rud eile; scriostar na comhaid scaoilte amháin le `--delete-loose`, agus le haghaidh cluiche a pacáladh roimhe seo ach amháin nuair is beart ar bheart iad an rud atá sa choimeádán. Fágtar cluiche ina bhfuil comhad athraithe sna nóiméid `--settle` dheireanacha (10 de réir réamhshocraithe) ina haonar: b'fhéidir go bhfuil tiontaire fós ag scríobh air.
- **unpack** scríobhann na baill ar ais mar chomhaid scaoilte taobh leis an gcoimeádán.
- **update** cuireann baill leis nó ionadaíonn iad gan na táblaí atá sa choimeádán cheana a athscríobh (thíos).
- **repack** athscríobhann coimeádán ina iomláine, ag scriosadh a bhfágann nuashonruithe ina ndiaidh.

## An fhormáid {#the-format}

Is comhad ZIP é comhad `.3dheat` (oscailfidh aon uirlis ZIP é), leis na rialacha seo:

1. **Is é `manifest.json` an chéad bhall** nuair a scríobhtar coimeádán, agus bíonn sé i láthair i gcónaí. Aimsítear trí eolaire lárnach ZIP é, mar sin tar éis `update` b'fhéidir go bhfuil sé níos déanaí sa chomhad.
2. **Stóráiltear baill a léitear de réir raon beart nó atá comhbhrúite cheana** (modh ZIP 0): Parquet, Arrow, íomhánna, samhlacha, fuaim, físeán, blobs neamhoscailte. Is raon beart leanúnach de choimeádán é ball stóráilte, mar sin léann léitheoir bonnlíne tábla agus a chuid píosaí colúin ina áit, trí `File.slice` i mbrabhsálaí nó iarratas raoin HTTP, díreach mar a léifeadh sé an comhad scaoilte.
3. **Is téacs é dífhilleadh** (modh 8): JSON, CSV, téacs simplí. Is beag iad seo agus léitear iomlán iad.
4. Is UTF-8 iad ainmneacha (bit bratach 11), coibhneasta, scartha le `/`, gan `..`; féadfaidh siad fillteáin a bheith iontu (`analysis/heat.json`). Coinníonn comhad scaoilte pacáilte a ainm féin, agus mar sin tugann dípacáil na comhaid chéanna ar ais.
5. Úsáideann baill níos mó ná 4 GiB, nó coimeádáin de níos mó ná 65,535 ball, ZIP64 mar is gnách. Ní chuireann scríobhóirí sonraí-tuairisceoirí i ndiaidh baill.

Na baill a scríobhann na tiontairí inniu, san ord seo:

| Ról | Ball | Stóráilte |
|---|---|---|
| `table` | `<match>.parquet` | tá |
| `match` | `<match>.match.json` | níl (dífhillte) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | tá |
| `summary` | `<match>.summary.json`, achoimre an innéacs mais ([Anailís mhais](mass-analysis.md)), curtha leis ag `tools/3dheat-summarize.mjs` | níl (dífhillte) |

Tagann an tábla díreach tar éis an mhainifeist, ionas go gclúdaíonn an chéad léamh den tús an mhainifeist agus ceanntásc áitiúil an tábla le chéile.

### An mainifeist {#the-manifest}

```json
{
 "format": "3dheat",
 "format_version": "1.0",
 "game": "warthunder",
 "source": "client replay",
 "converter": { "name": "heat3d-wt-replay", "version": "0.2.0" },
 "match": "<map>_RB_<date>_<session>",
 "map": "<map>",
 "mode": "RB ground",
 "started": "2026-01-01T12:00:00+00:00",
 "created": "2026-01-01T13:00:00.000Z",
 "roles": { "table": "<match>.parquet", "match": "<match>.match.json", "flight": "<match>.flight.parquet" },
 "members": [
  {
   "name": "<match>.parquet",
   "role": "table",
   "media_type": "application/vnd.apache.parquet",
   "compression": "stored",
   "bytes": 1738575,
   "rows": 38105,
   "sha256": "<64 hex digits>",
   "schema": { "id": "heat3d-table", "version": "1" }
  }
 ]
}
```

| Réimse | Brí |
|---|---|
| `format` | i gcónaí `3dheat` |
| `format_version` | `major.minor` (thíos) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | cad é an cluiche agus cad a rinne é; `null` nuair nach eol |
| `created`, `updated` | nuair a scríobhadh, nuair a nuashonraíodh go deireanach (ní thaispeánfar `updated` ach tar éis nuashonraithe) |
| `roles` | gach ról go hainm a chéad bhall: innéacs tapa |
| `members` | gach ball ach an mainifeist: an liosta iomlán, agus an ceann a bhfuil muinín ag léitheoir as |
| `matches` | roghnach: cluichí coimeádáin ina bhfuil cluichí iomadúla (thíos) |
| `references` | roghnach: comhaid a theastaíonn ón gcoimeádán ach nach bhfuil ann |
| `extensions` | roghnach: meiteashonraí de chuid tiontaire |

Gach ball:

| Réimse | Brí |
|---|---|
| `name` | a chosán sa choimeádán |
| `role` | cad atá ann (thíos) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` nó `deflate` |
| `bytes` | a mhéid, neamhchomhbhrúite |
| `sha256` | dá bheart, neamhchomhbhrúite |
| `rows` | líon sraitheanna tábla |
| `schema` | an coinbhinsiún a leanann sé, `{ "id", "version" }`: `format` agus `version` an doiciméid féin (`heat3d-wt-replay-match` 2), `heat3d-table` do thábla a léann an radharc trína bhonnlíne `heat3d`, `heat3d-acmi-table` do cheann na huirlise Tacview |
| `match` | i gcoimeádán de chluichí iomadúla, an `matches[].id` a bhaineann leis |

### Déanta le fás {#made-to-grow}

Tá an fhormáid ceaptha chun athsheinmeanna i bhfad saibhre ná an lá inniu a iompar gan briseadh ar an méid a léann í anois:

- **Leagan.** Is `major.minor` é `format_version`. Léann léitheoir gach mionleagan dá mhórleagan agus déanann sé neamhaird de gach réimse nach eol dó. Ardaíonn an mionleagan nuair a chuirtear rud éigin leis; ardaíonn an mórleagan ach amháin nuair a athraíonn an leagan amach ionas go léifeadh léitheoir níos sine é go mícheart (ball nach bhfuil stóráilte a thuilleadh, an mainifeist aistrithe as an gcartlann). Déantar coinbhinsiún gach baill a leagan ar leithligh, ina `schema`, ionas nach dteastaíonn leagan nua coimeádáin ó leagan amach nua tábla nó doiciméid nua. Ba `"version": 1` a dúirt na chéad choimeádáin scríofa ina ionad; glacann léitheoirí leis mar 1.0.
- **Tá róil oscailte.** Is sreang ar bith ról. Úsáideann léitheoirí na róil a aithnítear agus coinníonn siad an chuid eile: liostaítear ról anaithnid, ní dhiúltaítear dó riamh, agus iompraíonn `update` agus `repack ar aghaidh é gan athrú. Féadfaidh go leor baill a bheith ag ról: tablaí iomadúla (rianta de réir aonaid, telemetry ag rátaí eile), imeachtaí, guth, sioncrónú físe, tagairtí leibhéil, forscríobh figiúr, torthaí anailíse. Féadfaidh fillteáin a bheith in ainmneacha.
- **Aon mheán.** Féadfaidh ball a bheith ar aon rud a bhfuil cineál meán aige: Parquet, JSON, Arrow, mionsamhlacha PNG nó JPEG, samhlacha glTF, fuaim, blobs amha.
- **Cluichí iomadúla.** Féadfaidh seisiún nó comórtas dul i gcoimeádán amháin: liostaíonn `matches` iad (`{ "id", "map", "mode", "started", ... }`) agus ainmníonn gach ball a `match`. Lódálann an radharc gach ball de ról `table`.
- **Tagairtí.** Liostaítear comhaid a theastaíonn ón gcoimeádán ach nach bhfuil ann, leibhéal do cheann amháin, i `references` de réir ainm agus sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), ionas go bhfaightear an comhad ceart agus go seiceáiltear é gan é a chóipeáil isteach i ngach cluiche.
- **Síntí.** Coinníonn `extensions` meiteashonraí tiontaire faoina eochair féin, `"<vendor>/<name>": { ... }`, ionas nach mbíonn dhá thiontaire ag imbualadh riamh agus nach gá rud ar bith a chur leis na réimsí roinnte.
- **Nuashonrú ar an láthair.** Cuireann `update` baill leis nó ionadaíonn sé iad gan na táblaí móra stóráilte a athscríobh: cuirtear na baill nua agus mainifeist nua i ndiaidh deireadh an choimeádáin, agus eolaire lárnach nua ina dhiaidh sin. Fanann an rud a ionadaíodh mar bheart gan tagairt go dtí `repack`. Coinnítear gach ball agus gach réimse mainifeiste, eolach nó neamheolach. Cuirtear nuashonrú a theipeann air siar go dtí an coimeádán mar a bhí sé.

Coinníonn tástálacha an radharc é chuige seo: maireann coimeádán de leagan 1.7 le ról anaithnid, réimse ball, síneadh agus ball fuaime i bhfillteán a lódáiltear, agus tá sé slán tar éis nuashonraithe agus repack; diúltaítear do choimeádán de mhórleagan 2.

## Scríobhóirí {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs) (scríobh, léigh, fíoraigh, nuashonraigh, athphacáil), in úsáid ag uirlis na pacála agus ag uirlis Tacview.
- Python: `container.py`, timpeall 140 líne ar an `zipfile` caighdeánach, an comhad céanna i ngach tiontaire (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), ionas nach mbraitheann tiontaire ar thiontaire eile. Cóipeálann tiontaire nua é.
- Léann an radharc le [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
