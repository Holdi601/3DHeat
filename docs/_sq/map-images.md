---
title: "Imazhet e hartave"
parent: "Nivelet dhe gjeometria e sfondit"
nav_order: 1
lang: "sq"
source: "map-images.md"
source_hash: "e7a4a651d75d"
translated: true
outdated: false
---


# Imazhet e hartave

Një imazh harte është një figurë e sheshtë — një minihartë, një foto satelitore, një plan kati — e vendosur nën të dhënat e tua, që të shohësh ku ndodh nxehtësia. I thua shikuesit ku duhet të vendoset figura duke fiksuar dy pika mbi të me dy vende në botë ("angkyrat").

## Ngarko dhe vendos një imazh harte {#load-and-place-a-map-image}

1. Ngarko së pari të dhënat e tua ([Si të futni të dhënat](getting-data-in.md)).
2. Te **Sfondi / niveli**, shtyp **Imazh harte…** dhe zgjidh figurën. Shtrihet mbi zonën e të dhënave.
3. Shtyp **Përshtat me kufijtë e të dhënave** nëse figura u zhvendos. Angkyra 1 shkon te qoshja e sipërme majtas e figurës, angkyra 2 te qoshja e poshtme djathtas, në skajet e të dhënave.
4. Nëse nxehtësia nuk përputhet me figurën, zgjidh dy pika orientimi larg njëra-tjetrës (për shembull dy qoshe të kundërta të një ndërtese ose dy kryqëzime). Lexo pikselin e secilës mbi figurë dhe pozicionin e saj në botë (kalo mbi to me [vizoren](measure.md) për të lexuar **X** dhe **Z**).
5. Shkruaji te **Vendosja**: për **Angkyrën 1** **px** të pikës orientuese, **X e botës**, **Z e botës**; po ashtu për **Angkyrën 2**.
6. Kontrollo: një shteg ose pikë e nxehtë që di se ndodhet mbi një rrugë duhet të ndodhet tani mbi atë rrugë. Rregullo numrat derisa të ndodhë.

![Seksioni Vendosja me dy angkyra dhe nxehtësi të vizatuar mbi një imazh harte](../assets/img/en/map-images-placement.webp)

Dy pikat orientuese duhet të ndryshojnë si në kolonën e pikselëve ashtu edhe në rreshtin e pikselëve, ose paneli shfaq *Dy angkyrat ndajnë një rresht ose kolonë pikselësh*.

## Ngarkimi {#loading}

Çdo format imazhi që shfletuesi mund ta dekodojë. Një imazh me anën më të gjatë mbi **8192 px** zvogëlohet në 8192 (anën më të madhe që i kërkohet GPU-ja të mbajë), dhe paneli shfaq *Zvogëluar nga W×H në w×h*.

Me ngarkimin, imazhi shtrihet mbi kufijtë X-Z të grupit të të dhënave (ose ±1000 njësi pa grup), me veriun lart, në Y-in më të ulët të grupit. Parazgjedhjet janë **Opaciteti** 100%, **Ndriçimi** 0,7, **Heqja e ngjyrave** 100%, **Përmbys veri/jug** i ndezur: pa ngjyra dhe të errësuar, sepse detyra e sfondit është të të lejojë të gjesh një pikë të nxehtë, jo të konkurrojë me të.

## Kontrollet {#controls}

| Kontrolli | Parazgjedhja | Diapazoni | Kuptimi |
|---|---|---|---|
| **Opaciteti** | 100% | 0-100% | |
| **Ndriçimi** | 0,7 | 0-2 (rrëshqitja 64) | |
| **Heqja e ngjyrave** | 100% | 0-100% | Sfond gri, nxehtësi me ngjyrë. Ngjyra në hartë konkurron me ngjyrën në të dhëna. |
| **Përmbys veri/jug** | i ndezur | | Cili rresht i imazhit është Z-ja maksimale e botës. Ndërrimi i tij me një grup të dhënash të ngarkuar e rishtas edhe angkyrat sipas kufijve të të dhënave. |
| **Vendosja**: Angkyra 1, Angkyra 2 | qoshet e imazhit mbi kufijtë e të dhënave | | Çdo angkyrë është një piksel mbi imazh — **px** (nga e majta, 0 deri në gjerësi) dhe **py** (nga lart, 0 deri në lartësi) — dhe koordinata botërore ku ndodhet, **X e botës** dhe **Z e botës**. Shkalla dhe zhvendosja rrjedhin nga çifti. |
| **Përshtat me kufijtë e të dhënave** | | | Vendos angkyrën 1 te qoshja e sipërme majtas e imazhit dhe angkyrën 2 te ajo e poshtme djathtas, mbi kufijtë X-Z të të dhënave. Pikë nisjeje për vendosje të saktë. Kërkon një grup të dhënash. |
| **Lartësia** | Y-i më i ulët i grupit | Y min e të dhënave - 500 deri Y max + 500 (rrëshqitja Y max + 100 000) | Lartësia e planit të hartës. Vëre pak nën të dhënat që asgjë të mos fshihet prej tij. |

Rreshti i emrit tregon `gjerësi×lartësi px · x × z m/px`, madhësinë botërore të një piksli përgjatë çdo boshti.

## Në skenë {#in-the-scene}

Imazhi është një katërkëndësh i vetëm me strukturë në lartësi. Me opacitet të plotë shkruan thellësi, kështu që merr pjesë në [errësimin](depth-and-culling.md) si tokë; nën 100% opacitet përzihet dhe nuk shkruan thellësi, kështu që nuk errëson asgjë. [Vizorja](measure.md) mat në planin e tij. [Biblioteka e niveleve](level-library.md) ruan një nivel imazhi me angkyrat e tij.

## Harta Dota 2 {#dota-2-map}

**Harta Dota 2** pranë **Imazh harte…** merr vizatimin e hartës aktuale të Dota 2 që [OpenDota](https://www.opendota.com) shfaq në faqet e ndeshjeve të saj, dhe e vendos nën tabelat që [Watcher](https://github.com/Holdi601/3DHeat-Watcher) shkruan nga riluajtjet e Dota 2 ([`dotaMap.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/tactics/dotaMap.ts)). Imazhi merret nga opendota.com kur shtypet butoni dhe nuk është pjesë e 3DHeat; vizatimi i ndryshimit më të ri merret nga lista e vetë OpenDota, dhe vizatimi 7.40 kur lista nuk mund të lexohet.

| | |
|---|---|
| Burimi | `opendota.com/assets/images/dota2/map/detailed_<patch>.webp`, 900×900 px |
| Vendosja | Kalibrimi i OpenDota: imazhi shtrihet nga njësitë botërore Dota -8192 deri 8064 në të dy boshtet (qelizat 128-njësi 64 deri 191), veriu lart. Me boshtet e tabelës së riluajtjes (Z lart, Y e kthyer) kjo është X botëror -8192 deri 8064 dhe Z botëror -8064 deri 8192. Rreth 18 njësi për piksel. |
| Lartësia | 0. Heronjtë qëndrojnë nga 0 deri rreth 600. |
| Pamja | Ndriçimi 0,8, heqja e ngjyrave 50%. |

E kontrolluar në riluajtjen publike të një ndeshjeje të ndryshimit 7.40: shtegu i çdo heroi ndjek rrugët e vizatuara, dhe kullat, kazermat dhe antikët që vendos riluajtja bien mbi bazat e vizatuara. Pamja **Sipër** e tregon hartën me veriun në fund të ekranit, siç tregon çdo tabelë Z-lart me Y të kthyer.

Vizatimi është i OpenDota, i hartës së Valve; Valve nuk e miraton 3DHeat.

### Harta 3D {#the-3d-map}

Me Dota 2 të instaluar, komanda [`dota-map`](https://holdi601.github.io/3DHeat-Watcher/dota-map.html) e Watcher (`python -m heat3d_watch dota-map -o dota.glb`) krijon hartën në 3D nga skedarët e vetë lojës: terren, shkëmbinj, ujë, pemë dhe ndërtesa, në njësitë dhe boshtet e tabelave të riluajtjeve. Ngarkoje skedarin një herë me **Model 3D…**: shikuesi e njeh nga pjesët e tij (`ground:terrain`, `structure:tower`, `structure:ancient`, `structure:tree`; `isDotaLevel` në `dotaMap.ts`), e vendos menjëherë në [bibliotekën e niveleve](level-library.md), duke zëvendësuar një më të vjetër, dhe e thotë këtë. Që atëherë **Harta e Dota 2** e ngarkon këtë hartë 3D nga biblioteka në vend që të shkarkojë vizatimin; nëse nuk ka asnjë në bibliotekë, shkarkon vizatimin dhe tregon si bëhet harta 3D. Skedari vjen nga instalimi yt dhe mbetet në kompjuterin tënd.

## Për zhvilluesit {#for-developers}

### Si e vendosin angkyrat imazhin {#how-the-anchors-place-the-image}

Nga [`mapQuadFromAnchors`](https://github.com/Holdi601/3DHeat/blob/main/src/render/level.ts), me angkyrat *a* dhe *b*:

```
scaleX = (b.worldX - a.worldX) / (b.px - a.px)
scaleZ = (b.worldZ - a.worldZ) / (b.py - a.py)
pixel (0, 0) sits at  (a.worldX - a.px × scaleX,  a.worldZ - a.py × scaleZ)
```

Dy angkyrat caktojnë shkallën dhe zhvendosjen në çdo bosht veç e veç, kështu që një hartë mund të shtrihet ndryshe në X dhe Z, por nuk mund të rrotullohet. Angkyrat duhet të ndryshojnë në **të dyja** koordinatat e pikselit; kur ndajnë një rresht ose kolonë, nuk mund të nxirret asnjë shkallë, harta nuk vizatohet, dhe paneli shfaq *Dy angkyrat ndajnë një rresht ose kolonë pikselësh*.
