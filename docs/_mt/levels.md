---
title: "Livelli u ġeometrija tal-isfond"
nav_order: 16
has_children: true
lang: "mt"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Livelli u ġeometrija tal-isfond

Livell hu l-post 3D fejn ġara l-logħba - mappa, belt, pista. Poġġih wara d-data tiegħek u tista' tara *fejn* hi s-sħana. Il-pannell **Sfond / livell** (ara [Glossarju](glossary.md) għal "livell") jagħtik tliet tipi ta' kuntest:

- **immaġini tal-mappa**, b'referenza ġeografika permezz ta' żewġ ankri - ara [Immaġini tal-mappa](map-images.md);
- **livell 3D** - `.glb`, `.gltf`, `.obj`, `.stl` jew `.ply` - maqsum f'art, strutturi u ilma u mnaqqas meta jitniżżel - ara [Livelli 3D](model-levels.md) u [Dehra tal-livell](level-appearance.md).
- **isfond tad-dinja** - għal reġistrazzjoni li tgħid fejn hi fuq l-art (fajl ACMI ta' Tacview), it-terren reali, it-toroq, l-ilma, l-ajruporti u l-bini, imniżżla minn data miftuħa - ara [Isfond tad-dinja](world-backdrop.md).

Meta ma jkun imgħabba xejn, ix-xena tkun iswed b'grilja u assi kkulurati (**Grilja** u **Assi** f'[Kamera u xena](camera.md)), u l-pannell jgħid *Ma hemm xejn imgħabba - ix-xena turi grilja u assi. Żid immaġini tal-mappa jew mesh ta' livell biex tagħti kuntest lis-sħana.*

Il-livell hu komuni għat-tliet tabs: kors imgħobbi fit-tab Analiżi tat-tellieqa huwa l-istess livell li turi l-mappa tas-sħana.

![Il-pannell Sfond / livell b'livell mgħobbi: buttuni Immaġini tal-mappa u Mudell 3D, Teatru, Opaċità, Luminożità, Issejvja fil-librerija u l-lista tal-Librerija](../assets/img/en/level-panel.webp)

## Poġġi livell wara d-data tiegħek {#put-a-level-behind-your-data}

1. Ittella' d-data tiegħek l-ewwel ([Kif tidħol id-data](getting-data-in.md)), sabiex il-livell jitqiegħed fuqha.
2. Iftaħ **Sfond / livell** fis-sidebar.
3. Agħfas **Immaġini tal-mappa…** għal ritratt jew **Mudell 3D…** għal livell 3D, u agħżel il-fajl. Għal reġistrazzjoni tad-dinja reali, uża **Isfond tad-dinja** jew **Teatru** minflok.
4. Stenna sakemm il-linja tal-progress tlesti. Mudell kbir jiġi mnaqqas l-ewwel (ara **Mira tas-simplifikazzjoni** hawn taħt).
5. Agħfas **F** fil-veduta biex tiffrena kollox. Uża **Opaċità** u **Luminożità** sakemm is-sħana toħroġ 'il barra mill-livell.
6. Agħfas **Issejvja fil-librerija** jekk se tuża l-livell aktar tard ([Librerija tal-livelli](level-library.md)).

## X'jagħmel livell għas-sħana {#what-a-level-does-for-the-heat}

- Huwa **jokkludi**: punti tad-data wara xi ħaġa jiġu mdawla skont il-wiċċ, u punti wara l-art jinħbew ([Fond u culling](depth-and-culling.md)). Mingħajr livell, ma hemm l-ebda okklużjoni.
- Huwa **maqtugħ** mill-[Qatgħa](slice.md) u, bi *Aqta' wkoll il-livell*, mill-[qtugħ tad-distanza](depth-and-culling.md#distance-culling), flimkien mas-sħana.
- Huwa l-unika ħaġa li [id-dettall tal-fond](camera.md#depth-of-field) jħammeġ, minbarra l-grilja u l-kaxxi.
- Livell 3D **iwessa' il-pjan tal-bogħod tal-kamera** meta jkun akbar mid-data: il-qrib u l-bogħod jiġu kkalibrati mid-dataset, u mappa esportata li tkejjel diversi kilometri kieku titpoġġa kollha wara l-pjan tal-bogħod u tħalli veduta vojta. Il-pjan tal-bogħod isir 3 × l-estensjoni orizzontali tal-livell meta din tkun akbar, il-pjan tal-qrib jimxi magħha (mill-inqas bogħod / 100,000) biex jinżamm il-preċiżjoni tal-fond li fuqha tiddependi l-okklużjoni, u l-veloċità tat-titjir titla' għal mill-inqas estensjoni / 12. Dan jiġi mwessa' biss, qatt mhux imnaqqas.

## Il-pannell, minn fuq għal isfel {#the-panel-top-to-bottom}

| Parti | Dettalji |
|---|---|
| **Immaġini tal-mappa…**, **Mudell 3D…** | Tella' wieħed; jieħu post il-livell attwali. |
| **Isfond tad-dinja**, **Insa l-madum tal-mappa** | Biss għal dataset b'referenza ġeografika: jibni l-post reali taħtha bħala livell, jew ineħħi l-madum imniżżel. [Isfond tad-dinja](world-backdrop.md) |
| **Mira tas-simplifikazzjoni** | Il-baġit tat-trijangoli għall-importazzjoni li jmiss tal-mudell: *Sħiħ - l-ebda simplifikazzjoni* (bażi), *Għoli - 8M*, *Medju - 3M*, *Baxx - 800k*, *Silwett - 100k*. [Livelli 3D](model-levels.md#simplification) |
| Progress u **Ikkanċella** | Waqt id-dekodifikazzjoni jew l-importazzjoni. |
| Nota tal-importazzjoni | Trijangoli qabel u wara, il-qsim tal-art / strutturi / ilma, il-livell tad-dettall użat. |
| Isem u daqs | `wisa'×għoli px · x × z m/px` għal immaġini, `N trijangoli (minn M)` għal mudell. |
| **Opaċità**, **Luminożità** | It-tnejn it-tipi. |
| Kontrolli tal-immaġini | **Neħħi s-saturazzjoni**, **Aqleb tramuntana/nofsinhar**, **Pożizzjonament** (żewġ ankri), **Waqqaf mal-limiti tad-dejta**, **Elevazzjoni**. [Immaġini tal-mappa](map-images.md) |
| Kontrolli tal-mudell | Relief tal-art, ilma, trijangoli tal-art, wireframe, tekstura, kulur miġbur, strutturi, klassifikazzjoni tal-partijiet. [Dehra tal-livell](level-appearance.md) |
| **Issejvja fil-librerija**, **Neħħi** | [Librerija tal-livelli](level-library.md); Neħħi jtenni l-livell. |
| **Librerija** | Livelli miżmuma f'dan il-browser. [Librerija tal-livelli](level-library.md) |

## Paġni f'din it-taqsima {#pages-in-this-section}

- [Immaġini tal-mappa](map-images.md)
- [Livelli 3D](model-levels.md) - formati, partijiet, klassifikazzjoni, simplifikazzjoni, teksturi
- [Dehra tal-livell](level-appearance.md) - kull kontroll għal livell 3D
- [Librerija tal-livelli](level-library.md)
- [Isfond tad-dinja](world-backdrop.md) - id-dinja reali taħt reġistrazzjoni, minn data miftuħa

Kif tikseb livelli minn logħob u engines hi l-kwistjoni tal-għodod separati tal-esportazzjoni (ara l-[README](https://github.com/Holdi601/3DHeat/blob/main/README.md) tar-repożitorju); il-kuntratt li jikteb fih huwa miġbur f'[Livelli 3D](model-levels.md#the-exporter-contract).
