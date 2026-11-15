---
title: "Figuren"
nav_order: 11
has_children: true
lang: "nl"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figuren

Een **figuur** is een klein 3D-model van wat een eenheid echt is: een tank, een straaljager, een schip, een soldaat. De [replay](match-replay.md) tekent elke eenheid als haar figuur op ware grootte, in plaats van een gewoon blok.

Er zijn ongeveer 2.000 benoemde voertuigen, vliegtuigen, schepen, wapens en soldaten, allemaal door de viewer zelf gebouwd.

![Tanks van de demo, getekend als hun eigen figuren](../assets/img/nl/replay-tanks.webp)

## Wat er in de catalogus zit {#what-is-in-the-catalogue}

| Domein | Voorbeelden |
|---|---|
| Mensen | soldaat staand, geknield, plat op de grond; sluipschutter, antitankschutter, medicus, bemanning |
| Grond | tanks, infanterievoertuigen, luchtverdediging, artillerie, vrachtwagens en auto's, treinen en trams |
| Lucht | jagers, aanvalsvliegtuigen, bommenwerpers, transporten, helikopters, van dubbeldekkers tot moderne straaljagers |
| Zee | oorlogsschepen per klasse, vliegdekschepen, onderzeeboten, boten, koopvaardijschepen |
| Wapens | missiles, raketten, bommen, torpedo's, flares en chaff |
| Markeringen | rook-, flits- en brandgranaten, geplante bommen, vlaggen, spawns, routepunten |

## Hoe de figuren gemaakt worden {#how-the-figures-are-made}

- **Gebouwd uit gepubliceerde afmetingen.** De meeste figuren worden door de eigen figuurbouwer van de viewer gemaakt uit openbare getallen: lengte, breedte, hoogte, wielen, toren en kanon, vleugels en staart. Hun vorm wordt daarna afgesteld op openbare foto's, tekeningen en gepubliceerde afmetingen. Er worden geen modellen van enig spel gebruikt.
- **Vrije modellen.** Een paar figuren gebruiken vrije 3D-modellen (CC0 of CC BY) waar die waarheidsgetrouwer zijn, soms gecombineerd met de gebouwde romp. Auteurs van CC BY-werken worden genoemd op [Figuurcredits](figure-credits.md); CC0-werken vragen geen naamsvermelding en staan daar niet.
- Elke figuur heeft een volledige, een grove en een verre versie (detailniveaus, LOD), zodat er duizenden tegelijk getekend kunnen worden.

## Welke figuur een eenheid krijgt {#which-figure-a-unit-gets}

De viewer kijkt naar de eigen kolommen van de data:

1. **Namen** - kolommen die *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* of *Figure* heten - worden vergeleken met de catalogus: exact, via ongeveer 4.000 aliassen (eenheids-id's van verschillende spellen), op het langste bekende begin (`F-16C_50` is de F-16C), of op de kortste figuurnaam die ermee begint.
2. Een naam waarvan de figuur niet bij het **type** van de eenheid past wordt niet gebruikt (een vrachtwagen met de naam *Typhoon* is niet de jager).
3. **Typen** - kolommen die *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* of *Domain* heten - geven een klassenfiguur: Tacview-tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kaartpictogrammen, of gewone woorden (tank, helicopter, infanterie).
4. Data met geen van beide is data van mensen: iedereen is een soldaat.

De makkelijkste manier om de juiste figuren te krijgen is dus een kolom `vehicle` met de echte namen, of een kolom `type` met Tacview-tags.

**Mijn eenheid wordt als blok of soldaat getoond.** Voeg een kolom `vehicle` toe met de echte naam, of een kolom `type` met een Tacview-tag. Wijs de eenheid aan om te zien welke naam gevonden is. Data die zulke kolommen heeft maar niets over een eenheid zegt laat haar een blok; data met geen van beide wordt als soldaten getekend.

## Instellingen {#settings}

Het gedeelte **Figuren** van de zijbalk van de replay stelt de grootte in, de kleinste grootte op het scherm, wat verre eenheden worden (figuur, pijl, symbool), en de effecten die erop getekend worden. Zie [Wedstrijdreplay](match-replay.md#figures). Rook, vuur en andere getimede effecten: [Figuren in de figurenoverlay](figure-replay.md).

## Een optioneel lokaal figuurpakket {#an-optional-local-figure-pack}

Je kunt op je eigen computer een optioneel pakket met eigen figuren bewaren. Zijn figuren nemen de plaats in van catalogusfiguren met dezelfde namen. Het maakt nooit deel uit van de repository of van een gepubliceerde build; zonder pakket verandert er niets.
