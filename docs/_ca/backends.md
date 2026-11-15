---
title: "Els dos motors"
parent: "Detalls interns del renderitzat"
nav_order: 1
lang: "ca"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# Els dos backends

Un navegador pot deixar que una pàgina usi la targeta gràfica de dues maneres, WebGPU (més nou) i WebGL2. El visor en pot usar totes dues i tria la millor pel seu compte, així que normalment no cal fer res. Per veure quina fas servir: **Backend** a la capa d'estadístiques (a dalt a la dreta de la vista).

![La capa d'estadístiques: Backend, FPS, Frame, Rows in window, Sprites / frame, Budget, Heat res, Coverage](../assets/img/en/performance-stats-overlay.webp)

El visor té dos renderitzadors complets darrere d'una mateixa interfície ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) i **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Tots dos dibuixen la mateixa imatge amb els mateixos algorismes; els shaders existeixen en WGSL i en GLSL ES 3.00, un al costat de l'altre. La primera línia de la capa d'estadístiques, **Backend**, diu quin està en marxa; si hi passes el ratolí es mostra per què no s'ha usat WebGPU, quan no s'ha usat.

## Per als desenvolupadors {#for-developers}

### Com se n'escull un {#how-one-is-chosen}

Un canvas només pot tenir un tipus de context, així que l'elecció es fa una vegada, abans de dibuixar res ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. Si no s'ha forçat WebGL2: si existeix `navigator.gpu`, demana un adaptador amb `powerPreference: 'high-performance'` i un dispositiu, i crea el renderitzador WebGPU. Qualsevol fallada es recorda com a motiu.
2. Si s'ha forçat WebGPU i ha fallat, s'atura: la vista mostra *No es pot inicialitzar el renderitzador.* amb el motiu.
3. Altrament crea el renderitzador WebGL2 (també demanant l'adaptador d'alt rendiment). Si WebGL2 no està disponible, o no pot renderitzar a textures de coma flotant (`EXT_color_buffer_float`), la vista mostra l'error.

`powerPreference: 'high-performance'` és el que evita que un portàtil amb gràfics commutables doni a la pàgina la seva GPU integrada. Més enllà d'això, la pàgina no hi pot fer res: l'acceleració per maquinari és una opció del navegador.

### Interruptors a l'adreça {#url-switches}

Afegeix-los a l'adreça de la pàgina, per exemple `http://127.0.0.1:5273/?backend=webgl2`.

| Paràmetre | Efecte |
|---|---|
| `?backend=webgpu` | Usa WebGPU o falla. |
| `?backend=webgl2` | Usa WebGL2 fins i tot on WebGPU està disponible: separa «això es renderitza malament» de «això es renderitza malament a WebGPU». |
| `?heat=f16` | Força el camí d'acumulació de calor de 16 bits en qualsevol dels dos backends ([Acumulació de coma flotant de 16 bits](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: llegeix els errors de GL durant el fotograma i els mostra a `renderer.heatDebug`. Desactivat per defecte perquè `getError` és un punt de sincronització de la canonada. |
| `?occdebug=<n>` | Ajut per als desenvolupadors de WebGL2: substitueix la calor pels valors de depuració d'oclusió. No és per a ús normal. |

### Diferències que importen {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Emmagatzematge de files | Buffers d'emmagatzematge: un índex de fila és un subíndex d'array. Demana la major mida de vinculació de buffer d'emmagatzematge de l'adaptador i les mides dels buffers. | Textures enteres (8.192 texels d'amplada) adreçades des de `gl_VertexID` a través d'una textura d'índexs de bloc per fotograma. |
| Acumulació de calor de 32 bits | Quan l'adaptador ofereix `float32-blendable` i `float32-filterable` | Quan hi ha `EXT_float_blend` |
| Altrament | 16 bits (`r16float`) | 16 bits (`R16F`) |
| Rang de profunditat | [0, 1]; el motor premultiplica una remapació de les matrius [-1, 1] de three.js. Sense això, una projecció paral·lela —la profunditat de la qual és lineal— cau gairebé tota per sota de 0 i es retalla en silenci. | [-1, 1], usat tal com és |
| Uniformes | Un anell de ranures alineades a 256 bytes, una per dibuix, vinculades per desplaçament: `queue.writeBuffer` s'ordena a la cua, així que reescriure un sol buffer a cada dibuix faria que tots llegissin l'última escriptura. El bloc uniforme del pas de calor és exactament una ranura de 256 bytes. | Uniformes normals |
| Objectiu de calor per sota de la resolució del canvas | Rep la seva pròpia textura de profunditat (tots els adjunts d'un pas han de tenir la mateixa mida) | |
| Captura de fotograma | `captureFrame()` renderitza la composició una segona vegada en un objectiu fora de pantalla i la llegeix (el Chromium sense cap pantalla renderitza WebGPU però mai no compon el seu canvas) | Llegeix el framebuffer per defecte en el següent fotograma renderitzat |
| Lectura | Buffers de staging guardats i reutilitzats; un lector en vol alhora | `readPixels`, preguntant al controlador quina parella format/tipus és legal |

Tots dos backends pugen la taula de corbes dels sprites com a mitjans de coma flotant; `queue.writeTexture` de WebGPU copia bytes en brut, així que primer les dades es codifiquen a binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Límits de textura {#texture-limits}

`texStorage2D` més enllà de `MAX_TEXTURE_SIZE` no llança cap error: l'assignació es descarta, les pujades posteriors fallen i el mostreig retorna zero. L'ajudant de WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) comprova les dues dimensions contra el límit i llança un error amb la mida; la textura d'índexs de bloc és bidimensional (4.096 d'amplada), així que no pot superar un límit; i `src/render/limits.test.ts` fixa cada dimensió de textura contra els límits que valen la pena admetre. El renderitzador WebGL2 també rebutja un dispositiu la mida màxima de textura del qual és inferior als 8.192 d'amplada de la textura de files.

### Provar els dos {#testing-both}

`npm run smoke` executa l'aplicació real a Chromium sense cap pantalla amb WebGL2 (per defecte `http://127.0.0.1:5273/`); passa `"http://127.0.0.1:5273/?backend=webgpu"` a `node tools/smoke.mjs` per a WebGPU, i `npm run smoke:f16` per al camí de coma flotant de 16 bits. `tools/probe-webgpu.mjs` i `tools/probe-present.mjs` (llistats a les eines per a desenvolupadors a [Eines de línia d'ordres](ref-tools.md)) diagnostiquen la disponibilitat de l'adaptador i de la presentació en navegadors sense pantalla.
