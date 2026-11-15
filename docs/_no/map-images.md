---
title: "Kartbilder"
parent: "Baner og bakgrunnsgeometri"
nav_order: 1
lang: "no"
source: "map-images.md"
source_hash: "d56614ef6bd1"
translated: true
outdated: false
---

# Kartbilder

Et kartbilde er et flatt bilde – et minikart, et satellittfoto, en planskisse – lagt under dataene dine, slik at du kan se hvor varmen ligger. Du forteller visningen hvor bildet hører hjemme ved å feste to punkter på det til to steder i verden (ankerpunktene).

## Last inn og plasser et kartbilde {#load-and-place-a-map-image}

1. Last inn dataene dine først ([Få inn data](getting-data-in.md)).
2. Under **Bakgrunn / nivå**, trykk **Kartbilde…** og velg bildet. Det strekkes ut over dataenes område.
3. Trykk **Tilpass til datagrensene** hvis bildet er flyttet. Anker 1 går til bildets øvre venstre hjørne, anker 2 til nedre høyre hjørne, ved dataenes kanter.
4. Hvis varmen ikke stemmer med bildet, velg to landemerker som ligger langt fra hverandre (for eksempel to motsatte hjørner av en bygning eller to veikryss). Les av pikselen for hvert av dem på bildet, og posisjonen i verden (hold musepekeren over med [linjalen](measure.md) for å lese **X** og **Z**).
5. Skriv dem inn under **Plassering**: for **Anker 1** landemerkets **px**, **py**, **verden X**, **verden Z**; det samme for **Anker 2**.
6. Sjekk: et spor eller et varmepunkt du vet ligger på en vei, skal nå ligge på den veien. Juster tallene til det stemmer.

![Seksjonen Plassering med to ankre og varme tegnet over et kartbilde](../assets/img/en/map-images-placement.webp)

De to landemerkene må være ulike både i pikselkolonne og pikselrad, ellers sier panelet *De to ankrene deler en pikselrad eller kolonne*.

## Innlasting {#loading}

Ethvert bildeformat nettleseren kan dekode. Et bilde der den lengste kanten er over **8192 px**, blir nedskalert til 8192 (den største kanten GPU-en blir bedt om å holde), og panelet sier *Nedskalert fra W×H til w×h*.

Ved innlasting blir bildet strukket over datasettets X-Z-grenser (eller ±1000 enheter uten datasett), nord opp, på datasettets laveste Y. Standardverdiene er **Opasitet** 100 %, **Lysstyrke** 0,7, **Avmett** 100 %, **Speilvend nord/sør** på: avmettet og nedtonet, fordi bakgrunnens jobb er å la deg finne et varmepunkt, ikke å konkurrere med det.

## Kontroller {#controls}

| Kontroll | Standard | Område | Betydning |
|---|---|---|---|
| **Opasitet** | 100 % | 0–100 % | |
| **Lysstyrke** | 0,7 | 0–2 (jog 64) | |
| **Avmett** | 100 % | 0–100 % | Grå bakgrunn, mettet varme. Farge i kartet konkurrerer med farge i dataene. |
| **Speilvend nord/sør** | på | | Hvilken bilderad som er verdenens maksimale Z. Når du slår den av eller på med et datasett lastet, tilpasses ankrene også på nytt til datagrensene. |
| **Plassering**: Anker 1, Anker 2 | bildets hjørner på datagrensene | | Hvert anker er en piksel på bildet – **px** (fra venstre, 0 til bredden) og **py** (ovenfra, 0 til høyden) – og verdenskoordinaten det sitter på, **verden X** og **verden Z**. Skala og forskyvning følger av paret. |
| **Tilpass til datagrensene** | | | Setter anker 1 på bildets øvre venstre hjørne og anker 2 på nedre høyre, ved dataenes X-Z-grenser. Et utgangspunkt for nøyaktig plassering. Krever et datasett. |
| **Høyde** | datasettets laveste Y | data min Y - 500 til maks Y + 500 (jog maks Y + 100 000) | Høyden på kartplanet. Legg det rett under dataene, slik at ingenting skjules av det. |

Navnelinjen viser `bredde×høyde px · x × z m/px`, verdensstørrelsen til én piksel langs hver akse.

## I scenen {#in-the-scene}

Bildet er ett enkelt teksturert firkantet felt på høyden. Med full opasitet skriver det dybde, så det deltar i [okklusjon](depth-and-culling.md) som bakke; under 100 % opasitet blir det blandet og skriver ingen dybde, så det okkluderer ingenting. [Linjalen](measure.md) måler på planet. [Nivåbiblioteket](level-library.md) lagrer et bildenivå med ankrene sine.

## Dota 2 map {#dota-2-map}

**Dota 2 map** ved siden av **Kartbilde…** henter tegningen av det gjeldende Dota 2-kartet som [OpenDota](https://www.opendota.com) viser på sine kampsider, og plasserer den under tabeller som [Watcher](https://github.com/Holdi601/3DHeat-Watcher) skriver fra Dota 2-replayer ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Bildet hentes fra opendota.com når knappen trykkes, og er ikke en del av 3DHeat; den nyeste patchens tegning tas fra OpenDotas egen liste, og 7.40-tegningen når listen ikke kan leses.

| | |
|---|---|
| Kilde | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Plassering | OpenDotas kalibrering: bildet spenner over Dota-verdenenheter -8192 til 8064 på begge akser (128-enhetsceller 64 til 191), nord øverst. Med replay-tabellens akser (Z opp, Y snudd) er det verden X -8192 til 8064 og verden Z -8064 til 8192. Omtrent 18 enheter per piksel. |
| Høyde | 0. Helter står på 0 til omtrent 600. |
| Utseende | Lysstyrke 0,8, avmett 50 %. |

Kontrollert på en offentlig kamps replay av patch 7.40: hvert helts spor følger de tegnede banene, og tårnene, kasernene og de gamle som replayet plasserer, faller på de tegnede basene. Visningen **Ovenfra** viser kartet med nord nederst på skjermen, slik den viser enhver Z-opp-tabell med Y snudd.

Tegningen er OpenDotas, av Valves kart; Valve støtter ikke 3DHeat. Et 3D-kart av Dota krever at spillet er installert: se Watchers notater om Dota 2-replayer.

## For utviklere {#for-developers}

### Hvordan ankrene plasserer bildet {#how-the-anchors-place-the-image}

Fra [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), med ankrene *a* og *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

To ankre fastsetter både skala og forskyvning på hver akse uavhengig, så et kart kan strekkes ulikt på X og Z, men ikke roteres. Ankrene må være ulike i **begge** pikselkoordinatene; når de deler en rad eller kolonne, kan ingen skala utledes, kartet tegnes ikke, og panelet sier *De to ankrene deler en pikselrad eller kolonne*.
