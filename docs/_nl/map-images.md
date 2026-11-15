---
title: "Kaartafbeeldingen"
parent: "Niveaus en achtergrondgeometrie"
nav_order: 1
lang: "nl"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---

# Kaartafbeeldingen

Een kaartafbeelding is een platte afbeelding - een minimap, een satellietfoto, een plattegrond - die onder je data wordt gelegd, zodat je kunt zien waar de warmte zit. Je vertelt de viewer waar de afbeelding hoort door twee punten erop vast te zetten op twee plekken in de wereld (de "ankers").

## Een kaartafbeelding laden en plaatsen {#load-and-place-a-map-image}

1. Laad eerst je data ([Data laden](getting-data-in.md)).
2. Druk onder **Achtergrond / level** op **Kaartafbeelding…** en kies de afbeelding. Ze wordt uitgerekt over het gebied van de data.
3. Druk op **Passend maken op datagrenzen** als de afbeelding is verschoven. Anker 1 gaat naar de linkerbovenhoek van de afbeelding, anker 2 naar de rechteronderhoek, bij de randen van de data.
4. Als de warmte niet op de afbeelding past, kies dan twee herkenningspunten die ver uit elkaar liggen (bijvoorbeeld twee tegenoverliggende hoeken van een gebouw of twee kruispunten). Lees de pixel van elk op de afbeelding af en de positie in de wereld (beweeg met de [liniaal](measure.md) om **X** en **Z** af te lezen).
5. Typ ze in bij **Plaatsing**: voor **Anker 1** het **px**, **py**, **wereld X**, **wereld Z** van het herkenningspunt; hetzelfde voor **Anker 2**.
6. Controleer: een spoor of hotspot waarvan je weet dat hij op een weg ligt, moet nu op die weg liggen. Pas de getallen aan tot dat klopt.

![Het gedeelte Plaatsing met twee ankers en warmte getekend op een kaartafbeelding](../assets/img/en/map-images-placement.webp)

De twee herkenningspunten moeten verschillen in zowel de pixelkolommen als de pixelrijen, anders zegt het paneel *De twee ankers delen een pixelrij of -kolom*.

## Laden {#loading}

Elk afbeeldingsformaat dat de browser kan lezen. Een afbeelding waarvan de langste zijde boven **8192 px** is, wordt verkleind tot 8192 (de grootste zijde die aan de GPU wordt gevraagd), en het paneel zegt *Verkleind van B×H naar b×h*.

Bij het laden wordt de afbeelding over de X-Z-grenzen van de dataset uitgerekt (of ±1000 eenheden zonder dataset), noord omhoog, op de laagste Y van de dataset. De standaarden zijn **Dekking** 100%, **Helderheid** 0,7, **Ontkleuren** 100%, **Noord/zuid spiegelen** aan: ontkleurd en gedimd, omdat de achtergrond er is om een hotspot te helpen vinden en niet om ermee te concurreren.

## Regelaars {#controls}

| Regelaar | Standaard | Bereik | Betekenis |
|---|---|---|---|
| **Dekking** | 100% | 0-100% | |
| **Helderheid** | 0,7 | 0-2 (schuifregelaar 64) | |
| **Ontkleuren** | 100% | 0-100% | Grijze achtergrond, verzadigde warmte. Kleur in de kaart concurreert dan niet met kleur in de data. |
| **Noord/zuid spiegelen** | aan | | Welke rij van de afbeelding de maximale Z van de wereld is. Het omschakelen daarvan met een geladen dataset past ook de ankers opnieuw aan op de datagrenzen. |
| **Plaatsing**: Anker 1, Anker 2 | de hoeken van de afbeelding op de datagrenzen | | Elk anker is een pixel op de afbeelding - **px** (vanaf links, 0 tot de breedte) en **py** (vanaf boven, 0 tot de hoogte) - en de wereldcoördinaat waar het ligt, **wereld X** en **wereld Z**. Schaal en verschuiving volgen uit het paar. |
| **Passend maken op datagrenzen** | | | Zet anker 1 op de linkerbovenhoek van de afbeelding en anker 2 op de rechteronderhoek, bij de X-Z-grenzen van de data. Een beginpunt voor exacte plaatsing. Heeft een dataset nodig. |
| **Hoogte** | de laagste Y van de dataset | min. Y van de data - 500 tot max. Y + 500 (schuifregelaar max. Y + 100.000) | Hoogte van het kaartvlak. Zet hem net onder de data, zodat niets erdoor verborgen wordt. |

De naamregel toont `breedte×hoogte px · x × z m/px`, de grootte in de wereld van één pixel langs elke as.

## In de scène {#in-the-scene}

De afbeelding is één getextureerd vierhoekje op de hoogte. Bij volledige dekking schrijft ze diepte, dus ze doet mee aan [occlusie](depth-and-culling.md) als grond; onder 100% dekking wordt ze gemengd en schrijft ze geen diepte, dus ze verbergt niets. De [liniaal](measure.md) meet op haar vlak. De [niveaubibliotheek](level-library.md) bewaart een afbeeldingsniveau met zijn ankers.

## Dota 2-kaart {#dota-2-map}

**Dota 2-kaart** naast **Kaartafbeelding…** haalt de tekening van de huidige Dota 2-kaart op die [OpenDota](https://www.opendota.com) op zijn wedstrijdpagina's toont, en plaatst die onder tabellen die de [Watcher](https://github.com/Holdi601/3DHeat-Watcher) schrijft uit Dota 2-replays ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). De afbeelding wordt van opendota.com opgehaald wanneer je op de knop drukt en maakt geen deel uit van 3DHeat; de tekening van de nieuwste patch komt uit de eigen lijst van OpenDota, en de tekening van 7.40 wanneer die lijst niet gelezen kan worden.

| | |
|---|---|
| Bron | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Plaatsing | De kalibratie van OpenDota: de afbeelding beslaat Dota-wereldeenheden -8192 tot 8064 op beide assen (cellen van 128 eenheden 64 tot 191), noord bovenaan. Met de assen van de replaytabel (Z omhoog, Y omgedraaid) is dat wereld X -8192 tot 8064 en wereld Z -8064 tot 8192. Ongeveer 18 eenheden per pixel. |
| Hoogte | 0. Helden staan op 0 tot ongeveer 600. |
| Uiterlijk | Helderheid 0,8, ontkleuren 50%. |

Gecontroleerd op een openbare replay van een match op patch 7.40: het spoor van elke held volgt de getekende banen, en de torens, kazernes en ancients die de replay plaatst, vallen op de getekende basissen. De weergave **Boven** toont de kaart met het noorden onderaan het scherm, zoals die elke tabel met Z omhoog en Y omgedraaid toont.

De tekening is van OpenDota, van de kaart van Valve; Valve keurt 3DHeat niet goed.

### De 3D-kaart {#the-3d-map}

Met Dota 2 geïnstalleerd maakt het Watcher-commando [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) (`python -m heat3d_watch dota-map -o dota.glb`) de kaart in 3D uit de eigen bestanden van het spel: grond, kliffen, water, bomen en gebouwen, in de eenheden en assen van de replaytabellen. Laad het bestand één keer met **3D-model…**: de viewer herkent het aan zijn onderdelen (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` in `dotaMap.ts`), zet het meteen in de [niveaubibliotheek](level-library.md), ter vervanging van een oudere, en meldt dat. Vanaf dan laadt **Dota 2-kaart** die 3D-kaart uit de bibliotheek in plaats van de tekening te downloaden; staat er geen in de bibliotheek, dan downloadt de knop de tekening en vertelt hoe je de 3D-kaart maakt. Het bestand komt uit je eigen installatie en blijft op je eigen computer.

## Voor ontwikkelaars {#for-developers}

### Hoe de ankers de afbeelding plaatsen {#how-the-anchors-place-the-image}

Uit [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), met de ankers *a* en *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) ligt bij  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Twee ankers leggen op elke as schaal en verschuiving apart vast, zodat een kaart op X en Z verschillend kan worden uitgerekt maar niet gedraaid. De ankers moeten in **beide** pixelcoördinaten verschillen; als ze een rij of kolom delen, kan er geen schaal worden afgeleid, wordt de kaart niet getekend, en zegt het paneel *De twee ankers delen een pixelrij of -kolom*.
