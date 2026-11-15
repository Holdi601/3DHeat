---
title: "Rondes laden"
parent: "Race-analyse"
nav_order: 51
lang: "nl"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Rondes laden

Een rondebestand is een opname van één rit: waar de auto was en wat de bestuurder deed, vele keren per seconde. Laad twee of meer rondes van dezelfde baan, dan kan het tabblad **Race-analyse** ze vergelijken.

![Het deel Rondes van het tabblad Race-analyse met drie demorondes geladen: de lijst met rondes, de referentie-ster, de focus](../assets/img/en/race-loading-laps-list.webp)

## Je eerste rondes {#your-first-laps}

1. Open het tabblad **Race-analyse**.
2. Wil je alleen kijken? Druk op **Demorondes** (zie [Demorondes](#demo-laps)).
3. Eigen rondes: neem ze op in het spel met een recorder (zie [Bestandsformaten](#file-formats)). De recorder schrijft één bestand per ronde.
4. Druk op **Rondebestanden laden…** en kies twee of meer bestanden van dezelfde baan, of druk op **Map…** en kies de map die ze bevat. Je kunt bestanden of mappen ook op de 3D-weergave slepen.
5. Klik op een ronde in de lijst om te zien waar hij tijd verliest.

**Let op: rondes worden per baan vergeleken.** Een ronde laden van een andere benoemde baan wist de rondes die al geladen zijn.

## De knoppen {#the-buttons}

| Bedieningselement | Doet |
|---|---|
| **Rondebestanden laden…** | een bestandskiezer voor `.json`-, `.csv`-, `.txt`-, `.ibt`-, `.gz`- en `.h3dcars`-bestanden, meerdere tegelijk (`.h3dcars` is een autobestand, zie [Auto's](race-replay-and-scene.md#the-cars)) |
| **Map…** | een mapkiezer: elk rondebestand in de map en daaronder |
| **Demorondes** | drie verzonnen rondes op een verzonnen circuit (zie [Demorondes](#demo-laps)) |
| **Wissen** | verwijdert elke ronde (zichtbaar zodra er rondes geladen zijn) |
| slepen op de weergave | bestanden en hele mappen die op de 3D-weergave gesleept worden, worden op dezelfde manier geladen |

Rondes worden **toegevoegd** aan de geladen rondes - **tenzij ze van een andere benoemde baan zijn: dan worden de geladen rondes eerst gewist** (rondes worden per baan vergeleken). Bestanden die niet gelezen kunnen worden, staan onder de knoppen, één regel per bestand; de andere worden wel geladen.

## Bestandsformaten {#file-formats}

Het formaat wordt uit de inhoud afgeleid, niet uit de bestandsnaam. In gewone taal:

- **heat3d-lap** is het bestand dat de 3DHeat-recorder voor de meeste spellen schrijft.
- **FH Companion** is een gratis tool die rondes van Forza Horizon opneemt. Hij schrijft een rondebestand en, ernaast, een `.json.tele.gz`-bestand (dezelfde ronde met de gegevens van elke band, gzip-gecomprimeerd). Kies beide tegelijk.
- **iRacing `.ibt`** is het eigen telemetriebestand van iRacing; zet de logging in de auto aan met Alt+L en laad het bestand zoals het is.
- Een **ronde-CSV** is een gewone tabel, één rij per moment.

| Formaat | Gebruikelijke bron | Gelezen door |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon en Motorsport via Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion-ronde `.json` | de rondebibliotheek van FH Companion | `fromFhCompanion` |
| FH Companion-telemetrie `.json.tele.gz` | naast elk FH Companion-rondebestand | `readForzaTelemetry` |
| iRacing `.ibt` | de eigen telemetriebestanden van iRacing (logging aan met Alt+L in de auto) | `readIbt` |
| ronde-CSV | `heat3d_capture laps`, de Trackmania-plug-in, of elke CSV met `x`, `z`, een tijdkolom en optioneel een kolom `lap` | `fromCsv` |

Hoe elk spel wordt opgenomen en wat het stuurt, staat beschreven bij de recorders:
[GameCapture: spellen](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
en [GameCapture: het rondeformaat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Zie ook [Andere racespellen](other-games.md).

## Mappen en banen {#folders-and-courses}

**Map…**, of een gesleepte map, neemt elk bestand eronder mee. Binnen een map worden alleen bestanden die eindigen op `.json`, `.csv`, `.txt`, `.ibt` of `.tele.gz` bekeken, en een `.json` dat geen ronde is (het eigen bestand van een baan, de kaart ervan), wordt overgeslagen zonder fout.

**Meerdere banen in één keuze.** De rondebibliotheek van FH Companion bewaart elke baan in een map met de naam `<baannaam> (course_<x>_<z>_to_<x>_<z>)` (of een kale `course_...` voor een onbenoemde baan). Staan de gekozen bestanden in meer dan één zo'n banenmap, dan wordt niets geladen; in plaats daarvan zegt het deel **Rondes**: "Dit zijn rondes van N banen, en rondes worden per baan vergeleken. Kies er één:" en staat elke baan met zijn aantal rondes, de meeste rondes eerst. Klikken op één laadt de bestanden van die baan.

Een baan wordt gesleuteld op haar naam en haar **start**, niet op haar einde: ritten die nooit gefinisht zijn, bewaart FH Companion onder dezelfde naam en start (in `unfinished/`) met het punt waar ze stopten als einde, en die horen bij hun baan - in de lijst gemarkeerd als **onvolledig**.

**Meerdere banen tussen gekozen bestanden.** Als de direct gekozen bestanden (niet uit banenmappen) rondes van meer dan één benoemde baan zijn, wordt dezelfde keuze per baan aangeboden; rondes die geen baan noemen, gaan mee met de baan die gekozen is.

## Autonamen {#car-names}

Een ronde heet naar de volledige naam van zijn auto, zoals het spel die geeft. Waar het rondebestand de auto niet noemt:

1. **De map.** De bibliotheek van FH Companion bewaart rondes in `<baan>/<klasse>/<autonaam> '<jj> (car<nummer>)/<afstelling>/<label>/<ronde>.json`. De binnenste map die `<naam> (car<nummer>)` past, geeft de naam en het nummer; een die `car<nummer>` past, alleen het nummer. Alleen gekozen mappen en gesleepte mappen dragen dit pad.
2. **Een andere ronde van dezelfde auto.** Zodra een ronde een auto noemt, heet elke ronde met hetzelfde spel en autonummer zo - de rondes die samen geladen zijn, en rondes die later in deze browser geladen worden: de namen worden bewaard in `localStorage` onder `heat3d.carNames` (gesleuteld op `<spel>:<autonummer>`). In een privévenster blijven ze bewaard zolang de rondes.
3. Anders "auto 1234" op basis van het nummer, of "auto".

**Labels.** In de lijst met rondes toont een ronde de naam van zijn auto; meerdere rondes van dezelfde auto worden genummerd "Naam #1", "Naam #2". De zinnen van de analyse gebruiken dezelfde labels als ze uniek zijn; anders de naam van de auto met de rondetijd, "Naam (1:29.616)" (voorbeeldtijden), verder genummerd als dat nog niet uniek is.

**Groeperen.** Rondes horen bij dezelfde auto (voor enveloppen, profielen en vergelijkingen) als hun autonummer - of naam als er geen nummer is - en hun prestatie-index gelijk zijn (`carKey`): hetzelfde model met een andere afstelling is een andere auto.

**Klassen.** De prestatieklasse van een ronde is die van het spel (Forza D..X, de korte klassenaam van iRacing); de statistieken ordenen ze D, C, B, A, S1, S2, R, X, en daarna de rest op alfabet.

## Demorondes {#demo-laps}

**Demorondes** laadt drie rondes van een verzonnen circuit (vier rechte stukken en vier rechtsbochten), gemaakt door een eenvoudig voertuigmodel ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): de snelheid van elke bocht die door de grip beperkt wordt, een versnellingsronde vooruit en een remronde achteruit, zoals een rondesimulator doet.

| Ronde | Auto | Fouten |
|---|---|---|
| schoon | Gripauto | geen |
| met fouten | Gripauto | remt 35 m te vroeg in T2, komt 30 m te laat op het gas uit T3, neemt T4 met 0,88 van zijn snelheid, rijdt 1,2 m naar één kant |
| andere auto | Vermogensauto | geen; rijdt 1,2 m naar de andere kant |

| Auto (nummer) | Grip | Remmen | Tractie | Vermogen/massa | Luchtweerstand |
|---|---|---|---|---|---|
| Gripauto (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Vermogensauto (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

De ronde met de fouten staat in de focus. Het circuit is aangelegd zoals Forza zijn wereld bewaart (linkshandig), dus - net als bij een echte Forza-ronde - komt het gespiegeld uit en biedt het tabblad **X omkeren** aan. Alle drie de rondes dragen gegevens per wiel, zodat elk onderdeel van het tabblad iets te tonen heeft.

## De lijst met rondes {#the-lap-list}

Elke rij, van links naar rechts:

| Element | Doet |
|---|---|
| ● / ○ | toont / verbergt de ronde (lijnen, auto, kaartje, grafieken); verborgen rondes worden nog wel geanalyseerd |
| kleurstreep | de kleur van de ronde |
| naam en labels | klik om de ronde in de **focus** te zetten; zweef erop voor zijn bronbestand en auto (naam · klasse-PI · aandrijving) |
| ⌖ | volg deze auto met de camera (klik opnieuw om te stoppen) |
| ★ | vergelijk alles met deze ronde (maak hem de referentie); uitgeschakeld bij de referentie |
| × | verwijdert de ronde |

**Labels:** *referentie*; *beste van X* (of *beste van zijn klasse*) bij de snelste ronde van een klasse als er meerdere klassen zijn; *onvolledig* bij een rit die de finish niet bereikte.

**De tweede regel:** de klasse (alleen bij meerdere klassen), de rondetijd (`1:29.616`), het verschil met de ronde waarmee hij vergeleken wordt (de beste van zijn klasse, of de referentie) als `+0.512` (voorbeeld), en *start laat* als de ronde meer dan 10 m na de start van de referentie begint.

Bij meer dan 8 rondes biedt een regel "N van M getekend" **Alles tonen** (elke ronde tekenen: trager, en een warboel) en **Alleen de bekeken** (de referentie, de ronde in de focus en de beste van zijn klasse; de statistieken tellen in beide gevallen elke ronde).

Onder de lijst: de spiegelhint als de rondes zeggen dat de tekening gespiegeld is (zie [gespiegelde werelden](race-replay-and-scene.md#mirrored-worlds)), en bij twee of meer rondes de hint "Klik op een ronde om te zien waar hij tijd verliest …", en bij meerdere klassen dat elke ronde vergeleken wordt met de snelste van zijn eigen klasse.

### Referentie en focus {#reference-and-focus}
- **Referentie:** de ronde waar elke andere ronde op uitgelijnd wordt en, standaard, mee vergeleken wordt. De snelste **volledige** ronde, tenzij ★ een andere koos (de eerst geladen ronde als er geen volledig is). De referentieronde verwijderen keert terug naar de automatische keuze.
- **Focus:** de ronde waarvan de bevindingen, de wagenbeheersing en de kaarten getoond worden. Hij blijft waar de gebruiker hem zette; anders is het de **langzaamste** ronde die niet de referentie is ("het meest om van te leren"). Een ronde in de focus zetten maakt hem ook zichtbaar, en de beste ronde van zijn klasse. De referentie in de focus zetten vergelijkt hem met de ronde die er bij elke bocht het snelst doorheen ging.
- **Klassen:** bij rondes van meerdere prestatieklassen wordt elke ronde vergeleken met de snelste volledige ronde van zijn eigen klasse (de referentie, in de klasse van de referentie). Zie [Baanstatistieken](race-course-statistics.md).

### Kleuren {#colours}

Elke ronde krijgt zijn eigen kleur, naar zijn plek in de laadvolgorde, zodat een ronde zijn kleur houdt als andere verborgen zijn. De tinten liggen over het kleurenwiel verdeeld zoals de teammodus van de warmtekaart groepen verdeelt; voor elke plek worden de helderheid (0,52 tot 0,66 in OKLCH) en de chroma (0,12 tot 0,18) zo gekozen dat ze zo ver mogelijk van de naburige plekken staan (en de laatste van de eerste), bij normaal zien, protanopie en deuteranopie, elk minstens 3:1 tegen het donkere grafiekoppervlak.

## Voor ontwikkelaars {#for-developers}

Code: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Hoe elk formaat gelezen wordt {#how-each-format-is-read}

Elk formaat wordt uiteindelijk één `LapTrace`: kanalen met canonieke namen (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., zie de [kanaaltabel](race-charts-and-hud.md#the-channel-table)), de auto, de rondetijd, of het een volledige ronde is, en een `meta`-blok. Bij elk formaat worden `time` en `distance` verschoven zodat ze bij 0 beginnen, en waar een bron geen `speed` heeft, wordt die berekend als afstand gedeeld door tijd uit de buursamples.

#### heat3d-lap JSON {#heat3d-lap-json}

Een JSON-object met `"format": "heat3d-lap"`. Gelezen velden:

| Veld | Gebruik |
|---|---|
| `channels` | een object met arrays, één per kanaal, op canonieke naam; kanalen per wiel als `naam.FL`, `naam.FR`, `naam.RL`, `naam.RR`. `time`, `x` en `z` zijn verplicht |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | de auto: id, naam, Forza-klasse-index (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), prestatie-index, aandrijvingscode (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | de rondetijd; de laatste `time`-waarde als die ontbreekt |
| `lap.complete` | `false` markeert een onvolledige rit; al het andere is volledig |
| `game`, `track` | namen; `game` bepaalt de discipline (zie hieronder) |
| `units.slipRatio` / `units.slipAngle` | hoe slip geschaald is: een eenheid met `raw` betekent `scaled`, `normalised` betekent `peak`, al het andere `physical` |
| `meta` | `slip`, `surface`, `discipline` zoals opgegeven overschrijven het bovenstaande |

Zonder een `distance`-kanaal wordt de afstand opgeteld uit de 3D-posities.

#### FH Companion-rondebestanden {#fh-companion-lap-files}

Een JSON-object met een `Lap`-object dat een array `samples` bevat (ongeveer één sample per 5 m). Gekoppelde velden:

| FH Companion | Kanaal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (verschoven zodat de ronde bij 0 begint) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | hetzelfde, met kleine letters |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², ondanks de naam) |
| `Puddle` | `puddle` |

De auto komt uit `Lap.carOrdinal`, `Lap.carName` (alleen nieuwere bestanden), `Class` (of `Lap.carClass` als Forza-klasse-index), `Lap.performanceIndex`, `Lap.drivetrain` en `Lap.peakKilowatts`; de tijd uit `Lap.lapSeconds`; een rit met `EndedAtFinish: false` is onvolledig. Het spel is `forza-horizon`.

Deze bestanden bevatten geen bandengegevens en geen koers, dus blokkeren, doorslippen en slides kunnen er alleen niet mee beoordeeld worden; duwen (uit het stuur tegen het pad) en klappen en botsingen wel. Kies ook het `.tele.gz` ernaast voor de rest.

#### FH Companion-telemetrie (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Met gzip gecomprimeerde JSON `{ version, columns, data }`: de hele Data Out van Forza voor één ronde, één rij per pakket, met de eigen veldnamen van het spel. Kolommen worden op naam opgezocht, nooit op positie. Formaat 2 bewaart elk pakket (ongeveer 110 per seconde tegenover de 64 ticks van het spel); een rij die in alles gelijk is aan de rij ervoor, behalve de eigen klok van de recorder (`t`, `metres`), wordt weggelaten, zodat een ronde met de 64 rijen per seconde van het spel wordt gelezen. (De tooltip van de laadknop zegt dat: "voor elke slip van elke band op 64 Hz".)

| Data Out-veld | Kanaal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (autoframe: x rechts, y omhoog, z vooruit) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, geschaald van 0..255 naar 0..1 |
| `Steer` | `steer`, geschaald van -127..127 naar -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, omgerekend van Fahrenheit naar °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` per wiel |

`<Wheel>` is `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Slip is gemarkeerd als `peak` (de genormaliseerde slip van Forza: voorbij
1 heeft de band de grip verloren).

**Koppelen.** Een rondebestand `<ronde>.json` en `<ronde>.json.tele.gz` die samen gekozen of gesleept worden (zelfde pad, behalve `.tele.gz`), worden **één** ronde: de kanalen van de telemetrie, met de auto, klasse, tijd, baan en de markering onvolledig van het rondebestand. De autonaam van het telemetriebestand wint als het er een heeft. Een `.tele.gz` alleen laadt ook: bestanden van formaat 2 bevatten `car` (`ordinal`, `name`, `class`, `pi`), `track` en `lapSeconds`; zonder die is de rondetijd de eigen duur van de telemetrie en is de auto onbekend.

#### iRacing `.ibt` {#iracing-ibt}

Het telemetriebestand van iRacing wordt direct gelezen (in de browser, zonder conversie): de koptekst van 112 bytes, de schijf-subkop van 32 bytes, de variabelentabel (144 bytes per kanaal) en de sessie-YAML.

- **Verplichte kanalen:** `SessionTime`, `Lap`, `Lat`, `Lon`. Zonder die: "… heeft geen SessionTime-, Lap-, Lat- en Lon-kanalen - is het een iRacing-telemetriebestand?"
- **Posities:** breedte- en lengtegraad worden in meters uitgezet op een vlak dat raakt aan de eerste niet-nulle meting (aardstraal 6 371 008,8 m): x naar het oosten, z naar het zuiden, y de hoogte (`Alt`) - dus met de standaardrichting van de camera (noord) staat noord boven op het scherm. Niet het eigen frame van de baan: een geëxtraheerd banenmodel zou dan niet op elkaar aansluiten.
- **Rondes:** de sessie wordt gesplitst waar `Lap` verandert; een ronde wordt bewaard als hij meer dan 60 samples heeft, begint onder 5% van `LapDistPct` en eindigt boven 95%. Onvolledige rondes vallen weg. Blijft er geen over: "… heeft geen volledige ronde van de N km-baan" (baanlengte uit de YAML) of "… heeft geen volledige ronde".
- **Afstand:** `LapDist` vanaf de start van de ronde, anders opgeteld uit de posities.
- **Auto:** uit `DriverInfo`: de `CarScreenName` van de speler, `CarID` (als autonummer) en `CarClassShortName` (als klasse). Baan: `TrackDisplayName`, anders `TrackName`.

Gekoppelde kanalen:

| iRacing | Kanaal | Omrekening |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | dezelfde namen | - |
| `Clutch` | `clutch` | `1 - v` (iRacing telt het ingrijpen; wij het pedaal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radialen tegen de klok in naar -1..1, rechts positief; maximum minstens 0,1, π als het ontbreekt) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | hetzelfde, met kleine letters | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | gedeeld door 100 als het boven 1,5 ligt |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatuur van het midden van de carcas |
| `LFshockDefl` ... | `suspensionM.FL` ... | dempervering, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa naar psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Wielvoorvoegsels: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Elk ander** kanaal met één waarde per sample (niet van het bitveldtype) gaat door onder zijn eigen naam - per wiel als het met een wielvoorvoegsel begint (`RRspeed` wordt `speed.RR`) - zodat de grafieken en de waardenlijsten van de kaartjes ze allemaal aanbieden. iRacing logt geen bandslip: wagenbeheersing wordt beoordeeld aan de hand van de slipshoek - `Yaw`, ingepast op de rijrichting, tegenover waar de auto heen gaat - en het stuur tegen het pad. De gierhoeksnelheid tegenover de zijdelingse versnelling wordt alleen gebruikt als de koers niet ingepast kan worden, dus dan is er geen slipshoek (zie [Gebeurtenissen bij wagenbeheersing](race-control-events.md)).

Fouten: "… is te kort om een .ibt-bestand te zijn", "… heeft geen iRacing-telemetriekop", "… heeft geen positiemetingen".

#### Ronde-CSV {#lap-csv}

Eén rij per sample; meerdere rondes in één bestand worden onderscheiden door een kolom `lap`. Het scheidingsteken wordt bepaald uit de eerste vijf regels. Een optionele eerste regel `# { ...json... }` beschrijft de rit: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolom (hoofdletterongevoelig) | Kanaal |
|---|---|
| `x`, `y`, `z` | positie (`x` en `z` verplicht) |
| `elapsed` of `time` | `time` (verplicht per ronde) |
| `metres` of `distance` | `distance` (anders opgeteld uit de posities) |
| `speed_ms` of `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | hetzelfde |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| elke canonieke kanaalnaam, bijv. `latVel`, `slipIndex.FL` | zichzelf |
| `lap` | bij welke ronde een rij hoort |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | rondetijd, autonummer, klasse, PI, baan (uit de eerste rij van elke ronde) |

Zonder beschrijving wordt het spel als `forza-horizon` genomen en is elke ronde volledig. De bron van een ronde wordt getoond als `<bestand> · <ronde>` als het bestand er meerdere bevat. Fouten: "… heeft geen rijen", "… heeft geen x- en z-kolommen", "… heeft geen rondes met een tijdkolom".

#### Discipline en ondergrond {#discipline-and-surface}

Wat de analyse van een ronde aanneemt, als de ronde het niet zegt (`lap.ts`):

- **Discipline:** `meta.discipline`, anders is een spelnaam die past bij `rally|wrc|dirt|rbr` een **rally**, `trackmania` is **arcade**, al het andere een **circuit**.
- **Ondergrond:** `meta.surface`, anders uit de baannaam en de bron: een rally met de naam `monte` is **gemengd**; `snow|ice|winter|arctic|sweden` **sneeuw**; de asfaltrally's (Spanje/España/Catalunya/Costa Daurada, Kroatië/Hrvatska, Midden-Europa, Duitsland/Deutschland, Japan, Corsica/Corse, Ypres, of de woorden tarmac/asphalt) **asfalt**; elke naam met `scramble|trail|cross country|dirt|gravel` is **los**; een andere rallyproef wordt beoordeeld naar hoe de auto gereden werd: over de samples sneller dan 12 m/s en op de grond (minstens 200 ervan), is een 95e percentiel van zijdelingse versnelling van 10 m/s² of meer samen met een mediane slipshoek onder 6° (genomen waar de auto bochtte op 70% daarvan of meer, minstens 30 samples) asfalt; al het andere, of te weinig om het te zien, is los. Een niet-rallynaam met `rally` erin is los; al het andere asfalt.
- Per sample overschrijft een kanaal `loose` (de trilling van het wegdek van Forza, de materialen van Trackmania, zie [Gebeurtenissen bij wagenbeheersing](race-control-events.md#the-ground)) de ondergrond van de ronde.
