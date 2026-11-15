---
title: "Figurer"
nav_order: 11
has_children: true
lang: "da"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figurer

En **figur** er en lille 3D-model af det, en enhed rigtigt er: en stridsvogn, et jetfly, et skib, en soldat. [Replayet](match-replay.md) tegner hver enhed som sin figur i rigtig størrelse i stedet for en almindelig boks.

Der er omkring 2.000 navngivne køretøjer, fly, skibe, våben og soldater, som alle er bygget af vieweren selv.

![Stridsvogne fra demoen tegnet som deres egne figurer](../assets/img/en/replay-tanks.webp)

## Hvad der er i kataloget {#what-is-in-the-catalogue}

| Område | Eksempler |
|---|---|
| Personer | soldat stående, knæstående, liggende; snigskytte, panserværnssoldat, medic, besætning |
| Land | stridsvogne, infanterikampkøretøjer, luftværn, artilleri, lastbiler og biler, tog og sporvogne |
| Luft | jagerfly, angrebsfly, bombefly, transportfly, helikoptere, fra dobbeltdækkere til moderne jetfly |
| Hav | krigsskibe efter klasse, hangarskibe, ubåde, både, handelsskibe |
| Våben | missiler, raketter, bomber, torpedoer, flares og chaff |
| Markører | røg-, blænd- og brandgranater, placerede bomber, flag, spawns, waypoints |

## Sådan laves figurerne {#how-the-figures-are-made}

- **Bygget ud fra offentliggjorte mål.** De fleste figurer laves af vieweren egen figurbygger ud fra offentlige tal: længde, bredde, højde, vejhjul, tårn og kanon, vinger og hale. Deres form tunes derefter mod offentlige fotografier, tegninger og offentliggjorte mål. Ingen spils modeller bruges.
- **Gratis modeller.** Nogle få figurer bruger gratis 3D-modeller (CC0 eller CC BY), hvor de er mere sande, nogle gange kombineret med det byggede skrog. Ophavsmænd til CC BY-værker krediteres på [Figurkreditter](figure-credits.md); CC0-værker kræver ingen kreditering og står ikke der.
- Hver figur har en fuld, en grov og en fjern version (detaljeniveauer, LOD), så tusindvis kan tegnes på én gang.

## Hvilken figur en enhed får {#which-figure-a-unit-gets}

Vieweren kigger på dataenes egne kolonner:

1. **Navne** – kolonner ved navn *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eller *Figure* – matches mod kataloget: præcist, gennem omkring 4.000 aliasser (enheds-id'er fra flere spil), ved det længste kendte begyndelse (`F-16C_50` er F-16C), eller ved det korteste figurnavn, der begynder med det.
2. Et navn, hvis figur ikke passer til enhedens **type**, bruges ikke (en lastbil ved navn *Typhoon* er ikke jagerflyet).
3. **Typer** – kolonner ved navn *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eller *Domain* – giver en klassefigur: Tacview-tags (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kortikoner eller almindelige ord (tank, helikopter, infanteri).
4. Data med ingen af dem er data om personer: alle er soldater.

Den nemmeste måde at få de rigtige figurer på er derfor en `vehicle`-kolonne med de rigtige navne, eller en `type`-kolonne med Tacview-tags.

**Min enhed vises som en boks eller en soldat.** Tilføj en `vehicle`-kolonne med det rigtige navn, eller en `type`-kolonne med et Tacview-tag. Hold musen over enheden for at se, hvilket navn der blev matchet. Data, der har sådanne kolonner, men intet siger om en enhed, lader den være en boks; data uden nogen af dem tegnes som soldater.

## Indstillinger {#settings}

Afsnittet **Figurer** i replayets sidebjælke sætter størrelsen, den mindste størrelse på skærmen, hvad fjerntliggende enheder bliver til (figur, pil, symbol), og effekterne tegnet på dem. Se [Kamp-replay](match-replay.md#figures). Røg, ild og andre tidsbestemte effekter: [Figurer i figuroverlejringen](figure-replay.md).

## En valgfri lokal figurpakke {#an-optional-local-figure-pack}

Du kan have en valgfri pakke med egne figurer på din egen maskine. Dens figurer træder i stedet for kataloget-figurer med samme navne. Den er aldrig en del af repositoriet eller en udgivet build; uden en pakke ændres intet.
