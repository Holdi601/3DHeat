---
title: "Akkumulation mit Half-Float"
parent: "Interna des Renderings"
nav_order: 4
lang: "de"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Halbfloat-Akkumulation

Manche Grafikkarten können Hitze nur in kleinen 16-Bit-Zahlen halten. Das könnte die heißesten Stellen abschneiden oder runden. Der Viewer skaliert die Zahlen, damit man davon nichts sieht. Du musst nichts tun. Diese Seite ist für Entwickler.

## Für Entwickler {#for-developers}

Ein Gerät, das nicht in 32-Bit-Fließkomma-Texturen mischen kann (kein `float32-blendable` und `float32-filterable` auf WebGPU, kein `EXT_float_blend` auf WebGL2), bekommt ein Ziel für die Heatmap mit **16-Bit-Fließkomma** (`r16float`). Der Maximalwert ist 65.504, und die Mantisse hat 11 Bit. Ein dichtes Feld erreicht mehrere hunderttausend. Ein 16-Bit-Ziel **schneidet ab** und **rundet**. Der Rundungsfehler wächst mit dem Wert. Das zeigt sich sehr bestimmt: Die dichtesten Bereiche wirken weit kühler als sie sind, während dünn besetzte Bereiche richtig aussehen. Zwei Mechanismen behandeln das. Das Bild stimmt nur, wenn beide funktionieren.

### Bereich: eine Verstärkung bei jedem Splat {#range-a-gain-on-every-splat}

Jeder Splat wird mit einer **Verstärkung** multipliziert. Das Komposit teilt sie wieder heraus. So liegt das Feld in der Größenordnung, die Halbfloats gut verarbeiten ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
Schätzung = analytische Sättigungsschätzung für diesen Datensatz, Radius und Mittelpunkts-Intensität
Verstärkung = 2 ^ round(log2(2048 / Schätzung)), Exponent begrenzt auf -20..20
```

2048 lässt etwa das 32-Fache Luft über der Spitze des Verlaufs, bevor 65.504 erreicht ist. Die Verstärkung ist eine **Zweierpotenz**. Eine kleine Abweichung der Schätzung ändert sie deshalb nicht, und auch den akkumulierten Puffer nicht. Sie ist Teil der [Geometrie-Signatur](accumulation.md#what-restarts-it). Eine Änderung startet die Akkumulation deshalb neu.

Sie wird an die analytische Schätzung gebunden und ausdrücklich **nicht** an den Sättigungspunkt. Die Sättigung wird erst beim Komposit angewendet, damit das Ziehen am Regler nie die Konvergenz neu startet. Würde sich die Verstärkung mit ihm bewegen, enthielte der Puffer noch Werte, die mit der alten Verstärkung geschrieben wurden, während das Komposit durch die neue teilt. Die beiden Fehler würden sich genau aufheben, und der Regler sähe aus, als täte er nichts.

Auf einem 32-Bit-Ziel ist die Verstärkung immer 1.

### Genauigkeit: Teilbilder von null aus {#precision-partial-frames-from-zero}

Ein Bild, das mit dem Gewicht 1/n in den Akkumulator verschmolzen wird, wird zuerst von null aus in ein **Zwischenziel** gesplattet und dann eingeblendet. Es wird nicht direkt mit dem Gewicht 1/n in den Akkumulator gesplattet ([Akkumulation](accumulation.md#why-each)). Direkt wäre der Beitrag jedes Sprites nur 1/n der laufenden Summe, zu der er addiert wird. Ein Halbfloat rundet diese Anteile weg, und je dichter der Bildpunkt, desto schlimmer. Von null aus ist jeder Summand mit der Summe vergleichbar, zu der er kommt. Das ist dieselbe Rechnung, die ein einzelnes Bild schon macht.

### Gemessene Wirkung {#measured-effect}

Auf einer dichten synthetischen Szene, gelesen in vergleichbaren Einheiten:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-Bit (Referenz) | 6051 | 60742 | 121199 | 232744 |
| 16-Bit vorher | 1372 | 6972 | 7840 | 7840 |
| 16-Bit nachher | 5996 | 59666 | 118824 | 210357 |

Der Spitzenwert ging von 30-mal zu niedrig auf 0,90-mal. Das Komposit-Bild stimmt mit dem 32-Bit-Bild auf 0,1 % der mittleren Helligkeit überein.

### Testen {#testing-it}

`?heat=f16` erzwingt diesen Pfad auf beiden Backends. Ohne einen solchen Schalter würde die Rechnung, die nur schwächere GPUs ausführen, nur von den Leuten getestet, die sie ausführen. `npm run smoke:f16` führt die ganze Browser-Testreihe damit aus.

Beim Rücklesen wird die Verstärkung wieder herausgerechnet. Die Auto-Belichtung teilt das gelesene Feld durch sie, und `engine.readHeatProbe()` gibt sie an den Renderer weiter. So wird auch die [Live-Heat-Anzeige des Lineals](measure.md#notes) gelesen.
