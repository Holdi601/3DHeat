---
title: "Niveaus en achtergrondgeometrie"
nav_order: 13
has_children: true
lang: "nl"
source: "levels.md"
source_hash: "1283adc1548a"
translated: true
outdated: false
---

# Niveaus en achtergrondgeometrie

Een niveau is de 3D-plek waar het spel zich afspeelde - een kaart, een stad, een baan. Zet er één achter je data en je ziet *waar* de warmte zit. Het paneel **Achtergrond / level** (zie [Woordenlijst](glossary.md) voor "niveau") geeft je drie soorten context:

- een **kaartafbeelding**, met twee ankers op de werkelijke positie geplaatst - zie [Kaartafbeeldingen](map-images.md);
- een **3D-niveau** - `.glb`, `.gltf`, `.obj`, `.stl` of `.ply` - bij het importeren gesplitst in grond, structuren en water en vereenvoudigd - zie [3D-niveaus](model-levels.md) en [Uiterlijk van niveau](level-appearance.md);
- een **wereldachtergrond** - voor een opname die zegt waar op aarde hij is (een Tacview ACMI-bestand): het echte terrein, de wegen, het water, de vliegvelden en de gebouwen, gedownload uit open data - zie [Wereldachtergrond](world-backdrop.md).

Zonder geladen niets is de scène donker met een raster en gekleurde assen (**Raster** en **Assen** in [Camera en scène](camera.md)), en het paneel zegt *Niets geladen - de scène toont een raster en assen. Voeg een kaartafbeelding of een niveaumesh toe om de warmte context te geven.*

Het niveau wordt door alle drie de tabbladen gedeeld: een baan die in het tabblad Race-analyse is geladen, is hetzelfde niveau dat de warmtekaart toont.

![Het paneel Achtergrond / level met een geladen niveau: knoppen Kaartafbeelding en 3D-model, Strijdtoneel, Dekking, Helderheid, Opslaan in bibliotheek en de lijst Bibliotheek](../assets/img/nl/level-panel.webp)

## Een niveau achter je data zetten {#put-a-level-behind-your-data}

1. Laad eerst je data ([Data laden](getting-data-in.md)), zodat het niveau erop wordt gepast.
2. Open **Achtergrond / level** in de zijbalk.
3. Druk op **Kaartafbeelding…** voor een afbeelding of op **3D-model…** voor een 3D-niveau, en kies het bestand. Voor een opname uit de echte wereld gebruik je in plaats daarvan **Wereldachtergrond** of **Strijdtoneel**.
4. Wacht tot de voortgangsregel klaar is. Een groot model wordt eerst vereenvoudigd (zie **Vereenvoudigingsdoel** hieronder).
5. Druk in de weergave op **F** om alles in beeld te brengen. Gebruik **Dekking** en **Helderheid** tot de warmte opvalt tegen het niveau.
6. Druk op **Opslaan in bibliotheek** als je het niveau opnieuw gaat gebruiken ([Niveaubibliotheek](level-library.md)).

## Wat een niveau voor de warmte doet {#what-a-level-does-for-the-heat}

- Het **verbergt**: datapunten erachter worden per oppervlak verduisterd, en datapunten achter het terrein worden verborgen ([Diepte en afknippen](depth-and-culling.md)). Zonder niveau is er geen occlusie.
- Het wordt **afgesneden** door de [Doorsnede](slice.md) en, met *Ook het level afsnijden*, door [afstandsculling](depth-and-culling.md#distance-culling), samen met de warmte.
- Het is het enige wat [scherptediepte](camera.md#depth-of-field) vervaagt, naast het raster en de blokken.
- Een 3D-niveau **verbreedt het verre vlak van de camera** wanneer het groter is dan de data: nabij en ver worden gekalibreerd op de dataset, en een geëxporteerde kaart van meerdere kilometers breed zou anders helemaal achter het verre vlak liggen en een leeg beeld geven. Het verre vlak wordt 3 × de horizontale omvang van het niveau als die groter is, het nabije vlak verschuift mee (minstens ver / 100.000) om de dieptenauwkeurigheid te behouden waarvan occlusie afhangt, en de vliegsnelheid wordt verhoogd tot minstens omvang / 12. Het wordt alleen ooit verbreed, nooit versmald.

## Het paneel, van boven naar beneden {#the-panel-top-to-bottom}

| Onderdeel | Details |
|---|---|
| **Kaartafbeelding…**, **3D-model…** | Laad er één; het vervangt het huidige niveau. |
| **Wereldachtergrond**, **Kaarttegels vergeten** | Alleen voor een dataset met een geografische verwijzing: bouw de echte plek eronder als niveau, of verwijder de gedownloade tegels. [Wereldachtergrond](world-backdrop.md) |
| **Vereenvoudigingsdoel** | Het driehoeksbudget voor de volgende modelimport: *Volledig - geen vereenvoudiging* (standaard), *Hoog - 8M*, *Middel - 3M*, *Laag - 800k*, *Silhouet - 100k*. [3D-niveaus](model-levels.md#simplification) |
| Voortgang en **Annuleren** | Tijdens het decoderen of importeren. |
| Importnotitie | Driehoeken voor en na, de splitsing grond / structuren / water, het gebruikte detailniveau. |
| Naam en grootte | `breedte×hoogte px · x × z m/px` bij een afbeelding, `N driehoeken (van M)` bij een model. |
| **Dekking**, **Helderheid** | Beide soorten. |
| Afbeeldingsregelaars | **Ontkleuren**, **Noord/zuid spiegelen**, **Plaatsing** (twee ankers), **Passend maken op datagrenzen**, **Hoogte**. [Kaartafbeeldingen](map-images.md) |
| Modelregelaars | Grondreliëf, water, gronddriehoeken, draadmodel, textuur, vastgelegde kleur, structuren, deelclassificatie. [Uiterlijk van niveau](level-appearance.md) |
| **Opslaan in bibliotheek**, **Verwijderen** | [Niveaubibliotheek](level-library.md); Verwijderen haalt het niveau weg. |
| **Bibliotheek** | Niveaus die in deze browser zijn opgeslagen. [Niveaubibliotheek](level-library.md) |

## Pagina's in dit gedeelte {#pages-in-this-section}

- [Kaartafbeeldingen](map-images.md)
- [3D-niveaus](model-levels.md) - formaten, onderdelen, classificatie, vereenvoudiging, texturen
- [Uiterlijk van niveau](level-appearance.md) - elke regelaar voor een 3D-niveau
- [Niveaubibliotheek](level-library.md)
- [Wereldachtergrond](world-backdrop.md) - de echte wereld onder een opname, uit open data

Hoe je niveaus uit spellen en engines haalt, is het werk van de aparte exporttools (zie de [README](https://github.com/Holdi601/3DHeat/blob/main/README.md) van de repository); het contract waarnaar ze schrijven, staat samengevat in [3D-niveaus](model-levels.md#the-exporter-contract).
