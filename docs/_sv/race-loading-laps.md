---
title: "Läsa in varv"
parent: "Racinganalys"
nav_order: 51
lang: "sv"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Läsa in varv

En varvfil är en inspelning av en körning: var bilen var och vad föraren gjorde, många gånger per sekund. Läser du in två eller fler varv av samma bana kan fliken **Racinganalys** jämföra dem.

![Avsnittet Varv i fliken Racinganalys med tre demovarv inlästa: varvlista, referensstjärna, fokus](../assets/img/en/race-loading-laps-list.webp)

## Dina första varv {#your-first-laps}

1. Öppna fliken **Racinganalys**.
2. Vill du bara titta? Tryck på **Demovarv** (se [Demovarv](#demo-laps)).
3. Egna varv: spela in dem i spelet med en inspelare (se [Filformat](#file-formats)). Inspelaren skriver en fil per varv.
4. Tryck på **Läs in varvfiler…** och välj två eller fler filer av samma bana, eller tryck på **Mapp…** och välj mappen som innehåller dem. Du kan också släppa filer eller mappar på 3D-vyn.
5. Klicka på ett varv i listan för att se var det förlorar tid.

**Varning: varv jämförs en bana i taget.** Läser du in ett varv från en annan namngiven bana rensas de varv som redan är inlästa.

## Knapparna {#the-buttons}

| Kontroll | Gör |
|---|---|
| **Läs in varvfiler…** | en filväljare för `.json`-, `.csv`-, `.txt`-, `.ibt`-, `.gz`- och `.h3dcars`-filer, flera på en gång (`.h3dcars` är en bilfil, se [Bilar](race-replay-and-scene.md#the-cars)) |
| **Mapp…** | en mappväljare: varje varvfil i mappen och under den |
| **Demovarv** | tre påhittade varv på en påhittad bana (se [Demovarv](#demo-laps)) |
| **Rensa** | tar bort varje varv (visas när varv är inlästa) |
| släpp på vyn | filer och hela mappar som släpps på 3D-vyn läses in på samma sätt |

Varv **läggs till** de som redan är inlästa - **om de inte är från en annan namngiven
bana: då rensas de inlästa varven först** (varv jämförs en bana i taget). Filer som inte
kan läsas visas under knapparna, en rad var; de andra läses in ändå.

## Filformat {#file-formats}

Formatet avgörs av innehållet, inte av filnamnet. Med enkla ord:

- **heat3d-lap** är filen som 3DHeat-inspelaren skriver för de flesta spel.
- **FH Companion** är ett gratisverktyg som spelar in Forza Horizon-varv. Det skriver en varvfil och bredvid den en `.json.tele.gz`-fil (samma varv med varje däcks data, gzip-komprimerad). Välj båda tillsammans.
- **iRacing `.ibt`** är iRacings egna telemetrifil. Slå på loggningen i bilen med Alt+L och läs in filen som den är.
- En **varv-CSV** är en vanlig tabell, en rad per ögonblick.

| Format | Typisk källa | Läses av |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon och Motorsport över Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion-varv `.json` | FH Companions varvbibliotek | `fromFhCompanion` |
| FH Companion-telemetri `.json.tele.gz` | bredvid varje FH Companion-varvfil | `readForzaTelemetry` |
| iRacing `.ibt` | iRacings egna telemetrifiler (loggning på med Alt+L i bilen) | `readIbt` |
| varv-CSV | `heat3d_capture laps`, Trackmania-insticksprogrammet, eller valfri CSV med `x`, `z`, en tidskolumn och valfritt en `lap`-kolumn | `fromCsv` |

Hur varje spel spelas in och vad det skickar beskrivs av inspelarna:
[GameCapture: spel](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
och [GameCapture: varvformatet](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Se även [Andra racingspel](other-games.md).

## Mappar och banor {#folders-and-courses}

**Mapp…**, eller en släppt mapp, tar med varje fil under den. Inne i en
mapp räknas bara filer som slutar på `.json`, `.csv`, `.txt`, `.ibt` eller `.tele.gz`,
och en `.json` som inte är ett varv (en banas egen fil, dess karta) hoppas över utan fel.

**Flera banor i ett urval.** FH Companions varvbibliotek håller varje bana i en mapp som heter `<banans namn> (course_<x>_<z>_to_<x>_<z>)` (eller bara `course_...` för en namnlös bana). När de valda filerna ligger i fler än en sådan banmapp läses inget in. I stället säger avsnittet **Varv** "Det här är varv på N banor, och varv jämförs en bana i taget. Välj en:" och listar varje bana med dess antal varv (filer som slutar på `.json`, `.csv` eller `.ibt`, `course.json` räknas inte), flest varv först. Klickar du på en läses den banans filer in.

En bana identifieras av sitt namn och sin **start**, inte sitt slut. Körningar som aldrig
blev klara sparas av FH Companion under samma namn och start (i `unfinished/`), med
var de stannade som slut, och de hör till sin bana - markerade **ofullständigt** i listan.

**Flera banor bland valda filer.** När filerna som väljs direkt (inte från banmappar) är varv av fler än en namngiven bana, erbjuds samma val per bana. Varv som inte namnger någon bana följer med den bana som valts.

## Bilnamn {#car-names}

Ett varv kallas för bilens hela namn, så som spelet ger det. Där varvfilen inte
namnger bilen:

1. **Mappen.** FH Companions bibliotek håller varv i
   `<bana>/<klass>/<bilnamn> '<åå> (car<nummer>)/<tuning>/<tagg>/<varv>.json`.
   Den innersta mappen som stämmer med `<namn> (car<nummer>)` ger namnet och
   numret; en som stämmer med `car<nummer>` ger bara numret. Bara mappval och
   släppta mappar har den här sökvägen.
2. **Ett annat varv av samma bil.** När något varv väl namnger en bil, kallas varje varv med
   samma spel och bilnummer för det - de varv som lästs in tillsammans, och
   varv som läses in senare i den här webbläsaren: namnen sparas i
   `localStorage` under `heat3d.carNames` (nycklat på `<spel>:<bilnummer>`).
   I ett privat fönster gäller de bara så länge varven gör det.
3. Annars "bil 1234" efter dess nummer, eller "bil".

**Etiketter.** I varvlistan visar ett varv sitt bilnamn. Flera varv av samma bil numreras
"Namn #1", "Namn #2". Racinganalysens meningar använder samma etiketter när de är
unika; annars bilnamnet med varvtiden, "Namn (1:29.616)" (exempeltider), och numreras
vidare om det fortfarande inte är unikt.

**Gruppering.** Varv hör till samma bil (för hölje, profiler och jämförelser) när deras bilnummer - eller namn när det inte finns något nummer - och deras prestandaindex är samma (`carKey`): samma modell med en annan tuning är en annan bil.

**Klasser.** Ett varvs prestandaklass är spelets (Forza D..X, iRacings korta klassnamn); statistiken ordnar dem D, C, B, A, S1, S2, R, X, sedan övriga i alfabetisk ordning.

## Demovarv {#demo-laps}

**Demovarv** läser in tre varv av en påhittad bana (fyra raka och fyra högersvängar), gjorda av en enkel fordonsmodell
([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)):
varje kurvas gripbegränsade fart, ett acceleration-pass framåt och ett bromspass bakåt, som en varvsimulator gör.

| Varv | Bil | Fel |
|---|---|---|
| rent | Greppbil | inga |
| med misstag | Greppbil | bromsar 35 m tidigt in i T2, får gas 30 m sent ut ur T3, tar T4 med 0,88 av sin fart, kör 1,2 m åt ena sidan |
| annan bil | Effektbil | inga; kör 1,2 m åt andra sidan |

| Bil (nummer) | Grepp | Inbromsning | Dragkraft | Effekt/massa | Luftmotstånd |
|---|---|---|---|---|---|
| Greppbil (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Effektbil (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Varvet med misstagen är i fokus. Banan är lagd så som
Forza håller sin värld (vänsterhänt), så - precis som med ett verkligt Forza-varv -
blir den speglad och fliken erbjuder **Invertera X**. Alla tre varven har data per hjul, så varje del av fliken har något att visa.

## Varvlistan {#the-lap-list}

Varje rad, från vänster till höger:

| Element | Gör |
|---|---|
| ● / ○ | visar / döljer varvet (linjer, bil, kort, diagram); dolda varv analyseras ändå |
| färgstreck | varvets färg |
| namn och taggar | klicka för att **fokusera** varvet; håll musen över för dess källfil och bil (namn · klass PI · drivlina) |
| ⌖ | jaga den här bilen med kameran (klicka igen för att sluta) |
| ★ | jämför allt mot det här varvet (gör det till referens); inaktiverad på referensen |
| × | ta bort varvet |

**Taggar:** *referens*; *bäst av X* (eller *bäst i sin klass*) på det snabbaste varvet i en klass när det finns flera klasser; *ofullständigt* på en körning som inte nådde målet.

**Den andra raden:** klassen (bara med flera klasser), varvtiden
(`1:29.616`), gapet till varvet det jämförs med (det bästa i sin klass,
eller referensen) som `+0.512` (exempel), och *startar sent* när varvet börjar
mer än 10 m efter referensens start.

Med fler än 8 varv visar en rad "N av M ritade" och erbjuder **Visa alla** (rita varje
varv: långsammare, och ett virrvarr) och **Bara de som granskas** (referensen, det fokuserade
varvet och det bästa i sin klass; statistiken räknar alla varv ändå).

Under listan: spegelhintet när varven säger att ritningen är speglad
(se [speglade världar](race-replay-and-scene.md#mirrored-worlds)), och med
två eller fler varv hintet "Klicka på ett varv för att se var det förlorar tid …", samt,
med flera klasser, att varje varv jämförs med det snabbaste i sin egen
klass.

### Referens och fokus {#reference-and-focus}

- **Referens:** varvet alla andra riktas in mot och, som standard, jämförs med. Det snabbaste **kompletta** varvet om inte ★ valt ett annat (det första inlästa varvet när inget är komplett). Tar du bort referensvarvet återgår det till det automatiska valet.
- **Fokus:** varvet vars fynd, bilkontroll och kartor visas. Det stannar där användaren satte det; annars är det det **långsammaste** varv som inte är referensen ("mest att lära"). Att fokusera ett varv gör det också synligt igen, liksom det bästa varvet i dess klass. Fokuserar du referensen jämförs den med vilket annat varv som var snabbast genom varje kurva.
- **Klasser:** med varv i flera prestandaklasser jämförs varje varv med det snabbaste kompletta varvet i sin egen klass (referensen, i referensens klass). Se [Banstatistik](race-course-statistics.md).

### Färger {#colours}

Varje varv får sin egen färg, efter sin plats i inläsningsordningen, så ett varv
behåller sin färg när andra döljs. Nyanserna är utspridda över färgcirkeln
på samma sätt som värmekartans lagläge sprider grupper. För varje plats väljs
ljusheten (0,52 till 0,66 i OKLCH) och kromaticiteten (0,12 till 0,18) så att de står
längst ifrån grannplatserna (och den sista från den första) under normalt, protanop och
deuteranop seende, var och en minst 3:1 mot den mörka diagramytan.

## För utvecklare {#for-developers}

Kod: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Hur varje format läses {#how-each-format-is-read}

Varje format blir till ett enda `LapTrace`: kanaler under kanoniska namn
(`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...,
se [kanaltabellen](race-charts-and-hud.md#the-channel-table)), bilen,
varvtiden, om det är ett komplett varv, och ett `meta`-block. För varje
format förskjuts `time` och `distance` så att de startar på 0, och där en källa
saknar `speed` räknas den ut som sträcka delat med tid från närliggande
sampel.

#### heat3d-lap JSON {#heat3d-lap-json}

Ett JSON-objekt med `"format": "heat3d-lap"`. Fält som läses:

| Fält | Används till |
|---|---|
| `channels` | ett objekt med arrayer, en per kanal, efter kanoniskt namn; kanaler per hjul som `namn.FL`, `namn.FR`, `namn.RL`, `namn.RR`. `time`, `x` och `z` krävs |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | bilen: id, namn, Forza-klassindex (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), prestandaindex, drivlinekod (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | varvtiden; det sista `time`-värdet när det saknas |
| `lap.complete` | `false` markerar en ofullständig körning; allt annat är komplett |
| `game`, `track` | namn; `game` avgör disciplinen (se nedan) |
| `units.slipRatio` / `units.slipAngle` | hur slip skalas: en enhet som innehåller `raw` betyder `scaled`, `normalised` betyder `peak`, allt annat `physical` |
| `meta` | `slip`, `surface`, `discipline` som anges åsidosätter det ovan |

Utan en `distance`-kanal summeras sträckan från 3D-positionerna.

#### FH Companion-varvfiler {#fh-companion-lap-files}

Ett JSON-objekt med ett `Lap`-objekt som håller en `samples`-array (ett sampel
cirka var 5 m). Fält som mappas:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (förskjutna så att varvet startar vid 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | samma, med gemener |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², trots namnet) |
| `Puddle` | `puddle` |

Bilen kommer från `Lap.carOrdinal`, `Lap.carName` (bara nyare filer),
`Class` (eller `Lap.carClass` som ett Forza-klassindex), `Lap.performanceIndex`,
`Lap.drivetrain` och `Lap.peakKilowatts`; tiden från `Lap.lapSeconds`; en
körning med `EndedAtFinish: false` är ofullständig. Spelet är `forza-horizon`.

Dessa filer har ingen däckdata och ingen kurs, så lås, hjulspinn och sladdar kan inte bedömas enbart från dem. Tryck (från styrningen mot vägen) och träffar och krockar går fortfarande. Välj även `.tele.gz` bredvid varje fil för resten.

#### FH Companion-telemetri (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-komprimerad JSON `{ version, columns, data }`: Forzas hela Data Out för
ett varv, en rad per paket, med spelets egna fältnamn. Kolumner slås upp med
namn, aldrig med position. Format 2 behåller varje paket (cirka 110 per
sekund jämfört med spelets 64 tickar); en rad som är identisk med den före den i
allt utom inspelarens egen klocka (`t`, `metres`) tas bort, så att ett varv
läses i spelets 64 rader per sekund. (Läsknappens verktygstips säger det: "för
varje däcks slip vid 64 Hz".)

| Data Out-fält | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (bilens ram: x höger, y upp, z framåt) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skalade från 0..255 till 0..1 |
| `Steer` | `steer`, skalad från -127..127 till -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, omräknad från Fahrenheit till °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` per hjul |

`<Wheel>` är `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Slip markeras `peak` (Forzas normaliserade slip: över
1 har däcket släppt).

**Parning.** En varvfil `<varv>.json` och `<varv>.json.tele.gz` som väljs eller
släpps tillsammans (samma sökväg men `.tele.gz`) blir **ett** varv: telemetrins
kanaler, med varvfilens bil, klass, tid, bana och flagga för ofullständigt. Telemetrifilens egna bilnamn vinner när det finns ett.
En `.tele.gz` ensam läses fortfarande in: format 2-filer har `car`
(`ordinal`, `name`, `class`, `pi`), `track` och `lapSeconds`; utan dem är
varvtiden telemetrins egen längd och bilen okänd.

#### iRacing `.ibt` {#iracing-ibt}

iRacings telemetrifil läses direkt (i webbläsaren, utan konvertering):
112-byte-huvudet, 32-byte-underhuvudet på disk, variabeltabellen (144
byte per kanal) och sessionens YAML.

- **Krävda kanaler:** `SessionTime`, `Lap`, `Lat`, `Lon`. Saknas de:
  "… har inga kanalerna SessionTime, Lap, Lat och Lon - är det en iRacing-
  telemetrifil?"
- **Positioner:** latitud och longitud läggs ut i meter på ett plan som tangerar den första
  icke-noll-fixen (jordradie 6 371 008,8 m): x österut,
  z söderut, y höjden (`Alt`) - så med standardkameran pekar norr uppåt på skärmen. Inte banans egen ram: en utdragen banmodell skulle inte passa in.
- **Varv:** sessionen delas där `Lap` ändras; ett varv behålls när det
  har fler än 60 sampel, börjar under 5 % av `LapDistPct` och slutar över
  95 %. Ofullständiga varv släpps. Blir inga kvar: "… har inget komplett varv på den
  N km långa banan" (banlängd från YAML) eller "… har inget komplett varv".
- **Sträcka:** `LapDist` från varvets start, annars summerad från positionerna.
- **Bil:** från `DriverInfo`: spelarens `CarScreenName`, `CarID` (som bilnummer) och `CarClassShortName` (som klass). Bana:
  `TrackDisplayName`, annars `TrackName`.

Mappade kanaler:

| iRacing | Kanal | Omvandling |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | samma namn | - |
| `Clutch` | `clutch` | `1 - v` (iRacing räknar ingrepp; vårt är pedalen) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianer moturs till -1..1, höger positiv; max minst 0,1, π när det saknas) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | samma, med gemener | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | delat med 100 när värdet är över 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | karkassens mitttemperatur |
| `LFshockDefl` ... | `suspensionM.FL` ... | dämparens utslag, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa till psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Hjulprefix: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Varje annan**
kanal med ett värde per sampel (som inte är av bitfälttyp) släpps igenom under sitt eget namn - per hjul när den börjar med ett hjulprefix
(`RRspeed` blir `speed.RR`) - så att graferna och kortens värdelistor
erbjuder alla. iRacing loggar ingen däckslip: bilkontrollen bedöms från
driftvinkeln - `Yaw`, anpassad till färdriktningen, mot vart bilen far - och
styrningen mot vägen. Girhastigheten mot sidaccelerationen används bara när kursen inte kan anpassas, så det finns ingen driftvinkel (se [Bilens kontrollhändelser](race-control-events.md)).

Fel: "… är för kort för att vara en .ibt-fil", "… har inget iRacing-
telemetrihuvud", "… har inga positionsfixar".

#### Varv-CSV {#lap-csv}

En rad per sampel; många varv i en fil skiljs åt med en kolumn `lap`.
Avgränsaren känns igen från de fem första raderna. En valfri första rad
`# { ...json... }` beskriver körningen: `game`, `track`, `seconds`,
`complete`, `meta`, `car`.

| Kolumn (gemener/versaler spelar ingen roll) | Kanal |
|---|---|
| `x`, `y`, `z` | position (`x` och `z` krävs) |
| `elapsed` eller `time` | `time` (krävs per varv) |
| `metres` eller `distance` | `distance` (annars summerad från positionerna) |
| `speed_ms` eller `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | samma |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| valfritt kanoniskt kanalnamn, t.ex. `latVel`, `slipIndex.FL` | sig själv |
| `lap` | vilket varv en rad hör till |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | varvtid, bilnummer, klass, PI, bana (från varje varvs första rad) |

Utan en beskrivning tas spelet som `forza-horizon` och varje varv som
komplett. Ett varvs källa visas som `<fil> · <varv>` när filen håller flera.
Fel: "… har inga rader", "… har inga x- och z-kolumner", "… har inga varv
med en tidskolumn".

#### Disciplin och underlag {#discipline-and-surface}

Vad analysen antar om ett varv, när varvet inte säger det
(`lap.ts`):

- **Disciplin:** `meta.discipline`, annars är ett spelnamn som stämmer med
  `rally|wrc|dirt|rbr` **rally**, `trackmania` är **arkad**, allt annat **bana**.
- **Underlag:** `meta.surface`, annars från banans namn och källan: en rally
  med namnet `monte` är **blandat**; `snow|ice|winter|arctic|sweden` **snö**; asfaltsrallyna (Spanien/España/Catalunya/Costa Daurada, Kroatien/Hrvatska,
  Centraleuropa, Tyskland/Deutschland, Japan, Korsika/Corse, Ypres, eller
  orden tarmac/asphalt) **asfalt**; ett namn med
  `scramble|trail|cross country|dirt|gravel` är **löst**; en annan rallyetapp
  bedöms utifrån hur bilen kördes: över samplen snabbare än
  12 m/s och på marken (minst 200 av dem), en 95:e percentil av
  sidaccelerationen på 10 m/s² eller mer tillsammans med en medianvinkel för driften
  under 6° (tagen där bilen svängde vid 70 % av det eller mer, minst 30
  sampel) är asfalt; allt annat, eller för lite för att avgöra, är löst. Ett
  icke-rally-namn med `rally` i sig är löst; allt annat asfalt.
- Per sampel åsidosätter en kanal `loose` (Forzas underlagsskakning, Trackmanias
  material, se [Bilens kontrollhändelser](race-control-events.md#the-ground))
  varvets underlag.
