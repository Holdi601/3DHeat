---
title: "Hëtztmodi"
nav_order: 4
has_children: true
lang: "lb"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Hëtztmodi

All Punkt gëtt e bëssen Glanz dobäi, d'Gläicher stapelen sech, an de Stapel gëtt a Faarwe gemoolt. D'Modi si fënnef Weeër, dat ze molen, an all äntwert op eng Fro.

D'Modus-Leescht ganz uewen an der Heatmap-Säitelleescht bestëmmt, wéi de [Datesaz](glossary.md) gezeechent gëtt. D'Tasten 1-4 wielen Heat, Ënnerscheed, Equipen-Heat a Linnen. Figuren-Overlay huet keng Tast.

![D'Modus-Leescht mat Heat, Ënnerscheed, Equipen-Heat, Figuren-Overlay a Linnen](../assets/img/en/heat-modes-bar.webp)

| Modus | Fro, déi en beäntwert |
|---|---|
| **Heat** | Wou ass et geschitt, a wéi vill? |
| **Ënnerscheed** | Wéi enger Säit ass et méi oft geschitt? |
| **Equipen-Heat** | Wiem seng war et? |
| **Linnen** | An wéi enger Richtung si Leit gaangen? |
| **Figuren-Overlay** | Wou war wien, a wann? |

![Déiselwecht Daten a véier Modi: Heat, Ënnerscheed, Equipen-Heat a Linnen](../assets/img/en/heat-modes-grid.webp)

| Modus (Bezeechnung an der Leescht) | Tast | Wat en zeechent | Brauch |
|---|---|---|---|
| **Heat** | 1 | Additiv Dicht: all sichtbar Zeil setzt e kameragerichtete Radial-Sprite derbäi. [Heat](heat.md) | en Datesaz |
| **Ënnerscheed** | 2 | Vorzeechend Dicht: eng Populatioun setzt derbäi, eng anerer zitt of. [Ënnerscheed](difference.md) | zwou Säiten: op d'mannst zwou Gruppen, oder eng Opdeelung iwwer eng behalen Kolonn |
| **Equipen-Heat** | 3 | Dicht, no Gruppe gefierft: eng Faarfton pro Grupp, gemëscht, wou Gruppe sech iwwerlappen. [Equipen-Heat](team-heat.md) | eng Gruppekolonn |
| **Figuren-Overlay** | - | Eng Figur (oder Këscht) pro Persoun, déi op der Zäitlinn mëtfiert: de Replay. [Figuren-Overlay](box-replay.md), [Match-Replay](match-replay.md) | eng Persounskolonn |
| **Linnen** | 4 | Linn-Hëtzt: eng Linn vun all Miessung vun enger Persoun bis zu hirer nächster, Hëtzt fält zur Säit of. [Linn-Hëtzt](line-heat.md) | eng Persoun- an eng Zäitkolonn |

En Modus, deen d'Daten net droen, ass ausgegraut, an de Tooltip seet firwat, zum Beispiel *Net verfügbar - den Ënnerscheed-Modus brauch zwou Gruppen oder eng behalen Kolonn fir ze opdeelen; dës Daten hunn eng Grupp.* Wann en neie Datesaz den aktuellen Modus net droe kann, fält d'Usiicht op **Heat** zréck.

Och d'Tasten 1-4 ginn géint d'Daten gepréift: eng Tast fir en ausgegraute Modus mécht näischt.

## Wéi Panelen all Modus weisen {#which-panels-each-mode-shows}

| Panel | Heat | Ënnerscheed | Equipen-Heat | Figuren-Overlay | Linnen |
|---|---|---|---|---|---|
| Weeër ([Linn-Hëtzt](line-heat.md)) | | | | | jo |
| Heat-Form (mat **Der Usiicht nogoen** an **Selwecht Dicht bei all Zoom**), Heat-Faarwen, Sprite-Pixelgrenzen, Déift, Distanzausblenden | jo | jo | jo | | jo |
| Richtung ([Richtungs-Hëtzt](directional-heat.md)), Wäert ([Wäertgewiichtung](value-weighting.md)) | jo | jo | jo | | jo |
| Equipenusiicht ([Figuren-Overlay](box-replay.md)) | | | | jo | |
| Ënnerscheedsopdeelung ([Ënnerscheed](difference.md)) | | jo | | | |
| [Teams](teams-list.md), [Entitéiten](entities.md), [Filteren](filters.md), Hannergrond / Level, [Schnëtt](slice.md), [Mooss](measure.md), Kamerapfad a Rendering, Leeschtung, Kamera & Zeen | jo | jo | jo | jo | jo |

## Wat all Heat-Modus gemeinsam huet {#what-every-heat-mode-shares}

All véier Heat-Modi (alles ausser dem Figuren-Overlay) sinn dee selwechte Mechanismus mat anere Inputs ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Wéi Zeilen.** D'[Zäitlinn](timeline.md) wielt eng zesummenhängend Rei vu Zeilen no Zäit sortéiert; [Filteren](filters.md), d'Gruppesichtbarkeet, d'Ënnerscheedsopdeelung, [Distanzausblenden](depth-and-culling.md#distance-culling) a d'[Schnëtt](slice.md) entscheeden am Vertex-Shader fir all Zeil, ob a wéi staark se bäidréit.
2. **Splatting.** All bäidroend Zeil gëtt als Sprite (oder, am Linnen-Modus, als Segment) an en **Hëtzt-Ziel** mat Fléissommazuel gezeechent a setzt seen Verlafswäert derbäi. Eng geschichte Probe vun den Zeilen gëtt gezeechent, wann et der méi wéi een Bild erlaabt, a gewiicht fir de Verloscht auszegläichen. Kuckt [Sampling a Budgeten](sampling-and-budgets.md).
3. **Akkumulatioun.** Solang sech näischt ännert, ginn Biller zesummegefouert, bis all Zeil genau eemol bäidroen huet. Kuckt [Akkumulatioun](accumulation.md).
4. **Zesummesetzung.** De Wäert pro Pixel gëtt duerch de **Sättegungspunkt** gedeelt, duerch d'**Dichtreaktioun** geformt, duerch d'**minimal Hëtzt** ugehuewen an am **Faarfverlaf** nogekuckt, dee säi Alpha iwwer d'Szen mëscht. Kuckt [Faarf a Belichtung](colour-and-exposure.md).

Alles am Schrëtt 4 gëtt beim Zesummesetzen ugewannt, sou datt Verstellen vun deenen Reglere d'Akkumulatioun ni neistart; alles an de Schrëtter 1-2 schonn.

## Säiten an dëser Sektioun {#pages-in-this-section}

- [Heat](heat.md) - de klore Hëtztmodus, an d'Iwwersiicht vu sengen Panelen
  - [Sprite-Form](sprite-shape.md) - Radius, Intensitéiten, Ofnam, de Kurvebearbechter, Pixelgrenzen, Flaachmaachen
  - [Faarf a Belichtung](colour-and-exposure.md) - Faarfverlafsbearbechter, Sättegungspunkt, Automatesch Beliichtung, minimal Hëtzt, Dichtreaktioun
  - [Déift a Ausblenden](depth-and-culling.md) - Verstoppen duerch de Level, Verstoppen hannert dem Terrain, Distanzausblenden
- [Ënnerscheed](difference.md) - d'Ënnerscheedsopdeelung
- [Equipen-Heat](team-heat.md)
- [Linn-Hëtzt](line-heat.md) - Weeër
- [Figuren-Overlay](box-replay.md) - de Replay-Modus (d'Datei heescht nach ëmmer box replay)
- [Richtungs-Hëtzt](directional-heat.md)
- [Wäertgewiichtung](value-weighting.md)
