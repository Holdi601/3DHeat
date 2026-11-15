---
title: "Ein skrá fyrir hvern leik (.3dheat)"
parent: "Hvernig gögn eru sett inn"
nav_order: 9
lang: "is"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Ein skrá fyrir hvern leik: `.3dheat`

`.3dheat`-skrá er einn heill leikur í einni skrá, til að afrita, geyma eða deila. Til að opna hana skaltu bara sleppa skránni á Uppruna-spjaldið.

```
match.3dheat   (ZIP-skrá)
  manifest      hvað leikurinn er, og listi yfir allt sem er inni
  table         staðsetningarnar (Parquet)
  match.json    leikjaskjalið
  sidecars      það sem breytandinn geymdi heilt (atburðir, skilaboð, ...)
```

Breyttur leikur var áður nokkrar skrár hlið við hlið: taflan `<match>.parquet`, leikjaskjalið `<match>.match.json` og hliðarskrárnar `<match>.<hvað>.parquet` ([Breytar geyma allt](converters.md)). `.3dheat`-skrá geymir þær allar í einni: ein endurspilun, ein skrá, til að afrita, geyma eða deila.

Hún er smíðuð þannig að það sé jafn hratt að hlaða þúsund þeirra og að hlaða lausar töflur, og þannig að síðari breytendur geti sett miklu meira í hana án nýs skráarsniðs.

## Að hlaða einni {#loading-one}

Alls staðar þar sem skrá eða mappa hleðst, hleðst `.3dheat`-skrá líka, og mappa getur blandað saman ílátum og lausum skrám:

| Hvar | Hvað er lesið úr ílátinu |
|---|---|
| **Hitakort**-uppruna-spjaldið (skrár, mappa, drag og sleppa) | töflurnar, eins og þær væru lausa `<match>.parquet` |
| **Hitakort → Margir leikir í einu** (Skrár, Mappa, Bæta við möppu) | töflurnar, lesnar á staðnum af vinnsluferlum hleðslutækisins |
| **Leikur**-flipinn (Hlaða, eða sleppa á sýnina) | leikjaskjalið |
| **Leikfræði**-taflan, fjarmæling | töflurnar |

Þegar ílát er opnað eru lesnir tveir litlir hlutar úr því, skráin í endanum og manifest-ið í byrjuninni; ekkert úr töflu er lesið fyrr en hleðslutækið les hana. Hliðarskrár og leikjaskjalið eru aðeins lesin þegar eitthvað biður um þau. Mappa sem geymir sama leik tvisvar, lausan og pakkaðan, hleður honum einu sinni.

## Pökkun og afpökkun {#packing-and-unpacking}

Nýjar breytingar skrifa ílát sjálfgefið: WT-breytandinn (`heat3d-wt-replay`), CS2-breytandinn (`heat3d_cs2 demos`) og Tacview-verkfærið (`node tools/acmi-to-parquet.mjs`). `--loose` heldur aðskildum skrám.

Leikir sem voru breyttir áður, eða af öðrum verkfærum, eru pakkaðir með:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** finnur hverja töflu `<match>.parquet` undir möppunum ásamt skrám sem tilheyra henni og skrifar `<match>.3dheat` við hlið þeirra. Leikur sem er þegar pakkaður er sleppt. Hvert ílát er lesið til baka í heild (sha256, stærð, CRC og Parquet-endi hvers hluta) áður en nokkuð annað gerist; lausu skrárnar eru aðeins eyddar með `--delete-loose`, og fyrir leik sem var pakkaður áður aðeins þegar þær eru bæti fyrir bæti það sem ílátið geymir. Leik þar sem skrá hefur breyst á síðustu `--settle` mínútum (10 sjálfgefið) er látinn í friði: breytandi gæti enn verið að skrifa hann.
- **unpack** skrifar hlutana aftur sem lausar skrár við hlið ílátsins.
- **update** bætir við eða skiptir út hlutum án þess að endurskrifa töflurnar sem þegar eru í ílátinu (hér fyrir neðan).
- **repack** endurskrifar ílát í heild og hendir því sem uppfærslur skildu eftir.

## Sniðið {#the-format}

`.3dheat`-skrá er ZIP-safn (hvaða ZIP-verkfæri sem er opnar hana), með þessum reglum:

1. **`manifest.json` er fyrsti hlutinn** þegar ílát er skrifað, og er alltaf til staðar. Það er fundið í ZIP-miðskránni, svo eftir `update` getur það legið aftar í skránni.
2. **Hlutir sem eru lesnir eftir bætisviði eða eru þegar þjappaðir eru geymdir** (ZIP-aðferð 0): Parquet, Arrow, myndir, líkön, hljóð, myndband, ógagnsæir blobbar. Geymdur hluti er samfellt bætisvið í ílátinu, svo lesandi getur lesið endi töflu og dálkabúta hennar á staðnum, með `File.slice` í vafra eða HTTP-bilbeiðni, alveg eins og hann læsi lausu skrána.
3. **Texti er þjappaður** (aðferð 8): JSON, CSV, venjulegur texti. Þetta er lítið og er lesið í heild.
4. Heiti eru UTF-8 (fáni bit 11), afstæð, með `/` sem skilju, án `..`; þau mega geyma möppur (`analysis/heat.json`). Laus skrá sem er pökkuð heldur sínu heiti, svo afpökkun skilar sömu skrám.
5. Hlutir stærri en 4 GiB, eða ílát með fleiri en 65.535 hluta, nota ZIP64 eins og venjulega. Skrifarar setja engar gagnalýsingar eftir hluta.

Hlutirnir sem breytendur skrifa í dag, í þessari röð:

| Hlutverk | Hluti | Geymdur |
|---|---|---|
| `table` | `<match>.parquet` | já |
| `match` | `<match>.match.json` | nei (þjappað) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | já |
| `summary` | `<match>.summary.json`, samantekt fjöldavísisins ([Fjöldagreining](mass-analysis.md)), bætt við af `tools/3dheat-summarize.mjs` | nei (þjappað) |

Taflan kemur strax á eftir manifest-inu, svo fyrsti lestur lesanda á byrjun skráarinnar nær yfir manifest-ið og staðbundna haus töflunnar í einu.

### Manifest-ið {#the-manifest}

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

| Reitur | Merking |
|---|---|
| `format` | alltaf `3dheat` |
| `format_version` | `major.minor` (hér fyrir neðan) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | hvað leikurinn er og hvað bjó hann til; `null` þar sem það er óþekkt |
| `created`, `updated` | hvenær skrifað, hvenær síðast uppfært (`updated` birtist aðeins eftir uppfærslu) |
| `roles` | hvert hlutverk að heiti fyrsta hlutar síns: fljótleg vísitala |
| `members` | allir hlutir nema manifest-ið: heildarlistinn, og sá sem lesandi treystir |
| `matches` | valfrjálst: leikirnir í íláti sem geymir fleiri en einn (hér fyrir neðan) |
| `references` | valfrjálst: skrár sem ílátið þarfnast en geymir ekki |
| `extensions` | valfrjálst: eigin lýsigögn breytanda |

Hver hluti:

| Reitur | Merking |
|---|---|
| `name` | slóð hans í ílátinu |
| `role` | til hvers hann er (hér fyrir neðan) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` eða `deflate` |
| `bytes` | stærð hans, óþjöppuð |
| `sha256` | af bætum hans, óþjöppuðum |
| `rows` | fjöldi raða töflu |
| `schema` | samningurinn sem hann fylgir, `{ "id", "version" }`: eigið `format` og `version` skjals (`heat3d-wt-replay-match` 2), `heat3d-table` fyrir töflu sem skoðunartækið les eftir `heat3d`-endanum, `heat3d-acmi-table` fyrir Tacview-verkfærið |
| `match` | í íláti með nokkrum leikjum, `matches[].id` sem hann tilheyrir |

### Gert til að vaxa {#made-to-grow}

Sniðið er ætlað að bera miklu ríkari endurspilanir en í dag án þess að brjóta það sem les það núna:

- **Útgáfur.** `format_version` er `major.minor`. Lesandi les allar minor-útgáfur af sinni major-útgáfu og hunsar hvern reit sem hann þekkir ekki. Minor hækkar þegar eitthvað er bætt við; major aðeins þegar uppsetningin breytist svo að eldri lesandi læsi hana vitlaust (hlutur ekki lengur geymdur, manifest-ið flutt út úr safninu). Samningur hvers hluta er útgefinn sér, í `schema`, svo ný taflauppsetning eða ný skjalaútgáfa þarf enga nýja útgáfu af íláti. Fyrstu ílátin sem voru skrifuð sögðu `"version": 1` í staðinn; lesendur taka það sem 1.0.
- **Hlutverk eru opin.** Hlutverk er hvaða strengur sem er. Lesendur nota þau hlutverk sem þeir þekkja og geyma hin: óþekkt hlutverk er skráð, aldrei hafnað, og `update` og `repack` bera það áfram óbreytt. Hlutverk má hafa marga hluti: nokkrar töflur (spor eininga, fjarmæling á öðrum hraða), atburði, rödd, samstillingu myndbands, tilvísanir í borð, yfirskriftir fígúra, greiningarniðurstöður. Heiti mega geyma möppur.
- **Hvaða miðill sem er.** Hluti má vera hvað sem er með miðilsgerð: Parquet, JSON, Arrow, PNG- eða JPEG-smámyndir, glTF-líkön, hljóð, hrá blobb.
- **Nokkrir leikir.** Lota eða mót getur farið í eitt ílát: `matches` listar þá (`{ "id", "map", "mode", "started", ... }`) og hver hluti nefnir sinn `match`. Skoðunartækið hleður hverjum hluta af hlutverkinu `table`.
- **Tilvísanir.** Skrár sem ílát þarfnast en geymir ekki, til dæmis borð fyrir eitt, eru skráðar í `references` með heiti og sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), svo rétta skráin er fundin og athuguð án þess að vera afrituð inn í hvern leik.
- **Viðbætur.** `extensions` geymir lýsigögn breytanda undir sínum eigin lykli, `"<vendor>/<name>": { ... }`, svo tveir breytendur rekast aldrei á og ekkert þarf að bæta við sameiginlegu reitina.
- **Uppfærsla á sínum stað.** `update` bætir við eða skiptir út hlutum án þess að endurskrifa stóru geymdu töflurnar: nýju hlutirnir og nýtt manifest eru skrifuð á eftir enda ílátsins, á eftir nýrri miðskrá. Það sem var skipt út er eftir sem óvísuð bæti þar til `repack`. Sérhver hluti og sérhver manifest-reitur, þekktur eða ekki, er geymdur. Uppfærsla sem mistekst er skorin aftur í ílátið eins og það var.

Prófanir skoðunartækisins halda því við þetta: ílát af sniði 1.7 með óþekktu hlutverki, óþekktum hlutareit, viðbót og hljóðhlut í möppu hleðst, og lifir af uppfærslu og endurpökkun með allt óskert; ílát af major 2 er hafnað.

## Skrifarar {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (skrifa, lesa, sannreyna, uppfæra, endurpakka), notað af pökkunarverkfærinu og Tacview-verkfærinu.
- Python: `container.py`, um 140 línur á venjulegu `zipfile`, sama skráin í hverjum breytanda
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), svo enginn breytandi treystir á annan. Nýr breytandi afritar hana.
- Skoðunartækið les með
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
