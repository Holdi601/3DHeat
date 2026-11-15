---
title: "Kartenbilder"
parent: "Levels und Hintergrundgeometrie"
nav_order: 1
lang: "de"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Kartenbilder

Ein Kartenbild ist ein flaches Bild - eine Minimap, ein Satellitenfoto, ein Grundriss -, das unter deine Daten gelegt wird, damit du siehst, wo die Heatmap liegt. Du sagst dem Viewer, wohin das Bild gehört, indem du zwei Punkte darauf an zwei Stellen der Welt anheftest (die „Anker“).

## Kartenbild laden und platzieren {#load-and-place-a-map-image}

1. Lade zuerst deine Daten ([Daten einlesen](getting-data-in.md)).
2. Drücke im Bereich **Hintergrund / Level** auf **Kartenbild…** und wähle das Bild. Es wird über die Fläche der Daten gezogen.
3. Drücke **An Datengrenzen anpassen**, wenn das Bild verschoben wurde. Anker 1 kommt in die obere linke Ecke des Bildes, Anker 2 in die untere rechte, an die Ränder der Daten.
4. Wenn die Heatmap nicht zum Bild passt, wähle zwei Orientierungspunkte, die weit auseinanderliegen (zum Beispiel zwei gegenüberliegende Ecken eines Gebäudes oder zwei Kreuzungen). Lies bei jedem den Pixel auf dem Bild und seine Position in der Welt ab (fahre mit dem [Lineal](measure.md) darüber, um **X** und **Z** abzulesen).
5. Trage sie in **Platzierung** ein: für **Anker 1** die **px**, **py**, **Welt X**, **Welt Z** des Orientierungspunkts; ebenso für **Anker 2**.
6. Prüfung: Eine Spur oder ein Hotspot, von dem du weißt, dass er auf einer Straße liegt, sollte jetzt auf dieser Straße liegen. Passe die Zahlen an, bis es stimmt.

![Der Abschnitt Platzierung mit zwei Ankern und Heatmap auf einem Kartenbild](../assets/img/en/map-images-placement.webp)

Die beiden Orientierungspunkte müssen sich sowohl in der Pixelspalte als auch in der Pixelzeile unterscheiden, sonst sagt das Feld *Die beiden Anker liegen in derselben Pixelzeile oder -spalte*.

## Laden {#loading}

Jedes Bildformat, das der Browser lesen kann. Ein Bild, dessen längere Kante über **8192 px** liegt, wird auf 8192 verkleinert (die größte Kante, die die Grafikkarte halten soll), und das Feld sagt *Von B×H auf b×h verkleinert*.

Beim Laden wird das Bild über die X-Z-Grenzen der Daten gezogen (oder über ±1000 Einheiten ohne Daten), Norden oben, auf der niedrigsten Y-Höhe der Daten. Die Standardwerte sind **Deckkraft** 100 %, **Helligkeit** 0,7, **Entsättigen** 100 %, **Nord/Süd spiegeln** an: entsättigt und abgedunkelt, weil die Aufgabe des Hintergrunds ist, dir das Finden eines Hotspots zu erlauben, nicht mit ihm zu konkurrieren.

## Regler {#controls}

| Regler | Standard | Bereich | Bedeutung |
|---|---|---|---|
| **Deckkraft** | 100 % | 0-100 % | |
| **Helligkeit** | 0,7 | 0-2 (Schrittweite 64) | |
| **Entsättigen** | 100 % | 0-100 % | Grauer Hintergrund, gesättigte Heatmap. Farbe in der Karte konkurriert mit Farbe in den Daten. |
| **Nord/Süd spiegeln** | an | | Welche Bildzeile das größte Z der Welt ist. Wird es bei geladenen Daten umgeschaltet, werden die Anker auch wieder an die Datengrenzen angepasst. |
| **Platzierung**: Anker 1, Anker 2 | die Bildecken auf den Datengrenzen | | Jeder Anker ist ein Pixel auf dem Bild - **px** (von links, 0 bis zur Breite) und **py** (von oben, 0 bis zur Höhe) - und die Weltkoordinate, an der er liegt, **Welt X** und **Welt Z**. Maßstab und Versatz ergeben sich aus dem Paar. |
| **An Datengrenzen anpassen** | | | Setzt Anker 1 in die obere linke Ecke des Bildes und Anker 2 in die untere rechte, an die X-Z-Grenzen der Daten. Ein Ausgangspunkt für genaue Platzierung. Braucht Daten. |
| **Höhe** | die niedrigste Y-Höhe der Daten | min. Y der Daten - 500 bis max. Y + 500 (Schrittweite max. Y + 100.000) | Höhe der Kartenebene. Lege sie knapp unter die Daten, damit nichts von ihr verdeckt wird. |

Die Namenszeile zeigt `Breite×Höhe px · x × z m/px`, die Weltgröße eines Pixels entlang jeder Achse.

## In der Szene {#in-the-scene}

Das Bild ist ein einziges texturiertes Viereck auf der Höhe. Bei voller Deckkraft schreibt es die Tiefe, nimmt also als Boden an der [Verdeckung](depth-and-culling.md) teil; unter 100 % Deckkraft wird es gemischt und schreibt keine Tiefe, verdeckt also nichts. Das [Lineal](measure.md) misst auf seiner Ebene. Die [Level-Bibliothek](level-library.md) speichert ein Bild-Level mit seinen Ankern.

## Dota-2-Karte {#dota-2-map}

**Dota-2-Karte** neben **Kartenbild…** holt die Zeichnung der aktuellen Dota-2-Karte, die [OpenDota](https://www.opendota.com) auf seinen Match-Seiten zeigt, und platziert sie unter Tabellen, die der [Watcher](https://github.com/Holdi601/3DHeat-Watcher) aus Dota-2-Replays schreibt ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Das Bild wird von opendota.com geholt, wenn der Knopf gedrückt wird, und ist nicht Teil von 3DHeat; die Zeichnung des neuesten Patches wird aus OpenDotas eigener Liste genommen, und die Zeichnung von 7.40, wenn die Liste nicht gelesen werden kann.

| | |
|---|---|
| Quelle | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Platzierung | OpenDotas Kalibrierung: Das Bild erstreckt sich über die Dota-Welteinheiten -8192 bis 8064 auf beiden Achsen (128-Einheiten-Zellen 64 bis 191), Norden oben. Mit den Achsen der Replay-Tabelle (Z oben, Y gespiegelt) ist das Welt-X -8192 bis 8064 und Welt-Z -8064 bis 8192. Etwa 18 Einheiten pro Pixel. |
| Höhe | 0. Helden stehen bei 0 bis etwa 600. |
| Aussehen | Helligkeit 0,8, Entsättigen 50 %. |

Geprüft an einem öffentlichen Match-Replay von Patch 7.40: Die Spur jedes Helden folgt den gezeichneten Lanes, und die Türme, Kasernen und Ancients, die das Replay platziert, fallen auf die gezeichneten Basen. Die Ansicht **Oben** zeigt die Karte mit Norden unten auf dem Bildschirm, so wie sie jede Z-oben-Tabelle mit gespiegeltem Y zeigt.

Die Zeichnung gehört OpenDota, von Valves Karte; Valve unterstützt 3DHeat nicht. Eine 3D-Karte von Dota braucht das installierte Spiel: siehe die Hinweise des Watchers zu Dota-2-Replays.

## Für Entwickler {#for-developers}

### Wie die Anker das Bild platzieren {#how-the-anchors-place-the-image}

Aus [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), mit den Ankern *a* und *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
Pixel (0, 0) liegt bei  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Zwei Anker legen Maßstab und Versatz auf jeder Achse unabhängig fest, so dass eine Karte auf X und Z verschieden gestreckt, aber nicht gedreht werden kann. Die Anker müssen sich in **beiden** Pixelkoordinaten unterscheiden; teilen sie eine Zeile oder eine Spalte, lässt sich kein Maßstab ableiten, die Karte wird nicht gezeichnet, und das Feld sagt *Die beiden Anker liegen in derselben Pixelzeile oder -spalte*.
