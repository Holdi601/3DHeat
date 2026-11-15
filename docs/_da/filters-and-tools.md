---
title: "Filtre og værktøjer"
nav_order: 6
has_children: true
lang: "da"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtre og værktøjer

Disse paneler lader dig vælge, *hvilke* data du kigger på, og måle det, du ser. Brug dem, når billedet er for travlt: vis ét hold, én spiller, ét sted eller én etage i en bygning.

Hvert panel indsnævrer dataene, og de virker sammen: en række tegnes kun, hvis den passerer **alle** (OG).

```
alle rækker -> Filtre -> Hold -> Enheder -> Snit -> billede
                OG       OG       OG          OG
```

Eksempel: fjern markeringen ved *Tank* under Filtre, skjul det røde hold under Hold, og vælg én spiller under Enheder. Du ser kun den spillers bevægelser, der ikke er med tank.

| Panel | Hvad det gør | Varmetilstande | Figuroverlejring |
|---|---|---|---|
| [Filtre](filters.md) | Interval- og kategorifiltre på enhver kolonne, der er bevaret ved indlæsningen. | Ja | Nej (kun kolonnefiltre) |
| [Forskelsopdeling](difference.md#the-difference-split-panel) | Hvilke rækker der lægges til, og hvilke der trækkes fra, i Forskel-tilstand. | Kun Forskel | Nej |
| [Hold](teams-list.md) | Vis eller skjul hvert hold; sæt hold på + eller -siden. | Ja | Ja |
| [Enheder](entities.md) | Vælg enkelte spillere. | Ja | Ja |
| [Snit](slice.md) | Skær en plade ud af banen og varmen, for at se ind i bygninger. | Ja, og banen | Nej |
| [Måling](measure.md) | En lineal og varmeværdien under markøren. | Ja | Ja |
| [Volumener og sammenligning](volumes.md) | Tegn 3D-former og spørg, hvad der skete indeni. Kan også filtrere. | Ja | Ja |
| [Opdeling](breakdown.md) | Hvilket køretøj, hvilken spiller eller hvilket våben der klarer sig bedst et sted. | ikke relevant | ikke relevant |

Træfanalyse har sit eget områdefilter i fanen **Køretøjer**: se [Træfanalyse](hit-analysis.md).

Begreber som heatmap, række, person og gruppe forklares i [ordlisten](glossary.md).

## Hvor panelerne er {#where-the-panels-are}

Heatmap-fanens sidebjælke, fra top til bund:

1. Tilstandslinje og sessionsvælger
2. Kilde, Kolonnetilknytning, Datasæt
3. Ruter (Linjer-tilstand)
4. Varmepanelerne, eller Holdvisning
5. Forskelsopdeling
6. Hold
7. Enheder
8. Filtre
9. Baggrund / bane
10. Snit
11. Måling
12. Kamerabane og rendering
13. Ydelse
14. Kamera og scene

Fanen Kamp viser tilstandslinjen, sessionsvælgeren, sit eget panel, Filtre, Baggrund / bane og Kamera og scene.
