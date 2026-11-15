---
title: "Syntetisk generator"
parent: "Få inn data"
nav_order: 5
lang: "no"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Syntetisk generator

Ingen data av egen? Trykk én knapp, så finner 3DHeat opp et pretendert slag for deg, så lite eller så stort du vil.

1. Åpne panelet **Datasett** i Varme-sidepanelet (under **Kilde**).
2. Scroll ned til **Syntetisk generator**.
3. Sett **Rader (millioner)**. Prøv 1 først: standardverdien 8 millioner er tung for et første forsøk.
4. Trykk **Generer**.

![1 million rader, 8 lag, tegnet i Lagvarme](../assets/img/en/synthetic-generator-team-heat.webp)

Panelet **Datasett** kan generere et datasett i stedet for å laste ett. Det er ment til to ting: å prøve visningsprogrammet uten data av egen, og å sjekke om et gitt antall rader, sprite-radius og budsjett holder en brukbar bildefrekvens på en maskin *før* du forplikter deg til en stor ekte lasting. Bevegelsen er formet som en kamp i battle royale - lag starter adskilt, og presses så sammen - fordi jevn støy ser bra ut ved ethvert budsjett og skjuler nettopp artefaktene det er verdt å fange.

## Kontroller {#controls}

| Kontroll | Standard | Betydning |
|---|---|---|
| **Rader (millioner)** | 8 | Rader som skal genereres. Rundes ned til et helt antall tikk for hver spiller. |
| **Lag** | 8 | Antall grupper (minst 1). |
| **Per lag** | 12 | Spillere per gruppe (minst 1). |
| **Kartets halve utstrekning (m)** | 4000 | Halvparten av bredden på det spillbare området på X og Z. |
| Estimatlinje | | "≈ X GB RAM, Y GB på GPU-en etter kvantisering." (ca. 26 byte RAM og 8 byte på GPU-en per rad). |
| **Generer** | | Genererer i bakgrunnsarbeideren, med fremdrift, og erstatter et lastet datasett. |

Generering kjører i bakgrunnsarbeideren, så titalls millioner rader fryser ikke siden.

## Hva den genererer {#what-it-generates}

Fra [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolonner:** posisjon, tid, person (`P000`, `P001`, ...), gruppe (`Team 1`, `Team 2`, ...), gir og stigning, og levetider. Ingen øktkolonne og ingen filterkolonner.
- **Tid:** én prøve per spiller hvert 0,25 s, fra 0 (relativ tid, ingen veggklokke).
- **Bevegelse:** hvert lag starter i sin egen sektor av en ring på 55–95 % av den halve utstrekningen. En trygg sirkel med sentrum nær midten (forskjøvet tilfeldig med opptil en kvart av den halve utstrekningen) krymper til 8 % av den halve utstrekningen i seks faser med platåer; hver spiller styrer mot et vandrende punkt inni den, med demping og støy. Høyden svinger mellom 0 og 220 m.
- **Blikkretning:** gir langs bevegelsesretningen, stigning fra vertikal fart.
- **Gjentakbar:** frøet for tilfeldighet er fast (1337), så de samme innstillingene gir alltid de samme dataene.

Alle varmemodusene, boksreplayet og linjevarmen (hele spor, siden det ikke finnes noen hendelseskolonne) virker på den. Livsløpshistorikken virker også.
