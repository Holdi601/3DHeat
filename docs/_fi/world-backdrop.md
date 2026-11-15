---
title: "Maailmatausta"
parent: "Kentät ja taustageometria"
nav_order: 5
has_children: true
lang: "fi"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Maailmatausta

Maailmatausta asettaa todellisen maanpinnan lentotallenteen alle: mäet, tiet, joet, lentokentät ja rakennukset, ladattuna vapaasta karttadatasta. Käytä sitä, kun Tacview-tallenne muuten leijuisi tyhjällä ruudukolla. Se on [taso](glossary.md), joten lämpö ja hahmot ovat sen päällä.

## Rakenna tausta {#build-one}

1. Lataa lentotallenne, jossa kerrotaan, missä maapallolla se on (Tacview-tiedosto `.acmi`), tai älä lataa mitään ja valitse sotanäyttämö vaiheessa 3. Katso [Datan lataaminen](getting-data-in.md).
2. Avaa **Tausta / kenttä** sivupalkista.
3. Paina **Todellinen maailma taustana** -painiketta rakentaaksesi maan datasi alle. Tai valitse pelikartta kohdasta **Sotanäyttämö** ja paina **Rakenna sotanäyttämön tausta** (tai **Suoratoista taistelualue**).
4. Odota. Paneeli näyttää edistymisen (*Korkeusruudut*, *Karttaruudut*, *Taustan rakentaminen*); **Peruuta** pysäyttää sen.
5. Lennä ympäriinsä. Kartta-aineiston lähdemerkintä kirjoitetaan näkymän oikeaan alakulmaan.

Ensimmäinen rakennus lataa muutamia kymmeniä megatavuja. Selain säilyttää ne, joten saman alueen toinen rakennus ei lataa mitään. **Unohda karttaruudut** poistaa ne. **Todellinen maailma taustana** -painike näkyy vain, kun ladattu data kantaa maantieteellisen viitteen (alla).

Kaikki rakennetaan taustatyössä ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Tulos korvaa nykyisen tason ja toimii kuten mikä tahansa [3D-taso](model-levels.md): se piilottaa lämmön takanaan, leikkaantuu viipaleesta, sillä on [ulkoasun säätimet](level-appearance.md) ja se voidaan tallentaa [kirjastoon](level-library.md).

## Missä data on: maantieteellinen viite {#where-the-data-is-the-geographic-reference}

Aineisto saa maantieteellisen viitteen vain lähteeltä, joka sen kertoo:

- **ACMI-tallenne**: sen otsikon `ReferenceLatitude` ja `ReferenceLongitude`, ja sijainnit, jotka lukija heijastaa tasoon, joka koskettaa WGS84-ellipsoidia siinä kohdassa (X itään, Y pohjoiseen, metreinä; korkeudet ovat tallenteen korkeus merenpinnasta). Viite säilyy, kun kuvaus ottaa maa-akseleiksi **X** ja **Y** - tallenteen omat vihjeet tekevät niin - ja se pudotetaan, kun maa tulee muusta sarakkeesta, kuten pelin oman tasomaailman **U** ja **V**.
- **Parquet-taulukko, jonka `heat3d`-vihjeissä on `geo`-kohta** - [Watcherin](https://github.com/Holdi601/3DHeat-Watcher) DCS-, MSFS-, X-Plane- ja IL-2 (Tacview) -taulukot. Kohta on kuvattu kohdassa [Kehittäjille](#for-developers).

Useamman tiedoston lataus säilyttää viitteen vain, jos kaikilla on sama. Kaikki muut lataajat eivät muutu eivätkä kanna viitettä.

Tausta heijastetaan samalla tavalla ja viedään sitten latauksen akselikohdistuksen läpi, joten se asettuu datan alle mistä tahansa käännöksestä tai mittakaavasta kohdistus tekee.

## Sotanäyttämöt {#theatres}

**Sotanäyttämö**-valitsin listaa DCS Worldin todelliset kartat (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) ja IL-2 Great Battlesin (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), kullakin oma laatikko maapallolla ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). DCS-laatikot ovat editorien laajuuksia, jotka on laskettu julkaistuista projektioista; IL-2-laatikot ja merkityt DCS-laatikot ovat arvioita karttojen julkaistuista kooista ja reunoilla olevista kaupungeista - paneeli kertoo, mitkä.

**Rakenna sotanäyttämön tausta** rakentaa kaksi yksityiskohtatasoa yhteen verkkoon:

| Taso | Alue | Maasto | Kartta |
|---|---|---|---|
| Sotanäyttämö | koko laatikko | syvin zoom enintään 10, joka tarvitsee enintään 64 korkeusruutua (noin 3 km per piste Caucasuksella, 1 km Normandiassa) | meri, järvet, maanpeite ja moottoritiet enintään 64 vektoriruudusta zoomilla 4-9 |
| Yksityiskohtainen alue | **Datan alla**, **Pisteen ympärillä** (leveyspiiri, pituuspiiri, 12-400 km) tai ei mitään | enintään zoom 12 sisään enintään 100 ruudussa, enintään 500 000 pistettä | kaikki yllä, enintään 1 500 vektoriruudusta syvimmällä zoomilla, joka vielä mahtuu, enintään 14 |

Yksityiskohtainen alue leikkaa reiän sotanäyttämön ruudukkoon. Reikä leventyy kokonaisiin soluihin, jotta molemmat ruudukot jakavat reunaviivansa, ja ohut seinä sulkee saumat, joissa ne otostavat korkeuksia eri tavalla.

Kun data on ladattu, sotanäyttämö rakennetaan datan tasolle, joten se asettuu sen alle sellaisena kuin se rakennettiin. Ilman dataa se rakennetaan sotanäyttämön oman viitepisteen ympärille (kokonaisiin asteisiin sen yksityiskohtaisen alueen lähellä). Myöhemmin ladattu data toisella viitteellä - ACMI-tiedosto nimeää oman - siirtää taustan sen alle: tarkka siirto kahden projektion välillä lasketaan 256 × 256 ruudukolla taustan päällä ja luetaan solmujen välistä, metrin tai parin tarkkuudella koko sotanäyttämön yli ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Kirjastoon tallennettu tausta säilyttää paikkansa ja siirtyy samalla tavalla, kun se ladataan muun datan alle.

### Sotanäyttämön suoratoisto {#streaming-a-theatre}

**Suoratoista taistelualue** näyttää sotanäyttämön kuten lentosimulaattorin karttanäyttö: maa tulee kameran ympärille monina pieninä ruutuina, ladattuina lennon aikana ja pudotettuina, kun ne jäävät kantaman ulkopuolelle ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Web Mercator -ruutujen nelipuu.** Juuret zoomilla 5 kattavat 1 500 km kameran ympäriltä, joten maa ulottuu sotanäyttämön laatikon ohi horisonttiin asti. Ruutu jaetaan neljään lapseensa, kun kamera on lähempänä kuin 1,4 kertaa ruudun leveys, aina zoomiin 15 asti (noin 1 km ruutu, 15 m maastopisteiden välillä): yksityiskohdat vähenevät etäisyyden mukana, kuten ruudulla.
- **Jokaisella ruudulla oma verkko**, rakennettuna taustatyössä ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): 65 × 65 maastoruudukko, jonka reunan ympärillä on helma, jotta eri tarkkuudella olevat naapurit eivät koskaan näytä halkeamaa; maanpeite ja meri maalattuna sen päälle, tiet, rautatiet, järvet, joet, lentokentät, mitatut kiitotiet ja rakennukset päälle, ja tarvittaessa ruudun satelliittikuva. Piirtäjä piirtää ruudut tason ulkoasulla ja syvyyssäännöillä, joten ne piilottavat lämmön takanaan kuten mikä tahansa taso.
- **Karkea ensin.** Ruutuja pyydetään karkeina ja läheltä ensin, neljä latausta kerrallaan lähdettä kohti; kun ruudun lapset latautuvat, ruutu on niiden sijaisena, joten näkymä täyttyy heti ja terävöityy.
- **Muisti**: rakennetut ruudut säilytetään enintään 600 Mt:iin asti, vähiten äskettäin piirretty pudotetaan ensin. **Lataukset** pysyvät ruutuvälimuistissa, rajana 2 Gt budjetti, vanhimmat ulos ensin: alueen yli lentäminen takaisin ei maksa mitään, eikä rakennuskohtaista rajaa ole.
- **Tallennetaan kirjastoon** sen mukaan, mitä se suoratoistaa - sotanäyttämö, sen asetukset ja paikka maapallolla - ei ruutuina: lataaminen suoratoistaa uudelleen, välimuistista, missä ruudut ovat yhä tallella. Napsautukset ja tarkastelija osuvat ruutuihin kuten mihin tahansa tasoon.
- Molemmat piirtäjät piirtävät ruudut: tarkistettu rinnakkain oikealla näytönohjaimella (WebGPU ja WebGL2 samalla kortilla), myös harjanteen taakse piilotettu lämpö mukaan lukien.
- Kun data on ladattu, ruudut rakennetaan datan tasolle; myöhemmin toisella tasolla ladattu data rakentaa ne uudelleen sinne (välimuistista).
- Mitattu synteettisillä lennoilla kolmessa paikassa (Normandia, Nevada, Syyria): noin 63, 45 ja 24 Mt ensimmäisellä käynnillä kuvien kanssa; toinen käynti ei lataa mitään.

## Mitä rakennetaan {#what-is-built}

| Osa | Lähde | Miten |
|---|---|---|
| Kuvat (suoratoistetut sotanäyttämöt, valinnainen) | EOX Sentinel-2 cloudless 2016 | **Satelliittikuvat** peittää pilvettömän vuoden 2016 mosaiikin (noin 10 m pikseli, zoom 14, syvemmät ruudut suurentavat sitä) maanpinnan päälle maalatun maanpeitteen sijaan; tiet, kiitotiet, rakennukset ja nimet pysyvät päällä. |
| Tarkemmat kuvat (USA, Ranska) | USGS National Map -ilmakuvat; IGN BD ORTHO | Kun **Satelliittikuvat** on päällä, kartta-ruutu zoomilta 13, joka on kokonaan Yhdysvaltojen mantereella tai Ranskan suurkaupunkialueella, ottaa sen sijaan kansallisen ilmakuvan, kaksi zoomia syvemmältä (kuusitoista sen ruutua yhdessä kuvassa, noin 1-2 m pikseli läheltä). Muualla EOX. |
| Maasto (suoratoistetut sotanäyttämöt) | Mapterhorn | Copernicus GLO-30 kaikkialla (noin 19 m pikseli zoomilla 12), metrin tarkkuus, missä maan oma mittaus on mukana (Ranska, USA ja muut); luetaan kaksi zoomia karkeampana kuin kukin ruutu. AWS Terrain Tiles, jos Mapterhornia ei saavuteta. |
| Maasto | AWS Terrain Tiles (Terrarium PNG) | Korkeusruudukko laatikon yli: zoom on syvin enintään 12 (noin 28 m pikseli 43° N:ssä), joka tarvitsee enintään 36 ruutua, ja ruudukko harvennetaan enintään 400 000 pisteeseen. Piirretään maana tavallisin korkeusvihjein. |
| Tiet, rautatiet | OpenFreeMap-vektoriruudut, `transportation`-taso | Litteät nauhat maaston päällä, tihennetty maaston välille ja nostettu muutaman prosentin verran, etteivät ne kilpaile sen kanssa. Leveydet luokan mukaan, 16 m (moottoritie) - 3 m (ajoura, rata); ei koskaan kapeampia kuin laatikon lävistäjä / 5000. Polut, lautat ja tunnelit jätetään pois. |
| Lentokentät | `aeroway`-taso | Kiitotie-, rullaus-, tasanne- ja helikopterikenttämonikulmiot maaksi; kiitotie- ja rullausviivat 45 m ja 18 m nauhoina. |
| Vesi | `water`-taso | Meri tasaisena 0 m:ssä, järvet ja lammet tasaisena matalimmalla rannallaan, joet maalle asetettuina. Piirretään vetenä: tasaisesti varjostettuna, ei korkeuskäyriä. |
| Maanpeite | `landcover`- ja `landuse`-tasot | Maalattu maaston omiin pisteisiin, ei ylimääräisiä kolmioita: metsät, nurmi ja puistot vihreinä, pellot olkikeltaisina, kosteikko, hiekka, kallio, jää; asuin-, teollisuus-, liike-, sotilas- ja louhosalueet vaimeissa sävyissä. Vesi maalataan myös vesipinnan alle, joten ranta näkyy mistä korkeudesta tahansa. Paljas maa saa hiljaisen korkeussävyn (tasanko harmanvihreä, ylänkö ruskea, lumi yli 3 000 m). Luettavissa maaston tarkkuudella: noin 30-45 m yksityiskohtaisella alueella, kilometrejä sotanäyttämössä. |
| Paikannimet | `place`- ja `aerodrome_label`-tasot | Kaupungit, kaupunkiet ja kylät sekä lentokentät ICAO-koodeineen, kirjoitettuina näkymän päälle; kunkin tyypin näkyvyys kasvaa kameran korkeuden mukana, enintään 70 kerralla. |
| Mitatut kiitotiet | [OurAirports](https://ourairports.com/data/) `runways.csv` (julkinen omaisuus) | Valinnainen (**Kiitotiet OurAirportsista**, oletuksena päällä): jokainen avoin kiitotie, jonka molemmat päät ovat listalla, kynnykseltä kynnykselle listatulla leveydellä, sivuraidoin, katkoviivakeskiviivalla ja kynnyspalkein. Yksi 4 Mt:n lista, ladattu kerran ja pidetty välimuistissa. |
| Rakennukset | `building`-taso | Pohjat puristettuina korkeudelta `render_min_height` korkeuteen `render_height` (6 m, jos puuttuu) alimman niiden alla olevan maan yläpuolella; `hide_3d`-osat ohitetaan. Piirretään rakenteina. |

Vektoriruudut luetaan zoomilla 14 (ainoa zoom, jolla on rakennuksia), kun laatikko tarvitsee enintään 300 niitä; muuten syvimmällä zoomilla, joka siihen riittää, aina 8:aan asti. Suurempi alue saa vain maaston.

### Ulkoasu {#look}

Taustan alussa **Näytä kuvattu väri** on päällä - väri on se, mikä erottaa vaalean tien harmaasta maasta, jolla se on, tumman kiitotien sen tasanteesta - kolmioiden reunat maasta pois päältä, koska säännöllinen ruudukko ei kerro mitään, himmeät korkeuskäyrät, läpinäkyvä meri (pohja sen alla kilpailisi pinnan kanssa syvyydestä kaukana) ja rakennukset vaaleanharmaina ja lähes umpinaisina, kuten kartta ne piirtää. Avomeri ei saa lainkaan maakolmioita. Kaikki muu on mallitason oletusulkoasu.

## Tekijänoikeusmerkinnät kankaalla {#credits-on-the-canvas}
Kun tausta on taso, sen lähteiden merkintä kirjoitetaan näkymän oikeaan alakulmaan ilman napsautusta, jotta kuvakaappaukset ja renderöidyt videot kantavat sen mukanaan:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Jokainen osa linkittää lähteensä tekijänoikeussivulle (openstreetmap.org/copyright ja Terrain Tilesin [tekijänoikeusluettelo](https://github.com/tilezen/joerd/blob/master/docs/attribution.md)). Kirjastoon tallennettu tausta säilyttää merkintänsä ja näyttää ne uudelleen ladattaessa. Teksti käännetään katselimen mukana; nimiä ei käännetä.
## Lähteet ja niiden ehdot {#sources-and-their-terms}

Jokainen lähde, sen lisenssi ja se, miten tausta pysyy ehtojen sisällä: [Maailmatausta: lähteet ja ehdot](world-backdrop-sources.md).

## Välimuisti {#the-tile-cache}

Jokainen ruutu ja vektoriruutujen TileJSON säilytetään selaimen Cache API:ssa nimellä `3dheat-world-tiles-v1`, URL-osoitteen mukaan. Saman alueen toinen rakennus ei tee pyyntöjä lainkaan ja toimii offline-tilassa: TileJSON pyydetään ensin, ja jos se epäonnistuu, sen välimuistikopio nimeää jo tallessa olevat ruudut. Palvelimelta puuttuvat ruudut (avoin meri, 404) muistetaan myös puuttuvina.

Vektoriruudun URL-osoitteet kantavat kartan rakennuspäivän, joten kun OpenFreeMap julkaisee uuden version, seuraava tausta lataa tuoreet ruudut ja vanhat jäävät, kunnes ne tyhjennetään. Välimuisti on rajattu 2 Gt:hen: sen ylittyessä pisimpään tallessa olleet ruudut poistetaan ensin. **Unohda karttaruudut** poistaa koko välimuistin. Välimuisti vaatii suojatun alkuperän (`https://` tai `localhost`); muualla jokainen rakennus lataa uudelleen.

## Vertailu Tacviewiin {#compared-with-tacview}

Silmämääräisesti tarkistettu yhdessä paikassa per sotanäyttämö synteettisillä tallenteilla: lähtörullaukset osuvat piirrettyjen kiitoteiden keskiviivoille, rannikon ylitykset osuvat rannikolle. Tacviewn puoli on sen dokumentaatiosta ja julkaistuista kuvakaappauksista (tacview.net, sen Steam-sivu), ei sen ajamisesta täällä.

| | Tacview 1.9 | Tämä tausta, suoratoistettuna |
|---|---|---|
| Laajuus | koko maapallo | 1 500 km kameran ympäriltä, missä se onkin |
| Maasto | ETOPO1 (noin 1,25 km) sisäänrakennettuna; SRTM 25-75 m, jos käyttäjä asentaa tiedostot; DCS-maasto viety DCS:stä | Copernicus GLO-30 (Mapterhorn), metrin tarkkuus Ranskassa ja USA:ssa |
| Kuvat | ei sisäänrakennettuna; käyttäjän lataamat tekstuurit (Mapview, SAS Planet, lisäosat kuten Caucasus VFR -kartta) | EOX Sentinel-2 cloudless 2016, noin 10 m, suoratoistettuna |
| Maanpeite | ei, ellei tekstuurissa | OpenStreetMapista, maalattuna maastoon (ilman kuvia) |
| Tiet, rautatiet | ei, ellei tekstuurissa | jokainen luokka kameran lähellä, pääteiet kaukana |
| Rakennukset | ei | puristetut pohjat kameran lähellä |
| Lentokentät | nimiöt ja kiitotiet tasaisina laatikoina, ilman merkintöjä | kiitotiet mitattuine päineen, sivuraidoin, keskiviivoin ja kynnyspalkein; rullausradat, tasanteet; nimet ICAO-koodeineen |
| Paikannimet | joitakin kylien ja kaupunkien nimiä | kaupungit, kaupunkiet, kylät, lentokentät, etäisyyden ja korkeuden mukaan |

Missä se vielä jää jälkeen:

- **Kuvien tarkkuus**: Yhdysvaltojen ja Ranskan ulkopuolella 10 m satelliittimosaiikki on pehmeä alle noin 2 km:n päässä; Tacview käyttäjän asentamalla zoom-17-tekstuurilla on siellä terävämpi.
- **Maasto DCS:n omassa muodossa**: Tacview voi näyttää maaston, jonka DCS itse vie; tässä on todellinen maapallo, joka eroaa DCS:n maastosta siellä, missä kartan mallintajat ovat sitä muuttaneet.
- **Kaarevuus**: maa on tasainen taso, joten horisontti ei ole kaarevan maan horisontti; Tacview piirtää pallon.
- **Nopeus**: paikan ensimmäinen käynti lataa kymmeniä megatavuja ennen kuin se on terävä; ohjelmistorenderöidyssä selaimessa (kuvakaappaukset) se piirtää muutaman kuvan sekunnissa useiden satojen ruudun kanssa.

## Rajat ja mitä tulee myöhemmin {#limits-and-what-comes-later}

- **Maaston tarkkuus**: parhaimmillaan noin 30 m, ja suurilla alueilla karkeampi. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (pilvioptimoidut GeoTIFF-tiedostot AWS:ssä, ei avainta, kiinteä tekijänoikeusteksti) on parempi lähde: 30 m kaikkialla, GLO-90 siellä, missä GLO-30:ssa on aukkoja (Armenia ja Azerbaidžan, jotka DCS Caucasus kattaa). Se tarvitsee GeoTIFF-lukijan, eikä sitä vielä käytetä.
- **Parempi maasto**: Copernicus GLO-30 AWS:ssä ei lähetä CORS-otsikoita, joten selain ei voi lukea sitä; OpenTopographyn peili voidaan lukea (CORS ja alueet), mutta niiden ehdot julkisen sovelluksen ajoaikaiseen käyttöön ovat tuntemattomat - kysyttävä ennen käyttöä. Mapterhorn sisältää GLO-30:n jo.
- **Kaarevuus**: maa on tasainen taso, eikä korkeuksia lasketa maapallon kaarevuuden mukaan, mikä vastaa tapaa, jolla tallenteet sijoitetaan (korkeus korkeutena); viitteestä kaukana molemmat ajautuvat yhdessä, alle promillen 100 km:llä. Pelkkien ruutujen taivuttaminen irrottaisi ne datasta kaukana, joten sitä ei tarjota. Kaareva horisontti vaatii saman pudotuksen - etäisyys kamerasta neliöön jaettuna kahdella maapallon säteellä - sovellettuna jokaisessa vaiheessa, joka piirtää sijainnin (taso, ruudut, lämpö, viivat, laatikot, nimiöt, valinta) yhtenä yhteisenä muuttujana; todellinen pallo vaatii myös datalle maakeskeiset sijainnit ja kameraan suhteutetun renderöinnin. Molemmat on suunniteltu pallotilan yhteyteen.
- **Vain nykyajan maailma**: DCS:n ja IL-2:n historialliset kartat (Normandy 2, The Channel, Germany Cold War, kaikki IL-2-kartat) piirretään nykyajan kaupungeilla, teillä ja rannikkotöillä; paneeli sanoo sen. Ajanjakson kentät eivät piirry.
- **Ei pallotilaa**: tausta on litteä paikallinen taso. Koko maapallon näkymä on suunnitteilla.
- Tiet leventyvät suurilla alueilla, jotta ne pysyvät näkyvinä; läheltä ne ovat leveämpiä kuin elämässä.
- DCS-sotanäyttämöiden nimet Watcherin taulukoissa vastaavat niitä, joina DCS ne antaa kohdassa `mission.theatre`; nimi, jota ei ole listalla, palaa ensimmäiseen kiinteään pisteeseen pyöristettynä kokonaisiin asteisiin, ja vain leveyspiiriin ja pituuspiiriin.

## Historialliset kartat (ei vielä rakennettu) {#historical-maps-not-built-yet}

Ajanjakson kartat voisivat myöhemmin kuvioida historialliset sotanäyttämöt. Yhdysvaltain armeijan kartoituspalvelun (AMS) sarjat ovat Yhdysvaltain liittovaltion hallituksen teoksia, joita yleensä pidetään julkisena omaisuutena (tarkista jokaisen skannauksen tietue; monet ovat brittiläisten GSGS- tai saksalaisten alkuperäiskarttojen uusintapainoksia, joiden Crown-tekijänoikeus tai anonyymin teoksen aika on myös päättynyt):

| Sotanäyttämö | Sarja | Mistä skannattu |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Itä-Eurooppa 1:250 000 (koottu 1950-luvulla neuvostoliittolaisista ja saksalaisista kartoista) | UT Austin PCL; osa lehdistä georeferoitu UT GeoDatassa |
| IL-2 Normandy, DCS Normandy 2 ja The Channel | AMS **M661** / GSGS 4250, Ranska 1:50 000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250 000 ja **M841** 1:25 000 (Saksa) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50 000 (vuoden 1951 painokset) ja **L552** 1:250 000 | ANU Open Research (L751-lehdet, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | brittiläiset ensimmäisen maailmansodan juoksuhautakartat (ei AMS) | McMaster University; National Library of Scotland (ei-kaupalliset ehdot) |

AMS-lehdissä on leveyspiiri- ja pituuspiiriviivat kulmissaan, joten kukin sijoitettaisiin nelikulmasovituksella ja kuvioitaisiin maastolle tekstuurina, rakennettuna ja säilytettynä paikallisesti kuten ruudut.


## Kehittäjille {#for-developers}

### `geo`-kohta Parquet-taulukossa {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` ja `up` nimeävät sarakkeet, jotka sisältävät idän ja pohjoisen metrit samalla tangenttitasolla kohdassa (`lat0`, `lon0`) sekä korkeuden. Lataus kantaa viitteen, kun sen kohdistus ottaa juuri nuo sarakkeet (itä X:nä, pohjoinen ja korkeus Y:nä ja Z:nä kumpaan suuntaan tahansa). Valinnainen `dcs`-kohta nimeää DCS-taulukon omat metrit (x pohjoinen, y ylös, z itä) ja sen sotanäyttämön: lataus, joka kohdistaa nuo sarakkeet, sijoitetaan sen sijaan sotanäyttämön poikittaisen Mercatorin projektion kautta ([DCS-koordinaatit](#dcs-coordinates)). Taulukko ilman `geo`-kohtaa luetaan kuten ennen.

### DCS-koordinaatit {#dcs-coordinates}

Jokainen DCS-sotanäyttämö on poikittainen Mercator-projektio (WGS84, mittakaava 0,9996) omalla keskimeridiaanillaan ja lähtöpisteellään; DCS:n x on pohjoissuuntainen ja z itäsuuntainen. Vakiot ovat ne, jotka pydcs-projekti julkaisee; laskenta on Krügerin sarja kuudennessa kertaluvussa (Karney 2011), siirrettynä kohtaan [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). DCS-metreille rakennettu tausta on rakennettu suoraan niissä, joten Watcherin DCS-taulukko, joka on kohdistettu `dcs_x`/`dcs_y`/`dcs_z`-sarakkeilla, DCS-maastomuuntimen kirjoittama taso ja tausta jakavat kaikki saman kehyksen. Iraqin vakioita ei ole julkaistu; ne on sovitettu julkaistuihin viitepisteisiin (4 cm neliöllinen keskiarvo).

Watcherin DCS-taulukot ovat tangenttitasolla sotanäyttämön kiinteässä viitepisteessä (sama piste, jota sotanäyttämön valitsin käyttää, alla), joten useat tehtävät samalla sotanäyttämöllä yhdistyvät viitteineen ehjinä ja asettuvat sotanäyttämön taustan kanssa linjaan siirtämättä sitä.

### Yksinkertaistaminen ja budjetti {#simplification-and-budget}

- Alle 20 m² rakennukset pudotetaan; 60 m², kun laatikko on yli 30 km leveä, ja yli 80 km:n päässä 150 m². Loput lisätään suurimmasta alkaen, kunnes rakennukset ovat 1,5 M kolmiota.
- Pienet tiet, huoltotiet ja ajourat pudotetaan yli 60 km:n laatikoissa; yli 150 km:n päässä jäljelle jäävät vain moottoritiet, pääväylät, ensisijaiset ja toissijaiset tiet.
- Koko tausta pysyy noin 3 M kolmion alla. Tuontihuomautus kertoo, kuinka monta rakennusta jätettiin pois.
