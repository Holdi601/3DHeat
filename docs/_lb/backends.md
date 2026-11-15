---
title: "Déi zwee Backends"
parent: "Rendering-Interna"
nav_order: 1
lang: "lb"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---


# All zwee Backends

E Browser kann eng Säit op zwou Manéieren d'Grafikkaart benotze loossen, WebGPU (méi neies) a WebGL2. D'Visualisatioun kann béid, a wielt selwer deen beschten. Dir musst also normalerweis näischt maachen. Fir ze gesinn, wat Dir hutt: **Backend** an der Statistikanzeig (oben riets an der Ansiicht).

![D'Statistikanzeig: Backend, FPS, Frame, Zeilen am Fënster, Sprites / Frame, Budget, Heat-Opléisung, Ofdeckung](../assets/img/en/performance-stats-overlay.webp)

D'Visualisatioun huet hannert enger Schnëttstell zwee komplett Renderer ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) an **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Béid zeechnen dat selwecht Bild mat den selwechte Algorithmen; d'Shader gi se an WGSL an GLSL ES 3.00 nieft-nieneen. Déi éischt Zeil vun der Statistikanzeig, **Backend**, seet, wéi een leeft. Wann Dir mat der Maus driwwer fuert, gesitt Dir, firwat WebGPU net benotzt gouf, wann et net benotzt gouf.

## Fir Entwéckler {#for-developers}

### Wéi ee gewielt gëtt {#how-one-is-chosen}

Eng Zeechenfläch kann nëmmen eng Aart Kontext hunn, dofir gëtt d'Wiel eemol gemaach, ier iergendeng Zeechnung ufänkt ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Wann WebGL2 net erzwéngen ass: wann `navigator.gpu` existéiert, freet e Adapter mat `powerPreference: 'high-performance'` an e Gerät un a maach den WebGPU-Renderer. All Feeler gëtt als Grond gespäichert.
2. Wann WebGPU erzwéngen ass an et fehlschléit, hält et un: d'Ansiicht weist *Renderer kann net gestart ginn.* mat dem Grond.
3. Soss mécht en de WebGL2-Renderer (friet och de High-Performance-Adapter un). Wann WebGL2 net do ass, oder wann et net op Float-Texturen zeechne kann (`EXT_color_buffer_float`), weist d'Ansiicht de Feeler.

`powerPreference: 'high-performance'` verhënnert, datt e Laptop mat ëmschaltbarer Grafik der Säit seng agebaute GPU gëtt. Doriwwer eraus huet d'Säit näischt ze soen: Hardwarebeschleunegung ass eng Astellung vum Browser.

### URL-Schalter {#url-switches}

Hänkt se un d'Säiteadress un, zum Beispill `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Wierkung |
|---|---|
| `?backend=webgpu` | WebGPU benotzen oder fehlschloen. |
| `?backend=webgl2` | WebGL2 benotzen, och wann WebGPU do ass - trennt "dat zeechent falsch" vun "dat zeechent op WebGPU falsch". |
| `?heat=f16` | 16-Bit-Heat-Akkumulatioun op béide Backends erzwéngen ([Half-float-Akkumulatioun](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: GL-Feeler wärend dem Bild liesen an op `renderer.heatDebug` weisen. Standardmäisseg aus, well `getError` d'Pipeline synchroniséiert. |
| `?occdebug=<n>` | WebGL2-Entwécklerhëllef: ersetzt d'Heat duerch Occlusion-Debug-Wäerter. Net fir de normale Gebrauch. |

### Ënnerscheeder, déi zielen {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Zeilespäicher | Storage-Buffer: en Zeilenindex ass en Array-Index. Freet de gréisste Storage-Buffer-Bindung an d'Buffergréissten vum Adapter un. | Ganzzuel-Texturen (8.192 Texel breet), iwwer `gl_VertexID` adressiert mat enger Blockindex-Textur pro Bild. |
| 32-Bit-Heat-Akkumulatioun | Wann den Adapter `float32-blendable` an `float32-filterable` béid bitt | Wann `EXT_float_blend` do ass |
| Soss | 16-Bit (`r16float`) | 16-Bit (`R16F`) |
| Tiefebereich | [0, 1]; d'Engine multiplizéiert virdru eng Ëmrechnung vun de [-1, 1]-Matrizen vun three.js. Ouni dat läit eng parallel Projektioun - deenen hir Tiefe linear ass - bal ganz ënner 0 a gëtt roueg ewechgeschnidde. | [-1, 1], wéi et ass |
| Uniforms | E Ring vu 256-Byte-ausgerichtete Plazen, eng pro Zeechnung, iwwer Offset gebonnen. `queue.writeBuffer` gëtt an der Rei vun der Queue ausgefouert; wann ee Buffer pro Zeechnung nei geschriwwe gëtt, liest all Zeechnung de leschten Schreiwen. De Uniform-Block vum Heat-Pass ass genau eng 256-Byte-Plaz. | Normal Uniforms |
| Heat-Zil ënner der Canvas-Opléisung | Kritt seng eegen Tiefe-Textur (all Attachment an engem Pass muss dee selwechte Gréisst hunn) | |
| Bildopnam | `captureFrame()` zeechent de Composite nach eng Kéier an en Offscreen-Zil a liest et zréck (headless Chromium zeechent WebGPU, comptéiert awer säi Canvas nie) | Liest den Standard-Framebuffer um nächste gezeechnete Bild zréck |
| Zeréckliesen | Staging-Buffer gehale a erëmbenotzt; ee Leser zu der Zäit ënnerwee | `readPixels`, wat den Treiber freet, wéi Format-/Typ-Paar erlaabt ass |

Béid Backends lueden d'Sprite-Kurventabell als Half-Floats hoch; `queue.writeTexture` vun WebGPU kopéiert rou Bytes, dofir gëtt d'Dateschaft virdru op binary16 kodéiert ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Textur-Limiten {#texture-limits}

`texStorage2D` iwwer `MAX_TEXTURE_SIZE` wirft kee Feeler: d'Reservatioun gëtt fallen gelooss, spéider Uploads schloen fehl, an d'Samplingt gëtt Null. D'WebGL2-Hëllefsfunktioun [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontrolléiert béid Dimensiounen géint d'Limit a wierft e Feeler mat der Gréisst. D'Blockindex-Textur ass zweedimensional (4.096 breet), dofir kann se d'Limit net iwwerschreiden. `src/render/limits.test.ts` fixéiert all Texturdimensioun géint d'Limiten, déi sech méi wéi wäert sinn. De WebGL2-Renderer weist och e Gerät of, dessen maximal Texturgréisst ënner der 8.192 Breet vun der Zeilentextur läit.

### Béid testen {#testing-both}

`npm run smoke` fiert d'richteg App am headless Chromium op WebGL2 (standardmäisseg `http://127.0.0.1:5273/`). Fir WebGPU gëtt `"http://127.0.0.1:5273/?backend=webgpu"` un `node tools/smoke.mjs` mat; fir de Half-Float-Wee `npm run smoke:f16`. `tools/probe-webgpu.mjs` an `tools/probe-present.mjs` (ënner Entwéckler-Tools an [Befehlszeilen-Tools](ref-tools.md)) préiwen, ob Adapter a Präsentatioun an headless Browser verfügbar sinn.
