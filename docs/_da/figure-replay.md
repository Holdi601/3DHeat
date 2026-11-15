---
title: "Figurer i figuroverlejringen"
parent: "Figurer"
grand_parent: "Replay"
nav_order: 2
lang: "da"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figurer i figuroverlejringen

Denne side handler om at gøre boksene til små 3D-figurer af, hvad hver enhed egentlig var, og om røgen og ilden, figurerne efterlader. Replayets egne styringer findes på [Kamp-replay](match-replay.md).

I [boksreplay](box-replay.md) og figurreplayet i fanen Kamp tegner **Figurer i stedet for bokse** (slået til som standard) hver levende person som figuren af det, de er: en soldat til fods, tanken nogen kører, eller flyet et Tacview-spor er. Figuren har boksens farve, sted og retning. For fly og missiler har den også hældning og, hvor dataene har en Roll-kolonne, krængning. **Figurstørrelse** skalerer dem, og 1 gange er sand størrelse. Klik på en figur svarer, som klik på dens boks gjorde.

## Hvilken figur {#which-figure}

Dataens egne navne- og typekolonner afgør det. De fulde regler med kolonnenavnene står på [Figurer](figures.md#which-figure-a-unit-gets). Data uden nogen af de to slags kolonner er data om mennesker: alle er en soldat.

Opslaget mod kataloget caches pr. etiket, så et billede kun koster placeringen. En dataenhed er en meter, medmindre dataene siger, hvor stor én sporet ting er. CS2-eksporten siger fx, at en spiller er 32 enheder bred. Figurerne skaleres efter det.

En valgfri pakke med egne figurer kan erstatte katalogfigurer på din maskine. Se [Figurer](figures.md#an-optional-local-figure-pack).

## Effekter {#effects}

Hændelsesrækker, der efterlader noget i et stykke tid, tegnes der, hvor de skete, så længe det varer, i farven af den, der forårsagede dem. En røggranat (cirka 18 s), en molotov eller brandbombe (7 s), et blits (cirka et sekund) og et HE-udbrud (under et sekund), en lokkegenstand (15 s) og en plantet bombe (40 s). De kommer fra en hændelseskolonne (Event, Events), hvis etiket er `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` eller `plant`. CS2-eksporten skriver dem ved detonationen.

## Kamp-replay: Tacviews værktøjer {#match-replay-tacviews-tools}

Kameraer, bogmærker, den taktiske visning, statistik, etiketter, **Lodlinjer**, hændelseslisten og diagramvinduet beskrives på [Kamp-replay](match-replay.md). [Tacview-paritet](tacview-parity.md) lister hver Tacview-funktion og hvor den står.
