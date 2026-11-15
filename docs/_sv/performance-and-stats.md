---
title: "Prestandapanelen och statistik"
parent: "Rendering i detalj"
nav_order: 7
lang: "sv"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Prestandapanelen och statistik

Rutan uppe till höger i vyn visar hur hårt visaren arbetar: hur många bilder per sekund, hur många punkter den ritar och om den fortfarande förfinar bilden. Panelen **Prestanda** låter dig byta bildkvalitet mot hastighet.

## Statistikrutan {#the-stats-overlay}

Rutan uppe till höger i vyn på flikarna Värmekarta och Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Den läser motorns livemätning varje animationsbildruta.

![Statistikrutan i scenen med många matcher, med numrerade förklaringar: 1 Backend, 2 FPS, 3 Frame, 4 Rows in window, 5 Sprites / frame, 6 Budget, 7 Heat res, 8 Coverage](../assets/img/en/performance-stats-overlay.webp)

| Rad | Betydelse |
|---|---|
| **Backend** | *WebGPU* eller *WebGL2*. Håll muspekaren över raden för att se varför WebGPU inte användes, om den inte användes. Se [De två bakändarna](backends.md). |
| **FPS** | Bilder per sekund, medelvärde över minst 0,4 s. |
| **Bildruta** | Bildtiden i ms, utjämnad (90 % tidigare värde, 10 % nytt). Det är tiden mellan bilderna, inte GPU-tid; ingen GPU-tid per pass mäts. |
| **Rader i fönstret** | Kandidatrader: raderna i det aktuella tidsfönstret, före filtreringen per rad i shadern. |
| **Sprites / bildruta** | Sprites som den senaste bildrutans plan skickade. Behålls på den planerade siffran i vilande bildrutor, som inte ritar något. |
| **Budget** | Spritebudgeten som den här bildrutan planerades med: den adaptiva regulatorns värde, höjt till alla kandidater när varje rad ritas. |
| **Värmeupplösning** | Värmebufferns upplösning som andel av canvasen: inställningen *Värmeupplösning* gånger den adaptiva skalan i steg två. |
| **Täckning** | Hur långt den progressiva ackumuleringen har kommit mot att använda alla rader: en procentsats medan den konvergerar (gul), och *exact* när den är klar. En brusig bildruta förväxlas aldrig med den färdiga bilden. |
| **Kuber** | Boxar som ritas i [Figuröverlägg](box-replay.md). |
| **Inte i minnet** | Visas bara när rader inte fick plats i GPU-budgeten: hur många. Se [GPU-minnets residens](gpu-memory.md). |

## Hastighetsvisningen {#the-speed-display}

Nere till höger i vyn, bara i perspektiv: flyghastigheten och tiden det tar att korsa datan med den hastigheten. Dra i visningen för att ändra hastigheten. Se [Kamera och styrning](camera.md#fly-speed).

## Om visaren är långsam {#if-the-viewer-is-slow}

Titta på statistikrutan och gå sedan igenom följande:

1. **Rader i fönstret mycket fler än Sprites / bildruta, Täckning under 100 %**: bildrutan hinner inte rita allt. Den konvergerar över flera bildrutor när vyn står still. Smalna av fönstret, filtrera eller bortsortera för att minska kandidaterna, eller acceptera samplingen.
2. **Sprites / bildruta lika med Rader i fönstret, och bildrutan ändå långsam**: kostnaden ligger per sprite på skärmen. Sänk *Max pixel radius* ([Spriteform](sprite-shape.md#pixel-clamps)) eller *Värmeupplösning*.
3. **Långsam med få rader**: troligen banan. Många strukturer med kanter på, markytor och skärpedjup kan göra det. Se [Banans utseende](level-appearance.md).
4. **Allt är långsamt och en röd banderoll visas**: programvarurendering ([Identifiering av programvarurendering](software-rendering.md)).

## Prestandapanelen {#the-performance-panel}

| Kontroll | Standard | Effekt |
|---|---|---|
| Tips | | Varje bildruta sprider en stratifierad slumpmässig delmängd av de synliga raderna, med vikten skalad för att kompensera. Den förväntade värmen blir därmed exakt vid vilken budget som helst. Om vyn står still fortsätter bildrutorna att slås ihop tills varje rad har bidragit. |
| **Rita alla rader varje bildruta** | på | Varje bildruta som startar en ny skattning ritar alla kandidatrader (upp till cirka 268 M). Budgeten nedan blir ett golv. [Sampling och budgetar](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptiv budget** | på | Justerar sprites per bildruta, sedan värmeupplösning, för att hålla målbildfrekvensen. Slutar skära när skärning inte hjälper. [Sampling och budgetar](sampling-and-budgets.md#the-adaptive-budget) |
| **Mål-FPS** | 60 | 20–240 (1000 med handtaget). Värden under 15 räknas som 15. |
| **Startvärde sprites / bildruta** / **Sprites / bildruta** | 4,00 M | 65 536–268 435 456, logaritmiskt. Heter *Startvärde* när den adaptiva budgeten är på, eftersom regulatorn flyttar värdet. |
| **Värmeupplösning** | 100 % | 25–100 %. Fragmentkostnaden skalar med kvadraten: 50 % ger en fjärdedel av blandningsarbetet, och värmefältet är så jämnt att det knappt syns. |
| **Progressiv förfining** | på | Ackumulera över bildrutor medan vyn står still. Av visar enbildsskattningen varje bildruta. [Ackumulering](accumulation.md) |
| **Resursbudgetar** | upptäckta | Budgetar för RAM, GPU och parsertråd. [Minne och budgetar](memory-and-budgets.md#resource-budgets) |

Inget av detta sparas. En omladdning återställer standardvärdena.
