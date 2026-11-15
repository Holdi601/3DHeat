---
title: "Tacview-vastaavuus"
parent: "Ottelun toisto"
grand_parent: "Toisto"
nav_order: 1
lang: "fi"
source: "tacview-parity.md"
source_hash: "4275603255c2"
translated: true
outdated: false
---

# Tacview-vastaavuus

Tacview on suosittu ohjelma lentotallenteiden katseluun. Jos tunnet sen, tämä sivu näyttää, missä jokainen sen työkalu on 3DHeatissa.

Sivu luettelee jokaisen Tacview 1.9:n ominaisuuden (sen käsikirja, käyttöliittymän merkkijonotaulukko ja ACMI 2.2 -tiedostomuoto) ja sen, missä [Ottelun toisto](match-replay.md) on siihen nähden. Tavoite: se, minkä Tacview pystyy tekemään toistolle ja sen tiedoille, pystyy myös 3DHeat.

**Tila:**
- **valmis**: on jo 3DHeatissa.
- **uusi**: tehty vastaamaan Tacview-ominaisuutta.
- **ei vielä**: sopii, mutta ei ole tehty.
- **ei sovellu**: ei sovellu tähän, syy kerrottuna.

Ominaisuudet löytyvät **Ottelu**-välilehdeltä, **Hahmotoistosta** (tai **Hahmot päällekkäin** Lämpökartta-välilehdeltä) sivupalkin osioista **Toisto**, **Yksiköt**, **Tapahtumat**, **Kirjanmerkit**, **Taktinen näyttö**, **Tilastot**, **Aikasiirto ja rajaus**, **Kartta ja sijainti**, **Ääni ja video** ja **Nimiöt**. Katso [Ottelun toisto](match-replay.md).

## Kamerat {#cameras}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Ohjaamonäkymä (F5), horisontti kallistuu koneen mukana | **Ohjaamo**: yksikön ulkopuolelta sen asennon mukaan, kuten liikemalli sen esittää. Yksikön oma hahmo leikataan pois. Vedä katsoaksesi ympärille. **Katso taas eteenpäin** palauttaa. | uusi |
| HUD ohjaamonäkymässä (IAS/CAS/TAS-valinta) | **HUD-näyttö** (H): näkymän horisontti ja nyökkäysasteikko, lentorataan osoittava merkki, suuntanauha, IAS, korkeus, TAS, Mach, G, hyökkäyskulma, pystynopeus, AGL | uusi |
| 3D-ohjaamon mittarit, lentäjän pään seuranta (PilotHead*), TrackIR | Ei ohjaamomalleja. Pään kulmat näkyvät yksikkökortin **Raaka**-näkymässä | ei sovellu (ei ohjaamomalleja; pään seuranta on laitteisto live-lentoon) |
| Ulkonäkymä (F6): kiertää ensisijaista kohdetta | **Takaa** (kääntyy yksikön mukana) ja **Kierto** (säilyttää oman suuntansa) | valmis |
| Taisteluilmakamera, "Katso kohdetta" (padlock) | **Padlock**: ohjaamosta, pidetään kohteessa | uusi |
| Taisteluilmakamera, "Keskitetty" / "Katso eteenpäin" | **Kohde**: yksikön takana kohteen linjalla, katsoen kohteen ohi kohteeseen. **Kiinteä** atsimuutissa 0 katsoo eteenpäin edestä. | uusi |
| Ensisijaisen ja toissijaisen vaihto | **Vaihda** kohteen vieressä | uusi |
| Satelliittinäkymä (F7), ortografinen ylhäältä | **Satelliitti**: suoraan alas yksikköön, pohjoinen ylös. Vedä kääntääksesi. 2D-kartta on ortografinen pohjapiirros. | uusi |
| Vapaa kamera (F8), W/A/S/D, E/C | Vapaa lentokamera (W/A/S/D, Välilyönti/Q, Shift/Alt) | valmis |
| Lisäosan Head-On-kamera; objektiin kiinnitetty ulkokamera | **Kiinteä**: paikka yksikön ympärillä, joka kääntyy ja kallistuu sen mukana. Vedä siirtääksesi (takana, siipinkärjessä, edestä) | uusi |
| Lisäosan Lock Camera (jäädytä paikka) | Lopeta seuraaminen (Esc): kamera jää paikalleen | valmis |
| Strateginen näkymä (loitonna koko Maahan) | [Maailman tausta](world-backdrop.md) ja 2D-kartan koko tallenteen kehys | valmis |
| Näkökenttäasetus | **Kamera ja näkymä** -näkökenttä | valmis |
| Näkymien vaihto näppäimillä | **V** seuraava näkymä, **Shift+V** edellinen | uusi |

## 3D-näkymä ja näyttöasetukset {#d-view-and-display-options}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Nauhajäljet, pituusliukusäädin | Jäljet (sekuntia) Tiimi-katselijassa | valmis |
| Ennakoiva jälki (reitti eteenpäin) | **Reitti eteenpäin**: minne yksikkö todella menee seuraavina sekunteina | uusi |
| Kohteen korkeusviivat / seinät | **Pystyviivat** | valmis (viivat; seiniä ei ole tehty) |
| Valitun kohteen vektorit: suunta (pisteviiva), kurssi (yhtenäinen), nosto | **Nopeusvektorit** (kurssi ja nopeus näin monen sekunnin ajalta, vinkin kanssa) ja **Nokka- ja nostoviivat** (nokka katkoviivana, nosto lyhyenä ja tummana) | uusi |
| Lentäjän katselinja | **Lentäjän katselinja**: katkoviivainen syaani viiva PilotHeadYaw/PilotHeadPitch-arvojen (tai HeadYaw-, ViewYaw- tai LookYaw-sarakkeen) mukaan yksikön akseleihin nähden | uusi |
| SAM/AAA-tappoetäisyyskuplat (EngagementRange, VerticalEngagementRange, EngagementMode, "2"-kaksoset) | **Taisteluvyöhykkeet**: kuplat, munamaiset siellä, missä pystyetäisyys eroaa, pois päältä, kun EngagementMode on 0 | uusi |
| Tutkalukitukset (LockedTarget..9) nimiöineen | **Lukitukset**: punaiset viivat jokaiseen lukittuun kohteeseen. Katkoviivana meripihka kohti FocusedTargetia. Kohti LockedTargetAzimuth/Elevation/Range-arvoja siellä, missä kohdetta ei nimetä. **Lukitusten nimilaput**: kohteen nimi ja etäisyys jokaisella lukitusviivalla | uusi |
| Tutkakartio (RadarMode, Azimuth, Elevation, Roll, Range, leveydet) ja etäisyysportti | **Tutkakartiot**: säteen reuna ja keskirengas, käännettynä atsimuutin, korkeuskulman ja kallistuksen mukaan yksikköön nähden. Etäisyysportti kahtena keltaisena reunana. Ilman leveyksiä vain säteen akseli. | uusi |
| Näkölinja kahden valitun kohteen välillä (vihreä / punainen pisteviiva, kun maasto estää) | Mitatun parin viiva kääntyy punaiseksi ja katkoviivaksi, kun taso on niiden välissä | uusi |
| Kaukaisten kohteiden automaattinen suurentaminen | Pienin hahmo näytöllä (pikseleinä) | valmis |
| Leveys- ja pituuspiiriverkko | **Kartta ja sijainti → Ruudukko**: leveys- ja pituuspiirit kameran alla olevalla maalla, pyöreällä välillä korkeuden mukaan (10°:sta 1':een), nimettyinä. Tai **MGRS**-kilometriverkko UTM-vyöhykkeen mukaan, vyöhyke ja 100 km ruutu näkyvissä. 2D-kartan oma ruudukko kuten ennen | uusi |
| Bullseye-renkaat | Renkaat kunkin joukkueen bullseyen ympärillä 2D-kartalla | uusi (vain 2D) |
| Liukupolkupeitto | **Liukupolut**: 3° polkuja, joilla ±0,7° täysmittaiset reunat, kummankin pään yli jokaisen tallenteen lähellä olevan kiitotien päissä. Lähde: OurAirportsin mitatut kynnykset ja korkeudet (ladataan kerran, säilytetään offline-tilassa). Merkki joka meripeninkulmalla, nimettynä lentokentän ja kiitotien mukaan | uusi |
| Korkeusrajoitukset (katto- ja lattiahälytys) | **Korkeusrajoitus**: lattia ja katto. Rajojen ulkopuolella olevien yksiköiden nimiöt muuttuvat punaisiksi, ja jokainen ylitys (lattian alle, katon yli, takaisin sisään) luetellaan. Napsautus vie sinne ja seuraa yksikköä | uusi |
| Tuhotut kohteet harmaina, poistettu 15 min kuluttua | Elämät päättyvät radallaan. Kuollut yksikkö himmennetään yksikkölistassa | valmis |
| Näkyvä / Pois käytöstä -ominaisuudet | Näkyy **Raaka**-näkymässä. Ei piilota mitään | ei vielä |
| Ohjauskepin, kaasun ja polkimen asennot | Kaasu- ja moottoriarvot kentissä; ohjaustulot **Raaka**-näkymässä | valmis (arvoina) |
| Kommentit tekstityksenä | **Viestit tekstityksenä** (Nimiöt): ACMI Message- ja Comment-tapahtumat sekä chat mistä tahansa pelistä (Chat-, Say- tai Radio-tapahtumat tai chat-sarake), näkymän alareunassa kuka sanoi, kuuden sekunnin ajan | uusi |
| Päivämäärän ja UTC-ajan näyttö | Aikajanan kello UTC:llä, kun tallenteessa on viiteaika | valmis |
| Hiiren sijainti leveys/pituus, MGRS, bullseye | Kohdekortti (napsauta pistettä) antaa leveys- ja pituusasteen asteina, minuutteina ja sekunteina sekä MGRS:n maailman metrien vieressä. Bullseye kohdekohtaisesti (kenttä) | uusi |
| Mukautettu logo | Ei tehty | ei sovellu (brändäys) |
| 3D-mallit, lähin, kun tuntematon | Oma hahmokatalogi, lähin vastine, oikea koko | valmis |
| Useita taisteluja (viivat kaikkien parien välillä) | **Taisteluviivat**: jokaisesta yksiköstä valitussa joukossa jokaiseen vastustajaan asetetun etäisyyden sisällä (1-200 km), kukin etäisyyksineen, 60 lähintä paria. Mitattu pari kuten ennen | uusi |

## Nimiöt {#labels}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Nimiöt päälle/pois erikseen valituille ja valitsemattomille kohteille | **Nimiöt** säännöillä **Valitut**, **Ilma-alukset**, **Maa**, **Laivat**, **Aseet** ja **Tekoäly**: näytetäänkö vai ei, omat arvot, prioriteetti | uusi |
| Nimiökentät: nimi, kutsumerkki, lentäjä, nopeudet (TAS/CAS/IAS/Mach/GS), korkeudet (ASL/AGL), VS, AOA, AOS, G (pysty-, sivu-, pituus-), kääntönopeus ja säde, energia, polttoaine paino/tilavuus/virtaus, suunta/kurssi, kallistus/nyökkäys, syke | Jokainen arvo `fields.ts`-tiedostosta: sama lista, laskettuna, kun sitä ei ole tallennettu (arviot merkitty ~). Kallistusnopeus ja SpO2 vain Raakana | valmis |
| Bullseyen sijainti nimiöissä | **Bullseye (suuntima / etäisyys)** -kenttä | uusi |
| ILS-poikkeamat, lennetty matka | Raaka-arvot; lennetty matka tilastoissa | valmis (osittain) |
| Valitsemattoman telemetrian vähentäminen | **Pidä nimilaput erillään**, järjestettynä kunkin säännön prioriteetin mukaan | valmis / uusi |
| Kaikkien maakohteiden nimeäminen / vain uhat | Maa- ja Tekoäly-säännöt | uusi |
| Nimiöiden mittakaava | **Nimilappujen koko** (60-250 %) | uusi |
| Metriset / brittiläiset yksiköt | Metriset / brittiläiset | valmis (kaksi esiasetusta, ei kahdeksaa) |

## Kohdetiedot ja telemetria {#object-info-and-telemetry}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Ensisijainen ja toissijainen valinta | Napsautus seuraa ja valitsee; kahden napsautus mittaa; **Kohde**-valitsin | valmis / uusi |
| Etäisyys / suuntima / aspekti / lähestyminen kahden kohteen välillä | Mitatun parin BRAA-viiva; Etäisyys-, Suuntima-, Aspekti- ja Lähestyminen-kentät seuratusta yksiköstä | valmis |
| Suhteellinen suuntima, katselinjan nopeus | **Suhteellinen suuntima** (seuratun yksikön keulasta, V/O) ja **Näkölinjan kulmanopeus** (°/s) -kentät | uusi |
| Telemetriaikkunat | Yksikkökortti ja kohdistuskortti | valmis |
| Raaka telemetria (jokainen tallennettu ominaisuus, myös tuntemattomat) | **Raaka** yksikkökortissa: jokainen sarake yksikön rivillä kirjoitettuna | uusi |
| Aktiivisten kohteiden luettelo | **Yksiköt**: pelaajat, tekoäly, lennossa olevat aseet, elävät kirkkaina | valmis |
| Tallenteen ominaisuusikkuna (nimi, tekijä, briefing...) | Säilytetään RecordingInfo-sarakkeena; näkyy Raaka-näkymässä | valmis (ei ikkunaa) |
| Sijaintimuodot DMS/MGRS, magneettinen pohjoinen | **Sijainti (lev. / pit.)** DMS-muodossa ja **MGRS**-kentät; **Magneettinen ohjaussuunta** -kenttä; **Magneettiset suunnat** kirjoittaa suunnan, kurssin ja laakerin magneettisina (°M) ja näyttää kompassin molemmilla pohjoisilla ja deklinaation: World Magnetic Model 2025 (julkisen alueen kertoimet), laskettuna tässä yksikön paikalle ja päivämäärälle | uusi |

## Kaaviot {#charts}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Yhden kohteen kaavio, enintään 4 arvoa | **Ajan mukaan** (ja Toiston alla oleva kaavio) | valmis |
| Piirrä enintään 4 kohdetta kerralla | **Vertailu**: yksi arvo enintään 8 yksiköltä yhdellä asteikolla | uusi |
| Arvo arvoa vastaan (energia-ohjattavuustyyli) | **Arvo vs. arvo**: kääntymisnopeus nopeutta tai mitä tahansa paria vastaan, kukin yksikkö viivana, nykyinen piste merkittynä | uusi |
| X-akseli ajan mukaan; zoomaus; ajan selaus kaaviosta | Rulla zoomaa ajassa, kaksoisnapsautus palauttaa, napsautus menee hetkeen | uusi |
| X-akseli ilman tai maan etäisyyden mukaan | **Aika / Ilmaetäisyys / Maaetäisyys** aika- ja vertailukaavioissa; zoomaus ja napsautus toimivat samoin | uusi |
| Valmiit kaaviot (energia, kiihtyvyys...) | Mikä tahansa arvo voidaan valita (energiakorkeus ja sen muutosnopeus ovat arvoja) | valmis |

## Tilastot, lentoloki, tapahtumat {#statistics-flight-log-events}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Lentoloki: lähtö, lasku, ampuminen, osuman saaminen, tuhoaminen, poistuminen alueelta | **Tilastot** yksikköittäin: elämät, tappoja, kuolemia, laukauksia, osumia, osumasuhde, lähtöjä, laskuja, aika ilmassa, suurin G (ja pienin), suurin nopeus, korkeus ja Mach, matka. Lähdöt tulevat TakenOff/Landed-tapahtumista, OnGroundista, AGL:stä tai arviosta (merkitty ~) | uusi |
| Tulosluettelo- ja tehtäväraportti -lisäosat | Joukkueittainen yhteenveto ja eniten tappoja; ottelun yhteenvedon oma tulostaulu | uusi / valmis |
| Lentolokin vienti XML/CSV | **Vie CSV** tilastoille ja tapahtumille sellaisina kuin ne luetellaan | uusi (vain CSV) |
| Telemetrian vienti CSV:nä nopeudella | **Valitun yksikön telemetria**: jokainen arvo, 1-20 kertaa sekunnissa | uusi |
| Tapahtumaloki, kaksoisnapsautus menee sinne ja valitsee | **Tapahtumat**-luettelo, suodatettuna lajin ja yksikön mukaan; napsautus lentää sinne | valmis |
| Edellinen / seuraava tapahtuma (Ctrl+←/→) | **Page Up / Page Down** | uusi |
| Tauko tapahtumassa | **Tauko tapahtumassa** | uusi |
| Aikajanan merkit (vapautukset, osumat, tuhoutumiset; valitun kohteen sininen; kirjanmerkit punaisena) | Tappo- ja kuolemamäärä tiheyspalkkina, seuratun yksikön sininen, kirjanmerkit punaisena; napsautus menee sinne | uusi |
| Tapahtuman poisto, tappo-poisto | Ei tehty | ei sovellu (tapahtumat ovat tallenteen; suodattimet piilottavat ne) |

## Kirjanmerkit {#bookmarks}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Lisää kirjanmerkki valinnalla ja katselukulmalla | **Lisää kirjanmerkki** (B): hetki, vapaa kamera tai seurattu yksikkö näkymineen, etäisyys ja kohde; nimettynä; säilytetään tässä selaimessa tallenteittain | uusi |
| Poista kirjanmerkki | × luettelossa | uusi |
| Kirjanmerkit aikajanalla ja lokeissa | Punaiset merkit; luettelo | uusi |
| Event=Bookmark ACMI:ssa | Luetellaan tallenteen merkkien joukossa, tappojen, kuolemien ja viestien kanssa | uusi |
| Kopiointi/liittäminen-pikanäppäin (näkymän jakaminen) | **Vie / Tuo** kirjanmerkit tiedostona; C kopioi kameran asennon | uusi |

## Toisto {#playback}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Toista/tauko, alkuun, nopeus, aikajanan selaus | Aikajana | valmis |
| Kuva kerrallaan | **,** ja **.** sekunnin verran taakse ja eteen (Shift: kymmenen) | uusi |
| Takaisin toisto | **◀** aikajanalla, **J** (**L** eteenpäin; sama näppäin uudelleen pysäyttää): toistaa lopusta alkua kohti valitulla nopeudella, silmukassa tai pysähtyen alkuun | uusi |
| Ajan hyppy -valintaikkuna | Aikajana ja tapahtumaluettelo | valmis |
| Yhden yksikön aikasiirto (haamu) | **Aikasiirto ja rajaus**: siirrä yhden yksikön lentoa tai koko tallennetta niin monta sekuntia; **Tasaa tallenteet** siirtää useita tallenteita alkamaan yhtä aikaa ja toistaa ne samaan aikaan (kaksi lentoa eri päivinä vierekkäin). Tallenne rakennetaan uudelleen, joten jäljet, tapahtumat, kaaviot ja tilastot seuraavat | uusi |
| Rajaus ennen/jälkeen | **Tästä eteenpäin / Tähän asti / Leikkaa tähän väliin** (kumoaminen säilyttää siirrot), sitten **Vie CSV** (latautuu takaisin 3DHeatiin) tai **Vie ACMI** (Tacview 2.2 -teksti, maahan sijoitetulle tallenteelle) | uusi |

## Maasto ja kartta {#terrain-and-map}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Todellinen maasto, mukautettu korkeus ja tekstuurit | Tasot (pelin oma kartta 3D-mallina), maailman taustan laatat | valmis |
| Tasainen / tyhjä / korkean kontrastin maastotilat | [Tason ulkoasu](level-appearance.md): maanmuodot, pinta ja rakenteet näkyvinä tai piilossa | valmis (ei samoja tiloja) |
| 2D-taktinen kartta (Tacviessä ei ole, siellä on satelliittinäkymä) | **2D-kartta**: kulma- tai koko näkymä, symbolit lajin ja joukkueen mukaan (täytetyt pelaajat, ääriviivalliset tekoälyt) käännettynä suuntaansa, jäljet, nimet, mittakaavapalkki, etäisyysrenkaat seuratun yksikön ympärillä, bullseye-renkaat, 3D-kameran paikka, viimeaikaiset kuolemat; vedä, rulla, napsautus seuraa (M) | uusi |
| Staattiset kohteet (lentokentät, kiitotiet, pisteet, alueet, KML) | Mitatut kiitotiet (OurAirports) maailman taustassa ja niiden liukupolut; GPX-pisteet ja KML-merkit latautuvat paikallaan oleviksi kohteiksi; [Taktiikkataulu](tactics-board.md) piirtää alueet ja reitit | uusi |

## Tuonti, vienti, tallennus {#import-export-recording}

| Tacview | 3DHeat | Tila |
|---|---|---|
| ACMI-teksti ja zip | [Tacview ACMI](tacview-acmi.md) | valmis |
| GPX, KML, CSV, NMEA, IGC, FIT, DIS... | **GPX** (radat, reitit, pisteet; Garminin syke, kadenssi, teho, lämpötila), **KML/KMZ** (gx:Track, LineString, Point), **NMEA 0183** (RMC ja GGA mistä tahansa puhujasta, tarkistussummat tarkistettu, yli keskiyön), **IGC** (B-tietueet, päivämäärä, lentäjä ja liidin), **FIT** (record-viestit, pakatut aikaleimat). Jokainen sijoitetaan leveys- ja pituusasteen mukaan tasolle tiettyjen ratojen keskikohdassa, jotta maailman tausta asettuu kohdalleen. Suunta, nyökkäys ja nopeus tiedostosta tai kiinnityksestä toiseen. CSV ja Parquet kuten ennen | uusi (DIS ei sovellu: live-verkkoprotokolla) |
| Omat tallentimet (DCS, BMS, IL-2, MSFS...) | 3DHeatin omat muuntimet (War Thunder, CS2, Squad, Arma ja muut) | valmis (omat) |
| Reaaliaikainen telemetria TCP:n yli, ADS-B | Ei tehty | ei sovellu (toistot ottelun jälkeen) |
| Synkronoitu ääni/video | **Ääni ja video**: paikallinen tiedosto toistuu, pysähtyy, hakeutuu ja muuttaa nopeutta aikajanan mukana annetusta alusta (**Alkaa nyt**, ±0,1 s); video kokoa muutettavassa paneelissa näkymän päällä tai kuva kuvassa. Tiedosto pysyy selaimessa | uusi |
| Videon vienti | [Kameran polku ja video](camera-path-and-video.md) | valmis |

## Muut {#other}

| Tacview | 3DHeat | Tila |
|---|---|---|
| Lua-lisäosat | Ei tehty | ei sovellu (avoin lähdekoodi: muuta katseluohjelmaa itseään) |
| Verkkojälkipuinti (jaettu sessio) | Ei tehty | ei sovellu (Tacviewn verkkojälkipuinti on isännöity sessio, joka pitää kaikki samassa toistokohdassa. 3DHeatilla ei ole palvelinta, ja tallenteet pysyvät katseluohjelman koneella. Vertaisverkkokin tarvitsee signalointipalvelimen. Jälkipuinti jaetaan tiedostoina: rajattu tallenne (Vie ACMI tai CSV) ja kirjanmerkkitiedosto, jotka avautuvat samoilla hetkillä ja näkymillä) |
| Lennonjohdon etäohjaus | Ei tehty | ei sovellu (ohjaa käynnissä olevaa simulaattoria) |
| Kohteiden muokkaus (lisää, muokkaa, poista) | [Taktiikkataulu](tactics-board.md) suunniteltuihin kohteisiin; tallenteet ovat vain luettavia | ei sovellu |
| Kielet | 40 kieltä | valmis |
| Tallenteiden todentaminen | Ei tehty | ei sovellu |

## Kehittäjille: ACMI 2.2 -ominaisuudet {#for-developers-acmi-22-properties}

Luetaan tiedostosta `data/acmi.ts`. Numeeriset ominaisuudet muuttuvat numerosarakkeiksi, tekstiset luokkasarakkeiksi. Kaikki näkyvät **Raaka**-näkymässä yksikkökortissa. Ne luetaan tiettyyn tarkoitukseen:

| Ominaisuudet | Käyttö |
|---|---|
| T (kaikki neljä muotoa), Name, Type, Pilot, Group, Country, Coalition, Color, CallSign | Sijainti, asento, hahmo, yksikön nimi, joukkue |
| IAS, CAS, TAS, Mach, AOA, AOS, AGL, HDG, HDM, OnGround | Kentät, kaaviot, HUD, lähdön ja laskun tunnistus |
| VerticalGForce, LongitudinalGForce, LateralGForce | G-kentät |
| Throttle(2), Afterburner, EngineRPM(2), NR, AirBrakes, Flaps, LandingGear, Tailhook | Kentät |
| FuelWeight..9, FuelVolume..9, FuelFlowWeight..8 | Polttoainekentät, summattu säiliöittäin |
| RadarMode, RadarAzimuth, RadarElevation, RadarRoll, RadarRange, RadarHorizontalBeamwidth, RadarVerticalBeamwidth, RadarRangeGateAzimuth/Elevation/Min/Max/HorizontalBeamwidth/VerticalBeamwidth | Tutkakartiot ja etäisyysportti |
| LockedTarget..9, LockedTargetMode, LockedTargetAzimuth/Elevation/Range, FocusedTarget | Lukitusviivat |
| EngagementMode(2), EngagementRange(2), VerticalEngagementRange(2) | Taistelukuplat |
| QNH, AltimeterSetting, WindSpeed, WindDirection, HeartRate | Kentät |
| Health | Kenttä |
| Tapahtumat: Destroyed, TakenOff, Landed, Bookmark, Message, Comment, LeftArea, Timeout | Tapahtumaluettelo, tilastot (kuolemat, lähdöt, laskut), kirjanmerkit; Message ja Comment tekstityksinä |
| PilotHeadYaw, PilotHeadPitch | Lentäjän katselinja |
| Tyyppitunniste Bullseye (Navaid+Static+Bullseye) | Bullseye-kenttä ja karttarenkaat |
| Kaikki muut (PilotHeadRoll, ohjaimet, pinnat, ILS-poikkeamat, SpO2, ENL, Label, Debug, Importance, Slot, Visible, Disabled, Radius, koot...) | Näytetään kirjoitetussa muodossa **Raaka**-näkymässä |

Tutka- ja lukituskulmat otetaan yksikön omiin akseleihin nähden: atsimuutti oikealle, korkeuskulma ylös, kallistus oikea siipi alas. ACMI-määritys sanoo, että ne ovat suhteessa koneeseen, mutta ei sitä, mikä suunta on positiivinen. Tämä tulkinta seuraa sen muunnosta (kiertokulma myötäpäivään, nyökkäys ylös, kallistus oikealle).
