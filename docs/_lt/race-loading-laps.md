---
title: "Ratų įkėlimas"
parent: "Lenktynių analizė"
nav_order: 51
lang: "lt"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Ratų įkėlimas

Ratų failas yra vieno važiavimo įrašas: kur buvo automobilis ir ką veikė vairuotojas, daugybę kartų per sekundę. Įkelkite dviejų ar daugiau to paties kurso ratų, ir **Lenktynių analizė** skirtukas galės juos palyginti.

![**Ratai** skyrius Lenktynių analizė skirtuke su trimis demonstraciniais ratais: ratų sąrašas, etalono žvaigždutė, fokusas](../assets/img/en/race-loading-laps-list.webp)

## Pirmieji ratai {#your-first-laps}

1. Atidarykite **Lenktynių analizė** skirtuką.
2. Tik žiūrite? Spauskite **Demonstraciniai ratai** (žr. [Demonstraciniai ratai](#demo-laps)).
3. Jūsų pačių ratai: įrašykite juos žaidime su įrašymo programa (žr. [Failų formatai](#file-formats)). Įrašymo programa rašo po vieną failą kiekvienam ratui.
4. Spauskite **Įkelti ratų failus…** ir pasirinkite du ar daugiau to paties kurso failų arba spauskite **Aplankas…** ir pasirinkite aplanką, kuriame jie yra. Failus ar aplankus galite numesti ir ant 3D vaizdo.
5. Spragtelėkite ratą sąraše, kad pamatytumėte, kur jis praranda laiko.

**Įspėjimas: ratai lyginami po vieną kursą.** Įkėlus kito pavadinto kurso ratą, anksčiau įkelti ratai pirmiausia išvalomi.

## Mygtukai {#the-buttons}

| Valdiklis | Ką daro |
|---|---|
| **Įkelti ratų failus…** | failų parinkiklis `.json`, `.csv`, `.txt`, `.ibt`, `.gz` ir `.h3dcars` failams, kelis iš karto (`.h3dcars` yra automobilio failas, žr. [Automobiliai](race-replay-and-scene.md#the-cars)) |
| **Aplankas…** | aplanko parinkiklis: kiekvienas ratų failas aplanke ir žemiau jo |
| **Demonstraciniai ratai** | trys išgalvoti ratai išgalvotoje trasoje (žr. [Demonstraciniai ratai](#demo-laps)) |
| **Išvalyti** | pašalina visus ratus (rodoma, kai ratai įkelti) |
| numetimas ant vaizdo | failai ir aplankai, numesti ant 3D vaizdo, įkeliami tuo pačiu būdu |

Ratai **pridedami** prie jau įkeltų – **nebent jie yra kito pavadinto kurso: tada pirmiausia išvalomi jau įkelti ratai** (ratai lyginami po vieną kursą). Failai, kurių nepavyksta perskaityti, išvardijami po mygtukais, po eilutę kiekvienam; kiti vis tiek įkeliami.

## Failų formatai {#file-formats}

Formatas nustatomas pagal turinį, ne pagal failo vardą. Paprastais žodžiais:

- **heat3d-lap** yra failas, kurį 3DHeat įrašymo programa rašo daugumai žaidimų.
- **FH Companion** yra nemokama priemonė, įrašanti Forza Horizon ratus. Ji parašo ratų failą ir šalia jo `.json.tele.gz` failą (tas pats ratas su kiekvienos padangos duomenimis, suspaustas gzip). Pasirinkite abu kartu.
- **iRacing `.ibt`** yra iRacing savas telemetrijos failas; automobilyje įjunkite įrašymą klavišais Alt+L ir įkelkite failą kaip yra.
- **Ratų CSV** yra paprasta lentelė, viena eilutė vienam momentui.

| Formatas | Tipinis šaltinis | Nuskaito |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon ir Motorsport per Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion ratų `.json` | FH Companion ratų biblioteka | `fromFhCompanion` |
| FH Companion telemetrija `.json.tele.gz` | šalia kiekvieno FH Companion ratų failo | `readForzaTelemetry` |
| iRacing `.ibt` | iRacing savi telemetrijos failai (įrašymas įjungiamas automobilyje klavišais Alt+L) | `readIbt` |
| ratų CSV | `heat3d_capture laps`, Trackmania papildinys arba bet koks CSV su `x`, `z`, laiko stulpeliu ir neprivalomu `lap` stulpeliu | `fromCsv` |

Kaip kiekvienas žaidimas įrašomas ir ką jis siunčia, aprašyta įrašymo programų dokumentacijoje: [GameCapture: žaidimai](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) ir [GameCapture: ratų formatas](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md). Taip pat žr. [Kiti lenktynių žaidimai](other-games.md).

## Aplankai ir kursai {#folders-and-courses}

**Aplankas…** arba numestas aplankas atneša visus failus jame ir žemiau. Aplanke svarstomi tik failai, baigiantys `.json`, `.csv`, `.txt`, `.ibt` ar `.tele.gz`, o `.json`, kuris nėra ratas (kurso paties failas, jo žemėlapis), praleidžiamas be klaidos.

**Keli kursai viename pasirinkime.** FH Companion ratų biblioteka kiekvieną kursą laiko aplanke, pavadintame `<course name> (course_<x>_<z>_to_<x>_<z>)` (arba be pavadinimo kursui – tik `course_...`). Kai pasirinkti failai yra daugiau nei viename tokiame kurso aplanke, nieko neįkeliama; vietoj to **Ratai** skyrius sako „Tai N kursų ratai, o ratai lyginami po vieną kursą. Pasirinkite vieną:“ ir išvardija kiekvieną kursą su ratų skaičiumi (skaičiuojami failai, baigiantys `.json`, `.csv` ar `.ibt`; `course.json` neskaičiuojamas), daugiausia ratų pirma. Spragtelėjus vieną, įkeliami to kurso failai.

Kursas pažymimas pagal savo pavadinimą ir **pradžios** tašką, ne pabaigos: važiavimai, kurie nebuvo baigti, FH Companion išsaugo po tuo pačiu pavadinimu ir pradžia (aplanke `unfinished/`), o kaip pabaigą turi tašką, kuriame sustojo; jie eina kartu su savo kursu – sąraše pažymėti **dalinis**.

**Keli takai tarp pasirinktų failų.** Kai failai, pasirinkti tiesiogiai (ne iš kurso aplankų), yra ratai daugiau nei vienos pavadintos trasos, tas pats pasirinkimas siūlomas kiekvienai trasai; ratai, kurie nenurodo trasos, eina su ta trasa, kuri pasirinkta.

## Automobilių pavadinimai {#car-names}

Ratas vadinamas visu savo automobilio pavadinimu, kaip jį pateikia žaidimas. Kai ratų failas automobilio nenurodo:

1. **Aplankas.** FH Companion biblioteka laiko ratus `<course>/<class>/<car name> '<yy> (car<number>)/<tune>/<tag>/<lap>.json`. Vidiniausias aplankas, atitinkantis `<name> (car<number>)`, duoda pavadinimą ir numerį; atitinkantis `car<number>` duoda tik numerį. Tik aplankų pasirinkimai ir numesti aplankai turi šį kelią.
2. **Kitas to paties automobilio ratas.** Kai bet kuris ratas nurodo automobilį, kiekvienas ratas su tuo pačiu žaidimu ir automobilio numeriu vadinamas taip – ratai, įkelti kartu, ir vėliau šioje naršyklėje įkelti ratai: pavadinimai išsaugomi `localStorage` po raktu `heat3d.carNames` (raktas `<game>:<car number>`). Privačiame lange jie galioja tiek, kiek ir ratai.
3. Kitaip „car 1234“ pagal numerį arba „car“.

**Žymos.** Ratų sąraše ratas rodo savo automobilio pavadinimą; keli to paties automobilio ratai sunumeruojami „Pavadinimas #1“, „Pavadinimas #2“. Analizės sakiniai naudoja tas pačias žymas, kai jos unikalios; kitaip – automobilio pavadinimas su rato laiku, „Pavadinimas (1:29.616)“ (pavyzdiniai laikai), toliau numeruojama, jei vis dar nėra unikalu.

**Grupavimas.** Ratai priklauso tam pačiam automobiliui (vokams, profiliams ir palyginimams), kai jų automobilio numeris – arba pavadinimas, jei numerio nėra – ir jų našumo indeksas yra vienodi (`carKey`): tas pats modelis su kitu paruošimu yra kitas automobilis.

**Klasės.** Rato našumo klasė yra žaidimo (Forza D..X, iRacing automobilio klasės trumpasis pavadinimas); statistikoje jos rikiuojamos D, C, B, A, S1, S2, R, X, o po jų kitos pagal abėcėlę.

## Demonstraciniai ratai {#demo-laps}

**Demonstraciniai ratai** įkelia tris išgalvotos trasos ratus (keturios tiesiosios ir keturi dešiniojo lenkimo posūkiai), sukurtus paprastu transporto priemonės modeliu ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): kiekvieno posūkio greitis, ribojamas sukibimo, pagreičio praėjimas į priekį ir stabdymo praėjimas atgal, kaip daro ratų simuliatorius.

| Ratas | Automobilis | Klaidos |
|---|---|---|
| švarus | Sukibimo automobilis | nėra |
| su klaidomis | Sukibimo automobilis | stabdo 35 m anksčiau į T2, dujas įjungia 30 m vėliau išvažiavęs iš T3, T4 įveikia 0,88 savo greičio, nuvažiuoja 1,2 m į vieną pusę |
| kitas automobilis | Galios automobilis | nėra; nuvažiuoja 1,2 m į kitą pusę |

| Automobilis (numeris) | Sukibimas | Stabdymas | Trauka | Galia/masė | Pasipriešinimas |
|---|---|---|---|---|---|
| Sukibimo automobilis (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Galios automobilis (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Ratas su klaidomis yra fokusuotas. Trasa išdėstyta taip, kaip Forza laiko savo pasaulį (kairiarankė), todėl – tiksliai kaip su tikru Forza ratu – ji atrodo veidrodiškai, o skirtukas siūlo **Apversti X**. Visi trys ratai turi kiekvieno rato duomenis, todėl kiekviena skirtuko dalis turi ką parodyti.

## Ratų sąrašas {#the-lap-list}

Kiekviena eilutė, iš kairės į dešinę:

| Elementas | Ką daro |
|---|---|
| ● / ○ | rodo ar slepia ratą (linijas, automobilį, kortelę, grafikus); paslėpti ratai vis tiek analizuojami |
| spalvos brūkšnys | rato spalva |
| pavadinimas ir žymenos | spragtelėkite, kad **fokusuotumėte** ratą; užveskite pelę, kad pamatytumėte jo šaltinio failą ir automobilį (pavadinimas · klasė PI · pavaros tipas) |
| ⌖ | sekti šį automobilį kamera (dar kartą spragtelėkite, kad sustabdytumėte) |
| ★ | palyginti viską su šiuo ratu (padaryti etalonu); išjungtas etalone |
| × | pašalinti ratą |

**Žymenos:** *etalonas*; *geriausias X* (arba *geriausias savo klasėje*) greičiausiam klasės ratui, kai yra kelios klasės; *dalinis* važiavimui, kuris nepasiekė finišo.

**Antroji eilutė:** klasė (tik kai yra kelios klasės), rato laikas (`1:29.616`), tarpas iki rato, su kuriuo lyginama (geriausias jo klasėje arba etalonas), kaip `+0.512` (pavyzdys), ir *startuoja vėlai*, kai ratas prasideda daugiau nei 10 m po etalono starto.

Kai ratų daugiau nei 8, eilutė „N iš M nupiešta“ siūlo **Rodyti visas** (nupiešti kiekvieną ratą: lėčiau ir susipainiotų) ir **Tik nagrinėjami** (etalonas, fokusuotas ratas ir geriausias jo klasėje; statistikoje vis tiek skaičiuojami visi ratai).

Po sąrašu: veidrodžio užuomina, kai ratai sako, kad piešinys veidrodinis (žr. [veidrodiniai pasauliai](race-replay-and-scene.md#mirrored-worlds)); su dviem ar daugiau ratų – užuomina „Spragtelėkite ratą, kad pamatytumėte, kur jis praranda laiko …“; o su keliomis klasėmis – kad kiekvienas ratas lyginamas su greičiausiu savo klasės ratu.

### Etalonas ir fokusas {#reference-and-focus}

- **Etalonas:** ratas, prie kurio sulygiuojami visi kiti ir, pagal numatymą, su kuriuo lyginama. Greičiausias **baigtas** ratas, nebent ★ pasirinktas kitas (kai nėra baigto rato – pirmas įkeltas). Pašalinus etalono ratą, grįžtama prie automatinio pasirinkimo.
- **Fokusas:** ratas, kurio radiniai, automobilio valdymas ir žemėlapiai rodomi. Jis lieka ten, kur vartotojas jį padėjo; kitaip tai **lėčiausias** ratas, kuris nėra etalonas („daugiausia ko pasimokyti“). Fokusavimas taip pat atskleidžia ratą ir geriausią jo klasės ratą. Fokusavus etaloną, jis lyginamas su tuo kitu ratu, kuris buvo greičiausias per kiekvieną posūkį.
- **Klasės:** su keliomis našumo klasėmis kiekvienas ratas lyginamas su greičiausiu baigtu savo klasės ratu (etalonas – etalono klasėje). Žr. [Kurso statistika](race-course-statistics.md).

### Spalvos {#colours}

Kiekvienas ratas gauna savo spalvą pagal padėtį įkėlimo eilėje, todėl ratas išlaiko spalvą, kai kiti paslėpti. Atspalviai išdėstyti spalvų ratu taip, kaip šilumos žemėlapio komandos režimas išdėsto grupes; kiekvienam lizdui šviesumas (0,52–0,66 OKLCH) ir sodrumas (0,12–0,18) parenkami taip, kad būtų kuo toliau nuo kaimyninių lizdų (o paskutinis – nuo pirmo) įprastu, protanopijos ir deuteranopijos regėjimu, kiekvienas bent 3:1 kontrastu su tamsiu grafiko fonu.

## Kūrėjams {#for-developers}

Kodas: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Kaip skaitomas kiekvienas formatas {#how-each-format-is-read}

Kiekvienas formatas galiausiai tampa vienu `LapTrace`: kanalai kanoniniais pavadinimais (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., žr. [kanalų lentelę](race-charts-and-hud.md#the-channel-table)), automobilis, rato laikas, ar tai baigtas ratas, ir `meta` blokas. Kiekvienam formatui `time` ir `distance` perstumiami, kad prasidėtų nuo 0, o kur šaltinyje nėra `speed`, jis apskaičiuojamas kaip atstumas per laiką pagal gretimus mėginius.

#### heat3d-lap JSON {#heat3d-lap-json}

JSON objektas su `"format": "heat3d-lap"`. Nuskaitomi laukai:

| Laukas | Naudojimas |
|---|---|
| `channels` | objektas iš masyvų, po vieną kiekvienam kanalui pagal kanoninį pavadinimą; kiekvieno rato kanalai kaip `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` ir `z` privalomi |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | automobilis: id, pavadinimas, Forza klasės indeksas (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), našumo indeksas, pavaros kodas (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | rato laikas; kai nėra – paskutinė `time` reikšmė |
| `lap.complete` | `false` pažymi dalinį važiavimą; bet kas kita reiškia baigtą |
| `game`, `track` | pavadinimai; `game` nusprendžia disciplina (žemiau) |
| `units.slipRatio` / `units.slipAngle` | kaip skaliuojamas slydimas: vienetas su `raw` reiškia `scaled`, `normalised` – `peak`, bet kas kita – `physical` |
| `meta` | `slip`, `surface`, `discipline`, kaip nurodyta, pakeičia aukščiau pateiktus |

Be `distance` kanalo atstumas sumuojamas iš 3D padėčių.

#### FH Companion ratų failai {#fh-companion-lap-files}

JSON objektas su `Lap` objektu, kuriame yra `samples` masyvas (maždaug vienas mėginys kas 5 m). Susieti laukai:

| FH Companion | Kanalas |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (perstumiama, kad ratas prasidėtų nuo 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | tie patys, mažosiomis raidėmis |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², nepaisant pavadinimo) |
| `Puddle` | `puddle` |

Automobilis imamas iš `Lap.carOrdinal`, `Lap.carName` (tik naujesniuose failuose), `Class` (arba `Lap.carClass` kaip Forza klasės indeksas), `Lap.performanceIndex`, `Lap.drivetrain` ir `Lap.peakKilowatts`; laikas – iš `Lap.lapSeconds`; važiavimas su `EndedAtFinish: false` yra dalinis. Žaidimas yra `forza-horizon`.

Šiuose failuose nėra padangų duomenų ir nėra krypties, todėl vien pagal juos negalima spręsti apie blokavimą, sukimąsi ratu ir slydimus; stūmimai (pagal vairą palyginus su keliu) ir smūgiai bei avarijos vis dar nustatomi. Pasirinkite šalia kiekvieno ir `.tele.gz` failą, kad gautumėte likusius.

#### FH Companion telemetrija (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip suspaustas JSON `{ version, columns, data }`: visas Forza Data Out vienam ratui, viena eilutė vienam paketui, paties žaidimo laukų pavadinimai. Stulpeliai ieškomi pagal pavadinimą, niekada pagal padėtį. 2 formatas išsaugo visus paketus (apie 110 per sekundę, palyginti su žaidimo 64 taktais); eilutė, identiška ankstesnei visame, išskyrus įrašymo programos paties laikrodį (`t`, `metres`), išmetama, todėl ratas nuskaitomas žaidimo 64 eilutėmis per sekundę. (Įkėlimo mygtuko patarimas tai sako: „kiekvienos padangos slydimas 64 Hz dažniu“.)

| Data Out laukas | Kanalas |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (automobilio rėmas: x dešinėn, y aukštyn, z į priekį) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, skaliuoti nuo 0..255 iki 0..1 |
| `Steer` | `steer`, skaliuoti nuo -127..127 iki -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, paversta iš Farenheito į °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` kiekvienam ratui |

`<Wheel>` yra `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Slydimas pažymimas `peak` (Forza normalizuotas slydimas: viršijus 1, padanga praranda sukibimą).

**Porinimas.** Rato failas `<lap>.json` ir `<lap>.json.tele.gz`, pasirinkti ar numesti kartu (tas pats kelias, tik su `.tele.gz`), tampa **vienu** ratu: telemetrijos kanalai su ratų failo automobiliu, klase, laiku, trasa ir dalinio važiavimo žyma. Telemetrijos failo paties automobilio pavadinimas laimi, jei jis yra. Vien `.tele.gz` vis tiek įkeliamas: 2 formato failuose yra `car` (`ordinal`, `name`, `class`, `pi`), `track` ir `lapSeconds`; be jų rato laikas yra paties telemetrijos trukmė, o automobilis nežinomas.

#### iRacing `.ibt` {#iracing-ibt}

iRacing telemetrijos failas skaitomas tiesiogiai (naršyklėje, be konvertavimo): 112 baitų antraštė, 32 baitų disko poantraštė, kintamųjų lentelė (144 baitai kanalui) ir sesijos YAML.

- **Privalomi kanalai:** `SessionTime`, `Lap`, `Lat`, `Lon`. Jų nesant: „… neturi SessionTime, Lap, Lat ir Lon kanalų – ar tai iRacing telemetrijos failas?“
- **Padėtys:** platuma ir ilguma išdėstomos metrais plokštumoje, liečiančioje pirmą ne nulinę fiksaciją (Žemės spindulys 6 371 008,8 m): x – rytai, z – pietūs, y – aukštis (`Alt`) – todėl su numatytąja kamera šiaurė yra ekrano viršuje. Tai ne trasos paties rėmas: išgautas kurso modelis nesutaptų.
- **Ratai:** sesija skaidoma ten, kur keičiasi `Lap`; ratas išsaugomas, kai jame daugiau nei 60 mėginių, pradeda žemiau 5 % `LapDistPct` ir baigiasi virš 95 %. Dalinius ratus išmetama. Jei nieko nelieka: „… neturi baigto rato N km trasos“ (trasos ilgis iš YAML) arba „… neturi baigto rato“.
- **Atstumas:** `LapDist` nuo rato starto, arba sumuojamas iš padėčių.
- **Automobilis:** iš `DriverInfo`: žaidėjo `CarScreenName`, `CarID` (kaip automobilio numeris) ir `CarClassShortName` (kaip klasė). Trasa: `TrackDisplayName`, kitaip `TrackName`.

Susieti kanalai:

| iRacing | Kanalas | Konvertavimas |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | tie patys pavadinimai | - |
| `Clutch` | `clutch` | `1 - v` (iRacing skaičiuoja įjungimą; mūsų – pedalas) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radianai prieš laikrodžio rodyklę į -1..1, dešinė teigiama; didžiausias bent 0,1, π, kai nėra) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | tie patys, mažosiomis raidėmis | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | dalinama iš 100, kai daugiau nei 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | karkaso vidurio temperatūra |
| `LFshockDefl` ... | `suspensionM.FL` ... | amortizatoriaus nusileidimas, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa į psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Ratų priešdėliai: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Kiekvienas kitas** kanalas su viena reikšme mėginyje (ne bitų lauko tipo) perduodamas pagal savo vardą – kiekvienam ratui, kai prasideda ratų priešdėliu (`RRspeed` tampa `speed.RR`) – todėl grafikai ir kortelių reikšmių sąrašai siūlo visus. iRacing nerašo padangų slydimo: automobilio valdymas vertinamas pagal dreifo kampą – `Yaw`, pritaikytą judėjimo krypčiai, palyginus su tuo, kur važiuoja automobilis – ir vairą palyginus su keliu. Yaw rate palyginimas su šone esančiu pagreičiu naudojamas tik tada, kai krypties pritaikyti neįmanoma, todėl dreifo kampo nėra (žr. [Automobilio valdymo įvykiai](race-control-events.md)).

Klaidos: „… per trumpas, kad būtų .ibt failas“, „… neturi iRacing telemetrijos antraštės“, „… neturi padėties fiksacijų“.

#### Ratų CSV {#lap-csv}

Viena eilutė vienam mėginiui; daug ratų viename faile atskiriami pagal `lap` stulpelį. Skyriklis aptinkamas pagal pirmas penkias eilutes. Neprivaloma pirma eilutė `# { ...json... }` aprašo važiavimą: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Stulpelis (nepriklausomai nuo raidžių dydžio) | Kanalas |
|---|---|
| `x`, `y`, `z` | padėtis (`x` ir `z` privalomi) |
| `elapsed` arba `time` | `time` (privalomas kiekvienam ratui) |
| `metres` arba `distance` | `distance` (kitaip sumuojamas iš padėčių) |
| `speed_ms` arba `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | tie patys |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| bet koks kanoninis kanalo pavadinimas, pvz., `latVel`, `slipIndex.FL` | pats savaime |
| `lap` | kuriam ratui priklauso eilutė |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | rato laikas, automobilio numeris, klasė, PI, trasa (iš kiekvieno rato pirmos eilutės) |

Be aprašo žaidimas laikomas `forza-horizon`, o kiekvienas ratas – baigtas. Rato šaltinis rodomas kaip `<file> · <lap>`, kai failas turi kelis. Klaidos: „… neturi eilučių“, „… neturi x ir z stulpelių“, „… neturi ratų su laiko stulpeliu“.

#### Disciplina ir danga {#discipline-and-surface}

Ką analizė daro prielaidą apie ratą, kai pats ratas nieko nesako (`lap.ts`):

- **Disciplina:** `meta.discipline`, kitaip žaidimo pavadinimas, atitinkantis `rally|wrc|dirt|rbr`, yra **ralis**; `trackmania` yra **arkada**; visa kita – **trasa**.
- **Danga:** `meta.surface`, kitaip pagal trasos pavadinimą ir šaltinį: ralis, pavadintas `monte`, yra **mišri danga**; `snow|ice|winter|arctic|sweden` – **sniegas**; asfalto ralio etapai (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, arba žodžiai tarmac/asphalt) – **asfaltas**; bet koks pavadinimas su `scramble|trail|cross country|dirt|gravel` – **biri danga**; kitas ralio etapas vertinamas pagal tai, kaip vairuotas automobilis: per mėginius, greitesnius nei 12 m/s ir ant žemės (bent 200 jų), 95-asis šoninio pagreičio procentilis 10 m/s² ar daugiau kartu su vidutiniu dreifo kampu mažesniu nei 6° (imama ten, kur automobilis posūkyje važiavo 70 % ar daugiau to greičio, bent 30 mėginių) yra **asfaltas**; visa kita arba per mažai, kad būtų galima nustatyti, yra **biri danga**. Ne ralio pavadinimas su `rally` yra biri danga; viskas kita – asfaltas.
- Kiekvienam mėginiui kanalas `loose` (Forza paviršiaus dribsnis, Trackmania medžiagos, žr. [Automobilio valdymo įvykiai](race-control-events.md#the-ground)) perrašo rato dangą.
