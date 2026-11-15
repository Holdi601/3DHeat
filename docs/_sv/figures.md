---
title: "Figurer"
parent: "Repris"
nav_order: 3
has_children: true
lang: "sv"
source: "figures.md"
source_hash: "e86483d60237"
translated: true
outdated: false
---

# Figurer

En **figur** är en liten 3D-modell av vad en enhet verkligen är: en stridsvagn, ett jetplan, ett fartyg eller en soldat. [Repriserna](match-replay.md) ritar varje enhet som sin figur i verklig storlek, i stället för som en vanlig låda.

Det finns ungefär 2 000 namngivna fordon, flygplan, fartyg, vapen och soldater. Alla är byggda av visaren själv.

![Stridsvagnar i demot, ritade som sina egna figurer](../assets/img/sv/replay-tanks.webp)

## Vad som finns i katalogen {#what-is-in-the-catalogue}

| Domän | Exempel |
|---|---|
| Personer | soldat stående, knästående, liggande; krypskytt, pansarvärn, sjukvårdare, besättning |
| Mark | stridsvagnar, stridsfordon för infanteri, luftvärn, artilleri, lastbilar och bilar, tåg och spårvagnar |
| Luft | jaktplan, attackplan, bombplan, transportplan och helikoptrar, från dubbeldäckare till moderna jetplan |
| Sjö | krigsfartyg efter klass, hangarfartyg, ubåtar, båtar och handelsfartyg |
| Vapen | robotar, raketer, bomber, torpeder, facklor och chaff |
| Markörer | rök-, blixt- och brandgranater, placerade bomber, flaggor, startpunkter och vägpunkter |

## Så görs figurerna {#how-the-figures-are-made}

- **Byggda från publicerade mått.** De flesta figurer görs av visarens egna figurbyggare utifrån offentliga siffror: längd, bredd, höjd, bantalar, torn och kanon, vingar och stjärt. Formen justeras sedan mot offentliga fotografier, ritningar och publicerade mått. Inga spels modeller används.
- **Fria modeller.** Några figurer använder fria 3D-modeller (CC0 eller CC BY) där de är sannare, ibland kombinerade med det byggda skrovet. Upphovsmän till CC BY-verk krediteras på [Figurkrediter](figure-credits.md). CC0-verk kräver ingen kredit och listas inte där.
- Varje figur har en full, en grov och en långt bort-version (detaljnivåer, LOD), så att tusentals kan ritas samtidigt.

## Vilken figur en enhet får {#which-figure-a-unit-gets}

Visaren tittar på datans egna kolumner:

1. **Namn**: kolumner som heter *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eller *Figure* jämförs med katalogen. Det sker exakt, via omkring 4 000 alias (spelens enhets-id för flera spel), på den längsta kända början (`F-16C_50` är F-16C), eller på det kortaste figurnamnet som börjar med det.
2. Ett namn vars figur inte passar enhetens **typ** används inte. En lastbil som heter *Typhoon* är inte jaktplanet.
3. **Typer**: kolumner som heter *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eller *Domain* ger en klassfigur. Det kan vara Tacview-taggar (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kartikoner eller vanliga ord (tank, helikopter, infanteri).
4. Data med varken det ena eller det andra är data om personer. Alla är då soldater.

Det enklaste sättet att få rätt figurer är därför en `vehicle`-kolumn med de riktiga namnen, eller en `type`-kolumn med Tacview-taggar.

**Min enhet visas som en låda eller en soldat.** Lägg till en `vehicle`-kolumn med det riktiga namnet, eller en `type`-kolumn med en Tacview-tagg. För musen över enheten för att se vilket namn som matchades. Data som har sådana kolumner men inget om en enhet lämnar den som en låda. Data utan någon av dem ritas som soldater.

## Inställningar {#settings}

Avsnittet **Figurer** i repriserans sidofält styr storleken, den minsta storleken på skärmen och vad fjärran enheter blir (figur, pil eller symbol). Det styr också effekterna som ritas på dem. Se [Matchrepris](match-replay.md#figures). Rök, eld och andra tidsatta effekter: [Figurer i figuröverlägget](figure-replay.md).

## Ett valfritt lokalt figurpaket {#an-optional-local-figure-pack}

Du kan behålla ett valfritt paket med egna figurer på din egen dator. Dess figurer tar platsen för katalogfigurer med samma namn. Paketet är aldrig en del av förvaret eller en publicerad version. Utan ett paket ändras ingenting.
