---
title: "Teamlijst"
parent: "Filters en hulpmiddelen"
nav_order: 2
lang: "nl"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Teamlijst

Het paneel **Teams** laat je een team verbergen of het aan één kant van een vergelijking zetten. Gebruik het om alleen Blue te bekijken, of om te vragen "waar gaat Blue heen dat Red niet doet?".

Een *groep* is een team of partij, bijvoorbeeld Blue en Red ([Groepen](sessions-persons-groups.md#group)). Het paneel wordt getoond wanneer de dataset een groepskolom heeft; het aantal groepen staat in de kop. In de modus Teamwarmte heeft de zijbalk ook een sectie met de naam **Teamweergave** en eigen instellingen; deze pagina gaat over de lijst **Teams**.

## Een team verbergen {#hide-a-team}

1. Open **Teams** in de zijbalk.
2. Haal het vinkje weg bij **Zichtbaar** van het team dat je wilt verbergen. Het beeld past zich meteen aan.
3. Druk op **Alles tonen** om elk team weer terug te zetten.

![De lijst Teams: Blue 5p, Red 5p, met Alles tonen](../assets/img/en/teams-list.webp)

## Elke rij {#each-row}

| Onderdeel | Betekenis |
|---|---|
| Vinkje (*Zichtbaar*) | De groep tonen of verbergen. |
| Staaltje | De kleur van de groep: zijn [teamwarmte](team-heat.md)-kleur in de modus Teamwarmte, zijn basiskleur in de andere modi. |
| Naam | Het groepslabel (volledig label bij aanwijzen). |
| **+** / **-** (verschilmodus) | Zet de groep aan de positieve of negatieve kant van het [verschil](difference.md); klik nogmaals op de actieve knop om hem aan geen van beide kanten te zetten. |
| `Np` (andere modi) | Het aantal personen wier eerste rij in deze groep staat. |

![Verschilmodus: Blue aan de + kant, Red aan de - kant](../assets/img/en/teams-list-difference.webp)

## Knoppen {#buttons}

| Knop | Effect |
|---|---|
| **Alles tonen** | Maakt elke groep weer zichtbaar. |
| **Gelijk verdelen** (verschilmodus) | De eerste helft van de groepen (naar boven afgerond) op +, de rest op -; het zelfde verdelen waarmee elke lading begint. |

## Wat het verbergen van een groep doet {#what-hiding-a-group-does}

- In **Warmte**, **Teamwarmte** en **Lijnen** dragen de rijen van de groep niets bij.
- In **Verschil** draagt een verborgen groep niets bij, aan welke kant die ook staat, ook bij een splitsing op een andere kolom (zie [Verschil](difference.md#for-developers)).
- In de **figurenoverlay** worden personen wier eerste rij in die groep staat niet getekend.
- In **Teamwarmte** houden de andere groepen hun kleuren: tinten worden toegekend vanuit het totale aantal groepen, niet vanuit wat zichtbaar is, zodat twee beelden vergelijkbaar blijven.

Het wijzigen van de zichtbaarheid start de opbouw opnieuw. Bij elke nieuwe dataset zijn alle groepen weer zichtbaar.

De hint van het paneel verandert met de modus: in Verschil legt hij + en - uit; in Teamwarmte legt hij uit dat de staaltjes de kleuren zijn waarin elke groep tekent.
