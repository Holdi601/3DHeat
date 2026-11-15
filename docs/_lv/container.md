---
title: "Viens fails vienai spēlei (.3dheat)"
parent: "Datu ievade"
nav_order: 9
lang: "lv"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Viens fails vienai spēlei: `.3dheat`

Fails `.3dheat` ir viena pilna spēle vienā failā, ko var nokopēt, paturēt vai dalīties. Lai to atvērtu, vienkārši ievelciet failu panelī Avots.

```
match.3dheat   (ZIP fails)
  manifest      kas ir spēle un saraksts ar visu, kas tajā ir
  table         pozīcijas (Parquet)
  match.json    spēles dokuments
  sidecars      tas, ko konvertētājs saglabāja veselu (notikumi, ziņojumi, ...)
```

Konvertēta spēle agrāk bija vairāki blakus esoši faili: tabula `<mačs>.parquet`, spēles dokuments `<mačs>.match.json` un palīgfaili `<mačs>.<kas>.parquet` ([Konvertētāji saglabā visu](converters.md)). Fails `.3dheat` glabā visus šos vienā: viens atkārtojums, viens fails, ko var nokopēt, paturēt vai dalīties.

Tas ir veidots tā, lai tūkstoš šādu failu ielāde būtu tikpat ātra kā atsevišķu tabulu ielāde, un lai vēlākie konvertētāji varētu tajā ielikt daudz vairāk, bez jauna formāta.

## Viena ielāde {#loading-one}

Ikviena vieta, kur ielādē failu vai mapi, ielādē arī failu `.3dheat`, un mape var saturēt gan konteinerus, gan atsevišķus failus:

| Kur | Ko no konteinera nolasa |
|---|---|
| **Siltumkarte**, avota panelis (faili, mape, ievilkšana) | tā tabulas, it kā tās būtu atsevišķais `<mačs>.parquet` |
| **Siltumkarte → Daudzi mači vienlaikus** (Faili, Mape, Pievienot mapi) | tā tabulas, nolasītas uz vietas ielādētāja darbinieku ar |
| cilne **Mačs** (Ielādēt vai ievilkt skatā) | spēles dokuments |
| **Taktikas** tāfeles telemetrija | tā tabulas |

Konteinera atvēršana nolasa divas nelielas daļas: tā direktoriju beigās un manifestu sākumā. Nekas no tabulas netiek nolasīts, kamēr to nelasa ielādētājs. Palīgfaili un spēles dokuments tiek nolasīti tikai tad, kad kaut kas tos pieprasa. Mape, kurā ir tā pati spēle divreiz — atsevišķi un iepakota —, to ielādē vienreiz.

## Iepakošana un izpakošana {#packing-and-unpacking}

Jaunās konvertācijas pēc noklusējuma raksta konteinerus: War Thunder konvertētājs (`heat3d-wt-replay`), CS2 konvertētājs (`heat3d_cs2 demos`) un Tacview rīks (`node tools/acmi-to-parquet.mjs`). `--loose` atstāj atsevišķus failus.

Spēles, kas konvertētas iepriekš vai ar citiem rīkiem, tiek iepakotas ar:

```
node tools/3dheat-pack.mjs <mape>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <mape|fails.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <mape|fails.3dheat>...
node tools/3dheat-pack.mjs update <fails.3dheat> [--add <loma>[:<nosaukums>]=<fails>]... [--remove <nosaukums>]...
node tools/3dheat-pack.mjs repack <mape|fails.3dheat>...
```

- **pack** atrod katru tabulu `<mačs>.parquet` zem mapēm kopā ar failiem, kas tai pieder, un blakus tiem raksta `<mačs>.3dheat`. Spēle, kas jau ir iepakota, tiek izlaista. Katrs konteiners tiek nolasīts atpakaļ pilnā apjomā (katra dalībnieka sha256, izmērs, CRC un Parquet kājene) pirms jebkā cita. Atsevišķos failus dzēš tikai ar `--delete-loose`, un spēlei, kas iepakota agrāk, — tikai tad, ja tie ir tieši tādi paši baiti, kādi ir konteinerā. Spēli, kurā kāds fails mainīts pēdējo `--settle` minūšu laikā (pēc noklusējuma 10), atstāj nepieskartu: konvertētājs to varbūt vēl raksta.
- **unpack** ieraksta dalībniekus atpakaļ kā atsevišķus failus blakus konteineram.
- **update** pievieno vai aizstāj dalībniekus, neuzrakstot no jauna tabulas, kas jau ir konteinerā (zemāk).
- **repack** uzraksta konteineru no jauna, izmetot to, ko atstāja atjauninājumi.

## Formāts {#the-format}

Fails `.3dheat` ir ZIP arhīvs (jebkurš ZIP rīks to atver) ar šādiem noteikumiem:

1. **`manifest.json` ir pirmais dalībnieks**, kad konteiners tiek rakstīts, un tas vienmēr ir klāt. To atrod ZIP centrālajā direktorijā, tāpēc pēc `update` tas var atrasties vēlāk failā.
2. **Dalībnieki, kurus lasa pēc baitu diapazona vai kuri jau ir saspiesti, tiek glabāti** (ZIP metode 0): Parquet, Arrow, attēli, modeļi, audio, video, necaurspīdīgi bloki. Glabāts dalībnieks ir viens nepārtraukts baitu diapazons konteinerā, tāpēc lasītājs var nolasīt tabulas kājeni un tās kolonnu gabalus vietā — ar `File.slice` pārlūkprogrammā vai HTTP diapazona pieprasījumu — tieši tā, kā tas lasītu atsevišķu failu.
3. **Teksts tiek saspiests** (metode 8): JSON, CSV, vienkāršs teksts. Tie ir mazi un tiek nolasīti pilnībā.
4. Nosaukumi ir UTF-8 (karodziņš bitā 11), relatīvi, ar `/` kā atdalītāju, bez `..`; tie var saturēt mapes (`analysis/heat.json`). Iepakots atsevišķs fails paturē savu nosaukumu, tāpēc izpakošana atdod tos pašus failus.
5. Dalībnieki, lielāki par 4 GiB, vai konteineri ar vairāk nekā 65 535 dalībniekiem, izmanto ZIP64, kā parasti. Rakstītāji pēc dalībniekiem neliek datu aprakstītājus.

Dalībnieki, ko konvertētāji raksta šodien, šādā secībā:

| Loma | Dalībnieks | Glabāts |
|---|---|---|
| `table` | `<mačs>.parquet` | jā |
| `match` | `<mačs>.match.json` | nē (saspiests) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<mačs>.<loma>.parquet` | jā |
| `summary` | `<mačs>.summary.json`, masveida indeksa kopsavilkums ([Masveida analīze](mass-analysis.md)), pievienots ar `tools/3dheat-summarize.mjs` | nē (saspiests) |

Tabula nāk tieši aiz manifesta, tāpēc lasītāja pirmais nolasījums no faila sākuma aptver gan manifestu, gan tabulas lokālo galveni.

### Manifests {#the-manifest}

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

| Lauks | Nozīme |
|---|---|
| `format` | vienmēr `3dheat` |
| `format_version` | `major.minor` (zemāk) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | kas ir spēle un kas to izveidoja; `null`, ja nav zināms |
| `created`, `updated` | kad uzrakstīts, kad pēdējo reizi atjaunināts (`updated` parādās tikai pēc atjauninājuma) |
| `roles` | katra loma līdz tās pirmā dalībnieka nosaukumam: ātrs indekss |
| `members` | visi dalībnieki, izņemot manifestu: pilnais saraksts, un to lasītājs uztic |
| `matches` | neobligāts: konteinera spēles, ja tajā ir vairākas (zemāk) |
| `references` | neobligāts: faili, kas konteinerim vajadzīgi, bet tajā nav |
| `extensions` | neobligāts: konvertētāja pašu metadati |

Katrs dalībnieks:

| Lauks | Nozīme |
|---|---|
| `name` | tā ceļš konteinerā |
| `role` | kam tas paredzēts (zemāk) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` vai `deflate` |
| `bytes` | tā izmērs, nesaspiests |
| `sha256` | no tā baitiem, nesaspiests |
| `rows` | tabulas rindu skaits |
| `schema` | konvencija, ko tas ievēro, `{ "id", "version" }`: dokumenta pašu `format` un `version` (`heat3d-wt-replay-match` 2), `heat3d-table` tabulai, ko skatītājs lasa pēc tās `heat3d` kājenes, `heat3d-acmi-table` Tacview rīka tabulai |
| `match` | konteinerā ar vairākām spēlēm — `matches[].id`, kurai tas pieder |

### Veidots augšanai {#made-to-grow}

Formāts paredzēts tam, lai nest daudz bagātākus atkārtojumus, nekā šodien, nesalaužot to, kas to lasa tagad:

- **Versijas.** `format_version` ir `major.minor`. Lasītājs nolasa katru minor versiju savā major versijā un ignorē katru lauku, ko nepazīst. Minor pieaug, kad kaut kas tiek pievienots; major — tikai tad, kad izkārtojums mainās tā, ka vecāks lasītājs to lasītu nepareizi (dalībnieks vairs nav glabāts, manifests pārvietots ārpus arhīva). Katras dalībnieka konvencijas versija ir atsevišķa, `schema` laukā, tāpēc jauns tabulas izkārtojums vai jauna dokumenta versija neprasa jaunu konteinera versiju. Pirmie uzrakstītie konteineri teica `"version": 1`; lasītāji to uzskata par 1.0.
- **Lomas ir atvērtas.** Loma ir jebkura virkne. Lasītāji izmanto lomas, ko pazīst, un paturē pārējās: nezināma loma tiek uzskaitīta, nekad nenoraidīta, un `update` un `repack` to nes tālāk nemainītu. Lomai var būt daudz dalībnieku: vairākas tabulas (pa vienībām trajektorijas, telemetrija citos ātrumos), notikumi, balss, video sinhronizācija, līmeņu atsauces, figūru pārrakstījumi, analīzes rezultāti. Nosaukumi var saturēt mapes.
- **Jebkurš medijs.** Dalībnieks var būt jebkas ar mediju tipu: Parquet, JSON, Arrow, PNG vai JPEG sīkattēli, glTF modeļi, audio, neapstrādāti bloki.
- **Vairākas spēles.** Sesija vai turnīrs var iekļauties vienā konteinerā: `matches` tos uzskaita (`{ "id", "map", "mode", "started", ... }`), un katrs dalībnieks nosauc savu `match`. Skatītājs ielādē katru dalībnieku ar lomu `table`.
- **Atsauces.** Faili, kas konteinerim vajadzīgi, bet nav tajā, piemēram, līmenis, tiek uzskaitīti `references` ar nosaukumu un sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), tāpēc pareizais fails tiek atrasts un pārbaudīts, neiekopējot to katrā spēlē.
- **Paplašinājumi.** `extensions` glabā konvertētāja pašu metadatus zem sava atslēgas, `"<ražotājs>/<nosaukums>": { ... }`, tāpēc divi konvertētāji nekad nesadursies un kopīgajos laukos nav nekas jāpievieno.
- **Atjaunināšana vietā.** `update` pievieno vai aizstāj dalībniekus, neuzrakstot no jauna lielās glabātās tabulas: jaunie dalībnieki un jauns manifests tiek pievienoti konteinera beigās, kam seko jauns centrālais direktorijs. Tas, kas tika aizstāts, paliek kā neatsauktie baiti līdz `repack`. Katrs dalībnieks un katrs manifesta lauks, zināms vai nezināms, tiek saglabāts. Atjauninājums, kas neizdodas, tiek atcelts, atgriežot konteineru tādu, kāds tas bija.

Skatītāja testi to tur pie šī: konteiners formātā 1.7 ar nezināmu lomu, dalībnieka lauku, paplašinājumu un audio dalībnieku mapē tiek ielādēts, un pārdzīvo `update` un `repack` ar visu neskartu; konteiners major 2 tiek noraidīts.

## Rakstītāji {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (raksta, lasa, pārbauda, atjaunina, pārpako), to izmanto iepakošanas rīks un Tacview rīks.
- Python: `container.py`, apmēram 140 rindas uz standarta `zipfile`, tas pats fails katrā konvertētājā
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), tāpēc neviens konvertētājs nav atkarīgs no cita. Jauns konvertētājs to vienkārši nokopē.
- Skatītājs lasa ar
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
