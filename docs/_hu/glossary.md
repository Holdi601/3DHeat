---
title: "Szójegyzék"
nav_order: 21
lang: "hu"
source: "glossary.md"
source_hash: "235c4c0eec6b"
translated: true
outdated: false
---

# Szójegyzék

Az oldal szavainak rövid jelentése, egyszerű nyelven. Minden bejegyzés arra az oldalra mutat, amely teljes egészében elmagyarázza.

## Adatok {#data}

**Sor.** Az adatainak egy sora: egy dolog, amely egy helyen és egy időpontban történt, például „7-es játékos itt volt a 12. másodpercben”. A megjelenítő minden sort kirajzol. [Adatformátumok](data-formats.md)

**Oszlop.** A sorok egyfajta értéke, például x, y, z, idő vagy csapat. A megjelenítő kitalálja, melyik oszlop melyik, és Ön módosíthatja a tippet. [Oszlopleképezés](column-mapping.md)

**CSV.** Egyszerű szöveges táblázat: soronként egy sor, az értékek vesszővel elválasztva. Szinte minden program tud ilyet írni. [Fájlok betöltése](loading-files.md)

**Parquet.** Tömör táblafájl, amely gyorsan olvasható, akár milliós sorszámnál is. Ez a legjobb formátum a megjelenítőnek adni. [Fájlok betöltése](loading-files.md)

**Esemény.** Valami, ami történt, például egy lövés, egy találat, egy ölés vagy egy felszállás. Egy sor lehet esemény, vagy csak az, hogy „itt voltam”. [Szűrők](filters.md)

**Személy.** Az, aki a sorokat létrehozta: egy játékos, egy pilóta, egy autó vagy egy tank. Egy személy egy pozíciósor az időben. [Munkamenetek, személyek és csoportok](sessions-persons-groups.md)

**Csoport (csapat).** Azonos színnel megjelenített személyek halmaza, például Kék és Piros. [Munkamenetek, személyek és csoportok](sessions-persons-groups.md)

**Munkamenet (meccs, kör).** A játék egy futása. Egy meccs vagy egy kör munkamenet. A megjelenítő megmutathat egy munkamenetet, vagy sokat egymásra rakhat. [Munkamenetek, személyek és csoportok](sessions-persons-groups.md)

**Pálya.** A 3D-s térkép, amelyen az adatok történtek: talaj, épületek, falak. A sorok ott jelennek meg, ahol a pályán történtek. [Pályák és háttérgeometria](levels.md)

## Az adatok nézése {#looking-at-the-data}

**Hőtérkép.** Olyan kép, ahol azok a helyek izzanak erősebben, amelyeket sok sor érint. A hideg helyek csendesek, a forrók forgalmasak. [Hő](heat.md)

**Hő.** Mennyi minden történt egy helyen. A megjelenítő minden sor izzását összeadja minden helyen; az összeg a hő. [Hő](heat.md)

**Sprite.** A kis izzó folt, amelyet a megjelenítő egy sorhoz rajzol. Sok átfedő sprite összeadódik hővé. [Sprite-alak](sprite-shape.md)

**Expozíció.** Mennyire világos a kép. Mint egy fényképezőgépnél: a túl nagy expozíció mindent fehérré tesz, a túl kicsi elrejti a részleteket. [Szín és expozíció](colour-and-exposure.md)

**Telítés.** Az a hőmennyiség, amely „olyan forró, amilyenre a színek elérnek”. Csökkentse, hogy a csendes helyek is látszódjanak; emelje, hogy csak a legforróbbat lássa. [Szín és expozíció](colour-and-exposure.md)

**Térfogat.** Egy doboz vagy alakzat, amelyet a 3D-s nézetbe helyez. A megjelenítő megszámolja, mi van benne, és a térfogatokat egymással összehasonlíthatja. [Térfogatok és összehasonlítás](volumes.md)

**Szűrő.** Szabály, amely elrejti azokat a sorokat, amelyekre nincs szüksége, például „csak ölések” vagy „csak a Piros csapat”. [Szűrők](filters.md)

## Visszajátszás {#replay}

**Figura.** Egy tank, repülőgép, autó vagy katona kis modellje, amely ott mozog, ahol az adatok szerint volt. [Figurák](figures.md)

**LOD (részletességi szint).** Minden figurának van egy részletes, egy egyszerűbb és egy nagyon egyszerű változata. A közeli figurák a részletes, a távoliak az egyszerű változatot használják, így egyszerre több ezer is kirajzolható. [Figurák](figures.md)

## Versenyzés {#racing}

**Kör.** Egy út a pályán, a startvonaltól vissza a startvonalig. [Körök betöltése](race-loading-laps.md)

**Referenciakör.** Az a kör, amelyhez az összes többit hasonlítjuk. A különbségek „gyorsabb” vagy „lassabb” jelzéssel mutatják, mint ahhoz képest. [Körök betöltése](race-loading-laps.md)

**Csúcspont.** Egy kanyarban az a pont, ahol az autó a legközelebb van a belső szélhez. [Kanyaronkénti elemzés](race-corner-analysis.md)

**Csúszás.** Mennyire csúszik a gumi. Egy kis csúszás adja a legtöbb tapadást; túl sok esetén az autó megcsúszik. [Versenyelemzés: a módszer](race-analytics.md)

**Burkoló.** Amit egy autó minden sebességnél tud: milyen erősen tud kanyarodni, fékezni és gyorsítani, mielőtt megcsúszik. [Versenyelemzés: a módszer](race-analytics.md)

## Repülőgép-számok {#aircraft-numbers}

**ALT.** Magasság: a föld vagy a tengerszint feletti magasság. [Meccs-visszajátszás](match-replay.md#labels-and-statistics)

**TAS.** Valódi légsebesség: milyen gyorsan mozog a repülőgép a levegőben. [Meccs-visszajátszás](match-replay.md#labels-and-statistics)

## Számítógép {#computer}

**GPU.** A grafikus kártya vagy chip. Ez rajzolja a képet, és sokkal gyorsabb, mint a főprocesszor, amikor millió foltot kell kirajzolni. [Két háttérrendszer](backends.md)

**WebGPU / WebGL2.** A két mód, ahogyan a böngésző lehetővé teszi, hogy egy oldal használja a GPU-t. A WebGPU az újabb. A megjelenítő bármelyiket használhatja, és a böngészőben elérhető legjobbat választja. [Két háttérrendszer](backends.md)

## Counter-Strike kifejezések {#counter-strike-words}

**Kör.** Egy rövid harc egy meccsen belül. Az egyik oldal nyeri, és az eredmény eggyel nő.

**Eco, erőltetett vásárlás, teljes vásárlás.** Mennyi pénzt költ egy oldal fegyverekre egy kör elején. Egy eco pénzt takarít meg, és szinte semmit sem vesz (játékosonként átlagosan 1500 dollár alatt). Egy erőltetett vásárlás elkölti, amije van (4000 dollár alatt). Egy teljes vásárlás mindent megvesz, amit csak tud. [Meccselemzés](match-analysis.md)

**Csere.** Egy ölés, amely visszafizet egy ölést: ön meghal, és egy csapattársa 5 másodpercen belül megöli a gyilkosát. [Meccselemzés](match-analysis.md)

**KAST.** Azon körök aránya, amelyekben egy játékos ölt, asszisztál, életben marad, vagy cserélt. Magasabb szám azt jelenti, hogy a játékos több körben segített. [Meccselemzés](match-analysis.md)

**ADR.** Átlagos sebzés körönként: mennyi életerőt vett el egy játékos az ellenségtől minden körben. [Meccselemzés](match-analysis.md)
