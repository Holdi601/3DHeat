---
title: "Iż-żewġ backends"
parent: "Id-dettalji tar-rendering"
nav_order: 1
lang: "mt"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Iż-żewġ backends

Browser jista' jħalli paġna tuża l-karta tal-grafika b'tnejn mill-modi: WebGPU (aktar ġdid) u WebGL2. Il-viewer jista' juża t-tnejn u jagħżel dak l-aħjar waħdu, għalhekk normalment ma tagħmel xejn. Ara liema wieħed qed tuża: **Backend** fil-overlay tal-statistiċi (fil-lemin ta' fuq tal-view).

![L-overlay tal-statistiċi: Backend, FPS, Frame, Ringieli fit-tieqa, Sprites / frame, Baġit, Riż. tas-sħana, Kopertura](../assets/img/en/performance-stats-overlay.webp)

Il-viewer għandu żewġ renderers sħaħ wara interface waħda ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) u **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). It-tnejn jagħmlu l-istess stampa bl-istess algoritmi; l-shaders jeżistu fil-WGSL u fil-GLSL ES 3.00 flimkien. L-ewwel linja tal-overlay tal-statistiċi, **Backend**, tgħid liema wieħed qed jaħdem; jekk tgħabbel fuqha tara għaliex ma nżammx WebGPU, meta ma nżammx.

## Għall-iżviluppaturi {#for-developers}

### Kif wieħed jintgħażel {#how-one-is-chosen}

Canvas jista' jżomm tip wieħed ta' context biss, għalhekk l-għażla ssir darba, qabel ma jsir kwalunkwe tpinġija ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Sakemm WebGL2 mhuwiex imġiegħel: jekk `navigator.gpu` jeżisti, titlob adapter b'`powerPreference: 'high-performance'` u device, u toħloq ir-renderer tal-WebGPU. Kwalunkwe falliment jinżamm bħala r-raġuni.
2. Jekk WebGPU kien imġiegħel u falla, tieqaf: il-view juri *Cannot initialise the renderer.* bir-raġuni.
3. Inkella toħloq ir-renderer tal-WebGL2 (wkoll billi titlob l-adapter b'high-performance). Jekk WebGL2 ma jkunx disponibbli, jew ma jistax jpinġi f'texture tal-float (`EXT_color_buffer_float`), il-view juri l-errur.

`powerPreference: 'high-performance'` huwa dak li jimpedixxi li laptop b'grafika mibdula jagħti lill-paġna l-GPU integrat tiegħu. Barra minn hekk il-paġna ma għandha x'tgħid: l-aċċelerazzjoni bl-hardware hija issettjar tal-browser.

### Switches fl-URL {#url-switches}

Żid mal-indirizz tal-paġna, per eżempju `http://127.0.0.1:5273/?backend=webgl2`.

| Parametru | Effett |
|---|---|
| `?backend=webgpu` | Uża WebGPU jew tfalli. |
| `?backend=webgl2` | Uża WebGL2 anke fejn WebGPU huwa disponibbli - tifred "dan jitpinġa ħażin" minn "dan jitpinġa ħażin fuq WebGPU". |
| `?heat=f16` | Iforza l-mod tal-akkumulazzjoni tas-sħana f'16-bit fuq it-tnejn il-backends ([Akkumulazzjoni half-float](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: jaqra l-erruri tal-GL matul il-frame u juriehom fuq `renderer.heatDebug`. Mitfi b'mod awtomatiku għax `getError` huwa punt ta' sinkronizzazzjoni tal-pipeline. |
| `?occdebug=<n>` | Għodda għall-iżviluppaturi tal-WebGL2: tbiddel is-sħana bi valuri ta' debug tal-occlusion. Mhux għall-użu normali. |

### Differenzi li jimportaw {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Ħażna tar-ringieli | Buffers tal-ħażna: indiċi ta' ringiela huwa subscript ta' array. Jitlob l-akbar binding tal-buffer tal-ħażna tal-adapter u d-daqsijiet tal-buffers. | Textures ta' interi (8,192 texel wiesa') indirizzati minn `gl_VertexID` permezz ta' texture ta' indiċi tal-blokki għal kull frame. |
| Akkumulazzjoni tas-sħana f'32-bit | Meta l-adapter joffri it-tnejn `float32-blendable` u `float32-filterable` | Meta jkun hemm `EXT_float_blend` |
| Inkella | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Firxa tal-fond | [0, 1]; l-engine jimmultiplika minn qabel remap tal-matriċi ta' three.js li huma [-1, 1]. Mingħajrha, projezzjoni paralella - li l-fond tagħha huwa lineari - tinżel kważi kollha taħt 0 u titqatta' bis-silenzju. | [-1, 1], użata kif inhi |
| Uniforms | Ring ta' slots allinjati ta' 256-byte, wieħed għal kull draw, marbuta bl-offset - `queue.writeBuffer` jiġi ordnat fuq il-queue, għalhekk buffer wieħed erġa' miktub għal kull draw kien ikollu kull draw jaqra l-aħħar kitba. Il-blokk uniform tal-pass tas-sħana huwa slot ta' 256-byte eżatt. | Uniforms ordinarji |
| Target tas-sħana taħt ir-riżoluzzjoni tal-canvas | Jieħu depth texture tiegħu (kull attachment f'pass irid ikun l-istess daqs) | |
| Qbid tal-frame | `captureFrame()` jerġa' jpinġi l-composite f'target offscreen u jaqrah lura (il-headless Chromium jpinġi WebGPU imma qatt ma jikkompożixxi l-canvas tiegħu) | Jaqra l-framebuffer default lura fuq il-frame li jitpinġa li jmiss |
| Readback | Staging buffers miżmuma u użati mill-ġdid; qarrej wieħed f'titjira fl-istess ħin | `readPixels`, billi jistaqsi lid-driver liema pari format/type hu legali |

It-tnejn il-backends jagħtu upload lit-tabella tal-curve tal-isprite bħala half floats; `queue.writeTexture` tal-WebGPU jikkopja bytes gravi, għalhekk id-dejta tiġi kodifikata l-ewwel għal binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limiti tat-texture {#texture-limits}

`texStorage2D` lil hinn minn `MAX_TEXTURE_SIZE` ma jitfax eċċezzjoni: l-allokazzjoni titwarrab, l-uploads sussegwenti jfallu u l-sampling jagħti zero. L-għajnuna tal-WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) tiċċekkja t-tnejn id-dimensjonijiet kontra l-limitu u titfa' eċċezzjoni bid-daqs; it-texture tal-indiċi tal-blokki hija dimensjonali (4,096 wiesgħa) għalhekk ma tistax tikber lil hinn minn limitu; u `src/render/limits.test.ts` jorbot kull dimensjoni ta' texture mal-limiti li jiswew is-sforz. Ir-renderer tal-WebGL2 jirrifjuta wkoll apparat li l-massimu tad-daqs tat-texture tiegħu huwa aktar baxx mill-wiesa' ta' 8,192 tat-texture tar-ringieli.

### Ittestjar tat-tnejn {#testing-both}

`npm run smoke` iħaddem l-app vera f'Chromium headless fuq WebGL2 (b'mod awtomatiku `http://127.0.0.1:5273/`); għal WebGPU agħti `"http://127.0.0.1:5273/?backend=webgpu"` lil `node tools/smoke.mjs`, u għall-mod half-float `npm run smoke:f16`. `tools/probe-webgpu.mjs` u `tools/probe-present.mjs` (elenkati taħt għodod għall-iżviluppaturi fi [Għodod mill-linja tal-kmand](ref-tools.md)) jiddijanjostikaw id-disponibbiltà tal-adapter u tal-preżentazzjoni fil-browsers headless.
