---
title: "Syntetisk generator"
parent: "Läsa in data"
nav_order: 5
lang: "sv"
source: "synthetic-generator.md"
source_hash: "7a97459b7817"
translated: true
outdated: false
---

# Syntetisk generator

Ingen egen data? Tryck på en knapp, så hittar 3DHeat på en låtsasstrid åt dig, så liten eller stor du vill.

1. Öppna panelen **Datamängd** i sidofältet Värme (under **Källa**).
2. Rulla till **Syntetisk generator**.
3. Ställ in **Rader (miljoner)**. Prova 1 först. Standardvärdet 8 miljoner är tungt för en första provkörning.
4. Tryck på **Generera**.

![1 miljon rader, 8 lag, ritade i Lagvärme](../assets/img/en/synthetic-generator-team-heat.webp)

Panelen **Datamängd** kan generera en datamängd i stället för att läsa in en. Den är till för två saker: att prova visaren utan egen data, och att kontrollera om ett visst antal rader, sprite-radie och budget ger en användbar bildfrekvens på en dator *innan* du lägger en stor verklig inläsning på den. Rörelsen är formad som en battle royale-match. Lagen startar skilda åt och pressas sedan ihop. Det beror på att ren slumpbrus ser bra ut vid vilken budget som helst och döljer just de artefakter som är värda att fånga.

## Reglage {#controls}

| Reglage | Standard | Betydelse |
|---|---|---|
| **Rader (miljoner)** | 8 | Rader att generera. Avrundas nedåt till ett helt antal steg för varje spelare. |
| **Lag** | 8 | Antal grupper (minst 1). |
| **Per lag** | 12 | Spelare per grupp (minst 1). |
| **Kartans halva utbredning (m)** | 4000 | Halva bredden på det spelbara området i X och Z. |
| Uppskattningsraden | | ”≈ X GB RAM, Y GB på GPU efter kvantisering.” (ungefär 26 byte RAM och 8 byte GPU per rad). |
| **Generera** | | Genererar i inläsningens arbetare, med förlopp, och ersätter en eventuellt inläst datamängd. |

Genereringen körs i bakgrundsarbetaren, så att tiotals miljoner rader inte fryser sidan.

## Vad den genererar {#what-it-generates}

Från [`src/data/synth.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/synth.ts):

- **Kolumner:** position, tid, person (`P000`, `P001`, ...), grupp (`Team 1`, `Team 2`, ...), gir och stigning, och livslängder. Ingen sessionskolumn och inga filterkolumner.
- **Tid:** ett prov per spelare var 0,25 s, med start vid 0. Det är relativ tid, ingen väggklocka.
- **Rörelse:** varje lag startar i sin egen sektor av en ring på 55–95 % av halva utbredningen. En säker cirkel nära mitten (förskjuten slumpmässigt med upp till en fjärdedel av halva utbredningen) krymper till 8 % av halva utbredningen i sex faser med platåer. Varje spelare styr mot en vandrande punkt inuti den, med dämpning och brus. Höjden varierar mellan 0 och 220 m.
- **Blickriktning:** girning längs färdriktningen, stigning från den vertikala hastigheten.
- **Upprepbar:** slumpfröet är fast (1337), så samma inställningar ger alltid samma data.

Varje värmeläge, figurrepris och linjevärme (hela spår, eftersom det inte finns någon händelsekolumn) fungerar på den. Livslängdshistoriken fungerar också.
