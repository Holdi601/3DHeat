---
title: "Muuntimet säilyttävät kaiken"
parent: "Datan lataaminen"
nav_order: 8
lang: "fi"
source: "converters.md"
source_hash: "49681e8e32b2"
translated: true
outdated: false
---

# Muuntimet säilyttävät kaiken

Tätä sivua ei tarvitse toiston avaamiseen. Se on tarkoitettu ihmisille, jotka kirjoittavat työkaluja, jotka muuntavat pelitiedostot 3DHeat-taulukoiksi, ja kaikille, jotka haluavat tietää, miksi nämä taulukot pitävät niin paljon.

Jokainen työkalu, joka muuntaa pelin toiston, demon, lokin tai live-telemetrian katseluohjelman avattavaksi, noudattaa yhtä sääntöä:

> **Muunna kaikki, mitä lähde pitää sisällään ja mikä voidaan lukea nyt, ja säilytä loput kokonaisina, jotta ne voidaan lukea myöhemmin ilman alkuperäistä tiedostoa.**

Toisto katoaa usein pelipäivityksen, uudelleenasennuksen tai täyden levyn takia, ja live-syöte katoaa heti, kun se on lähetetty. Se, minkä muunnin pudottaa, on menetetty lopullisesti. Se, minkä se säilyttää kokonaisena, voidaan purkaa sinä päivänä, kun joku ymmärtää sen. Muunnin ei siis päätä, mikä on hyödyllistä. Se purkaa, minkä pystyy, ja pitää jokaisen muun viestin, paketin, tapahtuman, ominaisuuden tai rivin muuttumattomana taulukon vieressä. Oma tulosteensa kertoo, kuinka suuren osan kustakin se luki ja kuinka suuren osan se vain säilytti.

Tämä sivu kuvaa yhteisen käytännön, jonka kaikki muuntimet noudattavat: War Thunderin, World of Tanksin, World of Warshipsin ja Squadin toistomuuntimet, CS2-demomuuntimen, taustavahdin (sen Dota-toistojen purkajan ja jokaisen live-sovittimen), pelin tallennustyökalun telemetrian lukijat ja katseluohjelman omat tuonnit (Tacview ACMI, OCAP, GPX/KML/IGC/FIT/NMEA). Katseluohjelman omat lukijat kuvataan sivuilla [Tacview-tallenteet](tacview-acmi.md) ja [Tiedostojen lataaminen](loading-files.md). Yhden tiedoston muoto on [Yksi tiedosto per ottelu](container.md). Yksi ottelu muuttuu taulukoksi, `match.json`-tiedostoksi ja sivutiedostoiksi, jotka voidaan pakata yhteen `.3dheat`-tiedostoon. Jokaisen työkalun README:ssä on **Täydellisyys**-osio. Se luettelee lähteen osalta, mitä luetaan, mitä säilytetään raakana ja mitä ei ole saatavilla, ja miksi.

## Kolme paikkaa jokaiselle kohteelle {#three-homes-for-every-item}

Kaikki, mitä lähde pitää sisällään, päätyy täsmälleen yhteen kolmesta paikasta:

| Paikka | Mitä sinne menee |
|---|---|
| **Purettu** | Taulukko (yksi rivi per näyte tai tapahtuma, katseluohjelman lukemat sarakkeet ja lisäsarakkeet jokaiselle muulle riviin kuuluvalle arvolle) ja ottelun asiakirja `<match>.match.json` (kaikki, mikä kuuluu koko otteluun: asetukset, kokoonpanot, tulokset, tulostaulut, itsetarkistus). |
| **Säilytetty raakana** | Sivutiedosto taulukon vieressä: jokainen kohde, joka ei ole purettu tai on vain osittain purettu, kokonaisena ja muuttumattomana, tyyppinsä, aikansa ja yksikön tai olion kanssa, johon se kuuluu. |
| **Ei saatavilla** | Nimetty README:n Täydellisyys-osiossa syyn kanssa: muoto ei kanna sitä (asiakasohjelman toistossa ei ole muiden pelaajien syötteitä), lähde ei koskaan lähetä sitä tai sen lukeminen ei ole sallittua (suojattu prosessi, salattu lohko, jonka avain ei ole meidän käytettävissämme). |

Kohde, joka on **osittain** purettu, on sekä purettu *että* säilytetty raakana. Taulukkoon tulee se, mikä ymmärretään, ja sivutiedostoon koko kohde. Näin parempi purkaja myöhemmin ei tarvitse alkuperäistä tiedostoa.

Neljättä paikkaa ei ole. Jos jotain pudotetaan, koska se näytti hyödyttömältä, koska se oli "luultavasti" kaksoiskappale tai koska se oli suuri, se on virhe. Harventaminen on sallittu vain taulukossa (kamera 2 Hz:n taajuudella 60 Hz:n sijaan), ei koskaan sivutiedostossa.

## Sivutiedostot {#sidecars}

Sivutiedosto on Parquet-tiedosto taulukon vieressä, ja se on nimetty sen mukaan:

```
<kansio>/<ottelu>.parquet              taulukko
<kansio>/<ottelu>.match.json           ottelun asiakirja
<kansio>/<ottelu>.<mitä>.parquet       sivutiedosto
```

`<mitä>` on yksi sana tästä luettelosta. Uusi muunnin valitsee sanan, joka sopii, tai lisää uuden sanan tänne **ja** tiedoston [`src/data/filePick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/filePick.ts) kohtaan `SIDECAR_PARQUET`. Näin katseluohjelma jättää sen pois, kun koko kansio ladataan.

| `<mitä>` | Sisältää | Käyttäjät |
|---|---|---|
| `messages` | verkkovirran paketit, olion metodikutsut ja ominaisuuspäivitykset, kokonaisina | War Thunder, World of Tanks, World of Warships |
| `flight` | lentokonekohtaiset lentomallin merkinnät, kokonaisina | War Thunder |
| `packets` | kokonaiset kehykset ja verkkoviestit tai säiliön palat, olion virran ulkopuolella | CS2, Dota 2, Squad |
| `events` | pelitapahtumat kaikkine avaimineen, kuten jäsentäjä ne antaa | CS2 |
| `entities` | olioiden ja ominaisuuksien päivitykset, etäkutsut, avatut ja suljetut kanavat, purkajan tarvitsemat viennit | Squad, Dota 2 |
| `props` | jokainen olion ominaisuus, jonka jäsentäjä lukee, joka kerta kun se muuttui | CS2 |
| `units` | yksikkökohtainen tila sijaintitaulukon ulkopuolella | Dota 2 |
| `combatlog` | taistelulokki, jokainen merkintä kaikkine kenttineen | Dota 2 |
| `strings` | jokainen merkkijonotaulun merkintä | CS2, Dota 2 |
| `objectives` | valtausalueet ja tavoitteet, jokainen muutos aikoineen | War Thunder |
| `raw` | live-syöte: jokainen vastaanotettu paketti, rivi, API-asiakirja tai muistilukema kokonaisena | vahdin istunnot (`heat.raw.parquet`), pelin tallennustyökalun kierroksentallentimet (`<leima>_<peli>.raw.parquet`), vahdin osu!-, LoL- ja Valorant-toistotiedostot |

Katseluohjelma jättää kansion latauksessa pois jokaisen tämän luettelon `*.<mitä>.parquet`-tiedoston sekä kaikki `*.match.json`-, `*.meta.json`- ja `*.summary.json`-tiedostot ja muut JSON-sivutiedostot. Jos avaat yhden niistä yksin, valitsemalla tai pudottamalla vain sen tiedoston, se latautuu kuten mikä tahansa taulukko (katso [Tiedostojen lataaminen](loading-files.md)).

Nämä ovat tiedostoja sellaisina kuin muunnin kirjoittaa ne `--loose`-valinnalla. Oletuksena War Thunderin, CS2:n ja Tacviewn muuntimet pakkaavat ottelun taulukon, asiakirjan ja sivutiedostot yhteen tiedostoon, `<ottelu>.3dheat`, samoilla nimillä (katso [Yksi tiedosto per ottelu](container.md)). Kaikki tässä pätee jokaiselle jäsenelle.

### Sarakkeet {#columns}

Jokainen sivutiedoston rivi on yksi kohde. Sarakkeet ovat tässä järjestyksessä ne, jotka pätevät:

| Sarake | Tyyppi | Mitä |
|---|---|---|
| `time` | float64 | sekunteja samalla kellolla kuin taulukon `time` (tai `tick`, kun lähde laskee tikkejä; silloin molemmat) |
| `type` | merkkijono (sanakirja) | mikä kohde on lähteen omilla termeillä: paketin tyyppi, viestin tunnus, tapahtuman nimi, ominaisuuden polku, rivin etuliite |
| `name` | merkkijono (sanakirja) | sen nimi, kun se tunnetaan (yhteisön nimi, luokan nimi), muuten tyhjä |
| `entity` / `unit` / `uid` / `player` | kokonaisluku tai merkkijono | kenelle se kuuluu, samoilla tunnuksilla kuin taulukossa, joten sivutiedoston rivi voidaan liittää rataan |
| `decoded` | merkkijono (JSON) | mitä siitä ymmärretään, jos mitään; muuten tyhjä |
| `payload` | binääri | kohteen tavut, kokonaisina ja muuttumattomina (binäärilähteet) |
| `text` | merkkijono | kohteen teksti, kokonaisena ja muuttumattomana (tekstilähteet: lokirivi, JSON-objekti, avain-arvo-lohko) |

Muitakin sarakkeita on sallittu (bittisiirtymä, koko, kanava). Toistuvat merkkijonot koodataan sanakirjana, ja tiedosto kirjoitetaan zstd:llä, joten sivutiedosto on vain murto-osa toiston omasta koosta.

Sivutiedoston on riitettävä yksin: myöhemmin kirjoitettu purkaja lukee sivutiedoston, ei alkuperäistä toistoa. Jos kohdetta ei voi ymmärtää ilman kontekstia (olion luokka, merkkijonotaulu, avain, johon viesti viittaa), konteksti menee myös sivutiedostoon tai ottelun asiakirjaan.

### Live-lähteet {#live-sources}

Live-sovittimilla (UDP-telemetria, jaettu muisti, pelin loki, paikallinen API) ei ole lainkaan tiedostoa, johon palata. Ne tallentavat **jokaisen kentän, jonka lähde lähettää**, vaikka mikään ei vielä käyttäisi niitä:

- paketti-syöte: jokainen paketti kokonaisena, `payload` tavuina, `type` pakettitunnuksena tai muotona, saapumisnopeudella;
- jaettu muisti tai kyselty API: jokainen kenttä jokaisesta lukemasta, joko nimettyinä sarakkeina tai koko lohkona `payload`-kenttänä, sovittimen lukunopeudella;
- loki: jokainen rivi, `text` rivinä, `type` rivin lajina, myös rivit, joihin sovitin ei reagoi.

Nämä menevät tiedostoon `<istunto>.raw.parquet` istunnon taulukon viereen. Koko on säännön hinta. Sitä pienennetään zstd:llä ja sanakirjakoodauksella, ei jättämällä asioita pois.

## Itsetarkistus {#the-self-check}

Jokainen muunnin kirjoittaa ottelun asiakirjaan (tai istunnon `meta.json`-tiedostoon, tai yhteenvetoon, jos sillä ei ole ottelun asiakirjaa) `completeness`-lohkon kohtaan `selfCheck`:

```json
"selfCheck": {
  "completeness": {
    "rule": "https://github.com/Holdi601/3DHeat/blob/main/docs/converters.md",
    "sidecars": ["match-0001.events.parquet"],
    "types": {
      "player_death": {"seen": 182, "decoded": 182, "partial": 0, "raw": 0, "lost": 0},
      "bullet_damage": {"seen": 2410, "decoded": 0, "partial": 0, "raw": 2410, "lost": 0}
    },
    "lost": 0
  }
}
```

| Kenttä | Merkitys |
|---|---|
| `seen` | kuinka monta tämän tyypin kohdetta lähde pitää sisällään |
| `decoded` | luettu kokonaisena taulukkoon tai ottelun asiakirjaan |
| `partial` | luettu osittain taulukkoon tai asiakirjaan ja säilytetty kokonaisena sivutiedostossa |
| `raw` | säilytetty kokonaisena vain sivutiedostossa, ei purettu |
| `lost` | `seen - decoded - partial - raw`: on oltava 0 |

Ylätason `lost` on summa. Muuntimen testit vaativat, että se on 0 synteettisissä näytteissä, ja README kertoo, mikä se oli oikeissa. Nollasta poikkeava `lost` on muuntimen ilmoitus, että se rikkoi säännön. Se nimeää tyypin, joten aukko voidaan löytää.

"Tyypit" ovat lähteen omia: pakettityypit, viestitunnukset, tapahtumanimet, ominaisuusryhmät, rivilajit. Ne lasketaan siellä, missä muunnin ne kohtaa, eikä luettelosta, jonka se odottaa. Siksi tyyppi, jonka kukaan ei tuntenut, näkyy laskurinsa kanssa eikä katoa.

## README:n Täydellisyys-osio {#the-readmes-completeness-section}

Jokaisen muuntimen README:ssä on **Täydellisyys**-otsikon alla kolme luetteloa:

- **Luettu**: mitä menee taulukkoon ja ottelun asiakirjaan, ja miten jokainen uusi kenttä tarkistettiin jollakin riippumattomalla (pelin omat luvut, toinen lähde, tarkoitusta varten tehty tallenne).
- **Säilytetty raakana**: mikä on missäkin sivutiedostossa, minkä `type`-arvon alla ja mitä siitä tiedetään tähän asti.
- **Ei saatavilla**: mitä lähde ei kanna tai mitä ei saa lukea, ja miksi.

Se viittaa takaisin tälle sivulle.

## Missä kukin muunnin on {#where-each-converter-stands}

| Muunnin | Sivutiedostot | Sen Täydellisyys-osio |
|---|---|---|
| War Thunder -toistot | `messages`, `flight` | [3DHeat-Ext-WarThunder README](https://github.com/Holdi601/3DHeat-Ext-WarThunder#the-sidecars) (sen itsetarkistuksen luvut ovat kohdassa `counts`; `completeness`-lohko on tulossa) |
| World of Tanks -toistot | `messages` | [3DHeat-Ext-WoT README](https://github.com/Holdi601/3DHeat-Ext-WoT#completeness) |
| World of Warships -toistot | `messages` | [3DHeat-Ext-WoWs README](https://github.com/Holdi601/3DHeat-Ext-WoWs#completeness) |
| Squad-palvelimen demot | `entities`, `packets` | [3DHeat-Ext-Squad README](https://github.com/Holdi601/3DHeat-Ext-Squad#completeness) |
| CS2-demot | `events`, `props`, `strings`, `packets` | [3DHeat-CS2 README](https://github.com/Holdi601/3DHeat-CS2#completeness) |
| Dota 2 -toistot (vahti) | `packets`, `entities`, `strings`, `units`, `combatlog` | [Dota 2 -toistot](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/game-dota-replays.md) |
| osu!, LoL, Valorant -toistot (vahti) | `raw` | niiden sivut [vahdin dokumenteissa](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) |
| Live-sovittimet (vahti) | `raw` | kunkin pelin sivu [vahdin dokumenteissa](https://github.com/Holdi601/3DHeat-Watcher/tree/main/docs) ja [kehitys](https://github.com/Holdi601/3DHeat-Watcher/blob/main/docs/development.md) `Session.raw`-kohdalle |
| Kierroksentallentimet (pelin tallennus) | `raw`, ja Forza-kierrostiedoston sisällä `unparsed`-tavut | [3DHeat-GameCapture README](https://github.com/Holdi601/3DHeat-GameCapture#completeness) |
| Katseluohjelman omat tuonnit | ei yhtään: katso alla | tämä sivu |

### Katseluohjelman omat tuonnit {#the-viewers-own-imports}

Tacview ACMI, OCAP ja GPS-muodot luetaan selaimessa käyttäjän omasta tiedostosta. Katseluohjelma ei tallenna niistä mitään, joten tiedosto itse pysyy tallenteena. Ne silti lukevat niin paljon kuin pystyvät:

- **Tacview ACMI** (`src/data/acmi.ts`): jokainen olio-rivi, jolla on sijainti, on rivi, jossa on jokainen tallenteen ominaisuus. Jokainen tapahtuma on rivi, jokainen poistuminen on rivi, ja tallenteen omat ominaisuudet (otsikon FileType ja FileVersion kanssa) ovat jokaisella rivillä kohdassa `RecordingInfo`. Kommenttirivi on tapahtuma `Comment`. Olio, jolle ei koskaan tule sijaintia, on rivi `Unplaced` viitepisteessä. U ja V ovat sarakkeita aina, kun jollakin rivillä niitä on. Ominaisuusrivi ilman sijaintia luetaan osittain: sen arvot menevät olion seuraavalle riville, eivät omaan aikaansa. `AcmiTable.completeness` laskee tiedoston rivit lajin mukaan.
- **OCAP** (`src/data/ocap.ts`): jokaisen olion kehykset, laukaukset ja merkit, jokainen tapahtumalaji (tuntemattomat lajit rivinä "Mission" tekstinsä kanssa) ja asiakirjan omat kentät (`Info`). Ei vielä luettu: olion kentät ja loppujen sijaintialkioiden muut kuin ne, jotka on lueteltu sen otsikossa (uudemman tallentimen lisäykset), sekä kuolleen yksikön toistuvat kehykset kuoleman jälkeen (harvennettu tarkoituksella, koska niissä ei muutu mikään).
- **GPS-muodot** (`src/data/geoTracks.ts`): paikannukset, niiden aika, korkeus, suunta ja nopeus sekä syke, kadenssi, teho, lämpötila, satelliitit, HDOP ja painekorkeus siellä, missä tiedosto ne kirjaa. Ei vielä luettu: muut GPX- ja KML-laajennukset, muut NMEA-lauseet kuin sijaintilauseet, IGC-tietueet muut kuin paikannukset ja niiden laajennukset, sekä FIT-viestit muut kuin tietueet (kierrokset, sessiot, laitetiedot).

Nämä aukot on lueteltu, jotta ne suljetaan, ei selittääkseen niitä. Katseluohjelman viennit ladatusta tallenteesta (`src/data/exportRecording.ts`) kirjoittavat vain sen, mikä luettiin.

## Muuntimen lisääminen {#adding-a-converter}

1. Listaa, mitä muoto pitää sisällään, sen dokumentaatiosta, sen omista rakenteista tai laskemalla jokainen viestityyppi oikeista näytteistä. Lista on itsetarkistuksen `types`.
2. Pura se, mikä voidaan tarkistaa nyt. Jokainen uusi kenttä tarkistetaan jollakin riippumattomalla, ennen kuin se menee taulukkoon. Kenttä, jota ei voi vielä tarkistaa, pysyy raakana.
3. Säilytä loput kokonaisina sivutiedostossa, nimettynä yllä olevalla tavalla ja yllä olevilla sarakkeilla.
4. Kirjoita `completeness`-lohko ja testi, joka varmistaa, että `lost` on 0.
5. Kirjoita README:n Täydellisyys-osio ja linkitä tälle sivulle.
6. Jos sivutiedoston `<mitä>` on uusi, lisää se yllä olevaan taulukkoon ja tiedoston `src/data/filePick.ts` kohtaan `SIDECAR_PARQUET`.

Muuntimet ovat puhtaan huoneen toteutuksia: ne kirjoitetaan muodoista, dokumentaatiosta ja näytteistä, eikä koskaan GPL- tai AGPL-koodista. Oikeiden toistojen näytteet pysyvät koneella, joka ne teki. Testit käyttävät synteettisiä tiedostoja.
