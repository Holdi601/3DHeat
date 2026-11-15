---
title: "Thellësia dhe heqja e pjesëve të padukshme"
parent: "Mënyrat e nxehtësisë"
nav_order: 4
lang: "sq"
source: "depth-and-culling.md"
source_hash: "436ac15a9b3d"
translated: true
outdated: false
---


# Thellësia dhe heqja e pjesëve të padukshme

Thellësia bën që kodrat dhe muret të fshehin nxehtësinë pas tyre, ashtu si një mur i vërtetë fsheh një njeri. Heqja sipas largësisë mban vetëm nxehtësinë midis një largësie afër dhe një largësie të largët nga kamera.

![Një kamerë e ulët pas një kodre, me Fshih pas terrenit të fikur (majtas) dhe të ndezur (djathtas)](../assets/img/en/depth-and-culling-terrain.webp)

![Heqja sipas largësisë me Larg në 400 m dhe Prit edhe nivelin të ndezur: një copë e hartës rreth kamerës](../assets/img/en/depth-and-culling-far.webp)

Pa thellësi, një hartë nxehtësie mbi një [nivel](levels.md) 3D është një mbivendosje e sheshtë: gjithçka që përmban grupi i të dhënave shkëlqen nëpër çdo mur me forcë të plotë, shenjat e thellësisë që jep niveli anulohen, dhe një pikë e nxehtë brenda një ndërtese duket njësoj si një mbi çatinë e saj. Seksioni **Thellësia** e bën nivelin të fshehë atë që është pas tij. **Heqja sipas largësisë** e kufizon nxehtësinë në një guaskë ose pllakë rreth kamerës. [Prerja](slice.md) nxjerr një pllakë nga bota. Të tre zbatohen te modalitetet e nxehtësisë dhe ndryshojnë cilat rreshta kontribuojnë, prandaj kur i ndryshon, grumbullimi rinisët.

## Thellësia {#depth}

Të dy kontrollet kanë nevojë për një [nivel](levels.md): një imazh harte ose një model 3D. Pa nivel të ngarkuar nuk ka çfarë të jetë pas, dhe ato nuk bëjnë asgjë. Të dyja janë të fikura kur [Shtrirja në rrafshin e tokës](sprite-shape.md#flatten-onto-ground-plane) është e ndezur.

### Fshih pas terrenit {#hide-behind-terrain}

**Fshih pas terrenit** (parazgjedhur i ndezur): një pikë të dhënash, sipërfaqja më e afërt e së cilës drejt kamerës është *toka* (jo një strukturë), hiqet plotësisht, jo vetëm errësohet.

Terreni dhe muret janë të errëta në mënyra të ndryshme. Ti shikon *përmes* një muri me qëllim, për të parë në cilin kat ishte trafiku; kurrë nuk do të shikosh përmes një kodre, sepse pas saj është ana tjetër e hartës, që në një hartë me kilometra është pjesa më e madhe e të dhënave, dhe shumat përgjatë horizontit formojnë një brez më të ndritshëm se çdo gjë në plan të parë. Një errësues nuk mund t'i shërbejë të dyjave, prandaj terreni merr një prag, dhe muret mbajnë errësuesin më poshtë.

### Fshehur pas gjeometrisë {#hidden-behind-geometry}

**Fshehur pas gjeometrisë** (parazgjedhur 0,8): sa fort shtypet një pikë të dhënash që është pas gjeometrisë së nivelit. Vlera lexohet *shfaqet përmes* në 0, *N% më e errët* ndërmjet (pozicioni i rrëshqitësit, jo errësimi i matur), *fshehur plotësisht* në 1.

Çdo mur ose dysheme midis një pike dhe kamerës e errëson më tej: një mur lë disa për qind në parazgjedhje, dhe çdo sipërfaqe shtesë përgjysmon atë që mbetet, deri në katër sipërfaqe. Në 1 asgjë pas gjeometrisë nuk vizatohet, dhe kjo është cilësimi më i lirë.

Shih edhe [Pamja e nivelit](level-appearance.md).

## Heqja sipas largësisë {#distance-culling}

**Heqja sipas largësisë** (e mbyllur si parazgjedhje) kufizon nxehtësinë te rreshtat midis një kufiri afër dhe një kufiri të largët nga kamera. Vër një kufi të largët për të lexuar dendësinë brenda një ndërtese, pa që ana e largët e hartës të mblidhet mbi të; vër një kufi afër për të fluturuar *përmes* një pike të nxehtë në vend që të fluturosh në të.

| Kontrolli | Parazgjedhja | Diapazoni (rrëshqitja) | Kuptimi |
|---|---|---|---|
| **Afër** | i fikur | 0,5-5000 m, logaritmik, 5% e poshtme e shiritit = i fikur (200 000) | Rreshtat më afër se kjo kapërcehen. |
| **Larg** | i fikur | 1-200 000 m, logaritmik, poshtë = i fikur (10 000 000) | Rreshtat më larg se kjo kapërcehen. |
| **Prit në një rrafsh** | i ndezur | | Matet kufijtë përgjatë boshtit të shikimit, jo nga syri, kështu që prerja është një rrafsh paralel me ekranin, jo një sferë rreth teje. Buza e një sfere kthehet larg përgjatë kornizës dhe rrëshqet sa herë që kthehesh; një rrafsh qëndron aty ku e ke vendosur. |
| **Prit edhe nivelin** | i ndezur | | Prit tokën, strukturat dhe ujin në të njëjtët kufij. Kur niveli lihet i plotë, prerja heq pikat e të dhënave dhe lë ndërtesën të qëndrojë përpara tyre; kur të dyja priten, është një prerje e hartës dhe pikat qëndrojnë kundër mureve dhe dyshemeve të tyre. Ky kontroll vetëm rivizaton; nuk e rinis grumbullimin. |

### Tastet {#keyboard}

Kufiri i largët është një kontroll që e lëviz — e çon nëpër një ndërtesë dhe sheh në cilin kat shfaqet trafiku — prandaj është në tastierë kur fluturon ([`App.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/App.tsx)):

| Tasti | Efekti |
|---|---|
| `]` | Shtyn kufirin e largët jashtë me një faktor 1,12 (Shift: 1,35) |
| `[` | E tërheq brenda me të njëjtin faktor |
| `\` | Fik kufirin e largët, ose e ndez përsëri në largësinë ku u la (6000 herën e parë) |

Hapat janë gjeometrikë sepse diapazoni i dobishëm shtrihet në katër renditje madhësie, nga një dhomë deri te një hartë. Tastet e mbajnë kufirin e largët midis 100 dhe 400 000. Tastet nuk bëjnë asgjë kur një kuti teksti ose menu ka fokusin.

## Për zhvilluesit {#for-developers}

### Fshih pas terrenit {#hide-behind-terrain}

Strukturat vizatohen në një teksturë thellësie të tyre. Një fragment që është pas thellësisë së skenës, por *jo* pas thellësisë së strukturave, është pas tokës, dhe hidhet. Kushton një kalim thellësie mbi strukturat, që kapërcehet kur ndërrimi është i fikur.

### Fshehur pas gjeometrisë {#hidden-behind-geometry}

Llogaritet **për sipërfaqe**. Një krahasim i vetëm thellësie mund të thotë vetëm "diçka është përpara", kështu që një pikë pas një muri dhe një pikë katër dhoma brenda një ndërtese do të errësoheshin njëlloj, dhe brendësia do të lexohej si një njollë e vetme e zbehtë. Në vend të kësaj, gjeometria e strukturës **qërohet me thellësi** në deri në 3 shtresa të tjera ([`HEAT_DEPTH_LAYERS`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)). Çdo fragment numëron sa sipërfaqe ka përpara vetes (thellësia e vetë skenës plus shtresat e qëruara: deri në katër), dhe errësimi përbëhet:

```
strength      = 1 - (1 - slider)²                  (slider 1 → 1)
visibility    = (1 - strength) × 0.5 ^ (surfaces - 1)
visibility    = max(visibility, 0.006)             (no floor at slider 1)
```

| Rrëshqitësi | 1 sipërfaqe | 2 | 3 | 4 |
|---|---|---|---|---|
| 0,5 | 25% | 12,5% | 6,25% | 3,1% |
| 0,8 (parazgjedhur) | 4% | 2% | 1% | 0,6% (dysheme) |
| 1,0 | nuk vizatohet | nuk vizatohet | nuk vizatohet | nuk vizatohet |

Pse dy faktorë: rrëshqitësi është kalibruar që një mur të lërë disa për qind — pamja që lexohet si "pas diçkaje" — dhe disa për qind të përbërë do të ishin asgjë në murin e tretë; përgjysmimi për çdo sipërfaqe shtesë mban katër hapa të dallueshëm. Pse në katror: linear e linte një fushë të ngopur ende të ngopur pas një muri; një fuqi e katërt e fshinte tërësisht në 0,8. Pse një dysheme: fshehja e plotë e nxehtësisë së fshehur e bën një dhomë plot trafik të fshehur të duket si një dhomë bosh, pa asgjë që të sugjerojë të kapësh [Prerjen](slice.md). Vetëm një rrëshqitës i ngjitur në 1 e fsheh plotësisht, dhe është cilësimi më i lirë, sepse pikat e errësuara hidhen.

Si ([`engine.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts), shader-at e nxehtësisë me pika): krahasimi bëhet për fragment, kundrejt teksturës së thellësisë së skenës, në **thellësi dritareje** jo në largësi botërore. Një marrje tekstura e thellësisë në fazën e kulmit lexon "larg" kudo në disa drejtues (ndër ta rasterizuesi softuerik i ANGLE), dhe kthimi i të dyja thellësive në metra e humb ndarjen për shkak të saktësisë kur diapazoni afër/larg është i gjerë. Paragjykimi është një rreze sprite e kthyer në njësi dritareje plus disa bite më pak të rëndësishme, kështu që një pikë të dhënash që qëndron mbi një sipërfaqe nuk e hijëzon vetveten.

Strukturat vizatohen transparente, por vizatohen në thellësinë që e lexon errësimi; një nivel, strukturat e të cilit nuk arrinin teksturën e thellësisë, do të errësonte vetëm kundrejt terrenit.

### Heqja sipas largësisë {#distance-culling}

Të dy kufijtë vlerësohen në shader-in e kulmit, kështu që një rresht i hequr kushton një kulm dhe asnjë fragment.
