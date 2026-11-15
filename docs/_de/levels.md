---
title: "Levels und Hintergrundgeometrie"
nav_order: 16
has_children: true
lang: "de"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Levels und Hintergrundgeometrie

Ein Level ist der 3D-Ort, an dem das Spiel stattfand – eine Karte, eine Stadt, eine Strecke. Legst du eines hinter deine Daten, siehst du, *wo* die Intensität liegt. Das Panel **Hintergrund / Level** (siehe [Glossar](glossary.md) für „Level“) gibt dir drei Arten von Kontext:

- ein **Kartenbild**, mit zwei Ankerpunkten georeferenziert – siehe [Kartenbilder](map-images.md);
- ein **3D-Level** – `.glb`, `.gltf`, `.obj`, `.stl` oder `.ply` – beim Import in Boden, Bauwerke und Wasser aufgeteilt und vereinfacht – siehe [3D-Levels](model-levels.md) und [Aussehen des Levels](level-appearance.md);
- ein **Welt-Hintergrund** – für eine Aufnahme, die angibt, wo auf der Erde sie liegt (eine Tacview-ACMI-Datei): das echte Gelände, Straßen, Wasser, Flugplätze und Gebäude, aus offenen Daten geladen – siehe [Welt-Hintergrund](world-backdrop.md).

Ohne geladenes Level ist die Szene dunkel, mit einem Raster und farbigen Achsen (**Raster** und **Achsen** in [Kamera & Szene](camera.md)), und das Panel sagt *Nichts geladen – die Szene zeigt ein Raster und Achsen. Füge ein Kartenbild oder ein Levelnetz hinzu, um der Intensität Kontext zu geben.*

Das Level wird von allen drei Tabs geteilt: Eine Strecke, die im Tab Rennanalyse geladen ist, ist dasselbe Level, das die Heatmap zeigt.

![Das Panel Hintergrund / Level mit geladenem Level: Schaltflächen Kartenbild und 3D-Modell, Schauplatz, Deckkraft, Helligkeit, In Bibliothek speichern und die Liste der Bibliothek](../assets/img/de/level-panel.webp)

## Ein Level hinter deine Daten legen {#put-a-level-behind-your-data}

1. Lade zuerst deine Daten ([Daten laden](getting-data-in.md)), damit das Level darauf eingepasst wird.
2. Öffne **Hintergrund / Level** in der Seitenleiste.
3. Drücke **Kartenbild…** für ein Bild oder **3D-Modell…** für ein 3D-Level und wähle die Datei. Für eine Aufnahme aus der echten Welt nutze stattdessen **Welt-Hintergrund** oder **Schauplatz**.
4. Warte, bis die Fortschrittszeile fertig ist. Ein großes Modell wird zuerst vereinfacht (siehe unten **Vereinfachungsziel**).
5. Drücke **F** in der Ansicht, um alles einzurahmen. Nutze **Deckkraft** und **Helligkeit**, bis sich die Intensität vom Level abhebt.
6. Drücke **In Bibliothek speichern**, wenn du das Level wieder nutzen willst ([Level-Bibliothek](level-library.md)).

## Was ein Level für die Intensität tut {#what-a-level-does-for-the-heat}

- Es **verdeckt**: Datenpunkte hinter ihm werden pro Fläche abgedunkelt, und Datenpunkte hinter dem Gelände sind verborgen ([Tiefe und Culling](depth-and-culling.md)). Ohne Level gibt es keine Verdeckung.
- Es wird vom [Schnitt](slice.md) und, mit *Auch das Level schneiden*, von der [Entfernungsbeschneidung](depth-and-culling.md#distance-culling) zusammen mit der Intensität geschnitten.
- Es ist das Einzige, was [Tiefenunschärfe](camera.md#depth-of-field) neben dem Raster und den Quadern unscharf macht.
- Ein 3D-Level **weitet die ferne Ebene der Kamera**, wenn es größer ist als die Daten: Nah und fern werden aus dem Datensatz kalibriert, und eine exportierte Karte von mehreren Kilometern Breite läge sonst ganz hinter der fernen Ebene und ließe eine leere Ansicht zurück. Die ferne Ebene wird zu 3 × der horizontalen Ausdehnung des Levels, wenn das größer ist; die nahe Ebene wandert mit (mindestens fern / 100.000), um die Tiefengenauigkeit zu halten, von der die Verdeckung abhängt; und die Fluggeschwindigkeit wird auf mindestens Ausdehnung / 12 erhöht. Es wird nur ausgeweitet, nie verengt.

## Das Panel, von oben nach unten {#the-panel-top-to-bottom}

| Teil | Details |
|---|---|
| **Kartenbild…**, **3D-Modell…** | Eines laden; es ersetzt das aktuelle Level. |
| **Welt-Hintergrund**, **Kartenkacheln vergessen** | Nur für einen Datensatz mit geografischem Bezug: den echten Ort darunter als Level aufbauen oder die geladenen Kacheln löschen. [Welt-Hintergrund](world-backdrop.md) |
| **Vereinfachungsziel** | Das Dreiecksbudget für den nächsten Modellimport: *Voll – keine Vereinfachung* (Voreinstellung), *Hoch – 8 Mio.*, *Mittel – 3 Mio.*, *Niedrig – 800 Tsd.*, *Silhouette – 100 Tsd.* [3D-Levels](model-levels.md#simplification) |
| Fortschritt und **Abbrechen** | Während Dekodieren oder Import. |
| Importhinweis | Dreiecke vorher und nachher, die Aufteilung in Boden / Bauwerke / Wasser, die verwendete Detailstufe. |
| Name und Größe | `Breite×Höhe px · x × z m/px` für ein Bild, `N Dreiecke (von M)` für ein Modell. |
| **Deckkraft**, **Helligkeit** | Für beide Arten. |
| Bildregler | **Entsättigen**, **Nord/Süd spiegeln**, **Platzierung** (zwei Anker), **An Datengrenzen anpassen**, **Höhe**. [Kartenbilder](map-images.md) |
| Modellregler | Geländerelief, Wasser, Bodendreiecke, Drahtgitter, Textur, übernommene Farbe, Bauwerke, Teileinteilung. [Aussehen des Levels](level-appearance.md) |
| **In Bibliothek speichern**, **Entfernen** | [Level-Bibliothek](level-library.md); Entfernen lädt das Level ab. |
| **Bibliothek** | Levels, die in diesem Browser gespeichert sind. [Level-Bibliothek](level-library.md) |

## Seiten in diesem Abschnitt {#pages-in-this-section}

- [Kartenbilder](map-images.md)
- [3D-Levels](model-levels.md) – Formate, Teile, Einteilung, Vereinfachung, Texturen
- [Aussehen des Levels](level-appearance.md) – jeder Regler für ein 3D-Level
- [Level-Bibliothek](level-library.md)
- [Welt-Hintergrund](world-backdrop.md) – die echte Welt unter einer Aufnahme, aus offenen Daten

Wie man Levels aus Spielen und Engines holt, ist Aufgabe der separaten Exporter-Werkzeuge (siehe das [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) des Repositorys); das Format, in das sie schreiben, ist unter [3D-Levels](model-levels.md#the-exporter-contract) zusammengefasst.
