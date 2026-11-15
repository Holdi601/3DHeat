---
title: "Indlæsning af omgange"
parent: "Løbsanalyse"
nav_order: 51
lang: "da"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Indlæsning af omgange

En omgangsfil er en optagelse af én kørsel: hvor bilen var, og hvad føreren gjorde, mange gange i sekundet. Indlæser du to eller flere omgange på samme bane, kan fanen **Løbsanalyse** sammenligne dem.

![Afsnittet Omgange på fanen Løbsanalyse med tre demo-omgange indlæst: omgangslisten, referencestjernen og fokus](../assets/img/en/race-loading-laps-list.webp)

## Dine første omgange {#your-first-laps}

1. Åbn fanen **Løbsanalyse**.
2. Vil du bare kigge? Tryk på **Demo-omgange** (se [Demo-omgange](#demo-laps)).
3. Dine egne omgange: optag dem i spillet med en optager (se [Filformater](#file-formats)). Optageren skriver én fil pr. omgang.
4. Tryk på **Indlæs omgangsfiler …** og vælg to eller flere filer på samme bane, eller tryk på **Mappe …** og vælg den mappe, de ligger i. Du kan også trække filer eller mapper ind på 3D-visningen.
5. Klik på en omgang i listen for at se, hvor den taber tid.

**Advarsel: omgange sammenlignes én bane ad gangen.** Indlæser du en omgang fra en anden navngivet bane, ryddes de omgange, der allerede er indlæst.

## Knapperne {#the-buttons}

| Kontrol | Gør |
|---|---|
| **Indlæs omgangsfiler …** | en filvælger for `.json`-, `.csv`-, `.txt`-, `.ibt`-, `.gz`- og `.h3dcars`-filer, flere ad gangen (`.h3dcars` er en bilfil, se [Biler](race-replay-and-scene.md#the-cars)) |
| **Mappe …** | en mappevælger: hver omgangsfil i mappen og under den |
| **Demo-omgange** | tre opdigtede omgange på en opdigtet bane (se [Demo-omgange](#demo-laps)) |
| **Ryd** | fjerner hver omgang (vises, når omgange er indlæst) |
| slip på visningen | filer og hele mapper, der slippes på 3D-visningen, indlæses på samme måde |

Omgange **tilføjes** til dem, der er indlæst – **medmindre de er fra en anden navngivet bane: så ryddes de indlæste omgange først** (omgange sammenlignes én bane ad gangen). Filer, der ikke kan læses, vises under knapperne, én linje hver; de andre indlæses stadig.

## Filformater {#file-formats}

Formatet afgøres ud fra indholdet, ikke filnavnet. Med almindelige ord:

- **heat3d-lap** er den fil, 3DHeat-optageren skriver for de fleste spil.
- **FH Companion** er et gratis værktøj, der optager Forza Horizon-omgange. Det skriver en omgangsfil og ved siden af den en `.json.tele.gz`-fil (den samme omgang med hvert dæks data, gzip-komprimeret). Vælg begge sammen.
- **iRacing `.ibt`** er iRacings egen telemetrifil; slå optagelsen til i bilen med Alt+L, og indlæs filen, som den er.
- En **omgangs-CSV** er en almindelig tabel, én række pr. øjeblik.

| Format | Typisk kilde | Læses af |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon og Motorsport over Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion-omgang `.json` | FH Companions omgangsbibliotek | `fromFhCompanion` |
| FH Companion-telemetri `.json.tele.gz` | ved siden af hver FH Companion-omgangsfil | `readForzaTelemetry` |
| iRacing `.ibt` | iRacings egne telemetrifiler (optagelse slået til med Alt+L i bilen) | `readIbt` |
| omgangs-CSV | `heat3d_capture laps`, Trackmania-plugin'en, eller en vilkårlig CSV med `x`, `z`, en tidskolonne og evt. en `lap`-kolonne | `fromCsv` |

Hvordan hvert spil optages, og hvad det sender, er dokumenteret af optagerne:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
og [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Se også [Andre racerspil](other-games.md).

## Mapper og baner {#folders-and-courses}

**Mappe …**, eller en mappe der slippes, tager hver fil under den med. Inde i en mappe tages kun filer, der ender på `.json`, `.csv`, `.txt`, `.ibt` eller `.tele.gz`, i betragtning, og en `.json`, der ikke er en omgang (en banes egen fil, dens kort), springes over uden fejl.

**Flere baner i ét valg.** FH Companions omgangsbibliotek gemmer hver bane i en mappe med navnet `<banens navn> (course_<x>_<z>_to_<x>_<z>)` (eller et nøgent `course_...` for en unavngiven bane). Ligger de valgte filer i mere end én sådan banemappe, indlæses intet; i stedet siger sektionen **Omgange**: "Dette er omgange på N baner, og omgange sammenlignes én bane ad gangen. Vælg én:" og lister hver bane med sit antal omgange (filer, der ender på `.json`, `.csv` eller `.ibt`, `course.json` tælles ikke), flest omgange først. Et klik på en indlæser den banes filer.

En bane identificeres ved sit navn og sit **start**punkt, ikke sit slutpunkt: kørsler, der aldrig blev færdige, gemmes af FH Companion under samme navn og start (i `unfinished/`) med det sted, de stoppede, som slut, og de hører til deres bane – markeret **delvis** i listen.

**Flere spor blandt de valgte filer.** Når filer, der er valgt direkte (ikke fra banemapper), er omgange på mere end ét navngivet spor, tilbydes det samme valg pr. spor; omgange, der ikke navngiver et spor, følger med det spor, der er valgt.

## Bilnavne {#car-names}

En omgang kaldes med bilens hele navn, som spillet giver det. Hvor omgangsfilen ikke navngiver bilen:

1. **Mappen.** FH Companions bibliotek gemmer omgange i `<bane>/<klasse>/<bilnavn> '<åå> (car<nummer>)/<tuning>/<tag>/<omgang>.json`. Den inderste mappe, der passer med `<navn> (car<nummer>)`, giver navnet og nummeret; en, der passer med `car<nummer>`, giver kun nummeret. Kun mappevalg og mapper, der slippes, bærer denne sti.
2. **En anden omgang af samme bil.** Når en omgang først navngiver en bil, kaldes hver omgang med samme spil og bilnummer for det – de omgange, der er indlæst sammen, og omgange indlæst senere i denne browser: navnene gemmes i `localStorage` under `heat3d.carNames` (nøglen `<spil>:<bilnummer>`). I et privat vindue varer de lige så længe som omgangene.
3. Ellers "bil 1234" efter dens nummer, eller "bil".

**Etiketter.** I omgangslisten viser en omgang sit bilnavn; flere omgange af samme bil nummereres "Navn #1", "Navn #2". Analysens sætninger bruger de samme etiketter, når de er entydige; ellers bilnavnet med omgangstiden, "Navn (1:29.616)" (eksempeltider), nummereret yderligere, hvis den stadig ikke er entydig.

**Gruppering.** Omgange hører til samme bil (til hylstre, profiler og sammenligninger), når deres bilnummer – eller navn, når der ikke er et nummer – og deres præstationsindeks er ens (`carKey`): samme model med en anden tuning er en anden bil.

**Klasser.** En omgangs præstationsklasse er spillets (Forza D..X, iRacings korte klassenavn); statistikken sorterer dem D, C, B, A, S1, S2, R, X og derefter andre alfabetisk.

## Demo-omgange {#demo-laps}

**Demo-omgange** indlæser tre omgange på en opdigtet bane (fire langsider og fire højresving), lavet af en enkel køretøjsmodel ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): hvert sving's grebsbegrænsede fart, et acceleration-pas fremad og et bremse-pas bagud, som en omgangssimulator gør.

| Omgang | Bil | Fejl |
|---|---|---|
| ren | Grebsbil | ingen |
| med fejl | Grebsbil | bremser 35 m for tidligt ind i T2, kommer på gassen 30 m for sent ud af T3, tager T4 med 0,88 af sin fart, kører 1,2 m til den ene side |
| anden bil | Effektbil | ingen; kører 1,2 m til den anden side |

| Bil (nummer) | Greb | Bremsning | Trækkraft | Effekt/masse | Luftmodstand |
|---|---|---|---|---|---|
| Grebsbil (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Effektbil (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Omgangen med fejlene er i fokus. Banen er lagt ud, som Forza holder sin verden (venstrehåndet), så – ligesom med en rigtig Forza-omgang – kommer den spejlvendt, og fanen tilbyder **Invertér X**. Alle tre omgange har data pr. hjul, så hver del af fanen har noget at vise.

## Omgangslisten {#the-lap-list}

Hver række, fra venstre mod højre:

| Element | Gør |
|---|---|
| ● / ○ | viser / skjuler omgangen (linjer, bil, kort, grafer); skjulte omgange analyseres stadig |
| farvestreg | omgangens farve |
| navn og mærker | klik for at sætte **fokus** på omgangen; hold musen over for dens kildefil og bil (navn · klasse PI · drivlinje) |
| ⌖ | følg denne bil med kameraet (klik igen for at stoppe) |
| ★ | sammenlign alt med denne omgang (gør den til reference); deaktiveret på referencen |
| × | fjerner omgangen |

**Mærker:** *reference*; *bedst af X* (eller *bedst i sin klasse*) på den hurtigste omgang i en klasse, når der er flere klasser; *delvis* på en kørsel, der ikke nåede målstregen.

**Den anden linje:** klassen (kun med flere klasser), omgangstiden (`1:29.616`), forskellen til den omgang, den sammenlignes med (den bedste i sin klasse, eller referencen), som `+0,512` (eksempel), og *starter sent*, når omgangen begynder mere end 10 m efter referencens start.

Med mere end 8 omgange tilbyder en linje "N af M tegnet" **Vis alle** (tegn hver omgang: langsommere, og et virvar) og **Kun dem, du kigger på** (referencen, den omgang i fokus og den bedste i dens klasse; statistikken tæller hver omgang alligevel).

Under listen: tippet om spejling, når omgangene siger, at tegningen er spejlvendt (se [spejlvendte verdener](race-replay-and-scene.md#mirrored-worlds)), og med to eller flere omgange tippet "Klik på en omgang for at se, hvor den taber tid …", samt, med flere klasser, at hver omgang sammenlignes med den hurtigste i sin egen klasse.

### Reference og fokus {#reference-and-focus}

- **Reference:** den omgang, alle de andre flugtes med og, som standard, sammenlignes med. Den hurtigste **fulde** omgang, medmindre ★ har valgt en anden (den først indlæste omgang, når ingen er fuld). Fjerner man referenceomgangen, vender man tilbage til det automatiske valg.
- **Fokus:** den omgang, hvis pointer, bilkontrol og kort vises. Den bliver, hvor brugeren satte den; ellers er det den **langsomste** omgang, der ikke er referencen ("mest at lære"). Sætter man fokus på en omgang, gøres den også synlig igen sammen med den bedste omgang i dens klasse. Sætter man fokus på referencen, sammenlignes den med den anden omgang, der var hurtigst gennem hvert sving.
- **Klasser:** med omgange i flere præstationsklasser sammenlignes hver omgang med den hurtigste fulde omgang i sin egen klasse (referencen, i referencens klasse). Se [Banestatistik](race-course-statistics.md).

### Farver {#colours}

Hver omgang får sin egen farve efter sin plads i indlæsningsrækkefølgen, så en omgang beholder sin farve, når andre skjules. Nuancerne er fordelt rundt om farvehjulet, ligesom heatmap'ets holdtilstand fordeler grupper; for hver plads vælges lysstyrken (0,52 til 0,66 i OKLCH) og kulørtheden (0,12 til 0,18), så de står længst fra nabopladserne (og den sidste fra den første) under normalt, protan og deutan syn, hver mindst 3:1 mod den mørke diagramflade.

## Til udviklere {#for-developers}

Kode: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Sådan læses hvert format {#how-each-format-is-read}

Hvert format ender som ét `LapTrace`: kanaler under kanoniske navne (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., se [kanaltabellen](race-charts-and-hud.md#the-channel-table)), bilen, omgangstiden, om det er en fuld omgang, og et `meta`-felt. For hvert format forskydes `time` og `distance`, så de starter ved 0, og hvor en kilde ikke har `speed`, beregnes den som distance over tid ud fra de nabosamples.

#### heat3d-lap JSON {#heat3d-lap-json}

Et JSON-objekt med `"format": "heat3d-lap"`. Felter, der læses:

| Felt | Brug |
|---|---|
| `channels` | et objekt med arrays, ét pr. kanal, efter kanonisk navn; kanaler pr. hjul som `navn.FL`, `navn.FR`, `navn.RL`, `navn.RR`. `time`, `x` og `z` er påkrævet |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | bilen: id, navn, Forza-klasseindeks (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), præstationsindeks, drivlinjekode (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | omgangstiden; den sidste `time`-værdi, når den mangler |
| `lap.complete` | `false` markerer en delvis kørsel; alt andet er fuld |
| `game`, `track` | navne; `game` afgør disciplinen (se nedenfor) |
| `units.slipRatio` / `units.slipAngle` | hvordan slip er skaleret: en enhed med `raw` betyder `scaled`, `normalised` betyder `peak`, alt andet `physical` |
| `meta` | `slip`, `surface`, `discipline`, når de er angivet, overskriver det ovenstående |

Uden en `distance`-kanal lægges distancen sammen fra 3D-positionerne.

#### FH Companion-omgangsfiler {#fh-companion-lap-files}

Et JSON-objekt med et `Lap`-objekt, der holder et `samples`-array (én sample ca. hver 5 m). Felter, der mappes:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (forskudt, så omgangen starter ved 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | det samme, med små bogstaver |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², trods navnet) |
| `Puddle` | `puddle` |

Bilen kommer fra `Lap.carOrdinal`, `Lap.carName` (kun nyere filer), `Class` (eller `Lap.carClass` som et Forza-klasseindeks), `Lap.performanceIndex`, `Lap.drivetrain` og `Lap.peakKilowatts`; tiden fra `Lap.lapSeconds`; en kørsel med `EndedAtFinish: false` er delvis. Spillet er `forza-horizon`.

Disse filer har ingen dækdata og ingen retning, så låsninger, hjulspin og glidninger kan ikke bedømmes ud fra dem alene; understyring (fra styringen mod stien) og stød og styrt kan det stadig. Vælg også `.tele.gz`-filen ved siden af hver af dem for resten.

#### FH Companion-telemetri (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-komprimeret JSON `{ version, columns, data }`: Forzas hele Data Out for én omgang, én række pr. pakke, med spillets egne feltnavne. Kolonner slås op efter navn, aldrig efter position. Format 2 gemmer hver pakke (ca. 110 i sekundet mod spillets 64 ticks); en række, der er identisk med den før den i alt undtagen optagerens eget ur (`t`, `metres`), fjernes, så en omgang læses med spillets 64 rækker i sekundet. (Indlæsningsknappens tooltip siger det: "for hvert dæks slip ved 64 Hz".)

| Data Out-felt | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (bilens ramme: x til højre, y op, z fremad) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skaleret fra 0..255 til 0..1 |
| `Steer` | `steer`, skaleret fra -127..127 til -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, omregnet fra Fahrenheit til °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pr. hjul |

`<Wheel>` er `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Slip markeres `peak` (Forzas normaliserede slip: ud over 1 har dækket sluppet grebet).

**Parring.** En omgangsfil `<omgang>.json` og `<omgang>.json.tele.gz`, valgt eller sluppet sammen (samme sti, men `.tele.gz`), bliver **én** omgang: telemetriens kanaler, med omgangsfilens bil, klasse, tid, bane og delvis-markering. Telemetrifilens eget bilnavn vinder, når den har et.
En `.tele.gz` alene indlæses også: format 2-filer bærer `car` (`ordinal`, `name`, `class`, `pi`), `track` og `lapSeconds`; uden dem er omgangstiden telemetriens egen varighed, og bilen er ukendt.

#### iRacing `.ibt` {#iracing-ibt}

iRacings telemetrifil læses direkte (i browseren, uden konvertering): 112-byte-headeren, 32-byte disk-underheaderen, variabeltabellen (144 bytes pr. kanal) og session-YAML'en.

- **Påkrævede kanaler:** `SessionTime`, `Lap`, `Lat`, `Lon`. Uden dem: "… har ingen SessionTime-, Lap-, Lat- og Lon-kanaler – er det en iRacing-telemetrifil?"
- **Positioner:** breddegrad og længdegrad lægges ud i meter på et plan, der tangerer ved den første ikke-nul-position (Jordens radius 6 371 008,8 m): x mod øst, z mod syd, y højden (`Alt`) – så med standardkameraet peger nord op ad skærmen. Ikke banens egen ramme; en udtrukket banemodel ville ikke flugte.
- **Omgange:** sessionen deles, hvor `Lap` ændrer sig; en omgang beholdes, når den har mere end 60 samples, starter under 5 % af `LapDistPct` og slutter over 95 %. Delvise omgange fjernes. Er der ingen tilbage: "… har ingen fuld omgang af den N km lange bane" (banelængde fra YAML) eller "… har ingen fuld omgang".
- **Distance:** `LapDist` fra omgangens start, ellers lagt sammen fra positionerne.
- **Bil:** fra `DriverInfo`: spillerens `CarScreenName`, `CarID` (som bilnummer) og `CarClassShortName` (som klasse). Bane: `TrackDisplayName`, ellers `TrackName`.

Kanaler, der mappes:

| iRacing | Kanal | Omregning |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | samme navne | - |
| `Clutch` | `clutch` | `1 - v` (iRacing tæller indkobling; vores er pedalen) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianer mod uret til -1..1, højre positiv; maks. mindst 0,1, π når den mangler) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | samme, med små bogstaver | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | divideret med 100, når over 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatur i dækkets midte |
| `LFshockDefl` ... | `suspensionM.FL` ... | dæmperudslag, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa til psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Hjulpræfikser: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Enhver anden** kanal med én værdi pr. sample (ikke af bit-felt-typen) sendes igennem under sit eget navn – pr. hjul, når den begynder med et hjulpræfiks (`RRspeed` bliver til `speed.RR`) – så graferne og kortenes værdilister tilbyder dem alle. iRacing logger ikke dæk-slip: bilens kontrol bedømmes ud fra driftvinklen – `Yaw`, tilpasset kørselsretningen, mod hvor bilen går – og styringen mod stien. Krøjningshastigheden mod sideacceleration bruges kun, når retningen ikke kan tilpasses, så der er ingen driftvinkel dér (se [Bilens kontrol: hændelser](race-control-events.md)).

Fejl: "… er for kort til at være en .ibt-fil", "… har ikke en iRacing-telemetriheader", "… har ingen positionsfikser".

#### Omgangs-CSV {#lap-csv}

Én række pr. sample; mange omgange i én fil skelnes med en `lap`-kolonne. Skilletegnet findes ud fra de første fem linjer. En valgfri første linje `# { ...json... }` beskriver kørslen: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolonne (uden hensyn til store/små bogstaver) | Kanal |
|---|---|
| `x`, `y`, `z` | position (`x` og `z` påkrævet) |
| `elapsed` eller `time` | `time` (påkrævet pr. omgang) |
| `metres` eller `distance` | `distance` (ellers lagt sammen fra positionerne) |
| `speed_ms` eller `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | det samme |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| et vilkårligt kanonisk kanalnavn, fx `latVel`, `slipIndex.FL` | sig selv |
| `lap` | hvilken omgang en række hører til |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | omgangstid, bilnummer, klasse, PI, bane (fra hver omgangs første række) |

Uden en beskrivelse tages spillet som `forza-horizon`, og hver omgang som fuld. En omgangs kilde vises som `<fil> · <omgang>`, når filen indeholder flere. Fejl: "… har ingen rækker", "… har ingen x- og z-kolonner", "… har ingen omgange med en tidskolonne".

#### Disciplin og underlag {#discipline-and-surface}

Hvad analysen antager om en omgang, når omgangen ikke siger det (`lap.ts`):

- **Disciplin:** `meta.discipline`, ellers er et spilnavn, der matcher `rally|wrc|dirt|rbr`, **rally**; `trackmania` er **arcade**; alt andet **circuit**.
- **Underlag:** `meta.surface`, ellers ud fra banenavnet og kilden: en rally med navnet `monte` er **blandet**; `snow|ice|winter|arctic|sweden` er **sne**; asfaltrallyerne (Spanien/España/Catalunya/Costa Daurada, Kroatien/Hrvatska, Mellemeuropa, Tyskland/Deutschland, Japan, Korsika/Corse, Ypres, eller ordene tarmac/asphalt) er **asfalt**; ethvert navn med `scramble|trail|cross country|dirt|gravel` er **løst**; en anden rallystrækning bedømmes ud fra, hvordan bilen blev kørt: over samples hurtigere end 12 m/s og på underlaget (mindst 200 af dem), en 95. percentil af sideværts acceleration på 10 m/s² eller mere sammen med en median driftvinkel under 6° (taget dér, hvor bilen svingede ved 70 % af det eller mere, mindst 30 samples) er asfalt; alt andet, eller for lidt til at afgøre det, er løst. Et ikke-rally-navn med `rally` i sig er løst; alt andet asfalt.
- Pr. sample overskriver en `loose`-kanal (Forzas underlagsvibration, Trackmanias materialer, se [Bilens kontrol: hændelser](race-control-events.md#the-ground)) omgangens underlag.
