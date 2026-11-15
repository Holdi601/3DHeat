---
title: "Akumulace v half-float"
parent: "Vnitřní fungování vykreslování"
nav_order: 4
lang: "cs"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akumulace v half-float

Některé grafické karty umějí držet teplo jen v malých 16bitových číslech, což by mohlo nejžhavější místa ořezat nebo zaokrouhlit. Prohlížeč čísla škáluje, aby to nebylo vidět. Nemusíte dělat nic; tato stránka je pro vývojáře.

## Pro vývojáře {#for-developers}

Zařízení, které neumí mísit do 32bitových float textur (na WebGPU bez `float32-blendable` a `float32-filterable`, na WebGL2 bez `EXT_float_blend`), dostane cíl tepla s **16bitovým float** (`r16float`): nejvýš 65 504 a 11 bitů mantisy. Hustá plocha dosáhne stovek tisíc, takže 16bitový cíl **ořezává** i **zaokrouhluje**, a chyba zaokrouhlení roste s hodnotou. Projeví se to velmi konkrétně: nejhustší místa se ukážou mnohem chladnější, než jsou, a řídká vypadají v pořádku. Řeší to dva mechanismy; obraz je správný, jen když fungují oba.

### Rozsah: zesílení každého stříknutí {#range-a-gain-on-every-splat}

Každé stříknutí se násobí **zesílením** a složení ho zase vydělí, takže pole leží v rozsahu velikostí, které half floaty zvládají dobře ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
odhad  = analytický odhad saturace pro tuto datovou sadu, poloměr a střední intenzitu
zesílení = 2 ^ round(log2(2048 / odhad)),  exponent omezen na -20..20
```

2048 nechá asi 32násobnou rezervu nad horní hranicí škály před 65 504. Zesílení je **mocnina dvou**, takže malý posun odhadu ho nezmění, a ani nasčítaný buffer se nezmění. Je součástí [podpisu geometrie](accumulation.md#what-restarts-it), takže změna restartuje akumulaci.

Je navázané na analytický odhad a záměrně **ne** na bod saturace. Saturace se aplikuje při složení právě proto, aby tažení jezdce nikdy neresetovalo sbíhání; kdyby se se ní zesílení hýbalo, buffer by stále držel hodnoty zapsané při starém zesílení, zatímco složení by dělilo novým, obě chyby by se přesně vyrušily a jezdec by se zdál, že nedělá nic.

Na 32bitovém cíli je zesílení vždy 1.

### Přesnost: částečné snímky od nuly {#precision-partial-frames-from-zero}

Snímek sloučený do akumulátoru s váhou 1/n se nejdřív nastříká do **pomocného cíle** od nuly a teprve pak se přimíchá, místo aby se stříkal přímo do akumulátoru s váhou 1/n ([Akumulace](accumulation.md#why-each)). Přímo by příspěvek každého spritu byl 1/n velikosti běžícího součtu, ke kterému se přidává, a half float to zaokrouhlí pryč – tím hůř, čím je pixel hustší. Od nuly je každý přírůstek srovnatelný se součtem, ke kterému se připojuje, což je stejná aritmetika, kterou už dělá jeden snímek.

### Změřený účinek {#measured-effect}

Na husté syntetické scéně, kdy se pole čte ve stejných jednotkách:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32bitový (reference) | 6051 | 60742 | 121199 | 232744 |
| 16bitový před | 1372 | 6972 | 7840 | 7840 |
| 16bitový po | 5996 | 59666 | 118824 | 210357 |

Vrchol šel z 30× příliš nízko na 0,90×, a složený snímek se shoduje s 32bitovým na 0,1 % průměrné jasové složky.

### Testování {#testing-it}

`?heat=f16` vynutí tuto cestu na kterémkoli backendu – bez přepínače by aritmetiku, kterou běží jen slabší grafické karty, testovali jen lidé, kteří ji běží. `npm run smoke:f16` spustí celou sadu testů v prohlížeči s ní.

Čtení zpět zesílení odečítá: automatická expozice podle něj vydělí čtené pole a `engine.readHeatProbe()` ho předává rendereru – tak se také čte [živý údaj tepla pravítka](measure.md#notes).
