---
title: "Baner og baggrundsgeometri"
nav_order: 13
has_children: true
lang: "da"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: true
---

# Baner og baggrundsgeometri

En bane er det 3D-sted, hvor spillet foregik – et kort, en by, en bane. Placerer du en bag dine data, kan du se *hvor* varmen er. Panelet **Baggrund / bane** (se [Ordliste](glossary.md) for "bane") giver dig tre slags sammenhæng:

- et **kortbillede**, georefereret med to ankre – se [Kortbilleder](map-images.md);
- en **3D-bane** – `.glb`, `.gltf`, `.obj`, `.stl` eller `.ply` – delt i jord, konstruktioner og vand og forenklet ved import – se [3D-baner](model-levels.md) og [Banens udseende](level-appearance.md);
- en **verdensbaggrund** – for en optagelse, der siger, hvor på jorden den er (en Tacview ACMI-fil): det rigtige terræn, veje, vand, flyvepladser og bygninger, hentet fra åbne data – se [Verdensbaggrund](world-backdrop.md).

Uden noget indlæst er scenen mørk med et gitter og farvede akser (**Gitter** og **Akser** i [Kamera og scene](camera.md)), og panelet siger *Intet indlæst - scenen viser et gitter og akser. Tilføj et kortbillede eller en banemodel for at give varmen sammenhæng.*

Banen deles af alle tre faner: en bane, der er indlæst i fanen Løbsanalyse, er den samme bane, som heatmappet viser.

![Panelet Baggrund / bane med en bane indlæst: knapperne Kortbillede og 3D-model, Krigsskueplads, Opacitet, Lysstyrke, Gem i biblioteket og listen Bibliotek](../assets/img/da/level-panel.webp)

## Læg en bane bag dine data {#put-a-level-behind-your-data}

1. Indlæs først dine data ([Indlæs data](getting-data-in.md)), så banen tilpasses dem.
2. Åbn **Baggrund / bane** i sidebjælken.
3. Tryk på **Kortbillede …** for et billede eller **3D-model …** for en 3D-bane, og vælg filen. Til en optagelse fra den virkelige verden bruges i stedet **Virkelig verden som baggrund** eller **Krigsskueplads**.
4. Vent, til fremskridtslinjen er færdig. En stor model forenkles først (se **Forenklingsmål** nedenfor).
5. Tryk på **F** i visningen for at indramme alt. Brug **Opacitet** og **Lysstyrke**, indtil varmen træder frem fra banen.
6. Tryk på **Gem i biblioteket**, hvis du vil bruge banen igen ([Banebibliotek](level-library.md)).

## Hvad en bane gør for varmen {#what-a-level-does-for-the-heat}

- Den **skjuler**: datapunkter bag den dæmpes pr. flade, og datapunkter bag terrænet skjules ([Dybde og culling](depth-and-culling.md)). Uden en bane er der ingen skjulning.
- Den **skæres** af [Snittet](slice.md) og, med *Skær også banen*, af [afstandsudsnittet](depth-and-culling.md#distance-culling), sammen med varmen.
- Den er det eneste, [skærpedybden](camera.md#depth-of-field) slører, ud over gitteret og boksene.
- En 3D-bane **udvider kameraets fjerneste plan**, når den er større end dataene: nær- og fjernplan kalibreres ud fra datasættet, og et eksporteret kort flere kilometer på tværs ville ellers ligge helt bag det fjerne plan og efterlade en tom visning. Det fjerne plan bliver 3 × banens vandrette udstrækning, når det er større, nærplanet flytter sig med det (mindst fjern / 100.000) for at bevare den dybdepræcision, skjulningen afhænger af, og flyvefarten hæves til mindst udstrækning / 12. Den udvides kun, aldrig indsnævres.

## Panelet, top til bund {#the-panel-top-to-bottom}

| Del | Detaljer |
|---|---|
| **Kortbillede …**, **3D-model …** | Indlæs én; den erstatter den aktuelle bane. |
| **Virkelig verden som baggrund**, **Glem kortfliser** | Kun for et datasæt med geografisk reference: byg det rigtige sted under det som bane, eller slet de hentede fliser. [Verdensbaggrund](world-backdrop.md) |
| **Forenklingsmål** | Trekantbudgettet for næste modelimport: *Fuld - ingen forenkling* (standard), *Høj - 8 mio.*, *Mellem - 3 mio.*, *Lav - 800 k*, *Silhuet - 100 k*. [3D-baner](model-levels.md#simplification) |
| Fremskridt og **Annullér** | Mens der afkodes eller importeres. |
| Importnote | Trekanter før og efter, delingen i jord / konstruktioner / vand, detaljeniveauet der bruges. |
| Navn og størrelse | `bredde×højde px · x × z m/px` for et billede, `N trekanter (ud af M)` for en model. |
| **Opacitet**, **Lysstyrke** | Begge slags. |
| Billedstyring | **Afmæt**, **Vend nord/syd**, **Placering** (to ankre), **Tilpas til dataenes grænser**, **Højde**. [Kortbilleder](map-images.md) |
| Modelstyring | Jordrelief, vand, jordtrekanter, trådramme, tekstur, indfanget farve, konstruktioner, delklassificering. [Banens udseende](level-appearance.md) |
| **Gem i biblioteket**, **Fjern** | [Banebibliotek](level-library.md); Fjern tager banen ud. |
| **Bibliotek** | Baner gemt i denne browser. [Banebibliotek](level-library.md) |

## Sider i dette afsnit {#pages-in-this-section}

- [Kortbilleder](map-images.md)
- [3D-baner](model-levels.md) – formater, dele, klassificering, forenkling, teksturer
- [Banens udseende](level-appearance.md) – hver styring for en 3D-bane
- [Banebibliotek](level-library.md)
- [Verdensbaggrund](world-backdrop.md) – den rigtige verden under en optagelse, fra åbne data

Hvordan man får baner ud af spil og motorer, er de separate eksporterværktøjers arbejde (se repositoriets [README](https://github.com/Holdi601/3DHeat/blob/main/README.md)); den kontrakt, de skriver til, er opsummeret i [3D-baner](model-levels.md#the-exporter-contract).
