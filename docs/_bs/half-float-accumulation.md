---
title: "Akumulacija half-float"
parent: "Interno renderovanje"
nav_order: 4
lang: "bs"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Akumulacija half-float

Neke grafičke kartice mogu držati toplotu samo u malim 16-bitnim brojevima, što bi moglo odsjeći ili zaokružiti najtoplija mjesta. Preglednik skalira brojeve da se to ne vidi. Ne morate ništa raditi; ova stranica je za programere.

## Za programere {#for-developers}

Uređaj koji ne može miješati u 32-bitne float teksture (nema `float32-blendable` i `float32-filterable` na WebGPU-u, nema `EXT_float_blend` na WebGL2) dobija cilj toplote od **16-bitnog floata** (`r16float`): najveća vrijednost je 65.504, a 11 bita mantise. Gusto polje dosegne nekoliko stotina hiljada, pa 16-bitni cilj i **odsijeca** i **zaokružuje**, a greška zaokruživanja raste sa vrijednošću. To se vidi na vrlo određen način: najgušća područja izgledaju mnogo hladnija nego što jesu, dok rijetka izgledaju dobro. Dva mehanizma to rješavaju; slika je tačna samo ako rade oba.

### Opseg: pojačanje na svakom rasipanju {#range-a-gain-on-every-splat}

Svako rasipanje se množi sa **pojačanjem**, a kompozit ga dijeli nazad, pa polje leži u veličini koju half floati dobro podnose ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
procjena = analitička procjena zasićenja za ovaj skup podataka, radijus i intenzitet centra
pojačanje = 2 ^ round(log2(2048 / procjena)), eksponent ograničen na -20..20
```

2048 ostavlja oko 32× rezerve iznad vrha rampe prije 65.504. Pojačanje je **stepen dvojke**, pa mala promjena procjene ne mijenja ni njega ni akumulisani bafer; i dio je [potpisa geometrije](accumulation.md#what-restarts-it), pa promjena ponovo pokreće akumulaciju.

Vezano je za analitičku procjenu, a namjerno **ne** za tačku zasićenja. Zasićenje se primjenjuje u kompozitu upravo zato da prevlačenje njime nikad ne ponovo pokrene konvergenciju; da se pojačanje pomjera zajedno s njim, bafer bi i dalje držao vrijednosti upisane po starom pojačanju, dok bi kompozit dijelio novim, pa bi se dvije greške tačno poništile, i klizač bi izgledao kao da ništa ne radi.

Na 32-bitnom cilju pojačanje je uvijek 1.

### Preciznost: djelimični okviri od nule {#precision-partial-frames-from-zero}

Sličica spojena u akumulator sa težinom 1/n prvo se rasipa u **radni cilj** od nule, pa se tek onda miješa, umjesto da se rasipa direktno u akumulator sa težinom 1/n ([Akumulacija](accumulation.md#why-each)). Direktno, doprinos svakog sprajta bio bi 1/n veličine tekućeg zbira kojem se dodaje, a half float to zaokruži. Što je piksel gušći, to gore. Od nule, svaki pribrojak je uporediv sa zbirom kojem se pridružuje, što je ista aritmetika koju već radi jedna sličica.

### Izmjereni učinak {#measured-effect}

Na gustoj sintetičkoj sceni, čitano polje u usklađenim jedinicama:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bitno (referenca) | 6051 | 60742 | 121199 | 232744 |
| 16-bitno prije | 1372 | 6972 | 7840 | 7840 |
| 16-bitno poslije | 5996 | 59666 | 118824 | 210357 |

Vrh je prešao sa 30× prenisko na 0,90×, a kompozitna sličica se poklapa sa 32-bitnom do 0,1% srednje svjetline.

### Testiranje {#testing-it}

`?heat=f16` nameće ovaj put na bilo kojem backendu. Bez prekidača, aritmetika koju rade samo slabije GPU-e bi se testirala samo kod ljudi koji ih koriste. `npm run smoke:f16` pokreće cijeli browser test sa njim.

Očitavanja poništavaju pojačanje: automatska ekspozicija dijeli pročitano polje njime, a `engine.readHeatProbe()` ga prosljeđuje rendereru, što je također kako se čita [živo očitavanje toplote lenjira](measure.md#notes).
