---
title: "Dy backend-et"
parent: "Brendësitë e vizatimit"
nav_order: 1
lang: "sq"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dy backend-et

Një shfletues mund ta lejojë një faqe të përdorë kartën grafike në dy mënyra, WebGPU (më e re) dhe WebGL2. Shikuesi mund t'i përdorë të dyja dhe zgjedh vetë më të mirën, kështu që zakonisht nuk bën asgjë. Për të parë cilin përdor, shiko **Backend** në kutinë e statistikave (lart djathtas në pamje).

![Kutia e statistikave: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

Shikuesi ka dy vizatues të plotë pas një ndërfaqeje të vetme ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) dhe **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Të dy vizatojnë të njëjtën pamje me të njëjtat algoritme; hijuesit ekzistojnë në WGSL dhe GLSL ES 3.00 krah për krah. Rreshti i parë i kutisë së statistikave, **Backend**, thotë cili po punon; kur e kalon miun mbi të, shfaqet pse WebGPU nuk u përdor, nëse nuk u përdor.

## Për zhvilluesit {#for-developers}

### Si zgjidhet njëri {#how-one-is-chosen}

Një canvas mund të mbajë vetëm një lloj konteksti, prandaj zgjedhja bëhet një herë, para çdo vizatimi ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Nëse WebGL2 nuk është detyruar: nëse ekziston `navigator.gpu`, kërkohet një adapter me `powerPreference: 'high-performance'` dhe një pajisje, dhe krijohet vizatuesi WebGPU. Çdo dështim mbahet mend si arsye.
2. Nëse WebGPU ishte detyruar dhe dështoi, ndalo: pamja shfaq *Nuk mund të inicializohet vizatuesi.* me arsyen.
3. Përndryshe krijohet vizatuesi WebGL2 (duke kërkuar edhe adapterin me performancë të lartë). Nëse WebGL2 nuk është e disponueshme, ose nuk mund të vizatojë në tekstura me pikë lundruese (`EXT_color_buffer_float`), pamja shfaq gabimin.

`powerPreference: 'high-performance'` e parandalon një laptop me grafikë të ndërrueshme t'i japë faqes GPU-në e integruar. Përtej kësaj, faqja nuk ka zë: përshpejtimi me harduer është cilësim i shfletuesit.

### Çelësat në URL {#url-switches}

Shto në adresën e faqes, për shembull `http://127.0.0.1:5273/?backend=webgl2`.

| Parametri | Efekti |
|---|---|
| `?backend=webgpu` | Përdor WebGPU ose dështon. |
| `?backend=webgl2` | Përdor WebGL2 edhe aty ku WebGPU është e disponueshme, për të ndarë "kjo vizaton keq" nga "kjo vizaton keq në WebGPU". |
| `?heat=f16` | Detyron rrugën e grumbullimit të nxehtësisë me 16 bit në secilin backend ([Grumbullimi me gjysmë-pikë lundruese](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: lexon gabimet e GL gjatë kornizës dhe i ekspozon te `renderer.heatDebug`. Joaktive si parazgjedhje, sepse `getError` është pikë sinkronizimi të tubacionit. |
| `?occdebug=<n>` | Ndihmë për zhvilluesit në WebGL2: zëvendëson nxehtësinë me vlera korrigjimi të okluzionit. Jo për përdorim normal. |

### Dallimet që kanë rëndësi {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Ruajtja e rreshtave | Buffer ruajtjeje: indeksi i rreshtit është një indeks vargu. Kërkon madhësinë më të madhe të lidhjes së buffer-it të ruajtjes së adapterit dhe madhësitë e buffer-ave. | Tekstura të plota (8.192 texel gjerësi) të adresuara nga `gl_VertexID` përmes një teksture blloku-indeksi për kornizë. |
| Grumbullimi i nxehtësisë 32-bit | Kur adapteri ofron si `float32-blendable` ashtu edhe `float32-filterable` | Kur ekziston `EXT_float_blend` |
| Përndryshe | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Gama e thellësisë | [0, 1]; motori paraprakisht shumëzon një ri-shkallëzim të matricave [-1, 1] të three.js. Pa të, një projeksion paralel, thellësia e të cilit është lineare, bie pothuajse tërësisht nën 0 dhe hiqet pa zë. | [-1, 1], përdoret ashtu siç është |
| Uniformat | Një unazë sllotesh të rreshtuara me 256 bajt, nga një për vizatim, e lidhur me zhvendosje - `queue.writeBuffer` renditet në radhë, kështu që një buffer i rishkruar për çdo vizatim do ta bënte çdo vizatim të lexonte shkrimin e fundit. Blloku uniform i kalimit të nxehtësisë është saktësisht një slloté 256-bajtëshe. | Uniforma të zakonshme |
| Objektivi i nxehtësisë nën rezolucionin e canvas-it | Merr teksturën e vet të thellësisë (çdo bashkëngjitje në një kalim duhet të ketë të njëjtën madhësi) | |
| Kapja e kornizës | `captureFrame()` e vizaton përbërjen edhe një herë në një objektiv jashtëekranor dhe e lexon mbrapsht (Chromium pa kokë vizaton WebGPU, por nuk e përbën kurrë canvas-in e vet) | Lexon mbrapsht buffer-in e parazgjedhur të kornizës në kornizën e ardhshme të vizatuar |
| Leximi mbrapsht | Buffer-at e ndërmjetëm mbahen dhe ripërdoren; një lexues në fluturim në të njëjtën kohë | `readPixels`, duke pyetur driverin cila çift format/lloj është e lejuar |

Të dy backend-et ngarkojnë tabelën e kurbave të sprite-ve si gjysmë-pika lundruese; `queue.writeTexture` i WebGPU kopjon bajtë të papërpunuar, prandaj të dhënat kodohen fillimisht në binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Kufijtë e teksturave {#texture-limits}

`texStorage2D` mbi `MAX_TEXTURE_SIZE` nuk hedh gabim: alokimi lihet pa efekt, ngarkimet e mëvonshme dështojnë dhe mostrimi kthen zero. Ndihmësi WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontrollon të dyja dimensionet kundrejt kufirit dhe hedh gabim me madhësinë; tekstura e blloku-indeksit është dydimensionale (4.096 gjerësi), kështu që nuk mund ta kalojë një kufi; dhe `src/render/limits.test.ts` fikson çdo dimension teksture kundrejt kufijve që vlen të mbështeten. Vizatuesi WebGL2 gjithashtu refuzon një pajisje me madhësi maksimale teksture më të vogël se 8.192 gjerësia e teksturës së rreshtave.

### Testimi i të dyjave {#testing-both}

`npm run smoke` e drejton aplikacionin e vërtetë në Chromium pa kokë në WebGL2 (si parazgjedhje `http://127.0.0.1:5273/`); jep `"http://127.0.0.1:5273/?backend=webgpu"` te `node tools/smoke.mjs` për WebGPU, dhe `npm run smoke:f16` për rrugën me gjysmë-pika lundruese. `tools/probe-webgpu.mjs` dhe `tools/probe-present.mjs` (të listuara te mjetet e zhvilluesit në [Mjetet e komandës](ref-tools.md)) diagnostikojnë disponueshmërinë e adapterit dhe të paraqitjes në shfletues pa kokë.
