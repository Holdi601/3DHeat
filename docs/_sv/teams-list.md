---
title: "Lagslista"
parent: "Filter och verktyg"
nav_order: 2
lang: "sv"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Lagslista

Panelen **Lag** låter dig dölja ett lag eller placera det på ena sidan av en jämförelse. Använd den för att bara se Blue, eller för att fråga ”vart går Blue som Red inte gör?”.

En *grupp* är ett lag eller en sida, till exempel Blue och Red ([Grupper](sessions-persons-groups.md#group)). Panelen visas när datamängden har en gruppkolumn. Antalet grupper står i dess rubrik. I läget Lagvärme har sidofältet också ett avsnitt som heter **Lagvisare**, med egna inställningar. Den här sidan behandlar listan **Lag**.

## Dölj ett lag {#hide-a-team}

1. Öppna **Lag** i sidofältet.
2. Avmarkera kryssrutan (*Visible*) för laget som ska döljas. Bilden uppdateras direkt.
3. Tryck på **Visa alla** för att få tillbaka alla lag.

![Lagslistan: Blue 5p, Red 5p, med Visa alla](../assets/img/en/teams-list.webp)

## Varje rad {#each-row}

| Del | Betydelse |
|---|---|
| Kryssruta (*Visible*) | Visar eller döljer gruppen. |
| Färgprov | Gruppens färg: dess [lagvärmefärg](team-heat.md) i läget Lagvärme, och dess basfärg i de andra lägena. |
| Namn | Gruppens etikett. Hela etiketten visas när du för musen över den. |
| **+** / **-** (läget Differens) | Placerar gruppen på den positiva eller negativa sidan av [differensen](difference.md). Klicka på den aktiva knappen igen för att placera gruppen på ingen sida. |
| `Np` (andra lägen) | Antalet personer vars första rad ligger i den gruppen. |

![Differensläget: Blue på + sidan, Red på - sidan](../assets/img/en/teams-list-difference.webp)

## Knappar {#buttons}

| Knapp | Effekt |
|---|---|
| **Visa alla** | Gör varje grupp synlig igen. |
| **Dela jämnt** (läget Differens) | Första hälften av grupperna (avrundat uppåt) på +, resten på -. Det är samma delning som varje inläsning börjar med. |

## Vad det innebär att dölja en grupp {#what-hiding-a-group-does}

- I **Värme**, **Lagvärme** och **Linjer** ger gruppens rader inget bidrag.
- I **Differens** ger en dold grupp inget bidrag, oavsett vilken sida den ligger på. Det gäller även vid delning efter en annan kolumn (se [Differens](difference.md#for-developers)).
- I **figuröverlägget** ritas inte de personer vars första rad ligger i gruppen.
- I **Lagvärme** behåller de andra grupperna sina färger. Nyanserna tilldelas från det totala antalet grupper, inte från vad som syns, så att två bilder förblir jämförbara.

Ändring av synlighet startar om ackumuleringen. Vid varje ny datamängd är varje grupp synlig igen.

Panelens hjälptext ändras med läget. I Differens förklarar den + och -. I Lagvärme förklarar den att färgproven är de färger varje grupp ritas med.
