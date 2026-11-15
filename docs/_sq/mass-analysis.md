---
title: "Analiza masive"
nav_order: 8
lang: "sq"
source: "mass-analysis.md"
source_hash: "88fad1d761e0"
translated: true
outdated: false
---

# Analiza masive: mijëra ndeshje njëherësh

**Analiza masive** të tregon çfarë përbëjnë së bashku një dosje e tërë ndeshjesh: cili mjet fiton më shpesh, cila palë favorizohet, ku është veprimi. Përdoreni kur keni shumë më tepër ndeshje se sa mund t'i shikoni.

Ajo punon me një përmbledhje të vogël të çdo ndeshjeje, kështu që një mijë ose dhjetë mijë ndeshje hapen shpejt. Ngarkon rreshtat e plotë vetëm për ndeshjet që klikoni.

## Provojeni {#try-it}

1. Hapni **Analizë masive** në shiritin anësor të Heatmap.
2. Shtypni **Dosje...** (ose **Skedarë...**) dhe zgjidhni ndeshjet tuaja `.3dheat`.
3. Prisni derisa paneli të lexojë përmbledhjet ("Përmbledhjet... n nga N").
4. Shtypni **Hap analizën**. Hapet një dritare me skeda.
5. Vendosni filtrat (Lojë, Hartë, Modaliteti, Nga, Te), pastaj lexoni një skedë, për shembull Balanca.
6. Klikoni një rresht, një qelizë ose një vëzhgim: ndeshjet e tij ngarkohen në pamjen 3D, me kamerën te vendi.

![Skeda Balanca: përqindja e fitoreve dhe vrasjet për çdo vdekje sipas mjetit](../assets/img/en/mass-balance.webp)

```
dosja e .3dheat -> përmbledhjet -> dritarja (skedat) -> klik në një rresht -> ndeshjet hapen në 3D
```

Një skedar `.3dheat` është një ndeshje ([Një skedar për ndeshje](container.md)). Një *hartë e nxehtësisë* dhe një *rresht* shpjegohen në [fjalorin](glossary.md).

## Marrja e përmbledhjeve {#getting-the-summaries}

Për shumicën e njerëzve nuk duhet bërë asgjë: paneli e llogarit vetë përmbledhjet që mungojnë. Për të përgatitur një dosje të madhe një herë, përdorni mjetin offline më poshtë.

Çdo ndeshje `.3dheat` merr një përmbledhje (`src/mass/summarize.ts`), e ruajtur në kontejner si anëtari `<match>.summary.json` (roli `summary`, shih [Një skedar për ndeshje](container.md)). Mjeti offline i shkruan ato, dhe një indeks për dosjen. Është një mjet për zhvilluesit; ekzekutojeni mbi një dosje të madhe për t'i kursyer panelit punën:

```
node tools/3dheat-summarize.mjs <folder>... [--jobs N] [--force] [--no-write] [--no-index] [--limit N] [--settle MIN]
```

- Një ndeshje e përmbledhur tashmë (e së njëjtës version formati) vetëm lexohet; `--force`
  e llogarit përsëri. `--no-write` i le kontejnerët të pacenuar.
- Një skedar i ndryshuar në `--settle` minutat e fundit (10) lihet jashtë: një konvertues
  mund ta shkruajë akoma.
- `<folder>/3dheat-index.jsonl.gz`: një rresht për ndeshje - rrugën e saj, madhësinë, kohën
  dhe përmbledhjen pa rrjetin. `<folder>/3dheat-index.grids.jsonl.gz`: një rresht për ndeshje me
  rrjetin e saj.
- Ekzekutojeni në kompjuterin që mban skedarët, me prioritet të ulët (për shembull `nice -n 19 ionice -c3` në Linux).

Paneli merr, për çdo ndeshje, të parën e gjetur nga: rreshti i indeksit të dosjes (e njëjta rrugë dhe madhësi), memoria e shfletuesit (IndexedDB, sipas emrit, madhësisë dhe kohës), anëtari `summary` i kontejnerit, ose një përmbledhje e llogaritur në një grup punëtorësh dhe e ruajtur në memorje. Kështu një dosje pa indeks funksionon edhe ajo - herën e parë me shpejtësinë e leximit të tabelave, pastaj nga memoria.

## Paneli {#the-panel}

Zgjidhni një dosje (ose skedarë; **Shto dosje...** shton një tjetër). Dritarja ka filtrat **Lojë**, **Hartë**, **Modaliteti**, **Nga** dhe **Te**, një zgjedhje **Ndaj sipas**, **Më pak jetë** dhe **Vetëm lojtarët**, dhe këto skeda. Çdo numër vjen nga përmbledhjet, dhe një klik në një rresht, qelizë ose vëzhgim ngarkon ndeshjet e tij në pamje si mbivendosja e shumë ndeshjeve me filtrat që e shfaqin (mjeti, klasa, armë, ekipi, lojtari) dhe kamerën te vendi:

| Skeda | Çfarë |
|---|---|
| Përmbledhje | ndeshjet, orët, lojtarët, jetët, rreshtat, datat; ndeshje në ditë; sipas lojës, hartës, modalitetit; totalet e ngjarjeve; ekonomia sipas monedhës; kur ndodhin gjërat gjatë ndeshjes |
| Balanca | sipas mjetit, klasës, armës ose ekipit, e ndarë sipas hartës, modalitetit, nivelit ose lojës: K/D me intervalin e vet ~95%, përqindja e fitoreve (Wilson), mbijetesa, vrasjet dhe goditjet në minutë, fitimet në minutë, dhe q - shkalla e rrezikut të rremë Benjamini-Hochberg e K/D dhe e fitores kundrejt pjesës tjetër të ndarjes. **Më pak jetë** fsheh rreshtat me shumë pak jetë për t'u besuar; **Vetëm lojtarët** heq ç'kishte drejtuar AI i misionit |
| Tendencat | përdorimi (pjesa e prezencës), K/D ose përqindja e fitoreve të mjeteve ose klasave kryesore çdo ditë, javë ose muaj |
| Lojtarët | lojtarë të veçantë, ndeshje për lojtar, lojtarë për ndeshje, lojtarët më të shpeshtë |
| Palët | secila palë e secilës hartë: ndeshje të fituara kundrejt një ndarjeje të barabartë |
| Luftim nga afër | të dhëna të raundeve: duele hapëse sipas palës dhe konvertimi i tyre, shkëmbime, hyrës kundrejt mbajtësit, zjarr i kryqëzuar, hyrje të verbuara, synim, vendosje bombash, avantazh njerëzish dhe, **Sipas hartës**, vendet ku vriten lojtarët që hyjnë në to - çdo njëri një pjesë me intervalin e vet Wilson, nga numërimet `cqb` të përmbledhjeve ([Luftimi nga afër dhe raundet](close-quarters.md)) |
| Harta | rrjeti i përmbledhur i një harte: prezenca, vrasjet, vdekjet, K/D, çdo ngjarje, rrjedha, dhe **e nxehtë në sa ndeshje** (qëndrueshmëria); sipas ekipit, me 1, 2, 4 ose 8 herë qelizën |
| Vende | vende që dalin në numra, por jo në harta e nxehtësisë (një zonë e madhe e zënë në tërësi, korridore, brez lartësish); **Gjej vende** |
| Nisha | grupe që bëjnë qartë më mirë ose më keq se pjesa tjetër (një mjet në një hartë, një sektor në një lartësi); **Gjej nisha** |
| Vëzhgime | zbuluesit masivë dhe zbuluesit e hartës (më poshtë); **Kopjo raportin (JSON)** jep JSON që e lexon një model gjuhësor |

## Vëzhgime mbi shumë ndeshje {#insights-over-many-matches}

Skeda **Vende** gjen vende që dalin në numra, por jo në harta e nxehtësisë - një zonë e madhe e zënë në tërësi, një korridor, një brez lartësie, një vend i zënë vetëm në një pjesë të ndeshjes - shënon ato që harta e thjeshtë e nxehtësisë nuk i tregon si **të fshehura**, dhe i konturon në pamjen 3D; **Ngarko** fluturon atje me ndeshjet që i mbante. Skeda **Nisha** gjen grupe (një mjet në një hartë dhe palë, një sektor në një lartësi) që bëjnë qartë më mirë ose më keq se pjesa tjetër; klikoni një të tillë për të parë çdo përafrim të tij.

Skeda **Vëzhgime** gjen, mbi të gjitha ndeshjet, mjete që shkëmbejnë ose fitojnë më mirë ose më keq se pjesa tjetër, vende të nxehta në një pjesë të qëndrueshme të ndeshjeve, palë që fitojnë më shumë se një ndarje e barabartë, mjete të cilëve përdorimi u lëviz me datat, dhe pjesë të ndeshjes që mbajnë më shumë vrasje sesa një shpërndarje e barabartë. Çdo gjetje mban numërimet e veta, efektin, intervalin dhe një shkallë rreziku të rremë (mbahet në 5%), dhe një klik ngarkon ndeshjet e saj. Detajet: [Për zhvilluesit](#for-developers).

## Shkalla {#scale}

Mund të përsërisni vetë një version të vogël të kësaj: `node tools/demo-data.mjs` shkruan 150 ndeshje sintetike me tanke te `tools/.shots/demo/mass` (rreth 1.000 rreshta secila). Matur mbi ato 150 ndeshje demo sintetike të `tools/demo-data.mjs` në një kompjuter desktop (një ndeshje reale është shumë më e madhe):

- `tools/3dheat-summarize.mjs` me 4 punëtorë: 2,6 deri 4,8 s për të gjitha 150, 8 deri 21 ms për ndeshje brenda një punëtori; një ekzekutim i dytë që vetëm lexon përmbledhjet zgjat rreth 2 s.
- Hapja e dosjes në panel, me indeksin e pranishëm, deri sa dritarja shfaqet: 0,9 deri 1,6 s (pjesa e vetë punëtorit, leximi i 150 rreshtave të indeksit, është 20 deri 40 ms).
- Kalimi në një skedë, deri sa tabela e saj vizatohet: Përmbledhje 10 deri 30 ms, Balanca 30 deri 70 ms, Tendencat 30 deri 45 ms, Lojtarët 15 deri 35 ms, Palët 15 deri 20 ms, Harta 55 deri 130 ms.
- Depoja mban 150 ndeshjet në rreth 0,5 MB.

Hapja e dritares zgjat një kornizë të shkurtër: skedarët e zgjedhur i dërgohen punëtorit 16 nga 16, dhe fushat e datave dhe skeda e parë vijnë një kornizë pas dritares.

Depoja mban rreth 15 KB për ndeshje, kështu që 10.000 ndeshje zënë ~150 MB te punëtori; rrjetat nuk mbahen kurrë më shumë nga sa kërkoi harta.

## Për zhvilluesit {#for-developers}

### Vëzhgime mbi shumë ndeshje {#insights-over-many-matches}

`src/mass/detect.ts` - çdo gjetje me numërimet, efektin dhe intervalin e vet,
p dhe q (Benjamini-Hochberg mbi gjithçka që provoi zbuluesi, mbahet në 5%),
udhëheqja që ngarkon ndeshjet e saj dhe një çelës fjalie me vlerat e veta;
raporti (`heat3d.mass/1`) është ajo që `massReportForModel` i jep një tregimtari,
në të njëjtën formë si raporti i një ndeshjeje (`insights/seam.ts`).

| Zbuluesi | Gjen |
|---|---|
| `balance` | një mjet lojtari që shkëmben ose fiton më mirë ose më keq se pjesa tjetër në një hartë ose në një modalitet |
| `hotspot` | vende të nxehta në një pjesë të qëndrueshme të ndeshjeve që erdhën (ndeshje të nxehta / ndeshje të parë, kundrejt qelizave të tjera të hartës) - jo vetëm të nxehta në tërësi |
| `side` | një palë e një hartë që fiton më shumë se një ndarje e barabartë |
| `meta` | përqindja e jetëve të lojtarëve të një mjeti ose K/D i tij që lëviz mes gjysmës së hershme dhe asaj të vonshme të datave, për hartë - mjaft e madhe për t'u çmuar, duke u trendosur mbi tremujorët, në të njëjtën mënyrë në shumicën e hartave (më poshtë) |
| `phase` | një pjesë e gjatësisë së ndeshjes që mban më shumë vrasje, goditje, lëshime... sesa një shpërndarje e barabartë |
| `place` | vende që dalin mbi shumë ndeshje (Faza B, më poshtë): shkalla e një rajoni ose hise vrasjesh kundrejt asaj të çdo ndeshjeje, rrathë, korridore, zona të rritura, brezat e lartësisë, fazat; fshihet kur harta e thjeshtë nuk i shfaq |
| `niche` | grupe që bëjnë qartë më mirë ose më keq (Faza B, më poshtë) |
| `grid.*` | zbuluesit e një grupi të dhënash (pozicionet e fuqisë, zonat e nxehta dhe të qeta, vendet e klasave) mbi rrjetat e përmbledhura të çdo harte: `GridMerge.toInsightJob` i mbush rrjetat e kalimit të vëzhgimeve nga përmbledhjet; zbuluesit që kërkojnë gjurmë kalojnë |

### Përmbledhja {#the-summary}

JSON i thjeshtë (`src/mass/types.ts`), rreth 5-30 KB të ngjeshur për ndeshje:

- ndeshja: loja, harta, modaliteti, misioni, fillimi, gjatësia, rreshtat, jetët, lojtarët,
  AI, ekipet (jetët, lojtarët, prezenca, vrasjet, vdekjet, fitoi, paratë), fituesi;
- për mjet dhe ekip: klasa, niveli, jetët, jetët e lojtarëve, prezenca, ngjarjet
  sipas llojit kanonik, vrasjet sipas klasës së objektivit, fitoret, paratë;
- për lojtar (sipas id-së së përdoruesit, përndryshe emrit): ekipi, jetët, prezenca, vrasjet, vdekjet,
  goditjet, lëshimet, fitoi, mjetet; për armë: ngjarjet sipas llojit;
- kolonat e ekonomisë (`cost_*`, `earn_*`) dhe totalet e tyre;
- fazat: ngjarjet sipas llojit në 20 kosha të gjatësisë së ndeshjes dhe sipas minutës;
- sjellja: masat e sjelljes kolektive të ndeshjes (lidhja, prirja e grupeve drejt një rruge, korsitë, mbushja, udhëheqësit, ata që mbeten pas, pika e thyerjes, rreziku pas humbjeve, seritë, marrëveshja e blerjes, shtypja), secila me modelin e vet nul, p dhe q - shih [Sjellja kolektive](collective-behaviour.md);
- rrjeti (më poshtë).

Numërohet ashtu si e numëron shikuesi: kolonat gjenden ashtu si i gjen ngarkuesi i shumë ndeshjeve (`leanSpec`), ngjarjet sipas `data/canonical.ts`; një vrasje që e bën një armë Tacview i numërohet gjuajtësit; një vdekje e thënë dy herë njëherësh (`dead`, `death`) numërohet një herë.

#### Rrjeti: mbi çfarë ndërton Faza B {#the-grid-what-stage-b-builds-on}

Pjesa hapësinore është bërë për statistika skanimi mbi rajone të çdo madhësie dhe forme, jo vetëm për imazhe nxehtësie:

- **Një piramidë.** Qelizat janë fuqi të plota të dyshe në njësi botërore (x, z ashtu si i vendos shikuesi). Niveli `k` është qelizat e mbledhura me `ix >> k, iz >> k` - saktë, brenda një ndeshjeje dhe mes ndeshjeve me madhësi të tjera qelize - dhe çdo rajon (një kuti, një korridor përgjatë një vije, një unazë) është një shumë qelizash. Niveli më i imët përshtatet me shtrirjen e fortë të ndeshjes (qelizat që mbajnë 99% të prezencës) në 128 qeliza; të hedhurat jashtë saj mbahen.
- **Ekspozimi pranë çdo numërimi.** Sekonda prezence për qelizë, për ekip (`pt`), për klasë mjeti (`pc`) dhe për brez lartësie (`ph`), kështu që shkalla, pritja dhe raporti i një rajoni llogariten për çdo nënrrup.
- **Lartësia.** Brezat mbi dyshemenë e ndeshjes (përqindja e 1-rë e lartësisë): nën 3 m, 3-10, 10-30, 30-100, 100-300, 300-1000, 1000-3000, mbi; një skedar me kolonën `floor`/`storey`/`deck` i ndan sipas kateve të veta. `y` është lartësia mesatare e secilës qelizë, `y0` më e ulëta e saj (dyshemeja e saj, për lartësinë mbi të).
- **Ngjarjet** si tupla `[qeliza, lloji, ekipi, klasa, brezi, numërimi]`.
- **Pjesë kohore** në një nivel të trashë (8 qeliza anash), sipas minutës nga fillimi i ndeshjes: `[cx, cz, minuta, lloji, vlera]`, sekondat e prezencës si lloj `GRID_KINDS.length`; fazat e ndeshjes janë minuta mbi gjatësinë.
- E rrallë, numërime të plota, sekonda deri në një të dhjetën: kufizohet nga ajo që ndodhi.

### Faza B: vende dhe nisha {#stage-b-places-and-niches}

Faza B kërkon atë që del në numra pa e kapur syrin:
një zonë e madhe e zënë në tërësi pa qelizë të nxehtë brenda, një raport i çuditshëm vrasje-vdekje mbi pak ngjarje, një korridor, një brez lartësie, një grumbull që është vetëm në një pjesë të ndeshjes - dhe grupe (një mjet në një hartë në një palë, një sektor në një lartësi) që bëjnë qartë më mirë ose më keq se pjesa tjetër. Një **Gjej vende** / **Gjej nisha** / **Gjej vëzhgime** nxjerr të gjithë zbuluesit; tre skedat ndajnë të njëjtin raport.

#### Vende (`src/mass/scan.ts`) {#places-srcmassscants}

Ndeshjet e çdo harte lexohen dy herë, një ndeshje për herë; memoria mban shuma mbi një rrjet me të shumtën 64 qeliza anash (16 për skanimin hapësirë-kohë), kurrë ndeshjet.

- **Masat.** Shkalla e një ngjarjeje për sekondë prezence - vrasje, vdekje, goditje, lëshime, kapje, për të gjitha njësitë, për klasë (4 me më shumë ngjarje), për brez lartësie - dhe pjesa e vrasjeve në vrasje dhe vdekje (e gjitha, për palë, për brez). Cilat klasa dhe palë merren nga kokat (`planOf`).
- **Pritja sipas ndeshjes.** Shkalla e secilës ndeshje, e shpërndarë mbi prezencën e vet në një qelizë, është pritja e qelizës (një skanim Kulldorff i rregulluar me kovariatë, i ndarë sipas ndeshjes): disa ndeshje gjakatare ose një server i zënë nuk bëjnë vend.
- **Shpërndarja.** Ndeshjet nuk pajtohen shumë më tej nga Poisson. Mbetjet e secilës ndeshje mblidhen në blloqe prej 1, 2, 4, 8, 16 qelizash; shpërndarja e çdo madhësie blloku (katrorët e mbetjeve mbi variancën nul, të mbledhura, pa 5% më të keqijat blloqe) shkallëzon çdo provë të një rajoni të tillë madhësie: një raport i gjasës kuazi, Poisson për shkallë, binomial për pjesë.
- **Rajonet.** Rrathë prej 0,75 deri 18 qeliza; elipsa në gjashtë kënde, 3 dhe 6 herë më të gjatë sesa të gjerë, 3 deri 18 qeliza (korridore; boshti është `place.path` i vëzhgimit); zona të rritura qelizë pas qelize nga qelizat më të forta lokale Getis-Ord Gi* ndërsa rritet z-ja e rajonit (forma të parregullta) - të rritura mbi gjysmën e ndeshjeve dhe të provuara mbi gjysmën tjetër, që rritja e tyre të mos kushtojë asnjë vend të rremë; secili brez lartësie kundrejt brezave të tjerë të ndeshjes mbi të gjithë hartën (i qëndrueshëm ndaj grupimit); cilindra hapësirë-kohë: një rreth në një ose dy të pesatat e gjatësisë së ndeshjes, kundrejt shpërndarjes së vet të ngjarjeve të ndeshjes në vend dhe në kohë (skanimi i permutimit hapësirë-kohë).
- **Provimi.** p nga raporti i gjasës kuazi; Benjamini-Hochberg mbi çdo rajon të provuar në çdo hartë (700.000 në tre harta është e zakonshme) në 5%. Ajo që kalon shkurtohet (një rajon që është kryesisht brenda një më të fortit të masës së vet thotë të njëjtën gjë), lexohet përsëri për **qëndrueshmërinë** e tij - ndeshjet që e panë, ndeshjet ku ishte, drejtimi i tij në pesë palë të ndeshjeve - dhe provohet edhe një herë me variancën që vetë ndeshjet tregojnë (e qëndrueshme ndaj grupimit, ndeshjet si grupe, asnjëherë nën Poisson), BH sërish. Vende të qeta mbi një bazë (2% ose më shumë e ngjarjeve të hartës: spawn-e, ngritje dhe ulje) lihen jashtë.
- **Efekti.** Raporti i shkallës (ose i gjasave), i tkurrur me Bayes empirik (një paraprak gama i përshtatur me blloqet 2x2 të hartës), me interval ~95% te shpërndarja; Gi* në 1, 2 dhe 4 qeliza dhe Moran lokal në qendër.
- **Dukshmëria vizuale.** Sa tregon tashmë rajoni në harta e thjeshtë e nxehtësisë të ngjarjes së vet (shkallë logaritmike deri te qeliza më e ndritshme, siç i vizaton pamja): kontrasti i tij me një unazë rreth tij (një e dhjeta e paletës është e vështirë për t'u parë, dy të pestat e thjeshtë) dhe një majë e ndritshme që mbart tepricën; një raport nuk vizatohet kurrë nga harta e nxehtësisë, kështu që një pjesë numërohet për gjysmë. Nën 35% është **e fshehur**. Renditja: forca (efekti që ngopet në 4 herë, vende të qeta në 0,7) herë `1 - 0,7 x dukshmëria` herë pajtueshmëria e palëve.

Skeda **Vende** i liston (vetëm të fshehurat si parazgjedhje; sipas hartës, formës, drejtimit); një klik konturon vendet e hartës në pamjen 3D (`placeLines.ts`: vijat e motorit, të ndërtuara një herë - magjenta për të fshehurat, qelibar për ato të thjeshta, cian për të qetat, ajo e zgjedhur e plotë; një brez si kuti nga dyshemeja në tavan) dhe në pëlhurën e skedës Harta; **Ngarko** fluturon atje dhe ngarkon 60 ndeshjet që e mbanin më shpesh, të filtruara sipas ngjarjes së saj (dhe klasës).

#### Nisha (`src/mass/niche.ts`) {#niches-srcmassnichets}

Kërkim rreze (gjerësia 24, thellësia 3) mbi tre tabela: **jetët** (jetët e lojtarëve: loja, harta, modaliteti, klasa, mjeti, palë, niveli, tremujori i datave, e treta e gjatësisë së ndeshjeve; K/D, fitorja, vdekja një jetë, vrasjet në orë, fitimet në minutë), **vendet** (vrasjet dhe vdekjet sipas hartës, modalitetit, datave, sektorit të hartës 4 x 4, klasës, palës, brezit) dhe **fazat** (sektori dhe e pesta e ndeshjes: K/D, vdekjet në orë prezence). Një grup provohet kundrejt të tërës me ndeshjet si grupe (variancë sanduiç e mbetjeve të tij sipas ndeshjes), efekti i tij është raport gjasash ose shkalle i tkurrur me një paraprak prej 20 rezultatesh; i duhen 30 rezultate në 8 ndeshje, një përafrim duhet të jetë 10% më i fortë se prindi i vet, grupet ku rezultati është asnjë ose i gjithë (nuk u regjistrua për ta) lihen jashtë. Mbahen: BH nën 5% mbi çdo grup i vlerësuar, një raport i tkurruar prej 1,25 (ose 1/1,25) të paktën, katër nga pesë palët pajtohen, jo një përafrim që vetëm përsërit prindin. Skeda **Nisha** i liston; një klik shfaq çdo përafrim me një kusht të grupit (eksploruesi), **Ngarko** ngarkon ndeshjet e tij. Ngarkesat nuk janë ende në përmbledhje.

#### Ndryshimet e meta-s me rëndësi praktike {#meta-shifts-with-practical-significance}

Me data të përziera, binomiali mbi jetë quante pothuajse çdo ndryshim domethënës. `meta` tani provohet i qëndrueshëm ndaj grupimit (jetët e secilës ndeshje një grup), mban vetëm një zhvendosje përdorimi prej të paktën 2 pikësh dhe 25%, një zhvendosje K/D prej 1,3 herë, tremujorët e datave që trendojnë në të njëjtën mënyrë (tau i Kendall-it të paktën 0,5), dhe, për një mjet në disa harta, të njëjtën drejtim në shumicën e tyre. Kjo lë vetëm pak zhvendosje mbi një grup provash ku testi i thjeshtë shënonte pothuajse të gjitha.

#### Për një model {#for-a-model}

`massReportForModel` i jep çdo vendi `region` (formën, të fshehurin, dukshmërinë, lartësitë, fazën) dhe çdo nishe `conditions`, plus sa rajone dhe grupe u provuan. Lenti i njohurive mund t'i lexojë vendet si zona vrasjeje dhe korridore sulmi: llojet e tyre janë `place.*` dhe `niche.*`.

#### Kontrollet {#checks}

`scan.test.ts` mbjell një zonë të shpërndarë (1,6 herë shkalla e vdekjes mbi një rreth prej 22 qelizash, e lehtë në çdo qelizë), një korridor, një brez lartësie dhe një grumbull vetëm-faze në 240 ndeshje sintetike të mbi-shpërndara - të gjitha gjenden, ajo e shpërndarë fshihet - dhe ekzekuton tetë grupe nul prej 60 ndeshjesh: asnjë vend.
`niche.test.ts` gjen një grup të mbjellë mjet x hartë x palë dhe asgjë në pesë tabela nul.
