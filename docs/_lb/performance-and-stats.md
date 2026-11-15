---
title: "Leeschtungspanel an Statistiken"
parent: "Rendering-Interna"
nav_order: 7
lang: "lb"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---


# Leeschtungsfeld an d'Statistikanzeig

D'Box oben riets an der Ansiicht weist, wéi streng d'Visualisatioun schafft: wéivill Bicher pro Sekonn, wéivill Punkten se zeechent, an ob si nach d'Bild verfeinert. Mam **Performance**-Feld kann een d'Bildqualitéit fir Geschwindegkeet tauschen.

## D'Statistikanzeig {#the-stats-overlay}

D'Box oben riets an der Ansiicht bei den Tabs Heatmap an Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Si liest bei all Animatiounsbild d'Live-Uweisung vum Engine.

![D'Statistikanzeig op der Szene mat ville Zuelen, mat Nummeren: 1 Backend, 2 FPS, 3 Frame, 4 Zeilen am Fënster, 5 Sprites / Frame, 6 Budget, 7 Heat-Opléisung, 8 Ofdeckung](../assets/img/en/performance-stats-overlay.webp)

| Zeil | Bedeitung |
|---|---|
| **Backend** | *WebGPU* oder *WebGL2*. Mat der Maus driwwer gesitt Dir, firwat WebGPU net benotzt gouf, wann et net benotzt gouf. Kuckt [Déi zwee Backends](backends.md). |
| **FPS** | Bicher pro Sekonn, am Duerchschnëtt iwwer mindestens 0,4 s. |
| **Frame** | Bildzäit a ms, gegleeft (90 % vum Alen, 10 % vum Neien). Dat ass d'Zäit tëscht de Bicher, net d'GPU-Zäit - eng GPU-Zäit pro Duerchgang gëtt net gemooss. |
| **Zeilen am Fënster** | Kandidatezeilen: d'Zeilen am aktuelle Zäitfënster, ier d'Filter pro Zeil am Shader doriwwer goen. |
| **Sprites / Frame** | Sprites, déi de Plang vum leschte Bild ofginn huet (bei Leerlafbiller, déi näischt zeechnen, bleift de geplangte Wäert stoen). |
| **Budget** | D'Sprite-Budget, mat deem dësen Bild geplangt gouf - de Wäert vum adaptiven Regler, eropgesat op all Kandidaten, wann all Zeil gezeechent gëtt. |
| **Heat-Opléisung** | D'Opléisung vum Heat-Puffer als Unteel vum Canvas: d'Astellung *Heat-Opléisung* mal d'adaptiv Skala vun der zweeter Stufe. |
| **Ofdeckung** | Wéi wäit d'progressiv Akkumuléierung gekuckt huet, all Zeil ze benotzen: e Prozentwäert wärend dem Konvergéieren (orange), *exakt*, wann se fäerdeg ass. E verrauscht Bild gëtt nie fir dat fäerdeg Bild gehalen. |
| **Wierfelen** | Boxen, déi am [Box-Replay](box-replay.md) gezeechent ginn. |
| **Net am Späicher** | Nëmmen ugewisen, wann d'Zeilen net an d'GPU-Budget passen: wéivill. Kuckt [GPU-Späicherresidenz](gpu-memory.md). |

## D'Geschwindegkeetsanzeig {#the-speed-display}

Ënnen riets an der Ansiicht, nëmmen an der Perspektiv: d'Fluggeschwindegkeet an d'Zäit, fir mat deser Geschwindegkeet iwwer d'Daten ze fléien. Zitt se, fir d'Geschwindegkeet ze änneren. Kuckt [Kamera](camera.md#fly-speed).

## Wann d'Visualisatioun lues ass {#if-the-viewer-is-slow}

Kuckt zu der Statistikanzeig, dann:

1. **Zeilen am Fënster vill méi grouss wéi Sprites / Frame, Ofdeckung ënner 100 %** - de Bild kann net alles zeechnen; wann et stoe bleift, konvergéiert et iwwer e puer Biller. Maacht d'Fënster méi schmuel, filtert oder schneid of, fir d'Kandidaten ze reduzéieren; oder hält d'Sampling a Kaf.
2. **Sprites / Frame gläich Zeilen am Fënster, de Bild ass awer nach ëmmer lues** - d'Kaschte gëtt pro Sprite op dem Bildschierm fällig: setzt de *Maximalen Pixelradius* méi nidderg ([Sprite-Form](sprite-shape.md#pixel-clamps)) oder d'*Heat-Opléisung*.
3. **Lues mat wéinege Zeilen** - wahrscheinlech de Level: vill Strukturen mat Kante un, Buedemdreieck, Tiefeschärfe. Kuckt [Level-Ausgesinn](level-appearance.md).
4. **Alles lues, an e rout Banner** - Software-Rendering ([Erkennung vum Software-Rendering](software-rendering.md)).

## D'Performance-Feld {#the-performance-panel}

| Steierung | Standard | Wierkung |
|---|---|---|
| Tipp | | Jiddert Bild spritzt eng geschichtet zoufälleg Auswiel vun den siichtbaren Zeilen, mat eng Gewiicht, déi ausgläicht, sou datt d'Heat bei all Budget exakt ass; wann d'Ansiicht stoe bleift, gi Bilder weider zesummegeféiert, bis all Zeil bäigedroen huet. |
| **Jiddere Zeil all Bild zeechnen** | an | All Bild, dat eng nei Schätzung ufänkt, zeechent all Kandidatezeil (bis ongeféier 268 Mio.); d'Budget hei ënnen gëtt dann eng Ënnergrenz. [Sampling a Budgeten](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptive Budget** | an | D'Sprites pro Bild, dann d'Heat-Opléisung astellen, fir d'Zil-Bildfrequenz ze halen - a mat dem Ofschneiden opzehalen, wann et näischt hëlleft. [Sampling a Budgeten](sampling-and-budgets.md#the-adaptive-budget) |
| **Zil-FPS** | 60 | 20-240 (1000 mat dem Griff). Wäerter ënner 15 ginn als 15 geholl. |
| **Sprites / Frame beim Start** / **Sprites / Frame** | 4,00 M | 65.536-268.435.456, logarithmesch. Heescht *beim Start*, wann de adaptiven Regler un ass, well de Regler en dréit. |
| **Heat-Opléisung** | 100 % | 25-100 %. D'Kaschte vum Fragment wiisst mat dem Quadrat: 50 % mécht d'Mëschaarbecht e Véierel, an d'Heat-Fläch ass glat genuch, datt et kaum opfällt. |
| **Progressiv Verfeinerung** | an | Iwwer Bilder akkumuléieren, solang d'Ansiicht stoe bleift. Aus zeigt all Bild d'Schätzung vun engem eenzege Bild. [Akkumuléierung](accumulation.md) |
| **Ressourcebudgeten** | erkannt | RAM-, GPU- a Parser-Thread-Budgeten. [Erënnerung an Budgeten](memory-and-budgets.md#resource-budgets) |

Näischt vun dësem gëtt gespäichert; wann een nei lued, kommen d'Standardwäerter zréck.
