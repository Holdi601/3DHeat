---
title: "Jedna datoteka po meču (.3dheat)"
parent: "Unos podataka"
nav_order: 9
lang: "bs"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Jedna datoteka po meču: `.3dheat`

Datoteka `.3dheat` je jedan cijeli meč u jednoj datoteci, za kopiranje, čuvanje ili dijeljenje. Da je otvorite, samo prevucite datoteku na panel Izvor.

```
match.3dheat   (ZIP datoteka)
  manifest      šta je meč, i spisak svega unutra
  table         pozicije (Parquet)
  match.json    dokument meča
  sidecars      šta je konverter sačuvao cijelo (događaji, poruke, ...)
```

Konvertovani meč je nekada bio nekoliko datoteka jedna uz drugu: tabela
`<match>.parquet`, dokument meča `<match>.match.json` i pomoćne datoteke
`<match>.<šta>.parquet` ([Konverteri zadržavaju sve](converters.md)). Datoteka
`.3dheat` sadrži sve njih u jednoj: jedna reprodukcija, jedna datoteka, za
kopiranje, čuvanje ili dijeljenje.

Napravljena je tako da učitavanje hiljadu njih bude jednako brzo kao učitavanje
pojedinačnih tabela, i tako da kasniji konverteri mogu u nju staviti mnogo više
bez novog formata.

## Učitavanje jedne {#loading-one}

Svuda gdje se učitava datoteka ili mapa, učitava se i datoteka `.3dheat`, a mapa
može miješati kontejnere i pojedinačne datoteke:

| Gdje | Šta se čita iz kontejnera |
|---|---|
| Panel Izvor u **Toplotnoj mapi** (datoteke, mapa, prevlačenje) | njegove tabele, kao da su pojedinačne `<match>.parquet` |
| **Toplotna mapa → Mnogo mečeva odjednom** (Datoteke, Mapa, Dodaj mapu) | njegove tabele, čitaju se na mjestu od strane radnika učitavača |
| Kartica **Meč** (Učitaj, ili prevucite na prikaz) | dokument meča |
| Telemetrija na **tabli Taktika** | njegove tabele |

Otvaranje kontejnera čita dva mala dijela iz njega: njegov direktorijum na kraju
i njegov manifest na početku; ništa iz tabele se ne čita dok učitavač ne zatraži.
Pomoćne datoteke i dokument meča se čitaju samo kada ih nešto zatraži. Mapa koja
sadrži isti meč dva puta, pojedinačno i spakovano, učitava ga jednom.

## Pakovanje i raspakivanje {#packing-and-unpacking}

Nove konverzije po podrazumijevanoj vrijednosti upisuju kontejnere: konverter War
Thunder (`heat3d-wt-replay`), konverter CS2 (`heat3d_cs2 demos`) i alat za Tacview
(`node tools/acmi-to-parquet.mjs`). `--loose` zadržava zasebne datoteke.

Mečevi konvertovani ranije, ili drugim alatima, pakuju se ovako:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** pronalazi svaku tabelu `<match>.parquet` u mapama, s datotekama koje
  joj pripadaju, i upisuje `<match>.3dheat` pored njih. Meč koji je već spakovan
  se preskače. Svaki kontejner se prvo cijel ponovo pročita (sha256, veličina,
  CRC i podnožje Parquet-a svakog člana) prije bilo čega drugog; pojedinačne
  datoteke se brišu samo uz `--delete-loose`, a za meč spakovan ranije samo kada
  su bajt po bajt ono što kontejner sadrži. Meč s datotekom promijenjenom u
  posljednjih `--settle` minuta (podrazumijevano 10) se ostavlja netaknut: konverter
  je možda još piše.
- **unpack** upisuje članove nazad kao pojedinačne datoteke pored kontejnera.
- **update** dodaje ili zamjenjuje članove bez ponovnog pisanja tabela koje su već
  u kontejneru (ispod).
- **repack** ponovo piše kontejner cijel, odbacujući ono što su ostavila ažuriranja.

## Format {#the-format}

Datoteka `.3dheat` je ZIP arhiva (svaki ZIP alat je otvara), uz ova pravila:

1. **`manifest.json` je prvi član** kada se kontejner piše, i uvijek je prisutan.
   Nalazi se preko ZIP središnjeg direktorijuma, pa nakon `update` može biti kasnije
   u datoteci.
2. **Članovi koji se čitaju po opsegu bajtova ili su već komprimovani se čuvaju**
   (ZIP metoda 0): Parquet, Arrow, slike, modeli, zvuk, video, neprozirni blobovi.
   Sačuvani član je jedan neprekidan opseg bajtova kontejnera, pa čitač čita
   podnožje tabele i njene kolonske dijelove na mjestu, preko `File.slice` u
   pregledaču ili HTTP zahtjeva za opseg, tačno kao što bi čitao pojedinačnu
   datoteku.
3. **Tekst je deflate-ovan** (metoda 8): JSON, CSV, obični tekst. Ovo su mali
   podaci i čitaju se cijeli.
4. Nazivi su UTF-8 (bit zastavice 11), relativni, odvojeni s `/`, bez `..`; mogu
   sadržavati mape (`analysis/heat.json`). Pojedinačna datoteka spakovana zadržava
   svoj naziv, pa raspakivanje vraća iste datoteke.
5. Članovi veći od 4 GiB, ili kontejneri s više od 65.535 članova, koriste ZIP64
   kao obično. Pisači ne stavljaju opisnike podataka iza članova.

Članovi koje konverteri danas pišu, ovim redom:

| Uloga | Član | Sačuvan |
|---|---|---|
| `table` | `<match>.parquet` | da |
| `match` | `<match>.match.json` | ne (deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | da |
| `summary` | `<match>.summary.json`, sažetak indeksa mase ([Masovna analiza](mass-analysis.md)), dodaje ga `tools/3dheat-summarize.mjs` | ne (deflate) |

Tabela dolazi odmah poslije manifesta, pa prvo čitanje početka datoteke pokriva
i manifest i lokalno zaglavlje tabele.

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
| `format_version` | `major.minor` (ispod) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | šta je meč i šta ga je napravilo; `null` gdje nije poznato |
| `created`, `updated` | kada je napisano, kada je zadnji put ažurirano (`updated` se pojavljuje tek nakon ažuriranja) |
| `roles` | svaka uloga do naziva njenog prvog člana: brzi indeks |
| `members` | svaki član osim manifesta: potpun spisak, i onaj kome čitač vjeruje |
| `matches` | neobavezno: mečevi kontejnera koji sadrži više njih (ispod) |
| `references` | neobavezno: datoteke koje kontejneru trebaju, ali ih ne sadrži |
| `extensions` | neobavezno: sopstveni metapodaci konvertera |

Svaki član:

| Polje | Značenje |
|---|---|
| `name` | njegova putanja u kontejneru |
| `role` | čemu služi (ispod) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ili `deflate` |
| `bytes` | njegova veličina, nekomprimovana |
| `sha256` | njegovih bajtova, nekomprimovanih |
| `rows` | broj redova tabele |
| `schema` | konvencija koju slijedi, `{ "id", "version" }`: sopstveni `format` i `version` dokumenta (`heat3d-wt-replay-match` 2), `heat3d-table` za tabelu koju pregledač čita po svom `heat3d` podnožju, `heat3d-acmi-table` za onu iz alata za Tacview |
| `match` | u kontejneru više mečeva, `matches[].id` kojem pripada |

### Napravljeno da raste {#made-to-grow}

Format je namijenjen da nosi mnogo bogatije reprodukcije od današnjih, bez
kvarenja onoga što ih čita sada:

- **Verzionisanje.** `format_version` je `major.minor`. Čitač čita svaku manju
  verziju svog glavnog broja i ignoriše svako polje koje ne poznaje. Manji broj
  raste kada se nešto doda; glavni samo kada se raspored promijeni tako da bi ga
  stariji čitač pogrešno pročitao (član više nije sačuvan, manifest je premješten
  izvan arhive). Konvencija svakog člana se verzioniše zasebno, u njegovoj
  `schema`, pa nova šema tabele ili nova verzija dokumenta ne traži novu verziju
  kontejnera. Prvi kontejneri su pisali `"version": 1`; čitači to tumače kao 1.0.
- **Uloge su otvorene.** Uloga je bilo koji string. Čitači koriste uloge koje
  poznaju i zadržavaju ostale: nepoznata uloga se navodi, nikada se ne odbija, a
  `update` i `repack` je nose netaknutu. Uloga može imati mnogo članova: nekoliko
  tabela (staze po jedinici, telemetrija drugim brzinama), događaji, glas,
  sinhronizacija videa, reference nivoa, zamjene figura, rezultati analize. Nazivi
  mogu sadržavati mape.
- **Bilo koji medij.** Član može biti bilo šta s tipom medija: Parquet, JSON, Arrow,
  PNG ili JPEG sličice, glTF modeli, zvuk, sirovi blobovi.
- **Više mečeva.** Sesija ili turnir mogu ići u jedan kontejner: `matches` ih
  navodi (`{ "id", "map", "mode", "started", ... }`), a svaki član navodi svoj
  `match`. Pregledač učitava svakog člana uloge `table`.
- **Reference.** Datoteke koje kontejneru trebaju, ali ih ne sadrži, na primjer
  nivo za jedan meč, navedene su u `references` po nazivu i sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), pa se prava datoteka
  nađe i provjeri bez kopiranja u svaki meč.
- **Proširenja.** `extensions` sadrži sopstvene metapodatke konvertera pod
  sopstvenim ključem, `"<vendor>/<name>": { ... }`, pa se dva konvertera nikada ne
  sudaraju i ništa se ne mora dodavati zajedničkim poljima.
- **Ažuriranje na mjestu.** `update` dodaje ili zamjenjuje članove bez ponovnog
  pisanja velikih sačuvanih tabela: novi članovi i novi manifest se dopisuju iza
  kraja kontejnera, a zatim novi središnji direktorijum. Ono što je zamijenjeno ostaje
  kao nereferencirani bajtovi do `repack`. Svaki član i svako polje manifesta, poznato
  ili ne, se čuva. Ažuriranje koje ne uspije vraća kontejner na stanje prije.

Testovi pregledača ga drže uz ovo: kontejner formata 1.7 s nepoznatom ulogom,
poljem člana, proširenjem i zvučnim članom u mapi se učitava, i preživljava
ažuriranje i repack sa svime netaknutim; kontejner glavnog broja 2 se odbija.

## Pisci {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (pisanje, čitanje, provjera, ažuriranje, repack), koristi ga alat za pakovanje i
  alat za Tacview.
- Python: `container.py`, oko 140 redova na standardnom `zipfile`, ista datoteka u
  svakom konverteru (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), pa nijedan konverter ne zavisi od drugog. Novi
  konverter je kopira.
- Pregledač čita preko
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
