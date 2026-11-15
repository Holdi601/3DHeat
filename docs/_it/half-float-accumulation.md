---
title: "Accumulo half-float"
parent: "Dettagli del rendering"
nav_order: 4
lang: "it"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Accumulo in mezza precisione

Alcune schede grafiche possono conservare il calore solo in numeri piccoli a 16 bit, che potrebbero troncare o arrotondare i punti più caldi. Il visualizzatore scala i numeri perché questo non si veda. Non devi fare nulla; questa pagina è per gli sviluppatori.

## Per gli sviluppatori {#for-developers}

Un dispositivo che non può fondere in texture a virgola mobile a 32 bit (niente `float32-blendable` e `float32-filterable` su WebGPU, niente `EXT_float_blend` su WebGL2) riceve un target del calore in **virgola mobile a 16 bit** (`r16float`): un massimo di 65.504 e 11 bit di mantissa. Un campo denso arriva a diverse centinaia di migliaia, quindi un target a 16 bit **tronca** e **arrotonda**, e l'errore di arrotondamento cresce con il valore - il che si presenta in modo molto specifico: le zone più dense risultano molto più fredde di quanto siano, mentre le zone rade sembrano a posto. Due meccanismi se ne occupano; l'immagine è corretta solo se funzionano entrambi.

### Intervallo: un guadagno su ogni splat {#range-a-gain-on-every-splat}

Ogni splat viene moltiplicato per un **guadagno**, e la composizione lo divide di nuovo, così il campo sta nell'ordine di grandezza che le mezze virgole mobili gestiscono bene ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
stima = stima analitica di saturazione per questo dataset, raggio e intensità al centro
guadagno = 2 ^ round(log2(2048 / stima)), esponente limitato a -20..20
```

2048 lascia circa 32 volte di margine sopra la cima della rampa prima di 65.504. Il guadagno è una **potenza di due**, quindi una piccola deriva della stima lo lascia - e il buffer accumulato - invariato, ed è parte della [firma della geometria](accumulation.md#what-restarts-it), quindi un cambiamento riavvia l'accumulo.

È ancorato alla stima analitica e deliberatamente **non** al punto di saturazione. La saturazione viene applicata in composizione proprio perché trascinarla non riavvii mai la convergenza; se il guadagno si spostasse con essa, il buffer conterrebbe ancora valori scritti con il vecchio guadagno mentre la composizione dividerebbe per il nuovo, i due errori si annullerebbero esattamente, e il cursore sembrerebbe non fare nulla.

Su un target a 32 bit il guadagno è sempre 1.

### Precisione: fotogrammi parziali a partire da zero {#precision-partial-frames-from-zero}

Un fotogramma fuso nell'accumulatore con peso 1/n viene prima spalmato in un **target di lavoro** partendo da zero, e solo poi fuso, invece di essere spalmato direttamente nell'accumulatore con peso 1/n ([Accumulo](accumulation.md#why-each)). Direttamente, il contributo di ogni sprite sarebbe 1/n della grandezza del totale corrente a cui viene aggiunto, e una mezza virgola mobile arrotonda via quei valori - tanto peggio quanto più il pixel è denso. Partendo da zero, ogni addendo è paragonabile al totale a cui si unisce, che è la stessa aritmetica che già fa un fotogramma singolo.

### Effetto misurato {#measured-effect}

Su una scena sintetica densa, leggendo il campo in unità corrispondenti:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bit (riferimento) | 6051 | 60742 | 121199 | 232744 |
| 16 bit prima | 1372 | 6972 | 7840 | 7840 |
| 16 bit dopo | 5996 | 59666 | 118824 | 210357 |

Il picco è passato da 30 volte troppo basso a 0,90 volte, e il fotogramma composto corrisponde a quello a 32 bit entro lo 0,1% della luminanza media.

### Come provarlo {#testing-it}

`?heat=f16` forza questo percorso su entrambi i backend - senza un parametro, l'aritmetica che girano solo le GPU più deboli non verrebbe mai provata se non dalle persone che la usano. `npm run smoke:f16` esegue tutta la suite del browser con esso.

Le letture annullano il guadagno: l'esposizione automatica divide per esso il campo letto, e `engine.readHeatProbe()` glielo passa - ed è anche così che viene letta la [lettura live del calore del righello](measure.md#notes).
