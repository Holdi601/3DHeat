---
title: "Syntetisk generator"
parent: "Indlæs data"
nav_order: 5
lang: "da"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Syntetisk generator

Ingen data af egen? Tryk på en knap, og 3DHeat finder på et tænkt slag for dig, så lille eller stort som du vil.

1. Åbn panelet **Datasæt** i varmesidebaren (under **Kilde**).
2. Rul ned til **Syntetisk generator**.
3. Sæt **Rækker (millioner)**. Prøv 1 først: standarden på 8 millioner er tung til et første forsøg.
4. Tryk på **Generér**.

![1 million rækker, 8 hold, tegnet i Holdvarme](../assets/img/en/synthetic-generator-team-heat.webp)

Panelet **Datasæt** kan generere et datasæt i stedet for at indlæse et. Det er til to ting: at prøve fremviseren uden data af egen, og at kontrollere, om et givet antal rækker, sprite-radius og budget kan holde en brugbar billedfrekvens på en maskine, *før* du lægger en stor rigtig indlæsning på den. Dens bevægelse er formet som et battle royale-match: hold starter adskilt og presses derefter sammen. Ensartet støj ser fint ud ved ethvert budget og skjuler netop de artefakter, det er værd at fange.

## Styring {#controls}

| Styring | Standard | Betydning |
|---|---|---|
| **Rækker (millioner)** | 8 | Rækker, der skal genereres. Rundes ned til et helt antal ticks for hver spiller. |
| **Hold** | 8 | Antal grupper (mindst 1). |
| **Pr. hold** | 12 | Spillere pr. gruppe (mindst 1). |
| **Kortets halve udstrækning (m)** | 4000 | Halvdelen af bredden på det spilbare område på X og Z. |
| Estimatlinje | | "≈ X GB RAM, Y GB på GPU'en efter kvantisering." (cirka 26 byte RAM og 8 byte på GPU'en pr. række). |
| **Generér** | | Genererer i indlæsnings-workeren med fremskridt og erstatter et indlæst datasæt. |

Generering kører i baggrundsworkeren, så titalls millioner rækker ikke fryser siden.

## Hvad den genererer {#what-it-generates}

Fra [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolonner:** position, tid, person (`P000`, `P001` ...), gruppe (`Team 1`, `Team 2` ...), gir og hældning, og levetider. Ingen sessionskolonne og ingen filterkolonner.
- **Tid:** én prøve pr. spiller hvert 0,25 s, startende ved 0 (relativ tid, intet vægur).
- **Bevægelse:** hvert hold starter i sin egen sektor af en ring ved 55-95 % af den halve udstrækning. En sikker cirkel centreret nær midten (forskudt tilfældigt med op til en fjerdedel af den halve udstrækning) krymper til 8 % af den halve udstrækning i seks faser med plateauer. Hver spiller styrer mod et vandrende punkt inde i den, med dæmpning og støj. Højden bølger mellem 0 og 220 m.
- **Blikretning:** gir efter bevægelsesretningen, hældning ud fra den lodrette hastighed.
- **Gentagelig:** frøet til tilfældigheden er fast (1337), så de samme indstillinger altid giver de samme data.

Hver varmetilstand, boksreplay og linjevarme (hele spor, da der ikke er nogen hændelseskolonne) virker på den. Levetidshistorikken virker også.
