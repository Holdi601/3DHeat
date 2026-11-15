---
title: "Ackumulering i halvprecision"
parent: "Rendering i detalj"
nav_order: 4
lang: "sv"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Ackumulering i halvprecision

Vissa grafikkort kan bara hålla värme i små 16-bitarstal, och det kan skära av eller avrunda de hetaste platserna. Visaren skalar talen så att det inte syns. Du behöver inte göra något. Den här sidan är för utvecklare.

## För utvecklare {#for-developers}

En enhet som inte kan blanda till 32-bitars flyttalstexturer (ingen `float32-blendable` och `float32-filterable` i WebGPU, ingen `EXT_float_blend` i WebGL2) får ett värmemål med **16-bitars flyttal** (`r16float`). Det har högst 65 504 och 11 bitar mantissa. Ett tätt fält når flera hundratusen, så ett 16-bitarsmål både **klipper** och **avrundar**. Avrundningsfelet växer med värdet, och det visar sig på ett särskilt sätt: de tätaste områdena ser mycket svalare ut än de är, medan glesa områden ser normala ut. Två mekanismer hanterar det. Bilden blir bara korrekt om båda fungerar.

### Omfång: en förstärkning på varje utspridning {#range-a-gain-on-every-splat}

Varje utspridning multipliceras med en **förstärkning** (gain). Kompositen delar sedan tillbaka den, så fältet hamnar i det talområde som halva flyttal hanterar bra ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
estimate = analytic saturation estimate for this dataset, radius and centre intensity
gain     = 2 ^ round(log2(2048 / estimate)),  exponent clamped to -20..20
```

2048 lämnar ungefär 32 gångers marginal över toppen av rampen, före 65 504. Förstärkningen är en **tvåpotens**, så en liten drift i uppskattningen lämnar den oförändrad, och även den ackumulerade bufferten. Den ingår i [geometrisignaturen](accumulation.md#what-restarts-it), så en ändring startar om ackumuleringen.

Förstärkningen är förankrad i den analytiska uppskattningen och medvetet **inte** i mättnadspunkten. Mättnaden tillämpas vid komposition just för att ett dragande i den aldrig ska starta om konvergensen. Om förstärkningen följde med skulle bufferten fortfarande innehålla värden som skrevs med den gamla förstärkningen, medan kompositen delade med den nya. De två felen skulle då ta ut varandra exakt, och reglaget skulle se ut att inte göra något.

På ett 32-bitarsmål är förstärkningen alltid 1.

### Precision: delbilder från noll {#precision-partial-frames-from-zero}

En bildruta som slås ihop i ackumulatorn med vikt 1/n sprids först i ett **skrapmål** från noll, och blandas sedan in. Den sprids inte direkt i ackumulatorn med vikt 1/n ([Ackumulering](accumulation.md#why-each)). Direkt skulle varje sprites bidrag bli 1/n av storleken på den löpande summan som det läggs till i. Ett halvt flyttal avrundar bort de bidragen, och ju tätare pixeln är desto värre. Från noll är varje term jämförbar med summan den går med i. Det är samma aritmetik som en enskild bildruta redan gör.

### Uppmätt effekt {#measured-effect}

På en tät syntetisk scen, när fältet läses i jämförbara enheter:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bitars (referens) | 6 051 | 60 742 | 121 199 | 232 744 |
| 16-bitars före | 1 372 | 6 972 | 7 840 | 7 840 |
| 16-bitars efter | 5 996 | 59 666 | 118 824 | 210 357 |

Toppvärdet gick från 30 gånger för lågt till 0,90 gånger. Den komponerade bildrutan stämmer med 32-bitarsbilden inom 0,1 % av medelluminansen.

### Testa det {#testing-it}

`?heat=f16` tvingar fram den här vägen på båda bakändarna. Utan en sådan växel skulle aritmetiken som bara svagare grafikkort kör bara testas av dem som kör dem. `npm run smoke:f16` kör hela webbläsarsviten med den.

Avläsningar tar bort förstärkningen. Autoexponeringen delar det lästa fältet med den, och `engine.readHeatProbe()` skickar den till renderaren. Det är också så [linjalens live-avläsning av värme](measure.md#notes) läses.
