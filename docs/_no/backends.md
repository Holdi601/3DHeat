---
title: "De to backendene"
parent: "Rendering i detalj"
nav_order: 1
lang: "no"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# De to backendene

En nettleser kan la en side bruke grafikkortet på to måter, WebGPU (nyere) og WebGL2. Visningsprogrammet kan bruke begge og velger selv den beste, så du gjør vanligvis ingenting. Se hvilken du bruker: **Backend** i statistikkboksen (øverst til høyre i visningen).

![Statistikkboksen: Backend, FPS, Frame, Rader i vinduet, Sprites / bilde, Budsjett, Varmeoppl., Dekning](../assets/img/en/performance-stats-overlay.webp)

Visningsprogrammet har to komplette tegnemotorer bak ett grensesnitt ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) og **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Begge tegner det samme bildet med de samme algoritmene; shaderne finnes i WGSL og GLSL ES 3.00 side om side. Første linje i statistikkboksen, **Backend**, sier hvilken som kjører. Holder du musepekeren over den, vises hvorfor WebGPU ikke ble brukt, når den ikke ble det.

## For utviklere {#for-developers}

### Slik velges en {#how-one-is-chosen}

Et lerret kan bare holde én type kontekst, så valget gjøres én gang, før noe tegnes ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Med mindre WebGL2 er tvunget: hvis `navigator.gpu` finnes, be om en adapter med `powerPreference: 'high-performance'` og en enhet, og lag WebGPU-tegnemotoren. Hver feil huskes som årsak.
2. Hvis WebGPU var tvunget og feilet, stopper det: visningen viser *Kan ikke starte tegnemotoren.* med årsaken.
3. Ellers lages WebGL2-tegnemotoren (og den ber også om den høyytelses adapteren). Hvis WebGL2 ikke finnes, eller ikke kan tegne til flyttekstturer (`EXT_color_buffer_float`), viser visningen feilen.

`powerPreference: 'high-performance'` er det som hindrer en bærbar PC med svitsjbar grafikk i å gi siden den integrerte GPU-en. Utover det har ikke siden noe å si: maskinvareakselerasjon er en nettleserinnstilling.

### URL-bryttere {#url-switches}

Legg til etter sideadressen, for eksempel `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Effekt |
|---|---|
| `?backend=webgpu` | Bruk WebGPU, eller feil. |
| `?backend=webgl2` | Bruk WebGL2 også der WebGPU finnes, slik at "dette tegnes feil" skilles fra "dette tegnes feil på WebGPU". |
| `?heat=f16` | Tving 16-bits varmeakkumuleringen på begge backendene ([Flyttallsakkumulering](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: les GL-feil under bildet og vis dem på `renderer.heatDebug`. Av som standard, fordi `getError` er et synkroniseringspunkt i pipelinen. |
| `?occdebug=<n>` | WebGL2-hjelp for utviklere: erstatter varmen med feilsøkingsverdier for skjuling. Ikke til vanlig bruk. |

### Forskjeller som betyr noe {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Lagring av rader | Lagringsbuffere: en radindeks er en matrisesubskript. Ber om adapterens største lagringsbufferbinding og bufferstørrelser. | Heltallsteksturer (8 192 teksler brede) adressert fra `gl_VertexID` gjennom en blokkindekstekstur per bilde. |
| 32-bits varmeakkumulering | Når adapteren tilbyr både `float32-blendable` og `float32-filterable` | Når `EXT_float_blend` finnes |
| Ellers | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Dybdeområde | [0, 1]; motoren multipliserer inn en omskalering av three.js sine [-1, 1]-matriser. Uten den havner en parallell projeksjon, der dybden er lineær, nesten helt under 0 og klippes bort uten varsel. | [-1, 1], brukt som den er |
| Uniform-verdier | En ring av 256-byte-justerte plasser, én per tegning, bundet med offset. `queue.writeBuffer` er ordnet på køen, så om én buffer ble skrevet om for hver tegning, ville alle tegninger lese den siste skrivingen. Varmepassets uniform-blokk er nøyaktig én 256-byte-plass. | Vanlige uniform-verdier |
| Varmemål under lerretsoppløsning | Får sin egen dybdetekstur (alle vedlegg i et pass må være like store) | |
| Bildefangst | `captureFrame()` tegner sammensetningen en gang til i et skjult mål og leser den tilbake (headless Chromium tegner WebGPU, men setter aldri lerretet sammen) | Leser standardbildebufferen tilbake ved neste tegnede bilde |
| Tilbakelesing | Mellomlagringsbuffere holdes og brukes om igjen; én leser om gangen | `readPixels`, etter å ha spurt driveren hvilket format/type-par som er lovlig |

Begge backendene laster opp kurvetabellen for sprites som halvflyttall. WebGPU sin `queue.writeTexture` kopierer rå bytes, så dataene kodes først til binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Teksturgrenser {#texture-limits}

`texStorage2D` over `MAX_TEXTURE_SIZE` kaster ingen feil: allokeringen forkastes, senere opplastinger feiler, og sampling gir null. WebGL2-hjelperen [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) sjekker begge dimensjonene mot grensen og kaster en feil med størrelsen. Blokkindeksteksturen er todimensjonal (4 096 bred), så den kan ikke vokse forbi en grense. `src/render/limits.test.ts` fester hver teksturdimensjon mot grensene som er verdt å støtte. WebGL2-tegnemotoren avviser også en enhet der største teksturstørrelse er under radteksturens bredde på 8 192.

### Testing av begge {#testing-both}

`npm run smoke` kjører den virkelige appen i headless Chromium på WebGL2 (som standard `http://127.0.0.1:5273/`). Gi `"http://127.0.0.1:5273/?backend=webgpu"` til `node tools/smoke.mjs` for WebGPU, og `npm run smoke:f16` for halvflyttallsveien. `tools/probe-webgpu.mjs` og `tools/probe-present.mjs` (listet under utviklerverktøy i [Kommandolinjeverktøy](ref-tools.md)) diagnostiserer om adapter og presentasjon finnes i headless nettlesere.
