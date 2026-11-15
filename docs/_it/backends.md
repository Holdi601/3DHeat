---
title: "I due backend"
parent: "Dettagli del rendering"
nav_order: 1
lang: "it"
source: "backends.md"
source_hash: "435a9fedb9c2"
translated: true
outdated: false
---

# I due backend

Un browser può far usare alla pagina la scheda grafica in due modi, WebGPU (più recente) e WebGL2. Il visualizzatore può usarli entrambi e sceglie da solo il migliore, quindi di solito non devi fare nulla. Per vedere quale stai usando: **Backend** nella sovrapposizione delle statistiche (in alto a destra nella vista).

![Il pannello statistiche: Backend, FPS, Fotogramma, Righe nella finestra, Sprite / fotogramma, Budget, Ris. calore, Copertura](../assets/img/en/performance-stats-overlay.webp)

Il visualizzatore ha due renderer completi dietro un'unica interfaccia ([`types.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/types.ts)): **WebGPU** ([`webgpu/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgpu)) e **WebGL2** ([`webgl2/`](https://github.com/Holdi601/3DHeat/tree/main/src/render/webgl2)). Entrambi disegnano la stessa immagine con gli stessi algoritmi; gli shader esistono in WGSL e in GLSL ES 3.00, uno accanto all'altro. La prima riga della sovrapposizione delle statistiche, **Backend**, dice quale è in funzione; se ci passi sopra con il mouse appare il motivo per cui WebGPU non è stato usato, quando non lo è stato.

## Per gli sviluppatori {#for-developers}

### Come se ne sceglie uno {#how-one-is-chosen}

Un canvas può contenere un solo tipo di contesto, quindi la scelta si fa una volta sola, prima di qualsiasi disegno ([`createRenderer.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/createRenderer.ts)):

1. A meno che WebGL2 non sia forzato: se esiste `navigator.gpu`, richiede un adattatore con `powerPreference: 'high-performance'` e un dispositivo, e crea il renderer WebGPU. Ogni errore viene ricordato come motivo.
2. Se WebGPU era forzato e non è riuscito, ci si ferma: la vista mostra *Impossibile inizializzare il renderer.* con il motivo.
3. Altrimenti crea il renderer WebGL2 (chiedendo anch'esso l'adattatore ad alte prestazioni). Se WebGL2 non è disponibile, o non può disegnare su texture in virgola mobile (`EXT_color_buffer_float`), la vista mostra l'errore.

`powerPreference: 'high-performance'` evita che un portatile con grafica commutabile dia alla pagina la sua GPU integrata. Oltre a questo la pagina non ha altro da dire: l'accelerazione hardware è un'impostazione del browser.

### Parametri nell'indirizzo {#url-switches}

Aggiungi all'indirizzo della pagina, per esempio `http://127.0.0.1:5273/?backend=webgl2`.

| Parametro | Effetto |
|---|---|
| `?backend=webgpu` | Usa WebGPU oppure fallisce. |
| `?backend=webgl2` | Usa WebGL2 anche dove WebGPU è disponibile - separa "questo viene disegnato male" da "questo viene disegnato male su WebGPU". |
| `?heat=f16` | Forza il percorso di accumulo del calore a 16 bit su entrambi i backend ([Accumulo in mezza precisione](half-float-accumulation.md)). |
| `?glcheck` | WebGL2: legge gli errori GL durante il fotogramma e li espone in `renderer.heatDebug`. Disattivato di default perché `getError` è un punto di sincronizzazione della pipeline. |
| `?occdebug=<n>` | WebGL2, aiuto per gli sviluppatori: sostituisce il calore con valori di debug dell'occlusione. Non per l'uso normale. |

### Differenze che contano {#differences-that-matter}

| | WebGPU | WebGL2 |
|---|---|---|
| Memorizzazione delle righe | Buffer di archiviazione: un indice di riga è un indice di array. Chiede il più grande binding di buffer di archiviazione e le dimensioni dei buffer che l'adattatore offre. | Texture intere (larghe 8.192 texel) indirizzate da `gl_VertexID` tramite una texture di indici di blocco per fotogramma. |
| Accumulo del calore a 32 bit | Quando l'adattatore offre sia `float32-blendable` sia `float32-filterable` | Quando è presente `EXT_float_blend` |
| Altrimenti | 16 bit (`r16float`) | 16 bit (`R16F`) |
| Intervallo di profondità | [0, 1]; il motore premoltiplica una rimappatura delle matrici [-1, 1] di three.js. Senza di essa, una proiezione parallela - la cui profondità è lineare - finisce quasi tutta sotto 0 e viene tagliata in silenzio. | [-1, 1], usato così com'è |
| Uniform | Un anello di slot allineati a 256 byte, uno per draw, legati per offset - `queue.writeBuffer` è ordinato nella coda, quindi un solo buffer riscritto per ogni draw farebbe leggere a ogni draw l'ultima scrittura. Il blocco uniform del passaggio di calore è esattamente uno slot da 256 byte. | Uniform ordinari |
| Target del calore sotto la risoluzione del canvas | Ottiene una propria texture di profondità (ogni allegato in un passaggio deve avere la stessa dimensione) | |
| Cattura del fotogramma | `captureFrame()` rirenderizza il composito una seconda volta in un target fuori schermo e lo rilegge (Chromium headless disegna WebGPU ma non compone mai il suo canvas) | Rilegge il framebuffer predefinito al fotogramma successivo renderizzato |
| Rilettura | Buffer di staging tenuti e riusati; un lettore in volo alla volta | `readPixels`, chiedendo al driver quale coppia formato/tipo è valida |

Entrambi i backend caricano la tabella delle curve degli sprite come mezze virgole mobili; `queue.writeTexture` di WebGPU copia byte grezzi, quindi i dati vengono prima codificati in binary16 ([`half.ts`](https://github.com/Holdi601/3DHeat/blob/main/src/render/half.ts)).

#### Limiti delle texture {#texture-limits}

`texStorage2D` oltre `MAX_TEXTURE_SIZE` non genera un'eccezione: l'allocazione viene scartata, i caricamenti successivi falliscono e il campionamento restituisce zero. L'helper WebGL2 [`createTexture`](https://github.com/Holdi601/3DHeat/blob/main/src/render/webgl2/glutil.ts) controlla entrambe le dimensioni rispetto al limite e genera un errore con la dimensione; la texture degli indici di blocco è bidimensionale (larga 4.096), quindi non può superare un limite; e `src/render/limits.test.ts` fissa ogni dimensione di texture contro i limiti che vale la pena supportare. Il renderer WebGL2 rifiuta anche un dispositivo la cui dimensione massima di texture è inferiore alla larghezza di 8.192 della texture delle righe.

### Test su entrambi {#testing-both}

`npm run smoke` avvia l'app reale in Chromium headless su WebGL2 (di default `http://127.0.0.1:5273/`); passa `"http://127.0.0.1:5273/?backend=webgpu"` a `node tools/smoke.mjs` per WebGPU, e `npm run smoke:f16` per il percorso a mezza precisione. `tools/probe-webgpu.mjs` e `tools/probe-present.mjs` (elencati tra gli strumenti per sviluppatori in [Strumenti da riga di comando](ref-tools.md)) diagnosticano la disponibilità di adattatore e presentazione nei browser headless.
