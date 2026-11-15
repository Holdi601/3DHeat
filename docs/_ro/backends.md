---
title: "Cele două backend-uri"
parent: "Detalii interne ale randării"
nav_order: 1
lang: "ro"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Cele două backend-uri

Un browser poate lăsa o pagină să folosească placa grafică în două feluri, WebGPU (mai nou) și WebGL2. Vizualizatorul le poate folosi pe amândouă și alege singur cel mai bun, așa că de obicei nu faci nimic. Ca să vezi care rulează: **Backend** în panoul de statistici (sus, în dreapta vizualizării).

![Panoul de statistici: Backend, FPS, Cadru, Rânduri în fereastră, Sprite-uri / cadru, Buget, Rezoluție căldură, Acoperire](../assets/img/en/performance-stats-overlay.webp)

Vizualizatorul are două randatoare complete în spatele unei singure interfețe ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) și **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Amândouă desenează aceeași imagine cu aceiași algoritmi; shaderele există în WGSL și GLSL ES 3.00, una lângă alta. Prima linie a panoului de statistici, **Backend**, spune care rulează; dacă pui cursorul peste ea, apare motivul pentru care WebGPU nu a fost folosit, când nu a fost.

## Pentru dezvoltatori {#for-developers}

### Cum se alege unul {#how-one-is-chosen}

Un canvas poate ține un singur fel de context, așa că alegerea se face o singură dată, înainte de orice desenare ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Dacă WebGL2 nu este forțat: dacă există `navigator.gpu`, cere un adaptor cu `powerPreference: 'high-performance'` și un dispozitiv, apoi creează randatorul WebGPU. Orice eroare se reține ca motiv.
2. Dacă WebGPU a fost forțat și a eșuat, oprește-te: vizualizarea arată *Nu se poate inițializa randatorul.* cu motivul.
3. Altfel creează randatorul WebGL2 (cerând și el adaptorul de înaltă performanță). Dacă WebGL2 nu există sau nu poate desena în texturi float (`EXT_color_buffer_float`), vizualizarea arată eroarea.

`powerPreference: 'high-performance'` împiedică un laptop cu grafică comutabilă să dea paginii cardul grafic integrat. Dincolo de asta pagina nu are ce decide: accelerarea hardware este o setare a browserului.

### Comutatoare din adresă {#url-switches}

Adaugă la adresa paginii, de exemplu `http://127.0.0.1:5273/?backend=webgl2`.

| Parametru | Efect |
|---|---|
| `?backend=webgpu` | Folosește WebGPU sau eșuează. |
| `?backend=webgl2` | Folosește WebGL2 chiar acolo unde WebGPU există - separă „asta se desenează greșit" de „asta se desenează greșit pe WebGPU". |
| `?heat=f16` | Forțează calea de acumulare a căldurii pe 16 biți pe oricare backend ([Acumulare în jumătate de float](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: citește erorile GL în timpul cadrului și le expune în `renderer.heatDebug`. Dezactivat implicit, fiindcă `getError` este un punct de sincronizare al conductei. |
| `?occdebug=<n>` | Ajutor pentru dezvoltatori pe WebGL2: înlocuiește căldura cu valori de depanare a ocluziei. Nu pentru uz normal. |

### Diferențe care contează {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Stocarea rândurilor | Buffere de stocare: indexul unui rând este un indice de tablou. Cere cel mai mare bind de buffer de stocare al adaptorului și dimensiunile bufferelor. | Texturi întregi (8.192 de texeli lățime) adresate din `gl_VertexID` printr-o textură cu indici de bloc, reîmprospătată la fiecare cadru. |
| Acumularea căldurii pe 32 de biți | Când adaptorul oferă atât `float32-blendable`, cât și `float32-filterable` | Când `EXT_float_blend` este prezent |
| Altfel | 16 biți (`r16float`) | 16 biți (`R16F`) |
| Interval de adâncime | [0, 1]; motorul premultiplică o remapare a matricilor [-1, 1] din three.js. Fără ea, o proiecție paralelă - a cărei adâncime este liniară - ajunge aproape în întregime sub 0 și este tăiată fără niciun semn. | [-1, 1], folosit ca atare |
| Uniforme | Un inel de sloturi aliniate la 256 de octeți, câte unul pentru fiecare desenare, legate prin offset - `queue.writeBuffer` este ordonat pe coadă, deci un singur buffer rescris la fiecare desenare ar face ca fiecare desenare să citească ultima scriere. Blocul de uniforme al pasului de căldură este exact un slot de 256 de octeți. | Uniforme obișnuite |
| Ținta căldurii sub rezoluția canvasului | Primește propria textură de adâncime (fiecare atașament dintr-un pas trebuie să aibă aceeași dimensiune) | |
| Captura cadrului | `captureFrame()` randează compozitul a doua oară într-o țintă offscreen și o citește înapoi (Chromium fără interfață randează WebGPU, dar nu compune niciodată canvasul lui) | Citește înapoi framebuffer-ul implicit la următorul cadru randat |
| Citirea înapoi | Bufferele de staging sunt păstrate și refolosite; un singur cititor în zbor odată | `readPixels`, întrebând driverul ce pereche format/tip este legală |

Ambele backend-uri încarcă tabela curbei sprite-urilor ca semi-float; `queue.writeTexture` din WebGPU copiază octeți brute, deci datele sunt mai întâi codificate în binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limite de textură {#texture-limits}

`texStorage2D` peste `MAX_TEXTURE_SIZE` nu aruncă o eroare: alocarea se pierde, încărcările ulterioare eșuează, iar eșantionarea întoarce zero. Funcția ajutătoare WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) verifică ambele dimensiuni față de limită și aruncă o eroare cu dimensiunea; textura cu indici de bloc are două dimensiuni (4.096 lățime), deci nu poate depăși o limită; iar `src/render/limits.test.ts` fixează fiecare dimensiune de textură față de limitele care merită susținute. Randatorul WebGL2 refuză și un dispozitiv a cărui dimensiune maximă de textură este sub lățimea de 8.192 a texturii de rânduri.

### Testarea amândurora {#testing-both}

`npm run smoke` pornește aplicația reală în Chromium fără interfață pe WebGL2 (implicit `http://127.0.0.1:5273/`); dă `"http://127.0.0.1:5273/?backend=webgpu"` lui `node tools/smoke.mjs` pentru WebGPU și `npm run smoke:f16` pentru calea semi-float. `tools/probe-webgpu.mjs` și `tools/probe-present.mjs` (listate la uneltele pentru dezvoltatori din [Unelte din linia de comandă](ref-tools.md)) diagnostichează disponibilitatea adaptorului și a prezentării în browserele fără interfață.
