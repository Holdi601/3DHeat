---
title: "Încărcarea turelor"
parent: "Analiză de cursă"
nav_order: 51
lang: "ro"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Încărcarea turelor

Un fișier de tură este o înregistrare a unei singure curse: unde era mașina și ce a făcut pilotul, de mai multe ori pe secundă. Dacă încărcați două sau mai multe ture ale aceluiași traseu, fila **Analiză de cursă** le poate compara.

![Secțiunea Tururi din fila Analiză de cursă, cu trei ture demonstrative încărcate: lista de ture, steaua de referință, focalizarea](../assets/img/en/race-loading-laps-list.webp)

## Primele dumneavoastră ture {#your-first-laps}

1. Deschideți fila **Analiză de cursă**.
2. Doar vă uitați? Apăsați **Tururi demonstrative** (vezi [Tururi demonstrative](#demo-laps)).
3. Propriile dumneavoastră ture: înregistrați-le în joc cu un înregistrator (vezi [Formatele de fișiere](#file-formats)). Înregistratorul scrie un fișier pentru fiecare tură.
4. Apăsați **Încărcați fișiere cu tururi…** și alegeți două sau mai multe fișiere ale aceluiași traseu, sau apăsați **Dosar…** și alegeți dosarul care le conține. Puteți și trage fișiere sau dosare peste vizualizarea 3D.
5. Dați clic pe o tură din listă ca să vedeți unde pierde timp.

**Atenție: turele se compară câte un traseu pe rând.** Încărcarea unei ture de alt traseu cu nume șterge turele deja încărcate.

## Butoanele {#the-buttons}

| Control | Ce face |
|---|---|
| **Încărcați fișiere cu tururi…** | un selector de fișiere pentru `.json`, `.csv`, `.txt`, `.ibt`, `.gz` și `.h3dcars`, mai multe odată (`.h3dcars` este un fișier de mașină, vezi [Mașinile](race-replay-and-scene.md#the-cars)) |
| **Dosar…** | un selector de dosare: fiecare fișier de tură din dosar și din subdosarele lui |
| **Tururi demonstrative** | trei ture inventate ale unui circuit inventat (vezi [Tururi demonstrative](#demo-laps)) |
| **Golește** | șterge fiecare tură (apare odată ce există ture încărcate) |
| tragere pe vizualizare | fișierele și dosarele trase peste vizualizarea 3D se încarcă la fel |

Turele se **adaugă** la cele încărcate - **cu excepția cazului în care sunt de alt traseu cu nume: atunci turele încărcate se șterg mai întâi** (turele se compară câte un traseu pe rând). Fișierele care nu pot fi citite sunt listate sub butoane, pe câte o linie; celelalte se încarcă.

## Formatele de fișiere {#file-formats}

Formatul se recunoaște după conținut, nu după numele fișierului. Pe scurt:

- **heat3d-lap** este fișierul pe care îl scrie înregistratorul 3DHeat pentru majoritatea jocurilor.
- **FH Companion** este un instrument gratuit care înregistrează ture din Forza Horizon. Scrie un fișier de tură și, alături de el, un fișier `.json.tele.gz` (aceeași tură, cu datele fiecărei anvelope, comprimate gzip). Alegeți-le pe amândouă împreună.
- **iRacing `.ibt`** este fișierul de telemetrie al iRacing; activați înregistrarea în mașină cu Alt+L și încărcați fișierul așa cum este.
- Un **CSV de tură** este un tabel simplu, cu câte un rând pentru fiecare moment.

| Format | Sursă obișnuită | Citit de |
|---|---|---|
| JSON `heat3d-lap` | `heat3d_capture telemetry --game ...` (Forza Horizon și Motorsport prin Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| `.json` de tură FH Companion | biblioteca de ture a FH Companion | `fromFhCompanion` |
| `.json.tele.gz` de telemetrie FH Companion | alături de fiecare fișier de tură FH Companion | `readForzaTelemetry` |
| `.ibt` iRacing | fișierele de telemetrie ale iRacing (înregistrare activată cu Alt+L în mașină) | `readIbt` |
| CSV de tură | `heat3d_capture laps`, pluginul Trackmania sau orice CSV cu coloanele `x`, `z`, o coloană de timp și, opțional, o coloană `lap` | `fromCsv` |

Modul în care fiecare joc este înregistrat și ce trimite este documentat de înregistratoare:
[GameCapture: games](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
și [GameCapture: the lap format](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Vezi și [Alte jocuri de curse](other-games.md).

## Dosare și trasee {#folders-and-courses}

**Dosar…**, sau un dosar tras, aduce fiecare fișier de sub el. Într-un dosar se iau în considerare doar fișierele care se termină în `.json`, `.csv`, `.txt`, `.ibt` sau `.tele.gz`, iar un `.json` care nu este o tură (fișierul propriu al unui traseu, harta lui) este sărit fără eroare.

**Mai multe trasee într-o singură alegere.** Biblioteca de ture a FH Companion păstrează fiecare traseu într-un dosar numit `<nume traseu> (course_<x>_<z>_to_<x>_<z>)` (sau un simplu `course_...` pentru un traseu fără nume). Când fișierele alese se află în mai multe dosare de traseu de acest fel, nu se încarcă nimic; în schimb, secțiunea **Tururi** spune „Acestea sunt ture din N trasee, iar turele se compară câte un traseu pe rând. Alegeți unul:” și listează fiecare traseu cu numărul lui de ture (fișiere care se termină în `.json`, `.csv` sau `.ibt`, fără `course.json`), cele cu cele mai multe ture primele. Un clic pe unul încarcă fișierele acelui traseu.

Un traseu este identificat după nume și după punctul de **start**, nu după sosire: cursele care nu s-au terminat sunt păstrate de FH Companion sub același nume și același start (în `unfinished/`), cu locul unde s-au oprit ca sosire, și merg împreună cu traseul lor - marcate **parțial** în listă.

**Mai multe piste printre fișierele alese.** Când fișierele alese direct (nu din dosare de trasee) sunt ture ale mai multor piste cu nume, aceeași alegere se oferă pe fiecare pistă; turele care nu au un nume de pistă merg împreună cu pista aleasă.

## Numele mașinilor {#car-names}

O tură se numește după numele întreg al mașinii, așa cum îl dă jocul. Acolo unde fișierul de tură nu numește mașina:

1. **Dosarul.** Biblioteca FH Companion păstrează turele în `<traseu>/<clasă>/<nume mașină> '<yy> (car<număr>)/<reglaj>/<etichetă>/<tură>.json`. Cel mai adânc dosar care se potrivește cu `<nume> (car<număr>)` dă numele și numărul; unul care se potrivește cu `car<număr>` dă doar numărul. Doar alegerile de dosare și dosarele trase au această cale.
2. **Altă tură a aceleiași mașini.** Odată ce o tură numește o mașină, fiecare tură cu același joc și același număr de mașină se numește la fel - turele încărcate împreună și turele încărcate mai târziu în acest browser: numele se păstrează în `localStorage`, sub `heat3d.carNames` (cu cheia `<joc>:<număr mașină>`). Într-o fereastră privată durează cât turele.
3. În rest, „mașina 1234” după numărul ei, sau „mașina”.

**Etichetele.** În lista de ture, o tură arată numele mașinii; mai multe ture ale aceleiași mașini sunt numerotate „Nume #1”, „Nume #2”. Propozițiile analizei folosesc aceleași etichete când sunt unice; altfel numele mașinii cu timpul turei, „Nume (1:29.616)” (timpuri de exemplu), numerotate mai departe dacă tot nu sunt unice.

**Gruparea.** Turele aparțin aceleiași mașini (pentru înveliș, profiluri și comparații) când numărul lor de mașină - sau numele, când nu există număr - și indicele lor de performanță sunt aceiași (`carKey`): același model cu alt reglaj este o mașină diferită.

**Clasele.** Clasa de performanță a unei ture este cea a jocului (Forza D..X, numele scurt al clasei de mașină din iRacing); statisticile le ordonează D, C, B, A, S1, S2, R, X, apoi celelalte alfabetic.

## Tururi demonstrative {#demo-laps}

**Tururi demonstrative** încarcă trei ture ale unui circuit inventat (patru linii drepte și patru curbe la dreapta), făcute de un model simplu de vehicul ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): viteza fiecărei curbe limitată de aderență, o trecere de accelerare înainte și o trecere de frânare înapoi, cum face un simulator de tur.

| Tură | Mașina | Greșeli |
|---|---|---|
| curată | mașina cu aderență | niciuna |
| cu greșeli | mașina cu aderență | frânează cu 35 m mai devreme în T2, pune acceleratorul cu 30 m mai târziu la ieșirea din T3, ia T4 cu 0,88 din viteza ei, conduce cu 1,2 m pe o parte |
| altă mașină | mașina cu putere | niciuna; conduce cu 1,2 m pe cealaltă parte |

| Mașina (număr) | Aderență | Frânare | Tracțiune | Putere/masă | Rezistență aerului |
|---|---|---|---|---|---|
| Mașina cu aderență (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Mașina cu putere (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Tura cu greșeli este focalizată. Circuitul este așezat așa cum își ține Forza lumea (sistem stâng), așa că - exact ca la o tură reală din Forza - iese oglindit, iar fila oferă **Inversează X**. Toate cele trei ture au date pe fiecare roată, așa că fiecare parte a filei are ce să arate.

## Lista de ture {#the-lap-list}

Fiecare rând, de la stânga la dreapta:

| Element | Ce face |
|---|---|
| ● / ○ | arată / ascunde tura (linii, mașină, card, grafice); turele ascunse sunt analizate în continuare |
| linia de culoare | culoarea turei |
| nume și etichete | un clic pentru a **focaliza** tura; cu mouse-ul deasupra, fișierul sursă și mașina (nume · clasă PI · transmisie) |
| ⌖ | urmărește această mașină cu camera (un nou clic oprește) |
| ★ | compară totul cu această tură (o face referință); dezactivat la referință |
| × | șterge tura |

**Etichete:** *referință*; *cea mai bună din X* (sau *cea mai bună din clasa sa*) pe cea mai rapidă tură a unei clase, când există mai multe clase; *parțială* la o cursă care nu a ajuns la sosire.

**A doua linie:** clasa (doar când există mai multe clase), timpul turei (`1:29.616`), diferența față de tura cu care este comparată (cea mai bună din clasa ei sau referința), ca `+0.512` (exemplu), și *începe târziu* când tura începe cu mai mult de 10 m după startul referinței.

Cu mai mult de 8 ture, o linie „N din M desenate” oferă **Arată tot** (desenează fiecare tură: mai lent și un ghem) și **Doar cele analizate** (referința, tura focalizată și cea mai bună din clasa ei; statisticile numără fiecare tură în ambele cazuri).

Sub listă: sugestia de oglindire, când turele spun că desenul este oglindit (vezi [lumile oglindite](race-replay-and-scene.md#mirrored-worlds)), iar cu două sau mai multe ture sugestia „Dați clic pe o tură ca să vedeți unde pierde timp …”, plus, cu mai multe clase, faptul că fiecare tură este comparată cu cea mai rapidă din propria clasă.

### Referința și focalizarea {#reference-and-focus}

- **Referința:** tura la care sunt aliniate toate celelalte și, implicit, cu care sunt comparate. Cea mai rapidă tură **completă**, dacă ★ nu a ales alta (prima tură încărcată, când niciuna nu este completă). Scoaterea turei de referință revine la alegerea automată.
- **Focalizarea:** tura ale cărei constatări, control al mașinii și hărți sunt arătate. Rămâne unde a pus-o utilizatorul; altfel este **cea mai lentă** tură care nu este referința („cel mai mult de învățat”). Focalizarea unei ture o și desface, împreună cu cea mai bună tură din clasa ei. Focalizarea referinței o compară cu oricare altă tură care a fost cea mai rapidă prin fiecare curbă.
- **Clasele:** cu ture din mai multe clase de performanță, fiecare tură este comparată cu cea mai rapidă tură completă din propria clasă (referința, în clasa referinței). Vezi [Statisticile traseului](race-course-statistics.md).

### Culorile {#colours}

Fiecare tură primește propria culoare, după poziția ei în ordinea încărcării, astfel încât o tură își păstrează culoarea când celelalte sunt ascunse. Nuanțele sunt distanțate pe cercul culorilor așa cum distanțează modul de echipă al hărții termice grupurile; pentru fiecare loc, luminozitatea (0,52 până la 0,66 în OKLCH) și crominanța (0,12 până la 0,18) sunt alese să stea cât mai departe de locurile vecine (și ultimul de primul), în vederea normală, protanopă și deuteranopă, fiecare la cel puțin 3:1 față de fundalul întunecat al graficului.

## Pentru dezvoltatori {#for-developers}

Cod: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Cum se citește fiecare format {#how-each-format-is-read}

Fiecare format ajunge într-un singur `LapTrace`: canale cu nume canonice (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...; vezi [tabelul canalelor](race-charts-and-hud.md#the-channel-table)), mașina, timpul turei, dacă este o tură completă, și un bloc `meta`. Pentru fiecare format, `time` și `distance` sunt mutate să înceapă de la 0, iar acolo unde o sursă nu are `speed`, acesta se calculează ca distanța împărțită la timp, din eșantioanele vecine.

#### JSON heat3d-lap {#heat3d-lap-json}

Un obiect JSON cu `"format": "heat3d-lap"`. Câmpurile citite:

| Câmp | Folosire |
|---|---|
| `channels` | un obiect cu tablouri, câte unul pentru fiecare canal, după nume canonic; canalele pe fiecare roată ca `nume.FL`, `nume.FR`, `nume.RL`, `nume.RR`. `time`, `x` și `z` sunt obligatorii |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | mașina: id, nume, indexul clasei Forza (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), indicele de performanță, codul transmisiei (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | timpul turei; ultima valoare `time` când lipsește |
| `lap.complete` | `false` marchează o cursă parțială; orice altceva este completă |
| `game`, `track` | nume; `game` decide disciplina (vezi mai jos) |
| `units.slipRatio` / `units.slipAngle` | cum este scalată alunecarea: o unitate care conține `raw` înseamnă `scaled`, `normalised` înseamnă `peak`, orice altceva `physical` |
| `meta` | `slip`, `surface`, `discipline` date ca atare suprascriu cele de mai sus |

Fără un canal `distance`, distanța se însumează din pozițiile 3D.

#### Fișiere de tură FH Companion {#fh-companion-lap-files}

Un obiect JSON cu un obiect `Lap` care ține un tablou `samples` (un eșantion la aproximativ 5 m). Câmpurile mapate:

| FH Companion | Canal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (mutat ca tura să înceapă de la 0) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | la fel, cu litere mici |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², în pofida numelui) |
| `Puddle` | `puddle` |

Mașina vine din `Lap.carOrdinal`, `Lap.carName` (doar fișiere mai noi), `Class` (sau `Lap.carClass` ca index de clasă Forza), `Lap.performanceIndex`, `Lap.drivetrain` și `Lap.peakKilowatts`; timpul din `Lap.lapSeconds`; o cursă cu `EndedAtFinish: false` este parțială. Jocul este `forza-horizon`.

Aceste fișiere nu au date despre anvelope și nici despre direcție, așa că blocajele, patinarea și derapajele nu se pot judeca doar din ele; împingerile (din volan față de traseu) și loviturile și accidentele se pot. Alegeți și `.tele.gz` de lângă fiecare pentru restul.

#### Telemetria FH Companion (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

JSON comprimat gzip `{ version, columns, data }`: tot Data Out-ul Forza pentru o tură, câte un rând pentru fiecare pachet, cu numele de câmp ale jocului. Coloanele se caută după nume, niciodată după poziție. Formatul 2 păstrează fiecare pachet (aproximativ 110 pe secundă, față de cele 64 de tacturi ale jocului); un rând identic cu cel dinainte în toate, în afară de ceasul propriu al înregistratorului (`t`, `metres`), se elimină, astfel încât o tură se citește la cele 64 de rânduri pe secundă ale jocului. (Sfatul butonului de încărcare spune asta: „pentru patinarea fiecărei anvelope la 64 Hz”.)

| Câmp Data Out | Canal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (în cadrul mașinii: x dreapta, y sus, z înainte) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, scalate de la 0..255 la 0..1 |
| `Steer` | `steer`, scalat de la -127..127 la -1..1 |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, convertit din Fahrenheit în °C |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pe fiecare roată |

`<Wheel>` este `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. Alunecarea este marcată `peak` (alunecarea normalizată a Forzei: dincolo de 1, anvelopa și-a pierdut aderența).

**Asocierea.** Un fișier de tură `<tură>.json` și `<tură>.json.tele.gz` alese sau trase împreună (același cale, dar `.tele.gz`) devin **o singură** tură: canalele din telemetrie, cu mașina, clasa, timpul, traseul și indicatorul de parțial din fișierul de tură. Numele mașinii din fișierul de telemetrie câștigă, când are unul. Un `.tele.gz` singur se încarcă și el: fișierele de format 2 au `car` (`ordinal`, `name`, `class`, `pi`), `track` și `lapSeconds`; fără ele, timpul turei este durata proprie a telemetriei, iar mașina este necunoscută.

#### iRacing `.ibt` {#iracing-ibt}

Fișierul de telemetrie al iRacing se citește direct (în browser, fără conversie): antetul de 112 octeți, subantetul discului de 32 de octeți, tabelul variabilelor (144 de octeți pe canal) și YAML-ul sesiunii.

- **Canale obligatorii:** `SessionTime`, `Lap`, `Lat`, `Lon`. Fără ele: „… nu are canalele SessionTime, Lap, Lat și Lon - este un fișier de telemetrie iRacing?”
- **Poziții:** latitudinea și longitudinea se așază în metri pe un plan tangent la prima poziție nenulă (raza Pământului 6 371 008,8 m): x spre est, z spre sud, y altitudinea (`Alt`) - deci, cu camera implicită orientată spre nord, nordul este sus pe ecran. Nu este cadrul propriu al traseului; un model extras al traseului nu s-ar alinia.
- **Ture:** sesiunea se împarte acolo unde se schimbă `Lap`; o tură se păstrează când are mai mult de 60 de eșantioane, începe sub 5% din `LapDistPct` și se termină peste 95%. Turele parțiale se elimină. Dacă nu rămâne niciuna: „… nu are nicio tură completă a traseului de N km” (lungimea traseului din YAML) sau „… nu are nicio tură completă”.
- **Distanța:** `LapDist` de la startul turei, altfel însumată din poziții.
- **Mașina:** din `DriverInfo`: `CarScreenName` al pilotului, `CarID` (ca număr de mașină) și `CarClassShortName` (ca clasă). Traseul: `TrackDisplayName`, altfel `TrackName`.

Canalele mapate:

| iRacing | Canal | Conversie |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | aceleași nume | - |
| `Clutch` | `clutch` | `1 - v` (iRacing numără cuplarea; la noi este pedala) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (radiani în sens trigonometric invers până la -1..1, dreapta pozitivă; maximul cel puțin 0,1, π când lipsește) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | la fel, cu litere mici | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | împărțit la 100 când depășește 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | temperatura din mijlocul carcasei |
| `LFshockDefl` ... | `suspensionM.FL` ... | deplasarea amortizorului, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa în psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Prefixele roților: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Fiecare alt** canal cu o valoare pe eșantion (nu de tip câmp de biți) trece sub propriul nume - pe fiecare roată când începe cu un prefix de roată (`RRspeed` devine `speed.RR`) - astfel încât graficele și listele de valori ale cardurilor le oferă pe toate. iRacing nu înregistrează alunecarea anvelopelor: controlul mașinii se judecă din unghiul de derapaj - `Yaw`, potrivit cu direcția de deplasare, față de unde merge mașina - și din volan față de traseu. Viteza de rotație față de accelerația laterală se folosește doar când direcția nu poate fi potrivită, deci nu există unghi de derapaj (vezi [Evenimente de control al mașinii](race-control-events.md)).

Erori: „… este prea scurt pentru un fișier .ibt”, „… nu are antetul de telemetrie iRacing”, „… nu are poziții GPS”.

#### CSV de tură {#lap-csv}

Un rând pentru fiecare eșantion; mai multe ture într-un singur fișier se deosebesc după o coloană `lap`. Separatorul se detectează din primele cinci linii. O primă linie opțională `# { ...json... }` descrie cursa: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Coloană (nu contează majusculele) | Canal |
|---|---|
| `x`, `y`, `z` | poziția (`x` și `z` obligatorii) |
| `elapsed` sau `time` | `time` (obligatoriu pentru fiecare tură) |
| `metres` sau `distance` | `distance` (altfel însumată din poziții) |
| `speed_ms` sau `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | la fel |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| orice nume canonic de canal, de exemplu `latVel`, `slipIndex.FL` | el însuși |
| `lap` | ce tură aparține un rând |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | timpul turei, numărul mașinii, clasa, PI, traseul (din primul rând al fiecărei ture) |

Fără o descriere, jocul se ia ca `forza-horizon` și fiecare tură ca fiind completă. Sursa unei ture se arată ca `<fișier> · <tură>` când fișierul are mai multe. Erori: „… nu are rânduri”, „… nu are coloanele x și z”, „… nu are ture cu o coloană de timp”.

#### Disciplina și suprafața {#discipline-and-surface}

Ce presupune analiza despre o tură, când tura nu spune (`lap.ts`):

- **Disciplina:** `meta.discipline`, altfel un nume de joc care se potrivește cu `rally|wrc|dirt|rbr` este **raliu**, `trackmania` este **arcade**, orice altceva **circuit**.
- **Suprafața:** `meta.surface`, altfel din numele traseului și al sursei: un raliu cu numele `monte` este **mixt**; `snow|ice|winter|arctic|sweden` este **zăpadă**; raliurile pe asfalt (Spania/España/Catalunya/Costa Daurada, Croația/Hrvatska, Europa Centrală, Germania/Deutschland, Japonia, Corsica/Corse, Ypres, sau cuvintele tarmac/asphalt) sunt **asfalt**; orice nume cu `scramble|trail|cross country|dirt|gravel` este **neasfaltat**; o altă probă de raliu se judecă după cum a fost condusă mașina: peste eșantioanele mai rapide de 12 m/s și pe sol (cel puțin 200 dintre ele), o percentilă 95 a accelerației laterale de 10 m/s² sau mai mult împreună cu un unghi median de derapaj sub 6° (luat acolo unde mașina a luat o curbă la 70% din acea valoare sau mai mult, cel puțin 30 de eșantioane) este asfalt; orice altceva, sau prea puțin ca să se poată spune, este neasfaltat. Un nume care nu este de raliu, dar conține `rally`, este neasfaltat; tot restul este asfalt.
- Pe eșantion, un canal `loose` (rumble-ul suprafeței Forza, materialele Trackmania, vezi [Evenimente de control al mașinii](race-control-events.md#the-ground)) suprascrie suprafața turei.
