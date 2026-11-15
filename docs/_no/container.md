---
title: "Én fil per kamp (.3dheat)"
parent: "Få inn data"
nav_order: 9
lang: "no"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Én fil per kamp: `.3dheat`

En `.3dheat`-fil er en hel kamp i én fil, som du kan kopiere, ta vare på eller dele. For å åpne en, slipp filen på Kilde-panelet.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

En konvertert kamp var tidligere flere filer ved siden av hverandre: tabellen
`<kamp>.parquet`, kampdokumentet `<kamp>.match.json` og sidefilene
`<kamp>.<hva>.parquet` ([Konvertere beholder alt](converters.md)). En
`.3dheat`-fil holder alle sammen i én: én reprise, én fil, som du kan kopiere,
ta vare på eller dele.

Den er laget slik at det å laste inn tusen av dem er like raskt som å laste inn
de løse tabellene, og slik at senere konvertere kan legge langt mer i den uten et
nytt format.

## Laste inn én {#loading-one}

Der en fil eller en mappe lastes inn, lastes også en `.3dheat`-fil, og en mappe
kan blande beholdere og løse filer:

| Hvor | Hva som leses fra beholderen |
|---|---|
| Kildepanelet i **Varmekart** (filer, mappe, dra og slipp) | tabellene, som om de var den løse `<kamp>.parquet` |
| **Varmekart → Mange kamper samtidig** (Filer, Mappe, Legg til mappe) | tabellene, leses på stedet av innleserens arbeidere |
| **Kamp**-fanen (Last inn, eller slipp på visningen) | kampdokumentet |
| **Taktikk**-tavlens telemetri | tabellene |

Å åpne en beholder leser to små deler av den: katalogen på slutten og manifestet
i starten; ingenting av en tabell leses før innleseren leser den. Sidefiler og
kampdokumentet leses bare når noe ber om dem. En mappe som holder samme kamp to
ganger, løs og pakket, laster den én gang.

## Pakke og pakke ut {#packing-and-unpacking}

Nye konverteringer skriver beholdere som standard: War Thunder-konverteren
(`heat3d-wt-replay`), CS2-konverteren (`heat3d_cs2 demos`) og Tacview-verktøyet
(`node tools/acmi-to-parquet.mjs`). `--loose` beholder de separate filene.

Kamper som ble konvertert før, eller av andre verktøy, pakkes med:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** finner hver tabell `<kamp>.parquet` under mappene, med filene som hører
  til den, og skriver `<kamp>.3dheat` ved siden av dem. En kamp som allerede er
  pakket, hoppes over. Hver beholder leses tilbake hel (hver medlems sha256,
  størrelse, CRC og Parquet-fotnote) før noe annet skjer; de løse filene slettes
  bare med `--delete-loose`, og for en kamp pakket tidligere bare når de er
  byte for byte det beholderen holder. En kamp med en fil som er endret i de
  siste `--settle`-minuttene (10 som standard), røres ikke: en konverterer kan
  fortsatt skrive på den.
- **unpack** skriver medlemmene tilbake som løse filer ved siden av beholderen.
- **update** legger til eller erstatter medlemmer uten å skrive om tabellene som
  allerede er i beholderen (under).
- **repack** skriver en beholder helt på nytt, og fjerner det oppdateringene
  etterlot seg.

## Formatet {#the-format}

En `.3dheat`-fil er et ZIP-arkiv (ethvert ZIP-verktøy åpner den), med disse reglene:

1. **`manifest.json` er det første medlemmet** når en beholder skrives, og den
   finnes alltid. Den finnes via ZIP-sentralkatalogen, så etter en `update` kan
   den ligge lenger ute i filen.
2. **Medlemmer som leses med bytesområde, eller som allerede er komprimert,
   lagres** (ZIP-metode 0): Parquet, Arrow, bilder, modeller, lyd, video, ugjennomsiktige
   blobber. Et lagret medlem er ett sammenhengende bytesområde i beholderen, så en
   leser kan lese en tabells fotnote og dens kolonnebiter på stedet, med `File.slice`
   i en nettleser eller en HTTP-forespørsel om et område, akkurat slik den ville
   lest den løse filen.
3. **Tekst er komprimert** (metode 8): JSON, CSV, ren tekst. Disse er små og leses hele.
4. Navn er UTF-8 (flaggbit 11), relative, med `/` som skilletegn, uten `..`; de
   kan holde mapper (`analysis/heat.json`). En løs fil som pakkes, beholder sitt
   eget navn, så utpakking gir tilbake de samme filene.
5. Medlemmer større enn 4 GiB, eller beholdere med mer enn 65 535 medlemmer, bruker
   ZIP64 som vanlig. Skrivere legger ingen datadeskriptorer etter medlemmer.

Medlemmene konverterne skriver i dag, i denne rekkefølgen:

| Rolle | Medlem | Lagret |
|---|---|---|
| `table` | `<kamp>.parquet` | ja |
| `match` | `<kamp>.match.json` | nei (komprimert) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<kamp>.<rolle>.parquet` | ja |
| `summary` | `<kamp>.summary.json`, massindeksens sammendrag ([Massanalyse](mass-analysis.md)), lagt til av `tools/3dheat-summarize.mjs` | nei (komprimert) |

Tabellen kommer rett etter manifestet, så leserens første lesing av filens start
dekker både manifestet og tabellens lokale overskrift.

### Manifestet {#the-manifest}

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

| Felt | Betydning |
|---|---|
| `format` | alltid `3dheat` |
| `format_version` | `hovedversjon.delversjon` (under) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | hva kampen er og hva som laget den; `null` der det er ukjent |
| `created`, `updated` | når den ble skrevet, når den sist ble oppdatert (`updated` vises bare etter en oppdatering) |
| `roles` | hver rolle til navnet på dens første medlem: en rask indeks |
| `members` | hvert medlem unntatt manifestet: hele listen, og den en leser stoler på |
| `matches` | valgfri: kampene i en beholder som holder flere (under) |
| `references` | valgfri: filer beholderen trenger, men ikke holder |
| `extensions` | valgfri: en konverters egne metadata |

Hvert medlem:

| Felt | Betydning |
|---|---|
| `name` | stien i beholderen |
| `role` | hva det er til (under) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` eller `deflate` |
| `bytes` | størrelsen, ukomprimert |
| `sha256` | av bytene, ukomprimert |
| `rows` | en tabells antall rader |
| `schema` | konvensjonen den følger, `{ "id", "version" }`: et dokuments egne `format` og `version` (`heat3d-wt-replay-match` 2), `heat3d-table` for en tabell visningsprogrammet leser etter sin `heat3d`-fotnote, `heat3d-acmi-table` for Tacview-verktøyets |
| `match` | i en beholder med flere kamper, `matches[].id` den hører til |

### Laget for å vokse {#made-to-grow}

Formatet er ment å bære langt rikere repriser enn i dag, uten å bryte det som
leser den nå:

- **Versjonering.** `format_version` er `hovedversjon.delversjon`. En leser leser
  hver delversjon av sin hovedversjon og ignorerer hvert felt den ikke kjenner.
  Delversjonen går opp når noe legges til; hovedversjonen bare når oppsettet endres
  slik at en eldre leser ville lest det feil (et medlem som ikke lenger er lagret,
  manifestet flyttet ut av arkivet). Hvert medlems egen konvensjon er versjonert
  for seg, i `schema`, så et nytt tabelloppsett eller en ny dokumentversjon trenger
  ingen ny beholderversjon. De første beholderne som ble skrevet, sa
  `"version": 1` i stedet; lesere tar det som 1.0.
- **Roller er åpne.** En rolle er en hvilken som helst streng. Lesere bruker rollene
  de kjenner og beholder resten: en ukjent rolle listes, aldri avvist, og `update`
  og `repack` tar den med urørt. En rolle kan ha mange medlemmer: flere tabeller
  (spor per enhet, telemetri med andre hastigheter), hendelser, tale, videosynk,
  banereferanser, figurerstatninger, analyseresultater. Navn kan holde mapper.
- **Alle medier.** Et medlem kan være hva som helst med en medietype: Parquet, JSON,
  Arrow, PNG- eller JPEG-miniatyrbilder, glTF-modeller, lyd, rene blobber.
- **Flere kamper.** En økt eller en turnering kan gå i én beholder: `matches` lister
  dem (`{ "id", "map", "mode", "started", ... }`), og hvert medlem nevner sin
  `match`. Visningsprogrammet laster hvert medlem med rollen `table`.
- **Referanser.** Filer en beholder trenger, men ikke holder, for eksempel en bane,
  listes i `references` med navn og sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), så riktig fil finnes og
  kontrolleres uten å kopieres inn i hver kamp.
- **Utvidelser.** `extensions` holder en konverters egne metadata under sin egen
  nøkkel, `"<leverandør>/<navn>": { ... }`, så to konvertere aldri kolliderer, og
  ingenting må legges til de delte feltene.
- **Oppdatering på stedet.** `update` legger til eller erstatter medlemmer uten å
  skrive om de store lagrede tabellene: de nye medlemmene og et nytt manifest
  legges etter beholderens slutt, fulgt av en ny sentralkatalog. Det som ble erstattet,
  blir liggende som ureferte bytes til `repack`. Hvert medlem og hvert manifestfelt,
  kjent eller ukjent, beholdes. En oppdatering som mislykkes, kuttes tilbake til
  beholderen slik den var.

Visningsprogrammets tester holder den til dette: en beholder i format 1.7 med en ukjent rolle,
et medlemsfelt, en utvidelse og et lydmedlem i en mappe lastes, og overlever en
oppdatering og en repack med alt intakt; en beholder med hovedversjon 2 avvises.

## Skrivere {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (skriv, les, verifiser, oppdater, repack), brukt av pakkeverktøyet og Tacview-verktøyet.
- Python: `container.py`, rundt 140 linjer på standard `zipfile`, den samme filen i hver
  konverter (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), så ingen
  konverter avhenger av en annen. En ny konverter kopierer den.
- Visningsprogrammet leser med
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
