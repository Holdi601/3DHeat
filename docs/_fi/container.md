---
title: "Yksi tiedosto ottelua kohden (.3dheat)"
parent: "Datan lataaminen"
nav_order: 9
lang: "fi"
source: "container.md"
source_hash: "bdf4922883df"
translated: true
outdated: false
---

# Yksi tiedosto ottelua kohden: `.3dheat`

`.3dheat`-tiedosto on koko ottelu yhdessä tiedostossa. Sen voi kopioida, säilyttää tai jakaa. Avaa se pudottamalla tiedosto Lähde-paneeliin.

```
match.3dheat   (a ZIP file)
  manifest      what the match is, and the list of everything inside
  table         the positions (Parquet)
  match.json    the match document
  sidecars      what the converter kept whole (events, messages, ...)
```

Muunnettu ottelu oli aiemmin useita tiedostoja vierekkäin. Ne olivat taulukko `<match>.parquet`, ottelun asiakirja `<match>.match.json` ja sivutiedostot `<match>.<what>.parquet` ([Muuntimet säilyttävät kaiken](converters.md)). `.3dheat`-tiedosto sisältää kaikki yhdessä. Yksi toisto on yksi tiedosto, jonka voi kopioida, säilyttää tai jakaa.

Se on suunniteltu niin, että tuhannen tällaisen lataaminen on yhtä nopeaa kuin irrallisten taulukoiden lataaminen. Lisäksi myöhemmät muuntimet voivat laittaa siihen paljon enemmän ilman uutta muotoa.

## Yhden lataaminen {#loading-one}

Missä tahansa tiedosto tai kansio ladataan, myös `.3dheat`-tiedosto latautuu. Kansio voi sekoittaa säiliöitä ja irrallisia tiedostoja:

| Missä | Mitä säiliöstä luetaan |
|---|---|
| **Lämpökartta**-lähdepaneeli (tiedostot, kansio, vetäminen ja pudottaminen) | sen taulukot, aivan kuin ne olisivat irrallisia `<match>.parquet`-tiedostoja |
| **Lämpökartta → Monta ottelua kerralla** (Tiedostot, Kansio, Lisää kansio) | sen taulukot, luettuna paikan päältä latauksen työntekijöillä |
| **Ottelu**-välilehti (Lataa, tai pudota näkymään) | ottelun asiakirja |
| **Taktiikka**-taulun telemetria | sen taulukot |

Säiliön avaaminen lukee siitä kaksi pientä osaa: hakemiston lopusta ja manifestin alusta. Taulukosta ei lueta mitään, ennen kuin lataaja lukee sen. Sivutiedostot ja ottelun asiakirja luetaan vain, kun joku niitä pyytää. Kansio, jossa sama ottelu on kahdesti, irrallisena ja pakattuna, ladataan vain kerran.

## Pakkaaminen ja purkaminen {#packing-and-unpacking}

Uudet muunnokset kirjoittavat säiliöitä oletuksena. Näin tekevät War Thunderin muunnin (`heat3d-wt-replay`), CS2-muunnin (`heat3d_cs2 demos`) ja Tacview-työkalu (`node tools/acmi-to-parquet.mjs`). `--loose` pitää erilliset tiedostot.

Aiemmin tai muilla työkaluilla muunnetut ottelut pakataan näin:

```
node tools/3dheat-pack.mjs <folder>... [--delete-loose] [--jobs N] [--settle MIN]
node tools/3dheat-pack.mjs unpack <folder|file.3dheat>... [--delete-container]
node tools/3dheat-pack.mjs verify <folder|file.3dheat>...
node tools/3dheat-pack.mjs update <file.3dheat> [--add <role>[:<name>]=<file>]... [--remove <name>]...
node tools/3dheat-pack.mjs repack <folder|file.3dheat>...
```

- **pack** etsii kansioista jokaisen taulukon `<match>.parquet`, ja siihen kuuluvat tiedostot. Se kirjoittaa `<match>.3dheat`-tiedoston niiden viereen. Jo pakattu ottelu ohitetaan. Jokainen säiliö luetaan takaisin kokonaan (jokaisen jäsenen sha256, koko, CRC ja Parquet-alatunniste), ennen kuin mitään muuta tapahtuu. Irralliset tiedostot poistetaan vain valinnalla `--delete-loose`. Aiemmin pakatun ottelun kohdalla ne poistetaan vain, jos ne ovat tavu tavulta sitä, mitä säiliö sisältää. Ottelu, jonka tiedostoa on muutettu viimeisten `--settle`-minuuttien aikana (oletus 10), jätetään rauhaan. Muunnin voi vielä kirjoittaa sitä.
- **unpack** kirjoittaa jäsenet takaisin irrallisina tiedostoina säiliön viereen.
- **update** lisää tai korvaa jäseniä kirjoittamatta uudelleen taulukoita, jotka ovat jo säiliössä (alla).
- **repack** kirjoittaa säiliön kokonaan uudelleen ja pudottaa pois sen, minkä päivitykset jättivät jälkeensä.

## Muoto {#the-format}

`.3dheat`-tiedosto on ZIP-arkisto. Minkä tahansa ZIP-työkalun voi avata. Sille pätevät seuraavat säännöt:

1. **`manifest.json` on ensimmäinen jäsen**, kun säiliö kirjoitetaan. Se on aina mukana. Sen löytää ZIP-hakemistosta, joten päivityksen jälkeen se voi olla myöhemmin tiedostossa.
2. **Jäsenet, joita luetaan tavualueittain tai jotka on jo pakattu, tallennetaan** (ZIP-menetelmä 0): Parquet, Arrow, kuvat, mallit, ääni, video ja läpinäkymättömät datalohkot. Tallennettu jäsen on yksi yhtenäinen tavualue säiliössä. Lukija lukee taulukon alatunnisteen ja sarakepalat paikallaan, `File.slice`-funktiolla selaimessa tai HTTP-alueepyynnöllä. Se lukee sen täsmälleen samalla tavalla kuin irrallisen tiedoston.
3. **Teksti pakataan deflate-menetelmällä** (menetelmä 8): JSON, CSV ja tavallinen teksti. Ne ovat pieniä ja luetaan kokonaan.
4. Nimet ovat UTF-8-koodattuja (liput-bitti 11), suhteellisia ja `/`-erotettuja, eikä niissä ole `..`-osia. Ne voivat sisältää kansioita (`analysis/heat.json`). Pakattu irrallinen tiedosto säilyttää oman nimensä, joten purku palauttaa samat tiedostot.
5. Yli 4 GiB:n jäsenet tai yli 65 535 jäsenen säiliöt käyttävät ZIP64:ää kuten tavallisesti. Kirjoittajat eivät lisää datakuvaajia jäsenten perään.

Muuntimien kirjoittamat jäsenet tässä järjestyksessä:

| Rooli | Jäsen | Tallennettu |
|---|---|---|
| `table` | `<match>.parquet` | kyllä |
| `match` | `<match>.match.json` | ei (deflate) |
| `messages`, `flight`, `events`, `effects`, `objectives`, `packets`, `props`, `strings`, ... | `<match>.<role>.parquet` | kyllä |
| `summary` | `<match>.summary.json`, massa-indeksin yhteenveto ([Massa-analyysi](mass-analysis.md)), lisätty `tools/3dheat-summarize.mjs`-työkalulla | ei (deflate) |

Taulukko tulee heti manifestin jälkeen. Lukijan ensimmäinen luku tiedoston alusta kattaa siis sekä manifestin että taulukon paikallisen otsikon.

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

| Kenttä | Merkitys |
|---|---|
| `format` | aina `3dheat` |
| `format_version` | `major.minor` (alla) |
| `game`, `source`, `converter`, `match`, `map`, `mode`, `started` | mikä ottelu on ja mikä sen teki. `null`, kun tieto puuttuu |
| `created`, `updated` | milloin kirjoitettiin, milloin päivitettiin viimeksi (`updated` tulee näkyviin vain päivityksen jälkeen) |
| `roles` | jokainen rooli ensimmäisen jäsenensä nimeen. Nopea hakemisto |
| `members` | jokainen jäsen manifestia lukuun ottamatta. Täysi luettelo, ja se on se, mihin lukija luottaa |
| `matches` | valinnainen: useita otteluita sisältävän säiliön ottelut (alla) |
| `references` | valinnainen: tiedostot, joita säiliö tarvitsee mutta ei sisällä |
| `extensions` | valinnainen: muuntimen oma metatieto |

Jokainen jäsen:

| Kenttä | Merkitys |
|---|---|
| `name` | sen polku säiliössä |
| `role` | mihin se on tarkoitettu (alla) |
| `media_type` | `application/vnd.apache.parquet`, `application/json`, `image/png`, `model/gltf-binary`, `audio/ogg`, `application/octet-stream`, ... |
| `compression` | `stored` tai `deflate` |
| `bytes` | sen koko pakkaamattomana |
| `sha256` | sen tavujen tiiviste pakkaamattomana |
| `rows` | taulukon rivimäärä |
| `schema` | noudatettava käytäntö, `{ "id", "version" }`. Asiakirjalla on oma `format` ja `version` (`heat3d-wt-replay-match` 2). `heat3d-table` on taulukko, jonka katselin lukee `heat3d`-alatunnisteensa perusteella. `heat3d-acmi-table` on Tacview-työkalun taulukko |
| `match` | useita otteluita sisältävässä säiliössä `matches[].id`, johon se kuuluu |

### Tehty kasvamaan {#made-to-grow}

Muoto on tarkoitettu kantamaan paljon rikkaampia toistoja kuin nykyiset, rikkomatta sitä, mikä lukee niitä jo nyt:

- **Versiointi.** `format_version` on `major.minor`. Lukija lukee jokaisen oman major-versionsa minor-version ja ohittaa jokaisen kentän, jota se ei tunne. Minor kasvaa, kun jotakin lisätään. Major kasvaa vain, kun asettelu muuttuu niin, että vanhempi lukija lukisi sen väärin. Esimerkkejä ovat jäsen, jota ei enää tallenneta, tai manifesti, joka on siirretty arkiston ulkopuolelle. Jokaisen jäsenen oma käytäntö on versioitu erikseen sen `schema`-kentässä. Uusi taulukkoasettelu tai uusi asiakirjaversio ei siis vaadi uutta säiliöversiota. Ensimmäiset kirjoitetut säiliöt sanoivat sen sijaan `"version": 1`. Lukijat ottavat sen arvona 1.0.
- **Roolit ovat avoimia.** Rooli on mikä tahansa merkkijono. Lukijat käyttävät tuntemiaan rooleja ja säilyttävät muut. Tuntematon rooli listataan, sitä ei koskaan hylätä. `update` ja `repack` kuljettavat sen mukanaan koskemattomana. Roolilla voi olla monta jäsentä: useita taulukoita (yksikkökohtaisia ratoja, telemetriaa muilla nopeuksilla), tapahtumia, puhetta, videon synkronointia, kenttäviitteitä, hahmojen ohituksia ja analyysituloksia. Nimet voivat sisältää kansioita.
- **Mikä tahansa media.** Jäsen voi olla mitä tahansa, jolla on mediatyyppi: Parquet, JSON, Arrow, PNG- tai JPEG-pikkukuvat, glTF-mallit, ääni tai raakadatalohkot.
- **Useita otteluita.** Istunto tai turnaus voi mahtua yhteen säiliöön. `matches` luettelee ne (`{ "id", "map", "mode", "started", ... }`), ja jokainen jäsen nimeää oman `match`-kenttänsä. Katselin lataa jokaisen roolin `table` jäsenen.
- **Viitteet.** Tiedostot, joita säiliö tarvitsee mutta ei sisällä, esimerkiksi yhden ottelun kenttä, luetellaan kohdassa `references` nimellä ja sha256:lla (`{ "kind": "level", "name": "...", "sha256": "..." }`). Oikea tiedosto löytyy ja se tarkistetaan, eikä sitä kopioida jokaiseen otteluun.
- **Laajennukset.** `extensions` sisältää muuntimen oman metatiedon omassa avaimessaan, `"<vendor>/<name>": { ... }`. Kaksi muunninta ei siis koskaan törmää, eikä jaettuihin kenttiin tarvitse lisätä mitään.
- **Päivitys paikallaan.** `update` lisää tai korvaa jäseniä kirjoittamatta uudelleen isoja tallennettuja taulukoita. Uudet jäsenet ja uusi manifesti lisätään säiliön loppuun, ja niiden perään tulee uusi hakemisto. Korvattu jää jäljelle viittaamattomina tavuina, kunnes `repack` poistaa ne. Jokainen jäsen ja jokainen manifestin kenttä säilyy, tunnettu tai tuntematon. Epäonnistunut päivitys leikataan takaisin siihen säiliöön, jona se oli.

Katselimen testit varmistavat tämän. Muodon 1.7 säiliö, jossa on tuntematon rooli, jäsenkenttä, laajennus ja äänijäsen kansiossa, latautuu. Se säilyy päivityksessä ja uudelleenpakkauksessa kokonaan. Major-version 2 säiliö hylätään.

## Kirjoittajat {#writers}

- Node: [`tools/container.mjs`](https://github.com/Holdi601/3DHeat/blob/main/tools/container.mjs)
  (kirjoitus, lukeminen, tarkistus, päivitys ja uudelleenpakkaus). Sitä käyttävät pakkaustyökalu ja Tacview-työkalu.
- Python: `container.py`, noin 140 riviä tavallisella `zipfile`-moduulilla. Sama tiedosto on jokaisessa muuntimessa (`heat3d_ext_warthunder/container.py`, `heat3d_cs2/container.py`), joten mikään muunnin ei riipu toisesta. Uusi muunnin kopioi sen.
- Katselin lukee tiedoston tiedostosta
  [`src/data/container.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/container.ts).
