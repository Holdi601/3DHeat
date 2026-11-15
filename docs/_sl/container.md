---
title: "Ena datoteka za tekmo (.3dheat)"
parent: "Uvoz podatkov"
nav_order: 9
lang: "sl"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Ena datoteka za tekmo: `.3dheat`

Datoteka `.3dheat` je ena cela tekma v eni datoteki, da jo lahko kopirate, hranite ali delite. Da jo odprete, samo spustite datoteko na ploščo Vir.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Pretvorjena tekma je prej obsegala več datotek ob strani: tabelo `<tekma>.parquet`, dokument tekme `<tekma>.match.json` in spremljevalne datoteke `<tekma>.<kaj>.parquet` ([Pretvorniki hranijo vse](converters.md)). Datoteka `.3dheat` vse to hrani v eni: ena ponovitev, ena datoteka, za kopiranje, hranjenje ali deljenje.

Zasnovana je tako, da je nalaganje tisoč takih datotek enako hitro kot nalaganje posameznih tabel, in da lahko poznejši pretvorniki vanjo spravijo mnogo več, brez novega formata.

## Nalaganje ene {#loading-one}

Kjerkoli se nalaga datoteka ali mapa, se naloži tudi datoteka `.3dheat`, mapa pa lahko meša vsebnike in posamezne datoteke:

| Kje | Kaj se prebere iz vsebnika |
|---|---|
| Plošča Vir v **Toplotnem zemljevidu** (datoteke, mapa, povleci in spusti) | njegove tabele, kot da so posamezne `<tekma>.parquet` |
| **Toplotni zemljevid → Več tekem naenkrat** (Datoteke, Mapa, Dodaj mapo) | njegove tabele, prebrane na mestu z delavci nalagalnika |
| Zavihek **Tekma** (Naloži ali spusti na pogled) | dokument tekme |
| Telemetrija zavihka **Taktika** | njegove tabele |

Odprtje vsebnika prebere dva majhna dela: njegov imenik na koncu in njegov manifest na začetku; nič iz tabele se ne prebere, dokler je ne prebere nalagalnik. Spremljevalne datoteke in dokument tekme se preberejo samo, ko kaj to zahteva. Mapa, ki drži isto tekmo dvakrat, posamezno in zapakirano, jo naloži enkrat.

## Pakiranje in razpakiranje {#packing-and-unpacking}

Nove pretvorbe privzeto pišejo vsebnike: pretvornik War Thunder (`heat3d-wt-replay`), pretvornik CS2 (`heat3d_cs2 demos`) in orodje Tacview (`node tools/acmi-to-parquet.mjs`). `--loose` ohrani ločene datoteke.

Tekme, pretvorjene prej ali z drugimi orodji, se zapakirajo z:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** poišče vsako tabelo `<tekma>.parquet` v mapah z datotekami, ki ji pripadajo, in ob njih zapiše `<tekma>.3dheat`. Tekma, ki je že zapakirana, se preskoči. Vsak vsebnik se najprej v celoti prebere nazaj (sha256, velikost, CRC in noga Parquet vsakega člana), preden se zgodi karkoli drugega; posamezne datoteke se izbrišejo samo z `--delete-loose`, pri tekmi, zapakirani prej, pa samo, če so bajt za bajtom enake tistemu, kar vsebuje vsebnik. Tekma, pri kateri se je katera datoteka spremenila v zadnjih `--settle` minutah (privzeto 10), se pusti pri miru: pretvornik lahko še piše vanjo.
- **unpack** zapiše člane nazaj kot posamezne datoteke ob vsebniku.
- **update** doda ali zamenja člane, ne da bi znova pisal tabele, ki so že v vsebniku (spodaj).
- **repack** v celoti napiše vsebnik na novo in odvrže, kar so za seboj pustile posodobitve.

## Format {#the-format}

Datoteka `.3dheat` je arhiv ZIP (vsako orodje ZIP jo odpre), s temi pravili:

1. **`manifest.json` je prvi član**, kadar se vsebnik piše, in je vedno prisoten. Najde se prek središčnega imenika ZIP, zato je po `update` lahko kje kasneje v datoteki.
2. **Člani, ki se berejo po bajtnih obsegih ali so že stisnjeni, so shranjeni** (metoda ZIP 0): Parquet, Arrow, slike, modeli, zvok, video, neprozorni bloki. Shranjen član je en sosednji bajtni obseg vsebnika, zato bralnik prebere nogo tabele in njene stolpčne dele na mestu, z `File.slice` v brskalniku ali HTTP zahtevo za obseg, natanko tako kot bi prebral posamezno datoteko.
3. **Besedilo je deflatirano** (metoda 8): JSON, CSV, navadno besedilo. Ti so majhni in se berejo celi.
4. Imena so v UTF-8 (zastavica bita 11), relativna, ločena z `/`, brez `..`; lahko vsebujejo mape (`analysis/heat.json`). Posamezna datoteka, zapakirana v vsebnik, ohrani svoje ime, zato razpakiranje vrne iste datoteke.
5. Člani, večji od 4 GiB, ali vsebniki z več kot 65.535 člani uporabljajo ZIP64, kot običajno. Pisalniki ne postavijo opisnikov podatkov za člani.

Člani, ki jih pretvorniki zapisujejo danes, v tem vrstnem redu:

| Vloga | Član | Shranjen |
|---|---|---|
| `table` | `<tekma>.parquet` | da |
| `match` | `<tekma>.match.json` | ne (deflatiran) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<tekma>.<vloga>.parquet` | da |
| `summary` | `<tekma>.summary.json`, povzetek indeksa množic ([Analiza množic](mass-analysis.md)), dodan z `tools/3dheat-summarize.mjs` | ne (deflatiran) |

Tabela pride takoj za manifestom, zato prvi bralnikov prebrani kos začetka datoteke zajame manifest in lokalno glavo tabele hkrati.

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

| Polje | Pomen |
|---|---|
| `format` | vedno `3dheat` |
| `format_version` | `major.minor` (spodaj) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | kaj je tekma in kaj jo je naredilo; `null`, kjer ni znano |
| `created`, `updated` | kdaj je bila zapisana, kdaj zadnjič posodobljena (`updated` se pojavi samo po posodobitvi) |
| `roles` | vsaka vloga do imena njenega prvega člana: hitro kazalo |
| `members` | vsi člani razen manifesta: celoten seznam, in tisti, ki mu bralnik zaupa |
| `matches` | izbirno: tekme vsebnika, ki hrani več tekem (spodaj) |
| `references` | izbirno: datoteke, ki jih vsebnik potrebuje, a jih ne hrani |
| `extensions` | izbirno: lastni metapodatki pretvornika |

Vsak član:

| Polje | Pomen |
|---|---|
| `name` | njegova pot v vsebniku |
| `role` | za kaj je (spodaj) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` ali `deflate` |
| `bytes` | njegova velikost, nestisnjena |
| `sha256` | njegovih bajtov, nestisnjenih |
| `rows` | število vrstic tabele |
| `schema` | konvencija, ki ji sledi, `{ "id", "version" }`: lastni `format` in `version` dokumenta (`heat3d-wt-replay-match` 2), `heat3d-table` za tabelo, ki jo pregledovalnik bere po njeni nogi `heat3d`, `heat3d-acmi-table` za orodje Tacview |
| `match` | v vsebniku več tekem: `matches[].id`, ki mu pripada |

### Narejeno za rast {#made-to-grow}

Format je namenjen temu, da nosi veliko bogatejše ponovitve, kot so danes, brez kvara za tistega, ki jih bere zdaj:

- **Različice.** `format_version` je `major.minor`. Bralnik prebere vsako manjšo različico svoje glavne in prezre vsako polje, ki ga ne pozna. Manjša se dvigne, ko se nekaj doda; glavna samo, kadar se postavitev spremeni tako, da bi jo starejši bralnik prebral narobe (član ni več shranjen, manifest premaknjen iz arhiva). Konvencija vsakega člana ima svojo različico v `schema`, zato nova postavitev tabele ali nova različica dokumenta ne potrebuje nove različice vsebnika. Prvi zapisani vsebniki so namesto tega pisali `"version": 1`; bralniki to štejejo kot 1.0.
- **Vloge so odprte.** Vloga je poljuben niz. Bralniki uporabijo vloge, ki jih poznajo, in ohranijo ostale: neznana vloga se izpiše, nikoli zavrne, `update` in `repack` pa jo neseta nedotaknjeno naprej. Vloga je lahko imela več članov: več tabel (poti po enotah, telemetrija pri drugih hitrostih), dogodki, glas, sinhronizacija videa, reference nivojev, nadomestitve figur, rezultati analize. Imena lahko vsebujejo mape.
- **Poljubni mediji.** Član je lahko karkoli z vrsto medija: Parquet, JSON, Arrow, sličice PNG ali JPEG, modeli glTF, zvok, surovi bloki.
- **Več tekem.** Seja ali turnir lahko gre v en vsebnik: `matches` jih našteje (`{ "id", "map", "mode", "started", ... }`), vsak član pa imenuje svojo `match`. Pregledovalnik naloži vsakega člana vloge `table`.
- **Reference.** Datoteke, ki jih vsebnik potrebuje, a jih ne hrani, na primer nivo zanj, so našteta v `references` po imenu in sha256 (`{ "kind": "level", "name": "...", "sha256": "..." }`), tako da se pravo datoteko najde in preveri, ne da bi jo kopirali v vsako tekmo.
- **Razširitve.** `extensions` hrani lastne metapodatke pretvornika pod njegovim lastnim ključem, `"<dobavitelj>/<ime>": { ... }`, zato se dva pretvornika nikoli ne trčita in ni treba ničesar dodati skupnim poljem.
- **Posodabljanje na mestu.** `update` doda ali zamenja člane, ne da bi znova pisal velikih shranjenih tabel: novi člani in nov manifest se dodajo za koncem vsebnika, za njima nov središčni imenik. Kar je bilo zamenjano, ostane kot nereferencirani bajti, dokler `repack` ne pride mimo. Vsak član in vsako polje manifesta, poznano ali ne, se ohrani. Posodobitev, ki odpove, se vrne na vsebnik, kot je bil.

Testi pregledovalnika ga držijo k temu: vsebnik formata 1.7 z neznano vlogo, poljem člana, razširitvijo in zvočnim članom v mapi se naloži in preživi posodobitev ter ponovno pakiranje z vsem nedotaknjenim; vsebnik glavne različice 2 se zavrne.

## Pisalniki {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (zapis, branje, preverjanje, posodobitev, ponovno pakiranje), uporablja ga orodje za pakiranje in orodje Tacview.
- Python: `container.py`, približno 140 vrstic na standardnem `zipfile`, ista datoteka v vsakem pretvorniku
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), tako da noben pretvornik ni odvisen od drugega. Nov pretvornik datoteko kopira.
- Pregledovalnik bere z
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
