---
title: "Mange kampe på én gang"
parent: "Replay"
nav_order: 2
lang: "da"
source: "many-matches.md"
source_hash: "f2239cef5e91"
translated: true
outdated: true
---

# Mange kampe på én gang

**Mange kampe på én gang** afspiller mange kampe oven på hinanden, så du ser, hvor hver kamps spillere plejer at gå hen. Brug den til at sammenligne hundreder eller tusinder af kampe i ét billede.

Hver kamp starter ved sin egen begyndelse, og dens enheder bevæger sig som figurer. Filerne går direkte ind i grafikkortet, og der bygges ingen fuld tabel, så den afspilles jævnt, hvor en almindelig indlæsning ville løbe tør for hukommelse.

![Ti stridsvognskampe lagt over hinanden, én farve pr. kamp](../assets/img/da/many-matches.webp)

## Sådan bruger du den {#how-to-use-it}

1. Åbn **Mange kampe på én gang** i Heatmap-sidebjælken.
2. Tryk på **Filer …** (vælg mange filer), **Mappe …** (en mappe og dens undermapper) eller **Tilføj mappe…** (tilføj til det, der er indlæst).
3. Vieweren skifter til figuroverlejringen og starter fra begyndelsen. Tryk på **Afspil**.

Hver fil er én kamp (eller indeholder flere). Parquet-filer og [`.3dheat`](container.md)-beholdere virker. En fil skal have en position-, en tid- og en enhedskolonne; navne-, type- og sidekolonner bevares. Andre filer og sidefilerne fra konvertere (flyvedata, beskeder, hændelser, chat, mål) springes over. Til en almindelig tabel, se [Indlæs data](getting-data-in.md).

## Indstillinger {#settings}

| Indstilling | Hvad den gør |
|---|---|
| **Efter hold** / **Efter kamp** | Farvelæg efter side, eller en farve pr. kamp. |
| **Markér hvor enheder døde** | Et mærke, hvor hver enhed døde, i 10 s, 30 s, 120 s eller alle hidtil. |

Panelet viser, hvor mange kampe, enheder, rækker og positioner der blev læst, den brugte hukommelse og indlæsningstiden. *Plads til* er, hvor mange flere positioner grafikkortet stadig kunne rumme. *Figurer fra* er den størrelse på skærmen, under hvilken en enhed tegnes som en lille pil i stedet for sin figur.

Figurernes udseende bruger de samme styringer som [kamp-replayet](match-replay.md#figures): **Figurstørrelse**, **Mindste figur på skærmen** og **På afstand**.

## Tips {#tips}

- Når alt ikke ville passe i hukommelsen, tyndes positionerne ud (kun en position hver få meter beholdes), og panelet siger det.
- Varmetilstandene virker også på overlejringens data.
- For statistik over tusindvis af kampe uden at tegne dem, se [Massanalyse](mass-analysis.md).
