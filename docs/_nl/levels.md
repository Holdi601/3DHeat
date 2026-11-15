---
title: "Niveaus en achtergrondgeometrie"
nav_order: 16
has_children: true
lang: "nl"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Niveaus en achtergrondgeometrie

Een niveau is de 3D-plek waar het spel zich afspeelde - een kaart, een stad, een baan. Zet er één achter je data en je ziet *waar* de warmte zit. Het paneel **Achtergrond / level** (zie [Woordenlijst](glossary.md) voor "niveau") geeft drie soorten context:

- een **kaartafbeelding**, georefereerd met twee ankerpunten - zie [Kaartafbeeldingen](map-images.md);
- een **3D-niveau** - `.glb`, `.gltf`, `.obj`, `.stl` of `.ply` - gesplitst in grond, constructies en water en bij het importeren vereenvoudigd - zie [3D-niveaus](model-levels.md) en [Uiterlijk van niveau](level-appearance.md);
- een **wereldachtergrond** - voor een opname die zegt waar op aarde hij is (een Tacview ACMI-bestand): het echte terrein, wegen, water, vliegvelden en gebouwen, gedownload uit open data - zie [Wereldachtergrond](world-backdrop.md).

Zonder iets geladen is de scène donker met een raster en gekleurde assen (**Raster** en **Assen** in [Camera & scène](camera.md)), en het paneel zegt *Niets geladen - de scène toont een raster en assen. Voeg een kaartafbeelding of een niveaumesh toe om de warmte context te geven.*

Het niveau wordt door alle drie de tabbladen gedeeld: een baan die in het tabblad Race-analyse geladen is, is hetzelfde niveau dat de warmtekaart toont.

![Het paneel Achtergrond / level met een niveau geladen: knoppen Kaartafbeelding en 3D-model, Strijdtoneel, Dekking, Helderheid, Opslaan in bibliotheek en de lijst Bibliotheek](../assets/img/en/level-panel.webp)

## Zet een niveau achter je data {#put-a-level-behind-your-data}

1. Laad eerst je data ([Gegevens binnenhalen](getting-data-in.md)), zodat het niveau erop wordt afgestemd.
2. Open **Achtergrond / level** in de zijbalk.
3. Druk op **Kaartafbeelding…** voor een afbeelding of **3D-model…** voor een 3D-niveau, en kies het bestand. Voor een opname uit de echte wereld gebruik je in plaats daarvan **Echte-wereldachtergrond** of **Strijdtoneel**.
4. Wacht tot de voortgangsregel klaar is. Een groot model wordt eerst vereenvoudigd (zie **Vereenvoudigingsdoel** hieronder).
5. Druk in de weergave op **F** om alles in beeld te brengen. Gebruik **Dekking** en **Helderheid** tot de warmte opvalt tegen het niveau.
6. Druk op **Opslaan in bibliotheek** als je het niveau opnieuw gaat gebruiken ([Niveaubibliotheek](level-library.md)).

## Wat een niveau voor de warmte doet {#what-a-level-does-for-the-heat}

- Het **bedekt**: datapunten achter het niveau worden per oppervlak gedimd, en datapunten achter het terrein worden verborgen ([Diepte en culling](depth-and-culling.md)). Zonder niveau is er geen bedekking.
- Het wordt **afgesneden** door de [Snede](slice.md) en, met *Ook het level afsnijden*, door de [afstandsculling](depth-and-culling.md#distance-culling), samen met de warmte.
- Het is het enige wat [scherptediepte](camera.md#depth-of-field) vervaagt, naast het raster en de blokken.
- Een 3D-niveau **verbreedt het verre vlak van de camera** wanneer het groter is dan de data: nabij en ver worden uit de dataset gekalibreerd, en een geëxporteerde kaart van meerdere kilometers breed zou anders helemaal achter het verre vlak liggen en een lege weergave laten. Het verre vlak wordt 3 × de horizontale omvang van het niveau wanneer dat groter is, het nabije vlak verschuift mee (minstens ver / 100.000) om de dieptenauwkeurigheid te behouden waar bedekking van afhangt, en de vliegsnelheid wordt verhoogd tot minstens omvang / 12. Het wordt alleen ooit verbreed, nooit versmald.

## Het paneel, van boven naar beneden {#the-panel-top-to-bottom}

| Onderdeel | Details |
|---|---|
| **Kaartafbeelding…**, **3D-model…** | Laad er één; het vervangt het huidige niveau. |
| **Echte-wereldachtergrond**, **Kaarttegels vergeten** | Alleen voor een dataset met een geografische verwijzing: bouw de echte plek eronder als niveau, of verwijder de gedownloade tegels. [Wereldachtergrond](world-backdrop.md) |
| **Vereenvoudigingsdoel** | Het driehoeksbudget voor de volgende modelimport: *Vol - geen vereenvoudiging* (standaard), *Hoog - 8M*, *Middel - 3M*, *Laag - 800k*, *Silhouet - 100k*. [3D-niveaus](model-levels.md#simplification) |
| Voortgang en **Annuleren** | Tijdens het decoderen of importeren. |
| Importnotitie | Driehoeken voor en na, de splitsing grond / constructies / water, het gebruikte detailniveau. |
| Naam en grootte | `breedte×hoogte px · x × z m/px` voor een afbeelding, `N driehoeken (van M)` voor een model. |
| **Dekking**, **Helderheid** | Voor beide soorten. |
| Afbeeldingsregelaars | **Ontkleuren**, **Noord/zuid spiegelen**, **Plaatsing** (twee ankers), **Passend maken op datagrenzen**, **Hoogte**. [Kaartafbeeldingen](map-images.md) |
| Modelregelaars | Reliëf van de grond, water, grondtriangels, draadmodel, textuur, vastgelegde kleur, constructies, onderdeelclassificatie. [Uiterlijk van niveau](level-appearance.md) |
| **Opslaan in bibliotheek**, **Verwijderen** | [Niveaubibliotheek](level-library.md); Verwijderen haalt het niveau weg. |
| **Bibliotheek** | Niveaus die in deze browser zijn opgeslagen. [Niveaubibliotheek](level-library.md) |

## Pagina's in dit deel {#pages-in-this-section}

- [Kaartafbeeldingen](map-images.md)
- [3D-niveaus](model-levels.md) - formaten, onderdelen, classificatie, vereenvoudiging, texturen
- [Uiterlijk van niveau](level-appearance.md) - elke regelaar voor een 3D-niveau
- [Niveaubibliotheek](level-library.md)
- [Wereldachtergrond](world-backdrop.md) - de echte wereld onder een opname, uit open data

Hoe je niveaus uit spellen en engines haalt is het werk van de aparte exporttools (zie de [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) van de repository); het contract waar ze naar schrijven wordt samengevat in [3D-niveaus](model-levels.md#the-exporter-contract).
