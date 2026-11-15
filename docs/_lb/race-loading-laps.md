---
title: "Ronnen lueden"
parent: "Course-Analys"
nav_order: 51
lang: "lb"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Ronnen lueden

Eng Ronnefichier ass eng Opnam vun enger Fuert: wou d'Auto war an wat de Fuerer gemaach huet, vill Mol pro Sekonn. Lued zwou oder méi Ronnen vum selwechte Parcours, an de Tab **Course-Analys** kann se vergläichen.

![Den Ofschnëtt Ronnen am Tab Course-Analys mat dräi Demo-Ronnen gelueden: Lëscht vun de Ronnen, Referenzstär, Fokus](../assets/img/en/race-loading-laps-list.webp)

## Är éischt Ronnen {#your-first-laps}

1. Maach den Tab **Course-Analys** op.
2. Kucke just? Dréck **Demo-Ronnen** (kuckt [Demo-Ronnen](#demo-laps)).
3. Är eegen Ronnen: nëmm se am Spill mat engem Recorder op (kuckt [Fichiersformater](#file-formats)). De Recorder schreift ee Fichier pro Ronn.
4. Dréck **Ronnefichiere lueden…** an wiel zwee oder méi Fichieren vum selwechte Parcours aus, oder dréck **Dossier…** an wiel den Dossier, deen se enthält. Dir kënnt och Fichieren oder Dossieren op d'3D-Usiicht falen loossen.
5. Klickt op eng Ronn an der Lëscht, fir ze gesinn, wou se Zäit verléiert.

**Opgepasst: Ronnen ginn ëmmer nëmmen fir ee Parcours verglach.** Wann Der eng Ronn vun engem anere benannte Parcours lued, gi déi schonn gelueden Ronnen als Éischt geläscht.

## D'Knäppercher {#the-buttons}

| Steierung | Mécht |
|---|---|
| **Ronnefichiere lueden…** | eng Fichierauswiel fir `.json`-, `.csv`-, `.txt`-, `.ibt`-, `.gz`- an `.h3dcars`-Fichieren, méi wéi ee op eemol (`.h3dcars` ass e Autosfichier, kuckt [Autoen](race-replay-and-scene.md#the-cars)) |
| **Dossier…** | eng Dossierauswiel: all Ronnefichieren am Dossier an drënner |
| **Demo-Ronnen** | dräi erfonnen Ronnen op engem erfonnenen Circuit (kuckt [Demo-Ronnen](#demo-laps)) |
| **Läschen** | läscht all Ronnen (gewisen, wann Ronnen gelueden sinn) |
| Falen op d'Usiicht | Fichieren a ganz Dossieren, déi op d'3D-Usiicht gefall sinn, ginn op déiselwecht Manéier gelueden |

Ronnen ginn **derbäi gesat** zu deenen, déi schonn gelueden sinn - **ausser se sinn vun engem anere benannten Parcours: dann ginn déi gelueden Ronnen als Éischt geläscht** (Ronnen ginn ëmmer nëmmen ee Parcours zur Kéier verglach). Fichieren, déi sech net liesen loossen, stinn ënner den Knäppercher, eng Zeil pro Fichier; déi aner ginn trotzdeem gelueden.

## Fichiersformater {#file-formats}

De Format gëtt un den Donnéeën erkannt, net um Numm vum Fichier. Mat einfache Wieder:

- **heat3d-lap** ass d'Fichier, dat den 3DHeat-Recorder fir déi meescht Spiller schreift.
- **FH Companion** ass en gratis Tool, dat Forza-Horizon-Ronnen opnemmt. Et schreift en Ronnefichier an dorniewent eng `.json.tele.gz`-Fichier (déiselwecht Ronn mat de Donnéeën vun all Rad, gzip-komprimiert). Wielt béid zesummen aus.
- **iRacing `.ibt`** ass dat eegent Telemetriefichier vun iRacing; schalt d'Opnam am Auto mat Alt+L an, a lued d'Fichier wéi et ass.
- **Ronn-CSV** ass eng einfach Tabell, eng Zeil pro Moment.

| Format | Typesch Quell | Gelies vun |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon an Motorsport iwwer Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion Ronn `.json` | d'Ronnebibliothéik vum FH Companion | `fromFhCompanion` |
| FH Companion Telemetrie `.json.tele.gz` | nieft all FH-Companion-Ronnefichier | `readForzaTelemetry` |
| iRacing `.ibt` | d'eegen Telemetriefichieren vun iRacing (Opnam mat Alt+L am Auto) | `readIbt` |
| Ronn-CSV | `heat3d_capture laps`, d'Trackmania-Erweiderung, oder all CSV mat `x`, `z`, enger Zäitspalt an optionell enger `lap`-Spalt | `fromCsv` |

Wéi all Spill opgeholl gëtt an wat et schécken, dat dokumentéieren d'Recorder selwer:
[GameCapture: Spiller](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md)
an [GameCapture: den Ronnenformat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md).
Kuckt och [Aner Rennspiller](other-games.md).

## Dossieren a Parcoursen {#folders-and-courses}

**Dossier…**, oder e falen gelooss Dossier, bréngt all Fichieren drënner mat. An engem Dossier ginn nëmmen Fichieren betruecht, déi op `.json`, `.csv`, `.txt`, `.ibt` oder `.tele.gz` endegen, a eng `.json`, déi keng Ronn ass (dem Parcours seng eegen Fichier, seng Kaart), gëtt iwwersprongen ouni Feeler.

**Méi Parcoursen an enger Auswiel.** D'Ronnebibliothéik vum FH Companion hält all Parcours an engem Dossier mat dem Numm `<Parcoursnumm> (course_<x>_<z>_to_<x>_<z>)` (oder nëmmen `course_...` bei engem Parcours ouni Numm). Wann d'Fichieren, déi Der gewielt hutt, a méi wéi engem sonche Parcoursdossier leien, gëtt näischt gelueden; amplaz seet de Ofschnëtt **Ronnen** "Dat sinn Ronnen vu N Parcoursen, an Ronnen ginn nëmmen ee Parcours zur Kéier verglach. Wielt ee:" a listt all Parcours mat hirer Zuel vun Ronnen (Fichieren, déi op `.json`, `.csv` oder `.ibt` endegen, `course.json` net gezielt), déi mat de meeschte Ronnen ëmmer éischt. Wann Der op een klickt, gëtt d'Fichiere vun deem Parcours gelueden.

E Parcours gëtt mat sengem Numm an sengem **Start**punkt identifizéiert, net mat sengem Enn. Fuerten, déi ni fäerdeg waren, behält de FH Companion ënner dem selwechten Numm an mam selwechte Start (am Dossier `unfinished/`), mat dem Punkt, wou se opgehalen hunn, als Enn; si gehéieren zu hirem Parcours - an der Lëscht als **deelweis** markéiert.

**Méi Strecken ënner den gewielte Fichieren.** Wann direkt gewielt Fichieren (net aus Parcoursdossieren) Ronnen vu méi wéi enger benannter Streck sinn, gëtt déi selwecht Auswiel pro Streck ugebueden; Ronnen ouni Streckennumm ginn mat där Streck mat, déi gewielt gëtt.

## Autonimm {#car-names}

Eng Ronn gëtt no dem ganze Numm vum Auto genannt, wéi d'Spill en gëtt. Wann d'Ronnefichier de Auto net nennt:

1. **De Dossier.** D'Bibliothéik vum FH Companion hält Ronnen an `<Parcours>/<Klass>/<Autosnumm> '<yy> (car<Nummer>)/<Tuning>/<Etikett>/<Ronn>.json`. De bannesten Dossier, deen `<Numm> (car<Nummer>)` passt, gëtt de Numm an d'Nummer; een, deen `car<Nummer>` passt, nëmmen d'Nummer. Nëmmen Dossierauswiele an falen gelooss Dossieren droen dësen Wee.
2. **Eng anER Ronn vum selwechte Auto.** Sobal eng Ronn en Auto nennt, kritt all Ronn mat dem selwechten Spill an der selwechter Autosnummer dee Numm - déi zesumme gelueden Ronnen, an déi Ronnen, déi méi spéit an dësem Browser gelueden ginn: d'Nimm bleiwen an `localStorage` ënner `heat3d.carNames` (mat dem Schlëssel `<Spill>:<Autosnummer>`). Am privaten Fënster halen se sou laang wéi d'Ronnen.
3. Soss "car 1234" no der Nummer, oder "car".

**Beschrëftungen.** An der Ronnelëscht weist eng Ronn hire Autosnumm; méi Ronnen vum selwechten Auto kréien d'Nummeréierung "Numm #1", "Numm #2". D'Sätz vun der Analys benotze déiselwecht Beschrëftungen, wann se eendeiteg sinn; soss de Autosnumm mat der Rondenzäit, "Numm (1:29.616)" (Beispillzäiten), a weider nummeréiert, wann et nach ëmmer net eendeiteg ass.

**Gruppéiere.** Ronnen gehéieren zum selwechte Auto (fir Hüllen, Profiler a Verglächer), wann hir Autosnummer - oder de Numm, wann et keng Nummer gëtt - an hire Leeschtungsindex d'selwecht sinn (`carKey`): dat selwecht Modell mat engem anere Tuning ass e anert Auto.

**Klassen.** D'Leeschtungsklass vun enger Ronn ass déi vum Spill (Forza D..X, dee kuerze Klassennumm vum iRacing); d'Statistiken sortéieren se D, C, B, A, S1, S2, R, X, an da d'Aner alphabetesch.

## Demo-Ronnen {#demo-laps}

**Demo-Ronnen** lued dräi Ronnen op engem erfonnenen Circuit (véier Geroudstécker a véier Rietskiermen), gemaach mat engem einfache Gefierermodell ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): d'Geschwindegkeet, déi d'Griff bei all Kurv erlaabt, e Beschleunegungsdurchgang no vir an e Bremsdurchgang no hannen, wéi e Rennsimulator et mécht.

| Ronn | Auto | Feeler |
|---|---|---|
| propper | Grip-Auto | keng |
| mat Feeler | Grip-Auto | bremst 35 m fréi an T2, gitt 30 m spéit aus T3 op de Gas, fiert T4 mat 0,88 vu senger Geschwindegkeet, fiert 1,2 m op eng Säit |
| anert Auto | Power-Auto | keng; fiert 1,2 m op déi aner Säit |

| Auto (Nummer) | Grip | Bremsen | Traktioun | Leeschtung/Mass | Loftwiderstand |
|---|---|---|---|---|---|
| Grip-Auto (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Power-Auto (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

D'Ronn mat de Feeler ass fokusséiert. De Circuit ass esou opgebaut wéi Forza seng Welt hält (lénks-hänneg), dofir - ganz wéi bei enger richteger Forza-Ronn - kënnt se gespigelt eraus, an de Tab bitt **X ëmdréinen** un. All dräi Ronnen hunn Donnéeën pro Rad, sou datt all Deel vum Tab eppes ze weisen huet.

## D'Ronnelëscht {#the-lap-list}

All Zeil, vun links no riets:

| Element | Mécht |
|---|---|
| ● / ○ | weist / verstoppt d'Ronn (Linnen, Auto, Kaart, Diagrammer); verstoppt Ronnen ginn awer trotzdem analyséiert |
| Faarwestréch | d'Faarf vun der Ronn |
| Numm an Etiketten | klickt fir d'Ronn ze **fokusséieren**; wann Der driwwerfiert, seht Der hir Quellfichier an de Auto (Numm · Klass PI · Antrieb) |
| ⌖ | dëse Auto mat der Kamera verfollegen (nach eng Kéier klicken, fir ze stoppen) |
| ★ | alles mat dëser Ronn vergläichen (als Referenz setzen); op der Referenz net aktiv |
| × | d'Ronn ewechhuelen |

**Etiketten:** *Referenz*; *Bescht vun X* (oder *Bescht vun hirer Klass*) bei der schnellster Ronn vun enger Klass, wann et méi Klassen gëtt; *deelweis* bei enger Fuert, déi d'Ziel net erreecht huet.

**Déi zweet Zeil:** d'Klass (nëmmen bei méi Klassen), d'Rondenzäit (`1:29.616`), den Ofstand zur Ronn, mat där se verglach gëtt (déi bescht vun hirer Klass oder d'Referenz), als `+0.512` (Beispill), an *fänkt spéit un*, wann d'Ronn méi wéi 10 m no dem Start vun der Referenz ufänkt.

Bei méi wéi 8 Ronnen steet eng Zeil "N vu M gezeechent" mat **All weisen** (all Ronn zeechnen: méi lues, an e Gewirr) an **Nëmmen déi gekuckten** (d'Referenz, déi fokusséiert Ronn an déi bescht vun hirer Klass; d'Statistiken zielen all Ronnen sou oder sou).

Ënner der Lëscht: den Hiweis mat der Spigelung, wann d'Ronnen soen, datt d'Zeechnung gespillt ass (kuckt [gespigelte Welten](race-replay-and-scene.md#mirrored-worlds)), a bei zwou oder méi Ronnen den Hiweis "Klickt op eng Ronn, fir ze gesinn, wou se Zäit verléiert …", a bei méi Klassen, dass all Ronn mat der schnellster vun hirer eegener Klass verglach gëtt.

### Referenz an Fokus {#reference-and-focus}

- **Referenz:** d'Ronn, op déi all aner ausgeriicht ginn an, standardméisseg, verglach. D'schnellst **komplett** Ronn, ausser ★ huet eng anER gewielt (déi éischt geluede Ronn, wann keng komplett ass). Wann d'Referenzronn ewechgeholl gëtt, geet et zréck op d'automatesch Wiel.
- **Fokus:** d'Ronn, deenen hir Resultater, d'Autosstüerung an d'Kaarten gewisen ginn. Si bleift, wou de Benotzer se higesat huet; soss ass et d'**langsamst** Ronn, déi net d'Referenz ass ("am meeschten ze léiere"). Eng Ronn fokusséieren mécht se och sichtbar, an déi bescht Ronn vun hirer Klass. D'Referenz fokusséieren vergläicht se mat där anerer Ronn, déi bei all Kurv am schnellsten war.
- **Klassen:** wann Ronnen aus méi Leeschtungsklassen do sinn, gëtt all Ronn mat der schnellster komplett Ronn vun hirer eegener Klass verglach (d'Referenz, an der Klass vun der Referenz). Kuckt [Parcoursstatistiken](race-course-statistics.md).

### Faarwen {#colours}

All Ronn kritt hir eege Faarf, no hirer Plaz an der Ladereihenfolleg, sou datt eng Ronn hir Faarf behält, wann déi aner verstoppt sinn. D'Faarfdéin sinn um Faarfrad verdeelt, wéi de Team-Modus vun der Hitz d'Gruppen verdeelt; fir all Plaz gi Hellegkeet (0,52 bis 0,66 an OKLCH) an Faarfstäerkt (0,12 bis 0,18) so gewielt, datt se am weitsten vun den Noperplazen stinn (an déi lescht vun der éischter) bei normalem, protanem an deuteranem Gesiicht, all mat mindestens 3:1 géint déi donkel Diagrammfläch.

## Fir Entwéckler {#for-developers}

Code: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Wéi all Formater gelies gëtt {#how-each-format-is-read}

All Formater ginn zu engem `LapTrace`: Kanäl ënner kanonesche Nimm (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ...; kuckt [d'Kanaltabell](race-charts-and-hud.md#the-channel-table)), dem Auto, der Rondenzäit, ob et eng komplett Ronn ass, an engem `meta`-Block. Bei all Format gi `time` an `distance` esou verréckelt, datt se bei 0 ufänken; wann eng Quell kee `speed` huet, gëtt et aus Distanz iwwer Zäit aus den Nopesamples ausgerechent.

#### heat3d-lap JSON {#heat3d-lap-json}

En JSON-Objet mat `"format": "heat3d-lap"`. Gelies Felder:

| Feld | Benotzung |
|---|---|
| `channels` | e Objet mat Arrays, ee pro Kanal, no kanonesche Nimm; Kanäl pro Rad als `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` a `z` sinn néideg |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | den Auto: ID, Numm, Forza-Klassindex (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), Leeschtungsindex, Antriebscode (0 FWD, 1 RWD, 2 AWD) |
| `lap.seconds` | d'Rondenzäit; de lescht `time`-Wäert, wann se feelt |
| `lap.complete` | `false` markéiert eng deelweis Fuert; alles anescht ass komplett |
| `game`, `track` | Nimm; `game` bestëmmt d'Disziplin (kuckt hei ënnen) |
| `units.slipRatio` / `units.slipAngle` | wéi de Rutsch skaléiert ass: eng Eenheet mat `raw` heescht `scaled`, `normalised` heescht `peak`, alles anescht `physical` |
| `meta` | `slip`, `surface`, `discipline`, wéi uginn, iwwerschreiwen déi uewe genannten |

Ouni e `distance`-Kanal gëtt d'Distanz aus den 3D-Positiounen zesummegezielt.

#### FH-Companion-Ronnefichieren {#fh-companion-lap-files}

En JSON-Objet mat engem `Lap`-Objet, dat e `samples`-Array hält (ee Sample ongeféier all 5 m). Zouordnungen:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (verréckelt, sou datt d'Ronn bei 0 ufänkt) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | déiselwecht, mat klenge Buschtawen |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², trotz dem Numm) |
| `Puddle` | `puddle` |

De Auto kënnt vun `Lap.carOrdinal`, `Lap.carName` (nëmmen méi nei Fichieren), `Class` (oder `Lap.carClass` als Forza-Klassindex), `Lap.performanceIndex`, `Lap.drivetrain` an `Lap.peakKilowatts`; d'Zäit vun `Lap.lapSeconds`; eng Fuert mat `EndedAtFinish: false` ass deelweis. Den Spill ass `forza-horizon`.

Dës Fichieren hunn keng Rifendaten an kee Kap, dofir kann ee Bléckeren, Radschlupp a Rutschen doraus allee net beuerteelen; Drécken (aus der Lenkung géint de Wee) a Stéiss a Crashen gehen awer. Pickt déi `.tele.gz` nieft all Eent och mat, fir den Rescht.

#### FH-Companion-Telemetrie (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-komprimiert JSON `{ version, columns, data }`: dat ganz Data Out vun Forza fir eng Ronn, eng Zeil pro Paket, mat den eegene Feldnimm vum Spill. D'Kolonnen ginn duerch Numm gesicht, ni no Plaz. Format 2 behält all Paket (ongeféier 110 pro Sekonn géint d'64 Ticks vum Spill); eng Zeil, déi identesch mat der virdrun ass ausser dem eegene Zäitgeber vum Recorder (`t`, `metres`), gëtt fortgelooss, sou datt eng Ronn mat 64 Zeilen pro Sekonn gelies gëtt. (Den Tooltip vum Lued-Knäppchen seet dat: "fir all Rad säi Rutsch mat 64 Hz".)

| Data-Out-Feld | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (Autosrahmen: x riets, y uewen, z vir) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, vu 0..255 op 0..1 skaléiert |
| `Steer` | `steer`, vu -127..127 op -1..1 skaléiert |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, vu Fahrenheit a °C ëmgerechent |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pro Rad |

`<Wheel>` ass `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` →
`FL`, `FR`, `RL`, `RR`. De Rutsch ass als `peak` markéiert (Forza sengen normaliséierte Rutsch: iwwer 1 huet d'Rad de Gripp verluer).

**Paren.** Eng Ronnefichier `<lap>.json` an `<lap>.json.tele.gz`, déi zesumme gewielt oder falen gelooss ginn (selwechte Wee, nëmmen `.tele.gz`), ginn **eng** Ronn: d'Kanäl vun der Telemetrie, mam Auto, der Klass, der Zäit, der Streck an dem deelweise Markéierung vun der Ronnefichier. De Numm vum Auto aus der Telemetriefichier gëtt virgezu, wann et een hat. Eng `.tele.gz` eleng lued och: Format-2-Fichieren droen `car` (`ordinal`, `name`, `class`, `pi`), `track` an `lapSeconds`; ouni dës ass d'Rondenzäit d'Dauer aus der Telemetrie an de Auto onbekannt.

#### iRacing `.ibt` {#iracing-ibt}

Dat iRacing-Telemetriefichier gëtt direkt gelies (am Browser, ouni Ëmwandlung): den 112-Byte-Kapp, den 32-Byte-Ënnerkapp vun der Disk, d'Variabletabell (144 Byte pro Kanal) an d'Sessioun-YAML.

- **Néideg Kanäl:** `SessionTime`, `Lap`, `Lat`, `Lon`. Ouni si: "… huet keng SessionTime-, Lap-, Lat- an Lon-Kanäl - ass dat en iRacing-Telemetriefichier?"
- **Positiounen:** Breet- a Längegrad ginn a Meter op enger Tangentialebene beim éischten net-null Fix ugeuerdnet (Äerdradius 6 371 008,8 m): x Oscht, z Süden, y d'Héicht (`Alt`) - sou datt mam Standard-Kamerakap Norden oben um Bildschierm ass. Net de Rahmen vun der Streck selwer: e extrahierte Parcoursmodell géif net passen.
- **Ronnen:** d'Sessioun gëtt gedeelt, wann `Lap` sech ännert; eng Ronn bleift, wann se méi wéi 60 Samples huet, mat manner wéi 5 % vun `LapDistPct` ufänkt an iwwer 95 % ophält. Deelweis Ronnen ginn fortgeheit. Wann keng bleift: "… huet keng komplett Ronn vun der N-km-Streck" (Streckelängt aus der YAML) oder "… huet keng komplett Ronn".
- **Distanz:** `LapDist` vum Start vun der Ronn, soss aus den Positiounen zesummegezielt.
- **Auto:** aus `DriverInfo`: dem Spiller säin `CarScreenName`, `CarID` (als Autosnummer) an `CarClassShortName` (als Klass). Streck: `TrackDisplayName`, soss `TrackName`.

Zouordnung vun de Kanäl:

| iRacing | Kanal | Ëmwandlung |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | déiselwecht Nimm | - |
| `Clutch` | `clutch` | `1 - v` (iRacing zielt den Agrëff; eisen ass d'Pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (Radiante géint de Auer no -1..1 riets positiv; Maximum op d'mannst 0,1, π wann et feelt) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | déiselwecht, mat klenge Buschtawen | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | duerch 100 gedeelt, wann iwwer 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | Temperatur an der Mëtt vum Mantel |
| `LFshockDefl` ... | `suspensionM.FL` ... | Dämpferausschlag, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa op psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Radpräfixer: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **All aner** Kanäl mat engem Wäert pro Sample (net vum Bit-Feld-Typ) gi mat sengem eegene Numm duerchgelooss - pro Rad, wann e mat engem Radpräfix ufänkt (`RRspeed` gëtt `speed.RR`) - sou datt d'Graphe an d'Wäertlëschte vun de Kaarten se all uebidden. iRacing schreift keen Rifenrutsch; d'Autosstüerung gëtt aus dem Driftwénkel beuerteelt - `Yaw`, un d'Fuertrichtung ugepasst, géint wouhin d'Auto fiert - an aus der Lenkung géint de Wee. D'Yaw-Rate géint d'Querbeschleunegung gëtt nëmmen benotzt, wann de Kap net ugepasst ka ginn, also gëtt et keen Driftwénkel (kuckt [Autosstüerungs-Evenementer](race-control-events.md)).

Feeler: "… ass ze kuerz fir eng .ibt-Fichier", "… huet kee iRacing-Telemetriekapp", "… huet keng Positiounsfixen".

#### Ronn-CSV {#lap-csv}

Eng Zeil pro Sample; vill Ronnen an enger Fichier ginn duerch eng `lap`-Spalt ënnerscheet. De Trennzeechen gëtt aus den éischte fënnef Zeilen erkannt. Eng fakultativ éischt Zeil `# { ...json... }` beschreift de Lauf: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Spalt (ouni Gruos-/Klengschreiwung) | Kanal |
|---|---|
| `x`, `y`, `z` | Positioun (`x` an `z` sinn néideg) |
| `elapsed` oder `time` | `time` (pro Ronn néideg) |
| `metres` oder `distance` | `distance` (soss aus den Positiounen zesummegezielt) |
| `speed_ms` oder `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | déiselwecht |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| all kanonesche Kanalnumm, z. B. `latVel`, `slipIndex.FL` | sech selwer |
| `lap` | zu wéi enger Ronn eng Zeil gehéiert |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | Rondenzäit, Autosnummer, Klass, PI, Streck (aus der éischter Zeil vun all Ronn) |

Ouni Beschreiwung gëtt de Spill als `forza-horizon` geholl an all Ronn als komplett. D'Quell vun enger Ronn gëtt als `<Fichier> · <Ronn>` gewisen, wann d'Fichier méi Ronnen hält. Feeler: "… huet keng Zeilen", "… huet keng x- an z-Spalten", "… huet keng Ronnen mat enger Zäitspalt".

#### Disziplin a Belag {#discipline-and-surface}

Wat d'Analys iwwer eng Ronn annimmt, wann d'Ronn et net seet (`lap.ts`):

- **Disziplin:** `meta.discipline`, soss ass en Spillnumm, deen `rally|wrc|dirt|rbr` passt, **Rally**; `trackmania` ass **Arcade**; alles anescht **Circuit**.
- **Belag:** `meta.surface`, soss aus dem Streckennumm an der Quell: e Rally mat dem Numm `monte` ass **gemëscht**; `snow|ice|winter|arctic|sweden` **Schnéi**; d'Asphaltrallyen (Spain/España/Catalunya/Costa Daurada, Croatia/Hrvatska, Central Europe, Germany/Deutschland, Japan, Corsica/Corse, Ypres, oder d'Wieder tarmac/asphalt) **Asphalt**; all Numm mat `scramble|trail|cross country|dirt|gravel` **locker**; eng aner Rally-Etapp gëtt no der Fuert vum Auto beuerteelt: iwwer d'Samples méi séier wéi 12 m/s an um Buedem (op d'mannst 200 vun hinnen), e 95-Perzentil vun der Querbeschleunegung vun 10 m/s² oder méi zesumme mat engem Mediane-Driftwénkel ënner 6° (geholl, wou d'Auto mat 70 % oder méi dovun an d'Kurve gaang ass, op d'mindestens 30 Samples) ass **Asphalt**; alles anescht, oder ze wéineg fir ze beuerteelen, ass **locker**. E Nicht-Rally-Numm mat `rally` dran ass **locker**; alles anescht **Asphalt**.
- Pro Sample iwwerschreift e `loose`-Kanal (de Belag-Rumble vum Forza, d'Materialien vum Trackmania, kuckt [Autosstüerungs-Evenementer](race-control-events.md#the-ground)) de Belag vun der Ronn.
