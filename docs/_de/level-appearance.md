---
title: "Aussehen des Levels"
parent: "Levels und Hintergrundgeometrie"
nav_order: 3
lang: "de"
source: "level-appearance.md"
source_hash: "c883749baedd"
translated: true
outdated: false
---

# Aussehen des Levels

Diese Regler ändern, wie ein 3D-Level aussieht, damit die Heatmap sich davon abhebt und du den Ort trotzdem lesen kannst. Hier ändert sich nichts an den Daten.

## Schneller Einstieg {#quick-start}

1. Lade ein 3D-Level ([3D-Levels](model-levels.md)).
2. Senke im Bereich **Hintergrund / Level** die **Helligkeit**, bis die Heatmap das Hellste auf dem Bildschirm ist.
3. Öffne **Bodenrelief** und erhöhe **Hangschattierung** oder **Höhenlinienstärke**, bis du einen Hügel von einer Ebene unterscheiden kannst.
4. Öffne **Strukturen**. Senke **Flächendeckkraft**, um in Gebäude hineinzusehen, oder schalte **Strukturtextur** ein, um sie massiv zu sehen.
5. Wenn der Boden ein aufgemaltes Bild hat, probiere **Bodentextur** aus und an.

![Die Abschnitte Bodenrelief und Strukturen geöffnet, mit dem Level und seinen Reliefhinweisen](../assets/img/en/level-appearance-sections.webp)

Wenn ein [3D-Level](model-levels.md) geladen ist, zeigt der Bereich Hintergrund / Level diese Regler. Die Standardwerte sind die, die ein frisch importiertes Level bekommt ([`modelLevelFrom`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/panels/LevelPanel.tsx), [`level.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts)). Eine Änderung zeichnet nur die Szene neu; die Akkumulation der Heatmap bleibt erhalten.

## Das ganze Level {#the-whole-level}

| Regler | Standard | Bereich | Bedeutung |
|---|---|---|---|
| **Deckkraft** | 100 % | 0-100 % | Unterhalb von 100 % wird das Level gemischt und schreibt keine Tiefe, so verdeckt es die Heatmap nicht mehr [(Verdeckung)](depth-and-culling.md). |
| **Helligkeit** | 0,9 | 0-2 (Schrittweite 64) | |

Das Level wird entsättigt gezeichnet - grauer Boden, eine getönte Hülle -, so dass die Heatmap das einzige gesättigte Ding auf dem Bildschirm ist. Anders als ein [Kartenbild](map-images.md) hat ein 3D-Level keinen Regler für Entsättigung.

## Bodenrelief {#ground-relief}

Aus der Ferne sehen ein Hügel und eine Ebene gleich grau aus, deshalb fügt der Viewer drei Hinweise hinzu. Jeder beantwortet einen anderen Fehler:

| Regler | Standard | Bedeutung |
|---|---|---|
| **Höhenlinienabstand** | aus der Höhenspanne des Bodens | Höhe zwischen den Höhenlinien, logarithmisch von 1/4000 bis 1/2 der Höhenspanne des Levels; die untere Grenze der Leiste ist *aus*. Der Standard ist 1/40 der Höhenspanne des Bodens, auf einen Schritt 1/2/5 gerundet - 10-m-Linien passen zu einem Hang und sind auf einem Steinbruchboden nutzlos. Jede fünfte Linie wird stärker gezeichnet. Höhenlinien werden im Bildschirmraum gezeichnet, bleiben also bei jedem Zoom einen Pixel breit, und sie sind der einzige Hinweis, der bei Boden übrig bleibt, der zu flach ist, um überhaupt schattiert zu werden. |
| **Höhenlinienstärke** | 35 % | 0-100 % |
| **Hangschattierung** | 55 % | Verdunkelt nach Steilheit, so dass Böschungen und Klippen aus jedem Kamerawinkel lesbar sind - anders als eine Lichtquelle, die alles flach macht, sobald du ihr zugewandt bist. |
| **Höhenverlauf** | 50 % | Tiefer Boden dunkler, hoher Boden heller, über die Höhenspanne des Bodens: die großräumige Form. |

Die Kopfzeile des Abschnitts zeigt den Zustand der Höhenlinien: *alle N m*, den Höhenlinienabstand, oder *keine Höhenlinien*, wenn der Abstand aus ist.

## Bodenoberfläche {#ground-surface}

| Regler | Standard | Angezeigt, wenn | Bedeutung |
|---|---|---|---|
| **Wasser** | an | das Level Wasser hat | Seen, Flüsse und Meer, flach in einem blassen Blaugrau gezeichnet: Keiner der Geländehinweise gilt für eine Fläche, die per Definition eben ist. |
| **Wasserdeckkraft** | 60 % | Wasser ist an | Die Küstenlinie und der Boden unter den Flachwasserstellen scheinen durch das durchscheinende Wasser. |
| **Bodendreiecke** | 30 % (0 bei einem texturierten Level) | immer | Die eigenen Kanten des Geländes, über die schattierte Oberfläche gezeichnet, die zwischen 6 % und 25 % der Levelbreite von der Kamera an ausblenden. Zeigt, wie grob der Boden abgetastet wurde, und gibt einer Schräge etwas, woran sich die Entfernung schätzen lässt. Wird beim ersten Gebrauch aufgebaut, was bei einem großen Level einen Moment dauert. |
| **Boden nur als Drahtgitter** | aus | immer | Ersetzt die Geländeoberfläche durch ihre Kanten. Völlig schematisch - es gibt auch die Schattierung, die Höhenlinien und die Verdeckung auf, daher ist *Bodendreiecke* meist die bessere Wahl. |
| **Bodentextur** | an | das Level hat Texturen | Zeichnet den Boden in den Texturen, die die Datei mitbringt (Asphalt, Randstreifen, Gras). Die Beleuchtung des Netzes wird sanft darüber gelegt, weil die Textur schon ihr eigenes feines Relief trägt. **Helligkeit** ist der Weg, sie unter der Heatmap zu beruhigen; Entsättigung gehört zu Kartenbildern. |
| **Erfasste Farbe** | aus | das Level hat Vertex-Farben | Schattiert den Boden mit der Farbe, die ein Scan erfasst hat, statt in Grau - eine rekonstruierte Straße wäre sonst vom Randstreifen nicht zu unterscheiden. Exporte aus Engines haben keine; fehlen sie, sagt der Bereich *Dieses Level hat keine Farbe.* |

## Strukturen {#structures}

Die Kopfzeile **Strukturen** zeigt die Anzahl der Dreiecke der Strukturen; der Hinweis darunter sagt, wie sie gezeichnet werden (*massiv in ihren eigenen Texturen gezeichnet* oder *als durchscheinende Hülle gezeichnet, damit du die Heatmap darin siehst*) und wie viele Teile Strukturen sind.

| Regler | Standard | Bedeutung |
|---|---|---|
| **Strukturtextur** | an, wenn die Strukturen Texturen tragen | Strukturen massiv zeichnen, in ihren eigenen Texturen. Einschalten setzt die Flächendeckkraft auf 100 % und schaltet die Kanten aus; Ausschalten geht zurück zur getönten, durchsichtigen Hülle mit 25 %. Eine texturierte Struktur wird von der Seite beleuchtet, die die Kamera sieht, denn ein Schild besteht aus zwei Flächen Rücken an Rücken, und welche den Tiefentest gewinnt, hängt von Rundungen ab. |
| **Drahtgitterkanten** | an; aus ab 300.000 Dreiecken der Strukturen oder wenn texturiert | Zusammengefasste Kanten der Strukturen, eine Linie pro Kante. |
| **Kantendeckkraft** | 50 % | |
| **Hüllflächen** | an | Eine schwache Fläche mit hellem Fresnel-Rand, so dass ein Gebäude als Volumen wirkt statt als Käfig oder Nebelbank. |
| **Flächendeckkraft** | 25 % (35 % ab 300.000 Dreiecken der Strukturen, 100 % texturiert) | 0-60 % auf der Leiste, bis 100 % mit dem Griff. Halte sie niedrig: Massive Strukturen verbergen die Daten in ihrem Innern. |
| **Scharfe Kanten** | an (aus, wenn texturiert) | Schattiert jedes Dreieck nach seiner eigenen Normalen, im Fragment-Shader aus den Ableitungen im Bildschirmraum berechnet. Exportierte Levels sind verschweißt und tragen gemittelte Normalen, die jede Ecke einer Kiste zu „geschmolzener Folie“ abrunden; jeden Eckpunkt zu trennen, um das zu beheben, würde den Vertex-Puffer vervielfachen. Schalte es für ein Level aus, dessen gekrümmte Flächen wichtiger sind als seine Ecken. |
| **Strukturtönung** | Cyan | Ein Farbwähler und die Voreinstellungen **Cyan**, **Bernstein**, **Violett**, **Weiß**. |
| **Teil-Klassifizierung anzeigen (N)** | | Jeder Teil, seine Klasse und der Grund; siehe [3D-Levels](model-levels.md#ground-structures-and-water). |

## Das Level schneiden {#cutting-the-level}

Der [Schnitt](slice.md) und, mit *Auch das Level schneiden*, das [Entfernungs-Culling](depth-and-culling.md#distance-culling) schneiden Boden, Strukturen und Wasser an denselben Ebenen wie die Heatmap.
