---
title: "Laste inn runder"
parent: "Løpsanalyse"
nav_order: 51
lang: "no"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Laste inn runder

En rundefil er et opptak av én kjøring: hvor bilen var og hva føreren gjorde, mange ganger i sekundet. Last inn to eller flere runder på samme bane, så kan fanen **Løpsanalyse** sammenligne dem.

![The Laps section of the Race analysis tab with three demo laps loaded: lap list, reference star, focus](../assets/img/en/race-loading-laps-list.webp)

## Dine første runder {#your-first-laps}

1. Åpne fanen **Løpsanalyse**.
2. Vil du bare se? Trykk **Demorunder** (se [Demorunder](#demo-laps)).
3. Egne runder: ta dem opp i spillet med en opptaker (se [Filformater](#file-formats)). Opptakeren skriver én fil per runde.
4. Trykk **Last inn rundefiler…** og velg to eller flere filer for samme bane, eller trykk **Mappe…** og velg mappen som inneholder dem. Du kan også slippe filer eller mapper over 3D-visningen.
5. Klikk på en runde i listen for å se hvor den taper tid.

**Advarsel: runder sammenlignes én bane om gangen.** Å laste inn en runde fra en annen navngitt bane tømmer rundene som allerede er lastet inn.

## Knappene {#the-buttons}

| Kontroll | Gjør |
|---|---|
| **Last inn rundefiler…** | en filvelger for `.json`-, `.csv`-, `.txt`-, `.ibt`-, `.gz`- og `.h3dcars`-filer, flere om gangen (`.h3dcars` er en bilfil, se [Biler](race-replay-and-scene.md#the-cars)) |
| **Mappe…** | en mappevelger: hver rundefil i mappen og under den |
| **Demorunder** | tre oppdiktede runder på en oppdiktet bane (se [Demorunder](#demo-laps)) |
| **Tøm** | fjerner hver runde (vises når runder er lastet inn) |
| slipp på visningen | filer og hele mapper som slippes på 3D-visningen, lastes inn på samme måte |

Runder **legges til** dem som er lastet inn - **med mindre de er fra en annen navngitt bane: da tømmes de innlastede rundene først** (runder sammenlignes én bane om gangen). Filer som ikke kan leses, står under knappene, én linje hver; de andre lastes likevel inn.

## Filformater {#file-formats}

Formatet avgjøres av innholdet, ikke filnavnet. Med enkle ord:

- **heat3d-lap** er filen 3DHeat-opptakeren skriver for de fleste spill.
- **FH Companion** er et gratisverktøy som tar opp Forza Horizon-runder. Det skriver en rundefil og, ved siden av, en `.json.tele.gz`-fil (samme runde med alle hjulenes data, gzip-komprimert). Velg begge sammen.
- **iRacing `.ibt`** er iRacings egen telemetrifil. Slå på logging i bilen med Alt+L og last inn filen slik den er.
- En **rundes CSV** er en vanlig tabell, én rad per øyeblikk.

| Format | Typisk kilde | Leses av |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon og Motorsport over Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion-runde `.json` | FH Companions rundebibliotek | `fromFhCompanion` |
| FH Companion-telemetri `.json.tele.gz` | ved siden av hver FH Companion-rundefil | `readForzaTelemetry` |
| iRacing `.ibt` | iRacings egne telemetrifiler (logging på med Alt+L i bilen) | `readIbt` |
| runde-CSV | `heat3d_capture laps`, Trackmania-pluginen, eller en hvilken som helst CSV med `x`, `z`, en tidskolonne og valgfritt en `lap`-kolonne | `fromCsv` |

Hvordan hvert spill tas opp, og hva det sender, er dokumentert av opptakerne:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
og [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Se også [Andre racingspill](other-games.md).

## Mapper og baner {#folders-and-courses}

**Mappe…**, eller en sluppet mappe, henter alle filer under den. Inne i en mappe vurderes bare filer som slutter på `.json`, `.csv`, `.txt`, `.ibt` eller `.tele.gz`, og en `.json` som ikke er en runde (banens egen fil, kartet) hoppes over uten feil.

**Flere baner i ett valg.** FH Companions rundebibliotek holder hver bane i en mappe med navnet `<banenavn> (course_<x>_<z>_to_<x>_<z>)` (eller bare `course_...` for en bane uten navn). Når de valgte filene ligger i mer enn én slik banemappe, lastes ingenting inn. I stedet sier seksjonen **Runder** "Dette er runder fra N baner, og runder sammenlignes én bane om gangen. Velg én:" og lister hver bane med antall runder (filer som slutter på `.json`, `.csv` eller `.ibt`, `course.json` telles ikke), flest runder først. Et klikk på én laster inn den banens filer.

En bane identifiseres med navnet og **startpunktet**, ikke sluttpunktet. Løp som aldri ble fullført, holdes av FH Companion under samme navn og start (i `unfinished/`), med stedet de stoppet som slutt, og de følger sin bane og er merket **delvis** i listen.

**Flere spor blant valgte filer.** Når filer som velges direkte (ikke fra banemapper) er runder på mer enn ett navngitt spor, tilbys samme valg per spor. Runder som ikke navngir et spor, følger med det sporet som velges.

## Bilnavn {#car-names}

En runde kalles etter bilens fulle navn, slik spillet gir det. Der rundefilen ikke navngir bilen:

1. **Mappen.** FH Companions bibliotek holder runder i `<bane>/<klasse>/<bilnavn> '<yy> (car<nummer>)/<tuning>/<tagg>/<runde>.json`. Den innerste mappen som passer `<navn> (car<nummer>)`, gir navnet og nummeret; en som passer `car<nummer>`, gir bare nummeret. Bare valg av mapper og slupne mapper har denne banen.
2. **En annen runde med samme bil.** Når én runde navngir en bil, kalles hver runde med samme spill og bilnummer for det - rundene lastet inn sammen, og runder lastet inn senere i denne nettleseren: navnene lagres i `localStorage` under `heat3d.carNames` (nøkkel `<spill>:<bilnummer>`). I et privat vindu varer de så lenge rundene gjør.
3. Ellers "car 1234" etter nummeret, eller "car".

**Etiketter.** I rundelisten viser en runde bilens navn; flere runder med samme bil nummereres "Navn #1", "Navn #2". Analysens setninger bruker de samme etikettene når de er unike. Ellers bilens navn med rundetiden, "Navn (1:29.616)" (eksempeltider), nummerert videre hvis det fortsatt ikke er unikt.

**Gruppering.** Runder hører til samme bil (for omhyllinger, profiler og sammenligninger) når bilnummeret - eller navnet når det ikke finnes et nummer - og ytelsesindeksen deres er den samme (`carKey`): samme modell med en annen tuning er en annen bil.

**Klasser.** En runde sin ytelsesklasse er spillets (Forza D..X, iRacings kortnavn for bilklassen). Statistikken ordner dem D, C, B, A, S1, S2, R, X, og deretter andre alfabetisk.

## Demorunder {#demo-laps}

**Demorunder** laster inn tre runder på en oppdiktet bane (fire rettstrekninger og fire høyresvinger), laget av en enkel kjøretøymodell
([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): hvert svings grepbegrensede fart, en akselerasjonsgjennomgang forover og en bremsegjennomgang bakover, slik en rundesimulator gjør.

| Runde | Bil | Feil |
|---|---|---|
| ren | Grep-bil | ingen |
| med feil | Grep-bil | bremser 35 m tidlig inn i T2, får gass 30 m sent ut av T3, tar T4 med 0,88 av sin fart, kjører 1,2 m til den ene siden |
| annen bil | Kraft-bil | ingen; kjører 1,2 m til den andre siden |

| Bil (nummer) | Grep | Bremsing | Trekkraft | Kraft/masse | Luftmotstand |
|---|---|---|---|---|---|
| Grep-bil (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Kraft-bil (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Runden med feilene er fokusert. Banen er lagt ut slik Forza holder sin verden (venstrehåndet), så - akkurat som med en ekte Forza-runde - kommer den speilvendt ut, og fanen tilbyr **Inverter X**. Alle tre rundene har data per hjul, så hver del av fanen har noe å vise.

## Rundelisten {#the-lap-list}

Hver rad, fra venstre mot høyre:

| Element | Gjør |
|---|---|
| ● / ○ | viser / skjuler runden (linjer, bil, kort, diagrammer); skjulte runder analyseres fortsatt |
| fargestrek | rundens farge |
| navn og merkelapper | klikk for å **fokusere** runden; hold musen over for kildefilen og bilen (navn · klasse PI · drivlinje) |
| ⌖ | følg denne bilen med kameraet (klikk igjen for å stoppe) |
| ★ | sammenlign alt mot denne runden (gjør den til referanse); deaktivert på referansen |
| × | fjern runden |

**Merkelapper:** *referanse*; *beste av X* (eller *beste i sin klasse*) på den raskeste runden i en klasse når det finnes flere klasser; *delvis* på et løp som ikke nådde mål.

**Den andre linjen:** klassen (bare med flere klasser), rundetiden (`1:29.616`), gapet til runden den sammenlignes med (den beste i sin klasse, eller referansen) som `+0.512` (eksempel), og *starter sent* når runden begynner mer enn 10 m etter referansens start.

Med mer enn 8 runder vises en linje "N av M tegnet" med **Vis alle** (tegn hver runde: tregere, og en floke) og **Bare de du ser på** (referansen, den fokuserte runden og den beste i sin klasse; statistikken teller hver runde uansett).

Under listen: hintet om speiling når rundene sier at tegningen er speilvendt (se [speilvendte verdener](race-replay-and-scene.md#mirrored-worlds)), og med to eller flere runder hintet "Klikk på en runde for å se hvor den taper tid …", pluss at hver runde, med flere klasser, sammenlignes med den raskeste i sin egen klasse.

### Referanse og fokus {#reference-and-focus}

- **Referanse:** runden alle andre stilles opp mot og, som standard, sammenlignes med. Den raskeste **fullstendige** runden, med mindre ★ velger en annen (den først innlastede runden når ingen er fullstendig). Å fjerne referanserunden går tilbake til det automatiske valget.
- **Fokus:** runden som funnene, bilkontrollen og kartene vises for. Den blir der brukeren satte den; ellers er det den **saktest** runden som ikke er referansen ("mest å lære"). Å fokusere en runde viser den også og den beste runden i sin klasse. Å fokusere referansen sammenligner den med den andre runden som var raskest gjennom hvert sving.
- **Klasser:** med runder fra flere ytelsesklasser sammenlignes hver runde med den raskeste fullstendige runden i sin egen klasse (referansen, i referansens klasse). Se [Banestatistikk](race-course-statistics.md).

### Farger {#colours}

Hver runde får sin egen farge, etter plassen i innlastingsrekkefølgen, så en runde beholder fargen når andre skjules. Nyansene er fordelt rundt fargehjulet slik varmekartets lagmodus fordeler grupper. For hver plass velges lysheten (0,52 til 0,66 i OKLCH) og kromaen (0,12 til 0,18) slik at de står lengst fra nabo-plassene (og den siste fra den første) under normalt syn, protanopi og deuteranopi, hver minst 3:1 mot den mørke diagramflaten.

## For utviklere {#for-developers}
Kode: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Hvordan hvert format leses {#how-each-format-is-read}

Hvert format ender som ett `LapTrace`: kanaler under kanoniske navn (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...,
se [kanaltabellen](race-charts-and-hud.md#the-channel-table)), bilen, rundetiden, om det er en fullstendig runde, og en `meta`-blokk. For hvert format forskyves `time` og `distance` til å starte på 0, og der en kilde ikke har `speed`, regnes den ut som distanse delt på tid fra naboprøvene.

#### heat3d-lap JSON {#heat3d-lap-json}

Et JSON-objekt med `"format": "heat3d-lap"`. Felt som leses:

| Felt | Bruk |
|---|---|
| `channels` | et objekt med arrayer, én per kanal, etter kanonisk navn; kanaler per hjul som `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` og `z` må finnes |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | bilen: id, navn, Forza-klasseindeks (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), ytelsesindeks, drivlinjekode (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | rundetiden; siste `time`-verdi når den mangler |
| `lap.complete` | `false` markerer et delvis løp; alt annet er fullstendig |
| `game`, `track` | navn; `game` avgjør disiplinen (se under) |
| `units.slipRatio` / `units.slipAngle` | hvordan slip er skalert: en enhet som inneholder `raw` betyr `scaled`, `normalised` betyr `peak`, alt annet `physical` |
| `meta` | `slip`, `surface`, `discipline` som oppgitt overstyrer det over |

Uten en `distance`-kanal summeres distansen fra 3D-posisjonene.

#### FH Companion-rundefiler {#fh-companion-lap-files}

Et JSON-objekt med et `Lap`-objekt som holder en `samples`-array (ett målepunkt omtrent hver 5 m). Felt som kobles:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (forskjøvet så runden starter på 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | det samme, med små bokstaver |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², til tross for navnet) |
| `Puddle` | `puddle` |

Bilen kommer fra `Lap.carOrdinal`, `Lap.carName` (bare nyere filer), `Class` (eller `Lap.carClass` som en Forza-klasseindeks), `Lap.performanceIndex`, `Lap.drivetrain` og `Lap.peakKilowatts`; tiden fra `Lap.lapSeconds`; et løp med `EndedAtFinish: false` er delvis. Spillet er `forza-horizon`.

Disse filene har ingen dekkdata og ingen retning, så låsing, hjulspinn og slide kan ikke bedømmes fra dem alene. Presing (fra styringen mot stien) og støt og krasj kan fortsatt. Velg også `.tele.gz` ved siden av hver for resten.

#### FH Companion-telemetri (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-komprimert JSON `{ version, columns, data }`: Forzas hele Data Out for én runde, én rad per pakke, med spillets egne feltnavn. Kolonner slås opp etter navn, aldri etter posisjon. Format 2 beholder hver pakke (omtrent 110 per sekund mot spillets 64 ticks). En rad som er lik raden før i alt unntatt opptakerens egen klokke (`t`, `metres`), fjernes, så en runde leses med spillets 64 rader per sekund. (Tooltipet på lastknappen sier det: "for every tyre's slip at 64 Hz".)

| Data Out-felt | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (bilens ramme: x høyre, y opp, z forover) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skalert fra 0..255 til 0..1 |
| `Steer` | `steer`, skalert fra -127..127 til -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, omregnet fra Fahrenheit til °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` per hjul |

`<Wheel>` er `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Slip er merket `peak` (Forzas normaliserte slip: over
1 har dekket sluppet taket).

**Paring.** En rundefil `<runde>.json` og `<runde>.json.tele.gz` valgt eller sluppet sammen (samme sti, men med `.tele.gz`) blir **én** runde: telemetriens kanaler, med rundefilens bil, klasse, tid, bane og delvis-merket. Telemetrifilens eget bilnavn vinner når det finnes ett.
En `.tele.gz` alene lastes fortsatt inn: format 2-filer har `car`
(`ordinal`, `name`, `class`, `pi`), `track` og `lapSeconds`. Uten disse er rundetiden telemetriens egen varighet, og bilen er ukjent.

#### iRacing `.ibt` {#iracing-ibt}

iRacings telemetrifil leses direkte (i nettleseren, uten konvertering): 112-byte-hodet, 32-byte-underhodet på disken, variabeltabellen (144 byte per kanal) og økt-YAML-en.

- **Påkrevde kanaler:** `SessionTime`, `Lap`, `Lat`, `Lon`. Uten dem: "… har ingen SessionTime-, Lap-, Lat- og Lon-kanaler - er det en iRacing-telemetrifil?"
- **Posisjoner:** breddegrad og lengdegrad legges ut i meter på et plan som tangerer ved den første ikke-null posisjonen (jordradius 6 371 008,8 m): x øst, z sør, y høyden (`Alt`) - så med standardkameraet som peker nord, er nord opp på skjermen. Ikke banens egen ramme: en utpakket banemodell ville ikke stemme overens.
- **Runder:** økten deles der `Lap` endrer seg. En runde beholdes når den har mer enn 60 målepunkter, starter under 5 % av `LapDistPct` og slutter over 95 %. Delvise runder fjernes. Når ingen er igjen: "… har ingen fullstendig runde på den N km lange banen" (banelengde fra YAML-en) eller "… har ingen fullstendig runde".
- **Distanse:** `LapDist` fra rundens start, ellers summert fra posisjonene.
- **Bil:** fra `DriverInfo`: spillerens `CarScreenName`, `CarID` (som bilnummer) og `CarClassShortName` (som klasse). Bane: `TrackDisplayName`, ellers `TrackName`.

Kanaler som kobles:

| iRacing | Kanal | Omregning |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | samme navn | - |
| `Clutch` | `clutch` | `1 - v` (iRacing teller innkobling; vår er pedalen) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianer mot klokken til -1..1, høyre positiv; maks minst 0,1, π når den mangler) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | samme, med små bokstaver | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | delt på 100 når over 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatur midt i karkassen |
| `LFshockDefl` ... | `suspensionM.FL` ... | dempervandring, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa til psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Hjulprefikser: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Hver annen**
kanal med én verdi per prøve (ikke bitfelt-typen) sendes videre under sitt eget navn - per hjul når den begynner med et hjulprefiks
(`RRspeed` blir `speed.RR`) - så grafene og kortenes verdilister tilbyr dem alle. iRacing logger ingen dekkslip: bilkontroll bedømmes ut fra driftvinkelen - `Yaw`, tilpasset kjøreretningen, mot der bilen går - og styringen mot stien. Girhastigheten mot sideakselerasjonen brukes bare når retningen ikke kan tilpasses, så da finnes ingen driftvinkel (se [Bilhendelser](race-control-events.md)).

Feil: "… er for kort til å være en .ibt-fil", "… har ikke en iRacing-telemetrihode", "… har ingen posisjonsfikser".

#### Runde-CSV {#lap-csv}

En rad per prøve; mange runder i én fil skilles med en `lap`-kolonne. Skilletegnet oppdages fra de første fem linjene. En valgfri første linje `# { ...json... }` beskriver løpet: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolonne (uavhengig av store/små bokstaver) | Kanal |
|---|---|
| `x`, `y`, `z` | posisjon (`x` og `z` påkrevd) |
| `elapsed` eller `time` | `time` (påkrevd per runde) |
| `metres` eller `distance` | `distance` (ellers summert fra posisjonene) |
| `speed_ms` eller `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | samme |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| ethvert kanonisk kanalnavn, f.eks. `latVel`, `slipIndex.FL` | seg selv |
| `lap` | hvilken runde en rad hører til |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | rundetid, bilnummer, klasse, PI, bane (fra hver runde sin første rad) |

Uten en beskrivelse tas spillet som `forza-horizon`, og hver runde som fullstendig. En runde sin kilde vises som `<fil> · <runde>` når filen har flere. Feil: "… har ingen rader", "… har ingen x- og z-kolonner", "… har ingen runder med en tidskolonne".

#### Disiplin og underlag {#discipline-and-surface}

Hva analysen går ut fra om en runde, når runden ikke sier det
(`lap.ts`):

- **Disiplin:** `meta.discipline`, ellers er et spillnavn som passer `rally|wrc|dirt|rbr` **rally**, `trackmania` er **arcade**, alt annet **bane**.
- **Underlag:** `meta.surface`, ellers fra banenavnet og kilden: et rally som heter `monte` er **blandet**; `snow|ice|winter|arctic|sweden` er **snø**; asfaltrallyene (Spania/España/Catalunya/Costa Daurada, Kroatia/Hrvatska, Mellom-Europa, Tyskland/Deutschland, Japan, Korsika/Corse, Ypres, eller ordene tarmac/asphalt) er **asfalt**; ethvert navn med `scramble|trail|cross country|dirt|gravel` er **løst**; en annen rallystrekning bedømmes etter hvordan bilen ble kjørt: over prøvene raskere enn 12 m/s og på underlaget (minst 200 av dem), et 95. persentil av sidesakselerasjon på 10 m/s² eller mer sammen med en medianan driftvinkel under 6° (tatt der bilen svingte ved 70 % av det eller mer, minst 30 prøver) er asfalt; alt annet, eller for lite til å avgjøre, er løst. Et ikke-rally-navn med `rally` i seg er løst; alt annet er asfalt.
- Per prøve overstyrer en `loose`-kanal (Forzas underlagsvibrasjon, Trackmanias materialer, se [Bilhendelser](race-control-events.md#the-ground)) rundens underlag.
