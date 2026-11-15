---
title: "Mënyrat e nxehtësisë"
nav_order: 4
has_children: true
lang: "sq"
source: "heat-modes.md"
source_hash: "10f90a53f900"
translated: true
outdated: false
---

# Mënyrat e nxehtësisë

Çdo pikë shton pak shkëlqim, shkëlqimet grumbullohen, dhe grumbulli lyhet me ngjyra. Mënyrat janë pesë mënyra për ta lyer, dhe secila përgjigjet një pyetjeje.

Shiriti i modeve në krye të shiritit anësor të skedës Harta e nxehtësisë zgjedh si vizatohet [grupi i të dhënave](glossary.md). Tastet 1-4 zgjedhin Nxehtësi, Diferencë, Nxehtësi ekipi dhe Vija. Mbivendosje figurash nuk ka tast.

![Shiriti i modeve me Nxehtësi, Diferencë, Nxehtësi ekipi, Mbivendosje figurash dhe Vija](../assets/img/en/heat-modes-bar.webp)

| Modaliteti | Pyetja që i përgjigjet |
|---|---|
| **Nxehtësi** | Ku ndodhi, dhe sa? |
| **Diferencë** | Cila palë e bëri më shumë? |
| **Nxehtësi ekipi** | Kujt ishte? |
| **Vija** | Nga cila anë shkuan njerëzit? |
| **Mbivendosje figurash** | Kush ishte ku, dhe kur? |

![Të njëjtat të dhëna në katër modalitete: Nxehtësi, Diferencë, Nxehtësi ekipi dhe Vija](../assets/img/en/heat-modes-grid.webp)

| Modaliteti (etiketa në shirit) | Tasti | Çfarë vizaton | Kërkon |
|---|---|---|---|
| **Nxehtësi** | 1 | Dendësi e mbledhshme: çdo rresht i dukshëm shton një sprite radial që i shikon kamerën. [Nxehtësi](heat.md) | një grup të dhënash |
| **Diferencë** | 2 | Dendësi me shenjë: një popullatë shton, një tjetër zbret. [Diferencë](difference.md) | dy palë: të paktën dy grupe, ose një ndarje mbi një kolonë të mbajtur |
| **Nxehtësi ekipi** | 3 | Dendësi e ngjyrosur sipas grupit: një nuancë për grup, e përzier aty ku grupet mbivendosen. [Nxehtësi ekipi](team-heat.md) | një kolonë grupi |
| **Mbivendosje figurash** | - | Një figurë (ose kuti) për person, që lëviz përgjatë kronologjisë: riluajtja. [Mbivendosja e figurave](box-replay.md), [Riluajtja e ndeshjes](match-replay.md) | një kolonë personi |
| **Vija** | 4 | Nxehtësi vijash: një vijë nga çdo mostër e një personi deri te e radhës, nxehtësia zbehet anash. [Nxehtësi vijash](line-heat.md) | një kolonë personi dhe një kolonë kohe |

Një modalitet që të dhënat nuk e mbajnë është i zbehur dhe shpjegimi i tij shfaqet kur kalon mbi të, për shembull *Nuk mundësohet - modaliteti Diferencë kërkon dy grupe ose një kolonë të mbajtur për ndarje; këto të dhëna kanë një grup.* Kur një grup i ri të dhënash nuk mban modalitetin aktual, pamja kthehet te **Nxehtësi**.

Tastet 1-4 kontrollohen ndaj të dhënave po në të njëjtën mënyrë: një tast për një modalitet të zbehur nuk bën asgjë.

## Cilat panele shfaq secili modalitet {#which-panels-each-mode-shows}

| Paneli | Nxehtësi | Diferencë | Nxehtësi ekipi | Mbivendosje figurash | Vija |
|---|---|---|---|---|---|
| Rrugët ([nxehtësi vijash](line-heat.md)) | | | | | po |
| Forma e nxehtësisë (me **Ndiq pamjen** dhe **E njëjta dendësi në çdo zmadhim**), Ngjyrat e nxehtësisë, Kufijtë e sprite-it në piksele, Thellësia, Heqja sipas largësisë | po | po | po | | po |
| Drejtimi ([nxehtësi sipas drejtimit](directional-heat.md)), Vlera ([peshimi i vlerave](value-weighting.md)) | po | po | po | | po |
| Pamja e ekipeve ([mbivendosja e figurave](box-replay.md)) | | | | po | |
| Ndarja e diferencës ([diferenca](difference.md)) | | po | | | |
| [Skuadrat](teams-list.md), [Entitetet](entities.md), [Filtrat](filters.md), Sfondi / niveli, [Prerja](slice.md), [Matja](measure.md), Rruga e kamerës dhe vizatimi, Performanca, Kamera & skena | po | po | po | po | po |

## Çfarë ndajnë të gjitha modalitetet e nxehtësisë {#what-every-heat-mode-shares}

Të katër modalitetet e nxehtësisë (gjithçka përveç mbivendosjes së figurave) janë e njëjta makinë me hyrje të ndryshme ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

1. **Cilët rreshta.** [Dritarja e kronologjisë](timeline.md) zgjedh një interval të vazhdueshëm rreshtash të renditur sipas kohës; [filtrat](filters.md), dukshmëria e grupeve, ndarja e diferencës, [heqja sipas largësisë](depth-and-culling.md#distance-culling) dhe [prerja](slice.md) vendosin për çdo rresht, në vertex shader, nëse dhe sa kontribuon.
2. **Splatting.** Çdo rresht që kontribuon vizatohet si sprite (ose, në modalitetin Vija, si segment) në një **objektiv nxehtësie** me pikë lundruese, duke shtuar vlerën e vet të shkallës. Kur ka më shumë rreshta nga sa mund të përballojë një kornizë, vizatohet një mostër e stratifikuar, e peshuar për ta kompensuar. Shih [Mostrimi dhe buxhetet](sampling-and-budgets.md).
3. **Grumbullimi.** Ndërsa asgjë nuk ndryshon, kornizat bashkohen derisa çdo rresht të ketë kontribuar saktësisht një herë. Shih [Grumbullimi](accumulation.md).
4. **Kompozimi.** Vlera e grumbulluar në çdo piksel pjesëtohet me **pikën e ngopjes**, formësohet nga **përgjigja ndaj dendësisë**, ngrihet nga **nxehtësia minimale** dhe kërkohet në **shkallën e ngjyrave**, alfa e së cilës e përzien me skenën. Shih [Ngjyra dhe ekspozimi](colour-and-exposure.md).

Gjithçka në hapin 4 aplikohet në kohën e kompozimit, kështu që tërheqja e atyre kontrolleve nuk e rinis kurrë grumbullimin; çdo gjë në hapat 1-2 e rinis.

## Faqet e këtij seksioni {#pages-in-this-section}

- [Nxehtësi](heat.md) - modaliteti i thjeshtë i nxehtësisë, dhe përmbledhja e paneleve të tij
  - [Forma e sprite-it](sprite-shape.md) - rrezja, intensitetet, rënia, redaktuesi i kurbës, kufijtë në piksele, sheshimi
  - [Ngjyra dhe ekspozimi](colour-and-exposure.md) - redaktuesi i shkallës, pika e ngopjes, ekspozimi automatik, nxehtësia minimale, përgjigja ndaj dendësisë
  - [Thellësia dhe heqja e pjesëve të padukshme](depth-and-culling.md) - errësimi nga niveli, fshehja pas terrenit, heqja sipas largësisë
- [Diferenca](difference.md) - ndarja e diferencës
- [Nxehtësi ekipi](team-heat.md)
- [Nxehtësi vijash](line-heat.md) - rrugët
- [Mbivendosja e figurave](box-replay.md) - modaliteti i riluajtjes (skedari ende quhet box replay)
- [Nxehtësi sipas drejtimit](directional-heat.md)
- [Peshimi i vlerave](value-weighting.md)
