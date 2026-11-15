---
title: "Filters en hulpmiddelen"
nav_order: 6
has_children: true
lang: "nl"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filters en hulpmiddelen

Met deze panelen kies je *welke* data je bekijkt en meet je wat je ziet. Gebruik ze als het beeld te druk is: toon één team, één speler, één plek, of één verdieping van een gebouw.

Elk paneel versmalt de data, en ze werken samen: een rij wordt alleen getekend als ze **alle** passeert (logische EN).

```
all rows -> Filters -> Teams -> Entities -> Slice -> picture
              AND       AND       AND        AND
```

Voorbeeld: vink *Tank* uit onder Filters, verberg het rode team onder Teams, en kies één speler onder Entiteiten. Je ziet dan alleen de bewegingen van die speler die geen tank zijn.

| Paneel | Wat het doet | Warmtemodi | Figurenoverlay |
|---|---|---|---|
| [Filters](filters.md) | Bereik- en categoriefilters op elke kolom die bij het laden is bewaard. | Ja | Nee (alleen kolomfilters) |
| [Verschilverdeling](difference.md#the-difference-split-panel) | Welke rijen optellen en welke aftrekken, in de modus Verschil. | Alleen Verschil | Nee |
| [Teams](teams-list.md) | Elk team tonen of verbergen; teams op de kant + of - zetten. | Ja | Ja |
| [Entiteiten](entities.md) | Afzonderlijke spelers kiezen. | Ja | Ja |
| [Snede](slice.md) | Een plak uit het niveau en de warmte snijden, om binnen gebouwen te kijken. | Ja, en het niveau | Nee |
| [Meten](measure.md) | Een liniaal, en de warmtewaarde onder de cursor. | Ja | Ja |
| [Volumes en vergelijking](volumes.md) | 3D-vormen tekenen en vragen wat erin gebeurde. Kan ook filteren. | Ja | Ja |
| [Uitsplitsing](breakdown.md) | Welk voertuig, welke speler of welk wapen het best doet op een plek. | n.v.t. | n.v.t. |

Trefferanalyse heeft een eigen gebiedsfilter in het tabblad **Voertuigen**: zie [Trefferanalyse](hit-analysis.md).

Termen als warmtekaart, rij, persoon en groep worden uitgelegd in de [woordenlijst](glossary.md).

## Waar de panelen staan {#where-the-panels-are}

De zijbalk van het tabblad Heatmap, van boven naar beneden:

1. Modusbalk en sessiekiezer
2. Bron, Kolomtoewijzing, Dataset
3. Routes (modus Lijnen)
4. De warmtepanelen, of de Teamweergave
5. Verschilverdeling
6. Teams
7. Entiteiten
8. Filters
9. Achtergrond / level
10. Snede
11. Meten
12. Camerapad & renderen
13. Prestaties
14. Camera & scène

Het tabblad Match toont de modusbalk, de sessiekiezer, zijn eigen paneel, Filters, Achtergrond / level en Camera & scène.
