---
title: "Un fișier pentru fiecare meci (.3dheat)"
parent: "Încărcarea datelor"
nav_order: 9
lang: "ro"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Un fișier pentru fiecare meci: `.3dheat`

Un fișier `.3dheat` este un meci întreg într-un singur fișier, de copiat, de păstrat sau de trimis. Ca să-l deschizi, trage fișierul pe panoul Sursă.

```
match.3dheat   (un fișier ZIP)
  manifest      ce este meciul și lista a tot ce este înăuntru
  table         pozițiile (Parquet)
  match.json    documentul meciului
  sidecars      ce a păstrat întreg convertorul (evenimente, mesaje, ...)
```

Un meci convertit era înainte mai multe fișiere unul lângă altul: tabelul `<match>.parquet`, documentul meciului `<match>.match.json` și fișierele auxiliare `<match>.<what>.parquet` ([Convertoarele păstrează totul](converters.md)). Un fișier `.3dheat` le ține pe toate într-unul singur: o reluare, un fișier, de copiat, de păstrat sau de trimis.

Este construit astfel încât încărcarea a o mie de astfel de fișiere să fie la fel de rapidă ca încărcarea tabelelor separate, și astfel încât convertoarele viitoare să poată pune mult mai mult în el fără un format nou.

## Încărcarea unuia {#loading-one}

Oriunde se încarcă un fișier sau un dosar, se încarcă și un fișier `.3dheat`, iar un dosar poate amesteca containere și fișiere separate:

| Unde | Ce se citește din container |
|---|---|
| Panoul sursă al **Hărții termice** (fișiere, dosar, tragere și plasare) | tabelele lui, ca și cum ar fi `<match>.parquet` separat |
| **Hartă termică → Multe meciuri deodată** (Fișiere, Dosar, Adaugă dosar) | tabelele lui, citite pe loc de lucrătorii încărcătorului |
| Tabul **Meci** (Încarcă, sau trage pe vedere) | documentul meciului |
| Telemetria **Tablei de tactici** | tabelele lui |

Deschiderea unui container citește două piese mici din el: directorul de la final și manifestul de la început; nimic dintr-un tabel nu este citit până nu îl citește încărcătorul. Fișierele auxiliare și documentul meciului sunt citite doar când le cere ceva. Un dosar care conține același meci de două ori, separat și împachetat, îl încarcă o singură dată.

## Împachetarea și despachetarea {#packing-and-unpacking}

Conversiile noi scriu containere implicit: convertorul War Thunder (`heat3d-wt-replay`), convertorul CS2 (`heat3d_cs2 demos`) și unealta Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` păstrează fișierele separate.

Meciurile convertite înainte, sau de alte unelte, sunt împachetate cu:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** găsește sub dosare fiecare tabel `<match>.parquet` cu fișierele care îi aparțin și scrie `<match>.3dheat` lângă ele. Un meci deja împachetat este sărit. Fiecare container este citit înapoi întreg (sha256, dimensiunea, CRC și subsolul Parquet al fiecărui membru) înainte ca orice altceva să se întâmple; fișierele separate sunt șterse doar cu `--delete-loose`, iar pentru un meci împachetat mai devreme doar când sunt octet cu octet ce conține containerul. Un meci cu un fișier schimbat în ultimele `--settle` minute (implicit 10) este lăsat în pace: un convertor poate încă să-l scrie.
- **unpack** scrie membrii înapoi ca fișiere separate lângă container.
- **update** adaugă sau înlocuiește membri fără să rescrie tabelele deja din container (mai jos).
- **repack** rescrie un container întreg, lăsând deoparte ce au lăsat în urmă actualizările.

## Formatul {#the-format}

Un fișier `.3dheat` este o arhivă ZIP (orice unealtă ZIP o deschide), cu aceste reguli:

1. **`manifest.json` este primul membru** când se scrie un container și este mereu prezent. Este găsit prin directorul central ZIP, deci după un `update` poate fi mai târziu în fișier.
2. **Membrii citiți pe interval de octeți sau deja comprimați sunt stocați** (metoda ZIP 0): Parquet, Arrow, imagini, modele, audio, video, blob-uri opace. Un membru stocat este un interval continuu de octeți al containerului, deci un cititor citește subsolul unui tabel și blocurile lui de coloane pe loc, prin `File.slice` într-un browser sau o cerere cu interval HTTP, exact cum ar citi fișierul separat.
3. **Textul este comprimat cu deflate** (metoda 8): JSON, CSV, text simplu. Sunt mici și se citesc întregi.
4. Numele sunt UTF-8 (indicatorul bitului 11), relative, separate prin `/`, fără `..`; pot conține dosare (`analysis/heat.json`). Un fișier separat împachetat își păstrează numele, deci despachetarea dă înapoi aceleași fișiere.
5. Membrii mai mari de 4 GiB, sau containerele cu mai mult de 65.535 de membri, folosesc ZIP64 ca de obicei. Scriitorii nu pun descriptori de date după membri.

Membrii pe care convertoarele îi scriu astăzi, în această ordine:

| Rol | Membru | Stocat |
|---|---|---|
| `table` | `<match>.parquet` | da |
| `match` | `<match>.match.json` | nu (comprimat deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | da |
| `summary` | `<match>.summary.json`, indexul de masă al rezumatului ([Analiză de masă](mass-analysis.md)), adăugat de `tools/3dheat-summarize.mjs` | nu (comprimat deflate) |

Tabelul vine imediat după manifest, deci prima citire a cititorului de la începutul fișierului acoperă și manifestul, și antetul local al tabelului.

### Manifestul {#the-manifest}

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

| Câmp | Înseamnă |
|---|---|
| `format` | mereu `3dheat` |
| `format_version` | `major.minor` (mai jos) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | ce este meciul și ce l-a făcut; `null` unde nu se știe |
| `created`, `updated` | când a fost scris, când a fost actualizat ultima dată (`updated` apare doar după o actualizare) |
| `roles` | fiecare rol până la numele primului lui membru: un index rapid |
| `members` | fiecare membru în afară de manifest: lista completă, și cea în care are încredere un cititor |
| `matches` | opțional: meciurile unui container care ține mai multe (mai jos) |
| `references` | opțional: fișiere de care containerul are nevoie, dar pe care nu le ține |
| `extensions` | opțional: metadatele proprii ale unui convertor |

Fiecare membru:

| Câmp | Înseamnă |
|---|---|
| `name` | calea lui în container |
| `role` | la ce servește (mai jos) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` sau `deflate` |
| `bytes` | dimensiunea lui, necomprimată |
| `sha256` | al octeților lui, necomprimați |
| `rows` | numărul de rânduri al unui tabel |
| `schema` | convenția pe care o urmează, `{ "id", "version" }`: `format` și `version` proprii ale unui document (`heat3d-wt-replay-match` 2), `heat3d-table` pentru un tabel pe care vizualizatorul îl citește după subsolul lui `heat3d`, `heat3d-acmi-table` pentru cel al uneltei Tacview |
| `match` | într-un container cu mai multe meciuri, `matches[].id` căruia îi aparține |

### Făcut să crească {#made-to-grow}

Formatul este gândit să poarte reluări mult mai bogate decât cele de azi, fără să strice ce le citește acum:

- **Versiuni.** `format_version` este `major.minor`. Un cititor citește fiecare versiune minoră a majorului său și ignoră fiecare câmp pe care nu-l cunoaște. Minorul crește când se adaugă ceva; majorul doar când structura se schimbă astfel încât un cititor mai vechi ar citi-o greșit (un membru nu mai este stocat, manifestul a fost mutat în afara arhivei). Convenția fiecărui membru are propria versiune, în `schema`, deci un nou format de tabel sau o nouă versiune de document nu cer o nouă versiune de container. Primele containere scrise spuneau `"version": 1` în loc; cititorii îl iau ca 1.0.
- **Rolurile sunt deschise.** Un rol este orice șir. Cititorii folosesc rolurile pe care le cunosc și le păstrează pe celelalte: un rol necunoscut este listat, niciodată respins, iar `update` și `repack` îl duc mai departe neatins. Un rol poate avea mulți membri: mai multe tabele (trasee pe unitate, telemetrie la alte rate), evenimente, voce, sincronizare video, referințe de niveluri, suprascrieri de figuri, rezultate de analiză. Numele pot conține dosare.
- **Orice media.** Un membru poate fi orice cu un tip de media: Parquet, JSON, Arrow, miniaturi PNG sau JPEG, modele glTF, audio, blob-uri brute.
- **Mai multe meciuri.** O sesiune sau un turneu pot intra într-un singur container: `matches` le listează (`{ "id", "map", "mode", "started", ... }`) și fiecare membru numește `match`-ul lui. Vizualizatorul încarcă fiecare membru cu rolul `table`.
- **Referințe.** Fișierele de care are nevoie un container, dar pe care nu le ține, un nivel pentru unul, sunt listate în `references` după nume și sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), deci fișierul potrivit este găsit și verificat fără să fie copiat în fiecare meci.
- **Extensii.** `extensions` ține metadatele unui convertor sub propria cheie, `"<vendor>/<name>": { ... }`, deci doi convertori nu se ciocnesc niciodată și nu trebuie adăugat nimic la câmpurile comune.
- **Actualizare pe loc.** `update` adaugă sau înlocuiește membri fără să rescrie tabelele mari stocate: membrii noi și un manifest nou sunt adăugați după sfârșitul containerului, urmați de un director central nou. Ce a fost înlocuit rămâne ca octeți nereferiți până la `repack`. Fiecare membru și fiecare câmp de manifest, cunoscut sau nu, se păstrează. O actualizare care eșuează este tăiată înapoi la containerul așa cum era.

Testele vizualizatorului îl țin la aceasta: un container de format 1.7 cu un rol necunoscut, un câmp de membru, o extensie și un membru audio, într-un dosar, se încarcă și supraviețuiește unei actualizări și unui repack cu tot ce are intact; un container de major 2 este refuzat.

## Scriitorii {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (scriere, citire, verificare, actualizare, repack), folosit de unealta de împachetare și de unealta Tacview.
- Python: `container.py`, cam 140 de rânduri pe `zipfile` din biblioteca standard, același fișier în fiecare convertor
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), deci niciun convertor nu depinde de altul. Un convertor nou îl copiază.
- Vizualizatorul citește cu
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
