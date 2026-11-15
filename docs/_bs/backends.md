---
title: "Dva backenda"
parent: "Interno renderovanje"
nav_order: 1
lang: "bs"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dva backenda

Pregledač može stranici dati pristup grafičkoj kartici na dva načina, WebGPU (noviji) i WebGL2. Preglednik može oba i sam bira najbolji, pa obično ne morate ništa raditi. Da vidite koji koristite, pogledajte **Backend** u prikazu statistike (gore desno u pogledu).

![Prikaz statistike: Backend, FPS, Sličica, Redovi u prozoru, Sprajtovi / sličica, Budžet, Rezolucija toplote, Pokrivenost](../assets/img/en/performance-stats-overlay.webp)

Preglednik ima dva potpuna renderera iza jednog interfejsa ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) i **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Oba crtaju istu sliku istim algoritmima; shaderi postoje u WGSL i GLSL ES 3.00 jedan pored drugog. Prvi red prikaza statistike, **Backend**, kaže koji je pokrenut. Ako zadržite miš na njemu, vidi se zašto WebGPU nije korišten, kad nije.

## Za programere {#for-developers}

### Kako se bira {#how-one-is-chosen}

Platno može imati samo jednu vrstu konteksta, pa se izbor pravi jednom, prije bilo kakvog crtanja ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Ako WebGL2 nije nametnut: ako postoji `navigator.gpu`, traži se adapter sa `powerPreference: 'high-performance'` i uređaj, pa se pravi WebGPU renderer. Svaki neuspjeh se pamti kao razlog.
2. Ako je WebGPU bio nametnut i nije uspio, staje se: pogled prikazuje *Cannot initialise the renderer.* sa razlogom.
3. Inače se pravi WebGL2 renderer (također tražeći adapter visokih performansi). Ako WebGL2 nije dostupan, ili ne može crtati u float teksture (`EXT_color_buffer_float`), pogled prikazuje grešku.

`powerPreference: 'high-performance'` sprječava da laptop sa prebacivom grafikom stranici dodijeli integrisani GPU. Osim toga stranica nema šta reći: hardversko ubrzanje je postavka pregledača.

### Prekidači u URL-u {#url-switches}

Dodajte na adresu stranice, na primjer `http://127.0.0.1:5273/?backend=webgl2`.

| Parametar | Učinak |
|---|---|
| `?backend=webgpu` | Koristi WebGPU ili ne radi ništa. |
| `?backend=webgl2` | Koristi WebGL2 i tamo gdje je WebGPU dostupan, razdvaja "ovo se crta pogrešno" od "ovo se crta pogrešno na WebGPU-u". |
| `?heat=f16` | Nameće 16-bitni put akumulacije toplote na bilo kojem backendu ([Half-float akumulacija](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: čita GL greške tokom sličice i izlaže ih na `renderer.heatDebug`. Isključeno po zadanom, jer je `getError` tačka sinhronizacije cjevovoda. |
| `?occdebug=<n>` | WebGL2 pomoć programerima: zamjenjuje toplotu debug vrijednostima okluzije. Nije za redovnu upotrebu. |

### Razlike koje su bitne {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Smještaj redova | Storage baferi: indeks reda je indeks niza. Traži najveće storage-buffer vezivanje adaptera i veličine bafera. | Cjelobrojne teksture (8.192 texela široke) kojima se pristupa iz `gl_VertexID` kroz blok-indeks teksturu po sličici. |
| 32-bitna akumulacija toplote | Kad adapter nudi i `float32-blendable` i `float32-filterable` | Kad postoji `EXT_float_blend` |
| Inače | 16-bitna (`r16float`) | 16-bitna (`R16F`) |
| Opseg dubine | [0, 1]; motor unaprijed množi preslikavanje matrica three.js-a iz [-1, 1]. Bez toga, paralelna projekcija, čija je dubina linearna, pada gotovo cijela ispod 0 i tiho se odsijeca. | [-1, 1], koristi se kako jeste |
| Uniformi | Prsten slotova poravnatih na 256 bajtova, jedan po crtanju, vezan pomakom. `queue.writeBuffer` je poredan na redu, pa bi jedan bafer prepisan po crtanju učinio da svako crtanje čita zadnji upis. Uniform blok prolaza toplote tačno je jedan slot od 256 bajtova. | Obični uniformi |
| Cilj toplote ispod rezolucije platna | Dobija svoju teksturu dubine (svaki prilog u prolazu mora biti iste veličine) | |
| Snimak sličice | `captureFrame()` ponovo crta kompozit u van-ekranski cilj i čita ga nazad (headless Chromium crta WebGPU, ali nikad ne kompozira svoje platno) | Čita podrazumijevani framebuffer pri sljedećoj nacrtanoj sličici |
| Čitanje nazad | Staging baferi se čuvaju i ponovo koriste; jedan čitalac u letu u isto vrijeme | `readPixels`, pitajući driver koji je par format/tip dozvoljen |

Oba backenda šalju tabelu krivulja sprajtova kao half float; `queue.writeTexture` u WebGPU-u kopira sirove bajtove, pa se podaci prvo kodiraju u binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Ograničenja tekstura {#texture-limits}

`texStorage2D` preko `MAX_TEXTURE_SIZE` ne baca grešku: alokacija se odbaci, kasniji upisi ne uspijevaju i uzorkovanje vraća nulu. Pomoćna funkcija WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) provjerava obje dimenzije u odnosu na ograničenje i baca grešku sa veličinom. Blok-indeks teksture je dvodimenzionalna (4.096 široka), pa ne može prerasti ograničenje. `src/render/limits.test.ts` fiksira svaku dimenziju teksture u odnosu na ograničenja koja vrijedi podržati. WebGL2 renderer također odbija uređaj čija je najveća veličina teksture manja od širine 8.192 teksture redova.

### Testiranje oba {#testing-both}

`npm run smoke` pokreće pravu aplikaciju u headless Chromiumu na WebGL2 (po zadanom `http://127.0.0.1:5273/`); za WebGPU proslijedite `"http://127.0.0.1:5273/?backend=webgpu"` u `node tools/smoke.mjs`, a za half-float put `npm run smoke:f16`. `tools/probe-webgpu.mjs` i `tools/probe-present.mjs` (navedeni pod alatima za programere u [Alati za komandnu liniju](ref-tools.md)) dijagnostikuju dostupnost adaptera i prikaza u headless pregledačima.
