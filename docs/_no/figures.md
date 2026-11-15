---
title: "Figurer"
nav_order: 11
has_children: true
lang: "no"
source: "figures.md"
source_hash: "a2353c6a73bc"
translated: true
outdated: false
---

# Figurer

En **figur** er en liten 3D-modell av det en enhet egentlig er: en stridsvogn, et jetfly, et skip, en soldat. [Replayet](match-replay.md) tegner hver enhet som sin figur i reell størrelse, i stedet for en vanlig boks.

Det finnes rundt 2 000 navngitte kjøretøy, fly, skip, våpen og soldater, alle bygget av visningsprogrammet selv.

![Stridsvognene i demoen tegnet som egne figurer](../assets/img/en/replay-tanks.webp)

## Hva som finnes i katalogen {#what-is-in-the-catalogue}

| Område | Eksempler |
|---|---|
| Personer | soldat stående, kneende og liggende; snikskytter, panservernsoldat, sanitet, mannskap |
| Bakke | stridsvogner, infanterikjøretøy, luftvern, artilleri, lastebiler og biler, tog og trikker |
| Luft | jagerfly, angrepsfly, bombefly, transportfly, helikoptre, fra dobbeldekkere til moderne jetfly |
| Sjø | krigsskip etter klasse, hangarskip, ubåter, båter, handelsskip |
| Våpen | missiler, raketter, bomber, torpedoer, fakler og chaff |
| Markører | røyk-, blink- og branngranater, plasserte bomber, flagg, spawn-punkter, veipunkter |

## Slik lages figurene {#how-the-figures-are-made}

- **Bygget etter publiserte mål.** De fleste figurene lages av visningsprogrammets egen figurbygger fra offentlige tall: lengde, bredde, høyde, veihjul, tårn og kanon, vinger og hale. Formen justeres deretter mot offentlige fotografier, tegninger og publiserte mål. Ingen spills modeller brukes.
- **Frie modeller.** Noen få figurer bruker frie 3D-modeller (CC0 eller CC BY) der de er mer sannferdige, noen ganger kombinert med det bygde skroget. Opphavsmenn til CC BY-verk krediteres på [Kreditering av figurer](figure-credits.md); CC0-verk trenger ingen kreditering og listes ikke der.
- Hver figur har en full, en grov og en fjern versjon (detaljnivåer, LOD), slik at tusenvis kan tegnes samtidig.

## Hvilken figur en enhet får {#which-figure-a-unit-gets}

Visningen ser på dataenes egne kolonner:

1. **Navn** – kolonner som heter *Name*, *Vehicle*, *Unit*, *Unit type*, *Model*, *Aircraft*, *Plane*, *Tank*, *Ship*, *Craft*, *Loadout*, *Kit* eller *Figure* – sammenlignes med katalogen: nøyaktig, gjennom omtrent 4 000 alias (spillenes egne enhets-id-er for flere spill), med den lengste kjente begynnelsen (`F-16C_50` er F-16C), eller med det korteste figurnavnet som begynner med det.
2. Et navn hvis figur ikke passer til enhetens **type**, brukes ikke (en lastebil som heter *Typhoon* er ikke jagerflyet).
3. **Typer** – kolonner som heter *Type*, *Class*, *Kind*, *Category*, *Icon*, *Role* eller *Domain* – gir en klassefigur: Tacview-merker (`Air+FixedWing`, `Ground+Heavy+Armor+Vehicle+Tank`, `Sea+Watercraft+Warship`, `Weapon+Missile`), kartikoner, eller vanlige ord (tank, helikopter, infanteri).
4. Data uten noen av dem er data om personer: alle er soldater.

Den enkleste måten å få de riktige figurene på er derfor en `vehicle`-kolonne med de virkelige navnene, eller en `type`-kolonne med Tacview-merker.

**Min enhet vises som en boks eller en soldat.** Legg til en `vehicle`-kolonne med det virkelige navnet, eller en `type`-kolonne med et Tacview-merke. Hold musepekeren over enheten for å se hvilket navn som ble funnet. Data som har slike kolonner, men ikke sier noe om en enhet, lar den bli en boks; data uten noen av dem tegnes som soldater.

## Innstillinger {#settings}

Seksjonen **Figurer** i replayets sidepanel setter størrelsen, minste størrelse på skjermen, hva enheter langt unna blir (figur, pil, symbol), og effektene som tegnes på dem. Se [Kampreplay](match-replay.md#figures). Røyk, brann og andre tidsstyrte effekter: [Figurer i figuroverlegget](figure-replay.md).

## En valgfri lokal figurpakke {#an-optional-local-figure-pack}

Du kan beholde en valgfri pakke med egne figurer på din egen maskin. Figurene deres tar plassen til katalogfigurer med samme navn. Den er aldri en del av repositoriet eller en publisert utgave; uten en skjer ingenting.
