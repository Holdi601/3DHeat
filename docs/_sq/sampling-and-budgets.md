---
title: "Mostrimi dhe buxhetet"
parent: "Brendësitë e vizatimit"
nav_order: 3
lang: "sq"
source: "sampling-and-budgets.md"
source_hash: "1de02c020b1b"
translated: true
outdated: false
---


# Mostrimi dhe buxhetet

Kur ka shumë pika për t'u vizatuar në një kuadër, shikuesi vizaton një mostër të barabartë dhe e bën çdo pikë të numërojë më shumë, që imazhi të mbetet i saktë. Një kontrollues rregullon sa vizaton, që shikuesi ta mbajë shpejtësinë e kuadrove.

## Kontrollet e panelit të performancës {#performance-panel-controls}

| Kontrolli | Parazgjedhja | Diapazoni (rrëshqitja) |
|---|---|---|
| **Vizato çdo rresht në çdo kuadër** | i ndezur | |
| **Buxheti adaptiv** | i ndezur | |
| **FPS i synuar** | 60 | 20-240 (1000) |
| **Sprite fillestarë / kuadër** (adaptiv) ose **Sprite / kuadër** | 4,00M | 65 536-268 435 456, logaritmik (268 435 456) |
| **Rezolucioni i nxehtësisë** | 100% | 25-100%, shumëzuar me shkallën e fazës së dytë adaptive |
| **Përmirësim progresiv** | i ndezur | Fikur: çdo kuadër është një vlerësim i ri i një kuadri (e dobishme për të parë mostrën e papërpunuar). |

Shih edhe [Paneli i performancës dhe statistikat](performance-and-stats.md).

## Për zhvilluesit {#for-developers}

### Rreshtat kandidatë {#candidate-rows}

Rreshtat ruhen sipas kohës në rend rritës. Dritarja kohore [*lo*, *hi*] bëhet një interval rreshtash me dy kërkime binare mbi kolonën e kohës ([`candidateRange`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)); pa kolonë kohe, çdo rresht është kandidat. Këto janë **Rreshtat në dritare** të shtresës së statistikave. Testet për rresht — filtrat, grupet, ndarja, heqja, prerja, jetëgjatësia — ndodhin më vonë, në shader; një rresht që dështon kushton një thirrje kulmi dhe asnjë fragment.

### Plani i mostrimit {#the-sampling-plan}

[`planFrame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts) e ndan intervalin e kandidatëve në **blloqe prej 4 096 rreshtash radhazi** dhe zgjedh sa të vizatojë nga buxheti i sprite-ve të kuadrit:

- Nëse buxheti mbulon çdo bllok, të gjithë vizatohen — kuadri është i saktë.
- Përndryshe, blloqet merren me një hap të barabartë përgjatë intervalit, të zhvendosur nga një jitter që përparon me raportin e artë çdo kuadër, kështu që kuadrat e njëpasnjëshëm mbulojnë blloqe të ndryshme dhe bashkimi mbushet në mënyrë të barabartë. Ky është një **mostër e shtresëzuar**: çdo pjesë e intervalit kohor përfaqësohet në çdo kuadër.

Nxehtësia e çdo rreshti të vizatuar shumëzohet me **kandidatët / të dorëzuarit**, kështu që nxehtësia e pritur e një kuadri është e saktë në çdo buxhet; vetëm zhurma varet nga buxheti. Rreshtat jetojnë në copa prej 8 388 608 (shih [Qëndrimi i kujtesës së GPU](gpu-memory.md)); një bllok ndahet aty ku kalon një copë, dhe çdo copë merr listën e fillimeve të blloqeve që duhet të vizatojë.

Një plan mund të mbajë më së shumti 65 536 blloqe — 268 435 456 sprite — sepse të dy backend-et mbajnë një buffer fiks me 65 536 vende për fillimet e blloqeve. Një kërkesë për më shumë kufizohet atje, dhe mungesa shfaqet hapur si më shumë kuadra për t'u konverguar.

### Vizato çdo rresht në çdo kuadër {#draw-every-row-each-frame}

**Performanca → Vizato çdo rresht në çdo kuadër** (parazgjedhur **i ndezur**): buxheti bëhet dysheme në vend të tavanit, dhe një kuadër që nis një vlerësim të ri vizaton çdo rresht për të cilin është përgjegjës (deri në tavanin 268M).

Arsyeja: një lëvizje kamere e hedh poshtë grumbullimin, kështu që një kuadër në lëvizje është një vlerësim i vetëm, zhurma e të cilit caktohet nga sa e të dhënave vizatoi — me një të katërtën e tyre të vizatuar, shihni një të katërtën në pika të ndritshme të peshuara, dhe kjo e bën pamjen në lëvizje të shkëlqejë. Vizatimi i gjithçkaje e bën çdo kuadër pamjen e përfunduar. Kostoja është se koha e kuadrit tani ndjek madhësinë e të dhënave në dritare; levat janë një dritare kohe më e ngushtë, filtrat, ose një heqje sipas largësisë, që zvogëlojnë kandidatët në vend që t'i mostrojnë më dendur.

Fikeni në pajisje që nuk mund ta mbajnë gjithë fushën njëherësh: *Sprite / kuadër* bëhet atëherë një kufi i vërtetë, dhe pamja konvergjon gjatë disa kuadrave të palëvizshëm.

Sa kushton një plan i plotë, i matur në një GPU desktopi të klasës së lartë me kanavacë 4K dhe një nivel të madh, me sprite me rreze 1 m (një ose dy piksele): rreth 100M sprite në kuadër me 30 fps, 200M me 15 fps, dhe maksimumi 268M me rreth 12 fps. Me sprite kaq të vegjël, faza e kulmeve është i gjithë kosto, dhe rezolucioni i nxehtësisë nuk ndryshon asgjë; me sprite të mëdhenj, mbushja është: 8M sprite me rreze 100 m morën 2,5 s në kuadër me rezolucion të plotë nxehtësie dhe 170 ms me 25%. **Vizato çdo rresht në çdo kuadër** prandaj nis nga 67M dhe rritet me një të katërtën çdo kuadër ndërsa kuadrat zgjasin nën 150 ms, dhe përgjysmohet ndërsa zgjasin mbi 400 ms, që një pamje e rëndë të mos e çojë një kuadër përtej asaj që lejon watchdog-u i GPU-së.

### Buxheti adaptiv {#the-adaptive-budget}

**Performanca → Buxheti adaptiv** (parazgjedhur i ndezur) e rregullon buxhetin e sprite-ve për të mbajtur **FPS i synuar** ([`BudgetController`](https://github.com/Holdi601/3DHeat/blob/main/src/render/sampling.ts)). Është joaktiv në riluajtjen e kutive dhe gjatë renderimeve video.

Hyrja është koha e kuadrit, e butësuar (90% e mëparshmja + 10% e rejat, me kuadra të vetme të kufizuara në 2 s), kundrejt një synimi prej 1000 / max(15, FPS i synuar) ms.

**Faza e parë — sprite-et.** Çdo kuadër buxheti shumëzohet me `1 + (target / frame - 1) × gain`, me fitim 0,35 kur është shumë ngadalë dhe 0,08 kur ka rezervë, i kufizuar në një faktor 0,5-1,25 për kuadër dhe në 65 536-268 435 456 sprite.

**Faza e dytë — rezolucioni.** Vetëm kur buxheti është tashmë në minimum dhe kuadrat janë ende më shumë se 10% të ngadaltë, rezolucioni i buffer-it të nxehtësisë bie, me 8% për kuadër, deri në 25% të kanavacës; rikthehet me 4% për kuadër kur ka 30% rezervë. Kosto e fragmentit bie me katrorin e rezolucionit, gjë që është pothuajse e padukshme nën një shkallë të butë. (Matur në renderimin softuerik me 10M rreshta dhe sprite shumë të mëdhenj: 141 ms → 17 ms për kuadër.) Shkalla rrumbullakoset në të gjashtëmbëdhjetat; *Rez. nxehtësie* te shtresa e statistikave e tregon.

**Heqja dorë.** Një kuadër i ngadaltë duket njëlloj nëse e shkaktuan sprite-et ose një nivel i rëndë — nuk ka matje kohe për çdo kalim. Nëse buxheti qëndron në minimum dhe kuadrat mbeten nën 70% të synimit për 30 kuadra, sprite-et nuk ishin kostoja: kontrollluesi kalon në **ngjitje**, duke shumëzuar buxhetin me 1,5 çdo 14 kuadra dhe duke rikthyer rezolucionin, për aq kohë sa koha e kuadrit mbetet brenda 1,5× të asaj që ishte në minimum. Një ngjitje që përkeqëson gjërat përtej kësaj kthehet mbrapsht në 60% dhe rifillon kontrollin normal; arritja e synimit e mbyll ngjitjen.

Me buxhetin adaptiv të fikur, buxheti është thjesht **Sprite / kuadër**.

Me *Vizato çdo rresht në çdo kuadër* të ndezur, buxheti adaptiv vazhdon të punojë, por rregulli i saktë e ngre buxhetin për të mbuluar të gjithë rreshtat kandidatë, kështu që në praktikë kontrollon vetëm fazën e rezolucionit dhe kuadrat që nuk nisin një vlerësim të ri.
