---
title: "Figurer i figuröverlägget"
parent: "Figurer"
grand_parent: "Repris"
nav_order: 2
lang: "sv"
source: "figure-replay.md"
source_hash: "4b13b8ad6dff"
translated: true
outdated: false
---

# Figurer i figuröverlägget

Den här sidan handlar om att göra lådorna till små 3D-figurer av vad varje enhet verkligen var, och om röken och elden som figurerna lämnar efter sig. Reglagen för själva repriset finns på [Matchrepris](match-replay.md).

I [Figuröverlägg](box-replay.md) och figurrepriset på fliken Match ritar **Figurer i stället för lådor** (på som standard) varje levande person som figuren av vad den är: en soldat till fots, stridsvagnen någon kör, eller flygplanet ett Tacview-spår är. Figuren har lådans färg, plats och kurs. För flygplan och robotar har den också stigning och, där datan har en Roll-kolumn, lutning. **Figurstorlek** skalar dem. 1 gånger är verklig storlek. Klick på en figur svarar som klick på dess låda gjorde.

## Vilken figur {#which-figure}

Datans egna namn- och typkolumner avgör. De fullständiga reglerna, med kolumnnamnen, finns på [Figurer](figures.md#which-figure-a-unit-gets). Data utan någon av kolumnerna är data om personer: alla är soldater.

Matchningen cachas per etikett, så en bildruta kostar bara placeringen. En enhet i datan är en meter, om inte datan säger hur stor en spårad sak är. CS2-exporten säger till exempel att en spelare är 32 enheter bred, och figurerna skalas efter det.

Ett valfritt paket med egna figurer kan ersätta katalogfigurer på din dator. Se [Figurer](figures.md#an-optional-local-figure-pack).

## Effekter {#effects}

Händelserader som lämnar något kvar en stund ritas där de hände så länge det varar, i färgen av den som orsakade dem: en rök (ungefär 18 s), en molotov eller brandgranat (7 s), ett blixtljus (ungefär en sekund) och en HE-smäll (under en sekund), en lockbete (15 s) och en placerad bomb (40 s). De kommer från en händelsekolumn (Event, Events) vars etikett är `smoke`, `molotov`, `incendiary`, `flash`, `he`, `decoy` eller `plant`. CS2-exporten skriver dem vid detonationen.

## Matchrepris: Tacviews verktyg {#match-replay-tacviews-tools}

Kameror, bokmärken, den taktiska visningen, statistik, etiketter, **Lodlinjer**, händelselistan och diagramfönstret beskrivs på [Matchrepris](match-replay.md). [Tacview-paritet](tacview-parity.md) listar varje Tacview-funktion och var den står.
