---
title: "Glossar"
nav_order: 21
lang: "de"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Glossar

Kurze Bedeutungen der Wörter, die diese Seiten benutzen, in einfacher Sprache. Jeder Eintrag verlinkt die Seite, die ihn ausführlich erklärt.

## Daten {#data}

**Zeile.** Eine Zeile deiner Daten: ein Ereignis an einem Ort und zu einer Zeit, zum Beispiel „Spieler 7 war hier bei Sekunde 12“. Der Viewer zeichnet jede Zeile. [Datenformate](data-formats.md)

**Spalte.** Eine Art von Wert in den Zeilen, etwa x, y, z, Zeit oder Team. Der Viewer rät, welche Spalte welche ist, und du kannst die Vermutung ändern. [Spaltenzuordnung](column-mapping.md)

**CSV.** Eine einfache Texttabelle: eine Zeile pro Zeile, Werte durch Kommas getrennt. Fast jedes Programm kann eine schreiben. [Dateien laden](loading-files.md)

**Parquet.** Eine kompakte Tabellendatei, die schnell zu lesen ist, auch bei Millionen Zeilen. Es ist das beste Format, das du dem Viewer geben kannst. [Dateien laden](loading-files.md)

**Ereignis.** Etwas, das passiert ist, etwa ein Schuss, ein Treffer, ein Abschuss oder ein Start. Eine Zeile kann ein Ereignis sein oder nur „ich war hier“. [Filter](filters.md)

**Person.** Wer die Zeilen erzeugt hat: ein Spieler, ein Pilot, ein Auto oder ein Panzer. Eine Person ist eine Linie von Positionen über die Zeit. [Sitzungen, Personen und Gruppen](sessions-persons-groups.md)

**Gruppe (Team).** Eine Menge von Personen, die in derselben Farbe gezeigt werden, zum Beispiel Blau und Rot. [Sitzungen, Personen und Gruppen](sessions-persons-groups.md)

**Session (Match, Runde).** Ein Durchlauf des Spiels. Ein Match oder eine Runde ist eine Session. Der Viewer kann eine Session zeigen oder viele übereinanderlegen. [Sitzungen, Personen und Gruppen](sessions-persons-groups.md)

**Level.** Die 3D-Karte, auf der die Daten stattfanden: Boden, Gebäude, Mauern. Zeilen erscheinen dort auf dem Level, wo sie passiert sind. [Levels und Hintergrundgeometrie](levels.md)

## Die Daten ansehen {#looking-at-the-data}

**Heatmap.** Ein Bild, in dem Orte, die viele Zeilen berühren, heller glühen. Kalte Orte sind ruhig, heiße Orte sind belebt. [Intensität](heat.md)

**Intensität.** Wie viel an einer Stelle passiert ist. Der Viewer addiert das Glühen jeder Zeile an jedem Ort; die Summe ist die Intensität. [Intensität](heat.md)

**Sprite.** Der kleine glühende Fleck, den der Viewer für eine Zeile zeichnet. Viele überlappende Sprites addieren sich zu Intensität. [Sprite-Form](sprite-shape.md)

**Belichtung.** Wie hell das Bild ist. Wie bei einer Kamera macht zu viel Belichtung alles weiß, und zu wenig verbirgt die Details. [Farbe und Belichtung](colour-and-exposure.md)

**Sättigung.** Die Menge Intensität, die als „so heiß, wie die Farben reichen“ gilt. Senke sie, damit ruhige Orte sichtbar werden; erhöhe sie, um nur das Heißeste zu sehen. [Farbe und Belichtung](colour-and-exposure.md)

**Volumen.** Ein Kasten oder eine Form, die du in die 3D-Ansicht setzt. Der Viewer zählt, was darin liegt, und kann Volumen miteinander vergleichen. [Volumen und Vergleich](volumes.md)

**Filter.** Eine Regel, die Zeilen ausblendet, die du nicht willst, zum Beispiel „nur Abschüsse“ oder „nur Team Rot“. [Filter](filters.md)

## Replay {#replay}

**Figur.** Ein kleines Modell eines Panzers, Flugzeugs, Autos oder Soldaten, das sich dorthin bewegt, wo die Daten sagen, dass es war. [Figuren](figures.md)

**LOD (Detailgrad).** Jede Figur hat eine detaillierte, eine einfachere und eine sehr einfache Version. Nahe Figuren nutzen die detaillierte, ferne die einfache, so dass Tausende auf einmal gezeichnet werden können. [Figuren](figures.md)

## Rennsport {#racing}

**Runde.** Eine Fahrt um die Strecke, von der Linie zurück zur Linie. [Runden laden](race-loading-laps.md)

**Referenzrunde.** Die Runde, mit der alle anderen verglichen werden. Unterschiede werden als „schneller“ oder „langsamer“ als sie angezeigt. [Runden laden](race-loading-laps.md)

**Scheitelpunkt.** Der Punkt einer Kurve, an dem das Auto der Innenkante am nächsten ist. [Analyse Kurve für Kurve](race-corner-analysis.md)

**Schlupf.** Wie stark ein Reifen rutscht. Ein wenig Schlupf gibt den meisten Grip; zu viel, und das Auto schleudert. [Rennanalyse: die Methode](race-analytics.md)

**Hüllkurve.** Was ein Auto bei jeder Geschwindigkeit kann: wie stark es lenken, bremsen und beschleunigen kann, bevor es rutscht. [Rennanalyse: die Methode](race-analytics.md)

## Flugzeugwerte {#aircraft-numbers}

**ALT.** Höhe: die Höhe über dem Boden oder dem Meeresspiegel. [Match-Replay](match-replay.md#labels-and-statistics)

**TAS.** Wahre Eigengeschwindigkeit: wie schnell sich ein Flugzeug durch die Luft bewegt. [Match-Replay](match-replay.md#labels-and-statistics)

## Computer {#computer}

**GPU.** Die Grafikkarte oder der Grafikchip. Sie zeichnet das Bild und ist beim Zeichnen von Millionen Flecken viel schneller als der Hauptprozessor. [Die beiden Backends](backends.md)

**WebGPU / WebGL2.** Die zwei Wege, auf denen ein Browser einer Seite die GPU zugänglich macht. WebGPU ist neuer. Der Viewer kann beide nutzen und wählt die beste, die dein Browser hat. [Die beiden Backends](backends.md)

## Counter-Strike-Begriffe {#counter-strike-words}

**Runde.** Ein kurzer Kampf innerhalb eines Matches. Eine Seite gewinnt ihn, und der Punktestand steigt um eins.

**Eco, Zwangskauf, Vollkauf.** Wie viel Geld eine Seite zu Beginn einer Runde für Waffen ausgibt. Ein Eco spart Geld und kauft fast nichts (im Schnitt unter 1.500 $ pro Spieler). Ein Zwangskauf gibt aus, was da ist (unter 4.000 $). Ein Vollkauf kauft alles, was geht. [Match-Analyse](match-analysis.md)

**Trade.** Ein Abschuss, der einen Abschuss ausgleicht: Du wirst erschossen, und ein Teamkamerad schießt deinen Mörder innerhalb von 5 Sekunden ab. [Match-Analyse](match-analysis.md)

**KAST.** Der Anteil der Runden, in denen ein Spieler einen Abschuss, einen Assist hatte, überlebte oder getradet wurde. Eine höhere Zahl heißt, dass der Spieler in mehr Runden geholfen hat. [Match-Analyse](match-analysis.md)

**ADR.** Durchschnittlicher Schaden pro Runde: wie viel Gesundheit ein Spieler pro Runde von Gegnern verloren hat. [Match-Analyse](match-analysis.md)
