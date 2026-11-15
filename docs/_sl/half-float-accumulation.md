---
title: "Kopičenje s polovično natančnostjo"
parent: "Notranjosti upodabljanja"
nav_order: 4
lang: "sl"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Seštevanje v polovični plavajoči vejici

Nekatere grafične kartice lahko toploto hranijo samo v majhnih 16-bitnih številih, ki bi lahko odrezala ali zaokrožila najbolj vroča mesta. Pregledovalnik števila skalira, da to ni vidno. Ničesar vam ni treba narediti; ta stran je za razvijalce.

## Za razvijalce {#for-developers}

Naprava, ki ne more mešati v 32-bitne teksture s plavajočo vejico (na WebGPU ni `float32-blendable` in `float32-filterable`, na WebGL2 ni `EXT_float_blend`), dobi cilj toplote s **16-bitno plavajočo vejico** (`r16float`): največ 65.504 in 11 bitov mantise. Gosto polje doseže več sto tisoč, zato 16-bitni cilj **odreže** in **zaokroži**, napaka zaokrožitve pa raste z vrednostjo – kar se pokaže zelo posebej: najgostejša območja so videti veliko hladnejša, kot so, redka pa so videti v redu. Dva mehanizma to obravnavata; slika je pravilna samo, če delujeta oba.

### Obseg: ojačenje pri vsakem odtisu {#range-a-gain-on-every-splat}

Vsak odtis se pomnoži z **ojačenjem**, sestavljeni prikaz pa ga spet deli, zato polje leži v velikostnem območju, ki ga polovične plavajoče vejice dobro obvladajo ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
ocena    = analitična ocena nasičenja za to podatkovno množico, polmer in jakost v središču
ojačenje = 2 ^ round(log2(2048 / ocena)),  eksponent omejen na -20..20
```

2048 pusti približno 32-kratno rezervo nad vrhom lestvice do 65.504. Ojačenje je **potenca števila 2**, zato majhen premik ocene ne spremeni niti njega niti nabranega medpomnilnika; je del [podpisa geometrije](accumulation.md#what-restarts-it), zato sprememba ponovno zažene seštevanje.

Veže se na analitično oceno in namenoma **ne** na točko nasičenja. Nasičenje se uporabi pri sestavljanju prav zato, da vlečenje drsnika nikoli ne zažene ponovno zbliževanja; če bi se ojačenje premaknilo z njim, bi medpomnilnik še vedno hranil vrednosti, zapisane pri starem ojačenju, sestavljeni prikaz pa bi delil z novim; obe napaki bi se natanko odpravili in drsnik bi se zdel, kot da nič ne naredi.

Pri 32-bitnem cilju je ojačenje vedno 1.

### Natančnost: delne sličice od nič {#precision-partial-frames-from-zero}

Sličica, združena v seštevalnik z utežjo 1/n, se najprej razprši v **pomožni cilj** od nič in šele nato zmeša, namesto da bi se razprla neposredno v seštevalnik z utežjo 1/n ([Seštevanje](accumulation.md#why-each)). Neposredno bi bil prispevek vsakega sprajta 1/n velikosti tekočega seštevka, ki se mu prišteje, polovična plavajoča vejica pa bi te vrednosti zaokrožila stran – huje, čim gostejša je slikovna pika. Od nič je vsak pribitek primerljiv s seštevkom, kateremu se pridruži, kar je ista aritmetika, ki jo že opravi ena sama sličica.

### Izmerjen učinek {#measured-effect}

Na gostem sintetičnem prizoru, pri branju polja v primerljivih enotah:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32-bitno (referenca) | 6051 | 60742 | 121199 | 232744 |
| 16-bitno pred | 1372 | 6972 | 7840 | 7840 |
| 16-bitno po | 5996 | 59666 | 118824 | 210357 |

Vrh je šel z 30-krat prenizkega na 0,90-kratnik, sestavljena sličica pa se ujema s 32-bitno do 0,1 % srednje svetlosti.

### Preizkus {#testing-it}

`?heat=f16` vsili to pot na katerem koli zaledju – brez stikala bi aritmetiko, ki jo izvajajo samo šibkejše grafične kartice, preizkušali samo ljudje, ki jo izvajajo. `npm run smoke:f16` požene celoten brskalniški preizkus z njo.

Branja odpravijo ojačenje: samodejna osvetlitev deli prebrano polje z njim, `engine.readHeatProbe()` pa ga poda upodabljalniku – tako se prebere tudi [živa vrednost toplote na ravnilu](measure.md#notes).
