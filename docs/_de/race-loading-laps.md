---
title: "Runden laden"
parent: "Rennanalyse"
nav_order: 51
lang: "de"
source: "race-loading-laps.md"
source_hash: "c7596d45fcc5"
translated: true
outdated: false
---

# Runden laden

Eine Rundendatei ist eine Aufzeichnung einer Fahrt: wo das Auto war und was der Fahrer tat, viele Male pro Sekunde. Lade zwei oder mehr Runden derselben Strecke, und der Reiter **Rennanalyse** kann sie vergleichen.

![Der Abschnitt Runden im Reiter Rennanalyse mit drei geladenen Demo-Runden: Rundenliste, Referenzstern, Fokus](../assets/img/en/race-loading-laps-list.webp)

## Deine ersten Runden {#your-first-laps}

1. Öffne den Reiter **Rennanalyse**.
2. Willst du nur schauen? Drücke **Demo-Runden** (siehe [Demo-Runden](#demo-laps)).
3. Deine eigenen Runden: Nimm sie im Spiel mit einem Aufzeichnungsprogramm auf (siehe [Dateiformate](#file-formats)). Das Aufzeichnungsprogramm schreibt eine Datei pro Runde.
4. Drücke **Rundendateien laden…** und wähle zwei oder mehr Dateien derselben Strecke, oder drücke **Ordner…** und wähle den Ordner, der sie enthält. Du kannst Dateien oder Ordner auch auf die 3D-Ansicht ziehen.
5. Klicke eine Runde in der Liste an, um zu sehen, wo sie Zeit verliert.

**Warnung: Runden werden nur einer Strecke nach der anderen verglichen.** Eine Runde einer anderen benannten Strecke zu laden, leert die bereits geladenen Runden.

## Die Schaltflächen {#the-buttons}

| Bedienelement | Tut |
|---|---|
| **Rundendateien laden…** | ein Dateiauswahlfenster für `.json`-, `.csv`-, `.txt`-, `.ibt`-, `.gz`- und `.h3dcars`-Dateien, mehrere auf einmal (`.h3dcars` ist eine Autodatei, siehe [Autos](race-replay-and-scene.md#the-cars)) |
| **Ordner…** | ein Ordnerauswahlfenster: jede Rundendatei im Ordner und darunter |
| **Demo-Runden** | drei erfundene Runden auf einer erfundenen Strecke (siehe [Demo-Runden](#demo-laps)) |
| **Leeren** | entfernt jede Runde (wird angezeigt, sobald Runden geladen sind) |
| auf die Ansicht ziehen | Dateien und ganze Ordner, die auf die 3D-Ansicht gezogen werden, werden genauso geladen |

Runden werden **hinzugefügt** zu denen, die schon geladen sind – **außer sie gehören zu einer anderen benannten Strecke: dann werden die geladenen Runden zuerst geleert** (Runden werden nur einer Strecke nach der anderen verglichen). Dateien, die sich nicht lesen lassen, werden unter den Schaltflächen aufgelistet, eine Zeile pro Datei; die anderen werden trotzdem geladen.

## Dateiformate {#file-formats}

Das Format wird am Inhalt erkannt, nicht am Dateinamen. Einfach gesagt:

- **heat3d-lap** ist die Datei, die die 3DHeat-Aufzeichnung für die meisten Spiele schreibt.
- **FH Companion** ist ein kostenloses Werkzeug, das Forza-Horizon-Runden aufzeichnet. Es schreibt eine Rundendatei und daneben eine `.json.tele.gz`-Datei (dieselbe Runde mit den Daten jedes Reifens, gzip-komprimiert). Wähle beide zusammen aus.
- **iRacing `.ibt`** ist die eigene Telemetriedatei von iRacing; schalte die Aufzeichnung im Auto mit Alt+L ein und lade die Datei so, wie sie ist.
- Eine **Runden-CSV** ist eine einfache Tabelle, eine Zeile pro Moment.

| Format | Typische Quelle | Gelesen von |
|---|---|---|
| `heat3d-lap` JSON | `heat3d_capture telemetry --game ...` (Forza Horizon und Motorsport über Data Out, AC / ACC / AC EVO / AC Rally, EA SPORTS WRC, DiRT Rally 2.0 / 1, DiRT 4, Richard Burns Rally, BeamNG.drive) | `fromHeat3dLap` |
| FH Companion Runde `.json` | die Rundenbibliothek von FH Companion | `fromFhCompanion` |
| FH Companion Telemetrie `.json.tele.gz` | neben jeder FH-Companion-Rundendatei | `readForzaTelemetry` |
| iRacing `.ibt` | die eigenen Telemetriedateien von iRacing (Aufzeichnung mit Alt+L im Auto) | `readIbt` |
| Runden-CSV | `heat3d_capture laps`, das Trackmania-Plugin oder jede CSV mit `x`, `z`, einer Zeitspalte und optional einer Spalte `lap` | `fromCsv` |

Wie jedes Spiel aufgezeichnet wird und was es sendet, dokumentieren die Aufzeichnungsprogramme: [GameCapture: Spiele](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/games.md) und [GameCapture: das Rundenformat](https://github.com/Holdi601/3DHeat-GameCapture/blob/main/docs/lap-format.md). Siehe auch [Andere Rennspiele](other-games.md).

## Ordner und Strecken {#folders-and-courses}

**Ordner…** oder ein hineingezogener Ordner bringt jede Datei darunter mit. In einem Ordner werden nur Dateien betrachtet, die auf `.json`, `.csv`, `.txt`, `.ibt` oder `.tele.gz` enden; eine `.json`, die keine Runde ist (die eigene Datei einer Strecke, ihre Karte), wird ohne Fehler übersprungen.

**Mehrere Strecken in einer Auswahl.** Die Rundenbibliothek von FH Companion legt jede Strecke in einem Ordner ab, der `<Streckenname> (course_<x>_<z>_to_<x>_<z>)` heißt (oder einfach `course_...` für eine unbenannte Strecke). Liegen die ausgewählten Dateien in mehr als einem solchen Streckenordner, wird nichts geladen; stattdessen sagt der Abschnitt **Runden**: „Das sind Runden von N Strecken, und Runden werden nur einer Strecke nach der anderen verglichen. Wähle eine:“ und listet jede Strecke mit ihrer Rundenanzahl auf (Dateien, die auf `.json`, `.csv` oder `.ibt` enden; `course.json` wird nicht gezählt), die meisten Runden zuerst. Ein Klick auf eine lädt die Dateien dieser Strecke.

Eine Strecke wird über ihren Namen und ihren **Start**punkt erkannt, nicht über ihr Ende. Läufe, die nie ins Ziel kamen, legt FH Companion unter demselben Namen und Start ab (in `unfinished/`), mit dem Punkt, an dem sie aufhörten, als Ende – und sie gehören zu ihrer Strecke, markiert als **unvollständig** in der Liste.

**Mehrere Strecken unter den ausgewählten Dateien.** Liegen direkt ausgewählte Dateien (nicht aus Streckenordnern) zu mehr als einer benannten Strecke, wird dieselbe Auswahl pro Strecke angeboten; Runden, die keine Strecke nennen, gehen zu der Strecke, die gewählt wird.

## Autonamen {#car-names}

Eine Runde trägt den vollen Namen ihres Autos, so wie das Spiel ihn angibt. Wo die Rundendatei das Auto nicht nennt:

1. **Der Ordner.** Die Bibliothek von FH Companion legt Runden in `<Strecke>/<Klasse>/<Autoname> '<yy> (car<Nummer>)/<Abstimmung>/<Markierung>/<Runde>.json` ab. Der innerste Ordner, der `<Name> (car<Nummer>)` entspricht, liefert den Namen und die Nummer; einer, der `car<Nummer>` entspricht, nur die Nummer. Nur Ordnerauswahlen und hineingezogene Ordner tragen diesen Pfad.
2. **Eine andere Runde desselben Autos.** Sobald eine Runde ein Auto nennt, wird jede Runde mit derselben Spiel- und Autonummer so genannt – die zusammen geladenen Runden und die später in diesem Browser geladenen; die Namen werden im `localStorage` unter `heat3d.carNames` gespeichert (geschlüsselt nach `<Spiel>:<Autonummer>`). In einem privaten Fenster bleiben sie nur so lange wie die Runden.
3. Sonst „Auto 1234“ nach seiner Nummer oder „Auto“.

**Beschriftungen.** In der Rundenliste zeigt eine Runde den Namen ihres Autos; mehrere Runden desselben Autos sind nummeriert „Name #1“, „Name #2“. Die Sätze der Analyse nutzen dieselben Beschriftungen, wenn sie eindeutig sind; sonst den Autonamen mit der Rundenzeit, „Name (1:29.616)“ (Beispielzeiten), weiter nummeriert, falls das immer noch nicht eindeutig ist.

**Gruppierung.** Runden gehören zum selben Auto (für Hüllkurven, Profile und Vergleiche), wenn ihre Autonummer – oder ihr Name, wenn es keine Nummer gibt – und ihr Leistungsindex gleich sind (`carKey`): dasselbe Modell mit einer anderen Abstimmung ist ein anderes Auto.

**Klassen.** Die Leistungsklasse einer Runde ist die des Spiels (Forza D..X, die Kurzbezeichnung der iRacing-Klasse); die Statistiken ordnen sie D, C, B, A, S1, S2, R, X, dann andere alphabetisch.

## Demo-Runden {#demo-laps}

**Demo-Runden** lädt drei Runden einer erfundenen Strecke (vier Geraden und vier Rechtskurven), erstellt von einem einfachen Fahrzeugmodell ([`synthetic.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/synthetic.ts)): die durch den Grip begrenzte Geschwindigkeit jeder Kurve, ein Beschleunigungsdurchlauf vorwärts und ein Bremsdurchlauf rückwärts, wie ein Rundensimulator es macht.

| Runde | Auto | Fehler |
|---|---|---|
| sauber | Grip-Auto | keine |
| mit Fehlern | Grip-Auto | bremst 35 m zu früh in T2, kommt 30 m zu spät aufs Gas aus T3, nimmt T4 mit 0,88 seiner Geschwindigkeit, fährt 1,2 m zu einer Seite |
| anderes Auto | Leistungs-Auto | keine; fährt 1,2 m zur anderen Seite |

| Auto (Nummer) | Grip | Bremsen | Traktion | Leistung/Masse | Luftwiderstand |
|---|---|---|---|---|---|
| Grip-Auto (9001) | 16 m/s² | 13 m/s² | 9 m/s² | 230 W/kg | 0,0009 /m |
| Leistungs-Auto (9002) | 12 m/s² | 11 m/s² | 7 m/s² | 380 W/kg | 0,0006 /m |

Die Runde mit den Fehlern ist im Fokus. Die Strecke ist so angelegt, wie Forza seine Welt führt (linkshändig), daher erscheint sie – genau wie eine echte Forza-Runde – gespiegelt, und der Reiter bietet **X invertieren** an. Alle drei Runden tragen Daten für jedes Rad, sodass jeder Teil des Reiters etwas zu zeigen hat.

## Die Rundenliste {#the-lap-list}

Jede Zeile von links nach rechts:

| Element | Tut |
|---|---|
| ● / ○ | zeigt / verbirgt die Runde (Linien, Auto, Karte, Diagramme); verborgene Runden werden trotzdem analysiert |
| Farbstrich | die Farbe der Runde |
| Name und Markierungen | anklicken, um die Runde zu **fokussieren**; darüber schweben für die Quelldatei und das Auto (Name · Klasse PI · Antrieb) |
| ⌖ | verfolge dieses Auto mit der Kamera (noch einmal klicken, um aufzuhören) |
| ★ | vergleiche alles mit dieser Runde (mache sie zur Referenz); auf der Referenz deaktiviert |
| × | entfernt die Runde |

**Markierungen:** *Referenz*; *beste von X* (oder *beste ihrer Klasse*) auf der schnellsten Runde einer Klasse, wenn es mehrere Klassen gibt; *unvollständig* bei einem Lauf, der das Ziel nicht erreicht hat.

**Die zweite Zeile:** die Klasse (nur bei mehreren Klassen), die Rundenzeit (`1:29.616`), der Abstand zu der Runde, mit der sie verglichen wird (der besten ihrer Klasse oder der Referenz), als `+0.512` (Beispiel), und *startet spät*, wenn die Runde mehr als 10 m nach dem Start der Referenz beginnt.

Bei mehr als 8 Runden erscheint eine Zeile „N von M gezeichnet“ mit **Alle zeigen** (jede Runde zeichnen: langsamer und ein Gewirr) und **Nur die betrachteten** (die Referenz, die fokussierte Runde und die beste ihrer Klasse; die Statistiken zählen in beiden Fällen jede Runde).

Unter der Liste: der Spiegelungshinweis, wenn die Runden sagen, dass die Darstellung gespiegelt ist (siehe [gespiegelte Welten](race-replay-and-scene.md#mirrored-worlds)), und bei zwei oder mehr Runden der Hinweis „Klicke eine Runde an, um zu sehen, wo sie Zeit verliert …“, dazu bei mehreren Klassen, dass jede Runde mit der schnellsten ihrer eigenen Klasse verglichen wird.

### Referenz und Fokus {#reference-and-focus}

- **Referenz:** die Runde, auf die alle anderen ausgerichtet und – standardmäßig – verglichen werden. Die schnellste **vollständige** Runde, sofern nicht mit ★ eine andere gewählt wurde (die erste geladene Runde, wenn keine vollständig ist). Wird die Referenzrunde entfernt, kehrt die Auswahl zur automatischen Wahl zurück.
- **Fokus:** die Runde, deren Befunde, Autokontrolle und Karten gezeigt werden. Sie bleibt dort, wohin der Nutzer sie gelegt hat; sonst ist es die **langsamste** Runde, die nicht die Referenz ist („das meiste zum Lernen“). Eine Runde zu fokussieren, macht sie außerdem wieder sichtbar, ebenso die beste Runde ihrer Klasse. Die Referenz zu fokussieren, vergleicht sie mit der Runde, die in jeder Kurve am schnellsten war.
- **Klassen:** Bei Runden mehrerer Leistungsklassen wird jede Runde mit der schnellsten vollständigen Runde ihrer eigenen Klasse verglichen (der Referenz, in der Klasse der Referenz). Siehe [Streckenstatistik](race-course-statistics.md).

### Farben {#colours}

Jede Runde bekommt ihre eigene Farbe, nach ihrer Position in der Ladereihenfolge, sodass eine Runde ihre Farbe behält, wenn andere verborgen werden. Die Farbtöne sind auf dem Farbkreis so verteilt, wie der Teammodus der Heatmap seine Gruppen verteilt; für jeden Platz werden Helligkeit (0,52 bis 0,66 in OKLCH) und Buntheit (0,12 bis 0,18) so gewählt, dass er unter normalem, protanopem und deuteranopem Sehen am weitesten von den Nachbarplätzen entfernt steht (der letzte auch vom ersten), und jeweils mindestens 3:1 gegen die dunkle Diagrammfläche.

## Für Entwickler {#for-developers}

Code: [`src/ui/race/actions.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/actions.ts) (`loadLapFiles`), [`src/race/adapters.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/adapters.ts), [`src/race/ibt.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/ibt.ts), [`src/race/carNames.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carNames.ts).

### Wie jedes Format gelesen wird {#how-each-format-is-read}

Jedes Format endet als ein `LapTrace`: Kanäle unter kanonischen Namen (`time`, `distance`, `x`, `y`, `z`, `speed`, `throttle`, `slipRatio.FL` ..., siehe die [Kanaltabelle](race-charts-and-hud.md#the-channel-table)), das Auto, die Rundenzeit, ob es eine vollständige Runde ist, und ein Block `meta`. Bei jedem Format werden `time` und `distance` so verschoben, dass sie bei 0 beginnen; wo eine Quelle kein `speed` hat, wird es als Distanz geteilt durch Zeit aus den benachbarten Proben berechnet.

#### heat3d-lap JSON {#heat3d-lap-json}

Ein JSON-Objekt mit `"format": "heat3d-lap"`. Gelesene Felder:

| Feld | Verwendung |
|---|---|
| `channels` | ein Objekt aus Arrays, eines pro Kanal, nach kanonischem Namen; kanalweise Werte für Räder als `name.FL`, `name.FR`, `name.RL`, `name.RR`. `time`, `x` und `z` sind Pflicht |
| `car.carOrdinal`, `car.name`, `car.carClass`, `car.carPI`, `car.drivetrain` | das Auto: Kennung, Name, Forza-Klassenindex (0 D, 1 C, 2 B, 3 A, 4 S1, 5 S2, 6 X), Leistungsindex, Antriebscode (0 Frontantrieb, 1 Heckantrieb, 2 Allrad) |
| `lap.seconds` | die Rundenzeit; fehlt sie, der letzte `time`-Wert |
| `lap.complete` | `false` kennzeichnet einen unvollständigen Lauf; alles andere ist vollständig |
| `game`, `track` | Namen; `game` bestimmt die Disziplin (siehe unten) |
| `units.slipRatio` / `units.slipAngle` | wie der Schlupf skaliert ist: enthält eine Einheit `raw`, bedeutet das `scaled`, `normalised` bedeutet `peak`, alles andere `physical` |
| `meta` | `slip`, `surface`, `discipline`, wie angegeben, überschreiben das oben Gesagte |

Ohne einen Kanal `distance` wird die Distanz aus den 3D-Positionen summiert.

#### FH-Companion-Rundendateien {#fh-companion-lap-files}

Ein JSON-Objekt mit einem Objekt `Lap`, das ein Array `samples` enthält (eine Probe etwa alle 5 m). Zugeordnete Felder:

| FH Companion | Kanal |
|---|---|
| `Metres`, `Seconds` | `distance`, `time` (so verschoben, dass die Runde bei 0 beginnt) |
| `X`, `Y`, `Z` | `x`, `y`, `z` |
| `Speed`, `Throttle`, `Brake`, `Steer`, `Clutch`, `HandBrake`, `Gear` | dasselbe, in Kleinbuchstaben |
| `LatG`, `LongG` | `latAcc`, `longAcc` (m/s², trotz des Namens) |
| `Puddle` | `puddle` |

Das Auto kommt aus `Lap.carOrdinal`, `Lap.carName` (nur neuere Dateien), `Class` (oder `Lap.carClass` als Forza-Klassenindex), `Lap.performanceIndex`, `Lap.drivetrain` und `Lap.peakKilowatts`; die Zeit aus `Lap.lapSeconds`; ein Lauf mit `EndedAtFinish: false` ist unvollständig. Das Spiel ist `forza-horizon`.

Diese Dateien enthalten keine Reifendaten und keine Richtung, daher lassen sich Blockieren, Durchdrehen und Rutschen allein daraus nicht beurteilen; Schübe (aus der Lenkung gegen den Pfad) und Treffer und Unfälle sind trotzdem zu erkennen. Wähle die `.tele.gz` daneben ebenfalls aus, für den Rest.

#### FH-Companion-Telemetrie (`.json.tele.gz`) {#fh-companion-telemetry-jsontelegz}

Gzip-komprimiertes JSON `{ version, columns, data }`: Forzas gesamtes Data Out für eine Runde, eine Zeile pro Paket, mit den eigenen Feldnamen des Spiels. Spalten werden über ihren Namen gesucht, nie über ihre Position. Format 2 behält jedes Paket (etwa 110 pro Sekunde gegenüber den 64 Ticks des Spiels); eine Zeile, die in allem außer der eigenen Uhr des Aufzeichnungsprogramms (`t`, `metres`) mit der vorigen identisch ist, wird verworfen, sodass eine Runde mit den 64 Zeilen pro Sekunde des Spiels gelesen wird. (Der Tooltip des Ladeknopfs sagt es: „für den Schlupf jedes Reifens mit 64 Hz“.)

| Data-Out-Feld | Kanal |
|---|---|
| `t`, `metres` | `time`, `distance` |
| `PositionX/Y/Z` | `x`, `y`, `z` |
| `Yaw`, `Pitch`, `Roll` | `yaw`, `pitch`, `roll` |
| `VelocityX/Y/Z` | `latVel`, `vertVel`, `longVel` (Fahrzeugrahmen: x rechts, y oben, z vorn) |
| `AccelerationX/Y/Z` | `latAcc`, `vertAcc`, `longAcc` |
| `AngularVelocityY` | `yawRate` |
| `Speed`, `CurrentEngineRpm`, `Gear`, `Power`, `Torque`, `Boost`, `Fuel` | `speed`, `rpm`, `gear`, `power`, `torque`, `boost`, `fuel` |
| `Accel`, `Brake`, `Clutch`, `HandBrake` | `throttle`, `brake`, `clutch`, `handbrake`, von 0..255 auf 0..1 skaliert |
| `Steer` | `steer`, von -127..127 auf -1..1 skaliert |
| `NormalizedSuspensionTravel<Wheel>` | `suspension.<W>` |
| `TireSlipRatio<Wheel>`, `TireSlipAngle<Wheel>`, `TireCombinedSlip<Wheel>` | `slipRatio.<W>`, `slipAngle.<W>`, `combinedSlip.<W>` |
| `TireTemp<Wheel>` | `tireTemp.<W>`, von Fahrenheit in °C umgerechnet |
| `WheelRotationSpeed<Wheel>`, `WheelInPuddle<Wheel>`, `WheelOnRumbleStrip<Wheel>`, `SurfaceRumble<Wheel>` | `wheelSpeed`, `puddle`, `rumble`, `surfaceRumble` pro Rad |

`<Wheel>` ist `FrontLeft`, `FrontRight`, `RearLeft`, `RearRight` → `FL`, `FR`, `RL`, `RR`. Der Schlupf ist als `peak` markiert (Forzas normierter Schlupf: über 1 hat der Reifen losgelassen).

**Paarung.** Eine Rundendatei `<Runde>.json` und `<Runde>.json.tele.gz`, die zusammen ausgewählt oder hineingezogen werden (gleicher Pfad, nur `.tele.gz` statt `.json`), werden zu **einer** Runde: den Kanälen der Telemetrie, mit Auto, Klasse, Zeit, Strecke und Unvollständig-Kennzeichen der Rundendatei. Hat die Telemetriedatei selbst einen Autonamen, gewinnt er. Eine `.tele.gz` allein wird trotzdem geladen: Dateien in Format 2 tragen `car` (`ordinal`, `name`, `class`, `pi`), `track` und `lapSeconds`; ohne diese ist die Rundenzeit die eigene Dauer der Telemetrie und das Auto unbekannt.

#### iRacing `.ibt` {#iracing-ibt}

Die Telemetriedatei von iRacing wird direkt gelesen (im Browser, ohne Umwandlung): der 112-Byte-Kopf, der 32-Byte-Unterkopf der Platte, die Variablentabelle (144 Byte pro Kanal) und das Sitzungs-YAML.

- **Pflichtkanäle:** `SessionTime`, `Lap`, `Lat`, `Lon`. Fehlen sie: „… hat keine Kanäle SessionTime, Lap, Lat und Lon – ist es eine iRacing-Telemetriedatei?“
- **Positionen:** Breite und Länge werden in Metern auf einer Tangentialebene am ersten Fix ungleich null ausgelegt (Erdradius 6 371 008,8 m): x nach Osten, z nach Süden, y die Höhe (`Alt`) – sodass bei der Standardkamera Norden oben auf dem Bildschirm liegt. Nicht das eigene Koordinatensystem der Strecke: Ein extrahiertes Streckenmodell würde sonst nicht passen.
- **Runden:** Die Sitzung wird an jeder Änderung von `Lap` geteilt; eine Runde wird behalten, wenn sie mehr als 60 Proben hat, bei weniger als 5 % von `LapDistPct` beginnt und bei mehr als 95 % endet. Unvollständige Runden werden verworfen. Bleibt keine übrig: „… hat keine vollständige Runde der N km langen Strecke“ (Streckenlänge aus dem YAML) oder „… hat keine vollständige Runde“.
- **Distanz:** `LapDist` ab dem Start der Runde, sonst aus den Positionen summiert.
- **Auto:** aus `DriverInfo`: `CarScreenName` des Spielers, `CarID` (als Autonummer) und `CarClassShortName` (als Klasse). Strecke: `TrackDisplayName`, sonst `TrackName`.

Zugeordnete Kanäle:

| iRacing | Kanal | Umrechnung |
|---|---|---|
| `Speed`, `Throttle`, `Brake`, `Gear`, `RPM` | gleiche Namen | - |
| `Clutch` | `clutch` | `1 - v` (iRacing zählt das Einrücken; unseres ist das Pedal) |
| `SteeringWheelAngle` | `steer` | `-v / SteeringWheelAngleMax` (Radiant gegen den Uhrzeigersinn zu -1..1 rechts positiv; Maximum mindestens 0,1, π wenn es fehlt) |
| `LatAccel`, `LongAccel`, `VertAccel` | `latAcc`, `longAcc`, `vertAcc` | - |
| `Yaw`, `Pitch`, `Roll`, `YawRate` | gleich, in Kleinbuchstaben | - |
| `BrakeABSactive` | `absActive` | - |
| `dcABS`, `dcTractionControl` | `absLevel`, `tcLevel` | - |
| `dcBrakeBias` | `brakeBias` | durch 100 geteilt, wenn über 1,5 |
| `dcPitSpeedLimiterToggle` | `pitLimiter` | - |
| `FuelLevel`, `WaterTemp`, `OilTemp` | `fuel`, `waterTemp`, `oilTemp` | - |
| `LFtempCM` ... | `tireTemp.FL` ... | Temperatur der Karkassenmitte |
| `LFshockDefl` ... | `suspensionM.FL` ... | Dämpferauslenkung, m |
| `LFpressure` ... | `tirePressure.FL` ... | × 0,145038 (kPa in psi) |
| `LFwearM` ... | `tireWear.FL` ... | `1 - v` |

Radpräfixe: `LF` → FL, `RF` → FR, `LR` → RL, `RR` → RR. **Jeder andere** Kanal mit einem Wert pro Probe (nicht vom Bit-Feld-Typ) wird unter seinem eigenen Namen durchgereicht – pro Rad, wenn er mit einem Radpräfix beginnt (`RRspeed` wird zu `speed.RR`) –, damit die Diagramme und die Wertlisten der Karten sie alle anbieten. iRacing protokolliert keinen Reifenschlupf: Die Autokontrolle wird am Driftwinkel beurteilt – `Yaw`, angepasst an die Fahrtrichtung, im Vergleich dazu, wohin das Auto fährt – und an der Lenkung gegenüber dem Pfad. Die Gierrate gegen die Querbeschleunigung wird nur benutzt, wenn der Kurswinkel nicht angepasst werden kann; dann gibt es keinen Driftwinkel (siehe [Ereignisse der Autokontrolle](race-control-events.md)).

Fehler: „… ist zu kurz für eine .ibt-Datei“, „… hat keinen iRacing-Telemetriekopf“, „… hat keine Positionsfixes“.

#### Runden-CSV {#lap-csv}

Eine Zeile pro Probe; viele Runden in einer Datei werden über eine Spalte `lap` unterschieden. Das Trennzeichen wird aus den ersten fünf Zeilen erkannt. Eine optionale erste Zeile `# { ...json... }` beschreibt den Lauf: `game`, `track`, `seconds`, `complete`, `meta`, `car`.

| Spalte (Groß-/Kleinschreibung egal) | Kanal |
|---|---|
| `x`, `y`, `z` | Position (`x` und `z` sind Pflicht) |
| `elapsed` oder `time` | `time` (pro Runde Pflicht) |
| `metres` oder `distance` | `distance` (sonst aus den Positionen summiert) |
| `speed_ms` oder `speed` | `speed` (m/s) |
| `throttle`, `brake`, `steer`, `gear`, `clutch`, `handbrake`, `puddle` | gleich |
| `lat_g`, `long_g` | `latAcc`, `longAcc` |
| jeder kanonische Kanalname, z. B. `latVel`, `slipIndex.FL` | er selbst |
| `lap` | zu welcher Runde eine Zeile gehört |
| `lap_seconds`, `car`, `car_class`, `pi`, `course` | Rundenzeit, Autonummer, Klasse, PI, Strecke (aus der ersten Zeile jeder Runde) |

Ohne Beschreibung wird das Spiel als `forza-horizon` angenommen und jede Runde als vollständig. Die Quelle einer Runde wird als `<Datei> · <Runde>` angezeigt, wenn die Datei mehrere enthält. Fehler: „… hat keine Zeilen“, „… hat keine Spalten x und z“, „… hat keine Runden mit einer Zeitspalte“.

#### Disziplin und Untergrund {#discipline-and-surface}

Was die Analyse über eine Runde annimmt, wenn die Runde es nicht sagt (`lap.ts`):

- **Disziplin:** `meta.discipline`, sonst ist ein Spielname, der zu `rally|wrc|dirt|rbr` passt, **Rallye**; `trackmania` ist **Arcade**; alles andere **Rundkurs**.
- **Untergrund:** `meta.surface`, sonst aus dem Streckennamen und der Quelle: eine Rallye mit dem Namen `monte` ist **gemischt**; `snow|ice|winter|arctic|sweden` **Schnee**; die Asphalt-Rallyes (Spanien/España/Catalunya/Costa Daurada, Kroatien/Hrvatska, Mitteleuropa, Deutschland, Japan, Korsika/Corse, Ypern, oder die Wörter tarmac/asphalt) **Asphalt**; jeder Name mit `scramble|trail|cross country|dirt|gravel` **loser Untergrund**; eine andere Rallye-Etappe wird danach beurteilt, wie das Auto gefahren wurde: Liegen über den Proben mehr als 12 m/s und auf dem Boden (mindestens 200), ein 95-Perzentil der Querbeschleunigung von 10 m/s² oder mehr zusammen mit einem medianen Driftwinkel unter 6° (genommen dort, wo das Auto mit 70 % davon oder mehr kurvte, mindestens 30 Proben), ist es Asphalt; alles andere oder zu wenig zum Urteilen ist loser Untergrund. Ein Nicht-Rallye-Name mit `rally` darin ist loser Untergrund; alles andere Asphalt.
- Pro Probe überschreibt ein Kanal `loose` (das Oberflächenrauschen von Forza, die Materialien von Trackmania, siehe [Ereignisse der Autokontrolle](race-control-events.md#the-ground)) den Untergrund der Runde.
