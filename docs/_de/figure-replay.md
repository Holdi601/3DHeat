---
title: "Figuren im Figuren-Overlay"
parent: "Figuren"
grand_parent: "Replay"
nav_order: 2
lang: "de"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figuren im Figuren-Overlay

Diese Seite handelt davon, die Boxen in kleine 3D-Figuren zu verwandeln, die zeigen, was jede Einheit wirklich war. Und von dem Rauch und Feuer, das Figuren hinterlassen. Die Steuerung der Wiedergabe selbst steht auf [Match-Wiedergabe](match-replay.md).

In der [Box-Wiedergabe](box-replay.md) und der Figuren-Wiedergabe des Tabs Match zeichnet **Figuren statt Boxen** (standardmäßig an) jede lebende Person als Figur dessen, was sie ist: ein Soldat zu Fuß, der Panzer, den jemand fährt, das Flugzeug, das eine Tacview-Spur ist. Die Figur hat die Farbe, den Platz und den Kurs der Box. Bei Flugzeugen und Raketen hat sie außerdem Nicken und, wenn die Daten eine Spalte Roll haben, die Schräglage. **Figurengröße** skaliert sie. 1-fach ist wahre Größe. Klicks auf eine Figur wirken wie Klicks auf ihre Box.

## Welche Figur {#which-figure}

Die Namens- und Typspalten der Daten entscheiden. Die vollen Regeln mit den Spaltennamen stehen auf [Figuren](figures.md#which-figure-a-unit-gets). Daten ohne eine der beiden Arten von Spalten sind Daten über Personen: Jeder ist ein Soldat.

Die Zuordnung wird je Bezeichnung zwischengespeichert. Ein Bild kostet deshalb nur noch das Platzieren. Eine Dateneinheit ist ein Meter, außer die Daten sagen, wie groß ein verfolgtes Objekt ist (der CS2-Export sagt, ein Spieler ist 32 Einheiten breit). Figuren werden entsprechend skaliert.

Ein optionales Paket eigener Figuren kann auf deinem Rechner Katalogfiguren ersetzen. Siehe [Figuren](figures.md#an-optional-local-figure-pack).

## Effekte {#effects}

Ereigniszeilen, die etwas eine Zeit lang zurücklassen, werden dort gezeichnet, wo sie passiert sind, solange es dauert. Die Farbe gehört dem, der sie verursacht hat: ein Rauch (etwa 18 s), ein Molotow oder Brandsatz (7 s), ein Blitz (etwa eine Sekunde) und eine Sprengladung (unter einer Sekunde), ein Täuschkörper (15 s), eine gelegte Bombe (40 s). Sie kommen aus einer Ereignisspalte (Event, Events), deren Bezeichnung `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` oder `plant` ist. Der CS2-Export schreibt sie bei der Detonation.

## Match-Wiedergabe: Tacviews Werkzeuge {#match-replay-tacviews-tools}

Kameras, Lesezeichen, die taktische Anzeige, Statistiken, Beschriftungen, **Lotlinien**, die Ereignisliste und das Diagrammfenster stehen auf [Match-Wiedergabe](match-replay.md). [Tacview-Parität](tacview-parity.md) listet jede Tacview-Funktion und sagt, wo sie steht.
