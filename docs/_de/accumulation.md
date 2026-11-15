---
title: "Akkumulation"
parent: "Interna des Renderings"
nav_order: 2
lang: "de"
source: "accumulation.md"
source_hash: "047ad9481db3"
translated: true
outdated: false
---

# Akkumulation

Kann der Viewer nicht alle Punkte in einem Bild zeichnen, zeichnet er einen Teil, dann einen anderen und addiert die Bilder, während du still hältst. Das Bild wird klarer, wie ein Foto, das sich entwickelt. Eine Kamerabewegung fängt von vorn an. Die Zeile **Abdeckung** der Statistik-Überlagerung zeigt, wie weit es ist.

![Die Statistik-Überlagerung: Abdeckung zeigt einen Prozentwert, während sich das Bild entwickelt, und *genau*, wenn es fertig ist](../assets/img/en/performance-stats-overlay.webp)

## Für Entwickler {#for-developers}

Kann ein Bild nicht alle Zeilen zeichnen, zeichnet es eine Stichprobe und gewichtet sie hoch; das Bild ist dann eine unverzerrte, aber verrauschte Schätzung. **Akkumulation** verschmilzt aufeinanderfolgende Bilder, so dass die Schätzung zur genauen Antwort konvergiert, solange sich nichts ändert. Jedes Bild wählt einen von fünf Modi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)); der zuletzt benutzte liegt in `engine.live.accumMode`.

| Modus | Wann | Was mit dem Akkumulator geschieht |
|---|---|---|
| **reset** | die Kamera hat sich bewegt, etwas, das das Feld ändert, hat sich geändert, progressive Verfeinerung ist aus, ein wachsendes Fenster beginnt (erstes Bild der Wiedergabe, nach einem Sprung), oder die abgespielte Linien-Wärme hat sich bewegt | Wird durch die Schätzung dieses Bildes ersetzt. |
| **extend** | ein **kumulatives** Fenster, das seit dem letzten Bild nur gewachsen ist | Dieses Bild zeichnet nur die Zeilen, die eben sichtbar wurden, mit vollem Gewicht, und addiert sie. Nichts verblasst. |
| **ema** | ein gleitendes Fenster (**Fenster**, **Lebensdauer**) hat sich bewegt | `acc = acc × (1 - 0,34) + Bild × 0,34` - ein exponentieller gleitender Mittelwert über etwa drei Bilder. |
| **mean** | nichts hat sich geändert, und die Schätzung ist nicht vollständig | `acc = acc × (1 - 1/n) + Bild × 1/n` beim *n*-ten Bild: ein laufender Mittelwert. |
| **skip** (untätig) | konvergiert, und nichts hat sich geändert | Nichts wird gezeichnet; das Bild setzt nur neu zusammen. |

### Warum jeder {#why-each}

- **Laufender Mittelwert, keine Summe.** Den Puffer mit 1 - 1/n zu skalieren und 1/n des neuen Bildes zu addieren ist algebraisch dasselbe wie zu summieren und am Ende durch *n* zu teilen, aber der Puffer hält immer den Wert eines einzigen Feldes. Eine Summe erreicht das *n*-Fache des Feldes, und auf einem 16-Bit-Ziel sättigt sie bei 65.504; mit einem Teiler, der immer weiter wächst, würde eine stehende Ansicht umso mehr verblassen, je länger sie stillsteht - während eine bewegte Kamera, die bei jedem Bild zurückgesetzt wird, völlig richtig aussieht. Die Smoke-Tests bestätigen, dass 16 verschmolzene Bilder genau das 1,00-Fache eines einzelnen Bildes ergeben.
- **Extend für kumulative Wiedergabe.** Die schon akkumulierten Zeilen bleiben sichtbar, daher braucht ein Bild nur den Bruchteil einer Sekunde, der eben angekommen ist - was in ein Bild passt und deshalb genau hineingeht. Neu zu schätzen würde bei jedem Bild eine andere zufällige Teilmenge aufleuchten lassen und sie wieder ausblenden, was wie aufflackernde und verschwindende Schübe aussieht, und ein angehaltenes Bild würde sich weiter füllen. Die Tests bestätigen, dass die Summe während der Wiedergabe stetig steigt und sich bei 2,5 s Pause innerhalb von 0,02 % hält.
- **Gleitender Mittelwert für gleitende Fenster.** Die ändern sich wirklich bei jedem Bild. Ein fester Mischanteil folgt dem wandernden Fenster (ein Mittelwert über alle Bilder seit Beginn der Wiedergabe würde hinter dem Abspielkopf herhinken) und ist viel ruhiger, als neu anzufangen.
- **Zurücksetzen für abgespielte Linien.** Die Köpfe der Linien-Wärme bewegen sich bei jedem Bild; ein gleitender Mittelwert würde jeden zu einer Schliere verschmieren, deshalb wird jedes Bild ganz gezeichnet, und das Verblassen am Ende ist das eigene Bild.
- **Teilbilder gehen durch ein Arbeitsziel.** Ein Bild, das mit einem Bruchteil des vollen Gewichts verschmolzen wird, wird von null an in ein eigenes Ziel gestreut und dann in den Akkumulator gemischt, statt direkt mit dem Gewicht 1/n gestreut zu werden. Direkt bekäme jeder Sprite 1/n der Größe der Summe, zu der er gehört, und ein Half-Float-Ziel würde das wegrunden - am schlimmsten dort, wo es am dichtesten ist ([Half-Float-Akkumulation](half-float-accumulation.md)).

### Konvergenz {#convergence}

Der Plan jedes Bildes kennt, wie viele Kandidatenzeilen es gibt und wie viele es einreicht, so dass die Zahl der Bilder, die nötig sind, um jede Zeile abzudecken, ⌈Kandidaten / eingereicht⌉ ist. Sind so viele Bilder verschmolzen, ist die Ansicht **konvergiert**: Die Zeile *Abdeckung* der Statistik-Überlagerung wechselt von einem Prozentwert zu *genau*, und weitere Bilder ruhen. Mit **Jede Zeile in jedem Frame zeichnen** an (der Standard) deckt ein einziges Bild meist alles ab, die Konvergenz ist also sofort, und die progressive Maschinerie braucht man nur, wenn das Fenster mehr Zeilen enthält, als ein Zeichenplan tragen kann (etwa 67 Millionen).

### Was sie neu startet {#what-restarts-it}

Die Einstellungen fallen in drei Gruppen, je nachdem, was der Akkumulationspuffer nach ihrer Änderung noch bedeutet:

| Gruppe | Ändert | Wirkung |
|---|---|---|
| **Geometrie** - welche Zeilen beitragen und wie viel | Ansichtsmodus; Linienrouten; Sprite-Radius, Intensität in der Mitte und am Rand, Abfall, weicher Verlauf, die Kurve, Pixelgrenzen, Abflachen; Entfernungs-Culling nah, fern und planar; Verdeckung und Hinter Gelände verbergen; der Schnitt; Leinwandgröße; Heatmap-Auflösung; Gruppensichtbarkeit und Vorzeichen; die Teilung Differenz; Alle / Abspielen; die Historie; die Spaltenfilter und die Auswahl der Entitäten; der Half-Float-Gewinn | Zurücksetzen. |
| **Fenster** - der Zeitbereich | das Bewegen des Abspielkopfs; der Lebensdauer-Ersatz und das Ausblenden | Extend (kumulativ) oder gleitender Mittelwert (gleitend). |
| **Zusammensetzung** - nur die Farbgebung | Sättigung, Dichteverhalten, Mindestintensität, die Farbverläufe; das Schneiden des Levels; Raster und Achsen; Einstellungen und Session des Box-Replays; Tiefenschärfe | Neu zeichnen, ohne die Wärme anzufassen. |

Eine Kamerabewegung setzt immer zurück. Das Ziehen der Sättigung oder des Verlaufs kostet also nichts; das Ziehen des Sprite-Radius startet die Konvergenz bei jedem Schritt neu.
