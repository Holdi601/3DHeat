---
title: "Brendësitë e vizatimit"
nav_order: 22
has_children: true
lang: "sq"
source: "rendering-internals.md"
source_hash: "4c9327ee5852"
translated: true
outdated: false
---

# Brendësitë e vizatimit

Shikuesi vizaton miliona pika si pika që shkëlqejnë dhe i mbledh së bashku. Ky seksion shpjegon truket që e mbajnë këtë të shpejtë, dhe çfarë do të thotë çdo numër në kutinë e statistikave. Lexoje nëse shikuesi duket i ngadaltë, ose nëse do të punosh te vizatuesi.

```
data -> time window -> GPU filters -> sampling plan -> splat -> accumulate -> colour -> screen
```

Për të parë si po shkon kompjuteri yt, shiko kutinë e statistikave lart djathtas në pamje: [Paneli i performancës dhe statistikat](performance-and-stats.md). Fjalët e reja (GPU, row, sprite, heatmap) janë në [fjalorthi](glossary.md).

## Problemi kryesor {#the-core-problem}

Një shumë rampash radiale që mbivendosen kushton *N* × π*r*² fragmente të përzier për kornizë. Me 100 milionë sprite-e të rrezes 8 px kjo bën 2 × 10¹⁰ fragmente - rreth një sekondë punë në një GPU të klasit të lartë. Nuk mund të forcohet me dhunë çdo kornizë, prandaj shikuesi kombinon:

- **rreshta të renditur sipas kohës** - një dritare kohore është dy kërkime binare, dhe kostoja e luajtjes ndjek rreshtat në dritare, jo grupin e të dhënave;
- **asgjë për rresht në CPU për kornizë** - rreshtat jetojnë në memorien e GPU, të kuantizuar; filtrat, shenjat e grupeve, testi i jetëgjatësisë, dritarja, prerja dhe prerja e pamjes vlerësohen në hijuesin e kulmeve;
- **mostrim i shtresuar** me pesha kompensuese kur një kornizë nuk mund të vizatojë çdo rresht, dhe **grumbullim progresiv** që konvergjon në përgjigjen e saktë me të gjithë rreshtat ndërsa pamja mbetet e pandryshuar ([Mostrimi dhe buxhetet](sampling-and-budgets.md), [Grumbullimi](accumulation.md));
- **një shtytës me dy faza** që shkëmben sprite-et për kornizë, pastaj rezolucionin e nxehtësisë, për shkallë kornizash ([Mostrimi dhe buxhetet](sampling-and-budgets.md#the-adaptive-budget));
- **buxhete memorie të detyrueshme**, kështu që një grup të dhënash që nuk hyn shkurtohet dukshëm në vend që të rrëzojë aplikacionin ([Qëndrimi i kujtesës së GPU](gpu-memory.md)).

## Një kornizë {#one-frame}

Cikli i kornizës është [`Engine.frame`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts). Gjithçka që ndryshon me shkallën e kornizave - kamera, koka e luajtjes, buxheti - jeton te motori, jo në gjendjen e aplikacionit, kështu që një kornizë nuk kushton punë React; gjendja lexohet një herë për kornizë dhe shkruhet përsëri vetëm për leximet me frekuencë të ulët.

1. **Të dhëna të reja?** Një grup i ri të dhënash njoftohet (*Uploading N rows to the GPU*) në një kornizë dhe ngarkohet në kornizën tjetër, që mesazhi të vizatohet para se puna të bllokojë fillin. Një nivel i ri i jepet vizatuesit; rrugët e nxehtësisë së vijës ndërtohen ose lirohen.
2. **Koka e luajtjes** përparon (e kufizuar në 0,1 s kohë reale për kornizë), rrotullohet ose ndalet.
3. **Kamera** lexon tastet, miun dhe gamepad-in; pasqyrimi i boshtit përfshihet në matricën e pamjes; në WebGPU një matricë ri-shkallëzimi i thellësisë e shndërron gamën e thellësisë OpenGL të three.js në atë të WebGPU.
4. **Çfarë është e dukshme**: gama kohore nga shiriti kohor dhe historia; tabela e shenjave të grupeve (dukshmëria vetëm nën një ndarje sipas kolonës); deri në katër filtra - filtra kolonash dhe zgjedhja e Entiteteve; ndarja e ndryshimit.
5. **Tabelat e ngjyrave dhe të kurbave** ririndërtohen nëse cilësimet e tyre ndryshuan.
6. **Buxheti**: kontrolluesi adaptiv e cakton buxhetin e sprite-ve të kornizës dhe rezolucionin e nxehtësisë; me *Vizato çdo rresht çdo kornizë* buxheti ngrihet të mbulojë çdo rresht kandidat.
7. **Nënshkrimet** vendosin çfarë do të thotë ende objekti i grumbullimit: një ndryshim në çdo gjë që ndryshon cilët rreshta kontribuojnë ose si (*gjeometria*), në dritaren kohore, ose vetëm në mënyrën si ngjyroset rezultati (*përbërja*). Shih [Grumbullimi](accumulation.md#what-restarts-it).
8. **Plani i mostrimit**: cilët blloqe rreshtash të vizatohen ([Mostrimi dhe buxhetet](sampling-and-budgets.md)).
9. **Mënyra e grumbullimit**: rivendosje, zgjatje, mesatare lëvizëse, mesatare rrjedhëse, ose e pazënë.
10. **Gjeometria e riprodhimit të kutisë** (kube, gjurmë) në CPU, vetëm në atë mënyrë dhe vetëm kur nuk është e pazënë.
11. **Vizatimi**: backend-i vizaton skenën (niveli, rrjeti, boshtet, kutitë, gjurmët, vizorja), e shpërndan nxehtësinë në objektivin e nxehtësisë, e bashkon me grumbulluesin dhe e përbën nxehtësinë mbi skenë në canvas.
12. **Ekspozimi automatik** ndizet kur numërimi mbrapsht arrin zero; sonda e nxehtësisë së vizores lexon një piksel të shpeshtën çdo 120 ms; leximet publikohen.

Një kornizë e pazënë - e konverguar, pa asnjë ndryshim - e kapërcen skenën dhe shpërndarjen, por prapë **rikomponon**: një canvas WebGL i krijuar pa `preserveDrawingBuffer` ka përmbajtje të papërcaktuar pas përbërjes, kështu që mbështetja te ajo për të mbajtur kornizën e fundit nuk është e sigurt. Objektivat e skenës dhe të nxehtësisë janë framebuffer-et e vetë shikuesit dhe e mbajnë përmbajtjen, kështu që një kornizë e pazënë kushton një kalim me ekran të plotë.

## Faqet në këtë seksion {#pages-in-this-section}

- [Dy backend-et](backends.md) - WebGPU dhe WebGL2, si zgjidhet njëri, çelësat në URL
- [Grumbullimi](accumulation.md) - rivendosje, zgjatje, mesatare lëvizëse, mesatare rrjedhëse
- [Mostrimi dhe buxhetet](sampling-and-budgets.md) - mostruesi i shtresuar, modaliteti i saktë, buxheti adaptiv
- [Grumbullimi me gjysmë-pikë lundruese](half-float-accumulation.md) - gama dhe saktësia te objektivat 16-bit
- [Qëndrimi i kujtesës së GPU](gpu-memory.md) - ruajtja e kuantizuar e rreshtave dhe buxheti i detyrueshëm i GPU
- [Zbulimi i vizatimit me softuer](software-rendering.md)
- [Paneli i performancës dhe statistikat](performance-and-stats.md)
