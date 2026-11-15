---
title: "Një skedar për ndeshje (.3dheat)"
parent: "Si të futni të dhënat"
nav_order: 9
lang: "sq"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Një skedar për ndeshje: `.3dheat`

Një skedar `.3dheat` është një ndeshje e tërë në një skedar, për ta kopjuar, mbajtur ose ndarë. Për ta hapur, thjesht lëshoni skedarin në panelin Burimi.

```
match.3dheat   (një skedar ZIP)
  manifest      çfarë është ndeshja, dhe lista e gjithçkaje brenda
  table         pozicionet (Parquet)
  match.json    dokumenti i ndeshjes
  sidecars      çfarë mbajti konvertuesi i plotë (ngjarje, mesazhe, ...)
```

Një ndeshje e konvertuar dikur ishte disa skedarë njëri pranë tjetrit: tabela
`<match>.parquet`, dokumenti i ndeshjes `<match>.match.json` dhe sidecar-ët
`<match>.<what>.parquet` ([Konvertuesit ruajnë gjithçka](converters.md)). Një
skedar `.3dheat` i mban të gjithë në një: një riluajtje, një skedar, për ta
kopjuar, mbajtur ose ndarë.

Është ndërtuar që ngarkimi i një mijë prej tyre të jetë po aq i shpejtë sa ngarkimi
i tabelave të lira, dhe që konvertuesit e ardhshëm të mund të vendosin shumë më tepër
në të pa një format të ri.

## Ngarkimi i një skedari {#loading-one}

Kudo ku ngarkohet një skedar ose një dosje, ngarkohet edhe një skedar `.3dheat`, dhe
një dosje mund të përzierë kontejnerë dhe skedarë të lirë:

| Ku | Çfarë lexohet nga kontejneri |
|---|---|
| Paneli Burimi i **Harta e nxehtësisë** (skedarë, dosje, lëshim me miun) | tabelat e tij, sikur të ishin `<match>.parquet` të lirë |
| **Harta e nxehtësisë → Shumë ndeshje njëherësh** (Skedarë, Dosje, Shto dosje) | tabelat e tij, të lexuara në vend nga punëtorët e ngarkuesit |
| Skeda **Ndeshja** (Ngarko, ose lëshoje mbi pamje) | dokumenti i ndeshjes |
| Tabela **Taktika** telemetria | tabelat e tij |

Hapja e një kontejneri lexon dy copa të vogla prej tij, drejtorinë e tij në fund dhe
manifestin në fillim; asgjë nga një tabelë nuk lexohet derisa ta lexojë ngarkuesi.
Sidecar-ët dhe dokumenti i ndeshjes lexohen vetëm kur kërkohen. Një dosje që mban
të njëjtën ndeshje dy herë, të lirë dhe të paketuar, e ngarkon atë një herë.

## Paketimi dhe shpaketimi {#packing-and-unpacking}

Konvertimet e reja shkruajnë kontejnerë si parazgjedhje: konvertuesi i War Thunder
(`heat3d-wt-replay`), konvertuesi i CS2 (`heat3d_cs2 demos`) dhe vegla Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` i mban skedarët e veçantë.

Ndeshjet e konvertuara më parë, ose nga vegla të tjera, paketohen me:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** gjen çdo tabelë `<match>.parquet` nën dosjet me skedarët që i takojnë dhe shkruan
  `<match>.3dheat` pranë tyre. Një ndeshje e paketuar më parë kapërcehet. Çdo kontejner
  lexohet përsëri i tërë (sha256, madhësia, CRC dhe footer-i Parquet i çdo anëtari) para
  çdo gjëje tjetër; skedarët e lirë fshihen vetëm me `--delete-loose`, dhe për një ndeshje
  të paketuar më parë vetëm kur janë bajt për bajt ajo që mban kontejneri. Një ndeshje me
  një skedar të ndryshuar në `--settle` minutat e fundit (10 si parazgjedhje) lihet
  rehat: një konvertues mund ta shkruajë ende.
- **unpack** i shkruan anëtarët prapë si skedarë të lirë pranë kontejnerit.
- **update** shton ose zëvendëson anëtarë pa rishkruar tabelat që tashmë janë në kontejner
  (më poshtë).
- **repack** rishkruan tërësisht një kontejner, duke hequr atë që lanë pas përditësimet.

## Formati {#the-format}

Një skedar `.3dheat` është një arkiv ZIP (çdo vegël ZIP e hap), me këto rregulla:

1. **`manifest.json` është anëtari i parë** kur shkruhet një kontejner, dhe është gjithmonë
   i pranishëm. Gjendet përmes drejtorisë qendrore të ZIP-it, kështu që pas një `update` mund
   të jetë më vonë në skedar.
2. **Anëtarët që lexohen me intervale bajtësh ose janë të ngjeshur tashmë ruhen** (metoda ZIP 0):
   Parquet, Arrow, imazhe, modele, audio, video, blloqe të errëta. Një anëtar i ruajtur është
   një interval bajtesh i vazhdueshëm i kontejnerit, kështu që një lexues e lexon footer-in e
   tabelës dhe copat e kolonave në vend, me `File.slice` në shfletues ose me një kërkesë HTTP
   me interval, ashtu si do ta lexonte skedarin e lirë.
3. **Teksti është i ngjeshur me deflate** (metoda 8): JSON, CSV, tekst i thjeshtë. Këto janë të
   vogla dhe lexohen të tëra.
4. Emrat janë UTF-8 (biti i flamurit 11), relativë, me `/` si ndarës, pa `..`; mund të mbajnë
   dosje (`analysis/heat.json`). Një skedar i lirë i paketuar e ruan emrin e vet, kështu që
   shpaketimi kthen të njëjtat skedarë.
5. Anëtarët më të mëdhenj se 4 GiB, ose kontejnerët me më shumë se 65,535 anëtarë, përdorin
   ZIP64 si zakonisht. Shkruesit nuk vendosin përshkrues të dhënash pas anëtarëve.

Anëtarët që shkruajnë sot konvertuesit, sipas këtij radhitjeje:

| Roli | Anëtari | I ruajtur |
|---|---|---|
| `table` | `<match>.parquet` | po |
| `match` | `<match>.match.json` | jo (i ngjeshur) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | po |
| `summary` | `<match>.summary.json`, përmbledhja e indeksit masiv ([Analiza masive](mass-analysis.md)), e shtuar nga `tools/3dheat-summarize.mjs` | jo (i ngjeshur) |

Tabela vjen menjëherë pas manifestit, kështu që leximi i parë i fillimit të skedarit
mbulon manifestin dhe kokën lokale të tabelës njëherësh.

### Manifesti {#the-manifest}

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

| Fusha | Kuptimi |
|---|---|
| `format` | gjithmonë `3dheat` |
| `format_version` | `major.minor` (më poshtë) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | çfarë është ndeshja dhe çfarë e krijoi; `null` kur nuk dihet |
| `created`, `updated` | kur u shkrua, kur u përditësua për herë të fundit (`updated` shfaqet vetëm pas një përditësimi) |
| `roles` | çdo rol te emri i anëtarit të parë: një tregues i shpejtë |
| `members` | çdo anëtar përveç manifestit: lista e plotë, dhe ajo që i beson një lexues |
| `matches` | opsionale: ndeshjet e një kontejneri që mban disa (më poshtë) |
| `references` | opsionale: skedarë që kontejneri i do, por nuk i mban |
| `extensions` | opsionale: metadatat e vetë konvertuesit |

Çdo anëtar:

| Fusha | Kuptimi |
|---|---|
| `name` | shtegu i tij në kontejner |
| `role` | për çfarë shërben (më poshtë) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ose `deflate` |
| `bytes` | madhësia e tij, e pangjeshur |
| `sha256` | e bajtave të tij, të pangjeshur |
| `rows` | numri i rreshtave të një tabele |
| `schema` | konventa që ndjek, `{ "id", "version" }`: `format` dhe `version` i vetë dokumentit (`heat3d-wt-replay-match` 2), `heat3d-table` për një tabelë që shikuesi e lexon sipas footer-it të saj `heat3d`, `heat3d-acmi-table` për atë të veglës Tacview |
| `match` | në një kontejner me disa ndeshje, `matches[].id` ku i përket |

### I krijuar për t'u rritur {#made-to-grow}

Formati synon të mbajë riluajtje shumë më të pasura se sot, pa prishur atë që i lexon
sot:

- **Versionimi.** `format_version` është `major.minor`. Një lexues lexon çdo version minor
  të major-it të vet dhe injoron çdo fushë që nuk e njeh. Minori rritet kur shtohet diçka; major-i
  vetëm kur ndryshon struktura në mënyrë që një lexues më i vjetër do ta lexonte gabim (një anëtar
  nuk ruhet më, manifesti del jashtë arkivit). Konventa e secilit anëtar versionohet veçmas, në
  `schema`-n e tij, kështu që një strukturë e re tabele ose një version i ri dokumenti nuk kërkon
  version të ri kontejneri. Kontejnerët e parë të shkruar thoshin `"version": 1` në vend të kësaj;
  lexuesit e marrin atë si 1.0.
- **Rolet janë të hapura.** Një rol është çdo varg. Lexuesit përdorin rolet që njohin dhe i mbajnë
  të tjerët: një rol i panjohur listohet, kurrë nuk refuzohet, dhe `update` dhe `repack` e mbartin
  të paprekur. Një rol mund të ketë shumë anëtarë: disa tabela (gjurmë për njësi, telemetri me
  shpejtësi të tjera), ngjarje, zë, sinkronizim videoje, referenca niveli, zëvendësime figurash,
  rezultate analizash. Emrat mund të mbajnë dosje.
- **Çdo media.** Një anëtar mund të jetë çdo gjë me një tip media: Parquet, JSON, Arrow, miniaturë
  PNG ose JPEG, modele glTF, audio, blloqe të thjeshta.
- **Disa ndeshje.** Një seancë ose një turne mund të hyjë në një kontejner: `matches` i liston
  (`{ "id", "map", "mode", "started", ... }`) dhe çdo anëtar e emëron `match`-in e vet. Shikuesi
  ngarkon çdo anëtar me rol `table`.
- **Referencat.** Skedarët që një kontejner i do, por nuk i mban - p.sh. një nivel - listohen në
  `references` me emër dhe sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), kështu
  që skedari i duhur gjendet dhe kontrollohet pa u kopjuar në çdo ndeshje.
- **Zgjerimet.** `extensions` mban metadatat e një konvertuesi nën çelësin e vet,
  `"<vendor>/<name>": { ... }`, kështu që dy konvertues nuk përplasen dhe s'duhet shtuar asgjë te
  fushat e përbashkëta.
- **Përditësim në vend.** `update` shton ose zëvendëson anëtarë pa rishkruar tabelat e mëdha të
  ruajtura: anëtarët e rinj dhe një manifest i ri shtohen pas fundit të kontejnerit, e pas tyre një
  drejtori e re qendrore. Ajo që u zëvendësua mbetet si bajte të pareferuara deri te `repack`. Çdo
  anëtar dhe çdo fushë manifesti, e njohur ose jo, ruhet. Një përditësim që dështon kthehet te
  kontejneri siç ishte.

Testet e shikuesit e mbajnë atë me këtë: një kontejner i formatit 1.7 me një rol të panjohur, një
fushë anëtari, një zgjerim dhe një anëtar audio në një dosje ngarkohet, dhe mbijeton një përditësim
dhe një repack me gjithçka të paprekur; një kontejner i major 2 refuzohet.

## Shkruesit {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (shkrim, lexim, verifikim, përditësim, repack), i përdorur nga vegla e paketimit dhe vegla Tacview.
- Python: `container.py`, rreth 140 rreshta mbi `zipfile` standarde, i njëjti skedar në çdo
  konvertues (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), kështu që asnjë
  konvertues nuk varet nga tjetri. Një konvertues i ri e kopjon atë.
- Shikuesi lexon me
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
