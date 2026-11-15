---
title: "Varme"
parent: "Varmetilstande"
nav_order: 1
lang: "da"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Varme

Varme maler de steder, hvor det er sket meget: rødt, hvor der skete lidt, hvidglødende, hvor der skete meget. Den besvarer "hvor sker dette, og hvor meget?".

**Varme** (tast 1) er standardtilstanden. Hver synlig [række](glossary.md) bidrager med en rund [sprite](glossary.md), der vender mod kameraet; overlappende sprites lægges sammen i en flydende-kommatal-buffer; summen føres gennem en farverampe – som standard gennemsigtig → rød → gul → hvid – og tegnes ovenpå scenen.

![Varme på en 3D-bane: hot spots inde i og oven på bygningerne](../assets/img/en/shooter-heat.webp)

Billedet viser varmen fra en skydeomgang på en bane med bygninger: hot spots ligger i rummene og på trappen, ikke kun på jorden.

## Sådan bruger du den {#how-to-use-it}

1. Indlæs data, og tryk på `1` (eller vælg **Varme** i tilstandslinjen).
2. Hvis alt er hvidt eller tomt, tryk på **Automatisk eksponering ud fra feltet** i afsnittet **Varmeform**.
3. Skift **Sprite-radius**, til nabopunkter smelter sammen til bånd: mindre viser enkeltpletter, større viser områder.
4. Åbn **Varmefarver** for at ændre farverne, eller **Dybde** for at lade bakker og vægge skjule varmen bag sig.

![Afsnittene Varmeform og Varmefarver i sidebjælken, begge åbne](../assets/img/en/heat-panel.webp)

De samme paneler former [Forskel](difference.md), [Holdvarme](team-heat.md) og [Linjevarme](line-heat.md); de adskiller sig i, hvad der lægges til (med fortegn, farvet eller langs linjer), ikke i hvordan.

## Panelerne og deres standarder {#the-panels-and-their-defaults}

Hver styring nedenfor svarer til en shader-parameter, så en ændring koster intet andet end en ny tegning. Skydere har en skrivbar boks ved siden af sig og et trækhåndtag (det lille greb til højre: træk op eller ned, længere træk er hurtigere, Shift for finjustering); hvor en skyders spor slutter, før en egentlig grænse, kan håndtaget skubbe forbi den op til det *jog-loft*, der er angivet her. Værdier markeret *ved indlæsning* genberegnes for hvert nyt datasæt.

### Varmeform (åben) {#heat-shape-open}

| Styring | Standard | Interval (jog-loft) | Detaljer |
|---|---|---|---|
| **Sprite-radius** | 6 m; ved indlæsning udstrækning / 120 | 0,05-2000 m, logaritmisk (50.000) | [Spriteform](sprite-shape.md#sprite-radius) |
| **Intensitet i centrum** | 1 | 0-10 (1000) | [Spriteform](sprite-shape.md#centre-and-edge-intensity) |
| **Intensitet ved kanten** | 0 | -2-10 (1000) | [Spriteform](sprite-shape.md#centre-and-edge-intensity) |
| **Rampens form** | *Aftagning* | *Aftagning* / *Kurve* | [Spriteform](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Aftagning** (kun Aftagning) | 1,6 | 0,1-8 (64) | [Spriteform](sprite-shape.md#falloff) |
| **Blød rampe** (kun Aftagning) | til | | [Spriteform](sprite-shape.md#falloff) |
| Kurveeditor (kun Kurve) | forudindstillingen *Blød* | | [Spriteform](sprite-shape.md#the-curve-editor) |
| **Mætningspunkt** | 24; ved indlæsning et skøn, derefter målt | 0,1-4000, logaritmisk (10.000.000) | [Farve og eksponering](colour-and-exposure.md#saturation-point) |
| **Minimumsvarme** | fra (0) | 0-100 % | [Farve og eksponering](colour-and-exposure.md#minimum-heat) |
| **Tæthedsrespons** | *Mætning* | *Mætning* / *Lineær* / *Log* | [Farve og eksponering](colour-and-exposure.md#density-response) |
| **Automatisk eksponering ud fra feltet** | | knap | [Farve og eksponering](colour-and-exposure.md#auto-exposure) |
| **Følg visningen** | til | | Måler eksponeringen igen, hver gang kameraet kommer til ro, så et område, du flyver ind i, bruger hele farverampen. Små ændringer ignoreres, og skalaen glider. Fjern markeringen, eller træk i **Mætningspunkt**, for at låse skalaen og sammenligne steder på én skala. [Farve og eksponering](colour-and-exposure.md#follow-the-view) |
| **Samme tæthed ved enhver zoom** | til | | En farve betyder det samme antal rækker pr. areal af jorden, uanset hvor tæt du er. En sprite, som pixelgrænserne forstørrer (langt væk) eller formindsker (tæt på), beholder den varme, dens rigtige størrelse ville tilføje, så et billede eksponeret langt fra ikke bliver blegt, når du flyver ind i det. Slået fra, lægger en begrænset sprite sin fulde vægt til i sin begrænsede størrelse. [Spriteform](sprite-shape.md#pixel-clamps) |
| **Flad ud på jordplanet** | fra | | [Spriteform](sprite-shape.md#flatten-onto-ground-plane) |

### Varmefarver (lukket) {#heat-colours-closed}

| Styring | Standard | Detaljer |
|---|---|---|
| Gruppeprøver og **Farveadskillelse** (kun Holdvarme) | 1,4 | [Holdvarme](team-heat.md) |
| **Varmerampe**-editor (*Positiv (additive hold)* i Forskel, *Opacitetsrampe* i Holdvarme) | gennemsigtig → rød → gul → hvid | [Farve og eksponering](colour-and-exposure.md#the-ramp-editor) |
| **Nulstil til gennemsigtig → rød → gul → hvid** | | |
| **Negativ (subtraktive hold)**-rampe (kun Forskel) | gennemsigtig → grøn → blå → lilla | [Forskel](difference.md#colours) |

### Sprite-pixelgrænser (lukket) {#sprite-pixel-clamps-closed}

| Styring | Standard | Interval (jog-loft) | Detaljer |
|---|---|---|---|
| **Min. pixelradius** | 1 px | 0-16 (512) | [Spriteform](sprite-shape.md#pixel-clamps) |
| **Maks. pixelradius** | 96 px | 2-1024, logaritmisk (8192) | [Spriteform](sprite-shape.md#pixel-clamps) |

### Dybde (åben) {#depth-open}

| Styring | Standard | Detaljer |
|---|---|---|
| **Skjul bag terræn** | til | [Dybde og culling](depth-and-culling.md#hide-behind-terrain) |
| **Skjult bag geometri** | 0,8 (*80 % mørkere*) | [Dybde og culling](depth-and-culling.md#hidden-behind-geometry) |

### Afstandsudsnit (lukket) {#distance-culling-closed}

| Styring | Standard | Interval (jog-loft) | Detaljer |
|---|---|---|---|
| **Nær** | fra (0) | 0,5-5000 m, logaritmisk; nederst på sporet = fra (200.000) | [Dybde og culling](depth-and-culling.md#distance-culling) |
| **Fjern** | fra (0) | 1-200.000 m, logaritmisk; nederst = fra (10.000.000) | [Dybde og culling](depth-and-culling.md#distance-culling) |
| **Skær ved et plan** | til | | [Dybde og culling](depth-and-culling.md#distance-culling) |
| **Skær også banen** | til | | [Dybde og culling](depth-and-culling.md#distance-culling) |

Taster: `[` og `]` skubber den fjerne grænse ind og ud, `\` skifter den til og fra ([Dybde og culling](depth-and-culling.md#keyboard)).

### Retning og Værdi {#direction-and-value}

To flere afsnit ligger under Varmeform. **Retning** tegner hver række som en kile og tilføjer pile: se [Retningsvarme](directional-heat.md). **Værdi** vægter varmen efter, hvad hver række kostede eller indbragte: se [Værdivægtning](value-weighting.md).

## Hvad der gemmes {#what-is-saved}

Varmeindstillingerne ovenfor gemmes ikke mellem sessioner: genindlæser du siden, gendannes standarderne. To ting gemmes i browseren: den sidst brugte afspilningshastighed (`heat3d.speed`, se [Tidslinje](timeline.md)) og indstillingerne for de fjerntliggende figurer i [figuroverlejringen](box-replay.md) (symboltypen, størrelse, træfmærker og så videre). Det samme gælder sproget, de [omvendte verdensakser](camera.md#invert-world-axis), bilnavnene, som fanen Løbsanalyse husker, og [banebiblioteket](level-library.md). Den fulde liste findes under [Gemte indstillinger](ref-settings-storage.md).
