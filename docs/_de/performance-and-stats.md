---
title: "Leistungsfenster und Statistik"
parent: "Interna des Renderings"
nav_order: 7
lang: "de"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Leistungsfenster und Statistik-Overlay

Der Kasten oben rechts in der Ansicht zeigt, wie stark der Viewer arbeitet: wie viele Bilder pro Sekunde, wie viele Punkte er zeichnet und ob er das Bild noch verfeinert. Das Fenster **Leistung** lässt dich Bildqualität gegen Tempo tauschen.

## Das Statistik-Overlay {#the-stats-overlay}

Der Kasten oben rechts in der Ansicht der Tabs Heatmap und Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Er liest die Live-Werte der Engine bei jedem Animationsbild.

![Das Statistik-Overlay bei der Many-Matches-Szene, mit nummerierten Hinweisen: 1 Backend, 2 FPS, 3 Frame, 4 Zeilen im Fenster, 5 Sprites / Frame, 6 Budget, 7 Heatmap-Aufl., 8 Abdeckung](../assets/img/en/performance-stats-overlay.webp)

| Zeile | Bedeutung |
|---|---|
| **Backend** | *WebGPU* oder *WebGL2*. Fahre mit der Maus darüber für den Grund, warum WebGPU nicht benutzt wurde, falls das so ist. Siehe [Die zwei Backends](backends.md). |
| **FPS** | Bilder pro Sekunde, gemittelt über mindestens 0,4 s. |
| **Frame** | Bildzeit in ms, geglättet (90 % alter Wert, 10 % neuer). Das ist die Zeit zwischen den Bildern, nicht die GPU-Zeit. Eine GPU-Zeit je Durchgang wird nicht gemessen. |
| **Zeilen im Fenster** | Kandidaten-Zeilen: die Zeilen im aktuellen Zeitfenster, vor der Filterung je Zeile im Shader. |
| **Sprites / Frame** | Sprites, die der Plan des letzten Bildes abgegeben hat. Bei Leerlaufbildern, die nichts zeichnen, bleibt der geplante Wert stehen. |
| **Budget** | Das Sprite-Budget, mit dem dieses Bild geplant wurde: der Wert des adaptiven Reglers, bei *Jede Zeile zeichnen* auf alle Kandidaten angehoben. |
| **Heatmap-Aufl.** | Die Auflösung des Heatmap-Puffers als Anteil am Canvas: die Einstellung *Heatmap-Auflösung* mal die adaptive Skalierung der zweiten Stufe. |
| **Abdeckung** | Wie weit die progressive Akkumulation schon alle Zeilen erreicht hat: ein Prozentwert, solange sie konvergiert (gelb), *exakt*, wenn sie fertig ist. Ein verrauschtes Bild wird nie für das fertige Bild gehalten. |
| **Würfel** | Boxen, die in der [Box-Wiedergabe](box-replay.md) gezeichnet werden. |
| **Nicht im Speicher** | Nur sichtbar, wenn Zeilen nicht in das GPU-Budget passten: wie viele. Siehe [GPU-Speicherbelegung](gpu-memory.md). |

## Die Geschwindigkeitsanzeige {#the-speed-display}

Unten rechts in der Ansicht, nur in der Perspektive: die Flug-Geschwindigkeit und die Zeit, die man mit dieser Geschwindigkeit braucht, um die Daten zu durchqueren. Ziehe daran, um die Geschwindigkeit zu ändern. Siehe [Kamera](camera.md#fly-speed).

## Wenn der Viewer langsam ist {#if-the-viewer-is-slow}

Schau zuerst auf das Statistik-Overlay und dann:

1. **Zeilen im Fenster viel größer als Sprites / Frame, Abdeckung unter 100 %**: Das Bild kann nicht alles zeichnen. Bei Stillstand konvergiert es über mehrere Bilder. Verenge das Fenster, filtere oder schneide aus, um die Kandidaten zu verringern. Oder nimm die Abtastung hin.
2. **Sprites / Frame gleich Zeilen im Fenster, das Bild ist trotzdem langsam**: Die Kosten richten sich nach jedem Sprite auf dem Bildschirm. Senke den *Maximalen Pixelradius* ([Sprite-Form](sprite-shape.md#pixel-clamps)) oder die *Heatmap-Auflösung*.
3. **Langsam bei wenigen Zeilen**: wahrscheinlich liegt es am Level: viele Strukturen mit eingeschalteten Kanten, Bodendreiecke, Tiefenschärfe. Siehe [Erscheinungsbild des Levels](level-appearance.md).
4. **Alles langsam und ein rotes Banner**: Software-Rendering ([Erkennung von Software-Rendering](software-rendering.md)).

## Das Leistungsfenster {#the-performance-panel}

| Steuerung | Standard | Wirkung |
|---|---|---|
| Hinweis | | Jedes Bild verteilt einen geschichteten Zufallsteil der sichtbaren Zeilen, deren Gewicht zum Ausgleich skaliert ist. So ist die erwartete Hitze bei jedem Budget exakt. Hältst du die Ansicht ruhig, werden weiter Bilder verschmolzen, bis jede Zeile beigetragen hat. |
| **Jede Zeile in jedem Frame zeichnen** | an | Jedes Bild, das eine neue Schätzung beginnt, zeichnet jede Kandidatenzeile (bis etwa 268 Mio.). Das Budget unten wird dann zur Untergrenze. [Abtastung und Budgets](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptives Budget** | an | Passt Sprites pro Bild, dann die Heatmap-Auflösung an, um die Ziel-Bildrate zu halten. Und hört auf zu kürzen, wenn Kürzen nichts hilft. [Abtastung und Budgets](sampling-and-budgets.md#the-adaptive-budget) |
| **Ziel-FPS** | 60 | 20-240 (1000 mit dem Griff). Werte unter 15 gelten als 15. |
| **Start-Sprites / Frame** / **Sprites / Frame** | 4,00 Mio. | 65.536-268.435.456, logarithmisch. Heißt *Start-*, solange das adaptive Budget an ist, weil der Regler den Wert verändert. |
| **Heatmap-Auflösung** | 100 % | 25-100 %. Die Kosten der Fragmente wachsen mit dem Quadrat: 50 % vierteln die Verschmelzungsarbeit, und das Heatmap-Feld ist so glatt, dass man den Unterschied kaum sieht. |
| **Progressive Verfeinerung** | an | Akkumuliert über mehrere Bilder, solange die Ansicht ruhig ist. Aus zeigt bei jedem Bild die Schätzung eines einzelnen Bildes. [Akkumulation](accumulation.md) |
| **Ressourcenbudgets** | erkannt | Budgets für RAM, GPU und den Parser-Thread. [Speicher und Budgets](memory-and-budgets.md#resource-budgets) |

Nichts davon wird gespeichert. Ein Neuladen setzt die Standardwerte zurück.
