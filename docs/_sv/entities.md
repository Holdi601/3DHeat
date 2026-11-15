---
title: "Entiteter"
parent: "Filter och verktyg"
nav_order: 3
lang: "sv"
source: "entities.md"
source_hash: "13da19f402d8"
translated: true
outdated: false
---

# Entiteter

**Entiteter** låter dig välja en spelare (eller några) och se bara var den spelaren har varit. Använd den för att följa din egen rörelse eller en motståndare.

Panelen visas när datamängden har en personkolumn. Dess rubrik visar antalet personer, eller `valda av totalt` medan ett urval är aktivt. En *person* är en spelare eller en AI, se [ordlistan](glossary.md).

## Välj en spelare {#pick-a-player}

1. Öppna **Entiteter** i sidofältet.
2. Skriv en del av namnet i sökrutan.
3. Bocka i spelaren. Rubriken visar till exempel `2 av 10`, och allt annat försvinner.
4. **Rensa** visar alla igen.

![Entiteter med två av tio spelare valda](../assets/img/en/entities-selected.webp)

Urvalet visar bara de valda personerna i värmelägena (punkter, linjer, differens, lagvärme) och i spåren, figurerna och spåren i [figuröverlägget](box-replay.md). Lämna urvalet tomt för att visa alla. Att välja alla är detsamma som att välja ingen.

## Panelen {#the-panel}

| Del | Betydelse |
|---|---|
| Sökruta | *Sök bland N entiteter...* Filtrerar listan på en delsträng i namnet, utan skillnad mellan stora och små bokstäver. Visar `N träffar`, eller `N träffar, visar de första 200`. Visar *Inget matchar "..."* när sökningen inte ger någon träff. |
| Lista | Upp till 200 personer (de första 200 som matchar), var och en med en kryssruta, ett färgprov för personens färg och namnet. *(namnlös)* visas för ett tomt namn. |
| Antydan om spel | När tiden spelas är listan de personer som *är i spel vid spelhuvudet*. En sökning hittar alla. |
| **AI (n)** | En hopfällbar grupp med de AI-styrda enheterna, skilda från spelarna. |
| **Lägg till visade** | Lägger till alla som för närvarande står i listan till urvalet. |
| **Bara visade** | Gör urvalet till exakt de som står i listan. |
| **Rensa** | Tömmer urvalet. |

## Gränser {#limits}

I värmen är urvalet ett filter och använder en av de fyra [filterplatserna](filters.md#rules). När de andra filtren redan använder alla fyra säger panelen: *Tillämpas inte på värmen: alla filterplatser är upptagna. Figuröverlägget visar ändå bara dessa entiteter. Rensa ett filter under Filter för att frigöra en plats.* Rensa ett filter för att frigöra en plats.

Urvalet rensas vid varje ny datamängd. Fliken Match sätter samma urval när den fokuserar en spelare.

## För utvecklare {#for-developers}

Urvalet lagras som ett *persons*-filter ([Filter](filters.md#for-developers)). Shaderns mask rymmer 65 536 person-id:n. En person utöver det ritas inte i värmen medan ett urval är aktivt.
