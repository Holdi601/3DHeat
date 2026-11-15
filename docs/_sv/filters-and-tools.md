---
title: "Filter och verktyg"
nav_order: 6
has_children: true
lang: "sv"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filter och verktyg

De här panelerna låter dig välja *vilken* data du tittar på, och mäta det du ser. Använd dem när bilden är för rörig: visa ett lag, en spelare, en plats eller ett våningsplan i en byggnad.

Varje panel begränsar datan, och de samverkar: en rad ritas bara om den klarar **alla** (OCH).

```
alla rader -> Filter -> Lag -> Entiteter -> Snitt -> bild
                OCH      OCH      OCH         OCH
```

Exempel: avmarkera *Stridsvagn* under Filter, dölj det röda laget under Lag och välj en spelare under Entiteter. Du ser bara den spelarens rörelser utan stridsvagnar.

| Panel | Vad den gör | Värmelägen | Figuröverlägg |
|---|---|---|---|
| [Filter](filters.md) | Intervall- och kategorifilter på valfri kolumn som behölls vid inläsningen. | Ja | Nej (bara kolumnfilter) |
| [Differensuppdelning](difference.md#the-difference-split-panel) | Vilka rader som adderar och vilka som subtraherar, i läget Differens. | Bara Differens | Nej |
| [Lag](teams-list.md) | Visa eller dölj varje lag; lägg lag på + eller −. | Ja | Ja |
| [Entiteter](entities.md) | Välj enskilda spelare. | Ja | Ja |
| [Snitt](slice.md) | Skär ut en skiva ur banan och värmen, för att se in i byggnader. | Ja, och banan | Nej |
| [Mätning](measure.md) | En linjal, och värmevärdet under markören. | Ja | Ja |
| [Volymer och jämförelse](volumes.md) | Rita 3D-former och fråga vad som hände inuti. Kan även filtrera. | Ja | Ja |
| [Uppdelning](breakdown.md) | Vilket fordon, spelare eller vapen som gör det bäst på en plats. | – | – |

Träffanalys har ett eget områdesfilter i fliken **Fordon**: se [Träffanalys](hit-analysis.md).

Begrepp som värmekarta, rad, person och grupp förklaras i [ordlistan](glossary.md).

## Var panelerna finns {#where-the-panels-are}

Sidofältet i fliken Värmekarta, uppifrån och ned:

1. Lägesfält och sessionsväljare
2. Källa, Kolumnmappning, Datamängd
3. Rutter (läget Linjer)
4. Värmepanelerna, eller Lagvisaren
5. Differensuppdelning
6. Lag
7. Entiteter
8. Filter
9. Bakgrund / nivå
10. Snitt
11. Mätning
12. Kamerabana & rendering
13. Prestanda
14. Kamera & scen

Fliken Match visar lägesfältet, sessionsväljaren, sin egen panel, Filter, Bakgrund / nivå och Kamera & scen.
