---
title: "Fahrzeugkontroll-Ereignisse"
parent: "Rennanalyse"
nav_order: 54
lang: "de"
source: "race-control-events.md"
source_hash: "18fe9a0507bc"
translated: true
outdated: false
---

# Fahrzeugkontroll-Ereignisse

Der Viewer zeigt, wie jede Runde gefahren wurde, und markiert die Stellen, an denen der Fahrer das Auto rutschen, sich drehen oder gegen etwas stoßen ließ oder Grip verschenkte. Das ist nützlich, denn ein Fehler, der Zeit gekostet hat, ist der schnellste, den du beheben kannst.

![Der Abschnitt Fahrzeugkontrolle: wie oft jede Runde ein Rad blockierte, sich drehte oder nach außen schob, und die Liste der Fehler mit einem geöffneten Eintrag](../assets/img/en/race-control-table.webp)

## Einfach gesagt {#in-plain-words}

- **Blockieren**: Du bremst so stark, dass ein Rad stehen bleibt und rutscht. Das Auto bremst schlechter und lässt sich nicht mehr lenken.
- **Durchdrehen**: Du gibst so viel Gas, dass die angetriebenen Räder schneller drehen, als sich das Auto bewegt. Du verlierst Vortrieb.
- **Übersteuern**: Das Heck bricht weit aus. Dreht sich das Auto ganz herum, ist das ein **Dreher**.
- **Untersteuern**: Der Bug rutscht weit nach außen („schieben“); mehr Lenkeinschlag hilft nicht.
- **Kontakt** und **Unfall**: Das Auto hat etwas berührt (ein Kontakt ist ein Stoß oder Kratzer, ein Unfall ist ein harter Aufprall).
- **ABS**, **TC**: Die Helfer des Autos, die gegen Blockieren und Durchdrehen arbeiten. Das sind keine Fehler.

## Der Abschnitt Fahrzeugkontrolle (was du siehst) {#the-car-control-section-what-you-see}

Für die gewählte Runde zeigt er, was die Runden gerade hergeben. Ohne Reifenschlupf und ohne Driftwinkel zeigt er trotzdem, was sich noch finden lässt, statt nichts (siehe unten).

**Die Tabelle**: eine Zeile pro Art, die eine der beiden Runden zeigt – Blockierte Räder, Durchdrehende Räder, Ausbrechendes Heck (Übersteuern und Dreher), Schieben nach außen, Unfälle, Kontakte, ABS greift, Traktionskontrolle greift, Handbremse, In der Luft. Jede Zelle zeigt „Anzahl · Sekunden“, für die gewählte Runde und die Runde, mit der sie verglichen wird. Dazu *größter Driftwinkel*, wenn es einen Driftwinkel gibt (der größte auf dem Boden).

**Die Liste**: ihre nicht geteilten Fehler, die mindestens 0,02 s gekostet haben, die teuersten zuerst, höchstens 12. Jeder mit Titel und Kosten (und dem Chip seiner Art). Klick auf einen, um seinen Tipp zu lesen, die Autos 40 m davor nebeneinanderzustellen und ihn abzuspielen. **Auch, was beide Runden dort taten** fügt jeden Fehler hinzu, auch die geteilten (Chip „beide haben es gemacht“, Kosten „—“ unter 0,01 s). Ohne Fehler steht da: „Was X mit den Reifen gemacht hat, hat ihn nicht mehr Zeit gekostet als Y.“

**Der Hinweis darunter** sagt, womit die Erkennung arbeiten konnte – „Aus dem Schlupf jedes Rades und seinem Schlupfwinkel sowie dem Driftwinkel des Autos.“ (oder Schlupf und Schlupfwinkel, Schlupf und Driftwinkel, nur Schlupf oder „Nur aus dem Driftwinkel des Autos – diese Runden enthalten keinen Reifenschlupf.“). Dazu der Untergrund, für den die Grenzen gemessen wurden (Asphalt, lose, gemischt: über 80 % lose Messwerte gelten als lose, unter 20 % als Asphalt), welche Runde als Vergleich diente und wie die Kosten berechnet werden.

Ohne **Reifenschlupf und ohne Driftwinkel** (eine FH-Companion-Rundendatei ohne ihre Telemetrie) werden Tabelle und Liste trotzdem angezeigt, und der Hinweis sagt, was aus dem gefunden wurde, was die Runden enthalten: „Diese Runden enthalten weder Reifenschlupf noch Driftwinkel, daher lassen sich Blockieren und Durchdrehen nicht erkennen. Weiterhin erkannt: Schieben nach außen, aus der Lenkung gegenüber der Bahn; Kontakte und Unfälle, aus Geschwindigkeit und Beschleunigung.“ – Rutschen aus der Giergeschwindigkeit wird ebenfalls genannt, wo die Runden eine haben, und Schieben nur, wo es Lenkdaten gibt. Der Satz über die Schlupf- und Driftgrenzen entfällt, und ein zweiter Hinweis sagt: „Bei Forza Horizon lade zusätzlich die Datei `.tele.gz` neben jeder FH-Companion-Runde: Sie ist die volle Telemetrie, der Schlupf jedes Rades 64 Mal pro Sekunde.“

Die **Gesamtkosten** der Fahrzeugkontrolle einer Runde (in Zusammenfassungen verwendet) zählen überlappende Fehler – ein Blockieren und das Rutschen, das es auslöst, innerhalb von 40 m – nur einmal, und zwar mit den höchsten Kosten des Bündels.

## So wird es erkannt {#how-it-is-detected}

Der Rest dieser Seite ist das Regelbuch: jede Art, jede Schwelle.

Code: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Die Begründung und die Literatur stehen in [der Methode](race-analytics.md).

## Die Arten {#the-kinds}

| Art | Tabellenzeile | Ein Fehler? | Kürzester, der zählt |
|---|---|---|---|
| `lock` | Blockierte Räder | ja | 0,1 s |
| `wheelspin` | Durchdrehende Räder | ja | 0,15 s |
| `oversteer` | Ausbrechendes Heck | ja | 0,2 s |
| `spin` | (zusammen mit Ausbrechendes Heck gezählt) | ja | 0,1 s |
| `understeer` | Schieben nach außen | ja | 0,25 s |
| `crash` | Unfälle | ja | - |
| `hit` | Kontakte | ja | - |
| `abs` | ABS greift | nein | 0,2 s |
| `tc` | Traktionskontrolle greift | nein | 0,2 s |
| `handbrake` | Handbremse | nein | 0,1 s |
| `airborne` | In der Luft | nein | 0,15 s |

Kürzere Stücke sind Rauschen (ein Randstein, eine Bodenwelle, eine einzelne Messung). Folgen von Rasterpunkten (alle 2 m), die einen Test bestehen, werden über Lücken von bis zu 2 Punkten verbunden. Nur **Fehler** können Fehler sein und haben Kosten; die anderen zeigen, was das Auto und der Fahrer getan haben.

## Was jeder Test braucht {#what-every-test-needs}

### Abgeleitete Kanäle {#derived-channels}

Bevor etwas bewertet wird, bekommt jede Runde, was ihr Spiel nicht sendet, unter einheitlichen Namen (ein Wert aus dem Spiel gewinnt immer):

| Kanal | Aus |
|---|---|
| `bodySlip` (Driftwinkel) | der Geschwindigkeitsvektor im Fahrzeugsystem, `atan2(latVel, abs(longVel))`, wo das Spiel ihn sendet (0 unter 3 m/s); sonst die Blickrichtung (die Gierung des Spiels, an die Fahrtrichtung angepasst durch Vorzeichen und Versatz über Messungen schneller als 10 m/s, nur vertraut bei einer zirkularen Varianz unter 0,05) gegen die Fahrtrichtung (Positionen mindestens 2 m auseinander), bei Geschwindigkeiten über 3 m/s |
| `yawRate` | die Änderung von `yaw` über die Zeit, wo es eine Richtung, aber keine Rate gibt |
| `airborne` | jeder Radkontakt zum Boden aus (≤ 0,5); sonst jede Radlast unter 5 % ihres Medians; sonst jeder Federweg bei oder unter 0,02 (ganz ausgefedert). Eine einzelne verirrte Messung ist kein Sprung |
| `slipRatio.<W>` | `(wheel surface speed - car speed) / car speed` über 3 m/s, wo das Spiel Radumfangsgeschwindigkeiten sendet; sonst aus Raddrehzahl × einem auf der Runde gemessenen Abrollradius – dem Median von `speed / rotation` beim geraden Ausrollen (Geschwindigkeit über 10 m/s, Gas unter 0,3, Bremse unter 0,05, abs(Längsbeschleunigung) unter 3 m/s², nicht in der Luft; jede Messung über 10 m/s, wenn es weniger als 20 gibt), angenommen zwischen 0,1 und 1 m. Markiert als `physical` |
| `loose` | Forzas Untergrundrumpeln an mindestens 2 Rädern (> 0,001) für mindestens 0,33 s (ein Randstein ist kürzer), Lücken unter 1 s überbrückt |

### Am Boden und eingeschwungen {#on-the-ground-and-settled}

Nichts wird in der Luft oder **0,3 s nach einer Landung** bewertet – das Fahrwerk schlägt durch, und die Beschleunigungen schnellen hoch, das ist kein Grip, Bremsen oder Antrieb. Eine Messung muss außerdem **in Bewegung** sein: schneller als 5 m/s.

### Der Untergrund {#the-ground}

Der Untergrund jeder Messung ist **lose**, wo der Kanal `loose` der Runde es sagt (Forzas Untergrundrumpeln, die Reifenmaterialien von Trackmania), sonst die Oberfläche der Runde (siehe [Disziplin und Oberfläche](race-loading-laps.md#discipline-and-surface)): Asphalt, oder lose für alles andere. Kurven, Driftgewohnheiten und Schwellen werden für Asphalt und losen Untergrund getrennt gehalten.

### Schlupf als Vielfaches des Nenn-Maximums des Reifens {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Spiele skalieren den Schlupf unterschiedlich; `meta.slip` sagt, wie, und jeder Schlupf wird durch einen Maßstab geteilt, sodass etwa 1 das Nenn-Maximum des Reifens ist:

| `meta.slip` | Bedeutung | Geteilt durch |
|---|---|---|
| `peak` | vom Spiel normiert: über 1 geht Grip verloren (Forza Data Out) | 1 |
| `scaled` | physikalischer Schlupf geteilt durch ein Asphalt-Maximum (der Kunos-Recorder) | das Nenn-Maximum des Untergrunds durch das des Asphalts |
| `index` | ein Schlupfmaß von 0 bis 1 (SlipCoef von Trackmania) | 0,5 |
| `physical` (oder unbekannt) | Schlupfverhältnis als Bruchteil, Schlupfwinkel in Radiant | das Nenn-Maximum des Untergrunds |

Nenn-Maxima, wenn nichts Besseres bekannt ist:

| Untergrund | Schlupfverhältnis | Schlupfwinkel |
|---|---|---|
| Asphalt | 0,12 | 8° |
| gemischt | 0,18 | 12° |
| lose (Schotter) | 0,25 | 15° |
| Schnee | 0,25 | 15° |
| Eis | 0,10 | 6° |

### Wo der Grip endet: die Reifenkurven jedes Autos {#where-grip-ends-each-cars-tyre-curves}

Wo ein Reifen nicht mehr hergibt, wird **für jedes Auto gemessen**, aus jeder belasteten Runde damit (`measureTyres`), getrennt für Asphalt und losen Untergrund:

| Kurve | Messungen (Geschwindigkeit über 10 m/s, eingeschwungen, Beschleunigungen unter 45 m/s²) | Schlupf (x) | Kraft (y) |
|---|---|---|---|
| Bremsen | Bremse über 0,3, Handbremse höchstens 0,2, geradeaus fahren (Querbeschleunigung unter 30 % des Stärksten) | abs(mittlerer Schlupf-Ratio der vier Räder) | Verzögerung |
| Traktion | Gas über 0,8, Bremse höchstens 0,05, geradeaus, der volle Gasschub des Autos bei dieser Geschwindigkeit über 0,5 m/s² | der Schlupf des stärksten angetriebenen Rades | Beschleunigung als Anteil dieses Schubs |
| vorne | Querbeschleunigung über 30 % des Stärksten, der Grip des Autos bei dieser Geschwindigkeit über 1 m/s² | der größere Schlupfwinkel vorne | Querbeschleunigung als Anteil dieses Grips |
| hinten | dasselbe | der größere Schlupfwinkel hinten | dasselbe |

„Das Stärkste“ ist das 99. Perzentil der absoluten Querbeschleunigung der Runde auf diesem Untergrund (alle Untergründe, wenn es weniger als 50 Messungen gibt). Der Antriebsstrang bestimmt die angetriebenen Räder (Vorderradantrieb: vorne, Hinterradantrieb: hinten, Allrad: alle; unbekannt: alle).

Ab mindestens **150 Messungen** wird der Schlupf in 6 bis 14 gleich besetzte Klassen geteilt (eine pro 40 Messungen). Die Kraft jeder Klasse ist ihr oberes Quartil (was der Reifen gab, wenn der Fahrer es verlangte), über benachbarte Klassen geglättet. Das **Beste** ist die Klasse mit der meisten Kraft; die **Grenze** ist die erste Klasse danach, in der die Kraft um **8 %** gefallen ist. Eine Kurve, die in den Daten nie fällt, hat keine Grenze (unendlich) – über das „Maximum“ hinaus kostet in diesem Spiel nichts, und Schlupf allein markiert dort nichts (so ist es bei Forza Horizons Kurven- und Traktionskurven). Gibt es auf einem Untergrund zu wenige Messungen, werden die des anderen Untergrunds genommen; gibt es insgesamt zu wenige, die **nominelle** Grenze: 1,5-mal das Nenn-Maximum.

Jedes Auto bekommt außerdem:

- seine **Driftgewohnheit**: das obere Quartil seines Driftwinkels überall dort, wo es mit 60 % des Stärksten oder mehr um eine Kurve fährt (braucht 100 Messungen);
- seine **Lenkung pro Krümmung** (`steerGain`), pro Geschwindigkeitsband von 5 m/s: der Median von abs(Lenkung) / Bahnkrümmung, während es fest, aber deutlich innerhalb seines Grips um eine Kurve fährt (30–60 % des Stärksten, Krümmung enger als 400 m Radius, Lenkung über 0,02; 25 Messungen pro Band). Die Krümmung der Bahn ist die Gierrate geteilt durch die Geschwindigkeit, wo das Spiel eine Gierrate sendet, sonst aus den Positionen ±5 m.

## Erkennung, Art für Art {#detection-kind-by-kind}

| Art | Test (bei Messungen in Bewegung und eingeschwungen) | `peak` und `limit` |
|---|---|---|
| **lock** | Bremse über 0,05, Handbremse nicht über 0,2, und der Schlupf-Ratio eines Rades unter minus der Bremsgrenze | der negativste Schlupf (Vielfache des Nenn-Maximums); die Grenze als negativ |
| **wheelspin** | Gas über 0,2 (oder kein Gaskanal), und der Schlupf-Ratio eines angetriebenen Rades über der Traktionsgrenze | der größte angetriebene Schlupf; die Grenze |
| **oversteer** (Driftwinkel) | der Driftwinkel über dem größeren von Untergrundboden und 1,5 × der Driftgewohnheit des Autos dort | der größte Driftwinkel, Radiant |
| **oversteer** (Schlupfwinkel, kein Driftwinkel) | der größere Schlupfwinkel hinten über der Grenze hinten und mehr als 0,25 über dem größeren vorne | der Schlupfwinkel hinten (Vielfache des Maximums) |
| **oversteer** (kein Driftwinkel, aber Gierrate und Querbeschleunigung) | die „Drehgeschwindigkeit“ – abs(Gierrate) minus abs(Querbeschleunigung) / Geschwindigkeit, über 8 m/s – über 0,2 rad/s, mit der Lenkung gegen die Kurve | rad/s; Grenze 0,2 |
| **spin** | ein Übersteuern-Stück, dessen Driftwinkel über **60°** hinausging | wie Übersteuern |
| **understeer** (Schlupfwinkel) | rutscht nicht, der größere Schlupfwinkel vorne über der Grenze vorne und mehr als 0,3 über dem hinteren | der Schlupfwinkel vorne; die Grenze |
| **understeer** (keine Schlupfwinkel) | schneller als 12 m/s, rutscht nicht, lenkt nicht gegen, Querbeschleunigung über der Hälfte des Stärksten der Runde (99. Perzentil), Bahn enger als 300 m Radius, und Lenkung mehr als **1,6-mal** das, was die eigene Lenkung pro Krümmung des Autos für die Bahn nötig sagt | die nötige Lenkung mal; Grenze 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` über 0,5 | - |
| **handbrake** | `handbrake` über 0,2 | - |
| **airborne** | `airborne` über 0,5 | - |
| **hit**, **crash** | siehe [Treffer und Unfälle](#hits-and-crashes) | die Geschwindigkeit, die der Aufprall nahm |

Driftwinkel-Untergrenzen nach Untergrund: Asphalt **7°**, gemischt **10°**, lose und Schnee **15°**, Eis **10°**. Sie folgen der Literatur: Der Schlupfwinkel eines Reifens erreicht sein Maximum bei 3–10° auf Asphalt, die Stabilitätsgrenze eines Straßenautos beim Schwimmwinkel liegt bei etwa 12° auf trockenem Asphalt, während Rallye und Drift mit 30–50° gefahren werden ([Rennanalyse, Quellen](race-analytics.md#sources)). Ein Auto, das von sich aus mehr rutscht – ein Arcade-Reifenmodell, ein Schotter-Spezialist –, bekommt eine eigene, höhere Schwelle aus seinen eigenen Runden (1,5 × seine Gewohnheit).

**In welche Richtung das Auto dreht** (für „gegen die Kurve“): die Richtungsänderung der eigenen Bahn der Runde über ±6 m (mindestens 2 Rasterpunkte); enger als 600 m Radius zählt als Kurve; rechts oder links, je nachdem, ob die Welt gespiegelt ist. Die Lenkung ist **gegen** die Kurve, wenn abs(Lenkung) über 0,05 liegt und ihr Vorzeichen dem der Kurve entgegengesetzt ist – ein Rutschen, das mit Gegenlenkung **eingefangen** wird.

**Die Pedale zu Beginn** (`pedal`): *Bremse*, wenn die Bremse über 0,1 liegt; *Gas* über 0,3; *Gas weg*, wenn das Gas davor innerhalb der 8 Rasterpunkte (16 m) über 0,5 war; sonst *Ausrollen* (oder ohne Gaskanal).

## Gegen die andere Runde gelegt {#laid-against-the-other-lap}

Jedes Ereignis wird gegen die Runde bewertet, mit der die gewählte Runde in diesem Abschnitt verglichen wird (die schnellste ihrer Klasse; für diese Runde selbst die schnellste ihrer Klasse durch den Abschnitt):

1. **Wie weit die andere Runde auf denselben Metern ging**, ±8 m: die eigenen Ereignisse der anderen Runde derselben Familie (ein Dreher zählt als Übersteuern, ein Unfall als Kontakt), in denselben Einheiten gemessen, ohne Schwellen, mit den Reifenkurven des anderen Autos.
2. **Geteilt**, wenn die andere Runde **80 %** oder mehr so weit ging: So wird die Kurve gefahren, das ist kein Fehler. Nicht-Fehler-Arten sind immer „geteilt“.
3. **Kosten**, für einen nicht geteilten Fehler: die Zeit, die diese Runde gegenüber der anderen verlor, von 5 m vor dem Ereignis bis **40 m danach** (bei einem Kontakt oder Unfall bis das Auto wieder seine Geschwindigkeit hat – die Meter, um sie mit dem eigenen Schub zurückzugewinnen, 40 bis 400 m; ohne gemessenen Schub 5 m/s²). Nie negativ.
4. **Verschenkte Geschwindigkeit** bis zur Grenze des Autos: bei einem Blockieren die Verzögerung, die das Auto bei dieser Geschwindigkeit leisten kann, minus der, die es tat, über das Ereignis summiert; beim Durchdrehen der volle Gasschub minus dem, was es tat; bei einem Aufprall die Geschwindigkeit, die er nahm. Genannt, wenn über 0,5 m/s (1,8 km/h).

Ein Fehler, der nicht geteilt ist und mindestens **0,02 s** kostet, wird aufgeführt. (Die [Streckenstatistik](race-course-statistics.md) zählt nur Fehler von **0,03 s** oder mehr, damit ein Fehler, der über viele Runden gezählt wird, ein klarer ist.) Er kann zur Ursache eines Kurvenverlusts werden (siehe [Kurve für Kurve analysiert](race-corner-analysis.md#car-control-faults-and-impacts)).

## Treffer und Unfälle {#hits-and-crashes}

`impacts.ts` liest Treffer aus den **eigenen Messungen** der Runde, bevor sie neu abgetastet werden – ein Treffer ist in Hundertstelsekunden vorbei. Reifen können die Kräfte eines Treffers nicht erzeugen, daher wird ein Treffer am eigenen Auto der Runde gemessen:

- **Sein Grip `G`**: das 99. Perzentil seiner horizontalen Beschleunigung `√(lat² + long²)` über die Runde, am Boden und schneller als 5 m/s. Ohne Beschleunigungskanäle (oder unter 3 m/s²) 15 m/s² – der Grip eines Straßenautos.
- **Schwelle**: `max(1.8 G, G + 18, 30)` m/s².
- **Getroffene Messung**: die horizontale Beschleunigung über der Schwelle *und* ein Sprung von mehr als der Hälfte von `G` gegenüber der vorherigen Messung; **oder** die Geschwindigkeit fällt innerhalb von 0,1 s um mehr, als die Schwelle in 0,1 s plus 1,5 m/s ergeben würde. Nur am Boden und eingeschwungen, und nur wenn das Auto schneller als 5 m/s war.
- Getroffene Messungen innerhalb von **0,4 s** sind ein Aufprall.
- **Vorher / nachher**: die höchste Geschwindigkeit in den 0,15 s davor; die niedrigste bis 0,3 s nach der letzten getroffenen Messung.
- **Kein Aufprall**: Geschwindigkeit verloren ohne dahinterliegende Kraft – die größte horizontale Beschleunigung innerhalb von 0,1 s unter dem größeren von `G` und 25 m/s² – ist das Spiel, das das Auto zurückspult oder zurücksetzt.
- **Unfall**, wenn er **30 km/h** oder mehr kostete oder das Auto unter die Hälfte seiner Geschwindigkeit brachte; sonst **Kontakt** – ein Stoß, ein Schleifen an einer Wand.
- **Richtung**: die Längsbeschleunigung größer als die Querbeschleunigung und negativ: *frontal*; positiv: *von hinten*; die Querbeschleunigung größer: *an der Seite entlang*. Ohne Beschleunigungen: frontal.

Was ein Auto leisten kann, wird mit allen Aufprällen herausgelassen gemessen, von 0,1 s davor bis 1 s danach (`struckMask`).

## Die Texte {#the-texts}

Jedes Ereignis wird mit beiden Runden genannt, mit Ort (Meter entlang der Referenz), der Geschwindigkeit, mit der es begann, wie weit über der Grenze gegenüber der anderen Runde, und einem Tipp. Der Tipp folgt aus der Art und dem, was gemessen wurde:

| Ereignis | Tipp |
|---|---|
| Blockieren, nur vorne | ein blockiertes Vorderrad kann nicht lenken: weniger Druck oben in der Zone, beim Einlenken abbauen |
| Blockieren, nur hinten | ein blockiertes Hinterrad lässt das Auto eindrehen: geradeaus mehr bremsen, beim Einlenken nachlassen; die Bremsbalance nach vorn verschieben, wenn es immer wieder passiert |
| Blockieren, loser Untergrund | ein blockiertes Rad pflügt weiter: bis kurz vor dem Blockieren dosieren |
| Blockieren, sonst | zu viel Pedal für den Grip: stufenweiser bremsen |
| Durchdrehen | Gas aufziehen, während die Lenkung sich löst; auf Traktionsgrenze früh hochschalten (auf losem Untergrund: ein höherer Gang macht das Drehmoment weicher) |
| Dreher / Übersteuern | nach dem Pedal: unter der Bremse (zu stark trail-gebremst, zu früh zurückgeschaltet), vom Gas (Lastwechsel-Übersteuern: gleichmäßiges Gas halten), am Gas (zu viel, solange noch eingeschlagen), keins davon (zu schnell eingelenkt); „mit Gegenlenkung eingefangen“, wenn gegengelenkt wurde; auf losem Untergrund oder bei einer Rallye: „ein gewisser Winkel ist der schnelle Weg – der Winkel der anderen Runde reichte“ |
| Untersteuern | mehr Lenkeinschlag bringt nichts, sobald der Bug weg ist: langsamer hineinfahren, etwas Bremse halten, um die Vorderachse zu belasten, dann ausdrehen; auf losem Untergrund das Auto mit einem Lupfer oder einem Tippen mit dem linken Fuß drehen |
| Kontakt / Unfall | an der Seite: ein Meter Abstand kostet weniger als das Schleifen; von hinten: ein anderes Auto oder Rückwärtsrutschen; ein frontaler Unfall: früher bremsen; ein Stoß vorne: ein Hindernis gestreift. „X hat dort auch getroffen.“ bei einem geteilten Ereignis |

In Trackmania sagt ein Rutschen zusätzlich: Unter etwa **400 km/h** (**300** auf losem Untergrund: Dreck, Gras, Plastik) gibt ein Rutschen weniger Vortrieb als Greifen; darüber bringt ein Speedslide im richtigen Winkel Gewinn, und dieser hier hat Zeit gekostet, weil sein Winkel nicht stimmte.

## Was jede Quelle erlaubt {#what-each-source-allows}

| Die Runden enthalten | Blockieren / Durchdrehen | Übersteuern / Dreher | Untersteuern |
|---|---|---|---|
| Schlupfverhältnis und Schlupfwinkel jedes Rades, Geschwindigkeitsvektor des Autos (Forza Data Out, die AC-Spiele) | aus dem Schlupf | aus dem Driftwinkel oder dem Schlupfwinkel hinten | aus den Schlupfwinkeln |
| Radgeschwindigkeiten, Weltgeschwindigkeit (Rallyespiele, BeamNG) | aus abgeleitetem Schlupf | aus dem abgeleiteten Driftwinkel | aus der Lenkung pro Krümmung |
| Gierung und Gierrate, kein Schlupf (iRacing) | - | aus dem Driftwinkel (die angepasste Gierung gegen die Fahrtrichtung); aus der Drehgeschwindigkeit mit Gegenlenkung nur, wenn der Gierung nicht zu trauen ist | aus der Lenkung pro Krümmung |
| nur Blickrichtung | - | aus Blickrichtung gegen Fahrtrichtung | aus der Lenkung pro Krümmung |
| FH-Companion-Rundendatei allein (ohne Gierung, ohne Schlupf) | - | - | aus der Lenkung pro Krümmung (sie hat Lenkung und Beschleunigungen) |

Treffer und Unfälle brauchen nur die Geschwindigkeit (besser mit Beschleunigungen), daher haben alle Quellen sie. Der Abschnitt **Fahrzeugkontrolle** zeigt, was jede Quelle erlaubt: Mit einer FH-Companion-Rundendatei allein sind es ihre Schiebebewegungen aus der Lenkung und ihre Treffer, und der Hinweis, die `.tele.gz` für den Rest zu laden.
