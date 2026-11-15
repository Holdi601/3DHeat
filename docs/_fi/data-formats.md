---
title: "Tietomuotojen viite"
nav_order: 19
lang: "fi"
source: "data-formats.md"
source_hash: "23c1890ce185"
translated: true
outdated: false
---

# Tietomuotojen viite

Tämä sivu luettelee kaikki tiedostotyypit, joita 3DHeat osaa avata, ja kertoo, millainen taulukko niiden sisällä pitää olla. Taulukko on rivejä ja sarakkeita, kuten taulukkolaskentassa: jokainen rivi kertoo, missä jokin oli, ja jos tiedät, milloin ja kuka.

Mitä Lämpökartta-välilehti lukee sarake sarakkeelta ja mitä vihjeitä Parquet-tiedosto voi kantaa. (Kisa-analyysi-välilehti lukee kierrostiedostoja ja Ottelu-välilehti ottelun yhteenvetoja; katso [Kisa-analyysi](race-analysis.md) ja [Ottelu-analyysi](match-analysis.md).)

## Tiedostot {#files}

Tämä on ainoa täydellinen luettelo ladattavista tiedostoista. **Lähde**-paneeli (**Tiedostot…**, **Kansio…** tai vedä ja pudota) hyväksyy juuri nämä:

| Pääte | Mikä se on | Lukija |
|---|---|---|
| `.parquet`, `.pq` | Parquet-taulukko | Parquet-lukija (alla) |
| `.csv`, `.tsv`, `.txt` | Erotinmerkillä erotettu teksti | tekstilukija (alla) |
| `.3dheat` | Yksi ottelu yhdessä tiedostossa (ZIP, joka sisältää taulukon ja sen lisätiedot) | latautuu taulukkona, jonka se sisältää - [Yksi tiedosto ottelua kohden](container.md) |
| `.acmi` (myös `.txt.acmi`, `.zip.acmi`) | Tacview-lentotallenne | oma lukijansa - [Tacview-tallenteet](tacview-acmi.md) |
| `.json`, `.json.gz` | OCAP-tallenne (Arma-tyyppinen) | oma lukijansa |
| `.gpx`, `.kml`, `.kmz`, `.nmea`, `.nma`, `.igc`, `.fit` | GPS-radat: GPX, KML/KMZ, NMEA-lokit, IGC-purjelentolokit, FIT-urheilutiedostot | oma lukijansa; sijainnit tulevat leveyspiiristä ja pituuspiiristä |

Näitä ei ladata sijainteina: pienet JSON-tiedostot, jotka ovat taulukon vieressä kuvaamassa sitä (nimet, jotka päättyvät `.match.json`, `.course.json`, `.level.json`, `.meta.json`, `.summary.json`, `.session.json`, `.hints.json`), ja muuntimen lisätaulukot (`<ottelu>.events.parquet` ja vastaavat, katso [Muuntimet](converters.md)), ellet valitse niitä erikseen. Muut tiedostot ohitetaan ja niistä kerrotaan syy. Siitä, miten valinta suodatetaan, kerrotaan kohdassa [Tiedostojen lataaminen](loading-files.md#which-files-are-kept).

Tyhjät tiedostot ohitetaan. Jos valinnassa on `movement*.<pääte>`-tiedostoja, ladataan vain ne ([Tiedostojen lataaminen](loading-files.md#which-files-are-kept)).

Data on **yksi rivi per näyte**: sijainti hetkellä, valinnaisesti kuka, mikä ryhmä, mikä sessio, mihin suuntaan katsottiin ja kaikki muut sarakkeet. Tapahtumarivit (tappo, asetus, laukaus) voivat olla samassa taulukossa sijaintirivien kanssa, ja ne erotetaan tapahtumasarakkeella.

## Erotinmerkillä erotettu teksti (CSV, TSV, TXT) {#delimited-text-csv-tsv-txt}

Pienin hyödyllinen tiedosto, kolme riviä:

```
x,y,z,t,player,team
10.5,2.0,-30.2,0.00,Blue 1,Blue
11.0,2.0,-29.8,0.25,Blue 1,Blue
-4.2,1.5,18.9,0.00,Red 3,Red
```

Sarakkeet yhdistyvät itsestään ([Sarakkeiden kohdistus](column-mapping.md)).

Tekstin jäsentää tavutason lukija, joka purkaa vain kohdistetut sarakkeet ([`csv.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/csv.ts)).

| Asia | Sääntö |
|---|---|
| Otsikkorivi | Ensimmäinen ei-tyhjä rivi sisältää sarakkeiden nimet. Tyhjä nimi muuttuu muotoon `column_N`. |
| Erotin | Tunnistetaan ensimmäisen 1 MiB:n 20 ei-tyhjästä rivistä. Vaihtoehtoina pilkku, puolipiste, sarkain ja putkimerkki. Voittaa **johdonmukaisuus**: erotin, joka antaa saman kenttämäärän jokaisella otetulla rivillä, voittaa; sen jälkeen se, joka antaa enemmän kenttiä. Välilyöntiä ei tunnisteta, mutta sen voi valita; minkä tahansa yksittäisen merkin voi kirjoittaa ([Sarakkeiden kohdistus](column-mapping.md#the-fields)). |
| Lainaus | RFC 4180: kentät voi kääriä kaksoislainausmerkkeihin, ja lainausmerkkien sisällä `""` tarkoittaa kirjaimellista lainausmerkkiä. |
| Tyhjät merkit | Kentistä poistetaan alussa ja lopussa olevat välilyönnit, sarkaimet ja lainausmerkit. |
| Kentät per rivi | Enintään 4 096; enemmän on virhe (*onko erotin oikein?*). |
| Luvut | Valinnainen etumerkki, numerot, valinnainen `.` ja desimaalit, valinnainen eksponentti (`1.5e-3`). Desimaalipilkku (`1,5`), tuhaterottimet tai perään kirjoitetut yksiköt (`12 m`) eivät jäsenny ja lasketaan puuttuviksi. Jos tiedostossasi on desimaalipilkkuja, vaihda ne pisteisiin ennen lataamista (onnistuu tekstieditorin etsi ja korvaa -toiminnolla). |
| Numeerinen sarake | Sarake tarjotaan numeerisena, kun yli 90 % ensimmäisten 50 rivin ei-tyhjistä arvoista on lukuja. |
| Rivien määrä | Arvioidaan ennen lataamista ensimmäisen 1 MiB:n keskimääräisen rivin pituuden perusteella. |
| Tekstin koodaus | UTF-8. |

## Parquet {#parquet}

Luetaan [hyparquet](https://github.com/hyparam/hyparquet)-kirjastolla, sarakepalasta kerrallaan tyypitettyihin taulukoihin, pyytäen vain kohdistetut sarakkeet ([`parquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/parquet.ts), [`ingestParquet.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestParquet.ts)).

| Asia | Sääntö |
|---|---|
| Rivien määrä | Tarkka, tiedoston loppuosasta, ennen lataamista. |
| Esikatselu | Ensimmäiset 50 riviä, purettuina olioina; niiden arvot päättävät, mitkä sarakkeet näyttävät numeerisilta. |
| Kokonaisluvut | `INT32` ja `INT64` (purettuna BigInt-muotoon) muuttuvat luvuiksi. |
| Liukuluvut | `FLOAT`, `DOUBLE`. |
| Totuusarvot | 1 ja 0. |
| Tekstit | Käytetään henkilö-, ryhmä-, sessio- ja luokkasarakkeisiin; numeroa muistuttava teksti hyväksytään numeerisiin rooleihin. |
| Loogiset tyypit `TIMESTAMP` ja `DATE` | Puretaan hetkiksi (millisekunteja vuodesta 1970); aika-akselina käytettynä yksikköasetus ohitetaan. |
| Sisäkkäiset sarakkeet | Struct- ja list-sarakkeet eivät sovi mihinkään rooliin (esikatselussa ne näkyvät JSON-tekstinä); ei testattu. |
| Tiedoston loppuosan metatiedot | Avain `heat3d` luetaan kohdistusvihjeinä (alla). |

Sijainti-, aika- tai katsesarake, jossa on muuta kuin numero, puretaan puuttuvaksi.

## Sarakeroolit ja tyypit {#column-roles-and-types}

| Rooli | Tyyppi tiedostossa | Pakollinen | Tallennetaan muodossa | Rajat |
|---|---|---|---|---|
| X, Y, Z | luku | kaksi kolmesta | 32-bittinen liukuluku, [akselien kohdistuksen](axes-units-and-time.md) jälkeen | Rivi ilman käyttökelpoista sijaintia pudotetaan pois. |
| Aika | luku yhdessä [aikayksiköistä](axes-units-and-time.md#time-units), Parquet-aikaleima tai ISO-8601-teksti | ei | 32-bittinen liukuluku sekunteina varhaisimmasta rivistä | Lajittelu evätään yli 400 000 000 rivillä ([miksi](memory-and-budgets.md#the-sort-ceiling)). |
| Henkilö | mikä tahansa; sanakirjakoodattu | ei | 32-bittinen tunniste | |
| Sessio | mikä tahansa; sanakirjakoodattu | ei | 32-bittinen tunniste | Nimiöitä luetellaan enintään 100 000 sessiolle. |
| Ryhmä | mikä tahansa; sanakirjakoodattu | ei | 16-bittinen tunniste | Enintään 4 096 ryhmää, muuten ryhmittely pudotetaan. |
| Kääntyminen, kallistus | luku, asteina tai radiaaneina | ei | 32-bittinen liukuluku radiaaneina | |
| Suuntavektori X, Y, Z | luku | ei (kaikki kolme yhdessä) | muunnetaan kääntymiseksi ja kallistukseksi | |
| Suodatinsarake, *alue* | luku | ei | 32-bittinen liukuluku | Enintään 4 suodatinta aktiivisena kerrallaan. |
| Suodatinsarake, *luokka* | mikä tahansa; sanakirjakoodattu | ei | 32-bittinen tunniste | Enintään 4 096 arvoa, muuten saraketta ei säilytetä. |

Parquet-sarake `TIMESTAMP`, joka on säilytetty suodatinsarakkeena, on *alue* epookin millisekunteja - liukusäädin, ei lista.

## Tulossarakkeet {#outcome-columns}

Kuka voitti, jokaisella rivillä, jotta paikkaa, reittiä tai siirtoa voidaan arvioida sen mukaan, kuinka usein sen puoli lopulta voitti ([Voittojen osuus](win-rate.md)). Katselin säilyttää nämä sarakkeet itse, luettelee ne ensimmäisinä [suodattimissa](filters.md) katselimen kielellä ja lukee ne [voittokartassa](win-rate.md), [erittelyssä](breakdown.md) ja [tilavuuksien tilastoissa](volumes.md#statistics). Eräpohjaisen pelin (CS2, Valorant, Rainbow Six Siege) tai ottelupohjaisen pelin (War Thunder) muunnin kirjoittaa kaikki neljä:

| Sarake | Tyyppi | Merkitys |
|---|---|---|
| `won` | 0/1 (tyhjä, jos tuntematon) | rivin puoli (joukkue) voitti **erän**; pelissä, jossa ei ole eriä, ottelun |
| `matchWon` | 0/1 (tyhjä, jos tuntematon) | rivin puoli (joukkue) voitti **ottelun**; tyhjä, jos tallenne ei näytä loppua |
| `round` | kokonaisluku, alkaen 1:stä | erä, johon rivi kuuluu; 1 koko ottelupohjaisen pelin ajan |
| `roundEndReason` | teksti | miten erä päättyi (ottelupohjaisessa pelissä ottelu), alla olevin sanoin |

`won` ja `matchWon` ovat rivin puolen: T-pelaajan riveillä on T-puolen tulos, tekoälyyksikön riveillä sen joukkueen tulos; riveillä, jotka eivät kuulu millekään puolelle, ne jäävät tyhjiksi. Puoliajalla vaihtava puoli pitää oman `matchWon`-arvonsa ja ottaa kunkin erän `won`-arvon sen mukaan, miten se pelasi sen. Tasapeli on 0 molemmille puolille.

Päättymissyyt ovat yhteiset kaikille peleille, joten yksi suodatin toimii kaikissa (pelin oma sana yhdistetään niihin, kun mahdollista, [`data/outcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/outcome.ts)):

| `roundEndReason` | Merkitys | Pelit |
|---|---|---|
| `elimination` | toisen puolen kaikki pelaajat poissa | CS2, Valorant, Rainbow Six Siege |
| `bomb` | pommi (spike, purkajan kohde) räjähti | CS2, Valorant, Rainbow Six Siege |
| `defuse` | pommi (spike) purettiin | CS2, Valorant, Rainbow Six Siege |
| `time` | erän kello loppui; War Thunder: ratkaistu, kun kummallakin puolella oli pisteitä jäljellä | kaikki |
| `surrender` | puoli luovutti | CS2, Valorant, Rainbow Six Siege |
| `draw` | ei voittajaa | CS2 |
| `objective` | tavoite vallattu tai pidetty (panttivanki pelastettu, alue varmistettu) | Rainbow Six Siege |
| `capture` | pisteet valuivat loppuun, kun voittaja piti valtausalueita | War Thunder |
| `tickets` | pisteet menetetty tuhoissa | War Thunder |
| `destruction` | viimeiset ajoneuvot menetetty kerralla, kukaan ei voi enää syntyä | War Thunder |
| `other` | kaikki muu | |

Mainitse ne myös `heat3d`-vihjeiden `extra`-luettelossa, kuten minkä tahansa muun sarakkeen. Sarakenimet `win`, `round_won`, `match_won`, `end_reason` ja `win_reason` luetaan samoina sarakkeina.

## `heat3d`-vihjeet {#the-heat3d-hints}

Parquet-tiedosto voi kantaa omat lukuohjeensa tiedostonsa loppuosan avain-arvo-metatiedoissa, avaimen **`heat3d`** alla, JSON-oliona ([`MappingHints`](https://github.com/Holdi601/3DHeat/blob/main/src/data/automap.ts)). Katselin soveltaa niitä omien arvauksiensa päälle, kun tiedosto on valinnan ensimmäinen; jokainen kohta on valinnainen, ja jokainen tulos näkyy yhä ja on muokattavissa [Sarakkeiden kohdistus](column-mapping.md#the-heat3d-hints-in-a-parquet-footer) -paneelissa. Kaikki, mikä ei jäsenny JSON-olioksi, jätetään huomiotta.

### Rakenne {#schema}

```
{
  "columns": {
    "x": string, "y": string, "z": string,          sarakkeiden nimet sijainnille
    "time": string,                                  aikasarake
    "timeUnit": "seconds" | "milliseconds" | "microseconds" | "nanoseconds"
              | "unix_seconds" | "unix_milliseconds" | "iso8601",
    "personId": string, "teamId": string, "sessionId": string,
    "lookMode": "none" | "yawPitch" | "vector",
    "yaw": string, "pitch": string,
    "dirX": string, "dirY": string, "dirZ": string,
    "angleUnit": "degrees" | "radians",
    "extra": [string, ...]                           suodatinsarakkeet, joita pidetään, hyödyllisin ensin
  },
  "axes": {
    "up": "y" | "z",
    "flipX": boolean, "flipY": boolean, "flipZ": boolean,
    "scale": number                                  on oltava > 0
  },
  "entity": {
    "size": number                                   yhden seuratun asian koko tiedoston yksiköissä, > 0
  }
}
```

| Kohta | Sovelletaan, kun | Vaikutus |
|---|---|---|
| `columns.x` … `columns.dirZ`, `time`, `personId`, `teamId`, `sessionId` | nimetty sarake on tiedostossa | Asettaa sen roolin. |
| `columns.timeUnit` | se on yksi seitsemästä yksiköstä | Asettaa aikayksikön. |
| `columns.angleUnit` | `"degrees"` tai `"radians"` | Asettaa kulmayksikön. |
| `columns.lookMode` | `"vector"`, kun dirX, dirY ja dirZ ovat kaikki asetettu; `"yawPitch"`, kun yaw on asetettu; `"none"` | Asettaa katsetilan. |
| `columns.extra` | se on taulukko | Korvaa automaattisen suodatinluettelon. Säilytetään vain olemassa olevat sarakkeet, joita mikään rooli ei käytä; jokainen on *alue*, jos se näytti esikatselussa numeeriselta, muuten *luokka*. Ilman sitä automaattinen luettelo säilyy, paitsi sarakkeet, jotka vihje on antanut roolille. |
| `axes.up` | `"y"` tai `"z"` | Ylösakseli. |
| `axes.flipX/Y/Z` | totuusarvo | Kääntää akselin. |
| `axes.scale` | luku > 0 | Yksikkömittakaava. |
| `entity.size` | luku > 0 | [Kohteen koko](sessions-persons-groups.md#entity-size) (kerrotaan yksikkömittakaavalla latauksessa). Ainoa tapa asettaa se. |

### Esimerkki {#example}

Keksitty ampujan vienti: Z-ylös, senttimetrit, vasenkätinen maailma, pelaajat noin 72 cm leveitä.

```json
{
  "columns": {
    "x": "pos_x", "y": "pos_y", "z": "pos_z",
    "time": "t", "timeUnit": "seconds",
    "personId": "player", "teamId": "side", "sessionId": "round_id",
    "lookMode": "yawPitch", "yaw": "view_yaw", "pitch": "view_pitch", "angleUnit": "degrees",
    "extra": ["event", "weapon", "map"]
  },
  "axes": { "up": "z", "flipY": true, "scale": 0.01 },
  "entity": { "size": 72 }
}
```

### Kirjoittaminen {#writing-it}

pyarrow-kirjastolla mukautetut skeeman metatiedot kirjoitetaan tiedoston avain-arvo-metatietoihin:

```python
import json
import pyarrow as pa
import pyarrow.parquet as pq

table = pa.table({...})
hints = {"columns": {"x": "pos_x", "y": "pos_y", "z": "pos_z", "time": "t"}, "axes": {"up": "z"}}
meta = dict(table.schema.metadata or {})
meta[b"heat3d"] = json.dumps(hints).encode("utf-8")
pq.write_table(table.replace_schema_metadata(meta), "movement.parquet")
```

`npm run inspect -- file.parquet` tulostaa tiedoston skeeman, mikä on nopea tapa tarkistaa vihjeiden sarakenimet.

## Mitä Lämpökartta-välilehti kirjoittaa {#what-the-heatmap-tab-writes}

Mitään ei kirjoiteta takaisin dataan. Tulokset ovat:

- videoita WebM-muodossa (VP9 tai VP8) - [Kameran reitti ja video](camera-path-and-video.md);
- kameran asento, kopioituna leikepöydälle tekstinä - [Kamera](camera.md#pose);
- tasot, jotka tallennetaan selaimen [tasokirjastoon](level-library.md).
