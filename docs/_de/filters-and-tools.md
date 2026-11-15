---
title: "Filter und Werkzeuge"
nav_order: 6
has_children: true
lang: "de"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filter und Werkzeuge

Diese Panels lassen dich wählen, *welche* Daten du ansiehst, und messen, was du siehst. Nutze sie, wenn das Bild zu unruhig ist: einen Team, einen Spieler, einen Ort oder ein Stockwerk eines Gebäudes zeigen.

Jedes Panel grenzt die Daten ein, und sie arbeiten zusammen: Eine Zeile wird nur gezeichnet, wenn sie **alle** besteht (UND).

```
alle Zeilen -> Filter -> Teams -> Entitäten -> Schnitt -> Bild
                 UND      UND        UND          UND
```

Beispiel: Wähle *Panzer* unter Filter ab, blende das rote Team unter Teams aus und wähle einen Spieler unter Entitäten. Du siehst nur die Bewegungen dieses Spielers ohne Panzer.

| Panel | Was es tut | Intensitätsmodi | Figuren-Overlay |
|---|---|---|---|
| [Filter](filters.md) | Bereichs- und Kategoriefilter auf jede beim Laden behaltene Spalte. | Ja | Nein (nur Spaltenfilter) |
| [Differenz-Aufteilung](difference.md#the-difference-split-panel) | Welche Zeilen addieren und welche abziehen, im Modus Differenz. | Nur Differenz | Nein |
| [Teams](teams-list.md) | Jedes Team ein- oder ausblenden; Teams auf die +- oder −-Seite legen. | Ja | Ja |
| [Entitäten](entities.md) | Einzelne Spieler auswählen. | Ja | Ja |
| [Schnitt](slice.md) | Eine Scheibe aus dem Level und der Intensität herausschneiden, um in Gebäude zu sehen. | Ja, und das Level | Nein |
| [Messwert](measure.md) | Ein Lineal und der Intensitätswert unter dem Cursor. | Ja | Ja |
| [Volumen und Vergleich](volumes.md) | 3D-Formen zeichnen und fragen, was darin passiert ist. Kann auch filtern. | Ja | Ja |
| [Aufschlüsselung](breakdown.md) | Welches Fahrzeug, welcher Spieler oder welche Waffe an einem Ort am besten abschneidet. | nicht zutreffend | nicht zutreffend |

Die Trefferanalyse hat einen eigenen Gebietsfilter im Tab **Fahrzeuge**: siehe [Trefferanalyse](hit-analysis.md).

Begriffe wie Heatmap, Zeile, Person und Gruppe erklärt das [Glossar](glossary.md).

## Wo die Panels stehen {#where-the-panels-are}

Die Seitenleiste des Tabs Heatmap, von oben nach unten:

1. Modusleiste und Sitzungsauswahl
2. Quelle, Spaltenzuordnung, Datensatz
3. Wege (Modus Linien)
4. Die Intensitäts-Panels oder die Team-Ansicht
5. Differenz-Aufteilung
6. Teams
7. Entitäten
8. Filter
9. Hintergrund / Level
10. Schnitt
11. Messwert
12. Kamerapfad & Rendern
13. Leistung
14. Kamera & Szene

Der Tab Match zeigt die Modusleiste, die Sitzungsauswahl, sein eigenes Panel, Filter, Hintergrund / Level und Kamera & Szene.
