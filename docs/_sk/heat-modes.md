---
title: "Režimy tepla"
nav_order: 4
has_children: true
lang: "sk"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Režimy tepla

Každá bodka pridá malú žiaru, žiary sa hromadia a hromada sa maľuje farbami. Režimy sú päť spôsobov, ako ju namaľovať, a každý odpovedá na jednu otázku.

Lišta režimov hore na bočnom paneli karty Heatmapa určuje, ako sa [dátová sada](glossary.md) kreslí. Klávesy 1-4 vyberajú Teplo, Rozdiel, Teplo tímov a Čiary. Prekrytie figúrok nemá klávesu.

![Lišta režimov s Teplo, Rozdiel, Teplo tímov, Prekrytie figúrok a Čiary](../assets/img/en/heat-modes-bar.webp)

| Režim | Otázka, na ktorú odpovedá |
|---|---|
| **Teplo** | Kde sa to stalo a koľko? |
| **Rozdiel** | Ktorá strana to robila viac? |
| **Teplo tímov** | Čí to bolo? |
| **Čiary** | Ktorým smerom ľudia išli? |
| **Prekrytie figúrok** | Kto bol kde a kedy? |

![Tie isté dáta v štyroch režimoch: Teplo, Rozdiel, Teplo tímov a Čiary](../assets/img/en/heat-modes-grid.webp)

| Režim (označenie na lište) | Klávesa | Čo kreslí | Potrebuje |
|---|---|---|---|
| **Teplo** | 1 | Aditívna hustota: každý viditeľný riadok pridá radiálny sprite otočený ku kamere. [Teplo](heat.md) | dátovú sadu |
| **Rozdiel** | 2 | Hustota so znamienkom: jedna populácia pripočítava, druhá odpočítava. [Rozdiel](difference.md) | dve strany: aspoň dve skupiny alebo rozdelenie podľa ponechaného stĺpca |
| **Teplo tímov** | 3 | Hustota sfarbená podľa skupiny: odtieň pre každú skupinu, zmiešaný tam, kde sa skupiny prekrývajú. [Teplo tímov](team-heat.md) | stĺpec skupiny |
| **Prekrytie figúrok** | - | Figúrka (alebo kváder) pre každú osobu, pohybujúca sa po časovej osi: prehrávanie. [Prekrytie figúrok](box-replay.md), [Prehrávanie zápasu](match-replay.md) | stĺpec osoby |
| **Čiary** | 4 | Teplo čiar: čiara od každej vzorky osoby k jej ďalšej, teplo doznieva do strán. [Teplo čiar](line-heat.md) | stĺpec osoby a stĺpec času |

Režim, ktorý dáta nedokážu podporiť, je zašedený a jeho popis ukáže dôvod, napríklad *Nedostupné - režim Rozdiel potrebuje dve skupiny alebo ponechaný stĺpec na rozdelenie; tieto dáta majú jednu skupinu.* Keď nová dátová sada nedokáže podporiť aktuálny režim, pohľad sa vráti na **Teplo**.

Klávesy 1-4 sa overujú voči dátam rovnako: klávesa pre zašedený režim nič neurobí.

## Ktoré panely ukazuje každý režim {#which-panels-each-mode-shows}

| Panel | Teplo | Rozdiel | Teplo tímov | Prekrytie figúrok | Čiary |
|---|---|---|---|---|---|
| Cesty ([čiarové teplo](line-heat.md)) | | | | | áno |
| Tvar tepla (s **Sledovať pohľad** a **Rovnaká hustota pri každom priblížení**), Farby tepla, Pixelové hranice spritu, Hĺbka, Orezanie podľa vzdialenosti | áno | áno | áno | | áno |
| Smer ([smerové teplo](directional-heat.md)), Hodnota ([váženie hodnotou](value-weighting.md)) | áno | áno | áno | | áno |
| Zobrazenie tímov ([prekrytie figúrok](box-replay.md)) | | | | áno | |
| Rozdelenie rozdielu ([rozdiel](difference.md)) | | áno | | | |
| [Tímy](teams-list.md), [Entity](entities.md), [Filtre](filters.md), Pozadie / level, [Rez](slice.md), [Meranie](measure.md), Dráha kamery a render, Výkon, Kamera a scéna | áno | áno | áno | áno | áno |

## Čo majú spoločné všetky režimy tepla {#what-every-heat-mode-shares}

Všetky štyri režimy tepla (všetko okrem prekrytia figúrok) sú ten istý stroj s inými vstupmi ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Ktoré riadky.** [Časová os](timeline.md) vyberie súvislý rozsah riadkov zoradených podľa času; [filtre](filters.md), viditeľnosť skupín, rozdelenie rozdielu, [orezanie podľa vzdialenosti](depth-and-culling.md#distance-culling) a [rez](slice.md) rozhodujú pre každý riadok vo vertex shaderi, či a ako silno prispieva.
2. **Splatting.** Každý prispievajúci riadok sa nakreslí ako sprite (alebo v režime Čiary ako úsečka) do **cieľa tepla** s pohyblivou desatinnou čiarkou a pridá svoju hodnotu z škály. Ak je riadkov viac, než jedna snímka zvládne, nakreslí sa stratifikovaná vzorka riadkov a váži sa, aby sa to kompenzovalo. Pozri [Vzorkovanie a rozpočty](sampling-and-budgets.md).
3. **Akumulácia.** Kým sa nič nemení, snímky sa zlučujú, až kým každý riadok neprispeje presne raz. Pozri [Akumulácia](accumulation.md).
4. **Skladanie.** Akumulovaná hodnota v každom pixeli sa vydelí **bodom nasýtenia**, zakrivý sa podľa **odozvy hustoty**, zdvihne o **minimálne teplo** a vyhľadá sa v **škále farieb**, ktorej alfa ju zmieša so scénou. Pozri [Farba a expozícia](colour-and-exposure.md).

Všetko v kroku 4 sa uplatní pri skladaní, takže ťahanie týchto ovládačov nikdy nespustí akumuláciu nanovo; čokoľvek v krokoch 1-2 áno.

## Stránky v tejto časti {#pages-in-this-section}

- [Teplo](heat.md) - bežný režim tepla a prehľad jeho panelov
  - [Tvar spritu](sprite-shape.md) - polomer, intenzity, útlm, editor krivky, pixelové hranice, zploštenie
  - [Farba a expozícia](colour-and-exposure.md) - editor škály, bod nasýtenia, automatická expozícia, minimálne teplo, odozva hustoty
  - [Hĺbka a orezávanie](depth-and-culling.md) - zakrytie levelom, skrytie za terénom, orezanie podľa vzdialenosti
- [Rozdiel](difference.md) - rozdelenie rozdielu
- [Teplo tímov](team-heat.md)
- [Teplo čiar](line-heat.md) - cesty
- [Prekrytie figúrok](box-replay.md) - režim prehrávania (súbor sa stále volá box replay)
- [Smerové teplo](directional-heat.md)
- [Váženie hodnôt](value-weighting.md)
