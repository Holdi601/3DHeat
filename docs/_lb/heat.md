---
title: "Hëtzt"
parent: "Hëtztmodi"
nav_order: 1
lang: "lb"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Hëtzt

Heat molt d'Plaze, wou ganz vill geschitt ass: rout, wou et e bëssen geschitt ass, wäiss-hëtz, wou et ganz vill geschitt ass. Hie beäntwert d'Fro "wou geschitt dat, a wéi vill".

**Heat** (Tast 1) ass de Standardmodus. All sichtbar [Zeil](glossary.md) setzt e kameragerichtete ronne [Sprite](glossary.md) derbäi; sech iwwerlappend Sprite addéieren sech an engem Float-Puffer; d'Summ gëtt duerch en Faarfverlaf geschéckt - standardméisseg transparent → rout → giel → wäiss - a iwwer d'Szen gezeechent.

![Hëtzt op engem 3D-Level: waarm Plaze bannen a uewen op den Gebaier](../assets/img/en/shooter-heat.webp)

D'Bild weist d'Hëtzt vun enger Schéisser-Ronn op engem Level mat Gebaier: waarm Plaze sinn an de Raim an op de Trappen, net nëmmen um Buedem.

## Wéi een et benotzt {#how-to-use-it}

1. Lued Daten an drëckt `1` (oder wielt **Heat** an der Modus-Leescht).
2. Wann alles wäiss oder eidel ass, drëckt **Automatesch Beliichtung aus dem Feld** an der Sektioun **Heat-Form**.
3. Ännert **Sprite-Radius**, bis d'Noper-Punkte an Bänner zesummewuessen: méi kleng weist eenzel Flecken, méi grouss weist Gebidder.
4. Maacht **Heat-Faarwen** op, fir d'Faarwen z'änneren, oder **Déift**, fir datt Hiwwele a Mauere d'Hëtzt hannendru verstoppen.

![D'Sektiounen Heat-Form an Heat-Faarwen vun der Säitelleescht, beid op](../assets/img/en/heat-panel.webp)

D'selwecht Panelen formen och [Ënnerscheed](difference.md), [Equipen-Heat](team-heat.md) an [Linn-Hëtzt](line-heat.md); si ënnerscheede sech a deem, wat derbäigesat gëtt (mat Vorzeechen, gefierft oder laanschs Linnen), net a Wéi.

## D'Panelen an hir Standarden {#the-panels-and-their-defaults}

All Steierung hei ënnen ass en Shader-Parameter, sou datt d'Ännerung näischt kascht ausser engem neie Molen. Schieber hu bei sech e getippte Kasten an e Zéihgrëff (de klenge Griff riets: no uewen oder ënnen zéien, wäit méi séier, Shift fir Feinjustéierung); wann d'Schiebereck virum richtegen Limit ophält, kann de Griff iwwer hir bis zum *Jog-Plafong* hei uginn schieben. Wäerter mat *beim Lueden* ginn fir all neien Datesaz nei berechent.

### Heat-Form (oppen) {#heat-shape-open}

| Steierung | Standard | Beräich (Jog-Plafong) | Detailer |
|---|---|---|---|
| **Sprite-Radius** | 6 m; beim Lueden Ausdehnung / 120 | 0.05-2000 m, logarithmesch (50,000) | [Sprite-Form](sprite-shape.md#sprite-radius) |
| **Intensitéit an der Mëtt** | 1 | 0-10 (1000) | [Sprite-Form](sprite-shape.md#centre-and-edge-intensity) |
| **Intensitéit um Rand** | 0 | -2-10 (1000) | [Sprite-Form](sprite-shape.md#centre-and-edge-intensity) |
| **Form vum Verlaf** | *Ofnam* | *Ofnam* / *Kurv* | [Sprite-Form](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Ofnam** (nëmme bei Ofnam) | 1.6 | 0.1-8 (64) | [Sprite-Form](sprite-shape.md#falloff) |
| **Weeche Verlaf** (nëmme bei Ofnam) | un | | [Sprite-Form](sprite-shape.md#falloff) |
| Kurvebearbechter (nëmme bei Kurv) | Preset *Weech* | | [Sprite-Form](sprite-shape.md#the-curve-editor) |
| **Sättegungspunkt** | 24; beim Lueden eng Schätzung, dann gemooss | 0.1-4000, logarithmesch (10,000,000) | [Faarf a Belichtung](colour-and-exposure.md#saturation-point) |
| **Minimal Heat** | aus (0) | 0-100% | [Faarf a Belichtung](colour-and-exposure.md#minimum-heat) |
| **Reaktioun op d’Dicht** | *Sättegend* | *Sättegend* / *Linear* / *Log* | [Faarf a Belichtung](colour-and-exposure.md#density-response) |
| **Automatesch Beliichtung aus dem Feld** | | Knäppchen | [Faarf a Belichtung](colour-and-exposure.md#auto-exposure) |
| **Der Usiicht nogoen** | un | | Mësst d'Beliichtung nei, all Kéier wann d'Kamera zur Rou kënnt, sou datt e Gebitt, a dat Dir flitt, déi ganz Faarfskala benotzt. Kleng Ännerungen ginn ignoréiert, an d'Skala gleit. Maacht et aus oder zitt **Sättegungspunkt**, fir d'Skala festzehalen an Plaze op enger Skala ze vergläichen. [Faarf a Belichtung](colour-and-exposure.md#follow-the-view) |
| **Selwecht Dicht bei all Zoom** | un | | Eng Faarf heescht déiselwecht Zuel vu Zeilen pro Gebitt Buedem, egal wéi no Dir sidd. E Sprite, dee d'Pixelgrenzen vergréisseren (wäit ewech) oder verklenneren (no derbäi), behält d'Hëtzt, déi seng richteg Gréisst bäidroe géif, sou datt en Bild, dat vu wäit beliicht gouf, net verbléicht, wann Dir an en flitt. Aus heescht, en begrenzten Sprite setzt mat senger begrenzter Gréisst säin ganzt Gewiicht derbäi. [Sprite-Form](sprite-shape.md#pixel-clamps) |
| **Op d’Buedemfläch projizéieren** | aus | | [Sprite-Form](sprite-shape.md#flatten-onto-ground-plane) |

### Heat-Faarwen (zou) {#heat-colours-closed}

| Steierung | Standard | Detailer |
|---|---|---|
| Gruppenfaarwen a **Faarftrennung** (nëmmen Equipen-Heat) | 1.4 | [Equipen-Heat](team-heat.md) |
| Editor vum **Heat-Verlaf** (*Positiv (additiv Equippen)* beim Ënnerscheed, *Deckkraaftverlaf* bei Equipen-Heat) | transparent → rout → giel → wäiss | [Faarf a Belichtung](colour-and-exposure.md#the-ramp-editor) |
| **Zrécksetzen op transparent → rout → giel → wäiss** | | |
| **Negativ (subtraktiv Equippen)**-Verlaf (nëmmen Ënnerscheed) | transparent → gréng → blo → purpur | [Ënnerscheed](difference.md#colours) |

### Sprite-Pixelgrenzen (zou) {#sprite-pixel-clamps-closed}

| Steierung | Standard | Beräich (Jog-Plafong) | Detailer |
|---|---|---|---|
| **Minimale Pixelradius** | 1 px | 0-16 (512) | [Sprite-Form](sprite-shape.md#pixel-clamps) |
| **Maximale Pixelradius** | 96 px | 2-1024, logarithmesch (8192) | [Sprite-Form](sprite-shape.md#pixel-clamps) |

### Déift (oppen) {#depth-open}

| Steierung | Standard | Detailer |
|---|---|---|
| **Hannert dem Terrain verstoppen** | un | [Déift a Ausblenden](depth-and-culling.md#hide-behind-terrain) |
| **Hannert Geometrie verstoppt** | 0.8 (*80% méi däischter*) | [Déift a Ausblenden](depth-and-culling.md#hidden-behind-geometry) |

### Distanzausblenden (zou) {#distance-culling-closed}

| Steierung | Standard | Beräich (Jog-Plafong) | Detailer |
|---|---|---|---|
| **No** | aus (0) | 0.5-5000 m, logarithmesch, ënnescht vum Schinn = aus (200,000) | [Déift a Ausblenden](depth-and-culling.md#distance-culling) |
| **Wäit** | aus (0) | 1-200,000 m, logarithmesch, ënnescht = aus (10,000,000) | [Déift a Ausblenden](depth-and-culling.md#distance-culling) |
| **Un enger Fläch schneiden** | un | | [Déift a Ausblenden](depth-and-culling.md#distance-culling) |
| **De Level och schneiden** | un | | [Déift a Ausblenden](depth-and-culling.md#distance-culling) |

Tasten: `[` a `]` schiewen d'Wäitgrenz eran an eraus, `\` schalt se an aus ([Déift a Ausblenden](depth-and-culling.md#keyboard)).

### Richtung an Wäert {#direction-and-value}

Zwou weider Sektiounen sti ënner Heat-Form. **Richtung** zeechent all Zeil als Kiel a setzt Pfeile derbäi: kuckt [Richtungs-Hëtzt](directional-heat.md). **Wäert** gewiicht d'Hëtzt no deem, wat all Zeil kascht oder gewonnen huet: kuckt [Wäertgewiichtung](value-weighting.md).

## Wat gespäichert gëtt {#what-is-saved}

Déi Heat-Astellunge vu uewe ginn tëscht Sitzungen net gespäichert: wann Dir d'Säit neu lueden, ginn d'Standarde zréck. Zwee Saache bleiwen am Browser: déi lescht Ofspillgeschwindegkeet (`heat3d.speed`, kuckt [Zäitlinn](timeline.md)) an d'Astellunge vun de wäit ewechstéiende Figuren vum [Figuren-Overlay](box-replay.md) (Symbolstil, Gréisst, Treffermarken an sou weider). Genee sou d'Sprooch, d'[ëmgedréint Weltachsen](camera.md#invert-world-axis), d'gemierkten Autosnimm vum Course-Analys-Tab an d'[Level-Bibliothéik](level-library.md). Déi komplett Lëscht steet op [Gespäichert Astellungen](ref-settings-storage.md).
