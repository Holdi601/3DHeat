---
title: "Analitika e garës: metoda"
parent: "Analiza e garës"
nav_order: 58
lang: "sq"
source: "race-analytics.md"
source_hash: "82cd1c042f37"
translated: true
outdated: false
---

# Analiza e garës: metoda

Shkurtimisht:

- Xhirot krahasohen **sipas distancës**, jo sipas kohës, që i njëjti vend në pistë të përputhet.
- Çdo kthesë vlerësohet **e tërë**, nga zona e frenimit deri te zona e frenimit e radhës.
- Koha e humbur **ndahet** sipas vendit ku u humb (frenim, hyrje, dalje, drejtëz) dhe sa prej saj e shpjegon makina.
- Shkaku **shpjegohet me fjalë**, me këshilla.
- Për ta përdorur, jo për të lexuar si funksionon: shih [Analiza e garës](race-analysis.md).

Kjo është metoda pas skedës **Analiza e garës**: çfarë mat, si vendos ku shkoi koha dhe si e kthen atë në këshilla. Është specifikimi që ndjek kodi i analizës (`src/race/`), kështu që çdo rregull këtu ka një pjesë përkatëse atje dhe një test që e fikson.

## Çfarë bëjnë mjetet profesionale {#what-the-professional-tools-do}

Mjetet e njohura pajtohen për të njëjtën bazë dhe ndryshojnë kryesisht sa shkojnë drejt *shkaqeve*:

- **Çdo gjë krahasohet sipas distancës, jo kohës.** Dy xhiro riprovohen mbi një bosht të vetëm distance; diferenca në vazhdim e kohës së kaluar në të njëjtën distancë është *delta* (MoTeC e quan time variance, të tjerët time slip ose delta trace). Pjerrësia e saj thotë ku humbet koha tani: një pjerrësi e butë është përshpejtim, rezistencë ajri ose aderencë e qëndrueshme; një pjerrësi e thellë është diferencë frenimi ose gazi; një valë lart-e-poshtë është një shkëmbim mes shpejtësisë në hyrje dhe asaj në dalje.
  ([MoTeC i2](https://www.motec.com.au/i2/i2highlights/),
  [analiza e kohës së sektorëve](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html),
  [lap-delta-analyzer](https://github.com/taishiliu25/lap-delta-analyzer))
- **Çdo kthesë ndahet në faza**: frenim, hyrje, mes, dalje - pika e frenimit, frenimi maksimal dhe lirimi, shpejtësia minimale dhe ku ndodh, marshi, fillimi i gazit, kthimi në gaz të plotë, shpejtësia në dalje.
  ([Driver61: gjashtë fazat](https://driver61.com/uni/corner-phases/),
  [udhëzuesi i analizës së xhirit iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php))
- **Mini-sektorë për çdo kthesë dhe një kohë teorike më të mirë**, e bashkuar nga më të shpejtët e secilit.
  ([Sim Racing Telemetry](https://docs.simracingtelemetry.com/manual/session-laps),
  [Overcut](https://overcut.gg/))
- **Linja e përshkuar krahasohet gjithashtu**, por kurrë vetëm: "një vijë mbi një imazh nuk do të thotë asgjë derisa të dish faktorët që kontribuojnë" - lexohet kundër gjurmës së shpejtësisë dhe deltës.
  ([Track Titan: si analizohet telemetria](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing),
  [Sim Racing Telemetry: linjat e garës](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines))
- **Shkaku rrënjë, jo simptoma.** A është humbja në drejtëz vërtet nga gazi, apo një hyrje e keqe e detyroi gazin të vonohej? Gabimet renditen sipas kostos në kohën e xhirit dhe shpjegohen me gjuhë të thjeshtë.
  ([Track Titan: rrjedhat e trajnimit](https://www.tracktitan.io/post/november-2025-update-coaching-flows))

### Çfarë shkoi keq në versionin e parë, dhe pse ka rëndësi {#what-went-wrong-in-the-first-version-and-why-it-matters}

Versioni i parë i ngarkonte çdo *faze* veç e veç dhe shikonte vetëm humbjet. Një xhiro që frenoi më herët humbi kohë në fazën e frenimit, dhe i thuhej të frenonte më vonë - edhe kur ai frenim më i hershëm e kthente makinën më shpejt, e vinte në gaz më herët dhe e nxirrte nga kthesa më shpejt, dhe e fitonte gjithçka përsëri gjatë drejtëzës. Në një test, xhirit që e bëri këtë i tha të "frenonte shumë më vonë", ndërsa tjetri - që kishte frenuar më vonë - e kishte humbur pikën e mesit, kishte dalë jashtë dhe kishte humbur pikërisht aq sa kishte fituar. Të dhënat e kohës thoshin se dy rrugët ishin të barabarta; këshilla thoshte të kundërtën.

Rregulli që pajtohen të gjitha burimet më sipër është: **një kthesë vlerësohet e tërë**, nga zona e frenimit për të deri te zona e frenimit për tjetrën, sepse "herë pas here, humbja e disa milisekondave në një kthesë mund ta përmirësojë kohën e përgjithshme të xhirit, duke lejuar segmente më të shpejta më pas"
([Biasing the driving style of an artificial race driver](https://arxiv.org/abs/2504.12744)).

## Njohuri për garat që rregullat i përfshijnë {#racing-knowledge-the-rules-encode}

**Shpejtësia në dalje ka më shumë rëndësi se shpejtësia në hyrje**, dhe më shumë sa më e gjatë të jetë drejtëza pas saj: "koha e kaluar në drejtëza mbizotëron kohën e kaluar në kthesa", dhe një mungesë shpejtësie në dalje bartet deri te pika e radhës e frenimit. Rruga më e shpejtë nëpër një kthesë dhe drejtëz është shpesh të hyhesh më ngadalë në kthesë, që gazi të vijë më herët - *ngadalë në hyrje, shpejt në dalje*.
([Race & Track Driving: sekuenca për përmirësimin e kohës së xhirit](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/),
[Driver61: prioritetet e kthesave](https://driver61.com/uni/prioritising-corners/))
Një planifikues i kohës minimale që shpërblehet edhe për shpejtësinë në dalje i zhvendos pikat e mesit më vonë dhe merr një xhiro *më të shpejtë*; shpërblimi që balancon të dyja është `L / v²` për njësi shpejtësie në dalje, për një drejtëz me gjatësi `L` me shpejtësi `v` - koha që kushton një ndryshim shpejtësie gjatë drejtëzës rritet me gjatësinë e saj dhe bie me katrorin e shpejtësisë
([arXiv 2504.12744](https://arxiv.org/abs/2504.12744)).

**Kthesat sipas asaj ku të çojnë.** Një që të çon në drejtëz: maksimizo shpejtësinë në dalje, pikë mesi e vonë, gaz sa më shpejt. Një në fund të drejtëzës: maksimizo shpejtësinë me të cilën hyn në të, frenim sa më vonë, pikë mesi më e hershme është e pranueshme. Një ndërmjet dy kthesash: kompromis për atë që ka rëndësi pas saj. Një kthesë që mund të jetë njëra ose tjetra trajtohet si një që të çon në drejtëz. Kthesat më të shpejta peshojnë më shumë: me shpejtësi të lartë makina përshpejton dobët, dhe një km/h e humbur nuk kthehet më.
([Allen Berg: tre llojet e kthesave](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/),
[Driver61: prioritetet e kthesave](https://driver61.com/uni/prioritising-corners/),
[Driver61: kthesa të ndryshme, teknika të ndryshme](https://driver61.com/uni/different-corner-technique/))

**Rrethi i aderencës.** Një gomë ka një buxhet të vetëm aderence, që shpenzohet për frenim, kthim dhe përshpejtim në çfarëdo përzierjeje; shpejtimi total është `sqrt(lat² + long²)`. Frenimi në kthesë ndjek kufirin e tij: frenimi lirohet ndërsa timoni dhe ngarkesa anësore rriten.
([rrethi i aderencës](https://www.yourdatadriven.com/friction-circle-introduction/),
[diagrama g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/))

**Lëvizja me inerci** - asnjë pedale e shtypur - është mënyra më e ngadaltë për të humbur shpejtësi, dhe një tregues kyç performance i matshëm në vetvete.
([Racecar Engineering / OptimumG: faktori i inercisë](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf))

**Rrëshqitja.** Forca gjatësore arrin kulmin me një raport rrëshqitjeje rreth 10-20%, pastaj bie; përtej saj rrota bllokohet nën frenim ose rrotullohet nën gaz. Forza raporton rrëshqitjen e normalizuar: 0 do të thotë aderencë e plotë, një madhësi mbi 1 do të thotë aderencë e humbur.
([rrëshqitja gjatësore](https://www.sciencedirect.com/topics/engineering/longitudinal-slip),
[Forza Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation))

**Nënvirazh dhe mbivirazh.** Kënd rrëshqitjeje i përparmi më i madh se i pasmi është nënvirazh; i pasmi më i madh se i përparmi është mbivirazh. Pa kënde rrëshqitjeje: makina kthehet më pak nga sa kërkon timoni (timoni mbi këndin Ackermann `L/R` që i duhet makinës me shpejtësi të ulët).
([nënvirazhi, përmbledhje](https://www.sciencedirect.com/topics/engineering/understeer),
[Nënvirazhi dhe mbivirazhi](https://en.wikipedia.org/wiki/Understeer_and_oversteer))

## Gjeometria e një linje {#the-geometry-of-a-line}

Shpejtësia që mund të mbajë një makinë në një rreze `R` është `v = sqrt(a R)`, ku `a` është përshpejtimi anësor që i japin gomat (plus atë që shton forca e poshtme, që rritet me `v²`). Kështu **shpejtësia rritet me rrënjën katrore të rrezes**: një linjë përmes mesit në një rreze 20% më të madhe është rreth 10% më e shpejtë atje.
([shpejtësia maksimale në kthesë](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html),
[formula1-dictionary: kthesat](https://www.formula1-dictionary.net/cornering_tech.html))

**Linja gjeometrike** është harku më i madh përmes një kthese: nga skaji i jashtëm, duke prekur brendësinë në pikën e mesit, dhe përsëri në skajin e jashtëm. Për një kthesë që kthehet për `θ` në një rrugë me gjerësi `w` (minus gjerësinë e makinës), një hark tangjent me të dy skajet e jashtme dhe që prek kulmin e brendshëm ka `R = w / (1 - cos(θ/2))` (plus rrezen e vetë skajit të brendshëm) - për një kënd të drejtë rreth `3.4 w`, për një kthesë të mprehtë (hairpin) `w`. Kjo është arsyeja që përdorimi i gjerësisë ka më shumë rëndësi në kthesat e mesme dhe më pak në kthesat e mprehta.
([Linja e garës](https://en.wikipedia.org/wiki/Racing_line))

**Pika e vonuar e mesit** hyn më vonë dhe më thellë, fillimisht me rreze më të ngushtë, dhe e hap rrezen gjatë daljes: më ngadalë në mes, drejtëz më shpejt, e sheshtë më herët - "një shpejtësi minimale pak më e ulët, por një profil përshpejtimi më i fortë në dalje". **Pika e hershme e mesit** është e kundërta: më shpejt në hyrje, dhe një rreze që ngushtohet gjatë daljes dhe e mban gazin mbrapa - kryesisht një gabim, përveç në aderencë shumë të ulët, ku shpejtësia e humbur në hyrje nuk mund të rikthehet në dalje.
([Linja e garës](https://en.wikipedia.org/wiki/Racing_line),
[Fjalori i telemetrisë së garës](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/),
[matematika e linjës së garës](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/))

**"V" dhe "U".** U është linja klasike e rrumbullakët: rrezja më e gjerë, ndryshimi më i vogël i timonit. V hyn më herët, shkon më thellë, e rrotullon makinën shpejt në mes dhe e drejton daljen për një vijë më të drejtë: frenimi mbetet i drejtë (kështu mund të jetë më i vonshëm), shpejtësia minimale është më e ulët por arrihet më vonë, gazi i plotë vjen shumë më herët.
([Track Titan: linja V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide))

**Lakimi kundrejt distancës.** Linja më e shpejtë është një kompromis mes rrugës më të shkurtër dhe asaj me lakim më të vogël; në gjerësinë e një pisteje garash lakimi ka më shumë rëndësi, dhe një linjë me lakim minimal i afrohet linjës së kohës minimale kudo ku makina është në kufirin e saj - ndahet prej saj aty ku makina mund të përshpejtonte.
([Planifikimi global i trajektores me kohë minimale](https://www.nature.com/articles/s41598-025-21211-2),
[TUM global race trajectory optimisation](https://github.com/TUMFTM/global_racetrajectory_optimization))

**Kthesat njëra pas tjetrës** - një kulm i dyfishtë, një shikane - janë një problem: linja e daljes së njërës është linja e hyrjes së tjetrës, dhe ato drejtohen prapa nga ajo që të çon në drejtëz.
([Driver61: kthesa të ndryshme, teknika të ndryshme](https://driver61.com/uni/different-corner-technique/))

## Cila linjë i përshtatet cilës makinë {#which-line-suits-which-car}

Ajo që vendos është **fuqia e makinës kundrejt aderencës së saj** me shpejtësitë e asaj kthese - "momentumi është aderenca kundrejt fuqisë, një çështje raporti".
([Ross Bentley: makinat me momentum](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/),
[momentum mbi fuqinë e kalit](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/))

| Makina, në këtë kthesë | Linja | Pse |
|---|---|---|
| Përshpejton fort për aderencën e vet ("pika dhe gjuaj") | V: frenim i drejtë dhe i vonë, rrotullim në një mes të shkurtër e të ngushtë, drejtëz dhe e sheshtë herët | koha fitohet me gaz të plotë, jo me shpejtësinë minimale |
| Përshpejton dobët për aderencën e vet ("momentum") | U e gjerë, pikë mesi pak e vonë, mban shpejtësinë minimale lart | nuk mund të rifitojë shpejtësinë që humb |
| Midis të dyjave | ngadalë në hyrje, shpejt në dalje: U me pikë mesi të vonuar | kompromisi klasik |
| Kthesë e shpejtë, dhe më shumë me forcë poshtë | U, afër linjës gjeometrike | përshpejtimi është i dobët me shpejtësi; aderenca nga forca poshtë rritet me `v²`, kështu që shpejtësia gjatë mesit paguhet dy herë |
| Aderencë shumë e ulët (lagësht, borë) | pikë mesi më e hershme | shpejtësia e humbur në hyrje nuk mund të rikthehet në dalje |
| Fuqi shumë mbi aderencën | linja ka më pak rëndësi | tërheqja, jo linja, e kufizon daljen |

"Sa më e shpejtë kthesa, aq më afër linjës gjeometrike; sa më e ngadaltë, aq më shumë e ndryshon me një pikë mesi më të vonë."
([Skip Barber: Going Faster](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html),
[matematika e linjës së garës](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/),
[Track Titan: linja V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide),
[Driver61: aderenca](https://driver61.com/uni/grip/))

Transmisioni ndryshon mënyrën se si drejtohet linja më shumë se vetë linja: një makinë me tërheqje përpara rrotullohet me frena (frenim i kthimit) dhe merr fuqi vetëm kur rrota zhvendoset, ose del gjerë; një makinë e fuqishme me tërheqje të pasme duhet të jetë e drejtë para gazit të plotë, ose pas e shkel; transmisioni në të katër rrotat mund të marrë fuqi edhe ndërsa kthehet, kështu e fillon gazin më herët.
([Teknika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/),
[RWD vs FWD](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/),
[AWD kundrejt RWD në kthesa](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/))

Shikuesi mat raportin fuqi-aderencë të makinës në çdo kthesë nga vetë drejtimi i saj - përshpejtimi me gaz të plotë te shpejtësia në dalje, pjesëtuar me aderencën anësore te shpejtësia minimale - dhe e quan "pika dhe gjuaj" kur është 0.45 ose më shumë, "momentum" kur është 0.25 ose më pak. Një makinë, aderenca e së cilës me 150-250 km/h është mbi 15% më e lartë se aderenca me 55-110 km/h, ka forcë poshtë që punon.

## Metoda {#the-method}

Numrat më poshtë janë arsyetimi. Pragjet që përdor kodi mbahen secili në një faqe, dhe ato faqe janë referenca kur një numër këtu nuk përputhet: [Analiza kthesë për kthesë](race-corner-analysis.md), [Ngjarjet e kontrollit të makinës](race-control-events.md), [Profilet e makinave dhe krahasimi](race-car-profiles.md) dhe [Statistikat e pistës](race-course-statistics.md).

### 1. Një bosht distance {#one-distance-axis}

Xhiro më e shpejtë është referenca, përveç nëse përdoruesi zgjedh tjetër. Rruga e përshkuar prej saj është boshti: çdo mostër e xhiros tjetër projektohet mbi të, duke i dhënë çdo mostre një distancë përgjatë referencës `s` dhe një zhvendosje anësore me shenjë `d`. Projektimi kërkon vetëm përpara nga përputhja e mëparshme, kështu që një xhiro që kalon mbi vetveten nuk kalon kurrë në anën e gabuar të një ure. Xhirot pastaj ri-mostrohen mbi një rrjet të vetëm, çdo 2 m, për çdo kanal. Çdo xhiro mbahet për disa metra të fundit me shpejtësinë që kishte, kështu që delta e saj në vijën e nisjes është diferenca e kohës së xhirit.

### 2. Kthesat, dhe pjesa e secilës kthesë në xhiro {#corners-and-each-corners-share-of-the-lap}

Si gjenden kthesat, segmentet dhe komplekset: [Analiza kthesë për kthesë](race-corner-analysis.md#segments-braking-zone-to-braking-zone).

### 3. Llogaria e kohës së një kthese {#the-time-account-of-a-corner}

Neto, ndarja, shpejtësia në dalje dhe tërheqja e makinave: [Analiza kthesë për kthesë](race-corner-analysis.md#the-time-account-of-a-corner).

### 4. Vendimi, dhe shkaku {#the-verdict-and-the-cause}

Modelet e vendimit dhe shkaqet në hyrje dhe në dalje: [Analiza kthesë për kthesë](race-corner-analysis.md#the-verdict-and-the-finding).

### 5. Makina kundrejt shoferit {#the-car-against-the-driver}

Kur xhirot janë në makina të ndryshme, humbja që e shpjegon makina hiqet, pjesë-pjesë:

- **tërheqja**: makinat nga e njëjta shpejtësi poshtë drejtëzës, si më sipër;
- **aderenca**: nga shpejtësia minimale më e ulët që nuk shpjegohet nga një rreze më e ngushtë, pjesa `½ ln(grip_other / grip_mine) / ln(v_other / v_mine)`, kur xhiroja ishte në kufirin e makinës së vet (90% e asaj që ka treguar me atë shpejtësi);
- **frenat**: nga `u` poshtë te `v`, me ngadalësim `a1` kundrejt `a2`, duke mbaruar në të njëjtën pikë, kushton `(1/a1 - 1/a2)(u - v)² / 2u` - vetëm kur xhiroja frenoi aq fort sa mund makina e saj në zonë mesatarisht, jo vetëm në kulm.

Ajo që mund të bëjë një makinë vjen nga çdo xhiro e ngarkuar e saj: aderenca anësore, frenimi dhe përshpejtimi me gaz të plotë për çdo bin shpejtësie prej 5 m/s (përqindjet e 95-ta, 95-ta dhe 90-ta). Aderenca është ajo që makina **mbajti për gjysmë sekonde** - përshpejtimi anësor i mesatarizuar mbi 0.5 s - jo ajo që preku një mostër e vetme: një bordurë, një rrëshqitje që kthehet, një makinë që kapet, të gjitha e ngrenë për një moment, dhe një makinë që e bën këtë shpesh duket më e aderuar sesa është. (E kontrolluar me xhiro të regjistruara të dy makinave të ndryshme: masa për çdo mostër i vendoste afër; e mbajtur për gjysmë sekonde, i ndan ashtu si i ndajnë kohët e xhirit.) Frenimi dhe tërheqja marrin çdo mostër si medianë të vetes dhe fqinjëve të saj. Ajri, qetësimi pas një uljeje, dhe çdo goditje (seksioni 6) deri sa makina të rikuperohet, lihen jashtë.

**Çfarë lloj makine është secila** (`profile.ts`): nga të njëjtat xhiro,

- **aderenca e mbajtur**: përqindja e 95-të e atij përshpejtimi anësor gjysmë-sekondësh;
- **tërheqja** me gaz të plotë deri 50 km/h, 50-120, 120-200 dhe mbi 200, dhe më e madhja që ka treguar;
- **frenimi** nga 60 në 160 km/h;
- **shpejtësia maksimale**: aty ku pushoi së fituari me gaz të plotë për një sekondë në një drejtëz - e drejtuar drejt, jo një kthesë e gjatë e marrë pa ngadalësuar, ku makina humb shpejtësi me çdo fuqi. Aty ku s'ka pasur drejtëz mjaftueshëm të gjatë, ajo që ende tërhiqte në shpejtësinë më të lartë tregon sa larg ishte. Pa supozim përtej asaj që tregojnë xhirot: një përshtatje e fuqisë mbi shpejtësinë kundrejt zhvendosjes së ajrit e vendosi një makinë rrugore 100 km/h përtej shpejtësisë së saj të vërtetë maksimale, sepse marshi dhe kufizuesi e ndalojnë tërheqjen e makinës shumë përpara se ta bëjë zhvendosja e ajrit;
- **humbja e pasmes**: sa herë në një xhiro rrëshqiti përtej 10° devijimi (20° në terren të shkrifët) me timonin të kthyer kundër kthesës - e kapur me timon të kundërt - sa prej tyre filluan me gaz, dhe në çfarë përqindjeje të aderencës së vet filluan. Një makinë e drejtuar pak anash qëllimisht nuk humb asgjë; një që ka nevojë të kapet, po. Matet njësoj për çdo makinë, që dy makina të mund të krahasohen;
- **balanca**, aty ku xhirot mbajnë këndet e rrëshqitjes: përpara kundrejt pasme, në kufi.

**Makinat e krahasuara** i vendos makinat krah për krah - një tabelë, një fjali për secilën për atë që është makina kundrejt tjetrës ("X përshpejton më mirë, por nuk mund të kthehet aq fort, ka nevojë më shumë distancë për t'u ndalur dhe e humb pasmen më lehtë"), çdo ndryshim që është i qartë (4% aderencë, 5% tërheqje ose frenim, 4 km/h shpejtësi maksimale, një pasmë e kapur të paktën një herë më shumë në xhiro dhe gjysmë herë më shpesh), dhe si të drejtohet secila. Me një makinë, thotë çfarë është ajo makinë.

**Në çdo kthesë**, kur xhirot janë në makina të ndryshme, gjetja thotë se çfarë prej saj vendosin makinat dhe si të përfitohet sa më shumë nga kjo që ke:

- **përmes mesit**: në linjën e makinës tjetër, aderenca e kësaj makine lejon `v_other · √(grip_mine / grip_other)`. Nëse xhiroja e mbante atë, hendeku është vetë makina dhe asnjë pikë frenimi nuk e ndryshon - thuhet kështu, dhe kthesa i vihet makinës e jo shoferit; nëse mbante më pak, pjesa tjetër është e arritshme, dhe thuhet sa. Pastaj ku mund të fitohet koha në vend të saj: në një drejtëz, ose në një makinë me tërheqje më të fortë, pas kulmit - frenim i drejtë, hyrje më vonë, drejtim i hershëm drejt daljes; përndryshe, rreza më e gjerë që lejon rruga, sepse një rreze më e madhe është e vetmja mënyrë për më shumë shpejtësi pa më shumë aderencë;
- **një pasmë që e lëshoi**: këtu, në një makinë që e humb më lehtë se tjetra: çfarë të bëhet me këtë makinë - gazi i futur ndërsa timoni zhvendoset, ose frenimi i lëshuar butë pa hequr gazin në mes të kthesës, sipas mënyrës se si fillojnë rrëshqitjet e saj;
- **drejtëza pas saj**: çfarë mori tërheqja më e fortë e makinës tjetër nga e njëjta shpejtësi, dhe ku mbaroi tërheqja e kësaj makine në të;
- **një pikë frenimi më e hershme** në një makinë që ngadalëson më pak fort.

Xhiro që rrëshqiti përmes mesit të kthesës (përtej 10° devijimi në asfalt) ishte përtej aderencës së vet, jo pa të: nuk i thuhet kurrë se kishte aderencë rezervë aty. Dhe aty ku pasma e makinës e ka lëshuar në këtë xhiro nga një përshpejtim anësor më i vogël se sa e kërkonte kthesa, "aderenca rezervë" thotë ta gjesh me hapa të vegjël.

### 6. Kontrolli i makinës: bllokimet, rrotullimi i rrotave, rrëshqitjet dhe shtytjet, goditjet dhe përplasjet {#car-control-locks-wheelspin-slides-and-pushes-hits-and-crashes}

Çdo xhiro lexohet edhe për mënyrën se si u drejtua makina - ku u bllokua një rrotë, ku rrotullohej rrota e tërheqjes, ku doli pasma, ku doli gjerë përpara - sepse këto janë gabimet që koha vetëm nuk i emërton. Tri gjëra e mbajnë këtë të qëndrojë në lojëra dhe sipërfaqe të ndryshme.

**Ku mbaron aderenca matet nga vetë drejtimi i makinës.** Inxhinierët vendosin një prag bllokimi për çdo makinë në rrëshqitjen që dha ngadalësimin më të madh (kanalet MoTeC te seria e frenimit e OptimumG përdorin -0.07 për një makinë), jo sipas një vlere librash, dhe vlerat e librave ndryshojnë gjithsesi: forca arrin kulmin me rrëshqitje 5-20% në asfalt, varësisht nga goma dhe modeli, me 6% ose 20-60% në borë, varësisht nga burimi, dhe asnjë burim nuk jep një vlerë për zhavorrin. Lojërat e shkallëzojnë rrëshqitjen ndryshe përsëri: ajo e Forza-s është "e normalizuar", kështu që përtej 1 aderenca humbet - por frenat e një makine mund të japin më të mirën e tyre shumë nën ose shumë mbi 1, dhe zonat e zakonshme të frenimit mund ta kalojnë 1. Kështu për çdo makinë, mbi çdo xhiro të ngarkuar të saj, forca që bëri vendoset në kosha sipas rrëshqitjes me të cilën u drejtua - ngadalësimi kundrejt rrëshqitjes së rrotave me frenim drejt, përshpejtimi (si pjesë e asaj që bën makina me atë shpejtësi) kundrejt rrëshqitjes së rrotave me fuqi, aderenca me kthesë (si pjesë e aderencës së makinës me atë shpejtësi) kundrejt këndit të rrëshqitjes së secilit bosht - dhe kufiri është rrëshqitja përtej pikës më të mirë ku forca ka rënë 8%. Një kurbë që në të dhënat nuk bie kurrë - kthesa dhe tërheqja e Forza Horizon - nuk ka kufi, dhe rrëshqitja vetëm nuk shënon asgjë atje. Me të dhëna të pakta, kufiri është një e gjysmë herë kulmi nominal.

**Toka njihet për çdo mostër**, aty ku lojëra e thotë: Forza e bën rrotën të dridhet në zhavorr, baltë dhe bar (pak mostra në një pistë asfalti, shumë në baltë dhe pista të terrenit), Trackmania e emëron materialin nën çdo rrotë, dhe toka e një faze raliesh gjendet siç thotë seksioni 11. Kthesat, zakonet e rrëshqitjes dhe pragjet mbahen të ndara për asfaltin dhe për tokën e shkrifët.

**Çdo ngjarje vihet përballë xhirit tjetër mbi të njëjtat metra.** Në zhavorr, në borë, në një lojë arkade me shumë rrëshqitje, rrëshqitja është mënyra si merret një kthesë: studimet e kontrollit optimal gjejnë zgjidhje "me pak rrëshqitje" në asfalt dhe "agresive, me shumë rrëshqitje, madje me kundër-timon" jashtë rrugës, të dhënat e ralisë tregojnë goma "shumë brenda zonës jo-lineare", dhe bllokimi i një rrote në tokë shumë të shkrifët mund madje ta ndalë makinën më shpejt. Kështu një ngjarje që e bëri edhe xhiro tjetër - 80% ose më shumë e saj - është mënyra si merret kthesa, jo gabim; dhe një që nuk e bëri, është defekt vetëm nëse kushtoi kohë: koha e humbur nga pak para saj deri 40 m pas saj. Një defekt që shpjegon 40% ose më shumë të humbjes së një kthese bëhet shkaku i asaj kthese.

Pragjet e zbulimit, testi i xhirit tjetër, goditjet dhe përplasjet, dhe tekstet e këshillave: [Ngjarjet e kontrollit të makinës](race-control-events.md).

### 6b. Shumë xhiro: statistikat e pistës {#b-many-laps-the-courses-statistics}

Krahasimi i klasave, çfarë quhet gabim, statistikat dhe harta e gabimeve: [Statistikat e pistës](race-course-statistics.md).

### 7. Linja e përshkuar {#the-driven-line}

Për çdo xhiro dhe kthesë, vetëm nga pozicionet: ku filloi të kthehet (një e pesta e lakimit të tij më të ngushtë), rrezja e tij më e ngushtë (mbi ±8 m), rrezja mesatare mbi gjysmën e parë dhe të dytë të ndryshimit të drejtimit, dhe kështu me radhë:

- **forma**: rreza më e ngushtë kundrejt asaj mesatare nën 0.55 është V, mbi 0.75 është U;
- **kulmi**: rreza në dalje kundrejt rrezes në hyrje mbi 1.25 është i vonuar, nën 0.8 i hershëm;
- **kulmi i shpejtësisë**: pika e tij më e ngadaltë më shumë se 15 m përpara pikës së mesit të kthesës është ngadalë në hyrje, shpejt në dalje; më shumë se 15 m pas, ende duke ngadalësuar përtej mesit.

Kundrejt xhirit tjetër: sa më brenda ose jashtë ka vrapuar në fillim të kthesës, përmes pjesës më të ngushtë dhe aty ku të dyja ishin të sheshta, dhe ku u kthye secila. Çdo gjetje mbyllet me linjën që i përshtatet makinës së xhirit në atë kthesë - sipas asaj ku të çon kthesa dhe fuqisë së matur kundrejt aderencës, forcës poshtë dhe transmisionit - dhe nëse xhiroja e drejtoi. Tabela "Kthesë për kthesë" liston xhirin më të shpejtë përmes çdo kthese me formën e linjës së saj, dhe kthesat më të mira të bashkuara.

### 8. Dy harta {#two-maps}

- **Ku**: pista e ngjyrosur sipas `dΔt/ds` kundrejt referencës, e kuqe aty ku humbet koha dhe jeshile aty ku fitohet.
- **Pse**: çdo humbje e vizatuar aty ku është shkaku i saj, e ngjyrosur sipas grupit të shkakut - frenim, hyrje, dalje, drejtëz, makinë - dhe më e gjerë për një që kushton më shumë.

### 9. Riluajtja {#replay}

Një orë, tri mënyra për ta kthyer atë në kohën e secilit xhiro: nga vija e nisjes, e rreshtuar (çdo xhiro arrin një pikë të pistës në të njëjtin çast, pastaj lirohet) dhe krah për krah (çdo xhiro mbahet në distancën e referencës).

### 10. Nga cili drejtim është bota {#which-way-round-the-world-is}

Bota e shikuesit është e djathtë me Y lart. Një lojë me botë të majtë (Forza ndër to) del e pasqyruar në të: çdo kthesë djathtas vizatohet si majtas, pista dhe xhirot njësoj. Xhirot vetë e thonë këtë - timoni pozitiv është djathtas në çdo adapter, dhe pezullimi i jashtëm i një kthese shtypet - kështu që skeda e garës ofron ta rregullojë, dhe **Kamera & skena → Invert world axis** e bën këtë: X, Y ose Z vizatohen të kundërt. Ndryshon vetëm vizatimi - një reflektim i palosur në matricën e pamjes; kamera fluturon në botën e vizatuar; ndërsa të dhënat, analiza dhe çdo koordinatë që shfaqin mjetet mbeten ato të lojës. Analiza i emëron kthesat majtas ose djathtas me të njëjtën matje.

### 11. Rali: rrëshqitja, këmba e majtë, ajri {#rally-the-slide-the-left-foot-the-air}

Një fazë rali nuk është një pistë e drejtuar me aderencë më të keqe. Në zhavorr dhe borë rrëshqitja është mënyra si merret një kthesë: makina kthehet në hyrje duke zhvendosur peshën e saj - "frenat e zhvendosin peshën e makinës përpara ... gomat e përparme fitojnë aderencë, gomat e pasme e humbin atë, dhe makina rrotullohet duke rrëshqitur në kthesë" - pastaj gazi përsëri kur është "e rreshtuar në drejtimin ku dëshiron të shkosh" ([DirtFish: si të përdoren frenat](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)). Këmba e majtë bën frenimin, që gazi dhe frenat të luhen kundër njëri-tjetrit; frena e dorës e kthen makinën në kthesat e ngushta
([RallySport Ontario: drejtimi i ralisë, bazat](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/),
[Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)),
dhe makina lë tokën. Seksioni 6 lexon rrëshqitjet kundrejt xhirit tjetër; këto rregulla mbartin pjesën tjetër.

- **Toka.** Çfarë thotë xhiroja (`meta.surface`, `--surface` i regjistruesve të ralisë), përndryshe emri i ngjarjes - ralitë në asfalt (Spanjë, Kroaci, Evropa Qendrore, Gjermani, Japoni, Korsikë, Ypres), ato të dimrit (borë), asfalti i Monte-s me borë dhe akull sipër (i përzier) - përndryshe si u drejtua makina. Kufiri anësor i një makine Rally2 është 0.7-0.9 g në zhavorr dhe 1.3-1.4 g në asfalt ([grenzbereich, vlerat referuese](https://github.com/GitCrush/grenzbereich)), dhe në zhavorr ka shumë më tepër devijim (seksioni 6). Kështu, një fazë ku makina tërhoqi 10 m/s² ose më shumë (përqindja e 95-të, me shpejtësi, në tokë) me devijim mesatar nën 6 gradë kudo ku kthehej brenda 70% të asaj, ishte asfalt; çdo gjë tjetër, ose shumë pak për të thënë, është e shkrifët.
- **Çfarë mund të bëjë makina, në tokën ku e bëri.** Aderenca, frenimi dhe tërheqja (seksioni 5) matet veç për asfaltin dhe tokën e shkrifët kur xhirot drejtuan një të pestën ose më shumë të mostrave të tyre në secilën, dhe çdo kthesë vlerësohet me tokën nën makinë në pikën e saj më të ngadaltë. Mostrat në ajër dhe për 0.3 s pas një uljeje lihen jashtë gjithçkaje që mat makinën - zarfet, kurbat e gomave, bllokimet dhe rrotullimet e rrotave: një ulje e tronditë makinën përtej çdo gjëje që mund të bëjnë gomat, dhe rrotat e rrotulluara në ajër nuk janë rrotullim i rrotave. Forca poshtë nuk gjykohet në tokën e shkrifët, ku pjesët e shpejta dhe ato të ngadalta të fazës janë rrugë të ndryshme.
- **Një prekje e këmbës së majtë nuk është frenim.** Një prekje e frenit me gazin ende në gjysmë ose më shumë, mbi më pak se 15 m, e vendos makinën ose e kthen; aty ku një xhiro filloi të frenojë për një kthesë është frena e parë nën të cilën gazi u hoq, ose që zgjati më shumë.
- **Makina u kthye në hyrje.** Për çdo xhiro dhe kthesë, këndi më i madh i devijimit nga frenimi i saj deri 5 m pas pikës së saj më të ngadaltë. Në tokën e shkrifët, një xhiro që e pati makinën të kthyer 8 gradë ose më pak se tjetra (që e kthente 12 ose më shumë) dhe gjeti gazin e plotë më vonë, **e ktheu makinën më pak**: këshilla është të lirohet ose të prekët frenin e këmbës së majtë ndërsa kthehet, që pasma të vijë rrotull - me pikën e frenës së dorës së tjetrës kur e përdori një, ose frenën e dorës në një kthesë më të ngadaltë se 54 km/h - dhe ta kesh të drejtuar drejt daljes para kulmit. Ai që e kthente 12 gradë ose më shumë përtej tjetrës dhe gjithsesi gjeti gazin më vonë, **e ktheu tepër**: duhej të drejtohej para se gazi të mund të rritej. Të dyja janë shkaku i kthesës në dalje, pas një defekti të kontrollit të makinës. Këshilla për linjën në tokën e shkrifët thotë të njëjtën gjë për çdo kthesë.
- **Ajri.** Një fluturim 0.2 s ose më shumë më i gjatë se i xhirit tjetër, që kushtoi kohë nga 10 m para ngritjes deri 40 m pas uljes (ose fundit të kthesës), është shkaku kur shpjegon 40% ose më shumë të humbjes së kthesës; dhe kthesa pas tij, e arritur më ngadalë, e thotë këtë. Në ajër makina nuk mund të kthehet, të frenojë ose të drejtohet. Këshilla e mban gazin të ndezur në ngritje - "mos e hiq gazin gjatë ngritjes", që e ul hundën - dhe e merr kreshtën pak më ngadalë ose me një prekje frenimi, që makina të mbetet e ulët ([DirtFish: how to jump a rally car](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)).
- **Kompleksa me deri në tre kthesa.** Një pjesë me kthesa të shumta që nuk shkon kurrë e sheshtë nuk është një kompleks i gjatë: pas tre kthesash fillon një i ri.

`src/race/rally.test.ts` e mban analizën për të gjitha këto, në faza të drejtuara me një model të thjeshtë: një makinë që u kthye më pak dhe vonë me gaz, një fluturim më i gjatë, prekje me këmbën e majtë, një pjesë me kthesa të shumta, asfalt kundrejt zhavorrit.

## Të dhëna, dhe çfarë lejon secili burim {#data-and-what-each-source-allows}

| Burimi | Shpejtësia | Kanalet | Lejon |
|---|---|---|---|
| FH Companion lap files | ~5 m | pozicioni, shpejtësia, gazi, frenimi, timoni, përshpejtimi gjatësor/anësor, marshi | gjithçka përveç kontrollit të makinës, që ka nevojë për telemetrinë pranë tyre |
| FH Companion `.tele.gz`, pranë çdo skedari xhiro | 64 Hz e lojës (një regjistrues që mban çdo paketë shkruan ~110 në sekondë; përsëritjet hiqen) | e tërë Data Out e Forza: rrëshqitja e secilës rrotë, këndi i rrëshqitjes, rrëshqitja e kombinuar, rrotullimi, pezullimi, dridhja e tokës; shpejtësia në kornizën e makinës; shpejtësia e rrotullimit (yaw) | të gjitha, duke përfshirë kontrollin e makinës |
| Forza Data Out, i regjistruar nga `heat3d_capture telemetry` | 60 Hz | të gjitha të sipërmat, plus për rrotë: temperatura e gomës, rrëshqitja, këndi i rrëshqitjes, rrëshqitja e kombinuar, udhëtimi i pezullimit, shpejtësia e rrotës, shiriti i dridhjes; RPM, fuqia, çifti, shpejtësia e rrotullimit (yaw) | të gjitha |
| Assetto Corsa, ACC, AC EVO, AC Rally (memorie e përbashkët, `heat3d_capture telemetry --game ...`) | 60-333 Hz | një superbashkësi: temperatura e bërthamës dhe e brendshme/mesme/e jashtme e gomës, presionet, temperaturat e frenave, ngarkesat e rrotave, këndi, rrëshqitja dhe këndi i rrotës; shpejtësia në kornizën e makinës; ABS dhe TC që veprojnë (ACC, EVO, AC Rally) | të gjitha |
| iRacing `.ibt`, lexuar drejtpërdrejt | 60 Hz | pozicioni nga GPS, pedalet, timoni, g, yaw, temperatura e trupit të gomës për rrotë, zhvendosja e amortizuesit, presioni, konsumimi | të gjitha; kontrolli i makinës nga këndi i devijimit (yaw kundrejt drejtimit të lëvizjes) dhe timoni, pa rrëshqitje (nuk regjistrohet) |
| EA SPORTS WRC, DiRT Rally 2.0 / 1 / DiRT 4 (UDP) | për kornizë; 100 Hz | pozicioni, shpejtësia botërore dhe boshtet e makinës, shpejtësia e pikës së kontaktit për rrotë dhe pezullimi, pedalet, timoni, ora dhe gjatësia e fazës | të gjitha; rrëshqitja dhe këndi i devijimit nxirren |
| Richard Burns Rally (NGP UDP) | për hap fizik | pozicioni, shpejtësitë e vetë makinës, zhvendosja e sustës dhe forca për rrotë, pedalet | të gjitha përveç rrëshqitjes së rrotës |
| BeamNG.drive (mod-i i protokollit `heat3d`) | deri 100 Hz | pozicioni, shpejtësia botërore dhe boshtet, shpejtësia e sipërfaqes për rrotë, rrotullimi, ngarkesa dhe kontakti me tokën | të gjitha; rrëshqitja dhe këndi i devijimit nxirren |
| Trackmania (shtojca Openplanet) | për kornizë | pozicioni, shpejtësia përpara dhe anësore, pedalet (fren ndezur/fikur), timoni, koeficienti i rrëshqitjes për rrotë dhe toka e shkrifët, në ajër | të gjitha; këndi i devijimit nga shpejtësia anësore |

Çdo burim kthehet në një format të vetëm xhiro, `heat3d-lap`, kanalet e të cilit kanë emra kanonikë (`speed`, `throttle`, `tireTemp[FL]` ...). Figura e makinës dhe grafikët vizatojnë çdo kanal që ka një xhiro.

## Burimet {#sources}

- [MoTeC i2](https://www.motec.com.au/i2/i2highlights/)
- [Shpejtimi i sektorëve: format e variancës së kohës](http://momentaryracing.blogspot.com/2016/09/speeding-up-your-sections.html)
- [lap-delta-analyzer (delta në fushën e distancës)](https://github.com/taishiliu25/lap-delta-analyzer)
- [Udhëzuesi i analizës së xhiros iRacing](https://www.fusion-racing.org/iracing/iracing-guides/iracing-lap-analysis-guide.php)
- [Sim Racing Telemetry: xhirot e sesionit](https://docs.simracingtelemetry.com/manual/session-laps)
- [Sim Racing Telemetry: analiza e linjave të garës](https://docs.simracingtelemetry.com/kb/how-to-analyze-racing-lines)
- [Overcut: koha teorike nga sektorët](https://overcut.gg/)
- [Track Titan: si analizohet telemetria](https://www.tracktitan.io/post/how-to-analyse-telemetry-for-sim-racing)
- [Racecar Engineering / OptimumG: KPI-të e frenimit, bllokimit dhe stabilitetit (shtator 2019)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-September.pdf)
- [Racecar Engineering / OptimumG: mbi gazin (janar 2020)](https://optimumg.com/wp-content/uploads/2020/03/RCE-2020-January.pdf)
- [TUM: treguesit kryesorë të performancës së shoferëve të garës (arXiv 2005.10044)](https://arxiv.org/pdf/2005.10044)
- [Modelet e fërkimit goma-rrugë dhe rrëshqitja optimale (PMC9920324)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9920324/)
- [TRB: fërkimi goma-asfalt, rrëshqitja në kulm në borë dhe akull](https://onlinepubs.trb.org/Onlinepubs/sr/sr115/115-010.pdf)
- [hpwizard: koeficientët e fërkimit të gomës, kulmi dhe rrëshqitja](https://www.hpwizard.com/tire-friction-coefficient.html)
- [theracingline: forcat gjatësore](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-longitudinal-forces/)
- [theracingline: forcat anësore](https://theracingline.net/2018/race-car-tech/race-tech-explained/tyres-lateral-forces/)
- [Stabiliteti i automjetit, kufijtë e rrëshqitjes së trupit (arXiv 1104.1582)](https://arxiv.org/pdf/1104.1582)
- [Ralia me rrëshqitje të lartë anësore (Georgia Tech, IJVAS)](https://dcsl.gatech.edu/papers/ijvas09R.pdf)
- [Manovrat e ralisë me kohë minimale (Georgia Tech, ISIE 2005)](https://dcsl.gatech.edu/papers/isie05a.pdf)
- [Shkalla e referencës së ESC për shpejtësinë e rrotullimit (arXiv 2305.18422)](https://arxiv.org/pdf/2305.18422)
- [Zbulimi i nënvirazhit dhe mbivirazhit me timon kundër yaw-it (US10293852B2)](https://patents.google.com/patent/US10293852B2/en)
- [EDC: këndi i timonit, Ackermann dhe gradienti i nënvirazhit](https://edccorp.com/library/HveWpPdfs/WP2004-3.pdf)
- [AiM: kanale matematikore (Kus, g i kombinuar)](https://www.aim-sportline.com/download/software/doc/Math_Channels_101_eng.pdf)
- [Coach Dave Delta: mjeti i nënvirazhit dhe mbivirazhit](https://coachdaveacademy.com/documentation/how-to-use-the-oversteer-understeer-widget/)
- [Frenimi me kadencë: bllokimi në sipërfaqe shumë të shkrifëta](https://en.wikipedia.org/wiki/Cadence_braking)
- [HP Academy: regjistrimi i të dhënave në ralinë me zhavorr](https://www.hpacademy.com/forum/data-analysis-fundamentals/show/data-logging-in-gravel-rally-stages/)
- [DirtFish: si të përdoren frenat](https://dirtfish.com/learn/how-to/how-to-use-the-brakes/)
- [DirtFish: si të kërcehet me makinë rali](https://dirtfish.com/learn/how-to/how-to-jump-a-rally-car/)
- [RallySport Ontario: drejtimi i ralisë, bazat](https://www.overtake.gg/threads/rallysport-ontario-article-rally-driving-the-basics.168897/)
- [Scandinavian flick](https://en.wikipedia.org/wiki/Scandinavian_flick)
- [grenzbereich: dinamika e automjeteve të ralisë, vlerat referuese](https://github.com/GitCrush/grenzbereich)
- [Trackmania speed-drift trainer plugin (konstantet)](https://github.com/SilasDo/Trackmania-Speed-Drift-Trainer-Plugin)
- [Trackmania speedslide: shkrimi](https://github.com/TomashuTTTT7/TM-AlgoCrack/blob/main/cracks/speedslide_writeup.md)
- [Track Titan: rrjedhat e trajnimit](https://www.tracktitan.io/post/november-2025-update-coaching-flows)
- [Track Titan: linja V](https://www.tracktitan.io/post/why-dont-f1-drivers-use-this-racing-line-which-is-usually-faster-v-line-guide)
- [Biasing the driving style of an artificial race driver (shpejtësia në dalje kundrejt kohës minimale)](https://arxiv.org/abs/2504.12744)
- [Race & Track Driving: sekuenca për përmirësimin e kohës së xhirit](https://racetrackdriving.com/concepts/sequence-for-improving-lap-time/)
- [Allen Berg Racing Schools: tre llojet e kthesave](https://www.allenbergracingschools.com/expert-advice/race-tracks-three-corners-types/)
- [Driver61: prioritetet e kthesave](https://driver61.com/uni/prioritising-corners/)
- [Driver61: kthesa të ndryshme, teknika të ndryshme](https://driver61.com/uni/different-corner-technique/)
- [Driver61: gjashtë fazat e një kthese](https://driver61.com/uni/corner-phases/)
- [Driver61: aderenca](https://driver61.com/uni/grip/)
- [Skip Barber Racing School: Going Faster (fragment)](http://www.bentleypublishers.com/automotive-reference/engineering-and-motorsports/going-faster-/excerpt.html)
- [Ross Bentley: çfarë është një makinë me momentum](https://speedsecrets.com/could-you-please-tell-me-what-a-momentum-car-is/)
- [Debati momentum mbi fuqinë e kalit](https://grassrootsmotorsports.com/articles/column-momentum-over-horsepower-debate/)
- [Matematika e linjës së garës, pjesa 2](https://yousuckatracing.wordpress.com/2016/10/22/math-on-the-racing-line-part-2/)
- [RWD vs FWD, pjesa 1](https://yousuckatracing.wordpress.com/2021/11/08/rwd-vs-fwd-part-1/)
- [Teknika FWD](https://grassrootsmotorsports.com/forum/grm/fwd-technique/43354/page1/)
- [AWD kundrejt RWD në kthesa](https://www.e46fanatics.com/threads/awd-vs-rwd-cornering.493666/)
- [Linja e garës](https://en.wikipedia.org/wiki/Racing_line)
- [formula1-dictionary: teknika e kthesave](https://www.formula1-dictionary.net/cornering_tech.html)
- [Shpejtësia maksimale në kthesë](https://www.schoolphysics.co.uk/age16-19/Mechanics/Circular%20motion/text/Cars_cornering/index.html)
- [Fjalori i telemetrisë së garës](https://www.brakepoint.io/en/blog/motorsport-telemetry-glossary/)
- [Planifikimi global i trajektores me kohë minimale, duke marrë parasysh lakimin dhe distancën](https://www.nature.com/articles/s41598-025-21211-2)
- [TUM: optimizimi global i trajektores së garës](https://github.com/TUMFTM/global_racetrajectory_optimization)
- [Racecar Engineering / OptimumG: faktori i inercisë](https://optimumg.com/wp-content/uploads/2020/03/RCE-2019-November.pdf)
- [Hyrje në rrethin e aderencës](https://www.yourdatadriven.com/friction-circle-introduction/)
- [Trailbrake.com: diagrama g-g](https://trailbrake.com/data-analysis-tips/gg-diagram/)
- [Rrëshqitja gjatësore](https://www.sciencedirect.com/topics/engineering/longitudinal-slip)
- [Nënvirazhi, një përmbledhje](https://www.sciencedirect.com/topics/engineering/understeer)
- [Nënvirazhi dhe mbivirazhi](https://en.wikipedia.org/wiki/Understeer_and_oversteer)
- [Dokumentacioni i Forza Motorsport Data Out](https://support.forza.net/hc/en-us/articles/21742934024211-Forza-Motorsport-Data-Out-Documentation)
- [hpwizard: përshpejtimi i kufizuar nga tërheqja](https://hpwizard.com/accelerating-traction-limit.html)
- [hpwizard: përshpejtimi i kufizuar nga fuqia](https://hpwizard.com/accelerating-power-limit.html)
- [AC EVO shared memory](https://github.com/albertowd/live-telemetry-evo/blob/develop/docs/SHARED_MEMORY.md)
- [AC Rally telemetry reader](https://github.com/LuizZak/AssettoCorsaRallyTelemetryReader)
- [Leximi i IBT të iRacing](https://github.com/teamjorge/ibt)
