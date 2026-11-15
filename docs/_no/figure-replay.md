---
title: "Figurer i figuroverlegget"
parent: "Figurer"
grand_parent: "Repriser"
nav_order: 2
lang: "no"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figurer i figuroverlegget

Denne siden handler om å gjøre bokser om til små 3D-figurer av hva hver enhet virkelig var, og om røyken og ilden som figurene etterlater seg. Kontrollene for selve replayet står på [Kampreplay](match-replay.md).

I [boksreplay](box-replay.md) og figurreplayet i fanen Kamp tegner **Figurer i stedet for bokser** (på som standard) hver levende person som figuren av det de er: en soldat til fots, stridsvognen noen kjører, flyet et Tacview-spor er. Figuren har boksens farge, sted og kurs. For fly og missiler har den også stigning og, der dataene har en Roll-kolonne, krengning. **Figurstørrelse** skalerer dem; 1 gang er sann størrelse. Klikk på en figur svarer som klikk på boksen gjorde.

## Hvilken figur {#which-figure}

Dataenes egne navne- og typekolonner avgjør. Hele reglene, med kolonnenavnene, står på [Figurer](figures.md#which-figure-a-unit-gets). Data uten noen av disse kolonnetypene er data om personer: alle er soldater.

Treffet er bufret per etikett, så et bilde koster bare plasseringen. En dataenhet er en meter med mindre dataene sier hvor stor én sporet ting er (CS2-eksporten sier at en spiller er 32 enheter bred); figurene skaleres for å passe.

En valgfri pakke med egne figurer kan erstatte katalogfigurer på maskinen din; se [Figurer](figures.md#an-optional-local-figure-pack).

## Effekter {#effects}

Hendelsesrader som etterlater noe en stund, tegnes der de skjedde så lenge det varer, i fargen til den som forårsaket dem: en røyk (ca. 18 s), en molotov eller brannbombe (7 s), et blink (ca. ett sekund) og et HE-utbrudd (under ett sekund), en lokkeenhet (15 s), en plantet bombe (40 s). De kommer fra en hendelseskolonne (Event, Events) med etiketten `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` eller `plant` - CS2-eksporten skriver dem ved detonasjonen.

## Kampreplay: Tacviews verktøy {#match-replay-tacviews-tools}

Kameraer, bokmerker, taktisk visning, statistikk, etiketter, **Loddlinjer**, hendelseslisten og diagramvinduet beskrives på [Kampreplay](match-replay.md). [Tacview-paritet](tacview-parity.md) lister opp hver Tacview-funksjon og hvor den står.
