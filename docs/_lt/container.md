---
title: "Vienas failas rungtynėms (.3dheat)"
parent: "Duomenų įkėlimas"
nav_order: 9
lang: "lt"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Vienas failas - viena rungtynės: `.3dheat`

`.3dheat` failas yra visos rungtynės viename faile, kad jį būtų galima kopijuoti, saugoti ar dalytis. Norėdami jį atidaryti, tiesiog nutempkite failą į Šaltinio skydelį.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Konvertuotos rungtynės anksčiau buvo keli failai šalia vieno kito: lentelė
`<match>.parquet`, rungtynių dokumentas `<match>.match.json` ir palydovai
`<match>.<what>.parquet` ([Konverteriai saugo viską](converters.md)). `.3dheat`
failas laiko visus juos viename: vienas pakartojimas, vienas failas, kurį galima kopijuoti, saugoti ar siųsti.

Jis sukurtas taip, kad tūkstančio tokių failų įkėlimas būtų toks pat greitas kaip laisvų lentelių, ir kad vėlesni konverteriai galėtų į jį sudėti daug daugiau
be naujo formato.

## Vieno įkėlimas {#loading-one}

Visur, kur įkeliamas failas ar aplankas, įkeliamas ir `.3dheat` failas, o aplankas gali mišti konteinerius ir laisvus failus:

| Kur | Ką skaito iš konteinerio |
|---|---|
| **Šilumos žemėlapis** šaltinio skydelis (failai, aplankas, nutempimas) | jo lentelės, lyg tai būtų laisvas `<match>.parquet` |
| **Šilumos žemėlapis → Daug rungtynių vienu metu** (Failai, Aplankas, Pridėti aplanką) | jo lentelės, skaitomos vietoje įkėlėjo darbuotojų |
| **Rungtynės** skirtukas (Įkelti arba nutempti į vaizdą) | rungtynių dokumentas |
| **Taktika** lentos telemetrija | jo lentelės |

Atidarant konteinerį, perskaitomos dvi mažos jo dalys: katalogas failo gale ir manifestas pradžioje; jokia lentelės dalis neskaitoma, kol to neprašo įkėlėjas.
Palydovai ir rungtynių dokumentas skaitomi tik tada, kai ko nors prašoma. Aplankas, kuriame ta pati rungtynės yra du kartus - laisvai ir supakuotai - įkelia jas vieną kartą.

## Pakavimas ir išpakavimas {#packing-and-unpacking}

Nauji konvertavimai pagal nutylėjimą rašo konteinerius: War Thunder konverteris
(`heat3d-wt-replay`), CS2 konverteris (`heat3d_cs2 demos`) ir Tacview įrankis
(`node tools/acmi-to-parquet.mjs`). `--loose` palieka atskirus failus.

Anksčiau konvertuotos rungtynės arba tos, kurias konvertavo kiti įrankiai, supakuojamos su:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** aplankuose randa kiekvieną lentelę `<match>.parquet` su jai priklausančiais failais ir šalia jų įrašo `<match>.3dheat`. Jau
  supakuotos rungtynės praleidžiamos. Kiekvienas konteineris perskaitomas atgal visas (kiekvieno nario sha256, dydis, CRC ir Parquet poraštė),
  prieš bet ką kita; laisvi failai ištrinami tik su `--delete-loose`, o anksčiau supakuotoms rungtynėms - tik tada, kai jie yra baitas po baito tas,
  ką laiko konteineris. Rungtynės, kurių failas pakeistas per paskutines `--settle` minutes (pagal nutylėjimą 10), paliekamos nuošalyje: konverteris
  dar gali į jas rašyti.
- **unpack** įrašo narius atgal kaip laisvus failus šalia konteinerio.
- **update** prideda ar pakeičia narius neperrašydamas jau konteineryje esančių lentelių (žemiau).
- **repack** perrašo konteinerį visą, išmesdamas tai, ką paliko atnaujinimai.

## Formatas {#the-format}

`.3dheat` failas yra ZIP archyvas (jį atidaro bet koks ZIP įrankis), su šiomis taisyklėmis:

1. **`manifest.json` yra pirmas narys**, kai konteineris rašomas, ir visada yra. Jis randamas per ZIP centrinį katalogą, todėl po `update`
   jis gali būti vėliau faile.
2. **Nariai, kurie skaitomi pagal baitų intervalą arba jau suspausti, saugomi** (ZIP metodas 0): Parquet, Arrow, paveikslėliai, modeliai,
   garsas, vaizdo įrašas, neskaidrūs blobai. Saugomas narys yra vienas vientisas baitų intervalas konteineryje, todėl skaitytuvas skaito lentelės
   poraštę ir jos stulpelių dalis vietoje, per `File.slice` naršyklėje ar HTTP intervalo užklausą, lygiai taip, kaip skaitytų laisvą failą.
3. **Tekstas suspaudžiamas** (metodas 8): JSON, CSV, paprastas tekstas. Tai maži failai, skaitomi visi.
4. Pavadinimai yra UTF-8 (1 vėliavėlės bitas 11), santykiniai, su `/` skirtukais, be `..`; jie gali turėti aplankus (`analysis/heat.json`). Supakuotas
   laisvas failas išlaiko savo pavadinimą, todėl išpakavimas grąžina tuos pačius failus.
5. Nariai, didesni nei 4 GiB, arba konteineriai su daugiau nei 65 535 nariais naudoja ZIP64, kaip įprasta. Rašytojai nariams duomenų aprašų nededa.

Šiuo metu konverteriai rašo šiuos narius, tokia tvarka:

| Vaidmuo | Narys | Saugomas |
|---|---|---|
| `table` | `<match>.parquet` | taip |
| `match` | `<match>.match.json` | ne (suspaustas) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | taip |
| `summary` | `<match>.summary.json`, masinio indekso santrauka ([Masinė analizė](mass-analysis.md)), pridedama `tools/3dheat-summarize.mjs` | ne (suspaustas) |

Lentelė eina iš karto po manifesto, todėl pirmasis skaitytuvo failo pradžios skaitymas apima ir manifestą, ir lentelės vietinę antraštę.

### Manifestas {#the-manifest}

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

| Laukas | Reikšmė |
|---|---|
| `format` | visada `3dheat` |
| `format_version` | `major.minor` (žemiau) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | kas yra rungtynės ir kas jas sukūrė; `null`, kai nežinoma |
| `created`, `updated` | kada parašyta, kada paskutinį kartą atnaujinta (`updated` atsiranda tik po atnaujinimo) |
| `roles` | kiekvienas vaidmuo iki pirmojo jo nario pavadinimo: greitas indeksas |
| `members` | visi nariai, išskyrus manifestą: pilnas sąrašas ir tas, kuriuo skaitytuvas pasitiki |
| `matches` | neprivaloma: konteinerio, laikančio kelias rungtynes, rungtynės (žemiau) |
| `references` | neprivaloma: failai, kurių konteineriui reikia, bet jis jų neturi |
| `extensions` | neprivaloma: konverterio paties metaduomenys |

Kiekvienas narys:

| Laukas | Reikšmė |
|---|---|
| `name` | jo kelias konteineryje |
| `role` | kam jis skirtas (žemiau) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` arba `deflate` |
| `bytes` | jo dydis, nesuspaustas |
| `sha256` | jo baitų, nesuspaustų |
| `rows` | lentelės eilučių skaičius |
| `schema` | konvencija, kurios laikosi, `{ "id", "version" }`: dokumento paties `format` ir `version` (`heat3d-wt-replay-match` 2), `heat3d-table` lentelei, kurią žiūryklė skaito pagal jos `heat3d` poraštę, `heat3d-acmi-table` - Tacview įrankio |
| `match` | konteineryje su keliomis rungtynėmis - `matches[].id`, kuriam jis priklauso |

### Sukurta augti {#made-to-grow}

Formatas skirtas nešti daug turtingesnius pakartojimus, nei šiandien, nesulaužant to, kas juos skaito dabar:

- **Versijavimas.** `format_version` yra `major.minor`. Skaitytuvas skaito kiekvieną savo major versijos minor versiją ir ignoruoja kiekvieną
  lauką, kurio nepažįsta. Minor padidėja, kai kas nors pridedama; major - tik tada, kai pasikeičia išdėstymas taip, kad senesnis skaitytuvas
  skaitytų jį neteisingai (narys nebesaugomas, manifestas perkeltas iš archyvo). Kiekvienos narės konvencija versijuojama atskirai, jos
  `schema` lauke, todėl nauja lentelės struktūra ar nauja dokumento versija nereikalauja naujos konteinerio versijos. Pirmieji parašyti konteineriai
  vietoj to sakė `"version": 1`; skaitytuvai tai priima kaip 1.0.
- **Vaidmenys atviri.** Vaidmuo yra bet kokia eilutė. Skaitytuvai naudoja vaidmenis, kuriuos žino, o likusius palieka: nežinomas vaidmuo išvardijamas, niekada
  neatmetamas, o `update` ir `repack` jį išsaugo nepakitusį. Vaidmuo gali turėti daug narių: kelias lenteles (kiekvieno vieneto takelius, telemetriją kitais dažniais),
  įvykius, balsą, vaizdo sinchronizavimą, lygių nuorodas, figūrų perrašymus, analizės rezultatus. Vardai gali turėti aplankus.
- **Bet kokia medija.** Narys gali būti bet kas su medijos tipu: Parquet, JSON, Arrow, PNG ar JPEG miniatiūros, glTF modeliai, garsas, neapdoroti blobai.
- **Kelios rungtynės.** Sesija ar turnyras gali tilpti viename konteineryje: `matches` jas išvardija (`{ "id", "map", "mode", "started", ... }`), o kiekvienas narys nurodo savo `match`.
  Žiūryklė įkelia kiekvieną `table` vaidmens narį.
- **Nuorodos.** Failai, kurių konteineriui reikia, bet jis jų neturi, pavyzdžiui lygis, išvardijami `references` pagal pavadinimą ir sha256
  (`{ "kind": "level", "name": "...", "sha256": "..." }`), todėl teisingas failas randamas ir patikrinamas, nekopijuojant jo į kiekvienas rungtynes.
- **Plėtiniai.** `extensions` laiko konverterio paties metaduomenis po jo paties raktu, `"<vendor>/<name>": { ... }`, todėl du konverteriai niekada nesusikerta ir
  nieko nereikia pridėti prie bendrų laukų.
- **Atnaujinimas vietoje.** `update` prideda ar pakeičia narius neperrašydamas didelių saugomų lentelių: nauji nariai ir naujas manifestas pridedami po konteinerio
  pabaigos, o po jų - naujas centrinis katalogas. Tai, kas buvo pakeista, lieka kaip nenuorodomi baitai iki `repack`. Kiekvienas narys ir kiekvienas manifesto laukas,
  žinomas ar ne, išlaikomi. Nepavykęs atnaujinimas nukerpamas atgal iki konteinerio, koks jis buvo.

Žiūryklės testai laiko jį šiam reikalavimui: 1.7 formato konteineris su nežinomu vaidmeniu, nario lauku, plėtiniu ir garso nariu aplanke įkeliamas,
ir atlaiko atnaujinimą bei repack su visu tuo nepažeistu; 2 major versijos konteineris atmetamas.

## Rašytojai {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (rašymas, skaitymas, tikrinimas, atnaujinimas, repack), naudojamas pakavimo įrankio ir Tacview įrankio.
- Python: `container.py`, apie 140 eilučių su standartiniu `zipfile`, tas pats failas kiekviename konverteryje
  (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), todėl joks konverteris nepriklauso nuo kito. Naujas konverteris jį nukopijuoja.
- Žiūryklė skaito su
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).

