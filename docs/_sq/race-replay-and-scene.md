---
title: "Riluajtja dhe skena 3D"
parent: "Analiza e garës"
nav_order: 52
lang: "sq"
source: "race-replay-and-scene.md"
source_hash: "ebeead492b6a"
translated: true
outdated: false
---

# Riluajtja dhe skena 3D

Riluaj xhirot e tua bashkë, si një garë, dhe shiko ku del përpara një makinë. Gjithçka që shihet në pamjen 3D të skedës **Analiza e garës** përshkruhet këtu: linjat e drejtuara, ngjyrat e vizatuara mbi pistë, makinat dhe etiketat.

![Harta e shkaqeve me makinat të rreshtuara 40 m para një kthese: pista me ngjyra, dy makina dhe shtylla me flamur](../assets/img/en/race-replay-lined-up.webp)

## Ora e riluajtjes {#the-replay-clock}

Një orë drejton çdo xhiro: sekonda të xhirit të **referencës**. Motori e ec përpara çdo kuadër gjatë luajtjes (sipas kohës së kuadrit × shpejtësia e riluajtjes); në fund kthehet në 0 kur **Përsërit** është i ndezur, përndryshe ndalet. Ora nuk është me qëllim pjesë e magazinës, që paneli anësor të mos rivizatohet çdo kuadër; HUD dhe grafikët e abonohen dhe përditësohen jo më shumë se një herë në kuadër.

**Gjatësia e riluajtjes** është xhiroja më e gjatë në orë: koha e çdo xhiroje (minus zhvendosjen e saj në *Të rreshtuara*), ose koha e referencës në *Krah për krah*.

## Shiriti i transportit {#the-transport-bar}

Nën pamje, nga e majta në të djathtë:

| Kontrolli | Bën |
|---|---|
| ⏮ | kthehu në fillim (edhe **Home**) |
| ▶ / ❚❚ | luaj / pauzë (edhe **K**) |
| shpejtësia | 0.25×, 0.5×, 1×, 2×, 4× |
| rrëshqitësi i kërkimit | e vendos orën drejtpërdrejt, me hapa 0.01 s |
| ora | `koha / gjatësia · metra`: ora si kohë xhiroje, gjatësia e riluajtjes, dhe sa larg përgjatë referencës është makina e referencës |
| *Nga vija e nisjes* / *Të rreshtuara* / *Krah për krah* | mënyra e riluajtjes (më poshtë) |
| **Rreshto këtu** | i vendos çdo makinë aty ku është referenca tani, dhe vazhdon nga aty |
| **Përsërit** | nis përsëri në fund (i ndezur si parazgjedhje) |
| **Fshih grafikët** / **Shfaq grafikët** | grafikët e distancës nën shirit |

Butonat janë joaktivë derisa të ngarkohen xhiro (një xhiro mjafton për ta riluajtur; krahasimet kanë nevojë për dy).

## Mënyrat e riluajtjes {#replay-modes}

Si del koha e secilit xhiro nga ora:

| Mënyra | Koha e secilit xhiro | Çfarë shfaq |
|---|---|---|
| **Nga vija e nisjes** (`start`) | vetë ora | çdo xhiro nga nisja e vet: një garë mes tyre, hendeku që rritet ashtu si në pistë |
| **Të rreshtuara** (`anchor`) | ora plus zhvendosja e xhiros | çdo makinë në të njëjtin vend, në të njëjtin çast, pastaj lirohet - çfarë ndodh nga ai pikë e tutje, jo nga nisja e xhiros |
| **Krah për krah** (`locked`) | koha kur xhiroja arriti distancën aktuale të referencës | çdo makinë e mbajtur në distancën e referencës gjatë gjithë xhiros: shpejtësitë dhe komandat e krahasuara metër për metër |

Përdore kur:

- **Nga vija e nisjes**: do të shohësh kush është përpara dhe si rritet hendeku.
- **Të rreshtuara**: do të dish çfarë ndodh në një kthesë ose në një drejtëz, me të gjithë që nisen të barabartë atje.
- **Krah për krah**: do të krahasosh çfarë bëjnë shoferët me pedalet dhe timonin në të njëjtin vend të pistës.

**Zhvendosjet në *Të rreshtuara*:** për një pikë referimi në `s` metra përgjatë referencës, zhvendosja e çdo xhiroje është koha e vet në `s` minus kohën e referencës në `s`, të dyja të lexuara nga xhirot e rreshtuara (shih [një bosht distance](race-corner-analysis.md#one-distance-axis)). Një xhiro që nuk e mbulon `s` mban zhvendosjen 0. Zgjedhja e *Të rreshtuara* nga butonat e mënyrës e vendos pikën referuese te distanca aktuale e referencës.

Një shtyllë e bardhë me flamur (14 m e lartë) shënon pikën referuese në mënyrën *Të rreshtuara*.

### Rreshtimi {#lining-up}

| Veprimi | Pika referuese | Ora |
|---|---|---|
| **Rreshto këtu** | ku është referenca tani | e pandryshuar |
| Shift+kliko te grafikët | metri i klikuar | 1.5 s para se referenca ta arrijë |
| një gjetje te *Ku të përmirësohesh*, një stemë me numër mbi pistë, një rresht i *Kthesë pas kthese* me një gjetje | 40 m para ku fillon shkaku i gjetjes | 1.5 s para atij pike; pastaj luan |
| një ngjarje e kontrollit të makinës, etiketa e një goditjeje | 40 m para ngjarjes | 1.5 s para; pastaj luan |
| një xhiro te statistikat e pistës | si gjetja ose ngjarja e saj | si më sipër, me atë xhiro të fokusuar |

Shikimi i një gjetjeje e kornizon atë edhe me kamerën - një top rreth mesit të intervalit të gjetjes, me rreze më të madhe midis 40 m dhe gjysmës së gjatësisë plus 30 m (60 m për një ngjarje) - përveç kur kamera ndjek një makinë.

### Kamera ndjekëse {#chase-camera}

⌖ në listën e xhirove e bën kamerën të ndjekë atë makinë: 2.5 + 4 × madhësia e makinës metra pas saj dhe 0.9 + 1.1 × madhësia e makinës metra lart, duke parë përgjatë drejtimit të lëvizjes së saj, e pjerrët nga lart drejt makinës, e butësuar (20% e rrugës çdo kuadër) që të mos dridhet me çdo lëkundje. ⌖ përsëri e liron. Makina e ndjekur vizatohet pak më e çelët, me një unazë të bardhë në tokë, dhe karta e saj nxirret në pah.

## Seksioni Pamja {#the-view-section}

| Kontrolli | Parazgjedhja | Bën |
|---|---|---|
| **Vija** / **Harta e kohës** / **Harta e shkaqeve** / **Harta e gabimeve** | Harta e kohës | çfarë vizatohet përgjatë pistës (më poshtë); *Vija* nuk vizaton asgjë |
| legjenda | - | *fiton ↔ humbet* për hartën e kohës, ngjyrat e shkaqeve për hartën e shkaqeve, *pak xhiro ↔ shumë xhiro* për hartën e gabimeve |
| **Linjat e drejtuara** | e ndezur | linja e çdo xhiroje të dukshme, në ngjyrën e saj |
| **Makinat** | e ndezur | makinat, dhe burimet e kartave HUD |
| **Gomat dhe pezullimi** | e ndezur | temperatura e gomës, unazat e rrëshqitjes, shtyllat e pezullimit dhe simbolet e tjera për rrotë, dhe dritat e çative të makinave |
| **Etiketat** | e ndezur | emrat e kthesave, stemat me numra, etiketat e goditjeve, etiketat e kthesave të hartës së gabimeve |
| **Pista nga xhirot** | e ndezur | sipërfaqe rruge për një pistë pa model të nxjerrë (fshihet kur është i ngarkuar një model pistë) |
| **Të gjitha vlerat në karta** | e fikur | çdo kanal i listuar në çdo kartë HUD |
| **Format e vërteta të makinave** | e ndezur | çdo makinë në formën e homologut të vet (shih [Makinat](#the-cars)); e fikur: monoposto e hapur, që nuk fsheh asgjë nga telemetria |
| **Madhësia e makinës** | 1× | 1× deri 10× me hapa 0.5; 1× është madhësia reale e makinës, aq e gjatë dhe e gjerë sa është në lojë. Asgjë tjetër nga ky rrëshqitës nuk e ndryshon |

## Linjat e drejtuara {#driven-lines}

Rruga e secilit xhiro të dukshëm përmes mostrave të veta, në ngjyrën e vet, vizatohet 0.12 m nën pozicionin e regjistruar (pozicioni i regjistruar i një makine është pika e saj referuese, 0.28 deri 0.47 m mbi rrugë në pistat e nxjerra të Forza). Mbahet një pikë çdo 1.5 m; me më shumë se 10 xhiro të dukshëm, xhirot që nuk shihen mbajnë një çdo 6 m (çdo kulm dërgohet te GPU çdo kuadër).

## Hartat {#the-maps}

Të tre janë shirita përgjatë rrugës së **referencës**, 0.2 m nën pozicionet e regjistruara, një katror për çdo hap rrjeti 2 m.

### Harta e kohës (`where`) {#time-map-where}

Për xhiron e fokusuar: sekonda të fituara ose të humbura për metër kundrejt xhirit me të cilin krahasohet në atë pikë (më i miri i klasës së vet, ose për referencën xhiroja tjetër më e shpejtë përmes çdo segmenti), nga ndryshimi i deltës së rreshtuar për çdo hap rrjeti, i butësuar mbi ±10 m. E kuqe aty ku humbet kohë, jeshile aty ku fitohet, gri mes tyre; shkalla e ngjyrave është përqindja e 95-të e vlerave absolute, kështu që pikat e larta prerën dhe pjesa më e madhe e xhiros është brenda intervalit. 6 m e gjerë.

### Harta e shkaqeve (`why`) {#cause-map-why}

Për xhiron e fokusuar: çdo humbje vizatohet mbi intervalin ku është **shkaku** i saj (jo aty ku shfaqet koha), e ngjyrosur sipas grupit të shkakut, me gjetjen më të kushtueshme që fiton aty ku mbivendosen dy. Gjerësia `3 + 9·√(cost / biggest cost)` metra; aty ku s'u humb asgjë, një shirit gri 2 m. Gjetja e zgjedhur te *Ku të përmirësohesh* vizatohet e bardhë.

| Grupi | Ngjyra | Gjetjet |
|---|---|---|
| frenim | portokalli | humbjet e shoferit në fazën e frenimit |
| hyrje | magenta | humbjet e shoferit në hyrje dhe përmes mesit |
| dalje | blu | humbjet e shoferit në dalje |
| drejtëza | e verdhë | humbjet e shoferit në drejtëz |
| makinë | gri | ajo që shpjegon makina |
| kontekst | gri e errët | situata (një nisje gare kundrejt një xhiroje në lëvizje) |

### Harta e gabimeve {#mistake-map}

Sa nga të gjitha xhirot (të klasave të zgjedhura në statistikat e pistës) bënë një gabim në çdo metër - çdo lloj, ose vetëm ai i zgjedhur në statistika. Çdo xhiro numërohet një herë për metër; intervali i çdo gabimi zgjerohet me 6 m nga secila anë, që një i shkurtër të duket. Gjerësia `3 + 10·(xhirot / më shumë xhiro)` metra dhe një ngjyrë nga kafe e zbehtë në portokalli të ndezur; gri 2 m aty ku asnjë xhiro nuk bëri gabim. Shih [Statistikat e pistës](race-course-statistics.md#the-mistake-map).

## Pista nga xhirot {#track-from-the-laps}

Për një lojë ku pista nuk është nxjerrë, vizatohet një rrugë nën vijat: aq e gjerë sa shpërndahen xhirot përgjatë referencës (shmangjet anësore brenda 25 m numërohen) plus 2 m nga secila anë, të paktën 4 m nga secila anë e vijës së referencës, e butësuar mbi ±8 pika rrjeti (±16 m), në gri asfalti me vija të lehta skaji, 0.3 m nën pozicionet e regjistruara. Fshihet kur ngarkohet një model pistë në **Nivel**.

## Goditjet dhe përplasjet në pistë {#hits-and-crashes-on-the-track}

Goditjet dhe përplasjet e çdo xhiroje të dukshme (shih [Ngjarjet e kontrollit të makinës](race-control-events.md#hits-and-crashes)) shënohen aty ku ndodhën, kurdo që vizatohen linjat ose makinat: një yll me maja - i kuq për një përplasje, portokalli për një goditje - që qëndron mbi një shtyllë, me një unazë në ngjyrën e xhiros në bazë, e madhe sa madhësia e makinës (përplasjet më të mëdha). Ndërsa një makinë kalon momentin e goditjes, një unazë goditjeje përhapet nga ajo për 0.8 s.

## Mënyra e ndihmës {#help-mode}

**?** pranë zgjedhësit të gjuhës, ose tasti **?** ose **F1**, ndez një çelës për çdo ngjyrë në ekran, në të tre skedat ([`HelpPanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/help/HelpPanel.tsx),
[`RaceHelp.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceHelp.tsx)). Zgjedhja mbetet në këtë shfletues.

- **Legjenda** në këndin e pamjes liston ngjyrat për skedën dhe mënyrën në përdorim. Çdo shkallë vjen nga aty ku e merr pamja, kështu që një shkallë nxehtësie që e ke redaktuar shfaqet si e redaktuar. Në skedën e garës listohet vetëm ajo që mbajnë xhirot e ngarkuara.
- **Karta e çdo makine** merr një tabelë të asaj që vizatohet në rrotat e saj, me emër, dhe vlerën e çdo rrote në ngjyrën me të cilën vizatohet.
- **Makina në fokus** merr një etiketë te çdo rrotë që thotë të njëjtën gjë, e vendosur jashtë te kthesat. Fshihet kur makina është shumë e vogël në ekran që ato të futen.

## Makinat {#the-cars}

**Çdo makinë në formën e vet**, në ngjyrën e xhiros së saj dhe në madhësinë e saj reale. Format vijnë nga një skedar makinash, i bërë një herë në kompjuterin ku është loja:

```
python -m heat3d_gamefiles cars -o forza.h3dcars
```

Pa një të tillë, çdo makinë vizatohet si **makina e vet e shfaqësit** e llojit dhe epokës së vet: sedan, kupé, hatchback, station wagon, makinë sportive, superauto, muscle car, off-roader, pickup, furgon ose mikrokar, secila si klasike (para 1980), e viteve 80 dhe 90, ose moderne ([`carBodies.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carBodies.ts)). Ato ndërtohen këtu nga proporcione të përgjithshme: pa logo, pa emra modelesh dhe pa asgjë nga skedarët e ndonjë loje, kështu që dërgohen me shfaqësin. Lloji vjen nga emri i makinës, epoka nga viti që ka brenda; një makinë pa asnjërin merret nga klasa e saj. Rreth njëqind gjenerata reale njihen nga gjatësia, gjerësia, lartësia dhe baza e rrotave të publikuara ([`carSpecs.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carSpecs.ts); një rresht për secilën, të rrumbullakosura), kështu që një 3 Series i viteve 90 merr madhësinë dhe qëndrimin e asaj makine, akoma si formë e thjeshtë pa stemë apo rrjetë.

Skedari i makinave bëhet në kompjuterin tënd nga kopja jote e lojës. Mban një model me detaj të ulët të çdo makine, rreth 900 trekëndësha, me pozicionet e rrotave të veta (shih [komandën `cars` të nxjerrësit](https://github.com/Holdi601/3DHeat-GameFiles/blob/main/docs/commands.md#cars)). **Ngarko skedarin e makinave...** në cilësimet e pamjes, ose lëshimi i skedarit mbi skedën e garës, e ngarkon; mbetet në këtë shfletues. Mban format e lojës, kështu që nuk është diçka për ta dhënë më tej, dhe shfaqësi nuk dërgon asnjë.

Cila makinë qëndron për makinën e një xhiroje llogaritet nga ajo që është e ngarkuar çdo herë dhe nuk ruhet kurrë, kështu që një makinë pa homolog sot merr të vetën sapo një skedar më i ri e ka ([`carMatch.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/carMatch.ts)):

| Makina e xhiros | Vizatohet si |
|---|---|
| numri i saj është në skedar për të njëjtën lojë | ajo makinë vetë |
| i njëjti prodhues, dhe një fjalë e modelit në emër | ai model, më i afërti në vite |
| i njëjti prodhues, e njëjta gjeneratë | makina e atij prodhuesi më e afërt në vite |
| çdo gjë tjetër, me skedar makinash | i njëjti prodhues më i afërti, nëse ka; përndryshe i njëjti lloj karroceje, më i afërti në vite |
| një makinë me rrota të hapura, sipas emrit | monoposto më poshtë |
| asnjë nga dy të parat, dhe shfaqësi e njeh makinën sipas madhësisë së saj | makina e vet e shfaqësit në madhësinë reale të asaj makine, me ose pa skedar |
| çdo gjë tjetër pa skedar | makina e vet e shfaqësit të atij lloji dhe epoke |

Kështu një xhiro e një BMW 3 Series të vitit 1990 të një loje tjetër shfaq një BMW rreth atij viti, dhe një makinë më e re se skedari shfaq më të afërmin e saj derisa skedari të bëhet sërish. Tooltip-i i një xhiroje, dhe rreshti nën madhësinë e makinës për xhiron e fokusuar, thonë si vizatohet dhe sa afër është kjo.

Makinat e shfaqësit kanë dritare të errëta. Modelet e një skedari makinash janë me një ngjyrë të vetme gjithandej, sepse skedari nuk ka bojë apo xhama për t'u mbështetur. Rrotat, dritat e pasme, fanarët dhe simbolet e telemetrisë më poshtë vizatohen si te monoposto; shtylla e shtytjes kalon në anën e jashtme të rrotës, aty ku shihet, dhe krahët e pezullimit lihen jashtë.

**Monoposto** është një makinë me rrota të hapura, në ngjyrën e xhiros, kështu që para është e dukshme nga çdo kënd dhe asgjë nuk fsheh rrotat: karroceria, kapaku i motorit, anët, kabina me kaskë, halo, dyshemeja, krahët para dhe pas; katër rrota të rrumbullakëta, ato të përparme të kthyera nga timoni (deri 0.5 rad në kthim të plotë), secila mbi dy krahë pezullimi me mbajtëse vertikale, shufrën e timonit (para) ose boshtin e tërheqjes (pas), dhe një shtytëse. Modeli ulet 0.3 m nga pozicioni i regjistruar, që rrotat e tij të jenë mbi rrugë, dhe shkallëzohet nga **Madhësia e makinës**.

**Karroceria lëviz mbi sustat e veta**: kur xhiroja mban të katër zhvendosjet e pezullimit, çdo cep zbret sa zhvendosja e vet (e theksuar në 0.12 m nga shtrirja e plotë te tërheqja e plotë, që të duket nga një kamerë ndjekëse), dhe karroceria zhytet, pjerret dhe prirret mbi planin që kalon nëpër të katër.

**Çfarë vizatohet nga telemetria** (me *Gomat dhe pezullimi* të ndezur) ndjek [tabelën e kanaleve](race-charts-and-hud.md#the-channel-table):

| Simboli | Nga | Vizatimi |
|---|---|---|
| ngjyra e gomës | `tireTemp` | vetë goma, blu e ftohtë → cian → jeshile në punë → e verdhë → e kuqe e nxehtë, mbi 40-130 °C |
| unaza e rrëshqitjes | `slipRatio`, `slipAngle`, `combinedSlip`, `slipIndex` (më i madhi) | një unazë në tokë nën rrotë, jeshile me aderencë në dorë, portokalli te 0.66, e kuqe te 1 (skaji i aderencës siç e raporton loja); e zbehtë nën 0.3 |
| shtylla e pezullimit | `suspension` (0..1) | shtytësja e ngjyrosur sipas zhvendosjes: blu e zgjatur, e bardhë në mes, e kuqe e ngjeshur |
| shkëlqimi i frenave | `brakeTemp` (100-900 °C) | një disk në anën e jashtme të rrotës, nga e errët në portokalli |
| shiriti i konsumimit | `tireWear` (0..1) | një shirit rreth skajit të shputës, nga e bardha e re te e kuqja e konsumuar |
| shiriti i ngarkesës | `wheelLoad` (0-12 000 N) | një shtyllë pranë rrotës, aq e lartë sa ngarkesa |

Dritat e frenimit (drita e shiut dhe skajet e krahut) ndizen me pedalen e frenit. Çdo kanal `lamp` që është i ndezur (mbi gjysmën e shkallës së vet) ndez një dritë mbi kutinë e ajrit me ngjyrën e vet: ABS që vepron, kontrolli i tërheqjes që vepron, DRS, kufizuesi i boxit, freni i dorës, në ajër.

**Në turmë** (më shumë se 10 të dukshme), makinat që nuk shihen vizatohen thjesht: vetëm karroceria, krahët, rrotat dhe drita e frenimit.

## Etiketat {#labels}

Të fiksuara në pistë dhe vendosen çdo kuadër nga projeksioni i kamerës (jashtë ekranit ose pas kamerës, fshihen). Me **Etiketat** të ndezura:

| Etiketa | Ku | Klikimi |
|---|---|---|
| emrat e kthesave (`T1`, `T2` …) | mbi çdo kulm kthese në referencë | - |
| stema me numra 1-5 | pesë humbjet më të mëdha të shoferit të xhiros së fokusuar, në mes të intervalit të çdo shkaku, me kornizë në ngjyrën e shkakut; kalo me miun për titullin dhe koston | rresht dhe riluaj atë gjetje |
| etiketat e goditjes / përplasjes | mbi çdo shpërthim të xhiros **të fokusuar**: "Përplasje −45 km/h" / "Goditje −12 km/h"; kalo me miun për përshkrimin e plotë dhe këshillën | rresht dhe riluaj goditjen |
| etiketat e kthesave të hartës së gabimeve (në vend të emrave të kthesave dhe stemave, kur harta është harta e gabimeve) | kulmi i secilës kthesë: "T3 · 5/40 frenim i herët" (gabimi më i zakonshëm, xhirot që e bënë / xhirot që e drejtuan kthesën), "T3 · 5/40" kur zgjidhet një lloj, "T3 · i pastër" kur asnjë; kalo me miun për humbjet e kthesës dhe pesë gabimet e saj më të zakonshme | hap ose mbyll atë kthesë te statistikat e pistës |

## Botërat e pasqyruara {#mirrored-worlds}

Bota e shikuesit është e djathtë me Y lart: parë nga lart, një makinë direksioni i së cilës `atan2(dx, dz)` rritet po kthehet majtas. Një lojë me botë të majtë - Forza ndër to - del e pasqyruar, çdo kthesë djathtas vizatohet si majtas, pista dhe xhirot njësoj.

Xhirot e thonë këtë vetë ([`handedness.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/handedness.ts)): duke ecur nëpër çdo xhiro nga pak metra (3 m) në herë, kthimi i shtegut të tij krahasohet me ngjeshjen e pezullimit të jashtëm (`suspension.FR` minus `suspension.FL`) dhe, pa pezullim, me timonin (pozitiv djathtas në çdo adapter). Një xhiro që kthehet më pak se π gjithsej nuk thotë asgjë; dëshmia numërohet kur kalon 2% të kthimit. Xhirot votojnë; barazia është "nuk mund të thuhet".

Kur vendimi i xhirove nuk përputhet me përmbysjen aktuale të boshteve (numri tek i boshteve të përmbysur në **Kamera & skena → Invert world axis**), seksioni **Xhirot** e thotë këtë nën listë:

- loja është e pasqyruar dhe asgjë nuk është përmbysur: "Këto xhiro e drejtojnë djathtas aty ku pista vizatohet duke u kthyer majtas …" me **Përmbys X**;
- boshtet janë të përmbysura, por xhirot nuk janë të pasqyruara: "Boshtet e përmbysura i vizatojnë këto xhiro të pasqyruara …" me **Rivendos akset**.

Vetëm vizatimi ndryshon - një reflektim i palosur në matricën e pamjes; të dhënat, analiza dhe çdo koordinatë që shfaqin mjetet mbeten ato të lojës. Përmbysja mbahet në shfletues. Analiza i emëron kthesat majtas ose djathtas me të njëjtën matje (një botë e panjohur merret si e pasqyruar, siç është ajo e Forza).

## Për zhvilluesit {#for-developers}

Kodi: [`src/race/replay.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/replay.ts),
[`src/race/scene.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/scene.ts),
[`src/race/glyph.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/glyph.ts),
[`src/ui/race/RaceBar.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceBar.tsx) (`Transport`),
[`src/ui/race/RaceLabels.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RaceLabels.tsx).

### Çfarë është një makinë në një moment {#what-a-car-is-at-a-moment}

`stateAt` ndërmjeton çdo kanal midis dy mostrave përreth kohës së xhirit. Kanalet që hidhen (marshi, flamujt) marrin mostrën më të afërt. Një xhiro që ka mbaruar parkon te vija.

**Drejtimi.** Drejtimi i lëvizjes vjen nga pozicionet e largëta disa metra (të paktën 2 m nga secila anë, që një lëkundje të mos e kthejë makinën). Drejtimi i karroserisë vjen nga shpejtësia e rrotullimit (`yaw`) të lojës vetëm kur është përshtatur me drejtimin e lëvizjes - shenja dhe shmangia, me mesatare rrethore mbi mostrat më të shpejta se 10 m/s (të paktën 20) - dhe vetëm nëse pastaj pajtohet me të (varianca rrethore nën 0.05, rreth 18° shpërndarje); përndryshe karroceria shikon përgjatë drejtimit të lëvizjes. Kjo e mban të dukshme rrëshqitjen (karroceria dhe lëvizja larg njëra-tjetrës) pa besuar konventën e këndit të lojës.

**Timoni dhe anët.** Cili drejtim i kthen makinës një timon pozitiv, dhe cilës anë i takojnë rrotat e djathta të lojës, matet nga xhiroja: timoni kundrejt kthimit të shtegut, dhe cila anë e pezullimit ngjesh në jashtë të kthesave (pa të dhëna pezullimi, lojërat e Forza merren si të pasqyruara).
