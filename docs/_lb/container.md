---
title: "Eng Datei pro Match (.3dheat)"
parent: "Daten astellen"
nav_order: 9
lang: "lb"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Eng Datei pro Match: `.3dheat`

Eng `.3dheat`-Datei ass ee ganzt Match an enger Datei, fir ze kopéieren, ze behalen oder ze deelen. Fir eng opzemaachen, zitt d'Datei einfach op de Quell-Panel.

```
match.3dheat   (eng ZIP-Datei)
  manifest      wat d'Match ass, an d'Lëscht vun allem dran
  table         d'Positiounen (Parquet)
  match.json    d'Match-Dokument
  sidecars      wat den Konverter ganz behalen huet (Eventer, Noriichten, ...)
```

Ee konvertéiert Match war fréier e puer Dateien nieft aneen: d'Tabell `<match>.parquet`, d'Match-Dokument `<match>.match.json` an d'Begleeder `<match>.<wat>.parquet` ([Konverter behalen alles](converters.md)). Eng `.3dheat`-Datei hält se all an enger: ee Replay, eng Datei, fir ze kopéieren, ze behalen oder ze deelen.

Et ass sou gebaut, datt d'Lueden vun dausend dervun sou séier ass wéi d'Lueden vun lousen Tabellen, an datt spéider Konverter vill méi dran kënne setzen, ouni e neit Format.

## Eng lueden {#loading-one}

Iwwerall, wou eng Datei oder e Dossier gelueden gëtt, lued och eng `.3dheat`-Datei, an e Dossier kann Behälter an lues Dateien mëschen:

| Wou | Wat aus dem Behälter gelies gëtt |
|---|---|
| **Heatmap**-Quell-Panel (Dateien, Dossier, Drag and Drop) | seng Tabellen, als wieren se déi lousen `<match>.parquet` |
| **Heatmap → Vill Matcher op eemol** (Dateien, Dossier, Dossier derbäisetzen) | seng Tabellen, direkt vun de Workers vum Lieser gelies |
| **Match**-Tab (Lueden, oder op d'Usiicht zéien) | d'Match-Dokument |
| **Taktik**-Board-Telemetrie | seng Tabellen |

Wann Dir en Behälter opmaacht, gi nëmmen zwee kleng Stécker gelies: säi Verzeechnes um Enn an säi Manifest um Ufank; vun enger Tabell gëtt näischt gelies, bis de Lieser se brauch. Sidecars an d'Match-Dokument ginn nëmmen gelies, wann eppes se brauch. E Dossier, dat dee selwechte Match zweemol hält, eemol lous an eemol gepackt, lued en eemol.

## Packen an auspacken {#packing-and-unpacking}

Nei Konvertéierungen schreiwen d'Behälter standardméisseg: de War-Thunder-Konverter (`heat3d-wt-replay`), de CS2-Konverter (`heat3d_cs2 demos`) an d'Tacview-Werkzeug (`node tools/acmi-to-parquet.mjs`). `--loose` hält d'getrennte Dateien.

Matcher, déi virdrun oder vun anere Werkzeuger konvertéiert goufen, packt Dir mat:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** sucht all Tabell `<match>.parquet` an de Dossiere mat de Dateien, déi dozou gehéieren, a schreift `<match>.3dheat` nieft si. E Match, dat schonn gepackt ass, gëtt iwwersprongen. All Behälter gëtt ganz zeréckgelies (dem Member seng sha256, Gréisst, CRC an de Parquet-Fouss), ier eppes anescht geschitt. Déi lousen Dateien ginn nëmmen mat `--delete-loose` geläscht; bei engem Match, dat virdrun gepackt gouf, nëmmen, wann se Byte fir Byte dat sinn, wat de Behälter hält. E Match, bei deem eng Datei an de leschte `--settle`-Minutten geännert gouf (standardméisseg 10), bleift a Rou: en Konverter schreift et vläicht nach.
- **unpack** schreift d'Member als lous Dateien nieft de Behälter zréck.
- **update** setzt Member derbäi oder ersetzt se, ouni d'Tabellen, déi schonn am Behälter sinn, nei ze schreiwen (hei drënner).
- **repack** schreift en Behälter ganz nei, a léisst dat fort, wat Updates hannerlooss hunn.

## D'Format {#the-format}

Eng `.3dheat`-Datei ass e ZIP-Archiv (all ZIP-Werkzeug mécht se op), mat dëse Reegelen:

1. **`manifest.json` ass dat éischt Member**, wann en Behälter geschriwwe gëtt, an ëmmer dobäi. Et gëtt iwwer dat ZIP-Zentralverzeechnes fonnt, also kann et nom `update` spéider an der Datei leien.
2. **Member, déi iwwer Byte-Beräich gelies ginn oder schonn komprimiert sinn, ginn gespäichert** (ZIP-Method 0): Parquet, Arrow, Biller, Modeller, Audio, Video, onduerchsichteg Blobs. E gespäichert Member ass ee zesummenhänkende Byte-Beräich vum Behälter, sou datt en Lieser d'Fouss vun enger Tabell an hir Spalte-Stécker direkt liest, mat `File.slice` am Browser oder enger HTTP-Beräich-Ufro, genau wéi hien déi lous Datei liese géif.
3. **Text gëtt deflatéiert** (Method 8): JSON, CSV, Klartext. Dat sinn kleng Dateien a si ginn ganz gelies.
4. Nimm sinn UTF-8 (Flag-Bit 11), relativ, mat `/` getrennt, ouni `..`; si kënnen Dossiere hunn (`analysis/heat.json`). E lous Datei, déi gepackt gëtt, behält hire Numm, sou datt Auspacken déiselwecht Dateie gëtt.
5. Member, déi méi grouss si wéi 4 GiB, oder Behälter mat méi wéi 65 535 Membere, benotzen ZIP64 wéi üblech. Schreiwer setzen keng Datenbeschreiwer no Membere.

D'Member, déi d'Konverter haut schreiwen, an dëser Rei:

| Roll | Member | Gespäichert |
|---|---|---|
| `table` | `<match>.parquet` | jo |
| `match` | `<match>.match.json` | nee (deflatéiert) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | jo |
| `summary` | `<match>.summary.json`, d'Zesummefassung vum Massenindex ([Massenanalys](mass-analysis.md)), dobäigesat vum `tools/3dheat-summarize.mjs` | nee (deflatéiert) |

D'Tabell kënnt direkt nom Manifest, sou datt dat éischt Liesen vum Ufank vun der Datei dat Manifest an de lokale Kapp vun der Tabell zesummen deckt.

### D'Manifest {#the-manifest}

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

| Feld | Bedeitung |
|---|---|
| `format` | ëmmer `3dheat` |
| `format_version` | `major.minor` (hei drënner) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | wat d'Match ass an wat se gemaach huet; `null`, wann et net bekannt ass |
| `created`, `updated` | wann geschriwwen, wann dat lescht Mol geännert (`updated` steet nëmmen nom engem Update) |
| `roles` | all Roll mat dem Numm vum éischte Member: en séiere Index |
| `members` | all Member ausser dem Manifest: d'ganz Lëscht, an déi, op déi e Lieser vertraut |
| `matches` | optional: d'Matcher vun engem Behälter, deen e puer hält (hei drënner) |
| `references` | optional: Dateien, déi de Behälter brauch, awer net selwer hält |
| `extensions` | optional: d'eege Metadaten vun engem Konverter |

Jidde Member:

| Feld | Bedeitung |
|---|---|
| `name` | säin Pad am Behälter |
| `role` | wat et ass (hei drënner) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` oder `deflate` |
| `bytes` | seng Gréisst, net komprimiert |
| `sha256` | vu sengen Bytes, net komprimiert |
| `rows` | d'Zuel vun de Zeilen an enger Tabell |
| `schema` | d'Konventioun, déi et follegt, `{ "id", "version" }`: d'eegent `format` an `version` vun engem Dokument (`heat3d-wt-replay-match` 2), `heat3d-table` fir eng Tabell, déi den Viewer un hirem `heat3d`-Fouss liest, `heat3d-acmi-table` fir déi vum Tacview-Werkzeug |
| `match` | an engem Behälter mat méi Matcher, d'`matches[].id`, zu deem et gehéiert |

### Gemaach fir ze wuessen {#made-to-grow}

D'Format ass dofir gemaach, datt et vill rickeg Replays dragen kann wéi haut, ouni dat ze briechen, wat et haut liest:

- **Versioun.** `format_version` ass `major.minor`. E Lieser liest all Minor-Versioun vu sengem Major a ignoréiert all Feld, dat hien net kennt. Den Minor geet an d'Luucht, wann eppes derbäikënnt; den Major nëmmen, wann de Layout sech ännert, sou datt en eeleren Lieser et falsch liest (e Member, dat net méi gespäichert ass, de Manifest, dat aus dem Archiv geréckelt gouf). All Member seng eegen Konventioun ass separat versioun, an hirem `schema`, sou datt en neit Tabellelayout oder eng nei Dokumentversioun kee neie Behälter-Version brauch. Déi éischt geschriwwene Behälter hunn stattdeem `"version": 1` gesot; Lieser huelen dat als 1.0.
- **Rollen sinn oppen.** Eng Roll ass all String. Lieser benotzen d'Rollen, déi se kennen, an hunn den Rescht: eng onbekannt Roll gëtt opgelëscht, ni ofgelehnt, a `update` an `repack` droen se onverännert weider. Eng Roll kann vill Member hunn: e puer Tabellen (Spuren pro Eenheet, Telemetrie mat anere Raten), Eventer, Stëmm, Video-Synchronisatioun, Level-Referenzen, Figuren-Iwwerschreiwungen, Analyse-Resultater. Nimm kënnen Dossiere hunn.
- **All Medien.** E Member kann alles sinn, wat e Medientyp hat: Parquet, JSON, Arrow, PNG- oder JPEG-Miniaturen, glTF-Modeller, Audio, Roh-Blobs.
- **Méi Matcher.** Eng Sessioun oder e Turnéier kann an ee Behälter goen: `matches` listt se op (`{ "id", "map", "mode", "started", ... }`), an all Member nennt säin `match`. De Viewer lued all Member mat der Roll `table`.
- **Referenzen.** Dateien, déi e Behälter brauch, awer net selwer hält - zum Beispill e Level - stinn an `references` mat Numm an sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`). Sou gëtt déi richteg Datei fonnt a kontrolléiert, ouni datt se an all Match kopéiert ginn muss.
- **Extensiounen.** `extensions` hält d'eege Metadaten vun engem Konverter ënner sengem eegene Schlëssel, `"<Hersteller>/<Numm>": { ... }`. Sou kollidéieren zwee Konverter ni, an niemools muss ee bei d'gemeinsam Felder eppes derbäisetzen.
- **Updaten an der Plaz.** `update` setzt Member derbäi oder ersetzt se, ouni déi grousse gespäicherten Tabellen nei ze schreiwen: déi neie Member an en neit Manifest kommen nom Enn vum Behälter, gefollegt vun engem neie Zentralverzeechnes. Wat ersat gouf, bleift als Bytes ouni Referenz bis `repack`. All Member an all Manifest-Feld, bekannt oder net, bleift erhalen. E Update, dee feelschléit, gëtt op de Behälter zréckgesat, wéi en virdrun war.

D'Tester vum Viewer halen en dorun: e Behälter vum Format 1.7 mat enger onbekannter Roll, engem Member-Feld, enger Extensioun an engem Audio-Member, an engem Dossier, gëtt gelueden, an iwwerlieft e Update an en Repack mat allem dran; e Behälter vum Major 2 gëtt ofgelehnt.

## Schreiwer {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (schreiwen, liesen, kontrolléieren, updaten, repacken), vum Packwerkzeug an dem Tacview-Werkzeug benotzt.
- Python: `container.py`, ongeféier 140 Zeilen op dem Standard-`zipfile`, déiselwecht Datei an all Konverter (`heat3d_ext_warthunder/container.py`,
  `heat3d_cs2/container.py`), sou datt kee Konverter vun engem anere ofhänkt. E neie Konverter kopéiert se.
- De Viewer liest mat
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
