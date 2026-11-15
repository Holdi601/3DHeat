---
title: "Tacview-tallenteet (ACMI)"
parent: "Datan lataaminen"
nav_order: 7
lang: "fi"
source: "tacview-acmi.md"
source_hash: "08423333214c"
translated: true
outdated: false
---

# Tacview-tallenteet (ACMI)

Tacview on ohjelma, joka tallentaa lentoja lentosimulaattoreista. Sen tiedostot päättyvät `.acmi`. 3DHeat avaa ne, jotta näet, mihin jokainen lentokone lensi.

Tacviewn lentotallenteet latautuvat kuten mikä tahansa taulukko: valitse tai pudota `.acmi` (teksti, `.txt.acmi`, tai pakattu, `.zip.acmi`) ja paina **Lataa**. Saat sen jälkeen kaikkien lentojen lämmön. Välilehdellä **Ottelu** saat toiston hahmoilla, jäljillä ja tapahtumalistalla ([Ottelun toisto](match-replay.md)). ACMI on Tacviewn julkinen tiedostomuoto ([dokumentaatio](https://www.tacview.net/documentation/acmi/)). DCS (Tacviewn viejän kautta), IL-2 Great Battles, Falcon BMS, X-Plane, MSFS ja muut kirjoittavat sitä, joten tämä lukee mitä tahansa niistä.

## Mitä tallenne tulee olemaan {#what-a-recording-becomes}

Yksi rivi aina, kun kohteen sijainti kirjoitetaan, yksi rivi per tapahtuma kohteen paikassa ja yksi rivi, kun kohde poistuu (`Removed`, siinä missä se viimeksi oli). Tapahtuma, joka ei koske vielä nähtyä kohdetta, esimerkiksi kirjanmerkki tai viesti kaikille, on rivi kohteelle `(recording)` viitepisteessä. Tallenne kantaa omat lukuohjeensa, joten kartoitusvaihe täyttää itse itsensä. Lukija kirjoittaa nämä sarakkeet: `Time`, `X`, `Y`, `Altitude`, `Object`, `Coalition`, `Heading`, `Pitch`, `Roll`, `Type`, `Name`, `Pilot`, `Group`, `Country`, `Color`, `Event`, `Latitude`, `Longitude`, `Recording`, `EventObjects`, `RecordingInfo`, sekä kaikki muut tallenteen ominaisuudet. Niiden tehtävät:

| Sarake | Tehtävä | Merkitys |
|---|---|---|
| Time | aika | Sekunteja tallenteen ReferenceTime-hetkestä. Unix-sekunteja, kun sellainen on, jotta kello näyttää oikean ajan. |
| X, Y | sijainti | Itä ja pohjoinen, metreinä, tasolla, joka koskettaa maapalloa tallenteen viitepisteessä. Etäisyydet ja suunnat ovat oikeita sen lähellä ja poikkeavat alle tuhannesosan 100 km:ssä. Pohjoinen on maailman -Z. |
| Altitude | sijainti (ylös) | Metreinä. |
| Object | henkilö | Lentäjä ja kohteen nimi sen tunnisteen kanssa, esim. `Viper 1 (F-16C_50) #a01`; miehittämätön kohde `(T-90A) #401`. |
| Coalition | joukkue | Puoli (tai väri, kun koalitiota ei ole). |
| Heading, Pitch | katse | Asteina; suunta 0 on pohjoinen. |
| Recording | istunto | Tallenteen Title tai tiedostonimi. Useat tallenteet latautuvat rinnakkain, eikä niiden radat yhdisty. |
| Type, Name, Pilot, Group, Country, Color, Event, Roll, Latitude, Longitude | suodattimet | Säilytetään suodatusta varten. Type ja Name valitsevat kunkin kohteen [hahmon](figures.md), Event syöttää jälkianalyysin tapahtumalistan, Roll kallistaa lentokonetta. |
| U, V | | Pelin oma tasainen maailma metreinä, kun jokaisella näytteellä niitä on (DCS kirjoittaa ne). |
| EventObjects | suodattimet | Jokainen kohde, jonka tapahtuma nimeää (`Message|a01|b02|...`), tunnisteen mukaan. |
| RecordingInfo | | Tallenteen omat ominaisuudet sellaisina kuin ne olivat sillä hetkellä (DataSource, DataRecorder, Author, Category, Briefing, Comments ja muut) JSON-muodossa. |
| IAS, Mach, AOA, FuelWeight ... | suodattimet | Mikä tahansa muu numeerinen ominaisuus, jonka tallenne kantaa. |
| Parent, CallSign, LockedTarget, Label, Shape ... | suodattimet | Mikä tahansa muu tekstiominaisuus, jonka tallenne kantaa. Ominaisuus, jonka arvo ei ole luku, on tekstiä. |

Kaikki neljä Tacviewn sijaintimuotoa luetaan: `lon|lat|alt`, `u|v`, `roll|pitch|yaw` ja kaikki nämä plus suunta. Tyhjät kentät säilyttävät edellisen arvon. `-id` poistaa kohteen, ja jos tunnistetta käytetään uudelleen sen jälkeen, se on uusi kohde. Escapoidut pilkut ja jatkorivit käsitellään.

Sijainnit projisoidaan aina leveys- ja pituusasteesta, ei koskaan U/V-arvoista. Siksi kaikkien pelien tallenteet jakavat saman projektion todellisen maailman taustakuvan kanssa.

## DCS-palvelimet: kuka voitti ja miten kukin lento päättyi {#dcs-servers-who-won-and-how-each-sortie-ended}

DCS-moninpelipalvelin tallentaa tehtävänsä Tacview'llä ympäri vuorokauden, ja pysyvä PvP-palvelin pyörittää kampanjaa monen tehtävän yli: puoli voittaa valtaamalla toisen puolen kaikki lentokentät, FARP:t ja alueet, mikä vie päiviä ja monta tehtävän uudelleenkäynnistystä. Tallenteissa on lennot, ei kampanjaa: mikään viesti ei kerro, kuka valtasi mitä, lentokentät kirjoitetaan kerran alussa, eikä mikään kerro, kuka voitti. Tacview-muunnin (`node tools/acmi-to-parquet.mjs`, [`data/dcsOutcome.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsOutcome.ts)) lisää jokaiselle riville sen, mikä voidaan tietää, ja jättää tyhjäksi sen, mitä ei voida - se ei koskaan arvaa.

| Sarake | Merkitys |
|---|---|
| `server` | palvelin tai kampanja tallenteen otsakkeesta (sen Title, Author ja Comments nimeävät tunnetut julkiset palvelimet - Blue Flag, SPS Contention, Growling Sidewinder; muuten Author, joka nimeää jonkun); `--server Name` antaa nimen koko kansiolle. Tallenne, jonka otsake ei nimeä palvelinta - Author kuten `Admin`, Title ja Comments, joita mikään tunnettu palvelin ei kirjoita - jää ilman kohdetta: `server` on tyhjä, vaikka tallenne olisi ladattu palvelimen tallennesivulta, koska sivulla voi olla myös muiden yhteisöjen tehtäviä |
| `mission` | tallenteen Title ilman versiota tai kampanjan kuukautta: `Operation_Example_V7.7.99` muuttuu muotoon `Operation Example` |
| `campaign` | kampanjakierros, johon tallenne kuuluu, palvelimen, kartan ja numeron mukaan: `Example Server North 3`. Yksi tallenne on yksi istunto (uudelleenkäynnistyksestä seuraavaan); kierros kestää monta istuntoa, päiviä tai viikkoja |
| `round` | kierroksen numero: palvelimen oma, jos se julkaisee sellaisen, muuten n:s kyseisellä palvelimella ja kartalla nähty kierros; kierrostiedostosta (alla), tyhjä ilman sitä |
| `session` | tallenteen paikka kierroksen istuntojen joukossa, 1, 2, ...; `sessionStart` sen todellinen alku (Unix-sekunteina) |
| `heldRed`, `heldBlue` | kiistellyt paikat, joita kumpikin puoli piti istunnon alussa, ketjutetusta kierrostiedostosta (alla) |
| `won`, `matchWon` | 1, kun rivin puoli (sen Color, Red tai Blue) voitti kampanjan, 0, kun se hävisi; tyhjä, jos mikään kierrostiedosto ei nimeä voittajaa, ja neutraaleilla riveillä. Kampanja on samalla kierros ja ottelu, joten molemmissa on sama arvo |
| `roundEndReason` | `capture` kampanjalle, joka voitettiin valtaamalla kaikki |
| `won`, `matchWon` kierroksen jokaisessa istunnossa | kierroksen tulos, kirjoitettuna sen jokaiseen tallenteeseen, kun sen loppu tiedetään |
| `sortie` | lentokoneen riveillä: sen lento, 1, 2, ... noususta nousuun; maassa vietetty aika ennen ensimmäistä nousua ja laskeutumisen jälkeen lasketaan siihen lentoon, johon se kuuluu |
| `sortieResult` | miten lento päättyi: `landed`, `landed damaged` (ilmassa saadun osuman jälkeen), `ejected`, `shot down`, `destroyed` (maassa), `crashed`, `despawned` (katosi ilmassa ilman näkyvää syytä - pelaaja poistui), `airborne at end`, `no takeoff` |
| `sortieKills` | koneelle kyseisellä lennolla hyvitetyt tuhoamiset |

Pysyvällä palvelimella lento on se yksikkö, jolla on merkitystä: suodata `sortieResult` = `shot down` nähdäksesi, missä lentoja menetettiin, tai jaa lämpö `sortieResult`- tai `server`-sarakkeen mukaan [erittelyssä](breakdown.md). Nousut, laskeutumiset, heittoistuimella poistumiset, tuhoamiset ja maahansyöksyt, joista se koostuu, ovat tapahtumia, jotka muunnin päättelee koneiden liikkeistä (yllä).

Paikat, jotka vallattiin kierroksen kahden istunnon välillä - kierrostiedostosta tiedetyt, alla - ovat `capture`-tapahtumia myöhemmän tallenteen alussa: `Object` `(campaign)`, paikan kohdalla, `Detail` `Red to Blue, between missions`, `Inferred` `between missions`.

Lentokenttä tai FARP, joka vaihtaa puolta siellä, missä tallenne sen näyttää - kirjoitetaan uudelleen toisella värillä, tai poistetaan ja kirjoitetaan uudelleen samaan paikkaan toisella värillä viiden minuutin sisällä - muuttuu `capture`-tapahtumaksi kentän kohdalla: `Event` = `capture`, `Airfield` sen nimi, `Detail` `Red to Blue`, `Coalition` sen uusi puoli. Kenttä, joka kirjoitetaan ensimmäistä kertaa jollakin värillä, ei ole valtaus. Tähän mennessä tutkitut palvelimet kirjoittavat kenttänsä kerran, joten niiden tallenteissa ei ole valtauksia.

### Kierrostiedostot {#rounds-files}

Kierrostiedosto kertoo palvelimittain sen kampanjakierrokset, kuka ne voitti ja kunkin kierroksen istunnot. Se tulee siitä, mitä palvelin julkaisee, tai itse tallenteista (alla).

Kampanjan voittaja on se, minkä palvelin julkaisee - kampanjaloki sen verkkosivulla - ei mitään tallenteessa. Kierrostiedosto kuljettaa sen, ja muunnin lukee sen valitsimella `--rounds file.json` (niitä voi antaa useamman):

```json
{
  "format": "heat3d-dcs-rounds",
  "version": 1,
  "server": "Example Server",
  "source": "Example Server's public campaign log, read 2026-11-15",
  "rounds": [
    { "id": 41, "title": "^Example-Campaign-North$", "start": "2026-11-01T08:00:00Z", "end": "2026-11-04T19:30:00Z", "winner": "Blue", "endReason": "capture", "state": "won" },
    { "id": 42, "title": "^Example-Campaign-North$", "start": "2026-11-04T19:30:00Z", "end": null, "winner": null, "state": "in progress" }
  ]
}
```

Tallenne kuuluu oman `server`-palvelimensa niihin kierroksiin, joiden `title` (säännöllinen lauseke) vastaa sen Titleä; kukin rivi kuuluu siihen kierrokseen, johon sen todellinen aika osuu - tallenteen RecordingTime plus rivin sekunnit, ei tehtävän pelinsisäinen päivämäärä. Ajat ovat UTC-aikaa. Kierros ilman voittajaa (vaihdettu, yhä käynnissä) antaa riveilleen kierroksen numeron ja tyhjän tuloksen.

Otteluasiakirjan vastine, `acmi`-alatunniste, kertoo, mistä tulos tuli, kuten War Thunder -ottelun `result.source`: `outcome.result` on `{ winner, round, endReason, source }`, `source` on kierrostiedoston `source` tai `null`, kun mikään ei nimennyt voittajaa. `outcome` luettelee myös tallenteen kierrokset, sen valtaukset ja sen lennot sen mukaan, miten ne päättyivät:

```json
"outcome": {
  "server": "Example Server", "mission": "Example-Campaign-North", "kind": null,
  "result": { "winner": "Blue", "round": 41, "endReason": "capture", "source": "Example Server's public campaign log, read 2026-11-15" },
  "rounds": [{ "id": 41, "start": "2026-11-01T08:00:00.000Z", "end": "2026-11-04T19:30:00.000Z", "winner": "Blue", "endReason": "capture", "state": "won" }],
  "captures": 0,
  "sorties": { "landed": 31, "shot down": 12, "ejected": 3, "crashed": 2, "despawned": 9, "no takeoff": 4 }
}
```

Lentäjän `Viper 1 (F-16C_50) #a01` rivi Blue-puolella tuossa kampanjassa on silloin: `server` Example Server, `round` 41, `won` 1, `roundEndReason` capture, `sortie` 2, `sortieResult` landed, `sortieKills` 1.

### Kierrokset itse tallenteista {#rounds-from-the-recordings-themselves}

Pysyvä palvelin säilyttää kampanjansa uudelleenkäynnistysten yli, ja jokainen tallenne alkaa molempien puolten maayksiköillä ja staattisilla kohteilla siellä, mihin kampanja ne jätti. `node tools/dcs-campaign-rounds.mjs <out-folder> <folder>...` lukee jokaisen tallenteen ensimmäiset minuutit ([`data/dcsCampaign.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/dcsCampaign.ts)), asettaa kunkin palvelimen yhden kartan tallenteet aikajärjestykseen ja ketjuttaa ne:

- **Paikat**: maasto noin 2 km:n soluina; solu kuuluu puolelle, kun kolme neljäsosaa siellä istunnon alussa olevista yksiköistä on sen. *Kiistellyt* paikat ovat niitä, jotka on nähty kummankin puolen hallussa.
- **Valtaukset**: paikka, jota toinen puoli pitää seuraavan istunnon alussa - vallattu tehtävien välillä tai aiemman tehtävän aikana.
- **Uusi kierros**: istunto, jonka paikat eroavat edellisen istunnon paikoista yli 60 %:ssa - uuden kierroksen lähtöasetelma, ei vanhan askel. Kierros päättyy myös, kun palvelin siirtyy toiselle kartalle (sen istunnot alkavat viimeisen jälkeen ja jatkuvat).
- **Kuka voitti**: päättyneellä kierroksella se puoli, joka piti kaikkia paikkoja sen viimeisen istunnon alussa (`capture`, korkea varmuus), muuten se puoli, joka piti useampia kiistellyistä paikoista (keskitaso, kun niitä oli kaksi kertaa toisen määrä, muuten matala; matala, kun kierros päättyi kartan vaihtoon). Avoimella kierroksella ei ole voittajaa, mutta jokainen istunto kertoo, montako paikkaa kumpikin puoli piti sen alussa, joten näkyy, kumpi oli edellä.
- Palvelin, jonka istunnot alkavat kaikki samoin, ei säilytä tilaa niiden välillä: sitä ei ketjuteta.

Viimeisen istunnon alku voi olla tunteja ennen kierroksen loppua, joten varmuudella on merkitystä. Tarkistettu palvelinta vastaan, joka julkaisee voittajansa: ketju löysi jokaisen uuden kierroksen siitä istunnosta, jossa julkaistu kierros alkoi, ja viimeisessä alussa edellä ollut puoli oli julkaistu voittaja jokaisella niistä 9 kierroksesta, jotka se pystyi tarkistamaan. `--official file.json` säilyttää tällaisen palvelimen julkaistut kierrokset ja lisää niihin ketjun istunnot; tiedoston `validation` kertoo, kuinka pitkälle ketju oli samaa mieltä. Keksityssä kampanjassa:

```json
{ "id": 2, "campaign": "Example Server North 2", "title": "^(?:Example_North_V1\.0)$",
  "start": "2026-11-02T06:00:00.000Z", "end": "2026-11-06T12:00:00.000Z", "winner": "Red", "endReason": null,
  "state": "won (reset)", "confidence": "medium", "ahead": "Red",
  "sessions": [
    { "start": "2026-11-02T06:00:00.000Z", "red": 12, "blue": 11, "redAll": 30, "blueAll": 28, "captures": [] },
    { "start": "2026-11-02T12:00:00.000Z", "red": 14, "blue": 9, "redAll": 32, "blueAll": 26,
      "captures": [{ "lat": 42.36, "lon": 42.02, "from": "Blue", "to": "Red" }, { "lat": 42.4, "lon": 41.98, "from": "Blue", "to": "Red" }] }
  ] }
```

### Kampanjakierroksen katsominen sarjana {#watching-a-campaign-round-as-a-series}

Lataa yhden kierroksen tallenteet yhdessä - tiedostot, joiden `campaign` on sama - niin katselija toistaa ne yhtenä sarjana: istunto istunnolta niiden todellisessa järjestyksessä, ja kahden istunnon väliset tunnit tai päivät lyhennetään yhden minuutin tauoksi. Aikajana merkitsee jokaisen istunnon alun keltaisella ja tauot tummina kaistoina, ja kello kertoo, mitä istuntoa toistetaan, ja sen todellisen päivämäärän (`session 4/12 · 2026-11-02 12:38 UTC`). Lämpö, toisto, suodattimet ja Havainnot toimivat koko sarjassa kuten missä tahansa ladatussa datassa. Ottelu-välilehden **Kampanjakierros**-osio luettelee istunnot päivämäärineen, montako kiisteltyä paikkaa kumpikin puoli piti kunkin istunnon alussa - myös kaaviona kierroksen ajalta - ja montako vallattiin ennen sitä; napsautus vie istunnon alkuun. Yksinään ladattu tallenne kertoo siellä, mikä kierros ja istunto se on. Eri kierrosten tallenteet yhdessä ladattuina eivät ole sarja: kukin alkaa nollasta, kuten erilliset ottelut. Monen ottelun lataaja (**Monta ottelua kerralla**) toistaa myös kierroksen sarjana, suoratoistettuna ja GPU:n mukaan mitoitettuna, monen gigatavun kierroksille.

Paikat, jotka vaihtoivat omistajaa kierroksen aikana, piirretään kartalle valtausalueina, väritettyinä sen puolen mukaan, joka piti kutakin toistettavan istunnon alussa, ja ne vaihtuvat istuntojen rajoilla; jokainen vaihto on valtaus toiston tapahtumaluettelossa. Ne päätellään ladatuista riveistä - kunkin istunnon maayksiköistä ja staattisista kohteista sen ensimmäisinä minuutteina, noin 2 km:n soluina, kuten ketju tekee - joten ne tarvitsevat täyden lataajan (monen ottelun lataaja säilyttää kustakin rivistä liian vähän).

**Koko kierroksen lataaminen yhdestä sen tallenteesta.** Tavallisessa selaimessa katselija ei voi avata tiedostoja, joita et ole valinnut: lataa kierroksen tiedostot yhdessä. Kun paikallinen katselijapalvelin (`npm run dev` tai `npm run preview`) tarjoilee sen, se voi: lisää gitin ohittamaan `tools/local-data.json`-tiedostoon `campaigns`-merkintä, joka nimeää kierrostiedostojen kansion ja muunnettujen tallenteiden kansiot, niin yksittäisen tallenteen Kampanjakierros-osio tarjoaa painikkeen **Lataa koko kierros**, hakee sieltä löytyvät kierroksen istunnot ja lataa ne monen ottelun lataajalla:

```json
"campaigns": { "rounds": "D:/dcs/rounds", "recordings": ["D:/dcs/converted"] }
```

Vain kierrostiedoston nimeämät tallenteet tarjoillaan (`tools/campaign-files.mjs`); istunto, jota ei löydy noista kansioista, lasketaan mutta ei ladata.

Mitä tunnetut palvelimet julkaisevat:

| Palvelin | Kierros | Miten puoli voittaa | Mistä voittajan voi lukea |
|---|---|---|---|
| SPS Contention | kampanja yhdellä kartalla ja aikakaudella (päiviä), monen uudelleenkäynnistyksen yli | kaikki lentokentät, FARP:t ja tukikohdat vallattu; ilman voittajaa päättynyt kampanja vaihdettiin | palvelimen julkinen kampanjaloki (voittaja, alku ja loppu kampanjoittain) |
| Blue Flag | kampanjakierros monen 5 tunnin tehtävän yli; Titlen `_YYYY_MM` etenee kuukauden jokaisella uudelleenkäynnistyksellä | kaikki vihollisen asemat vallattu; vanhemmat kierrokset julistivat voittajaksi puolen, jolla oli enemmän kiinteän ajan jälkeen | ei julkaistu tähän mennessä löydetyssä muodossa; tallenteiden ketju seuraa jokaista kierrosta ja sitä, kuka pitää kuinka paljon kunkin istunnon alussa |
| Growling Sidewinder | avoimen konfliktin tehtävän ajo (6 tuntia) | alueet ja lentokentät vallattu | sen tilastosivu näyttää lentäjiä, ei tuloksia; jokainen istunto alkaa samoin, joten mikään kierros ei ulotu useaan istuntoon: tyhjä |
| Tehtävät tekoälyä vastaan (alueiden valtaustehtävät) | tehtävän ajo | pelaajien puoli tehtävän tekoälyä vastaan: ei PvP-tulosta | tyhjä |
| Ilman kohdetta (otsake ei nimeä palvelinta) | - | - | tyhjä, myös `server` tyhjä |
