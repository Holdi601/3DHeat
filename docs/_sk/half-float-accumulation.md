---
title: "Akumulácia half-float"
parent: "Vnútorné časti renderovania"
nav_order: 4
lang: "sk"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---


# Akumulácia v polovičnej presnosti

Niektoré grafické karty dokážu držať teplo len v malých 16-bitových číslach, čo by mohlo odrezať alebo zaokrúhliť najteplejšie miesta. Prehliadač čísla škáluje, aby to nebolo vidno. Nemusíte nič robiť; táto stránka je pre vývojárov.

## Pre vývojárov {#for-developers}

Zariadenie, ktoré nevie miešať do 32-bitových float textúr (na WebGPU nie `float32-blendable` a `float32-filterable`, na WebGL2 nie `EXT_float_blend`), dostane cieľ tepla v **16-bitovom float** (`r16float`): najviac 65 504 a 11 bitov mantisy. Husté pole dosiahne stovky tisíc, takže 16-bitový cieľ **orezáva** aj **zaokrúhľuje**, a chyba zaokrúhľovania rastie s hodnotou - čo sa prejaví veľmi konkrétne: najhustejšie miesta vyzerajú oveľa chladnejšie, než sú, kým riedke miesta vyzerajú v poriadku. Na to sú dva mechanizmy; obraz je správny len vtedy, keď fungujú oba.

### Rozsah: zosilnenie na každom nástreku {#range-a-gain-on-every-splat}

Každý nástrek sa vynásobí **zosilnením** a skladanie ho zase vydelí, takže pole leží vo veľkosti, ktorú polovičné floaty zvládajú dobre ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
odhad = analytický odhad saturácie pre tento dataset, polomer a intenzitu v strede
zosilnenie = 2 ^ round(log2(2048 / odhad)), exponent orezaný na -20..20
```

2048 nechá asi 32-násobnú rezervu nad vrchom škály pred 65 504. Zosilnenie je **mocnina dvojky**, takže malý posun odhadu ho - a nahromadený buffer - nezmení, a je súčasťou [podpisu geometrie](accumulation.md#what-restarts-it), takže zmena reštartuje akumuláciu.

Je pevne naviazané na analytický odhad a úmyselne **nie** na bod saturácie. Saturácia sa aplikuje pri skladaní práve preto, aby potiahnutie posúvača nikdy nereštartovalo zbiehanie; keby sa zosilnenie s ním hýbalo, buffer by stále držal hodnoty zapísané pri starom zosilnení, kým skladanie by delilo novým, obe chyby by sa presne vyrušili a posúvač by sa zdal, že nerobí nič.

Na 32-bitovom cieli je zosilnenie vždy 1.

### Presnosť: čiastočné snímky od nuly {#precision-partial-frames-from-zero}

Snímka zlúčená do akumulátora s váhou 1/n sa najprv nastriekne do **pomocného cieľa** od nuly a až potom sa zmieša, namiesto toho, aby sa nastriekla priamo do akumulátora s váhou 1/n ([Akumulácia](accumulation.md#why-each)). Priamo by príspevok každého spritu bol 1/n veľkosti bežiaceho súčtu, ku ktorému sa pridáva, a polovičný float ho zaokrúhli preč - tým horšie, čím hustejší pixel je. Od nuly je každý prírastok porovnateľný so súčtom, ku ktorému sa pripája, čo je rovnaká aritmetika, akú už robí jedna snímka.

### Nameraný efekt {#measured-effect}

Na hustej syntetickej scéne, pri čítaní poľa v zhodných jednotkách:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bitové (referencia) | 6051 | 60742 | 121199 | 232744 |
| 16-bitové pred | 1372 | 6972 | 7840 | 7840 |
| 16-bitové po | 5996 | 59666 | 118824 | 210357 |

Vrchol sa zmenil z 30-krát príliš nízkeho na 0,90×, a zložená snímka sa zhoduje s 32-bitovou na 0,1 % priemernej jasu.

### Testovanie {#testing-it}

`?heat=f16` vynúti túto cestu na ľubovoľnom backende - bez prepínača by sa aritmetika, ktorú bežia len slabšie GPU, testovala iba u ľudí, ktorí ju spúšťajú. `npm run smoke:f16` spustí celý testovací balík prehliadača s ňou.

Čítania vracajú zosilnenie späť: automatická expozícia vydelí čítané pole ním a `engine.readHeatProbe()` ho odovzdá vykresľovaču - takto sa číta aj [živý údaj tepla pravítka](measure.md#notes).
