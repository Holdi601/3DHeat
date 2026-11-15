---
title: "Apļu ielāde"
parent: "Sacīkšu analīze"
nav_order: 51
lang: "lv"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Apļu ielāde

Apļa fails ir viena brauciena ieraksts: kur bija automašīna un ko darīja vadītājs, daudzas reizes sekundē. Ielādējiet divus vai vairākus vienas trases apļus, un cilne **Sacīkšu analīze** var tos salīdzināt.

![Sadaļa Apļi cilnē Sacīkšu analīze ar trim ielādētiem demo apļiem: apļu saraksts, atsauces zvaigzne, fokuss](../assets/img/en/race-loading-laps-list.webp)

## Jūsu pirmie apļi {#your-first-laps}

1. Atveriet cilni **Sacīkšu analīze**.
2. Tikai skatāties? Nospiediet **Demo apļi** (skatiet [Demo apļi](#demo-laps)).
3. Savi apļi: ierakstiet tos spēlē ar ierakstītāju (skatiet [Failu formāti](#file-formats)). Ierakstītājs raksta vienu failu katram aplim.
4. Nospiediet **Ielādēt apļu failus…** un izvēlieties divus vai vairākus vienas trases failus, vai nospiediet **Mape…** un izvēlieties mapi, kurā tie atrodas. Failus vai mapes var arī nomest uz 3D skata.
5. Noklikšķiniet uz apļa sarakstā, lai redzētu, kur tas zaudē laiku.

**Brīdinājums: apļi tiek salīdzināti pa vienai trasei.** Apļa ielāde citā nosauktā trasē notīra jau ielādētos apļus.

## Pogas {#the-buttons}

| Vadība | Dara |
|---|---|
| **Ielādēt apļu failus…** | failu izvēlne `.json`, `.csv`, `.txt`, `.ibt`, `.gz` un `.h3dcars` failiem, vairāki vienlaikus (`.h3dcars` ir automašīnas fails, skatiet [Automašīnas](race-replay-and-scene.md#the-cars)) |
| **Mape…** | mapes izvēlne: katrs apļa fails mapē un zemākos līmeņos |
| **Demo apļi** | trīs izdomāti apļi izdomātā trasē (skatiet [Demo apļi](#demo-laps)) |
| **Notīrīt** | noņem katru aplis (redzams, kad apļi ir ielādēti) |
| nomest uz skata | faili un veselas mapes, kas nomestas uz 3D skata, tiek ielādēti tāpat |

Apļi tiek **pievienoti** jau ielādētajiem — **izņemot, ja tie ir citā nosauktā trasē: tad vispirms tiek notīrīti ielādētie apļi** (apļi tiek salīdzināti pa vienai trasei). Faili, ko nevar nolasīt, ir uzskaitīti zem pogām, pa vienai rindai katrs; pārējie tomēr ielādējas.

## Failu formāti {#file-formats}

Formāts tiek noteikts pēc satura, nevis failu nosaukuma. Vienkāršos vārdos:

- **heat3d-lap** ir fails, ko 3DHeat ierakstītājs raksta lielākajai daļai spēļu.
- **FH Companion** ir bezmaksas rīks, kas ieraksta Forza Horizon apļus. Tas raksta apļa failu un blakus `.json.tele.gz` failu (tas pats aplis ar katras riepas datiem, saspiests ar gzip). Izvēlieties abus kopā.
- **iRacing `.ibt`** ir paša iRacing telemetrijas fails; ieslēdziet ierakstīšanu automašīnā ar Alt+L un ielādējiet failu tādu, kāds tas ir.
- **Apļa CSV** ir vienkārša tabula, viena rinda katram brīdim.

| Formāts | Tipisks avots | Lasa |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon un Motorsport caur Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion apļa `.json` | FH Companion apļu bibliotēka | `fromFhCompanion` |
| FH Companion telemetrija `.json.tele.gz` | blakus katram FH Companion apļa failam | `readForzaTelemetry` |
| iRacing `.ibt` | paša iRacing telemetrijas faili (ierakstīšana ar Alt+L automašīnā) | `readIbt` |
| apļa CSV | `heat3d_capture laps`, Trackmania spraudnis vai jebkurš CSV ar `x`, `z`, laika kolonnu un pēc izvēles `lap` kolonnu | `fromCsv` |

Kā katra spēle tiek ierakstīta un ko tā sūta, dokumentē paši ierakstītāji: [GameCapture: spēles](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) un [GameCapture: apļa formāts](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md). Skatiet arī [Citas sacīkšu spēles](other-games.md).

## Mapes un trases {#folders-and-courses}

**Mape…** vai nomesta mape ņem katru failu zemāk. Mapē tiek ņemti vērā tikai faili, kuru nosaukumi beidzas ar `.json`, `.csv`, `.txt`, `.ibt` vai `.tele.gz`, un `.json`, kas nav aplis (trases pašas fails, tās karte), tiek izlaists bez kļūdas.

**Vairākas trases vienā izvēlē.** FH Companion apļu bibliotēkā katra trase ir mapē ar nosaukumu `<trases nosaukums> (course_<x>_<z>_to_<x>_<z>)` (vai vienkārši `course_...` nenosauktai trasei). Kad izvēlētie faili atrodas vairāk nekā vienā šādā trases mapē, nekas netiek ielādēts; tā vietā sadaļā **Apļi** parādās teksts "Šie ir N trasu apļi, un apļi tiek salīdzināti pa vienai trasei. Izvēlieties vienu:" un uzskaitīta katra trase ar apļu skaitu (faili, kas beidzas ar `.json`, `.csv` vai `.ibt`, `course.json` neskaitot), vairāk apļu pirmā. Noklikšķinot uz vienas, ielādējas šīs trases faili.

Trase tiek identificēta pēc tās nosaukuma un **sākuma** punkta, nevis beigu: braucieni, kas nekad nav pabeigti, FH Companion glabā tajā pašā nosaukumā un sākumā (mapē `unfinished/`), ar vietu, kur tie apstājās, kā beigām, un tie paliek kopā ar savu trasi — sarakstā atzīmēti kā **daļējs**.

**Vairākas trases starp izvēlētajiem failiem.** Kad faili, kas izvēlēti tieši (nevis no trases mapēm), ir apļi vairāk nekā vienā nosauktā trasē, tāda pati izvēle tiek piedāvāta katrai trasei; apļi, kas nenosauc trasi, iet kopā ar to trasi, kas izvēlēta.

## Automašīnu nosaukumi {#car-names}

Apli sauc pēc automašīnas pilnā nosaukuma, kā to dod spēle. Kur apļa fails neiekļauj automašīnas nosaukumu:

1. **Mape.** FH Companion bibliotēka glabā apļus mapē `<trase>/<klase>/<automašīnas nosaukums> '<yy> (car<numurs>)/<tune>/<tag>/<aplis>.json`. Iekšējākā mape, kas atbilst `<nosaukums> (car<numurs>)`, dod nosaukumu un numuru; tā, kas atbilst `car<numurs>`, dod tikai numuru. Tikai mapes izvēle un nomestas mapes nes šo ceļu.
2. **Cits tās pašas automašīnas aplis.** Kad jebkurš aplis nosauc automašīnu, katrs aplis ar to pašu spēli un automašīnas numuru tiek saukts tā — kopā ielādētie apļi un vēlāk šajā pārlūkā ielādētie apļi: nosaukumi tiek glabāti `localStorage` zem `heat3d.carNames` (atslēgts kā `<spēle>:<automašīnas numurs>`). Privātā logā tie ilgst, kamēr apļi.
3. Citādi "auto 1234" pēc tā numura vai "auto".

**Etiķetes.** Apļu sarakstā aplis rāda savas automašīnas nosaukumu; vairāki tās pašas automašīnas apļi ir numurēti "Nosaukums #1", "Nosaukums #2". Analīzes teikumi lieto tās pašas etiķetes, kad tās ir unikālas; citādi automašīnas nosaukumu ar apļa laiku, "Nosaukums (1:29.616)" (piemēra laiki), vēl numurētu, ja joprojām nav unikāls.

**Grupēšana.** Apļi pieder tai pašai automašīnai (īpašībām, profiliem un salīdzinājumiem), kad to automašīnas numurs — vai nosaukums, ja numura nav — un to veiktspējas indekss ir vienādi (`carKey`): tas pats modelis ar citu tune ir cita automašīna.

**Klases.** Apļa veiktspējas klase ir spēles klase (Forza D..X, iRacing automašīnas klases īsais nosaukums); statistika tās sakārto D, C, B, A, S1, S2, R, X, tad pārējās alfabētiski.

## Demo apļi {#demo-laps}

**Demo apļi** ielādē trīs apļus izdomātā trasē (četras taisnes un četri pagriezieni pa labi), ko veidojis vienkāršs transportlīdzekļa modelis ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): katra līkuma ar saķeri ierobežotais ātrums, paātrinājuma gājiens uz priekšu un bremzēšanas gājiens atpakaļ, kā to dara apļu simulators.

| Aplis | Auto | Kļūdas |
|---|---|---|
| tīrs | Saķeres auto | nav |
| ar kļūdām | Saķeres auto | bremzē 35 m agrāk uz T2, uzliek gāzi 30 m vēlāk ārā no T3, brauc T4 ar 0,88 no sava ātruma, novirzās 1,2 m uz vienu pusi |
| cits auto | Jaudas auto | nav; novirzās 1,2 m uz otru pusi |

Apli ar kļūdām fokusē. Trase ir izkārtota tā, kā Forza glabā savu pasauli (kreisroku), tāpēc — tieši kā ar īstu Forza apli — tas nāk spoguļots, un cilne piedāvā **Apgriezt X**. Visiem trim apļiem ir riteņu dati, tāpēc katrai cilnes daļai ir ko rādīt.


## Apļu saraksts {#the-lap-list}

Katra rinda, no kreisās uz labo:

| Elements | Dara |
|---|---|
| ● / ○ | rāda / slēpj apli (līnijas, auto, kartīte, diagrammas); slēptie apļi joprojām tiek analizēti |
| krāsas svītra | apļa krāsa |
| nosaukums un tagi | noklikšķiniet, lai **fokusētu** apli; uzvelciet kursoru, lai redzētu tā avota failu un automašīnu (nosaukums · klases PI · piedziņa) |
| ⌖ | sekot šai automašīnai ar kameru (vēlreiz noklikšķiniet, lai apturētu) |
| ★ | salīdzināt visu ar šo apli (padarīt to par atsauci); nav pieejams atsaucei |
| × | noņemt apli |

**Tagi:** *atsauce*; *labākais no X* (vai *labākais savā klasē*) ātrākajam klases aplim, kad ir vairākas klases; *daļējs* braucienam, kas nesasniedza finišu.

**Otrā rinda:** klase (tikai ar vairākām klasēm), apļa laiks (`1:29.616`), starpība līdz aplim, ar ko tas tiek salīdzināts (labākais no savas klases vai atsauce), kā `+0.512` (piemērs), un *sākas vēlu*, kad aplis sākas vairāk nekā 10 m pēc atsauces starta.

Ar vairāk nekā 8 apļiem rindā "N no M zīmēti" piedāvā **Rādīt visas** (zīmēt katru apli: lēnāk un sajaukts) un **Tikai aplūkotos** (atsauce, fokusētais aplis un labākais savā klasē; statistika skaita katru apli jebkurā gadījumā).

Zem saraksta: norāde par spoguļotu, kad apļi norāda, ka zīmējums ir spoguļots (skatiet [spoguļotas pasaules](race-replay-and-scene.md#mirrored-worlds)), un ar diviem vai vairākiem apļiem padoms "Noklikšķiniet uz apļa, lai redzētu, kur tas zaudē laiku …", kā arī, ar vairākām klasēm, ka katrs aplis tiek salīdzināts ar ātrāko savā klasē.

### Atsauce un fokuss {#reference-and-focus}

- **Atsauce:** aplis, pie kura visi pārējie tiek izlīdzināti un pēc noklusējuma salīdzināti. Ātrākais **pilnais** aplis, ja vien ★ nav izvēlējies citu (pirmais ielādētais aplis, ja neviens nav pilns). Atsauces apļa noņemšana atgriež automātisko izvēli.
- **Fokuss:** aplis, kura atradumi, automašīnas vadība un kartes ir redzamas. Tas paliek tur, kur lietotājs to ielika; citādi tas ir **lēnākais** aplis, kas nav atsauce ("visvairāk, ko mācīties"). Fokusējot apli, tas tiek arī atslēgts un labākais tā klases aplis. Atsauces fokusēšana salīdzina to ar to citu apli, kas bija ātrākais katrā līkumā.
- **Klases:** ar apļiem dažādās veiktspējas klasēs katrs aplis tiek salīdzināts ar ātrāko pilno apli savā klasē (atsauci atsauces klasē). Skatiet [Trases statistika](race-course-statistics.md).

### Krāsas {#colours}

Katrs aplis saņem savu krāsu pēc vietas ielādes secībā, tāpēc aplis saglabā savu krāsu, kad citi ir paslēpti. Toņi ir izvietoti pa krāsu riteni tāpat kā siltumkartes komandas režīms izvieto grupas; katram slotam spilgtums (0,52 līdz 0,66 OKLCH) un hroma (0,12 līdz 0,18) ir izvēlēti tā, lai atrastos vistālāk no blakus esošajiem slotiem (un pēdējais no pirmā) normālā, protan un deutan redzē, katrs vismaz 3:1 pret tumšo diagrammas virsmu.

## Izstrādātājiem {#for-developers}

Kods: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kā katrs formāts tiek lasīts {#how-each-format-is-read}

Katrs formāts beidzas kā viens `LapTrace`: kanāli ar kanoniskiem nosaukumiem (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., skatiet [kanālu tabulu](race-charts-and-hud.md#the-channel-table)), automašīna, apļa laiks, vai tas ir pilns aplis, un `meta` bloks. Katram formātam `time` un `distance` tiek nobīdīti, lai sāktos no 0, un, kur avotam nav `speed`, tas tiek aprēķināts kā attālums dalīts ar laiku no blakus paraugiem.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON objekts ar `"format": "heat3d-lap"`. Nolasītie lauki:

| Lauks | Lietojums |
|---|---|
| `channels` | objekts ar masīviem, pa vienam katram kanālam, pēc kanoniskā nosaukuma; katra riteņa kanāli kā `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` un `z` ir obligāti |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | automašīna: id, nosaukums, Forza klases indekss (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), veiktspējas indekss, piedziņas kods (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | apļa laiks; pēdējā `time` vērtība, ja trūkst |
| `lap.complete` | `false` atzīmē daļēju braucienu; jebkas cits ir pilns |
| `game`, `track` | nosaukumi; `game` nosaka disciplīnu (skatiet zemāk) |
| `units.slipRatio` / `units.slipAngle` | kā slīde ir mērogota: vienība, kas satur `raw`, nozīmē `scaled`, `normalised` nozīmē `peak`, citādi `physical` |
| `meta` | `slip`, `surface`, `discipline`, kā dots, pārraksta iepriekš minēto |

Bez `distance` kanāla attālums tiek saskaitīts no 3D pozīcijām.

#### FH Companion apļu faili {#fh-companion-lap-files}

JSON objekts ar `Lap` objektu, kurā ir `samples` masīvs (viens paraugs apmēram ik pēc 5 m). Kartētie lauki:

| FH Companion | Kanāls |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (nobīdīts, lai aplis sāktos no 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | tie paši, mazajos burtos |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², neskatoties uz nosaukumu) |
| `Puddle` | `puddle` |

Automašīna nāk no `Lap.carOrdinal`, `Lap.carName` (tikai jaunākos failos), `Class` (vai `Lap.carClass` kā Forza klases indekss), `Lap.performanceIndex`, `Lap.drivetrain` un `Lap.peakKilowatts`; laiks no `Lap.lapSeconds`; brauciens ar `EndedAtFinish: false` ir daļējs. Spēle ir `forza-horizon`.

Šie faili nenes riepu datus un nenes virzienu, tāpēc bloķējumus, riteņu slīdumu un slīdes nevar spriest no tiem vieniem; stūres (pret ceļu) pārspiedumus un triecienus un avārijas joprojām var. Izvēlieties arī `.tele.gz` blakus katram no tiem, lai iegūtu pārējo.

#### FH Companion telemetrija (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip saspiests JSON `{ version, columns, data }`: visi Forza Data Out vienam aplim, viena rinda katram pakešu, ar spēles paša lauku nosaukumiem. Kolonnas meklē pēc nosaukuma, nekad pēc pozīcijas. 2. formāts glabā katru paketi (apmēram 110 sekundē pret spēles 64 taktīm); rinda, kas ir identiska iepriekšējai visā, izņemot ierakstītāja pašu pulksteni (`t`, `metres`), tiek izmesta, tāpēc aplis tiek lasīts ar spēles 64 rindām sekundē. (Ielādes pogas padoms to saka: "katras riepas slīdei ar 64 Hz".)

| Data Out lauks | Kanāls |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (automašīnas rāmis: x pa labi, y augšup, z uz priekšu) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, mērogoti no 0..255 uz 0..1 |
| `Steer` | `steer`, mērogots no -127..127 uz -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, pārvērsts no Fārenheita uz °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` katram riteni |

`<Wheel>` ir `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Slīde ir atzīmēta kā `peak` (Forza normalizētā slīde: virs 1 riepe ir zaudējusi saķeri).

**Pāris.** Apļa fails `<aplis>.json` un `<aplis>.json.tele.gz`, izvēlēti vai nomesti kopā (tas pats ceļš, izņemot `.tele.gz`), kļūst par **vienu** apli: telemetrijas kanāli ar apļa faila automašīnu, klasi, laiku, trasi un daļējo karodziņu. Telemetrijas faila pašas automašīnas nosaukums uzvar, ja tam tāds ir. Viens `.tele.gz` joprojām ielādējas viens pats: 2. formāta faili satur `car` (`ordinal`, `name`, `class`, `pi`), `track` un `lapSeconds`; bez tiem apļa laiks ir paša telemetrijas ilgums, un automašīna nav zināma.

#### iRacing `.ibt` {#iracing-ibt}

iRacing telemetrijas fails tiek lasīts tieši (pārlūkā, bez konvertēšanas): 112 baitu galvene, 32 baitu diska apakšgalvene, mainīgo tabula (144 baiti kanālam) un sesijas YAML.

- **Nepieciešamie kanāli:** `SessionTime`, `Lap`, `Lat`, `Lon`. Bez tiem: "… nav kanālu SessionTime, Lap, Lat un Lon — vai tas ir iRacing telemetrijas fails?"
- **Pozīcijas:** platums un garums tiek izklāti metros uz plaknes, kas pieskaras pirmajai nenulles fiksācijai (Zemes rādiuss 6 371 008,8 m): x uz austrumiem, z uz dienvidiem, y — augstums (`Alt`) — tāpēc ar noklusējuma kameru, kas vērsta uz ziemeļiem, ziemeļi ir augšā ekrānā. Nevis trases pašas rāmis: izvilkts trases modelis nelīdzinātos.
- **Apļi:** sesija tiek sadalīta tur, kur mainās `Lap`; aplis tiek paturēts, ja tam ir vairāk nekā 60 paraugi, tas sākas zem 5% no `LapDistPct` un beidzas virs 95%. Daļējie apļi tiek izmesti. Ja neviens nepaliek: "… nav pilna apļa N km garajā trasē" (trases garums no YAML) vai "… nav pilna apļa".
- **Attālums:** `LapDist` no apļa sākuma, citādi saskaitīts no pozīcijām.
- **Automašīna:** no `DriverInfo`: spēlētāja `CarScreenName`, `CarID` (kā automašīnas numurs) un `CarClassShortName` (kā klase). Trase: `TrackDisplayName`, citādi `TrackName`.

Kartētie kanāli:

| iRacing | Kanāls | Pārvēršana |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | tie paši nosaukumi | - |
| `Clutch` | `clutch` | `1 - v` (iRacing skaita iesaisti; mūsējais ir pedālis) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiāni pretēji pulksteņrādītājam līdz -1..1, pa labi pozitīvi; maksimums vismaz 0,1, π, ja nav) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | tie paši, mazajos burtos | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | dalīts ar 100, kad virs 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | karkasa vidējā temperatūra |
| `LFshockDefl` ... | `suspensionM.FL` ... | amortizatora nobīde, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa uz psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Riteņu priedēkļi: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Katrs cits** kanāls ar vienu vērtību katrā paraugā (ne bitu lauka tipa) tiek nodots ar savu nosaukumu — katram riteni, kad tas sākas ar riteņa priedēkli (`RRspeed` kļūst par `speed.RR`) — tā ka grafiki un kartīšu vērtību saraksti piedāvā visus. iRacing neieraksta riepu slīdi, tāpēc automašīnas vadību spriež pēc dreifa leņķa — `Yaw`, piemērots braukšanas virzienam, pret to, kurp automašīna iet — un stūres pret ceļu. Yaw rate pret sānu paātrinājumu tiek izmantots tikai tad, kad virzienu nevar piemērot, tāpēc nav dreifa leņķa (skatiet [Automašīnas vadības notikumi](race-control-events.md)).

Kļūdas: "… ir par īsu, lai būtu .ibt fails", "… nav iRacing telemetrijas galvenes", "… nav pozīcijas fiksāciju".

#### Apļa CSV {#lap-csv}

Viena rinda katram paraugam; daudzi apļi vienā failā tiek atšķirti pēc `lap` kolonnas. Atdalītājs tiek noteikts no pirmajām piecām rindām. Pēc izvēles pirmā rinda `# { ...json... }` apraksta braucienu: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Kolonna (neatkarīga no reģistra) | Kanāls |
|---|---|
| `x`, `y`, `z` | pozīcija (`x` un `z` ir obligāti) |
| `elapsed` vai `time` | `time` (obligāts katram aplim) |
| `metres` vai `distance` | `distance` (citādi saskaitīts no pozīcijām) |
| `speed_ms` vai `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | tie paši |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| jebkurš kanoniskais kanāla nosaukums, piem., `latVel`, `slipIndex.FL` | pats sevi |
| `lap` | kuram aplim rinda pieder |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | apļa laiks, automašīnas numurs, klase, PI, trase (no katra apļa pirmās rindas) |

Bez apraksta spēle tiek ņemta kā `forza-horizon`, un katrs aplis — kā pilns. Apļa avots tiek rādīts kā `<fails> · <aplis>`, kad failā ir vairāki. Kļūdas: "… nav rindu", "… nav x un z kolonnu", "… nav apļu ar laika kolonnu".

#### Disciplīna un virsma {#discipline-and-surface}

Ko analīze pieņem par apli, kad aplis to nesaka (`lap.ts`):

- **Disciplīna:** `meta.discipline`, citādi spēles nosaukums, kas atbilst `rally|wrc|dirt|rbr`, ir **rallijs**; `trackmania` ir **arkāde**; viss pārējais **trase**.
- **Virsma:** `meta.surface`, citādi no trases nosaukuma un avota: rallijs ar nosaukumu `monte` ir **jaukts**; `snow|ice|winter|arctic|sweden` — **sniegs**; asfalta rallijs (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres vai vārdi tarmac/asphalt) — **asfalts**; jebkurš nosaukums ar `scramble|trail|cross country|dirt|gravel` — **irdens segums**; cits rallija posms tiek spriests pēc tā, kā automašīna tika braukta: pār paraugiem ātrāk par 12 m/s un uz zemes (vismaz 200 no tiem), 95. procentile sānu paātrinājumam 10 m/s² vai vairāk kopā ar mediānu dreifa leņķi zem 6° (ņemts tur, kur automašīna līkumoja ar 70% no tā vai vairāk, vismaz 30 paraugi) ir asfalts; viss cits, vai pārāk maz, lai spriestu, ir irdens segums. Rallija nosaukums ar `rally` nerallija nosaukumā ir irdens segums; viss pārējais — asfalts.
- Katram paraugam kanāls `loose` (Forza virsmas trīce, Trackmania materiāli, skatiet [Automašīnas vadības notikumi](race-control-events.md#the-ground)) pārraksta apļa virsmu.
