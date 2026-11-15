---
title: "Prestatiepaneel en statistieken"
parent: "Renderinginterne werking"
nav_order: 7
lang: "nl"
source: "performance-and-stats.md"
source_hash: "5144098d2cb4"
translated: true
outdated: false
---

# Prestatiepaneel en statistiekenoverlay

Het vak rechtsboven in de weergave laat zien hoe hard de viewer werkt: hoeveel frames per seconde, hoeveel stippen hij tekent, en of hij het beeld nog verfijnt. Met het paneel **Prestaties** ruil je beeldkwaliteit voor snelheid.

## De statistiekenoverlay {#the-stats-overlay}

Het vak rechtsboven in de weergave, op de tabbladen Heatmap en Match ([`StatsOverlay.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/StatsOverlay.tsx)). Het leest elk animatieframe de live uitlezing van de engine.

![De statistiekenoverlay op de scène van veel wedstrijden, met genummerde aanwijzers: 1 Backend, 2 FPS, 3 Frame, 4 Rijen in venster, 5 Sprites / frame, 6 Budget, 7 Heatmapresolutie, 8 Dekking](../assets/img/en/performance-stats-overlay.webp)

| Regel | Betekenis |
|---|---|
| **Backend** | *WebGPU* of *WebGL2*. Wijs erop voor de reden waarom WebGPU niet is gebruikt, als dat niet het geval is. Zie [De twee backends](backends.md). |
| **FPS** | Frames per seconde, gemiddeld over minstens 0,4 s. |
| **Frame** | Frametijd in ms, afgevlakt (90% vorige, 10% nieuwe). Dit is de tijd tussen frames, niet de GPU-tijd - er wordt geen GPU-tijd per pass gemeten. |
| **Rijen in venster** | Kandidaatrijen: de rijen in het huidige tijdvenster, vóór het filteren per rij in de shader. |
| **Sprites / frame** | Sprites die het plan van het laatste frame heeft ingediend (blijft op de geplande waarde staan bij stilstaande frames, die niets tekenen). |
| **Budget** | Het spritebudget waarmee dit frame is gepland - de waarde van de adaptieve regelaar, verhoogd naar alle kandidaten wanneer elke rij wordt getekend. |
| **Heatmapresolutie** | De resolutie van de warmtebuffer als aandeel van het canvas: de instelling *Heatmapresolutie* maal de adaptieve schaal van fase twee. |
| **Dekking** | Hoe ver de progressieve opbouw is gekomen om elke rij te gebruiken: een percentage tijdens het convergeren (oranje), *exact* als het klaar is. Een ruisig frame wordt nooit voor het afgeronde beeld aangezien. |
| **Kubussen** | Dozen die getekend zijn in [Figurenoverlay](box-replay.md). |
| **Niet in het geheugen** | Alleen zichtbaar wanneer rijen niet in het GPU-budget pasten: hoeveel. Zie [GPU-geheugenverblijf](gpu-memory.md). |

## De snelheidsaanduiding {#the-speed-display}

Rechtsonder in de weergave, alleen in perspectief: de vliegsnelheid en de tijd om de data met die snelheid te doorkruisen. Sleep erop om de snelheid te wijzigen. Zie [Camera en bediening](camera.md#fly-speed).

## Als de viewer traag is {#if-the-viewer-is-slow}

Kijk naar de statistiekenoverlay, en daarna:

1. **Rijen in venster veel groter dan Sprites / frame, Dekking onder 100%** - het frame kan niet alles tekenen; het convergeert over meerdere frames als het stilstaat. Maak het venster smaller, filter of snijd weg om de kandidaten te verminderen; of accepteer de bemonstering.
2. **Sprites / frame gelijk aan Rijen in venster, frame toch traag** - de kosten zitten per sprite op het scherm: verlaag de *Maximale pixelstraal* ([Vorm van sprite](sprite-shape.md#pixel-clamps)) of de *Heatmapresolutie*.
3. **Traag met weinig rijen** - waarschijnlijk het niveau: veel structuren met randen aan, grondtriangels, scherptediepte. Zie [Uiterlijk van niveau](level-appearance.md).
4. **Alles traag, en een rode banner** - softwarerendering ([Detectie van softwarerendering](software-rendering.md)).

## Het Prestatiepaneel {#the-performance-panel}

| Bediening | Standaard | Effect |
|---|---|---|
| Uitleg | | Elk frame splatt een gestratificeerde willekeurige deelverzameling van de zichtbare rijen, met een gewicht dat is geschaald om te compenseren, zodat de verwachte warmte bij elk budget exact is; het beeld stilhouden blijft frames samenvoegen tot elke rij heeft bijgedragen. |
| **Elke rij elk frame tekenen** | aan | Elk frame dat een nieuwe schatting begint, tekent elke kandidaatrij (tot ongeveer 268M); het budget hieronder wordt een ondergrens. [Bemonstering en budgetten](sampling-and-budgets.md#draw-every-row-each-frame) |
| **Adaptief budget** | aan | Stel sprites per frame, en daarna de warmteresolutie, zo in dat de doel-framesnelheid blijft - en stop met bijsnijden wanneer bijsnijden niet helpt. [Bemonstering en budgetten](sampling-and-budgets.md#the-adaptive-budget) |
| **Doel-FPS** | 60 | 20-240 (1000 met de greep). Waarden onder 15 worden als 15 behandeld. |
| **Start-sprites / frame** / **Sprites / frame** | 4,00M | 65.536-268.435.456, logaritmisch. Heet *Start* zolang adaptief aan staat, omdat de regelaar hem verplaatst. |
| **Heatmapresolutie** | 100% | 25-100%. De kosten van de fragmenten schalen met het kwadraat: 50% geeft een kwart van het mengwerk, en het warmteveld is zo glad dat het nauwelijks opvalt. |
| **Progressieve verfijning** | aan | Opbouwen over frames heen zolang het beeld stilstaat. Uit toont elk frame de schatting van één frame. [Accumulatie](accumulation.md) |
| **Resourcebudgetten** | gedetecteerd | Budgetten voor RAM, GPU en de parserthread. [Geheugen en budgetten](memory-and-budgets.md#resource-budgets) |

Geen van deze wordt bewaard; een herlaad zet de standaardwaarden terug.
