---
title: "Taktik-Tafel"
nav_order: 15
has_children: true
lang: "de"
source: "tactics-board.md"
source_hash: "09172046f5ac"
translated: true
outdated: false
---

# Taktik-Tafel

Der Tab **Taktik** ist eine Zeichentafel für einen Teamplan: Du setzt kleine Figuren auf eine Karte, zeichnest Pfeile dafür, wohin sie gehen, und drückst auf Abspielen, um zu sehen, wie es abläuft. Nutze ihn, um eine Runde oder einen Angriff zu planen, bevor du spielst. Er teilt sich Zeichenfläche, Kamera und das [Level](levels.md) mit den anderen Tabs und sonst nichts; ein Plan sind keine Daten und zeichnet keine Intensität.

## Dein erster Plan {#your-first-plan}

1. Öffne den Tab **Taktik**. Wähle das **Spiel** (zum Beispiel Counter-Strike 2) und drücke bei Valorant **Valorant-Karten laden** und wähle eine **Karte**. Oder lade zuerst ein [Level](levels.md).
2. Wähle eine **Seite** (sie legt die Farbe fest) und drücke **Draufsicht**.
3. Wähle **Ort**, wähle eine Figur unter **Figuren** (mit **Figuren suchen** findest du eine) und klicke auf die Karte. Setze zwei oder drei.
4. Wähle **Pfeil**, klicke auf eine Figur, klicke den Weg entlang, den sie gehen soll, und drücke **Enter**, um den Pfeil zu beenden.
5. Drücke **+** unter der Ansicht, um Schritt 2 hinzuzufügen. Jede Figur beginnt dort, wo ihr Pfeil endete. Zeichne dort weitere Pfeile.
6. Drücke **▶** (oder `K`), um den Plan ab dem gezeigten Schritt bis zum Ende abzuspielen.
7. Gib dem Plan unter **Name des Plans** einen Namen und drücke **Speichern**.

![Der Tab Taktik in der Draufsicht: Spiel, Seiten und Werkzeuge links, drei Figuren mit Bewegungspfeilen, ein Wurfbogen für Rauch, eine Fläche und unten die Schritte](../assets/img/en/tactics.webp)

## Einen Plan beginnen {#starting-a-plan}

| Regler | Was er tut |
|---|---|
| **Spiel** | Wählt die Seiten und die Figuren, die die Palette anbietet: Counter-Strike 2 (T, CT; Spieler und Hilfsmittel), Valorant (Angriff, Verteidigung; Spieler und allgemeine Fähigkeiten), Battlefield, Squad, Arma (Infanterie, Bodenfahrzeuge, Luftfahrzeuge, Boote), DCS / War Thunder / IL-2 (Jets, Propellerflugzeuge, Hubschrauber, Luftverteidigung, Boden, Schiffe, Waffen) und Sonstiges. Ein Plan, der schon Figuren hat, behält seine Seiten, wenn sich das Spiel ändert. |
| **Name des Plans** | Der Name, unter dem der Plan gespeichert wird. |
| **Karte**, **Valorant-Karten laden** | Bei gewähltem Valorant: **Valorant-Karten laden** holt die Liste der Karten von [valorant-api.com](https://valorant-api.com); **Karte** legt dann die Minikarte der gewählten Karte als Level hin, von oben gerahmt. Das Bild wird beim Wählen geholt und nie mitgeliefert. Riots Hinweis wird gezeigt, solange er auf dem Bildschirm ist (siehe unten). |
| **Seite** | Die Seite, zu der die nächste Figur, der nächste Pfeil oder die nächste Fläche gehört; sie nimmt die Farbe der Seite an. |

Ohne Level ist die Tafel die flache Bodenebene. Lade unter **Level** ein Level, um auf einer echten Karte zu planen: eine CS2-Karte aus dem CS2-Werkzeug, ein Level aus der Bibliothek oder ein Kartenbild.

## Werkzeuge {#tools}

| Werkzeug | Klick | Hinweise |
|---|---|---|
| **Auswählen** | Eine Figur, ein Wegpunkt, ein Pfeil, eine Fläche oder eine Notiz wählt sie aus. | Umschalt+Klick fügt hinzu oder entfernt; Umschalt+Ziehen zieht einen Rahmen um das, was hinzukommt. Die Auswahl bekommt einen Transformationsgriff (siehe unten); `Entf` oder `Rücktaste` entfernt sie. `M` verschiebt die gewählte Figur zum nächsten Klick. |
| **Ort** | Setzt die gewählte Figur ab. | Eine Figur wird in der Palette **Figuren** gewählt (mit **Figuren suchen**). Ohne Auswahl dreht `R` die nächste Figur um 15° vor dem Setzen (`Umschalt+R` in die andere Richtung). |
| **Pfeil** | Jeder Klick setzt einen Punkt; Enter, ein Doppelklick oder ein Rechtsklick beendet ihn, Esc verwirft ihn. | **Verschieben**, **Angriff** (breiterer Kopf) oder **Beobachten** (eine dünne Linie in Augenhöhe). Ein Pfeil, der auf einer Figur beginnt, ist die Route dieser Figur in diesem Schritt: Beim Abspielen geht die Figur sie ab, und der nächste Schritt beginnt, wo sie endete. |
| **Wurf** | Der Werfer, dann wo es landet. | Ein gestrichelter Bogen vom einen zum anderen, und das gewählte Hilfsmittel (Rauch, Blendgranate, Molotow ...) erscheint dort, wo es landet, und bleibt von diesem Schritt an. |
| **Fläche** | Die Mitte, dann der Rand. | Eine Scheibe in der Farbe der Seite. |
| **Notiz** | Wo die Notiz hinkommt; fragt nach ihrem Text. | Als Stecknadel gezeigt, ihr Text darüber. |
| **Löschen** | Eine Figur, ein Pfeil, eine Fläche oder eine Notiz. | Entfernt sie von diesem Schritt an; im ersten Schritt entfernt es sie ganz. |

**Rückgängig** und **Wiederholen** (`Strg+Z`; `Strg+Y` oder `Strg+Umschalt+Z`) gehen durch jede Änderung. Eine Zeile unter dem Plan zeigt, wie viele Figuren, Pfeile und Schritte er hat. **Draufsicht** schaut senkrecht hinab (orthografisch), **3D-Ansicht** kehrt zur Perspektive zurück, **Frame** passt den Plan ein, oder das Level, wenn der Plan leer ist.

**Figurengröße** skaliert jede Figur auf der Tafel; 1× ist wahre Größe, was aus großer Höhe für einen Menschen wenige Pixel sind.

## Verschieben, Drehen und Skalieren {#moving-turning-and-scaling}

Alles auf der Tafel lässt sich wie in einem 3D-Editor bewegen: Figuren, Hilfsmittel, Marker, einzelne Wegpunkte und ganze Pfeile, Flächen und Notizen. Was ausgewählt ist, bekommt in seiner Mitte einen Griff:

| Modus | Tasten | Griffe |
|---|---|---|
| **Verschieben** | W (oder G) | Ein Pfeil pro Achse (X rot, Y grün und nach oben, Z blau) bewegt entlang ihr; ein Quadrat bewegt in seiner Ebene; die Mitte bewegt über das Level unter dem Zeiger. |
| **Drehen** | E (oder R) | Ein Ring pro Achse dreht um sie. Die Ringe einer einzelnen Figur sind ihr eigener Gier-, Nick- und Rollwinkel; eine Gruppe dreht um die Achsen der Welt um ihre Mitte. |
| **Skalieren** | R (oder S) | Spreizt oder sammelt die Auswahl von ihrer Mitte aus entlang einer Achse oder in alle Richtungen; der Radius einer Fläche wächst mit. |

**Tasten** schaltet zwischen W / E / R (Unity, Unreal) und G / R / S (Blender) um; die Tasten wählen den Modus nur, wenn etwas ausgewählt ist, und fliegen sonst mit der Kamera. Also heißt `R` **Skalieren** mit den Tasten W / E / R und **Drehen** mit den Tasten G / R / S, wenn etwas ausgewählt ist, und es dreht die nächste Figur zum Setzen, wenn nichts ausgewählt ist. Alle Tasten der Tafel stehen in der [Tastatur- und Mausreferenz](keyboard-reference.md#tactics-board). Halte **Strg** beim Ziehen, um eine Verschiebung am **Raster** (Meter) oder eine Drehung am **Winkelschritt** einrasten zu lassen. **Am Boden einrasten** (standardmäßig an) setzt bewegte Personen, Fahrzeuge, Marker, Wegpunkte und Flächen auf die Oberfläche des Levels; Luftfahrzeuge und Hubschrauber behalten ihre Höhe, und ein Ziehen entlang des Y-Pfeils rastet nie ein. Ein Ziehen am Griff bewegt nie die Kamera. **Esc** bricht ein Ziehen ab, und jede Änderung ist ein Schritt von Rückgängig.

Wegpunkte erscheinen als Punkte auf den Pfeilen des gezeigten Schritts: Klicke einen an, um ihn zu wählen, ziehe ihn, um ihn zu verschieben, und `Entf`, um ihn zu entfernen. Der Abschnitt **Gewählte** zeigt den Ort der Auswahl in Metern, Gier, Nick und Roll einer Figur in Grad und den Radius einer Fläche, jeweils zum Eintippen.

## Zeitnahme {#timing}

Die Route einer Figur ist zeitlich festgelegt: Jedes Segment braucht seine Länge über das Level – auf der Oberfläche etwa alle zwei Meter abgetastet, sodass ein Hügel oder eine Treppe zwischen zwei Punkten zählt – mit dem Tempo ihres Bewegungs**modus** für diese Figur in diesem Spiel, plus jede **Wartezeit** an einem Wegpunkt. Infanterie kriecht, duckt sich, geht (leise), läuft oder sprintet; Fahrzeuge und Boote kriechen, fahren vorsichtig, normal oder hetzen; Luftfahrzeuge und Hubschrauber fliegen langsam, Reisegeschwindigkeit, Kampfgeschwindigkeit oder maximal. Ein Modus, den das Spiel nicht hat (CS2 kennt kein Sprinten), nimmt den nächsten, den es hat. Wie ein Hang bremst, hängt vom Spiel ab: In CS2 und Valorant zählt nur die horizontale Strecke, wie im Spiel; Militärsimulationen bremsen Infanterie bergauf (Toblers Wanderfunktion) und Fahrzeuge nach Steigung.

Die Geschwindigkeiten stammen aus Tabellen je Spiel mit ihren Quellen (siehe [Bewegungsgeschwindigkeiten](tactics-speeds.md)): CS2 nach der getragenen Waffe, aus den Waffendefinitionen des Spiels; Valorant nach Waffe; Battlefield, Squad, Arma und die Luftspiele nach Fahrzeugtyp und -klasse. **Bewegt sich als** wählt das Profil einer Figur (eine Waffe, ein Fahrzeugtyp); **Eigene (m/s)** überschreibt jeden Modus für diese Figur. Die Modi heißen so, wie die Tafel sie zeigt: *Kriechen*, *Ducken*, *Gehen (leise)*, *Laufen*, *Sprinten*; *Vorsichtig*, *Normal*, *Hetzen*; *Langsam*, *Reisen*, *Kampf*, *Maximal*.

Jeder Wegpunkt zeigt die Zeit seit dem vorherigen und die Zeit seit dem Start des Plans („+3,9 s · 0:12“). Die Route der gewählten Figur listet jedes Segment mit seinem Modus, seiner Länge und Zeit, die Wartezeit und die Ankunft. **Ankünfte** unter **Zeitnahme** setzt jede Figur mit Route auf eine Zeitlinie, die erste Ankunft oben. Mit **In Echtzeit abspielen** (standardmäßig an) dauert ein Schritt, bis seine langsamste Route ankommt, und jede Figur bewegt sich mit ihrer eigenen Geschwindigkeit; **Sekunden** ist dann die kürzeste Länge des Schritts. **Leveleinheiten pro Meter** sagt, was das Level in Einheiten ist: 39,37 für CS2-Karten (Spieleinheiten), 1 für Karten in Metern.

## Mit Matchdaten vergleichen {#compare-with-match-data}

**Match-Dateien laden…** liest CS2-Matchtabellen der Karte (die Parquet-Dateien des CS2-Werkzeugs, so viele wie gewünscht; nur die nötigen Spalten, im Hintergrund); **Geladene Daten nutzen** übernimmt die Daten, die im Viewer geladen sind. Dann:

- **Früheste Ankunft auf der Karte** färbt die Karte nach der Zeit seit Rundenbeginn, zu der ein Spieler jeden Ort zuerst erreichte – die Schaltfläche **Schnellste** zeigt die Schnellste über alle Runden, **Typisch (Median)** die mittlere Runde – von Grün früh bis Rot spät, für eine Seite oder beide. Es zeigt, was wann möglich ist.
- Die gewählte Route wird mit dem verglichen, was Spieler vom Start (oder vom Rundenbeginn) bis zu ihrem Ende erreichten, jedes Ende ist eine Scheibe mit dem eingestellten Radius: „Schnellste beobachtet 14,2 s, p10 15,0 s, Median 18,3 s über 41 Läufe; dein Plan 15,1 s“.
- Die Geschwindigkeiten, mit denen sich Spieler wirklich bewegten – Laufen, Gehen, Ducken, aus den Geh- und Duck-Spalten der Tabellen – in m/s.

## Schritte {#steps}

Die Leiste unter der Ansicht enthält die Schritte. Ein Plan beginnt mit einem; **+** fügt einen hinzu, und jede Figur beginnt dort, wo ihre Route im letzten Schritt endete; **−** entfernt den gezeigten. **Sekunden** ist, wie lange der gezeigte Schritt beim Abspielen dauert. **▶** (K) spielt ab dem gezeigten Schritt bis zum Ende: Figuren mit Route gehen sie ab, Figuren, die im nächsten Schritt an einen neuen Ort bewegt wurden, gleiten dorthin, die übrigen stehen. Während ein Schritt gezeigt wird, ist der Ort jeder Figur im nächsten Schritt als blasser Geist gezeichnet, und die Pfeile des letzten Schritts liegen schwach unter denen dieses Schritts.

## Speichern {#saving}

Der Abschnitt **Datei** enthält **Speichern**, **Open** und **Leeren**. **Speichern** schreibt den Plan als `<name>.h3dplan.json` (einfaches JSON: Seiten, Schritte, Figuren mit einem Ort pro Schritt, Pfeile, Flächen, Notizen); **Open** liest einen zurück. Eine Datei einer anderen Version oder eine, die kein Plan ist, wird mit dem Grund abgelehnt. **Leeren** leert den Plan; Rückgängig holt ihn zurück.

## Figuren {#figures}

Jede Figur baut der Viewer selbst: einfache Formen in der veröffentlichten Größe eines Typs, mit den Merkmalen, die sie von ihren Nachbarn unterscheiden – die Laufrollen und der Turm eines Panzers, die Geschütze, Raketen und Radare eines Luftverteidigungsfahrzeugs, der Flügelgrundriss, Leitwerk und Triebwerke eines Flugzeugs, Rotoren und Stummelflügel eines Hubschraubers. Nichts wird aus einem Spiel übernommen. Ein Design, das ein Spiel erfunden hat, wird als generische Figur seiner Klasse gezeigt. Wie Daten zu ihrer Figur finden, steht unter [Figuren](figures.md#which-figure-a-unit-gets).

## Riots Hinweis {#riots-notice}

Valorant-Karten werden unter Riot Games' Richtlinie „Legal Jibber Jabber“ gezeigt, die freie Community-Projekte erlaubt, sie zu nutzen, und diesen Hinweis überall verlangt, wo sie erscheinen: *3DHeat was created under Riot Games' „Legal Jibber Jabber“ policy using assets owned by Riot Games. Riot Games does not endorse or sponsor this project.* Die Fähigkeiten auf der Tafel sind generische Formen, nicht Riots Grafik.
