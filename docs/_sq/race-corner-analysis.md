---
title: "Analiza kthesë për kthesë"
parent: "Analiza e garës"
nav_order: 55
lang: "sq"
source: "race-corner-analysis.md"
source_hash: "ec67c3430951"
translated: true
outdated: false
---

# Analiza kthesë për kthesë

Dy xhiro të së njëjtës pistë krahasohen kthesë për kthesë. Për çdo kthesë shikuesi thotë kush ishte më i shpejtë, sa kohë vlente dhe pse - frenoi shumë herët, e mori gazin vonë, mori një linjë më të gjerë - kështu që di çfarë të praktikosh së pari.

![Një gjetje e hapur te Ku të përmirësohesh, pranë tabelës Kthesë pas kthese](../assets/img/en/race-corner-finding.webp)

Një shembull i punuar: në kthesën 3, Driver A frenon 20 m më herët se Driver B dhe humb 0.15 s për të arritur atje, por është me gaz më herët dhe fiton 0.15 s gjatë daljes. Neto 0.00 s: kthesa është e barabartë, dhe askujt nuk i thuhet të frenojë më vonë.

## Çfarë shihni {#what-you-see}

### Ku të përmirësohesh {#where-to-improve}

Seksioni i shiritit anësor për xhirin e fokusuar ("Ngarko të paktën dy xhiro të së njëjtës pistë." deri atëherë).

**Koka:** "<lap> <time> kundrejt <reference> <time>" dhe diferenca e kohës së xhirit - ose, për referencën, "kundrejt xhirit tjetër më të shpejtë në çdo kthesë (…)" dhe totalin që humbi. Pranë saj, humbja e ndarë në *drejtim* dhe *makinë / kontekst*.

**Shiriti i zbërthimit:** koha e humbur sipas grupit të shkakut (frenim, hyrje, dalje, drejtëz, makinë, kontekst), në ngjyrat e shkaqeve, me legjendë.

**Gjetjet**, tre lista:

1. Humbjet e shoferit, më të kushtueshmet e para, deri **12** - ose "Askund ku të drejtuarit ndryshe do të fitonte kohë nuk dallohet."
2. **Shfaq sa kushtoi makina ose situata (X s)** - humbjet e makinës dhe të kontekstit, deri 8 (të ndezura si parazgjedhje).
3. **Ku <lap> është më e shpejtë, ose e barabartë ndryshe (N)** - fitimet dhe kthesat e barabarta, deri 10 (të ndezura si parazgjedhje).

Çdo gjetje shfaq renditjen e saj, titullin (kthesën dhe çfarë ndodhi, me koston për një humbje), rreshtin e vendimit, koston (fitimet me minus) me një shirit, dhe një etiketë: *frenim*, *hyrje*, *dalje*, *drejtëz* (humbjet e shoferit, me "· makinë X" kur makina shpjegon 0.02 s ose më shumë), *makinë*, *kontekst*, *më e shpejtë*, *e barabartë*. **Kliko një** për të rreshtuar makinat 40 m para saj, për ta kornizuar dhe riluajtur, dhe për të hapur matjet e saj:

- **Frenimi:** ku frenoi (ose lëshoi) secili dhe nga çfarë shpejtësie, dhe sa metra më herët ose më vonë (nga 5 m);
- **Më e ngadalta:** shpejtësia minimale e secilit xhiro dhe ku;
- **Gaz i plotë:** ku ishte secili me gaz të plotë, dhe sa më herët ose më vonë;
- **Linja:** diferenca e fillimit të kthesës, rrezet më të ngushta, sa brenda ose jashtë, dhe forma e linjës së secilit xhiro dhe kulmi i tij;
- **Drejtëza deri te kthesa tjetër:** gjatësia e saj, të dy shpejtësitë aty ku të dyja ishin me gaz të plotë, çfarë humbi ose fitoi dhe prej çfarë - shpejtësia e nisjes, tërheqja më e fortë e tjetrit, një lëshim i gazit, shpejtësia e humbur, si u drejtua (pjesët nga 0.02 s);
- **Makina:** sa prej humbjes është makina, dhe nga çfarë (tërheqja, aderenca, frenat; kur 0.02 s ose më shumë);

pastaj këshilla, **Makinat:** (në makina të ndryshme, shih [Profilet e makinave](race-car-profiles.md#what-the-cars-decide-in-a-corner)), dhe këshilla për linjën.

### Kthesë pas kthese {#corner-by-corner}

Një tabelë (me dy ose më shumë xhiro), një rresht për segment, për klasën e xhirit të fokusuar kur ka disa klasa:

| Kolona | Tregon |
|---|---|
| Kthesa | `T3`, `T11-T12` |
| Më e shpejta | xhiroja më e shpejtë përmes saj (koha e vet nga fillimi i segmentit deri në fund) |
| me | avantazhi i saj mbi të dytën më të shpejtë, s |
| linja | forma dhe kulmi i xhirit më të shpejtë ("V · i vonuar", "U/V · mesi"); kalo me miun për rrezet e saj më të ngushta, të hyrjes dhe të daljes; "të dy drejtimet" për një kompleks të përzier |
| (xhiro e fokusuar) | sa pas më të shpejtës ishte, ose ✓ kur ishte më e shpejta |

Klikimi i një rreshti hap gjetjen e xhirit të fokusuar aty (ose rreshton makinat 40 m para segmentit). Nën tabelë, kur çdo kthesë ka një kohë: "Më e shpejta përmes çdo kthese, e bashkuar: <time> (± në referencë / në më të mirën e klasës X)" - segmentet më të mira plus vrapimi më i shpejtë deri te kthesa e parë, kur ai është një pjesë e veçantë.

## Si llogaritet {#how-it-is-worked-out}

Rregulli udhëheqës: **një kthesë vlerësohet e tërë**, nga zona e frenimit për të deri te zona e frenimit për të radhën. Një xhiro që frenon më herët për ta kthyer makinën dhe për ta vënë në gaz më shpejt kreditohet për daljen që ka blerë, dhe nuk i thuhet të frenojë më vonë.

## Një bosht distance {#one-distance-axis}

Xhirot krahasohen sipas distancës, jo kohës - një sekondë prapa, dy xhiro janë në kthesa të ndryshme. As sipas odometrit të secilit xhiro (një linjë më e ngushtë mbulon më pak metra). Rruga e përshkuar e **referencës** është boshti:

- Çdo mostër e xhirove të tjerë **projektohet** mbi rrugën e referencës: çdo mostër merr `s`, sa larg është përgjatë referencës, dhe `d`, sa larg në të majtë (pozitiv) ose djathtas. Kërkimi shkon përpara nga përputhja e mëparshme (8 segmente rruge prapa deri 40 përpara), kështu që një xhiro që kalon mbi ose nën vetveten nuk kapet kurrë te kryqëzimi tjetër. Mostra e parë kërkohet në çerekun e parë të rrugës (në një pistë, nisja dhe arritja përkojnë); kur asgjë nuk është brenda 30 m, merret pika më e afërt kudo që nuk është pas përputhjes së fundit (pas një rrotullimi ose një dalje jashtë rrugës). `s` nuk ulet kurrë: një mostër që projektohet pas së mëparshmes mbahet.
- Çdo kanal **ri-mostrohet** mbi një rrjet të vetëm, **çdo 2 m**, në mënyrë lineare; kanalet që hapen (marshi, flamujt) merren me mostrën më të afërt. Jashtë intervalit të vetë xhiros vlerat janë bosh.
- Mostrat e para dhe të fundit të një xhiro projektohen pak brenda skajeve të referencës, kështu që çdo xhiro **mbahet deri 15 m** përtej skajeve të veta me shpejtësinë që kishte (koha rritet sipas distancës pjesëtuar me shpejtësinë, pjesa tjetër mbetet), kështu që delta e saj në vijën e nisjes është diferenca e kohës së xhirit.
- `delta` = koha e xhirit në çdo pikë të rrjetit minus ajo e referencës: hendeku. `lateral` = `d` në rrjet.

Koha që një xhiro humbi më shumë se tjetra midis dy pikave të rrjetit është diferenca e deltave të tyre: `rel(s)`. Gjithçka më poshtë ndërtohet mbi të.

## Kthesat {#corners}

Gjenden në **referencë** (`findCorners`), me shpejtësinë e saj të zbutur mbi ±6 m dhe lakimin e saj (ndryshimi i drejtimit mbi ±5 mostra, i zbutur mbi ±10 m):

1. **Minimumet e shpejtësisë me prominencë.** Një pikë që është më e ulëta brenda ±40 m, kur rënia nga shpejtësia më e lartë në secilën anë (përpara një minimumi më të ulët) është të paktën `max(2.5 m/s, 6% e shpejtësisë)`.
2. **Thyerjet.** Një kulm lokal lakimi më i ngushtë se rreze **300 m**, pa minimum shpejtësie brenda 80 m: një thyerje e marrë me gaz të plotë është akoma kthesë për t'u drejtuar.
3. **Fazat.** Nga çdo kulm prapa, ndërsa referenca po frenon (> 0.1) ose nuk është me gaz të plotë (< 0.95): hyrja; përpara, ndërsa nuk është me gaz të plotë: dalja. Një thyerje e marrë e sheshtë merr ±30 m. Kthesat që mbivendosen mbahen veçmas, por bëhen të mbulojnë xhiron.
4. Të numëruara T1, T2 … sipas radhës së xhirit; **majtas ose djathtas** sipas shenjës së lakimit dhe nëse bota është e pasqyruar (e panjohura konsiderohet e pasqyruar).

**Dritarja e kthesës** (ku referenca kthehet): nga pika më e ngushtë brenda ±40 m nga kulmi, përtej aty ku lakimi mbetet mbi një të gjashtën e kulmit të tij, plus 10 m nga secila anë. Ana e saj jep shenjën e "brendshmes".

## Segmentet: nga zona e frenimit deri te zona e frenimit {#segments-braking-zone-to-braking-zone}

Çdo kthesë zotëron rrugën gjysmë deri te kulmet në secilën anë. Brenda saj:

- **Pika më e ngadaltë e secilit xhiro** është një zhytje e vërtetë në shpejtësinë e tij - asgjë më e ngadaltë brenda 6 m (3 pika rrjeti) në secilën anë, duke parë përtej skajeve të pjesës, kështu që dalja e kthesës së mëparshme që ende përshpejton drejt saj nuk merret kurrë për të - kërkohet nga 15 m para dritares së kthesës deri 10 m pas saj. Një xhiro që aty kurrë nuk ngadalësoi vendoset te kulmi.
- **Ku filloi një xhiro të ngadalësojë për të** (`entryOf`): prapa nga pika e saj më e ngadaltë, përmes frenimit ose lëshimit, mbi çaste gazi të plotë, deri sa kishte këmbën poshtë (gazi ≥ 0.95, fren ≤ 0.1) për **10 m**; një gaz i rimarrë në **30 m** e fundit para pikës më të ngadaltë i përket ende kthesës; me gaz të plotë gjatë gjithë kohës, vetë pika më e ngadaltë. Një xhiro pa kanal gazi, ose që nuk e kishte këmbën poshtë që nga kthesa e mëparshme, fillon te pika e vet më e shpejtë në mes.
- **Segmenti fillon** te e para nga të gjitha xhirot që fillojnë të ngadalësojnë për të (4 m më herët), dhe shkon deri në fillimin e tjetrit, kështu që frenimi i çdo xhiro është brenda tij dhe segmentet mbulojnë xhiron.

**Komplekset.** Kthesat njëra pas tjetrës që referenca nuk i drejton kurrë me gaz të plotë midis - më pak se **40 m** gaz i plotë - janë një segment, "T11-T12", i drejtuar si një; një kompleks mban deri **tre** kthesa (një pjesë me kthesa të shumta që nuk shkon kurrë e sheshtë fillon një të re). Një kompleks që kthehet në të dy drejtimet është *i përzier*: për të nuk matet asnjë formë e vetme linje.

**Në një pistë** (referenca mbaron brenda 50 m nga ku filloi), drejtëza e fundit vazhdon përtej vijës deri te pika e parë e frenimit: vrapimi i një xhiro të fluturuar nga vija llogaritet me kthesën e fundit. Një xhiro që filloi nga qëndrimi ose nga një nisje gare (shih [Nisja](#the-start)) e mban atë vrapim veç.

### Ku të çon kthesa {#what-a-corner-leads-onto}

Matet në referencë: metrat me gaz të plotë pas kthesës (nga gazi i saj i plotë deri në fund të segmentit, plus vrapimi përtej vijës) dhe para saj (`pas`-i i segmentit të mëparshëm, ose nga fillimi).

| Lloji | Rregulli |
|---|---|
| **midis dy drejtëzave** (`both`) | 200 m ose më shumë **para** **dhe** 120 m ose më shumë pas |
| **në një drejtëz** | 200 m ose më shumë pas, ose 120 m ose më shumë pas dhe të paktën aq sa para |
| **pas një drejtëze** | 200 m ose më shumë para |
| **lidhje** | çdo gjë tjetër |

## Çfarë bëri secili xhiro në një kthesë {#what-each-lap-did-in-a-corner}

`cornerMetrics`, për xhiro dhe segment, në rrjet (hap 2 m). Pedalet: frenimi numërohet mbi 0.1; gazi i plotë është 0.95 e lart.

| Matja | Rregulli |
|---|---|
| **pika e frenimit** | frena e parë nën të cilën gazi u hoq (nën 0.5), ose që zgjati **15 m** - një prekje e këmbës së majtë me fuqinë të ndezur nuk është aty ku filloi frenimi; me vetëm prekje, prekja e parë |
| **heqje gazi** | pa frenim, pika e parë ku gazi ra nën 0.8 |
| (pa pedale) | pika ku xhiroja filloi të ngadalësonte (më sipër) |
| **lëshimi i frenit** | frena e fundit deri 30 m pas pikës më të ngadaltë |
| **shpejtësia te pika e frenimit**, **metrat e frenimit** | deri te pika më e ngadaltë |
| **frenimi maksimal**, **ngadalësimi maksimal** | mbi zonën e frenimit (përshpejtimet mbi 45 m/s² injorohen) |
| **frenim në kthesë** (trail braking) | metrat me fren > 0.05 dhe \|timon\| > 0.1 |
| **rrëshqitja e bllokimit** | raporti më negativ i rrëshqitjes së rrotës në zonë (kur xhiroja ka rrëshqitje) |
| **pika më e ngadaltë**, **shpejtësia minimale** | si më sipër |
| **gazi i ndezur** | pas lëshimit (ose pikës më të ngadaltë), gazi i parë > 0.15 pa fren |
| **gaz i plotë** | pika e parë pas kësaj e mbajtur ≥ 0.95 për 10 m |
| **lëvizja me inerci** | metrat nga lëshimi deri te gazi i ndezur, me fren dhe gaz të dyja nën 0.05 |
| **rënie gazi** | sa herë gazi ra më shumë se 0.25 nën kulmin e tij gjatë, midis gazit të ndezur dhe gazit të plotë |
| **anësor maksimal** | përshpejtimi anësor më i madh nga 20 m para lëshimit deri te më e vonshmja nga gazi i plotë dhe 20 m pas pikës më të ngadaltë |
| **marshi te kulmi** | te pika më e ngadaltë |
| **rrëshqitja me fuqi** | rrëshqitja më e madhe e rrotës me fuqi midis gazit të ndezur dhe gazit të plotë |
| **balanca** | këndi i rrëshqitjes përpara minus atë të pasmes përmes mesit (+ nënvirazh) |
| **drejtëza me gaz të plotë** | pjesa e segmentit pas gazit të plotë (dhe vrapimit përtej vijës) me ≥ 0.95; heqja më e gjatë mbi të |
| **shpejtësia e humbur** | shpejtësia më e madhe e humbur nga një pikë e lartë me gaz ≥ 0.9, pa fren, në tokë |
| **zhvendosja në hyrje** | këndi më i madh i devijimit nga pika e frenimit deri 5 m pas pikës më të ngadaltë, në tokë |
| **frena e dorës** | ku u aktivizua (> 0.2), deri 10 m pas pikës më të ngadaltë |
| **ajri** | sekondat në ajër mbi segmentin, dhe fluturimi i tij më i gjatë |

## Me kë krahasohet secili xhiro {#who-each-lap-is-compared-with}

- Një xhiro krahasohet me **xhirin më të shpejtë të plotë të klasës së vet të performancës** (referenca, në klasën e referencës).
- Vetë ai xhiro më i mirë i klasës (dhe referenca) krahasohet, segment për segment, me **cilindo xhiro tjetër të klasës së vet që ishte më e shpejtë** përmes tij - ose me çdo xhiro, kur është vetëm në klasën e vet.

Harta e kohës, hendekët në listën e xhirove, ngjarjet e kontrollit të makinës dhe tabela e kthesave ndjekin të njëjtën krahasim.

## Llogaria e kohës së një kthese {#the-time-account-of-a-corner}

`compareCorner`, për një xhiro kundrejt tjetrës mbi një segment:

- **neto** = `rel(end) - rel(start)` (plus vrapimi përtej vijës në një xhiro të fluturuar): vendimi. Më pak se **0.03 s** është **e barabartë**.
- **Ndarja** - ku brenda kthesës u kthye udhëheqësi: në pjesën nga pika e parë e frenimit ose pika më e ngadaltë e secilit xhiro, deri te më e vonshmja midis pikave të tyre me gaz të plotë dhe më të ngadalta, lëkundja më e madhe që xhiroja më pas dha ose fitoi përsëri, kur kjo lëkundje është mbi **0.04 s**; përndryshe, më e vonshmja nga dy pikat më të ngadalta.
- **Te kulmi** = `rel(split) - rel(start)`; **pas tij** = neto minus atë. Kur të dyja janë të paktën 0.04 s dhe me shenja të kundërta, xhiroja **e shkëmbeu** një për tjetrën.
- Pas tij ndahet përsëri aty ku të dy xhirot janë me gaz të plotë: **dalja** (ndarja deri te gazi i plotë më i vonshëm) dhe **drejtëza** (nga aty deri në fund).
- **Drejtëza** ndahet në tre:
  - *shpejtësia e daljes* (`byExit`) - e matur, jo e modeluar: makina më e ngadaltë kalon shpejtësinë fillestare të makinës më të shpejtë pak më poshtë drejtëzës, dhe nga aty gjurma e vet është ajo që do të kishte bërë nga kjo shpejtësi, me marshin, rezistencën dhe pjerrësinë e vet brenda. E zhvendosur prapa në atë pikë (dhe e vazhduar me shpejtësinë e saj të fundit për metrat që fiton) është koha e vet nga nisja më e shpejtë; diferenca është kostoja e shpejtësisë së daljes. Kur makina më e ngadaltë kurrë nuk e arrin atë shpejtësi (ose vetëm në 2 mostrat e fundit), përshpejtimi i vet përgjatë pjesës kthehet si fuqi (`a·v` e mbajtur), kurrë më fort se sa tregon zarfi i saj me atë shpejtësi (dyfishi i përshpejtimit të matur pa zarf).
  - *tërheqja e makinave* (`byPower`) - vetëm në makina të ndryshme: të dy makinat nga e njëjta shpejtësi mbi të njëjtat metra, me gaz të plotë, duke integruar përshpejtimin me gaz të plotë që ka treguar secila te çdo shpejtësi.
  - *si u drejtua* (`driven`) - pjesa tjetër: një heqje gazi, shpejtësia e humbur me gaz të plotë.

  Shpejtësia e daljes kurrë nuk shpjegon më shumë sesa kushton drejtëza (dhe kurrë me shenjë të kundërt), përveç kur një heqje gazi ose shpejtësi e humbur kthen diçka prapa. Një xhiro **hoqi gazin** në drejtëz kur pjesa e saj me gaz të plotë është nën të dyja 0.9 dhe pjesën e tjetrës minus 0.05. Shpejtësia e humbur numërohet kur të dyja ndryshojnë me më shumë se 1 m/s. Një mospajtim nën 0.02 s në shenjë vendoset në 0.

Neto e çdo segmenti shton deri në diferencën e kohës së xhirit, dhe kulmi-dhe-pas i çdo kthese shton deri në neton e saj (testet kontrollojnë të dyja).

### Pjesa e makinës {#the-cars-share}

Vetëm kur xhirot janë në **makina të ndryshme** dhe xhiroja humbi kohë (`carShare`):

- **tërheqja**: tërheqja e makinave përgjatë drejtëzës (më sipër), deri te humbja;
- **aderenca**: kur xhiroja ishte në kufirin e makinës së vet (përshpejtimi anësor në mes të paktën **90%** e asaj që mban makina me atë shpejtësi) dhe makina tjetër mban më shumë se **5%** më shumë: nga shpejtësia minimale më e ulët që nuk shpjegohet nga një rreze më e ngushtë, pjesa `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)` e humbjes së mbetur;
- **frenat**: kur xhiroja frenoi (nuk hoqi gazin), makina tjetër frenon **5%** më fort, dhe ngadalësimi mesatar i xhirit mbi zonën ishte të paktën **80%** e asaj që mund të bëjë makina e vet: nga `u` poshtë te `v` me `a1` kundrejt `a2`, duke mbaruar në të njëjtën pikë, `(1/a1 - 1/a2)(u - v)² / 2u`, deri në atë që mbetet.

Kostoja e makinës është shuma, deri në humbjen.

### Vendimi dhe gjetja {#the-verdict-and-the-finding}

`cornerFinding` shkruan të shumtën një gjetje për xhiro dhe kthesë, duke i provuar në këtë renditje:

| Rasti | Gjetja | Rezultati |
|---|---|---|
| neto brenda ±0.03 s, një shkëmbim, ana më e vogël ≥ **0.1 s** | **e barabartë, dy rrugë përmes** - kush ishte ngadalë në hyrje dhe i shpejtë në dalje, kush e kundërta; me një drejtëz pas saj (në një drejtëz, ose midis dy), rruga ngadalë-në-hyrje-shpejt-në-dalje është ajo mbi të cilën ndërtohet: mbaje gazin e saj të hershëm, fito përsëri hyrjen duke frenuar më fort, jo më vonë | e barabartë |
| neto brenda ±0.03 s përndryshe | asgjë nuk thuhet | - |
| fitoi, një shkëmbim, humbi deri te kulmi | **ngadalë në hyrje, shpejt në dalje u shpërblye**: mbajeni, këtu dalja vlen më shumë | fitim |
| fitoi, një shkëmbim, fitoi deri te kulmi | **më i shpejtë në hyrje**: hyrja është e drejtë, një gaz i plotë më i hershëm do të mbante më shumë | fitim |
| fitoi, dhe xhiro tjetër ka humbje këtu | **më i shpejtë - për shkak të asaj që bëri tjetri**, shkaku dhe këshilla e tij thoshin "Për xhirin tjetër: …" | fitim |
| fitoi ndryshe | **më i shpejtë në hyrje / dalje**, sipas cilës gjysmë fitoi më shumë (frenim më vonë, shpejtësi më e madhe përmes mesit; ose e sheshtë më herët, tërheqje më e fortë) | fitim |
| humbi, dhe një **goditje ose përplasje** kushtoi të paktën `max(0.05 s, 40% të humbjes)` | goditja është historia e kthesës, para makinave | humbje |
| humbi, dhe **pjesa e makinës** është 60% ose më shumë | **makina**: tërheqja e saj përgjatë drejtëzës, aderenca përmes mesit, ose frenat e saj - pjesa më e madhe; me pjesën e shoferit (≥ 0.03 s) thënë si "Tjetri X s: …" | humbje |
| humbi, dhe një **gabim i kontrollit të makinës** i pandarë kushtoi të paktën `max(0.05 s, 40%)` | ai gabim (shih më poshtë), me si lëvizi koha rreth tij | humbje |
| humbi, dhe një **fluturim më i gjatë** kushtoi të paktën `max(0.05 s, 40%)` | fluturimi | humbje |
| humbi, një shkëmbim, fitoi deri te kulmi | **shumë i shpejtë në hyrje, i ngadaltë në dalje**: shkaku i daljes; jepe pak hyrjen për t'u kthyer dhe për të qenë e sheshtë më herët, me pikat e frenit dhe të gazit të plotë të xhirit tjetër. Rrënja e tij (`cause`, që numërojnë [statistikat](race-course-statistics.md)): frenim më vonë, kur frenoi disa metra më vonë se tjetri; përndryshe shkaku i daljes | humbje |
| humbi, një shkëmbim, humbi deri te kulmi | **i dha më shumë hyrjes sesa fitoi dalja përsëri**: shkaku i hyrjes, që është edhe rrënja e tij (`cause`); mbaje daljen, humb më pak në hyrje | humbje |
| humbi, hoqi gazin në drejtëz, dhe pjesa e drejtuar mbi gjysmën e humbjes | **jo me gaz të plotë në drejtëz**: pjesa e tij me gaz të plotë krahasuar me tjetrin, ku dhe sa gjatë ishte heqja | humbje |
| humbi, tërheqja e makinave mbi 60% të humbjes dhe drejtëza mbi gjysmën | **tërheqja e makinës përgjatë drejtëzës** (me tërheqjen e të dy makinave në 160 km/h) | humbje |
| humbi përndryshe | shkaku i gjysmës që humbi më shumë (deri te kulmi ≥ pas tij: i hyrjes; përndryshe i daljes). Më e ngadaltë në dalje vetëm sepse më e ngadaltë përmes mesit (me më shumë se 1 m/s): në vend të kësaj shkaku i mesit | humbje |

Një gjetje për humbje mund të mbyllet edhe me **Gjithashtu:** - shpejtësi e humbur me gaz të plotë, ose një heqje gazi në drejtëz - kur pjesa e drejtuar e drejtëzës kushtoi më shumë se 0.04 s dhe kjo nuk ishte tashmë shkaku.

Gjetjet renditen: fillimisht humbjet, më të kushtueshmet e para; pastaj fitimet dhe kthesat e barabarta.

### Shkaqet në hyrje {#causes-on-the-way-in}

`entryCause`, i pari që zbatohet (diferencat e shpejtësisë minimale janë në m/s; "5 m" është pragu që një pikë më herët ose më vonë të numërohet):

| # | Shkaku (gabimi) | Rregulli |
|---|---|---|
| 1 | një goditje ose përplasje në hyrje | një goditje e pandarë që fillon brenda 10 m pas pikës më të ngadaltë |
| 2 | **pothuajse ndalur** (incident) | shpejtësia më e ngadaltë nën **60%** të asaj që lejon aderenca e kësaj makine aty ku tjetra kaloi (`v_other · √(grip_mine / grip_other)` kur makina tjetër ka më shumë aderencë, përndryshe shpejtësia e tjetrës), xhiroja tjetër mbi 8 m/s - një rrotullim, kontakt ose një kthesë e humbur |
| 3 | një defekt i kontrollit të makinës në hyrje | një bllokim, shtytje, rrotullim ose rrëshqitje e pandarë jo me gaz, që fillon deri 10 m pas pikës më të ngadaltë, kosto ≥ 0.02 s |
| 4 | një fluturim më i gjatë përpara pikës më të ngadaltë | shih [rali](#rally-rotation-and-flights) |
| 5 | **hoqi gazin** kur tjetri mbeti i sheshtë ose e hoqi 5 m ose më vonë | ky xhiro vetëm hoqi gazin |
| 6 | **frenoi aty ku tjetri vetëm hoqi gazin** ose mbeti i sheshtë | dhe ishte më i ngadaltë me më shumë se 0.5 m/s përmes mesit |
| 7 | **frenoi butë** | frenoi (nuk hoqi gazin), kishte vend të frenonte më fort - me të dhëna gomash, rrëshqitja e bllokimit nën **60%** të rrëshqitjes ku frenat e kësaj makine japin më të mirën; pa to, ngadalësimi maksimal nën **85%** të asaj që tregon te kjo shpejtësi - pedali nën 0.95, dhe ngadalësimi maksimal i xhirit tjetër më i lartë se **15%** |
| 8 | **frenoi herët** - ose **frenat e makinës** | frenoi më shumë se 5 m para tjetrit. Në një makinë tjetër frenat e së cilës janë mbi 5% më të fuqishme, dhe me jo më shumë se 10 m rezervë kundrejt distancës që i duhet kësaj makine me ngadalësimin e vet: frenat e makinës. Përndryshe frenoi herët, me "Frenoje më vonë - rreth N m" (në një makinë tjetër, metrat përtej asaj që i duhen) |
| 9 | **lëvizi me inerci** | më shumë se 10 m pa asnjë pedale, dhe 5 m më shumë se tjetri |
| 10 | **më ngadalë përmes mesit** | më shumë se 0.5 m/s më ngadalë te pika më e ngadaltë; ndahet me `v² = a·R` (më poshtë) |
| 11 | **arriti më ngadalë** | mbi 1 m/s më ngadalë te pika e frenimit, pa frenuar herët: u vendos më parë - nga kthesa para dhe tërheqja e makinës, ose nga një fluturim në kthesën para që ishte 0.2 s më i gjatë. E makinës kur makinat ndryshojnë |
| 12 | më ngadalë te kulmi | përndryshe: lësho frenin më butë dhe mblidh më shumë shpejtësi në mes |

**Më ngadalë përmes mesit** (`middleSplit`): rrezja e secilit xhiro në pikën e vet më të ngadaltë matet nga rruga e vet (±8 m), përshpejtimi i tij anësor si `v²/R`, dhe

`ln(v_other / v_mine) = ½ ln(a_other / a_mine) + ½ ln(R_other / R_mine)`.

- Rrezja shpjegon **gjysmën ose më shumë**: **vijë shumë e ngushtë** - "përdor më shumë rrugën", me të dy rrezet dhe pjesën.
- Te kufiri i makinës (duke rrëshqitur mbi 10° devijim në asfalt / 20° në të shkrifët, ose përshpejtim anësor të paktën 90% të asaj që mban te kjo shpejtësi) dhe makina tjetër ka më shumë se 5% më shumë aderencë: **aderenca e makinës**; mbro daljen në vend të kësaj.
- Duke rrëshqitur përmes saj (devijim mbi 10° / 20°) dhe xhiro tjetër jo (devijimi i hyrjes i tij të paktën 4° më pak): **anash** - përtej aderencës së vet, jo nën të; arrij pak më ngadalë. Thuhet si e makinës kur kjo makinë kap pasmen të paktën një herë më shumë në xhiro se tjetra.
- Në një makinë tjetër që mban nën **96%** të aderencës së tjetrës, dhe xhiroja mbajti brenda 1 m/s të `v_other · √(grip_mine / grip_other)`: **aderenca e makinës** - "frenimi më vonë nuk do ta mbyllë atë".
- Përndryshe **aderencë rezervë**: përshpejtimi anësor krahasuar me tjetrin në një rreze të ngjashme, dhe ajo që mban kjo makinë; merr më shumë shpejtësi te kulmi. Aty ku pasma e kësaj makine lëshon para se aderenca e saj të përdoret plotësisht (rrëshqitjet e saj fillojnë nën 85% të aderencës së saj, dhe xhiroja ishte në 80% të asaj), gjej pjesën tjetër në hapa të vegjël.

### Shkaqet në dalje {#causes-on-the-way-out}

`exitCause`, i pari që zbatohet:

| # | Shkaku (gabimi) | Rregulli |
|---|---|---|
| 1 | një defekt i kontrollit të makinës në dalje | rrëshqitje e pandarë e rrotës, rrotullim, rrëshqitje ose goditje që mbaron në ose pas 10 m para pikës më të ngadaltë |
| 2 | **shpejtësi e humbur** | mbi 1 m/s më shumë shpejtësi e humbur me gaz të plotë sesa tjetri; mbi **7 m/s (25 km/h)** "më shumë si kontakt ose rrotullim sesa rrëshqitje" |
| 3 | **e ktheu makinën gabim** (toka e shkrifët) | shih [rali](#rally-rotation-and-flights) |
| 4 | **në gaz më vonë** | gazi i ndezur më shumë se 5 m më vonë, numëruar edhe nga pika e vet më e ngadaltë e çdo xhiroje (një xhiro me pikën më të ngadaltë më vonë nuk fajësohet për gaz më vonë) |
| 5 | **ngurroi me gazin** | më shumë rënie gazi sesa tjetri |
| 6 | **shkoi gjerë dhe priti** | mbi 1.5 m jashtë tjetrit aty ku të dy ishin të sheshtë, dhe gaz i plotë më vonë se 5 m nga pika e vet më e ngadaltë |
| 7 | **gaz i plotë më vonë** | gaz i plotë më vonë se 5 m, nga pika e vet më e ngadaltë gjithashtu; me përshpejtimin e makinës aty |
| 8 | **drejtimi i makinës** | në një makinë tjetër që tërhiqet nën 95% të tjetrit në atë shpejtësi, dhe tërheqja shpjegoi një pjesë të drejtëzës |
| 9 | **më ngadalë jashtë kthesës** | përndryshe: një kulm më i vonshëm, që makina është e drejtë më herët |

Kur dy xhiro ishin në marsh të ndryshëm te pika më e ngadaltë, këshilla përfundon me "Marshi N te kulmi; tjetri përdori M."

### Defektet e kontrollit të makinës dhe goditjet {#car-control-faults-and-impacts}

Një defekt i [Ngjarjeve të kontrollit të makinës](race-control-events.md) si shkak: një bllokim është shkak *frenimi*, rrotullimi i rrotave ose rrëshqitja me gaz një shkak *dalje*, pjesa tjetër *hyrje*; një goditje pas pikës më të ngadaltë është *dalje*, përpara saj *hyrje*. Këshilla është e vetë ngjarjes, pastaj "Kushtoi rreth X s deri 40 m pas saj" (ose "deri kur makina mori përsëri shpejtësinë" për një goditje). Një bllokim me një pikë frenimi më shumë se 5 m më herët sesa tjetri shton që xhiroja frenoi herët edhe - me rrotat që rrotulloheshin nuk do të kishte nevojë për këtë.

### Rali: rrotullimi dhe fluturimet {#rally-rotation-and-flights}

Në **tokë të shkrifët**, me devijime këndi në të dy xhiro, dhe ky xhiro me gaz (ose të sheshtë) më shumë se 5 m më vonë:

- **E ktheu makinën më pak**: tjetri e kishte makinën të kthyer **12°** ose më shumë te pika e vet më e ngadaltë dhe të paktën **8°** më shumë se ky xhiro. Këshilla: një heqje ose një prekje e frenit të këmbës së majtë ndërsa kthehet, me pikën e frenës së dorës së tjetrit kur vetëm ai e përdori, ose frenën e dorës në një kthesë më të ngadaltë se 15 m/s (54 km/h).
- **E ktheu tepër**: ky xhiro e kishte të kthyer 12° ose më shumë dhe të paktën **12°** më shumë se tjetri: duhej të drejtohej para se të mund të jepej gazi.

**Fluturim më i gjatë**: në ajër 0.2 s ose më shumë më i gjatë se tjetri, duke kushtuar të paktën 0.03 s nga 10 m para ngritjes deri 40 m pas uljes (ose fundit të segmentit). Përpara pikës më të ngadaltë është shkak hyrjeje; bëhet historia e kthesës kur shpjegon 40% ose më shumë. Këshilla: mbaje gazin të ndezur në ngritje, merr kreshtën pak më ngadalë ose me një prekje frenimi.

### Nisja {#the-start}

Para kthesës së parë, në një sprint ose kur njëri nga xhirot filloi nga qëndrimi (nën 5 m/s aty ku të dy janë të parët në bosht) ose në një nisje gare (nën 60% të shpejtësisë së tjetrit), vrapimi deri te pika e parë e frenimit është gjetja e vet (kthesa 0) kur ndryshon me më shumë se 0.03 s: *Nisja*, *Fillimi i garës* ose *Deri te kthesa e parë*. Një humbje aty i vihet situatës (*kontekst*) kur njëri xhiro filloi nga një nisje gare dhe tjetri me shpejtësi, makinës kur xhirot janë në makina të ndryshme, dhe shoferit përndryshe. Këshillat: në një makinë tjetër nga qëndrimi, "kryesisht makina"; një nisje e ndalur me të njëjtën makinë, nis me më pak rrotullim të rrotës dhe ndërro në majën e kurbës së fuqisë; një nisje garë, krahaso me një xhiro tjetër të parë; një nisje në lëvizje (flying start), një dalje më e mirë nga kthesa e fundit mbartet përtej vijës.

## Linja e përshkuar {#the-driven-line}

`lineMetrics`, për xhiro dhe segment (jo për komplekse të përziera), vetëm nga pozicionet (të zbutura ±2 mostra) mbi dritaren e kthesës:

| Matja | Rregulli |
|---|---|
| lakimi | ndryshimi i drejtimit mbi ±8 m të rrugës së vet të xhirit |
| **rrezja më e ngushtë** | 1 / lakimi maksimal |
| **hyrja e kthesës** / **dalja** | ku lakimi kalon për herë të parë / për herë të fundit një të pestën e kulmit të tij |
| **mesi** | ku xhiroja kishte kthyer gjysmën e ndryshimit të drejtimit të vet |
| rrezja në / jashtë | metrat e drejtuar mbi gjysmën e ndryshimit të drejtimit, para / pas mesit |
| **forma** | rrezja më e ngushtë mbi rrezen mesatare gjatë kthimit: nën **0.55** një **V**, mbi **0.75** një **U**, midis "U/V" |
| **kulmi** | rrezja në dalje mbi rrezen në hyrje: mbi **1.25** e vonuar, nën **0.8** e hershme, përndryshe mesi |
| **kulmi i shpejtësisë** | pika më e ngadaltë më shumë se **15 m** para mesit: ngadalë në hyrje, shpejt në dalje; më shumë se 15 m pas: ende duke ngadalësuar përtej mesit |

Kundrejt xhirit tjetër: sa brenda (+) ose jashtë ka vrapuar në hyrje të kthesës, përmes pjesës më të ngushtë dhe aty ku të dy ishin të sheshtë (thuhet nga 1 m); ku secili filloi të kthehej (thuhet nga 8 m).

### Cila linjë i përshtatet kësaj makine këtu {#which-line-suits-this-car-here}

`lineFor`, nga ku të çon kthesa dhe karakteri i makinës në këtë kthesë:

- **fuqia-ndaj-aderencës** = përshpejtimi i makinës me gaz të plotë te shpejtësia në dalje, pjesëtuar me aderencën e saj te shpejtësia minimale (nga zarfi i saj). **Pika dhe gjuaj** te **0.45** dhe më lart; **momentum** te **0.25** dhe më poshtë.
- **forca poshtë**: aderenca te 151-252 km/h pjesëtuar me aderencën te 54-108 km/h prej **1.15** ose më shumë, për një kthesë të marrë në **144 km/h** (40 m/s) ose më shpejt - atëherë është një kthesë momentum, pavarësisht fuqisë. Nuk gjykohet në tokë të shkrifët.

| Lloji i kthesës | Makina | Linja |
|---|---|---|
| pas një drejtëze | pika dhe gjuaj / tjetër | V / U, kulmi në mes: "zona e frenimit është çmimi" |
| midis dy drejtëzave | momentum / tjetër | U / V, kulm i vonuar |
| lidhje | momentum / tjetër | U / V, kulmi në mes: "drejtoje për daljen e së radhës" |
| që të çon në drejtëz | momentum (ose një kthesë e shpejtë me forcë poshtë) | U e gjerë e rrumbullakët, kulm pak i vonuar |
| që të çon në drejtëz | pika dhe gjuaj | V: frenim i drejtë, kthim i vonuar, rrotullim në një mes të shkurtër e të ngushtë, drejtëz herët |
| që të çon në drejtëz | midis të dyjave | U me kulm të vonuar: ngadalë në hyrje, shpejt në dalje |

Aty ku dalja ka rëndësi (që të çon në drejtëz, midis dy), transmisioni shton një fjali: **FWD** - rrotullojeni me frena, shtoni fuqi vetëm kur rrota zhvendoset; **RWD** me një fuqi-ndaj-aderencës prej 0.35 ose më shumë - drejtoje para gazit të plotë; **AWD** - mund të marrë fuqi ndërsa kthehet ende. Në tokë të shkrifët çdo linjë shton: kthe makinën në hyrje.

Fjalia thotë pastaj çfarë drejtoi xhiroja dhe nëse përputhet: *pika më e ngadaltë e vonuar e lidh daljen* ose *një kulm i hershëm e lidh daljen* aty ku kërkohej kulm i vonuar dhe xhiroja nuk u vonua në kulm, as nuk ishte më e ngadalta herët; *më e rrumbullakët sesa do kjo makinë* aty ku kërkohej V; *më e mprehtë sesa do kjo makinë* aty ku kërkohej U; përndryshe *kjo përshtatet*.

## Për zhvilluesit {#for-developers}

Kodi: [`src/race/analysis.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/analysis.ts),
[`align.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/align.ts),
[`segments.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/segments.ts),
[`line.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/race/line.ts),
[`src/ui/race/RacePanel.tsx`](https://github.com/Holdi601/3DHeat/blob/main/src/ui/race/RacePanel.tsx).
Arsyetimi dhe burimet e tij: [metoda](race-analytics.md).
