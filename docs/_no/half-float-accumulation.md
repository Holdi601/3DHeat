---
title: "Akkumulering med halv presisjon (half-float)"
parent: "Rendering i detalj"
nav_order: 4
lang: "no"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akkumulering med halvflyttall

Noen grafikkort kan bare holde varme i små 16-bits tall, som kan kutte av eller avrunde de varmeste stedene. Visningsprogrammet skalerer tallene slik at dette ikke vises. Du trenger ikke gjøre noe; denne siden er for utviklere.

## For utviklere {#for-developers}

En enhet som ikke kan blande inn i 32-bits flyttallsteksturer (ingen `float32-blendable` og `float32-filterable` på WebGPU, ingen `EXT_float_blend` på WebGL2) får et varmemål med **16-bits flyttall** (`r16float`): maksimalt 65 504 og 11 bits mantisse. Et tett felt når flere hundre tusen, så et 16-bits mål både **klipper** og **avrunder**, og avrundingsfeilen vokser med verdien. Det viser seg på en veldig bestemt måte: de tetteste områdene vises langt kaldere enn de er, mens tynne områder ser fine ut. To mekanismer håndterer det; bildet er bare riktig hvis begge virker.

### Område: en forsterkning på hvert sprøyt {#range-a-gain-on-every-splat}

Hvert sprøyt multipliseres med en **forsterkning**, og sammensetningen deler den ut igjen, slik at feltet ligger i den størrelsesorden halvflyttall takler godt ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytisk metningsestimat for dette datasettet, radius og sentertetthet
gain     = 2 ^ round(log2(2048 / estimate)),  eksponent klemt til -20..20
```

2048 etterlater omtrent 32× margin over toppen av rampen før 65 504. Forsterkningen er en **tomakt**, så en liten drift i estimatet lar den - og den akkumulerte bufferen - være uendret. Den er en del av [geometrisignaturen](accumulation.md#what-restarts-it), så en endring starter akkumuleringen på nytt.

Den er forankret til det analytiske estimatet og bevisst **ikke** til metningspunktet. Metningen brukes ved sammensetning nettopp slik at det å dra den aldri starter konvergensen på nytt. Hvis forsterkningen fulgte med, ville bufferen fortsatt holde verdier skrevet med den gamle forsterkningen mens sammensetningen delte på den nye. De to feilene ville da oppheve hverandre nøyaktig, og glidebryteren ville se ut til å ikke gjøre noe.

På et 32-bits mål er forsterkningen alltid 1.

### Presisjon: delvise bilder fra null {#precision-partial-frames-from-zero}

Et bilde som slås sammen inn i akkumulatoren med vekt 1/n, sprøytes først inn i et **arbeidsmål** fra null og blandes deretter inn, i stedet for å sprøytes direkte inn i akkumulatoren med vekt 1/n ([Akkumulering](accumulation.md#why-each)). Direkte ville hvert sprites bidrag vært 1/n av størrelsen til den løpende summen det legges til, og et halvflyttall runder disse bort, verre jo tettere pikselen er. Fra null er hvert tillegg sammenlignbart med summen det blir med i, og det er den samme aritmetikken et enkelt bilde allerede gjør.

### Målt effekt {#measured-effect}

På en tett syntetisk scene, lest av feltet i samme enheter:

| | p50 | p90 | p99 | maks |
|---|---|---|---|---|
| 32-bits (referanse) | 6051 | 60742 | 121199 | 232744 |
| 16-bits før | 1372 | 6972 | 7840 | 7840 |
| 16-bits etter | 5996 | 59666 | 118824 | 210357 |

Toppen gikk fra 30× for lavt til 0,90×, og det sammensatte bildet stemmer med 32-bits-bildet innen 0,1 % av middelluminansen.

### Testing av det {#testing-it}

`?heat=f16` tvinger denne veien på begge backendene. Uten en bryter ville aritmetikken som bare svakere GPU-er kjører, bare blitt testet av folkene som kjører dem. `npm run smoke:f16` kjører hele nettleserpakken med den.

Avlesninger angrer forsterkningen: den automatiske eksponeringen deler det leste feltet på den, og `engine.readHeatProbe()` gir den til tegnemotoren. Det er også slik [linjalens live varmeavlesning](measure.md#notes) leses.
