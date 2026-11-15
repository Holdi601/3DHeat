---
title: "Levelen an Hannergrondgeometrie"
nav_order: 16
has_children: true
lang: "lb"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Levelen an Hannergrondgeometrie

E Level ass den 3D-Ort, wou de Spill stattfonnt huet - eng Kaart, eng Stad, eng Strecke. Setzt een hannert Är Daten, da gesitt Dir, *wou* d'Hëtzt ass. Den **Hannergrond / Level**-Panel (kuckt de [Glossar](glossary.md) fir "Level") gëtt Iech dräi Aarte vu Kontext:

- en **Kaartebild**, mat zwee Ankerpunkten georeferenzéiert - kuckt [Kaartbiller](map-images.md);
- en **3D-Level** - `.glb`, `.gltf`, `.obj`, `.stl` oder `.ply` - bei der Import an Buedem, Strukturen a Waasser opgedeelt an vereinfacht - kuckt [3D-Levelen](model-levels.md) a [Ausgesinn](level-appearance.md);
- en **Welt-Hannergrond** - fir eng Opnam, déi seet, wou se op der Äerd ass (eng Tacview-ACMI-Datei), dat richtegt Terrain, Stroossen, Waasser, Fligerhaff an Gebaier, aus oppene Daten erofgeluet - kuckt [Welt-Hannergrond](world-backdrop.md).

Wann näischt gelueden ass, ass d'Szen däischter mat engem Gitter a faarwege Achsen (**Gitter** an **Achsen** an [Kamera & Zeen](camera.md)), an de Panel seet *Näischt gelueden - d'Szen weist e Gitter an Achsen. Setzt en Kaartebild oder en Level-Mesh derbäi, fir d'Hëtzt Kontext ze ginn.*

De Level gëtt vun all dräi Tabs gedeelt: en Kurs, deen am Tab Course-Analys gelueden ass, ass dee selwechte Level wéi d'Heatmap weist.

![De Panel Hannergrond / Level mat engem gelueden Level: d'Knäppchen Kaartebild an 3D-Modell, Theater, Deckkraaft, Hellegkeet, An der Bibliothéik späicheren an d'Bibliothéik-Lëscht](../assets/img/en/level-panel.webp)

## E Level hannert Är Daten leeën {#put-a-level-behind-your-data}

1. Lued als éischt Är Daten ([Daten astellen](getting-data-in.md)), sou datt de Level dorausshin passt.
2. Maacht **Hannergrond / Level** an der Säitelleescht op.
3. Drëckt **Kaartebild…** fir e Bild oder **3D-Modell…** fir en 3D-Level, a wielt d'Datei. Fir eng Opnam aus der richtegen Welt benotzt **Welt-Hannergrond** oder **Theater**.
4. Waart, bis d'Fortschrëttszeil fäerdeg ass. En grousst Modell gëtt fir d'éischt vereinfacht (kuckt **Vereinfachungsziel** ënnen).
5. Drëckt **F** an der Usiicht, fir alles eranzezéien. Benotzt **Deckkraaft** an **Hellegkeet**, bis d'Hëtzt sech vum Level ofhieft.
6. Drëckt **An der Bibliothéik späicheren**, wann Dir de Level nach eng Kéier benotzt wëllt ([Level-Bibliothéik](level-library.md)).

## Wat e Level fir d'Hëtzt mécht {#what-a-level-does-for-the-heat}

- Et **verdeckt**: Datepunkte hannert him ginn pro Flächt gedämpft, a Datepunkte hannert dem Terrain sinn verstoppt ([Déift a Ausblenden](depth-and-culling.md)). Ouni Level gëtt et keng Verdeckung.
- Et gëtt vum [Schnëtt](slice.md) a, mat *De Level och schneiden*, vum [Distanzausblenden](depth-and-culling.md#distance-culling) zerschnidden, zesumme mat der Hëtzt.
- Et ass dat eenzegt, wat d'[Tiefenschäerf](camera.md#depth-of-field) nieft dem Gitter a de Boxen verwëscht.
- E 3D-Level **weidert d'Fernebene vun der Kamera op**, wann et méi grouss ass wéi d'Daten: Nooft an Fern ginn aus dem Datesaz kalibréiert, an eng exportéiert Kaart vu e puer Kilometer Breet léch soss ganz hannert der Fernebene an d'Usiicht bléif eidel. D'Fernebene gëtt 3 × d'horizontal Ausdehnung vum Level, wann dat méi grouss ass; d'Nooftebene geet mat (op d'mannst Fern / 100.000), fir d'Déiftepräzisioun ze halen, vun där d'Verdeckung hänkt; an d'Fluchgeschwindegkeet gëtt op d'mannst Ausdehnung / 12 eropgesat. Et gëtt nëmmen ëmmer méi wäit gemaach, ni méi enk.

## De Panel, vun uewen no ënnen {#the-panel-top-to-bottom}

| Deel | Detailer |
|---|---|
| **Kaartebild…**, **3D-Modell…** | Lued ee; en ersetzt den aktuellen Level. |
| **Welt-Hannergrond**, **Kaartekachele vergiessen** | Nëmmen bei engem Datesaz mat geografescher Referenz: den echte Plaz drënner als Level bauen, oder déi erofgeluede Kachele läschen. [Welt-Hannergrond](world-backdrop.md) |
| **Vereinfachungsziel** | D'Dräieckbudget fir den nächste Modellimport: *Voll - keng Vereinfachung* (Standard), *Héich - 8M*, *Mëttel - 3M*, *Niddreg - 800k*, *Silhouette - 100k*. [3D-Levelen](model-levels.md#simplification) |
| Fortschrëtt an **Ofbriechen** | Wärend dem Dekodéieren oder Importéieren. |
| Importnotiz | Dräieck virdrun an duerno, d'Opdeelung an Buedem / Strukturen / Waasser, de benotzte Detailgrad. |
| Numm a Gréisst | `Breet×Héich px · x × z m/px` bei engem Bild, `N Dräieck (vun M)` bei engem Modell. |
| **Deckkraaft**, **Hellegkeet** | Bei béide Zorten. |
| Bildsteierungen | **Entsättegen**, **Norden/Süden ëmdréinen**, **Plazéierung** (zwee Anker), **Un d’Grenze vun den Donnéeën upassen**, **Héicht**. [Kaartbiller](map-images.md) |
| Modellsteierungen | Buedemreliéf, Waasser, Buedemdräieck, Drahtmodell, Textur, opgeholl Faarf, Strukturen, Deelklassifikatioun. [Ausgesinn](level-appearance.md) |
| **An der Bibliothéik späicheren**, **Ewechhuelen** | [Level-Bibliothéik](level-library.md); Ewechhuelen lued de Level aus. |
| **Bibliothéik** | Levelen, déi an dësem Browser gespäichert sinn. [Level-Bibliothéik](level-library.md) |

## Säiten an dëser Sektioun {#pages-in-this-section}

- [Kaartbiller](map-images.md)
- [3D-Levelen](model-levels.md) - Formater, Deeler, Klassifikatioun, Vereinfachung, Texturen
- [Ausgesinn](level-appearance.md) - all Steierung fir en 3D-Level
- [Level-Bibliothéik](level-library.md)
- [Welt-Hannergrond](world-backdrop.md) - déi richteg Welt ënner enger Opnam, aus oppene Daten

Wéi d'Levelen aus Spiller a Motoren kommen, ass d'Aufgab vun de getrennte Exporter-Werkzeich (kuckt de [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) vum Repository); den Vertrag, an deen se schreiwen, steet resuméiert bei [3D-Levelen](model-levels.md#the-exporter-contract).
