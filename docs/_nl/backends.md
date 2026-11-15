---
title: "De twee backends"
parent: "Renderinginterne werking"
nav_order: 1
lang: "nl"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# De twee backends

Een browser kan een pagina op twee manieren de grafische kaart laten gebruiken, WebGPU (nieuwer) en WebGL2. De viewer kan beide gebruiken en kiest zelf de beste, dus je hoeft meestal niets te doen. Zie welke je gebruikt: **Backend** in de statistiekenoverlay (rechtsboven in de weergave).

![De statistiekenoverlay: Backend, FPS, Frame, Rijen in venster, Sprites / frame, Budget, Warmte-resolutie, Dekking](../assets/img/en/performance-stats-overlay.webp)

De viewer heeft twee volledige renderers achter één interface ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) en **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Beide tekenen hetzelfde beeld met dezelfde algoritmen; de shaders bestaan naast elkaar in WGSL en GLSL ES 3.00. De eerste regel van de statistiekenoverlay, **Backend**, zegt welke draait; als je erop wijst, zie je waarom WebGPU niet is gebruikt, als dat niet het geval is.

## Voor ontwikkelaars {#for-developers}

### Hoe er één wordt gekozen {#how-one-is-chosen}

Een canvas kan maar één soort context bevatten, dus de keuze wordt één keer gemaakt, voor elke tekening ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Tenzij WebGL2 is afgedwongen: als `navigator.gpu` bestaat, vraag dan een adapter op met `powerPreference: 'high-performance'` en een device, en maak de WebGPU-renderer. Elke fout wordt onthouden als reden.
2. Als WebGPU was afgedwongen en het is mislukt, stop: de weergave toont *Renderer kan niet worden gestart.* met de reden.
3. Maak anders de WebGL2-renderer (ook met de adapter voor hoge prestaties). Is WebGL2 niet beschikbaar, of kan het niet naar float-texturen tekenen (`EXT_color_buffer_float`), dan toont de weergave de fout.

`powerPreference: 'high-performance'` zorgt dat een laptop met schakelbare grafische kaarten de pagina niet de geïntegreerde GPU geeft. Verder heeft de pagina er niets over te zeggen: hardwareversnelling is een browserinstelling.

### URL-schakelaars {#url-switches}

Voeg toe aan het paginaadres, bijvoorbeeld `http://127.0.0.1:5273/?backend=webgl2`.

| Parameter | Effect |
|---|---|
| `?backend=webgpu` | Gebruik WebGPU of laat het mislukken. |
| `?backend=webgl2` | Gebruik WebGL2, ook waar WebGPU beschikbaar is - scheidt "dit tekent verkeerd" van "dit tekent verkeerd op WebGPU". |
| `?heat=f16` | Forceer het 16-bit pad voor warmteopbouw op elke backend ([Half-float-accumulatie](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: lees GL-fouten tijdens het frame en toon ze op `renderer.heatDebug`. Standaard uit, omdat `getError` een synchronisatiepunt van de pijplijn is. |
| `?occdebug=<n>` | WebGL2-hulpmiddel voor ontwikkelaars: vervangt de warmte door debugwaarden voor occlusie. Niet voor normaal gebruik. |

### Verschillen die ertoe doen {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Rijopslag | Opslagbuffers: een rij-index is een array-subscript. Vraagt de grootste opslagbuffer-binding en buffergroottes van de adapter. | Integer-texturen (8.192 texels breed) benaderd vanuit `gl_VertexID` via een per-frame blokindex-textuur. |
| 32-bit warmteopbouw | Wanneer de adapter zowel `float32-blendable` als `float32-filterable` aanbiedt | Wanneer `EXT_float_blend` aanwezig is |
| Anders | 16-bit (`r16float`) | 16-bit (`R16F`) |
| Dieptebereik | [0, 1]; de engine vermenigvuldigt vooraf een herschaling van de [-1, 1]-matrices van three.js. Zonder die herschaling landt een parallelle projectie - waarvan de diepte lineair is - bijna helemaal onder 0 en wordt die stilzwijgend weggeknipt. | [-1, 1], zoals het is gebruikt |
| Uniforms | Een ring van 256-byte-uitgelijnde sleuven, één per tekenopdracht, gebonden via een offset - `queue.writeBuffer` wordt op de queue in volgorde uitgevoerd, dus als één buffer per tekenopdracht werd herschreven, zou elke tekenopdracht de laatste schrijfactie lezen. Het uniform-blok van de warmtepass is precies één 256-byte-sleuf. | Gewone uniforms |
| Warmtedoel onder de canvasresolutie | Krijgt een eigen diepte-textuur (elke bijlage in een pass moet even groot zijn) | |
| Framevastlegging | `captureFrame()` tekent de compositie opnieuw in een doel buiten het scherm en leest die terug (headless Chromium tekent WebGPU, maar zet het canvas nooit samen) | Leest de standaard framebuffer terug bij het volgende getekende frame |
| Terugleesactie | Stagingbuffers worden bewaard en hergebruikt; één lezer tegelijk onderweg | `readPixels`, waarbij het stuurprogramma wordt gevraagd welk formaat/type-paar is toegestaan |

Beide backends uploaden de spriteciven-tabel als half-floats; `queue.writeTexture` van WebGPU kopieert ruwe bytes, dus de data wordt eerst naar binary16 gecodeerd ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Texturlimieten {#texture-limits}

`texStorage2D` boven `MAX_TEXTURE_SIZE` geeft geen fout: de toewijzing wordt weggegooid, latere uploads mislukken en bemonsteren geeft nul. De WebGL2-hulpfunctie [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) controleert beide afmetingen tegen de limiet en geeft een fout met de grootte; de blokindex-textuur is tweedimensionaal (4.096 breed), dus die kan de limiet niet overschrijden; en `src/render/limits.test.ts` legt elke texturafmeting vast tegen de limieten die de moeite waard zijn. De WebGL2-renderer weigert ook een device waarvan de maximale texturgrootte kleiner is dan de breedte van 8.192 van de rij-textuur.

### Beide testen {#testing-both}

`npm run smoke` bedient de echte app in headless Chromium op WebGL2 (standaard `http://127.0.0.1:5273/`); geef `"http://127.0.0.1:5273/?backend=webgpu"` mee aan `node tools/smoke.mjs` voor WebGPU, en `npm run smoke:f16` voor het half-float-pad. `tools/probe-webgpu.mjs` en `tools/probe-present.mjs` (vermeld onder ontwikkelaarshulpmiddelen in [Opdrachtregelprogramma's](ref-tools.md)) controleren of adapters en presentatie beschikbaar zijn in headless browsers.
