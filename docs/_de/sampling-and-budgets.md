---
title: "Abtastung und Budgets"
parent: "Interna des Renderings"
nav_order: 3
lang: "de"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---

# Abtastung und Budgets

Gibt es zu viele Punkte, um sie in einem Bild zu zeichnen, zeichnet der Viewer eine gleichmäßige Stichprobe und lässt jeden Punkt mehr zählen, damit das Bild stimmt. Ein Regler passt an, wie viele er zeichnet, damit der Viewer seine Bildrate hält.

## Bedienelemente des Leistungsbereichs {#performance-panel-controls}

| Regler | Standard | Bereich (Schrittweite) |
|---|---|---|
| **Jede Zeile in jedem Frame zeichnen** | an | |
| **Adaptives Budget** | an | |
| **Ziel-FPS** | 60 | 20-240 (1000) |
| **Start-Sprites / Frame** (adaptiv) oder **Sprites / Frame** | 4,00 Mio. | 65.536-268.435.456, logarithmisch (268.435.456) |
| **Heatmap-Auflösung** | 100 % | 25-100 %, multipliziert mit dem Skalierungsfaktor der adaptiven zweiten Stufe |
| **Progressive Verfeinerung** | an | Aus: jedes Bild ist eine neue Schätzung aus einem einzigen Bild (nützlich, um die rohe Stichprobe zu sehen). |

Siehe auch [Leistungsbereich und Statistik-Überlagerung](performance-and-stats.md).

## Für Entwickler {#for-developers}

### Kandidatenzeilen {#candidate-rows}

Zeilen werden in aufsteigender Zeit gespeichert. Das Zeitfenster der Zeitleiste [*lo*, *hi*] wird mit zwei binären Suchen über die Zeitspalte zu einem Zeilenbereich ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); ohne Zeitspalte ist jede Zeile ein Kandidat. Das sind die **Zeilen im Fenster** der Statistik-Überlagerung. Die Tests pro Zeile - Filter, Gruppen, Teilung, Culling, Schnitt, Lebensdauer - finden später im Shader statt; eine Zeile, die durchfällt, kostet einen Vertex-Aufruf und kein Fragment.

### Der Abtastplan {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) teilt den Kandidatenbereich in **Blöcke von 4.096 aufeinanderfolgenden Zeilen** und wählt aus dem Sprite-Budget des Bildes, wie viele gezeichnet werden:

- Deckt das Budget alle Blöcke ab, werden alle gezeichnet - das Bild ist genau.
- Sonst werden Blöcke in gleichmäßigem Abstand über den Bereich genommen, mit einem Versatz, der bei jedem Bild um den goldenen Schnitt weiterrückt, so dass aufeinanderfolgende Bilder verschiedene Blöcke abdecken und die Vereinigung sich gleichmäßig füllt. Das ist eine **geschichtete** Stichprobe: Jeder Teil des Zeitbereichs ist in jedem Bild vertreten.

Die Wärme jeder gezeichneten Zeile wird mit **Kandidaten / eingereicht** multipliziert, so dass die erwartete Wärme eines Bildes bei jedem Budget genau ist; nur das Rauschen hängt vom Budget ab. Zeilen liegen in Chunks von 8.388.608 (siehe [GPU-Speicherbelegung](gpu-memory.md)); ein Block wird geteilt, wo er einen Chunk überschreitet, und jeder Chunk bekommt die Liste der Blockanfänge, die er zeichnen muss.

Ein Plan kann höchstens 65.536 Blöcke tragen - 268.435.456 Sprites -, weil beide Backends einen festen Puffer mit 65.536 Plätzen für die Blockanfänge halten. Eine Anfrage nach mehr wird dort begrenzt, und der Fehlbetrag zeigt sich ehrlich als mehr Bilder bis zur Konvergenz.

### Jede Zeile in jedem Frame zeichnen {#draw-every-row-each-frame}

**Leistung → Jede Zeile in jedem Frame zeichnen** (Standard **an**): Das Budget wird zu einer Untergrenze statt einer Obergrenze, und ein Bild, das eine neue Schätzung beginnt, zeichnet jede Zeile, für die es zuständig ist (bis zur Grenze von 268 Mio.).

Der Grund: Eine Kamerabewegung verwirft die Akkumulation, also ist ein bewegtes Bild eine einzige Schätzung, deren Rauschen davon bestimmt wird, wie viel der Daten es gezeichnet hat - mit einem Viertel gezeichnet siehst du ein Viertel davon in hellen gewichteten Punkten, und genau das lässt eine bewegte Ansicht flimmern. Alles zu zeichnen macht jedes Bild zum fertigen Bild. Der Preis: Die Bildzeit folgt jetzt der Größe der Daten im Fenster; die Hebel sind ein engeres Zeitfenster, Filter oder ein Entfernungs-Culling, die die Kandidaten verringern, statt sie dünner abzutasten.

Schalte es auf Hardware aus, die das ganze Feld nicht auf einmal verkraftet: *Sprites / Frame* ist dann eine echte Grenze, und die Ansicht konvergiert über einige stehende Bilder.

Was ein voller Plan kostet, gemessen auf einer High-End-Desktop-Grafikkarte bei einer 4K-Leinwand mit einem großen Level, Sprites mit 1 m Radius (ein oder zwei Pixel): ungefähr 100 Mio. Sprites pro Bild bei 30 fps, 200 Mio. bei 15 fps, und das Maximum von 268 Mio. bei etwa 12 fps. Bei so kleinen Sprites ist die Vertex-Stufe die ganzen Kosten, und die Heatmap-Auflösung ändert nichts; bei großen Sprites ist das Füllen der Engpass: 8 Mio. Sprites mit 100 m Radius brauchten 2,5 s pro Bild bei voller Heatmap-Auflösung und 170 ms bei 25 %. **Jede Zeile in jedem Frame zeichnen** beginnt deshalb bei 67 Mio. und steigt bei jedem Bild um ein Viertel, solange Bilder unter 150 ms brauchen, und halbiert sich, wenn sie über 400 ms brauchen, damit eine schwere Ansicht kein Bild über das hinaustreibt, was der Watchdog der GPU erlaubt.

### Das adaptive Budget {#the-adaptive-budget}

**Leistung → Adaptives Budget** (Standard an) stellt das Sprite-Budget so ein, dass **Ziel-FPS** gehalten wird ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Es ruht im Box-Replay und während Videoaufnahmen.

Die Eingabe ist die Bildzeit, geglättet (90 % vorher + 10 % neu, wobei einzelne Bilder auf 2 s gedeckelt werden), gegen ein Ziel von 1000 / max(15, Ziel-FPS) ms.

**Stufe eins - Sprites.** Bei jedem Bild wird das Budget mit `1 + (Ziel / Bild - 1) × Verstärkung` multipliziert, mit einer Verstärkung von 0,35, wenn es zu langsam ist, und 0,08, wenn Reserve besteht; begrenzt auf einen Faktor von 0,5-1,25 pro Bild und auf 65.536-268.435.456 Sprites.

**Stufe zwei - Auflösung.** Nur wenn das Budget schon an seiner Untergrenze ist und Bilder immer noch mehr als 10 % zu langsam sind, sinkt die Auflösung des Wärmepuffers, um 8 % pro Bild, bis auf 25 % der Leinwand; sie erholt sich um 4 % pro Bild, solange 30 % Reserve bestehen. Die Kosten des Fragments fallen mit dem Quadrat der Auflösung, was unter einem weichen Verlauf kaum zu sehen ist. (Gemessen beim Software-Rendering mit 10 Mio. Zeilen und übergroßen Sprites: 141 ms → 17 ms pro Bild.) Der Maßstab wird auf Sechzehntel gerundet; die *Heat-Auflösung* der Überlagerung zeigt ihn.

**Aufgeben.** Ein langsames Bild sieht gleich aus, ob die Sprites es verursacht haben oder ein schweres Level - es gibt keine Zeitmessung pro Durchlauf. Sitzt das Budget an seiner Untergrenze und bleiben Bilder 30 Bilder lang unter 70 % des Ziels, waren nicht die Sprites die Kosten: Der Regler schaltet auf **Klettern** um, multipliziert das Budget alle 14 Bilder mit 1,5 und stellt die Auflösung wieder her, solange die Bildzeit innerhalb des 1,5-Fachen dessen bleibt, was sie an der Untergrenze war. Ein Klettern, das die Lage schlimmer macht als das, geht auf 60 % zurück und nimmt die normale Regelung wieder auf; das Erreichen des Ziels beendet das Klettern.

Bei ausgeschaltetem adaptiven Budget ist das Budget einfach **Sprites / Frame**.

Ist *Jede Zeile in jedem Frame zeichnen* an, läuft das adaptive Budget trotzdem weiter, aber die genaue Regel hebt das Budget an, bis alle Kandidatenzeilen abgedeckt sind; in der Praxis steuert es also nur die Auflösungsstufe und Bilder, die keine neue Schätzung beginnen.
