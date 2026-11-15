---
title: "Renderinginterne werking"
nav_order: 22
has_children: true
lang: "nl"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Interne werking van de renderer

De viewer tekent miljoenen stippen als gloeiende vlekken en telt ze op. Deze sectie legt de trucs uit die dat snel houden, en wat de getallen in de statistiekenoverlay betekenen. Lees hem als de viewer traag aanvoelt, of als je aan de renderer wilt werken.

```
data -> tijdvenster -> GPU-filters -> bemonsteringsplan -> splat -> optellen -> kleur -> scherm
```

Om te zien hoe het met je eigen computer gaat, kijk je naar het statistiekenvak rechtsboven in de weergave: [Prestatiepaneel en statistieken](performance-and-stats.md). Nieuwe woorden (GPU, rij, sprite, warmtekaart) staan in de [woordenlijst](glossary.md).

## Het kernprobleem {#the-core-problem}

Een som van overlappende radiale verlopen kost *N* × π*r*² gemengde fragmenten per frame. Bij 100 miljoen sprites met een straal van 8 px is dat 2 × 10¹⁰ fragmenten - ongeveer een seconde werk op een krachtige GPU. Dat kun je niet elk frame met geweld uitrekenen, dus de viewer combineert:

- **op tijd gesorteerde rijen** - een tijdvenster is twee binaire zoekacties, en de rekenkosten van het afspelen volgen de rijen in het venster, niet de hele dataset;
- **niets per rij op de CPU per frame** - rijen staan in GPU-geheugen, gekwantiseerd; filters, groepstekens, de levensduurtest, het venster, het wegsnijden en de snede worden allemaal in de vertexshader berekend;
- **gestratificeerde bemonstering** met compenserende gewichten wanneer een frame niet elke rij kan tekenen, en **progressieve opbouw** die naar het exacte antwoord voor alle rijen convergeert zolang het beeld stilstaat ([Bemonstering en budgetten](sampling-and-budgets.md), [Accumulatie](accumulation.md));
- **een tweetraps-begrenzer** die sprites per frame en daarna de warmteresolutie inruilt voor de framesnelheid ([Bemonstering en budgetten](sampling-and-budgets.md#the-adaptive-budget));
- **afgedwongen geheugenbudgetten**, zodat een dataset die niet past zichtbaar wordt afgekapt in plaats van dat de viewer crasht ([GPU-geheugenverblijf](gpu-memory.md)).

## Eén frame {#one-frame}

De framelus is [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Alles wat met de framesnelheid verandert - camera, afspeelkop, budget - leeft in de engine, niet in de applicatiestatus, dus een frame kost geen React-werk; de status wordt één keer per frame gelezen en alleen teruggeschreven voor laagfrequente uitlezingen.

1. **Nieuwe data?** Een nieuwe dataset wordt op het ene frame aangekondigd (*Uploaden van N rijen naar de GPU*) en op het volgende geüpload, zodat het bericht wordt getekend voordat het werk de thread blokkeert. Een nieuw niveau wordt aan de renderer gegeven; lijnwarmteroutes worden gebouwd of vrijgegeven.
2. **De afspeelkop** schuift op (begrensd op 0,1 s echte tijd per frame), keert terug of stopt.
3. **Camera** leest toetsen, muis en gamepad; de spiegeling van de as wordt in de viewmatrix verwerkt; op WebGPU zet een dieptemapping-matrix het OpenGL-achtige dieptebereik van three.js om naar dat van WebGPU.
4. **Wat zichtbaar is**: het tijdbereik uit de tijdlijn en de geschiedenis; de groepstekentabel (zichtbaarheid alleen bij een splitsing op een kolom); tot vier filters - kolomfilters en de selectie van Entiteiten; de verschilsplitsing.
5. **Kleur- en curvetabellen** worden opnieuw opgebouwd als hun instellingen zijn veranderd.
6. **Budget**: de adaptieve regelaar bepaalt het spritebudget en de warmteresolutie van dit frame; met *Elke rij elk frame tekenen* wordt het budget verhoogd om elke kandidaatrij te dekken.
7. **Signaturen** bepalen wat de opbouwbuffer nog betekent: een wijziging aan iets dat verandert welke rijen bijdragen of hoe (*geometrie*), aan het tijdvenster, of alleen aan hoe het resultaat wordt gekleurd (*samenstelling*). Zie [Accumulatie](accumulation.md#what-restarts-it).
8. **Bemonsteringsplan**: welke blokken rijen worden getekend ([Bemonstering en budgetten](sampling-and-budgets.md)).
9. **Opbouwmodus**: opnieuw beginnen, uitbreiden, voortschrijdend gemiddelde, lopend gemiddelde, of stilstaan.
10. **Geometrie van de dozenreplay** (kubussen, sporen) op de CPU, alleen in die modus en alleen als het niet stilstaat.
11. **Tekenen**: de backend tekent de scène (niveau, raster, assen, dozen, sporen, liniaal), splatst de warmte in het warmtedoel, voegt die samen in de opbouwbuffer, en zet de warmte over de scène heen op het canvas.
12. **Automatische belichting** start wanneer het aftelen op nul komt; de warmtemeting van de liniaal leest hooguit één pixel per 120 ms; uitlezingen worden gepubliceerd.

Een stilstaand frame - geconvergeerd, niets veranderd - slaat de scène en het splatten over, maar **zet nog steeds opnieuw samen**: een WebGL-canvas dat zonder `preserveDrawingBuffer` is gemaakt, heeft na het samenzetten een onbepaalde inhoud, dus erop vertrouwen dat het laatste frame blijft staan is niet veilig. De scène- en warmtedoelen zijn de eigen framebuffers van de viewer en behouden hun inhoud, dus een stilstaand frame kost één schermvullende pass.

## Pagina's in deze sectie {#pages-in-this-section}

- [De twee backends](backends.md) - WebGPU en WebGL2, hoe er één wordt gekozen, URL-schakelaars
- [Accumulatie](accumulation.md) - opnieuw beginnen, uitbreiden, voortschrijdend gemiddelde, lopend gemiddelde
- [Bemonstering en budgetten](sampling-and-budgets.md) - de gestratificeerde sampler, exacte modus, het adaptieve budget
- [Half-float-accumulatie](half-float-accumulation.md) - bereik en precisie op 16-bit-doelen
- [GPU-geheugenverblijf](gpu-memory.md) - gekwantiseerde rijopslag en het afgedwongen GPU-budget
- [Detectie van softwarerendering](software-rendering.md)
- [Prestatiepaneel en statistieken](performance-and-stats.md)
