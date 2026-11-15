---
title: "Sfondi botëror"
parent: "Nivelet dhe gjeometria e sfondit"
nav_order: 5
has_children: true
lang: "sq"
source: "world-backdrop.md"
source_hash: "d42a67d56aca"
translated: true
outdated: false
---

# Sfondi botëror

Një sfond botëror vendos tokën reale nën një regjistrim fluturimi: kodrat, rrugët, lumenjtë, aeroportet dhe ndërtesat, të shkarkuara nga të dhëna hartash falas. Përdore kur një regjistrim Tacview do të notonte mbi një rrjet bosh. Është një [nivel](glossary.md), kështu që nxehtësia dhe figurat qëndrojnë mbi të.

## Ndërto një {#build-one}

1. Ngarko një regjistrim fluturimi që thotë se ku është në tokë (një skedar Tacview `.acmi`), ose mos ngarko asgjë dhe zgjidh një teatër në hapin 3. Shih [Hyrja e të dhënave](getting-data-in.md).
2. Hap **Sfondi / niveli** në panelin anësor.
3. Shtyp **Bota e vërtetë si sfond** për të ndërtuar tokën nën të dhënat e tua. Ose zgjidh një hartë loje te **Teatri i luftës** dhe shtyp **Ndërto sfondin e teatrit** (ose **Transmeto teatrin**).
4. Prit. Paneli tregon progresin (*Pllakat e lartësisë*, *Pllakat e hartës*, *Ndërtimi i sfondit*); **Anulo** e ndalon.
5. Fluturo përreth. Rreshti i kreditit për të dhënat e hartës shkruhet në fund djathtas të pamjes.

Ndërtimi i parë shkarkon disa dhjetëra megabajt. Shfletuesi i mban ato, kështu që një ndërtim i dytë i së njëjtës zonë nuk shkarkon asgjë. **Harro pllakat e hartës** i fshin. Butoni **Bota e vërtetë si sfond** shfaqet vetëm kur të dhënat e ngarkuara mbajnë një referencë gjeografike (më poshtë).

Gjithçka ndërtohet në një punëtor në sfond ([`src/world`](https://github.com/Holdi601/3DHeat/tree/main/src/world)). Rezultati zëvendëson nivelin aktual dhe sillet si çdo [nivel 3D](model-levels.md): fsheh nxehtësinë pas vetes, pritet nga prerja, ka [kontrollet e pamjes](level-appearance.md), dhe mund të ruhet te [biblioteka](level-library.md).

## Ku janë të dhënat: referenca gjeografike {#where-the-data-is-the-geographic-reference}

Një grup të dhënash merr referencë gjeografike vetëm nga një burim që e thotë një:

- **Një regjistrim ACMI**: `ReferenceLatitude` dhe `ReferenceLongitude` te koka e tij, dhe pozicionet që lexuesi i projekton mbi planin që prek elipsoidin WGS84 atje (X lindje, Y veri, metra; lartësitë janë lartësia e regjistrimit mbi nivelin e detit). Referenca mbahet kur projektimi merr **X** dhe **Y** si boshtet e tokës - ashtu bëjnë sugjerimet vetë të regjistrimit - dhe hiqet kur toka vjen nga një kolonë tjetër, si **U** dhe **V** të botës së sheshtë të një lojë.
- **Një tabelë Parquet, sugjerimet e së cilës `heat3d` mbartin një hyrje `geo`** - tabelat DCS, MSFS, X-Plane dhe IL-2 (Tacview) të [Watcher](https://github.com/Holdi601/3DHeat-Watcher). Hyrja përshkruhet te [Për zhvilluesit](#for-developers).

Një ngarkim me disa skedarë mban referencën vetëm kur të gjithë ndajnë të njëjtën. Çdo ngarkues tjetër nuk preket dhe nuk mban asnjë.

Sfondi projektohet në të njëjtën mënyrë dhe kalon pastaj nëpër përmbysjen e boshteve të ngarkimit, kështu që vendoset nën të dhënat sido që përmbysje apo shkallë të aplikojë ajo.

## Teatrot {#theatres}

Zgjedhësi **Teatri i luftës** liston hartat reale të DCS World (Caucasus, Nevada, Normandy 2, The Channel, Syria, Persian Gulf, Marianas, Marianas WWII, South Atlantic, Sinai, Afghanistan, Kola, Germany Cold War, Iraq) dhe të IL-2 Great Battles (Stalingrad, Moscow, Kuban, Rheinland, Normandy, Prokhorovka, Velikie Luki, Arras, Odessa, Finnish Gulf / Leningrad, Korea), secila me kutinë e vet mbi tokë ([`src/world/theatres.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/theatres.ts)). Kutitë e DCS janë shtrirjet e redaktorëve, të llogaritura nga projeksionet e publikuara; kutitë e IL-2, dhe ato të DCS të shënuara si të tilla, janë vlerësime nga madhësitë e publikuara të hartave dhe qytetet në skajet e tyre - paneli thotë cilat.

**Ndërto sfondin e teatrit** ndërton dy nivele detaji në një rrjetë të vetme:

| Niveli | Zona | Terreni | Harta |
|---|---|---|---|
| Teatri | i gjithë kutia | zoomi më i thellë deri 10 që ka nevojë për më së shumti 64 pllaka lartësie (rreth 3 km për kulm mbi Caucasus, 1 km mbi Normandy) | deti, liqenet, mbulesa e tokës dhe autostradat nga më së shumti 64 pllaka vektoriale në zoom 4 deri 9 |
| Zona e detajuar | **Nën të dhënat**, **Rreth një pike** (gjerësi, gjatësi, 12 deri 400 km), ose asnjë | deri zoom 12 në më së shumti 100 pllaka, më së shumti 500,000 kulme | gjithçka më poshtë, nga më së shumti 1,500 pllaka vektoriale në zoomin më të thellë deri 14 që përshtatet |

Zona e detajuar pret një vrimë në rrjetën e teatrit, e zgjeruar në qeliza të plota që të dyja rrjetat të ndajnë vijat kufitare, dhe një mur i hollë mbyll bashkimin aty ku ato i marrin lartësitë ndryshe.

Me të dhëna të ngarkuara, teatri ndërtohet në planin e të dhënave, kështu që vendoset nën to siç u ndërtua. Pa të dhëna ndërtohet rreth pikës referuese të vet (gradë të plota afër zonës së detajuar). Të dhënat e ngarkuara më vonë në një referencë tjetër - një skedar ACMI e emëron vetë - e zhvendosin sfondin nën to: zhvendosja e saktë midis dy projeksioneve llogaritet në një rrjet 256 × 256 mbi sfond dhe lexohet mes nyjeve, brenda një ose dy metrash në të gjithë teatrin ([`src/world/reproject.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/reproject.ts)). Një sfond i ruajtur në bibliotekë mban vendin e vet dhe zhvendoset njësoj kur ngarkohet nën të dhëna të tjera.

### Transmetimi i një teatri {#streaming-a-theatre}

**Transmeto teatrin** e shfaq teatrin ashtu si e bën një shfaqës harte simulatori fluturimi: toka vjen si shumë pllaka të vogla rreth kamerës, të ngarkuara ndërsa fluturon dhe të lëshuara kur janë jashtë kapjes ([`src/world/stream.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/stream.ts)).

- **Një pemë katrore e pllakave Web Mercator.** Rrënjët në zoom 5 mbulojnë 1,500 km rreth kamerës, kështu që toka arrin përtej kutisë së teatrit deri në horizont. Një pllakë ndahet në katër fëmijët e vet ndërsa kamera është më afër se 1.4 herë gjerësia e saj, deri në zoom 15 (rreth 1 km një pllakë, 15 m midis kulmeve të terrenit): detaji bie me distancën ashtu si bie në ekran.
- **Çdo pllakë një rrjetë e vetë**, e ndërtuar në një punëtor ([`src/world/tileBuild.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/tileBuild.ts)): një rrjetë terreni 65 × 65 me një skaj rreth kufirit të vet (që fqinjët me detaje të ndryshme të mos shfaqin kurrë çarje), mbulesa e tokës dhe deti të vizatuara mbi të, rrugë, hekurudha, liqene, lumenj, aeroporte, pista të matura dhe ndërtesa sipër, dhe opsionalisht fotografia satelitore e katrorit të saj. Vizatuesi i vizaton pllakat me pamjen dhe rregullat e thellësisë së nivelit, kështu që fshehin nxehtësinë pas tyre si çdo nivel.
- **Më e trashë së pari.** Pllakat kërkohen të trasha dhe afër së pari, katër shkarkime në një kohë për burim; ndërsa fëmijët e një pllake ngarkohen, pllaka qëndron në vend të tyre, kështu që pamja mbushet menjëherë dhe mprehet.
- **Kujtesa**: pllakat e ndërtuara mbahen deri 600 MB, dhe ato më pak të vizatuara kohët e fundit lëshohen së pari. **Shkarkimet** qëndrojnë në fshehtinën e pllakave, të mbajtura brenda një buxheti 2 GB, më të vjetrat dalin së pari: fluturimi prapa mbi një zonë nuk kushton asgjë, dhe nuk ka kufi për çdo ndërtim.
- **Ruhet në bibliotekë** si ajo që transmetohet - teatri, opsionet e tij dhe vendi i tij në tokë - jo si pllaka: ngarkimi e transmeton sërish, nga fshehtina e pllakave aty ku pllakat ende janë. Klikimet dhe inspektori i godasin pllakat si çdo nivel tjetër.
- Të dy vizatuesit i vizatojnë pllakat: kontrolluar krah për krah në një GPU të vërtetë (WebGPU dhe WebGL2 në të njëjtën kartë), përfshirë nxehtësinë e fshehur pas një kreshte.
- Me të dhëna të ngarkuara, pllakat ndërtohen në planin e të dhënave; të dhënat e ngarkuara më vonë në një plan tjetër i ri-ndërtojnë aty (nga fshehtina).
- Matur në fluturime sintetike mbi tre vende (Normandy, Nevada, Syria): rreth 63, 45 dhe 24 MB në vizitën e parë me imazh; një vizitë e dytë nuk shkarkon asgjë.

## Çfarë ndërtohet {#what-is-built}

| Pjesa | Burimi | Si |
|---|---|---|
| Imazhi (teatrot e transmetuar, opsional) | EOX Sentinel-2 cloudless 2016 | **Imazhi satelitor** e shtrin mbi tokë mozaikun pa re të 2016 (rreth 10 m një piksel, zoom 14; pllakat më të thella e zmadhojnë) në vend të mbulesës së tokës së vizatuar; rrugët, pistat, ndërtesat dhe emrat qëndrojnë sipër. |
| Imazh më i hollë (SHBA, Francë) | USGS National Map orthoimagery; IGN BD ORTHO | Me **Imazhin satelitor** të ndezur, një pllakë harte nga zoom 13 që shtrihet krejt brenda Shteteve të Bashkuara të vazhdueshme ose Francës metropolitane merr në vend ortofotografinë kombëtare, dy zoom më të thellë se pllaka (gjashtëmbëdhjetë pllakat e saj të vendosura në një imazh, rreth 1-2 m një piksel nga afër). EOX kudo tjetër. |
| Terreni (teatrot e transmetuar) | Mapterhorn | Copernicus GLO-30 kudo (rreth 19 m një piksel në zoom 12), në shkallë metrash aty ku ka matjen e vet të një vendi (Franca, SHBA dhe të tjera); lexohet dy zoom më i trashë se çdo pllakë. AWS Terrain Tiles nëse Mapterhorn nuk arrihet. |
| Terreni | AWS Terrain Tiles (Terrarium PNG) | Një rrjetë lartësish mbi kutinë: zoomi është më i thelli deri 12 (rreth 28 m një piksel në 43° N) që ka nevojë për më së shumti 36 pllaka, dhe rrjeta retushohet në më së shumti 400,000 kulme. Vizatohet si tokë me relievin e zakonshëm. |
| Rrugë, hekurudha | pllaka vektoriale OpenFreeMap, shtresa `transportation` | Shirita të sheshtë të shtrirë mbi terren, të ngjeshur sipas hapësirës së terrenit dhe të ngritur disa për qind të saj, që të mos luftojnë me të. Gjerësitë sipas klasës, nga 16 m (autostradë) deri 3 m (shteg, hekurudhë); kurrë më të ngushta se diagonalja e kutisë / 5000. Shtigjet, trageti dhe tunelet lihen jashtë. |
| Aeroportet | shtresa `aeroway` | Poligone pistash, rrugësh rrotulluese, platformash dhe helikopterësh, të shtrirë si tokë; vijat e pistave dhe rrugëve rrotulluese si shirita 45 m dhe 18 m. |
| Uji | shtresa `water` | Deti i sheshtë në 0 m, liqenet dhe pellgjet të sheshta në bregun e tyre më të ulët, lumenjtë të shtrirë. Vizatohen si ujë: hije e sheshtë, pa kontur. |
| Mbulesa e tokës | shtresat `landcover` dhe `landuse` | Vizatuar mbi kulmet e vetë terrenit, pa trekëndësha shtesë: pyjet, bari dhe parqet në të gjelbër, tokat bujqësore në ngjyrë kashte, zonat e lagështa, rëra, shkëmbi, akulli; zonat banesore, industriale, tregtare, ushtarake dhe guroret me tone të zbehta. Uji vizatohet edhe nën sipërfaqen e ujit, kështu që bregu lexohet nga çdo lartësi. Toka e zhveshur merr një nuancë të qetë lartësie (gri-jeshile në ultësirë, kafe në lartësi, borë mbi 3,000 m). E lexueshme në rezolucionin e terrenit: rreth 30-45 m në zonën e detajuar, kilometra në teatër. |
| Emrat e vendeve | shtresat `place` dhe `aerodrome_label` | Qytete, qytezat dhe fshatrat, dhe aeroportet me kodin e tyre ICAO, të shkruara mbi pamje; sa shfaqet çdo lloj rritet me lartësinë e kamerës, më së shumti 70 njëherësh. |
| Pistat e matura | [OurAirports](https://ourairports.com/data/) `runways.csv` (domen publik) | Opsionale (**Pista nga OurAirports**, e ndezur si parazgjedhje): çdo pistë e hapur me të dyja skajet në listë, nga pragu te pragu, në gjerësinë e listuar, me vija anësore, vijë qendrore me pika dhe shirita pragu. Një listë 4 MB, e shkarkuar një herë dhe e mbajtur në fshehtinë. |
| Ndërtesat | shtresa `building` | Gjurmët e shtrira nga `render_min_height` deri `render_height` (6 m kur mungon) mbi tokën më të ulët poshtë tyre; pjesët `hide_3d` kapërcehen. Vizatohen si struktura. |

Pllakat vektoriale lexohen në zoom 14 (i vetmi zoom me ndërtesa) kur kutia ka nevojë për më së shumti 300 prej tyre; përndryshe në zoomin më të thellë që e bën këtë, deri 8. Një zonë më e madhe merr vetëm terren.

### Pamja {#look}

Një sfond fillon me **Shfaq ngjyrën e kapur** të ndezur - ngjyra është ajo që e dallon një rrugë të lehtë nga toka gri ku shtrihet, një pistë e errët nga platforma e saj - me trekëndëshat kufitarë të tokës të fikur, sepse një rrjetë e rregullt nuk thotë asgjë; kontura të zbehta; një det të errët të ngurtë (një dysheme nën të do të luftonte me sipërfaqen për thellësinë larg); dhe ndërtesat gri të lehta e pothuajse të ngurta, ashtu si i vizaton një hartë. Deti i hapur nuk merr fare trekëndësha toke. Gjithçka tjetër është pamja e parazgjedhur e një niveli modeli.

## Kreditet në pamje {#credits-on-the-canvas}

Ndërsa sfondi është niveli, kreditet e burimeve të tij shkruhen në fund djathtas të pamjes, pa pasur nevojë për klikim, që pamjet dhe videot e renderuara t'i mbartin:

> OpenFreeMap © OpenMapTiles · Data © OpenStreetMap contributors · Elevation: Terrain Tiles – SRTM, GMTED2010, 3DEP courtesy of the U.S. Geological Survey; ETOPO1: NOAA; and others

Çdo pjesë lidhet me faqen e atribuimit të burimit të vet (openstreetmap.org/copyright dhe [lista e atribuimeve](https://github.com/tilezen/joerd/blob/master/docs/attribution.md) e Terrain Tiles). Një sfond i ruajtur në bibliotekë mban kreditet e veta dhe i shfaq sërish kur ngarkohet. Teksti përkthehet me shfaqësin; emrat jo.

## Burimet dhe kushtet e tyre {#sources-and-their-terms}

Çdo burim, licenca e tij dhe si mbetet sfondi brenda kushteve: [Sfondi botëror: burimet dhe kushtet](world-backdrop-sources.md).

## Fshehtina e pllakave {#the-tile-cache}

Çdo pllakë, dhe TileJSON-i i pllakave vektoriale, mbahet në Cache API të shfletuesit nën `3dheat-world-tiles-v1`, sipas URL-së. Një ndërtim i dytë i së njëjtës zonë nuk bën asnjë kërkesë fare dhe punon pa internet: TileJSON-i kërkohet së pari dhe, kur dështon, kopja e tij në fshehtinë emëron pllakat që mbahen tashmë. Pllakat që serveri nuk i ka (deti i hapur, 404) mbahen mend edhe si të munguara.

URL-të e pllakave vektoriale mbartin datën e ndërtimit të hartës, kështu që pasi OpenFreeMap publikon një ndërtim të ri, sfondi i radhës shkarkon pllaka të reja dhe të vjetrat mbeten derisa të pastrohen. Fshehtina mbahet në 2 GB: kur e kalon, pllakat e ruajtura më gjatë fshihen së pari. **Harro pllakat e hartës** fshin gjithë fshehtinën. Fshehtina kërkon një origjinë të sigurt (`https://` ose `localhost`); gjetkë çdo ndërtim shkarkon sërish.

## Krahasuar me Tacview {#compared-with-tacview}

Kontrolluar me sy në një vend për teatër, me regjistrime sintetike: rrotullimet e ngritjes shtrihen mbi vijat qendrore të pistave të vizatuara, kalimet e bregut bien mbi breg. Ana e Tacview vjen nga dokumentacioni i tij dhe nga pamjet e publikuara (tacview.net, faqja e tij në Steam), jo nga ekzekutimi i tij këtu.

| | Tacview 1.9 | Ky sfond, i transmetuar |
|---|---|---|
| Shtrirja | e gjithë globi | 1,500 km rreth kamerës, kudo qoftë ajo |
| Terreni | ETOPO1 (rreth 1.25 km) i ndërtuar; SRTM 25-75 m nëse përdoruesi instalon skedarët; terreni DCS i eksportuar nga DCS | Copernicus GLO-30 (Mapterhorn), në shkallë metrash në Francë dhe SHBA |
| Imazhi | asgjë e ndërtuar; tekstura që përdoruesi shkarkon (Mapview, SAS Planet, shtesa si një hartë VFR e Caucasus) | EOX Sentinel-2 cloudless 2016, rreth 10 m, i transmetuar |
| Mbulesa e tokës | asnjë, përveç nëse është në një teksturë | nga OpenStreetMap, e vizatuar mbi terren (pa imazh) |
| Rrugë, hekurudha | asnjë, përveç nëse është në një teksturë | çdo klasë pranë kamerës, rrugët kryesore larg |
| Ndërtesat | asnjë | gjurmë të shtrira pranë kamerës |
| Aeroportet | etiketa dhe pista si kuti të sheshta, pa shenja | pista nga skajet e matura me vija anësore, vijë qendrore dhe shirita pragu; rrugë rrotulluese, platforma; emra me kode ICAO |
| Emrat e vendeve | disa etiketa fshatrash dhe qytetesh | qytete, qytezat, fshatra, aeroporte, sipas distancës dhe lartësisë |

Ku mbetet ende pas:

- **Rezolucioni i imazhit**: jashtë SHBA-së dhe Francës, mozaiku satelitor 10 m është i butë nën rreth 2 km; Tacview me një teksturë zoom-17 të instaluar nga përdoruesi është më i mprehtë aty.
- **Terreni në formën e vet të DCS**: Tacview mund të shfaqë terrenin që vetë DCS eksporton; këtu është toka reale, që ndryshon nga terreni i DCS aty ku modeluesit e hartës e kanë ndryshuar.
- **Kurbatura**: toka është një plan i sheshtë, kështu që horizonti nuk është horizonti i një toke të lakuar; Tacview vizaton një sferë.
- **Shpejtësia**: vizita e parë në një vend shkarkon disa dhjetëra megabajt para se të bëhet e mprehtë; në një shfletues me vizatim softuerik (pamjet) vizaton me disa kuadra në sekondë me disa qindra pllaka.

## Kufijtë dhe ç'vjen më vonë {#limits-and-what-comes-later}

- **Rezolucioni i terrenit**: rreth 30 m në më të mirën, dhe më i trashë në zona të mëdha. [Copernicus GLO-30](https://registry.opendata.aws/copernicus-dem/) (GeoTIFF të optimizuara për re në AWS, pa çelës, tekst kredie i fiksuar) është burimi më i mirë: 30 m kudo, GLO-90 aty ku GLO-30 ka boshllëqe (Armenia dhe Azerbajxhani, që DCS Caucasus i mbulon). Kërkon një lexues GeoTIFF dhe nuk përdoret ende.
- **Terren më i mirë**: Copernicus GLO-30 në AWS nuk dërgon kokat CORS, kështu që një shfletues nuk mund ta lexojë; pasqyra e OpenTopography mund të lexohet (CORS dhe intervale), por kushtet e tyre për përdorim gjatë ekzekutimit të një aplikacioni publik janë të panjohura - duhet pyetur para çdo përdorimi. Mapterhorn e mban GLO-30 tashmë.
- **Kurbatura**: toka është një plan i sheshtë dhe lartësitë nuk ulen për lakimin e tokës, në përputhje me mënyrën se si vendosen regjistrimet (lartësia si lartësi); larg referencës të dyja shkojnë bashkë, më pak se një pjesë në një mijë në 100 km. Përkulja vetëm e pllakave do t'i ndante nga të dhënat larg, kështu që nuk ofrohet. Një horizont i lakuar kërkon të njëjtën ulje - katrorin e distancës nga kamera pjesëtuar me dyfishin e rrezes së Tokës - të zbatuar në çdo kalim që vizaton një pozicion (niveli, pllakat, nxehtësia, linjat, kutitë, etiketat, zgjedhja) si një uniformë të përbashkët; një glob i vërtetë kërkon edhe pozicione të centruara në Tokë për të dhënat dhe vizatim të lidhur me kamerën. Të dyja janë planifikuar me modalitetin e globit.
- **Vetëm bota e sotme**: hartat historike të DCS dhe IL-2 (Normandy 2, The Channel, Germany Cold War, çdo hartë IL-2) vizatohen me qytetet, rrugët dhe punimet bregdetare të sotme; paneli e thotë këtë. Aeroportet e periudhës nuk vizatohen.
- **Pa modalitet globi**: një sfond është një plan lokal i sheshtë. Një pamje e gjithë tokës është e planifikuar.
- Rrugët zgjerohen në zona të mëdha që të mbeten të dukshme; nga afër janë më të gjera se jeta.
- Emrat e teatrove DCS në tabelat e Watcher përputhen siç i jep DCS te `mission.theatre`; një emër që nuk është në listë kthehet te pika e parë e fiksuar, e rrumbullakosur në gradë të plota, dhe vetëm te gjerësia dhe gjatësia.

## Hartat historike (ende jo të ndërtuara) {#historical-maps-not-built-yet}

Hartat e periudhës mund t'i japin teksturë teatrove historike më vonë. Seritë e US Army Map Service (AMS) janë vepra të qeverisë federale të SHBA-së, që përgjithësisht trajtohen si domen publik (kontrollo regjistrimin e secilës skanim; shumë janë ri-botime të origjinaleve britanike GSGS ose gjermane, të cilëve edhe e drejta e Kurorës ose afati i veprave anonime ka mbaruar):

| Teatri | Seria | Ku skanohet |
|---|---|---|
| IL-2 Stalingrad, Moscow, Kuban, Velikie Luki, Prokhorovka, Leningrad | AMS **N501**, Evropa Lindore 1:250,000 (përpiluar në vitet 1950 nga harta sovjetike dhe gjermane) | UT Austin PCL; disa fletë të georeferencuara në UT GeoData |
| IL-2 Normandy, DCS Normandy 2 dhe The Channel | AMS **M661** / GSGS 4250, Franca 1:50,000 | UT Austin PCL, Princeton |
| IL-2 Rheinland | AMS **M501** 1:250,000 dhe **M841** 1:25,000 (Gjermania) | UT Austin PCL |
| IL-2 Korea | AMS **L751** 1:50,000 (botimet e 1951) dhe **L552** 1:250,000 | ANU Open Research (fletët L751, "copyright expired"), UT Austin PCL, Yale |
| IL-2 Arras (Flying Circus) | harta britanike të llogoreve të Luftës I (jo AMS) | McMaster University; National Library of Scotland (kushte jo-komerciale) |

Fletët AMS mbartin shenja gjerësie dhe gjatësie në cepat e tyre, kështu që secila do të vendosej me një përshtatje me katër cepa dhe do të shtrihej mbi terren si teksturë, e ndërtuar dhe e mbajtur lokalisht si pllakat.

## Për zhvilluesit {#for-developers}

### Hyrja `geo` në një tabelë Parquet {#the-geo-entry-in-a-parquet-table}

```json
"geo": {"lat0": 42.0, "lon0": 42.0, "projection": "tangent-plane", "east": "x", "north": "z", "up": "y",
        "dcs": {"theatre": "Caucasus", "x": "dcs_x", "y": "dcs_y", "z": "dcs_z"}}
```

`east`, `north` dhe `up` emërtojnë kolonat që mbajnë metrat lindje dhe veri mbi të njëjtin plan tangjent në (`lat0`, `lon0`), dhe lartësinë. Ngarkimi mban referencën kur projektimi i tij merr saktësisht ato kolona (lindja si X, veriu dhe lartësia si Y dhe Z, në çfarëdo rendi). Hyrja opsionale `dcs` emëron metrat e vet të një tabele DCS (x veri, y lart, z lindje) dhe teatrin e saj: një ngarkim që i projekton ato kolona vendoset në vend të kësaj përmes projeksionit Mercator tërthor të teatrit ([Koordinatat DCS](#dcs-coordinates)). Një tabelë pa `geo` lexohet si më parë.

### Koordinatat DCS {#dcs-coordinates}

Çdo teatër DCS është një projeksion Mercator tërthor (WGS84, shkallë 0.9996) me meridianin e vet qendror dhe origjinën e vet të rreme; x i DCS është veriu dhe z lindja. Konstantet janë ato që publikon projekti pydcs; matematika është seria e Krüger-it deri në rendin e gjashtë (Karney 2011), e portuar në [`src/world/dcsProjection.ts`](https://github.com/Holdi601/3DHeat/tree/main/src/world/dcsProjection.ts). Një sfond për metra DCS ndërtohet drejtpërdrejt në to, kështu që një tabelë DCS e Watcher-it e projektuar me `dcs_x`/`dcs_y`/`dcs_z`, një nivel që e shkroi konvertuesi i terrenit DCS dhe sfondi ndajnë të gjithë të njëjtin kuadër. Konstantet e Irakut nuk janë publikuar; janë përshtatur me pika referimi të publikuara (4 cm rrënjë mesatare katrore).

Tabelat DCS të Watcher-it janë në një plan tangjent te pika fikse referuese e teatrit (e njëjta pikë që përdor zgjedhësi i teatrit, më poshtë), kështu që disa misione në një teatër bashkohen me referencën e tyre të plotë dhe përputhen me një sfond teatri pa u zhvendosur.

### Thjeshtimi dhe buxheti {#simplification-and-budget}

- Ndërtesat nën 20 m² hidhen; 60 m² kur kutia është më shumë se 30 km e gjerë, 150 m² përtej 80 km. Pjesa tjetër shtohet nga më e madhja e para, deri sa ndërtesat arrijnë 1.5M trekëndësha.
- Rrugët e vogla, rrugët e shërbimit dhe shtigjet hidhen përtej 60 km gjerësi; përtej 150 km mbeten vetëm autostradat, rrugët trunk, primare dhe sekondare.
- I gjithë sfondi qëndron nën rreth 3M trekëndësha. Shënimi i importit thotë sa ndërtesa janë lënë jashtë.
