---
title: "Differenz"
parent: "Intensitätsmodi"
nav_order: 5
lang: "de"
source: "difference.md"
source_hash: "19f40abd7f5a"
translated: true
outdated: true
---

# Differenz

Rot, wo Team A mehr war, grünblau, wo Team B mehr war, nichts, wo beide gleich waren.

**Differenz** (Taste 2) ist Intensität mit Vorzeichen. Zeilen der einen Gruppe addieren Intensität; Zeilen der anderen ziehen sie ab. Wo sich beide gleichmäßig überlagern, ist das Ergebnis null und ganz transparent; wo eine Seite überwiegt, zeigt es sich in deren Farben – standardmäßig warm (transparent → rot → gelb → weiß) für die **+**-Seite und kühl (transparent → grün → blau → lila) für die **−**-Seite.

![Differenz-Intensität: rot, wo die +-Seite mehr war, grün und blau, wo die −-Seite mehr war](../assets/img/de/difference-split.webp)

## So benutzt du es {#how-to-use-it}

1. Drücke `2` (oder wähle **Differenz** in der Modusleiste).
2. Öffne **Differenz-Aufteilung** in der Seitenleiste.
3. Wähle bei **Aufteilen nach** meist *Gruppen*.
4. Lege eine Gruppe (oder einen Wert) auf **+** und eine andere auf **−**.
5. Lies die Farben: Warm heißt die +-Seite, kühl heißt die −-Seite. Das Panel warnt, wenn eine Seite keine Zeilen hat (siehe [Meldungen, die du sehen kannst](#messages-you-may-see)).

*Welche* zwei Gruppen verglichen werden, ist die ganze Frage. Daher kann die Aufteilung jede behaltene Spalte nutzen, nicht nur Gruppen. Zeilen, die auf **keiner** Seite liegen, werden **weggelassen**, nicht als null gezählt: Dadurch vergleicht eine Aufteilung über zwei von vielen Werten genau diese beiden, und sie lässt sich mit den [Filtern](filters.md) kombinieren – filtere auf eine Karte und teile das dann nach Version.

Der Modus braucht zwei Seiten: eine Gruppenspalte mit mindestens zwei Gruppen oder eine Aufteilung über eine Spalte, die zum Filtern behalten wurde. Bei Daten mit weniger als zwei Gruppen startet ein Laden mit einer Spaltenaufteilung – zuerst die Spalte *Quelldatei* eines Ladens aus mehreren Dateien, sonst die erste Kategoriespalte mit zwei Werten, sonst die erste Zahlenspalte mit einer Spanne –, damit *zwei Ladevorgänge vergleichen* auch bei Daten ohne Gruppen funktioniert. Nur Daten ganz ohne diese Möglichkeiten machen den Modus unverfügbar; das gilt auch für eine Spaltenaufteilung, bei der eine Seite leer bleibt.

## Das Panel Differenz-Aufteilung {#the-difference-split-panel}

Es wird im Modus Differenz unter den Intensitäts-Panels angezeigt.

**Aufteilen nach** bietet:

| Option | Angezeigt als | Aufteilungsregel |
|---|---|---|
| Gruppen | *Gruppe (N)* (wenn eine Gruppenspalte da ist) | Jede Gruppe auf +, − oder keiner Seite, eingestellt in der [Teamliste](teams-list.md) |
| Eine Kategoriespalte | *Spalte (N Werte)* | Werte auf +, − oder keiner Seite |
| Eine Zahlenspalte | *Spalte (numerisch)* | Ein Wertebereich für jede Seite |
| Die Herkunftsdatei | *Quelldatei – zwei Ladevorgänge vergleichen* (wenn mehrere Dateien geladen wurden) | Dateien auf +, − oder keiner Seite |

Angeboten werden nur Spalten, die beim Laden unter *Zum Filtern behalten* markiert wurden.

### Anteile statt Anzahlen vergleichen {#compare-shares-not-counts}

**Anteile statt Anzahlen vergleichen** (Voreinstellung aus) gewichtet jede Seite mit eins durch ihre eigene Zeilenzahl, sodass eine Seite mit fünfmal so vielen Zeilen nicht allein durch die Menge gewinnt. Die Farbe zeigt dann, wo jede Seite im Verhältnis häufiger ist als die andere. Nutze das, wenn die beiden Seiten sehr unterschiedlich viele Daten haben, zum Beispiel zwei Sitzungen unterschiedlicher Länge.

### Meldungen, die du sehen kannst {#messages-you-may-see}

Das Panel warnt, wenn das Bild keine echte Differenz ist:

| Meldung | Bedeutung |
|---|---|
| *N + / M −* (oder *N + / M − / K ungenutzt*) | Wie viele Werte auf jeder Seite liegen (und auf keiner). |
| Keine Zeile im Fenster liegt auf der **+**-Seite | Nur die **−**-Seite wird gezeichnet. Verschiebe das Zeitleistenfenster oder ändere die Aufteilung. |
| Keine Zeile im Fenster liegt auf der **−**-Seite | Nur die **+**-Seite wird gezeichnet. |
| Kein Wert liegt auf einer Seite | Die Differenz zeichnet nichts. Lege mindestens einen Wert auf **+** oder **−**. |
| *Spalte* lässt sich so nicht aufteilen | Die gewählte Spalte passt nicht zur Aufteilung. Wähle die Spalte neu. |
| Die Aufteilungsspalte passte bei N von M Blöcken nicht in den GPU-Speicher | Diese Zeilen werden nicht gezeichnet. Erhöhe das GPU-Budget unter Leistung → Ressourcenbudgets oder lade weniger Zeilen. |

### Nach Gruppe {#by-group}

Das Panel verweist nur auf die [Teamliste](teams-list.md), wo jede Gruppe eine Schaltfläche **+** und **−** hat. Bei jedem Laden kommt die erste Hälfte der Gruppen (aufgerundet) auf +, der Rest auf −; **Gleichmäßig aufteilen** in der Teamliste macht dasselbe erneut. Eine Gruppe auf keiner Seite oder eine, die mit ihrem Kästchen ausgeblendet ist, trägt nichts bei.

### Nach Kategoriewerten {#by-category-values}

| Teil | Bedeutung |
|---|---|
| `a + / b − / c ungenutzt` | Wie viele Werte auf jeder Seite und auf keiner liegen. |
| **Leeren** | Setzt jeden Wert auf keine Seite. |
| Werteliste | Jeder Wert mit einer Schaltfläche **+** und **−** (klicke den aktiven erneut an, um ihn von dieser Seite zu nehmen). Ein leerer Wert wird als *(fehlt)* aufgeführt. |
| Hinweis zur Obergrenze | Nur die ersten 200 Werte werden aufgeführt: *Die ersten 200 von N Werten werden angezeigt. Bei einer so breiten Spalte grenze besser zuerst mit einem Filter ein oder teile nach Bereich, wenn ihre Werte geordnet sind.* |

Die Wahl der Spalte setzt ihren ersten Wert auf + und ihren zweiten auf −. Hat keine Seite einen Wert, fällt die Aufteilung auf Gruppen zurück, statt ein leeres Bild zu zeigen. *Quelldatei* funktioniert ebenso, mit einem Wert pro Datei – so werden zwei Exporte, zwei Testläufe oder zwei Versionen verglichen.

### Nach Bereich {#by-range}

| Teil | Bedeutung |
|---|---|
| Hinweis | Das Minimum und Maximum der Spalte. |
| **Positiver Bereich (+)**, **von** / **bis** | Zeilen mit einem Wert in diesem Bereich addieren; beide Enden sind eingeschlossen. |
| **Negativer Bereich (−)**, **von** / **bis** | Zeilen in diesem Bereich ziehen ab. |
| **In der Mitte teilen** | Setzt + auf [Minimum, Mitte] und − auf [Mitte, Maximum] – das passiert auch bei der Wahl der Spalte. |

Liegt ein Wert in beiden Bereichen, zählt er als +. Die Bereiche müssen die Spalte nicht abdecken; Werte außerhalb beider bleiben weg. *Die ersten zwei Minuten gegen die letzten zwei* ist eine Bereichsaufteilung über eine zeitähnliche Spalte.

## Farben {#colours}

Der Abschnitt **Heatmap-Farben** zeigt in diesem Modus zwei Editoren für den Verlauf: **Positiv (additive Teams)** und **Negativ (subtraktive Teams)**, jeder mit eigener Zurücksetzen-Schaltfläche (*Zurücksetzen auf transparent → rot → gelb → weiß*, *Zurücksetzen auf transparent → grün → blau → lila*). Die Komposition nimmt den Betrag der Nettointensität durch [Sättigungspunkt und Reaktion](colour-and-exposure.md) und wählt den negativen Verlauf, wo die Nettowerte unter null liegen. Siehe [Farbe und Belichtung](colour-and-exposure.md#the-ramp-editor).

Nutze das *lineare* Dichteverhalten, wenn die Größe der Differenz zählt: Es ist das einzige, bei dem gleiche Farbe gleiche Anzahl bedeutet.

## So funktioniert es {#how-it-works}

Jede Zeile erhält im Vertex-Shader ein Vorzeichen von +1, −1 oder 0 ([`POINT_HEAT_VS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/shaders.ts)); eine 0 verwirft die Zeile, bevor ein Fragment gezeichnet wird.

- Nach Gruppe kommt das Vorzeichen aus einer Gruppentabelle mit 4.096 Einträgen, indiziert über die Gruppen-ID der Zeile (die Gruppen-ID steckt im vierten Kanal des Positions-Texels der Zeile).
- Nach Kategorie kommt das Vorzeichen aus einer zweiten Tabelle mit 4.096 Einträgen, die pro Kategoriewert gefüllt wird; der Wert der Zeile wird aus der Filtertextur der Spalte gelesen. Ein Wert hinter dem Tabellenende wird auf beiden Backends verworfen.
- Nach Bereich wird der Wert der Zeile mit den beiden Bereichen verglichen.

Eine Änderung der Aufteilung startet die Akkumulation neu.

**Ausgeblendete Gruppen bleiben bei jeder Aufteilung ausgeblendet.** Bei einer Aufteilung nach Spalte trägt die Gruppentabelle keine Vorzeichen mehr; sie enthält 1 für eine angezeigte Gruppe und 0 für eine ausgeblendete ([`frameSignTables`](https://github.com/Holdi601/3DHeat/blob/main/src/render/filterTables.ts)), und beide Tabellen erreichen den Shader gemeinsam – zwei Zeilen einer Vorzeichentextur auf WebGL2, zwei Hälften eines Storage-Buffers auf WebGPU. Eine Zeile wird nur gezeichnet, wenn ihre Gruppe angezeigt wird *und* ihr Spaltenwert auf einer Seite liegt. Eine Gruppe, die in der [Teamliste](teams-list.md) abgewählt ist oder durch den Seitenfokus des Tabs Match ausgeblendet wird, trägt also nichts bei, egal wie die Differenz aufgeteilt wird.
