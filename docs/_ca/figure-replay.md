---
title: "Figures a la superposició de figures"
parent: "Figures"
grand_parent: "Repetició"
nav_order: 2
lang: "ca"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figures a la superposició de figures

Aquesta pàgina tracta de convertir les caixes en petites figures 3D del que era realment cada unitat, i del fum i el foc que deixen les figures. Els controls de la pròpia repetició són a [Repetició de partida](match-replay.md).

A la [repetició de caixes](box-replay.md) i a la repetició de figures de la pestanya Partida, **Figures en lloc de caixes** (activat per defecte) dibuixa cada persona viva com la figura del que és: un soldat a peu, el tanc que condueix algú, l'avió que és una traça de Tacview. La figura té el color, el lloc i el rumb de la caixa. Per als avions i els míssils també té cabussada i, quan les dades tenen una columna Roll, inclinació. **Mida de les figures** les escala; 1 vegada és la mida real. Els clics sobre una figura responen com responien els de la seva caixa.

## Quina figura {#which-figure}

Mandan les pròpies columnes de nom i de tipus de les dades. Les regles completes, amb els noms de columna, són a [Figures](figures.md#which-figure-a-unit-gets). Les dades sense cap de les dues classes de columna són dades de persones: tothom és un soldat.

La coincidència es guarda a la memòria cau per etiqueta, de manera que un fotograma només costa la col·locació. Una unitat de dades és un metre tret que les dades diguin quant mesura una cosa seguida (l'exportació de CS2 diu que un jugador fa 32 unitats d'ample); les figures s'escalen per encaixar-hi.

Un paquet opcional de figures pròpies pot substituir les figures del catàleg a la teva màquina; vegeu [Figures](figures.md#an-optional-local-figure-pack).

## Efectes {#effects}

Les files d'esdeveniments que deixen alguna cosa durant una estona es dibuixen on van passar durant tota la seva durada, amb el color de qui les va causar: un fum (uns 18 s), un molotov o incendiari (7 s), un flaix (uns 1 s) i una explosió HE (menys d'1 s), un senyuelo (15 s), una bomba col·locada (40 s). Venen d'una columna d'esdeveniments (Event, Events) l'etiqueta de la qual és `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` o `plant`: l'exportació de CS2 les escriu a la detonació.

## Repetició de partida: les eines de Tacview {#match-replay-tacviews-tools}

Les càmeres, els marcadors, la visualització tàctica, les estadístiques, les etiquetes, les **Línies verticals**, la llista d'esdeveniments i la finestra de gràfics es descriuen a [Repetició de partida](match-replay.md). [Paritat amb Tacview](tacview-parity.md) enumera cada funció de Tacview i en quin punt és.
