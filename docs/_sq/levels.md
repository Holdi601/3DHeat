---
title: "Nivelet dhe gjeometria e sfondit"
nav_order: 16
has_children: true
lang: "sq"
source: "levels.md"
source_hash: "74400d9e7af4"
translated: true
outdated: false
---

# Nivelet dhe gjeometria e sfondit

Një nivel është vendi 3D ku u zhvillua loja - një hartë, një qytet, një pistë. Vendose pas të dhënave dhe mund të shohësh *ku* është nxehtësia. Paneli **Sfondi / niveli** (shih [Fjalorin](glossary.md) për "nivel") të jep tre lloje konteksti:

- një **imazh harte**, i referencuar gjeografikisht me dy pika kyçe - shih [Imazhet e hartave](map-images.md);
- një **nivel 3D** - `.glb`, `.gltf`, `.obj`, `.stl` ose `.ply` - i ndarë në tokë, struktura dhe ujë, dhe i thjeshtuar gjatë importit - shih [Nivelet 3D](model-levels.md) dhe [Pamja e nivelit](level-appearance.md);
- një **sfond botëror** - për një regjistrim që tregon ku ndodhet në tokë (një skedar Tacview ACMI), terrenin real, rrugët, ujin, aeroportet dhe ndërtesat, të shkarkuara nga të dhëna të hapura - shih [Sfondi botëror](world-backdrop.md).

Kur nuk ngarkohet asgjë, skena është e errët me një rrjetë dhe boshte me ngjyra (**Rrjeta** dhe **Boshtet** te [Kamera & skena](camera.md)), dhe paneli thotë *Asgjë e ngarkuar — skena shfaq një rrjetë dhe boshte. Shto një imazh harte ose një model 3D të nivelit për t'i dhënë kontekst nxehtësisë.*

Nivelin e ndajnë të tre skedat: një pistë e ngarkuar në skedën Analiza e garës është e njëjta nivel që shfaq Harta e nxehtësisë.

![Paneli Sfondi / niveli me një nivel të ngarkuar: butonat Imazh harte dhe Model 3D, Teatri i luftës, Opaciteti, Ndriçimi, Ruaj në bibliotekë dhe lista e Bibliotekës](../assets/img/en/level-panel.webp)

## Vëre një nivel pas të dhënave {#put-a-level-behind-your-data}

1. Ngarko fillimisht të dhënat ([Si të futni të dhënat](getting-data-in.md)), që niveli të përshtatet me to.
2. Hap **Sfondi / niveli** në shiritin anësor.
3. Shtyp **Imazh harte…** për një imazh ose **Model 3D…** për një nivel 3D, dhe zgjidh skedarin. Për një regjistrim të botës reale, përdor **Bota e vërtetë si sfond** ose **Teatri i luftës** në vend të tyre.
4. Prit që rreshti i progresit të mbarojë. Një model i madh thjeshtohet së pari (shih **Objektivi i thjeshtimit** më poshtë).
5. Shtyp **F** te pamja për të kornizuar gjithçka. Përdor **Opaciteti** dhe **Ndriçimi** derisa nxehtësia të dalë nga niveli.
6. Shtyp **Ruaj në bibliotekë** nëse do ta përdorësh përsëri nivelin ([Biblioteka e niveleve](level-library.md)).

## Çfarë bën një nivel për nxehtësinë {#what-a-level-does-for-the-heat}

- **Errëson**: pikat e të dhënave pas tij zbehen sipas sipërfaqes, dhe pikat pas terrenit fshihen ([Thellësia dhe heqja e pjesëve të padukshme](depth-and-culling.md)). Pa nivel, nuk ka errësim.
- Pritet nga [Prerja](slice.md) dhe, me *Prit edhe nivelin* të ndezur, nga [heqja sipas largësisë](depth-and-culling.md#distance-culling), së bashku me nxehtësinë.
- Është e vetmja gjë që e turbullon [thellësia e fushës](camera.md#depth-of-field), përveç rrjetës dhe kutive.
- Një nivel 3D **e zgjeron planin e largët të kamerës** kur është më i madh se të dhënat: afër dhe larg kalibrohen nga grupi i të dhënave, dhe një hartë e eksportuar me disa kilometra gjerësi do të ishte përndryshe tërësisht pas planit të largët dhe do ta linte pamjen bosh. Plani i largët bëhet 3 × shtrirja horizontale e nivelit kur është më e madhe, plani afër lëviz me të (të paktën largë / 100,000) për të ruajtur saktësinë e thellësisë nga e cila varet errësimi, dhe shpejtësia e fluturimit ngrihet të paktën në shtrirje / 12. Zgjerohet vetëm, kurrë nuk ngushtohet.

## Paneli, nga lart poshtë {#the-panel-top-to-bottom}

| Pjesa | Detaje |
|---|---|
| **Imazh harte…**, **Model 3D…** | Ngarko një; zëvendëson nivelin aktual. |
| **Bota e vërtetë si sfond**, **Harro pllakat e hartës** | Vetëm për një grup të dhënash me referencë gjeografike: ndërton vendin real nën të si nivel, ose fshin pllakat e shkarkuara. [Sfondi botëror](world-backdrop.md) |
| **Objektivi i thjeshtimit** | Buxheti i trekëndëshave për importin e radhës të modelit: *I plotë - pa thjeshtim* (parazgjedhja), *I lartë - 8M*, *Mesatar - 3M*, *I ulët - 800k*, *Silueta - 100k*. [Nivelet 3D](model-levels.md#simplification) |
| Progresi dhe **Anulo** | Gjatë dekodimit ose importit. |
| Shënimi i importit | Trekëndëshat para dhe pas, ndarja në tokë / struktura / ujë, niveli i detajit i përdorur. |
| Emri dhe madhësia | `gjerësia×lartësia px · x × z m/px` për një imazh, `N trekëndësha (nga M)` për një model. |
| **Opaciteti**, **Ndriçimi** | Të dy llojet. |
| Kontrollet e imazhit | **Zhngjyrosje**, **Përmbys veri/jug**, **Vendosja** (dy pika kyçe), **Përshtat me kufijtë e të dhënave**, **Lartësia**. [Imazhet e hartave](map-images.md) |
| Kontrollet e modelit | Relievi i tokës, uji, trekëndëshat e tokës, tela, tekstura, ngjyra e kapur, strukturat, klasifikimi i pjesëve. [Pamja e nivelit](level-appearance.md) |
| **Ruaj në bibliotekë**, **Hiq** | [Biblioteka e niveleve](level-library.md); Hiq e shkarkon nivelin. |
| **Biblioteka** | Nivelet e ruajtura në këtë shfletues. [Biblioteka e niveleve](level-library.md) |

## Faqet e këtij seksioni {#pages-in-this-section}

- [Imazhet e hartave](map-images.md)
- [Nivelet 3D](model-levels.md) - formatet, pjesët, klasifikimi, thjeshtimi, teksturat
- [Pamja e nivelit](level-appearance.md) - çdo kontroll për një nivel 3D
- [Biblioteka e niveleve](level-library.md)
- [Sfondi botëror](world-backdrop.md) - bota reale nën një regjistrim, nga të dhëna të hapura

Si merren nivelet nga lojërat dhe motorët është puna e veglave të veçanta eksportuese (shih [README-n e depos](https://github.com/Holdi601/3DHeat/blob/main/README.md)); kontrata që shkruajnë përmblidhet te [Nivelet 3D](model-levels.md#the-exporter-contract).
