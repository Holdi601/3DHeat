---
title: "Figuren"
parent: "Replay"
nav_order: 3
has_children: true
lang: "nl"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figuren

Een **figuur** is een klein 3D-model van wat een eenheid echt was: een tank, een straaljager, een schip, een soldaat. De [replay](match-replay.md) tekent elke eenheid als zijn figuur op ware grootte, in plaats van als een gewone doos.

Er zijn ongeveer 2.000 benoemde voertuigen, vliegtuigen, schepen, wapens en soldaten, allemaal gebouwd door de viewer zelf.

![Tanks van de demo, getekend als hun eigen figuren](../assets/img/nl/replay-tanks.webp)

## Wat er in de catalogus zit {#what-is-in-the-catalogue}

| Domein | Voorbeelden |
|---|---|
| Mensen | soldaat staand, geknield, liggend; sluipschutter, antitank, medicus, bemanning |
| Grond | tanks, infanteriegevechtsvoertuigen, luchtverdediging, artillerie, vrachtwagens en auto's, treinen en trams |
| Lucht | jagers, aanvalsvliegtuigen, bommenwerpers, transporttoestellen, helikopters, van tweedekkers tot moderne straaljagers |
| Zee | oorlogsschepen per klasse, vliegdekschepen, onderzeeërs, boten, koopvaardijschepen |
| Wapens | raketten, vuurpijlen, bommen, torpedo's, flares en chaff |
| Markeringen | rook-, flits- en brandgranaten, geplaatste bommen, vlaggen, spawns, waypoints |

## Hoe de figuren worden gemaakt {#how-the-figures-are-made}

- **Gebouwd uit gepubliceerde afmetingen.** De meeste figuren worden gemaakt door de eigen figurenbouwer van de viewer, uit openbare getallen: lengte, breedte, hoogte, wegwielen, toren en kanon, vleugels en staart. Hun vorm wordt daarna afgesteld op openbare foto's, tekeningen en gepubliceerde afmetingen. Er worden geen modellen van een spel gebruikt.
- **Vrije modellen.** Een paar figuren gebruiken vrije 3D-modellen (CC0 of CC BY) waar die waarheidsgetrouwer zijn, soms gecombineerd met de gebouwde romp. Auteurs van CC BY-werken worden vermeld op [Naamsvermeldingen figuren](figure-credits.md); CC0-werken hebben geen naamsvermelding nodig en staan daar niet in de lijst.
- Elke figuur heeft een volledige, een grove en een verre versie (detailniveaus, LOD), zodat er duizenden tegelijk kunnen worden getekend.

## Welke figuur een eenheid krijgt {#which-figure-a-unit-gets}

De viewer kijkt naar de eigen kolommen van de data:

1. **Namen** - kolommen die *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* of *Figure* heten - worden vergeleken met de catalogus: exact, via ongeveer 4.000 aliassen (eenheids-id's van meerdere spellen), op het langste bekende begin (`F-16C_50` is de F-16C), of op de kortste figuurnaam die ermee begint.
2. Een naam waarvan de figuur niet bij het **type** van de eenheid past, wordt niet gebruikt (een vrachtwagen die *Typhoon* heet, is niet de jager).
3. **Typen** - kolommen die *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* of *Domain* heten - geven een klassefiguur: Tacview-tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kaartsymbolen, of gewone woorden (tank, helikopter, infanterie).
4. Data met geen van beide is data van mensen: iedereen is een soldaat.

De makkelijkste manier om de juiste figuren te krijgen is dus een kolom `vehicle` met de echte namen, of een kolom `type` met Tacview-tags.

**Mijn eenheid verschijnt als een doos of een soldaat.** Voeg een kolom `vehicle` toe met de echte naam, of een kolom `type` met een Tacview-tag. Wijs de eenheid aan om te zien welke naam is gevonden. Data die zulke kolommen heeft maar niets over een eenheid zegt, laat die als doos staan; data zonder beide wordt als soldaten getekend.

## Instellingen {#settings}

Het gedeelte **Figuren** van de zijbalk van de replay stelt de grootte in, de kleinste grootte op het scherm, wat verre eenheden worden (figuur, pijl, symbool), en de effecten die erop worden getekend. Zie [Wedstrijdreplay](match-replay.md#figures). Rook, vuur en andere effecten met een tijdslimiet: [Figuren in de figurenoverlay](figure-replay.md).

## Een optioneel lokaal figurenpakket {#an-optional-local-figure-pack}

Je kunt op je eigen computer een optioneel pakket met eigen figuren bewaren. De figuren daarin nemen de plaats in van catalogusfiguren met dezelfde namen. Het maakt nooit deel uit van de repository of een gepubliceerde build; zonder pakket verandert er niets.
