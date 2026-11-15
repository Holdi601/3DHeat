---
title: "Dva pozadinska sustava"
parent: "Unutarnji dijelovi iscrtavanja"
nav_order: 1
lang: "hr"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Dva pozadinska sustava

Preglednik može pustiti stranicu da koristi grafičku karticu na dva načina, WebGPU (noviji) i WebGL2. Preglednik može koristiti oba i sam bira najbolji, pa obično ne moraš ništa. Vidi koji koristiš: **Pozadinski sustav** u prikazu statistike (gore desno u pogledu).

![Prikaz statistike: Pozadinski sustav, FPS, Kadar, Retci u prozoru, Spriteovi / kadar, Proračun, Rezolucija topline, Pokrivenost](../assets/img/en/performance-stats-overlay.webp)

Preglednik ima dva potpuna iscrtavača iza jednog sučelja ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) i **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Oba crtaju istu sliku istim algoritmima; shaderi postoje u WGSL-u i GLSL ES 3.00 jedan uz drugi. Prvi redak prikaza statistike, **Pozadinski sustav**, kaže koji radi; kad se pređe mišem preko njega, pokaže se zašto WebGPU nije korišten, ako nije.

## Za razvojne programere {#for-developers}

### Kako se bira {#how-one-is-chosen}

Platno može imati samo jednu vrstu konteksta, pa se izbor radi jednom, prije svakog crtanja ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Ako WebGL2 nije prisilno odabran: ako postoji `navigator.gpu`, traži se adapter s `powerPreference: 'high-performance'` i uređaj, pa se stvara WebGPU iscrtavač. Svaki neuspjeh pamti se kao razlog.
2. Ako je WebGPU bio prisilno odabran i nije uspio, stani: pogled prikazuje *Ne mogu pokrenuti iscrtavač.* s razlogom.
3. Inače se stvara WebGL2 iscrtavač (također traži adapter visokih performansi). Ako WebGL2 nije dostupan ili ne može iscrtavati u teksture s pomičnom zarezom (`EXT_color_buffer_float`), pogled prikazuje grešku.

`powerPreference: 'high-performance'` sprječava da laptop s prebacivom grafikom dade stranici njegovu integriranu grafiku. Dalje stranica nema utjecaja: hardversko ubrzanje je postavka preglednika.

### Prekidači u URL-u {#url-switches}

Dodaj na adresu stranice, na primjer `http://127.0.0.1:5273/?backend=webgl2`.

| Parametar | Učinak |
|---|---|
| `?backend=webgpu` | Koristi WebGPU ili ne radi. |
| `?backend=webgl2` | Koristi WebGL2 i tamo gdje je WebGPU dostupan - odvaja "ovo se crta krivo" od "ovo se crta krivo na WebGPU-u". |
| `?heat=f16` | Prisili 16-bitni put akumulacije topline na bilo kojem pozadinskom sustavu ([Akumulacija u polupreciznom formatu](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: čita GL greške tijekom kadra i izlaže ih na `renderer.heatDebug`. Isključeno je prema zadanim postavkama jer je `getError` točka sinkronizacije cjevovoda. |
| `?occdebug=<n>` | WebGL2 pomoć za razvojne programere: zamjenjuje toplinu vrijednostima za otklanjanje grešaka okluzije. Nije za redovitu upotrebu. |

### Razlike koje su važne {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Pohrana redaka | Storage bufferi: indeks retka je indeks niza. Traži najveće vezanje storage buffera adaptera i veličine bufera. | Cjelobrojne teksture (8.192 texela široke) kojima se pristupa iz `gl_VertexID` kroz teksturu indeksa blokova po kadru. |
| 32-bitna akumulacija topline | Kad adapter nudi i `float32-blendable` i `float32-filterable` | Kad je prisutan `EXT_float_blend` |
| Inače | 16-bitna (`r16float`) | 16-bitna (`R16F`) |
| Raspon dubine | [0, 1]; engine unaprijed množi remap three.js matrica [-1, 1]. Bez toga bi se paralelna projekcija - čija je dubina linearna - gotovo cijela našla ispod 0 i tiho odrezala. | [-1, 1], koristi se kako jest |
| Uniformi | Prsten slotova poravnatih na 256 bajtova, jedan po crtanju, vezan pomakom - `queue.writeBuffer` je uređen na redu, pa bi jedan bufer prepisan po crtanju značio da svako crtanje čita zadnji upis. Uniform blok prolaza topline točno je jedan slot od 256 bajtova. | Obični uniformi |
| Cilj topline ispod rezolucije platna | Dobije vlastitu teksturu dubine (svaki prilog u prolazu mora biti iste veličine) | |
| Snimanje kadra | `captureFrame()` kompozit crta drugi put u izvanekranski cilj i čita ga natrag (headless Chromium crta WebGPU, ali nikad ne kompozira svoje platno) | Čita zadnji framebuffer natrag pri sljedećem iscrtanom kadru |
| Čitanje natrag | Staging bufferi se čuvaju i ponovno koriste; u letu je jedan čitač u isto vrijeme | `readPixels`, pitajući upravljački program koji je par format/tip dopušten |

Oba pozadinska sustava šalju tablicu krivulje spriteova kao polovične pomične zareze; `queue.writeTexture` u WebGPU-u kopira sirove bajtove, pa se podaci najprije kodiraju u binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Granice teksture {#texture-limits}

`texStorage2D` iznad `MAX_TEXTURE_SIZE` ne baca grešku: dodjela se odbacuje, kasniji upisi ne uspijevaju, a uzorkovanje vraća nulu. Pomoćna funkcija WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) provjerava obje dimenzije u odnosu na granicu i baca grešku s veličinom; tekstura indeksa blokova je dvodimenzionalna (4.096 široka) pa ne može prerasti granicu, a `src/render/limits.test.ts` veže svaku dimenziju teksture uz granice koje vrijedi podržati. WebGL2 iscrtavač također odbija uređaj čija je najveća veličina teksture manja od širine 8.192 teksture redaka.

### Testiranje oba {#testing-both}

`npm run smoke` pokreće pravu aplikaciju u headless Chromiumu na WebGL2 (zadano `http://127.0.0.1:5273/`); za WebGPU proslijedi `"http://127.0.0.1:5273/?backend=webgpu"` za `node tools/smoke.mjs`, a za put s polovičnom pomičnom zarezom `npm run smoke:f16`. `tools/probe-webgpu.mjs` i `tools/probe-present.mjs` (navedeni pod razvojnim alatima u [Alati naredbenog retka](ref-tools.md)) provjeravaju dostupnost adaptera i prikaza u headless preglednicima.
