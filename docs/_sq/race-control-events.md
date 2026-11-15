---
title: "Ngjarjet e kontrollit të makinës"
parent: "Analiza e garës"
nav_order: 54
lang: "sq"
source: "race-control-events.md"
source_hash: "9ab565885c61"
translated: true
outdated: false
---

# Ngjarjet e kontrollit të makinës

Shikuesi sheh si është drejtuar çdo xhiro dhe shënon vendet ku shoferi e bëri makinën të rrëshqasë, të rrotullohet, të godasë diçka ose të humbasë aderencën. Kjo është e dobishme, sepse një gabim që kushtoi kohë është mënyra më e shpejtë për ta rregulluar.

![Seksioni Kontrolli i makinës: sa herë secila xhiro bllokoi një rrotë, u rrotullua ose u shty jashtë, dhe lista e gabimeve me një të hapur](../assets/img/en/race-control-table.webp)

## Me fjalë të thjeshta {#in-plain-words}

- **Bllokim**: frenon aq fort sa një rrotë ndalon së rrotulluari dhe rrëshqet. Makina frenon më keq dhe nuk mund të drejtohet.
- **Patinim**: e shtyp gazin aq fort sa rrotat tërheqëse rrotullohen më shpejt se sa lëviz makina. Humb tërheqjen.
- **Mbidrejtim**: pjesa e pasme e makinës rrëshqet jashtë. Nëse rrotullohet krejt, kjo është një **rrotullim**.
- **Nëndrejtim**: pjesa e përparme e makinës rrëshqet jashtë ("shtyn"); rrotullimi i timonit më shumë nuk ndihmon.
- **Goditje** dhe **përplasje**: makina preku diçka (goditja është një trokitje ose gërvishtje, përplasja është e fortë).
- **ABS**, **TC**: ndihmësit e vetë makinës, që veprojnë kundër bllokimit dhe patinimit. Ata nuk janë gabime.

## Seksioni Kontrolli i makinës (çfarë shihni) {#the-car-control-section-what-you-see}

Për xhiron e zgjedhur, çfarëdo që mbajnë xhirot - pa rrëshqitje gomash dhe pa kënd drifti - ajo tregon ende atë që gjendet, në vend se asgjë (më poshtë).

**Tabela**: një rresht për çdo lloj që tregon njëra nga dy xhirot - Rrota të bllokuara, Patinim, Bishti del jashtë (mbidrejtim dhe rrotullime), Shtyhet jashtë, Përplasje, Goditje, ABS në veprim, Kontrolli i tërheqjes në veprim, Frena e dorës, Në ajër. Çdo qelizë është "numër · sekonda", për xhirot e zgjedhur dhe për atë me të cilën krahasohet; dhe *Këndi më i madh i driftit* kur ka kënd drifti (më i madhi në tokë).

**Lista**: gabimet e saj të pandara që kushtojnë të paktën 0,02 s, më e shtrenjta e para, deri në 12, secila me titullin dhe koston e saj (dhe çipin e llojit të saj). Klikoni një gabim për të lexuar këshillën e tij, për të rreshtuar makinat 40 m para tij dhe për ta rishikuar. **Gjithashtu çfarë bënë të dyja xhirot aty** shton çdo gabim, përfshirë ato të përbashkëta (çipi "e bënë të dyja", kostoja "—" nën 0,01 s). Kur nuk ka asnjë, shfaqet: "Asgjë që X bëri me gomat nuk i kushtoi kohë, që Y nuk e bëri edhe ai."

**Shënimi nën të** tregon me çfarë mund të shihte zbulimi - "Nga rrëshqitja e secilës rrotë dhe këndi i rrëshqitjes, dhe nga këndi i driftit të makinës." (ose rrëshqitja dhe këndi i rrëshqitjes, rrëshqitja dhe këndi i driftit, vetëm rrëshqitja, ose "Vetëm nga këndi i driftit të makinës - këto xhiro nuk kanë të dhëna për rrëshqitjen e gomave.") - tokën për të cilën u matën kufijtë (asfalt, i shkrifët ose i përzier: mbi 80% mostra të shkrifëta do të thotë i shkrifët, nën 20% asfalt), me cilën xhiro u vunë përballë ngjarjet, dhe si llogaritet kostoja.

Me **asnjë rrëshqitje gomash dhe asnjë kënd drifti** (një skedar xhiroje FH Companion pa telemetrinë e vet), tabela dhe lista shfaqen po ashtu, dhe shënimi thotë çfarë u gjet ende nga ajo që mbajnë xhirot: "Këto xhiro nuk mbajnë rrëshqitje gomash dhe as kënd drifti, ndaj bllokimet dhe patinimi nuk mund të dallohen. Gjenden ende: shtytjet, nga timoni kundrejt trajektores; goditjet dhe përplasjet, nga shpejtësia dhe nxitimi." Rrëshqitjet nga shpejtësia e rrotullimit përmenden edhe ato aty ku xhirot e kanë, dhe shtytjet vetëm aty ku kanë timon. Fjalia për kufijtë e rrëshqitjes dhe të driftit hiqet, dhe një shënim i dytë thotë: "Për Forza Horizon, zgjidh edhe skedarin `.tele.gz` pranë çdo xhiroje FH Companion: është telemetria e plotë, rrëshqitja e çdo rrote 64 herë në sekondë."

Kostoja **totale** e kontrollit të xhiros (e përdorur në përmbledhje) numëron gabimet që mbivendosen - një bllokim dhe rrëshqitja që e fillon, brenda 40 m - vetëm një herë, me koston më të lartë të grupit.

## Si zbulohet {#how-it-is-detected}

Pjesa tjetër e kësaj faqeje është libri i rregullave: çdo lloj, çdo prag.

Kodi: [`src/race/control.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/control.ts),
[`src/race/impacts.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/impacts.ts),
[`src/race/derive.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/derive.ts).
Arsyetimi dhe literatura janë te [metoda](race-analytics.md).

## Llojet {#the-kinds}

| Lloji | Rresht në tabelë | A është gabim? | Më i shkurtri që numërohet |
|---|---|---|---|
| `lock` | Rrota të bllokuara | po | 0,1 s |
| `wheelspin` | Patinim | po | 0,15 s |
| `oversteer` | Bishti del jashtë | po | 0,2 s |
| `spin` | (numërohet me Bishti del jashtë) | po | 0,1 s |
| `understeer` | Shtyhet jashtë | po | 0,25 s |
| `crash` | Përplasje | po | - |
| `hit` | Goditje | po | - |
| `abs` | ABS në veprim | jo | 0,2 s |
| `tc` | Kontrolli i tërheqjes në veprim | jo | 0,2 s |
| `handbrake` | Frena e dorës | jo | 0,1 s |
| `airborne` | Në ajër | jo | 0,15 s |

Vrapimet më të shkurtra janë zhurmë (një buzë, një gropë, një mostër). Vrapimet e pikave të rrjetit (çdo 2 m) që kalojnë një provë bashkohen mbi hendeqe deri në 2 pika. Vetëm **gabimet** mund të jenë gabime dhe kanë kosto; të tjerat janë ajo që bëri makina dhe shoferi.

## Çfarë kërkon çdo provë {#what-every-test-needs}

### Kanale të llogaritura {#derived-channels}

Para se të gjykohet çdo gjë, çdo xhiro merr atë që loja e saj nuk e dërgon, me emra kanonikë (vlera e vetë lojës gjithmonë fiton):

| Kanali | Nga |
|---|---|
| `bodySlip` (kënd drifti) | shpejtësia në kornizën e makinës, `atan2(latVel, abs(longVel))`, aty ku loja e dërgon (0 nën 3 m/s); përndryshe drejtimi (yaw i lojës, i përshtatur me drejtimin e lëvizjes me shenjë dhe shmangie mbi mostra më shpejt se 10 m/s, i besuar vetëm me variancë rrethore nën 0,05) kundrejt drejtimit të lëvizjes (pozicionet të paktën 2 m larg), në shpejtësi mbi 3 m/s |
| `yawRate` | ndryshimi i `yaw` me kohën, aty ku ka drejtim por nuk ka shpejtësi rrotullimi |
| `airborne` | kontakti me tokën i çdo rrote në ose nën 0,5; përndryshe ngarkesa e çdo rrote nën 5% të medianës së saj; përndryshe zhvendosja e pezullimit e çdo rrote në ose nën 0,02 (plotësisht e zgjatur). Një mostër e vetme e shpërndarë nuk është fluturim |
| `slipRatio.<W>` | `(shpejtësia e sipërfaqes së rrotës - shpejtësia e makinës) / shpejtësia e makinës` mbi 3 m/s, aty ku loja dërgon shpejtësitë e sipërfaqes së rrotave; ose nga rrotullimi i rrotës × një rreze rrotulluese e matur në xhiro - mediana e `shpejtësi / rrotullim` ndërsa rrotullohet drejt (shpejtësia mbi 10 m/s, gazi nën 0,3, fren nën 0,05, abs(nxitimi gjatësor) nën 3 m/s², jo në ajër; çdo mostër mbi 10 m/s kur ka më pak se 20), e pranuar midis 0,1 dhe 1 m. Shënohet `physical` |
| `loose` | rrokullima e sipërfaqes së Forzës në të paktën 2 rrota (> 0,001) për të paktën 0,33 s (një buzë është më e shkurtër), hendeqet nën 1 s të mbyllura |

### Në tokë dhe e qetë {#on-the-ground-and-settled}

Asgjë nuk gjykohet në ajër ose për **0,3 s pas një uljeje** - pezullimi mbërthehet dhe nxitimet hidhen lart, gjë që nuk është aderencë, frenim apo tërheqje. Një mostër duhet gjithashtu të **lëvizë**: më shpejt se 5 m/s.

### Toka {#the-ground}

Toka e secilës mostre është **e shkrifët** aty ku kanali `loose` i xhiros e thotë këtë (rrokullima e sipërfaqes së Forzës, materialet e rrotave të Trackmania), përndryshe sipërfaqja e xhiros (shih [disiplina dhe sipërfaqja](race-loading-laps.md#discipline-and-surface)): asfalt, ose i shkrifët për çdo gjë tjetër. Kthesat, zakonet e driftit dhe pragjet mbahen të ndara për asfaltin dhe për tokën e shkrifët.

### Rrëshqitja, si shumëfish i maksimumit nominal të gomës {#slip-as-a-multiple-of-the-tyres-nominal-peak}

Lojërat e shkallëzojnë rrëshqitjen ndryshe; `meta.slip` thotë si, dhe çdo rrëshqitje ndahet me një shkallë, në mënyrë që rreth 1 të jetë maksimumi nominal i gomës:

| `meta.slip` | Kuptimi | Ndahet me |
|---|---|---|
| `peak` | normalizuar nga loja: pas 1 aderenca humbet (Forza Data Out) | 1 |
| `scaled` | rrëshqitja fizike e ndarë me një maksimum asfalti (regjistruesi Kunos) | maksimumi nominal i tokës mbi atë të asfaltit |
| `index` | një masë rrëshqitjeje 0..1 (SlipCoef i Trackmania) | 0,5 |
| `physical` (ose e panjohur) | raporti i rrëshqitjes si thyesë, këndi i rrëshqitjes në radianë | maksimumi nominal i tokës |

Maksimumet nominale, kur nuk dihet asgjë më të mirë:

| Sipërfaqja | Raporti i rrëshqitjes | Këndi i rrëshqitjes |
|---|---|---|
| asfalt | 0,12 | 8° |
| i përzier | 0,18 | 12° |
| i shkrifët (zhavorr) | 0,25 | 15° |
| borë | 0,25 | 15° |
| akull | 0,10 | 6° |

### Ku mbaron aderenca: kthesat e gomave të secilës makinë {#where-grip-ends-each-cars-tyre-curves}

Aty ku një gomë ndalon së dhënë më shumë matet **për secilën makinë**, nga çdo xhiro e ngarkuar e saj (`measureTyres`), veçmas për asfaltin dhe për tokën e shkrifët:

| Kurba | Mostrat (shpejtësia mbi 10 m/s, e qetë, nxitime nën 45 m/s²) | Rrëshqitja (x) | Forca (y) |
|---|---|---|---|
| frenimi | fren mbi 0,3, fren i dorës nën ose e barabartë me 0,2, duke ecur drejt (anësorja nën 30% të më të fortës) | abs(mesatarja e raportit të rrëshqitjes së katër rrotave) | ngadalësimi |
| tërheqja | gaz mbi 0,8, fren nën ose e barabartë me 0,05, drejt, tërheqja e plotë e gazit të makinës me atë shpejtësi mbi 0,5 m/s² | raporti i rrëshqitjes së rrotës më të madhe tërheqëse | nxitimi si pjesë e asaj tërheqjeje |
| përpara | anësorja mbi 30% të më të fortës, aderenca e makinës me atë shpejtësi mbi 1 m/s² | këndi më i madh i rrëshqitjes së përparme | nxitimi anësor si pjesë e asaj aderence |
| prapa | e njëjta | këndi më i madh i rrëshqitjes së pasme | e njëjta |

"Më i fortë" është përqindja e 99-të e abs(nxitimit anësor) të xhiros në atë tokë (e gjithë toka, kur ka më pak se 50 mostra). Transmisioni vendos rrotat tërheqëse (para për FWD, prapa për RWD, të gjitha për AWD; të panjohur: të gjitha).

Nga të paktën **150 mostra**, rrëshqitja ndahet në 6 deri 14 kosha të barabartë me numër (një për çdo 40 mostra); forca e secilit koshë është kuartili i tij i sipërm (ajo që dha goma kur shoferi e kërkoi), e butësuar mbi koshat fqinjë. Më i miri është koshi me më shumë forcë; **kufiri** është koshi i parë pas tij ku forca ka rënë **8%**. Një kurbë që nuk bie kurrë në të dhënat ka kufi pa fund - të kalosh "maksimumin" nuk kushton asgjë në atë lojë, dhe vetëm rrëshqitja nuk shënon asgjë atje (kurbat e kthesës dhe të tërheqjes së Forza Horizon janë kështu). Me pak mostra në një tokë, përdoren ato të tokës tjetër; me pak mostra gjithsej, kufiri **nominal**: 1,5 herë maksimumi nominal.

Secila makinë merr gjithashtu:

- **zakonin e driftit**: kuartilin e sipërm të këndit të driftit kudo ku kthehet në 60% të më të fortës ose më shumë (duhen 100 mostra);
- **timonin për kurbaturë** (`steerGain`), për çdo brez shpejtësie 5 m/s: mediana e abs(timoni) / kurbatura e shtegut ndërsa kthehet fort, por mirë brenda aderencës së vet (30-60% të më të fortës, kurbatura më e ngushtë se rreze 400 m, timoni mbi 0,02; 25 mostra për brez). Kurbatura e shtegut është shpejtësia e rrotullimit mbi shpejtësi aty ku loja dërgon shpejtësi rrotullimi, përndryshe nga pozicionet ±5 m.

## Zbulimi, lloj për lloj {#detection-kind-by-kind}

| Lloji | Prova (mbi mostrat në lëvizje dhe të qeta) | `peak` dhe `limit` |
|---|---|---|
| **bllokim** | fren mbi 0,05, fren i dorës jo mbi 0,2, dhe raporti i rrëshqitjes së ndonjë rrote nën kufirin e frenimit negativ | rrëshqitja më negative (shumëfish i maksimumit nominal); kufiri si negativ |
| **patinim** | gaz mbi 0,2 (ose pa kanal gazi), dhe raporti i rrëshqitjes së një rrote tërheqëse mbi kufirin e tërheqjes | rrëshqitja më e madhe tërheqëse; kufiri |
| **mbidrejtim** (kënd drifti) | këndi i driftit mbi më të madhin ndërmjet dyshemesë së sipërfaqes dhe 1,5 × zakonit të driftit të makinës atje | këndi më i madh i driftit, radianë |
| **mbidrejtim** (këndet e rrëshqitjes, pa kënd drifti) | këndi më i madh i rrëshqitjes së pasme mbi kufirin e pasmë dhe më shumë se 0,25 mbi më të madhin e përparmes | këndi i rrëshqitjes së pasme (shumëfish i maksimumit) |
| **mbidrejtim** (pa kënd drifti, por me shpejtësi rrotullimi dhe nxitim anësor) | "shpejtësia e qëndrimit" - abs(shpejtësia e rrotullimit) minus abs(nxitimi anësor) / shpejtësia, mbi 8 m/s - mbi 0,2 rad/s, me timonin kundër kthesës | rad/s; kufiri 0,2 |
| **rrotullim** | një vrapim mbidrejtimi kur këndi i driftit ka arritur mbi **60°** | si mbidrejtimi |
| **nëndrejtim** (këndet e rrëshqitjes) | jo duke rrëshqitur, këndi më i madh i rrëshqitjes së përparme mbi kufirin e përparmë dhe më shumë se 0,3 mbi atë të pasmes | këndi i rrëshqitjes së përparme; kufiri |
| **nëndrejtim** (pa këndet e rrëshqitjes) | më shpejt se 12 m/s, jo duke rrëshqitur, jo duke kundërtimonuar, nxitimi anësor mbi gjysmën e më të fortës së xhiros (përqindja e 99-të), rruga më e ngushtë se rreze 300 m, dhe timoni më shumë se **1,6 herë** ajo që thotë timoni për kurbaturë i vetë makinës se shtegu kërkonte | sa herë timoni i nevojshëm; kufiri 1,6 |
| **abs**, **tc** | `absActive` / `tcActive` mbi 0,5 | - |
| **handbrake** | `handbrake` mbi 0,2 | - |
| **airborne** | `airborne` mbi 0,5 | - |
| **goditje**, **përplasje** | shih [Goditjet dhe përplasjet](#hits-and-crashes) | shpejtësia që mori goditja |

Pragjet e driftit sipas sipërfaqes: asfalt **7°**, i përzier **10°**, i shkrifët dhe borë **15°**, akull **10°**. Një makinë që rrëshqet më shumë si gjë e zakonshme - një model gome arkade, një specialist zhavorri - ka pragun e vet, më të lartë, nga xhirot e saj (1,5 × zakoni i saj).

**Nga cila anë kthehet makina** (për "kundër kthesës"): ndryshimi i drejtimit të shtegut të vetë xhiros mbi ±6 m (të paktën 2 pika të rrjetit); më i ngushtë se rreze 600 m numërohet si kthesë; djathtas ose majtas sipas asaj nëse bota është e pasqyruar. Timoni është **kundër** kthesës kur abs(timoni) > 0,05 dhe shenja e tij është e kundërt me kthesën - një rrëshqitje që **kapet** me timon të kundërt.

**Pedalet siç filluan** (`pedal`): *fren* kur frena është mbi 0,1; *gaz* mbi 0,3; *lëshuar* kur gazi ishte mbi 0,5 brenda 8 pikave të rrjetit (16 m) para; *pa pedal* përndryshe (ose kur nuk ka kanal gazi).

## Vënë përballë xhiros tjetër {#laid-against-the-other-lap}

Çdo ngjarje gjykohet kundrejt xhiros me të cilën krahasohet xhiro e zgjedhur në atë segment (më e shpejta e klasës së saj; për vetë atë xhiro, cilido nga klasa e vet ishte më i shpejti në segment):

1. **Sa larg shkoi xhiro tjetër** mbi të njëjtët metra, ±8 m: ngjarjet e vetë xhiros tjetër të të njëjtës familje (një rrotullim numërohet si mbidrejtim, një përplasje si goditje), të matura në të njëjtat njësi, pa pragje, duke përdorur kurbat e gomave të makinës tjetër.
2. **Të përbashkëta** kur xhiro tjetër shkoi **80%** aq larg ose më shumë: kështu drejtohet kthesa, jo si gabim. Llojet që nuk janë gabime janë gjithmonë "të përbashkëta".
3. **Kosto**, për një gabim që nuk është i përbashkët: koha që humbi kjo xhiro kundrejt tjetrës nga 5 m para ngjarjes deri në **40 m pas** saj (për goditje ose përplasje, deri sa makina ta marrë përsëri shpejtësinë - metrat për ta rifituar me tërheqjen e vet, 40 deri 400 m; pa tërheqje të matur, 5 m/s²). Kurrë negative.
4. **Shpejtësia e humbur** ndaj kufirit të makinës: për një bllokim, ngadalësimi që tregon makina se mund të bëjë me atë shpejtësi minus atë që bëri, i mbledhur gjatë ngjarjes; për patinim, tërheqja e saj e plotë me gaz minus atë që bëri; për një goditje, shpejtësia që mori. Thuhet kur është mbi 0,5 m/s (1,8 km/h).

Një gabim që nuk është i përbashkët dhe kushtoi të paktën **0,02 s** shfaqet në listë ([statistikat e garës](race-course-statistics.md) numërojnë vetëm gabimet prej **0,03 s** ose më shumë, që një gabim i numëruar në shumë xhiro të jetë i qartë), dhe mund të bëhet shkaku i humbjes së një kthese (shih [Analiza kthesë për kthesë](race-corner-analysis.md#car-control-faults-and-impacts)).

## Goditjet dhe përplasjet {#hits-and-crashes}

`impacts.ts` i lexon goditjet nga **mostrat e vetë xhiros**, para se të rimostrohen - një goditje mbaron në qindra të sekondës. Gomat nuk mund t'i bëjnë forcat e një goditjeje, ndaj një goditje matet kundrejt vetë makinës së xhiros:

- **Aderenca e saj `G`**: përqindja e 99-të e nxitimit horizontal `√(lat² + long²)` gjatë xhiros, në tokë dhe më shpejt se 5 m/s. Pa kanale nxitimi (ose nën 3 m/s²), 15 m/s² - aderenca e një makine rrugore.
- **Pragu**: `max(1,8 G, G + 18, 30)` m/s².
- **Mostra e goditur**: nxitimi horizontal mbi pragun *dhe* që kërcen më shumë se gjysma e `G` nga mostra e mëparshme; **ose** shpejtësia që bie, brenda 0,1 s, më shumë se sa do të merrte pragu në 0,1 s plus 1,5 m/s. Vetëm në tokë dhe e qetë, dhe vetëm kur makina ishte më shpejt se 5 m/s.
- Mostrat e goditura brenda **0,4 s** janë një goditje e vetme.
- **Para / pas**: shpejtësia më e lartë në 0,15 s para; më e ulëta deri 0,3 s pas mostrës së fundit të goditur.
- **Nuk është goditje**: shpejtësia humbet pa forcë prapa saj - nxitimi maksimal horizontal brenda 0,1 s nën më të madhin ndërmjet `G` dhe 25 m/s² - është loja që rikthen ose rifillon makinën.
- **Përplasje** kur mori **30 km/h** ose më shumë, ose i la makinës më pak se gjysmën e shpejtësisë së saj; **goditje** përndryshe - një trokitje, një gërvishtje përgjatë një muri.
- **Drejtimi**: nxitimi gjatësor më i madh se ai anësor, dhe negativ: *përballë*; pozitiv: *nga prapa*; anësori më i madh: *përgjatë anës*. Pa nxitime, përballë.

Ajo që mund të bëjë një makinë matet me çdo goditje të lënë jashtë, nga 0,1 s para saj deri 1 s pas (`struckMask`).

## Tekstet {#the-texts}

Çdo ngjarje përshkruhet duke emërtuar të dyja xhirot, me vendin (metrat përgjatë referencës), shpejtësinë me të cilën filloi, sa larg kaloi kufirin kundrejt xhiros tjetër, dhe një këshillë. Këshilla rrjedh nga lloji dhe ajo që u mat:

| Ngjarja | Këshilla |
|---|---|
| bllokim, vetëm para | një e para e bllokuar nuk mund të drejtohet: pak presion në fillim të zonës, lëshoje në kthesë |
| bllokim, vetëm prapa | një e pasme e bllokuar e lë makinën të rrotullohet: fren më shumë në drejtim, lëshoje gazin kur hyn në kthesë; zhvendose ndarjen e frenimit përpara nëse përsëritet |
| bllokim, toka e shkrifët | një rrotë e bllokuar pjek: shtrëngo pak para bllokimit |
| bllokim, ndryshe | shumë pedal për aderencën: shtrëngo më gradualisht |
| patinim | fute gazin ndërsa timoni zhbëhet, ndërro marsh shkurt aty ku kufizon tërheqja (në tokë të shkrifët: një marsh më i lartë e zbut momentin rrotullues) |
| rrotullim / mbidrejtim | sipas pedalit: nën frenim (frenim i tepërt gjatë kthesës, ulje marshi shumë herët), i lëshuar (mbidrejtim me lëshim: mbaj një gaz të qëndrueshëm), mbi gaz (shumë ndërsa je ende i kthyer), asnjë (u kthye shumë shpejt); "kapur me timon të kundërt" kur u kundërtimonua; në tokë të shkrifët ose në rally, "një kënd është rruga e shpejtë - kthimi tjetër mjaftoi" |
| nëndrejtim | timoni më shumë nuk bën asgjë kur para ka shkuar: arrij më ngadalë, mbaj pak fren për të ngarkuar përparmen, zhbëj; në tokë të shkrifët, kthe makinën me lëshim ose me një prekje të këmbës së majtë |
| goditje / përplasje | përgjatë anës: një metër hapësirë kushton më pak se gërvishtja; nga prapa: një makinë tjetër ose rrëshqitje prapa; një përplasje përballë: fren më herët; një trokitje në përparme: ka prekur diçka. "X goditi edhe aty." kur është e përbashkët |

Në Trackmania, një rrëshqitje thotë gjithashtu: nën rreth **400 km/h** (**300** në tokë të shkrifët: dhe, bar, plastikë) një rrëshqitje jep më pak tërheqje sesa kapja e aderencës; mbi këtë, një rrëshqitje me shpejtësi në kënd të duhur fiton, dhe kjo e kushtoi kohë, pra kënda ishte gabim.

## Çfarë lejon çdo burim {#what-each-source-allows}

| Xhirot mbajnë | Bllokimet / patinimi | Mbidrejtimi / rrotullimi | Nëndrejtimi |
|---|---|---|---|
| rrëshqitja e secilës rrotë dhe këndi i rrëshqitjes, shpejtësia e makinës (Forza Data Out, lojërat AC) | nga rrëshqitja | nga këndi i driftit, ose nga këndi i rrëshqitjes së pasme | nga këndet e rrëshqitjes |
| shpejtësitë e rrotave, shpejtësia në botë (lojërat rally, BeamNG) | nga rrëshqitja e llogaritur | nga këndi i llogaritur i driftit | nga timoni për kurbaturë |
| yaw dhe shpejtësia e yaw, pa rrëshqitje (iRacing) | - | nga këndi i driftit (yaw i përshtatur kundrejt drejtimit të lëvizjes); nga shpejtësia e qëndrimit me kundërtimon vetëm kur yaw nuk mund të besohet | nga timoni për kurbaturë |
| vetëm drejtimi | - | nga drejtimi kundrejt lëvizjes | nga timoni për kurbaturë |
| vetëm një skedar xhiroje FH Companion (pa yaw, pa rrëshqitje) | - | - | nga timoni për kurbaturë (ka timon dhe nxitime) |

Goditjet dhe përplasjet kërkojnë vetëm shpejtësi (më mirë me nxitime), kështu që çdo burim i ka. Seksioni **Kontrolli i makinës** tregon çfarë lejon çdo burim: me një skedar xhiroje FH Companion vetëm, shtytjet e tij nga timoni dhe goditjet e tij, dhe shënimin për të ngarkuar `.tele.gz` për pjesën tjetër.
