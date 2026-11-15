---
title: "Fajl wieħed għal kull partita (.3dheat)"
parent: "Kif tidħol id-data"
nav_order: 9
lang: "mt"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Fajl wieħed għal kull partita: `.3dheat`

Fajl `.3dheat` huwa partita sħiħa f'fajl wieħed, biex tikopjah, iżżommu jew taqsmu. Biex tiftaħ wieħed, itfa' l-fajl fuq il-panew tas-Sors.

```
match.3dheat   (fajl ZIP)
  manifest      x'inhi l-partita, u l-lista ta' kollox ġewwa
  table         il-pożizzjonijiet (Parquet)
  match.json    id-dokument tal-partita
  sidecars      dak li l-konvertitur żamm sħiħ (avvenimenti, messaġġi, ...)
```

Partita kkonvertita kienet qabel diversi fajls ħdejn xulxin: it-tabella `<match>.parquet`, id-dokument tal-partita `<match>.match.json` u s-sidecars `<match>.<what>.parquet` ([Il-konvertituri jżommu kollox](converters.md)). Fajl `.3dheat` iżomm lilhom kollha f'wieħed: replay wieħed, fajl wieħed, biex tikopjah, iżżommu jew taqsmu.

Huwa mibni b'mod li t-tagħbija ta' elf minnhom tkun mgħaġġla daqs it-tagħbija tat-tabelli mifrudin, u li konvertituri futuri jkunu jistgħu jqiegħdu iktar minn dan fih mingħajr format ġdid.

## Tagħbija wieħed {#loading-one}

Kull fejn jitgħabba fajl jew folder, fajl `.3dheat` jitgħabba wkoll, u folder jista' jħallat kontenituri u fajls mifrudin:

| Fejn | X'jinqara mill-kontenitur |
|---|---|
| Il-panew tas-**Sors** tal-Heatmap (fajls, folder, drag and drop) | it-tabelli tiegħu, bħallikieku kienu l-`<match>.parquet` mifrud |
| **Heatmap → Ħafna partiti f'daqqa** (Fajls, Folder, Żid folder) | it-tabelli tiegħu, minfuqhom mill-workers tal-loader |
| It-tab **Match** (Għabbi, jew itfa' fuq il-view) | id-dokument tal-partita |
| Il-bord **Tattika** tat-telemetrija | it-tabelli tiegħu |

Il-ftuħ ta' kontenitur jaqra żewġ biċċiet żgħar minnu, id-direttorju fl-aħħar u l-manifest fil-bidu; ebda tabella ma tinqara sakemm il-loader ma jaqrahiex. Is-sidecars u d-dokument tal-partita jinqraw biss meta xi ħaġa titolbhom. Folder li fih l-istess partita darbtejn, mifruda u mħabbla, jitgħabba darba biss.

## Ħabba u tneħħija {#packing-and-unpacking}

Konverżjonijiet ġodda jikteb kontenituri b'default: il-konvertitur tal-War Thunder (`heat3d-wt-replay`), il-konvertitur tal-CS2 (`heat3d_cs2 demos`) u l-għodda tal-Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` iżomm il-fajls mifrudin.

Partiti kkonvertiti qabel, jew minn għodod oħra, jinħabbu bil-kmand:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** isib kull tabella `<match>.parquet` fil-folders mal-fajls li jappartjenu lilha, u jikteb `<match>.3dheat` ħdejhom. Partita diġà maħbuba tinqabeż. Kull kontenitur jinqara lura kollu (sha256, daqs, CRC u footer ta' Parquet ta' kull membru) qabel ma jsir xi ħaġa oħra; il-fajls mifrudin jitħassru biss bil-`--delete-loose`, u għal partita maħbuba qabel biss meta jkunu bit-byte bit-byte dak li l-kontenitur fih. Partita b'fajl mibdul fl-aħħar `--settle` minuti (10 b'default) titħalla waħedha: konvertitur jista' għadu jikteb fuqha.
- **unpack** jikteb lura l-membri bħala fajls mifrudin ħdejn il-kontenitur.
- **update** iżid jew jibdel membri mingħajr ma jerġa' jikteb it-tabelli diġà fil-kontenitur (hawn taħt).
- **repack** jerġa' jikteb kontenitur kollu, billi jitfa' dak li l-aġġornamenti ħallew wara.

## Il-format {#the-format}

Fajl `.3dheat` huwa arkivju ZIP (kull għodda ZIP tiftaħu), b'dawn ir-regoli:

1. **`manifest.json` huwa l-ewwel membru** meta jinkiteb kontenitur, u dejjem ikun hemm. Jinstab permezz tad-direttorju ċentrali tal-ZIP, għalhekk wara `update` jista' jinsab iktar 'il quddiem fil-fajl.
2. **Membri li jinqraw b'medda ta' bytes jew diġà huma kkumpressati jinħażnu** (metodu tal-ZIP 0): Parquet, Arrow, immaġini, mudelli, awdjo, vidjo, blobs opaki. Membru maħżun huwa medda ta' bytes kontinwa waħda tal-kontenitur, għalhekk qarrej jaqra l-footer ta' tabella u l-biċċiet tal-kolonni fejn huma, permezz ta' `File.slice` fil-browser jew talba ta' medda HTTP, eżatt kif jaqra l-fajl mifrud.
3. **It-test jiġi deflated** (metodu 8): JSON, CSV, test sempliċi. Dawn huma żgħar u jinqraw kollha.
4. Ismijiet huma UTF-8 (bit tal-flag 11), relattivi, b'`/` bħala separatur, mingħajr `..`; jistgħu jkunu folders (`analysis/heat.json`). Fajl mifrud imħabbi jżomm l-isem tiegħu, għalhekk it-tneħħija tagħti lura l-istess fajls.
5. Membri akbar minn 4 GiB, jew kontenituri b'iktar minn 65,535 membru, jużaw ZIP64 kif normali. Il-kittieba ma jpoġġu l-ebda data descriptor wara membri.

Il-membri li l-konvertituri jikitbu llum, f'dan l-ordni:

| Rwol | Membru | Maħżun |
|---|---|---|
| `table` | `<match>.parquet` | iva |
| `match` | `<match>.match.json` | le (deflated) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | iva |
| `summary` | `<match>.summary.json`, is-sommarju tal-indiċi tal-massa ([Analiżi tal-massa](mass-analysis.md)), miżjud minn `tools/3dheat-summarize.mjs` | le (deflated) |

It-tabella tiġi immedjatament wara l-manifest, sabiex l-ewwel qari tal-bidu tal-fajl ikopri l-manifest u l-header lokali tat-tabella flimkien.

### Il-manifest {#the-manifest}

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

| Qasam | Tfisser |
|---|---|
| `format` | dejjem `3dheat` |
| `format_version` | `major.minor` (hawn taħt) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | x'inhi l-partita u x'għamilha; `null` fejn ma tkunx magħrufa |
| `created`, `updated` | meta nkiteb, meta nbidel l-aħħar (`updated` jidher biss wara aġġornament) |
| `roles` | kull rwol għall-isem tal-ewwel membru tiegħu: indiċi malajr |
| `members` | kull membru ħlief il-manifest: il-lista sħiħa, u dik li qarrej jafdaha |
| `matches` | fakultattiv: il-partiti ta' kontenitur li fih diversi (hawn taħt) |
| `references` | fakultattiv: fajls li l-kontenitur jeħtieġ iżda ma jżommx |
| `extensions` | fakultattiv: metadata tal-konvertitur stess |

Kull membru:

| Qasam | Tfisser |
|---|---|
| `name` | il-passaġġ tiegħu fil-kontenitur |
| `role` | għalxiex hu (hawn taħt) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` jew `deflate` |
| `bytes` | id daqsu, mhux ikkumpressat |
| `sha256` | tal-bytes tiegħu, mhux ikkumpressati |
| `rows` | l-għadd ta' ringieli ta' tabella |
| `schema` | il-konvenzjoni li jsegwi, `{ "id", "version" }`: `format` u `version` tad-dokument stess (`heat3d-wt-replay-match` 2), `heat3d-table` għal tabella li l-viewer taqra permezz tal-footer tagħha `heat3d`, `heat3d-acmi-table` għal dik tal-għodda tal-Tacview |
| `match` | f'kontenitur ta' diversi partiti, l-`matches[].id` li jappartjeni lilu |

### Imfassal biex jikber {#made-to-grow}

Il-format maħsub biex iġorr replays ferm iktar għonja minn illum mingħajr ma jkisser dak li jaqrah issa:

- **Verżjonijiet.** `format_version` huwa `major.minor`. Qarrej jaqra kull minor version tal-major tiegħu u jinjora kull qasam li ma jafux. Il-minor jitla' meta jiżdied xi ħaġa; il-major biss meta l-layout jinbidel b'mod li qarrej iktar qadim jaqrah ħażin (membru li m'għadux maħżun, il-manifest mitlub barra mill-arkivju). L-konvenzjoni ta' kull membru hija vverżjonata waħedha, fl-`schema` tiegħu, għalhekk layout ġdid tat-tabella jew verżjoni ġdida ta' dokument ma jeħtieġux verżjoni ġdida tal-kontenitur. L-ewwel kontenituri miktuba kienu jgħidu `"version": 1` minflok; il-qarrejja jaqraw dan bħala 1.0.
- **Ir-rwoli huma miftuħa.** Rwol huwa kull string. Il-qarrejja jużaw ir-rwoli li jafu u jżommu l-bqija; rwol mhux magħruf jiġi elenkat, qatt ma jiġi miċħud, u `update` u `repack` iġorruh mingħajr ma jbiddluh. Rwol jista' jkollu ħafna membri: diversi tabelli (traċċi għal kull unità, telemetrija b'rati oħra), avvenimenti, vuċi, sinkronizzazzjoni tal-vidjo, referenzi tal-livelli, override tal-figuri, riżultati tal-analiżi. Ismijiet jistgħu jkunu folders.
- **Kull midja.** Membru jista' jkun kull ħaġa b'tip ta' midja: Parquet, JSON, Arrow, thumbnails PNG jew JPEG, mudelli glTF, awdjo, blobs mhux maħdumin.
- **Diversi partiti.** Sessjoni jew torneo jista' jmur f'kontenitur wieħed: `matches` jelenkahom (`{ "id", "map", "mode", "started", ... }`) u kull membru jsemmi l-`match` tiegħu. Il-viewer jagħbi kull membru tar-rwol `table`.
- **Referenzi.** Fajls li kontenitur jeħtieġ iżda ma jżommx, bħal livell għal waħda, jitelencaw f'`references` bl-isem u s-sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), sabiex il-fajl it-tajjeb jinstab u jiġi ċċekkjat mingħajr ma jinkopja f'kull partita.
- **Estensjonijiet.** `extensions` iżomm il-metadata ta' konvertitur taħt ċavetta tiegħu stess, `"<vendor>/<name>": { ... }`, sabiex żewġ konvertituri qatt ma jaqgħu f'xulxin u ebda haġa ma tkun trid tiżdied mal-oqsma kondiviżi.
- **Aġġornament fuq post.** `update` iżid jew jibdel membri mingħajr ma jerġa' jikteb it-tabelli kbar maħżuna: il-membri l-ġodda u manifest ġdid jiżdiedu wara t-tmiem tal-kontenitur, flimkien ma' direttorju ċentrali ġdid. Dak li nbiddel jibqa' bħala bytes mhux irreferenzjati sa `repack`. Kull membru u kull qasam tal-manifest, magħruf jew le, jinżamm. Aġġornament li jfalli jirriġa' l-kontenitur kif kien.

It-testijiet tal-viewer jżommu lilu għal dan: kontenitur tal-format 1.7 b'rwol mhux magħruf, qasam ta' membru, estensjoni u membru awdjo f'folder jitgħabba, u jgħaddi minn aġġornament u repack bil-kollox sħiħ; kontenitur tal-major 2 jiġi miċħud.

## Kittieba {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (jikteb, jaqra, jiċċekkja, jaġġorna, jerġa' jikteb), użat mill-għodda tal-ħabba u mill-għodda tal-Tacview.
- Python: `container.py`, madwar 140 linja fuq `zipfile` standard, l-istess fajl f'kull konvertitur (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), għalhekk ebda konvertitur ma jiddependi minn ieħor. Konvertitur ġdid jikopjah.
- Il-viewer jaqra permezz ta'
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
