---
title: "A két háttérrendszer"
parent: "Renderelés belső működése"
nav_order: 1
lang: "hu"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# A két háttérrendszer

A böngésző kétféleképpen engedheti, hogy egy oldal a grafikus kártyát használja: WebGPU (újabb) és WebGL2. A nézegető mindkettőt tudja használni, és maga választja ki a legjobbat, így általában nem kell tenned semmit. Azt, hogy melyiken vagy, a **Backend** sorban látod a statisztikai átfedésen (a nézet jobb felső sarkában).

![A statisztikai átfedés: Backend, FPS, Képkocka, Sorok az ablakban, Sprite / képkocka, Keret, Hőfelbontás, Lefedettség](../assets/img/en/performance-stats-overlay.webp)

A nézegetőben két teljes renderelő van egy közös felület mögött ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): a **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) és a **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Mindkettő ugyanazt a képet rajzolja ugyanazokkal az algoritmusokkal; a shaderek WGSL és GLSL ES 3.00 nyelven, egymás mellett léteznek. A statisztikai átfedés első sora, a **Backend**, megmondja, melyik fut; ha fölé viszed az egeret, megmutatja, miért nem a WebGPU-t használja, ha nem azt.

## Fejlesztőknek {#for-developers}

### Hogyan választjuk ki {#how-one-is-chosen}

Egy vászon csak egyféle kontextust tarthat, ezért a választás egyszer történik meg, mielőtt bármit rajzolnánk ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Hacsak nincs kényszerítve a WebGL2: ha létezik a `navigator.gpu`, kérünk egy adaptert `powerPreference: 'high-performance'` beállítással, egy eszközt, és létrehozzuk a WebGPU renderelőt. Minden hibát megjegyzünk mint okot.
2. Ha a WebGPU-t kényszerítették és az hibázott, megállunk: a nézet a *Nem lehet inicializálni a renderelőt.* üzenetet mutatja az okkal együtt.
3. Egyébként létrehozzuk a WebGL2 renderelőt (szintén a nagy teljesítményű adaptert kérve). Ha a WebGL2 nem érhető el, vagy nem tud lebegőpontos textúrába rajzolni (`EXT_color_buffer_float`), a nézet a hibát mutatja.

A `powerPreference: 'high-performance'` akadályozza meg, hogy a váltható grafikájú laptop a beépített GPU-t adja az oldalnak. Azon túl az oldalnak nincs beleszólása: a hardveres gyorsítás a böngésző beállítása.

### URL-kapcsolók {#url-switches}

A weboldal címéhez fűzd hozzá, például: `http://127.0.0.1:5273/?backend=webgl2`.

| Paraméter | Hatás |
|---|---|
| `?backend=webgpu` | WebGPU használata, különben hiba. |
| `?backend=webgl2` | WebGL2 használata akkor is, ha a WebGPU elérhető - elkülöníti a „rosszul rajzol” esetet a „rosszul rajzol a WebGPU-n” esettől. |
| `?heat=f16` | A 16 bites hőakkumulációs út kényszerítése bármelyik háttérrendszeren ([Félpontos akkumuláció](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: a képkocka alatt olvassa a GL-hibákat, és a `renderer.heatDebug`-on teszi elérhetővé. Alapból ki van kapcsolva, mert a `getError` szinkronizálási pont. |
| `?occdebug=<n>` | WebGL2 fejlesztői segéd: a hőt takarás-hibakeresési értékekkel helyettesíti. Nem normál használatra. |

### Lényeges különbségek {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Sortárolás | Tárolópuffer: a sorindex tömbindex. Az adapter legnagyobb tárolópuffer-kötését és puffermeretét kéri. | Egész textúrák (8 192 texel széles), a `gl_VertexID`-ről, képkockánként frissülő blokkindex-textúrán keresztül címezve. |
| 32 bites hőakkumuláció | Ha az adapter kínálja a `float32-blendable` és a `float32-filterable` is | Ha az `EXT_float_blend` jelen van |
| Egyébként | 16 bites (`r16float`) | 16 bites (`R16F`) |
| Mélységtartomány | [0, 1]; a motor a three.js [-1, 1] mátrixainak átskálázását előre beszorozza. Enélkül a párhuzamos vetítés - melynek mélysége lineáris - szinte teljesen 0 alá esik, és csendben levágódik. | [-1, 1], változtatás nélkül |
| Uniformok | 256 bájtra igazított helyek gyűrűje, rajzolásonként egy, eltolással kötve - a `queue.writeBuffer` a sorban rendezett, így ha egy puffert rajzolásonként újraírnánk, minden rajzolás az utolsó írást olvasná. A hőpassz uniform blokkja pontosan egy 256 bájtos hely. | Szokásos uniformok |
| Hőcél a vászon felbontása alatt | Saját mélységtextúrát kap (a passz minden csatolmányának egyforma méretűnek kell lennie) | |
| Képkocka-rögzítés | A `captureFrame()` a kompozitot másodszor rajzolja egy képernyőn kívüli célba, és onnan olvassa vissza (a fej nélküli Chromium rendereli a WebGPU-t, de a vásznát nem komponálja) | Az alapértelmezett keretpuffert olvassa vissza a következő kirajzolt képkockánál |
| Visszaolvasás | Megtartott és újrahasznosított átmeneti pufferek; egyszerre egy olvasó van folyamatban | `readPixels`, a meghajtótól kérdezve, melyik formátum-típus páros érvényes |

Mindkét háttérrendszer félpontos számokként tölti fel a sprite-görbe táblázatot; a WebGPU `queue.writeTexture` nyers bájtokat másol, ezért az adatot először binary16-ra kódoljuk ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Textúrakorlátok {#texture-limits}

A `MAX_TEXTURE_SIZE` fölötti `texStorage2D` nem dob hibát: a foglalás elvész, a későbbi feltöltések meghiúsulnak, és a mintavétel nullát ad. A WebGL2 segédfüggvény, a [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts), mindkét méretet ellenőrzi a korláthoz képest, és a mérettel együtt hibát dob; a blokkindex-textúra kétdimenziós (4 096 széles), ezért nem nőhet túl egy korláton; a `src/render/limits.test.ts` pedig minden textúraméretet a fontos korlátokhoz rögzít. A WebGL2 renderelő azt az eszközt is visszautasítja, amelynek a legnagyobb textúraméretje a sortextúra 8 192-es szélessége alatt van.

### Mindkettő tesztelése {#testing-both}

Az `npm run smoke` a valódi alkalmazást vezérli fej nélküli Chromiumban WebGL2-n (alapértelmezés szerint `http://127.0.0.1:5273/`); a WebGPU-hoz add át a `"http://127.0.0.1:5273/?backend=webgpu"` címet a `node tools/smoke.mjs` parancsnak, a félpontos útvonalhoz pedig az `npm run smoke:f16` parancsot használd. A `tools/probe-webgpu.mjs` és a `tools/probe-present.mjs` (a fejlesztői eszközök között, a [Parancssori eszközök](ref-tools.md) oldalon) fej nélküli böngészőkben vizsgálják az adapter és a megjelenítés elérhetőségét.
