---
title: "Kortbilleder"
parent: "Baner og baggrundsgeometri"
nav_order: 1
lang: "da"
source: "map-images.md"
source_hash: "f0bbaa4b019e"
translated: true
outdated: false
---

# Kortbilleder

Et kortbillede er et fladt billede - et minikort, et satellitfoto, en plantegning - lagt under dine data, så du kan se, hvor varmen sidder. Du fortæller viseren, hvor billedet hører hjemme, ved at fastgøre to punkter på det til to steder i verden ("ankrene").

## Indlæs og placer et kortbillede {#load-and-place-a-map-image}

1. Indlæs dine data først ([Hent data ind](getting-data-in.md)).
2. Under **Baggrund / bane** trykker du på **Kortbillede …** og vælger billedet. Det strækkes over dataenes område.
3. Tryk på **Tilpas til dataenes grænser**, hvis billedet er blevet flyttet. Anker 1 går til billedets øverste venstre hjørne, anker 2 til dets nederste højre hjørne, ved dataenes kanter.
4. Hvis varmen ikke flugter med billedet, så vælg to kendetegn, der ligger langt fra hinanden (for eksempel to modsatte hjørner af en bygning eller to vejkryds). Læs hvert enkelt punkts pixel på billedet og dets position i verden (hold musen over med [linealen](measure.md) for at læse **X** og **Z**).
5. Skriv dem ind under **Placering**: for **Anker 1** kendetegnets **px**, **py**, **verden X**, **verden Z**; det samme for **Anker 2**.
6. Kontrollér: et spor eller et hotspot, du ved ligger på en vej, bør nu ligge på den vej. Justér tallene, til det gør.

![Afsnittet Placering med to ankre og varme tegnet på et kortbillede](../assets/img/en/map-images-placement.webp)

De to kendetegn skal være forskellige i både pixelkolonner og pixelrækker, ellers siger panelet *De to ankre deler en pixelrække eller -kolonne*.

## Indlæsning {#loading}

Ethvert billedformat browseren kan afkode. Et billede, hvis længste side er over **8192 px**, nedskaleres til 8192 (den største kant GPU'en bedes holde), og panelet siger *Nedskaleret fra W×H til w×h*.

Ved indlæsning strækkes billedet over datasættets X-Z-grænser (eller ±1000 enheder uden datasæt), nord op, ved datasættets laveste Y. Standardværdierne er **Opacitet** 100 %, **Lysstyrke** 0,7, **Afmæt** 100 %, **Vend nord/syd** til: afmættet og dæmpet, fordi baggrundens opgave er at lade dig finde et hotspot, ikke at konkurrere med det.

## Indstillinger {#controls}

| Indstilling | Standard | Interval | Betydning |
|---|---|---|---|
| **Opacitet** | 100 % | 0-100 % | |
| **Lysstyrke** | 0,7 | 0-2 (skyder 64) | |
| **Afmæt** | 100 % | 0-100 % | Grå baggrund, mættet varme. Farve i kortet konkurrerer med farve i dataene. |
| **Vend nord/syd** | til | | Hvilken billedrække der er verdens maksimale Z. Når den skiftes, mens et datasæt er indlæst, tilpasses ankrene også igen til dataenes grænser. |
| **Placering**: Anker 1, Anker 2 | billedets hjørner på dataenes grænser | | Hvert anker er en pixel på billedet - **px** (fra venstre, 0 til bredden) og **py** (fra oven, 0 til højden) - og den verdenskoordinat, det sidder på, **verden X** og **verden Z**. Skala og forskydning følger af parret. |
| **Tilpas til dataenes grænser** | | | Sætter anker 1 på billedets øverste venstre hjørne og anker 2 på dets nederste højre, ved dataenes X-Z-grænser. Et udgangspunkt for præcis placering. Kræver et datasæt. |
| **Højde** | datasættets laveste Y | data min. Y - 500 til maks. Y + 500 (skyder maks. Y + 100.000) | Højden af kortplanet. Sæt det lige under dataene, så intet skjules af det. |

Navnelinjen viser `bredde×højde px · x × z m/px`, verdens størrelse af én pixel langs hver akse.

## I scenen {#in-the-scene}

Billedet er en enkelt teksturfirkant i højden. Ved fuld opacitet skriver det dybde, så det deltager i [dækning](depth-and-culling.md) som jord; under 100 % opacitet blandes det og skriver ingen dybde, så det dækker intet. [Linealen](measure.md) måler på dets plan. [Banebiblioteket](level-library.md) gemmer et billedniveau med dets ankre.

## Dota 2-kortet {#dota-2-map}

**Dota 2-kort** ved siden af **Kortbillede …** henter tegningen af det aktuelle Dota 2-kort, som [OpenDota](https://www.opendota.com) viser på sine kampsider, og placerer den under tabeller, [Watcher](https://github.com/Holdi601/3DHeat-Watcher) skriver fra Dota 2-replays ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Billedet hentes fra opendota.com, når knappen trykkes, og er ikke en del af 3DHeat; den nyeste patchs tegning tages fra OpenDotas egen liste, og 7.40-tegningen, når listen ikke kan læses.

| | |
|---|---|
| Kilde | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Placering | OpenDotas kalibrering: billedet spænder over Dota-verdenenheder -8192 til 8064 på begge akser (128-enheds celler 64 til 191), nord øverst. Med replay-tabellens akser (Z op, Y vendt) er det verden X -8192 til 8064 og verden Z -8064 til 8192. Omkring 18 enheder pr. pixel. |
| Højde | 0. Helte står på 0 til omkring 600. |
| Udseende | Lysstyrke 0,8, afmæt 50 %. |

Kontrolleret på et offentligt kamp-replay fra patch 7.40: hver helts spor følger de tegnede baner, og tårnene, kasernerne og de gamle, som replayet placerer, falder på de tegnede baser. Visningen **Oppefra** viser kortet med nord nederst på skærmen, sådan som den viser enhver Z-op-tabel med Y vendt.

Tegningen er OpenDotas, af Valves kort; Valve godkender ikke 3DHeat.

### 3D-kortet {#the-3d-map}

Med Dota 2 installeret laver det separate værktøj [3DHeat Dota](https://holdi601.github.io/3DHeat-Ext-Dota/) (`heat3d-dota-maps level -o dota.glb`; Watchers kommando [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) kører det også) kortet i 3D ud fra spillets egne filer: terræn, klipper, vand, træer og bygninger, i replay-tabellernes enheder og akser. Indlæs filen én gang med **3D-model …**: vieweren kender den på dens dele (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` i `dotaMap.ts`), lægger den straks i [banebiblioteket](level-library.md), hvor den erstatter en ældre, og siger det. Derefter indlæser **Dota 2-kort** dette 3D-kort fra biblioteket i stedet for at hente tegningen; er der intet i biblioteket, henter den tegningen og fortæller, hvordan man laver 3D-kortet. Filen kommer fra din egen installation og bliver på din maskine.

## For udviklere {#for-developers}

### Hvordan ankrene placerer billedet {#how-the-anchors-place-the-image}

Fra [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), med ankrene *a* og *b*:

```
skalaX = (b.verdenX - a.verdenX) / (b.px - a.px)
skalaZ = (b.verdenZ - a.verdenZ) / (b.py - a.py)
pixel (0, 0) sidder ved  (a.verdenX - a.px × skalaX,  a.verdenZ - a.py × skalaZ)
```

To ankre fastlægger både skala og forskydning på hver akse uafhængigt, så et kort kan strækkes forskelligt på X og Z, men ikke roteres. Ankrene skal være forskellige i **begge** pixelkoordinater; deler de en række eller en kolonne, kan ingen skala udledes, kortet tegnes ikke, og panelet siger *De to ankre deler en pixelrække eller -kolonne*.
