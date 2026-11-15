---
title: "Warmte"
parent: "Warmtemodi"
nav_order: 1
lang: "nl"
source: "heat.md"
source_hash: "0d84cc318ef8"
translated: true
outdated: false
---

# Warmte

Warmte kleurt de plekken waar veel gebeurde: rood waar het een beetje gebeurde, witgloeiend waar het veel gebeurde. Het beantwoordt de vraag "waar gebeurt dit, en hoeveel".

**Warmte** (toets 1) is de standaardmodus. Elke zichtbare [rij](glossary.md) draagt een camera-gericht rond [sprite](glossary.md) bij; overlappende sprites tellen op in een buffer met drijvende komma; de som wordt via een kleurenrampe omgezet - standaard transparant → rood → geel → wit - en over de scène getekend.

![Warmte op een 3D-niveau: hete plekken binnen en bovenop de gebouwen](../assets/img/nl/shooter-heat.webp)

De afbeelding toont de warmte van een schietronde op een niveau met gebouwen: hete plekken zitten in de kamers en op de trappen, niet alleen op de grond.

## Zo gebruik je het {#how-to-use-it}

1. Laad data en druk op `1` (of kies **Warmte** in de modusbalk).
2. Als alles wit of leeg is, druk dan op **Belichting automatisch uit het veld** in het gedeelte **Heatmapvorm**.
3. Verander **Spritestraal** tot naburige stippen tot banden samensmelten: kleiner toont losse plekken, groter toont gebieden.
4. Open **Heatmapkleuren** om de kleuren te wijzigen, of **Diepte** zodat heuvels en muren de warmte erachter verbergen.

![De gedeelten Heatmapvorm en Heatmapkleuren van de zijbalk, beide open](../assets/img/nl/heat-panel.webp)

Dezelfde panelen vormen [Verschil](difference.md), [Teamwarmte](team-heat.md) en [Lijnwarmte](line-heat.md); ze verschillen in wat wordt opgeteld (met teken, gekleurd, of langs lijnen), niet in hoe.

## De panelen en hun standaardwaarden {#the-panels-and-their-defaults}

Elke regelaar hieronder hoort bij een shaderparameter, dus wijzigen kost niets meer dan een nieuwe tekening. Schuifregelaars hebben een vak met getypte waarde ernaast en een sleepgreep (het kleine handvat rechts: omhoog of omlaag slepen, verder is sneller, Shift voor fijn); waar het spoor van een schuifregelaar eindigt vóór een echte grens, kan de greep verder duwen tot het *jog-plafond* dat hier staat. Waarden met *bij laden* worden voor elke nieuwe dataset opnieuw berekend.

### Heatmapvorm (open) {#heat-shape-open}

| Regelaar | Standaard | Bereik (jog-plafond) | Details |
|---|---|---|---|
| **Spritestraal** | 6 m; bij laden omvang / 120 | 0,05-2000 m, logaritmisch (50.000) | [Vorm van sprite](sprite-shape.md#sprite-radius) |
| **Intensiteit in het midden** | 1 | 0-10 (1000) | [Vorm van sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Intensiteit aan de rand** | 0 | -2-10 (1000) | [Vorm van sprite](sprite-shape.md#centre-and-edge-intensity) |
| **Vorm van het verloop** | *Afval* | *Afval* / *Curve* | [Vorm van sprite](sprite-shape.md#ramp-shape-falloff-or-curve) |
| **Afval** (alleen Afval) | 1,6 | 0,1-8 (64) | [Vorm van sprite](sprite-shape.md#falloff) |
| **Zacht verloop** (alleen Afval) | aan | | [Vorm van sprite](sprite-shape.md#falloff) |
| Curve-editor (alleen Curve) | voorinstelling *Zacht* | | [Vorm van sprite](sprite-shape.md#the-curve-editor) |
| **Verzadigingspunt** | 24; bij laden een schatting, daarna gemeten | 0,1-4000, logaritmisch (10.000.000) | [Kleur en belichting](colour-and-exposure.md#saturation-point) |
| **Minimale intensiteit** | uit (0) | 0-100% | [Kleur en belichting](colour-and-exposure.md#minimum-heat) |
| **Dichtheidsrespons** | *Verzadigend* | *Verzadigend* / *Lineair* / *Log* | [Kleur en belichting](colour-and-exposure.md#density-response) |
| **Belichting automatisch uit het veld** | | knop | [Kleur en belichting](colour-and-exposure.md#auto-exposure) |
| **De weergave volgen** | aan | | Meet de belichting opnieuw elke keer dat de camera tot rust komt, zodat een gebied waar je in vliegt de hele kleurenrampe gebruikt. Kleine wijzigingen worden genegeerd en de schaal glijdt mee. Zet het uit, of sleep **Verzadigingspunt**, om de schaal vast te zetten en plekken op één schaal te vergelijken. [Kleur en belichting](colour-and-exposure.md#follow-the-view) |
| **Gelijke dichtheid bij elke zoom** | aan | | Een kleur betekent hetzelfde aantal rijen per oppervlak grond, hoe dichtbij je ook bent. Een sprite die de pixelgrenzen vergroten (veraf) of verkleinen (dichtbij) houdt de warmte die zijn echte grootte zou toevoegen, zodat een beeld dat van ver belicht is niet verbleekt als je erin vliegt. Uit: een begrensde sprite voegt zijn volle gewicht toe bij zijn begrensde grootte. [Vorm van sprite](sprite-shape.md#pixel-clamps) |
| **Plat op het grondvlak** | uit | | [Vorm van sprite](sprite-shape.md#flatten-onto-ground-plane) |

### Heatmapkleuren (dicht) {#heat-colours-closed}

| Regelaar | Standaard | Details |
|---|---|---|
| Groepsstalen en **Kleurscheiding** (alleen Teamwarmte) | 1,4 | [Teamwarmte](team-heat.md) |
| Editor **Heatmapverloop** (*Positief (additieve teams)* bij Verschil, *Dekkingsverloop* bij Teamwarmte) | transparant → rood → geel → wit | [Kleur en belichting](colour-and-exposure.md#the-ramp-editor) |
| **Herstellen naar transparant → rood → geel → wit** | | |
| **Negatief (subtractieve teams)**-verloop (alleen Verschil) | transparant → groen → blauw → paars | [Verschil](difference.md#colours) |

### Spritepixelgrenzen (dicht) {#sprite-pixel-clamps-closed}

| Regelaar | Standaard | Bereik (jog-plafond) | Details |
|---|---|---|---|
| **Min. pixelstraal** | 1 px | 0-16 (512) | [Vorm van sprite](sprite-shape.md#pixel-clamps) |
| **Max. pixelstraal** | 96 px | 2-1024, logaritmisch (8192) | [Vorm van sprite](sprite-shape.md#pixel-clamps) |

### Diepte (open) {#depth-open}

| Regelaar | Standaard | Details |
|---|---|---|
| **Verbergen achter terrein** | aan | [Diepte en culling](depth-and-culling.md#hide-behind-terrain) |
| **Verborgen achter geometrie** | 0,8 (*80% donkerder*) | [Diepte en culling](depth-and-culling.md#hidden-behind-geometry) |

### Afstandsculling (dicht) {#distance-culling-closed}

| Regelaar | Standaard | Bereik (jog-plafond) | Details |
|---|---|---|---|
| **Nabij** | uit (0) | 0,5-5000 m, logaritmisch, onderkant van het spoor = uit (200.000) | [Diepte en culling](depth-and-culling.md#distance-culling) |
| **Ver** | uit (0) | 1-200.000 m, logaritmisch, onderkant = uit (10.000.000) | [Diepte en culling](depth-and-culling.md#distance-culling) |
| **Afsnijden op een vlak** | aan | | [Diepte en culling](depth-and-culling.md#distance-culling) |
| **Ook het level afsnijden** | aan | | [Diepte en culling](depth-and-culling.md#distance-culling) |

Toetsen: `[` en `]` schuiven de verre grens naar binnen en naar buiten, `\` schakelt hem in en uit ([Diepte en culling](depth-and-culling.md#keyboard)).

### Richting en Waarde {#direction-and-value}

Twee gedeelten staan onder Heatmapvorm. **Richting** tekent elke rij als wig en voegt pijlen toe: zie [Richtingswarmte](directional-heat.md). **Waarde** weegt de warmte naar wat elke rij kostte of opleverde: zie [Waardeweging](value-weighting.md).

## Wat wordt opgeslagen {#what-is-saved}

De warmte-instellingen hierboven worden niet tussen sessies bewaard: het herladen van de pagina zet de standaardwaarden terug. Twee dingen worden in de browser bewaard: de laatste afspeelsnelheid (`heat3d.speed`, zie [Tijdlijn](timeline.md)) en de instellingen voor de verre figuren van de [figurenoverlay](box-replay.md) (symboolstijl, grootte, treffermarkeringen en zo verder). Dat geldt ook voor de taal, de [omgekeerde wereldassen](camera.md#invert-world-axis), de onthouden wagennamen van het racetabblad en de [niveaubibliotheek](level-library.md). De volledige lijst staat bij [Opgeslagen instellingen](ref-settings-storage.md).
