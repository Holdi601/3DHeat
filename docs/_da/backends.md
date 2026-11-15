---
title: "De to backends"
parent: "Renderingens indre"
nav_order: 1
lang: "da"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# De to backends

En browser kan lade en side bruge grafikkortet på to måder, WebGPU (nyere) og WebGL2. Fremviseren kan bruge begge og vælger selv den bedste, så du normalt ikke behøver at gøre noget. Se hvilken du bruger: **Backend** i statistikpanelet (øverst til højre i visningen).

![Statistikpanelet: Backend, FPS, Billede, Rækker i vinduet, Sprites / billede, Budget, Varmeopløsning, Dækning](../assets/img/en/performance-stats-overlay.webp)

Fremviseren har to komplette renderere bag ét grænseflade ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) og **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Begge tegner det samme billede med de samme algoritmer; shaderne findes i WGSL og GLSL ES 3.00 side om side. Statistikpanelets første linje, **Backend**, viser, hvilken der kører. Holder du musen over den, vises, hvorfor WebGPU ikke blev brugt, hvis den ikke blev det.

## Til udviklere {#for-developers}

### Sådan vælges én {#how-one-is-chosen}

Et lærred kan kun have én slags kontekst, så valget træffes én gang, før der tegnes noget ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Medmindre WebGL2 er tvunget: Hvis `navigator.gpu` findes, anmodes der om en adapter med `powerPreference: 'high-performance'` og en enhed, og WebGPU-rendereren oprettes. Enhver fejl gemmes som årsagen.
2. Hvis WebGPU var tvunget og fejlede, stopper det. Visningen viser *Kan ikke initialisere rendereren.* med årsagen.
3. Ellers oprettes WebGL2-rendereren (også med en anmodning om den højtydende adapter). Hvis WebGL2 ikke findes, eller ikke kan tegne til float-teksturer (`EXT_color_buffer_float`), viser visningen fejlen.

`powerPreference: 'high-performance'` er det, der forhindrer en bærbar computer med skiftbar grafik i at give siden dens integrerede GPU. Ud over det har siden ingen indflydelse. Hardwareacceleration er en browserindstilling.

### URL-kontakter {#url-switches}

Tilføj til sideadressen, for eksempel `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Virkning |
|---|---|
| `?backend=webgpu` | Brug WebGPU, ellers fejl. |
| `?backend=webgl2` | Brug WebGL2, også hvor WebGPU findes. Skiller "dette tegnes forkert" fra "dette tegnes forkert på WebGPU". |
| `?heat=f16` | Tving 16-bit varmeakkumulering på begge backends ([Akkumulering i halv præcision](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: læs GL-fejl under billedet og vis dem på `renderer.heatDebug`. Slået fra som standard, fordi `getError` er et synkroniseringspunkt i pipelinen. |
| `?occdebug=<n>` | WebGL2-udviklerhjælp: erstatter varmen med debugværdier for okklusion. Ikke til normal brug. |

### Forskelle, der betyder noget {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Lagring af rækker | Lagerbuffere: et rækkeindeks er et array-indeks. Beder om adapterens største bindingsstørrelse for lagerbuffere og bufferstørrelser. | Heltalsteksturer (8.192 texels brede), adresseret fra `gl_VertexID` gennem en blokindekstekstur pr. billede. |
| 32-bit varmeakkumulering | Når adapteren tilbyder både `float32-blendable` og `float32-filterable` | Når `EXT_float_blend` findes |
| Ellers | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Dybdeområde | [0, 1]; motoren ganger en omregning af three.js' [-1, 1]-matricer på forhånd. Uden den lander en parallel projektion, hvis dybde er lineær, næsten helt under 0 og bliver klippet væk uden besked. | [-1, 1], brugt som den er |
| Uniforms | En ring af 256-byte-justerede pladser, én pr. tegning, bundet med offset. `queue.writeBuffer` er ordnet på køen, så hvis én buffer blev omskrevet pr. tegning, ville hver tegning læse den sidste skrivning. Varmepassets uniform-blok er præcis én 256-byte-plads. | Almindelige uniforms |
| Varmemål under lærredets opløsning | Får sin egen dybdetekstur, fordi alle vedhæftninger i et pass skal have samme størrelse | |
| Billedoptagelse | `captureFrame()` tegner sammensætningen igen i et offscreen-mål og læser det tilbage. Headless Chromium tegner WebGPU, men sammensætter aldrig sit lærred. | Læser standardbilledbufferen tilbage ved næste tegnede billede |
| Tilbagelæsning | Stagingbuffere beholdes og genbruges. Én læser er i gang ad gangen. | `readPixels`, efter at driveren er spurgt, hvilket format/type-par der er lovligt |

Begge backends uploader sprite-kurvetabellen som half floats. WebGPUs `queue.writeTexture` kopierer rå bytes, så dataene kodes først til binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Teksturgrænser {#texture-limits}

`texStorage2D` ud over `MAX_TEXTURE_SIZE` kaster ikke en fejl. Allokeringen droppes, senere uploads fejler, og sampling giver nul. WebGL2-hjælperen [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) kontrollerer begge dimensioner mod grænsen og kaster en fejl med størrelsen. Blokindekstexturen er todimensional (4.096 bred), så den ikke kan vokse ud over en grænse. `src/render/limits.test.ts` fastlåser hver teksturdimension mod de grænser, der er værd at understøtte. WebGL2-rendereren afviser også en enhed, hvis maksimale teksturstørrelse er under rækketeksturens bredde på 8.192.

### Test af begge {#testing-both}

`npm run smoke` kører den rigtige app i headless Chromium på WebGL2 (som standard `http://127.0.0.1:5273/`). Send `"http://127.0.0.1:5273/?backend=webgpu"` til `node tools/smoke.mjs` for WebGPU, og brug `npm run smoke:f16` for halv-float-stien. `tools/probe-webgpu.mjs` og `tools/probe-present.mjs` (listet under udviklerværktøjer i [Kommandolinjeværktøjer](ref-tools.md)) undersøger, om adapteren og præsentationen er tilgængelige i headless browsere.
