---
title: "Varmetilstande"
nav_order: 4
has_children: true
lang: "da"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Varmetilstande

Hver prik tilføjer en lille glød, glødene hobes op, og bunken males i farver. Tilstandene er fem måder at male den på, og hver besvarer ét spørgsmål.

Tilstandslinjen øverst i Heatmap-fanens sidebjælke vælger, hvordan [datasættet](glossary.md) tegnes. Tasterne 1-4 vælger Varme, Forskel, Holdvarme og Linjer. Figuroverlejring har ingen tast.

![Tilstandslinjen med Varme, Forskel, Holdvarme, Figuroverlejring og Linjer](../assets/img/en/heat-modes-bar.webp)

| Tilstand | Spørgsmål den besvarer |
|---|---|
| **Varme** | Hvor skete det, og hvor meget? |
| **Forskel** | Hvilken side gjorde det mest? |
| **Holdvarme** | Hvis var det? |
| **Linjer** | Hvilken vej gik folk? |
| **Figuroverlejring** | Hvem var hvor, og hvornår? |

![De samme data i fire tilstande: Varme, Forskel, Holdvarme og Linjer](../assets/img/en/heat-modes-grid.webp)

| Tilstand (navn i tilstandslinjen) | Tast | Hvad den tegner | Kræver |
|---|---|---|---|
| **Varme** | 1 | Additiv tæthed: hver synlig række tilføjer en radial sprite, der vender mod kameraet. [Varme](heat.md) | et datasæt |
| **Forskel** | 2 | Fortegnet tæthed: den ene population lægger til, en anden trækker fra. [Forskel](difference.md) | to sider: mindst to grupper eller en opdeling over en bevaret kolonne |
| **Holdvarme** | 3 | Tæthed farvet efter gruppe: en nuance pr. gruppe, blandet hvor grupper overlapper. [Holdvarme](team-heat.md) | en gruppekolonne |
| **Figuroverlejring** | - | En figur (eller boks) pr. person, der bevæger sig langs tidslinjen: replayet. [Figuroverlejring](box-replay.md), [Kamp-replay](match-replay.md) | en personkolonne |
| **Linjer** | 4 | Linjevarme: en linje fra hver prøve af en person til hans næste, med varmen aftagende ud til siderne. [Linjevarme](line-heat.md) | en person- og en tidskolonne |

En tilstand, dataene ikke kan understøtte, er nedtonet, og dens værktøjstip giver grunden, for eksempel *Ikke tilgængelig - Forskel-tilstanden kræver to grupper eller en bevaret kolonne at opdele efter; disse data har én gruppe.* Når et nyt datasæt ikke kan understøtte den aktuelle tilstand, falder visningen tilbage til **Varme**.

Tasterne 1-4 kontrolleres mod dataene på samme måde: en tast for en nedtonet tilstand gør ingenting.

## Hvilke paneler hver tilstand viser {#which-panels-each-mode-shows}

| Panel | Varme | Forskel | Holdvarme | Figuroverlejring | Linjer |
|---|---|---|---|---|---|
| Ruter ([linjevarme](line-heat.md)) | | | | | ja |
| Varmeform (med **Følg visningen** og **Samme tæthed ved enhver zoom**), Varmefarver, sprite-pixelgrænser, Dybde, Afstandsudsnit | ja | ja | ja | | ja |
| Retning ([retningsvarme](directional-heat.md)), Værdi ([værdivægtning](value-weighting.md)) | ja | ja | ja | | ja |
| Holdvisning ([figuroverlejring](box-replay.md)) | | | | ja | |
| Forskelsopdeling ([forskel](difference.md)) | | ja | | | |
| [Hold](teams-list.md), [Enheder](entities.md), [Filtre](filters.md), Baggrund / bane, [Snit](slice.md), [Måling](measure.md), Kamerabane og rendering, Ydelse, Kamera og scene | ja | ja | ja | ja | ja |

## Hvad alle varmetilstande deler {#what-every-heat-mode-shares}

Alle fire varmetilstande (alt undtagen figuroverlejringen) er den samme maskine med forskellige input ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Hvilke rækker.** [Tidslinjens](timeline.md) vindue vælger et sammenhængende interval af tidssorterede rækker; [filtre](filters.md), gruppesynlighed, forskelsopdelingen, [afstandsudsnit](depth-and-culling.md#distance-culling) og [snittet](slice.md) afgør i vertex-shaderen for hver række, om og hvor kraftigt den bidrager.
2. **Splatting.** Hver bidragende række tegnes som en sprite (eller i tilstanden Linjer som et segment) ind i et flydende-kommatal-**varmemål** og lægger sin rampeværdi til. Når der er flere rækker, end et billede kan klare, tegnes en stratificeret prøve af rækkerne, vægtet så det kompenseres. Se [Sampling og budgetter](sampling-and-budgets.md).
3. **Akkumulering.** Så længe intet ændrer sig, slås billeder sammen, indtil hver række har bidraget præcis én gang. Se [Akkumulering](accumulation.md).
4. **Sammensætning.** Den akkumulerede værdi i hver pixel divideres med **mætningspunktet**, formes af **tæthedsresponsen**, løftes af **minimumsvarmen** og slås op i **farverampen**, hvis alfa blander den over scenen. Se [Farve og eksponering](colour-and-exposure.md).

Alt i trin 4 anvendes ved sammensætningen, så træk i de styringer genstarter aldrig akkumuleringen; alt i trin 1-2 gør.

## Sider i dette afsnit {#pages-in-this-section}

- [Varme](heat.md) – den almindelige varmetilstand og oversigten over dens paneler
  - [Spriteform](sprite-shape.md) – radius, intensiteter, aftagning, kurveredigeringen, pixelgrænser, udfladning
  - [Farve og eksponering](colour-and-exposure.md) – rampeeditor, mætningspunkt, automatisk eksponering, minimumsvarme, tæthedsrespons
  - [Dybde og culling](depth-and-culling.md) – skjulning af banen, skjul bag terræn, afstandsudsnit
- [Forskel](difference.md) – forskelsopdelingen
- [Holdvarme](team-heat.md)
- [Linjevarme](line-heat.md) – ruter
- [Figuroverlejring](box-replay.md) – replay-tilstanden (filen hedder stadig box replay)
- [Retningsvarme](directional-heat.md)
- [Værdivægtning](value-weighting.md)
