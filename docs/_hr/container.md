---
title: "Jedna datoteka po utakmici (.3dheat)"
parent: "Unos podataka"
nav_order: 9
lang: "hr"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Jedna datoteka po utakmici: `.3dheat`

Datoteka `.3dheat` je jedna cijela utakmica u jednoj datoteci, za kopiranje, čuvanje ili dijeljenje. Da je otvorite, samo ispustite datoteku na panel Izvor.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Pretvorena utakmica je nekoć bila više datoteka jedna pored druge: tablica
`<match>.parquet`, dokument utakmice `<match>.match.json` i pratne datoteke
`<match>.<what>.parquet` ([Pretvarači zadržavaju sve](converters.md)). Datoteka
`.3dheat` sadrži sve njih u jednoj: jedna reprodukcija, jedna datoteka, za
kopiranje, čuvanje ili dijeljenje.

Napravljena je tako da učitavanje tisuću takvih bude jednako brzo kao učitavanje
pojedinačnih tablica, i tako da kasniji pretvarači mogu staviti u nju mnogo više
bez novog formata.

## Učitavanje jedne {#loading-one}

Gdje god se učitava datoteka ili mapa, učitava se i datoteka `.3dheat`, a mapa
može miješati spremnike i pojedinačne datoteke:

| Gdje | Što se čita iz spremnika |
|---|---|
| Panel Izvor na **Toplinskoj karti** (datoteke, mapa, povlačenje i ispuštanje) | njegove tablice, kao da su pojedinačne `<match>.parquet` |
| **Toplinska karta → Mnogo utakmica odjednom** (Datoteke, Mapa, Dodaj mapu) | njegove tablice, čitaju se na mjestu kroz radnike učitavača |
| Kartica **Meč** (Učitaj ili ispusti na prikaz) | dokument utakmice |
| Ploča **Taktika**, telemetrija | njegove tablice |

Otvaranje spremnika čita dva mala dijela: njegov direktorij na kraju i manifest
na početku. Ništa od tablice se ne čita dok ju učitavač ne pročita. Pratne datoteke
i dokument utakmice čitaju se tek kad ih nešto zatraži. Mapa koja sadrži istu
utakmicu dvaput, pojedinačno i spakiranu, učitava je jednom.

## Pakiranje i raspakiranje {#packing-and-unpacking}

Nove pretvorbe zapisuju spremnike prema zadanom: pretvarač War Thundera
(`heat3d-wt-replay`), pretvarač CS2 (`heat3d_cs2 demos`) i alat Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` zadržava zasebne datoteke.

Utakmice pretvorene ranije ili drugim alatima pakiraju se ovako:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** pronalazi svaku tablicu `<match>.parquet` unutar mapa, s datotekama koje
  joj pripadaju, i zapisuje `<match>.3dheat` pokraj njih. Utakmica koja je već
  spakirana se preskače. Svaki spremnik se prije svega ostalog pročita natrag
  cijeli (sha256, veličina, CRC i Parquet podnožje svakog člana). Pojedinačne
  datoteke brišu se samo uz `--delete-loose`, a za utakmicu spakiranu ranije
  samo ako su bajt po bajt ono što spremnik sadrži. Utakmica s datotekom
  promijenjenom u posljednjih `--settle` minuta (zadano 10) ostavlja se na miru:
  pretvarač ju možda još zapisuje.
- **unpack** zapisuje članove natrag kao pojedinačne datoteke pokraj spremnika.
- **update** dodaje ili zamjenjuje članove bez ponovnog pisanja tablica koje su već
  u spremniku (dolje).
- **repack** ponovno zapisuje spremnik cijeli, odbacujući što su ostavila ažuriranja.

## Format {#the-format}

Datoteka `.3dheat` je ZIP arhiva (svaki ZIP alat je otvara), s ovim pravilima:

1. **`manifest.json` je prvi član** kad se spremnik zapisuje i uvijek je prisutan.
   Pronalazi se kroz središnji direktorij ZIP-a, pa nakon `update` može biti
   kasnije u datoteci.
2. **Članovi koji se čitaju po rasponu bajtova ili su već komprimirani se
   pohranjuju** (ZIP metoda 0): Parquet, Arrow, slike, modeli, zvuk, video,
   neprozirni blobovi. Pohranjeni član je jedan susjedni raspon bajtova
   spremnika, pa čitač čita podnožje tablice i njezine stupce na mjestu, preko
   `File.slice` u pregledniku ili HTTP zahtjeva za raspon, točno kao što bi
   čitao pojedinačnu datoteku.
3. **Tekst je deflate-iran** (metoda 8): JSON, CSV, običan tekst. To je malo i
   čita se cijelo.
4. Imena su UTF-8 (zastavica bit 11), relativna, s `/` kao separatorom, bez `..`;
   mogu sadržavati mape (`analysis/heat.json`). Pojedinačna datoteka spakirana
   zadržava svoje ime, pa raspakiranje vraća iste datoteke.
5. Članovi veći od 4 GiB, ili spremnici s više od 65 535 članova, koriste ZIP64
   kao obično. Pisači ne stavljaju opisnike podataka iza članova.

Članovi koje pretvarači danas zapisuju, ovim redom:

| Uloga | Član | Pohranjen |
|---|---|---|
| `table` | `<match>.parquet` | da |
| `match` | `<match>.match.json` | ne (deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | da |
| `summary` | `<match>.summary.json`, sažetak indeksa mase ([Masovna analiza](mass-analysis.md)), dodaje ga `tools/3dheat-summarize.mjs` | ne (deflate) |

Tablica dolazi odmah iza manifesta, pa prvo čitanje početka datoteke čitatelja
pokriva i manifest i lokalno zaglavlje tablice.

### Manifest {#the-manifest}

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

| Polje | Značenje |
|---|---|
| `format` | uvijek `3dheat` |
| `format_version` | `glavna.manja` (dolje) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | što je utakmica i što ju je napravilo; `null` tamo gdje nije poznato |
| `created`, `updated` | kad je zapisano, kad je zadnji put ažurirano (`updated` se pojavljuje tek nakon ažuriranja) |
| `roles` | svaka uloga prema imenu njezinog prvog člana: brzi indeks |
| `members` | svaki član osim manifesta: potpuni popis, i onaj kojem čitatelj vjeruje |
| `matches` | neobavezno: utakmice spremnika koji ih sadrži više (dolje) |
| `references` | neobavezno: datoteke koje spremnik treba, ali ih ne sadrži |
| `extensions` | neobavezno: vlastiti metapodaci pretvarača |

Svaki član:

| Polje | Značenje |
|---|---|
| `name` | njegova putanja u spremniku |
| `role` | čemu služi (dolje) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ili `deflate` |
| `bytes` | njegova veličina, nekomprimirana |
| `sha256` | njegovih bajtova, nekomprimiranih |
| `rows` | broj redaka tablice |
| `schema` | konvencija koju slijedi, `{ "id", "version" }`: vlastiti `format` i `version` dokumenta (`heat3d-wt-replay-match` 2), `heat3d-table` za tablicu koju preglednik čita po njezinom podnožju `heat3d`, `heat3d-acmi-table` za alat Tacview |
| `match` | u spremniku s više utakmica, `matches[].id` kojem pripada |

### Stvoreno da raste {#made-to-grow}

Format je zamišljen da nosi mnogo bogatije reprodukcije od današnjih, bez
kvarenja onoga što ih sad čita:

- **Verzioniranje.** `format_version` je `glavna.manja`. Čitatelj čita svaku manju
  verziju svoje glavne i ignorira svako polje koje ne poznaje. Manja raste kad se
  nešto doda; glavna samo kad se raspored promijeni tako da bi stariji čitatelj
  čitao krivo (član više nije pohranjen, manifest je izmješten iz arhive). Konvencija
  svakog člana verzionira se zasebno, u njegovoj `schema`, pa nova
  tablica ili nova verzija dokumenta ne treba novu verziju spremnika. Prvi
  spremnici pisali su umjesto toga `"version": 1`; čitatelji to uzimaju kao 1.0.
- **Uloge su otvorene.** Uloga je bilo koji niz. Čitatelji koriste uloge koje
  poznaju, a ostale zadržavaju: nepoznata uloga se navodi, nikad se ne odbija, a
  `update` i `repack` je prenose nedirnutu. Uloga može imati mnogo članova: više
  tablica (tragovi po jedinici, telemetrija po drugim brzinama), događaji, glas,
  sinkronizacija videa, reference na razine, nadjačavanja figura, rezultati analize.
  Nizovi mogu sadržavati mape.
- **Bilo koji medij.** Član može biti bilo što s vrstom medija: Parquet, JSON,
  Arrow, PNG ili JPEG sličice, glTF modeli, zvuk, sirovi blobovi.
- **Više utakmica.** Sesija ili turnir može stati u jedan spremnik: `matches`
  ih navodi (`{ "id", "map", "mode", "started", ... }`), a svaki član imenuje svoj
  `match`. Preglednik učitava svakog člana uloge `table`.
- **Reference.** Datoteke koje spremnik treba, ali ih ne sadrži, na primjer razina
  za jednu utakmicu, navedene su u `references` po imenu i sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), pa se točna datoteka
  nađe i provjeri bez kopiranja u svaku utakmicu.
- **Proširenja.** `extensions` sadrži vlastite metapodatke pretvarača pod
  vlastitim ključem, `"<vendor>/<name>": { ... }`, pa se dva pretvarača nikad ne
  sudaraju i ništa ne treba dodavati zajedničkim poljima.
- **Ažuriranje na mjestu.** `update` dodaje ili zamjenjuje članove bez ponovnog
  pisanja velikih pohranjenih tablica: novi članovi i novi manifest dopisuju se
  iza kraja spremnika, pa novi središnji direktorij. Ono što je zamijenjeno
  ostaje kao nereferencirani bajtovi do `repack`. Svako polje svakog člana i
  manifesta, poznato ili ne, se zadržava. Neuspjelo ažuriranje vraća spremnik u
  stanje prije.

Testovi preglednika drže ga uz ovo: spremnik formata 1.7 s nepoznatom ulogom,
poljem člana, proširenjem i zvučnim članom u mapi se učitava i preživljava
`update` i `repack` s cijelim sadržajem; spremnik glavne verzije 2 se odbija.

## Pisači {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (zapisivanje, čitanje, provjera, ažuriranje, repack), koristi ga alat za
  pakiranje i alat Tacview.
- Python: `container.py`, oko 140 redaka na standardnom `zipfile`, ista datoteka u
  svakom pretvaraču (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), pa nijedan pretvarač ne ovisi o drugom. Novi
  pretvarač kopira tu datoteku.
- Preglednik čita pomoću
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
