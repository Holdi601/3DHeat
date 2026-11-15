---
title: "Akkumulering i halv præcision"
parent: "Renderingens indre"
nav_order: 4
lang: "da"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akkumulering i halv præcision

Nogle grafikkort kan kun gemme varme i små 16-bit-tal, og det kan afskære eller afrunde de varmeste steder. Fremviseren skalerer tallene, så det ikke ses. Du behøver ikke gøre noget. Denne side er til udviklere.

## Til udviklere {#for-developers}

En enhed, der ikke kan blande ind i 32-bit float-teksturer (ingen `float32-blendable` og `float32-filterable` på WebGPU, ingen `EXT_float_blend` på WebGL2), får et **16-bit float**-varmemål (`r16float`) med en største værdi på 65.504 og 11 bit mantisse. Et tæt felt når flere hundrede tusinde. Et 16-bit-mål både **klipper** og **afrunder**, og afrundingsfejlen vokser med værdien. Det viser sig meget bestemt: de tætteste områder ser langt køligere ud, end de er, mens tyndt befolkede områder ser fine ud. To mekanismer håndterer det. Billedet er kun korrekt, hvis begge virker.

### Område: en forstærkning på hver splat {#range-a-gain-on-every-splat}

Hver splat ganges med en **forstærkning** (gain), og sammensætningen dividerer den ud igen. Feltet ligger dermed i det talområde, som halv-floats håndterer godt ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2.048 efterlader cirka 32 gange plads over toppen af rampen, før 65.504 nås. Forstærkningen er en **potens af to**, så en lille drift i estimatet lader den og den akkumulerede buffer være uændrede. Den er en del af [geometrisignaturen](accumulation.md#what-restarts-it), så en ændring genstarter akkumuleringen.

Den er forankret i det analytiske estimat og bevidst **ikke** i mætningspunktet. Mætningen anvendes ved sammensætning, netop så en flytning af den aldrig genstarter konvergensen. Hvis forstærkningen flyttede sig med den, ville bufferen stadig indeholde værdier skrevet med den gamle forstærkning, mens sammensætningen dividerede med den nye. De to fejl ville præcist ophæve hinanden, og skyderen ville se ud til ikke at gøre noget.

På et 32-bit-mål er forstærkningen altid 1.

### Præcision: delvise billeder fra nul {#precision-partial-frames-from-zero}

Et billede, der flettes ind i akkumulatoren med vægten 1/n, sprøjtes først ind i et **arbejdsmål** fra nul og blandes derefter ind. Det sprøjtes ikke direkte ind i akkumulatoren med vægten 1/n ([Akkumulering](accumulation.md#why-each)). Direkte ville hver sprites bidrag være 1/n af størrelsen på den løbende sum, det lægges til, og en halv-float ville afrunde de små bidrag væk. Det er værre, jo tættere pixlen er. Fra nul er hver tilføjelse sammenlignelig med den sum, den indgår i. Det er den samme regning, som et enkelt billede allerede laver.

### Målt effekt {#measured-effect}

På en tæt syntetisk scene, aflæst i sammenlignelige enheder:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bit (reference) | 6051 | 60742 | 121199 | 232744 |
| 16-bit før | 1372 | 6972 | 7840 | 7840 |
| 16-bit efter | 5996 | 59666 | 118824 | 210357 |

Toppen gik fra 30 gange for lav til 0,90 gange, og det sammensatte billede stemmer med 32-bit-billedet inden for 0,1 % af middel-luma.

### Test af den {#testing-it}

`?heat=f16` tvinger denne sti på begge backends. Uden en kontakt ville regningen, som kun de svageste GPU'er kører, kun blive testet af dem, der kører den. `npm run smoke:f16` kører hele browsertesten med den.

Aflæsninger fortryder forstærkningen. Automatisk eksponering dividerer det aflæste felt med den, og `engine.readHeatProbe()` sender den til rendereren. Det er også sådan, [linealens live varmeaflæsning](measure.md#notes) læses.
