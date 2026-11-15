---
title: "Félpontos halmozás"
parent: "Renderelés belső működése"
nav_order: 4
lang: "hu"
source: "half-float-accumulation.md"
source_hash: "9217287b1c9e"
translated: true
outdated: false
---

# Félpontos akkumuláció

Egyes grafikus kártyák a hőt csak kis, 16 bites számokban tudják tartani, ami levághatná vagy kerekítheti a legforróbb helyeket. A nézegető a számokat úgy skálázza, hogy ez ne látszódjon. Neked nincs teendőd; ez az oldal fejlesztőknek készült.

## Fejlesztőknek {#for-developers}

Egy eszköz, amely nem tud 32 bites lebegőpontos textúrákba keverni (WebGPU-n nincs `float32-blendable` és `float32-filterable`, WebGL2-n nincs `EXT_float_blend`), **16 bites lebegőpontos** (`r16float`) hőcélt kap: legfeljebb 65 504-es értékkel és 11 bites mantisszával. Egy sűrű mező több százezresre is felmegy, ezért a 16 bites cél egyszerre **vág** és **kerekít**, a kerekítési hiba pedig nő az értékkel - ez nagyon sajátosan jelentkezik: a legsűrűbb területek sokkal hűvösebbnek látszanak, mint valójában, a ritkák pedig rendben vannak. Két mechanizmus kezeli; a kép csak akkor helyes, ha mindkettő működik.

### Tartomány: erősítés minden szórásnál {#range-a-gain-on-every-splat}

Minden szórt értéket egy **erősítéssel** szorzunk, a kompozit pedig ezt visszaosztja, így a mező olyan nagyságrendben van, amelyet a félpontos számok jól kezelnek ([`heatGain`](https://github.com/Holdi601/3DHeat/blob/main/src/render/engine.ts)):

```
becslés = analitikus telítési becslés erre az adathalmazra, sugárra és középponti intenzitásra
erősítés = 2 ^ round(log2(2048 / becslés)), a kitevő -20..20 közé szorítva
```

A 2048 nagyjából 32-szeres tartalékot hagy a rámpa teteje fölött a 65 504-ig. Az erősítés **kettő hatványa**, így a becslés kis elsodródása nem változtatja meg sem őt, sem a felhalmozott puffert; és része a [geometriai aláírásnak](accumulation.md#what-restarts-it), így a változás újraindítja az akkumulációt.

Az analitikus becslésre van rögzítve, és szándékosan **nem** a telítési pontra. A telítés a kompozitban kerül alkalmazásra, pontosan azért, hogy a csúszka húzása sosem indítsa újra a konvergenciát; ha az erősítés vele együtt mozogna, a puffer még mindig a régi erősítésen írt értékeket tartalmazna, miközben a kompozit az újjal osztana, a két hiba pontosan kioltaná egymást, és a csúszka úgy tűnne, mintha nem tenne semmit.

32 bites célnál az erősítés mindig 1.

### Pontosság: részleges képkockák nullától {#precision-partial-frames-from-zero}

Az akkumulátorba 1/n súllyal beolvasztott képkockát először egy **átmeneti célba** szórjuk nullától, és csak utána keverjük be, ahelyett hogy közvetlenül az akkumulátorba szórnánk 1/n súllyal ([Akkumuláció](accumulation.md#why-each)). Közvetlenül minden sprite hozzájárulása az általa hozzáadott futó összeg 1/n-ed része lenne, a félpontos szám pedig ezeket eldobja - annál rosszabb, minél sűrűbb a képpont. Nullától minden tag összemérhető azzal az összeggel, amelyhez csatlakozik, ez ugyanaz az aritmetika, amit egyetlen képkocka már most is végez.

### Mért hatás {#measured-effect}

Egy sűrű, mesterséges jelenetben, a mezőt egyező egységekben olvasva:

| | p50 | p90 | p99 | max |
|---|---|---|---|---|
| 32 bites (referencia) | 6051 | 60742 | 121199 | 232744 |
| 16 bites, előtte | 1372 | 6972 | 7840 | 7840 |
| 16 bites, utána | 5996 | 59666 | 118824 | 210357 |

A csúcs a 30-szor túl alacsonyról 0,90-szeresre javult, a kompozit képkocka pedig a 32 bites változattal a közepes fényesség 0,1%-án belül egyezik.

### Tesztelése {#testing-it}

A `?heat=f16` bármelyik háttérrendszeren kényszeríti ezt az utat - kapcsoló nélkül a csak gyengébb GPU-kon futó aritmetikát csak azok tesztelnék, akik éppen futtatják. Az `npm run smoke:f16` a teljes böngészős tesztcsomagot ezzel futtatja.

Az olvasások visszavonják az erősítést: az automatikus expozíció a beolvasott mezőt elosztja vele, az `engine.readHeatProbe()` pedig átadja a renderelőnek - így olvassuk a [vonalzó élő hőkijelzőjét](measure.md#notes) is.
