---
title: "Lagliste"
parent: "Filtre og verktøy"
nav_order: 2
lang: "no"
source: "teams-list.md"
source_hash: "5477a98fa51c"
translated: true
outdated: false
---

# Liste over lag

Panelet **Lag** lar deg skjule et lag eller sette det på den ene siden av en sammenligning. Bruk det til å se bare på Blue, eller til å spørre "hvor går Blue som Red ikke gjør?".

En *gruppe* er et lag eller en side, for eksempel Blue og Red ([Grupper](sessions-persons-groups.md#group)). Panelet vises når datasettet har en gruppekolonne; antallet grupper står i overskriften. I modusen Lagvarme har sidepanelet også en del kalt **Lagvisning** med egne innstillinger; denne siden dekker listen **Lag**.

## Skjul et lag {#hide-a-team}

1. Åpne **Lag** i sidepanelet.
2. Fjern haken i avkrysningsboksen (*Synlig*) for laget du vil skjule. Bildet oppdateres med en gang.
3. Trykk **Vis alle** for å hente tilbake alle lagene.

![Listen over lag: Blue 5p, Red 5p, med Vis alle](../assets/img/en/teams-list.webp)

## Hver rad {#each-row}

| Del | Betydning |
|---|---|
| Avkrysningsboks (*Synlig*) | Viser eller skjuler gruppen. |
| Fargeprøve | Gruppens farge: dens [lagvarme](team-heat.md)-farge i modusen Lagvarme, dens grunnfarge i de andre modusene. |
| Navn | Gruppeetiketten (full etikett ved å holde musen over). |
| **+** / **-** (modusen Differanse) | Setter gruppen på positiv eller negativ side av [differansen](difference.md); klikk den aktive knappen igjen for å sette den på ingen side. |
| `Np` (andre moduser) | Antallet personer hvis første rad er i denne gruppen. |

![Modusen Differanse: Blue på +-siden, Red på -siden](../assets/img/en/teams-list-difference.webp)

## Knapper {#buttons}

| Knapp | Effekt |
|---|---|
| **Vis alle** | Gjør alle grupper synlige igjen. |
| **Del jevnt** (modusen Differanse) | Første halvdel av gruppene (avrundet opp) på +, resten på -; den samme delingen som hver lasting starter med. |

## Hva det å skjule en gruppe gjør {#what-hiding-a-group-does}

- I **Varme**, **Lagvarme** og **Linjer** bidrar gruppens rader med ingenting.
- I **Differanse** bidrar en skjult gruppe med ingenting, uansett hvilken side den står på, også ved en deling etter en annen kolonne (se [Differanse](difference.md#for-developers)).
- I **figuroverlegget** tegnes ikke personer hvis første rad er i den gruppen.
- I **Lagvarme** beholder de andre gruppene sine farger: fargetonene tildeles ut fra det totale antallet grupper, ikke fra hva som er synlig, så to bilder forblir sammenlignbare.

Å endre synlighet starter akkumuleringen på nytt. Ved hvert nytt datasett er alle grupper synlige igjen.

Panelets hint endrer seg med modusen: i Differanse forklarer det + og -; i Lagvarme forklarer det at fargeprøvene er fargene hver gruppe tegner med.
