---
title: "Kujtesa dhe buxhetet"
parent: "Si të futni të dhënat"
nav_order: 6
lang: "sq"
source: "memory-and-budgets.md"
source_hash: "e04306dab5a0"
translated: true
outdated: false
---

# Kujtesa, buxhetet dhe kontrolli i përshtatjes

Kompjuteri juaj ka kujtesë të kufizuar. 3DHeat mbledh atë që u duhet skedarëve tuaj dhe ju tregon, para **Ngarko**, nëse përshtaten.

![Vlerësimi i memories "nuk përshtatet", me Ngarko çdo [N] rresht të plotësuar paraprakisht dhe butonin Ngarko që thotë Shumë e madhe - zvogëloje ose kalo çdo rresht](../assets/img/en/memory-and-budgets-wont-fit.webp)

*Shumë e madhe për këtë kompjuter? 3DHeat sugjeron të ngarkohet çdo rresht i N-të në vend të tyre.*

Një skedë shfletuesi që mbaron memorien gjatë një ngarkimi rrëzohet dhe humb minuta punë, dhe një GPU që kërkon më shumë sesa ka humb ose kontekstin ose ngadalësohet shumë. Prandaj, para se të nisë një ngarkim, paneli Burimi thotë sa memorie i duhet, e krahason me buxhetet e zbuluara për këtë makinë, dhe refuzon - me një rrugëdalje - kur nuk do të përshtatet. Modeli është te [`src/data/memory.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts).

## Vlerësimi i memories {#the-memory-estimate}

Shfaqet mbi butonin **Ngarko** pasi rreshtat janë numëruar.

| Rreshti | Kuptimi |
|---|---|
| **Vlerësimi i memories** - *përshtatet* / *ngushtë* / *nuk përshtatet* | Vendimi, i gjelbër, i verdhë ose i kuq. |
| `N rreshta · B B/rresht` | Rreshtat që do të ngarkohen (pas hapit) dhe bajtet e qëndrueshme për rresht. |
| `RAM X e pranishme, Y kulm gjatë ngarkimit` | Memoria e mbajtur kur është ngarkuar, dhe kulmi gjatë ngarkimit. |
| `GPU Z · ngarkim i vlerësuar T` | Memoria e GPU për rreshtat, dhe një kohëzgjatje e vlerësuar me 1,2 milion rreshta në sekondë. |
| emri i GPU | Emri i renderuesit, kur drejtuesi e raporton. |
| Mesazhet | Pse nuk përshtatet, ose është ngushtë, dhe çfarë të bëhet. |
| **Ngarko çdo [N] rresht** | Hapi i pakësimit (shih më poshtë). |
| `Buxheti: X RAM, Y GPU. Rregulloje te Performanca → Buxhetet e burimeve.` | Buxhetet që përdori kontrolli. |

### Bajtet për rresht {#bytes-per-row}

| Kolona | Të qëndrueshme (RAM) | Shënime |
|---|---|---|
| Pozicioni | 12 | Tre numra me pikë lëvizëse 32-bit, gjithmonë (një bosht i sheshtë është akoma një varg) |
| Koha | 4 | Kur është e pasqyruar |
| Jetëgjatësia | 4 | Kur koha dhe personi janë të pasqyruara |
| Personi | 4 | Kur është i pasqyruar |
| Grupi | 2 | Kur është i pasqyruar |
| Seanca | 4 | Kur është e pasqyruar |
| `Source file` | 4 | Kur ngarkohet më shumë se një skedar |
| Çdo kolonë filtri | 4 | Për çdo kolonë të zgjedhur *Mbaje për filtrim* |

**Kulmi** shton atë që kërkon ngarkimi vetëm përkohësisht - 8 bajt kohë 64-bit gjatë bashkimit, 12 bajt çelësa renditjeje dhe tregues, 4 bajt memorie pune për ndryshimin e renditjes (të tre kur koha është e pasqyruar), dhe 4 bajt ndërsa kolona e grupit është akoma 32-bit - dhe shumëzon shumën me **2,0**. Ky faktor u matë (një ngarkim i vërtetë me disa skedarë arriti 1,9 × vargjet e numëruara, nga grupi i punës i dekoduesit Parquet, kopjet që e shkurtojnë çdo kolonë në gjatësi, dhe memoria e liruar por jo akoma e kthyer) dhe u rrumbullakos lart, sepse një nënvlerësim kushton një skedë të rrëzuar ndërsa një mbivlerësim kushton vetëm një hap të panevojshëm.

Në **GPU** çdo rresht kushton 8 bajt (pozicioni dhe grupi, nga 16 bit secili), plus 4 bajt (koha dhe jetëgjatësia, nga 16 bit secila) kur janë të pasqyruara si koha ashtu edhe personi. Shih [Qëndrueshmëria e memories së GPU](gpu-memory.md). Teksturat e filtrimit (4 bajt për rresht për çdo filtër aktiv) dhe fillimet e segmenteve të nxehtësisë së vijave (8 bajt për rresht ndërsa mënyra Vija është e ndezur) nuk janë pjesë e këtij vlerësimi.

## Kontrolli i përshtatjes {#the-fit-check}

Krahasohen tre kufizime ([`checkFit`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts)):

- kulmi i RAM kundrejt **buxhetit të RAM**,
- bajtet e GPU kundrejt **buxhetit të GPU**,
- numri i rreshtave kundrejt **tavanit të renditjes** prej 400.000.000 rreshtash, kur është pasqyruar një kolonë kohe.

Raporti më i keq nga të tre vendos: deri 70% *përshtatet*, deri 100% *ngushtë* (duhet të ngarkohet, por prit që të jetë i ngadaltë), mbi këtë *nuk përshtatet*. Kur nuk përshtatet, paneli emëron kufizimin që e kufizon dhe sugjeron:

- ngarkimin e çdo *N*-të rresht, me *N* = ⌈rreshta / rreshta që përshtaten⌉, të plotësuar paraprakisht në kutinë e hapit;
- heqjen e kolonave të filtrit, heqjen e pasqyrimit të kolonës së kohës (që heq renditjen dhe tavanin e saj, me koston e linjës kohore), ose rritjen e buxhetit.

Kur vetë buxheti nuk është fakt për harduerin - shfletuesi e kufizoi shifrën e RAM, parazgjedhja u ul nga ajo që është e lirë tani, ose shifra e GPU është një hamendësim - mesazhi e thotë këtë, që të mos kapni një hap që nuk ju duhet.

### Pakësimi {#decimation}

**Ngarko çdo [N] rresht** mban një rresht nga *N*, i numëruar për skedar. Nxehtësia është një mesatare, kështu që çdo rresht i N-të jep të njëjtën shpërndarje me më shumë zhurmë - e njëjta shkëmbim që bën vizatuesi çdo kornizë. Kutia fillon nga 1 (*rresht (të gjitha)*); kur zgjedhja nuk përshtatet, plotësohet paraprakisht me hapin e sugjeruar, përveç nëse keni shkruar diçka në të. Butoni Ngarko shfaq atëherë *Ngarko N skedarë (1 në K)*, dhe emri i grupit të të dhënave regjistron `every Kth row`.

### Tavani i renditjes {#the-sort-ceiling}

Vizatuesi kërkon rreshta në renditje rritëse të kohës, kështu që një kolonë kohe e pasqyruar do të thotë renditje e çdo rreshti, me një renditje radix mbi çelësa 32-bit ([`sort.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/sort.ts)). Mbi **400 milionë** rreshta kjo refuzohet, në vend që të provohet në një skedë. Kjo kontrollohet para ngarkimit, kështu që një zgjedhje mbi kufirin refuzohet me një sugjerim hapi, në vend që të lexohet e tërë dhe të dështojë në hapin e fundit. Pranë kufirit (*ngushtë*) paneli paralajmëron se renditja është një kalim i gjatë pa progres të vet. Pa kolonë kohe nuk bëhet renditje dhe nuk zbatohet asnjë tavan.

## Buxhetet e burimeve {#resource-budgets}

**Performanca → Buxhetet e burimeve** (një rresht i palosshëm në fund të panelit Performanca, që lexon `Buxhetet e burimeve - RAM, GPU, bërthama`). Buxhetet zbulohen; shifra e zbuluar është parazgjedhja; dhe rrëshqitësit nuk shkojnë më lart se një **tavan** që është shifra e zbuluar, përveç kur zbulimi dihet të mos jetë matje.

| Kontrolli | Shtrirja | Kuptimi |
|---|---|---|
| **RAM për të dhënat e rreshtave** | 256 MiB deri në tavanin e RAM, logaritmike | Buxheti i RAM për kontrollin e përshtatjes. Shënohet *(mbi të zbuluarën)* pas parazgjedhjes së zbuluar, *(maks)* në tavan. |
| **GPU për të dhënat e rreshtave** | 128 MiB deri në tavanin e GPU, logaritmike | Buxheti i GPU për kontrollin e përshtatjes dhe ngarkimin e rreshtave. Shënohet *(mbi të zbuluarën)* pas parazgjedhjes së zbuluar, *(maks)* në tavan. |
| **Fijet e analizuesit** | 1 deri në numrin logjik të bërthamave | Sa skedarë analizohen njëkohësisht, secili në një punëtor të vet. Parazgjedhja bërthama - 2 (bërthama - 1 kur janë katër ose më pak). Shih [Fijet e analizuesit](#parser-threads) (nën Për zhvilluesit). |
| Rreshti i burimeve | | Nga erdhi çdo shifër (`RAM: …. GPU: …. CPU: ….`). |
| **Rizbulo** | | Kërkon nga serveri i zhvillimit një lexim të ri të memories dhe ri-llogarit çdo buxhet. |
| emri i GPU | | Emri i shkurtër i përshtatësit; vargu i plotë i renderuesit është tooltip-i. |

### Ngritja e buxhetit të GPU {#raising-the-gpu-budget}

Një buxhet GPU mbi shifrën e zbuluar zbatohet ashtu si është vendosur: kontrolli i përshtatjes dhe ngarkimi marrin të njëjtën shifër nga një funksion ([`effectiveGpuBudget`](https://github.com/Holdi601/3DHeat/blob/main/src/render/budget.ts)), që e kufizon vetëm në tavanin e GPU ku ndalon rrëshqitësi. Kështu një ngarkim që kontrolli e kalon ngarkohet i plotë. Mbi shifrën e zbuluar rrëshqitësi lexon *(mbi të zbuluarën)*: numri është atëherë gjykimi juaj për kartën, jo një matje, dhe vendosja e tij më lart se ç'ka karta rrezikon një kontekst të humbur ose një ngadalësim të rëndë.

## Grupet shumë të mëdha: levat {#huge-datasets-the-levers}

Nga më e lira te më drastikja:

1. **Më pak kolona filtri.** Çdo kolonë është 4 bajt për rresht dhe një kalim dekodimi.
2. **Një hap.** Çdo rresht i N-të.
3. **Pa kolonë kohe.** Pa renditje, pa tavan renditjeje, pa 4-8 bajt për rresht kohë dhe jetëgjatësi - dhe pa linjë kohore.
4. **Ngrini buxhetet**, kur e dini që memoria është atje.

Në kohën e renderimit, grupet e mëdha trajtohen me marrje mostrash dhe akumulim progresiv, jo duke e zvogëluar të dhënën; shih [Marrja e mostrave dhe buxhetet](sampling-and-budgets.md).

## Për zhvilluesit {#for-developers}

### Fijet e analizuesit {#parser-threads}

Një ngarkim me disa skedarë analizon deri në **Fijet e analizuesit** prej tyre njëkohësisht, secili në një punëtor analizuesi të nisur nga punëtori i marrjes për atë ngarkim ([`ingestFiles.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/data/ingestFiles.ts), `parseInOrder`). Në 1, ose për një skedar të vetëm, skedarët analizohen njëri pas tjetrit në vetë punëtorin e marrjes.

Ekzekutimi i disave njëkohësisht nuk e lehtëson kontrollin e përshtatjes:

- **Ndërtuesi numërohet së pari.** Kolonat e bashkuara ndahen për të gjithë zgjedhjen para se të lexohet skedari i parë, kështu që skedarët në udhë marrin vetëm atë që lë buxheti i RAM pranë tyre (`parseHeadroom`): pozicioni, koha 64-bit, këndet e shikimit, personi, grupi 32-bit, seanca, kolonat e filtrit dhe `Source file`, për rresht që do të ngarkohet - shumëzuar me 2,6 kur numri i rreshtave është vlerësim CSV, për një kolonë që rritet në një më të madhe.
- **Çdo skedar rezervon koston e vet përpara se të nisë** (`fileParseBytes`): rreshtat e tij (nga footer-i Parquet; pjesa e CSV nga vlerësimi sipas madhësisë) herë të njëjtat kolona, herë **8** - vetë blloku, kopja pranë tij ndërsa hiqen rreshtat pa pozicion, dhe grupi punës i dekoduesit, që për kolonat tekstuale është shumë më i madh se id-të e tyre. Një hap nuk e zvogëlon këtë, sepse skedarët lexohen të tërë dhe pakësohen më pas. Shifra 8 është një lejim i vendosur me matje: me 3, ose me 5, tridhjetë fije analizuesi e shtynë një skedë mbi kufirin e saj me 86 milionë rreshta me emra personash dhe seancash; me 8 nuk e bënë.
- **Një skedar tjetër nis vetëm nëse rezervimi i tij përshtatet** me atë që mbetet. Një skedar që ka mbaruar por pret një më të hershëm të bashkohet mban rezervimin e vet deri sa të bashkohet.
- **Një skedar gjithmonë ekzekutohet.** Kur nuk ka asgjë të rezervuar, skedari tjetër nis sado që kushton - ky është ngarkimi një-nga-një që kontrolli i përshtatjes e pranoi, kështu që një buxhet i ngushtë bie mbrapsht në të në vend që të refuzojë.

Shifra *kulmi gjatë ngarkimit* është kulmi i një ngarkimi një-nga-një, që vjen te renditja, pasi janë lexuar të gjithë skedarët. Skedarët e analizuar njëri pranë tjetrit mund të marrin më shumë memorie se kjo shifër ndërsa lexohen; rezervimet e mbajnë brenda buxhetit të RAM, aq sa janë të sakta vlerësimet më sipër.

Rendi i bashkimit është rendi i zgjedhjes, pavarësisht nga rendi në të cilin përfundojnë skedarët, kështu që numërimi i personit, grupit dhe seancës, rreshtat dhe vlerat `Source file` janë të njëjta me një ngarkim një-nga-një. Një skedar që nuk mund të lexohet kapërcehet dhe listohet ashtu si më parë. Një punëtor analizuesi që vdes e mbyll tërë ngarkimin, siç e mbyllte gjithmonë vdekja e punëtorit të marrjes, dhe çdo punëtor analizuesi ndalohet kur mbyllet ngarkimi, si të mbyllet. Nëse punëtorët analizues nuk mund të nisen fare, skedarët analizohen në vend në punëtorin e marrjes.

### Si zbulohen shifrat {#how-the-figures-are-detected}

[`detectBudgets`](https://github.com/Holdi601/3DHeat/blob/main/src/data/memory.ts) ekzekutohet në nisje, përsëri kur ekziston renderuesi, dhe te **Rizbulo**.

**RAM, me serverin e zhvillimit.** `start.bat` dhe `npm run dev` shërbejnë faqen nga një proces që mund të lexojë memorien e makinës, te `/__host/memory` (i përgjigjur brenda 1,5 s ose i injoruar). Parazgjedhja është më e vogla midis 60% të RAM të instaluar dhe 80% të RAM të lirë tani; tavani është 60% e asaj të instaluar. Kur memoria e lirë është ajo që e ul parazgjedhjen, paneli e thotë këtë dhe sugjeron mbylljen e programeve dhe shtypjen e **Rizbulo**.

**RAM, pa të** (një vendosje statike): asnjë API e shfletuesit nuk raporton memorien e lirë, dhe `navigator.deviceMemory` rrumbullakoset poshtë në një fuqi të dytë dhe kufizohet në 8 GiB nga Chrome dhe Edge. Parazgjedhja është 60% e `deviceMemory`, e kufizuar edhe në 4 × heap-in e lirë JS të skedës aty ku shfletuesi e raporton, ose 4 GiB kur nuk raportohet asgjë. Kur `deviceMemory` lexon saktësisht 8 (kufiri), shifra shënohet si *e kufizuar* dhe tavani është 4 × parazgjedhja, me një shënim se mbi parazgjedhjen numri është pohimi juaj, jo një matje.

**Në të dyja rastet**, parazgjedhja dhe tavani i RAM kufizohen në **12 GiB**, kujtesa më e madhe e vargjeve të tipizuara që mund ta mbajë një skedë Chrome, sido që të jetë makina (një faqe arriti rreth 15,75 GB dhe dështoi; 12 lë vend për gjithçka tjetër), dhe nuk zbresin kurrë nën 256 MiB.

**Memoria e GPU.** Asnjë API web nuk e raporton fare.

- Me serverin e zhvillimit, memoria e kartës lexohet nga `nvidia-smi` (përshtatësi më i madh) ose, në Windows, nga vlera e regjistrit `HardwareInformation.qwMemorySize` e përshtatësit të ekranit. Parazgjedhja është 70% e saj, tavani 90%.
- Pa një lexim, ajo nxirret: 2 GiB si parazgjedhje; 4 GiB kur tekstura më e madhe është 16.384 px ose më shumë (kartë diskrete), 1 GiB kur është më e vogël; ose 8 × `maxBufferSize` i WebGPU kur ai është më i madh. Tavani është atëherë 8 × shifra e nxjerrë, sepse nxjerrja e dallon një pjesë të integruar nga një diskrete dhe asgjë më të imët. Paneli thotë se shifra është e nxjerrë.
- Asnjëherë nën 128 MiB.

**CPU.** `navigator.hardwareConcurrency` (4 kur nuk raportohet).
