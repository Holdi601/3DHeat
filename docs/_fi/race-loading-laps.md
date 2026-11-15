---
title: "Kierrosten lataaminen"
parent: "Kisa-analyysi"
nav_order: 51
lang: "fi"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Kierrosten lataaminen

Kierrostiedosto on yhden ajon tallenne: missä auto oli ja mitä kuljettaja teki, monta kertaa sekunnissa. Lataa kaksi tai useampi saman radan kierros, ja **Kisa-analyysi**-välilehti voi verrata niitä.

![Kisa-analyysi-välilehden Kierrokset-osio, jossa on ladattuna kolme esimerkkikierrosta: kierroslista, vertailutähti, tarkennus](../assets/img/en/race-loading-laps-list.webp)

## Ensimmäiset kierroksesi {#your-first-laps}

1. Avaa **Kisa-analyysi**-välilehti.
2. Vain katselemassa? Paina **Esimerkkikierrokset** (katso [Esimerkkikierrokset](#demo-laps)).
3. Omat kierroksesi: tallenna ne pelissä tallentimella (katso [Tiedostomuodot](#file-formats)). Tallennin kirjoittaa yhden tiedoston per kierros.
4. Paina **Lataa kierrostiedostot…** ja valitse kaksi tai useampi saman radan tiedostoa, tai paina **Kansio…** ja valitse kansio, joka niitä pitää. Voit myös pudottaa tiedostoja tai kansioita 3D-näkymän päälle.
5. Napsauta kierrosta listassa nähdäksesi, missä se menettää aikaa.

**Varoitus: kierroksia verrataan yksi rata kerrallaan.** Toisen nimetyn radan kierroksen lataaminen tyhjentää jo ladatut kierrokset.

## Painikkeet {#the-buttons}

| Säädin | Tekee |
|---|---|
| **Lataa kierrostiedostot…** | tiedostovalitsin tiedostoille `.json`, `.csv`, `.txt`, `.ibt`, `.gz` ja `.h3dcars`, useita kerralla (`.h3dcars` on autotiedosto, katso [Autot](race-replay-and-scene.md#the-cars)) |
| **Kansio…** | kansiovalitsin: jokainen kierrostiedosto kansiossa ja sen alla |
| **Esimerkkikierrokset** | kolme keksittyä kierrosta keksityllä radalla (katso [Esimerkkikierrokset](#demo-laps)) |
| **Tyhjennä** | poistaa jokaisen kierroksen (näkyy, kun kierroksia on ladattu) |
| pudotus näkymään | näkymään pudotetut tiedostot ja kokonaiset kansiot ladataan samalla tavalla |

Kierrokset **lisätään** jo ladattujen joukkoon - **paitsi jos ne ovat toisen nimetyn radan kierroksia: silloin ladatut kierrokset tyhjennetään ensin** (kierroksia verrataan yksi rata kerrallaan). Tiedostot, joita ei voi lukea, luetellaan painikkeiden alla, yksi rivi kukin; muut latautuvat silti.

## Tiedostomuodot {#file-formats}

Muoto tunnistetaan sisällöstä, ei tiedostonimestä. Selkokielellä:

- **heat3d-lap** on tiedosto, jonka 3DHeat-tallennin kirjoittaa useimmille peleille.
- **FH Companion** on ilmainen työkalu, joka tallentaa Forza Horizon -kierroksia. Se kirjoittaa kierrostiedoston ja sen viereen `.json.tele.gz`-tiedoston (sama kierros, jokaisen renkaan tiedot, gzip-pakattuna). Valitse molemmat yhdessä.
- **iRacing `.ibt`** on iRacingin oma telemetriatiedosto; kytke tallennus autossa päälle näppäimillä Alt+L ja lataa tiedosto sellaisenaan.
- **Kierros-CSV** on tavallinen taulukko, yksi rivi per hetki.

| Muoto | Tyypillinen lähde | Lukija |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon ja Motorsport Data Outin kautta, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion -kierros `.json` | FH Companionin kierroskirjasto | `fromFhCompanion` |
| FH Companion -telemetria `.json.tele.gz` | jokaisen FH Companion -kierrostiedoston vieressä | `readForzaTelemetry` |
| iRacing `.ibt` | iRacingin omat telemetriatiedostot (tallennus päälle Alt+L:llä autossa) | `readIbt` |
| kierros-CSV | `heat3d_capture laps`, Trackmania-liitännäinen tai mikä tahansa CSV, jossa on `x`, `z`, aikasarake ja valinnaisesti `lap`-sarake | `fromCsv` |

Kunkin pelin tallennus ja sen lähettämä data on kuvattu tallentimien dokumentaatiossa:
[GameCapture: pelit](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
ja [GameCapture: kierrosmuoto](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Katso myös [Muut kilpailupelit](other-games.md).

## Kansiot ja radat {#folders-and-courses}

**Kansio…** tai pudotettu kansio tuo kaikki sen alla olevat tiedostot. Kansiossa huomioidaan vain tiedostot, joiden nimi päättyy `.json`, `.csv`, `.txt`, `.ibt` tai `.tele.gz`, ja `.json`, joka ei ole kierros (radan oma tiedosto, sen kartta), ohitetaan ilman virhettä.

**Useita ratoja yhdessä valinnassa.** FH Companionin kierroskirjasto pitää kunkin radan kansiossa nimeltä `<radan nimi> (course_<x>_<z>_to_<x>_<z>)` (tai pelkkä `course_...` nimettömälle radalle). Kun valitut tiedostot ovat useammassa kuin yhdessä tällaisessa rataa kansiossa, mitään ei ladata; sen sijaan **Kierrokset**-osio sanoo "Nämä ovat N radan kierroksia, ja kierroksia verrataan yksi rata kerrallaan. Valitse yksi:" ja luettelee jokaisen radan kierrosmäärän kanssa (päättyvät `.json`, `.csv` tai `.ibt`, `course.json` ei lasketa), eniten kierroksia ensin. Napsauttamalla yhtä ladataan sen radan tiedostot.

Rata tunnistetaan nimestään ja **lähtöpisteestään**, ei maalipisteestään: ajot, joita ei koskaan viety loppuun, FH Companion säilyttää samalla nimellä ja lähtöpisteellä (kansiossa `unfinished/`), ja loppupisteenä on se, mihin ne pysähtyivät. Ne kuuluvat radalleen - merkittynä **osittaiseksi** listassa.

**Useita ratoja valituissa tiedostoissa.** Kun suoraan valituissa tiedostoissa (ei rataskansioista) on kierroksia useammalta nimetyltä radalta, sama valinta tarjotaan radoittain; kierrokset, joilla ei ole radan nimeä, kulkevat mukana sen radan kanssa, joka valitaan.

## Autojen nimet {#car-names}

Kierros saa autonsa koko nimen, kuten peli sen antaa. Jos kierrostiedosto ei nimeä autoa:

1. **Kansio.** FH Companionin kirjasto pitää kierrokset muodossa
   `<rata>/<luokka>/<auton nimi> '<yy> (car<numero>)/<viritys>/<tunniste>/<kierros>.json`.
   Sisin kansio, joka vastaa muotoa `<nimi> (car<numero>)`, antaa nimen ja numeron; kansio, joka vastaa muotoa `car<numero>`, antaa vain numeron. Vain kansiovalinnat ja pudotetut kansiot kantavat tätä polkua.
2. **Toinen saman auton kierros.** Kun jokin kierros nimeää auton, jokainen kierros, jolla on sama peli ja auton numero, saa saman nimen - samalla ladatut kierrokset ja myöhemmin tässä selaimessa ladatut kierrokset: nimet säilytetään `localStorage`-tallennuksessa avaimella `heat3d.carNames` (avain `<peli>:<auton numero>`). Yksityisessä ikkunassa ne säilyvät yhtä kauan kuin kierrokset.
3. Muuten "auto 1234" numeron mukaan, tai "auto".

**Nimiöt.** Kierroslistassa kierros näyttää autonsa nimen; saman auton useat kierrokset numeroidaan "Nimi #1", "Nimi #2". Analyysin lauseet käyttävät samoja nimiöitä, kun ne ovat yksilöllisiä; muuten autonnimi kierrosajan kanssa, "Nimi (1:29.616)" (esimerkkiajat), ja numeroidaan lisää, jos ne eivät ole vielä yksilöllisiä.

**Ryhmittely.** Kierrokset kuuluvat samalle autolle (verhokäyriä, profiileja ja vertailuja varten), kun niiden auton numero - tai nimi, jos numeroa ei ole - ja niiden suorituskykyindeksi ovat samat (`carKey`): sama malli eri viritykselle on eri auto.

**Luokat.** Kierroksen suorituskykyluokka on pelin oma (Forza D..X, iRacingin auton luokan lyhyt nimi); tilastot järjestävät ne D, C, B, A, S1, S2, R, X, ja sen jälkeen muut aakkosjärjestyksessä.

## Esimerkkikierrokset {#demo-laps}

**Esimerkkikierrokset** lataa kolme kierrosta keksityltä radalta (neljä suoraa ja neljä oikeakätistä mutkaa), tehtynä yksinkertaisella ajoneuvomallilla ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): jokaisen mutkan pitorajoitettu nopeus, kiihdytysajo eteenpäin ja jarrutusajo taaksepäin, kuten kierroslaskuri tekee.

| Kierros | Auto | Virheet |
|---|---|---|
| puhdas | Pitoauto | ei mitään |
| virheillä | Pitoauto | jarruttaa 35 m liian aikaisin T2:een, kaasulle 30 m liian myöhään T3:n jälkeen, ottaa T4:n 0,88 nopeudellaan, ajaa 1,2 m toiselle puolelle |
| toinen auto | Tehoauto | ei mitään; ajaa 1,2 m toiselle puolelle |

| Auto (numero) | Pito | Jarrutus | Veto | Teho/massa | Ilmanvastus |
|---|---|---|---|---|---|
| Pitoauto (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Tehoauto (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Virheitä sisältävä kierros on tarkennettu. Rata on tehty samalla tavalla kuin Forza pitää maailmansa (vasenkätinen), joten - aivan kuten oikealla Forza-kierroksella - se tulee peilattuna ja välilehti tarjoaa **Käännä X**. Kaikki kolme kierrosta kantavat renkaskohtaista dataa, joten jokaisella välilehden osalla on näytettävää.

## Kierroslista {#the-lap-list}

Jokainen rivi vasemmalta oikealle:

| Elementti | Tekee |
|---|---|
| ● / ○ | näyttää / piilottaa kierroksen (viivat, auto, kortti, kaaviot); piilotettuja kierroksia analysoidaan yhä |
| värijuova | kierroksen väri |
| nimi ja tunnisteet | napsauta **tarkentaaksesi** kierroksen; osoita nähdäksesi sen lähdetiedoston ja auton (nimi · luokka PI · vetotapa) |
| ⌖ | seuraa tätä autoa kameralla (napsauta uudelleen lopettaaksesi) |
| ★ | vertaa kaikkea tähän kierrokseen (tee siitä vertailu); pois käytöstä vertailukierroksella |
| × | poista kierros |

**Tunnisteet:** *vertailu*; *paras X* (tai *luokkansa paras*) luokan nopeimmalla kierroksella, kun luokkia on useita; *osittainen* ajossa, joka ei päässyt maaliin.

**Toinen rivi:** luokka (vain kun luokkia on useita), kierrosaika (`1:29.616`), ero kierrokseen, johon sitä verrataan (oman luokkansa paras tai vertailu), muodossa `+0.512` (esimerkki), ja *myöhässä lähdössä*, kun kierros alkaa yli 10 m vertailun lähdöstä.

Kun kierroksia on yli 8, rivi "N / M piirretty" tarjoaa **Näytä kaikki** (piirtää jokaisen kierroksen: hitaampi ja sekava) ja **Vain tarkasteltavat** (vertailu, tarkennettu kierros ja luokkansa paras; tilastot laskevat joka tapauksessa jokaisen kierroksen).

Listan alla: peilausvihje, kun kierrokset kertovat piirron olevan peilattu (katso [peilatut maailmat](race-replay-and-scene.md#mirrored-worlds)), ja kahdella tai useammalla kierroksella vihje "Napsauta kierrosta nähdäksesi, missä se menettää aikaa …", sekä useamman luokan kanssa, että jokainen kierros verrataan oman luokkansa nopeimpaan.

### Vertailu ja tarkennus {#reference-and-focus}

- **Vertailu:** kierros, johon kaikki muut kohdistetaan ja oletuksena verrataan. Nopein **täydellinen** kierros, ellei ★ ole valinnut muuta (ensimmäinen ladattu kierros, kun mikään ei ole täydellinen). Vertailukierroksen poistaminen palauttaa automaattiseen valintaan.
- **Tarkennus:** kierros, jonka löydökset, autojen hallinta ja kartat näytetään. Se pysyy siinä, minne käyttäjä sen asetti; muuten se on **hitain** kierros, joka ei ole vertailu ("eniten opittavaa"). Tarkentaminen myös paljastaa kierroksen ja luokkansa parhaan kierroksen. Vertailukierroksen tarkentaminen vertaa sitä siihen muuhun kierrokseen, joka oli nopein kunkin mutkan läpi.
- **Luokat:** kun kierroksia on useista suorituskykyluokista, jokainen kierros verrataan oman luokkansa nopeimpaan täydelliseen kierrokseen (vertailu vertailun luokassa). Katso [Ratatilastot](race-course-statistics.md).

### Värit {#colours}

Jokainen kierros saa oman värinsä latausjärjestyksen mukaan, joten kierros säilyttää värinsä, vaikka muut piilotettaisiin. Sävyt ovat värinkehällä samoin välein kuin lämpökartan tiimitila jakaa ryhmät; jokaiselle paikalle valitaan kirkkaus (0,52-0,66 OKLCH:ssa) ja väriintensiteetti (0,12-0,18) siten, että se on kauimpana naapuripaikoista (ja viimeinen ensimmäisestä) tavallisella, protan- ja deutan-näöllä, ja kullakin vähintään 3:1 tummaa kaaviopintaa vasten.

## Kehittäjille {#for-developers}

Koodi: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Miten jokainen muoto luetaan {#how-each-format-is-read}

Jokainen muoto päätyy yhdeksi `LapTrace`-olioksi: kanavat kanonisilla nimillä (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...,
katso [kanavataulukko](race-charts-and-hud.md#the-channel-table)), auto, kierrosaika, onko kierros täydellinen, ja `meta`-lohko. Jokaisessa muodossa `time` ja `distance` siirretään alkamaan nollasta, ja jos lähteessä ei ole `speed`-kanavaa, se lasketaan matkana jaettuna ajalla naapurinäytteistä.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON-olio, jossa `"format": "heat3d-lap"`. Luettavat kentät:

| Kenttä | Käyttö |
|---|---|
| `channels` | olio taulukoita, yksi per kanava, kanonisella nimellä; renkaskohtaiset kanavat muodossa `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` ja `z` ovat pakollisia |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | auto: tunniste, nimi, Forzan luokkaindeksi (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), suorituskykyindeksi, vetotapakoodi (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | kierrosaika; viimeinen `time`-arvo, jos sitä ei ole |
| `lap.complete` | `false` merkitsee osittaisen ajon; mikä tahansa muu on täydellinen |
| `game`, `track` | nimet; `game` päättää lajin (katso alla) |
| `units.slipRatio` / `units.slipAngle` | miten lipsu skaalataan: yksikkö, jossa on `raw`, tarkoittaa `scaled`, `normalised` tarkoittaa `peak`, muu `physical` |
| `meta` | annetut `slip`, `surface`, `discipline` ohittavat edellä olevan |

Ilman `distance`-kanavaa matka lasketaan yhteen 3D-sijainneista.

#### FH Companion -kierrostiedostot {#fh-companion-lap-files}

JSON-olio, jossa on `Lap`-olio ja siinä `samples`-taulukko (yksi näyte noin 5 m välein). Kenttien vastaavuus:

| FH Companion | Kanava |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (siirretty niin, että kierros alkaa nollasta) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | samat, pienillä kirjaimilla |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², nimestä huolimatta) |
| `Puddle` | `puddle` |

Auto tulee kentistä `Lap.carOrdinal`, `Lap.carName` (vain uudemmat tiedostot), `Class` (tai `Lap.carClass` Forzan luokkaindeksinä), `Lap.performanceIndex`, `Lap.drivetrain` ja `Lap.peakKilowatts`; aika kentästä `Lap.lapSeconds`; ajo, jonka `EndedAtFinish` on `false`, on osittainen. Peli on `forza-horizon`.

Näissä tiedostoissa ei ole renkaiden tietoja eikä suuntaa, joten lukkiutumisia, pyörimistä ja liukuja ei voi arvioida pelkästään niistä; työntöjä (ohjauksesta radan käännökseen verrattuna) ja osumia ja kolareita voi silti. Valitse myös jokaisen vierestä `.tele.gz`-tiedosto loppujen tietojen vuoksi.

#### FH Companion -telemetria (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-pakattu JSON `{ version, columns, data }`: Forzan koko Data Out yhdelle kierrokselle, yksi rivi per paketti, pelin omilla kenttänimillä. Sarakkeet haetaan nimellä, ei paikalla. Muoto 2 säilyttää jokaisen paketin (noin 110 sekunnissa pelin 64 tikin sijaan); rivi, joka on identtinen edellisen kanssa kaikessa paitsi tallentimen omassa kellossa (`t`, `metres`), pudotetaan, joten kierros luetaan pelin 64 rivillä sekunnissa. (Kuormanäppäimen vihje kertoo tämän: "jokaisen renkaan lipsu 64 Hz:llä".)

| Data Out -kenttä | Kanava |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (auton koordinaatisto: x oikealle, y ylös, z eteen) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skaalattuna 0..255:stä 0..1:een |
| `Steer` | `steer`, skaalattuna -127..127:stä -1..1:een |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, muunnettuna Fahrenheitistä °C:ksi |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pyöräkohtaisesti |

`<Wheel>` on `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Lipsu merkitään `peak`-arvoksi (Forzan normalisoitu lipsu: yli
1:n rengas on päästänyt irti).

**Pariutus.** Kierrostiedosto `<kierros>.json` ja `<kierros>.json.tele.gz` valittuina tai pudotettuina yhdessä (sama polku, paitsi `.tele.gz`) muodostavat **yhden** kierroksen: telemetrian kanavat, kierrostiedoston auto, luokka, aika, rata ja osittaisuusmerkintä. Telemetriatiedoston oma auton nimi voittaa, jos sellainen on.
Yksi `.tele.gz` latautuu myös yksin: muoto 2 -tiedostot kantavat `car`-kentän (`ordinal`, `name`, `class`, `pi`), `track`- ja `lapSeconds`-kentät; ilman niitä kierrosaika on telemetrian oma kesto ja auto tuntematon.

#### iRacing `.ibt` {#iracing-ibt}

iRacingin telemetriatiedosto luetaan suoraan (selaimessa, ilman muunnosta): 112 tavun otsake, 32 tavun levyn alaotsake, muuttujataulukko (144 tavua kanavaa kohti) ja session YAML.

- **Vaaditut kanavat:** `SessionTime`, `Lap`, `Lat`, `Lon`. Ilman niitä: "… ei ole SessionTime-, Lap-, Lat- ja Lon-kanavia - onko se iRacingin telemetriatiedosto?"
- **Sijainnit:** leveyspiiri ja pituuspiiri asetetaan metreinä tasolle, joka koskettaa ensimmäistä nollasta poikkeavaa paikannusta (Maan säde 6 371 008,8 m): x itään, z etelään, y korkeus (`Alt`) - joten oletuskameralla, joka osoittaa pohjoiseen, pohjoinen on ruudun ylhäällä. Ei radan oma koordinaatisto: purettu radan malli ei kohdistuisi.
- **Kierrokset:** sessio jaetaan siitä, missä `Lap` muuttuu; kierros säilytetään, kun siinä on yli 60 näytettä, se alkaa alle 5 %:sta `LapDistPct`:stä ja päättyy yli 95 %:iin. Osittaiset kierrokset pudotetaan. Kun niitä ei jää yhtään: "… ei ole täydellistä kierrosta N km radalla" (radan pituus YAML:stä) tai "… ei ole täydellistä kierrosta".
- **Matka:** `LapDist` kierroksen alusta, muuten laskettu yhteen sijainneista.
- **Auto:** `DriverInfo`:sta: pelaajan `CarScreenName`, `CarID` (auton numerona) ja `CarClassShortName` (luokkana). Rata: `TrackDisplayName`, muuten `TrackName`.

Kartoitetut kanavat:

| iRacing | Kanava | Muunnos |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | samat nimet | - |
| `Clutch` | `clutch` | `1 - v` (iRacing laskee kytkennän; meillä on polkimen asento) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiaanit vastapäivään -1..1, oikea positiivinen; enintään vähintään 0,1, π jos puuttuu) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | samat, pienillä kirjaimilla | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | jaettuna 100:lla, kun yli 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | rungon keskilämpötila |
| `LFshockDefl` ... | `suspensionM.FL` ... | iskunvaimentimen taipuma, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa:sta psi:hin) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Pyörien etuliitteet: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Jokainen muu**
kanava, jossa on yksi arvo näytettä kohti (ei bittikenttätyyppi), kulkee läpi omalla nimellään - pyöräkohtaisesti, kun se alkaa pyöräetuliitteellä (`RRspeed` muuttuu muotoon `speed.RR`) - joten kuvaajat ja korttien arvolistat tarjoavat niitä kaikkia. iRacing ei tallenna renkaiden lipsua: auton hallintaa arvioidaan ajautumiskulmasta - `Yaw`, sovitettuna ajosuuntaan, verrattuna siihen, minne auto menee - ja ohjauksesta radan suhteen. Yawin kulmanopeutta vastaan poikittaiskiihtyvyys käytetään vain, kun suuntaa ei voi sovittaa, joten ajautumiskulmaa ei silloin ole (katso [Auton hallintatapahtumat](race-control-events.md)).

Virheet: "… on liian lyhyt ollakseen .ibt-tiedosto", "… ei ole iRacingin telemetriaotsaketta", "… ei ole sijaintipisteitä".

#### Kierros-CSV {#lap-csv}

Yksi rivi per näyte; useat kierrokset yhdessä tiedostossa erotetaan `lap`-sarakkeella. Erotin tunnistetaan ensimmäisistä viidestä rivistä. Valinnainen ensimmäinen rivi `# { ...json... }` kuvaa ajon: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Sarake (kirjainkoolla ei väliä) | Kanava |
|---|---|
| `x`, `y`, `z` | sijainti (`x` ja `z` pakollisia) |
| `elapsed` tai `time` | `time` (pakollinen per kierros) |
| `metres` tai `distance` | `distance` (muuten laskettu sijainneista) |
| `speed_ms` tai `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | samat |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| mikä tahansa kanoninen kanavanimi, esim. `latVel`, `slipIndex.FL` | itse |
| `lap` | mihin kierrokseen rivi kuuluu |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | kierrosaika, auton numero, luokka, PI, rata (kunkin kierroksen ensimmäiseltä riviltä) |

Ilman kuvausta peli on `forza-horizon` ja jokainen kierros täydellinen. Kierroksen lähde näytetään muodossa `<tiedosto> · <kierros>`, kun tiedostossa on useita. Virheet: "… ei ole rivejä", "… ei ole x- ja z-sarakkeita", "… ei ole kierroksia, joilla on aikasarake".

#### Laji ja pinta {#discipline-and-surface}

Mitä analyysi olettaa kierroksesta, kun kierros ei sano sitä (`lap.ts`):

- **Laji:** `meta.discipline`, muuten pelin nimi, joka täsmää lausekkeeseen `rally|wrc|dirt|rbr`, on **rally**, `trackmania` on **arcade**, muu **circuit**.
- **Pinta:** `meta.surface`, muuten radan nimestä ja lähteestä: rally, jonka nimi on `monte`, on **sekapinta**; `snow|ice|winter|arctic|sweden` on **lumi**; asfalttirallit (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, tai sanat tarmac/asphalt) ovat **asfaltti**; mikä tahansa nimi, jossa on `scramble|trail|cross country|dirt|gravel`, on **irtonainen alusta**; muu rallierikoiskoe arvioidaan siitä, miten autoa ajettiin: näytteissä, jotka ovat nopeampia kuin 12 m/s ja maassa (vähintään 200), poikittaiskiihtyvyyden 95. persentiili 10 m/s² tai enemmän yhdessä ajautumiskulman mediaanin kanssa alle 6° (otettuna sieltä, missä auto kääntyi 70 %:lla tai enemmällä tuosta, vähintään 30 näytettä) on asfaltti; kaikki muu, tai liian vähän tietoa, on irtonainen alusta. Rallin ulkopuolinen nimi, jossa on `rally`, on irtonainen alusta; kaikki muu on asfaltti.
- Näytekohtainen `loose`-kanava (Forzan pinnan tärinä, Trackmanian materiaalit, katso [Auton hallintatapahtumat](race-control-events.md#the-ground)) ohittaa kierroksen pinnan.
