---
title: "Kamera und Steuerung"
nav_order: 14
has_children: true
lang: "de"
source: "camera.md"
source_hash: "b578366d26ec"
translated: true
outdated: false
---

# Kamera und Steuerung

Du fliegst wie ein Vogel durch die Szene: **W A S D** zum Bewegen, mit der Maus ziehen, um umzusehen. Nutze diese Seite, um zu fliegen, zu einer Ansicht von oben oder von der Seite zu springen und genau abzulesen, wo die Kamera steht.

## In 4 Schritten fliegen {#fly-in-4-steps}

1. Klick einmal auf die Ansicht, damit sie die Tastatur hat.
2. Halte **W**, um nach vorn zu fliegen, **S** zurück, **A** und **D** seitwärts, **Space** nach oben, **Q** nach unten.
3. Halte die linke oder rechte Maustaste und zieh, um dich umzusehen.
4. Drücke **F**, um alle Daten wieder einzupassen.

Die Kamera ist eine freie Flugkamera mit Perspektive und Parallelprojektion, voreingestellten Ansichten, einer eingegebenen Pose und Tiefenschärfe. Ihre Einstellungen stehen im Bereich **Kamera & Szene** unten in der Seitenleiste (auch in den Tabs Rennanalyse und Match zu sehen). Die Umsetzung steht in [`camera.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/camera.ts).

## Fliegen {#flying}

| Eingabe | Wirkung |
|---|---|
| `W` `A` `S` `D` oder die Pfeiltasten | Vorwärts (entlang der Ansicht, mit ihrer Neigung), links, zurück, rechts |
| `Space` oder `E` | Nach oben (Welt oben) |
| `Q` oder linke `Ctrl` | Nach unten |
| `Shift` (gehalten) | 6-mal so schnell |
| linke `Alt` (gehalten) | 15 % Geschwindigkeit |
| Ziehen mit der linken oder rechten Maustaste | Umsehen. Der Zeiger ist beim Ziehen festgehalten. |
| Mausrad | Fluggeschwindigkeit ×1,5 je Raste (Perspektive); Zoom (parallel) |
| `F` | Die Daten einpassen |
| Klick (ohne Ziehen) | Zeigt, was unter dem Zeiger liegt ([Ansicht untersuchen](#inspecting-the-view)) |
| `C` | Kopiert Position, Gierwinkel und Nickwinkel der Kamera |
| `G` | Zu einem eingegebenen Punkt springen |
| `Esc` | Schließt die Auswahlkarte (und beendet das Folgen einer Einheit) |

### Beim Folgen einer Einheit {#while-following-a-unit}

Wenn die Kamera in einem Replay eine Einheit folgt ([Match-Replay](match-replay.md)), tun die Flugtasten etwas anderes:

| Eingabe | Wirkung |
|---|---|
| Mausrad, `W` / `S` | Näher an die Einheit / weiter weg (höher / tiefer in der Satellitenansicht) |
| `A` / `D`, `Q` / `E` | Um die Einheit kreisen (Verfolger- und Orbit-Ansicht) |
| Ziehen | Um die Einheit herumsehen (Cockpit: innerhalb umsehen) |
| `V` / `Shift+V` | Nächste / vorherige Kameraansicht |
| `Esc` | Zuerst aufhören, die zweite Einheit anzuschauen, dann aufhören zu folgen |

Bewegungstasten addieren sich mit einem [Gamepad](gamepad.md); alles Weitere steht in der [Tastaturreferenz](keyboard-reference.md). Tasten werden ignoriert, solange ein Textfeld oder eine Auswahlliste den Fokus hat. Die Neigung bleibt knapp unter senkrecht nach oben und unten begrenzt.

## Panel Kamera & Szene {#camera--scene-panel}

![Das Panel Kamera & Szene: Projektion, voreingestellte Ansichten, Schaltflächen für das Sichtfeld, Fluggeschwindigkeit und Pose](../assets/img/en/camera-panel.webp)

### Projektion {#projection}

**Projektion**: *Perspektive* (Standard) oder *Parallel*.

*Parallel* (orthografisch) entfernt die Verkürzung, daher wirken zwei Hotspots mit gleicher Dichte überall im Bild gleich groß – der Vergleich, für den eine Kartenheatmap da ist – und genau dadurch wird eine isometrische Ansicht isometrisch. Im Parallelmodus zoomt das Mausrad (es gibt keine Vorwärtsbewegung, die den Maßstab ändert), und die [Geschwindigkeitsanzeige](#fly-speed) ist ausgeblendet.

**Beim Wechseln bleibt das Objekt gleich groß.** Eine Parallelprojektion hat kein Sichtfeld, daher hat ihre Höhe des Sichtkegels nichts mit dem Abstand der Kamera zu tun; ein einfacher Wechsel zoomt entweder wild oder zeigt nichts. Beim Wechsel zu Parallel wird die Höhe des Sichtkegels auf das gesetzt, was die Perspektivkamera in der Fokusentfernung abdeckt (2 × Abstand × tan(Sichtfeld / 2); die Fokusentfernung ist der Abstand des letzten Einpassens). Beim Zurückwechseln kommt die Perspektivpose wieder, die du verlassen hast, im gleichen scheinbaren Maßstab, statt dort zu landen, wohin die Parallelansicht gewandert ist.

### Voreingestellte Ansichten {#preset-views}

| Gruppe | Schaltflächen | Ausrichtung |
|---|---|---|
| **Isometrisch** | **NO**, **NW**, **SO**, **SW** | Parallel, Neigung -35,264° (= atan(1/√2), der Winkel, bei dem sich alle drei Achsen gleich lang abbilden), Gierwinkel -45°, 45°, -135°, 135°. Vier Ecken, weil eine einzige immer die Hälfte der Karte hinter dem verbirgt, was näher liegt. |
| **Ansichten** | **Oben**, **Unten**, **Vorne**, **Hinten**, **Links**, **Rechts** | Parallel. Oben schaut senkrecht nach unten (Neigung -89,9°), Unten senkrecht nach oben, Vorne entlang -Z (Gierwinkel 0°), Hinten entlang +Z (180°), Links entlang -X (-90°), Rechts entlang +X (90°). |
| | **Zurück zur Perspektive** | Kehrt zur Perspektivpose zurück, die du verlassen hast. In der Perspektive deaktiviert. |
| | **Dreiviertelansicht** | Perspektive, Gierwinkel -35°, Neigung -28°. |

Jede Voreinstellung schaltet die Projektion selbst um – bei Perspektive konvergiert eine „Draufsicht“ noch zu einem Fluchtpunkt, und gleiche Flächen wirken nicht mehr gleich – und passt die Daten aus dieser Richtung ins Bild.

### Sichtfeld {#field-of-view}

**Sichtfeld** – der vertikale Winkel. Standard 65°, auf der Leiste 10–140° (179° mit dem Griff), mit den Schaltflächen **Flach 20°**, **Lang 35°**, **Normal 50°**, **Weit 65°**, **Sehr weit 90°**. Eng flacht die Perspektive ab und wirkt mehr wie eine Parallelprojektion; weit übertreibt die Tiefe und macht Abstände schwer abzuschätzen. Es bleibt im Parallelmodus aktiv, wo es den Maßstab setzt, auf den der Wechsel zurück rechnet, und den Abstand, den **Einpassen** nutzt.

### Fluggeschwindigkeit {#fly-speed}

**Fluggeschwindigkeit** – Welteinheiten (Meter) je Sekunde bei voller Fahrt. Standard 120; bei jedem Laden die horizontale Ausdehnung der Daten / 12. Logarithmisch, 0,02–20.000 (200.000 mit dem Griff; der Griff ändert sie um Verhältnisse, nicht um Beträge). Das Mausrad multipliziert oder dividiert sie je Raste mit 1,5, innerhalb von 0,02–200.000.

Derselbe Wert steht unten rechts in der Ansicht (nur Perspektive): die Geschwindigkeit in m/s oder km/s und die Zeit, die man bei dieser Geschwindigkeit braucht, um die Daten zu durchqueren (oder das Level, wenn ein 3D-Level geladen ist). Zieh ihn nach oben oder unten, um die Geschwindigkeit zu ändern.

### Nah und fern {#near-and-far}

**Nah** (Standard 0,5) und **Fern** (Standard 40.000) sind die Abstände für das Abschneiden. Beide werden bei jedem Laden aus den Daten neu berechnet (nah = max(0,05; Ausdehnung / 20.000), fern = Ausdehnung × 12) und von einem größeren 3D-Level nur erweitert, nie verengt ([Levels](levels.md#what-a-level-does-for-the-heat)). Ihr Verhältnis bestimmt die Tiefengenauigkeit, auf die sich Verdeckung stützt; ein winziges Nah mit einem riesigen Fern schwächt die [Verdeckung](depth-and-culling.md). Von außerhalb der Szene oder hoch über ihrem Boden gesehen, rückt die tatsächlich benutzte Nahebene auf 2 % dieses Abstands hinaus, damit eine von weit oben gesehene Karte genug Tiefengenauigkeit behält und Wasser und Ufer nicht flackern; das Feld zeigt weiterhin den eingestellten Wert.

### Weitere Einstellungen {#other-controls}

| Einstellung | Standard | Bedeutung |
|---|---|---|
| **Y invertieren** | aus | Kehrt das Umsehen mit der Maus nach oben/unten um. |
| **Tiefenschärfe** | aus | Siehe unten. |
| **Gamepad** | an | Siehe [Gamepad und HOTAS](gamepad.md). |
| **Pose** | | Siehe unten. |
| **Untersuchen** | | Die Anzeige der Kamera, Klick-zum-Auswählen, die Gierwinkel-Konvention und *Zu einem Punkt springen*; siehe [Ansicht untersuchen](#inspecting-the-view). |
| **Datensatz einpassen (F)** | | Passt die Daten (im Tab Rennanalyse: die Runden) in die Ansicht und behält die aktuelle Richtung. Die Kamera steht bei r / tan(Sichtfeld / 2) vom Mittelpunkt entfernt, wobei r die halbe Diagonale der Grenzen der Daten ist. |
| **Raster**, **Achsen** | an, an | Ein Bodenraster mit Abständen 1/2/5 × 10ⁿ von etwa 1/40 der Ausdehnung der Daten (reicht bis 1,5 × der Daten, zwischen 8 und 120 Rasterschritten) und farbige Achsen. |
| **Weltachse invertieren** X, Y, Z | aus | Siehe unten. |

### Pose {#pose}

Fünf Zahlenfelder – **X**, **Y**, **Z** sowie **Gierwinkel °**, **Nickwinkel °** –, die der Kamera folgen, solange keines davon den Fokus hat. Gib einen Wert ein und drück `Enter` (oder verlass das Feld), um die Kamera dorthin zu bewegen. **kopieren** legt `pos X Y Z · yaw A · pitch B` in die Zwischenablage (mit `(game yaw)` dahinter, wenn diese Konvention gewählt ist). Fliegen ist, wie du erkundest; Koordinaten sind, wie du eine Ansicht wiederholst. Es sind dieselben Zahlen wie in der [Kameraanzeige](#camera-readout): die eigenen Koordinaten der Daten, auch wenn eine Achse invertiert ist, und der Gierwinkel in der gewählten [Konvention](#yaw-conventions).

### Weltachse invertieren {#invert-world-axis}

**Weltachse X / Y / Z invertieren** zeichnet die Welt mit dieser Achse umgekehrt. Ein Spiel, das eine linkshändige Welt führt, erscheint in diesem rechtshändigen Viewer gespiegelt – Rechtskurven werden als Linkskurven gezeichnet –, und das Invertieren von X oder Z stellt es wieder her. **Nur die Zeichnung ändert sich**: die Daten, die Analyse und jede Koordinate, die die Werkzeuge zeigen (Pose, Lineal, Schnitt), bleiben die des Spiels. Die Ansicht dreht sich an Ort und Stelle, sodass du weiter auf dieselbe Stelle schaust. Diese Einstellung wird im Browser gemerkt (`localStorage`-Schlüssel `heat3d.mirror`); vergleiche die [Spiegelungen](axes-units-and-time.md#flips) beim Laden, die die Daten ändern.

## Ansicht untersuchen {#inspecting-the-view}

Wo die Kamera steht, was unter dem Zeiger liegt und das Springen zu einem Punkt – der Block **Untersuchen** des Panels Kamera & Szene und zwei Überlagerungen oben links in der Ansicht. Der Code steht in [`pose.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pose.ts), [`pick.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/pick.ts) und [`inspector.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/inspector.ts).

| Einstellung | Standard | Bedeutung |
|---|---|---|
| **Kameraposition über der Ansicht** | an | Die Anzeige der Kamera, unten. Auch mit ihrem **×** schließbar. |
| **Klick zeigt, was dort ist** | an | Klick-zum-Auswählen, unten. |
| **Gierwinkel-Konvention** | Viewer | Welcher Gierwinkel die Anzeige, die Posenfelder und das Sprungfeld zeigen und lesen. |

Diese drei werden im Browser gemerkt (`localStorage`-Schlüssel `heat3d.inspect`).

### Kameraanzeige {#camera-readout}

Oben links in der Ansicht: die **x**-, **y**-, **z**-, **Gierwinkel**- und **Nickwinkel**-Werte der Kamera, live, mit einem Schild, das die Gierwinkel-Konvention nennt. Sie zeigt dieselben Zahlen wie die Felder der [Pose](#pose) und kostet beim Fliegen nichts (sie wird im Takt des Frames auf die Seite geschrieben, ohne die Panels neu zu zeichnen).

- **kopieren** (oder `C` überall außerhalb eines Textfelds) legt `x X y Y z Z yaw A pitch B (viewer yaw)` in die Zwischenablage, mit `.` als Dezimalzeichen, egal welche Sprache eingestellt ist – eine Zeile, die das Sprungfeld und jedes Skript wieder einliest.
- **gehe zu** (oder `G`) öffnet darunter ein Feld: Füg einen Punkt ein und drück `Enter`, um ihn anzuschauen, oder füg eine ganze kopierte Pose ein, um in dieser Ansicht zu stehen. `Esc` schließt das Feld.

### Koordinaten: das eigene Bezugssystem der Daten {#coordinates-the-datas-own-frame}

Jede Koordinate, die die Untersuchungswerkzeuge zeigen oder annehmen, liegt im **eigenen Bezugssystem der geladenen Daten**: Die [Achsenzuordnung](axes-units-and-time.md) des Ladens (Hochachse, Spiegelungen, Maßstab) wird rückgängig gemacht. Eine Position, die man von der Ansicht abliest, ist die Zahl, die die Quelltabelle enthält, und eine Zahl aus der Tabelle, die man ins Sprungfeld tippt, landet genau an dieser Stelle. Wenn die Zuordnung nichts ändert (ein Laden mit Y oben und ohne Maßstab – so schreiben es die Aufnahmewerkzeuge und die Level-Exporter), ist das einfach die Welt; sonst trägt die Anzeige eine Marke **Datenbezugssystem**. Ohne Datensatz sind die Koordinaten Weltkoordinaten. Gierwinkel und Nickwinkel beziehen sich immer auf die Welt des Viewers, Y oben.

### Gierwinkel-Konventionen {#yaw-conventions}

| Konvention | Gierwinkel 0° schaut entlang | Wächst hin zu | Verwendet von |
|---|---|---|---|
| **Viewer** | -Z | -X | die freie Flugkamera, [voreingestellte Ansichten](#preset-views) |
| **Spiel / Aufnahmewerkzeuge** | +X | -Z | die Spalten `yaw` und die Posen der Aufnahmewerkzeuge; in einem Level, das im Bezugssystem des Viewers exportiert wurde, der eigene Gierwinkel des Spiels |

Die Neigung ist in beiden gleich: nach oben von der Waagerechten. Die beiden unterscheiden sich um eine Vierteldrehung und sonst nichts:

> Viewer-Gierwinkel = Spiel-Gierwinkel - 90°

Eine Richtung `d` ist `(cos p · cos y, sin p, -cos p · sin y)` in der Spielkonvention und `(-sin y · cos p, sin p, -cos y · cos p)` in der des Viewers. Wähle **Spiel / Aufnahmewerkzeuge**, um einen Gierwinkel direkt aus einer Aufnahmetabelle einzutippen oder die Anzeige mit einer solchen zu vergleichen.

### Zu einem Punkt springen {#going-to-a-point}

**Zu einem Punkt springen**, im Block Untersuchen (und im Feld **gehe zu** der Anzeige):

- das Textfeld nimmt `x, y, z` oder `x y z` (oder `x; y; z`), mit Dezimalpunkt oder Dezimalkomma – `-321.6, 137.8, -59.9` und `-321,6 137,8 -59,9` sind derselbe Punkt. Fünf Zahlen fügen einen Gierwinkel und eine Neigung hinzu, und eine Pose, die aus der Anzeige oder den Posenfeldern kopiert wurde, wird ganz gelesen, mit Beschriftungen und Konvention;
- **Gierwinkel °** und **Nickwinkel °** (optional) drehen die Kamera in der gewählten Konvention;
- **Anschauen** behält die Blickrichtung (wird um mindestens 20° nach unten gekippt, wenn sie waagerecht war) und geht entlang dieser Richtung auf den aktuellen Abstand zurück, gehalten zwischen 0,3 % und 3 % der Breite der Szene – 6 bis 60 m auf einem zwei Kilometer großen Level. Fokusentfernung, Höhe der Parallelansicht und Fluggeschwindigkeit folgen, damit die Ansicht brauchbar ankommt;
- **Hier stehen** stellt die Kamera auf den Punkt, gedreht nach dem angegebenen Gierwinkel und der Neigung, oder so, wie sie war.

Eine eingefügte Pose mit eigenem Gierwinkel und eigener Neigung steht immer in dieser Ansicht.

### Klick-zum-Auswählen {#click-to-pick}

Ein Klick auf die Ansicht – drücken und loslassen, ohne mehr als 4 Pixel zu ziehen; ein Ziehen sieht sich nur um – zeigt oben links eine Karte mit dem, was unter dem Zeiger liegt. Solange das [Lineal](measure.md) an ist, gehen Klicks an das Lineal.

**Ein gezeichneter Datenpunkt gewinnt.** Der nächste Messwert innerhalb von 8 Pixeln um den Klick, unter denen, die tatsächlich gezeichnet sind: die Zeilen im Zeitfenster und in der Lebensdauer, die die [Filter](filters.md) passieren, die gezeigten Gruppen und die Aufteilung nach Differenz, innerhalb des Abstandsabschnitts und eines Schnitts, der die Heatmap beschneidet. Im Box-Replay eine Box unter dem Zeiger (überall auf ihr). Die Karte listet jede Spalte der Zeile auf, unter den eigenen Spaltennamen der Quelle – Zeit (Uhrzeit oder die eigenen Sekunden der Datei mit `m:ss.ss`), Person, Gruppe, Sitzung, jede behaltene Spalte, die Position und die Blickrichtung – und den Abstand von der Kamera. Im Speicher sind nur Spalten, die das Laden behalten hat: Eine Spalte, die nicht als [Filterspalte](column-mapping.md) gewählt wurde, wird nicht gezeigt.

**Sonst die Oberfläche des Levels**: der Punkt, an dem der Strahl des Klicks die echten Dreiecke des Levels trifft (nicht die Bezugsebene des Lineals), mit dem **Teil**, zu dem er gehört (der Name aus dem Exporter, `structure:props`, `ground:terrain …`), seiner **Art** (Boden, Struktur, Wasser, Kartenbild), den Koordinaten und dem Abstand. Geometrie, die von einem Schnitt oder dem Abstandsabschnitt verborgen wird, wird durchgereicht. Wo das Level ein [Navigationsnetz](model-levels.md#navigation-meshes) hat, nennt eine Zeile es und sagt, ob die Stelle darauf liegt (✓). Ein Teilname mit `≈` davor wurde aus den Begrenzungsrahmen der Teile geschätzt, weil dieser Teil des Levels beim Laden vereinfacht wurde.

Die Karte bleibt, bis sie geschlossen wird (**×**, `Esc`), ein weiterer Klick etwas anderes beantwortet oder ein Klick ins Leere erfolgt. An dem Punkt wird in der Szene ein cyanfarbenes Kreuz gezeichnet und auf dem Bildschirm ein Ring darum. Ihre Schaltflächen: **kopieren** (jeder Wert, und die Koordinaten als `x, y, z`), **Anschauen** und **Hier stehen** (bei einem Datenpunkt, mit Blick in die Richtung, in die die Zeile sah, wenn sie eine Blickrichtung hat; bei einer Oberfläche 1,7 m darüber).

Das Level wird beim ersten Klick, der es braucht, für das Auswählen indexiert: ein Gitter aus Spalten über seiner Grundfläche, in Stücken von wenigen Millisekunden zwischen den Frames gebaut, damit die Ansicht nie stehen bleibt (etwa eine Sekunde Arbeit für ein Level mit mehreren Millionen Dreiecken), und gehalten, bis sich das Level ändert. Bis dahin sagt die Karte *Level für die Auswahl vorbereiten* mit einem Prozentwert und beantwortet den Klick, sobald es bereit ist. Eine Suche nach Datenpunkten über mehr als vier Millionen gezeichneter Zeilen wird ebenso über Frames verteilt.

## Tiefenschärfe {#depth-of-field}

Ein einklappbarer Abschnitt in Kamera & Szene, mit dem Titel *Tiefenschärfe – an*, solange er aktiv ist. Standardmäßig aus: Es ist ein Darstellungseffekt, und die Standardansicht soll die Daten zeigen, nicht eine Deutung davon.

| Einstellung | Standard | Bereich (Leiste) | Bedeutung |
|---|---|---|---|
| **Aktiviert** | aus | | |
| **Auf das Eingepasste fokussieren** | an | | Fokus auf der Entfernung, die das letzte Einpassen benutzte (*Fokus auf N m.*). |
| **Fokusentfernung** | 1000 | 1–200.000, logarithmisch (10.000.000) | Angezeigt, wenn der Fokus von Hand gesetzt ist. |
| **Blende** | ±35 % | ±2 % bis ±200 %, logarithmisch (±3200 %) | Die scharf gehaltene Tiefe als Anteil der Fokusentfernung – relativ statt als Blendenzahl, weil Szenen von einem Raum bis zu einer Karte von acht Kilometern reichen. |
| **Maximale Unschärfe** | 12 px | 1–48 (256) | Der größte Unschärferadius; der Aufwand wächst mit ihm. |

Sie macht **Level, Raster und Boxen** unscharf – *nicht die Heatmap*. Die Heat an einem Pixel ist die Summe von Sprites in vielen Tiefen, daher hat sie keine einzelne Tiefe, in der sie unscharf sein könnte; sie mit dem Geometrieteil dahinter weichzeichnen wäre falsch, wo sie davor schwebt. Scharfe Daten vor weichem Kontext sind außerdem der nützlichere der beiden Fälle. Die Unschärfe ist ein Abtasten mit 24 Stichproben im Goldenen Winkel im Kompositionsdurchgang, gewichtet, damit ein scharfer Vordergrund nicht vom unscharfen Hintergrund dahinter nach außen verschmiert wird. Eine Änderung zeichnet neu, ohne die Akkumulation der Heat neu zu starten.

## Auflösung der Zeichenfläche {#canvas-resolution}

Die Zeichenfläche wird mit dem Pixelverhältnis des Bildschirms gerendert, begrenzt auf 2. Der Heat-Puffer darf mit einer niedrigeren Auflösung als diese gerendert werden ([Heat-Auflösung](performance-and-stats.md)).

## Seiten in diesem Abschnitt {#pages-in-this-section}

- [Gamepad und HOTAS](gamepad.md)
- [Tastatur- und Mausreferenz](keyboard-reference.md)
