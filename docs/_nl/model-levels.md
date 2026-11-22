---
title: "3D-niveaus"
parent: "Niveaus en achtergrondgeometrie"
nav_order: 2
lang: "nl"
source: "model-levels.md"
source_hash: "0afa06188c9e"
translated: true
outdated: true
---

# 3D-niveaus

Een 3D-niveau is een model van de plek - heuvels, straten, gebouwen - waarin je data zich bevindt. Zo zie je op welke verdieping, heuvel of dak de warmte zit. De viewer splitst het niveau in grond (massief), structuren (doorzichtig, zodat je erin kunt kijken) en water.

## Een 3D-niveau laden {#load-a-3d-level}

1. Laad eerst je data ([Gegevens binnenhalen](getting-data-in.md)). Het model moet dezelfde wereldruimte en eenheid als de data gebruiken, met Y omhoog.
2. Kies bij **Achtergrond / level** een **Vereenvoudigingsdoel**. Laat het op *Volledig – geen vereenvoudiging* staan, tenzij het model erg groot is.
3. Druk op **3D-model…** en kies een bestand `.glb`, `.gltf`, `.obj`, `.stl` of `.ply`.
4. Wacht op de voortgangsregel. Met **Annuleren** stop je het.
5. Druk in de weergave op **F**. De grond is massief, structuren zijn doorzichtige schillen, water is plat.
6. Pas de look aan in [Uiterlijk van niveau](level-appearance.md). Druk op **Opslaan in bibliotheek** om het resultaat te bewaren ([Niveaubibliotheek](level-library.md)).

![Een 3D-niveau geladen: ondoorzichtige grond met hoogtelijnen, doorzichtige gebouwen, plat water](../assets/img/en/model-levels-loaded.webp)

**3D-model…** laadt het niveau-mesh. Het wordt in een achtergrond-worker ingelezen, ingedeeld en vereenvoudigd ([`modelWorker.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelWorker.ts)), met een voortgangsregel en **Annuleren**: *Model lezen*, *Bestand parseren*, *N texturen inpakken*, *N onderdelen indelen*, *Grond vereenvoudigen (N driehoeken)*, *Structuren vereenvoudigen (N driehoeken)*, *Draadmodel bouwen*.

## Formaten {#formats}

| Formaat | Wat er gelezen wordt | Grenzen |
|---|---|---|
| `.glb` | Elk mesh-onderdeel met `mode` 4 (driehoeken) of zonder mode, met de wereldtransformatie van elk knooppunt toegepast; `POSITION`; `COLOR_0` (vec3 of vec4) als vertexkleur; de `baseColorTexture` van het materiaal en zijn `TEXCOORD_n` als textuur; knoop- en meshnamen als namen van onderdelen. | Lijnen en punten worden overgeslagen. |
| `.gltf` | Hetzelfde. | Alleen met ingesloten buffers: een glTF die naar een extern `.bin` verwijst, wordt geweigerd met *Exporteer als één .glb, zodat de geometrie is ingesloten.* |
| `.obj` | Vlakken, met `o`- en `g`-blokken als onderdelen. | Alleen geometrie (geen materialen). |
| `.stl` | Binair en ASCII (`solid …`). | Eén onderdeel. |
| `.ply` | Alleen ASCII. | Binaire PLY wordt geweigerd met *Converteer naar .glb of binaire .stl.* |

Alleen geometrie: posities, normalen en driehoeken samengevoegd in één buffer, plus kleuren en textuurcoördinaten waar die aanwezig zijn ([`modelParse.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/modelParse.ts)). Een model zonder driehoeken wordt geweigerd. Het model moet dezelfde wereldruimte en eenheid als de data gebruiken (Y omhoog). Er wordt niets getransformeerd om het te laten passen.

## Grond, structuren en water {#ground-structures-and-water}

Een niveau wordt bij het importeren in drie klassen ingedeeld, omdat ze tegengestelde behandelingen nodig hebben ([`classify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/classify.ts)):

- **Grond** - wordt ondoorzichtig getekend en met reliëfaanwijzingen geschaduwd (helling, hoogtelijnen, een hoogteverloop), zodat je de positie ten opzichte ervan kunt aflezen.
- **Structuren** - gebouwen en objecten staan tussen de camera en de warmte erin. Ze worden daarom als **doorzichtige schil** getekend (zwakke vlakken met een heldere rand, plus ontdubbelde randen). Of, als ze texturen hebben, massief in hun texturen.
- **Water** - plat, zonder reliëfaanwijzingen. Een hoogtelijn over een meer is onzin.

Elk onderdeel (knoop van glTF, object van OBJ of groep) wordt apart ingedeeld, op de eerste regel die van toepassing is:

1. **Het label van de exporter.** Een naam die begint met `ground:`, `structure:` of `water:` (of met `|` in plaats van `:`) wordt zoals hij luidt aangenomen. De eigen exporters van het project geven elk onderdeel zo'n label.
2. **Waternamen.** `water` als los woord (niet *water tower*, *-tank*, *-mill*, *-front*, *-fall*, *-pump*, *-pipe*), `ocean`, `sea`, `lake`, `pond`, `lagoon`, `river`.
3. **Grondnamen.** `terrain`, `landscape`, `ground…`, `…_ground`, `heightmap`, `floor…`, `map` / `map_…`, `base` / `base_…`, `road`, `street`, `pavement`, `sidewalk`.
4. **Structuurnamen.** `house`, `building`, `bldg`, `wall`, `roof`, `door`, `window`, `stair`, `prop`, `asset`, `clutter`, `debris`, `crate`, `barrel`, `fence`, `tree`, `rock`, `bush`, `vehicle`, `car`, `truck`, `tank`, `bridge`, `tower`, `silo`, `hangar`, `bunker`.
5. **Geometrie.** Een onderdeel dat meer dan 25% van het X-Z-oppervlak van de kaart bedekt, met meer dan 60% van de driehoeksoppervlakte omhoog gericht, is grond. Een onderdeel met minder dan 45% omhoog gericht, of hoger dan 15% van de hoogte van het niveau terwijl het minder dan 10% van het oppervlak bedekt, is een structuur. Het omhoog gerichte aandeel wordt gewogen naar oppervlakte. Een huis wordt dus niet plat genoemd omdat het een dak heeft.
6. **Anders grond** - een dubbelzinnig onderdeel wordt grond. Een bijna onzichtbare schil als standaard zou het niveau laten lijken op een tekenfout.

Een model dat uit één onderdeel bestaat dat als structuur is ingedeeld, wordt in plaats daarvan grond (*één naamloos mesh - als grond behandeld*).

### Navigatiemeshes {#navigation-meshes}

Een onderdeel met de naam `nav:…` (bijvoorbeeld `nav:walkable` van een niveau-exporter) is een navigatiemesh: waar een soldaat kan staan. Het wordt als grond vermeld (*navigatiemesh - niet getekend, want het ligt op de grond; klikken vindt het nog steeds*), maar **niet getekend**. Het ligt over de grond waaruit het is gegenereerd, binnen centimeters in hetzelfde vlak. Als het wel als grond getekend werd, streden de twee oppervlakken om elke pixel. Op een niveau met een ingebakken grondtextuur verscheen het hele speelbare gebied als scherp begrensde vlekken grijs en beige, één per driehoek van de navigatiemesh. Het wordt ongewijzigd bewaard, zonder vereenvoudiging, zodat [klikken om te kiezen](camera.md#click-to-pick) kan zeggen of een plek begaanbaar is. Items in de bibliotheek bewaren het niet.

**Toon indeling van onderdelen (N)** in het paneel (te zien bij modellen met meer dan één onderdeel) somt elk onderdeel op met zijn klasse en de reden: *door de exporter gelabeld*, *naam past bij patroon*, *bedekt X% van de kaart, Y% omhoog gericht*, *Y% omhoog gericht, Z% van de hoogte van het niveau*, *dubbelzinnig - als grond behandeld*. Om er een te wijzigen, hernoem je het onderdeel in het bronmodel en importeer je opnieuw. De indeling zit ingebakken in de indexbuffers.

## Vereenvoudiging {#simplification}

**Vereenvoudigingsdoel** stelt het driehoeksbudget in voor de volgende import ([`simplify.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/simplify.ts)):

| Instelling | Driehoeken |
|---|---|
| *Volledig – geen vereenvoudiging* (standaard) | alle |
| *Hoog – 8 mln. driehoeken* | 8.000.000 |
| *Middel – 3 mln. driehoeken* | 3.000.000 |
| *Laag – 800.000 driehoeken* | 800.000 |
| *Silhouet – 100.000 driehoeken* | 100.000 |

Het budget wordt **60% naar structuren en 40% naar de grond** verdeeld. Die worden apart vereenvoudigd, want structuren verliezen hun vorm bij het verkleinen het snelst. Water wordt niet vereenvoudigd. De vereenvoudiging is edge collapse met quadric error metrics ([meshoptimizer](https://github.com/zeux/meshoptimizer), via WebAssembly), na het samenvoegen van samenvallende hoekpunten. Zo blijven silhouetten en harde randen behouden. De importmelding geeft `bron → nu driehoeken, afwijking X%`, de verdeling van grond, structuren en water over de onderdelen, en - als *Volledig* is gebruikt op een model boven 8 miljoen driehoeken - een tip voor *Hoog* (tot 30 miljoen) of *Middel* (meer). Zonder WebAssembly is de vereenvoudiger niet beschikbaar, en de import zegt dat.

Niveaus van de eigen exporters van het project hebben al een budget. Het doel bestaat voor ruwe kunst zonder budget erachter.

## Texturen {#textures}

Een `.glb` waarvan de onderdelen basiskleurtexturen hebben, wordt in die texturen getekend. Een export van een racebaan heeft bijvoorbeeld één textuur per terreintegel en één per geplaatst model.

Grondtextuur wordt standaard getoond als die aanwezig is. Structuren met texturen beginnen **massief, in hun eigen texturen** (kantstenen, vangrails, bandenmuren en borden zijn de randen van een weg, geen gebouwen om in te kijken). Het draadmodel staat uit en de platte schaduw ook. Zie [Uiterlijk van niveau](level-appearance.md).

## Grote niveaus {#large-levels}

- Boven **300.000** driehoeken van structuren staan de randen van de structuren standaard uit en de dekking van de vlakken op 35%. Met een rand in elke pixel lijkt het district anders een vlak wit.
- Het verre vlak van de camera wordt breder om het niveau te passen ([Niveaus](levels.md#what-a-level-does-for-the-heat)).

## Voor ontwikkelaars {#for-developers}

### Texture-atlas {#texture-atlas}

Elke textuur wordt in de importworker in **één atlas** gepakt ([`atlas.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/atlas.ts)). Het niveau blijft zo één tekenbeurt, één sampler en één textuurcoördinaatattribuut op beide backends:

- ingepakt in rijen, elk op de eigen grootte van de afbeelding, en alleen verkleind als de set anders niet in **8192 px** past in een van beide richtingen (de standaard maximale texturegrootte van WebGPU);
- een **marge van 16 pixels** rond elke afbeelding, en alleen de 5 mipniveaus die die marge beschermt. Zo bemonstert een verre bordje nooit de textuur van zijn buurman;
- **herhalende texturen blijven herhalen.** Een afbeelding waarvan de glTF-sampler herhaalt (de glTF-standaard) en waarvan de textuurcoördinaten buiten 0..1 vallen (een bakstenen muur waarvan de UV langs de muur van 0 tot 40 loopt), wordt een *tegel*. Zijn hoekpunten houden hun eigen coördinaten en een tegelnummer van 16 bits. De shaders wikkelen de coördinaat per pixel terug in het rechthoekje van de tegel. Het mipniveau komt van de niet-gewikkelde coördinaat, zodat de naden niet zichtbaar worden. De marge van een tegel bevat zijn eigen tegenoverliggende rand. Een as waarvan de sampler afklemt, wordt afgeklemd. Een afbeelding waarvan de coördinaten binnen 0..1 blijven, wordt zoals voorheen getekend. Een niveau met tegels kost 4 bytes extra per hoekpunt.

### Het exportcontract {#the-exporter-contract}

Wat de viewer van een niveau nodig heeft, ongeacht wat het heeft gemaakt:

- één zelfstandig `.glb`;
- `POSITION` als float32, driehoeksprimitieven;
- knoopnamen `ground:*`, `structure:*` en `water:*` (al het andere wordt ingedeeld volgens de regels hierboven), en `nav:*` voor een navigatiemesh, die wordt bewaard maar niet getekend;
- coördinaten in wereldruimte, **Y omhoog**, in dezelfde eenheid als de telemetrie, zodat de data zonder plaatsingsstap op het niveau past.
