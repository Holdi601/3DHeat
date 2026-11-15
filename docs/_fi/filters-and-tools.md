---
title: "Suodattimet ja työkalut"
nav_order: 6
has_children: true
lang: "fi"
source: "filters-and-tools.md"
source_hash: "0a5407ceb5fc"
translated: true
outdated: false
---

# Suodattimet ja työkalut

Nämä paneelit antavat sinun valita, *mitä* dataa katsot, ja mitata näkemäsi. Käytä niitä, kun kuva on liian sekava: näytä yksi joukkue, yksi pelaaja, yksi paikka tai yksi rakennuksen kerros.

Jokainen paneeli kaventaa dataa, ja ne toimivat yhdessä: rivi piirretään vain, jos se läpäisee **kaikki** (JA).

```
kaikki rivit -> Suodattimet -> Joukkueet -> Kohteet -> Viipale -> kuva
                     JA          JA          JA          JA
```

Esimerkki: poista *Tank* valinta kohdasta Suodattimet, piilota Red-joukkue kohdasta Joukkueet ja valitse yksi pelaaja kohdasta Kohteet. Näet vain sen pelaajan muut liikkeet kuin tankin.

| Paneeli | Mitä se tekee | Lämmön tilat | Hahmot päällekkäin |
|---|---|---|---|
| [Suodattimet](filters.md) | Väli- ja luokkasuodattimet mille tahansa latauksessa säilytetylle sarakkeelle. | Kyllä | Ei (vain sarakesuodattimet) |
| [Erotusjako](difference.md#the-difference-split-panel) | Mitkä rivit lisäävät ja mitkä vähentävät Erotus-tilassa. | Vain Erotus | Ei |
| [Joukkueet](teams-list.md) | Näytä tai piilota kukin joukkue; aseta joukkueet +- tai −-puolelle. | Kyllä | Kyllä |
| [Kohteet](entities.md) | Valitse yksittäisiä pelaajia. | Kyllä | Kyllä |
| [Viipale](slice.md) | Leikkaa kentästä ja lämmöstä kerros, jotta näet rakennusten sisään. | Kyllä, ja kenttä | Ei |
| [Mittaus](measure.md) | Viivoitin ja kohdistimen alla oleva lämpöarvo. | Kyllä | Kyllä |
| [Tilavuudet ja vertailu](volumes.md) | Piirrä 3D-muotoja ja kysy, mitä niiden sisällä tapahtui. Voi myös suodattaa. | Kyllä | Kyllä |
| [Erittely](breakdown.md) | Mikä ajoneuvo, pelaaja tai ase menestyy parhaiten paikassa. | ei sovellu | ei sovellu |

Osumaanalyysillä on oma aluesuodatin **Ajoneuvot**-välilehdessä: katso [Osumaanalyysi](hit-analysis.md).

Termit, kuten lämpökartta, rivi, henkilö ja ryhmä, selitetään [sanastossa](glossary.md).

## Missä paneelit ovat {#where-the-panels-are}

Lämpökartta-välilehden sivupalkki ylhäältä alas:

1. Tilapalkki ja istuntovalitsin
2. Lähde, Sarakemääritys, Aineisto
3. Reitit (Viivat-tila)
4. Lämpöpaneelit tai Joukkuenäkymä
5. Erotusjako
6. Joukkueet
7. Kohteet
8. Suodattimet
9. Tausta / kenttä
10. Viipale
11. Mittaus
12. Kamerapolku ja piirto
13. Suorituskyky
14. Kamera ja näkymä

Ottelu-välilehti näyttää tilapalkin, istuntovalitsimen, oman paneelinsa, Suodattimet-, Tausta / kenttä- ja Kamera ja näkymä -paneelit.
