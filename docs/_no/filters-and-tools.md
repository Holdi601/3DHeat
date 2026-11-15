---
title: "Filtre og verktøy"
nav_order: 6
has_children: true
lang: "no"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Filtre og verktøy

Disse panelene lar deg velge *hvilke* data du ser på, og måle det du ser. Bruk dem når bildet er for travelt: vis ett lag, én spiller, ett sted, eller én etasje i en bygning.

Hvert panel snevrer inn dataene, og de virker sammen: en rad tegnes bare hvis den består **alle** (OG).

```
alle rader -> Filtre -> Lag -> Objekter -> Snitt -> bilde
              OG         OG      OG          OG
```

Eksempel: fjern avmerkingen for *Tank* under Filtre, skjul det røde laget under Lag, og velg én spiller under Objekter. Du ser bare den spillerens bevegelser som ikke er med stridsvogn.

| Panel | Hva det gjør | Varmemodi | Figuroverlegg |
|---|---|---|---|
| [Filtre](filters.md) | Område- og kategorifiltre på hvilken som helst kolonne som beholdes ved innlasting. | Ja | Nei (bare kolonnefiltre) |
| [Differansedeling](difference.md#the-difference-split-panel) | Hvilke rader som legger til og hvilke som trekker fra, i differansemodus. | Bare differanse | Nei |
| [Lag](teams-list.md) | Vis eller skjul hvert lag; sett lag på + eller −-siden. | Ja | Ja |
| [Objekter](entities.md) | Velg enkeltspillere. | Ja | Ja |
| [Snitt](slice.md) | Skjær en plate ut av banen og varmen, for å se inn i bygninger. | Ja, og banen | Nei |
| [Måling](measure.md) | En linjal, og varmeverdien under markøren. | Ja | Ja |
| [Volumer og sammenligning](volumes.md) | Tegn 3D-former og spør hva som skjedde inni. Kan også filtrere. | Ja | Ja |
| [Oppdeling](breakdown.md) | Hvilket kjøretøy, spiller eller våpen som gjør det best på et sted. | ikke aktuelt | ikke aktuelt |

Trefferanalyse har sitt eget områdefilter i fanen **Kjøretøy**: se [Trefferanalyse](hit-analysis.md).

Begreper som varmekart, rad, person og gruppe forklares i [ordlisten](glossary.md).

## Hvor panelene er {#where-the-panels-are}

Sidepanelet for fanen Varmekart, fra topp til bunn:

1. Modusraden og økt-velgeren
2. Kilde, Kolonnetilordning, Datasett
3. Ruter (Linjer-modus)
4. Varmepanelene, eller Lagvisning
5. Differansedeling
6. Lag
7. Objekter
8. Filtre
9. Bakgrunn / bane
10. Snitt
11. Måling
12. Kameravei og rendering
13. Ytelse
14. Kamera og scene

Fanen Kamp viser modusraden, økt-velgeren, sitt eget panel, Filtre, Bakgrunn / bane og Kamera og scene.
