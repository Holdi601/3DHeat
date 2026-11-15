---
title: "De två bakändarna"
parent: "Rendering i detalj"
nav_order: 1
lang: "sv"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# De två bakändarna

En webbläsare kan låta en sida använda grafikkortet på två sätt, WebGPU (nyare) och WebGL2. Visaren kan använda båda och väljer själv den bästa, så du behöver normalt inte göra något. Se vilken du använder: **Backend** i statistikrutan (uppe till höger i vyn).

![Statistikrutan: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

Visaren har två kompletta renderare bakom ett gemensamt gränssnitt ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) och **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Båda ritar samma bild med samma algoritmer; shaderna finns i WGSL och GLSL ES 3.00 sida vid sida. Statistikrutans första rad, **Backend**, säger vilken som körs. Om du håller muspekaren över den visas varför WebGPU inte användes, om den inte användes.

## För utvecklare {#for-developers}

### Så väljs en {#how-one-is-chosen}

En canvas kan bara ha en sorts kontext, så valet görs en gång, innan något ritas ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Om WebGL2 inte är tvingat: om `navigator.gpu` finns, begär en adapter med `powerPreference: 'high-performance'` och en enhet, och skapa WebGPU-renderaren. Ett fel sparas som skäl.
2. Om WebGPU var tvingat och misslyckades, stanna: vyn visar *Cannot initialise the renderer.* med skälet.
3. Annars skapa WebGL2-renderaren (också med begäran om den högpresterande adaptern). Om WebGL2 inte finns, eller inte kan rita till flyttalstexturer (`EXT_color_buffer_float`), visar vyn felet.

`powerPreference: 'high-performance'` är det som hindrar en bärbar dator med växlingsbar grafik från att ge sidan dess integrerade GPU. Utöver det har sidan ingen makt: hårdvaruacceleration är en webbläsarinställning.

### URL-växlar {#url-switches}

Lägg till efter sidadressen, till exempel `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Effekt |
|---|---|
| `?backend=webgpu` | Använd WebGPU eller misslyckas. |
| `?backend=webgl2` | Använd WebGL2 även där WebGPU finns. Skiljer "det här ritas fel" från "det här ritas fel på WebGPU". |
| `?heat=f16` | Tvinga 16-bitars värmeackumuleringen på båda bakändarna ([Ackumulering i halvprecision](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: läs GL-fel under bildrutan och visa dem i `renderer.heatDebug`. Av som standard, eftersom `getError` är en synkpunkt i pipelinen. |
| `?occdebug=<n>` | WebGL2-hjälp för utvecklare: ersätter värmen med felsökningsvärden för skymning. Inte för vanlig användning. |

### Skillnader som spelar roll {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Radlagring | Lagringsbuffrar: ett radindex är ett arrayindex. Begär adapterns största bindning för lagringsbuffrar och buffertstorlekar. | Heltalstexturer (8 192 texeler breda) adresserade från `gl_VertexID` via en blockindextextur som uppdateras varje bildruta. |
| 32-bitars värmeackumulering | När adaptern erbjuder både `float32-blendable` och `float32-filterable` | När `EXT_float_blend` finns |
| Annars | 16-bitars (`r16float`) | 16-bitars (`R16F`) |
| Djupintervall | [0, 1]; motorn multiplicerar in en omskalning av three.js matriser från [-1, 1]. Utan den hamnar en parallell projektion, vars djup är linjärt, nästan helt under 0 och klipps bort tyst. | [-1, 1], används som det är |
| Uniforms | En ring av 256-bytes-justerade platser, en per ritning, bundna via offset. `queue.writeBuffer` körs i ordning på kön, så om en buffert skrevs om per ritning skulle varje ritning läsa den senaste skrivningen. Värmepassets uniform-block är exakt en 256-bytesplats. | Vanliga uniforms |
| Värmemål under canvasupplösning | Får en egen djuptextur (alla bilagor i ett pass måste vara lika stora) | |
| Bildfångst | `captureFrame()` renderar kompositen en gång till i ett osynligt mål och läser tillbaka den (headless Chromium renderar WebGPU men komponerar aldrig sin canvas) | Läser av standardbufferten vid nästa renderade bildruta |
| Tillbakaläsning | Mellanlagringsbuffrar behålls och återanvänds; en läsare i taget | `readPixels`, efter att ha frågat drivrutinen vilket format- och typpar som är lagligt |

Båda bakändarna laddar upp kurvtabellen för sprites som halva flyttal. `queue.writeTexture` i WebGPU kopierar råa byte, så data kodas först till binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Texturgränser {#texture-limits}

`texStorage2D` över `MAX_TEXTURE_SIZE` ger inget fel: allokeringen tappas, senare uppladdningar misslyckas och sampling ger noll. WebGL2-hjälpfunktionen [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontrollerar båda måtten mot gränsen och kastar ett fel med storleken. Blockindextexturen är tvådimensionell (4 096 bred) så att den inte kan växa ur en gräns. `src/render/limits.test.ts` låser varje texturmått mot de gränser som är värda att stödja. WebGL2-renderaren vägrar också en enhet vars största texturstorlek är mindre än radtexturens bredd på 8 192.

### Testa båda {#testing-both}

`npm run smoke` kör den riktiga appen i headless Chromium på WebGL2 (som standard `http://127.0.0.1:5273/`). Skicka `"http://127.0.0.1:5273/?backend=webgpu"` till `node tools/smoke.mjs` för WebGPU, och `npm run smoke:f16` för halvflyttalsvägen. `tools/probe-webgpu.mjs` och `tools/probe-present.mjs` (listade under utvecklarverktyg i [Kommandoradsverktyg](ref-tools.md)) diagnostiserar om adaptern och bildvisningen finns i headless-webbläsare.
